import puppeteer from 'puppeteer';

const BASE = 'https://zyt-website.vercel.app';
const browser = await puppeteer.launch();
const page = await browser.newPage();
page.setDefaultNavigationTimeout(30000);

async function checkRedirect(path, expectContains) {
  const resp = await page.goto(BASE + path, { waitUntil: 'networkidle0' });
  const finalUrl = page.url();
  const ok = finalUrl.includes(expectContains);
  console.log(`${ok ? 'OK ' : 'FAIL'} ${path} -> ${finalUrl} (status ${resp.status()})`);
}

console.log('=== Old page redirects (should land on /tr/) ===');
for (const p of ['/hakkimizda.html', '/beton.html', '/galvaniz.html', '/enerji.html', '/celik-yapi-mekanik-imalat.html', '/tedarik-zinciri.html', '/referanslar.html', '/belgelerimiz.html', '/atik-donusum.html']) {
  await checkRedirect(p, '/tr/');
}
console.log('=== Kept redirects ===');
await checkRedirect('/akademi.html', '/tr/akademi/');
await checkRedirect('/iletisim.html', '/tr/iletisim/');
await checkRedirect('/', '/en/');

console.log('=== Core pages live ===');
const errors = [];
page.on('response', r => { if (r.status() >= 400) errors.push(r.status() + ' ' + r.url()); });
for (const p of ['/tr/', '/en/', '/ar/', '/tr/akademi/', '/en/academy/', '/ar/academy/', '/tr/iletisim/', '/en/contact/', '/ar/contact/']) {
  const resp = await page.goto(BASE + p, { waitUntil: 'networkidle0' });
  console.log(p, '->', resp.status());
}
console.log('=== errors on core pages ===', errors.length ? errors.join('\n') : 'none');

await browser.close();
