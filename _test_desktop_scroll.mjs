import puppeteer from 'puppeteer';

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });
await page.goto('http://localhost:3000/index.html', { waitUntil: 'networkidle0', timeout: 30000 });
await new Promise(r => setTimeout(r, 500));

async function visibleCount() {
  return page.evaluate(() => {
    const cells = Array.from(document.querySelectorAll('#showroom-how .spine .step-cell'));
    return cells.filter(c => parseFloat(getComputedStyle(c).opacity) > 0.9).length;
  });
}

console.log('before scroll:', await visibleCount());

// scroll to the section and then progressively deeper into the pinned range
const sceneTop = await page.evaluate(() => document.querySelector('#showroom-how').getBoundingClientRect().top + window.scrollY);
await page.evaluate((y) => window.scrollTo(0, y), sceneTop + 10);
await new Promise(r => setTimeout(r, 400));
console.log('at pin start:', await visibleCount());

await page.evaluate((y) => window.scrollTo(0, y), sceneTop + 450);
await new Promise(r => setTimeout(r, 400));
console.log('mid pin (~450/900):', await visibleCount());

await page.evaluate((y) => window.scrollTo(0, y), sceneTop + 890);
await new Promise(r => setTimeout(r, 400));
console.log('end of pin (~890/900):', await visibleCount());

await browser.close();
