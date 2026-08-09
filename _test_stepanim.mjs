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
    return steps.map(s => ({
      opacity: getComputedStyle(s).opacity,
      transform: getComputedStyle(s).transform,
    }));
  });
}

console.log('--- initial state (before scroll) ---');
console.log(JSON.stringify(await getState(), null, 0));

let pinStart = null, pinEnd = null, wasPinned = false;
for (let i = 0; i < 40; i++) {
  await page.mouse.wheel({ deltaY: 100 });
  await new Promise(r => setTimeout(r, 90));
  const info = await page.evaluate(() => {
    const scene = document.querySelector('#showroom-how');
    const r = scene.getBoundingClientRect();
    return { scrollY: window.scrollY, sceneTop: Math.round(r.top) };
  });
  const isPinned = info.sceneTop === 0;
  if (isPinned && !wasPinned) pinStart = info.scrollY;
  if (!isPinned && wasPinned && pinEnd === null) pinEnd = info.scrollY;
  wasPinned = isPinned;
  if (isPinned) {
    const state = await getState();
    console.log(`i=${i} scrollY=${info.scrollY}`, state.map(s => s.opacity).join(','));
  }
}
console.log('pin range:', pinStart, '->', pinEnd);
console.log('console errors:', consoleErrors);
await browser.close();
