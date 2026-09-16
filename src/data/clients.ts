export type Client = { name: string; nameAr: string; sector: { en: string; ar: string }; hex: string; logo?: string; mono?: string };
export const clients: Client[] = [
  { name: 'Al Ahly Sabbour', nameAr: 'الأهلي صبور', sector: { en: 'Real estate development', ar: 'التطوير العقاري' }, hex: '8A6D3B', mono: 'AS' },
  { name: 'Redcon Construction', nameAr: 'ريدكون للإنشاءات', sector: { en: 'Construction', ar: 'الإنشاءات' }, hex: '1B1B1B', mono: 'RC' },
  { name: 'QNB', nameAr: 'بنك قطر الوطني', sector: { en: 'Banking', ar: 'البنوك' }, hex: '6B1F5E', mono: 'QNB' },
  { name: 'Mashreq', nameAr: 'المشرق', sector: { en: 'Banking', ar: 'البنوك' }, hex: 'F26522', mono: 'MQ' },
  { name: 'Faisal Islamic Bank', nameAr: 'بنك فيصل الإسلامي', sector: { en: 'Banking', ar: 'البنوك' }, hex: '0E7A3E', mono: 'FIB' },
  { name: 'Hikma', nameAr: 'حكمة', sector: { en: 'Pharmaceuticals', ar: 'الأدوية' }, hex: 'E4002B', mono: 'HK' },
  { name: 'CCC', nameAr: 'شركة المقاولون المتحدون', sector: { en: 'Construction', ar: 'الإنشاءات' }, hex: 'C8102E', mono: 'CCC' },
  { name: 'Hyde Park Developments', nameAr: 'هايد بارك للتطوير', sector: { en: 'Real estate development', ar: 'التطوير العقاري' }, hex: '2B2B2B', mono: 'HP' },
  { name: 'The United Bank', nameAr: 'المصرف المتحد', sector: { en: 'Banking', ar: 'البنوك' }, hex: '0054A6', mono: 'UB' },
];
