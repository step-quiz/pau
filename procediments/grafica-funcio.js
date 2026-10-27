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
   Totes les línies que es veuen són certes: ho comprova proves/comprova.js.

   Cada fila escrita porta un tipus (pas.tipus[i]) que diu què és, perquè les proves
   la sàpiguen llegir: f, apartat, domini, equacio:Q|f|f1|f2, limits, asimptotes,
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

/** Taula de signes (com creixement.js): capçalera amb els intervals i les columnes «x = a»; dues files. */
function taulaSignes(P, punts, files) {
  const nI = punts.length + 1;
  const fila = (etiqueta, i, p) => [etiqueta].concat(...Array.from({length: nI}, (_, j) => [i(j)].concat(j < nI - 1 ? [p(j)] : []))).join(' & ');
  const cella = (nom, j, cel) => (cel ? K(`${P}${nom}${j}`, cel) : '');
  const vores = j => [j === 0 ? null : punts[j - 1].valor, j === nI - 1 ? null : punts[j].valor];
  return `\\begin{array}{${Array(2 * nI).fill('c').join('|')}} `
    + [fila(K(P + 'Lx', '\\boldsymbol{x}'), j => K(`${P}Hi${j}`, texInterval(...vores(j))), j => 'x = ' + K(`${P}Hp${j}`, texNombre(punts[j].valor))),
      ...files.map(({nom, etiqueta, i, p}) => fila(K(P + 'L' + nom, etiqueta), j => cella(nom + 'i', j, i[j]), j => cella(nom + 'p', j, p[j])))].join(' \\\\ \\hline ')
    + ' \\end{array}';
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

  /* ── 6. Taula de valors ── */
  g.apartat(6);
  const fx = g.fila('valors'), lsx = {linies: [], index: 0};
  pr.extres.map(fr).forEach((x, i) => {
    lsx.index = lsx.linies.length;
    lsx.linies.push('');
    cadena(g, {fila: fx, P: 'Ux' + i, esquerra: `f(${texNombre(x)})`, ls: lsx, parts: passosValor(P, Q, pol, x,
      i === 0 ? `6. Taula de valors. Ja tens els talls amb els eixos${d1.hiHaPunts ? ', els extrems i els punts d\'inflexió' : ''}. Afegeix-hi dos punts més, perquè es vegi cap on va la gràfica: calcula $f(${texNombre(x)})$.`
        : `I $f(${texNombre(x)})$.`)});
    posaPunt(x, fRad(x));
  });
  const ord = taula.slice().sort((a, b) => a.x.valor() - b.x.valor());
  const fT = g.fila('taula-valors');
  g.files[fT] = `\\begin{array}{c|${'c'.repeat(ord.length)}} ${K('HLx', '\\boldsymbol{x}')} & ${ord.map((p, j) => K('Hx' + j, texAprox(p.x))).join(' & ')} \\\\ \\hline `
    + `${K('HLy', '\\boldsymbol{f(x)}')} & ${ord.map((p, j) => K('Hy' + j, texAprox(p.y))).join(' & ')} \\end{array}`;
  g.classes[fT] = 'separat';
  g.afegeix('Posa tots els punts en una taula, ordenats per la $x$. Els valors irracionals, també aproximats: els necessites per dibuixar-los.');

  /* ── 7. La gràfica ── */
  g.apartat(7);
  const fG = g.fila('grafica');
  const ff = x => flotant(P, x) / flotant(Q, x);
  const trams = [];
  const vores = [-Infinity, ...ordena(fora).map(a => a.valor()), Infinity];
  for (let i = 0; i + 1 < vores.length; i++) trams.push({a: vores[i], b: vores[i + 1]});
  const asimptotes = av.map(a => ({v: a.valor()}))
    .concat(l.finit ? [{h: l.finit.valor()}] : [])
    .concat(obliqua ? [{m: obliqua.m.valor(), n: obliqua.n.valor()}] : []);
  const punts = ord.map(p => ({x: p.x.valor(), y: p.y.valor()}));
  const dibuix = corba => Gr.esbos({f: ff, trams, x: pr.finestra.x, y: pr.finestra.y, asimptotes, punts, corba});
  g.files[fG] = dibuix(false);
  g.afegeix(`7. Gràfica de la funció. Dibuixa els eixos${asimptotes.length ? (asimptotes.length > 1 ? ', les asímptotes (discontínues)' : ', l\'asímptota (discontínua)') : ''} i els punts de la taula.`);
  g.files[fG] = dibuix(true);
  g.afegeix(`Uneix els punts seguint el que has estudiat: on creix i on decreix, la concavitat${asimptotes.length ? ` i com s'acosta ${asimptotes.length > 1 ? 'a les asímptotes' : 'a l\'asímptota'}` : ''}. Aquest és l'esbós de la gràfica.`);
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

  /* La taula de signes. */
  const punts = ordena(fora.map(a => ({valor: a, fora: true})).concat(arrels.map(a => ({valor: a, fora: false}))).map(p => p.valor))
    .map(v => ({valor: v, fora: fora.some(a => a.igual(v))}));
  const nI = punts.length + 1;
  const vores = j => [j === 0 ? null : punts[j - 1].valor, j === nI - 1 ? null : punts[j].valor];
  const cel = {di: Array(nI).fill(''), dp: Array(nI - 1).fill(''), fi: Array(nI).fill(''), fp: Array(nI - 1).fill('')};
  const etD = `\\boldsymbol{f${prima}(x)}`;
  const T = 'T' + PX;
  const taula = () => taulaSignes(T, punts, [{nom: 'd', etiqueta: etD, i: cel.di, p: cel.dp}, {nom: 'f', etiqueta: '\\boldsymbol{f(x)}', i: cel.fi, p: cel.fp}]);
  const ft = g.fila(primera ? 'taula1' : 'taula2');
  const fprova = g.fila(primera ? 'proves1' : 'proves2');
  g.files[ft] = taula();
  g.classes[ft] = 'separat';
  const quins = arrels.length && fora.length ? `Els ${primera ? 'punts crítics' : 'punts on $f\'\'(x) = 0$'} i els punts que no són del domini`
    : arrels.length ? `Els ${primera ? 'punts crítics' : 'punts on $f\'\'(x) = 0$'}` : 'Els punts que no són del domini';
  g.afegeix(punts.length ? `Fes la taula de signes de $${nomD.replace('(x)', '')}$. ${quins} (${llista(punts.map(p => p.valor))}) separen la recta en intervals.`
    : `Fes la taula de signes de $${nomD.replace('(x)', '')}$. No hi ha cap punt que separi la recta: només hi ha l'interval $(-\\infty,\\ +\\infty)$.`);
  if (punts.length) {
    punts.forEach((p, j) => { cel.dp[j] = p.fora ? '\\nexists' : '0'; });
    g.files[ft] = taula();
    g.afegeix([arrels.length ? `Als punts on s'anul·la, $${nomD.replace('(x)', '')} = 0$.` : '', fora.length ? 'On $f$ no existeix, les seves derivades tampoc: hi poso $\\nexists$.' : ''].filter(Boolean).join(' '));
  }
  // El signe a cada interval: un valor de prova.
  const proves = [];
  for (let j = 0; j < nI; j++) {
    const [a, b] = vores(j);
    const t = valorDeProva(a, b), Tt = texNombre(t);
    const v = valorD(t), positiu = v.signe() > 0;
    const sub = potDen ? `\\dfrac{${substitucio(N, t)}}{${potDen === 2 ? `(${substitucio(Q, t)})^{2}` : `(${substitucio(Q, t)})^{3}`}}` : substitucio(N, t);
    const subQ = grau(Q) === 0 ? sub : sub;
    proves.push(K(`S${PX}a${j}`, `f${prima}(${Tt})`) + R(`S${PX}q${j}`, '=') + K(`S${PX}b${j}`, `${subQ} = ${texNombre(v)}`)
      + R(`S${PX}w${j}`, positiu ? '>' : '<') + K(`S${PX}z${j}`, '0'));
    g.files[fprova] = linies(proves);
    g.afegeix(`Interval $${texInterval(a, b)}$: tria'n un valor, per exemple $x = ${Tt}$, i calcula $f${prima}(${Tt})$.`, {cursor: {clic: `${T}Hi${j}`}});
    cel.di[j] = positiu ? '+' : '-';
    g.files[ft] = taula();
    g.afegeix(`$f${prima}$ no canvia de signe dins de l'interval: és ${positiu ? 'positiva' : 'negativa'} a tot l'interval. Hi poso un $${positiu ? '+' : '-'}$.`,
      {cursor: {arrossega: `S${PX}w${j}`, fins: `${T}di${j}`}});
  }
  // El comportament de f, i els punts especials.
  if (primera) cel.fi = cel.di.map(s => (s === '+' ? '\\nearrow' : '\\searrow'));
  else cel.fi = cel.di.map(s => (s === '+' ? '\\cup' : '\\cap'));
  punts.forEach((p, j) => { if (p.fora) cel.fp[j] = '\\nexists'; });
  g.files[ft] = taula();
  g.afegeix(primera ? 'On $f\' > 0$, $f$ creix ($\\nearrow$); on $f\' < 0$, $f$ decreix ($\\searrow$).'
    : 'On $f\'\' > 0$, la concavitat és positiva ($\\cup$); on $f\'\' < 0$, la concavitat és negativa ($\\cap$).');
  const especials = [];                              // [{valor, tipus}]
  const sense = [];
  punts.forEach((p, j) => {
    if (p.fora) return;
    const [e, d] = [cel.di[j], cel.di[j + 1]];
    if (e === d) { sense.push(p.valor); return; }
    const tipus = primera ? (e === '+' ? 'màxim' : 'mínim') : 'inflexió';
    cel.fp[j] = `\\text{${tipus}}`;
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
      cadena(g, {fila: fv, P: `U${PX}${i}`, esquerra: `f(${texNombre(e.valor)})`, ls, parts: passosValor(P, Q, pol, e.valor,
        i === 0 ? `Calcula la $y$ ${especials.length > 1 ? `de cada ${primera ? 'extrem' : 'punt d\'inflexió'}` : `${primera ? 'de l\'extrem' : 'del punt d\'inflexió'}`}: $f(${texNombre(e.valor)})$.`
          : `I $f(${texNombre(e.valor)})$.`)});
      e.y = fRad(e.valor);
      posaPunt(e.valor, e.y);
    });
  }

  /* La conclusió. */
  const unio = signe => {
    const trossos = [];                              // [[j inicial, j final]] d'intervals seguits
    cel.di.forEach((s, j) => {
      if (s !== signe) return;
      const ultim = trossos[trossos.length - 1];
      if (ultim && ultim[1] === j - 1 && !punts[j - 1].fora) ultim[1] = j; else trossos.push([j, j]);
    });
    return trossos.length ? trossos.map(([a, b]) => texInterval(vores(a)[0], vores(b)[1])).join(' \\cup ') : null;
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
  return {N, hiHaPunts: especials.length > 0 || (d1 && d1.hiHaPunts)};
}


/* ── 7. EL PROCEDIMENT ─────────────────────────────────────────────── */

const enunciat = v => `Elabora un esbós de la gràfica de la funció $f(x) = ${texDe(perId(v.p))}$, justificant-ho tot.`;
function texDe(pr) {
  const P = coefs(pr.P), Q = coefs(pr.Q);
  return grau(Q) === 0 ? tp(P) : `\\dfrac{${tp(P)}}{${tp(Q)}}`;
}
const passos = v => passosRacional(perId(v.p));

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
