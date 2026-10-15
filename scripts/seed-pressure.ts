import { readFileSync } from 'node:fs';
import { closeDb, postgresConnectionConfig, transaction } from '../server/db';
import { seedPressureContent } from '../server/seed-pressure';
let stage = 'target guard';

function projectRef(value: string | undefined) {
  if (!value) throw new Error('Gerekli bağlantı eksik.');
  const address = new URL(value);
  const match = decodeURIComponent(address.username).match(/^postgres\.([a-z0-9]+)$/);
  if (!match) throw new Error('Supabase pooler proje kimliği doğrulanamadı.');
  return { ref: match[1], port: address.port };
}

function declaredDatabase(path: string) {
  const line = readFileSync(path, 'utf8').split(/\r?\n/).find(entry => /^DATABASE_URL=/.test(entry));
  return projectRef(line?.slice('DATABASE_URL='.length).replace(/^['"]|['"]$/g, ''));
}

async function main() {
  const stagingMode = process.argv.includes('--staging');
  const productionMode = process.argv.includes('--production');
  if (stagingMode === productionMode) throw new Error('Tek bir hedef açıkça seçilmeli: --staging veya --production.');
  const target = projectRef(process.env.DATABASE_URL);
  const migration = projectRef(process.env.MIGRATION_DATABASE_URL);
  const production = declaredDatabase('.env.local');
  const staging = declaredDatabase('.env.staging.local');
  const expected = stagingMode ? staging : production;
  const other = stagingMode ? production : staging;
  if (target.port !== '6543' || migration.port !== '5432' ||
      target.ref !== migration.ref || target.ref !== expected.ref ||
      target.ref === other.ref || production.ref === staging.ref ||
      process.env.DEMO_CONTENT !== 'true') {
    throw new Error('Hedef bağlantı ayrımı veya demo içerik ayarı doğrulanamadı; hiçbir veri yazılmadı.');
  }
  stage = 'TLS guard';
  const tls = postgresConnectionConfig(process.env.DATABASE_URL!, process.env.DATABASE_CA_CERT_B64);
  if (!tls.ssl || typeof tls.ssl !== 'object' || !tls.ssl.rejectUnauthorized || !tls.ssl.servername) {
    throw new Error('TLS sertifika ve sunucu adı doğrulaması etkin değil.');
  }
  const label = stagingMode ? 'Staging' : 'Production';
  if (process.argv.includes('--check-target')) {
    console.log(`${label} hedef yapılandırması doğrulandı; veritabanına bağlanılmadı, seed çalıştırılmadı.`);
    return;
  }
  stage = 'content transaction';
  const created = await transaction(seedPressureContent);
  console.log(created ? `${label} Basınç içerikleri eklendi.` : `${label} Basınç içerikleri zaten tam; değişiklik yapılmadı.`);
}

main().catch((error: unknown) => {
  const safeMessages = new Set([
    'Tek bir hedef açıkça seçilmeli: --staging veya --production.',
    'Gerekli bağlantı eksik.',
    'Supabase pooler proje kimliği doğrulanamadı.',
    'Hedef bağlantı ayrımı veya demo içerik ayarı doğrulanamadı; hiçbir veri yazılmadı.',
    'TLS sertifika ve sunucu adı doğrulaması etkin değil.',
    'Basınç içerik kimlikleri önceden kullanılmış; otomatik ekleme durduruldu.',
    'Yayımlanmış YKS/Fizik üst içeriği bulunamadı.',
  ]);
  const detail = error instanceof Error && safeMessages.has(error.message) ? error.message : error instanceof Error ? error.name : 'Bilinmeyen hata';
  console.error(`Basınç seed durduruldu (${stage}): ${detail}`);
  process.exitCode = 1;
}).finally(closeDb);
