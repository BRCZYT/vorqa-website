import fs from 'fs';
import * as cheerio from 'cheerio';

// Master slug map: legacy flat file -> translated slug per language.
// Empty string slug = site root for that language (/{lang}/).
// Site reduced to Home / Academy / Contact (see docs/VORQA_Global_Website_Revision_Brief_for_Claude.md).
// About, Concrete, Galvanizing, Waste-to-Energy, Steel-Fabrication, Supply-Chain and
// References no longer exist as separate pages — their content lives inside Home now.
const SLUGS = {
  'index.html': { tr: '', en: '', ar: '' },
  'akademi.html': { tr: 'akademi', en: 'academy', ar: 'academy' },
  'iletisim.html': { tr: 'iletisim', en: 'contact', ar: 'contact' },
};

// Per-page title/description overrides (TR pulled from already-live meta; EN/AR authored fresh).
const PAGES = {
  'index.html': {
    tr: { title: 'Endüstriyel Tedarik & Proje Koordinasyon Partneri — MENA & Afrika | Vorqa Global', desc: 'VORQA; beton, komple galvaniz, atık-enerji ve kırma-eleme tesisleri için müşteri tarafında çalışan bir endüstriyel tedarik, proje tedariği ve koordinasyon partneridir — MENA & Afrika.' },
    en: { title: 'Industrial Sourcing & Project Supply Partner — MENA & Africa | Vorqa Global', desc: 'VORQA is a customer-side industrial sourcing, project supply and coordination partner for concrete, complete galvanizing, waste-to-energy and crushing & screening plants — MENA & Africa.' },
    ar: { title: 'شريك التوريد الصناعي وتنسيق المشاريع — الشرق الأوسط وأفريقيا | Vorqa Global', desc: 'VORQA شريك توريد صناعي وتزويد مشاريع وتنسيق يعمل لصالح العميل لمحطات الخرسانة ومنشآت الجلفنة الكاملة وتحويل النفايات إلى طاقة ومنشآت التكسير والغربلة — الشرق الأوسط وأفريقيا.' },
  },
  'akademi.html': {
    tr: { title: 'Akademi — Vorqa Global', desc: 'Vorqa Akademi — beton santrali, galvaniz, enerji dönüşüm ve tedarik zinciri alanlarında Mira editörlüğünde teknik içerikler, akademik araştırmalar ve sektör analizleri.' },
    en: { title: 'Academy — Technical Insights on Concrete, Galvanizing & Energy | Vorqa Global', desc: 'Vorqa Academy — technical articles, research and industry analysis on concrete plants, galvanizing, energy conversion and supply chain, edited by Mira.' },
    ar: { title: 'الأكاديمية — رؤى تقنية حول الخرسانة والجلفنة والطاقة | Vorqa Global', desc: 'أكاديمية Vorqa — مقالات تقنية وأبحاث وتحليلات صناعية حول محطات الخرسانة والجلفنة وتحويل الطاقة وسلسلة التوريد، بإشراف ميرا التحريري.' },
  },
  'iletisim.html': {
    tr: { title: 'İletişim — Teklif Alın | Vorqa Global', desc: 'Vorqa Global ile iletişime geçin. Beton, komple galvaniz, atık-enerji ve kırma-eleme tesisi projeleriniz için teklif alın.' },
    en: { title: 'Contact Us — Request a Quote | Vorqa Global', desc: 'Contact VORQA Global. Request a quote for your concrete, complete galvanizing, waste-to-energy or crushing & screening plant project.' },
    ar: { title: 'اتصل بنا — اطلب عرض سعر | Vorqa Global', desc: 'تواصل مع VORQA Global. اطلب عرض سعر لمشروعك في محطات الخرسانة أو منشآت الجلفنة الكاملة أو تحويل النفايات إلى طاقة أو التكسير والغربلة.' },
  },
};

function urlFor(lang, file) {
  const slug = SLUGS[file] ? SLUGS[file][lang] : null;
  if (slug === null || slug === undefined) return null; // not migrated
  return slug === '' ? `https://www.vorqaglobal.com/${lang}/` : `https://www.vorqaglobal.com/${lang}/${slug}/`;
}
function pathFor(lang, file) {
  const slug = SLUGS[file] ? SLUGS[file][lang] : null;
  if (slug === null || slug === undefined) return null;
  return slug === '' ? `/${lang}/` : `/${lang}/${slug}/`;
}

for (const file of Object.keys(SLUGS)) {
  const src = fs.readFileSync(file, 'utf8').replace(/^﻿/, '');
  const m = [...src.matchAll(/const T\s*=\s*\{([\s\S]*?)\n\};/g)];
  const T = new Function('return {' + m[0][1] + '}')();
  const meta = PAGES[file];

  for (const lang of ['tr', 'en', 'ar']) {
    const $ = cheerio.load(src, { decodeEntities: false });
    const dict = T[lang];
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    const selfUrl = urlFor(lang, file);

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

    $('html').attr('lang', lang).attr('dir', dir);
    $('title').text(meta[lang].title);
    $('meta[name="description"]').attr('content', meta[lang].desc);
    $('meta[property="og:description"]').attr('content', meta[lang].desc);
    $('meta[name="twitter:description"]').attr('content', meta[lang].desc);
    $('meta[property="og:title"]').attr('content', meta[lang].title);
    $('meta[name="twitter:title"]').attr('content', meta[lang].title);
    $('meta[property="og:locale"]').remove();
    $('head').append(`<meta property="og:locale" content="${lang === 'tr' ? 'tr_TR' : lang === 'ar' ? 'ar_AR' : 'en_US'}">`);

    $('link[rel="canonical"]').attr('href', selfUrl);
    $('link[rel="alternate"][hreflang]').remove();
    const alt = [
      ['tr', urlFor('tr', file)],
      ['en', urlFor('en', file)],
      ['ar', urlFor('ar', file)],
      ['x-default', urlFor('en', file)],
    ];
    const head = $('head');
    for (const [code, href] of alt) head.append(`<link rel="alternate" hreflang="${code}" href="${href}">\n`);
    $('meta[property="og:url"]').attr('content', selfUrl);

    // JSON-LD: update description; fix BreadcrumbList item URLs where they reference migrated pages
    $('script[type="application/ld+json"]').each((_, el) => {
      const txt = $(el).html();
      try {
        const obj = JSON.parse(txt);
        const graph = obj['@graph'] || [obj];
        for (const node of graph) {
          if (node['@type'] === 'Organization' || node['@type'] === 'AboutPage' || node['@type'] === 'ContactPage' || node['@type'] === 'Service') {
            if (node.description !== undefined) node.description = meta[lang].desc;
          }
          if (node['@type'] === 'BreadcrumbList' && Array.isArray(node.itemListElement)) {
            for (const item of node.itemListElement) {
              if (item.item === 'https://www.vorqaglobal.com/') item.item = urlFor(lang, 'index.html');
              else {
                for (const [legacyFile] of Object.entries(SLUGS)) {
                  if (item.item === `https://www.vorqaglobal.com/${legacyFile}`) { item.item = urlFor(lang, legacyFile); break; }
                }
              }
            }
          }
        }
        $(el).text(JSON.stringify(obj));
      } catch (e) { /* leave non-JSON scripts alone */ }
    });

    // Force setLang(lang) once (fires window.__prjRelang etc.); drop auto-detect + click-binding lines.
    // Source files use two different codegen styles for this block (spaced/multi-line `_initLang`
    // in index.html vs compact `_l` in akademi.html/iletisim.html) — match both, otherwise the
    // auto-detect line survives into the generated static page and overrides the correct baked-in
    // lang/dir attributes client-side based on stale localStorage or the visitor's browser locale.
    $('script').each((_, el) => {
      const code = $(el).html();
      if (code && /const T\s*=\s*\{/.test(code) && code.includes('function setLang')) {
        let newCode = code
          .replace(/const _(?:initLang|l)\s*=\s*localStorage\.getItem\('vorqa-lang'\)[\s\S]*?setLang\(_(?:initLang|l)\);\s*/, `setLang('${lang}');\n`)
          .replace(/document\.querySelectorAll\('\.l-btn,\s*\.mob-l-btn'\)\.forEach\(b\s*=>\s*\{?\s*b\.addEventListener\('click',\s*\(\)\s*=>\s*setLang\(b\.dataset\.lang\)\);?\s*\}?\);\s*/, '');
        $(el).text(newCode);
      }
    });

    // Language switcher -> links to sibling locale of THIS SAME page
    $('.l-btn, .mob-l-btn').each((_, el) => {
      const btnLang = $(el).attr('data-lang');
      if (!btnLang) return;
      const label = $(el).text();
      const isActive = btnLang === lang;
      const baseCls = ($(el).attr('class') || '').replace(/\bactive\b/g, '').replace(/\s+/g, ' ').trim();
      const target = urlFor(btnLang, file) || `/${btnLang}/`;
      const $a = $(`<a href="${target}" data-lang="${btnLang}" class="${baseCls}${isActive ? ' active' : ''}">${label}</a>`);
      $(el).replaceWith($a);
    });

    // Internal links: migrated pages -> proper /{lang}/{slug}/ of the SAME language; others -> legacy flat path
    $('a[href]').each((_, elA) => {
      const href = $(elA).attr('href');
      if (!href) return;
      if (href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return; // same-page anchor, external, or contact link: leave untouched
      }
      const [bare, hash] = href.split('#');
      if (bare === '' || bare === 'index.html') {
        $(elA).attr('href', pathFor(lang, 'index.html') + (hash ? '#' + hash : ''));
      } else if (SLUGS[bare]) {
        $(elA).attr('href', pathFor(lang, bare) + (hash ? '#' + hash : ''));
      } else {
        // not migrated (blog posts, belgelerimiz.html, assets) -> keep as absolute legacy path
        $(elA).attr('href', '/' + bare + (hash ? '#' + hash : ''));
      }
    });

    // img/src and source/srcset referencing project-relative assets need the
    // extra ../ removed since we're now 2 levels deep (/lang/slug/)
    $('img[src], source[src]').each((_, elImg) => {
      const s = $(elImg).attr('src');
      if (s && !/^(https?:)?\/\//.test(s) && !s.startsWith('/')) {
        $(elImg).attr('src', '/' + s);
      }
    });
    $('source[srcset], img[srcset]').each((_, el) => {
      const s = $(el).attr('srcset');
      if (s && !/^(https?:)?\/\//.test(s) && !s.startsWith('/')) {
        $(el).attr('srcset', '/' + s);
      }
    });
    const outPath = pathFor(lang, file);
    const outDir = '.' + outPath; // e.g. ./en/about/
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(outDir + 'index.html', '<!DOCTYPE html>\n' + $.html());
    console.log('wrote', outDir + 'index.html');
  }
}
