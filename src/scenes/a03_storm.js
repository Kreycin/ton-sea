// a03_storm.js: act 3, "tea on a stormy day" (STORYBOARD.md shots 14–17, video 58.24–75.45 s). Inside the shop, the
// rain on the glass; Mai under the towel at the window, Ton pours. 17 is the held image at the heart of the quiet.
(() => {
  const V = AIRV, G = AIRG;
  (window.ACT_SPANS = window.ACT_SPANS || []).push([V(54.24), V(71.45)]);
  const { int, tonAt, maiStool, both, pourRig, pourGlass, steam } = STAGE;
  const IL = INT.L;
  const camLerp = (a, b, u) => { const v = u <= 1 ? .35 * u + .65 * ease(u) : 1 + .35 * Math.min(u - 1, .2); return a.map((x, i) => lerp(x, b[i], v)); };   // eased drift, runs on gently through a dissolve

  // 14: she has just sat down at the window under the towel (settles, hugs herself warm); Ton pours the hot tea
  function s14(t, lt, dur) {
    const b = {}, pl = Math.max(0, lt - 2.65);                            // the pour lands on "ต้นชงชา"
    const mr = { t: lt, sit: 1, seat: 110, towel: 'head', drip: false, umb: null, nod: .04, bob: -10 * Math.exp(-lt * 5) * Math.cos(lt * 9),
      face: lt < 2.6 ? { eyes: 'half', mouth: 'smile', look: .3 } : { eyes: 'open', mouth: 'smile', look: 1, brow: .3 } };
    int(t, camLerp([1080, 500, 1.45], [1090, 498, 1.52], lt / dur), IL.rain, { prints: 1, umb: 'lean', noKettle: 1 }, {
      back: both(tonAt(1000, 100, pourRig(pl), 1, b), maiStool(mr)),
      mid: pourGlass(b, { x: 1138, fill: .8 * ease(seg(pl, .55, 2.1)), stream: pl > .55 && pl < 2.2, steam: seg(pl, 1.6, 2.6), t }),
    });
  }
  // 15: ECU of the glass: steam rising in thin threads, the sea a blur behind the rain running down the window (a breath)
  function s15(t, lt, dur) {
    camBegin(960, 540 - 10 * lt / dur, 1 + .05 * ease(lt / dur));
    boilSeed('insg');
    const O = INT.OUT.rain;
    gp(rectPts(-60, -60, W + 120, H + 120), '#3C4A5E');
    gp(rectPts(-60, 300, W + 120, 160), O.s2, 110, { curv: .5 }); gp(rectPts(-60, 420, W + 120, 260), O.sea, 210, { curv: .5 });
    for (let i = 0; i < 36; i++) {                                         // rain running down the glass
      const x = hash(i * 2.3) * W, y0 = (hash(i * 3.1) * H + t * 70 * (.4 + hash(i))) % (H + 200) - 100, L = 40 + 80 * hash(i * 5);
      st([[x, y0], [x + 3 * Math.sin(i), y0 + L / 2], [x, y0 + L]], .9, '#8E9EB2');
    }
    glow(520, 420, 300, '#FFD08A', .22);
    gp(rectPts(-60, 830, W + 120, 300), '#6E4E3A'); gp(rectPts(-60, 830, W + 120, 18), '#B08868');
    const gx = 960, gb = 840, w0 = 150, w1 = 122, h = 330;
    gp(ellPts(gx, gb + 4, w1 + 30, 14, 24, 0), '#3A2C26', 120, { curv: .5 });
    paint([[gx - w0, gb - h], [gx + w0, gb - h], [gx + w1, gb], [gx - w1, gb]], { wash: '#F4EEE2', washOp: 170, ink: CAST.ink, sw: .9, curv: .2 });
    gp([[gx - w0 + 14, gb - h * .72], [gx + w0 - 14, gb - h * .72], [gx + w1 - 10, gb - 12], [gx - w1 + 10, gb - 12]], '#B9763A', 235);
    gp(ellPts(gx, gb - h * .72, w0 - 16, 14, 24, 0), '#D79A58');
    st([[gx - w0 + 30, gb - h + 20], [gx - w0 + 40, gb - h * .4], [gx - w1 + 24, gb - 30]], 3, '#FFFFFF');
    glow(gx, gb - h * .4, 160, '#FFC27A', .25);
    steam(gx, gb - h - 10, 4, t * .6, 4, 170);
    camEnd();
  }
  // 16a: CU: both hands round the glass, warming; she sips
  function s16a(t, lt, dur) {
    int(t, camLerp([1330, 600, 3.0], [1330, 596, 3.1], lt / dur), IL.rain, { umb: 'lean' }, { back: maiStool(MAIM.sitCup(lt - .5)) });
  }
  // 16b: over her shoulder: the storm crossing the sea, far lightning; she breathes, the towel over her head
  function s16b(t, lt) {
    const bolt = (x, k) => x > 0 ? Math.min(1, x / .08) * Math.exp(-x * k) : 0, fl = .8 * bolt(lt - 2.2, 7) + .5 * bolt(lt - 2.42, 9);   // a soft 2-frame attack, no white pop
    int(t, [1410 + lt * 6, 450, 1.9], IL.rain, { flash: Math.min(1, fl) });
    boilSeed('ots');
    const dk = '#222838', by = 3 * Math.sin(lt * 2.2) - 4 * ease(seg(lt, 2.2, 2.5)) * (lt < 3.2 ? 1 : 0);
    gp(ellPts(470, 1080 + by * .4, 380, 250, 30, 0), mixCol(CAST.coat, dk, .62));
    gp(ellPts(470, 760 + by, 150, 175, 28, 0), mixCol(CAST.maiHair, dk, .4));
    gp([[300, 700], [360, 590], [470, 560], [580, 590], [640, 700], [660, 900], [560, 870], [470, 880], [380, 870], [280, 900]].map(([x, y]) => [x, y + by]),
      mixCol(CAST.towel, dk, .55), 255, { curv: .5 });
    st([[300, 840 + by], [470, 820 + by], [650, 840 + by]], 6, mixCol(CAST.towelLine, dk, .5));
  }
  // 17: the held image: she at the window with her tea, he polishing a glass behind the counter, the kettle singing.
  // Hardly a word between them; a very slow push and nothing else
  function s17(t, lt, dur) {
    int(t, camLerp([1010, 520, 1.12], [1030, 510, 1.22], ease(lt / dur)), IL.rain, { kettle: .7 + .3 * seg(lt, 1.5, 2.2), umb: 'lean', prints: .6, glasses: 1 },
      { back: both(tonAt(820, 100, TONM.wipeGlass(lt * .8)), maiStool(MAIM.watch(lt))) });
  }

  shots([[V(54.24), s14], [V(58.80), s15], [V(61.95), s16a], [V(64.26), s16b], [V(66.57), s17]]);
})();
