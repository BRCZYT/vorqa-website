import puppeteer from 'puppeteer';
const browser = await puppeteer.launch();
const page = await browser.newPage();
const errors = [];
page.on('pageerror', e => errors.push('pageerror: ' + e.message));
page.on('response', r => { if (r.status() >= 400) errors.push(r.status() + ' ' + r.url()); });

for (const [lang, path] of [['tr','/tr/iletisim/'],['en','/en/contact/'],['ar','/ar/contact/']]) {
  const resp = await page.goto(`http://localhost:3000${path}`, { waitUntil: 'networkidle0', timeout: 30000 });
  const formAction = await page.$eval('#contact-form', el => el.getAttribute('action'));
  const hasFileInput = await page.$('input[type="file"]') !== null;
  const enctype = await page.$eval('#contact-form', el => el.getAttribute('enctype'));
  console.log(`--- ${lang} (${path}) ---`, 'status:', resp.status(), 'action:', formAction, 'enctype:', enctype, 'fileInput:', hasFileInput);
}
console.log('=== ERRORS ===');
console.log(errors.length ? [...new Set(errors)].join('\n') : 'none');
await browser.close();
