import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ConceptExplorer } from '../components/concept-explorer';
import {
  TopicFlashcards,
  TopicLearningPage,
  TopicQuiz,
} from '../components/topic-learning-content';
import { buoyancyTopicDefinition } from '../shared/content/physics/buoyancy/topic';
import {
  createTopicRegistry,
  defineTopic,
  type TopicDefinition,
} from '../shared/topic-engine';
import { topicRegistry } from '../shared/topic-registry';

function createFixtureTopic(overrides: Partial<TopicDefinition> = {}): TopicDefinition {
  return {
    id: 'fixture-topic',
    subjectId: 'test-subject',
    headerEyebrow: 'TEST · FIXTURE',
    title: 'Örnek Konu',
    flashcardsTitle: 'Örnek Kartlar',
    quizEyebrow: 'ÖRNEK · KENDİNİ DENE',
    conceptMap: {
      id: 'fixture-topic',
      title: 'Örnek Konu',
      shortDescription: 'Yalnızca engine testinde kullanılan kök kavram.',
      detailedDescription: 'Üretim registry’sine eklenmeyen sentetik test verisi.',
      relatedConceptIds: ['fixture-concept'],
      children: [
        {
          id: 'fixture-concept',
          title: 'Örnek Kavram',
          shortDescription: 'Sentetik alt kavram.',
          detailedDescription: 'Canonical ilişki doğrulamasını sınayan alt kavram.',
          relatedConceptIds: ['fixture-topic'],
          children: [],
        },
      ],
    },
    flashcards: [
      {
        id: 'fixture-topic-card-001',
        conceptId: 'fixture-concept',
        front: 'Örnek kart sorusu nedir?',
        back: 'Bu yalnızca test fixture yanıtıdır.',
        formula: 'x = 1',
        commonMistake: 'Fixture verisini gerçek içerik sanmak.',
      },
    ],
    quiz: [
      {
        id: 'fixture-topic-q-001',
        conceptId: 'fixture-concept',
        difficulty: 'kolay',
        question: 'Bu veri hangi amaçla kullanılır?',
        options: ['Engine testi', 'Üretim içeriği'],
        correctAnswer: 0,
        explanation: 'Veri yalnızca generic engine testine aittir.',
        misconception: 'Fixture’ın gerçek ders içeriği olduğunu düşünmek.',
      },
    ],
    media: [],
    ...overrides,
  };
}

describe('Generic Topic Engine', () => {
  it('ikinci bir konuyu ortak registry ve ortak bileşenlerle çalıştırır', () => {
    const fixture = defineTopic(createFixtureTopic());
    const registry = createTopicRegistry([buoyancyTopicDefinition, fixture]);
    const topicPage = renderToStaticMarkup(
      <TopicLearningPage
        tab="kartlar"
        definition={fixture}
        topic={{
          id: 'fixture-content',
          logical_id: 'fixture-topic',
          kind: 'topic',
          parent_id: 'test-subject',
          title: 'Örnek Konu',
          demo: true,
          status: 'published',
          revision: 1,
          payload: { description: 'Yalnızca test verisi.' },
          source: { url: '', license: 'Test fixture', attribution: '' },
        }}
      />,
    );

    expect(registry.get('fixture-topic')).toBeDefined();
    expect(topicPage).toContain('/konu/fixture-topic/ogren');
    expect(renderToStaticMarkup(<TopicFlashcards definition={fixture} />)).toContain('Örnek Kartlar');
    expect(renderToStaticMarkup(<TopicQuiz definition={fixture} />)).toContain('Bu veri hangi amaçla');
    expect(renderToStaticMarkup(<ConceptExplorer conceptMap={fixture.conceptMap} />)).toContain(
      '1 ana dalda bağlantıları keşfet',
    );
  });

  it('test fixture konusunu üretim registry’sine eklemez', () => {
    expect([...topicRegistry.keys()]).toEqual(['buoyancy']);
    expect(topicRegistry.has('fixture-topic')).toBe(false);
  });

  it.each([
    ['flashcard', { flashcards: [{ ...createFixtureTopic().flashcards[0], conceptId: 'unknown' }] }],
    ['quiz', { quiz: [{ ...createFixtureTopic().quiz[0], conceptId: 'unknown' }] }],
    [
      'media',
      {
        media: [
          {
            id: 'fixture-video',
            topicId: 'fixture-topic',
            type: 'video' as const,
            title: 'Fixture video',
            description: 'Yalnızca canonical conceptId doğrulama fixture verisi.',
            bucket: 'fixture',
            objectPath: 'fixture/video.mp4',
            mimeType: 'video/mp4',
            conceptIds: ['unknown'],
            order: 1,
          },
        ],
      },
    ],
  ])('%s içindeki canonical olmayan conceptId değerini reddeder', (_kind, overrides) => {
    expect(() => defineTopic(createFixtureTopic(overrides))).toThrow(/unknown concept/);
  });

  it('kavram ilişkilerindeki canonical olmayan hedefi reddeder', () => {
    const fixture = createFixtureTopic();
    expect(() =>
      defineTopic({
        ...fixture,
        conceptMap: { ...fixture.conceptMap, relatedConceptIds: ['unknown'] },
      }),
    ).toThrow(/unknown concept/);
  });
});
