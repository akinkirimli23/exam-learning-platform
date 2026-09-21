import {randomUUID} from 'node:crypto';
import fs from 'node:fs/promises';
const base='http://localhost:3000/api/';
async function run(){const email=`qa-${randomUUID()}@ivme.local`,password=randomUUID()+'Qa!';let cookie='';async function call(path:string,method='GET',body?:unknown){const r=await fetch(base+path,{method,headers:{'Content-Type':'application/json',Origin:'http://localhost:3000',Cookie:cookie},body:body===undefined?undefined:JSON.stringify(body)});const data=await r.json();if(!r.ok)throw new Error(`${path}: ${r.status} ${data.error}`);if(r.headers.get('set-cookie'))cookie=r.headers.get('set-cookie')!.split(';')[0];return data;}
const account=await call('auth/register','POST',{name:'Pilot Öğrenci',email,password,adult:true});await call('settings','PUT',{...account.user,examId:'yks-2026',dailyGoal:5,weeklyGoal:5});const c=await call('catalog');if(c.content.filter((x:any)=>x.kind==='lesson').length!==4)throw new Error('Seed unavailable');await fs.writeFile('data/qa-access.json',JSON.stringify({email,password,userId:account.user.id}));console.log('HTTP registration, session cookie, settings and persistent catalog verified. QA login saved in data/qa-access.json.');}
run();
