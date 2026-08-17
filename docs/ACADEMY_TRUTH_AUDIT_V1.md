# VORQA Academy Truth Audit V1

Amaç: SEO/AI görünürlüğünü artırırken VORQA'nın gerçek deneyimi, mühendislik varsayımları ve kaynaklı sektör bilgisini birbirine karıştırmamak.

## P1 — yayın öncesi temizlenecek ifadeler

### Beton kapasite içeriği
- `Vorqa standard: 0.82` / `Vorqa standart: 0.82` ifadesi dokümante edilmiş şirket standardı değilse kaldırılmalı.
- Yerine: `örnek hesapta kullanılan mixer efficiency assumption: η = 0.82` gibi açık mühendislik varsayımı kullanılmalı ve aralık/üretici verisi varsa kaynaklanmalı.
- VORQA'nın Suudi Arabistan, Cezayir veya başka MENA projelerinde bu metodolojiyi uyguladığına ilişkin ifadeler ancak belgelenmiş proje deneyimi varsa kalmalı.

### Academy / Mira güven iddiaları
- `Every article is backed by verified data` mutlak iddiası, bütün yayınlar için belge zinciri yoksa yumuşatılmalı.
- Önerilen dil: `Articles are prepared using standards, manufacturer documentation and cited industry or academic sources where applicable.`
- `28+ Sources` sayacı otomatik ve doğrulanabilir bir kaynak envanterinden gelmiyorsa kaldırılmalı veya gerçek sayıya bağlanmalı.

## Yayın standardı
Her teknik içerik için minimum metadata:
- `datePublished`
- `dateModified`
- gerçek/kurumsal `publisher`
- kaynak/reference bölümü
- mühendislik varsayımları açık etiketi
- uygulama koşulları / limitler
- ilgili Knowledge Hub internal link
- RFQ CTA

## AI Search ilkesi
AI crawler'a özel yeni gerçek icat edilmez. `llms.txt`, schema ve sayfa metni birbirini doğrulamalıdır.

## Ticari claim gate
Aşağıdaki iddialar kanıtsız kullanılmaz:
- müşteri/proje sayısı
- doğrulanmış tedarikçi sayısı
- ülke/proje deneyimi
- teslim/teklif süresi garantisi
- tasarruf yüzdesi
- performans/ROI garantisi
