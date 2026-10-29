/* ═══════════════════════════════════════════════════════════════════
   domini.js — Procediment: el domini d'una funció
   ───────────────────────────────────────────────────────────────────
   Problemes fixos (sense editor; els botons trien el problema, ?p=<id>):
   polinomis, funcions racionals, arrels d'índex parell i senar, logaritmes
   i exponencials, i combinacions (√(x + 2)/(x − 1), ln x/(x − 2)…).
   Serveix també per practicar l'expressió d'un subconjunt de ℝ com a
   interval: cada condició s'acaba escrivint amb desigualtats i amb
   intervals (ℝ − {a} = (−∞, a) ∪ (a, +∞), x ≥ −1 ⟺ x ∈ [−1, +∞)…).

   El mètode (el de classe):
     1. Busca què pot fallar en calcular f(x): una fracció (denominador 0),
        una arrel d'índex parell (radicand negatiu), un logaritme (argument
        ≤ 0). Una arrel d'índex senar, l'exponencial i els polinomis no
        posen cap condició per si sols.
     2. Cada tros que pot fallar es marca a f i s'escriu la seva condició:
        denominador ≠ 0, radicand ≥ 0 (o > 0 si l'arrel és al denominador),
        argument > 0.
     3. Es resol cada condició:
          ≠  l'equació g = 0; els valors trobats són els prohibits;
          ≥ ó >, grau 1: s'aïlla x (la desigualtat canvia de sentit si es
              divideix per un nombre negatiu);
          ≥ ó >, grau 2: l'equació g = 0 talla la recta en trossos; una taula
              de signes (la paràbola) diu on es compleix la condició.
        El resultat es tradueix a intervals.
     4. Si hi ha dues condicions s'han de complir alhora: la intersecció.
        Una recta real dibuixada (conjunts amb punts oberts i tancats) ho mostra.
   Totes les línies que es veuen són certes: ho comprova proves/comprova.js.

   La pissarra té dotze files (FILA):
     0 f(x)        1 condició 1 (i la cadena d'equivalències)   2 equació g = 0   3 càlcul
     4 taula de signes   5…8 el mateix per a la condició 2   9 la recta real
     10 intersecció   11 el domini
   Claus: F… f(x); Gp<i> el tros que posa la condició i; C<i>g, C<i>r, C<i>z la
   condició i (g ≥ 0), C<i>L<k> els passos de la cadena; a… i b… l'equació
   de la condició 1 i de la 2 (Formules.resolEquacio; Ya…, Yb… la còpia que es queda);
   T<i>… la taula de signes; Ia, Ib, Ir la intersecció; V… el domini.
   ═══════════════════════════════════════════════════════════════════ */
(function (arrel) {
'use strict';

const M = arrel.Mates;
const F = arrel.Formules;
const Dd = arrel.Dades;
const {Fraccio, texNombre} = M;
const {clau: K, rel: R} = F;
const fr = (a, b = 1) => new Fraccio(a, b);


/* ── 1. ELS PROBLEMES ──────────────────────────────────────────────── */

/**
 * Una condició: tipus (fraccio, arrel, arrelDen, arrelSenarDen, log), g (text per llegir, de x), gt (TeX
 * tal com surt a f) i, per a les arrels, l'índex. A la fórmula de f, «@i» és el tros de la condició i.
 */
const C = (tipus, g, gt, extra = {}) => Object.freeze(Object.assign({tipus, g, gt}, extra));

const PROBLEMES = Object.freeze([
  {id: 'polinomi', nom: 'x³ − 3x + 1', f: 'x^{3} - 3x + 1', conds: [],
    motiu: 'És un polinomi: només té sumes, restes i productes, que es poden fer amb qualsevol nombre. No hi ha cap fracció, cap arrel ni cap logaritme que pugui fallar, i el domini és tot $\\mathbb{R}$.'},
  {id: 'fraccio-lineal', nom: '(x + 1)/(x − 2)', f: '\\dfrac{x + 1}{@0}', conds: [C('fraccio', 'x-2', 'x - 2')]},
  {id: 'fraccio-quadrat', nom: '1/(x² − 4)', f: '\\dfrac{1}{@0}', conds: [C('fraccio', 'x^2-4', 'x^{2} - 4')]},
  {id: 'fraccio-trinomi', nom: 'x/(x² − x − 2)', f: '\\dfrac{x}{@0}', conds: [C('fraccio', 'x^2-x-2', 'x^{2} - x - 2')]},
  {id: 'fraccio-sense-arrels', nom: 'x/(x² + 1)', f: '\\dfrac{x}{@0}', conds: [C('fraccio', 'x^2+1', 'x^{2} + 1')]},
  {id: 'arrel-lineal', nom: '√(x − 3)', f: '\\sqrt{@0}', conds: [C('arrel', 'x-3', 'x - 3', {index: 2})]},
  {id: 'arrel-negatiu', nom: '√(5 − 2x)', f: '\\sqrt{@0}', conds: [C('arrel', '5-2x', '5 - 2x', {index: 2})]},
  {id: 'arrel-cercle', nom: '√(1 − x²)', f: '\\sqrt{@0}', conds: [C('arrel', '1-x^2', '1 - x^{2}', {index: 2})]},
  {id: 'arrel-quadrat', nom: '√(x² − 4)', f: '\\sqrt{@0}', conds: [C('arrel', 'x^2-4', 'x^{2} - 4', {index: 2})]},
  {id: 'arrel-sempre', nom: '√(1 + x²)', f: '\\sqrt{@0}', conds: [C('arrel', '1+x^2', '1 + x^{2}', {index: 2})]},
  {id: 'arrel-quarta', nom: '⁴√(x² − 3x)', f: '\\sqrt[4]{@0}', conds: [C('arrel', 'x^2-3x', 'x^{2} - 3x', {index: 4})]},
  {id: 'arrel-denominador', nom: '1/√(x − 3)', f: '\\dfrac{1}{\\sqrt{@0}}', conds: [C('arrelDen', 'x-3', 'x - 3', {index: 2})]},
  {id: 'arrel-denominador-cercle', nom: '1/√(1 − x²)', f: '\\dfrac{1}{\\sqrt{@0}}', conds: [C('arrelDen', '1-x^2', '1 - x^{2}', {index: 2})]},
  {id: 'arrel-i-fraccio', nom: '√(x + 2)/(x − 1)', f: '\\dfrac{\\sqrt{@0}}{@1}',
    conds: [C('arrel', 'x+2', 'x + 2', {index: 2}), C('fraccio', 'x-1', 'x - 1')]},
  {id: 'arrel-cubica', nom: '∛(x − 1)', f: '\\sqrt[3]{x - 1}', conds: [],
    motiu: 'És una arrel cúbica, d\'índex senar: existeix per a qualsevol nombre, també per als negatius ($\\sqrt[3]{-8} = -2$). No posa cap condició, i el domini és tot $\\mathbb{R}$.'},
  {id: 'arrel-cubica-denominador', nom: '1/∛(x + 2)', f: '\\dfrac{1}{\\sqrt[3]{@0}}', conds: [C('arrelSenarDen', 'x+2', 'x + 2', {index: 3})]},
  {id: 'logaritme-lineal', nom: 'ln(x − 1)', f: '\\ln(@0)', conds: [C('log', 'x-1', 'x - 1')]},
  {id: 'logaritme-cercle', nom: 'ln(4 − x²)', f: '\\ln(@0)', conds: [C('log', '4-x^2', '4 - x^{2}')]},
  {id: 'logaritme-sempre', nom: 'ln(x² + 1)', f: '\\ln(@0)', conds: [C('log', 'x^2+1', 'x^{2} + 1')]},
  {id: 'logaritme-i-fraccio', nom: 'ln(x)/(x − 2)', f: '\\dfrac{\\ln(@0)}{@1}', conds: [C('log', 'x', 'x'), C('fraccio', 'x-2', 'x - 2')]},
  {id: 'exponencial', nom: 'e^(x² − 1)', f: 'e^{x^{2} - 1}', conds: [],
    intro: 'La funció exponencial es pot calcular per a qualsevol exponent: només cal mirar si l\'exponent té algun problema.',
    motiu: 'L\'exponent, $x^2 - 1$, és un polinomi: es pot calcular per a qualsevol $x$, i l\'exponencial també. No hi ha cap condició, i el domini és tot $\\mathbb{R}$.'},
  {id: 'exponencial-fraccio', nom: 'e^(1/x)', f: 'e^{\\dfrac{1}{@0}}', conds: [C('fraccio', 'x', 'x')],
    intro: 'La funció exponencial es pot calcular per a qualsevol exponent: només cal mirar si l\'exponent té algun problema.'},
  {id: 'exponencial-arrel', nom: '2^√x', f: '2^{\\sqrt{@0}}', conds: [C('arrel', 'x', 'x', {index: 2})],
    intro: 'La funció exponencial es pot calcular per a qualsevol exponent: només cal mirar si l\'exponent té algun problema.'},
].map(p => Object.freeze(p)));
const FIXOS = Dd.problemesFixos(PROBLEMES);
const {perId} = FIXOS;

const FILA = Object.freeze({f: 0, c0: 1, e0: 2, t0: 3, s0: 4, c1: 5, e1: 6, t1: 7, s1: 8, recta: 9, inter: 10, fi: 11});
const FILES = 12;
const BLOCS = Object.freeze([
  Object.freeze({cond: FILA.c0, eq: FILA.e0, tr: FILA.t0, sg: FILA.s0, P: 'a'}),
  Object.freeze({cond: FILA.c1, eq: FILA.e1, tr: FILA.t1, sg: FILA.s1, P: 'b'}),
]);


/* ── 2. CONJUNTS DE NOMBRES REALS ──────────────────────────────────── */
/* Una llista d'intervals {a, b, ca, cb}: a i b són Fraccio o null (−∞ o +∞); ca i cb diuen si l'extrem hi és. */

const TOT = Object.freeze([Object.freeze({a: null, b: null, ca: false, cb: false})]);

/** Interseccions de tots els parells d'intervals, en ordre. */
function interseccio(A, B) {
  const r = [];
  for (const x of A) for (const y of B) {
    let a, ca, b, cb;
    if (x.a === null) { a = y.a; ca = y.ca; } else if (y.a === null) { a = x.a; ca = x.ca; } else {
      const s = x.a.resta(y.a).signe();
      if (s > 0) { a = x.a; ca = x.ca; } else if (s < 0) { a = y.a; ca = y.ca; } else { a = x.a; ca = x.ca && y.ca; }
    }
    if (x.b === null) { b = y.b; cb = y.cb; } else if (y.b === null) { b = x.b; cb = x.cb; } else {
      const s = x.b.resta(y.b).signe();
      if (s < 0) { b = x.b; cb = x.cb; } else if (s > 0) { b = y.b; cb = y.cb; } else { b = x.b; cb = x.cb && y.cb; }
    }
    if (a !== null && b !== null) {
      const s = a.resta(b).signe();
      if (s > 0 || (s === 0 && !(ca && cb))) continue;
    }
    r.push({a, b, ca: a !== null && ca, cb: b !== null && cb});
  }
  return r.sort((p, q) => (p.a === null ? (q.a === null ? 0 : -1) : q.a === null ? 1 : p.a.resta(q.a).signe()));
}

/** Els trossos en què els zeros de g tallen la recta: intervals oberts i punts, amb el signe de g (1, −1 o 0). */
function columnes(termes, arrels) {
  const signe = x => M.valorTermes(termes, x).signe();
  const cols = [];
  const prova = (a, b) => (a === null && b === null ? fr(0) : a === null ? b.resta(1) : b === null ? a.suma(1) : a.suma(b).quocient(2));
  let esq = null;
  for (const r of arrels) {
    cols.push({t: 'int', a: esq, b: r, s: signe(prova(esq, r))}, {t: 'pt', x: r, s: 0});
    esq = r;
  }
  cols.push({t: 'int', a: esq, b: null, s: signe(prova(esq, null))});
  return cols;
}

/** Els trossos que compleixen la relació (ne: ≠ 0, ge: ≥ 0, gt: > 0), units quan són seguits. */
function conjuntDeColumnes(cols, relacio) {
  const serveix = c => (relacio === 'ne' ? c.t === 'int' : c.t === 'pt' ? relacio === 'ge' : c.s > 0);
  const S = [];
  let cur = null;
  for (const c of cols) {
    if (!serveix(c)) { cur = null; continue; }
    if (!cur) {
      cur = c.t === 'pt' ? {a: c.x, b: c.x, ca: true, cb: true} : {a: c.a, b: c.b, ca: false, cb: false};
      S.push(cur);
    } else if (c.t === 'pt') { cur.b = c.x; cur.cb = true; } else { cur.b = c.b; cur.cb = false; }
  }
  return S;
}

const SIGNE_RELACIO = Object.freeze({ne: '\\neq', ge: '\\ge', gt: '>', le: '\\le', lt: '<'});
const GIRA = Object.freeze({ge: 'le', gt: 'lt', le: 'ge', lt: 'gt', ne: 'ne'});

/** [a, b), (−∞, b], (a, +∞)…: l'interval en TeX. */
function texInterval(i) {
  const e = i.a === null ? '-\\infty' : texNombre(i.a), d = i.b === null ? '+\\infty' : texNombre(i.b);
  return `${i.a !== null && i.ca ? '[' : '('}${e},\\ ${d}${i.b !== null && i.cb ? ']' : ')'}`;
}
const texConjunt = S => S.map(texInterval).join(' \\cup ');

/** Si el conjunt és ℝ sense alguns punts (intervals oberts seguits), aquests punts; si no, null. */
function puntsExclosos(S) {
  if (S.length < 2 || S[0].a !== null || S[S.length - 1].b !== null) return null;
  const punts = [];
  for (let k = 0; k < S.length; k++) {
    if (S[k].ca && S[k].a !== null) return null;
    if (S[k].cb && S[k].b !== null) return null;
    if (k < S.length - 1) {
      if (!S[k].b || !S[k + 1].a || !S[k].b.igual(S[k + 1].a)) return null;
      punts.push(S[k].b);
    }
  }
  return punts;
}

const llistaTex = valors => {
  const t = valors.map(v => `$${texNombre(v)}$`);
  return t.length > 1 ? `${t.slice(0, -1).join(', ')} i ${t[t.length - 1]}` : t[0];
};
const llistaEq = valors => {
  const t = valors.map(v => `$x = ${texNombre(v)}$`);
  return t.length > 1 ? `${t.slice(0, -1).join(', ')} i ${t[t.length - 1]}` : t[0];
};

/** El conjunt, dit amb paraules (per a les explicacions). */
function paraules(S) {
  const ex = puntsExclosos(S);
  if (ex) return `tots els nombres reals menys ${llistaTex(ex)}`;
  const peces = S.map(i => {
    const [a, b] = [i.a && `$${texNombre(i.a)}$`, i.b && `$${texNombre(i.b)}$`];
    if (a === null && b === null) return 'tots els nombres reals';
    if (a === null) return `els nombres més petits ${i.cb ? 'o iguals ' : ''}que ${b}`;
    if (b === null) return `els nombres més grans ${i.ca ? 'o iguals ' : ''}que ${a}`;
    if (i.ca && i.cb) return `els nombres entre ${a} i ${b}, tots dos inclosos`;
    if (!i.ca && !i.cb) return `els nombres entre ${a} i ${b}, sense incloure'ls`;
    return `els nombres entre ${a} i ${b}; ${i.ca ? a : b} hi és, ${i.ca ? b : a} no`;
  });
  return peces.join(', o bé ');
}


/* ── 3. LA RECTA REAL (SVG) ────────────────────────────────────────── */

const AMPLE = 440, X0 = 70, X1 = 424, EL = 42;
const etiquetaNombre = x => (x.num < 0 ? '−' : '') + Math.abs(x.num) + (x.den > 1 ? '/' + x.den : '');

/**
 * Les rectes reals amb els conjunts: [{nom, S, dom}]. Els punts es reparteixen a parts iguals (és un esquema:
 * no és a escala); punt tancat = hi pertany, punt obert = no hi pertany. «nom» és el text de l'esquerra.
 */
function recta(linies) {
  const punts = [];
  for (const l of linies) for (const i of l.S) for (const e of [i.a, i.b]) if (e !== null && !punts.some(p => p.igual(e))) punts.push(e);
  punts.sort((p, q) => p.resta(q).signe());
  const n = punts.length;
  const posX = x => {
    const k = punts.findIndex(p => p.igual(x));
    return n <= 1 ? (X0 + X1) / 2 : Math.round(X0 + 34 + (X1 - X0 - 68) * k / (n - 1));
  };
  const alt = 22 + EL * linies.length + (n ? 26 : 0);
  let svg = '';
  punts.forEach(p => { svg += `<line class="discontinua" x1="${posX(p)}" y1="12" x2="${posX(p)}" y2="${alt - 22}"/>`; });
  linies.forEach((l, k) => {
    const y = 28 + EL * k;
    svg += `<g class="${l.dom ? 'conj-dom' : 'conj-cond'}"><line class="eix" x1="${X0 - 10}" y1="${y}" x2="${X1 + 10}" y2="${y}"/>`;
    for (const i of l.S) {
      const xa = i.a === null ? X0 - 10 : posX(i.a), xb = i.b === null ? X1 + 10 : posX(i.b);
      svg += `<line class="conj" x1="${xa}" y1="${y}" x2="${xb}" y2="${y}"/>`;
      if (i.a === null) svg += `<path class="punta-conj" d="M${xa - 2} ${y}L${xa + 9} ${y - 6}L${xa + 9} ${y + 6}Z"/>`;
      if (i.b === null) svg += `<path class="punta-conj" d="M${xb + 2} ${y}L${xb - 9} ${y - 6}L${xb - 9} ${y + 6}Z"/>`;
      if (i.a !== null) svg += `<circle class="${i.ca ? 'pt-tancat' : 'pt-obert'}" cx="${xa}" cy="${y}" r="5.5"/>`;
      if (i.b !== null) svg += `<circle class="${i.cb ? 'pt-tancat' : 'pt-obert'}" cx="${xb}" cy="${y}" r="5.5"/>`;
    }
    svg += `<text class="cat" x="2" y="${y + 5}">${l.nom}</text></g>`;
  });
  punts.forEach(p => { svg += `<text class="petit" text-anchor="middle" x="${posX(p)}" y="${alt - 6}">${etiquetaNombre(p)}</text>`; });
  return `<svg viewBox="0 0 ${AMPLE} ${alt}" xmlns="http://www.w3.org/2000/svg" role="img">${svg}</svg>`;
}


/* ── 4. UNA CONDICIÓ ───────────────────────────────────────────────── */

const RELACIO_DE = Object.freeze({fraccio: 'ne', arrel: 'ge', arrelDen: 'gt', arrelSenarDen: 'ne', log: 'gt'});

/** Una condició amb tot el que cal: la relació, els coeficients, les arrels i el conjunt on es compleix. */
function prepara(c) {
  const coefs = M.polinomi(M.llegeix(c.g));
  const termes = M.termes(coefs);
  const grau = termes.length ? termes[0].n : 0;
  if (grau < 1 || grau > 2) throw new Error(`domini: la condició «${c.g}» ha de ser de grau 1 o 2`);
  const trobades = M.arrelsRacionals(termes);
  if (trobades.irracionals) throw new Error(`domini: arrels irracionals a «${c.g}»`);
  const arrels = [];
  for (const r of trobades.arrels.map(x => Fraccio.de(x)).sort((p, q) => p.resta(q).signe())) if (!arrels.some(p => p.igual(r))) arrels.push(r);
  const relacio = RELACIO_DE[c.tipus];
  const cols = columnes(termes, arrels);
  const S = conjuntDeColumnes(cols, relacio);
  if (!S.length) throw new Error(`domini: la condició «${c.g}» no es compleix mai`);
  return Object.freeze(Object.assign({}, c, {coefs, termes, grau, arrels, relacio, cols, S}));
}

/** Per què hi ha una condició (el que es veu en marcar el tros). */
function textMarca(c) {
  const idx = c.index;
  switch (c.tipus) {
    case 'fraccio': return 'Hi ha una fracció, i no es pot dividir per $0$: el denominador ha de ser diferent de $0$.';
    case 'arrel': return idx === 2 ? 'Hi ha una arrel quadrada, i l\'arrel quadrada d\'un nombre negatiu no existeix: el que hi ha dins ha de ser més gran o igual que $0$.'
      : `Hi ha una arrel d'índex $${idx}$, que és parell: com l'arrel quadrada, no existeix per a un nombre negatiu. El que hi ha dins ha de ser més gran o igual que $0$.`;
    case 'arrelDen': return 'L\'arrel quadrada és al denominador: el que hi ha dins no pot ser negatiu (l\'arrel no existiria) ni $0$ (no es pot dividir per $0$). Ha de ser més gran que $0$.';
    case 'arrelSenarDen': return `Hi ha una arrel d'índex $${idx}$ al denominador. Aquesta arrel existeix per a qualsevol nombre, però no es pot dividir per $0$, i només val $0$ si el que hi ha dins val $0$: ha de ser diferent de $0$.`;
    case 'log': return 'Hi ha un logaritme, i només existeix per a nombres positius: el que hi ha dins ha de ser més gran que $0$ (el $0$ tampoc).';
    default: throw new Error(`domini: tipus «${c.tipus}»`);
  }
}

const texF = (p, marcat = -1) => p.f.replace(/@(\d)/g, (_, i) => K('Gp' + i, p.conds[+i].gt, +i === marcat ? 'tria' : ''));
const texFPla = p => p.f.replace(/@(\d)/g, (_, i) => p.conds[+i].gt);
const filaF = (p, marcat) => F.membreEsquerre('F', 'f', 'x') + texF(p, marcat);

/** La taula de signes de g: la capçalera (els trossos) i, a sota, els signes; «marcats»: els trossos que serveixen (verd). */
function taula(i, c, {signes = false, marcats = null} = {}) {
  const cap = c.cols.map((q, j) => K(`T${i}h${j}`, q.t === 'pt' ? texNombre(q.x) : texInterval({a: q.a, b: q.b, ca: false, cb: false})));
  const signeTex = q => (q.s > 0 ? '+' : q.s < 0 ? '-' : '0');
  const cos = c.cols.map((q, j) => (signes ? K(`T${i}s${j}`, signeTex(q), marcats && marcats[j] ? 'mes' : '') : ''));
  return `\\begin{array}{c|${c.cols.map(() => 'c').join('|')}} ${[K(`T${i}lx`, '\\boldsymbol{x}'), ...cap].join(' & ')} \\\\ \\hline ${[K(`T${i}lg`, c.gt), ...cos].join(' & ')} \\end{array}`;
}

/** Quina és la regla de signes d'una paràbola (text del pas de la taula). */
function textSignes(c) {
  const a = c.coefs[2];
  const positiu = a.signe() > 0;
  const amunt = `El coeficient de $x^2$ és ${positiu ? 'positiu' : 'negatiu'}: la paràbola és oberta cap ${positiu ? 'amunt' : 'avall'}`;
  if (c.arrels.length === 2) return `${amunt}, i és ${positiu ? 'positiva fora de les arrels i negativa entre elles' : 'negativa fora de les arrels i positiva entre elles'}. A les arrels val $0$.`;
  if (c.arrels.length === 1) return `${amunt}. Només toca l'eix $OX$ a $x = ${texNombre(c.arrels[0])}$ (val $0$) i als dos costats té el signe del coeficient de $x^2$.`;
  return `L'equació no té solucions: la paràbola no talla l'eix $OX$ i té el mateix signe a tot arreu, el del coeficient de $x^2$, que és ${positiu ? 'positiu' : 'negatiu'}.`;
}


/* ── 5. EL GUIÓ ────────────────────────────────────────────────────── */

const INTRO = 'El domini de $f$ és el conjunt de valors de $x$ per als quals es pot calcular $f(x)$. Busca què pot fallar: una divisió per $0$, l\'arrel d\'índex parell d\'un nombre negatiu o el logaritme d\'un nombre que no és positiu.';
const NOTA_CLAUDATOR = ' Un claudàtor vol dir que l\'extrem hi pertany; un parèntesi, que no hi pertany (als infinits, sempre parèntesi).';
const NOTA_UNIO = ' El símbol $\\cup$ (unió) uneix els intervals.';

/** Un bloc per condició: marcar el tros, escriure la condició, resoldre-la i dir-ne el resultat en forma d'interval. */
function bloc(g, p, c, i, nota) {
  const B = BLOCS[i];
  const symRel = SIGNE_RELACIO[c.relacio];
  const link0 = K(`C${i}g`, c.gt) + R(`C${i}r`, symRel) + K(`C${i}z`, '0');
  const links = [];
  const pinta = () => { g.files[B.cond] = F.enLinies(link0, links.map((t, k) => ` \\iff ${K(`C${i}L${k + 1}`, t)}`)); };
  const afegeixLink = (tex, text) => { links.push(tex); pinta(); g.afegeix(text); };
  const textInterval = (S, abans) => {
    let t = `${abans}$${texConjunt(S)}$.`;
    if (!nota.claudator) { t += NOTA_CLAUDATOR; nota.claudator = true; }
    if (S.length > 1 && !nota.unio) { t += NOTA_UNIO; nota.unio = true; }
    return t;
  };

  // 1. El tros que posa la condició, marcat; 2. la condició.
  g.files[FILA.f] = filaF(p, i);
  g.afegeix(textMarca(c) + (i === 1 ? ' Aquesta és la segona condició.' : ''));
  g.files[FILA.f] = filaF(p, -1);
  pinta();
  g.afegeix(`Escriu la condició que ha de complir $x$: $${c.gt} ${symRel} 0$.`, {cursor: {arrossega: `Gp${i}`, fins: `C${i}g`}});

  if (c.relacio === 'ne') {
    // L'equació g = 0 dóna els valors prohibits.
    const sol = F.resolEquacio(g, {fila: B.eq, treball: B.tr, P: B.P, termes: c.termes, lila: true,
      text: `Els valors prohibits són els que fan $${c.gt} = 0$. Resol aquesta equació.`,
      final: `Aquests són els valors que no poden ser de $x$: ${llistaEq(c.arrels)}.`});
    if (!sol.length) {
      afegeixLink('x \\in \\mathbb{R}', `$${c.gt} = 0$ no té cap solució: no hi ha cap valor prohibit, i $x$ pot ser qualsevol nombre real.`);
      afegeixLink(`x \\in ${texConjunt(c.S)}`, textInterval(c.S, 'Tots els nombres reals formen l\'interval '));
      return;
    }
    afegeixLink(c.arrels.map(r => `x \\neq ${texNombre(r)}`).join(',\\ '),
      `Per tant, $x$ no pot valer ${c.arrels.map(r => `$${texNombre(r)}$`).join(' ni ')}; qualsevol altre nombre serveix.`);
    afegeixLink(`x \\in \\mathbb{R} - \\{${c.arrels.map(texNombre).join(',\\ ')}\\}`,
      `Escrit com a conjunt: tots els nombres reals ($\\mathbb{R}$) menys ${llistaTex(c.arrels)}.`);
    afegeixLink(`x \\in ${texConjunt(c.S)}`,
      textInterval(c.S, `En forma d'intervals: la recta real queda tallada pels valors prohibits, que no hi són (parèntesi). `));
    return;
  }

  if (c.grau === 1) {
    // Desigualtat de primer grau: s'aïlla x.
    const a = c.coefs[1], b = c.coefs[0];
    let relacio = c.relacio;
    const coefX = a.igual(1) ? '' : a.igual(-1) ? '-' : texNombre(a);
    if (!b.esZero()) {
      afegeixLink(`${coefX}x ${SIGNE_RELACIO[relacio]} ${texNombre(b.oposada())}`,
        `Passa el $${texNombre(b)}$ a l'altre costat: hi arriba canviat de signe, i la desigualtat no canvia.`);
    }
    if (!a.igual(1)) {
      const valor = b.oposada().quocient(a);
      if (a.signe() < 0) relacio = GIRA[relacio];
      afegeixLink(`x ${SIGNE_RELACIO[relacio]} ${texNombre(valor)}`,
        a.igual(-1) ? 'Canvia el signe dels dos costats (és multiplicar per $-1$): la desigualtat canvia de sentit.'
          : a.signe() < 0 ? `Divideix els dos costats per $${texNombre(a)}$. Com que és negatiu, la desigualtat canvia de sentit.`
            : `Divideix els dos costats per $${texNombre(a)}$. Com que és positiu, la desigualtat es manté.`);
    }
    afegeixLink(`x \\in ${texConjunt(c.S)}`, textInterval(c.S, `Això són ${paraules(c.S)}: en forma d'interval, `));
    return;
  }

  // Desigualtat de segon grau: les arrels tallen la recta, i la taula de signes diu on es compleix.
  const sol = F.resolEquacio(g, {fila: B.eq, treball: B.tr, P: B.P, termes: c.termes, lila: true,
    text: `Per saber on $${c.gt}$ canvia de signe, busca on val $0$: resol l'equació $${c.gt} = 0$.`,
    final: `$${c.gt}$ val $0$ a ${llistaEq(c.arrels)}.`});
  g.classes[B.sg] = 'desplacable';
  g.files[B.sg] = taula(i, c);
  g.afegeix(sol.length
    ? `${sol.length === 1 ? 'La solució talla' : 'Les solucions tallen'} la recta real en ${sol.length === 1 ? 'dos' : 'tres'} trossos, i en cada tros $${c.gt}$ té un únic signe. Prepara la taula: els trossos i els punts.`
    : `Com que no hi ha cap solució, no hi ha cap tall: la recta real sencera és un sol tros, i $${c.gt}$ hi té un únic signe.`);
  g.files[B.sg] = taula(i, c, {signes: true});
  g.afegeix(textSignes(c));
  g.files[B.sg] = taula(i, c, {signes: true, marcats: c.cols.map(q => (c.relacio === 'ge' ? q.s >= 0 : q.s > 0))});
  g.afegeix(c.relacio === 'ge' ? `Busques $${c.gt} \\ge 0$: serveixen els trossos amb $+$ i els punts on val $0$ (hi ha el signe $=$).`
    : `Busques $${c.gt} > 0$: només serveixen els trossos amb $+$; els punts on val $0$ no (la desigualtat és estricta).`);
  afegeixLink(`x \\in ${texConjunt(c.S)}`, textInterval(c.S, `Els trossos verds són ${paraules(c.S)}: `));
}

function passos(valors) {
  const p = perId(valors.p);
  const conds = p.conds.map(prepara);
  const g = F.guio(FILES);
  const nota = {claudator: false, unio: false};

  g.files[FILA.f] = filaF(p, -1);
  g.afegeix(INTRO + (p.intro ? ' ' + p.intro : ''));
  conds.forEach((c, i) => bloc(g, p, c, i, nota));

  const dom = conds.reduce((S, c) => interseccio(S, c.S), TOT);
  if (!dom.length) throw new Error(`domini: el domini de ${p.id} és buit`);
  const tots = dom.length === 1 && dom[0].a === null && dom[0].b === null;

  if (!conds.length) {
    g.files[FILA.recta] = recta([{nom: 'Dom f', S: dom, dom: true}]);
    g.afegeix(p.motiu + ' A la recta real, el domini és tota la recta.');
  } else if (conds.length === 1) {
    g.files[FILA.recta] = recta([{nom: 'Dom f', S: dom, dom: true}]);
    g.afegeix('Dibuixa-ho a la recta real: el punt tancat és un extrem que hi pertany; l\'obert, un que no hi pertany. Només hi ha una condició, i aquest és el domini.');
  } else {
    const linies = conds.map((c, i) => ({nom: `C<tspan class="sub" dy="4">${i + 1}</tspan>`, S: c.S}));
    g.files[FILA.recta] = recta(linies);
    g.afegeix('Dibuixa cada condició a la recta real: el punt tancat és un extrem que hi pertany; l\'obert, un que no hi pertany.');
    const grup = S => (S.length > 1 ? `\\left(${texConjunt(S)}\\right)` : texConjunt(S));
    g.files[FILA.inter] = K('Ia', grup(conds[0].S)) + '\\ \\cap\\ ' + K('Ib', grup(conds[1].S));
    g.afegeix('$x$ ha de complir les dues condicions alhora: cal la intersecció dels dos conjunts (el símbol $\\cap$), és a dir, els nombres que són als dos.');
    g.files[FILA.inter] += R('Iq', '=') + K('Ir', texConjunt(dom));
    g.afegeix(`Els nombres que són als dos conjunts són ${paraules(dom)}: $${texConjunt(dom)}$.`);
    g.files[FILA.recta] = recta(linies.concat([{nom: 'Dom f', S: dom, dom: true}]));
    g.afegeix('A la recta, el domini és la part que té color a totes dues condicions.');
  }

  g.files[FILA.fi] = K('Vt', '\\text{Dom}\\,') + K('Vf', 'f') + R('Vq', '=')
    + (tots ? K('VR', '\\mathbb{R}') + R('Vq2', '=') : '') + K('VI', texConjunt(dom));
  g.classes[FILA.fi] = 'final';
  g.afegeix(`Resposta: el domini de $f$ és $${texConjunt(dom)}$, és a dir, ${paraules(dom)}.`);
  return g.passos;
}

const enunciat = v => `Troba el domini de la funció $f(x) = ${texFPla(perId(v.p))}$ i expressa'l en forma d'interval.`;
const resum = v => `f(x) = ${texFPla(perId(v.p))}`;

arrel.Domini = Object.freeze({
  titol: 'Domini d’una funció',
  categoria: 'analisi',
  files: FILES,
  pissarraCreix: true,
  perDefecte: FIXOS.perDefecte,
  exemples: FIXOS.exemples,
  titolEditor: 'Tria una funció',
  notaEditor: 'Cada funció té un domini diferent: fraccions, arrels, logaritmes… Mira què pot fallar i quins valors de $x$ s\'han de treure.',
  titolExemples: 'Funcions:',
  editor: [],
  problemes: PROBLEMES,
  FILA,
  valida: FIXOS.valida, llegeixAdreca: FIXOS.llegeixAdreca, escriuAdreca: FIXOS.escriuAdreca,
  enunciat, resum, nomExemple: FIXOS.nomExemple,
  passos,
});

})(globalThis);
