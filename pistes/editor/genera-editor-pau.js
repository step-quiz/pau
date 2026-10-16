#!/usr/bin/env node
/* Genera l'HTML de l'artifact «Editor de pistes PAU».
   Ús:  node genera-editor-pau.js [carpeta-src] [plantilla.html] [sortida.html]
   Per defecte:  pistes/src   plantilla-editor-pau.html   editor-pau.html
   Llegeix cada pistes/src/<id>.tex, el trenca en trossos (text fix / contingut de \pista{...}) i
   incrusta el resultat a la plantilla, al lloc de  __DATA__ .
   Si el fitxer reconstruït no és idèntic a l'original, s'atura amb error. */
const fs = require('fs'), path = require('path');
const D = (process.argv[2] || 'pistes/src').replace(/\/?$/, '/');
const TPL = process.argv[3] || 'plantilla-editor-pau.html';
const OUT = process.argv[4] || 'editor-pau.html';
const ids = fs.readdirSync(D).filter(f => f.endsWith('.tex')).map(f => f.slice(0, -4)).sort();
const files = ids.map(id => {
  const s = fs.readFileSync(D + id + '.tex', 'utf8'); const segs = []; let last = 0;
  const re = /\\pista\{/g; let m;
  while ((m = re.exec(s))) {
    let j = m.index + m[0].length, d = 1;
    while (d && j < s.length) { const c = s[j]; if (c === '\\') { j += 2; continue; } d += (c === '{') - (c === '}'); j++; }
    const end = j - 1;
    segs.push(s.slice(last, m.index + m[0].length), s.slice(m.index + m[0].length, end)); last = end; re.lastIndex = j;
  }
  segs.push(s.slice(last));
  if (segs.join('') !== s) throw new Error('La reconstrucció no és idèntica: ' + id);
  const t = s.split('\n');
  const pro = (t.find(l => l.startsWith('% Procedència:')) || '').replace('% Procedència:', '').trim();
  const area = ((t[0] || '').split('·')[1] || '').trim();
  return { id, pro, area, segs };
});
const n = files.reduce((a, f) => a + (f.segs.length - 1) / 2, 0);
const data = JSON.stringify(files).replace(/</g, '\\u003c');
fs.writeFileSync(OUT, fs.readFileSync(TPL, 'utf8').replace('__DATA__', () => data));
console.log(files.length + ' fitxers, ' + n + ' pistes → ' + path.resolve(OUT));
