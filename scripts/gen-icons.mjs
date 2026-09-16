// Favicons from the extracted mark. Rounded deep-blue tile with the white arc mark.
import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'node:fs';
const mark = readFileSync('public/brand/mark-mono.svg', 'utf8');
const vb = mark.match(/viewBox="([^"]+)"/)[1].split(' ').map(Number);
const paths = [...mark.matchAll(/ d="([^"]+)"/g)].map((m) => m[1]);
const S = 512, pad = 96;
const scale = (S - pad * 2) / Math.max(vb[2], vb[3]);
const tx = pad - vb[0] * scale + ((S - pad * 2) - vb[2] * scale) / 2;
const ty = pad - vb[1] * scale + ((S - pad * 2) - vb[3] * scale) / 2;
const svg = (bg = true) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}">${bg ? `<rect width="${S}" height="${S}" rx="112" fill="#00466b"/>` : ''}<g transform="translate(${tx} ${ty}) scale(${scale})" fill="#ffffff">${paths.map((d) => `<path d="${d}"/>`).join('')}</g></svg>`;
writeFileSync('public/favicon.svg', svg());
for (const [name, size] of [['favicon-32.png', 32], ['apple-touch-icon.png', 180], ['icon-192.png', 192], ['icon-512.png', 512]]) {
  await sharp(Buffer.from(svg())).resize(size, size).png().toFile(`public/${name}`);
}
console.log('icons ok');
