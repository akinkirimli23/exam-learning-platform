import { afterEach, describe, expect, it } from 'vitest';
import { databaseMatchesSupabaseProject, postgresConnectionConfig, state } from '../server/db';

const originalUrl = process.env.DATABASE_URL;

afterEach(() => {
  if (originalUrl === undefined) delete process.env.DATABASE_URL;
  else process.env.DATABASE_URL = originalUrl;
});

describe('uzak PostgreSQL bağlantısı', () => {
  it('veritabanı ve Supabase proje kimliğini değerleri açığa çıkarmadan karşılaştırır', () => {
    expect(databaseMatchesSupabaseProject('postgresql://postgres.stage-ref:secret@pooler.supabase.com:6543/postgres','https://stage-ref.supabase.co')).toBe(true);
    expect(databaseMatchesSupabaseProject('postgresql://postgres.production-ref:secret@pooler.supabase.com:6543/postgres','https://stage-ref.supabase.co')).toBe(false);
    expect(databaseMatchesSupabaseProject(undefined,'https://stage-ref.supabase.co')).toBeNull();
  });

  it('TLS modu olmayan uzak veritabanına bağlanmayı reddeder', async () => {
    process.env.DATABASE_URL = 'postgresql://test:test@database.example:6543/postgres';
    await expect(state()).rejects.toMatchObject({ code: 'DATABASE_CA_MISSING' });
  });

  it('geçersiz protokolü ağ isteğinden önce reddeder', async () => {
    process.env.DATABASE_URL = 'http://database.example:6543/postgres?sslmode=require';
    await expect(state()).rejects.toThrow(/PostgreSQL/);
  });

  it('özel CA kullanırken URL TLS parametresinin CA ayarını ezmesini önler', () => {
    const ca = '-----BEGIN CERTIFICATE-----\nTEST\n-----END CERTIFICATE-----';
    const config = postgresConnectionConfig(
      'postgresql://test:test@database.example:6543/postgres?sslmode=verify-full',
      Buffer.from(ca).toString('base64'),
    );
    expect(config.connectionString).not.toContain('sslmode=');
    expect(config.ssl).toMatchObject({ ca, rejectUnauthorized: true, servername: 'database.example' });
  });

  it('ayrı CA ile doğrulanan TLS için URL sslmode parametresini zorunlu tutmaz', () => {
    const ca = '-----BEGIN CERTIFICATE-----\nTEST\n-----END CERTIFICATE-----';
    const config = postgresConnectionConfig(
      'postgresql://test:test@database.example:6543/postgres',
      Buffer.from(ca).toString('base64'),
    );
    expect(config.ssl).toMatchObject({ ca, rejectUnauthorized: true, servername: 'database.example' });
  });

  it('ayrı CA bulunsa da açıkça kapatılmış TLS modunu reddeder', () => {
    const ca = Buffer.from('-----BEGIN CERTIFICATE-----\nTEST\n-----END CERTIFICATE-----').toString('base64');
    expect(() => postgresConnectionConfig('postgresql://test:test@database.example:6543/postgres?sslmode=disable', ca))
      .toThrow(/TLS/);
    expect(() => postgresConnectionConfig('postgresql://test:test@database.example:6543/postgres?sslmode=disable', ca))
      .toThrowError(expect.objectContaining({ code: 'DATABASE_TLS_MODE_UNSAFE' }));
  });
});
