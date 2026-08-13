import puppeteer from 'puppeteer';
const browser = await puppeteer.launch({ headless: 'new' });
const PAGES = ['/tr/', '/en/', '/ar/', '/tr/akademi/', '/en/academy/', '/ar/academy/', '/tr/iletisim/', '/en/contact/', '/ar/contact/'];

for (const p of PAGES) {
  const page = await browser.newPage();
  await page.goto('http://localhost:3000' + p, { waitUntil: 'networkidle0', timeout: 45000 });
  await new Promise(r => setTimeout(r, 800));
  const data = await page.evaluate(() => {
    const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(h => h.tagName + ': ' + h.textContent.trim().slice(0, 50));
    const emptyAlt = [...document.querySelectorAll('img[alt=""]')].map(img => img.src);
    const genericAlt = [...document.querySelectorAll('img')].filter(img => /^(image|img|photo|picture)\d*$/i.test(img.alt.trim())).map(img => img.src);
    return { headings, emptyAlt, genericAlt };
  });
  console.log(`\n=== ${p} ===`);
  console.log(data.headings.join('\n'));
  console.log('empty alt (decorative, OK if truly decorative):', data.emptyAlt.length);
  console.log('generic/placeholder alt text:', data.genericAlt);
  await page.close();
}
await browser.close();
