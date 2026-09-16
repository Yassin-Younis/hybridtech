// Live circuit board controller (CircuitLayer `flow`, hero only).
// With motion allowed the board is drawn on a <canvas> by circuit-render.ts inside a worker
// (OffscreenCanvas), so animating it costs the main thread nothing per frame.
// The static SVG stays in the markup for reduced motion / no JS and until the first canvas frame.
// The clock runs only while the board is on screen, the tab is visible and the logo intro has
// handed off (the board sits under the intro cover until then).

const html = document.documentElement;
const motionOk = matchMedia('(prefers-reduced-motion: no-preference)');
const MAX_DPR = 2;

type Backend = { size(w: number, h: number): void; run(on: boolean): void };

export function liveBoard(el: HTMLElement) {
  const canvas = el.querySelector<HTMLCanvasElement>('.circuit__canvas');
  // Browsers without OffscreenCanvas (Safari < 16.4) keep the static SVG board.
  if (!canvas || !('transferControlToOffscreen' in canvas) || typeof Worker === 'undefined') return;
  let backend: Backend | null = null, ready = false, starting = false;
  let onScreen = true, failed = false, w = 0, h = 0;

  const introWaiting = () => html.classList.contains('hy-intro') && !html.classList.contains('hy-intro-go');
  const sync = () => {
    const allowed = motionOk.matches && w > 0 && h > 0 && !failed;
    if (allowed && !backend && !starting) start();
    el.classList.toggle('is-live', allowed && ready);
    backend?.run(allowed && ready && onScreen && !document.hidden && !introWaiting());
  };
  const markReady = () => { ready = true; sync(); };

  const start = () => {
    starting = true;
    let worker: Worker;
    try {
      worker = new Worker(new URL('./circuit-worker.ts', import.meta.url), { type: 'module' });
    } catch { failed = true; starting = false; return; }
    const off = canvas.transferControlToOffscreen();
    let tickRaf = 0, ticking = false;
    const tick = (now: number) => { worker.postMessage({ type: 'tick', now }); tickRaf = requestAnimationFrame(tick); };
    let needsTicks = false;
    worker.onmessage = (e) => {
      if (e.data.type === 'ready') needsTicks = !e.data.raf;
      if (e.data.type === 'drawn') { starting = false; markReady(); }
    };
    // If the worker cannot run, the static SVG board simply stays.
    worker.onerror = () => { failed = true; starting = false; worker.terminate(); cancelAnimationFrame(tickRaf); backend = null; ready = false; el.classList.remove('is-live'); };
    backend = {
      size: (sw, sh) => worker.postMessage({ type: 'size', w: sw, h: sh }),
      run: (on) => {
        worker.postMessage({ type: 'run', on });
        if (needsTicks && on !== ticking) { ticking = on; if (on) tickRaf = requestAnimationFrame(tick); else cancelAnimationFrame(tickRaf); }
      },
    };
    worker.postMessage({ type: 'init', canvas: off, w, h }, [off]);
  };

  // Backing store in device pixels (capped), tracked through layout and zoom changes.
  const ro = new ResizeObserver(([entry]) => {
    const dpr = devicePixelRatio || 1, cap = Math.min(1, MAX_DPR / dpr);
    const dp = entry.devicePixelContentBoxSize?.[0];
    const nw = Math.round((dp ? dp.inlineSize : entry.contentRect.width * dpr) * cap);
    const nh = Math.round((dp ? dp.blockSize : entry.contentRect.height * dpr) * cap);
    if (nw === w && nh === h) return;
    w = nw; h = nh;
    backend?.size(w, h);
    sync();
  });
  try { ro.observe(canvas, { box: 'device-pixel-content-box' }); } catch { ro.observe(canvas); }

  new MutationObserver(sync).observe(html, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('visibilitychange', sync);
  motionOk.addEventListener('change', sync);

  if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; sync(); }).observe(el);
}
