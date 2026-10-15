// style.js: Lantern's shared look. Every scene takes colours, light and line weights from here so acts stay consistent.
//   Night is indigo, Wren is saffron/ember, the Mind is teal; where their lights meet it goes warm white.
//   Key light (moon) sits upper left. Wren is ~0.25 H tall on wide shots (u ≈ 52).
const ST = {
  night: '#121935', night2: '#1B2452', dusk: '#2C3A78', haze: '#3E4C8C',
  hill: '#1D2244', hill2: '#272F5C', hillLt: '#3A4478',
  ink: '#16121F', inkSoft: '#2A2440',
  paper: '#EADFC8', paperDim: '#8C7F70',
  saffron: '#F2A93B', ember: '#E0612F', scarf: '#C2402E', scarfDk: '#8A2A22', tunic: '#3A2C4E',
  lampLit: '#FFD58A', lampOff: '#7A6C62', lampGlow: '#FFB04A',
  teal: '#4FC3B4', tealLt: '#B8FFF0', tealDk: '#1E6C70', tealGlow: '#5FE8D2',
  gold: '#E8B34A', warm: '#FFF1D6', moon: '#F1E6C8', blue: '#5C8FE0', red: '#D0402F',
};
// wipe colours per mood
const WIPE = { night: [ST.night2, ST.dusk], ember: [ST.scarfDk, ST.ember], teal: [ST.tealDk, ST.teal] };
// bar helpers: bar n starts at OFF + n·4 beats
const BAR = 4 * BEAT;
const barT = n => OFF + n * BAR;

// ---------- shared set pieces ----------
// Full-frame night sky: base wash, two soft watercolour clouds of depth, faint fixed stars. Oversized for camera moves.
function nightSky(t, o = {}) {
  const top = o.top || ST.night, low = o.low || ST.night2;
  boilSeed('sky');
  paint(rectPts(-800, -600, W + 1600, H + 1200), { wash: top, ink: null });
  paint(ellPts(W * .5, H * 1.05, W * .95, H * .55, 30, 10), { fill: low, fillOp: 120, bleed: .3, tex: .5, ink: null });
  paint(ellPts(W * .2, H * .1, W * .45, H * .3, 24, 10), { fill: ST.dusk, fillOp: 60, bleed: .3, tex: .5, ink: null });
  const n = o.stars ?? 36;
  for (let i = 0; i < n; i++) {
    boilSeed('st' + i);
    const x = hash(i * 3.1) * (W + 400) - 200, y = hash(i * 7.7 + 1) * H * .62 - 60, tw = .6 + .4 * Math.sin(t * (1.5 + hash(i)) + i);
    paint(starPts(x, y, (2 + 3 * hash(i + 9)) * tw, .4, 4), { wash: ST.moon, washOp: 120 + 80 * tw, ink: null });
  }
}
function moon(x, y, r, t) {
  glow(x, y, r * 3.2, ST.moon, .35);
  boilSeed('moon');
  paint(ellPts(x, y, r, r, 30, 1.2), { wash: ST.moon, fill: ST.gold, fillOp: 35, ink: ST.inkSoft, sw: .7 });
  paint(ellPts(x - r * .25, y - r * .2, r * .22, r * .17, 10), { fill: mixCol(ST.moon, ST.paperDim, .5), fillOp: 110, ink: null });
}
// A torn-paper hill: ellipse body with a ragged top edge and a lighter rim on the moon side.
function hill(cx, cy, rx, ry, col, key, tufts = 0, t = 0) {
  boilSeed('hill' + key);
  const pts = [];
  for (let i = 0; i <= 40; i++) { const a = Math.PI + i / 40 * Math.PI, rag = 1 + (hash(i * 13 + key * 7) - .5) * .03; pts.push([cx + Math.cos(a) * rx * rag, cy + Math.sin(a) * ry * rag]); }
  pts.push([cx + rx, cy + 600], [cx - rx, cy + 600]);
  paint(pts, { wash: col, fill: mixCol(col, ST.ink, .3), fillOp: 80, bleed: .06, tex: .6, ink: ST.ink, sw: .9 });
  inkLine(pts.slice(4, 18), .5, mixCol(col, ST.moon, .35), 'inkfine', .5);   // moonlit rim, upper left
  for (let i = 0; i < tufts; i++) {
    const a = Math.PI * (1.15 + .7 * hash(i * 5 + key)), x = cx + Math.cos(a) * rx, y = cy + Math.sin(a) * ry + 4, sw = wob(t, .4, hash(i) * 3) * 4;
    for (const k of [-1, 0, 1]) inkLine([[x + k * 6, y], [x + k * 9 + sw, y - 16 - 7 * hash(i + k)]], .55, mixCol(col, ST.moon, .3), 'inkfine', .4);
  }
}
const hillTop = (x, cx, cy, rx, ry) => cy - ry * Math.sqrt(Math.max(0, 1 - ((x - cx) / rx) ** 2));
