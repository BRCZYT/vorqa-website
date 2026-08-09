import puppeteer from 'puppeteer';
const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
const logs = [];
page.on('console', (msg) => { if (msg.text().includes('DEBUG')) logs.push(msg.text()); });
await page.goto('http://localhost:3000/en/', { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 3200));
for (let i = 0; i < 40; i++) {
  await page.mouse.wheel({ deltaY: 100 });
  await new Promise(r => setTimeout(r, 90));
}
console.log('total DEBUG logs:', logs.length);
console.log(logs.slice(0, 10).join('\n'));
console.log('...');
console.log(logs.slice(-10).join('\n'));
await browser.close();
