// a04_gold.js: act 4, "the gold light and the umbrella left behind" (STORYBOARD.md shots 18–21, video 75.45–98.15 s).
// The rain stops, the clouds part, gold runs over the water; Mai gets up, leaves her broken umbrella by the door
// ("เก็บไว้นะคะ"), and walks away down the gold pier. From then on it hangs on the shop's wall.
(() => {
  const V = AIRV, G = AIRG;
  (window.ACT_SPANS = window.ACT_SPANS || []).push([V(71.45), V(94.15)]);
  const { int, ext, tonAt, maiAt } = STAGE;
  const { pj, fz, FL } = INT;
  const IL = INT.L, EL = EXT.L, mix = INT.mixL;
  const camLerp = (a, b, u) => { const v = u <= 1 ? .35 * u + .65 * ease(u) : 1 + .35 * Math.min(u - 1, .2); return a.map((x, i) => lerp(x, b[i], v)); };   // eased drift, runs on gently through a dissolve

  // 18: the rain thins and stops, the clouds part, rays come down and the gold runs over the water to the shop; pan up
  function s18(t, lt, dur) {
    ext(t, camLerp([960, 600, 1.08], [960, 505, 1.08], ease(lt / dur)), mix(EL.grey, EL.gold, ease(seg(lt, .6, 6.4))),
      { rain: .5 * (1 - seg(lt, 0, 3.4)), rays: ease(seg(lt, 2.4, 5.4)), sweep: .78 * ease(seg(lt, 3.0, 8.2)), drift: lt * 40 });
  }
  // 19a: she gets up from the window seat; the towel is folded on the ledge beside her glass
  function s19a(t, lt, dur) {
    const r = MAIM.standUp(lt - .25), [sx, sy] = pj(1300, FL - 180, 200), [, fy] = pj(1300, FL, 200), k = .82 * fz(200);
    const y = lerp(fy, sy + 110 * k, r.sit || 0);
    int(t, camLerp([1320, 640, 1.6], [1315, 630, 1.66], lt / dur), IL.gold, { shutter: 1, casement: 1, door: 1, glasses: 1 },
      { back: () => { towelLedge(); boilSeed('mai'); mai(sx, y, k, {}, -1, r, r.t); } });
  }
  function towelLedge() {                                                  // folded, the red stripe along it
    boilSeed('fold');
    const q = (x, y, z) => pj(x, y, z);
    paint([q(1430, 626, 50), q(1530, 626, 50), q(1532, 640, 70), q(1426, 640, 70)], { wash: CAST.towel, ink: CAST.ink, sw: .7, curv: .2 });
    st([q(1428, 634, 60), q(1531, 634, 60)], 2.2, CAST.towelLine);
  }
  // 19b: CU: she holds the closed broken umbrella up and looks at it, the bent ribs, the torn cloth
  function s19b(t, lt, dur) {
    int(t, camLerp([1300, 540, 2.6], [1300, 532, 2.75], lt / dur), IL.gold, { shutter: 1, casement: 1, door: 1 },
      { mid: maiAt(1240, 300, MAIM.lookUmb(lt), -1) });
  }
  // 19c: she leans it against the door frame (the set draws it after the release); the gold outside rims the frame
  function s19c(t, lt) {
    int(t, camLerp([578, 563, 1.7], [588, 556, 1.77], lt / 2.08), IL.gold, { door: 1, umb: lt > 1.0 ? 'lean' : null, gull: 'rail' }, { mid: maiAt(560, 300, MAIM.leanUmb(lt), -1) });
  }
  // 20a: MCU: at the door she smiles and says "เก็บไว้นะคะ" (keep it), a small nod on the words; her hair drying
  function s20a(t, lt, dur) {
    const r = MAIM.smile(lt);
    int(t, camLerp([400, 540, 2.5], [404, 534, 2.62], lt / dur), IL.gold, { door: 1, umb: 'lean' }, { mid: maiAt(470, 300, r, 1) });
  }
  // 20b: reverse, MCU Ton: still a moment, then the soft smile
  const TON20 = lt => ({ t: lt, ...pose(lt, [
    [0, { armF: [138, -268], armB: [96, -272], handF: .1, handB: .1, bFront: false, lean: .1, nod: 0, face: { eyes: 'open', mouth: 'flat', look: -1, brow: .3 } }],
    [.7, { nod: .06, face: { eyes: 'half', mouth: 'smile', look: -1, brow: -.2 }, _d: .45 }],
  ]) });
  function s20b(t, lt) { int(t, [875, 505 - lt * 4, 2.5], IL.gold, { door: 1, umb: 'lean' }, { back: tonAt(880, 100, TON20(lt)) }); }
  // 20c: WS: she walks away down the gold pier toward the shore, small
  function s20c(t, lt) {
    ext(t, [1000 - lt * 8, 700 - lt * 4, 1.5 - lt * .02], EL.gold, { sweep: 1 }, () => {
      const s = .58 + .05 * lt, [sx, sy] = EXT.pj(-9 + 13.5 * s, 2.2, 13 + 34 * s), k = 1.65 * 1400 / (13 + 34 * s) / 480;
      boilSeed('mai'); mai(sx, sy, k, {}, -1, MAIM.walk(lt), lt);
    });
  }
  // 21: since that day the broken umbrella hangs on the hook on the shop wall: a slow push while the light turns
  // from gold to dusk across the wall (a time-lapse)
  function s21(t, lt, dur) {
    const u = ease(lt / dur);
    int(t, camLerp([480, 470, 2.4], [478, 462, 2.75], u), mix(IL.gold, IL.dusk, u), { umb: 'hook' });
  }

  shots([
    [V(71.45), s18], [V(77.15), s19a], [V(79.10), s19b], [V(81.20), s19c],
    [V(83.28), s20a], [V(87.20), s20b], [V(88.60), s20c], [V(89.73), s21],
  ]);
})();
