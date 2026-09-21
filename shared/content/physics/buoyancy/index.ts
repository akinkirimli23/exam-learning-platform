import flashcardsJson from './flashcards.json';
import quizJson from './quiz.json';
import {
  learningFlashcardSchema,
  learningQuizQuestionSchema,
  type LearningFlashcard,
  type LearningQuizQuestion,
  type QuizAnswerRecord,
} from '@/shared/contracts';
import { buoyancyConceptMap, flattenConceptNodes } from '@/shared/buoyancy-concepts';

const conceptNodes = flattenConceptNodes(buoyancyConceptMap);
const conceptById = new Map(conceptNodes.map((concept) => [concept.id, concept]));

function validateContentIds(
  items: Array<{ id: string; conceptId: string }>,
  idPattern: RegExp,
  contentName: string,
) {
  const seen = new Set<string>();
  for (const item of items) {
    if (!idPattern.test(item.id)) throw new Error(`${contentName} için geçersiz içerik kimliği: ${item.id}`);
    if (seen.has(item.id)) throw new Error(`${contentName} içinde yinelenen kimlik: ${item.id}`);
    if (!conceptById.has(item.conceptId)) {
      throw new Error(`${contentName} içinde canonical olmayan conceptId: ${item.conceptId}`);
    }
    seen.add(item.id);
  }
}

export const buoyancyFlashcards: LearningFlashcard[] = learningFlashcardSchema
  .array()
  .parse(flashcardsJson);
export const buoyancyQuiz: LearningQuizQuestion[] = learningQuizQuestionSchema
  .array()
  .parse(quizJson);

validateContentIds(buoyancyFlashcards, /^buoyancy-card-\d{3}$/, 'Kaldırma Kuvveti kartları');
validateContentIds(buoyancyQuiz, /^buoyancy-q-\d{3}$/, 'Kaldırma Kuvveti testi');

export function getBuoyancyConceptTitle(conceptId: string): string {
  return conceptById.get(conceptId)?.title ?? conceptId;
}

export function gradeBuoyancyQuestion(
  question: LearningQuizQuestion,
  selectedAnswer: number,
): QuizAnswerRecord {
  if (!Number.isInteger(selectedAnswer) || selectedAnswer < 0 || selectedAnswer >= question.options.length) {
    throw new Error('Seçilen cevap seçenek aralığında olmalıdır.');
  }
  return {
    questionId: question.id,
    conceptId: question.conceptId,
    selectedAnswer,
    correctAnswer: question.correctAnswer,
    isCorrect: selectedAnswer === question.correctAnswer,
    difficulty: question.difficulty,
  };
}

export function summarizeIncorrectConcepts(records: QuizAnswerRecord[]) {
  const counts = new Map<string, number>();
  for (const record of records) {
    if (!record.isCorrect) counts.set(record.conceptId, (counts.get(record.conceptId) ?? 0) + 1);
  }
  return [...counts].map(([conceptId, count]) => ({
    conceptId,
    title: getBuoyancyConceptTitle(conceptId),
    count,
  }));
}
