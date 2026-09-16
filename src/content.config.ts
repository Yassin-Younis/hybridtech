import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { file } from 'astro/loaders';

const l = z.object({ en: z.string(), ar: z.string() });

const products = defineCollection({
  loader: file('src/data/products.json'),
  schema: z.object({
    id: z.string(),
    category: z.enum(['laptops', 'desktops', 'servers', 'networking', 'security', 'storage', 'ups', 'printers', 'surveillance', 'software']),
    brand: z.string(),
    model: z.string(),
    name: l,
    blurb: l,
    specs: z.array(z.string()).default([]),
    tags: z.array(z.string()).optional(),
    featured: z.boolean().default(false),
    deal: z.object({ label: l }).optional(),
    image: z.string().optional(),
    sku: z.string().optional(),
    price: z.object({ amount: z.number(), currency: z.string().default('EGP') }).optional(),
    datasheet: z.string().url().optional(),
  }),
});

export const collections = { products };
