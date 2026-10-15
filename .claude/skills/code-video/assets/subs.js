// subs.js: dynamic subtitles for ClaudeAnimationBase videos (lyrics, narration or dialogue).
//
// Default mode 'karaoke': the whole line appears at once (a short rise and fade) as it starts. Then the word being sung
// or spoken changes: it lights up in SUB.hi (or its keyword colour), lifts, pops a little and runs its keyword effect.
// Words already said stay bright and keep any keyword colour; words still to come stay dim. The line bobs on the beat,
// then drifts up and fades when it ends. Mode 'pop' instead makes every word pop in on its own onset.
//
// Needs core.js (letter, glow, PAL, W, H, seg, ease, easeIn, easeOut, backOut, clamp, hash, pulse, T, TAU) and
// LY = [[start, end, "text"], ...]. Word onsets come from LYW (voice.js, written by voice_env.py). Without LYW each line
// is split by syllable count. Words are separated by spaces. For scripts with no spaces (Thai), separate words with |:
// "ฉัน|เห็น|ประกาย ไฟ" draws with no gap at |, and a normal gap at the space.
// timeline.js drawWorld must call subs(t) after the shot function: if (typeof subs === 'function') subs(t);
//
// Project overrides go in a file loaded after this one:
//   Object.assign(SUB, { y: 900, hi: PAL.ochre, font: s => `${s}px "Kanit", sans-serif` });
//   Object.assign(SUB_FX, { doom: ['rise', PAL.clay], foom: ['boom', PAL.clayDk], nervous: ['shake'] });
//   SUB_POS.push([12.0, 15.5, { y: 160 }]);   // move the lines off a face for a stretch ({x, y, size})
// Effects: glow shake boom rise drop tilt wobble creep red rush scatter rain slide back bow squash box soft pop big.
const SUB = {
  mode: 'karaoke',
  size: 64, y: H - 112, maxW: 1480, font: s => `${s}px "Permanent Marker", "Comic Sans MS", cursive`,
  base: PAL.cream, hi: PAL.ochre, stroke: PAL.ink,
  ahead: .45,                 // opacity of words not said yet (karaoke)
  lead: .12, inT: .22,        // the line shows `lead` s before its first word and takes inT s to rise in
  hold: .45, outT: .3,        // it stays `hold` s after the line ends, then takes outT s to fade
  lift: 7, grow: 1.1, bob: 4  // the current word: px lifted and scale; bob = px the line dips on each beat
};
const SUB_FX = {};
const SUB_POS = [];
let SUB_MC = null;
const subKey = w => w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
const subBig = w => { const ef = (SUB_FX[subKey(w)] || [])[0]; return ef === 'big' || ef === 'boom' ? 1.35 : ef ? 1.12 : 1; };
const subSplit = line => line.split(' ').filter(Boolean).flatMap(g => { const p = g.split('|'); return p.map((txt, j) => ({ txt, gap: j === p.length - 1 })); });
function subSyl(w) {
  const c = w.toLowerCase().replace(/[^a-z]/g, '');
  if (!c) return Math.max(1, Math.round(w.replace(/[^\p{L}]/gu, '').length / 3));   // non-Latin: about 3 letters a syllable
  let k = (c.match(/[aeiouy]+/g) || []).length;
  if (c.endsWith('e') && !c.endsWith('le') && !c.endsWith('ee') && k > 1) k--;
  return Math.max(1, k);
}
function subStarts(li) {
  if (typeof LYW !== 'undefined' && LYW[li]) return LYW[li];
  const [a, b, line] = LY[li], ws = subSplit(line), sy = ws.map(w => subSyl(w.txt)), tot = sy.reduce((s, v) => s + v, 0);
  let acc = 0; return ws.map((w, i) => { const s = a + (b - a) * .95 * acc / tot; acc += sy[i]; return s; });
}
function subW(txt, size) {
  if (!SUB_MC) SUB_MC = document.createElement('canvas').getContext('2d');
  SUB_MC.font = SUB.font(size); return SUB_MC.measureText(txt).width;
}
// Lay the words out in one row, or two rows split at the word gap nearest the middle. The layout never changes while
// the line is up, so the current word can grow without pushing its neighbours.
function subLayout(words, size) {
  const sp = size * .62, ws = words.map(w => subW(w.txt, size * subBig(w.txt)) + size * .1);
  const adv = i => ws[i] + (i < words.length - 1 && words[i].gap ? sp : 0);
  const total = words.reduce((s, _, i) => s + adv(i), 0);
  let rows = [[0, words.length]];
  if (total > SUB.maxW && words.length > 1) {
    let acc = 0, cut = 1, best = 1e9;
    for (let i = 0; i < words.length - 1; i++) { acc += adv(i); if (words[i].gap && Math.abs(acc - total / 2) < best) { best = Math.abs(acc - total / 2); cut = i + 1; } }
    rows = [[0, cut], [cut, words.length]];
  }
  const out = [];
  rows.forEach(([a, b], r) => {
    let rw = 0; for (let i = a; i < b; i++) rw += i < b - 1 ? adv(i) : ws[i];
    let x = -rw / 2;
    for (let i = a; i < b; i++) { out[i] = { x: x + ws[i] / 2, row: r, w: ws[i] }; x += adv(i); }
  });
  return { pos: out, rows: rows.length };
}
function subs(t) {
  if (typeof LY === 'undefined') return;
  let li = -1, end = 0;
  for (let i = 0; i < LY.length; i++) {
    const next = i + 1 < LY.length ? LY[i + 1][0] - SUB.lead : 1e9, e = Math.min(LY[i][1] + SUB.hold, next - .04);
    if (t >= LY[i][0] - SUB.lead && t < e) { li = i; end = e; break; }
  }
  if (li < 0) return;
  const [a, b, line] = LY[li], P = SUB_POS.find(p => t >= p[0] && t < p[1]), ov = P ? P[2] : {};
  const size = ov.size || SUB.size, cx = ov.x ?? W / 2, by = ov.y ?? SUB.y;
  const words = subSplit(line), starts = subStarts(li), L = subLayout(words, size);
  const kin = SUB.mode === 'pop' ? 1 : ease(seg(t, a - SUB.lead, a - SUB.lead + SUB.inT)), out = seg(t, end - SUB.outT, end);
  const lineY = by - (L.rows - 1) * size * 1.15 + 18 * (1 - kin) - 24 * easeIn(out) - SUB.bob * pulse(t, 8);
  const lineA = kin * (1 - easeIn(out));
  words.forEach((wd, i) => {
    const w = wd.txt, t0 = starts[i] ?? a, age = t - t0, t1 = i + 1 < words.length ? (starts[i + 1] ?? b) : b;
    if (SUB.mode === 'pop' && age < -.03) return;
    const now = t >= t0 && t < Math.max(t1, t0 + .18), fx = SUB_FX[subKey(w)] || [], ef = fx[0], big = subBig(w);
    let dx = 0, dy = 0, rot = (hash(li * 31 + i * 7) - .5) * .05, sc = 1, al = 1;
    if (SUB.mode === 'pop') { sc *= backOut(clamp(age / .22)); dy += (1 - easeOut(clamp(age / .22))) * 22; al = clamp(age / .08 + .2); }
    else if (age < 0) al = SUB.ahead;
    const e = Math.max(0, age);
    if (age >= 0) switch (ef) {
      case 'shake': { const s = Math.exp(-e * 3) * 6 + 1.2; dx += Math.sin(T * 63 + i) * s; dy += Math.cos(T * 71 + i) * s * .6; break; }
      case 'boom': { sc *= 1 + .4 * Math.exp(-e * 5); const s = Math.exp(-e * 4) * 14; dx += Math.sin(T * 70) * s; dy += Math.cos(T * 83) * s; break; }
      case 'rise': dy -= 16 * easeOut(clamp(e / .5)) + 4 * Math.sin(e * 5); break;
      case 'drop': dy += 18 * easeIn(clamp(e / .35)) - 8 * Math.exp(-(e - .35) * 9) * (e > .35); rot += .06 * clamp(e / .35); break;
      case 'tilt': rot += .22 * easeOut(clamp(e / .4)); break;
      case 'wobble': rot += .12 * Math.sin(e * 7); dy += 5 * Math.sin(e * 9); break;
      case 'creep': dx += 3 * Math.sin(e * 3); al *= .55 + .45 * clamp(e / .6); break;
      case 'red': sc *= 1 + .08 * Math.sin(e * 12) * Math.exp(-e * 2); break;
      case 'rush': dx += 40 * (1 - easeOut(clamp(e / .25))); break;
      case 'scatter': dx += 4 * Math.sin(e * 23); dy += 4 * Math.cos(e * 17); rot += .05 * Math.sin(e * 13); break;
      case 'rain': dy -= 30 * (1 - easeOut(clamp(e / .3))); break;
      case 'slide': dx += 26 * Math.sin(e * TAU * 1.1) * Math.exp(-e * 2); break;
      case 'back': dx -= 26 * Math.sin(e * TAU * 1.1) * Math.exp(-e * 2); break;
      case 'bow': rot += .1 * Math.sin(clamp(e / .5) * Math.PI); dy += 8 * Math.sin(clamp(e / .5) * Math.PI); break;
      case 'squash': sc *= 1 + .25 * Math.exp(-e * 6) * Math.cos(e * 20); break;
      case 'box': rot -= .05; break;
      case 'soft': al *= .85; break;
      case 'pop': sc *= 1 + .25 * Math.exp(-e * 8); break;
    }
    if (now) { sc *= SUB.grow + .14 * Math.exp(-e * 10); dy -= SUB.lift; }
    const col = now ? (fx[1] || SUB.hi) : age >= 0 && fx[1] ? fx[1] : SUB.base, p = L.pos[i];
    const x = cx + p.x + dx, y = lineY + p.row * size * 1.15 + dy, s = size * big * sc;
    if ((ef === 'glow' || ef === 'boom' || ef === 'red') && age >= 0 && e < 1.5) glow(x, y, p.w * .9 * big, ef === 'red' ? '#E0473C' : '#FFC766', .45 * (1 - e / 1.5) * lineA);
    letter(w, x, y, s, col, { screen: true, rot, alpha: al * lineA, stroke: SUB.stroke, font: SUB.font(s) });
  });
}
