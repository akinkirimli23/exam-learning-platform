import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { randomUUID } from 'node:crypto';
import { handle } from '../server/api';
import { closeDb, query } from '../server/db';
import { hash, passwordHash, verifyPassword } from '../server/core';

const origin = 'https://exam-learning-platform-two.vercel.app';
const validPassword = 'Abcdef1!';
const email = () => `auth-${randomUUID()}@example.invalid`;
async function call(path: string, method = 'GET', body?: unknown, cookie = '') {
  const response = await handle(new Request(`${origin}/api/${path}`, {
    method, headers: { Origin: origin, Host: new URL(origin).host, 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  }));
  return { response, data: await response.json(), cookie: response.headers.get('set-cookie')?.split(';')[0] || '' };
}
const register = (address = email(), password = validPassword) => call('auth/register', 'POST', { name: 'Test Öğrenci', email: address, password, adult: true });

beforeAll(async () => {
  vi.stubEnv('DATABASE_URL', '');
  vi.stubEnv('VERCEL', '');
  vi.stubEnv('DATA_DIR', ':memory:');
  vi.stubEnv('APP_ORIGIN', origin);
  await query('SELECT 1');
});
afterAll(async () => { await closeDb(); vi.unstubAllEnvs(); });

describe('öğrenci kayıt, giriş ve oturum akışı', () => {
  it('tam 8 karakterlik geçerli şifreyle kayıt olur; hash ve güvenli oturum üretir', async () => {
    const created = await register();
    expect(created.response.status).toBe(200);
    expect(created.data.user.role).toBe('student');
    expect('password_hash' in created.data.user || 'token' in created.data).toBe(false);
    const cookie = created.response.headers.get('set-cookie') || '';
    for (const flag of ['HttpOnly', 'Secure', 'SameSite=Lax', 'Path=/']) expect(cookie.includes(flag)).toBe(true);
    const stored = (await query('SELECT password_hash FROM users WHERE id=$1', [created.data.user.id])).rows[0];
    expect(await verifyPassword(validPassword, stored.password_hash)).toBe(true);
    expect(stored.password_hash === validPassword).toBe(false);
    const token = created.cookie.slice('ivme_session='.length);
    const session = (await query('SELECT token_hash FROM sessions WHERE user_id=$1', [created.data.user.id])).rows[0];
    expect(session.token_hash === hash(token)).toBe(true);
    const own = await call('auth/me', 'GET', undefined, created.cookie);
    expect(own.response.status).toBe(200);
    expect(own.data.user.id === created.data.user.id).toBe(true);
  });

  it.each([
    ['7 karakter', 'Abcde1!', 'en az 8 karakter'],
    ['rakam yok', 'Abcdefg!', 'en az 1 rakam'],
    ['sembol yok', 'Abcdef12', 'en az 1 özel karakter'],
    ['yalnız boşluk', 'Abcdef1 ', 'boşluk özel karakter sayılmaz'],
    ['Unicode boşluğu', 'Abcdef1\u00a0', 'boşluk özel karakter sayılmaz'],
    ['Türkçe harf sembol değildir', 'Çalışma1', 'en az 1 özel karakter'],
  ])('%s içeren geçersiz kaydı reddeder', async (_name, password, message) => {
    const address = email();
    const rejected = await register(address, password);
    expect(rejected.response.status).toBe(400);
    expect(rejected.data.error).toContain(message);
    expect((await query('SELECT id FROM users WHERE email=$1', [address])).rows).toHaveLength(0);
  });

  it('aynı e-posta için tekrar ve eşzamanlı kayıtları 409 ile reddeder', async () => {
    const address = email();
    const results = await Promise.all([register(address), register(address.toUpperCase())]);
    expect(results.map(r => r.response.status).sort()).toEqual([200, 409]);
    const again = await register(address);
    expect(again.response.status).toBe(409);
    expect(again.data.error).toContain('hesap zaten var');
    expect((await query('SELECT id FROM users WHERE email=$1', [address])).rows).toHaveLength(1);
  });

  it('yanlış şifreyi reddeder; giriş, kendi hesabına erişim ve çıkış çalışır', async () => {
    const address = email();
    const created = await register(address);
    const wrong = await call('auth/login', 'POST', { email: address, password: 'yanlış' });
    expect(wrong.response.status).toBe(401);
    expect(wrong.data.error).toBe('E-posta veya şifre yanlış.');
    const login = await call('auth/login', 'POST', { email: address, password: validPassword });
    expect(login.response.status).toBe(200);
    const own = await call('overview', 'GET', undefined, login.cookie);
    expect(own.response.status).toBe(200);
    expect(own.data.user.id === created.data.user.id).toBe(true);
    const other = await register();
    const otherMe = await call('auth/me', 'GET', undefined, other.cookie);
    expect(otherMe.data.user.id === created.data.user.id).toBe(false);
    const logout = await call('auth/logout', 'POST', {}, login.cookie);
    expect(logout.response.status).toBe(200);
    expect(logout.response.headers.get('set-cookie')?.includes('Max-Age=0')).toBe(true);
    expect((await call('auth/me', 'GET', undefined, login.cookie)).response.status).toBe(401);
    expect((await call('auth/me')).response.status).toBe(401);
  });

  it('eski kurallarla oluşturulmuş şifreyle giriş yapılabilir; yeni şifre ortak kurala uyar', async () => {
    const address = email();
    const oldPassword = 'eskisifremvar';
    await query('INSERT INTO users(id,email,name,password_hash,adult_confirmed) VALUES($1,$2,$3,$4,true)',
      [randomUUID(), address, 'Eski Öğrenci', await passwordHash(oldPassword)]);
    const login = await call('auth/login', 'POST', { email: address, password: oldPassword });
    expect(login.response.status).toBe(200);
    expect((await call('auth/password', 'POST', { current: oldPassword, next: 'Abcdef12' }, login.cookie)).response.status).toBe(400);
    expect((await call('auth/password', 'POST', { current: oldPassword, next: validPassword }, login.cookie)).response.status).toBe(200);
    expect((await call('auth/me', 'GET', undefined, login.cookie)).response.status).toBe(401);
    expect((await call('auth/login', 'POST', { email: address, password: oldPassword })).response.status).toBe(401);
    expect((await call('auth/login', 'POST', { email: address, password: validPassword })).response.status).toBe(200);
  });
});
