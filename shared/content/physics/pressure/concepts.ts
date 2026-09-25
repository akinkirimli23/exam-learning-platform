import type { ConceptNode } from '@/shared/topic-engine';

const concept = (
  id: string,
  title: string,
  shortDescription: string,
  detailedDescription: string,
  formula: string,
  example: string,
  commonMistake: string,
  relatedConceptIds: string[] = [],
): ConceptNode => ({
  id, title, shortDescription, detailedDescription, formula, example, commonMistake,
  relatedConceptIds, children: [],
});

export const pressureConceptMap: ConceptNode = {
  id: 'pressure',
  title: 'Basınç',
  shortDescription: 'Yüzeye dik kuvvetin birim alana düşen etkisi.',
  detailedDescription: 'Basınç, kuvvetin yüzeye nasıl dağıldığını anlatır. Katıdaki temas alanı, durgun sıvıdaki derinlik ve gazdaki tanecik çarpışmaları farklı modeller gerektirir. Soruyu çözmeden önce hangi ortamın basıncını aradığını belirle.',
  formula: 'P = Fdik / A; 1 Pa = 1 N/m²',
  example: 'Aynı ağırlık geniş tabanda daha küçük katı basıncı oluşturur.',
  commonMistake: 'Basınç (Pa) ile basınç kuvvetini (N) aynı nicelik sanmak.',
  relatedConceptIds: ['solid-pressure', 'liquid-pressure', 'pascal-principle', 'gas-pressure', 'daily-applications'],
  children: [
    concept('solid-pressure', 'Katı basıncı', 'Dik kuvvetin temas alanına oranı.', 'Yatay zemindeki bir cismin ağırlığı çoğu temel soruda zemine uyguladığı dik kuvvettir. Aynı kuvvette alan küçülürse basınç büyür; aynı alanda kuvvet artarsa basınç büyür. Temas alanı gerçek temas eden yüzeydir.', 'P = Fdik / A', 'Kar ayakkabısı ağırlığı geniş alana yayarak kara batmayı azaltır.', 'Yüzey alanı değişince cismin ağırlığının da değiştiğini varsaymak.', ['daily-applications']),
    concept('liquid-pressure', 'Durgun sıvı basıncı', 'Derinlik ve sıvı özkütlesiyle artar.', 'Durgun, homojen ve sıkıştırılamaz kabul edilen sıvıda aynı yatay seviyedeki noktaların sıvı kaynaklı basınçları eşittir. Kabın şekli doğrudan belirleyici değildir. Açık kapta toplam mutlak basınç, atmosfer basıncı ile sıvının oluşturduğu basıncın toplamıdır.', 'Psıvı = ρgh; Pmutlak = Patm + ρgh', 'Baraj duvarının alt bölümü daha büyük sıvı basıncına dayanacak biçimde tasarlanır.', 'Sıvı miktarını veya kabın genişliğini tek başına basınç formülüne koymak.', ['pascal-principle', 'gas-pressure']),
    concept('pascal-principle', 'Pascal prensibi', 'Kapalı sıvıya eklenen basınç her noktaya iletilir.', 'Kapalı ve durgun sıvıya dışarıdan uygulanan basınç artışı sıvının her tarafına aynı büyüklükte iletilir. Bu, farklı derinliklerde toplam basınçların eşit olduğu anlamına gelmez. İdeal hidrolik düzende pistonların basınç artışı eşittir; büyük piston daha büyük kuvvet üretirken daha kısa yol alır.', 'ΔP = F₁/A₁ = F₂/A₂', 'Hidrolik kriko, küçük pistondaki kuvveti büyük pistonda artırır.', 'Kuvvet de aynen iletilir veya iş kazancı oluşur sanmak.', ['liquid-pressure', 'daily-applications']),
    concept('gas-pressure', 'Gaz ve açık hava basıncı', 'Tanecik çarpışmaları ve atmosferin ağırlığı.', 'Gaz tanecikleri yüzeylere çarparak basınç uygular. Atmosfer de ağırlığı nedeniyle yeryüzünde açık hava basıncı oluşturur. Yükseklere çıkıldıkça üzerimizdeki hava sütunu azaldığından açık hava basıncı genellikle düşer. Açık kaptaki sıvı yüzeyine atmosfer basıncı etki eder.', 'Pa = N/m²; açık kapta Pmutlak = Patm + ρgh', 'Dağda açık hava basıncı daha düşük olduğundan su daha düşük sıcaklıkta kaynar.', 'Gaz basıncını sıvıdaki ρgh bağıntısına koşulsuz uygulamak.', ['liquid-pressure', 'daily-applications']),
    concept('daily-applications', 'Günlük yaşam uygulamaları', 'Basınç ilişkilerini tasarımda ve ölçümde kullan.', 'Bıçağın keskin kenarı temas alanını azaltır. Geniş kayak yüzeyi zemindeki basıncı azaltır. Dalgıç derine indikçe daha büyük sıvı basıncı hisseder. Hidrolik fren basınç artışını iletir. Açık hava basıncının değişimi barometreyle izlenir. Her örnekte değişen niceliği ayrı belirlemek gerekir.', 'Katı: F/A · Sıvı: ρgh · Hidrolik: F₁/A₁ = F₂/A₂', 'İnce topuk zemine, aynı ağırlıktaki geniş tabandan daha büyük basınç uygular.', 'Bir örnekteki katı basıncı kuralını bütün akışkanlara doğrudan taşımak.', ['solid-pressure', 'liquid-pressure', 'pascal-principle', 'gas-pressure']),
  ],
};
