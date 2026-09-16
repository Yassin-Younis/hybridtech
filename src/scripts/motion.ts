// Motion layer without GSAP: scroll reveals (IntersectionObserver), one scroll-linked parallax layer,
// counter tweens (rAF), and Lenis smooth scrolling loaded on demand.
// Everything is gated on prefers-reduced-motion; the CSS in motion.css only hides reveal targets
// once <html class="motion-ok"> is set, so no-JS and reduced-motion users see a static page.

const html = document.documentElement;
const motionOk = matchMedia('(prefers-reduced-motion: no-preference)');
// Lenis only earns its ~8 KB on wheel-driven viewports; phones use native (already smooth) scrolling.
const wantsLenis = () => matchMedia('(min-width: 640px)').matches;

type Lenis = import('lenis').default;
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

function start(): () => void {
  html.classList.add('motion-ok');
  const cleanups: Array<() => void> = [];
  let stopped = false;

  // Smooth scrolling (lazy chunk; nothing here blocks first paint).
  let lenis: Lenis | null = null;
  if (wantsLenis()) {
    import('lenis').then(({ default: LenisCtor }) => {
      if (stopped) return;
      lenis = new LenisCtor({ lerp: 0.11, smoothWheel: true });
      let id = 0;
      const raf = (t: number) => { lenis?.raf(t); id = requestAnimationFrame(raf); };
      id = requestAnimationFrame(raf);
      cleanups.push(() => { cancelAnimationFrame(id); lenis?.destroy(); lenis = null; });
    });
  }
  // Anchor links go through Lenis so smooth scrolling stays consistent. The fixed-header offset
  // comes from `scroll-padding-block-start` on <html> (base.css), which both Lenis.scrollTo and
  // the browser's native anchor scrolling (the no-Lenis path) honour.
  const onAnchor = (e: Event) => {
    const a = (e.currentTarget as HTMLAnchorElement);
    const url = new URL(a.href, location.href);
    if (!lenis || url.pathname !== location.pathname || !url.hash) return;
    const el = document.querySelector<HTMLElement>(url.hash);
    if (!el) return;
    e.preventDefault();
    history.pushState(null, '', url.hash);
    lenis.scrollTo(el);
  };
  const anchors = document.querySelectorAll<HTMLAnchorElement>('a[href*="#"]');
  anchors.forEach((a) => a.addEventListener('click', onAnchor));
  cleanups.push(() => anchors.forEach((a) => a.removeEventListener('click', onAnchor)));

  // Scroll reveals.
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
  document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
    const group = el.parentElement;
    const idx = group ? Array.from(group.children).filter((c) => c.hasAttribute('data-reveal')).indexOf(el) : 0;
    el.style.setProperty('--d', `${Math.min(idx, 7) * 90}ms`);
    io.observe(el);
  });
  cleanups.push(() => io.disconnect());

  // One parallax layer: the circuit traces drift slower than the page.
  // Progress 0 -> 1 as the host section travels from "top at viewport bottom" to "bottom at viewport top";
  // the transform lerps toward that target so it keeps the soft scrubbed feel GSAP gave it.
  const rtl = html.dir === 'rtl';
  const from = { y: -6, x: rtl ? 2 : -2 }, to = { y: 14, x: rtl ? -3 : 3 };
  const layers = Array.from(document.querySelectorAll<HTMLElement>('[data-parallax]'))
    // The board's <svg> and, on the hero, the <canvas> that draws the live board move together.
    .map((layer) => ({ host: layer.parentElement as HTMLElement, els: Array.from(layer.querySelectorAll<HTMLElement | SVGSVGElement>(':scope > svg, :scope > canvas')), top: 0, h: 0, cur: -1 }))
    .filter((l) => l.host && l.els.length);
  if (layers.length) {
    let raf = 0, vh = innerHeight;
    const measure = () => {
      vh = innerHeight;
      const sy = scrollY;
      layers.forEach((l) => { const r = l.host.getBoundingClientRect(); l.top = r.top + sy; l.h = r.height; });
    };
    const frame = () => {
      raf = 0;
      const sy = scrollY;
      let moving = false;
      layers.forEach((l) => {
        const target = clamp01((sy + vh - l.top) / (vh + l.h));
        if (l.cur < 0) l.cur = target;
        const d = target - l.cur;
        if (Math.abs(d) < 0.0005) { if (l.cur === target) return; l.cur = target; } else { l.cur += d * 0.14; moving = true; }
        const p = l.cur;
        const tf = `translate3d(${from.x + (to.x - from.x) * p}%, ${from.y + (to.y - from.y) * p}%, 0)`;
        l.els.forEach((el) => { el.style.transform = tf; });
      });
      if (moving) raf = requestAnimationFrame(frame);
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(frame); };
    const onResize = () => { measure(); schedule(); };
    measure(); schedule();
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', onResize, { passive: true });
    addEventListener('load', onResize);
    cleanups.push(() => {
      removeEventListener('scroll', schedule); removeEventListener('resize', onResize); removeEventListener('load', onResize);
      cancelAnimationFrame(raf); layers.forEach((l) => l.els.forEach((el) => { el.style.transform = ''; }));
    });
  }

  // Counters: the final value is already in the HTML; we only count up to it.
  const counters = document.querySelectorAll<HTMLElement>('[data-count]');
  if (counters.length) {
    const fmt = new Intl.NumberFormat('en');
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const el = en.target as HTMLElement;
        cio.unobserve(el);
        const target = Number(el.dataset.count);
        const t0 = performance.now(), dur = 1800;
        const tick = (now: number) => {
          const t = clamp01((now - t0) / dur);
          el.textContent = fmt.format(Math.round(target * easeOutCubic(t)));
          if (t < 1 && !stopped) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.5 });
    counters.forEach((c) => cio.observe(c));
    cleanups.push(() => cio.disconnect());
  }

  return () => { stopped = true; cleanups.splice(0).forEach((fn) => fn()); html.classList.remove('motion-ok'); };
}

let stop: (() => void) | null = motionOk.matches ? start() : null;
motionOk.addEventListener('change', (e) => {
  stop?.(); stop = e.matches ? start() : null;
});
