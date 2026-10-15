// a01_shop.js: act 1, "the little shop and the quiet man" (STORYBOARD.md shots 01–08, video 0–35.10 s). Silver morning,
// a calm sea; the light warms toward the afternoon through the 07 time-lapse. Replaces the animatic's held stills there.
(() => {
  const V = AIRV, G = AIRG, END = V(31.10);
  (window.ACT_SPANS = window.ACT_SPANS || []).push([0, END]);
  const { int, ext, gh, foot, tonAt, solo, pourRig, pourGlass, ragOnTop, dawnSky } = STAGE;
  const IL = INT.L, EL = EXT.L, mix = INT.mixL, AFT = mix(IL.morning, IL.gold, .55);
  const camLerp = (a, b, u) => { const v = u <= 1 ? .35 * u + .65 * ease(u) : 1 + .35 * Math.min(u - 1, .2); return a.map((x, i) => lerp(x, b[i], v)); };   // eased drift, runs on gently through a dissolve

  // 01: the wide sea at dawn; a slow push-in that lands the shop on "ร้านกาแฟ", rising a little; fades up from black
  function s01(t, lt, dur) {
    const u = ease(lt / dur);
    ext(t, camLerp([975, 600, 1.0], [1085, 565, 1.42], u), EL.dawn, { drift: lt * 6 });
    if (lt < 1.4) gp(rectPts(-60, -60, W + 120, H + 120), '#0E0C10', 255 * (1 - ease(lt / 1.4)));
  }
  // 02: Ton straightens the noren he has just hung, lets go (it swings and settles), turns to us with the small smile
  function s02(t, lt) {
    const rel = lt - 1.5, nw = (lt < 1.5 ? 3 * Math.sin(lt * 3) : 14 * Math.exp(-2.2 * rel) * Math.sin(7 * rel)) + 2 * Math.sin(t * 1.3);
    gh(t, [720 + Math.sin(lt * .5) * 4, 610, 1.55], () => { foot(700, 896, 64); boilSeed('ton'); ton(700, 896, .82, {}, 1, { ...TONM.noren(lt), id: 2 }); },
      { dry: true, sky: dawnSky, wash: ['#F2ECE0', 46], noren: nw });
  }
  // 03a: he pushes the shutters open; the morning floods the dim room
  function s03a(t, lt, dur) {
    const L = mix(IL.dim, IL.morning, ease(seg(lt, .35, 1.3)));
    int(t, camLerp([1160, 470, 1.65], [1170, 465, 1.75], lt / dur), L, { shutter: ease(seg(lt, .3, .75)), casement: ease(seg(lt, .4, 1.0)) },
      { back: tonAt(1150, 120, TONM.shutter(lt)) });
  }
  // 03b: wipes the counter in slow loops with the red-striped towel (the same towel he hands her in 13)
  function s03b(t, lt, dur) {
    const b = {};
    int(t, camLerp([900, 560, 2.2], [905, 565, 2.32], lt / dur), IL.morning, {},
      { back: tonAt(880, 120, solo(TONM.wipe(lt + .4, -307)), 1, b), mid: ragOnTop(b) });
  }
  // 03c: sets the copper kettle on the stove (the set's kettle takes over at the release), and the flame catches
  function s03c(t, lt, dur) {
    int(t, camLerp([545, 503, 2.4], [551, 497, 2.5], lt / dur), IL.morning, { noKettle: lt < .85, kettle: .9 * ease(seg(lt, 1.0, 1.25)) },
      { back: tonAt(509, 100, TONM.kettle(lt, -343)) });
  }
  // 03d (air): CU: the blue flame under the copper kettle, the first threads of steam from the spout
  function s03d(t, lt, dur) {
    int(t, camLerp([596, 514, 7.2], [600, 507, 7.6], lt / dur), IL.morning, { kettle: 1 }, { front: () => STAGE.steam(650, 498, 1.1, t, 4, 230 * seg(lt, .2, 1.0)) });
  }
  // 04: tilt down off the deck boards, past the edge beam, to the small waves lapping the posts below
  function s04(t, lt, dur) { camBegin(960, lerp(-280, 540, ease(seg(lt, 0, 4.3))), 1 + .05 * ease(seg(lt, 4.0, dur))); underPier(t); camEnd(); EXT.vignette(); }
  // 05: hardly any customers: empty stools, Ton alone behind the counter polishing a glass; a gull strolls past the door
  function s05(t, lt, dur) {
    int(t, camLerp([960, 540, 1.0], [960, 535, 1.04], lt / dur), IL.morning, { door: 1, gull: 'deck', gullX: lerp(-60, 400, lt / dur) },
      { back: tonAt(880, 100, TONM.wipeGlass(lt)) });
  }
  // 06: but he doesn't mind: a small shrug, the smile
  function s06(t, lt) { int(t, [875, 505 - lt * 3, 2.5], IL.morning, { door: 1 }, { back: tonAt(880, 100, TONM.shrug(lt)) }); }
  // 07: forearms on the window ledge, eyes closed, listening to the waves; a slow push
  function s07(t, lt, dur) {
    int(t, camLerp([1350, 480, 1.7], [1360, 468, 1.86], ease(lt / dur)), IL.morning, { shutter: 1, casement: 1 },
      { back: tonAt(1330, 150, TONM.listen(lt, -266)) });
  }
  // 07b: the light on the water turns, silver morning to gold afternoon, clouds racing (a time-lapse)
  function s07b(t, lt, dur) {
    const u = ease(lt / dur);
    ext(t, [1300 + lt * 10, 640, 2.2], mix(EL.dawn, EL.gold, u), { sweep: .6 * u, drift: lt * 160 });
  }
  // 08: pours with care; 08p (air): ECU, the tea runs into the glass; 08b: the pour ends, steam lifts, the glass is set
  // for someone; the camera drifts to the empty door and the chime stirs. p: the pour clock shared by 08 and 08b
  function pour08(t, p) {
    const b = {}, pan = ease(seg(p, 3.6, 6.4));
    int(t, camLerp([880, 520, 2.3], [420, 520, 2.3], pan), AFT, { noKettle: 1, chime: .25 + .55 * seg(p, 5.2, 6.4) },
      { back: tonAt(840, 100, pourRig(p), 1, b), mid: pourGlass(b, { x: 966, fill: .8 * ease(seg(p, .55, 2.1)), stream: p > .55 && p < 2.2, steam: seg(p, 1.6, 2.6), t }) });
  }
  const s08 = (t, lt) => pour08(t, lt), s08b = (t, lt) => pour08(t, lt + 2.0);
  const s08p = (t, lt, dur) => STAGE.pourCU(t, lt, dur, { light: 'warm', fill: [.45, .8] });

  // ---------- 04's set: the deck boards from above, the edge beam, then under the pier (world y -1100 .. 1080) ----------
  function underPier(t) {
    boilSeed('under');
    gp(rectPts(-60, -1160, W + 120, 1160), '#8C7766');                       // the deck, looking down on the boards
    for (let i = 0; i < 11; i++) {
      const y = -1120 + i * 100;
      gp(rectPts(-60, y + 92, W + 120, 8), '#2E3E46');                       // the gaps, the sea glinting through them
      for (let k = 0; k < 6; k++) gp(rectPts(hash(i * 9 + k) * W, y + 94, 30 + 40 * hash(k + i), 3), '#C8D6D4', 120 + 100 * Math.sin(t * 2 + i + k));
      gp(rectPts(-60, y + 6, W + 120, 14), '#A28C78', 70, { curv: .3 });
      for (let k = 0; k < 4; k++) st([[(hash(i * 5 + k) + k) * 480 - 60, y], [(hash(i * 5 + k) + k) * 480 - 60, y + 92]], .7, '#6C5A4C');
    }
    gp(rectPts(-60, -60, W + 120, 70), '#4E3E36');                           // the edge beam
    gp(rectPts(-60, -60, W + 120, 10), '#6E5A4C');
    gp(rectPts(-60, 10, W + 120, 400), '#3A302E');                           // under the boards
    for (let i = 0; i < 6; i++) gp(rectPts(-60, 40 + i * 62, W + 120, 5), '#D8DCCF', 190);
    for (let i = 0; i < 14; i++) {                                         // water light shimmering on the underside
      const x = hash(i * 3.1) * W, y = 70 + hash(i * 5.7) * 280, w = 40 + 60 * hash(i), s = Math.sin(t * 2 + i * 1.7);
      gp(ellPts(x + s * 14, y, w, 6, 14, 0), '#9FC0C0', 60 + 40 * s);
    }
    gp(rectPts(-60, 390, W + 120, 170), '#5E7A84');
    glow(1250, 470, 520, '#E8E4D0', .3);
    gp(rectPts(-60, 520, W + 120, 620), '#2F4A54');
    for (const [x, w] of [[1040, 34], [700, 46], [1330, 52], [260, 74], [1700, 96]]) {
      const yb = 560 + w * 3, lap = Math.sin(t * 1.6 + x) * 5;
      gp(rectPts(x - w / 2, 10, w, yb + 40 - 10), '#3E3230');
      gp(rectPts(x - w / 2, yb - 30 + lap, w, 40), '#4E5A50');                // weed and barnacles at the waterline
      for (let k = 0; k < 6; k++) gp(ellPts(x - w / 2 + hash(x + k) * w, yb - 24 + hash(x * 2 + k) * 24, 4 + w * .06, 3 + w * .04, 8, 0), '#C8C4B4');
      st([[x - w / 2 - 22, yb + 8 + lap], [x, yb + 2 + lap * .5], [x + w / 2 + 22, yb + 8 + Math.sin(t * 1.6 + x + 1) * 5]], 1.4, '#9FB6BA');
      gp(ellPts(x, yb + 10 + lap, w * .9, 5, 14, 0), '#7E9CA4', 120);         // the wave wrapping the post
    }
    for (let i = 0; i < 16; i++) {
      const y = 600 + i * 30, x = (hash(i * 7.3) * W + t * 18 * (1 + i % 3)) % (W + 240) - 120, s = Math.sin(t * 1.2 + i);
      st([[x - 120, y + s * 4], [x, y - 3], [x + 120, y + s * 4]], .9, '#7E9CA4');
    }
  }

  shots([
    [0, s01], [V(2.56), s02], [V(6.00), s03a], [V(8.80), s03b], [V(10.00), s03c], [G(11.45, 1.0), s03d], [V(11.60), s04],
    [V(16.50), s05], [V(18.96), s06], [V(20.75), s07], [V(23.00), s07b], [V(25.60), s08], [G(27.28), s08p], [G(27.28, 3.0), s08b],
  ]);
})();
