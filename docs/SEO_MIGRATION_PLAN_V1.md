# VORQA Academy Legacy URL Migration Plan V1

Bu dosya yalnızca migrasyon manifestidir; hedef sayfa hazır olmadan 301 uygulanmaz.

## İlke
1. Yeni Academy makalesi ilgili locale altında oluşturulur.
2. Yeni sayfa self-canonical, Article/BlogPosting schema ve Breadcrumb taşır.
3. Academy index + ilgili Knowledge Hub yeni sayfaya internal link verir.
4. Yeni URL preview ve production'da 200 doğrulanır.
5. Ancak bundan sonra legacy `/vorqa-blog/*.html` URL 301 ile yeni TR Academy URL'ye taşınır.
6. EN/AR çevirisi gerçekten yoksa sahte hreflang oluşturulmaz; ilgili locale hub sayfası Türkçe kaynağı "Turkish article" olarak işaretleyebilir.

## Legacy → hedef TR Academy URL
- `/vorqa-blog/iso-1461-galvaniz-kaplama-kalinligi-2026-04-22.html` → `/tr/akademi/iso-1461-galvaniz-kaplama-kalinligi/`
- `/vorqa-blog/wte-atiktan-enerjiye-teknolojiler-2026-04-08.html` → `/tr/akademi/atiktan-enerji-teknolojileri/`
- `/vorqa-blog/en-1090-2-celik-yapi-toleranslari-ndt-2026-03-20.html` → `/tr/akademi/en-1090-2-celik-yapi-toleranslari-ndt/`
- `/vorqa-blog/tedarik-zinciri-2026-kirilganliklari-2026-03-05.html` → `/tr/akademi/tedarik-zinciri-kirilganliklari/`
- `/vorqa-blog/mobil-sabit-beton-santrali-roi-2026-02-14.html` → `/tr/akademi/mobil-sabit-beton-santrali-roi/`
- `/vorqa-blog/epc-yonetimi-kazanilmis-deger-risk-2026-01-28.html` → `/tr/akademi/epc-yonetimi-kazanilmis-deger-risk/`
- `/vorqa-blog/enerji-sektorunde-epc-f-modeli-ve-yapay-zeka-gelecegin-projelerin-2026-05-28.html` → `/tr/akademi/epc-f-modeli-yapay-zeka/`
- `/vorqa-blog/mekanik-montaj-titresim-analizi-hizalama-2026-06-11.html` → `/tr/akademi/mekanik-montaj-titresim-analizi-hizalama/`
- `/vorqa-blog/galvaniz-boya-kaplama-yasam-dongusu-maliyeti-2026-06-25.html` → `/tr/akademi/galvaniz-boya-yasam-dongusu-maliyeti/`

## Öncelik
P1-A: ISO 1461, Tedarik Zinciri, Mobil/Sabit Beton, WtE.
P1-B: EPC/EPC-F, Mekanik Montaj, Galvaniz LCC, EN 1090-2.

## Truth gate
Migrasyon öncesi her makalede:
- VORQA'ya ait doğrulanmamış proje/ülke deneyimi,
- doğrulanmamış performans veya süre garantisi,
- "VORQA standardı" gibi dokümante edilmemiş mühendislik sabitleri,
- doğrulanmamış tedarikçi/müşteri/adet iddiaları
ayıklanır veya açıkça genel mühendislik varsayımı olarak yeniden yazılır.
