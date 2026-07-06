# ZYT Global — Yapılacaklar Listesi (Öncelik Sırasıyla)
> Kaynak: 4 Temmuz 2026 tam kod analizi (repo: BRCZYT/ZYT-website, canlı: zyt-website.vercel.app)
> Kural: Her faz bitmeden sonrakine geçme. Her madde tek commit/PR olarak yapılır ve tarayıcıda doğrulanır.

## FAZ 0 — Kritik Düzeltmeler (1 gün, sıfır tasarım riski)
| # | İş | Neden | Kabul kriteri |
|---|---|---|---|
| 0.1 | Domain kararı: `zytglobal.com` mu `zytindustry.com` mi? TEK domain seç | Canonical (zytglobal) ile sitemap (zytindustry) çelişiyor; Google iki kimlik görüyor | Tüm dosyalarda tek domain; sitemap + canonical + JSON-LD aynı |
| 0.2 | Favicon seti ekle (SVG + PNG 32/180 + manifest) | Konsol 404'ü; sekmede boş ikon güvensizlik verir | Konsolda 404 yok; sekmede logo |
| 0.3 | `og:image` (1200×630) + `twitter:card` tüm sayfalara | LinkedIn/WhatsApp paylaşımında boş önizleme = B2B'de ölüm | LinkedIn Post Inspector'da görselli kart |
| 0.4 | `node_modules/`, `temporary screenshots/`, `*.mjs` patch scriptlerini repodan çıkar (`.gitignore`) | 36MB gereksiz yük, profesyonellik | Repo < 5MB (görseller hariç) |
| 0.5 | Her sayfaya `hreflang` (tr/en) etiketleri | i18n var ama Google'a bildirilmemiş | Search Console'da hata yok |

## FAZ 1 — Görsel Vurucu Darbe ("wow" buradan gelir, 3-4 gün)
| # | İş | Neden |
|---|---|---|
| 1.1 | Hero H1'i büyüt: `clamp(2.8rem, 7vw, 6rem)`, iki satır, ikinci satırda turuncu vurgu kelime | Şu an 2.1rem — başlık değil altyazı. İlk 3 saniyedeki algı burada kazanılır |
| 1.2 | Turuncu vurgu sistemi: TÜM birincil CTA'lar turuncu (`#E87722`), hover'da koyulaşır; bölüm numaraları (§) turuncu; istatistik sayıları turuncu | Sayfada hiçbir şey "tıkla" demiyor; tek vurgu rengi dönüşümü artırır |
| 1.3 | Görsel envanteri: galvaniz, enerji, tedarik-zinciri, çelik için sayfa başına min. 4 profesyonel görsel (AI üretim promptları → 05_MARKA_GORSEL_DIL.md) | Endüstriyel B2B'de fotoğrafsız sayfa = güvensiz sayfa. En büyük eksik bu |
| 1.4 | İstatistik bölümü redesign: sayılar 4rem+, turuncu, mono font; altına ince açıklama; arkaya blueprint grid | Şirketin gurur anı şu an 4 gri rakam |
| 1.5 | Sosyal kanıt bandı: ana sayfaya sertifika rozetleri (belgelerimiz'den) + "24+ ülkede" harita çizimi | Güven unsurları var ama gömülü; ana akışa çıkar |
| 1.6 | §8: form mikro-animasyonları (mevcut brief'ten) | Yarım kalan iş |
| 1.7 | §9: sayfa-özel motifler (galvaniz shimmer, enerji akış çizgisi, tedarik ağ animasyonu) | Yarım kalan iş |

## FAZ 2 — SEO + AI Search (2-3 gün, paralel yürüyebilir)
| # | İş | Neden |
|---|---|---|
| 2.1 | JSON-LD genişlet: her hizmet sayfasına `Service`, iletişime `ContactPage`+`LocalBusiness`, blog yazılarına `Article`, tümüne `BreadcrumbList` | AI aramaları (ChatGPT/Perplexity/Gemini) yapılandırılmış veriyi doğrudan tüketir |
| 2.2 | Blog'u (ZYT-blog) akademi.html hub'ına resmen bağla; her yazıya meta + Article schema + iç link | İçerik var ama keşfedilemez durumda |
| 2.3 | Her sayfa için benzersiz `<title>` + `description` şablonu: "{Hizmet} | Anahtar Teslim {Sektör} Çözümleri — ZYT Global" | Şu an başlıklar jenerik |
| 2.4 | `llms.txt` + genişletilmiş `robots.txt` ekle | AI crawler'larına içerik haritası sunar (detay: 03_SEO belgesi) |
| 2.5 | Görsellere anlamlı `alt` (index'te 1 eksik) + `loading="lazy"` + WebP dönüşümü | Performans + erişilebilirlik + görsel arama |

## FAZ 3 — Next.js Taşınma (1-2 hafta, ayrı branch: `migration/nextjs`)
| # | İş | Neden |
|---|---|---|
| 3.1 | Next.js 15 + TypeScript + Tailwind (build'li, CDN değil) iskeleti; App Router | CDN Tailwind production'a uygun değil; component mimarisi sürdürülebilirlik getirir |
| 3.2 | Component kütüphanesi: `Hero`, `StatBand`, `ServiceCard`, `CTASection`, `SiteNav`, `SiteFooter`, `SectionHeading` | 11 sayfada kopyala-yapıştır kod var; tek kaynak ilkesi |
| 3.3 | i18n: `next-intl` ile TR/EN/AR (mevcut 66 anahtar taşınır), AR için RTL | Mevcut el yapımı sistemin resmileşmesi |
| 3.4 | Blog: MDX tabanlı, otomatik sitemap + RSS + Article schema | İçerik üretimini ölçekler |
| 3.5 | Görsel pipeline: `next/image` (otomatik WebP/AVIF, boyutlandırma) | Core Web Vitals (LCP) garantisi |
| 3.6 | Animasyonlar: GSAP/Lenis mantığı korunur ama component içine taşınır; `prefers-reduced-motion` merkezi | Mevcut yatırım çöpe gitmez |
| 3.7 | Vercel Analytics + Speed Insights aç | Core Web Vitals'ı gerçek kullanıcıdan ölç |

## FAZ 4 — Sürekli (aylık ritim)
- Ayda 2 blog yazısı (plan: 04_BLOG_ICERIK_PLANI.md)
- Çeyrekte bir Lighthouse + Search Console denetimi
- Yeni proje/referans fotoğraflarının siteye eklenmesi

## Yapılmayacaklar (bilinçli kararlar)
- Ağır WebGL/parçacık efektleri → performans ve "kurumsal ciddiyet" için hayır
- Hazır şablon/tema satın alma → mevcut özgün kimlik daha değerli
- Alt şirket isimlerinin herhangi bir yerde görünmesi → marka kuralı, istisnasız
