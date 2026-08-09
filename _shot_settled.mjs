import puppeteer from 'puppeteer';
const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://localhost:3000/en/', { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 3200));

async function getIdx() {
  return page.evaluate(() => {
    const steps = Array.from(document.querySelectorAll('#showroom-how .spine .step'));
    return steps.findIndex(s => parseFloat(getComputedStyle(s).opacity) > 0.95);
  });
}

for (let target = 1; target <= 4; target++) {
  let idx = await getIdx();
  let guard = 0;
  while (idx !== target && guard < 30) {
    await page.mouse.wheel({ deltaY: 100 });
    await new Promise(r => setTimeout(r, 100));
    idx = await getIdx();
    guard++;
  }
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: `temporary screenshots/settled-step${target + 1}.png` });
  console.log('reached step', idx, 'after', guard, 'notches');
}
await browser.close();
