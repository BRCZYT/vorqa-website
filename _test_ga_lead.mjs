import puppeteer from 'puppeteer';

const pages = [
  { url: '/tr/iletisim/index.html', lang: 'tr' },
  { url: '/en/contact/index.html', lang: 'en' },
  { url: '/ar/contact/index.html', lang: 'ar' },
];

const browser = await puppeteer.launch();
let failures = 0;

async function run(pageInfo, mode) {
  const page = await browser.newPage();
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error' && !msg.text().includes('Failed to load resource')) errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.message));

  // Intercept the Formspree POST and respond per mode; let everything else through.
  await page.setRequestInterception(true);
  page.on('request', req => {
    if (req.url().includes('formspree.io') && req.method() === 'POST') {
      const headers = { 'access-control-allow-origin': '*', 'content-type': 'application/json' };
      if (mode === 'success') {
        req.respond({ status: 200, headers, body: JSON.stringify({ ok: true }) });
      } else {
        req.respond({ status: 500, headers, body: JSON.stringify({ ok: false }) });
      }
    } else {
      req.continue();
    }
  });

  await page.goto('http://localhost:3000' + pageInfo.url, { waitUntil: 'networkidle0', timeout: 30000 });

  // Fill minimal required fields so the native form doesn't block submit.
  await page.evaluate(() => {
    const form = document.getElementById('contact-form');
    form.querySelectorAll('[required]').forEach(el => {
      if (el.tagName === 'SELECT') { if (el.options.length > 1) el.selectedIndex = 1; }
      else if (el.type === 'email') el.value = 'test@example.com';
      else if (el.type === 'tel') el.value = '+900000000000';
      else el.value = 'Test';
    });
  });

  await page.click('#contact-form button[type="submit"]');
  await new Promise(r => setTimeout(r, 700));

  const result = await page.evaluate(() => {
    const dl = window.dataLayer || [];
    const leadEvents = dl.filter(args => args[0] === 'event' && args[1] === 'generate_lead');
    const successVisible = getComputedStyle(document.getElementById('form-success')).display !== 'none';
    const errorVisible = getComputedStyle(document.getElementById('form-error')).display !== 'none';
    return { leadEvents, successVisible, errorVisible, gtagIsFn: typeof window.gtag === 'function' };
  });

  await page.close();
  return { errors, result };
}

for (const p of pages) {
  const { errors, result } = await run(p, 'success');
  const params = result.leadEvents[0] ? result.leadEvents[0][2] : null;
  const paramKeys = params ? Object.keys(params).sort().join(',') : '';
  const ok = result.leadEvents.length === 1
    && params && params.form_name === 'contact_form' && params.page_language === p.lang
    && paramKeys === 'form_name,page_language'
    && result.successVisible && !result.errorVisible
    && errors.length === 0;
  console.log(`${ok ? 'OK ' : 'FAIL'} [SUCCESS] ${p.url} leadEvents=${result.leadEvents.length} params=${JSON.stringify(params)} successVisible=${result.successVisible} errors=${errors.length}`);
  if (!ok) { failures++; errors.forEach(e => console.log('   ' + e)); }
}

for (const p of pages) {
  const { errors, result } = await run(p, 'fail');
  const ok = result.leadEvents.length === 0 && !result.successVisible && result.errorVisible && errors.length === 0;
  console.log(`${ok ? 'OK ' : 'FAIL'} [FAILURE] ${p.url} leadEvents=${result.leadEvents.length} errorVisible=${result.errorVisible} errors=${errors.length}`);
  if (!ok) { failures++; errors.forEach(e => console.log('   ' + e)); }
}

await browser.close();
console.log(failures === 0 ? 'ALL PASS' : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
