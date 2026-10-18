import fs from 'node:fs';
import {industryHeader,industryFooter} from './industry-shell.mjs';
import {industries,labels,esc,pathForIndustry,contactPath,renderIndustryCards} from './industry-content.mjs';
const origin='https://www.vorqaglobal.com';
const langs=['tr','en','ar'];
const url=(i,l)=>origin+pathForIndustry(i,l);
export function applyIndustryHome($,lang){
  $('#industries .ind-rail').html(renderIndustryCards(lang));
  for(const href of ['/tokens.css','/master.css']) if(!$(`link[href="${href}"]`).length) $('head').append(`<link rel="stylesheet" href="${href}">`);
}
function page(i,lang){
 const t=i[lang],l=labels[lang],self=url(i,lang),home=`/${lang}/`,contact=contactPath(lang),academy=`/${lang}/${lang==='tr'?'akademi':'academy'}/`;
 const graph={ '@context':'https://schema.org','@graph':[
   {'@type':'WebPage','@id':self+'#page',url:self,name:t.title+' | VORQA Global',description:t.desc,inLanguage:lang,mainEntity:{'@id':self+'#service'},breadcrumb:{'@id':self+'#breadcrumb'}},
   {'@type':'Service','@id':self+'#service',name:t.title,description:t.intro,url:self,provider:{'@type':'Organization',name:'VORQA Global',url:origin}},
   {'@type':'BreadcrumbList','@id':self+'#breadcrumb',itemListElement:[{'@type':'ListItem',position:1,name:l.home,item:origin+home},{'@type':'ListItem',position:2,name:t.title,item:self}]},
   {'@type':'FAQPage','@id':self+'#faq',inLanguage:lang,mainEntity:t.faq.map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}))}
 ]};
 return `<!DOCTYPE html>
<html lang="${lang}" dir="${lang==='ar'?'rtl':'ltr'}"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(t.title)} | VORQA Global</title><meta name="description" content="${esc(t.desc)}"><meta name="robots" content="index,follow">
<link rel="canonical" href="${self}">
${[...langs,'x-default'].map(code=>`<link rel="alternate" hreflang="${code}" href="${url(i,code==='x-default'?'en':code)}">`).join('\n')}
<meta property="og:type" content="website"><meta property="og:title" content="${esc(t.title)} | VORQA Global"><meta property="og:description" content="${esc(t.desc)}"><meta property="og:url" content="${self}"><meta property="og:image" content="${origin+i.image}"><meta property="og:site_name" content="VORQA Global"><meta property="og:locale" content="${{tr:'tr_TR',en:'en_US',ar:'ar_AR'}[lang]}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(t.title)} | VORQA Global"><meta name="twitter:description" content="${esc(t.desc)}"><meta name="twitter:image" content="${origin+i.image}">
<link rel="icon" href="/favicon.svg?v=20261017" type="image/svg+xml"><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource-variable/sora@5.3.0/index.css"><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource-variable/manrope@5.0.20/index.css"><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource-variable/noto-sans-arabic@5.3.0/index.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource-variable/jetbrains-mono@5.0.21/index.css"><link rel="stylesheet" href="/tokens.css"><link rel="stylesheet" href="/master.css">
<script type="application/ld+json">${JSON.stringify(graph).replace(/</g,'\\u003c')}</script>
</head><body class="industry-page">
<a class="industry-skip" href="#main">${l.skip}</a>
${industryHeader(i,lang)}
<main id="main"><section class="industry-hero"><div class="industry-wrap"><nav aria-label="${lang==='ar'?'مسار الصفحة':lang==='tr'?'İçerik yolu':'Breadcrumb'}"><ol class="industry-breadcrumb"><li><a href="${home}">${l.home}</a> /</li><li><a href="${home}#industries">${l.industries}</a> /</li><li aria-current="page">${esc(t.title)}</li></ol></nav><p class="industry-eyebrow">§ 03 / ${l.industries}</p><h1>${esc(t.title)}</h1><p class="industry-lead">${esc(t.intro)}</p><a class="industry-button" href="${contact}">${l.quote} <span aria-hidden="true">${lang==='ar'?'←':'→'}</span></a><p class="industry-scope">${l.scope}</p></div></section>
<div class="industry-wrap"><figure class="industry-photo"><img src="${i.image}" alt="${esc(t.title)}" width="1200" height="800" fetchpriority="high"><figcaption>${l.photo}</figcaption></figure><div class="industry-sections">${t.sections.map(([h,p],n)=>`<section class="industry-section" id="section-${n+1}"><div class="industry-section-heading"><span class="industry-section-number" aria-hidden="true">${String(n+1).padStart(2,'0')}</span><h2>${esc(h)}</h2></div><p>${esc(p)}</p></section>`).join('\n')}</div><section class="industry-faq" id="faq"><h2>${l.faq}</h2>${t.faq.map(([q,a])=>`<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</section></div>
<section class="industry-cta"><div class="industry-wrap"><h2>${l.cta}</h2><p>${l.ctaText}</p><a class="industry-button" href="${contact}">${l.quote}</a></div></section><section class="industry-wrap industry-related"><h2>${l.related}</h2><ul>${industries.filter(other=>other.id!==i.id).map(other=>`<li><a href="${pathForIndustry(other,lang)}">${esc(other[lang].title)}</a></li>`).join('')}</ul></section></main>
${industryFooter(lang)}</body></html>\n`;
}
export function buildIndustries(){
 for(const i of industries)for(const lang of langs){const dir='.'+pathForIndustry(i,lang);fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(dir+'index.html',page(i,lang));}
 const entries=industries.flatMap(i=>langs.map(lang=>`  <url><loc>${url(i,lang)}</loc>${[...langs,'x-default'].map(code=>`<xhtml:link rel="alternate" hreflang="${code}" href="${url(i,code==='x-default'?'en':code)}"/>`).join('')}</url>`)).join('\n');
 fs.writeFileSync('sitemap-industries.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries}\n</urlset>\n`);
 console.log('Built 15 industry pages and industry sitemap.');
}
if(process.argv[1]?.endsWith('build-industry-pages.mjs'))buildIndustries();
