import fs from 'node:fs';
import path from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { BankAttempt } from '../shared/question-bank';
import { bookletFigure, bookletPages, bookletView, bookletWindow } from '../shared/question-booklet';
import { buoyancyTopicDefinition } from '../shared/content/physics/buoyancy/topic';
import { buoyancyQuestionBank } from '../server/buoyancy-bank-adapter';
import { QuestionBooklet } from '../components/question-booklet/question-booklet';
import { QuestionBookletPage } from '../components/question-booklet/question-booklet-page';
import { defineTopic } from '../shared/topic-engine';

const definition = buoyancyTopicDefinition.questionBooklets![0];
const source = buoyancyQuestionBank[0];
const questions = source.questions.map(({ correctAnswer, explanation, mistakeReason, ...question }) => question);
const attempt: BankAttempt = {
  id: 'booklet-test', testId: source.id, topicId: 'buoyancy', revision: source.revision,
  title: source.title, difficulty: source.difficulty, durationMinutes: source.durationMinutes,
  createdAt: '2026-10-15T00:00:00Z', status: 'active', questions, answers: {}, feedback: [], result: null,
};
const noop = () => {};
const render = (value = attempt, extra = {}) => renderToStaticMarkup(<QuestionBooklet attempt={value} definition={definition}
  busy={false} pending={false} error="" onAnswer={noop} onRetry={noop} onFinish={noop} onBack={noop} onRestart={noop} {...extra} />);

describe('Interactive question booklets', () => {
  it('supports an explicit spread on tablets and falls back safely when rotated to a phone width', () => {
    expect(bookletView(768, 'auto')).toEqual({ canSpread: true, spread: false });
    expect(bookletView(768, 'spread').spread).toBe(true);
    expect(bookletView(1024, 'single').spread).toBe(false);
    expect(bookletView(1440, 'auto').spread).toBe(true);
    expect(bookletView(1440, 'single').spread).toBe(false);
    expect(bookletView(390, 'spread')).toEqual({ canSpread: false, spread: false });
  });
  it('paginates all fifteen original questions in order without losing the last three', () => {
    const pages = bookletPages(questions, definition.questionsPerPage);
    expect(pages.map(page => page.length)).toEqual([4, 4, 4, 3]);
    expect(pages.flat().map(question => question.id)).toEqual(questions.map(question => question.id));
    expect(() => bookletPages(questions, 0)).toThrow();
    expect(bookletWindow(1, pages.length, true).pages).toEqual([0, 1]);
    expect(bookletWindow(3, pages.length, true).pages).toEqual([2, 3]);
    expect(bookletWindow(3, pages.length, false).pages).toEqual([3]);
    expect(bookletWindow(9, pages.length, false).pages).toEqual([3]);
  });

  it('registers all nine tests and rejects invalid booklet definitions', () => {
    expect(buoyancyTopicDefinition.questionBooklets?.map(item => item.testId)).toEqual(buoyancyQuestionBank.map(test => test.id));
    expect(buoyancyTopicDefinition.questionBooklets?.map(item => item.testLabel)).toEqual([
      'KOLAY TEST 1', 'KOLAY TEST 2', 'KOLAY TEST 3', 'ORTA TEST 1', 'ORTA TEST 2', 'ORTA TEST 3', 'ZOR TEST 1', 'ZOR TEST 2', 'ZOR TEST 3',
    ]);
    expect(buoyancyTopicDefinition.questionBooklets?.map(item => item.bookletNumber)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(() => defineTopic({ ...buoyancyTopicDefinition, questionBooklets: [{ ...definition, testId: 'buoyancy-missing' }] })).toThrow('invalid booklet');
    expect(() => defineTopic({ ...buoyancyTopicDefinition, questionBooklets: [{ ...definition, questionsPerPage: 0 }] })).toThrow();
    expect(() => defineTopic({ ...buoyancyTopicDefinition, questionBooklets: [{ ...definition, bookletNumber: 0 }] })).toThrow();
  });

  it.each(buoyancyQuestionBank)('renders all 15 questions, enhanced figures and completed solutions for $id', test => {
    const booklet = buoyancyTopicDefinition.questionBooklets!.find(item => item.testId === test.id)!;
    const publicQuestions = test.questions.map(({ correctAnswer, explanation, mistakeReason, ...question }) => question);
    const pages = bookletPages(publicQuestions, booklet.questionsPerPage);
    expect(pages.map(page => page.length)).toEqual([4, 4, 4, 3]);
    const feedback = test.questions.map(question => ({ questionId: question.id, correctAnswer: question.correctAnswer,
      selectedAnswer: null, isCorrect: false, explanation: question.explanation, conceptId: question.conceptId }));
    const active = pages.map((pageQuestions, index) => renderToStaticMarkup(<QuestionBookletPage definition={booklet} pageNumber={index + 1}
      questions={pageQuestions} answers={{}} feedback={[]} completed={false} locked={false} showInstructions onAnswer={noop} />)).join('');
    expect([...active.matchAll(/data-booklet-question="([^"]+)"/g)].map(match => match[1])).toEqual(test.questions.map(question => question.id));
    expect(active.match(/type="radio"/g)).toHaveLength(75);
    expect(active.match(/role="radiogroup"/g)).toHaveLength(15);
    expect(active).toContain(booklet.testLabel);
    expect(active).not.toContain('Açıklamalı çözüm');
    expect(active).not.toMatch(/İşlem alanı|Çözüm alanı/);
    for (const question of publicQuestions.filter(question => question.figure)) {
      const figure = bookletFigure(question, booklet)!;
      expect(fs.existsSync(path.join('public', figure.src))).toBe(true);
      expect(active).toContain(figure.src);
      expect(figure.src).toContain('/booklet/');
      expect(figure.alt).toBe(question.figure!.alt);
      expect(bookletFigure({ ...question, text: question.text + ' Yeni sürüm.' }, booklet)).toEqual(question.figure);
    }
    const completed = pages.map((pageQuestions, index) => renderToStaticMarkup(<QuestionBookletPage definition={booklet} pageNumber={index + 1}
      questions={pageQuestions} answers={{}} feedback={feedback} completed locked={false} showInstructions onAnswer={noop} />)).join('');
    expect(completed.match(/Açıklamalı çözüm/g)).toHaveLength(15);
    expect(completed.match(/<input[^>]*disabled=""/g)).toHaveLength(75);
    const saved = Object.fromEntries(publicQuestions.slice(0, 8).map(question => [question.id, null]));
    const resumed = renderToStaticMarkup(<QuestionBooklet attempt={{ ...attempt, testId: test.id, title: test.title, questions: publicQuestions, answers: saved }} definition={booklet}
      busy={false} pending={false} error="" onAnswer={noop} onRetry={noop} onFinish={noop} onBack={noop} onRestart={noop} />);
    expect(resumed).toContain('data-booklet-page="3"');
    expect(resumed).toContain(booklet.testLabel);
  });

  it('keeps native five-choice groups, instructions and page numbering while hiding all solutions during a test', () => {
    const html = render();
    expect(html.match(/type="radio"/g)).toHaveLength(20);
    expect(html.match(/role="radiogroup"/g)).toHaveLength(4);
    expect(html).toContain('Her soru için en uygun seçeneği işaretleyiniz.');
    expect(html).toContain('Kitapçık sayfası 1');
    expect(html).toContain(questions[0].text);
    expect(html).not.toContain('Açıklamalı çözüm');
    for (const question of source.questions) expect(html).not.toContain(question.explanation);
    expect(html).not.toContain('Workbook Spread.png');
  });

  it('restores the correct booklet page from saved answers and preserves explicit blanks', () => {
    const answers: BankAttempt['answers'] = Object.fromEntries(questions.slice(0, 8).map(question => [question.id, 1]));
    answers[questions[1].id] = null;
    const html = render({ ...attempt, answers });
    expect(html).toContain('Kitapçık sayfası 3');
    expect(html).not.toContain('data-booklet-page="1"');
    expect(html).toContain('Soru 2: boş');
    expect(html).toContain('7 / 15 soru yanıtlandı');
  });

  it('locks page/answer changes and exposes a retry when a save has failed', () => {
    const html = render({ ...attempt, answers: { [questions[0].id]: 2 } }, { pending: true, error: 'Bağlantı kesildi.' });
    expect(html).toContain('Yanıtı tekrar kaydet');
    expect(html.match(/<input[^>]*disabled=""/g)).toHaveLength(20);
    expect(html).toContain('checked=""');
    expect(html).not.toContain('Açıklamalı çözüm');
  });

  it('opens the original server-provided explanations only after completion and makes answers read-only', () => {
    const feedback = source.questions.map(question => ({ questionId: question.id, correctAnswer: question.correctAnswer,
      selectedAnswer: question.correctAnswer, isCorrect: true, explanation: question.explanation, conceptId: question.conceptId }));
    const html = render({ ...attempt, status: 'completed', feedback, result: { correct: 15, wrong: 0, blank: 0, total: 15, percentage: 100 } });
    expect(html).toContain('Test tamamlandı');
    expect(html.match(/Açıklamalı çözüm/g)).toHaveLength(4);
    expect(html.match(/<input[^>]*disabled=""/g)).toHaveLength(20);
    expect(html).toContain(source.questions[0].explanation);
    expect(html).not.toContain('Soru 1: boş bırak');
  });

  it('renders the last page with questions 13–15 and no filler working area', () => {
    const html = renderToStaticMarkup(<QuestionBookletPage definition={definition} pageNumber={4} questions={questions.slice(12)} answers={{}} feedback={[]} completed={false} locked={false} showInstructions onAnswer={noop} />);
    expect(html.match(/data-booklet-question=/g)).toHaveLength(3);
    expect(html).toContain('buoyancy-easy-01-q15');
    expect(html.match(/type="radio"/g)).toHaveLength(15);
    expect(html).not.toMatch(/İşlem alanı|Çözüm alanı/);
  });

  it('covers all 64 diagrams safely and retains original images for changed or older snapshots', () => {
    const illustrated = buoyancyQuestionBank.flatMap(test => test.questions.filter(question => question.figure)
      .map(question => ({ question, booklet: buoyancyTopicDefinition.questionBooklets!.find(item => item.testId === test.id)! })));
    expect(illustrated).toHaveLength(64);
    expect(new Set(illustrated.map(({ question, booklet }) => bookletFigure(question, booklet)!.src)).size).toBe(64);
    for (const { question, booklet } of illustrated) {
      const enhanced = bookletFigure(question, booklet)!;
      expect(enhanced.src).toContain('/booklet/');
      expect(enhanced.alt).toBe(question.figure!.alt);
      const svg = fs.readFileSync(path.join('public', enhanced.src), 'utf8');
      expect(svg).toContain('<linearGradient');
      expect(svg).toContain('viewBox="0 0 800 480"');
      expect(svg).not.toMatch(/<(?:script|foreignObject|image|use|a)\b|\bon[a-z]+\s*=|\b(?:href|src)\s*=|<!DOCTYPE|<!ENTITY/i);
      const ids = new Set([...svg.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));
      expect([...svg.matchAll(/url\(([^)]*)\)/g)].every(match => /^#[a-z][a-z0-9-]*$/i.test(match[1]) && ids.has(match[1].slice(1)))).toBe(true);
      expect(bookletFigure({ ...question, text: question.text + ' Yeni sürüm.' }, booklet)).toEqual(question.figure);
      expect(bookletFigure({ ...question, figure: { ...question.figure!, src: '/other.svg' } }, booklet)?.src).toBe('/other.svg');
    }
  });
});
