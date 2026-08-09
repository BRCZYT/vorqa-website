import puppeteer from 'puppeteer';
const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://localhost:3000/en/', { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 3200));
for (let i = 0; i < 9; i++) { await page.mouse.wheel({ deltaY: 100 }); await new Promise(r => setTimeout(r, 90)); }
await new Promise(r => setTimeout(r, 700));
await page.screenshot({ path: 'temporary screenshots/crossfade-step1.png' });
for (let i = 0; i < 9; i++) { await page.mouse.wheel({ deltaY: 100 }); await new Promise(r => setTimeout(r, 90)); }
await new Promise(r => setTimeout(r, 700));
await page.screenshot({ path: 'temporary screenshots/crossfade-step3.png' });
await browser.close();
