# Dynamic subtitles (assets/subs.js)

## Modes
- **karaoke** (default, the user's preferred style): the whole line rises in about 0.12 s before its first word.
  - Coming words are dim (`SUB.ahead` .45).
  - The word being said changes: it turns `SUB.hi` (or its keyword colour), lifts 7 px, scales to 1.1 with a small
    pop, and runs its effect.
  - Said words stay bright `SUB.base`. Keywords keep their colour.
  - The line bobs on each beat (`pulse`). It drifts up and fades `SUB.hold` s after the line's end, or just before the
    next line.
- **pop**: each word pops in on its onset (the Lantern v2 look). Use it for hype or rap, where reading ahead does not
  matter.

## Timing sources
- **Songs:** LY from the song's subtitle file, or timed by ear. Then run `voice_env.py --audio` for the LYW word
  onsets.
  - Syllable-warped vocal energy snaps to onsets within ±0.12 s.
  - Fix acronyms with `--syl "AGI=3"`.
- **Speech or voice-over:** `whisper --word_timestamps True` gives both lines and word starts. Write LYW directly from
  it, or run `voice_env.py --speech`.
- **No LYW:** subs.js splits each line evenly by syllables, which is fine for slow narration.
- **Thai and other unspaced scripts:** separate words with `|` in the LY text (no gap drawn). A space draws a gap.
  - Set a Thai-capable font: load Google Fonts Kanit or Mitr in studio.html, then
    `Object.assign(SUB, { font: s => \`${s}px "Kanit", sans-serif\` })`.
  - The syllable fallback counts about 3 letters per syllable.

## Keyword effects (`SUB_FX`)

`Object.assign(SUB_FX, { word: ['effect', colour] })`. The key is lower case, letters and digits only. An effect starts
at the word's onset.

| Effect | Motion | Use for |
|---|---|---|
| glow | warm bloom behind | light, eyes, hope, names |
| shake | jitter that settles | fear, nervous, alive, repeat |
| boom | big scale burst + shake + bloom | explosions, FOOM, fuse |
| rise | floats up | up, moon, doom rising, growth |
| drop | falls and bounces | drop, loss, fall, fence |
| tilt | leans over | turn, askew, wrong |
| wobble | rocks | drunk, trippy, weird |
| creep | fades in and sways | lies, creeping, monsters |
| red | red pulse + red bloom | danger, kill, red eyes |
| rush | slides in fast | speed, accelerate |
| scatter | jitters apart | rearranging, breaking |
| rain | drops in from above | rain, clips, flops |
| slide / back | sways right / left | forward / backward |
| bow | dips and tilts | servant, please, sorry |
| squash | spring squash | dense, pressure |
| box | slight fixed tilt | room, box, trapped |
| soft | slightly transparent | gentle words |
| pop | quick scale pop | surprise |
| big | drawn 1.35x | the punch word |

## Placement and checks
- **Position.** The default is centred, `SUB.y = H − 112`, `maxW` 1480, with two rows at most. Set
  `SUB_POS.push([t0, t1, { y: 160 }])` when a face or the action sits in the lower third.
- **Check sheet.** Crop to the lower third:
  `node render.mjs --sheet=... --crop=160,820,1600,260 --w=800 --cols=2 --out=out/check/subs.jpg`.
  At one moment per line, check that:
  - the current word stands out
  - the line is readable over the background
  - no word overlaps another (boom words need room)
  - the subs sit off faces
- **Contrast.** The ink stroke plus drop shadow comes from `letter()`. On light frames (whiteouts), raise the stroke or
  move the line.
