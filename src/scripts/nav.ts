const hdr = document.getElementById('hdr');
const toggle = document.getElementById('nav-toggle') as HTMLInputElement | null;
const onScroll = () => hdr?.classList.toggle('is-scrolled', window.scrollY > 40);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });
// Close the drawer when a link is chosen; lock body scroll while open.
hdr?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => { if (toggle) toggle.checked = false; document.body.style.overflow = ''; }));
toggle?.addEventListener('change', () => { document.body.style.overflow = toggle.checked ? 'hidden' : ''; });
// Persist explicit language choice.
document.querySelectorAll<HTMLAnchorElement>('[data-lang-toggle]').forEach((a) =>
  a.addEventListener('click', () => { try { localStorage.setItem('hy_lang', a.dataset.langToggle || 'en'); sessionStorage.removeItem('hy_redir'); } catch {} }),
);
// Hide the WhatsApp button while the contact section is on screen.
const fab = document.getElementById('wa-fab');
const contact = document.getElementById('contact');
if (fab && contact && 'IntersectionObserver' in window) {
  new IntersectionObserver(([e]) => fab.classList.toggle('is-hidden', e.isIntersecting), { threshold: 0.15 }).observe(contact);
}
