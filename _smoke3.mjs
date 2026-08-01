import puppeteer from 'puppeteer';
const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.setViewport({ width: 1400, height: 1000 });
await page.goto('http://localhost:3000/index.html', { waitUntil: 'networkidle0' });
await new Promise(r=>setTimeout(r,3500));
const height = await page.evaluate(() => document.body.scrollHeight);
for (let y = 0; y < height; y += 400) {
  await page.evaluate((y) => window.scrollTo(0, y), y);
  await new Promise(r=>setTimeout(r,120));
}
await new Promise(r=>setTimeout(r,400));

const info = await page.evaluate(() => {
  return Array.from(document.querySelectorAll('.rv'))
    .filter(el => !el.classList.contains('on'))
    .map(el => ({
      tag: el.tagName,
      cls: el.className,
      text: (el.textContent||'').trim().slice(0,40),
      closestSection: el.closest('section')?.id || el.closest('div[id]')?.id || 'unknown',
    }));
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
