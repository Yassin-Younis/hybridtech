// Company profile brochure: who Hybrid Technology is, the three solutions, hardware and brands,
// why clients choose them, and how to reach them. Copy from the site data; layout is print-only.
import { readFileSync } from 'node:fs';
import { en as d } from '../src/i18n/en.ts';
import { solutions, solutionIds } from '../src/data/solutions.ts';
import { partners } from '../src/data/partners.ts';
import { clients } from '../src/data/clients.ts';
import { site } from '../src/data/site.ts';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const pad = (n) => String(n).padStart(2, '0');

export default async function company({ at, url, icon, board, qr, img }) {
  const categories = JSON.parse(readFileSync(at('src/data/categories.json'), 'utf8'));
  const logo = url('public/brand/logo.svg'), logoWhite = url('public/brand/logo-white.svg'), mark = url('public/brand/mark.svg');
  const photo = {};
  for (const n of ['printing', 'infrastructure', 'managed', 'supply', 'software', 'team']) photo[n] = await img(`src/assets/solutions/${n}.png`);
  const people = {};
  for (const n of ['person-2', 'omar', 'person-1']) people[n] = await img(`src/assets/hero/${n}.png`, { w: 760, png: true });
  const partnerLogo = (name) => partners.find((p) => p.name === name || p.name.startsWith(`${name} `));
  const foot = (n, dark) => `<footer class="foot"><img src="${dark ? logoWhite : logo}" alt=""><span>Company Profile · ${site.domain}</span><b>${pad(n)}</b></footer>`;
  const items = Object.fromEntries(d.solutions.items.map((s) => [s.id, s]));

  const cover = `
  <section class="page page--dark cover">
    ${board('circuit--cover')}
    <header class="cover__top"><img src="${logoWhite}" alt="Hybrid Technology"><span>Company Profile<br><b>${new Date().getFullYear()}</b></span></header>
    <div class="cover__copy">
      <p class="eyebrow">${esc(d.hero.eyebrow)} · Cairo, Egypt</p>
      <h1>Empowering <em class="hl">business</em><br>technology.</h1>
      <p class="cover__sub">Enterprise hardware, networks and managed IT for organisations that cannot afford downtime. One accountable partner since ${site.founded}.</p>
    </div>
    <div class="cover__people">
      <img class="p p--l" src="${people['person-2']}" alt="">
      <img class="p p--r" src="${people['person-1']}" alt="">
      <img class="p p--c" src="${people.omar}" alt="">
    </div>
    <div class="cover__badge"><img src="${url('public/logos/partners/hp.svg')}" alt="HP"><span>Official<br><b>HP Amplify Partner</b></span></div>
    <div class="bars"></div>
  </section>`;

  const about = `
  <section class="page about">
    <div class="inner">
      <p class="eyebrow"><span class="n">01</span>${esc(d.about.eyebrow)}</p>
      <h2>${esc(d.about.title)}</h2>
      <div class="about__grid">
        <div class="about__text">
          <p class="lead">Hybrid Technology is an IT solutions provider in El Mokattam, Cairo, and an official HP Amplify Partner.</p>
          <p>We supply, install and support the laptops, servers, networks, firewalls, printers and managed IT services that organisations across Egypt run on. ${esc(d.about.body)}</p>
          <div class="vm">
            <div class="vm__card"><h4>${esc(d.about.vision.t)}</h4><p>${esc(d.about.vision.d)}</p></div>
            <div class="vm__card vm__card--o"><h4>${esc(d.about.mission.t)}</h4><p>${esc(d.about.mission.d)}</p></div>
          </div>
        </div>
        <figure class="photo about__photo"><img src="${photo.team}" alt=""></figure>
      </div>
      <h4 class="about__h">${esc(d.about.values.t)}</h4>
      <ul class="values">${d.about.values.items.map((v) => `<li><span class="ico">${icon(v.icon)}</span>${esc(v.label)}</li>`).join('')}</ul>
      <h4 class="about__h">Industries we serve</h4>
      <ul class="sectors">${[['building', 'Banking & finance'], ['layers', 'Construction'], ['spark', 'Pharmaceuticals'], ['pin', 'Real estate development']].map(([ic, t]) => `<li><span class="ico ico--orange">${icon(ic)}</span>${t}</li>`).join('')}</ul>
      <ul class="facts">${d.about.facts.map((f) => `<li><span class="ico ico--orange">${icon(f.icon)}</span><div><small>${esc(f.k)}</small><strong>${esc(f.v)}</strong></div></li>`).join('')}</ul>
    </div>
    <div class="stats">
      ${board('circuit--stats')}
      <ul>${d.stats.items.map((s) => `<li><span class="num">${s.n}<i>${esc(s.suffix)}</i></span><p>${esc(s.label)}</p></li>`).join('')}</ul>
    </div>
    ${foot(2)}
  </section>`;

  const tiles = [...d.solutions.items.map((s, i) => ({ id: s.id, icon: s.icon, title: s.title, short: s.short, page: 4 + i })), { id: 'supply', icon: 'laptop', title: d.solutions.supply.title, short: d.solutions.supply.short, page: 7 }];
  const offer = `
  <section class="page offer">
    <div class="inner">
      <p class="eyebrow"><span class="n">02</span>What we offer</p>
      <h2>${esc(d.solutions.title)}</h2>
      <p class="lead">${esc(d.solutions.intro)}</p>
      <ol class="flow">${[['target', 'Design'], ['laptop', 'Supply'], ['wrench', 'Implement'], ['headset', 'Support']].map(([ic, t], i) => `<li><span class="ico">${icon(ic)}</span><b>${t}</b>${i < 3 ? `<i>${icon('arrow')}</i>` : ''}</li>`).join('')}</ol>
      <ul class="tiles">${tiles.map((t, i) => `
        <li class="tile">
          <div class="photo tile__pic"><img src="${photo[t.id]}" alt=""></div>
          <div class="tile__body"><span class="ico ico--orange">${icon(t.icon)}</span><div><h3><span class="num">${pad(i + 1)}</span>${esc(t.title)}</h3><p>${esc(t.short)}</p></div></div>
          <span class="tile__pg">p. ${t.page}</span>
        </li>`).join('')}
      </ul>
      <div class="sw-band">
        ${board('circuit--band')}
        <span class="ico ico--dark">${icon('code')}</span>
        <div><h3>Custom Software</h3><p>${esc(d.explore.lines.software)}: websites, mobile apps, ERP systems and automation from our in-house software team.</p></div>
        <span class="sw-band__go">See our Software brochure ${icon('arrow')}</span>
      </div>
    </div>
    ${foot(3)}
  </section>`;

  const solutionPages = solutionIds.map((id, i) => {
    const it = items[id], s = solutions[id];
    const vendors = s.vendors.map(partnerLogo).filter(Boolean);
    return `
  <section class="page sol">
    <div class="sol__hero">
      <img src="${photo[id]}" alt="">
      <div class="sol__shade"></div>
      <div class="sol__head">
        <p class="eyebrow"><span class="n">${pad(i + 1)} / ${pad(solutionIds.length)}</span>Solution</p>
        <h2><span class="ico ico--dark">${icon(it.icon)}</span>${esc(it.title)}</h2>
        <p>${esc(it.blurb)}</p>
      </div>
    </div>
    <div class="inner sol__body">
      <div class="sol__cols">
        <div>
          <h4>${esc(d.solutionPage.challenge)}</h4>
          <h3>${esc(s.problem.title.en)}</h3>
          <ul class="pains">${s.problem.points.map((p) => `<li><span class="ico ico--orange">${icon(p.icon)}</span>${esc(p.label.en)}</li>`).join('')}</ul>
          <h4>${esc(d.solutionPage.solve)}</h4>
          <h3>${esc(s.solution.title.en)}</h3>
          <ol class="steps">${s.solution.steps.map((p, j) => `<li><span class="num">${pad(j + 1)}</span><span class="ico">${icon(p.icon)}</span>${esc(p.label.en)}</li>`).join('')}</ol>
        </div>
        <div>
          <h4>What's included</h4>
          <ul class="incl">${it.bullets.map((b) => `<li>${icon('check')}${esc(b)}</li>`).join('')}</ul>
          <h4>${esc(d.solutionPage.outcomes)}</h4>
          <ul class="wins">${s.outcomes.map((o) => `<li><span class="ico ico--orange">${icon(o.icon)}</span>${esc(o.label.en)}</li>`).join('')}</ul>
        </div>
      </div>
      <div class="sol__brands"><h4>${esc(d.solutionPage.vendors)}</h4><ul class="logo-wall">${vendors.map((p) => `<li><img src="${url('public/logos/partners/' + p.logo)}" alt="${esc(p.name)}"></li>`).join('')}</ul></div>
    </div>
    ${foot(4 + i)}
  </section>`;
  }).join('');

  const hardware = `
  <section class="page hw">
    <div class="inner">
      <div class="hw__head">
        <div>
          <p class="eyebrow"><span class="n">03</span>Products</p>
          <h2>${esc(d.solutions.supply.title)}</h2>
          <p class="lead">${esc(d.products.pageIntro)}</p>
        </div>
        <figure class="photo hw__photo"><img src="${photo.supply}" alt=""></figure>
      </div>
      <h4>${categories.length} product categories</h4>
      <ul class="cats">${categories.map((c) => `<li><span class="ico">${icon(c.icon)}</span>${esc(c.label.en)}</li>`).join('')}</ul>
      <div class="hw__brands">
        <div class="amplify"><img src="${url('public/logos/partners/hp.svg')}" alt="HP"><div><h3>Official HP Amplify Partner</h3><p>${esc(d.partners.intro.replace('Hybrid Technology is proud to be an official HP Amplify Partner and to ', 'We '))}</p></div></div>
        <ul class="logo-wall logo-wall--all">${partners.filter((p) => p.name !== 'HP').map((p) => `<li><img src="${url('public/logos/partners/' + p.logo)}" alt="${esc(p.name)}"></li>`).join('')}</ul>
      </div>
      <p class="hw__note">${icon('search')}${esc(d.products.stockNote)} Every item is quoted on request with current availability and warranty terms.</p>
    </div>
    ${foot(7)}
  </section>`;

  const whyIcons = ['award', 'coins', 'headset', 'building'];
  const why = `
  <section class="page why">
    <div class="inner">
      <p class="eyebrow"><span class="n">04</span>${esc(d.why.eyebrow)}</p>
      <h2>${esc(d.why.title)}</h2>
      <ul class="why__list">${d.why.items.map((w, i) => `<li><span class="ico ico--orange">${icon(whyIcons[i])}</span><div><h3>${esc(w.t)}</h3><p>${esc(w.d)}</p></div></li>`).join('')}</ul>
      <div class="clients">
        <p class="eyebrow">${esc(d.clients.eyebrow)}</p>
        <h3 class="clients__t">${esc(d.clients.title)}</h3>
        <ul>${clients.map((c) => `<li><div><img src="${url('public/logos/clients/' + c.logo)}" alt="${esc(c.name)}"></div><span>${esc(c.sector.en)}</span></li>`).join('')}</ul>
      </div>
      <div class="why__quote"><span class="num">98<i>%</i></span><p>of our clients stay with us. We are measured by the next call, not the first sale.</p></div>
    </div>
    ${foot(8)}
  </section>`;

  const contactRows = [
    ['phone', d.contact.phoneLabel, site.phoneDisplay],
    ['mail', d.contact.emailLabel, site.email],
    ['globe', 'Website', site.domain],
    ['pin', d.contact.addressLabel, d.contact.address],
    ['clock', d.contact.hoursLabel, d.contact.hours],
  ];
  const back = `
  <section class="page page--dark back">
    ${board('circuit--back')}
    <div class="inner">
      <p class="eyebrow"><span class="n">05</span>${esc(d.contact.eyebrow)}</p>
      <h2>${esc(d.contact.title)}</h2>
      <p class="lead">${esc(d.contact.intro)}</p>
      <div class="back__grid">
        <div class="back__card">
          <div class="back__person"><span class="ico ico--orange">${icon('handshake')}</span><div><strong>${esc(d.contact.person)}</strong><small>${esc(d.contact.personRole)}</small></div></div>
          <ul>${contactRows.map(([ic, k, v]) => `<li><span class="ico ico--dark">${icon(ic)}</span><div><small>${esc(k)}</small><b>${esc(v)}</b></div></li>`).join('')}</ul>
        </div>
        <div class="back__qrs">
          <div class="back__qr"><div class="qr">${qr(`${site.url}/`)}</div><p><b>Visit the website</b>${site.domain}</p></div>
          <div class="back__qr"><div class="qr">${qr(`https://wa.me/${site.whatsapp}`)}</div><p><b>Chat on WhatsApp</b>${site.phoneDisplay}</p></div>
        </div>
      </div>
      <div class="back__brand"><img src="${logoWhite}" alt="Hybrid Technology"><p>${esc(d.footer.tagline)}</p></div>
      <p class="back__tm">${esc(d.footer.trademarks)}</p>
    </div>
    <div class="bars"></div>
  </section>`;

  return { body: cover + about + offer + solutionPages + hardware + why + back, style: STYLE };
}

const STYLE = `
/* Cover */
.cover__top { position: relative; display: flex; justify-content: space-between; align-items: flex-start; padding: 16mm var(--pad) 0; }
.cover__top img { height: 13mm; width: auto; }
.cover__top span { font-family: var(--display); font-size: 8.5pt; letter-spacing: 0.16em; text-transform: uppercase; color: var(--on-dark-muted); text-align: right; line-height: 1.4; }
.cover__top span b { color: #fff; font-size: 13pt; letter-spacing: 0.06em; }
.cover__copy { position: relative; padding: 22mm var(--pad) 0; z-index: 2; }
.cover h1 { font-size: 47pt; line-height: 1.02; color: #fff; margin-top: 6mm; }
.cover h1 .hl { padding: 0 0.12em 0.02em; }
.cover__sub { margin-top: 7mm; font-size: 12.5pt; max-width: 118mm; color: var(--on-dark); opacity: 0.88; }
.cover__people { position: absolute; left: 0; right: 0; bottom: 7mm; height: 156mm; }
.cover__people::before { content: ''; position: absolute; left: 10%; right: 10%; bottom: -10mm; height: 70mm; background: radial-gradient(50% 50% at 50% 70%, rgba(143, 211, 244, 0.28), transparent 70%); }
.cover__people .p { position: absolute; bottom: 0; width: auto; max-width: none; filter: drop-shadow(0 18px 30px rgba(0, 20, 35, 0.45)); }
.cover__people .p--c { height: 100%; left: 50%; transform: translateX(-46%); z-index: 3; }
.cover__people .p--l { height: 85%; left: 5%; z-index: 2; filter: brightness(0.94) drop-shadow(0 18px 30px rgba(0, 20, 35, 0.45)); }
.cover__people .p--r { height: 88%; right: 4%; z-index: 1; filter: brightness(0.94) drop-shadow(0 18px 30px rgba(0, 20, 35, 0.45)); }
.cover__badge { position: absolute; right: var(--pad); top: 98mm; z-index: 4; display: flex; align-items: center; gap: 10px; padding: 9px 16px 9px 10px; background: #fff; border-radius: 999px; box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5); }
.cover__badge img { height: 9mm; width: 9mm; }
.cover__badge span { font-family: var(--display); font-size: 7.5pt; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); line-height: 1.25; }
.cover__badge b { color: var(--blue-ink); font-size: 10pt; letter-spacing: 0.02em; }
.cover .bars { z-index: 5; }

/* About */
.about__grid { display: grid; grid-template-columns: 1fr 66mm; gap: 9mm; margin-top: 8mm; }
.about__text > p:not(.lead) { margin-top: 4mm; color: var(--muted); }
.about .lead { margin-top: 0; color: var(--ink); font-size: 13pt; }
.about__photo { height: 84mm; }
.vm { display: grid; grid-template-columns: 1fr 1fr; gap: 4mm; margin-top: 7mm; }
.vm__card { border-radius: 12px; padding: 5mm; background: var(--blue-tint); }
.vm__card--o { background: var(--orange-soft); }
.vm__card p { margin-top: 2mm; font-family: var(--display); font-weight: 600; font-size: 11.5pt; line-height: 1.3; color: var(--blue-ink); }
.about__h { margin-top: 10mm; }
.values { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4mm; margin-top: 4mm; }
.values li { display: flex; align-items: center; gap: 3mm; font-family: var(--display); font-weight: 600; font-size: 10pt; color: var(--blue-ink); }
.sectors { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4mm; margin-top: 4mm; }
.sectors li { display: flex; align-items: center; gap: 3mm; padding: 3mm; border-radius: 12px; background: var(--surface); border: 1px solid var(--line); font-family: var(--display); font-weight: 600; font-size: 9.5pt; line-height: 1.2; color: var(--blue-ink); }
.sectors .ico { width: 8.5mm; height: 8.5mm; font-size: 4.4mm; }
.facts { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4mm; margin-top: 8mm; padding-top: 7mm; border-top: 1px solid var(--line); }
.facts li { display: flex; align-items: center; gap: 3mm; }
.facts small { display: block; font-size: 8pt; color: var(--muted); text-transform: uppercase; letter-spacing: 0.1em; font-family: var(--display); }
.facts strong { font-family: var(--display); font-size: 12pt; color: var(--blue-ink); }
.stats { position: relative; overflow: hidden; margin: auto var(--pad) 10mm; border-radius: 18px; background: linear-gradient(120deg, var(--blue-deep), var(--blue-ink)); color: #fff; padding: 9mm 8mm; }
.circuit--stats { width: 160mm; right: -30mm; top: -20mm; opacity: 0.12; }
.stats ul { position: relative; display: grid; grid-template-columns: repeat(4, 1fr); gap: 6mm; }
.stats .num { font-size: 30pt; line-height: 1; color: #fff; }
.stats .num i { font-style: normal; color: var(--orange); }
.stats p { margin-top: 2.5mm; font-size: 8.5pt; line-height: 1.35; color: var(--on-dark-muted); }

/* What we offer */
.offer .lead { margin-top: 3mm; }
.flow { display: flex; align-items: center; gap: 3mm; margin-top: 6mm; }
.flow li { display: flex; align-items: center; gap: 3mm; font-family: var(--display); font-weight: 600; font-size: 11pt; color: var(--blue-ink); }
.flow li .ico { width: 9mm; height: 9mm; font-size: 4.6mm; }
.flow i { color: var(--orange); font-size: 5mm; display: flex; margin: 0 2mm; }
.tiles { display: grid; grid-template-columns: 1fr 1fr; gap: 5mm; margin-top: 7mm; }
.tile { position: relative; border: 1px solid var(--line); border-radius: 16px; overflow: hidden; background: #fff; }
.tile__pic { height: 36mm; border-radius: 0; }
.tile__pic img { object-position: 50% 30%; }
.tile__body { display: flex; gap: 3.5mm; padding: 4mm 4.5mm 4.5mm; }
.tile h3 { font-size: 12pt; display: flex; gap: 2mm; align-items: baseline; }
.tile h3 .num { color: var(--orange); font-size: 9pt; }
.tile p { margin-top: 1.2mm; font-size: 8.6pt; color: var(--muted); line-height: 1.45; }
.tile__pg { position: absolute; top: 4mm; right: 4mm; padding: 3px 9px; border-radius: 999px; background: rgba(0, 38, 61, 0.78); color: #fff; font-family: var(--display); font-size: 7.5pt; letter-spacing: 0.08em; }
.sw-band { position: relative; overflow: hidden; display: flex; align-items: center; gap: 5mm; margin-top: auto; margin-bottom: 8mm; padding: 5mm 6mm; border-radius: 16px; background: linear-gradient(110deg, var(--blue-ink), #001a2a); color: var(--on-dark); }
.circuit--band { width: 150mm; right: -20mm; top: -30mm; opacity: 0.1; }
.sw-band h3 { color: #fff; font-size: 12.5pt; }
.sw-band p { font-size: 9pt; color: var(--on-dark-muted); margin-top: 1mm; }
.sw-band .ico { position: relative; }
.sw-band > div:not(.circuit) { position: relative; flex: 1; }
.sw-band__go { position: relative; display: inline-flex; align-items: center; gap: 2mm; white-space: nowrap; padding: 8px 14px; border-radius: 999px; background: var(--orange); color: #fff; font-family: var(--display); font-weight: 600; font-size: 9pt; }

/* Solution pages */
.sol__hero { position: relative; height: 112mm; flex: none; }
.sol__hero > img { width: 100%; height: 100%; object-fit: cover; object-position: 50% 28%; }
.sol__shade { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0, 38, 61, 0) 25%, rgba(0, 38, 61, 0.88) 100%), linear-gradient(90deg, rgba(0, 38, 61, 0.55), transparent 70%); }
.sol__head { position: absolute; left: var(--pad); right: var(--pad); bottom: 9mm; color: #fff; }
.sol__head h2 { color: #fff; display: flex; align-items: center; gap: 4mm; font-size: 28pt; margin-top: 3mm; }
.sol__head h2 .ico { width: 12mm; height: 12mm; font-size: 6.4mm; background: var(--orange); border: 0; }
.sol__head p { margin-top: 3mm; max-width: 150mm; font-size: 11pt; color: var(--on-dark); }
.sol__head .eyebrow .n { color: #fff; }
.sol__body { padding-top: 10mm; }
.sol__cols { display: grid; grid-template-columns: 1fr 1fr; gap: 10mm; }
.sol__cols h4 { margin-top: 7mm; }
.sol__cols > div > h4:first-child { margin-top: 0; }
.sol__cols h3 { margin-top: 1.5mm; font-size: 13pt; }
.pains { display: grid; gap: 2.5mm; margin-top: 3.5mm; }
.pains li, .wins li { display: flex; align-items: center; gap: 3mm; font-weight: 600; font-size: 10pt; color: var(--blue-ink); }
.pains .ico, .wins .ico { width: 8.5mm; height: 8.5mm; font-size: 4.4mm; border-radius: 8px; }
.steps { position: relative; display: grid; gap: 2.5mm; margin-top: 3.5mm; }
.steps li { position: relative; display: flex; align-items: center; gap: 3mm; padding: 2.4mm 3mm; border-radius: 10px; background: var(--surface); border: 1px solid var(--line); font-weight: 600; font-size: 10pt; color: var(--blue-ink); }
.steps .num { color: var(--orange); font-size: 9pt; width: 6mm; }
.steps .ico { width: 7.5mm; height: 7.5mm; font-size: 4mm; border-radius: 7px; background: #fff; }
.incl { display: grid; gap: 2.2mm; margin-top: 3.5mm; }
.incl li { display: flex; gap: 2.5mm; align-items: flex-start; font-size: 10pt; }
.incl .icon { color: var(--orange); margin-top: 0.25em; stroke-width: 2.4; }
.wins { display: grid; gap: 2.5mm; margin-top: 3.5mm; }
.wins li { padding: 2.4mm 3mm; border-radius: 10px; background: var(--orange-soft); }
.wins .ico { background: #fff; }
.sol__brands { margin-top: auto; margin-bottom: 8mm; padding-top: 6mm; border-top: 1px solid var(--line); display: grid; grid-template-columns: 34mm 1fr; align-items: center; gap: 5mm; }
.sol__brands .logo-wall { grid-template-columns: repeat(4, 1fr); }

/* Hardware */
.hw__head { display: grid; grid-template-columns: 1fr 52mm; gap: 8mm; align-items: end; }
.hw__photo { height: 54mm; }
.hw__photo img { object-position: 50% 25%; }
.hw .lead { font-size: 11pt; }
.hw h4 { margin-top: 6mm; }
.cats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2.6mm 4mm; margin-top: 3.5mm; }
.cats li { display: flex; align-items: center; gap: 3mm; padding: 1.6mm 3mm; border-radius: 10px; background: var(--surface); border: 1px solid var(--line); font-weight: 600; font-size: 9pt; color: var(--blue-ink); line-height: 1.25; }
.cats .ico { width: 7.5mm; height: 7.5mm; font-size: 4mm; border-radius: 7px; background: #fff; }
.hw__brands { margin-top: 6mm; }
.amplify { display: flex; gap: 5mm; align-items: center; padding: 4mm 6mm; border-radius: 14px; background: var(--blue-tint); }
.amplify img { width: 14mm; height: 14mm; }
.amplify p { font-size: 9pt; color: var(--muted); margin-top: 1mm; }
.logo-wall--all { grid-template-columns: repeat(5, 1fr); margin-top: 4mm; gap: 2.6mm; }
.logo-wall--all li { height: 11.5mm; }
.logo-wall--all img { max-height: 6.5mm; }
.hw__note { display: flex; align-items: center; gap: 2.5mm; margin-top: auto; margin-bottom: 8mm; padding-top: 4mm; font-size: 9.5pt; color: var(--muted); }
.hw__note .icon { color: var(--orange); font-size: 1.2em; }

/* Why + clients */
.why__list { display: grid; grid-template-columns: 1fr 1fr; gap: 8mm 8mm; margin-top: 10mm; }
.why__list li { display: flex; gap: 4mm; }
.why__list h3 { font-size: 12.5pt; }
.why__list p { margin-top: 1.5mm; font-size: 9.5pt; color: var(--muted); }
.clients { margin-top: 14mm; padding: 9mm 8mm; border-radius: 18px; background: var(--surface); border: 1px solid var(--line); }
.clients__t { margin-top: 3mm; font-size: 15pt; max-width: 140mm; }
.clients ul { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5mm 4mm; margin-top: 7mm; }
.clients li > div { display: grid; place-items: center; height: 22mm; padding: 3mm 5mm; background: #fff; border-radius: 10px; border: 1px solid var(--line); }
.clients img { max-height: 12mm; max-width: 100%; width: auto; object-fit: contain; }
.clients li > span { display: block; margin-top: 1.5mm; text-align: center; font-family: var(--display); font-size: 7.5pt; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); }
.why__quote { display: flex; align-items: center; gap: 6mm; margin-top: auto; margin-bottom: 9mm; padding-top: 8mm; }
.why__quote .num { font-size: 42pt; line-height: 1; color: var(--blue); }
.why__quote .num i { font-style: normal; color: var(--orange); }
.why__quote p { font-family: var(--display); font-weight: 600; font-size: 14pt; line-height: 1.3; color: var(--blue-ink); max-width: 110mm; }

/* Back cover */
.back .inner { position: relative; padding-top: 24mm; }
.back h2 { font-size: 34pt; max-width: 150mm; }
.back__grid { display: grid; grid-template-columns: 1fr 34mm; gap: 8mm; margin-top: 12mm; }
.back__card { padding: 7mm; border-radius: 18px; background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(255, 255, 255, 0.14); }
.back__person { display: flex; align-items: center; gap: 4mm; padding-bottom: 5mm; margin-bottom: 5mm; border-bottom: 1px solid rgba(255, 255, 255, 0.14); }
.back__person strong { display: block; font-family: var(--display); font-size: 16pt; color: #fff; }
.back__person small { color: var(--on-dark-muted); font-size: 9.5pt; }
.back__card ul { display: grid; gap: 4mm; }
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
.back__brand p { font-family: var(--display); font-size: 9pt; letter-spacing: 0.1em; text-transform: uppercase; color: var(--on-dark-muted); text-align: right; max-width: 80mm; }
.back__tm { margin: 5mm 0 16mm; font-size: 7pt; color: var(--on-dark-muted); opacity: 0.7; }
`;
