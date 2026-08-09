import puppeteer from 'puppeteer';
const browser = await puppeteer.launch({ headless: 'new' });

async function run(width, label) {
  const page = await browser.newPage();
  await page.setViewport({ width, height: 900 });
  const consoleErrors = [];
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', (err) => consoleErrors.push(err.message));
  await page.goto('http://localhost:3000/en/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));
  await page.evaluate(() => document.querySelector('#industries').scrollIntoView({ block: 'start' }));
  await new Promise(r => setTimeout(r, 1200));

  const clip = await page.evaluate(() => {
    const rail = document.querySelector('.ind-rail');
    const r = rail.getBoundingClientRect();
    return { x: Math.max(0, r.x), y: Math.max(0, r.y), width: Math.min(window.innerWidth, r.width), height: r.height };
  });

  await page.screenshot({ path: `_shot_${label}_0_before.png`, clip });

  const box = await page.$eval('.ind-panel', el => { const r = el.getBoundingClientRect(); return { x: r.x + 40, y: r.y + r.height / 2 }; });
  // move in small steps to genuinely trigger mousemove/hover chain
  await page.mouse.move(box.x - 100, box.y, { steps: 5 });
  await page.mouse.move(box.x, box.y, { steps: 10 });

  await new Promise(r => setTimeout(r, 120));
  await page.screenshot({ path: `_shot_${label}_1_120ms.png`, clip });

  await new Promise(r => setTimeout(r, 250));
  await page.screenshot({ path: `_shot_${label}_2_370ms.png`, clip });

  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: `_shot_${label}_3_770ms.png`, clip });

  console.log(`[${label}] console errors:`, consoleErrors);
  await page.close();
}

await run(1440, 'desktop');
await run(375, 'mobile');
await browser.close();
