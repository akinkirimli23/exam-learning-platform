# İvme — devam kaydı

Son doğrulama: 21 Eylül 2026. Devam isteğinde dosyalar incelendi; eksik devir notu oluşturuldu, yarım kalan mobil istemci uygulandı. Bu kayıt son doğrulanan durumu anlatır. Parola, oturum tokenı veya API anahtarı içermez.

## Amaç ve kararlar

- Türkçe, 18+ sınav hazırlık pilotu; ilk konu Fizik / Kaldırma Kuvveti.
- 2026 YKS resmî belgesi referanslı TYT öğrenme yolu. 2027 veya kesin TYT/AYT soru dağılımı doğrulanmış sayılmaz.
- MEB 10.2.2.1/10.2.2.2 kapsamında matematiksel model veriliyor, hesaplamalara girilmiyor; demo sorular kavramsal. Kaynaklar `docs/SOURCES.md` içinde.
- Next.js/TypeScript web + tek REST API. Expo/React Native aynı hesapları ve API'yi kullanır. DTO ve Zod şemaları `shared/contracts.ts` içinde.
- PGlite yerel diske kalıcı PostgreSQL motoru; `DATABASE_URL` varsa PostgreSQL adaptörü. Aynı PGlite dizinini yalnız bir süreç açmalı. PostgreSQL'e otomatik veri göçü yok.
- Medya yerelde disk, isteğe bağlı S3 uyumlu depolama. NotebookLM yalnız editöryal üretim aracı.
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

## Bu devamda değişen önemli dosyalar

- `mobile/App.tsx`: mobil öğrenci akışı ve API eşitleme.
- `mobile/api.ts`: bağlantı, bearer oturumu, SecureStore, timeout ve medya kaynakları.
- `mobile/account.tsx`, `mobile/ui.tsx`, `mobile/media.tsx`: hesap/hedef, ortak arayüz ve yerel medya oynatıcıları.
- `mobile/app.json`, `mobile/metro.config.js`, `mobile/.env.example`: uygulama kimliği, paylaşılan kod çözümlemesi ve bağlantı ayarı.
- `server/api.ts`: korumalı medya hatasında await düzeltmesi.
- `components/learning-app.tsx`: giriş sonrası yüklenme durumu.
- `tests/cross-device.test.ts`: cihaz oturumları arasında ortak ilerleme, diskte kalıcılık, medya yayın/range testleri.
- `README.md`, `docs/AI.md`, `DEVAM.md`: kurulum, sağlayıcı sözleşmesi ve devam kaydı.

Diğer temel dosyalar: `server/db.ts`, `server/core.ts`, `server/learning.ts`, `server/content.ts`, `server/media.ts`, `server/ai.ts`, `server/seed.ts`, `server/questions.ts`, `shared/contracts.ts`, `components/admin-panel.tsx`, `app/globals.css`, `tests/platform.test.ts`.

`data/` kalıcı veritabanını, özel yerel erişim dosyalarını ve kaynak PDF'leri içerir; silmeyin, paylaşmayın veya sürüm kontrolüne eklemeyin. `.env.local` yerel origin/demo ayarlarıdır. `scripts/refine-seed.py` bir kez uygulanmış eski dönüşümdür; yeniden çalıştırmayın. Klasör şu an Git deposu değil; değişiklik listesi git diff'e dayanmıyor. Mevcut dosyalar silinmedi.

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

Son kontrolde `npm start` ile üretim sunucusu localhost:3000 üzerinde çalışır durumda bırakıldı. Yeni sunucu veya aynı kalıcı DB'yi açan CLI başlatmadan önce mevcut sunucuyu durdurun. Otomatik testler ayrı geçici/bellek DB kullanır.

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
- `npm test`: 2 dosyada 23 test geçti. Kimlik/yetki, kullanıcı izolasyonu, cevap gizliliği, net/boş/negatif net, yanıt kilidi, snapshot, kontrol havuzu, eşzamanlı/tekrar ödül, saat dilimi, seri koruma, yayın/arşiv, demo filtresi, AI yokluğu ve soru yapısı kapsanıyor.
- Yeni entegrasyon testi: web cookie ile kaydedilen yanıt mobil bearer oturumunda görüldü, mobilden tamamlanan test web geçmişinde görüldü; disk DB kapatılıp yeniden açılınca hesap/oturum/geçmiş/puan korundu ve çift ödül verilmedi. Bu, gerçek telefonda UI testi değildir.
- Yeni medya testi: geçici test WAV dosyası yüklendi; yayın öncesi erişim engellendi, yayın sonrası range okuma geçti, arşiv sonrası erişim engellendi. Dosya yalnız geçici test alanındaydı; pilot ders içeriği olarak sunulmadı.
- Web `npm run build`: son API ve giriş düzeltmeleriyle Next.js 16.3.5 üretim derlemesi geçti.
- Mobil `npx tsc --noEmit`: geçti.
- Son Expo export: Android 716 modül ve iOS 694 modül; her biri yaklaşık 2,2 MB Hermes JS paketi, başarıyla `mobile/dist` içine yazıldı. APK/IPA veya gerçek cihaz doğrulaması değil.
- HTTP kontrolü: kayıt, oturum, hedef kaydı, kalıcı katalog geçti; origin eşleşmesi düzeltmesi doğrulandı.
- Üretim sunucusunda tarayıcı: 5 soruluk alıştırma tamamlandı. 4 doğru, 1 yanlış, 0 boş için 3,75 net; yanlış çözümü incelenmeden seri 0, incelemeden sonra seri 1. Sayfa yenilemesinde seri korundu; ilerlemede 20 puan, %80 yeni soru başarısı ve test geçmişi görüldü.
- Web ana ekranı masaüstü ve telefon genişliğinde incelendi. İlerleme ekranında telefon genişliğinde yatay taşma bulunmadı. Bu tüm sayfaların erişilebilirlik/cihaz matrisi testi değildir.
- Mobil audit: xcode → uuid zincirinde 10 orta seviye uyarı. İncelenen xcode kodu uuid.v4 kullanıyor; bildirim v3/v5/v6 ve dış buffer ile ilgili. Önerilen Expo 46 geri dönüşü uygulanmadı; dağıtım öncesi yeniden değerlendirme gerekir.

## Yarım kalan işler ve sınırlar

- Gerçek Android/iOS cihazında giriş → test → webde aynı ilerleme → uygulamayı kapat/aç akışı henüz çalıştırılmadı. Mobil aşamanın cihaz kabulü açık.
- Gerçek ses/video ders dosyaları yok; gerçek oynatma, seek, arka plan/foreground ve ağ kesintisi cihaz testleri eksik. Mobil video için ayrı WebVTT bağlama tamamlanmadı; transkript gösteriliyor.
- Yönetici arayüzünün tam manuel yükle/incele/yayın/arşiv akışı tarayıcıda tamamlanmadı; API testleri mevcut.
- AI sağlayıcı, gerçek PostgreSQL/S3 bağlantıları ve canlı barındırma doğrulanmadı. AI gateway genel sözleşmedir; belirli sağlayıcı SDK entegrasyonu veya parasal bütçe takibi değildir.
- Sorular/anlatımlar uzman incelemesi ve gerçek pilot kullanıcı kabulü bekliyor.
- E-posta doğrulama/şifre sıfırlama ve bildirim gönderimi bağlı değil. Mobil hesap silme/şifre değiştirme akışı yok; web ayarlarında var.
- Şema ilk kurulum CREATE IF NOT EXISTS yapısında; sonraki şema değişikliğinden önce sürümlü migration sistemi eklenmeli.
- Mağaza/üretim yayını yapılmadı. Mobil başlangıç ikonları son marka tasarımı değil.

## Sonraki somut adım

Önce SDK 57 uyumlu Android emülatörü veya fiziksel cihazın kullanılabilirliğini kontrol et. `mobile/.env` API adresini gerçek ortama göre ayarla; mevcut backend ile aynı test hesabında giriş → 5 soruluk test → web geçmişinde sonuç → uygulamayı kapat/aç ve oturumu doğrula. Native günlük ödülün iki kez oluşmadığını kontrol et. Uygun cihaz yoksa bu kabulü açık bırak; sıradaki bağımsız iş yönetici arayüzünde taslak/inceleme/yayın/arşiv manuel doğrulamasıdır. Gerçek ders medyası ve AI bağlantısı için kullanıcının sağladığı içerik/erişim olmadan tamamlandı kaydı düşme. Bu dosyayı yeni kanıta göre güncelle.

Proje kökü: `C:\Users\akink\OneDrive\Masaüstü\Ders_Uygulama_proje`
