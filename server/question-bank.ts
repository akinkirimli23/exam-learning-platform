import 'server-only';
import { randomUUID } from 'node:crypto';
import { bankAnswerSchema, bankStartSchema, type BankAttempt, type BankCatalog, type BankResult } from '@/shared/question-bank';
import { buoyancyQuestionBank, type PrivateBankTest } from './buoyancy-bank-adapter';
import type { DB } from './db';
import { fail } from './core';
import { visibleTopic } from './content';
import { captureBankMistake } from './mistakes';

const mode = 'question-bank';
export const bankEnabled = () => process.env.BUOYANCY_BANK_135_ENABLED === 'true' || process.env.NODE_ENV === 'development';

function testDefinition(topicId: string, testId: string) {
  return buoyancyQuestionBank.find(test => test.topicId === topicId && test.id === testId)
    ?? fail(404, 'Soru bankası testi bulunamadı.');
}

export function bankAttemptDTO(row: any): BankAttempt {
  const snapshot = row.snapshot as PrivateBankTest;
  const completed = row.status === 'completed';
  return {
    id: row.id, testId: snapshot.id, topicId: row.topic_id, revision: snapshot.revision,
    title: snapshot.title, difficulty: snapshot.difficulty, durationMinutes: snapshot.durationMinutes,
    status: row.status, createdAt: new Date(row.created_at).toISOString(),
    questions: snapshot.questions.map(question => ({
      id: question.id, number: question.number, text: question.text, options: [...question.options],
      conceptId: question.conceptId, conceptIds: [...question.conceptIds], difficulty: question.difficulty,
      ...(question.figure && { figure: question.figure }),
    })),
    answers: row.answers, result: completed ? row.result : null,
    feedback: completed ? snapshot.questions.map(question => ({
      questionId: question.id, correctAnswer: question.correctAnswer,
      selectedAnswer: row.answers[question.id] ?? null,
      isCorrect: row.answers[question.id] === question.correctAnswer,
      explanation: question.explanation, conceptId: question.conceptId,
    })) : [],
  };
}

async function ownedBank(db: DB, userId: string, id: string, lock = false) {
  const row = (await db.query(`SELECT * FROM attempts WHERE id=$1 AND user_id=$2 AND mode=$3${lock ? ' FOR UPDATE' : ''}`,
    [id, userId, mode])).rows[0];
  return row ?? fail(404, 'Soru bankası oturumu bulunamadı.');
}

export async function bankCatalog(db: DB, userId: string, topicId: string): Promise<BankCatalog> {
  await visibleTopic(db, topicId);
  const tests = buoyancyQuestionBank.filter(test => test.topicId === topicId);
  if (!tests.length) fail(404, 'Bu konu için yeni soru bankası bulunamadı.');
  const history = (await db.query(
    `SELECT id,snapshot->>'id' AS test_id,status,answers,result FROM attempts
     WHERE user_id=$1 AND topic_id=$2 AND mode=$3 ORDER BY created_at DESC`, [userId, topicId, mode])).rows;
  return { topicId, revision: tests[0].revision, tests: tests.map(({ questions, revision, topicId: _topic, ...metadata }) => {
    const rows = history.filter(row => row.test_id === metadata.id);
    const active = rows.find(row => row.status === 'active');
    const completed = rows.filter(row => row.status === 'completed');
    return { ...metadata, available: bankEnabled(), activeAttemptId: active?.id ?? null,
      latestAttemptId: rows[0]?.id ?? null, completedCount: completed.length,
      answeredCount: active ? Object.values(active.answers).filter(value => value !== null).length : 0,
      bestPercentage: completed.length ? Math.max(...completed.map(row => Number(row.result.percentage))) : null };
  }) };
}

export async function startBank(db: DB, user: any, topicId: string, testId: string, input: unknown, now = new Date()) {
  if (!bankEnabled()) fail(409, 'Yeni soru bankası henüz kullanıma açılmadı.');
  const value = bankStartSchema.parse(input);
  const definition = testDefinition(topicId, testId);
  await visibleTopic(db, topicId);
  // Serialize starts per user without introducing or changing a schema/index.
  await db.query('SELECT id FROM users WHERE id=$1 FOR UPDATE', [user.id]);
  const requestKey = `qb:${testId}:${value.idempotencyKey}`;
  const duplicate = (await db.query('SELECT * FROM attempts WHERE user_id=$1 AND request_key=$2 AND mode=$3', [user.id, requestKey, mode])).rows[0];
  if (duplicate) return bankAttemptDTO(duplicate);
  const active = (await db.query(
    `SELECT * FROM attempts WHERE user_id=$1 AND topic_id=$2 AND mode=$3
     AND snapshot->>'id'=$4 AND status='active' ORDER BY created_at DESC LIMIT 1`,
    [user.id, topicId, mode, testId])).rows[0];
  if (active) return bankAttemptDTO(active);
  const id = randomUUID();
  await db.query(
    `INSERT INTO attempts(id,user_id,topic_id,mode,snapshot,penalty,goal,is_fresh,delayed,request_key,created_at)
     VALUES($1,$2,$3,$4,$5,0,15,false,false,$6,$7)`,
    [id, user.id, topicId, mode, JSON.stringify(definition), requestKey, now]);
  return bankAttemptDTO(await ownedBank(db, user.id, id));
}

export async function readBank(db: DB, userId: string, id: string) {
  return bankAttemptDTO(await ownedBank(db, userId, id));
}

export async function answerBank(db: DB, userId: string, id: string, input: unknown) {
  const value = bankAnswerSchema.parse(input);
  const row = await ownedBank(db, userId, id, true);
  if (row.status !== 'active') fail(409, 'Bu test tamamlandı; yanıtları değiştirilemez.');
  const snapshot = row.snapshot as PrivateBankTest;
  if (!snapshot.questions.some(question => question.id === value.questionId)) fail(400, 'Soru bu teste ait değil.');
  const answers = { ...row.answers, [value.questionId]: value.value };
  await db.query('UPDATE attempts SET answers=$2 WHERE id=$1', [id, JSON.stringify(answers)]);
  return bankAttemptDTO({ ...row, answers });
}

export async function finishBank(db: DB, userId: string, id: string, now = new Date()) {
  const row = await ownedBank(db, userId, id, true);
  if (row.status === 'completed') return bankAttemptDTO(row);
  const snapshot = row.snapshot as PrivateBankTest;
  let correct = 0, wrong = 0, blank = 0;
  for (const question of snapshot.questions) {
    const selected = row.answers[question.id];
    if (selected == null) blank++;
    else if (selected === question.correctAnswer) correct++;
    else wrong++;
    if (selected !== question.correctAnswer) {
      await captureBankMistake(db, userId, row, question, selected ?? null, now);
    }
  }
  const result: BankResult = { correct, wrong, blank, total: snapshot.questions.length,
    percentage: Math.round(correct / snapshot.questions.length * 100) };
  await db.query("UPDATE attempts SET status='completed',result=$2,completed_at=$3 WHERE id=$1", [id, JSON.stringify(result), now]);
  // Bank completion has no daily streak/points side effects; legacy study records remain unchanged.
  return bankAttemptDTO({ ...row, status: 'completed', result });
}
