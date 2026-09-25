import {
  learningFlashcardSchema,
  learningQuizQuestionSchema,
  type LearningQuizDifficulty,
} from '@/shared/contracts';

type ConceptId = 'pressure' | 'solid-pressure' | 'liquid-pressure' | 'pascal-principle' | 'gas-pressure' | 'daily-applications';
type Card = [ConceptId, string, string, string, string];

const cards: Card[] = [
  ['pressure', 'Basınç ile basınç kuvveti arasındaki fark nedir?', 'Basınç birim alana düşen dik kuvvettir; basınç kuvveti yüzeye etki eden toplam dik kuvvettir.', 'P = Fdik/A', 'Pa ile N birimlerini birbirine karıştırmak.'],
  ['pressure', 'Pascal (Pa) hangi birimlere eşittir?', 'Bir pascal, bir metrekareye dağılan bir newton dik kuvvettir.', '1 Pa = 1 N/m²', 'Alanı cm² bırakıp sonucu Pa diye yazmak.'],
  ['solid-pressure', 'Katı basıncı nasıl hesaplanır?', 'Yüzeye dik kuvveti gerçek temas alanına böl.', 'P = Fdik/A', 'Yüzeyin tamamını temas alanı saymak.'],
  ['solid-pressure', 'Kuvvet sabitken alan iki katına çıkarsa ne olur?', 'Basınç yarıya düşer; kuvvet değişmez.', 'P₂ = P₁/2', 'Basınçla kuvveti aynı oranda değiştirmek.'],
  ['solid-pressure', 'Alan sabitken dik kuvvet üç katına çıkarsa?', 'Basınç üç katına çıkar.', 'P₂ = 3P₁', 'Alanı da kendiliğinden artmış varsaymak.'],
  ['solid-pressure', 'İnce topuk neden zemine daha çok basar?', 'Aynı ağırlık daha küçük alana aktarıldığından basınç artar.', 'P = G/A', 'İnce topuğun daha büyük ağırlık oluşturduğunu düşünmek.'],
  ['daily-applications', 'Kar ayakkabısı batmayı nasıl azaltır?', 'Temas alanını büyütüp aynı ağırlığın oluşturduğu basıncı azaltır.', 'P ↓: A ↑ (F sabit)', 'Karın uyguladığı tepkiyi ağırlıkla karıştırmak.'],
  ['liquid-pressure', 'Durgun sıvı basıncı hangi üç niceliğe bağlıdır?', 'Sıvının özkütlesine, derinliğe ve yerçekimi ivmesine bağlıdır.', 'Psıvı = ρgh', 'Kap hacmini doğrudan formüle eklemek.'],
  ['liquid-pressure', 'Aynı sıvıda derinlik iki katına çıkarsa?', 'Sıvının oluşturduğu gösterge basıncı iki katına çıkar.', 'P₂ = 2P₁', 'Açık kaptaki mutlak basıncın da iki katına çıktığını sanmak.'],
  ['liquid-pressure', 'Aynı derinlikte özkütle iki katına çıkarsa?', 'Sıvı kaynaklı basınç iki katına çıkar.', 'P₂ = 2P₁', 'Kabın biçimini belirleyici saymak.'],
  ['liquid-pressure', 'Aynı yatay seviyedeki noktaların basıncı nasıl karşılaştırılır?', 'Aynı homojen durgun sıvıda ve aynı yüzey basıncında sıvı basınçları eşittir.', 'h₁ = h₂ ⇒ P₁ = P₂', 'Farklı kap kesitinden dolayı basınçları farklı sanmak.'],
  ['liquid-pressure', 'Sıvı basıncı ile mutlak basınç arasındaki fark?', 'Sıvı basıncı ρgh, açık kaptaki mutlak basınç Patm + ρgh değeridir.', 'Pmutlak = Patm + ρgh', 'Atmosfer basıncını iki kez eklemek.'],
  ['liquid-pressure', 'Baraj duvarı neden altta daha kalındır?', 'Derinlik arttıkça sıvı basıncı ve duvara etki eden yerel kuvvet artar.', 'Psıvı = ρgh', 'Derindeki basıncı daha fazla su hacmine bağlamak.'],
  ['liquid-pressure', 'İki sıvı tabakasında taban basıncı nasıl bulunur?', 'Her tabakanın ρgh katkısını topla; mutlak basınç gerekiyorsa yüzey basıncını ayrıca ekle.', 'Psıvı = ρ₁gh₁ + ρ₂gh₂', 'İki katmanın özkütlesini birbirine eşitlemek.'],
  ['pascal-principle', 'Pascal prensibinde tam olarak ne aynen iletilir?', 'Kapalı sıvıya dışarıdan uygulanan basınç artışı aynen iletilir.', 'ΔP₁ = ΔP₂', 'Farklı derinliklerdeki toplam basınçları eşit saymak.'],
  ['pascal-principle', 'Hidrolik pistonda kuvvet oranı nedir?', 'İdeal düzende kuvvet oranı piston alanları oranına eşittir.', 'F₂/F₁ = A₂/A₁', 'Alan oranını ters çevirmek.'],
  ['pascal-principle', 'Büyük piston kuvvet kazandırınca iş de artar mı?', 'Hayır; ideal düzende büyük piston daha kısa yol alır, iş korunur.', 'F₁d₁ = F₂d₂', 'Kuvvet kazancını enerji kazancı sanmak.'],
  ['pascal-principle', 'Hidrolik frende temel iletim nedir?', 'Pedalın oluşturduğu basınç artışı kapalı fren sıvısıyla diğer pistonlara iletilir.', 'ΔP = F/A', 'Sıvının kuvveti her yerde eşit tuttuğunu düşünmek.'],
  ['gas-pressure', 'Kapalı kaptaki gaz basıncının mikroskobik nedeni?', 'Hareketli gaz taneciklerinin kabın duvarlarına çarpmasıdır.', 'P = Fdik/A', 'Gazların yalnız aşağı yönde basınç uyguladığını sanmak.'],
  ['gas-pressure', 'Yükseğe çıkınca açık hava basıncı genellikle nasıl değişir?', 'Üstümüzde kalan hava sütunu azaldığı için düşer.', 'Yükseklik ↑ ⇒ Patm ↓', 'Dağda üzerimizde daha çok hava olduğunu düşünmek.'],
  ['gas-pressure', 'Açık hava basıncını hangi araç ölçer?', 'Barometre açık hava basıncını ölçer; manometre kapalı kaptaki gaz basıncı farkını incelemek için kullanılır.', 'Patm → barometre', 'Termometreyi basınç ölçeri sanmak.'],
  ['daily-applications', 'Dağda su neden daha düşük sıcaklıkta kaynar?', 'Dış basınç azaldığında sıvının buhar basıncı dış basınca daha erken eşitlenir.', 'Patm ↓ ⇒ Tkaynama ↓', 'Kaynama sıcaklığının her yerde 100 °C olduğunu sanmak.'],
  ['daily-applications', 'Düdüklü tencerede kaynama sıcaklığı neden yükselir?', 'Kap içindeki basınç yükselir; su daha yüksek sıcaklıkta kaynar.', 'P ↑ ⇒ Tkaynama ↑', 'Basınç arttığında kaynama sıcaklığının düşeceğini düşünmek.'],
  ['daily-applications', 'Keskin bıçak kesmeyi nasıl kolaylaştırır?', 'Küçük temas alanı aynı kuvvetle daha büyük basınç oluşturur.', 'P = F/A', 'Keskinliğin bıçağın kütlesini artırdığını sanmak.'],
  ['pressure', 'Soruda ilk hangi ayrımı yapmalıyım?', 'Katı temas basıncı mı, durgun sıvı basıncı mı, kapalı sıvıda basınç artışı mı, gaz/açık hava basıncı mı sorulduğunu belirle.', 'Katı F/A · Sıvı ρgh · Pascal ΔP', 'Tek formülü bütün ortamlar için kullanmak.'],
];

export const pressureFlashcards = learningFlashcardSchema.array().parse(cards.map(([conceptId, front, back, formula, commonMistake], index) => ({
  id: `pressure-card-${String(index + 1).padStart(3, '0')}`,
  conceptId, front, back, formula, commonMistake,
})));

type Question = [ConceptId, LearningQuizDifficulty, string, [string, string, string, string], number, string, string, string?];
const mainQuestions: Question[] = [
  ['solid-pressure','kolay','Bir katı zemine 120 N dik kuvvet uyguluyor. Temas alanı 0,04 m² ise basınç kaç Pa olur?',['3 Pa','30 Pa','300 Pa','3000 Pa'],3,'P = F/A = 120/0,04 = 3000 Pa.','Alanı cm² ile karıştırmak.'],
  ['solid-pressure','kolay','Ağırlığı değişmeyen bir cismin temas alanı iki katına çıkarılırsa zemindeki basınç nasıl değişir?',['İki katına çıkar','Yarıya iner','Değişmez','Dört katına çıkar'],1,'P = F/A; kuvvet sabit ve alan iki kat olduğunda basınç yarıya düşer.','Basınç ile alanı doğru orantılı sanmak.'],
  ['solid-pressure','orta','Bir cismin ağırlığı iki katına, temas alanı dört katına çıkarılıyor. Başlangıca göre basıncı kaç kat olur?',['1/4','1/2','2','8'],1,'P yeni / P eski = (2F/4A)/(F/A) = 1/2.','Yalnız kuvvetteki değişimi hesaba katmak.'],
  ['pressure','kolay','Bir pascalın SI birimlerindeki karşılığı hangisidir?',['N/m','N/m²','kg/m²','N·m²'],1,'Basınç birim alan başına dik kuvvettir: 1 Pa = 1 N/m².','Alan birimini metrekare yerine metre almak.'],
  ['solid-pressure','orta','Aynı ağırlıktaki iki kutudan K, 2A; L, A alanıyla zemine değiyor. PK/PL oranı kaçtır?',['1/2','1','2','4'],0,'PK = G/(2A), PL = G/A; oran 1/2 olur.','Daha büyük temas alanının basıncı artırdığını sanmak.'],
  ['liquid-pressure','kolay','Aynı durgun sıvıda derinliği h ve 3h olan iki noktanın sıvı basınçları oranı Ph/P3h kaçtır?',['1/3','1','3','9'],0,'Psıvı = ρgh; ρ ve g aynı olduğundan oran h/(3h) = 1/3.','Mutlak basınçla sıvının oluşturduğu basıncı karıştırmak.'],
  ['liquid-pressure','kolay','Eşit derinlikte özkütlesi ρ ve 2ρ olan sıvıların oluşturduğu basınçlar oranı Pρ/P2ρ kaçtır?',['1/4','1/2','1','2'],1,'Psıvı = ρgh. Derinlik ve g eşitse özkütle iki kat olduğunda basınç iki katına çıkar.','Özkütle etkisini yok saymak.'],
  ['liquid-pressure','kolay','Aynı durgun homojen sıvıda aynı yatay seviyedeki K ve L noktalarının sıvı basınçları nasıldır?',['K daha büyük','L daha büyük','Eşit','Kabın genişliğine bağlı'],2,'Derinlikleri aynı olan noktalar için ρgh eşittir.','Kabın kesitini basınca doğrudan çarpan saymak.'],
  ['liquid-pressure','orta','Aynı sıvı eşit yüksekliğe kadar dar ve geniş iki kaba dolduruluyor. Tabanlardaki sıvı basınçları için hangisi doğrudur?',['Geniş kapta büyük','Dar kapta büyük','İkisinde eşit','Hacme bağlı'],2,'Her iki kapta ρ, g ve h aynıdır; taban sıvı basıncı eşittir. Taban kuvvetleri alan nedeniyle farklı olabilir.','Basınç ile taban basınç kuvvetini eşitlemek.'],
  ['liquid-pressure','orta','Açık kaptaki suyun 2 m derinliğinde ρ=1000 kg/m³, g=10 m/s² ve Patm=100 kPa ise mutlak basınç kaç kPa?',['20','80','100','120'],3,'Suyun katkısı ρgh = 1000×10×2 = 20 kPa; mutlak basınç 100+20 = 120 kPa.','Atmosfer basıncını eklemeyi unutmak.'],
  ['liquid-pressure','orta','ρ=800 kg/m³ olan bir sıvıda h=0,5 m ve g=10 m/s². Sıvının oluşturduğu basınç kaç Pa?',['400','4000','8000','16000'],1,'P = ρgh = 800×10×0,5 = 4000 Pa.','0,5 m derinliği 5 m almak.'],
  ['liquid-pressure','zor','Açık kaptaki iki tabakadan üstte 1 m ρ=800, altta 2 m ρ=1000 kg/m³ sıvı var. g=10 ise tabandaki sıvı basıncı kaç kPa?',['12','20','28','36'],2,'Üst katkı 800×10×1=8 kPa; alt katkı 1000×10×2=20 kPa. Toplam sıvı basıncı 28 kPa.','Üst tabakanın basıncını altta yok saymak.'],
  ['pascal-principle','kolay','Kapalı sıvı içindeki pistona ek basınç uygulandığında Pascal prensibine göre ne aynen iletilir?',['Kuvvet','Basınç artışı','Piston alanı','Toplam basınç her yerde eşit olur'],1,'Sıvının her noktasına uygulanan ek basınç artışı aynı büyüklükte iletilir.','Kuvvetin de her yerde aynı olduğunu sanmak.'],
  ['pascal-principle','orta','İdeal hidrolik düzende küçük piston alanı 2 cm², büyük piston alanı 20 cm². Küçüğe 40 N uygulanırsa büyükte kaç N oluşur?',['4','40','200','400'],3,'F₂ = F₁(A₂/A₁) = 40×(20/2) = 400 N.','Alan oranını ters çevirmek.'],
  ['pascal-principle','zor','İdeal hidrolik düzende büyük piston alanı küçük pistonun 5 katı. Küçük piston 10 cm ilerlerse büyük piston kaç cm ilerler?',['2','5','10','50'],0,'Hacim korunur: A₁d₁ = A₂d₂; d₂ = 10/5 = 2 cm.','Kuvvet kazancıyla yol kazancını aynı yönde sanmak.'],
  ['gas-pressure','kolay','Kapalı kaptaki gazın duvarlara uyguladığı basıncın nedeni hangisidir?',['Yalnız yerçekimi','Tanecik çarpışmaları','Kabın rengi','Sıvı yüksekliği'],1,'Hareketli gaz taneciklerinin duvarlarla çarpışmaları basınç oluşturur.','Gazın yalnız kabın tabanına basınç uyguladığını sanmak.'],
  ['gas-pressure','kolay','Deniz seviyesinden dağa çıkıldığında açık hava basıncı genel olarak nasıl değişir?',['Artar','Azalır','Sabit kalır','Sıfır olur'],1,'Yükseğe çıkıldıkça üzerimizde kalan hava sütunu azaldığından atmosfer basıncı düşer.','Yükseklik artınca atmosfer ağırlığı da artar sanmak.'],
  ['daily-applications','orta','Aynı ağırlıktaki kar ayakkabısı genişletilirse kar yüzeyindeki basınç ve batma eğilimi nasıl değişir?',['İkisi de artar','Basınç azalır, batma eğilimi azalır','Basınç değişmez','Basınç artar, batma eğilimi azalır'],1,'Geniş alan aynı ağırlığı daha büyük yüzeye dağıtır; basınç azalır.','Geniş alanın basıncı yükselttiğini düşünmek.'],
  ['gas-pressure','orta','Açık hava basıncını ölçmek için hangi araç kullanılır?',['Termometre','Barometre','Dinamometre','Ampermetre'],1,'Barometre atmosfer basıncını ölçer. Diğer araçlar sıcaklık, kuvvet ve akım içindir.','Basınç ölçer ile sıcaklık ölçeri karıştırmak.'],
  ['daily-applications','zor','Yüksek dağda açık tenceredeki suyun kaynama sıcaklığı ve düdüklü tenceredeki basınç artışının etkisi için hangisi doğrudur?',['Dağda artar, düdüklüde azalır','İkisinde azalır','Dağda azalır, düdüklüde artar','İkisinde artar'],2,'Dağda dış basınç azalır ve kaynama sıcaklığı düşer. Düdüklüde basınç artar ve kaynama sıcaklığı yükselir.','Basınç ile kaynama sıcaklığının ters yönlü olduğunu sanmak.'],
];

const bankQuestions: Question[] = [
  ['solid-pressure','kolay','Şemadaki aynı 80 N yükün temas alanı A yerine 2A yapılırsa zemine uyguladığı basınç nasıl değişir?',['Yarıya düşer','İki katına çıkar','Değişmez','Dört katına çıkar'],0,'İlk basınç 80/A, ikinci basınç 80/(2A); yeni basınç ilkinin yarısıdır.','Kuvvetin alanla birlikte değiştiğini sanmak.','pressure-solid-area'],
  ['liquid-pressure','kolay','Şemadaki aynı sıvıda K noktası yüzeyden h, L noktası 2h derinde. PK/PL kaçtır?',['1/4','1/2','1','2'],1,'Aynı sıvıda ρ ve g eşit; PK/PL = h/(2h) = 1/2.','Derinliği ters orantılı almak.','pressure-liquid-depth'],
  ['pascal-principle','kolay','Hidrolik sistemde küçük pistona eklenen basınç ile büyük pistondaki basınç artışı nasıl karşılaştırılır?',['Küçükte daha büyük','Büyükte daha büyük','Eşit','Piston alanına bağlı olarak sıfır'],2,'İdeal kapalı sıvıda ek basınç artışı her noktaya aynen iletilir.','Kuvvet ile basınç artışını karıştırmak.','pressure-hydraulic'],
  ['gas-pressure','kolay','Barometrede ölçülen nicelik aşağıdakilerden hangisidir?',['Açık hava basıncı','Suyun derinliği','Katı ağırlığı','Sıvı hacmi'],0,'Barometre atmosfer basıncını ölçer.','Barometreyi kuvvet ölçer sanmak.','pressure-atmosphere'],
  ['solid-pressure','orta','Şemada aynı yük 2A alanına temas ediyor. Temas alanı A yapılırsa son basınç ilkinin kaç katı olur?',['1/2','1','2','4'],2,'Pilk=F/(2A), Pson=F/A. Oran 2 olur.','Alan küçüldüğünde basıncın da küçüldüğünü düşünmek.','pressure-solid-area'],
  ['liquid-pressure','orta','Şemada K ve L noktaları aynı sıvıda aynı derinlikte. Kabın sol kolu dar, sağ kolu geniş. PK/PL kaçtır?',['1/2','1','2','Kesit bilgisi olmadan bulunamaz'],1,'Durgun homojen sıvıda aynı seviyedeki basınçlar eşittir; kesit oranı gerekmez.','Kabın genişliğini ρgh bağıntısına katmak.','pressure-communicating'],
  ['pascal-principle','orta','Küçük piston 4 cm², büyük piston 12 cm². Küçük pistona 30 N uygulanırsa ideal durumda büyük piston kuvveti kaç N?',['10','30','60','90'],3,'Basınç artışları eşit: 30/4 = F₂/12, F₂=90 N.','Alan oranını ters kurmak.','pressure-hydraulic'],
  ['liquid-pressure','orta','Açık su kabında 1,5 m derinlik için ρ=1000 kg/m³, g=10 m/s². Suyun oluşturduğu basınç kaç kPa?',['1,5','10','15','150'],2,'ρgh=1000×10×1,5=15000 Pa=15 kPa. Atmosfer basıncı sorulmadığı için eklenmez.','Pa ile kPa dönüşümünü unutmak.'],
  ['liquid-pressure','zor','Şemadaki açık kapta üstte 0,5 m ρ=800, altta 1 m ρ=1200 kg/m³ sıvı var. g=10. Taban sıvı basıncı kaç kPa?',['12','16','20','24'],1,'Üst katman 800×10×0,5=4 kPa, alt katman 1200×10×1=12 kPa; toplam 16 kPa.','Yalnız alt katmanı hesaplamak.','pressure-liquid-layers'],
  ['pascal-principle','zor','İdeal hidrolik sistemde piston alanları A ve 4A. Küçük pistona 20 N uygulayıp 12 cm itince büyük pistonda kuvvet ve yol ne olur?',['80 N, 3 cm','80 N, 48 cm','5 N, 3 cm','5 N, 48 cm'],0,'Basınç eşitliğinden F₂=20×4=80 N; hacim korunmasından d₂=12/4=3 cm.','Kuvvet ve yolun ikisini de dört katına çıkarmak.','pressure-hydraulic'],
  ['gas-pressure','zor','Şemadaki açık kapta Patm=100 kPa, sıvının 2 m derinlik katkısı 20 kPa. Bu noktadaki mutlak basınç kaç kPa?',['20','80','100','120'],3,'Mutlak basınç atmosfer ve sıvı katkılarının toplamıdır: 100+20=120 kPa.','Gösterge basıncını mutlak basınç sanmak.','pressure-atmosphere'],
  ['daily-applications','zor','Aynı öğrenci geniş tabanlı kayakla ve ince tabanlı ayakkabıyla kara basıyor. Kayakta basınç azalsa da yere uyguladığı yaklaşık dik kuvvet için hangisi doğrudur?',['Artar','Azalır','Yaklaşık aynı kalır','Sıfır olur'],2,'Öğrencinin ağırlığı yaklaşık sabittir; alan değiştiği için basınç değişir, toplam dik kuvvet yaklaşık aynı kalır.','Küçük basıncın küçük toplam kuvvet anlamına geldiğini sanmak.','pressure-solid-area'],
];

function parseQuestions(rows: Question[], start: number) {
  return learningQuizQuestionSchema.array().parse(rows.map(([conceptId, difficulty, question, options, correctAnswer, explanation, misconception, visualId], index) => ({
    id: `pressure-q-${String(start + index).padStart(3, '0')}`,
    conceptId, difficulty, question, options, correctAnswer, explanation, misconception,
    ...(visualId ? { visualId } : {}),
  })));
}

export const pressureMainQuiz = parseQuestions(mainQuestions, 1);
export const pressureQuestionBank = parseQuestions(bankQuestions, 21);
