import {beforeAll,afterAll,it,expect} from 'vitest';
import {randomUUID} from 'node:crypto';
import {mkdtemp,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {handle} from '../server/api';
import {seedDatabase} from '../server/seed';
import {query,closeDb} from '../server/db';
let folder:string,studentCookie:string,token:string,adminCookie:string;
const base='http://localhost:3000';
async function call(route:string,method='GET',body?:unknown,identity='cookie'){
 const headers:Record<string,string>={'Content-Type':'application/json',Origin:base};
 if(identity==='cookie')headers.Cookie=studentCookie;else if(identity==='mobile')headers.Authorization=`Bearer ${token}`;else if(identity==='admin')headers.Cookie=adminCookie;
 const response=await handle(new Request(`${base}/api/${route}`,{method,headers,body:body===undefined?undefined:JSON.stringify(body)}));return {response,data:await response.json()};
}
beforeAll(async()=>{folder=await mkdtemp(path.join(os.tmpdir(),'ivme-device-test-'));process.env.DATA_DIR=folder;process.env.DEMO_CONTENT='true';process.env.APP_ORIGIN=base;await seedDatabase();const email='devices@test.local',password='Device-Test-Password-01';const r=await call('auth/register','POST',{name:'Cihaz Testi',email,password,adult:true},'none');studentCookie=r.response.headers.get('set-cookie')!.split(';')[0];const m=await call('auth/login','POST',{email,password,mobile:true},'none');token=m.data.token;const ad=await call('auth/register','POST',{name:'Test Yönetici',email:'admin-device@test.local',password,adult:true},'none');adminCookie=ad.response.headers.get('set-cookie')!.split(';')[0];await query("UPDATE users SET role='admin' WHERE id=$1",[ad.data.user.id]);});
afterAll(async()=>{await closeDb();await rm(folder,{recursive:true,force:true});});
it('web cevabı mobilde görünür; mobil tamamlanan test, günlük ödül ve oturum disk yeniden açılınca korunur',async()=>{
 const start=await call('attempts','POST',{topicId:'buoyancy',mode:'practice',idempotencyKey:randomUUID()});const id=start.data.id;
 const raw=(await query('SELECT snapshot FROM attempts WHERE id=$1',[id])).rows[0].snapshot;
 const first=raw[0];await call(`attempts/${id}/answer`,'PUT',{questionId:first.id,value:first.payload.correct});
 const mobile=await call(`attempts/${id}`,'GET',undefined,'mobile');expect(mobile.data.answers[first.id]).toBe(first.payload.correct);
 for(const q of raw.slice(1))await call(`attempts/${id}/answer`,'PUT',{questionId:q.id,value:q.payload.correct},'mobile');
 const completed=await call(`attempts/${id}/complete`,'POST',{},'mobile');expect(completed.data.result.correct).toBe(raw.length);
 const web=await call('overview');expect(web.data.streak).toBe(1);expect(web.data.points).toBe(20);expect(web.data.history[0].id).toBe(id);expect(web.data.history[0].topicId).toBe('buoyancy');
 await closeDb();const reopened=await call('overview','GET',undefined,'mobile');expect(reopened.response.status).toBe(200);expect(reopened.data.history[0].id).toBe(id);expect(reopened.data.points).toBe(20);
 await call(`attempts/${id}/complete`,'POST',{});expect((await call('overview')).data.points).toBe(20);
});
it('gerçek WAV yükleme, taslak gizliliği, yayın ve medya range okuması çalışır',async()=>{
 const buffer=Buffer.alloc(44+16000);buffer.write('RIFF',0);buffer.writeUInt32LE(buffer.length-8,4);buffer.write('WAVEfmt ',8);buffer.writeUInt32LE(16,16);buffer.writeUInt16LE(1,20);buffer.writeUInt16LE(1,22);buffer.writeUInt32LE(8000,24);buffer.writeUInt32LE(16000,28);buffer.writeUInt16LE(2,32);buffer.writeUInt16LE(16,34);buffer.write('data',36);buffer.writeUInt32LE(16000,40);
 const form=new FormData();form.set('file',new Blob([buffer],{type:'audio/wav'}),'test-only-silence.wav');
 const request=()=>new Request(`${base}/api/admin/media`,{method:'POST',headers:{Origin:base,Cookie:adminCookie},body:form});
 const response=await handle(request());expect(response.status).toBe(201);const file=await response.json();expect(file.mime).toBe('audio/wav');
 const hidden=await handle(new Request(`${base}/api/media/${file.id}`,{headers:{Cookie:studentCookie}}));expect(hidden.status).toBe(404);
 const draft=await call('admin/content','POST',{kind:'media',parentId:'buoyancy',title:'Yalnız test sessiz WAV',demo:true,source:{url:'',license:'Testte üretilmiş sessiz dosya; ders materyali değildir.',attribution:''},payload:{fileId:file.id,type:'audio',category:'recap',duration:1,order:0,transcript:'Bu dosya yalnız yükleme ve range testi için sessizdir.'}},'admin');
 await call(`admin/content/${draft.data.id}/status`,'PUT',{status:'reviewed'},'admin');await call(`admin/content/${draft.data.id}/status`,'PUT',{status:'published'},'admin');
 const range=await handle(new Request(`${base}/api/media/${file.id}`,{headers:{Authorization:`Bearer ${token}`,Range:'bytes=0-43'}}));expect(range.status).toBe(206);expect(range.headers.get('Content-Range')).toBe(`bytes 0-43/${buffer.length}`);expect((await range.arrayBuffer()).byteLength).toBe(44);
 await call(`admin/content/${draft.data.id}/status`,'PUT',{status:'archived'},'admin');expect((await handle(new Request(`${base}/api/media/${file.id}`,{headers:{Cookie:studentCookie}}))).status).toBe(404);
});
