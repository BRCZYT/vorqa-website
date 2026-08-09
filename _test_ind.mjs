import puppeteer from 'puppeteer';
const browser = await puppeteer.launch({ headless: 'new' });

async function testHoverSmoothness(width, label) {
  const page = await browser.newPage();
  await page.setViewport({ width, height: 900 });
  const consoleErrors = [];
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', (err) => consoleErrors.push(err.message));
  await page.goto('http://localhost:3000/en/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  await page.evaluate(() => document.querySelector('#industries').scrollIntoView({ block: 'start' }));
  await new Promise(r => setTimeout(r, 1500)); // let reveal fully settle first

  // check computed transition includes flex-basis with non-zero duration
  const transitionInfo = await page.evaluate(() => {
    const panel = document.querySelector('.ind-panel');
    const cs = getComputedStyle(panel);
    return { transitionProperty: cs.transitionProperty, transitionDuration: cs.transitionDuration };
  });
  console.log(`[${label}] transition-property:`, transitionInfo.transitionProperty);
  console.log(`[${label}] transition-duration:`, transitionInfo.transitionDuration);

  // hover smoothness: sample width over time
  const box = await page.$eval('.ind-panel', el => { const r = el.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
  await page.mouse.move(box.x, box.y);
  const widths = [];
  for (let i = 0; i < 8; i++) {
    const w = await page.evaluate(() => document.querySelector('.ind-panel').getBoundingClientRect().width);
    widths.push(Math.round(w));
    await new Promise(r => setTimeout(r, 70));
  }
  console.log(`[${label}] width samples during hover:`, widths);
  const isGradual = new Set(widths).size > 3; // more than start/end only = smooth transition observed
  console.log(`[${label}] gradual (not snap):`, isGradual);

  // move away, check horizontal scroll position stability during reveal re-check
  await page.mouse.move(0, 0);
  await new Promise(r => setTimeout(r, 700));

  const scrollWidthBefore = await page.evaluate(() => document.querySelector('.ind-rail').scrollWidth);
  console.log(`[${label}] rail scrollWidth:`, scrollWidthBefore);

  console.log(`[${label}] console errors:`, consoleErrors);
  await page.close();
  return consoleErrors;
}

await testHoverSmoothness(1440, 'desktop');
await testHoverSmoothness(375, 'mobile');

await browser.close();
