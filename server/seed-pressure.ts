import { contentSchema, questionSchema } from '@/shared/contracts';
import { pressureFlashcards, pressureMainQuiz } from '@/shared/content/physics/pressure/data';
import type { DB } from './db';

const source = {
  url: 'https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/tyt-fizik/files/basic-html/page130.html',
  license: 'İvme için özgün hazırlanmış demo anlatım ve sorular; OGM yalnız kapsam referansıdır.',
  attribution: 'İvme Basınç demo paketi',
};

const lessons = [
  {
    id: 'pressure-lesson-solid', title: 'Katı basıncı: kuvveti alana dağıt', minutes: 6,
    body: 'Bir yüzeye dik etki eden kuvvetin birim alana düşen miktarı basınçtır. Katı için P = Fdik/A kullanılır. Yatay zemindeki bir cisimde, başka düşey kuvvet yoksa Fdik cismin ağırlığına eşittir. Basınç kuvvetinin birimi newton, basıncın birimi pascaldır; 1 Pa = 1 N/m².\n\nAynı ağırlığı daha geniş bir yüzeye yaydığında basınç azalır. Kar ayakkabısının geniş tabanı batmayı azaltır; bıçağın keskin ucu ise aynı kuvveti dar alanda toplayarak kesmeyi kolaylaştırır. Basınç değiştiğinde cismin ağırlığı kendiliğinden değişmez.\n\nÖrnek: 120 N kuvvet 0,04 m² alana etki ediyorsa P = 120/0,04 = 3000 Pa. Metrekare yerine santimetrekare kullanıyorsan önce alanı dönüştür.',
  },
  {
    id: 'pressure-lesson-liquid', title: 'Durgun sıvıda derinlik', minutes: 7,
    body: 'Durgun ve homojen sıvıda yüzeyden h kadar aşağıdaki sıvı basıncı Psıvı = ρgh bağıntısıyla bulunur. Burada ρ özkütle, g yerçekimi ivmesi, h düşey derinliktir. Aynı sıvıda aynı derinlikteki noktalar, kapların genişliği farklı olsa bile aynı sıvı basıncına sahiptir.\n\nDerine indikçe basınç artar; bu yüzden barajların alt bölümleri daha büyük yüke göre tasarlanır. Kabın şekli veya sıvının toplam hacmi tek başına ρgh içine girmez. Birbirine karışmayan katmanlarda her katmanın ρgh katkısı ayrı hesaplanıp toplanır.\n\nAçık kaptaki mutlak basınç sorulursa atmosfer basıncı da eklenir: Pmutlak = Patm + ρgh. Yalnız sıvının yaptığı basınç soruluyorsa Patm eklenmez. Basınç (Pa) ile tabana etki eden toplam kuvvetin (N) farklı nicelikler olduğunu unutma.',
  },
  {
    id: 'pressure-lesson-pascal', title: 'Pascal prensibi ve hidrolik sistemler', minutes: 6,
    body: 'Kapalı bir sıvıya dışarıdan uygulanan ek basınç artışı, sıvının her noktasına aynı büyüklükte iletilir. Bu ifade farklı derinliklerdeki toplam basınçların eşit olduğu anlamına gelmez; eşit olan, uygulanan değişimdir.\n\nİdeal hidrolik düzende F₁/A₁ = F₂/A₂ yazılır. Büyük alanlı piston daha büyük kuvvet verir. Örneğin 2 cm² pistona 40 N uygulanır ve diğer piston 20 cm² ise ikinci kuvvet 400 N olur. Alanlar aynı birimde olduğu için oran doğrudan kullanılabilir.\n\nKuvvet kazancı bedelsiz enerji sağlamaz. Sıvı hacmi korunduğundan A₁d₁ = A₂d₂; büyük piston daha kısa yol alır. Hidrolik kriko ve frenlerde bu ilke kullanılır.',
  },
  {
    id: 'pressure-lesson-gas', title: 'Gazlar ve açık hava basıncı', minutes: 6,
    body: 'Gaz tanecikleri kabın duvarlarına sürekli çarpar ve her yönde basınç uygular. Atmosferin ağırlığı da açık hava basıncını oluşturur. Yükseğe çıkınca üstümüzde kalan hava sütunu azalır; bu nedenle açık hava basıncı genellikle düşer.\n\nBarometre açık hava basıncını ölçer. Açık kaptaki suyun yüzeyinde atmosfer basıncı bulunur; derindeki mutlak basınç için bu değere sıvının ρgh katkısı eklenir. Suyun yalnızca sıvı kaynaklı basıncı soruluyorsa atmosferi dahil etme.\n\nAçık hava basıncı azaldığında su daha düşük sıcaklıkta kaynar. Düdüklü tencerede ise iç basınç arttığı için kaynama sıcaklığı yükselir. Bu karşılaştırma kaynama sıcaklığının ortam basıncına bağlı olduğunu gösterir.',
  },
  {
    id: 'pressure-lesson-compare', title: 'Hangi bağıntıyı kullanacağım?', minutes: 5,
    body: 'Önce sistemin türünü belirle: Katı bir zemine mi dayanıyor, durgun sıvıda bir nokta mı inceleniyor, kapalı sıvıya dışarıdan basınç mı uygulanıyor, yoksa gaz veya açık hava mı söz konusu? Katıda Fdik/A, durgun sıvıda ρgh, Pascal düzeninde ek basınçların eşitliği kullanılır.\n\nSonra sorulan niceliği ayır: basınç mı, basınç kuvveti mi, sıvı kaynaklı gösterge basıncı mı, mutlak basınç mı? Birimleri SI düzenine getir. Örneğin 1000 Pa = 1 kPa. Katmanlı sıvıda katkıları topla; hidrolik düzende kuvvet oranı ile yol oranının ters yönde değiştiğini kontrol et.\n\nYanlış yaptığında yalnız doğru şıkkı ezberleme. Kavram haritasında ilgili düğüme dön, hangi değişkeni veya basınç türünü karıştırdığını bul, ardından farklı seviyede yeni bir soru çöz.',
  },
] as const;

const objectives = [
  ['solid-pressure', 'Katı basıncı ve temas alanı'],
  ['liquid-pressure', 'Durgun sıvıda basınç'],
  ['pascal-principle', 'Pascal prensibi'],
  ['gas-pressure', 'Gaz ve atmosfer basıncı'],
  ['daily-applications', 'Günlük yaşamda basınç'],
  ['pressure', 'Basıncın temel tanımı'],
] as const;

/** Additive content seed: caller must select and verify the target database first. */
export async function seedPressureContent(db: DB): Promise<boolean> {
  const ids = [
    'pressure', ...objectives.map(([id]) => `pressure-obj-${id}`),
    ...lessons.map(item => item.id), ...pressureFlashcards.map(item => item.id),
    ...pressureMainQuiz.map(item => item.id),
  ];
  const expected = new Map<string, { kind: string; parentId: string }>([
    ['pressure', { kind: 'topic', parentId: 'physics' }],
    ...objectives.map(([id]) => [`pressure-obj-${id}`, { kind: 'objective', parentId: 'pressure' }] as const),
    ...lessons.map(item => [item.id, { kind: 'lesson', parentId: 'pressure' }] as const),
    ...pressureFlashcards.map(item => [item.id, { kind: 'card', parentId: 'pressure' }] as const),
    ...pressureMainQuiz.map(item => [item.id, { kind: 'question', parentId: 'pressure' }] as const),
  ]);
  const collisions = (await db.query('SELECT logical_id,kind,status,parent_id FROM content WHERE logical_id = ANY($1)', [ids])).rows;
  if (collisions.length === ids.length) {
    if (collisions.every(row => {
      const item = expected.get(row.logical_id);
      return item && row.kind === item.kind && row.parent_id === item.parentId && row.status === 'published';
    })) return false;
  }
  if (collisions.length) throw new Error('Basınç içerik kimlikleri önceden kullanılmış; otomatik ekleme durduruldu.');
  const parents = (await db.query("SELECT logical_id,kind,status FROM content WHERE logical_id IN ('yks-2026','physics')")).rows;
  if (!parents.some(row => row.logical_id === 'yks-2026' && row.kind === 'exam' && row.status === 'published') ||
      !parents.some(row => row.logical_id === 'physics' && row.kind === 'subject' && row.status === 'published')) {
    throw new Error('Yayımlanmış YKS/Fizik üst içeriği bulunamadı.');
  }

  async function put(logicalId: string, kind: string, parentId: string, title: string, payload: Record<string, unknown>) {
    const parsed = contentSchema.parse({ logicalId, kind, parentId, title, demo: true, payload, source });
    await db.query(
      "INSERT INTO content(id,logical_id,kind,parent_id,title,revision,status,demo,payload,source,reviewed_by,reviewed_at) VALUES($1,$2,$3,$4,$5,1,'published',true,$6,$7,'pressure-content-review',now())",
      [`${parsed.logicalId}-v1`, parsed.logicalId, parsed.kind, parsed.parentId, parsed.title, JSON.stringify(parsed.payload), JSON.stringify(parsed.source)],
    );
  }

  await put('pressure', 'topic', 'physics', 'Basınç', {
    description: 'Katı, sıvı ve gaz basıncını karşılaştır; Pascal prensibini ve günlük yaşam uygulamalarını anlamlandır.',
    prerequisites: 'Dik kuvvet ve ağırlık, alan birimleri, özkütle (ρ=m/V), derinlik ve birim dönüşümleri.',
    curriculumNote: 'Kapsam için MEB OGM TYT Fizik konu özetleri referans alındı. Anlatım ve sorular İvme için özgün yazıldı; resmî materyalin metni ve görselleri kopyalanmadı. İdeal/durgun sıvı varsayımları ilgili bölümlerde belirtilir.',
    minutes: 30,
  });
  for (const [id, title] of objectives) {
    await put(`pressure-obj-${id}`, 'objective', 'pressure', title, { description: `${title} ilişkisini ve soru çözümünü yorumlar.` });
  }
  for (const [index, lesson] of lessons.entries()) {
    await put(lesson.id, 'lesson', 'pressure', lesson.title, { body: lesson.body, minutes: lesson.minutes, order: index });
  }
  for (const [index, card] of pressureFlashcards.entries()) {
    await put(card.id, 'card', 'pressure', card.front, { front: card.front, back: card.back, order: index });
  }
  for (const question of pressureMainQuiz) {
    const payload = questionSchema.parse({
      text: question.question,
      options: [...question.options],
      correct: question.correctAnswer,
      steps: ['Sorulan basınç türünü ve verilen nicelikleri ayır.', question.explanation],
      distractors: question.options.map((_, index) => index === question.correctAnswer
        ? `Doğru: ${question.explanation}` : `Bu seçenek yanlıştır. ${question.misconception} ${question.explanation}`),
      difficulty: question.difficulty === 'kolay' ? 'Temel' : question.difficulty === 'orta' ? 'Orta' : 'İleri',
      objectiveId: `pressure-obj-${question.conceptId}`,
      misconceptions: [question.misconception],
      pool: 'practice',
      ...(question.visualId ? { imageId: question.visualId } : {}),
    });
    await put(question.id, 'question', 'pressure', question.question.slice(0, 170), payload);
  }
  return true;
}
