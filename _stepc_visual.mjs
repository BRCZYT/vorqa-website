import puppeteer from 'puppeteer';

const out = 'C:/Users/SATNAL~1/AppData/Local/Temp/claude/c-----yedek-brc-ZYT-website/2a94e919-465e-4642-b42d-3c4641ab7553/scratchpad';

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://localhost:3000/tr/index.html', { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 1500));

const sceneTop = await page.evaluate(() => document.querySelector('#showroom-how').getBoundingClientRect().top + window.scrollY);

async function shotAt(y, name) {
  await page.evaluate((y) => window.scrollTo(0, y), y);
  await new Promise(r => setTimeout(r, 1400)); // let Lenis + tween fully settle
  await page.screenshot({ path: `${out}/stepc_${name}.png` });
}

await shotAt(sceneTop + 10, 'a_start');
await shotAt(sceneTop + 1500, 'b_mid1');
await shotAt(sceneTop + 3000, 'c_mid2');
await shotAt(sceneTop + 3550, 'd_near_end');
await shotAt(sceneTop + 3700, 'e_after_release');

await browser.close();
console.log('done, sceneTop=', sceneTop);
