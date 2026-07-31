/**
 * Mevcut 7 blog postunu yeni Akademi şablonuna dönüştürür.
 * Çalıştır: node ZYT-blog/migrate-posts.mjs
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Post metadata ────────────────────────────────────────────────────────────
const POSTS = [
  {
    file: 'iso-1461-galvaniz-kaplama-kalinligi-2026-04-22.html',
    sector: 'galvaniz', catColor: '#2874B2', label: 'ZYT Galvaniz', page: 'galvaniz.html',
    title: 'ISO 1461: Sıcak Daldırma Galvanizlemede Kaplama Kalınlığı ve Ömür',
    dateTR: '22 Nis 2026', isoDate: '2026-04-22T08:00:00+03:00', reading_time: 6,
    cover: 'https://images.unsplash.com/photo-1565197261854-57f69e7028c6?auto=format&fit=crop&w=1200&h=600&q=80',
    url: 'https://www.zytindustry.com/ZYT-blog/iso-1461-galvaniz-kaplama-kalinligi-2026-04-22.html',
    metaDesc: 'ISO 1461:2022 standardına göre sıcak daldırma galvanizlemede çinko kaplama kalınlıkları, yüzey hazırlığı ve 50+ yıl korozyon ömrü rehberi.'
  },
  {
    file: 'wte-atiktan-enerjiye-teknolojiler-2026-04-08.html',
    sector: 'enerji', catColor: '#16a34a', label: 'ZYT Enerji', page: 'enerji.html',
    title: 'Atıktan Enerjiye: WtE Teknolojileri ve Türkiye 2030 Hedefleri',
    dateTR: '08 Nis 2026', isoDate: '2026-04-08T08:00:00+03:00', reading_time: 7,
    cover: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=1200&h=600&q=80',
    url: 'https://www.zytindustry.com/ZYT-blog/wte-atiktan-enerjiye-teknolojiler-2026-04-08.html',
    metaDesc: 'TÜİK 2024: Türkiye yıllık 32,3 milyon ton atık üretiyor. Moving grate WtE teknolojisi 500–650 kWh/ton üretiyor. 2030 Ulusal Atık Yönetimi Eylem Planı hedefleri.'
  },
  {
    file: 'en-1090-2-celik-yapi-toleranslari-ndt-2026-03-20.html',
    sector: 'makina', catColor: '#7c3aed', label: 'ZYT Makina', page: 'atik-donusum.html',
    title: 'EN 1090-2 Kapsamında Çelik Yapı Toleransları ve NDT Zorunlulukları',
    dateTR: '20 Mar 2026', isoDate: '2026-03-20T08:00:00+03:00', reading_time: 9,
    cover: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&h=600&q=80',
    url: 'https://www.zytindustry.com/ZYT-blog/en-1090-2-celik-yapi-toleranslari-ndt-2026-03-20.html',
    metaDesc: 'EN 1090-2:2018 EXC1-4 yürütme sınıfları, dikeylik toleransları H/300, EN ISO 5817 kaynak seviyeleri ve zorunlu NDT muayene gereksinimleri.'
  },
  {
    file: 'tedarik-zinciri-2026-kirilganliklari-2026-03-05.html',
    sector: 'tedarik', catColor: '#dc2626', label: 'ZYT Tedarik', page: 'tedarik-zinciri.html',
    title: 'Küresel Tedarik Zincirinde 2026 Kırılganlıkları ve Çeşitlendirme Stratejileri',
    dateTR: '05 Mar 2026', isoDate: '2026-03-05T08:00:00+03:00', reading_time: 5,
    cover: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&h=600&q=80',
    url: 'https://www.zytindustry.com/ZYT-blog/tedarik-zinciri-2026-kirilganliklari-2026-03-05.html',
    metaDesc: 'World Bank LPI 2023 ve McKinsey 2023 verilerine göre küresel tedarik zinciri kırılganlıkları, nearshoring trendleri ve çift onaylı tedarikçi modeli.'
  },
  {
    file: 'mobil-sabit-beton-santrali-roi-2026-02-14.html',
    sector: 'beton', catColor: '#d97706', label: 'ZYT Beton', page: 'beton.html',
    title: 'Mobil mi, Sabit mi? Proje Hacmi ve Süresine Göre ROI Analizi',
    dateTR: '14 Şub 2026', isoDate: '2026-02-14T08:00:00+03:00', reading_time: 5,
    cover: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1200&h=600&q=80',
    url: 'https://www.zytindustry.com/ZYT-blog/mobil-sabit-beton-santrali-roi-2026-02-14.html',
    metaDesc: 'Sabit ve mobil beton santrali karşılaştırması: teknik parametreler, TCO analizi ve 18 ay / 50.000 m³ eşiğine göre ROI rehberi. ERMCO 2024 verileri.'
  },
  {
    file: 'epc-yonetimi-kazanilmis-deger-risk-2026-01-28.html',
    sector: 'enerji', catColor: '#16a34a', label: 'ZYT Enerji', page: 'enerji.html',
    title: 'Anahtar Teslim Tesislerde EPC Yönetimi: Kazanılmış Değer ve Risk Matrisi',
    dateTR: '28 Oca 2026', isoDate: '2026-01-28T08:00:00+03:00', reading_time: 6,
    cover: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?auto=format&fit=crop&w=1200&h=600&q=80',
    url: 'https://www.zytindustry.com/ZYT-blog/epc-yonetimi-kazanilmis-deger-risk-2026-01-28.html',
    metaDesc: 'McKinsey analizi: büyük projelerin %79\'u bütçeyi, %52\'si takvimi aşıyor. FIDIC Sarı Kitap, EVM metrikleri (CPI/SPI) ve WBS risk kategorileri.'
  },
  {
    file: 'enerji-sektorunde-epc-f-modeli-ve-yapay-zeka-gelecegin-projelerin-2026-05-28.html',
    sector: 'enerji', catColor: '#16a34a', label: 'ZYT Enerji', page: 'enerji.html',
    title: 'Enerji Sektöründe EPC-F Modeli ve Yapay Zeka: Geleceğin Projelerini Şekillendirmek',
    dateTR: '28 May 2026', isoDate: '2026-05-28T08:00:00+03:00', reading_time: 4,
    cover: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?auto=format&fit=crop&w=1200&h=600&q=80',
    url: 'https://www.zytindustry.com/ZYT-blog/enerji-sektorunde-epc-f-modeli-ve-yapay-zeka-gelecegin-projelerin-2026-05-28.html',
    metaDesc: 'Enerji projelerinde EPC-F modelinin yükselişini ve yapay zekanın dönüştürücü gücünü keşfedin. Çoklu ajan sistemleri ve PEFT ile sektördeki verimlilik ve sürdürülebilirlik artıyor.'
  },
  {
    file: 'beton-santrali-kapasite-hesaplama-2026-05-10.html',
    sector: 'beton', catColor: '#d97706', label: 'ZYT Beton', page: 'beton.html',
    title: 'Beton Santrali Kapasitesi Nasıl Doğru Hesaplanır? Adım Adım Metodoloji',
    dateTR: '10 May 2026', isoDate: '2026-05-10T08:00:00+03:00', reading_time: 8,
    cover: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&h=600&q=80',
    url: 'https://www.zytindustry.com/ZYT-blog/beton-santrali-kapasite-hesaplama-2026-05-10.html',
    metaDesc: 'Q = P / (T × η × f) formülüyle beton santrali kapasitesi hesaplama. η=0.82 ZYT standardı, iklim ve irtifa düzeltme faktörleri. ACI 304R-00 referanslı.'
  }
];

// ─── CSS & template ───────────────────────────────────────────────────────────

function buildCSS(c) {
  return `*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{background:#f5f9ff;color:#0a2540;font-family:'Manrope Variable',Manrope,sans-serif;-webkit-font-smoothing:antialiased}
#scroll-prog{position:fixed;top:0;left:0;right:0;height:3px;z-index:9999;background:linear-gradient(90deg,${c},#5ba3e0);transform-origin:left;transform:scaleX(0);box-shadow:0 0 10px ${c}88}
#nav{position:fixed;top:0;left:0;right:0;z-index:200;display:flex;justify-content:space-between;align-items:center;padding:16px 56px;background:rgba(255,255,255,.95);backdrop-filter:blur(16px);border-bottom:1px solid rgba(10,37,64,.07);box-shadow:0 2px 20px rgba(10,37,64,.06)}
.nav-logo{display:flex;align-items:center;gap:13px;text-decoration:none}
.nav-links{display:flex;align-items:center;gap:24px}
.nav-link{font-family:'JetBrains Mono Variable',monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:rgba(10,37,64,.45);text-decoration:none;transition:color .2s}
.nav-link:hover,.nav-link.active{color:#0a2540}
.lang-sw{display:flex;border:1px solid rgba(10,37,64,.12);border-radius:4px;overflow:hidden;margin-left:10px}
.l-btn{font-family:'JetBrains Mono Variable',monospace;font-size:8px;letter-spacing:1.5px;text-transform:uppercase;color:rgba(10,37,64,.35);background:transparent;border:none;border-right:1px solid rgba(10,37,64,.08);padding:6px 9px;cursor:pointer;transition:all .15s}
.l-btn:last-child{border-right:none}
.l-btn.active{color:#fff;background:${c}}
.mob-l-btn{font-family:'JetBrains Mono Variable',monospace;font-size:10px;letter-spacing:2px;color:rgba(10,37,64,.3);background:transparent;border:1px solid rgba(10,37,64,.12);padding:8px 14px;border-radius:3px;cursor:pointer}
.mob-l-btn.active{color:${c};border-color:${c}}
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
.back-link:hover{color:${c}}
.post-cat{font-family:'JetBrains Mono Variable',monospace;font-size:9px;letter-spacing:2.5px;text-transform:uppercase;color:${c};margin-bottom:16px;display:flex;align-items:center;gap:8px}
.post-cat::before{content:'';width:16px;height:1px;background:${c}}
.post-title{font-family:'Sora Variable',Sora,sans-serif;font-size:clamp(1.9rem,4vw,3rem);font-weight:300;line-height:1.15;letter-spacing:-.03em;color:#0a2540;margin-bottom:20px}
.post-meta{font-family:'JetBrains Mono Variable',monospace;font-size:9px;letter-spacing:1.5px;color:rgba(10,37,64,.38);display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.post-meta-sep{width:3px;height:3px;border-radius:50%;background:rgba(10,37,64,.25)}
.cover-img{width:100%;max-height:480px;object-fit:cover;border-radius:12px;margin:36px 0 0;display:block;box-shadow:0 8px 40px rgba(10,37,64,.1)}
#article-body{max-width:820px;margin:0 auto;padding:52px 40px 40px}
.article-content{font-size:16px;line-height:1.85;color:rgba(10,37,64,.8)}
.article-content h2{font-family:'Sora Variable',Sora,sans-serif;font-size:1.45rem;font-weight:400;letter-spacing:-.02em;color:#0a2540;margin:2.4em 0 .8em;padding-left:16px;border-left:3px solid ${c};line-height:1.25}
.article-content h3{font-family:'Sora Variable',Sora,sans-serif;font-size:1.15rem;font-weight:400;color:#0a2540;margin:1.8em 0 .6em}
.article-content p{margin-bottom:1.4em}
.article-content strong{color:#0a2540;font-weight:600}
.article-content code,.formula-box code{font-family:'JetBrains Mono Variable',monospace;font-size:.88em;background:rgba(40,116,178,.08);border:1px solid rgba(40,116,178,.18);border-radius:4px;padding:2px 7px;color:#0a2540}
.article-content table,.data-table{width:100%;border-collapse:collapse;margin:1.8em 0;font-size:14px}
.article-content th,.data-table th{background:rgba(${c === '#2874B2' ? '40,116,178' : c === '#d97706' ? '217,119,6' : c === '#16a34a' ? '22,163,74' : c === '#dc2626' ? '220,38,38' : '124,58,237'},.08);font-family:'JetBrains Mono Variable',monospace;font-size:9px;letter-spacing:1.5px;text-transform:uppercase;color:#0a2540;padding:10px 14px;text-align:left;border:1px solid rgba(10,37,64,.1)}
.article-content td,.data-table td{padding:10px 14px;border:1px solid rgba(10,37,64,.08);color:rgba(10,37,64,.75);vertical-align:top}
.article-content tr:nth-child(even) td,.data-table tr:nth-child(even) td{background:rgba(40,116,178,.03)}
.article-content ul,.article-content ol{padding-left:1.5em;margin-bottom:1.4em}
.article-content li{margin-bottom:.4em}
.highlight-box,.formula-box{background:rgba(40,116,178,.06);border:1px solid rgba(40,116,178,.18);border-radius:8px;padding:20px 24px;margin:2em 0}
.formula-box{font-family:'JetBrains Mono Variable',monospace;font-size:.9em;background:rgba(${c === '#2874B2' ? '40,116,178' : c === '#d97706' ? '217,119,6' : c === '#16a34a' ? '22,163,74' : c === '#dc2626' ? '220,38,38' : '124,58,237'},.06);border-color:rgba(${c === '#2874B2' ? '40,116,178' : c === '#d97706' ? '217,119,6' : c === '#16a34a' ? '22,163,74' : c === '#dc2626' ? '220,38,38' : '124,58,237'},.2)}
.ref-section{border-top:1px solid rgba(10,37,64,.08);margin-top:56px;padding-top:32px}
.ref-label{font-family:'JetBrains Mono Variable',monospace;font-size:9px;letter-spacing:2.5px;text-transform:uppercase;color:rgba(10,37,64,.38);margin-bottom:16px}
.ref-list,.ref-section ol{list-style:none;padding:0;counter-reset:ref-counter}
.ref-list li,.ref-section ol li{font-size:13px;color:rgba(10,37,64,.5);line-height:1.6;margin-bottom:8px;padding-left:2em;position:relative;counter-increment:ref-counter}
.ref-list li::before,.ref-section ol li::before{content:counter(ref-counter) ".";position:absolute;left:0;color:${c};font-family:'JetBrains Mono Variable',monospace;font-size:11px}
.author-card{background:#fff;border:1px solid rgba(10,37,64,.07);border-radius:12px;padding:24px;display:flex;align-items:center;gap:20px;margin:40px 0;box-shadow:0 2px 12px rgba(10,37,64,.06)}
.author-img{width:64px;height:64px;border-radius:50%;object-fit:cover;object-position:top;border:2px solid rgba(40,116,178,.2);flex-shrink:0}
.author-name{font-family:'Sora Variable',Sora,sans-serif;font-size:1rem;font-weight:400;color:#0a2540;margin-bottom:3px}
.author-role{font-family:'JetBrains Mono Variable',monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:${c}}
.cta-post{background:linear-gradient(135deg,#0f3d72,#06193a);border-radius:12px;padding:36px;text-align:center;margin:40px 0}
.btn-p{display:inline-flex;align-items:center;gap:8px;font-family:'JetBrains Mono Variable',monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#fff;background:${c};border:none;border-radius:6px;padding:13px 26px;cursor:pointer;text-decoration:none;transition:opacity .2s,transform .15s;box-shadow:0 4px 16px ${c}55}
.btn-p:hover{opacity:.88;transform:translateY(-2px)}
.btn-o{display:inline-flex;align-items:center;gap:8px;font-family:'JetBrains Mono Variable',monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,.65);background:transparent;border:1.5px solid rgba(255,255,255,.2);border-radius:6px;padding:13px 26px;cursor:pointer;text-decoration:none;transition:color .2s,border-color .2s}
.btn-o:hover{color:#fff;border-color:rgba(255,255,255,.5)}
#foot{background:linear-gradient(180deg,#1e4f84 0%,#102d56 18%,#071e38 52%,#051728 100%);padding:44px 80px;border-top:1px solid rgba(40,116,178,.15);position:relative;overflow:hidden}
#foot::after{content:'';position:absolute;top:0;left:0;right:0;height:220px;background:radial-gradient(ellipse 90% 100% at 50% 0%,rgba(40,116,178,.55) 0%,rgba(40,116,178,.22) 40%,transparent 70%);pointer-events:none;z-index:0;animation:foot-top-pulse 6s ease-in-out infinite}
@keyframes foot-top-pulse{0%,100%{opacity:.75}50%{opacity:1}}
.foot-inner{display:flex;justify-content:space-between;align-items:center;margin-bottom:26px;position:relative;z-index:1}
.foot-bottom{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;position:relative;z-index:1}
.ft-soc-link{color:rgba(255,255,255,.35);transition:color .2s,transform .2s;display:flex}
.ft-soc-link:hover{color:#2874B2;transform:translateY(-2px)}
.ft-social{display:flex;gap:16px;align-items:center}
.rv{opacity:0;transform:translateY(20px);transition:opacity .7s cubic-bezier(.22,1,.36,1),transform .7s cubic-bezier(.22,1,.36,1)}
.rv.on{opacity:1;transform:none}
@media(max-width:768px){
  #nav{padding:14px 20px}.nav-links{display:none}.ham-btn{display:flex}
  .hero-post-inner{padding-left:20px;padding-right:20px}
  #article-body{padding-left:20px;padding-right:20px}
  #foot{padding:28px 20px}
}`;
}

function buildHTML(p, articleHTML, refsHTML) {
  const css = buildCSS(p.catColor);
  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${p.title} — ZYT Akademi</title>
<meta name="description" content="${p.metaDesc}">
<link rel="canonical" href="${p.url}">
<meta property="og:type" content="article">
<meta property="og:title" content="${p.title}">
<meta property="og:description" content="${p.metaDesc}">
<meta property="og:image" content="${p.cover}">
<meta property="og:url" content="${p.url}">
<meta property="article:published_time" content="${p.isoDate}">
<meta property="article:author" content="Mira">
<meta property="article:section" content="${p.label}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${p.title}">
<meta name="twitter:description" content="${p.metaDesc}">
<meta name="twitter:image" content="${p.cover}">
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"BlogPosting","headline":${JSON.stringify(p.title)},"datePublished":"${p.isoDate}","author":{"@type":"Person","name":"Mira","jobTitle":"ZYT Global Industry AI Editörü"},"publisher":{"@type":"Organization","name":"ZYT Global Industry","url":"https://www.zytindustry.com"},"mainEntityOfPage":{"@type":"WebPage","@id":"${p.url}"},"image":"${p.cover}","description":${JSON.stringify(p.metaDesc)}}
</script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource-variable/sora@5.0.21/index.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource-variable/manrope@5.0.20/index.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource-variable/jetbrains-mono@5.0.21/index.css">
<script src="https://cdn.tailwindcss.com"></script>
<style>${css}</style>
</head>
<body>
<div id="scroll-prog"></div>

<nav id="nav">
  <a href="../index.html" class="nav-logo">
    <svg width="58" height="22" viewBox="140 65 400 120" xmlns="http://www.w3.org/2000/svg">
      <path d="M150,70 L250,70 L260,80 L260,86 L180,164 L260,164 L260,180 L160,180 L150,170 L150,164 L158,164 L238,86 L150,86 Z" fill="#0a2540"/>
      <path d="M285,76 L291,70 L303,70 L336,122 L344,122 L377,70 L389,70 L395,76 L348,130 L348,180 L332,180 L332,130 Z" fill="${p.catColor}"/>
      <path d="M420,80 L430,70 L520,70 L530,80 L530,86 L483,86 L483,180 L467,180 L467,86 L420,86 Z" fill="#0a2540"/>
    </svg>
    <div style="border-left:1px solid rgba(10,37,64,.14);padding-left:12px">
      <div style="font-family:'JetBrains Mono Variable',monospace;font-size:7.5px;letter-spacing:2px;color:rgba(10,37,64,.4);text-transform:uppercase;line-height:1.8">Global</div>
      <div style="font-family:'JetBrains Mono Variable',monospace;font-size:7.5px;letter-spacing:2px;color:rgba(10,37,64,.4);text-transform:uppercase;line-height:1.8">Industry</div>
    </div>
  </a>
  <div class="nav-links">
    <a href="../akademi.html" class="nav-link active">Akademi</a>
    <a href="../${p.page}" class="nav-link">${p.label}</a>
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
  <div style="font-family:'JetBrains Mono Variable',monospace;font-size:9px;letter-spacing:3px;color:${p.catColor};text-transform:uppercase;margin-bottom:20px">ZYT Global Industry</div>
  <a href="../akademi.html" class="mob-link" style="color:${p.catColor}">Akademi</a>
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
    <div class="post-cat">${p.label}</div>
    <h1 class="post-title">${p.title}</h1>
    <div class="post-meta">
      <span>${p.dateTR}</span>
      <span class="post-meta-sep"></span>
      <span>${p.reading_time} dakika okuma</span>
      <span class="post-meta-sep"></span>
      <span>Mira · ZYT Akademi</span>
    </div>
    <img src="${p.cover}" alt="${p.title}" class="cover-img" loading="eager">
  </div>
</section>

<div id="article-body">
  <article class="article-content rv">
    ${articleHTML}
  </article>

  ${refsHTML ? `<div class="ref-section rv">
    <div class="ref-label">Kaynaklar</div>
    ${refsHTML}
  </div>` : ''}

  <div class="author-card rv">
    <img src="../ZYT-mira/Mira.png" alt="Mira" class="author-img">
    <div>
      <div class="author-name">Mira</div>
      <div class="author-role">ZYT Global Industry AI Editörü</div>
      <div style="font-size:13px;color:rgba(10,37,64,.5);margin-top:6px;line-height:1.6">Sektör haberlerini, akademik yayınları ve standart güncellemelerini ZYT Akademi için analiz eden yapay zeka editörü.</div>
    </div>
  </div>

  <div class="cta-post rv">
    <div style="font-family:'JetBrains Mono Variable',monospace;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,.4);margin-bottom:12px">${p.label}</div>
    <h2 style="font-family:'Sora Variable',Sora,sans-serif;font-size:1.6rem;font-weight:300;color:#fff;letter-spacing:-.02em;margin-bottom:10px">Projeniz için görüşelim.</h2>
    <p style="color:rgba(255,255,255,.45);font-size:14px;margin-bottom:24px">Uzman ekibimiz teknik ihtiyaçlarınızı dinlemeye hazır.</p>
    <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
      <a href="../iletisim.html" class="btn-p">Teklif Al →</a>
      <a href="../${p.page}" class="btn-o">${p.label} →</a>
    </div>
  </div>
</div>

<footer id="foot">
  <div style="max-width:1160px;margin:0 auto">
    <div class="foot-inner">
      <a href="../index.html" style="text-decoration:none;display:flex;align-items:center;gap:13px">
        <svg width="50" viewBox="140 60 400 130" xmlns="http://www.w3.org/2000/svg">
          <path d="M150,70 L250,70 L260,80 L260,86 L180,164 L260,164 L260,180 L160,180 L150,170 L150,164 L158,164 L238,86 L150,86 Z" fill="#fff"/>
          <path d="M285,76 L291,70 L303,70 L336,122 L344,122 L377,70 L389,70 L395,76 L348,130 L348,180 L332,180 L332,130 Z" fill="${p.catColor}"/>
          <path d="M420,80 L430,70 L520,70 L530,80 L530,86 L483,86 L483,180 L467,180 L467,86 L420,86 Z" fill="#fff"/>
        </svg>
        <span style="font-family:'JetBrains Mono Variable',monospace;font-size:10px;letter-spacing:2.5px;color:rgba(255,255,255,.38);text-transform:uppercase">ZYT Global Industry</span>
      </a>
      <a href="../akademi.html" style="font-family:'JetBrains Mono Variable',monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,.35);text-decoration:none;border:1px solid rgba(255,255,255,.1);border-radius:3px;padding:6px 12px;transition:color .15s,border-color .15s" onmouseover="this.style.color='#fff';this.style.borderColor='rgba(40,116,178,.5)'" onmouseout="this.style.color='rgba(255,255,255,.35)';this.style.borderColor='rgba(255,255,255,.1)'">← Tüm Yazılar</a>
      <div class="ft-social">
        <a href="https://linkedin.com/company/zyt-global-industry" class="ft-soc-link" aria-label="LinkedIn" target="_blank" rel="noopener"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>
        <a href="https://youtube.com/@zytglobalindustry" class="ft-soc-link" aria-label="YouTube" target="_blank" rel="noopener"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></a>
        <a href="https://instagram.com/zytglobalindustry" class="ft-soc-link" aria-label="Instagram" target="_blank" rel="noopener"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg></a>
      </div>
    </div>
    <div style="height:1px;background:linear-gradient(to right,transparent,rgba(40,116,178,.18),transparent);margin-bottom:20px;position:relative;z-index:1"></div>
    <div class="foot-bottom">
      <span style="font-family:'JetBrains Mono Variable',monospace;font-size:9px;letter-spacing:1.5px;color:rgba(255,255,255,.18);text-transform:uppercase">© 2026 ZYT Global Industry Grubu — Tüm Hakları Saklıdır</span>
      <span style="font-family:'JetBrains Mono Variable',monospace;font-size:9px;letter-spacing:1.5px;color:rgba(255,255,255,.18);text-transform:uppercase">Ankara · Türkiye</span>
    </div>
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

// ─── Content extractors ───────────────────────────────────────────────────────

function extractArticle(html) {
  // Try <article ...>...</article>
  let m = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  if (m) return m[1].trim();
  // Try div.article-content
  m = html.match(/<div[^>]*class="[^"]*article-content[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(?=<div class="ref-section|<div class="author-card|<div class="cta-post|<div class="cta-band|<\/div>\s*<\/div>\s*<footer)/i);
  if (m) return m[1].trim();
  // Fallback: everything between <section> and ref-section
  m = html.match(/class="article-content[^"]*"[^>]*>([\s\S]*?)(?=<div class="ref-section|<div class="author-card)/i);
  if (m) return m[1].trim();
  return '';
}

function extractRefs(html) {
  // Look for ol.ref-list or div.ref-section content
  let m = html.match(/<div class="ref-section[^"]*"[^>]*>[\s\S]*?<div class="ref-label[^"]*">[^<]*<\/div>([\s\S]*?)<\/div>\s*<div class="author-card/i);
  if (m) return m[1].trim();
  // Try to find ol.ref-list
  m = html.match(/(<ol class="ref-list"[\s\S]*?<\/ol>)/i);
  if (m) return m[1];
  // Try numbered list after "Kaynaklar" label
  m = html.match(/Kaynaklar<\/div>([\s\S]*?)(?=<div class="author-card|<\/div>\s*<div class="cta)/i);
  if (m) return m[1].trim();
  return '';
}

// ─── Run migration ────────────────────────────────────────────────────────────

let ok = 0, fail = 0;

for (const post of POSTS) {
  const filePath = path.join(__dirname, post.file);
  try {
    const html = await fs.readFile(filePath, 'utf8');
    const articleHTML = extractArticle(html);
    const refsHTML    = extractRefs(html);

    if (!articleHTML) {
      console.warn(`⚠  ${post.file} — article content bulunamadı, atlanıyor`);
      fail++;
      continue;
    }

    const newHTML = buildHTML(post, articleHTML, refsHTML);
    await fs.writeFile(filePath, newHTML, 'utf8');
    console.log(`✓  ${post.file}`);
    ok++;
  } catch (e) {
    console.error(`✗  ${post.file}: ${e.message}`);
    fail++;
  }
}

console.log(`\nTamamlandı: ${ok} başarılı, ${fail} hatalı.`);
