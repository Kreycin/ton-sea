// ghibli.js: KEY ART / style reference for the whole tale (t 8–10). Ghibli-inspired treatment:
//   - background is painted gouache with NO outlines: layered rain sky, sea, the pier tea shop, wet deck
//   - the cast (cast.js, same as the model sheet) keeps its thin warm line and one cel shade
//   - scale rule: the door is ~1.12 × Ton's height; Ton k = .82 in a wide shot
//   - light rule: cold blue-grey world; the only warm light comes from the shop (window, door, bulbs)
// Moment: the woman with the broken umbrella has just reached the shop; Ton steps out holding a towel.
(() => {
  const OPT = { maiPud: true, norenSw: 0, rainX: -Infinity };                  // maiPud = false: no boot reflection in the puddle; norenSw: hem swing (px)
  const eave = x => 270 + (x - 10) / 1010 * 34;                // bottom edge of the roof fascia

  // ---------- sky: layered rain-cloud strata, lit crests over dark bellies ----------
  function sky(t) {
    boilSeed('sky');
    [G.skyTop, G.sky2, G.sky3, G.skyLow].forEach((c, i) => gp(rectPts(-60, -60 + i * 150, W + 120, 230 + (i === 3 ? 200 : 0)), c));
    gp(rectPts(-60, 60, W + 120, 200), G.sky2, 90, { curv: .5 });
    gp(rectPts(-60, 300, W + 120, 160), G.sky3, 90, { curv: .5 });
    // the light break near the horizon (hope; it pays off in the golden ending)
    gp(ellPts(1450, 520, 520, 46, 30, 0), G.breakLt, 200, { curv: .5 });
    glow(1450, 500, 380, '#FFE6B4', .4);
    const dr = Math.sin(t * .08) * 12;
    strata(900, 2000, 500, 60, '#C9CCC6', '#A2ABB2', 1, dr * .4);
    strata(-80, 900, 460, 70, '#B3BBBF', '#8E9AA6', 2, dr * .5);
    strata(1000, 2000, 380, 110, '#A9B2B8', '#7D8B9B', 3, dr * .7);
    strata(-80, 1100, 250, 150, '#8592A1', '#5E6D80', 4, dr);
    strata(700, 2000, 130, 170, '#7C899A', '#4F5E72', 5, dr * 1.2);
    // distant rain curtains over the sea
    for (let i = 0; i < 4; i++) { boilSeed('curtain' + i); const x = 1050 + i * 190; gp([[x, 380], [x + 110, 380], [x + 60, 552], [x - 50, 552]], '#8794A0', 22, { curv: .3 }); for (let j = 0; j < 3; j++) st([[x + 20 + j * 30, 400], [x + j * 30 - 20, 548]], .3, '#9AA6B0'); }
  }
  function sea(t) {
    boilSeed('sea');
    // distant islands and a tiny lighthouse
    gp([[960, 558], [1060, 526], [1180, 508], [1300, 524], [1420, 550], [1500, 560]], G.hillFar, 255, { curv: .5 });
    gp([[1520, 562], [1640, 514], [1760, 496], [1880, 514], [1990, 562]], G.hill, 255, { curv: .5 });
    gp(rectPts(1790, 470, 12, 32), '#E6E2D6'); gp([[1786, 472], [1806, 472], [1796, 460]], '#B4483A');
    glow(1796, 474, 40, '#FFE2A0', .6 + .3 * Math.sin(t * 2));
    gp(rectPts(-60, 532, W + 120, 30), G.mist, 160, { curv: .5 });
    gp(rectPts(-60, 556, W + 120, 380), G.sea);
    gw(rectPts(-60, 700, W + 120, 240), G.seaDk, 120, .25);
    gp(rectPts(-60, 556, W + 120, 10), G.seaLt, 200);
    gp(rectPts(1250, 566, 420, 6), G.breakLt, 150);                 // the light break reflected
    for (let i = 0; i < 34; i++) {
      boilSeed('sw' + i);
      const x = 980 + hash(i * 2.1) * 1000, y = 580 + Math.pow(hash(i * 4.7), 1.4) * 290, w = 20 + 70 * hash(i + 5) * (y - 540) / 300;
      st([[x - w, y], [x, y - 2], [x + w, y]], .5 + .5 * (y - 560) / 300, G.seaLt);
    }
    // moored rowboat, bobbing
    const bob = Math.sin(t * 1.3) * 4, ro = Math.sin(t * 1.3 + 1) * .03;
    push(); translate(1580, 770 + bob); rotate(ro); translate(-1580, -770);
    gp([[1480, 752], [1690, 752], [1660, 790], [1510, 790]], '#B5543E', 255, { curv: .3 });
    gp([[1480, 752], [1690, 752], [1686, 760], [1484, 760]], '#E6D8BC');
    gp(rectPts(1540, 744, 60, 8), '#7A5236');
    pop();
    st([[1688, 756 + bob], [1760, 770], [1830, 796]], .7, '#D8C8A8');   // mooring rope to the railing
    // rain haze: one cold veil over everything far away (atmospheric depth)
    gp(rectPts(-60, 300, W + 120, 500), G.mist, 40);
  }

  // ---------- the tea shop ----------
  function shop(t) {
    boilSeed('shop');
    for (let i = 0; i < 4; i++) gp(rectPts(110 + i * 250, 880, 40, 60, 2), G.post);
    // body: warm boards above, painted wainscot below
    gp([[40, 268], [990, 296], [990, 900], [40, 900]], G.wall);
    for (let i = 0; i < 11; i++) st([[40, 330 + i * 40], [990, 332 + i * 40]], .5, G.wallDk);
    for (let i = 0; i < 7; i++) { boilSeed('bd' + i); gp(rectPts(60 + hash(i * 3.1) * 860, 330 + hash(i * 1.7) * 380, 90 + 120 * hash(i), 30), G.wallLt, 80); }
    gp([[40, 268], [990, 296], [990, 350], [40, 330]], G.wallDk, 120);  // shade under the roof
    gp(rectPts(40, 754, 950, 146), G.paint);
    for (let i = 0; i < 24; i++) st([[44 + i * 39, 758], [45 + i * 39, 898]], .5, G.paintDk);
    gp(rectPts(40, 746, 950, 12), G.trim);
    // shed roof, corrugated, deep fascia
    gp([[10, 228], [1020, 262], [1020, 298], [10, 264]], G.roof);
    gp([[10, 256], [1020, 290], [1020, 304], [10, 270]], G.roofDk);
    for (let i = 0; i < 27; i++) st([[20 + i * 37, 231 + i * 1.25], [20 + i * 37, 258 + i * 1.25]], .4, G.roofLt);
    // rooftop signboard standing on the roof: a painted cup
    st([[300, 236], [300, 184]], 2, G.post); st([[520, 243], [520, 184]], 2, G.post);
    gp(rectPts(250, 110, 320, 78), G.chalk);
    gp(rectPts(256, 116, 308, 66), G.paintDk);
    cupIcon(410, 148, .7, G.trim, t);
    // stovepipe and kettle steam
    gp(rectPts(800, 140, 26, 116), G.post); gp(rectPts(790, 130, 46, 16), G.post);
    for (let i = 0; i < 4; i++) { boilSeed('stm' + i); const k = (t * .35 + i / 4) % 1; gw(ellPts(813 + k * 70 + Math.sin(k * 6 + i) * 14, 120 - k * 110, 18 + 30 * k, 14 + 20 * k, 20, 0), '#E8E6E0', 140 * (1 - k), .3); }
    // big window: shelves of tins, hanging cups, pendant lamp, counter with copper kettle and brewer
    glow(310, 580, 380, G.glow, .75);
    gp(rectPts(100, 424, 420, 316), G.win);
    gp(rectPts(100, 424, 420, 316), '#E9B870', 110);
    for (let i = 0; i < 2; i++) { gp(rectPts(120, 474 + i * 54, 380, 7), G.inside, 210); for (let j = 0; j < 8; j++) gp(rectPts(130 + j * 46, 448 + i * 54, 24, 26), ['#C9A060', '#9AB08A', '#E3D3B4', '#B4643E'][(i + j) % 4], 230); }
    for (let j = 0; j < 5; j++) { st([[150 + j * 56, 540], [150 + j * 56, 556]], .6, G.inside); gp([[138 + j * 56, 556], [162 + j * 56, 556], [158 + j * 56, 578], [142 + j * 56, 578]], '#F4EEE2', 240); }
    st([[460, 432], [460, 540]], .8, G.inside); gp([[440, 540], [480, 540], [490, 566], [430, 566]], G.copper); glow(460, 574, 80, '#FFE2A0', .9);
    gp(rectPts(100, 660, 420, 80), '#7A5236', 230);
    gp(rectPts(100, 652, 420, 10), '#A0764E');
    gp([[170, 652], [214, 652], [220, 608], [204, 594], [180, 594], [164, 608]], G.copper, 255, { curv: .4 });
    st([[214, 624], [236, 610]], 3, G.copper);
    gp(rectPts(300, 594, 70, 58), G.steel); gp(rectPts(312, 624, 46, 10), '#5A6266');
    for (let i = 0; i < 3; i++) gp(rectPts(98 + i * 141, 424, 8, 316), G.trim);
    gp(rectPts(98, 588, 426, 6), G.trim); gp(rectPts(92, 418, 436, 10), G.trim);
    // condensation and rain runs on the glass
    for (let i = 0; i < 9; i++) { boilSeed('run' + i); const x = 110 + hash(i * 5.3) * 400, y = 470 + hash(i * 2.2) * 200; st([[x, y], [x + 2, y + 30 + 40 * hash(i)]], .6, '#FFF2D0'); }
    // striped canvas awning with a scalloped hem
    gp([[70, 346], [540, 346], [570, 418], [40, 418]], G.awnA);
    for (let i = 0; i < 8; i++) { const u0 = i / 8, u1 = (i + .5) / 8; gp([[70 + u0 * 470, 346], [70 + u1 * 470, 346], [40 + u1 * 530, 418], [40 + u0 * 530, 418]], G.awnB); }
    for (let i = 0; i < 16; i++) gp(ellPts(56 + i * 33.1, 420, 16, 12, 12, 0), i % 2 ? G.awnA : G.awnB);
    gp(rectPts(100, 432, 420, 26), G.inside, 70);
    // window ledge, two stools, a forgotten cup
    gp(rectPts(84, 740, 452, 14), '#A0764E');
    for (let i = 0; i < 2; i++) { const x = 190 + i * 200; gp(ellPts(x, 800, 34, 9, 16, 0), '#5A3E30'); st([[x - 22, 804], [x - 28, 892]], 1.6, G.post); st([[x + 22, 804], [x + 28, 892]], 1.6, G.post); st([[x - 26, 852], [x + 26, 852]], 1, G.post); }
    gp([[410, 722], [430, 722], [428, 740], [412, 740]], '#F4EEE2');
    // door: tall, glass-panelled, propped open; short indigo curtain; warm interior
    gp(rectPts(590, 380, 220, 520), G.inside);
    glow(700, 680, 320, G.glow, .65);
    gp(rectPts(612, 600, 176, 300), '#7A5236', 150);
    const nw = OPT.norenSw;
    gp([[590, 384], [810, 384], [810 + nw, 470], [705 + nw * .6, 476], [695 + nw * .5, 470], [590 + nw * .8, 476]], G.noren);
    st([[700, 384], [700 + nw * .5, 472]], .6, '#1E2E44');
    gp(rectPts(576, 366, 248, 18), G.trim);
    gp([[810, 384], [850, 396], [850, 896], [810, 900]], '#7A5236');                     // the open door leaf
    gp([[818, 410], [842, 418], [842, 600], [818, 596]], G.win, 200);
    // the hook where the broken umbrella will hang (motif)
    st([[890, 420], [890, 436], [878, 436]], 1.2, G.post);
    // blade sign on a bracket, swinging in the wind
    const sw = Math.sin(t * 1.6) * .06;
    st([[990, 330], [1070, 330]], 2, G.post); st([[990, 370], [1030, 330]], 1.4, G.post);
    push(); translate(1050, 334); rotate(sw); translate(-1050, -334);
    st([[1034, 334], [1034, 350]], .8, G.post); st([[1066, 334], [1066, 350]], .8, G.post);
    gp(rrPts(1004, 350, 92, 82, 10), G.paint); gp(rrPts(1010, 356, 80, 70, 8), G.trim);
    cupIcon(1050, 396, .5, G.paintDk, t);
    pop();
    // string lights under the roof edge
    for (let i = 0; i < 12; i++) {
      boilSeed('bulb' + i);
      const x = 60 + i * 80, y = eave(x) + 14 + Math.sin((i % 4) / 3 * Math.PI) * 14, x2 = x + 80, y2 = eave(x2) + 14 + Math.sin(((i + 1) % 4) / 3 * Math.PI) * 14;
      if (i < 11) st([[x, y], [x + 40, (y + y2) / 2 + 10], [x2, y2]], .5, G.post);
      glow(x, y + 10, 34, G.glow, .8); gp(ellPts(x, y + 10, 6, 8, 10, 0), '#FFE3A0');
    }
    // A-frame chalkboard: chalk cup doodle and wavy scribbles (no readable text)
    gp([[470, 790], [550, 790], [570, 892], [450, 892]], '#8A6A4A');
    gp([[478, 798], [542, 798], [558, 878], [462, 878]], G.chalk);
    cupIcon(510, 826, .36, '#E8E4D8', t);
    for (let i = 0; i < 2; i++) st([[478, 856 + i * 10], [495, 853 + i * 10], [512, 858 + i * 10], [542, 854 + i * 10]], .6, '#E8E4D8');
    // plants, a sack of tea leaves on a crate
    function plant(x, y, s, seed) {
      boilSeed('pl' + seed);
      gp([[x - 30 * s, y - 50 * s], [x + 30 * s, y - 50 * s], [x + 22 * s, y], [x - 22 * s, y]], G.pot);
      for (let i = 0; i < 11; i++) {
        const a = -Math.PI / 2 + (hash(seed * 5 + i) - .5) * 2.3 + Math.sin(t * 1.5 + i) * .03, L = (60 + 50 * hash(i + seed)) * s;
        const tx = x + Math.cos(a) * L, ty = y - 50 * s + Math.sin(a) * L;
        gp(ribbon([[x, y - 50 * s], [(x + tx) / 2, (y - 50 * s + ty) / 2 - 8], [tx, ty]], 22 * s, 4), [G.leaf, G.leafLt, G.leafDk][i % 3]);
      }
    }
    gp(rectPts(866, 810, 110, 82), '#8A6A4A'); st([[866, 850], [976, 850]], .6, G.post);
    gp([[876, 810], [966, 810], [972, 752], [944, 738], [896, 740], [872, 756]], '#C8B08A', 255, { curv: .4 });
    plant(70, 890, .9, 1); plant(1010, 892, .85, 3);
  }

  // ---------- pier: back railing, wet deck, puddles ----------
  function railing(t) {
    boilSeed('rail');
    for (let i = 0; i < 6; i++) { const x = 1060 + i * 170; gp(rectPts(x, 770, 18, 116), G.post); gp(rectPts(x - 3, 764, 24, 10), G.deckDk); }
    gp([[1050, 782], [W + 60, 782], [W + 60, 794], [1050, 794]], G.deckDk);
    for (let i = 0; i < 5; i++) { const x = 1078 + i * 170; st([[x, 820], [x + 85, 846], [x + 152, 820]], 1, '#C8B898'); }
    // a gull sheltering on the last post
    const gx = 1830, gy = 762, nod = Math.sin(t * 1.1) > .7 ? 2 : 0;
    gp(ellPts(gx, gy - 14, 20, 12, 16, 0), '#EDEBE4'); gp(ellPts(gx - 14, gy - 26 + nod, 9, 8, 12, 0), '#EDEBE4');
    gp([[gx - 4, gy - 18], [gx + 24, gy - 16], [gx + 10, gy - 8]], '#9AA0A6'); gp([[gx - 22, gy - 26 + nod], [gx - 32, gy - 24 + nod], [gx - 22, gy - 22 + nod]], '#E8B840');
  }
  function deck(t) {
    boilSeed('deck');
    gp(rectPts(-60, 880, W + 120, H - 800), G.deck);
    let y = 884, gap = 16;
    for (let r = 0; r < 12 && y < H + 60; r++) {
      st([[-60, y], [W + 60, y + 1]], .5 + r * .06, G.deckDk);
      for (let j = 0; j < 7; j++) { const x = (hash(r * 7 + j) + j) * 300 - 40; st([[x, y], [x, y + gap]], .5, G.deckDk); }
      if (r % 2 === 0) gp(rectPts(-60, y + 3, W + 120, gap * .35), G.deckLt, 60);
      y += gap; gap *= 1.22;
    }
    glow(700, 920, 300, G.glow, .35);                                  // door light spilling on the boards
    // puddle under the window, holding the cold sky
    boilSeed('pud1');
    gp(ellPts(310, 952, 230, 20, 30, 0), G.deckDk, 255, { curv: .5 });
    gp(ellPts(310, 952, 210, 14, 30, 0), '#6C7C8F', 200, { curv: .5 });
    // wet-board reflections: each warm pane and the door smear downward in broken vertical streaks
    const streak = (x0, x1, len, col, seed) => {
      for (let i = 0; i < 5; i++) {
        boilSeed('stk' + seed + i);
        const x = x0 + (x1 - x0) * (i + hash(seed * 9 + i) * .5) / 5, w = 10 + 14 * hash(seed + i * 3), L = len * (.4 + .6 * hash(seed * 3 + i));
        for (let j = 0; j < 4; j++) gp(rectPts(x + j * 2, 886, w - j * 4, L * (1 - j * .24)), col, 30, { curv: .5 });
      }
    };
    for (let i = 0; i < 3; i++) streak(106 + i * 141, 236 + i * 141, 120, '#F0C27A', i + 1);
    streak(600, 800, 150, '#F0B866', 7);
    // puddle in front of her: sky, then her red boots and yellow coat mirrored upside down
    if (OPT.maiPud) {
    boilSeed('pud2');
    const mx = 1340;
    gp(ellPts(mx, 960, 180, 26, 30, 0), G.deckDk, 255, { curv: .5 });
    gp(ellPts(mx, 960, 165, 20, 30, 0), '#94A1AC', 210, { curv: .5 });
    gp([[mx - 36, 940], [mx - 6, 940], [mx - 6, 956], [mx - 36, 956]], '#B24E40', 150);
    gp([[mx + 6, 940], [mx + 36, 940], [mx + 36, 956], [mx + 6, 956]], '#B24E40', 150);
    gp([[mx - 40, 970], [mx + 40, 970], [mx + 60, 978], [mx - 60, 978]], '#C89A3A', 140, { curv: .3 });
    gp(ellPts(mx, 960, 165, 20, 30, 0), G.mist, 50, { curv: .5 });
    }
    // rain ripples in the puddles
    for (let i = 0; i < 6; i++) {
      boilSeed('rip' + i);
      const k = (t * 1.4 + hash(i * 3.7)) % 1, cx = i < 3 ? 140 + hash(i) * 340 : 1220 + hash(i) * 240, cy = i < 3 ? 952 : 962;
      st(ellPts(cx, cy, 6 + 30 * k, 2 + 6 * k, 18, 0).concat([[cx + 6 + 30 * k, cy]]), .5 * (1 - k) + .2, '#DCE4EA');
    }
  }
  function foreground(t) {
    boilSeed('fg');
    // mooring bollard with rope, cut by the frame bottom-right: depth through overlap and scale
    gp([[1700, 1000], [1790, 1000], [1796, 1110], [1694, 1110]], '#2E2626', 255, { curv: .2 });
    gp(ellPts(1745, 1000, 52, 16, 20, 0), '#4A3E3A');
    gp(ellPts(1745, 996, 40, 10, 20, 0), '#5E504A');
    for (let i = 0; i < 3; i++) st([[1694, 1024 + i * 14], [1745, 1034 + i * 14], [1796, 1024 + i * 14]], 3, '#C8B898');
    st([[1694, 1052], [1600, 1080], [1500, 1076]], 3, '#C8B898');
    // big leaves in the near-left corner, in shadow and cut by the frame: frames the shop, balances the bollard
    gp([[40, 1000], [170, 1000], [156, 1100], [54, 1100]], '#6E3A26');
    for (let i = 0; i < 9; i++) {
      boilSeed('fl' + i);
      const a = -Math.PI / 2 + (i - 4) * .3 + Math.sin(t * 1.2 + i) * .02, L = 170 + 110 * hash(i * 2.3), bx = 105, by = 1004;
      const tx = bx + Math.cos(a) * L, ty = by + Math.sin(a) * L * .8;
      gp(ribbon([[bx, by], [(bx + tx) / 2 + 20 * Math.cos(a + 1.2), (by + ty) / 2 - 20], [tx, ty]], 46, 4), ['#22382A', '#2C4834', '#1C2E24'][i % 3]);
      st([[bx, by], [(bx + tx) / 2 + 20 * Math.cos(a + 1.2), (by + ty) / 2 - 20], [tx, ty]], .5, '#4A6A52');
    }
  }

  // ---------- weather ----------
  function rain(t, layer) {
    const far = layer === 'far', L = far ? { n: 120, len: 30, sw: .35, a: '#C9D2DA', sp: 1.6, sl: .2 } : { n: 110, len: 70, sw: .6, a: G.rain, sp: 2.4, sl: .28 };
    for (let i = 0; i < L.n; i++) {
      boilSeed(layer + i);
      const k = (t * L.sp + hash(i * 1.7 + (far ? 50 : 0))) % 1, x = hash(i * 4.3 + (far ? 9 : 0)) * (W + 300) - 100 - k * 90, y = -100 + k * (H + 200), len = L.len * (.6 + .8 * hash(i));
      if (x < OPT.rainX) continue;
      st([[x, y], [x - len * L.sl, y + len]], L.sw, L.a);
    }
  }
  function drips(t) {
    for (let i = 0; i < 16; i++) {                                        // off the roof edge
      boilSeed('dr' + i);
      const x = 30 + i * 62 + hash(i) * 20; if (x < OPT.rainX) continue;
      const y0 = eave(x) + 2, k = (t * 1.2 + hash(i * 2.9)) % 1, y = y0 + k * k * (880 - y0);
      gp(ellPts(x, y0 + 2, 3, 4, 8, 0), G.rain, 200);
      if (x < 560 || x > 860) st([[x, y], [x, y + 18]], .7, G.rain);
    }
    for (let i = 0; i < 8; i++) {                                         // off the awning hem
      boilSeed('ad' + i);
      const x = 60 + i * 66; if (x < OPT.rainX) continue;
      const k = (t * 1.5 + hash(i * 6.1)) % 1, y = 432 + k * k * 300;
      st([[x, y], [x, y + 14]], .7, G.rain);
    }
    for (let i = 0; i < 16; i++) {                                        // splashes on the deck
      boilSeed('sp' + i);
      const k = (t * 3 + hash(i * 2.9)) % 1, x = hash(i * 6.1) * W; if (x < OPT.rainX) continue;
      const y = 900 + hash(i * 3.7) * 150, r = 6 + 14 * k;
      st([[x - r, y], [x - r * .5, y - r * .6], [x, y - r * .8], [x + r * .5, y - r * .6], [x + r, y]], .5, G.rain);
    }
  }

  function frame(t, lt) {
    camBegin(960 + Math.sin(lt * .4) * 5, 560, 1.03);
    sky(t); sea(t); railing(t); shop(t); deck(t);
    rain(t, 'far');
    gp(ellPts(704, 898, 64, 7, 20, 0), '#3A2C26', 140, { curv: .5 });
    gp(ellPts(1340, 933, 56, 7, 20, 0), '#3A2C26', 140, { curv: .5 });
    boilSeed('ton'); ton(700, 896, .82, { eyes: 'open', mouth: 'flat', look: 1, brow: .4 }, 1, 'towel');
    boilSeed('mai'); mai(1340, 932, .86, { eyes: 'happy', mouth: 'laugh', tilt: 1 }, -1, 'umbrella', t);
    drips(t); rain(t, 'near');
    foreground(t);
    camEnd();
  }
  devShots([[8, frame]]);
  window.GH = { sky, sea, railing, shop, deck, rain, drips, foreground, frame, opt: OPT };
})();
