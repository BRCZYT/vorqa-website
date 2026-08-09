import puppeteer from 'puppeteer';
const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://localhost:3000/en/', { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 3200));

for (let i = 0; i < 30; i++) {
  await page.mouse.wheel({ deltaY: 100 });
  await new Promise(r => setTimeout(r, 90));
}
await new Promise(r => setTimeout(r, 1000));
const info = await page.evaluate(() => {
  const scene = document.querySelector('#showroom-how');
  const r = scene.getBoundingClientRect();
  const state = Array.from(document.querySelectorAll('.spine .step-cell')).map(s => Math.round(parseFloat(getComputedStyle(s).opacity) * 100) / 100);
  return { scrollY: window.scrollY, sceneTop: Math.round(r.top), state };
});
console.log(JSON.stringify(info));
await page.screenshot({ path: 'temporary screenshots/grid-final.png' });
await browser.close();
