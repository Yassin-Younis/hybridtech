// Canvas renderer for the hero's live circuit board (CircuitLayer `flow`).
// It reproduces the SVG + CSS animation of the board frame by frame inside a worker
// (circuit-worker.ts, OffscreenCanvas): animating ~130 SVG elements with CSS
// (stroke-dashoffset, per-element transforms) restyled and repainted the whole board and re-layerized
// the page on every frame. Every value below mirrors the CSS it replaces in CircuitLayer.astro /
// motion.css (durations, delays, easings, colours, opacities, SVG paint order), so the result is the
// same picture.
import { circuit } from '../data/circuit';

type Ctx = OffscreenCanvasRenderingContext2D;

// CSS cubic-bezier() timing function.
function bezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sy = (t: number) => ((ay * t + by) * t + cy) * t;
  const dx = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const e = sx(t) - x, d = dx(t);
      if (Math.abs(e) < 1e-7) return sy(t);
      if (Math.abs(d) < 1e-6) break;
      t -= e / d;
    }
    let lo = 0, hi = 1;
    t = x;
    for (let i = 0; i < 30; i++) {
      const v = sx(t);
      if (Math.abs(v - x) < 1e-7) break;
      if (v < x) lo = t; else hi = t;
      t = (lo + hi) / 2;
    }
    return sy(t);
  };
}
const easeInOut = bezier(0.42, 0, 0.58, 1);
const easeOutCss = bezier(0, 0, 0.58, 1);
const easeOutToken = bezier(0.22, 1, 0.36, 1); // --ease-out
const currentEase = bezier(0.45, 0, 0.55, 1);

const COLOR = '#8fd3f4';
const ORANGE = '#f1511b';
// Deterministic per-trace timing, identical to the values CircuitLayer.astro used to print inline.
const rand = (i: number) => { const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };
const fixed = (v: number) => +v.toFixed(2);

const polylines = circuit.paths.map((d) => {
  const nums = d.match(/-?\d+(?:\.\d+)?/g)!.map(Number);
  const pts: [number, number][] = [];
  for (let i = 0; i < nums.length; i += 2) pts.push([nums[i], nums[i + 1]]);
  let len = 0;
  for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return { pts, len };
});

export function createCircuitRenderer(canvas: OffscreenCanvas) {
  const ctx = canvas.getContext('2d', { alpha: true }) as Ctx;
  // The board's base group has `opacity: 0.14`, so it is composed on its own layer first
  // (overlapping traces, nodes and pads must not add up) and then blended once.
  const layerCanvas = new OffscreenCanvas(1, 1);
  const layer = layerCanvas.getContext('2d') as Ctx;

  const toPath = (pts: [number, number][]) => { const p = new Path2D(); pts.forEach(([x, y], i) => (i ? p.lineTo(x, y) : p.moveTo(x, y))); return p; };
  const traces = polylines.map((l, i) => {
    const n = i + 1; // :nth-child() index inside .circuit__base
    return { path: toPath(l.pts), len: l.len, delay: n % 3 === 0 ? 0.8 : n % 2 === 0 ? 0.4 : 0 };
  });
  const circle = (x: number, y: number, r: number) => { const p = new Path2D(); p.arc(x, y, r, 0, Math.PI * 2); return p; };
  const nodes = circuit.nodes.map(([x, y], i) => {
    const n = circuit.paths.length + i + 1;
    return { x, y, delay: n % 3 === 0 ? -2.2 : n % 2 === 0 ? -1.1 : 0 };
  });
  const rings = circuit.nodes.map(([x, y]) => circle(x, y, 13));
  const pads = circuit.pads.map(([cx, cy]) => {
    const x = cx - 9, y = cy - 9, w = 18, r = 3, p = new Path2D();
    p.moveTo(x + r, y); p.lineTo(x + w - r, y); p.arcTo(x + w, y, x + w, y + r, r);
    p.lineTo(x + w, y + w - r); p.arcTo(x + w, y + w, x + w - r, y + w, r);
    p.lineTo(x + r, y + w); p.arcTo(x, y + w, x, y + w - r, r);
    p.lineTo(x, y + r); p.arcTo(x, y, x + r, y, r); p.closePath();
    return p;
  });
  const pulses = polylines.map((l, i) => {
    const hot = rand(i + 11) > 0.72;
    return { path: traces[i].path, len: l.len, dur: fixed(3.2 + rand(i) * 4.2), delay: fixed(-rand(i + 7) * 7), rev: rand(i + 3) > 0.55, hot, dash: hot ? 0.05 : 0.09, from: hot ? 0.06 : 0.1 };
  });
  const pings = circuit.nodes.map(([x, y], i) => ({ x, y, delay: fixed(-rand(i + 21) * 5), dur: fixed(3.5 + rand(i + 31) * 3) }));

  let W = 0, H = 0;
  const resize = (w: number, h: number) => {
    if (w === W && h === H) return;
    W = canvas.width = layerCanvas.width = w;
    H = canvas.height = layerCanvas.height = h;
  };

  // `t` is the animation clock in seconds (it only advances while the board is running);
  // CSS animations with a negative delay start that far into their cycle.
  const phase = (t: number, dur: number, delay: number) => { const v = ((t - delay) % dur) / dur; return v < 0 ? v + 1 : v; };

  const draw = (t: number) => {
    if (!W || !H) return;
    const kx = W / circuit.w, ky = H / circuit.h;
    // boardDrift: 26s ease-in-out infinite alternate, translate 0 0 -> -40 18 (user units).
    const it = Math.floor(t / 26), dp = t / 26 - it;
    const drift = easeInOut(it % 2 ? 1 - dp : dp);
    const ox = -40 * drift, oy = 18 * drift;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, W, H);

    // Base group: traces (draw-in), nodes (pulse), rings, pads, in SVG paint order.
    layer.setTransform(1, 0, 0, 1, 0, 0);
    layer.clearRect(0, 0, W, H);
    layer.setTransform(kx, 0, 0, ky, ox * kx, oy * ky);
    layer.strokeStyle = COLOR; layer.fillStyle = COLOR;
    layer.lineWidth = 2; layer.lineJoin = 'round'; layer.lineCap = 'round';
    layer.globalAlpha = 1;
    for (const tr of traces) {
      // draw: 3s var(--ease-out), dasharray 1 2, dashoffset 1.01 -> 0 (pathLength 1).
      const p = easeOutToken((t - tr.delay) / 3);
      if (p <= 0) continue;
      if (p < 1) { layer.setLineDash([tr.len, 2 * tr.len]); layer.lineDashOffset = 1.01 * (1 - p) * tr.len; }
      else layer.setLineDash([]);
      layer.stroke(tr.path);
    }
    layer.setLineDash([]);
    for (const n of nodes) {
      // pulse: 3.2s ease-in-out infinite; 0%/100% opacity .35 scale 1, 50% opacity 1 scale 1.5.
      const ph = phase(t, 3.2, n.delay);
      const e = easeInOut(ph < 0.5 ? ph * 2 : (ph - 0.5) * 2);
      const k = ph < 0.5 ? e : 1 - e;
      layer.globalAlpha = 0.35 + 0.65 * k;
      layer.beginPath();
      layer.arc(n.x, n.y, 7 * (1 + 0.5 * k), 0, Math.PI * 2);
      layer.fill();
    }
    layer.globalAlpha = 1;
    for (const r of rings) layer.stroke(r);
    for (const p of pads) layer.stroke(p);
    ctx.globalAlpha = 0.14;
    ctx.drawImage(layerCanvas, 0, 0);

    // Flow group: current pulses, then node pings.
    ctx.setTransform(kx, 0, 0, ky, ox * kx, oy * ky);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    for (const pu of pulses) {
      // current: dashoffset from -> -1.01, cubic-bezier(.45,0,.55,1), reversed for .is-rev.
      const ph = phase(t, pu.dur, pu.delay);
      const off = pu.from + (-1.01 - pu.from) * currentEase(pu.rev ? 1 - ph : ph);
      ctx.setLineDash([pu.dash * pu.len, 2 * pu.len]);
      ctx.lineDashOffset = off * pu.len;
      ctx.globalAlpha = pu.hot ? 0.28 : 0.18; ctx.strokeStyle = pu.hot ? ORANGE : '#38b6ff'; ctx.lineWidth = 12;
      ctx.stroke(pu.path);
      ctx.globalAlpha = 0.85; ctx.strokeStyle = pu.hot ? '#ffc2a8' : '#d9f3ff'; ctx.lineWidth = 2.6;
      ctx.stroke(pu.path);
    }
    ctx.setLineDash([]);
    ctx.strokeStyle = COLOR;
    for (const pg of pings) {
      // ping: ease-out per keyframe; 0-62% hidden at scale .6, 70% opacity .7, 100% opacity 0 scale 2.4.
      const ph = phase(t, pg.dur, pg.delay);
      if (ph <= 0.62) continue;
      const a = ph < 0.7 ? 0.7 * easeOutCss((ph - 0.62) / 0.08) : 0.7 * (1 - easeOutCss((ph - 0.7) / 0.3));
      if (a <= 0) continue;
      const s = 0.6 + 1.8 * easeOutCss((ph - 0.62) / 0.38);
      ctx.globalAlpha = a;
      ctx.lineWidth = 2 * s;
      ctx.beginPath();
      ctx.arc(pg.x, pg.y, 13 * s, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  };

  return { resize, draw };
}
