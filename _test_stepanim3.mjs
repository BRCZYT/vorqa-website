import puppeteer from 'puppeteer';
const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
const consoleErrors = [];
page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
page.on('pageerror', (err) => consoleErrors.push(err.message));
await page.goto('http://localhost:3000/en/', { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 3200));

async function getState() {
  return page.evaluate(() => {
    const steps = Array.from(document.querySelectorAll('#showroom-how .spine .step'));
    return steps.map(s => Math.round(parseFloat(getComputedStyle(s).opacity) * 100) / 100);
  });
}
function activeIdx(state) { return state.findIndex(v => v > 0.9); }

console.log('initial:', await getState());
let lastActive = 0;
let seenSequence = [0];
for (let i = 0; i < 30; i++) {
  await page.mouse.wheel({ deltaY: 100 });
  await new Promise(r => setTimeout(r, 700)); // one notch, then settle fully
  const scrollY = await page.evaluate(() => window.scrollY);
  const state = await getState();
  const idx = activeIdx(state);
  if (idx !== -1 && idx !== lastActive) { seenSequence.push(idx); lastActive = idx; }
  console.log(`i=${i} scrollY=${scrollY} state=[${state.join(',')}] active=${idx}`);
}
console.log('sequence of active steps seen:', seenSequence);
console.log('console errors:', consoleErrors);
await browser.close();
