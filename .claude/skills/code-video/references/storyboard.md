# Storyboard template (STORYBOARD.md)

Write this before any scene code. The beat table is the contract: every line of text gets a row with a concrete
action. Publish it as an HTML artifact (a table per act) so the user can review it on any device.

```markdown
# STORYBOARD: "<title>" (<what it is: MV for X / explainer for Y / 30 s ad>)

**Logline.** One or two sentences: who wants what, what grows or changes, how it ends. Example: "Wren, a paper-lantern
girl, lights her head with a match; one spark looks back and grows each section into the Mind. She plays with it,
fears it, frees it, loses it and at the end lifts her light to it anyway."

**Cast.** Each character: silhouette, the one design trait that reads at thumbnail size, how they act (the face rig,
the signature gesture). The other side (a creature, a product, an idea) also gets a face so it can act back.

**Props carry the story** (cause and effect between acts; each prop is set up early and pays off later):
- match lights her; the spark is born from it
- her catch-jar grows into the cage; she opens it, which frees the serpent
- ...

**World.** Setting per act, palette per section (darkening/brightening across the piece), the motif that recurs.

**Subtitles.** Karaoke subs (subs.js): font, where they sit, key words and their effects.

Timing: bar n = OFF + n * BAR s (BPM, OFF = first downbeat).

## Act 1: <name> · 0–15.64
| t | line | shot | acting |
|---|---|---|---|
| 0–3.17 | intro / "I see sparks of" | MS side, push in | Unlit, she shivers and rubs her hands; shakes the matchbox on the beats, strikes on the downbeat; the lantern blooms. |
| 3.17–6.0 | "AGI in your eyes" | MCU two-shot | One ember stops at her face and opens two tiny eyes on "eyes". She leans in, brow up, mouth 'o', singing. |
```

## Beat rules
- **The star performs.** The character the song is about (in an AI song, the AI) does the line: it shows off
  the ability the words name, on the beat. Others react. Check: who has most of the shots and pose keys?
- **One acted beat per line** (or per sentence of narration), 3–6 pose keys each: anticipation, action, reaction,
  settle. Name the verb: strikes, kneels, peeks, counts on fingers, hangs on the lever.
- **Show the line, don't illustrate it with text.** "drop in loss": the spark falls and she catches it in cupped hands.
- **Something answers.** The other character reacts to every action (copies, refuses, grows, boops back).
- **Literal, then twisted.** Take the words literally first, then turn it (counting to 1e30 on her fingers, gives up).
- **Cuts** on line starts or downbeats, a cut or camera beat every 1–2 lines (about one shot per 2–4 s). Wides for
  spectacle, MCU/CU for acting (character at least 0.35 of the frame height), low angle for triumph, high for small.
- **Instrumental stretches** get a physical arc too (turn, hug, plant feet, breathe in, push up, laugh).
- **Ending rhymes with the opening** (the first gesture returns, changed: she pokes the spark, it pokes back).
- **Transitions** at every seam: brush wipe, whiteout, match cut, light flash, push into an object.

## Checks before building
- Does every line have its own row with a verb?
- Is there a prop chain that links the acts?
- Does each shot have time to read (a gesture needs at least 0.4 s, a reaction 0.3 s, a reveal 0.8 s)?
- Is there any text other than the subs?
- Does the ending rhyme with the opening?
