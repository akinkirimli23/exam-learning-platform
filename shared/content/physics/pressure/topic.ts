import { defineTopic } from '@/shared/topic-engine';
import { pressureConceptMap } from './concepts';
import { pressureFlashcards, pressureMainQuiz } from './data';
import { pressureMedia } from './media';

export const pressureTopicDefinition = defineTopic({
  id: 'pressure',
  subjectId: 'fizik',
  headerEyebrow: 'FİZİK / TYT',
  title: 'Basınç',
  flashcardsTitle: 'Basınç Kartları',
  quizEyebrow: 'BASINÇ · KENDİNİ DENE',
  conceptMap: pressureConceptMap,
  flashcards: pressureFlashcards,
  quiz: pressureMainQuiz,
  media: pressureMedia,
});
