import { learningMediaSchema, type LearningMedia, type LearningMediaType } from '@/shared/contracts';

const bucket = 'learning-media';

export function createBuoyancyMedia(): LearningMedia[] {
  const media = learningMediaSchema.array().parse([
    {
      id: 'buoyancy-video-physics',
      topicId: 'buoyancy',
      type: 'video',
      title: 'Kaldırma Kuvvetinin Fiziği',
      description:
        'Basınç farkından denge durumlarına kadar kaldırma kuvvetinin temel fiziksel modelini görsel anlatımla ele alır.',
      bucket,
      objectPath: 'physics/buoyancy/video/Kaldirma_Kuvvetinin_Fizigi.mp4',
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
      bucket,
      objectPath: 'physics/buoyancy/slides/Arsimet_ve_Kaldirma_Kuvveti.pdf',
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
      bucket,
      objectPath: 'physics/buoyancy/infographic/Arsimet_Prensibi_ve_Kaldirma_Kuvveti.png',
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

  return media.sort((first, second) => first.order - second.order);
}

export const buoyancyMedia = createBuoyancyMedia();

export function getBuoyancyMedia(type: LearningMediaType): LearningMedia {
  const item = buoyancyMedia.find((candidate) => candidate.type === type);
  if (!item) throw new Error(`Kaldırma Kuvveti için ${type} medyası tanımlı değil.`);
  return item;
}
