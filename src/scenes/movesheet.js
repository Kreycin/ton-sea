// movesheet.js: review loops for the acted beats in moves.js, 4 × 2 cells, each beat playing in its own cell.
//   node render.mjs --loop=tonA --sheet=0,.5,1,1.5,2,2.5 ...   (tonA, tonB, maiA, maiB)
(() => {
  const COUNTER = -268;
  const bar = (cx, gy, k, y, x0, x1, col = '#8A6A50') => paint(rectPts(cx + x0 * k, gy + y * k, (x1 - x0) * k, 14 * k), { wash: col, ink: CAST.ink, sw: .5 });
  const T = (move, deco = {}) => ({ who: 'ton', move, ...deco });
  const M = (move, deco = {}) => ({ who: 'mai', move, ...deco });
  const counter = (cx, gy, k) => bar(cx, gy, k, COUNTER, 70, 260);
  const seat = h => (cx, gy, k) => bar(cx, gy, k, -h, -60, 70, '#6E5644');
  function grid(list, len) {
    const f = t => {
      boilSeed('paper');
      paint(rectPts(-40, -40, W + 80, H + 80), { wash: '#F1E9DA', ink: null });
      list.forEach((c, i) => {
        const cx = 150 + (i % 4) * 480, gy = 500 + Math.floor(i / 4) * 540, k = c.who === 'ton' ? .8 : .74;
        paint(rectPts(cx - 130, gy - 2, 440, 4), { wash: '#CDBFA8', ink: null });
        if (c.back) c.back(cx, gy, k);
        boilSeed(c.who + i);
        const lt = t % len, o = { ...c.move(lt), id: i };
        const r = c.who === 'ton' ? ton(cx, gy, k, {}, 1, o) : mai(cx, gy, k, {}, 1, o, lt);
        if (c.front) c.front(cx, gy, k, r, lt);
      });
    };
    f.len = len;
    return f;
  }
  const pourFront = (cx, gy, k, r) => {
    const gx = cx + 168 * k, gt = gy + (COUNTER - 34) * k;
    paint([[gx - 13 * k, gt], [gx + 13 * k, gt], [gx + 10 * k, gt + 34 * k], [gx - 10 * k, gt + 34 * k]], { wash: CAST.cup, ink: CAST.ink, sw: .6 });
    if (r.spout && r.spout[1] < gt) inkLine([r.spout, [lerp(r.spout[0], gx, .6), lerp(r.spout[1], gt, .4)], [gx, gt + 6 * k]], 2.2 * k, '#B9763A', 'ink', .5);
  };
  const splashes = (cx, gy, k, r, lt) => MAIM.strikes(lt).forEach(s => splash(r.feet[s.leg][0], gy, s.age, k));
  LOOPS.tonA = grid([
    T(TONM.noren), T(TONM.shutter), T(TONM.wipe, { back: counter }), T(TONM.kettle, { back: (cx, gy, k) => bar(cx, gy, k, -300, 90, 220, '#5C6A70') }),
    T(TONM.pour, { back: counter, front: pourFront }), T(TONM.shrug), T(TONM.listen, { back: (cx, gy, k) => bar(cx, gy, k, -318, 100, 260, '#E9DCC2') }), T(TONM.wipeGlass),
  ], 3);
  LOOPS.tonB = grid([T(TONM.sitWait, { back: seat(150) }), T(TONM.offer), T(TONM.glance), T(lt => ({ t: lt, ...{ armF: [28, -306], elbF: -1, lenF: .74, handF: Math.PI, propF: 'cup' } }))], 3);
  LOOPS.maiA = grid([
    M(MAIM.run, { front: splashes }), M(MAIM.brake), M(MAIM.pant), M(MAIM.takeTowel),
    M(MAIM.sitCup, { back: seat(110) }), M(MAIM.watch, { back: seat(110) }), M(MAIM.standUp, { back: seat(110) }), M(MAIM.lookUmb),
  ], 3);
  LOOPS.maiB = grid([M(MAIM.leanUmb), M(MAIM.smile), M(MAIM.walk), M(lt => ({ ...MAIM.walk(lt), umb: 'up' }))], 3);
})();
