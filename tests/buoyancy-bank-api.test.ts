import { randomUUID } from 'node:crypto';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { handle } from '../server/api';
import { closeDb, query } from '../server/db';
import { seedDatabase } from '../server/seed';
import { buoyancyQuestionBank } from '../server/buoyancy-bank-adapter';
import { buoyancyTopicDefinition } from '../shared/content/physics/buoyancy/topic';

const origin = 'http://127.0.0.1:3100';
let cookie = '', otherCookie = '', userId = '';
async function request(route: string, method = 'GET', data?: unknown, session = cookie) {
  const response = await handle(new Request(`${origin}/api/${route}`, {
    method, headers: { Origin: origin, Host: '127.0.0.1:3100', 'Content-Type': 'application/json', ...(session ? { Cookie: session } : {}) },
    body: data === undefined ? undefined : JSON.stringify(data),
  }));
  return { response, status: response.status, data: await response.json() };
}
async function registerUsers() {
  const first = await request('auth/register', 'POST', { name: 'Banka Öğrenci', email: 'bank-one@test.local', password: 'Local-bank-test-pass-01', adult: true }, '');
  expect(first.status).toBe(200);
  cookie = first.response.headers.get('set-cookie')!.split(';')[0]; userId = first.data.user.id;
  const second = await request('auth/register', 'POST', { name: 'Diğer Öğrenci', email: 'bank-two@test.local', password: 'Local-bank-test-pass-02', adult: true }, '');
  otherCookie = second.response.headers.get('set-cookie')!.split(';')[0];
}
async function start(testId = 'buoyancy-easy-01', key = randomUUID()) {
  return request(`question-bank/buoyancy/${testId}/start`, 'POST', { idempotencyKey: key });
}

beforeEach(async () => {
  await closeDb();
  vi.stubEnv('DATABASE_URL', ''); vi.stubEnv('MIGRATION_DATABASE_URL', '');
  vi.stubEnv('SUPABASE_URL', ''); vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '');
  vi.stubEnv('DATA_DIR', ':memory:'); vi.stubEnv('DEMO_CONTENT', 'true');
  vi.stubEnv('APP_ORIGIN', origin); vi.stubEnv('NODE_ENV', 'test');
  vi.stubEnv('BUOYANCY_BANK_135_ENABLED', 'true');
  await seedDatabase(); await registerUsers();
});
afterEach(async () => { await closeDb(); vi.unstubAllEnvs(); });

describe('Persistent, server-graded question-bank API', () => {
  it('keeps publication opt-in and leaves content and schema unchanged', async () => {
    vi.stubEnv('BUOYANCY_BANK_135_ENABLED', 'false');
    const catalog = await request('question-bank/buoyancy');
    expect(catalog.status).toBe(200); expect(catalog.data.tests).toHaveLength(9);
    expect(catalog.data.tests.every((test: any) => test.available === false)).toBe(true);
    expect((await start()).status).toBe(409);
    expect((await query('SELECT count(*)::int AS count FROM content')).rows[0].count).toBe(46);
    expect((await query('SELECT version FROM schema_migrations ORDER BY version')).rows.map(row => row.version)).toEqual([1, 2]);
  });

  it('hides keys/solutions before completion, validates answers and isolates users and legacy routes', async () => {
    expect((await request('question-bank/buoyancy', 'GET', undefined, '')).status).toBe(401);
    const started = await start(); expect(started.status).toBe(200);
    expect(started.data.questions).toHaveLength(15);
    expect(started.data.questions.every((question: any) => !('correctAnswer' in question) && !('explanation' in question))).toBe(true);
    expect(started.data.feedback).toEqual([]); expect(started.data.result).toBeNull();
    const id = started.data.id, questionId = started.data.questions[0].id;
    expect((await request(`question-bank/attempts/${id}`, 'GET', undefined, otherCookie)).status).toBe(404);
    expect((await request(`attempts/${id}`)).status).toBe(404);
    expect((await request(`attempts/${id}/complete`, 'POST')).status).toBe(404);
    expect((await request(`question-bank/attempts/${id}/answer`, 'PUT', { questionId, value: 5 })).status).toBe(400);
    expect((await request(`question-bank/attempts/${id}/answer`, 'PUT', { questionId: 'buoyancy-hard-01-q01', value: 0 })).status).toBe(400);
    const answered = await request(`question-bank/attempts/${id}/answer`, 'PUT', { questionId, value: 0, correctAnswer: 0 });
    expect(answered.status).toBe(200); expect(answered.data.feedback).toEqual([]);
    expect((await request('mistakes')).data.items).toHaveLength(0);
    expect((await request('mistakes/capture', 'POST', { topicId: 'buoyancy', questionId, source: 'question-bank', selectedAnswer: 0 })).status).toBe(404);
  });

  it('resumes by test/question across devices and pins the original question snapshot', async () => {
    const key = randomUUID(), first = await start('buoyancy-medium-01', key);
    expect((await start('buoyancy-medium-01', key)).data.id).toBe(first.data.id);
    expect((await start('buoyancy-medium-01')).data.id).toBe(first.data.id);
    const questionId = first.data.questions[0].id;
    await request(`question-bank/attempts/${first.data.id}/answer`, 'PUT', { questionId, value: 2 });
    const mobile = await request('auth/login', 'POST', { email: 'bank-one@test.local', password: 'Local-bank-test-pass-01', mobile: true }, '');
    const response = await handle(new Request(`${origin}/api/question-bank/attempts/${first.data.id}`, { headers: { Authorization: `Bearer ${mobile.data.token}` } }));
    expect((await response.json()).answers[questionId]).toBe(2);
    const source = buoyancyQuestionBank[3].questions[0], oldText = source.text;
    try {
      source.text = 'Future revision must not change an existing attempt.';
      expect((await request(`question-bank/attempts/${first.data.id}`)).data.questions[0].text).toBe(oldText);
    } finally { source.text = oldText; }
    const catalog = (await request('question-bank/buoyancy')).data.tests.find((test: any) => test.id === 'buoyancy-medium-01');
    expect(catalog.activeAttemptId).toBe(first.data.id); expect(catalog.answeredCount).toBe(1);
  });

  it('grades on the server, captures wrong/blank solutions once and preserves legacy progress and notes', async () => {
    const legacy = await request('attempts', 'POST', { topicId: 'buoyancy', mode: 'practice', idempotencyKey: randomUUID() });
    const snapshot = (await query('SELECT snapshot FROM attempts WHERE id=$1', [legacy.data.id])).rows[0].snapshot;
    for (const question of snapshot) await request(`attempts/${legacy.data.id}/answer`, 'PUT', { questionId: question.id, value: question.payload.correct });
    expect((await request(`attempts/${legacy.data.id}/complete`, 'POST')).status).toBe(200);
    await request('lessons/lesson-force-v1/complete', 'POST');
    const oldQuestion = buoyancyTopicDefinition.quiz[0];
    const old = await request('mistakes/capture', 'POST', { topicId: 'buoyancy', questionId: oldQuestion.id, source: 'question-bank', selectedAnswer: (oldQuestion.correctAnswer + 1) % oldQuestion.options.length });
    expect(old.status).toBe(201);
    await request(`mistakes/${old.data.id}`, 'PUT', { reason: 'attention', customTags: ['koru'], note: 'Öğrencinin önceki notu', resolved: false });
    const before = (await request('overview')).data;
    const beforeNote = (await request('mistakes')).data.items.find((item: any) => item.id === old.data.id);
    const started = await start(), id = started.data.id;
    const questions = buoyancyQuestionBank[0].questions;
    for (const [index, question] of questions.entries()) {
      const value = index === 0 ? (question.correctAnswer + 1) % 5 : index === 14 ? null : question.correctAnswer;
      expect((await request(`question-bank/attempts/${id}/answer`, 'PUT', { questionId: question.id, value })).status).toBe(200);
    }
    const result = await request(`question-bank/attempts/${id}/complete`, 'POST');
    expect(result.data.result).toEqual({ correct: 13, wrong: 1, blank: 1, total: 15, percentage: 87 });
    expect(result.data.feedback).toHaveLength(15);
    expect(result.data.feedback[0].explanation).toBe(questions[0].explanation);
    const notebook = (await request('mistakes')).data.items;
    const newNotes = notebook.filter((item: any) => item.question.testId === 'buoyancy-easy-01');
    expect(newNotes).toHaveLength(2);
    expect(newNotes.every((item: any) => item.attemptId === id && item.wrongCount === 1 && item.question.explanation)).toBe(true);
    expect(newNotes.find((item: any) => item.question.selectedAnswer === null).suggestedReason).toBe('time');
    expect(notebook.find((item: any) => item.id === old.data.id)).toEqual(beforeNote);
    expect((await request('overview')).data).toEqual(before);
    expect((await request(`question-bank/attempts/${id}/complete`, 'POST')).data.result).toEqual(result.data.result);
    expect((await request('mistakes')).data.items.filter((item: any) => item.question.testId === 'buoyancy-easy-01').every((item: any) => item.wrongCount === 1)).toBe(true);
    expect((await request(`question-bank/attempts/${id}/answer`, 'PUT', { questionId: questions[0].id, value: questions[0].correctAnswer })).status).toBe(409);
    const nextLegacy = await request('attempts', 'POST', { topicId: 'buoyancy', mode: 'practice', idempotencyKey: randomUUID() });
    expect(nextLegacy.status).toBe(200); expect(nextLegacy.data.questions).toHaveLength(5);
  });

  it('rolls back both completion and partial notebook inserts if a write fails', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      const started = await start();
      await query(`CREATE FUNCTION bank_finish_failure() RETURNS trigger LANGUAGE plpgsql AS $$
        BEGIN IF NEW.question_id='buoyancy-easy-01-q02' THEN RAISE EXCEPTION 'test rollback'; END IF; RETURN NEW; END; $$`);
      await query('CREATE TRIGGER bank_finish_failure_trigger BEFORE INSERT ON mistake_notes FOR EACH ROW EXECUTE FUNCTION bank_finish_failure()');
      expect((await request(`question-bank/attempts/${started.data.id}/complete`, 'POST')).status).toBe(500);
      expect((await query('SELECT status FROM attempts WHERE id=$1', [started.data.id])).rows[0].status).toBe('active');
      expect((await query('SELECT count(*)::int AS count FROM mistake_notes WHERE user_id=$1', [userId])).rows[0].count).toBe(0);
      await query('DROP TRIGGER bank_finish_failure_trigger ON mistake_notes');
      expect((await request(`question-bank/attempts/${started.data.id}/complete`, 'POST')).data.result.blank).toBe(15);
    } finally { log.mockRestore(); }
  });

  it('retains saved answers, completion and notebook entries after closing/reopening disk storage', async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), 'ivme-bank-'));
    try {
      await closeDb(); vi.stubEnv('DATA_DIR', directory); await seedDatabase(); await registerUsers();
      const started = await start('buoyancy-hard-01'), id = started.data.id;
      const questionId = started.data.questions[0].id;
      await request(`question-bank/attempts/${id}/answer`, 'PUT', { questionId, value: 0 });
      await closeDb();
      expect((await request(`question-bank/attempts/${id}`)).data.answers[questionId]).toBe(0);
      await request(`question-bank/attempts/${id}/complete`, 'POST');
      await closeDb();
      expect((await request(`question-bank/attempts/${id}`)).data.status).toBe('completed');
      expect((await request('mistakes')).data.items.length).toBeGreaterThan(0);
    } finally {
      await closeDb();
      if (!path.resolve(directory).startsWith(path.resolve(os.tmpdir()) + path.sep) || !path.basename(directory).startsWith('ivme-bank-')) throw new Error('Unexpected test cleanup path.');
      await rm(directory, { recursive: true, force: true });
    }
  });
});
