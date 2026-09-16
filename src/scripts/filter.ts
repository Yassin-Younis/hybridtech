// Product catalog filtering. Cards are all pre-rendered; we only toggle visibility.
const grid = document.getElementById('catalog');
if (grid) {
  const cards = Array.from(grid.querySelectorAll<HTMLElement>('[data-category]'));
  const chips = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-cat]'));
  const brandSel = document.getElementById('brand') as HTMLSelectElement | null;
  const count = document.getElementById('count');
  const empty = document.getElementById('empty');
  const countTpl = count?.dataset.tpl || '{n}';
  let cat = new URLSearchParams(location.search).get('cat') || 'all';
  const apply = () => {
    const brand = brandSel?.value || 'all';
    let n = 0;
    cards.forEach((c) => {
      const show = (cat === 'all' || c.dataset.category === cat) && (brand === 'all' || c.dataset.brand === brand);
      c.hidden = !show; if (show) n++;
    });
    chips.forEach((ch) => ch.classList.toggle('is-active', (ch.dataset.cat || 'all') === cat));
    if (count) count.textContent = countTpl.replace('{n}', String(n));
    if (empty) empty.hidden = n > 0;
    const url = new URL(location.href);
    if (cat === 'all') url.searchParams.delete('cat'); else url.searchParams.set('cat', cat);
    history.replaceState(null, '', url);
  };
  chips.forEach((ch) => ch.addEventListener('click', (e) => { e.preventDefault(); cat = ch.dataset.cat || 'all'; apply(); }));
  brandSel?.addEventListener('change', apply);
  apply();
}
