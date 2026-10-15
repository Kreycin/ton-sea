// animatic.js: rough animatic of STORYBOARD.md v1. One held still per cut; a storyboard shot with "→" (07, 08, 20b) gets
// one still per beat, so 37 shots make 43 cuts. Video time = audio time A + 4.0 s pre-roll (PROJECT).
// Built sets: INT.set, EXT.wide, GH (the ghibli.js shop front). Sets not built yet are plain gouache cards: the long pier
// (11a/b), the insert 15, and 16b (an OTS silhouette until Mai has a back view).
// Each cut holds its telling pose (lt is fixed per cut); t still runs, so boil, rain and steam move.
// ANIM.tags: the cut number top-left, for review only. scripts/animatic.py reads the CUTS table below by regex.
(() => {
  const PRE = 4.0, V = a => +(a + PRE).toFixed(2);
  const IL = INT.L, EL = EXT.L, mix = INT.mixL;
  const AFT = mix(IL.morning, IL.gold, .55);                                // the afternoon after the 07 time-lapse
  window.ANIM = { tags: true };
  const { lp, foot, tonAt, maiAt, maiStool, tonStool, both, solo, pourRig, steam, pourGlass, dawnSky, ragOnTop } = STAGE;
  // set wrappers: each returns fn(t) that paints the whole frame (see stage.js)
  const int = (cam, L, o = {}, cast = () => ({})) => t => STAGE.int(t, cam, L, o, cast(t));
  const ext = (cam, L, o = {}, extra) => t => STAGE.ext(t, cam, L, o, extra);
  const gh = (cam, cast, o = {}) => t => STAGE.gh(t, cam, cast, o);

  const twoSteam = t => () => { steam(924, 578, 1, t); steam(993, 577, 1, t + .4); };

  // ---------- cards for the sets not built yet ----------
  // 20b, second beat: she walks away down the gold pier, small, toward the shore
  function tinyMai(t) {
    const s = .62, [sx, sy] = EXT.pj(-9 + 13.5 * s, 2.2, 13 + 34 * s), k = 1.65 * 1400 / (13 + 34 * s) / 480;
    boilSeed('mai'); mai(sx, sy, k, {}, -1, MAIM.walk(.4), .4);
  }
  const black = () => gp(rectPts(-60, -60, W + 120, H + 120), '#0E0C10');

  // ---------- the cuts: [id, A (audio s), frame] ----------
  const CUTS = [
    ['01', -4.00, ext([1010, 560, 1.1], EL.dawn, { drift: 20 })],
    ['02', 2.56, gh([720, 610, 1.55], () => { foot(700, 896, 64); boilSeed('ton'); ton(700, 896, .82, {}, 1, TONM.noren(2.5)); }, { dry: true, sky: dawnSky, wash: ['#F2ECE0', 46] })],
    ['03a', 6.00, int([1160, 470, 1.65], IL.morning, { shutter: .8, casement: .8 }, () => ({ back: tonAt(1150, 120, TONM.shutter(1.2)) }))],
    ['03b', 8.80, int([900, 560, 2.2], IL.morning, {}, () => { const b = {}; return { back: tonAt(880, 120, solo(TONM.wipe(.4, -307)), 1, b), mid: ragOnTop(b) }; })],
    ['03c', 10.00, int([600, 515, 3.4], IL.morning, { kettle: .9 })],
    ['05', 16.50, int([960, 540, 1], IL.morning, { door: 1, gull: 'deck' }, () => ({ back: tonAt(880, 100, TONM.wipeGlass(1)) }))],
    ['06', 18.96, int([875, 505, 2.5], IL.morning, { door: 1 }, () => ({ back: tonAt(880, 100, TONM.shrug(.7)) }))],
    ['07', 20.75, int([1350, 480, 1.7], IL.morning, { shutter: 1, casement: 1 }, () => ({ back: tonAt(1330, 150, TONM.listen(1, -266)) }))],
    ['07b', 23.00, ext([1300, 640, 2.2], EL.dawn)],
    ['07c', 23.85, ext([1300, 640, 2.2], mix(EL.dawn, EL.gold, .5))],
    ['07d', 24.70, ext([1300, 640, 2.2], EL.gold, { sweep: .5 })],
    ['08a', 25.60, int([880, 520, 2.3], AFT, {}, () => { const b = {}; return { back: tonAt(840, 100, pourRig(1.2), 1, b), mid: pourGlass(b) }; })],
    ['08b', 28.60, int([420, 520, 2.3], AFT, { chime: .8 })],
    ['09', 31.10, ext([960, 540, 1], mix(EL.dawn, EL.grey, .85), { lights: 1, drift: 60 })],
    ['10', 34.47, gh([720, 680, 1.35], null)],
    ['11a', 37.80, t => STAGE.pier(t, [960, 540, 1], MAIM.run(.35), .6)],
    ['11b', 41.13, t => STAGE.pier(t, [930, 560, 1.7], MAIM.run(.62), .6, { scrap: .45 })],
    ['12a', 43.45, gh([1180, 640, 1.55], t => { foot(1340, 932, 56); boilSeed('mai'); mai(1340, 932, .86, {}, -1, MAIM.brake(.7), t); }, { pud: true })],
    ['12b', 46.57, gh([1340, 640, 2.5], t => { foot(1340, 932, 56); boilSeed('mai'); mai(1340, 932, .86, {}, -1, MAIM.pant(2.3), t); }, { pud: true })],
    ['13a', 49.68, GH.frame],
    ['13b', 52.12, gh([1170, 600, 2.3], t => {
      foot(1030, 898, 60); foot(1310, 932, 56);
      boilSeed('ton'); ton(1030, 898, .82, {}, 1, TONM.offer(1));
      boilSeed('mai'); mai(1310, 932, .86, {}, -1, MAIM.takeTowel(1), t);
    })],
    ['14', 54.24, int([1080, 500, 1.45], IL.rain, { prints: 1, umb: 'lean', kettle: 1 }, () => { const b = {}; return { back: both(tonAt(1000, 100, pourRig(1.2), 1, b), maiStool(MAIM.sitCup(.5))), mid: pourGlass(b) }; })],
    ['15', 58.80, null],                                                  // animated in a03_storm.js
    ['16a', 61.95, int([1330, 600, 3.0], IL.rain, { umb: 'lean' }, () => ({ back: maiStool(MAIM.sitCup(.5)) }))],
    ['16b', 64.26, null],
    ['17', 66.57, int([1010, 520, 1.12], IL.rain, { kettle: 1, umb: 'lean', prints: .6, glasses: 1 }, () => ({ back: both(tonAt(820, 100, TONM.wipeGlass(1)), maiStool(MAIM.watch(1))) }))],
    ['18', 71.45, ext([960, 520, 1], EL.gold, { rays: 1, sweep: .75, rain: .1 })],
    ['19a', 77.15, int([1220, 540, 1.6], IL.gold, { shutter: 1, casement: 1, door: 1 }, () => ({ mid: maiAt(1240, 300, MAIM.standUp(1.2), -1) }))],
    ['19b', 79.10, int([1300, 540, 2.6], IL.gold, { shutter: 1, casement: 1, door: 1 }, () => ({ mid: maiAt(1240, 300, MAIM.lookUmb(1.6), -1) }))],
    ['19c', 81.20, int([580, 560, 1.7], IL.gold, { door: 1, umb: 'lean', gull: 'rail' }, () => ({ mid: maiAt(560, 300, MAIM.leanUmb(1.4), -1) }))],
    ['20a', 83.28, int([400, 540, 2.5], IL.gold, { door: 1, umb: 'lean' }, () => ({ mid: maiAt(470, 300, MAIM.smile(1.2), 1) }))],
    ['20b', 87.20, int([875, 505, 2.5], IL.gold, { door: 1, umb: 'lean' }, () => ({ back: tonAt(880, 100, TONM.glance(2.2)) }))],
    ['20c', 88.60, ext([1000, 700, 1.5], EL.gold, { sweep: 1 }, tinyMai)],
    ['21', 89.73, int([480, 470, 2.6], mix(IL.gold, IL.dusk, .5), { umb: 'hook' })],
    ['22a', 94.15, int([875, 505, 2.5], IL.rain, { umb: 'hook', kettle: .3 }, () => ({ back: tonAt(880, 100, TONM.glance(2.2)) }))],
    ['22b', 97.20, int([600, 515, 3.4], IL.rain, { kettle: .9, umb: 'hook' })],
    ['22c', 98.40, int([1150, 520, 1.3], IL.rain, { umb: 'hook' }, () => ({ back: tonStool(TONM.sitWait(1)) }))],
    ['23a', 99.25, int([370, 760, 2.6], IL.rain, { door: 1, prints: 1, umb: 'hook' }, () => ({ back: maiAt(300, 40, MAIM.walk(.3), 1) }))],
    ['23b', 101.15, int([370, 760, 2.6], IL.rain, { door: 1, prints: .3, umb: 'hook' })],
    ['24', 102.80, int([958, 560, 3.4], IL.dusk, { glasses: 2, umb: 'hook' }, t => ({ mid: twoSteam(t) }))],
    ['25', 104.64, ext([960, 540, 1], EL.dusk)],
    ['end', 111.75, black],
  ];
  // cuts inside an animated act's span (ACT_SPANS, pushed by the aNN files loaded before this one) give way to it
  const live = ([, a]) => !(window.ACT_SPANS || []).some(([v0, v1]) => V(a) >= v0 - 1e-6 && V(a) < v1 - 1e-6);
  shots(CUTS.filter(live).map(([id, a, fn]) => [V(a), (t, lt, dur) => {
    fn(t, lt, dur);
    if (ANIM.tags && id !== 'end') letter(id, 44, 52, 40, '#F4EEE2', { screen: true, align: 'left', alpha: .85 });
  }]));
})();
