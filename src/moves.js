// moves.js: the acted beats of STORYBOARD.md as pose functions of shot time lt (seconds). Each returns a rig object for
// ton() / mai() (see cast.js); pass it as the pose argument. Expression keys ride in `face`, and `t` drives breath,
// blink and steam. Heights (counter, stove, sill, seat) are local units of the k = 1 body, so a scene can match its set.
// Load after acting.js (pose, antic, nod) and cast.js.
const HANG_T = { armF: [66, -242], armB: [-64, -242], handF: Math.PI / 2 - .1, handB: Math.PI / 2 + .1 };   // a little give at the elbows
const TONM = {
  // 02: straightens the noren he has just hung, a hand on each side of the hem (local -512 at the shop front), a small tug,
  // lets go (< 1.5 s), turns to us with the small smile
  noren: lt => ({ t: lt, ...pose(lt, [
    [0, { ...HANG_T, armF: [70, -360], armB: [-66, -354], handF: -.3, handB: -.2, fistF: true, fistB: true, lean: 0, nod: 0, face: { eyes: 'open', mouth: 'flat', look: .6, brow: .2 } }],
    // hands wide on the hem corners, elbows out, so neither arm passes behind his head
    [.2, { armF: [132, -500], armB: [-132, -496], elbB: -1, handF: -1.4, handB: -1.7, lean: -.04, nod: -.14, face: { eyes: 'open', mouth: 'flat', look: .2, brow: .6 }, _d: .6 }],
    [1.05, { armF: [134, -490], armB: [-134, -486], _d: .14, _snap: true }],
    [1.5, { ...HANG_T, fistF: false, fistB: false, lean: 0, nod: .04, _d: .55 }],
    [2.1, { nod: 0, face: { eyes: 'half', mouth: 'smile', look: -.6, brow: -.3 }, _d: .4 }],
  ]) }),
  // 03a: pushes both shutters open, a little step into it; the light lands on his face
  shutter: lt => ({ t: lt, ...pose(lt, [
    [0, { armF: [96, -372], armB: [70, -366], handF: -.3, handB: -.3, lean: .02, face: { eyes: 'open', mouth: 'flat', look: .8 } }],
    [.35, { armF: [168, -398], armB: [150, -408], handF: -.15, handB: -.2, lean: .12, _d: .35, _snap: true }],
    // then the hands come down onto the sill and he leans into the morning air (held in the air they read as a stiff wing)
    [1.1, { armF: [156, -284], armB: [128, -288], handF: .12, handB: .08, lean: .14, face: { eyes: 'half', mouth: 'smile', look: .8, brow: -.4 }, _d: .7 }],
  ]) }),
  // 03b: wipes the counter in slow loops with the red-striped towel; the back hand rests flat on the top
  wipe: (lt, cy = -268) => {
    const a = lt * TAU * .45;
    return { t: lt, armF: [138 + 34 * Math.cos(a), cy - 6 + 8 * Math.sin(a)], handF: .15, propF: 'rag', fistF: false,
      armB: [92, cy - 4], handB: .1, bFront: false, lean: .2 + .025 * Math.cos(a), towel: false,
      face: { eyes: 'half', mouth: 'smile', look: .7, brow: -.2 }, nod: .14 };
  },
  // 03c: sets the kettle down on the stove (released at 0.85 s; the set draws it after that)
  kettle: (lt, sy = -300) => ({ t: lt, ...pose(lt, [
    [0, { ...HANG_T, armF: [96, -350], handF: -1.5, fistF: true, propF: 'kettle', rotF: 0, lean: .04, nod: .06, face: { eyes: 'half', mouth: 'flat', look: .8 } }],
    [.15, { armF: [126, sy - 90], lean: .1, _d: .7 }],
    [.85, { propF: null, fistF: false, armF: [112, sy - 70], handF: -.5, _d: .3 }],
    [1.2, { ...HANG_T, lean: .02, nod: 0, face: { eyes: 'half', mouth: 'smile', look: .8 }, _d: .5 }],
  ]) }),
  // 08: pours with care into a glass on the counter, then sets the kettle upright; ton().spout is the stream start
  pour: (lt, cy = -268) => {
    const P0 = pose(lt, [
      [0, { armF: [102, cy - 96], handF: -1.5, fistF: true, propF: 'kettle', rotF: 0, armB: [104, cy - 4], handB: .1, lean: .1, nod: .12, face: { eyes: 'half', mouth: 'flat', look: .9, brow: .2 } }],
      [.3, { rotF: .72, armF: [96, cy - 112], _d: .55 }],
      [2.1, { rotF: 0, armF: [100, cy - 100], _d: .45 }],
      [2.7, { face: { eyes: 'half', mouth: 'smile', look: .9 }, nod: .06, _d: .4 }],
    ]);
    return { t: lt, ...P0, rotF: P0.rotF + .03 * Math.sin(lt * 5) * seg(lt, .8, 1) * (1 - seg(lt, 1.9, 2.1)) };
  },
  // 06: a small shrug, palms up, head tipped, smile
  shrug: lt => ({ t: lt, ...pose(lt, [
    [0, { ...HANG_T, shrug: 0, nod: 0, face: { eyes: 'half', mouth: 'flat', look: -.3, tilt: 0 } }],
    [.25, { armF: [100, -296], armB: [-96, -300], elbB: -1, handF: -.5, handB: Math.PI + .6, lenF: .85, lenB: .85, shrug: 1, nod: .05, face: { eyes: 'half', mouth: 'smile', look: -.3, tilt: 1 }, _d: .3, _snap: true }],
    [1.05, { ...HANG_T, lenF: 1, lenB: 1, shrug: 0, nod: 0, _d: .45 }],
  ]) }),
  // 07: forearms on the window sill, eyes closed, listening to the waves; slow deep breaths
  listen: (lt, sill = -318) => ({ t: lt, armF: [150, sill - 4], armB: [118, sill - 8], handF: .12, handB: .08, lean: .16 + .015 * Math.sin(lt * 1.3),
    bob: 2 * Math.sin(lt * 1.3), nod: -.07, face: { eyes: 'closed', mouth: 'smile', tilt: .6, blink: false } }),
  // 17: polishes a glass behind the counter, head bowed over it
  wipeGlass: lt => {
    const a = lt * TAU * .55;
    return { t: lt, armB: [70, -312], handB: -.2, propB: 'glass', bFront: true, lenB: .82,
      armF: [74 + 10 * Math.cos(a), -330 + 7 * Math.sin(a)], handF: Math.PI + .3, propF: 'rag', rotF: .3, lenF: .8, towel: false,
      lean: .06, nod: .16, face: { eyes: 'half', mouth: 'flat', look: .4 } };
  },
  // 22c: sits by the window, hands on his knees, and waits
  sitWait: lt => ({ t: lt, sit: 1, armF: [118, -170], armB: [96, -176], handF: .2, handB: .2, lean: .04 + .01 * Math.sin(lt),
    face: { eyes: 'half', mouth: 'flat', look: 1 } }),
  // 13a: steps out of the warm door and holds out the towel
  offer: lt => ({ t: lt, ...pose(lt, [
    [0, { armF: [74, -300], handF: .4, fistF: true, propF: 'towel', towel: false, lean: 0, face: { eyes: 'open', mouth: 'flat', look: 1, brow: .4 } }],
    [.3, { armF: [192, -344], handF: 0, lean: .05, _d: .5, _snap: true }],
  ]) }),
  // 22a: glances from the window to the umbrella on the wall, and holds
  glance: lt => ({ t: lt, ...pose(lt, [
    [0, { nod: 0, face: { eyes: 'half', mouth: 'flat', look: 1 } }],
    [.6, { nod: -.05, face: { eyes: 'open', mouth: 'flat', look: -1, brow: .3 }, _d: .35 }],
    [1.6, { face: { eyes: 'half', mouth: 'smile', look: -1, brow: -.2 }, _d: .4 }],
  ]) }),
};

// cadences in cycles/s
const RUN_CAD = 1.45, WALK_CAD = .95;
const MAIM = {
  // 11a/11b: runs through the rain under the broken umbrella; pair with MAIM.strikes for splashes
  run: (lt, cad = RUN_CAD) => ({ t: lt, gait: 'run', ph: lt * cad, umb: 'up', armB: undefined,
    face: { eyes: 'open', mouth: 'pant', brow: -.4, look: .6 } }),
  // boot strikes within the last 0.45 s: [{ leg: 0 back | 1 front, age }]
  strikes: (lt, cad = RUN_CAD) => {
    const out = [], ph = lt * cad;
    for (const [leg, off] of [[1, 0], [0, .5]]) if (ph >= off) out.push({ leg, age: frac(ph - off) / cad });
    return out;
  },
  // 12a: brakes under the eaves: runs in, plants the front boot, leans back, the umbrella swings on
  brake: (lt, cad = RUN_CAD) => {
    const P0 = pose(lt, [
      [0, { go: 1, feet: [[-40, 0], [56, 0]], toe: [.5, -.25], lean: 0, bob: 0, umbA: 0 }],
      [.15, { go: 0, lean: -.2, bob: -14, umbA: .32, _d: .3 }],
      [.55, { feet: [[-18, 0], [22, 0]], toe: [0, 0], lean: .04, bob: 0, umbA: 0, _d: .5 }],
    ]);
    return { t: lt, gait: 'run', ph: Math.min(lt, .3) * cad, umb: 'up', ...P0, umbA: P0.umbA + .1 * ring(lt, [.3], 5, 14),
      face: lt < .4 ? { eyes: 'wide', mouth: 'o', brow: .8 } : { eyes: 'open', mouth: 'pant', brow: -.3 } };
  },
  // 12b: bent over panting, looks at the wrecked umbrella, then laughs at herself
  pant: lt => {
    const heave = Math.sin(lt * TAU * 1.5), laugh = seg(lt, 1.9, 2.2);
    const P0 = pose(lt, [
      [0, { lean: .2, umbA: .7, nod: .1, face: { eyes: 'closed', mouth: 'pant', brow: -.6 } }],
      [1.0, { lean: .12, umbA: .25, nod: -.04, face: { eyes: 'open', mouth: 'o', brow: .6, look: 1 }, _d: .4 }],
      [1.9, { lean: -.04, nod: -.08, face: { eyes: 'happy', mouth: 'laugh', tilt: -1 }, _d: .25 }],
    ]);
    return { t: lt, umb: 'low', armF: [76, -318], ...P0, bob: 3 * heave * (1 - laugh) + 3 * laugh * Math.abs(Math.sin(lt * 15)), shrug: .35 * (heave + 1) / 2 * (1 - laugh) };
  },
  // 13b: takes the towel with her free hand
  takeTowel: lt => ({ t: lt, umb: 'low', umbA: .4, ...pose(lt, [
    [0, { armB: [-28, -288], handB: -.2, face: { eyes: 'open', mouth: 'smile', look: 1, brow: .4 } }],
    [.3, { armB: [126, -332], handB: -.3, lean: .06, bFront: false, _d: .5 }],
    [1.0, { face: { eyes: 'happy', mouth: 'smile', tilt: .6 }, _d: .3 }],
  ]) }),
  // 14/16a: sits at the window under the towel, cradles the tea and sips (sip at 1.4–2.6 s)
  sitCup: (lt, seat = 110) => ({ t: lt, sit: 1, seat, cup: true, towel: 'head', drip: false, ...pose(lt, [
    [0, { sip: 0, nod: .06, face: { eyes: 'half', mouth: 'smile', look: .3 } }],
    [1.4, { sip: 1, nod: -.06, face: { eyes: 'closed', mouth: 'smile', blink: false }, _d: .5 }],
    [2.2, { sip: 0, nod: .06, face: { eyes: 'half', mouth: 'smile', look: .3 }, _d: .45 }],
  ]) }),
  // 16b: watches the storm over the sea, glass held low
  watch: (lt, seat = 110) => ({ t: lt, sit: 1, seat, cup: true, towel: 'head', drip: false, nod: -.05 + .02 * Math.sin(lt * .8),
    face: { eyes: 'open', mouth: 'flat', look: 1, brow: .2 } }),
  // 19a: stands up from the window seat (glass already set down), towel off the head and in her hands
  standUp: (lt, seat = 110) => ({ t: lt, seat, umb: null, drip: false, ...pose(lt, [
    [0, { sit: 1, lean: .05, armF: [96, -176], armB: [74, -180], handF: .2, handB: .2, face: { eyes: 'open', mouth: 'smile', look: 1 } }],
    [.2, { lean: .38, _d: .35 }],
    [.45, { sit: 0, lean: 0, armF: [52, -232], armB: [-28, -288], handB: -.2, _d: .6 }],
  ]) }),
  // 19b: holds the closed broken umbrella up and looks at it
  lookUmb: lt => ({ t: lt, umb: 'bundle', drip: false, ...pose(lt, [
    [0, { armF: [60, -250], umbA: 0, nod: 0, face: { eyes: 'open', mouth: 'flat', look: .6 } }],
    [.2, { armF: [82, -352], umbA: -1.25, nod: .08, face: { eyes: 'open', mouth: 'flat', look: 1, brow: .5 }, _d: .6 }],
    [1.3, { face: { eyes: 'half', mouth: 'smile', look: 1, brow: -.2, tilt: .6 }, _d: .4 }],
  ]) }),
  // 19c: bends and leans it against the door frame (released at 1.0 s; the set draws it after that)
  leanUmb: lt => ({ t: lt, drip: false, ...pose(lt, [
    [0, { umb: 'bundle', armF: [60, -250], umbA: 0, lean: 0, face: { eyes: 'open', mouth: 'smile', look: .8 } }],
    [.15, { armF: [118, -214], umbA: .22, lean: .2, _d: .6 }],
    [1.0, { umb: null, armF: [108, -236], _d: 0 }],
    [1.15, { armF: [52, -232], lean: 0, _d: .5 }],
  ]) }),
  // 20a: the smile at the door ("เก็บไว้นะคะ"), a small nod on the words
  smile: lt => ({ t: lt, drip: false, armB: [-28, -288], handB: -.2, nod: nod(lt, .9, 1, .07, .5),
    face: { eyes: 'open', mouth: lt > .5 ? 'smile' : 'flat', tilt: .8, look: -.2 } }),
  // 20b/23a: walks (away along the pier, or the boots stepping in at the door)
  walk: (lt, cad = WALK_CAD) => ({ t: lt, gait: 'walk', ph: lt * cad, drip: false, umb: null, face: { eyes: 'open', mouth: 'smile' } }),
};
