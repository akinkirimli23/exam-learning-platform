import { learningMediaSchema } from '@/shared/contracts';

// Reviewed derivatives only. Originals remain in the private editorial archive.
const prefix = 'physics/pressure/reviewed-2026-10-15';
const videoNote = 'Bu önizleme, sesli anlatım ile sessiz düzeltme kartlarını birlikte içerir. Kart gösterilen bölümlerde seslendirme yoktur; doğru bilgi ve kullanım koşulları ekrandan okunur.';

export const pressureMedia = learningMediaSchema.array().parse([
  {
    id: 'pressure-video-solid', topicId: 'pressure', type: 'video',
    title: 'Katı Basıncını Hesaplamak',
    description: 'Dik kuvvet, temas alanı ve basınç ilişkisini günlük örneklerle incele.',
    editorialNote: videoNote,
    bucket: 'learning-media', objectPath: `${prefix}/video/Kati_Basincini_Hesaplamak_Incelenmis.mp4`,
    durationSeconds: 393, mimeType: 'video/mp4', conceptIds: ['pressure', 'solid-pressure'], order: 1,
  },
  {
    id: 'pressure-video-liquid', topicId: 'pressure', type: 'video',
    title: 'Sıvı Basıncında Ustalaşmak',
    description: 'Derinlik, sıvı basınç kuvveti, U borusu ve Pascal ilkesini birlikte öğren.',
    editorialNote: `${videoNote} Bu videonun büyük bölümü okuma kartlarından oluşur.`,
    bucket: 'learning-media', objectPath: `${prefix}/video/Sivi_Basincinda_Ustalasmak_Incelenmis.mp4`,
    durationSeconds: 593, mimeType: 'video/mp4', conceptIds: ['pressure', 'liquid-pressure', 'pascal-principle'], order: 2,
  },
  {
    id: 'pressure-video-gas', topicId: 'pressure', type: 'video',
    title: 'Gaz Basıncını Anlamak',
    description: 'Atmosfer, ideal gaz ve basınç farkının etkilerini koşullarıyla incele.',
    editorialNote: videoNote,
    bucket: 'learning-media', objectPath: `${prefix}/video/Gaz_Basincini_Anlamak_Incelenmis.mp4`,
    durationSeconds: 430, mimeType: 'video/mp4', conceptIds: ['pressure', 'gas-pressure'], order: 3,
  },
  {
    id: 'pressure-slides-guide', topicId: 'pressure', type: 'slides',
    title: 'Basınç ve Kuvvet Ders Rehberi',
    description: 'Katı, sıvı ve gaz basıncını doğru çizimler, örnek hesaplar ve formüllerin kullanım koşullarıyla anlatan 15 sayfalık rehber.',
    bucket: 'learning-media', objectPath: `${prefix}/slides/Basinc_ve_Kuvvet_Ders_Rehberi.pdf`,
    mimeType: 'application/pdf', conceptIds: ['pressure'], order: 4,
  },
  {
    id: 'pressure-infographic-summary', topicId: 'pressure', type: 'infographic',
    title: 'Basınç Konu Özeti',
    description: 'Temel bağıntıları ve bilimsel diyagramları tek görselde gözden geçir.',
    bucket: 'learning-media', objectPath: `${prefix}/infographic/Basinc_Konu_Ozeti.png`,
    mimeType: 'image/png', conceptIds: ['pressure'], order: 5,
  },
  {
    id: 'pressure-infographic-map', topicId: 'pressure', type: 'infographic',
    title: 'Basınç Kavram Haritası',
    collapsible: true,
    description: 'Sekiz ana dal arasındaki bağlantıları keşfet; formülleri koşullarıyla hatırla.',
    bucket: 'learning-media', objectPath: `${prefix}/infographic/Basinc_Kavram_Haritasi.png`,
    mimeType: 'image/png', conceptIds: ['pressure'], order: 6,
  },
]);
