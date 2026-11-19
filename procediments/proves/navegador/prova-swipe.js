// Browser checks for the touch swipe: one finger right → left = next step, left → right = previous step
// (as the → and ← keys). Also what must NOT change the step: a short or mostly vertical gesture, a gesture that
// starts at the screen edge, two fingers, a data field, a wide row that can still scroll that way, a mouse.
// Usage: node procediments/proves/navegador/prova-swipe.js <repo> <katex-dist> <shots>
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

async function obre(nav, pagina, viewport) {
  const context = await nav.newContext({viewport, hasTouch: true, isMobile: viewport.width < 600});
  const p = await context.newPage();
  const consola = [];
  p.on('console', m => { if (['error', 'warning'].includes(m.type())) consola.push(m.text()); });
  p.on('pageerror', e => consola.push(e.message));
  await p.route('https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/**', r => r.fulfill({path: path.join(KATEX, new URL(r.request().url()).pathname.split('/0.16.9/')[1])}));
  await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.fulfill({status: 200, contentType: 'text/css', body: ''}));
  await p.goto(`http://localhost:${servidor.address().port}/procediments/${pagina}`);
  await p.waitForTimeout(500);
  const cdp = await context.newCDPSession(p);
  return {p, context, cdp, consola};
}
const lliure = async p => { for (let i = 0; i < 300 && await p.evaluate(() => procediment.ocupat); i++) await p.waitForTimeout(50); };
const lloc = p => p.evaluate(() => ({inici: procediment.inici, pas: procediment.pas, num: document.querySelector('.num-pas').textContent}));

/** Un gest amb un dit (o amb dos, si «segon» és donat) de (x1, y1) a (x2, y2), en 8 moviments, en uns 200 ms. */
async function gest(cdp, x1, y1, x2, y2, {segon = null, espera = 0} = {}) {
  const punts = (x, y) => {
    const v = [{x, y, id: 1}];
    if (segon) v.push({x: x + segon, y, id: 2});
    return v;
  };
  await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: punts(x1, y1)});
  const N = 8;
  for (let i = 1; i <= N; i++) {
    if (espera) await new Promise(r => setTimeout(r, espera / N));
    await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: punts(x1 + (x2 - x1) * i / N, y1 + (y2 - y1) * i / N)});
  }
  await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
}

async function prova(nav, pagina, viewport, etiqueta) {
  const {p, cdp, consola} = await obre(nav, pagina, viewport);
  const A = Math.round(viewport.width * 0.78), B = Math.round(viewport.width * 0.4);   // lluny de les vores
  const esquerra = (cdp, y = 300) => gest(cdp, A, y, B, y + 10);   // dit de dreta a esquerra
  const dreta = (cdp, y = 300) => gest(cdp, B, y, A, y + 10);      // dit d'esquerra a dreta
  const total = await p.evaluate(() => procediment.total);
  let l = await lloc(p);
  ok(l.inici && l.num === `Pas 0 de ${total}`, `${etiqueta}: starts at step 0`);

  // De dreta a esquerra: pas següent (del pas 0 al 1, i després al 2).
  await esquerra(cdp); await lliure(p);
  l = await lloc(p);
  ok(!l.inici && l.num === `Pas 1 de ${total}`, `${etiqueta}: swipe right→left at step 0 goes to step 1 (${l.num})`);
  await esquerra(cdp); await lliure(p);
  l = await lloc(p);
  ok(l.num === `Pas 2 de ${total}`, `${etiqueta}: swipe right→left goes to step 2 (${l.num})`);
  await esquerra(cdp); await lliure(p);
  await esquerra(cdp); await lliure(p);
  ok((await lloc(p)).num === `Pas 4 de ${total}`, `${etiqueta}: two more swipes → step 4`);

  // D'esquerra a dreta: pas anterior.
  await dreta(cdp);
  l = await lloc(p);
  ok(l.num === `Pas 3 de ${total}`, `${etiqueta}: swipe left→right goes back to step 3 (${l.num})`);
  await dreta(cdp); await dreta(cdp);
  l = await lloc(p);
  ok(l.num === `Pas 1 de ${total}`, `${etiqueta}: … and back to step 1 (${l.num})`);
  await dreta(cdp);
  l = await lloc(p);
  ok(l.inici && l.num === `Pas 0 de ${total}`, `${etiqueta}: swipe left→right from step 1 goes to step 0`);
  await dreta(cdp);
  ok((await lloc(p)).inici, `${etiqueta}: at step 0 another swipe left→right does nothing`);

  // El gest també atura la reproducció automàtica (com la fletxa →).
  await p.evaluate(() => document.querySelector('.boto[aria-label="Reprodueix"]').click());
  await p.waitForTimeout(100);
  await esquerra(cdp);
  await p.waitForTimeout(200);
  ok(await p.evaluate(() => !!document.querySelector('.boto[aria-label="Reprodueix"]')), `${etiqueta}: a swipe stops the autoplay`);
  await lliure(p);
  await p.evaluate(() => procediment.salta(2));
  const base = (await lloc(p)).num;

  // Gestos que NO han de canviar el pas.
  const igual = async (nom, fes) => {
    await fes(); await p.waitForTimeout(250); await lliure(p);
    ok((await lloc(p)).num === base, `${etiqueta}: ${nom} does nothing`);
  };
  await igual('a short swipe (30 px)', () => gest(cdp, 300, 300, 270, 300));
  await igual('a mostly vertical swipe', () => gest(cdp, 300, 200, 220, 360));
  await igual('a slow drag (> 900 ms)', () => gest(cdp, A, 300, B, 300, {espera: 1200}));
  await igual('a swipe that starts at the left edge', () => gest(cdp, 8, 300, 160, 300));
  await igual('a swipe that starts at the right edge', () => gest(cdp, viewport.width - 8, 300, viewport.width - 160, 300));
  await igual('a two-finger swipe', () => gest(cdp, A, 300, B, 300, {segon: 40}));
  await igual('a mouse drag', async () => { await p.mouse.move(400, 300); await p.mouse.down(); await p.mouse.move(250, 300, {steps: 6}); await p.mouse.up(); });

  // Una fila ampla que es desplaça de costat: el gest és per desplaçar-la, fins que ja no es pot més.
  await p.evaluate(() => {
    const d = document.createElement('div');
    d.id = 'prova-ample';
    d.style.cssText = 'position:fixed; left:40px; top:120px; width:300px; height:60px; overflow-x:auto; overflow-y:hidden; background:#eee; z-index:50';
    d.innerHTML = '<div style="width:900px; height:40px; background:linear-gradient(90deg,#fcc,#cfc)"></div>';
    document.body.append(d);
  });
  await igual('a swipe right→left on a wide row that can still scroll', () => gest(cdp, 300, 150, 100, 150));
  await p.evaluate(() => { const d = document.getElementById('prova-ample'); d.scrollLeft = d.scrollWidth; });
  await gest(cdp, 300, 150, 100, 150); await lliure(p);              // ja al final: ara sí canvia de pas
  ok((await lloc(p)).num === `Pas ${parseInt(base.slice(4)) + 1} de ${total}`, `${etiqueta}: at the end of the wide row the swipe changes the step again (${(await lloc(p)).num})`);
  await p.evaluate(() => procediment.salta(2));
  await gest(cdp, 100, 150, 300, 150);                                // cap a l'altre costat: la fila encara es pot desplaçar enrere
  await p.waitForTimeout(250);
  ok((await lloc(p)).num === base, `${etiqueta}: a swipe left→right on a wide row scrolled to the end scrolls it back (no step change)`);
  await p.evaluate(() => document.getElementById('prova-ample').remove());

  // El teclat segueix igual.
  await p.evaluate(() => procediment.salta(2));
  await p.keyboard.press('ArrowRight'); await lliure(p);
  ok((await lloc(p)).num === `Pas 4 de ${total}`, `${etiqueta}: the → key still goes to the next step`);
  await p.keyboard.press('ArrowLeft');
  ok((await lloc(p)).num === `Pas 3 de ${total}`, `${etiqueta}: the ← key still goes back`);
  await p.screenshot({path: path.join(SHOTS, `swipe-${etiqueta.replace(/\W+/g, '-')}.png`)});
  ok(consola.length === 0, `${etiqueta}: console clean ${consola.join(' | ').slice(0, 200)}`);
  await p.context().close();
}

(async () => {
  await new Promise(r => servidor.listen(0, r));
  const nav = await chromium.launch();
  await prova(nav, 'perpendicular-comuna.html', {width: 1024, height: 768}, 'tablet 1024×768');
  await prova(nav, 'area-eix.html', {width: 1366, height: 650}, 'laptop 1366×650 (area-eix)');
  await prova(nav, 'perpendicular-comuna.html', {width: 390, height: 844}, 'phone 390×844');

  // Un camp de dades: un gest que hi comença no canvia el pas.
  {
    const {p, cdp} = await obre(nav, 'recta-tangent.html', {width: 1024, height: 768});
    await p.evaluate(() => { const t = document.querySelector('details.targeta'); if (t) t.open = true; });
    await p.waitForTimeout(200);
    await p.evaluate(() => procediment.salta(2));
    const base = (await lloc(p)).num;
    const caixa = await p.$eval('[role="spinbutton"]', e => { const r = e.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2}; });
    await gest(cdp, caixa.x, caixa.y, caixa.x - 100, caixa.y);
    await p.waitForTimeout(250);
    ok((await lloc(p)).num === base, 'a swipe that starts on a data field does nothing');
    await p.context().close();
  }
  await nav.close();
  servidor.close();
  console.log(fallades ? `\n${fallades} FAILED` : '\nALL BROWSER CHECKS PASSED');
  process.exit(fallades ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
