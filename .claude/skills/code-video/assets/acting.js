// acting.js: pose tracks, so a lyric line can be acted beat by beat instead of held in one pose.
//
// pose(lt, keys) → an options object to spread into wren() (or anything else).
//   keys = [[time, {field: value, ...}], ...] in time order. Every field is tracked on its own: a key only changes the
//   fields it names, the rest hold. A change starts AT the key time and takes _d seconds (default .25) to arrive, so a
//   key reads "at 2.1 s she throws her arms up". Numbers and (nested) arrays ease; strings, booleans and null switch at
//   the key time. Per key: _d = transition length, _snap = true for a backOut overshoot, _e = a custom easing.
//   Example: wren(x, y, u, { id: 'a1', ...pose(lt, [[0, { arms: [[.3, .2], [.3, .2]], eyes: 'dot' }],
//                                                   [1.1, { arms: [[2.6, -.3], [2.6, -.3]], eyes: 'wide', _snap: true }]]) })
function poseMix(a, b, k) {
  if (typeof a === 'number' && typeof b === 'number') return a + (b - a) * k;
  if (Array.isArray(a) && Array.isArray(b) && a.length === b.length) return a.map((v, i) => poseMix(v, b[i], k));
  return k < .5 ? a : b;   // discrete (or shape mismatch / null): switch halfway, which for _d = 0 means at the key
}
function pose(lt, keys) {
  const out = {}, prev = {}, since = {};
  for (const [kt, f] of keys) {
    if (kt > lt) break;
    const d = f._d ?? .25, e = f._e || (f._snap ? backOut : ease);
    for (const name in f) {
      if (name[0] === '_') continue;
      const v = f[name], old = name in out ? out[name] : v;
      const discrete = !(typeof v === 'number' || Array.isArray(v));
      if (discrete) { out[name] = v; continue; }
      const k = d <= 0 ? 1 : e(clamp((lt - kt) / d));
      out[name] = poseMix(old, v, k);
      prev[name] = old; since[name] = kt;
    }
  }
  return out;
}
// Anticipation and follow-through around an action at t0: winds up to -1 over d seconds before t0, then fires and
// rings out past +1 back to 0. Multiply into squash, lean or an arm angle: sq: .08 * -antic(lt, 2.1).
function antic(lt, t0, d = .2) {
  if (lt < t0 - d) return 0;
  if (lt < t0) return -ease((lt - (t0 - d)) / d);
  const a = lt - t0; return Math.exp(-a * 7) * Math.cos(a * 13);
}
// Small helper for "nod / shake head" gestures: n swings of amp (rad) starting at t0, each `per` seconds long.
const nod = (lt, t0, n = 2, amp = .12, per = .28) => lt < t0 || lt > t0 + n * per ? 0 : amp * Math.sin((lt - t0) / per * Math.PI) * Math.exp(-(lt - t0) * 1.5);
