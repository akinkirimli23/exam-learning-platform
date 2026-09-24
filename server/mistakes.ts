import { randomUUID } from 'node:crypto';
import { getTopicDefinition } from '@/shared/topic-registry';
import {
  mistakeCaptureSchema,
  mistakeReasonSchema,
  mistakeUpdateSchema,
  type MistakeNotebookItem,
  type MistakeNotebookResponse,
  type MistakeReason,
} from '@/shared/mistakes';
import type { DB } from './db';
import { fail } from './core';

type Snapshot = {
  text: string;
  options: string[];
  correctAnswer: number;
  selectedAnswer: number | null;
  conceptId: string;
  difficulty: string;
};

function suggestedReason(input: {
  selectedAnswer: number | null;
  explicit?: unknown;
  objectiveId?: string;
  conceptId?: string;
}): MistakeReason {
  if (input.selectedAnswer === null) return 'time';
  const explicit = mistakeReasonSchema.safeParse(input.explicit);
  if (explicit.success) return explicit.data;
  if (input.objectiveId === 'units') return 'calculation-error';
  if (input.objectiveId === 'variables') return 'misread-question';
  if (input.conceptId?.includes('volume-change')) return 'misread-question';
  return 'concept-gap';
}

function dto(row: any): MistakeNotebookItem {
  return {
    id: row.id,
    topicId: row.topic_id,
    questionId: row.question_id,
    attemptId: row.attempt_id,
    source: row.source,
    question: row.question_snapshot,
    suggestedReason: row.suggested_reason,
    reason: row.reason,
    customTags: row.custom_tags ?? [],
    note: row.note ?? '',
    wrongCount: Number(row.wrong_count),
    resolved: Boolean(row.resolved),
    createdAt: new Date(row.created_at).toISOString(),
    lastWrongAt: new Date(row.last_wrong_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

async function upsertMistake(
  db: DB,
  userId: string,
  input: {
    topicId: string;
    questionId: string;
    attemptId?: string | null;
    source: 'attempt' | 'question-bank' | 'past-exam';
    snapshot: Snapshot;
    explicitReason?: unknown;
    objectiveId?: string;
    conceptId?: string;
  },
  now = new Date(),
) {
  const suggestion = suggestedReason({
    selectedAnswer: input.snapshot.selectedAnswer,
    explicit: input.explicitReason,
    objectiveId: input.objectiveId,
    conceptId: input.conceptId,
  });
  const id = randomUUID();
  const { rows } = await db.query(
    `INSERT INTO mistake_notes(
      id,user_id,topic_id,question_id,attempt_id,source,question_snapshot,
      suggested_reason,reason,created_at,last_wrong_at,updated_at
    ) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$8,$9,$9,$9)
    ON CONFLICT(user_id,source,question_id) DO UPDATE SET
      topic_id=excluded.topic_id,
      attempt_id=excluded.attempt_id,
      question_snapshot=excluded.question_snapshot,
      suggested_reason=excluded.suggested_reason,
      wrong_count=mistake_notes.wrong_count+1,
      resolved=false,
      last_wrong_at=excluded.last_wrong_at,
      updated_at=excluded.updated_at
    RETURNING *`,
    [
      id,userId,input.topicId,input.questionId,input.attemptId ?? null,input.source,
      JSON.stringify(input.snapshot),suggestion,now,
    ],
  );
  return dto(rows[0]);
}

export async function captureAttemptMistake(
  db: DB,
  userId: string,
  attempt: any,
  question: any,
  selectedAnswer: number | null,
  now = new Date(),
) {
  const snapshot: Snapshot = {
    text: question.payload.text,
    options: question.payload.options,
    correctAnswer: question.payload.correct,
    selectedAnswer,
    conceptId: question.payload.objectiveId,
    difficulty: question.payload.difficulty,
  };
  return upsertMistake(db,userId,{
    topicId:attempt.topic_id,
    questionId:question.logical_id,
    attemptId:attempt.id,
    source:'attempt',
    snapshot,
    explicitReason:question.payload.mistakeReason,
    objectiveId:question.payload.objectiveId,
  },now);
}

export async function captureStaticMistake(db:DB,user:any,input:unknown,now=new Date()){
  const parsed=mistakeCaptureSchema.parse(input);
  const definition=getTopicDefinition(parsed.topicId);
  if(!definition)fail(404,'Konu bulunamadı.');
  const question=parsed.source==='question-bank'
    ? definition.quiz.find(item=>item.id===parsed.questionId)
    : definition.pastExam?.questions.find(item=>item.id===parsed.questionId);
  if(!question)fail(404,'Soru bulunamadı.');
  if(parsed.selectedAnswer===question.correctAnswer)fail(400,'Doğru yanıt yanlış defterine eklenmez.');
  return upsertMistake(db,user.id,{
    topicId:parsed.topicId,
    questionId:question.id,
    source:parsed.source,
    snapshot:{
      text:question.question,
      options:[...question.options],
      correctAnswer:question.correctAnswer,
      selectedAnswer:parsed.selectedAnswer,
      conceptId:question.conceptId,
      difficulty:question.difficulty,
    },
    conceptId:question.conceptId,
  },now);
}

export async function listMistakes(db:DB,userId:string):Promise<MistakeNotebookResponse>{
  const rows=(await db.query('SELECT * FROM mistake_notes WHERE user_id=$1 ORDER BY resolved ASC,last_wrong_at DESC',[userId])).rows;
  const items=rows.map(dto);
  const byReason=new Map<MistakeReason,number>();
  const byTopic=new Map<string,number>();
  let totalEvents=0;
  for(const item of items){
    totalEvents+=item.wrongCount;
    byReason.set(item.reason,(byReason.get(item.reason)??0)+item.wrongCount);
    byTopic.set(item.topicId,(byTopic.get(item.topicId)??0)+item.wrongCount);
  }
  return {
    items,
    summary:{
      totalOpen:items.filter(item=>!item.resolved).length,
      totalEvents,
      byReason:[...byReason].map(([reason,count])=>({reason,count})).sort((a,b)=>b.count-a.count),
      byTopic:[...byTopic].map(([topicId,count])=>({topicId,count})).sort((a,b)=>b.count-a.count),
    },
  };
}

export async function updateMistake(db:DB,userId:string,id:string,input:unknown){
  const value=mistakeUpdateSchema.parse(input);
  const row=(await db.query(
    'UPDATE mistake_notes SET reason=$3,custom_tags=$4,note=$5,resolved=$6,updated_at=now() WHERE id=$1 AND user_id=$2 RETURNING *',
    [id,userId,value.reason,JSON.stringify(value.customTags),value.note,value.resolved],
  )).rows[0];
  if(!row)fail(404,'Yanlış defteri kaydı bulunamadı.');
  return dto(row);
}
