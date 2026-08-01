import puppeteer from 'puppeteer';
const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.setViewport({ width: 1400, height: 1000 });
await page.goto('http://localhost:3000/tr/iletisim/', { waitUntil: 'networkidle0' });
for (let i = 0; i < 20; i++) {
  await page.mouse.wheel({ deltaY: 300 });
  await new Promise(r=>setTimeout(r,80));
}
await new Promise(r=>setTimeout(r,800));
await page.screenshot({ path: '_contact_full.png', fullPage: true });
await browser.close();
