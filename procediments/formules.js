/* ═══════════════════════════════════════════════════════════════════
   formules.js — Fórmules amb claus i guions dels procediments
   ───────────────────────────────────────────────────────────────────
   Mòdul pur: no toca la pàgina (DOM). Depèn de mates.js. Exporta
   «Formules», amb dues parts:

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

   2. GUIÓ: el constructor de la llista de passos d'un procediment.
   El format d'un pas es documenta a README.md.
   ═══════════════════════════════════════════════════════════════════ */
(function (arrel) {
'use strict';

const {Fraccio, texNombre, texEntreParentesis, derivaTermes} = arrel.Mates;


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

/** Membre esquerre «f(x) =», «f'(2) =». */
function membreEsquerre(L, nom, arg, prima = false) {
  return clau(L + 'F', nom)
    + (prima ? `^{${clau(L + 'P', '\\prime')}}` : '')
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

/** 2x² − 3x + 1 */
function polinomi(P, llista) {
  return normalitza(llista).map((t, i) => {
    const a = t.c.abs();
    let s = signe(P, t.n, i === 0, t.c.signe() < 0);
    if (t.n === 0 || !esU(a)) s += clau(P + 'c' + t.n, texNombre(a));
    if (t.n >= 1) s += clau(P + 'v' + t.n, 'x');
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


/* ── 4. GUIÓ ───────────────────────────────────────────────────────── */

/**
 * Constructor de la llista de passos d'un procediment.
 *   const g = Formules.guio(2);            // pissarra de 2 files
 *   g.files[0] = '…';                      // TeX amb claus de la fila 0
 *   g.classes[0] = 'final';                // classe CSS de la fila 0
 *   g.afegeix('Text del pas.', {cursor: {clic: 'Ta3'}});
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
  return {files, classes, afegeix, passos};
}


/* ── EXPORTACIÓ ────────────────────────────────────────────────────── */

arrel.Formules = Object.freeze({
  clau, op, rel, membreEsquerre,
  polinomi, substituit, avaluat, fusionsAvaluat,
  resultat, fusionsResultat, clausResultat,
  derivadaIndicada, derivadaBaixada, derivadaFeta,
  guio,
});

})(globalThis);
