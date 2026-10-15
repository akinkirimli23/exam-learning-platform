import { buoyancyConceptMap } from '@/shared/buoyancy-concepts';
import { buoyancyFlashcards, buoyancyPastExam, buoyancyQuiz } from '@/shared/content/physics/buoyancy/data';
import { buoyancyMedia } from '@/shared/content/physics/buoyancy/media';
import { defineTopic } from '@/shared/topic-engine';
import { buoyancyBankTests } from './question-bank';
import { buoyancyQuestionBooklets } from './question-booklets';

export const buoyancyTopicDefinition = defineTopic({
  id: 'buoyancy',
  subjectId: 'fizik',
  headerEyebrow: 'FİZİK / 2026 TYT REFERANSLI PİLOT',
  title: 'Kaldırma Kuvveti',
  flashcardsTitle: 'Kaldırma Kuvveti Kartları',
  quizEyebrow: 'KALDIRMA KUVVETİ · KENDİNİ DENE',
  conceptMap: buoyancyConceptMap,
  flashcards: buoyancyFlashcards,
  quiz: buoyancyQuiz,
  media: buoyancyMedia,
  pastExam: buoyancyPastExam,
  questionBank: buoyancyBankTests,
  questionBooklets: buoyancyQuestionBooklets,
});
