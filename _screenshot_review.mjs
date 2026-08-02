import puppeteer from 'puppeteer';

const BASE = 'https://zyt-website.vercel.app';
const OUT_DIR = 'C:/Users/SATNAL~1/AppData/Local/Temp/claude/c-----yedek-brc-ZYT-website/2a94e919-465e-4642-b42d-3c4641ab7553/scratchpad';

const targets = [
  { name: 'home-en-desktop', path: '/en/', width: 1440, height: 900 },
  { name: 'academy-en',      path: '/en/academy/', width: 1440, height: 900 },
  { name: 'contact-en',      path: '/en/contact/', width: 1440, height: 900 },
  { name: 'home-en-mobile',  path: '/en/', width: 390, height: 844 },
  { name: 'home-ar-rtl',     path: '/ar/', width: 1440, height: 900 },
];

const browser = await puppeteer.launch();

for (const t of targets) {
  const page = await browser.newPage();
  await page.setViewport({ width: t.width, height: t.height });
  await page.goto(BASE + t.path, { waitUntil: 'networkidle0', timeout: 30000 });
  // let preloader / initial animations settle
  await new Promise(r => setTimeout(r, 3200));

  // scroll slowly to the bottom using real wheel events so Lenis + IntersectionObserver
  // based scroll-reveal animations actually trigger (programmatic scrollTo does not)
  const height = await page.evaluate(() => document.body.scrollHeight);
  const steps = Math.ceil(height / 250);
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel({ deltaY: 300 });
    await new Promise(r => setTimeout(r, 90));
  }
  await new Promise(r => setTimeout(r, 700));

  // scroll back to top
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel({ deltaY: -400 });
    await new Promise(r => setTimeout(r, 60));
  }
  await new Promise(r => setTimeout(r, 500));

  const filePath = `${OUT_DIR}/${t.name}.png`;
  await page.screenshot({ path: filePath, fullPage: true });
  console.log(`saved: ${filePath}`);

  await page.close();
}

await browser.close();
console.log('done');
