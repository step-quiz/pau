/* ═══════════════════════════════════════════════════════════════════
   formules.js — Fórmules amb claus i guions dels procediments
   ───────────────────────────────────────────────────────────────────
   Mòdul pur: no toca la pàgina (DOM). Depèn de mates.js. Exporta
   «Formules», amb quatre parts:

   1. Fórmules TeX amb CLAUS. Cada símbol que s'ha de poder seguir d'un
      pas al següent porta una clau: \htmlData{k=<clau>}{<símbol>}.
      marcat() les escriu de manera compacta: «q4: ⟦a:a⟧ + ⟦b:b⟧ = ⟦r:2⟧».
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
        P d n           el denominador nou en integrar
        P I, P D, P K   el signe ∫, el «dx» i la constant C
      Claus d'un membre esquerre «f(x) =» amb prefix L:
        L F  nom    L P  prima    L a, L b  parèntesis    L X  argument    L q  «=»
      Convé que L i P siguin lletres diferents (p. ex. «G» i «g»).

   2. EQUACIONS: resolPolinomi() resol «polinomi = 0» pas a pas, i
      resolEquacio() fa el mateix amb les convencions del David (octubre
      2026), que valen per a tot el web:
        · mentre es resol, l'equació es continua veient: els càlculs
          (passar termes, la fórmula, les solucions) van a una fila de
          sota, la «fila de treball»;
        · un producte s'escriu amb punt: x · (x − 2) = 0;
        · quan es treu factor comú x, «x = 0» s'escriu a la pissarra;
        · en lila (marca «solucio») només les solucions, mai el factor x;
        · una solució que no serveix (fora del domini…) es tatxa (tatxa()).
     DERIVADES i INTEGRALS de polinomis amb claus (derivada…, integral…).
   3. FILES DE TEXT: filaText() i frase(), per a enunciats amb frases marcades.
   4. GUIÓ: el constructor de la llista de passos d'un procediment.
   El format d'un pas es documenta a README.md.
   ═══════════════════════════════════════════════════════════════════ */
(function (arrel) {
'use strict';

const Mates = arrel.Mates;
const {Fraccio, mcd, arrelExacta, texNombre, texEntreParentesis, texPolinomi, derivaTermes} = Mates;


/* ── 1. CLAUS ──────────────────────────────────────────────────────── */

const CLAU_VALIDA = /^[A-Za-z][A-Za-z0-9]*$/;

/** Les marques d'un símbol (el fons de color, a estil.css): «mes» (verd), «menys» (vermell), «tria» (groc). */
// mes/menys/tria: verd, vermell, groc. cami0/cami1/cami2: un color per a cada camí d'un arbre (blau, rosa, cian),
// per veure d'on surt cada terme d'una suma.
// actual: lila, el que s'està calculant ara (p. ex. P(X = 4) a la pregunta i a la seva línia).
// solucio: lila, les solucions trobades d'una equació.
const MARQUES = new Set(['mes', 'menys', 'tria', 'cami0', 'cami1', 'cami2', 'actual', 'solucio']);

/** Símbol amb clau, i potser amb una marca: \htmlData{k=a11,marca=mes}{m}. */
function clau(k, tex, marca = '') {
  if (!CLAU_VALIDA.test(k)) throw new Error(`Clau no vàlida: «${k}»`);
  if (marca && !MARQUES.has(marca)) throw new Error(`Marca no vàlida: «${marca}»`);
  return `\\htmlData{k=${k}${marca ? ',marca=' + marca : ''}}{${tex}}`;
}
/** Una marca de color sense clau, per a un tros d'un símbol que ja en té (no es mou sol). */
function marca(tex, m) {
  if (!MARQUES.has(m)) throw new Error(`Marca no vàlida: «${m}»`);
  return `\\htmlData{marca=${m}}{${tex}}`;
}
/** Operador binari amb clau («+», «−», «·»): conserva l'espaiat de TeX. */
const op = (k, tex) => `\\mathbin{${clau(k, tex)}}`;
/** Relació amb clau («=»): conserva l'espaiat de TeX. */
const rel = (k, tex) => `\\mathrel{${clau(k, tex)}}`;

const RELACIONS = new Set(['=', '<', '>']);
const OPERADORS = new Set(['+', '-', '\\cdot']);

/**
 * Fórmula amb claus escrita de manera compacta: «⟦k:tex⟧» és el símbol
 * «tex» amb la clau k. Si el text comença per «prefix: », totes les claus
 * porten aquest prefix, i el «=» que no és dins de cap ⟦…⟧ (n'hi pot haver
 * un com a màxim) porta la clau prefix + «q». «=», «<» i «>» s'escriuen
 * com a relacions (rel); «+», «-» i «\cdot», com a operadors (op).
 *   marcat('q4: ⟦a:a⟧ + ⟦b:b⟧ = ⟦r:2⟧')   →  claus q4a, q4b, q4q i q4r
 */
function marcat(text) {
  const m = /^([A-Za-z][A-Za-z0-9]*): /.exec(text);
  const P = m ? m[1] : '';
  let iguals = 0;
  const tex = (m ? text.slice(m[0].length) : text).split(/(⟦[^⟦⟧]*⟧)/).map((tros, i) => {
    if (i % 2) {
      const s = /^⟦([A-Za-z0-9]+):([\s\S]*)⟧$/.exec(tros);
      if (!s) throw new Error(`Símbol mal escrit: «${tros}»`);
      const [, k, contingut] = s;
      return (RELACIONS.has(contingut) ? rel : OPERADORS.has(contingut) ? op : clau)(P + k, contingut);
    }
    if (/[⟦⟧]/.test(tros)) throw new Error(`Claudàtors desaparellats a «${text}»`);
    return P ? tros.replace(/=/g, () => { iguals++; return rel(P + 'q', '='); }) : tros;
  }).join('');
  if (iguals > 1) throw new Error(`Hi ha més d'un «=» sense clau a «${text}»`);
  return tex;
}

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


/* ── 3b. INTEGRAL D'UN POLINOMI AMB CLAUS ──────────────────────────── */

/** ∫ (6x² − 4x + 1) dx, o amb límits ∫_a^b (…) dx («limits»: [a, b], en TeX). Els parèntesis, si hi ha més d'un terme. */
function integralIndicada(P, llista, limits = null) {
  const parentesis = normalitza(llista).length > 1;
  return clau(P + 'I', '\\displaystyle\\int') + (limits ? `_{${clau(P + 'La', limits[0])}}^{${clau(P + 'Lb', limits[1])}}` : '')
    + (parentesis ? clau(P + 'A', '(') : '') + polinomi(P, llista) + (parentesis ? clau(P + 'B', ')') : '') + '\\,' + clau(P + 'D', 'dx');
}

/**
 * La regla aplicada a cada terme: c·xⁿ → c · xⁿ⁺¹/(n + 1) (l'exponent nou és P E n; el
 * denominador, P d n); la constant c → c·x (la x és P v 0). Sense la C.
 */
function integralRegla(P, llista) {
  return normalitza(llista).map((t, i) => {
    const a = t.c.abs();
    let s = signe(P, t.n, i === 0, t.c.signe() < 0);
    if (t.n === 0) return s + (esU(a) ? '' : clau(P + 'c0', texNombre(a))) + clau(P + 'v0', 'x');
    if (!esU(a)) s += clau(P + 'c' + t.n, texNombre(a)) + op(P + 'm' + t.n, '\\cdot');
    return s + `\\dfrac{${clau(P + 'v' + t.n, 'x')}^{${clau(P + 'E' + t.n, t.n + 1)}}}{${clau(P + 'd' + t.n, t.n + 1)}}`;
  }).join('');
}

/**
 * La primitiva acabada, com un polinomi normal amb el prefix Q (sense la C). Torna {tex, fusiona,
 * reanomena}: el coeficient nou surt del coeficient, el punt i el denominador; la resta de símbols
 * passen a tenir claus de Q.
 */
function integralFeta(P, Q, llista) {
  const fusiona = {}, reanomena = {};
  normalitza(llista).forEach((t, i) => {
    const k = t.n + 1, a = t.c.abs(), nou = a.quocient(k);
    if (i > 0 || t.c.signe() < 0) reanomena[Q + 's' + k] = P + 's' + t.n;
    reanomena[Q + 'v' + k] = P + 'v' + t.n;
    if (t.n === 0) { if (!esU(a)) reanomena[Q + 'c1'] = P + 'c0'; return; }
    reanomena[Q + 'e' + k] = P + 'E' + t.n;
    const fonts = (esU(a) ? [] : [P + 'c' + t.n, P + 'm' + t.n]).concat([P + 'd' + t.n]);
    // Si el coeficient nou és 1 (p. ex. 3·x³/3), no s'escriu: tot va a parar a la x.
    fusiona[esU(nou) ? Q + 'v' + k : Q + 'c' + k] = fonts;
  });
  return {tex: polinomi(Q, Mates.integraTermes(llista)), fusiona, reanomena};
}
/** « + C», amb clau. */
const mesC = P => op(P + 'p', '+') + clau(P + 'K', 'C');

/**
 * Els tres passos d'una integral indefinida a la fila «fila» del guió «g», darrere de «inici»
 * (p. ex. «F(x) =»): la integral, la regla terme a terme i la primitiva simplificada (prefixos
 * i, j). «C»: si s'hi escriu la constant. «textos»: {indicada, regla, feta}, per canviar-los.
 */
function passosIntegral(g, fila, inici, llista, {C = true, textos = {}} = {}) {
  const ambC = C ? mesC('i') : '';
  g.files[fila] = inici + integralIndicada('i', llista);
  g.afegeix(textos.indicada || 'Escriu la integral indefinida de $f$.');
  g.files[fila] = inici + integralRegla('i', llista) + ambC;
  g.afegeix(textos.regla || ('Integra terme a terme: $\\int x^n\\,dx = \\dfrac{x^{n+1}}{n+1}$ (puja l\'exponent i divideix pel nou exponent), i un nombre $c$ dona $cx$.'
    + (C ? ' Sempre s\'hi suma una constant $C$.' : '')), {cursor: {clic: 'iI'}});
  const feta = integralFeta('i', 'j', llista);
  g.files[fila] = inici + feta.tex + ambC;
  g.afegeix(textos.feta || `Simplifica: $${texPolinomi(Mates.integraTermes(llista))}${C ? ' + C' : ''}$.`, {fusiona: feta.fusiona, reanomena: feta.reanomena});
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
 * Amb {irracionals: true}, «A·x² + C = 0» pot tenir solucions irracionals: x = ±√k (simplificada, √12 = 2√3),
 * i els valors són Mates.Radical. Sense l'opció, el polinomi ha de tenir solucions racionals.
 */
function resolPolinomi(g, fila, P, llista, textInici, opcionsInici = {}, X = 'x', {irracionals = false} = {}) {
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
    if (r === null && !irracionals) throw new Error('resolPolinomi: solucions irracionals (cal l\'opció irracionals)');
    posa(x(2) + igual + pm + clau(P + 'r', `\\sqrt{${texNombre(k)}}`),
      'Fes l\'arrel quadrada: hi ha dues solucions, una positiva i una negativa.', {fusiona: {[P + 'r']: [kClau], [P + 'pm']: [P + 'e2']}});
    // Una arrel exacta es calcula; una d'irracional es deixa amb el signe d'arrel, simplificada si es pot (√12 = 2√3).
    const v = r === null ? Mates.Radical.arrel(k) : r;
    if (texNombre(v) !== `\\sqrt{${texNombre(k)}}`) {
      posa(x(2) + igual + pm + clau(P + 'r', texNombre(v)),
        r === null ? `Simplifica l'arrel: $\\sqrt{${texNombre(k)}} = ${texNombre(v)}$.` : `$\\sqrt{${texNombre(k)}} = ${texNombre(r)}$.`);
    }
    return separa(P + 'v2', v.oposada(), v, {[P + 'S1']: [P + 'pm'], [P + 'S2']: [P + 'r']}, 'Separa les dues solucions.');
  }

  if (!C) {                                                              // A·x² + B·x = 0
    const dins = coeficient(P, 2, A) + x(2) + signe(P, 1, false, B.signe() < 0) + clau(P + 'c1', texNombre(B.abs()));
    posa(clau(P + 'f', X) + op(P + 'pt', '\\cdot') + clau(P + 'l', '(') + dins + clau(P + 'p', ')') + igual + clau(P + 'z', '0'),
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


/** Una solució que no serveix (fora del domini, o que l'enunciat no admet), tatxada en vermell. */
const tatxa = tex => `\\textcolor{#b91c1c}{\\cancel{${tex}}}`;

/** Posa la marca lila («solucio») al símbol de clau k de la fila. */
function marcaSolucio(g, fila, k) {
  g.files[fila] = g.files[fila].replace(`\\htmlData{k=${k}}`, `\\htmlData{k=${k},marca=solucio}`);
}

/**
 * Tatxa la solució de clau k de la fila: el tros «x = valor» que la conté (les solucions
 * d'una fila es parteixen per «o»), o la fila sencera si només n'hi ha una.
 */
function tatxaSolucio(g, fila, k) {
  const parts = g.files[fila].split(O_DISJUNCIO);
  const i = parts.findIndex(t => t.includes(`{k=${k}}`) || t.includes(`{k=${k},`));
  if (i < 0) throw new Error(`tatxaSolucio: la clau ${k} no és a la fila ${fila}`);
  parts[i] = tatxa(parts[i]);
  g.files[fila] = parts.join(O_DISJUNCIO);
}

/** «La solució és $x = 2$.», «Les solucions són $x = 0$ i $x = 2$.» (valors: Fraccio). */
function textSolucions(valors, X = 'x') {
  const llista = valors.map(v => `$${X} = ${texNombre(v)}$`);
  return llista.length > 1 ? `Les solucions són ${llista.slice(0, -1).join(', ')} i ${llista[llista.length - 1]}.` : `La solució és ${llista[0]}.`;
}

/** Les mateixes claus amb una «Y» al davant: una còpia que es queda quieta mentre l'original baixa. */
const copiaQuieta = tex => tex.replace(/\\htmlData\{k=/g, '\\htmlData{k=Y');
/** Encara és l'equació «polinomi = 0» (la de partida o la dividida), no un pas de la resolució. */
const esEquacio = (tex, P) => tex.includes(`{k=${P}z}`) && !tex.includes(`{k=${P}f}`) && !tex.includes(`{k=${P}S1}`);

/**
 * Resol «termes = 0» (grau ≤ 2) com resolPolinomi, però l'equació es continua veient:
 * l'equació (i la simplificada, si es divideix per un factor comú) es queda a «fila»,
 * precedida de «davant»; els altres passos van a la fila de treball «treball» (sense
 * «treball», tot va a «fila»). Quan els càlculs baixen, a «fila» hi queda una còpia de
 * l'equació (claus Y…) i els símbols originals baixen a la fila de treball.
 *   lila:    cert → un pas final marca les solucions en lila; el seu text és «final» (un text, o
 *            una funció de les solucions), o «Les solucions són …». Sense solucions, no hi ha pas.
 *   serveix: (amb lila) una funció del valor: les solucions que no serveixen (fora del domini…)
 *            no es marquen en lila, sinó que es tatxen en vermell.
 * Torna [{valor, clau, fila}]: la clau i la fila de cada solució a la pissarra (també les tatxades).
 */
function resolEquacio(g, {fila, treball, P, termes, text, X = 'x', davant = '', opcions = {}, lila = false, final = null, serveix = null, irracionals = false}) {
  let baixat = false, equacio = '';
  const files = new Proxy(g.files, {
    get(t, k) { return k === String(fila) && baixat ? t[treball] : t[k]; },
    set(t, k, v) {
      if (k !== String(fila)) { t[k] = v; return true; }
      if (!baixat && (treball === undefined || esEquacio(v, P))) { t[fila] = davant + v; equacio = v; return true; }
      if (!baixat) { baixat = true; t[fila] = davant + copiaQuieta(equacio); }
      t[treball] = v;
      return true;
    },
  });
  const intermediari = {files, classes: g.classes, afegeix: g.afegeix, completa: g.completa, passos: g.passos};
  const sol = resolPolinomi(intermediari, fila, P, termes, text, opcions, X, {irracionals})
    .map(s => ({valor: s.valor, clau: s.clau, fila: baixat ? treball : fila}));
  if (lila && sol.length) {
    sol.forEach(s => (!serveix || serveix(s.valor) ? marcaSolucio : tatxaSolucio)(g, s.fila, s.clau));
    g.afegeix(typeof final === 'function' ? final(sol) : final || textSolucions(sol.map(s => s.valor), X));
  }
  return sol;
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

/**
 * Enunciat amb frases marcables, escrit amb claudàtors: «[id:frase]» o
 * «[id*:frase]». Les frases d'un mateix id porten les claus E<id>1, E<id>2…
 * marca(id) diu quina marca té cada id ('' si cap). Torna {tex, principal},
 * on principal[id] és la clau de la frase marcada amb * (o la primera).
 */
function enunciatMarcat(text, marca) {
  const n = {}, principal = {};
  const resultat = text.replace(/\[([A-Za-z0-9]+)(\*?):([^\]]*)\]/g, (_, id, estrella, contingut) => {
    n[id] = (n[id] || 0) + 1;
    const k = 'E' + id + n[id];
    if (estrella || !principal[id]) principal[id] = k;
    return frase(k, contingut, marca(id));
  });
  return {tex: filaText(resultat), principal};
}


/* ── 6. FILES LLARGUES: EN DIVERSES LÍNIES ─────────────────────────── */

/*
 * Amplada aproximada d'un TeX, en píxels de la pissarra al mòbil (mesurada amb
 * KaTeX: una «m» fa uns 14 px, una xifra 8,5, un «+» amb els espais 16, etc.).
 * Només serveix per decidir on es parteix una fila llarga.
 */
const AMPLE_ORDRE = {'\\cdot': 12, '\\qquad': 32, '\\quad': 16, '\\,': 3, '\\ ': 5, '\\neq': 20, '\\ne': 20, '\\iff': 36,
  '\\le': 20, '\\ge': 20, '\\lambda': 10, '\\cdots': 22, '\\ldots': 22};
function ampleTex(tex) {
  let t = tex.replace(/\\htmlData\{[^}]*\}/g, '').replace(/\\(mathrel|mathbin|left|right|textstyle|displaystyle)/g, '');
  let ample = 0;
  // Una fracció fa l'amplada del més ample, el numerador o el denominador.
  for (let i = t.search(/\\d?frac\{/); i >= 0; i = t.search(/\\d?frac\{/)) {
    const grup = k => { let n = 0, j = k; do { if (t[j] === '{') n++; else if (t[j] === '}') n--; j++; } while (n && j < t.length); return j; };
    const a = t.indexOf('{', i), fa = grup(a), fb = grup(fa);
    ample += Math.max(ampleTex(t.slice(a + 1, fa - 1)), ampleTex(t.slice(fa + 1, fb - 1))) / 1.08 + 4;
    t = t.slice(0, i) + t.slice(fb);
  }
  // Una matriu (o un array) fa l'amplada de la seva fila més ampla, més els espais entre columnes.
  t = t.replace(/\\begin\{((?:[pvb]|small)?matrix|array)\}(\{[^}]*\})?((?:(?!\\begin\{)[\s\S])*?)\\end\{\1\}/g, (_, entorn, _c, cos) => {
    const files = cos.split(/\\\\(?:\[[^\]]*\])?/).map(f => f.split('&'));
    ample += Math.max(...files.map(f => f.reduce((s, c) => s + ampleTex(c), 0) / 1.08 + (f.length - 1) * (entorn === 'array' ? 12 : 23)))
      + (entorn === 'array' ? 0 : 12);
    return '';
  });
  t = t.replace(/\\text\{([^}]*)\}/g, (_, x) => { ample += 8 * x.length + 12; return ''; });
  t = t.replace(/\^\{([^{}]*)\}|\^(.)/g, (_, a, b) => { ample += 0.7 * ampleTex(a || b); return ''; });
  t = t.replace(/\\[A-Za-z]+|\\./g, o => { ample += o in AMPLE_ORDRE ? AMPLE_ORDRE[o] : 10; return ''; });
  for (const c of t.replace(/[{}\s]/g, '')) {
    ample += /[mw]/.test(c) ? 14.5 : /[A-Za-z]/.test(c) ? 9 : /\d/.test(c) ? 8.5 : /[()\[\]]/.test(c) ? 6.5
      : c === '|' ? 4 : c === ',' ? 4 : /[+-]/.test(c) ? 16 : /[=<>]/.test(c) ? 20 : 9;
  }
  return Math.round(ample * 1.08);
}

/**
 * Amplada màxima d'una línia (px, mesurada com ampleTex). Els aparells de referència són
 * Chromebooks i portàtils (no mòbils): 460 px a mida de mòbil ≈ 630 px a la lletra de 30 px.
 */
const AMPLE_LINIA = 460;
/**
 * Una fila llarga en diverses línies: «inici» i després les peces (cada una amb el seu
 * signe, p. ex. « + 2m»), tantes com càpiguen en «ample» píxels; les línies següents
 * comencen amb un sagnat. Si tot hi cap, una sola línia (sense array).
 */
function enLinies(inici, peces, {ample = AMPLE_LINIA, sagnat = '\\qquad ', final = '', espai = '4pt'} = {}) {
  const grups = [[]];                                        // les peces de cada línia
  const text = k => (k === 0 ? inici : sagnat) + grups[k].map((p, j) => (k > 0 && j === 0 ? p.replace(/^\s+/, '') : p)).join('');
  for (const p of peces) {
    const k = grups.length - 1;
    if (grups[k].length && ampleTex(text(k) + p) > ample) grups.push([p]);
    else grups[k].push(p);
  }
  // Un resultat curt («= 5») mai sol en una línia nova (David): hi baixa també la peça anterior, si hi cap.
  const n = grups.length;
  if (n > 1 && grups[n - 1].length === 1 && grups[n - 2].length > 1 && ampleTex(grups[n - 1][0]) < ample / 3) {
    const moguda = grups[n - 2].pop();
    if (ampleTex(sagnat + moguda.replace(/^\s+/, '') + grups[n - 1][0]) <= ample) grups[n - 1].unshift(moguda);
    else grups[n - 2].push(moguda);
  }
  const linies = grups.map((_, k) => text(k));
  // El final («= 0», «= 5 ≠ 0») sempre a la mateixa línia que l'última peça: sol en una línia nova costa de llegir (David).
  if (final) linies[linies.length - 1] += final;
  return linies.length > 1 ? `\\begin{array}{l} ${linies.join(` \\\\[${espai}] `)} \\end{array}` : linies[0];
}


/* ── 7. GUIÓ ───────────────────────────────────────────────────────── */

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
  AMPLE_LINIA, clau, marca, op, rel, marcat, membreEsquerre,
  polinomi, substituit, avaluat, fusionsAvaluat,
  resultat, fusionsResultat, clausResultat,
  derivadaIndicada, derivadaBaixada, derivadaFeta,
  integralIndicada, integralRegla, integralFeta, mesC, passosIntegral,
  equacio, resolPolinomi, resolEquacio, marcaSolucio, tatxaSolucio, textSolucions, tatxa,
  filaText, frase, enunciatMarcat,
  ampleTex, enLinies,
  guio,
});

})(globalThis);
