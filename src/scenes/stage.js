// stage.js: shared staging for the film's shots (the animatic and the animated acts aNN_*.js): paint a whole frame of a
// built set under a camera, and place the cast on it. Load after interior.js, seascape.js and ghibli.js.
//   STAGE.int(t, cam, L, o, layers)  the INT shop. cam = [cx, cy, zoom]; L: a light state; o: set options (interior.js);
//                                    layers { back, mid, front }: cast drawn behind the counter, in front of it, in front of the stools
//   STAGE.ext(t, cam, L, o, extra)   the EXT wide seascape; extra(t) draws under the same camera
//   STAGE.gh(t, cam, cast, o)        the shop front (ghibli.js), rain by default. o.dry: no rain; o.sky: swap the sky;
//                                    o.pud: Mai's boot reflection; o.noren: hem swing (px); o.wash = [col, op]: a grade on top;
//                                    o.rainX: the rain front (world x; rain and drips only right of it, coming in off the sea)
//   STAGE.pier(t, cam, rig, u, o)    the long pier in the rain with Mai running in (a card: see the function)
//   cast callbacks: tonAt / maiAt (INT floor point x, z), maiStool / tonStool (the window stool); `out.r` keeps the
//   rig's return (hands, spout) for a later layer. solo(rig): the back arm hangs behind the body.
const STAGE = (() => {
  const { at, pj, fz, FL } = INT;
  const lp = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];

  function int(t, cam, L, o = {}, layers = {}) {
    camBegin(...cam); INT.lightCast(L, .9); INT.set(t, L, o, layers); INT.unlightCast(); camEnd(); INT.vignette(L);
  }
  function ext(t, cam, L, o = {}, extra) { camBegin(...cam); EXT.wide(t, L, o); if (extra) extra(t); camEnd(); EXT.vignette(); }
  function gh(t, cam, cast, o = {}) {
    GH.opt.maiPud = !!o.pud; GH.opt.norenSw = o.noren || 0; GH.opt.rainX = o.rainX ?? -Infinity;
    camBegin(...cam);
    (o.sky || GH.sky)(t); GH.sea(t); GH.railing(t); GH.shop(t); GH.deck(t);
    if (!o.dry) GH.rain(t, 'far');
    if (cast) cast(t);
    if (!o.dry) { GH.drips(t); GH.rain(t, 'near'); }
    GH.foreground(t);
    camEnd();
    GH.opt.maiPud = true; GH.opt.norenSw = 0; GH.opt.rainX = -Infinity;
    if (o.wash) gp(rectPts(-60, -60, W + 120, H + 120), o.wash[0], o.wash[1]);
  }
  const foot = (x, y, w) => gp(ellPts(x, y + 2, w, 7, 20, 0), '#3A2C26', 140, { curv: .5 });

  const tonAt = (x, z, rig, f = 1, out) => () => { const [sx, sy, k] = at(x, z); boilSeed('ton'); const r = ton(sx, sy, .82 * k, {}, f, rig); if (out) out.r = r; };
  const maiAt = (x, z, rig, f = -1) => () => { const [sx, sy, k] = at(x, z); boilSeed('mai'); mai(sx, sy, .82 * k, {}, f, rig, rig.t); };
  // the window stool (x 1300, z 200, 180 high): Mai's rig sits on its top; Ton's feet stay on the floor
  const maiStool = rig => () => { const [mx, my] = pj(1300, FL - 180, 200); boilSeed('mai'); mai(mx, my, .82 * fz(200), {}, -1, { ...rig, _seatOrigin: true }, rig.t); };
  const tonStool = rig => () => { const [sx, sy, k] = at(1300, 200); boilSeed('ton'); ton(sx, sy, .82 * k, {}, 1, { ...rig, seat: 220 }); };
  const both = (...fs) => () => fs.forEach(f => f());
  // a hand on the counter top is hidden by the counter and its forearm pokes out from behind the apron, so it hangs
  const solo = rig => ({ ...rig, armB: null, handB: null, bFront: false });
  const pourRig = lt => solo(TONM.pour(lt, -300));

  function steam(x, y, s, t, n = 3, a = 150) {
    for (let i = 0; i < n; i++) {
      const u = (t * .5 + i / n) % 1, sx = x + Math.sin(t * 1.7 + i * 2.1) * 6 * s + u * 10 * s, sy = y - u * 70 * s;
      gp(ellPts(sx, sy, (5 + u * 14) * s, (4 + u * 9) * s, 12, 0), '#F6F2EA', a * (1 - u), { curv: .5 });
    }
  }
  // a tea glass on the counter top (drawn after the counter): under the spout, or at o.x; o.fill 0..1, o.stream (default
  // while there is a spout), o.steam 0..1 with o.t
  const pourGlass = (b, o = {}) => () => {
    const sp = b.r && b.r.spout; if (!sp && o.x == null) return;
    const gx = o.x ?? sp[0] + 12, gy = 624, w0 = 17, w1 = 14, h = 40, fill = o.fill ?? .55, wf = lerp(w1, w0, fill);
    paint([[gx - w0, gy - h], [gx + w0, gy - h], [gx + w1, gy], [gx - w1, gy]], { wash: CAST.cup, washOp: 220, ink: CAST.ink, sw: .6 });
    if (fill > .02) gp([[gx - wf + 3, gy - h * fill], [gx + wf - 3, gy - h * fill], [gx + w1 - 3, gy - 3], [gx - w1 + 3, gy - 3]], CAST.tea, 230);
    if (sp && (o.stream ?? true)) inkLine([sp, [lerp(sp[0], gx, .6), lerp(sp[1], gy - h, .4)], [gx, gy - h * Math.max(fill, .2)]], 2.6, '#B9763A', 'ink', .5);
    if (o.steam) steam(gx, gy - h - 4, .8, o.t || 0, 3, 130 * o.steam);
  };
  // the red-striped towel lying on the counter top under Ton's wiping hand (drawn after the counter)
  const ragOnTop = b => () => {
    const r = b.r; if (!r) return;
    const [hx] = r.hands[1], y0 = 612, y1 = 627, T = [[hx - 44, y0], [hx + 30, y0], [hx + 40, y1], [hx - 52, y1]];
    paint(T, { wash: CAST.towel, ink: CAST.ink, sw: .45, curv: .3 });
    for (const v of [.22, .34]) st([lp(T[0], T[1], v), lp(T[3], T[2], v)], 1.6, CAST.towelLine);
  };
  // the shop front's morning sky (ghibli.js only paints the rain sky)
  function dawnSky() {
    boilSeed('asky');
    ['#9AAEC4', '#B8C4CE', '#D6D8D4', '#F0DDBE'].forEach((c, i) => gp(rectPts(-60, -60 + i * 150, W + 120, 230 + (i === 3 ? 200 : 0)), c));
    glow(1450, 500, 380, '#FFE6B4', .5);
    strata(900, 2000, 480, 50, '#F2E6D6', '#C9CCD2', 1, 0, '#F6EEE2');
    strata(-80, 900, 430, 60, '#EDE3D6', '#B9C1CC', 2, 0, '#F6EEE2');
  }
  // 11a/11b: the long pier in the rain, Mai running toward us from the shore end at u (0 far .. 1 at the lens);
  // o.scrap 0..1: the torn piece of the canopy tearing off in a gust and flying out of frame (11b). Returns Mai's rig.
  function pier(t, cam, rig, u, o = {}) {
    const O = INT.OUT.rain;
    camBegin(...cam);
    boilSeed('pier');
    gp(rectPts(-60, -60, W + 120, 300), O.s0); gp(rectPts(-60, 200, W + 120, 200), O.s1); gp(rectPts(-60, 340, W + 120, 120), O.s2, 200, { curv: .5 });
    strata(-80, 1100, 230, 120, O.cl, O.clDk, 4, 0, O.s2); strata(800, 2000, 150, 140, O.cl, O.clDk, 5, 0, O.s2);
    gp(rectPts(-60, 430, W + 120, H), O.sea); gp(ellPts(900, 432, 760, 34, 24, 0), O.hill);
    const VXp = 900, VYp = 438, edge = (v, side) => [lerp(VXp + side * 26, 960 + side * 1150, v), lerp(VYp, H + 80, v)];
    gp([edge(0, -1), edge(0, 1), edge(1, 1), edge(1, -1)], O.deck);
    for (let k = 1; k <= 26; k++) { const v = Math.pow(k / 26, 2); st([edge(v, -1), edge(v, 1)], .4 + v, O.deckDk); }
    gp([edge(.05, -.2), edge(.05, .2), edge(1, .3), edge(1, -.3)], O.s2, 40, { curv: .3 });   // wet sheen
    for (const side of [-1, 1]) {
      for (let k = 0; k <= 12; k++) {
        const v = Math.pow(k / 12, 1.6), [x, y] = edge(v, side), h = 30 + 420 * v, w = 3 + 22 * v;
        gp(rectPts(x - w / 2, y - h, w, h), O.rail);
      }
      st([[edge(0, side)[0], edge(0, side)[1] - 30], [edge(.5, side)[0], edge(.5, side)[1] - 240], [edge(1, side)[0], edge(1, side)[1] - 450]], 3, O.rail);
    }
    const [mx, my] = [lerp(VXp, 960, u) - 60, lerp(VYp, H + 80, u)], k = .25 + u * .9;
    foot(mx, my, 50 * k);
    boilSeed('mai'); const r = mai(mx, my, k, {}, 1, rig, rig.t);
    MAIM.strikes(rig.t).forEach(s => splash(r.feet[s.leg][0], my, s.age, k));
    if (o.scrap != null) {                                                 // the torn piece, ripped off by the gust
      const q = o.scrap, e = q * q, s = k / .79, [hx, hy] = r.hands[1];
      const fx = hx + 20 * s + e * 1000 + 40 * Math.sin(q * 9), fy = hy - 150 * s - q * 260 + 40 * Math.sin(q * 7), a = .3 + q * 5.5;
      const R = (dx, dy) => [fx + s * (dx * Math.cos(a) - dy * Math.sin(a)), fy + s * (dx * Math.sin(a) + dy * Math.cos(a))];
      paint([[-90, 0], [-20, -50], [80, -30], [110, 30], [10, 10]].map(([a, b]) => R(a, b)), { wash: CAST.umb, ink: CAST.ink, sw: .8, curv: .4 });
      st([R(-20, -50), R(0, -10), R(10, 10)], 1.2, CAST.ink);
    }
    for (let i = 0; i < 140; i++) {
      boilSeed('pr' + i);
      const q = (t * 2.4 + hash(i * 1.7)) % 1, x = hash(i * 4.3) * (W + 300) - 100 - q * 90, y = -100 + q * (H + 200), len = 50 * (.6 + .8 * hash(i));
      st([[x, y], [x - len * .28, y + len]], .6, G.rain);
    }
    camEnd();
    EXT.vignette();
    return r;
  }
  // 08p / 24p (air inserts): ECU of the tea running from the copper spout into a glass on the counter, the level rising,
  // steam lifting; the stream thins and stops just before the cut. o.light 'warm' (the afternoon shop) | 'dusk' (a rainy
  // evening); o.fill [from, to]; o.pair: a first glass, full and steaming, stands beside it (one for whoever comes)
  function pourCU(t, lt, dur, o = {}) {
    const u = lt / dur, P = o.light === 'dusk'
      ? { wall: '#5E4E5A', wall2: '#7A6470', lamp: '#FFC27A', bar: '#4E3A30', edge: '#8E6E58' }
      : { wall: '#D8C8AE', wall2: '#E8DCC6', lamp: '#FFE0A8', bar: '#6E4E3A', edge: '#B08868' };
    camBegin((o.pair ? 930 : 1010) - 20 * u, 650 - 8 * u, 1.3 + .06 * ease(u));            // tight: the glass, the stream from above
    boilSeed('pourcu');
    gp(rectPts(-60, -60, W + 120, H + 120), P.wall);
    gp(rectPts(-60, 120, W + 120, 380), P.wall2, 140, { curv: .5 });                       // the back bar, out of focus
    for (let i = 0; i < 7; i++) glow(140 + i * 280 + 40 * hash(i), 260 + 80 * hash(i * 3), 90 + 60 * hash(i * 7), P.lamp, .12);
    gp(rectPts(-60, 830, W + 120, 300), P.bar); gp(rectPts(-60, 830, W + 120, 18), P.edge);
    const gx = o.pair ? 1180 : 960, f = lerp(o.fill?.[0] ?? .3, o.fill?.[1] ?? .8, ease(seg(lt, .1, dur - .3)));
    if (o.pair) glassCU(640, .8, t, .9);
    glassCU(gx, f, t, seg(lt, .6, 2.0));
    const on = 1 - seg(lt, dur - .55, dur - .15), sx = gx + 240, sy = 40, top = 840 - 330 * f;
    if (on > .02) {                                                                        // the stream and its ripples
      const wob = 3 * Math.sin(t * 17);
      inkLine([[sx - 26, sy + 8], [sx - 120 + wob, sy + 160], [gx + 30 + wob, top - 6]], 16 * on, '#C07A3A', 'ink', .6);
      st([[sx - 28, sy + 12], [sx - 116 + wob, sy + 150], [gx + 26 + wob, top - 16]], 2.2 * on, '#F2C08A');
      for (let i = 0; i < 5; i++) { const q = (t * 2.2 + i / 5) % 1; gp(ellPts(gx + 30, top + 2, 8 + 50 * q, 3 + 7 * q, 16, 0), '#E8B07A', 150 * (1 - q) * on); }
    }
    gp([[sx + 420, -80], [sx + 120, -80], [sx - 30, sy - 10], [sx - 20, sy + 22], [sx + 160, 30]], '#B8643A', 255, { curv: .3 });   // the spout
    gp([[sx + 300, -70], [sx + 140, -60], [sx + 20, sy - 4], [sx + 40, sy + 2], [sx + 170, -20]], '#E09A64', 200, { curv: .3 });
    camEnd();
  }
  function glassCU(gx, f, t, sa) {                                                         // the tall tea glass, close (as in 15)
    const gb = 840, w0 = 150, w1 = 122, h = 330, wf = lerp(w1, w0, f);
    gp(ellPts(gx, gb + 4, w1 + 30, 14, 24, 0), '#3A2C26', 120, { curv: .5 });
    paint([[gx - w0, gb - h], [gx + w0, gb - h], [gx + w1, gb], [gx - w1, gb]], { wash: '#F4EEE2', washOp: 170, ink: CAST.ink, sw: .9, curv: .2 });
    if (f > .02) {
      gp([[gx - wf + 14, gb - h * f], [gx + wf - 14, gb - h * f], [gx + w1 - 10, gb - 12], [gx - w1 + 10, gb - 12]], '#B9763A', 235);
      gp(ellPts(gx, gb - h * f, wf - 16, 12, 24, 0), '#D79A58');
    }
    st([[gx - w0 + 30, gb - h + 20], [gx - w0 + 40, gb - h * .4], [gx - w1 + 24, gb - 30]], 3, '#FFFFFF');
    glow(gx, gb - h * .4, 160, '#FFC27A', .2 * Math.max(f, .3));
    if (sa > 0) steam(gx, gb - h - 10, 4, t * .6, 4, 170 * sa);
  }

  return { lp, pourCU, int, ext, gh, pier, foot, tonAt, maiAt, maiStool, tonStool, both, solo, pourRig, steam, pourGlass, ragOnTop, dawnSky };
})();
