import flashcardsJson from './flashcards.json';
import quizJson from './quiz.json';
import pastExamAnalysisJson from './past-exam-analysis.json';
import pastExamPracticeJson from './past-exam-practice.json';
import {
  learningFlashcardSchema,
  learningQuizQuestionSchema,
  type LearningFlashcard,
  type LearningQuizQuestion,
} from '@/shared/contracts';
import { createPastExamSet } from '@/shared/past-exam';

export const buoyancyFlashcards: LearningFlashcard[] = learningFlashcardSchema
  .array()
  .parse(flashcardsJson);
export const buoyancyQuiz: LearningQuizQuestion[] = learningQuizQuestionSchema
  .array()
  .parse(quizJson);

export const buoyancyPastExam = createPastExamSet(pastExamAnalysisJson, pastExamPracticeJson);
