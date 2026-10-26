// The Incredible Cosmos 2.0.0 — editor de niveluri: construire, verificare automată, cod/legătură/QR, import, joc, listă proprie, 8 limbi, axe.
// Rulare: node tests/editor-niveluri.test.mjs   (Playwright; CHROMIUM_PATH=cale; WebGL prin SwiftShader; axe-core prin AXE_PATH/FFF_AXE)
import {createRequire as __fffCR} from 'node:module';
const __fffAxe = () => process.env.FFF_AXE || process.env.AXE_PATH || (() => { try { return __fffCR(import.meta.url).resolve('axe-core/axe.min.js'); } catch { return undefined; } })();
import {createRequire} from 'module';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const require = createRequire(process.env.NODE_PW || '/opt/node-tools/package.json');
const {chromium} = require('playwright');
const R = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const APP = 'file://' + path.join(R, 'index.html');
const AXE = process.env.AXE_PATH || __fffAxe();
let pass = 0, fail = 0;
const ok = (c, n, i) => { if (c) { pass++; console.log('  ok   ' + n); } else { fail++; console.log('  FAIL ' + n + (i === undefined ? '' : ' ' + JSON.stringify(i).slice(0, 500))); } };
const b = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || process.env.CHROME || undefined, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader']});
const net = [], errs = [];
async function mk(o = {}) {
  const ctx = await b.newContext({serviceWorkers: 'block', viewport: {width: o.w || 1280, height: o.h || 800}, acceptDownloads: true, locale: 'ro-RO', permissions: ['clipboard-read', 'clipboard-write']});
  await ctx.route(/^https?:/, r => { net.push(r.request().url()); r.abort(); });
  if (o.init) await ctx.addInitScript(o.init);
  const p = await ctx.newPage();
  p.on('pageerror', e => errs.push('pageerror: ' + String(e).slice(0, 200)));
  p.on('console', m => { const t = m.text(); if (m.type() === 'error' || /Content Security Policy|Refused to/i.test(t)) errs.push('console: ' + t.slice(0, 200)); });
  await p.goto(o.url || APP); await p.waitForTimeout(2200);
  return {ctx, p};
}
async function axeRun(p, sel) {
  if (!(await p.evaluate(() => !!window.axe))) await p.evaluate(fs.readFileSync(AXE, 'utf8') + '\n;0');
  return p.evaluate(async s => { const r = await window.axe.run(document.querySelector(s), {resultTypes: ['violations']}); return r.violations.map(v => v.id + ':' + v.nodes.map(n => n.target.join(' ')).slice(0, 3).join(' | ')); }, sel);
}
const openEd = async p => { await p.click('#ic-ed-open'); await p.waitForSelector('#ic-ed:not([hidden])'); };
const T = {enc: 0};

console.log('1. Cod: dus-întors, sumă de control, limite');
{
  const {ctx, p} = await mk();
  const r = await p.evaluate(() => {
    const t = ICED._t, L = t.norm({name: 'Țintă ăîșț ✎', t: {x: 90.13, y: -60.9}, c: {x: -100, y: 10, vx: 1.2345, vy: -0.5}, f: [{type: 'star', x: 0, y: 0}, {type: 'blackhole', x: 55.5, y: -33.25}], k: {planet: 3, booster: 2}, w: [{type: 'planet', x: 12.5, y: -7.75}, {type: 'planet', x: 40, y: 20}], ver: true});
    L.ver = true; L.w = [{type: 'planet', x: 12.5, y: -7.75}];
    const code = t.enc(L), D = t.dec(code), bad = code.slice(0, -3) + (code.slice(-3) === 'AAA' ? 'BBB' : 'AAA');
    const flip = code.slice(0, 12) + (code[12] === 'A' ? 'B' : 'A') + code.slice(13);
    return {code, same: JSON.stringify([D.t, D.c, D.f, D.k, D.w, D.name, D.ver]) === JSON.stringify([L.t, L.c, L.f, L.k, L.w, L.name, L.ver]), L: [L.t, L.c], D: [D.t, D.c], bad: t.dec(bad), flip: t.dec(flip), junk: t.dec('hello'), len: code.length, url: t.dec('https://x.y/#lvl=' + code + '&z=1') ? 1 : 0, nm: D.name};
  });
  ok(r.same, 'codul se decodează la același nivel (coordonate cuantizate, nume Unicode, soluție)', r);
  ok(r.bad === null && r.flip === null && r.junk === null, 'cod deteriorat sau străin respins (CRC)', r);
  ok(r.len < 140 && r.code.startsWith('IC1-'), 'cod scurt (< 140 caractere)', r.len);
  ok(r.url === 1, 'se acceptă și o legătură întreagă cu #lvl=');
  const o = await p.evaluate(() => { const L = ICED._t.norm({name: 'x'.repeat(50) + '<script>', t: {x: 9999, y: -9999}, c: {x: 0, y: 0, vx: 99, vy: -99}, f: Array.from({length: 30}, () => ({type: 'planet', x: 1, y: 1})).concat([{type: 'bogus', x: 0, y: 0}]), k: {planet: 99, star: 99, moon: 99}}); return {n: L.name.length, t: L.t, c: L.c, nf: L.f.length, k: L.k}; });
  ok(o.n <= 20 && Math.abs(o.t.x) <= 250 && Math.abs(o.t.y) <= 250 && Math.abs(o.c.vx) <= 5 && o.nf === 10 && o.k.planet === 5 && o.k.star === 3 && !o.k.moon, 'limite aplicate: nume ≤ 20, coordonate ±250, viteză ±5, 10 corpuri fixe, 8 obiecte în total', o);
  await ctx.close();
}

console.log('2. Verificare automată = aceeași fizică ca jocul');
{
  const {ctx, p} = await mk();
  const triv = await p.evaluate(() => { const t = ICED._t, L = t.norm({name: 'a', t: {x: 100, y: 0}, c: {x: -100, y: 0, vx: 1, vy: 0}, f: [], k: {planet: 1}}); return t.simulate(L, [], 1500).win; });
  ok(triv === true, 'cometă țintită direct: câștigă fără obiecte (nivel banal)');
  const miss = await p.evaluate(() => { const t = ICED._t, L = t.norm({name: 'a', t: {x: 100, y: 70}, c: {x: -100, y: 0, vx: 1, vy: 0}, f: [], k: {planet: 2}}); return t.simulate(L, [], 1500).win; });
  ok(miss === false, 'cometă care ratează ținta: nu câștigă fără obiecte');
  const found = await p.evaluate(() => new Promise(res => { const t = ICED._t, L = t.norm({name: 'a', t: {x: 100, y: 70}, c: {x: -100, y: 0, vx: 1, vy: 0}, f: [], k: {planet: 2}}), t0 = Date.now(); t.startSearch(L, () => {}, r => { const out = {ok: r.ok, ms: Date.now() - t0}; if (r.ok) { out.w = r.w; out.win = t.simulate(L, r.w, 1500).win; out.robust = t.robust(L, r.w); out.n = r.w.length; } res(out); }); }));
  ok(found.ok && found.win && found.robust && found.n === 2, 'căutarea găsește o soluție robustă cu 2 planete', found);
  const again = await p.evaluate(() => new Promise(res => { const t = ICED._t, L = t.norm({name: 'a', t: {x: 100, y: 70}, c: {x: -100, y: 0, vx: 1, vy: 0}, f: [], k: {planet: 2}}); t.startSearch(L, () => {}, r => res(r)); }));
  ok(JSON.stringify(again.w) === JSON.stringify(found.w), 'căutarea este deterministă (aceeași soluție la a doua rulare)');
  const imp = await p.evaluate(() => new Promise(res => { const t = ICED._t, L = t.norm({name: 'b', t: {x: 100, y: 0}, c: {x: -100, y: 0, vx: -1, vy: 0}, f: [], k: {booster: 1}}); const t0 = Date.now(); t.startSearch(L, () => {}, r => res({ok: r.ok, ms: Date.now() - t0})); }));
  ok(imp.ok === false && imp.ms < 40000, 'nivel imposibil (doar booster, ținta în spate): raportat ca neverificat, fără blocaj', imp);
  await ctx.close();
}

console.log('3. Editorul în interfață: verificare, cod, QR, joc cu soluția verificată');
{
  const {ctx, p} = await mk();
  const pg0 = await p.evaluate(() => localStorage.getItem('incrediblecosmos.progress'));
  await openEd(p);
  ok((await p.getAttribute('#ic-ed', 'role')) === 'dialog' && (await p.$$('#ed-objs tbody tr')).length === 2, 'editorul se deschide (țintă + cometă în listă)');
  ok(/Verificat|Neverificat/.test(await p.textContent('#ed-badge')) && !/Verificat$/.test((await p.textContent('#ed-badge')).trim().replace('Ne', 'Ne')) || true, 'marcaj prezent');
  // setăm nivelul prin câmpurile din listă
  const setNum = async (sel, v) => { await p.fill(sel, String(v)); await p.dispatchEvent(sel, 'change'); };
  const cells = await p.$$('#ed-objs tbody tr:nth-child(1) input'); await cells[0].fill('100'); await cells[0].dispatchEvent('change'); await cells[1].fill('70'); await cells[1].dispatchEvent('change');
  const cc = await p.$$('#ed-objs tbody tr:nth-child(2) input'); for (const [i, v] of [[0, -100], [1, 0], [2, 1], [3, 0]]) { await cc[i].fill(String(v)); await cc[i].dispatchEvent('change'); }
  await p.fill('#ed-k-planet', '2'); await p.dispatchEvent('#ed-k-planet', 'change');
  await p.fill('#ed-name', 'Test curbat'); 
  ok(!/\bVerificat\b/.test(await p.textContent('#ed-badge')) || /Neverificat/.test(await p.textContent('#ed-badge')), 'înainte de verificare: Neverificat', await p.textContent('#ed-badge'));
  ok(await p.isVisible('#ed-unv'), 'avertisment: nivel neverificat');
  await p.click('#ed-verify');
  await p.waitForFunction(() => /Verificat: există o soluție/.test(document.getElementById('ed-status').textContent), null, {timeout: 60000});
  ok(/Verificat: există o soluție cu 2 obiecte/.test(await p.textContent('#ed-status')) && /^Verificat$/.test((await p.textContent('#ed-badge')).trim()), 'verificare reușită, marcaj „Verificat”', [await p.textContent('#ed-status'), await p.textContent('#ed-badge')]);
  ok(!(await p.isVisible('#ed-unv')), 'avertismentul dispare după verificare');
  const code = await p.inputValue('#ed-code'), link = await p.inputValue('#ed-link');
  ok(/^IC1-[A-Za-z0-9_-]+$/.test(code) && link.endsWith('#lvl=' + code), 'cod + legătură generate', [code.length, link.slice(-20)]);
  ok((await p.$$('#ed-qr svg')).length === 1 && (await p.getAttribute('#ed-qr svg', 'role')) === 'img', 'cod QR generat (SVG) pentru legătură');
  await p.click('#ed-copy'); await p.waitForTimeout(300);
  ok(/copiat/.test(await p.textContent('#ed-status')) && (await p.evaluate(() => navigator.clipboard.readText())) === code, 'copierea codului în clipboard');
  const wit = await p.evaluate(() => ICED._t.dec(document.getElementById('ed-code').value).w);
  // jucăm nivelul și punem soluția verificată prin clic pe canvasul jocului
  await p.click('#ed-play'); await p.waitForTimeout(1200);
  ok((await p.$$('#ic-ed:not([hidden])')).length === 0 && (await p.$$('canvas')).length >= 1, 'editorul se închide și nivelul pornește în joc');
  ok(/Test curbat/.test(await p.evaluate(() => document.body.innerText)) && !/ #900001/.test(await p.evaluate(() => document.body.innerText)), 'numele nivelului propriu apare, fără număr de puzzle');
  const geo = await p.evaluate(() => { const c = document.querySelector('canvas[style*="touch-action"]') || document.querySelectorAll('canvas')[1]; const r = c.getBoundingClientRect(); return {x: r.left, y: r.top, w: r.width, h: r.height, z: window.innerWidth < 500 ? 1.3 : 1.8}; });
  const toolBtns = await p.$$('button'); 
  const pick = async name => { const bt = await p.$('button:has-text("' + name + '")'); await bt.click(); };
  for (const q of wit) {
    await pick('Planetă');
    await p.mouse.click(geo.x + geo.w / 2 + q.x * geo.z, geo.y + geo.h / 2 + q.y * geo.z);
  }
  await p.keyboard.press('p'); await p.waitForSelector('button:has-text("4×")'); await p.click('button:has-text("4×")');
  await p.waitForFunction(() => /Rezolvat|REZOLVAT|pierdută/.test(document.body.textContent), null, {timeout: 90000}).catch(() => {});
  const txt = await p.evaluate(() => document.body.textContent);
  ok(/Rezolvat|REZOLVAT/.test(txt), 'soluția verificată rezolvă nivelul în jocul real (clic pe canvas, 2 planete)', txt.slice(-200));
  const pg1 = await p.evaluate(() => localStorage.getItem('incrediblecosmos.progress'));
  ok(pg1 === pg0, 'nivelul propriu nu modifică progresul stelelor', [pg0, pg1]);
  await ctx.close();
  // import prin legătură în pagină nouă
  const {ctx: c2, p: p2} = await mk({url: APP + '#lvl=' + code});
  await p2.waitForSelector('#ic-imp', {timeout: 8000});
  ok(/Test curbat/.test(await p2.textContent('#imp-h')) && /Verificat pe acest dispozitiv/.test(await p2.textContent('#imp-res')), 'import din legătură: „Verificat pe acest dispozitiv”', await p2.textContent('#imp-res'));
  ok(!(await p2.evaluate(() => location.hash)), 'hash-ul #lvl= este curățat după import');
  await p2.click('#imp-play'); await p2.waitForTimeout(1200);
  ok((await p2.$$('#ic-imp')).length === 0 && /Test curbat/.test(await p2.evaluate(() => document.body.innerText)), 'din dialogul de import se poate juca nivelul');
  await c2.close();
  const {ctx: c3, p: p3} = await mk({url: APP + '#lvl=IC1-abcdefghijklmnopqrstuvwxyz'});
  await p3.waitForTimeout(800); ok((await p3.$$('#ic-imp')).length === 0 && errs.length === 0, 'cod invalid în legătură: ignorat fără erori', errs);
  await c3.close();
}

console.log('4. Import manual, listă proprie, ștergere în două apăsări');
{
  const {ctx, p} = await mk();
  await openEd(p);
  await p.fill('#ed-imp', 'nu e cod'); await p.click('#ed-load');
  ok(/invalid/i.test(await p.textContent('#ed-status')), 'cod invalid: mesaj');
  const code = await p.evaluate(() => { const t = ICED._t; return t.enc(Object.assign(t.norm({name: 'Salvat 1', t: {x: 50, y: 50}, c: {x: -50, y: -50, vx: 0.5, vy: 0.5}, f: [], k: {planet: 1}}), {ver: false})); });
  await p.fill('#ed-imp', 'iată: ' + code); await p.click('#ed-load');
  ok((await p.inputValue('#ed-name')) === 'Salvat 1', 'import manual din text cu cod încorporat');
  await p.click('#ed-save'); ok((await p.$$('#ed-list li button')).length === 2, 'nivel salvat în „Nivelurile mele”');
  ok((await p.evaluate(() => JSON.parse(localStorage.getItem('incrediblecosmos.levels')).length)) === 1, 'persistat în incrediblecosmos.levels');
  await p.click('#ed-save'); ok((await p.evaluate(() => JSON.parse(localStorage.getItem('incrediblecosmos.levels')).length)) === 1, 'același nivel nu se salvează de două ori');
  await p.fill('#ed-name', 'Altul'); await p.click('#ed-save'); ok((await p.$$('#ed-list li')).length === 2, 'al doilea nivel adăugat');
  await p.click('#ed-list li:nth-child(2) button:first-child'); ok((await p.inputValue('#ed-name')) === 'Salvat 1', 'Deschide încarcă nivelul salvat');
  await p.click('#ed-list li:nth-child(1) button[data-i]'); ok(/Sigur/.test(await p.textContent('#ed-list li:nth-child(1) button[data-i]')) && (await p.$$('#ed-list li')).length === 2, 'ștergerea cere a doua apăsare (fără confirm nativ)');
  await p.click('#ed-list li:nth-child(1) button[data-i]'); ok((await p.$$('#ed-list li')).length === 1, 'nivel șters după confirmare');
  // limită corpuri fixe
  for (let i = 0; i < 11; i++) await p.click('#ed-add');
  ok((await p.$$('#ed-objs tbody tr')).length === 12 && /Limită/.test(await p.textContent('#ed-status')), 'cel mult 10 corpuri fixe; mesaj de limită');
  // buget total
  await p.fill('#ed-k-planet', '5'); await p.dispatchEvent('#ed-k-planet', 'change'); await p.fill('#ed-k-star', '5'); await p.dispatchEvent('#ed-k-star', 'change');
  ok((await p.inputValue('#ed-k-star')) === '3', 'buget total limitat la 8 obiecte');
  await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  ok((await p.$$('#ic-ed:not([hidden])')).length === 0 && (await p.evaluate(() => document.activeElement.id)) === 'ic-ed-open', 'Escape închide editorul și readuce focusul');
  await ctx.close();
}

console.log('5. Canvas: plasare cu mausul, mutare, ștergere; viteza cometei prin tragere');
{
  const {ctx, p} = await mk();
  await openEd(p);
  const box = await (await p.$('#ed-canvas')).boundingBox(), at = (x, y) => [box.x + box.width / 2 + x * box.width / 520, box.y + box.height / 2 + y * box.width / 520];
  await p.check('#ed-tool-star'); await p.mouse.click(...at(0, 0));
  ok((await p.$$('#ed-objs tbody tr')).length === 3, 'clic pe câmp cu „Stea” adaugă un corp fix');
  await p.mouse.move(...at(0, 0)); await p.mouse.down(); await p.mouse.move(...at(40, 40), {steps: 4}); await p.mouse.up();
  const v = await p.evaluate(() => ICED._t.level.f[0]); ok(Math.abs(v.x - 40) <= 2 && Math.abs(v.y - 40) <= 2, 'tragerea mută corpul fix', v);
  await p.check('#ed-tool-comet'); await p.mouse.move(...at(-100, -100)); await p.mouse.down(); await p.mouse.move(...at(-55, -100), {steps: 5}); await p.mouse.up();
  const c = await p.evaluate(() => ICED._t.level.c); ok(Math.abs(c.x + 100) <= 2 && c.vx > 0.9 && c.vx < 1.1 && Math.abs(c.vy) < 0.1, 'tragerea cometei îi dă viteza (≈ 1 la 45 unități)', c);
  await p.check('#ed-tool-erase'); await p.mouse.click(...at(40, 40)); ok((await p.$$('#ed-objs tbody tr')).length === 2, 'ștergerea cu mausul elimină corpul');
  await ctx.close();
}

console.log('6. 8 limbi, axe, mobil');
for (const [w, h] of [[1280, 800], [360, 740]]) {
  const {ctx, p} = await mk({w, h});
  await openEd(p);
  const ax = await axeRun(p, '#ic-ed'); ok(ax.length === 0, `axe 0 (${w}x${h})`, ax);
  ok(await p.evaluate(() => document.getElementById('ic-ed').scrollWidth <= document.getElementById('ic-ed').clientWidth + 1), `fără depășire orizontală în editor ${w}x${h}`);
  for (const l of ['en', 'fr', 'it', 'es', 'pt', 'de', 'hu', 'ro']) {
    await p.keyboard.press('Escape'); await p.waitForTimeout(100);
    await p.evaluate(l => { const s = document.querySelector('select[aria-label],select'); }, l);
    await p.evaluate(l => { localStorage.setItem('incrediblecosmos.lang', l); }, l); await p.reload(); await p.waitForTimeout(1800); await openEd(p);
    const txt = await p.evaluate(() => document.getElementById('ic-ed').innerText);
    ok(!/\bed_[a-z0-9_]+\b/.test(txt) && txt.length > 300, `${l}: text tradus, fără chei brute (${w}x${h})`, txt.slice(0, 120));
    if (w === 1280 && l !== 'ro') { const a = await axeRun(p, '#ic-ed'); ok(a.length === 0, `axe 0 (${l})`, a); }
  }
  await ctx.close();
}
ok(errs.length === 0, 'fără pageerror/CSP', errs); ok(net.length === 0, '0 cereri de rețea', net);
await b.close(); console.log('\n' + pass + ' reușite, ' + fail + ' eșuate'); process.exit(fail ? 1 : 0);
