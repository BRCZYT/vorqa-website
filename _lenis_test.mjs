import puppeteer from 'puppeteer';

const label = process.argv[2] || 'test';
const blockLenis = process.argv[3] === 'blockLenis';
const extraCSS = process.argv[4] || '';

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
const client = await page.createCDPSession();

await page.evaluateOnNewDocument((css) => {
  window.__frames = [];
  window.__collecting = false;
  function rafLoop(t) {
    if (window.__collecting) window.__frames.push([t, window.scrollY]);
    requestAnimationFrame(rafLoop);
  }
  requestAnimationFrame(rafLoop);
  if (css) {
    function inject() {
      if (!document.documentElement) { setTimeout(inject, 0); return; }
      const style = document.createElement('style');
      style.textContent = css;
      (document.head || document.documentElement).appendChild(style);
    }
    inject();
  }
}, extraCSS);

if (blockLenis) {
  await page.setRequestInterception(true);
  page.on('request', req => {
    if (req.url().includes('lenis')) req.abort();
    else req.continue();
  });
}

const consoleErrors = [];
page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
page.on('pageerror', err => consoleErrors.push(err.message));

await page.goto('http://localhost:3000/tr/index.html', { waitUntil: 'networkidle0', timeout: 30000 });
await new Promise(r => setTimeout(r, 4000));

const lenisActive = await page.evaluate(() => !!window.__lenis);

await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });
await page.evaluate(() => { window.__frames = []; window.__collecting = true; });

await page.mouse.move(720, 450);
for (let i = 0; i < 70; i++) {
  await page.mouse.wheel({ deltaY: 140 });
  await new Promise(r => setTimeout(r, 90));
}
await new Promise(r => setTimeout(r, 300));
const result = await page.evaluate(() => { window.__collecting = false; return window.__frames; });
await client.send('Emulation.setCPUThrottlingRate', { rate: 1 });
await browser.close();

const frames = result.map(([t, y]) => ({ t, y }));
const hero = frames.filter(f => f.y <= 300);
const rest = frames.filter(f => f.y > 300);
function fps(seg) {
  if (seg.length < 2) return 0;
  return (seg.length - 1) / ((seg[seg.length - 1].t - seg[0].t) / 1000);
}
console.log(`=== ${label} ===`);
console.log('window.__lenis active:', lenisActive);
console.log('hero-exit frames=', hero.length, 'FPS=', fps(hero).toFixed(1));
console.log('rest frames=', rest.length, 'FPS=', fps(rest).toFixed(1));
if (consoleErrors.length) console.log('console errors:', consoleErrors.join(' | '));
