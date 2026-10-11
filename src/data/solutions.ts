import type { CategoryId } from './categories';

export type SolutionId = 'printing' | 'infrastructure' | 'managed';
export const solutionIds: SolutionId[] = ['printing', 'infrastructure', 'managed'];

type L = { en: string; ar: string };
type Point = { icon: string; label: L };
export type SolutionContent = {
  seo: { title: L; description: L };
  problem: { title: L; points: Point[] };
  solution: { title: L; steps: Point[] };
  outcomes: Point[];
  /** Product categories to suggest, in priority order. */
  categories: CategoryId[];
  /** Partner names (matched against src/data/partners.ts) rendered as logos. */
  vendors: string[];
};

export const solutions: Record<SolutionId, SolutionContent> = {
  printing: {
    seo: {
      title: { en: 'Managed Print Services in Egypt | Hybrid Technology', ar: 'خدمات الطباعة المُدارة في مصر | هيبرد تكنولوجي' },
      description: {
        en: 'Cut print costs and toner downtime. HP, Canon, Epson and Brother printers with managed print, supplies and on-site support across Egypt.',
        ar: 'خفّض تكاليف الطباعة وتوقفات الحبر. طابعات HP وCanon وEpson وBrother مع طباعة مُدارة وتوريد المستلزمات ودعم ميداني في مصر.',
      },
    },
    problem: {
      title: { en: 'Print costs rise quietly.', ar: 'تكاليف الطباعة ترتفع بصمت.' },
      points: [
        { icon: 'coins', label: { en: 'Spiralling print costs', ar: 'تكاليف طباعة متصاعدة' } },
        { icon: 'clock', label: { en: 'Toner outages, idle teams', ar: 'نفاد الحبر وتعطّل العمل' } },
        { icon: 'alert', label: { en: 'Ageing, mixed fleet', ar: 'أجهزة متقادمة وغير موحّدة' } },
      ],
    },
    solution: {
      title: { en: 'One managed print fleet.', ar: 'منظومة طباعة واحدة مُدارة.' },
      steps: [
        { icon: 'eye', label: { en: 'Fleet audit', ar: 'تقييم الأجهزة الحالية' } },
        { icon: 'printer', label: { en: 'Right-sized MFPs', ar: 'طابعات متعددة الوظائف بالسعة المناسبة' } },
        { icon: 'refresh', label: { en: 'Automatic supplies', ar: 'توريد تلقائي للمستلزمات' } },
        { icon: 'wrench', label: { en: 'On-site maintenance', ar: 'صيانة في موقعك' } },
      ],
    },
    outcomes: [
      { icon: 'gauge', label: { en: 'Predictable print spend', ar: 'إنفاق طباعة متوقَّع' } },
      { icon: 'check', label: { en: 'Fewer stoppages', ar: 'توقفات أقل' } },
      { icon: 'eye', label: { en: 'Clear usage visibility', ar: 'رؤية واضحة للاستهلاك' } },
    ],
    categories: ['printers', 'large-format'],
    vendors: ['HP', 'Canon', 'Epson', 'Brother'],
  },
  infrastructure: {
    seo: {
      title: { en: 'Networks, Servers & IT Security in Egypt | Hybrid Technology', ar: 'الشبكات والخوادم وأمن المعلومات في مصر | هيبرد تكنولوجي' },
      description: {
        en: 'Servers, storage, Wi-Fi, firewalls, CCTV and UPS power designed for uptime and security. HPE, Dell, Cisco, Fortinet and APC, deployed across Egypt.',
        ar: 'خوادم وتخزين وشبكات لاسلكية وجدران حماية وكاميرات مراقبة وطاقة UPS مصمّمة للاستمرارية والأمان. حلول HPE و Dell و Cisco و Fortinet و APC في جميع أنحاء مصر.',
      },
    },
    problem: {
      title: { en: 'Outages, slow networks, open doors.', ar: 'أعطال وشبكات بطيئة وثغرات مفتوحة.' },
      points: [
        { icon: 'server', label: { en: 'Ageing, overloaded servers', ar: 'خوادم متقادمة ومُثقَلة' } },
        { icon: 'power', label: { en: 'Unprotected power cuts', ar: 'انقطاعات كهرباء بلا حماية' } },
        { icon: 'bug', label: { en: 'Ransomware & intrusions', ar: 'برامج الفدية والاختراقات' } },
      ],
    },
    solution: {
      title: { en: 'One secure, always-on backbone.', ar: 'بنية أساسية واحدة آمنة ولا تتوقف.' },
      steps: [
        { icon: 'target', label: { en: 'Design & sizing', ar: 'التصميم وتحديد السعة' } },
        { icon: 'server', label: { en: 'Servers & backup', ar: 'الخوادم والنسخ الاحتياطي' } },
        { icon: 'shield', label: { en: 'Firewalls & Wi-Fi', ar: 'جدران الحماية والشبكة اللاسلكية' } },
        { icon: 'power', label: { en: 'UPS & clean power', ar: 'UPS وطاقة مستقرة' } },
      ],
    },
    outcomes: [
      { icon: 'gauge', label: { en: 'High availability', ar: 'توافر عالٍ' } },
      { icon: 'lock', label: { en: 'Threats stopped early', ar: 'صدّ التهديدات مبكرًا' } },
      { icon: 'layers', label: { en: 'Ready to scale', ar: 'جاهزية للتوسع' } },
    ],
    categories: ['servers', 'networking', 'surveillance', 'ups', 'storage'],
    vendors: ['HPE', 'Dell Technologies', 'Cisco', 'Fortinet'],
  },
  managed: {
    seo: {
      title: { en: 'Managed IT Support & Microsoft 365 in Egypt | Hybrid Technology', ar: 'الدعم الفني المُدار و Microsoft 365 في مصر | هيبرد تكنولوجي' },
      description: {
        en: 'No in-house IT team? 24/7 help desk, monitoring, backup, Microsoft 365, licensing and endpoint security under one SLA from Hybrid Technology in Cairo.',
        ar: 'لا يوجد لديك فريق تكنولوجيا معلومات؟ مكتب دعم على مدار الساعة ومراقبة ونسخ احتياطي و Microsoft 365 وتراخيص وحماية للأجهزة باتفاقية خدمة واحدة من هيبرد تكنولوجي بالقاهرة.',
      },
    },
    problem: {
      title: { en: 'Small issues, long waits, scattered licences.', ar: 'أعطال بسيطة وانتظار طويل وتراخيص مبعثرة.' },
      points: [
        { icon: 'users', label: { en: 'No in-house IT staff', ar: 'بلا فريق دعم داخلي' } },
        { icon: 'clock', label: { en: 'Slow issue resolution', ar: 'بطء في حل الأعطال' } },
        { icon: 'key', label: { en: 'Licence sprawl & missed renewals', ar: 'فوضى التراخيص وتجديدات فائتة' } },
      ],
    },
    solution: {
      title: { en: 'Your IT department, on call.', ar: 'فريق تكنولوجيا معلومات في خدمتك دائمًا.' },
      steps: [
        { icon: 'headset', label: { en: '24/7 help desk', ar: 'مكتب دعم على مدار الساعة' } },
        { icon: 'gauge', label: { en: 'Real-time monitoring', ar: 'مراقبة لحظية' } },
        { icon: 'refresh', label: { en: 'Backup & recovery', ar: 'نسخ احتياطي واستعادة' } },
        { icon: 'cloud', label: { en: 'Microsoft 365 & licences', ar: 'Microsoft 365 والتراخيص' } },
      ],
    },
    outcomes: [
      { icon: 'clock', label: { en: 'Faster fixes', ar: 'حل أسرع للأعطال' } },
      { icon: 'lock', label: { en: 'Protected devices', ar: 'أجهزة محمية' } },
      { icon: 'handshake', label: { en: 'One SLA, one partner', ar: 'اتفاقية خدمة واحدة وشريك واحد' } },
    ],
    categories: ['software', 'warranty'],
    vendors: ['Microsoft', 'Adobe', 'Kaspersky', 'Sophos'],
  },
};
