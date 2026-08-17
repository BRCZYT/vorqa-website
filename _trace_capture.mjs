import puppeteer from 'puppeteer';
import fs from 'fs';

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
const client = await page.createCDPSession();

await page.goto('http://localhost:3000/tr/index.html', { waitUntil: 'networkidle0', timeout: 30000 });
await new Promise(r => setTimeout(r, 4000));

await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });

const tracePath = './_trace.json';
await page.tracing.start({ path: tracePath, screenshots: false, categories: [
  'devtools.timeline', 'v8.execute', 'blink.user_timing', 'disabled-by-default-devtools.timeline',
  'disabled-by-default-devtools.timeline.frame', 'toplevel', 'blink', 'disabled-by-default-v8.compile'
]});

await page.mouse.move(720, 450);
for (let i = 0; i < 25; i++) {
  await page.mouse.wheel({ deltaY: 140 });
  await new Promise(r => setTimeout(r, 90));
}

await page.tracing.stop();
await client.send('Emulation.setCPUThrottlingRate', { rate: 1 });
await browser.close();

// ---- Analyze trace ----
const trace = JSON.parse(fs.readFileSync(tracePath, 'utf8'));
const events = trace.traceEvents;

// Find long "RunTask" / top-level tasks on the main thread
const durByName = {};
for (const e of events) {
  if (e.ph === 'X' && e.dur && e.dur > 5000) { // >5ms in microseconds
    const key = e.name;
    durByName[key] = (durByName[key] || 0) + e.dur;
  }
}
const sorted = Object.entries(durByName).sort((a, b) => b[1] - a[1]).slice(0, 25);
console.log('=== Top event types by total duration (us) during scroll ===');
for (const [name, dur] of sorted) console.log(`${(dur/1000).toFixed(1)}ms  ${name}`);

// Find the single longest individual events
const longest = events.filter(e => e.ph === 'X' && e.dur).sort((a, b) => b.dur - a.dur).slice(0, 15);
console.log('\n=== 15 longest individual events ===');
for (const e of longest) {
  console.log(`${(e.dur/1000).toFixed(1)}ms  ${e.name}  args=${JSON.stringify(e.args || {}).slice(0,200)}`);
}
