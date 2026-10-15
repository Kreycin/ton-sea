#!/usr/bin/env python3
"""Rough animatic: reads the CUTS table in src/scenes/animatic.js, renders one still per cut, and holds each still for
its cut length under the padded narration. Usage: python3 scripts/animatic.py [times|build] [--w=960]
  times  print the still times (cut start + 0.3 s), comma separated, for render.mjs --sheet / --stills
  build  render out/animatic/stills, then out/animatic.mp4 (960x540 by default) with assets/narration.wav, and the
         cut sheet out/animatic_cuts.jpg"""
import re, subprocess, sys, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PRE, DUR = 4.0, 117.75
src = open(os.path.join(ROOT, 'src/scenes/animatic.js')).read()
cuts = [(m[1], float(m[2]) + PRE) for m in re.finditer(r"\['(\w+)', (-?[\d.]+),", src)]
still = lambda v: round(v + .3, 2)
mode = sys.argv[1] if len(sys.argv) > 1 else 'times'
w = int(next((a.split('=')[1] for a in sys.argv if a.startswith('--w=')), 960))
if mode == 'times':
    print(','.join(f'{still(v):g}' for _, v in cuts)); sys.exit()
out = os.path.join(ROOT, 'out/animatic'); os.makedirs(out + '/stills', exist_ok=True)
subprocess.run(['node', 'render.mjs', '--stills=' + ','.join(f'{still(v):g}' for _, v in cuts), '--out=out/animatic/stills'], cwd=ROOT, check=True)
name = lambda v: 'stills/t' + f'{still(v):.2f}'.replace('.', '_') + '.png'   # render.mjs --stills naming
with open(out + '/list.txt', 'w') as f:
    for i, (cid, v) in enumerate(cuts):
        end = cuts[i + 1][1] if i + 1 < len(cuts) else DUR
        f.write(f"file '{name(v)}'\nduration {end - v:.3f}\n")
    f.write(f"file '{name(cuts[-1][1])}'\n")                     # concat needs the last file twice to hold it
h = w * 9 // 16
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', out + '/list.txt', '-i', os.path.join(ROOT, 'assets/narration.wav'),
                '-vf', f'scale={w}:{h},fps=24,format=yuv420p', '-c:v', 'libx264', '-crf', '24', '-preset', 'veryfast',
                '-c:a', 'aac', '-b:a', '128k', '-t', f'{DUR}', '-movflags', '+faststart', os.path.join(ROOT, 'out/animatic.mp4')], check=True)
print('out/animatic.mp4', len(cuts), 'cuts')
# cut sheet: every still, 7 per row
fs = [name(v) for _, v in cuts]
args = [a for f in fs for a in ('-i', os.path.join(out, f))]
flt = ''.join(f'[{i}]scale=320:180[v{i}];' for i in range(len(fs))) + ''.join(f'[v{i}]' for i in range(len(fs)))
flt += f'concat=n={len(fs)}:v=1:a=0,tile=7x{-(-len(fs) // 7)}:padding=4:color=0x1b1820'
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', *args, '-filter_complex', flt, '-frames:v', '1', os.path.join(ROOT, 'out/animatic_cuts.jpg')], check=True)
print('out/animatic_cuts.jpg')
