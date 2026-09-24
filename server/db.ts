import { PGlite } from '@electric-sql/pglite';
import { Pool, type PoolConfig } from 'pg';
import path from 'node:path';
import fs from 'node:fs/promises';

export interface DB { query<T=any>(sql:string,params?:any[]):Promise<{rows:T[]}>; }
type State={ db:DB; transaction:<T>(fn:(db:DB)=>Promise<T>)=>Promise<T>; close:()=>Promise<void> };
export const initialSchemaV1=`
CREATE TABLE IF NOT EXISTS schema_migrations(version integer PRIMARY KEY);
CREATE TABLE IF NOT EXISTS users(id text PRIMARY KEY, email text UNIQUE NOT NULL, name text NOT NULL, password_hash text NOT NULL, role text NOT NULL DEFAULT 'student', adult_confirmed boolean NOT NULL, daily_goal integer NOT NULL DEFAULT 5, weekly_goal integer NOT NULL DEFAULT 5, exam_id text, timezone text NOT NULL DEFAULT 'Europe/Istanbul', notifications boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS sessions(token_hash text PRIMARY KEY, user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires_at timestamptz NOT NULL);
CREATE TABLE IF NOT EXISTS content(id text PRIMARY KEY, logical_id text NOT NULL, kind text NOT NULL, parent_id text, title text NOT NULL, revision integer NOT NULL, status text NOT NULL DEFAULT 'draft', demo boolean NOT NULL DEFAULT true, payload jsonb NOT NULL, source jsonb NOT NULL, reviewed_by text, reviewed_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(logical_id,revision));
CREATE UNIQUE INDEX IF NOT EXISTS one_published_revision ON content(logical_id) WHERE status='published';
CREATE INDEX IF NOT EXISTS content_parent ON content(parent_id,kind,status);
CREATE TABLE IF NOT EXISTS config(key text PRIMARY KEY,value jsonb NOT NULL);
CREATE TABLE IF NOT EXISTS attempts(id text PRIMARY KEY,user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,topic_id text NOT NULL,mode text NOT NULL,status text NOT NULL DEFAULT 'active',snapshot jsonb NOT NULL,answers jsonb NOT NULL DEFAULT '{}',reviewed jsonb NOT NULL DEFAULT '[]',result jsonb,penalty numeric NOT NULL,goal integer NOT NULL,is_fresh boolean NOT NULL,delayed boolean NOT NULL DEFAULT false,review_id text,request_key text NOT NULL,created_at timestamptz NOT NULL DEFAULT now(),completed_at timestamptz,UNIQUE(user_id,request_key));
CREATE INDEX IF NOT EXISTS attempts_user ON attempts(user_id,created_at);
CREATE TABLE IF NOT EXISTS review_tasks(id text PRIMARY KEY,user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,topic_id text NOT NULL,question_id text,due_at timestamptz NOT NULL,kind text NOT NULL,status text NOT NULL DEFAULT 'pending',origin_id text NOT NULL,UNIQUE(user_id,origin_id,kind));
CREATE TABLE IF NOT EXISTS lesson_completions(user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,content_id text NOT NULL,completed_at timestamptz NOT NULL DEFAULT now(),PRIMARY KEY(user_id,content_id));
CREATE TABLE IF NOT EXISTS daily_activity(user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,day text NOT NULL,kind text NOT NULL,attempt_id text,points integer NOT NULL DEFAULT 0,created_at timestamptz NOT NULL DEFAULT now(),PRIMARY KEY(user_id,day));
CREATE TABLE IF NOT EXISTS badges(user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,code text NOT NULL,earned_at timestamptz NOT NULL DEFAULT now(),PRIMARY KEY(user_id,code));
CREATE TABLE IF NOT EXISTS media_files(id text PRIMARY KEY,storage_key text NOT NULL,mime text NOT NULL,size integer NOT NULL,created_by text NOT NULL,created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS rate_limits(key text PRIMARY KEY,count integer NOT NULL,expires_at timestamptz NOT NULL);
CREATE TABLE IF NOT EXISTS ai_usage(id text PRIMARY KEY,user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,day text NOT NULL,status text NOT NULL,tokens integer NOT NULL DEFAULT 0,created_at timestamptz NOT NULL DEFAULT now());
INSERT INTO schema_migrations(version) VALUES(1) ON CONFLICT DO NOTHING;
`;
export const mistakeNotesSchema=`
CREATE TABLE IF NOT EXISTS mistake_notes(id text PRIMARY KEY,user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,topic_id text NOT NULL,question_id text NOT NULL,attempt_id text,source text NOT NULL,question_snapshot jsonb NOT NULL,suggested_reason text NOT NULL,reason text NOT NULL,custom_tags jsonb NOT NULL DEFAULT '[]',note text NOT NULL DEFAULT '',wrong_count integer NOT NULL DEFAULT 1,resolved boolean NOT NULL DEFAULT false,created_at timestamptz NOT NULL DEFAULT now(),last_wrong_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now(),UNIQUE(user_id,source,question_id));
CREATE INDEX IF NOT EXISTS mistake_notes_user ON mistake_notes(user_id,resolved,last_wrong_at DESC);
`;
export const initialSchema=`${initialSchemaV1}
${mistakeNotesSchema}
INSERT INTO schema_migrations(version) VALUES(2) ON CONFLICT DO NOTHING;
`;
const globalDb=globalThis as unknown as {ivmeDB?:Promise<State>};
export function postgresConnectionConfig(value:string,caBase64=process.env.DATABASE_CA_CERT_B64):PoolConfig{
  const address=new URL(value);
  if(!['postgres:','postgresql:'].includes(address.protocol))throw new Error('PostgreSQL bağlantı URL’si geçersiz.');
  const local=['localhost','127.0.0.1','[::1]'].includes(address.hostname);
  const sslmode=address.searchParams.get('sslmode');
  if(!local&&sslmode!==null&&!['require','verify-ca','verify-full'].includes(sslmode)){
    throw Object.assign(new Error('Uzak PostgreSQL için güvenli olmayan TLS modu reddedildi.'),{code:'DATABASE_TLS_MODE_UNSAFE'});
  }
  if(!local&&!sslmode&&!caBase64){
    throw Object.assign(new Error('Uzak PostgreSQL için TLS modu veya CA sertifikası eksik.'),{code:'DATABASE_CA_MISSING'});
  }
  if(!caBase64)return {connectionString:value};
  const ca=Buffer.from(caBase64,'base64').toString('utf8');
  if(!ca.includes('-----BEGIN CERTIFICATE-----'))throw Object.assign(new Error('PostgreSQL CA sertifikası geçersiz.'),{code:'DATABASE_CA_INVALID'});
  // node-postgres replaces an explicit ssl object when sslmode remains in the URL.
  for(const key of ['sslmode','sslrootcert','sslcert','sslkey'])address.searchParams.delete(key);
  return {connectionString:address.toString(),ssl:{ca,rejectUnauthorized:true,servername:address.hostname}};
}
export function databaseMatchesSupabaseProject(databaseUrl=process.env.DATABASE_URL,supabaseUrl=process.env.SUPABASE_URL){
  if(!databaseUrl||!supabaseUrl)return null;
  try{
    const database=new URL(databaseUrl),supabase=new URL(supabaseUrl);
    const projectRef=supabase.hostname.split('.')[0];
    const databaseUser=decodeURIComponent(database.username);
    return Boolean(projectRef)&&(databaseUser===`postgres.${projectRef}`||database.hostname===`db.${projectRef}.supabase.co`);
  }catch{return false;}
}
async function init():Promise<State>{
  if(process.env.DATABASE_URL){
    const pool=new Pool({...postgresConnectionConfig(process.env.DATABASE_URL),max:1,connectionTimeoutMillis:10000,idleTimeoutMillis:10000});
    try{
      const {rows}=await pool.query('SELECT version FROM schema_migrations WHERE version=2');
      if(!rows.length)throw Object.assign(new Error('PostgreSQL v2 migration eksik.'),{code:'DATABASE_SCHEMA_MISSING'});
    }catch(error){await pool.end();throw error;}
    return {db:pool,close:()=>pool.end(),transaction:async fn=>{const c=await pool.connect();try{await c.query('BEGIN');const out=await fn(c);await c.query('COMMIT');return out;}catch(e){await c.query('ROLLBACK');throw e;}finally{c.release();}}};
  }
  if(process.env.VERCEL==='1')throw Object.assign(new Error('Vercel PostgreSQL bağlantısı gerekli.'),{code:'DATABASE_URL_MISSING'});
  const dir=process.env.DATA_DIR===':memory:'?undefined:path.resolve(process.env.DATA_DIR||'data','database');
  if(dir)await fs.mkdir(dir,{recursive:true});
  const pg=new PGlite(dir);await pg.exec(initialSchema);
  return {db:pg,close:()=>pg.close(),transaction:fn=>pg.transaction(tx=>fn(tx))};
}
export async function state(){return globalDb.ivmeDB??=init().catch(error=>{delete globalDb.ivmeDB;throw error;});}
export async function query<T=any>(sql:string,params:any[]=[]){return (await state()).db.query<T>(sql,params);}
export async function transaction<T>(fn:(db:DB)=>Promise<T>){return (await state()).transaction(fn);}
export async function closeDb(){if(globalDb.ivmeDB)await(await globalDb.ivmeDB).close();delete globalDb.ivmeDB;}
export async function config(db:DB){const {rows}=await db.query('SELECT value FROM config WHERE key=$1',['app']);return rows[0]?.value??{counts:{diagnostic:5,practice:5,exam:15,control:5,review:1},freezeAllowance:1,reviewDelayDays:2};}
