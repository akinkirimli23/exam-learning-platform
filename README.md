# İvme

Türkçe, 18+ sınav hazırlık pilotu. İlk konu: Kaldırma Kuvveti. Web ve mobil aynı REST API ve hesapları kullanır. Mevcut durum ve sonraki iş: [DEVAM.md](DEVAM.md).

## Web

Node 22.19 veya uyumlu güncel LTS ile proje kökünde:

```powershell
npm ci
# Yalnız yeni/boş veritabanında:
npm run db:seed
npm run admin:create
npm run dev
```

Adres: http://localhost:3000. Mevcut pilot verileri hazırsa seed veya yönetici oluşturma gerekmiyor. Ekrandaki “Hesap oluştur” ile öğrenci hesabı açılabilir. Yönetici komutu rastgele şifre üretip yalnız yerel, git dışında bırakılan erişim dosyasına yazar; mevcut hesabı değiştirmez. Bu dosyayı paylaşmayın.

`.env.example` gerekli değişkenlerin şablonudur. `.env.local` yerel geliştirme için `APP_ORIGIN`, `DATA_DIR`, `DEMO_CONTENT` içerir. `tsx` kurulum komutları `.env.local` dosyasını kendiliğinden yüklemez; özel veri dizini veya PostgreSQL seçilecekse değişkenleri PowerShell oturumunda da tanımlayın.

Veri `data/database` içinde diske kalıcı PGlite olarak tutulur. Aynı veri dizinini iki süreçle açmayın. Üretimde `DATABASE_URL` ile PostgreSQL kullanın. Mevcut gömülü veriyi PostgreSQL'e otomatik taşıma henüz yok; aynı şema/adaptör desteği veri göçü yapıldığı anlamına gelmez. Şema şu an ilk kurulum içindir; sonraki şema değişikliklerinden önce sürümlü migration sistemi eklenmeli.

```powershell
npm run typecheck
npm test
npm run build
# Önce geliştirme sunucusunu durdurun:
npm start
```

## Mobil

Expo SDK 57, React Native 0.86.3, React 19.2.3. Native öğrenci ekranları web arayüzünden ayrı; veri sözleşmeleri `shared/contracts.ts` üzerinden ortaktır.

```powershell
cd mobile
npm ci
# .env.example dosyasını .env olarak kopyalayın ve API adresini düzenleyin.
npm start
npx tsc --noEmit
npx expo export --platform android --platform ios --output-dir dist
```

- Android emülatörü: `EXPO_PUBLIC_API_URL=http://10.0.2.2:3000`.
- Fiziksel cihaz: aynı Wi-Fi üzerinde bilgisayarın LAN IPv4 adresi ve port 3000. `localhost` telefonda bilgisayarınızı göstermez. Güvenlik duvarını kapatmayın; gerekli izinleri kontrollü yapılandırın.
- Gerçek dağıtımda HTTPS zorunludur. Public değişkenlere sağlayıcı anahtarı yazmayın. Oturum SecureStore'da saklanır; sunucuda oturum özeti tutulur.
- Android/iOS JS paketleri derlenebilir. Bu bir APK/IPA, EAS dağıtımı veya gerçek cihaz testi değildir. Expo Go SDK uyumluluğu veya development build ayrıca doğrulanmalı.
- Mobilde ayrı WebVTT dosyasını yerel video oynatıcıya bağlama tamamlanmadı; transkript gösterilir. Hesap silme ve şifre değiştirme web ayarlarında bulunur.
- Mobil web export hedeflenmiyor. Responsive web için Next.js kullanılır.

## İçerik ve gerçek erişimler

- 4 anlatım, 10 kart, 25 ayrı özgün demo sorusu. Alan uzmanı incelemesi tamamlanmadı.
- [Kaynak/kapsam notları](docs/SOURCES.md): 2026 YKS belgesi; 2027 kapsamı ve kesin TYT/AYT dağılımı doğrulanmış sayılmaz.
- Ses/video henüz sağlanmadı. Yönetici gerçek dosyayı yükleyip transkript, video için WebVTT ve lisans notuyla yayımlar. Dosya sınırı 32 MB.
- Dosyalar yerelde `data/media`, isteğe bağlı S3 uyumlu depolama. Sağlayıcı bağlantısı doğrulanmadı.
- [AI sözleşmesi](docs/AI.md): gerçek sağlayıcı erişimi yoksa özellik dürüstçe kullanılamaz görünür. Temel test akışı bağımsızdır.
- E-posta doğrulama/şifre sıfırlama, bildirim gönderimleri, ödeme, canlı barındırma ve mağaza yayını bağlı değil.

## Test yaklaşımı

`npm test`: API/iş kuralı testleri; erişim, cevap gizliliği, puanlama, sürüm sabitleme, idempotency, saat dilimi, seri koruma, yayın, cihaz oturumları arası veri paylaşımı, diski kapatıp açınca kalıcılık ve gerçek dosya yükleme/range akışı. Test medya dosyası geçici test alanında oluşturulur; öğrencilere sahte ders medyası olarak sunulmaz.

Bağımlılık notu: mobil npm audit, `xcode → uuid` zincirinden 10 orta seviye uyarı raporladı. Önerdiği Expo 46'ya geri dönüş uygulanmadı. İncelenen `xcode` kodu `uuid.v4()` kullanıyor; uyarı v3/v5/v6 ve dış buffer kullanımına ilişkin. Bu, tüm bağımlılıkların güvenlik incelemesinin tamamlandığı anlamına gelmez; dağıtım öncesi yeniden kontrol edilmeli.

Web: Next.js 16.3.5, React 19.3.0; PGlite 0.5.8. Kesin sürümler iki `package-lock.json` dosyasında sabitlenir. Proje kökü: `C:\Users\akink\OneDrive\Masaüstü\Ders_Uygulama_proje`.
