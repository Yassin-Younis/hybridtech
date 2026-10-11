// Software page driver. Writes one custom property per chapter, --p (0 = the problem, 1 = the fix);
// SoftwareScene.astro and Software.astro turn it into every movement with calc().
// Each chapter plays problem -> fix once, by itself, when its stage is well in view (no scroll-scrubbing:
// it needed several full scrolls per chapter on desktop). Reduced motion or no JS: --p keeps its
// CSS default of 1, so the finished state shows. Plus a cursor spotlight on fine pointers.

const section = document.querySelector<HTMLElement>('[data-sw]');

if (section) {
  const chapters = Array.from(section.querySelectorAll<HTMLElement>('[data-ch]'));
  const motionOk = matchMedia('(prefers-reduced-motion: no-preference)');
  const finePointer = matchMedia('(pointer: fine)');
  const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const setP = (el: HTMLElement, p: number) => el.style.setProperty('--p', p.toFixed(4));
  const DELAY = 450, DURATION = 2400;

  let teardown: (() => void) | null = null;

  const playOnView = () => {
    const frames: number[] = [];
    let stopped = false;
    const play = (ch: HTMLElement) => {
      const t0 = performance.now() + DELAY;
      const tick = (now: number) => {
        if (stopped) return;
        const t = clamp01((now - t0) / DURATION);
        setP(ch, easeInOut(t));
        if (t < 1) frames.push(requestAnimationFrame(tick));
      };
      frames.push(requestAnimationFrame(tick));
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
    return () => { stopped = true; io.disconnect(); frames.forEach(cancelAnimationFrame); };
  };

  const apply = () => {
    teardown?.();
    teardown = null;
    if (!motionOk.matches) {
      section.classList.remove('sw--live');
      chapters.forEach((ch) => ch.style.removeProperty('--p'));
      return;
    }
    section.classList.add('sw--live');
    teardown = playOnView();
  };
  apply();
  motionOk.addEventListener('change', apply);

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
