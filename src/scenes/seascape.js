// seascape.js: EXT wide seascape, the establishing world of the tale (shots 01, 09, 18, 25).
// An old pier runs from the dune out to sea; the tea shop (same building as ghibli.js) stands on a platform at its end.
//   EXT.wide(t, L, o): draws everything under the caller's camera (camBegin before; camEnd, then EXT.vignette(L) after).
//   L: a light state, EXT.L.dawn|grey|gold|dusk, or EXT.mixL(a, b, u) between two (the grey time-lapse)
//   o: lights 0..1 (shop, string lights, pier lamps; default L.lights), rain 0..1, rays 0..1 (god rays through a cloud gap),
//      sweep 0..1 (the gold band runs over the water from the horizon to the shop), cover 0..1 (× L.cloud), drift (px, clouds)
// Same rules as ghibli.js: gouache washes with no outlines; the only warm light in the world is the shop's.
// Projection: a pinhole on the dune, eye EYE m above the sea (the plane y = 0), horizon at screen y HZ; x right, z away (m).
(() => {
  const HZ = 400, FOC = 1400, EYE = 12, CX = 960, DECK = 2.2;
  const pj = (x, y, z) => [CX + x * FOC / z, HZ + (EYE - y) * FOC / z];
  const P3 = (...p) => p.map(q => pj(...q));
  const sm = u => u * u * (3 - 2 * u);
  // the pier: centre line PA → PB in (x, z), half width PW; pn is the side that faces us
  const PA = [-9, 13], PB = [4.5, 47], PW = 1.6;
  const pd = [PB[0] - PA[0], PB[1] - PA[1]], pl = Math.hypot(...pd), pn = [pd[1] / pl, -pd[0] / pl];
  const pier = (s, side) => [PA[0] + pd[0] * s + pn[0] * PW * side, PA[1] + pd[1] * s + pn[1] * PW * side];
  // the shop body X SX0..SX1, front z SZ0, back SZ1; the shed roof rises away from us (wall top WT0 front, WT1 back)
  const SX0 = 4, SX1 = 11, SZ0 = 49, SZ1 = 55, WT0 = 6.0, WT1 = 6.7;
  const PX0 = 1.5, PX1 = 13, PZ0 = 45.5, PZ1 = 58;                       // the platform around it
  const fp = (u, v) => pj(SX0 + u, DECK + v, SZ0), fr = (u0, v0, u1, v1) => [fp(u0, v0), fp(u1, v0), fp(u1, v1), fp(u0, v1)];
  const roofY = z => lerp(WT0, WT1 + .1, (z - 48.4) / 7.2);

  const O = INT.OUT;
  // the four looks of the wide shot; sky/sea keys as INT.OUT, plus amb/ambK (grade), lights (shop default), sand (the dune)
  const LS = {
    dawn: { ...O.morning, s0: '#9AAEC4', s1: '#CCD3D8', s2: '#F0DDBE', cl: '#F2E6D6', clDk: '#A4B0C0', cloud: .45, sea: '#86A0AC', seaDk: '#6A8796', seaLt: '#F4E4C6',
      sun: '#FFE2AE', sunA: .75, sunX: 1590, sunY: HZ - 12, light: .4, amb: '#B4C2D2', ambK: .16, lights: .6, bank: '#5E7A62' },
    grey: { ...O.grey, sunX: 1400, sunY: 150, amb: '#7C8896', ambK: .32, lights: 1, bank: '#4E5E58' },
    gold: { ...O.gold, sunX: 1420, sunY: 110, sunA: .9, amb: '#F0C690', ambK: .16, lights: .5, bank: '#6A7A50' },
    dusk: { ...O.dusk, sunX: 1730, sunY: HZ - 8, sunA: .7, amb: '#6A6488', ambK: .32, lights: 1, bank: '#3A3A4E' },
  };

  let L, OO, LT, SKY = null, VG = null;
  const c = (k, more = 0) => mixCol(G[k] || k, L.amb, clamp(L.ambK + more));
  const hz = (col, z) => mixCol(col, L.s2, clamp((z - 15) / 260));          // aerial haze with distance
  const ch = (k, z, more = 0) => hz(c(k, more), z);
  const winC = k => mixCol(mixCol(c('inside'), L.s1, .3), G.win, k);

  // a layer that follows the camera only by these fractions (far things move less)
  function layer(kx, ky, kz) {
    const cm = CAM || { cx: 960, cy: 540, zoom: 1 };
    const z2 = 1 + (cm.zoom - 1) * kz, cx2 = 960 + (cm.cx - 960) * kx, cy2 = 540 + (cm.cy - 540) * ky;
    push(); translate(cm.cx, cm.cy); scale(z2 / cm.zoom); translate(-cx2, -cy2);
  }
  // an upright post from height y0 to y1 at (x, z), w metres wide
  function post(x, z, y0, y1, w, col, op = 255) {
    const [ax, ay] = pj(x, y1, z), [, by] = pj(x, y0, z), hw = w * FOC / z / 2;
    gp([[ax - hw, ay], [ax + hw, ay], [ax + hw, by], [ax - hw, by]], col, op);
  }
  // a pile standing in the sea: the post, a foam ring and its broken reflection
  function pile(x, z, t) {
    const col = ch('post', z), f = FOC / z;
    post(x, z, -.2, DECK - .1, .3, col);
    const [rx, ry] = pj(x, 0, z);
    for (let i = 0; i < 3; i++) gp(rectPts(rx - .15 * f + Math.sin(t * 1.6 + x + i) * .06 * f, ry + i * .5 * f, .3 * f, .35 * f), mixCol(L.sea, col, .55 - i * .15), 200);
    gp(ellPts(rx, ry, .3 * f, .05 * f, 12, 0), mixCol(L.seaLt, L.sea, .3), 170);
  }
  // a railing between two (x, z) points: posts, top rail, mid rail
  function rail(a, b, step = 2.2) {
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(len / step)), zm = (a[1] + b[1]) / 2, col = ch('post', zm);
    for (let i = 0; i <= n; i++) post(lerp(a[0], b[0], i / n), lerp(a[1], b[1], i / n), DECK, DECK + 1, .1, col);
    const sw = clamp(70 / zm, .5, 4);
    st(P3([a[0], DECK + 1, a[1]], [b[0], DECK + 1, b[1]]), sw, col);
    st(P3([a[0], DECK + .5, a[1]], [b[0], DECK + .5, b[1]]), sw * .6, col);
  }

  // ---------- sky: soft vertical gradient, sun, cloud strata (moves less than the world) ----------
  function sky(t) {
    layer(.3, .6, .3);
    boilSeed('xsky');
    if (!SKY) { SKY = createGraphics(8, 512); SKY.pixelDensity(1); }
    const g = SKY.drawingContext, Y0 = -1500, Y1 = HZ + 700, u = y => (y - Y0) / (Y1 - Y0), gr = g.createLinearGradient(0, 0, 0, 512);
    gr.addColorStop(0, L.s0); gr.addColorStop(u(-700), L.s0); gr.addColorStop(u(150), L.s1); gr.addColorStop(u(HZ), L.s2); gr.addColorStop(1, L.s2);
    g.fillStyle = gr; g.fillRect(0, 0, 8, 512);
    flushBrush(); image(SKY, -1600, Y0, W + 3200, Y1 - Y0);
    if (L.sunA > .01) {
      glow(L.sunX, L.sunY, 560, L.sun, L.sunA * .7);
      gp(ellPts(L.sunX, L.sunY, 26, 26, 24, 0), mixCol(L.sun, '#FFFFFF', .5), 255 * clamp(L.sunA * 1.4));
    }
    const k = L.cloud * (OO.cover ?? 1), dr = Math.sin(t * .05) * 20 + (OO.drift || 0);
    const sk = (x0, x1, yb, h, lit, dk, seed, d) => strata(x0, x1, yb, h, lit, dk, seed, d, mixCol(lit, L.s1, .4));
    const cl = u => mixCol(L.cl, L.s0, u), cd = u => mixCol(L.clDk, L.s0, u), cn = u => mixCol(L.cl, L.s2, u), cdn = u => mixCol(L.clDk, L.s2, u);
    if (k > .01) {
      sk(1000, 2700, HZ - 12, 18 + 26 * k, cn(.45), cdn(.45), 31, dr * .3);
      sk(-800, 900, HZ - 26, 26 + 40 * k, cn(.3), cdn(.3), 32, dr * .4);
      sk(-500, 1500, HZ - 120, 40 + 80 * k, cn(.1), cdn(.1), 33, dr * .6);
      sk(900, 2800, HZ - 230, 60 + 110 * k, L.cl, L.clDk, 34, dr * .8);
      sk(-900, 1100, HZ - 470, 80 + 140 * k, cl(.2), cd(.2), 35, dr);
      sk(500, 2900, HZ - 600, 100 + 170 * k, cl(.3), cd(.3), 36, dr * 1.2);
      sk(-1000, 1500, HZ - 840, 120 + 180 * k, cl(.4), cd(.35), 37, dr * 1.3);
    }
    if (L.sunA > .01) glow(L.sunX, L.sunY, 170, '#FFFFFF', L.sunA * .4);
    pop();
  }

  // ---------- sea: islands, horizon shine, swell strokes, the sun's path ----------
  function sea(t) {
    boilSeed('xsea');
    gp(rectPts(-1600, HZ, W + 3200, 1700), L.sea);
    gp(rectPts(-1600, HZ + 170, W + 3200, 1600), L.seaDk, 130, { curv: .5 });
    gp(rectPts(-1600, HZ + 440, W + 3200, 1400), L.seaDk, 120, { curv: .5 });
    gp(rectPts(-1600, HZ, W + 3200, 80), mixCol(L.sea, L.s2, .55), 210, { curv: .5 });
    // the lighthouse island (right), a low rock (centre), the far headland (left)
    gp([[-600, HZ + 2], [-300, HZ - 40], [-40, HZ - 58], [220, HZ - 44], [430, HZ - 18], [560, HZ + 2]], mixCol(L.hill, L.s2, .4), 255, { curv: .5 });
    gp([[700, HZ + 2], [740, HZ - 10], [800, HZ - 12], [850, HZ + 2]], mixCol(L.hill, L.s2, .25), 255, { curv: .5 });
    gp([[1360, HZ + 2], [1450, HZ - 22], [1560, HZ - 40], [1660, HZ - 46], [1760, HZ - 30], [1880, HZ + 2]], L.hill, 255, { curv: .5 });
    gp(rectPts(1694, HZ - 74, 10, 44), mixCol('#E6E2D6', L.hill, .3));
    gp([[1690, HZ - 72], [1708, HZ - 72], [1699, HZ - 84]], mixCol('#B4483A', L.hill, .3));
    if (L.light > .01) glow(1699, HZ - 70, 50, '#FFE2A0', L.light * (.45 + .4 * Math.sin(t * 2.2)));
    for (let i = 0; i < 7; i++) {                                                  // calm slicks catching the sky
      boilSeed('xslick' + i);
      const y = HZ + 14 + Math.pow(hash(i * 9.1), 1.3) * 320, d = (y - HZ) / 320;
      gp(ellPts(-200 + hash(i * 4.3) * 2300, y, 220 + 320 * d, 3 + 10 * d, 20, 0), mixCol(L.sea, L.s2, .4), 70, { curv: .5 });
    }
    gp(rectPts(-1600, HZ - 30, W + 3200, 40), L.s2, 90, { curv: .5 });              // haze over the far islands
    gp(rectPts(-1600, HZ - 3, W + 3200, 7), L.seaLt, 200);                         // horizon shine
    for (let i = 0; i < 120; i++) {                                                // swell strokes, longer and bolder toward us
      boilSeed('xw' + i);
      const d = Math.pow(hash(i * 4.7), 1.5), y = HZ + 5 + d * 760, w = 5 + 80 * d * (.5 + hash(i + 5));
      const x = -400 + hash(i * 2.1) * 2720 + Math.sin(t * .6 + i) * 8 * d;
      st([[x - w, y], [x, y - 1 - 3 * d], [x + w, y]], .35 + 1.3 * d, mixCol(L.seaLt, L.sea, .45 - .3 * d));
    }
    if (L.sunA > .01) for (let i = 0; i < 50; i++) {                               // the sun's path on the water
      boilSeed('xg' + i);
      const d = Math.pow(hash(i * 3.1), 1.6), y = HZ + 3 + d * 560, w = 3 + 44 * hash(i * 1.7) * (.2 + d);
      const x = L.sunX + (hash(i * 7.3) - .5) * (24 + 320 * d) + Math.sin(t * 1.4 + i) * 4;
      st([[x - w, y], [x + w, y]], .7 + 1.4 * d, mixCol(mixCol(L.seaLt, '#FFFFFF', .3), L.sea, 1 - L.sunA));
    }
  }

  // ---------- after the rain: rays through the cloud gap, a gold band running over the water to the shop ----------
  function goldLight(t) {
    const a = OO.rays || 0;
    if (a > .01) {
      boilSeed('xray');
      const col = mixCol(L.sun, '#FFFFFF', .2);
      for (let i = 0; i < 6; i++) {                                                // each ray: a wide faint veil around a thin core, fading at the sea
        const ex = L.sunX - 640 + i * 230 + Math.sin(t * .3 + i) * 20, ey = HZ + 10 + hash(i * 2.3) * 90, w = 50 + 70 * hash(i * 5.1);
        for (const [k, op] of [[1, 18], [.45, 26]]) gp([[L.sunX - 14 * k, L.sunY + 40], [L.sunX + 14 * k, L.sunY + 40], [ex + w * k, ey], [ex - w * k, ey]], col, op * a, { curv: .5 });
      }
      glow(L.sunX, L.sunY + 60, 260, L.sun, .35 * a);
    }
    const s = OO.sweep;
    if (s != null && s > 0) {
      boilSeed('xsweep');
      const u = sm(clamp(s)), y = lerp(HZ + 6, 760, u), d = (y - HZ) / 360, x = lerp(1500, 1180, u);
      const rw = 520 + 520 * d, rh = 8 + 46 * d;
      gp(ellPts(x, y, rw, rh, 32, 0), L.seaLt, 45, { curv: .5 });
      push(); translate(x, y); scale(1, .22); glow(0, 0, rw * .8, L.sun, .4); pop();
      for (let i = 0; i < 80; i++) {
        const an = hash(i * 3.3) * TAU, r = Math.sqrt(hash(i * 5.9)), gx = x + Math.cos(an) * r * rw + Math.sin(t * 1.3 + i) * 4, gy = y + Math.sin(an) * r * rh;
        const w = (5 + 28 * hash(i * 1.1)) * (.4 + d) * (1 - .6 * r);
        st([[gx - w, gy], [gx + w, gy]], .8 + 1.4 * d, mixCol(L.seaLt, '#FFFFFF', .45 - .3 * r));
      }
    }
  }

  // ---------- the shop and the pier mirrored in the water; warm light runs down in streaks ----------
  function reflections(t) {
    boilSeed('xrefl');
    const R = (x, y, z) => pj(x, -y, z);
    const strips = (x0, x1, yb, yt, z, col, op, n) => {
      for (let i = 0; i < n; i++) {
        const y0 = lerp(yb, yt, i / n), y1 = lerp(yb, yt, (i + .7) / n), w = Math.sin(t * 1.8 + i * 1.3) * .15;
        gp([R(x0 + w, y0, z), R(x1 + w, y0, z), R(x1 + w, y1, z), R(x0 + w, y1, z)], col, op * (1 - .5 * i / n));
      }
    };
    strips(PX0, PX1, 0, DECK, PZ0, mixCol(mixCol(L.seaDk, c('post'), .3), '#1E1C26', .2), 110, 4);
    strips(SX0, SX1, DECK, WT0 + .4, SZ0, mixCol(mixCol(L.seaDk, c('wallDk'), .3), '#1E1C26', .2), 140, 7);
    if (LT < .02) return;
    const [gx, gy] = pj(7.5, -3, SZ0);
    glow(gx, gy, 200, G.glow, .3 * LT);
    for (const [x0, x1, v0, v1] of [[SX0 + .45, SX0 + 3.35, 1.15, 2.85], [SX0 + 4.2, SX0 + 5.4, 0, 2.5]]) for (let i = 0; i < 10; i++) {
      boilSeed('xr' + x0 + i);
      const [ax, ay] = pj(lerp(x0, x1, hash(i * 1.3 + x0)), -(DECK + lerp(v0, v1, hash(i * 3.7 + x0))), SZ0), w = 5 + 16 * hash(i * 2.9), sw = Math.sin(t * 2 + i * 1.7) * 5;
      st([[ax - w + sw, ay], [ax + w + sw, ay]], 1.6, mixCol(L.sea, G.win, LT * .85));
    }
    for (const s of [.38, .72]) {
      const [x, z] = pier(s, 1.15), [ax, ay] = pj(x, -(DECK + 3), z), f = FOC / z;
      for (let i = 0; i < 6; i++) { const w = (.2 + .5 * hash(i + s * 9)) * f, sw = Math.sin(t * 2.2 + i + s * 5) * .15 * f; st([[ax - w + sw, ay + i * .45 * f], [ax + w + sw, ay + i * .45 * f]], 1.4, mixCol(L.sea, G.win, LT * .7)); }
    }
  }

  // ---------- the platform: piles, deck, back railing ----------
  function platform(t) {
    boilSeed('xplat');
    for (let z = PZ1 - 2.5; z > PZ0; z -= 2.5) pile(PX0, z, t);
    for (let x = PX0; x <= PX1 + .01; x += 2.3) pile(x, PZ0, t);
    const zc = 52;
    gp(P3([PX0, DECK, PZ0], [PX1, DECK, PZ0], [PX1, DECK, PZ1], [PX0, DECK, PZ1]), ch('deck', zc));
    for (let z = PZ0 + 1; z < PZ1; z += 1) st(P3([PX0, DECK, z], [PX1, DECK, z]), .5, ch('deckDk', zc));
    gp(P3([PX0, DECK, PZ0], [PX1, DECK, PZ0], [PX1, DECK - .35, PZ0], [PX0, DECK - .35, PZ0]), ch('deckDk', zc));
    gp(P3([PX0, DECK, PZ0], [PX0, DECK, PZ1], [PX0, DECK - .35, PZ1], [PX0, DECK - .35, PZ0]), ch('deckDk', zc, .08));
    rail([PX0, PZ1], [PX1, PZ1], 2.4);
  }

  // ---------- the tea shop, small at the end of the pier but every sign of it readable ----------
  function shop(t) {
    boilSeed('xshop');
    const z = 52, k = LT, H0 = WT0 - DECK;
    // left side wall in shade, with a small warm window
    gp(P3([SX0, DECK, SZ0], [SX0, DECK, SZ1], [SX0, WT1, SZ1], [SX0, WT0, SZ0]), ch('wallDk', z));
    gp(P3([SX0, DECK, SZ0], [SX0, DECK, SZ1], [SX0, DECK + .95, SZ1], [SX0, DECK + .95, SZ0]), ch('paintDk', z, .08));
    gp(P3([SX0, DECK + 1.4, 50.6], [SX0, DECK + 1.4, 53.2], [SX0, DECK + 2.8, 53.2], [SX0, DECK + 2.8, 50.6]), winC(k * .9));
    st(P3([SX0, DECK + 2.1, 50.6], [SX0, DECK + 2.1, 53.2]), .7, ch('trim', z, .1));
    // front: boards, painted wainscot, trim
    gp(fr(0, 0, 7, H0), ch('wall', z));
    for (let v = 1.3; v < H0; v += .32) st([fp(0, v), fp(7, v)], .45, ch('wallDk', z));
    gp(fr(0, H0 - .4, 7, H0), ch('wallDk', z), 130);                                // shade under the eave
    gp(fr(0, 0, 7, .95), ch('paint', z));
    for (let u = .25; u < 7; u += .32) st([fp(u, .05), fp(u, .9)], .4, ch('paintDk', z));
    gp(fr(0, .9, 7, 1.02), ch('trim', z));
    // the big window: shelves and warm light behind the glass
    gp(fr(.45, 1.15, 3.35, 2.85), winC(k));
    if (k > .05) { gp(fr(.55, 1.9, 3.25, 1.98), c('inside'), 160 * k); gp(fr(.55, 1.45, 3.25, 1.52), c('inside'), 160 * k); }
    for (let i = 0; i < 4; i++) gp(fr(.42 + i * .963, 1.15, .48 + i * .963, 2.85), ch('trim', z));
    gp(fr(.42, 2.0, 3.38, 2.06), ch('trim', z)); gp(fr(.35, 1.08, 3.45, 1.16), ch('trim', z));
    // striped awning over the window, leaning out toward us, scalloped hem
    const aw = (u, v, zz) => pj(SX0 + u, DECK + v, zz), a0 = [.3, 3.35, SZ0], a1 = [3.5, 3.35, SZ0], b1 = [3.62, 2.92, SZ0 - .7], b0 = [.18, 2.92, SZ0 - .7];
    gp([aw(...a0), aw(...a1), aw(...b1), aw(...b0)], ch('awnA', z));
    for (let i = 0; i < 8; i++) {
      const u0 = i / 8, u1 = (i + .5) / 8;
      gp([aw(lerp(a0[0], a1[0], u0), 3.35, SZ0), aw(lerp(a0[0], a1[0], u1), 3.35, SZ0), aw(lerp(b0[0], b1[0], u1), 2.92, SZ0 - .7), aw(lerp(b0[0], b1[0], u0), 2.92, SZ0 - .7)], ch('awnB', z));
    }
    for (let i = 0; i < 14; i++) { const [x, y] = aw(lerp(b0[0], b1[0], (i + .5) / 14), 2.92, SZ0 - .7); gp(ellPts(x, y, 4.2, 3.2, 10, 0), ch(i % 2 ? 'awnA' : 'awnB', z)); }
    // the door: warm doorway, indigo noren split in two, the leaf ajar
    gp(fr(4.2, 0, 5.4, 2.5), mixCol(c('inside'), G.win, .7 * k));
    gp(fr(4.2, 1.85, 5.4, 2.5), ch('noren', z));
    st([fp(4.8, 1.85), fp(4.8, 2.5)], .6, mixCol(ch('noren', z), '#000000', .3));
    gp(fr(5.4, 0, 5.62, 2.5), ch('wallDk', z, .05));
    gp(fr(4.1, 2.5, 5.5, 2.62), ch('trim', z));
    // the blade sign on its bracket
    const sw = Math.sin(t * 1.6) * .03;
    st([fp(7, 3.0), fp(7.55, 3.0)], 1.1, ch('post', z));
    const [bx, by] = fp(7.55, 3.0), bs = FOC / SZ0;
    push(); translate(bx, by); rotate(sw); translate(-bx, -by);
    gp(rrPts(bx - .32 * bs, by + .1 * bs, .64 * bs, .58 * bs, 3), ch('paint', z)); gp(rrPts(bx - .26 * bs, by + .16 * bs, .52 * bs, .46 * bs, 2), ch('trim', z));
    cupIcon(bx, by + .4 * bs, .11, ch('paintDk', z), t);
    pop();
    // shed roof: corrugated top plane rising away from us, deep fascia
    const r0 = 48.4, r1 = 55.6, rx0 = SX0 - .4, rx1 = SX1 + .4;
    gp(P3([rx0, WT0, r0], [rx1, WT0, r0], [rx1, WT1 + .1, r1], [rx0, WT1 + .1, r1]), ch('roof', z));
    for (let x = rx0 + .3; x < rx1; x += .38) st(P3([x, WT0, r0], [x, WT1 + .1, r1]), .45, ch('roofLt', z));
    gp(P3([rx0, WT0, r0], [rx1, WT0, r0], [rx1, WT0 - .28, r0], [rx0, WT0 - .28, r0]), ch('roofDk', z));
    // string lights under the eave
    for (let i = 0; i < 10; i++) {
      const u = .3 + i * .71, sag = .12 * Math.sin((i % 3) / 2 * Math.PI), [x, y] = pj(SX0 + u, WT0 - .45 - sag, SZ0 - .25);
      if (i < 9) { const [x2, y2] = pj(SX0 + u + .71, WT0 - .45 - .12 * Math.sin(((i + 1) % 3) / 2 * Math.PI), SZ0 - .25); st([[x, y], [(x + x2) / 2, (y + y2) / 2 + 2], [x2, y2]], .4, ch('post', z)); }
      gp(ellPts(x, y + 2, 2.2, 2.6, 8, 0), mixCol(ch('trim', z), '#FFE3A0', k));
    }
    // rooftop signboard with the painted cup, stovepipe with kettle steam
    const zs = 54, ys = roofY(zs);
    post(5.8, zs, ys, 7.1, .1, ch('post', zs)); post(8.0, zs, ys, 7.1, .1, ch('post', zs));
    gp(P3([5.15, 7.0, zs], [8.65, 7.0, zs], [8.65, 8.35, zs], [5.15, 8.35, zs]), ch('chalk', zs));
    gp(P3([5.27, 7.1, zs], [8.53, 7.1, zs], [8.53, 8.25, zs], [5.27, 8.25, zs]), ch('paintDk', zs));
    const [ix, iy] = pj(6.9, 7.58, zs);
    cupIcon(ix, iy, .3, ch('trim', zs), t);
    const zp = 54.5, yp = roofY(zp);
    post(10.2, zp, yp, 8.6, .32, ch('post', zp)); post(10.2, zp, 8.5, 8.75, .5, ch('post', zp));
    for (let i = 0; i < 4; i++) {
      boilSeed('xstm' + i);
      const q = (t * .3 + i / 4) % 1, [sx, sy] = pj(10.2, 8.9, zp);
      glow(sx + q * 46 + Math.sin(q * 6 + i) * 6, sy - q * 70, 10 + 26 * q, '#F4F2EC', .16 * (1 - q));
    }
  }

  // ---------- the platform's front railings (they stand in front of the shop) ----------
  function platformFront() {
    boilSeed('xrailf');
    rail([PX0, PZ0], [PX0, PZ1], 2.5);
    rail([PX0, PZ0], [2.6, PZ0], 2);
    rail([6.6, PZ0], [PX1, PZ0], 2.2);
  }

  // ---------- a red rowboat moored beside the platform ----------
  function boat(t) {
    boilSeed('xboat');
    const z = 41.5, bob = Math.sin(t * 1.3) * .08, f = FOC / z;
    const hull = [[5.4, .5 + bob, z], [9, .5 + bob, z], [8.65, bob - .05, z], [5.75, bob - .05, z]];
    gp(P3(...hull.map(([x, y]) => [x, -y + .05, z])), mixCol(L.sea, '#B5543E', .3), 150, { curv: .3 });   // its reflection
    gp(P3(...hull), ch('#B5543E', z), 255, { curv: .3 });
    gp(P3([5.4, .5 + bob, z], [9, .5 + bob, z], [8.95, .38 + bob, z], [5.45, .38 + bob, z]), ch('#E6D8BC', z));
    gp(P3([6.6, .58 + bob, z], [7.6, .58 + bob, z], [7.6, .5 + bob, z], [6.6, .5 + bob, z]), ch('#7A5236', z));
    const [rx, ry] = pj(5.45, .45 + bob, z), [qx, qz] = pier(.86, 1), [px, py] = pj(qx, DECK + .2, qz);
    st([[rx, ry], [(rx + px) / 2, (ry + py) / 2 + .2 * f], [px, py]], .7, ch('#D8C8A8', z));
  }

  // ---------- the pier: piles and braces, deck with planks, railings, two lamp posts ----------
  function pierDraw(t) {
    boilSeed('xpier');
    const n = Math.ceil(pl / 2.6);
    for (let i = n; i >= 0; i--) { const [x, z] = pier(i / n, -1); if (z > 14) pile(x, z, t); }
    for (let i = n; i >= 0; i--) {
      const [x, z] = pier(i / n, 1); if (z < 14) continue;
      pile(x, z, t);
      if (i > 0) { const [x2, z2] = pier((i - 1) / n, 1); st(P3([x, .3, z], [x2, DECK - .45, z2]), clamp(60 / z, .5, 3), ch('post', z)); }
    }
    const zm = 30;
    const dk = (u, side) => { const [x, z] = pier(u, side); return [x, DECK, z]; };
    gp(P3(dk(0, -1), dk(1, -1), dk(1, 1), dk(0, 1)), ch('deck', zm));
    for (let s = .02; s < 1; s += .9 / pl) {
      const [x0, z0] = pier(s, -1), [x1, z1] = pier(s, 1);
      st(P3([x0, DECK, z0], [x1, DECK, z1]), clamp(36 / z0, .35, 2.4), ch('deckDk', z0));
    }
    const [ax, az] = pier(0, 1), [bx, bz] = pier(1, 1);
    gp(P3([ax, DECK, az], [bx, DECK, bz], [bx, DECK - .4, bz], [ax, DECK - .4, az]), ch('deckDk', zm, .05));
    rail(pier(0, -1), pier(.985, -1), 2.4);
    rail(pier(0, 1), pier(.985, 1), 2.4);
    for (const s of [.38, .72]) {
      const [x, z] = pier(s, 1.15), f = FOC / z, top = DECK + 3.2;
      post(x, z, DECK, top, .16, ch('post', z));
      const [lx, ly] = pj(x, top, z);
      gp([[lx - .22 * f, ly - .1 * f], [lx + .22 * f, ly - .1 * f], [lx + .32 * f, ly + .22 * f], [lx - .32 * f, ly + .22 * f]], ch('roofDk', z));
      gp(ellPts(lx, ly + .26 * f, .16 * f, .1 * f, 10, 0), mixCol(ch('trim', z), '#FFE3A0', LT));
      if (LT > .05) { const [px, py] = pj(x - .6, DECK, z); push(); translate(px, py); scale(1, .35); glow(0, 0, 1.8 * f, G.glow, .3 * LT); pop(); }
    }
  }

  // ---------- gulls wheeling over the shop ----------
  function gulls(t) {
    boilSeed('xgull');
    const col = mixCol('#3E4652', L.s1, .3);
    for (let i = 0; i < 3; i++) {
      const x = 1150 + 300 * Math.sin(t * .22 + i * 2.1), y = 300 - i * 40 + 30 * Math.sin(t * .37 + i), s = .8 + .25 * i, fl = Math.sin(t * (4 + i) + i) * .8;
      st([[x - 16 * s, y - 6 * s * fl - 2 * s], [x - 7 * s, y - 5 * s * (fl + .4)], [x, y]], 1.5 * s, col);
      st([[x, y], [x + 7 * s, y - 5 * s * (fl + .4)], [x + 16 * s, y - 6 * s * fl - 2 * s]], 1.5 * s, col);
    }
  }

  // ---------- warm glows (ADD), after all the solid paint ----------
  function glows(t) {
    if (LT < .02) return;
    const [wx, wy] = fp(1.9, 2.0), [dx, dy] = fp(4.8, 1.2), [sx, sy] = pj(SX0, DECK + 2.1, 51.9);
    glow(wx, wy, 120, G.glow, .55 * LT); glow(dx, dy, 70, G.glow, .5 * LT); glow(sx, sy, 50, G.glow, .4 * LT);
    for (let i = 0; i < 10; i++) { const [x, y] = pj(SX0 + .3 + i * .71, WT0 - .45, SZ0 - .25); glow(x, y + 2, 12, G.glow, .7 * LT); }
    for (const s of [.38, .72]) { const [x, z] = pier(s, 1.15), [lx, ly] = pj(x, DECK + 3.2, z); glow(lx, ly + .26 * FOC / z, 80 * 40 / z, G.glow, .6 * LT); }
  }

  // ---------- the grassy bank we stand on (moves more than the world) ----------
  function bank(t) {
    layer(1.15, 1.15, 1.15);
    boilSeed('xbank');
    const base = mixCol(c(L.bank), L.s0, .1), dk = mixCol(base, '#20202C', .35);
    const crest = [[-400, 870], [-150, 880], [120, 920], [360, 990], [540, 1060], [660, 1140], [720, 1400]];
    gp([[-400, 1400]].concat(crest), dk, 255, { curv: .5 });
    gp([[-400, 1400]].concat(crest.map(([x, y]) => [x - 20, y + 26])), mixCol(dk, '#20202C', .2), 255, { curv: .5 });
    for (let i = 0; i < 150; i++) {
      boilSeed('xb' + i);
      const u = hash(i * 1.9), j = Math.min(crest.length - 2, Math.floor(u * (crest.length - 1))), v = u * (crest.length - 1) - j;
      const x0 = lerp(crest[j][0], crest[j + 1][0], v), y0 = lerp(crest[j][1], crest[j + 1][1], v) + 8 + 30 * hash(i * 3.3);
      const h = 34 + 70 * hash(i * 5.7), lean = 10 + 14 * hash(i * 7.1) + Math.sin(t * 1.1 + i * .35) * 7;
      st([[x0, y0], [x0 + lean * .4, y0 - h * .55], [x0 + lean, y0 - h]], .8 + 1.2 * hash(i * 2.2), i % 3 ? mixCol(dk, base, hash(i * 4.4) * .6) : mixCol(base, L.s1, .3));
    }
    pop();
  }

  // ---------- rain over everything ----------
  function rain(t) {
    const a = OO.rain || 0;
    if (a < .02) return;
    boilSeed('xrain');
    const col = mixCol(L.s2, '#FFFFFF', .25);
    for (let i = 0; i < 180 * a; i++) {
      const x = -300 + hash(i * 1.3) * 2600, y = ((hash(i * 2.7) * 1500 + t * 1100 * (.8 + .4 * hash(i))) % 1500) - 250, l = 30 + 40 * hash(i * 3.9);
      st([[x, y], [x - l * .25, y + l]], .5 + .5 * hash(i * 5.5), col);
    }
    gp(rectPts(-1600, -1600, W + 3200, 3400), L.s1, 36 * a);
  }

  function wide(t, Ls, o = {}) {
    L = Ls; OO = o; LT = o.lights ?? L.lights;
    sky(t); sea(t); goldLight(t); reflections(t);
    platform(t); shop(t); platformFront(); boat(t); pierDraw(t);
    gulls(t); glows(t); bank(t); rain(t);
  }

  // a smooth screen-space vignette (multiply), after camEnd
  function vignette() {
    if (!VG) {
      VG = createGraphics(480, 270); VG.pixelDensity(1);
      const g = VG.drawingContext, gr = g.createRadialGradient(135, 135, 0, 135, 135, 192);  // an ellipse fitted to the frame
      [[0, '#FFFFFF'], [.55, '#FFFFFF'], [.72, '#F1EFF3'], [.86, '#D6D3DC'], [1, '#B6B2BE']].forEach(([u, cc]) => gr.addColorStop(u, cc));
      g.setTransform(480 / 270, 0, 0, 1, 0, 0); g.fillStyle = gr; g.fillRect(0, 0, 270, 270);
    }
    flushBrush(); push(); resetMatrix(); translate(-W / 2, -H / 2); blendMode(MULTIPLY); image(VG, 0, 0, W, H); blendMode(BLEND); pop();
  }

  window.EXT = { wide, L: LS, mixL: INT.mixL, vignette, pj, HZ };

  // ---------- look-dev frames (t 16–20): the four looks, then the push-in end on the shop ----------
  const dev = (Ls, o, cam = [960, 540, 1]) => t => { camBegin(...cam); wide(t, Ls, o); camEnd(); vignette(); };
  devShots([
    [16, dev(LS.dawn, {})],
    [17, dev(LS.grey, { rain: .25 })],
    [18, dev(LS.gold, { rays: 1, sweep: .75, rain: .1 })],
    [19, dev(LS.dusk, {})],
    [20, dev(LS.dawn, {}, [1130, 600, 2.4])],
  ]);
})();
