import { readFileSync } from 'node:fs';
import path from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { LearningInfographic, LearningSlides, LearningVideo } from '../components/learning-media';
import { buoyancyConceptMap, flattenConceptNodes } from '../shared/buoyancy-concepts';
import { createBuoyancyMedia } from '../shared/content/physics/buoyancy/media';

const configuredMedia = createBuoyancyMedia({
  videoUrl: 'https://cdn.example.test/buoyancy/video.mp4',
  videoThumbnailUrl: 'https://cdn.example.test/buoyancy/poster.png',
  slidesUrl: 'https://cdn.example.test/buoyancy/slides.pdf',
  infographicUrl: 'https://cdn.example.test/buoyancy/infographic.png',
});

describe('Kaldırma Kuvveti medya altyapısı', () => {
  it('metadata şemasını, sıralamayı ve canonical conceptId ilişkilerini doğrular', () => {
    const canonicalIds = new Set(flattenConceptNodes(buoyancyConceptMap).map((node) => node.id));
    const emptyMedia = createBuoyancyMedia();

    expect(emptyMedia.map((item) => item.type)).toEqual(['video', 'slides', 'infographic']);
    expect(emptyMedia.every((item) => item.url === '')).toBe(true);
    expect(configuredMedia.map((item) => item.order)).toEqual([1, 2, 3]);
    for (const item of configuredMedia) {
      expect(item.topicId).toBe('buoyancy');
      expect(item.conceptIds.every((conceptId) => canonicalIds.has(conceptId))).toBe(true);
    }
    expect(() => createBuoyancyMedia({ videoUrl: 'geçersiz-url' })).toThrow();
  });

  it('URL varsa native video player, yoksa yüklenmemiş durumu render eder', () => {
    const configuredVideo = configuredMedia.find((item) => item.type === 'video')!;
    const emptyVideo = createBuoyancyMedia().find((item) => item.type === 'video')!;
    const player = renderToStaticMarkup(<LearningVideo item={configuredVideo} />);
    const empty = renderToStaticMarkup(<LearningVideo item={emptyVideo} />);

    expect(player).toContain('<video');
    expect(player).toContain('controls=""');
    expect(player).toContain('https://cdn.example.test/buoyancy/video.mp4');
    expect(empty).not.toContain('<video');
    expect(empty).toContain('İçerik henüz yüklenmedi');
  });

  it('PDF bağlantısını yeni sekmeye, infografiği responsive önizlemeye hazırlar', () => {
    const slides = configuredMedia.find((item) => item.type === 'slides')!;
    const infographic = configuredMedia.find((item) => item.type === 'infographic')!;
    const slidesMarkup = renderToStaticMarkup(<LearningSlides item={slides} />);
    const infographicMarkup = renderToStaticMarkup(<LearningInfographic item={infographic} />);
    const css = readFileSync(path.join(process.cwd(), 'app', 'globals.css'), 'utf8');

    expect(slidesMarkup).toContain('href="https://cdn.example.test/buoyancy/slides.pdf"');
    expect(slidesMarkup).toContain('target="_blank"');
    expect(infographicMarkup).toContain('class="infographic-preview"');
    expect(infographicMarkup).toContain('src="https://cdn.example.test/buoyancy/infographic.png"');
    expect(css).toMatch(/\.infographic-preview img\{[^}]*width:100%[^}]*height:auto/);
  });
});
