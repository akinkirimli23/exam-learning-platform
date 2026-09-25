import { PGlite } from '@electric-sql/pglite';
import { describe, expect, it } from 'vitest';
import { initialSchemaV1 } from '../server/db';
import { assertMistakeNotesSchema, migrateToV2, type MigrationDatabase } from '../scripts/migration-v2';

async function freshV1() {
  const db = new PGlite();
  await db.exec('CREATE ROLE anon; CREATE ROLE authenticated;');
  await db.exec(initialSchemaV1);
  return db;
}

describe('Production v2 migration güvenliği', () => {
  it('boş test veritabanını v1 ve doğrulanmış v2 olarak başlatır', async () => {
    const db = new PGlite();
    try {
      await db.exec('CREATE ROLE anon; CREATE ROLE authenticated;');
      expect(await migrateToV2(db)).toBe(true);
      await expect(assertMistakeNotesSchema(db)).resolves.toBeUndefined();
      expect((await db.query('SELECT version FROM schema_migrations ORDER BY version')).rows).toEqual([{version:1},{version:2}]);
    } finally { await db.close(); }
  });

  it('temiz v1 verilerini korur, v2 tablosunu erişim kısıtlarıyla kurar ve tekrar çalışır', async () => {
    const db = await freshV1();
    try {
      await db.query("INSERT INTO users(id,email,name,password_hash,adult_confirmed) VALUES('student-1','student@example.test','Öğrenci','hash',true)");
      await db.query("INSERT INTO sessions(token_hash,user_id,expires_at) VALUES('session-1','student-1',now()+interval '1 day')");
      await db.query("INSERT INTO content(id,logical_id,kind,title,revision,status,payload,source) VALUES('content-1','exam-1','exam','YKS',1,'published','{}','{}')");
      await db.query("INSERT INTO lesson_completions(user_id,content_id) VALUES('student-1','content-1')");

      expect(await migrateToV2(db)).toBe(true);
      await expect(assertMistakeNotesSchema(db)).resolves.toBeUndefined();
      expect((await db.query('SELECT version FROM schema_migrations ORDER BY version')).rows).toEqual([{version:1},{version:2}]);
      for (const table of ['users','sessions','content','lesson_completions']) {
        expect((await db.query<{count:number}>(`SELECT count(*)::int AS count FROM ${table}`)).rows[0].count).toBe(1);
      }
      await db.query(`INSERT INTO mistake_notes(id,user_id,topic_id,question_id,source,question_snapshot,suggested_reason,reason)
        VALUES('note-1','student-1','buoyancy','q-1','question-bank','{}','attention','attention')`);
      expect((await db.query<{count:number}>('SELECT count(*)::int AS count FROM mistake_notes')).rows[0].count).toBe(1);
      expect(await migrateToV2(db)).toBe(false);
      expect((await db.query<{count:number}>('SELECT count(*)::int AS count FROM mistake_notes')).rows[0].count).toBe(1);
    } finally { await db.close(); }
  });

  it('migration sonunda hata olursa tabloyu ve v2 işaretini transaction ile geri alır', async () => {
    const db = await freshV1();
    try {
      await db.query("INSERT INTO users(id,email,name,password_hash,adult_confirmed) VALUES('student-1','student@example.test','Öğrenci','hash',true)");
      const injected: MigrationDatabase = {
        query: async (sql, params) => {
          if (sql === 'INSERT INTO schema_migrations(version) VALUES(2)') throw new Error('test failure');
          return db.query(sql, params);
        },
      };
      await expect(migrateToV2(injected)).rejects.toThrow('test failure');
      expect((await db.query<{name:string|null}>("SELECT to_regclass('public.mistake_notes') AS name")).rows[0].name).toBeNull();
      expect((await db.query('SELECT version FROM schema_migrations ORDER BY version')).rows).toEqual([{version:1}]);
      expect((await db.query<{count:number}>('SELECT count(*)::int AS count FROM users')).rows[0].count).toBe(1);
    } finally { await db.close(); }
  });

  it('mevcut sağlam v2 tablosunu doğruladıktan sonra eksik sürüm işaretini ekler', async () => {
    const db = await freshV1();
    try {
      await migrateToV2(db);
      await db.query('DELETE FROM schema_migrations WHERE version=2');
      expect(await migrateToV2(db)).toBe(true);
      await expect(assertMistakeNotesSchema(db)).resolves.toBeUndefined();
      expect((await db.query('SELECT version FROM schema_migrations ORDER BY version')).rows).toEqual([{version:1},{version:2}]);
    } finally { await db.close(); }
  });

  it.each([
    ['eksik kolon', 'ALTER TABLE mistake_notes DROP COLUMN note'],
    ['yanlış tip', 'ALTER TABLE mistake_notes ALTER COLUMN wrong_count TYPE text USING wrong_count::text'],
    ['eksik foreign key', 'ALTER TABLE mistake_notes DROP CONSTRAINT mistake_notes_user_id_fkey'],
    ['eksik benzersiz kısıt', 'ALTER TABLE mistake_notes DROP CONSTRAINT mistake_notes_user_id_source_question_id_key'],
    ['eksik indeks', 'DROP INDEX mistake_notes_user'],
    ['kapalı RLS', 'ALTER TABLE mistake_notes DISABLE ROW LEVEL SECURITY'],
    ['açık anon izni', 'GRANT SELECT ON mistake_notes TO anon'],
    ['açık PUBLIC izni', 'GRANT SELECT ON mistake_notes TO PUBLIC'],
  ])('mevcut tabloda %s varsa v2 işaretini eklemez', async (_label, mutation) => {
    const db = await freshV1();
    try {
      await migrateToV2(db);
      await db.query('DELETE FROM schema_migrations WHERE version=2');
      await db.query(mutation);
      await expect(migrateToV2(db)).rejects.toThrow();
      expect((await db.query('SELECT version FROM schema_migrations ORDER BY version')).rows).toEqual([{version:1}]);
    } finally { await db.close(); }
  });

  it('v2 işareti var ama tablo yoksa durur', async () => {
    const db = await freshV1();
    try {
      await db.query('INSERT INTO schema_migrations(version) VALUES(2)');
      await expect(migrateToV2(db)).rejects.toThrow(/tablosu yok/);
      expect((await db.query<{name:string|null}>("SELECT to_regclass('public.mistake_notes') AS name")).rows[0].name).toBeNull();
    } finally { await db.close(); }
  });
});
