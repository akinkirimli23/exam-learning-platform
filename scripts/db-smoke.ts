import { randomUUID } from 'node:crypto';
import { Client } from 'pg';
import { auth, passwordHash, session } from '../server/core';
import { postgresConnectionConfig } from '../server/db';
import { answer, complete, overview, ownedAttempt, startAttempt } from '../server/learning';
import { captureStaticMistake, listMistakes } from '../server/mistakes';
import { getTopicDefinition } from '../shared/topic-registry';

// Exercises real PostgreSQL tables and application logic, then rolls back all test records.
async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL eksik.');
  const address = new URL(connectionString);
  if (address.port !== '6543') throw new Error('Transaction pooler portu 6543 olmalı.');
  if (!['require', 'verify-ca', 'verify-full'].includes(address.searchParams.get('sslmode') ?? '')) {
    throw new Error('TLS modu eksik.');
  }

  const client = new Client({ ...postgresConnectionConfig(connectionString), connectionTimeoutMillis: 10_000 });
  let connected = false;
  let transactionOpen = false;
  let testUserId = '';
  try {
    await client.connect();
    connected = true;
    const stream = client.connection.stream as { encrypted?: boolean };
    if (!stream.encrypted) throw new Error('TLS bağlantısı kurulmadı.');
    await client.query('BEGIN');
    transactionOpen = true;

    testUserId = randomUUID();
    const email = `db-smoke-${testUserId}@example.invalid`;
    await client.query(
      "INSERT INTO users(id,email,name,password_hash,adult_confirmed,exam_id) VALUES($1,$2,'DB Smoke Test',$3,true,'yks-2026')",
      [testUserId, email, await passwordHash(randomUUID())],
    );
    const user = (await client.query('SELECT * FROM users WHERE id=$1', [testUserId])).rows[0];
    const token = await session(client, testUserId);
    const authenticated = await auth(client, new Request('https://example.invalid/api/auth/me', {
      headers: { cookie: `ivme_session=${token}` },
    }));
    if (authenticated.id !== testUserId) throw new Error('Oturum doğrulaması başarısız.');

    await client.query(
      'INSERT INTO lesson_completions(user_id,content_id) VALUES($1,$2)',
      [testUserId, 'lesson-force-v1'],
    );
    const attempt = await startAttempt(client, user, {
      topicId: 'buoyancy', mode: 'practice', idempotencyKey: randomUUID(),
    });
    const saved = await ownedAttempt(client, testUserId, attempt.id);
    for (const question of saved.snapshot) {
      await answer(client, user, attempt.id, question.id, question.payload.correct);
    }
    const completed = await complete(client, user, attempt.id);
    const progress = await overview(client, user);
    if (completed.status !== 'completed' || progress.history.length !== 1 ||
        progress.points !== 20 || !progress.completedLessons.includes('lesson-force-v1')) {
      throw new Error('İlerleme doğrulaması başarısız.');
    }
    const question = getTopicDefinition('buoyancy')?.quiz[0];
    if (!question) throw new Error('Yanlış defteri smoke sorusu bulunamadı.');
    const selectedAnswer = (question.correctAnswer + 1) % question.options.length;
    await captureStaticMistake(client, user, {
      topicId: 'buoyancy', questionId: question.id, source: 'question-bank', selectedAnswer,
    });
    const notebook = await listMistakes(client, testUserId);
    if (notebook.items.length !== 1 || notebook.summary.totalOpen !== 1 ||
        notebook.items[0].questionId !== question.id) {
      throw new Error('Yanlış defteri doğrulaması başarısız.');
    }
    console.log('Öğrenci hesabı, DB oturumu, ders, test ilerlemesi ve yanlış defteri: geçti.');
  } finally {
    try {
      if (transactionOpen) await client.query('ROLLBACK');
      if (testUserId) {
        const remaining = await client.query<{ count: string }>(
          'SELECT count(*)::text AS count FROM users WHERE id=$1', [testUserId],
        );
        if (remaining.rows[0].count !== '0') throw new Error('Test kaydı geri alınamadı.');
        console.log('Test kayıtları geri alındı; kalıcı kullanıcı oluşturulmadı.');
      }
    } finally {
      if (connected) await client.end().catch(() => {});
    }
  }
}

main().catch((error: unknown) => {
  // Keep connection strings, SQL parameters and credentials out of output.
  console.error(`DB smoke başarısız: ${error instanceof Error ? error.name : 'UnknownError'}`);
  process.exitCode = 1;
});
