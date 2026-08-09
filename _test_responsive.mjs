import puppeteer from 'puppeteer';
const browser = await puppeteer.launch({ headless: 'new' });

async function testWidth(width, label, lang) {
  const page = await browser.newPage();
  await page.setViewport({ width, height: 900 });
  const consoleErrors = [];
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', (err) => consoleErrors.push(err.message));
  await page.goto(`http://localhost:3000/${lang}/`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2500));

  const layout = await page.evaluate(() => {
    const grid = document.querySelector('.showroom-grid');
    const col = document.querySelector('.showroom-how-col');
    const vit = document.querySelector('.showroom-vitrine');
    const colRect = col.getBoundingClientRect();
    const vitRect = vit.getBoundingClientRect();
    return {
      gridCols: getComputedStyle(grid).gridTemplateColumns,
      colLeft: Math.round(colRect.left), colWidth: Math.round(colRect.width),
      vitLeft: Math.round(vitRect.left), vitWidth: Math.round(vitRect.width),
    };
  });
  console.log(`\n[${label} / ${lang}] layout:`, JSON.stringify(layout));

  // scroll through and check pin + step behavior
  let pinned = false, pinDetected = false;
  const stepOpacities = [];
  for (let i = 0; i < 30; i++) {
    await page.mouse.wheel({ deltaY: 150 });
    await new Promise(r => setTimeout(r, 60));
    const info = await page.evaluate(() => {
      const scene = document.querySelector('#showroom-how');
      const r = scene.getBoundingClientRect();
      const steps = Array.from(document.querySelectorAll('#showroom-how .spine .step'));
      return {
        sceneTop: Math.round(r.top),
        opacities: steps.map(s => Math.round(parseFloat(getComputedStyle(s).opacity) * 100) / 100),
      };
    });
    if (info.sceneTop === 0) { pinned = true; pinDetected = true; }
    else if (pinned && info.sceneTop !== 0) pinned = false;
    stepOpacities.push(info.opacities.join(','));
  }
  const uniqueOpacityStates = [...new Set(stepOpacities)];
  console.log(`  pin detected: ${pinDetected}`);
  console.log(`  unique step-opacity states seen: ${uniqueOpacityStates.length} ->`, uniqueOpacityStates.slice(0, 8));

  // vitrine auto-scroll still animating?
  const animState = await page.evaluate(() => {
    const track = document.querySelector('.sr-col-down .sr-track');
    return track ? getComputedStyle(track).animationName : null;
  });
  console.log(`  vitrine animation-name: ${animState}`);

  if (consoleErrors.length) console.log('  CONSOLE ERRORS:', consoleErrors);
  await page.close();
  return { layout, pinDetected, uniqueOpacityStates, consoleErrors };
}

const results = {};
results['mobile-en'] = await testWidth(375, 'mobile', 'en');
results['tablet-en'] = await testWidth(800, 'tablet', 'en');
results['desktop-en'] = await testWidth(1440, 'desktop', 'en');
results['desktop-ar'] = await testWidth(1440, 'desktop', 'ar');

await browser.close();
console.log('\n\n=== SUMMARY ===');
console.log(JSON.stringify(results, null, 2));
