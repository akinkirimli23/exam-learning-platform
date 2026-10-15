import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import raw from '../server/content/buoyancy-question-bank.json';
import audit from '../server/content/buoyancy-bank-audit.json';
import { adaptBuoyancyBank, buoyancyQuestionBank } from '../server/buoyancy-bank-adapter';
import { independentBankCalculations, numbersInChoice } from '../scripts/buoyancy-bank-math';
import { buoyancyTopicDefinition } from '../shared/content/physics/buoyancy/topic';
import { flattenConceptNodes } from '../shared/topic-engine';
import { QuestionBank } from '../components/question-bank';
import { BankQuestionFigure } from '../components/bank-question-figure';

describe('135-question local bank import', () => {
  it('keeps three distinct fifteen-question tests at each difficulty and the old quiz', () => {
    expect(buoyancyQuestionBank).toHaveLength(9);
    expect(buoyancyQuestionBank.flatMap(test => test.questions)).toHaveLength(135);
    for (const level of ['kolay', 'orta', 'zor']) {
      const tests = buoyancyQuestionBank.filter(test => test.difficulty === level);
      expect(tests).toHaveLength(3);
      expect(tests.every(test => test.questions.length === 15)).toBe(true);
    }
    expect(buoyancyTopicDefinition.quiz).toHaveLength(20);
    expect(new Set(buoyancyQuestionBank.flatMap(test => test.questions.map(question => question.id))).size).toBe(135);
    expect(new Set(buoyancyQuestionBank.flatMap(test => test.questions.map(question => question.text))).size).toBe(135);
  });

  it('maps all suggested concepts explicitly to existing canonical nodes', () => {
    const canonical = new Set(flattenConceptNodes(buoyancyTopicDefinition.conceptMap).map(node => node.id));
    for (const test of buoyancyQuestionBank) for (const question of test.questions) {
      expect(question.options).toHaveLength(5);
      expect(new Set(question.options).size).toBe(5);
      expect(question.conceptIds.every(id => canonical.has(id))).toBe(true);
      expect(canonical.has(question.conceptId)).toBe(true);
      expect(question.explanation.length).toBeGreaterThan(3);
    }
  });

  it('preserves original sources and records seven text plus seventeen diagram corrections', () => {
    expect(audit.questions).toHaveLength(135);
    expect(audit.corrections).toHaveLength(7);
    expect(audit.diagramCorrections).toHaveLength(17);
    expect(audit.questions.filter(question => question.correctionRequiredInSource)).toHaveLength(22);
    const original = path.resolve('imports/buoyancy-question-bank/question-bank-135.json');
    if (fs.existsSync(original)) {
      const questions = JSON.parse(fs.readFileSync(original, 'utf8')).tests.flatMap((test: any) => test.questions);
      for (const question of questions) {
        const decision = audit.questions.find(item => item.id === question.id)!;
        expect(createHash('sha256').update(JSON.stringify(question)).digest('hex')).toBe(decision.sourceSha256);
      }
    }
  });

  it('rejects a changed answer, an unreviewed stem, or an unknown concept', () => {
    const changed = structuredClone(raw);
    changed.tests[0].questions[0].answer = 'A';
    expect(() => adaptBuoyancyBank(changed)).toThrow();
    const stem = structuredClone(raw);
    stem.tests[0].questions[0].stem += ' Değişti.';
    expect(() => adaptBuoyancyBank(stem)).toThrow('Unreviewed');
    const concept = structuredClone(raw);
    concept.tests[0].questions[0].conceptIds = ['unknown'];
    expect(() => adaptBuoyancyBank(concept)).toThrow();
  });

  it('rejects duplicate IDs, repeated choices and a traversal/external diagram path', () => {
    const duplicate = structuredClone(raw);
    duplicate.tests[0].questions[1].id = duplicate.tests[0].questions[0].id;
    expect(() => adaptBuoyancyBank(duplicate)).toThrow();
    const choices = structuredClone(raw);
    choices.tests[0].questions[0].options[1].text = choices.tests[0].questions[0].options[0].text;
    expect(() => adaptBuoyancyBank(choices)).toThrow();
    const figure = structuredClone(raw);
    figure.tests[0].questions[0].figure!.path = '../../.env.local';
    expect(() => adaptBuoyancyBank(figure)).toThrow();
  });

  it('verifies the reviewed bytes and safe SVG subset for all 64 diagram files', () => {
    const figures = buoyancyQuestionBank.flatMap(test => test.questions).filter(question => question.figure);
    expect(figures).toHaveLength(64);
    for (const question of figures) {
      const file = path.resolve('public', question.figure!.src.slice(1));
      const bytes = fs.readFileSync(file);
      expect(createHash('sha256').update(bytes).digest('hex')).toBe((audit.assets as Record<string, string>)[path.basename(file)]);
      const svg = bytes.toString('utf8');
      expect(svg).toMatch(/^<svg /);
      expect(svg).not.toMatch(/<(?:script|foreignObject|image|use|a)\b|\bon[a-z]+\s*=|\b(?:href|src)\s*=|<!DOCTYPE|<!ENTITY|url\s*\(/i);
      expect(question.figure!.alt.length).toBeGreaterThan(3);
    }
  });

  it('renders nine labeled test cards and offers the unchanged legacy archive', () => {
    const html = renderToStaticMarkup(<QuestionBank definition={buoyancyTopicDefinition} />);
    for (const level of ['Kolay', 'Orta', 'Zor']) for (let number = 1; number <= 3; number++) expect(html).toContain(`${level} Test ${number}`);
    expect(html).toContain('Önceki 20 soruluk bankayı aç');
    expect(html).not.toContain(raw.tests[0].questions[0].solution);
  });

  it('provides an accessible image, keyboard dialog and zoom controls', () => {
    const html = renderToStaticMarkup(<BankQuestionFigure figure={buoyancyQuestionBank[0].questions[0].figure} />);
    expect(html).toContain('<img');
    expect(html).toContain('alt="Özgün şematik çizim:');
    expect(html).toContain('Büyütülmüş soru şeması');
    expect(html).toContain('Şemayı yakınlaştır');
  });

  for (const [id, independent] of Object.entries(independentBankCalculations)) {
    it(`independently recalculates ${id}`, () => {
      const question = buoyancyQuestionBank.flatMap(test => test.questions).find(question => question.id === id)!;
      const numbers = numbersInChoice(question.options[question.correctAnswer]);
      expect(numbers).toHaveLength(independent.length);
      for (let index = 0; index < numbers.length; index++) expect(numbers[index]).toBeCloseTo(independent[index], 8);
    });
  }

  it('checks the density classification and symbolic force-change dimension independently', () => {
    const densities = [100, 150, 200].map(mass => mass / 100);
    expect(densities.map(density => density < 1.5 ? 'floating' : density === 1.5 ? 'suspended' : 'sinking')).toEqual(['floating', 'suspended', 'sinking']);
    const classification = buoyancyQuestionBank.flatMap(test => test.questions).find(question => question.id === 'buoyancy-medium-03-q01')!;
    expect(classification.options[classification.correctAnswer]).toBe('Yalnız K');
    const dimensions = [[1, -3, 0], [0, 1, -2], [0, 2, 0], [0, 1, 0]];
    expect([0, 1, 2].map(index => dimensions.reduce((sum, dimension) => sum + dimension[index], 0))).toEqual([1, 1, -2]);
    const force = buoyancyQuestionBank.flatMap(test => test.questions).find(question => question.id === 'buoyancy-hard-01-q14')!;
    expect(force.options[force.correctAnswer]).toBe('ρgAΔh');
  });
});
