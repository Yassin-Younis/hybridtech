import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

const html = document.documentElement;
const mm = gsap.matchMedia();

// Reveals and counters are cheap and work everywhere; gate only the "motion" ones.
mm.add('(prefers-reduced-motion: no-preference)', () => {
  html.classList.add('motion-ok');
  gsap.registerPlugin(ScrollTrigger);

  const lenis = new Lenis({ lerp: 0.11, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  // Anchor links go through Lenis so smooth scrolling and header offset stay consistent.
  document.querySelectorAll<HTMLAnchorElement>('a[href*="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const url = new URL(a.href, location.href);
      if (url.pathname !== location.pathname || !url.hash) return;
      const el = document.querySelector(url.hash);
      if (!el) return;
      e.preventDefault();
      history.pushState(null, '', url.hash);
      lenis.scrollTo(el as HTMLElement, { offset: -72 });
    });
  });

  // Scroll reveals (IntersectionObserver keeps this cheap).
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
  document.querySelectorAll('[data-reveal]').forEach((el, i) => {
    const group = el.parentElement;
    const idx = group ? Array.from(group.children).filter((c) => c.hasAttribute('data-reveal')).indexOf(el) : 0;
    (el as HTMLElement).style.setProperty('--d', `${Math.min(idx, 7) * 90}ms`);
    io.observe(el);
  });

  // One parallax layer: the circuit traces drift slower than the page.
  const rtl = html.dir === 'rtl';
  document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((layer) => {
    const svg = layer.querySelector('svg');
    if (!svg) return;
    gsap.fromTo(svg, { yPercent: -6, xPercent: rtl ? 2 : -2 }, {
      yPercent: 14, xPercent: rtl ? -3 : 3, ease: 'none',
      scrollTrigger: { trigger: layer.parentElement, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
    });
  });

  return () => { lenis.destroy(); io.disconnect(); };
});

// Counters run in both modes (final value is already in the HTML; we just count up when motion is allowed).
const counters = document.querySelectorAll<HTMLElement>('[data-count]');
if (counters.length && matchMedia('(prefers-reduced-motion: no-preference)').matches) {
  const fmt = new Intl.NumberFormat('en');
  const cio = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target as HTMLElement;
      const target = Number(el.dataset.count);
      const obj = { v: 0 };
      gsap.to(obj, { v: target, duration: 1.8, ease: 'power3.out', onUpdate: () => { el.textContent = fmt.format(Math.round(obj.v)); } });
      cio.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach((c) => cio.observe(c));
}
