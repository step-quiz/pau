// Browser checks for procediments/determinant.html. Usage: node procediments/proves/navegador/prova-determinant.js <repo> <katex-dist> <shots>
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
  await p.goto(`http://localhost:${servidor.address().port}/procediments/determinant.html${ruta}`);
  await p.waitForTimeout(400);
  return {p, context, consola};
}
const lliure = p => p.waitForFunction(() => !procediment.ocupat && !document.querySelector('.capa.nova') && !document.querySelector('.efectes').children.length, null, {timeout: 20000});
const estat = p => p.evaluate(() => {
  const O = {throwOnError: false, strict: 'ignore', trust: c => c.command === '\\htmlData'};
  const norm = h => { const t = document.createElement('div'); t.innerHTML = h; return t.innerHTML; };   // mateixa serialització (&nbsp;)
  const pas = Determinant.passos(procediment.valors)[procediment.pas];
  const files = [...document.querySelectorAll('.pissarra > .capa > .fila')];
  const pis = document.querySelector('.pissarra');
  return {
    iguals: files.length === pas.files.length && files.every((f, i) => {
      const tex = pas.files[i];
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
    ok(await p.textContent('h1') === 'Determinant 3×3 amb un paràmetre (Sarrus)', 'h1');
    await p.selectOption('#velocitat', '1.6');
    const n = await p.$$eval('.exemple', b => b.length);
    for (let e = 0; e < n; e++) {
      await p.evaluate(i => document.querySelectorAll('.exemple')[i].click(), e);
      await p.waitForTimeout(200);
      const total = await p.evaluate(() => procediment.total);
      let bons = 0, pitjor = 0;
      for (let i = 1; i < total; i++) {
        await p.evaluate(() => procediment.seguent());
        if (e === 0 && [3, 6, 10, 15].includes(i + 1)) { await p.waitForTimeout(900); await p.locator('.escenari').screenshot({path: path.join(SHOTS, `det-ex1-pas${i + 1}-mig.png`)}); }
        await lliure(p);
        const s = await estat(p);
        if (s.iguals) bons++;
        pitjor = Math.max(pitjor, s.desborda);
      }
      ok(bons === total - 1 && pitjor <= 0, `example ${e + 1}: ${bons}/${total - 1} animated steps end on the expected board, overflow ${pitjor}`);
      await p.screenshot({path: path.join(SHOTS, `det-ex${e + 1}-final.png`), fullPage: true});
    }
    ok(await p.evaluate(() => location.search) === '?A=k,1,2;1,k,0;0,1,1', 'address follows the examples: ' + await p.evaluate(() => location.search));
    // The Sarrus marks are visible: step 3 marks the main diagonal in green.
    await p.evaluate(() => document.querySelectorAll('.exemple')[0].click());
    await p.waitForTimeout(200);
    await p.evaluate(() => procediment.salta(2));
    const marques = await p.$$eval('.pissarra [data-marca]', es => es.map(e => e.dataset.k + ':' + e.dataset.marca + ':' + getComputedStyle(e).backgroundColor));
    ok(marques.length === 3 && marques.every(m => /^a(11|22|33):mes:rgba\(16, 185, 129/.test(m)), 'main diagonal marked green: ' + marques.join(' '));
    await p.evaluate(() => procediment.salta(5));
    const marques2 = await p.$$eval('.pissarra [data-marca]', es => es.map(e => e.dataset.k + ':' + e.dataset.marca));
    ok(marques2.sort().join() === 'a13:menys,a22:menys,a31:menys', 'secondary diagonal marked red: ' + marques2.join(' '));
    await p.locator('.escenari').screenshot({path: path.join(SHOTS, 'det-marques.png')});
    ok(!consola.length, 'no console errors: ' + JSON.stringify(consola));
    await context.close();
  }
  for (const [ruta, avis, A] of [
    ['?A=m,1,1;1,m,1;1,1,m', null, 'm,1,1;1,m,1;1,1,m'], ['?A=1,2,3;0,m,1;1,0,2', null, '1,2,3;0,m,1;1,0,2'], ['?A=1,2,3;4,5,6;7,8,9', /paràmetre/, null],
    ['?A=m,1,0;1,m,1;0,1,m', /irracionals/, null], ['?A=t-1,2,1;1,t,1;1,1,t', null, 't-1,2,1;1,t,1;1,1,t'], ['?A=m%2C1%2C1%3B1%2Cm%2C1%3B1%2C1%2Cm', null, 'm,1,1;1,m,1;1,1,m'],
  ]) {
    const {p, context} = await obre(nav, ruta);
    const t = await p.$eval('.avis', a => (a.hidden ? null : a.textContent));
    const v = await p.evaluate(() => procediment.valors.A);
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
    await p.evaluate(() => document.querySelectorAll('.exemple')[2].click());
    await p.waitForTimeout(200);
    await p.evaluate(() => procediment.salta(99));
    await p.screenshot({path: path.join(SHOTS, 'det-mobil-ex3-final.png'), fullPage: true});
    ok(await p.$$eval('.editor', e => e.every(x => x.hidden)) && await p.textContent('.exemples span') === 'Matrius:', 'no editor; chips titled «Matrius:»');
    ok(!consola.length, 'no console errors: ' + JSON.stringify(consola));
    await context.close();
  }
  await nav.close(); servidor.close();
  console.log(fallades ? `\n${fallades} FAILURES` : '\nALL BROWSER CHECKS PASSED');
})();
