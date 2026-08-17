import puppeteer from 'puppeteer';

const out = 'C:/Users/SATNAL~1/AppData/Local/Temp/claude/c-----yedek-brc-ZYT-website/2a94e919-465e-4642-b42d-3c4641ab7553/scratchpad';

const browser = await puppeteer.launch();

// Mobile: 390x844 (iPhone-ish), full-page screenshot of the merged scene
const mob = await browser.newPage();
await mob.setViewport({ width: 390, height: 844 });
await mob.goto('http://localhost:3000/tr/index.html', { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 1500));
await mob.evaluate(() => document.querySelector('#showroom-how').scrollIntoView({ block: 'start' }));
await new Promise(r => setTimeout(r, 800));
const box = await mob.evaluate(() => {
  const el = document.querySelector('#showroom-how');
  const r = el.getBoundingClientRect();
  return { top: r.top + window.scrollY, height: r.height };
});
await mob.screenshot({ path: out + '/mobile_scene_full.png', clip: { x: 0, y: Math.max(0, box.top - 20), width: 390, height: Math.min(box.height + 300, 4000) } });
console.log('mobile scene height=', box.height);

// Desktop: confirm nothing changed
const desk = await browser.newPage();
await desk.setViewport({ width: 1440, height: 900 });
await desk.goto('http://localhost:3000/tr/index.html', { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 1500));
await desk.evaluate(() => document.querySelector('#showroom-how').scrollIntoView({ block: 'start' }));
await new Promise(r => setTimeout(r, 800));
await desk.screenshot({ path: out + '/desktop_scene.png' });

await browser.close();
console.log('done');
