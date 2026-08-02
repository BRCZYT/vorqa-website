import puppeteer from 'puppeteer';

const pages = [
  { lang: 'tr', path: '/tr/iletisim/', name: 'Test Kullanıcı (TR, no-file, post-fix)' },
  { lang: 'en', path: '/en/contact/', name: 'Test User (EN, no-file, post-fix)' },
  { lang: 'ar', path: '/ar/contact/', name: 'Test User (AR, no-file, post-fix)' },
];

const browser = await puppeteer.launch();

for (const { lang, path, name } of pages) {
  const page = await browser.newPage();
  const consoleErrors = [];
  const networkResults = [];
  page.on('pageerror', e => consoleErrors.push('pageerror: ' + e.message));
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push('console: ' + msg.text()); });
  page.on('response', async r => {
    if (r.status() >= 400 && !r.url().includes('favicon')) consoleErrors.push(`network ${r.status()}: ${r.url()}`);
    if (r.url().includes('formspree.io')) {
      let bodyText = '';
      try { bodyText = await r.text(); } catch {}
      networkResults.push({ url: r.url(), status: r.status(), body: bodyText.slice(0, 300) });
    }
  });

  await page.goto(`https://zyt-website.vercel.app${path}`, { waitUntil: 'networkidle0', timeout: 30000 });

  const hasFileInput = await page.$('input[type="file"]') !== null;

  await page.type('input[name="name"]', name);
  await page.type('input[name="company"]', 'Claude Code Automated Test (file field removed)');
  await page.type('input[name="email"]', 'automated-test@example.com');
  await page.type('input[name="phone"]', '+90 500 000 00 00');
  await page.type('input[name="country"]', 'Test');
  await page.type('textarea[name="message"]', `AUTOMATED TEST (${lang}) — verifying form works correctly after removing the file upload field. Please disregard.`);

  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 3000));

  const successVisible = await page.$eval('#form-success', el => getComputedStyle(el).display !== 'none').catch(() => false);
  const errorVisible = await page.$eval('#form-error', el => getComputedStyle(el).display !== 'none').catch(() => false);

  console.log(`\n=== ${lang.toUpperCase()} (${path}) ===`);
  console.log('file input still present:', hasFileInput);
  console.log('Formspree network responses:', JSON.stringify(networkResults, null, 2));
  console.log('Success box visible:', successVisible, '| Error box visible:', errorVisible);
  console.log('Console/page/network errors:', consoleErrors.length ? consoleErrors.join(' | ') : 'none');

  await page.close();
}

await browser.close();
