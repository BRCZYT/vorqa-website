import puppeteer from 'puppeteer';
const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
await page.goto('http://localhost:3000/en/', { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 3200));

// inject a debug hook by directly querying ScrollTrigger instances
const debugInfo = await page.evaluate(() => {
  if (!window.ScrollTrigger) return 'no ScrollTrigger';
  const triggers = ScrollTrigger.getAll();
  return triggers.map(t => ({
    trigger: t.trigger ? (t.trigger.id || t.trigger.tagName + '.' + t.trigger.className) : null,
    start: t.start, end: t.end, progress: t.progress
  }));
});
console.log('triggers at load:', JSON.stringify(debugInfo, null, 2));

for (let i = 0; i < 15; i++) {
  await page.mouse.wheel({ deltaY: 100 });
  await new Promise(r => setTimeout(r, 90));
}
const debugInfo2 = await page.evaluate(() => {
  const triggers = ScrollTrigger.getAll();
  return triggers.filter(t => t.trigger && t.trigger.id === 'showroom-how').map(t => ({
    start: t.start, end: t.end, progress: t.progress
  }));
});
console.log('showroom-how trigger after scroll:', JSON.stringify(debugInfo2, null, 2));

await browser.close();
