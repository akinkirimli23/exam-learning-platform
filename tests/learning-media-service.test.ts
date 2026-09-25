import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import {
  getSignedLearningMediaUrl,
  LEARNING_MEDIA_URL_TTL_SECONDS,
} from '../server/learning-media';

const environment = {
  SUPABASE_URL: 'https://project.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
};

describe('private learning media signed URL service', () => {
  it('known mediaId için registry içindeki doğru bucket ve objectPath ile imzalar', async () => {
    const fetchImplementation = vi.fn<typeof fetch>(async () => Response.json({
      signedURL: '/object/sign/learning-media/video?token=signed-test-token',
    }));

    const result = await getSignedLearningMediaUrl('buoyancy-video-physics', {
      environment,
      fetchImplementation,
    });

    expect(fetchImplementation).toHaveBeenCalledOnce();
    const [requestUrl, requestInit] = fetchImplementation.mock.calls[0];
    expect(requestUrl).toBe(
      'https://project.supabase.co/storage/v1/object/sign/learning-media/physics/buoyancy/video/Kaldirma_Kuvvetinin_Fizigi.mp4',
    );
    expect(requestInit?.method).toBe('POST');
    expect(requestInit?.body).toBe(JSON.stringify({ expiresIn: LEARNING_MEDIA_URL_TTL_SECONDS }));
    const headers = new Headers(requestInit?.headers);
    expect(headers.get('apikey')).toBe(environment.SUPABASE_SERVICE_ROLE_KEY);
    expect(headers.get('authorization')).toBe(`Bearer ${environment.SUPABASE_SERVICE_ROLE_KEY}`);
    expect(result).toEqual({
      url: 'https://project.supabase.co/storage/v1/object/sign/learning-media/video?token=signed-test-token',
      expiresIn: 3600,
    });
    expect(JSON.stringify(result)).not.toContain(environment.SUPABASE_SERVICE_ROLE_KEY);
  });

  it('unknown mediaId ve arbitrary objectPath değerlerini Storage çağrısı yapmadan reddeder', async () => {
    const fetchImplementation = vi.fn<typeof fetch>();

    await expect(getSignedLearningMediaUrl('not-a-media-id', { environment, fetchImplementation }))
      .rejects.toMatchObject({ status: 404, message: 'Medya bulunamadı.' });
    await expect(getSignedLearningMediaUrl('physics/buoyancy/video/another.mp4', { environment, fetchImplementation }))
      .rejects.toMatchObject({ status: 404, message: 'Medya bulunamadı.' });
    expect(fetchImplementation).not.toHaveBeenCalled();
  });

  it('Basınç videolarını yalnız registry içindeki private objectPath ile imzalar', async () => {
    const fetchImplementation = vi.fn<typeof fetch>(async () => Response.json({
      signedURL: '/object/sign/learning-media/video?token=signed-test-token',
    }));
    const cases = [
      ['pressure-video-solid', 'Kati_basinci.mp4'],
      ['pressure-video-liquid', 'Sivi_Basinci.mp4'],
      ['pressure-video-gas', 'Gaz_basinci.mp4'],
    ] as const;
    for (const [id, name] of cases) {
      const signed = await getSignedLearningMediaUrl(id, { environment, fetchImplementation });
      expect(fetchImplementation.mock.lastCall?.[0]).toBe(
        `https://project.supabase.co/storage/v1/object/sign/learning-media/physics/pressure/video/${name}`,
      );
      expect(JSON.stringify(signed)).not.toContain(environment.SUPABASE_SERVICE_ROLE_KEY);
    }
  });

  it('eksik yapılandırma ve Storage hatasını secret içermeyen kontrollü hataya çevirir', async () => {
    await expect(getSignedLearningMediaUrl('buoyancy-video-physics', { environment: {} }))
      .rejects.toMatchObject({ status: 503, message: 'İçerik bağlantısı şu anda kullanılamıyor.' });

    const fetchImplementation = vi.fn<typeof fetch>(async () => new Response('private provider error', { status: 500 }));
    const request = getSignedLearningMediaUrl('buoyancy-video-physics', {
      environment,
      fetchImplementation,
    });
    await expect(request).rejects.toMatchObject({
      status: 502,
      message: 'İçerik bağlantısı şu anda oluşturulamıyor.',
    });
  });

  it('service role değişkenini client tarafı kaynaklarına taşımaz', () => {
    const clientSources = [
      'components/learning-media.tsx',
      'components/buoyancy-learning-content.tsx',
      'components/learning-app.tsx',
      'shared/content/physics/buoyancy/media.ts',
      'shared/content/physics/pressure/media.ts',
    ].map((file) => readFileSync(path.join(process.cwd(), file), 'utf8')).join('\n');

    expect(clientSources).not.toContain('SUPABASE_SERVICE_ROLE_KEY');
  });
});
