import puppeteer from 'puppeteer';

const widths = [375, 600, 768, 800, 820, 821, 900, 1024, 1280, 1440];

const browser = await puppeteer.launch();
let failures = 0;

for (const w of widths) {
  const page = await browser.newPage();
  await page.setViewport({ width: w, height: 900 });
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error' && !msg.text().includes('Failed to load resource')) errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.message));
  page.on('response', res => { if (res.status() >= 400 && !res.url().includes('favicon.ico')) errors.push(`HTTP ${res.status()} ${res.url()}`); });

  await page.goto('http://localhost:3000/index.html', { waitUntil: 'networkidle0', timeout: 30000 });

  // Let entrance animations / initial ScrollTrigger state settle without scrolling
  await new Promise(r => setTimeout(r, 800));

  const info = await page.evaluate(() => {
    const cells = Array.from(document.querySelectorAll('#showroom-how .spine .step-cell'));
    const visible = cells.map(c => {
      const s = getComputedStyle(c);
      return parseFloat(s.opacity) > 0.9;
    });
    const howCol = document.querySelector('.showroom-how-col');
    const vitrine = document.querySelector('.showroom-vitrine');
    const howRect = howCol.getBoundingClientRect();
    const vitRect = vitrine.getBoundingClientRect();
    const isMobileLayout = getComputedStyle(document.querySelector('.showroom-grid')).gridTemplateColumns.split(' ').length === 1;
    return {
      count: cells.length,
      visibleCount: visible.filter(Boolean).length,
      allVisible: visible.every(Boolean),
      isMobileLayout,
      vitrineBelowSteps: vitRect.top >= howRect.top,
    };
  });

  const expectMobile = w <= 820;
  let ok = true;
  const notes = [];
  if (expectMobile) {
    if (!info.allVisible) { ok = false; notes.push(`expected all 6 visible, got ${info.visibleCount}/${info.count}`); }
    if (!info.isMobileLayout) { ok = false; notes.push('expected single-column mobile layout'); }
    if (!info.vitrineBelowSteps) { ok = false; notes.push('expected vitrine below steps'); }
  } else {
    if (info.visibleCount !== 2) { ok = false; notes.push(`expected exactly 2 visible pre-scroll (desktop pin start), got ${info.visibleCount}`); }
    if (info.isMobileLayout) { ok = false; notes.push('unexpectedly in single-column layout'); }
  }
  if (errors.length) { ok = false; notes.push('console errors: ' + errors.join(' | ')); }

  console.log(`${ok ? 'OK ' : 'FAIL'} width=${w} visible=${info.visibleCount}/${info.count} mobileLayout=${info.isMobileLayout} vitrineBelow=${info.vitrineBelowSteps} ${notes.join('; ')}`);
  if (!ok) failures++;
  await page.close();
}

await browser.close();
console.log(failures === 0 ? 'ALL PASS' : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
