# ZYT Global — Tasarım Prensipleri
> Bu belge her tasarım kararının hakemi. Bir öneri bu prensiplerle çelişiyorsa yapılmaz.
> Referans estetik: Stripe'ın netliği + Linear'ın disiplini + ağır sanayi ciddiyeti. Apple sadeliği, sirk animasyonu değil.

## 1. Hiyerarşi: Her ekranda TEK kahraman
Her viewport'ta kullanıcının bakacağı tek bir şey olur — büyük başlık, tek görsel veya tek CTA. İki şey aynı anda bağırıyorsa ikisi de duyulmaz.
- Hero: H1 `clamp(2.8rem, 7vw, 6rem)`, ekranın en baskın öğesi
- H1 > H2 > gövde arasında en az 2× boyut farkı
- Bir bölümde en fazla 1 birincil CTA

## 2. Turuncu = eylem, mavi = kimlik
`#E87722` yalnızca kullanıcıdan eylem istenen yerlerde: birincil butonlar, aktif durumlar, kritik sayılar, bölüm numaraları. Dekorasyon için asla. Maviler (`#2874B2`, `#5C8DB8`) kimlik ve zemin işidir.
- Kural: Bir ekranda turuncu alan toplam %5'i geçmez — azlığı gücüdür
- CTA hover: `#C96315` (koyulaşır, parlamaz)

## 3. Boşluk lükstür, doldurma
Premium algı boşluktan gelir. Bölümler arası min. `py-24` (mobil `py-16`). Kart içi padding cimrileşmez. "Buraya bir şey daha sığar" hissi = bir şey çıkar.

## 4. Mühendislik dili görsel dile yansır
Teknik kimlik (`§ 01`, `//` etiketler, mono font, blueprint grid, ölçü çizgileri) markanın parmak izidir — korunur ve derinleştirilir. Ama süs değil bilgi taşıyıcı olarak: bölüm numarası navigasyona yardım eder, grid hizalamayı gösterir.

## 5. Animasyon: fizik var, sihir yok
Her hareket gerçek dünyada karşılığı olan bir şeyi taklit eder: ağırlık, atalet, sürtünme.
- Süreler: mikro 150-250ms, bölüm girişleri 400-700ms, asla 1s+
- Easing: `power2.out` / `power3.out` (GSAP), yaylanma (bounce/elastic) yok
- Bir öğe yalnızca BİR kez dikkat çeker (girişte); sürekli hareket eden hiçbir şey olmaz
- `prefers-reduced-motion` → tüm hareket kapanır, istisnasız
- Mobilde: tilt, parallax, ağır efekt kapalı; yalnız fade/slide

## 6. Fotoğraf > illüstrasyon > ikon > hiçbiri
Endüstriyel B2B'de güven gerçek tesisten gelir. Öncelik: gerçek proje fotoğrafı → foto-gerçekçi AI görsel (prompt standardı: 05 belgesi) → teknik çizim. Stok "gülümseyen takım" fotoğrafı yasak.
- Tüm görseller aynı ton ailesinde: koyu, soğuk mavi-gri zemin, turuncu vurgu detayı
- Oranlar: hero 21:9, kart 4:3, portre yok

## 7. Güven katmanı her sayfada
Her sayfada en az bir güven sinyali görünür kalır: sertifika rozeti, ülke sayısı, proje fotoğrafı, gerçek adres/telefon. İddia varsa kanıt yanındadır ("30+ yıl" → yanında zaman çizelgesi/proje).

## 8. Mobil öncelikli düşün, masaüstünde zenginleştir
Trafiğin önemli kısmı MENA'dan mobil gelecek. Her bileşen önce 390px genişlikte tasarlanır; masaüstü versiyonu onun zenginleşmiş hali.
- Dokunma hedefleri min. 44×44px
- Yatay scroll asla
- RTL (Arapça) her yeni bileşende baştan düşünülür: yönlü ikonlar, hizalamalar `start/end` ile yazılır (`left/right` değil)

## 9. Performans bir tasarım özelliğidir
- LCP < 2.5s, CLS < 0.1, INP < 200ms — pazarlıksız
- Görsel bütçesi: sayfa başına ilk yükleme < 1MB
- Font: yalnız kullanılan ağırlıklar (Sora 600/700, Manrope 400/500, JetBrains 400)
- Her yeni kütüphane şu soruyu geçmek zorunda: "Bunsuz yapamaz mıyız?"

## 10. Tutarlılık > yaratıcılık (bileşen düzeyinde)
Yaratıcılık sayfa düzeninde ve anlatıda; buton, kart, form, başlık gibi bileşenler sitenin her yerinde piksel piksel aynıdır. Bir bileşenin ikinci varyantını yapmadan önce birincisini silmeyi düşün.
