# İvme — devam kaydı

Son doğrulama: 22 Eylül 2026. Kaldırma Kuvveti pilotu, ortak Generic Topic Engine üzerine taşındı; mevcut rotalar ile private Supabase Storage signed URL akışı korunarak tarayıcıda yeniden doğrulandı. Bu kayıt son doğrulanan durumu anlatır. Parola, oturum tokenı veya API anahtarı içermez.

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

- Vercel ilk test sürümü için ortam değişkenleri, PostgreSQL/PGlite ayrımı, oturumlar, dosya sistemi ve 4,5 MB Function gövde sınırı `docs/VERCEL.md` içinde değerlendirildi. Henüz Vercel deployment yapılmadı. Uzak PostgreSQL bağlantısı, ilk seed ve HTTPS üzerinde uçtan uca kabul testi hâlâ gerekli.
- Gerçek Android/iOS cihazında giriş → test → webde aynı ilerleme → uygulamayı kapat/aç akışı henüz çalıştırılmadı. Mobil aşamanın cihaz kabulü açık.
- Kaldırma Kuvveti video/PDF/infografik dosyaları private Supabase Storage'a bağlı ve web kabulü tamamlandı. Mobil video için ayrı WebVTT bağlama tamamlanmadı; transkript gösteriliyor.
- Yönetici arayüzünün tam manuel yükle/incele/yayın/arşiv akışı tarayıcıda tamamlanmadı; API testleri mevcut.
- AI sağlayıcı, gerçek PostgreSQL/S3 bağlantıları ve canlı barındırma doğrulanmadı. AI gateway genel sözleşmedir; belirli sağlayıcı SDK entegrasyonu veya parasal bütçe takibi değildir.
- Sorular/anlatımlar uzman incelemesi ve gerçek pilot kullanıcı kabulü bekliyor.
- E-posta doğrulama/şifre sıfırlama ve bildirim gönderimi bağlı değil. Mobil hesap silme/şifre değiştirme akışı yok; web ayarlarında var.
- Yerel PGlite şemayı ilk açılışta kurar; uzak PostgreSQL için v1 şeması `db:migrate` ile direct/session 5432 üzerinden bir kez uygulanır ve runtime yalnız sürüm kontrolü yapar. v1 sonrası şema değişikliğinden önce sürümlü migration sistemi eklenmeli.
- Mağaza/üretim yayını yapılmadı. Mobil başlangıç ikonları son marka tasarımı değil.

## Sonraki somut adım

İkinci konu için uzman onaylı içerik paketi hazırlandığında kavram haritası, kart, quiz ve medya metadata'sını kendi `shared/content/...` klasörüne koy; `defineTopic` ile bir `TopicDefinition` oluşturup `shared/topic-registry.ts` içine kaydet ve mevcut katalog/yayın akışında konu ile anlatımlarını yayımla. Sentetik test fixture'ını üretim içeriğine dönüştürme. Ardından Öğren → İzle → Kartlar → Testler → kavram haritası kabul akışını çalıştır.

Proje kökü: `C:\Users\akink\OneDrive\Masaüstü\Ders_Uygulama_proje`


## 23 Eylül 2026 production kayıt çalışması

- `APP_ORIGIN` Vercel Production için `https://exam-learning-platform-two.vercel.app` olarak güncellendi; değişikliğin etkili olması yeni deployment gerektiriyor. Önceki sürümde kayıt isteği origin kontrolünde 403 dönüyordu.
- Kayıt şifresi en az 8 karakter, en az bir rakam ve boşluk olmayan en az bir özel karakter gerektiriyor. Web/mobil arayüz, API ve testler aynı kuralı kullanıyor. Mevcut parolalarla giriş kuralı değiştirilmedi.
- Güvenilir origin, Host ve Vercel proxy başlıkları doğrulandı; CSRF ve TLS doğrulaması açık. Kayıt, giriş, çıkış, kendi hesaba erişim ve şifre sınırı testleri dahil 77 test geçti. Typecheck ve production build geçti.
- `fe045c2` main dalına gönderildi. Vercel bu otomatik deployment’ı commit yazarını proje katkı yetkisiyle eşleştiremediği için engelledi. Production DB ve gerçek kayıt doğrulaması yeni deployment sonrası yapılacak; henüz başarılı olduğu iddia edilmemeli.
