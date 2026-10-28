// Browser checks for procediments/grafica-funcio.html. Usage: node procediments/proves/navegador/prova-grafica-funcio.js <repo> <katex-dist> <shots>
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
  await p.goto(`http://localhost:${servidor.address().port}/procediments/grafica-funcio.html${ruta}`);
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
  const pas = GraficaFuncio.passos(procediment.valors)[procediment.pas];
  const files = [...document.querySelectorAll('.pissarra > .capa > .fila')];
  const pis = document.querySelector('.pissarra');
  return {
    iguals: files.length === pas.files.length && files.every((f, i) => {
      const tex = pas.files[i];
      if (tex && tex.startsWith('<svg')) return f.innerHTML === norm(tex) && f.className === 'fila figura' + (pas.classes[i] ? ' ' + pas.classes[i] : '');
      if (tex && tex.startsWith('§')) {                 // fila de text: les frases, amb la seva marca
        const esperat = [...tex.matchAll(/\{\{([^|]*)\|([^|]*)\|/g)].filter(m => m[1]).map(m => m[1] + ':' + m[2]).join();
        const real = [...f.querySelectorAll('[data-k]')].map(e => e.dataset.k + ':' + e.className.replace('frase', '').replace('marca-', '').trim()).join();
        return esperat === real && f.className === 'fila text' + (pas.classes[i] ? ' ' + pas.classes[i] : '');
      }
      return f.innerHTML === (tex ? norm(katex.renderToString(tex, O)) : '') && f.className === 'fila' + (pas.classes[i] ? ' ' + pas.classes[i] : '');
    }),
    desborda: Math.max(pis.scrollWidth - pis.clientWidth, document.documentElement.scrollWidth - innerWidth),
  };
});
(async () => {
  await new Promise(r => servidor.listen(0, r));
  const nav = await chromium.launch();
  {
    // Portàtil (1366 × 700): cada pas acaba a la pissarra esperada, la pissarra creix cap avall i es veu la fila nova,
    // i els botons no es mouen d'un pas a l'altre (pissarraCreix).
    const {p, context, consola} = await obre(nav, '', {width: 1366, height: 700});
    ok(await p.textContent('h1') === 'Gràfica d\'una funció', 'h1');
    await p.selectOption('#velocitat', '1.6');
    const n = await p.$$eval('.exemple', b => b.length);
    ok(n === 9, `${n} examples`);
    for (let e = 0; e < n; e++) {
      await p.evaluate(i => document.querySelectorAll('.exemple')[i].click(), e);
      await p.waitForTimeout(250);
      const total = await p.evaluate(() => procediment.total);
      let bons = 0, pitjor = 0, visibles = 0;
      const tops = new Set();
      for (let i = 1; i < total; i++) {
        await p.evaluate(() => procediment.seguent());
        if (e === 4 && [12, 40, 66].includes(i + 1)) { await p.waitForTimeout(700); await p.locator('.escenari').screenshot({path: path.join(SHOTS, `gf-ex5-pas${i + 1}-mig.png`)}); }
        await lliure(p);
        const s = await estat(p);
        if (s.iguals) bons++;
        pitjor = Math.max(pitjor, s.desborda);
        // L'última fila escrita es veu dins de la pissarra.
        if (await p.evaluate(() => {
          const e = document.querySelector('.escenari'), files = [...document.querySelectorAll('.pissarra > .capa > .fila')].filter(f => !f.hidden && f.innerHTML);
          const q = files[files.length - 1].getBoundingClientRect(), o = e.getBoundingClientRect();
          return q.top >= o.top - 2 && q.top <= o.bottom + 2;
        })) visibles++;
        tops.add(await p.evaluate(() => Math.round(document.querySelector('.controls').getBoundingClientRect().top)));
      }
      ok(bons === total - 1 && pitjor <= 0, `example ${e + 1}: ${bons}/${total - 1} animated steps end on the expected board, overflow ${pitjor}`);
      ok(visibles === total - 1, `example ${e + 1}: the last written row is visible after ${visibles}/${total - 1} steps`);
      ok(tops.size === 1, `example ${e + 1}: the player stays in place (${[...tops]})`);
      await p.screenshot({path: path.join(SHOTS, `gf-ex${e + 1}-final.png`)});
    }
    ok(await p.evaluate(() => location.search) === '?p=arrel-obliques', 'address follows the examples: ' + await p.evaluate(() => location.search));
    // El dibuix de l'últim pas (√(x² − 4)): la corba, les dues asímptotes obliqües i els quatre punts de la taula.
    const fig = await p.$eval('.fila.figura svg', s => ({corbes: s.querySelectorAll('.corba').length, asimptotes: s.querySelectorAll('.asimptota').length, punts: s.querySelectorAll('.punt-esbos').length, w: s.getBoundingClientRect().width}));
    ok(fig.corbes >= 1 && fig.asimptotes === 2 && fig.punts === 4 && fig.w >= 400, 'graph drawn: ' + JSON.stringify(fig));
    ok(!consola.length, 'no console errors: ' + JSON.stringify(consola));
    await context.close();
  }
  for (const [ruta, avis] of [['?p=no-existeix', /no existeix/], ['?p=quartica', null]]) {
    const {p, context} = await obre(nav, ruta);
    const t = await p.$eval('.avis', a => (a.hidden ? null : a.textContent));
    ok(avis ? avis.test(t || '') : t === null, `address ${ruta}: ${t}`);
    await context.close();
  }
  {
    const {p, context, consola} = await obre(nav, '', {width: 375, height: 760});
    let pitjor = 0, total = 0;
    const n = await p.$$eval('.exemple', b => b.length);
    for (let e = 0; e < n; e++) {
      await p.evaluate(i => document.querySelectorAll('.exemple')[i].click(), e);
      await p.waitForTimeout(200);
      const t = await p.evaluate(() => procediment.total);
      for (let i = 0; i < t; i += 3) { await p.evaluate(j => procediment.salta(j), i); pitjor = Math.max(pitjor, (await estat(p)).desborda); total++; }
    }
    ok(pitjor <= 0, `phone: ${total} steps without overflow (${pitjor})`);
    await p.evaluate(() => procediment.salta(999));
    await p.screenshot({path: path.join(SHOTS, 'gf-mobil-final.png')});
    ok(!consola.length, 'no console errors: ' + JSON.stringify(consola));
    await context.close();
  }
  await nav.close(); servidor.close();
  console.log(fallades ? `\n${fallades} FAILURES` : '\nALL BROWSER CHECKS PASSED');
})();
