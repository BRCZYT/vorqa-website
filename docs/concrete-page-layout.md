# Beton sayfası — ilk içerik ve yerleşim örneği

Durum: Türkçe inceleme prototipi. Canlı beton sayfasının yerine geçirilmez. Önizleme `/preview/beton-santralleri/` adresinde, noindex/nofollow olarak hazırlanmıştır. Ana sayfa, diğer sektörler ve kurumsal kimlik dokümanı bu çalışmanın kapsamı dışındadır.

## İçerik kaynağı ve sınırlar

Tek kaynak: `VORQA_Beton_Santralleri_Kurumsal_Metin.docx`, Drive ID `1iI9YSjJD9eBhdi1UDEVuhDbM9LgOK9XB`. Kaynak belge değiştirilmedi. Yayına yönelik giriş ve 16 ana bölümün 113 paragraf/liste maddesi aynen kullanıldı. Kapak künyesi, tekrar eden kapak başlıkları ve web ekibine hitap eden yerleşim/yayın kontrol notları ziyaretçi metnine dahil edilmedi. İlave kapasite, tasarruf yüzdesi, sertifika, tamamlanmış proje veya performans garantisi üretilmedi.

Veri: `concrete-page-content.mjs`. Sayfa üretimi: `node build-concrete-preview.mjs`. Canlı sektör üreticisi bu prototipi üretmez; böylece onay öncesi mevcut 15 sayfa korunur.

## Yerleşim ve hareket planı

| Sıra | Alan ve içerik | Yerleşim | Görsel / hareket |
|---|---|---|---|
| 1 | Beton Santralleri ve Mühendislik Çözümleri; kaynaktaki proje odaklı ilk cümle; keşfet ve proje bağlantıları | Lacivert zemin, solda büyük başlık ve kısa giriş, sağda geniş görsel | 01. Metin sabit; görsel alanı ilk görünmede hafif yükselerek belirir |
| 2 | Sayfa içi menü | Header altında yapışkan yatay menü; mobilde yatay kayar | Görünen bölümün menü bağlantısı ince turuncu çizgiyle işaretlenir |
| 3 | Kaynağın giriş paragrafları | Solda kısa ara başlık, sağda tam giriş; altında depolama → besleme → dozajlama → karıştırma → sevkiyat şeması | Şematik akış çizgisinde yavaş hareket eden tek turuncu işaret; mobilde akış dikey ve sabit |
| 4 | Yerli Mühendislik ve Projeye Özel Tasarım | Rahat okuma genişliği; öncelikler açık liste | İddia veya yapay istatistik kartı yok |
| 5 | Komple Beton Santrali Çözümleri | Koyu bölüm; başlık solda, tam açıklamalar ve bileşen listesi sağda | İnce çizgiler ve turuncu ok işaretleri |
| 6 | Sabit, mobil, kompakt, kuru/özel konfigürasyon | Masaüstü 2×2, mobil tek sütun. Her kartta görsel, kategori etiketi, H3 ve tam kaynak metin/liste | 02–05. Kartlar görünürken hafif yükselir; hover'da 3px hareket ve turuncu sınır |
| 7 | Mikser Teknolojileri ve Homojen Karışım | Sol sütunda tam bilgi ve mikser seçenekleri; sağda ekipman görseli | 06. Görsel masaüstünde metin okunurken sabit konumda kalır |
| 8 | Dozajlama, Reçete Yönetimi ve Otomasyon | Koyu bölüm; altı işlev açık listede; tam kapsam açıklaması | 07. Gerçek veriye benzetilen sahte ekran veya çalışan sayaç yok |
| 9 | Silo, Depolama ve Malzeme Besleme | Tam açıklama ve yan görsel | 08. Görsel ilk görünmede belirir |
| 10 | Beton Geri Dönüşüm ve Kaynak Kullanımı | Açık alternatif zemin; metin ve yan görsel | 09. Kaynaktaki proje özelinde değerlendirme koşulu korunur |
| 11 | Modernizasyon ve Kapasite Artırımı | Açık zemin; tam çalışma listesi, karar kriterleri ve yan görsel | 10. Önce/sonra karşılaştırması ancak gerçek eşleşen fotoğraflar gelirse eklenir |
| 12 | Montaj, devreye alma, proje yönetimi / satış sonrası bakım ve yedek parça | İki ayrı sütun; mobilde ardışık. Metin ve hizmet listeleri açık görünür | 11. Saha fotoğrafı montaj sütununun altında |
| 13 | Yurt içi ve dışı proje yaklaşımı | Başlık/metin iki sütun | Gerçek referans veya ülke sayısı eklenmez |
| 14 | Neden VORQA? | Kaynaktaki açıklama ve altı gerekçe açık liste | İnce çizgili liste; teknik içerik gizlenmez |
| 15 | Son proje çağrısı | Koyu kapanış; kaynağın kapanış metni ve iletişim bağlantısı | Mevcut marka footer'ı ile kapanır |

## Gerçek görsel listesi

| No | Gereken görsel | Hedef oran | Kadraj / kullanım notu |
|---|---|---|---|
| 01 | Komple beton santrali | 16:10 | Bunker, mikser, silo ve malzeme akışı anlaşılır; sağ hero alanı |
| 02 | Sabit santral | 16:9 | Tesisin bütünü; kart üstü |
| 03 | Mobil santral | 16:9 | Taşıma yapısı ve saha yerleşimi görünür; kart üstü |
| 04 | Kompakt santral | 16:9 | Alan kullanımı ve bakım erişimi anlaşılır; kart üstü |
| 05 | Kuru beton / özel konfigürasyon | 16:9 | Gerçek ilgili tesis veya izinli teknik yerleşim çizimi |
| 06 | Mikser detayı | 4:3 | Mikser tipi doğrulanmış, iç yapı veya bakım erişimi görünür |
| 07 | Tartım / otomasyon | 4:3 | Gerçek ekipman veya kullanım izni olan ekran; özel veri bulunmamalı |
| 08 | Silo ve besleme | 16:9 | Silo ve transfer sistemi aynı bağlamda |
| 09 | Beton geri dönüşümü | 4:3 | Ünitenin yıkama ve geri kazanım işlevi anlaşılır |
| 10 | Modernizasyon | 16:9 | Gerçek revizyon detayı; varsa aynı açıdan önce/sonra çifti |
| 11 | Montaj / servis | 16:9 | Kullanım izni olan ekip ve saha fotoğrafı |

Boş alanlar fotoğraf gibi davranan yapay görüntülerle doldurulmaz. Gerçek görseller geldiğinde oran ve odak noktası doğrulanarak WebP/AVIF türevleri hazırlanır. Bir görsel VORQA referansı değilse öyle sunulmaz. Alt metinler gerçek görüntünün içeriğine göre yazılır.

## Davranış ve erişilebilirlik

- Başlıklar ve teknik metinler HTML içinde bulunur; kaydırma/animasyon çalışmasa da okunabilir.
- Reveal hareketi yalnızca kart ve görsel alanlarında, bir kez uygulanır; ana metin animasyon beklemez.
- `prefers-reduced-motion` tüm hareketleri kapatır. Mobil şema hareket etmez.
- Klavye odak halkaları, içerik atlama bağlantısı, semantik H1/H2/H3 ve gerçek bağlantılar kullanılır.
- Görsel alanları dekoratif çizgi ikonlarıyla ve açık numaralarıyla tanımlanır; kullanıcıdan gerçek fotoğraflar beklenir.
- Bu tasarım onaylandıktan sonra üretim sayfasına aktarım, EN/AR yerelleştirme ve nihai canonical/hreflang/schema güncellemesi ayrı adım olacaktır.
