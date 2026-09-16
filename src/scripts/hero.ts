// Hero parallax: the stage (people) reacts to the pointer and to scroll.
// The script only writes four custom properties on the stage; each layer's CSS turns them into a
// transform weighted by its own depth (--d), so one style write per frame moves every layer.
// Gated on prefers-reduced-motion like motion.ts; with reduced motion or no JS the props stay 0
// and the hero is a static composition.

import { liveBoard } from './circuit-flow';

const board = document.querySelector<HTMLElement>('.hero .circuit--flow');
if (board) liveBoard(board);

const stage = document.querySelector<HTMLElement>('.hero__stage');

if (stage) {
  const host = stage.closest<HTMLElement>('.hero') ?? stage;
  const motionOk = matchMedia('(prefers-reduced-motion: no-preference)');
  const pointerOk = matchMedia('(pointer: fine) and (min-width: 1000px)');
  const dir = document.documentElement.dir === 'rtl' ? -1 : 1;
  const MAX_X = 12, MAX_Y = 8;   // pointer travel in px for the front-most layer
  const SCROLL_K = 0.28;         // scroll travel for the back-most layer, as a share of scrollY

  let tx = 0, ty = 0, px = 0, py = 0, sy = -1, raf = 0, limit = 0;
  const set = (k: string, v: number) => stage.style.setProperty(k, `${v.toFixed(2)}px`);

  const frame = () => {
    raf = 0;
    px += (tx - px) * 0.09;
    py += (ty - py) * 0.09;
    if (Math.abs(tx - px) < 0.05) px = tx;
    if (Math.abs(ty - py) < 0.05) py = ty;
    set('--px', px); set('--py', py);
    const s = Math.min(scrollY, limit) * SCROLL_K;
    if (s !== sy) { sy = s; set('--sy', s); set('--sx', dir * s * 0.12); }
    if (px !== tx || py !== ty) raf = requestAnimationFrame(frame);
  };
  const schedule = () => { if (!raf) raf = requestAnimationFrame(frame); };
  const measure = () => { limit = host.offsetTop + host.offsetHeight; schedule(); };

  const onMove = (e: PointerEvent) => {
    if (!pointerOk.matches) return;
    tx = (e.clientX / innerWidth - 0.5) * 2 * MAX_X;
    ty = (e.clientY / innerHeight - 0.5) * 2 * MAX_Y;
    schedule();
  };
  const onLeave = () => { tx = 0; ty = 0; schedule(); };
  const onScroll = () => { if (scrollY <= limit || sy < limit * SCROLL_K) schedule(); };

  const start = () => {
    measure();
    addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', measure, { passive: true });
    addEventListener('load', measure);
  };
  const stop = () => {
    removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerleave', onLeave);
    removeEventListener('scroll', onScroll);
    removeEventListener('resize', measure);
    removeEventListener('load', measure);
    cancelAnimationFrame(raf); raf = 0; tx = ty = px = py = 0; sy = -1;
    ['--px', '--py', '--sy', '--sx'].forEach((k) => stage.style.removeProperty(k));
  };

  if (motionOk.matches) start();
  motionOk.addEventListener('change', (e) => (e.matches ? start() : stop()));
}
