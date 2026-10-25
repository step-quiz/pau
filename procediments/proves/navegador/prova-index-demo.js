// Browser checks for the DEMO buttons of index.html. Usage: node procediments/proves/navegador/prova-index-demo.js <repo> [shots]
// comprova enllaços (existeixen), hover, que no s'obre la llista d'exercicis.
const {chromium} = require('playwright'); const path = require('path'); const fs = require('fs');
const arrel = path.resolve(process.argv[2]); const out = process.argv[3] || 'captures-index';
fs.mkdirSync(out, {recursive: true});
(async () => {
  const b = await chromium.launch(); let errors = 0; const fail = m => { errors++; console.log('FAIL', m); };
  for (const [w, h, nom] of [[1100, 800, 'escriptori'], [412, 900, 'mobil']]) {
    const p = await b.newPage({viewport: {width: w, height: h}});
    p.on('pageerror', e => fail('pageerror ' + e.message));
    await p.route(/^https?:/, r => r.abort());
    await p.goto('file://' + arrel + '/index.html');
    for (const cat of ['algebra', 'geometria', 'analisi', 'probabilitat']) {
      const btn = p.locator(`.demo-btn[data-demo=${cat}]`);
      const abans = await btn.evaluate(e => getComputedStyle(e).backgroundColor);
      await btn.hover(); await p.waitForTimeout(250);
      const despres = await btn.evaluate(e => getComputedStyle(e).backgroundColor);
      if (abans === despres) fail(`${cat}: hover sense canvi de fons`);
      if (cat === 'analisi') await p.screenshot({path: `${out}/${nom}-hover.png`});
      await btn.click();
      if (!await p.locator('#demo-dlg').evaluate(d => d.open)) fail(`${cat}: diàleg no obert`);
      if (await p.locator('#v-list').evaluate(v => v.classList.contains('active'))) fail(`${cat}: s'ha obert la llista d'exercicis`);
      const hrefs = await p.locator('#demo-llista a').evaluateAll(as => as.map(a => a.getAttribute('href')));
      for (const hr of hrefs) if (!fs.existsSync(path.join(arrel, hr))) fail(`${cat}: no existeix ${hr}`);
      console.log(` ok ${nom} ${cat}: ${hrefs.length} enllaços`);
      await p.screenshot({path: `${out}/${nom}-${cat}.png`});
      await p.keyboard.press('Escape');
      if (await p.locator('#demo-dlg').evaluate(d => d.open)) fail(`${cat}: Escape no tanca`);
    }
    // clic fora tanca; clic a la targeta (fora del botó) encara obre la llista
    await p.locator('.demo-btn[data-demo=algebra]').click();
    await p.mouse.click(5, 5);
    if (await p.locator('#demo-dlg').evaluate(d => d.open)) fail('clic fora no tanca');
    await p.locator('.cat-card[data-cat=algebra] h2').click();
    if (!await p.locator('#v-list').evaluate(v => v.classList.contains('active'))) fail('la targeta ja no obre la llista');
    await p.close();
  }
  // tots els .html de procediments/ hi són
  const src = fs.readFileSync(path.join(arrel, 'index.html'), 'utf8');
  for (const f of fs.readdirSync(path.join(arrel, 'procediments')).filter(f => f.endsWith('.html')))
    if (!src.includes(`'${f.replace('.html', '')}'`)) fail('falta a DEMOS: ' + f);
  await b.close();
  console.log(errors ? `${errors} FAILS` : 'ALL BROWSER CHECKS PASSED');
  process.exit(errors ? 1 : 0);
})();
