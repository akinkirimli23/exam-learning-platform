import {randomUUID} from 'node:crypto';
import {z,ZodError} from 'zod';
import {registerSchema,loginSchema,changePasswordSchema,settingsSchema} from '@/shared/contracts';
import {state,transaction,config,databaseMatchesSupabaseProject} from './db';
import {AppError,auth,fail,passwordHash,verifyPassword,session,userDTO,hash,limit} from './core';
import {published,saveContent,transition} from './content';
import {startAttempt,ownedAttempt,attemptDTO,answer,complete,reviewFeedback,overview} from './learning';
import {limitedBody,upload,mediaResponse} from './media';
import {getSignedLearningMediaUrl} from './learning-media';
import {aiAvailable,help} from './ai';
import {assertTrustedRequest,secureSessionCookie} from './request-security';
import {safeErrorCode} from './safe-error';
import {captureStaticMistake,listMistakes,updateMistake} from './mistakes';
const json=(data:unknown,status=200,headers:Record<string,string>={})=>Response.json(data,{status,headers:{'Cache-Control':'no-store',...headers}});
const cookie=(token:string,request:Request,clear=false)=>`ivme_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${clear?0:14*86400}${secureSessionCookie(request)?'; Secure':''}`;
async function body(request:Request){try{return JSON.parse(new TextDecoder().decode(await limitedBody(request)));}catch(e){if(e instanceof AppError)throw e;fail(400,'İstek verisi okunamadı.');}}
export async function handle(request:Request){try{
  const url=new URL(request.url);const route=url.pathname.replace(/^\/api\/?/,'').split('/').filter(Boolean);const method=request.method;
  assertTrustedRequest(request);
  const {db}=await state();
  if(route[0]==='status'&&method==='GET')return json({name:'İvme',aiAvailable:aiAvailable(),mediaMaxMB:32,databaseReady:true,databaseProjectMatchesSupabase:databaseMatchesSupabaseProject()});
  if(route[0]==='auth'&&['register','login'].includes(route[1])&&method==='POST'){
    const raw=await body(request);const v=route[1]==='register'?registerSchema.parse(raw):loginSchema.parse(raw);
    // Rate increments persist even when authentication is rejected.
    await limit(db,`auth:${hash(v.email)}`,15,900);
    return await transaction(async tx=>{let u;if(route[1]==='register'){const reg=registerSchema.parse(raw);const id=randomUUID();u=(await tx.query('INSERT INTO users(id,email,name,password_hash,adult_confirmed) VALUES($1,$2,$3,$4,true) ON CONFLICT(email) DO NOTHING RETURNING *',[id,reg.email,reg.name,await passwordHash(reg.password)])).rows[0];if(!u)fail(409,'Bu e-posta için hesap zaten var. Giriş yapabilirsiniz.');}else{u=(await tx.query('SELECT * FROM users WHERE email=$1',[v.email])).rows[0];const dummy='00000000000000000000000000000000:'+ '0'.repeat(128);const ok=await verifyPassword(v.password,u?.password_hash||dummy);if(!u||!ok)fail(401,'E-posta veya şifre yanlış.');}const token=await session(tx,u.id);return json({user:userDTO(u),...('mobile' in v&&v.mobile?{token}:{})},200,{'Set-Cookie':cookie(token,request)});});
  }
  const u=await auth(db,request,route[0]==='admin');
  if(route[0]==='auth'&&route[1]==='me'&&method==='GET')return json({user:userDTO(u)});
  if(route[0]==='auth'&&route[1]==='logout'&&method==='POST'){const token=request.headers.get('authorization')?.slice(7)||request.headers.get('cookie')?.match(/ivme_session=([^;]+)/)?.[1];if(token)await db.query('DELETE FROM sessions WHERE token_hash=$1',[hash(token)]);return json({ok:true},200,{'Set-Cookie':cookie('',request,true)});}
  if(route[0]==='auth'&&route[1]==='password'&&method==='POST'){const v=changePasswordSchema.parse(await body(request));await limit(db,`password:${u.id}`,10);if(!await verifyPassword(v.current,u.password_hash))fail(400,'Mevcut şifre yanlış.');await transaction(async tx=>{await tx.query('UPDATE users SET password_hash=$2 WHERE id=$1',[u.id,await passwordHash(v.next)]);await tx.query('DELETE FROM sessions WHERE user_id=$1',[u.id]);});return json({ok:true},200,{'Set-Cookie':cookie('',request,true)});}
  if(route[0]==='account'&&method==='DELETE'){const v=z.object({password:z.string().max(128),confirm:z.literal('HESABIMI SİL')}).parse(await body(request));await limit(db,`password:${u.id}`,10);if(!await verifyPassword(v.password,u.password_hash))fail(400,'Şifre yanlış.');if(u.role==='admin')fail(409,'Yönetici hesabı komut satırından yönetilir.');await db.query('DELETE FROM users WHERE id=$1',[u.id]);return json({ok:true},200,{'Set-Cookie':cookie('',request,true)});}
  if(route[0]==='settings'&&method==='PUT'){const v=settingsSchema.parse(await body(request));return await transaction(async tx=>{if(!(await published(tx)).some(c=>c.kind==='exam'&&c.logical_id===v.examId))fail(400,'Yayımlanmış bir sınav seçin.');if(v.timezone!==u.timezone&&(await tx.query('SELECT day FROM daily_activity WHERE user_id=$1 LIMIT 1',[u.id])).rows.length)fail(409,'Seri başladıktan sonra pilotun gün sınırı sabit kalır.');const out=await tx.query('UPDATE users SET name=$2,daily_goal=$3,weekly_goal=$4,notifications=$5,exam_id=$6,timezone=$7 WHERE id=$1 RETURNING *',[u.id,v.name,v.dailyGoal,v.weeklyGoal,v.notifications,v.examId,v.timezone]);return json({user:userDTO(out.rows[0])});});}
  if(route[0]==='mistakes'&&route.length===1&&method==='GET')return json(await listMistakes(db,u.id));
  if(route[0]==='mistakes'&&route[1]==='capture'&&method==='POST')return json(await captureStaticMistake(db,u,await body(request)),201);
  if(route[0]==='mistakes'&&route.length===2&&method==='PUT')return json(await updateMistake(db,u.id,route[1],await body(request)));
  if(route[0]==='catalog'&&method==='GET'){const all=await published(db);return json({content:all.filter(c=>c.kind!=='question'),config:await config(db)});}
  if(route[0]==='overview'&&method==='GET')return json(await overview(db,u));
  if(route[0]==='learning-media'&&route.length===2&&method==='GET'){
    // Add topic entitlement checks here when per-student authorization is introduced.
    return json(await getSignedLearningMediaUrl(route[1]));
  }
  if(route[0]==='lessons'&&route[2]==='complete'&&method==='POST'){const c=(await published(db)).find(c=>c.id===route[1]&&c.kind==='lesson');if(!c)fail(404,'Konu bölümü bulunamadı.');await db.query('INSERT INTO lesson_completions(user_id,content_id) VALUES($1,$2) ON CONFLICT DO NOTHING',[u.id,c!.id]);return json({ok:true});}
  if(route[0]==='attempts'){
    if(route.length===1&&method==='POST'){const input=await body(request);return json(await transaction(tx=>startAttempt(tx,u,input)));}
    if(route.length===2&&method==='GET')return json(attemptDTO(await ownedAttempt(db,u.id,route[1])));
    if(route[2]==='answer'&&method==='PUT'){const v=z.object({questionId:z.string(),value:z.number().int().nullable()}).parse(await body(request));return json(await transaction(tx=>answer(tx,u,route[1],v.questionId,v.value)));}
    if(route[2]==='complete'&&method==='POST')return json(await transaction(tx=>complete(tx,u,route[1])));
    if(route[2]==='review'&&method==='POST'){const v=z.object({questionId:z.string()}).parse(await body(request));return json(await transaction(tx=>reviewFeedback(tx,u,route[1],v.questionId)));}
  }
  if(route[0]==='media'&&route[1]&&method==='GET')return await mediaResponse(db,u,route[1],request.headers.get('range'));
  if(route[0]==='ai'&&method==='POST')return json(await help(u,await body(request)));
  if(route[0]==='admin'){
    if(route[1]==='content'&&method==='GET')return json({content:(await db.query('SELECT * FROM content ORDER BY created_at DESC')).rows});
    if(route[1]==='content'&&method==='POST'){const input=await body(request);return json(await transaction(tx=>saveContent(tx,input)),201);}
    if(route[1]==='content'&&route[3]==='status'&&method==='PUT'){const v=z.object({status:z.enum(['reviewed','published','archived'])}).parse(await body(request));return json(await transaction(tx=>transition(tx,route[2],v.status,u.id)));}
    if(route[1]==='media'&&method==='POST'){await limit(db,`upload:${u.id}`,30,3600);return json(await upload(db,u,request),201);}
    if(route[1]==='config'&&method==='GET')return json(await config(db));
    if(route[1]==='config'&&method==='PUT'){const v=z.object({counts:z.object({diagnostic:z.number().int().min(1).max(100),practice:z.number().int().min(1).max(100),exam:z.number().int().min(1).max(100),control:z.number().int().min(1).max(100),review:z.number().int().min(1).max(1)}),freezeAllowance:z.number().int().min(0).max(3),reviewDelayDays:z.number().int().min(1).max(30)}).parse(await body(request));await db.query("INSERT INTO config(key,value) VALUES('app',$1) ON CONFLICT(key) DO UPDATE SET value=$1",[JSON.stringify(v)]);return json(v);}
  }
  return json({error:'Sayfa veya işlem bulunamadı.'},404);
}catch(error){if(error instanceof AppError)return json({error:error.message},error.status);if(error instanceof ZodError){if(new URL(request.url).pathname.startsWith('/api/auth/'))return json({error:error.issues[0]?.message||'Alanları kontrol edin.'},400);return json({error:'Alanları kontrol edin.',details:error.issues.map(i=>`${i.path.join('.')}: ${i.message}`)},400);}console.error('API request failed:',safeErrorCode(error));return json({error:'İşlem tamamlanamadı. Verileriniz korunuyor; tekrar deneyin.'},500);}}
