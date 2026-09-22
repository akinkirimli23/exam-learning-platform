import { afterEach, describe, expect, it } from 'vitest';
import { postgresConnectionConfig, state } from '../server/db';

const originalUrl = process.env.DATABASE_URL;

afterEach(() => {
  if (originalUrl === undefined) delete process.env.DATABASE_URL;
  else process.env.DATABASE_URL = originalUrl;
});

describe('uzak PostgreSQL bağlantısı', () => {
  it('TLS modu olmayan uzak veritabanına bağlanmayı reddeder', async () => {
    process.env.DATABASE_URL = 'postgresql://test:test@database.example:6543/postgres';
    await expect(state()).rejects.toThrow(/TLS/);
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
});
