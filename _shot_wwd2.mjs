import puppeteer from 'puppeteer';
const browser = await puppeteer.launch({ headless: 'new' });

async function test(width, height, outName) {
  const page = await browser.newPage();
  await page.setViewport({ width, height });
  const consoleErrors = [];
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', (err) => consoleErrors.push(err.message));
  await page.goto('http://localhost:3000/en/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  await page.evaluate(() => document.querySelector('#services').scrollIntoView({ block: 'start' }));
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: `temporary screenshots/${outName}.png`, fullPage: false });
  console.log(`[${outName}] console errors:`, consoleErrors);
  await page.close();
}

await test(1440, 1000, 'wwd-desktop2');
await test(375, 1400, 'wwd-mobile2');

await browser.close();
