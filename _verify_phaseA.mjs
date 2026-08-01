import puppeteer from 'puppeteer';

const BASE = 'https://zyt-website.vercel.app';
const browser = await puppeteer.launch();
const page = await browser.newPage();

async function check(path, expectStatus = 200) {
  const resp = await page.goto(BASE + path, { waitUntil: 'networkidle0', timeout: 30000 });
  const status = resp ? resp.status() : 'NO RESPONSE';
  const ok = status === expectStatus;
  console.log(`${ok ? 'OK ' : 'FAIL'} ${path} -> ${status} (expected ${expectStatus})`);
  return { path, status, ok };
}

console.log('=== Language homepages ===');
await check('/tr/');
await check('/en/');
await check('/ar/');

console.log('=== Academy pages ===');
await check('/tr/akademi/');
await check('/en/academy/');
await check('/ar/academy/');

console.log('=== Academy -> blog post link check (EN) ===');
await page.goto(BASE + '/en/academy/', { waitUntil: 'networkidle0' });
const firstBlogHref = await page.evaluate(() => {
  const a = document.querySelector('a[href*="/vorqa-blog/"]');
  return a ? a.getAttribute('href') : null;
});
console.log('found blog link:', firstBlogHref);
if (firstBlogHref) {
  await check(firstBlogHref);
}

console.log('=== Now-excluded internal paths (expect 404) ===');
await check('/docs/VORQA_Global_Website_Revision_Brief_for_Claude.md', 404);
await check('/vorqa-mira/mira.html', 404);
await check('/vorqa-mira/context/%E2%9C%85%20PLATFORM_RULES.md', 404);
await check('/vorqa-blog/generator/publisher.mjs', 404);
await check('/vorqa-blog/migrate-posts.mjs', 404);
await check('/Claude.md', 404);

console.log('=== Still-public assets that must NOT 404 ===');
await check('/vorqa-mira/Mira.webp');
await check('/brand_assets/vorqa_brand-kit.html');

await browser.close();
