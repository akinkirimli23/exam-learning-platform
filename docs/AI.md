# AI sağlayıcı bağlantısı

AI isteğe bağlıdır. `server/ai.ts` şu an belirli bir sağlayıcı SDK'sı yerine HTTPS JSON gateway sözleşmesi kullanır. Bir sağlayıcının standart API URL'sini doğrudan koymak yeterli değildir; bu sözleşmeye çeviren sunucu adaptörü gerekir. Gerçek API erişimiyle denenmedi.

Sunucuda `AI_ENDPOINT`, `AI_API_KEY`, `AI_MODEL` tanımlanır. Anahtar istemciye aktarılmaz. `AI_DAILY_LIMIT` varsayılan 10; `AI_DAILY_TOKEN_LIMIT` varsayılan 12000. Bunlar kullanıcı başına günlük limitlerdir. İstek öncesi rezervasyon, başarısız çağrıda da korunarak sınırsız tekrar önlenir.

Gateway'e POST JSON:

```json
{
  "model": "configured-model",
  "intent": "hint",
  "message": "Öğrencinin yazdığı soru veya çözüm",
  "sources": [{"id":"published-content-version-id","title":"Bölüm başlığı","text":"Onaylı bölüm metni"}],
  "maxOutputTokens": 600,
  "instructions": "Öğretici davranış ve kaynak kullanım kuralları"
}
```

Yanıt:

```json
{
  "text": "Türkçe açıklama",
  "citations": ["published-content-version-id"],
  "usage": {"inputTokens": 300,"outputTokens": 120}
}
```

İsim, e-posta, kullanıcı kimliği, tüm test geçmişi gönderilmez. Öğrencinin serbest metninde kişisel veri yazmaması arayüzde hatırlatılır; otomatik PII temizleme mevcut değildir. İçerik olarak yalnız yayımlanmış, demo olmayan ders bölümleri gönderilir. Uydurma kaynak kimlikleri reddedilir. 20 saniye zaman aşımı veya sağlayıcı hatasında temel öğrenme akışı sürer. AI puan, sıra veya öğrenme kararı yazmaz.

Eksikler: sağlayıcıya özgü adaptör; gerçek uçtan uca test; bağlam/token uzunluğu tahminine göre kesin rezervasyon; model tarifesine göre parasal maliyet hesabı ve yönetim raporu. Mevcut tablo çağrı durumu ve gerçek bildirilen tokenları saklar; para cinsinden maliyet takibi tamamlandı sayılmaz. Demo paket, uzman onayı olmadan AI kaynak havuzuna açılmaz.
