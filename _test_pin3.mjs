import puppeteer from 'puppeteer';
const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
const consoleErrors = [];
page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
page.on('pageerror', (err) => consoleErrors.push(err.message));
await page.goto('http://localhost:3000/en/', { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 3200));

// Realistic mouse-wheel notch size (~100px per tick, typical default)
let pinStart = null, pinEnd = null, wasPinned = false, notches = 0;
for (let i = 0; i < 40; i++) {
  await page.mouse.wheel({ deltaY: 100 });
  await new Promise(r => setTimeout(r, 90));
  const info = await page.evaluate(() => {
    const scene = document.querySelector('#showroom-how');
    const r = scene.getBoundingClientRect();
    return { scrollY: window.scrollY, sceneTop: Math.round(r.top) };
  });
  const isPinned = info.sceneTop === 0;
  if (isPinned && !wasPinned) pinStart = { i, ...info };
  if (isPinned) notches++;
  if (!isPinned && wasPinned && pinEnd === null) pinEnd = { i, ...info };
  wasPinned = isPinned;
}
console.log('pin start:', pinStart);
console.log('pin end:', pinEnd);
console.log('notches spent pinned:', notches);
console.log('console errors:', consoleErrors);
await browser.close();
