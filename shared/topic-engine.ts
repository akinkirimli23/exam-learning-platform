import type {
  LearningFlashcard,
  LearningMedia,
  LearningQuizQuestion,
  QuizAnswerRecord,
} from '@/shared/contracts';

export type ConceptNode = {
  id: string;
  title: string;
  shortDescription: string;
  detailedDescription: string;
  formula?: string;
  example?: string;
  commonMistake?: string;
  relatedConceptIds: string[];
  children: ConceptNode[];
};

export type TopicDefinition = {
  id: string;
  subjectId: string;
  headerEyebrow: string;
  title: string;
  flashcardsTitle: string;
  quizEyebrow: string;
  conceptMap: ConceptNode;
  flashcards: readonly LearningFlashcard[];
  quiz: readonly LearningQuizQuestion[];
  media: readonly LearningMedia[];
};

export function flattenConceptNodes(root: ConceptNode): ConceptNode[] {
  return [root, ...root.children.flatMap(flattenConceptNodes)];
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function assertUnique(values: readonly string[], label: string, topicId: string) {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) throw new Error(`${topicId}: duplicate ${label} '${value}'`);
    seen.add(value);
  }
}

export function defineTopic(definition: TopicDefinition): TopicDefinition {
  if (!definition.id.trim()) throw new Error('Topic id cannot be empty');
  if (definition.conceptMap.id !== definition.id) {
    throw new Error(`${definition.id}: concept map root id must match the topic id`);
  }

  const conceptNodes = flattenConceptNodes(definition.conceptMap);
  const conceptIds = conceptNodes.map((concept) => concept.id);
  assertUnique(conceptIds, 'concept id', definition.id);
  const canonicalConceptIds = new Set(conceptIds);

  for (const concept of conceptNodes) {
    for (const relatedId of concept.relatedConceptIds) {
      if (!canonicalConceptIds.has(relatedId)) {
        throw new Error(
          `${definition.id}: concept '${concept.id}' references unknown concept '${relatedId}'`,
        );
      }
    }
  }

  const flashcardPattern = new RegExp(`^${escapeRegExp(definition.id)}-card-\\d{3}$`);
  assertUnique(definition.flashcards.map((item) => item.id), 'flashcard id', definition.id);
  for (const flashcard of definition.flashcards) {
    if (!flashcardPattern.test(flashcard.id)) {
      throw new Error(`${definition.id}: invalid flashcard id '${flashcard.id}'`);
    }
    if (!canonicalConceptIds.has(flashcard.conceptId)) {
      throw new Error(
        `${definition.id}: flashcard '${flashcard.id}' references unknown concept '${flashcard.conceptId}'`,
      );
    }
  }

  const quizPattern = new RegExp(`^${escapeRegExp(definition.id)}-q-\\d{3}$`);
  assertUnique(definition.quiz.map((item) => item.id), 'quiz id', definition.id);
  for (const question of definition.quiz) {
    if (!quizPattern.test(question.id)) {
      throw new Error(`${definition.id}: invalid quiz id '${question.id}'`);
    }
    if (!canonicalConceptIds.has(question.conceptId)) {
      throw new Error(
        `${definition.id}: quiz question '${question.id}' references unknown concept '${question.conceptId}'`,
      );
    }
  }

  assertUnique(definition.media.map((item) => item.id), 'media id', definition.id);
  for (const item of definition.media) {
    if (item.topicId !== definition.id) {
      throw new Error(`${definition.id}: media '${item.id}' has topicId '${item.topicId}'`);
    }
    for (const conceptId of item.conceptIds) {
      if (!canonicalConceptIds.has(conceptId)) {
        throw new Error(
          `${definition.id}: media '${item.id}' references unknown concept '${conceptId}'`,
        );
      }
    }
  }

  return Object.freeze({
    ...definition,
    flashcards: Object.freeze([...definition.flashcards]),
    quiz: Object.freeze([...definition.quiz]),
    media: Object.freeze([...definition.media]),
  });
}

export function createTopicRegistry(
  definitions: readonly TopicDefinition[],
): ReadonlyMap<string, TopicDefinition> {
  const registry = new Map<string, TopicDefinition>();
  const mediaIds = new Set<string>();
  for (const input of definitions) {
    const definition = defineTopic(input);
    if (registry.has(definition.id)) throw new Error(`Duplicate topic id '${definition.id}'`);
    for (const item of definition.media) {
      if (mediaIds.has(item.id)) throw new Error(`Duplicate media id '${item.id}'`);
      mediaIds.add(item.id);
    }
    registry.set(definition.id, definition);
  }
  return registry;
}

export function getConceptTitle(definition: TopicDefinition, conceptId: string) {
  return flattenConceptNodes(definition.conceptMap).find((concept) => concept.id === conceptId)?.title ?? conceptId;
}

export function gradeLearningQuestion(
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

export function summarizeIncorrectConcepts(
  definition: TopicDefinition,
  records: readonly QuizAnswerRecord[],
) {
  const counts = new Map<string, number>();
  for (const record of records) {
    if (!record.isCorrect) counts.set(record.conceptId, (counts.get(record.conceptId) ?? 0) + 1);
  }
  return [...counts].map(([conceptId, count]) => ({
    conceptId,
    title: getConceptTitle(definition, conceptId),
    count,
  }));
}
