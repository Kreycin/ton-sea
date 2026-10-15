// score.mjs: the film's music, an original waltz in F (3/4, 72 BPM: a bar is 2.5 s) for piano, strings, cello,
// pizzicato, harp, celesta and flute, written as notes on the film's clock. One cue per act, each starting on its picture
// beat (video seconds, the 199.95 s cut); the melody keeps to the gaps between the spoken lines (dialog.js) and the
// harmony sits under the kettle's song in 17 (A6 then Bb6). Writes out/music/score.json for scripts/render_music.swift.
// Usage: node scripts/score.mjs && SDKROOT=/Library/Developer/CommandLineTools/SDKs/MacOSX26.5.sdk swift scripts/render_music.swift out/music/score.json out/music/music.wav
import fs from 'fs';

const BEAT = 60 / 72, BAR = 3 * BEAT;
const P = 0, S = 1, VC = 2, PZ = 3, HP = 4, CE = 5, FL = 6;
const PARTS = [[0, 0], [49, -2], [42, -4], [45, -3], [46, -3], [8, -7], [73, -6]];   // GM program, gain dB
const NOTE = s => { const m = /^([A-G])(#|b)?(\d)$/.exec(s); return 12 * (+m[3] + 1) + { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0); };
// chord: lh = the piano's left hand, six eighths of a waltz bar; pad = the strings' voicing
const CH = {
  F: { lh: 'F2 C3 A3 C3 F3 C3', pad: 'F3 A3 C4' }, 'F/A': { lh: 'A2 F3 C4 F3 A3 F3', pad: 'F3 A3 C4' },
  'C/E': { lh: 'E2 C3 G3 C3 E3 C3', pad: 'E3 G3 C4' }, C: { lh: 'C2 G2 E3 G2 C3 G2', pad: 'E3 G3 C4' },
  C7: { lh: 'C2 G2 Bb2 E3 G2 Bb2', pad: 'E3 G3 Bb3' }, Csus: { lh: 'C2 G2 F3 G2 C3 G2', pad: 'F3 G3 C4' },
  Bb: { lh: 'Bb1 F2 D3 F2 Bb2 F2', pad: 'F3 Bb3 D4' }, Bbmaj7: { lh: 'Bb1 F2 D3 A3 F2 D3', pad: 'F3 A3 D4' },
  Dm: { lh: 'D2 A2 F3 A2 D3 A2', pad: 'F3 A3 D4' }, Am: { lh: 'A1 E2 C3 E2 A2 E2', pad: 'E3 A3 C4' },
  Gm7: { lh: 'G1 D2 Bb2 F3 D2 Bb2', pad: 'F3 Bb3 D4' }, Gm: { lh: 'G1 D2 Bb2 D2 G2 D2', pad: 'D3 G3 Bb3' },
  A: { lh: 'A1 E2 C#3 E2 A2 E2', pad: 'E3 A3 C#4' },
};
for (const c of Object.values(CH)) { c.lh = c.lh.split(' ').map(NOTE); c.pad = c.pad.split(' ').map(NOTE); }

let seed = 5;
const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647, hum = () => (r() - .5) * .016;
const ev = [];
const on = (t, ch, n, v, d) => ev.push({ t: +Math.max(0, t).toFixed(3), ch, n: typeof n === 'string' ? NOTE(n) : n, v: Math.max(1, Math.min(127, Math.round(v + (r() - .5) * 6))), d: +d.toFixed(3) });
const cc = (t, ch, c, val) => ev.push({ t: +Math.max(0, t).toFixed(3), ch, cc: c, val: Math.round(val) });
const swell = (ch, t0, t1, v0, v1) => { for (let t = t0; t <= t1; t += .1) cc(t, ch, 11, v0 + (v1 - v0) * (t - t0) / (t1 - t0)); };

// one waltz bar of chord c at t. o: lh (piano left hand velocity), pad (strings), vc (cello root), pz (pizzicato
// eighths), blk (a soft held piano chord); hold: how long the bar's notes ring (default one bar)
function bar(t, c, o = {}) {
  const C = CH[c], hold = o.hold || BAR;
  if (o.lh) { cc(t - .03, P, 64, 0); cc(t + .02, P, 64, 127); C.lh.forEach((n, i) => on(t + i * BEAT / 2 + hum(), P, n, o.lh * (i ? .88 : 1.1), i ? BEAT * 1.2 : hold)); }
  if (o.blk) { cc(t - .03, P, 64, 0); cc(t + .02, P, 64, 127); [C.lh[0], ...C.pad.map(n => n + 12)].forEach((n, i) => on(t + i * .03, P, n, o.blk, hold)); }
  if (o.pad) C.pad.forEach(n => on(t, S, n, o.pad, hold + .15));
  if (o.vc) on(t, VC, C.lh[0] < 36 ? C.lh[0] + 12 : C.lh[0], o.vc, hold + .1);
  if (o.pz) C.lh.forEach((n, i) => on(t + i * BEAT / 2 + hum(), PZ, n + 12, o.pz * (i ? .85 : 1.15), BEAT * .45));
}
const bars = (t, list, o) => { for (const c of list) { bar(t, c, typeof o === 'function' ? o(c) : o); t += BAR; } return t; };
// a melody line: "C5:1.5 A4:.5 F4:1 | ..." (beats; r = rest; | marks bars and is ignored); up: transpose in semitones
function mel(t, ch, s, v, up = 0) {
  let b = 0;
  for (const tok of s.split(/\s+/).filter(x => x && x !== '|')) {
    const [n, d] = tok.split(':');
    if (n !== 'r') on(t + b * BEAT + hum(), ch, NOTE(n) + up, v * (b % 3 === 0 ? 1.06 : .95), +d * BEAT * .97);
    b += +d;
  }
}
function harp(t, c, span = 1.4) {                              // a rising arpeggio over three octaves
  const ns = [0, 12, 24].flatMap(o => CH[c].pad.map(n => n + o)).sort((a, b) => a - b);
  ns.forEach((n, i) => on(t + i * span / ns.length, HP, n, 44 + 10 * i / ns.length, 3.0));
}
const TH_A = 'C5:1.5 A4:.5 F4:1 | D5:2 C5:1 | A4:1 G4:1 A4:1 | G4:3';             // over F Bb F/A C
const TH_A2 = 'C5:1.5 A4:.5 F4:1 | D5:1 F5:1.5 E5:.5 | D5:1 C5:1 Bb4:1 | A4:3';    // over F Bb C7 F
const TH_B = 'F5:1.5 E5:.5 D5:1 | C5:2 A4:1 | Bb4:1 C5:1 D5:1 | C5:3';              // over Dm Am Bb C
const TH_B2 = 'F5:1.5 E5:.5 D5:1 | C5:1 A4:1 C5:1 | Bb4:1 A4:1 G4:1 | Bb4:1 G4:2 | F4:3';   // over Dm Am Gm7 C7 F

// act 1, the morning: the piano alone over the sea, then the theme as Ton's day begins; strings join in the bridge,
// the celesta at the pour; it settles on F by the empty door
let t = bars(1.0, ['F', 'Bbmaj7', 'F/A', 'Csus'], { lh: 30 });                                   // 1.0-11.0
mel(t, P, TH_A + ' | ' + TH_A2, 54);
t = bars(t, ['F', 'Bb', 'F/A', 'C', 'F', 'Bb', 'C7', 'F'], { lh: 34 });                          // 11.0-31.0
mel(t, P, TH_B + ' | ' + TH_B2, 52);
mel(t + 7 * BAR, CE, 'Bb4:1 G4:2 | F4:3', 40, 12);                                                 // the pour (48.35)
['Dm', 'Am', 'Bb', 'C', 'Dm', 'Am', 'Gm7', 'C7', 'F'].forEach((c, i) => bar(t + i * BAR, c, { lh: 33, pad: 30 + 2 * i, vc: i >= 4 ? 34 : 0 }));   // 31.0-53.5
bar(53.5, 'Bbmaj7', { lh: 28, pad: 30 }); bar(56.0, 'F', { lh: 26, pad: 28, hold: 3.2 });

// act 2, the storm: the strings darken under the clouds; pizzicato for the rain and her run; the major comes back,
// lighter, when she laughs at herself under the awning; warm strings at "come in"
swell(S, 58.3, 65.8, 70, 110);
bar(58.3, 'Dm', { pad: 36, vc: 40 }); bar(60.8, 'Bb', { pad: 40, vc: 42 }); bar(63.3, 'A', { pad: 44, vc: 44 });
t = bars(65.8, ['Dm', 'Bb', 'Gm', 'A', 'Dm', 'A'], { pz: 56, pad: 34 });                          // 65.8-80.8
cc(80.6, S, 11, 96);
mel(82.9, CE, 'A5:.5 C6:.5 F6:1', 40);                                                             // she laughs (83.07)
t = bars(t, ['F', 'C/E', 'Dm', 'Bb'], { pz: 40, pad: 30 });                                       // 80.8-90.8
bar(90.8, 'F', { pad: 38, lh: 26 }); bar(93.3, 'C', { pad: 34, lh: 24 });

// act 3, tea in the storm: a soft waltz under the talk; a phrase in the sip (108.6-112.3); the lightning cuts it
// (115.36); then held chords, F/A under the kettle's first A6 and Bb as it rises to Bb6
t = bars(95.8, ['Bb', 'F/A', 'Gm7', 'C', 'F', 'Dm', 'Bb'], { lh: 28, pad: 26 });                 // 95.8-113.3
bar(t, 'C', { pad: 24, hold: 115.3 - t });
mel(108.3, P, 'r:.5 D5:1.5 C5:1 | F4:2', 42); mel(108.3, CE, 'r:.5 D5:1.5 C5:1', 30, 12);
bar(118.3, 'Dm', { blk: 30, pad: 22 }); bar(120.8, 'Bbmaj7', { blk: 28, pad: 22 });
bar(123.3, 'F/A', { blk: 28, pad: 24 }); bar(125.8, 'Bb', { blk: 30, pad: 26 });

// act 4, the gold: harp and strings open up as the clouds part; the talk sits on pads; the flute in the gap
// (145.0-148.4); the theme on piano and flute as she walks away and into the dusk
harp(127.95, 'F', 1.6); swell(S, 127.95, 131.0, 80, 118); cc(137.5, S, 11, 100);
bars(128.3, ['F', 'Bb'], { pad: 50, vc: 46, lh: 34 });
bars(133.3, ['F/A', 'C'], { pad: 44, lh: 30 });
bars(138.3, ['Dm', 'Bb', 'Gm7', 'C7', 'F', 'Bb'], { pad: 36, lh: 27 });                          // 138.3-153.3
mel(145.8, FL, 'D5:1 C5:1 Bb4:1 | A4:1.5', 48);
bar(153.3, 'C', { pad: 34, hold: 2.8 });
mel(156.1, P, TH_A, 48); mel(156.1, FL, 'C5:1.5 A4:.5 F4:1 | D5:2 C5:1', 40);
bars(156.1, ['F', 'Bb', 'F/A', 'C'], c => ({ lh: 30, pad: c === 'F' || c === 'Bb' ? 30 : 0 }));  // 156.1-166.1

// coda, waiting in the rain: the bridge on the piano alone; harp and strings as she walks in; one held Csus at the
// empty door; then the theme once more, celesta above, for the two glasses; the last F rings into the fade
mel(166.1, P, TH_B, 44);
bars(166.1, ['Dm', 'Am', 'Bb', 'C'], { lh: 27 });                                                  // 166.1-176.1
harp(175.2, 'F', 1.1);                                                                            // as the door opens, before her line
bar(176.1, 'F', { pad: 40, lh: 30, vc: 36 }); bar(178.6, 'C/E', { pad: 38, lh: 28 });
bar(181.1, 'Csus', { pad: 32 });
mel(183.6, P, TH_A2, 50); mel(183.6, CE, TH_A2, 34, 12);
bars(183.6, ['F', 'Bb', 'C7', 'F'], { lh: 32, pad: 36 });                                        // 183.6-193.6
bar(193.6, 'Bb', { pad: 40, lh: 30, vc: 36 }); mel(193.6, P, 'D5:2 C5:1', 46);
bar(196.1, 'F', { pad: 40, lh: 30, vc: 38, hold: 3.8 }); mel(196.1, P, 'A4:4.5', 44); harp(196.1, 'F', 2.0);

fs.mkdirSync('out/music', { recursive: true });
ev.sort((a, b) => a.t - b.t);
fs.writeFileSync('out/music/score.json', JSON.stringify({ duration: 199.95, reverb: 24, parts: PARTS.map(([program, gain]) => ({ program, gain })), events: ev }));
console.log(`out/music/score.json: ${ev.filter(e => e.n !== undefined).length} notes`);
