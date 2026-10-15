// timeline.js: the shot list, standalone loops, and a brush-wipe transition.
//
// shots([[t0, fn], [t1, fn], ...]) registers shots in time order. Each fn(t, lt, dur) is called with t = video time,
// lt = time since the shot started, dur = the shot's length. It paints the WHOLE frame, background included, and must be
// a pure function of t: frames render in parallel and out of order, so nothing may carry over from one frame to the next.

const SHOTS = [];
function shots(list) { SHOTS.push(...list); SHOTS.sort((a, b) => a[0] - b[0]); }

// Standalone loops (model sheets, GIFs, tests), outside the main timeline: window.LOOP = LOOPS[name] swaps the whole
// frame for that function, called with loop time. Give each a length: LOOPS.x = t => { ... }; LOOPS.x.len = 4;
const LOOPS = {};

// Soft dissolve at every seam: for XFADE s after a cut the outgoing shot keeps running underneath and fades out over
// the incoming one (capped at 40% of either shot). XFADE_AT = { [t0]: s } sets one seam (0 = a hard cut).
const XFADE = .55, XFADE_AT = {};
let xfC = null, XF_A = 0;                 // the outgoing shot's frame and its opacity, laid over the frame in composite()
let NOW_T = 0;                                          // the video time being drawn (dialog.js lip-sync reads it)
function drawWorld(t) {
  XF_A = 0; NOW_T = t;
  if (window.LOOP) window.LOOP(t);
  else if (!SHOTS.length) placeholder(t);
  else {
    let i = 0; while (i + 1 < SHOTS.length && t >= SHOTS[i + 1][0]) i++;
    const t0 = SHOTS[i][0], end = i + 1 < SHOTS.length ? SHOTS[i + 1][0] : DUR;
    const p = i > 0 ? SHOTS[i - 1] : null, at = XFADE_AT[t0.toFixed(2)];
    const d = p ? Math.min(at ?? XFADE, .4 * (t0 - p[0]), .4 * (end - t0)) : 0;
    if (d > 0 && t - t0 < d) {
      p[1](t, t - p[0], t0 - p[0]); CAM = null; flushLetters(); flushBrush();
      if (!xfC) { xfC = document.createElement('canvas'); xfC.width = W; xfC.height = H; }
      const c = xfC.getContext('2d'); c.fillStyle = PAL.paper; c.fillRect(0, 0, W, H); c.drawImage(drawingContext.canvas, 0, 0, W, H);
      XF_A = 1 - ease((t - t0) / d);
      image(paperG, 0, 0);
    }
    HEADS = {};                                         // titles.js: only the heads of the shot on screen
    SHOTS[i][1](t, t - t0, end - t0);
    CAM = null;
    if (typeof subs === 'function') subs(t);
  }
  flushLetters();
}

function placeholder(t) {
  paint(ellPts(960, 520, 520, 300, 30, 20), { fill: PAL.sky, fillOp: 90, bleed: .3, ink: null });
  clawd(960, 820, 20, feel('happy', t));
}

// ---------- brush wipe ----------
// A transition: fat paint strokes sweep across to cover the frame (p 0 → .5), then drag off (p .5 → 1).
// Cut to the next shot at p = .5, under full cover. Call it last in both shots, in screen space (outside a camera):
//   end of shot A:   if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6);
//   start of shot B: if (lt < .3) brushWipe(.5 + lt / .6);
function brushWipe(p, cols = [PAL.clayDk, PAL.clay]) {
  if (p <= 0 || p >= 1) return;
  const [c1, c2] = cols, n = 5, bh = (H + 420) / n + 40;
  push(); translate(W / 2, H / 2); rotate(-.1); translate(-W / 2, -H / 2);
  for (let i = 0; i < n; i++) {
    const y0 = -230 + i * (H + 420) / n, d = [0, .14, .06, .18, .1][i];
    const q = p < .5 ? easeOut(clamp((p * 2 - d) / (1 - d))) : ease(clamp(((p - .5) * 2 - d) / (1 - d)));
    const x0 = p < .5 ? -300 : lerp(-300, W + 400, q), x1 = p < .5 ? lerp(-300, W + 400, q) : W + 400;
    if (x1 - x0 < 30) continue;
    const pts = [], rag = k => 40 + 50 * hash(i * 31 + k) + jit(12);
    for (let k = 0; k <= 8; k++) pts.push([lerp(x0, x1, k / 8), y0 + Math.sin(k * .9 + i) * 14 + jit(5)]);
    for (let k = 1; k < 9; k++) pts.push([x1 + rag(k) - 40, y0 + bh * k / 9]);
    for (let k = 8; k >= 0; k--) pts.push([lerp(x0, x1, k / 8), y0 + bh + Math.sin(k * .8 + i * 2) * 14 + jit(5)]);
    if (p >= .5) for (let k = 8; k > 0; k--) pts.push([x0 - rag(k + 20) + 40, y0 + bh * k / 9]);
    paint(pts, { wash: i % 2 ? c1 : c2, washOp: 255, fill: i % 2 ? c2 : c1, fillOp: 70, bleed: .05, tex: .8, border: .6, ink: null,
      hatch: { d: 44, a: 0, o: { rand: .6, gradient: .5 }, b: 'charcoal', c: i % 2 ? c2 : PAL.cream, w: .8 } });
  }
  pop();
}
