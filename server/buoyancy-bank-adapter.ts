import 'server-only';
import { createHash } from 'node:crypto';
import { z } from 'zod';
import raw from './content/buoyancy-question-bank.json';
import review from './content/buoyancy-bank-audit.json';
import { buoyancyConceptMap } from '@/shared/buoyancy-concepts';
import { flattenConceptNodes } from '@/shared/topic-engine';
import { buoyancyBankTests } from '@/shared/content/physics/buoyancy/question-bank';
import type { BankQuestion, BankTestDefinition } from '@/shared/question-bank';

export const buoyancyConceptAliases: Record<string, readonly string[]> = {
  archimedes: ['archimedes-principle'],
  'displaced-volume': ['submerged-volume'],
  'apparent-weight': ['apparent-weight-loss'],
  'floating-equilibrium': ['floating-balance'],
  'floating-fraction': ['floating-partial'],
  'neutral-buoyancy': ['suspended-balance'],
  overflow: ['overflow-weight'],
  'fluid-density': ['fluid-density'],
  'force-balance': ['net-upward-force'],
  'sinking-equilibrium': ['sinking-force'],
  'density-order': ['equilibrium-states'],
  'depth-independence': ['buoyancy-equation'],
  'pressure-origin': ['pressure-force-difference'],
  'daily-life': ['daily-life-applications'],
  'tension-ceiling': ['apparent-weight-loss'],
  'tension-bottom': ['net-upward-force'],
  'tension-direction': ['net-upward-force'],
  'partial-to-full': ['submerged-volume'],
  'boat-rock': ['shipping', 'displaced-fluid-weight'],
  'ice-melting': ['displaced-fluid-weight', 'floating-balance'],
  graphs: ['buoyancy-equation'],
  'average-density': ['floating-density'],
  gravity: ['gravity-acceleration'],
  'layered-floats': ['fluid-density', 'submerged-volume', 'floating-balance'],
  'scale-reaction': ['net-upward-force'],
  'system-boundary': ['net-upward-force'],
  'compressible-body': ['volume-change'],
  'multiple-statements': ['equilibrium-states'],
  'experimental-design': ['mathematical-model'],
  certainty: ['normal-force'],
  'floating-limit': ['floating-partial'],
};

const sourceQuestion = z.object({
  id: z.string(), number: z.number().int().positive(), stem: z.string().min(10),
  options: z.array(z.object({ key: z.enum(['A', 'B', 'C', 'D', 'E']), text: z.string().min(1) })).length(5),
  answer: z.enum(['A', 'B', 'C', 'D', 'E']), solution: z.string().min(3),
  conceptIds: z.array(z.string()).min(1), cognitiveType: z.string(),
  sourceType: z.literal('original'), rights: z.string().min(1),
  figure: z.object({ kind: z.literal('svg'), path: z.string(), alt: z.string().min(3) }).optional(),
});
const sourcePack = z.object({
  topicId: z.literal('buoyancy'), revision: z.string().min(1),
  tests: z.array(z.object({
    id: z.string(), level: z.enum(['easy', 'medium', 'hard']), title: z.string(),
    topicId: z.literal('buoyancy'), questionCount: z.literal(15), description: z.string(),
    questions: z.array(sourceQuestion).length(15),
  })).length(9),
});
export type PrivateBankQuestion = BankQuestion & { correctAnswer: number; explanation: string; mistakeReason: 'calculation-error' | 'concept-gap' };
export type PrivateBankTest = BankTestDefinition & { topicId: string; revision: string; questions: PrivateBankQuestion[] };
const hash = (value: unknown) => createHash('sha256').update(JSON.stringify(value)).digest('hex');

export function adaptBuoyancyBank(input: unknown, audit = review): PrivateBankTest[] {
  const pack = sourcePack.parse(input);
  if (pack.revision !== audit.revision || audit.questions.length !== 135) throw new Error('Question bank review is missing.');
  const canonical = new Set(flattenConceptNodes(buoyancyConceptMap).map(node => node.id));
  const seenIds = new Set<string>(), seenStems = new Set<string>(), seenTests = new Set<string>();
  const levels = { easy: 'kolay', medium: 'orta', hard: 'zor' } as const;
  const result = pack.tests.map(test => {
    const metadata = buoyancyBankTests.find(item => item.id === test.id);
    if (!metadata || seenTests.has(test.id) || metadata.difficulty !== levels[test.level]) throw new Error(`Invalid test: ${test.id}`);
    seenTests.add(test.id);
    const originals = (input as typeof raw).tests.find(item => item.id === test.id)!.questions;
    const questions = test.questions.map((question, index): PrivateBankQuestion => {
      const expectedId = `${test.id}-q${String(index + 1).padStart(2, '0')}`;
      const decision = audit.questions.find(item => item.id === question.id);
      if (question.id !== expectedId || question.number !== index + 1 || seenIds.has(question.id)) throw new Error('Invalid or duplicate question id/order.');
      seenIds.add(question.id);
      const stem = question.stem.normalize('NFKC').toLocaleLowerCase('tr-TR').replace(/\s+/g, ' ').trim();
      if (seenStems.has(stem)) throw new Error('Duplicate question stem.');
      seenStems.add(stem);
      if (question.options.map(option => option.key).join('') !== 'ABCDE' || new Set(question.options.map(option => option.text.trim())).size !== 5) throw new Error('Five distinct ordered choices required.');
      if (!decision || decision.expectedAnswer !== question.answer || decision.contentSha256 !== hash(originals[index])) throw new Error(`Unreviewed or changed question: ${question.id}`);
      const conceptIds = [...new Set(question.conceptIds.flatMap(alias => {
        const mapped = buoyancyConceptAliases[alias];
        if (!mapped?.length || mapped.some(id => !canonical.has(id))) throw new Error(`Unknown concept alias: ${alias}`);
        return mapped;
      }))];
      let figure: BankQuestion['figure'];
      if (question.figure) {
        if (question.figure.path !== `assets/${question.id}.svg` || !(question.id + '.svg' in audit.assets)) throw new Error('Unreviewed SVG reference.');
        figure = { src: `/question-bank/buoyancy/${question.id}.svg`, alt: question.figure.alt };
      }
      return { id: question.id, number: question.number, text: question.stem, options: question.options.map(option => option.text),
        correctAnswer: 'ABCDE'.indexOf(question.answer), explanation: question.solution, conceptId: conceptIds[0], conceptIds,
        mistakeReason: question.cognitiveType === 'hesap' ? 'calculation-error' : 'concept-gap',
        difficulty: metadata.difficulty, ...(figure && { figure }) };
    });
    if (questions.filter(question => question.figure).length !== metadata.visualCount) throw new Error('Figure count mismatch.');
    return { ...metadata, topicId: pack.topicId, revision: pack.revision, questions };
  });
  if (Object.values(levels).some(level => result.filter(test => test.difficulty === level).length !== 3)) throw new Error('Three tests per difficulty required.');
  return result;
}

export const buoyancyQuestionBank = adaptBuoyancyBank(raw);
