// air.mjs: builds assets/narration_air.wav from assets/narration.wav with the AIR plan in src/air.js: the narration is
// cut at each planned pause (15 ms fades at the cuts) and silence of the planned length is put in. Usage: node scripts/air.mjs
import fs from 'fs';
import vm from 'vm';
import { execFileSync } from 'child_process';

const ctx = { PROJECT: { duration: 117.75 } };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync('src/air.js', 'utf8') + '\nthis.plan = { AIR, AIR_PRE, AIR_TOTAL };', ctx);
const { AIR, AIR_PRE } = ctx.plan, SRC_LEN = 117.75, F = .015;
const cuts = AIR.map(g => AIR_PRE + g[0]), edges = [0, ...cuts, SRC_LEN], n = edges.length - 1;
const f = [`[0:a]asplit=${n}${Array.from({ length: n }, (_, i) => `[i${i}]`).join('')}`];
const seq = [];
for (let i = 0; i < n; i++) {
  const a = edges[i], b = edges[i + 1], fades = [i > 0 ? `afade=t=in:d=${F}` : '', i < n - 1 ? `afade=t=out:st=${(b - a - F).toFixed(3)}:d=${F}` : ''].filter(Boolean);
  f.push(`[i${i}]atrim=${a.toFixed(3)}:${b.toFixed(3)},asetpts=PTS-STARTPTS${fades.length ? ',' + fades.join(',') : ''}[s${i}]`);
  seq.push(`[s${i}]`);
  if (i < n - 1) { f.push(`anullsrc=r=48000:cl=stereo,atrim=duration=${AIR[i][1]}[z${i}]`); seq.push(`[z${i}]`); }
}
f.push(`${seq.join('')}concat=n=${seq.length}:v=0:a=1[out]`);
execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', 'assets/narration.wav', '-filter_complex', f.join(';'), '-map', '[out]', '-ar', '48000', '-c:a', 'pcm_s16le', 'assets/narration_air.wav'], { stdio: 'inherit' });
console.log(`assets/narration_air.wav: ${AIR.length} gaps, +${ctx.plan.AIR_TOTAL} s`);
