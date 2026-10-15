# İvme — devam kaydı

Son doğrulama: 15 Ekim 2026. Kaldırma Kuvveti pilotu, ortak Generic Topic Engine üzerinde çalışır. 135 soruluk yerel soru bankası entegrasyonu en sondaki bölümde kayıtlıdır. Parola, oturum tokenı veya API anahtarı içermez.

## Amaç ve kararlar

- Türkçe, 18+ sınav hazırlık pilotu; ilk konu Fizik / Kaldırma Kuvveti.
- 2026 YKS resmî belgesi referanslı TYT öğrenme yolu. 2027 veya kesin TYT/AYT soru dağılımı doğrulanmış sayılmaz.
- MEB 10.2.2.1/10.2.2.2 kapsamında matematiksel model veriliyor, hesaplamalara girilmiyor; demo sorular kavramsal. Kaynaklar `docs/SOURCES.md` içinde.
- Next.js/TypeScript web + tek REST API. Expo/React Native aynı hesapları ve API'yi kullanır. DTO ve Zod şemaları `shared/contracts.ts` içinde.
- PGlite yerel diske kalıcı PostgreSQL motoru; `DATABASE_URL` varsa PostgreSQL adaptörü. Aynı PGlite dizinini yalnız bir süreç açmalı. PostgreSQL'e otomatik veri göçü yok.
- Yönetici medya akışı yerelde disk veya S3 uyumlu depolama kullanır. Kaldırma Kuvveti ders materyalleri private Supabase Storage'da tutulur; browser yalnız server'ın registry'deki `mediaId` için ürettiği 3600 saniyelik signed URL'yi alır. NotebookLM yalnız editöryal üretim aracı.
- Statik konu modülleri ortak `TopicDefinition` modeli ve topic registry ile açılır. Kavram haritasındaki kimlikler konuya ait canonical kaynak kabul edilir; kart, quiz, medya ve kavramlar arası ilişkiler registry'ye girişte birlikte doğrulanır.
- Soru sürümü ve sınav cezası girişimde sabitlenir; puan/seri sunucuda hesaplanır. İçerik tüketimi, yeni soru başarısı ve gecikmeli kontrol ayrı ölçülür.
- Özgün demo içerik alan uzmanı onaylı sayılmaz. Gerçek ses/video veya AI cevabı taklit edilmiyor.
- Arkadaş, liderlik, ödeme ve mağaza yayını pilotta uygulanmadı.

## Tamamlanan işler

- Responsive web: kayıt/giriş, 18+ beyanı, hedef, ana ekran, konu anlatımı, kartlar, alıştırma/deneme, sonuç/çözüm inceleme, tekrarlar, ilerleme ve ayarlar.
- API: cookie ve mobil bearer oturumları, yönetici yetkisi, kullanıcı izolasyonu, kayıtlı test devamı, idempotent bitirme/ödül, yanıt kilidi, soru snapshot'ı, ayrı kontrol havuzu, saat dilimi ve sınırlı seri koruma.
- Yönetim arayüzü/API: sınav/ders/konu/kazanım/anlatım/kart/soru/medya taslakları, inceleme, yayın ve arşiv. Düzenleme yeni sürüm üretir; üst öğenin arşivlenmesi alt içerik erişimini kapatır.
- Medya yükleme, tür/imza doğrulama, yayın kontrolü ve yetkili range okuma. Hata yanıtının API hata sınırından kaçmasına yol açan eksik await düzeltildi.
- Demo seed: 4 anlatım, 10 kart, 5 başlangıç + 15 alıştırma + 5 ayrı kontrol sorusu. Mevcut veri korunuyor; seed tekrar gerekli değil.
- AI için HTTPS JSON gateway sözleşmesi, kaynak kısıtı ve günlük kullanım sınırı; `docs/AI.md` yazıldı. Gerçek sağlayıcı bağlı değil ve özelliğin kapalı durumu açıkça gösteriliyor.
- Mobil Expo 57 istemcisi şablondan çıkarıldı: kayıt/giriş, SecureStore oturumu, hedef, ana ekran, konu/anlatım/kartlar, test/sonuç/çözüm inceleme, tekrarlar, geçmiş/ilerleme, yardım ve ayarlar ekranları.
- Mobil yeniden öne geldiğinde ve yenilemede sunucuyla eşitlenir. Medya isteklerinde yetkilendirme başlığı kullanılır; ses/video hata ve boş durumları gösterilir. Release API adresi HTTPS gerektirir.
- Web girişinde katalog yüklenirken görünen geçici yanlış hata ekranı düzeltildi.
- Web/mobil kurulum ve sınırlar README içinde güncellendi.
- Kaldırma Kuvveti için Interactive Concept Explorer, 25 flashcard, 20 soruluk deterministik quiz ve Öğren/İzle medya kartları bağlandı.
- Private `learning-media` bucket'ındaki video, PDF ve infografik için canonical metadata registry, server-only Supabase imzalama servisi ve `/api/learning-media/:mediaId` akışı eklendi. Arbitrary object path imzalanmaz; service role key istemci paketine girmez.
- Generic Topic Engine tamamlandı: ortak Öğren kaynakları, İzle, Kartlar, Testler ve kavram haritası bileşenleri `TopicDefinition` ile çalışıyor. Kaldırma Kuvveti URL'leri ve davranışı aynı kaldı. Sentetik ikinci konu yalnız test fixture'ı olarak ortak registry/bileşen akışından geçirildi; üretim registry'sine gerçek ikinci konu eklenmedi.

## Bu devamda değişen önemli dosyalar

- `shared/topic-engine.ts`, `shared/topic-registry.ts`: ortak konu modeli, registry, quiz yardımcıları ve konuya özel canonical `conceptId` doğrulaması.
- `shared/content/physics/buoyancy/data.ts`, `shared/content/physics/buoyancy/topic.ts`, `shared/content/physics/buoyancy/index.ts`: Kaldırma Kuvveti verisinin parse, konu tanımı ve uyumluluk export'ları olarak ayrılması.
- `components/topic-learning-content.tsx`, `components/concept-explorer.tsx`, `components/learning-app.tsx`: ortak Öğren/İzle/Kartlar/Testler/kavram haritası bileşenleri ve registry tabanlı rota çözümleme.
- `components/buoyancy-learning-content.tsx`: önceki dışa aktarımlar için ince uyumluluk katmanı; uygulama ortak bileşenleri doğrudan kullanır.
- `tests/topic-engine.test.tsx`: üretime eklenmeyen sentetik ikinci konu, ortak rota/link üretimi, bileşen render'ı ve canonical kimlik hata testleri.
- `shared/contracts.ts`, `shared/content/learning-media.ts`, `shared/content/physics/buoyancy/media.ts`: private Storage metadata sözleşmesi ve güvenilir registry.
- `server/learning-media.ts`, `server/api.ts`: 3600 saniyelik Supabase signed URL üretimi ve kimliği doğrulanmış API sınırı.
- `components/learning-media.tsx`, `app/globals.css`: video/PDF/infografik için loading, signed URL ve kontrollü hata durumları.
- `tests/media-content.test.tsx`, `tests/learning-media-service.test.ts`: registry, path kısıtı, imzalama isteği ve medya UI testleri.
- `.env.example`, `README.md`: server-only Supabase değişkenleri ve işletim notları.
- `mobile/App.tsx`: mobil öğrenci akışı ve API eşitleme.
- `mobile/api.ts`: bağlantı, bearer oturumu, SecureStore, timeout ve medya kaynakları.
- `mobile/account.tsx`, `mobile/ui.tsx`, `mobile/media.tsx`: hesap/hedef, ortak arayüz ve yerel medya oynatıcıları.
- `mobile/app.json`, `mobile/metro.config.js`, `mobile/.env.example`: uygulama kimliği, paylaşılan kod çözümlemesi ve bağlantı ayarı.
- `server/api.ts`: korumalı medya hatasında await düzeltmesi.
- `components/learning-app.tsx`: giriş sonrası yüklenme durumu.
- `tests/cross-device.test.ts`: cihaz oturumları arasında ortak ilerleme, diskte kalıcılık, medya yayın/range testleri.
- `README.md`, `docs/AI.md`, `DEVAM.md`: kurulum, sağlayıcı sözleşmesi ve devam kaydı.

Diğer temel dosyalar: `server/db.ts`, `server/core.ts`, `server/learning.ts`, `server/content.ts`, `server/media.ts`, `server/ai.ts`, `server/seed.ts`, `server/questions.ts`, `shared/contracts.ts`, `components/admin-panel.tsx`, `app/globals.css`, `tests/platform.test.ts`.

`data/` kalıcı veritabanını, özel yerel erişim dosyalarını ve kaynak PDF'leri içerir; silmeyin, paylaşmayın veya sürüm kontrolüne eklemeyin. `.env.local` yerel origin/demo ve server-only Supabase ayarlarıdır; Git tarafından yok sayılır. `scripts/refine-seed.py` bir kez uygulanmış eski dönüşümdür; yeniden çalıştırmayın. Proje Git deposudur ve `origin/main` GitHub remote'una bağlıdır. Mevcut dosyalar silinmedi.

## Çalıştırma komutları

Proje kökünde PowerShell:

```powershell
npm run dev
# http://localhost:3000
npm run typecheck
npm test
npm run build
# Geliştirme sunucusunu durdurduktan sonra:
npm start
```

Son kontrolde mevcut `npm run dev` sunucusu localhost:3000 üzerinde çalışır durumda bırakıldı. Yeni sunucu veya aynı kalıcı DB'yi açan CLI başlatmadan önce mevcut sunucuyu durdurun. Otomatik testler ayrı geçici/bellek DB kullanır.

Yalnız yeni/boş kurulumda:

```powershell
npm ci
npm run db:seed
npm run admin:create
```

`tsx` komutları `.env.local` dosyasını otomatik yüklemez; özel veri dizini/PostgreSQL için değişkenler oturumda da tanımlanmalı. Yerel özel erişim dosyalarının içeriğini notlara veya mesajlara kopyalamayın.

Mobil (kurulu proje; yeniden initializer çalıştırmayın):

```powershell
cd mobile
# İlk kurulum gerekiyorsa npm ci
# .env.example dosyasından .env oluşturup API adresini düzenleyin.
npm start
npx tsc --noEmit
npx expo export --platform android --platform ios --output-dir dist
```

Android emülatörü API adresi `http://10.0.2.2:3000`; fiziksel cihazda aynı ağdaki bilgisayarın LAN IPv4 adresi gerekir. Gerçek dağıtım HTTPS kullanır. Public değişkenlere gizli anahtar yazmayın. Native test için SDK 57 uyumlu Expo Go veya development build gerekir; uygun cihaz/emülatör henüz doğrulanmadı.

## Test sonuçları ve kanıt

- Web `npm run typecheck`: geçti.
- `npm test`: 7 dosyada 44 test geçti. Kimlik/yetki, kullanıcı izolasyonu, cevap gizliliği, puanlama, yayın/arşiv, flashcard/quiz, concept map, Generic Topic Engine, private medya registry'si ve signed URL servisi kapsanıyor.
- Yeni entegrasyon testi: web cookie ile kaydedilen yanıt mobil bearer oturumunda görüldü, mobilden tamamlanan test web geçmişinde görüldü; disk DB kapatılıp yeniden açılınca hesap/oturum/geçmiş/puan korundu ve çift ödül verilmedi. Bu, gerçek telefonda UI testi değildir.
- Yeni medya testi: geçici test WAV dosyası yüklendi; yayın öncesi erişim engellendi, yayın sonrası range okuma geçti, arşiv sonrası erişim engellendi. Dosya yalnız geçici test alanındaydı; pilot ders içeriği olarak sunulmadı.
- Web `npm run typecheck` ve `npm run build`: private Supabase medya entegrasyonuyla Next.js 16.3.5 üretim derlemesi geçti. Üretilen `.next/static` istemci paketlerinde service role değişkeni referansı bulunmadı.
- Gerçek private Storage testi geçti: üç signed URL endpoint'i `200` döndürdü. Video 463 saniyelik metadata ile oynadı ve yaklaşık 5 saniye ileri sarıldı; PDF yeni sekmede açıldı; 2752×1536 infografik yüklendi, modal açıldı ve Escape ile kapandı. MP4/PDF/PNG HEAD yanıtları `200`, ilk 1024 byte Range yanıtları `206`, MIME türleri ve dosya imzaları doğru. İlgili tarayıcı sekmelerinde konsol hata/uyarı sayısı sıfırdı.
- Generic Topic Engine sonrası tarayıcı kabulü: `/konu/buoyancy/ogren` üzerinde 6 dallı kavram haritası açıldı, PDF ve infografik yüklendi; `/izle` üzerinde 463 saniyelik private video görüldü; `/kartlar` 25 kartı ve `/testler` 20 soruyu gösterdi. Kontrol edilen sekmelerde konsol hata/uyarı yoktu.
- Mobil `npx tsc --noEmit`: geçti.
- Son Expo export: Android 716 modül ve iOS 694 modül; her biri yaklaşık 2,2 MB Hermes JS paketi, başarıyla `mobile/dist` içine yazıldı. APK/IPA veya gerçek cihaz doğrulaması değil.
- HTTP kontrolü: kayıt, oturum, hedef kaydı, kalıcı katalog geçti; origin eşleşmesi düzeltmesi doğrulandı.
- Üretim sunucusunda tarayıcı: 5 soruluk alıştırma tamamlandı. 4 doğru, 1 yanlış, 0 boş için 3,75 net; yanlış çözümü incelenmeden seri 0, incelemeden sonra seri 1. Sayfa yenilemesinde seri korundu; ilerlemede 20 puan, %80 yeni soru başarısı ve test geçmişi görüldü.
- Web ana ekranı masaüstü ve telefon genişliğinde incelendi. İlerleme ekranında telefon genişliğinde yatay taşma bulunmadı. Bu tüm sayfaların erişilebilirlik/cihaz matrisi testi değildir.
- Mobil audit: xcode → uuid zincirinde 10 orta seviye uyarı. İncelenen xcode kodu uuid.v4 kullanıyor; bildirim v3/v5/v6 ve dış buffer ile ilgili. Önerilen Expo 46 geri dönüşü uygulanmadı; dağıtım öncesi yeniden değerlendirme gerekir.

## Yarım kalan işler ve sınırlar

- Vercel ilk test sürümü production alan adına dağıtıldı; güncel kayıt ve PostgreSQL bağlantısı için uçtan uca kabul testi aşağıdaki bölümde takip ediliyor. Ortam değişkenleri, PostgreSQL/PGlite ayrımı, oturumlar, dosya sistemi ve 4,5 MB Function gövde sınırı `docs/VERCEL.md` içinde değerlendirildi. Uzak PostgreSQL v1 şeması ve 46 demo içerik kaydı hazır.
- Gerçek Android/iOS cihazında giriş → test → webde aynı ilerleme → uygulamayı kapat/aç akışı henüz çalıştırılmadı. Mobil aşamanın cihaz kabulü açık.
- Kaldırma Kuvveti video/PDF/infografik dosyaları private Supabase Storage'a bağlı ve web kabulü tamamlandı. Mobil video için ayrı WebVTT bağlama tamamlanmadı; transkript gösteriliyor.
- Yönetici arayüzünün tam manuel yükle/incele/yayın/arşiv akışı tarayıcıda tamamlanmadı; API testleri mevcut.
- AI sağlayıcı ve yönetici medya S3 bağlantısı doğrulanmadı. AI gateway genel sözleşmedir; belirli sağlayıcı SDK entegrasyonu veya parasal bütçe takibi değildir.
- Sorular/anlatımlar uzman incelemesi ve gerçek pilot kullanıcı kabulü bekliyor.
- E-posta doğrulama/şifre sıfırlama ve bildirim gönderimi bağlı değil. Mobil hesap silme/şifre değiştirme akışı yok; web ayarlarında var.
- Yerel PGlite şemayı ilk açılışta kurar; uzak PostgreSQL için v1 şeması `db:migrate` ile direct/session 5432 üzerinden bir kez uygulanır ve runtime yalnız sürüm kontrolü yapar. v1 sonrası şema değişikliğinden önce sürümlü migration sistemi eklenmeli.
- Mobil mağaza yayını yapılmadı. Mobil başlangıç ikonları son marka tasarımı değil.

## Sonraki somut adım

İkinci konu için uzman onaylı içerik paketi hazırlandığında kavram haritası, kart, quiz ve medya metadata'sını kendi `shared/content/...` klasörüne koy; `defineTopic` ile bir `TopicDefinition` oluşturup `shared/topic-registry.ts` içine kaydet ve mevcut katalog/yayın akışında konu ile anlatımlarını yayımla. Sentetik test fixture'ını üretim içeriğine dönüştürme. Production'da gerçek öğrenci kabulünü ayrı yürüt; e-posta doğrulama ve şifre sıfırlama henüz yok.

Proje kökü: `D:\dido_ile_okul_projesi`


## 23 Eylül 2026 production kayıt çalışması

- `APP_ORIGIN` Vercel Production için `https://exam-learning-platform-two.vercel.app` olarak güncellendi ve sonraki deployment ile etkinleşti. Önceki sürümde kayıt isteği origin kontrolünde 403 dönüyordu.
- Kayıt şifresi en az 8 karakter, en az bir rakam ve boşluk olmayan en az bir özel karakter gerektiriyor. Web/mobil arayüz, API ve testler aynı kuralı kullanıyor. Mevcut parolalarla giriş kuralı değiştirilmedi.
- Güvenilir origin, Host ve Vercel proxy başlıkları doğrulandı; CSRF ve TLS doğrulaması açık. Kayıt, giriş, çıkış, kendi hesaba erişim ve şifre sınırı testleri otomatik olarak kapsanıyor.
- `fe045c2` main dalına gönderildi. Vercel bu commit'in otomatik deployment'ını yazar eşleşmesi nedeniyle engelledi. Ardından GitHub proje sahibi hesabıyla commit yapıldı; kod değişiklikleri production'a ulaştı. Vercel koruma ayarları gevşetilmedi.
- GitHub proje sahibi hesabıyla kaydedilen `c12b067` Vercel'de production'a çıktı. Runtime Logs, `/api/auth/me` için `DATABASE_TLS_REQUIRED` bildirdi: Vercel bağlantı URL'sinde TLS modu bulunmuyor ve ayrı CA değeri çalışma anında kullanılamıyordu. Kod, ayrı CA ile sertifika ve sunucu adını doğrulayan TLS bağlantısına URL'de `sslmode` olmasa da izin verecek biçimde düzeltildi (`220f9ba`); `sslmode=disable` reddedilmeye devam ediyor.
- Ayrı CA değişkeni Vercel Production ve Preview için yerel, Git dışında tutulan CA sertifikasıyla güncellendi. Yalnız CA içeren geçici içe aktarma dosyası kaldırıldı; veritabanı URL'si veya parola aktarılmadı. `61e2787` deployment'ı bu ortam değişikliğiyle Production'da Ready oldu. `/api/auth/me` anonim istek için beklenen 401'i, kayıt sonrası 200'ü verdi; önceki 500 sona erdi.
- Production tarayıcı kabulü: geçici sentetik öğrenci hesabı `POST /api/auth/register` ile 200 aldı; üç şifre koşulu yazarken karşılandı durumuna geçti ve göster/gizle çalıştı. Sayfa yenilemede oturum korundu, hedef kaydı ve kendi hesap ayarlarına erişim çalıştı. Çıkış 200, yanlış şifreli giriş 401, aynı e-postayla ikinci kayıt 409, doğru şifreyle yeniden giriş 200 oldu. Test sonunda yalnız bu turda oluşturulan sentetik hesap ve bağlı kayıtları, kimlik/ad/zaman kontrolü yapılan işlemle kaldırıldı; gerçek öğrenci kaydı silinmedi.
- Son kod kontrolünde 10 dosyada 79 test, `npm run typecheck` ve `npm run build` geçti. Vercel Authentication koruması değiştirilmedi. Secret değerleri loga veya Git'e yazılmadı.

## 23 Eylül 2026 sınav → oturum → ders → konu yolu

- Çalışma dalı `codex/integrate-yks-buoyancy-analysis`; `main` ve production değişmedi. Önce Topic Engine, topic registry, catch-all sayfa rotası ve bu dosya incelendi. Next.js 16.3.5 yerel `node_modules/next/dist/docs/` bağlantı ve rota kılavuzu okundu.
- `shared/exam-registry.ts` sınav, oturum ve ders tanımlarını ve o derste gösterilecek canonical konu kimliklerini tutar. İlk yol `YKS → TYT / AYT → dersler` biçiminde kuruldu. TYT Fizik `buoyancy` kimliğine bağlanır. AYT Fizik şimdilik boş; aynı kimlik ileride AYT yoluna da eklenebilir. Registry bilinmeyen konu, yanlış ders yerleşimi ve tekrar eden kimlikleri reddeder. LGS/KPSS yeni sınav tanımı eklenerek açılabilir.
- Navigasyon, yalnız topic registry'de tanımı ve yayımlanmış katalogda kaydı bulunan konuları gösterir. Böylece yeni konu için `TopicDefinition`, registry kaydı, yayımlanmış içerik ve ders yolunda konu kimliği yeterlidir; konuya özgü sayfa bileşeni gerekmez. Mevcut `/konu/buoyancy` ve alt sekmeleri aynen çalışır. Quiz, video, kartlar, canonical `conceptId` ve öğrenci ilerlemesi konu kimliğine bağlı kalır; içerik çoğaltılmaz.
- Ana sayfada sınav seçimi eklendi. `/konular` sınav listesine, `/sinav/yks` oturumlara, `/sinav/yks/tyt` derslere ve `/sinav/yks/tyt/fizik` konu listesine açılır. İçeriği henüz olmayan dersler açık bir boş durum gösterir. Navigasyon için masaüstü, tablet ve telefon düzenleri eklendi.
- Yeni `tests/exam-navigation.test.tsx`: ana sayfa ve yol bağlantıları, TYT Fizik'teki 20 soruluk Kaldırma Kuvveti modülü, yayımlanmamış konu filtresi, AYT'de aynı canonical kimliğe tekrar bağlantısı ve hatalı registry girişleri kontrol edildi.
- Yerel doğrulama: `npm test` 13 dosyada 93 test geçti; `npm run typecheck` ve `npm run build` geçti. Şema/migration değişikliği yok; staging veya production verilerine yazılmadı.
- Vercel ayarlarında integration branch'e özel Preview `APP_ORIGIN`, `DATABASE_URL`, `DATABASE_CA_CERT_B64` ve Supabase değişkenleri mevcut. `APP_ORIGIN` görünen branch Preview adresiyle eşleşiyor. Branch'e özel değişkenler genel Preview değerlerini Vercel kuralına göre ezer. Secret içerikleri açılmadı veya kaydedilmedi.
- `b17d419` yalnız integration branch'ine push edildi; Vercel Preview deployment'ı `Ready` oldu ve branch adresinde uygulamanın giriş ekranı açıldı. Production deployment listesinde yeni sürüm oluşmadı. Preview veritabanı URL'si Vercel'de `Secret` türünde olduğundan hedef Supabase proje kimliği tarayıcıdan bağımsız okunamadı. Kullanıcıdan branch'e özel `DATABASE_URL` değerinin staging'e ait olduğunu doğrulaması ve kendi staging hesabıyla giriş yapması istendi. Bu gelene kadar Preview'de hesap/oturum/ilerleme yazan uçtan uca test yapılmadı; oturum sonrası navigasyonun görsel kabulü açık.

## 24 Eylül 2026 devam kontrolü

- Aktif dal `codex/integrate-yks-buoyancy-analysis`. İnceleme başında çalışma ağacı temizdi; yerel HEAD ve `origin/codex/integrate-yks-buoyancy-analysis` aynı `b35d165` commit'indeydi. Navigasyon kodu `b17d419`, Preview sınırı kaydı `b35d165` içinde. `main` ve `origin/main` `a9b3801` seviyesinde kaldı. Bu turda push, merge veya deployment yapılmadı.
- YKS navigasyonu kod düzeyinde tamamlanmış durumda: ana sayfa → YKS → TYT/AYT → ders → yayımlanmış konu yolu çalışıyor. TYT Fizik tek canonical `buoyancy` tanımına bağlanıyor; mevcut `/konu/buoyancy` URL'si, 20 soruluk test, soru bankası, çıkmış soru analizi, yedi SVG görsel, private medya, kartlar ve ilerleme altyapısı kopyalanmadan korunuyor. AYT Fizik aynı canonical konu kimliğini ileride tekrar referanslayabilecek veri modeline sahip. İncelemede yarım kalmış veya uncommitted uygulama kodu bulunmadı.
- Güncel yerel doğrulama: `npm test` 13 dosyada 93/93 geçti; `npm run typecheck` geçti; Next.js 16.3.5 `npm run build` geçti. Build yalnız beklenen dinamik catch-all sayfa ve API route'unu üretti.
- Yerel `.env.staging.local` bağlantı kimliği yerel production bağlantı kimliğinden farklı ve 6543 Transaction Pooler kullanıyor. Salt okunur audit `BEGIN READ ONLY` + `ROLLBACK` ile çalıştı: TLS etkin, sertifika ve sunucu adı doğrulandı; v1 şema ve beklenen 13 tablo eksiksiz. Sayılar: `content=46` (tamamı published/demo), `users=1`, `sessions=2`, `config=1`, `rate_limits=1`; ilerleme tabloları ve `attempts` boş. Hiçbir kayıt değiştirilmedi. Dosyadaki URL'de `sslmode` parametresi olmadığı için audit sürecinde yalnız process belleğinde `sslmode=verify-full` eklendi; dosya değiştirilmedi.
- Vercel'de integration dalına özel Preview `APP_ORIGIN`, `DATABASE_URL`, `DATABASE_CA_CERT_B64`, `SUPABASE_URL` ve service role değişkenleri son `b35d165` deployment'ından önce tanımlanmış. Branch `SUPABASE_URL` proje kimliği, değeri yazdırılmadan yerel staging 6543 bağlantısının proje kimliğiyle eşleştirildi ve production kimliğinden farklı olduğu doğrulandı. `b35d165` deployment'ı `Ready`; branch alias'ı doğru deployment'a bağlı. Runtime loglarında branch hostu için `/api/status` 200 ve anonim `/api/auth/me` 401; Warning/Error/Fatal sayıları sıfır.
- Vercel `DATABASE_URL` branch değeri `Secret` türünde ve kaydedildikten sonra okunamadığı için URL'nin proje kimliği doğrudan karşılaştırılamadı. Bu nedenle Preview'ın staging kullandığına dair yapılandırma ve runtime kanıtı güçlü olsa da `DATABASE_URL` için kriptografik/doğrudan eşleşme henüz kanıtlanmış sayılmıyor. Salt okunur sınırı korumak için hesap oluşturma, giriş, oturum veya ilerleme yazan Preview testi yapılmadı.
- Kesin kapanış için sonraki turda iki güvenli seçenekten biri uygulanmalı: branch'e özel `DATABASE_URL` bilinen `.env.staging.local` değeriyle yeniden kaydedilip yeni Preview deployment'ı alınmalı veya geçici, kimlik açığa çıkarmayan bir veritabanı fingerprint/status kontrolü kodlanıp yalnız Preview'da çalıştırılmalı. Her iki seçenek de yeni deployment gerektirdiğinden bu turdaki “deployment başlatma” sınırı nedeniyle uygulanmadı. Staging ayrımı kesinleşince staging test hesabıyla YKS/TYT/AYT navigasyonu, soru bankası, çıkmış analiz, medya ve ilerleme kabul testi yapılmalı.

## 24 Eylül 2026 sınav öncelikli başlangıç akışı

- Çalışma yalnız `codex/integrate-yks-buoyancy-analysis` dalında sürdürüldü. `main`, production veritabanı, Vercel production ve mevcut Preview deployment değiştirilmedi; push, merge ve deployment yapılmadı. Önceki yerel DEVAM.md kayıtları korundu.
- Kod değişikliğinden önce `.env.staging.local` bağlantısı secret değerleri açılmadan yeniden denetlendi. 6543 Transaction Pooler bağlantısının proje kimliği production bağlantısından farklı; TLS etkin ve sunucu adı/sertifika doğrulaması başarılı. Salt okunur transaction ile v1 şema, 13 tablo ve 46 published/demo içerik doğrulandı; hiçbir veri yazılmadı.
- İlk ziyaretçi artık giriş formu yerine tam sayfa sınav seçimi görüyor. YKS aktif; LGS ve KPSS genişletilebilir registry girdileri olarak “Yakında” durumunda. Akış YKS → TYT/AYT → ders → konu şeklinde çalışıyor. TYT Fizik yalnız canonical `buoyancy` konusuna bağlanıyor; AYT Fizik boş durum gösteriyor ve oturum değiştirici her iki yönde kullanılabiliyor.
- Misafir seçimi URL üzerinde korunuyor. Konu açıldığında giriş/kayıt ekranı seçilen YKS, oturum, ders ve konu bağlamını gösteriyor; başarılı girişten sonra aynı rota açık kalıyor. Henüz sınavı olmayan hesapta mevcut `users.exam_id` alanına `yks-2026` kaydediliyor. Yeni migration veya production veritabanı değişikliği gerekmiyor.
- Oturum açmış kullanıcı ana sayfası kayıtlı sınavı, günlük hedefi, son gezilen rotayı ve son tamamlanan denemenin `topic_id` değerini kullanıyor. Son konu varsa dinamik devam kartı ve içerik ilerlemesi gösteriliyor; yeni kullanıcı sabit Kaldırma Kuvveti kartına yönlendirilmiyor. Kullanıcıya özel son rota tarayıcıda `ivme:last-path:<user-id>` anahtarıyla tutuluyor; kalıcı ilerleme tabloları ve canonical konu kimlikleri değişmedi.
- Eski `/konu/buoyancy` ve alt sekme URL'leri korunuyor. Konu sayfalarına YKS / TYT / Fizik / Kaldırma Kuvveti breadcrumb'ı ve ders konularına dönüş bağlantısı eklendi. Generic Topic Engine, 25 kart, 20 soruluk test, özgün soru bankası, yedi SVG, çıkmış analizi, private medya ve mevcut öğrenci ilerlemesi aynı canonical `buoyancy` kaydını kullanmaya devam ediyor.
- Responsive başlangıç ekranı, sınav kartları, TYT/AYT değiştirici, boş konu durumu ve kişiselleştirilmiş ana sayfa stilleri eklendi. Mobilde sınav kartları tek kolona düşüyor ve oturum değiştirici erişilebilir kalıyor.
- Yeni testler ilk ziyaretçi ekranını, YKS/TYT/AYT gezinmesini, TYT Fizik canonical bağlantısını, AYT Fizik boş durumunu, konu seçiminin auth ekranına taşınmasını, eski URL'yi ve kayıt sonrası sınav tercihinin çıkış/giriş döngüsünde korunmasını doğruluyor. Son yerel sonuçlar: `npm test` 14 dosyada 98/98 geçti; `npm run typecheck` geçti; Next.js 16.3.5 `npm run build` geçti. `git diff --check` temiz.
- Sonraki güvenli adım, yerel değişiklikleri gözden geçirip integration dalına commit/push etmek ve branch Preview'ı staging veritabanıyla yeniden deploy ederek mobil ve oturumlu görsel kabul testlerini çalıştırmaktır. Bu turda kullanıcı sınırı gereği yapılmadı.

## 24 Eylül 2026 sınav öncelikli Staging Preview yayını

- `git fetch origin --prune` sonrasında integration dalı ve origin aynı `b35d165` commit'indeydi; `main` ve arkadaş branch'inde bu çalışmayla çakışan yeni commit yoktu. Yerel değişiklikler korunarak `7e198a0` (`Add exam-first YKS onboarding`) yalnız `codex/integrate-yks-buoyancy-analysis` dalına push edildi. PR #2 açık kaldı, head commit güncellendi; main'e merge veya production deployment yapılmadı.
- Vercel bağlantısını secret göstermeden kesinleştirmek için `ffe1356` ile `/api/status` yanıtına yalnız boolean `databaseProjectMatchesSupabase` ve bağlantı hazır bilgisini ekleyen kontrol kondu. `1248211` ile aynı boolean server-render edilen sayfada test otomasyonunun okuyabileceği veri işaretine bağlandı. URL, proje kimliği, parola, CA veya service role değeri yanıtlanmıyor.
- Final branch Preview deployment'ı `1248211` kaynak commitinde `Ready`. Kalıcı branch adresi `https://exam-learning-platform-git-codex-integrate-yks-5df59e-akin-dido.vercel.app`; bu turdaki immutable deployment adresi `https://exam-learning-platform-lzm0wocvd-akin-dido.vercel.app`. PR #2 Vercel kontrolü başarılı ve branch başarıyla deploy edildi durumunda.
- Branch'e özel Preview `DATABASE_URL`, `DATABASE_CA_CERT_B64`, `SUPABASE_URL`, service role ve `APP_ORIGIN` override'ları aktif. Preview DOM doğrulaması `database-project-matches-supabase=true` döndürdü; daha önce branch Supabase kimliğinin yerel `exam-learning-staging` 6543 bağlantısıyla eşleştiği ve production'dan farklı olduğu doğrulanmıştı. Misafir ekranının yüklenmesi API başlangıcındaki salt okunur v1 şema sorgusunun, TLS sertifika ve sunucu adı kontrolünün geçtiğini de doğruladı. Production veritabanına istek veya yazma yapılmadı.
- Preview salt okunur kabul testleri geçti: ilk ziyarette tam sayfa YKS/LGS/KPSS seçimi; YKS altında TYT ve AYT; AYT Fizik boş durumu; oturum değiştirici; TYT Fizik altında tek canonical Kaldırma Kuvveti bağlantısı; `/konu/buoyancy` sonrasında seçimin giriş/kayıt ekranına `YKS · TYT · Fizik · Kaldırma Kuvveti` bağlamıyla aktarılması. Eski URL çalışıyor.
- Mobil testte 490px etkin viewport altında sınav/kart düzeni ve TYT Fizik sayfası yatay taşma üretmedi; breadcrumb, TYT/AYT değiştirici ve Kaldırma Kuvveti kartı erişilebilir kaldı. Viewport testten sonra varsayılana döndürüldü. Masaüstü rotaları aynı branch adresinde doğrulandı. Final deployment log filtrelerinde Warning=0, Error=0, Fatal=0.
- Yerel son doğrulama: `npm test` 14 dosyada 99/99 geçti; `npm run typecheck` geçti; Next.js 16.3.5 production build geçti; `git diff --check` temiz. Yeni 99. test database/Supabase proje eşleştirme kontrolünün doğru ve yanlış hedefleri ayırt ettiğini doğruluyor.
- Kullanıcı onayından sonra yalnız Staging üzerinde rastgele kimlik bilgileriyle geçici bir öğrenci hesabı oluşturuldu. Kayıt başarılı oldu; seçilen YKS bağlamı ve `/konu/buoyancy` rotası kayıt sonrasında korundu. Çıkış, yeniden giriş ve sayfa yenileme sonrasında cookie oturumu ile kişiselleştirilmiş ana sayfadaki Kaldırma Kuvveti devam kartı korundu.
- Oturumlu Preview kabulünde TYT → Fizik → Kaldırma Kuvveti yolu, canonical konu içeriği, private signed URL kullanan video oynatıcı ve kaynağı, 25 bilgi kartı ile çevir/sonraki etkileşimi, Kolay/Orta/Zor soru bankası ve dört resmi PDF bağlantılı Çıkmış Analizi doğrulandı. Yeni soru veya ilerleme kaydı oluşturulmadı.
- Masaüstü kabulünün ardından 390×844 mobil viewport'ta kişiselleştirilmiş ana sayfa ve bilgi kartı ekranı test edildi. Mobil navigasyon göründü; breadcrumb, içerik sekmeleri ve kart erişilebilir kaldı; yatay taşma bulunmadı. Viewport test sonunda geri alındı.
- Test sonunda hesap ayarlarından yalnız sentetik hesap silindi. `ON DELETE CASCADE` kapsamındaki bağlı oturum ve kullanıcı kayıtları kaldırıldı; test e-posta kimliğine ait rate-limit anahtarı ayrıca hedefli olarak silindi. Son salt okunur Staging auditi TLS ve sunucu adı doğrulamasını, v1 şemayı, 13 tabloyu, `users=1`, `sessions=2`, `content=46` ve tüm ilerleme tablolarının boş olduğunu doğruladı. Audit sırasında `rate_limits=2` görüldü; sentetik hesaba ait kayıt kalmadığı doğrulandığı için diğer iki kayıt sahipliği bilinmeden silinmedi.
- Production ve `main` değiştirilmedi; Vercel Authentication koruması açık kaldı. Geçici parola, session token'ı, bağlantı adresi ve diğer secret değerleri dosyalara, Git geçmişine veya bu kayda yazılmadı.

## 24 Eylül 2026 PR #2 Production geçişi

- Merge öncesi PR #2 `Ready to merge` durumundaydı; iki kontrol başarılıydı ve `origin/main` ile otomatik merge simülasyonunda çakışma yoktu. Son yerel kapıda `npm test` 14 dosyada 99/99, `npm run typecheck`, Next.js 16.3.5 production build ve `git diff --check` geçti.
- PR #2 GitHub üzerinden `main` dalına merge edildi. Merge commit'i `068cd1a180fd914020449e7d702a9169bb42e86a`; PR kapanmış ve merged durumda. Migration, seed veya Production veritabanı yazma işlemi yapılmadı.
- Vercel, `068cd1a` için Production deployment oluşturdu ve durum `Ready` oldu. Production alias'ı `https://exam-learning-platform-two.vercel.app` yeni sürümü sunuyor.
- Vercel ortam kapsamları secret değerleri açılmadan denetlendi. `DATABASE_URL`, `DATABASE_CA_CERT_B64`, `SUPABASE_URL`, service role ve `APP_ORIGIN` için integration dalına özel Staging değerleri yalnız o dalın Preview kapsamına bağlı. Production deployment genel Production kapsamındaki ayrı değerleri kullanıyor. Canlı uygulamadaki güvenli işaret `database-project-matches-supabase=true` döndürdü; Production `DATABASE_URL` ile `SUPABASE_URL` aynı Supabase proje kimliğine ait. Staging secret'ı taşınmadı.
- Vercel Deployment Protection ekranında `Require Log In` açık ve kapsam `All Deployments`; Vercel Authentication kaldırılmadı. Protected sourcemaps da açık kaldı.
- Canlı salt okunur kabulte ilk ziyaret sınav seçimini gösterdi. YKS → TYT/AYT → ders yolu, TYT Fizik altındaki tek Kaldırma Kuvveti konusu ve AYT Fizik boş durumu doğrulandı. Eski `/konu/buoyancy` ile `ogren`, `izle`, `kartlar`, `testler`, `soru-bankasi` ve `cikmis-analizi` rotaları çalıştı; anonim kullanıcı için her biri doğru `YKS · TYT · Fizik · Kaldırma Kuvveti` bağlamıyla uygulama giriş kapısına yöneldi.
- Production üzerinde yeni hesap, oturum, deneme veya ilerleme kaydı oluşturulmadı. Bu nedenle oturum arkasındaki video/PDF/infografik oynatma ve kart/test etkileşimleri Production'da tekrar çalıştırılmadı; aynı commit ve private signed URL akışı Staging kabulünde doğrulanmıştı, medya/auth kodunda PR ile gerileme oluşturan değişiklik yok. Gerçek öğrenci verileri değiştirilmedi.

## 24 Eylül 2026 akıllı yanlış defteri ve giriş öncelikli akış

- `origin/main` ve `origin/feature/smart-mistake-notebook` fetch edildi. PR #3 taslak durumda ve eski integration dalını hedefliyor. Arkadaş dalı ortak tabandan 18 commit ileride, güncel `main` ise arkadaş dalından 3 commit ilerideydi. PR'ın başarısız görünen kontrolü kod testi değil: Vercel, commit yazarı takım üyesi olmadığı için Preview deployment'ı yetkilendirme aşamasında engelledi. PR yorumundaki yerel kontroller 105/105 test, typecheck ve build'in geçtiğini bildiriyordu.
- Güncel `main` tabanından `codex/integrate-smart-mistake-auth-flow` dalı açıldı. `feature/smart-mistake-notebook` değişiklikleri merge commit'iyle, çakışma olmadan entegre edildi. Arkadaşın `mistake_notes` tablosu, v2 migration'ı, servis/API katmanı, yanlış defteri ekranı ve testleri korundu. Production ve `main` değiştirilmedi.
- Mimari sınır: akıllı yanlış defteri PostgreSQL şema v2 gerektiriyor ve runtime v2 bekliyor. Production hâlâ v1 olduğu için bu dal ileride Production'a alınmadan önce ayrı onaylı Production migration'ı zorunlu. Bu turda Production'a migration veya veri yazma işlemi yapılmadı.
- Başlangıç akışı giriş öncelikli yapıldı. Oturumu olmayan kullanıcı bütün rotalarda giriş/kayıt ekranını görür. Eski konu bağlantısındaki YKS/TYT/Fizik/Kaldırma Kuvveti bağlamı korunur ve kayıtlı sınavı olan kullanıcı girişten sonra hedef rotada kalır. Sınavı olmayan kullanıcı giriş/kayıttan sonra tam sayfa sınav seçimine gider; seçim mevcut kullanıcı ayarları API'siyle kaydedilir ve YKS → TYT/AYT → ders → konu akışı açılır. Kayıtlı sınavı olan öğrenciler ana panele ve saklanan son konu/ilerleme bilgilerine geri döner. Çalışma panelindeki `Sınav ve konular` bağlantısı ile Ayarlar ekranındaki sınav seçimi sınav değiştirme olanağını korur. Authentication güvenliği ve parola politikası değiştirilmedi.
- Yerel doğrulama: entegrasyon sonrasında önce 105/105, giriş akışı testleri eklendikten sonra 15 dosyada 106/106 test geçti. `npm run typecheck`, Next.js 16.3.5 production build ve `git diff --check` başarılı. Staging smoke scripti yanlış defteri servisinin yaz/oku davranışını aynı transaction içinde doğrulayıp rollback edecek biçimde genişletildi.
- `.env.staging.local` bağlantıları değerleri açılmadan kontrol edildi: runtime 6543 Transaction Pooler, migration 5432 Session Pooler kullanıyor; iki bağlantı aynı staging projesine ait ve production projesinden farklı. TLS sertifika zinciri ile sunucu adı doğrulandı. Salt okunur ön audit 13 tablo ve şema v1 buldu. Yalnız staging üzerinde v2 migration çalıştırıldı; sonrasında 14 tablo ile `schema_migrations` v1+v2 doğrulandı. 46 demo içerik ve mevcut kullanıcı/oturum sayıları korundu. Smoke test hesap, oturum, ders/test ilerlemesi ve yanlış defterini doğruladı; işlem rollback edildi. Son audit geçici kullanıcı veya `mistake_notes` kaydı kalmadığını gösterdi.
- Vercel ortam kapsamları yeni dal push edilmeden önce güvenli hale getirildi. Production `DATABASE_URL`, `DATABASE_CA_CERT_B64`, `SUPABASE_URL`, service role ve `APP_ORIGIN` kayıtları yalnız Production kapsamına alındı. Staging veritabanı, TLS sertifikası, Supabase URL ve service role kayıtları tüm Preview dallarına uygulandı. Eski Preview `APP_ORIGIN` kaydı önceki integration dalına özel kaldı. Yeni dalın kesin Preview adresi oluştuktan sonra o dala özel `APP_ORIGIN` eklenmesi ve yeniden deployment alınması gerekiyor.
- Açık adımlar: yerel değişiklikleri commit etmek; yalnız `codex/integrate-smart-mistake-auth-flow` dalını push etmek; branch Preview adresine özel `APP_ORIGIN` tanımlamak; deployment'ı yeniden almak; güvenli proje eşleşme işaretini ve auth-first/yanlış defteri kabul akışını yalnız staging üzerinde test etmek. Production migration'ı ayrıca onaylanana kadar main merge edilmemeli.

## 25 Eylül 2026 entegrasyon ve Staging Preview kabulü

- Önceki bölümdeki açık adımlar tamamlandı. Entegrasyon dalı `codex/integrate-smart-mistake-auth-flow` origin'e gönderildi; `main` ve Production değiştirilmedi. Giriş öncelikli akış `3851a43`, kayıt sonrası eski konu bağlantısının korunması `89b688b`, ders/oturum gezintisinde son çalışılan konunun korunması `b6b5946` commit'lerinde. Arkadaşın akıllı yanlış defteri değişiklikleri merge geçmişinde ve kodda korunuyor; merge conflict yaşanmadı.
- Vercel'de Production veritabanı URL'si, CA sertifikası, Supabase URL'si, service role ve `APP_ORIGIN` yalnız Production kapsamına; Staging karşılıkları Preview kapsamına ayrıldı. Yeni dala özel Preview `APP_ORIGIN` kalıcı branch adresiyle eşleştirildi. Kalıcı Preview: `https://exam-learning-platform-git-codex-integrate-sma-cc8eb5-akin-dido.vercel.app/`. `b6b5946` kaynak commitli Preview deployment'ı `Ready` oldu. Preview sayfasının güvenli `database-project-matches-supabase=true` işareti görüldü; önceden ayrı doğrulanan Staging Supabase proje kimliğiyle birlikte DB ve Supabase değişkenlerinin aynı Staging projesine ait olduğu doğrulandı. Vercel Authentication koruması değiştirilmedi.
- Eski genel Preview kapsamındaki beş `AI_*` ve beş `S3_*` değişkeni yalnız Production kapsamına indirildi; değerler açılmadı. Böylece sonraki Preview deployment'ları bu Production yan servis anahtarlarını almayacak. Preview'da AI ve yönetici S3 yükleme kabulü yapılmadı; bunlar için ayrı Staging servisleri tanımlanırsa ayrıca test edilmeli. `DEMO_CONTENT` ve kullanılmayan `DATA_DIR` ortak kapsamda kaldı.
- Staging kabulü için yalnız sentetik öğrenci hesabı açıldı. İlk ziyaret giriş/kayıt ekranını, yeni hesap ise tam sayfa sınav seçimini gördü. Eski `/konu/buoyancy/testler` bağlantısından kayıt olan öğrenci YKS seçtikten sonra hedef konu yolunda kaldı. YKS → TYT/AYT → Fizik → Kaldırma Kuvveti ve AYT Fizik boş durumu çalıştı. Soru bankasının Kolay/Orta/Zor kümeleri sırasıyla 5/10/5 soruyu gösterdi; bilerek yanlış verilen bir soru deftere otomatik düştü. Neden, not ve özel etiket kaydedildi ve sayfa yenileme ile çıkış/yeniden girişten sonra korundu.
- Konu kartlarına gidip ders yoluna dönüldüğünde ana sayfadaki “son konu” kartının kaybolduğu bulundu. `lastTopicPath` yalnız canonical konu yolunu saklayacak biçimde düzeltildi ve regresyon testi eklendi. Yeni Preview'da kartlara gidip TYT Fizik'e dönüldükten sonra ana sayfa Kaldırma Kuvveti devam bağlantısını gösterdi; çıkış/yeniden girişte YKS seçimi ve bu bağlantı korundu. Masaüstü kabulü ve 390 px mobil yanlış defteri görünümü kontrol edildi; mobilde yatay taşma yoktu, viewport geri alındı.
- Uygulama 6543 Transaction Pooler bağlantısında ayrı CA ile TLS sertifika ve sunucu adı doğruluyor. Audit/smoke scriptlerinin eski `sslmode` URL parametresi zorunluluğu, uygulamanın güvenli ayrı-CA yoluyla uyumlu hale getirildi; güvensiz TLS modu reddi ve `authorized=true` denetimi devam ediyor. Staging `db:smoke` hesap, oturum, ders/test ilerlemesi ve yanlış defteri için geçti; test transaction'ı geri alındı.
- Sentetik kabul hesabı yalnız Staging'de, yerel Production bağlantısından farklı Supabase proje kimliği ve TLS doğrulaması yeniden yapıldıktan sonra hedefli olarak silindi. Bağlı 1 oturum ve 1 yanlış notu cascade ile kaldırıldı; kalan sentetik hesap ve bağlı kayıt sayısı sıfır. Son salt okunur audit: 14 tablo, şema v1+v2, 46 yayımlanmış demo içerik, önceki 1 kullanıcı ve 2 oturum korunmuş, `mistake_notes=0`, deneme/ilerleme tabloları boş. Başka hesap veya Production verisi değiştirilmedi.
- Son yerel kapı: `npm test` 15 dosyada 107/107 geçti; `npm run typecheck` ve Next.js 16.3.5 `npm run build` geçti. PR #3'ün arkadaş dalındaki Vercel CI engeli commit yazarının Vercel takım üyeliğiyle ilgiliydi; entegrasyon dalındaki proje sahibi commit'leri Preview'da `Ready` oldu. PR #3 hâlâ eski integration dalını hedefliyor; bu yeni dalın main'e alınması için ayrı PR/karar ve öncesinde onaylı Production v2 migration planı gerekiyor. Bu turda `main` merge, Production migration veya Production deployment yapılmadı.

## 25 Eylül 2026 v2 migration güvenlik hazırlığı

- Çalışma dalı `codex/integrate-smart-mistake-auth-flow`. `mistake_notes` v2 migration'ı tabloyu RLS açık kuracak ve `PUBLIC`, `anon`, `authenticated` için bütün doğrudan tablo izinlerini kaldıracak biçimde güncellendi. Sunucu bağlantısının okuma/yazma yetkisi şema denetiminde doğrulanıyor. Mevcut tabloda kolonlar, tipler, varsayılanlar, foreign key, primary/unique kısıtları, indeksler, RLS, policy ve izinler beklenen yapıda değilse migration transaction'ı rollback ediyor; v2 sürüm kaydı eklenmiyor.
- Temiz geçici PGlite veritabanında v1 → v2, kullanıcı/oturum/içerik/ilerleme kayıtlarının korunması, tekrar çalıştırma ve zorlanmış hata sonrası transaction rollback test edildi. Bozuk/kısmi mevcut v2 şeması için engelleme testleri eklendi.
- Staging 5432 Session Pooler ile 6543 Transaction Pooler bağlantılarının aynı `exam-learning-staging` projesine, Production bağlantısının ise farklı projeye ait olduğu ve TLS sertifika zinciri ile sunucu adının doğrulandığı kontrol edildi. Ön audit'te mevcut Staging v2 tablosunda RLS açıktı ve `anon`/`authenticated` için dört temel CRUD izni yoktu; buna karşın `TRUNCATE`, `REFERENCES`, `TRIGGER` izinleri bulunuyordu. Yalnız Staging'de, doğrulanmış 5432 bağlantısıyla `REVOKE ALL` uygulandı. Son salt okunur audit yeni şema doğrulayıcısından geçti. `db:smoke` sunucu tarafı hesap/oturum/ilerleme/yanlış defteri işlemlerini transaction içinde doğrulayıp rollback etti. Son sayılar: 14 tablo, v1+v2, 2 kullanıcı, 3 oturum, 46 içerik, 0 yanlış notu; audit öncesine göre veri kaybı yok.
- Son yerel kontroller: `npm test` 16 dosyada 120/120 geçti; `npm run typecheck`, `npm run build` ve `git diff --check` geçti. Secret dosyaları Git'e eklenmeyecek.
- Production üzerinde hiçbir migration, seed veya veri yazımı yapılmadı. Production için 5432 `MIGRATION_DATABASE_URL` yerelde henüz hazır değil. Uygulamadan önce Production proje kimliği 6543 runtime bağlantısıyla eşleştirilmeli, TLS doğrulanmalı, güncel yedek alınmalı ve ayrı bir veritabanında geri yükleme denenmeli. Geri dönüşte önce uygulama v1 uyumlu sürüme döndürülür; yeni v2 tablosu veri kaybını önlemek için yerinde bırakılır. Tam veritabanı geri yüklemesi ancak etkilenecek yeni kullanıcı/ilerleme yazıları değerlendirildikten sonra uygulanır.
- Sonraki aşama: yeni PR'ın kontrolleri ve Production yedeği doğrulandıktan, 5432 bağlantısı sağlandıktan ve ayrıca onay verildikten sonra Production v2 migration'ı; ancak ondan sonra `main` merge ve deployment. Bu turda Production geçişi yapılmaz.

## 15 Ekim 2026 · 135 soruluk yerel soru bankası

- Proje kökü `D:\dido_ile_okul_projesi`. Güncel `origin/main` (`968e821`) tabanından `feature/tyt-buoyancy-bank-135` açıldı. Eski Basınç dalı ve dosyaları korundu; yeni dalın main'e otomatik upstream bağlantısı kaldırıldı. Commit/push/PR, merge ve uzak deployment yapılmadı.
- Downloads'taki `Ivme_TYT_Kaldirma_Kuvveti_9_Test_135_Soru.zip`, `imports/buoyancy-question-bank/` altına güvenli çıkarıldı. ZIP'teki 80 dosyanın bayt bütünlüğü doğrulandı. `imports/` Git dışında; `.env.local` ve `.env.staging.local` SHA-256 karşılaştırmasıyla değişmemiş durumda.
- TYT → Fizik → Kaldırma Kuvveti → Soru Bankası: 3 Kolay, 3 Orta, 3 Zor; her test 15, toplam 135 beş seçenekli soru ve 64 SVG. Sabit soru sırası, önerilen süre, şema büyütme, sunucuda kayıtlı yanıttan devam ve test sonunda açıklamalı çözümler eklendi. Önceki 20 soruluk banka arşiv düğmesinden erişilir.
- 135 soru/cevap/çözüm ve 64 çizim incelendi; 78 sayısal hesap bağımsız doğrulandı. 22 farklı kimlikte 7 metin ve 17 SVG düzeltmesi yerel taslağa uygulandı; kaynak paket ve cevap harfleri aynı kaldı. Kimlik bazlı bulgular `docs/BUOYANCY_BANK_AUDIT.md`; bütün soruların kaynak/taslak hash ve cevap denetimi `server/content/buoyancy-bank-audit.json` içinde.
- Cevap anahtarı istemciye gönderilmez. Yeni girişimler mevcut `attempts` tablosunda ayrı mod ve soru snapshot'ıyla tutulur. Yanlış/boşlar mevcut Yanlış Defteri'ne şekil/çözümle kaydedilir. Eski ilerleme, notlar, etiketler, günlük seri/puan ve önceki test akışı korunur. Yeni migration veya bankaya özgü seed yoktur.
- Son kapı: 18 dosyada 213/213 otomatik test; `npm run typecheck`, Next.js production build ve `git diff --check` geçti. 64 SVG geçerli XML; üretim istemci paketlerinde 49 özel çözüm için yapılan taramada eşleşme yok. Test runner'ın Windows sandbox TEMP sorununda yalnız geçici dizin workspace `.cache` altına alındı; test mantığı değiştirilmedi.
- Ayrı yerel `.cache/buoyancy-question-bank/qa-data` PGlite alanında gerçek tarayıcıyla Kolay 1, Orta 1, Zor 1 tamamlandı: 45 soru/çözüm, 22 test şeması, yenilemede devam, sonuç kalıcılığı, yanlış/boş defteri ve mobil büyütme geçti. 64 SVG ayrıca görsel galeriyle incelendi. Yerel QA sunucuları testten sonra durduruldu; ekran kanıtları ve denetim çıktıları `.cache/buoyancy-question-bank/` altında. Bu gerçek telefon testi değildir.
- Staging'e yalnız salt okunur, doğrulanan TLS bağlantısı: farklı proje kimliği, şema v1+v2, 14 tablo ve 103 içerik doğrulandı; veri yazılmadı. Production, main ve gerçek öğrenci kayıtları bu çalışma sırasında değiştirilmedi.
- Kalan adımlar: düzeltmelerin öğretmen/editör incelemesi; feature branch commit/push ve Draft PR; yalnız o Preview dalının staging DB/Supabase/APP_ORIGIN eşleşmesini doğrulama; yalnız staging dalında `BUOYANCY_BANK_135_ENABLED=true` ile açıp kabul testi. Uzak ortamda varsayılan kapalıdır; yerel `next dev` incelemeye izin verir. Migration/seed çalıştırmayın.

## 15 Ekim 2026 · soru bankası Staging yayını

- Kullanıcının devam onayıyla 135 soruluk değişiklikler `9860b89` olarak yalnız `feature/tyt-buoyancy-bank-135` dalına commit/push edildi. [Draft PR #6](https://github.com/akinkirimli23/exam-learning-platform/pull/6) açıldı; main (`968e821`) aynı kaldı. Mevcut GitHub sahibinin doğrulanmış noreply commit kimliği kullanıldı; Vercel deployment yetkilendirmesi geçti.
- Vercel'de yalnız bu Preview dalına `APP_ORIGIN` ve `BUOYANCY_BANK_135_ENABLED=true` eklendi. Mevcut Preview DB/CA/Supabase/service role ayarları korundu; Production ayarları veya güvenlik korumaları değiştirilmedi. İlk kabul deployment'ı `2KN2nQ4KASWF3cvVqQbBcxNGFqzs`, kaynak `9860b89`, Preview ortamında Ready oldu.
- Kalıcı soru bankası adresi: https://exam-learning-platform-git-feature-tyt-buoyanc-9bad77-akin-dido.vercel.app/konu/buoyancy/soru-bankasi . İlk kabulün immutable deployment adresi: https://exam-learning-platform-a9ogwdkhr-akin-dido.vercel.app/ . Yazma istekleri için kalıcı branch adresini kullanın; `APP_ORIGIN` buna bağlıdır.
- Test yazılarından önce Dashboard Preview Supabase URL'si staging proje kimliğiyle, canlı Preview DOM işareti `database-project-matches-supabase=true` ile eşleştirildi. Yerel staging 6543 bağlantısında TLS sertifika/sunucu adı ve v1+v2 şema doğrulandı; production projesinden farklı hedefte 14 tablo ve 103 mevcut içerik vardı. Migration veya seed uygulanmadı.
- Yalnız kabul için sentetik bir staging öğrencisi oluşturuldu. Kolay 1, Orta 1 ve Zor 1 tarayıcıda tamamlandı: 45 soru, 45 çözüm, 22 şema; beş seçenek ve sıra; sayfa yenilemesinde devam; kalıcı sonuçlar; yanlış/boş defteri; mobil yatay taşma ve %150 şema büyütme/Escape kontrolleri geçti. Sonuçlar PostgreSQL'de ayrıca doğrulandı (13 doğru/1 yanlış/1 boş, 15 doğru, 15 doğru); iki defter kaydı oluştu. Browser hata/uyarı logu boştu.
- Test sonunda yalnız bu sentetik öğrencinin UUID/e-posta/ad/rol eşleşmesi doğrulanarak hesabı ve bağlı kayıtları temizlendi. Sayılar başlangıca döndü: 4 kullanıcı, 5 oturum, 103 içerik, 0 deneme, 0 yanlış; günlük aktivite/kart/tekrar alanları aynı, rate_limits=7. Test parolası yerel geçici kayıttan çıkarıldı. Gerçek öğrenciler ve production verileri değiştirilmedi.
- Kabul ekranları ve çıktılar Git dışında `.cache/buoyancy-question-bank/staging-*` altında. Preview sekmesi kullanıcıya giriş ekranıyla bırakıldı. Yerel 213/213 test, typecheck ve build sonucu aynı uygulama koduna aittir; bu yayın aşamasında uygulama kodu değiştirilmedi. Uzman yayın incelemesi ve ayrıca istenecek production/main geçişi açıktır; Draft PR merge edilmedi.

## 15 Ekim 2026 · Kolay Test 1 kitapçık arayüzü

- `feature/tyt-buoyancy-bank-135` üzerinde yalnız Kolay Test 1 için tekrar kullanılabilir HTML/CSS/SVG kitapçık eklendi. 15 soru dört sayfa; geniş masaüstünde çift/tek sayfa, mobilde tek sütun; mavi başlık/yönerge/numaralar, işlem alanları, sayfa altlıkları ve yanıt şeridi. Entegrasyon ayrıntıları `docs/QUESTION_BOOKLET.md`.
- Altı özgün sunum SVG'si ayrı `booklet/` klasöründe. Kaynak sorular, cevaplar, mevcut 64 SVG, eski snapshot'lar, auth, route ve diğer sekiz test korunur. Yeni migration/seed yok; öğrenci ilerlemesi için mevcut API kullanılır.
- İzole yerel QA verisiyle masaüstü 1440 px ve mobil 390 px: yanıt kaydı/yenilemede devam, 15 çözüm, 13 doğru/1 yanlış/1 boş, Yanlış Defteri, %150 büyütme/Escape ve görünüm geçişleri geçti. Yatay taşma yok; fiziksel telefon testi yapılmadı. Kanıtlar Git dışındaki `.cache/question-booklet/` altında.
- Son kapı: 19 dosyada 221/221 test, typecheck, Next.js production build başarılı. ZIP'in 80 dosyası ve iki `.env` dosyası hash karşılaştırmasıyla değişmemiş durumda.
- Bu arayüz değişikliği henüz commit/push veya Vercel deployment almadı. Production ve main aynı. Sonraki yayın adımı mevcut feature dalı / Draft PR #6 üzerinden yalnız staging Preview güncellemesidir.

## 15 Ekim 2026 · dokuz testin kitapçık görünümüne geçirilmesi

- Kullanıcının isteğiyle Kolay 2–3, Orta 1–3 ve Zor 1–3 aynı etkileşimli kitapçık düzenine bağlandı. Artık 9 test / 135 soru / 36 sayfa; teste göre doğru başlık ve 01–09 fasikül numarası. Kamuya açık kayıtlar `shared/content/physics/buoyancy/question-booklets.ts` üzerinden oluşturulur.
- Soru kimlikleri, metinler, cevap/çözümler, 64 kaynak SVG, önceki girişimler ve kayıt API'leri değişmedi. Kolay 1'in altı sunum SVG'si korunur; diğer testler kendi mevcut şemalarını kullanır. Eski banka arşivi aynı akışta kalır. Migration/seed yok.
- 19 dosyada 230/230 test, typecheck ve build geçti. Sandbox'taki junction kısıtından sonra build normal kullanıcı izinleriyle başarılı oldu. 1440 px yerel tarayıcıda dokuz testin tüm 135 sorusu ve dört sayfalık akışı; 390 px Zor Test 3'te dört sayfa, yanıt kaydı/yenilemede devam doğrulandı. Yatay taşma yok. Kanıtlar `.cache/question-booklet/all-tests-qa.json`, `mobile-all-pages-qa.json`, `hard-03-desktop.jpg`, `hard-03-mobile.jpg` içinde.
- Yalnız izole yerel QA verisi kullanıldı; 80 kaynak ZIP dosyası ve iki `.env` dosyası hash karşılaştırmasında aynı. Değişiklikler yerelde; commit/push, staging deployment, production veya main değişikliği yapılmadı.

## 15 Ekim 2026 · hacimli çizimler ve işlem alanlarının kaldırılması

- Kullanıcının tasarım geri bildirimiyle dokuz testin 64 şekli ayrı sunum SVG'leri olarak yenilendi: yansımaları olan cam kaplar, eliptik su yüzeyleri, ahşap/metal/buz dokuları, parlak küreler, gölgeler, dinamometre/tekne/katman düzenekleri. Kaynak 135 soru, cevaplar, çözümler ve özgün 64 SVG değişmedi. Eşleştirmeler soru kimliği, kaynak yolu ve metin imzasıyla korunur.
- Boş işlem/çözüm alanları ve son sayfa dolgu bölmesi kaldırıldı. Yapay sayfa yüksekliği kaldırıldı; seçenekler metin veya çizimden sonra gelir. Test sonundaki açıklamalı çözümler ve mevcut kayıt akışı korunur.
- 64/64 sunum SVG'si geçerli XML ve tarayıcıda yüklendi. 1440 px'de dokuz testin 36 sayfası / 135 sorusu / 675 seçeneği / 64 yeni görseli doğrulandı. 390 px'de Kolay 1'in 4+4+4+3 soruluk sayfaları, %150 büyütme/Escape kontrol edildi; yatay taşma ve işlem alanı yok. Fiziksel telefon testi değildir; viewport geri alındı. Kanıtlar `.cache/question-booklet/volumetric-*` altında.
- `npm test` 19 dosyada 230/230, typecheck ve build geçti. Build sandbox junction kısıtından sonra normal kullanıcı izinleriyle tamamlandı. 80 ZIP dosyası ve iki env dosyası hash denetiminde aynı. Yeni migration/seed yok; uzak veritabanına yazılmadı.
- Yerel önizleme `http://127.0.0.1:3100/konu/buoyancy/soru-bankasi` adresinde izole QA verisiyle açık. Arayüz değişiklikleri hâlâ commit/push/deployment almadı; main ve production aynı.

## 15 Ekim 2026 yayın hazırlığı ve tablet işaretleme

- Kullanıcı yeni tasarımın ana site açıldığında görünmesini istedi; önceki production'a dokunmama sınırını bu yayın için kaldırdı. Mevcut PR #6 ile feature branch üzerinden yayın hazırlanıyor.
- A–E harfleri belirgin daireler içinde, tüm seçenek satırı tıklanabilir. Tek yanıt vurgulanıyor; cevap değişikliği ve yenilemede saklanması izole yerel QA hesabında doğrulandı.
- 760 px üzerindeki tablet ve bilgisayarlarda Tek sayfa / Çift sayfa düğmeleri var. 1360 px üzerinde çift sayfa varsayılan; tabletlerde tek sayfa varsayılan, isteğe bağlı çift sayfa destekleniyor. 768, 1024, 1440 ve 390 px tarayıcı kontrollerinde yatay taşma yok.
- 19 dosyada 231/231 test, typecheck ve production build geçti. Staging ve Production veritabanları yalnız salt okunur audit ile kontrol edildi: iki ortam ayrı, TLS doğrulanıyor, şema v2 ve yanlış defteri uyumlu. Migration/seed gerekmez; mevcut öğrenci/ilerleme kayıtlarına dokunulmadı.
- Kalan yayın işlemleri: feature commit/push, yeni Preview kabulü, Production soru bankası bayrağı, main entegrasyonu ve canlı bağlantı doğrulaması.
## 25 Eylül 2026 TYT Fizik Basınç yerel geliştirmesi

- Güncel `origin/main` (`968e821`) üzerinden `feature/tyt-physics-pressure` dalı açıldı. Generic Topic Engine'e canonical `pressure` eklendi; TYT Fizik altında Kaldırma Kuvveti ile bağımsız yer alıyor. Bu çalışma `main` veya Production'a uygulanmadı.
- MEB OGM TYT Fizik Basınç kapsamı referans alınarak özgün katı/sıvı/Pascal/gaz/açık hava anlatımı, beş dallı etkileşimli kavram haritası, 25 kart, açıklamalı 20 ana soru, kolay/orta/zor seviyelerinde 4'er adet olmak üzere ayrı 12 soru bankası sorusu ve altı SVG şema hazırlandı. Bu konu için henüz video/PDF tanımlanmadı; çalışmayan medya bağlantısı üretilmiyor. Kaldırma Kuvveti'nin mevcut içerik ve ilerleme kimlikleri değiştirilmedi.
- Yanlış cevaplar canonical kavram kimlikleriyle Yanlış Defteri'ne kaydediliyor. Yerel PGlite testinde yeni v2 şema gerekmeksizin Basınç içeriklerinin 1 konu, 6 kazanım, 5 anlatım, 25 kart ve 20 veritabanı sorusu olarak eklenmesi, tekrar çalıştırmada değişiklik yapmaması, kısmi içerikte durması ve ana/soru bankası yanlışlarının deftere düşmesi doğrulandı. Uzak Staging veya Production veritabanına seed uygulanmadı. Staging için `scripts/seed-pressure.ts --staging` yalnız 6543/5432 aynı Staging proje kimliğini, Production'dan ayrımı ve TLS doğrulamasını kontrol ettikten sonra çalışacak şekilde hazırlandı.
- Yerel son kontrol: `npm test` 17 dosyada 126/126 geçti; `npm run typecheck` ve `npm run build` geçti. Yeni şema migration'ı gerekmiyor; Preview'da konunun görünmesi için Staging veritabanına kontrollü içerik seed'i gerekir.
- Vercel'de `DATABASE_URL`, `DATABASE_CA_CERT_B64`, `SUPABASE_URL` ve service role için Preview ve Production kapsamlı ayrı gizli kayıtlar görüldü. Preview değerleri yazıldıktan sonra okunamadığı ve yeni `feature/tyt-physics-pressure` dalına özel Staging override'ı henüz doğrulanamadığı için branch push/deployment yapılmadı. Yeni dalın `APP_ORIGIN` değeri de kendi Preview adresiyle eşleştirilmeli. Bu ayrım doğrulanmadan Staging'e veya Preview'a veri yazan kabul testi yapılmamalı.

## 25 Eylül 2026 Basınç Staging kabulü ve yayın hazırlığı

- `feature/tyt-physics-pressure` origin'e push edildi. Dala özel Preview `APP_ORIGIN` kalıcı adrese ayarlandı: `https://exam-learning-platform-git-feature-tyt-physics-fb84d4-akin-dido.vercel.app/`. Vercel Preview `Ready`; `main` ve Production değiştirilmedi.
- Preview sayfasındaki salt okunur veritabanı proje fingerprint'i yerel Staging proje kimliğiyle eşleşti; DB/Supabase proje eşleşme işareti de `true`. Hiçbir bağlantı değeri veya gizli anahtar çıktılanmadı. Staging 6543 bağlantısında TLS sertifika ve sunucu adı doğrulandı; v2 şeması sağlam. Basınç seed'i yalnız Staging'e 57 yeni demo içerik ekledi: 1 konu, 6 kazanım, 5 ders, 25 kart, 20 soru. Toplam içerik 46'dan 103'e çıktı. Tekrar çalıştırma değişiklik yapmadan tamamlandı; kısmi/çakışan içerik koruması yerel testte çalışıyor.
- Geçici Staging öğrenci hesabıyla kayıt, çıkış/yeniden giriş ve oturum kalıcılığı; YKS → TYT → Fizik → Basınç; etkileşimli kavram haritasında düğüm açıklaması; 25 kartlık deste ve kart çevirme; 20 soruluk ana testin tamamı; soru bankasının kolay/orta/zor dörder soruluk testleri ve görselleri; yanlış cevapların 27 Yanlış Defteri kaydı, neden/not düzenleme ve yenileme sonrası kalıcılığı doğrulandı. Mevcut Kaldırma Kuvveti konusu, 20 soruluk test rotası, 25 kart ve üç seviye soru bankası açıldı.
- Geçici hesap, bağlı oturum ve 27 yanlış notu yalnız Staging'de hedefli transaction ile silindi; ilgili hız sınırı anahtarı da temizlendi. Son salt okunur audit: 14 tablo, v1+v2, 2 kullanıcı, 103 yayımlanmış demo içerik, 0 yanlış notu, 0 deneme/ilerleme kaydı. Staging'de başka etkinlik olabildiği için toplam oturum sayısı 4; silinen test hesabına bağlı oturum sayısı sıfır. İçerik sayısı temizlik öncesiyle aynı kaldı.
- Production seed çalıştırıcısı `--production` için açık hedef, 6543/5432 aynı proje, yerel Staging'den ayrı proje, `DEMO_CONTENT=true` ve TLS CA/sunucu adı yapılandırması koşullarına bağlandı. `--check-target` yalnız yerel yapılandırmayı denetler, veritabanına bağlanmaz. Yanlış hedef eşleşmeleri başlamadan reddedildi; gerçek Production seed'i çalıştırılmadı. Yeni migration gerekmiyor. Onay sonrası önce Production bağlantısı ve 46 mevcut içeriğin salt okunur audit'i, sonra tek transaction içinde yalnız eksik Basınç paketi, ardından içerik sayıları ve tekrar çalıştırma no-op kontrolü yapılmalı. Kısmi veya beklenmeyen şemada durulmalı; mevcut içerik güncellenmemeli.
- Son yerel kapı: `npm test` 17 dosyada 127/127, `npm run typecheck` ve `npm run build` geçti. PR main'e açılacak; merge ve Production seed/deployment ayrıca onay bekliyor.

## 25 Eylül 2026 Basınç private medya incelemesi

- Çalışma yalnız `feature/tyt-physics-pressure` dalında ve PR #5 kapsamında sürdürüldü. Staging private `learning-media` bucket'ındaki üç MP4, iki PNG ve bir PDF'nin gerçek nesne yolları ile MIME türleri salt okunur doğrulandı. Staging proje kimliği yerel Production kimliğinden farklı ve TLS sertifika/sunucu adı doğrulaması başarılı. Production'a erişilmedi; Storage nesneleri değiştirilmedi.
- Üç mevcut MP4, merkezi Basınç media registry'sine server-side signed URL akışıyla ayrı başlık ve oynatıcı olarak eklendi. Video süresi tarayıcı metadatası açıldığında gösteriliyor; native kontroller ve mobil `playsInline` korunuyor. Service role key istemci koduna eklenmedi. PDF ve PNG'ler içerik denetimi bitene kadar registry dışında tutuldu; 25 kart, etkileşimli kavram haritası ve mevcut sorular değişmedi.
- İki PNG ve görüntü tabanlı 15 sayfalık PDF görsel olarak incelendi. Bulgular Git tarafından yok sayılan `data/pressure-media-corrected/INCELEME.md` içinde görsel/sayfa bazında kayıtlı: PNG'deki Torricelli yılı 1943 yerine 1643; PDF s.14'teki `PV=T` yerine `PV=nRT`; katı kuvvet aktarımı, Pascal, Bernoulli, hidrolik, mutlak/gösterge basıncı ve tarih/sıcaklık genellemeleri ayrıca düzeltme gerektiriyor.
- Orijinal raster görsellerin üstü kapatılarak düzenleme yapılmadı. Aynı Git-ignored klasörde 15 sayfalık özgün yeniden çizilmiş PDF ve iki yeni infografik PNG **inceleme taslağı** olarak hazırlandı. PDF sayfa sayısı, yeni denklem ve tarih otomatik; sayfa 14 ile iki infografik görsel olarak kontrol edildi. Taslaklar onay bekliyor; Storage'a yüklenmedi, media registry'ye eklenmedi ve öğrencilere gösterilmiyor. CSV kartları ve kavram haritası görseli henüz yerel projede yok.
- Yerel doğrulama: `npm test` 17 dosyada 130/130 geçti; `npm run typecheck` ve `npm run build` geçti. Preview'ın güncel kodla browser kabulü ve videoların uygulama üzerinden oynatımı ayrıca tamamlanmalı. Production ortamında medya nesneleri mevcut değilse PR #5 merge öncesinde ayrıca aktarım planı gerekir; orijinal hatalı PDF/PNG'ler aktarılmamalı.
- Video kodu `6563584` ile yalnız feature dalına push edildi; PR #5 son commit'i içeriyor, iki GitHub kontrolü geçti ve yeni Preview `Ready`. Preview alias'ındaki salt okunur veritabanı fingerprint'i Staging proje kimliğiyle eşleşti; Supabase proje eşleşme işareti `true`. Geçici Staging hesabıyla YKS → TYT → Fizik sayfasında hem Basınç hem Kaldırma Kuvveti görüldü. Basınç İzle sekmesinde üç ayrı private signed-URL oynatıcısı ve gerçek metadata süreleri (6:33, 9:53, 7:10) yüklendi; hatalı PDF/PNG hiç gösterilmedi. İlk videonun oynat düğmesine basıldığında Codex uygulama içi tarayıcı sekmesi çöktü; gerçek görüntülü oynatma, ileri/geri sarma ve mobil kabulü bu nedenle **doğrulanmadı**. Bu olayın uygulama mı yoksa tarayıcı ortamı mı kaynaklı olduğu henüz kesin değil. Geçici QA hesabı ve tek bağlı oturumu yalnız Staging'de hedefli transaction ile silindi; kullanıcıya bağlı diğer tablolarda kayıt yoktu.

## 15 Ekim 2026 · kitapçık Production yayını tamamlandı

- PR #6 main'e 3df8cba merge commit'iyle alındı. Vercel Production 2UYMXNN2f46VPnz7nkHvgebzyPUA Ready; ana domain exam-learning-platform-two.vercel.app. Dokuz test / 135 soru / 64 hacimli SVG, A-E işaretleme ve tablet/PC tek/çift sayfa canlıda doğrulandı. Test yanıtı verilmeden Kolay Test 1 açıldı.
- Yeni Preview kabulünde yalnız sentetik staging öğrencisinin yanıt kaydı ve çift sayfa doğrulandı; hesap ve bağlı kayıtları hedefli temizlendi, başlangıç sayıları korundu. Yeni migration/seed uygulanmadı. 231/231 test, typecheck ve build geçti.

## 15 Ekim 2026 · Basınç yeni medya paketi

- Kullanıcı altı yeni dosyanın Basınç'a yerleştirilmesini ve doğruluk denetimini istedi; soru bankası sonraya bırakıldı. Kullanıcının bu tur hedefi yalnız staging/Preview; Production yayını yok.
- `codex/pressure-learning-media`, güncel main3df8cba üzerine eski Basınç feature çalışmasını birleştirir; bank tanımı çakışması giderildi, 12 arşiv sorusu yayımlanmadı. Altı özgün dosya imports/pressure-learning-media/source altında; 3 incelenmiş video +15 sayfa yeni PDF+2 SVG/PNG hazır.
- Kaynak doğruluk raporu docs/PRESSURE_SOURCE_AUDIT.md; 29 video okuma kartı ve fizik koşulları düzeltildi. Özellikle sıvıda sessiz okuma çoğunluktadır; yeni seslendirilmiş ders diye sunulmaz.
- Altı türev yalnız staging private Storage physics/pressure/reviewed-2026-10-15 yoluna yüklendi, her dosya uzak SHA-256 ile doğrulandı. Stagingde üç mevcut metin kimlik değiştirmeden düzeltildi; öğrenci kayıt hashleri aynı. Yeni migration/seed yok.
- 244/244 test, typecheck ve build geçti; build Windows sandbox junction kısıtından sonra gerekli izinle tamamlandı. Preview kabulü sürüyor; production ve main değişmedi.
