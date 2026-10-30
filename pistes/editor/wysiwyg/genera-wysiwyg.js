#!/usr/bin/env node
// Ús: node pistes/editor/wysiwyg/genera-wysiwyg.js <repo> <katex-dist> <plantilla.html> <tex-core.js> <sortida/>
const fs = require('fs'), path = require('path');
const [REPO, KATEX, TPL, CORE, OUT] = process.argv.slice(2);
global.katex = require(path.join(KATEX, '..'));
require(path.resolve(CORE)); const T = globalThis.TexCore;
const idx = fs.readFileSync(path.join(REPO, 'index.html'), 'utf8');
const a = idx.indexOf('const EXERS = {'), b = idx.indexOf('}; // fi EXERS');
const EXERS = Function('return ' + idx.slice(a + 'const EXERS = '.length, b + 1))();
const DATA = []; let nh = 0, nf = 0;
for (const [cat, list] of Object.entries(EXERS)) for (const ex of list) {
  const s = fs.readFileSync(path.join(REPO, 'pistes/src', ex.id + '.tex'), 'utf8');
  const info = (/\\pistainfo\{([^}]*)\}\{([^}]*)\}\{([^}]*)\}/.exec(s) || []).slice(1);
  const d0 = s.indexOf('\\begin{document}') + '\\begin{document}'.length, d1 = s.lastIndexOf('\\end{document}');
  const hints = [], st = []; let last = d0; const re = /\\pista\{/g; re.lastIndex = d0; let m;
  while ((m = re.exec(s)) && m.index < d1) {
    const e = T.brace(s, m.index + 6); if (e < 0) throw new Error('claus ' + ex.id);
    st.push(s.slice(last, m.index));
    hints.push({ src: s.slice(m.index + 7, e - 1) }); last = e; re.lastIndex = e;
  }
  st.push(s.slice(last, d1));
  hints.forEach((h, i) => {
    const subs = [...st[i].matchAll(/\\subsection\*\{/g)]; let lab = '';
    if (subs.length) { const u = subs[subs.length - 1], e = T.brace(st[i], u.index + 12), arg = st[i].slice(u.index + 13, e - 1);
      const mm = /^\s*(?:\\textit\{([^}]*)\}|([\d.]+[a-z]?\)?))/.exec(arg); lab = mm ? (mm[1] || mm[2]).replace(/\.$/, '') : ''; }
    h.label = lab || String(i + 1);
    if (T.join(T.tok(h.src)) !== h.src) throw new Error('roundtrip ' + ex.id + ' ' + i);
    const walk = ts => ts.forEach(t => { if (t.t === 'wrap') walk(t.kids); if (t.t === 'm' || t.t === 'D') { nf++; if (T.kx(t.tex, t.t === 'D').includes('kerr')) throw new Error('KaTeX ' + ex.id + ': ' + t.tex); } });
    walk(T.tok(h.src));
  });
  nh += hints.length;
  DATA.push({ id: ex.id, cat, any: ex.any, conv: ex.conv, ref: ex.ref, titol: ex.titol, info, st, hints });
}
let css = fs.readFileSync(path.join(KATEX, 'katex.min.css'), 'utf8');
css = css.replace(/src:url\(fonts\/([\w-]+)\.woff2\) format\("woff2"\)[^}]*/g, (_, nom) =>
  `src:url(data:font/woff2;base64,${fs.readFileSync(path.join(KATEX, 'fonts', nom + '.woff2')).toString('base64')}) format("woff2")`);
const icon = 'data:image/png;base64,' + fs.readFileSync(path.join(REPO, 'icon.png')).toString('base64');
let html = fs.readFileSync(TPL, 'utf8');
for (const k of ['/*__KATEX_CSS__*/', '/*__CORE__*/', '/*__DATA__*/null', '__ICON__']) if (!html.includes(k)) throw new Error('falta ' + k);
html = html.replace('/*__KATEX_CSS__*/', () => css).replace('/*__CORE__*/', () => fs.readFileSync(CORE, 'utf8'))
  .replace('/*__DATA__*/null', () => JSON.stringify(DATA).replace(/</g, '\\u003c')).replace('__ICON__', icon);
fs.mkdirSync(OUT, { recursive: true }); fs.writeFileSync(path.join(OUT, 'index.html'), html);
console.log(DATA.length + ' exercicis, ' + nh + ' pistes, ' + nf + ' fórmules de pistes OK → ' + (html.length / 1e6).toFixed(2) + ' MB');
