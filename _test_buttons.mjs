import puppeteer from 'puppeteer';
const browser = await puppeteer.launch({ headless: 'new' });

async function testPage(urlPath, viewport, label) {
  const page = await browser.newPage();
  await page.setViewport(viewport);
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://localhost:3000' + urlPath, { waitUntil: 'networkidle0', timeout: 45000 });
  await new Promise(r => setTimeout(r, 2000));

  const results = {};

  // 1. Sector tabs: click "Complete Galvanizing" tab (2nd), check active class moves
  const tabResult = await page.evaluate(() => {
    const tabs = [...document.querySelectorAll('.s-tab')];
    const before = tabs.map(t => t.classList.contains('active'));
    tabs[1]?.click();
    const after = tabs.map(t => t.classList.contains('active'));
    return { before, after, tab1Text: tabs[1]?.textContent };
  });
  results.sectorTabClick = tabResult;

  // 2. prev/next arrows
  const arrowResult = await page.evaluate(() => {
    const active = () => [...document.querySelectorAll('.s-tab')].findIndex(t => t.classList.contains('active'));
    const startIdx = active();
    document.getElementById('next-sec')?.click();
    const afterNext = active();
    document.getElementById('prev-sec')?.click();
    const afterPrev = active();
    return { startIdx, afterNext, afterPrev };
  });
  results.arrowClick = arrowResult;

  // 3. Hamburger menu (mobile nav open/close) — only meaningful at narrow width but test the class toggle regardless
  const hamResult = await page.evaluate(() => {
    const btn = document.getElementById('ham-btn');
    if (!btn) return 'NO_HAM_BTN';
    const beforeOpen = btn.classList.contains('open');
    btn.click();
    const afterOpen = btn.classList.contains('open');
    btn.click();
    const afterClose = btn.classList.contains('open');
    return { beforeOpen, afterOpen, afterClose };
  });
  results.hamburgerClick = hamResult;

  // 4. Back-to-top button: scroll down, check it appears, click it, check scrollY resets
  await page.evaluate(() => window.scrollTo(0, 2000));
  await new Promise(r => setTimeout(r, 500));
  const bttVisibleBefore = await page.evaluate(() => document.getElementById('btt')?.classList.contains('vis'));
  await page.evaluate(() => document.getElementById('btt')?.click());
  await new Promise(r => setTimeout(r, 800));
  const scrollYAfter = await page.evaluate(() => window.scrollY);
  results.backToTop = { bttVisibleBefore, scrollYAfter };

  // 5. Language switcher links: check they point to correct sibling-locale URL
  const langLinks = await page.evaluate(() => [...document.querySelectorAll('.l-btn')].map(b => ({ lang: b.dataset.lang, href: b.getAttribute('href') })));
  results.langLinks = langLinks;

  console.log(`\n=== ${label} (${urlPath}) ===`);
  console.log(JSON.stringify(results, null, 1));
  console.log('console errors:', errors.length ? errors : 'none');

  await page.close();
}

await testPage('/en/', { width: 1440, height: 900 }, 'desktop');
await testPage('/en/', { width: 375, height: 800 }, 'mobile');
await browser.close();
