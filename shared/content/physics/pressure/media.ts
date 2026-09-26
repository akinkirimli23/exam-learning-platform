import { learningMediaSchema } from '@/shared/contracts';

// Only verified Staging objects are listed. The unreviewed PDF/infographics stay hidden.
export const pressureMedia = learningMediaSchema.array().parse([
  {
    id: 'pressure-video-solid', topicId: 'pressure', type: 'video',
    title: 'Katı Basıncı',
    description: 'Dik kuvvet, temas alanı ve katı basıncı ilişkisini video ile incele.',
    bucket: 'learning-media', objectPath: 'physics/pressure/video/Kati_basinci.mp4',
    mimeType: 'video/mp4', conceptIds: ['pressure', 'solid-pressure'], order: 1,
  },
  {
    id: 'pressure-video-liquid', topicId: 'pressure', type: 'video',
    title: 'Sıvı Basıncı',
    description: 'Durgun sıvıda derinlik ve özkütle etkilerini video ile incele.',
    bucket: 'learning-media', objectPath: 'physics/pressure/video/Sivi_Basinci.mp4',
    mimeType: 'video/mp4', conceptIds: ['pressure', 'liquid-pressure', 'pascal-principle'], order: 2,
  },
  {
    id: 'pressure-video-gas', topicId: 'pressure', type: 'video',
    title: 'Gaz Basıncı',
    description: 'Gaz tanecikleri ve açık hava basıncını video ile incele.',
    bucket: 'learning-media', objectPath: 'physics/pressure/video/Gaz_basinci.mp4',
    mimeType: 'video/mp4', conceptIds: ['pressure', 'gas-pressure'], order: 3,
  },
]);
