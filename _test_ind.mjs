import puppeteer from 'puppeteer';
const browser = await puppeteer.launch({ headless: 'new' });

async function testHoverSmoothness(width, height, wheelCount, wheelDelta, label) {
  const page = await browser.newPage();
  await page.setViewport({ width, height });
  const consoleErrors = [];
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', (err) => consoleErrors.push(err.message));
  await page.goto('http://localhost:3000/en/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 3500)); // preloader clears body.loading at 3130ms

  for (let i = 0; i < wheelCount; i++) {
    await page.mouse.wheel({ deltaY: wheelDelta });
    await new Promise(r => setTimeout(r, 700)); // let Lenis inertia settle between notches
  }
  await new Promise(r => setTimeout(r, 800));

  const box = await page.$eval('.ind-panel', el => { const r = el.getBoundingClientRect(); return { x: r.x + 30, y: r.y + r.height / 2 }; });
  console.log(`[${label}] hover target box:`, box);
  const scrollWidthBefore = await page.evaluate(() => document.querySelector('.ind-rail').scrollWidth);

  await page.mouse.move(box.x - 100, box.y, { steps: 5 });
  await page.mouse.move(box.x, box.y, { steps: 12 });

  const widths = [];
  for (let i = 0; i < 10; i++) {
    const w = await page.evaluate(() => document.querySelectorAll('.ind-panel')[0].getBoundingClientRect().width);
    widths.push(Math.round(w * 10) / 10);
    await new Promise(r => setTimeout(r, 70));
  }
  console.log(`[${label}] width samples during hover (every ~70ms):`, widths);
  const isGradual = new Set(widths).size > 3;
  console.log(`[${label}] gradual (not snap):`, isGradual);

  await page.mouse.move(0, 0);
  await new Promise(r => setTimeout(r, 800));
  const scrollWidthAfter = await page.evaluate(() => document.querySelector('.ind-rail').scrollWidth);
  console.log(`[${label}] rail scrollWidth before/after hover cycle:`, scrollWidthBefore, scrollWidthAfter, scrollWidthBefore === scrollWidthAfter ? '(stable, no jitter)' : '(MISMATCH!)');

  console.log(`[${label}] console errors:`, consoleErrors);
  await page.close();
}

await testHoverSmoothness(1440, 900, 6, 600, 'desktop');
await testHoverSmoothness(375, 800, 8, 500, 'mobile');
await browser.close();
