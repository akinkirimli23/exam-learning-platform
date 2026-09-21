export type ConceptNode = {
  id: string;
  title: string;
  shortDescription: string;
  detailedDescription: string;
  formula?: string;
  example?: string;
  commonMistake?: string;
  relatedConceptIds: string[];
  children: ConceptNode[];
};

const node = (
  value: Omit<ConceptNode, 'relatedConceptIds' | 'children'> &
    Partial<Pick<ConceptNode, 'relatedConceptIds' | 'children'>>,
): ConceptNode => ({ relatedConceptIds: [], children: [], ...value });

export const buoyancyConceptMap: ConceptNode = node({
  id: 'buoyancy',
  title: 'Kaldırma Kuvveti',
  shortDescription: 'Akışkanın, içindeki cisme uyguladığı net yukarı yönlü kuvvet.',
  detailedDescription:
    'Kaldırma kuvveti, cismin alt ve üst yüzeylerine etki eden basınç kuvvetlerinin farkından doğar. Büyüklüğü, cismin yer değiştirdiği akışkanın ağırlığına eşittir. Haritadaki ilişkiler durgun akışkan, düzgün yerçekimi alanı ve lise düzeyi model varsayımlarıyla ele alınır.',
  formula: 'Fᵦ = V_batan · d_sıvı · g',
  example: 'Bir gemi, ağırlığı kadar suyu yer değiştirerek dengede yüzer.',
  commonMistake: 'Kaldırma kuvvetini yalnızca yüzen cisimlere özgü sanmak.',
  relatedConceptIds: ['archimedes-principle', 'buoyancy-equation', 'equilibrium-states'],
  children: [
    node({
      id: 'fundamental-principles',
      title: 'Temel Prensipler',
      shortDescription: 'Kuvvetin nereden geldiğini ve Arşimet ilkesini açıklar.',
      detailedDescription:
        'Durgun akışkanda basınç derinlikle artar. Cismin alt yüzeyine etki eden basınç kuvveti üst yüzeydekinden büyük olduğunda düşey bileşke yukarı yönelir. Bu bileşke, yer değiştiren akışkanın ağırlığıyla aynı büyüklüktedir.',
      commonMistake: 'Basınç ile basınç kuvvetini aynı büyüklük sanmak.',
      relatedConceptIds: ['mathematical-model'],
      children: [
        node({
          id: 'archimedes-principle',
          title: 'Arşimet İlkesi',
          shortDescription: 'Kaldırma kuvveti, yer değiştiren akışkanın ağırlığına eşittir.',
          detailedDescription:
            'Bir akışkana kısmen veya tamamen batırılan cisme, yer değiştirdiği akışkanın ağırlığı kadar kaldırma kuvveti etki eder. İlke sıvılarda ve gazlarda geçerlidir.',
          formula: 'Fᵦ = G_yer değiştirilen akışkan',
          example: 'Taşırma kabından çıkan su tartıldığında ağırlığı kaldırma kuvvetini verir.',
          commonMistake: 'Yer değiştiren akışkan ağırlığını her durumda cismin ağırlığına eşitlemek.',
          relatedConceptIds: ['displaced-fluid-weight', 'overflow-weight'],
        }),
        node({
          id: 'displaced-fluid-weight',
          title: 'Yer Değiştiren Sıvı Ağırlığı',
          shortDescription: 'Cismin batan kısmının yerinden ettiği sıvının ağırlığıdır.',
          detailedDescription:
            'Yer değiştiren sıvının hacmi, cismin sıvı içinde kalan hacmine eşittir. Bu sıvının ağırlığı d_sıvı · V_batan · g ile bulunur ve kaldırma kuvvetini verir.',
          formula: 'G_sıvı = d_sıvı · V_batan · g',
          example: 'Yarıya kadar batan bir cisim yalnız batan yarısı kadar sıvıyı yer değiştirir.',
          commonMistake: 'Kısmen batan cisim için toplam cisim hacmini kullanmak.',
          relatedConceptIds: ['submerged-volume', 'overflow-weight'],
        }),
        node({
          id: 'pressure-force-difference',
          title: 'Basınç Kuvveti Farkı',
          shortDescription: 'Alt yüzeydeki daha büyük basınç kuvveti yukarı yönlü bileşke oluşturur.',
          detailedDescription:
            'Akışkan basıncı derinlikle arttığı için cismin alt yüzeyindeki basınç üst yüzeyindekinden büyüktür. Yan yüzlerdeki yatay bileşenler dengelenirken düşey fark kaldırma kuvvetini doğurur.',
          formula: 'P = d_sıvı · g · h',
          example: 'Tam batmış bir bloğun alt yüzeyi üst yüzeyinden daha derindedir.',
          commonMistake: 'Basınç arttığı için tam batmış cismi daha derine indirince Fᵦ’nin mutlaka artacağını düşünmek.',
          relatedConceptIds: ['net-upward-force', 'submerged-volume'],
        }),
        node({
          id: 'net-upward-force',
          title: 'Net Yukarı Yönlü Kuvvet',
          shortDescription: 'Akışkanın yüzey kuvvetlerinin yukarı yönlü bileşkesidir.',
          detailedDescription:
            'Kaldırma kuvvetinin yönü yukarıdır; ancak cismin net kuvveti yalnız kaldırma kuvvetiyle belirlenmez. Ağırlık, ip gerilmesi ve zemin tepki kuvveti de birlikte değerlendirilir.',
          example: 'Yüzen dengeli cisimde Fᵦ yukarı, G aşağı yönlü ve eşit büyüklüktedir.',
          commonMistake: 'Yukarı yönlü Fᵦ varsa cismin mutlaka yukarı ivmeleneceğini sanmak.',
          relatedConceptIds: ['floating-state', 'sinking-state'],
        }),
      ],
    }),
    node({
      id: 'mathematical-model',
      title: 'Matematiksel Model',
      shortDescription: 'Kaldırma kuvvetini belirleyen üç değişkeni ilişkilendirir.',
      detailedDescription:
        'Lise düzeyi modelde kaldırma kuvveti; batan hacim, akışkan özkütlesi ve yerçekimi ivmesiyle doğru orantılıdır. Cismin özkütlesi formülde doğrudan yer almaz.',
      formula: 'Fᵦ = V_batan · d_sıvı · g',
      commonMistake: 'd_sıvı yerine cismin özkütlesini yazmak.',
      relatedConceptIds: ['fundamental-principles', 'equilibrium-states'],
      children: [
        node({
          id: 'submerged-volume',
          title: 'Batan Hacim (Vbatan)',
          shortDescription: 'Cismin akışkan içinde kalan hacmidir.',
          detailedDescription:
            'Kaldırma kuvvetinde kullanılan hacim, yer değiştiren akışkan hacmiyle aynı olan batan hacimdir. Kısmen batan cisimlerde toplam hacimden küçüktür.',
          formula: 'V_yer değiştirilen = V_batan',
          example: 'Toplam hacminin %60’ı suda olan cismin V_batan değeri 0,60·V_toplamdır.',
          commonMistake: 'Her durumda V_toplam kullanmak.',
          relatedConceptIds: ['volume-change', 'displaced-fluid-weight'],
        }),
        node({
          id: 'fluid-density',
          title: 'Sıvı Özkütlesi (dsıvı)',
          shortDescription: 'Birim hacimdeki sıvı kütlesidir.',
          detailedDescription:
            'Aynı batan hacim ve aynı g için daha yoğun sıvı daha büyük kaldırma kuvveti uygular. Özkütle birimi kg/m³ olabilir.',
          formula: 'd = m / V',
          example: 'Aynı cisim tamamen batırıldığında tuzlu suda tatlı sudan daha büyük Fᵦ oluşur.',
          commonMistake: 'Yüzen aynı cisimde daha yoğun sıvının mutlaka daha büyük Fᵦ uyguladığını söylemek; dengede iki durumda da Fᵦ=G’dir.',
          relatedConceptIds: ['floating-density', 'specific-weight'],
        }),
        node({
          id: 'gravity-acceleration',
          title: 'Yerçekimi İvmesi (g)',
          shortDescription: 'Akışkan ve cisim ağırlıklarını belirleyen yerçekimi alanıdır.',
          detailedDescription:
            'Aynı akışkan ve batan hacim için g arttıkça kaldırma kuvveti artar. Dünya yüzeyindeki karşılaştırmalarda çoğunlukla sabit kabul edilir.',
          formula: 'G = m · g',
          example: 'Aynı düzenek daha küçük g olan bir ortamda daha küçük kuvvetler üretir.',
          commonMistake: 'g’yi yalnız cismin ağırlığında kullanıp yer değiştiren sıvının ağırlığında kullanmamak.',
          relatedConceptIds: ['buoyancy-equation'],
        }),
        node({
          id: 'buoyancy-equation',
          title: 'Fb = Vbatan × dsıvı × g',
          shortDescription: 'Kaldırma kuvvetinin temel matematiksel modelidir.',
          detailedDescription:
            'Formül, yer değiştiren akışkanın kütlesini d_sıvı·V_batan ile, ağırlığını da bu değeri g ile çarparak ifade eder. SI birimleri kullanıldığında sonuç newtondur.',
          formula: 'Fᵦ = V_batan · d_sıvı · g',
          example: 'Değişken yorumunda V_batan veya d_sıvı artarsa, diğerleri sabitken Fᵦ artar.',
          commonMistake: 'Derinliği formüle ayrıca çarpan olarak eklemek.',
          relatedConceptIds: ['archimedes-principle', 'pressure-force-difference'],
        }),
      ],
    }),
    node({
      id: 'equilibrium-states',
      title: 'Sıvı İçindeki Denge Durumları',
      shortDescription: 'Yüzme, askıda kalma ve batmayı kuvvet ve özkütleyle ayırır.',
      detailedDescription:
        'Homojen bir cismin akışkan içindeki davranışı, ortalama özkütlelerin karşılaştırılması ve cisme etki eden bütün kuvvetlerle açıklanır.',
      commonMistake: 'Yalnız özkütle karşılaştırıp dış kuvvetleri veya taban temasını yok saymak.',
      relatedConceptIds: ['net-upward-force', 'volume-change'],
      children: [
        node({
          id: 'floating-state',
          title: 'Yüzme Durumu',
          shortDescription: 'Cisim yüzeyde, bir kısmı akışkan dışında dengededir.',
          detailedDescription:
            'Serbest yüzen homojen cismin ortalama özkütlesi sıvının özkütlesinden küçüktür. Dengeye ulaştığında kaldırma kuvveti ağırlığa eşittir.',
          formula: 'Fᵦ = G',
          example: 'Tahta blok su yüzeyinde hacminin bir kısmı dışarıda kalacak şekilde dengelenir.',
          commonMistake: 'Yüzen cisimde Fᵦ > G demek; bu yalnız yukarı ivmelenme sırasında olabilir.',
          relatedConceptIds: ['floating-density', 'floating-balance', 'floating-partial'],
          children: [
            node({
              id: 'floating-density',
              title: 'dcisim < dsıvı',
              shortDescription: 'Serbest yüzen homojen cisim sıvıdan daha düşük ortalama özkütlelidir.',
              detailedDescription: 'Cisim tamamen batmadan ağırlığını dengeleyecek kadar sıvı yer değiştirebilir.',
              formula: 'd_cisim / d_sıvı = V_batan / V_toplam',
              relatedConceptIds: ['volume-change', 'fluid-density'],
            }),
            node({
              id: 'floating-balance',
              title: 'Fb = Ağırlık (G)',
              shortDescription: 'Dengedeki yüzen cisimde düşey net kuvvet sıfırdır.',
              detailedDescription: 'Yukarı yönlü kaldırma kuvveti, aşağı yönlü ağırlığı dengeler.',
              formula: 'ΣF_y = Fᵦ − G = 0',
              relatedConceptIds: ['net-upward-force'],
            }),
            node({
              id: 'floating-partial',
              title: 'Hacmin bir kısmı dışarıda',
              shortDescription: 'Denge için gereken yer değiştirme toplam hacimden küçüktür.',
              detailedDescription: 'Cismin batan oranı, homojen serbest yüzmede özkütle oranına eşittir.',
              example: 'Özkütlesi suyun %60’ı olan homojen cisim hacminin %60’ını batırır.',
              relatedConceptIds: ['submerged-volume', 'volume-change'],
            }),
          ],
        }),
        node({
          id: 'suspended-state',
          title: 'Askıda Kalma Durumu',
          shortDescription: 'Cisim tamamen akışkan içinde ve tabana değmeden dengededir.',
          detailedDescription:
            'Dış kuvvet yoksa homojen cisimle akışkanın özkütleleri eşittir. Kaldırma kuvveti cismin ağırlığını dengeler.',
          formula: 'Fᵦ = G',
          commonMistake: 'Askıda kalmayı bir ip tarafından tutulmakla karıştırmak.',
          relatedConceptIds: ['suspended-density', 'suspended-balance', 'suspended-position'],
          children: [
            node({
              id: 'suspended-density',
              title: 'dcisim = dsıvı',
              shortDescription: 'Homojen cisim ve sıvının özkütleleri eşittir.',
              detailedDescription: 'Eşit hacimler eşit ağırlığa sahip olduğundan tam batmış cisim dengede kalabilir.',
              formula: 'd_cisim = d_sıvı',
              relatedConceptIds: ['fluid-density'],
            }),
            node({
              id: 'suspended-balance',
              title: 'Fb = Ağırlık (G)',
              shortDescription: 'Kaldırma kuvveti ağırlığı dengeler.',
              detailedDescription: 'Başka düşey kuvvet yoksa net kuvvet sıfırdır ve cisim askıda kalır.',
              formula: 'ΣF_y = 0',
              relatedConceptIds: ['floating-balance'],
            }),
            node({
              id: 'suspended-position',
              title: 'Tamamı sıvı içinde, tabana değmez',
              shortDescription: 'Cisim ne yüzeye çıkar ne de tabandan tepki alır.',
              detailedDescription: 'Tam batmış hacim sabit olduğundan düzgün sıvıda konum değişimi Fᵦ’yi tek başına değiştirmez.',
              commonMistake: 'Tabana değen cismi askıda kabul etmek.',
              relatedConceptIds: ['pressure-force-difference'],
            }),
          ],
        }),
        node({
          id: 'sinking-state',
          title: 'Batma Durumu',
          shortDescription: 'Cismin ağırlığı kaldırma kuvvetinden büyüktür.',
          detailedDescription:
            'Sıvıdan daha yoğun homojen cisim serbest bırakıldığında aşağı ivmelenir. Tabanla temas ettiğinde dengeye zemin tepki kuvveti de katılır.',
          formula: 'G > Fᵦ',
          commonMistake: 'Tabanda duran cisimde yalnız Fᵦ=G yazmak.',
          relatedConceptIds: ['sinking-density', 'sinking-force', 'normal-force'],
          children: [
            node({
              id: 'sinking-density',
              title: 'dcisim > dsıvı',
              shortDescription: 'Homojen cismin ortalama özkütlesi sıvıdan büyüktür.',
              detailedDescription: 'Tam batmış eşit hacimler karşılaştırıldığında cismin ağırlığı yer değiştiren sıvının ağırlığından büyüktür.',
              formula: 'd_cisim > d_sıvı',
              relatedConceptIds: ['fluid-density'],
            }),
            node({
              id: 'sinking-force',
              title: 'Fb < Ağırlık (G)',
              shortDescription: 'Serbest cisimde düşey bileşke aşağı yönlüdür.',
              detailedDescription: 'Ağırlık kaldırma kuvvetini aştığı için cisim aşağı ivmelenir.',
              formula: 'F_net = G − Fᵦ',
              relatedConceptIds: ['sinking-gain'],
            }),
            node({
              id: 'normal-force',
              title: 'Zemin Tepki Kuvveti (N)',
              shortDescription: 'Taban, temas eden cisme yukarı yönlü destek uygular.',
              detailedDescription: 'Cisim tabanda dengedeyse, sıvı alt yüzeye ulaşabildiği modelde N ve Fᵦ birlikte G’yi dengeler.',
              formula: 'N + Fᵦ = G',
              commonMistake: 'Cisim tabana değer değmez kaldırma kuvvetinin her koşulda sıfır olduğunu sanmak.',
              relatedConceptIds: ['apparent-weight-loss'],
            }),
          ],
        }),
      ],
    }),
    node({
      id: 'overflow-and-weight',
      title: 'Taşırma Kapları ve Ağırlaşma',
      shortDescription: 'Taşan sıvı ile sistemin tartı değişimini birlikte yorumlar.',
      detailedDescription:
        'Ağzına kadar dolu taşırma kabında taşan sıvı sistemden ayrılır. Kaba eklenen cismin ağırlığı ile sistemden çıkan sıvının ağırlığı birlikte değerlendirilmelidir.',
      commonMistake: 'Yalnız cisim ağırlığını ekleyip taşan sıvının ağırlığını çıkarmamak.',
      relatedConceptIds: ['archimedes-principle', 'sinking-state'],
      children: [
        node({
          id: 'no-gain-float-suspend',
          title: 'Yüzme/Askıda Kalma: Ağırlaşma Yok',
          shortDescription: 'Taşan sıvı ağırlığı eklenen cisim ağırlığını dengeler.',
          detailedDescription:
            'Başlangıçta ağzına kadar dolu kap ve taşan sıvının sistemden ayrıldığı kabulünde, yüzen veya dış kuvvetsiz askıda kalan cisim için G=Fᵦ’dir. Taşan sıvının ağırlığı da Fᵦ olduğundan tartıdaki net değişim sıfırdır.',
          formula: 'ΔG_sistem = G − Fᵦ = 0',
          commonMistake: 'Bu sonucu taşmayan kaplara veya dışarıdan iple tutulan cisimlere koşulsuz uygulamak.',
          relatedConceptIds: ['floating-balance', 'suspended-balance'],
        }),
        node({
          id: 'sinking-gain',
          title: 'Batma: G − Fb kadar ağırlaşma',
          shortDescription: 'Batan cisim eklendiğinde net artış, ağırlık ile taşan sıvı ağırlığının farkıdır.',
          detailedDescription:
            'Ağzına kadar dolu taşırma kabında cisim kaba eklenip battığında G kadar yük eklenir, Fᵦ ağırlığında sıvı taşarak sistemden çıkar. Net artış G−Fᵦ olur.',
          formula: 'ΔG_sistem = G − Fᵦ',
          commonMistake: 'Cisim dışarıdan tutuluyorsa veya taşan sıvı tartıyla birlikte kalıyorsa aynı sonucu kullanmak.',
          relatedConceptIds: ['sinking-force', 'overflow-weight'],
        }),
        node({
          id: 'overflow-weight',
          title: 'Taşan Sıvı Ağırlığı = Kaldırma Kuvveti',
          shortDescription: 'Tam dolu kapta taşan sıvı, yer değiştiren sıvıdır.',
          detailedDescription: 'Taşan sıvının hacmi batan hacme, ağırlığı da Arşimet ilkesine göre kaldırma kuvvetine eşittir.',
          formula: 'G_taşan = Fᵦ',
          example: 'Taşan suyu ayrı kapta tartmak Fᵦ’yi deneysel olarak verir.',
          relatedConceptIds: ['archimedes-principle', 'displaced-fluid-weight'],
        }),
      ],
    }),
    node({
      id: 'important-concepts',
      title: 'Önemli Kavramlar',
      shortDescription: 'Görünen ağırlık, özgül ağırlık ve etki noktası gibi bağlantılar.',
      detailedDescription: 'Bu kavramlar temel modeli deney, ölçüm ve denge yorumlarına bağlar.',
      relatedConceptIds: ['mathematical-model', 'equilibrium-states'],
      children: [
        node({
          id: 'apparent-weight-loss',
          title: 'Görünen Ağırlık Kaybı',
          shortDescription: 'Sıvı desteği nedeniyle dinamometre okumasındaki azalmadır.',
          detailedDescription: 'İpe asılı cisim sıvıda dengedeyken ip gerilmesi T=G−Fᵦ olur. Cismin gerçek kütlesi ve ağırlığı değişmez.',
          formula: 'G − T = Fᵦ',
          example: 'Taş suya daldırılınca dinamometre daha küçük değer gösterir.',
          commonMistake: 'Kütlenin veya gerçek ağırlığın azaldığını söylemek.',
          relatedConceptIds: ['normal-force', 'archimedes-principle'],
        }),
        node({
          id: 'specific-weight',
          title: 'Özgül Ağırlık',
          shortDescription: 'Birim hacim başına ağırlıktır.',
          detailedDescription: 'Özgül ağırlık özkütleden farklıdır; özkütlenin g ile çarpımına eşittir ve birimi N/m³ olabilir.',
          formula: 'γ = d · g',
          commonMistake: 'Özgül ağırlık ile özkütleyi aynı birim ve aynı büyüklük kabul etmek.',
          relatedConceptIds: ['fluid-density', 'gravity-acceleration'],
        }),
        node({
          id: 'volume-change',
          title: 'Hacimce Değişim',
          shortDescription: 'Yüzen cismin batan oranının özkütle oranıyla değişmesidir.',
          detailedDescription: 'Serbest yüzen homojen cisimde sıvı yoğunlaştıkça aynı ağırlığı dengelemek için gereken batan hacim azalır.',
          formula: 'V_batan / V_toplam = d_cisim / d_sıvı',
          example: 'Tuzlu suda yüzen cisim tatlı suya göre daha az batar.',
          commonMistake: 'Cismin toplam hacminin değiştiğini sanmak; değişen batan hacimdir.',
          relatedConceptIds: ['floating-partial', 'submerged-volume'],
        }),
        node({
          id: 'center-of-buoyancy',
          title: 'Batan Hacim Merkezi',
          shortDescription: 'Kaldırma kuvvetinin etkidiği kabul edilen yer değiştirme hacmi merkezidir.',
          detailedDescription: 'Kaldırma kuvvetinin etki doğrusu, yer değiştiren akışkan hacminin geometrik merkezinden geçer. Cismin yönelimi değişirse bu merkezin yeri değişebilir.',
          example: 'Bir tekne yana yattığında batan hacmin şekli ve kaldırma merkezinin konumu değişir.',
          commonMistake: 'Batan hacim merkezini cismin kütle merkeziyle her zaman aynı nokta kabul etmek.',
          relatedConceptIds: ['shipping', 'fishing-and-rafting'],
        }),
      ],
    }),
    node({
      id: 'daily-life-applications',
      title: 'Günlük Hayat Uygulamaları',
      shortDescription: 'Arşimet ilkesinin ulaşım, ölçüm ve canlılardaki örnekleri.',
      detailedDescription: 'Aynı temel ilke, sıvılarda ve gazlarda farklı tasarımların nasıl çalıştığını açıklar.',
      relatedConceptIds: ['archimedes-principle', 'equilibrium-states'],
      children: [
        node({
          id: 'shipping',
          title: 'Gemi Taşımacılığı',
          shortDescription: 'Geniş gövde, büyük su hacmi yer değiştirerek ağır yükü dengeler.',
          detailedDescription: 'İçi büyük ölçüde boş geminin ortalama özkütlesi düşer. Yük arttığında gemi daha çok batar ve yeni dengede daha büyük su ağırlığı yer değiştirir.',
          example: 'Yükleme çizgileri geminin güvenli batan hacim sınırını gösterir.',
          commonMistake: 'Çeliğin özkütlesi küçük olduğu için geminin yüzdüğünü sanmak.',
          relatedConceptIds: ['center-of-buoyancy', 'floating-state'],
        }),
        node({
          id: 'hot-air-balloons',
          title: 'Sıcak Hava Balonları',
          shortDescription: 'Gazların kaldırma kuvvetinden yararlanır.',
          detailedDescription: 'Balon, çevresindeki havayı yer değiştirir. İç havanın ısıtılması toplam ortalama özkütleyi düşürür; kaldırma kuvveti toplam ağırlığı aşarsa balon yükselir.',
          formula: 'Fᵦ = V · d_hava · g',
          commonMistake: 'Kaldırma kuvvetinin yalnız sıvılarda oluştuğunu düşünmek.',
          relatedConceptIds: ['fluid-density', 'net-upward-force'],
        }),
        node({
          id: 'submarine-ballast',
          title: 'Denizaltı Ballast Tankları',
          shortDescription: 'Su ve hava miktarı değiştirilerek ortalama özkütle ayarlanır.',
          detailedDescription: 'Dış hacim yaklaşık sabitken tanklara su almak toplam kütleyi artırır ve batma eğilimi oluşturur. Suyu basınçlı havayla dışarı atmak yükselme eğilimi sağlar.',
          example: 'Nötr yüzdürmede ağırlık ile kaldırma kuvveti dengelenir.',
          commonMistake: 'Ballast suyunun dış hacmi büyüttüğü için dalış sağladığını sanmak.',
          relatedConceptIds: ['suspended-state', 'sinking-state'],
        }),
        node({
          id: 'gold-purity',
          title: 'Altın Saflık Testi (Eureka)',
          shortDescription: 'Kütle ve yer değiştiren hacimden özkütle karşılaştırılır.',
          detailedDescription: 'Cisim suya batırıldığında yer değiştirdiği su hacmi ölçülür. Kütle bu hacme bölünerek ortalama özkütle bulunur ve saf altının değeriyle karşılaştırılır.',
          formula: 'd_cisim = m / V_yer değiştirilen',
          commonMistake: 'Yalnız görünen ağırlık azalmasına bakıp hacmi hesaba katmamak.',
          relatedConceptIds: ['displaced-fluid-weight', 'apparent-weight-loss'],
        }),
        node({
          id: 'body-fat-measurement',
          title: 'Vücut Yağ Oranı Ölçümü',
          shortDescription: 'Su altı tartımıyla vücut yoğunluğunu tahmin eden yöntemlere temel olur.',
          detailedDescription: 'Su altındaki görünen ağırlık farkı, yer değiştiren su ve dolayısıyla vücut hacmi hakkında bilgi verir. Uygulamada akciğer havası gibi düzeltmeler gerekir.',
          commonMistake: 'Basit Fᵦ ölçümünün tek başına doğrudan ve hatasız yağ yüzdesi verdiğini düşünmek.',
          relatedConceptIds: ['apparent-weight-loss', 'gold-purity'],
        }),
        node({
          id: 'fishing-and-rafting',
          title: 'Balıkçı Tekneleri ve Rafting',
          shortDescription: 'Yük dağılımı, batan hacim ve denge güvenliği belirler.',
          detailedDescription: 'Tekne veya sal yük aldıkça daha çok su yer değiştirir. Yükün dengeli dağıtılması, kütle merkezi ve kaldırma merkezinin güvenli ilişkisinin korunmasına yardım eder.',
          example: 'Yükün tek tarafa yığılması tekneyi yatırarak batan hacim dağılımını değiştirir.',
          commonMistake: 'Toplam yük sınırı uygun olsa bile yük dağılımının önemsiz olduğunu sanmak.',
          relatedConceptIds: ['shipping', 'center-of-buoyancy'],
        }),
      ],
    }),
  ],
});

export function flattenConceptNodes(root: ConceptNode): ConceptNode[] {
  return [root, ...root.children.flatMap(flattenConceptNodes)];
}
