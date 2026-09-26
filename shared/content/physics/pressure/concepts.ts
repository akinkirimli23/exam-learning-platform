import type { ConceptNode } from '@/shared/topic-engine';

type Leaf = [id: string, title: string, summary: string, explanation: string, formula?: string];

function branch(
  id: string,
  title: string,
  summary: string,
  explanation: string,
  leaves: Leaf[],
  relatedConceptIds: string[] = [],
): ConceptNode {
  return {
    id, title, shortDescription: summary, detailedDescription: explanation,
    relatedConceptIds,
    children: leaves.map(([leafId, leafTitle, leafSummary, leafExplanation, formula]) => ({
      id: leafId, title: leafTitle, shortDescription: leafSummary,
      detailedDescription: leafExplanation, formula, relatedConceptIds: [], children: [],
    })),
  };
}

// Existing canonical IDs remain unchanged for cards, tests, progress and mistake notes.
export const pressureConceptMap: ConceptNode = {
  id: 'pressure', title: 'Basınç',
  shortDescription: 'Dik kuvvetin birim alandaki etkisi.',
  detailedDescription: 'Basıncı katı temasından durgun sıvılara, hareketli akışkanlara ve gazlara uzanan sekiz dalda incele. Önce ortamı, ardından sorulan basınç türünü ve modelin koşullarını belirle.',
  formula: 'P = Fdik / A; 1 Pa = 1 N/m²',
  commonMistake: 'Basınç (Pa) ile basınç kuvvetini (N) aynı nicelik saymak.',
  relatedConceptIds: ['solid-pressure', 'liquid-pressure', 'gas-pressure'],
  children: [
    branch('pressure-basics', 'Temel Kavramlar', 'Tanım, sembol, birim ve kuvvet.',
      'Basınç, yüzeye dik kuvvetin alana dağılımını anlatır. Kuvvetin birimi N, basıncın birimi Pa’dır.', [
        ['pressure-definition', 'Basıncın tanımı', 'Birim alana düşen dik kuvvet.', 'Ortalama basınç, yüzeye dik kuvvetin temas alanına bölünmesiyle bulunur. Noktasal basınç için çok küçük bir yüzey elemanı düşünülür.', 'P = Fdik / A'],
        ['pressure-symbol', 'Sembol', 'Basınç P veya p ile gösterilir.', 'Basınç için P ya da p, basınç kuvveti için F kullanılır. Aynı sembolü iki farklı nicelik için kullanma.'],
        ['pressure-formula', 'Formül: P = Fdik/A', 'Dik kuvveti temas alanına böl.', 'Yüzeye paralel kuvvet bileşeni formüldeki dik kuvvet değildir. Alanı m² cinsinden kullan.', 'P = Fdik / A'],
        ['pressure-unit', 'Birim: Pascal', '1 Pa = 1 N/m².', 'Basıncın SI birimi paskaldır. Bir metrekareye bir newton dik kuvvet düşmesi bir paskala karşılık gelir.', '1 Pa = 1 N/m²'],
        ['pressure-force', 'Basınç kuvveti', 'Basınç ile kuvvet farklıdır.', 'Düz bir yüzeyde basınç her yerde aynıysa bileşke dik kuvvet F = P·A olur. Basınç yüzey boyunca değişiyorsa yerel kuvvet katkıları toplanır.', 'F = P·A (sabit P)'],
      ], ['solid-pressure', 'liquid-pressure-force']),

    branch('solid-pressure', 'Katı Basıncı', 'Temas alanı ve dik kuvvet.',
      'Katının yüzeye uyguladığı ortalama basınç dik kuvvet ile gerçek temas alanına bağlıdır. Kuvvet ya da basıncın katıda her koşulda “aynen iletildiği” söylenemez.', [
        ['solid-pressure-formula', 'Formül', 'P = Fdik/A.', 'Yüzeye dik kuvveti gerçek temas alanına böl. Kuvvet sabitse temas alanı küçüldükçe ortalama basınç büyür.', 'P = Fdik / A'],
        ['solid-force-transfer', 'Kuvvet iletimi', 'Aktarım düzeneğe bağlıdır.', 'İdeal, tek eksenli ve statik dengeli bir elemanda uç kuvvetleri dengelenebilir. Sürtünme, ivme, yan temas veya farklı geometride aynı değer ve doğrultu genellenemez.', 'ΣF = 0 (statik denge)'],
        ['solid-pressure-transfer', 'Basınç iletimi', 'Alan değişirse basınç da değişebilir.', 'Giriş ve çıkış temas alanları farklı olabilir. Aynı kuvvet bile farklı alanlara yayıldığında farklı ortalama basınç oluşturur.'],
        ['solid-area-effect', 'Yüzey alanının etkisi', 'Fdik sabitse A küçüldükçe P büyür.', 'Temas alanını değiştirirken dik kuvvetin gerçekten sabit kaldığını kontrol et. Daha geniş yüzey aynı kuvveti daha düşük ortalama basınçla aktarır.', 'P ∝ 1/A (Fdik sabit)'],
        ['solid-examples', 'Bıçak, çivi ve topuklu ayakkabı', 'Dar temas daha büyük basınç.', 'Bıçak ağzı, çivi ucu ve ince topuk kuvveti dar alanda toplar. Keskinlik kütleyi ya da uygulanan kuvveti kendiliğinden artırmaz.'],
      ], ['pressure-basics', 'daily-applications']),

    branch('liquid-pressure', 'Sıvı Basıncı', 'Durgun sıvıda derinlik ve özkütle.',
      'Durgun, homojen sıvıda h derinliğinin yüzeye göre gösterge basıncı ρgh’dir. Açık kaptaki mutlak basınç için atmosfer basıncı ayrıca eklenir.', [
        ['liquid-pressure-formula', 'Formül: P = ρgh', 'Sıvının oluşturduğu gösterge basıncı.', 'ρ özkütle, g yerçekimi ivmesi, h düşey derinliktir. Açık kaptaki mutlak basınç P_atm + ρgh olur.', 'P_g = ρgh'],
        ['pascal-principle', 'Pascal ilkesi', 'Kapalı akışkandaki ΔP iletilir.', 'Kapalı ve durgun akışkana dışarıdan uygulanan basınç değişimi her yöne azalmadan iletilir. Farklı derinliklerde toplam basınçların eşit olması gerekmez.', 'ΔP_uygulanan aynı büyüklükte iletilir'],
        ['liquid-depth-density', 'Derinlik ve özkütle', 'h ve ρ arttıkça P_g büyür.', 'Aynı g altında h veya ρ arttıkça sıvı kaynaklı basınç artar. Aynı homojen durgun sıvıda ve aynı yüzey basıncında eşit derinliklerin basıncı eşittir.', 'P_g = ρgh'],
        ['liquid-layers', 'Karışmayan sıvılar', 'Katmanların katkılarını topla.', 'Dengedeki karışmayan sıvı katmanlarında alt noktadaki gösterge basıncı her katmanın ρ_i g h_i katkılarının toplamıdır. Mutlak basınç için yüzey basıncı da eklenir.', 'P_g = g·Σ(ρ_i h_i)'],
        ['liquid-vessel-graphs', 'Düz, genişleyen ve daralan kapların grafikleri', 'Sabit debide eğim kesite bağlıdır.', 'Sabit hacimsel debi Q ile dolumda dh/dt = Q/A(h). Düz kapta yükseklik doğrusal artar; yukarı genişleyen kapta eğim azalır, daralanda artar. Debi değişirse yorum da değişir.', 'dh/dt = Q/A(h)'],
      ], ['pascal-principle', 'liquid-pressure-force', 'gas-pressure']),

    branch('liquid-pressure-force', 'Sıvı Basınç Kuvveti', 'Basıncı alan üzerinde topla.',
      'Sıvı basıncı derinlikle değişir. Düz, dikey ve sabit özkütleli bir yüzeyde ortalama gösterge basıncı orta derinlikten bulunabilir.', [
        ['liquid-force-formula', 'Formül: F = P_ort × A', 'Ortalama basınçla alanı çarp.', 'Düz dikey levhada hidrostatik gösterge basıncı doğrusal değişiyorsa P_ort = ρg h_orta kullanılır. Genel durumda yüzeydeki yerel katkılar toplanır.', 'F = P_ort·A'],
        ['liquid-side-pressure', 'Yan yüzeylerde ortalama basınç', 'Orta derinlik kullanılabilir.', 'Sabit özkütleli durgun sıvıda düz dikey levhanın ortalama gösterge basıncı orta derinlikteki basınçtır. Bileşke kuvvetin uygulama noktası genelde orta nokta değildir.', 'P_ort,g = ρg h_orta'],
        ['vessel-shape-weight', 'Kap şekli ve ağırlık ilişkisi', 'Taban kuvveti her zaman sıvı ağırlığı değil.', 'Eğik kap duvarları sıvıya düşey kuvvet uygulayabilir. Bu yüzden taban basıncı ile toplam sıvı ağırlığının ilişkisi kabın biçimine bağlıdır.'],
      ], ['liquid-pressure', 'pressure-basics']),

    branch('daily-applications', 'Basınç Uygulamaları', 'Denge, U borusu ve hidrolik.',
      'Birleşik kaplar ve U boruları durgun sıvı dengesiyle; su cendereleri kapalı akışkana uygulanan basınç değişimiyle incelenir.', [
        ['communicating-vessels', 'Birleşik kaplar', 'Bağlı kollarda basınç dengesi.', 'Aynı sıvı, aynı yüzey basıncı ve bağlantılı kollar varsa serbest yüzeyler aynı seviyeye gelir. Farklı sıvı veya dış basınçta sonuç değişebilir.'],
        ['u-tubes', 'U boruları', 'Aynı seviyedeki basınçları karşılaştır.', 'Dengedeki bağlantılı sıvı içinde aynı yatay seviyedeki basınçlar eşittir. Karışmayan sıvılarda her koldaki ρgh katkısını karşılaştır.', 'P_sol = P_sağ (uygun aynı seviye)'],
        ['hydraulic-lifts', 'Su cendereleri ve hidrolik lift', 'Basınç değişimi kuvveti büyütür.', 'İdeal, aynı seviyedeki pistonlarda F1/A1 = F2/A2 olur. Büyük piston daha büyük kuvvet verirken A1d1 = A2d2 nedeniyle daha kısa yol alır; enerji kazancı oluşmaz.', 'F1/A1 = F2/A2; A1d1 = A2d2'],
      ], ['pascal-principle', 'liquid-pressure']),

    branch('fluid-pressure', 'Akışkanların Basıncı', 'Akış hızı, kesit ve statik basınç.',
      'Hareketli akışkanda süreklilik ve Bernoulli bağıntıları ancak belirtilen akış koşullarında uygulanır. Akış yönü veya kanat kaldırması tek nedene indirgenmez.', [
        ['bernoulli', 'Bernoulli ilkesi', 'İdeal akışta enerji dengesi.', 'Kararlı, sıkıştırılamaz ve kayıpsız akışta aynı akım çizgisinde P + ½ρv² + ρgz sabittir. Koşullar sağlanmadan bu sade bağıntıyı kullanma.', 'P + ½ρv² + ρgz = sabit'],
        ['flow-area-speed', 'Kesit alanı ve akış hızı', 'Daralan kesitte hız artabilir.', 'Kararlı sıkıştırılamaz akışta bir akım tüpünün hacimsel debisi sabittir: A1v1 = A2v2. Kesit küçülürse ortalama hız artar.', 'A1v1 = A2v2'],
        ['speed-static-pressure', 'Hız ve statik basınç ilişkisi', 'Yatay ideal akışta ters değişebilir.', 'Aynı yükseklikte, aynı akım çizgisinde, kararlı ve kayıpsız sıkıştırılamaz akışta hız artışı statik basınç düşüşüyle birlikte görülebilir. Evrensel kural değildir.', 'P + ½ρv² = sabit (koşullu)'],
        ['flow-direction', 'Akış yönü', 'Basınç tek başına yönü belirlemez.', 'Pasif düzende basınç farkı akışı sürdürebilir; pompa, yükseklik farkı, enerji eklenmesi ve kayıplar da yönü etkiler. “Her zaman yüksek statik basınçtan alçağa” genellemesi yanlıştır.'],
        ['fluid-examples', 'Uçak kanadı, çatı ve şemsiye', 'Akış alanının tümü önemlidir.', 'Kanat kaldırmasını yalnız “üst yol daha uzun” anlatımıyla açıklama. Çatı ve şemsiyede de iç/dış akış koşulları, basınç farkı ve momentum değişimi değerlendirilir.'],
      ], ['gas-pressure']),

    branch('gas-pressure', 'Gaz Basıncı', 'Atmosfer ve gaz bağıntıları.',
      'Gaz basıncı taneciklerin yüzeylerle etkileşimiyle oluşur. İdeal gaz modelinde P, V, n ve mutlak T birlikte değerlendirilir.', [
        ['torricelli', 'Açık hava basıncı ve Torricelli deneyi', 'Barometrenin temeli: 1643.', 'Atmosfer basıncı dengedeki cıva sütununu taşıyabilir. Torricelli’nin 1643 tarihli barometresinde uygun koşullarda P_atm ≈ ρ_Cıva g h kullanılır.', 'P_atm ≈ ρ_Cıva g h'],
        ['altitude-pressure', 'Yükseklik ve basınç', 'Yüksekte P_atm genelde azalır.', 'Yükseklere çıkıldıkça üstteki hava sütunu azalır. Havanın özkütlesi de değiştiğinden tüm atmosfer için sabit ρ ile basit ρgh hesabı yapma.'],
        ['ideal-gas', 'İdeal gaz denklemi: PV = nRT', 'P mutlak, T kelvin cinsindendir.', 'İdeal gaz için P mutlak basınç, V hacim, n mol miktarı, R gaz sabiti, T mutlak sıcaklıktır. PV = T eksik ve yanlıştır.', 'PV = nRT'],
        ['boyle', 'Sabit sıcaklıkta hacim-basınç ilişkisi', 'n ve T sabitse PV sabittir.', 'Aynı miktar ideal gazın sıcaklığı sabit tutulursa mutlak basınç hacimle ters orantılıdır. Açık sistemde veya sıcaklık değişirken koşulsuz kullanma.', 'P1V1 = P2V2 (n, T sabit)'],
        ['elastic-balloons', 'Esnek balonlar', 'Zar gerilimi basınç farkı doğurabilir.', 'Balonun iç ve dış basınçları her zaman eşit değildir; zar gerilimi ve eğrilik dengeyi etkiler. Dış basınç azalınca büyüme, gaz miktarı ve sıcaklığa da bağlıdır.'],
        ['boiling-point', 'Basınç ve kaynama noktası', 'Dış basınç azalınca kaynama sıcaklığı düşer.', 'Sıvı buhar basıncı dış basınca ulaştığında kaynar. Yüksek yerde su genelde daha düşük sıcaklıkta kaynar; kesin değer ortam basıncına bağlıdır.'],
      ], ['liquid-pressure', 'fluid-pressure', 'pressure-measurements']),

    branch('pressure-measurements', 'Ölçüm Araçları ve Deneyler', 'Basınçtan ölçüme ve gösterilere.',
      'Barometre ve manometre basınç ölçer. Bazı derinlik ve yükseklik araçları basınç ölçümünü dönüştürür; Magdeburg deneyinde basınç farkı görülür.', [
        ['barometer', 'Barometre', 'Açık hava basıncını ölçer.', 'Cıvalı barometrede sütun yüksekliği atmosfer basıncıyla ilişkilidir. Aneroid tür, esnek kapsülün basınca tepkisini kullanır.'],
        ['manometer', 'Manometre', 'Basınç farkını ölçer.', 'Açık uçlu U borulu manometre gaz basıncını atmosferle karşılaştırabilir. Seviye farkı ve ölçüm sıvısının özkütlesi kullanılır.'],
        ['bathymeter', 'Batimetre', 'Su derinliğini belirler.', 'Batimetre deniz veya göl derinliğini belirlemeye yarar. Basınç temelli türlerde derinlik sıvı basıncından çıkarılır; başka ölçüm ilkeleri de vardır.'],
        ['altimeter', 'Altimetre', 'Yüksekliği gösterir.', 'Basınç altimetresi atmosfer basıncını modele ve ayara göre irtifaya dönüştürür. Hava koşullarında ayar önemlidir; her altimetre basınç temelli değildir.'],
        ['magdeburg', 'Magdeburg küreleri', 'Atmosfer basıncının etkisi.', 'İçindeki hava azaltılan yarımkürelerin dışında atmosfer basıncı büyük bir bileşke kuvvet oluşturur. Deney 17. yüzyılda gösterilmiştir; tartışmalı kesin yıl burada verilmez.'],
      ], ['gas-pressure']),
  ],
};
