import { Client } from 'pg';
import { initialSchema, postgresConnectionConfig } from '../server/db';

const appTables = [
  'schema_migrations', 'users', 'sessions', 'content', 'config', 'attempts',
  'review_tasks', 'lesson_completions', 'daily_activity', 'badges',
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
      const missing = appTables.filter((table) => !names.has(table));
      if (missing.length) throw new Error('Mevcut şema kısmi veya farklı; otomatik migration durduruldu.');
      const version = await client.query<{ version: number }>(
        'SELECT version FROM schema_migrations WHERE version=1',
      );
      if (!version.rows.length) throw new Error('Mevcut şema sürümü tanınmıyor.');
    }
    await client.query('COMMIT');
    transactionOpen = false;
    console.log(created ? 'PostgreSQL v1 şeması boş veritabanına uygulandı.' :
      'PostgreSQL v1 şeması zaten mevcut; değişiklik yapılmadı.');
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
