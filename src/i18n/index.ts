import { en } from './en';
import { ar } from './ar';
import type { Dictionary } from './en';

export type Lang = 'en' | 'ar';
export const langs: Lang[] = ['en', 'ar'];
const dict: Record<Lang, Dictionary> = { en, ar };

export const t = (lang: Lang): Dictionary => dict[lang];
export const dirOf = (lang: Lang) => (lang === 'ar' ? 'rtl' : 'ltr');
export const otherLang = (lang: Lang): Lang => (lang === 'ar' ? 'en' : 'ar');
export const pick = (lang: Lang, v: { en: string; ar: string }) => v[lang];
export const fill = (s: string, vars: Record<string, string | number>) =>
  s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));

/** Base-aware path builder: path('/products') -> '/hybridtech/products' or '/hybridtech/ar/products' */
export const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
export const path = (lang: Lang, p = '/') => {
  const clean = p.startsWith('/') ? p : `/${p}`;
  const withLang = lang === 'en' ? clean : `/ar${clean === '/' ? '' : clean}`;
  const out = `${base}${withLang}`;
  return out === '' ? '/' : out.endsWith('/') ? out : `${out}/`;
};
export const asset = (p: string) => `${base}/${p.replace(/^\//, '')}`;
