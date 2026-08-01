import puppeteer from 'puppeteer';
const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.setViewport({ width: 1400, height: 1000 });
await page.goto('http://localhost:3000/index.html', { waitUntil: 'networkidle0' });
await new Promise(r=>setTimeout(r,3500));

const info = await page.evaluate(() => {
  const els = Array.from(document.querySelectorAll('#services, #services .rv, #how, #how .rv'));
  return els.slice(0,10).map(el => {
    const r = el.getBoundingClientRect();
    return { tag: el.tagName, id: el.id, cls: el.className, w: r.width, h: r.height, top: r.top };
  });
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
