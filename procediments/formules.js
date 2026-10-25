/* ═══════════════════════════════════════════════════════════════════
   formules.js — Fórmules amb claus i guions dels procediments
   ───────────────────────────────────────────────────────────────────
   Mòdul pur: no toca la pàgina (DOM). Depèn de mates.js. Exporta
   «Formules», amb quatre parts:

   1. Fórmules TeX amb CLAUS. Cada símbol que s'ha de poder seguir d'un
      pas al següent porta una clau: \htmlData{k=<clau>}{<símbol>}.
      El motor (motor.js) busca les claus a la pissarra abans i després
      del pas, i el símbol que té la mateixa clau es desplaça.
      Una clau és única dins d'un pas (sumant totes les files).

      Claus d'un polinomi amb prefix P (n = grau del terme):
        P s n  signe            P c n  coeficient, en valor absolut
        P v n  la x, o el valor que la substitueix
        P e n  exponent         P m n  punt de multiplicar
        P t n  valor del terme  P R    resultat de tota l'expressió
        P A, P B, P Q   parèntesis i prima de (…)'
        P E n, P C n    exponent nou i coeficient nou en derivar
      Claus d'un membre esquerre «f(x) =» amb prefix L:
        L F  nom    L P  prima    L a, L b  parèntesis    L X  argument    L q  «=»
      Convé que L i P siguin lletres diferents (p. ex. «G» i «g»).

   2. EQUACIONS: resolPolinomi() resol «polinomi = 0» pas a pas.
   3. FILES DE TEXT: filaText() i frase(), per a enunciats amb frases marcades.
   4. GUIÓ: el constructor de la llista de passos d'un procediment.
   El format d'un pas es documenta a README.md.
   ═══════════════════════════════════════════════════════════════════ */
(function (arrel) {
'use strict';

const {Fraccio, mcd, arrelExacta, texNombre, texEntreParentesis, texPolinomi, derivaTermes} = arrel.Mates;


/* ── 1. CLAUS ──────────────────────────────────────────────────────── */

const CLAU_VALIDA = /^[A-Za-z][A-Za-z0-9]*$/;

/** Símbol amb clau. */
function clau(k, tex) {
  if (!CLAU_VALIDA.test(k)) throw new Error(`Clau no vàlida: «${k}»`);
  return `\\htmlData{k=${k}}{${tex}}`;
}
/** Operador binari amb clau («+», «−», «·»): conserva l'espaiat de TeX. */
const op = (k, tex) => `\\mathbin{${clau(k, tex)}}`;
/** Relació amb clau («=»): conserva l'espaiat de TeX. */
const rel = (k, tex) => `\\mathrel{${clau(k, tex)}}`;

/** Membre esquerre «f(x) =», «f'(2) =», «f''(x) =». «primes»: 0, 1 (o true) o 2. */
function membreEsquerre(L, nom, arg, primes = 0) {
  const n = primes === true ? 1 : (primes || 0);
  return clau(L + 'F', nom)
    + (n ? `^{${clau(L + 'P', '\\prime'.repeat(n))}}` : '')
    + clau(L + 'a', '(') + clau(L + 'X', arg) + clau(L + 'b', ')')
    + rel(L + 'q', '=');
}


/* ── 2. POLINOMIS AMB CLAUS ────────────────────────────────────────── */
/* Els termes són {n, c} de més a menys grau (vegeu Mates.termes);
   c pot ser un enter o una Fraccio. */

const normalitza = llista => llista.map(t => ({n: t.n, c: Fraccio.de(t.c)}));
const esU = a => a.igual(1);

/** Signe d'un terme: el primer només el porta si és negatiu. */
function signe(P, n, primer, negatiu) {
  if (primer) return negatiu ? clau(P + 's' + n, '-') : '';
  return op(P + 's' + n, negatiu ? '-' : '+');
}

/**
 * Un terme «directe» ja mostra el seu valor quan se substitueix la x:
 * el terme independent i els termes ±x. No cal fusionar-lo per calcular-lo.
 */
const esDirecte = t => t.n === 0 || (t.n === 1 && esU(Fraccio.de(t.c).abs()));

/** Clau del valor d'un terme ja calculat. Els termes directes conserven la seva. */
function clauValor(P, t) {
  if (t.n === 0) return P + 'c0';
  return esDirecte(t) ? P + 'v1' : P + 't' + t.n;
}

/**
 * Cert si el valor del terme en x s'escriu amb «−». Un terme que val 0
 * conserva el signe que tenia («−3·0» passa a «− 0»), que és el que
 * l'alumne espera veure.
 */
function esNegatiu(t, x) {
  const val = t.c.producte(x.potencia(t.n));
  return val.signe() < 0 || (val.esZero() && t.c.signe() < 0);
}

/** 2x² − 3x + 1. «x»: el nom de la variable (per defecte, x). */
function polinomi(P, llista, x = 'x') {
  return normalitza(llista).map((t, i) => {
    const a = t.c.abs();
    let s = signe(P, t.n, i === 0, t.c.signe() < 0);
    if (t.n === 0 || !esU(a)) s += clau(P + 'c' + t.n, texNombre(a));
    if (t.n >= 1) s += clau(P + 'v' + t.n, x);
    if (t.n >= 2) s += `^{${clau(P + 'e' + t.n, t.n)}}`;
    return s;
  }).join('');
}

/** 2·2² − 3·2 + 1: cada x passa a ser el valor (mateixa clau P v n). */
function substituit(P, llista, valor) {
  const v = texEntreParentesis(valor);
  return normalitza(llista).map((t, i) => {
    const a = t.c.abs();
    let s = signe(P, t.n, i === 0, t.c.signe() < 0);
    if (t.n === 0) return s + clau(P + 'c0', texNombre(a));
    if (!esU(a)) s += clau(P + 'c' + t.n, texNombre(a)) + op(P + 'm' + t.n, '\\cdot');
    s += clau(P + 'v' + t.n, v);
    if (t.n >= 2) s += `^{${clau(P + 'e' + t.n, t.n)}}`;
    return s;
  }).join('');
}

/**
 * 8 − 6 + 1: el valor de cada terme (vegeu esNegatiu per al signe).
 * Si cap terme no s'ha de calcular, el resultat és idèntic a substituit()
 * i el guió no afegeix el pas.
 */
function avaluat(P, llista, valor) {
  const x = Fraccio.de(valor);
  return normalitza(llista).map((t, i) =>
    signe(P, t.n, i === 0, esNegatiu(t, x)) + clau(clauValor(P, t), texNombre(t.c.producte(x.potencia(t.n)).abs()))
  ).join('');
}

/**
 * Fusions del pas «substituït → avaluat»: els símbols de cada terme que
 * s'ha de calcular (coeficient, punt, valor i exponent) s'ajunten en el
 * seu valor. Només hi surten els símbols que substituit() escriu.
 */
function fusionsAvaluat(P, llista) {
  const f = {};
  normalitza(llista).filter(t => !esDirecte(t)).forEach(t => {
    const fonts = esU(t.c.abs()) ? [] : [P + 'c' + t.n, P + 'm' + t.n];
    fonts.push(P + 'v' + t.n);
    if (t.n >= 2) fonts.push(P + 'e' + t.n);
    f[P + 't' + t.n] = fonts;
  });
  return f;
}

/** Resultat de tota l'expressió. */
const resultat = (P, valor) => clau(P + 'R', texNombre(valor));

/** Fusions del pas «avaluat → resultat»: tots els signes i valors s'ajunten en P R. */
function fusionsResultat(P, llista, valor) {
  const x = Fraccio.de(valor);
  return {[P + 'R']: normalitza(llista).flatMap((t, i) =>
    (i > 0 || esNegatiu(t, x) ? [P + 's' + t.n] : []).concat([clauValor(P, t)]))};
}

/**
 * Claus on queda el resultat d'una expressió avaluada en x = valor:
 *   valor  la del nombre: P R si hi ha més d'un terme; si no, la del terme;
 *   signe  la del «−» que el precedeix, si és un terme sol i negatiu; si no, null.
 * Serveixen per portar el resultat a una altra fila.
 */
function clausResultat(P, llista, valor) {
  const termes = normalitza(llista);
  if (termes.length > 1) return {valor: P + 'R', signe: null};
  const t = termes[0];
  return {valor: clauValor(P, t), signe: esNegatiu(t, Fraccio.de(valor)) ? P + 's' + t.n : null};
}


/* ── 3. DERIVADA D'UN POLINOMI AMB CLAUS ───────────────────────────── */

/** (2x² − 3x + 1)' */
function derivadaIndicada(P, llista) {
  return clau(P + 'A', '(') + polinomi(P, llista) + clau(P + 'B', ')') + `^{${clau(P + 'Q', '\\prime')}}`;
}

/**
 * 2·2x − 3: l'exponent baixa davant (mateixa clau P e n) i apareix
 * l'exponent nou (P E n); la x dels termes de grau 1 i la constant
 * desapareixen.
 */
function derivadaBaixada(P, llista) {
  return normalitza(llista).filter(t => t.n >= 1).map((t, i) => {
    const a = t.c.abs();
    let s = signe(P, t.n, i === 0, t.c.signe() < 0);
    if (t.n === 1) return s + clau(P + 'c1', texNombre(a));
    s += clau(P + 'e' + t.n, t.n);
    if (!esU(a)) s += op(P + 'm' + t.n, '\\cdot') + clau(P + 'c' + t.n, texNombre(a));
    s += clau(P + 'v' + t.n, 'x');
    if (t.n >= 3) s += `^{${clau(P + 'E' + t.n, t.n - 1)}}`;
    return s;
  }).join('');
}

/**
 * Derivada acabada, escrita com un polinomi normal amb el prefix Q.
 * Torna:
 *   tex        la fórmula (Formules.polinomi(Q, derivada))
 *   fusiona    els productes «exponent · coeficient» que s'ajunten
 *   reanomena  la resta de símbols, que passen a tenir claus de Q
 *   multiplica cert si cal fer alguna multiplicació; si és fals, el text
 *              no canvia respecte de derivadaBaixada i les claus noves
 *              s'han de passar al pas següent.
 */
function derivadaFeta(P, Q, llista) {
  const fusiona = {}, reanomena = {};
  let multiplica = false;
  normalitza(llista).filter(t => t.n >= 1).forEach((t, i) => {
    const k = t.n - 1, a = t.c.abs(), nou = a.producte(t.n);
    if (i > 0 || t.c.signe() < 0) reanomena[Q + 's' + k] = P + 's' + t.n;   // el primer terme, només si és negatiu
    if (t.n === 1) { reanomena[Q + 'c0'] = P + 'c1'; return; }
    reanomena[Q + 'v' + k] = P + 'v' + t.n;
    if (k >= 2) reanomena[Q + 'e' + k] = P + 'E' + t.n;
    if (esU(a)) { reanomena[Q + 'c' + k] = P + 'e' + t.n; return; }
    multiplica = true;
    // Si el coeficient nou és 1 (p. ex. ½·2), no s'escriu: el producte va a parar a la x.
    fusiona[esU(nou) ? Q + 'v' + k : Q + 'c' + k] = [P + 'e' + t.n, P + 'm' + t.n, P + 'c' + t.n];
  });
  return {tex: polinomi(Q, derivaTermes(llista)), fusiona, reanomena, multiplica};
}


/* ── 4. EQUACIONS «POLINOMI = 0» ───────────────────────────────────── */

/** 2x² − 3x + 1 = 0. Claus: les del polinomi, P q per a «=» i P z per al 0. */
const equacio = (P, llista, x = 'x') => polinomi(P, llista, x) + rel(P + 'q', '=') + clau(P + 'z', '0');

/** «+3» o «−3», per als textos. */
const ambSigne = v => (Fraccio.de(v).signe() < 0 ? '' : '+') + texNombre(v);
/** Coeficient positiu d'un terme de grau n ≥ 1: no s'escriu si és 1. */
const coeficient = (P, n, a) => (esU(a) ? '' : clau(P + 'c' + n, texNombre(a)));
const O_DISJUNCIO = '\\quad\\text{o}\\quad ';

/**
 * Resol pas a pas l'equació «llista = 0» a la fila «fila» del guió «g»,
 * amb claus de prefix P. El polinomi ha de tenir grau 2 o menys,
 * coeficients enters i solucions racionals (Mates.arrelsRacionals ho diu).
 *   textInici, opcionsInici: text i opcions del primer pas (l'equació);
 *   X: el nom de la variable (per defecte, x).
 * Mètodes, com a classe: dividir per un factor comú; passar el terme
 * independent a l'altre costat; treure factor comú x; x² = k; i la
 * fórmula de l'equació de segon grau.
 * Torna les solucions, de menor a major: [{valor: Fraccio, clau}], on
 * «clau» és la del nombre a l'última fila (per portar-lo a una altra fila).
 * Si no n'hi ha cap, el text de l'últim pas ja ho explica.
 */
function resolPolinomi(g, fila, P, llista, textInici, opcionsInici = {}, X = 'x') {
  let t = normalitza(llista);
  const posa = (tex, text, opcions) => { g.files[fila] = tex; g.afegeix(text, opcions); };
  const x = n => clau(P + 'v' + n, X);
  const igual = rel(P + 'q', '=');
  const quadrat = x(2) + `^{${clau(P + 'e2', 2)}}`;

  posa(equacio(P, t, X), textInici, opcionsInici);
  const grau = t.length ? t[0].n : -1;
  if (grau < 0 || grau > 2) throw new Error('resolPolinomi: grau no admès');
  if (grau === 0) {
    g.completa(` Però $${texNombre(t[0].c)} = 0$ no és cert per a cap valor de $${X}$: l'equació no té solucions.`);
    return [];
  }

  // Divideix per un factor comú, i perquè el primer coeficient sigui positiu.
  if (t.every(u => u.c.esEnter())) {
    const k = t.reduce((m, u) => mcd(m, u.c.num), 0) * t[0].c.signe();
    if (k !== 1) {
      t = t.map(u => ({n: u.n, c: u.c.quocient(k)}));
      posa(equacio(P, t, X), `Divideix els dos membres per $${texNombre(k)}$: l'equació és equivalent i més senzilla.`);
    }
  }
  const coef = n => { const u = t.find(v => v.n === n); return u ? u.c : null; };
  const [A, B, C] = [coef(2), coef(1), coef(0)];
  const zero = Fraccio.de(0);

  /** Dues solucions: la x (clau xClau) es queda a la primera. */
  function separa(xClau, v1, v2, fusiona, text) {
    posa(clau(xClau, X) + igual + clau(P + 'S1', texNombre(v1)) + O_DISJUNCIO
      + clau(P + 'X2', X) + rel(P + 'Q2', '=') + clau(P + 'S2', texNombre(v2)), text, {fusiona});
    return [{valor: v1, clau: P + 'S1'}, {valor: v2, clau: P + 'S2'}];
  }

  if (grau === 1) {
    const a = B;
    if (!C) return [{valor: zero, clau: P + 'z'}];                      // ja és «x = 0»
    posa(coeficient(P, 1, a) + x(1) + igual + clau(P + 'c0', texNombre(C.oposada())),
      `Passa el $${ambSigne(C)}$ a l'altre costat: hi arriba canviat de signe.`, {fusiona: {[P + 'c0']: [P + 'z']}});
    const v = C.oposada().quocient(a);
    if (!esU(a)) {
      posa(x(1) + igual + clau(P + 'c0', texNombre(v)), `Divideix els dos membres per $${texNombre(a)}$.`, {fusiona: {[P + 'c0']: [P + 'c1']}});
    }
    return [{valor: v, clau: P + 'c0'}];
  }

  if (!B) {                                                              // A·x² + C = 0
    let k = zero, kClau = P + 'z';
    if (C) {
      posa(coeficient(P, 2, A) + quadrat + igual + clau(P + 'c0', texNombre(C.oposada())),
        `Passa el $${ambSigne(C)}$ a l'altre costat: hi arriba canviat de signe.`, {fusiona: {[P + 'c0']: [P + 'z']}});
      k = C.oposada();
      kClau = P + 'c0';
      if (!esU(A)) {
        k = k.quocient(A);
        posa(quadrat + igual + clau(kClau, texNombre(k)), `Divideix els dos membres per $${texNombre(A)}$.`, {fusiona: {[kClau]: [P + 'c2']}});
      }
    }
    if (k.signe() < 0) {
      g.completa(' Un quadrat no pot ser negatiu: l\'equació no té solucions.');
      return [];
    }
    if (k.esZero()) {
      posa(x(2) + igual + clau(kClau, '0'), `Si $${X}^2 = 0$, llavors $${X} = 0$.`);
      return [{valor: zero, clau: kClau}];
    }
    const r = arrelExacta(k);
    const pm = clau(P + 'pm', '\\pm');
    posa(x(2) + igual + pm + clau(P + 'r', `\\sqrt{${texNombre(k)}}`),
      'Fes l\'arrel quadrada: hi ha dues solucions, una positiva i una negativa.', {fusiona: {[P + 'r']: [kClau], [P + 'pm']: [P + 'e2']}});
    posa(x(2) + igual + pm + clau(P + 'r', texNombre(r)), `$\\sqrt{${texNombre(k)}} = ${texNombre(r)}$.`);
    return separa(P + 'v2', r.oposada(), r, {[P + 'S1']: [P + 'pm'], [P + 'S2']: [P + 'r']}, 'Separa les dues solucions.');
  }

  if (!C) {                                                              // A·x² + B·x = 0
    const dins = coeficient(P, 2, A) + x(2) + signe(P, 1, false, B.signe() < 0) + clau(P + 'c1', texNombre(B.abs()));
    posa(clau(P + 'f', X) + clau(P + 'l', '(') + dins + clau(P + 'p', ')') + igual + clau(P + 'z', '0'),
      `Treu factor comú $${X}$.`, {fusiona: {[P + 'f']: [P + 'e2', P + 'v1']}});
    const primera = clau(P + 'f', X) + rel(P + 'q0', '=') + clau(P + 'z0', '0') + O_DISJUNCIO;
    posa(primera + dins + igual + clau(P + 'z', '0'), 'Un producte val $0$ quan algun dels factors val $0$.');
    const v = B.oposada().quocient(A);
    posa(primera + x(2) + igual + clau(P + 'c1', texNombre(v)),
      `Resol $${texPolinomi([{n: 1, c: A}, {n: 0, c: B}], X)} = 0$: $${X} = ${texNombre(v)}$.`,
      {fusiona: esU(A) ? {[P + 'c1']: [P + 'z']} : {[P + 'c1']: [P + 'z', P + 'c2']}});
    return [{valor: zero, clau: P + 'z0'}, {valor: v, clau: P + 'c1'}].sort((a, b) => a.valor.resta(b.valor).signe());
  }

  // A·x² + B·x + C = 0: la fórmula.
  const D = B.producte(B).resta(A.producte(C).producte(4));
  const dosA = A.producte(2);
  const formula = (arrelTex, denTex) => x(2) + igual + `\\dfrac{${clau(P + 'nb', texNombre(B.oposada())) + clau(P + 'pm', '\\pm')
    + clau(P + 'r', arrelTex)}}{${clau(P + 'd', denTex)}}`;
  const fonts = (...claus) => claus.filter(k => g.files[fila].includes(`{k=${k}}`));
  posa(formula(`\\sqrt{${texEntreParentesis(B)}^{2} - 4 \\cdot ${texEntreParentesis(A)} \\cdot ${texEntreParentesis(C)}}`, `2 \\cdot ${texEntreParentesis(A)}`),
    `Aplica la fórmula $${X} = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$, amb $a = ${texNombre(A)}$, $b = ${texNombre(B)}$ i $c = ${texNombre(C)}$.`,
    {fusiona: {[P + 'nb']: fonts(P + 's1', P + 'c1', P + 'v1'), [P + 'r']: fonts(P + 's0', P + 'c0', P + 'e2', P + 'z'), [P + 'd']: fonts(P + 'c2')}});
  posa(formula(`\\sqrt{${texNombre(D)}}`, texNombre(dosA)),
    `Calcula el que hi ha dins de l'arrel, $b^2 - 4ac = ${texNombre(D)}$, i el denominador, $2a = ${texNombre(dosA)}$.`);
  if (D.signe() < 0) {
    g.completa(' L\'arrel quadrada d\'un nombre negatiu no existeix: l\'equació no té solucions.');
    return [];
  }
  const r = arrelExacta(D);
  posa(formula(texNombre(r), texNombre(dosA)), `$\\sqrt{${texNombre(D)}} = ${texNombre(r)}$.`);
  if (r.esZero()) {
    const v = B.oposada().quocient(dosA);
    posa(x(2) + igual + clau(P + 'S1', texNombre(v)), `Com que l'arrel val $0$, només hi ha una solució: $${X} = ${texNombre(v)}$.`,
      {fusiona: {[P + 'S1']: [P + 'nb', P + 'pm', P + 'r', P + 'd']}});
    return [{valor: v, clau: P + 'S1'}];
  }
  const v1 = B.oposada().resta(r).quocient(dosA), v2 = B.oposada().suma(r).quocient(dosA);
  const parcial = (s, v) => `${X} = \\frac{${texNombre(B.oposada())} ${s} ${texNombre(r)}}{${texNombre(dosA)}} = ${texNombre(v)}`;
  return separa(P + 'v2', v1, v2, {[P + 'S1']: [P + 'nb', P + 'pm'], [P + 'S2']: [P + 'r', P + 'd']},
    `Separa el $-$ i el $+$: $${parcial('-', v1)}$ i $${parcial('+', v2)}$.`);
}


/* ── 5. FILES DE TEXT ──────────────────────────────────────────────── */

/**
 * Una fila de la pissarra pot ser text en lloc de TeX (p. ex. l'enunciat
 * d'un problema): comença per «§». Dins del text hi pot haver $fórmules$ i
 * frases {{clau|marca|text}}: la clau fa que el motor la pugui seguir i
 * arrossegar com un símbol; la marca (p. ex. «objectiu») la ressalta.
 */
const filaText = text => '§' + text;
function frase(k, text, marca = '') {
  if (k && !CLAU_VALIDA.test(k)) throw new Error(`Clau no vàlida: «${k}»`);
  return `{{${k}|${marca}|${text}}}`;
}


/* ── 6. GUIÓ ───────────────────────────────────────────────────────── */

/**
 * Constructor de la llista de passos d'un procediment.
 *   const g = Formules.guio(2);            // pissarra de 2 files
 *   g.files[0] = '…';                      // TeX amb claus de la fila 0
 *   g.classes[0] = 'final';                // classe CSS de la fila 0
 *   g.afegeix('Text del pas.', {cursor: {clic: 'Ta3'}});
 *   g.completa(' Una frase més per al mateix pas.');
 *   return g.passos;
 * Un pas que no canviaria res de la pissarra (mateixes fórmules, mateixes
 * claus i mateixes classes) no s'afegeix. Així un guió pot demanar un pas
 * opcional, com «Calcula cada terme», sense comprovar si cal.
 */
function guio(nFiles) {
  const files = Array(nFiles).fill('');
  const classes = Array(nFiles).fill('');
  const passos = [];
  function afegeix(text, opcions = {}) {
    const pas = Object.freeze(Object.assign({files: files.slice(), classes: classes.slice(), text}, opcions));
    const anterior = passos[passos.length - 1];
    const igual = anterior && anterior.files.join('\n') === pas.files.join('\n') && anterior.classes.join() === pas.classes.join();
    if (!igual) passos.push(pas);
  }
  /** Afegeix una frase al text de l'últim pas (quan la pissarra no ha de canviar). */
  function completa(text) {
    const i = passos.length - 1;
    passos[i] = Object.freeze(Object.assign({}, passos[i], {text: passos[i].text + text}));
  }
  return {files, classes, afegeix, completa, passos};
}


/* ── EXPORTACIÓ ────────────────────────────────────────────────────── */

arrel.Formules = Object.freeze({
  clau, op, rel, membreEsquerre,
  polinomi, substituit, avaluat, fusionsAvaluat,
  resultat, fusionsResultat, clausResultat,
  derivadaIndicada, derivadaBaixada, derivadaFeta,
  equacio, resolPolinomi,
  filaText, frase,
  guio,
});

})(globalThis);
