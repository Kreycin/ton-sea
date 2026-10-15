---
name: code-video
description: Make a hand-painted 2D animated video entirely in code (p5.brush on ClaudeAnimationBase, headless-Chrome render to MP4), from storyboard to final cut, for any purpose (music video, explainer, story, ad, short), with acted characters, lip-sync and karaoke-style dynamic subtitles. Use for requests like "make a clip/MV/animation for this song or script", "ทำคลิป", "ทำ MV", "ทำแอนิเมชัน", "สตอรี่บอร์ด", "ซับไดนามิก", or to revise such a video.
---

# Code video

This is the method behind "Lantern", a music video for the song P Doom (2026-10), and the short "ton-sea" in this repo
(docs/METHOD.md tells how it was made, including its dialogue, SFX and music pipeline in scripts/). The user
approved its process and asked for it to be reusable for any clip. The look is hand-painted, with flat 2D, boiling ink
and watercolour. Every frame is a pure function of time.

The user's feedback that shaped it: "too little visual story; the acting does not follow the lyrics". So the core rule
is that **every line of text (lyric or narration) gets its own acted beat**. The character DOES something specific, and
something answers it.

## Setup

- Clone the base kit: `git clone https://github.com/JohnHeibel/ClaudeAnimationBase.git <project>`. Then run `npm i`. It
  needs Google Chrome, ffmpeg, and Python with librosa for the voice step.
- **Read `ANIMATION_GUIDE.md` in the kit before drawing.** It defines the engine:
  - paint, inkLine, glow, camBegin, letter, shots, brushWipe, hash, boilSeed
  - the render flags
  - the base rules: brush medium, no 3D, timing, transitions
- The kit ships Clawd. Use Clawd only if the user wants it. Otherwise design an original cast (see `references/acting.md`).
- Copy these files from this skill's `assets/`:
  - `acting.js` goes to `src/` (pose tracks)
  - `subs.js` goes to `src/` (subtitles)
  - `voice_env.py` goes to `scripts/`
  - `lyrics.example.js` goes to `src/lyrics.js`; fill it in
- Load order in studio.html: config, core, timeline, then your style and character files, then lyrics.js, voice.js,
  acting.js, subs.js, then a subs override file, then the scene files in order.
- In `timeline.js`, inside `drawWorld`, add this line after the shot call:
  `if (typeof subs === 'function') subs(t);`
- `src/config.js`: `PROJECT = { duration, bpm, offset: first downbeat s, audio: 'assets/x.mp3' }`.

## Workflow

Each step ends with a check you look at yourself (Read the image). Keep `STATUS.md` updated after each step.

1. **Analyse the audio.**
   - Find the length, the BPM, and the first downbeat (librosa beat_track).
   - Find the sections: intro, verse, chorus, bridge, outro.
   - Get the line timings into `src/lyrics.js`. For speech, use a transcript with timestamps.
   - Then run `python3 scripts/voice_env.py --audio ...` (`--speech` for narration). It writes `src/voice.js`, which
     holds VOX (the mouth envelope) and LYW (word onsets).
   - Define bar timing: `barT(n) = OFF + n * BAR`, where `BEAT = 60 / BPM` and `BAR = 4 * BEAT`. **Compute BEAT; never
     assume it.**
2. **Storyboard.** Write `STORYBOARD.md` with `references/storyboard.md`.
   - **First decide who the star is: the character the song or script is ABOUT.** In an AI-themed song (P(doom)),
     that is the AI (a creature, machine or mascot). It performs each line on the beat and gets the camera, the size,
     the lip-sync and most of the pose keys. A human, if present, is a small spectator who watches and reacts.
     Do not default to a human lead.
   - Include a logline, the cast, a prop causality chain, and a world palette per section.
   - Then add a beat table per act: time, line, shot, acting.
   - Publish it as an HTML artifact so the user can review it.
   - For a long piece, wait for the user's approval before writing any scenes.
3. **Rig and model sheet.**
   - Build each character with the controls in `references/acting.md`: brows, eyes, mouth and sing, hands, reach IK,
     turn, body poses.
   - Render a model sheet (LOOPS) and inspect it before writing any scenes.
4. **Scenes, one act at a time.**
   - Each act is a file `src/scenes/aNN_name.js` that holds an IIFE and ends with `shots([[t0, fn], ...])`.
   - Cut on line starts or downbeats. Act each line with `pose(lt, keys)`.
   - After each act, run the review loop below and fix the act before starting the next one.
   - For a long piece, send a 720p checkpoint with audio after the first 2–3 acts, so the user can confirm the
     level of acting.
5. **Subtitles.** Use `subs.js` in karaoke mode by default:
   - The whole line appears at once.
   - The word being sung or spoken changes colour, lifts and runs its keyword effect.
   - Add per-word effects for the key words (`SUB_FX`), and move lines off faces with `SUB_POS`.
   - See `references/subs.md`.
6. **Final render and delivery.** See the commands below.
   - Run ffprobe and check the duration, 1920x1080 and an audio stream.
   - Build a whole-film cut sheet and look at it.
   - Send the video with SendUserFile. Files over 30 MB do not reach the phone, so also send a 540p copy under 30 MB.

## Review loop (every act, every fix)

```bash
node render.mjs --sheet=t1,t2,...,t12 --cols=4 --w=480 --out=out/check/aNN.jpg      # one frame per beat
node render.mjs --sheet=t1,t2 --crop=x,y,w,h --w=600 --out=out/check/aNN_face.jpg  # faces and hands, full res
node render.mjs --strip=a:b --cols=6 --w=320 --out=out/check/aNN_move.jpg           # every frame of a gesture
node render.mjs --clip --range=a:b --audio=assets/x.mp3 --out=out/check/aNN.mp4     # sync of hits and lip-sync
```

For each act, check:
- Does every line read as a distinct action?
- Is the character at least 0.35 of the frame height in acting shots?
- Is the face readable?
- Do hands touch what they hold?
- Is anything cropped by the camera?
- Do glows cover a face?
- Do the subs sit on a face? Move them with SUB_POS.

Fix, re-render only the changed times, and look again.

## Final render

```bash
rm -rf out/frames                      # frames are resumable: stale frames from an older cut would be reused
node render.mjs --frames --workers=2   # run in the background; about 190-580 ms/frame effective on an 8 GB Mac
node render.mjs --encode --out=out/video_noaudio.mp4
ffmpeg -y -i out/video_noaudio.mp4 -i assets/x.mp3 -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart out/video.mp4
ffmpeg -y -i out/video.mp4 -vf "fps=1/4,scale=320:-1,tile=8x5" -frames:v 1 out/check/cuts.jpg   # whole-film cut sheet
ffmpeg -y -i out/video.mp4 -vf scale=960:540 -c:v libx264 -crf 27 -preset veryfast -c:a aac -b:a 128k -movflags +faststart out/preview_phone.mp4
```

## Gotchas (learned the hard way)

- `hash()` takes numbers only. A string key returns NaN. Use `boilSeed('key')` for strings.
- The last shot registered gets `dur` up to the end of the film. In an act's last shot, compute
  `const dur = tEnd - tStart` locally.
- Raw p5 drawing (rect, image) inside a brush frame needs `flushBrush()` first, or the layers come out in the wrong order.
- Reach IK maxes out at about 1.22 body units and cannot reach above the head; use arm angles for poses above the head.
  Walk sway persists unless walk is set to 0.
- A glow placed on the face washes it out. Scale beam width and glow alpha with length, and keep a light source's
  bloom off the eyes.
- Subs: the sum of the layout widths must fit `SUB.maxW`, or the line wraps to two rows. A `boom` word grows, so leave
  room around it.
- There is no `timeout` command on macOS. Wait on long renders with a background task, not a sleep loop.
- On an 8 GB Mac render with `--workers=2`; more workers run out of memory.
- Token discipline: render one sheet per act (about 12 frames), inspect it once, fix, and re-render only the changed
  frames. Never print the frames log; tail it.

## Rules

- **Original work.** Do not copy existing characters or scene files from other projects unless the user asks.
- **On-screen text.** The only text on screen is the subtitles, plus at most one painted word where the story needs it.
- **Audio rights.** Before any public posting, flag where the audio and its rights come from.
- **Language and visual judgement.**
  - Reply in the user's language.
  - The main model makes the visual judgements and inspects every check sheet itself.
  - Workers may write spec'd code, but they do not judge the frames.
