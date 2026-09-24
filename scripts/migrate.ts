import { Client } from 'pg';
import { initialSchema, postgresConnectionConfig } from '../server/db';

const appTables = [
  'schema_migrations', 'users', 'sessions', 'content', 'config', 'attempts',
  'review_tasks', 'mistake_notes', 'lesson_completions', 'daily_activity', 'badges',
  'media_files', 'rate_limits', 'ai_usage',
] as const;

async function main() {
  const connectionString = process.env.MIGRATION_DATABASE_URL;
  if (!connectionString) throw new Error('MIGRATION_DATABASE_URL eksik.');
  const address = new URL(connectionString);
  if (address.port !== '5432') throw new Error('Migration için direct/session 5432 bağlantısı gerekli.');

  const client = new Client({ ...postgresConnectionConfig(connectionString), connectionTimeoutMillis: 30_000 });
  let connected = false;
  let transactionOpen = false;
  let created = false;
  try {
    await client.connect();
    connected = true;
    const stream = client.connection.stream as { encrypted?: boolean; authorized?: boolean };
    if (!stream.encrypted || !stream.authorized) throw new Error('TLS sertifikası doğrulanmadı.');
    await client.query('BEGIN');
    transactionOpen = true;
    await client.query('SELECT pg_advisory_xact_lock(489664391)');
    const existing = await client.query<{ table_name: string }>(
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE'",
    );
    const names = new Set(existing.rows.map((row) => row.table_name));
    if (names.size === 0) {
      await client.query(initialSchema);
      created = true;
    } else {
      const v1Tables = appTables.filter((table) => table !== 'mistake_notes');
      const missingV1 = v1Tables.filter((table) => !names.has(table));
      if (missingV1.length) throw new Error('Mevcut şema kısmi veya farklı; otomatik migration durduruldu.');
      const version1 = await client.query<{ version: number }>(
        'SELECT version FROM schema_migrations WHERE version=1',
      );
      if (!version1.rows.length) throw new Error('Mevcut şema sürümü tanınmıyor.');
      const version2 = await client.query<{ version: number }>(
        'SELECT version FROM schema_migrations WHERE version=2',
      );
      if (!names.has('mistake_notes')) {
        await client.query(`
          CREATE TABLE mistake_notes(
            id text PRIMARY KEY,
            user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            topic_id text NOT NULL,
            question_id text NOT NULL,
            attempt_id text,
            source text NOT NULL,
            question_snapshot jsonb NOT NULL,
            suggested_reason text NOT NULL,
            reason text NOT NULL,
            custom_tags jsonb NOT NULL DEFAULT '[]',
            note text NOT NULL DEFAULT '',
            wrong_count integer NOT NULL DEFAULT 1,
            resolved boolean NOT NULL DEFAULT false,
            created_at timestamptz NOT NULL DEFAULT now(),
            last_wrong_at timestamptz NOT NULL DEFAULT now(),
            updated_at timestamptz NOT NULL DEFAULT now(),
            UNIQUE(user_id,source,question_id)
          );
          CREATE INDEX mistake_notes_user ON mistake_notes(user_id,resolved,last_wrong_at DESC);
          INSERT INTO schema_migrations(version) VALUES(2) ON CONFLICT DO NOTHING;
        `);
        created = true;
      } else if (!version2.rows.length) {
        await client.query('INSERT INTO schema_migrations(version) VALUES(2) ON CONFLICT DO NOTHING');
        created = true;
      }
    }
    await client.query('COMMIT');
    transactionOpen = false;
    console.log(created ? 'PostgreSQL şeması güncellendi.' : 'PostgreSQL şeması zaten güncel; değişiklik yapılmadı.');
  } catch (error) {
    if (transactionOpen) await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    if (connected) await client.end().catch(() => {});
  }
}

main().catch((error: unknown) => {
  const code = error && typeof error === 'object' && 'code' in error &&
    typeof error.code === 'string' && /^[A-Z0-9_]+$/.test(error.code) ? ` (${error.code})` : '';
  console.error(`DB migration başarısız: ${error instanceof Error ? error.name : 'UnknownError'}${code}`);
  process.exitCode = 1;
});
