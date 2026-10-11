// Software section driver. Writes one custom property per chapter, --p (0 = the problem, 1 = the fix);
// Software.astro turns it into every movement with calc().
// - Desktop (wide and tall enough): chapters pin (CSS, under .sw--live) and --p follows the scroll
//   position through the chapter, eased toward its target for a soft scrub.
// - Phones / short screens: no pinning; each stage plays problem -> fix once when it is well in view.
// - Reduced motion or no JS: --p keeps its CSS default of 1, so the finished state shows.
// Plus a cursor spotlight on fine pointers.

const section = document.querySelector<HTMLElement>('[data-sw]');

if (section) {
  const chapters = Array.from(section.querySelectorAll<HTMLElement>('[data-ch]'));
  const motionOk = matchMedia('(prefers-reduced-motion: no-preference)');
  const pinnable = matchMedia('(min-width: 960px) and (min-height: 620px)');
  const finePointer = matchMedia('(pointer: fine)');
  const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const setP = (el: HTMLElement, p: number) => el.style.setProperty('--p', p.toFixed(4));

  let teardown: (() => void) | null = null;

  const scrub = () => {
    const state = chapters.map(() => ({ cur: -1, target: 0, written: -1 }));
    let raf = 0;
    const measure = () => {
      chapters.forEach((ch, i) => {
        const pin = ch.firstElementChild as HTMLElement;
        const top = parseFloat(getComputedStyle(pin).top) || 0;
        const r = ch.getBoundingClientRect();
        const range = r.height - pin.offsetHeight;
        // 0 when the chapter pins, 1 a little before it unpins so the fix holds on screen.
        state[i].target = range > 0 ? clamp01((top - r.top) / (range * 0.82)) : 1;
      });
    };
    const frame = () => {
      raf = 0;
      measure();
      let moving = false;
      chapters.forEach((ch, i) => {
        const s = state[i];
        const d = s.target - s.cur;
        if (s.cur < 0 || Math.abs(d) < 0.001) s.cur = s.target;
        else { s.cur += d * 0.16; moving = true; }
        if (s.cur !== s.written) { setP(ch, s.cur); s.written = s.cur; }
      });
      if (moving) raf = requestAnimationFrame(frame);
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(frame); };
    schedule();
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule, { passive: true });
    return () => { removeEventListener('scroll', schedule); removeEventListener('resize', schedule); cancelAnimationFrame(raf); };
  };

  const playOnView = () => {
    const timers: number[] = [];
    let stopped = false;
    const play = (ch: HTMLElement) => {
      const t0 = performance.now() + 500, dur = 2600;
      const tick = (now: number) => {
        if (stopped) return;
        const t = clamp01((now - t0) / dur);
        setP(ch, easeInOut(t));
        if (t < 1) timers.push(requestAnimationFrame(tick));
      };
      timers.push(requestAnimationFrame(tick));
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        play((en.target as HTMLElement).closest<HTMLElement>('[data-ch]')!);
      });
    }, { threshold: 0.6 });
    chapters.forEach((ch) => {
      setP(ch, 0);
      const stage = ch.querySelector('.ch__stage');
      if (stage) io.observe(stage);
    });
    return () => { stopped = true; io.disconnect(); timers.forEach(cancelAnimationFrame); };
  };

  const apply = () => {
    teardown?.();
    teardown = null;
    if (!motionOk.matches) {
      section.classList.remove('sw--live');
      chapters.forEach((ch) => ch.style.removeProperty('--p'));
      return;
    }
    if (pinnable.matches) {
      section.classList.add('sw--live');
      teardown = scrub();
    } else {
      section.classList.remove('sw--live');
      teardown = playOnView();
    }
  };
  apply();
  motionOk.addEventListener('change', apply);
  pinnable.addEventListener('change', apply);

  // Spotlight that follows the cursor across the section.
  let sraf = 0, mx = 0, my = 0;
  section.addEventListener('pointermove', (e) => {
    if (!finePointer.matches || !motionOk.matches) return;
    const r = section.getBoundingClientRect();
    mx = e.clientX - r.left; my = e.clientY - r.top;
    if (!sraf) sraf = requestAnimationFrame(() => {
      sraf = 0;
      section.style.setProperty('--mx', `${mx}px`);
      section.style.setProperty('--my', `${my}px`);
    });
  }, { passive: true });
}
