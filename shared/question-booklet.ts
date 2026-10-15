import type { BankQuestion } from './question-bank';

export type BookletIllustration = { source: string; src: string; stemSignature: string };
export type QuestionBookletDefinition = {
  testId: string;
  examLabel: string;
  topicLabel: string;
  testLabel: string;
  bookletNumber?: number;
  unitLabel: string;
  badgeLabel: string;
  questionsPerPage: number;
  illustrations?: Readonly<Record<string, BookletIllustration>>;
};

// A presentation guard, not an answer key. Old snapshots retain their own illustration.
export function bookletStemSignature(text: string): string {
  let value = 2166136261;
  for (const character of text) value = Math.imul(value ^ character.charCodeAt(0), 16777619);
  return (value >>> 0).toString(16);
}

export function bookletFigure(question: BankQuestion, definition: QuestionBookletDefinition) {
  const illustration = definition.illustrations?.[question.id];
  return question.figure && illustration && illustration.source === question.figure.src &&
    illustration.stemSignature === bookletStemSignature(question.text)
    ? { ...question.figure, src: illustration.src } : question.figure;
}

export function bookletPages<T>(questions: readonly T[], size: number): T[][] {
  if (!Number.isInteger(size) || size < 1) throw new Error('Invalid booklet page size');
  return Array.from({ length: Math.ceil(questions.length / size) }, (_, index) => questions.slice(index * size, (index + 1) * size));
}

export function bookletWindow(page: number, total: number, spread: boolean) {
  const clamped = Math.max(0, Math.min(page, Math.max(total - 1, 0)));
  const start = spread ? clamped - clamped % 2 : clamped;
  return { start, pages: Array.from({ length: Math.min(spread ? 2 : 1, total - start) }, (_, index) => start + index) };
}

export function bookletView(width: number, layout: 'auto' | 'single' | 'spread') {
  const canSpread = width >= 760;
  return { canSpread, spread: canSpread && (layout === 'spread' || (layout === 'auto' && width >= 1360)) };
}
