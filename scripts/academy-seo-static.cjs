// One-shot static Academy SEO generator. Remove after generated pages are verified.
const fs = require('fs');

const SITE = 'https://www.vorqaglobal.com';
const pages = {
  en: {src:'en/academy/_source.html', out:'en/academy/index.html', map:'/en/academy/knowledge-map/', ey:'ACADEMY KNOWLEDGE MAP', title:'Explore by decision, not by product', body:'Start from industrial procurement, project supply or a technical plant decision. Six knowledge hubs connect practical questions, Academy research and the RFQ path.', button:'Open Knowledge Map'},
  tr: {src:'tr/akademi/_source.html', out:'tr/akademi/index.html', map:'/tr/akademi/bilgi-haritasi/', ey:'AKADEMİ BİLGİ HARİTASI', title:'Üründen değil, vermeniz gereken karardan başlayın', body:'Endüstriyel satınalma, proje tedariği veya teknik tesis kararından başlayın. Altı bilgi merkezi; pratik soruları, Academy araştırmalarını ve RFQ yolunu birbirine bağlar.', button:'Bilgi Haritasını Aç'},
  ar: {src:'ar/academy/_source.html', out:'ar/academy/index.html', map:'/ar/academy/knowledge-map/', ey:'خريطة معرفة الأكاديمية', title:'ابدأ بالقرار وليس بقائمة المنتجات', body:'ابدأ بالمشتريات الصناعية أو توريد المشاريع أو القرار الفني للمصنع. ستة مراكز معرفة تربط الأسئلة العملية بأبحاث الأكاديمية ومسار طلب العرض.', button:'فتح خريطة المعرفة'}
};

function truthSafe(html){
  return html
    .replaceAll('Vorqa standard: 0.82','example engineering assumption: 0.82')
    .replaceAll('Vorqa standart: 0.82','örnek mühendislik varsayımı: 0.82')
    .replaceAll('معيار Vorqa: 0.82','افتراض هندسي توضيحي: 0.82')
    .replaceAll('Every article is backed by <em>verified data</em>, real standard references and independent academic sources. Engineering <em>rigor</em> meets industry practice.','Articles are prepared using <em>standards, manufacturer documentation and cited sources</em> where applicable. Engineering <em>rigor</em> meets industry practice.')
    .replaceAll('Her yazı <em>doğrulanmış veri</em>, gerçek standart referansı ve bağımsız akademik kaynaklarla desteklenmektedir. Mühendislik <em>kesinliği</em>, sektör pratiğiyle buluşuyor.','Yazılar uygun olduğunda <em>standartlar, üretici dokümanları ve kaynak gösterilen çalışmalar</em> kullanılarak hazırlanır. Mühendislik <em>disiplini</em>, sektör pratiğiyle buluşur.')
    .replaceAll('كل مقال مدعوم <em>ببيانات موثقة</em>، ومراجع معيارية حقيقية ومصادر أكاديمية مستقلة. <em>الدقة</em> الهندسية تلتقي بالممارسة الصناعية.','تُعد المقالات بالاعتماد على <em>المعايير ووثائق المصنع والمصادر المشار إليها</em> حيثما ينطبق ذلك. تلتقي <em>الدقة</em> الهندسية بالممارسة الصناعية.');
}

function sourceCounterSafe(html, lang){
  const word = lang==='tr' ? 'Kaynaklı' : lang==='ar' ? 'موثّق' : 'Cited';
  return html.replace('<div class="mira-strip-stat-n">28+</div>', `<div class="mira-strip-stat-n">${word}</div>`);
}

function addHreflang(html){
  if(/hreflang=/i.test(html)) return html;
  const tags = `<link rel="alternate" hreflang="tr" href="${SITE}/tr/akademi/">\n<link rel="alternate" hreflang="en" href="${SITE}/en/academy/">\n<link rel="alternate" hreflang="ar" href="${SITE}/ar/academy/">\n<link rel="alternate" hreflang="x-default" href="${SITE}/en/academy/">\n`;
  return html.replace('</head>', `${tags}</head>`);
}

function band(lang, p){
  return `<section id="knowledge-map-entry" aria-labelledby="knowledge-map-title" style="background:#071a2b;color:#fff;padding:54px 24px;border-top:1px solid rgba(40,116,178,.35);border-bottom:1px solid rgba(40,116,178,.25)"><div style="max-width:1080px;margin:0 auto;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:28px;align-items:center"><div><div style="font:600 11px/1.3 monospace;letter-spacing:.16em;color:#8fc0e7;margin-bottom:12px">${p.ey}</div><h2 id="knowledge-map-title" style="font:400 clamp(1.7rem,4vw,2.7rem)/1.12 Arial,sans-serif;margin:0 0 12px">${p.title}</h2><p style="max-width:760px;margin:0;color:#d3e2ef;line-height:1.7">${p.body}</p></div><a data-ga="academy_map_open" href="${p.map}" style="display:inline-block;background:#E87722;color:#fff;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:8px;white-space:nowrap">${p.button} →</a></div></section><style>@media(max-width:760px){#knowledge-map-entry>div{grid-template-columns:1fr!important}#knowledge-map-entry a{justify-self:start}}</style><script>document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('[data-ga="academy_map_open"]');if(a&&typeof gtag==='function')gtag('event','academy_map_open',{link_url:a.href,language:document.documentElement.lang||'${lang}'});});</script>`;
}

for (const [lang,p] of Object.entries(pages)) {
  let html = fs.readFileSync(p.src,'utf8');
  html = truthSafe(html);
  html = sourceCounterSafe(html, lang);
  html = addHreflang(html);
  if(!html.includes('id="knowledge-map-entry"')) {
    const b = band(lang,p);
    if(/<section\s+id=["']content["']/i.test(html)) html = html.replace(/<section\s+id=["']content["']/i, `${b}\n<section id="content"`);
    else if(/<footer\b/i.test(html)) html = html.replace(/<footer\b/i, `${b}\n<footer`);
    else html = html.replace('</body>', `${b}\n</body>`);
  }
  fs.writeFileSync(p.out,html);
  console.log(`generated ${p.out}`);
}
