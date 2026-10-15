// styles.js: one key frame of "ต้นกับทะเล" (the woman with the broken umbrella reaches Ton's tea shop in the rain),
// painted in six looks. Each shot = one style; same composition, so the sheet compares the medium only.
(() => {
  const STYLES = [
    { name: 'watercolour', mode: 'wash', sky: '#9AA7B4', sky2: '#C9CFD3', sea: '#6F8C99', seaDk: '#4E6B7A', wall: '#B98A5E', wallDk: '#8C6444',
      roof: '#5E4B5A', deck: '#9C7A5A', post: '#5A4636', win: '#FFD58A', inside: '#5B4436', glow: '#FFB45A', glowA: .55,
      skin: '#F2C9A0', tonShirt: '#E9E2D2', apron: '#4F6F6A', tonHair: '#2E2633', herDress: '#7FA9B8', herHair: '#3B2A2E', umb: '#D0533F', towel: '#F3EBDC',
      ink: '#2A2230', sw: 1, br: 'ink', rain: '#E8EEF2', rainA: 150, bgInk: false },
    { name: 'sumi', mode: 'sumi', sky: '#D8D2C4', sky2: '#E9E3D6', sea: '#8E8B86', seaDk: '#5E5C5A', wall: '#B5ADA0', wallDk: '#7E776E',
      roof: '#4A4644', deck: '#9A948A', post: '#3E3A38', win: '#F1E8D4', inside: '#4A4644', glow: '#FFE3B0', glowA: .25,
      skin: '#EDE5D6', tonShirt: '#EDE5D6', apron: '#5E5C5A', tonHair: '#1E1C1F', herDress: '#C9C2B6', herHair: '#1E1C1F', umb: '#C23B2E', towel: '#F4EFE4',
      ink: '#1E1C1F', sw: 1.8, br: 'dry', rain: '#5E5C5A', rainA: 120, bgInk: true },
    { name: 'night', mode: 'wash', sky: '#1B2347', sky2: '#2C3A68', sea: '#1E3A57', seaDk: '#132639', wall: '#3E3150', wallDk: '#2A2140',
      roof: '#1A1530', deck: '#3A3048', post: '#1C1628', win: '#FFD07A', inside: '#7A4A2E', glow: '#FFAE4A', glowA: 1,
      skin: '#E8B48E', tonShirt: '#D9CFBE', apron: '#3E6A72', tonHair: '#191424', herDress: '#5F8FB0', herHair: '#22182A', umb: '#E0563F', towel: '#F3E6CC',
      ink: '#120E1C', sw: 1, br: 'ink', rain: '#9FB6E8', rainA: 170, bgInk: false },
    { name: 'papercut', mode: 'paper', sky: '#8FB3C2', sky2: '#B7D0D6', sea: '#3F7E92', seaDk: '#2D6273', wall: '#E0A15C', wallDk: '#B97A3E',
      roof: '#B4483A', deck: '#C99A6A', post: '#7A5636', win: '#FFE08A', inside: '#6E3E2A', glow: '#FFC266', glowA: .4,
      skin: '#F4C59A', tonShirt: '#F6EFE0', apron: '#2F7A6E', tonHair: '#2B2230', herDress: '#F0C64A', herHair: '#4A2E2A', umb: '#E2574A', towel: '#FFFFF0',
      ink: null, sw: 0, br: 'ink', rain: '#FFFFFF', rainA: 120, shadow: '#1E2A3A' },
    { name: 'pencil', mode: 'pencil', sky: '#C6D3DC', sky2: '#E6EAE6', sea: '#8FB0BC', seaDk: '#6A8E9C', wall: '#E2C29A', wallDk: '#C49E72',
      roof: '#9C6A7A', deck: '#D2B48C', post: '#8A6A50', win: '#FFE7A6', inside: '#9A7660', glow: '#FFD27A', glowA: .3,
      skin: '#F6D3B2', tonShirt: '#FBF6EC', apron: '#8DB8A8', tonHair: '#5A4A50', herDress: '#B8D4E8', herHair: '#6A4A42', umb: '#E88470', towel: '#FFFDF6',
      ink: '#5A4E58', sw: .9, br: 'cpencil', rain: '#7F98A8', rainA: 140, bgInk: true },
    { name: 'golden', mode: 'wash', sun: true, sky: '#F2B872', sky2: '#F8DDA8', sea: '#D9905A', seaDk: '#A9643E', wall: '#C68A58', wallDk: '#9A6040',
      roof: '#6A3E46', deck: '#B07A50', post: '#5E3A2E', win: '#FFE2A0', inside: '#6A4030', glow: '#FFD07A', glowA: .5,
      skin: '#F4C298', tonShirt: '#F4E8D2', apron: '#4F6F6A', tonHair: '#2E2030', herDress: '#7FA9B8', herHair: '#3B2A2E', umb: '#C8483A', towel: '#FFF2DC',
      ink: '#3A2228', sw: 1, br: 'ink', rain: null, bgInk: false },
  ];

  let S = STYLES[0];
  // character / prop shape in the style's medium
  function fig(pts, col, o = {}) {
    if (S.mode === 'paper') {
      paint(pts.map(([x, y]) => [x + 9, y + 11]), { wash: S.shadow, washOp: 90, ink: null, curv: o.curv });
      paint(pts, { wash: col, ink: null, curv: o.curv });
    } else if (S.mode === 'pencil') {
      paint(pts, { wash: col, washOp: 210, ink: S.ink, sw: S.sw, br: 'cpencil', curv: o.curv });
    } else if (S.mode === 'sumi') {
      paint(pts, { wash: col, washOp: col === S.umb ? 255 : 200, ink: S.ink, sw: o.thin ? 1 : S.sw, br: o.thin ? 'ink' : 'dry', curv: o.curv });
    } else paint(pts, { wash: col, ink: S.ink, sw: o.thin ? .6 : S.sw, br: S.br, curv: o.curv });
  }
  // background shape: watercolour fill, washes underneath so nothing is see-through
  function bg(pts, col, o = {}) {
    if (S.mode === 'paper') return fig(pts, col, o);
    paint(pts, { wash: col, washOp: S.mode === 'sumi' ? 140 : 255, ink: null, curv: o.curv });
    if (S.mode === 'pencil') paint(pts, { hatch: { d: 9, a: o.ha ?? Math.PI / 4, b: 'cpencil', c: mixCol(col, S.ink, .45), w: .8 }, ink: S.ink, sw: .6, br: 'cpencil' });
    else paint(pts, { fill: mixCol(col, S.ink, .25), fillOp: 70, bleed: .2, tex: .7, ink: S.bgInk ? S.ink : null, sw: S.mode === 'sumi' ? 1.4 : .5, br: S.mode === 'sumi' ? 'dry' : 'ink', curv: o.curv });
  }
  // two-point lines need a midpoint, or the spline draws nothing
  const dense = P => P.length > 2 ? P : [P[0], [(P[0][0] + P[1][0]) / 2, (P[0][1] + P[1][1]) / 2], P[1]];
  const line = (pts, sw, col) => inkLine(dense(pts), sw * (S.mode === 'sumi' ? 1.6 : 1), col || S.ink || '#2A2230', S.mode === 'pencil' ? 'cpencil' : S.mode === 'sumi' ? 'dry' : 'ink');

  // ---------- set ----------
  function set(t) {
    boilSeed('sky');
    paint(rectPts(-60, -60, W + 120, 640), { wash: S.sky, ink: null });
    if (S.mode !== 'paper') paint(ellPts(1300, 120, 900, 220, 26, 30), { fill: S.sky2, fillOp: 120, bleed: .3, tex: .6, ink: null });
    else for (let i = 0; i < 3; i++) fig(ellPts(1050 + i * 330, 110 + 40 * (i % 2), 230, 70, 18, 6), S.sky2);
    if (S.sun) { glow(1520, 470, 520, '#FFE0A0', .9); boilSeed('sun'); paint(ellPts(1520, 470, 70, 70, 28, 1), { wash: '#FFF0C8', ink: null }); }
    // sea
    boilSeed('sea');
    bg(rectPts(-60, 560, W + 120, 560), S.sea, { ha: 0 });
    for (let i = 0; i < 9; i++) {
      boilSeed('wave' + i);
      const x = 1050 + hash(i * 3.3) * 900, y = 600 + hash(i * 5.1) * 300, w = 50 + 60 * hash(i + 2);
      line([[x - w, y], [x - w / 2, y - 7], [x, y], [x + w / 2, y - 7], [x + w, y]], .7, S.mode === 'sumi' ? S.seaDk : S.sky2);
    }
    if (S.sun) { glow(1520, 640, 260, '#FFD08A', .6); }
    // pier deck + posts
    boilSeed('deck');
    for (let i = 0; i < 6; i++) bg(rectPts(150 + i * 300, 930, 34, 180, 2), S.post);
    bg([[-60, 880], [W + 60, 880], [W + 60, 950], [-60, 950]], S.deck, { ha: 0 });
    for (let i = 0; i < 12; i++) line([[i * 170 + 40, 884], [i * 170 + 40, 948]], .5, mixCol(S.deck, S.ink || '#000', .5));
    // the tea shop
    boilSeed('shop');
    if (S.glowA) glow(470, 600, 520, S.glow, S.glowA * .6);
    bg([[90, 300], [900, 300], [900, 885], [90, 885]], S.wall, { ha: Math.PI / 2 });
    for (let i = 1; i < 9; i++) line([[90, 300 + i * 66], [900, 300 + i * 66]], .45, S.wallDk);
    fig([[40, 320], [495, 150], [950, 320], [930, 345], [60, 345]], S.roof);
    // window with warm light, steam-fogged
    fig(rectPts(160, 430, 260, 220, 2), S.win);
    if (S.glowA) glow(290, 540, 230, S.glow, S.glowA);
    line([[290, 430], [290, 650]], .8); line([[160, 540], [420, 540]], .8);
    fig(rectPts(140, 650, 300, 22, 1), S.wallDk);
    // the broken umbrella's future spot: hook by the door (motif)
    line([[880, 470], [880, 490], [868, 490]], .7);
    // doorway
    fig(rectPts(560, 470, 250, 415, 2), S.inside);
    if (S.glowA) glow(685, 700, 260, S.glow, S.glowA * .8);
    fig(rectPts(540, 452, 290, 26, 1), S.wallDk);
  }

  // ---------- people (feet at x, y; height ~430) ----------
  const ribbonArm = (P, w, col) => fig(ribbon(P, w, w * .8), col);
  function face(x, y, dir, mood) {
    boilSeed('face' + x);
    fig(ellPts(x + dir * 22, y - 6, 5, 7, 10), S.ink || '#2A2230', { thin: true });
    fig(ellPts(x + dir * 2, y - 6, 4.5, 6.5, 10), S.ink || '#2A2230', { thin: true });
    if (S.mode !== 'sumi') paint(ellPts(x + dir * 14, y + 12, 10, 6, 10), { wash: '#E88A7A', washOp: 90, ink: null });
    if (mood === 'laugh') fig([[x + dir * 2, y + 18], [x + dir * 26, y + 16], [x + dir * 15, y + 32]], '#8A3A3A', { thin: true });
    else line([[x + dir * 6, y + 20], [x + dir * 15, y + 24], [x + dir * 24, y + 19]], .7);
  }
  function ton(x, y, t) {
    boilSeed('ton');
    const br = Math.sin(t * 2) * 3;
    ribbonArm([[x - 14, y - 190], [x - 18, y - 90], [x - 20, y]], 30, S.tonHair);
    ribbonArm([[x + 14, y - 190], [x + 18, y - 90], [x + 22, y]], 30, S.tonHair);
    fig([[x - 56, y - 340 + br], [x + 56, y - 340 + br], [x + 66, y - 175], [x - 66, y - 175]], S.tonShirt, { curv: .2 });
    fig([[x - 40, y - 290 + br], [x + 46, y - 290 + br], [x + 56, y - 150], [x - 50, y - 150]], S.apron, { curv: .1 });
    ribbonArm([[x - 50, y - 330 + br], [x - 62, y - 250], [x - 50, y - 180]], 26, S.tonShirt);
    // right arm offers the towel toward her
    ribbonArm([[x + 48, y - 330 + br], [x + 120, y - 290], [x + 190, y - 280]], 26, S.tonShirt);
    fig([[x + 165, y - 300], [x + 245, y - 305], [x + 250, y - 195], [x + 225, y - 160], [x + 170, y - 205]], S.towel, { curv: .3 });
    fig(ellPts(x + 190, y - 280, 15, 14, 12), S.skin, { thin: true });
    fig(ellPts(x + 6, y - 395 + br, 46, 54, 26, 1), S.skin);
    fig([[x - 46, y - 400], [x - 40, y - 445], [x + 8, y - 462], [x + 50, y - 440], [x + 54, y - 410], [x + 20, y - 428], [x - 20, y - 418]], S.tonHair, { curv: .5 });
    face(x + 6, y - 390 + br, 1, 'calm');
  }
  function her(x, y, t) {
    boilSeed('her');
    const pant = Math.sin(t * 7) * 4;
    ribbonArm([[x - 12, y - 160], [x - 16, y - 70], [x - 14, y]], 26, S.skin);
    ribbonArm([[x + 14, y - 160], [x + 20, y - 70], [x + 26, y]], 26, S.skin);
    fig([[x - 44, y - 320 + pant], [x + 44, y - 320 + pant], [x + 90, y - 120], [x - 80, y - 116]], S.herDress, { curv: .25 });
    // wet hair, long, dripping toward the back (right)
    fig([[x - 40, y - 420], [x + 10, y - 450], [x + 56, y - 420], [x + 70, y - 330], [x + 40, y - 300], [x + 30, y - 360], [x - 38, y - 380]], S.herHair, { curv: .5 });
    fig(ellPts(x - 6, y - 380 + pant, 42, 50, 26, 1), S.skin);
    fig([[x - 48, y - 392], [x - 30, y - 438], [x + 20, y - 444], [x + 46, y - 410], [x + 10, y - 412], [x - 20, y - 400]], S.herHair, { curv: .5 });
    face(x - 6, y - 376 + pant, -1, 'laugh');
    // left hand to chest (catching breath)
    ribbonArm([[x - 38, y - 310 + pant], [x - 64, y - 250], [x - 20, y - 240]], 22, S.herDress);
    fig(ellPts(x - 18, y - 240, 13, 12, 12), S.skin, { thin: true });
    // right hand holds up the broken umbrella: the stick and half a canopy
    ribbonArm([[x + 38, y - 310 + pant], [x + 90, y - 360], [x + 110, y - 430]], 22, S.herDress);
    fig(ellPts(x + 110, y - 432, 13, 12, 12), S.skin, { thin: true });
    line([[x + 112, y - 400], [x + 140, y - 600]], 1.6);
    fig([[x + 140, y - 600], [x + 10, y - 560], [x + 30, y - 590], [x + 80, y - 640]], S.umb, { curv: .4 });
    line([[x + 140, y - 600], [x + 230, y - 640]], .8); line([[x + 140, y - 600], [x + 250, y - 580]], .8);   // bare broken ribs
    // drips off her
    for (let i = 0; i < 4; i++) { boilSeed('drip' + i); const k = (t * 1.3 + hash(i)) % 1; fig(ellPts(x - 40 + i * 30, y - 120 + k * 110, 3, 6, 8), S.rain || S.sky2, { thin: true }); }
  }
  function flyingHalf(t) {
    boilSeed('half');
    const x = 1660 + Math.sin(t * 2) * 30, y = 190 + Math.cos(t * 1.7) * 20, r = Math.sin(t * 1.4) * .4;
    const P = [[-90, 0], [0, -50], [90, 0], [40, -6], [0, 4], [-40, -6]].map(([a, b]) => [x + a * Math.cos(r) - b * Math.sin(r), y + a * Math.sin(r) + b * Math.cos(r)]);
    fig(P, S.umb, { curv: .4 });
  }
  function rain(t) {
    if (!S.rain) return;
    for (let i = 0; i < 90; i++) {
      boilSeed('r' + i);
      const k = (t * 1.8 + hash(i * 1.7)) % 1, x = hash(i * 4.3) * (W + 300) - 100 - k * 120, y = -100 + k * (H + 200);
      inkLine(dense([[x, y], [x - 22, y + 70]]), .7, S.rain, S.mode === 'pencil' ? 'cpencil' : 'inkfine');
    }
  }

  function frame(t, lt) {
    camBegin(930 + Math.sin(lt * .4) * 6, 590, 1.14);
    set(t);
    ton(700, 885, t);
    her(1180, 885, t);
    if (!S.sun) flyingHalf(t); else { glow(1180, 700, 380, '#FFD08A', .25); }
    rain(t);
    camEnd();
  }
  devShots(STYLES.map((st, i) => [i, (t, lt) => { S = st; frame(t, lt); }]));
})();
