// wren.js: Wren, a small paper-lantern girl. (x, y) is the ground point between her feet; u is her unit: she stands
// ~5.1u tall (legs 1.6u, tunic 1.5u, lantern head 2u). Wide shots use u ≈ 52.
//
// Options (all optional):
//   glow 0..1   inner light of the lantern (her hope). 0 = unlit paper.
//   view        'front' | 'side' | 'back'. Side faces right; flip: true mirrors.
//   turn        -1..1 (front view): slides the face toward a profile (+ = toward her left of frame / our right).
//   walk        distance walked (u). Drives leg/arm swing in side view, a small bob in front.  run 0..1 longer stride + lean.
//   sit         0..1 sitting on the ground (legs forward).  kneel 0..1: up to .5 a crouch (knees bend out), then knees down.
//   arms        [[a, b], [a, b]] left/right arm: a = swing from straight down (rad, + = outward / forward), b = elbow bend.
//   reach       [[x, y] | null, [x, y] | null]: world points the left/right hand reaches for (two-bone IK; overrides arms).
//   hands       [l, r]: 'open' | 'fist' | 'point' | 'cup' | 'hold' (default: a plain paper mitten).
//   eyes        'dot' | 'shut' | 'happy' | 'wide' | 'red' | 'sad' | 'swirl' | 'squint' | 'half'.   look [dx, dy] in -1..1.
//   blink       auto blink on a per-id schedule; false = never, 1 = shut now.
//   brow        'up' | 'worry' | 'angry' | 'sad' | null.
//   mouth       'smile' | 'o' | 'flat' | 'open' | 'frown' | 'wobble' | 'grin' | null.  mouthOpen 0..1 for 'open'.
//   sing        true: the mouth opens with the vocal (VOX), falling back to `mouth` between syllables.
//   tilt        head tilt (rad).  lean  body lean (rad).  sq  squash (+) / stretch (-).  dy  lift (u, + = up).
//   shake 0..1  fear jitter.  shrug 0..1  shoulders up.
//   wind        -1..1 scarf blow (+ = to the right).  id  boil key, so two Wrens don't share one stream.
//   headUp      u: lantern lifted above the neck (held up in the climax).
// Returns { head, hand, handB, shoulder, shoulderB } in world coordinates (hand = right/front, handB = left/back).
function wren(x, y, u, o = {}) {
  const t = o.t ?? T, g = clamp(o.glow ?? .7), view = o.view || 'front', dir = o.flip ? -1 : 1, id = 'wren' + (o.id || '');
  const sq = o.sq || 0, sx = 1 + sq * .6, sy = 1 - sq, sw = clamp(u / 46, .3, 1.8);
  const breathe = Math.sin(t * TAU * .45) * .04;
  const run = clamp(o.run || 0), walkP = (o.walk || 0) * Math.PI * .7, moving = !!o.walk;
  const bob = moving ? Math.abs(Math.sin(walkP)) * (.12 + .14 * run) : 0;
  const shk = o.shake || 0, jx = shk ? Math.sin(t * 53) * .05 * u * shk + Math.sin(t * 31) * .03 * u * shk : 0;
  const lean = (o.lean || 0) + (moving ? run * .32 : 0), Y = y - (o.dy || 0) * u;
  const X = x + jx;
  push(); translate(X, Y); scale(dir * sx, sy); rotate(lean);
  const sit = clamp(o.sit || 0), kneel = clamp(o.kneel || 0), cr = clamp(kneel * 2), kn = clamp(kneel * 2 - 1);
  const hipY = -u * lerp(lerp(1.6, 1.05, cr) - .3 * kn, .22, sit) - bob * u, neckY = hipY - u * (1.5 + breathe * .5);
  const hu = (o.headUp || 0) * u, hc = [0, neckY - u * 1.0 - hu];
  const P = (px, py) => [px * u, py * u];
  // local <-> world (the body transform is translate, scale(dir·sx, sy), rotate(lean))
  const cL = Math.cos(lean), sL = Math.sin(lean);
  const toW = p => [X + dir * sx * (p[0] * cL - p[1] * sL), Y + sy * (p[0] * sL + p[1] * cL)];
  const toL = w => { const qx = (w[0] - X) / (dir * sx), qy = (w[1] - Y) / sy; return [qx * cL + qy * sL, -qx * sL + qy * cL]; };

  // ---- legs (drawn after the tunic when sitting, so the knees sit in front of it) ----
  const drawLegs = () => {
  boilSeed(id + 'legs');
  const legCol = ST.inkSoft;
  if (sit > .5) {
    // sitting: knees up and forward, feet flat ahead
    for (const s of [-1, 1]) {
      const d = s * .06 * u, knee = [.62 * u + d, hipY - .45 * u], foot = [.95 * u + d, -.04 * u];
      inkLine([[d, hipY], knee, foot], sw * 1.1, s > 0 ? ST.ink : legCol, 'ink', .3);
      paint(ellPts(foot[0] + .1 * u, foot[1], .19 * u, .1 * u, 10), { wash: ST.ink, ink: null });
    }
  } else if (kneel > .5) {
    // kneeling: knees on the ground, shins back
    for (const s of [-1, 1]) {
      if (view === 'side') {
        const d = s * .05 * u, knee = [.42 * u + d, -.06 * u], foot = [-.5 * u + d, -.04 * u];
        inkLine([[d, hipY], knee, foot], sw * 1.1, s > 0 ? legCol : mixCol(legCol, ST.ink, .5), 'ink', .3);
        paint(ellPts(foot[0] - .05 * u, foot[1], .15 * u, .07 * u, 10), { wash: ST.ink, ink: null });
      } else {
        const knee = [s * .34 * u, -.08 * u];
        inkLine([[s * .2 * u, hipY], knee], sw * 1.1, legCol, 'ink', .3);
        paint(ellPts(knee[0], knee[1] + .02 * u, .14 * u, .08 * u, 10), { wash: ST.ink, ink: null });
      }
    }
  } else if (view === 'side') {
    const stride = .45 + .3 * run;
    for (const s of [-1, 1]) {
      const ph = Math.sin(walkP) * s, fx = ph * stride, lift = Math.max(0, Math.cos(walkP) * s) * (.2 + .2 * run) * (moving ? 1 : 0);
      const knee = [fx * .55 + .12 + .3 * cr, hipY / u + .8 - lift - .25 * cr];
      inkLine([[0, hipY], P(...knee), P(fx, -lift)], sw * 1.1, s > 0 ? legCol : mixCol(legCol, ST.ink, .5), 'ink', .3);
      paint(ellPts(fx * u + .1 * u, -lift * u, .19 * u, .1 * u, 10), { wash: ST.ink, ink: null });
    }
  } else {
    for (const s of [-1, 1]) {
      const fx = s * (.3 + .08 * cr + (moving ? Math.sin(walkP) * s * .05 : 0));
      inkLine([[s * .2 * u, hipY], [s * (.25 + .28 * cr) * u, hipY / 2], [fx * u, 0]], sw * 1.1, legCol, 'ink', .3);
      paint(ellPts(fx * u + s * .05 * u, -.02 * u, .17 * u, .1 * u, 10), { wash: ST.ink, ink: null });
    }
  }
  };
  if (sit <= .5) drawLegs();

  // ---- arms ----
  const arms = o.arms || [[.32, .25], [.32, .25]], reach = o.reach || [];
  const sway = view === 'side' && moving ? Math.sin(walkP) * (.6 + .5 * run) : 0;
  const shY = neckY + .3 * u - (o.shrug || 0) * .2 * u;
  const L1 = .62 * u, L2 = .6 * u;
  const armPts = (s) => {
    const sh = view === 'side' ? [0, shY] : [s * .32 * u, shY], tw = reach[s < 0 ? 0 : 1];
    if (tw) {
      // two-bone IK: elbow bends outward in front view, down in side view
      const tl = toL(tw), dx = tl[0] - sh[0], dy = tl[1] - sh[1], d = clamp(Math.hypot(dx, dy), .05 * u, (L1 + L2) * .999);
      const base = Math.atan2(dy, dx), cA = clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1), off = Math.acos(cA);
      const cand = [base + off, base - off].map(a => [sh[0] + Math.cos(a) * L1, sh[1] + Math.sin(a) * L1]);
      const score = e => view === 'side' ? e[1] : s * e[0] + .3 * e[1];
      const el = score(cand[0]) >= score(cand[1]) ? cand[0] : cand[1];
      return [sh, el, [sh[0] + Math.cos(base) * d, sh[1] + Math.sin(base) * d]];
    }
    const [a, b] = arms[s < 0 ? 0 : 1];
    const ang = view === 'side' ? a + sway * s : a, dx = view === 'side' ? 1 : s;
    const el = [sh[0] + dx * Math.sin(ang) * L1, sh[1] + Math.cos(ang) * L1];
    const an2 = ang + b, hd = [el[0] + dx * Math.sin(an2) * L2, el[1] + Math.cos(an2) * L2];
    return [sh, el, hd];
  };
  const finger = (p, a, len, w) => {
    const q = [p[0] + Math.cos(a) * len, p[1] + Math.sin(a) * len];
    inkLine([p, q], w * 1.9, ST.ink, 'ink', 0); inkLine([p, q], w, ST.paper, 'ink', 0);
  };
  const drawHand = (h, fa, kind) => {
    const r = .13 * u, fw = sw * .75;
    if (kind === 'open') {
      for (const da of [-.6, -.2, .2, .6]) finger([h[0] + Math.cos(fa + da) * r * .5, h[1] + Math.sin(fa + da) * r * .5], fa + da, r * 1.2, fw);
      paint(ellPts(h[0], h[1], r, r, 10), { wash: ST.paper, ink: ST.ink, sw: sw * .5 });
    } else if (kind === 'point') {
      finger([h[0] + Math.cos(fa) * r * .4, h[1] + Math.sin(fa) * r * .4], fa, r * 2.1, fw);
      paint(ellPts(h[0], h[1], r * .95, r * .95, 10), { wash: ST.paper, ink: ST.ink, sw: sw * .5 });
    } else if (kind === 'cup') {
      const B = []; for (let i = 0; i <= 8; i++) { const a = i / 8 * Math.PI; B.push([h[0] + Math.cos(a) * r * 1.35, h[1] - r * .2 + Math.sin(a) * r * 1.1]); }
      paint(B, { wash: ST.paper, ink: ST.ink, sw: sw * .5 });
      inkLine([[h[0] - r * 1.35, h[1] - r * .2], [h[0] + r * 1.35, h[1] - r * .2]], sw * .5, ST.ink, 'ink', 0);
    } else if (kind === 'fist' || kind === 'hold') {
      paint(ellPts(h[0], h[1], r * 1.12, r * 1.05, 10), { wash: ST.paper, ink: ST.ink, sw: sw * .55 });
      if (kind === 'fist') for (const k of [-.35, .35]) { const a = fa + k, p = [h[0] + Math.cos(a) * r * .55, h[1] + Math.sin(a) * r * .55]; inkLine([p, [p[0] + Math.cos(fa) * r * .4, p[1] + Math.sin(fa) * r * .4]], sw * .35, ST.ink, 'ink', 0); }
    } else paint(ellPts(h[0], h[1], r, r, 10), { wash: ST.paper, ink: ST.ink, sw: sw * .5 });
  };
  const hands = o.hands || [];
  const drawArm = (s, key) => {
    boilSeed(id + 'arm' + key);
    const A = armPts(s);
    inkLine(A, sw * 1.1, ST.ink, 'ink', .4);
    drawHand(A[2], Math.atan2(A[2][1] - A[1][1], A[2][0] - A[1][0]), hands[s < 0 ? 0 : 1]);
  };
  if (view === 'side') drawArm(-1, 'b'); else if (o.armsBack) { drawArm(-1, 'l'); drawArm(1, 'r'); }   // armsBack: hands tucked behind the head

  // ---- scarf: tails trail away from the wind (or behind her when walking) ----
  boilSeed(id + 'scarf');
  const wind = clamp(o.wind ?? (moving ? -.7 - .3 * run : -.55), -1, 1) * dir, tail = [];
  for (let k = 0; k <= 5; k++) {
    const f = Math.sin(t * 7 - k * .9) * .12 * k * (.4 + Math.abs(wind));
    tail.push([(.1 + wind * k * .42) * u, neckY + (.15 + k * (.3 - Math.abs(wind) * .22)) * u + f * u]);
  }
  if (view !== 'back') paint(ribbon(tail, .34 * u, .16 * u), { wash: ST.scarf, ink: ST.ink, sw: sw * .8 });

  // ---- tunic ----
  boilSeed(id + 'tunic');
  const tw0 = .32 + (o.shrug || 0) * .04, tw1 = .58, flare = moving ? Math.sin(walkP * 2) * .04 : 0;
  const tunic = view === 'side'
    ? [P(-.2, neckY / u), P(.24, neckY / u), P(.36 + flare, hipY / u + .1), P(-.42 - flare, hipY / u + .12)]
    : [P(-tw0, neckY / u), P(tw0, neckY / u), P(tw1 + flare, hipY / u + .1), P(0, hipY / u + .18), P(-tw1 - flare, hipY / u + .1)];
  paint(tunic, { wash: ST.tunic, ink: ST.ink, sw, curv: .3 });
  if (sit > .5) drawLegs();

  boilSeed(id + 'scarfB');
  paint(rrPts(-.4 * u, neckY - .14 * u, .8 * u, .3 * u, .14 * u), { wash: ST.scarf, ink: ST.ink, sw: sw * .8 });
  if (view === 'back') paint(ribbon(tail, .34 * u, .16 * u), { wash: ST.scarf, ink: ST.ink, sw: sw * .8 });

  // ---- lantern head ----
  const hj = shk ? [Math.sin(t * 61) * .03 * u * shk, 0] : [0, 0];
  push(); translate(hc[0] + hj[0], hc[1]); rotate(o.tilt || 0);
  boilSeed(id + 'head');
  const tn = view === 'front' ? clamp(o.turn || 0, -1, 1) : 0, at = Math.abs(tn);
  const rx = (view === 'side' ? 1.0 : 1.1 - .1 * at) * u, ry = .95 * u;
  const body = ellPts(0, 0, rx, ry, 30, .6);
  paint(body, { wash: mixCol(ST.lampOff, ST.lampLit, g), ink: null });
  if (g > .02) glow(0, u * .05, rx * (1.4 + 2.2 * g), ST.lampGlow, .25 + .75 * g);
  // paper ribs (meridians), darker where unlit; they roll with the turn
  const ribCol = mixCol(ST.inkSoft, ST.ember, g * .6);
  for (const k0 of view === 'side' ? [-.7, -.2, .35, .8] : [-.62, 0, .62]) {
    const k = clamp(k0 + .38 * tn, -.96, .96);
    const R = []; for (let s = -1; s <= 1.001; s += .25) R.push([k * rx * Math.sqrt(1 - s * s * .92), s * ry * .9]);
    inkLine(R, sw * .45, ribCol, 'inkfine', .5);
  }
  paint(body, { ink: ST.ink, sw });
  // caps and handle loop
  paint(rrPts(-.34 * u, -ry - .14 * u, .68 * u, .24 * u, .07 * u), { wash: ST.ink, ink: null });
  paint(rrPts(-.3 * u, ry - .1 * u, .6 * u, .2 * u, .07 * u), { wash: ST.ink, ink: null });
  inkLine([[-.14 * u, -ry - .12 * u], [-.1 * u, -ry - .42 * u], [.12 * u, -ry - .44 * u], [.15 * u, -ry - .12 * u]], sw * .7, ST.ink, 'ink', .7);

  // ---- face ----
  if (view !== 'back') {
    boilSeed(id + 'face');
    const lk = o.look || [0, 0], side = view === 'side', fx = side ? .25 : .38 * tn, er = .11 * u;
    // eye x offsets (from fx) and widths; in a turn the far eye squeezes toward the rim and drops out near profile
    const EX = side ? [[.42, 1]] : [-.36, .36].map(e => [e * (1 - .42 * at), Math.sign(e) === -Math.sign(tn) ? 1 - .65 * at : 1]).filter(e => e[1] > .45);
    let eyes = o.eyes || 'dot';
    if (o.blink === 1) eyes = 'shut';
    else if (o.blink !== false && !['shut', 'happy', 'swirl'].includes(eyes)) {
      let h = 7; for (const c of id) h = (h * 31 + c.charCodeAt(0)) % 9973;
      const per = 2.5 + 1.5 * hash(h), ph = hash(h + 7.7) * per;
      if ((t + ph) % per < .12) eyes = 'shut';
    }
    const brow = o.brow ?? null;
    for (const [e, wk] of EX) {
      const cx = (fx + e + lk[0] * .12) * u, cy = (.08 + lk[1] * .1) * u, ew = er * wk, sg = side ? -1 : Math.sign(e);
      if (eyes === 'shut') inkLine([[cx - ew * 1.2, cy], [cx + ew * 1.2, cy + er * .2]], sw * .8, ST.ink, 'ink', 0);
      else if (eyes === 'happy') inkLine([[cx - ew * 1.2, cy + er * .5], [cx, cy - er * .7], [cx + ew * 1.2, cy + er * .5]], sw * .8, ST.ink, 'ink', .7);
      else if (eyes === 'sad') { paint(ellPts(cx, cy + er * .2, ew * .85, er, 10), { wash: ST.ink, ink: null }); if (!brow) inkLine([[cx - er * 1.4, cy - er * 1.5], [cx + er * 1.1, cy - er * 2.1]].map(p => e < 0 ? p : [2 * cx - p[0], p[1]]), sw * .6, ST.ink, 'ink', 0); }
      else if (eyes === 'red') { glow(cx, cy, er * 4, ST.red, .9); paint(ellPts(cx, cy, ew * 1.1, er * 1.3, 10), { wash: ST.red, ink: ST.ink, sw: sw * .4 }); }
      else if (eyes === 'wide') { paint(ellPts(cx, cy, ew * 1.6, er * 1.8, 12), { wash: ST.warm, ink: ST.ink, sw: sw * .6 }); paint(ellPts(cx + lk[0] * er * .4, cy + lk[1] * er * .4, ew * .6, er * .7, 8), { wash: ST.ink, ink: null }); }
      else if (eyes === 'swirl') { const S = []; for (let i = 0; i <= 22; i++) { const a = i / 22 * 3.4 * Math.PI * sg + t * 6, r = er * 1.5 * i / 22; S.push([cx + Math.cos(a) * r * wk, cy + Math.sin(a) * r]); } inkLine(S, sw * .45, ST.ink, 'inkfine', .3); }
      else if (eyes === 'squint') { paint(ellPts(cx, cy + er * .1, ew * 1.1, er * .32, 10), { wash: ST.ink, ink: null }); inkLine([[cx - ew * 1.3, cy - er * .35], [cx + ew * 1.3, cy - er * .25]], sw * .5, ST.ink, 'ink', 0); }
      else if (eyes === 'half') {
        const B = []; for (let i = 0; i <= 8; i++) { const a = i / 8 * Math.PI; B.push([cx + Math.cos(a) * ew, cy - er * .1 + Math.sin(a) * er * 1.05]); }
        paint(B, { wash: ST.ink, ink: null }); inkLine([[cx - ew * 1.35, cy - er * .15], [cx + ew * 1.35, cy - er * .1]], sw * .65, ST.ink, 'ink', 0);
      }
      else paint(ellPts(cx, cy, ew, er * 1.2, 10), { wash: ST.ink, ink: null });
      if (brow) {
        // outer end, inner end (toward the nose), arch; sg = -1 for the left eye
        const by = cy - er * (eyes === 'wide' ? 2.6 : 2.2), H = { up: [-.5, -.5, -.6], worry: [.3, -.9, -.2], angry: [-.6, .6, 0], sad: [.6, -.3, .1] }[brow] || [0, 0, 0];
        const out = [cx + sg * ew * 1.35, by + H[0] * er], inn = [cx - sg * ew * 1.15, by + H[1] * er], mid = [cx + sg * ew * .1, by + (H[0] + H[1]) / 2 * er + H[2] * er];
        inkLine([out, mid, inn], sw * .65, ST.ink, 'ink', .6);
      }
    }
    let m = o.mouth, mo = o.mouthOpen ?? .5;
    if (o.sing) { const v = typeof VOX === 'function' ? VOX(t) : 0; if (v > .08) { m = 'open'; mo = v; } else m = m ?? 'flat'; }
    const mx = (fx + (side ? .45 : .22 * tn) + lk[0] * .1) * u, my = .42 * u, mw = side ? .7 : 1 - .35 * at;
    if (m === 'smile') inkLine([[mx - .14 * u * mw, my - .03 * u], [mx, my + .07 * u], [mx + .14 * u * mw, my - .03 * u]], sw * .6, ST.ink, 'ink', .7);
    else if (m === 'o') paint(ellPts(mx, my + .03 * u, .07 * u * mw, .09 * u, 10), { wash: ST.ink, ink: null });
    else if (m === 'flat') inkLine([[mx - .1 * u * mw, my], [mx + .1 * u * mw, my]], sw * .5, ST.ink, 'ink', 0);
    else if (m === 'frown') inkLine([[mx - .13 * u * mw, my + .06 * u], [mx, my - .03 * u], [mx + .13 * u * mw, my + .06 * u]], sw * .6, ST.ink, 'ink', .7);
    else if (m === 'wobble') { const Wv = []; for (let i = 0; i <= 6; i++) Wv.push([mx + (i / 6 - .5) * .28 * u * mw, my + (i % 2 ? -.025 : .025) * u]); inkLine(Wv, sw * .5, ST.ink, 'ink', 0); }
    else if (m === 'grin') {
      const G = [[mx - .19 * u * mw, my - .05 * u]]; for (let i = 0; i <= 8; i++) { const a = i / 8 * Math.PI; G.push([mx + Math.cos(Math.PI - a) * .19 * u * mw, my - .05 * u + Math.sin(a) * .15 * u]); }
      paint(G, { wash: ST.ink, ink: null }); paint(rectPts(mx - .15 * u * mw, my - .04 * u, .3 * u * mw, .04 * u), { wash: ST.paper, ink: null });
    }
    else if (m === 'open') {
      const k = clamp(mo), hgt = .04 + .19 * k, wd = (.09 + .07 * k) * mw;
      paint(ellPts(mx, my + hgt * .4 * u, wd * u, hgt * u, 12), { wash: ST.ink, ink: null });
      if (k > .45) paint(ellPts(mx, my + hgt * .95 * u, wd * .55 * u, hgt * .35 * u, 10), { wash: ST.scarfDk, ink: null });
    }
  }
  pop();

  if (view === 'side') drawArm(1, 'f'); else if (!o.armsBack) { drawArm(-1, 'l'); drawArm(1, 'r'); }
  pop();
  return { head: toW([hc[0] + hj[0], hc[1]]), hand: toW(armPts(1)[2]), handB: toW(armPts(-1)[2]), shoulder: toW(armPts(1)[0]), shoulderB: toW(armPts(-1)[0]) };
}
