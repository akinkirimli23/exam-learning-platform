import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { appOrigin, assertTrustedRequest, secureSessionCookie } from '../server/request-security';
import { safeErrorCode } from '../server/safe-error';

const origin = 'https://exam-learning-platform-two.vercel.app';
const host = new URL(origin).host;
function request(headers: Record<string, string | undefined> = {}, url = `${origin}/api/auth/register`) {
  const extra: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) if (value !== undefined) extra[key] = value;
  return new Request(url, { method: 'POST', headers: { Origin: origin, Host: host, 'Sec-Fetch-Site': 'same-origin', ...extra } });
}
beforeEach(() => { vi.stubEnv('APP_ORIGIN', origin); vi.stubEnv('NODE_ENV', 'production'); vi.stubEnv('VERCEL', '1'); });
afterEach(() => vi.unstubAllEnvs());

describe('production origin ve proxy doğrulaması', () => {
  it('APP_ORIGIN boşluk ve sondaki slash biçimini normalize eder', () => {
    vi.stubEnv('APP_ORIGIN', ` ${origin}/ \n`);
    expect(appOrigin().origin).toBe(origin);
    expect(() => assertTrustedRequest(request())).not.toThrow();
  });
  it('yalnız güvenilir origin/host ile Vercel HTTPS proxy isteğini kabul eder', () => {
    const proxied = request({ 'X-Forwarded-Host': host, 'X-Forwarded-Proto': 'https' }, 'http://internal:3000/api/auth/register');
    expect(() => assertTrustedRequest(proxied)).not.toThrow();
    expect(secureSessionCookie(proxied)).toBe(true);
  });
  it.each([
    { Origin: 'https://evil.example' },
    { Origin: 'https://another-project.vercel.app', Host: 'another-project.vercel.app', 'X-Forwarded-Host': 'another-project.vercel.app' },
    { Origin: 'null' },
    { Host: 'evil.example' },
    { 'X-Forwarded-Host': 'evil.example' },
    { 'X-Forwarded-Host': `${host}, evil.example` },
    { 'X-Forwarded-Host': `${host}/evil` },
    { 'X-Forwarded-Proto': 'http' },
    { 'Sec-Fetch-Site': 'cross-site' },
  ])('güvenilmeyen origin, host veya proxy başlığını reddeder: %j', headers => {
    expect(() => assertTrustedRequest(request(headers))).toThrow(/kaynaktan/);
  });
  it.each(['', 'http://localhost:3000', `${origin}/some-path`, `${origin}?query=1`, 'https://*.vercel.app', `https://user:password@${host}`])('geçersiz production ayarında erişimi kapalı tutar: %s', value => {
    vi.stubEnv('APP_ORIGIN', value);
    expect(() => assertTrustedRequest(request())).toThrow(/adres ayarı/);
  });
  it('Origin olmayan çerez isteklerini reddeder; rastgele Authorization başlığı geçiş sağlamaz', () => {
    for (const authorization of ['', 'Basic ignored']) {
      const r = new Request(`${origin}/api/auth/logout`, { method: 'POST', headers: { Cookie: 'ivme_session=test', Authorization: authorization } });
      expect(() => assertTrustedRequest(r)).toThrow(/kaynağı/);
    }
  });
  it('native bearer ve çerezsiz native giriş istemcilerini korur', () => {
    expect(() => assertTrustedRequest(new Request(`${origin}/api/auth/login`, { method: 'POST' }))).not.toThrow();
    expect(() => assertTrustedRequest(new Request(`${origin}/api/settings`, { method: 'PUT', headers: { Authorization: 'Bearer test' } }))).not.toThrow();
  });
  it('bilinmeyen hata verilerini log için geri döndürmez', () => {
    expect(safeErrorCode({ code: '28P01', message: 'private connection details' })).toBe('28P01');
    expect(safeErrorCode({ code: 'private-value', message: 'private connection details' })).toBe('UNCLASSIFIED');
    expect(safeErrorCode({ errors: [{ code: 'ENOTFOUND', message: 'private connection details' }] })).toBe('ENOTFOUND');
  });
});
