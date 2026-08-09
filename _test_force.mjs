import puppeteer from 'puppeteer';
const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://localhost:3000/en/', { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 1500));
await page.evaluate(() => document.querySelector('#industries').scrollIntoView({ block: 'start' }));
await new Promise(r => setTimeout(r, 1500));

const info = await page.evaluate(() => {
  const panel = document.querySelector('.ind-panel');
  const style = document.createElement('style');
  style.textContent = '.ind-panel.force-hover{flex-basis:480px !important;border-color:orange !important}';
  document.head.appendChild(style);
  panel.classList.add('force-hover');
  const sheetRules = [...document.styleSheets].flatMap(s => {
    try { return [...s.cssRules].map(r => r.cssText); } catch (e) { return []; }
  }).filter(t => t.includes('force-hover'));
  const cs = getComputedStyle(panel);
  return {
    className: panel.className,
    flexBasis: cs.flexBasis,
    width: panel.getBoundingClientRect().width,
    injectedRuleFound: sheetRules
  };
});
console.log('immediately:', info);

const widths = [];
for (let i = 0; i < 12; i++) {
  const w = await page.evaluate(() => document.querySelector('.ind-panel').getBoundingClientRect().width);
  widths.push(Math.round(w));
  await new Promise(r => setTimeout(r, 60));
}
console.log('width samples over 720ms:', widths);
await browser.close();
