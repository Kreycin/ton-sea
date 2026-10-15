// kit.js: shared gouache painting kit for every set of the tale (palette + helpers). Load it after cast.js, before the scenes.
// Backgrounds use gp washes with no outlines; gw (bleed) only on small shapes; st for fine painted lines.
const G = {
  skyTop: '#4E5E72', sky2: '#6C7C8F', sky3: '#94A1AC', skyLow: '#C8CCC4', breakLt: '#EDE3C6',
  hill: '#6A808C', hillFar: '#8FA2AB', sea: '#4C6A76', seaDk: '#3C5864', seaLt: '#86A0A8', mist: '#B9C3C6',
  wall: '#9A6E4C', wallDk: '#6E4A34', wallLt: '#B88A62', roof: '#4E7A70', roofDk: '#365A54', roofLt: '#6E9A8C',
  deck: '#6E5644', deckDk: '#54423A', deckLt: '#8E7660', post: '#3E3230', win: '#FFD992', glow: '#FFB65A', inside: '#4A3428',
  leaf: '#3F6B45', leafLt: '#6A9A5A', leafDk: '#2A4A34', pot: '#B4643E', noren: '#2E4766', rain: '#DCE4EA',
  trim: '#E9DCC2', paint: '#5E8C84', paintDk: '#466C66', chalk: '#2F3F38', awnA: '#F1E4C8', awnB: '#C9584A', copper: '#C27A44', steel: '#9AA4A8',
};
const gp = (pts, col, op = 255, o = {}) => paint(pts, { wash: col, washOp: op, ink: null, curv: o.curv ?? 0 });
const gw = (pts, col, op = 120, bleed = .25) => paint(pts, { fill: col, fillOp: op, bleed, tex: .7, ink: null });
const dn = P => P.length > 2 ? P : [P[0], [(P[0][0] + P[1][0]) / 2, (P[0][1] + P[1][1]) / 2], P[1]];
const st = (P, sw, col) => inkLine(dn(P), sw, col, 'inkfine');

// painted cup icon (the sign language for "tea shop"; no lettering anywhere)
function cupIcon(x, y, s, col, t) {
  gp([[x - 30 * s, y - 20 * s], [x + 30 * s, y - 20 * s], [x + 24 * s, y + 22 * s], [x - 24 * s, y + 22 * s]], col, 255, { curv: .3 });
  st([[x + 28 * s, y - 12 * s], [x + 44 * s, y - 4 * s], [x + 26 * s, y + 10 * s]], 2.2 * s, col);
  gp(ellPts(x, y + 30 * s, 40 * s, 6 * s, 16, 0), col);
  for (let i = 0; i < 3; i++) { const w = Math.sin(t * 2 + i) * 4 * s; st([[x - 14 * s + i * 14 * s, y - 28 * s], [x - 18 * s + i * 14 * s + w, y - 44 * s], [x - 12 * s + i * 14 * s, y - 60 * s]], 1.4 * s, col); }
}

// layered cloud strata: lit crests over dark bellies
function strata(x0, x1, yb, h, lit, dark, seed, drift, halo = '#D9D8CF') {
  boilSeed('strata' + seed);
  const n = Math.max(4, Math.ceil((x1 - x0) / 70)), top = [], belly = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n, x = x0 + u * (x1 - x0) + drift, env = Math.pow(Math.sin(Math.PI * u), .5);
    const b = h * (.35 + .65 * hash(seed * 13 + i)) * env;
    top.push([x, yb - b]); belly.push([x, yb - b * .45]);
  }
  const base = [[x1 + drift, yb + h * .12], [x0 + drift, yb + h * .12]];
  gp(top.map(([x, y]) => [x, y - 4]).concat(base), halo, 80, { curv: .5 });
  gp(top.concat(base), lit, 255, { curv: .5 });
  gp(belly.concat(base), dark, 255, { curv: .5 });
}

// look-dev frames (style tests, model sheet, set looks) live outside the film timeline: --loop=dev plays them at their
// old times (t 0–21), e.g. node render.mjs --loop=dev --stills=8.5 rebuilds the key art still.
const DEV = [];
function devShots(list) {
  DEV.push(...list); DEV.sort((a, b) => a[0] - b[0]);
  LOOPS.dev = t => {
    let i = 0; while (i + 1 < DEV.length && t >= DEV[i + 1][0]) i++;
    const t0 = DEV[i][0], end = i + 1 < DEV.length ? DEV[i + 1][0] : 21;
    DEV[i][1](t, t - t0, end - t0); CAM = null;
  };
  LOOPS.dev.len = 21;
}
