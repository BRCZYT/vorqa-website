import fs from 'fs';
import * as cheerio from 'cheerio';

const pairs = [
  ['tr/hakkimizda/index.html', 'en/about/index.html'],
  ['tr/beton/index.html', 'en/concrete/index.html'],
  ['tr/galvaniz/index.html', 'en/galvanizing/index.html'],
  ['tr/enerji/index.html', 'en/waste-to-energy/index.html'],
  ['tr/celik-yapi/index.html', 'en/steel-fabrication/index.html'],
  ['tr/tedarik-zinciri/index.html', 'en/supply-chain/index.html'],
  ['tr/referanslar/index.html', 'en/references/index.html'],
  ['tr/akademi/index.html', 'en/academy/index.html'],
  ['tr/iletisim/index.html', 'en/contact/index.html'],
];

for (const [trF, enF] of pairs) {
  const $tr = cheerio.load(fs.readFileSync(trF, 'utf8'));
  const $en = cheerio.load(fs.readFileSync(enF, 'utf8'));
  const trTexts = [], enTexts = [];
  $tr('h1,h2,h3,h4,p,span,div,a,button').each((_, el) => { const t = $tr(el).clone().children().remove().end().text().trim(); if (t.length > 3) trTexts.push(t); });
  $en('h1,h2,h3,h4,p,span,div,a,button').each((_, el) => { const t = $en(el).clone().children().remove().end().text().trim(); if (t.length > 3) enTexts.push(t); });
  const enSet = new Set(enTexts);
  const common = trTexts.filter(t => enSet.has(t));
  const suspicious = [...new Set(common.filter(t => /[a-zçğıöşü]{4,}/i.test(t) && !/^(Vorqa|VORQA|Global|MENA|Ankara|EN 1090|ISO |TR|EN|AR|CE\b|STARTING|Initializing|Built for industry)/.test(t)))];
  console.log(`=== ${trF} vs ${enF} ===`, suspicious.length, 'suspicious');
  suspicious.slice(0, 15).forEach(t => console.log('  -', t.slice(0, 90)));
}
