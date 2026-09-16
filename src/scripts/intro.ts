// Logo intro (first page view per session). The head script in Base.astro decides whether it plays
// and adds html.hy-intro; CSS runs the draw-in, this measures the header logo and hands off to it.
// If this never runs, CSS failsafes in Intro.astro clear the overlay after ~3s.

const html = document.documentElement;
const intro = document.getElementById('intro');
const logo = intro?.querySelector<SVGSVGElement>('.intro__logo');
const target = document.querySelector<HTMLElement>('.hdr__logo');

const end = () => {
  html.classList.remove('hy-intro', 'hy-intro-go');
  intro?.remove();
};

if (!html.classList.contains('hy-intro') || !intro || !logo || !target) {
  end();
} else {
  let flown = false;
  const fly = () => {
    if (flown) return;
    flown = true;
    removeEventListener('pointerdown', skip);
    removeEventListener('keydown', skip);
    const from = logo.getBoundingClientRect(), to = target.getBoundingClientRect();
    logo.style.setProperty('--fx', `${to.left - from.left}px`);
    logo.style.setProperty('--fy', `${to.top - from.top}px`);
    logo.style.setProperty('--fs', `${to.width / from.width}`);
    html.classList.add('hy-intro-go');
    // Land: swap to the real header logo, then drop the helper classes once the nav has settled.
    setTimeout(() => {
      html.classList.remove('hy-intro');
      intro.remove();
      setTimeout(end, 300);
    }, 640);
  };
  // Any early input skips straight to the flight.
  const skip = () => {
    intro.getAnimations({ subtree: true }).forEach((a) => a.finish());
    fly();
  };
  addEventListener('pointerdown', skip, { passive: true });
  addEventListener('keydown', skip);
  const hold = logo.getAnimations?.()[0];
  if (hold) hold.finished.then(fly, fly);
  else setTimeout(fly, 1150);
}
