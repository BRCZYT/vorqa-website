import puppeteer from 'puppeteer';
const browser = await puppeteer.launch({ headless: 'new' });

async function run(width, height, wheelCount, wheelDelta, label) {
  const page = await browser.newPage();
  await page.setViewport({ width, height });
  const consoleErrors = [];
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', (err) => consoleErrors.push(err.message));
  await page.goto('http://localhost:3000/en/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));

  for (let i = 0; i < wheelCount; i++) {
    await page.mouse.wheel({ deltaY: wheelDelta });
    await new Promise(r => setTimeout(r, 150));
  }
  await new Promise(r => setTimeout(r, 1200));

  const clip = await page.evaluate(() => {
    const rail = document.querySelector('.ind-rail');
    const r = rail.getBoundingClientRect();
    const top = Math.max(0, r.y);
    const bottom = Math.min(window.innerHeight, r.y + r.height);
    return { x: 0, y: top, width: window.innerWidth, height: Math.max(10, bottom - top) };
  });
  console.log(`[${label}] clip:`, clip);

  await page.screenshot({ path: `_shot_${label}_0_before.png`, clip });

  const box = await page.$eval('.ind-panel', el => { const r = el.getBoundingClientRect(); return { x: r.x + 40, y: r.y + r.height / 2 }; });
  await page.mouse.move(box.x - 150, box.y, { steps: 5 });
  await page.mouse.move(box.x, box.y, { steps: 12 });

  await new Promise(r => setTimeout(r, 120));
  await page.screenshot({ path: `_shot_${label}_1_120ms.png`, clip });

  await new Promise(r => setTimeout(r, 250));
  await page.screenshot({ path: `_shot_${label}_2_370ms.png`, clip });

  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: `_shot_${label}_3_770ms.png`, clip });

  const railScrollWidth = await page.evaluate(() => document.querySelector('.ind-rail').scrollWidth);
  console.log(`[${label}] rail scrollWidth after hover:`, railScrollWidth);

  console.log(`[${label}] console errors:`, consoleErrors);
  await page.close();
}

await run(1440, 900, 6, 600, 'desktop');
await run(375, 800, 10, 500, 'mobile');
await browser.close();
