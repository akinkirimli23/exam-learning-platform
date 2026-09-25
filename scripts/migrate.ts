import { Client } from 'pg';
import { postgresConnectionConfig } from '../server/db';
import { migrateToV2 } from './migration-v2';

async function main() {
  const connectionString = process.env.MIGRATION_DATABASE_URL;
  if (!connectionString) throw new Error('MIGRATION_DATABASE_URL eksik.');
  const runtimeString = process.env.DATABASE_URL;
  if (!runtimeString) throw new Error('DATABASE_URL eşleştirmesi eksik.');
  const address = new URL(connectionString);
  if (address.port !== '5432') throw new Error('Migration için direct/session 5432 bağlantısı gerekli.');
  const runtime = new URL(runtimeString);
  const projectRef = (url: URL) => decodeURIComponent(url.username).match(/^postgres\.([a-z0-9]+)$/)?.[1] ??
    url.hostname.match(/^db\.([a-z0-9]+)\.supabase\.co$/)?.[1];
  if (runtime.port !== '6543' || !projectRef(address) || projectRef(address) !== projectRef(runtime)) {
    throw new Error('Migration ve runtime bağlantıları aynı Supabase projesine ait olmalı.');
  }

  const client = new Client({ ...postgresConnectionConfig(connectionString), connectionTimeoutMillis: 30_000 });
  let connected = false;
  try {
    await client.connect();
    connected = true;
    const stream = client.connection.stream as { encrypted?: boolean; authorized?: boolean };
    if (!stream.encrypted || stream.authorized !== true) throw new Error('TLS sertifikası doğrulanmadı.');
    const changed = await migrateToV2(client);
    console.log(changed ? 'PostgreSQL şeması güncellendi.' : 'PostgreSQL şeması zaten güncel; değişiklik yapılmadı.');
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
