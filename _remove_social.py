import re
import sys

files = [
    'index.html',
    'akademi.html',
    'iletisim.html',
    'tr/akademi/beton-santrali-kapasite-hesaplama-2026-05-10/index.html',
    'en/academy/beton-santrali-kapasite-hesaplama-2026-05-10/index.html',
    'ar/academy/beton-santrali-kapasite-hesaplama-2026-05-10/index.html',
    'vorqa-blog/beton-santrali-kapasite-hesaplama-2026-05-10.html',
    'vorqa-blog/en-1090-2-celik-yapi-toleranslari-ndt-2026-03-20.html',
    'vorqa-blog/enerji-sektorunde-epc-f-modeli-ve-yapay-zeka-gelecegin-projelerin-2026-05-28.html',
    'vorqa-blog/epc-yonetimi-kazanilmis-deger-risk-2026-01-28.html',
    'vorqa-blog/galvaniz-boya-kaplama-yasam-dongusu-maliyeti-2026-06-25.html',
    'vorqa-blog/iso-1461-galvaniz-kaplama-kalinligi-2026-04-22.html',
    'vorqa-blog/mekanik-montaj-titresim-analizi-hizalama-2026-06-11.html',
    'vorqa-blog/mobil-sabit-beton-santrali-roi-2026-02-14.html',
    'vorqa-blog/tedarik-zinciri-2026-kirilganliklari-2026-03-05.html',
    'vorqa-blog/wte-atiktan-enerjiye-teknolojiler-2026-04-08.html',
]

# Matches the whole <a ...youtube.com/@vorqaglobal...>...</a> or instagram.com/vorqaglobal block,
# across single-line or multi-line formatting, plus one trailing newline (and leading indentation)
yt_pattern = re.compile(r'[ \t]*<a href="https://youtube\.com/@vorqaglobal"[\s\S]*?</a>\n?')
ig_pattern = re.compile(r'[ \t]*<a href="https://instagram\.com/vorqaglobal"[\s\S]*?</a>\n?')

total_yt, total_ig = 0, 0
for f in files:
    with open(f, 'r', encoding='utf-8') as fh:
        content = fh.read()
    content, n_yt = yt_pattern.subn('', content)
    content, n_ig = ig_pattern.subn('', content)
    total_yt += n_yt
    total_ig += n_ig
    if n_yt or n_ig:
        with open(f, 'w', encoding='utf-8') as fh:
            fh.write(content)
    print(f'{f}: youtube={n_yt} instagram={n_ig}')

print(f'\nTOTAL: youtube={total_yt} instagram={total_ig}')
