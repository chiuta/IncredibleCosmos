// Verifică în 8 limbi că valorile din tabelul „Cum funcționează jocul” (README*.md) coincid cu constantele din codul jocului (TYPES + raza vortexului).
// Rulare: node tests/readme-valori.test.mjs   (fără browser, fără rețea)
import fs from 'node:fs'; import path from 'node:path'; import {fileURLToPath} from 'node:url';
const R = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
let ok = 0, bad = 0; const t = (n, c, x) => { if (c) { ok++; console.log('  ok   ' + n); } else { bad++; console.log('  FAIL ' + n, x ?? ''); } };
const h = fs.readFileSync(path.join(R, 'index.html'), 'utf8');
const i = h.indexOf('\nvar TYPES = {') + 1; let d = 0, k = i + 12;
for (; k < h.length; k++) { if (h[k] === '{') d++; else if (h[k] === '}') { d--; if (!d) break; } }
const TYPES = (0, eval)('(' + h.slice(i + 12, k + 1) + ')');
const spin = [...h.matchAll(/hasSpin && s?d < (\d+)/g)].map(m => +m[1]);
t('raza de rotație a vortexului din cod: o singură valoare (85) în toate locurile', spin.length >= 2 && new Set(spin).size === 1 && spin[0] === 85, spin);
const EXP = {'🪐': ['planet', TYPES.planet.mass, TYPES.planet.gravR], '🌙': ['moon', TYPES.moon.mass, TYPES.moon.gravR], '⭐': ['star', TYPES.star.mass, TYPES.star.gravR], '🕳️': ['blackhole', TYPES.blackhole.mass, TYPES.blackhole.gravR], '🌀': ['vortex', TYPES.vortex.mass, spin[0]]};
for (const f of fs.readdirSync(R).filter(x => /^README(\.[a-z]{2})?\.md$/.test(x))) {
  const rows = fs.readFileSync(path.join(R, f), 'utf8').split('\n').filter(l => /^\|/.test(l));
  let good = 0, seenVortex = false;
  for (const [emo, [name, mass, r]] of Object.entries(EXP)) {
    const row = rows.find(l => l.startsWith('| ' + emo) && !/Wormhole/i.test(l) && (emo !== '🌀' || !seenVortex));
    if (!row) continue; if (emo === '🌀') seenVortex = true;
    const nums = (row.match(/\d+/g) || []).map(Number);
    if (nums.includes(mass) && nums.includes(r)) good++; else t(f + ': ' + name + ' – ' + mass + '/' + r + ' în README', false, row);
  }
  t(f + ': cele 5 obiecte cu gravitație au valorile din cod', good === 5, good);
}
console.log(`\n${ok} ok / ${bad} eșuate`); process.exit(bad ? 1 : 0);
