// props.js: the small things Wren handles, which carry the story from act to act (the match lights her, the jar
// becomes the cage, the lever breaks). All are drawn at a hand point h = [x, y] or a ground point, s = scale (px).

// a match held at h, pointing along ang; k = flame 0..1. Returns the tip.
function pMatch(h, ang, k, t, key = 0, len = 34) {
  const tip = [h[0] + Math.cos(ang) * len, h[1] + Math.sin(ang) * len];
  boilSeed('pm' + key); inkLine([h, tip], len * .033, ST.paperDim, 'ink', 0);
  paint(ellPts(tip[0], tip[1], len * .07, len * .09, 8), { wash: k > .01 ? ST.ink : ST.scarf, ink: null });
  if (k <= .01) return tip;
  const f = k * (len / 34) * (1 + .12 * Math.sin(t * 31) + .08 * Math.sin(t * 17)), [fx, fy] = tip;
  glow(fx, fy - 6 * f, 120 * f, ST.lampGlow, .55 * k);
  paint([[fx - 7 * f, fy], [fx - 5 * f, fy - 10 * f], [fx + Math.sin(t * 9) * 3, fy - 24 * f], [fx + 5 * f, fy - 10 * f], [fx + 7 * f, fy]], { wash: ST.saffron, ink: null });
  paint(ellPts(fx, fy - 5 * f, 3 * f, 5 * f, 8), { wash: ST.warm, ink: null });
  return tip;
}
// a matchbox centred at (x, y), s = its length; open 0..1 slides the tray out to the right.
function pMatchbox(x, y, s, open = 0, rot = 0, key = 0) {
  push(); translate(x, y); rotate(rot);
  boilSeed('mbT' + key); paint(rectPts(-s * .45 + open * s * .5, -s * .22, s * .9, s * .4, 1), { wash: mixCol(ST.paperDim, ST.paper, .4), ink: ST.ink, sw: .7 });
  for (let i = 0; i < 4; i++) if (open > .2) inkLine([[-s * .2 + open * s * .5 + i * s * .1, -s * .2], [-s * .2 + open * s * .5 + i * s * .1, -s * .05]], .8, ST.scarf, 'ink', 0);
  boilSeed('mbS' + key); paint(rectPts(-s * .5, -s * .25, s, s * .5, 1), { wash: ST.scarf, ink: ST.ink, sw: .8 });
  paint(rectPts(-s * .3, -s * .12, s * .6, s * .24, 1), { wash: ST.saffron, ink: ST.ink, sw: .5 });
  inkLine([[-s * .5, s * .25], [s * .5, s * .25]], 1.4, ST.ink, 'ink', 0);   // the striker
  pop();
}
// a glass jar standing on (x, y), s = height; lid 0..1 lifts and tips the lid off to the right. inside(cx, cy) draws contents.
function pJar(x, y, s, lid = 0, key = 0, inside) {
  const w = s * .38, top = y - s;
  boilSeed('jarB' + key); paint([[x - w, top + s * .12], [x - w * 1.05, y - s * .1], [x - w * .9, y], [x + w * .9, y], [x + w * 1.05, y - s * .1], [x + w, top + s * .12]],
    { wash: mixCol(ST.tealDk, ST.night, .55), washOp: 150, ink: ST.tealLt, sw: .9, curv: .3 });
  if (inside) inside(x, y - s * .5);
  boilSeed('jarH' + key); inkLine([[x - w * .65, top + s * .2], [x - w * .75, y - s * .2]], s * .02, ST.tealLt, 'inkfine', .3);   // highlight
  const L = Array.isArray(lid) ? lid : [lid * s * .55, -lid * s * .35, lid * .9];   // lid: amount 0..1, or [dx, dy, rot]
  const lx = x + L[0], ly = top + s * .08 + L[1], lr = L[2];
  push(); translate(lx, ly); rotate(lr);
  boilSeed('jarL' + key); paint(rrPts(-w * 1.1, -s * .1, w * 2.2, s * .14, s * .03), { wash: ST.gold, ink: ST.ink, sw: .9 });
  pop();
}
// an oar from grip g to blade b
function pOar(g, b, key = 0) {
  boilSeed('oar' + key); inkLine([g, b], 5, mixCol(ST.paperDim, ST.ember, .3), 'ink', 0);
  const a = Math.atan2(b[1] - g[1], b[0] - g[0]);
  push(); translate(...b); rotate(a);
  paint(ellPts(10, 0, 34, 12, 14), { wash: mixCol(ST.paperDim, ST.ember, .3), ink: ST.ink, sw: .8 });
  pop();
}
// a brass compass at (x, y), radius r; needle angle ang (0 = north)
function pCompass(x, y, r, ang, key = 0) {
  boilSeed('cmp' + key); paint(ellPts(x, y, r, r, 18), { wash: ST.gold, ink: ST.ink, sw: .9 });
  paint(ellPts(x, y, r * .78, r * .78, 18), { wash: ST.paper, ink: ST.ink, sw: .5 });
  const c = Math.cos(ang), s = Math.sin(ang), n = [x + s * r * .7, y - c * r * .7], so = [x - s * r * .7, y + c * r * .7], p = [x + c * r * .14, y + s * r * .14], q = [x - c * r * .14, y - s * r * .14];
  paint([n, p, so, q], { wash: ST.inkSoft, ink: null }); paint([n, p, [x, y], q], { wash: ST.red, ink: null });
  paint(ellPts(x, y - r * 1.08, r * .2, r * .14, 8), { wash: ST.gold, ink: ST.ink, sw: .6 });
}
// the killswitch lever on its box at ground (x, y); broken 0..1 hides the handle (she holds it); ang tilts the stick
function pLever(x, y, s, broken = 0, ang = 0, key = 0) {
  boilSeed('lv' + key);
  paint(rrPts(x - .4 * s, y - .5 * s, .8 * s, .5 * s, 4), { wash: mixCol(ST.ink, ST.hillLt, .4), ink: ST.ink, sw: 1 });
  if (broken < .5) {
    const tip = [x + Math.sin(.3 + ang) * 1.2 * s, y - .45 * s - Math.cos(.3 + ang) * 1.2 * s];
    inkLine([[x, y - .45 * s], tip], 4, mixCol(ST.paperDim, ST.ink, .25), 'ink', 0);
    paint(ellPts(tip[0], tip[1], .18 * s, .18 * s, 12), { wash: ST.red, ink: ST.ink, sw: .9 });
    glow(tip[0], tip[1], .6 * s, ST.red, .25);
  } else inkLine([[x, y - .45 * s], [x + .06 * s, y - .62 * s], [x - .02 * s, y - .66 * s]], 4, mixCol(ST.paperDim, ST.ink, .25), 'ink', 0);
}
// the broken-off lever stick held at h, pointing along ang
function pLeverStick(h, ang, s, key = 0) {
  const tip = [h[0] + Math.cos(ang) * s, h[1] + Math.sin(ang) * s], butt = [h[0] - Math.cos(ang) * s * .2, h[1] - Math.sin(ang) * s * .2];
  boilSeed('lvs' + key); inkLine([butt, tip], 4, mixCol(ST.paperDim, ST.ink, .25), 'ink', 0);
  paint(ellPts(tip[0], tip[1], .15 * s, .15 * s, 12), { wash: ST.red, ink: ST.ink, sw: .9 });
}
// a paperclip at (x, y), s = scale, rot = angle
const CLIP_PTS = [[0, 10], [0, -14], [5, -19], [10, -14], [10, 8], [6, 12], [3, 8], [3, -10]];
function pClip(x, y, s, rot, key = 0, col = ST.paperDim) {
  const c = Math.cos(rot), sn = Math.sin(rot);
  boilSeed('pc' + key); inkLine(CLIP_PTS.map(([px, py]) => [x + (px - 5) * s * c - py * s * sn, y + (px - 5) * s * sn + py * s * c]), s * .45, col, 'ink', 0);
}
