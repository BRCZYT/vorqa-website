import puppeteer from 'puppeteer';
const browser = await puppeteer.launch({ headless: 'new' });

async function shootFull(path, outName, lang) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000' + path, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));
  for (let i = 0; i < 40; i++) {
    await page.mouse.wheel({ deltaY: 600 });
    await new Promise(r => setTimeout(r, 130));
    const atBottom = await page.evaluate(() => window.scrollY + window.innerHeight >= document.body.scrollHeight - 5);
    if (atBottom) break;
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: `temporary screenshots/${outName}`, fullPage: true });
  await page.close();
  console.log('saved', outName);
}

await shootFull('/en/', 'redesign-en.png', 'en');
await shootFull('/ar/', 'redesign-ar.png', 'ar');

await browser.close();
