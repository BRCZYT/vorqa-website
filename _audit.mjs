import puppeteer from 'puppeteer';
import http from 'http';
import https from 'https';
import { URL } from 'url';

const BASE = 'http://localhost:3000';
const PAGES = ['/tr/', '/en/', '/ar/', '/tr/akademi/', '/en/academy/', '/ar/academy/', '/tr/iletisim/', '/en/contact/', '/ar/contact/'];

const linkStatusCache = new Map();
function checkUrl(url) {
  if (linkStatusCache.has(url)) return linkStatusCache.get(url);
  const p = new Promise((resolve) => {
    try {
      const u = new URL(url);
      const lib = u.protocol === 'https:' ? https : http;
      const req = lib.request(url, { method: 'HEAD', timeout: 10000 }, (res) => {
        resolve(res.statusCode);
        res.resume();
      });
      req.on('error', (e) => resolve('ERR:' + e.message));
      req.on('timeout', () => { req.destroy(); resolve('TIMEOUT'); });
      req.end();
    } catch (e) { resolve('ERR:' + e.message); }
  });
  linkStatusCache.set(url, p);
  return p;
}

const browser = await puppeteer.launch({ headless: 'new' });
const allFindings = {};

for (const p of PAGES) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  const consoleErrors = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', e => consoleErrors.push('pageerror: ' + e.message));
  await page.goto(BASE + p, { waitUntil: 'networkidle0', timeout: 45000 });
  await new Promise(r => setTimeout(r, 1500));

  const data = await page.evaluate(() => {
    const out = {};
    out.title = document.title;
    out.metaDesc = document.querySelector('meta[name="description"]')?.content || null;
    out.canonical = document.querySelector('link[rel="canonical"]')?.href || null;
    out.ogTitle = document.querySelector('meta[property="og:title"]')?.content || null;
    out.ogDesc = document.querySelector('meta[property="og:description"]')?.content || null;
    out.ogImage = document.querySelector('meta[property="og:image"]')?.content || null;
    out.ogUrl = document.querySelector('meta[property="og:url"]')?.content || null;
    out.hreflangs = [...document.querySelectorAll('link[rel="alternate"][hreflang]')].map(l => l.hreflang + '=>' + l.href);
    out.htmlLang = document.documentElement.getAttribute('lang');
    out.htmlDir = document.documentElement.getAttribute('dir');
    out.h1s = [...document.querySelectorAll('h1')].map(h => h.textContent.trim());
    out.jsonLdRaw = [...document.querySelectorAll('script[type="application/ld+json"]')].map(s => s.textContent);

    // images
    out.imgsNoAlt = [...document.querySelectorAll('img')].filter(img => !img.hasAttribute('alt')).map(img => img.src);
    out.imgsBroken = [...document.querySelectorAll('img')].filter(img => img.complete && img.naturalWidth === 0).map(img => img.src);

    // links
    out.links = [...document.querySelectorAll('a[href]')].map(a => ({
      href: a.href, text: a.textContent.trim().slice(0, 40), target: a.target, rel: a.rel
    }));

    // buttons without handler-looking attributes (heuristic: buttons that aren't type=submit and have no onclick and no obvious JS class hook)
    out.buttons = [...document.querySelectorAll('button')].map(b => ({
      text: b.textContent.trim().slice(0, 40), type: b.type, id: b.id, cls: b.className, hasOnclick: b.hasAttribute('onclick')
    }));

    // forms
    out.forms = [...document.querySelectorAll('form')].map(f => ({ action: f.action, method: f.method }));

    return out;
  });

  data.consoleErrors = consoleErrors;
  allFindings[p] = data;
  await page.close();
  console.log('crawled', p);
}
await browser.close();

// Now check all unique links (internal + external) for status
const allLinks = new Set();
for (const p of PAGES) {
  for (const l of allFindings[p].links) allLinks.add(l.href);
}
console.log('\nChecking', allLinks.size, 'unique links...');
const results = {};
for (const link of allLinks) {
  if (link.startsWith('javascript:') || link === '') continue;
  results[link] = await checkUrl(link);
}

import fs from 'fs';
fs.writeFileSync('_audit_output.json', JSON.stringify({ pages: allFindings, linkStatus: Object.fromEntries(Object.entries(results).map(([k,v])=>[k, v])) }, null, 1));
// resolve promises in linkStatus
const resolved = {};
for (const [k, v] of Object.entries(results)) resolved[k] = await v;
fs.writeFileSync('_audit_output.json', JSON.stringify({ pages: allFindings, linkStatus: resolved }, null, 1));
console.log('done, wrote _audit_output.json');
