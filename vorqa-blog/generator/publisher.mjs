import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BLOG_DIR  = path.join(__dirname, '../');          // ZYT-blog/
const SITE_ROOT = path.join(__dirname, '../../');       // ZYT-website/

// ─── Helpers ─────────────────────────────────────────────────────────────────

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[ıİ]/g, 'i').replace(/[ğĞ]/g, 'g').replace(/[şŞ]/g, 's')
    .replace(/[çÇ]/g, 'c').replace(/[öÖ]/g, 'o').replace(/[üÜ]/g, 'u')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 65);
}

function esc(str) {
  return String(str || '').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function getCoverImage(sector, draft) {
  const SECTOR_PHOTOS = {
    galvaniz: 'photo-1565197261854-57f69e7028c6',
    beton:    'photo-1504307651254-35680f356dfd',
    enerji:   'photo-1611273426858-450d8e3c9fce',
    tedarik:  'photo-1586528116311-ad8dd3c8310d',
    makina:   'photo-1558618666-fcd25c85cd64'
  };
  const photoId = SECTOR_PHOTOS[sector] || 'photo-1504307651254-35680f356dfd';
  return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=1200&h=600&q=80`;
}

function formatDateTR(dateStr) {
  const months = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
  const d = new Date(dateStr);
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

// ─── HTML Post Template ───────────────────────────────────────────────────────

function generatePostHTML(draft, slug, date, coverImg) {
  const { title, meta_description, excerpt, body_html, references = [],
          reading_time = 6, category_label, sector_page = 'index.html', sector } = draft;

  const isoDate  = `${date}T08:00:00+03:00`;
  const url      = `https://www.zytindustry.com/ZYT-blog/${slug}.html`;
  const dateTR   = formatDateTR(date);

  const refsHtml = references.length
    ? `<ol class="ref-list">${references.map(r => `<li>${r}</li>`).join('\n')}</ol>`
    : '';

  // Category color map
  const CAT_COLOR = {
    galvaniz: '#2874B2', beton: '#d97706', enerji: '#16a34a',
    tedarik: '#dc2626', makina: '#7c3aed'
  };
  const catColor = CAT_COLOR[sector] || '#2874B2';

  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${esc(title)} — ZYT Akademi</title>
<meta name="description" content="${esc(meta_description || excerpt)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="article">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(meta_description || excerpt)}">
<meta property="og:image" content="${coverImg}">
<meta property="og:url" content="${url}">
<meta property="article:published_time" content="${isoDate}">
<meta property="article:author" content="Mira">
<meta property="article:section" content="${esc(category_label)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(meta_description || excerpt)}">
<meta name="twitter:image" content="${coverImg}">
<script type="application/ld+json">
{
  "@context":"https://schema.org",
  "@type":"BlogPosting",
  "headline":${JSON.stringify(title)},
  "datePublished":"${isoDate}",
  "author":{"@type":"Person","name":"Mira","jobTitle":"ZYT Global Industry AI Editörü"},
  "publisher":{"@type":"Organization","name":"ZYT Global Industry","url":"https://www.zytindustry.com"},
  "mainEntityOfPage":{"@type":"WebPage","@id":"${url}"},
  "image":"${coverImg}",
  "description":${JSON.stringify(meta_description || excerpt)}
}
</script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource-variable/sora@5.0.21/index.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource-variable/manrope@5.0.20/index.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource-variable/jetbrains-mono@5.0.21/index.css">
<script src="https://cdn.tailwindcss.com"></script>
<style>
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{background:#f5f9ff;color:#0a2540;font-family:'Manrope Variable',Manrope,sans-serif;-webkit-font-smoothing:antialiased}
#scroll-prog{position:fixed;top:0;left:0;right:0;height:3px;z-index:9999;background:linear-gradient(90deg,${catColor},#5ba3e0);transform-origin:left;transform:scaleX(0);box-shadow:0 0 10px ${catColor}88}
#nav{position:fixed;top:0;left:0;right:0;z-index:200;display:flex;justify-content:space-between;align-items:center;padding:16px 56px;background:rgba(255,255,255,.95);backdrop-filter:blur(16px);border-bottom:1px solid rgba(10,37,64,.07);box-shadow:0 2px 20px rgba(10,37,64,.06)}
.nav-logo{display:flex;align-items:center;gap:13px;text-decoration:none}
.nav-links{display:flex;align-items:center;gap:24px}
.nav-link{font-family:'JetBrains Mono Variable',monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:rgba(10,37,64,.45);text-decoration:none;transition:color .2s}
.nav-link:hover,.nav-link.active{color:#0a2540}
.lang-sw{display:flex;border:1px solid rgba(10,37,64,.12);border-radius:4px;overflow:hidden;margin-left:10px}
.l-btn{font-family:'JetBrains Mono Variable',monospace;font-size:8px;letter-spacing:1.5px;text-transform:uppercase;color:rgba(10,37,64,.35);background:transparent;border:none;border-right:1px solid rgba(10,37,64,.08);padding:6px 9px;cursor:pointer;transition:all .15s}
.l-btn:last-child{border-right:none}
.l-btn.active{color:#fff;background:${catColor}}
.mob-l-btn{font-family:'JetBrains Mono Variable',monospace;font-size:10px;letter-spacing:2px;color:rgba(10,37,64,.3);background:transparent;border:1px solid rgba(10,37,64,.12);padding:8px 14px;border-radius:3px;cursor:pointer}
.mob-l-btn.active{color:${catColor};border-color:${catColor}}
.ham-btn{display:none;flex-direction:column;justify-content:center;gap:5px;background:transparent;border:none;cursor:pointer;padding:6px;width:34px;height:34px}
.ham-btn span{display:block;width:22px;height:1.5px;background:#0a2540;border-radius:1px;transition:transform .3s,opacity .2s}
.ham-btn.open span:nth-child(1){transform:translateY(6.5px) rotate(45deg)}
.ham-btn.open span:nth-child(2){opacity:0}
.ham-btn.open span:nth-child(3){transform:translateY(-6.5px) rotate(-45deg)}
#mob-nav{position:fixed;inset:0;background:#fff;z-index:250;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;opacity:0;pointer-events:none;transition:opacity .4s}
#mob-nav.open{opacity:1;pointer-events:all}
.mob-link{font-family:'Sora Variable',Sora,sans-serif;font-size:clamp(1.8rem,8vw,2.4rem);font-weight:300;color:rgba(10,37,64,.4);text-decoration:none;transition:color .2s}
.mob-link:hover{color:#0a2540}
.mob-sep{width:40px;height:1px;background:rgba(10,37,64,.1)}
.mob-lang{display:flex;gap:12px;margin-top:20px}
#hero-post{padding-top:90px;background:linear-gradient(160deg,#ddeeff 0%,#eaf3fc 40%,#f5f9ff 100%);position:relative;overflow:hidden}
.hero-post-inner{max-width:820px;margin:0 auto;padding:60px 40px 80px}
.back-link{display:inline-flex;align-items:center;gap:6px;font-family:'JetBrains Mono Variable',monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:rgba(10,37,64,.4);text-decoration:none;margin-bottom:28px;transition:color .2s}
.back-link:hover{color:${catColor}}
.post-cat{font-family:'JetBrains Mono Variable',monospace;font-size:9px;letter-spacing:2.5px;text-transform:uppercase;color:${catColor};margin-bottom:16px;display:flex;align-items:center;gap:8px}
.post-cat::before{content:'';width:16px;height:1px;background:${catColor}}
.post-title{font-family:'Sora Variable',Sora,sans-serif;font-size:clamp(1.9rem,4vw,3rem);font-weight:300;line-height:1.15;letter-spacing:-.03em;color:#0a2540;margin-bottom:20px}
.post-meta{font-family:'JetBrains Mono Variable',monospace;font-size:9px;letter-spacing:1.5px;color:rgba(10,37,64,.38);display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.post-meta-sep{width:3px;height:3px;border-radius:50%;background:rgba(10,37,64,.25)}
.cover-img{width:100%;max-height:480px;object-fit:cover;border-radius:12px;margin:36px 0 0;display:block;box-shadow:0 8px 40px rgba(10,37,64,.1)}
#article-body{max-width:820px;margin:0 auto;padding:52px 40px 40px}
.article-content{font-size:16px;line-height:1.85;color:rgba(10,37,64,.8)}
.article-content h2{font-family:'Sora Variable',Sora,sans-serif;font-size:1.45rem;font-weight:400;letter-spacing:-.02em;color:#0a2540;margin:2.4em 0 .8em;padding-left:16px;border-left:3px solid ${catColor};line-height:1.25}
.article-content h3{font-family:'Sora Variable',Sora,sans-serif;font-size:1.15rem;font-weight:400;color:#0a2540;margin:1.8em 0 .6em}
.article-content p{margin-bottom:1.4em}
.article-content strong{color:#0a2540;font-weight:600}
.article-content code{font-family:'JetBrains Mono Variable',monospace;font-size:.88em;background:rgba(40,116,178,.08);border:1px solid rgba(40,116,178,.18);border-radius:4px;padding:2px 7px;color:#0a2540}
.article-content table{width:100%;border-collapse:collapse;margin:1.8em 0;font-size:14px}
.article-content th{background:rgba(40,116,178,.08);font-family:'JetBrains Mono Variable',monospace;font-size:9px;letter-spacing:1.5px;text-transform:uppercase;color:#0a2540;padding:10px 14px;text-align:left;border:1px solid rgba(10,37,64,.1)}
.article-content td{padding:10px 14px;border:1px solid rgba(10,37,64,.08);color:rgba(10,37,64,.75);vertical-align:top}
.article-content tr:nth-child(even) td{background:rgba(40,116,178,.03)}
.article-content ul,.article-content ol{padding-left:1.5em;margin-bottom:1.4em}
.article-content li{margin-bottom:.4em}
.highlight-box{background:rgba(40,116,178,.06);border:1px solid rgba(40,116,178,.18);border-radius:8px;padding:20px 24px;margin:2em 0}
.ref-section{border-top:1px solid rgba(10,37,64,.08);margin-top:56px;padding-top:32px}
.ref-label{font-family:'JetBrains Mono Variable',monospace;font-size:9px;letter-spacing:2.5px;text-transform:uppercase;color:rgba(10,37,64,.38);margin-bottom:16px}
.ref-list{list-style:none;padding:0}
.ref-list li{font-size:13px;color:rgba(10,37,64,.5);line-height:1.6;margin-bottom:8px;padding-left:2em;position:relative}
.ref-list li::before{content:counter(ref-counter) ".";counter-increment:ref-counter;position:absolute;left:0;color:${catColor};font-family:'JetBrains Mono Variable',monospace;font-size:11px}
.ref-list{counter-reset:ref-counter}
.author-card{background:#fff;border:1px solid rgba(10,37,64,.07);border-radius:12px;padding:24px;display:flex;align-items:center;gap:20px;margin:40px 0;box-shadow:0 2px 12px rgba(10,37,64,.06)}
.author-img{width:64px;height:64px;border-radius:50%;object-fit:cover;object-position:top;border:2px solid rgba(40,116,178,.2);flex-shrink:0}
.author-name{font-family:'Sora Variable',Sora,sans-serif;font-size:1rem;font-weight:400;color:#0a2540;margin-bottom:3px}
.author-role{font-family:'JetBrains Mono Variable',monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:${catColor}}
.cta-post{background:linear-gradient(135deg,#0f3d72,#06193a);border-radius:12px;padding:36px;text-align:center;margin:40px 0}
.btn-p{display:inline-flex;align-items:center;gap:8px;font-family:'JetBrains Mono Variable',monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#fff;background:${catColor};border:none;border-radius:6px;padding:13px 26px;cursor:pointer;text-decoration:none;transition:opacity .2s,transform .15s;box-shadow:0 4px 16px ${catColor}55}
.btn-p:hover{opacity:.88;transform:translateY(-2px)}
.btn-o{display:inline-flex;align-items:center;gap:8px;font-family:'JetBrains Mono Variable',monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,.65);background:transparent;border:1.5px solid rgba(255,255,255,.2);border-radius:6px;padding:13px 26px;cursor:pointer;text-decoration:none;transition:color .2s,border-color .2s}
.btn-o:hover{color:#fff;border-color:rgba(255,255,255,.5)}
#foot{background:linear-gradient(180deg,#1e4f84 0%,#071e38 60%,#051728 100%);padding:36px 80px;border-top:1px solid rgba(40,116,178,.15)}
.foot-inner{max-width:820px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px}
.ft-soc-link{color:rgba(255,255,255,.28);transition:color .2s;display:flex}
.ft-soc-link:hover{color:#2874B2}
.ft-social{display:flex;gap:14px;align-items:center}
.rv{opacity:0;transform:translateY(20px);transition:opacity .7s cubic-bezier(.22,1,.36,1),transform .7s cubic-bezier(.22,1,.36,1)}
.rv.on{opacity:1;transform:none}
@media(max-width:768px){
  #nav{padding:14px 20px}.nav-links{display:none}.ham-btn{display:flex}
  .hero-post-inner,.#article-body{padding-left:20px;padding-right:20px}
  #foot{padding:28px 20px}
}
</style>
</head>
<body>
<div id="scroll-prog"></div>

<nav id="nav">
  <a href="../index.html" class="nav-logo">
    <svg width="58" height="22" viewBox="140 65 400 120" xmlns="http://www.w3.org/2000/svg">
      <path d="M150,70 L250,70 L260,80 L260,86 L180,164 L260,164 L260,180 L160,180 L150,170 L150,164 L158,164 L238,86 L150,86 Z" fill="#0a2540"/>
      <path d="M285,76 L291,70 L303,70 L336,122 L344,122 L377,70 L389,70 L395,76 L348,130 L348,180 L332,180 L332,130 Z" fill="${catColor}"/>
      <path d="M420,80 L430,70 L520,70 L530,80 L530,86 L483,86 L483,180 L467,180 L467,86 L420,86 Z" fill="#0a2540"/>
    </svg>
    <div style="border-left:1px solid rgba(10,37,64,.14);padding-left:12px">
      <div style="font-family:'JetBrains Mono Variable',monospace;font-size:7.5px;letter-spacing:2px;color:rgba(10,37,64,.4);text-transform:uppercase;line-height:1.8">Global</div>
      <div style="font-family:'JetBrains Mono Variable',monospace;font-size:7.5px;letter-spacing:2px;color:rgba(10,37,64,.4);text-transform:uppercase;line-height:1.8">Industry</div>
    </div>
  </a>
  <div class="nav-links">
    <a href="../akademi.html" class="nav-link active">Akademi</a>
    <a href="../${sector_page}" class="nav-link">${category_label}</a>
    <a href="../iletisim.html" class="nav-link">İletişim</a>
  </div>
  <div class="lang-sw" id="lang-sw">
    <button class="l-btn active" data-lang="tr">TR</button>
    <button class="l-btn" data-lang="en">EN</button>
    <button class="l-btn" data-lang="ar">AR</button>
  </div>
  <button class="ham-btn" id="ham-btn" aria-label="Menüyü Aç"><span></span><span></span><span></span></button>
</nav>

<div id="mob-nav" aria-hidden="true">
  <div style="font-family:'JetBrains Mono Variable',monospace;font-size:9px;letter-spacing:3px;color:${catColor};text-transform:uppercase;margin-bottom:20px">ZYT Global Industry</div>
  <a href="../akademi.html" class="mob-link" style="color:${catColor}">Akademi</a>
  <div class="mob-sep"></div>
  <a href="../iletisim.html" class="mob-link">İletişim</a>
  <div class="mob-lang">
    <button class="mob-l-btn active" data-lang="tr">TR</button>
    <button class="mob-l-btn" data-lang="en">EN</button>
    <button class="mob-l-btn" data-lang="ar">AR</button>
  </div>
</div>

<section id="hero-post">
  <div class="hero-post-inner">
    <a href="../akademi.html" class="back-link">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M11 6H1M5 2L1 6l4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      Akademi'ye Dön
    </a>
    <div class="post-cat">${category_label}</div>
    <h1 class="post-title">${title}</h1>
    <div class="post-meta">
      <span>${dateTR}</span>
      <span class="post-meta-sep"></span>
      <span>${reading_time} dakika okuma</span>
      <span class="post-meta-sep"></span>
      <span>Mira · ZYT Akademi</span>
    </div>
    <img src="${coverImg}" alt="${esc(title)}" class="cover-img" loading="eager">
  </div>
</section>

<div id="article-body">
  <article class="article-content rv">
    ${body_html}
  </article>

  ${refsHtml ? `<div class="ref-section rv">
    <div class="ref-label">Kaynaklar</div>
    ${refsHtml}
  </div>` : ''}

  <div class="author-card rv">
    <img src="../ZYT-mira/Mira.png" alt="Mira" class="author-img">
    <div>
      <div class="author-name">Mira</div>
      <div class="author-role">ZYT Global Industry AI Editörü</div>
      <div style="font-size:13px;color:rgba(10,37,64,.5);margin-top:6px;line-height:1.6">
        Sektör haberlerini, akademik yayınları ve standart güncellemelerini ZYT Akademi için analiz eden yapay zeka editörü.
      </div>
    </div>
  </div>

  <div class="cta-post rv">
    <div style="font-family:'JetBrains Mono Variable',monospace;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,.4);margin-bottom:12px">${category_label}</div>
    <h2 style="font-family:'Sora Variable',Sora,sans-serif;font-size:1.6rem;font-weight:300;color:#fff;letter-spacing:-.02em;margin-bottom:10px">Projeniz için görüşelim.</h2>
    <p style="color:rgba(255,255,255,.45);font-size:14px;margin-bottom:24px">Uzman ekibimiz teknik ihtiyaçlarınızı dinlemeye hazır.</p>
    <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
      <a href="../iletisim.html" class="btn-p">Teklif Al →</a>
      <a href="../${sector_page}" class="btn-o">${category_label} →</a>
    </div>
  </div>
</div>

<footer id="foot">
  <div class="foot-inner">
    <a href="../index.html" style="text-decoration:none;display:flex;align-items:center;gap:12px">
      <svg width="44" viewBox="140 60 400 130" xmlns="http://www.w3.org/2000/svg">
        <path d="M150,70 L250,70 L260,80 L260,86 L180,164 L260,164 L260,180 L160,180 L150,170 L150,164 L158,164 L238,86 L150,86 Z" fill="#fff"/>
        <path d="M285,76 L291,70 L303,70 L336,122 L344,122 L377,70 L389,70 L395,76 L348,130 L348,180 L332,180 L332,130 Z" fill="${catColor}"/>
        <path d="M420,80 L430,70 L520,70 L530,80 L530,86 L483,86 L483,180 L467,180 L467,86 L420,86 Z" fill="#fff"/>
      </svg>
      <span style="font-family:'JetBrains Mono Variable',monospace;font-size:9px;letter-spacing:2px;color:rgba(255,255,255,.3);text-transform:uppercase">ZYT Global Industry</span>
    </a>
    <a href="../akademi.html" style="font-family:'JetBrains Mono Variable',monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,.35);text-decoration:none;border:1px solid rgba(255,255,255,.12);border-radius:3px;padding:6px 12px">← Tüm Yazılar</a>
    <div class="ft-social">
      <a href="https://linkedin.com/company/zyt-global-industry" class="ft-soc-link" target="_blank" rel="noopener" aria-label="LinkedIn"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>
    </div>
  </div>
  <div style="max-width:820px;margin:20px auto 0;padding-top:16px;border-top:1px solid rgba(255,255,255,.06)">
    <span style="font-family:'JetBrains Mono Variable',monospace;font-size:8px;letter-spacing:1.5px;color:rgba(255,255,255,.15);text-transform:uppercase">© 2026 ZYT Global Industry Grubu — Tüm Hakları Saklıdır</span>
  </div>
</footer>

<script>
(function(){
  var p=document.getElementById('scroll-prog');
  if(p) window.addEventListener('scroll',function(){
    var s=document.documentElement.scrollTop;
    var h=document.documentElement.scrollHeight-document.documentElement.clientHeight;
    p.style.transform='scaleX('+(h?s/h:0)+')';
  },{passive:true});
  var ro=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting)e.target.classList.add('on');});},{threshold:0.07});
  document.querySelectorAll('.rv').forEach(function(el){ro.observe(el);});
  var hamBtn=document.getElementById('ham-btn');
  var mobNav=document.getElementById('mob-nav');
  hamBtn.addEventListener('click',function(){
    var open=mobNav.classList.toggle('open');
    hamBtn.classList.toggle('open',open);
    mobNav.setAttribute('aria-hidden',String(!open));
  });
  var T={
    tr:{},
    en:{},
    ar:{}
  };
  function setLang(l){
    document.documentElement.lang=l;
    document.documentElement.dir=l==='ar'?'rtl':'ltr';
    document.querySelectorAll('.l-btn,.mob-l-btn').forEach(function(b){b.classList.toggle('active',b.dataset.lang===l);});
    localStorage.setItem('zyt-lang',l);
  }
  var _l=localStorage.getItem('zyt-lang')||(navigator.language.startsWith('ar')?'ar':navigator.language.startsWith('tr')?'tr':'en');
  setLang(_l);
  document.querySelectorAll('.l-btn,.mob-l-btn').forEach(function(b){b.addEventListener('click',function(){setLang(b.dataset.lang);});});
})();
</script>
</body>
</html>`;
}

// ─── Update akademi.html ─────────────────────────────────────────────────────────

async function updateBlogHtml(draft, slug, date, coverImg) {
  const blogPath = path.join(SITE_ROOT, 'akademi.html');
  let html = await fsp.readFile(blogPath, 'utf8');

  const dateTR = formatDateTR(date);
  const { title, reading_time = 6, sector, category_label } = draft;

  const newCard = `
      <!-- POST: ${title.slice(0, 60)} -->
      <div class="blog-card rv d1" data-cat="${sector}" onclick="location.href='ZYT-blog/${slug}.html'">
        <div class="blog-img-wrap">
          <img class="blog-img" src="${coverImg}" alt="${esc(title)}" loading="lazy">
          <div class="blog-img-overlay"></div>
        </div>
        <div class="blog-body">
          <div class="blog-cat-chip">${category_label}</div>
          <div class="blog-title">${title}</div>
          <div class="blog-meta">
            <span class="blog-date">${dateTR} &middot; ${reading_time} dak.</span>
            <a href="ZYT-blog/${slug}.html" class="blog-link">Oku <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M1 6h10M7 2l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></a>
          </div>
        </div>
      </div>`;

  // Insert new card at the top of the blog grid
  const marker = '<div class="blog-grid" id="blog-grid">';
  if (html.includes(marker)) {
    html = html.replace(marker, marker + newCard);
    await fsp.writeFile(blogPath, html, 'utf8');
    console.log(`[Publisher] akademi.html updated`);
  } else {
    console.warn('[Publisher] blog-grid marker not found — skipping akademi.html update');
  }
}

// ─── Update sitemap.xml ───────────────────────────────────────────────────────

async function updateSitemap(slug, date) {
  const sitemapPath = path.join(SITE_ROOT, 'sitemap.xml');
  if (!fs.existsSync(sitemapPath)) return;

  let xml = await fsp.readFile(sitemapPath, 'utf8');
  const newUrl = `\n  <url>\n    <loc>https://www.zytindustry.com/ZYT-blog/${slug}.html</loc>\n    <lastmod>${date}</lastmod>\n    <changefreq>never</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;

  xml = xml.replace('</urlset>', newUrl + '</urlset>');
  await fsp.writeFile(sitemapPath, xml, 'utf8');
  console.log(`[Publisher] sitemap.xml updated`);
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function publishDraft(draft) {
  const date = new Date().toISOString().slice(0, 10);
  const slug = `${slugify(draft.title)}-${date}`;
  const coverImg = getCoverImage(draft.sector, draft);

  // 1. Write HTML post file
  const postHtml = generatePostHTML(draft, slug, date, coverImg);
  const postPath = path.join(BLOG_DIR, `${slug}.html`);
  await fsp.writeFile(postPath, postHtml, 'utf8');
  console.log(`[Publisher] Post created: ${slug}.html`);

  // 2. Update akademi.html
  await updateBlogHtml(draft, slug, date, coverImg);

  // 3. Update sitemap.xml
  await updateSitemap(slug, date);

  return `ZYT-blog/${slug}.html`;
}
