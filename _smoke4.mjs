import puppeteer from 'puppeteer';
const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.setViewport({ width: 1400, height: 1000 });
await page.goto('http://localhost:3000/index.html', { waitUntil: 'networkidle0' });
await new Promise(r=>setTimeout(r,3500));

const height = await page.evaluate(() => document.body.scrollHeight);
for (let y = 0; y < height; y += 250) {
  await page.evaluate((y) => window.scrollTo(0, y), y);
  await new Promise(r=>setTimeout(r,400));
}
await new Promise(r=>setTimeout(r,1000));

const notRevealed = await page.evaluate(() => {
  return Array.from(document.querySelectorAll('.rv')).filter(el => !el.classList.contains('on')).length;
});
console.log('rv elements NOT revealed after slow full scroll:', notRevealed);
await browser.close();
