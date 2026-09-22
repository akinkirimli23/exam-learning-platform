import flashcardsJson from './flashcards.json';
import quizJson from './quiz.json';
import {
  learningFlashcardSchema,
  learningQuizQuestionSchema,
  type LearningFlashcard,
  type LearningQuizQuestion,
} from '@/shared/contracts';

export const buoyancyFlashcards: LearningFlashcard[] = learningFlashcardSchema
  .array()
  .parse(flashcardsJson);
export const buoyancyQuiz: LearningQuizQuestion[] = learningQuizQuestionSchema
  .array()
  .parse(quizJson);
