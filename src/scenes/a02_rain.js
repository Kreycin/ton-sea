// a02_rain.js: act 2, "the rain and the woman with the broken umbrella" (STORYBOARD.md shots 09–13b, video 35.10–58.24 s).
// The gold afternoon clouds over to grey, the rain sweeps in, Mai runs down the pier and brakes under the shop's eaves,
// laughs at herself; Ton steps out of the warm doorway with a towel.
(() => {
  const V = AIRV, G = AIRG;
  (window.ACT_SPANS = window.ACT_SPANS || []).push([V(31.10), V(54.24)]);
  const { ext, gh, foot, pier } = STAGE;
  const EL = EXT.L, mix = EXT.mixL;
  const camLerp = (a, b, u) => { const v = u <= 1 ? .35 * u + .65 * ease(u) : 1 + .35 * Math.min(u - 1, .2); return a.map((x, i) => lerp(x, b[i], v)); };   // eased drift, runs on gently through a dissolve
  const easeOut = s => 1 - (1 - s) * (1 - s);

  // 09: one afternoon the sky turns grey (a time-lapse): clouds roll in over the islands, the world cools, and the shop's
  // lights come on (the light rule starts here)
  function s09(t, lt, dur) {
    ext(t, camLerp([960, 540, 1], [985, 548, 1.06], lt / dur), mix(EL.gold, EL.grey, ease(seg(lt, 0, 2.6))),
      { lights: lerp(.15, 1, ease(seg(lt, 2.0, 2.25))), drift: 60 + lt * 230 });
  }
  // 10: the first drops spot the boards dark, then the curtain of rain comes in off the sea and sweeps across the pier
  function s10(t, lt) {
    const front = lerp(2200, -200, ease(seg(lt, 1.1, 3.4))), gust = seg(lt, 1.1, 3.4);
    gh(t, [720, 680 - lt * 4, 1.35], () => drops(t, lt, front), { rainX: front, noren: gust * (6 + 4 * Math.sin(t * 2.3)) });
  }
  // the first drops, then the wet boards behind the rain front
  function drops(t, lt, front) {
    boilSeed('drops');
    gp([[front, 890], [W + 60, 890], [W + 60, 1140], [front + 40, 1140]], '#3A2C26', 70, { curv: .3 });
    for (let i = 0; i < 46; i++) {
      const t0 = .15 + hash(i * 3.3) * 1.2, x = hash(i * 7.1) * 1900, y = 900 + hash(i * 1.9) * 170;
      if (lt < t0 || x > front) continue;
      const g = seg(lt, t0, t0 + .25), r = (3 + 5 * hash(i)) * (.4 + .6 * g);
      gp(ellPts(x, y, r * 1.6, r * .7, 10, 0), '#4A382E', 170);
      if (g < 1) st([[x - 8 * g - 4, y - 3 * g], [x, y - 6 * g], [x + 8 * g + 4, y - 3 * g]], .5, '#DCE4EA');
    }
  }
  // 10b (air): low and close on the wet boards: red boots splash through the puddles, running in from the right; the
  // camera turns a little with her
  function s10b(t, lt, dur) {
    const u = lt / dur, x = lerp(1900, 1100, u);
    gh(t, [lerp(1560, 1380, ease(u)), 870, 3.2], () => {
      for (const px of [1720, 1460, 1210]) gp(ellPts(px, 936, 90, 12, 20, 0), '#8E9CA8', 120, { curv: .5 });   // puddles
      splashes(lt, dur);
      foot(x, 932, 56); boilSeed('mai'); mai(x, 932, .86, {}, -1, MAIM.run(lt), t);
    });
  }
  function splashes(lt, dur) {                       // at each footfall: a ring on the wet boards and a crown of drops
    boilSeed('splash');
    const n = lt * 2 * RUN_CAD;
    for (let k = Math.max(0, Math.floor(n) - 2); k <= n; k++) {
      const tk = k / (2 * RUN_CAD), a = lt - tk, q = a / .5;
      if (a < 0 || q > 1) continue;
      const fx = lerp(1900, 1100, tk / dur) + (k % 2 ? 16 : -16);
      gp(ellPts(fx, 935, 18 + 70 * q, 4 + 9 * q, 18, 0), '#DCE4EA', 160 * (1 - q), { curv: .5 });
      for (let i = 0; i < 7; i++) {
        const vx = (hash(k * 7 + i) - .5) * 280, vy = -(170 + 130 * hash(k * 3 + i)), y = 930 + vy * a + 900 * a * a;
        if (y < 936) gp(ellPts(fx + vx * a, y, 4, 5, 8, 0), '#E4ECF0', 210 * (1 - q));
      }
    }
  }
  // 11a: she runs toward us down the long pier through the rain, the yellow coat and red boots in the grey
  function s11a(t, lt, dur) { pier(t, [960, 540, 1], MAIM.run(lt), lerp(.14, .6, lt / dur)); }
  // 11b: a gust: the umbrella yanks back and the torn piece of canopy rips off and flies out of frame
  function s11b(t, lt, dur) {
    const g = Math.sin(Math.PI * seg(lt, .3, 1.2)), rig = { ...MAIM.run(lt + 3.33), umbA: -.45 * g };
    if (lt > .35 && lt < 1.4) rig.face = { eyes: 'wide', mouth: 'o', brow: .8, look: .3 };
    pier(t, camLerp([930, 560, 1.7], [940, 600, 1.7], lt / dur), rig, lerp(.6, .66, lt / dur), { scrap: lt < .4 ? null : seg(lt, .4, 1.9) });
  }
  // 12a: she runs in and brakes under the shop's eaves, soaked; water drips from her hair and coat hem
  function s12a(t, lt) {
    const x = 1340 + 600 * (1 - easeOut(seg(lt, 0, 1.0))), rig = lt < .69 ? MAIM.run(lt) : MAIM.brake(lt - .69);
    gh(t, [1180 + 10 * ease(seg(lt, 0, 1.2)), 640 - lt * 3, 1.55], () => { foot(x, 932, 56); boilSeed('mai'); mai(x, 932, .86, {}, -1, rig, t); }, { pud: lt > .95 });
  }
  // 12b: bent over panting, she looks at the wrecked umbrella, then laughs at herself (the shot that says who she is)
  function s12b(t, lt, dur) {
    gh(t, camLerp([1340, 640, 2.5], [1345, 648, 2.62], lt / dur), () => { foot(1340, 932, 56); boilSeed('mai'); mai(1340, 932, .86, {}, -1, MAIM.pant(lt), t); }, { pud: true });
  }
  // 13a (the reference frame): Ton steps out of the warm doorway with a towel: "come in first" (an open hand to the door)
  const TON13 = lt => pose(lt, [
    [0, { armF: [74, -300], handF: .4, fistF: true, propF: 'towel', towel: false, armB: null, lean: 0, nod: 0, face: { eyes: 'open', mouth: 'flat', look: 1, brow: .4 } }],
    [.9, { armB: [-118, -318], handB: -.4, lean: -.03, nod: .06, face: { eyes: 'open', mouth: 'smile', look: 1, brow: .2 }, _d: .4 }],
    [2.0, { nod: .1, face: { eyes: 'half', mouth: 'smile', look: 1, brow: -.2 }, _d: .3 }],
  ]);
  const MAI13 = lt => pose(lt, [
    [0, { umb: 'low', umbA: .3, lean: -.04, nod: -.08, face: { eyes: 'happy', mouth: 'laugh', tilt: -1 } }],
    [.55, { lean: 0, nod: 0, umbA: .4, face: { eyes: 'wide', mouth: 'o', brow: .8, look: 1 }, _d: .2, _snap: true }],
    [1.5, { face: { eyes: 'open', mouth: 'smile', look: 1, brow: .4 }, _d: .4 }],
  ]);
  function s13a(t, lt) {
    const step = seg(lt, .15, .75), tx = 700 + 80 * ease(step), tr = { ...TON13(lt), t: lt, id: 2, stride: Math.sin(Math.PI * step) };
    gh(t, [960 + Math.sin(lt * .4) * 5, 560, 1.03], () => {
      foot(tx + 4, 896, 64); foot(1340, 932, 56);
      boilSeed('ton'); ton(tx, 896, .82, {}, 1, tr);
      boilSeed('mai'); mai(1340, 932, .86, {}, -1, { ...MAI13(lt), t: lt }, t);
    }, { pud: true });
  }
  // 13b: CU: the towel passes from his dry hand in the warm doorway light to her wet one in the cold
  function s13b(t, lt, dur) {
    gh(t, camLerp([1170, 600, 2.3], [1175, 596, 2.4], lt / dur), () => {
      foot(1030, 898, 60); foot(1310, 932, 56);
      boilSeed('ton'); ton(1030, 898, .82, {}, 1, TONM.offer(.4 + lt));
      boilSeed('mai'); mai(1310, 932, .86, {}, -1, MAIM.takeTowel(lt), t);
    });
  }

  shots([
    [V(31.10), s09], [V(34.47), s10], [G(37.70, 1.8), s10b], [V(37.80), s11a], [V(41.13), s11b],
    [V(43.45), s12a], [V(46.57), s12b], [V(49.68), s13a], [V(52.12), s13b],
  ]);
})();
