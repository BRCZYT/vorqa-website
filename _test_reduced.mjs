import puppeteer from 'puppeteer';
const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
await page.setViewport({ width: 1440, height: 900 });
const consoleErrors = [];
page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
page.on('pageerror', (err) => consoleErrors.push(err.message));
await page.goto('http://localhost:3000/en/', { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 1200));

async function getState() {
  return page.evaluate(() => {
    const steps = Array.from(document.querySelectorAll('#showroom-how .spine .step'));
    return steps.map(s => Math.round(parseFloat(getComputedStyle(s).opacity) * 100) / 100);
  });
}
console.log('initial (reduced-motion):', await getState());

for (let i = 0; i < 15; i++) {
  await page.mouse.wheel({ deltaY: 100 });
  await new Promise(r => setTimeout(r, 50)); // minimal wait — instant changes shouldn't need settle time
  const state = await getState();
  console.log(`i=${i} state=[${state.join(',')}]`);
}
console.log('console errors:', consoleErrors);
await browser.close();
