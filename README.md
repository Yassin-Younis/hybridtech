# Hybrid Technology — website

Bilingual (EN/AR) marketing site for Hybrid Technology, Cairo. Astro + GSAP + Lenis, no CMS, deployed to GitHub Pages.

- Live: https://yassin-younis.github.io/hybridtech/ (Arabic: `/ar/`)
- Copy: `src/i18n/en.ts` and `src/i18n/ar.ts`
- Products: `src/data/products.json` (add `price` to show prices, `image` for photos, `deal` for a ribbon)
- Partners / clients: `src/data/partners.ts`, `src/data/clients.ts` (drop real client logos in `public/logos/clients/` and set `logo`)
- Brand assets: `public/brand/` (extracted from the letterhead with `scripts/extract-logo.py`)

```sh
pnpm install
pnpm dev
pnpm build
```

Custom domain later: set `site: 'https://hybridtech-eg.com'`, `base: '/'` in `astro.config.mjs`, add `public/CNAME`, update `public/robots.txt` and `public/site.webmanifest`.
