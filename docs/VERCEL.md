# Vercel ilk test sürümü hazırlığı

Bu belge dağıtım komutu değildir. İlk deployment yapılmadan önce aşağıdaki ayarlar tamamlanmalıdır. Hiçbir secret değeri repoya veya bu belgeye yazılmamalıdır.

## Uygulama yapısı

- Web ve API aynı Next.js uygulamasındadır. `/api/[...path]` Route Handler, Node.js runtime'da istek anında çalışır; ayrı bir backend adresi gerekmez.
- Kullanıcılar, parolaların özetleri, oturum tokenlarının özetleri ve ilerleme PostgreSQL tablolarındadır. Oturumlar süreç belleğine bağlı değildir. HTTPS isteklerinde oturum çerezi `HttpOnly`, `Secure` ve `SameSite=Lax` olarak üretilir.
- `DATABASE_URL` boşsa PGlite `data/database` altında yerel disk kullanır. Vercel Function dosya sistemi kalıcı veritabanı için uygun değildir. Vercel'de kalıcı PostgreSQL zorunludur. Bu Supabase projesinin transaction pooler adresi 6543 portunu ve `sslmode=verify-full` kullanmalıdır. Uygulama uzak PostgreSQL'de TLS modu yoksa bağlantıyı reddeder; sağlanan CA sertifikasıyla sertifika zincirini ve sunucu adını doğrular. `pg` havuzu sıcak işlev örneği başına en fazla bir bağlantı açar.
- Uzak PostgreSQL şeması çalışma anında değiştirilmez. İlk kurulumda yalnız yerel migration sürecinde tanımlanan `MIGRATION_DATABASE_URL` olarak Supabase direct veya session pooler 5432 adresiyle `npm run db:migrate` çalıştırılır; bu değişken Vercel'de gerekmez. Script yalnız boş public şemaya v1 tablolarını ekler; kısmi/farklı şemada durur. Ardından `DATABASE_URL` 6543 adresiyle `npm run db:seed` çalıştırılır. Boş veritabanına içerik otomatik eklenmez. v1 sonrası sürümlü migration sistemi henüz yoktur; yerel PGlite verisi otomatik aktarılmaz.

## Vercel environment variable listesi

Değerleri yalnız Vercel Environment Variables alanında tanımlayın. İlk test `main` üzerinden Production ortamında yapılacaksa Production kapsamını seçin. Ayrı Preview dağıtımları için Preview kapsamına ayrı veritabanı ve uygun `APP_ORIGIN` gerekir.

| Ad | İlk testte | Amaç |
| --- | --- | --- |
| `DATABASE_URL` | Zorunlu | Supabase transaction pooler (6543) ve URL'de `sslmode=verify-full`. |
| `DATABASE_CA_CERT_B64` | Bu ilk yayın için zorunlu | Supabase Dashboard'dan indirilen CA PEM sertifikasının base64 kodlanmış içeriği; kod sertifikayı ve sunucu adını doğrular. |
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

1. Uzak veritabanı ilk kez hazırlanırken ortam değişkenleri süreçte yüklüyken `npm run db:audit` ile salt okunur biçimde incelenir. Yerel `.env.local` dosyasını kullanan eşdeğer komut `node --env-file=.env.local --import tsx scripts/db-audit.ts` şeklindedir. Bu proje için 6543/TLS bağlantısı, `sslmode=verify-full` ve Supabase CA PEM'in base64 içeriği olan `DATABASE_CA_CERT_B64` kullanılır. Boş ve doğru hedefe 5432 direct/session bağlantısıyla `npm run db:migrate`, sonra 6543 runtime bağlantısıyla `npm run db:seed` uygulanır. `npm run db:smoke` öğrenci/oturum/ilerleme akışını tek işlemde deneyip geri alır. Bu ilk hazırlık tamamlandı: v1 şeması ve 46 demo içerik kaydı mevcut; öğrenci/oturum verisi yok. Mevcut PGlite kullanıcılarını korumak gerekiyorsa ayrıca veri aktarımı planlayın.
2. Vercel değişkenlerini yukarıdaki kapsamda tanımlayın. `SUPABASE_SERVICE_ROLE_KEY` hiçbir public değişkende, kaynak dosyada veya derleme çıktısında bulunmamalıdır.
3. Vercel projesinin Domains ekranındaki kullanılacak sabit production adresini belirleyin. `APP_ORIGIN` değerini bu adresin tam `https://` origin'i olarak, sonunda `/` olmadan Production ortamına yazın. Preview kullanacaksanız kendi origin'i için ayrı ayar gerekir. Yanlış değer kayıt/giriş ve diğer yazma isteklerini 403 yapar; environment variable değişikliği mevcut dağıtıma uygulanmaz, yeni dağıtım gerekir.
4. İlk özel test sürümü için Vercel Security → Deployment Protection bölümünde Vercel Authentication kapsamını **All Deployments** olarak kontrol edin. Bu kapsam production alan adını da korur; Standard Protection production alan adını açık bırakabilir. Koruma, uygulamanın kendi öğrenci oturumunun yerini almaz.
5. Yönetici yükleme akışını bu ilk testte kullanmayın. Gerekiyorsa önce kalıcı depolama ve doğrudan yükleme değişikliğini tamamlayın.
6. Dağıtımdan sonra oturum açma, katalog, test tamamlama ve üç private medya türünü HTTPS üzerinde deneyin. Bu adım henüz yapılmadı.
