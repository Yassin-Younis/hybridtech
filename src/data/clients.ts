export type Client = { name: string; nameAr: string; sector: { en: string; ar: string }; hex: string; logo?: string; mono?: string };
export const clients: Client[] = [
  { name: 'Al Ahly Sabbour', logo: 'al-ahly-sabbour.svg', nameAr: 'الأهلي صبور', sector: { en: 'Real estate development', ar: 'التطوير العقاري' }, hex: '8A6D3B', mono: 'AS' },
  { name: 'Redcon Construction', logo: 'redcon.png', nameAr: 'ريدكون للإنشاءات', sector: { en: 'Construction', ar: 'الإنشاءات' }, hex: '1B1B1B', mono: 'RC' },
  { name: 'QNB', logo: 'qnb.svg', nameAr: 'بنك قطر الوطني', sector: { en: 'Banking', ar: 'البنوك' }, hex: '6B1F5E', mono: 'QNB' },
  { name: 'Mashreq', logo: 'mashreq.png', nameAr: 'المشرق', sector: { en: 'Banking', ar: 'البنوك' }, hex: 'F26522', mono: 'MQ' },
  { name: 'Faisal Islamic Bank', logo: 'faisal-islamic-bank.svg', nameAr: 'بنك فيصل الإسلامي', sector: { en: 'Banking', ar: 'البنوك' }, hex: '0E7A3E', mono: 'FIB' },
  { name: 'Hikma', logo: 'hikma.svg', nameAr: 'حكمة', sector: { en: 'Pharmaceuticals', ar: 'الأدوية' }, hex: 'E4002B', mono: 'HK' },
  { name: 'CCC', logo: 'ccc.png', nameAr: 'شركة المقاولون المتحدون', sector: { en: 'Construction', ar: 'الإنشاءات' }, hex: 'C8102E', mono: 'CCC' },
  { name: 'Hyde Park Developments', logo: 'hyde-park.png', nameAr: 'هايد بارك للتطوير', sector: { en: 'Real estate development', ar: 'التطوير العقاري' }, hex: '2B2B2B', mono: 'HP' },
  { name: 'The United Bank', logo: 'united-bank.png', nameAr: 'المصرف المتحد', sector: { en: 'Banking', ar: 'البنوك' }, hex: '0054A6', mono: 'UB' },
];
