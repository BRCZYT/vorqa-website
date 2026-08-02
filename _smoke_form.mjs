import puppeteer from 'puppeteer';
const browser = await puppeteer.launch();
const page = await browser.newPage();
const errors = [];
page.on('pageerror', e => errors.push('pageerror: ' + e.message));
page.on('response', r => { if (r.status() >= 400 && !r.url().includes('favicon')) errors.push(r.status() + ' ' + r.url()); });

for (const path of ['/tr/iletisim/', '/en/contact/', '/ar/contact/']) {
  const resp = await page.goto(`http://localhost:3000${path}`, { waitUntil: 'networkidle0' });
  const hasFile = await page.$('input[type="file"]') !== null;
  const noteText = await page.$eval('#contact-form p', el => el.textContent.trim()).catch(() => 'NOT FOUND');
  const enctype = await page.$eval('#contact-form', el => el.getAttribute('enctype'));
  const action = await page.$eval('#contact-form', el => el.getAttribute('action'));
  console.log(path, '-> status:', resp.status(), '| fileInput present:', hasFile, '| note:', noteText.slice(0,60), '| enctype:', enctype, '| action:', action);
}
console.log('errors:', errors.length ? errors.join(', ') : 'none');
await browser.close();
