// shotlist.mjs: prints the film's shot list (video start time, length, scene function) from studio.html, for the
// sound passes (sfx/score) and the cut checks. Usage: node scripts/shotlist.mjs [> out/shots.txt]
import puppeteer from 'puppeteer-core';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal'] });
const page = await browser.newPage();
await page.goto(pathToFileURL(resolve('studio.html')).href + '?render', { waitUntil: 'networkidle0' });
await page.waitForFunction('window.ready === true', { timeout: 60000 });
const rows = await page.evaluate(() => SHOTS.map((s, i) => [s[0], (SHOTS[i + 1] ? SHOTS[i + 1][0] : PROJECT.duration) - s[0], s[1].name || '?']));
for (const [t, d, n] of rows) console.log(t.toFixed(2).padStart(7), d.toFixed(2).padStart(6), n);
await browser.close();
