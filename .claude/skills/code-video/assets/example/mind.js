// mind.js: the Mind, a teal constellation with no fixed body. Its pieces: dots (stars with a soft teal halo), threads
// (fine teal ink between dots) and eyes (an almond of thread with a bright iris). Every form below is built from them.

// one star of the Mind. k 0..1 = how lit (pops in with backOut when it grows from 0).
function mdot(x, y, r, k = 1, key = '') {
  if (k <= .01) return;
  const s = backOut(clamp(k));
  glow(x, y, r * 5 * s, ST.tealGlow, .55 * clamp(k * 1.5));
  boilSeed('md' + key);
  paint(starPts(x, y, r * 1.4 * s, .42, 4, Math.PI / 4 * hash(r)), { wash: ST.tealLt, ink: null });
}
// a thread from a to b, drawn k 0..1 of the way (it grows like a crack of light). sag bows it.
function mthread(a, b, k = 1, sw = .5, key = '', sag = 0) {
  if (k <= .01) return;
  const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + sag], P = through([a, m, b], 4), n = Math.max(2, Math.round(P.length * clamp(k)));
  boilSeed('mt' + key);
  inkLine(P.slice(0, n), sw, ST.teal, 'inkfine', .5);
}
// an eye: open 0..1 (lids part), look [dx, dy]. Used by the mask, the serpent and the sky.
function meye(x, y, r, open = 1, look = [0, 0], key = '') {
  const o = clamp(open); if (o <= .02) { inkLine([[x - r, y], [x + r, y]], r / 60, ST.teal, 'inkfine', 0); return; }
  boilSeed('me' + key);
  const top = [], bot = [];
  for (let i = 0; i <= 8; i++) { const s = i / 8 * 2 - 1, h = (1 - s * s) * r * .55 * o; top.push([x + s * r, y - h]); bot.push([x + s * r, y + h]); }
  glow(x + look[0] * r * .3, y + look[1] * r * .2, r * 1.6 * o, ST.tealGlow, .7 * o);
  paint(top.concat(bot.slice(1, -1).reverse()), { wash: mixCol(ST.night, ST.tealDk, .6), ink: ST.teal, sw: clamp(r / 50, .3, 1.2) });
  const ir = r * .32 * Math.min(1, o * 1.4);
  paint(ellPts(x + look[0] * r * .3, y + look[1] * r * .2, ir, ir, 14), { wash: ST.tealLt, ink: null });
  paint(ellPts(x + look[0] * r * .34, y + look[1] * r * .22, ir * .42, ir * .42, 10), { wash: ST.night, ink: null });
}

// ---------- forms ----------
// Constellation web: n stars scattered in an ellipse, each linked to its 2 nearest. grow 0..1 lights them in order
// (stars appear on a beat grid when beatLock is on). Returns the star positions for other things to hook onto.
function mindWebPts(cx, cy, rx, ry, n, seed = 1) {
  const P = [];
  for (let i = 0; i < n; i++) { const a = hash(i * 9.1 + seed) * TAU, r = Math.sqrt(hash(i * 4.3 + seed * 2)); P.push([cx + Math.cos(a) * rx * r, cy + Math.sin(a) * ry * r]); }
  return P;
}
function mindWeb(P, t, grow = 1, o = {}) {
  const n = P.length, lit = i => clamp((grow * (n + 2) - i) / 2), breathe = 1 + .03 * Math.sin(t * 1.3);
  const cx = o.cx ?? W / 2, cy = o.cy ?? H / 2, Q = P.map(([x, y]) => [cx + (x - cx) * breathe, cy + (y - cy) * breathe]);
  for (let i = 0; i < n; i++) {
    const d = Q.map((q, j) => [Math.hypot(q[0] - Q[i][0], q[1] - Q[i][1]), j]).filter(e => e[1] !== i).sort((a, b) => a[0] - b[0]);
    for (const [, j] of d.slice(0, o.links ?? 2)) if (j > i || d.length < 3) mthread(Q[i], Q[j], Math.min(lit(i), lit(j)), o.sw ?? .45, i + '-' + j);
  }
  const pk = o.pulse ?? 0;
  for (let i = 0; i < n; i++) mdot(Q[i][0], Q[i][1], (o.r ?? 4) * (1 + pk * .5 * hash(i)), lit(i), 'w' + i);
  return Q;
}

// The cat (Act 8): a curled cat traced as a constellation, facing right. s = body length in px. k 0..1 traces it in.
// Outline runs tail-tip, back, neck, ears, face, chest, belly; the tail then wraps round the front.
const CAT = [[-.48, .16], [-.46, -.04], [-.34, -.18], [-.12, -.25], [.1, -.22], [.24, -.16],
  [.27, -.3], [.31, -.44], [.39, -.33], [.47, -.45], [.5, -.3], [.55, -.18], [.5, -.06], [.36, .02],
  [.28, .14], [.05, .19], [-.24, .2], [-.48, .16], [-.36, .3], [-.05, .34], [.24, .3], [.38, .22]];
function mindCat(x, y, s, t, k = 1) {
  const b = 1 + .03 * Math.sin(t * TAU * .35), n = CAT.length, P = CAT.map(([px, py]) => [x + px * s, y + py * s * b]);
  const g = i => clamp(k * (n + 1) - i);
  glow(x + .1 * s, y, s * .55, ST.tealGlow, .18 * clamp(k));
  for (let i = 0; i < n - 1; i++) mthread(P[i], P[i + 1], g(i), .5, 'c' + i);
  P.forEach((p, i) => mdot(p[0], p[1], [7, 9].includes(i) ? 3.6 : 2.2, g(i), 'c' + i));
  // shut, content eye and nose
  const e = clamp(k * (n + 1) - n);
  if (e > 0) inkLine([[x + .4 * s, y - .25 * s], [x + .44 * s, y - .22 * s], [x + .48 * s, y - .25 * s]], .6, ST.tealLt, 'inkfine', .6);
}

// The mask (Acts 3 and 9): a smiling paper mask with many eyes and threads writhing behind it. tilt for "askew", crooked 0..1 for a lopsided smile.
function mindMask(x, y, s, t, o = {}) {
  const tilt = o.tilt || 0, eyesK = o.eyes ?? 1, tk = o.tent ?? 1;   // tent 0..1: how far the tentacles reach out
  // tentacle threads behind
  for (let i = 0; i < 9 && tk > .02; i++) {
    const a = -Math.PI * .1 + i / 8 * Math.PI * 1.2 + Math.PI * .45, P = [];
    for (let k = 0; k <= 6; k++) { const r = s * (.4 + k * .16 * tk), w = Math.sin(t * 2.2 + i + k * .7) * .14 * k / 6; P.push([x + Math.cos(a + w) * r, y + Math.sin(a + w) * r * .9 + s * .1]); }
    boilSeed('tent' + i);
    paint(ribbon(P, s * .07, s * .01), { wash: mixCol(ST.night, ST.tealDk, .55), ink: ST.teal, sw: .45 });
  }
  // eyes peering around the mask
  for (let i = 0; i < 7 && tk > .02; i++) {   // tent ~0 hides the whole thing behind the mask
    const a = i / 7 * TAU + .3, r = s * (.72 + .12 * hash(i)), blink = clamp(Math.abs(Math.sin(t * .9 + i * 1.7)) * 3);
    meye(x + Math.cos(a) * r, y + Math.sin(a) * r * .8, s * (.07 + .03 * hash(i + 4)), eyesK * blink, [Math.cos(t + i) * .5, 0], 'mk' + i);
  }
  push(); translate(x, y); rotate(tilt);
  boilSeed('mask');
  const m = []; for (let i = 0; i < 30; i++) { const a = i / 30 * TAU, sq = Math.sin(a) > 0 ? .92 : 1; m.push([Math.cos(a) * s * .44, Math.sin(a) * s * .52 * sq]); }
  paint(m, { wash: ST.paper, fill: ST.paperDim, fillOp: 50, bleed: .05, tex: .5, ink: ST.ink, sw: clamp(s / 300, .5, 1.4) });
  for (const e of [-1, 1]) inkLine([[e * s * .22, -s * .06], [e * s * .14, -s * .14], [e * s * .06, -s * .06]], clamp(s / 260, .5, 1.6), ST.ink, 'ink', .7);
  const cr = o.crooked || 0; inkLine([[-s * .2, s * (.14 + .07 * cr)], [-s * .1, s * (.25 + .03 * cr)], [s * .1, s * (.25 - .02 * cr)], [s * .22, s * (.14 - .1 * cr)]], clamp(s / 260, .5, 1.6), ST.ink, 'ink', .7);
  for (const e of [-1, 1]) paint(ellPts(e * s * .27, s * .1, s * .06, s * .035, 10), { fill: ST.ember, fillOp: 110, ink: null });
  pop();
}

// Serpent (Act 6): a long ink body along path P (tail first, head last) studded with stars, with a teal eye.
function mindSerpent(P, t, eye = 1, grow = 1, w = 60) {
  const C = through(P, 6), n = C.length, m = Math.max(3, Math.round(n * clamp(grow))), B = C.slice(0, m);
  boilSeed('serpB');
  paint(ribbon(B, w * .08, w * m / n), { wash: mixCol(ST.night, ST.tealDk, .45), fill: ST.ink, fillOp: 60, bleed: .03, ink: ST.teal, sw: .7 });
  for (let i = 2; i < m; i += 2) {   // scale threads across the back
    const a = B[i - 1], c = B[i], dx = c[0] - a[0], dy = c[1] - a[1], L = Math.hypot(dx, dy) || 1, hw = w * i / n * .42;
    mthread([c[0] - dy / L * hw, c[1] + dx / L * hw], [c[0] + dy / L * hw, c[1] - dx / L * hw], 1, .35, 'ss' + i, hw * .3);
  }
  for (let i = 1; i < m; i += 3) mdot(B[i][0], B[i][1], 1.6 + 3 * i / n, 1, 'sp' + i);
  const h = B[m - 1], q = B[m - 2], ang = Math.atan2(h[1] - q[1], h[0] - q[0]);
  boilSeed('serpH');
  paint(ellPts(h[0], h[1], w * .95, w * .62, 18, 1, ang), { wash: mixCol(ST.night, ST.tealDk, .45), ink: ST.teal, sw: .8 });
  meye(h[0] + Math.cos(ang) * w * .15, h[1] + Math.sin(ang) * w * .15 - w * .1, w * .45, eye, [Math.cos(ang) * .6, .2], 'serp');
}

// A small face for the Mind so it can act back: two eyes and a mouth of thread between star corners.
//   s = eye spacing unit (px). mood: 'curious' | 'grin' | 'shy' | 'hungry' | 'sad'. look [dx, dy]; blink 0..1 closes.
function mindFace(x, y, s, o = {}) {
  const t = o.t ?? T, mood = o.mood || 'curious', lk = o.look || [0, 0], key = o.key || 'mf', tilt = o.tilt || 0;
  const c = Math.cos(tilt), sn = Math.sin(tilt), R = (px, py) => [x + px * c - py * sn, y + px * sn + py * c];
  const open = (mood === 'shy' ? .45 : mood === 'hungry' ? 1.15 : 1) * (1 - clamp(o.blink || 0));
  const er = s * (mood === 'curious' ? .42 : .36);
  for (const e of [-1, 1]) { const p = R(e * s * .55, mood === 'shy' ? s * .05 : 0); meye(p[0], p[1], er, open, mood === 'shy' ? [lk[0] - .3, .6] : lk, key + e); }
  const my = s * .62, m = [];
  if (mood === 'grin') for (let i = 0; i <= 6; i++) { const a = i / 6; m.push(R((a - .5) * s * 1.3, my + Math.sin(a * Math.PI) * s * .28)); }
  else if (mood === 'hungry') for (let i = 0; i <= 10; i++) { const a = i / 10 * TAU; m.push(R(Math.cos(a) * s * .42, my + s * .15 + Math.sin(a) * s * .3 * (.8 + .2 * Math.sin(t * 9)))); }
  else if (mood === 'sad') for (let i = 0; i <= 4; i++) { const a = i / 4; m.push(R((a - .5) * s * .8, my + s * .12 - Math.sin(a * Math.PI) * s * .14)); }
  else if (mood === 'shy') for (let i = 0; i <= 3; i++) { const a = i / 3; m.push(R((a - .5) * s * .4 + s * .1, my + Math.sin(a * Math.PI) * s * .06)); }
  else for (let i = 0; i <= 8; i++) { const a = i / 8 * TAU; m.push(R(Math.cos(a) * s * .12, my + s * .05 + Math.sin(a) * s * .14)); }
  for (let i = 0; i < m.length - 1; i++) mthread(m[i], m[i + 1], 1, clamp(s / 60, .35, 1.2), key + 'm' + i);
  mdot(...m[0], s * .05, 1, key + 'c0'); mdot(...m[m.length - 1], s * .05, 1, key + 'c1');
  if (mood === 'hungry') for (let i = 0; i < 5; i++) { const a = (i + .5) / 5 * Math.PI, p = R(Math.cos(a) * s * .36, my + s * .15 - Math.sin(a) * s * .24); mthread(p, R(Math.cos(a) * s * .3, my + s * .15 - Math.sin(a) * s * .05), 1, .6, key + 't' + i); }
  if (mood === 'shy') for (const e of [-1, 1]) glow(...R(e * s * .75, s * .4), s * .5, ST.saffron, .35);
}
