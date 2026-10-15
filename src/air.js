// air.js: the air-time plan (Nick, 2026-10-15: the narration ran on without a breath; stretch the film to ~200 s). AIR opens
// a silence in the narration at a pause between its words, and every shot time goes through the same warp, so the picture
// keeps its sync.
//   AIR row [a, s, what fills it]: s seconds of air at narration time a (a must sit inside a pause of narration.wav)
//   AIRV(a)      video time of narration time a: the 4 s pre-roll + a + all air opened before a. A shot at V(b) with a
//                gap just before b starts when that air ends, so the shot before it holds through the air.
//   AIRG(a, off) video time `off` s into the gap opened at a: for the inserts that fill a gap
// scripts/air.mjs cuts assets/narration.wav to the same plan into assets/narration_air.wav. Load right after config.js.
const AIR = [
  [2.40, 3.0, '01 the sea, gulls'], [5.90, .8, '02 the noren settles'], [8.78, 2.0, '03a morning floods in'],
  [9.90, .6, '03b wiping'], [11.45, 2.4, '03c the flame catches + 03d kettle CU'], [15.55, 3.0, '04 waves lap the posts'],
  [18.80, .6, '05 the gull'], [20.60, .8, '06 the smile'], [22.65, 3.0, '07 listening to the waves'], [25.50, 2.0, '07b light turns'],
  [27.28, 3.0, '08p ECU: tea pours into the glass'], [30.95, 2.0, '08b the empty door, the chime'],
  [34.35, 2.5, '09 clouds, wind, the lights come on'], [37.70, 4.4, '10 the rain sweeps in + 10b boots splashing through it'],
  [41.05, .6, '11a running'], [43.35, 1.0, '11b the scrap flies'], [46.45, .8, '12a dripping'], [49.55, 1.8, '12b laughing'],
  [51.95, .6, '13a'], [54.15, 2.2, '13b the towel'],
  [56.15, 1.2, '14 she settles before the pour'], [58.65, 2.8, '14 the glass fills, steam'], [61.85, 2.6, '15 steam threads'],
  [64.20, 1.2, '16a the sip'], [66.45, 2.6, '16b lightning, thunder'], [69.45, 1.5, '17'], [71.35, 3.5, '17 the held quiet'],
  [73.95, 1.2, '18 clouds part'], [77.10, 3.5, '18 the gold runs over the water'], [79.00, .8, '19a'], [81.10, 1.0, '19b'],
  [83.20, .8, '19c'], [86.30, 1.2, '20a the smile after "เก็บไว้นะคะ"'], [89.60, 3.0, '20c she walks away down the pier'],
  [90.90, .8, '21'], [94.10, 2.8, '21 gold to dusk'],
  [97.10, .8, '22a'], [98.30, 1.2, '22b the kettle'], [99.20, 2.8, '22c waiting'], [101.10, 2.5, '23a she walks in from the rain'],
  [102.75, 3.2, '23b the empty door + 24p ECU: the second glass poured'], [104.55, 2.6, '24 two glasses'], [107.60, 1.5, '25 the pull-back'],
];
const AIR_PRE = 4.0, AIR_TOTAL = +AIR.reduce((s, g) => s + g[1], 0).toFixed(2);
const AIRG = (a, off = 0) => { let s = 0; for (const [g, d] of AIR) if (g < a) s += d; return +(AIR_PRE + a + s + off).toFixed(2); };
const AIRV = a => AIRG(a);
PROJECT.duration = +(PROJECT.duration + AIR_TOTAL).toFixed(2);
PROJECT.audio = 'out/audio/mix.wav';                   // no narration (Nick, 2026-10-15): dialogue + SFX + music (scripts/mix.mjs)
