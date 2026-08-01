# ZYT — Konumlandırma, İçerik ve SEO/AEO Uygulama Spec'i
> Tek kaynak. 28 Temmuz 2026 bağımsız denetim kararlarını uygulamaya çevirir. Kim çalışırsa çalışsın (Claude Code, tasarımcı, içerik) buradaki konumlandırma ve iddia kurallarına uyar.

---

## 0. Bu belge neyi değiştiriyor — ÖNCE OKU

- **Marka KORUNUYOR:** ZYT (aile baş harfleri — gerçek, kişisel anlam). Rebrand yok.
- **Ama iki eski çerçeve İPTAL:**
  1. "Grup şirketi / çatı kuruluş" konumu → İPTAL. Yerine: **teknik tedarik & proje entegrasyon partneri.**
  2. `05_MARKA_GORSEL_DIL_REHBERI.md`'deki *"Tüm tarih ve uzmanlık ZYT'nin tekil hikayesidir"* kuralı → **DEĞİŞTİ.** (Aşağıda §6.3.)
- **05'in görsel sistemi (renk, tipografi, motif, foto/AI prompt standardı) AYNEN GEÇERLİ.** O belge görsel dilde hâlâ ana kaynak.
- **Bu belge, çakışan yerlerde `03` ve `05`'in konumlandırma/iddia bölümlerini geçersiz kılar.**

> **KURAL — 05'teki "MUTLAK KURAL"ın yeni hali:** Alt şirket *isimleri* (faz 1'de) yine hiçbir yerde geçmez. AMA onların sicili / sertifikası / tamamladığı proje, ZYT'nin *kendi* geçmişiymiş gibi sunulmaz. "İsim vermemek" ile "başkasının sicilini sahiplenmek" farklı şeylerdir. Birincisi normal, ikincisi yanıltıcı.

---

## 1. Stratejik Temel (kilitli kararlar)

| Konu | Karar |
|---|---|
| Kategori | **Teknik tedarik & proje entegrasyon partneri** (üretici / grup / EPC yüklenici DEĞİL) |
| Marka | **ZYT korunur** (Seçenek 2: ismi koru + konumlanma/metin/iddiaları yeniden kur) |
| Marka string'i | **"ZYT Industry"** (aşağıda §1.1) |
| Model ilerlemesi | Proje-bazlı ittifak/temsil → stratejik partner ağı → (bilanço/sicil oluşunca) ana yüklenici–alt yüklenici. **Grup/holding/konsorsiyum değil.** |
| Gelir modeli | Tedarik/koordinasyon + **şeffaflık** (şeffaf koordinasyon bedeli veya açıklanan marj). §3.2 |
| Birincil domain | **zytindustry.com** |
| İkincil domain | zytglobal.com → Faz 3'te 301 yönlendirme |
| Ön koşul | **Marka taraması (TÜRKPATENT/WIPO/EUIPO)** — domain/logoya para bağlamadan önce (§10) |

### 1.1 Marka string'i: "ZYT Industry"
Denetim, "Global" ve "Group" eklerinin değer katmadığını, yeni bir firmada jenerik şişirme gibi okunduğunu ve domain'le (`zytindustry.com`) çeliştiğini gösterdi. **Her yerde tek tutarlı string kullan: "ZYT Industry".** ("ZYT Global Industry" / "…Group" kullanma.) Tutarlılık AEO'nun temelidir — aynı varlık her yerde aynı adla anılmalı.
*(Tercihen "Global" kalsın istersen tek satır değişiklik; ama site/JSON-LD/llms.txt/sosyal HEPSİNDE aynı olmalı.)*

---

## 2. Vizyon & Misyon

> **Vizyon:** MENA ve Afrika'da endüstriyel yatırım yapan her alıcının, Türk üretim gücüne güvenle ve tek muhataptan eriştiği köprü olmak.

> **Misyon:** Doğrulanmış Türk uzman üretici ağımızı, MENA ve Afrika projeleri için; teknik kapsamı netleştiren, teklifleri konsolide eden ve kalite–termin–lojistik–dokümantasyon yükünü şeffafça üstlenen tek-muhatap bir tedarik ve koordinasyon hizmetinde birleştirmek.

---

## 3. Konumlandırma

### 3.1 Tek cümlelik konum (ProcessTürk + MT Royal + Hana karışımı)
> "Türk uzman üreticilerin mühendislik gücünü, MENA ve Afrika projeleri için, **şeffaf ve tek muhatap** bir teknik tedarik & koordinasyon modelinde birleştiren partner."

Birleşim: **ProcessTürk** (mühendislik + koordinasyon + turnkey icra) · **MT Royal** (Türk endüstriyel ürün → Orta Doğu altyapı) · **Hana** (alıcı-lehine şeffaflık ethos'u).

### 3.2 Çözülmesi ZORUNLU çelişki (gelir modeli)
**MT Royal tedarik-tarafıdır** (ürün satar, işlemden kazanır). **Hana alıcı-tarafıdır** ("komisyon yok, tedarikçi bağı yok"). İkisi aynı anda literal olarak olunamaz — ve bir yapay zeka siteyi okuduğunda bu çelişkiyi yakalar (tam da kaçınmak istediğimiz tutarsızlık).

> **KARAR:** Tedarik/koordinasyon modelini seç; Hana'nın şeffaflığını *ethos* olarak al. Nasıl kazandığını açıkça söyle (şeffaf koordinasyon bedeli / açıklanan marj). **"Tedarikçi bağımız yok" DEME.** Formül: *"Türk üreticileri temsil ediyoruz VE bunu şeffaf yapıyoruz."*

### 3.3 Neyiz / Ne değiliz (site bu ayrımı net vermeli)
| ✅ Biz buyuz | ❌ Bu değiliz |
|---|---|
| Teknik tedarik & koordinasyon partneri | Üretici / fabrika sahibi |
| Tek muhatap, çok-kalemli proje entegratörü | Grup şirketi / holding |
| Doğrulanmış Türk üretici ağına erişim | "In-house" üretim kapasitesi |
| Şeffaf, alıcı-lehine koordinasyon | Opak dış-ticaret/trading platformu |
| (İleride) seçili işlerde ana yüklenici | (Bugün) her riski üstlenen EPC yüklenici |

---

## 4. Bizi rakiplerden ayıran 5 şey (müşteriye bakan yüz)

Site ve Mira bu 5 sütunu tekrar tekrar vurgular:

1. **Dikey derinlik** — genel sourcing değil. Galvaniz / beton / enerji (WtE-biyogaz) / çelik dikeylerinde teknik dil + tedarikçi derinliği. Birkaç dikeyde yoğunlaşmak avantaj, dağınıklık değil.
2. **MENA/Afrika + Arapça köprü** — sadece TR/EN konuşan ihracatçılardan farklı olarak Arapça içerik + MENA ihale/kültür akıcılığı. Taklidi zor, gerçek hendek.
3. **Şeffaflık = güven** — opak platformların aksine rolünü ve nasıl kazandığını açıkça söyleyen partner. İlk kez Irak/Libya'ya fabrika getiren alıcı için "benim çıkarımı temsil edeceğine güvenmek" satın alma kararının ta kendisidir.
4. **Tek muhatap, çok-kalemli proje** — rakiplerin çoğu tek ürün/tek işlem. ZYT çok-kalemli yatırımı (beton+çelik+galvaniz+enerji) tek yönetilen pakette, tek sözleşmede toplar. Daha zor, daha değerli.
5. **Kurucunun doğrulanmış 1.000+ tedarikçi ağı + gerçek satınalma sicili** — abartısız, gerçek kredibilite motoru.

> **Not (dürüstlük):** ProcessTürk/MT Royal/Hana ile kazan-kazan iş birliği = çapraz-referans, ortak-teklif, kapasite paylaşımı. Ama bu bir **tedarik-tarafı** avantajıdır (erişim/iş birliği). Alıcının seni *seçme* nedeni 1–5'tir. Ağ avantajını "neden bizi seçmelisin"in yerine değil, arkasına koy.

---

## 5. Köken hikâyesi çerçevesi (aile baş harfleri — dürüst kullanım)

Kişisel anlam bir varlıktır; MENA'da kurucu-liderliğinde aile-adı taşıyan firma güven çağrıştırır.

- ✅ **DE:** "ZYT, [Kurucu] tarafından kuruldu; adı ailenin baş harflerini taşır."
- ❌ **DEME:** "30 yıllık aile firması" / "köklü aile mirası" / uzun kurumsal geçmiş iması. → Bu, şişirilmiş-geçmiş tuzağına geri döner.

Kural: **Kişisel/duygusal anlam EVET; uzun kurumsal sicil iddiası HAYIR.**

---

## 6. İçerik & Dürüstlük Kuralları

### 6.1 KALDIRILACAK iddialar (sabit liste — istisna yok)
| İddia | Neden kaldırılıyor |
|---|---|
| "30+ yıl deneyim" | Başka firmalara ait / doğrulanamadı |
| "24+ ülkede operasyon" | Kanıtsız |
| "850+ tamamlanan proje" | Kanıtsız (en yüksek güven riski) |
| "₺24,4 milyar proje değeri" | Kanıtsız (en yüksek itibar/hukuk riski) |
| "500+ tedarikçi" (çelişkili ikinci rakam) | 1.000+'a sabitle, tek rakam |
| "in-house production" | Fabrika yok — yanlış |
| ISO/CE/EN 1090 sertifika duvarı (ZYT'ninmiş gibi) | Sahip değil / doğrulanmadı — **en ciddi hukuki risk** |
| "en büyük", "lider", "dünya…" | Kanıtsız üstünlük |
| Enerji "1–50 MW", çelik "500+ ton/yıl" (ZYT kapasitesiymiş gibi) | Partner kapasitesi — ZYT'ninmiş gibi sunma |

### 6.2 KORUNACAK / GERÇEK varlıklar (ispat bunlardan gelir)
- **1.000+ doğrulanmış Türk tedarikçiden oluşan ağ** (tek doğrulanmış rakam).
- Kurucunun gerçek satınalma/proje tecrübesi (dürüstçe, kişisel çerçevede).
- Şeffaf tedarik/koordinasyon süreci.
- Kapasite *aralıkları* (ör. "MENA'da 240 m³/sa'e kadar beton santrali tedariki") — ağın teslim edebildiği tip, bir alıcıya vaat olarak.

### 6.3 Partner / referans gösterimi — FAZ 1 (isim vermeden, ama dürüst)
> **Kritik ayrım:** Partner ismi vermemek = normal ve dürüst (sourcing ajansları tedarikçi listesini paylaşmaz). Sorun hiçbir zaman "isim vermek" değildi — sorun **başkasının projesini/sertifikasını/sicilini ZYT'nin kendisiymiş gibi göstermekti.**

Faz 1 kuralları:
- ✅ **İsim verme** (partnerler gizli).
- ✅ Referansı **"ağımız aracılığıyla teslim edilen kapasite"** olarak, **kendi veya lisanslı görselle** göster.
- ❌ **45 hotlink fotoğrafı KALDIR** — isimsiz olsa bile telif + kimlik sızıntısı (kaynak koddan partner siteleri görünüyor). Görselleri ya izinle indir-ve-self-host et, ya kendi/lisanslı/AI görselle değiştir.
- ❌ Belirli bir müşteri projesini "biz yaptık" diye sahiplenme. Bunun yerine **temsili kapasite** çerçevesi kullan.
- İspat olarak §6.2'yi kullan.

### 6.4 Yasak dil (kendi marka rehberin de yasaklıyor)
`en büyük`, `lider`, `dünya devi`, `in-house`, kanıtsız `EPC`/`anahtar teslim` abartısı. "Anahtar teslim" kullanılacaksa **"anahtar teslim projelerde tedarik ve koordinasyon partneri"** biçiminde — sorumluluğu doğru tanımlayarak.

---

## 7. AEO / Yapay Zeka Tutarlılığı Spec'i

> Senin AEO sorunun bilgi *eksikliği* değil, **tutarsızlık** (500+/1.000+, 4 farklı e-posta, sahte vs gerçek). Yapay zeka bir varlığı anlamak için tüm yüzeyleri karşılaştırır; çelişki = güven puanı düşer. Çözüm: her şeyi tek kaynağa sabitle.

- **Tek NAP (Ad/Adres/Telefon) — her yüzeyde birebir aynı:** footer, iletişim sayfası, JSON-LD, Google Business Profile, sosyal profiller.
- **Tek e-posta.** Dört çelişkili adresi (`alex.demir@zyt.industry`, `info@zytglobal.com`, `email@company.com`, `email@sirket.com`) sil. Öneri: `info@zytindustry.com` + `purchasing@zytindustry.com`.
- **Tek kategori cümlesi — her yerde aynı:** §3.1'deki konum cümlesi + §1.1'deki marka string'i. Site, JSON-LD, llms.txt, sosyal bio HEPSİNDE birebir.
- **Gerçek telefon/adres zorunlu.** `+90 312 000 00 00` ve "Ankara, Türkiye" (sokaksız) yetersiz. Aşağıdaki placeholder'lar **launch'tan önce gerçek, doğrulanabilir değerlerle** doldurulacak.

> **KURAL — Claude Code'a:** Aşağıdaki `[KÖŞELİ PARANTEZ]` alanları ASLA uydurulmaz. Burcu gerçek değerleri verene kadar placeholder kalır; placeholder'la yayına alınmaz.

### 7.1 llms.txt (kök dizine: `/llms.txt`)
```markdown
# ZYT Industry

> Türkiye (Ankara) merkezli teknik tedarik ve endüstriyel proje koordinasyon
> partneri. Türk uzman üreticilerin mühendislik gücünü, MENA ve Afrika
> projeleri için tek muhatap altında birleştirir.

## Ne yapıyoruz
- Endüstriyel ekipman ve tesisler için teknik tedarik ve tedarikçi koordinasyonu
- Çok-kalemli projelerin tek sözleşme / tek muhatap altında konsolidasyonu
- Kalite, termin, lojistik, gümrük ve dokümantasyon yönetimi
- Dikeyler: beton santralleri, sıcak daldırma galvaniz, atıktan enerji/biyogaz,
  çelik konstrüksiyon ve mekanik imalat, tedarik zinciri yönetimi

## Kimiz
- Kurucu: [KURUCU AD — doldurulacak]
- 1.000+ doğrulanmış Türk tedarikçiden oluşan ağ
- Hedef pazarlar: Libya, Mısır, Irak, Körfez (MENA) ve Afrika
- Diller: Türkçe, İngilizce, Arapça

## İletişim
- Adres: [GERÇEK AÇIK ADRES — doldurulacak]
- Telefon: [GERÇEK TELEFON — doldurulacak]
- E-posta: info@zytindustry.com
- Web: https://www.zytindustry.com
```

---

## 8. SEO Teknik Spec (uygulamaya hazır)

### 8.1 URL yapısı + hreflang (EN KRİTİK)
**Sorun:** Şu an üç dil (tr/en/ar) aynı URL'de JS ile değişiyor → EN/AR indekslenemiyor → MENA'da görünmezsin. Ayrıca hreflang'ler aynı URL'e işaret ediyor (geçersiz).

**Çözüm — her dil kendi URL'inde:**
```
/tr/        /tr/galvaniz/        /tr/beton/        ...
/en/        /en/galvanizing/     /en/concrete/     ...
/ar/        /ar/galvanizing/     /ar/concrete/     ...
```
Her sayfa **kendi dil URL'ine canonical** verir ve tam hreflang seti taşır. `x-default` → İngilizce (MENA B2B için uluslararası varsayılan). Örnek (galvaniz sayfası, `<head>`):
```html
<link rel="canonical" href="https://www.zytindustry.com/en/galvanizing/" />
<link rel="alternate" hreflang="tr" href="https://www.zytindustry.com/tr/galvaniz/" />
<link rel="alternate" hreflang="en" href="https://www.zytindustry.com/en/galvanizing/" />
<link rel="alternate" hreflang="ar" href="https://www.zytindustry.com/ar/galvanizing/" />
<link rel="alternate" hreflang="x-default" href="https://www.zytindustry.com/en/galvanizing/" />
```
> Statik HTML olduğu için pratik yol: her dilin sayfalarını ayrı klasörde üret (aynı şablon, çevrilmiş içerik). Dil değiştirici, JS ile içeriği değiştirmek yerine karşılık gelen dil URL'ine link verir.

### 8.2 robots.txt (kök dizine)
```
User-agent: *
Allow: /

# AI arama botları
User-agent: GPTBot
Allow: /
User-agent: OAI-SearchBot
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: Google-Extended
Allow: /

Sitemap: https://www.zytindustry.com/sitemap.xml
```

### 8.3 JSON-LD (sayfa başına)
| Sayfa | Şema |
|---|---|
| Ana sayfa | `Organization` + `WebSite` (potansiyel `SearchAction`) |
| İletişim | `LocalBusiness`* + `ContactPage` |
| Her çözüm alanı (galvaniz/beton/enerji/çelik/tedarik) | `Service` + `BreadcrumbList` |
| Hakkımızda | `AboutPage` + `BreadcrumbList` |
| Blog yazısı | `Article` (author, datePublished, publisher) + `BreadcrumbList` |
| SSS bölümü olan sayfalar | `FAQPage` |
| Tüm iç sayfalar | `BreadcrumbList` |

*`LocalBusiness` yalnızca **gerçek, doğrulanabilir açık adres** girilince kullanılır (aksi halde `Organization` ile sınırlı kal). `Organization` içindeki `name` = "ZYT Industry", `url`, `logo`, `email`, `address` (PostalAddress, gerçek), `areaServed` (MENA/Afrika), `sameAs` (sosyal profiller — açılınca).

### 8.4 `<title>` + meta description deseni
Desen: **`{Birincil anahtar kelime} — {Fayda/Coğrafya} | ZYT Industry`**. Alt-marka adıyla başlama.
| Sayfa | TR title | EN title |
|---|---|---|
| Ana sayfa | `Türk Endüstriyel Üretici Tedarik Partneri — MENA & Afrika \| ZYT Industry` | `Turkish Industrial Sourcing Partner for MENA & Africa \| ZYT Industry` |
| Galvaniz | `Sıcak Daldırma Galvaniz Tesisi Tedariki — Türkiye \| ZYT Industry` | `Hot-Dip Galvanizing Plant Supplier — Turkey to MENA \| ZYT Industry` |
| Beton | `Beton Santrali Tedarik & Kurulum — Türkiye \| ZYT Industry` | `Concrete Batching Plant Supplier — Turkey to MENA \| ZYT Industry` |
| Enerji | `Atıktan Enerji & Biyogaz Tesisi Tedariki \| ZYT Industry` | `Waste-to-Energy & Biogas Plant Sourcing — MENA \| ZYT Industry` |
| Çelik | `Çelik Konstrüksiyon & Mekanik İmalat Tedariki \| ZYT Industry` | `Steel Fabrication Supplier — Turkey \| ZYT Industry` |
| Tedarik | `Endüstriyel Tedarik & Proje Koordinasyonu — Türkiye \| ZYT Industry` | `Industrial Procurement Partner — Turkey & MENA \| ZYT Industry` |

Meta description: 150–160 karakter, değer + coğrafya + eylem. Her sayfa ve her dil için ayrı.

### 8.5 Görseller
- **Hotlink YOK** — tüm görseller self-host.
- **WebP, kalite 80** (05'teki standart).
- Her `<img>`'e **`width` + `height`** (CLS'i öldürür) + anlamlı `alt` (partner adı içermez).
- Hero 21:9, kart 4:3, og:image 1200×630.

### 8.6 Sitemap / canonical
- Sitemap `/` biçimini listeler (`/index.html` değil) — canonical ile hizalı.
- Dil URL yapısı gelince sitemap her dil sürümünü ayrı listeler; `hreflang` sitemap'te de verilebilir.

### 8.7 Anahtar kelime hedefleme (önce ulaşılabilir uzun-kuyruk)
| Dikey | Head (zor — sonra) | Uzun-kuyruk (öncelik — dönüşüme yakın) |
|---|---|---|
| Galvaniz | hot-dip galvanizing plant | galvanizing plant supplier Iraq / Libya |
| Beton | concrete batching plant | concrete batching plant supplier Libya / Egypt |
| Enerji | waste to energy plant | biogas plant supplier MENA |
| Çelik | steel fabrication Turkey | steel structure supplier Iraq |
| Tedarik | industrial sourcing Turkey | technical procurement partner MENA · Turkish manufacturers for Africa |

Blog E-E-A-T: Mira "ses" olarak kalabilir; ama zamanla gerçek, adı belli bir uzman imzası/incelemesi eklenirse otorite artar.

---

## 9. Yeni sayfa yapısı (bilgi mimarisi)

1. **Ana sayfa** — tek net cümle (kategori) + 5 differentiator + hizmet verilen dikeyler.
2. **Nasıl çalışırız** — tedarik/koordinasyon süreci, adım adım (tek muhatap vaadi burada somutlaşır).
3. **Çözüm alanları (capabilities)** — beton / galvaniz / enerji / çelik / tedarik. Her biri `Service` şema. ("ZYT Beton" gibi sahte "şirket" değil; "Beton Santrali Tedarik & Kurulum Koordinasyonu" gibi hizmet.)
4. **Tedarikçi ağımız & şeffaf model** — 1.000+ ağ, şeffaflık ethos'u (partner ismi yok).
5. **Referanslar** — yalnız doğrulanmış + izinli; "ağımız aracılığıyla teslim" çerçevesi; kendi/lisanslı görsel.
6. **Kurucu & tecrübe** — dürüst kişisel sicil + aile-adı köken hikâyesi (§5).
7. **İçerik / Akademi** (blog).
8. **İletişim** — gerçek NAP + tek e-posta.

> Ana sayfadaki "0X — Şirket" rozetleri kaldırılır; sahte çok-şirketli grup izlenimi vermez.

---

## 10. Sıralı uygulama planı

1. **Marka taraması (Gün 1–3, her şeyden önce).** Bir marka vekiliyle TÜRKPATENT + WIPO Global Brand DB + EUIPO'da ilgili Nice sınıflarında (**6, 7, 37, 40, 42**) "ZYT" (kelime + logo) taranır. Ucuz, hızlı, kesin. → *Çünkü tam senin sektörlerinde çakışmalar var (Çinli ZYT çelik/enerji, ZYT Petroleum, ZYT otomotiv) ve Türkiye ilk-başvuran ülkesidir.*
2. **Temizse (Gün 3–5):** `zytindustry.com`'u al + first-to-file olduğu için marka başvurusunu vekile paralelde başlat. `zytglobal.com` yedek/301.
3. **Tek kimlik sabitleme (Gün 3–5):** Gerçek NAP + tek e-posta tüm yüzeylere (§7).
4. **İçerik + SEO uygulaması (Gün 5–20):** Bu belge + `03`/`05` (görsel) ile Claude Code'da uygula: §6 içerik temizliği, §8 SEO seti, §9 yeni IA, §7 AEO/llms.txt. İsim/domain artık kilitli olduğu için "gömme" sorunu yok.
5. **Doğrulama:** Google Search Console (her dil için ayrı özellik/URL yapısı), **Bing Webmaster** (ChatGPT arama altyapısı), Vercel Speed Insights. Aylık: 5 sabit sorguyu ChatGPT/Perplexity'e sorup markanın gerçek/tutarlı anıldığını logla.

---

## 11. Doğrulanamayan / bekleyen noktalar
- ❔ "ZYT" markasının ilgili sınıflarda tescil durumu → **marka vekili taraması** (Adım 1).
- ❔ `zytindustry.com` canlı müsaitliği → registrar'da doğrula.
- 📄 Galva-Pro / Mi Makina / Vetter ile referans-foto-sertifika kullanım izinleri → yazılı hale getir (faz 1'de isim gizli olsa da görsel kullanım izni ayrı bir hukuki konu).
- 🟡 Gelir modeli kesin seçimi (§3.2) → şeffaf koordinasyon bedeli mi, açıklanan marj mı?
- `[…]` placeholder'lar (NAP, kurucu adı) → gerçek değerlerle doldurulacak.

---

*Bu belge 28 Temmuz 2026 bağımsız denetiminin operasyonel çıktısıdır. Görsel dil için `05_MARKA_GORSEL_DIL_REHBERI.md` geçerlidir; konumlandırma ve iddia konularında çakışma olursa bu belge esas alınır. Marka tescili için marka vekili, sözleşme yapıları için hukuk müşaviri gereklidir.*
