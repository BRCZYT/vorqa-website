import puppeteer from 'puppeteer';
const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
const consoleErrors = [];
page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
page.on('pageerror', (err) => consoleErrors.push(err.message));
await page.goto('http://localhost:3000/en/', { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 3200));

const sceneInfo = await page.evaluate(() => {
  const scene = document.querySelector('#showroom-how');
  const r = scene.getBoundingClientRect();
  const cells = document.querySelectorAll('.spine .step-cell');
  return { height: Math.round(r.height), viewportH: window.innerHeight, cellCount: cells.length };
});
console.log('scene height:', sceneInfo.height, 'vs viewport:', sceneInfo.viewportH, '| cell count:', sceneInfo.cellCount);

async function getState() {
  return page.evaluate(() => Array.from(document.querySelectorAll('.spine .step-cell')).map(s => Math.round(parseFloat(getComputedStyle(s).opacity) * 100) / 100));
}
console.log('initial:', await getState());

let pinStart = null, pinEnd = null, wasPinned = false;
const seenPatterns = [];
for (let i = 0; i < 40; i++) {
  await page.mouse.wheel({ deltaY: 100 });
  await new Promise(r => setTimeout(r, 700));
  const info = await page.evaluate(() => {
    const scene = document.querySelector('#showroom-how');
    const r = scene.getBoundingClientRect();
    return { scrollY: window.scrollY, sceneTop: Math.round(r.top) };
  });
  const state = await getState();
  const isPinned = info.sceneTop === 0;
  if (isPinned && !wasPinned) pinStart = info.scrollY;
  if (!isPinned && wasPinned && pinEnd === null) pinEnd = info.scrollY;
  wasPinned = isPinned;
  const pattern = state.join(',');
  if (seenPatterns[seenPatterns.length - 1] !== pattern) seenPatterns.push(pattern);
  console.log(`i=${i} scrollY=${info.scrollY} sceneTop=${info.sceneTop} state=[${pattern}]`);
}
console.log('\nunique patterns in order:', JSON.stringify(seenPatterns, null, 0));
console.log('pin range:', pinStart, '->', pinEnd);
console.log('console errors:', consoleErrors);
await browser.close();
