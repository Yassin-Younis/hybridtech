// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// GitHub Pages: https://yassin-younis.github.io/hybridtech/
// When the real domain is attached: site 'https://hybridtech-eg.com', base '/', add public/CNAME.
export default defineConfig({
  site: 'https://yassin-younis.github.io',
  base: '/hybridtech',
  trailingSlash: 'ignore',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ar'],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'en', locales: { en: 'en', ar: 'ar' } },
      filter: (page) => !/\/(404|admin)\/?$/.test(page),
      serialize: (item) => {
        // Add an x-default alternate (pointing at the English URL) next to the en/ar pairs.
        const en = item.links?.find((l) => l.lang === 'en');
        if (en && !item.links?.some((l) => l.lang === 'x-default')) item.links = [...(item.links ?? []), { url: en.url, lang: 'x-default' }];
        item.lastmod = new Date().toISOString();
        return item;
      },
    }),
  ],
  // All page CSS is small (~10 KB gz across base + page styles); inlining it removes three
  // render-blocking requests and the extra round-trips on GitHub Pages.
  build: { inlineStylesheets: 'always' },
});
