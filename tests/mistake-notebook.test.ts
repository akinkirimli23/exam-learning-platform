import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import { handle } from '../server/api';
import { closeDb, query } from '../server/db';
import { seedDatabase } from '../server/seed';
import { getTopicDefinition } from '../shared/topic-registry';

const origin='http://localhost:3000';
let cookieA='',cookieB='';

async function req(path:string,method='GET',body?:unknown,cookie=cookieA){
  const response=await handle(new Request(origin+'/api/'+path,{
    method,
    headers:{'Content-Type':'application/json',Origin:origin,...(cookie?{Cookie:cookie}:{})},
    body:body===undefined?undefined:JSON.stringify(body),
  }));
  return {status:response.status,data:await response.json(),cookie:response.headers.get('set-cookie')?.split(';')[0]||''};
}

beforeAll(async()=>{
  process.env.DATA_DIR=':memory:';
  process.env.DEMO_CONTENT='true';
  process.env.APP_ORIGIN=origin;
  await seedDatabase();
  const a=await req('auth/register','POST',{name:'Yanlış A',email:`mistake-a-${randomUUID()}@test.local`,password:'Testing-long-pass-71',adult:true},'');
  cookieA=a.cookie;
  const b=await req('auth/register','POST',{name:'Yanlış B',email:`mistake-b-${randomUUID()}@test.local`,password:'Testing-long-pass-72',adult:true},'');
  cookieB=b.cookie;
});

afterAll(closeDb);

describe('Akıllı yanlış defteri',()=>{
  it('tamamlanan testte yanlış ve boşları otomatik kaydeder',async()=>{
    const start=await req('attempts','POST',{topicId:'buoyancy',mode:'practice',idempotencyKey:randomUUID()});
    expect(start.status).toBe(200);
    const done=await req(`attempts/${start.data.id}/complete`,'POST',{});
    expect(done.status).toBe(200);
    const notebook=await req('mistakes');
    expect(notebook.status).toBe(200);
    expect(notebook.data.items).toHaveLength(start.data.questions.length);
    expect(notebook.data.items.every((item:any)=>item.reason==='time')).toBe(true);
    expect(notebook.data.summary.totalOpen).toBe(start.data.questions.length);
  });

  it('soru bankası yanlışını otomatik önerilen etiketle yakalar ve tekrarı sayar',async()=>{
    const definition=getTopicDefinition('buoyancy')!;
    const question=definition.quiz[0];
    const wrong=(question.correctAnswer+1)%question.options.length;
    const first=await req('mistakes/capture','POST',{topicId:'buoyancy',questionId:question.id,source:'question-bank',selectedAnswer:wrong});
    expect(first.status).toBe(201);
    const second=await req('mistakes/capture','POST',{topicId:'buoyancy',questionId:question.id,source:'question-bank',selectedAnswer:wrong});
    expect(second.status).toBe(201);
    expect(second.data.wrongCount).toBe(2);
    expect(['concept-gap','calculation-error','misread-question','attention','time']).toContain(second.data.suggestedReason);
  });

  it('öğrenci etiketi değiştirir, özel etiket ve not ekler',async()=>{
    const notebook=await req('mistakes');
    const item=notebook.data.items.find((entry:any)=>entry.source==='question-bank');
    const updated=await req('mistakes/'+item.id,'PUT',{
      reason:'attention',
      customTags:['grafik','acele','grafik'],
      note:'Sorudaki sıvı türünü atladım.',
      resolved:false,
    });
    expect(updated.status).toBe(200);
    expect(updated.data.reason).toBe('attention');
    expect(updated.data.customTags).toEqual(['grafik','acele']);
    expect(updated.data.note).toContain('sıvı');
  });

  it('yanlış defteri kullanıcılar arasında izole kalır',async()=>{
    const mine=await req('mistakes','GET',undefined,cookieA);
    const other=await req('mistakes','GET',undefined,cookieB);
    expect(mine.data.items.length).toBeGreaterThan(0);
    expect(other.data.items).toHaveLength(0);
    expect(JSON.stringify(other.data)).not.toContain('Sorudaki sıvı türünü atladım.');
  });

  it('öğrenci kaydı çözüldü olarak işaretleyebilir',async()=>{
    const notebook=await req('mistakes');
    const item=notebook.data.items[0];
    const updated=await req('mistakes/'+item.id,'PUT',{
      reason:item.reason,
      customTags:item.customTags,
      note:item.note,
      resolved:true,
    });
    expect(updated.data.resolved).toBe(true);
    const after=await req('mistakes');
    expect(after.data.summary.totalOpen).toBe(notebook.data.summary.totalOpen-1);
  });

  it('v2 şema işaretini ve yanlış tablosunu oluşturur',async()=>{
    expect((await query('SELECT version FROM schema_migrations WHERE version=2')).rows).toHaveLength(1);
    const tables=await query("SELECT table_name FROM information_schema.tables WHERE table_name='mistake_notes'");
    expect(tables.rows).toHaveLength(1);
  });
});
