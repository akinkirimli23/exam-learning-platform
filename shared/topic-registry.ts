import { buoyancyTopicDefinition } from '@/shared/content/physics/buoyancy/topic';
import { pressureTopicDefinition } from '@/shared/content/physics/pressure/topic';
import { createTopicRegistry } from '@/shared/topic-engine';

export const topicRegistry = createTopicRegistry([buoyancyTopicDefinition, pressureTopicDefinition]);
export const topicDefinitions = [...topicRegistry.values()];

export function getTopicDefinition(topicId: string) {
  return topicRegistry.get(topicId);
}
