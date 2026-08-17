import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({
  args: ['--enable-precise-memory-info'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });

// CPU throttling: mid-tier laptop / low-end device simulation (4x slower),
// closer to what a real jank complaint usually comes from than a dev machine.
const client = await page.createCDPSession();
await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });

await page.evaluateOnNewDocument(() => {
  window.__longTasks = [];
  window.__frames = [];
  window.__collecting = false;

  try {
    const po = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        window.__longTasks.push({
          start: entry.startTime,
          duration: entry.duration,
          scrollY: window.scrollY,
          name: entry.name,
        });
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

// let the preloader clear (3130ms) + entrance animations settle
await new Promise(r => setTimeout(r, 4000));

await page.evaluate(() => { window.__frames = []; window.__longTasks = []; window.__collecting = true; });

// Realistic wheel-driven scroll through hero -> showroom/how-we-work pin -> what-we-do -> industries
const startTime = Date.now();
await page.mouse.move(720, 450);
for (let i = 0; i < 70; i++) {
  await page.mouse.wheel({ deltaY: 140 });
  await new Promise(r => setTimeout(r, 90));
}
const elapsedMs = Date.now() - startTime;

await new Promise(r => setTimeout(r, 300));
const result = await page.evaluate(() => {
  window.__collecting = false;
  return {
    frames: window.__frames,
    longTasks: window.__longTasks,
    scrollY: window.scrollY,
    docHeight: document.documentElement.scrollHeight,
  };
});

await client.send('Emulation.setCPUThrottlingRate', { rate: 1 });
await browser.close();

// ---- Analysis ----
const frames = result.frames.map(([t, y]) => ({ t, y }));
const frameCount = frames.length;
const avgFps = frameCount > 1 ? (frameCount - 1) / ((frames[frameCount - 1].t - frames[0].t) / 1000) : 0;

const gaps = [];
for (let i = 1; i < frames.length; i++) gaps.push({ gap: frames[i].t - frames[i - 1].t, y: frames[i].y });
gaps.sort((a, b) => b.gap - a.gap);
const worstGaps = gaps.slice(0, 10);

// Segment FPS: hero-exit (scrollY 0-300) vs rest of scroll
const heroFrames = frames.filter(f => f.y <= 300);
const restFrames = frames.filter(f => f.y > 300);
function segFps(segFrames) {
  if (segFrames.length < 2) return 0;
  return (segFrames.length - 1) / ((segFrames[segFrames.length - 1].t - segFrames[0].t) / 1000);
}
console.log('=== SEGMENT FPS ===');
console.log('hero-exit (scrollY 0-300): frames=', heroFrames.length, 'fps=', segFps(heroFrames).toFixed(1));
console.log('rest of page (scrollY >300): frames=', restFrames.length, 'fps=', segFps(restFrames).toFixed(1));

const longTasks = result.longTasks.slice().sort((a, b) => b.duration - a.duration);

console.log('=== SCROLL WINDOW ===');
console.log('elapsed(ms)=', elapsedMs, 'scrollY reached=', result.scrollY, '/ docHeight=', result.docHeight);
console.log('=== FPS ===');
console.log('frameCount=', frameCount, 'avgFPS=', avgFps.toFixed(1));
console.log('worst 10 inter-frame gaps (ms @ scrollY):', worstGaps.map(g => `${g.gap.toFixed(1)}ms@y${g.y}`).join(', '));
console.log('=== LONG TASKS (>50ms, sorted desc) ===');
console.log('count=', longTasks.length);
for (const t of longTasks.slice(0, 20)) {
  console.log(`  duration=${t.duration.toFixed(1)}ms  start=${t.start.toFixed(0)}ms  scrollY=${t.scrollY}  name=${t.name}`);
}
console.log('=== CONSOLE ERRORS ===');
console.log(consoleErrors.length ? consoleErrors.join('\n') : '(none)');
