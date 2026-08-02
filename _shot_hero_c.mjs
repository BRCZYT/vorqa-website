import puppeteer from 'puppeteer';
const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://localhost:3000/en/', { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 1800));
await page.screenshot({ path: 'temporary screenshots/hero-c-check.png', clip: { x: 0, y: 0, width: 1440, height: 700 } });

// simulate 125% zoom via deviceScaleFactor won't change layout px; instead shrink viewport to emulate zoom effect
await page.setViewport({ width: 1152, height: 720 });
await page.reload({ waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 1800));
await page.screenshot({ path: 'temporary screenshots/hero-c-check-zoom125.png', clip: { x: 0, y: 0, width: 1152, height: 600 } });
await browser.close();
