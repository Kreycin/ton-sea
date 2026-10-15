// interior.js: INT master set, inside the pier tea shop (used by ~15 shots). One-point perspective from the customers'
// side: the back wall holds the glazed door (left) and the big sea window (right); shelves, the back bar with the stove
// and copper kettle, a window ledge with Mai's stool, pendant lamps, and the counter across the front.
// Painted like ghibli.js: gouache washes with no outlines on the set; the cast and the story props keep the thin line.
// One light state tints every colour, so the one set carries the whole colour arc (morning, grey, storm, gold, dusk).
//   INT.set(t, L, o, layers)
//     L: a light state, INT.L.morning|dim|grey|rain|gold|dusk, or INT.mixL(a, b, u) between two
//     o: door, shutter, casement: 0 shut .. 1 open; kettle: flame and steam 0..1; gull: 'deck'|'rail'; chime: swing 0..1;
//        prints: wet footprints 0..1; umb: 'lean'|'hook'; glasses: tea glasses left on the counter; flash: lightning 0..1;
//        noKettle: the stove is empty (Ton holds the kettle); gullX: world x of the deck gull (it hops as it walks)
//     layers: { back, mid, front }: cast callbacks drawn behind the counter, in front of it, and in front of the stools
//   INT.at(x, z) → [sx, sy, f]: the floor point (x, z) on screen; the cast scale there is k = .82 * f
//   INT.lightCast(L) / INT.unlightCast(): tint the cast palette by the light state while a shot draws
(() => {
  // ---------- projection: eye level 1.45 m, 265 px = 1 m on the back wall (z = 0); z grows toward the camera ----------
  const VX = 960, VY = 466, DC = 1400, FL = 850, CE = 160, WL = 120, WR = 1800, ZN = 600, ZE = -900;
  const fz = z => DC / (DC - z);
  const pj = (x, y, z = 0) => { const f = fz(z); return [VX + (x - VX) * f, VY + (y - VY) * f]; };
  const Q = (...p) => p.map(([x, y, z]) => pj(x, y, z));
  const zr = (x0, y0, x1, y1, z = 0) => { const [a, b] = pj(x0, y0, z), [c2, d] = pj(x1, y1, z); return rectPts(a, b, c2 - a, d - b); };
  const fl3 = (cx, cz, rx, rz, y = FL, n = 18) => { const p = []; for (let i = 0; i < n; i++) { const a = i / n * TAU; p.push(pj(cx + Math.cos(a) * rx, y, cz + Math.sin(a) * rz)); } return p; };
  const DOOR = [190, 330, 430, FL], WIN = [1240, 250, 1720, 640], HOLES = [DOOR, WIN];
  const LAMPS = [[700, 200], [1010, 200], [1480, 140]];                  // pendant lamps: world x, z

  // ---------- materials in neutral daylight; the light state tints them all ----------
  const B = {
    plaster: '#E9DDC4', plasterLt: '#F3EAD6', plasterSh: '#CDBB9A', side: '#D2C2A2',
    wains: '#5E8C84', wainsDk: '#466C66', wainsLt: '#7BA49A', trim: '#EDE2CA', skirt: '#5A4234', sash: '#6E968C',
    wood: '#8A6446', woodDk: '#5E4230', woodLt: '#B08868', door: '#7A5236', beam: '#5A4234', beamDk: '#3E2E26',
    ceil: '#C4AE8A', ceilDk: '#A08868', floor: '#A27E5C', floorDk: '#7E6046', floorLt: '#C29E78',
    shutter: '#5E7E72', shutterDk: '#465E56', mat: '#B4583E', matLt: '#E2C48E', noren: '#2E4766',
    copper: '#C27A44', copperLt: '#EBAE78', copperDk: '#8A4E2A', steel: '#A9B3B6', steelDk: '#6E787C', steelLt: '#E2E8EA', brass: '#C9A04E',
    enamel: '#EEE8D8', enamelDk: '#C2B9A4', iron: '#2E2A2C', jar: '#D2DED8', jarDk: '#9FB2AA', tea: '#5E4426', teaGreen: '#6E7C3C', sugar: '#F7F3EA',
    cup: '#F4EEE2', cupRim: '#3F5E8C', cloth: '#E2CFA8', clothDk: '#B89466', tile: '#E6E2D2', tileLn: '#9FB4BC',
    leaf: '#3F6B45', leafLt: '#6A9A5A', leafDk: '#2A4A34', pot: '#B4643E', potDk: '#8A4A2E',
    ring: '#EEE6D4', ringRed: '#C9584A', rope: '#C8B48A', shade: '#3F6B66', shadeIn: '#F6EBCB',
  };
  // what the openings show, per light state
  const OUT = {
    morning: { s0: '#AFC2CE', s1: '#D0DBDE', s2: '#EDE9DC', cl: '#F4F1E8', clDk: '#BAC6CE', cloud: .5, sea: '#8BA6AE', seaDk: '#728F9A', seaLt: '#E2E9E4', hill: '#9FB2B8', sun: '#FFF8E6', sunA: .55, sunX: 1560, sunY: 300, rail: '#7A6656', deck: '#8C7766', deckDk: '#6C5A4C', rain: 0, light: 0 },
    grey: { s0: '#727F8C', s1: '#8E99A3', s2: '#ACB3B4', cl: '#B8BEBF', clDk: '#7E8A96', cloud: 1, sea: '#5C7480', seaDk: '#4A606C', seaLt: '#A6B2B4', hill: '#6E808A', sun: '#E8E4D8', sunA: 0, sunX: 1560, sunY: 300, rail: '#5A4A40', deck: '#6C5C50', deckDk: '#54463E', rain: 0, light: .5 },
    rain: { s0: '#3C475A', s1: '#525F74', s2: '#728090', cl: '#66738A', clDk: '#3C4A60', cloud: 1, sea: '#385260', seaDk: '#2A4250', seaLt: '#7E909C', hill: '#3E5260', sun: '#C8CCD0', sunA: 0, sunX: 1560, sunY: 300, rail: '#3E3430', deck: '#4A403C', deckDk: '#38302E', rain: 1, light: 1 },
    gold: { s0: '#8EA6B6', s1: '#E6D2AC', s2: '#F7C77E', cl: '#F8E2B4', clDk: '#9C90A2', cloud: .7, sea: '#6E8A94', seaDk: '#566E7A', seaLt: '#F6D08C', hill: '#7C8A8E', sun: '#FFE4A2', sunA: 1, sunX: 1610, sunY: 420, rail: '#5E4A3C', deck: '#8A6E56', deckDk: '#6A5444', rain: 0, light: .3 },
    dusk: { s0: '#465282', s1: '#9A7C9E', s2: '#EBAD88', cl: '#E8B49A', clDk: '#5E5A82', cloud: .6, sea: '#4A5676', seaDk: '#3A4462', seaLt: '#E6A88C', hill: '#4A4C6A', sun: '#FFC68E', sunA: .6, sunX: 1650, sunY: 462, rail: '#3A3036', deck: '#5A4A48', deckDk: '#46383A', rain: 0, light: 1 },
  };
  // amb/ambK: the colour grade every material takes; shade: the light map's level away from any light (a multiply glaze);
  // winL: daylight the openings throw into the room; lamp, sun: 0..1; sunEl/sunAz: radians; clock: hours on the wall clock
  const LS = {
    morning: { amb: '#C6D3DC', ambK: .14, shade: '#E2E6EA', winL: .3, lamp: 0, sun: .7, sunCol: '#FFF6E2', sunEl: 1.0, sunAz: .25, clock: 7.2, out: OUT.morning },
    dim: { amb: '#283446', ambK: .3, shade: '#465068', hole: .3, winL: .3, lamp: 0, sun: 0, sunCol: '#FFF8E8', sunEl: 1.0, sunAz: .25, clock: 6.9, out: OUT.morning },
    grey: { amb: '#8E98A4', ambK: .24, shade: '#A2AAB6', winL: .3, lamp: .35, sun: 0, sunCol: '#E8E4D8', sunEl: 1.0, sunAz: .2, clock: 14.5, out: OUT.grey },
    rain: { amb: '#46506A', ambK: .22, shade: '#4A5470', winL: .12, lamp: 1, sun: 0, sunCol: '#C8CCD0', sunEl: 1.0, sunAz: .2, clock: 15.2, out: OUT.rain },
    gold: { amb: '#F0C690', ambK: .12, shade: '#DCCFC2', winL: .4, lamp: .3, sun: 1, sunCol: '#FFD98E', sunEl: .85, sunAz: .55, clock: 16.6, out: OUT.gold },
    dusk: { amb: '#7E6E90', ambK: .2, shade: '#5C587A', winL: .22, lamp: 1, sun: .25, sunCol: '#FFB98A', sunEl: .7, sunAz: .5, clock: 18.4, out: OUT.dusk },
  };
  // blend two light states (or any matching objects of colours and numbers)
  const mixO = (a, b, u) => {
    if (typeof a === 'number') return lerp(a, b, u);
    if (typeof a === 'string') return a[0] === '#' ? mixCol(a, b, u) : (u < .5 ? a : b);
    const o = {}; for (const k in a) o[k] = k in b ? mixO(a[k], b[k], u) : a[k]; return o;
  };

  // ---------- helpers ----------
  let LL = LS.morning, OO = {};
  const c = (k, more = 0) => mixCol(B[k] || k, LL.amb, clamp(LL.ambK + more));
  const cw = (k, w = 1, more = 0) => mixCol(c(k, more), '#FFCF8E', Math.min(.5, LL.lamp * w));     // warmed by the lamps
  const shd = (more = 0) => mixCol('#2A2026', LL.amb, clamp(.3 + more));
  const inked = (pts, col, o = {}) => paint(pts, { wash: col, washOp: o.op ?? 255, ink: CAST.ink, sw: (o.sw ?? .9) * CAST.swK, curv: o.curv ?? .4, br: 'ink' });
  // a back-wall rectangle with the door and window cut out (painted as bands)
  function holed(x0, y0, x1, y1, col, op = 255) {
    const ys = [y0, y1];
    for (const h of HOLES) for (const y of [h[1], h[3]]) if (y > y0 && y < y1) ys.push(y);
    ys.sort((a, b) => a - b);
    for (let i = 0; i + 1 < ys.length; i++) {
      const a = ys[i], b = ys[i + 1]; if (b - a < 1) continue;
      const cuts = HOLES.filter(h => h[1] <= a && h[3] >= b && h[2] > x0 && h[0] < x1).map(h => [h[0], h[2]]).sort((p, q) => p[0] - q[0]);
      let x = x0;
      for (const [c0, c1] of cuts) { if (c0 > x) gp(rectPts(x, a - .5, c0 - x, b - a + 1), col, op); x = Math.max(x, c1); }
      if (x < x1) gp(rectPts(x, a - .5, x1 - x, b - a + 1), col, op);
    }
  }
  // an axis-aligned box, painting only the faces the eye can see
  function box(x0, y0, z0, x1, y1, z1, cF, cT, cS = cF, op = 255) {
    if (x0 > VX) gp(Q([x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]), cS, op);
    if (x1 < VX) gp(Q([x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0]), cS, op);
    if (y0 > VY) gp(Q([x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]), cT, op);
    if (y1 < VY) gp(Q([x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]), cT, op);
    gp(zr(x0, y0, x1, y1, z1), cF, op);
  }
  // an elliptical pool of light lying on a surface
  function pool(x, y, r, sq, col, a) { if (a <= .01) return; push(); translate(x, y); scale(1, sq); glow(0, 0, r, col, a); pop(); }
  function hull(P) {
    const p = P.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]), cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], up = [];
    for (const q of p) { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
    for (const q of p.reverse()) { while (up.length > 1 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
    return lo.slice(0, -1).concat(up.slice(0, -1));
  }
  // convex polygon [[x, z]] clipped to one side of the line A→B (keepIn: the left side, which is inside a CCW hull)
  const side = (A, B, p) => (B[0] - A[0]) * (p[1] - A[1]) - (B[1] - A[1]) * (p[0] - A[0]);
  function clipEdge(P, A, B, keepIn = true) {
    const out = [], k = keepIn ? 1 : -1;
    for (let i = 0; i < P.length; i++) {
      const p = P[i], q = P[(i + 1) % P.length], sp = side(A, B, p) * k, sq = side(A, B, q) * k;
      if (sp >= 0) out.push(p);
      if ((sp >= 0) !== (sq >= 0)) { const u = sp / (sp - sq); out.push([lerp(p[0], q[0], u), lerp(p[1], q[1], u)]); }
    }
    return out;
  }
  const clipZ = (P, zmax) => clipEdge(P, [0, zmax], [1, zmax], false);
  // convex P minus convex CCW S, as disjoint convex pieces
  function minus(P, S) {
    const pieces = []; let rest = P;
    for (let i = 0; i < S.length && rest.length > 2; i++) {
      const A = S[i], B = S[(i + 1) % S.length], o = clipEdge(rest, A, B, false);
      if (o.length > 2) pieces.push(o);
      rest = clipEdge(rest, A, B, true);
    }
    return pieces;
  }
  // where sunlight through the wall point (x, y) lands on the floor: [x, z]
  const sunHit = (x, y) => { const h = FL - y, tz = 1 / Math.tan(LL.sunEl); return [x - h * tz * Math.tan(LL.sunAz), h * tz]; };
  // the window's sun on a level surface at height ys, between depths za..zb and xa..xb: [[x, z]] (empty if none)
  function sunOn(ys, za, zb, xa = -1e4, xb = 1e4) {
    const tz = 1 / Math.tan(LL.sunEl), ta = Math.tan(LL.sunAz), yLow = ys > WIN[3] ? WIN[3] - 116 / tz : WIN[3];   // the ledge shades low rows
    const y0 = Math.max(WIN[1], ys - zb / tz), y1 = Math.min(yLow, ys - za / tz);
    if (y1 <= y0) return [];
    const P = (xw, y) => { const z = (ys - y) * tz; return [xw - z * ta, z]; };
    let G2 = [P(WIN[0], y0), P(WIN[2], y0), P(WIN[2], y1), P(WIN[0], y1)];
    G2 = clipEdge(G2, [xa, 0], [xa, 1], false);
    return G2.length > 2 ? clipEdge(G2, [xb, 0], [xb, 1], true) : [];
  }

  // ---------- outside, seen through the door and the window: sky, sea, islands (a far layer, 35 % parallax) ----------
  function outside(t) {
    const O = LL.out, cm = CAM || { cx: 960, cy: 540, zoom: 1 };
    const z2 = 1 + (cm.zoom - 1) * .35, cx2 = 960 + (cm.cx - 960) * .35, cy2 = 540 + (cm.cy - 540) * .35;
    push(); translate(cm.cx, cm.cy); scale(z2 / cm.zoom); translate(-cx2, -cy2);
    boilSeed('osky');
    gp(rectPts(-500, -400, W + 1000, 900), O.s0);
    gp(rectPts(-500, 150, W + 1000, 330), O.s1, 230, { curv: .5 });
    gp(rectPts(-500, 330, W + 1000, 150), O.s2, 230, { curv: .5 });
    if (O.sunA > .01) {                                                 // the sun and its halo, before the clouds cross it
      glow(O.sunX, O.sunY, 460, O.sun, O.sunA * .8);
      gp(ellPts(O.sunX, O.sunY, 24, 24, 24, 0), mixCol(O.sun, '#FFFFFF', .5), 255 * clamp(O.sunA * 1.5));
    }
    const dr = Math.sin(t * .05) * 16, k = O.cloud, sk = (x0, x1, yb, h, lit, dk, seed, d) => strata(x0, x1, yb, h, lit, dk, seed, d, mixCol(lit, O.s1, .4));
    if (k > .01) {
      sk(1050, 2300, VY - 18, 26 + 30 * k, mixCol(O.cl, O.s2, .35), mixCol(O.clDk, O.s2, .35), 21, dr * .3);
      sk(-300, 820, VY - 40, 40 + 40 * k, mixCol(O.cl, O.s2, .2), mixCol(O.clDk, O.s2, .2), 22, dr * .5);
      sk(900, 2300, 360, 50 + 70 * k, O.cl, O.clDk, 23, dr * .7);
      sk(-300, 1300, 250, 60 + 110 * k, mixCol(O.cl, O.s0, .2), mixCol(O.clDk, O.s0, .2), 24, dr);
      sk(700, 2300, 120, 90 + 100 * k, mixCol(O.cl, O.s0, .35), mixCol(O.clDk, O.s0, .3), 25, dr * 1.2);
    }
    if (O.sunA > .01) glow(O.sunX, O.sunY, 140, '#FFFFFF', O.sunA * .5);
    // sea out to the horizon at eye level, deeper toward us
    gp(rectPts(-500, VY, W + 1000, 900), O.sea);
    gp(rectPts(-500, VY + 70, W + 1000, 800), O.seaDk, 150, { curv: .5 });
    // islands with a tiny lighthouse (window side) and a far headland (door side)
    gp([[1330, VY + 2], [1420, VY - 16], [1520, VY - 30], [1600, VY - 34], [1680, VY - 22], [1780, VY + 2]], O.hill, 255, { curv: .5 });
    gp([[-300, VY + 2], [-100, VY - 26], [120, VY - 40], [300, VY - 22], [460, VY + 2]], mixCol(O.hill, O.s2, .35), 255, { curv: .5 });
    gp(rectPts(1644, VY - 62, 10, 30), mixCol('#E6E2D6', O.hill, .3));
    gp([[1640, VY - 60], [1658, VY - 60], [1649, VY - 72]], mixCol('#B4483A', O.hill, .3));
    if (O.light > .01) glow(1649, VY - 58, 46, '#FFE2A0', O.light * (.45 + .4 * Math.sin(t * 2.2)));
    gp(rectPts(-500, VY - 3, W + 1000, 7), O.seaLt, 210);                      // horizon shine
    for (let i = 0; i < 40; i++) {                                          // wave strokes
      boilSeed('ow' + i);
      const x = -100 + hash(i * 2.1) * 2100, y = VY + 6 + Math.pow(hash(i * 4.7), 1.3) * 160, w = 10 + 50 * hash(i + 5) * (y - VY) / 160;
      st([[x - w, y], [x, y - 1.5], [x + w, y]], .4 + .6 * (y - VY) / 160, O.seaLt);
    }
    if (O.sunA > .01) for (let i = 0; i < 30; i++) {                        // the sun's path on the water
      boilSeed('og' + i);
      const y = VY + 3 + Math.pow(hash(i * 3.1), 1.4) * 150, w = 5 + 26 * hash(i * 1.7) * (.3 + (y - VY) / 150);
      const x = O.sunX + (hash(i * 7.3) - .5) * (16 + (y - VY) * 1.2) + Math.sin(t * 1.5 + i) * 3;
      st([[x - w, y], [x + w, y]], .9, mixCol(O.seaLt, '#FFFFFF', .3));
    }
    if (O.rain > .01) {                                                     // storm: rain curtains and streaks out at sea
      for (let i = 0; i < 6; i++) { boilSeed('oc' + i); const x = -100 + i * 380 + Math.sin(t * .3 + i) * 30; gp([[x, 100], [x + 160, 100], [x + 90, VY + 40], [x - 70, VY + 40]], O.clDk, 36 * O.rain, { curv: .3 }); }
      for (let i = 0; i < 90; i++) {
        boilSeed('or' + i);
        const k2 = (t * 1.4 + hash(i * 1.7)) % 1, x = hash(i * 4.3) * 2200 - 140 - k2 * 70, y = -60 + k2 * 860, len = 26 + 30 * hash(i);
        st([[x, y], [x - len * .22, y + len]], .35, mixCol(O.s2, '#FFFFFF', .2));
      }
    }
    if (OO.flash > .01) { gp(rectPts(-500, -400, W + 1000, 900), '#E6ECF6', 170 * OO.flash); glow(700, 120, 900, '#DCE6FF', OO.flash); }
    pop();
  }

  // ---------- just outside: the pier deck out to the end railing, a gull, the noren, the window shutters ----------
  function gull(x, y, s, t) {
    const hb = Math.sin(t * 1.3) > .9 ? -3 * s : 0, wc = mixCol('#F2F0EA', LL.amb, LL.ambK * .8), gc = mixCol('#8A949C', LL.amb, LL.ambK * .8);
    st([[x - 4 * s, y], [x - 4 * s, y - 11 * s]], 1.2 * s, '#D08A3A'); st([[x + 4 * s, y], [x + 4 * s, y - 11 * s]], 1.2 * s, '#D08A3A');
    gp(ellPts(x, y - 20 * s, 20 * s, 11 * s, 18, 0, -.15), wc, 255, { curv: .5 });                       // body
    gp([[x - 18 * s, y - 26 * s], [x + 10 * s, y - 28 * s], [x + 2 * s, y - 16 * s], [x - 26 * s, y - 14 * s]], gc, 255, { curv: .4 });   // folded wing
    gp([[x - 22 * s, y - 20 * s], [x - 34 * s, y - 24 * s], [x - 30 * s, y - 16 * s]], '#3A3638');        // wing tip
    gp(ellPts(x + 16 * s, y - 36 * s + hb, 8 * s, 7.5 * s, 14, 0), wc, 255, { curv: .5 });                // head
    gp([[x + 22 * s, y - 37 * s + hb], [x + 33 * s, y - 35 * s + hb], [x + 22 * s, y - 33 * s + hb]], '#E8B43A');
    gp(ellPts(x + 18 * s, y - 38 * s + hb, 1.4 * s, 1.4 * s, 8, 0), '#2A2426');
  }
  function outer(t) {
    const O = LL.out, rn = O.rain, ry = FL - 265;
    boilSeed('outer');
    // deck boards run out to the railing; the far boards catch the sky
    gp(Q([-800, FL, 0], [2700, FL, 0], [2700, FL, ZE], [-800, FL, ZE]), O.deck);
    gp(Q([-800, FL, ZE * .5], [2700, FL, ZE * .5], [2700, FL, ZE], [-800, FL, ZE]), mixCol(O.deck, O.s2, .25), 200);
    for (let x = -420; x < 520; x += 36) st([pj(x, FL, -22), pj(x, FL, ZE * .5), pj(x, FL, ZE)], .7, O.deckDk);
    if (rn > .01) for (let i = 0; i < 5; i++) gp(Q([150 + i * 60, FL, ZE * .2], [180 + i * 60, FL, ZE * .2], [190 + i * 60, FL, ZE * .9], [170 + i * 60, FL, ZE * .9]), O.s2, 40 * rn, { curv: .4 });
    // the end railing
    for (const [xa, xb] of [[-560, 360], [1300, 2400]]) {
      for (let x = xa; x < xb; x += 34) gp(zr(x, ry + 18, x + 7, FL - 6, ZE), O.rail, 220);           // balusters
      for (let x = xa; x < xb; x += 170) gp(zr(x, ry, x + 16, FL, ZE), O.rail);                         // posts
      gp(zr(xa, ry, xb, ry + 18, ZE), O.rail);
      gp(zr(xa, ry, xb, ry + 4, ZE), mixCol(O.rail, O.s2, .45));
    }
    if (OO.gull === 'rail') { const [gx, gy] = pj(1900, ry, ZE); gull(gx, gy, fz(ZE) * 1.6, t); }
    if (OO.gull === 'deck') { const [gx, gy] = pj(OO.gullX ?? 160, FL, -300); gull(gx, gy - (OO.gullX != null ? 3 * Math.abs(Math.sin(t * 7)) : 0), fz(-300) * 1.8, t); }
    // the noren just outside the door: two indigo panels seen from behind, the sky glowing through the cloth, swaying
    const sw = Math.sin(t * 1.3) * (6 + 10 * rn) + Math.sin(t * 3.1) * 3 * rn, nc = mixCol(mixCol(B.noren, O.s2, .25), LL.amb, clamp(LL.ambK * .9));
    for (let p = 0; p < 2; p++) {
      const x0 = 200 + p * 116, x1 = x0 + 104, d = sw * (1 + p * .3), xm = (x0 + x1) / 2;
      gp(Q([x0, 330, -30], [x1, 330, -30], [x1 + d, 446, -30], [xm + d * .9, 450, -30], [x0 + d * .8, 446, -30]), nc, 220, { curv: .15 });
      gp(Q([x0, 330, -30], [x1, 330, -30], [x1 + d * .3, 362, -30], [x0 + d * .25, 362, -30]), mixCol(nc, '#1A2436', .35), 110);
      gp(Q([x0 + d * .7, 432, -30], [x1 + d * .9, 432, -30], [x1 + d, 446, -30], [x0 + d * .8, 446, -30]), mixCol(nc, O.s2, .35), 170);
    }
    gp(Q([192, 323, -30], [428, 323, -30], [428, 331, -30], [192, 331, -30]), mixCol('#4A3A30', O.s2, .3));   // the rod
    // louvred shutters: shut, they cover the window from outside and leak light between the slats; open, they fold back
    const ph = (OO.shutter ?? 1) * 2.9;
    if (ph < 2.75) for (const side of [1, -1]) {
      const hx = side > 0 ? WIN[0] : WIN[2], Ws = (WIN[2] - WIN[0]) / 2, cs = Math.cos(ph), sn = Math.sin(ph);
      const P = (u, y) => pj(hx + side * Ws * u * cs, y, -24 - Ws * u * sn), q = (u0, ya, u1, yb) => [P(u0, ya), P(u1, ya), P(u1, yb), P(u0, yb)];
      const col = mixCol(B.shutter, LL.amb, clamp(LL.ambK + .15)), dk = mixCol(B.shutterDk, LL.amb, clamp(LL.ambK));
      gp(q(0, WIN[1] - 4, 1, WIN[3] + 4), col);
      for (let y = WIN[1] + 18; y < WIN[3] - 10; y += 15) { st([P(.08, y), P(.92, y)], 1.1, dk); st([P(.08, y + 5), P(.92, y + 5)], .5, mixCol(O.s2, '#FFFFFF', .4)); }
      gp(q(0, WIN[1] - 4, .07, WIN[3] + 4), dk); gp(q(.93, WIN[1] - 4, 1, WIN[3] + 4), dk);
    }
  }

  // ---------- rain beaded on a glass pane; map(u, v) puts unit pane coords on screen ----------
  function glassRain(t, map, key, w, h) {
    const O = LL.out, n = Math.round(w * h / 2400);
    for (let i = 0; i < n; i++) {
      boilSeed(key + 'd' + i);
      const [x, y] = map(hash(i * 1.37 + 3), hash(i * 2.71 + 7)), r = 1.2 + 2.6 * hash(i * 5.3);
      gp(ellPts(x, y, r, r * 1.15, 8, 0), mixCol(O.s0, '#000000', .2), 140);
      if (r > 2.4) gp(ellPts(x - r * .3, y - r * .35, r * .4, r * .4, 6, 0), mixCol(O.s2, '#FFFFFF', .5), 200);
    }
    for (let i = 0; i < Math.round(w / 40); i++) {                         // rivulets running down
      const u = hash(i * 9.1 + 1), k = (t * (.18 + .2 * hash(i)) + hash(i * 4.4)) % 1, v0 = k * .8, v1 = Math.min(1, v0 + .25 + .3 * hash(i * 2.2)), pts = [];
      for (let j = 0; j <= 5; j++) { const v = lerp(v0, v1, j / 5); pts.push(map(u + Math.sin(v * 9 + i) * .012, v)); }
      st(pts, .8, mixCol(O.s2, '#FFFFFF', .35));
    }
  }

  // ---------- the room: ceiling, side walls, back wall round the two openings, floor ----------
  function room(t) {
    const O = LL.out;
    boilSeed('room');
    // ceiling boards converge on the vanishing point; two cross beams
    gp(Q([WL - 40, CE, 0], [WR + 40, CE, 0], [WR + 40, CE, ZN], [WL - 40, CE, ZN]), c('ceil'));
    for (let x = WL + 70; x < WR; x += 84) st([pj(x, CE, 0), pj(x, CE, 200), pj(x, CE, ZN)], .7, c('ceilDk'));
    gp(Q([WL, CE, 0], [WR, CE, 0], [WR, CE, 90], [WL, CE, 90]), shd(), 40);
    // side walls: plaster over a teal wainscot
    for (const x of [WL, WR]) {
      gp(Q([x, CE, 0], [x, 640, 0], [x, 640, ZN], [x, CE, ZN]), c('side'));
      gp(Q([x, 640, 0], [x, FL, 0], [x, FL, ZN], [x, 640, ZN]), c('wainsDk'));
      for (let z = 30; z < ZN; z += 34) st([pj(x, 650, z), pj(x, FL - 14, z)], .6, c('wainsDk', .12));
      gp(Q([x, 632, 0], [x, 646, 0], [x, 646, ZN], [x, 632, ZN]), c('trim', .05));
      gp(Q([x, FL - 14, 0], [x, FL, 0], [x, FL, ZN], [x, FL - 14, ZN]), c('skirt'));
      gp(Q([x, CE, 0], [x, FL, 0], [x, FL, 60], [x, CE, 60]), shd(), 50);           // the corner, in shadow
    }
    for (const zb of [230, 470]) box(WL - 40, CE, zb - 26, WR + 40, CE + 30, zb, c('beam'), c('beamDk'));
    // back wall
    holed(WL, CE, WR, 640, c('plaster'));
    holed(WL, 640, WR, FL, c('wains'));
    for (let i = 0; i < 3; i++) {                                           // darker up under the ceiling and into the corners
      holed(WL, CE, WR, CE + 40 + i * 36, shd(), 16);
      holed(WL, CE, WL + 30 + i * 30, FL, shd(), 14);
      holed(WR - 30 - i * 30, CE, WR, FL, shd(), 14);
    }
    for (let x = WL + 22; x < WR; x += 36) if (x < DOOR[0] - 4 || x > DOOR[2] + 4) st([[x, 650], [x, 834]], .7, c('wainsDk'));
    holed(WL, 632, WR, 648, c('trim'));
    holed(WL, 836, WR, FL, c('skirt'));
    // floor: planks converging, plank ends, darker where it meets the wall
    gp(Q([WL - 40, FL, 0], [WR + 40, FL, 0], [WR + 40, FL, ZN], [WL - 40, FL, ZN]), c('floor'));
    for (let i = 0; i < 8; i++) { const x = WL + 28 + Math.floor(hash(i * 5.9) * 30) * 56; gp(Q([x, FL, 0], [x + 56, FL, 0], [x + 56, FL, ZN], [x, FL, ZN]), c('floorLt'), 70); }
    for (let x = WL + 28; x < WR; x += 56) st([pj(x, FL, 0), pj(x, FL, 200), pj(x, FL, ZN)], .7, c('floorDk'));
    for (let i = 0; i < 40; i++) { const x = WL + 28 + Math.floor(hash(i * 3.3) * 30) * 56, z = 20 + hash(i * 7.1) * 500; st([pj(x, FL, z), pj(x + 56, FL, z)], .6, c('floorDk')); }
    gp(Q([WL, FL, 0], [WR, FL, 0], [WR, FL, 60], [WL, FL, 60]), shd(), 60, { curv: .2 });
    // sky light spilling in at the open door
    const spill = (OO.door || 0) * (1 - .5 * O.rain);
    if (spill > .01) {
      gp(Q([196, FL, 0], [424, FL, 0], [560, FL, 420], [80, FL, 420]), mixCol(O.s2, '#FFFFFF', .2), 40 * spill, { curv: .5 });
      gp(Q([206, FL, 0], [414, FL, 0], [470, FL, 200], [160, FL, 200]), mixCol(O.s2, '#FFFFFF', .3), 50 * spill, { curv: .5 });
    }
    // door mat; wet sheen and footprints after the rain came in
    gp(Q([214, FL, 24], [406, FL, 24], [410, FL, 130], [210, FL, 130]), c('mat'));
    st([pj(222, FL, 36), pj(398, FL, 36)], .9, c('matLt')); st([pj(220, FL, 118), pj(400, FL, 118)], .9, c('matLt'));
    if (OO.prints > .01) {
      gp(fl3(310, 80, 150, 70, FL, 20), mixCol(O.s1, c('floor'), .5), 50 * OO.prints, { curv: .5 });
      const bz = (a, b, c3, d, u) => (1 - u) ** 3 * a + 3 * (1 - u) ** 2 * u * b + 3 * (1 - u) * u * u * c3 + u ** 3 * d;
      for (let i = 0; i < 16; i++) {
        const u = .08 + i / 15 * .9, x = bz(330, 420, 1150, 1280, u) + (i % 2 ? 10 : -10), z = bz(90, 480, 520, 250, u);
        gp(fl3(x, z, 13, 5, FL, 10), shd(.1), 70 * OO.prints * (1 - u * .5), { curv: .5 });
      }
    }
    sunPatches();
  }
  // sun through the window (onto the ledge and the floor) and through the open door
  function sunPatches() {
    if (LL.sun <= .01) return;
    const col = LL.sunCol, a = LL.sun, tz = 1 / Math.tan(LL.sunEl), ta = Math.tan(LL.sunAz);
    const yc = Math.max(WIN[1], WIN[3] - 116 / tz);                         // rows below yc land on the ledge instead
    const win = clipZ(sunOn(FL, 0, ZN), ZN);
    if (win.length > 2) {
      // the counter's shadow bites out of the patch
      const d = (FL - 598) * tz, cs = hull([[546, 144], [1174, 144], [1174, 274], [546, 274], [546 - d * ta, 144 + d], [1174 - d * ta, 144 + d], [1174 - d * ta, 274 + d], [546 - d * ta, 274 + d]]);
      for (const piece of minus(win, cs)) gp(piece.map(([x, z]) => pj(x, FL, z)), col, 150 * a);
      if (OO.casement < .5 && a > .5) for (const [x0, y0, x1, y1] of [[1480, WIN[1], 1480, yc], [WIN[0], 380, WIN[2], 380], [WIN[0], 510, WIN[2], 510]]) {
        if (y0 > yc) continue;
        const p = sunHit(x0, Math.min(y0, yc)), q = sunHit(x1, Math.min(y1, yc));
        if (p[1] < ZN && q[1] < ZN) st([pj(p[0], FL, p[1]), pj(q[0], FL, q[1])], 2.4, c('floor'));
      }
    }
    if ((OO.door || 0) > .5) {
      const d = clipZ([[DOOR[0], 0], [DOOR[2], 0], sunHit(DOOR[2], DOOR[1] + 22), sunHit(DOOR[0], DOOR[1] + 22)], ZN);
      if (d.length > 2) gp(d.map(([x, z]) => pj(x, FL, z)), col, 130 * a * (OO.door - .5) * 2, { curv: .12 });
    }
  }

  // ---------- the door: trim, the glazed leaf on its left hinge, the wind chime ----------
  function door(t) {
    boilSeed('door');
    const [x0, y0, x1, y1] = DOOR, O = LL.out;
    gp(Q([x0, y0, 0], [x0, y1, 0], [x0, y1, -22], [x0, y0, -22]), c('side', .08));       // reveal: the wall's thickness
    gp(Q([x0, y0, 0], [x1, y0, 0], [x1, y0, -22], [x0, y0, -22]), c('side', .12));
    gp(Q([x0, y1, -22], [x1, y1, -22], [x1, y1, 4], [x0, y1, 4]), c('woodDk'));          // threshold
    gp(rectPts(x0 - 18, y0 - 18, 18, y1 - y0 + 18), c('trim'));
    gp(rectPts(x1, y0 - 18, 18, y1 - y0 + 18), c('trim'));
    gp(rectPts(x0 - 26, y0 - 30, x1 - x0 + 52, 14), c('trim', .03));
    gp(rectPts(x0 - 18, y0 - 18, x1 - x0 + 36, 18), c('trim'));
    st([[x0 - 26, y0 - 16], [x1 + 26, y0 - 16]], .6, c('plasterSh'));
    // the leaf swings inward
    const th = (OO.door || 0) * 1.42, cs = Math.cos(th), sn = Math.sin(th), Wd = x1 - x0 - 4, hx = x0 + 2;
    const P = (u, y) => pj(hx + Wd * u * cs, y, Wd * u * sn), q = (u0, ya, u1, yb) => [P(u0, ya), P(u1, ya), P(u1, yb), P(u0, yb)];
    const fr = c('door', th > .9 ? .05 : 0), gy = 600;
    gp(q(0, y0 + 2, .12, y1), fr); gp(q(.88, y0 + 2, 1, y1), fr);
    gp(q(.12, y0 + 2, .88, y0 + 24), fr); gp(q(.12, gy, .88, y1), fr);
    gp(q(.22, 650, .78, 806), c('woodDk'), 110);                                         // sunk panel
    gp(q(.22, 650, .78, 656), c('woodLt'), 140);
    gp(q(.12, y0 + 24, .88, gy), mixCol(O.s2, '#FFFFFF', .3), 34);                        // glass sheen
    if (th < .3 && O.rain > .01) glassRain(t, (u, v) => P(.12 + u * .76, y0 + 24 + v * (gy - y0 - 24)), 'dg', .76 * Wd, gy - y0 - 24);
    st([P(.5, y0 + 24), P(.5, gy)], 1.6, fr); st([P(.12, 470), P(.88, 470)], 1.6, fr);   // glazing bars
    const [kx, ky] = P(.9, 650); gp(ellPts(kx, ky, 6 * (1 - .5 * sn), 6, 10, 0), c('brass'));
    // wind chime under the lintel: a little glass bell with a goldfish, its paper strip lagging the swing
    const ang = (OO.chime || 0) * Math.sin(t * 5.2) * .5 + Math.sin(t * 1.1) * .05, cx = 312, cy = y0 + 2;
    const R = (dx, dy, a = ang) => [cx + dx * Math.cos(a) - dy * Math.sin(a), cy + dx * Math.sin(a) + dy * Math.cos(a)];
    st([R(0, 0), R(0, 14)], .6, c('iron'));
    gp([R(-11, 27), R(-9, 17), R(0, 12), R(9, 17), R(11, 27)], mixCol('#CFE4E8', LL.amb, LL.ambK * .6), 210, { curv: .5 });
    gp(ellPts(...R(3, 22), 3, 1.8, 8, 0), '#D8503E', 230);
    st([R(-5, 17), R(-3, 22)], .7, '#FFFFFF');
    st([R(0, 27), R(0, 36)], .5, c('iron'));
    const a2 = ang * 1.7;
    gp([R(-5, 36, a2), R(5, 36, a2), R(5, 74, a2), R(-5, 74, a2)], c('#EFE8D6'), 235);
  }

  // ---------- the window: trim, teal casements opening inward, rain on the glass ----------
  function win(t) {
    boilSeed('win');
    const [x0, y0, x1, y1] = WIN, O = LL.out;
    gp(Q([x1, y0, 0], [x1, y1, 0], [x1, y1, -22], [x1, y0, -22]), c('side', .08));
    gp(Q([x0, y0, 0], [x1, y0, 0], [x1, y0, -22], [x0, y0, -22]), c('side', .12));
    gp(Q([x0, y1, -22], [x1, y1, -22], [x1, y1, 0], [x0, y1, 0]), c('trim', .04));
    gp(rectPts(x0 - 18, y0 - 18, 18, y1 - y0 + 18), c('trim'));
    gp(rectPts(x1, y0 - 18, 18, y1 - y0 + 18), c('trim'));
    gp(rectPts(x0 - 26, y0 - 30, x1 - x0 + 52, 14), c('trim', .03));
    gp(rectPts(x0 - 18, y0 - 18, x1 - x0 + 36, 18), c('trim'));
    const th = (OO.casement || 0) * 1.45, cs = Math.cos(th), sn = Math.sin(th), Wc = (x1 - x0) / 2;
    for (const side of [1, -1]) {
      const hx = side > 0 ? x0 : x1, P = (u, y) => pj(hx + side * Wc * u * cs, y, Wc * u * sn), q = (u0, ya, u1, yb) => [P(u0, ya), P(u1, ya), P(u1, yb), P(u0, yb)];
      const fr = c('sash', th > .9 ? .05 : 0);
      gp(q(.08, y0 + 14, .92, y1 - 16), mixCol(O.s2, '#FFFFFF', .3), 30);
      if (th < .3 && O.rain > .01) glassRain(t, (u, v) => P(.08 + u * .84, y0 + 14 + v * (y1 - y0 - 30)), 'w' + side, Wc * .84, y1 - y0 - 30);
      gp(q(0, y0, .08, y1), fr); gp(q(.92, y0, 1, y1), fr);
      gp(q(.08, y0, .92, y0 + 14), fr); gp(q(.08, y1 - 16, .92, y1), fr);
      for (const ym of [380, 510]) gp(q(.08, ym - 4, .92, ym + 4), fr);
      st([P(.5, y0 + 14), P(.5, y1 - 16)], 1.2, fr);
    }
    if (th < .3 && LL.lamp > .05) {                                        // the ledge lamp mirrored in the glass
      const [rx, ry] = pj(1480, 280, -140);
      glow(rx, ry, 70, '#FFD9A0', LL.lamp * .45);
      gp(ellPts(rx, ry + 10, 16, 3, 10, 0), mixCol('#FFE2B0', O.s1, .3), 110 * LL.lamp);
    }
  }

  // ---------- the back wall's things: clock, umbrella hook, splashback, shelves, life ring, a small painting ----------
  function jar(x, yb, w, h, inside, lid) {
    gp(rrPts(x - w / 2, yb - h, w, h, 6), c('jar'), 200);
    gp(rrPts(x - w / 2 + 3, yb - h * .68, w - 6, h * .68 - 3, 4), c(inside), 230);
    gp(rectPts(x - w / 2 - 1, yb - h - 8, w + 2, 10), c(lid));
    st([[x - w / 2 + 5, yb - h + 6], [x - w / 2 + 5, yb - 8]], 1, c('steelLt'));
  }
  function tin(x, yb, w, h, col) {
    gp(rectPts(x - w / 2, yb - h, w, h), c(col));
    gp(rectPts(x - w / 2, yb - h * .62, w, h * .3), c('cup', .03));
    gp(ellPts(x, yb - h, w / 2, 3, 12, 0), c(col, .1));
  }
  function clock() {
    const x = 470, y = 248, r = 34, hr = LL.clock;
    gp(ellPts(x + 4, y + 5, r + 4, r + 4, 28, 0), shd(), 60);
    gp(ellPts(x, y, r + 4, r + 4, 28, 0), c('wood'));
    gp(ellPts(x, y, r - 3, r - 3, 28, 0), c('cup', .03));
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU, d0 = i % 3 ? r - 8 : r - 11; st([[x + Math.cos(a) * d0, y + Math.sin(a) * d0], [x + Math.cos(a) * (r - 5), y + Math.sin(a) * (r - 5)]], i % 3 ? .6 : 1.2, c('woodDk')); }
    const ah = (hr % 12) / 12 * TAU - Math.PI / 2, am = (hr % 1) * TAU - Math.PI / 2;
    st([[x, y], [x + Math.cos(ah) * 16, y + Math.sin(ah) * 16]], 2, c('iron'));
    st([[x, y], [x + Math.cos(am) * 25, y + Math.sin(am) * 25]], 1.3, c('iron'));
    gp(ellPts(x, y, 2.5, 2.5, 8, 0), c('brass'));
  }
  function shelf(xa, xb, y, items) {
    gp(rectPts(xa + 4, y + 8, xb - xa - 8, 16), shd(), 45, { curv: .3 });              // shadow on the wall
    for (const x of [xa + 30, (xa + xb) / 2, xb - 30]) gp([[x - 4, y + 8], [x + 4, y + 8], [x + 4, y + 34], [x - 4, y + 14]], c('woodDk'));
    items();
    gp(zr(xa, y, xb, y + 10, 36), c('wood'));
    gp(zr(xa, y, xb, y + 3, 36), c('woodLt'));
  }
  function wallStuff(t) {
    boilSeed('wall');
    clock();
    gp(rrPts(462, 402, 36, 26, 5), c('woodDk'));                            // brass hook plaque (the umbrella's future home)
    gp(ellPts(480, 413, 4, 4, 8, 0), c('brass'));
    st([[480, 413], [480, 428], [489, 430]], 1.8, c('brass'));
    // tiled splashback behind the stove
    gp(rectPts(520, 474, 188, 111), c('tile'));
    for (let x = 520; x <= 708; x += 31.3) st([[x, 474], [x, 585]], .5, c('tileLn'));
    for (let y = 474; y <= 585; y += 27.7) st([[520, y], [708, y]], .5, c('tileLn'));
    shelf(536, 1164, 440, () => {
      jar(566, 440, 30, 52, 'tea', 'woodLt'); jar(602, 440, 28, 44, 'teaGreen', 'woodLt'); jar(638, 440, 30, 58, 'tea', 'cupRim');
      for (let i = 0; i < 4; i++) { const yb = 440 - i * 12; gp([[667, yb], [701, yb], [697, yb - 13], [671, yb - 13]], c('cup', .02)); st([[668, yb - 2], [700, yb - 2]], .7, c('cupRim')); }
      const tp = c('#4E8A86');                                              // teal enamel teapot
      st([[728, 424], [716, 412], [722, 398], [734, 404]], 2.4, tp);
      gp([[782, 420], [806, 396], [812, 398], [792, 428]], tp, 255, { curv: .3 });
      gp(ellPts(758, 419, 30, 21, 22, 0), tp);
      gp(ellPts(748, 412, 9, 6, 10, -.4), c('#9CC6BE'), 200);
      gp(ellPts(758, 398, 16, 5, 12, 0), c('#3E716E')); gp(ellPts(758, 391, 4, 4, 8, 0), c('#3E716E'));
      tin(826, 440, 34, 48, '#B4583E'); tin(864, 440, 30, 40, '#3F5E8C');
      for (const [px, py] of [[930, 410], [968, 413]]) { gp(ellPts(px, py, 29, 29, 24, 0), c('cup')); gp(ellPts(px, py, 22, 22, 22, 0), c('cup', .06)); st(ellPts(px, py, 25, 25, 24, 0).concat([[px + 25, py]]), .8, c('cupRim')); }
      gp(ellPts(1036, 414, 24, 24, 22, 0), c('#6FA89A'), 220);              // glass float in a rope net
      gp(ellPts(1028, 406, 7, 6, 10, 0), c('#D8EEE6'), 200);
      for (const d of [-14, 0, 14]) st([[1036 + d - 12, 392], [1036 + d, 414], [1036 + d - 6, 436]], .6, c('rope'));
      st([[1016, 404], [1036, 412], [1058, 406]], .6, c('rope'));
      gp([[1104, 440], [1144, 440], [1148, 410], [1100, 410]], c('pot'));
      for (let i = 0; i < 6; i++) gp(ellPts(1110 + i * 7, 402 - (i % 2) * 6, 10, 6, 10, 0, -.6 + i * .25), c(i % 2 ? 'leafLt' : 'leaf'));
    });
    // the pothos trails over the shelf edge
    for (let v = 0; v < 3; v++) {
      const P = [[1110 + v * 14, 444], [1102 + v * 22 + Math.sin(t * .8 + v) * 2, 500 + v * 20], [1094 + v * 30, 540 + v * 34]];
      st(P, .8, c('leafDk'));
      for (let i = 1; i < 6; i++) { const u = i / 6, p = [lerp(P[0][0], P[2][0], u) + Math.sin(u * 6 + v) * 6, lerp(P[0][1], P[2][1], u)]; gp(ellPts(p[0] + (i % 2 ? 6 : -6), p[1], 7, 5, 10, 0, i % 2 ? .5 : -.5), c(i % 2 ? 'leafLt' : 'leaf')); }
    }
    // shelf 2 sits under the lamps: only low things below them, the tall sailboat mast between them
    shelf(600, 1100, 334, () => {
      jar(628, 334, 26, 40, 'sugar', 'woodLt'); jar(662, 334, 28, 50, 'teaGreen', 'cupRim');
      gp(ellPts(716, 324, 28, 10, 18, 0), c('cup')); gp(ellPts(716, 314, 24, 9, 16, 0), c('cup', .06)); st([[690, 324], [716, 332], [744, 324]], .7, c('cupRim'));
      const bk = ['#7A4A3A', '#3F5E6C', '#C9A04E', '#5E7A52', '#8A5A6E'];
      for (let i = 0; i < 4; i++) gp(rectPts(752 + i * 15, 334 - 50 - (i % 2) * 8, 13, 50 + (i % 2) * 8), c(bk[i]));
      gp([[814, 334], [826, 334], [846, 288], [834, 284]], c(bk[4]));
      gp([[852, 320], [932, 320], [922, 334], [862, 334]], c('#B5543E'));     // model sailboat
      gp(rectPts(852, 320, 80, 4), c('cup'));
      st([[892, 236], [892, 320]], 1, c('woodDk'));
      gp([[895, 242], [895, 314], [930, 314]], c('cup'), 255, { curv: .2 }); gp([[889, 250], [889, 312], [862, 312]], c('cup', .05), 255, { curv: .2 });
      gp([[950, 334], [978, 334], [982, 312], [946, 312]], c('pot'));
      for (let i = 0; i < 5; i++) gp(ellPts(954 + i * 6, 302 - (i % 2) * 6, 8, 6, 10, 0), c(i % 2 ? 'leafLt' : 'leaf'));
      tin(1018, 334, 36, 44, '#C9A04E');
      jar(1068, 334, 26, 38, 'tea', 'woodLt');
    });
    // life ring on the left wall, a small sea painting on the right wall
    const ring = (r, a) => pj(WL + 3, 400 + Math.sin(a) * r, 110 + Math.cos(a) * r);
    for (let s = 0; s < 8; s++) {
      const a0 = s / 8 * TAU, a1 = (s + 1) / 8 * TAU, P = [];
      for (let i = 0; i <= 4; i++) P.push(ring(52, lerp(a0, a1, i / 4)));
      for (let i = 4; i >= 0; i--) P.push(ring(32, lerp(a0, a1, i / 4)));
      gp(P, c(s % 2 ? 'ring' : 'ringRed'));
    }
    const rp = []; for (let i = 0; i <= 16; i++) rp.push(ring(56, i / 16 * TAU)); st(rp, 1, c('rope'));
    gp(Q([WR - 2, 294, 34], [WR - 2, 294, 136], [WR - 2, 386, 136], [WR - 2, 386, 34]), c('wood'));
    gp(Q([WR - 2, 302, 42], [WR - 2, 302, 128], [WR - 2, 342, 128], [WR - 2, 342, 42]), c('#A9C2CA'));
    gp(Q([WR - 2, 342, 42], [WR - 2, 342, 128], [WR - 2, 378, 128], [WR - 2, 378, 42]), c('#4E7A86'));
    gp(Q([WR - 2, 336, 60], [WR - 2, 330, 90], [WR - 2, 342, 110], [WR - 2, 342, 56]), c('#7E9AA2'));
  }

  // ---------- the back bar: cupboard, enamel stove and the copper kettle, tea sock, water urn, glasses ----------
  function kettle(t) {
    if (OO.noKettle) return;                                                 // Ton has it in his hand
    const x = 585, yb = 553, k = OO.kettle || 0;
    if (k > .05) { for (let i = 0; i < 5; i++) { const fx = x - 20 + i * 10, fh = (6 + 4 * Math.sin(t * 13 + i * 2)) * k; gp([[fx - 3, yb + 2], [fx + 3, yb + 2], [fx, yb + 2 - fh]], '#7E9CFF', 220); } glow(x, yb, 40, '#8FB0FF', .5 * k); }
    gp(ellPts(x, yb - 22, 36, 24, 24, 0), cw('copper', .3));
    gp(ellPts(x + 10, yb - 18, 24, 18, 18, 0), c('copperDk'), 120);
    gp(ellPts(x - 14, yb - 30, 10, 7, 12, 0, -.4), c('copperLt'), 220);
    gp(rectPts(x - 26, yb - 4, 52, 5), c('copperDk'));
    gp([[x + 28, yb - 20], [x + 36, yb - 26], [x + 56, yb - 50], [x + 61, yb - 47], [x + 40, yb - 14]], c('copper'), 255, { curv: .3 });
    gp(ellPts(x, yb - 46, 14, 4, 12, 0), c('copperDk')); gp(ellPts(x, yb - 52, 4, 4, 8, 0), c('woodDk'));
    st([[x - 24, yb - 38], [x - 20, yb - 70], [x + 20, yb - 70], [x + 24, yb - 38]], 2.2, c('woodDk'));
    if (k > .3) for (let i = 0; i < 3; i++) {                              // steam curling off the spout
      const s = (t * .6 + i / 3) % 1, sx = x + 60 + s * 30 + Math.sin(t * 2 + i * 2) * 6, sy = yb - 54 - s * 90;
      gp(ellPts(sx, sy, 8 + s * 22, 6 + s * 14, 12, 0), '#F4F0EA', 150 * (1 - s) * k, { curv: .5 });
    }
  }
  function backbar(t) {
    boilSeed('bar');
    box(516, 585, 0, 1184, FL, 70, c('wood', .04), cw('woodLt', .4), c('woodDk'));
    gp(zr(516, 585, 1184, 592, 70), c('woodDk'));
    for (let x = 516 + 167; x < 1184; x += 167) st([pj(x, 600, 70), pj(x, FL - 20, 70)], .7, c('woodDk'));
    box(540, 555, 10, 690, 585, 60, c('enamel'), c('enamelDk'), c('enamelDk'));           // two-ring enamel stove
    gp(zr(552, 566, 678, 578, 60), c('enamelDk'));
    kettle(t);
    const sx = 740;                                                          // the tea sock on its wire stand, the pitcher under it
    st([[sx - 22, 585], [sx - 22, 500]], 1.4, c('steelDk')); st([[sx + 22, 585], [sx + 22, 500]], 1.4, c('steelDk'));
    st([[sx - 22, 500], [sx, 494], [sx + 22, 500]], 1.2, c('steelDk'));
    gp(ellPts(sx, 506, 16, 4, 12, 0), c('steelDk'));
    gp([[sx - 15, 506], [sx + 15, 506], [sx + 8, 540], [sx, 556], [sx - 8, 540]], c('cloth', .02), 255, { curv: .5 });
    gp([[sx - 6, 530], [sx + 8, 528], [sx, 554]], c('clothDk'), 180, { curv: .5 });
    gp([[sx - 18, 585], [sx + 18, 585], [sx + 16, 556], [sx - 16, 556]], c('steel'));
    gp([[sx - 16, 558], [sx - 4, 558], [sx - 6, 584], [sx - 14, 584]], c('steelLt'), 160);
    st([[sx + 16, 562], [sx + 28, 568], [sx + 16, 578]], 1.4, c('steelDk'));
    const ux = 990, uw = 76;                                                 // steel water urn
    gp(rectPts(ux - 44, 500, 8, 18), c('steelDk')); gp(rectPts(ux + 36, 500, 8, 18), c('steelDk'));
    gp(rrPts(ux - uw / 2, 476, uw, 109, 8), c('steel'));
    gp(rectPts(ux + 10, 480, 24, 100), c('steelDk'), 140);
    gp(rectPts(ux - 26, 480, 10, 100), c('steelLt'), 200);
    gp(ellPts(ux, 474, uw / 2 - 4, 6, 18, 0), c('steelDk')); gp(ellPts(ux, 466, 8, 6, 10, 0), c('iron'));
    st([[ux - uw / 2, 520], [ux + uw / 2, 520]], .7, c('steelDk')); st([[ux - uw / 2, 546], [ux + uw / 2, 546]], .7, c('steelDk'));
    gp(rectPts(ux - 5, 560, 10, 12), c('brass')); gp(rectPts(ux - 2, 556, 4, 6), c('iron'));
    gp(rectPts(1056, 580, 92, 5), c('woodDk'));                             // glasses upside down on a tray, the sugar jar
    for (let i = 0; i < 4; i++) { const gx = 1068 + i * 22; gp([[gx - 10, 580], [gx + 10, 580], [gx + 8, 556], [gx - 8, 556]], c('cup', .02), 200); st([[gx - 6, 576], [gx - 6, 560]], .6, '#FFFFFF'); }
    jar(1166, 585, 26, 40, 'sugar', 'cupRim');
  }

  // ---------- the broken umbrella, folded: a story prop, so it keeps the cast's line ----------
  // origin at the top of the J handle; leans by ang
  function umbBundle(x, y, ang, s, t) {
    const C = CAST, R = (dx, dy) => [x + (dx * Math.cos(ang) - dy * Math.sin(ang)) * s, y + (dx * Math.sin(ang) + dy * Math.cos(ang)) * s];
    const L = (a, w = 1) => inkLine(a.map(([dx, dy]) => R(dx, dy)), w * C.swK * s, C.ink, 'ink', .5);
    L([[-16, 22], [-14, 6], [0, 0], [6, 12], [4, 40]], 2.4);                           // J handle
    L([[3, 40], [2, 140], [0, 238]], 1.2);                                              // shaft
    // ribs poking out bare where the canopy tore away
    L([[10, 96], [34, 128], [54, 150]], .9); L([[-8, 150], [-30, 182], [-44, 214]], .9);
    const fl = Math.sin(t * 3) * 4;
    inked([[0, 64], [16, 80], [26, 112], [22, 150], [12, 184], [4, 206], [-6, 190], [-20, 160], [-24, 120], [-14, 84]].map(([dx, dy]) => R(dx, dy)), C.umb, { curv: .45 });
    paint([[2, 74], [14, 92], [20, 130], [10, 176], [4, 196]].map(([dx, dy]) => R(dx, dy)), { wash: '#9A3A2E', washOp: 150, ink: null, curv: .5 });
    L([[-6, 90], [-10, 130], [-4, 176]], .6); L([[8, 100], [10, 140], [6, 180]], .6);   // folds
    inked([[18, 124], [40, 132 + fl], [46, 152 + fl], [24, 146]].map(([dx, dy]) => R(dx, dy)), C.umb, { curv: .3, sw: .8 });
    L([[0, 238], [0, 252]], 1.6);                                                       // ferrule
  }
  function props(t) {
    if (OO.umb === 'hook') umbBundle(476, 406, .03, 1, t);
    if (OO.umb === 'lean') {
      const O = LL.out;
      gp(fl3(432, 14, 44, 13, FL, 18), mixCol(shd(), O.s1, .3), 110, { curv: .5 });    // the puddle it made
      gp(fl3(426, 12, 20, 4, FL, 12), mixCol(O.s2, '#FFFFFF', .2), 90, { curv: .5 });
      umbBundle(454, 598, .085, 1.0, t);
    }
  }

  // ---------- the window ledge, its plant, and the stools ----------
  function stool(x, z, h, seat) {
    const yt = FL - h, r = 38, f = fz(z);
    const leg = (dx, dz) => { const a = pj(x + dx * .7, yt + 10, z + dz * .7), b = pj(x + dx * 1.15, FL, z + dz * 1.15), w = 4.5 * f; gp([[a[0] - w, a[1]], [a[0] + w, a[1]], [b[0] + w, b[1]], [b[0] - w, b[1]]], c('woodDk')); };
    gp(fl3(x, z, r * 1.3, r * 1.1, FL, 16), shd(), 70, { curv: .5 });
    leg(-26, -26); leg(26, -26);
    const ringP = fl3(x, z, r * 1.02, r * 1.02, FL - 95, 20); ringP.push(ringP[0]); st(ringP, 1.6, c('woodDk'));
    leg(-26, 26); leg(26, 26);
    gp(fl3(x, z, r, r, yt + 12, 22), c('woodDk'));
    gp(fl3(x, z, r, r, yt, 22), cw(seat, .3));
    gp(fl3(x - 8, z - 8, r * .5, r * .4, yt, 14), cw(seat, .3, -.06), 120);
  }
  function ledge(t) {
    boilSeed('ledge');
    gp(rectPts(1196, 656, 568, 44), shd(), 60, { curv: .3 });
    for (const x of [1250, 1480, 1710]) gp(Q([x, 656, 4], [x, 656, 100], [x, 740, 4]), c('woodDk'));
    box(1196, 640, 0, 1764, 656, 116, c('woodDk'), cw('woodLt', .5), c('wood'));
    if (LL.sun > .01) { const P = sunOn(640, 0, 116, 1196, 1764); if (P.length > 2) gp(P.map(([x, z]) => pj(x, 640, z)), LL.sunCol, 150 * LL.sun); }
    const [px, py] = pj(1736, 640, 60), f = fz(60);                          // a leafy plant at the far end
    gp([[px - 22 * f, py], [px + 22 * f, py], [px + 26 * f, py - 40 * f], [px - 26 * f, py - 40 * f]], c('pot'));
    gp(rectPts(px - 28 * f, py - 46 * f, 56 * f, 8 * f), c('potDk'));
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i - 4.5) * .3 + Math.sin(t * .7 + i) * .03, Lf = (44 + 30 * hash(i * 3.7)) * f, bx = px + (i - 4.5) * 3 * f, by = py - 46 * f;
      gp(ellPts(bx + Math.cos(a) * Lf / 2, by + Math.sin(a) * Lf / 2, Lf / 2, 8 * f, 12, 0, a), c(['leaf', 'leafLt', 'leafDk'][i % 3]));
    }
    stool(1300, 200, 180, 'woodLt');                                         // Mai's window stool
  }

  // ---------- pendant lamps: green enamel cones on long cords ----------
  // shade top [sx, sy] and bulb [sx, by] on screen; the shade hangs at 250..300, above shelf 2's things
  const lampPos = (lx, lz, t) => { const [sx, sy] = pj(lx + Math.sin(t * .7 + lx) * 1.5, 250, lz); return [sx, sy + 53 * fz(lz), sy]; };
  function lampAt(lx, lz, t) {
    boilSeed('lamp' + lx);
    const f = fz(lz), [sx, , sy] = lampPos(lx, lz, t), r0 = 12 * f, r1 = 48 * f, by = sy + 50 * f, on = LL.lamp > .05;
    gp([[sx - r0, sy], [sx + r0, sy], [sx + r1, by], [sx - r1, by]], c('shade'), 255, { curv: .2 });
    gp([[sx - r0 * .6, sy + 2], [sx - r0 * .1, sy + 2], [sx - r1 * .45, by - 2], [sx - r1 * .85, by - 2]], c('#7FA59C'), 200, { curv: .2 });
    gp(ellPts(sx, by, r1, 6 * f, 20, 0), on ? mixCol(B.shadeIn, '#FFE2A8', LL.lamp) : c('shadeIn', .1));
    gp(ellPts(sx, by + 3 * f, 10 * f, 7 * f, 12, 0), on ? '#FFF4D8' : c('cup', .1));
  }
  function lamps(t) {
    boilSeed('cords');
    for (const [lx, lz] of LAMPS) { const [cx, cy] = pj(lx, CE, lz), [sx, , sy] = lampPos(lx, lz, t); st([[cx, cy], [sx, sy]], .9, c('iron')); }
    for (const [lx, lz] of LAMPS) lampAt(lx, lz, t);
  }

  // ---------- the counter: teal boarded front, honey-wood top, a few things on it ----------
  function glassAt(x, z) {
    const [gx, gy] = pj(x, 598, z), f = fz(z), w0 = 15 * f, w1 = 12 * f, h = 34 * f;
    inked([[gx - w0, gy - h], [gx + w0, gy - h], [gx + w1, gy], [gx - w1, gy]], c('cup'), { op: 210, curv: .3 });
    gp([[gx - w0 + 3, gy - h * .78], [gx + w0 - 3, gy - h * .78], [gx + w1 - 3, gy - 3], [gx - w1 + 3, gy - 3]], cw(CAST.tea, .5), 230, { curv: .3 });
  }
  function counter(t) {
    boilSeed('counter');
    const xa = 560, xb = 1160, zf = 260, yt = 598;
    gp(fl3((xa + xb) / 2, zf + 12, (xb - xa) / 2 + 40, 22, FL, 24), shd(), 60, { curv: .5 });
    gp(zr(xa, yt + 16, xb, FL, zf), c('wains', .04));
    for (let x = xa, i = 0; x < xb; x += 40, i++) { const h = hash(i * 3.7 + 1); if (h > .5) gp(zr(x + 1, yt + 18, x + 39, FL - 32, zf), c(h > .78 ? 'wainsLt' : 'wainsDk'), 46); }
    for (let x = xa + 40; x < xb; x += 40) st([pj(x, yt + 20, zf), pj(x, FL - 32, zf)], .7, c('wainsDk'));
    gp(zr(xa, yt + 16, xb, yt + 50, zf), shd(), 80, { curv: .2 });
    gp(zr(xa, FL - 130, xb, FL - 32, zf), shd(), 34, { curv: .3 });
    gp(zr(xa, FL - 32, xb, FL, zf), c('woodDk'));
    const fy = FL - 70, fzr = zf + 26;                                      // brass foot rail on three brackets
    for (const x of [xa + 60, (xa + xb) / 2, xb - 60]) gp(Q([x - 5, fy - 3, zf], [x + 5, fy - 3, zf], [x + 5, fy + 3, fzr], [x - 5, fy + 3, fzr]), c('brass', .15));
    gp(zr(xa + 24, fy - 5, xb - 24, fy + 5, fzr), cw('brass', .4));
    gp(zr(xa + 24, fy - 5, xb - 24, fy - 2, fzr), cw('#F0D898', .4), 220);
    box(xa - 14, yt, 144, xb + 14, yt + 16, 274, c('woodDk'), cw('woodLt', .8), c('wood'));
    gp(zr(xa - 14, yt, xb + 14, yt + 4, 274), cw('woodLt', .8, -.05), 200);
    if (LL.sun > .01) { const P = sunOn(yt, 144, 274, xa - 14, xb + 14); if (P.length > 2) gp(P.map(([x, z]) => pj(x, yt, z)), LL.sunCol, 150 * LL.sun); }
    // a succulent, the cookie jar, any glasses left behind
    const [sx, sy] = pj(604, yt, 200), sf = fz(200);
    gp([[sx - 16 * sf, sy], [sx + 16 * sf, sy], [sx + 19 * sf, sy - 24 * sf], [sx - 19 * sf, sy - 24 * sf]], c('pot'));
    for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * .42; gp(ellPts(sx + Math.cos(a) * 12 * sf, sy - 26 * sf + Math.sin(a) * 9 * sf, 9 * sf, 5 * sf, 10, 0, a), c(i % 2 ? 'leafLt' : '#7FA88A')); }
    const [jx, jy] = pj(1114, yt, 196), jf = fz(196), jw = 22 * jf, jh = 46 * jf;
    gp(rrPts(jx - jw, jy - jh, 2 * jw, jh, 8 * jf), c('jar'), 170);
    for (let i = 0; i < 4; i++) gp(ellPts(jx - 9 * jf + (i % 2) * 18 * jf, jy - 10 * jf - Math.floor(i / 2) * 14 * jf, 9 * jf, 6 * jf, 10, 0), c('#C89A5E'), 230);
    gp(rectPts(jx - jw - 2, jy - jh - 6 * jf, 2 * jw + 4, 8 * jf), c('cupRim'));
    gp(ellPts(jx, jy - jh - 9 * jf, 5 * jf, 4 * jf, 8, 0), c('cupRim'));
    st([[jx - jw + 5, jy - jh + 6], [jx - jw + 5, jy - 6]], 1, '#FFFFFF');
    for (let i = 0; i < (OO.glasses || 0); i++) glassAt(930 + i * 58, 236 - i * 12);
  }
  function stools() { for (const x of [640, 860, 1080]) stool(x, 330, 172, 'shade'); }

  // ---------- air: lamp halos and pools, sun shafts with dust, the window's bloom, lightning ----------
  function airFX(t) {
    const O = LL.out, day = O.sunA * .5 + (1 - O.rain) * .25;
    glow(1480, 440, 420, mixCol(O.s2, '#FFFFFF', .3), day * (.35 + .65 * (OO.casement || 0)) * .6);
    glow(310, 560, 360, mixCol(O.s2, '#FFFFFF', .3), day * (OO.door || 0) * .5);
    if (LL.lamp > .01) for (const [lx, lz] of LAMPS) {
      const f = fz(lz), [sx, by] = lampPos(lx, lz, t);
      glow(sx, by, 200 * f, '#FFB866', .5 * LL.lamp);
      glow(sx, by, 64 * f, '#FFE4B0', .85 * LL.lamp);
      lampAt(lx, lz, t);                                                   // the enamel stays dark against its own glow
      glow(sx, by, 22 * f, '#FFFFFF', .6 * LL.lamp);
      const [px, py] = lx < 1200 ? pj(lx, 598, lz) : pj(lx, 640, 58);
      pool(px, py, 200 * f, .28, '#FFC98A', .25 * LL.lamp);
    }
    if (LL.sun > .01) {
      const tz = 1 / Math.tan(LL.sunEl), yc = Math.max(WIN[1], WIN[3] - 116 / tz), a = LL.sun, col = LL.sunCol;
      const wc = [[WIN[0], WIN[1]], [WIN[2], WIN[1]], [WIN[0], yc], [WIN[2], yc]], P3 = [];
      for (const [x, y] of wc) { P3.push(pj(x, y, 0)); const [hx, hz] = sunHit(x, y); const zz = Math.min(hz, ZN), k = zz / hz; P3.push(pj(x + (hx - x) * k, y + (FL - y) * k, zz)); }
      const H = hull(P3);
      gp(H, col, 28 * a); gp(H, col, 18 * a, { curv: .5 });
      if ((OO.door || 0) > .5) {
        const D = [];
        for (const [x, y] of [[DOOR[0], DOOR[1] + 22], [DOOR[2], DOOR[1] + 22], [DOOR[0], FL], [DOOR[2], FL]]) { D.push(pj(x, y, 0)); const [hx, hz] = sunHit(x, y); const zz = Math.min(hz, ZN), k = hz > 0 ? zz / hz : 0; D.push(pj(x + (hx - x) * k, y + (FL - y) * k, zz)); }
        gp(hull(D), col, 14 * a * (OO.door - .5) * 2);
      }
      for (let i = 0; i < 28; i++) {                                         // dust turning in the light
        boilSeed('mote' + i);
        const u = hash(i * 1.9), v = hash(i * 3.3), w = .15 + .7 * hash(i * 5.1), x0 = lerp(WIN[0], WIN[2], u), y0 = lerp(WIN[1], yc, v), [hx, hz] = sunHit(x0, y0);
        const zz = Math.min(hz, ZN) * w, k = hz > 0 ? zz / hz : 0, dx = Math.sin(t * .4 + i) * 10, dy = Math.sin(t * .27 + i * 2) * 8;
        const [mx, my] = pj(x0 + (hx - x0) * k + dx, y0 + (FL - y0) * k + dy, zz);
        gp(ellPts(mx, my, 1.6, 1.6, 6, 0), mixCol(col, '#FFFFFF', .4), 150 * a * (.5 + .5 * Math.sin(t * 1.3 + i * 4)));
      }
    }
    if (OO.flash > .01) { glow(1480, 445, 760, '#DCE6FF', OO.flash); glow(310, 470, 420, '#DCE6FF', OO.flash * .6); }
  }

  // ---------- light: a multiply glaze darkens the room away from its lights, as a painter glazes the shadows ----------
  // Lit in world space through the camera at a third of the resolution; the openings keep the outside's own light.
  let LM = null;
  const rgba = (h, a) => `rgba(${parseInt(h.slice(1, 3), 16)},${parseInt(h.slice(3, 5), 16)},${parseInt(h.slice(5, 7), 16)},${clamp(a)})`;
  function lightPass(t) {
    if (!LM) { LM = createGraphics(640, 360); LM.pixelDensity(1); }
    const g = LM.drawingContext, O = LL.out, cm = CAM || { cx: 960, cy: 540, zoom: 1, rot: 0 }, s = 640 / W;
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over';
    g.fillStyle = LL.shade; g.fillRect(0, 0, 640, 360);
    g.setTransform(s, 0, 0, s, 0, 0); g.translate(W / 2, H / 2); g.rotate(cm.rot || 0); g.scale(cm.zoom, cm.zoom); g.translate(-cm.cx, -cm.cy);
    // openings keep the outside's light (hole < 1 when the outside itself is dark); lamp shades in front of them stay shaded
    const hole = LL.hole ?? 1;
    g.fillStyle = mixCol(LL.shade, '#FFFFFF', hole * (.35 + .65 * (OO.shutter ?? 1)));
    g.fillRect(WIN[0] + 10, WIN[1] + 10, WIN[2] - WIN[0] - 20, WIN[3] - WIN[1] - 26);
    g.fillStyle = mixCol(LL.shade, '#FFFFFF', hole);
    if ((OO.door || 0) > .3) g.fillRect(DOOR[0] + 4, DOOR[1] + 4, DOOR[2] - DOOR[0] - 8, DOOR[3] - DOOR[1] - 4);
    else g.fillRect(DOOR[0] + 32, DOOR[1] + 26, DOOR[2] - DOOR[0] - 64, 600 - DOOR[1] - 28);
    g.fillStyle = LL.shade;
    for (const [lx, lz] of LAMPS) {
      const f = fz(lz), [sx, , sy] = lampPos(lx, lz, t), r0 = 14 * f, r1 = 51 * f, by = sy + 58 * f;
      g.beginPath(); g.moveTo(sx - r0, sy - 2); g.lineTo(sx + r0, sy - 2); g.lineTo(sx + r1, by); g.lineTo(sx - r1, by); g.closePath(); g.fill();
    }
    g.globalCompositeOperation = 'lighter';
    const lit = (x, y, r, col, a, sq = 1) => {
      if (a <= .01) return;
      g.save(); g.translate(x, y); g.scale(1, sq);
      const gr = g.createRadialGradient(0, 0, 0, 0, 0, r);
      gr.addColorStop(0, rgba(col, a)); gr.addColorStop(.4, rgba(col, a * .6)); gr.addColorStop(1, rgba(col, 0));
      g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r, 0, TAU); g.fill(); g.restore();
    };
    const sky = mixCol(O.s2, '#FFFFFF', .35), shut = .15 + .85 * (OO.shutter ?? 1);
    lit(1480, 500, 1000, sky, LL.winL * (.6 + .4 * (OO.casement || 0)) * shut);
    lit(310, 640, 760, sky, LL.winL * (.3 + .7 * (OO.door || 0)));
    if (LL.lamp > .01) for (const [lx, lz] of LAMPS) {
      const f = fz(lz), [bx, by] = lampPos(lx, lz, t), [px, py] = lx < 1200 ? pj(lx, 598, lz) : pj(lx, 640, 58);
      lit(bx, by, 620 * f, '#FFC890', .5 * LL.lamp);
      lit(bx, by + 60 * f, 260 * f, '#FFE0B4', .45 * LL.lamp);
      lit(px, py, 380 * f, '#FFD49C', .45 * LL.lamp, .35);
    }
    if ((OO.kettle || 0) > .05) lit(585, 553, 150, '#8CA6FF', .3 * OO.kettle);
    if (LL.sun > .01) lit(1250, 980, 760, LL.sunCol, .3 * LL.sun, .45);      // bounce off the sunlit floor
    if (OO.flash > .01) { g.fillStyle = rgba('#DCE6FF', OO.flash); g.fillRect(-3000, -3000, 8000, 8000); }
    g.globalCompositeOperation = 'source-over';
    flushBrush();
    push(); resetMatrix(); translate(-W / 2, -H / 2); blendMode(MULTIPLY); image(LM, 0, 0, W, H); blendMode(BLEND); pop();
  }

  // ---------- screen-space vignette (call after camEnd) ----------
  function vignette(L) {
    const col = mixCol('#1E1A24', L.amb, .25);
    for (let i = 0; i < 3; i++) {
      const m = 110 + i * 70;
      gp(rectPts(-80, -80, W + 160, m), col, 20, { curv: .5 });
      gp(rectPts(-80, H + 80 - m, W + 160, m), col, 24, { curv: .5 });
      gp(rectPts(-80, -80, m, H + 160), col, 20, { curv: .5 });
      gp(rectPts(W + 80 - m, -80, m, H + 160), col, 20, { curv: .5 });
    }
  }

  function set(t, L, o = {}, layers = {}) {
    LL = L; OO = { door: 0, shutter: 1, casement: 0, kettle: 0, chime: 0, prints: 0, glasses: 0, flash: 0, ...o };
    outside(t); outer(t); room(t); door(t); win(t); wallStuff(t); backbar(t); props(t); ledge(t);
    if (layers.back) layers.back();
    lamps(t); counter(t);
    if (layers.mid) layers.mid();
    stools();
    if (layers.front) layers.front();
    lightPass(t);
    airFX(t);
  }
  // the cast takes the room's light too
  const CAST0 = { ...CAST };
  function lightCast(L, k = 1) { for (const key in CAST0) if (typeof CAST0[key] === 'string' && CAST0[key][0] === '#') CAST[key] = mixCol(CAST0[key], L.amb, clamp(L.ambK * k)); }
  function unlightCast() { Object.assign(CAST, CAST0); }
  const at = (x, z) => { const [sx, sy] = pj(x, FL, z); return [sx, sy, fz(z)]; };
  window.INT = { set, at, pj, fz, L: LS, OUT, mixL: mixO, vignette, lightCast, unlightCast, FL };

  // ---------- look-dev frames (t 10–14): one per light state ----------
  const dev = (L, o, cast) => t => {
    camBegin(960, 540, 1);
    lightCast(L, .9); set(t, L, o, cast(t)); unlightCast();
    camEnd();
    vignette(L);
  };
  const tonAt = (e, f) => () => { const [x, y, k] = at(880, 100); boilSeed('ton'); ton(x, y, .82 * k, e, f, 'cup'); };
  devShots([
    [10, dev(LS.morning, { door: 1, shutter: 1, casement: 1, gull: 'deck', kettle: .4, chime: .4 }, () => ({ back: tonAt({ eyes: 'half', mouth: 'smile', look: -1 }, -1) }))],
    [11, dev(LS.rain, { prints: 1, umb: 'lean', kettle: 1 }, t => ({
      back: () => {
        tonAt({ eyes: 'open', mouth: 'flat', look: 1, brow: .3 }, 1)();
        const [mx, my] = pj(1300, FL - 180, 200); boilSeed('mai'); mai(mx, my, .82 * fz(200), { eyes: 'half', mouth: 'smile', look: 1, tilt: .5, towel: true }, -1, 'sitCup', t);
      },
    }))],
    [12, dev(LS.gold, { door: 1, shutter: 1, casement: 1, umb: 'lean', kettle: .2, gull: 'rail' }, t => ({
      back: tonAt({ eyes: 'open', mouth: 'smile', look: -1 }, -1),
      mid: () => { const [x, y, k] = at(470, 300); boilSeed('mai'); mai(x, y, .82 * k, { eyes: 'happy', mouth: 'smile', tilt: -.5, drip: false }, 1, 'stand', t); },
    }))],
    [13, dev(LS.dusk, { umb: 'hook', glasses: 2, kettle: .2 }, () => ({ back: tonAt({ eyes: 'half', mouth: 'smile', look: 1 }, 1) }))],
    [14, dev(LS.dim, { shutter: 0 }, () => ({ back: tonAt({ eyes: 'open', mouth: 'flat', look: 1 }, 1) }))],
    [15, dev(LS.grey, { kettle: .6, glasses: 1, gull: 'rail' }, () => ({ back: tonAt({ eyes: 'half', mouth: 'flat', look: -1 }, -1) }))],
  ]);
})();
