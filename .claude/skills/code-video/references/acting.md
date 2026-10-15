# Characters that act

The worked example is in `assets/example/`:
- `wren.js` is the character rig.
- `mind.js` has the opposite character, which has a face.
- `props.js` has the props.
- `style.js` has the palette and world.
- `a13_home.js` is a complete two-shot act.
- `STORYBOARD_lantern.md` is a full beat sheet.

Use them as patterns, not as a cast. Design a new character for each video unless the user wants Wren back.

## Rig checklist: one function, every control optional

`hero(x, y, u, o)`: (x, y) is the ground point and u is the body unit. Wides use about u = 52; acting shots zoom the
camera in, not u. Return the world points of the head and both hands, so props and the other character can attach.

- **Face.** These carry most of the acting.
  - brow: 'up' | 'worry' | 'angry' | 'sad'. Two short ink strokes that follow `look`.
  - eyes: 'dot' | 'shut' | 'happy' | 'wide' | 'sad' | 'swirl' | 'squint' | 'half', plus `look [dx, dy]`.
  - Auto blink on a per-id hash schedule, every 2.5–4 s for 0.12 s.
  - mouth: 'smile' | 'o' | 'flat' | 'open' (plus mouthOpen) | 'frown' | 'wobble' | 'grin'.
  - `sing: true` opens the mouth with `VOX(t)`.
- **Hands.** 'open' | 'fist' | 'point' | 'cup' | 'hold'. `reach: [[x, y] | null, ...]` is two-bone IK to world points.
  - It overrides arm angles.
  - It cannot reach above the head; use arm angles there.
  - Its range is limited to about 1.2u.
- **Head turn.** `turn` −1..1 slides the face features toward a profile, so turns are smooth. The body `view` stays
  discrete: front / side / back. `flip` mirrors it.
- **Body.**
  - sit, kneel (crouch then knees down), lean, tilt, sq (squash and stretch), dy (lift), shake (fear jitter), shrug.
  - walk and run (stride, bob and lean).
  - wind blows the scarf or hair; headUp raises a held item in a climax.
- **Light and state.** A `glow` 0..1 makes the character's inner state visible. Hope is an asset; use it.

Whichever character is the star (often the creature, AI, product or mascot, not the human) gets the full rig and
most of the acting. The supporting character needs a small face too: eyes, a mouth that is a thread or line,
and moods such as curious / grin / shy / hungry. It must react to every action.

## Pose tracks (acting.js)

```js
const P = pose(lt, [                       // lt = time in the shot; each key changes only the fields it names
  [0,    { view: 'side', sit: 1, eyes: 'dot', brow: 'up', mouth: 'o', arms: [[.5, .2], [.6, .3]], hands: [null, 'point'] }],
  [.15,  { reach: [null, [sx, sy]], lean: .15, _d: .25 }],          // reaches out over .25 s
  [.52,  { reach: null, arms: [[.5, .2], [.9, .6]], _d: .2 }],      // pulls back
  [.78,  { eyes: 'shut', mouth: 'grin', tilt: -.12, _snap: true, _d: .1 }],   // booped: a snap with overshoot
  [.98,  { eyes: 'happy', tilt: -.05 }],
]);
hero(x, y, U, { id: 'a13', ...P, sq: .05 * ring(lt, [.78], 10, 22) });       // add impulses on top of the pose
```

- Numbers and arrays ease. Strings, booleans and null switch halfway through `_d`.
- A key at time kt applies only from lt ≥ kt.
- `_snap` adds a backOut overshoot; `_e` sets a custom easing.
- `antic(lt, t0, d)` gives anticipation before an action and a ring-out after it. Multiply it into sq, lean or an arm.
- `nod(lt, t0, n, amp)` gives nods and head shakes.
- `ring(t, [hits], k, w)` sums decaying springs, for impacts.
- Giggles, trembles and shivers: `Math.abs(Math.sin(lt * 14))` added into sq, or `sin(T * 50)` added into an arm angle.

## Shot structure

```js
(() => {
  const tA = barT(84), tB = tA + 1.35, tEnd = 156.65, U = 52;
  function world(t) { /* sky, hills: the same in every shot of the act */ }
  function shotA(t, lt, dur) {
    camBegin(cx, cy, zoom, rot);   // the camera always drifts or pushes a little: lerp over ease(seg(lt, 0, dur))
    world(t);
    /* characters, props, effects */
    camEnd();
    if (lt < .6) flash(1 - ease(seg(lt, 0, .6)), ST.paper);   // transition in, screen space
  }
  function shotB(t, lt) {
    const dur = tEnd - tB;        // the act's last shot must compute its own dur
    /* ... */
    flash(ease(seg(lt, dur - .6, dur - .03)), ST.night);       // transition out
  }
  shots([[tA, shotA], [tB, shotB]]);
})();
```

## Camera grammar

- Use MCU/CU (zoom about 2.3–3.7 around the face) for acting and lip-sync. Use wides for spectacle and geography. Use a
  low angle (camera below the character, rot about −.03) for triumph.
- To lie down or fall, wrap the character in `push(); translate(pivot); rotate(a); translate(-pivot); hero(...); pop();`.
- Overlay the faces and the light in screen space after `camEnd()`.
- Before a render, compute what the camera sees: the view spans W/zoom by H/zoom around (cx, cy). Check that the
  head, the hands and the prop are inside it.

## Lip-sync

- Use `sing: true` in close shots during a sung line. VOX is 0 between lines, so the mouth falls back to `mouth`.
- Also set eyes and brows; singing with a dead face reads as a puppet.
- For speech, run voice_env.py with `--speech`. Check sync in a short `--clip --range --audio` render.
