// Mid-transition check (scratchpad only): no single-line ghost for a phrase wrapped over several lines.
// Usage: node prova-partides.js <repo> <katex-dist> <shots>
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
(async () => {
  await new Promise(r => servidor.listen(0, r));
  const nav = await chromium.launch();
  for (const [pagina, passos, exemples, amplades] of [['polinomi-condicions.html', 13, [0, 2, 4], [432, 330]], ['optimitzacio.html', 5, [0, 1, 2, 3, 4, 5], [375]], ['probabilitat-total.html', 9, [0, 3, 4], [432, 330]], ['bayes.html', 6, [0, 5], [375]]]) {
    for (const width of amplades) {
      const context = await nav.newContext({viewport: {width, height: 900}, deviceScaleFactor: 2});
      const p = await context.newPage();
      const consola = [];
      p.on('pageerror', e => consola.push(e.message));
      await p.route('https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/**', r => r.fulfill({path: path.join(KATEX, new URL(r.request().url()).pathname.split('/0.16.9/')[1])}));
      await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.fulfill({status: 200, contentType: 'text/css', body: ''}));
      await p.goto(`http://localhost:${servidor.address().port}/procediments/${pagina}`);
      await p.waitForTimeout(400);
      await p.selectOption('#velocitat', '1.6');
      let mostres = 0, dolentes = [], partides = 0;
      for (const e of exemples) {
        await p.evaluate(i => document.querySelectorAll('.exemple')[i].click(), e);
        await p.waitForTimeout(250);
        for (let i = 1; i < passos; i++) {
          await p.evaluate(() => { procediment.seguent(); });
          for (let t = 0; t < 8; t++) {
            await p.waitForTimeout(150);
            const r = await p.evaluate(() => {
              const trossos = el => [...el.getClientRects()].filter(q => q.width > 0.5 && q.height > 0.5).length;
              const mal = [];
              for (const f of document.querySelectorAll('.efectes .fantasma[data-de]')) {
                for (const el of document.querySelectorAll(`.pissarra .capa [data-k="${f.dataset.de}"]`)) if (trossos(el) > 1) mal.push(f.dataset.de);
              }
              const partides = [...document.querySelectorAll('.pissarra .capa .fila.text [data-k]')].filter(el => trossos(el) > 1).length;
              return {mal, partides, ocupat: procediment.ocupat};
            });
            mostres++;
            partides = Math.max(partides, r.partides);
            if (r.mal.length) dolentes.push(`ex${e + 1} pas ${i + 1}: ${r.mal}`);
            if (e === 0 && width === 432 && [2, 5, 9].includes(i + 1) && t === 3) await p.locator('.escenari').screenshot({path: path.join(SHOTS, `${pagina.split('.')[0]}-${width}-pas${i + 1}-mig.png`)});
            if (!r.ocupat && t > 1) break;
          }
          await p.waitForFunction(() => !procediment.ocupat, null, {timeout: 20000});
        }
      }
      ok(!dolentes.length && partides > 0 && !consola.length, `${pagina} @${width}px: ${mostres} samples, wrapped phrases seen ${partides}, single-line ghosts of wrapped phrases: ${dolentes.slice(0, 5).join(' | ') || 'none'}`);
      await context.close();
    }
  }
  await nav.close(); servidor.close();
  console.log(fallades ? `\n${fallades} FAILURES` : '\nALL CHECKS PASSED');
})();
