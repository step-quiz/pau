// Browser checks for procediments/recta-plans.html. Usage: node procediments/proves/navegador/prova-recta-plans.js <repo> <katex-dist> <shots>
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
  await p.goto(`http://localhost:${servidor.address().port}/procediments/recta-plans.html${ruta}`);
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
  const pas = RectaPlans.passos(procediment.valors)[procediment.pas];
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
    const {p, context, consola} = await obre(nav, '');
    ok(await p.textContent('h1') === 'Recta donada per dos plans', 'h1');
    await p.selectOption('#velocitat', '1.6');
    const n = await p.$$eval('.exemple', b => b.length);
    for (let e = 0; e < n; e++) {
      await p.evaluate(i => document.querySelectorAll('.exemple')[i].click(), e);
      await p.waitForTimeout(200);
      const total = await p.evaluate(() => procediment.total);
      let bons = 0, pitjor = 0;
      for (let i = 1; i < total; i++) {
        await p.evaluate(() => procediment.seguent());
        if (e === 0 && [4, 5, 6].includes(i + 1)) { await p.waitForTimeout(900); await p.locator('.escenari').screenshot({path: path.join(SHOTS, `rp-ex1-pas${i + 1}-mig.png`)}); }
        await lliure(p);
        const s = await estat(p);
        if (s.iguals) bons++;
        pitjor = Math.max(pitjor, s.desborda);
      }
      ok(bons === total - 1 && pitjor <= 0, `example ${e + 1}: ${bons}/${total - 1} animated steps end on the expected board, overflow ${pitjor}`);
      await p.screenshot({path: path.join(SHOTS, `rp-ex${e + 1}-final.png`), fullPage: true});
    }
    ok(await p.evaluate(() => location.search) === '?S=1,-2,1,0;2,1,-1,3', 'address follows the examples: ' + await p.evaluate(() => location.search));
    // The sketch (step 2) is drawn, inside the board width, with its labels.
    await p.evaluate(() => document.querySelectorAll('.exemple')[0].click());
    await p.waitForTimeout(200);
    await p.evaluate(() => procediment.salta(1));
    const fig = await p.$eval('.fila.figura svg', e => ({w: e.getBoundingClientRect().width, h: e.getBoundingClientRect().height, t: e.textContent}));
    ok(fig.w > 150 && fig.w <= 600 && fig.h > 50 && /π1/.test(fig.t) && /π2/.test(fig.t) && /n1/.test(fig.t) && /u/.test(fig.t), 'sketch drawn: ' + JSON.stringify(fig));
    await p.locator('.escenari').screenshot({path: path.join(SHOTS, 'rp-esquema.png')});
    ok(!consola.length, 'no console errors: ' + JSON.stringify(consola));
    await context.close();
  }
  for (const [ruta, avis, A] of [
    ['?S=2,1,0,4;0,1,2,2', null, '2,1,0,4;0,1,2,2'], ['?S=1,1,1,1;2,2,2,5', /paral·lels/, null], ['?S=1,1,1,1;2,2,2,2', /mateix pla/, null],
  ]) {
    const {p, context} = await obre(nav, ruta);
    const t = await p.$eval('.avis', a => (a.hidden ? null : a.textContent));
    const v = await p.evaluate(() => procediment.valors.S);
    ok(avis ? avis.test(t || '') : t === null && v === A, `address ${ruta}: ${t} ${v}`);
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
      for (let i = 0; i < t; i++) { await p.evaluate(j => procediment.salta(j), i); pitjor = Math.max(pitjor, (await estat(p)).desborda); total++; }
    }
    ok(pitjor <= 0, `phone: ${total} steps without overflow (${pitjor})`);
    await p.evaluate(() => document.querySelectorAll('.exemple')[3].click());
    await p.waitForTimeout(200);
    await p.evaluate(() => procediment.salta(99));
    await p.screenshot({path: path.join(SHOTS, 'rp-mobil-ex4-final.png'), fullPage: true});
    ok(await p.$$eval('.editor', e => e.every(x => x.hidden)) && await p.textContent('.exemples span') === 'Rectes:', 'no editor; chips titled «Rectes:»');
    ok(!consola.length, 'no console errors: ' + JSON.stringify(consola));
    await context.close();
  }
  await nav.close(); servidor.close();
  console.log(fallades ? `\n${fallades} FAILURES` : '\nALL BROWSER CHECKS PASSED');
})();
