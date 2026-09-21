import { learningMediaSchema, type LearningMedia, type LearningMediaType } from '@/shared/contracts';
import { buoyancyConceptMap, flattenConceptNodes } from '@/shared/buoyancy-concepts';

export type BuoyancyMediaUrlConfig = {
  videoUrl?: string;
  videoThumbnailUrl?: string;
  slidesUrl?: string;
  infographicUrl?: string;
};

const canonicalConceptIds = new Set(
  flattenConceptNodes(buoyancyConceptMap).map((concept) => concept.id),
);

const cleanUrl = (value?: string) => value?.trim() ?? '';

export function createBuoyancyMedia(config: BuoyancyMediaUrlConfig = {}): LearningMedia[] {
  const media = learningMediaSchema.array().parse([
    {
      id: 'buoyancy-video-physics',
      topicId: 'buoyancy',
      type: 'video',
      title: 'Kaldırma Kuvvetinin Fiziği',
      description:
        'Basınç farkından denge durumlarına kadar kaldırma kuvvetinin temel fiziksel modelini görsel anlatımla ele alır.',
      url: cleanUrl(config.videoUrl),
      thumbnailUrl: cleanUrl(config.videoThumbnailUrl),
      mimeType: 'video/mp4',
      conceptIds: [
        'buoyancy',
        'archimedes-principle',
        'submerged-volume',
        'fluid-density',
        'floating-state',
        'suspended-state',
        'sinking-state',
      ],
      order: 1,
    },
    {
      id: 'buoyancy-slides-archimedes',
      topicId: 'buoyancy',
      type: 'slides',
      title: 'Arşimet ve Kaldırma Kuvveti',
      description:
        'Arşimet ilkesini, matematiksel modeli ve sıvı içindeki denge durumlarını birlikte inceleyen PDF slayt materyali.',
      url: cleanUrl(config.slidesUrl),
      mimeType: 'application/pdf',
      conceptIds: [
        'archimedes-principle',
        'mathematical-model',
        'equilibrium-states',
        'overflow-and-weight',
      ],
      order: 2,
    },
    {
      id: 'buoyancy-infographic-archimedes',
      topicId: 'buoyancy',
      type: 'infographic',
      title: 'Arşimet Prensibi ve Kaldırma Kuvveti',
      description:
        'Kaldırma kuvvetinin kaynağını, formülünü ve yüzme durumlarını tek görselde özetleyen infografik.',
      url: cleanUrl(config.infographicUrl),
      mimeType: 'image/png',
      conceptIds: [
        'archimedes-principle',
        'pressure-force-difference',
        'buoyancy-equation',
        'floating-state',
        'suspended-state',
        'sinking-state',
      ],
      order: 3,
    },
  ]);

  for (const item of media) {
    for (const conceptId of item.conceptIds) {
      if (!canonicalConceptIds.has(conceptId)) {
        throw new Error(`${item.id} için canonical olmayan conceptId: ${conceptId}`);
      }
    }
  }

  return media.sort((first, second) => first.order - second.order);
}

export const buoyancyMedia = createBuoyancyMedia({
  videoUrl: process.env.NEXT_PUBLIC_BUOYANCY_VIDEO_URL,
  videoThumbnailUrl: process.env.NEXT_PUBLIC_BUOYANCY_VIDEO_THUMBNAIL_URL,
  slidesUrl: process.env.NEXT_PUBLIC_BUOYANCY_SLIDES_URL,
  infographicUrl: process.env.NEXT_PUBLIC_BUOYANCY_INFOGRAPHIC_URL,
});

export function getBuoyancyMedia(type: LearningMediaType): LearningMedia {
  const item = buoyancyMedia.find((candidate) => candidate.type === type);
  if (!item) throw new Error(`Kaldırma Kuvveti için ${type} medyası tanımlı değil.`);
  return item;
}
