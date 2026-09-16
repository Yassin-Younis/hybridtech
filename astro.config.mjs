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
    }),
  ],
  build: { inlineStylesheets: 'auto' },
});
