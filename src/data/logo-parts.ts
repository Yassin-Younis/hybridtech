// Splits the wordmark SVG into animatable parts at build time.
// Each subpath is made absolute, holes (node dots, counters of O/G) are merged back into the
// smallest shape that contains them, and every part is tagged with its row and horizontal position.
import raw from '../../public/brand/logo-white.svg?raw';

type Sub = { d: string; x0: number; x1: number; y0: number; y1: number; parent?: Sub; kids: Sub[] };
type Raw = { d: string; pts: number[][] };
export type LogoPart = { d: string; row: 'mark' | 'word' | 'tag'; x: number };

const ARGS: Record<string, number> = { m: 2, l: 2, h: 1, v: 1, c: 6, s: 4, q: 4, t: 2, a: 7, z: 0 };

function subpaths(d: string): Sub[] {
  const t = d.match(/[a-zA-Z]|-?(?:\d+\.?\d*|\.\d+)(?:e-?\d+)?/g) ?? [];
  const subs: Raw[] = [];
  let i = 0, cx = 0, cy = 0, sx = 0, sy = 0, cmd = '';
  let cur: Raw | null = null;
  while (i < t.length) {
    if (/[a-zA-Z]/.test(t[i])) cmd = t[i++];
    const lc = cmd.toLowerCase(), rel = cmd === lc, n = ARGS[lc];
    if (lc === 'z') { cur!.d += 'Z'; cx = sx; cy = sy; continue; }
    const a = t.slice(i, i + n).map(Number);
    i += n;
    if (lc === 'm') {
      cx = sx = (rel ? cx : 0) + a[0];
      cy = sy = (rel ? cy : 0) + a[1];
      cur = { d: `M${+cx.toFixed(3)} ${+cy.toFixed(3)}`, pts: [[cx, cy]] };
      subs.push(cur);
      cmd = rel ? 'l' : 'L';
      continue;
    }
    cur!.d += cmd + a.join(' ');
    if (lc === 'h') cx = rel ? cx + a[0] : a[0];
    else if (lc === 'v') cy = rel ? cy + a[0] : a[0];
    else if (lc === 'a') { cx = (rel ? cx : 0) + a[5]; cy = (rel ? cy : 0) + a[6]; }
    else {
      for (let k = 0; k < n; k += 2) cur!.pts.push([(rel ? cx : 0) + a[k], (rel ? cy : 0) + a[k + 1]]);
      [cx, cy] = cur!.pts[cur!.pts.length - 1];
      continue;
    }
    cur!.pts.push([cx, cy]);
  }
  return subs.map((s) => {
    const xs = s.pts.map((p) => p[0]), ys = s.pts.map((p) => p[1]);
    return { d: s.d, x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys), kids: [] };
  });
}

export const logoViewBox = raw.match(/viewBox="([^"]+)"/)?.[1] ?? '0 0 1 1';
const [vx, , vw] = logoViewBox.split(' ').map(Number);

const all = Array.from(raw.matchAll(/ d="([^"]+)"/g)).flatMap((m) => subpaths(m[1]));
const area = (s: Sub) => (s.x1 - s.x0) * (s.y1 - s.y0);
const inside = (a: Sub, b: Sub) => a !== b && a.x0 >= b.x0 && a.x1 <= b.x1 && a.y0 >= b.y0 && a.y1 <= b.y1;
for (const s of all) {
  s.parent = all.filter((o) => inside(s, o)).sort((p, q) => area(p) - area(q))[0];
  s.parent?.kids.push(s);
}
const flatten = (s: Sub): string => s.d + s.kids.map(flatten).join('');
const MARK_EDGE = vx + 22.5;

export const logoParts: LogoPart[] = all
  .filter((s) => !s.parent)
  .map((s) => ({ d: flatten(s), row: s.y0 > 50 ? 'tag' : s.x1 < MARK_EDGE ? 'mark' : 'word', x: +((s.x0 - vx) / vw).toFixed(3) }) as LogoPart)
  .sort((a, b) => a.x - b.x);

// Circuit nodes: the small round holes inside the traces, used as spark origins.
export const logoNodes = all
  .filter((s) => s.parent && s.y0 < 50 && s.x1 - s.x0 < 3 && Math.abs(s.x1 - s.x0 - (s.y1 - s.y0)) < 0.5)
  .map((s) => ({ cx: +((s.x0 + s.x1) / 2).toFixed(2), cy: +((s.y0 + s.y1) / 2).toFixed(2), x: +((s.x0 - vx) / vw).toFixed(3) }));
