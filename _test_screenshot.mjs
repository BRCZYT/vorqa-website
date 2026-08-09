import puppeteer from 'puppeteer';
const browser = await puppeteer.launch({ headless: 'new' });

async function shot(page, path) {
  const clip = await page.evaluate(() => {
    const rail = document.querySelector('.ind-rail');
    const r = rail.getBoundingClientRect();
    return { x: r.x, y: r.y + window.scrollY, width: r.width, height: r.height };
  });
  await page.screenshot({ path, clip });
}

async function run(width, height, wheelCount, wheelDelta, label) {
  const page = await browser.newPage();
  await page.setViewport({ width, height });
  const consoleErrors = [];
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', (err) => consoleErrors.push(err.message));
  await page.goto('http://localhost:3000/en/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 3500));

  for (let i = 0; i < wheelCount; i++) {
    await page.mouse.wheel({ deltaY: wheelDelta });
    await new Promise(r => setTimeout(r, 150));
  }
  await new Promise(r => setTimeout(r, 1200));

  await shot(page, `_shot_${label}_0_before.png`);

  const box = await page.$eval('.ind-panel', el => { const r = el.getBoundingClientRect(); return { x: r.x + 40, y: r.y + r.height / 2 }; });
  await page.mouse.move(box.x - 150, box.y, { steps: 5 });
  await page.mouse.move(box.x, box.y, { steps: 12 });

  await new Promise(r => setTimeout(r, 120));
  await shot(page, `_shot_${label}_1_120ms.png`);

  await new Promise(r => setTimeout(r, 250));
  await shot(page, `_shot_${label}_2_370ms.png`);

  await new Promise(r => setTimeout(r, 400));
  await shot(page, `_shot_${label}_3_770ms.png`);

  const hoverInfo = await page.evaluate(() => {
    const p = document.querySelectorAll('.ind-panel')[0];
    return { matches: p.matches(':hover'), flexBasis: getComputedStyle(p).flexBasis, width: p.getBoundingClientRect().width };
  });
  console.log(`[${label}] hoverInfo:`, hoverInfo);

  const railScrollWidth = await page.evaluate(() => document.querySelector('.ind-rail').scrollWidth);
  console.log(`[${label}] rail scrollWidth after hover:`, railScrollWidth);
  console.log(`[${label}] console errors:`, consoleErrors);
  await page.close();
}

await run(1440, 900, 6, 600, 'desktop');
await run(375, 800, 10, 500, 'mobile');
await browser.close();
