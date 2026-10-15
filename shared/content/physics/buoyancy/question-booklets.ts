import type { QuestionBookletDefinition } from '@/shared/question-booklet';
import { buoyancyBankTests } from './question-bank';
import firstBooklet from './question-booklet.json';

const difficultyLabels = { kolay: 'KOLAY', orta: 'ORTA', zor: 'ZOR' };

// Public presentation metadata only; questions and answer keys stay on the server.
export const buoyancyQuestionBooklets: QuestionBookletDefinition[] = buoyancyBankTests.map((test, index) => {
  const number = buoyancyBankTests.slice(0, index + 1).filter(item => item.difficulty === test.difficulty).length;
  return {
    ...firstBooklet,
    testId: test.id,
    testLabel: `${difficultyLabels[test.difficulty]} TEST ${number}`,
    bookletNumber: index + 1,
    illustrations: Object.fromEntries(Object.entries(firstBooklet.illustrations).filter(([id]) => id.startsWith(`${test.id}-q`))),
  };
});
