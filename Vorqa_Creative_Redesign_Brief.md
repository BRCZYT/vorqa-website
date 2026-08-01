# Vorqa Global — Yaratıcı Redesign Brief (Claude Code için)

## Bağlam
Bu site `website/` klasöründe, düz HTML + Tailwind CDN + vanilla JS ile yazılmış (framework yok). Sayfalar: `index.html`, `galvaniz.html`, `enerji.html`, `tedarik-zinciri.html` (ve muhtemelen beton/mühendislik sayfaları). Zaten preloader, grain doku, nav hover mikro-animasyonları ve dil (tr/en) sistemi var. Amaç bunu **tamamen değiştirmek değil**, mevcut altyapı üzerine daha yaratıcı, akıcı ve "wow" hissi veren bir katman eklemek.

## Korunacaklar (Marka Kiti — DOKUNMA)
- Renkler: navy `#0A2540`, mid `#051728`, blue `#2874B2`, steel `#5C8DB8`, graph `#3A4858`, mist `#E8EEF4`, orange `#E87722`
- Fontlar: Sora Variable (display), Manrope Variable (body), JetBrains Mono Variable (etiket/mono)
- Ton: koyu, mühendislik hissi veren, "§ 01 —" tarzı teknik numaralandırma, `//` prefix'li eyebrow etiketler
- Alt marka isimleri (Galva-Pro, Mi Makina, Vetter Tech) **hiçbir yerde görünmeyecek** — her şey Vorqa Global anlatısı

## Hedef His
Klasik/kurumsal "endüstriyel şirket sitesi" değil; scroll ettikçe hikaye anlatan, mühendislik hassasiyetini yansıtan ama modern bir dijital ajans/teknoloji şirketi gibi hissettiren bir deneyim. Referans: Linear, Vercel, Stripe'ın "teknik ama şık" estetiği + ağır sanayi/mühendislik motifleri (grid çizgileri, blueprint izleri, sayaçlar, teknik etiketler).

## Eklenecek Kütüphaneler (CDN, framework değişikliği yok)
```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.42/dist/lenis.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/split-type@0.3.4/umd/index.min.js"></script>
```
(Three.js/OGL sadece ana sayfa hero'suna, opsiyonel — aşağıda belirtildi.)

## Uygulanacak Değişiklikler

### 1. Scroll Deneyimi (tüm sayfalar)
- Lenis ile "smooth/inertia" scroll — sayfa artık ağırlıklı, akıcı hissetmeli, varsayılan tarayıcı scroll'undan belirgin şekilde farklı.
- GSAP ScrollTrigger ile her section'ın giriş animasyonu: fade + 24px'lik translateY, stagger ile kartlar/istatistikler tek tek belirsin (hepsi aynı anda değil).

### 2. Hero Bölümü (index.html)
- Başlık metni SplitType ile karaktere/kelimeye bölünüp scroll veya load'da sırayla belirsin.
- Arka planda ince, hareketli bir "blueprint grid" efekti: yavaş kayan ince çizgiler veya nokta matrisi (CSS/SVG animasyonu yeterli, WebGL şart değil). İstenirse OGL ile hafif bir parçacık/grid parallax eklenebilir ama performans önceliği: mobilde kapalı kalsın.
- Scroll ilerledikçe hero'daki büyük başlık hafif ölçeklenip arkaya gitsin (parallax depth hissi).

### 3. Sayı/İstatistik Kartları (30+ yıl, 1000+ tedarikçi, 24+ ülke vb.)
- Sayılar 0'dan hedef değere GSAP ile sayarak dolsun, viewport'a girince tetiklensin.

### 4. Bölümler Arası Geçiş
- Koyu bölümler arasındaki mevcut `box-shadow` glow çizgisini koru; üstüne, section değişiminde ince bir "sayfa kırılması" hissi için diagonal clip-path geçişi eklenebilir (opsiyonel, abartmadan).

### 5. Kartlar / Servis Blokları (Beton, Enerji, Galvaniz, Tedarik Zinciri kartları)
- Hover'da sadece renk değişimi değil: hafif 3D tilt (mouse pozisyonuna göre `transform: perspective() rotateX/rotateY`), kenarlıkta ince bir "tarama ışığı" (shimmer) efekti.

### 6. Sayfa Geçişleri (index → galvaniz/enerji/tedarik-zinciri)
- View Transitions API kullan (`document.startViewTransition`) — tarayıcı destekliyorsa link tıklamalarında yumuşak cross-fade/slide geçişi; desteklemiyorsa mevcut davranışa sorunsuz düşsün (progressive enhancement, JS hatası vermemeli).

### 7. Navigasyon
- Scroll yönüne göre nav'ı gizle/göster (aşağı scroll'da gizlen, yukarı scroll'da hemen geri gel) — mevcut `#nav.scrolled` mantığına ek olarak.
- Aktif section'a göre nav linkinde ince bir alt çizgi indikatörü kaysın.

### 8. Form (İletişim)
- Input focus'larında label'ın yukarı kayması + alt çizginin genişleyerek gelmesi gibi mikro-detaylar; submit sonrası başarı mesajı GSAP ile yumuşak geçsin.

### 9. Sayfaya Özgü Küçük Kimlikler
- Her alt sayfa (galvaniz/enerji/tedarik-zinciri) aynı sistemin parçası kalsın ama hero'daki ikon/motif farklı olsun (örn. enerji sayfasında ince bir "enerji akışı" çizgi animasyonu, galvaniz sayfasında metalik shimmer, tedarik zincirinde bağlantı noktaları/ağ animasyonu).

## Performans / Erişilebilirlik Kısıtları (mutlaka uygulanmalı)
- `prefers-reduced-motion` medya sorgusu kontrol edilsin, true ise tüm animasyonlar kapansın.
- Mobilde ağır efektler (parçacık, 3D tilt) tamamen kapatılsın, sadece fade/slide kalsın.
- Lighthouse performans skoru düşmemeli; GSAP/Lenis `defer` ile yüklensin.

## Çalışma Sırası (Claude Code'a önerilen adım adım talimat)
1. Önce `git checkout -b redesign/creative-refresh` ile ayrı branch aç.
2. Ana sayfa (`index.html`) üzerinde yukarıdaki 1-4. maddeleri uygula, tarayıcıda test et.
3. Kartlar ve nav (5, 7. maddeler) ekle, test et.
4. Sayfa geçişlerini (6. madde) ekle, tüm alt sayfalarda test et.
5. Diğer sayfalara (galvaniz, enerji, tedarik-zinciri) aynı sistemi uygula + sayfaya özgü küçük dokunuşları (9. madde) ekle.
6. `prefers-reduced-motion` ve mobil kontrolünü en son genel bir geçişle tüm sayfalara uygula.
7. Her adımdan sonra local'de tarayıcıda görsel kontrol yap, sorun yoksa commit at.
8. Tüm sayfalar tamamlanınca `main`'e merge et, Vercel otomatik deploy edecek.
