// a13_home.js: Act 13 "One Spark" (153.83–156.65). The hill from Act 1 again. Wren sits, her lantern relit and calm.
// v2 acting, the mirror of Act 1: she pokes the spark, it pokes her back, she giggles, then lies back in the grass and
// the spark settles on her; both close their eyes.
//   A 153.83 MCU: poke, boop back, giggle.          in: paper whiteout fades
//   B 155.18 wide: she lies back; the spark lands on her chest and blinks shut.     out: fade to indigo
(() => {
  const tA = barT(84), tB = tA + 1.35, tEnd = 156.65;
  const MOON = [330, 190], U = 52;
  const WX = 820, ground = () => hillTop(820, 860, 1080, 980, 330);
  function spark(x, y, r, o = {}) {   // the Act 1 spark: a teal bead with a small face
    glow(x, y, r * 5, ST.tealGlow, .5);
    boilSeed('spk13' + (o.key || ''));
    paint(starPts(x, y, r * 1.9, .28, 4, .3 + (o.rot || 0)), { wash: ST.tealLt, washOp: 110, ink: null });
    paint(ellPts(x, y, r * (1 + (o.sq || 0)), r * .94 * (1 - (o.sq || 0)), 14), { wash: mixCol(ST.teal, ST.tealLt, .35), ink: ST.tealLt, sw: clamp(r / 30, .3, 1) });
    mindFace(x, y - r * .12, r * .62, { mood: o.mood || 'curious', look: o.look || [0, 0], tilt: o.tilt || 0, blink: o.blink || 0, key: 'spf13' + (o.key || '') });
  }
  function world(t) {
    nightSky(t, { stars: 30 });
    moon(...MOON, 64, t);
    hill(1620, 900, 760, 330, mixCol(ST.hill2, ST.night, .35), 1, 6, t);
    hill(860, 1080, 980, 330, ST.hill, 2, 10, t);
  }

  function shotA(t, lt, dur) {
    const wy = ground(), p = ease(seg(lt, 0, dur)), poke = .4, boop = .78;
    camBegin(lerp(WX + 70, WX + 60, p), wy - 125, lerp(2.5, 2.65, p));
    world(t);
    const S = [WX + 1.5 * U, wy - 1.8 * U + 4 * Math.sin(lt * 3)];
    const P = pose(lt, [
      [0, { view: 'side', sit: 1, eyes: 'dot', brow: 'up', mouth: 'o', look: [.8, .2], lean: 0, arms: [[.5, .2], [.6, .3]], hands: [null, 'point'] }],
      [.15, { reach: [null, [S[0] - .32 * U, S[1]]], lean: .15, _d: .25 }],
      [poke + .12, { reach: null, arms: [[.5, .2], [.9, .6]], lean: .05, _d: .2 }],
      [boop, { eyes: 'shut', mouth: 'grin', brow: 'up', tilt: -.12, _snap: true, _d: .1 }],
      [boop + .2, { eyes: 'happy', tilt: -.05, _d: .2 }],
    ]);
    const gig = lt > boop + .2 ? Math.abs(Math.sin((lt - boop) * 14)) : 0;
    const w = wren(WX, wy, U, { id: 'a13', glow: .95, ...P, sq: .05 * ring(lt, [boop], 10, 22) + .04 * gig });
    glow(...w.head, 220, ST.lampGlow, .45);
    // the spark: squashed by her poke, then pokes back at her lantern
    const ang = Math.atan2(w.head[1] - S[1], w.head[0] - S[0]), arm = seg(lt, boop - .15, boop) * (1 - seg(lt, boop + .3, boop + .45));
    if (arm > 0) sparkArm(...S, 12, ang, arm, 'b');
    spark(...S, 14, { sq: .25 * ring(lt, [poke], 11, 24), look: lt < boop ? [-.9, -.2] : [-.6, -.4], mood: lt > poke + .1 ? 'grin' : 'curious', tilt: .2 * seg(lt, poke, poke + .2) * (1 - seg(lt, boop, boop + .3)) });
    camEnd();
    if (lt < .6) flash(1 - ease(seg(lt, 0, .6)), ST.paper);
  }
  function sparkArm(x, y, r, ang, k, key) {
    const a = [x + Math.cos(ang) * r * .9, y + Math.sin(ang) * r * .9], b = [x + Math.cos(ang) * r * 2.5, y + Math.sin(ang) * r * 2.5];
    mthread(a, b, k, 1.1, 'arm13' + key);
    if (k > .9) paint(ellPts(b[0], b[1], r * .22, r * .22, 8), { wash: ST.tealLt, ink: null });
  }

  function shotB(t, lt) {
    const dur = tEnd - tB, wy = ground(), k = ease(seg(lt, 0, dur)), lie = ease(seg(lt, .05, .6));
    const up = ease(seg(lt, .3, dur));   // after she settles, drift up toward the moon
    camBegin(lerp(WX - 70, 600, up), lerp(wy - 95, 470, up), lerp(2.1, 1.6, up));
    world(t);
    const hx = WX - .4 * U, hy = wy - .3 * U;
    push(); translate(hx, hy); rotate(-1.3 * lie); translate(-hx, -hy);
    const w = wren(WX, wy, U, { id: 'a13', view: 'side', sit: 1, glow: .9 + .05 * Math.sin(lt * 3), eyes: lt > 1 ? 'shut' : 'happy', mouth: 'smile',
      look: [.4, -.6], arms: [[lerp(.6, .3, lie), lerp(.3, 1.1, lie)], [lerp(.9, .4, lie), lerp(.4, 1.2, lie)]], hands: ['open', 'open'], tilt: -.06 });
    pop();
    glow(...w.head, 220, ST.lampGlow, .45);
    // the spark drifts down onto her chest and blinks shut with her
    const land = ease(seg(lt, .3, .95)), cx = lerp(WX + 1.5 * U, WX - 1.45 * U, land), cy = lerp(wy - 1.8 * U, wy - 1.15 * U, land) - 30 * Math.sin(Math.PI * land);
    spark(cx, cy, 14, { look: [-.6, -.2], blink: seg(lt, 1, 1.2), mood: 'curious', tilt: .2 });
    camEnd();
    flash(ease(seg(lt, dur - .6, dur - .03)), ST.night);
  }

  shots([[tA, shotA], [tB, shotB]]);
})();
