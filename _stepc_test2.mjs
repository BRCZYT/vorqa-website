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
console.log('sceneTop=', sceneTop);

async function state() {
  return page.evaluate(() => {
    const cells = Array.from(document.querySelectorAll('#showroom-how .spine .step-cell'));
    const visible = cells.map(c => +getComputedStyle(c).opacity > 0.9).filter(Boolean).length;
    const nav = document.getElementById('nav');
    const pinned = getComputedStyle(document.querySelector('#showroom-how')).position === 'fixed' || !!document.querySelector('.pin-spacer');
    return { visible, scrollY: window.scrollY };
  });
}

await page.mouse.move(720, 450);
// Scroll to just before the scene using wheel, in coarse steps
let totalScrolled = 0;
while (totalScrolled < sceneTop - 50) {
  await page.mouse.wheel({ deltaY: 300 });
  totalScrolled += 300;
  await new Promise(r => setTimeout(r, 30));
}
await new Promise(r => setTimeout(r, 1500)); // let Lenis settle
console.log('approaching scene:', JSON.stringify(await state()));

let lastCount = -1;
let wheelPx = 0;
const wheelStep = 80;
const maxWheel = 5500;
const transitions = [];
for (; wheelPx <= maxWheel; wheelPx += wheelStep) {
  await page.mouse.wheel({ deltaY: wheelStep });
  await new Promise(r => setTimeout(r, 50));
  const s = await state();
  if (s.visible !== lastCount) {
    transitions.push({ wheelPx, visible: s.visible, scrollY: s.scrollY });
    lastCount = s.visible;
  }
}
console.log('transitions:', JSON.stringify(transitions, null, 2));

// let everything settle then confirm final state + pin released
await new Promise(r => setTimeout(r, 1500));
const final = await state();
console.log('final state after settle:', JSON.stringify(final));

console.log('console errors:', consoleErrors.length ? consoleErrors.join(' | ') : '(none)');
await browser.close();
