# Hybrid Technology — website

Bilingual (EN/AR) marketing site for Hybrid Technology, Cairo. Astro + Lenis, static, deployed to GitHub Pages. The product catalogue is edited from a built-in admin page that commits straight to this repo.

- Live: https://yassin-younis.github.io/hybridtech/ (Arabic: `/ar/`)
- Copy: `src/i18n/en.ts` and `src/i18n/ar.ts`
- Products: `src/data/products.json` + `src/data/categories.json`, edited from `/admin/` (see below); product photos live in `public/products/`
- Partners / clients: `src/data/partners.ts`, `src/data/clients.ts` (drop real client logos in `public/logos/clients/` and set `logo`)
- Brand assets: `public/brand/` (extracted from the letterhead with `scripts/extract-logo.py`)

```sh
pnpm install
pnpm dev
pnpm build
```

Custom domain later: set `site: 'https://hybridtech-eg.com'`, `base: '/'` in `astro.config.mjs`, add `public/CNAME`, update `public/robots.txt` and `public/site.webmanifest`.

## Catalogue admin (`/admin/`)

`https://yassin-younis.github.io/hybridtech/admin/` is a static page (`src/pages/admin/`, `src/scripts/admin/`) that edits products, categories, photos and prices. It is not linked from the site, is excluded from the sitemap and robots, and needs a GitHub token to do anything. **Publish** writes one commit to `main` through the GitHub API (products.json, categories.json, new/removed photos), and the normal Pages workflow deploys it in about two minutes. Photos are resized in the browser (max 1200 px, WebP) before upload.

Giving someone access (one-time, done by the repo owner):

1. GitHub → Settings → Developer settings → Personal access tokens → **Fine-grained tokens** → Generate.
   Repository access: *Only select repositories* → `hybridtech`. Permissions: **Contents: Read and write** (required), **Actions: Read** (optional, lets the panel show "Live" after the deploy). Expiry: up to 1 year.
2. Send them the one-time link `https://yassin-younis.github.io/hybridtech/admin/#token=<token>` and ask them to open it once and delete the message. The page stores the token on that device and removes it from the address bar. (They can also paste the token into the Connect screen.)
3. To revoke, delete the token on GitHub. A leaked token can only change the contents of this public repo; the site is rebuilt from git, so anything can be restored.

Testing without touching the live site: run `localStorage.setItem('hy_admin_branch', 'some-branch')` in the browser console before connecting and the panel reads and commits on that branch instead of `main`.
