import puppeteer from 'puppeteer';

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });

const consoleErrors = [];
page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
page.on('pageerror', err => consoleErrors.push(err.message));

await page.goto('http://localhost:3000/tr/index.html', { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 1500));

const sceneTop = await page.evaluate(() => document.querySelector('#showroom-how').getBoundingClientRect().top + window.scrollY);

async function state() {
  return page.evaluate(() => {
    const cells = Array.from(document.querySelectorAll('#showroom-how .spine .step-cell'));
    const visible = cells.map(c => +getComputedStyle(c).opacity > 0.9);
    const line = document.querySelector('.spine-line');
    const lineScale = line ? getComputedStyle(line).transform : null;
    return { visibleCount: visible.filter(Boolean).length, visible, lineTransform: lineScale };
  });
}

console.log('sceneTop=', sceneTop);

// Scroll to pin start, then step through the pin range in increments,
// recording exactly where each new step becomes visible.
await page.evaluate((y) => window.scrollTo(0, y), sceneTop + 5);
await new Promise(r => setTimeout(r, 900));
console.log('at pin start:', JSON.stringify(await state()));

let lastCount = 0;
const totalRange = 3600;
const stepPx = 60;
for (let offset = 0; offset <= totalRange + 200; offset += stepPx) {
  await page.evaluate((y) => window.scrollTo(0, y), sceneTop + offset);
  await new Promise(r => setTimeout(r, 60));
  const s = await state();
  if (s.visibleCount !== lastCount) {
    console.log(`offset=${offset}px  visibleCount=${s.visibleCount}  (step ${s.visibleCount} just appeared)`);
    lastCount = s.visibleCount;
  }
}

console.log('errors:', consoleErrors.length ? consoleErrors.join(' | ') : '(none)');
await browser.close();
