/** Upload reviewed derivatives to the existing PRIVATE staging bucket only.
 * Supply server credentials through the process environment, never source control.
 * First run without --apply; existing objects are verified, never overwritten.
 */
import { createHash } from 'node:crypto';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Pool } from 'pg';
import { pressureMedia } from '../shared/content/physics/pressure/media';
import { databaseMatchesSupabaseProject, postgresConnectionConfig } from '../server/db';

const ref = 'ywvgtwonfhicwmevfvja';
const base = `https://${ref}.supabase.co`;
const sha = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');

async function main() {
  const database = new URL(process.env.DATABASE_URL || 'about:blank');
  const migration = new URL(process.env.MIGRATION_DATABASE_URL || 'about:blank');
  if (process.env.SUPABASE_URL !== base || database.port !== '6543' || migration.port !== '5432' ||
      decodeURIComponent(database.username) !== `postgres.${ref}` ||
      decodeURIComponent(migration.username) !== `postgres.${ref}` ||
      !databaseMatchesSupabaseProject()) throw new Error('Staging hedefi doğrulanamadı.');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('Staging sunucu anahtarı eksik.');
  // Legacy keys carry the project ref; new sb_secret keys are checked by the bucket API.
  if (key.startsWith('eyJ') && JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString()).ref !== ref) {
    throw new Error('Sunucu anahtarı farklı projeye ait.');
  }
  const config = postgresConnectionConfig(process.env.DATABASE_URL!);
  if (typeof config.ssl !== 'object' || !config.ssl.rejectUnauthorized) throw new Error('TLS doğrulaması eksik.');
  const pool = new Pool({ ...config, max: 1, connectionTimeoutMillis: 10000 });
  try {
    const bucket = (await pool.query('SELECT public,file_size_limit,allowed_mime_types FROM storage.buckets WHERE id=$1', ['learning-media'])).rows[0];
    if (!bucket || bucket.public !== false) throw new Error('Private bucket doğrulanamadı.');
    const versions = (await pool.query('SELECT version FROM schema_migrations ORDER BY version')).rows;
    if (JSON.stringify(versions.map(row => row.version)) !== '[1,2]') throw new Error('Staging şeması beklenenden farklı.');
    const files = await Promise.all(pressureMedia.map(async item => {
      const local = path.resolve('imports/pressure-learning-media/prepared', item.type === 'video' ? 'video' : '', path.basename(item.objectPath));
      const bytes = await readFile(local);
      if (bytes.length > Math.min(Number(bucket.file_size_limit || 52428800), 52428800)) throw new Error('Dosya boyutu bucket sınırını aşıyor.');
      if (bucket.allowed_mime_types?.length && !bucket.allowed_mime_types.includes(item.mimeType)) throw new Error('Dosya türü bucket tarafından kabul edilmiyor.');
      return { item, local, bytes, hash: sha(bytes) };
    }));
    const manifest = [];
    const headers = { apikey: key, Authorization: `Bearer ${key}` };
    for (const file of files) {
      const objectPath = file.item.objectPath.split('/').map(encodeURIComponent).join('/');
      const endpoint = `${base}/storage/v1/object/learning-media/${objectPath}`;
      const existing = (await pool.query('SELECT metadata FROM storage.objects WHERE bucket_id=$1 AND name=$2', ['learning-media', file.item.objectPath])).rows[0];
      if (!existing && process.argv.includes('--apply')) {
        const response = await fetch(endpoint, {
          method: 'POST', headers: { ...headers, 'Content-Type': file.item.mimeType!, 'x-upsert': 'false', 'Cache-Control': 'max-age=3600' },
          body: file.bytes, signal: AbortSignal.timeout(180000),
        });
        if (!response.ok) throw new Error(`Storage yükleme başarısız (${response.status}).`);
      }
      const uploaded = Boolean(existing) || process.argv.includes('--apply');
      if (uploaded) {
        const response = await fetch(`${base}/storage/v1/object/authenticated/learning-media/${objectPath}`, { headers, signal: AbortSignal.timeout(180000) });
        if (!response.ok || sha(new Uint8Array(await response.arrayBuffer())) !== file.hash) throw new Error('Uzak dosya SHA-256 eşleşmedi; üzerine yazılmadı.');
      }
      const record = { id: file.item.id, objectPath: file.item.objectPath, bytes: file.bytes.length, sha256: file.hash, verified: uploaded };
      manifest.push(record);
      console.log(JSON.stringify(record));
    }
    await mkdir('.cache/pressure-import', { recursive: true });
    await writeFile('.cache/pressure-import/storage-manifest.json', JSON.stringify({ target: ref, private: true, files: manifest }, null, 2));
    console.log(process.argv.includes('--apply') ? 'Staging: altı dosya SHA-256 ile doğrulandı. Veritabanı içeriğine yazılmadı.' : 'Salt okunur hazırlık tamamlandı; yüklemek için --apply gerekir.');
  } finally {
    await pool.end();
  }
}
main().catch(error => {
  // Provider responses may include credentials or internal metadata: do not log them.
  console.error('Basınç staging yüklemesi durdu:', error instanceof Error ? error.message.replace(/eyJ[\w.-]+/g, '[gizli]') : 'Bilinmeyen hata');
  process.exitCode = 1;
});
