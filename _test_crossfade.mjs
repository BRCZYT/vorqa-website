import puppeteer from 'puppeteer';
const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
const consoleErrors = [];
page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
page.on('pageerror', (err) => consoleErrors.push(err.message));
await page.goto('http://localhost:3000/en/', { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 3200));

// check the scene's total height vs viewport
const sceneInfo = await page.evaluate(() => {
  const scene = document.querySelector('#showroom-how');
  const r = scene.getBoundingClientRect();
  return { height: Math.round(r.height), viewportH: window.innerHeight };
});
console.log('scene height:', sceneInfo.height, 'vs viewport:', sceneInfo.viewportH);

async function getState() {
  return page.evaluate(() => {
    const steps = Array.from(document.querySelectorAll('#showroom-how .spine .step'));
    return steps.map(s => Math.round(parseFloat(getComputedStyle(s).opacity) * 100) / 100);
  });
}
console.log('initial:', await getState());

let lastActive = 0;
let seenSequence = [0];
let pinStart = null, pinEnd = null, wasPinned = false;
for (let i = 0; i < 40; i++) {
  await page.mouse.wheel({ deltaY: 100 });
  await new Promise(r => setTimeout(r, 700));
  const info = await page.evaluate(() => {
    const scene = document.querySelector('#showroom-how');
    const r = scene.getBoundingClientRect();
    return { scrollY: window.scrollY, sceneTop: Math.round(r.top) };
  });
  const state = await getState();
  const idx = state.findIndex(v => v > 0.9);
  const isPinned = info.sceneTop === 0;
  if (isPinned && !wasPinned) pinStart = info.scrollY;
  if (!isPinned && wasPinned && pinEnd === null) pinEnd = info.scrollY;
  wasPinned = isPinned;
  if (idx !== -1 && idx !== lastActive) { seenSequence.push(idx); lastActive = idx; }
  console.log(`i=${i} scrollY=${info.scrollY} sceneTop=${info.sceneTop} state=[${state.join(',')}] active=${idx}`);
}
console.log('sequence of active steps seen:', seenSequence);
console.log('pin range:', pinStart, '->', pinEnd);
console.log('console errors:', consoleErrors);
await browser.close();
