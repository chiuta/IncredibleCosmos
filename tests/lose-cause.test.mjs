// Mesajele de eșec numesc cauza (gaură neagră / ieșire din zona de joc) în toate limbile.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const s = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const m = s.match(/var I18N = (\{.*?\});\n/s);
const d = JSON.parse(m[1]);
let ok = 0;
for (const l of ['ro', 'en', 'fr', 'it', 'es', 'pt', 'de', 'hu']) {
  for (const k of ['a_lose', 'a_lose_hole', 'a_lose_out']) { assert.ok(d[l] && d[l][k], l + '.' + k); ok++; }
  assert.notEqual(d[l].a_lose_hole, d[l].a_lose_out, l);
}
assert.match(s, /o\.deadBy = "hole"/); assert.match(s, /o\.deadBy = "out"/);
console.log('  ok  ' + ok + ' chei de eșec în 8 limbi\n\n' + (ok + 2) + ' reușite, 0 eșuate');
