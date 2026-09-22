'use client';

import type { ContentDTO } from '@/shared/contracts';
import { buoyancyTopicDefinition } from '@/shared/content/physics/buoyancy/topic';
import {
  TopicFlashcards,
  TopicLearningPage,
  TopicQuiz,
} from './topic-learning-content';

export function BuoyancyLearningPage(props: {
  tab: 'izle' | 'kartlar' | 'testler';
  topic: ContentDTO;
}) {
  return <TopicLearningPage {...props} definition={buoyancyTopicDefinition} />;
}

export function BuoyancyFlashcards() {
  return <TopicFlashcards definition={buoyancyTopicDefinition} />;
}

export function BuoyancyQuiz() {
  return <TopicQuiz definition={buoyancyTopicDefinition} />;
}
