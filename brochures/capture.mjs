// Captures the pictures the brochures reuse from the built site into brochures/img/:
// the four software scenes as the problem (--p 0) and the fix (--p 1), and the website itself on a
// laptop and a phone. Run against a local preview:  pnpm build && pnpm preview --port 4329
//   node brochures/capture.mjs            (SITE=http://127.0.0.1:4329 by default)
import { chromium } from 'playwright';

const site = process.env.SITE ?? 'http://127.0.0.1:4329';
const out = new URL('./img/', import.meta.url).pathname;
const browser = await chromium.launch({ channel: 'chrome' });
// Reduced motion: no logo intro, reveals already shown, scenes sit at --p 1 unless we set it.
const context = (viewport, deviceScaleFactor) => browser.newContext({ viewport, deviceScaleFactor, reducedMotion: 'reduce', locale: 'en-US' });

{
  const ctx = await context({ width: 1280, height: 900 }, 2);
  const page = await ctx.newPage();
  await page.goto(`${site}/software/`, { waitUntil: 'networkidle' });
  // Transparent shots: drop the dark section backdrop so the scene sits on the brochure's own page.
  await page.addStyleTag({ content: 'html, body, .sw { background: transparent !important; } .sw__spot, .sw .circuit { display: none !important; }' });
  for (const id of ['web', 'app', 'erp', 'auto']) {
    const stage = page.locator(`.ch--${id} .ch__stage`);
    for (const [state, p] of [['problem', 0], ['fix', 1]]) {
      await stage.evaluate((el, v) => el.style.setProperty('--p', String(v)), p);
      await page.waitForTimeout(200);
      await stage.screenshot({ path: `${out}scene-${id}-${state}.png`, omitBackground: true });
    }
  }
  await ctx.close();
}

for (const [name, viewport, scale] of [['site-desktop', { width: 1440, height: 900 }, 1.5], ['site-phone', { width: 390, height: 844 }, 3]]) {
  const ctx = await context(viewport, scale);
  const page = await ctx.newPage();
  await page.goto(`${site}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${out}${name}.jpg`, type: 'jpeg', quality: 86 });
  await ctx.close();
}

await browser.close();
console.log('captured into', out);
