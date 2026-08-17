// One-shot patch; remove after generated API files are verified.
const fs=require('fs');
const GA_HEAD='<script async src="https://www.googletagmanager.com/gtag/js?id=G-K52VCM51N2"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag("js",new Date());gtag("config","G-K52VCM51N2");</script>';
const TRACK='<script>document.addEventListener("click",function(e){var a=e.target.closest&&e.target.closest("[data-ga]");if(!a||typeof gtag!=="function")return;gtag("event",a.getAttribute("data-ga"),{link_url:a.href||"",language:document.documentElement.lang||"en"});});</script>';
function must(s,find,repl,label){if(!s.includes(find))throw new Error('Missing '+label);return s.replace(find,repl)}
let map=fs.readFileSync('api/academy-map.js','utf8');
map=must(map,'`<a class="card" href="${u}">','`<a class="card" data-ga="academy_map_to_hub" href="${u}">','map card');
map=must(map,'<a class="btn" href="${contact}">${esc(t.button)}</a>','<a class="btn" data-ga="academy_map_rfq_click" href="${contact}">${esc(t.button)}</a>','map rfq');
map=must(map,'<script type="application/ld+json">${JSON.stringify(schema)}</script><style>','<script type="application/ld+json">${JSON.stringify(schema)}</script>'+GA_HEAD+'<style>','map GA');
map=must(map,'</footer></body></html>`)}','</footer>'+TRACK+'</body></html>`)}','map tracker');
fs.writeFileSync('api/academy-map.js',map);
let hub=fs.readFileSync('api/academy-hub.js','utf8');
hub=must(hub,'return `<a href="${url}">${esc(label)}</a>`','return `<a data-ga="academy_hub_to_article" href="${url}">${esc(label)}</a>`','hub article');
hub=must(hub,'map(k=>`<a href="${paths[lang].base}${topics[k].slugs[lang]}/">','map(k=>`<a data-ga="academy_hub_to_hub" href="${paths[lang].base}${topics[k].slugs[lang]}/">','hub related');
hub=must(hub,'<a class="btn" href="${p.contact}">${u.button}</a>','<a class="btn" data-ga="academy_hub_rfq_click" href="${p.contact}">${u.button}</a>','hub rfq');
hub=must(hub,'<script type="application/ld+json">${JSON.stringify(breadcrumb)}</script><style>${css}</style>','<script type="application/ld+json">${JSON.stringify(breadcrumb)}</script>'+GA_HEAD+'<style>${css}</style>','hub GA');
hub=must(hub,'</footer></body></html>`;','</footer>'+TRACK+'</body></html>`;','hub tracker');
fs.writeFileSync('api/academy-hub.js',hub);
console.log('P2 Academy analytics patch applied');
