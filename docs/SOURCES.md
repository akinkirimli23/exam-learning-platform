# Resmî kaynak ve kapsam kontrolü

Kontrol: 21 Eylül 2026. İlk paket 2026 YKS referanslı eğitim pilotudur; geçmiş sınav yılına aittir. 2027 kılavuzu veya TYT/AYT konu bazlı kesin soru dağılımı doğrulandığı iddia edilmez.

1. [MEB TTKB — 2026 YKS konu ve kazanımları duyurusu](https://ttkb.meb.gov.tr/www/osym-tarafindan-2026-yilinda-gerceklestirilecek-quotyuksekogretim-kurumlari-sinavi-yksquotna-esas-derslere-ait-konu-ve-kazanimlar/icerik/831/tr), 26 Kasım 2025. [Doğrudan PDF](https://ttkb.meb.gov.tr/meb_iys_dosyalar/2025_11/26164023_2026_yks.pdf), PDF sayfa 163–164: 10.2 Basınç ve Kaldırma Kuvveti; 10.2.2.1 basınç kuvveti farkı, Arşimet ilkesi, yüzme/askıda kalma/batma; 10.2.2.2 günlük hayat problemlerine çözüm önerisi. Model verilir; matematiksel hesaplamalara girilmemesi belirtilir. Bu nedenle paket soruları kavramsal karşılaştırma ve günlük hayat üzerinden hazırlanır. Yerel alt kazanım kimlikleri uygulama etiketleridir; resmî kazanım numarası olarak sunulmaz.
2. [ÖSYM — 2026 YKS kılavuzu](https://osym.gov.tr/2026yuksekogretim-kurumlari-sinavi-yks-kilavuzu). [Doğrudan PDF](https://dokuman.osym.gov.tr/pdfdokuman/2026/YKS/basvuru_kilavuz06022026.pdf). Net hesabı: doğru sayısından yanlış sayısının dörtte biri düşülür; boşlar kesinti yaratmaz. Gerçek standart puan, OBP, yerleştirme puanı veya sıralama hesaplanmaz.
3. [MEB TYMM kademeli uygulama](https://tymm.meb.gov.tr/taslak-cerceve-planlari/ortaogretim): 2026–2027'de 11. sınıflara genişleme. Yeni programdaki farklı sınıf/kazanım konumları, 2026 sınav kapsamıyla otomatik birleştirilmez.
4. [MEB okul rehberi](https://omeremineakin.meb.k12.tr/meb_iys_dosyalar/38/10/967360/dosyalar/2025_12/01094620_2026yksogrencirehberi.pdf) TYT fizik listesinde basınç ve kaldırma kuvvetine yer verir. Bu bir rehberdir; ÖSYM'nin konu bazlı sınav garantisi değildir. Pilotun TYT yerleşimi bu ayrımla etiketlenir.

Sorular, anlatımlar, kartlar özgün demo metinlerdir. MEB kitap/soruları kopyalanmadı. Kaynaklara bağlantı verilmesi yeniden dağıtım lisansı anlamına gelmez. İndirilen belgeler `data/research` altında git dışında tutulur. Uzman fizik kontrolü, pedagojik inceleme ve içerik lisans onayı açık pilot gereksinimleridir.

## Teknik kaynaklar

- [Next.js kurulum](https://nextjs.org/docs/app/getting-started/installation): App Router, TypeScript, Node >=20.9; ortam Node 22.19.
- [PGlite başlangıç](https://pglite.dev/docs/): yerel dosya kalıcılığı ve PostgreSQL motoru. Tek süreçli yerel kullanım.
- [Expo proje kurulumu](https://docs.expo.dev/get-started/create-a-project/): resmi create-expo-app şablonu; mobil paket kilidi kurulumda oluşturulur.

Paketler resmî npm kayıt defterinden çözümlenip `package-lock.json` ile sabitlenir. Teslimde gerçekten kurulu sürümler README'ye yazılır.
