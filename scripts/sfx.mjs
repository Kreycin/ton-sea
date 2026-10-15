// sfx.mjs: the film's ambience and sound effects, made in code (no samples, no libraries): the sea and its laps, rain,
// wind, thunder, gulls, the shutters, the kettle (clunk, flame, simmer, its song), the tea pours, the door chime, boots in
// puddles and steps on the boards, drips, the clock. Everything is placed on the shot list (out/shots.txt, written by
// scripts/shotlist.mjs), so the sound follows the picture. Writes four stems for scripts/mix.mjs:
//   out/audio/sfx_sea.wav  sfx_rain.wav  sfx_wind.wav  sfx_fx.wav   (48 kHz stereo float; fx carries a small room reverb)
// Usage: node scripts/shotlist.mjs > out/shots.txt && node scripts/sfx.mjs
import fs from 'fs';

const SR = 48000, TAU = Math.PI * 2;
const SH = Object.fromEntries(fs.readFileSync('out/shots.txt', 'utf8').trim().split('\n')
  .map(l => l.trim().split(/\s+/)).map(([t, d, n]) => [n, { t: +t, d: +d }]));
const NAMES = Object.keys(SH), DUR = SH.s25.t + SH.s25.d, N = Math.ceil(DUR * SR);
const at = (shot, lt = 0) => +(SH[shot].t + lt).toFixed(3);
const RUN = 1 / (2 * 1.45), WALK = 1 / (2 * .95);             // footfall spacing (moves.js RUN_CAD, WALK_CAD)

// ---- sources and filters ----
function rng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
const white = seed => { const r = rng(seed); return () => r() * 2 - 1; };
const pink = seed => {
  const w = white(seed); let b0 = 0, b1 = 0, b2 = 0;
  return () => { const x = w(); b0 = .99765 * b0 + x * .099046; b1 = .963 * b1 + x * .2965164; b2 = .57 * b2 + x * 1.0526913; return (b0 + b1 + b2 + x * .1848) * .25; };
};
const brown = seed => { const w = white(seed); let y = 0; return () => (y = (y + .02 * w()) * .998) * 3.5; };
const onePole = () => { let y = 0; return (x, f) => (y += (1 - Math.exp(-TAU * f / SR)) * (x - y)); };
class Biquad {
  constructor() { this.x1 = this.x2 = this.y1 = this.y2 = 0; }
  set(type, f, q) {
    const w = TAU * Math.min(Math.max(f, 20), SR * .45) / SR, c = Math.cos(w), s = Math.sin(w), a = s / (2 * q), a0 = 1 + a;
    const [b0, b1, b2] = type === 'bp' ? [a, 0, -a] : type === 'lp' ? [(1 - c) / 2, 1 - c, (1 - c) / 2] : [(1 + c) / 2, -(1 + c), (1 + c) / 2];
    this.b0 = b0 / a0; this.b1 = b1 / a0; this.b2 = b2 / a0; this.a1 = -2 * c / a0; this.a2 = (1 - a) / a0;
    return this;
  }
  run(x) {
    const y = this.b0 * x + this.b1 * this.x1 + this.b2 * this.x2 - this.a1 * this.y1 - this.a2 * this.y2;
    this.x2 = this.x1; this.x1 = x; this.y2 = this.y1; this.y1 = y; return y;
  }
}
const env = (t, a, d) => t < a ? t / a : Math.exp(-(t - a) / d);
const fade = (t, len, a = .05, r = .2) => Math.max(0, Math.min(1, t / a, (len - t) / r));
function ramp(keys) {                                          // keys [[t, v], ...] sorted: linear between, held outside
  let i = 0;
  return t => {
    const n = keys.length;
    if (t <= keys[0][0]) return keys[0][1];
    if (t >= keys[n - 1][0]) return keys[n - 1][1];
    while (keys[i + 1][0] < t) i++;
    while (keys[i][0] > t) i--;
    const [t0, v0] = keys[i], [t1, v1] = keys[i + 1];
    return t1 > t0 ? v0 + (v1 - v0) * (t - t0) / (t1 - t0) : v1;
  };
}

// ---- the ambience, shot by shot ----
// sea: level; sl: how open the sea sounds (lowpass Hz: low = heard through the walls); rain, rl: rain and its lowpass;
// wind. A number holds for the shot, [[lt, v], ...] moves inside it; cuts crossfade over 0.7 s.
const DEF = { sea: .4, sl: 800, rain: 0, rl: 6000, wind: 0 };
const EXT = { sea: 1, sl: 2600 }, IN = { sea: .38, sl: 450 }, OPEN = { sea: .55, sl: 1100 };
const AMB = {
  s01: { ...EXT, wind: .12 }, s02: { sea: .8, sl: 2300, wind: .1 },
  s03a: { sea: [[0, .22], [.4, .22], [1.1, .55]], sl: [[0, 360], [.4, 360], [1.1, 1100]] },   // the shutters open
  s03b: OPEN, s03c: { sea: .45, sl: 900 }, s03d: { sea: .4, sl: 800 },
  s04: { sea: 1.05, sl: 2000 }, s05: OPEN, s06: OPEN, s07: { sea: .7, sl: 1500 }, s07b: { ...EXT, wind: .15 },
  s08: { sea: .45, sl: 900 }, s08p: { sea: .35, sl: 700 }, s08b: { sea: .5, sl: 1000, wind: .06 },
  s09: { sea: [[0, 1], [5.9, 1.25]], sl: [[0, 2600], [5.9, 3200]], wind: [[0, .2], [5.9, .75]] },
  s10: { sea: 1.15, sl: 3000, wind: .65, rain: [[0, 0], [1.1, 0], [3.4, 1]] },
  s10b: { sea: .8, sl: 2600, wind: .5, rain: 1 }, s11a: { sea: 1.2, sl: 3200, wind: .75, rain: 1 },
  s11b: { sea: 1.2, sl: 3200, wind: .7, rain: 1 }, s12a: { sea: 1, sl: 2600, wind: .5, rain: .85 },
  s12b: { sea: 1, sl: 2600, wind: .5, rain: .85 }, s13a: { sea: 1.1, sl: 3000, wind: .6, rain: 1 },
  s13b: { sea: 1, sl: 2600, wind: .5, rain: .95 },
  s14: { ...IN, rain: .75, rl: 650, wind: .2 }, s15: { ...IN, rain: .7, rl: 600, wind: .18 }, s16a: { ...IN, rain: .75, rl: 650, wind: .2 },
  s16b: { sea: .45, sl: 550, rain: .9, rl: 1100, wind: .28 },                                 // at the window
  s17: { ...IN, rain: [[0, .75], [9.88, .5]], rl: 650, wind: [[0, .2], [9.88, .1]] },
  s18: { sea: [[0, 1], [6, .85]], sl: 2500, rain: [[0, .5], [3.4, 0]], rl: 6000, wind: [[0, .3], [4, .06]] },
  s19a: OPEN, s19b: OPEN, s19c: { sea: .6, sl: 1300 }, s20a: { sea: .6, sl: 1300 }, s20b: OPEN,
  s20c: { sea: .85, sl: 2400, wind: .06 }, s21: { sea: .42, sl: 800 },
  s22a: { ...IN, rain: .7, rl: 650 }, s22b: { ...IN, rain: .7, rl: 650 }, s22c: { sea: .4, sl: 500, rain: .8, rl: 950 },
  s23a: { sea: .6, sl: 1500, rain: .7, rl: 2400, wind: .1 }, s23b: { sea: .6, sl: 1500, rain: .85, rl: 3200, wind: .1 },   // the door open
  s24p: { ...IN, rain: .6, rl: 650 }, s24: { ...IN, rain: [[0, .6], [4.4, .4]], rl: 650 },
  s25: { sea: .9, sl: 2300, rain: [[0, .3], [4.5, 0]], rl: 4500, wind: .05 },
};
function track(p) {
  const keys = [], X = .35;
  NAMES.forEach((n, i) => {
    const s = SH[n], v = AMB[n][p] ?? DEF[p], ks = Array.isArray(v) ? v : [[0, v]];
    let last = 0;
    for (const [lt, val] of ks) keys.push([last = Math.max(s.t + lt, i ? s.t + X : 0), val]);
    keys.push([Math.max(last, s.t + s.d - X), ks[ks.length - 1][1]]);
  });
  return ramp(keys.sort((a, b) => a[0] - b[0]));
}
const crest = (t, per, off) => { const p = ((t / per + off) % 1 + 1) % 1; return p < .22 ? (p / .22) ** 2 : Math.exp(-(p - .22) * 4.5); };
const swell = t => Math.min(1, .55 * crest(t, 6.8, 0) + .45 * crest(t, 9.3, .4) + .08);   // a wave: quick rise, long wash
const GUSTS = [[at('s09', 4.2), .35, .5, 1.2], [at('s10', 1.0), .3, .4, 1.0], [at('s11b', .35), .95, .25, .9]];  // [peak, size, rise, fall]
const gust = t => GUSTS.reduce((s, [p, a, r, f]) => s + a * Math.exp(-(((t - p) / (t < p ? r : f)) ** 2)), 0);

// ---- stems ----
const L = new Float32Array(N), R = new Float32Array(N), VL = new Float32Array(N), VR = new Float32Array(N);
function seaBed() {
  const S = track('sea'), F = track('sl');
  for (const [out, seed, ph] of [[L, 11, 0], [R, 12, 1.3]]) {
    const src = pink(seed), rum = brown(seed + 5), a = onePole(), b = onePole(), c = onePole();
    for (let i = 0; i < N; i++) {
      const t = i / SR, sw = swell(t + ph), f = F(t) * (.45 + .75 * sw);
      out[i] = S(t) * (b(a(src(), f), f) * (.3 + .7 * sw * sw) * 1.6 + c(rum(), 160) * (.6 + .4 * sw) * .5);
    }
  }
  const r = rng(3);                                            // the small waves lapping the posts (04) and the shore
  for (const [s, rate, g] of [['s04', 1.4, .5], ['s01', .5, .15], ['s20c', .4, .12], ['s25', .45, .12]])
    for (let t = at(s, .3); t < at(s, SH[s].d - .4); t += (.5 + r()) / rate) put(t, .5, lap(Math.floor(r() * 1e6)), { gain: g * (.5 + .5 * r()), pan: r() * 1.2 - .6, send: 0 });
}
function rainBed() {
  const A = track('rain'), F = track('rl');
  for (const [out, seed] of [[L, 21], [R, 22]]) {
    const w = white(seed), r = rng(seed + 9), p = pink(seed + 3), hp = onePole(), l1 = onePole(), l2 = onePole(), lb = onePole();
    let drop = 0, df = 0, dph = 0, dd = 0;
    for (let i = 0; i < N; i++) {
      const t = i / SR, a = A(t);
      if (a < 1e-4) continue;
      const x = w(), f = F(t);
      if (r() < a * 90 / SR) { drop = .3 + .7 * r(); df = 2000 + 4000 * r(); dph = 0; dd = Math.exp(-1 / (SR * (.002 + .004 * r()))); }
      let d = 0;
      if (drop > 1e-4) { dph += TAU * df / SR; d = drop * Math.sin(dph); drop *= dd; }
      out[i] = a * (l2(l1((x - hp(x, 1400)) * .35 + d * .8, f), f) + lb(p(), Math.min(f, 900)) * .5);
    }
  }
}
function windBed() {
  const A = track('wind');
  for (const [out, seed] of [[L, 31], [R, 32]]) {
    const p = pink(seed), b1 = new Biquad(), b2 = new Biquad(), r = rng(seed);
    let walk = 0, g = 0;
    for (let i = 0; i < N; i++) {
      const t = i / SR;
      if (i % 64 === 0) {
        walk = walk * .995 + (r() - .5) * .05; g = gust(t);
        const fc = Math.max(160, 380 + 240 * Math.sin(TAU * t / 5.3 + seed) + 600 * walk + 500 * g);
        b1.set('bp', fc, 1.8); b2.set('bp', fc * 2.3, 6);
      }
      const x = p(), a = Math.min(1.4, A(t) + g) * (.6 + .4 * Math.sin(TAU * t / 3.1 + seed * 2) ** 2);
      out[i] = a * (b1.run(x) + b2.run(x) * .25);
    }
  }
}

// ---- one-shot sounds: gen(t, j) gives the samples; put() normalises each to peak 1, so `gain` is its peak ----
function put(t0, len, gen, { gain = 1, pan = 0, send = .25, lp = 0 } = {}) {
  const n = Math.round(len * SR), buf = new Float32Array(n);
  for (let j = 0; j < n; j++) buf[j] = gen(j / SR, j);
  if (lp) { const a = onePole(), b = onePole(); for (let j = 0; j < n; j++) buf[j] = b(a(buf[j], lp), lp); }
  let pk = 1e-9; for (const v of buf) pk = Math.max(pk, Math.abs(v));
  const q = (pan + 1) * Math.PI / 4, gl = Math.cos(q) * Math.SQRT2 * gain / pk, gr = Math.sin(q) * Math.SQRT2 * gain / pk;
  for (let j = 0, k = Math.round(t0 * SR); j < n; j++, k++) {
    if (k < 0 || k >= N) continue;
    L[k] += buf[j] * gl; R[k] += buf[j] * gr; VL[k] += buf[j] * gl * send; VR[k] += buf[j] * gr * send;
  }
}
const thump = (f0, dec) => t => Math.sin(TAU * (.7 * f0 * t + .3 * f0 * (1 - Math.exp(-t * 25)) / 25)) * Math.exp(-t / dec);
function knock(seed, f0, fk, dec = .07) {                      // wood: a low thump and a short hollow knock
  const w = white(seed), b = new Biquad().set('bp', fk, 1.6), th = thump(f0, dec);
  return t => .9 * th(t) + b.run(w()) * 3 * env(t, .002, dec * .5);
}
function click(seed, f) { const w = white(seed), b = new Biquad().set('bp', f, 3); return t => b.run(w()) * env(t, .0005, .004); }
function creak(seed, len) {                                    // a hinge: stick-slip pulses ringing a wooden body
  const b1 = new Biquad().set('bp', 950, 9), b2 = new Biquad().set('bp', 2300, 12), r = rng(seed);
  let ph = 0;
  return t => {
    const u = t / len; ph += (35 + 80 * u + 15 * Math.sin(t * 23)) / SR;
    let x = 0; if (ph >= 1) { ph -= 1; x = .6 + .4 * r(); }
    return Math.sin(Math.PI * Math.min(1, u)) ** .5 * (b1.run(x) + .5 * b2.run(x));
  };
}
function rub(seed, f, shape, len) { const w = white(seed), b = new Biquad().set('bp', f, .9); return t => b.run(w()) * shape(t) * fade(t, len, .2, .3); }
function clunk(seed) {                                         // the copper kettle set down on the iron stove
  const r = rng(seed), k = knock(seed, 80, 500), P = [430, 1180, 1960, 2870, 4100].map(f => [f * (.97 + .06 * r()), r() * TAU]);
  const D = [.35, .2, .14, .09, .06], A = [1, .7, .5, .35, .25];
  return t => .5 * Math.min(1, t / .001) * P.reduce((s, [f, p], i) => s + A[i] * Math.sin(TAU * f * t + p) * Math.exp(-t / D[i]), 0) + k(t);
}
function flame(seed, len, lvl) {                               // the gas catching (a soft whoosh), then its purr
  const p = pink(seed), b = new Biquad().set('bp', 700, .9), l1 = onePole(), l2 = onePole(), r = rng(seed + 1);
  let fl = 0;
  return t => {
    fl = fl * .9995 + (r() - .5) * .02; const x = p();
    return (b.run(x) * env(t, .06, .22) * 2.2 + l2(l1(x, 420), 420) * 1.8 * (1 + 3 * fl) * (.8 + .2 * Math.sin(TAU * 11 * t)) * lvl(t)) * fade(t, len, .02, .3);
  };
}
function simmer(seed, len) {                                   // the kettle on a low flame: a purr and the odd bubble
  const p = pink(seed), l = onePole(), r = rng(seed + 2);
  let bub = 0, bf = 0, ph = 0;
  return t => {
    if (r() < 5 / SR) { bub = .4 + .6 * r(); bf = 350 + 500 * r(); ph = 0; }
    let y = 0; if (bub > 1e-3) { ph += TAU * bf * (1 + 2 * (1 - bub)) / SR; y = bub * Math.sin(ph); bub *= Math.exp(-1 / (SR * .012)); }
    return (l(p(), 300) * 1.2 + y * .25) * fade(t, len, .8, .8);
  };
}
function whistle(seed, len) {                                  // the kettle singing: a breathy tone that swells, rising a little
  const w = white(seed), b = new Biquad().set('bp', 1850, 14);
  let ph = 0;
  return t => {
    const u = t / len, a = Math.min(1, u * 1.8) ** 2 * Math.min(1, (len - t) / .4);
    ph += TAU * (1700 + 180 * Math.min(1, u * 1.6) + 9 * Math.sin(TAU * 5.2 * t)) / SR;
    return a * (Math.sin(ph) * .6 + .08 * Math.sin(2 * ph) + b.run(w()) * 2.5 * (.4 + .6 * a));
  };
}
function pour(seed, len, t0, fill, amp) {                      // tea into a glass: the note of the glass rises as it fills
  const w = white(seed), b1 = new Biquad(), b2 = new Biquad().set('bp', 2600, .7), g = white(seed + 1), gl = onePole();
  return (t, j) => {
    if (j % 32 === 0) b1.set('bp', 380 + 1250 * fill(t0 + t) ** 1.2, 7);
    const x = w(), gur = Math.max(0, 1 + 16 * gl(g(), 28));
    return (b1.run(x) * 4 + b2.run(x) * (.8 + 2 * env(t, .01, .12))) * gur * amp(t0 + t) * fade(t, len, .06, .25);
  };
}
const BELLS = [1568, 1760, 2093, 2349, 2637], BP = [[1, 1, 2.6], [2.32, .45, 1.4], [4.25, .22, .7], [6.63, .12, .4]];
function chime(seed, len, rate) {                              // the door chime: small brass bells struck at random, ringing out
  const r = rng(seed), hits = [];
  for (let t = 0; t < len; t += -Math.log(1 - r()) / rate) hits.push([t, BELLS[Math.floor(r() * 5)] * (.995 + .01 * r()), .4 + .6 * r()]);
  return t => {
    let s = 0;
    for (const [h, f, a] of hits) { const x = t - h; if (x < 0 || x > 3) continue; for (const [m, pa, d] of BP) s += a * pa * Math.min(1, x / .001) * Math.sin(TAU * f * m * x) * Math.exp(-x / d); }
    return s;
  };
}
function gulls(seed, n) {                                      // a gull's "kyow": up, then a long rasping fall; n in a row
  const r = rng(seed), calls = [];
  for (let k = 0, t = 0; k < n; k++) { const d = .26 + .14 * r(); calls.push([t, d, 850 + 200 * r(), .6 + .4 * r()]); t += d + .12 + .2 * r(); }
  let ph = 0;
  return x => {
    let s = 0;
    for (const [c0, d, f0, a] of calls) {
      const u = (x - c0) / d; if (u < 0 || u > 1) continue;
      ph += TAU * f0 * (u < .25 ? 1 + .3 * u / .25 : 1.3 - .55 * (u - .25) / .75) / SR;
      s += a * Math.min(1, u / .08) * Math.min(1, (1 - u) / .25) * (1 - .55 * (.5 + .5 * Math.sin(TAU * 70 * x))) *
        (Math.sin(ph) + .55 * Math.sin(2 * ph) + .35 * Math.sin(3 * ph) + .2 * Math.sin(4 * ph));
    }
    return s;
  };
}
function splash(seed, s = 1) {                                 // a boot in a puddle: thud, splash, a crown of drops
  const w = white(seed), b = new Biquad().set('bp', 1300, .8), r = rng(seed + 3), k = knock(seed + 1, 75, 300);
  const drops = Array.from({ length: 7 }, () => [.02 + .15 * r(), 2000 + 3000 * r(), .3 + .7 * r()]);
  return t => k(t) * .6 + b.run(w()) * 3 * s * env(t, .004, .07) + drops.reduce((a, [d, f, g]) => t < d ? a : a + .5 * g * Math.sin(TAU * f * (t - d)) * Math.exp(-(t - d) / .004), 0);
}
function boot(seed) {                                          // a wet rubber boot on the wooden floor: knock and a small squeak
  const k = knock(seed, 70, 420), w = white(seed + 1), b = new Biquad().set('bp', 1700, 4);
  return t => k(t) + b.run(w()) * 2.5 * env(t - .01 > 0 ? t - .01 : 0, .005, .03) * (t > .01 ? 1 : 0);
}
function drip(seed) {                                          // a water drop: a short plink rising in pitch
  const f0 = 700 + 500 * rng(seed)(); let ph = 0;
  return t => { ph += TAU * f0 * (1 + .8 * Math.min(1, t / .03)) / SR; return Math.sin(ph) * env(t, .001, .02); };
}
function lap(seed) {                                           // a small wave slapping a post
  const w = white(seed), b = new Biquad().set('bp', 600, 1.2), th = thump(180, .08);
  return t => b.run(w()) * 3 * env(t, .03, .18) + .4 * th(t);
}
function thunder(seed, len, rolls = [[.15, 1], [.9, .7], [1.7, .85], [2.6, .5], [3.5, .3]]) {   // far: a soft crack, then the low roll
  const b = brown(seed), l1 = onePole(), l2 = onePole(), r = rng(seed + 1), w = white(seed + 2), bc = new Biquad().set('bp', 700, .8);
  rolls = rolls.map(([d, a]) => [d + .2 * r(), a]);
  return t => {
    let a = 0; for (const [d, g] of rolls) { const x = t - d; if (x > 0) a += g * Math.min(1, x / .25) * Math.exp(-x / .9); }
    return (l2(l1(b(), 110), 110) * a * 3 + bc.run(w()) * env(t, .01, .25) * .5) * fade(t, len, .01, .9);
  };
}
function drips(t0, len, rate, gain, o = {}) { const r = rng(Math.round(t0 * 100)); for (let t = t0 + r() / rate; t < t0 + len; t += (.4 + 1.2 * r()) / rate) put(t, .12, drip(Math.floor(r() * 1e6)), { gain: gain * (.5 + .5 * r()), pan: o.pan ?? (r() * 1.4 - .7), send: .3, lp: o.lp || 0 }); }
function steps(t0, t1, dt, gen, g0, g1, o = {}) { let k = 0; for (let t = t0; t < t1; t += dt, k++) put(t, .4, gen(900 + k), { gain: g0 + (g1 - g0) * (t - t0) / Math.max(.01, t1 - t0), pan: o.pan ? o.pan((t - t0) / (t1 - t0)) : 0, send: o.send ?? .2, lp: o.lp || 0 }); }
function ticks(t0, t1, gain) { let k = 0; for (let t = Math.ceil(t0); t < t1; t++, k++) put(t, .03, click(700 + k, k % 2 ? 2300 : 2800), { gain, pan: -.55, send: .3 }); }
const purr = (t0, t1, g) => put(t0, t1 - t0, simmer(Math.round(t0), t1 - t0), { gain: g, pan: -.35, send: .15 });

function effects() {
  // act 1: the morning
  put(at('s01', 1.4), 2, gulls(1, 2), { gain: .1, pan: -.5, send: .45, lp: 3800 });
  put(at('s01', 5.6), 2.5, gulls(2, 3), { gain: .06, pan: .45, send: .5, lp: 3000 });
  put(at('s01', 8.2), 1, gulls(3, 1), { gain: .08, pan: -.2, send: .45, lp: 3500 });
  put(at('s02', 1.6), 1, gulls(4, 1), { gain: .045, pan: .6, send: .5, lp: 3000 });
  put(at('s03a', .3), .5, creak(5, .45), { gain: .1, pan: .3, send: .3 });                  // the shutters swing open
  put(at('s03a', .74), .5, knock(6, 95, 650), { gain: .4, pan: .35, send: .35 });           // ...knock against the wall
  put(at('s03a', .8), .3, knock(7, 120, 900, .04), { gain: .15, pan: .4, send: .3 });
  put(at('s03a', 1.0), .1, click(8, 3200), { gain: .14, pan: .45, send: .3 });              // the casement latch
  put(at('s03b'), SH.s03b.d, rub(9, 2400, t => Math.abs(Math.sin(TAU * (t + .4) / 1.6)) ** 1.5, SH.s03b.d), { gain: .06, send: .2 });   // wiping
  put(at('s03c', .85), .8, clunk(10), { gain: .4, pan: -.3, send: .3 });                    // the kettle on the stove
  put(at('s03c', 1.0), .05, click(11, 4000), { gain: .18, pan: -.3 });                      // the igniter
  const f1 = at('s03c', 1.02), cu = at('s03d');
  put(f1, at('s04') + .3 - f1, flame(12, at('s04') + .3 - f1, t => t + f1 < cu ? .55 : 1), { gain: .3, pan: -.3, send: .15 });
  purr(at('s05'), at('s07b'), .045);
  put(at('s05'), SH.s05.d, rub(13, 3600, t => .5 + .5 * Math.sin(TAU * t * 1.3) ** 2, SH.s05.d), { gain: .025, send: .2 });   // polishing a glass
  put(at('s05', 1.2), 1, gulls(14, 1), { gain: .05, pan: -.6, send: .4, lp: 1600 });       // the gull past the door
  put(at('s07b', 1.0), 2, gulls(15, 2), { gain: .08, pan: .5, send: .45, lp: 3500 });
  const pA = at('s08', .55), pE = at('s08p', 2.85);                                          // 08 / 08p: the pour (one stream, two framings)
  put(pA, pE - pA, pour(16, pE - pA, pA, ramp([[pA, 0], [at('s08p'), .45], [at('s08p', 2.45), .8]]),
    ramp([[pA, .5], [at('s08p') - .2, .5], [at('s08p') + .2, 1], [at('s08p', 2.45), 1], [pE, .3]])), { gain: .45, pan: .1, send: .2 });
  put(at('s08b', 3.1), 4, chime(17, 1.6, 2.2), { gain: .2, pan: -.4, send: .4 });          // the chime stirs by the empty door

  // act 2: the storm comes in, Mai runs through the rain
  put(at('s09', 3.4), 5, thunder(18, 5), { gain: .18, send: .1, lp: 260 });                 // far off, a first rumble
  for (let k = 0, t = at('s10b'); t < at('s11a'); k++, t = at('s10b', k * RUN))           // 10b: her boots in the puddles
    put(t, .4, splash(100 + k), { gain: k % 2 ? .42 : .48, pan: .7 - .8 * (t - at('s10b')) / SH.s10b.d, send: .12 });
  for (let k = 0, t = at('s11a', .1); t < at('s11b'); k++, t = at('s11a', .1 + k * RUN)) put(t, .4, splash(200 + k, .6), { gain: .12, pan: .1, send: .1, lp: 2500 });
  for (let k = 0, t = at('s11b', .05); t < at('s11b', 2.6); k++, t = at('s11b', .05 + k * RUN)) put(t, .4, splash(300 + k, .7), { gain: .18, pan: -.1, send: .1, lp: 3000 });
  put(at('s11b', .32), .3, knock(19, 110, 700, .05), { gain: .3, pan: .15, send: .15 });   // the umbrella turns inside out
  put(at('s11b', .3), 1.2, rub(20, 900, t => (.5 + .5 * Math.sin(TAU * 15 * t)) * Math.exp(-t * 2.2), 1.2), { gain: .3, pan: .3, send: .1 });   // ...and a scrap flutters off
  drips(at('s12a'), at('s13a') - at('s12a'), 2.5, .12, { pan: .25 });                       // the awning dripping on her
  put(at('s14', -.3), 3.5, chime(21, .55, 6), { gain: .28, pan: -.3, send: .4 });          // in through the door, the chime...
  put(at('s14', .12), .6, knock(22, 60, 260, .1), { gain: .35, pan: -.3, send: .4 });       // ...the door shuts on the storm

  // act 3: tea in the storm
  const pB = at('s14', 3.2), pBe = at('s14', 4.9);
  put(pB, pBe - pB, pour(23, pBe - pB, pB, ramp([[pB, 0], [at('s14', 4.75), .8]]), () => 1), { gain: .3, pan: .25, send: .25 });
  put(at('s16b', 2.75), 3.4, thunder(24, 3.4, [[.15, 1], [.7, .8], [1.4, .55]]), { gain: .6, send: .15, lp: 380 });   // the lightning's thunder, through the walls
  put(at('s16b', 3.5), 1.8, thunder(25, 1.8, [[.1, .8], [.6, .4]]), { gain: .2, send: .15, lp: 300 });   // (gone before Mai speaks at 118.6)
  purr(at('s17'), at('s18'), .03);
  put(at('s17'), SH.s17.d, rub(26, 3600, t => .5 + .5 * Math.sin(TAU * t * 1.05) ** 2, SH.s17.d), { gain: .018, pan: -.2, send: .2 });   // he polishes a glass
  put(at('s17', 6.4), at('s18') - at('s17', 6.4), whistle(27, at('s18') - at('s17', 6.4)), { gain: .07, pan: -.35, send: .3 });   // "...and the kettle." it sings

  // act 4: the rain stops, the gold, she goes
  put(at('s18', 6.45), 2, gulls(28, 2), { gain: .08, pan: .4, send: .45, lp: 3500 });
  put(at('s18', 9.95), 1, gulls(29, 1), { gain: .05, pan: -.4, send: .5, lp: 3000 });
  drips(at('s19a'), at('s20c') - at('s19a'), .8, .06, { lp: 3000 });                        // the eaves still dripping
  put(at('s19c', 1.0), 1, gulls(30, 1), { gain: .05, pan: .6, send: .4, lp: 2500 });       // the gull on the rail
  put(at('s19c', 1.0), .3, knock(31, 140, 900, .03), { gain: .12, pan: -.2, send: .3 });   // the umbrella leaned on the door frame
  put(at('s20c', -.15), 3, chime(32, .4, 5), { gain: .12, pan: -.2, send: .4, lp: 4000 }); // she steps out
  steps(at('s20c', .15), at('s21', -.2), WALK, s => knock(s, 70, 420, .05), .16, .04, { lp: 2200, pan: u => .1 + .3 * u, send: .25 });
  put(at('s20c', 2.2), 1, gulls(33, 1), { gain: .05, pan: .5, send: .5, lp: 3000 });
  ticks(at('s21'), at('s22a'), .045);                                                         // dusk: only the clock
  put(at('s21', 2.9), 1, gulls(34, 1), { gain: .03, pan: .5, send: .5, lp: 1800 });

  // coda: rain again, waiting
  put(at('s22b', .85), .8, clunk(35), { gain: .35, pan: -.3, send: .3 });
  put(at('s22b', .92), .05, click(36, 4000), { gain: .15, pan: -.3 });
  const f2 = at('s22b', .95);
  put(f2, at('s22c') - f2 + .3, flame(37, at('s22c') - f2 + .3, () => .7), { gain: .22, pan: -.3, send: .15 });
  purr(at('s22c'), at('s24p'), .05);
  ticks(at('s22c'), at('s23a'), .045);
  put(at('s23a', -.35), 4, chime(38, .55, 7), { gain: .2, pan: -.35, send: .4 });          // the door: the chime still ringing
  steps(at('s23a', .25), at('s23b', -.2), WALK, boot, .3, .26, { pan: u => -.4 + .5 * u, send: .3 });   // red boots step in
  put(at('s23b', .5), 3, chime(39, 1, 1.5), { gain: .07, pan: -.35, send: .45 });           // some days, only the chime
  const pC = at('s24p', .1), pCe = at('s24p', 1.9);
  put(pC, pCe - pC, pour(40, pCe - pC, pC, ramp([[pC, .1], [at('s24p', 1.75), .8]]), () => 1), { gain: .45, pan: .15, send: .2 });   // the second glass
  put(at('s25', 3.0), 1, gulls(41, 1), { gain: .04, pan: .3, send: .5, lp: 2500 });
  put(at('s25', 6.3), 2, gulls(42, 2), { gain: .03, pan: -.4, send: .55, lp: 2200 });
}

function reverb(inp, out, spread, wet, room = .82, damp = .3) {   // Freeverb's combs and allpasses: a small wooden room
  const combs = [1116, 1188, 1277, 1356, 1422, 1491].map(d => ({ b: new Float32Array(Math.round((d + spread) * SR / 44100)), i: 0, s: 0 }));
  const aps = [556, 441, 341].map(d => ({ b: new Float32Array(Math.round((d + spread) * SR / 44100)), i: 0 }));
  for (let n = 0; n < N; n++) {
    const x = inp[n] * .015; let y = 0;
    for (const c of combs) { const o = c.b[c.i]; c.s = o * (1 - damp) + c.s * damp; c.b[c.i] = x + c.s * room; c.i = (c.i + 1) % c.b.length; y += o; }
    for (const a of aps) { const bo = a.b[a.i], o = bo - y; a.b[a.i] = y + bo * .5; a.i = (a.i + 1) % a.b.length; y = o; }
    out[n] += y * wet;
  }
}
function write(path) {
  const n = L.length, d = new Float32Array(2 * n), h = Buffer.alloc(44);
  for (let i = 0; i < n; i++) { d[2 * i] = L[i]; d[2 * i + 1] = R[i]; }
  h.write('RIFF', 0); h.writeUInt32LE(36 + n * 8, 4); h.write('WAVEfmt ', 8); h.writeUInt32LE(16, 16); h.writeUInt16LE(3, 20); h.writeUInt16LE(2, 22);
  h.writeUInt32LE(SR, 24); h.writeUInt32LE(SR * 8, 28); h.writeUInt16LE(8, 32); h.writeUInt16LE(32, 34); h.write('data', 36); h.writeUInt32LE(n * 8, 40);
  fs.writeFileSync(path, Buffer.concat([h, Buffer.from(d.buffer)]));
}
fs.mkdirSync('out/audio', { recursive: true });
for (const [name, build, rev] of [['sea', seaBed, 0], ['rain', rainBed, 0], ['wind', windBed, 0], ['fx', effects, .9]]) {
  L.fill(0); R.fill(0); VL.fill(0); VR.fill(0);
  build();
  if (rev) { reverb(VL, L, 0, rev); reverb(VR, R, 23, rev); }
  let pk = 0, ss = 0; for (let i = 0; i < N; i++) { pk = Math.max(pk, Math.abs(L[i]), Math.abs(R[i])); ss += L[i] * L[i]; }
  write(`out/audio/sfx_${name}.wav`);
  console.log(`sfx_${name}.wav  peak ${(20 * Math.log10(pk)).toFixed(1)} dB  rms ${(10 * Math.log10(ss / N + 1e-12)).toFixed(1)} dB`);
}
