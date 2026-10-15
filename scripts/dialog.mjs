// dialog.mjs: places the TTS dialogue lines (out/voice/raw/dNN_who.wav, from scripts/tts_dialog.py) on the film:
//   src/dialog.js        DIALOG rows [t0, who, env] (env: mouth level 0-9 per 1/24 s) and SPEAK(who, t) for the rigs
//   out/audio/dialogue.wav  every line at its time, levelled to one loudness, 48 kHz stereo, the film's length
// AT: when each line's speech starts (video s); the file is placed so its first sound lands there. Usage: node scripts/dialog.mjs
import fs from 'fs';
import vm from 'vm';
import { execFileSync } from 'child_process';

const AT = {
  d01_ton: 12.16, d02_mai: 84.07, d03_ton: 88.73, d04_mai: 91.20, d05_ton: 96.10, d06_ton: 98.30, d07_mai: 101.70,
  d08_mai: 105.60, d09_ton: 107.80, d10_mai: 112.35, d11_mai: 118.60, d12_ton: 121.80, d13_mai: 128.30, d14_mai: 131.95,
  d15_ton: 135.00, d16_mai: 138.65, d17_mai: 142.00, d18_mai: 148.48, d19_ton: 152.50, d20_mai: 154.20, d21_mai: 176.55,
  d22_ton: 179.10,
};
const ctx = { PROJECT: { duration: 117.75 } };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync('src/air.js', 'utf8'), ctx);
const DUR = ctx.PROJECT.duration, FPS = 24, SR = 24000, TARGET = -21;   // mean dBFS of each line

const rows = [], inputs = [], filt = [];
for (const [i, key] of Object.keys(AT).entries()) {
  const f = `out/voice/raw/${key}.wav`;
  const pcm = execFileSync('ffmpeg', ['-loglevel', 'error', '-i', f, '-f', 'f32le', '-ac', '1', '-ar', String(SR), '-'], { maxBuffer: 1 << 28 });
  const x = new Float32Array(pcm.buffer, pcm.byteOffset, pcm.length / 4), hop = SR / FPS, env = [];
  for (let s = 0; s < x.length; s += hop) { let e = 0; for (let j = s; j < Math.min(s + hop, x.length); j++) e += x[j] * x[j]; env.push(Math.sqrt(e / hop)); }
  const p90 = [...env].sort((a, b) => a - b)[Math.floor(env.length * .9)] || 1e-6;
  const lv = env.map(v => Math.min(9, Math.round(9 * Math.min(1, v / p90))));
  const on = lv.findIndex(v => v >= 2) / FPS, t0 = +(AT[key] - on).toFixed(3);
  let mean = 0; for (const v of x) mean += v * v; mean = 10 * Math.log10(mean / x.length + 1e-12);
  rows.push([t0, key.split('_')[1], lv.join('')]);
  inputs.push('-i', f);
  filt.push(`[${i}:a]aresample=48000,volume=${(TARGET - mean).toFixed(2)}dB,adelay=${Math.round(t0 * 1000)}:all=1[a${i}]`);
}
filt.push(`${rows.map((_, i) => `[a${i}]`).join('')}amix=inputs=${rows.length}:normalize=0,apad=whole_dur=${DUR},atrim=0:${DUR},aformat=channel_layouts=stereo[out]`);
fs.mkdirSync('out/audio', { recursive: true });
execFileSync('ffmpeg', ['-loglevel', 'error', '-y', ...inputs, '-filter_complex', filt.join(';'), '-map', '[out]', '-ar', '48000', '-c:a', 'pcm_s16le', 'out/audio/dialogue.wav'], { stdio: 'inherit' });

fs.writeFileSync('src/dialog.js', `// dialog.js: written by scripts/dialog.mjs (do not edit). The spoken lines on the film: DIALOG rows [t0, who, env],
// env = mouth level 0-9 per 1/24 s from t0. SPEAK(who, t): the level 0..1 at video time t, held for 1/12 s (the boil
// rhythm, so the mouth changes like a drawing, not a flicker). cast.js opens the mouth with it (NOW_T from timeline.js).
const DIALOG = ${JSON.stringify(rows)};
function SPEAK(who, t) {
  const q = Math.floor(t * 12) / 12;
  for (const [t0, w, env] of DIALOG) {
    if (w !== who || q < t0) continue;
    const i = Math.floor((q - t0) * 24);
    if (i < env.length) return Math.max(+env[i], +(env[i + 1] || 0)) / 9;   // the louder of the bucket's two frames
  }
  return 0;
}
`);
console.log(`out/audio/dialogue.wav + src/dialog.js: ${rows.length} lines`);
