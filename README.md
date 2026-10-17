# Hybrid Technology — website

Bilingual (EN/AR) marketing site for Hybrid Technology, Cairo. Astro + Lenis, static, hosted on the client's cPanel account (data4host). The product catalogue is edited from a built-in admin page that commits straight to this repo.

- Live: https://hybridtech-eg.com/ (Arabic: `/ar/`)
- Copy: `src/i18n/en.ts` and `src/i18n/ar.ts`
- Products: `src/data/products.json` + `src/data/categories.json`, edited from `/admin/` (see below); product photos live in `public/products/`
- Partners / clients: `src/data/partners.ts`, `src/data/clients.ts` (drop real client logos in `public/logos/clients/` and set `logo`)
- Brand assets: `public/brand/` (extracted from the letterhead with `scripts/extract-logo.py`)

```sh
pnpm install
pnpm dev
pnpm build
```

## Deploy

Every push to `main` runs `.github/workflows/deploy.yml`: it builds the site and uploads `dist/` to `public_html/` on `server.data4host.com` over FTPS (only changed files). It needs two repository secrets, `FTP_USERNAME` and `FTP_PASSWORD` (the cPanel login, or a cPanel FTP account whose folder is `public_html`). Apache settings (https/www redirect, 404 page, caching) are in `public/.htaccess`.

The old address `https://yassin-younis.github.io/hybridtech/` forwards every link to the same page on the new domain (`.github/workflows/pages-redirect.yml`).

## Brochures (PDF)

Two English A4 brochures are served from `public/brochures/` and linked from the footer, the Solutions page and the Software page (they download, see `public/.htaccess`): the company profile and the software brochure. They are HTML pages in `brochures/` rendered with Chrome; the copy comes from `src/i18n/en.ts` and `src/data/`, so regenerate after changing it:

```sh
node --experimental-strip-types brochures/build.mjs   # needs `brew install qrencode`
```

`brochures/img/` holds the software scenes and website screenshots, captured from a local preview with `node brochures/capture.mjs` (run `pnpm build && pnpm preview --port 4329` first). Re-capture when the software scenes or the homepage hero change.

## Catalogue admin (`/admin/`)

`https://hybridtech-eg.com/admin/` is a static page (`src/pages/admin/`, `src/scripts/admin/`) that edits products, categories, photos and prices. It is not linked from the site, is excluded from the sitemap and robots, and needs a GitHub token to do anything. **Publish** writes one commit to `main` through the GitHub API (products.json, categories.json, new/removed photos), and the normal deploy workflow uploads it in about two minutes. Photos are resized in the browser (max 1200 px, WebP) before upload.

Giving someone access (one-time, done by the repo owner):

1. GitHub → Settings → Developer settings → Personal access tokens → **Fine-grained tokens** → Generate.
   Repository access: *Only select repositories* → `hybridtech`. Permissions: **Contents: Read and write** (required), **Actions: Read** (optional, lets the panel show "Live" after the deploy). Expiry: up to 1 year.
2. Send them the one-time link `https://hybridtech-eg.com/admin/#token=<token>` and ask them to open it once and delete the message. The page stores the token on that device and removes it from the address bar. (They can also paste the token into the Connect screen.)
3. To revoke, delete the token on GitHub. A leaked token can only change the contents of this public repo; the site is rebuilt from git, so anything can be restored.

Testing without touching the live site: run `localStorage.setItem('hy_admin_branch', 'some-branch')` in the browser console before connecting and the panel reads and commits on that branch instead of `main`.
