/** Editorial corrections for THREE existing staging rows; preserves IDs and progress.
 * Dry-run first, then --apply --expected-before=<reported SHA-256>.
 * This is not a migration or a seed and never creates/deletes content.
 */
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { Pool } from 'pg';
import { initialSchema, postgresConnectionConfig } from '../server/db';
import { seedPressureContent } from '../server/seed-pressure';

const ids = ['pressure-lesson-pascal', 'pressure-card-016', 'pressure-q-014'];
const digest = (value: unknown) => createHash('sha256').update(JSON.stringify(value)).digest('hex');

async function main() {
  const target = new URL(process.env.DATABASE_URL || 'about:blank');
  const migration = new URL(process.env.MIGRATION_DATABASE_URL || 'about:blank');
  if (target.port !== '6543' || migration.port !== '5432' ||
      [target, migration].some(url => decodeURIComponent(url.username) !== 'postgres.ywvgtwonfhicwmevfvja')) throw new Error('Staging hedefi doğrulanamadı.');
  const config = postgresConnectionConfig(process.env.DATABASE_URL!);
  if (typeof config.ssl !== 'object' || !config.ssl.rejectUnauthorized) throw new Error('TLS doğrulaması eksik.');
  const local = new PGlite();
  let desired: any[];
  try {
    await local.exec(initialSchema);
    await local.exec("INSERT INTO content(id,logical_id,kind,title,revision,status,payload,source) VALUES('exam','yks-2026','exam','YKS',1,'published','{}','{}'),('physics','physics','subject','Fizik',1,'published','{}','{}')");
    await local.transaction(tx => seedPressureContent(tx));
    desired = (await local.query('SELECT logical_id,title,payload FROM content WHERE logical_id = ANY($1) ORDER BY logical_id', [ids])).rows;
  } finally { await local.close(); }
  const pool = new Pool({ ...config, max: 1, connectionTimeoutMillis: 10000 });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const before = (await client.query('SELECT id,logical_id,kind,parent_id,status,revision,title,payload FROM content WHERE logical_id = ANY($1) ORDER BY logical_id FOR UPDATE', [ids])).rows;
    if (before.length !== 3 || before.some(row => row.parent_id !== 'pressure' || row.status !== 'published')) throw new Error('Mevcut üç kayıt doğrulanamadı.');
    const beforeDigest = digest(before);
    // Complete row digests verify the student tables without exposing their contents.
    const studentFingerprint = async () => (await client.query(`SELECT
      (SELECT md5(coalesce(string_agg(row_to_json(t)::text,'' ORDER BY id),'')) FROM users t) AS users,
      (SELECT md5(coalesce(string_agg(row_to_json(t)::text,'' ORDER BY token_hash),'')) FROM sessions t) AS sessions,
      (SELECT md5(coalesce(string_agg(row_to_json(t)::text,'' ORDER BY id),'')) FROM attempts t) AS attempts,
      (SELECT md5(coalesce(string_agg(row_to_json(t)::text,'' ORDER BY user_id,content_id),'')) FROM lesson_completions t) AS lessons,
      (SELECT md5(coalesce(string_agg(row_to_json(t)::text,'' ORDER BY id),'')) FROM mistake_notes t) AS mistakes,
      (SELECT count(*)::int FROM content) AS content_count`)).rows[0];
    const baseline = await studentFingerprint();
    const changes = before.map(row => {
      const canonical = desired.find(item => item.logical_id === row.logical_id)!;
      const payload = { ...row.payload };
      const fields = row.kind === 'lesson' ? ['body'] : row.kind === 'card' ? ['back'] : ['text', 'steps', 'distractors'];
      for (const field of fields) payload[field] = canonical.payload[field];
      if (row.kind === 'question' && (digest(row.payload.options) !== digest(canonical.payload.options) || row.payload.correct !== canonical.payload.correct)) throw new Error('Cevap anahtarı değişikliği reddedildi.');
      const title = row.kind === 'question' ? canonical.title : row.title;
      return { row, payload, title, changed: title !== row.title || digest(payload) !== digest(row.payload), fields };
    });
    const report = { target: 'ywvgtwonfhicwmevfvja', beforeDigest, changes: changes.map(({ row, changed, fields }) => ({ id: row.id, logicalId: row.logical_id, changed, fields })), applied: false, studentRecordsPreserved: true };
    if (process.argv.includes('--apply')) {
      if (!process.argv.includes(`--expected-before=${beforeDigest}`)) throw new Error('Salt okunur inceleme özeti değişmiş; beklenen SHA-256 gerekli.');
      for (const { row, payload, title, changed } of changes) if (changed) {
        await client.query('UPDATE content SET title=$1,payload=$2 WHERE id=$3', [title, JSON.stringify(payload), row.id]);
      }
      if (digest(await studentFingerprint()) !== digest(baseline)) throw new Error('Öğrenci kayıt özeti değişti; işlem geri alınıyor.');
      await client.query('COMMIT'); report.applied = true;
    } else await client.query('ROLLBACK');
    await mkdir('.cache/pressure-import', { recursive: true });
    await writeFile('.cache/pressure-import/editorial-staging-review.json', JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
  } catch (error) {
    await client.query('ROLLBACK'); throw error;
  } finally { client.release(); await pool.end(); }
}
main().catch(error => { console.error('Staging metin incelemesi durdu:', error instanceof Error ? error.message : 'Bilinmeyen hata'); process.exitCode = 1; });
