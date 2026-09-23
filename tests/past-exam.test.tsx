import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { PastExamAnalysis } from '../components/past-exam-analysis';
import { buoyancyTopicDefinition } from '../shared/content/physics/buoyancy/topic';

describe('Kaldırma Kuvveti geçmiş YKS analizi', () => {
  it('4 doğrulanmış kaynak ve 12 özgün çalışma sorusu yükler', () => {
    expect(buoyancyTopicDefinition.pastExam?.sources).toHaveLength(4);
    expect(buoyancyTopicDefinition.pastExam?.questions).toHaveLength(12);
  });

  it('her özgün soruyu doğrulanmış bir kaynak becerisine bağlar', () => {
    const set = buoyancyTopicDefinition.pastExam;
    expect(set).toBeDefined();
    const sourceIds = new Set(set!.sources.map((source) => source.id));
    for (const question of set!.questions) {
      expect(sourceIds.has(question.sourceRef)).toBe(true);
      expect(question.id).toMatch(/^buoyancy-yks-q-\d{3}$/);
    }
  });

  it('kaynak metadatasını ve telif notunu arayüzde gösterir', () => {
    const html = renderToStaticMarkup(<PastExamAnalysis definition={buoyancyTopicDefinition} />);
    expect(html).toContain('GEÇMİŞ YKS BECERİ ANALİZİ');
    expect(html).toContain('Orijinal soru metinleri uygulamada saklanmaz');
    expect(html).toContain('2018');
    expect(html).toContain('2026');
    expect(html).toContain('Resmî ÖSYM PDF');
  });
});
