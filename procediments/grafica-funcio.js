/* ═══════════════════════════════════════════════════════════════════
   grafica-funcio.js — Procediment: esbós de la gràfica d'una funció
   ───────────────────────────────────────────────────────────────────
   Problemes fixos (?p=<id>): dotze funcions, tres de cada tipus
   (polinòmiques, racionals, amb radicals, altres). Enunciat, sempre:
   «Elabora un esbós de la gràfica de la funció f(x) = …, justificant-ho tot.»

   Set apartats, l'un darrere l'altre, i res no s'esborra («tot a la vista»,
   David): la pissarra creix cap avall (pissarraCreix) i cada apartat comença
   amb un títol (fila de text de classe «apartat»):
     1. Domini i possibles asímptotes verticals
     2. Límits en l'infinit i possibles asímptotes horitzontals i obliqües
     3. Punts de tall amb els eixos: Q(0, …), P₁(…, 0), P₂(…, 0)…
     4. Creixement, decreixement i extrems relatius (f', taula de signes)
     5. Concavitat i punts d'inflexió (f'', taula de signes)
     6. Taula de valors: els talls, els extrems, les inflexions i dos punts més
     7. La gràfica (Grafiques.esbos): primer les asímptotes i els punts, després la corba

   Les polinòmiques i les racionals es calculen amb aritmètica exacta (Fraccio, i
   Radical per a ±√3): passosRacional. Les equacions, amb Matrius.passosArrels
   (l'equació es queda a la seva fila, els càlculs baixen; les solucions en lila).
   Les funcions amb radicals tenen un guió escrit a mà per als apartats 1 a 5
   (passosRadical): inequació del domini, límits, regla de l'arrel, equacions
   resoltes a mà (equacioMa: les solucions fora del domini es tatxen).
   Les taules de signes, els valors de prova i les conclusions (estudiSignes) i
   els apartats 6 i 7 (seccionsFinals) són els mateixos per a tots els tipus.
   Totes les línies que es veuen són certes: ho comprova proves/comprova.js.

   Cada fila escrita porta un tipus (pas.tipus[i]) que diu què és, perquè les proves
   la sàpiguen llegir: f, apartat, domini, inequacio, equacio:Q|f|f1|f2, limits, asimptotes,
   valors, punts, derivada1|2, proves1|2, taula1|2, conclusio1|2, taula-valors, grafica.

   Claus: F f(x); V domini; L límits (L<fila>…); A conclusions d'asímptotes;
   U valors f(a); Z punts de tall; D1…/D2… derivades; S1…/S2… valors de prova;
   T1…/T2… taules de signes; C1…/C2… conclusions; H taula de valors.
   Les equacions (passosArrels i resolEquacio) porten els prefixos a (Q = 0),
   c (f = 0), d (f' = 0) i e (f'' = 0).
   ═══════════════════════════════════════════════════════════════════ */
(function (arrel) {
'use strict';

const M = arrel.Mates;
const F = arrel.Formules;
const Dd = arrel.Dades;
const Mt = arrel.Matrius;
const Gr = arrel.Grafiques;
const {Fraccio, Radical, texNombre} = M;
const {clau: K, op: O, rel: R} = F;
const fr = v => Fraccio.de(v);
const ZERO = fr(0);


/* ── 1. ELS PROBLEMES ──────────────────────────────────────────────── */

/**
 * Polinòmiques i racionals: P i Q, coeficients de grau 0 cap amunt (Q = [1]: un polinomi);
 * extres: els dos punts més de la taula de valors; finestra: la del dibuix (opcional).
 */
const PROBLEMES = [
  {id: 'cubica', tipus: 'polinomica', nom: 'x³ − 6x² + 9x', P: [0, 9, -6, 1], Q: [1], extres: [-1, 4], finestra: {x: [-1.6, 4.8], y: [-18, 8]}},
  {id: 'cubica-arrels', tipus: 'polinomica', nom: 'x³ − 3x', P: [0, -3, 0, 1], Q: [1], extres: [-2, 2], finestra: {x: [-2.8, 2.8], y: [-4, 4]}},
  {id: 'quartica', tipus: 'polinomica', nom: 'x⁴ − 4x³', P: [0, 0, 0, -4, 1], Q: [1], extres: [-1, 1], finestra: {x: [-1.8, 4.8], y: [-32, 12]}},
  {id: 'racional-obliqua', tipus: 'racional', nom: '(x² − 2x)/(x − 1)', P: [0, -2, 1], Q: [-1, 1], extres: [-1, 3], finestra: {x: [-3.5, 5.5], y: [-5, 5]}},
  {id: 'racional-horitzontal', tipus: 'racional', nom: '5x/(x² + 1)', P: [0, 5], Q: [1, 0, 1], extres: [-3, 3], finestra: {x: [-5.5, 5.5], y: [-3.5, 3.5]}},
  {id: 'racional-verticals', tipus: 'racional', nom: 'x²/(x² − 4)', P: [0, 0, 1], Q: [-4, 0, 1], extres: [-3, 3], finestra: {x: [-5.5, 5.5], y: [-4, 5]}},
  // Amb radicals: un guió per funció (apartats 1 a 5) i les dades comunes (vegeu passosRadical).
  {id: 'arrel-cubica', tipus: 'radical', nom: '√(1 + x³)', tex: '\\sqrt{1 + x^{3}}', guio: guioArrelCubica, extres: [1, 2],
    f: x => Math.sqrt(1 + x ** 3), trams: [{a: -1, b: Infinity, tancatA: true}], finestra: {x: [-1.8, 2.8], y: [-0.8, 4.4]}},
  {id: 'producte-arrel', tipus: 'radical', nom: 'x√(x + 3)', tex: 'x\\sqrt{x + 3}', guio: guioProducteArrel, extres: [-1, 1],
    f: x => x * Math.sqrt(x + 3), trams: [{a: -3, b: Infinity, tancatA: true}], finestra: {x: [-3.6, 2.4], y: [-2.8, 4.4]}},
  {id: 'arrel-obliques', tipus: 'radical', nom: '√(x² − 4)', tex: '\\sqrt{x^{2} - 4}', guio: guioArrelObliques, extres: [-3, 3],
    f: x => Math.sqrt(x * x - 4), trams: [{a: -Infinity, b: -2, tancatB: true}, {a: 2, b: Infinity, tancatA: true}], finestra: {x: [-5.5, 5.5], y: [-1.2, 5.2]}},
];
const FIXOS = Dd.problemesFixos(PROBLEMES);
const {perId} = FIXOS;


/* ── 2. POLINOMIS I NOMBRES ────────────────────────────────────────── */
/* Un polinomi és una llista de coeficients Fraccio de grau 0 cap amunt (com a Mates). */

const coefs = l => { const c = l.map(fr); while (c.length > 1 && c[c.length - 1].esZero()) c.pop(); return c; };
const termes = c => M.termes(c);
const tp = c => M.texPolinomi(termes(c));
const prod = (a, b) => M.producteDePolinomis(a, b);
const suma = (a, b) => M.sumaPolinomis(a, b);
const escala = (a, k) => a.map(c => c.producte(k));
const deriva = a => { const d = M.coeficientsDe(M.derivaTermes(termes(a))); return d.length ? d : [ZERO]; };
const grau = a => a.length - 1;
const esZeroP = a => a.every(c => c.esZero());
/** Valor en x (Fraccio o Radical): Horner. */
const valor = (a, x) => a.reduceRight((s, c) => s.producte(x).suma(c), ZERO);
const flotant = (a, x) => a.reduceRight((s, c) => s * x + c.valor(), 0);

/** Un polinomi com a factor d'un producte: entre parèntesis si té més d'un terme o és negatiu. */
function factor(a) {
  const t = termes(a);
  if (!t.length) return '0';
  return t.length === 1 && fr(t[0].c).signe() > 0 ? tp(a) : `(${tp(a)})`;
}
/** Q^k: «x^{4}» si Q = x; si no, «(x - 1)^{4}». */
function potencia(a, k) {
  const t = termes(a);
  if (t.length === 1 && fr(t[0].c).igual(1)) return t[0].n === 1 ? `x^{${k}}` : `x^{${t[0].n * k}}`;
  return `(${tp(a)})^{${k}}`;
}
/** Producte de factors (TeX), sense els «1» (David: mai «· 1»). */
const producteTex = (...fs) => fs.filter(f => f !== '1').join(' \\cdot ') || '1';

const esIrracional = v => v instanceof Radical && !v.b.esZero();
/** «2{,}17»: dues xifres decimals, amb coma. */
function decimal(x) {
  const s = (Math.round(Math.abs(x) * 100) / 100).toFixed(2).replace('.', '{,}');
  return (x < 0 && s !== '0{,}00' ? '-' : '') + s;
}
/** Un valor exacte i, si és irracional, el valor aproximat: «\frac{5\sqrt{3}}{4} \approx 2{,}17». */
const texAprox = v => texNombre(v) + (esIrracional(v) ? ` \\approx ${decimal(v.valor())}` : '');
/** El valor substituït en un polinomi: entre parèntesis si és negatiu, fraccionari o irracional. */
const texArgument = v => (esIrracional(v) ? `(${texNombre(v)})` : M.texEntreParentesis(v));

/** El polinomi amb x substituïda per v, sense calcular: «1^{3} - 6 \cdot 1^{2} + 9 \cdot 1». */
function substitucio(a, v) {
  const t = termes(a);
  if (!t.length) return '0';
  return t.map((u, i) => {
    const c = fr(u.c), ca = c.abs();
    const signe = i === 0 ? (c.signe() < 0 ? '-' : '') : (c.signe() < 0 ? ' - ' : ' + ');
    if (u.n === 0) return signe + texNombre(ca);
    const xv = (u.n === 1 && esIrracional(v) && v.signe() > 0 ? texNombre(v) : texArgument(v)) + (u.n > 1 ? `^{${u.n}}` : '');
    return signe + (ca.igual(1) ? xv : `${texNombre(ca)} \\cdot ${xv}`);
  }).join('');
}
/** Els valors dels termes, «1 - 6 + 9» (si n'hi ha més d'un i no són ja els de la substitució). */
function termesCalculats(a, v) {
  const t = termes(a);
  return t.map((u, i) => {
    const w = fr(u.c).producte(v instanceof Radical ? v.potencia(u.n) : fr(v).potencia(u.n));
    const neg = w.signe() < 0;
    return (i === 0 ? (neg ? '-' : '') : (neg ? ' - ' : ' + ')) + texNombre(w.abs());
  }).join('');
}

/** Interval (a, b), amb a i b valors exactes o null (−∞, +∞). */
const texInterval = (a, b) => `(${a === null ? '-\\infty' : texNombre(a)},\\ ${b === null ? '+\\infty' : texNombre(b)})`;
/** «a», «a i b», «a, b i c». */
const iCatala = t => (t.length > 1 ? t.slice(0, -1).join(', ') + ' i ' + t[t.length - 1] : t.join(''));
/** «$x = 1$», «$x = 1$ i $x = 3$», «$x = -1$, $x = 1$ i $x = 3$». */
const llista = (valors, nom = 'x') => iCatala(valors.map(a => `$${nom} = ${texNombre(a)}$`));
const ordena = l => l.slice().sort((a, b) => a.valor() - b.valor());

/** Un valor de prova dins de (a, b) (a, b exactes o null): el 0 si hi és; si no, un enter tan centrat com es pugui; si no, una fracció. */
function valorDeProva(a, b) {
  const fa = a === null ? -Infinity : a.valor(), fb = b === null ? Infinity : b.valor();
  if (fa < 0 && fb > 0) return ZERO;
  const dins = x => x > fa + 1e-12 && x < fb - 1e-12;
  if (fa === -Infinity) { let k = Math.ceil(fb) - 1; if (!dins(k)) k--; return fr(k); }
  if (fb === Infinity) { let k = Math.floor(fa) + 1; if (!dins(k)) k++; return fr(k); }
  const enters = [];
  for (let k = Math.ceil(fa); k <= Math.floor(fb); k++) if (dins(k)) enters.push(k);
  if (enters.length) { const mig = (fa + fb) / 2; return fr(enters.reduce((m, k) => (Math.abs(k - mig) < Math.abs(m - mig) ? k : m))); }
  for (const d of [2, 4, 10, 100]) {
    for (let k = Math.ceil(fa * d); k <= Math.floor(fb * d); k++) if (dins(k / d)) return new Fraccio(k, d);
  }
  throw new Error('valorDeProva: interval massa estret');
}


/* ── 3. LA PISSARRA ────────────────────────────────────────────────── */

const FILES = 72;
const TITOLS = [
  '1. Domini i possibles asímptotes verticals',
  '2. Límits en l\'infinit i possibles asímptotes horitzontals i asímptotes obliqües',
  '3. Punts de tall amb els eixos',
  '4. Creixement, decreixement i extrems relatius',
  '5. Concavitat positiva o concavitat negativa i punts d\'inflexió',
  '6. Taula de valors',
  '7. Gràfica de la funció',
];

/**
 * Un guió (Formules.guio) que també dona les files en ordre (g.fila(tipus)) i guarda el tipus de cada fila a
 * cada pas (pas.tipus): les proves saben així com llegir cada fila.
 */
function nouGuio() {
  const g = F.guio(FILES);
  const tipus = Array(FILES).fill('');
  let seguent = 0;
  const afegeix = g.afegeix;
  g.afegeix = (text, opcions) => {
    const n = g.passos.length;
    afegeix(text, opcions);
    if (g.passos.length > n) g.passos[n] = Object.freeze(Object.assign({}, g.passos[n], {tipus: tipus.slice()}));
  };
  g.fila = t => {
    if (seguent >= FILES) throw new Error('grafica-funcio: no hi ha prou files');
    tipus[seguent] = t;
    return seguent++;
  };
  /** n files seguides del mateix tipus (les lliures de passosArrels: les que no es facin servir no es veuen). */
  g.filesLliures = (t, n) => Array.from({length: n}, () => g.fila(t));
  /** El títol d'un apartat: una fila de text; el pas el posa el primer càlcul de l'apartat. */
  g.apartat = n => { const i = g.fila('apartat'); g.files[i] = F.filaText(TITOLS[n - 1]); g.classes[i] = 'apartat'; };
  return g;
}

/** Una fila amb diverses línies (array); cada línia és TeX amb claus. */
const linies = ls => (ls.length > 1 ? `\\begin{array}{l} ${ls.join(' \\\\[10pt] ')} \\end{array}` : ls[0] || '');
/** Igualtats que s'acumulen línia a línia: «f'(x) & = A \\ & = B» (tot a la vista). */
const igualtats = (esquerra, parts) => (parts.length > 1
  ? `\\begin{array}{rl} ${esquerra} & = ${parts.join(' \\\\[10pt] & = ')} \\end{array}`
  : `${esquerra} = ${parts[0]}`);

const LIM = cap => `\\lim\\limits_{x \\to ${cap}}`;
const INF = s => (s < 0 ? '-\\infty' : '+\\infty');


/* ── 4. LÍMITS D'UNA FUNCIÓ RACIONAL A L'INFINIT (com asimptotes.js) ─ */

/** Límit de N/D quan x → +∞ (cap = 1) o −∞ (cap = −1): {finit: Fraccio} o {infinit: ±1}. N i D: coeficients. */
function limitInfinit(N, D, cap) {
  const n = termes(N)[0], d = termes(D)[0];
  const k = n.n - d.n, c = fr(n.c).quocient(d.c);
  if (k < 0) return {finit: ZERO};
  if (k === 0) return {finit: c};
  return {infinit: c.signe() * (cap < 0 && k % 2 ? -1 : 1)};
}

/**
 * Els passos d'un límit de N/D a l'infinit, després de «lim N/D»: [segon membre, text]. cap: 1 (+∞), −1 (−∞),
 * 0 (±∞: un límit finit, igual als dos costats). Si D = 1 (un polinomi), els termes de grau més alt de N.
 */
function passosInfinit(N, D, cap) {
  const L = LIM(cap > 0 ? '+\\infty' : cap < 0 ? '-\\infty' : '\\pm\\infty');
  const n0 = termes(N)[0], d0 = termes(D)[0];
  const k = n0.n - d0.n, c = fr(n0.c).quocient(d0.c);
  const l = limitInfinit(N, D, cap || 1);
  const polinomi = grau(D) === 0;
  const passos = [];
  const tx = n => (n === 1 ? 'x' : `x^{${n}}`);
  if (polinomi) {
    if (termes(N).length > 1) passos.push([`${L} ${M.texPolinomi([n0])}`, 'Quan $x$ és molt gran, en un polinomi només compta el terme de grau més alt: els altres hi són petits al costat.']);
  } else {
    const dominant = `\\dfrac{${M.texPolinomi([n0])}}{${M.texPolinomi([d0])}}`;
    if (termes(N).length > 1 || termes(D).length > 1) {
      passos.push([`${L} ${dominant}`, 'Quan $x$ és molt gran, en cada polinomi només compta el terme de grau més alt: els altres hi són petits al costat.']);
    }
    if (k > 0) passos.push([`${L} ${M.texPolinomi([{n: k, c}])}`, `Simplifica: $${dominant} = ${M.texPolinomi([{n: k, c}])}$.`]);
    else if (k < 0) {
      const t = `\\dfrac{${texNombre(n0.c)}}{${M.texPolinomi([{n: -k, c: d0.c}])}}`;
      passos.push([`${L} ${t}`, `Simplifica: $${dominant} = ${t}$.`]);
    }
  }
  if (k > 0) {
    const pot = cap > 0 ? `$${tx(k)}$ és positiu` : k % 2 ? (k > 1 ? `$${tx(k)}$ és negatiu (exponent senar)` : '$x$ és negatiu') : `$${tx(k)}$ és positiu (exponent parell)`;
    passos.push([INF(l.infinit), `Quan $x \\to ${cap < 0 ? '-' : '+'}\\infty$, ${pot} i es fa tan gran com vulguis: el límit és $${INF(l.infinit)}$.`]);
  } else if (k < 0) {
    passos.push(['0', 'Un nombre fix dividit per una quantitat cada cop més gran tendeix a $0$.']);
  } else {
    passos.push([texNombre(c), 'Simplifica: a dalt i a baix hi ha el mateix grau, i queda el quocient dels coeficients.']);
  }
  return {passos, limit: l};
}


/* ── 5. LES PECES DE LA PISSARRA ───────────────────────────────────── */

/**
 * Una cadena d'igualtats que s'acumulen a la fila «fila»: «esquerra = p₁», després «= p₂»… (cada part, un pas).
 * Les línies d'un límit es parteixen si no hi caben (Formules.enLinies). «linia» (opcional): la fila té altres
 * línies (ls) i aquesta és la línia número «linia». Les claus: P + 'l' (esquerra), P + n (parts).
 */
function cadena(g, {fila, P, esquerra, parts, ls = null, apila = false}) {
  const fetes = [];
  const pinta = () => {
    const tex = apila ? igualtats(K(P + 'l', esquerra), fetes.map((t, i) => K(P + i, t)))
      : F.enLinies(K(P + 'l', esquerra), fetes.map((t, i) => ` = ${K(P + i, t)}`));
    if (ls) { ls.linies[ls.index] = tex; g.files[fila] = linies(ls.linies); } else g.files[fila] = tex;
  };
  for (const [tex, text, opcions] of parts) { fetes.push(tex); pinta(); g.afegeix(text, opcions); }
}

/**
 * Taula de signes (com creixement.js): columnes [{interval: [a, b]} | {punt: v}] (a, b exactes o null = ∞), en ordre;
 * la capçalera i dues files. Claus: P + Hi<j> (interval j), P + Hp<k> (punt k); cel·les P + <nom>i<j> i P + <nom>p<k>.
 * Dos intervals seguits sense cap punt entre mig: el domini (o el de la derivada) té un forat.
 */
function taulaSignes(P, columnes, files) {
  let ni = 0, np = 0;
  const index = columnes.map(c => (c.punt !== undefined ? np++ : ni++));
  const esPunt = c => c.punt !== undefined;
  const cella = (nom, cel) => (cel ? K(`${P}${nom}`, cel) : '');
  const fila = (etiqueta, f) => [etiqueta, ...columnes.map((c, n) => f(c, index[n]))].join(' & ');
  return `\\begin{array}{${Array(columnes.length + 1).fill('c').join('|')}} `
    + [fila(K(P + 'Lx', '\\boldsymbol{x}'), (c, j) => (esPunt(c) ? 'x = ' + K(`${P}Hp${j}`, texNombre(c.punt)) : K(`${P}Hi${j}`, texInterval(...c.interval)))),
      ...files.map(({nom, etiqueta, i, p}) => fila(K(P + 'L' + nom, etiqueta), (c, j) => (esPunt(c) ? cella(`${nom}p${j}`, p[j]) : cella(`${nom}i${j}`, i[j]))))].join(' \\\\ \\hline ')
    + ' \\end{array}';
}

/** «A ⟺ B ⟺ C»: una cadena que creix pas a pas (claus P + n), amb el separador sep. parts: [[tex, text]]. */
function cadenaSep(g, {fila, P, parts, sep}) {
  const fetes = [];
  for (const [tex, text] of parts) {
    fetes.push(tex);
    g.files[fila] = F.enLinies(K(P + '0', fetes[0]), fetes.slice(1).map((t, i) => ` ${sep} ${K(P + (i + 1), t)}`));
    g.afegeix(text);
  }
}

/** Una fila de conclusió (destacada), escrita en un pas. */
function destacat(g, tipus, tex, text) {
  const i = g.fila(tipus);
  g.files[i] = tex;
  g.classes[i] = 'destacat';
  g.afegeix(text);
  return i;
}

const DISJUNCIO = '\\quad\\text{o}\\quad ';        // la de Formules (tatxaSolucio parteix per aquí)

/**
 * Una equació resolta a mà (les funcions amb radicals): la fila de l'equació, «… = 0» (principal: els primers membres,
 * un per pas: f(x), després la seva expressió), una fila de treball que es transforma (treball: [[tex, text]]) i, al
 * final, les solucions: les que serveixen, en lila; les que no (fora del domini), tatxades en un pas més.
 * Claus: pre + E… (l'equació), pre + W… (el treball), pre + s<i> (les solucions). Torna els valors que serveixen.
 */
function equacioMa(g, {pre, tipus, principal, treball, solucions = [], textSolucions = '', textTatxa = ''}) {
  const eq = g.fila(tipus), tr = g.fila(tipus);
  principal.forEach(([tex, text], i) => { g.files[eq] = K(pre + 'E' + i, tex) + R(pre + 'Eq', '=') + K(pre + 'Ez', '0'); g.afegeix(text); });
  treball.forEach(([tex, text], i) => { g.files[tr] = K(pre + 'W' + i, tex); g.afegeix(text); });
  if (!solucions.length) return [];
  g.files[tr] = solucions.map((s, i) => K(pre + 'x' + i, 'x') + R(pre + 'q' + i, '=') + K(pre + 's' + i, s.tex)).join(DISJUNCIO);
  solucions.forEach((s, i) => { if (s.serveix !== false) F.marcaSolucio(g, tr, pre + 's' + i); });
  g.afegeix(textSolucions);
  if (solucions.some(s => s.serveix === false)) {
    solucions.forEach((s, i) => { if (s.serveix === false) F.tatxaSolucio(g, tr, pre + 's' + i); });
    g.afegeix(textTatxa);
  }
  return solucions.filter(s => s.serveix !== false).map(s => s.valor);
}


/* ── 6. POLINÒMIQUES I RACIONALS ───────────────────────────────────── */

function passosRacional(pr) {
  const P = coefs(pr.P), Q = coefs(pr.Q);
  const pol = grau(Q) === 0;
  const g = nouGuio();
  const texF = pol ? tp(P) : `\\dfrac{${tp(P)}}{${tp(Q)}}`;
  const fRad = x => valor(P, x).quocient(valor(Q, x));          // f(x) exacta (Fraccio o Radical)
  const taula = [];                                             // els punts de la taula de valors: [{x, y}]
  const posaPunt = (x, y) => { if (!taula.some(p => p.x.igual(x))) taula.push({x, y}); };

  /* La funció. */
  const f0 = g.fila('f');
  g.files[f0] = F.membreEsquerre('F', 'f', 'x') + K('Fe', texF);
  g.afegeix('Per fer l\'esbós, estudia la funció en set apartats, l\'un darrere l\'altre. Totes les conclusions es queden a la pissarra: '
    + 'les necessitaràs per dibuixar la gràfica.');

  /* ── 1. Domini i asímptotes verticals ── */
  g.apartat(1);
  const DOMINI = K('Vt', '\\text{Dom}\\,') + K('Vf', 'f') + R('Vq', '=') + K('VR', '\\mathbb{R}');
  let fora = [];
  const dom = g.fila('domini');
  if (pol) {
    g.files[dom] = DOMINI;
    g.afegeix('1. Domini i possibles asímptotes verticals. $f$ és un polinomi: existeix per a qualsevol valor de $x$. El domini és tot $\\mathbb{R}$.');
  } else {
    const eq = g.fila('equacio:Q'), treball = g.fila('equacio:Q');
    const sol = F.resolEquacio(g, {fila: eq, treball, P: 'aE', termes: termes(Q), irracionals: false, lila: true,
      text: `1. Domini i possibles asímptotes verticals. $f$ no existeix on el denominador val $0$. Resol l'equació $${tp(Q)} = 0$.`,
      final: s => `El denominador val $0$ per a ${llista(s.map(t => t.valor))}.`});
    fora = sol.map(s => s.valor);
    g.files[dom] = DOMINI + (sol.length
      ? O('Vm', '-') + K('Va', '\\{') + sol.map((s, j) => K('Vp' + j, texNombre(s.valor))).join(',\\ ') + K('Vb', '\\}') : '');
    g.afegeix(sol.length ? `El domini és $\\mathbb{R}$ sense ${llista(fora)}.` : 'El denominador no val mai $0$: el domini és tot $\\mathbb{R}$.');
  }
  const av = [];                                                // les asímptotes verticals (per al dibuix)
  if (fora.length) {
    const fl = g.fila('limits'), ls = {linies: [], index: 0};
    fora.forEach((a, i) => {
      const X = texNombre(a), pa = valor(P, a);
      const branca = l => (l < 0 ? 'baixa cap a $-\\infty$' : 'puja cap a $+\\infty$');
      for (const s of [-1, 1]) {
        const sq = valor(Q, a.suma(new Fraccio(s, 1000))).signe();   // el signe de Q just al costat (les arrels de Q són lluny)
        const lim = pa.signe() * sq;
        const cap = `${X}^{${s < 0 ? '-' : '+'}}`;
        ls.index = ls.linies.length;
        ls.linies.push('');
        const paraula = v => (v < 0 ? 'negatiu' : 'positiu');
        cadena(g, {fila: fl, P: `L${i}${s < 0 ? 'm' : 'p'}`, esquerra: `${LIM(cap)} f(x)`, ls, parts: [
          [`${LIM(cap)} ${texF}`, `${s < 0 ? 'Per l\'esquerra' : 'Per la dreta'} de $x = ${X}$: substitueix $f(x)$ per la seva expressió.`],
          [INF(lim), `El numerador tendeix a $${texNombre(pa)}$, i el denominador tendeix a $0$ amb valors ${sq < 0 ? 'negatius' : 'positius'}. `
            + `Un nombre ${paraula(pa.signe())} dividit per un nombre molt petit i ${paraula(sq)} dona un nombre molt gran i ${paraula(lim)}: la gràfica ${branca(lim)}.`],
        ]});
      }
      av.push(a);
    });
  }
  const fav = g.fila('asimptotes');
  g.files[fav] = K('Av', av.length === 0 ? '\\text{No hi ha asímptotes verticals}'
    : av.length === 1 ? `\\text{Asímptota vertical: } x = ${texNombre(av[0])}`
      : `\\text{Asímptotes verticals: } ${av.map(a => `x = ${texNombre(a)}`).join('\\ \\text{ i }\\ ')}`);
  g.classes[fav] = 'destacat';
  g.afegeix(av.length === 0 ? (pol ? 'Un polinomi no es fa infinit en cap punt: no té asímptotes verticals.'
    : 'Com que $f$ existeix a tot arreu, no hi ha asímptotes verticals.')
    : `Els límits laterals són infinits: ${av.length > 1 ? 'les rectes' : 'la recta'} ${llista(av)} ${av.length > 1 ? 'són asímptotes verticals' : 'és una asímptota vertical'}.`);

  /* ── 2. Límits en l'infinit, asímptotes horitzontals i obliqües ── */
  g.apartat(2);
  const fl2 = g.fila('limits'), ls2 = {linies: [], index: 0};
  const expr = pol ? `(${tp(P)})` : texF;
  const mes = passosInfinit(P, Q, 1), l = mes.limit;
  ls2.linies.push('');
  cadena(g, {fila: fl2, P: 'Ip', esquerra: `${LIM('+\\infty')} f(x)`, ls: ls2, parts: [
    [`${LIM('+\\infty')} ${expr}`, '2. Límits en l\'infinit i possibles asímptotes horitzontals i obliqües. Com és $f(x)$ quan $x$ és molt gran? Comença per $x \\to +\\infty$.'],
    ...mes.passos,
  ]});
  const limMenys = l.finit ? l : limitInfinit(P, Q, -1);
  ls2.index = 1;
  ls2.linies.push('');
  if (l.finit) {
    cadena(g, {fila: fl2, P: 'Im', esquerra: `${LIM('-\\infty')} f(x)`, ls: ls2, parts: [
      [texNombre(l.finit), `A $-\\infty$ passa el mateix: els termes de grau més alt donen el mateix quocient, $${texNombre(l.finit)}$.`]]});
  } else {
    const menys = passosInfinit(P, Q, -1).passos;
    cadena(g, {fila: fl2, P: 'Im', esquerra: `${LIM('-\\infty')} f(x)`, ls: ls2, parts: [
      [menys[menys.length - 2][0], `Ara $x \\to -\\infty$: ${pol ? 'també mana el terme de grau més alt' : 'manen els mateixos termes de grau més alt, i la mateixa simplificació'}.`],
      menys[menys.length - 1]]});
  }
  const fah = g.fila('asimptotes');
  g.classes[fah] = 'destacat';
  let obliqua = null;
  if (l.finit) {
    g.files[fah] = K('Ah', `\\text{Asímptota horitzontal: } y = ${texNombre(l.finit)}`);
    g.afegeix(`El límit és un nombre, $${texNombre(l.finit)}$: la recta $y = ${texNombre(l.finit)}$ és una asímptota horitzontal, a $+\\infty$ i a $-\\infty$.`);
    const fao = g.fila('asimptotes');
    g.files[fao] = K('Ao', '\\text{No hi ha asímptotes obliqües}');
    g.classes[fao] = 'destacat';
    g.afegeix('Si hi ha asímptota horitzontal, no n\'hi ha d\'obliqua: totes dues diuen com és $f$ quan $x$ és molt gran, i només pot ser d\'una manera.');
  } else {
    g.files[fah] = K('Ah', '\\text{No hi ha asímptotes horitzontals}');
    g.afegeix(`Els límits són infinits: no hi ha asímptotes horitzontals. Però serveixen per a l'esbós: quan $x \\to +\\infty$, $f(x) \\to ${INF(l.infinit)}$, `
      + `i quan $x \\to -\\infty$, $f(x) \\to ${INF(limMenys.infinit)}$.`);
    // L'asímptota obliqua, y = mx + n: m = lim f(x)/x.
    const fo = g.fila('limits'), ls3 = {linies: [''], index: 0};
    const xQ = [ZERO].concat(Q);
    const k = grau(P) - grau(Q);
    const Lpm = LIM(k === 1 ? '\\pm\\infty' : '+\\infty');
    const quocientX = pol ? `\\dfrac{${tp(P)}}{x}` : `\\dfrac{${tp(P)}}{${tp(xQ)}}`;
    const pm = passosInfinit(P, xQ, k === 1 ? 0 : 1);
    cadena(g, {fila: fo, P: 'Om', esquerra: k === 1 ? 'm' : `${Lpm} \\dfrac{f(x)}{x}`, ls: ls3, parts: [
      ...(k === 1 ? [[`${Lpm} \\dfrac{f(x)}{x}`, 'Potser hi ha una asímptota obliqua, $y = mx + n$. El pendent és $m = \\lim \\frac{f(x)}{x}$ '
        + '(per a una funció racional, és el mateix a $+\\infty$ i a $-\\infty$).']] : []),
      [`${Lpm} ${quocientX}`, k === 1 ? `Dividir $f(x)$ per $x$ és multiplicar el denominador per $x$: $x \\cdot ${factor(Q)} = ${tp(xQ)}$.`
        : `Potser hi ha una asímptota obliqua, $y = mx + n$. El pendent seria el nombre $m = \\lim \\frac{f(x)}{x}$.`],
      ...pm.passos]});
    if (k === 1) {
      const m = pm.limit.finit;
      const menysMx = `${m.signe() > 0 ? '-' : '+'} ${M.texPolinomi([{n: 1, c: m.abs()}])}`;
      const N = suma(P, prod(Q, [ZERO, m.oposada()]));         // P − m·x·Q
      const pn = passosInfinit(coefs(N), Q, 0), n = pn.limit.finit;
      const coefM = m.abs().igual(1) ? '' : texNombre(m.abs());
      ls3.index = 1;
      ls3.linies.push('');
      cadena(g, {fila: fo, P: 'On', esquerra: 'n', ls: ls3, parts: [
        [`${Lpm} \\left(f(x) ${menysMx}\\right)`, `L'ordenada a l'origen és $n = \\lim \\left(f(x) - mx\\right)$, amb $m = ${texNombre(m)}$.`],
        [`${Lpm} \\left(${texF} ${menysMx}\\right)`, 'Substitueix $f(x)$.'],
        [`${Lpm} \\dfrac{${tp(P)} ${m.signe() > 0 ? '-' : '+'} ${coefM}x \\cdot ${factor(Q)}}{${tp(Q)}}`,
          `Fes la resta amb el mateix denominador: $${M.texPolinomi([{n: 1, c: m}])} = \\frac{${M.texPolinomi([{n: 1, c: m}])} \\cdot ${factor(Q)}}{${tp(Q)}}$.`],
        [`${Lpm} \\dfrac{${tp(coefs(N))}}{${tp(Q)}}`, 'Opera el numerador. El terme de grau més alt s\'anul·la: per això $m$ és el que és.'],
        ...pn.passos]});
      obliqua = {m, n};
      const fao = g.fila('asimptotes');
      g.files[fao] = K('Ao', `\\text{Asímptota obliqua: } y = ${M.texPolinomi(M.termes([n, m]))}`);
      g.classes[fao] = 'destacat';
      g.afegeix(`$m = ${texNombre(m)}$ i $n = ${texNombre(n)}$ són nombres: la recta $y = ${M.texPolinomi(M.termes([n, m]))}$ és una asímptota obliqua. `
        + 'Quan $x$ és molt gran, la gràfica s\'hi acosta.');
    } else {
      const fao = g.fila('asimptotes');
      g.files[fao] = K('Ao', '\\text{No hi ha asímptotes obliqües}');
      g.classes[fao] = 'destacat';
      g.afegeix('El límit és infinit, i $m$ ha de ser un nombre: no hi ha asímptota obliqua (a $-\\infty$ passa el mateix). '
        + 'La gràfica creix més de pressa que qualsevol recta: és una branca parabòlica.');
    }
  }

  /* ── 3. Punts de tall amb els eixos ── */
  g.apartat(3);
  const zeroDom = !fora.some(a => a.esZero());
  if (zeroDom) {
    const y0 = fRad(ZERO);
    const fv = g.fila('valors');
    cadena(g, {fila: fv, P: 'U0', esquerra: 'f(0)', parts: [
      [pol ? substitucio(P, ZERO) : `\\dfrac{${substitucio(P, ZERO)}}{${substitucio(Q, ZERO)}}`,
        '3. Punts de tall amb els eixos. Primer, amb l\'eix d\'ordenades: és el punt de la gràfica amb $x = 0$. Calcula $f(0)$.'],
      [texNombre(y0), `Opera: $f(0) = ${texNombre(y0)}$.`],
    ]});
    posaPunt(ZERO, y0);
  }
  const fq = g.fila('punts');
  g.classes[fq] = 'destacat';
  if (zeroDom) {
    g.files[fq] = K('Zq', `Q(0,\\ ${texNombre(fRad(ZERO))})`);
    g.afegeix(`La gràfica talla l'eix d'ordenades en el punt $Q(0,\\ ${texNombre(fRad(ZERO))})$.`);
  } else {
    g.files[fq] = K('Zq', '\\text{No talla l\'eix d\'ordenades}');
    g.afegeix('$x = 0$ no és del domini: la gràfica no talla l\'eix d\'ordenades.');
  }
  // Amb l'eix d'abscisses: f(x) = 0.
  const eqf = g.fila('equacio:f');
  let zeros;
  if (pol) {
    zeros = Mt.passosArrels(g, {p: P, files: {equacio: eqf, lliures: g.filesLliures('equacio:f', 4)}, prefix: 'c', nom: 'f(x)', irracionals: true,
      inici: 'Ara, amb l\'eix d\'abscisses: són els punts de la gràfica amb $y = 0$. Resol l\'equació $f(x) = 0$.'});
  } else {
    g.files[eqf] = K('cEn', 'f(x)') + R('cEq', '=') + K('cEz', '0');
    g.afegeix('Ara, amb l\'eix d\'abscisses: són els punts de la gràfica amb $y = 0$. Resol l\'equació $f(x) = 0$.');
    g.files[eqf] = K('cEf', texF) + R('cEq', '=') + K('cEz', '0');
    g.afegeix('Substitueix $f(x)$ per la seva expressió.');
    zeros = Mt.passosArrels(g, {p: P, files: {equacio: eqf, lliures: g.filesLliures('equacio:f', 4)}, prefix: 'c', irracionals: true,
      inici: 'Una fracció val $0$ quan el numerador val $0$ (i el denominador no): resol aquesta equació.'});
  }
  if (zeros.some(z => fora.some(a => a.igual(z)))) throw new Error('grafica-funcio: un zero fora del domini (cal tatxar-lo)');
  zeros.forEach(z => posaPunt(z, ZERO));
  const fp = g.fila('punts');
  g.classes[fp] = 'destacat';
  const nomP = (i, n) => (n > 1 ? `P_{${i + 1}}` : 'P');
  g.files[fp] = K('Zp', zeros.length ? zeros.map((z, i) => `${nomP(i, zeros.length)}(${texNombre(z)},\\ 0)`).join(',\\quad ')
    : '\\text{No talla l\'eix d\'abscisses}');
  g.afegeix(zeros.length ? `La gràfica talla l'eix d'abscisses ${zeros.length > 1 ? 'en els punts' : 'en el punt'} `
    + iCatala(zeros.map((z, i) => `$${nomP(i, zeros.length)}(${texNombre(z)},\\ 0)$`)) + '.'
    : 'L\'equació no té solucions: la gràfica no talla l\'eix d\'abscisses.');

  /* ── 4 i 5. Les derivades, les equacions, les taules de signes ── */
  const d1 = seccioDerivada(g, {ordre: 1, P, Q, pol, fora, texF, fRad, posaPunt});
  seccioDerivada(g, {ordre: 2, P, Q, pol, fora, texF, fRad, posaPunt, d1});

  /* ── 6 i 7. Taula de valors i gràfica ── */
  const vores = [-Infinity, ...ordena(fora).map(a => a.valor()), Infinity];
  const trams = [];
  for (let i = 0; i + 1 < vores.length; i++) trams.push({a: vores[i], b: vores[i + 1]});
  seccionsFinals(g, {extres: pr.extres, valorY: (x, text) => passosValor(P, Q, pol, x, text), yDe: fRad, posaPunt, taula,
    hiHaPunts: d1.hiHaPunts, ff: x => flotant(P, x) / flotant(Q, x), trams, finestra: pr.finestra,
    asimptotes: av.map(a => ({v: a.valor()})).concat(l.finit ? [{h: l.finit.valor()}] : []).concat(obliqua ? [{m: obliqua.m.valor(), n: obliqua.n.valor()}] : [])});
  return g.passos;
}

/** Els passos del valor de f en x: substitució, (valors dels termes), resultat. [tex, text]. */
function passosValor(P, Q, pol, x, text) {
  const v = valor(P, x).quocient(valor(Q, x));
  const parts = [];
  if (pol) {
    parts.push([substitucio(P, x), text]);
    if (termes(P).length > 1) parts.push([termesCalculats(P, x), 'Calcula cada terme.']);
  } else {
    parts.push([`\\dfrac{${substitucio(P, x)}}{${substitucio(Q, x)}}`, text]);
    const a = valor(P, x), b = valor(Q, x);
    // «a/b» només si no és ja el resultat (una fracció irreductible amb denominador positiu es veuria dues vegades).
    const jaEs = !esIrracional(a) && !esIrracional(b) && fr(b).signe() > 0 && fr(a).esEnter() && fr(b).esEnter() && M.mcd(fr(a).num, fr(b).num) === 1;
    if (!b.igual(1) && !jaEs) parts.push([`\\dfrac{${texNombre(a)}}{${texNombre(b)}}`, 'Calcula el numerador i el denominador.']);
  }
  parts.push([texAprox(v), esIrracional(v) ? `Simplifica: $${texNombre(v)}$. Per dibuixar-lo, el valor aproximat.` : `Opera: el valor és $${texNombre(v)}$.`]);
  // Sense passos repetits (p. ex. «f(0) = 0 = 0»).
  return parts.filter((p, i) => i === 0 || p[0] !== parts[i - 1][0]);
}

/**
 * Els apartats 4 (ordre 1: f', creixement i extrems) i 5 (ordre 2: f'', concavitat i inflexions) d'una funció
 * polinòmica o racional. Torna {N, den} de la derivada (per a l'ordre 2) i si hi ha extrems o inflexions.
 */
function seccioDerivada(g, {ordre, P, Q, pol, fora, texF, fRad, posaPunt, d1}) {
  const primera = ordre === 1;
  const prima = primera ? "'" : "''";
  const nomD = `f${prima}(x)`;
  const PX = primera ? '1' : '2';
  g.apartat(primera ? 4 : 5);
  const inici = primera
    ? '4. Creixement, decreixement i extrems relatius. Calcula la derivada, $f\'(x)$: el seu signe diu on $f$ creix i on decreix.'
    : '5. Concavitat positiva o negativa i punts d\'inflexió. Calcula la segona derivada, $f\'\'(x)$: el seu signe diu cap on es corba la gràfica.';

  /* La derivada: N/den, amb den = Q^(ordre + 1) (un polinomi: den = 1). */
  const fd = g.fila(primera ? 'derivada1' : 'derivada2');
  let N, potDen;                                     // numerador (coeficients) i exponent de Q al denominador
  if (pol) {
    const base = primera ? P : d1.N;
    N = deriva(base);
    potDen = 0;
    // Primer la derivada indicada (amb el títol de l'apartat), després el resultat: si no, el text no hi cabria.
    cadena(g, {fila: fd, P: 'D' + PX, esquerra: nomD, parts: [[`(${tp(base)})'`, inici],
      [tp(N), `Deriva terme a terme. ${Dd.reglesDerivada(termes(base))}`]]});
  } else if (primera) {
    const dP = deriva(P), dQ = deriva(Q);
    const A = prod(dP, Q), B = prod(P, dQ);
    N = coefs(suma(A, escala(B, fr(-1))));
    potDen = 2;
    const den = potencia(Q, 2);
    const desplegat = termes(A).concat(termes(B).map(t => ({n: t.n, c: fr(t.c).oposada()})));
    const parts = [
      [`\\left(${texF}\\right)'`, inici],
      [`\\dfrac{${producteTex(factor(dP), factor(Q))} - ${producteTex(factor(P), factor(dQ))}}{${den}}`,
        'Fes servir la regla del quocient: $\\left(\\frac{P}{Q}\\right)\' = \\frac{P\' \\cdot Q - P \\cdot Q\'}{Q^2}$, '
        + `amb $P = ${tp(P)}$, $P' = ${tp(dP)}$, $Q = ${tp(Q)}$ i $Q' = ${tp(dQ)}$.`],
      [`\\dfrac{${tp(A)} - ${factor(B)}}{${den}}`, 'Multiplica cada producte. El denominador, deixa\'l com a potència.'],
      [`\\dfrac{${M.texPolinomi(desplegat)}}{${den}}`, 'Treu el parèntesi: el $-$ del davant canvia el signe de cada terme de dins.'],
      [`\\dfrac{${tp(N)}}{${den}}`, 'Agrupa els termes semblants.'],
    ];
    cadena(g, {fila: fd, P: 'D1', esquerra: nomD, apila: true, parts: parts.filter((p, i) => i === 0 || p[0] !== parts[i - 1][0])});
  } else {
    // f'' de N₁/Q²: (N₁'·Q² − N₁·2Q·Q')/Q⁴ = Q·(N₁'·Q − 2N₁·Q')/Q⁴ = (N₁'·Q − 2N₁·Q')/Q³.
    const N1 = d1.N, dN = deriva(N1), dQ = deriva(Q);
    const A = prod(dN, Q), B = escala(prod(N1, dQ), fr(2));
    N = coefs(suma(A, escala(B, fr(-1))));
    potDen = 3;
    const desplegat = termes(A).concat(termes(B).map(t => ({n: t.n, c: fr(t.c).oposada()})));
    const qf = factor(Q);
    const dins = `${producteTex(factor(dN), qf)} - ${producteTex('2', factor(N1), factor(dQ))}`;
    const parts = [
      [`\\left(\\dfrac{${tp(N1)}}{${potencia(Q, 2)}}\\right)'`, `${inici} Deriva $f'(x)$.`],
      [`\\dfrac{${producteTex(factor(dN), potencia(Q, 2))} - ${producteTex(factor(N1), '2', qf, factor(dQ))}}{${potencia(Q, 4)}}`,
        `Torna a fer servir la regla del quocient. La derivada de $${potencia(Q, 2)}$ és $2 \\cdot ${qf}${factor(dQ) === '1' ? '' : ' \\cdot ' + factor(dQ)}$.`],
      [`\\dfrac{${qf} \\cdot \\left\\lbrack ${dins} \\right\\rbrack}{${potencia(Q, 4)}}`, `Treu factor comú $${qf}$ al numerador.`],
      [`\\dfrac{${dins}}{${potencia(Q, 3)}}`, `Simplifica $${qf}$: a dalt i a baix.`],
      [`\\dfrac{${tp(A)} - ${factor(B)}}{${potencia(Q, 3)}}`, 'Multiplica cada producte.'],
      [`\\dfrac{${M.texPolinomi(desplegat)}}{${potencia(Q, 3)}}`, 'Treu el parèntesi: el $-$ del davant canvia el signe de cada terme de dins.'],
      [`\\dfrac{${tp(N)}}{${potencia(Q, 3)}}`, 'Agrupa els termes semblants.'],
    ];
    cadena(g, {fila: fd, P: 'D2', esquerra: nomD, apila: true, parts: parts.filter((p, i) => i === 0 || p[0] !== parts[i - 1][0])});
  }
  const texD = potDen ? `\\dfrac{${tp(N)}}{${potencia(Q, potDen)}}` : tp(N);
  const valorD = t => valor(N, t).quocient(potDen ? valor(Q, t).potencia(potDen) : fr(1));

  /* L'equació f'(x) = 0 o f''(x) = 0. */
  const pre = primera ? 'd' : 'e';
  const eq = g.fila(primera ? 'equacio:f1' : 'equacio:f2');
  const lliures = g.filesLliures(primera ? 'equacio:f1' : 'equacio:f2', 4);
  const textEq = primera ? 'Els punts crítics són les solucions de l\'equació $f\'(x) = 0$.'
    : 'Els possibles punts d\'inflexió són les solucions de l\'equació $f\'\'(x) = 0$.';
  let arrels;
  if (pol) {
    arrels = Mt.passosArrels(g, {p: N, files: {equacio: eq, lliures}, prefix: pre, nom: nomD, irracionals: true, inici: textEq});
  } else {
    g.files[eq] = K(pre + 'En', nomD) + R(pre + 'Eq', '=') + K(pre + 'Ez', '0');
    g.afegeix(textEq);
    g.files[eq] = K(pre + 'Ef', texD) + R(pre + 'Eq', '=') + K(pre + 'Ez', '0');
    g.afegeix(`Substitueix $${nomD}$ per la seva expressió.`);
    arrels = Mt.passosArrels(g, {p: N, files: {equacio: eq, lliures}, prefix: pre, irracionals: true,
      inici: 'Una fracció val $0$ quan el numerador val $0$: resol aquesta equació.'});
  }
  if (arrels.some(z => fora.some(a => a.igual(z)))) throw new Error('grafica-funcio: una solució fora del domini (cal tatxar-la)');
  if (!arrels.length) g.completa(primera ? ' No hi ha punts crítics.' : ' No hi ha punts on $f\'\'(x) = 0$.');

  const res = estudiSignes(g, {ordre, trossos: [[null, null]], fora, arrels, posaPunt, yDe: fRad,
    valorY: (x, text) => passosValor(P, Q, pol, x, text),
    prova: t => {
      const v = valorD(t);
      const sub = potDen ? `\\dfrac{${substitucio(N, t)}}{(${substitucio(Q, t)})^{${potDen}}}` : substitucio(N, t);
      return {tex: `${sub} = ${texNombre(v)}`, positiu: v.signe() > 0};
    }});
  return {N, hiHaPunts: res.hiHaPunts || Boolean(d1 && d1.hiHaPunts)};
}

/**
 * La taula de signes de f' (ordre 1) o de f'' (ordre 2) i el que se'n treu: els valors de prova, com és f, els punts
 * especials (extrems o inflexions), les seves y i la conclusió. Per a tots els tipus de funció:
 *   trossos: els intervals oberts del domini on hi ha la derivada ([[a, b]], a i b exactes o null = ∞);
 *   fora: punts de dins d'un tros on f no existeix (columnes amb ∄: les racionals);
 *   arrels: on la derivada val 0 (dins del domini);
 *   prova(t): el que va després de «f'(t) =» a la fila dels valors de prova: {tex, positiu};
 *   valorY(x, text): les parts de la cadena «f(x) = …»; yDe(x): la y exacta;
 *   textTaula: el text del primer pas de la taula (si no n'hi ha, el de les racionals).
 * Torna {hiHaPunts}: si hi ha extrems o inflexions.
 */
function estudiSignes(g, {ordre, trossos, fora, arrels, prova, valorY, yDe, posaPunt, textTaula = null}) {
  const primera = ordre === 1;
  const prima = primera ? "'" : "''";
  const nomD = `f${prima}(x)`, nomCurt = `f${prima}`;
  const PX = primera ? '1' : '2';
  // Les columnes: a cada tros, els intervals i els punts (fora o arrels) que el parteixen.
  const columnes = [], intervals = [], punts = [];
  trossos.forEach(([a, b], it) => {
    const dins = v => (a === null || v.valor() > a.valor()) && (b === null || v.valor() < b.valor());
    let esq = a;
    for (const v of ordena(fora.concat(arrels).filter(dins))) {
      intervals.push({a: esq, b: v, tros: it});
      columnes.push({interval: [esq, v]});
      punts.push({valor: v, fora: fora.some(w => w.igual(v)), esq: intervals.length - 1, dre: intervals.length});
      columnes.push({punt: v});
      esq = v;
    }
    intervals.push({a: esq, b, tros: it});
    columnes.push({interval: [esq, b]});
  });
  const nI = intervals.length;
  const cel = {di: Array(nI).fill(''), dp: Array(punts.length).fill(''), fi: Array(nI).fill(''), fp: Array(punts.length).fill('')};
  const T = 'T' + PX;
  const taula = () => taulaSignes(T, columnes, [{nom: 'd', etiqueta: `\\boldsymbol{${nomD}}`, i: cel.di, p: cel.dp}, {nom: 'f', etiqueta: '\\boldsymbol{f(x)}', i: cel.fi, p: cel.fp}]);
  const ft = g.fila(primera ? 'taula1' : 'taula2');
  const fprova = g.fila(primera ? 'proves1' : 'proves2');
  g.files[ft] = taula();
  g.classes[ft] = 'separat desplacable';
  if (textTaula) g.afegeix(textTaula);
  else {
    const quins = arrels.length && fora.length ? `Els ${primera ? 'punts crítics' : 'punts on $f\'\'(x) = 0$'} i els punts que no són del domini`
      : arrels.length ? `Els ${primera ? 'punts crítics' : 'punts on $f\'\'(x) = 0$'}` : 'Els punts que no són del domini';
    g.afegeix(punts.length ? `Fes la taula de signes de $${nomCurt}$. ${quins} (${llista(punts.map(p => p.valor))}) separen la recta en intervals.`
      : `Fes la taula de signes de $${nomCurt}$. No hi ha cap punt que separi la recta: només hi ha l'interval $(-\\infty,\\ +\\infty)$.`);
  }
  if (punts.length) {
    punts.forEach((p, k) => { cel.dp[k] = p.fora ? '\\nexists' : '0'; });
    g.files[ft] = taula();
    g.afegeix([arrels.length ? `Als punts on s'anul·la, $${nomCurt} = 0$.` : '', fora.length ? 'On $f$ no existeix, les seves derivades tampoc: hi poses $\\nexists$.' : ''].filter(Boolean).join(' '));
  }
  // El signe a cada interval: un valor de prova.
  const proves = [];
  intervals.forEach(({a, b}, j) => {
    const t = valorDeProva(a, b), Tt = texNombre(t);
    const {tex, positiu} = prova(t);
    proves.push(K(`S${PX}a${j}`, `f${prima}(${Tt})`) + R(`S${PX}q${j}`, '=') + K(`S${PX}b${j}`, tex)
      + R(`S${PX}w${j}`, positiu ? '>' : '<') + K(`S${PX}z${j}`, '0'));
    g.files[fprova] = linies(proves);
    g.afegeix(`Interval $${texInterval(a, b)}$: tria'n un valor, per exemple $x = ${Tt}$, i calcula $f${prima}(${Tt})$.`, {cursor: {clic: `${T}Hi${j}`}});
    cel.di[j] = positiu ? '+' : '-';
    g.files[ft] = taula();
    g.afegeix(`$f${prima}$ no canvia de signe dins de l'interval: és ${positiu ? 'positiva' : 'negativa'} a tot l'interval. Hi poses un $${positiu ? '+' : '-'}$.`,
      {cursor: {arrossega: `S${PX}w${j}`, fins: `${T}di${j}`}});
  });
  // El comportament de f, i els punts especials.
  cel.fi = cel.di.map(s => (primera ? (s === '+' ? '\\nearrow' : '\\searrow') : (s === '+' ? '\\cup' : '\\cap')));
  punts.forEach((p, k) => { if (p.fora) cel.fp[k] = '\\nexists'; });
  g.files[ft] = taula();
  g.afegeix(primera ? 'On $f\' > 0$, $f$ creix ($\\nearrow$); on $f\' < 0$, $f$ decreix ($\\searrow$).'
    : 'On $f\'\' > 0$, la concavitat és positiva ($\\cup$); on $f\'\' < 0$, la concavitat és negativa ($\\cap$).');
  const especials = [];                              // [{valor, tipus}]
  const sense = [];
  punts.forEach((p, k) => {
    if (p.fora) return;
    const [e, d] = [cel.di[p.esq], cel.di[p.dre]];
    if (e === d) { sense.push(p.valor); return; }
    const tipus = primera ? (e === '+' ? 'màxim' : 'mínim') : 'inflexió';
    cel.fp[k] = `\\text{${tipus}}`;
    especials.push({valor: p.valor, tipus});
  });
  if (arrels.length) {
    const fi = sense.length ? ` En ${llista(sense)} no canvia: ${primera ? 'no hi ha ni màxim ni mínim' : 'no hi ha punt d\'inflexió'}.` : '';
    const abans = g.passos.length;
    g.files[ft] = taula();
    g.afegeix((primera ? 'Als punts crítics: si $f$ passa de créixer a decréixer, hi ha un màxim relatiu; si passa de decréixer a créixer, un mínim relatiu.'
      : 'Als punts on $f\'\'(x) = 0$: si la concavitat canvia, hi ha un punt d\'inflexió.') + fi);
    if (g.passos.length === abans) g.completa(fi);
  }

  /* Les y dels extrems o de les inflexions. */
  if (especials.length) {
    const fv = g.fila('valors'), ls = {linies: [], index: 0};
    especials.forEach((e, i) => {
      ls.index = ls.linies.length;
      ls.linies.push('');
      cadena(g, {fila: fv, P: `U${PX}${i}`, esquerra: `f(${texNombre(e.valor)})`, ls, parts: valorY(e.valor,
        i === 0 ? `Calcula la $y$ ${especials.length > 1 ? `de cada ${primera ? 'extrem' : 'punt d\'inflexió'}` : `${primera ? 'de l\'extrem' : 'del punt d\'inflexió'}`}: $f(${texNombre(e.valor)})$.`
          : `I $f(${texNombre(e.valor)})$.`)});
      e.y = yDe(e.valor);
      posaPunt(e.valor, e.y);
    });
  }

  /* La conclusió: els intervals seguits del mateix signe s'uneixen si el punt d'entre mig és del domini. */
  const unio = signe => {
    const trossosU = [];                             // [[j inicial, j final]]
    cel.di.forEach((s, j) => {
      if (s !== signe) return;
      const ultim = trossosU[trossosU.length - 1];
      const entre = punts.find(p => p.dre === j);
      if (ultim && ultim[1] === j - 1 && entre && !entre.fora) ultim[1] = j; else trossosU.push([j, j]);
    });
    return trossosU.length ? trossosU.map(([a, b]) => texInterval(intervals[a].a, intervals[b].b)).join(' \\cup ') : null;
  };
  const [mes, menys] = [unio('+'), unio('-')];
  const fc = g.fila(primera ? 'conclusio1' : 'conclusio2');
  const C = 'C' + PX;
  const punt = e => `(${texNombre(e.valor)},\\ ${texNombre(e.y)})`;
  const ls = primera
    ? [K(C + 'a', `\\text{Creixent: } ${mes || '\\text{cap interval}'}`), K(C + 'b', `\\text{Decreixent: } ${menys || '\\text{cap interval}'}`)]
    : [K(C + 'a', `\\text{Concavitat positiva: } ${mes || '\\text{cap interval}'}`), K(C + 'b', `\\text{Concavitat negativa: } ${menys || '\\text{cap interval}'}`)];
  if (primera) {
    const maxs = especials.filter(e => e.tipus === 'màxim'), mins = especials.filter(e => e.tipus === 'mínim');
    if (!especials.length) ls.push(K(C + 'c', '\\text{No hi ha extrems relatius}'));
    maxs.forEach((e, i) => ls.push(K(C + 'x' + i, `\\text{Màxim relatiu en } ${punt(e)}`)));
    mins.forEach((e, i) => ls.push(K(C + 'n' + i, `\\text{Mínim relatiu en } ${punt(e)}`)));
  } else {
    ls.push(K(C + 'c', especials.length === 0 ? '\\text{No hi ha punts d\'inflexió}'
      : `\\text{Punt${especials.length > 1 ? 's' : ''} d'inflexió en } ${especials.map(punt).join(',\\ ')}`));
  }
  g.files[fc] = linies(ls);
  g.classes[fc] = 'destacat';
  const textP = e => `$${punt(e)}$`;
  g.afegeix(primera
    ? `Resultat: $f$ ${mes ? `creix a $${mes}$` : 'no creix a cap interval'} i ${menys ? `decreix a $${menys}$` : 'no decreix a cap interval'}`
      + (especials.length ? '; ' + iCatala(especials.map(e => `${e.tipus === 'màxim' ? 'màxim' : 'mínim'} relatiu en ${textP(e)}`)) : '; no té extrems relatius') + '.'
    : `Resultat: la concavitat és ${mes ? `positiva a $${mes}$` : 'positiva a cap interval'} i ${menys ? `negativa a $${menys}$` : 'negativa a cap interval'}`
      + (especials.length ? `; punt${especials.length > 1 ? 's' : ''} d'inflexió en ${iCatala(especials.map(textP))}` : '; no té punts d\'inflexió') + '.');
  return {hiHaPunts: especials.length > 0};
}

/**
 * Els apartats 6 (la taula de valors: els punts que ja hi ha i dos més, «extres») i 7 (la gràfica) de qualsevol funció.
 * taula: els punts [{x, y}] (exactes); ff: f amb nombres decimals; trams: els trossos del domini per al dibuix
 * ([{a, b, tancatA, tancatB}]); asimptotes: per al dibuix ({v}, {h} o {m, n}).
 */
function seccionsFinals(g, {extres, valorY, yDe, posaPunt, taula, hiHaPunts, ff, trams, asimptotes, finestra}) {
  g.apartat(6);
  const fx = g.fila('valors'), lsx = {linies: [], index: 0};
  extres.map(fr).forEach((x, i) => {
    lsx.index = lsx.linies.length;
    lsx.linies.push('');
    cadena(g, {fila: fx, P: 'Ux' + i, esquerra: `f(${texNombre(x)})`, ls: lsx, parts: valorY(x,
      i === 0 ? `6. Taula de valors. Ja tens els talls amb els eixos${hiHaPunts ? ', els extrems i els punts d\'inflexió' : ''}. Afegeix-hi dos punts més, perquè es vegi cap on va la gràfica: calcula $f(${texNombre(x)})$.`
        : `I $f(${texNombre(x)})$.`)});
    posaPunt(x, yDe(x));
  });
  const ord = taula.slice().sort((a, b) => a.x.valor() - b.x.valor());
  const fT = g.fila('taula-valors');
  g.files[fT] = `\\begin{array}{c|${'c'.repeat(ord.length)}} ${K('HLx', '\\boldsymbol{x}')} & ${ord.map((p, j) => K('Hx' + j, texAprox(p.x))).join(' & ')} \\\\ \\hline `
    + `${K('HLy', '\\boldsymbol{f(x)}')} & ${ord.map((p, j) => K('Hy' + j, texAprox(p.y))).join(' & ')} \\end{array}`;
  g.classes[fT] = 'separat';
  g.afegeix('Posa tots els punts en una taula, ordenats per la $x$. Els valors irracionals, també aproximats: els necessites per dibuixar-los.');

  g.apartat(7);
  const fG = g.fila('grafica');
  const punts = ord.map(p => ({x: p.x.valor(), y: p.y.valor()}));
  const dibuix = corba => Gr.esbos({f: ff, trams, x: finestra.x, y: finestra.y, asimptotes, punts, corba});
  g.files[fG] = dibuix(false);
  g.afegeix(`7. Gràfica de la funció. Dibuixa els eixos${asimptotes.length ? (asimptotes.length > 1 ? ', les asímptotes (discontínues)' : ', l\'asímptota (discontínua)') : ''} i els punts de la taula.`);
  g.files[fG] = dibuix(true);
  g.afegeix(`Uneix els punts seguint el que has estudiat: on creix i on decreix, la concavitat${asimptotes.length ? ` i com s'acosta ${asimptotes.length > 1 ? 'a les asímptotes' : 'a l\'asímptota'}` : ''}. Aquest és l'esbós de la gràfica.`);
}


/* ── 7. FUNCIONS AMB RADICALS ──────────────────────────────────────── */
/*
 * Cada funció té el seu guió, escrit a mà, per als apartats 1 a 5 (les inequacions del domini, els límits, les
 * derivades amb la regla de l'arrel, les equacions), amb les mateixes peces que les racionals: cadena, equacioMa,
 * estudiSignes (taules, valors de prova, conclusions). Els apartats 6 i 7, comuns (seccionsFinals).
 * Les dades de cada guió (H): sub(x) la substitució de x a f (TeX), mig(x) un pas intermedi (o null), exacte(x) el
 * valor exacte (Fraccio o Radical) i valorY, posaPunt.
 */

const DOMINI = K('Vt', '\\text{Dom}\\,') + K('Vf', 'f') + R('Vq', '=');
const INICI4 = '4. Creixement, decreixement i extrems relatius. Calcula la derivada, $f\'(x)$: el seu signe diu on $f$ creix i on decreix.';
const INICI5 = '5. Concavitat positiva o negativa i punts d\'inflexió. Calcula la segona derivada, $f\'\'(x)$: el seu signe diu cap on es corba la gràfica.';
const ARREL_DOMINI = '1. Domini i possibles asímptotes verticals. L\'arrel quadrada d\'un nombre negatiu no existeix: el que hi ha dins de l\'arrel no pot ser negatiu. Planteja la inequació.';
const INICI2 = '2. Límits en l\'infinit i possibles asímptotes horitzontals i obliqües.';
const INICI3 = '3. Punts de tall amb els eixos. Primer, amb l\'eix d\'ordenades: és el punt de la gràfica amb $x = 0$. Calcula $f(0)$.';
const ABSCISSES = 'Ara, amb l\'eix d\'abscisses: són els punts de la gràfica amb $y = 0$. Resol l\'equació $f(x) = 0$.';
const CAP_VERTICAL = 'No hi ha asímptotes verticals';
const NO_OBLIQUA = 'El límit és infinit, i $m$ ha de ser un nombre: no hi ha asímptota obliqua. La gràfica creix més de pressa que qualsevol recta: és una branca parabòlica.';
/** El valor de prova (exacte) dins d'un text TeX: entre parèntesis si és negatiu o fraccionari. */
const arg = t => texArgument(t);
/** prova(t) per a estudiSignes amb nombres decimals: la substitució i el valor aproximat. */
const provaAprox = (sub, fd) => t => { const v = fd(t.valor()); return {tex: `${sub(t)} \\approx ${decimal(v)}`, positiu: v > 0}; };

function passosRadical(pr) {
  const g = nouGuio();
  const taula = [];
  const posaPunt = (x, y) => { if (!taula.some(p => p.x.igual(x))) taula.push({x, y}); };
  const dades = pr.guio.dades;
  const valorY = (x, text) => {
    const y = dades.exacte(x);
    const mig = dades.mig ? dades.mig(x) : null;
    const parts = [[dades.sub(x), text]];
    if (mig && mig !== texNombre(y)) parts.push([mig, 'Opera dins de l\'arrel.']);
    parts.push([texAprox(y), esIrracional(y) ? `Opera: $${texNombre(y)}$. Per dibuixar-lo, el valor aproximat.` : `Opera: el valor és $${texNombre(y)}$.`]);
    return parts.filter((p, i) => i === 0 || p[0] !== parts[i - 1][0]);
  };
  const H = {posaPunt, valorY, yDe: dades.exacte};
  const f0 = g.fila('f');
  g.files[f0] = F.membreEsquerre('F', 'f', 'x') + K('Fe', pr.tex);
  g.afegeix('Per fer l\'esbós, estudia la funció en set apartats, l\'un darrere l\'altre. Totes les conclusions es queden a la pissarra: '
    + 'les necessitaràs per dibuixar la gràfica.');
  const r = pr.guio(g, H);                       // apartats 1–5: {asimptotes, hiHaPunts}
  seccionsFinals(g, {extres: pr.extres, valorY, yDe: dades.exacte, posaPunt, taula, hiHaPunts: r.hiHaPunts, ff: pr.f, trams: pr.trams,
    asimptotes: r.asimptotes, finestra: pr.finestra});
  return g.passos;
}

/** El tall amb l'eix d'ordenades: f(0) i la fila Q(0, f(0)). */
function tallOrdenades(g, H) {
  cadena(g, {fila: g.fila('valors'), P: 'U0', esquerra: 'f(0)', parts: H.valorY(ZERO, INICI3)});
  const y0 = H.yDe(ZERO);
  H.posaPunt(ZERO, y0);
  destacat(g, 'punts', K('Zq', `Q(0,\\ ${texNombre(y0)})`), `La gràfica talla l'eix d'ordenades en el punt $Q(0,\\ ${texNombre(y0)})$.`);
}
/** La fila dels talls amb l'eix d'abscisses, P₁(…, 0)… */
function tallsAbscisses(g, H, zeros) {
  const z = ordena(zeros);
  z.forEach(x => H.posaPunt(x, ZERO));
  const nomP = i => (z.length > 1 ? `P_{${i + 1}}` : 'P');
  destacat(g, 'punts', K('Zp', z.map((x, i) => `${nomP(i)}(${texNombre(x)},\\ 0)`).join(',\\quad ')),
    `La gràfica talla l'eix d'abscisses ${z.length > 1 ? 'en els punts' : 'en el punt'} ${iCatala(z.map((x, i) => `$${nomP(i)}(${texNombre(x)},\\ 0)$`))}.`);
}

/* f(x) = √(1 + x³): Dom [−1, +∞); cap asímptota; x = 0, punt crític sense extrem i punt d'inflexió. */
function guioArrelCubica(g, H) {
  g.apartat(1);
  cadenaSep(g, {fila: g.fila('inequacio'), P: 'N', sep: '\\iff', parts: [
    ['1 + x^{3} \\ge 0', ARREL_DOMINI],
    ['x^{3} \\ge -1', 'Passa l\'$1$ a l\'altre costat, restant.'],
    ['x \\ge -1', 'Fes l\'arrel cúbica als dos costats: la desigualtat no canvia (ni amb nombres negatius), i $\\sqrt[3]{-1} = -1$.'],
  ]});
  destacat(g, 'domini', DOMINI + K('VI', '[-1,\\ +\\infty)'), 'El domini és $[-1,\\ +\\infty)$. El $-1$ hi és: $f(-1) = \\sqrt{0} = 0$.');
  destacat(g, 'asimptotes', K('Av', `\\text{${CAP_VERTICAL}}`), 'Dins del domini, $f$ és l\'arrel d\'un polinomi: no es fa infinita en cap punt. No hi ha asímptotes verticals.');

  g.apartat(2);
  cadena(g, {fila: g.fila('limits'), P: 'Ip', esquerra: `${LIM('+\\infty')} f(x)`, parts: [
    [`${LIM('+\\infty')} \\sqrt{1 + x^{3}}`, `${INICI2} El domini només s'allarga cap a la dreta: només cal estudiar $x \\to +\\infty$.`],
    ['+\\infty', 'Quan $x$ és molt gran, $1 + x^3$ es fa tan gran com vulguis, i la seva arrel també.'],
  ]});
  destacat(g, 'asimptotes', K('Ah', '\\text{No hi ha asímptotes horitzontals}'), 'El límit és infinit: no hi ha asímptota horitzontal. Però serveix per a l\'esbós: quan $x \\to +\\infty$, $f(x) \\to +\\infty$.');
  cadena(g, {fila: g.fila('limits'), P: 'Om', esquerra: `${LIM('+\\infty')} \\dfrac{f(x)}{x}`, parts: [
    [`${LIM('+\\infty')} \\dfrac{\\sqrt{1 + x^{3}}}{x}`, 'Potser hi ha una asímptota obliqua, $y = mx + n$. El pendent seria el nombre $m = \\lim \\frac{f(x)}{x}$.'],
    [`${LIM('+\\infty')} \\sqrt{\\dfrac{1 + x^{3}}{x^{2}}}`, 'Com que $x > 0$, $x = \\sqrt{x^2}$: posa-ho tot dins de l\'arrel.'],
    [`${LIM('+\\infty')} \\sqrt{\\dfrac{1}{x^{2}} + x}`, 'Divideix cada terme per $x^2$.'],
    ['+\\infty', '$\\frac{1}{x^2}$ tendeix a $0$, però $x$ es fa tan gran com vulguis: el límit és $+\\infty$.'],
  ]});
  destacat(g, 'asimptotes', K('Ao', '\\text{No hi ha asímptotes obliqües}'), NO_OBLIQUA);

  g.apartat(3);
  tallOrdenades(g, H);
  const zeros = equacioMa(g, {pre: 'c', tipus: 'equacio:f',
    principal: [['f(x)', ABSCISSES], ['\\sqrt{1 + x^{3}}', 'Substitueix $f(x)$ per la seva expressió.']],
    treball: [['1 + x^{3} = 0', 'Una arrel val $0$ només quan el que hi ha a dins val $0$.'], ['x^{3} = -1', 'Passa l\'$1$ a l\'altre costat.']],
    solucions: [{tex: '-1', valor: fr(-1)}], textSolucions: 'L\'únic nombre que elevat al cub dona $-1$ és $-1$: la solució és $x = -1$.'});
  tallsAbscisses(g, H, zeros);

  g.apartat(4);
  cadena(g, {fila: g.fila('derivada1'), P: 'D1', esquerra: "f'(x)", parts: [
    ['\\left(\\sqrt{1 + x^{3}}\\right)\'', INICI4],
    ['\\dfrac{3x^{2}}{2\\sqrt{1 + x^{3}}}', 'Fes servir la regla de l\'arrel, $\\left(\\sqrt{u}\\right)\' = \\frac{u\'}{2\\sqrt{u}}$, amb $u = 1 + x^3$ i $u\' = 3x^2$.'],
  ]});
  const crit = equacioMa(g, {pre: 'd', tipus: 'equacio:f1',
    principal: [["f'(x)", 'Els punts crítics són les solucions de l\'equació $f\'(x) = 0$.'], ['\\dfrac{3x^{2}}{2\\sqrt{1 + x^{3}}}', 'Substitueix $f\'(x)$ per la seva expressió.']],
    treball: [['3x^{2} = 0', 'Una fracció val $0$ quan el numerador val $0$ (i el denominador no).'], ['x^{2} = 0', 'Divideix per $3$.']],
    solucions: [{tex: '0', valor: ZERO}], textSolucions: 'Només el $0$ té quadrat $0$: la solució és $x = 0$, que és del domini.'});
  const d1 = estudiSignes(g, {ordre: 1, trossos: [[fr(-1), null]], fora: [], arrels: crit, posaPunt: H.posaPunt, valorY: H.valorY, yDe: H.yDe,
    textTaula: 'Fes la taula de signes de $f\'$. $f\'$ existeix a $(-1,\\ +\\infty)$ (a $x = -1$ el denominador val $0$), i el punt crític $x = 0$ el parteix en dos intervals.',
    prova: provaAprox(t => `\\dfrac{3 \\cdot ${arg(t)}^{2}}{2\\sqrt{1 + ${arg(t)}^{3}}}`, x => 3 * x * x / (2 * Math.sqrt(1 + x ** 3)))});

  g.apartat(5);
  cadena(g, {fila: g.fila('derivada2'), P: 'D2', esquerra: "f''(x)", apila: true, parts: [
    ['\\left(\\dfrac{3x^{2}}{2\\sqrt{1 + x^{3}}}\\right)\'', `${INICI5} Deriva $f'(x)$.`],
    ['\\dfrac{6x \\cdot 2\\sqrt{1 + x^{3}} - 3x^{2} \\cdot \\dfrac{3x^{2}}{\\sqrt{1 + x^{3}}}}{4 \\cdot (1 + x^{3})}',
      'Fes servir la regla del quocient amb $P = 3x^2$ i $Q = 2\\sqrt{1 + x^3}$: $P\' = 6x$, $Q\' = \\frac{3x^2}{\\sqrt{1 + x^3}}$ (regla de l\'arrel) i $Q^2 = 4 \\cdot (1 + x^3)$.'],
    ['\\dfrac{12x \\cdot (1 + x^{3}) - 9x^{4}}{4 \\cdot (1 + x^{3}) \\cdot \\sqrt{1 + x^{3}}}', 'Multiplica el numerador i el denominador per $\\sqrt{1 + x^3}$: $\\sqrt{1 + x^3} \\cdot \\sqrt{1 + x^3} = 1 + x^3$.'],
    ['\\dfrac{12x + 12x^{4} - 9x^{4}}{4 \\cdot (1 + x^{3}) \\cdot \\sqrt{1 + x^{3}}}', 'Treu el parèntesi del numerador.'],
    ['\\dfrac{3x^{4} + 12x}{4 \\cdot (1 + x^{3}) \\cdot \\sqrt{1 + x^{3}}}', 'Agrupa els termes semblants.'],
    ['\\dfrac{3x \\cdot (x^{3} + 4)}{4 \\cdot (1 + x^{3}) \\cdot \\sqrt{1 + x^{3}}}', 'Treu factor comú $3x$: així és més fàcil veure on val $0$.'],
  ]});
  const infl = equacioMa(g, {pre: 'e', tipus: 'equacio:f2',
    principal: [["f''(x)", 'Els possibles punts d\'inflexió són les solucions de l\'equació $f\'\'(x) = 0$.'],
      ['\\dfrac{3x \\cdot (x^{3} + 4)}{4 \\cdot (1 + x^{3}) \\cdot \\sqrt{1 + x^{3}}}', 'Substitueix $f\'\'(x)$ per la seva expressió.']],
    treball: [['3x \\cdot (x^{3} + 4) = 0', 'Una fracció val $0$ quan el numerador val $0$.'],
      [`3x = 0${DISJUNCIO}x^{3} + 4 = 0`, 'Un producte val $0$ quan algun dels factors val $0$.'],
      [`x = 0${DISJUNCIO}x^{3} = -4`, 'Resol cada equació: divideix per $3$ i passa el $4$ a l\'altre costat.']],
    solucions: [{tex: '0', valor: ZERO}, {tex: '-\\sqrt[3]{4}', serveix: false}], textSolucions: 'Fes l\'arrel cúbica a la segona: $x = -\\sqrt[3]{4}$.',
    textTatxa: '$-\\sqrt[3]{4} \\approx -1{,}59$ és més petit que $-1$: no és del domini, i la tatxes. Només queda $x = 0$.'});
  const d2 = estudiSignes(g, {ordre: 2, trossos: [[fr(-1), null]], fora: [], arrels: infl, posaPunt: H.posaPunt, valorY: H.valorY, yDe: H.yDe,
    textTaula: 'Fes la taula de signes de $f\'\'$. També existeix a $(-1,\\ +\\infty)$, i $x = 0$ el parteix en dos intervals.',
    prova: provaAprox(t => `\\dfrac{3 \\cdot ${arg(t)} \\cdot (${arg(t)}^{3} + 4)}{4 \\cdot (1 + ${arg(t)}^{3}) \\cdot \\sqrt{1 + ${arg(t)}^{3}}}`,
      x => 3 * x * (x ** 3 + 4) / (4 * (1 + x ** 3) * Math.sqrt(1 + x ** 3)))});
  return {asimptotes: [], hiHaPunts: d1.hiHaPunts || d2.hiHaPunts};
}
guioArrelCubica.dades = {
  sub: x => `\\sqrt{1 + ${arg(x)}^{3}}`,
  mig: x => `\\sqrt{${texNombre(fr(1).suma(fr(x).potencia(3)))}}`,
  exacte: x => Radical.arrel(fr(1).suma(fr(x).potencia(3))),
};

/* f(x) = x·√(x + 3): Dom [−3, +∞); cap asímptota; mínim (−2, −2); sempre còncava cap amunt. */
function guioProducteArrel(g, H) {
  g.apartat(1);
  cadenaSep(g, {fila: g.fila('inequacio'), P: 'N', sep: '\\iff', parts: [
    ['x + 3 \\ge 0', ARREL_DOMINI],
    ['x \\ge -3', 'Passa el $3$ a l\'altre costat, restant.'],
  ]});
  destacat(g, 'domini', DOMINI + K('VI', '[-3,\\ +\\infty)'), 'El domini és $[-3,\\ +\\infty)$. El $-3$ hi és: $f(-3) = -3 \\cdot \\sqrt{0} = 0$.');
  destacat(g, 'asimptotes', K('Av', `\\text{${CAP_VERTICAL}}`), 'Dins del domini, $f$ és un polinomi per una arrel: no es fa infinita en cap punt. No hi ha asímptotes verticals.');

  g.apartat(2);
  cadena(g, {fila: g.fila('limits'), P: 'Ip', esquerra: `${LIM('+\\infty')} f(x)`, parts: [
    [`${LIM('+\\infty')} x\\sqrt{x + 3}`, `${INICI2} El domini només s'allarga cap a la dreta: només cal estudiar $x \\to +\\infty$.`],
    ['+\\infty', 'Quan $x$ és molt gran, $x$ i $\\sqrt{x + 3}$ també ho són: el producte de dos nombres molt grans i positius es fa tan gran com vulguis.'],
  ]});
  destacat(g, 'asimptotes', K('Ah', '\\text{No hi ha asímptotes horitzontals}'), 'El límit és infinit: no hi ha asímptota horitzontal. Però serveix per a l\'esbós: quan $x \\to +\\infty$, $f(x) \\to +\\infty$.');
  cadena(g, {fila: g.fila('limits'), P: 'Om', esquerra: `${LIM('+\\infty')} \\dfrac{f(x)}{x}`, parts: [
    [`${LIM('+\\infty')} \\dfrac{x\\sqrt{x + 3}}{x}`, 'Potser hi ha una asímptota obliqua, $y = mx + n$. El pendent seria el nombre $m = \\lim \\frac{f(x)}{x}$.'],
    [`${LIM('+\\infty')} \\sqrt{x + 3}`, 'Simplifica la $x$: a dalt i a baix.'],
    ['+\\infty', 'L\'arrel d\'un nombre cada cop més gran es fa tan gran com vulguis.'],
  ]});
  destacat(g, 'asimptotes', K('Ao', '\\text{No hi ha asímptotes obliqües}'), NO_OBLIQUA);

  g.apartat(3);
  tallOrdenades(g, H);
  const zeros = equacioMa(g, {pre: 'c', tipus: 'equacio:f',
    principal: [['f(x)', ABSCISSES], ['x\\sqrt{x + 3}', 'Substitueix $f(x)$ per la seva expressió.']],
    treball: [[`x = 0${DISJUNCIO}\\sqrt{x + 3} = 0`, 'Un producte val $0$ quan algun dels factors val $0$.'],
      [`x = 0${DISJUNCIO}x + 3 = 0`, 'Una arrel val $0$ només quan el que hi ha a dins val $0$.']],
    solucions: [{tex: '0', valor: ZERO}, {tex: '-3', valor: fr(-3)}], textSolucions: 'Passa el $3$ a l\'altre costat: $x = -3$. Totes dues solucions són del domini.'});
  tallsAbscisses(g, H, zeros);

  g.apartat(4);
  cadena(g, {fila: g.fila('derivada1'), P: 'D1', esquerra: "f'(x)", apila: true, parts: [
    ['\\left(x\\sqrt{x + 3}\\right)\'', INICI4],
    ['\\sqrt{x + 3} + x \\cdot \\dfrac{1}{2\\sqrt{x + 3}}', 'Fes servir la regla del producte, $(u \\cdot v)\' = u\' \\cdot v + u \\cdot v\'$, amb $u = x$ i $v = \\sqrt{x + 3}$: $u\' = 1$ i $v\' = \\frac{1}{2\\sqrt{x + 3}}$.'],
    ['\\dfrac{2 \\cdot (x + 3) + x}{2\\sqrt{x + 3}}', 'Posa-ho tot amb el denominador $2\\sqrt{x + 3}$: $\\sqrt{x + 3} = \\frac{2 \\cdot (x + 3)}{2\\sqrt{x + 3}}$.'],
    ['\\dfrac{3x + 6}{2\\sqrt{x + 3}}', 'Opera el numerador: $2x + 6 + x = 3x + 6$.'],
  ]});
  const crit = equacioMa(g, {pre: 'd', tipus: 'equacio:f1',
    principal: [["f'(x)", 'Els punts crítics són les solucions de l\'equació $f\'(x) = 0$.'], ['\\dfrac{3x + 6}{2\\sqrt{x + 3}}', 'Substitueix $f\'(x)$ per la seva expressió.']],
    treball: [['3x + 6 = 0', 'Una fracció val $0$ quan el numerador val $0$ (i el denominador no).'], ['3x = -6', 'Passa el $6$ a l\'altre costat.']],
    solucions: [{tex: '-2', valor: fr(-2)}], textSolucions: 'Divideix per $3$: $x = -2$, que és del domini.'});
  const d1 = estudiSignes(g, {ordre: 1, trossos: [[fr(-3), null]], fora: [], arrels: crit, posaPunt: H.posaPunt, valorY: H.valorY, yDe: H.yDe,
    textTaula: 'Fes la taula de signes de $f\'$. $f\'$ existeix a $(-3,\\ +\\infty)$ (a $x = -3$ el denominador val $0$), i el punt crític $x = -2$ el parteix en dos intervals.',
    prova: provaAprox(t => `\\dfrac{3 \\cdot ${arg(t)} + 6}{2\\sqrt{${texNombre(t)} + 3}}`, x => (3 * x + 6) / (2 * Math.sqrt(x + 3)))});

  g.apartat(5);
  cadena(g, {fila: g.fila('derivada2'), P: 'D2', esquerra: "f''(x)", apila: true, parts: [
    ['\\left(\\dfrac{3x + 6}{2\\sqrt{x + 3}}\\right)\'', `${INICI5} Deriva $f'(x)$.`],
    ['\\dfrac{3 \\cdot 2\\sqrt{x + 3} - (3x + 6) \\cdot \\dfrac{1}{\\sqrt{x + 3}}}{4 \\cdot (x + 3)}',
      'Fes servir la regla del quocient amb $P = 3x + 6$ i $Q = 2\\sqrt{x + 3}$: $P\' = 3$, $Q\' = \\frac{1}{\\sqrt{x + 3}}$ (regla de l\'arrel) i $Q^2 = 4 \\cdot (x + 3)$.'],
    ['\\dfrac{6 \\cdot (x + 3) - (3x + 6)}{4 \\cdot (x + 3) \\cdot \\sqrt{x + 3}}', 'Multiplica el numerador i el denominador per $\\sqrt{x + 3}$: $\\sqrt{x + 3} \\cdot \\sqrt{x + 3} = x + 3$.'],
    ['\\dfrac{6x + 18 - 3x - 6}{4 \\cdot (x + 3) \\cdot \\sqrt{x + 3}}', 'Treu els parèntesis del numerador: el $-$ del davant canvia el signe de cada terme.'],
    ['\\dfrac{3x + 12}{4 \\cdot (x + 3) \\cdot \\sqrt{x + 3}}', 'Agrupa els termes semblants.'],
  ]});
  const infl = equacioMa(g, {pre: 'e', tipus: 'equacio:f2',
    principal: [["f''(x)", 'Els possibles punts d\'inflexió són les solucions de l\'equació $f\'\'(x) = 0$.'],
      ['\\dfrac{3x + 12}{4 \\cdot (x + 3) \\cdot \\sqrt{x + 3}}', 'Substitueix $f\'\'(x)$ per la seva expressió.']],
    treball: [['3x + 12 = 0', 'Una fracció val $0$ quan el numerador val $0$.'], ['3x = -12', 'Passa el $12$ a l\'altre costat.']],
    solucions: [{tex: '-4', serveix: false}], textSolucions: 'Divideix per $3$: $x = -4$.',
    textTatxa: '$-4$ és més petit que $-3$: no és del domini, i la tatxes. Dins del domini, $f\'\'$ no val mai $0$.'});
  const d2 = estudiSignes(g, {ordre: 2, trossos: [[fr(-3), null]], fora: [], arrels: infl, posaPunt: H.posaPunt, valorY: H.valorY, yDe: H.yDe,
    textTaula: 'Fes la taula de signes de $f\'\'$. També existeix a $(-3,\\ +\\infty)$, i no hi ha cap punt que el parteixi: només hi ha un interval.',
    prova: provaAprox(t => `\\dfrac{3 \\cdot ${arg(t)} + 12}{4 \\cdot (${texNombre(t)} + 3) \\cdot \\sqrt{${texNombre(t)} + 3}}`, x => (3 * x + 12) / (4 * (x + 3) * Math.sqrt(x + 3)))});
  return {asimptotes: [], hiHaPunts: d1.hiHaPunts || d2.hiHaPunts};
}
guioProducteArrel.dades = {
  sub: x => `${fr(x).igual(1) ? '' : `${arg(x)} \\cdot `}\\sqrt{${texNombre(x)} + 3}`,
  mig: x => (fr(x).igual(1) ? '' : fr(x).igual(-1) ? '-' : `${texNombre(x)} \\cdot `) + `\\sqrt{${texNombre(fr(x).suma(fr(3)))}}`,
  exacte: x => fr(x).producte(Radical.arrel(fr(x).suma(fr(3)))),
};

/* f(x) = √(x² − 4): Dom (−∞, −2] ∪ [2, +∞); asímptotes obliqües y = x (a +∞) i y = −x (a −∞); sempre còncava cap avall. */
function guioArrelObliques(g, H) {
  g.apartat(1);
  cadenaSep(g, {fila: g.fila('inequacio'), P: 'N', sep: '\\iff', parts: [
    ['x^{2} - 4 \\ge 0', ARREL_DOMINI],
    ['x^{2} \\ge 4', 'Passa el $4$ a l\'altre costat, sumant.'],
    [`x \\le -2${DISJUNCIO}x \\ge 2`, 'Els nombres de quadrat $4$ o més gran són els que estan a $2$ o més del $0$: de $-2$ cap a l\'esquerra i de $2$ cap a la dreta.'],
  ]});
  destacat(g, 'domini', DOMINI + K('VI', '(-\\infty,\\ -2] \\cup [2,\\ +\\infty)'), 'El domini és $(-\\infty,\\ -2] \\cup [2,\\ +\\infty)$. El $-2$ i el $2$ hi són: $f(\\pm 2) = \\sqrt{0} = 0$.');
  destacat(g, 'asimptotes', K('Av', `\\text{${CAP_VERTICAL}}`), 'Dins del domini, $f$ és l\'arrel d\'un polinomi: no es fa infinita en cap punt. No hi ha asímptotes verticals.');

  g.apartat(2);
  const fl = g.fila('limits'), ls = {linies: [''], index: 0};
  cadena(g, {fila: fl, P: 'Ip', esquerra: `${LIM('+\\infty')} f(x)`, ls, parts: [
    [`${LIM('+\\infty')} \\sqrt{x^{2} - 4}`, `${INICI2} El domini s'allarga cap als dos costats. Comença per $x \\to +\\infty$.`],
    ['+\\infty', 'Quan $x$ és molt gran, $x^2 - 4$ també ho és, i la seva arrel també.'],
  ]});
  ls.index = 1;
  ls.linies.push('');
  cadena(g, {fila: fl, P: 'Im', esquerra: `${LIM('-\\infty')} f(x)`, ls, parts: [
    [`${LIM('-\\infty')} \\sqrt{x^{2} - 4}`, 'Ara $x \\to -\\infty$.'],
    ['+\\infty', 'Si $x$ és molt negatiu, $x^2$ és molt gran i positiu: el límit també és $+\\infty$.'],
  ]});
  destacat(g, 'asimptotes', K('Ah', '\\text{No hi ha asímptotes horitzontals}'), 'Els límits són infinits: no hi ha asímptotes horitzontals.');
  const conjugat = (s, cap) => [
    [`${LIM(cap)} \\dfrac{(\\sqrt{x^{2} - 4} ${s} x) \\cdot (\\sqrt{x^{2} - 4} ${s === '-' ? '+' : '-'} x)}{\\sqrt{x^{2} - 4} ${s === '-' ? '+' : '-'} x}`,
      `Multiplica i divideix pel conjugat, $\\sqrt{x^2 - 4} ${s === '-' ? '+' : '-'} x$.`],
    [`${LIM(cap)} \\dfrac{x^{2} - 4 - x^{2}}{\\sqrt{x^{2} - 4} ${s === '-' ? '+' : '-'} x}`, 'A dalt hi ha una suma per una diferència: $(a - b) \\cdot (a + b) = a^2 - b^2$.'],
    [`${LIM(cap)} \\dfrac{-4}{\\sqrt{x^{2} - 4} ${s === '-' ? '+' : '-'} x}`, 'Opera el numerador.'],
  ];
  // A +∞: m = 1, n = 0.
  const fo = g.fila('limits'), lo = {linies: [''], index: 0};
  cadena(g, {fila: fo, P: 'Om', esquerra: 'm', ls: lo, parts: [
    [`${LIM('+\\infty')} \\dfrac{f(x)}{x}`, 'Potser hi ha una asímptota obliqua, $y = mx + n$. A $+\\infty$, el pendent és $m = \\lim \\frac{f(x)}{x}$.'],
    [`${LIM('+\\infty')} \\dfrac{\\sqrt{x^{2} - 4}}{x}`, 'Substitueix $f(x)$.'],
    [`${LIM('+\\infty')} \\sqrt{\\dfrac{x^{2} - 4}{x^{2}}}`, 'Com que $x > 0$, $x = \\sqrt{x^2}$: posa-ho tot dins de l\'arrel.'],
    [`${LIM('+\\infty')} \\sqrt{1 - \\dfrac{4}{x^{2}}}`, 'Divideix cada terme per $x^2$.'],
    ['1', '$\\frac{4}{x^2}$ tendeix a $0$: queda $\\sqrt{1} = 1$.'],
  ]});
  lo.index = 1;
  lo.linies.push('');
  cadena(g, {fila: fo, P: 'On', esquerra: 'n', ls: lo, parts: [
    [`${LIM('+\\infty')} \\left(f(x) - x\\right)`, 'L\'ordenada a l\'origen és $n = \\lim \\left(f(x) - mx\\right)$, amb $m = 1$.'],
    [`${LIM('+\\infty')} \\left(\\sqrt{x^{2} - 4} - x\\right)`, 'Substitueix $f(x)$. Surt $\\infty - \\infty$, que pot ser qualsevol cosa: cal operar.'],
    ...conjugat('-', '+\\infty'),
    ['0', 'El denominador es fa tan gran com vulguis: el límit és $0$.'],
  ]});
  destacat(g, 'asimptotes', K('Aop', '\\text{Asímptota obliqua a } +\\infty\\text{: } y = x'), '$m = 1$ i $n = 0$: la recta $y = x$ és una asímptota obliqua a $+\\infty$.');
  // A −∞: m = −1, n = 0.
  const fm = g.fila('limits'), lm = {linies: [''], index: 0};
  cadena(g, {fila: fm, P: 'Qm', esquerra: 'm', ls: lm, parts: [
    [`${LIM('-\\infty')} \\dfrac{f(x)}{x}`, 'Ara a $-\\infty$: el pendent és $m = \\lim \\frac{f(x)}{x}$.'],
    [`${LIM('-\\infty')} \\dfrac{\\sqrt{x^{2} - 4}}{x}`, 'Substitueix $f(x)$.'],
    [`${LIM('-\\infty')} -\\sqrt{\\dfrac{x^{2} - 4}{x^{2}}}`, 'Ara $x < 0$, i $x = -\\sqrt{x^2}$: posa-ho dins de l\'arrel i deixa el signe $-$ a fora.'],
    [`${LIM('-\\infty')} -\\sqrt{1 - \\dfrac{4}{x^{2}}}`, 'Divideix cada terme per $x^2$.'],
    ['-1', 'Queda $-\\sqrt{1} = -1$.'],
  ]});
  lm.index = 1;
  lm.linies.push('');
  cadena(g, {fila: fm, P: 'Qn', esquerra: 'n', ls: lm, parts: [
    [`${LIM('-\\infty')} \\left(f(x) + x\\right)`, 'I $n = \\lim \\left(f(x) - mx\\right)$, amb $m = -1$: $f(x) - (-1) \\cdot x = f(x) + x$.'],
    [`${LIM('-\\infty')} \\left(\\sqrt{x^{2} - 4} + x\\right)`, 'Substitueix $f(x)$. Torna a sortir $\\infty - \\infty$.'],
    ...conjugat('+', '-\\infty'),
    ['0', 'Quan $x \\to -\\infty$, $-x$ és molt gran i positiu: el denominador es fa tan gran com vulguis, i el límit és $0$.'],
  ]});
  destacat(g, 'asimptotes', K('Aom', '\\text{Asímptota obliqua a } -\\infty\\text{: } y = -x'), '$m = -1$ i $n = 0$: la recta $y = -x$ és una asímptota obliqua a $-\\infty$.');

  g.apartat(3);
  destacat(g, 'punts', K('Zq', '\\text{No talla l\'eix d\'ordenades}'),
    '3. Punts de tall amb els eixos. Primer, amb l\'eix d\'ordenades: $x = 0$ no és del domini ($0^2 - 4 < 0$), i la gràfica no talla l\'eix d\'ordenades.');
  const zeros = equacioMa(g, {pre: 'c', tipus: 'equacio:f',
    principal: [['f(x)', ABSCISSES], ['\\sqrt{x^{2} - 4}', 'Substitueix $f(x)$ per la seva expressió.']],
    treball: [['x^{2} - 4 = 0', 'Una arrel val $0$ només quan el que hi ha a dins val $0$.'], ['x^{2} = 4', 'Passa el $4$ a l\'altre costat.']],
    solucions: [{tex: '-2', valor: fr(-2)}, {tex: '2', valor: fr(2)}], textSolucions: 'Fes l\'arrel quadrada: $x = -2$ o $x = 2$. Totes dues solucions són del domini.'});
  tallsAbscisses(g, H, zeros);

  g.apartat(4);
  cadena(g, {fila: g.fila('derivada1'), P: 'D1', esquerra: "f'(x)", parts: [
    ['\\left(\\sqrt{x^{2} - 4}\\right)\'', INICI4],
    ['\\dfrac{2x}{2\\sqrt{x^{2} - 4}}', 'Fes servir la regla de l\'arrel, $\\left(\\sqrt{u}\\right)\' = \\frac{u\'}{2\\sqrt{u}}$, amb $u = x^2 - 4$ i $u\' = 2x$.'],
    ['\\dfrac{x}{\\sqrt{x^{2} - 4}}', 'Simplifica el $2$.'],
  ]});
  equacioMa(g, {pre: 'd', tipus: 'equacio:f1',
    principal: [["f'(x)", 'Els punts crítics són les solucions de l\'equació $f\'(x) = 0$.'], ['\\dfrac{x}{\\sqrt{x^{2} - 4}}', 'Substitueix $f\'(x)$ per la seva expressió.']],
    treball: [], solucions: [{tex: '0', serveix: false}], textSolucions: 'Una fracció val $0$ quan el numerador val $0$: $x = 0$.',
    textTatxa: '$0$ no és del domini: la tatxes. No hi ha punts crítics.'});
  const trossos = [[null, fr(-2)], [fr(2), null]];
  estudiSignes(g, {ordre: 1, trossos, fora: [], arrels: [], posaPunt: H.posaPunt, valorY: H.valorY, yDe: H.yDe,
    textTaula: 'Fes la taula de signes de $f\'$. No hi ha punts crítics, i $f\'$ només existeix a $(-\\infty,\\ -2)$ i a $(2,\\ +\\infty)$ (a $x = \\pm 2$ el denominador val $0$): són els dos intervals.',
    prova: provaAprox(t => `\\dfrac{${texNombre(t)}}{\\sqrt{${arg(t)}^{2} - 4}}`, x => x / Math.sqrt(x * x - 4))});

  g.apartat(5);
  cadena(g, {fila: g.fila('derivada2'), P: 'D2', esquerra: "f''(x)", apila: true, parts: [
    ['\\left(\\dfrac{x}{\\sqrt{x^{2} - 4}}\\right)\'', `${INICI5} Deriva $f'(x)$.`],
    ['\\dfrac{\\sqrt{x^{2} - 4} - x \\cdot \\dfrac{x}{\\sqrt{x^{2} - 4}}}{x^{2} - 4}',
      'Fes servir la regla del quocient amb $P = x$ i $Q = \\sqrt{x^2 - 4}$: $P\' = 1$, $Q\' = \\frac{x}{\\sqrt{x^2 - 4}}$ (l\'acabes de calcular) i $Q^2 = x^2 - 4$.'],
    ['\\dfrac{x^{2} - 4 - x^{2}}{(x^{2} - 4) \\cdot \\sqrt{x^{2} - 4}}', 'Multiplica el numerador i el denominador per $\\sqrt{x^2 - 4}$.'],
    ['\\dfrac{-4}{(x^{2} - 4) \\cdot \\sqrt{x^{2} - 4}}', 'Opera el numerador.'],
  ]});
  equacioMa(g, {pre: 'e', tipus: 'equacio:f2',
    principal: [["f''(x)", 'Els possibles punts d\'inflexió són les solucions de l\'equació $f\'\'(x) = 0$.'],
      ['\\dfrac{-4}{(x^{2} - 4) \\cdot \\sqrt{x^{2} - 4}}', 'Substitueix $f\'\'(x)$ per la seva expressió.']],
    treball: [['-4 = 0', 'Una fracció val $0$ quan el numerador val $0$. Però $-4 = 0$ no és cert mai: l\'equació no té solucions.']]});
  estudiSignes(g, {ordre: 2, trossos, fora: [], arrels: [], posaPunt: H.posaPunt, valorY: H.valorY, yDe: H.yDe,
    textTaula: 'Fes la taula de signes de $f\'\'$. Els intervals són els mateixos: $(-\\infty,\\ -2)$ i $(2,\\ +\\infty)$.',
    prova: provaAprox(t => `\\dfrac{-4}{(${arg(t)}^{2} - 4) \\cdot \\sqrt{${arg(t)}^{2} - 4}}`, x => -4 / ((x * x - 4) * Math.sqrt(x * x - 4)))});
  return {asimptotes: [{m: 1, n: 0}, {m: -1, n: 0}], hiHaPunts: false};
}
guioArrelObliques.dades = {
  sub: x => `\\sqrt{${arg(x)}^{2} - 4}`,
  mig: x => `\\sqrt{${texNombre(fr(x).potencia(2).resta(fr(4)))}}`,
  exacte: x => Radical.arrel(fr(x).potencia(2).resta(fr(4))),
};


/* ── 8. EL PROCEDIMENT ─────────────────────────────────────────────── */

const enunciat = v => `Elabora un esbós de la gràfica de la funció $f(x) = ${texDe(perId(v.p))}$, justificant-ho tot.`;
function texDe(pr) {
  if (pr.tex) return pr.tex;
  const P = coefs(pr.P), Q = coefs(pr.Q);
  return grau(Q) === 0 ? tp(P) : `\\dfrac{${tp(P)}}{${tp(Q)}}`;
}
const passos = v => { const pr = perId(v.p); return pr.tipus === 'radical' ? passosRadical(pr) : passosRacional(pr); };

arrel.GraficaFuncio = Object.freeze({
  titol: 'Gràfica d\'una funció',
  categoria: 'analisi',
  files: FILES,
  pissarraCreix: true,
  titolExemples: 'Funcions:',
  perDefecte: FIXOS.perDefecte,
  exemples: FIXOS.exemples,
  editor: [],
  valida: FIXOS.valida, llegeixAdreca: FIXOS.llegeixAdreca, escriuAdreca: FIXOS.escriuAdreca,
  enunciat, resum: v => `f(x) = ${texDe(perId(v.p))}`, nomExemple: v => `f(x) = ${perId(v.p).nom}`,
  passos, PROBLEMES,
});

})(globalThis);
