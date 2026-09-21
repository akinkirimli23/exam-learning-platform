import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { contentSchema,questionSchema, type ContentDTO } from '@/shared/contracts';
import { demoAllowed,fail } from './core';
import type {DB} from './db';

// Every visible child must have a visible ancestor chain. Orphan drafts never leak.
export async function published(db:DB):Promise<ContentDTO[]>{const {rows}=await db.query<ContentDTO>("SELECT * FROM content WHERE status='published' AND ($1 OR demo=false)",[demoAllowed()]);const map=new Map(rows.map(r=>[r.logical_id,r]));const visible=(r:ContentDTO,seen=new Set<string>()):boolean=>{if(seen.has(r.logical_id))return false;seen.add(r.logical_id);return !r.parent_id||!!map.get(r.parent_id)&&visible(map.get(r.parent_id)!,seen);};return rows.filter(r=>visible(r));}
export async function visibleTopic(db:DB,id:string){const all=await published(db);const topic=all.find(c=>c.logical_id===id&&c.kind==='topic');if(!topic)fail(404,'Bu konu yayımlanmamış veya kullanıma kapalı.');return {all,topic:topic!};}
export function validatePayload(kind:string,p:any){
  if(kind==='question')return questionSchema.parse(p);
  if(kind==='lesson')return z.object({body:z.string().min(20).max(30000),order:z.number().int().min(0),minutes:z.number().min(1).max(120)}).parse(p);
  if(kind==='card')return z.object({front:z.string().min(3).max(2000),back:z.string().min(3).max(3000),order:z.number().int().min(0)}).parse(p);
  if(kind==='media')return z.object({fileId:z.string().min(1),type:z.enum(['audio','video','image']),category:z.enum(['learn','recap','mistakes','compare','explanation','diagram']),duration:z.number().min(0).max(36000),order:z.number().int().min(0),transcript:z.string().max(50000),captionsId:z.string().optional()}).parse(p);
  if(kind==='exam')return z.object({year:z.number().int().min(2020).max(2100),penalty:z.number().min(0).max(1),scopeNote:z.string().min(3).max(3000)}).parse(p);
  if(kind==='topic')return z.object({description:z.string().min(3).max(3000),prerequisites:z.string().max(3000),curriculumNote:z.string().max(5000),minutes:z.number().min(1).max(1000)}).parse(p);
  return z.object({description:z.string().max(5000)}).parse(p);
}
export async function saveContent(db:DB,input:unknown){const v=contentSchema.parse(input);const payload=validatePayload(v.kind,v.payload);const logical=v.logicalId||randomUUID();const existing=(await db.query('SELECT * FROM content WHERE logical_id=$1 ORDER BY revision DESC FOR UPDATE',[logical])).rows;
  if(existing.length&&(existing[0].kind!==v.kind||existing[0].parent_id!==v.parentId))fail(400,'Bir içeriğin türü ve üst öğesi değiştirilemez; yeni içerik oluşturun.');
  const parents:Record<string,string>= {subject:'exam',topic:'subject',objective:'topic',lesson:'topic',card:'topic',question:'topic',media:'topic'};
  if(v.kind==='exam'&&v.parentId)fail(400,'Sınavın üst öğesi olamaz.');
  if(v.kind!=='exam'){const parent=(await db.query('SELECT kind FROM content WHERE logical_id=$1 LIMIT 1',[v.parentId])).rows[0];if(!parent||parent.kind!==parents[v.kind])fail(400,'Geçerli bir üst öğe seçin.');}
  if(v.kind==='question'){const obj=(await db.query("SELECT parent_id FROM content WHERE logical_id=$1 AND kind='objective' LIMIT 1",[(payload as any).objectiveId])).rows[0];if(!obj||obj.parent_id!==v.parentId)fail(400,'Sorunun kazanımı aynı konuya ait olmalı.');}
  if(v.kind==='media'){const file=(await db.query('SELECT * FROM media_files WHERE id=$1',[(payload as any).fileId])).rows[0];if(!file||!file.mime.startsWith((payload as any).type+'/'))fail(400,'Yüklenmiş ve türü eşleşen bir medya dosyası seçin.');if((payload as any).captionsId){const cap=(await db.query('SELECT mime FROM media_files WHERE id=$1',[(payload as any).captionsId])).rows[0];if(cap?.mime!=='text/vtt')fail(400,'Geçerli bir WebVTT altyazısı seçin.');}}
  const revision=(existing[0]?.revision??0)+1;const id=randomUUID();await db.query('INSERT INTO content(id,logical_id,kind,parent_id,title,revision,demo,payload,source) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)',[id,logical,v.kind,v.parentId,v.title,revision,v.demo,JSON.stringify(payload),JSON.stringify(v.source)]);return {id,logicalId:logical,revision};
}
export async function transition(db:DB,id:string,status:string,adminId:string){const row=(await db.query('SELECT * FROM content WHERE id=$1 FOR UPDATE',[id])).rows[0];if(!row)fail(404,'İçerik bulunamadı.');
  if(status==='reviewed'){if(row.status!=='draft')fail(409,'Yalnız taslaklar incelendi olarak işaretlenebilir.');validatePayload(row.kind,row.payload);await db.query("UPDATE content SET status='reviewed',reviewed_by=$2,reviewed_at=now() WHERE id=$1",[id,adminId]);}
  else if(status==='published'){if(row.status!=='reviewed')fail(409,'Yayımlamadan önce içeriği inceleyin.');if(!row.source.license?.trim())fail(400,'Kullanım izni/lisans notu gerekiyor.');if(row.parent_id&&!(await published(db)).some(p=>p.logical_id===row.parent_id))fail(400,'Önce üst öğeyi yayımlayın.');if(row.kind==='media'&&row.payload.type!=='image'&&!row.payload.transcript)fail(400,'Ses/video için transkript gerekiyor.');if(row.kind==='media'&&row.payload.type==='video'&&!row.payload.captionsId)fail(400,'Video için WebVTT altyazısı gerekiyor.');await db.query("UPDATE content SET status='archived' WHERE logical_id=$1 AND status='published'",[row.logical_id]);await db.query("UPDATE content SET status='published' WHERE id=$1",[id]);}
  else if(status==='archived')await db.query("UPDATE content SET status='archived' WHERE id=$1",[id]);else fail(400,'Geçersiz durum.');return {ok:true};
}
