import puppeteer from 'puppeteer';

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
const client = await page.createCDPSession();

// Force prefers-reduced-motion so heavyOK=false site-wide, disabling the
// hero scrub (and a couple other heavyOK-gated animations) WITHOUT editing
// any source file — pure diagnostic isolation test.
await client.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });

await page.evaluateOnNewDocument(() => {
  window.__frames = [];
  window.__collecting = false;
  function rafLoop(t) {
    if (window.__collecting) window.__frames.push([t, window.scrollY]);
    requestAnimationFrame(rafLoop);
  }
  requestAnimationFrame(rafLoop);
});

await page.goto('http://localhost:3000/tr/index.html', { waitUntil: 'networkidle0', timeout: 30000 });
await new Promise(r => setTimeout(r, 4000));

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
const heroFrames = frames.filter(f => f.y <= 300);
const restFrames = frames.filter(f => f.y > 300);
function segFps(seg) {
  if (seg.length < 2) return 0;
  return (seg.length - 1) / ((seg[seg.length - 1].t - seg[0].t) / 1000);
}
console.log('=== WITH reduced-motion forced (hero scrub OFF, control test) ===');
console.log('hero-exit (0-300): frames=', heroFrames.length, 'FPS=', segFps(heroFrames).toFixed(1));
console.log('rest of page (>300): frames=', restFrames.length, 'FPS=', segFps(restFrames).toFixed(1));
