// Renders the downloadable brochures to public/brochures/ with headless Chrome, in English and Arabic (-ar):
//   hybrid-technology-company-profile[-ar].pdf   (Hybrid Technology: solutions, hardware, partners, clients)
//   hybrid-technology-software[-ar].pdf          (the software department: websites, apps, ERP, automation)
// Copy comes from the site's own data (src/i18n/*.ts, src/data/*) so the PDFs say what the site says.
// Needs: brochures/img/ (from capture.mjs, committed), qrencode (brew install qrencode).
//   node --experimental-strip-types brochures/build.mjs
import { chromium } from 'playwright';
import sharp from 'sharp';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import company from './company.mjs';
import software from './software.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const at = (p) => `${root}${p}`;
const url = (p) => pathToFileURL(at(p)).href;
const cache = 'brochures/.cache/';
mkdirSync(at(cache), { recursive: true });
mkdirSync(at('public/brochures'), { recursive: true });

/** Site icons (src/components/Icon.astro), as inline SVG. */
const iconSrc = readFileSync(at('src/components/Icon.astro'), 'utf8');
const icons = Object.fromEntries([...iconSrc.matchAll(/^\s+'?([a-z-]+)'?: '(<.+>)',$/gm)].map((m) => [m[1], m[2]]));
/** `dir` marks arrows that point the reading direction (mirrored in Arabic). */
const icon = (name, dir) => `<svg class="icon${dir ? ' icon--dir' : ''}" viewBox="0 0 24 24" aria-hidden="true">${icons[name] ?? ''}</svg>`;

/** Circuit board drawing from the site hero (src/data/circuit.ts). */
const { circuit } = await import(url('src/data/circuit.ts'));
const board = (cls) => `<div class="circuit ${cls}"><svg viewBox="0 0 ${circuit.w} ${circuit.h}">${circuit.paths.map((d) => `<path class="trace" d="${d}"/>`).join('')}${circuit.nodes.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="currentColor"/>`).join('')}</svg></div>`;

const qr = (text) => execFileSync('qrencode', ['-t', 'SVG', '-m', '0', '-l', 'M', '--foreground=00263d', '-o', '-', text], { encoding: 'utf8' }).replace(/<\?xml[^>]*>|<!DOCTYPE[^>]*>/g, '').replace(/width="[^"]*" height="[^"]*"/, '');

/** Photos as JPEG and cut-outs/scenes as smaller PNG, so the PDFs stay light enough to send on WhatsApp. */
async function img(src, { w = 1100, png = false } = {}) {
  const name = src.split('/').pop().replace(/\.\w+$/, png ? '.png' : '.jpg');
  const out = at(cache + name);
  const s = sharp(at(src)).resize({ width: w, withoutEnlargement: true });
  await (png ? s.png({ compressionLevel: 9, palette: true, quality: 92, effort: 10 }) : s.flatten({ background: '#ffffff' }).jpeg({ quality: 80, mozjpeg: true })).toFile(out);
  return pathToFileURL(out).href;
}

// Same subsets as src/styles/fonts.css, so Arabic and Latin each come from their own El Messiri file.
const range = { arabic: 'U+0600-06FF,U+0750-077F,U+0870-088E,U+0890-0891,U+0897-08E1,U+08E3-08FF,U+200C-200E,U+2010-2011,U+204F,U+2E41,U+FB50-FDFF,U+FE70-FE74,U+FE76-FEFC,U+102E0-102FB,U+10E60-10E7E,U+10EC2-10EC4,U+10EFC-10EFF,U+1EE00-1EE03,U+1EE05-1EE1F,U+1EE21-1EE22,U+1EE24,U+1EE27,U+1EE29-1EE32,U+1EE34-1EE37,U+1EE39,U+1EE3B,U+1EE42,U+1EE47,U+1EE49,U+1EE4B,U+1EE4D-1EE4F,U+1EE51-1EE52,U+1EE54,U+1EE57,U+1EE59,U+1EE5B,U+1EE5D,U+1EE5F,U+1EE61-1EE62,U+1EE64,U+1EE67-1EE6A,U+1EE6C-1EE72,U+1EE74-1EE77,U+1EE79-1EE7C,U+1EE7E,U+1EE80-1EE89,U+1EE8B-1EE9B,U+1EEA1-1EEA3,U+1EEA5-1EEA9,U+1EEAB-1EEBB,U+1EEF0-1EEF1', latin: 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD' };
const fonts = [
  ['Chakra Petch', 500, '@fontsource/chakra-petch/files/chakra-petch-latin-500-normal.woff2'],
  ['Chakra Petch', 600, '@fontsource/chakra-petch/files/chakra-petch-latin-600-normal.woff2'],
  ['Chakra Petch', 700, '@fontsource/chakra-petch/files/chakra-petch-latin-700-normal.woff2'],
  ['Instrument Sans', 400, '@fontsource/instrument-sans/files/instrument-sans-latin-400-normal.woff2'],
  ['Instrument Sans', 600, '@fontsource/instrument-sans/files/instrument-sans-latin-600-normal.woff2'],
  ...[400, 600, 700].flatMap((w) => ['arabic', 'latin'].map((sub) => ['El Messiri', w, `@fontsource/el-messiri/files/el-messiri-${sub}-${w}-normal.woff2`, range[sub]])),
].map(([f, w, p, r]) => `@font-face { font-family: '${f}'; font-weight: ${w}; src: url('${url('node_modules/' + p)}') format('woff2');${r ? ` unicode-range: ${r};` : ''} }`).join('\n');
const css = fonts + readFileSync(at('brochures/brochure.css'), 'utf8');

const kit = { at, url, icon, board, qr, img };
const browser = await chromium.launch({ channel: 'chrome' });
for (const lang of ['en', 'ar']) for (const [name, make] of [['hybrid-technology-company-profile', company], ['hybrid-technology-software', software]]) {
  const file = name + (lang === 'ar' ? '-ar' : '');
  const { title, style, body } = await make(kit, lang);
  const html = `<!doctype html><html lang="${lang}" dir="${lang === 'ar' ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><title>${title}</title><style>${css}\n${style}</style></head><body>${body}</body></html>`;
  const htmlPath = at(`${cache}${file}.html`);
  writeFileSync(htmlPath, html);
  const page = await browser.newPage();
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  if (process.env.PNG) await page.screenshot({ path: at(`${cache}${file}.png`), fullPage: true });
  await page.pdf({ path: at(`public/brochures/${file}.pdf`), format: 'A4', printBackground: true, preferCSSPageSize: true, tagged: true });
  await page.close();
  console.log('wrote', `public/brochures/${file}.pdf`);
}
await browser.close();
