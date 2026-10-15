// a05_coda.js: coda, "waiting" (STORYBOARD.md shots 22a–25, video 98.15–117.75 s). Rain again: every rainy day Ton
// looks at the umbrella, puts the kettle on (the 03c rhyme) and waits. Some days she comes back, some days not; the tea
// is always ready. The sea keeps him company: the pull-back to the little lit shop, then black.
(() => {
  const V = AIRV, G = AIRG, END = PROJECT.duration;
  (window.ACT_SPANS = window.ACT_SPANS || []).push([V(94.15), END + 1]);
  const { int, ext, tonAt, maiAt, tonStool, steam } = STAGE;
  const IL = INT.L, EL = EXT.L;
  const camLerp = (a, b, u) => { const v = u <= 1 ? .35 * u + .65 * ease(u) : 1 + .35 * Math.min(u - 1, .2); return a.map((x, i) => lerp(x, b[i], v)); };   // eased drift, runs on gently through a dissolve

  // 22a: MCU: every rainy day he glances from the window to the umbrella on the wall, and holds
  function s22a(t, lt, dur) {
    int(t, camLerp([875, 505, 2.5], [878, 500, 2.6], lt / dur), IL.rain, { umb: 'hook', kettle: .3 }, { back: tonAt(880, 100, TONM.glance(lt)) });
  }
  // 22b: puts the kettle on: the 03c frame again, in the rain light
  function s22b(t, lt, dur) {
    int(t, camLerp([545, 503, 2.4], [551, 497, 2.5], lt / dur), IL.rain, { umb: 'hook', noKettle: lt < .85, kettle: .9 * ease(seg(lt, .9, 1.15)) },
      { back: tonAt(509, 100, TONM.kettle(lt, -343)) });
  }
  // 22c: and waits, on the window seat, watching the rain
  function s22c(t, lt) { int(t, [1150, 520 - lt * 6, 1.3], IL.rain, { umb: 'hook', kettle: 1 }, { back: tonStool(TONM.sitWait(lt + 1)) }); }
  // 23a: low angle at the door: it has just opened, the chime still ringing, and red boots step in (some days she comes back)
  function s23a(t, lt, dur) {
    const x = lerp(300, 430, lt / dur);
    int(t, camLerp([374, 762, 2.6], [380, 757, 2.66], lt / dur), IL.rain, { door: 1, prints: 1, umb: 'hook', chime: .3 + .6 * Math.exp(-lt * 1.5) },
      { back: maiAt(x, 40, MAIM.walk(lt), 1) });
  }
  // 23b: the same frame: the door stands empty, only the rain (some days she doesn't)
  function s23b(t, lt, dur) { int(t, camLerp([374, 762, 2.6], [380, 757, 2.66], lt / dur), IL.rain, { door: 1, prints: .3, umb: 'hook', chime: .15 }); }
  // 24p (air): ECU: he pours the second glass, the first already steaming beside it
  const s24p = (t, lt, dur) => STAGE.pourCU(t, lt, dur, { light: 'dusk', fill: [.1, .8], pair: true });
  // 24: CU: two glasses of tea on the counter, steam rising (the tea is always ready)
  function s24(t, lt, dur) {
    int(t, camLerp([958, 560, 3.4], [958, 556, 3.55], lt / dur), IL.dusk, { glasses: 2, umb: 'hook' },
      { mid: () => { steam(924, 578, 1, t); steam(993, 577, 1, t + .4); } });
  }
  // 25: the sea keeps him company: pull back and rise to the little shop glowing at the end of the pier, the wide calm
  // sea; hold on the waves, fade to black over the last 2 s
  function s25(t, lt) {
    const d = V(111.75) - V(104.64), u = ease(seg(lt, 0, d - 1.0));
    ext(t, camLerp([1085, 575, 1.45], [960, 520, 1.0], u), EL.dusk, { drift: lt * 8 });
    const f = seg(t, END - 2.4, END - .4);
    if (f > 0) gp(rectPts(-60, -60, W + 120, H + 120), '#0E0C10', 255 * ease(f));
  }

  shots([
    [V(94.15), s22a], [V(97.20), s22b], [V(98.40), s22c], [V(99.25), s23a], [V(101.15), s23b],
    [G(102.75, 1.2), s24p], [V(102.80), s24], [V(104.64), s25],
  ]);
})();
