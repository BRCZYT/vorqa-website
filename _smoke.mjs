import puppeteer from 'puppeteer';
const browser = await puppeteer.launch();
const page = await browser.newPage();
const errors = [];
page.on('pageerror', e => errors.push('pageerror: ' + e.message));
page.on('console', msg => { if (msg.type() === 'error') errors.push('console: ' + msg.text()); });
page.on('response', r => { if (r.status() >= 400) errors.push(r.status() + ' ' + r.url()); });

await page.setViewport({ width: 1400, height: 1000 });
await page.goto('http://localhost:3000/index.html', { waitUntil: 'networkidle0', timeout: 30000 });
await new Promise(r=>setTimeout(r,3500)); // let preloader finish

console.log('=== ERRORS ===');
console.log(errors.length ? errors.join('\n') : 'none');

await page.screenshot({ path: '_smoke_en.png', fullPage: true });

// switch to EN and AR via lang buttons, check text
for (const lang of ['en','ar']) {
  await page.click(`.l-btn[data-lang="${lang}"]`);
  await new Promise(r=>setTimeout(r,300));
  const h1 = await page.$eval('.hero-h1', el => el.textContent.trim());
  console.log(lang, 'hero h1:', h1.slice(0,60));
}

await browser.close();
