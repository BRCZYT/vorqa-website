import puppeteer from 'puppeteer';

const pages = [
  { lang: 'tr', path: '/tr/iletisim/', name: 'Test Kullanıcı (TR, no-file)' },
  { lang: 'en', path: '/en/contact/', name: 'Test User (EN, no-file)' },
  { lang: 'ar', path: '/ar/contact/', name: 'Test User (AR, no-file)' },
];

const browser = await puppeteer.launch();

for (const { lang, path, name } of pages) {
  const page = await browser.newPage();
  const consoleErrors = [];
  const networkResults = [];
  page.on('pageerror', e => consoleErrors.push('pageerror: ' + e.message));
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push('console: ' + msg.text()); });
  page.on('response', async r => {
    if (r.url().includes('formspree.io')) {
      let bodyText = '';
      try { bodyText = await r.text(); } catch {}
      networkResults.push({ url: r.url(), status: r.status(), body: bodyText.slice(0, 500) });
    }
  });

  await page.goto(`https://zyt-website.vercel.app${path}`, { waitUntil: 'networkidle0', timeout: 30000 });

  await page.type('input[name="name"]', name);
  await page.type('input[name="company"]', 'Claude Code Automated Test (no attachment)');
  await page.type('input[name="email"]', 'automated-test@example.com');
  await page.type('input[name="phone"]', '+90 500 000 00 00');
  await page.type('input[name="country"]', 'Test');
  await page.type('textarea[name="message"]', `AUTOMATED TEST — NO FILE (${lang}) — verifying base Formspree submission succeeds without an attachment. Please disregard.`);

  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 3000));

  const successVisible = await page.$eval('#form-success', el => getComputedStyle(el).display !== 'none').catch(() => false);
  const errorVisible = await page.$eval('#form-error', el => getComputedStyle(el).display !== 'none').catch(() => false);

  console.log(`\n=== ${lang.toUpperCase()} (${path}) — no file ===`);
  console.log('Formspree network responses:', JSON.stringify(networkResults, null, 2));
  console.log('Success box visible:', successVisible, '| Error box visible:', errorVisible);
  console.log('Console/page errors:', consoleErrors.length ? consoleErrors.join(' | ') : 'none');

  await page.close();
}

await browser.close();
