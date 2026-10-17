// Renders the two downloadable brochures to public/brochures/ with headless Chrome:
//   hybrid-technology-company-profile.pdf   (Hybrid Technology: solutions, hardware, partners, clients)
//   hybrid-technology-software.pdf          (the software department: websites, apps, ERP, automation)
// Copy comes from the site's own data (src/i18n/en.ts, src/data/*) so the PDFs say what the site says.
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
const icon = (name) => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${icons[name] ?? ''}</svg>`;

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

const fonts = [
  ['Chakra Petch', 500, '@fontsource/chakra-petch/files/chakra-petch-latin-500-normal.woff2'],
  ['Chakra Petch', 600, '@fontsource/chakra-petch/files/chakra-petch-latin-600-normal.woff2'],
  ['Chakra Petch', 700, '@fontsource/chakra-petch/files/chakra-petch-latin-700-normal.woff2'],
  ['Instrument Sans', 400, '@fontsource/instrument-sans/files/instrument-sans-latin-400-normal.woff2'],
  ['Instrument Sans', 600, '@fontsource/instrument-sans/files/instrument-sans-latin-600-normal.woff2'],
].map(([f, w, p]) => `@font-face { font-family: '${f}'; font-weight: ${w}; src: url('${url('node_modules/' + p)}') format('woff2'); }`).join('\n');
const css = fonts + readFileSync(at('brochures/brochure.css'), 'utf8');

const kit = { at, url, icon, board, qr, img };
const browser = await chromium.launch({ channel: 'chrome' });
for (const [file, make, title] of [
  ['hybrid-technology-company-profile', company, 'Hybrid Technology | Company Profile'],
  ['hybrid-technology-software', software, 'Hybrid Technology | Software Development'],
]) {
  const { style, body } = await make(kit);
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${title}</title><style>${css}\n${style}</style></head><body>${body}</body></html>`;
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
