# İvme — ürün ve geliştirme kaydı

Türkçe, 18+ pilot. Tek kapsam: 2026 YKS referanslı TYT fizik / Kaldırma Kuvveti. Arkadaş, sıralama, ödeme yok. Öğrenci başına insan koç yok. Ortak sürümlenmiş içerik; kişisel çalışma sırası, tekrar ve geri bildirim. NotebookLM yalnız editöryal üretim aracı; uygulama bağımlılığı değil.

## Mimari

Next.js + TypeScript web ve tek REST API. Expo/React Native aynı API'yi kullanır; DTO ve doğrulama kuralları `shared/` altında. Yerel pilot: dosyaya kalıcı PGlite (PostgreSQL motoru); gerçek PostgreSQL için `DATABASE_URL`. Medya yerelde disk, barındırmada S3 uyumlu nesne depolama. PGlite tek süreç içindir; çok süreçli/barındırılmış kullanım PostgreSQL gerektirir.

## Sıra ve kabul ölçütleri

1. Ortam, kaynak ve mimari doğrulaması.
2. Hesap, hedef, konu, test, açıklamalı sonuç, ilerleme, saat dilimine göre tekil günlük ödül.
3. Sunucu yetkili yönetim, sürümleme, yayımlama, gerçek medya yükleme.
4. Anahtar varsa gerçek AI; yoksa açık erişim durumu, çalışmaya devam eden temel akış.
5. Expo istemcisi, aynı hesap ve test geçmişi; gerçek cihaz doğrulaması ayrı raporlanır.
6. Otomatik sınır testleri, masaüstü/telefon QA ve pilot eksik listesi.

Sorular özgün demo içeriktir; alan uzmanı kontrolü tamamlanmadan yayıma hazır sayılmaz. Demo modu kapalı olduğunda demo içerik servis edilmez. Soru sürümleri, sınav cezası ve yanıtlar girişim başlangıcında sabitlenir. Deneme cevap anahtarı bitişten önce çıkmaz. Alıştırma geri bildirimi kilitlenen yanıtla birlikte verilir. Dinleme/izleme başarı kanıtı değildir. Günlük görev: yeterli sayıda özgün soru yanıtla ve bütün yanlış/boş çözümleri incele. Serinin ödülü işlem içinde ve kullanıcı/gün tekil anahtarıyla verilir.

Canlı yayın, mağaza dağıtımı, gerçek sağlayıcı ve uzman içerik onayı bu dosyada tamamlandı sayılmaz; kanıtları teslim kaydına yazılır.
