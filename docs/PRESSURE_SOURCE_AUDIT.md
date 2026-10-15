# Basınç kaynakları fizik doğruluk incelemesi

İnceleme tarihi: 15 Ekim 2026. İncelenenler: kullanıcı Downloads klasöründeki yeni 15 sayfalık PDF, NotebookLM Mind Map.png ve TYT_Fizik_Basınç_Konu_Özeti.png. PDF tümüyle raster; pypdf ile 15 sayfada da anlamlı metin çıkarılamadı. Bütün 15 sayfa 1500 piksel önizlemeyle görsel olarak incelendi. Özgün dosyalar değiştirilmedi. Kaynak hashleri source-manifest.json içinde.

## Yayın önerisi

Orijinal dosyaları kayıp olmadan özel arşivde koru; öğrenciye doğrulanmış ders kaynağı olarak doğrudan bağlama. Aşağıdaki yanlışlar düzeltilemediği için ayrı bir doğrulanmış PDF / HTML / SVG oluşturup onu sun. Hataları yalnızca başka bir kutuda açıklamak, görseldeki kesin yanlış ifadeyi ortadan kaldırmaz. Mevcut soru bankası ve öğrenci kayıtları kapsam dışı.

## PDF sayfa bazında

| Sayfa | Karar | Bulgu ve uygulanacak düzeltme |
| --- | --- | --- |
| 1 | Uygun | Kapak; kritik içerik hatası saptanmadı. |
| 2 | Koşul ekle | P=F/A ortalama temas basıncıdır; F yüzeye dik bileşendir. F=P A yalnız basınç düzgünse veya P ortalama değer alınırsa kullanılır. Basınç skaler, kuvvet vektöreldir. İğneden yayılan ışın benzeri okları basıncın vektör yönü gibi anlatma. |
| 3 | Değiştir | Çiviye çekiç darbesi dinamik olduğu halde kuvvetin her koşulda aynı değer/doğrultuda iletildiği yazıyor. TYT'de bu ideal basit modeldir; çivinin ivmesi, ağırlığı ve yan sürtünmeler yok sayılan, tek eksenli dengeli model diye sınırla. Genel cümle yerine aynı dik kuvvette temas alanı küçülürse ortalama basınç büyür de. |
| 4 | Koşul ekle | Sonuç P=ρgh sıvı ağırlığından doğan basınç katkısıdır. Açık kapta mutlak basınç P_atm+ρgh; h serbest yüzeyden noktaya düşey uzaklık. G/S türetimi sabit kesitli sıvı sütunu içindir; bütün kaplarda taban kuvvetinin toplam sıvı ağırlığına eşit olduğu sonucunu çıkarma. |
| 5 | Koşul ekle | Grafikler P-t, fakat sabit hacimsel debi belirtilmemiş. Açık kap, sabit yoğunluk, sabit Q ve çıkış yok varsayımı ekle. dh/dt=Q/A(h), dP_g/dt=ρg Q/A(h). Yukarı genişleyende eğim azalır; daralanda artar. Daralan şişenin sabit kesitli boynuna ulaşınca grafik yeniden doğrusal olur; tüm dolum boyunca sürekli hızlanan eğri kullanma. |
| 6 | Koşul ekle | (0+ρgh)/2 ile yan yüzey kuvveti yalnız serbest yüzeyden tabana uzanan dikey dikdörtgen yüzey için gösterge basıncıyla geçerli. Genel düz yüzeyde F_g=ρg h_c A; h_c alan ağırlık merkezinin düşey derinliği. Basınç merkezini alan ağırlık merkeziyle karıştırma. Atmosfer sıfır değildir; iki tarafta aynı atmosfer etkisi varsa net kuvvette sadeleşir. |
| 7 | Yeniden çiz | Hidrostatik paradoks karşılaştırmaları (genişleyen kap G>F_taban, daralan kap F_taban>G) uygun açık/sabit yoğunluklu modelde doğrudur. Ancak ortadaki kap taşarken düşük su seviyesi çizilmiş, su yüzeyleri eliptik/eğimli anlatıdan ayrılmıyor; dökülme dekorunu çıkar. F bir alan değildir: karşılaştırma F_taban=ρgh A_taban ile G=ρg V arasında; hayali sütun hacmi A_taban h kullan. |
| 8 | Yeniden çiz | Yağ ve su alt kıvrımda düşey sınırla ayrılmış; kırmızı çizgi bir yanda yağdan, diğer yanda sudan geçiyor. Aynı bağlı durgun sıvının aynı seviyesinde basınç eşitleme koşulu sağlanmıyor. Altta kesintisiz su, sol kolda üstte yağ ve yatay yağ-su ara yüzü çiz; referans çizgisini ara yüzünden geçir. h_yağ ve h_su bu ortak düzeyden ilgili serbest yüzeye ölçülür; iki uçta aynı dış basınçta ρ_yağ h_yağ=ρ_su h_su. |
| 9 | Koşul ekle | F/S1=G/S2, pistonlar aynı düzeyde, sürtünmesiz ve piston ağırlıkları ihmal edilmişse. Farklı yüksekliklerde ρgΔh ve yük/ağırlık eklenir. Pascal, kapalı akışkana eklenen ΔP'nin iletimidir. Kuvvet kazancı iş/enerji kazancı değildir; A1 Δx1=A2 Δx2. |
| 10 | Değiştir | Süreklilik ve Bernoulli koşulları eksik. Kararlı, sıkıştırılamaz, kayıpsız akışta aynı akım çizgisinde P+ρv²/2+ρgz sabit; yataysa hız artan yerde statik basınç azalır. Akış daima yüksek statik basınçtan düşüğe gider iddiası yanlıştır: çizimde boğazdan genişleyen kısımda akış daha yüksek statik basınca karşı sürerken yavaşlar. Bu ifadeyi çıkar. |
| 11 | Değiştir | Pipet/şırınga çekilmesi Bernoulli için doğrudan örnek değildir. Ağız/piston basıncı azaltılır; daha yüksek dış basınç sıvıyı iter. Ayrı atmosfer basıncı uygulaması olarak sun. Kanat için basınç dağılımı ve akışın momentum değişimi birlikte; eşit geçiş süresi / zorunlu uzun yol anlatımı ekleme. Çatı örneği nitel basınç farkı modelidir, tüm fırtına hasarını tek koşula indirgeme. |
| 12 | Düzelt | Magdeburg 16 atlı gösterisi için 1650 tarihi güvenilir değil; 17. yüzyıl de. Birden fazla gösterinin tarihi farklı kaynaklarda 1654/1657 diye geçiyor; gereksiz kesin tarih kullanma. P_atm≈ρ_Hg g h için üstteki gaz/buhar basıncı ve kılcallık ihmal edilir; h düşey seviye farkıdır. İnce tüpte kılcallık düzeltmesi gerekebileceğinden kesit alanı önemsizdir cümlesi ideal modelle sınırlandırılmalı. |
| 13 | Değiştir | Esnek balonda P_iç=P_dış koşulsuz doğru değildir. Gerilmiş zar basınç farkı gerektirir; eşitlik ancak zar gerilmesi ve diğer yükler ihmal edilen ideal esnek kap modelinde yaklaşık olur. Dış basınç arttığında aynı gaz miktarı ve sabit sıcaklıkta hacim azalır. PV sabit için P mutlak basınçtır; sıcaklık/gaz miktarı sabit koşulu korunmalı. |
| 14 | Düzelt | Yüksek rakımda suyun 80°C'de kaynayacağı evrensel değil. Belirli basınç verilmeden sayıyı çıkar veya yalnız örnek olduğunu belirt. NIST Antoine verisinden 80°C için yaklaşık 47,4 kPa hesaplanabilir. Daha erken kaynar yerine daha düşük sıcaklıkta kaynar de; süre, güç/kütle/başlangıç sıcaklığına da bağlıdır. Açık kapta daha düşük pişirme sıcaklığı pişmeyi uzatabilir. |
| 15 | Yeniden yaz | Önceki koşulsuz katı iletim, Bernoulli ve esnek kap eşitliği tekrarları var. PV sabit yalnız sabit n,T ve mutlak P için. Hız için v, hacim için V kullan. Güvenli özet: katı P_ort=F_dik/A; hidrostatik P=P_yüzey+ρgh; Pascal ΔP; uygun akışta süreklilik/Bernoulli; gazda PV=nRT, T kelvin. |

## Kavram haritası PNG

- Temel tanım, Pa=N/m², P=F/A uygundur; F dik bileşen, P ortalama olduğu açıklansın. P (Piezo) gereksiz/yanıltıcı etiket; P veya p yeterli.
- Katıda P=G/S yalnız yatay destek üstünde sadece ağırlık etkisiyle dengede olan cisim için. Dış kuvvet varsa F_dik kullan. Aynen kuvvet iletimi basit ideal modelle sınırlandırılsın.
- Pascal dalında toplam basınç yerine dışarıdan uygulanan basınç değişimi denmeli. Aynı derinlik koşulu ve hidrostatik artış ayrı.
- Yan yüzey kuvvetinde ortalama basınç alan üzerinden ortalamadır; geometrik orta nokta bütün şekiller için kullanılamaz.
- Birleşik kaplarda seviyeler aynı sıvı, aynı dış basınç ve durgun denge halinde eşittir.
- Akış dalındaki koşulsuz hız-basınç ve hep yüksekten alçağa statik basınç iddiaları düzeltilsin; PDF s10 koşulları geçerli.
- Gaz dalında esnek balon basınç eşitliği ideal zar varsayımıyla, Boyle ilişkisi sabit n,T ile; PV=nRT için T kelvin, P mutlak. Diğer ana dallarda kritik hata saptanmadı.

## Konu özeti PNG

- Sıvı basıncı çiziminde turuncu ölçüm noktası suyun ortasında, h oku ise neredeyse bütün sıvı yüksekliğini gösteriyor. h okunu serbest yüzey ile aynı ölçüm noktası seviyesine taşı.
- Pascal basınç değişimini iletir; toplam P'nin bütün noktalarda eşit olduğu izlenimini kaldır.
- Yan yüzeyde orta nokta metnini dikdörtgen düz yüzey diye sınırla veya alan ağırlık merkezi derinliği diye değiştir.
- Dolum grafiklerinde eksenler ve sabit hacimsel debi yok. P-h grafiği her kapta doğrusaldır; çizilen eğriler ancak sabit Q ile P-t veya h-t grafiği olarak geçerli. Eksenleri ve koşulları açıkla.
- Bernoulli koşulları ve statik basınç ayrımı eksik. Akışkanlar daima yüksek basınçtan alçak basınca hareket eder cümlesini çıkar.
- Torricelli için 76 cm, standart 1 atm civarının referansıdır; deniz seviyesinde her gün/konumda kesin 76 cm olmaz. Üstteki gaz basıncı ihmal edilmeli; h düşey seviye farkıdır.
- Son gaz paragrafındaki esnek balonda iç basınç her zaman dış basınca eşittir kesin yanlıştır; ideal gerilimsiz model veya zar basınç farkı açıklamasıyla değiştir. Sıkıştırma sonucu için yalnız sıcaklık değil gaz miktarı da sabit olmalı.

## Önceden oluşturulmuş yerel düzeltme taslağına ilişkin ek inceleme

`data/pressure-media-corrected/Basinc_ve_Akiskanlar_Dogrulanmis_Taslak.pdf` seçilebilir metinli, sıfırdan çizilmiş 15 sayfalık eski bir taslak. İlk yeni kaynağın piksel düzeltmesi değil; eski INCELEME.md sayfa eşleştirmeleri de bu kullanıcı PDF'siyle farklı. Yeni PDF'yi doğrudan doğrulanmış saymak için eski rapor kullanılamaz.

Eski taslak metni çoğunlukla doğru ve okunur; fakat her sayfa İNCELEME TASLAĞI diyor, iç üretim açıklamaları var. s6'da h_orta yerine alan ağırlık merkezi derinliği veya açık dikdörtgen koşulu gerekli; s10 Bernoulli cümlesine sıkıştırılamaz da eklenmeli. Örnek hesapları doğru: 60/0,020=3000 Pa; 8,314×300/0,02494≈100,008 kPa. Taslak doğrudan öğrenci yayınına uygun değil. Düzeltme metni/yazım altyapısı yeni türev için başlangıç olabilir, yeni kaynakla eşdeğerliği iddia edilmemeli.

## Birincil kaynaklar

- [OpenStax hidrostatik basınç ve baraj kuvveti](https://openstax.org/books/college-physics-2e/pages/11-4-variation-of-pressure-with-depth-in-a-fluid): basınç katkısı, ortalama basınç, toplam basınç ayrımı.
- [OpenStax hidrostatik kuvvetin alan integrali](https://openstax.org/books/calculus-volume-2/pages/2-5-physical-applications): değişen derinliğe sahip yüzeylerde kuvvet hesabı; h_c formülü bu integralin sabit yoğunluklu düz yüzeye uygulanmasıdır.
- [OpenStax Pascal ve hidrolik](https://openstax.org/books/college-physics/pages/11-5-pascals-principle): ΔP ve aynı yükseklik/sürtünmesiz piston varsayımları.
- [OpenStax süreklilik ve debi](https://openstax.org/books/college-physics-2e/pages/12-1-flow-rate-and-its-relation-to-velocity): Q=A v; dolumun dh/dt=Q/A(h) sonucu hacim korunumu çıkarımıdır.
- [NASA Bernoulli denklemi](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/bernoullis-equation/): akış koşulları, statik/dinamik basınç, akım çizgisi.
- [NASA kanat kaldırması ve yanlış eşit süre anlatımı](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/bernoulli-and-newton/).
- [OpenStax yüzey gerilimi ve balon iç basıncı](https://openstax.org/books/college-physics-2e/pages/11-8-cohesion-and-adhesion-in-liquids-surface-tension-and-capillary-action).
- [OpenStax ideal gaz yasası](https://openstax.org/books/college-physics/pages/13-3-the-ideal-gas-law): mutlak P,T ve gaz miktarı.
- [OpenStax basınç ölçümü](https://openstax.org/books/university-physics-volume-1/pages/14-2-measuring-pressure): manometre, Torricelli ve 760 mmHg referansı.
- [NIST su Antoine parametreleri](https://webbook.nist.gov/cgi/cbook.cgi?ID=C7732185&Mask=4&Type=ANTOINE&Plot=on): 334–363 K aralığı A=5,0768 B=1659,793 C=-45,854; P(bar)=10^(A-B/(T+C)). 353,15 K için yukarıdaki 47,4 kPa bu veriden hesaplanan örnektir.
- [Smithsonian Magdeburg yarımküreleri](https://www.americanhistory.si.edu/de/collections/object/nmah_1184614): vakum ve atmosfer basınç farkı mekanizması. Tarih farklılıkları için ayrıntılı tarihsiz anlatım önerildi.
- [MEB TYT örnekleri: katılar kuvveti aynen iletir ideal anlatımı](https://ogmmateryal.eba.gov.tr/panel/upload/etkilesimli/kitap/defterim/10/fizik/files/basic-html/page89.html): okul düzeyi ideal model kabulünü gösterir; gerçek darbe/sürtünme durumuna koşulsuz aktarılmamalı.


## Hazırlanan yeni öğrenci rehberi

- Üretici kaynak: `scripts/build-pressure-guide.py`; ReportLab ile yeniden üretilir.
- Hazırlanan dosya: `imports/pressure-learning-media/prepared/Basinc_ve_Kuvvet_Ders_Rehberi.pdf`.
- 15 A4 sayfa: temel basınç ve birimler, katı teması, sıvı derinliği, katmanlar ve doğru U-borusu, Pascal/hidrolik, düz yüzey kuvveti, hidrostatik paradoks, sabit debi grafikleri, barometre, ideal gaz, kaynama/rakım, Bernoulli ve günlük uygulamalar, formül ve kaynak sayfası.
- Formüller için model koşulları görünür verildi; hatalı orijinallerden raster sayfa/görsel alınmadı. Kullanıcının dosyaları değişmedi.
- Türkçe ve matematik simgeleri destekleyen fontlar PDF'ye gömülür. Üretici, gerekli glifleri ve açıklama kutularının taşma sınırlarını denetler.
- İlk render incelemesinde alt simge glifleri, bir rakım etiketi ve gaz hacmi şeması düzeltildi. Son baskının 15 sayfası tek tek incelendi; kırpılma, üst üste metin ve bozuk glif saptanmadı. Barometre tüpü üstten kapalı, alttan açık çizildi; h doğru iki serbest seviye arasında gösterildi.
- Rehberin son sayfasında 7 tıklanabilir resmi eğitim kaynağı var. Örnek hesaplar bağımsız kontrol edildi: 60/0,020=3000 Pa; 24/0,012=2000 Pa; 24/0,006=4000 Pa; 1000×10×0,60=6000 Pa; 100/0,002=50 kPa; 50 kPa×0,010=500 N; 0,002×0,10=0,010×0,02 m³.
- Teknik QA kanıtları `.cache/pressure-import/audit-pdf/` altında. Bu belge PDF+görsel kaynak incelemesidir; video inceleme ve önizleme bağlantısı ayrı entegrasyon aşamasında eklenir.


## Üç video: tamamlanan inceleme ve önizleme sürümü

Tam Türkçe ses dökümleri ve tüm slayt temas sayfaları incelendi. Yanlış veya eksik koşullu anlatımın bulunduğu 29 aralıkta özgün görüntü yeni bilimsel okuma kartıyla değiştirildi; o aralığın sesi kapatıldı. Doğru anlatımın kalan sesi korunur. Bu, yeni seslendirilmiş bir ders değil; özellikle sıvı videosu yoğun okuma sürümüdür. Kesintisiz sesli ders istenirse bu kartların Türkçe seslendirilmesi gerekir.

| Video | Süre | Düzeltme kartı | Sessiz okuma |
| --- | --- | --- | --- |
| Katı | 6:33 | 6 | 3:13 |
| Sıvı | 9:53 | 15 | 8:12 |
| Gaz | 7:10 | 8 | 4:24 |

### Zaman damgalı düzeltmeler

**Katı**

- 0:38–1:07: Basıncın tanımı ve gösterimi.
- 1:37–2:05: Pascal: basıncın SI birimi.
- 2:36–3:04: Katılarda kuvvet aktarımı.
- 3:04–3:44: Çivi neden daha kolay batar?.
- 4:40–5:16: Eşit kuvvet, farklı temas alanı.
- 5:16–5:52: Ağırlık tek başına yeterli değildir.

**Sıvı**

- 0:27–0:58: Sıvının oluşturduğu basınç.
- 1:21–1:57: ρgh bağıntısı nereden gelir?.
- 1:57–2:29: Üst üste karışmayan sıvılar.
- 2:29–3:01: Kabı sabit debiyle doldurmak.
- 3:01–3:35: Basınç kuvveti: doğru yüzeyi seçin.
- 4:16–5:11: U borusunda basınç dengesi.
- 5:11–5:56: Pascal ilkesi ve hidrolik sistem.
- 5:56–6:33: Aktarılan hacim yüksekliği belirler.
- 6:33–7:02: Doğru örnek: eşit kesitli iki kap.
- 7:06–7:34: Dikdörtgen yan duvarda basınç.
- 7:34–7:54: Yan yüzeyde kuvvet.
- 7:54–8:24: Yağ–su U borusu: doğru düzenek.
- 8:24–8:54: Yağın özkütlesini bulalım.
- 8:54–9:21: Modelin geçerlilik koşulları.
- 9:21–9:49: Kulaktaki etki: basınç farkı.

**Gaz**

- 0:49–1:30: Pipette sıvıyı ne yükseltir?.
- 1:30–1:57: Bernoulli: koşullarıyla kullanın.
- 2:40–3:10: İdeal gaz: sabit tutulanları belirtin.
- 3:18–3:50: Gerçek balon ve ideal balon.
- 3:50–4:22: Yükselen balon: koşullu sonuç.
- 5:19–5:55: Magdeburg yarım küreleri.
- 5:55–6:30: Ayırmak için gereken kuvvet.
- 6:30–7:01: Atmosfer basıncı neden ezmez?.

Her üç dosya tam çözümlemeden geçti. 29 kartın orta karesi yeni kartla karşılaştırıldı; aynı örneklerde ses RMS=0. İlk doğru anlatım örneğinde ses korunuyor. Çıktılar H.264/AAC, 1280×720, faststart ve 50 MB altında. Kaynak ve çıktı SHA-256 değerleri, kaynakça ve ölçümler `docs/PRESSURE_VIDEO_AUDIT.json` içinde. Otomatik ses dökümü yazım hataları içerebilir; bu çalışma mutlak bilimsel hatasızlık garantisi değildir.

## Entegrasyon ve veri koruma

- Altı özgün dosya `imports/pressure-learning-media/source/` altında korunur; `.env.local` ve `.env.staging.local` değiştirilmez.
- Öğrenci registry’si yalnız 3 incelenmiş MP4, 15 sayfalık yeni PDF ve 2 yeni infografiği içerir. Altı türev staging private `learning-media` bucket içinde `physics/pressure/reviewed-2026-10-15/` yolundadır; her uzak dosyanın SHA-256 değeri yerelle eşleşti. Eski nesnelerin üzerine yazılmadı.
- Öğren: dersler + kavram haritası + PDF ve iki görsel; İzle: üç oynatıcı ve sessiz okuma notu.
- Basınç soru bankası hazırlanıyor ekranında; 12 arşiv sorusu kayıtlı öğrenci bankasına bağlanmadı. Mevcut 20 kısa konu kontrolü ve 25 kart korunur.
- Staging’de yalnız Pascal dersi, kart016 ve q014 metinleri aynı kayıt kimlikleriyle düzeltildi. Seçenekler/doğru cevap, kullanıcı, oturum, deneme, yanlış defteri ve ders ilerleme kayıtları değiştirilmedi. Migration/seed uygulanmadı.
- `scripts/upload-pressure-media.ts` staging-ref/TLS/private bucket denetimi yapar; `--apply` olmadan yüklemez, mevcut nesneyi üzerine yazmadan hash ile denetler. `scripts/review-pressure-staging.ts` önce salt okunur SHA bildirir; uygulama aynı SHA gerektirir, içerik kimliklerini korur.
