import fs from 'fs';
import * as cheerio from 'cheerio';

// Master slug map: legacy flat file -> translated slug per language.
// Empty string slug = site root for that language (/{lang}/).
const SLUGS = {
  'index.html': { tr: '', en: '', ar: '' },
  'hakkimizda.html': { tr: 'hakkimizda', en: 'about', ar: 'about' },
  'beton.html': { tr: 'beton', en: 'concrete', ar: 'concrete' },
  'galvaniz.html': { tr: 'galvaniz', en: 'galvanizing', ar: 'galvanizing' },
  'enerji.html': { tr: 'enerji', en: 'waste-to-energy', ar: 'waste-to-energy' },
  'celik-yapi-mekanik-imalat.html': { tr: 'celik-yapi', en: 'steel-fabrication', ar: 'steel-fabrication' },
  'tedarik-zinciri.html': { tr: 'tedarik-zinciri', en: 'supply-chain', ar: 'supply-chain' },
  'referanslar.html': { tr: 'referanslar', en: 'references', ar: 'references' },
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
  'hakkimizda.html': {
    tr: { title: 'Hakkımızda — Vorqa Global', desc: 'Vorqa Global hakkında. Beton santralleri, galvaniz tesisleri, enerji dönüşüm ve mühendislik alanlarında doğrulanmış tedarikçi ağımızla küresel ölçekte proje koordinasyonu.' },
    en: { title: 'About Us — Technical Sourcing Partner for MENA & Africa | Vorqa Global', desc: 'About Vorqa Global. A technical sourcing & project coordination partner delivering concrete plants, galvanizing facilities, energy conversion and engineering projects through our verified supplier network, at global scale.' },
    ar: { title: 'من نحن — شريك التوريد التقني لمنطقة الشرق الأوسط وأفريقيا | Vorqa Global', desc: 'عن Vorqa Global. شريك توريد وتنسيق مشاريع تقني يقدّم محطات الخرسانة ومصانع الجلفنة ومشاريع تحويل الطاقة والهندسة عبر شبكة موردينا المعتمدة، على المستوى العالمي.' },
  },
  'beton.html': {
    tr: { title: 'Beton Santrali Tedarik & Kurulum — Türkiye | Vorqa Global', desc: 'Sabit, mobil ve kompakt beton santrali tedariki ve kurulum koordinasyonu — doğrulanmış Türk üretici ağımızla, 60-240 m³/sa kapasite aralığında MENA projeleri için.' },
    en: { title: 'Concrete Batching Plant Supplier — Turkey to MENA | Vorqa Global', desc: 'Stationary, mobile and compact concrete batching plant supply and installation coordination — through our verified Turkish manufacturer network, 60-240 m³/h capacity range, for MENA projects.' },
    ar: { title: 'توريد محطات خلط الخرسانة — من تركيا إلى الشرق الأوسط وأفريقيا | Vorqa Global', desc: 'توريد وتنسيق تركيب محطات خلط الخرسانة الثابتة والمتنقلة والمدمجة — عبر شبكة المصنّعين الأتراك المعتمدة لدينا، بطاقة إنتاجية من 60 إلى 240 م³/ساعة، لمشاريع الشرق الأوسط وأفريقيا.' },
  },
  'galvaniz.html': {
    tr: { title: 'Sıcak Daldırma Galvaniz Tesisi Tedariki — Türkiye | Vorqa Global', desc: 'Sıcak daldırma, merkezkaç ve boru galvaniz tesislerinin tedarik ve kurulum koordinasyonu — doğrulanmış Türk üretici ağımızla, MENA projeleri için.' },
    en: { title: 'Hot-Dip Galvanizing Plant Supplier — Turkey to MENA | Vorqa Global', desc: 'Hot-dip, centrifugal and pipe galvanizing plant supply and installation coordination — through our verified Turkish manufacturer network, for MENA projects.' },
    ar: { title: 'توريد منشآت الجلفنة بالغمس الساخن — من تركيا إلى الشرق الأوسط وأفريقيا | Vorqa Global', desc: 'توريد وتنسيق تركيب منشآت الجلفنة بالغمس الساخن والطرد المركزي والأنابيب — عبر شبكة المصنّعين الأتراك المعتمدة لدينا، لمشاريع الشرق الأوسط وأفريقيا.' },
  },
  'enerji.html': {
    tr: { title: 'Atıktan Enerji & Biyogaz Tesisi Tedariki | Vorqa Global', desc: 'Kentsel atık, biyogaz, atık ısı ve depolama gazından enerji dönüşüm tesisi tedarik ve koordinasyonu — doğrulanmış üretici ağımız aracılığıyla, projeye özel kapasite.' },
    en: { title: 'Waste-to-Energy & Biogas Plant Sourcing — MENA | Vorqa Global', desc: 'Municipal waste, biogas, waste heat and landfill gas energy conversion plant supply and coordination — through our verified manufacturer network, project-specific capacity.' },
    ar: { title: 'توريد منشآت تحويل النفايات إلى طاقة والغاز الحيوي — الشرق الأوسط وأفريقيا | Vorqa Global', desc: 'توريد وتنسيق منشآت تحويل النفايات البلدية والغاز الحيوي وحرارة النفايات وغاز المكبات إلى طاقة — عبر شبكة التصنيع المعتمدة لدينا، بطاقة خاصة بكل مشروع.' },
  },
  'celik-yapi-mekanik-imalat.html': {
    tr: { title: 'Çelik Konstrüksiyon & Mekanik İmalat Tedariki | Vorqa Global', desc: 'Endüstriyel çelik yapı imalatı, mekanik proje tasarımı ve montaj tedarik koordinasyonu — atık işleme, geri dönüşüm ve proses tesisleri için, doğrulanmış üretici ağımızla.' },
    en: { title: 'Steel Fabrication Supplier — Turkey | Vorqa Global', desc: 'Industrial steel structure fabrication, mechanical project design and installation coordination — for waste processing, recycling and process facilities, through our verified manufacturer network.' },
    ar: { title: 'توريد التصنيع الفولاذي — تركيا | Vorqa Global', desc: 'تصنيع الهياكل الفولاذية الصناعية وتصميم المشاريع الميكانيكية وتنسيق التركيب — لمنشآت معالجة النفايات وإعادة التدوير والمعالجة، عبر شبكة التصنيع المعتمدة لدينا.' },
  },
  'tedarik-zinciri.html': {
    tr: { title: 'Endüstriyel Tedarik & Proje Koordinasyonu — Türkiye | Vorqa Global', desc: 'Endüstriyel ekipman temini, lojistik koordinasyonu ve 1.000+ doğrulanmış Türk tedarikçiden oluşan ağ yönetimi — MENA ve Afrika projeleri için tek muhatap.' },
    en: { title: 'Industrial Procurement Partner — Turkey & MENA | Vorqa Global', desc: 'Industrial equipment procurement, logistics coordination and management of our network of 1,000+ verified Turkish suppliers — single point of contact for MENA and Africa projects.' },
    ar: { title: 'شريك التوريد الصناعي — تركيا والشرق الأوسط وأفريقيا | Vorqa Global', desc: 'توريد المعدات الصناعية وتنسيق اللوجستيات وإدارة شبكتنا التي تضم أكثر من 1.000 مورد تركي معتمد — بمرجعية واحدة لمشاريع الشرق الأوسط وأفريقيا.' },
  },
  'referanslar.html': {
    tr: { title: 'Referanslar — Vorqa Global', desc: 'Vorqa Global Grubu tamamlanan proje referansları. Beton santralleri, galvaniz tesisleri, çelik yapı ve atık-enerji projeleri.' },
    en: { title: 'Delivered Project Capacity — Concrete, Galvanizing, Steel & Energy | Vorqa Global', desc: 'Capacity delivered through our network. Concrete plants, galvanizing facilities, steel structures and waste-to-energy projects across MENA and Africa.' },
    ar: { title: 'الطاقة المُسلَّمة للمشاريع — الخرسانة والجلفنة والفولاذ والطاقة | Vorqa Global', desc: 'طاقة تم تسليمها عبر شبكتنا. محطات الخرسانة ومنشآت الجلفنة والهياكل الفولاذية ومشاريع تحويل النفايات إلى طاقة في الشرق الأوسط وأفريقيا.' },
  },
  'akademi.html': {
    tr: { title: 'Akademi — Vorqa Global', desc: 'Vorqa Akademi — beton santrali, galvaniz, enerji dönüşüm ve tedarik zinciri alanlarında Mira editörlüğünde teknik içerikler, akademik araştırmalar ve sektör analizleri.' },
    en: { title: 'Academy — Technical Insights on Concrete, Galvanizing & Energy | Vorqa Global', desc: 'Vorqa Academy — technical articles, research and industry analysis on concrete plants, galvanizing, energy conversion and supply chain, edited by Mira.' },
    ar: { title: 'الأكاديمية — رؤى تقنية حول الخرسانة والجلفنة والطاقة | Vorqa Global', desc: 'أكاديمية Vorqa — مقالات تقنية وأبحاث وتحليلات صناعية حول محطات الخرسانة والجلفنة وتحويل الطاقة وسلسلة التوريد، بإشراف ميرا التحريري.' },
  },
  'iletisim.html': {
    tr: { title: 'İletişim — Vorqa Global', desc: 'Vorqa Global ile iletişime geçin. Beton santrali, galvaniz tesisi, enerji dönüşüm ve tedarik zinciri projeleriniz için teklif alın.' },
    en: { title: 'Contact Us — Request a Quote | Vorqa Global', desc: 'Contact Vorqa Global. Get a quote for your concrete plant, galvanizing facility, energy conversion or supply chain project.' },
    ar: { title: 'اتصل بنا — اطلب عرض سعر | Vorqa Global', desc: 'تواصل مع Vorqa Global. احصل على عرض سعر لمشروعك في محطات الخرسانة أو منشآت الجلفنة أو تحويل الطاقة أو سلسلة التوريد.' },
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

    // Force setLang(lang) once (fires window.__prjRelang etc.); drop auto-detect + click-binding lines
    $('script').each((_, el) => {
      const code = $(el).html();
      if (code && code.includes('const T = {') && code.includes('function setLang')) {
        let newCode = code
          .replace(/const _initLang[\s\S]*?setLang\(_initLang\);\s*/, `setLang('${lang}');\n`)
          .replace(/document\.querySelectorAll\('\.l-btn, \.mob-l-btn'\)\.forEach\(b => \{\s*b\.addEventListener\('click', \(\) => setLang\(b\.dataset\.lang\)\);\s*\}\);\s*/, '');
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

    // img/src referencing project-relative assets need the extra ../ removed since we're now 2 levels deep (/lang/slug/)
    $('img[src], source[src]').each((_, elImg) => {
      const s = $(elImg).attr('src');
      if (s && !/^(https?:)?\/\//.test(s) && !s.startsWith('/')) {
        $(elImg).attr('src', '/' + s);
      }
    });
    const outPath = pathFor(lang, file);
    const outDir = '.' + outPath; // e.g. ./en/about/
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(outDir + 'index.html', '<!DOCTYPE html>\n' + $.html());
    console.log('wrote', outDir + 'index.html');
  }
}
