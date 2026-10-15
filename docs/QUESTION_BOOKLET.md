# Etkileşimli soru kitapçığı

Kaldırma Kuvveti bankasının dokuz testinin tamamı için etkin:
Kolay 1–3, Orta 1–3 ve Zor 1–3; toplam 135 soru ve 36 kitapçık sayfası.
`/konu/buoyancy/soru-bankasi` içindeki başlat/devam/sonuç akışını kullanır.
15 soru, sırası değişmeden 4 + 4 + 4 + 3 olarak dört sayfaya bölünür.
760 px ve üzerindeki tablet/bilgisayar ekranlarında iki sayfa veya tek sayfa
seçilebilir. 1360 px ve üzerinde başlangıç görünümü çift sayfadır; tabletlerde
tek sayfadır. Dar ekranlarda tek sayfa, 700 px altında tek sütun gösterilir.
Seçenekler daire içindeki A–E harflerine veya seçenek metnine tıklanarak
işaretlenir; seçili harf dolguyla vurgulanır ve her soruda tek yanıt saklanır.

- `components/question-booklet/`: okuyucu, sayfa, başlık, beş seçenek,
  diyagram ve kayıt denetleyicisi; stiller CSS Module kapsamındadır.
- `shared/question-booklet.ts`: sayfalama, görünüm ayarları ve eski soru
  snapshot'ları için çizim eşleştirme koruması.
- `shared/content/physics/buoyancy/question-booklets.ts`: mevcut kamuya açık
  test listesinden dokuz kayıt, zorluk/test başlıkları ve 01–09 fasikül numaraları.
- `shared/content/physics/buoyancy/question-booklet.json`: ortak sunum
  ayarları ve dokuz testin 64 SVG eşleştirmesi; cevap veya çözüm içermez.
- `public/question-bank/buoyancy/booklet/`: özgün cam/sıvı/tahta/küre/
  dinamometre/taşma kabı vektör çizimleri. Yeniden üretmek için
  `node scripts/render-buoyancy-booklet-diagrams.cjs` çalıştırılır.
- `scripts/lib/buoyancy-booklet-art.cjs`: cam yansımaları, eliptik sıvı
  yüzeyleri, ahşap/metal/buz dokuları, gölgeler ve hacimli SVG düzenekleri.
  `buoyancy-booklet-scenes.cjs` her sorunun düzenini ve verilenlerini açıkça eşler.
  Üretici bütün kaynak şekillerin kapsandığını denetler; kaynak bankayı değiştirmez.
- `components/banked-question-bank.tsx` ve `shared/topic-engine.ts`:
  test kimliği üzerinden isteğe bağlı kitapçık kaydı.
- `tests/question-booklet.test.tsx`: sayfalama, devam, boş yanıt,
  kilitleme, çözüm gizliliği ve eski çizimlere dönüş denetimleri.

Başka bir test için konu tanımına `questionBooklets` kaydı eklenir.
Yeni çizim isteğe bağlıdır; eşleştirme bulunmazsa sorunun mevcut SVG'si
kullanılır. Soru kimliği, metin imzası veya kaynak görseli farklıysa eski
snapshot kendi çizimini korur. Kaynak JSON, cevaplar ve özgün 64 SVG aynı kalır.

Yanıt/bitirme işlemleri mevcut sunucu API'siyle kaydedilir. Bekleyen yanıt
kaydedilmeden sayfa değiştirilemez; hata halinde aynı yanıt yeniden gönderilir.
Çözümler sunucudan yalnız tamamlanmış test için gelir. Yanlış Defteri,
auth, gezinme ve eski banka arşivi mevcut akışını sürdürür. Önceden kaydedilmiş
aktif denemeler ve sonuçlar da kendi soru snapshot'larıyla kitapçıkta açılır.
Yeni migration veya uzak seed gerekmez.

Soruların arasında veya son sayfada boş işlem/çözüm alanı yoktur.
Şekilsiz sorularda seçenekler metnin ardından gelir; sayfa yüksekliği içeriğe
göre oluşur. Açıklamalı çözümler test tamamlandığında açılmayı sürdürür.
64 çizim de renkli, üç boyut hissi veren vektörlerdir; ölçekli ölçüm amaçlı değildir.

Yerel kabul: 1440 px çift/tek sayfa ve 390 px mobil tarayıcı; yenilemede
devam, 15 çözüm, 13 doğru/1 yanlış/1 boş sonuç, yanlış defteri ve SVG
%150 büyütme/Escape geçti. Bu bir fiziksel telefon testi değildir.
Genişletme kabulü: 1440 px tarayıcıda dokuz testin tamamında dört sayfa,
135 benzersiz soru ve her soruda beş seçenek doğrulandı; yatay taşma yok.
390 px mobilde Zor Test 3'ün dört sayfası (4+4+4+3), yanıt kaydı ve
yenilemeden sonra devam kontrol edildi. Kaynak 64 SVG aynı kaldı.
230/230 otomatik test, typecheck ve Next.js production build geçti.
Yeni arayüz bu aşamada yereldedir; Vercel'e gönderilmemiştir.

Hacimli çizim güncellemesi: 64/64 SVG geçerli XML ve tarayıcıda yükleniyor;
1440 px'de 36 sayfa / 135 soru / 675 seçenek ve bütün yeni görsel yolları
doğrulandı. 390 px'de Kolay 1'in dört sayfası, %150 büyütme ve Escape geçti.
İşlem alanı ve yatay taşma yok; viewport geri alındı. Son kontroller:
230/230 test, typecheck, normal kullanıcı izinleriyle production build başarılı.
Kanıtlar `.cache/question-booklet/volumetric-*` altında.

15 Ekim yayın hazırlığı: 231/231 test, typecheck ve production build geçti.
768/1024 px tablette tek/çift sayfa, 1440 px bilgisayar ve 390 px mobil
kontrollerinde yatay taşma yok. A'dan B'ye değiştirilen tek yanıt yenilemeden
sonra korundu. Staging ve Production salt okunur auditleri şema v2 ve
`mistake_notes` uyumunu doğruladı; migration/seed gerekmez. Kullanıcı ana
siteye yayını açıkça istedi; Preview kabulünden sonra Production'a alınacak.
