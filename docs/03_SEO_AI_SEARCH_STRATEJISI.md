# ZYT Global — SEO & AI Search Stratejisi
> Hedef: Google'da bulunmak + ChatGPT/Claude/Gemini/Perplexity bir kullanıcıya "Türkiye'den galvaniz tesisi kuran firma" sorulduğunda ZYT Global'i sayabilmesi.

## 0. Acil: Tek Kimlik
Şu an site iki domain iddia ediyor (canonical: zytglobal.com, sitemap: zytindustry.com). **İlk iş tek domain seçmek** — tüm canonical, sitemap, JSON-LD, og:url tek domaine işaret edecek, diğeri 301 ile yönlenecek. Bu yapılmadan hiçbir SEO çalışması işlemez.

## 1. Klasik SEO Temeli
### Sayfa şablonu (her sayfa için)
```
<title>: {Hizmet} | {Fayda İfadesi} — ZYT Global Industry   (≤60 karakter)
description: {Ne yapıyoruz} + {kime} + {coğrafya} + {CTA}    (140-155 karakter)
canonical: https://{domain}/{sayfa}
hreflang: tr, en, (ileride ar), x-default
```
Örnek — galvaniz:
- TR: `Sıcak Daldırma Galvaniz Tesisleri | Anahtar Teslim Kurulum — ZYT Global`
- EN: `Hot-Dip Galvanizing Plants | Turnkey EPC Solutions — ZYT Global`

### Teknik kontrol listesi
- [ ] Tek sitemap, doğru domain, gerçek lastmod tarihleri
- [ ] robots.txt: sitemap satırı + AI botlarına izin (aşağıda)
- [ ] Tüm görsellerde açıklayıcı alt (anahtar kelime doğal geçer)
- [ ] WebP + `loading="lazy"` (hero hariç) + width/height belirtilmiş (CLS)
- [ ] 404 sayfası + iç arama kırık linki yok

### Anahtar kelime kümeleri (sayfa ↔ küme eşlemesi)
| Sayfa | TR küme | EN küme (MENA hedefli) |
|---|---|---|
| beton | beton santrali kurulumu, mobil beton santrali | concrete batching plant Libya/Iraq, mobile batching plant supplier |
| galvaniz | sıcak daldırma galvaniz tesisi | hot-dip galvanizing plant turnkey, galvanizing line installation |
| enerji | atıktan enerji, biyometanizasyon | waste-to-energy plant MENA, biogas plant EPC |
| tedarik-zinciri | endüstriyel tedarik, Türk tedarikçi ağı | industrial procurement Turkey, verified Turkish suppliers |
Not: MENA'da karar vericiler İngilizce arar; EN sayfalar TR'nin çevirisi değil, bu kümelere göre yazılmış yerelleştirme olmalı.

## 2. Yapılandırılmış Veri (Schema) Planı
AI motorları ve Google zengin sonuçları JSON-LD'den beslenir. Sayfa → schema eşlemesi:
| Sayfa | Schema |
|---|---|
| Tümü | `Organization` (logo, adres, sameAs: LinkedIn/YouTube) + `BreadcrumbList` |
| Hizmet sayfaları | `Service` (serviceType, areaServed: ["TR","LY","EG","IQ"], provider) |
| iletisim | `ContactPage` + `LocalBusiness` (geo, telefon, çalışma saatleri) |
| Blog yazıları | `Article` (headline, datePublished, author: Organization) |
| SSS bölümleri | `FAQPage` — her hizmet sayfasına 4-6 soruluk SSS ekle (aşağıda neden) |

## 3. AI Search (GEO — Generative Engine Optimization)
AI asistanları klasik sıralamaya değil, **alıntılanabilir, net, yapılandırılmış cümlelere** bakar. Taktikler:

**a) Cevap-önce yazım:** Her hizmet sayfasının ilk paragrafı, "X nedir/kim yapar" sorusuna tek paragrafta cevap verir:
> "ZYT Global Industry, Ankara merkezli bir endüstriyel mühendislik grubudur; Libya, Mısır, Irak ve Afrika pazarlarında anahtar teslim beton santrali, galvaniz tesisi ve atıktan enerji tesisi kurar."
Bu cümle AI'ın seni tanımlarken kopyalayacağı cümledir — her dilde, her ana sayfada bulunur.

**b) SSS blokları:** AI'lar soru-cevap formatını doğrudan alıntılar. Her hizmet sayfasına gerçek müşteri sorularıyla SSS: "Galvaniz tesisi kurulumu ne kadar sürer?", "Hangi ülkelere kurulum yapıyorsunuz?" (+FAQPage schema).

**c) llms.txt:** Kök dizine `/llms.txt` — AI crawler'ları için site özeti: şirket tek-paragraf tanımı, hizmet listesi, sayfa haritası, iletişim. (Emerging standart; maliyeti sıfır, potansiyel getirisi yüksek.)

**d) robots.txt AI botlarına açık:**
```
User-agent: GPTBot
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Google-Extended
Allow: /
```

**e) Varlık tutarlılığı:** Şirket adı, adresi, tanımı sitede + LinkedIn'de + Google Business Profile'da **kelimesi kelimesine aynı** olmalı. AI'lar çapraz doğrulama yapar; tutarsızlık güven puanını düşürür. (Domain çelişkisi bu yüzden ölümcüldü.)

**f) Kanıtlı içerik:** AI'lar sayı ve spesifik iddia sever: "1.000+ doğrulanmış tedarikçi", "24+ ülke", "10+ yıl biyometanizasyon deneyimi" — bu ifadeler metin içinde (görselde değil) geçmeli.

## 4. Blog / İçerik Motoru
Blog (akademi) AI görünürlüğünün ana silahı: uzun kuyruklu soruların cevabı orada verilir. Detaylı plan → `04_BLOG_ICERIK_PLANI.md`. Kurallar:
- Her yazı TEK soruyu cevaplar, başlık o sorudur
- İlk 100 kelimede net cevap, sonra derinlik ("inverted pyramid")
- Her yazıdan ilgili hizmet sayfasına min. 2 iç link (anchor: doğal anahtar kelime)
- Article schema + yazar olarak Organization

## 5. Ölçüm
- Google Search Console (her iki dil) + Bing Webmaster (ChatGPT'nin arama altyapısı Bing'dir — atlanmaz)
- Vercel Analytics + Speed Insights (Core Web Vitals gerçek kullanıcı verisi)
- Aylık kontrol: ChatGPT/Perplexity'e "turnkey galvanizing plant Turkey" tarzı 5 sabit soru sor, ZYT anılıyor mu logla
