# ต้นกับทะเล — STATUS
Goal: a calm ~200 s cartoon short with no narrator: English dialogue (TTS), ambience/SFX and original music, all made in
code, Ghibli-inspired, built with ClaudeAnimationBase (copied from P Doom).

## Done
- Cast approved: `src/cast.js` (rig v1, approved 2026-10-14: IK arms/legs, lean, nod, shrug, breath, blink, props, Mai
  run/walk + splashes, sit↔stand). Model sheet t 6.5 → `out/stills/t6_50.png`. `src/moves.js` (`TONM`, `MAIM`) = beats.
- Sets: `ghibli.js` (EXT shop front, rain; `GH`), `interior.js` (`INT.set`, 6 lights), `seascape.js` (`EXT.wide`, 4 looks),
  `stage.js` (STAGE: shared int/ext/gh/pier, cast placement, pour glass, rag, `pourCU`).
- Storyboard v1 approved: `STORYBOARD.md` (25 shots). Rough animatic v1: `scripts/animatic.py`, `out/animatic.mp4`.
- All 5 acts acted (`a01_shop` … `a05_coda`), smooth pass (0.55 s dissolves, softBack snaps, idle sway, eased camera).
  Frame-diff: no pops outside cuts. Smooth 117.75 s cut with narration sent (`out/ton-sea_smooth_720p.mp4`).
- Air time (Nick: the narration rushed; stretch to ~200 s): `src/air.js` AIR plan opens 44 gaps (+82.2 s), every shot time
  goes through `AIRV`/`AIRG`. 199.95 s. Inserts in the gaps: 03d kettle CU, 08p/24p tea-pour ECU (`STAGE.pourCU`),
  10b boots splashing in the rain. `scripts/air.mjs` (cut narration to the plan) is kept only as the timing reference.
- Sound v3 (2026-10-15, Nick: drop the narration, SFX for every event, the characters talk in English, add music):
  - Dialogue: `DIALOGUE.md` v2, 22 lines. `scripts/tts_dialog.py` (Vertex Gemini 3.8 Flash TTS, gcloud token) →
    `out/voice/raw/dNN_who.wav`. Ton = Umbriel, Mai = Sulafat (Nick picked from `out/voice/audition/`).
  - `scripts/dialog.mjs`: places lines (AT table) → `out/audio/dialogue.wav` + `src/dialog.js` (DIALOG envelopes,
    `SPEAK(who, t)`). Lip-sync: `NOW_T` (timeline.js), `speak()` in cast.js opens mouth 'o'/'pant'. Old flaps removed.
  - `scripts/shotlist.mjs` → `out/shots.txt` (44 shots, start/len). `scripts/sfx.mjs`: everything synthesized (sea +
    laps, rain, wind, thunder, gulls, shutters, kettle/flame/simmer/song, pours with rising pitch, door chime, boots,
    steps, drips, clock) → stems `out/audio/sfx_{sea,rain,wind,fx}.wav`. Per-shot ambience table `AMB`.
  - `scripts/score.mjs`: original waltz in F, 3/4 at 72 BPM (piano, strings, cello, pizz, harp, celesta, flute); melody
    in the dialogue gaps; F/A→Bb under the kettle's song. `scripts/render_music.swift` (AVAudioUnitSampler + macOS GS
    bank, offline) → `out/music/music.wav`. Needs `SDKROOT=…/MacOSX26.5.sdk`.
  - `scripts/mix.mjs`: stems at set LUFS, music ducks under voices, two-pass loudnorm -15 LUFS / -1.5 dBTP →
    `out/audio/mix.wav` (`PROJECT.audio`). Check: every line ≥ 8.6 dB over the bed (speech band).
  - Spectrogram checks of SFX and music timing passed. Claude cannot listen: Nick's ears decide levels and sounds.

- GitHub: `Kreycin/ton-sea` (private, 2026-10-15). README.md + docs/METHOD.md explain the method; out/ is ignored
  except the TTS takes, lines.json and shots.txt; narration wavs never go in. Public only when Nick decides.

## Decisions
- Timeline: `src/air.js` (4 s pre-roll + AIR gaps), 199.95 s; no narration (Nick 2026-10-15).
- Sound order to rebuild: `node scripts/dialog.mjs` → `shotlist.mjs > out/shots.txt` → `sfx.mjs` → `score.mjs` +
  swift render → `mix.mjs`. Re-run shotlist/sfx whenever shot times change.
- Visual rules (copy from `ghibli.js`): gouache washes, no outlines on backgrounds; characters thin line `#3A2A2C` + one
  cel shade; cold world, warm light only from the shop; door ≈ 1.12 × Ton; no lettering on screen.
- Depth stack, back to front: sky strata, sea + haze veil, shop/railing, deck, cast, rain, foreground frame.
- Colour arc: silver morning → grey → rain → gold after rain → calm dusk.
- p5.brush gotchas: `gw` makes lumpy blobs on large rects (use `gp`); a 2-point `inkLine` needs a midpoint; with `F=-1`,
  local +x points to screen-left.
- TTS uses Gemini prebuilt voice names only; never put a cloned voice ID in this repo.

## Key files
- `src/cast.js` (rig; header lists every control), `src/air.js`, `src/dialog.js` (generated), `STORYBOARD.md`, `DIALOGUE.md`.
- `src/scenes/styles.js`: rejected style tests, reference only. `out/cast_v1_backup.js`: pre-rig cast.

## Next
1. Full 199.95 s render with the mix (`node render.mjs --frames --workers=2`, then `--encode` + mux `out/audio/mix.wav`),
   ffprobe, cut sheet, frame-diff; send 720p + 540p.
2. Nick listens: voices, SFX levels, music; fix his notes (gains in `mix.mjs` LEVEL, events in `sfx.mjs`).
3. English subtitles (`subs.js`), then the final 1080p.

## Open questions
- Audio rights before any public posting: TTS voices are Google prebuilt (Vertex terms); music uses the macOS GS sound
  bank (Apple licence); SFX are synthesized in code.
