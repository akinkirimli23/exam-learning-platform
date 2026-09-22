# Vercel ilk test sürümü hazırlığı

Bu belge dağıtım komutu değildir. GitHub `main` dalı Vercel'e bağlanmadan önce aşağıdaki ayarlar tamamlanmalıdır. Hiçbir secret değeri repoya veya bu belgeye yazılmamalıdır.

## Uygulama yapısı

- Web ve API aynı Next.js uygulamasındadır. `/api/[...path]` Route Handler, Node.js runtime'da istek anında çalışır; ayrı bir backend adresi gerekmez.
- Kullanıcılar, parolaların özetleri, oturum tokenlarının özetleri ve ilerleme PostgreSQL tablolarındadır. Oturumlar süreç belleğine bağlı değildir. HTTPS isteklerinde oturum çerezi `HttpOnly`, `Secure` ve `SameSite=Lax` olarak üretilir.
- `DATABASE_URL` boşsa PGlite `data/database` altında yerel disk kullanır. Vercel Function dosya sistemi kalıcı veritabanı için uygun değildir. Vercel'de kalıcı, TLS kullanan PostgreSQL bağlantısı zorunludur. Sunucusuz trafik için sağlayıcının transaction pooler bağlantısını kullanın; mevcut `pg` havuzu her sıcak işlev örneğinde en fazla 8 bağlantı açabilir. İlk testte bağlantı sayısını izleyin; trafik artmadan önce havuz boyutunu ve yaşam döngüsünü sağlayıcının sınırlarına göre ayarlayın.
- Şema ilk bağlantıda `CREATE IF NOT EXISTS` ile açılır. Bu yalnız ilk kurulum için yeterlidir; sürümlü migration sistemi henüz yoktur. Boş veritabanına içerik otomatik eklenmez. `npm run db:seed` komutunu yalnız yeni/boş uzak veritabanı için, `DATABASE_URL` güvenli bir yerel süreç ortamında tanımlanmışken bir kez çalıştırın. Var olan yerel PGlite verisi otomatik aktarılmaz.

## Vercel environment variable listesi

Değerleri yalnız Vercel Environment Variables alanında tanımlayın. İlk test `main` üzerinden Production ortamında yapılacaksa Production kapsamını seçin. Ayrı Preview dağıtımları için Preview kapsamına ayrı veritabanı ve uygun `APP_ORIGIN` gerekir.

| Ad | İlk testte | Amaç |
| --- | --- | --- |
| `DATABASE_URL` | Zorunlu | Kalıcı PostgreSQL; sunucusuz kullanıma uygun, TLS'li bağlantı. |
| `APP_ORIGIN` | Zorunlu | Tarayıcı yazma istekleri için tam `https://` origin; sonuna `/` koymayın. |
| `DEMO_CONTENT` | Mevcut demo pilotunda zorunlu: `true` | Aksi halde demo katalog ve soru içeriği üretimde gizlenir. Uzman onaylı gerçek içerik yayımlandığında yeniden değerlendirin. |
| `SUPABASE_URL` | Private ders medyası için zorunlu | Supabase proje URL'si; yalnız sunucu tarafında kullanılır. |
| `SUPABASE_SERVICE_ROLE_KEY` | Private ders medyası için zorunlu | Private Storage için sunucu tarafı imzalama yetkisi. `NEXT_PUBLIC_` öneki kullanmayın. |
| `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` | Yönetici medya yükleme/okuma kullanılacaksa birlikte gerekli | Ayrı yönetici medya akışının kalıcı nesne depolaması. |
| `S3_ENDPOINT` | AWS S3 dışındaki S3 uyumlu sağlayıcıda gerekli | Nesne depolama endpoint'i. |
| `AI_ENDPOINT`, `AI_API_KEY`, `AI_MODEL` | İsteğe bağlı, üçü birlikte | AI özelliği; üçü yoksa kullanılamaz görünür. |
| `AI_DAILY_LIMIT`, `AI_DAILY_TOKEN_LIMIT` | İsteğe bağlı | AI kullanım sınırları; kodda varsayılanları vardır. |
| `DATA_DIR` | Vercel'de kullanılmaz | Yalnız yerel PGlite ve yerel medya dizini. |

Eski `NEXT_PUBLIC_BUOYANCY_VIDEO_URL`, `NEXT_PUBLIC_BUOYANCY_VIDEO_THUMBNAIL_URL`, `NEXT_PUBLIC_BUOYANCY_SLIDES_URL` ve `NEXT_PUBLIC_BUOYANCY_INFOGRAPHIC_URL` değişkenleri artık kod tarafından okunmaz. Vercel'de eklemeyin; önceden tanımlandılarsa temizlenebilirler. Mobil uygulamadaki `EXPO_PUBLIC_API_URL`, Vercel web projesine ait değildir.

## Medya ve API sınırları

- Kaldırma Kuvveti video, PDF ve infografik için istemci yalnız `mediaId` gönderir. Kimliği doğrulanan `/api/learning-media/:mediaId` çağrısı sunucu registry'sindeki private Supabase nesnesi için 3600 saniyelik signed URL üretir. Dosya doğrudan Supabase'den indirilir; Vercel Function üzerinden video/PDF taşınmaz. Supabase bucket private kalmalı, üç nesne mevcut olmalı ve service role anahtarı yalnız sunucu ortamında tutulmalıdır.
- Yönetici `/api/admin/media` yolu farklıdır: S3 ayarlanmazsa yerel diske yazmaya çalışır. Vercel'de bu yolu kullanmayın. S3 ayarlansa bile mevcut kod en çok 32 MB dosya kabul ederken Vercel Function istek veya yanıt gövdesi sınırı 4,5 MB'dır. Daha büyük yönetici medyası için tarayıcıdan depolamaya kısa ömürlü imzalı doğrudan yükleme ve doğrudan okuma akışı uygulanmalıdır; bu geliştirme henüz yapılmadı.
- `APP_ORIGIN` tek bir origin ile karşılaştırılır. Vercel Preview ve Production URL'leri farklıysa her ortamın değeri kendi URL'si olmalıdır. API yanıtları `no-store` döner.
- Oturum tablosu paylaşılan PostgreSQL'de olduğunda yeni işlev örnekleri aynı oturumları doğrular. Ayrı bir session secret ya da session servisi gerekmez.

## Dağıtım öncesi kontrol

1. Boş uzak PostgreSQL'i hazırlayın ve bağlantının sunucusuz kullanıma uygun, TLS'li olduğundan emin olun. İlk kurulum için seed'i yalnız bu veritabanında çalıştırın; mevcut PGlite kullanıcılarını korumak gerekiyorsa önce ayrıca veri aktarımı planlayın.
2. Vercel değişkenlerini yukarıdaki kapsamda tanımlayın. `SUPABASE_SERVICE_ROLE_KEY` hiçbir public değişkende, kaynak dosyada veya derleme çıktısında bulunmamalıdır.
3. Production/Preview originini kesinleştirin. `APP_ORIGIN` ile dağıtımın gerçek tarayıcı adresi eşleşmelidir; aksi halde kayıt/giriş ve diğer yazma istekleri 403 döner.
4. Yönetici yükleme akışını bu ilk testte kullanmayın. Gerekiyorsa önce kalıcı depolama ve doğrudan yükleme değişikliğini tamamlayın.
5. Dağıtımdan sonra oturum açma, katalog, test tamamlama ve üç private medya türünü HTTPS üzerinde deneyin. Bu adım henüz yapılmadı.
