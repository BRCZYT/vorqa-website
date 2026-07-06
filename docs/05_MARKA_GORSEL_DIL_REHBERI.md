# ZYT Global — Marka ve Görsel Dil Rehberi
> Bu belge Claude Opus, Claude Code, Midjourney, tasarımcı — kim çalışırsa çalışsın aynı görsel dili üretmesi için tek kaynak.

## 1. Marka Özü
- **Kimlik cümlesi:** "Ankara merkezli, MENA odaklı, anahtar teslim endüstriyel mühendislik grubu."
- **Kişilik:** Mühendis ciddiyeti + küresel özgüven. Konuşkan değil, kanıtlı. Süslü değil, hassas.
- **MUTLAK KURAL:** Alt şirket isimleri (Galva-Pro, Mi Makina, Vetter Tech) hiçbir görselde, metinde, alt etikette, dosya adında geçmez. Tüm tarih ve uzmanlık ZYT Global'in tekil hikayesidir.

## 2. Renk Sistemi
| Rol | İsim | Hex | Kullanım |
|---|---|---|---|
| Zemin (koyu) | mid | `#051728` | Ana arka plan |
| Zemin (2. katman) | navy | `#0A2540` | Kart/bölüm zeminleri |
| Kimlik | blue | `#2874B2` | Linkler, ikincil vurgu, marka öğeleri |
| Yumuşak kimlik | steel | `#5C8DB8` | İkincil metin, ikonlar |
| Nötr | graph | `#3A4858` | Çizgiler, ayraçlar |
| Açık | mist | `#E8EEF4` | Ana metin (koyu zeminde) |
| **EYLEM** | orange | `#E87722` | SADECE: birincil CTA, aktif durum, kritik sayı, § numaraları. Ekranın ≤%5'i |
| Eylem hover | — | `#C96315` | Turuncu hover durumu |
Kural: Turuncu dekorasyon rengi DEĞİLDİR. "Buraya turuncu güzel gider" = yanlış kullanım sinyali.

## 3. Tipografi
| Rol | Font | Ağırlık | Kullanım |
|---|---|---|---|
| Display | Sora Variable | 600, 700 | H1-H2, hero, büyük sayılar |
| Body | Manrope Variable | 400, 500 | Paragraf, UI metni |
| Teknik | JetBrains Mono Variable | 400 | Etiketler (`// SISTEM`), § numaraları, veri, kod hissi |
- H1: `clamp(2.8rem, 7vw, 6rem)`, `tracking -0.04em`, uppercase opsiyonel
- Eyebrow/etiket: mono, 11-12px, `tracking +0.15em`, uppercase, steel renk
- Satır uzunluğu: 65-75 karakter (paragraf), line-height 1.6

## 4. İmza Görsel Motifler (markanın parmak izi — koru ve derinleştir)
- `§ 01 —` bölüm numaralandırma (mono, turuncu)
- `//` prefix'li eyebrow etiketler
- Blueprint grid: %3-5 opaklıkta ince çizgi ızgarası (koyu zeminlerde)
- Grain dokusu: %6 opaklık (mevcut)
- Ölçü/çap çizgileri: teknik çizim hissi veren ince kılavuzlar
- Sayfa-özel motifler: galvaniz=metalik shimmer, enerji=akış çizgisi, tedarik=düğüm ağı, beton=modüler blok

## 5. Fotoğraf & AI Görsel Standardı
**Ton:** Koyu, sinematik, soğuk mavi-gri ağırlıklı; tek sıcak vurgu (turuncu ekipman detayı, kıvılcım, güvenlik yeleği). Gün batımı/mavi saat veya kontrollü iç mekan ışığı. İnsan varsa uzak/siluet, yüz odakta değil. Asla: stok gülümseme, beyaz ofis, el sıkışma.

**Teknik format:** Hero 21:9 (min 2560px), kart 4:3 (min 1200px), og:image 1200×630. WebP çıktı, kalite 80.

### AI Üretim Promptları (Midjourney/DALL-E/Ideogram — İngilizce)
Ortak son ek her prompta eklenir:
> `..., dark cinematic industrial photography, cool blue-grey color grade with single warm orange accent, dramatic rim lighting, shallow depth of field, shot on medium format, photorealistic, no text, no watermark --ar 21:9`

1. **Ana sayfa hero:** `Vast modern industrial facility interior at blue hour, steel structures and gantry cranes silhouetted, single worker in orange safety vest walking in far distance, volumetric light through high windows`
2. **Galvaniz:** `Hot-dip galvanizing plant, steel beams emerging from molten zinc bath with silver metallic shimmer and rising vapor, orange glow reflection on wet floor`
3. **Enerji:** `Waste-to-energy biogas facility exterior at dusk, cylindrical digester tanks with pipework, control room lights glowing, industrial landscape`
4. **Beton:** `Mobile concrete batching plant on desert construction site at golden hour, cement silos against dramatic sky, dust particles in light`
5. **Tedarik zinciri:** `Container port logistics hub at night, crane loading cargo, long exposure light trails, deep blue tones with orange crane highlights`
6. **Çelik konstrüksiyon:** `Steel fabrication workshop, welding sparks flying in dark hall, precise beam structures, single welder silhouette with orange glow`
7. **Hakkımızda/ekip hissi:** `Engineers reviewing technical blueprints on large table in dark modern office, faces not visible, dramatic overhead light, industrial architecture visible through window`
8. **og:image şablonu:** `Minimal dark navy background #0A2540 with subtle blueprint grid, abstract industrial structure line art in steel blue` (üzerine tasarımda logo+başlık bindirilir)

## 6. İkonografi
- Stil: 1.5px stroke, outline, köşeler hafif yuvarlatılmış (Lucide seti baz)
- Renk: steel; aktif/vurgu durumunda turuncu
- Dolgu (filled) ikon kullanılmaz; emoji asla

## 7. Ses Tonu (metin)
- TR: Temiz, özgüvenli, kısa cümleler. "Yapıyoruz", "kuruyoruz" — edilgen değil etken. Abartı sıfatı yok ("muhteşem", "eşsiz" yasak); kanıt sayısı var ("24+ ülke").
- EN: Uluslararası B2B İngilizcesi; İngiliz/Amerikan karışımı nötr; teknik terimler sektör standardı (EPC, turnkey, hot-dip).
- AR (gelecek): Modern Standard Arabic, bölgesel lehçe yok; RTL tasarım kuralları 02 belgesinde.

## 8. Yasaklar Listesi (hızlı kontrol)
- ✗ Alt şirket isimleri — hiçbir yerde
- ✗ Turuncu dekorasyon
- ✗ Stok insan fotoğrafı, emoji, filled ikon
- ✗ 1 saniyeden uzun animasyon, sürekli hareket
- ✗ "En iyi/lider/1 numara" tarzı kanıtsız iddia
- ✗ Sayfa başına 1MB üzeri ilk yükleme
