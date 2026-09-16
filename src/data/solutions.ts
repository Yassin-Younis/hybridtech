import type { CategoryId } from './categories';

export type SolutionId = 'printing' | 'infrastructure' | 'networking' | 'managed' | 'software';
export const solutionIds: SolutionId[] = ['printing', 'infrastructure', 'networking', 'managed', 'software'];

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
    categories: ['printers'],
    vendors: ['HP', 'Canon', 'Epson', 'Brother'],
  },
  infrastructure: {
    seo: {
      title: { en: 'IT Infrastructure & Servers in Egypt | Hybrid Technology', ar: 'البنية التحتية والخوادم في مصر | هيبرد تكنولوجي' },
      description: {
        en: 'Servers, storage, backup and UPS power designed for uptime. HPE, Dell, Lenovo and APC infrastructure, designed and deployed in Egypt.',
        ar: 'خوادم وتخزين ونسخ احتياطي وحماية طاقة UPS مصمّمة للاستمرارية. بنية تحتية من HPE وDell وLenovo وAPC، تصميمًا وتنفيذًا في مصر.',
      },
    },
    problem: {
      title: { en: 'Ageing servers, costly outages.', ar: 'خوادم متقادمة وأعطال مكلفة.' },
      points: [
        { icon: 'server', label: { en: 'Overloaded, ageing servers', ar: 'خوادم متقادمة ومُثقَلة' } },
        { icon: 'power', label: { en: 'Unprotected power cuts', ar: 'انقطاعات كهرباء بلا حماية' } },
        { icon: 'storage', label: { en: 'Untested backups', ar: 'نسخ احتياطي غير مُختبَر' } },
      ],
    },
    solution: {
      title: { en: 'Infrastructure built for uptime.', ar: 'بنية تحتية مصمّمة للاستمرارية.' },
      steps: [
        { icon: 'target', label: { en: 'Design & sizing', ar: 'التصميم وتحديد السعة' } },
        { icon: 'layers', label: { en: 'Virtualised servers', ar: 'خوادم افتراضية' } },
        { icon: 'storage', label: { en: 'Storage & backup', ar: 'التخزين والنسخ الاحتياطي' } },
        { icon: 'power', label: { en: 'UPS & clean power', ar: 'UPS وطاقة مستقرة' } },
      ],
    },
    outcomes: [
      { icon: 'gauge', label: { en: 'High availability', ar: 'توافر عالٍ' } },
      { icon: 'lock', label: { en: 'Protected data', ar: 'بيانات محمية' } },
      { icon: 'layers', label: { en: 'Ready to scale', ar: 'جاهزية للتوسع' } },
    ],
    categories: ['servers', 'storage', 'ups'],
    vendors: ['HPE', 'Dell Technologies', 'Lenovo', 'APC'],
  },
  networking: {
    seo: {
      title: { en: 'Network Security & Firewalls in Egypt | Hybrid Technology', ar: 'الشبكات وجدران الحماية في مصر | هيبرد تكنولوجي' },
      description: {
        en: 'Segmented networks, next-gen firewalls, secure Wi-Fi and IP surveillance. Cisco, Fortinet, Ubiquiti and Hikvision, deployed across Egypt.',
        ar: 'شبكات مقسّمة وجدران حماية من الجيل التالي وشبكات لاسلكية آمنة ومراقبة IP. حلول Cisco وFortinet وUbiquiti وHikvision في مصر.',
      },
    },
    problem: {
      title: { en: 'Open networks, exposed business.', ar: 'شبكة مكشوفة، وأعمال في خطر.' },
      points: [
        { icon: 'bug', label: { en: 'Ransomware threats', ar: 'هجمات برامج الفدية' } },
        { icon: 'network', label: { en: 'Flat, unsegmented network', ar: 'شبكة غير مقسّمة' } },
        { icon: 'eye', label: { en: 'Unmonitored premises', ar: 'مقرات بلا مراقبة' } },
      ],
    },
    solution: {
      title: { en: 'Secure by design, end to end.', ar: 'أمان مُدمج من التصميم إلى التشغيل.' },
      steps: [
        { icon: 'network', label: { en: 'Segmented switching', ar: 'تقسيم الشبكة بإحكام' } },
        { icon: 'shield', label: { en: 'Next-gen firewalls', ar: 'جدران حماية من الجيل التالي' } },
        { icon: 'wifi', label: { en: 'Secure wireless', ar: 'شبكة لاسلكية آمنة' } },
        { icon: 'camera', label: { en: 'IP surveillance', ar: 'مراقبة IP' } },
      ],
    },
    outcomes: [
      { icon: 'lock', label: { en: 'Threats stopped early', ar: 'صدّ التهديدات مبكرًا' } },
      { icon: 'eye', label: { en: 'Full network visibility', ar: 'رؤية شاملة للشبكة' } },
      { icon: 'spark', label: { en: 'Fast, stable connectivity', ar: 'اتصال سريع ومستقر' } },
    ],
    categories: ['networking', 'security', 'surveillance'],
    vendors: ['Cisco', 'Fortinet', 'Ubiquiti', 'Hikvision'],
  },
  managed: {
    seo: {
      title: { en: 'Managed IT Services in Egypt | Hybrid Technology', ar: 'خدمات تكنولوجيا المعلومات المُدارة | هيبرد تكنولوجي' },
      description: {
        en: 'No in-house IT team? Get a 24/7 help desk, monitoring, preventive maintenance and backup under one SLA from Hybrid Technology in Cairo.',
        ar: 'لا يوجد فريق داخلي لتكنولوجيا المعلومات؟ مكتب دعم ومراقبة وصيانة وقائية ونسخ احتياطي على مدار الساعة باتفاقية خدمة واحدة من هيبرد تكنولوجي.',
      },
    },
    problem: {
      title: { en: 'Small issues, long waits.', ar: 'أعطال بسيطة وانتظار طويل.' },
      points: [
        { icon: 'users', label: { en: 'No in-house IT staff', ar: 'بلا فريق دعم داخلي' } },
        { icon: 'clock', label: { en: 'Slow issue resolution', ar: 'بطء في حل الأعطال' } },
        { icon: 'storage', label: { en: 'Backups nobody checks', ar: 'نسخ احتياطي بلا متابعة' } },
      ],
    },
    solution: {
      title: { en: 'Your IT department, on call.', ar: 'فريق تكنولوجيا معلومات في خدمتك دائمًا.' },
      steps: [
        { icon: 'headset', label: { en: '24/7 help desk', ar: 'مكتب دعم على مدار الساعة' } },
        { icon: 'gauge', label: { en: 'Real-time monitoring', ar: 'مراقبة لحظية' } },
        { icon: 'wrench', label: { en: 'Preventive maintenance', ar: 'صيانة وقائية' } },
        { icon: 'refresh', label: { en: 'Backup & recovery', ar: 'نسخ احتياطي واستعادة' } },
      ],
    },
    outcomes: [
      { icon: 'clock', label: { en: 'Faster fixes', ar: 'حل أسرع للأعطال' } },
      { icon: 'handshake', label: { en: 'One SLA, one partner', ar: 'اتفاقية خدمة واحدة وشريك واحد' } },
      { icon: 'coins', label: { en: 'Predictable IT spend', ar: 'إنفاق متوقَّع' } },
    ],
    categories: ['storage', 'ups', 'software'],
    // "Hybrid service desk" has no logo; show the platforms the service desk runs and supports.
    vendors: ['Microsoft', 'APC', 'QNAP', 'Synology'],
  },
  software: {
    seo: {
      title: { en: 'Microsoft 365 & Software Licensing | Hybrid Technology', ar: 'Microsoft 365 وتراخيص البرمجيات | هيبرد تكنولوجي' },
      description: {
        en: 'Microsoft 365, Azure, Adobe and endpoint security, licensed, deployed and renewed on time. End licence sprawl and unpatched devices in Egypt.',
        ar: 'Microsoft 365 وAzure وAdobe وحماية نقاط النهاية، ترخيصًا ونشرًا وتجديدًا في موعده. تخلّص من فوضى التراخيص والأجهزة غير المحدَّثة.',
      },
    },
    problem: {
      title: { en: 'Scattered licences, exposed devices.', ar: 'تراخيص مبعثرة وأجهزة مكشوفة.' },
      points: [
        { icon: 'key', label: { en: 'Licence sprawl', ar: 'فوضى التراخيص' } },
        { icon: 'alert', label: { en: 'Unpatched endpoints', ar: 'أجهزة بلا تحديثات أمنية' } },
        { icon: 'coins', label: { en: 'Paying for unused seats', ar: 'رسوم لتراخيص غير مستخدمة' } },
      ],
    },
    solution: {
      title: { en: 'Licensed, deployed, protected.', ar: 'ترخيص ونشر وحماية.' },
      steps: [
        { icon: 'key', label: { en: 'Licence audit', ar: 'مراجعة التراخيص' } },
        { icon: 'cloud', label: { en: 'Microsoft 365 & Azure', ar: 'Microsoft 365 وAzure' } },
        { icon: 'shield', label: { en: 'Endpoint security', ar: 'حماية نقاط النهاية' } },
        { icon: 'calendar', label: { en: 'Managed renewals', ar: 'تجديدات في موعدها' } },
      ],
    },
    outcomes: [
      { icon: 'check', label: { en: 'Compliant licensing', ar: 'تراخيص نظامية' } },
      { icon: 'lock', label: { en: 'Protected devices', ar: 'أجهزة محمية' } },
      { icon: 'coins', label: { en: 'No wasted seats', ar: 'لا هدر في التراخيص' } },
    ],
    categories: ['software', 'security'],
    vendors: ['Microsoft', 'Adobe', 'Kaspersky', 'Sophos'],
  },
};
