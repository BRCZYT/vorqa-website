import puppeteer from 'puppeteer';
const browser = await puppeteer.launch({ headless: 'new' });

async function scrollToPanel(page) {
  for (let i = 0; i < 40; i++) {
    const top = await page.evaluate(() => document.querySelector('.ind-panel').getBoundingClientRect().top);
    if (top < 250 && top > -50) return true;
    const delta = top > 250 ? 150 : -100;
    await page.mouse.wheel({ deltaY: delta });
    await new Promise(r => setTimeout(r, 450));
  }
  return false;
}

async function testHoverSmoothness(width, height, label) {
  const page = await browser.newPage();
  await page.setViewport({ width, height });
  const consoleErrors = [];
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', (err) => consoleErrors.push(err.message));
  await page.goto('http://localhost:3000/en/', { waitUntil: 'networkidle0', timeout: 60000 });
  await new Promise(r => setTimeout(r, 3500)); // preloader clears body.loading at 3130ms

  const found = await scrollToPanel(page);
  await new Promise(r => setTimeout(r, 900));
  console.log(`[${label}] scrolled into position:`, found);

  await page.mouse.move(5, 5);
  await new Promise(r => setTimeout(r, 300));

  const box = await page.$eval('.ind-panel', el => { const r = el.getBoundingClientRect(); return { x: r.x + 30, y: r.y + r.height / 2 }; });
  const scrollWidthBefore = await page.evaluate(() => document.querySelector('.ind-rail').scrollWidth);
  const widthBeforeHover = await page.evaluate(() => document.querySelectorAll('.ind-panel')[0].getBoundingClientRect().width);
  console.log(`[${label}] width before hover:`, widthBeforeHover);

  const cs = await page.evaluate(() => {
    const p = document.querySelectorAll('.ind-panel')[0];
    const c = getComputedStyle(p);
    return { transitionProperty: c.transitionProperty, transitionDuration: c.transitionDuration, transitionTimingFunction: c.transitionTimingFunction };
  });
  console.log(`[${label}] transition info:`, cs);

  await page.mouse.move(box.x, box.y - 200, { steps: 3 });
  await page.mouse.move(box.x, box.y, { steps: 8 });

  const widths = [];
  for (let i = 0; i < 16; i++) {
    const w = await page.evaluate(() => document.querySelectorAll('.ind-panel')[0].getBoundingClientRect().width);
    widths.push(Math.round(w * 10) / 10);
    await new Promise(r => setTimeout(r, 60));
  }
  console.log(`[${label}] width samples during hover (every ~60ms, ~960ms total):`, widths);
  const isGradual = new Set(widths).size > 3;
  console.log(`[${label}] gradual (not snap):`, isGradual);

  await page.mouse.move(5, 5);
  await new Promise(r => setTimeout(r, 800));
  const scrollWidthAfter = await page.evaluate(() => document.querySelector('.ind-rail').scrollWidth);
  console.log(`[${label}] rail scrollWidth before/after hover cycle:`, scrollWidthBefore, scrollWidthAfter, scrollWidthBefore === scrollWidthAfter ? '(stable, no jitter)' : '(MISMATCH!)');

  console.log(`[${label}] console errors:`, consoleErrors);
  await page.close();
}

await testHoverSmoothness(1440, 900, 'desktop');
await browser.close();
