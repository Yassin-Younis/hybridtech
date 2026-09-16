// OG images: deep-blue field, white logo, orange/blue slanted bars like the letterhead footer. No text (fonts vary per renderer).
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
const logo = readFileSync('public/brand/logo-mono.svg', 'utf8');
const vb = logo.match(/viewBox="([^"]+)"/)[1].split(' ').map(Number);
const paths = [...logo.matchAll(/ d="([^"]+)"/g)].map((m) => m[1]);
const W = 1200, H = 630, lw = 760, scale = lw / vb[2], lh = vb[3] * scale;
const tx = (W - lw) / 2 - vb[0] * scale, ty = (H - lh) / 2 - 30 - vb[1] * scale;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs><radialGradient id="g" cx="85%" cy="10%" r="110%"><stop offset="0" stop-color="#0a6a97"/><stop offset="0.42" stop-color="#00466b"/><stop offset="1" stop-color="#00263d"/></radialGradient></defs>
<rect width="${W}" height="${H}" fill="url(#g)"/>
<g stroke="#ffffff" stroke-opacity="0.08" stroke-width="2" fill="none"><path d="M900 40 L1040 40 L1120 120 L1120 300"/><path d="M1000 630 L1000 480 L1080 400 L1200 400"/><path d="M60 560 L200 560 L260 500 L420 500"/><circle cx="1120" cy="300" r="10"/><circle cx="420" cy="500" r="10"/><circle cx="900" cy="40" r="10"/></g>
<g transform="translate(${tx} ${ty}) scale(${scale})" fill="#ffffff">${paths.map((d) => `<path d="${d}"/>`).join('')}</g>
<polygon points="0,${H - 46} 380,${H - 46} 352,${H} 0,${H}" fill="#f1511b"/>
<polygon points="352,${H - 46} ${W},${H - 46} ${W},${H} 324,${H}" fill="#005e8a"/>
</svg>`;
for (const l of ['en', 'ar']) await sharp(Buffer.from(svg)).png().toFile(`public/og/og-${l}.png`);
console.log('og ok');
