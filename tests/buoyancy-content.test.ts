import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { buoyancyConceptMap, flattenConceptNodes } from '../shared/buoyancy-concepts';
import {
  buoyancyFlashcards,
  buoyancyQuiz,
  gradeBuoyancyQuestion,
  summarizeIncorrectConcepts,
} from '../shared/content/physics/buoyancy';

describe('Kaldırma Kuvveti statik öğrenme içeriği', () => {
  const contentFolder = path.join(process.cwd(), 'shared', 'content', 'physics', 'buoyancy');
  const canonicalIds = new Set(flattenConceptNodes(buoyancyConceptMap).map((node) => node.id));

  it('flashcards.json ve quiz.json geçerli JSON olarak parse edilir', () => {
    expect(JSON.parse(readFileSync(path.join(contentFolder, 'flashcards.json'), 'utf8'))).toHaveLength(25);
    expect(JSON.parse(readFileSync(path.join(contentFolder, 'quiz.json'), 'utf8'))).toHaveLength(20);
  });

  it('kart şemasını, ölçeklenebilir kimlikleri ve canonical conceptId değerlerini korur', () => {
    expect(buoyancyFlashcards).toHaveLength(25);
    for (const card of buoyancyFlashcards) {
      expect(card.id).toMatch(/^buoyancy-card-\d{3}$/);
      expect(canonicalIds.has(card.conceptId)).toBe(true);
      expect(card.front).not.toBe('');
      expect(card.back).not.toBe('');
      expect(card.formula).not.toBe('');
      expect(card.commonMistake).not.toBe('');
    }
  });

  it('quiz şemasını, cevap aralıklarını ve canonical conceptId değerlerini doğrular', () => {
    expect(buoyancyQuiz).toHaveLength(20);
    for (const question of buoyancyQuiz) {
      expect(question.id).toMatch(/^buoyancy-q-\d{3}$/);
      expect(canonicalIds.has(question.conceptId)).toBe(true);
      expect(question.correctAnswer).toBeGreaterThanOrEqual(0);
      expect(question.correctAnswer).toBeLessThan(question.options.length);
      expect(['kolay', 'orta', 'zor']).toContain(question.difficulty);
    }
  });

  it('doğru ve yanlış yanıtları analytics kaydına dönüştürür', () => {
    const question = buoyancyQuiz[0];
    const correct = gradeBuoyancyQuestion(question, question.correctAnswer);
    const wrongChoice = (question.correctAnswer + 1) % question.options.length;
    const wrong = gradeBuoyancyQuestion(question, wrongChoice);

    expect(correct).toEqual({
      questionId: question.id,
      conceptId: question.conceptId,
      selectedAnswer: question.correctAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect: true,
      difficulty: question.difficulty,
    });
    expect(wrong.isCorrect).toBe(false);
    expect(() => gradeBuoyancyQuestion(question, question.options.length)).toThrow();
  });

  it('yanlışları conceptId bazında deterministik olarak özetler', () => {
    const first = buoyancyQuiz[0];
    const second = buoyancyQuiz.find((question) => question.conceptId !== first.conceptId)!;
    const wrong = (question: typeof first) =>
      gradeBuoyancyQuestion(question, (question.correctAnswer + 1) % question.options.length);
    const summary = summarizeIncorrectConcepts([
      wrong(first),
      wrong(first),
      gradeBuoyancyQuestion(second, second.correctAnswer),
      wrong(second),
    ]);

    expect(summary).toEqual([
      { conceptId: first.conceptId, title: 'Arşimet İlkesi', count: 2 },
      { conceptId: second.conceptId, title: 'Yüzme Durumu', count: 1 },
    ]);
  });
});
