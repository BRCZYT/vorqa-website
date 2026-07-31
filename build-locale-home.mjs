import fs from 'fs';
import * as cheerio from 'cheerio';

const SRC = 'index.html';
const src = fs.readFileSync(SRC, 'utf8');

// Extract T object
const m = [...src.matchAll(/const T\s*=\s*\{([\s\S]*?)\n\};/g)];
const T = new Function('return {' + m[0][1] + '}')();

const META = {
  tr: {
    title: 'Türk Endüstriyel Üretici Tedarik Partneri — MENA & Afrika | Vorqa Global',
    desc: 'Türk uzman üreticilerin mühendislik gücünü MENA ve Afrika projeleri için birleştiren teknik tedarik & koordinasyon partneri. Beton, galvaniz, enerji ve çelik dikeylerinde 1.000+ tedarikçi ağı. Ankara, Türkiye.',
    dir: 'ltr'
  },
  en: {
    title: 'Turkish Industrial Sourcing Partner for MENA & Africa | Vorqa Global',
    desc: 'A technical sourcing & coordination partner uniting the engineering power of expert Turkish manufacturers for MENA and Africa projects. Network of 1,000+ suppliers across concrete, galvanizing, energy and steel. Ankara, Turkey.',
    dir: 'ltr'
  },
  ar: {
    title: 'شريك التوريد الصناعي التركي لمنطقة الشرق الأوسط وأفريقيا | Vorqa Global',
    desc: 'شريك توريد وتنسيق تقني يجمع القوة الهندسية للمصنّعين الأتراك الخبراء لمشاريع الشرق الأوسط وأفريقيا. شبكة من أكثر من 1.000 مورد في قطاعات الخرسانة والجلفنة والطاقة والفولاذ. أنقرة، تركيا.',
    dir: 'rtl'
  }
};

// Map of current flat page -> translated slug per language (docs §8.1 style)
const SLUG_MAP = {
  'index.html': { tr: '', en: '', ar: '' }, // homepage itself
  'hakkimizda.html': { tr: 'hakkimizda', en: 'about', ar: 'about' },
  'beton.html': { tr: 'beton', en: 'concrete', ar: 'concrete' },
  'galvaniz.html': { tr: 'galvaniz', en: 'galvanizing', ar: 'galvanizing' },
  'enerji.html': { tr: 'enerji', en: 'waste-to-energy', ar: 'waste-to-energy' },
  'celik-yapi-mekanik-imalat.html': { tr: 'celik-yapi', en: 'steel-fabrication', ar: 'steel-fabrication' },
  'tedarik-zinciri.html': { tr: 'tedarik-zinciri', en: 'supply-chain', ar: 'supply-chain' },
  'referanslar.html': { tr: 'referanslar', en: 'references', ar: 'references' },
  'akademi.html': { tr: 'akademi', en: 'academy', ar: 'academy' },
  'iletisim.html': { tr: 'iletisim', en: 'contact', ar: 'contact' },
  'belgelerimiz.html': { tr: 'belgelerimiz', en: 'certifications', ar: 'certifications' },
};

for (const lang of ['tr', 'en', 'ar']) {
  const $ = cheerio.load(src, { decodeEntities: false });
  const dict = T[lang];

  // Bake in data-i18n / data-i18n-html
  $('[data-i18n]').each((_, el) => {
    const key = $(el).attr('data-i18n');
    if (dict[key] !== undefined) $(el).text(dict[key]);
    $(el).removeAttr('data-i18n');
  });
  $('[data-i18n-html]').each((_, el) => {
    const key = $(el).attr('data-i18n-html');
    if (dict[key] !== undefined) $(el).html(dict[key].replace(/&amp;/g, '&'));
    $(el).removeAttr('data-i18n-html');
  });
  $('[data-i18n-ph]').each((_, el) => {
    const key = $(el).attr('data-i18n-ph');
    if (dict[key] !== undefined) $(el).attr('placeholder', dict[key]);
    $(el).removeAttr('data-i18n-ph');
  });
  $('[data-i18n-aria]').each((_, el) => {
    const key = $(el).attr('data-i18n-aria');
    if (dict[key] !== undefined) $(el).attr('aria-label', dict[key]);
    $(el).removeAttr('data-i18n-aria');
  });

  // html lang/dir
  $('html').attr('lang', lang).attr('dir', META[lang].dir);

  // title
  $('title').text(META[lang].title);

  // meta description / og / twitter description
  $('meta[name="description"]').attr('content', META[lang].desc);
  $('meta[property="og:description"]').attr('content', META[lang].desc);
  $('meta[name="twitter:description"]').attr('content', META[lang].desc);
  $('meta[property="og:title"]').attr('content', META[lang].title);
  $('meta[name="twitter:title"]').attr('content', META[lang].title);
  $('meta[property="og:locale"]').remove();
  $('head').append(`<meta property="og:locale" content="${lang === 'tr' ? 'tr_TR' : lang === 'ar' ? 'ar_AR' : 'en_US'}">`);

  // canonical + hreflang
  $('link[rel="canonical"]').attr('href', `https://www.vorqaglobal.com/${lang}/`);
  $('link[rel="alternate"][hreflang]').remove();
  const alt = [
    ['tr', 'https://www.vorqaglobal.com/tr/'],
    ['en', 'https://www.vorqaglobal.com/en/'],
    ['ar', 'https://www.vorqaglobal.com/ar/'],
    ['x-default', 'https://www.vorqaglobal.com/en/'],
  ];
  const head = $('head');
  for (const [code, href] of alt) {
    head.append(`<link rel="alternate" hreflang="${code}" href="${href}">\n`);
  }
  $('meta[property="og:url"]').attr('content', `https://www.vorqaglobal.com/${lang}/`);

  // JSON-LD: update url fields that pointed at bare root to the language homepage where it's a WebPage-like ref; leave Organization "url" as root brand domain
  $('script[type="application/ld+json"]').each((_, el) => {
    let txt = $(el).html();
    try {
      const obj = JSON.parse(txt);
      if (obj['@type'] === 'Organization') {
        obj.description = META[lang].desc;
      }
      $(el).text(JSON.stringify(obj));
    } catch (e) { /* leave as-is if not parseable here */ }
  });

  // Remove the auto-invoking language detection + activation line, keep function defs (dead but harmless)
  $('script').each((_, el) => {
    const code = $(el).html();
    if (code && code.includes('const T = {') && code.includes('function setLang')) {
      let newCode = code
        .replace(/const _initLang[\s\S]*?setLang\(_initLang\);\s*/,
          `setLang('${lang}');\n`)
        .replace(/document\.querySelectorAll\('\.l-btn, \.mob-l-btn'\)\.forEach\(b => \{\s*b\.addEventListener\('click', \(\) => setLang\(b\.dataset\.lang\)\);\s*\}\);\s*/, '');
      $(el).text(newCode);
    }
  });

  // Language switcher: replace .l-btn / .mob-l-btn buttons with links to sibling locale homepages
  // (keep data-lang so the still-running setLang()'s active-class toggle stays correct)
  $('.l-btn, .mob-l-btn').each((_, el) => {
    const btnLang = $(el).attr('data-lang');
    if (!btnLang) return;
    const label = $(el).text();
    const isActive = btnLang === lang;
    const baseCls = ($(el).attr('class') || '').replace(/\bactive\b/g, '').replace(/\s+/g, ' ').trim();
    const $a = $(`<a href="/${btnLang}/" data-lang="${btnLang}" class="${baseCls}${isActive ? ' active' : ''}">${label}</a>`);
    $(el).replaceWith($a);
  });

  // Internal page links: point to existing flat legacy pages absolutely (interim bridge until migrated)
  $('a[href]').each((_, el) => {
    let href = $(el).attr('href');
    if (!href) return;
    const bare = href.split('#')[0];
    if (SLUG_MAP[bare] && bare !== 'index.html') {
      $(el).attr('href', `/${bare}`);
    } else if (bare === 'index.html') {
      $(el).attr('href', `/${lang}/`);
    } else if (href.startsWith('index.html#')) {
      $(el).attr('href', `/${lang}/` + href.slice('index.html'.length));
    }
  });

  const outDir = lang;
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(`${outDir}/index.html`, '<!DOCTYPE html>\n' + $.html());
  console.log('wrote', `${outDir}/index.html`);
}
