import puppeteer from 'puppeteer';
const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.setViewport({ width: 1400, height: 1000 });
await page.goto('http://localhost:3000/index.html', { waitUntil: 'networkidle0' });
await new Promise(r=>setTimeout(r,3500));

// Simulate real mouse-wheel scrolling so Lenis processes it naturally
for (let i = 0; i < 40; i++) {
  await page.mouse.wheel({ deltaY: 300 });
  await new Promise(r=>setTimeout(r,80));
}
await new Promise(r=>setTimeout(r,1500));

const notRevealed = await page.evaluate(() => {
  return Array.from(document.querySelectorAll('.rv')).filter(el => !el.classList.contains('on')).length;
});
console.log('rv elements NOT revealed after real wheel-scroll:', notRevealed);
await page.screenshot({ path: '_smoke_wheel.png', fullPage: true });
await browser.close();
