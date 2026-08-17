import puppeteer from 'puppeteer';

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });

const client = await page.createCDPSession();

await page.evaluateOnNewDocument(() => {
  window.__longTasks = [];
  window.__frames = [];
  window.__collecting = false;
  try {
    const po = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        window.__longTasks.push({ start: entry.startTime, duration: entry.duration, scrollY: window.scrollY });
      }
    });
    po.observe({ type: 'longtask', buffered: true });
  } catch (e) {}
  function rafLoop(t) {
    if (window.__collecting) window.__frames.push([t, window.scrollY]);
    requestAnimationFrame(rafLoop);
  }
  requestAnimationFrame(rafLoop);
});

const consoleErrors = [];
page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
page.on('pageerror', err => consoleErrors.push(err.message));

await page.goto('http://localhost:3000/tr/index.html', { waitUntil: 'networkidle0', timeout: 30000 });
await new Promise(r => setTimeout(r, 4000)); // preloader + entrance settle

await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });
await page.evaluate(() => { window.__frames = []; window.__longTasks = []; window.__collecting = true; });

await page.mouse.move(720, 450);
for (let i = 0; i < 70; i++) {
  await page.mouse.wheel({ deltaY: 140 });
  await new Promise(r => setTimeout(r, 90));
}

await new Promise(r => setTimeout(r, 300));
const result = await page.evaluate(() => {
  window.__collecting = false;
  return { frames: window.__frames, longTasks: window.__longTasks };
});

await client.send('Emulation.setCPUThrottlingRate', { rate: 1 });
await browser.close();

const frames = result.frames.map(([t, y]) => ({ t, y }));
const heroFrames = frames.filter(f => f.y <= 300);
const restFrames = frames.filter(f => f.y > 300);
function segFps(seg) {
  if (seg.length < 2) return 0;
  return (seg.length - 1) / ((seg[seg.length - 1].t - seg[0].t) / 1000);
}
const longTasks = result.longTasks.slice().sort((a, b) => b.duration - a.duration);
const heroLongTasks = longTasks.filter(t => t.scrollY <= 300);

console.log('=== HERO-EXIT (scrollY 0-300) ===');
console.log('frames=', heroFrames.length, 'FPS=', segFps(heroFrames).toFixed(1));
console.log('long tasks in hero range:', heroLongTasks.length, heroLongTasks.slice(0, 5).map(t => t.duration.toFixed(0) + 'ms@y' + t.scrollY).join(', '));
console.log('=== REST OF PAGE (scrollY >300) ===');
console.log('frames=', restFrames.length, 'FPS=', segFps(restFrames).toFixed(1));
console.log('=== CONSOLE ERRORS ===');
console.log(consoleErrors.length ? consoleErrors.join('\n') : '(none)');
