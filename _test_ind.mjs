import puppeteer from 'puppeteer';
const browser = await puppeteer.launch({ headless: 'new' });

async function scrollToIndustries(page) {
  for (let i = 0; i < 40; i++) {
    const y = await page.evaluate(() => document.querySelector('.ind-panel').getBoundingClientRect().top);
    if (y < 100 && y > -50) return true;
    await page.mouse.wheel({ deltaY: y > 0 ? Math.min(500, Math.max(80, y * 0.6)) : Math.max(-500, Math.min(-40, y * 0.6)) });
    await new Promise(r => setTimeout(r, 120));
  }
  return false;
}

async function testHoverSmoothness(width, height, label) {
  const page = await browser.newPage();
  await page.setViewport({ width, height });
  const consoleErrors = [];
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', (err) => consoleErrors.push(err.message));
  await page.goto('http://localhost:3000/en/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 3500)); // preloader clears body.loading at 3130ms

  const found = await scrollToIndustries(page);
  await new Promise(r => setTimeout(r, 1200));
  console.log(`[${label}] scrolled into position:`, found);

  const scrollWidthBefore = await page.evaluate(() => document.querySelector('.ind-rail').scrollWidth);

  const box = await page.$eval('.ind-panel', el => { const r = el.getBoundingClientRect(); return { x: r.x + 30, y: r.y + r.height / 2 }; });
  console.log(`[${label}] hover target box:`, box);
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

await testHoverSmoothness(1440, 900, 'desktop');
await testHoverSmoothness(375, 800, 'mobile');
await browser.close();
