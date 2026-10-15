import { z } from 'zod';
import type { LearningQuizDifficulty } from './contracts';

export const bankTestDefinitionSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(3),
  difficulty: z.enum(['kolay', 'orta', 'zor']),
  description: z.string().min(3),
  questionCount: z.number().int().positive(),
  durationMinutes: z.number().int().positive(),
  visualCount: z.number().int().nonnegative(),
});
export type BankTestDefinition = z.infer<typeof bankTestDefinitionSchema>;
export type BankFigure = { src: string; alt: string };
export type BankQuestion = {
  id: string; number: number; text: string; options: string[];
  conceptId: string; conceptIds: string[]; difficulty: LearningQuizDifficulty;
  figure?: BankFigure;
};
export type BankFeedback = {
  questionId: string; correctAnswer: number; selectedAnswer: number | null;
  isCorrect: boolean; explanation: string; conceptId: string;
};
export type BankResult = { correct: number; wrong: number; blank: number; total: number; percentage: number };
export type BankAttempt = {
  id: string; testId: string; topicId: string; revision: string;
  title: string; difficulty: LearningQuizDifficulty; durationMinutes: number;
  status: 'active' | 'completed'; createdAt: string;
  questions: BankQuestion[]; answers: Record<string, number | null>;
  result: BankResult | null; feedback: BankFeedback[];
};
export type BankCatalogItem = BankTestDefinition & {
  available: boolean; activeAttemptId: string | null; latestAttemptId: string | null;
  completedCount: number; answeredCount: number; bestPercentage: number | null;
};
export type BankCatalog = { topicId: string; revision: string; tests: BankCatalogItem[] };
export const bankStartSchema = z.object({ idempotencyKey: z.string().uuid() });
export const bankAnswerSchema = z.object({ questionId: z.string().min(1), value: z.number().int().min(0).max(4).nullable() });
