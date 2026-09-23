import { z } from 'zod';
import { learningQuizDifficultySchema, learningQuizQuestionSchema, type LearningQuizQuestion } from '@/shared/contracts';

export const pastExamSourceSchema = z.object({
  id: z.string().min(1),
  year: z.number().int().min(2000).max(2100),
  exam: z.string().min(2).max(40),
  section: z.string().min(2).max(120),
  questionNumber: z.number().int().positive(),
  conceptIds: z.array(z.string().min(1)).min(1),
  skill: z.string().min(10).max(1000),
  questionType: z.string().min(2).max(120),
  difficultyEstimated: learningQuizDifficultySchema,
  officialAnswer: z.string().min(1).max(3),
  sourceUrl: z.string().url(),
  note: z.string().min(3).max(1000),
});

export const pastExamPracticeQuestionSchema = learningQuizQuestionSchema.extend({
  sourceRef: z.string().min(1),
  skill: z.string().min(10).max(1000),
});

export type PastExamSource = z.infer<typeof pastExamSourceSchema>;
export type PastExamPracticeQuestion = z.infer<typeof pastExamPracticeQuestionSchema>;

export type PastExamSet = {
  sources: readonly PastExamSource[];
  questions: readonly PastExamPracticeQuestion[];
};

export function createPastExamSet(
  sourcesInput: unknown,
  questionsInput: unknown,
): PastExamSet {
  const sources = pastExamSourceSchema.array().parse(sourcesInput);
  const questions = pastExamPracticeQuestionSchema.array().parse(questionsInput);
  const sourceIds = new Set(sources.map((item) => item.id));

  if (sourceIds.size !== sources.length) throw new Error('Duplicate past-exam source id');
  if (new Set(questions.map((item) => item.id)).size !== questions.length) {
    throw new Error('Duplicate past-exam practice question id');
  }
  for (const question of questions) {
    if (!sourceIds.has(question.sourceRef)) {
      throw new Error(`Past-exam question '${question.id}' references unknown source '${question.sourceRef}'`);
    }
  }

  return Object.freeze({
    sources: Object.freeze([...sources]),
    questions: Object.freeze([...questions]),
  });
}
