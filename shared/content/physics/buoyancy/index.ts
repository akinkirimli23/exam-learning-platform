import type { LearningQuizQuestion, QuizAnswerRecord } from '@/shared/contracts';
import { buoyancyTopicDefinition } from '@/shared/content/physics/buoyancy/topic';
import {
  getConceptTitle,
  gradeLearningQuestion,
  summarizeIncorrectConcepts as summarizeTopicIncorrectConcepts,
} from '@/shared/topic-engine';

export { buoyancyFlashcards, buoyancyQuiz } from './data';
export { buoyancyTopicDefinition } from './topic';

export function getBuoyancyConceptTitle(conceptId: string): string {
  return getConceptTitle(buoyancyTopicDefinition, conceptId);
}

export function gradeBuoyancyQuestion(
  question: LearningQuizQuestion,
  selectedAnswer: number,
): QuizAnswerRecord {
  return gradeLearningQuestion(question, selectedAnswer);
}

export function summarizeIncorrectConcepts(records: QuizAnswerRecord[]) {
  return summarizeTopicIncorrectConcepts(buoyancyTopicDefinition, records);
}
