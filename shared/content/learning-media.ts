import type { LearningMedia } from '@/shared/contracts';
import { topicDefinitions } from '@/shared/topic-registry';

export const learningMediaRegistry: readonly LearningMedia[] = topicDefinitions.flatMap(
  (topic) => [...topic.media],
);

export function getLearningMediaById(mediaId: string): LearningMedia | undefined {
  return learningMediaRegistry.find((item) => item.id === mediaId);
}
