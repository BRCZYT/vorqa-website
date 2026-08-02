import puppeteer from 'puppeteer';
const base = 'http://localhost:3000';
const browser = await puppeteer.launch({ headless: 'new' });
let allOk = true;

for (const [lang, path] of [['tr','/tr/'],['en','/en/'],['ar','/ar/']]) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  const consoleErrors = [];
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', (err) => consoleErrors.push(err.message));

  await page.goto(base + path, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1600));

  const info = await page.evaluate(() => {
    const h1 = document.querySelector('.hero-h1');
    const chars = h1.querySelectorAll('.char').length;
    const words = h1.querySelectorAll('.word').length;
    // sample first word's innerHTML to check char count inside it (should be 0 for AR)
    const firstWord = h1.querySelector('.word');
    const charsInsideFirstWord = firstWord ? firstWord.querySelectorAll('.char').length : 0;
    return { lang: document.documentElement.lang, dir: document.documentElement.dir, chars, words, charsInsideFirstWord, text: h1.textContent.slice(0,30) };
  });
  console.log(`[${lang}]`, JSON.stringify(info));
  if (lang === 'ar' && info.chars !== 0) { allOk = false; console.log('  FAIL: AR should have 0 .char spans (word-level only)'); }
  if (lang === 'ar' && info.words === 0) { allOk = false; console.log('  FAIL: AR should have .word spans'); }
  if (lang !== 'ar' && info.chars === 0) { allOk = false; console.log(`  FAIL: ${lang} should have char-level spans`); }
  if (consoleErrors.length) { allOk = false; console.log('  CONSOLE ERRORS:', consoleErrors); }

  await page.screenshot({ path: `temporary screenshots/hero-fix-${lang}.png`, clip: { x: 0, y: 0, width: 1440, height: 500 } });
  await page.close();
}
await browser.close();
console.log(allOk ? '\nALL OK' : '\nISSUES FOUND');
process.exit(allOk ? 0 : 1);
