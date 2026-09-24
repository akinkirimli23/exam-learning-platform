import { Client } from 'pg';
import { postgresConnectionConfig } from '../server/db';
import { assertMistakeNotesSchema } from './migration-v2';

// Read-only inventory for the Supabase database used by the Vercel pilot.
// Run with DATABASE_URL in the process environment; never print its value.
const expectedTables = [
  'schema_migrations', 'users', 'sessions', 'content', 'config', 'attempts',
  'review_tasks', 'mistake_notes', 'lesson_completions', 'daily_activity', 'badges',
  'media_files', 'rate_limits', 'ai_usage',
] as const;
let stage = 'configuration';

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL eksik.');

  const address = new URL(connectionString);
  if (address.port !== '6543') throw new Error('Transaction pooler portu 6543 olmalı.');
  const sslmode = address.searchParams.get('sslmode');
  if (sslmode && !['require', 'verify-ca', 'verify-full'].includes(sslmode)) {
    throw new Error('Güvensiz TLS modu reddedildi.');
  }

  const connection = postgresConnectionConfig(connectionString);
  const client = new Client({ ...connection, connectionTimeoutMillis: 10_000 });
  let connected = false;
  let transactionOpen = false;
  try {
    stage = 'connect';
    await client.connect();
    connected = true;
    stage = 'TLS verification';
    const stream = client.connection.stream as { encrypted?: boolean; authorized?: boolean };
    if (!stream.encrypted || stream.authorized !== true) throw new Error('TLS sertifikası doğrulanmadı.');
    console.log('Transaction pooler: 6543; TLS: etkin; sertifika ve sunucu adı doğrulandı.');

    await client.query('BEGIN READ ONLY');
    transactionOpen = true;
    stage = 'schema inventory';
    const result = await client.query<{ table_name: string }>(
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name",
    );
    const tables = new Set(result.rows.map((row) => row.table_name));
    console.log(`Public tablolar (${tables.size}): ${[...tables].join(', ') || 'yok'}`);
    console.log(`Eksik uygulama tabloları: ${expectedTables.filter((table) => !tables.has(table)).join(', ') || 'yok'}`);

    for (const table of expectedTables) {
      if (!tables.has(table)) continue;
      // Identifiers come exclusively from the hard-coded expectedTables list.
      const count = await client.query<{ count: string }>(`SELECT count(*)::text AS count FROM public.${table}`);
      console.log(`${table}: ${count.rows[0].count} kayıt`);
    }
    if (tables.has('schema_migrations')) {
      const versions = await client.query<{ version: number }>('SELECT version FROM public.schema_migrations ORDER BY version');
      console.log(`Şema sürümleri: ${versions.rows.map((row) => row.version).join(', ') || 'yok'}`);
    }
    if (tables.has('mistake_notes')) {
      await assertMistakeNotesSchema(client);
      console.log('mistake_notes v2 kolonları, kısıtları, indeksleri, RLS ve izinleri: doğrulandı.');
    }
    if (tables.has('content')) {
      const content = await client.query<{ status: string; demo: boolean; count: string }>(
        'SELECT status, demo, count(*)::text AS count FROM public.content GROUP BY status, demo ORDER BY status, demo',
      );
      console.log(`İçerik özeti: ${content.rows.map((row) => `${row.status}/${row.demo ? 'demo' : 'gerçek'}=${row.count}`).join(', ') || 'boş'}`);
    }
  } finally {
    if (transactionOpen) await client.query('ROLLBACK');
    if (connected) await client.end();
  }
}

main().catch((error: unknown) => {
  // Database errors can contain connection details; keep console output generic.
  const code = error && typeof error === 'object' && 'code' in error &&
    typeof error.code === 'string' && /^[A-Z0-9_]+$/.test(error.code) ? ` (${error.code})` : '';
  const message = error instanceof Error ? error.message : '';
  const category = /certificate|verify|self.signed|hostname/i.test(message) ? 'TLS sertifikası' :
    /password|authentication/i.test(message) ? 'kimlik doğrulama' :
      /timeout|connect|network|ENET|ECONN|EHOST|ENOTFOUND/i.test(message) ? 'ağ/erişim' : 'diğer';
  const schemaDetail = message.startsWith('mistake_notes ') ? `; ${message}` : '';
  console.error(`DB audit başarısız: ${stage}; ${category}; ${error instanceof Error ? error.name : 'UnknownError'}${code}${schemaDetail}`);
  process.exitCode = 1;
});
