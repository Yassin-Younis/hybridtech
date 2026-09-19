// Product categories. Edited from the admin panel (/admin/), which commits categories.json.
import raw from './categories.json';

export interface Category { id: string; icon: string; label: { en: string; ar: string } }
export const categories: Category[] = raw;
export type CategoryId = string;
