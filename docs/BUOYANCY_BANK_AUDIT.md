# TYT Kaldırma Kuvveti · yerel soru bankası denetimi

15 Ekim 2026 · `feature/tyt-buoyancy-bank-135` · güncel `origin/main` (`968e821`). Yerel editoryal taslak; uzak ortamda varsayılan olarak kapalıdır.

135 soru, 9 × 15 test (3 Kolay, 3 Orta, 3 Zor), beş seçenek ve 64 SVG bağlandı. ZIP'teki 80 dosya `imports/buoyancy-question-bank/` altında özgün baytlarıyla korunuyor. Düzeltilmiş kopyalar `server/content/` ve `public/question-bank/buoyancy/` altında; özgün JSON ve çözümler değiştirilmedi. Önceki 20 soruluk banka arşiv düğmesinden açılır.

135 metin, seçenek kümesi, cevap ve çözüm kontrol edildi. 78 sayısal sonucun bağımsız hesabı testlerde; kalan kavramsal sorular kuvvet dengesi, özkütle, taşma, deney koşulları ve boyut analiziyle incelendi. 64 SVG ayrıca görsel olarak karşılaştırıldı. Kullanılan model: Fk = ρgVbatık; serbest yüzmede Fk = G; tavan ipinde T = G − Fk, taban ipinde T = Fk − G. Bu ilişkiler [OpenStax Arşimet İlkesi](https://openstax.org/books/college-physics-2e/pages/11-7-archimedes-principle) ve [MEB TYT Fizik özeti](https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/tyt-fizik/files/basic-html/page145.html) ile karşılaştırıldı. Aksi belirtilmedikçe g=10 N/kg, su=1 kg/L; hava kaldırması, direnç ve yüzey gerilmesi ihmal edilir.

## Kaynakta bulunan ve yerel taslakta düzeltilen metinler

Kimliklerin başında `buoyancy-` bulunur. Cevap harfleri değiştirilmedi.

| Soru | Sorun ve düzeltme |
|---|---|
| medium-02-q15 | Anahtarın tahtaya bağının sürmesi belirsizdi. Bütün bağların kesilmesi ve anahtarın tabanda durması belirtildi. |
| medium-03-q08 | Kapalı boşluğa su girişi çelişiyordu. Açma, havayı çıkarma, doldurma ve yeniden kapatma belirtildi. |
| hard-01-q09 | Tutulan cismin toplam net kuvveti belirsizdi. Dış destek kaldırılıp ilk hızsız bırakıldığı an ve iki g değeri açıklandı. |
| hard-02-q07 | Kapalı küreye su ekleme koşulu eksikti. Açma/kapatma, sabit dış hacim ve ihmal edilen hava kütlesi belirtildi. |
| hard-02-q11 | Özkütle hesabı için eşit batık hacim koşulu eksikti. İki sıvıda tam batma, tabana değmeme ve denge eklendi. |
| hard-02-q14 | Veriler standart su için 1,6 kg/L gerektiriyordu. Bilinmeyen sıvı K olarak adlandırıldı; çözüm uyumlu güncellendi. |
| hard-03-q04 | İki çeldirici aynı yükselme yargısını tekrarlıyordu. D seçeneği farklı gerekçeli, yanlış bir hacim iddiasına dönüştürüldü. |

## Çizim düzeltmeleri

| Sorular | Düzeltilen sorun |
|---|---|
| medium-02-q11 | Verilmeyen 0,5 L bilgisi/taşma çıkışı çıkarıldı; tamamen batırma ve el kuvveti çizildi. |
| medium-03-q04, medium-03-q10, hard-01-q14 | Derinlik, batık hacim ve batık yükseklik eksenleri ayrıldı; batık yüksekliğe karşı uygunsuz plato kaldırıldı. |
| easy-01-q11, easy-03-q07 | Tam batık cisimler kısmen batık çizilmişti; tam batırma gösterildi. |
| easy-03-q05, medium-01-q05 | Kısmi/yarım batma koşulu ve dinamometre bağlantısı düzeltildi. |
| medium-01-q14, hard-02-q09 | Tabana bağlı ip yerine öğrencinin aşağı el kuvveti gösterildi. |
| medium-02-q03, medium-02-q05, medium-02-q08, hard-01-q04 | Batması/yüzmesi belirtilen cisimlerin yanlış durumları ve önce/sonra düzenekleri düzeltildi. |
| medium-03-q01 | Cevabı ele veren son denge çizimi, serbest bırakılmadan önceki durumla değiştirildi. |
| hard-02-q07 | Çizimin su eklenmeden önceki başlangıç durumu olduğu açıklandı. |
| hard-03-q04 | Tekne yerine deney tüpü, iç bilye ve tabana bırakılan bilye çizildi. |

Toplam 7 metin ve 17 SVG düzeltmesi, 22 farklı soru kimliğini etkiliyor. Paketin README'sindeki 63 SVG ifadesi de gerçek 64 dosya sayısıyla uyuşmuyor. Her sorunun kaynak/taslak özeti, bağımsız cevap harfi ve düzeltme işareti `server/content/buoyancy-bank-audit.json` içinde kayıtlıdır. Düzeltmeler öğretmen/editör yayın incelemesine hazırdır; bu denetim uzman yayın onayı yerine geçmez.

## İlerleme ve yayın sınırı

Yeni testler mevcut `attempts` tablosunda ayrı `question-bank` modu, testId/questionId ve soru snapshot'ıyla saklanır. Cevaplar/çözümler sunucuda tutulur; çözümler test bitince açılır. Yanlış ve boşlar mevcut Yanlış Defteri'ne gider. Eski öğrenci kayıtları, notlar, günlük seri/puan ve önceki test akışı korunur. Yeni migration veya bankaya özgü seed gerekmez.

Staging bağlantısı farklı proje kimliği ve doğrulanan TLS ile salt okunur kontrol edildi: v1+v2, 14 tablo, 103 içerik; veri yazılmadı. Production, main ve gerçek öğrenci verileri değiştirilmedi. Yerel tarayıcı kabulü ayrı `.cache/buoyancy-question-bank/qa-data` PGlite alanında yapıldı.

Staging için kalan sıra: düzeltmelerin editoryal incelemesi → feature branch commit/push ve Draft PR → Vercel'de yalnız bu Preview dalına staging DB/Supabase/origin ayarları → güvenli proje eşleşmesi/TLS kontrolü → yalnız bu dalda `BUOYANCY_BANK_135_ENABLED=true` → staging kabul testi. Main merge veya production yayını bu çalışmanın kapsamında değildir.

## Staging kabulü · 15 Ekim 2026

Kullanıcının devam onayıyla commit/push, [Draft PR #6](https://github.com/akinkirimli23/exam-learning-platform/pull/6), dal kapsamlı Vercel ayarları ve staging kabulü tamamlandı. [Staging soru bankası](https://exam-learning-platform-git-feature-tyt-buoyanc-9bad77-akin-dido.vercel.app/konu/buoyancy/soru-bankasi) giriş sonrası 135 soruyu ve 9 testi açar. Uygulama kodu `9860b89`; ilk kabul deployment'ı `2KN2nQ4KASWF3cvVqQbBcxNGFqzs`, Preview/Ready.

Üç farklı seviyedeki testte 45 soru/çözüm, SVG, yenilemede devam, kalıcı sonuç, yanlış/boş defteri ve mobil büyütme doğrulandı. Test öncesi staging DB/Supabase proje eşleşmesi ve TLS kontrol edildi; yeni migration/seed yok. Geçici test öğrencisi ve bağlı kayıtlar temizlendi; başlangıçtaki 4 kullanıcı/5 oturum/103 içerik korundu. Production ve main aynı kaldı. Düzeltmelerin uzman yayın incelemesi ve production geçişi bu staging kabulünden ayrı açık adımlardır.
