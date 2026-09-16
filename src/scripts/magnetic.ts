// Subtle magnetic pull on primary buttons, pointer devices only.
if (matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches) {
  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    const max = 6;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const dx = ((e.clientX - (r.left + r.width / 2)) / r.width) * max * 2;
      const dy = ((e.clientY - (r.top + r.height / 2)) / r.height) * max * 2;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
}
