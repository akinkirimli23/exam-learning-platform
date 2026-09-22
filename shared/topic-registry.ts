import { buoyancyTopicDefinition } from '@/shared/content/physics/buoyancy/topic';
import { createTopicRegistry } from '@/shared/topic-engine';

export const topicRegistry = createTopicRegistry([buoyancyTopicDefinition]);
export const topicDefinitions = [...topicRegistry.values()];

export function getTopicDefinition(topicId: string) {
  return topicRegistry.get(topicId);
}
