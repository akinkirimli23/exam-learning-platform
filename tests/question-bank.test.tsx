import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { QuestionBank } from '../components/question-bank';
import { QuestionVisual } from '../components/question-visual';
import { buoyancyTopicDefinition } from '../shared/content/physics/buoyancy/topic';

describe('Konu soru bankası', () => {
  it('kolay, orta ve zor soru havuzlarını ayırır', () => {
    const levels = ['kolay', 'orta', 'zor'] as const;
    for (const level of levels) {
      const questions = buoyancyTopicDefinition.quiz.filter((question) => question.difficulty === level);
      expect(questions.length).toBeGreaterThan(0);
      expect(questions.every((question) => question.difficulty === level)).toBe(true);
    }
  });

  it('kaldırma kuvveti soru havuzunda görselli sorular içerir', () => {
    const visualQuestions = buoyancyTopicDefinition.quiz.filter((question) => question.visualId);
    expect(visualQuestions.length).toBeGreaterThanOrEqual(6);
  });

  it('soru bankası seviye seçim ekranını render eder', () => {
    const html = renderToStaticMarkup(<QuestionBank definition={buoyancyTopicDefinition} />);
    expect(html).toContain('SORU BANKASI');
    expect(html).toContain('Kolay Test');
    expect(html).toContain('Orta Test');
    expect(html).toContain('Zor Test');
  });

  it('örnek kaldırma kuvveti görselini erişilebilir SVG olarak render eder', () => {
    const html = renderToStaticMarkup(<QuestionVisual visualId="buoyancy-pressure-cube" />);
    expect(html).toContain('<svg');
    expect(html).toContain('Tam batmış küpte üst ve alt yüzey basınç kuvvetleri');
  });
});
