import puppeteer from 'puppeteer';
const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.setViewport({ width: 1400, height: 1000 });
await page.goto('http://localhost:3000/index.html', { waitUntil: 'networkidle0' });
await new Promise(r=>setTimeout(r,3500));

// scroll down gradually so IntersectionObserver fires like a real user
const height = await page.evaluate(() => document.body.scrollHeight);
for (let y = 0; y < height; y += 400) {
  await page.evaluate((y) => window.scrollTo(0, y), y);
  await new Promise(r=>setTimeout(r,120));
}
await new Promise(r=>setTimeout(r,400));

const notRevealed = await page.evaluate(() => {
  return Array.from(document.querySelectorAll('.rv')).filter(el => !el.classList.contains('on')).length;
});
console.log('rv elements NOT revealed after full scroll:', notRevealed);

await page.screenshot({ path: '_smoke_scrolled.png', fullPage: true });
await browser.close();
