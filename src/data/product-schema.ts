// Single source of truth for a product: used by the content collection at build time and by the
// admin panel in the browser to validate before publishing.
import { z } from 'astro/zod';
import { categories } from './categories';

const l = z.object({ en: z.string().trim().min(1), ar: z.string().trim().min(1) });
const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const makeProductSchema = (categoryIds: string[]) =>
  z.object({
    id: z.string().regex(slug, 'lowercase letters, digits and dashes only'),
    category: z.string().refine((c) => categoryIds.includes(c), 'unknown category'),
    brand: z.string().trim().min(1),
    model: z.string().trim().min(1),
    name: l,
    blurb: l,
    specs: z.array(z.string().trim().min(1)).default([]),
    tags: z.array(z.string().trim().min(1)).optional(),
    featured: z.boolean().default(false),
    deal: z.object({ label: l }).optional(),
    image: z.string().regex(/^products\/[a-z0-9-]+\.(webp|jpg|jpeg|png)$/, 'image path').optional(),
    sku: z.string().trim().min(1).optional(),
    price: z.object({ amount: z.number().positive(), currency: z.string().default('EGP') }).optional(),
    datasheet: z.url().optional(),
  });

export const productSchema = makeProductSchema(categories.map((c) => c.id));
export type Product = z.infer<typeof productSchema>;
export type ProductInput = z.input<typeof productSchema>;

const iconNames = ['laptop', 'desktop', 'server', 'network', 'shield', 'storage', 'power', 'printer', 'camera', 'cloud', 'headset', 'wrench', 'layers', 'wifi', 'spark', 'lock', 'key', 'phone', 'building', 'gauge', 'target', 'award', 'users', 'refresh', 'eye', 'coins'] as const;
export const categoryIcons: readonly string[] = iconNames;

export const categorySchema = z.object({
  id: z.string().regex(slug, 'lowercase letters, digits and dashes only'),
  icon: z.string().refine((i) => iconNames.includes(i as (typeof iconNames)[number]), 'unknown icon'),
  label: l,
});
