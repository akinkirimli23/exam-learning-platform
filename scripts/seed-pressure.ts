import { readFileSync } from 'node:fs';
import { closeDb, postgresConnectionConfig, transaction } from '../server/db';
import { seedPressureContent } from '../server/seed-pressure';

function projectRef(value: string | undefined) {
  if (!value) throw new Error('Gerekli bağlantı eksik.');
  const address = new URL(value);
  const match = decodeURIComponent(address.username).match(/^postgres\.([a-z0-9]+)$/);
  if (!match) throw new Error('Supabase pooler proje kimliği doğrulanamadı.');
  return { ref: match[1], port: address.port };
}

async function main() {
  if (!process.argv.includes('--staging')) throw new Error('Yalnız doğrulanmış Staging hedefi kabul edilir.');
  const staging = projectRef(process.env.DATABASE_URL);
  const migration = projectRef(process.env.MIGRATION_DATABASE_URL);
  const productionLine = readFileSync('.env.local', 'utf8').split(/\r?\n/).find(line => /^DATABASE_URL=/.test(line));
  const production = projectRef(productionLine?.slice('DATABASE_URL='.length).replace(/^['"]|['"]$/g, ''));
  if (staging.port !== '6543' || migration.port !== '5432' ||
      staging.ref !== migration.ref || staging.ref === production.ref) {
    throw new Error('Staging bağlantı ayrımı doğrulanamadı; hiçbir veri yazılmadı.');
  }
  const tls = postgresConnectionConfig(process.env.DATABASE_URL!, process.env.DATABASE_CA_CERT_B64);
  if (!tls.ssl || typeof tls.ssl !== 'object' || !tls.ssl.rejectUnauthorized || !tls.ssl.servername) {
    throw new Error('TLS sertifika ve sunucu adı doğrulaması etkin değil.');
  }
  const created = await transaction(seedPressureContent);
  console.log(created ? 'Staging Basınç içerikleri eklendi.' : 'Staging Basınç içerikleri zaten tam; değişiklik yapılmadı.');
}

main().catch((error: unknown) => {
  console.error(`Basınç seed durduruldu: ${error instanceof Error ? error.name : 'Bilinmeyen hata'}`);
  process.exitCode = 1;
}).finally(closeDb);
