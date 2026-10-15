// castsheet.js: model sheet for Ton and Mai (t 6–8): full bodies left, expression heads right, palette chips bottom.
(() => {
  function sheet(t, lt) {
    boilSeed('paper');
    paint(rectPts(-40, -40, W + 80, H + 80), { wash: '#F1E9DA', ink: null });
    paint(ellPts(560, 560, 560, 470, 26, 20), { fill: '#DCE4E6', fillOp: 90, bleed: .3, tex: .6, ink: null });
    paint(ellPts(1450, 540, 470, 500, 26, 20), { fill: '#EADCC6', fillOp: 80, bleed: .3, tex: .6, ink: null });
    boilSeed('ton'); ton(300, 1010, 1.35, { eyes: 'half', mouth: 'smile', look: .4 }, 1, 'cup');
    boilSeed('mai'); mai(760, 1010, 1.35, { eyes: 'happy', mouth: 'laugh', tilt: -1 }, 1, 'umbrella', t);
    const TE = [{ eyes: 'half', mouth: 'flat' }, { eyes: 'open', mouth: 'o', brow: 1 }, { eyes: 'closed', mouth: 'smile', tilt: 1 }, { eyes: 'half', mouth: 'smile', look: 1, brow: -.5 }];
    const ME = [{ eyes: 'happy', mouth: 'laugh' }, { eyes: 'closed', mouth: 'pant', brow: -.6 }, { eyes: 'open', mouth: 'smile', look: -1 }, { eyes: 'wide', mouth: 'o', brow: 1 }];
    TE.forEach((e, i) => { boilSeed('th' + i); tonHead(1110 + i * 220, 250 + 480 * 1.15, 1.15, e); });
    ME.forEach((e, i) => { boilSeed('mh' + i); maiHead(1110 + i * 220, 620 + 440 * 1.15, 1.15, e); });
    const chips = ['tonHair', 'tonShirt', 'apron', 'trousers', 'towelLine', 'skin', 'maiHair', 'coat', 'skirt', 'boot', 'umb'];
    chips.forEach((c, i) => { boilSeed('c' + i); paint(ellPts(1060 + i * 72, 960, 28, 28, 18, 1), { wash: CAST[c], ink: CAST.ink, sw: .7 }); });
  }
  devShots([[6, sheet]]);
})();
