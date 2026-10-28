// Browser checks for the step 0 (the statement in the step bubble, then it flies to its place) and the page frame
// (header, two columns). Usage: node procediments/proves/navegador/prova-pas0.js <repo> <katex-dist> <shots>
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
async function obre(nav, pagina, viewport = {width: 1366, height: 650}) {
  const context = await nav.newContext({viewport});
  const p = await context.newPage();
  const consola = [];
  p.on('console', m => { if (['error', 'warning'].includes(m.type())) consola.push(m.text()); });
  p.on('pageerror', e => consola.push(e.message));
  await p.route('https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/**', r => r.fulfill({path: path.join(KATEX, new URL(r.request().url()).pathname.split('/0.16.9/')[1])}));
  await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.fulfill({status: 200, contentType: 'text/css', body: ''}));
  await p.goto(`http://localhost:${servidor.address().port}/procediments/${pagina}`);
  await p.waitForTimeout(500);
  return {p, context, consola};
}
const lliure = async p => { for (let i = 0; i < 200 && await p.evaluate(() => procediment.ocupat); i++) await p.waitForTimeout(50); };
const estat = p => p.evaluate(() => ({
  num: document.querySelector('.num-pas').textContent,
  text: document.querySelector('.text-pas').textContent,
  enunciat: document.querySelector('.enunciat').textContent,
  espera: document.querySelector('.enunciat').classList.contains('en-espera'),
  files: [...document.querySelectorAll('.pissarra > .capa > .fila')].filter(f => f.innerHTML && !f.hidden).length,
  inici: procediment.inici, pas: procediment.pas,
  anteriorDesactivat: document.querySelector('.boto[aria-label="Pas anterior"]').disabled,
}));

(async () => {
  await new Promise(r => servidor.listen(0, r));
  const nav = await chromium.launch();
  {
    const {p, context, consola} = await obre(nav, 'perpendicular-comuna.html');
    // La capçalera: el botó a l'esquerra del títol, fons gris fosc, més baixa.
    const cap = await p.evaluate(() => {
      const h = document.querySelector('.capcalera'), t = document.querySelector('.torna'), h1 = document.querySelector('h1');
      return {alt: h.getBoundingClientRect().height, esquerra: t.getBoundingClientRect().right <= h1.getBoundingClientRect().left,
        fons: getComputedStyle(h).backgroundColor, boto: getComputedStyle(t).backgroundColor, cami: document.querySelector('.cami').getBoundingClientRect().height};
    });
    ok(cap.alt <= 46 && cap.esquerra && cap.fons === 'rgb(55, 65, 81)' && cap.boto === 'rgb(255, 255, 255)' && cap.cami <= 1, 'header: ' + JSON.stringify(cap));
    await p.hover('.torna');
    await p.waitForTimeout(250);
    ok(await p.$eval('.torna', t => getComputedStyle(t).backgroundColor) === 'rgb(0, 0, 0)', 'back button turns black on hover');
    // Pas 0.
    const total = await p.evaluate(() => procediment.total);
    let e = await estat(p);
    ok(e.num === `Pas 0 de ${total}` && e.inici && e.espera && e.files === 0 && e.text === e.enunciat && e.anteriorDesactivat,
      'step 0: the statement is in the bubble, the board is empty: ' + JSON.stringify(e).slice(0, 200));
    await p.screenshot({path: path.join(SHOTS, 'pas0-inici.png')});
    // Del pas 0 al pas 1: l'enunciat vola.
    await p.click('.boto[aria-label="Pas següent"]');
    await p.waitForTimeout(300);
    const volant = await p.evaluate(() => { const v = document.querySelector('.enunciat-volant'); return v ? v.getBoundingClientRect().top : null; });
    await p.screenshot({path: path.join(SHOTS, 'pas0-volant.png')});
    await lliure(p);
    e = await estat(p);
    const dest = await p.$eval('.enunciat', x => x.getBoundingClientRect().top);
    ok(volant !== null && !e.inici && e.num === `Pas 1 de ${total}` && !e.espera && e.files > 0 && !await p.$('.enunciat-volant'),
      `step 0 → 1: the statement flies (top ${volant} → ${Math.round(dest)}) and step 1 is written`);
    await p.screenshot({path: path.join(SHOTS, 'pas0-pas1.png')});
    await p.click('.boto[aria-label="Pas anterior"]');
    e = await estat(p);
    ok(e.inici && e.num === `Pas 0 de ${total}` && e.files === 0, 'previous from step 1 goes back to step 0');
    await p.click('.boto[aria-label="Pas següent"]'); await lliure(p);
    await p.click('.boto[aria-label="Pas següent"]'); await lliure(p);
    e = await estat(p);
    ok(!e.inici && e.num === `Pas 2 de ${total}`, 'then step 2');
    await p.click('.punt:nth-child(5)');
    ok((await estat(p)).num === `Pas 5 de ${total}`, 'a dot jumps to its step');
    await p.click('.boto[aria-label="Torna a començar"]').catch(async () => p.evaluate(() => document.querySelector('.reproductor .boto').click()));
    e = await estat(p);
    ok(e.inici && e.num === `Pas 0 de ${total}`, 'restart goes to step 0');
    // Dues columnes: la columna del reproductor, a l'esquerra; la pissarra, a la dreta.
    const col = await p.evaluate(() => ({lateral: document.querySelector('.lateral').getBoundingClientRect().left, pissarra: document.querySelector('.escenari').getBoundingClientRect().left,
      caixa: getComputedStyle(document.querySelector('.explicacio')).backgroundColor, targeta: getComputedStyle(document.querySelector('.targeta')).backgroundColor,
      plegada: !document.querySelector('details.targeta').open}));
    ok(col.lateral < col.pissarra && col.caixa === 'rgb(255, 255, 255)' && col.targeta !== 'rgb(255, 255, 255)' && col.plegada, 'two columns, boxed step, coloured closed tab: ' + JSON.stringify(col));
    ok(!consola.length, 'no console errors: ' + JSON.stringify(consola));
    await context.close();
  }
  {
    // Si l'enunciat és a la pissarra (Optimització), no hi ha pas 0.
    const {p, context} = await obre(nav, 'optimitzacio.html');
    const e = await estat(p);
    ok(!e.inici && e.num.startsWith('Pas 1 de'), 'no step 0 when the statement is on the board: ' + e.num);
    await context.close();
  }
  await nav.close();
  servidor.close();
  console.log(fallades ? `\n${fallades} FAILURES` : '\nALL BROWSER CHECKS PASSED');
  process.exitCode = fallades ? 1 : 0;
})();
