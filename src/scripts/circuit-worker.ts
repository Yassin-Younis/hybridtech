// Draws the hero circuit board on an OffscreenCanvas so its animation never touches the main thread.
// Messages from circuit-flow.ts: init (canvas), size, run (on/off), tick (only when this worker
// has no requestAnimationFrame of its own and the page drives the frames).
import { createCircuitRenderer } from './circuit-render';

type Msg =
  | { type: 'init'; canvas: OffscreenCanvas; w: number; h: number }
  | { type: 'size'; w: number; h: number }
  | { type: 'run'; on: boolean }
  | { type: 'tick'; now: number };

const scope = self as unknown as DedicatedWorkerGlobalScope;
const hasRaf = typeof scope.requestAnimationFrame === 'function';
let renderer: ReturnType<typeof createCircuitRenderer> | null = null;
let running = false, raf = 0, last = -1, clock = 0, drawn = false;

const frame = (now: number) => {
  raf = 0;
  if (!renderer || !running) return;
  // The clock only advances while running (like a paused CSS animation) and never jumps more
  // than a few frames after the page was throttled.
  if (last >= 0) clock += Math.min(now - last, 100) / 1000;
  last = now;
  renderer.draw(clock);
  if (hasRaf) raf = scope.requestAnimationFrame(frame);
};

const paintStill = () => {
  if (!renderer) return;
  renderer.draw(clock);
  if (!drawn) { drawn = true; scope.postMessage({ type: 'drawn' }); }
};

scope.onmessage = (e: MessageEvent<Msg>) => {
  const m = e.data;
  if (m.type === 'init') {
    renderer = createCircuitRenderer(m.canvas);
    renderer.resize(m.w, m.h);
    paintStill();
    scope.postMessage({ type: 'ready', raf: hasRaf });
  } else if (m.type === 'size') {
    // Resizing clears the bitmap; repaint in the same task so no empty frame is committed.
    renderer?.resize(m.w, m.h);
    paintStill();
  } else if (m.type === 'run') {
    if (m.on === running) return;
    running = m.on;
    last = -1;
    if (running && hasRaf && !raf) raf = scope.requestAnimationFrame(frame);
    if (!running && raf) { scope.cancelAnimationFrame(raf); raf = 0; }
  } else if (m.type === 'tick') {
    frame(m.now);
  }
};
