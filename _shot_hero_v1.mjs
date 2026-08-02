import puppeteer from 'puppeteer';
const browser = await puppeteer.launch({ headless: 'new' });

// Desktop
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://localhost:3000/en/', { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 1700));
await page.screenshot({ path: 'C:/Users/Satınalma/AppData/Local/Temp/claude/c-----yedek-brc-ZYT-website/2a94e919-465e-4642-b42d-3c4641ab7553/scratchpad/hero_v1_desktop.png' });

// Mobile
const page2 = await browser.newPage();
await page2.setViewport({ width: 390, height: 844 });
await page2.goto('http://localhost:3000/en/', { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 1700));
await page2.screenshot({ path: 'C:/Users/Satınalma/AppData/Local/Temp/claude/c-----yedek-brc-ZYT-website/2a94e919-465e-4642-b42d-3c4641ab7553/scratchpad/hero_v1_mobile.png' });

// Arabic desktop (RTL check)
const page3 = await browser.newPage();
await page3.setViewport({ width: 1440, height: 900 });
await page3.goto('http://localhost:3000/ar/', { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 1700));
await page3.screenshot({ path: 'C:/Users/Satınalma/AppData/Local/Temp/claude/c-----yedek-brc-ZYT-website/2a94e919-465e-4642-b42d-3c4641ab7553/scratchpad/hero_v1_ar.png' });

await browser.close();
