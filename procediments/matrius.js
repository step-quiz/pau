/* ═══════════════════════════════════════════════════════════════════
   matrius.js — Matrius amb un paràmetre (Àlgebra)
   ───────────────────────────────────────────────────────────────────
   Mòdul pur: no toca la pàgina (DOM). Depèn de mates.js i formules.js.
   El fan servir els procediments d'Àlgebra. Exporta «Matrius»:

     llegeixMatriu(text, f, c)  «m,1,1;1,m,1;1,1,m» → {A, X}
     textMatriu, texMatriu, texMatriuPetita   escriptura
     passosSarrus(g, …)   els passos de la regla de Sarrus (3×3)
     passosArrels(g, …)   els passos de «polinomi = 0», de grau ≤ 3:
                          factor comú, o una arrel entera i Ruffini, i
                          l'equació de segon grau (Formules.resolEquacio:
                          l'equació es queda i els càlculs baixen a una
                          fila de treball; productes amb «·»; solucions
                          en lila)
     problemaArrels(p)    null si passosArrels el sap resoldre
     texSistema, texAmpliada   un sistema de 3 equacions i la seva A*
     passosReduccio2(g, …)  un sistema 2×2 pel mètode de reducció de 4t d'ESO (David):
                          cada equació «(EQ.n)» d'un altre color (texEq, texSistemaEq),
                          línies «(EQ.2) · (−2):», ratlla abans de la suma, valors trobats
                          requadrats. Mai Cramer.
     passosCombina(g, …)    dues equacions de n incògnites combinades en aquest format
     passosGauss(S)       esglaonar la matriu ampliada pel mètode de Gauss
                          (pivots, Fᵢ → a·Fᵢ − b·Fⱼ, files de zeros al final).
                          Mai Cramer (David).

   Un element d'una matriu és un polinomi en el paràmetre X (una lletra:
   a, k, m, p o t): els seus coeficients exactes [c0, c1] (Fraccio),
   com els polinomis de Mates. Sense paràmetre, X és null.

   Claus (P és un prefix, per si una pàgina en té més d'un):
     P a<i><j>  l'element de la fila i i la columna j (des d'1)
     P Mn, P Mq  el nom de la matriu (A, |A|) i el seu «=»
     P S<n>     el producte n de Sarrus (0-2 amb +, 3-5 amb −)
     P V<n><g>  el terme de grau g del producte n, ja calculat
     P V<n>n    el «−» de davant d'un parèntesi; P V<n>z un producte 0
     P C<g>     el terme de grau g del determinant
     E…, Q…     les equacions (Formules.equacio); P… les proves d'arrels;
                R… la taula de Ruffini (Ra dalt, Rx l'arrel, Rm al mig, Rb baix);
                W… «x = r o»; Y… la còpia de l'equació que es queda quieta
   ═══════════════════════════════════════════════════════════════════ */
(function (arrel) {
'use strict';

const M = arrel.Mates;
const F = arrel.Formules;
const {Fraccio} = M;
const {clau: K, rel: R} = F;
const ZERO = new Fraccio(0), U = new Fraccio(1);

/** Les lletres que poden ser el paràmetre, i el valor màxim (absolut) dels nombres. */
const PARAMETRES = Object.freeze(['a', 'k', 'm', 'p', 't']);
const MAX_ELEMENT = 9;


/* ── 1. POLINOMIS EN EL PARÀMETRE ──────────────────────────────────── */

const sumaP = M.sumaPolinomis;
const producteP = M.producteDePolinomis;
const oposatP = p => p.map(c => c.oposada());
const valorP = (p, x) => p.reduce((s, c, i) => s.suma(c.producte(Fraccio.de(x).potencia(i))), ZERO);
const texP = (p, X) => M.texPolinomi(M.termes(p), X || 'x');
/** En text pla, per a l'adreça: «2m-1», «-m», «0». */
const textP = (p, X) => M.textPolinomi(M.termes(p)).replace(/x/g, X || 'x');
/** Un element d'una matriu: com texP, però amb λ el terme independent va primer («2 - \\lambda», com A − λI). */
const texEntrada = (p, X) => (X === '\\lambda' && p.length === 2 ? texLineal(p) : texP(p, X));
/** Un element com a factor d'un producte: entre parèntesis si és negatiu o té més d'un terme. */
function texFactor(p, X) {
  const t = texEntrada(p, X);
  return M.termes(p).length > 1 || t.startsWith('-') ? `(${t})` : t;
}


/* ── 2. LECTURA I ESCRIPTURA DE MATRIUS ────────────────────────────── */

/**
 * «m,1,1;1,m,1;1,1,m» → {A: files de polinomis, X: el paràmetre o null}. Cada element
 * és un enter o «enter · X + enter», amb nombres de −9 a 9 (o de −maxim a maxim). Llança
 * Mates.ErrorLectura.
 */
function llegeixMatriu(text, files, columnes, maxim = MAX_ELEMENT) {
  const net = String(text).replace(/\s+/g, '');
  const lletres = [...new Set(net.match(/[A-Za-z]/g) || [])];
  if (lletres.length > 1) throw new M.ErrorLectura(`Hi ha més d'una lletra (${lletres.join(', ')}), i només hi pot haver un paràmetre.`);
  const X = lletres[0] || null;
  if (X && !PARAMETRES.includes(X)) throw new M.ErrorLectura(`El paràmetre «${X}» no es pot fer servir: ha de ser una d'aquestes lletres: ${PARAMETRES.join(', ')}.`);
  const trossos = net.split(';');
  if (trossos.length !== files) throw new M.ErrorLectura(`La matriu ha de tenir ${files} files, separades per «;».`);
  const A = trossos.map((fila, i) => {
    const elements = fila.split(',');
    if (elements.length !== columnes) throw new M.ErrorLectura(`La fila ${i + 1} ha de tenir ${columnes} elements, separats per «,».`);
    return elements.map(e => {
      if (!e) throw new M.ErrorLectura(`A la fila ${i + 1} hi ha un element buit.`);
      const p = M.polinomi(M.llegeix(e, {variables: X ? [X] : []}), X || 'x');
      if (!p || p.length > 2 || p.some(c => !c.esEnter())) {
        throw new M.ErrorLectura(`L'element «${e}» ha de ser un nombre enter${X ? ` o de la forma «2${X}-1» (un enter per ${X}, més un enter)` : ''}.`);
      }
      if (p.some(c => Math.abs(c.num) > maxim)) throw new M.ErrorLectura(`Els nombres de la matriu han d'anar de −${maxim} a ${maxim}.`);
      return p;
    });
  });
  return {A, X};
}

const textMatriu = (A, X) => A.map(f => f.map(p => textP(p, X)).join(',')).join(';');

const clauElement = (P, i, j) => `${P}a${i + 1}${j + 1}`;

/** Matriu en TeX, amb una clau per element i potser una marca: (…) o |…|. */
function texMatriu(A, X, {P = '', marca = () => '', tipus = 'pmatrix'} = {}) {
  const files = A.map((f, i) => f.map((p, j) => K(clauElement(P, i, j), texEntrada(p, X), marca(i, j))).join(' & '));
  return `\\begin{${tipus}} ${files.join(' \\\\ ')} \\end{${tipus}}`;
}
/** Matriu petita, sense claus (per als botons dels exemples). */
const texMatriuPetita = (A, X) => `\\left(\\begin{smallmatrix} ${A.map(f => f.map(p => texP(p, X)).join(' & ')).join(' \\\\ ')} \\end{smallmatrix}\\right)`;


/* ── 3. REGLA DE SARRUS ────────────────────────────────────────────── */

/** Els sis productes: tres amb signe + (la diagonal principal i les seves paral·leles) i tres amb − (la secundària). */
const SARRUS = Object.freeze([
  // Els textos, curts (David): la pissarra ja mostra els elements de cada producte, en verd (+) o en vermell (−).
  {signe: 1, pos: [[0, 0], [1, 1], [2, 2]], text: 'Has de calcular sis productes. Comença pel primer.'},
  {signe: 1, pos: [[0, 1], [1, 2], [2, 0]], text: 'Segon producte.'},
  {signe: 1, pos: [[0, 2], [1, 0], [2, 1]], text: 'Tercer producte.'},
  {signe: -1, pos: [[0, 2], [1, 1], [2, 0]], text: 'Quart producte.'},
  {signe: -1, pos: [[0, 0], [1, 2], [2, 1]], text: 'Cinquè producte.'},
  {signe: -1, pos: [[0, 1], [1, 0], [2, 2]], text: 'Sisè i últim producte.'},
]);

/** Determinant 3×3 (Sarrus, sense passos): un polinomi en X. */
const determinant = A => SARRUS.reduce((d, s) => {
  const v = s.pos.reduce((p, [i, j]) => producteP(p, A[i][j]), [U]);
  return sumaP(d, s.signe > 0 ? v : oposatP(v));
}, []);

/** Un terme c·X^g amb el seu signe davant (« + 2m», « - 3»), o sense « + » si és el primer. */
function texTerme(c, g, X, primer) {
  const t = M.texPolinomi([{n: g, c}], X || 'x');
  if (primer) return t;
  return t.startsWith('-') ? ` - ${t.slice(1)}` : ` + ${t}`;
}

/**
 * Els passos de Sarrus d'una matriu 3×3 A, sobre tres files: «matriu» (passa de «A = (…)»
 * a «|A| = |…|», i marca els elements de cada producte: verd +, vermell −), «sarrus» (els sis
 * productes) i «calcul» (cada producte fet, sense parèntesis, i els termes agrupats).
 * Torna {det, valors}: el determinant i el valor de cada producte (polinomis en X).
 */
function passosSarrus(g, {A, X, nom = '|A|', P = '', files, rapid = false}) {
  const filaMatriu = (marques = {}) => K(P + 'Mn', nom) + R(P + 'Mq', '=')
    + texMatriu(A, X, {P, marca: (i, j) => marques[`${i}${j}`] || '', tipus: 'vmatrix'});
  g.files[files.matriu] = filaMatriu();
  g.afegeix('Calcula aquest determinant amb la regla de Sarrus.');

  /*
   * Sempre amb claudàtors, com a classe: |A| = [p₁ + p₂ + p₃] − [p₄ + p₅ + p₆]. Cada claudàtor
   * es tanca després de l'últim producte que ja hi és; els productes es poden partir en línies.
   */
  const peces = [];
  const ambClaudators = trossos => trossos.map((t, n) => {
    const obre = n === 0 ? '\\lbrack ' : n === 3 ? ' - \\lbrack ' : ' + ';
    const tanca = n === Math.min(trossos.length, 3) - 1 || (n >= 3 && n === trossos.length - 1) ? ' \\rbrack' : '';
    return obre + t + tanca;
  });
  // Es parteix entre els dos claudàtors; dins d'un claudàtor, només si sol no hi cap.
  const filaProductes = () => {
    const trossos = ambClaudators(peces);
    const grups = [trossos.slice(0, 3).join(''), trossos.slice(3).join('')].filter(Boolean);
    const llargs = grups.some(t => F.ampleTex(t) > F.AMPLE_LINIA * 0.85);
    return F.enLinies(K(P + 'Sl', nom) + R(P + 'Sq', '='), llargs ? trossos : grups);
  };

  /* Els sis productes, marcats a la matriu (o, «rapid», tots alhora i sense marques). */
  if (rapid) {
    SARRUS.forEach((s, n) => peces.push(K(`${P}S${n}`, s.pos.map(([i, j]) => texFactor(A[i][j], X)).join(' \\cdot '))));
    g.files[files.sarrus] = filaProductes();
    g.afegeix('Calcula els sis productes.');
  }
  if (!rapid) SARRUS.forEach((s, n) => {
    const factors = s.pos.map(([i, j]) => texFactor(A[i][j], X)).join(' \\cdot ');
    peces.push(K(`${P}S${n}`, factors));
    g.files[files.matriu] = filaMatriu(Object.fromEntries(s.pos.map(([i, j]) => [`${i}${j}`, s.signe > 0 ? 'mes' : 'menys'])));
    g.files[files.sarrus] = filaProductes();
    g.afegeix(s.text);
  });
  g.files[files.matriu] = filaMatriu();

  /* Cada producte fet, dins del seu claudàtor. */
  const valors = SARRUS.map(s => s.pos.reduce((p, [i, j]) => producteP(p, A[i][j]), [U]));
  const inici = K(P + 'Cl', nom) + R(P + 'Cq', '=');
  const fila = trossos => F.enLinies(inici, trossos);
  /** Termes d'un claudàtor, amb el seu signe (el primer, sense «+»): [{k, c, n}] → TeX. */
  const texTermes = termes => termes.map((t, i) => K(t.k, t.c === null ? (i === 0 ? '0' : ' + 0') : texTerme(t.c, t.n, X, i === 0))).join('');
  const claudator = (termes, segon) => (segon ? ' - ' : '') + '\\lbrack ' + texTermes(termes) + ' \\rbrack';
  // Els termes de cada producte (un producte que val 0 és un «0»).
  const termesProducte = n => {
    const ts = M.termes(valors[n]);
    return ts.length ? ts.map(t => ({k: `${P}V${n}${t.n}`, c: t.c, n: t.n})) : [{k: `${P}V${n}z`, c: null, n: null}];
  };
  const grups = [[0, 1, 2], [3, 4, 5]].map(ns => ns.flatMap(termesProducte));
  g.files[files.calcul] = fila([claudator(grups[0], false), claudator(grups[1], true)]);
  g.afegeix('Calcula cada producte, dins del seu claudàtor.');

  /* Cada claudàtor, sumat (si cal): termes del mateix grau junts, sense zeros. */
  const sumes = [[0, 1, 2], [3, 4, 5]].map(ns => ns.reduce((d, n) => sumaP(d, valors[n]), []));
  const simplificats = grups.map((gr, q) => {
    const ts = M.termes(sumes[q]);
    const lletra = q === 0 ? 'Bp' : 'Bm';
    if (!ts.length) return {termes: [{k: `${P}${lletra}z`, c: null, n: null}], fusiona: {[`${P}${lletra}z`]: gr.map(t => t.k)}};
    const fusiona = {};
    const termes = ts.map(t => {
      const de = gr.filter(u => u.n === t.n).map(u => u.k);
      if (de.length === 1) return {k: de[0], c: t.c, n: t.n};
      const k = `${P}${lletra}${t.n}`;
      fusiona[k] = de;
      return {k, c: t.c, n: t.n};
    });
    return {termes, fusiona};
  });
  const calSumar = simplificats.some((sm, q) => sm.termes.length !== grups[q].length);
  if (calSumar) {
    g.files[files.calcul] = fila([claudator(simplificats[0].termes, false), claudator(simplificats[1].termes, true)]);
    g.afegeix('Opera dins de cada claudàtor.', {fusiona: Object.assign({}, simplificats[0].fusiona, simplificats[1].fusiona)});
  }
  const [mes, menys] = (calSumar ? simplificats.map(sm => sm.termes) : grups).map(ts => ts.filter(t => t.c !== null));

  /* Sense claudàtors: el «−» canvia el signe de cada terme del segon. Després, els termes del mateix grau, agrupats. */
  const sense = mes.concat(menys.map(t => ({k: t.k, c: t.c.oposada(), n: t.n})));
  const det = sumaP(sumes[0], oposatP(sumes[1]));
  const termesDet = M.termes(det);
  const graus = sense.map(t => t.n);
  const directe = new Set(graus).size === graus.length && graus.every((gr, i) => i === 0 || gr < graus[i - 1]);
  const texSense = ts => (ts.length ? ts.map((t, i) => K(t.k, texTerme(t.c, t.n, X, i === 0))) : [K(`${P}C0`, '0')]);
  if (directe) {
    // Ja està agrupat i ordenat: les claus passen a ser les del resultat (C<grau>).
    const finals = sense.map(t => ({k: `${P}C${t.n}`, c: t.c, n: t.n}));
    g.files[files.calcul] = fila(texSense(finals));
    g.afegeix(menys.length ? 'Treu els claudàtors: el $-$ de davant del segon canvia el signe de cada terme de dins.' : 'Treu els claudàtors.',
      {reanomena: Object.fromEntries(sense.map(t => [`${P}C${t.n}`, t.k]))});
  } else {
    g.files[files.calcul] = fila(texSense(sense));
    g.afegeix(menys.length ? 'Treu els claudàtors: el $-$ de davant del segon canvia el signe de cada terme de dins.' : 'Treu els claudàtors.');
    const fusiona = {};
    const textos = [];
    for (const gr of [...new Set(graus)].sort((a, b) => b - a)) {
      const de = sense.filter(t => t.n === gr);
      const c = det[gr] || ZERO;
      if (!c.esZero()) fusiona[`${P}C${gr}`] = de.map(t => t.k);
      if (de.length > 1) textos.push(`$${de.map((t, i) => texTerme(t.c, t.n, X, i === 0)).join('')} = ${c.esZero() ? '0' : M.texPolinomi([{n: gr, c}], X || 'x')}$`);
    }
    g.files[files.calcul] = fila(termesDet.length ? termesDet.map((t, i) => K(`${P}C${t.n}`, texTerme(t.c, t.n, X, i === 0))) : [K(`${P}C0`, '0')]);
    g.afegeix('Agrupa els termes del mateix grau.', {fusiona});
  }
  return {det, valors};
}


/* ── 4. ARRELS D'UN POLINOMI DE GRAU ≤ 3 ───────────────────────────── */

/** Divisors positius d'un enter (no nul), en ordre. */
const divisors = n => Array.from({length: Math.abs(n)}, (_, i) => i + 1).filter(d => n % d === 0);

/** Coeficients enters d'un polinomi dividits pel seu factor comú, amb el primer positiu: {p, k}. */
function normalitza(p) {
  const nums = p.filter(c => !c.esZero()).map(c => c.num);
  const k = nums.reduce((a, b) => M.mcd(a, b)) * Math.sign(p[p.length - 1].num);
  return {p: p.map(c => c.quocient(k)), k};
}

/** Les arrels enteres candidates (divisors del terme independent), en l'ordre de provar-les: 1, −1, 2, −2… */
const candidates = c0 => divisors(c0.num).flatMap(d => [d, -d]);

/**
 * null si passosArrels sap resoldre «p = 0» amb solucions racionals (o sense solucions);
 * si no, el motiu: 'constant', 'grau', 'irracionals' o 'sense arrel entera'.
 */
function problemaArrels(p) {
  if (p.length < 2) return 'constant';
  if (p.length > 4) return 'grau';
  if (p.length <= 3) return M.arrelsRacionals(M.termes(p)).irracionals ? 'irracionals' : null;
  const q = normalitza(p).p;
  let resta;
  if (q[0].esZero()) {
    const j = q.findIndex(c => !c.esZero());
    resta = q.slice(j);
  } else {
    const r = candidates(q[0]).find(c => valorP(q, c).esZero());
    if (r === undefined) return 'sense arrel entera';
    resta = ruffini(q, r).quocient;
  }
  return resta.length > 1 && M.arrelsRacionals(M.termes(resta)).irracionals ? 'irracionals' : null;
}

/** Regla de Ruffini: p (coeficients [c0 … c3]) entre (X − r). {mig, baix, quocient}, de més a menys grau. */
function ruffini(p, r) {
  const dalt = p.slice().reverse();
  const baix = [dalt[0]], mig = [null];
  for (let i = 1; i < dalt.length; i++) {
    mig.push(baix[i - 1].producte(r));
    baix.push(dalt[i].suma(mig[i]));
  }
  return {dalt, mig, baix, quocient: baix.slice(0, -1).reverse()};
}

/** «1^{3} - 3 \cdot 1 + 2»: el polinomi amb X = c, sense operar. */
function texSubstituit(p, c) {
  const x = c < 0 ? `(${c})` : String(c);
  return M.termes(p).map((t, i) => {
    const a = t.c.abs();
    const signe = i === 0 ? (t.c.signe() < 0 ? '-' : '') : (t.c.signe() < 0 ? ' - ' : ' + ');
    if (t.n === 0) return signe + M.texNombre(a);
    const potencia = t.n === 1 ? x : `${x}^{${t.n}}`;
    return signe + (a.igual(U) ? potencia : `${M.texNombre(a)} \\cdot ${potencia}`);
  }).join('');
}

/** «X = 1 o X = −2»; sense solucions: null. */
const texSolucions = (arrels, X) => (arrels.length ? arrels.map(r => `${X} = ${M.texNombre(r)}`).join(' \\text{ o } ') : null);

/** Arrels diferents, en ordre. */
const ordena = arrels => arrels.filter((r, i) => arrels.findIndex(s => s.igual(r)) === i).sort((a, b) => a.resta(b).signe());

/**
 * Els passos de «p = 0» (p de grau 1 a 3, coeficients enters; vegeu problemaArrels), amb les
 * convencions de Formules.resolEquacio (l'equació es continua veient i els càlculs baixen a una
 * fila de treball; productes amb «·»; «x = r» a la pissarra; en lila només les solucions).
 *   files: {equacio, lliures}: l'equació va a «equacio»; les altres files (les proves d'arrels,
 *          Ruffini, «x = r o …», la de treball) agafen, per ordre, les de «lliures» que facin
 *          falta, així no queda cap fila buida entre dues files escrites.
 *          (També s'admet {equacio, prova, ruffini, segon, treball}: lliures, en aquest ordre.)
 *   nom:   si es dona («|A|»), el primer pas és l'equació tal com es planteja, «|A| = 0», i
 *          el segon hi substitueix el polinomi. «inici» és el text del primer pas.
 * Al final, un pas marca les solucions en lila. Torna les solucions, diferents i en ordre (Fraccio).
 * Claus: E… l'equació; P… les proves; R… Ruffini; W… «x = r o»; Q… l'equació que queda;
 * Y… la còpia de l'equació que es queda a la seva fila quan els càlculs baixen. Amb «prefix» (p. ex. «a»), totes
 * les claus el porten al davant («aE…», «aW…»; la còpia, «YaE…»): així hi pot haver diverses equacions a la pissarra.
 */
function passosArrels(g, {p, X = 'x', files: filesDonades, inici, nom, irracionals = false, prefix = '', algebra = false}) {
  const K = (k, t) => F.clau(prefix + k, t), R = (k, t) => F.rel(prefix + k, t);   // prefix: diverses equacions alhora a la pissarra
  const termes = M.termes(p);
  const equacio = filesDonades.equacio;
  const cua = (filesDonades.lliures || ['prova', 'ruffini', 'segon', 'treball'].map(k => filesDonades[k]).filter(f => f !== undefined)).slice();
  const files = {};
  const fila = n => {
    if (files[n] === undefined) {
      if (!cua.length) throw new Error('passosArrels: no hi ha prou files lliures');
      files[n] = cua.shift();
    }
    return files[n];
  };
  const lila = [];                                    // [fila, clau] de cada solució
  const tanca = (arrels, tercer = false) => {
    lila.forEach(([f, k]) => F.marcaSolucio(g, f, k));
    const diferents = ordena(arrels);
    const doble = arrels.filter((r, i) => arrels.findIndex(s => s.igual(r)) !== i);
    if (diferents.length && algebra && tercer) {
      const ll = diferents.map(r => `$${X} = ${M.texNombre(r)}$`);
      g.afegeix((ll.length > 1 ? `Les solucions de l'equació original de tercer grau són: ${ll.slice(0, -1).join(', ')} i ${ll[ll.length - 1]}`
        : `La solució de l'equació original de tercer grau és: ${ll[0]}`)
        + (doble.length ? ` (${doble.map(r => `$${X} = ${M.texNombre(r)}$`).join(', ')} és una arrel doble)` : '') + '.');
    } else if (diferents.length) {
      g.afegeix(F.textSolucions(diferents, X)
        + (doble.length ? ` ${doble.map(r => `$${X} = ${M.texNombre(r)}$`).join(', ')} surt dues vegades: és una arrel doble.` : ''));
    }
    return diferents;
  };
  // Primer, l'equació tal com es planteja («|A| = 0»), si es dona el nom; el «=» i el «0» es queden.
  let textPolinomi = inici;
  if (nom) {
    g.files[equacio] = K('En', nom) + R('Eq', '=') + K('Ez', '0');
    g.afegeix(inici);
    textPolinomi = `Substitueix $${nom}$ per la seva expressió.`;
  }

  /* Grau 1 o 2: l'equació es queda; els càlculs, a la fila de treball. */
  if (p.length <= 3) {
    const sol = F.resolEquacio(g, {fila: equacio, treball: fila('treball'), P: prefix + 'E', termes, text: textPolinomi, X, irracionals, algebra});
    sol.forEach(s => lila.push([s.fila, s.clau]));
    return tanca(sol.map(s => s.valor));
  }

  /* Grau 3 (o més, si hi ha factor comú x^j i el que queda és de grau 2 o menys): l'equació, i dividida pel factor comú (o canviada de signe). */
  if (p.length > 4 && (!p[0].esZero() || p.length - p.findIndex(c => !c.esZero()) > 3)) throw new Error('passosArrels: grau no admès');
  g.files[equacio] = F.equacio(prefix + 'E', termes, X);
  g.afegeix(textPolinomi);
  const {p: q, k} = normalitza(p);
  if (k !== 1) {
    g.files[equacio] = F.equacio(prefix + 'E', M.termes(q), X);
    g.afegeix(k === -1 ? 'Canvia el signe dels dos membres (multiplica per $-1$): el primer coeficient queda positiu.'
      : `Divideix els dos membres per $${k}$.`);
  }
  const texQ = texP(q, X);
  let resta, r;
  if (q[0].esZero()) {
    /* Sense terme independent: factor comú X (o X²). */
    const j = q.findIndex(c => !c.esZero());
    resta = q.slice(j);
    const factor = j === 1 ? X : `${X}^{${j}}`;
    g.files[equacio] = K('Ef', factor) + ' \\cdot ' + `(${K('Er', texP(resta, X))})` + R('Eq', '=') + K('Ez', '0');
    g.afegeix(`No hi ha terme independent: treu factor comú $${factor}$.`);
    r = ZERO;
  } else {
    /* Una arrel entera, entre els divisors del terme independent. */
    const c0 = q[0].abs().num;
    const linies = [];
    for (const c of candidates(q[0])) {
      const v = valorP(q, c);
      linies.push(K(`Pv${linies.length}`, `${X} = ${c}`) + ':\\quad ' + K(`Pe${linies.length}`, `${texSubstituit(q, c)} = ${M.texNombre(v)}` + (v.esZero() ? '' : ' \\neq 0')));
      g.files[fila('prova')] = linies.length > 1 ? `\\begin{array}{l} ${linies.join(' \\\\[4pt] ')} \\end{array}` : linies[0];
      const divs = `${divisors(c0).map(d => `$\\pm ${d}$`).join(', ')}`;
      if (algebra) {
        g.afegeix(linies.length === 1
          ? `Com que és una equació de tercer grau, comença buscant una arrel entera: ha de ser un divisor del terme independent, $${c0}$ (${divs}). Prova amb $${X} = ${c}$.`
            + (v.esZero() ? '' : ' No és una arrel: continua buscant.')
          : `Prova $${X} = ${c}$` + (v.esZero() ? ': en aquest cas sí que dona $0$, i per tant és una arrel.' : ', que tampoc no és una arrel.'));
      } else {
        g.afegeix((linies.length === 1
          ? `Busca una arrel entera: ha de ser un divisor del terme independent, $${c0}$ (${divs}). Prova $${X} = ${c}$: `
          : `Prova $${X} = ${c}$: `) + (v.esZero() ? 'dona $0$, és una arrel.' : `dona $${M.texNombre(v)}$, no és una arrel.`));
      }
      if (v.esZero()) { r = Fraccio.de(c); break; }
    }
    /* La regla de Ruffini: q entre (X − r). Una sola línia vertical, després de l'arrel. */
    const {dalt, mig, baix, quocient} = ruffini(q, r);
    const n = dalt.length;
    const cel = (kk, v) => (v === null || v === undefined ? '' : K(kk, M.texNombre(v)));
    const taula = fins => `\\begin{array}{r|${'r'.repeat(n)}} & ${dalt.map((v, i) => cel(`Ra${i}`, v)).join(' & ')} \\\\ `
      + `${K('Rx', M.texNombre(r))} & ${mig.map((v, i) => (i <= fins && i > 0 ? cel(`Rm${i}`, v) : '')).join(' & ')} \\\\ \\hline `
      + `& ${baix.map((v, i) => (i <= fins ? cel(`Rb${i}`, v) : '')).join(' & ')} \\end{array}`;
    g.files[fila('ruffini')] = taula(-1);
    g.afegeix(algebra ? `Com que $${X} = ${M.texNombre(r)}$ és una arrel, a continuació divideix el polinomi per $${texP([r.oposada(), U], X)}$ amb la regla de Ruffini.`
      : `Divideix per $${texP([r.oposada(), U], X)}$ amb la regla de Ruffini: a dalt, els coeficients (també els zeros); a l'esquerra, l'arrel $${M.texNombre(r)}$.`);
    g.files[fila('ruffini')] = taula(0);
    g.afegeix('Baixa el primer coeficient.');
    for (let i = 1; i < n; i++) {
      g.files[fila('ruffini')] = taula(i);
      g.afegeix(algebra && i === n - 1 ? `Observació: has obtingut un residu que val $0$ perquè $${X} = ${M.texNombre(r)}$ és una arrel.`
        : `Multiplica per $${M.texNombre(r)}$ i suma: $${M.texNombre(baix[i - 1])} \\cdot ${M.texEntreParentesis(r)} = ${M.texNombre(mig[i])}$, `
        + `$${M.texNombre(dalt[i])} + ${M.texEntreParentesis(mig[i])} = ${M.texNombre(baix[i])}$.`
        + (i === n - 1 ? ` El residu és $0$, perquè $${X} = ${M.texNombre(r)}$ és una arrel.` : ''));
    }
    resta = quocient;
    const factor = texP([r.oposada(), U], X);
    g.files[equacio] = `(${K('Ef', factor)}) \\cdot (${K('Er', texP(resta, X))})` + R('Eq', '=') + K('Ez', '0');
    g.afegeix(algebra ? `Aquesta divisió et permet escriure el quocient, perquè n'has obtingut els coeficients. És aquest polinomi: $${texP(resta, X)}$.`
      : `Els nombres de baix (menys el residu) són els coeficients del quocient: $${texQ} = (${factor}) \\cdot (${texP(resta, X)})$.`);
  }

  /* Un producte val 0 si algun factor val 0: «x = r o (el que queda) = 0». */
  const davant = K('Wv', X) + R('Wq', '=') + K('Wr', M.texNombre(r));
  lila.push([fila('segon'), prefix + 'Wr']);
  const parteix = `Un producte val $0$ si algun factor val $0$: $${X} = ${M.texNombre(r)}$`;
  let arrels = [r];
  if (resta.length > 1) {
    const sol = F.resolEquacio(g, {fila: fila('segon'), treball: fila('treball'), P: prefix + 'Q', termes: M.termes(resta), X, irracionals, algebra, davant: davant + '\\quad\\text{o}\\quad ',
      text: algebra ? `L'equació era un producte que val $0$, i això és cert si algun factor val $0$. Per tant: $${X} = ${M.texNombre(r)}$, o bé $${texP(resta, X)} = 0$. `
        + (resta.length === 3 ? 'Resol l\'equació de segon grau.' : 'Resol aquesta equació.')
        : `${parteix}, o bé $${texP(resta, X)} = 0$. Resol aquesta equació.`});
    sol.forEach(s => lila.push([s.fila, s.clau]));
    arrels = arrels.concat(sol.map(s => s.valor));
  } else {
    g.files[fila('segon')] = davant;
    g.afegeix(parteix + '.');
  }
  return tanca(arrels, true);
}


/**
 * Un sistema de 2 equacions amb 2 incògnites, S = [[a, b, c], [d, e, f]] (a·v₁ + b·v₂ = c), amb solució
 * única, pel mètode de reducció de 4t d'ESO, sense matrius (mai Cramer: David). Es fa desaparèixer
 * la incògnita amb els multiplicadors més petits (els del mínim comú múltiple dels coeficients;
 * per 1 no s'escriu: l'equació es copia), se sumen les equacions (ratlla a sobre del resultat),
 * s'aïlla l'altra incògnita, se substitueix en una equació (millor la que té coeficient ±1) i
 * s'aïlla la primera. Si una equació només té una incògnita, es fa servir directament.
 * Tot a la fila «fila», línia a línia. Torna la solució [v₁, v₂].
 */
/** «(EQ.2)», d'un altre color (David): el nom d'una equació d'un sistema, a la seva dreta i a la reducció. */
const COLOR_EQ = '#b45309';
const texEq = k => `\\textcolor{${COLOR_EQ}}{\\text{(EQ.${k})}}`;
/** Un sistema amb el nom de cada equació a la dreta: «−2λ + μ = 5   (EQ.1)». linies: TeX de cada equació. */
const texSistemaEq = (linies, inici = 1) => `\\left\\{\\begin{array}{ll} ${linies.map((l, i) => `${l} & \\quad ${texEq(inici + i)}`).join(' \\\\ ')} \\end{array}\\right.`;

function passosReduccio2(g, {S, vars, fila, P = 'X', eqs = [1, 2]}) {
  const [E1, E2] = S;
  const eq = e => texEquacio(e.slice(0, 2), e[2], vars);
  const linies = [];
  const pinta = () => { g.files[fila] = `\\begin{array}{rl} ${linies.join(' \\\\[6pt] ')} \\end{array}`; };
  const linia = (etiqueta, tex) => `${etiqueta} & ${K(`${P}${linies.length}`, tex)}`;
  // Les etiquetes: «(EQ.2) · (−2):», o «(EQ.1):» si no es multiplica (David).
  const nomEq = E => eqs[E === E1 ? 0 : 1];
  const etiqueta = (E, m) => `${texEq(nomEq(E))}${m && !m.igual(1) ? ` \\cdot ${m.signe() < 0 ? `(${M.texNombre(m)})` : M.texNombre(m)}` : ''}:`;
  // Quan ja es té el valor d'una incògnita, es requadra (David).
  const caixa = t => `\\boxed{${t}}`;
  const enter = x => x.den === 1;
  let unica, q;                                            // l'equació d'una sola incògnita, i la incògnita (0 o 1)
  const sola = [E1, E2].find(E => E[0].esZero() || E[1].esZero());
  if (sola) {
    unica = sola;
    q = sola[0].esZero() ? 1 : 0;
    linies.push(linia(etiqueta(sola), unica[q].igual(1) ? caixa(eq(unica)) : eq(unica)));
    pinta();
    g.afegeix(`L'equació ${texEqText(nomEq(sola))} només té una incògnita: $${eq(unica)}$. D'aquí es treu $${vars[q]}$.`);
  } else {
    // Per a cada incògnita, els multiplicadors més petits que en fan oposats els coeficients
    // (amb el mínim comú múltiple, com a 4t d'ESO); es fa desaparèixer la que en té de més petits.
    const opcions = [0, 1].map(j => {
      const a = E1[j], c = E2[j];
      const d = enter(a) && enter(c) ? M.mcd(Math.abs(a.num), Math.abs(c.num)) : 1;
      let m1 = c.oposada().quocient(d), m2 = a.quocient(d);
      if (m1.signe() < 0 && m2.signe() < 0) { m1 = m1.oposada(); m2 = m2.oposada(); }
      return {j, m1, m2, cost: Math.abs(m1.valor()) + Math.abs(m2.valor()), cops: [m1, m2].filter(m => !m.igual(1)).length};
    });
    // Els multiplicadors més petits; si empaten, la que en té menys que no siguin 1 (sumar directament, si es pot).
    const millor = (o, p) => o.cost - p.cost || o.cops - p.cops;
    const {j: e, m1, m2} = millor(opcions[1], opcions[0]) < 0 ? opcions[1] : opcions[0];
    q = 1 - e;
    const A = E1.map(x => x.producte(m1)), B = E2.map(x => x.producte(m2));
    unica = A.map((x, k) => x.suma(B[k]));
    linies.push(linia(etiqueta(E1, m1), eq(A)));
    linies.push(linia(etiqueta(E2, m2), eq(B)));
    pinta();
    const v = vars[e];
    const quines = [m1.igual(1) ? '' : `multiplica ${texEqText(eqs[0])} per $${M.texNombre(m1)}$`, m2.igual(1) ? '' : `${m1.igual(1) ? 'multiplica ' : ''}${texEqText(eqs[1])} per $${M.texNombre(m2)}$`].filter(Boolean);
    g.afegeix(quines.length
      ? `Mètode de reducció: perquè $${v}$ desaparegui en sumar, ${quines.join(' i ')}${quines.length === 1 ? ' (l\'altra equació es queda igual)' : ''}. `
        + `Així els coeficients de $${v}$ queden oposats: $${M.texNombre(A[e])}$ i $${M.texNombre(B[e])}$.`
      : `Mètode de reducció: els coeficients de $${v}$ ja són oposats ($${M.texNombre(A[e])}$ i $${M.texNombre(B[e])}$). Escriu les dues equacions una sota l'altra.`);
    linies.push('\\hline ' + linia('', unica[q].igual(1) ? caixa(eq(unica)) : eq(unica)));   // la ratlla de la suma, just a sobre del resultat
    pinta();
    g.afegeix(`Suma les dues equacions: $${v}$ desapareix.`);
  }
  const e = 1 - q;
  const sq = unica[2].quocient(unica[q]);
  if (!unica[q].igual(1)) {
    linies.push(linia('', caixa(`${vars[q]} = ${M.texNombre(sq)}`)));
    pinta();
    g.afegeix(`Divideix per $${M.texNombre(unica[q])}$: $${vars[q]} = ${M.texNombre(sq)}$.`);
  }
  // L'altra incògnita: a una equació que la tingui (millor si el seu coeficient és 1 o −1), la trobada pel seu valor.
  const candidates = [E1, E2].filter(E => E !== unica && !E[e].esZero());
  const Ex = candidates.find(E => E[e].abs().igual(1)) || candidates[0];
  const [ce, cq, c] = [Ex[e], Ex[q], Ex[2]];
  const resta = c.resta(cq.producte(sq));
  const se = resta.quocient(ce);
  const quina = texEqText(nomEq(Ex));
  const valorE = `${vars[e]} = ${M.texNombre(se)}`;
  if (!cq.esZero()) {
    const numeric = primer => {
      const a = cq.abs();
      const t = a.igual(1) ? (primer && cq.signe() > 0 ? M.texNombre(sq) : M.texEntreParentesis(sq)) : `${M.texNombre(a)} \\cdot ${M.texEntreParentesis(sq)}`;
      return primer ? (cq.signe() < 0 ? '-' : '') + t : (cq.signe() < 0 ? ` - ${t}` : ` + ${t}`);
    };
    const esquerre = e === 0 ? termeVar(ce, vars[e], true) + numeric(false) : numeric(true) + termeVar(ce, vars[e], false);
    linies.push(linia(etiqueta(Ex), `${esquerre} = ${M.texNombre(c)}`));
    pinta();
    g.afegeix(`Substitueix $${vars[q]} = ${M.texNombre(sq)}$ a ${quina}.`);
    const aillat = `${termeVar(ce, vars[e], true)} = ${M.texNombre(resta)}`;
    linies.push(linia('', ce.igual(1) ? caixa(aillat) : aillat));
    pinta();
    g.afegeix('Passa el nombre a l\'altre costat, canviat de signe.');
  } else if (ce.igual(1)) {
    linies.push(linia(etiqueta(Ex), caixa(valorE)));
    pinta();
    g.afegeix(`${quina[0].toUpperCase()}${quina.slice(1)} ja dona $${valorE}$.`);
  } else {
    linies.push(linia(etiqueta(Ex), eq(Ex)));
    pinta();
    g.afegeix(`${quina[0].toUpperCase()}${quina.slice(1)} només té $${vars[e]}$.`);
  }
  if (!ce.igual(1)) {
    linies.push(linia('', caixa(valorE)));
    pinta();
    g.afegeix(`Divideix per $${M.texNombre(ce)}$: $${valorE}$.`);
  }
  return e === 0 ? [se, sq] : [sq, se];
}
/** «l'equació (EQ.2)» per al text del pas, amb el mateix color. */
const texEqText = k => `l'equació $${texEq(k)}$`;

/**
 * Una combinació de dues equacions (n incògnites) pel mètode de reducció, a la fila «fila»:
 *   (EQ.i) · m1:   …        (sense «· m» si m és 1)
 *   (EQ.j) · m2:   …
 *   ─────────────────        (la ratlla de la suma)
 *                  suma
 * E1, E2: coeficients [c₁ … cₙ, terme independent] (Fraccio). Dos passos: les dues equacions
 * multiplicades i la suma. Torna la suma (coeficients). Claus P0, P1, P2 (o les de texSuma(S) per a la suma).
 */
function passosCombina(g, {fila, P = 'X', E1, E2, m1, m2, vars, eqs, text, textSuma, texSuma = null}) {
  const eq = e => texEquacio(e.slice(0, -1), e[e.length - 1], vars);
  const etiqueta = (k, m) => `${texEq(k)}${m.igual(1) ? '' : ` \\cdot ${m.signe() < 0 ? `(${M.texNombre(m)})` : M.texNombre(m)}`}:`;
  const A = E1.map(x => x.producte(m1)), B = E2.map(x => x.producte(m2));
  const S = A.map((x, k) => x.suma(B[k]));
  const linies = [`${etiqueta(eqs[0], m1)} & ${K(P + '0', eq(A))}`, `${etiqueta(eqs[1], m2)} & ${K(P + '1', eq(B))}`];
  g.files[fila] = `\\begin{array}{rl} ${linies.join(' \\\\[6pt] ')} \\end{array}`;
  g.afegeix(text);
  linies.push(`\\hline & ${texSuma ? texSuma(S) : K(P + '2', eq(S))}`);   // texSuma: la suma amb les claus que vulgui qui crida
  g.files[fila] = `\\begin{array}{rl} ${linies.join(' \\\\[6pt] ')} \\end{array}`;
  g.afegeix(textSuma);
  return S;
}

/* ── 5. MENORS DE NOMBRES ──────────────────────────────────────────── */

/** Els nombres (Fraccio) d'una matriu sense paràmetre. */
const nombres = A => A.map(f => f.map(p => p[0] || ZERO));
/** El menor de les files fs i les columnes cs (llistes ordenades). */
const submatriu = (N, fs, cs) => fs.map(i => cs.map(j => N[i][j]));
const texVmatriuN = B => `\\begin{vmatrix} ${B.map(f => f.map(c => M.texNombre(c)).join(' & ')).join(' \\\\ ')} \\end{vmatrix}`;
const det2N = B => B[0][0].producte(B[1][1]).resta(B[0][1].producte(B[1][0]));
/** «a \cdot d - b \cdot c», amb parèntesis als negatius. */
const texDet2N = B => `${M.texEntreParentesis(B[0][0])} \\cdot ${M.texEntreParentesis(B[1][1])} - ${M.texEntreParentesis(B[0][1])} \\cdot ${M.texEntreParentesis(B[1][0])}`;
const productesSarrusN = B => SARRUS.map(s => s.pos.reduce((p, [i, j]) => p.producte(B[i][j]), U));
const det3N = B => productesSarrusN(B).reduce((d, p, n) => (SARRUS[n].signe > 0 ? d.suma(p) : d.resta(p)), ZERO);
/** «[6 + 0 + 4] - [3 + 0 - 2]»: els sis productes de Sarrus, ja fets, en dos claudàtors (cada un amb el seu signe). */
const sumaN = ps => ps.map((p, i) => (i === 0 ? M.texNombre(p) : p.signe() < 0 ? ` - ${M.texNombre(p.abs())}` : ` + ${M.texNombre(p)}`)).join('');
const texSarrusN = B => { const ps = productesSarrusN(B); return `\\lbrack ${sumaN(ps.slice(0, 3))} \\rbrack - \\lbrack ${sumaN(ps.slice(3))} \\rbrack`; };
/** Rang per Gauss (per a «valida»: les pàgines el fan amb menors). */
function rangN(N) {
  const B = N.map(f => f.slice());
  let r = 0;
  for (let c = 0; c < B[0].length && r < B.length; c++) {
    const f = B.findIndex((x, i) => i >= r && !x[c].esZero());
    if (f < 0) continue;
    [B[r], B[f]] = [B[f], B[r]];
    for (let i = r + 1; i < B.length; i++) { const k = B[i][c].quocient(B[r][c]); B[i] = B[i].map((x, j) => x.resta(B[r][j].producte(k))); }
    r++;
  }
  return r;
}


/* ── 6. SISTEMES DE 3 EQUACIONS: EL CAS COMPATIBLE INDETERMINAT ───── */

const INCOGNITES = Object.freeze(['x', 'y', 'z']);
const LAMBDA = '\\lambda';

/** Un terme «c·v» amb el signe davant (« - 2x», « + \lambda»), o sense « + » si és el primer. */
function termeVar(c, v, primer) {
  const a = c.abs();
  const t = (a.igual(U) ? '' : M.texNombre(a)) + v;
  if (primer) return (c.signe() < 0 ? '-' : '') + t;
  return c.signe() < 0 ? ` - ${t}` : ` + ${t}`;
}
/** Expressió lineal en λ amb el terme independent primer: «2 - \lambda», «-3 + 3\lambda», «\lambda», «0». */
function texLineal(p, L = LAMBDA) {
  const c0 = p[0] || ZERO, c1 = p[1] || ZERO;
  if (c1.esZero()) return M.texNombre(c0);
  if (c0.esZero()) return termeVar(c1, L, true);
  return M.texNombre(c0) + termeVar(c1, L, false);
}
/** Una expressió lineal com a factor: entre parèntesis si té dos termes o és negativa. */
const texFactorLineal = p => { const t = texLineal(p); return /^-|[^{]\s[+-]\s/.test(t) ? `(${t})` : t; };
/** N/D (N lineal en λ, D un nombre), simplificat: «1 + \lambda» o «\dfrac{3 - 3\lambda}{2}». */
function texQuocientLineal(N, D) {
  let n = N.slice(), d = D;
  if (d.signe() < 0) { n = oposatP(n); d = d.oposada(); }
  if (n.every(c => c.quocient(d).esEnter())) return texLineal(n.map(c => c.quocient(d)));
  const k = n.filter(c => !c.esZero()).map(c => c.num).concat([d.num]).reduce((a, b) => M.mcd(a, b));
  return `\\dfrac{${texLineal(n.map(c => c.quocient(k)))}}{${M.texNombre(d.quocient(k))}}`;
}
/** Una equació «a·x + b·y + c·z = d» (coeficients Fraccio, o polinomis en el paràmetre X). */
function texEquacio(coefs, d, vars = INCOGNITES, X = null) {
  if (Array.isArray(d)) {
    // Amb paràmetre: «(m + 1)x», «mx», «-x»…
    const termes = coefs.map((p, i) => [p, vars[i]]).filter(([p]) => p.length);
    const esquerre = termes.length ? termes.map(([p, v], i) => {
      const t = M.termes(p);
      if (t.length === 1 && t[0].n === 0) return termeVar(t[0].c, v, i === 0);
      const tex = texP(p, X);
      const factor = t.length > 1 ? `(${tex})` : tex.replace(/^-/, '');
      const negatiu = t.length === 1 && t[0].c.signe() < 0;
      return (i === 0 ? (negatiu ? '-' : '') : (negatiu ? ' - ' : ' + ')) + factor + v;
    }).join('') : '0';
    return `${esquerre} = ${texP(d, X)}`;
  }
  const termes = coefs.map((c, i) => [c, vars[i]]).filter(([c]) => !c.esZero());
  const esquerre = termes.length ? termes.map(([c, v], i) => termeVar(c, v, i === 0)).join('') : '0';
  return `${esquerre} = ${M.texNombre(d)}`;
}
/** El sistema (S: 3 files [a, b, c, d]) amb una clau per equació, P<i>, i potser una marca. */
function texSistema(S, {P = 'Q', marca = () => '', X = null} = {}) {
  return `\\left\\{\\begin{array}{l} ${S.map((f, i) => K(`${P}${i + 1}`, texEquacio(f.slice(0, 3), f[3], INCOGNITES, X), marca(i))).join(' \\\\ ')} \\end{array}\\right.`;
}
/** La matriu ampliada A* = (A | b), amb claus a<i><j> (la columna b és la 4a) i marques. */
function texAmpliada(S, {P = '', marca = () => '', X = null} = {}) {
  const files = S.map((f, i) => f.map((c, j) => K(clauElement(P, i, j), Array.isArray(c) ? texP(c, X) : M.texNombre(c), marca(i, j))).join(' & '));
  return `\\left(\\begin{array}{rrr|r} ${files.join(' \\\\ ')} \\end{array}\\right)`;
}

/* ── 7. MÈTODE DE GAUSS ────────────────────────────────────────────── */
/*
   Esglaonar una matriu de nombres enters (3 files; 4 columnes per a una ampliada), sempre amb el
   mateix algorisme, com el vol el David (sense fraccions ni dreceres):
     · columna per columna, el pivot és el primer element no nul a partir de la fila que toca;
       només es canvien files si l'element de la fila que toca és 0;
     · per fer un zero sota el pivot p, a la fila i (element e): Fᵢ → a·Fᵢ + b·Fⱼ, amb a = p i
       b = −e (sempre una suma; a i b poden ser negatius; no es simplifica mai);
     · les files de zeros queden al final.
   Cada pas: {B (la matriu nova), etiquetes: [TeX o '' per fila], ops: [{i, a, j, b}], text}.
*/

/** «F_2 + (-2)F_1», «3F_3 + (-2)F_2», «-2F_3 + 4F_2»: a·Fᵢ + b·Fⱼ, sempre com a suma. */
function texCombinacio(a, i, b, j) {
  const coef = (c, primer) => (c === 1 ? '' : c === -1 ? (primer ? '-' : '(-1)') : c < 0 && !primer ? `(${c})` : String(c));
  return `${coef(a, true)}F_${i + 1} + ${coef(b, false)}F_${j + 1}`;
}

function passosGauss(S) {
  let B = S.map(f => f.slice());
  const passos = [];
  const nC = B[0].length;
  const nom = c => (c < 3 && nC === 4 ? `la columna de $${INCOGNITES[c]}$` : c === 3 && nC === 4 ? 'la columna dels termes independents' : `la columna ${c + 1}`);
  const copia = () => B.map(f => f.slice());
  const intercanvi = (i, k, text) => {
    [B[i], B[k]] = [B[k], B[i]];
    const et = ['', '', ''];
    et[i] = `F_${i + 1} \\leftrightarrow F_${k + 1}`;
    et[k] = `F_${k + 1} \\leftrightarrow F_${i + 1}`;
    passos.push({B: copia(), etiquetes: et, ops: [{canvi: [i, k]}], text});
  };
  let r = 0, explicat = false;
  const pivots = [];
  for (let c = 0; c < nC && r < 3; c++) {          // també l'última columna: «0 0 0 | 3» i «0 0 0 | 5» encara no és esglaonada
    const k = [0, 1, 2].find(i => i >= r && !B[i][c].esZero());
    if (k === undefined) continue;
    if (k !== r) intercanvi(r, k, `A ${nom(c)}, l'element de la fila ${r + 1} és $0$ i no pot ser pivot: canvia l'ordre de les files ${r + 1} i ${k + 1}.`);
    pivots.push({fila: r, columna: c});
    const p = B[r][c];
    const et = ['', '', ''], ops = [], textos = [];
    for (let i = r + 1; i < 3; i++) {
      const e = B[i][c];
      if (e.esZero()) continue;
      const a = p.num, b = -e.num;                       // a·e + b·p = 0
      B[i] = B[i].map((x, q) => x.producte(a).suma(B[r][q].producte(b)));
      et[i] = texCombinacio(a, i, b, r);
      ops.push({i, a, j: r, b});
      textos.push(`$F_${i + 1} \\to ${et[i]}$`);
    }
    if (ops.length) {
      // La regla, només el primer cop (David: als passos mecànics, sense repetir l'explicació).
      passos.push({B: copia(), etiquetes: et, ops,
        text: explicat ? `Ara, zeros a sota del pivot de ${nom(c)}, el $${M.texNombre(p)}$ de la fila ${r + 1}: ${textos.join(' i ')}.`
          : `Zeros a sota del pivot de ${nom(c)}, el $${M.texNombre(p)}$ de la fila ${r + 1}: per a cada fila, multiplica-la pel pivot i suma-li `
          + `la fila del pivot multiplicada per l'oposat del nombre que vols anul·lar. ${textos.join(' i ')}.`});
      explicat = true;
    }
    r++;
  }
  // Les files de zeros, al final.
  const zero = f => f.every(x => x.esZero());
  for (let i = 0; i < 2; i++) if (zero(B[i]) && !zero(B[i + 1])) intercanvi(i, i + 1, 'Passa la fila de zeros al final.');
  return {passos, B, pivots};
}

/**
 * La cadena de Gauss, com a fila de la pissarra: «A^* = (…)» i, a sota, «∼ (…)» amb les operacions al
 * costat de les files que canvien, fins al pas «fins». «marca(i, j)», per a la darrera matriu.
 */
function texCadenaGauss(S, passos, {fins = passos.length, nom = 'A^*', marca = () => ''} = {}) {
  const etiquetes = et => `\\quad\\begin{array}{l} ${et.map(e => (e ? `\\small ${e}` : '')).join(' \\\\ ')} \\end{array}`;
  const linies = [K('Gn', nom) + R('Gq', '=') + texAmpliada(S, {P: 'G0', marca: fins === 0 ? marca : () => ''})];
  for (let t = 1; t <= fins; t++) {
    linies.push(`\\sim ${texAmpliada(passos[t - 1].B, {P: `G${t}`, marca: t === fins ? marca : () => ''})}${etiquetes(passos[t - 1].etiquetes)}`);
  }
  return `\\begin{array}{l} ${linies.join(' \\\\[10pt] ')} \\end{array}`;
}

/** p (polinomi de grau ≤ 1 en λ, coeficients Fraccio) en TeX, amb una sola fracció si cal: «\dfrac{3 - 3\lambda}{2}», «1 + \lambda». */
function texLinealQ(p) {
  const c = [p[0] || ZERO, p[1] || ZERO];
  const D = c.reduce((d, x) => d * x.den / M.mcd(d, x.den), 1);
  if (D === 1) return texLineal(c);
  return texQuocientLineal(c.map(x => x.producte(D)), new Fraccio(D));
}
/** Com a sumand: entre parèntesis si té dos termes i no és una fracció. */
const texLinealFactor = p => { const t = texLinealQ(p); return t.startsWith('\\dfrac') ? t : texFactorLineal([p[0] || ZERO, p[1] || ZERO]); };

/* ── EXPORTACIÓ ────────────────────────────────────────────────────── */

arrel.Matrius = Object.freeze({
  PARAMETRES, MAX_ELEMENT, SARRUS,
  sumaP, producteP, oposatP, texP, textP, texEntrada, texFactor,
  llegeixMatriu, textMatriu, clauElement, texMatriu, texMatriuPetita,
  determinant, passosSarrus,
  divisors, ruffini, problemaArrels, passosArrels, texSolucions,
  passosReduccio2, passosCombina, texEq, texEqText, texSistemaEq, COLOR_EQ,
  nombres, submatriu, texVmatriuN, det2N, texDet2N, productesSarrusN, det3N, texSarrusN, rangN,
  INCOGNITES, LAMBDA, termeVar, texLineal, texQuocientLineal, texEquacio, texSistema, texAmpliada,
  passosGauss, texCombinacio, texCadenaGauss, texLinealQ, texLinealFactor, valorP,
});

})(globalThis);
