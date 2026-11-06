// Browser checks for procediments/tecnica-derivacio.html. Usage: node procediments/proves/navegador/prova-extrems.js <repo> <katex-dist> <shots>
'use strict';
const http = require('http'), fs = require('fs'), path = require('path');
const {chromium} = require('playwright');
const [ROOT, KATEX, SHOTS] = process.argv.slice(2);
fs.mkdirSync(SHOTS, {recursive: true});
const TIPUS = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png'};
const servidor = http.createServer((req, res) => {
  const ruta = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!fs.existsSync(ruta) || fs.statSync(ruta).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, {'content-type': TIPUS[path.extname(ruta)] || 'application/octet-stream'});
  fs.createReadStream(ruta).pipe(res);
});
let fallades = 0;
const ok = (c, m) => { console.log((c ? '  ok  ' : '  ERR ') + m); if (!c) fallades++; };
async function obre(nav, ruta, viewport = {width: 1000, height: 900}) {
  const context = await nav.newContext({viewport, deviceScaleFactor: viewport.width < 500 ? 2 : 1});
  const p = await context.newPage();
  const consola = [];
  p.on('console', m => { if (['error', 'warning'].includes(m.type())) consola.push(m.text()); });
  p.on('pageerror', e => consola.push(e.message));
  await p.route('https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/**', r => r.fulfill({path: path.join(KATEX, new URL(r.request().url()).pathname.split('/0.16.9/')[1])}));
  await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.fulfill({status: 200, contentType: 'text/css', body: ''}));
  await p.goto(`http://localhost:${servidor.address().port}/procediments/tecnica-derivacio.html${ruta}`);
  // La pestanya de les dades és plegada per defecte (David): s'obre, com faria qui vol canviar les dades. I sense el pas 0
  // (l'enunciat a la bombolla): les comprovacions comencen al pas 1 (el pas 0 el prova prova-pas0.js).
  await p.evaluate(() => { document.querySelectorAll('details.targeta').forEach(d => { d.open = true; }); if (typeof procediment !== 'undefined') procediment.senseInici(); }).catch(() => {});
  await p.waitForTimeout(400);
  return {p, context, consola};
}
const lliure = p => p.waitForFunction(() => !procediment.ocupat && !document.querySelector('.capa.nova') && !document.querySelector('.efectes').children.length, null, {timeout: 20000});
const estat = p => p.evaluate(() => {
  const O = {throwOnError: false, strict: 'ignore', trust: c => c.command === '\\htmlData'};
  const norm = h => { const t = document.createElement('div'); t.innerHTML = h; return t.innerHTML; };   // mateixa serialització (&nbsp;)
  const pas = TecnicaDerivacio.passos(procediment.valors)[procediment.pas];
  const files = [...document.querySelectorAll('.pissarra > .capa > .fila')];
  const pis = document.querySelector('.pissarra');
  return {
    iguals: files.length === pas.files.length && files.every((f, i) => f.innerHTML === (pas.files[i] ? norm(katex.renderToString(pas.files[i], O)) : '') && f.className === 'fila' + (pas.classes[i] ? ' ' + pas.classes[i] : '')),
    desborda: Math.max(pis.scrollWidth - pis.clientWidth, document.documentElement.scrollWidth - innerWidth),
  };
});
(async () => {
  await new Promise(r => servidor.listen(0, r));
  const nav = await chromium.launch();
  for (const mida of [{width: 1366, height: 680}, {width: 375, height: 760}]) {
    const {p, context, consola} = await obre(nav, '', mida);
    const mobil = mida.width < 500;
    if (!mobil) ok(await p.textContent('h1') === 'Tècnica de derivació', 'h1');
    await p.selectOption('#velocitat', '1.6');
    const n = await p.$$eval('.exemple', b => b.length);
    ok(n === 20, `${n} functions`);
    let pitjor = 0;
    for (let e = 0; e < n; e++) {
      await p.evaluate(i => document.querySelectorAll('.exemple')[i].click(), e);
      await p.waitForTimeout(200);
      const total = await p.evaluate(() => procediment.total);
      let bons = 0;
      for (let i = 1; i < total; i++) {
        if (mobil) await p.evaluate(j => procediment.salta(j), i); else { await p.evaluate(() => procediment.seguent()); await lliure(p); }
        const s = await estat(p);
        if (s.iguals) bons++;
        pitjor = Math.max(pitjor, s.desborda);
      }
      if (!mobil) ok(bons === total - 1, `function ${e + 1}: ${bons}/${total - 1} animated steps end on the expected board`);
    }
    if (mobil) ok(pitjor <= 0, `phone: no overflow (${pitjor})`);
    // La derivada d'un polinomi, en una sola animació (David, nov. 2026): captures a mig pas i al final.
    if (!mobil) {
      await p.evaluate(() => document.querySelectorAll('.exemple')[0].click());
      await p.waitForTimeout(200);
      ok(await p.evaluate(() => procediment.total) === 3, 'polynomial: 3 steps (f, (f)\', f\')');
      await p.evaluate(() => procediment.salta(1));
      await p.evaluate(() => procediment.seguent());
      await p.waitForTimeout(250);
      await p.locator('.escenari').screenshot({path: path.join(SHOTS, 'td-polinomi-mig.png')});
      await lliure(p);
      await p.locator('.escenari').screenshot({path: path.join(SHOTS, 'td-polinomi-final.png')});
    }
    ok(!consola.length, 'no console errors: ' + JSON.stringify(consola));
    await context.close();
  }
  await nav.close(); servidor.close();
  console.log(fallades ? `\n${fallades} FAILURES` : '\nALL BROWSER CHECKS PASSED');
})();
