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

console.log('initial:', await getState());

// scroll incrementally with settle time to let 0.5s GSAP tweens finish
for (let burst = 0; burst < 16; burst++) {
  for (let i = 0; i < 3; i++) { await page.mouse.wheel({ deltaY: 100 }); await new Promise(r => setTimeout(r, 60)); }
  await new Promise(r => setTimeout(r, 600)); // let tween settle
  const scrollY = await page.evaluate(() => window.scrollY);
  const state = await getState();
  console.log(`burst=${burst} scrollY=${scrollY} state=[${state.join(',')}]`);
}
console.log('console errors:', consoleErrors);
await browser.close();
