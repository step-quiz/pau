// Genera l'artifact «Frases dels procediments» (vegeu EDITOR-FRASES.md, al costat).
//
//   node procediments/frases/genera-editor-frases.js <katex/dist> <carpeta de sortida>
//
// <katex/dist> ha de ser KaTeX 0.16.9, la mateixa versió que carreguen les pàgines i l'artifact
// (npm pack katex@0.16.9 → package/dist). A la sortida hi deixa:
//   index.html   la pàgina (plantilla + CSS de KaTeX amb les fonts woff2 incrustades)
//   frases.json  totes les frases (textos dels passos) i les pissarres de tots els exemples de totes les DEMO
// Tot es publica junt amb l'eina Artifact (file_path = index.html, files = {"frases.json": …}).
// Abans d'escriure res, comprova que KaTeX pot dibuixar totes les fórmules (si no, s'atura).
const fs = require('fs'), vm = require('vm'), path = require('path');
const [KATEX, OUT] = process.argv.slice(2);
if (!KATEX || !OUT) { console.error('Ús: node genera-editor-frases.js <katex/dist> <carpeta de sortida>'); process.exit(2); }
const DIR = path.join(__dirname, '..');           // procediments/

// ── 1. Els procediments, carregats com al navegador ──────────────────────────────────────────────
const FITXERS = ['mates.js', 'formules.js', 'dades.js', 'matrius.js', 'recta-tangent.js', 'extrems.js', 'creixement.js', 'optimitzacio.js',
  'polinomi-condicions.js', 'bolzano.js', 'asimptotes.js', 'arbres.js', 'probabilitat-total.js', 'bayes.js', 'binomial.js', 'determinant.js',
  'rang.js', 'sistema-sci.js', 'discussio.js', 'inversa.js', 'equacio-matricial.js', 'esglaonar.js', 'geometria.js', 'pla.js', 'recta-plans.js',
  'recta-pla.js', 'dues-rectes.js', 'distancies.js', 'projeccions.js', 'area-volum.js', 'perpendicular-comuna.js', 'primitiva.js', 'barrow.js',
  'grafiques.js', 'integrals.js', 'area-eix.js', 'area-corbes.js', 'area-parametre.js'];
for (const f of FITXERS) vm.runInThisContext(fs.readFileSync(path.join(DIR, f), 'utf8'), {filename: f});

// L'ordre del menú DEMO de l'index (categoria → [[fitxer, títol], …]).
const index = fs.readFileSync(path.join(DIR, '..', 'index.html'), 'utf8');
const demos = eval('(' + /const DEMOS = (\{[\s\S]*?\n\});/.exec(index)[1] + ')');
const GLOBALS = {'recta-tangent': 'RectaTangent', 'creixement': 'Creixement', 'extrems': 'Extrems', 'polinomi-condicions': 'PolinomiCondicions',
  'optimitzacio': 'Optimitzacio', 'asimptotes': 'Asimptotes', 'bolzano': 'Bolzano', 'primitiva': 'Primitiva', 'barrow': 'Barrow', 'area-eix': 'AreaEix',
  'area-corbes': 'AreaCorbes', 'area-parametre': 'AreaParametre', 'probabilitat-total': 'ProbabilitatTotal', 'bayes': 'Bayes', 'binomial': 'Binomial',
  'determinant': 'Determinant', 'rang': 'Rang', 'inversa': 'Inversa', 'equacio-matricial': 'EquacioMatricial', 'discussio': 'Discussio',
  'sistema-sci': 'SistemaSCI', 'esglaonar': 'Esglaonar', 'pla': 'Pla', 'recta-plans': 'RectaPlans', 'recta-pla': 'RectaPla', 'dues-rectes': 'DuesRectes',
  'distancies': 'Distancies', 'projeccions': 'Projeccions', 'area-volum': 'AreaVolum', 'perpendicular-comuna': 'PerpendicularComuna'};
const CAT = {algebra: 'Àlgebra', geometria: 'Geometria', analisi: 'Càlcul', probabilitat: 'Probabilitat'};

// ── 2. Les pissarres sense claus ─────────────────────────────────────────────────────────────────
// \htmlData{k=…,marca=M}{X} → X (amb el color de fons de la marca, com a la pàgina); files de text sense {{clau|marca|…}}.
const COLORS = {mes: 'cfeee2', menys: 'f9d4d4', tria: 'faeab0', solucio: 'e3dcf2', actual: 'e3dcf2', cami0: 'd4e3fc', cami1: 'f7d3e5', cami2: 'cdf0f6'};
function senseClaus(tex) {
  let s = '', i = 0;
  while (i < tex.length) {
    const j = tex.indexOf('\\htmlData{', i);
    if (j < 0) { s += tex.slice(i); break; }
    s += tex.slice(i, j);
    const fi = tex.indexOf('}', j);
    const marca = (/marca=(\w+)/.exec(tex.slice(j + 10, fi)) || [])[1];
    let k = fi + 1, n = 0;
    const ini = k;
    do { if (tex[k] === '\\') k++; else if (tex[k] === '{') n++; else if (tex[k] === '}') n--; k++; } while (n > 0 && k < tex.length);
    const dins = senseClaus(tex.slice(ini + 1, k - 1));
    s += marca && COLORS[marca] ? `\\colorbox{#${COLORS[marca]}}{$${dins}$}` : `{${dins}}`;
    i = k;
  }
  return s;
}
const textNet = t => t.slice(1).replace(/\{\{[^|}]*\|[^|}]*\|([^}]*)\}\}/g, '$1');

const taula = [], lloc = new Map();
const fila = tex => {
  if (!tex) return -1;
  const net = tex.startsWith('<svg') ? tex : tex.startsWith('§') ? '§' + textNet(tex) : senseClaus(tex);
  if (!lloc.has(net)) { lloc.set(net, taula.length); taula.push(net); }
  return lloc.get(net);
};

// ── 3. Tots els exemples de totes les DEMO ───────────────────────────────────────────────────────
const pagines = [];
let passosTotals = 0;
for (const [cat, llista] of Object.entries(demos)) {
  for (const [id, titol] of llista) {
    const P = globalThis[GLOBALS[id]];
    if (!P) throw new Error('No trobo el procediment ' + id + ' (afegiu-lo a GLOBALS i FITXERS)');
    const casos = [], vist = new Set();
    const afegeix = v => { const k = JSON.stringify(v); if (!vist.has(k)) { vist.add(k); casos.push(v); } };
    for (const e of P.exemples || []) afegeix(Object.assign({}, P.perDefecte || {}, e));
    if (P.modes) for (const o of P.modes.opcions) for (const e of P.exemples || []) afegeix(Object.assign({}, P.perDefecte || {}, e, {[P.modes.id]: o.valor}));
    const exemples = [];
    for (const v of casos) {
      if (P.valida && P.valida(v)) continue;
      const passos = P.passos(v);
      passosTotals += passos.length;
      const mode = P.modes ? (P.modes.opcions.find(o => o.valor === v[P.modes.id]) || {}).nom : '';
      exemples.push({
        nom: P.nomExemple ? P.nomExemple(v) : (P.resum ? P.resum(v) : JSON.stringify(v)),
        tex: !P.nomExemple,                                   // el nom és TeX (resum) o text pla (nomExemple)
        mode: mode || '',
        adreca: P.escriuAdreca ? new URLSearchParams(P.escriuAdreca(v)).toString()
          .replace(/%2C/g, ',').replace(/%5E/g, '^').replace(/%2F/g, '/').replace(/%3B/g, ';') : '',
        enunciat: P.enunciat ? P.enunciat(v) : '',
        passos: passos.map(p => ({t: p.text, f: p.files.map(fila), c: p.classes.map(c => c || '')})),
      });
    }
    pagines.push({id, titol, cat, categoria: CAT[cat], exemples});
  }
}

// ── 4. KaTeX ha de poder dibuixar-ho tot ─────────────────────────────────────────────────────────
const katex = require(path.resolve(KATEX, 'katex.js'));
if (katex.version !== '0.16.9') throw new Error('Cal KaTeX 0.16.9 (és la que carrega la pàgina); aquesta és ' + katex.version);
let errors = 0, formules = 0;
const prova = (tex, on) => {
  formules++;
  try { katex.renderToString(tex, {throwOnError: true, strict: 'ignore'}); }
  catch (e) { if (errors++ < 20) console.error('KaTeX:', on, '·', e.message.slice(0, 160)); }
};
const provaText = (t, on) => { for (const m of t.matchAll(/\$([^$]+)\$/g)) prova(m[1], on); if ((t.match(/\$/g) || []).length % 2) { errors++; console.error('$ sense parella:', on); } };
taula.forEach((t, i) => t.startsWith('<svg') ? 0 : t.startsWith('§') ? provaText(t.slice(1), 'fila ' + i) : prova(t, 'fila ' + i));
for (const p of pagines) p.exemples.forEach((e, ei) => {
  if (e.tex) prova(e.nom, `${p.id} nom ${ei}`);
  provaText(e.enunciat, `${p.id} enunciat ${ei}`);
  e.passos.forEach((s, si) => provaText(s.t, `${p.id} ex ${ei} pas ${si + 1}`));
});
if (errors) { console.error(errors + ' errors de KaTeX: no genero res.'); process.exit(1); }

// ── 5. La pàgina: la plantilla amb el CSS de KaTeX (fonts woff2 com a data:, l'artifact no en pot carregar d'enlloc més) ──
let css = fs.readFileSync(path.join(KATEX, 'katex.min.css'), 'utf8');
css = css.replace(/src:url\(fonts\/([\w-]+)\.woff2\) format\("woff2"\)[^}]*/g, (_, nom) =>
  `src:url(data:font/woff2;base64,${fs.readFileSync(path.join(KATEX, 'fonts', nom + '.woff2')).toString('base64')}) format("woff2")`);
if (/url\(fonts\//.test(css)) throw new Error('Queda alguna font sense incrustar al CSS de KaTeX');
const plantilla = fs.readFileSync(path.join(__dirname, 'plantilla-editor-frases.html'), 'utf8');
if (!plantilla.includes('/*__KATEX_CSS__*/')) throw new Error('La plantilla no té el marcador /*__KATEX_CSS__*/');

fs.mkdirSync(OUT, {recursive: true});
const generat = new Date().toISOString().slice(0, 10);
fs.writeFileSync(path.join(OUT, 'frases.json'), JSON.stringify({generat, files: taula, pagines}));
fs.writeFileSync(path.join(OUT, 'index.html'), plantilla.replace('/*__KATEX_CSS__*/', () => css));
const kb = f => Math.round(fs.statSync(path.join(OUT, f)).size / 1024) + ' kB';
console.log(`${pagines.length} pàgines, ${passosTotals} passos, ${taula.length} files de pissarra diferents, ${formules} fórmules comprovades`);
console.log(`→ ${path.join(OUT, 'index.html')} (${kb('index.html')}), frases.json (${kb('frases.json')})`);
