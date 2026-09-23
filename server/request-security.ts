import { fail } from './core';

const rejectedOrigin = 'Bu kaynaktan gelen işlem kabul edilmedi. Uygulamayı güncel adresinden açıp tekrar dene.';

export function appOrigin(): URL {
  const production = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
  const configured = process.env.APP_ORIGIN?.trim() || (production ? '' : 'http://localhost:3000');
  try {
    const url = new URL(configured);
    if (!['http:', 'https:'].includes(url.protocol) || (production && url.protocol !== 'https:') ||
        !/^[a-z0-9.:-]+$/i.test(url.host) ||
        url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new Error();
    return new URL(url.origin);
  } catch {
    return fail(503, 'Uygulamanın adres ayarı tamamlanmamış. Lütfen daha sonra tekrar dene.');
  }
}

function matchesHost(host: string, expected: URL): boolean {
  if (/[\s,/@\\?#]/.test(host)) return false;
  try { return new URL(`${expected.protocol}//${host}`).origin === expected.origin; }
  catch { return false; }
}

export function assertTrustedRequest(request: Request): void {
  if (['GET', 'HEAD'].includes(request.method)) return;
  const expected = appOrigin();
  const origin = request.headers.get('origin');
  if (origin && origin !== expected.origin) fail(403, rejectedOrigin);
  if (request.headers.get('sec-fetch-site') === 'cross-site') fail(403, rejectedOrigin);

  // A request header can confirm the configured destination, never add a trusted origin.
  const host = request.headers.get('host');
  const forwardedHost = process.env.VERCEL === '1' ? request.headers.get('x-forwarded-host') : null;
  if (!matchesHost(host || forwardedHost || new URL(request.url).host, expected) ||
      (forwardedHost && !matchesHost(forwardedHost, expected))) fail(403, rejectedOrigin);
  const forwardedProto = process.env.VERCEL === '1' ? request.headers.get('x-forwarded-proto') : null;
  if (forwardedProto && `${forwardedProto}:` !== expected.protocol) fail(403, rejectedOrigin);

  // Native clients use bearer tokens. Cookie-authenticated writes need a browser Origin.
  if (!origin && request.headers.get('cookie') && !request.headers.get('authorization')?.startsWith('Bearer ')) {
    fail(403, 'İşlem kaynağı doğrulanamadı. Sayfayı yenileyip tekrar dene.');
  }
}

export function secureSessionCookie(request: Request): boolean {
  return process.env.NODE_ENV === 'production' || process.env.VERCEL === '1' || new URL(request.url).protocol === 'https:';
}
