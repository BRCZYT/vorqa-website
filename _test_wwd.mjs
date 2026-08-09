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
  await new Promise(r => setTimeout(r, 300));
  // real wheel nudges to trigger IntersectionObserver-based .rv AND scrolltrigger reveals
  for (let i = 0; i < 6; i++) { await page.mouse.wheel({ deltaY: 200 }); await new Promise(r => setTimeout(r, 150)); }
  await new Promise(r => setTimeout(r, 900));

  const info = await page.evaluate(() => {
    const svc = document.querySelector('#services');
    const mark = svc.querySelector('.wwd-mark');
    const rows = Array.from(svc.querySelectorAll('.wwd-row'));
    return {
      bg: getComputedStyle(svc).backgroundImage.slice(0, 60),
      markColor: getComputedStyle(mark).color,
      markStroke: getComputedStyle(mark).webkitTextStrokeColor,
      rows: rows.map(r => ({
        opacity: getComputedStyle(r).opacity,
        flexDirection: getComputedStyle(r).flexDirection,
        h3Color: getComputedStyle(r.querySelector('h3')).color,
      })),
    };
  });
  console.log(`\n[${outName}] bg:`, info.bg);
  console.log('mark color/stroke:', info.markColor, info.markStroke);
  console.log('rows:', JSON.stringify(info.rows, null, 0));
  console.log('console errors:', consoleErrors);

  await page.screenshot({ path: `temporary screenshots/${outName}.png`, fullPage: false });
  await page.close();
}

await test(1440, 1000, 'wwd-desktop');
await test(375, 1200, 'wwd-mobile');

await browser.close();
