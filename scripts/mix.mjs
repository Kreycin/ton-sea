// mix.mjs: the film's soundtrack: the dialogue (out/audio/dialogue.wav, scripts/dialog.mjs) over the music
// (out/music/music.wav, scripts/score.mjs) and the four SFX stems (scripts/sfx.mjs). The music ducks under the voices and
// the ambience a little; 1.2 s fade in, fade out with the picture; two-pass loudnorm to -15 LUFS, -1.5 dBTP.
// LEVEL: each stem's loudness where it plays (LUFS); its gain comes from its measured loudness. Writes out/audio/mix.wav.
// Usage: node scripts/mix.mjs
import { spawnSync } from 'child_process';

const LEVEL = { dialogue: -20, music: -29, sea: -31, rain: -30, wind: -34, fx: -28 };
const SRC = { dialogue: 'out/audio/dialogue.wav', music: 'out/music/music.wav', sea: 'out/audio/sfx_sea.wav', rain: 'out/audio/sfx_rain.wav', wind: 'out/audio/sfx_wind.wav', fx: 'out/audio/sfx_fx.wav' };
const DUR = 199.95, OUT = 'out/audio/mix.wav';
const ff = args => { const p = spawnSync('ffmpeg', ['-hide_banner', '-nostats', ...args], { encoding: 'utf8', maxBuffer: 1 << 26 }); if (p.status) throw new Error(p.stderr.slice(-600)); return p.stderr; };
const lufs = f => +[...ff(['-i', f, '-af', 'ebur128', '-f', 'null', '-']).matchAll(/I:\s+(-?[\d.]+) LUFS/g)].pop()[1];   // the summary (last) line

const names = Object.keys(SRC), inputs = names.flatMap(n => ['-i', SRC[n]]);
const gain = Object.fromEntries(names.map(n => [n, +(LEVEL[n] - lufs(SRC[n])).toFixed(2)]));
console.log('gains dB', JSON.stringify(gain));
const v = (i, n) => `[${i}:a]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,volume=${gain[n]}dB`;
const graph = (loud, part) => [                               // loud: the last filter; or part 'dm' / 'b' for the check
  `${v(0, 'dialogue')},asplit=3[d][k1][k2]`,
  `${v(1, 'music')}[m]`, `[m][k1]sidechaincompress=threshold=0.01:ratio=5:attack=80:release=900:knee=4[md]`,
  `${v(2, 'sea')}[s1]`, `${v(3, 'rain')}[s2]`, `${v(4, 'wind')}[s3]`, `${v(5, 'fx')}[s4]`,
  `[s1][s2][s3][s4]amix=inputs=4:normalize=0[amb]`, `[amb][k2]sidechaincompress=threshold=0.008:ratio=3:attack=60:release=650[ad]`,
  loud ? `[d][md][ad]amix=inputs=3:normalize=0,atrim=0:${DUR},afade=t=in:d=1.2,afade=t=out:st=${DUR - 3.6}:d=3.5,${loud}[out]`
    : part === 'b' ? `[md][ad]amix=inputs=2:normalize=0,pan=mono|c0=.5*c0+.5*c1,highpass=f=250:poles=2,aresample=16000[out];[d]anullsink`
    : `[d]pan=mono|c0=.5*c0+.5*c1,highpass=f=250:poles=2,aresample=16000[out];[md]anullsink;[ad]anullsink`,
].join(';');
const base = 'loudnorm=I=-15:TP=-1.5:LRA=14';
const m = JSON.parse(/\{[^{}]*"input_i"[^{}]*\}/.exec(ff([...inputs, '-filter_complex', graph(`${base}:print_format=json`), '-map', '[out]', '-f', 'null', '-']))[0]);
ff(['-y', ...inputs, '-filter_complex', graph(`${base}:linear=true:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset},aresample=48000`),
  '-map', '[out]', '-c:a', 'pcm_s24le', OUT]);
console.log(`${OUT}: in ${m.input_i} LUFS, LRA ${m.input_lra}; now ${lufs(OUT)} LUFS`);

// check: how far each spoken line stands above the music and ambience under it, in the speech band (> 250 Hz; aim >= 8 dB)
const raw = part => { const p = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', ...inputs, '-filter_complex', graph(null, part), '-map', '[out]', '-f', 'f32le', '-'], { maxBuffer: 1 << 28 }); return new Float32Array(p.stdout.buffer, p.stdout.byteOffset, p.stdout.length / 4); };
const dm = raw('dm'), bm = raw('b'), DIALOG = JSON.parse(/const DIALOG = (\[.*\]);/.exec((await import('fs')).readFileSync('src/dialog.js', 'utf8'))[1]);
console.log('dialogue over the bed, dB:', DIALOG.map(([t0, , e], k) => {
  let a = 0, b = 0; for (let i = Math.round(t0 * 16000); i < Math.round((t0 + e.length / 24) * 16000); i++) { a += dm[i] ** 2; b += bm[i] ** 2; }
  return `d${String(k + 1).padStart(2, '0')} ${(10 * Math.log10(a / b)).toFixed(1)}`;
}).join(' | '));
