import {labels,pathForIndustry,contactPath} from './industry-content.mjs';

const copy={
 tr:{menu:'Menüyü Aç / Kapat',copyright:'© 2026 VORQA GLOBAL — TÜM HAKLARI SAKLIDIR',location:'ANKARA, TÜRKİYE'},
 en:{menu:'Open / close menu',copyright:'© 2026 VORQA GLOBAL — ALL RIGHTS RESERVED',location:'ANKARA, TURKEY'},
 ar:{menu:'فتح / إغلاق القائمة',copyright:'© 2026 VORQA GLOBAL — جميع الحقوق محفوظة',location:'أنقرة، تركيا'}
};
export function industryHeader(item,lang){
 const l=labels[lang],c=copy[lang],home=`/${lang}/`,academy=`/${lang}/${lang==='tr'?'akademi':'academy'}/`;
 const links=`<a href="${home}">${l.home}</a><a href="${academy}">${l.academy}</a><a href="${contactPath(lang)}">${l.contact}</a>`;
 return `<header class="industry-header"><div class="industry-header-inner"><a class="industry-brand" href="${home}" aria-label="VORQA Global — ${l.home}"><img class="industry-logo" src="/brand_assets/vorqa_logo_white_cropped.png?v=20261017" alt="VORQA Global" width="720" height="195"></a><nav class="industry-nav" aria-label="${l.home}">${links}</nav><nav class="industry-languages" aria-label="${lang==='ar'?'اللغة':lang==='tr'?'Dil':'Language'}">${['tr','en','ar'].map(code=>`<a href="${pathForIndustry(item,code)}" lang="${code}" hreflang="${code}"${code===lang?' aria-current="page"':''}>${code.toUpperCase()}</a>`).join('')}</nav><details class="industry-mobile-menu"><summary aria-label="${c.menu}"><span></span><span></span><span></span></summary><nav aria-label="${c.menu}"><span class="industry-menu-brand" dir="ltr">VORQA GLOBAL</span>${links}<a href="${home}#industries">${l.industries}</a><a class="industry-button" href="${contactPath(lang)}">${l.quote} <span aria-hidden="true">${lang==='ar'?'←':'→'}</span></a></nav></details></div></header>`;
}
export function industryFooter(lang){
 const l=labels[lang],c=copy[lang],home=`/${lang}/`,academy=`/${lang}/${lang==='tr'?'akademi':'academy'}/`;
 return `<footer class="industry-footer"><div class="industry-wrap"><div class="industry-footer-top"><a href="${home}" aria-label="VORQA Global — ${l.home}"><img class="industry-logo" src="/brand_assets/vorqa_logo_white_cropped.png?v=20261017" alt="VORQA Global" width="720" height="195"></a><a class="industry-footer-academy" href="${academy}">${l.academy}</a><a class="industry-social" href="https://www.linkedin.com/company/122724032/" aria-label="LinkedIn" target="_blank" rel="noopener"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a></div><div class="industry-footer-bottom"><span>${c.copyright}</span><span>${c.location}</span></div></div></footer>`;
}
