// titles.js: the lettering laid over the finished frame (composite() calls drawOverlay after the dissolve, before the paper
// grain, so the grain sits on the letters too): the opening title and credits over shot 01, and the dialogue subtitles.
//
// Subtitles are hand-lettered and stand beside whoever speaks (Ton cream, Mai the yellow of her raincoat). cast.js leaves
// each speaker's head on screen in HEADS; a speaker off screen gets a line low in the frame, in italics. The words come in
// with the voice (word onsets estimated from the loudness envelope in dialog.js) and leave the way the weather of the scene
// moves: washed down in the rain, lifted like tea steam indoors, carried off by the sea breeze after the rain.

const SUB_TEXT = [
  'Morning.', 'Oh no... look at you.', "Come in, quick. You're soaked.", "Thank you. Sorry, I'm dripping all over your floor.",
  "It's only rain.", 'Here. Something warm... a little sweet.', 'Mm. It smells wonderful.', "I'm Mai, by the way.", 'Ton.',
  "Oh... that's good.", 'Is it always this quiet out here?', 'Mostly. Just the sea... and the kettle.', 'I like it.',
  'Oh, look. It stopped.', 'It usually does, out here. By evening.', 'I should go, before it changes its mind.',
  "I don't think it's going to make it.", "Would you keep it for me? So you'll remember the rain.", '...I will.',
  'Thank you for the tea, Ton!', 'Hi. Is the kettle on?', 'Always.',
];
// how each line leaves (index = line number - 1): the rain at the shop front, the breeze outside after it, steam indoors
const SUB_EXIT = ['breeze', 'rain', 'rain', 'rain', 'steam', 'steam', 'steam', 'steam', 'steam', 'steam', 'steam', 'steam', 'steam',
  'breeze', 'breeze', 'steam', 'steam', 'breeze', 'breeze', 'breeze', 'steam', 'steam'];
const SUB_AT = {};            // per-line override, index → { x, y, align } in screen px, for shots where the automatic place fails
const SUB = { size: 50, maxW: 640, font: '"Patrick Hand", "Comic Sans MS", cursive', ton: '#FFF8EC', mai: '#FFD25E', edge: 'rgba(40,28,32,.82)' };
let HEADS = {};               // { ton: { x, y, s } }: the speaker's head on screen this frame (cast.js), s = screen scale

const SUB_LINES = (() => {
  if (typeof DIALOG === 'undefined') return [];
  return DIALOG.map(([t0, who, env], k) => {
    const words = SUB_TEXT[k].split(' '), chars = SUB_TEXT[k].length, voiced = [];
    [...env].forEach((v, i) => { if (+v >= 2) voiced.push(i); });           // env: one digit 0-9 per 1/24 s
    let c = 0;
    const on = words.map(w => { const f = c / chars; c += w.length + 1; return t0 + (voiced[Math.floor(f * voiced.length)] ?? 0) / 24; });
    return { k, who, t0, end: t0 + env.length / 24, words, on, exit: SUB_EXIT[k] };
  });
})();

let ovC = null;
function overlayCanvas() { if (!ovC) { ovC = document.createElement('canvas'); ovC.width = W; ovC.height = H; } return ovC; }

// one line of text, revealed left to right by a soft brush-edged mask (p 0..1), with alpha, blur and a lift
function sweepText(c, txt, x, y, font, col, p, o = {}) {
  if (p <= 0 || (o.alpha ?? 1) <= 0) return;
  const g = overlayCanvas().getContext('2d');
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
  g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle';
  if (o.spacing) g.letterSpacing = o.spacing + 'px';
  const w = g.measureText(txt).width, x0 = x - w / 2 - 40, x1 = x + w / 2 + 40, edge = 180;
  g.shadowColor = o.halo || 'rgba(255,250,240,.75)'; g.shadowBlur = 22;
  g.fillStyle = col; g.fillText(txt, x, y);
  g.shadowBlur = 0; g.letterSpacing = '0px';
  if (p < 1) {
    const e = lerp(x0, x1 + edge, p), gr = g.createLinearGradient(e - edge, 0, e, 0);
    gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.globalCompositeOperation = 'destination-in'; g.fillStyle = gr; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'source-over';
  }
  c.save(); c.globalAlpha = o.alpha ?? 1; if (o.blur) c.filter = `blur(${o.blur}px)`;
  c.drawImage(ovC, 0, o.lift || 0); c.restore();
}

// a hand-drawn wave line that draws itself from the centre out (the sea between the two titles)
function waveLine(c, x, y, w, p, col, alpha) {
  if (p <= 0 || alpha <= 0) return;
  c.save(); c.globalAlpha = alpha; c.strokeStyle = col; c.lineWidth = 2.2; c.lineCap = 'round'; c.beginPath();
  const half = w / 2 * easeOut(p);
  for (let i = 0; i <= 60; i++) { const u = lerp(-half, half, i / 60); c[i ? 'lineTo' : 'moveTo'](x + u, y + Math.sin(u / 26) * 3.2); }
  c.stroke(); c.restore();
}

// ---------- the opening: title, then credits, in the dawn sky over the wide pier (shot 01, 0 - 9.56 s; horizon y ≈ 340) ----------
function drawTitles(c, t) {
  if (t > 9.6) return;
  const out = seg(t, 4.5, 5.3), ink = '#2F3B43', red = '#A9543F';
  const mist = { alpha: 1 - out, blur: out * 9, lift: -out * 16 };
  sweepText(c, 'ต้นกับทะเล', 960, 150, '700 104px "Charm", serif', ink, ease(seg(t, .9, 2.4)), { ...mist, lift: mist.lift + 10 * (1 - ease(seg(t, .9, 2.4))) });
  waveLine(c, 960, 214, 300, seg(t, 2.0, 3.0), red, .85 * (1 - out));
  sweepText(c, 'Ton and the Sea', 960, 268, 'italic 500 66px "Cormorant Garamond", serif', red, ease(seg(t, 2.3, 3.6)), { ...mist, spacing: 2 });
  const CRED = [['made by', 'Claude Opus 5.5'], ['voices', 'Gemini 3.8 Flash TTS'], ['music & sound', 'written in code']];
  const gone = seg(t, 8.5, 9.3);
  CRED.forEach(([a, b], i) => {
    const t0 = 5.3 + i * .45, k = ease(seg(t, t0, t0 + .8));
    if (k <= 0) return;
    const y = 120 + i * 60, o = { alpha: k * (1 - gone), blur: (1 - k) * 6 + gone * 8, lift: (1 - k) * 10 - gone * 14, halo: 'rgba(255,250,240,.7)' };
    sweepText(c, `${a}  ·  ${b}`, 960, y, `italic 500 ${i ? 42 : 50}px "Cormorant Garamond", serif`, i ? ink : red, 1, o);
  });
}

// ---------- subtitles ----------
function layoutWords(c, words) {
  const sp = c.measureText(' ').width, rows = [[]];
  let w = 0;
  for (const wd of words) {
    const ww = c.measureText(wd).width;
    if (rows[rows.length - 1].length && w + sp + ww > SUB.maxW) { rows.push([]); w = 0; }
    w += (rows[rows.length - 1].length ? sp : 0) + ww; rows[rows.length - 1].push(wd);
  }
  return rows.map(r => ({ words: r, w: r.reduce((s, wd) => s + c.measureText(wd).width, 0) + sp * (r.length - 1) }));
}

function drawSub(c, L, t, next) {
  const hold = Math.min(L.end + .8, next ? next - .15 : Infinity), outD = .7;
  if (t < L.t0 - .05 || t > hold + outD) return;
  const off = !HEADS[L.who], font = `${off ? 'italic ' : ''}${SUB.size}px ${SUB.font}`;
  c.save(); c.font = font; c.textBaseline = 'middle'; c.lineJoin = 'round';
  const rows = layoutWords(c, L.words), bw = Math.max(...rows.map(r => r.w)), lh = SUB.size * 1.12, bh = rows.length * lh;
  // where: beside the head on its outer side (away from the frame centre) if it fits, else over the head, else the
  // inner side; a speaker off screen gets the line low and centred
  let x, y, align = 'center';
  const at = SUB_AT[L.k], hd = HEADS[L.who];
  if (at) ({ x, y, align = 'center' } = at);
  else if (!hd) { x = W / 2; y = H - 120 - bh / 2; }
  else {
    const R = 64 * hd.s, gap = 1.25 * R + 24, outer = hd.x < W / 2 ? -1 : 1;
    const fits = side => side < 0 ? hd.x - gap - bw > 60 : hd.x + gap + bw < W - 60;
    const above = hd.y - R * 1.5 - 14 - bh / 2;                                 // over the head, if the frame has room
    const side = fits(outer) ? outer : above - bh / 2 > 70 ? 0 : fits(-outer) ? -outer : 0;
    if (side) { x = hd.x + side * gap; align = side < 0 ? 'right' : 'left'; y = clamp(hd.y - R * .15, 90 + bh / 2, H - 90 - bh / 2); }
    else { x = clamp(hd.x, 60 + bw / 2, W - 60 - bw / 2); y = above - bh / 2 > 70 ? above : clamp(hd.y + R * 2.3, 90, H - 90 - bh / 2); }
  }
  const col = SUB[L.who], sp = c.measureText(' ').width, ex = seg(t, hold, hold + outD);
  let n = 0;
  rows.forEach((r, ri) => {
    let wx = align === 'left' ? x : align === 'right' ? x - r.w : x - r.w / 2;
    const wy = y - bh / 2 + lh * (ri + .5);
    for (const wd of r.words) {
      const i = n++, ww = c.measureText(wd).width, h1 = hash(L.k * 31 + i * 7.3), h2 = hash(L.k * 17 + i * 3.1);
      const a = ease(seg(t, L.on[i] - .04, L.on[i] + .2));                       // in with the voice
      const e = ease(clamp(ex * 1.6 - i * .6 / Math.max(1, L.words.length)));     // out, word by word
      if (a <= 0 || e >= 1) { wx += ww + sp; continue; }
      let dx = 0, dy = (1 - a) * 8 + Math.sin(t * 1.3 + i) * 1.4, blur = (1 - a) * 5, rot = (h1 - .5) * .05;
      if (L.exit === 'rain') { dy += e * 26; rot += e * .04; }                          // washed down
      else if (L.exit === 'steam') { dy -= e * 22; blur += e * 7; }                     // lifted like steam
      else { dx += e * 34; dy -= e * 6; blur += e * 3; }                                 // carried by the breeze
      c.save(); c.globalAlpha = a * (1 - e); if (blur > .3) c.filter = `blur(${blur.toFixed(1)}px)`;
      c.translate(wx + ww / 2 + dx, wy + dy + (h2 - .5) * 4); c.rotate(rot); c.textAlign = 'center';
      c.shadowColor = 'rgba(20,14,18,.45)'; c.shadowBlur = 14;
      c.strokeStyle = SUB.edge; c.lineWidth = 7; c.strokeText(wd, 0, 0); c.shadowBlur = 0;
      c.fillStyle = col; c.fillText(wd, 0, 0);
      c.restore();
      wx += ww + sp;
    }
  });
  c.restore();
}

function drawOverlay(c, t) {
  if (window.LOOP) return;
  drawTitles(c, t);
  SUB_LINES.forEach((L, i) => drawSub(c, L, t, SUB_LINES[i + 1]?.t0));          // a line clears when the next one starts
}
