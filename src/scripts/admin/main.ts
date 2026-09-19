// Catalogue admin UI. State lives in memory; "Publish" sends one commit with every change.
import { GitHub, GhError, type FileChange } from './github';
import { prepareImage, type PreparedImage } from './image';
import { makeProductSchema, categorySchema, type ProductInput } from '../../data/product-schema';
import { admin } from '../../data/admin';

type L = { en: string; ar: string };
type Product = ProductInput & { name: L; blurb: L };
type Category = { id: string; icon: string; label: L };

const TOKEN_KEY = 'hy_admin_token', BRANCH_KEY = 'hy_admin_branch';
const $ = <T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel)!;
const $$ = <T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document) => [...root.querySelectorAll<T>(sel)];
const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const icon = (n: string) => document.querySelector<HTMLTemplateElement>(`template[data-icon="${n}"]`)?.innerHTML ?? '';
const slugify = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const base = document.body.dataset.base || '/';

// ---------- state ----------
let gh: GitHub;
let products: Product[] = [], categories: Category[] = [];
let orig = { products: [] as Product[], categories: [] as Category[], productsSha: '', categoriesSha: '' };
const pendingImages = new Map<string, PreparedImage>(); // product id -> prepared photo (not yet committed)
const removedImages = new Set<string>(); // repo paths (products/x.webp) to delete on publish
let filterCat = '', query = '', tab: 'products' | 'categories' = 'products';
let publishing = false;

const productSchema = () => makeProductSchema(categories.map((c) => c.id));
const imgSrc = (p: Product) => pendingImages.get(p.id)?.dataUrl ?? (p.image ? `${base}${p.image}` : '');

// ---------- toast / confirm ----------
let toastT = 0;
const toast = (msg: string, kind: 'ok' | 'err' | 'info' = 'info', ms = 3500) => {
  const t = $('#toast');
  t.textContent = msg; t.className = `ad__toast ad__toast--${kind}`; t.hidden = false;
  clearTimeout(toastT);
  if (ms) toastT = window.setTimeout(() => (t.hidden = true), ms);
};
const confirm = (text: string, yes = 'Yes') =>
  new Promise<boolean>((res) => {
    const d = $<HTMLDialogElement>('#confirm');
    $('#confirm-text', d).textContent = text; $('#confirm-yes', d).textContent = yes;
    const done = () => { d.removeEventListener('close', done); res(d.returnValue === 'yes'); d.returnValue = ''; };
    d.addEventListener('close', done); d.showModal();
  });
$$('[data-close]').forEach((b) => b.addEventListener('click', () => { const d = b.closest('dialog') as HTMLDialogElement; d.returnValue = ''; d.close(); }));
$$('.ic[data-ic]').forEach((el) => (el.innerHTML = icon(el.dataset.ic!)));

// ---------- boot ----------
const show = (id: 'connect' | 'loading' | 'panel') => { for (const s of ['connect', 'loading', 'panel']) $(`#${s}`).hidden = s !== id; };

async function boot() {
  const m = location.hash.match(/[#&]token=([^&]+)/);
  if (m) { localStorage.setItem(TOKEN_KEY, decodeURIComponent(m[1])); history.replaceState(null, '', location.pathname + location.search); }
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return show('connect');
  await connect(token);
}

async function connect(token: string) {
  const branch = localStorage.getItem(BRANCH_KEY) || admin.branch;
  gh = new GitHub(token, branch);
  show('loading');
  try {
    const me = await gh.whoAmI();
    if (!me.canPush) throw new GhError(403, 'This token cannot write to the catalogue repository. Ask for a token with "Contents: read and write".');
    localStorage.setItem(TOKEN_KEY, token);
    $('#who').hidden = false;
    $('#who-name').textContent = (me.login ? `Connected as ${me.login}` : 'Connected') + (branch !== admin.branch ? ` · branch ${branch}` : '');
    await load();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    localStorage.removeItem(TOKEN_KEY);
    show('connect');
    const err = $('#connect-error'); err.textContent = msg; err.hidden = false;
  }
}

async function load() {
  show('loading');
  const [p, c] = await Promise.all([gh.readFile(admin.paths.products), gh.readFile(admin.paths.categories)]);
  products = JSON.parse(p.text); categories = JSON.parse(c.text);
  orig = { products: clone(products), categories: clone(categories), productsSha: p.sha, categoriesSha: c.sha };
  pendingImages.clear(); removedImages.clear();
  show('panel'); renderAll();
}

$('#connect-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const token = (new FormData(e.target as HTMLFormElement).get('token') as string).trim();
  if (!token) return;
  $('#connect-error').hidden = true;
  ($('#connect-btn') as HTMLButtonElement).disabled = true;
  await connect(token);
  ($('#connect-btn') as HTMLButtonElement).disabled = false;
});
$('#signout').addEventListener('click', async () => {
  if (isDirty() && !(await confirm('You have unpublished changes. Sign out and lose them?', 'Sign out'))) return;
  localStorage.removeItem(TOKEN_KEY); location.reload();
});
$('#reload').addEventListener('click', async () => {
  if (isDirty() && !(await confirm('Reloading discards your unpublished changes. Continue?', 'Reload'))) return;
  try { await load(); toast('Catalogue reloaded.', 'ok'); } catch (e) { show('panel'); toast(String((e as Error).message), 'err'); }
});

// ---------- diff / dirty ----------
type Change = 'added' | 'changed' | 'removed' | 'moved' | '';
const productState = (p: Product, i: number): Change => {
  const oi = orig.products.findIndex((o) => o.id === p.id);
  if (oi < 0) return 'added';
  if (!same(orig.products[oi], p) || pendingImages.has(p.id)) return 'changed';
  return oi !== i ? 'moved' : '';
};
const removedProducts = () => orig.products.filter((o) => !products.some((p) => p.id === o.id));
const isDirty = () => !same(products, orig.products) || !same(categories, orig.categories) || pendingImages.size > 0 || removedImages.size > 0;

function summary(): string[] {
  const s: string[] = [];
  const n = (k: number, one: string, many = one + 's') => `${k} ${k === 1 ? one : many}`;
  const added = products.filter((p) => !orig.products.some((o) => o.id === p.id)).length;
  const changed = products.filter((p, i) => productState(p, i) === 'changed').length;
  const moved = products.filter((p, i) => productState(p, i) === 'moved').length;
  const removed = removedProducts().length;
  if (added) s.push(n(added, 'product') + ' added');
  if (changed) s.push(n(changed, 'product') + ' updated');
  if (removed) s.push(n(removed, 'product') + ' removed');
  if (moved) s.push('order changed');
  if (pendingImages.size) s.push(n(pendingImages.size, 'photo'));
  if (!same(categories, orig.categories)) s.push('categories');
  return s;
}

function renderBar() {
  const bar = $('#bar'), dirty = isDirty();
  bar.hidden = !dirty && !publishing;
  if (dirty && !publishing) { $('#bar-text').textContent = 'Unpublished: ' + summary().join(', '); $('#bar .ad__bar-actions').hidden = false; }
  window.onbeforeunload = dirty ? () => true : null;
}

// ---------- rendering ----------
function renderAll() {
  $('#count-products').textContent = String(products.length);
  $('#count-categories').textContent = String(categories.length);
  renderChips(); renderProducts(); renderCategories(); renderBar();
}

function renderChips() {
  const counts = Object.fromEntries(categories.map((c) => [c.id, products.filter((p) => p.category === c.id).length]));
  $('#chips').innerHTML =
    `<button type="button" class="ad__chip${filterCat ? '' : ' is-on'}" data-cat="">All <b>${products.length}</b></button>` +
    categories.map((c) => `<button type="button" class="ad__chip${filterCat === c.id ? ' is-on' : ''}" data-cat="${esc(c.id)}">${icon(c.icon)}${esc(c.label.en)} <b>${counts[c.id] ?? 0}</b></button>`).join('');
}
$('#chips').addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>('[data-cat]'); if (!b) return;
  filterCat = b.dataset.cat!; renderChips(); renderProducts();
});
$('#search').addEventListener('input', (e) => { query = (e.target as HTMLInputElement).value.trim().toLowerCase(); renderProducts(); });

const visible = () => products.filter((p) => (!filterCat || p.category === filterCat) && (!query || [p.brand, p.model, p.name.en, p.name.ar, p.id, p.sku ?? ''].join(' ').toLowerCase().includes(query)));

function renderProducts() {
  const list = visible();
  const catOf = (id: string) => categories.find((c) => c.id === id);
  $('#pempty').hidden = list.length > 0;
  $('#plist').innerHTML = list.map((p) => {
    const i = products.indexOf(p), st = productState(p, i), cat = catOf(p.category), src = imgSrc(p);
    const vi = list.indexOf(p);
    return `<li class="ad__item${st ? ` is-${st}` : ''}" data-id="${esc(p.id)}">
      <button type="button" class="ad__item-main" data-edit>
        <span class="ad__thumb">${src ? `<img src="${esc(src)}" alt="" loading="lazy">` : icon(cat?.icon ?? 'layers')}</span>
        <span class="ad__item-text">
          <span class="ad__item-name">${p.featured ? '<i class="ad__star" title="Featured">★</i>' : ''}${esc(p.name.en)}${st ? `<em class="ad__badge">${st}</em>` : ''}</span>
          <span class="ad__item-meta">${esc(cat?.label.en ?? p.category)} · ${esc(p.brand)} ${esc(p.model)}${p.price ? ` · <bdi>${Number(p.price.amount).toLocaleString('en')} ${esc(p.price.currency)}</bdi>` : ''}</span>
        </span>
      </button>
      <span class="ad__item-actions">
        <button type="button" class="ad__ib" data-move="-1" title="Move up" ${vi === 0 ? 'disabled' : ''}>${icon('chevron')}</button>
        <button type="button" class="ad__ib" data-move="1" title="Move down" ${vi === list.length - 1 ? 'disabled' : ''}>${icon('chevron')}</button>
        <button type="button" class="ad__ib ad__ib--text" data-dup title="Duplicate">⧉</button>
      </span>
    </li>`;
  }).join('');
  const removed = removedProducts().filter((o) => (!filterCat || o.category === filterCat));
  if (removed.length) $('#plist').insertAdjacentHTML('beforeend', removed.map((o) => `<li class="ad__item is-removed" data-id="${esc(o.id)}"><span class="ad__item-main"><span class="ad__thumb">${icon(catOf(o.category)?.icon ?? 'layers')}</span><span class="ad__item-text"><span class="ad__item-name"><s>${esc(o.name.en)}</s><em class="ad__badge">removed</em></span><span class="ad__item-meta">${esc(o.brand)} ${esc(o.model)}</span></span></span><span class="ad__item-actions"><button type="button" class="ad__link" data-restore>Restore</button></span></li>`).join(''));
}

$('#plist').addEventListener('click', (e) => {
  const t = e.target as HTMLElement, li = t.closest<HTMLElement>('li[data-id]'); if (!li) return;
  const id = li.dataset.id!;
  if (t.closest('[data-edit]')) return openProduct(products.find((p) => p.id === id)!);
  const mv = t.closest<HTMLElement>('[data-move]');
  if (mv) {
    const list = visible(), p = products.find((x) => x.id === id)!, vi = list.indexOf(p), other = list[vi + Number(mv.dataset.move)];
    if (!other) return;
    const a = products.indexOf(p), b = products.indexOf(other);
    [products[a], products[b]] = [products[b], products[a]];
    renderProducts(); renderBar(); return;
  }
  if (t.closest('[data-dup]')) return duplicate(products.find((x) => x.id === id)!);
  if (t.closest('[data-restore]')) {
    const o = orig.products.find((x) => x.id === id)!;
    products.push(clone(o)); if (o.image) removedImages.delete(o.image);
    renderAll();
  }
});
function duplicate(p: Product) {
  const copy = clone(p);
  copy.id = uniqueId(p.id); copy.featured = false; delete copy.image;
  products.splice(products.indexOf(p) + 1, 0, copy);
  openProduct(copy, true);
}
const uniqueId = (want: string) => { let id = want, n = 2; while (products.some((p) => p.id === id)) id = `${want}-${n++}`; return id; };

function renderCategories() {
  const counts = Object.fromEntries(categories.map((c) => [c.id, products.filter((p) => p.category === c.id).length]));
  $('#clist').innerHTML = categories.map((c, i) => {
    const o = orig.categories.find((x) => x.id === c.id);
    const st = !o ? 'added' : !same(o, c) ? 'changed' : orig.categories.indexOf(o) !== i ? 'moved' : '';
    return `<li class="ad__item${st ? ` is-${st}` : ''}" data-id="${esc(c.id)}">
      <button type="button" class="ad__item-main" data-edit>
        <span class="ad__thumb ad__thumb--icon">${icon(c.icon)}</span>
        <span class="ad__item-text"><span class="ad__item-name">${esc(c.label.en)}${st ? `<em class="ad__badge">${st}</em>` : ''}</span><span class="ad__item-meta"><bdi lang="ar">${esc(c.label.ar)}</bdi> · ${counts[c.id]} products</span></span>
      </button>
      <span class="ad__item-actions">
        <button type="button" class="ad__ib" data-move="-1" title="Move up" ${i === 0 ? 'disabled' : ''}>${icon('chevron')}</button>
        <button type="button" class="ad__ib" data-move="1" title="Move down" ${i === categories.length - 1 ? 'disabled' : ''}>${icon('chevron')}</button>
      </span>
    </li>`;
  }).join('');
}
$('#clist').addEventListener('click', (e) => {
  const t = e.target as HTMLElement, li = t.closest<HTMLElement>('li[data-id]'); if (!li) return;
  const c = categories.find((x) => x.id === li.dataset.id)!;
  if (t.closest('[data-edit]')) return openCategory(c);
  const mv = t.closest<HTMLElement>('[data-move]');
  if (mv) {
    const a = categories.indexOf(c), b = a + Number(mv.dataset.move);
    if (b < 0 || b >= categories.length) return;
    [categories[a], categories[b]] = [categories[b], categories[a]];
    renderCategories(); renderChips(); renderBar();
  }
});

// tabs
$$('.ad__tab[data-tab]').forEach((b) => b.addEventListener('click', () => {
  tab = b.dataset.tab as typeof tab;
  $$('.ad__tab[data-tab]').forEach((x) => x.classList.toggle('is-on', x === b));
  $('#tab-products').hidden = tab !== 'products'; $('#tab-categories').hidden = tab !== 'categories';
}));

// ---------- product form ----------
const pdlg = $<HTMLDialogElement>('#pdlg'), pform = $<HTMLFormElement>('#pform');
let editing: Product | null = null, editingIsNew = false, formPhoto: PreparedImage | null | undefined; // undefined = untouched, null = removed
const field = (name: string) => pform.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
const setV = (name: string, v: unknown) => { const f = field(name); if (f.type === 'checkbox') (f as HTMLInputElement).checked = !!v; else f.value = v == null ? '' : String(v); };
const getV = (name: string) => { const f = field(name); return f.type === 'checkbox' ? (f as HTMLInputElement).checked : f.value.trim(); };

function openProduct(p: Product, isNew = false) {
  editing = p; editingIsNew = isNew; formPhoto = undefined;
  $('#pform-title').textContent = isNew ? 'New product' : 'Edit product';
  $('#pdelete').hidden = isNew; $('#pduplicate').hidden = isNew;
  field('category').innerHTML = categories.map((c) => `<option value="${esc(c.id)}">${esc(c.label.en)}</option>`).join('');
  $('#brands').innerHTML = [...new Set(products.map((x) => x.brand))].sort().map((b) => `<option value="${esc(b)}">`).join('');
  setV('brand', p.brand); setV('model', p.model); setV('category', p.category || categories[0]?.id); setV('id', p.id);
  setV('name.en', p.name.en); setV('name.ar', p.name.ar); setV('blurb.en', p.blurb.en); setV('blurb.ar', p.blurb.ar);
  setV('specs', (p.specs ?? []).join('\n')); setV('featured', p.featured);
  setV('price.amount', p.price?.amount ?? ''); setV('price.currency', p.price?.currency ?? 'EGP');
  setV('deal.en', p.deal?.label.en ?? ''); setV('deal.ar', p.deal?.label.ar ?? '');
  setV('tags', (p.tags ?? []).join(', ')); setV('sku', p.sku ?? ''); setV('datasheet', p.datasheet ?? '');
  ($('.ad__more', pform) as HTMLDetailsElement).open = !!(p.deal || p.tags?.length || p.sku || p.datasheet);
  idTouched = !isNew && !!p.id;
  renderPhoto(imgSrc(p));
  $('#perrors').hidden = true; $$('[aria-invalid]', pform).forEach((el) => el.removeAttribute('aria-invalid'));
  pdlg.showModal(); $('.ad__dlg-body', pdlg).scrollTop = 0;
}
function renderPhoto(src: string) {
  $('#photo-prev').innerHTML = src ? `<img src="${esc(src)}" alt="">` : '<span class="ad__photo-none">No photo — the category icon is shown</span>';
  $('#photo-remove').hidden = !src;
}
// auto-id from brand + model until the user edits the id by hand
let idTouched = false;
field('id').addEventListener('input', () => (idTouched = true));
for (const n of ['brand', 'model']) field(n).addEventListener('input', () => { if (!idTouched) setV('id', slugify(`${getV('brand')} ${getV('model')}`)); });

$('#photo-file').addEventListener('change', async (e) => {
  const f = (e.target as HTMLInputElement).files?.[0]; (e.target as HTMLInputElement).value = '';
  if (!f) return;
  try { formPhoto = await prepareImage(f); renderPhoto(formPhoto.dataUrl); }
  catch (err) { toast((err as Error).message, 'err'); }
});
$('#photo-remove').addEventListener('click', () => { formPhoto = null; renderPhoto(''); });

function readProductForm(): ProductInput {
  const s = (n: string) => getV(n) as string;
  const opt = (n: string) => s(n) || undefined;
  const p: Record<string, unknown> = {
    id: s('id'), category: s('category'), brand: s('brand'), model: s('model'),
    name: { en: s('name.en'), ar: s('name.ar') }, blurb: { en: s('blurb.en'), ar: s('blurb.ar') },
    specs: s('specs').split('\n').map((x) => x.trim()).filter(Boolean),
  };
  const tags = s('tags').split(',').map((x) => x.trim()).filter(Boolean); if (tags.length) p.tags = tags;
  if (getV('featured')) p.featured = true;
  if (s('deal.en') || s('deal.ar')) p.deal = { label: { en: s('deal.en'), ar: s('deal.ar') } };
  if (s('price.amount')) p.price = { amount: Number(s('price.amount')), currency: s('price.currency') || 'EGP' };
  if (opt('sku')) p.sku = s('sku');
  if (opt('datasheet')) p.datasheet = s('datasheet');
  // photo: keep, replace or drop
  const prev = editing?.image;
  if (formPhoto) p.image = `${admin.imagePrefix}/${p.id}.${formPhoto.ext}`;
  else if (formPhoto === undefined && prev) p.image = pendingImages.has(editing!.id) ? `${admin.imagePrefix}/${p.id}.${pendingImages.get(editing!.id)!.ext}` : prev;
  return p as ProductInput;
}

const labels: Record<string, string> = { id: 'ID', category: 'Category', brand: 'Brand', model: 'Model', 'name.en': 'Name (English)', 'name.ar': 'Arabic name', 'blurb.en': 'Description (English)', 'blurb.ar': 'Arabic description', specs: 'Specs', 'price.amount': 'Price', datasheet: 'Datasheet URL', image: 'Photo', 'deal.label.en': 'Deal ribbon (English)', 'deal.label.ar': 'Deal ribbon (Arabic)', 'label.en': 'Name (English)', 'label.ar': 'Arabic name', icon: 'Icon' };
function showErrors(form: HTMLFormElement, listEl: HTMLElement, issues: { path: PropertyKey[]; message: string }[]) {
  $$('[aria-invalid]', form).forEach((el) => el.removeAttribute('aria-invalid'));
  listEl.innerHTML = issues.map((i) => { const k = i.path.map(String).join('.'); const f = form.elements.namedItem(k.replace('deal.label.', 'deal.')) as HTMLElement | null; f?.setAttribute('aria-invalid', 'true'); return `<li>${esc(labels[k] ?? k)}: ${esc(i.message)}</li>`; }).join('');
  listEl.hidden = issues.length === 0;
  if (issues.length) { listEl.scrollIntoView({ block: 'nearest' }); ($$('[aria-invalid]', form)[0] as HTMLElement | undefined)?.focus(); }
}

pform.addEventListener('submit', (e) => {
  e.preventDefault();
  const raw = readProductForm();
  const r = productSchema().safeParse(raw);
  const issues = r.success ? [] : r.error.issues.map((i) => ({ path: i.path, message: i.message }));
  if (r.success && products.some((x) => x !== editing && x.id === r.data.id)) issues.push({ path: ['id'], message: 'another product already uses this ID' });
  if (issues.length) return showErrors(pform, $('#perrors'), issues);
  const data = r.data! as unknown as Product;
  if (!data.featured) delete (data as any).featured;
  if (!data.specs?.length) delete (data as any).specs;
  const oldId = editing!.id;
  // photo bookkeeping
  if (formPhoto) { pendingImages.delete(oldId); pendingImages.set(data.id, formPhoto); }
  else if (formPhoto === null) { pendingImages.delete(oldId); }
  else if (pendingImages.has(oldId) && oldId !== data.id) { pendingImages.set(data.id, pendingImages.get(oldId)!); pendingImages.delete(oldId); }
  const committedImage = orig.products.find((o) => o.id === oldId)?.image;
  if (committedImage && committedImage !== data.image) removedImages.add(committedImage); else if (committedImage) removedImages.delete(committedImage);
  Object.keys(editing!).forEach((k) => delete (editing as any)[k]); Object.assign(editing!, data);
  editing = null; pdlg.close(); renderAll();
});
$('#pduplicate').addEventListener('click', () => { const p = editing!; editing = null; pdlg.close(); duplicate(p); });
$('#pdelete').addEventListener('click', async () => {
  if (!editing || !(await confirm(`Delete "${editing.name.en}" from the catalogue?`, 'Delete'))) return;
  const p = editing; products.splice(products.indexOf(p), 1);
  pendingImages.delete(p.id);
  const committedImage = orig.products.find((o) => o.id === p.id)?.image; if (committedImage) removedImages.add(committedImage);
  editing = null; pdlg.close(); renderAll();
});
pdlg.addEventListener('close', () => { if (editingIsNew && editing) { products.splice(products.indexOf(editing), 1); renderAll(); } editing = null; editingIsNew = false; });
$('#add-product').addEventListener('click', () => {
  const p: Product = { id: '', category: filterCat || categories[0]?.id || '', brand: '', model: '', name: { en: '', ar: '' }, blurb: { en: '', ar: '' }, specs: [] };
  products.push(p); openProduct(p, true);
});

// ---------- category form ----------
const cdlg = $<HTMLDialogElement>('#cdlg'), cform = $<HTMLFormElement>('#cform');
let cediting: Category | null = null, cIsNew = false, cIdTouched = false;
const cf = (n: string) => cform.elements.namedItem(n) as HTMLInputElement | HTMLSelectElement;
const iconPrev = () => ($('#icon-prev').innerHTML = icon(cf('icon').value));
cf('icon').addEventListener('change', iconPrev);
cf('id').addEventListener('input', () => (cIdTouched = true));
cf('label.en').addEventListener('input', () => { if (!cIdTouched) cf('id').value = slugify(cf('label.en').value); });
function openCategory(c: Category, isNew = false) {
  cediting = c; cIsNew = isNew; cIdTouched = !isNew;
  $('#cform-title').textContent = isNew ? 'New category' : 'Edit category';
  const used = products.filter((p) => p.category === c.id).length;
  const del = $<HTMLButtonElement>('#cdelete'); del.hidden = isNew; del.disabled = used > 0; del.title = used ? `${used} products use this category` : '';
  cf('label.en').value = c.label.en; cf('label.ar').value = c.label.ar; cf('icon').value = c.icon || 'layers'; cf('id').value = c.id; iconPrev();
  $('#cerrors').hidden = true; cdlg.showModal();
}
cform.addEventListener('submit', (e) => {
  e.preventDefault();
  const raw = { id: cf('id').value.trim(), icon: cf('icon').value, label: { en: cf('label.en').value.trim(), ar: cf('label.ar').value.trim() } };
  const r = categorySchema.safeParse(raw);
  const issues = r.success ? [] : r.error.issues.map((i) => ({ path: i.path, message: i.message }));
  if (r.success && categories.some((x) => x !== cediting && x.id === r.data.id)) issues.push({ path: ['id'], message: 'another category already uses this ID' });
  if (issues.length) return showErrors(cform, $('#cerrors'), issues);
  const oldId = cediting!.id;
  if (oldId && oldId !== r.data!.id) products.forEach((p) => { if (p.category === oldId) p.category = r.data!.id; });
  Object.assign(cediting!, r.data);
  cediting = null; cdlg.close(); renderAll();
});
$('#cdelete').addEventListener('click', async () => {
  if (!cediting || !(await confirm(`Delete category "${cediting.label.en}"?`, 'Delete'))) return;
  categories.splice(categories.indexOf(cediting), 1); cediting = null; cdlg.close(); renderAll();
});
cdlg.addEventListener('close', () => { if (cIsNew && cediting) { categories.splice(categories.indexOf(cediting), 1); renderAll(); } cediting = null; cIsNew = false; });
$('#add-category').addEventListener('click', () => { const c: Category = { id: '', icon: 'layers', label: { en: '', ar: '' } }; categories.push(c); openCategory(c, true); });

// ---------- publish ----------
const serialize = (arr: unknown[]) => `[\n${arr.map((x) => '  ' + JSON.stringify(x)).join(',\n')}\n]\n`;
const ORDER = ['id', 'category', 'brand', 'model', 'featured', 'name', 'blurb', 'specs', 'tags', 'deal', 'image', 'sku', 'price', 'datasheet'];
const ordered = (p: Product) => Object.fromEntries(ORDER.filter((k) => (p as any)[k] !== undefined).map((k) => [k, (p as any)[k]]));

$('#discard').addEventListener('click', async () => {
  if (!(await confirm('Throw away all unpublished changes?', 'Discard'))) return;
  products = clone(orig.products); categories = clone(orig.categories); pendingImages.clear(); removedImages.clear(); renderAll();
});

$('#publish').addEventListener('click', async () => {
  if (publishing || !isDirty()) return;
  // final validation of everything that goes out
  const schema = productSchema();
  for (const p of products) { const r = schema.safeParse(p); if (!r.success) { toast(`"${p.name.en || p.id}" has a problem: ${r.error.issues[0].message}`, 'err', 6000); return openProduct(p); } }
  for (const c of categories) { const r = categorySchema.safeParse(c); if (!r.success) { toast(`Category "${c.label.en || c.id}": ${r.error.issues[0].message}`, 'err', 6000); return openCategory(c); } }
  publishing = true;
  const btn = $<HTMLButtonElement>('#publish'), text = $('#bar-text');
  btn.disabled = true; $('#discard').hidden = true; text.textContent = 'Publishing…';
  try {
    // someone else published since we loaded?
    const [ps, cs] = await Promise.all([gh.fileSha(admin.paths.products), gh.fileSha(admin.paths.categories)]);
    if (ps !== orig.productsSha || cs !== orig.categoriesSha) throw new Error('The catalogue changed on GitHub since you loaded it. Reload, then redo your changes.');
    const changes: FileChange[] = [];
    if (!same(products, orig.products)) changes.push({ path: admin.paths.products, text: serialize(products.map(ordered)) });
    if (!same(categories, orig.categories)) changes.push({ path: admin.paths.categories, text: serialize(categories) });
    for (const [id, img] of pendingImages) { const p = products.find((x) => x.id === id); if (p?.image) changes.push({ path: `${admin.paths.images}/${p.image.slice(admin.imagePrefix.length + 1)}`, base64: img.base64 }); }
    const stillUsed = new Set(products.map((p) => p.image).filter(Boolean));
    for (const path of removedImages) if (!stillUsed.has(path)) changes.push({ path: `${admin.paths.images}/${path.slice(admin.imagePrefix.length + 1)}`, remove: true });
    const msg = `Admin: ${summary().join(', ')}`;
    const { sha, blobs } = await gh.commit(msg, changes);
    // now the repo matches what we have
    orig = { products: clone(products), categories: clone(categories), productsSha: blobs[admin.paths.products] ?? orig.productsSha, categoriesSha: blobs[admin.paths.categories] ?? orig.categoriesSha };
    pendingImages.clear(); removedImages.clear();
    // pending photos are now served from the site (after deploy); until then the list shows the icon
    renderAll();
    toast('Published. The website updates in about two minutes.', 'ok', 6000);
    text.textContent = 'Published · waiting for the website to rebuild…'; $('#bar').hidden = false;
    await watchDeploy(sha);
  } catch (e) {
    toast(e instanceof Error ? e.message : String(e), 'err', 8000);
    publishing = false; btn.disabled = false; $('#discard').hidden = false; renderBar();
  }
});

async function watchDeploy(sha: string) {
  const text = $('#bar-text'), started = Date.now();
  let seen = false;
  while (Date.now() - started < 6 * 60_000) {
    await new Promise((r) => setTimeout(r, 8000));
    const st = await gh.deployStatus(sha);
    if (st !== 'queued') seen = true;
    // no Actions permission, or no workflow run showed up (e.g. a branch that does not deploy)
    if (st === 'unknown' || (!seen && Date.now() - started > 90_000)) { text.textContent = 'Published · the website updates in about two minutes.'; break; }
    if (st === 'success') { text.innerHTML = `Live on the website ${icon('check')}`; break; }
    if (st === 'failure') { text.textContent = 'Published, but the website build failed. Tell Yassin.'; break; }
    text.textContent = st === 'running' ? 'Published · website is rebuilding…' : 'Published · waiting for the website to rebuild…';
  }
  publishing = false; $<HTMLButtonElement>('#publish').disabled = false; $('#discard').hidden = false;
  setTimeout(renderBar, 4000);
}

boot();
