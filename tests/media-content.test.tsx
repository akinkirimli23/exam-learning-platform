import { readFileSync } from 'node:fs';
import path from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  LearningInfographicView,
  LearningSlidesView,
  LearningVideoView,
  LearningMaterials,
} from '../components/learning-media';
import { buoyancyConceptMap, flattenConceptNodes } from '../shared/buoyancy-concepts';
import { createBuoyancyMedia } from '../shared/content/physics/buoyancy/media';
import { pressureMedia } from '../shared/content/physics/pressure/media';

const configuredMedia = createBuoyancyMedia();
const signedUrl = 'https://project.supabase.co/storage/v1/object/sign/learning-media/example?token=test';
const ready = { status: 'ready', url: signedUrl } as const;

describe('Kaldırma Kuvveti medya altyapısı', () => {
  it('metadata şemasını, storage yollarını ve canonical conceptId ilişkilerini doğrular', () => {
    const canonicalIds = new Set(flattenConceptNodes(buoyancyConceptMap).map((node) => node.id));

    expect(configuredMedia.map((item) => item.type)).toEqual(['video', 'slides', 'infographic']);
    expect(configuredMedia.map((item) => item.order)).toEqual([1, 2, 3]);
    expect(configuredMedia.map((item) => item.objectPath)).toEqual([
      'physics/buoyancy/video/Kaldirma_Kuvvetinin_Fizigi.mp4',
      'physics/buoyancy/slides/Arsimet_ve_Kaldirma_Kuvveti.pdf',
      'physics/buoyancy/infographic/Arsimet_Prensibi_ve_Kaldirma_Kuvveti.png',
    ]);
    for (const item of configuredMedia) {
      expect(item.topicId).toBe('buoyancy');
      expect(item.bucket).toBe('learning-media');
      expect(item.conceptIds.every((conceptId) => canonicalIds.has(conceptId))).toBe(true);
    }
  });

  it('signed URL ile native video player, hata durumunda kontrollü mesaj render eder', () => {
    const configuredVideo = configuredMedia.find((item) => item.type === 'video')!;
    const player = renderToStaticMarkup(<LearningVideoView item={configuredVideo} state={ready} />);
    const empty = renderToStaticMarkup(<LearningVideoView item={configuredVideo} state={{ status: 'error' }} />);
    const loading = renderToStaticMarkup(<LearningVideoView item={configuredVideo} state={{ status: 'loading' }} />);

    expect(player).toContain('<video');
    expect(player).toContain('controls=""');
    expect(player).toContain(signedUrl.replaceAll('&', '&amp;'));
    expect(empty).not.toContain('<video');
    expect(empty).toContain('İçerik henüz yüklenmedi');
    expect(loading).toContain('İçerik hazırlanıyor');
  });

  it('PDF signed URL bağlantısını ve infografik signed URL önizlemesini render eder', () => {
    const slides = configuredMedia.find((item) => item.type === 'slides')!;
    const infographic = configuredMedia.find((item) => item.type === 'infographic')!;
    const slidesMarkup = renderToStaticMarkup(<LearningSlidesView item={slides} state={ready} />);
    const infographicMarkup = renderToStaticMarkup(<LearningInfographicView item={infographic} state={ready} />);
    const css = readFileSync(path.join(process.cwd(), 'app', 'globals.css'), 'utf8');

    expect(slidesMarkup).toContain(`href="${signedUrl.replaceAll('&', '&amp;')}"`);
    expect(slidesMarkup).toContain('target="_blank"');
    expect(infographicMarkup).toContain('class="infographic-preview"');
    expect(infographicMarkup).toContain(`src="${signedUrl.replaceAll('&', '&amp;')}"`);
    expect(css).toMatch(/\.infographic-preview img\{[^}]*width:100%[^}]*height:auto/);
  });

  it('birden fazla infografiği ayrı materyal kartları olarak gösterir', () => {
    const infographic = configuredMedia.find((item) => item.type === 'infographic')!;
    const markup = renderToStaticMarkup(<LearningMaterials items={[
      infographic,
      { ...infographic, id: 'second-infographic', title: 'İkinci görsel', order: 4 },
    ]} />);
    expect(markup).toContain(infographic.title);
    expect(markup).toContain('İkinci görsel');
    expect(renderToStaticMarkup(<LearningMaterials items={[]} />)).toBe('');
  });

  it('video süresini her oynatıcı kartında ayrı gösterir', () => {
    const video = configuredMedia.find((item) => item.type === 'video')!;
    const markup = renderToStaticMarkup(<LearningVideoView item={{ ...video, durationSeconds: 185 }} state={ready} />);
    expect(markup).toContain('Süre: 3:05');
    expect(markup).toContain('playsInline');
    expect(markup).toContain('controls=""');
  });

  it('incelenmiş videoda düzeltme kartlarını açıklar, rehber ve iki görseli birlikte gösterir', () => {
    const video = pressureMedia.find(item => item.type === 'video')!;
    const markup = renderToStaticMarkup(<LearningVideoView item={video} state={ready} />);
    expect(markup).toContain('düzeltme kartları');
    const materials = renderToStaticMarkup(<LearningMaterials items={pressureMedia} />);
    expect(materials).toContain('Basınç ve Kuvvet Ders Rehberi');
    expect(materials).toContain('Basınç Konu Özeti');
    expect(materials).toContain('Basınç Kavram Haritası');
  });
});
