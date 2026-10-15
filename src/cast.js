// cast.js: Ton and the woman in the rain ("Mai"). Storybook proportions (~4.7 heads), organic curved silhouettes,
// one outline per part. Both drawn at feet (x, y), scale k (k = 1 → Ton is 520 px tall).
//   expr: { eyes: 'half'|'open'|'wide'|'happy'|'closed', mouth: 'smile'|'flat'|'laugh'|'o'|'pant', brow: -1..1, look: -1..1, tilt,
//           blink: false to hold the eyes, hair (Mai): px the wet strands trail by (- = behind) }
//
// Rig: the last argument of ton() / mai() is a preset name (the old fixed poses) or a rig object. Local units are the
// k = 1 body, +x = the way the character faces, y up is negative, (0, 0) = the ground between the feet.
//   common:  t (time, for breath, blink, steam), id (blink key), lean (rad, + = forward, about the hips), bob (px, + = up),
//            nod (rad, head about the neck), shrug 0..1, face {expr overrides},
//            armF / armB: [x, y] wrist target (two-bone IK) or null = hanging; elbF / elbB: +1 elbow down/back, -1 out/forward;
//            handF / handB: hand angle (rad) or null = along the forearm; fistF / fistB: true = closed grip;
//            lenF / lenB: arm length factor (< 1 foreshortens an arm bent toward the camera).
//   ton:     propF / propB: 'cup'|'kettle'|'rag'|'glass'|'towel' with rotF / rotB (rad, kettle + = pour), towel: false (off
//            the shoulder), sit 0..1 with seat (px above the ground, default 150), stride -1..1 (a step, front foot forward).
//   mai:     sit 0..1 with seat (default 110); gait: 'run'|'walk' with ph (cycle phase) and go 0..1 (blend in);
//            feet: [[x, y], [x, y]] sole targets (back, front) when not walking; toe: [a, a] foot angles (+ = toe down);
//            umb: 'up'|'low'|'bundle'|null with umbA (rad about the grip), cup: true (glass in both hands) with sip 0..1,
//            towel: 'shoulders'|'head'|null, hem (px the coat hem trails by).
// Both return { head, hands: [back, front], feet: [back, front] } in world coordinates.
const CAST = {
  // Ghibli-like: thin warm-dark line
  ink: '#3A2A2C', swK: .65, skin: '#F2C9A0', skinDk: '#D9A57C', blush: '#E8897A',
  tonHair: '#2B2430', tonShirt: '#EFE7D6', tonShirtDk: '#CFC3AC', apron: '#3F6B66', apronDk: '#2E504C', trousers: '#3A3540', shoe: '#6B4A3A', towel: '#F6F0E4', towelLine: '#C9584A',
  maiHair: '#4A2E2A', maiHairLt: '#6E4538', coat: '#E8B33C', coatDk: '#C48F22', skirt: '#2F4560', boot: '#C8463A', bootDk: '#97322A', umb: '#D0533F',
  cup: '#F4EEE2', tea: '#B9763A', copper: '#C27A44', copperDk: '#8E5230', copperLt: '#E8A872', bail: '#5A3E2E',
};
(() => {
  const C = CAST;
  let X = 0, Y = 0, K = 1, F = 1, XS = [], SPOUT = null;                // origin, scale, facing (1 = right, -1 = left), local transform stack
  // XS entries {a, px, py, ox, oy}: rotate a about (px, py), then shift by (ox, oy); the last pushed applies first
  const xf = (dx, dy) => {
    for (let i = XS.length - 1; i >= 0; i--) {
      const s = XS[i], c = Math.cos(s.a || 0), n = Math.sin(s.a || 0), x = dx - (s.px || 0), y = dy - (s.py || 0);
      dx = (s.px || 0) + x * c - y * n + (s.ox || 0); dy = (s.py || 0) + x * n + y * c + (s.oy || 0);
    }
    return [dx, dy];
  };
  const P = (dx, dy) => { const q = xf(dx, dy); return [X + q[0] * K * F, Y + q[1] * K]; };
  const pts = a => a.map(([dx, dy]) => P(dx, dy));
  const sh = (a, col, o = {}) => paint(pts(a), { wash: col, ink: C.ink, sw: (o.sw ?? 1.1) * C.swK, curv: o.curv ?? .5, br: 'ink' });
  const flat = (a, col, op = 255, curv = .5) => paint(pts(a), { wash: col, washOp: op, ink: null, curv });
  const ln = (a, sw = .8, col = C.ink) => inkLine(pts(a.length > 2 ? a : [a[0], [(a[0][0] + a[1][0]) / 2, (a[0][1] + a[1][1]) / 2], a[1]]), sw * K * C.swK, col, 'ink', .5);
  const ell = (dx, dy, rx, ry, col, o = {}) => { const [cx, cy] = P(dx, dy); paint(ellPts(cx, cy, rx * K, ry * K, o.n ?? 20, 0, (o.rot ?? 0) * F), o.noInk ? { wash: col, washOp: o.op ?? 255, ink: null } : { wash: col, ink: C.ink, sw: (o.sw ?? .9) * C.swK }); };
  // a limb: tapered ribbon through shoulder, elbow, wrist
  const limb = (a, w0, w1, col) => paint(ribbon(pts(a), w0 * K, w1 * K), { wash: col, ink: C.ink, sw: C.swK });
  // small vector helpers (local space)
  const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
  const mid = (a, b, k = .5) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
  const unit = v => { const d = Math.hypot(v[0], v[1]) || 1; return [v[0] / d, v[1] / d]; };
  const rotV = (v, a) => [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)];
  const bare = fn => { const s = XS; XS = []; const r = fn(); XS = s; return r; };   // draw in ground space, no body transform
  const W = q => bare(() => P(q[0], q[1]));                                          // ground-local → world
  // two-bone IK from s to target t; bend +1 puts the joint on the clockwise side of s→t (below a forward reach)
  function ik(s, t, L1, L2, bend = 1) {
    const dx = t[0] - s[0], dy = t[1] - s[1], d = clamp(Math.hypot(dx, dy), Math.abs(L1 - L2) + 1, (L1 + L2) * .999);
    const base = Math.atan2(dy, dx), off = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1)), a = base + bend * off;
    return [[s[0] + Math.cos(a) * L1, s[1] + Math.sin(a) * L1], [s[0] + Math.cos(base) * d, s[1] + Math.sin(base) * d]];
  }
  // mitten hand with a thumb, pointing along angle ang (radians, in local facing space); fist = a closed grip
  function hand(dx, dy, ang = Math.PI / 2, fist = false, col = C.skin) {
    const c = Math.cos(ang), s = Math.sin(ang), R = (u, v) => [dx + u * c - v * s, dy + u * s + v * c];
    if (fist) {
      sh([R(-6, -10), R(8, -12), R(16, -6), R(17, 5), R(8, 11), R(-6, 10)], col, { sw: .9, curv: .6 });
      ln([R(10, -8), R(13, 0), R(10, 8)], .6);
      return;
    }
    sh([R(-6, -11), R(10, -12), R(20, -6), R(22, 4), R(12, 12), R(-6, 11)], col, { sw: .9, curv: .6 });
    sh([R(-2, -11), R(6, -20), R(12, -16), R(6, -8)], col, { sw: .8, curv: .6 });
  }
  const blinkAt = (o, key) => o.t !== undefined && frac((o.t + hash((o.id ?? key) * 1.7 + 3)) / (2.9 + hash(key + 5))) < .045;
  const faceOf = (e, o, key, open) => {
    const f = { ...e, ...(o.face || {}) };
    if (f.blink !== false && blinkAt(o, key) && (f.eyes || open) !== 'closed' && f.eyes !== 'happy') f.eyes = 'closed';
    return f;
  };
  const breath = o => o.t === undefined ? 0 : 1.6 * Math.sin(o.t * TAU * .27 + (o.id || 0));
  // idle drift: a slow weight sway and head drift on every pose, so a held pose never freezes (rad)
  // lip-sync: while a DIALOG line of this character plays (dialog.js), the mouth opens with its loudness
const speak = (who, fe) => {
  const v = typeof SPEAK === 'function' ? SPEAK(who, NOW_T) : 0;
  return v > .6 ? { ...fe, mouth: 'pant' } : v > .22 ? { ...fe, mouth: 'o' } : fe;
};
const sway = o => o.t === undefined ? 0 : .01 * Math.sin(o.t * 1.05 + (o.id || 0) * 1.7);
  const headDrift = o => o.t === undefined ? 0 : .022 * Math.sin(o.t * .73 + (o.id || 0)) + .01 * Math.sin(o.t * 1.9 + 1);

  // ---------- faces ----------
  function eye(dx, dy, kind, look, big) {
    const r = big ? 7.5 : 5.5;
    if (kind === 'happy') return ln([[dx - 8, dy + 2], [dx, dy - 6], [dx + 8, dy + 2]], 1.3);
    if (kind === 'closed') return ln([[dx - 8, dy - 1], [dx, dy + 4], [dx + 8, dy - 1]], 1.2);
    const ry = kind === 'half' ? r * .7 : kind === 'wide' ? r * 1.35 : r * 1.1;
    ell(dx + look * 2.5, dy + (kind === 'half' ? 1.5 : 0), r, ry, C.ink, { noInk: true, n: 16 });
    ell(dx + look * 2.5 + 2.2, dy - ry * .35, r * .32, r * .32, '#FFF6E8', { noInk: true, n: 10 });
    if (kind === 'half') ln([[dx - r - 3, dy - 3], [dx, dy - 6], [dx + r + 3, dy - 3]], 1.2);   // heavy lid
  }
  function mouth(dx, dy, kind) {
    if (kind === 'smile') return ln([[dx - 9, dy - 2], [dx, dy + 4], [dx + 9, dy - 2]], .9);
    if (kind === 'flat') return ln([[dx - 7, dy + 1], [dx, dy + 2], [dx + 7, dy]], .8);
    if (kind === 'o') return sh([[dx - 5, dy], [dx, dy - 6], [dx + 5, dy], [dx, dy + 7]], '#7A3436', { sw: .8 });
    if (kind === 'pant') return sh([[dx - 8, dy - 2], [dx + 8, dy - 3], [dx + 5, dy + 8], [dx - 4, dy + 8]], '#7A3436', { sw: .8 });
    // laugh: open D-shape with a tongue
    sh([[dx - 14, dy - 4], [dx + 14, dy - 5], [dx + 9, dy + 9], [dx, dy + 13], [dx - 9, dy + 9]], '#7A3436', { sw: .9 });
    flat([[dx - 6, dy + 6], [dx + 6, dy + 6], [dx + 3, dy + 11], [dx - 3, dy + 11]], '#D86A6A');
  }

  // ---------- props (local coords around a grip point g, turned by r) ----------
  function prop(kind, g, r = 0, tt = 0) {
    const Q = (u, v) => add(g, rotV([u, v], r)), M = a => a.map(([u, v]) => Q(u, v));
    if (kind === 'cup' || kind === 'glass') {               // a tea glass held round its middle
      sh(M([[-16, -24], [16, -24], [12, 10], [-12, 10]]), C.cup, { curv: .3, sw: .9 });
      if (kind === 'cup') {
        flat(M([[-13, -18], [13, -18], [10, 6], [-10, 6]]), C.tea, 200, .3);
        for (let i = 0; i < 2; i++) { const w = Math.sin(tt * 1.6 + i * 2) * 4; ln([add(g, [-6 + i * 10, -32]), add(g, [-10 + i * 10 + w, -48]), add(g, [-4 + i * 10 - w, -64])], .5, '#BFB6A8'); }
      } else flat(M([[-10, -20], [-4, -20], [-6, 4], [-9, 4]]), '#FFFFFF', 150, .3);   // a glint on the clean glass
    } else if (kind === 'kettle') {                          // the copper kettle hangs from its wooden bail; r > 0 pours
      sh(M([[-42, 40], [-30, 22], [0, 16], [30, 22], [42, 40], [36, 66], [0, 76], [-36, 66]]), C.copper, { curv: .6 });
      flat(M([[8, 30], [34, 30], [38, 56], [10, 68]]), C.copperDk, 130, .6);
      flat(M([[-30, 32], [-16, 26], [-12, 36], [-26, 42]]), C.copperLt, 220, .6);
      sh(M([[32, 44], [44, 34], [66, 6], [72, 10], [52, 46], [38, 60]]), C.copper, { curv: .3, sw: .9 });   // gooseneck spout
      sh(M([[-16, 20], [16, 20], [12, 14], [-12, 14]]), C.copperDk, { curv: .4, sw: .7 });                 // lid
      sh(M([[-4, 14], [4, 14], [3, 8], [-3, 8]]), C.bail, { curv: .4, sw: .6 });                            // knob
      ln(M([[-30, 26], [-26, -2], [0, -6], [26, -2], [30, 26]]), 1.6, C.bail);                             // bail
      ln(M([[-30, 26], [-26, -2], [0, -6], [26, -2], [30, 26]]), .5);
    } else if (kind === 'rag') {                              // the red-striped towel bunched under the palm
      sh(M([[-26, -4], [-10, -14], [14, -12], [30, -2], [26, 12], [6, 16], [-18, 14]]), C.towel, { curv: .5, sw: .9 });
      ln(M([[-20, 8], [0, 10], [22, 6]]), 1, C.towelLine);
      ln(M([[-8, -8], [2, 2], [-2, 12]]), .5, '#BDB2A0');
    } else if (kind === 'towel') {                            // the towel hangs from the fist in soft folds
      const T = a => M(a.map(([u, v]) => [u - 200, v + 344]));
      sh(T([[190, -352], [212, -352], [230, -320], [244, -270], [246, -212], [234, -204], [220, -212], [206, -202], [192, -210], [178, -204], [174, -256], [180, -312]]), C.towel, { curv: .45, sw: .9 });
      flat(T([[212, -350], [230, -320], [244, -270], [246, -214], [234, -206], [224, -290]]), '#DCD2C0', 170, .45);
      ln(T([[198, -340], [192, -280], [194, -214]]), .6, '#BDB2A0'); ln(T([[208, -338], [214, -280], [220, -212]]), .6, '#BDB2A0');
      ln(T([[176, -236], [210, -240], [245, -234]]), 1.1, C.towelLine); ln(T([[176, -226], [210, -230], [245, -224]]), .7, C.towelLine);
    }
  }

  // ---------- Ton ----------
  function tonHead(e) {
    const t = e.tilt || 0, hx = t * 6, L = e.look || 0, b = e.brow || 0;
    // neck
    sh([[-11, -432], [11, -432], [12, -400], [-12, -400]], C.skinDk, { curv: .2, sw: .8 });
    ell(-46 + hx, -478, 8, 12, C.skin, { sw: .8 });
    ell(46 + hx, -478, 8, 12, C.skin, { sw: .8 });
    sh([[-45 + hx, -495], [-43 + hx, -456], [-30 + hx, -434], [0 + hx, -426], [28 + hx, -434], [42 + hx, -456], [45 + hx, -495], [34 + hx, -528], [0 + hx, -538], [-34 + hx, -528]], C.skin, { curv: .7 });
    // soft messy hair with a fringe that falls over one eye
    sh([[-52 + hx, -484], [-54 + hx, -522], [-34 + hx, -556], [2 + hx, -566], [38 + hx, -553], [56 + hx, -522], [52 + hx, -484], [44 + hx, -500], [36 + hx, -488], [30 + hx, -512], [16 + hx, -494], [8 + hx, -516], [-8 + hx, -496], [-18 + hx, -514], [-30 + hx, -494], [-40 + hx, -508], [-46 + hx, -482]], C.tonHair, { curv: .45 });
    ln([[-10 + hx, -548], [-2 + hx, -530], [-8 + hx, -514]], .6, '#5A4E60');
    flat([[-42 + hx, -492], [42 + hx, -492], [40 + hx, -484], [-40 + hx, -484]], C.skinDk, 110, .5);        // fringe shadow
    flat([[30 + hx, -470], [43 + hx, -490], [40 + hx, -452], [24 + hx, -436]], C.skinDk, 90, .5);           // cheek shade
    flat([[-20 + hx, -548], [10 + hx, -556], [-4 + hx, -540]], '#6A6070', 140, .5);                        // hair shine
    // brows: soft, slightly sad-kind
    ln([[-27 + hx, -498 - b * 4], [-17 + hx, -501 - b * 5], [-8 + hx, -499 - b * 3]], 1);
    ln([[8 + hx, -499 - b * 3], [17 + hx, -501 - b * 5], [27 + hx, -498 - b * 4]], 1);
    eye(-17 + hx, -480, e.eyes || 'half', L, false);
    eye(17 + hx, -480, e.eyes || 'half', L, false);
    ln([[2 + hx + L * 2, -472], [5 + hx + L * 2, -462], [0 + hx + L * 2, -460]], .7);   // nose
    ell(-27 + hx, -462, 8, 4, C.blush, { noInk: true, op: 90 });
    ell(27 + hx, -462, 8, 4, C.blush, { noInk: true, op: 90 });
    mouth(2 + hx, -448, e.mouth || 'smile');
  }
  const TON_PRESET = {
    cup: { armF: [28, -306], elbF: -1, lenF: .74, handF: Math.PI, propF: 'cup' },
    towel: { armF: [192, -344], handF: 0, fistF: true, propF: 'towel', towel: false },
  };
  // Ton's arm: sleeve rolled to the elbow, bare forearm, then (between forearm and hand) whatever he holds
  function tonArm(s0, tg, bend, ang, fist, pr, rot, tt, ln0 = 1) {
    const [el, wr] = ik(s0, tg, 92 * ln0, 70 * ln0, bend), u = unit(sub(wr, el)), n = [-u[1], u[0]];
    limb([s0, mid(s0, el, .55), add(el, u, 6)], 30, 26, C.tonShirt);
    limb([el, mid(el, wr), wr], 20, 17, C.skin);
    ln([add(el, n, 13), add(el, n, -13)], .8, C.tonShirtDk);                    // rolled cuff
    const a = ang ?? Math.atan2(u[1], u[0]), h0 = add(wr, u, 6), g = add(h0, [Math.cos(a), Math.sin(a)], 8);
    if (pr === 'kettle') SPOUT = add(g, rotV([70, 8], rot || 0));
    if (pr === 'cup' || pr === 'glass') prop(pr, add(g, [-2, -6]), rot, tt);
    else if (pr) prop(pr, g, rot, tt);
    hand(h0[0], h0[1], a, fist);
    return g;
  }
  function ton(x, y, k = 1, e = {}, f = 1, pose = 'cup') {
    const o = typeof pose === 'string' ? (TON_PRESET[pose] || {}) : pose;
    X = x; Y = y; K = k; F = f; XS = []; SPOUT = null;
    const sit = o.sit || 0, seat = o.seat ?? 150, drop = (250 - seat - 10) * sit, tt = o.t || 0;
    const body = { a: (o.lean || 0) + sway(o), px: 0, py: -250, ox: 0, oy: drop - (o.bob || 0) - breath(o) * .5 };
    const fe = faceOf(e, o, 1, 'half'), sy = -(o.shrug || 0) * 12 + breath(o) * -.4;
    // legs: the standing silhouette is the model-sheet trousers; a step or a seat switches to two jointed legs
    let feet;
    if (!sit && !o.stride) {
      sh([[-40, -262], [40, -262], [44, -140], [36, -16], [8, -16], [3, -160], [-3, -160], [-8, -16], [-36, -16], [-44, -140]], C.trousers, { curv: .25 });
      sh([[-44, -18], [-6, -18], [-4, 0], [-50, 0]], C.shoe, { curv: .4, sw: .9 });
      sh([[6, -18], [44, -18], [52, 0], [4, 0]], C.shoe, { curv: .4, sw: .9 });
      flat([[10, -258], [40, -258], [42, -150], [36, -20], [14, -20], [8, -160]], '#2A2630', 130, .25);    // trouser shade
      feet = [[-24, 0], [26, 0]];
    } else {
      const st = o.stride || 0;
      feet = [[lerp(-22 - st * 40, 70, sit), 0], [lerp(22 + st * 50, 104, sit), 0]];
      XS = [body];
      const hips = [xf(-20, -236), xf(20, -236)];
      XS = [];
      for (const i of [0, 1]) {
        const [kn] = ik(hips[i], add(feet[i], [0, -16]), lerp(118, 112, sit), 104, -1), an = add(feet[i], [0, -16]);
        paint(ribbon([P(...hips[i]), P(...kn), P(...an)], 46 * K, 30 * K), { wash: i ? C.trousers : '#332E38', ink: C.ink, sw: C.swK });
        sh([add(feet[i], [-22, -18]), add(feet[i], [16, -18]), add(feet[i], [26, 0]), add(feet[i], [-24, 0])], C.shoe, { curv: .4, sw: .9 });
      }
      XS = [body];
      sh([[-42, -270], [42, -270], [46, -226], [-46, -226]], C.trousers, { curv: .3 });                    // seat of the trousers
      XS = [];
    }
    XS = [body];
    const shB = xf(-52, -392 + sy), shF = xf(52, -392 + sy);
    const armB = o.armB || [-60, -236], armF = o.armF || [60, -236];
    const bFront = o.bFront ?? (o.armB ? armB[0] > -20 && armB[0] < 80 : false);
    let gB, gF;
    // back arm behind the body unless it reaches across the chest
    if (!bFront) gB = bare(() => tonArm(shB, armB, o.elbB ?? 1, o.handB ?? (o.armB ? null : Math.PI / 2 + .1), o.fistB, o.propB, o.rotB, tt, o.lenB));
    // shirt + apron
    sh([[-54, -396 + sy], [-22, -414], [22, -414], [54, -396 + sy], [60, -310], [50, -250], [-50, -250], [-60, -310]], C.tonShirt, { curv: .45 });
    ln([[0, -414], [0, -386]], .6, C.tonShirtDk);
    flat([[30, -400], [54, -394], [58, -312], [48, -258], [34, -258]], C.tonShirtDk, 150, .4);                // shirt shade
    if (sit) {                                                       // seated: the apron falls over the lap toward the knees
      const kx = lerp(48, 120, sit);
      sh([[-38, -372], [38, -372], [46, -262], [kx, -250], [kx + 4, -222], [10, -226], [-46, -236]], C.apron, { curv: .25 });
      flat([[22, -372], [38, -372], [46, -262], [kx, -250], [kx + 4, -226], [40, -232]], C.apronDk, 150, .2);
    } else {                                                         // below the waist the apron hangs plumb, whatever the lean
      const hang = a => bare(() => a.map(([px, py]) => { if (py <= -262) return xf(px, py); XS = [body]; const q = xf(px, -262); XS = []; return [q[0] + (o.lean || 0) * 30, q[1] + py + 262]; }));
      bare(() => {
        sh(hang([[-38, -372], [38, -372], [42, -262], [48, -150], [0, -144], [-48, -150], [-43, -262]]), C.apron, { curv: .2 });
        flat(hang([[22, -372], [38, -372], [42, -262], [48, -150], [26, -146], [26, -262]]), C.apronDk, 150, .2);
        ln(hang([[-14, -240], [-16, -200], [-18, -160]]), .6, C.apronDk); ln(hang([[14, -230], [17, -195], [20, -160]]), .6, C.apronDk);   // folds
      });
    }
    ln([[-30, -372], [-24, -410]], 1.2, C.apronDk); ln([[30, -372], [24, -410]], 1.2, C.apronDk);
    sh([[-22, -290], [10, -290], [10, -250], [-22, -250]], C.apronDk, { curv: .1, sw: .7 });   // pocket
    // towel over the left shoulder
    if (o.towel !== false) {
      sh([[-58, -400 + sy], [-30, -412 + sy], [-36, -360], [-44, -320], [-62, -326]], C.towel, { curv: .4, sw: .9 });
      ln([[-58, -340], [-44, -336]], 1, C.towelLine);
    }
    if (bFront) gB = bare(() => tonArm(shB, armB, o.elbB ?? 1, o.handB, o.fistB, o.propB, o.rotB, tt, o.lenB));
    // right arm (front)
    gF = bare(() => tonArm(shF, armF, o.elbF ?? 1, o.handF ?? (o.armF ? null : Math.PI / 2 - .1), o.fistF, o.propF, o.rotF, tt, o.lenF));
    XS = [body, { a: (o.nod || 0) + headDrift(o), px: 0, py: -420 }];
    tonHead(speak('ton', fe));
    const head = P(0, -480);
    XS = [];
    return { head, hands: [W(gB), W(gF)], feet: feet.map(W), spout: SPOUT && W(SPOUT) };
  }

  // ---------- Mai ----------
  function maiHead(e) {
    const t = e.tilt || 0, hx = t * 6, L = e.look || 0, b = e.brow || 0, hw = e.hair || 0;
    const sw = ([x, y]) => [x + hx + (y > -440 ? hw * (y + 440) / 80 : 0), y];      // the hanging strands trail by hw
    // wet hair mass behind, clinging in strands
    sh([[-50, -440], [-50, -478], [-32, -505], [0, -512], [32, -505], [52, -476], [58, -420], [64, -362], [50, -370], [44, -340], [34, -380], [-34, -380], [-44, -344], [-50, -372], [-62, -364], [-56, -420]].map(sw), C.maiHair, { curv: .5 });
    sh([[-10, -398], [10, -398], [11, -370], [-11, -370]], C.skinDk, { curv: .2, sw: .8 });
    sh([[-44 + hx, -452], [-40 + hx, -414], [-22 + hx, -394], [0 + hx, -389], [22 + hx, -394], [40 + hx, -414], [44 + hx, -452], [34 + hx, -486], [0 + hx, -496], [-34 + hx, -486]], C.skin, { curv: .7 });
    // side-swept wet fringe in clumps
    sh([[-48 + hx, -448], [-44 + hx, -486], [-14 + hx, -506], [24 + hx, -502], [48 + hx, -478], [50 + hx, -446], [38 + hx, -466], [30 + hx, -452], [20 + hx, -474], [2 + hx, -462], [-10 + hx, -478], [-26 + hx, -456], [-36 + hx, -468]], C.maiHair, { curv: .5 });
    flat([[-40 + hx, -452], [40 + hx, -452], [38 + hx, -444], [-38 + hx, -444]], C.skinDk, 100, .5);
    flat([[28 + hx, -430], [42 + hx, -450], [38 + hx, -414], [22 + hx, -396]], C.skinDk, 80, .5);
    flat([[-28 + hx, -498], [6 + hx, -506], [-8 + hx, -492]], C.maiHairLt, 170, .5);
    ln([[-20 + hx, -498], [-6 + hx, -480]], .6, C.maiHairLt); ln([[14 + hx, -500], [26 + hx, -478]], .6, C.maiHairLt);
    ln([[-26 + hx, -447 - b * 5], [-16 + hx, -451 - b * 6], [-7 + hx, -448 - b * 4]], .9);
    ln([[7 + hx, -448 - b * 4], [16 + hx, -451 - b * 6], [26 + hx, -447 - b * 5]], .9);
    eye(-16 + hx, -432, e.eyes || 'open', L, true);
    eye(16 + hx, -432, e.eyes || 'open', L, true);
    ln([[1 + hx + L * 2, -424], [3 + hx + L * 2, -417], [-1 + hx + L * 2, -415]], .6);
    ell(-27 + hx, -418, 9, 5, C.blush, { noInk: true, op: 120 });
    ell(27 + hx, -418, 9, 5, C.blush, { noInk: true, op: 120 });
    for (let i = 0; i < 3; i++) { ell(-30 + i * 5 + hx, -424 + (i % 2) * 3, 1.2, 1.2, C.skinDk, { noInk: true }); ell(24 + i * 5 + hx, -424 + (i % 2) * 3, 1.2, 1.2, C.skinDk, { noInk: true }); }
    mouth(1 + hx, -404, e.mouth || 'laugh');
  }
  // the broken umbrella: a red dome with scalloped hem; the back third is torn away, leaving bent bare ribs and a flapping scrap.
  // side view along the shaft axis u; mer(s, w) is a point on the rib at s (-1..1 across) and w (0 tip .. 1 rim)
  function umbrella(tt) {
    const ux = .15, uy = -.99, px = .99, py = .15, cx = 110, cy = -560, R = 150, Hd = 84;
    const mer = (s, w, lift = 0) => { const h = Hd * Math.pow(Math.max(0, 1 - w * w), .8) + lift; return [cx + px * R * s * w + ux * h, cy + py * R * s * w + uy * h]; };
    const rim = (s, lift = 0) => mer(s, 1, lift), tip = mer(0, 0);
    ln([[90, -400], [96, -420], tip], 1.6);                                                 // shaft
    ln([[96, -420], [90, -400], [80, -404]], 1.4);                                          // J handle
    // underside seen from just below: a dark crescent under the hem, ribs radiating inside
    const under = [];
    for (let i = 0; i <= 12; i++) under.push(rim(-1 + i / 12 * 1.2));
    for (let i = 12; i >= 0; i--) under.push(rim(-1 + i / 12 * 1.2, -20 * Math.sin(Math.PI * i / 12)));
    flat(under, '#8E3328', 255, .5);
    // intact canopy: left silhouette up to the tip, down the torn rib at s=.2, scalloped hem back
    const ribS = [-1, -.6, -.2, .2], out = [];
    for (let i = 10; i >= 0; i--) out.push(mer(-1, i / 10));
    for (let i = 1; i <= 10; i++) out.push(mer(.2, i / 10, Math.sin(i * 2.7) * 3));
    for (let r = 3; r > 0; r--) { out.push(rim((ribS[r] + ribS[r - 1]) / 2, 9)); out.push(rim(ribS[r - 1])); }
    sh(out, C.umb, { curv: .4, sw: 1 });
    flat([mer(-1, .95), mer(-1, .5), mer(-.6, .2), mer(-.6, .7), mer(-.8, .95)], '#E8826A', 170, .5);   // lit shoulder
    flat([mer(.2, .2), mer(.2, .95), mer(0, .95), mer(0, .4)], '#9A3A2E', 110, .5);                       // turning away
    for (const s2 of [-.6, -.2]) { const R2 = []; for (let w = 0; w <= 5; w++) R2.push(mer(s2, w / 5)); ln(R2, .6, '#8A2E26'); }
    // bare ribs beyond the tear, snapped at the joint and drooping
    for (const [s2, bend] of [[.6, 1], [1, -1]]) {
      const j = mer(s2, .55), e = rim(s2);
      ln([tip, mer(s2, .3), j], .8);
      ln([j, [j[0] + (e[0] - j[0]) * .6 + 10 * bend, j[1] + (e[1] - j[1]) * .6 + 26], [e[0] + 6 * bend, e[1] + 44]], .8);
    }
    // a scrap of canopy still caught on one rib, fluttering
    const fl = Math.sin(tt * 7) * 6, j2 = mer(.6, .55);
    sh([j2, [j2[0] + 34, j2[1] + 8 + fl], [j2[0] + 46, j2[1] + 34 + fl], [j2[0] + 12, j2[1] + 24]], C.umb, { curv: .3, sw: .8 });
    ln([tip, [tip[0] + ux * 18, tip[1] + uy * 18]], 1.4);                                   // ferrule
  }
  // the same umbrella closed: a limp red bundle hanging from its J handle (handle top at 0, ferrule at +y)
  function umbBundle(tt) {
    const s = .9, M = a => a.map(([u, v]) => [u * s, v * s]);
    ln(M([[-16, 22], [-14, 6], [0, 0], [6, 12], [4, 40]]), 2.4);                             // J handle
    ln(M([[3, 40], [2, 140], [0, 238]]), 1.2);                                              // shaft
    ln(M([[10, 96], [34, 128], [54, 150]]), .9); ln(M([[-8, 150], [-30, 182], [-44, 214]]), .9);   // bare ribs
    const fl = Math.sin(tt * 3) * 4;
    sh(M([[0, 64], [16, 80], [26, 112], [22, 150], [12, 184], [4, 206], [-6, 190], [-20, 160], [-24, 120], [-14, 84]]), C.umb, { curv: .45 });
    flat(M([[2, 74], [14, 92], [20, 130], [10, 176], [4, 196]]), '#9A3A2E', 150, .5);
    ln(M([[-6, 90], [-10, 130], [-4, 176]]), .6); ln(M([[8, 100], [10, 140], [6, 180]]), .6);   // folds
    sh(M([[18, 124], [40, 132 + fl], [46, 152 + fl], [24, 146]]), C.umb, { curv: .3, sw: .8 });
    ln(M([[0, 238], [0, 252]]), 1.6);                                                       // ferrule
  }
  // a red rain boot: sole point A, shin direction d (toward the knee), toe angle a (+ = toe down)
  function boot(A, d, a, col, dk) {
    const nn = [-d[1], d[0]], t = [Math.cos(a), Math.sin(a)], up = [t[1], -t[0]];      // nn: across the shin, front side
    const top = add(A, d, 90), toe = add(A, t, 30);
    sh([add(top, nn, -15), add(top, nn, 15), add(add(A, nn, 15), d, 12), add(toe, up, 12), toe, add(A, t, -14), add(add(A, nn, -15), d, 8)], col, { curv: .2 });
    ln([add(add(top, nn, -15), d, -7), add(add(top, nn, 15), d, -7)], .8, dk);
  }
  const MAI_PRESET = {
    umbrella: { umb: 'up', armB: [-28, -288], handB: -.2 },
    wave: { umb: 'up', armB: [-90, -440], elbB: -1, handB: -Math.PI / 2 - .2 },
    stand: { umb: null, armB: [-28, -288], handB: -.2 },
    sitCup: { sit: 1, cup: true, towel: 'shoulders', _seatOrigin: true },
  };
  // stand ↔ sit outlines (same point count, so a rise can morph): skirt and coat in the torso frame
  const SKIRT = [[[-46, -230], [0, -232], [46, -230], [50, -200], [54, -170], [20, -168], [-20, -168], [-54, -170]],
    [[-48, -236], [0, -238], [40, -238], [72, -224], [98, -208], [96, -186], [-30, -180], [-52, -196]]];
  const COAT = [[[-46, -362], [-20, -380], [20, -380], [46, -362], [62, -260], [76, -178], [38, -172], [-38, -172], [-76, -178], [-62, -260]],
    [[-46, -362], [-20, -380], [20, -380], [46, -362], [58, -280], [68, -226], [40, -210], [-30, -206], [-64, -216], [-60, -280]]];
  const COATSH = [[[24, -370], [46, -362], [62, -260], [76, -178], [30, -174], [36, -260]], [[24, -370], [46, -362], [58, -280], [68, -226], [40, -214], [36, -280]]];
  const morph = (A, k) => A[0].map((p, i) => mid(p, A[1][i], k));
  // gait: sole targets and toe angles for one leg at cycle phase p (0 = heel strike under the front)
  function gaitFoot(p, kind) {
    const run = kind === 'run', R = run ? 74 : 40, lift = run ? 72 : 24, st = run ? .38 : .6;
    if (p < st) { const u = p / st; return [[lerp(R, -R * .9, u), 0], run ? .55 * seg(u, .6, 1) : .3 * seg(u, .7, 1) - .12 * (1 - seg(u, 0, .15))]; }
    const u = (p - st) / (1 - st);
    return [[-R * .9 + 1.9 * R * ease(u), -lift * Math.pow(Math.sin(Math.PI * u), .8)], lerp(run ? .9 : .4, -.25, ease(u))];
  }
  function mai(x, y, k = 1, e = {}, f = 1, pose = 'umbrella', tt = 0) {
    const o = typeof pose === 'string' ? { ...(MAI_PRESET[pose] || {}), t: tt } : pose;
    tt = o.t ?? tt;
    const sit = o.sit || 0, seat = o.seat ?? 110, drop = (190 - seat) * sit;
    X = x; Y = o._seatOrigin ? y + seat * k : y; K = k; F = f; XS = [];
    // walking or running: the cycle drives feet, bob, lean, the swinging arm and the trailing hair and hem
    const go = o.gait ? (o.go ?? 1) : 0, ph = o.ph || 0, run = o.gait === 'run';
    let feet = o.feet || [[-20, 0], [20, 0]], toe = o.toe || [0, 0], bob = o.bob || 0, lean = (o.lean || 0) + sway(o), hem = o.hem || 0, hair = 0, swing = 0;
    if (sit) { feet = feet.map((q, i) => mid(q, [[66, -6], [92, 0]][i], sit)); toe = toe.map(a => a * (1 - sit)); }
    if (go) {
      const g = [gaitFoot(frac(ph + .5), o.gait), gaitFoot(frac(ph), o.gait)];
      feet = feet.map((q, i) => mid(q, [g[i][0][0] + (i ? 16 : -16), g[i][0][1]], go));
      toe = toe.map((a, i) => lerp(a, g[i][1], go));
      const st = run ? .38 : .6;
      bob += go * (run ? 10 : 4) * -Math.cos(4 * Math.PI * (ph - st / 2));
      lean += go * (run ? .2 : .06);
      hem += go * (run ? -14 - 6 * Math.sin(4 * Math.PI * ph - 1) : -3 * Math.sin(4 * Math.PI * ph - 1));
      hair = go * (run ? -12 - 5 * Math.sin(4 * Math.PI * ph - 1.5) : -2);
      swing = go * Math.cos(TAU * ph);
    }
    const body = { a: lean, px: 0, py: -190, ox: 0, oy: drop - bob - breath(o) * .5 };
    const fe = faceOf({ ...e, hair: (e.hair || 0) + hair }, o, 2, 'open');
    // legs: IK from the hips to the soles, knees forward; far leg first
    XS = [body];
    const hips = [xf(-14, -196), xf(14, -196)];
    XS = [];
    const legs = [0, 1].map(i => {
      const A = add(feet[i], [0, -30 * Math.max(0, Math.sin(toe[i])) * clamp(1 + feet[i][1] / 20)]), [kn] = ik(hips[i], A, lerp(98, 62, sit), 100, -1), d = unit(sub(kn, A));
      limb([hips[i], kn, add(A, d, 80)], i ? 22 : 20, i ? 18 : 16, i ? C.skin : C.skinDk);
      boot(A, d, toe[i], i ? C.boot : C.bootDk, i ? C.bootDk : '#7A2A24');
      return kn;
    });
    XS = [body];
    const s = sit;
    const sk = morph(SKIRT, s).map(([px, py], i) => i > 2 ? [px + hem * .4, py] : [px, py]);
    sh(sk, C.skirt, { curv: .3 });
    // raincoat: A-line, big collar, toggles, pocket flaps; the hem trails when she runs
    const hemPts = (A) => A.map(([px, py]) => py > -270 ? [px + hem * (py + 270) / 92, py] : [px, py]);
    sh(hemPts(morph(COAT, s)), C.coat, { curv: .35 });
    sh([[-30, -380], [0, -350], [-6, -332], [-42, -360]], C.coatDk, { curv: .3, sw: .9 });
    sh([[30, -380], [0, -350], [6, -332], [42, -360]], C.coatDk, { curv: .3, sw: .9 });
    flat(hemPts(morph(COATSH, s)), C.coatDk, 140, .35);   // coat shade
    ln([[0, -350], [0, lerp(-176, -208, s)]], .8, C.coatDk);
    for (let i = 0; i < 3; i++) ell(10, -320 + i * 40, 4, 6, C.coatDk, { sw: .6 });
    ln([[-56, -236], [-24, -238]], 1, C.coatDk); ln([[24, -238], [56, -236]], 1, C.coatDk);
    if (o.towel === 'shoulders' || (o.towel === undefined && e.towel)) {   // Ton's towel round her shoulders, both ends hanging in front
      sh([[-54, -366], [-34, -392], [-14, -380], [-22, -330], [-24, -292], [-42, -288], [-56, -300], [-60, -340]], C.towel, { curv: .45, sw: .9 });
      sh([[54, -366], [34, -392], [14, -380], [22, -330], [24, -292], [42, -288], [56, -300], [60, -340]], C.towel, { curv: .45, sw: .9 });
      flat([[34, -386], [54, -366], [58, -330], [44, -330]], '#DCD2C0', 170, .45);
      ln([[-56, -306], [-40, -304], [-24, -308]], 1, C.towelLine); ln([[24, -308], [40, -304], [56, -306]], 1, C.towelLine);
    }
    // arms: coat sleeves to the wrist; targets are in ground space so a hand stays on what it holds while the body moves
    const shB = xf(-44, -352 - (o.shrug || 0) * 10), shF = xf(44, -356 - (o.shrug || 0) * 10);
    const arm = (s0, tg, bend, w0, w1, ang, fist, ln0 = 1) => {
      const [el, wr] = ik(s0, tg, 66 * ln0, 62 * ln0, bend), u = unit(sub(wr, el));
      limb([s0, el, wr], w0, w1, C.coat);
      const a = ang ?? Math.atan2(u[1], u[0]), h0 = add(wr, u, 4);
      return { h0, a, g: add(h0, [Math.cos(a), Math.sin(a)], 9), draw: () => hand(h0[0], h0[1], a, fist) };
    };
    let hB, hF, cupG = null, late = null;
    if (o.cup) {
      // both hands cradle the tea glass at her chest; sip lifts it to her lips
      const sp = o.sip || 0, gl = add(xf(55, -324), [0, 0]), g2 = mid(gl, xf(18, -392), sp);
      cupG = g2;
      // the near forearm points at the camera (short), so the elbow stays out and low and the sleeve clears the glass
      bare(() => {
        const b = arm(shB, add(g2, [-27, 18]), 1, 24, 20, -.1 + sp * .3);
        const fr = arm(shF, add(g2, [25, 18]), -1, 26, 22, Math.PI + .1 - sp * .2, false, .55);
        hB = b.g; hF = fr.g;
        late = () => { prop('cup', g2, sp * .25, tt); b.draw(); fr.draw(); };
        if (sp < .35) { late(); late = null; }                          // a sip brings glass and hands in front of the face
      });
    } else {
      const tB = o.armB !== undefined ? o.armB : (go ? null : [-28, -288]);
      const bTg = tB || add(xf(-44, -352), [-8 + (go ? 34 * swing : 0), 96 - (go ? 24 * Math.abs(swing) : 0)]);
      const bFront = o.bFront ?? (tB ? bTg[0] > -40 : false);
      const drawB = () => { const b = arm(shB, bTg, o.elbB ?? 1, 24, 20, o.handB ?? (tB ? null : Math.PI / 2 + .2 - swing * .4), o.fistB ?? (go > .5), o.lenB ?? (o.armB === undefined && !go ? .82 : 1)); b.draw(); hB = b.g; };
      if (!bFront) { XS = []; drawB(); }
      // front arm and the umbrella: open overhead, lowered to look at, or closed and carried
      const um = o.umb !== undefined ? o.umb : null;
      const bounce = go * (run ? 6 : 2) * Math.cos(4 * Math.PI * ph - .6);
      const fTg = o.armF || (um === 'up' ? add(xf(92, -446), [0, bounce]) : um === 'low' ? xf(66, -300) : um === 'bundle' ? xf(58, -232) : go ? add(xf(44, -356), [6 - 30 * swing, 98 - 20 * Math.abs(swing)]) : [52, -232]);
      bare(() => {
        const fr = arm(shF, fTg, o.elbF ?? (um === 'up' ? -1 : 1), 26, 22, o.handF ?? (um === 'up' ? -Math.PI / 2 + .15 : um ? -Math.PI / 2 + .3 : null), o.fistF ?? !!um, o.lenF);
        if (um === 'up' || um === 'low') {
          const ua = (o.umbA ?? (um === 'low' ? .9 : 0)) + lean + go * (run ? .16 + .06 * Math.sin(4 * Math.PI * ph - 1.2) : .03 * Math.sin(4 * Math.PI * ph - 1.2));
          XS = [{ a: ua, px: 94, py: -452, ox: fr.g[0] - 94, oy: fr.g[1] + 452 }];
          umbrella(tt);
          XS = [];
        } else if (um === 'bundle') {
          XS = [{ a: o.umbA || 0, px: 0, py: 8, ox: fr.g[0], oy: fr.g[1] - 8 }];
          umbBundle(tt);
          XS = [];
        }
        fr.draw(); hF = fr.g;
      });
      XS = [body];
      if (bFront) bare(drawB);
    }
    XS = [body, { a: (o.nod || 0) + headDrift(o), px: 0, py: -390 }];
    maiHead(speak('mai', fe));
    const head = P(0, -440);
    if (o.towel === 'head') {                         // the towel over her head, framing the face, ends on her shoulders
      sh([[-64, -372], [-62, -462], [-42, -514], [0, -530], [42, -516], [62, -462], [66, -372], [48, -366], [44, -428], [36, -472], [0, -490], [-36, -472], [-44, -428], [-48, -366]], C.towel, { curv: .5, sw: .9 });
      flat([[36, -472], [44, -428], [48, -366], [66, -372], [62, -462], [42, -510]], '#DCD2C0', 160, .5);
      ln([[-64, -388], [-56, -384], [-48, -380]], 1, C.towelLine); ln([[48, -380], [56, -384], [66, -388]], 1, C.towelLine);
    }
    if (late) bare(late);
    XS = [body];
    if (cupG) for (let i = 0; i < 2; i++) {            // thin steam threads rising past her chin
      const s2 = tt * 1.6 + i * 2.1, w = Math.sin(s2) * 5, c0 = bare(() => cupG);
      bare(() => ln([add(c0, [-5 + i * 12, -26]), add(c0, [-9 + i * 12 + w, -48]), add(c0, [-3 + i * 12 - w, -70]), add(c0, [-7 + i * 12 + w * .6, -90])], .45, '#E6DED2'));
    }
    // drips
    const d0 = lerp(-170, -206, sit);
    if (e.drip !== false && o.drip !== false) for (let i = 0; i < 3; i++) { const q = (tt * 1.2 + hash(i * 2.3)) % 1; ell(-40 + i * 40, d0 + q * 90, 2.5, 5, '#BFD4E0', { sw: .5 }); }
    XS = [];
    return { head, hands: [W(hB), W(hF)], feet: feet.map(W), knees: legs.map(W) };
  }
  // a splash at a boot strike: age in s since contact, at world (x, y), scale k
  function splash(x, y, age, k = 1, col = '#DCE4EA') {
    if (age < 0 || age > .45) return;
    const q = age / .45;
    for (let i = 0; i < 7; i++) {
      const a = -Math.PI * (.12 + .76 * i / 6), v = (60 + 50 * hash(i * 3.1)) * k, px = x + Math.cos(a) * v * q, py = y + Math.sin(a) * v * q + 260 * k * q * q;
      paint(ellPts(px, py, 3.2 * k * (1 - q * .5), 4.5 * k * (1 - q * .5), 8, 0), { wash: col, washOp: 220 * (1 - q), ink: null });
    }
    paint(ellPts(x, y, 36 * k * (.4 + q), 6 * k * (.4 + q), 16, 0), { wash: col, washOp: 120 * (1 - q), ink: null });
  }
  window.ton = ton; window.mai = mai; window.splash = splash;
  window.tonHead = (x, y, k, e, f = 1) => { X = x; Y = y; K = k; F = f; XS = []; tonHead(e); };
  window.maiHead = (x, y, k, e, f = 1) => { X = x; Y = y; K = k; F = f; XS = []; maiHead(e); };
})();
