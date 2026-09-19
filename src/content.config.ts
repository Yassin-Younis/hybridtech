import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { productSchema } from './data/product-schema';

const products = defineCollection({
  loader: file('src/data/products.json'),
  schema: productSchema,
});

export const collections = { products };
