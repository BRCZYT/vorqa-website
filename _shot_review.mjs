import puppeteer from 'puppeteer';

const base = 'https://zyt-website.vercel.app';
const outDir = 'temporary screenshots';
const browser = await puppeteer.launch({ headless: 'new' });

async function shoot(path, viewport, outName) {
  const page = await browser.newPage();
  await page.setViewport(viewport);
  await page.goto(base + path, { waitUntil: 'networkidle0', timeout: 45000 });
  await new Promise(r => setTimeout(r, 1200));
  // Real wheel events — Lenis smooth-scroll intercepts/ignores window.scrollTo(),
  // so scroll-reveal (.rv/.rv.on via IntersectionObserver) never fires without this.
  let lastHeight = 0;
  for (let i = 0; i < 60; i++) {
    await page.mouse.wheel({ deltaY: 600 });
    await new Promise(r => setTimeout(r, 180));
    const h = await page.evaluate(() => document.body.scrollHeight);
    const y = await page.evaluate(() => window.scrollY);
    const atBottom = await page.evaluate(() => window.scrollY + window.innerHeight >= document.body.scrollHeight - 5);
    if (atBottom) break;
  }
  // scroll back to top for the final full-page capture
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: `${outDir}/${outName}`, fullPage: true });
  await page.close();
  console.log('saved', outName);
}

await shoot('/en/', { width: 1440, height: 900 }, 'review-01-home-en-desktop.png');
await shoot('/en/academy/', { width: 1440, height: 900 }, 'review-02-academy-en-desktop.png');
await shoot('/en/contact/', { width: 1440, height: 900 }, 'review-03-contact-en-desktop.png');
await shoot('/en/', { width: 390, height: 844 }, 'review-04-home-en-mobile.png');
await shoot('/ar/', { width: 1440, height: 900 }, 'review-05-home-ar-desktop-rtl.png');

await browser.close();
