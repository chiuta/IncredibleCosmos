// The Incredible Cosmos — progres salvat deteriorat (incrediblecosmos.progress) nu mai dărâmă ecranul; metadate coerente.
// Rulare: node tests/progress-corruption.test.mjs   (Playwright din /opt/node-tools sau NODE_PW; CHROME=cale/chromium; WebGL prin SwiftShader)
import {createRequire} from 'module';
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const require = createRequire(process.env.NODE_PW || '/opt/node-tools/package.json');
const {chromium} = require('playwright');
const R = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
let pass = 0, fail = 0;
const ok = (c, n, i) => { if (c) { pass++; console.log('  ok   ' + n); } else { fail++; console.log('  FAIL ' + n + (i === undefined ? '' : ' ' + JSON.stringify(i).slice(0, 300))); } };
const h = fs.readFileSync(path.join(R, 'index.html'), 'utf8'), app = JSON.parse(fs.readFileSync(path.join(R, 'app.json'), 'utf8'));
const S = app.sha256;
ok(app.sizeBytes === Buffer.byteLength(h) && crypto.createHash('sha256').update(h.split(S).join('')).digest('hex') === S, 'app.json: sizeBytes și sha256 corecte');
ok(app.storageKeys.includes('incrediblecosmos.progress'), 'app.json listează cheia de progres', app.storageKeys);
const b = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || process.env.CHROME || undefined, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader']});
const payloads = {
  'null în intrare': {1: 1, 2: null}, 'stele negative': {1: {st: -5}, 2: {st: 2}}, 'stele uriașe': {1: {st: 1e9}}, 'șir': {1: 'x', 2: [1], 3: {st: 'abc'}},
  'JSON invalid': 'not json{', 'tablou': [1, 2, 3], 'proto': '{"__proto__":{"polluted":1}}'
};
for (const [name, val] of Object.entries(payloads)) {
  const ctx = await b.newContext({serviceWorkers: 'block', viewport: {width: 1280, height: 800}}); await ctx.route(/^https?:/, r => r.abort());
  await ctx.addInitScript(v => { localStorage.setItem('incrediblecosmos.progress', typeof v === 'string' ? v : JSON.stringify(v)); }, val);
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 120)));
  await p.goto('file://' + path.join(R, 'index.html')); await p.waitForTimeout(2200);
  const r = await p.evaluate(() => ({cards: document.querySelectorAll('button').length, polluted: ({}).polluted, bad: /NaN|undefined|Infinity/.test(document.body.innerText)}));
  ok(r.cards > 50 && !errs.length && !r.polluted && !r.bad, 'progres ' + name + ': ecranul se randează, fără erori', {r, errs});
  await ctx.close();
}
await b.close(); console.log('\n' + pass + ' reușite, ' + fail + ' eșuate'); process.exit(fail ? 1 : 0);
