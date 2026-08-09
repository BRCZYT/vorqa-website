import puppeteer from 'puppeteer';
const browser = await puppeteer.launch({ headless: 'new' });

async function shoot(width, height, lang, outName) {
  const page = await browser.newPage();
  await page.setViewport({ width, height });
  await page.goto(`http://localhost:3000/${lang}/`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2500));
  await page.evaluate(() => document.querySelector('#showroom-how').scrollIntoView());
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: `temporary screenshots/${outName}` });
  await page.close();
}

await shoot(375, 812, 'en', 'resp-mobile-375.png');
await shoot(800, 900, 'en', 'resp-tablet-800.png');
await shoot(1440, 900, 'ar', 'resp-desktop-ar.png');

await browser.close();
