// Renders every Geometria sketch on one page, at the desktop and phone board sizes, for a visual check.
const {chromium} = require('playwright');
const path = require('path');
(async () => {
  const [arrel, sortida] = process.argv.slice(2);
  const b = await chromium.launch();
  const p = await b.newPage({viewport: {width: 900, height: 600}});
  await p.goto('file://' + path.resolve(arrel, 'procediments/pla.html'));
  await p.waitForTimeout(500);
  await p.evaluate(() => {
    document.body.innerHTML = '<div class="pissarra" style="--mida:30px;display:grid;grid-template-columns:1fr 1fr;gap:8px">'
      + Object.keys(Geometria.ESQUEMES).map(n => `<div class="fila figura" style="border:1px solid #ddd">${Geometria.esquema(n)}</div>`).join('')
      + '</div><div class="pissarra" style="--mida:22px;width:330px">' + `<div class="fila figura" style="border:1px solid #ddd">${Geometria.esquema('perpendicular')}</div></div>`;
  });
  await p.screenshot({path: sortida, fullPage: true});
  await b.close();
})();
