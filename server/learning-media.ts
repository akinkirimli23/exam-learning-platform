import { signedLearningMediaSchema, type SignedLearningMedia } from '@/shared/contracts';
import { getLearningMediaById } from '@/shared/content/learning-media';
import { fail } from './core';

export const LEARNING_MEDIA_URL_TTL_SECONDS = 3600;

type SigningEnvironment = {
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
};

type SigningOptions = {
  environment?: SigningEnvironment;
  fetchImplementation?: typeof fetch;
};

function encodedObjectPath(path: string) {
  return path.split('/').map(encodeURIComponent).join('/');
}

export async function getSignedLearningMediaUrl(
  mediaId: string,
  options: SigningOptions = {},
): Promise<SignedLearningMedia> {
  const media = getLearningMediaById(mediaId);
  if (!media) return fail(404, 'Medya bulunamadı.');

  const environment = options.environment ?? process.env;
  const supabaseUrl = environment.SUPABASE_URL?.trim().replace(/\/+$/, '');
  const serviceRoleKey = environment.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!supabaseUrl || !serviceRoleKey) {
    return fail(503, 'İçerik bağlantısı şu anda kullanılamıyor.');
  }

  let response: Response;
  try {
    response = await (options.fetchImplementation ?? fetch)(
      `${supabaseUrl}/storage/v1/object/sign/${encodeURIComponent(media.bucket)}/${encodedObjectPath(media.objectPath)}`,
      {
        method: 'POST',
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ expiresIn: LEARNING_MEDIA_URL_TTL_SECONDS }),
        cache: 'no-store',
      },
    );
  } catch {
    return fail(502, 'İçerik bağlantısı şu anda oluşturulamıyor.');
  }

  if (!response.ok) return fail(502, 'İçerik bağlantısı şu anda oluşturulamıyor.');

  let signedPath: unknown;
  try {
    const payload = await response.json() as { signedURL?: unknown; signedUrl?: unknown };
    signedPath = payload.signedURL ?? payload.signedUrl;
  } catch {
    return fail(502, 'İçerik bağlantısı şu anda oluşturulamıyor.');
  }
  if (typeof signedPath !== 'string' || !signedPath) {
    return fail(502, 'İçerik bağlantısı şu anda oluşturulamıyor.');
  }

  const url = /^https?:\/\//i.test(signedPath)
    ? new URL(signedPath).toString()
    : signedPath.startsWith('/storage/v1/')
      ? new URL(signedPath, `${supabaseUrl}/`).toString()
      : new URL(`storage/v1/${signedPath.replace(/^\/+/, '')}`, `${supabaseUrl}/`).toString();
  const parsed = signedLearningMediaSchema.safeParse({
    url,
    expiresIn: LEARNING_MEDIA_URL_TTL_SECONDS,
  });
  if (!parsed.success) return fail(502, 'İçerik bağlantısı şu anda oluşturulamıyor.');
  return parsed.data;
}
