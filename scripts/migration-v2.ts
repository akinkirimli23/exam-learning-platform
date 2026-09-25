import { initialSchemaV1, mistakeNotesSchema } from '../server/db';

export interface MigrationDatabase {
  query<T = any>(sql: string, params?: any[]): Promise<{ rows: T[] }>;
}

const v1Tables = [
  'schema_migrations', 'users', 'sessions', 'content', 'config', 'attempts',
  'review_tasks', 'lesson_completions', 'daily_activity', 'badges',
  'media_files', 'rate_limits', 'ai_usage',
];

const expectedColumns: Record<string, { type: string; notNull: boolean; defaultValue: string | null }> = {
  id: { type: 'text', notNull: true, defaultValue: null },
  user_id: { type: 'text', notNull: true, defaultValue: null },
  topic_id: { type: 'text', notNull: true, defaultValue: null },
  question_id: { type: 'text', notNull: true, defaultValue: null },
  attempt_id: { type: 'text', notNull: false, defaultValue: null },
  source: { type: 'text', notNull: true, defaultValue: null },
  question_snapshot: { type: 'jsonb', notNull: true, defaultValue: null },
  suggested_reason: { type: 'text', notNull: true, defaultValue: null },
  reason: { type: 'text', notNull: true, defaultValue: null },
  custom_tags: { type: 'jsonb', notNull: true, defaultValue: "'[]'::jsonb" },
  note: { type: 'text', notNull: true, defaultValue: "''::text" },
  wrong_count: { type: 'integer', notNull: true, defaultValue: '1' },
  resolved: { type: 'boolean', notNull: true, defaultValue: 'false' },
  created_at: { type: 'timestamp with time zone', notNull: true, defaultValue: 'now()' },
  last_wrong_at: { type: 'timestamp with time zone', notNull: true, defaultValue: 'now()' },
  updated_at: { type: 'timestamp with time zone', notNull: true, defaultValue: 'now()' },
};

const expectedConstraints = [
  'foreign key (user_id) references users(id) on delete cascade',
  'primary key (id)',
  'unique (user_id, source, question_id)',
];

const expectedIndexes = [
  'create unique index mistake_notes_pkey on mistake_notes using btree (id)',
  'create index mistake_notes_user on mistake_notes using btree (user_id, resolved, last_wrong_at desc)',
  'create unique index mistake_notes_user_id_source_question_id_key on mistake_notes using btree (user_id, source, question_id)',
];

function normalizeSql(value: string) {
  return value.replace(/"/g, '').replace(/\bpublic\./gi, '').replace(/\s+/g, ' ').trim().toLowerCase();
}

function sameMembers(actual: string[], expected: string[]) {
  return actual.length === expected.length && new Set(actual).size === expected.length &&
    expected.every((value) => actual.includes(value));
}

export async function assertMistakeNotesSchema(db: MigrationDatabase) {
  const columns = (await db.query<{
    attname: string; type: string; attnotnull: boolean; default_expr: string | null;
    attgenerated: string; attidentity: string;
  }>(`
    SELECT a.attname, format_type(a.atttypid,a.atttypmod) AS type,
      a.attnotnull, a.attgenerated, a.attidentity,
      pg_get_expr(d.adbin,d.adrelid) AS default_expr
    FROM pg_attribute a
    LEFT JOIN pg_attrdef d ON d.adrelid=a.attrelid AND d.adnum=a.attnum
    WHERE a.attrelid='public.mistake_notes'::regclass AND a.attnum>0 AND NOT a.attisdropped
  `)).rows;
  if (columns.length !== Object.keys(expectedColumns).length || columns.some((column) => {
    const expected = expectedColumns[column.attname];
    return !expected || column.type !== expected.type || column.attnotnull !== expected.notNull ||
      column.default_expr !== expected.defaultValue || column.attgenerated !== '' || column.attidentity !== '';
  })) throw new Error('mistake_notes kolonları, tipleri veya varsayılanları beklenen yapıda değil.');

  const constraints = (await db.query<{ definition: string }>(`
    SELECT pg_get_constraintdef(oid) AS definition FROM pg_constraint
    WHERE conrelid='public.mistake_notes'::regclass AND contype <> 'n'
  `)).rows.map((row) => normalizeSql(row.definition));
  if (!sameMembers(constraints, expectedConstraints)) {
    throw new Error('mistake_notes foreign key veya benzersiz kısıtları beklenen yapıda değil.');
  }

  const indexRows = (await db.query<{ definition: string; indisvalid: boolean; indisready: boolean }>(`
    SELECT pg_get_indexdef(indexrelid) AS definition, indisvalid, indisready FROM pg_index
    WHERE indrelid='public.mistake_notes'::regclass
  `)).rows;
  if (indexRows.some((row) => !row.indisvalid || !row.indisready) ||
      !sameMembers(indexRows.map((row) => normalizeSql(row.definition)), expectedIndexes)) {
    throw new Error('mistake_notes indeksleri beklenen yapıda değil.');
  }

  const security = (await db.query<{
    relrowsecurity: boolean; relforcerowsecurity: boolean; public_grant: boolean;
    server_select: boolean; server_insert: boolean; server_update: boolean;
  }>(`
    SELECT c.relrowsecurity,c.relforcerowsecurity,
      EXISTS(SELECT 1 FROM aclexplode(COALESCE(c.relacl,acldefault('r',c.relowner))) acl WHERE acl.grantee=0) AS public_grant,
      has_table_privilege(current_user,c.oid,'SELECT') AS server_select,
      has_table_privilege(current_user,c.oid,'INSERT') AS server_insert,
      has_table_privilege(current_user,c.oid,'UPDATE') AS server_update
    FROM pg_class c WHERE c.oid='public.mistake_notes'::regclass
  `)).rows[0];
  if (!security?.relrowsecurity || security.relforcerowsecurity || security.public_grant ||
      !security.server_select || !security.server_insert || !security.server_update) {
    throw new Error('mistake_notes RLS, PUBLIC veya sunucu erişimi beklenen durumda değil.');
  }

  const grants = (await db.query<{ granted: boolean }>(`
    SELECT has_table_privilege(role_name,'public.mistake_notes',privilege) AS granted
    FROM (VALUES ('anon'),('authenticated')) AS roles(role_name)
    CROSS JOIN (VALUES ('SELECT'),('INSERT'),('UPDATE'),('DELETE'),('TRUNCATE'),('REFERENCES'),('TRIGGER')) AS privileges(privilege)
  `)).rows;
  if (grants.length !== 14 || grants.some((row) => row.granted)) {
    throw new Error('mistake_notes anon/authenticated doğrudan izinleri açık.');
  }
  const policies = (await db.query<{ count: string }>(`
    SELECT count(*)::text AS count FROM pg_policies
    WHERE schemaname='public' AND tablename='mistake_notes'
  `)).rows[0];
  if (policies?.count !== '0') throw new Error('mistake_notes üzerinde beklenmeyen RLS policy var.');
}

async function secureNewTable(db: MigrationDatabase) {
  await db.query('ALTER TABLE public.mistake_notes ENABLE ROW LEVEL SECURITY');
  await db.query('REVOKE ALL ON TABLE public.mistake_notes FROM PUBLIC, anon, authenticated');
}

async function executeSchema(db: MigrationDatabase, schema: string) {
  // Static schema definitions are separated by statement-ending semicolons.
  for (const statement of schema.split(/;\s*(?:\r?\n|$)/).map((part) => part.trim()).filter(Boolean)) {
    await db.query(statement);
  }
}

export async function migrateToV2(db: MigrationDatabase) {
  await db.query('BEGIN');
  let changed = false;
  try {
    await db.query('SELECT pg_advisory_xact_lock(489664391)');
    const existing = (await db.query<{ table_name: string }>(
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE'",
    )).rows;
    const names = new Set(existing.map((row) => row.table_name));
    if (names.size === 0) {
      await executeSchema(db, initialSchemaV1);
      await executeSchema(db, mistakeNotesSchema);
      await secureNewTable(db);
      await assertMistakeNotesSchema(db);
      await db.query('INSERT INTO schema_migrations(version) VALUES(2)');
      changed = true;
    } else {
      if (v1Tables.some((table) => !names.has(table))) {
        throw new Error('Mevcut v1 şeması kısmi veya farklı; migration durduruldu.');
      }
      const versions = (await db.query<{ version: number }>('SELECT version FROM schema_migrations')).rows;
      const hasV1 = versions.some((row) => row.version === 1);
      const hasV2 = versions.some((row) => row.version === 2);
      if (!hasV1 || versions.some((row) => ![1, 2].includes(row.version))) {
        throw new Error('Mevcut şema sürümü tanınmıyor.');
      }
      if (!names.has('mistake_notes')) {
        if (hasV2) throw new Error('v2 sürüm kaydı var ancak mistake_notes tablosu yok.');
        await executeSchema(db, mistakeNotesSchema);
        await secureNewTable(db);
        changed = true;
      }
      await assertMistakeNotesSchema(db);
      if (!hasV2) {
        await db.query('INSERT INTO schema_migrations(version) VALUES(2)');
        changed = true;
      }
    }
    await db.query('COMMIT');
    return changed;
  } catch (error) {
    await db.query('ROLLBACK').catch(() => {});
    throw error;
  }
}
