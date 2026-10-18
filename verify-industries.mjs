import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import * as cheerio from 'cheerio';
import {industries,pathForIndustry,contactPath} from './industry-content.mjs';
const origin='https://www.vorqaglobal.com';
const langs=['tr','en','ar'];
let linkCount=0;
const read=p=>cheerio.load(fs.readFileSync('.'+p+'index.html','utf8'));
function internalLinks($){for(const el of $('a[href],img[src],link[rel="stylesheet"][href]').toArray()){
 const raw=$(el).attr('href')||$(el).attr('src');if(!raw.startsWith('/'))continue;
 const u=new URL(raw,origin),pathname=decodeURIComponent(u.pathname);
 const target='.'+pathname+(pathname.endsWith('/')?'index.html':'');
 assert(fs.existsSync(target),`Missing local target: ${raw}`);
 if(u.hash&&pathname.endsWith('/')){const doc=cheerio.load(fs.readFileSync(target,'utf8'));assert(doc('[id]').toArray().some(e=>doc(e).attr('id')===u.hash.slice(1)),`Missing anchor ${raw}`);}
 linkCount++;
}}
for(const lang of langs){const $=read(`/${lang}/`);const cards=$('#industries .ind-panel');assert.equal(cards.length,6);assert.deepEqual(cards.toArray().map(e=>$(e).attr('data-industry')),[...industries.map(i=>i.id),'waste-to-energy']);industries.forEach((i,n)=>assert.equal($(cards[n]).attr('href'),pathForIndustry(i,lang)));assert.equal($(cards[5]).attr('href'),contactPath(lang));for(const e of cards.find('img').toArray())assert(fs.existsSync('.'+decodeURIComponent($(e).attr('src'))));}
for(const i of industries)for(const lang of langs){const p=pathForIndustry(i,lang),$=read(p),self=origin+p;
 assert.equal($('html').attr('lang'),lang);assert.equal($('html').attr('dir'),lang==='ar'?'rtl':'ltr');
 assert.equal($('h1').length,1);assert.equal($('h1').text(),i[lang].title);assert($('h2').length>=6);assert.equal($('title').length,1);assert($('meta[name="description"]').attr('content').length>40);
 assert.equal($('link[rel="canonical"]').length,1);assert.equal($('link[rel="canonical"]').attr('href'),self);
 const alts=$('link[rel="alternate"][hreflang]');assert.equal(alts.length,4);
 for(const code of [...langs,'x-default']){const targetLang=code==='x-default'?'en':code;const expected=origin+pathForIndustry(i,targetLang);assert.equal(alts.filter(`[hreflang="${code}"]`).attr('href'),expected);const sibling=read(pathForIndustry(i,targetLang));assert.equal(sibling(`link[hreflang="${lang}"]`).attr('href'),self);}
 const graph=JSON.parse($('script[type="application/ld+json"]').text())['@graph'];assert.deepEqual(graph.map(n=>n['@type']),['WebPage','Service','BreadcrumbList','FAQPage']);const faqs=graph.find(n=>n['@type']==='FAQPage').mainEntity;assert.equal(faqs.length,$('.industry-faq details').length);faqs.forEach((q,n)=>{assert.equal(q.name,$('.industry-faq summary').eq(n).text());assert.equal(q.acceptedAnswer.text,$('.industry-faq details p').eq(n).text());});assert(!/noindex/.test($('meta[name="robots"]').attr('content')));internalLinks($);
}
const sitemap=cheerio.load(fs.readFileSync('sitemap-industries.xml','utf8'),{xml:true});assert.equal(sitemap('url').length,15);for(const i of industries)for(const lang of langs)assert(sitemap('loc').toArray().some(e=>sitemap(e).text()===origin+pathForIndustry(i,lang)));assert(fs.readFileSync('robots.txt','utf8').includes('Sitemap: '+origin+'/sitemap-industries.xml'));
assert(!fs.existsSync('./tr/sektorler/atik-enerji/index.html'));
console.log(`PASS: 15 pages; 3 matching six-card homepages; ${linkCount} internal link/asset targets; canonical, reciprocal hreflang, schema/visible FAQ parity, sitemap and waste contact policy.`);
