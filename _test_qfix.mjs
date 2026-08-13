import puppeteer from 'puppeteer';
const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
const errors = [];
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', e => errors.push(e.message));
await page.goto('http://localhost:3000/en/', { waitUntil: 'domcontentloaded', timeout: 45000 });

// Poll until pl-q has the 'in' class and before 'exit'/pl 'done'
let captured = false;
for (let i = 0; i < 60; i++) {
  const state = await page.evaluate(() => {
    const q = document.getElementById('pl-q');
    const pl = document.getElementById('pl');
    return { qClass: q ? q.className : null, plClass: pl ? pl.className : null };
  });
  if (state.qClass && state.qClass.includes('in') && !state.qClass.includes('exit')) {
    const plQ = await page.$('#pl-q');
    const box = await plQ.boundingBox();
    if (box) await page.screenshot({ path: '_shot_preloader_q.png', clip: { x: Math.max(0, box.x - 20), y: Math.max(0, box.y - 20), width: box.width + 40, height: box.height + 40 } });
    captured = true;
    break;
  }
  await new Promise(r => setTimeout(r, 100));
}
console.log('preloader Q captured:', captured);

await new Promise(r => setTimeout(r, 3500));

for (let i = 0; i < 40; i++) {
  const top = await page.evaluate(() => document.querySelector('.wwd-mark')?.getBoundingClientRect().top);
  if (top === undefined) break;
  if (top < 400 && top > -400) break;
  await page.mouse.wheel({ deltaY: top > 400 ? 300 : -200 });
  await new Promise(r => setTimeout(r, 90));
}
await new Promise(r => setTimeout(r, 1000));
const mark = await page.$('.wwd-mark');
if (mark) {
  const box = await mark.boundingBox();
  if (box) await page.screenshot({ path: '_shot_wwd_mark.png', clip: { x: Math.max(0, box.x), y: Math.max(0, box.y), width: Math.min(box.width, 1440 - box.x), height: Math.min(box.height, 900 - Math.max(0, box.y)) } });
}

console.log('console errors:', errors.length ? errors : 'none');
await browser.close();
