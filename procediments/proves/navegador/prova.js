// Browser checks for procediments/recta-tangent.html (scratchpad only, not shipped).
// Usage: node prova.js <repo-root> <katex-dist-dir> <shots-dir>
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const {chromium} = require('playwright');

const [ROOT, KATEX, SHOTS] = process.argv.slice(2);
fs.mkdirSync(SHOTS, {recursive: true});
const TIPUS = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png'};

const servidor = http.createServer((req, res) => {
  const ruta = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!ruta.startsWith(ROOT) || !fs.existsSync(ruta) || fs.statSync(ruta).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, {'content-type': TIPUS[path.extname(ruta)] || 'application/octet-stream'});
  fs.createReadStream(ruta).pipe(res);
});

let fallades = 0;
const ok = (cond, msg) => { console.log((cond ? '  ok  ' : '  ERR ') + msg); if (!cond) fallades++; };

async function obre(navegador, ruta, opcions = {}) {
  const context = await navegador.newContext(Object.assign({viewport: {width: 1000, height: 900}}, opcions.context || {}));
  const pagina = await context.newPage();
  const consola = [];
  pagina.on('console', m => { if (['error', 'warning'].includes(m.type())) consola.push(m.type() + ': ' + m.text()); });
  pagina.on('pageerror', e => consola.push('pageerror: ' + e.message));
  await pagina.route('https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/**', route => {
    if (opcions.senseKatex) return route.fulfill({status: 404, body: ''});
    const fitxer = path.join(KATEX, new URL(route.request().url()).pathname.split('/0.16.9/')[1]);
    route.fulfill({path: fitxer});
  });
  await pagina.route(/fonts\.(googleapis|gstatic)\.com/, route => route.fulfill({status: 200, contentType: 'text/css', body: ''}));
  await pagina.goto(`http://localhost:${servidor.address().port}/procediments/recta-tangent.html${ruta}`);
  // La pestanya de les dades és plegada per defecte (David): s'obre, com faria qui vol canviar les dades. I sense el pas 0
  // (l'enunciat a la bombolla): les comprovacions comencen al pas 1 (el pas 0 el prova prova-pas0.js).
  await pagina.evaluate(() => { document.querySelectorAll('details.targeta').forEach(d => { d.open = true; }); if (typeof procediment !== 'undefined') procediment.senseInici(); }).catch(() => {});
  await pagina.waitForTimeout(400);
  return {pagina, context, consola};
}

/** Waits until no transition is running. */
const esperaLliure = p => p.waitForFunction(() => !procediment.ocupat && !document.querySelector('.capa.nova') && !document.querySelector('.efectes').children.length, null, {timeout: 15000});

(async () => {
  await new Promise(r => servidor.listen(0, r));
  const navegador = await chromium.launch();

  /* 1. Default page: every step animates and ends exactly on the expected state. */
  {
    const {pagina, context, consola} = await obre(navegador, '');
    ok(await pagina.title() === 'Recta tangent, pas a pas — PAU Matemàtiques', 'title');
    ok(await pagina.textContent('h1') === 'Recta tangent', 'h1');
    ok((await pagina.textContent('.cami')).includes('Anàlisi'), 'breadcrumb with category');
    const n = await pagina.$$eval('.punt', ps => ps.length);
    ok(n === 18, `18 steps (${n})`);
    await pagina.screenshot({path: path.join(SHOTS, 'd-00-inici.png'), fullPage: true});
    await pagina.selectOption('#velocitat', '1.6');
    const comparacio = () => pagina.evaluate(() => {
      const O = {throwOnError: false, strict: 'ignore', trust: c => c.command === '\\htmlData'};
      const passos = RectaTangent.passos(procediment.valors);
      const pas = passos[procediment.pas];
      const files = [...document.querySelectorAll('.pissarra > .capa > .fila')];
      return {
        capes: document.querySelectorAll('.pissarra > .capa').length,
        files: files.length === pas.files.length && files.every((f, i) => f.innerHTML === (pas.files[i] ? katex.renderToString(pas.files[i], O) : '')),
        classes: files.every((f, i) => f.className === 'fila' + (pas.classes[i] ? ' ' + pas.classes[i] : '')),
        num: document.querySelector('.num-pas').textContent,
        desbordament: document.querySelector('.pissarra').scrollWidth - document.querySelector('.pissarra').clientWidth,
        opacitat: getComputedStyle(document.querySelector('.pissarra > .capa')).opacity,
        ocults: document.querySelectorAll('.pissarra [data-k]').length !== [...document.querySelectorAll('.pissarra [data-k]')].filter(e => getComputedStyle(e).visibility === 'visible').length,
      };
    });
    const shotsAt = {2: 'substitueix', 5: 'calcula-terme', 7: 'porta', 10: 'multiplica', 15: 'distribueix', 17: 'opera'};
    for (let i = 1; i < n; i++) {
      const t0 = Date.now();
      await pagina.click('.boto[aria-label="Pas següent"]');
      if (shotsAt[i + 1]) {
        await pagina.waitForTimeout(shotsAt[i + 1] === 'porta' ? 700 : 900);
        await pagina.locator('.escenari').screenshot({path: path.join(SHOTS, `d-${String(i + 1).padStart(2, '0')}-${shotsAt[i + 1]}-mig.png`)});
      }
      await esperaLliure(pagina);
      const c = await comparacio();
      ok(c.capes === 1 && c.files && c.classes && c.num === `Pas ${i + 1} de ${n}` && c.desbordament <= 0 && c.opacitat === '1' && !c.ocults,
        `step ${i + 1}: state ${JSON.stringify(c)} (${Date.now() - t0} ms)`);
    }
    await pagina.screenshot({path: path.join(SHOTS, 'd-18-final.png'), fullPage: true});
    ok(await pagina.$eval('.cursor', e => !e.classList.contains('visible')), 'cursor hidden at the end');

    // Jump back and forth with the dots and the keyboard.
    await pagina.click('.punt:nth-child(5)');
    ok(await pagina.evaluate(() => procediment.pas) === 4, 'dot jumps to step 5');
    await pagina.locator('body').press('ArrowRight');
    await esperaLliure(pagina);
    ok(await pagina.evaluate(() => procediment.pas) === 5, 'ArrowRight animates to step 6');
    await pagina.locator('body').press('ArrowLeft');
    ok(await pagina.evaluate(() => procediment.pas) === 4, 'ArrowLeft goes back to step 5');
    await pagina.evaluate(() => document.activeElement && document.activeElement.blur());
    await pagina.keyboard.press('Space');
    await pagina.waitForTimeout(300);
    ok(await pagina.getAttribute('.boto.principal', 'aria-label') === 'Atura', 'Space starts playing');
    await pagina.waitForTimeout(2500);
    await pagina.keyboard.press('Space');
    await esperaLliure(pagina);
    const pasAturat = await pagina.evaluate(() => procediment.pas);
    await pagina.waitForTimeout(2500);
    ok(await pagina.getAttribute('.boto.principal', 'aria-label') === 'Reprodueix' && pasAturat > 4 && await pagina.evaluate(() => procediment.pas) === pasAturat,
      `Space stops playing (at step ${pasAturat + 1})`);
    // Narrower window: the board font shrinks, the current step stays.
    const midaAbans = await pagina.$eval('.pissarra', e => e.style.getPropertyValue('--mida'));
    await pagina.setViewportSize({width: 420, height: 900});
    await pagina.waitForTimeout(700);
    const despres = await pagina.evaluate(() => [document.querySelector('.pissarra').style.getPropertyValue('--mida'), procediment.pas,
      document.querySelector('.pissarra').scrollWidth - document.querySelector('.pissarra').clientWidth, document.documentElement.scrollWidth - innerWidth]);
    ok(parseFloat(despres[0]) < parseFloat(midaAbans) && despres[1] === pasAturat && despres[2] <= 0 && despres[3] <= 0,
      `resize refits the board: ${midaAbans} → ${despres}`);
    ok(consola.length === 0, 'no console errors or warnings: ' + JSON.stringify(consola));
    await context.close();
  }

  /* 2. Address: plus sign, encoded text, errors. */
  for (const [ruta, esperat, avis] of [
    ['?f=x^3-3x+1&x0=-1', {a3: 1, a2: 0, a1: -3, a0: 1, x0: -1, m: 1, mode: 'tangent'}, null],
    ['?f=x%5E3-3x%2B1&x0=-1', {a3: 1, a2: 0, a1: -3, a0: 1, x0: -1, m: 1, mode: 'tangent'}, null],
    ['?f=2x^2+3x+1', {a3: 0, a2: 2, a1: 3, a0: 1, x0: 2, m: 1, mode: 'tangent'}, null],
    ['?f=x(x-5)&x0=3', {a3: 0, a2: 1, a1: -5, a0: 0, x0: 3, m: 1, mode: 'tangent'}, null],
    ['?f=ln(x)', {a3: 0, a2: 2, a1: -3, a0: 1, x0: 2, m: 1, mode: 'tangent'}, /no és un polinomi.*Et mostro l'exemple inicial/],
    ['?f=x^4&x0=1', {a3: 0, a2: 2, a1: -3, a0: 1, x0: 2, m: 1, mode: 'tangent'}, /grau 4/],
    ['?f=%E0%A4%A', {a3: 0, a2: 2, a1: -3, a0: 1, x0: 2, m: 1, mode: 'tangent'}, null],
    ['?utm_source=x', {a3: 0, a2: 2, a1: -3, a0: 1, x0: 2, m: 1, mode: 'tangent'}, null],
    ['?f=x^2-4x+5&x0=3&recta=normal', {a3: 0, a2: 1, a1: -4, a0: 5, x0: 3, m: 1, mode: 'normal'}, null],
    ['?f=x^3-3x&m=9', {a3: 1, a2: 0, a1: -3, a0: 0, x0: 2, m: 9, mode: 'pendent'}, null],
    ['?f=x^3&m=2', {a3: 0, a2: 2, a1: -3, a0: 1, x0: 2, m: 1, mode: 'tangent'}, /irracionals/],
  ]) {
    const {pagina, context, consola} = await obre(navegador, ruta);
    const valors = await pagina.evaluate(() => procediment.valors);
    const text = await pagina.$eval('.avis', e => (e.hidden ? null : e.textContent));
    ok(JSON.stringify(valors) === JSON.stringify(esperat) && (avis ? avis.test(text || '') : text === null) && !consola.length,
      `address ${ruta}: ${JSON.stringify(valors)} ${text || ''} ${consola.join(' ')}`);
    await context.close();
  }

  /* 3. Editor: arrows, holding, examples, validation, address update. */
  {
    const {pagina, context, consola} = await obre(navegador, '');
    const fletxa = (camp, sentit) => pagina.locator(`.fletxa[aria-label="${sentit} 1: ${camp}"]`);
    await fletxa('coeficient de x al quadrat', 'Puja').click();
    await pagina.waitForTimeout(700);
    ok(await pagina.evaluate(() => location.search) === '?f=3x^2-3x+1&x0=2', 'arrow ↑ updates the address: ' + await pagina.evaluate(() => location.search));
    ok((await pagina.textContent('.enunciat')).includes('3x'), 'statement regenerated');
    // Hold ↑ of the constant term: repeats up to 9 and stops.
    const caixa = await fletxa('terme independent', 'Puja').boundingBox();
    await pagina.mouse.move(caixa.x + caixa.width / 2, caixa.y + caixa.height / 2);
    await pagina.mouse.down();
    await pagina.waitForTimeout(2000);
    await pagina.mouse.up();
    await pagina.waitForTimeout(700);
    ok(await pagina.evaluate(() => procediment.valors.a0) === 9 && await fletxa('terme independent', 'Puja').isDisabled(), 'holding ↑ repeats and stops at 9');
    await fletxa('terme independent', 'Baixa').click();
    await pagina.waitForTimeout(700);
    ok(await pagina.evaluate(() => procediment.valors.a0) === 8, '↓ after holding ↑ works (no stuck repeat)');
    // Validation: a function that does not depend on x.
    for (const camp of ['coeficient de x al quadrat', 'coeficient de x']) {
      for (let i = 0; i < 9; i++) {
        const v = await pagina.evaluate(c => document.querySelector(`.valor[aria-label="${c}"]`).getAttribute('aria-valuenow'), camp);
        if (+v === 0) break;
        await fletxa(camp, +v > 0 ? 'Baixa' : 'Puja').click();
      }
    }
    await pagina.waitForTimeout(500);
    const error = await pagina.$eval('.error-editor', e => (e.hidden ? null : e.textContent));
    ok(/ha de dependre de x/.test(error || ''), 'validation message: ' + error);
    await pagina.screenshot({path: path.join(SHOTS, 'd-editor-error.png'), fullPage: true});
    // Example chip.
    await pagina.click('.exemple:nth-of-type(2)');
    await pagina.waitForTimeout(300);
    ok(await pagina.evaluate(() => location.search) === '?f=x^3-3x+1&x0=-1' && await pagina.$eval('.error-editor', e => e.hidden), 'example updates the address and clears the error');
    ok(consola.length === 0, 'no console errors: ' + JSON.stringify(consola));
    await context.close();
  }

  /* 4. Every example plays to the end on a phone, without horizontal scroll. */
  {
    const {pagina, context, consola} = await obre(navegador, '', {context: {viewport: {width: 375, height: 740}, deviceScaleFactor: 2, isMobile: true, hasTouch: true}});
    const amples = await pagina.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
    ok(amples[0] <= amples[1], 'no horizontal scroll at 375 px: ' + amples);
    await pagina.screenshot({path: path.join(SHOTS, 'm-00-inici.png'), fullPage: true});
    const exemples = await pagina.$$eval('.exemple', bs => bs.length);
    for (let e = 0; e < exemples; e++) {
      await pagina.evaluate(i => document.querySelectorAll('.exemple')[i].click(), e);
      await pagina.waitForTimeout(150);
      await pagina.selectOption('#velocitat', '1.6');
      const n = await pagina.evaluate(() => procediment.total);
      for (let i = 1; i < n; i++) {
        await pagina.evaluate(() => procediment.seguent());
        await esperaLliure(pagina);
      }
      const d = await pagina.evaluate(() => [document.querySelector('.pissarra').scrollWidth - document.querySelector('.pissarra').clientWidth, document.documentElement.scrollWidth - innerWidth, procediment.pas + 1, procediment.total]);
      ok(d[0] <= 0 && d[1] <= 0 && d[2] === d[3], `example ${e + 1} on a phone: overflow ${d[0]}/${d[1]}, step ${d[2]}/${d[3]}`);
      if (e === 1) await pagina.screenshot({path: path.join(SHOTS, 'm-final-exemple2.png'), fullPage: true});
    }
    ok(consola.length === 0, 'no console errors: ' + JSON.stringify(consola));
    await context.close();
  }

  /* 4b. Variants: the mode buttons choose the line, show the right fields and rewrite the address. */
  {
    const {pagina, context, consola} = await obre(navegador, '');
    const visibles = () => pagina.$$eval('.editor-fila', fs => fs.map(f => !f.hidden));
    ok(JSON.stringify(await visibles()) === '[true,true,false]', 'tangent: x0 row shown, m row hidden');
    await pagina.click('.mode:nth-of-type(2)');
    await pagina.waitForTimeout(600);
    ok(await pagina.evaluate(() => location.search) === '?f=2x^2-3x+1&x0=2&recta=normal' && await pagina.$eval('.mode:nth-of-type(2)', b => b.getAttribute('aria-pressed')) === 'true',
      'normal: address and pressed button: ' + await pagina.evaluate(() => location.search));
    ok((await pagina.textContent('.enunciat')).includes('recta normal'), 'normal: statement');
    await pagina.evaluate(() => procediment.salta(99));
    ok(await pagina.evaluate(() => RectaTangent.passos(procediment.valors).slice(-1)[0].text.includes('normal')), 'normal: last step');
    await pagina.click('.mode:nth-of-type(3)');
    await pagina.waitForTimeout(600);
    ok(await pagina.evaluate(() => location.search) === '?f=2x^2-3x+1&m=1' && JSON.stringify(await visibles()) === '[true,false,true]',
      'slope: address and fields: ' + await pagina.evaluate(() => location.search));
    await pagina.locator('.fletxa[aria-label="Puja 1: pendent m"]').click();
    await pagina.waitForTimeout(600);
    ok(await pagina.evaluate(() => location.search) === '?f=2x^2-3x+1&m=2', 'slope ↑ rewrites the address');
    // Every animated step of the variant examples ends on the expected board.
    await pagina.selectOption('#velocitat', '1.6');
    for (const e of [5, 7, 8, 10]) {
      await pagina.evaluate(i => document.querySelectorAll('.exemple')[i - 1].click(), e);
      await pagina.waitForTimeout(300);
      const total = await pagina.evaluate(() => procediment.total);
      let bons = 0;
      for (let i = 1; i < total; i++) {
        await pagina.evaluate(() => procediment.seguent());
        await pagina.waitForFunction(() => !procediment.ocupat && !document.querySelector('.capa.nova'), null, {timeout: 20000});
        const iguals = await pagina.evaluate(() => {
          const O = {throwOnError: false, strict: 'ignore', trust: c => c.command === '\\htmlData'};
          const norm = h => { const t = document.createElement('div'); t.innerHTML = h; return t.innerHTML; };
          const pas = RectaTangent.passos(procediment.valors)[procediment.pas];
          const files = [...document.querySelectorAll('.pissarra > .capa > .fila')];
          return files.every((f, k) => f.innerHTML === (pas.files[k] ? norm(katex.renderToString(pas.files[k], O)) : ''));
        });
        if (iguals) bons++;
      }
      ok(bons === total - 1, `variant example ${e}: ${bons}/${total - 1} animated steps end on the expected board`);
      if (e === 8) await pagina.screenshot({path: path.join(SHOTS, 'variant-pendent-final.png'), fullPage: true});
      if (e === 7) await pagina.screenshot({path: path.join(SHOTS, 'variant-normal-vertical.png'), fullPage: true});
    }
    ok(consola.length === 0, 'no console errors: ' + JSON.stringify(consola));
    await context.close();
  }

  /* 5. Without KaTeX: a clear message, no crash. */
  {
    const {pagina, context} = await obre(navegador, '', {senseKatex: true});
    const text = await pagina.textContent('#procediment');
    ok(/No s'ha pogut carregar KaTeX/.test(text), 'message when KaTeX is missing');
    await context.close();
  }

  await navegador.close();
  servidor.close();
  console.log(fallades ? `\n${fallades} FAILURES` : '\nALL BROWSER CHECKS PASSED');
  process.exitCode = fallades ? 1 : 0;
})();
