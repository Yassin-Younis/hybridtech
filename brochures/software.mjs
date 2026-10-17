// Software brochure, English and Arabic: the four everyday problems from the /software/ page, each with
// its before/after scene (captured from the site in that language by capture.mjs), how a project runs,
// and how to ask for a quote. Leads go to Hybrid Technology's own contacts, like the site.
import { en } from '../src/i18n/en.ts';
import { ar } from '../src/i18n/ar.ts';
import { site } from '../src/data/site.ts';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const pad = (n) => String(n).padStart(2, '0');
/** Latin values (phone, email, domain) inside Arabic lines. */
const ltr = (s) => `<bdi dir="ltr">${esc(s)}</bdi>`;

const T = {
  en: {
    title: 'Hybrid Technology | Software Development',
    coverEyebrow: 'Websites · Apps · Business systems · Automation',
    start: 'Start here',
    introTitle: 'Four everyday business headaches, and the software that makes each one go away.',
    pg: 'p.',
    proofEyebrow: 'Proof, not promises',
    proofTitle: "You're looking at our work.",
    proofBody: (domain) => `${domain} was designed and built by our own team: Arabic and English, made for phones first, quick to load, and with a simple product manager the sales team updates from their phone. No developer needed.`,
    today: 'Today', withUs: 'With our software',
    includesTitle: 'Every project includes',
    includes: ['Arabic and English', 'Works on phones, tablets and computers', 'You approve the screens before we build', 'Regular demos, no surprises', 'Training for your team', 'Support after launch'],
    whyTitle: 'Why build it with Hybrid Technology',
    why: [
      ['One partner for your IT and your software', 'The team that runs your devices and network builds the system that runs on them.'],
      ['Plain words, clear quotes', 'No jargon. You know what you get, what it costs and when, before we start.'],
      ['Made in Cairo, in Arabic and English', 'Built for how business works in Egypt, for your staff and your customers.'],
    ],
    backTitle: 'Describe the problem.<br>We\'ll quote the <em class="hl">fix</em>.',
    backLead: 'Tell us how things work today and what frustrates you. We reply in plain words with the options and a clear quote.',
    website: 'Website',
    scan: 'Scan to start the chat',
    qrSite: 'See it on the website',
    brand: 'Software Development<br>by Hybrid Technology, Cairo',
    tm: 'App Store is a service mark of Apple Inc. Google Play is a trademark of Google LLC. Other names are property of their respective owners.',
  },
  ar: {
    title: 'هيبرد تكنولوجي | تطوير البرمجيات',
    coverEyebrow: 'مواقع · تطبيقات · أنظمة أعمال · أتمتة',
    start: 'ابدأ من هنا',
    introTitle: 'أربع مشكلات يومية تواجهها الشركات، والبرمجيات التي تتخلّص من كل واحدة منها.',
    pg: 'ص',
    proofEyebrow: 'أعمال لا وعود',
    proofTitle: 'هذا من أعمالنا.',
    proofBody: (domain) => `صمّم فريقنا موقع ${domain} وبرمجه بالكامل: بالعربية والإنجليزية، ومصمَّم للهاتف أولًا، وسريع التحميل، ومعه لوحة بسيطة لإدارة المنتجات يحدّثها فريق المبيعات من هاتفه دون الحاجة إلى مبرمج.`,
    today: 'اليوم', withUs: 'مع برمجياتنا',
    includesTitle: 'كل مشروع يشمل',
    includes: ['العربية والإنجليزية', 'يعمل على الهاتف والتابلت والكمبيوتر', 'توافق على الشاشات قبل أن نبدأ البرمجة', 'عروض منتظمة للتقدّم، بلا مفاجآت', 'تدريب فريقك', 'دعم بعد الإطلاق'],
    whyTitle: 'لماذا تبني برمجياتك مع هيبرد تكنولوجي',
    why: [
      ['شريك واحد لتكنولوجيا المعلومات والبرمجيات', 'الفريق الذي يدير أجهزتك وشبكتك يبني النظام الذي يعمل عليها.'],
      ['كلام واضح وعروض أسعار واضحة', 'بلا مصطلحات معقّدة. تعرف ما ستحصل عليه وتكلفته وموعده قبل أن نبدأ.'],
      ['صُنع في القاهرة، بالعربية والإنجليزية', 'مبني على طريقة العمل في مصر، لفريقك ولعملائك.'],
    ],
    backTitle: 'صِف لنا المشكلة،<br>ونرسل لك سعر <em class="hl">الحل</em>.',
    backLead: 'أخبرنا كيف تسير الأمور اليوم وما الذي يزعجك. نرد عليك بكلمات بسيطة مع الخيارات وعرض سعر واضح.',
    website: 'الموقع الإلكتروني',
    scan: 'امسح الرمز لبدء المحادثة',
    qrSite: 'شاهده على موقعنا',
    brand: 'تطوير البرمجيات<br>من هيبرد تكنولوجي، القاهرة',
    tm: 'App Store علامة خدمة مملوكة لشركة Apple Inc. و Google Play علامة تجارية لشركة Google LLC. الأسماء الأخرى مملوكة لأصحابها.',
  },
};

export default async function software({ url, icon, board, qr, img }, lang = 'en') {
  const d = lang === 'ar' ? ar : en, L = T[lang], isAr = lang === 'ar';
  const s = d.software;
  const sfx = isAr ? '-ar' : '';
  const logo = url('public/brand/logo.svg'), logoWhite = url('public/brand/logo-white.svg');
  const scene = {};
  for (const c of s.chapters) for (const st of ['problem', 'fix']) scene[`${c.id}-${st}`] = await img(`brochures/img/scene-${c.id}-${st}${sfx}.png`, { w: 900, png: true });
  const shot = { desk: await img(`brochures/img/site-desktop${sfx}.jpg`, { w: 1600 }), phone: await img(`brochures/img/site-phone${sfx}.jpg`, { w: 700 }) };
  const total = s.chapters.length;
  const swPath = `${site.domain}${isAr ? '/ar' : ''}/software`;
  const foot = (n, dark) => `<footer class="foot"><img src="${dark ? logoWhite : logo}" alt=""><span>${esc(s.eyebrow)} · ${ltr(swPath)}</span><b>${pad(n)}</b></footer>`;
  const title = s.title.split('*').map((p, i) => (i % 2 ? `<em class="hl">${esc(p)}</em>` : esc(p))).join('');

  const cover = `
  <section class="page page--night cover">
    ${board('circuit--cover')}
    <header class="cover__top"><img src="${logoWhite}" alt="Hybrid Technology"><span>${esc(s.eyebrow)}<br><b class="num">${new Date().getFullYear()}</b></span></header>
    <div class="cover__copy">
      <p class="eyebrow">${L.coverEyebrow}</p>
      <h1>${title}</h1>
      <p class="cover__sub">${esc(s.lead)}</p>
    </div>
    <ul class="collage">${s.chapters.map((c, i) => `<li class="collage__i collage__i--${i + 1}"><img src="${scene[`${c.id}-fix`]}" alt=""><span><b class="num">${pad(i + 1)}</b>${esc(c.nav)}</span></li>`).join('')}</ul>
    <div class="bars"></div>
  </section>`;

  const intro = `
  <section class="page intro">
    <div class="inner">
      <p class="eyebrow"><span class="n">00</span>${L.start}</p>
      <h2>${L.introTitle}</h2>
      <ol class="toc">${s.chapters.map((c, i) => `
        <li><span class="ico ico--orange">${icon(c.icon)}</span><div><small><b class="num">${pad(i + 1)}</b>${esc(c.nav)}</small><p>${esc(c.problem)}</p></div><span class="toc__pg">${L.pg} <span class="num">${3 + i}</span></span></li>`).join('')}
      </ol>
      <div class="proof">
        ${board('circuit--proof')}
        <div class="proof__copy">
          <p class="eyebrow">${L.proofEyebrow}</p>
          <h3>${L.proofTitle}</h3>
          <p>${L.proofBody(`<b>${ltr(site.domain)}</b>`)}</p>
        </div>
        <div class="proof__devices">
          <div class="laptop"><div class="laptop__screen"><img src="${shot.desk}" alt=""></div><div class="laptop__base"></div></div>
          <div class="phone"><img src="${shot.phone}" alt=""></div>
        </div>
      </div>
    </div>
    ${foot(2)}
  </section>`;

  const chapters = s.chapters.map((c, i) => `
  <section class="page page--night ch">
    ${board('circuit--ch')}
    <div class="inner">
      <p class="eyebrow"><span class="n">${pad(i + 1)} / ${pad(total)}</span>${esc(s.problemLabel)} · ${esc(c.nav)}</p>
      <h2>${esc(c.problem)}</h2>
      <p class="lead">${esc(c.story)}</p>
      <div class="ba">
        <figure class="ba__card"><figcaption><span class="dot dot--x"></span>${L.today}</figcaption><img src="${scene[`${c.id}-problem`]}" alt=""></figure>
        <span class="ba__arrow">${icon('arrow', true)}</span>
        <figure class="ba__card ba__card--fix"><figcaption><span class="dot"></span>${L.withUs}</figcaption><img src="${scene[`${c.id}-fix`]}" alt=""></figure>
      </div>
      <div class="fix">
        <p class="fix__tag">${icon('check')}${esc(s.fixLabel)}</p>
        <h3>${esc(c.fixTitle)}</h3>
        <p>${esc(c.fix)}</p>
        <ul class="gains">${c.gains.map((g) => `<li>${icon('check')}${esc(g)}</li>`).join('')}</ul>
      </div>
    </div>
    ${foot(3 + i, true)}
  </section>`).join('');

  const includeIcons = ['globe', 'smartphone', 'eye', 'calendar', 'users', 'headset'];
  const how = `
  <section class="page how">
    <div class="inner">
      <p class="eyebrow"><span class="n">05</span>${esc(s.stepsTitle)}</p>
      <h2>${esc(s.closeTitle)}</h2>
      <p class="lead">${esc(s.closeBody)}</p>
      <ol class="road">${s.steps.map((st, i) => `<li><span class="num">${pad(i + 1)}</span><h3>${esc(st.t)}</h3><p>${esc(st.d)}</p></li>`).join('')}</ol>
      <h4 class="how__h">${L.includesTitle}</h4>
      <ul class="incl2">${L.includes.map((t, i) => `<li><span class="ico ico--orange">${icon(includeIcons[i])}</span>${t}</li>`).join('')}</ul>
      <div class="whyus">
        ${board('circuit--band')}
        <h4>${L.whyTitle}</h4>
        <ul>${['handshake', 'users', 'globe'].map((ic, i) => `<li><span class="ico ico--dark">${icon(ic)}</span><div><b>${L.why[i][0]}</b><p>${L.why[i][1]}</p></div></li>`).join('')}</ul>
      </div>
    </div>
    ${foot(7)}
  </section>`;

  const wa = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(s.waTemplate)}`;
  const rows = [
    ['phone', d.contact.phoneLabel, ltr(site.phoneDisplay)],
    ['mail', d.contact.emailLabel, ltr(site.email)],
    ['globe', L.website, ltr(swPath)],
    ['clock', d.contact.hoursLabel, esc(d.contact.hours)],
  ];
  const back = `
  <section class="page page--night back">
    ${board('circuit--back')}
    <div class="inner">
      <p class="eyebrow"><span class="n">06</span>${esc(s.cta)}</p>
      <h2>${L.backTitle}</h2>
      <p class="lead">${L.backLead}</p>
      <div class="back__grid">
        <div class="back__card">
          <ul>${rows.map(([ic, k, v]) => `<li><span class="ico ico--dark">${icon(ic)}</span><div><small>${esc(k)}</small><b>${v}</b></div></li>`).join('')}</ul>
        </div>
        <div class="back__qrs">
          <div class="back__qr"><div class="qr">${qr(wa)}</div><p><b>${esc(s.ctaAlt)}</b>${L.scan}</p></div>
          <div class="back__qr"><div class="qr">${qr(`https://${swPath}/`)}</div><p><b>${L.qrSite}</b>${ltr(swPath)}</p></div>
        </div>
      </div>
      <div class="back__brand"><img src="${logoWhite}" alt="Hybrid Technology"><p>${L.brand}</p></div>
      <p class="back__tm">${L.tm}</p>
    </div>
    <div class="bars"></div>
  </section>`;

  return { title: L.title, body: cover + intro + chapters + how + back, style: STYLE };
}

const STYLE = `
/* Cover */
.cover__top { position: relative; display: flex; justify-content: space-between; align-items: flex-start; padding: 16mm var(--pad) 0; }
.cover__top img { height: 13mm; width: auto; }
.cover__top span { font-family: var(--display); font-size: 8.5pt; letter-spacing: 0.16em; text-transform: uppercase; color: var(--on-dark-muted); text-align: end; line-height: 1.4; }
.cover__top span b { color: #fff; font-size: 13pt; letter-spacing: 0.06em; }
.cover__copy { position: relative; padding: 20mm var(--pad) 0; }
.cover h1 { font-size: 33pt; line-height: 1.08; color: #fff; margin-top: 6mm; max-width: 165mm; }
.cover__sub { margin-top: 6mm; font-size: 11.5pt; max-width: 140mm; color: var(--on-dark-muted); }
.collage { position: absolute; left: 8mm; right: 8mm; bottom: 12mm; height: 156mm; }
.collage__i { position: absolute; width: 96mm; }
.collage__i img { width: 100%; }
.collage__i span { position: absolute; inset-inline-start: 6mm; bottom: 2mm; display: inline-flex; gap: 2.5mm; align-items: baseline; padding: 5px 12px; border-radius: 999px; background: rgba(0, 26, 42, 0.85); border: 1px solid rgba(255, 255, 255, 0.16); font-family: var(--display); font-weight: 600; font-size: 8.5pt; color: #fff; }
.collage__i span .num { color: var(--orange); }
.collage__i--1 { inset-inline-start: 0; top: 0; }
.collage__i--2 span { inset-inline-start: auto; inset-inline-end: 4mm; }
.collage__i--2 { inset-inline-end: 0; top: 8mm; }
.collage__i--3 { inset-inline-start: 0; bottom: 0; }
.collage__i--4 { inset-inline-end: 0; bottom: -2mm; }
.cover .bars { z-index: 3; }

/* Start here */
.intro h2 { font-size: 24pt; max-width: 165mm; }
.toc { display: grid; gap: 3mm; margin-top: 8mm; }
.toc li { display: flex; align-items: center; gap: 4mm; padding: 3.6mm 4.5mm; border-radius: 14px; background: var(--surface); border: 1px solid var(--line); }
.toc li > div { flex: 1; }
.toc small { display: flex; gap: 2mm; font-family: var(--display); font-weight: 600; font-size: 8pt; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); }
.toc small .num { color: var(--orange); }
.toc p { font-family: var(--display); font-weight: 600; font-size: 12pt; line-height: 1.25; color: var(--blue-ink); margin-top: 0.8mm; }
.toc__pg { font-family: var(--display); font-size: 8pt; color: var(--muted); }
.proof { position: relative; overflow: hidden; margin-top: auto; margin-bottom: 9mm; border-radius: 20px; padding: 8mm 8mm 0; background: radial-gradient(100% 80% at 90% 0%, rgba(0, 94, 138, 0.7), transparent 60%), linear-gradient(180deg, #001a2a, var(--blue-ink)); color: var(--on-dark); }
.circuit--proof { width: 180mm; left: -40mm; top: -20mm; opacity: 0.08; }
.proof__copy { position: relative; max-width: 150mm; }
.proof h3 { color: #fff; font-size: 16pt; margin-top: 3mm; }
.proof__copy > p:last-child { margin-top: 2.5mm; font-size: 9.5pt; color: var(--on-dark-muted); }
.proof__copy b { color: #fff; }
.proof__devices { position: relative; height: 82mm; margin-top: 6mm; }
.laptop { position: absolute; inset-inline-start: 6mm; top: 0; width: 132mm; }
.laptop__screen { border: 2.4mm solid #0d1720; border-bottom-width: 3mm; border-radius: 4mm 4mm 0 0; background: #0d1720; overflow: hidden; aspect-ratio: 16 / 10; }
.laptop__screen img { width: 100%; height: 100%; object-fit: cover; object-position: top; border-radius: 1mm; }
.laptop__base { height: 4mm; margin: 0 -9mm; border-radius: 0 0 4mm 4mm; background: linear-gradient(#c9d3da, #8a99a5); }
.phone { position: absolute; inset-inline-end: 8mm; top: 6mm; width: 40mm; aspect-ratio: 390 / 844; border: 1.8mm solid #0d1720; border-radius: 6mm; overflow: hidden; background: #0d1720; box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.6); }
.phone img { width: 100%; height: 100%; object-fit: cover; object-position: top; border-radius: 4mm; }

/* Chapters */
.circuit--ch { width: 220mm; right: -80mm; top: -40mm; opacity: 0.07; }
.ch .inner { position: relative; }
.ch h2 { font-size: 25pt; max-width: 165mm; margin-top: 5mm; }
.ch .lead { font-size: 11pt; max-width: 160mm; }
.ba { display: grid; grid-template-columns: 0.82fr 9mm 1.18fr; align-items: center; gap: 3mm; margin: auto -6mm; padding-block: 6mm; }
.ba__card { position: relative; border-radius: 16px; background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.12); padding: 10mm 2mm 2mm; }
.ba__card--fix { background: rgba(241, 81, 27, 0.06); border-color: rgba(241, 81, 27, 0.4); }
.ba__card img { width: 100%; }
.ba__card figcaption { position: absolute; inset-inline-start: 4mm; top: 4mm; display: flex; align-items: center; gap: 2mm; font-family: var(--display); font-weight: 600; font-size: 8pt; letter-spacing: 0.14em; text-transform: uppercase; color: var(--on-dark-muted); }
.ba__card--fix figcaption { color: #fff; }
.dot { width: 2.2mm; height: 2.2mm; border-radius: 50%; background: var(--orange); box-shadow: 0 0 0 1mm rgba(241, 81, 27, 0.25); }
.dot--x { background: #6f8796; box-shadow: none; }
.ba__arrow { display: grid; place-items: center; width: 9mm; height: 9mm; border-radius: 50%; background: var(--orange); color: #fff; font-size: 4.6mm; }
.fix { margin-bottom: 9mm; padding: 7mm 8mm; border-radius: 18px; background: #fff; color: var(--ink); }
.fix__tag { display: flex; align-items: center; gap: 2mm; font-family: var(--display); font-weight: 600; font-size: 8pt; letter-spacing: 0.14em; text-transform: uppercase; color: var(--orange); }
.fix__tag .icon { stroke-width: 2.6; }
.fix h3 { font-size: 17pt; margin-top: 2.5mm; }
.fix > p { margin-top: 2.5mm; font-size: 10.5pt; color: var(--muted); }
.gains { display: flex; flex-wrap: wrap; gap: 2.5mm; margin-top: 5mm; }
.gains li { display: inline-flex; align-items: center; gap: 2mm; padding: 6px 13px; border-radius: 999px; background: var(--orange-soft); color: var(--blue-ink); font-family: var(--display); font-weight: 600; font-size: 9.5pt; }
.gains .icon { color: var(--orange); stroke-width: 2.6; }

/* How we work */
.how h2 { font-size: 24pt; max-width: 160mm; }
.road { position: relative; display: grid; grid-template-columns: repeat(4, 1fr); gap: 4mm; margin-top: 9mm; }
.road::before { content: ''; position: absolute; left: 6mm; right: 6mm; top: 6mm; height: 2px; background: repeating-linear-gradient(90deg, var(--orange) 0 6px, transparent 6px 11px); }
.road li { position: relative; }
.road .num { position: relative; display: grid; place-items: center; width: 12mm; height: 12mm; border-radius: 50%; background: var(--blue-ink); color: #fff; font-size: 11pt; box-shadow: 0 0 0 2mm #fff; }
.road h3 { margin-top: 4mm; font-size: 12.5pt; }
.road p { margin-top: 1.5mm; font-size: 9pt; color: var(--muted); }
.how__h { margin-top: 12mm; }
.incl2 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3mm; margin-top: 4mm; }
.incl2 li { display: flex; gap: 3mm; align-items: center; padding: 3.5mm; border-radius: 12px; background: var(--surface); border: 1px solid var(--line); font-weight: 600; font-size: 9.5pt; line-height: 1.3; color: var(--blue-ink); }
.incl2 .ico { width: 8.5mm; height: 8.5mm; font-size: 4.4mm; }

.whyus { position: relative; overflow: hidden; margin-top: auto; margin-bottom: 9mm; padding: 7mm 7mm 8mm; border-radius: 18px; background: linear-gradient(115deg, var(--blue-ink), #001a2a); color: var(--on-dark); }
.circuit--band { width: 160mm; right: -30mm; top: -30mm; opacity: 0.1; }
.whyus h4 { position: relative; color: var(--orange); }
.whyus ul { position: relative; display: grid; grid-template-columns: repeat(3, 1fr); gap: 6mm; margin-top: 5mm; }
.whyus li { display: grid; gap: 3mm; align-content: start; }
.whyus b { font-family: var(--display); font-size: 11pt; line-height: 1.2; color: #fff; }
.whyus p { margin-top: 1.5mm; font-size: 8.6pt; color: var(--on-dark-muted); }

/* Back cover */
.back .inner { position: relative; padding-top: 24mm; }
.back h2 { font-size: 34pt; max-width: 160mm; }
.back__grid { display: grid; grid-template-columns: 1fr 34mm; gap: 8mm; margin-top: 12mm; }
.back__card { padding: 7mm; border-radius: 18px; background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(255, 255, 255, 0.14); }
.back__card ul { display: grid; gap: 5mm; }
.back__card li { display: flex; align-items: center; gap: 4mm; }
.back__card li .ico { width: 9mm; height: 9mm; font-size: 4.6mm; }
.back__card small { display: block; font-family: var(--display); font-size: 7.5pt; letter-spacing: 0.12em; text-transform: uppercase; color: var(--on-dark-muted); }
.back__card b { font-weight: 600; font-size: 11pt; color: #fff; }
.back__qrs { display: grid; gap: 7mm; align-content: start; }
.back__qr p { margin-top: 2.5mm; font-size: 8pt; color: var(--on-dark-muted); text-align: center; }
.back__qr p b { display: block; color: #fff; font-size: 8.5pt; }
.back__qr .qr { width: 34mm; height: 34mm; }
.back__brand { display: flex; align-items: center; justify-content: space-between; gap: 8mm; margin-top: auto; padding-top: 8mm; border-top: 1px solid rgba(255, 255, 255, 0.14); }
.back__brand img { height: 15mm; width: auto; }
.back__brand p { font-family: var(--display); font-size: 9pt; letter-spacing: 0.1em; text-transform: uppercase; color: var(--on-dark-muted); text-align: end; }
.back__tm { margin: 5mm 0 16mm; font-size: 7pt; color: var(--on-dark-muted); opacity: 0.7; }
`;
