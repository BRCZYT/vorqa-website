import puppeteer from 'puppeteer';

const out = 'C:/Users/SATNAL~1/AppData/Local/Temp/claude/c-----yedek-brc-ZYT-website/2a94e919-465e-4642-b42d-3c4641ab7553/scratchpad';
const browser = await puppeteer.launch();
let failures = 0;

async function checkPage(url, viewport, label) {
  const page = await browser.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(e.message));
  await page.setViewport(viewport);
  await page.goto('http://localhost:3000' + url, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));

  async function state() {
    return page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('.nav-logo-img'));
      const visible = imgs.find(i => getComputedStyle(i).display !== 'none') || imgs[0];
      const r = visible.getBoundingClientRect();
      return {
        src: visible.src.split('/').pop(),
        w: +r.width.toFixed(1), h: +r.height.toFixed(1),
        ratio: +(r.width / r.height).toFixed(3),
        naturalW: visible.naturalWidth, naturalH: visible.naturalHeight,
        naturalRatio: +(visible.naturalWidth / visible.naturalHeight).toFixed(3),
        scrolled: document.getElementById('nav').classList.contains('scrolled'),
      };
    });
  }

  const before = await state();
  await page.evaluate(() => window.scrollTo(0, 300));
  await new Promise(r => setTimeout(r, 2500));
  const after = await state();

  const beforeOk = Math.abs(before.ratio - before.naturalRatio) < 0.02;
  const afterOk = Math.abs(after.ratio - after.naturalRatio) < 0.02;
  const noBrokenFile = !before.src.includes('main_cropped') && !after.src.includes('main_cropped');
  const ok = beforeOk && afterOk && noBrokenFile && errors.length === 0;
  console.log(`${ok ? 'OK ' : 'FAIL'} ${label} ${url}`);
  console.log('   before:', JSON.stringify(before));
  console.log('   after: ', JSON.stringify(after));
  if (errors.length) console.log('   errors:', errors.join(' | '));
  if (!ok) failures++;
  await page.close();
}

await checkPage('/tr/akademi/index.html', { width: 1440, height: 900 }, 'DESKTOP');
await checkPage('/tr/akademi/index.html', { width: 390, height: 844 }, 'MOBILE');
await checkPage('/en/academy/index.html', { width: 1440, height: 900 }, 'DESKTOP');
await checkPage('/ar/academy/index.html', { width: 1440, height: 900 }, 'DESKTOP');

// Also screenshot the scrolled academy nav for visual confirmation
const shot = await browser.newPage();
await shot.setViewport({ width: 1440, height: 300 });
await shot.goto('http://localhost:3000/tr/akademi/index.html', { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 1000));
await shot.evaluate(() => window.scrollTo(0, 300));
await new Promise(r => setTimeout(r, 2500));
await shot.screenshot({ path: out + '/akademi_logo_scrolled.png' });
await shot.close();

await browser.close();
console.log(failures === 0 ? 'ALL PASS' : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
