/* ═══════════════════════════════════════════════════════════════════
   tecnica-derivacio.js — Procediment: tècnica de derivació
   ───────────────────────────────────────────────────────────────────
   Vint funcions fixes (sense editor; els botons trien la funció, ?p=<id>).
   Només es fan servir aquests casos, sols o combinats:
     polinomi · arrel quadrada (√x = x^(1/2)) · exponencial (eˣ i aˣ) ·
     logaritme · nombre per funció · producte · quocient ·
     funció composta (regla de la cadena; com a màxim dues seguides).

   Com funciona (la idea de Graspable Math: una sola fila que es va
   transformant, una regla a cada pas):
     1. La funció es llegeix (Mates.llegeix) i es converteix en un arbre
        d'expressió (num, x, suma, mul, div, pow, sqrt, exp, expb, ln) més
        un node D(u) = «la derivada de u, encara per fer», que es dibuixa
        «(u)′» amb els parèntesis i la prima en groc.
     2. Les arrels es reescriuen com a potències (√u = u^(1/2)).
     3. A cada pas es tria una classe de regla (suma, nombre per funció,
        producte, quocient, cadena i, l'última, les derivades bàsiques) i
        s'aplica a totes les derivades pendents d'aquesta classe. Les
        derivades que apareixen (u′, v′…) queden pendents i es resolen als
        passos següents. Cada node té un identificador i, per tant, una
        clau: el que és «el mateix» viatja d'un pas a l'altre.
     4. Quan no en queda cap de pendent, es neteja de manera mecànica, un
        tipus d'ordre a cada pas: productes per 1 i zeros; operacions amb
        nombres (els exponents n − 1); els nombres, davant i multiplicats.
     5. Cada funció pot tenir uns passos finals escrits a mà (treure factor
        comú, denominador comú, tornar a escriure les arrels…).
   Totes les línies que es veuen són certes: ho comprova proves/comprova.js
   amb un model independent (f i f′ escrites a mà) en molts punts.

   La pissarra té dues files (FILA): 0 f(x) = …   1 f′(x) = …  (la que canvia).
   Claus: A… (f(x) =), B… (f′(x) =); n<id> cada node de l'arbre (n<id>L i
   n<id>R els parèntesis, n<id>p la prima, n<id>o el punt del producte,
   n<id>e la e de eˣ, n<id>l el «ln», n<id>t el signe d'un terme).
   ═══════════════════════════════════════════════════════════════════ */
(function (arrel) {
'use strict';

const M = arrel.Mates;
const F = arrel.Formules;
const Dd = arrel.Dades;
const {Fraccio} = M;
const fr = (a, b = 1) => new Fraccio(a, b);


/* ── 1. NOMBRES ────────────────────────────────────────────────────── */

/** Un nombre en TeX: 3, -2, \tfrac{1}{2}, -\tfrac{1}{2}. */
function texNum(v) {
  const s = v.signe() < 0 ? '-' : '';
  const a = v.abs();
  return s + (a.esEnter() ? String(a.num) : `\\tfrac{${a.num}}{${a.den}}`);
}

/** Potència d'un racional amb exponent enter (també negatiu); null si no es pot. */
function potenciaEntera(b, e) {
  if (!e.esEnter() || Math.abs(e.num) > 12) return null;
  if (e.num >= 0) return b.potencia(e.num);
  return b.esZero() ? null : fr(1).quocient(b.potencia(-e.num));
}


/* ── 2. L'ARBRE D'EXPRESSIÓ ────────────────────────────────────────── */
/*
   Nodes (tots amb un id únic dins d'un guió):
     {t:'num', v}               nombre racional
     {t:'x'}
     {t:'suma', termes:[{s, e, id}]}   suma de termes amb signe s = +1 o −1
     {t:'mul', a, b}            producte (binari)
     {t:'div', a, b}            quocient
     {t:'pow', b, e}            b^e, amb e un nombre (o una operació amb nombres)
     {t:'sqrt', a}              √a   (només a la funció donada; es reescriu com a potència)
     {t:'exp', a}               eᵃ
     {t:'expb', k, a}           kᵃ, amb k un node num
     {t:'ln', a}                ln(a)
     {t:'D', a}                 (a)′, derivada pendent
*/

function creaArbre() {
  let comptador = 0;
  const id = () => ++comptador;
  const A = {
    num: v => ({t: 'num', id: id(), v: Fraccio.de(v)}),
    x: () => ({t: 'x', id: id()}),
    suma: llista => ({t: 'suma', id: id(), termes: llista.map(([s, e]) => ({s, e, id: id()}))}),
    mul: (a, b) => ({t: 'mul', id: id(), a, b}),
    div: (a, b) => ({t: 'div', id: id(), a, b}),
    pow: (b, e) => ({t: 'pow', id: id(), b, e}),
    sqrt: a => ({t: 'sqrt', id: id(), a}),
    exp: a => ({t: 'exp', id: id(), a}),
    expb: (k, a) => ({t: 'expb', id: id(), k, a}),
    ln: a => ({t: 'ln', id: id(), a}),
    D: a => ({t: 'D', id: id(), a}),
  };

  /** Còpia amb identificadors nous. */
  A.clona = function clona(n) {
    switch (n.t) {
      case 'num': return A.num(n.v);
      case 'x': return A.x();
      case 'suma': return A.suma(n.termes.map(t => [t.s, clona(t.e)]));
      case 'mul': return A.mul(clona(n.a), clona(n.b));
      case 'div': return A.div(clona(n.a), clona(n.b));
      case 'pow': return A.pow(clona(n.b), clona(n.e));
      case 'sqrt': return A.sqrt(clona(n.a));
      case 'exp': return A.exp(clona(n.a));
      case 'expb': return A.expb(clona(n.k), clona(n.a));
      case 'ln': return A.ln(clona(n.a));
      case 'D': return A.D(clona(n.a));
    }
    throw new Error(`Node desconegut: ${n.t}`);
  };

  /** Del que llegeix Mates.llegeix a l'arbre d'aquest procediment. */
  const exacte = n => {
    switch (n.tipus) {
      case 'nombre': return n.valor;
      case 'oposat': return exacte(n.a).oposada();
      case 'suma': return exacte(n.a).suma(exacte(n.b));
      case 'resta': return exacte(n.a).resta(exacte(n.b));
      case 'producte': return exacte(n.a).producte(exacte(n.b));
      case 'quocient': return exacte(n.a).quocient(exacte(n.b));
    }
    return null;
  };
  const sense = n => exacte(n) !== null;
  function aplana(n, s, sortida) {
    if (n.tipus === 'suma') { aplana(n.a, s, sortida); aplana(n.b, s, sortida); return; }
    if (n.tipus === 'resta') { aplana(n.a, s, sortida); aplana(n.b, -s, sortida); return; }
    if (n.tipus === 'oposat') { aplana(n.a, -s, sortida); return; }
    if (n.tipus === 'producte' && n.a.tipus === 'oposat') {          // −3x: el signe és del terme
      aplana({tipus: 'producte', a: n.a.a, b: n.b}, -s, sortida);
      return;
    }
    sortida.push([s, conv(n)]);
  }
  function conv(n) {
    switch (n.tipus) {
      case 'nombre': return A.num(n.valor);
      case 'variable': return A.x();
      case 'suma': case 'resta': case 'oposat': {
        const llista = [];
        aplana(n, 1, llista);
        return A.suma(llista);
      }
      case 'producte': return A.mul(conv(n.a), conv(n.b));
      case 'quocient': return A.div(conv(n.a), conv(n.b));
      case 'potencia': {
        if (n.base.tipus === 'constant' && n.base.nom === 'e') return A.exp(conv(n.exponent));
        if (sense(n.exponent)) return A.pow(conv(n.base), A.num(exacte(n.exponent)));
        if (n.base.tipus === 'nombre') return A.expb(A.num(n.base.valor), conv(n.exponent));
        break;
      }
      case 'crida': {
        if (n.nom === 'sqrt') return A.sqrt(conv(n.arg));
        if (n.nom === 'ln') return A.ln(conv(n.arg));
        if (n.nom === 'exp') return A.exp(conv(n.arg));
        break;
      }
    }
    throw new Error(`tecnica-derivacio: no sé llegir «${n.tipus}${n.nom ? ' ' + n.nom : ''}»`);
  }
  A.llegeix = text => conv(M.llegeix(text));
  return A;
}

const conteX = n => {
  switch (n.t) {
    case 'x': return true;
    case 'num': return false;
    case 'suma': return n.termes.some(t => conteX(t.e));
    case 'mul': case 'div': return conteX(n.a) || conteX(n.b);
    case 'pow': return conteX(n.b) || conteX(n.e);
    case 'expb': return conteX(n.a);
    default: return conteX(n.a);
  }
};
const conte = (n, t) => {
  if (n.t === t) return true;
  switch (n.t) {
    case 'num': case 'x': return false;
    case 'suma': return n.termes.some(q => conte(q.e, t));
    case 'mul': case 'div': return conte(n.a, t) || conte(n.b, t);
    case 'pow': return conte(n.b, t) || conte(n.e, t);
    default: return conte(n.a, t);
  }
};

/** Els fills d'un node, en l'ordre en què es dibuixen. */
function fills(n) {
  switch (n.t) {
    case 'num': case 'x': return [];
    case 'suma': return n.termes.map(t => t.e);
    case 'mul': case 'div': return [n.a, n.b];
    case 'pow': return [n.b, n.e];
    case 'expb': return [n.k, n.a];
    default: return [n.a];
  }
}

/** Torna el node amb els fills canviats per f(fill); el mateix objecte si cap canvia. */
function refa(n, f) {
  switch (n.t) {
    case 'num': case 'x': return n;
    case 'suma': {
      let canvi = false;
      const termes = n.termes.map(t => { const e = f(t.e); if (e !== t.e) canvi = true; return e === t.e ? t : {s: t.s, e, id: t.id}; });
      return canvi ? {t: 'suma', id: n.id, termes} : n;
    }
    case 'mul': case 'div': {
      const a = f(n.a), b = f(n.b);
      return a === n.a && b === n.b ? n : {t: n.t, id: n.id, a, b};
    }
    case 'pow': {
      const b = f(n.b), e = f(n.e);
      return b === n.b && e === n.e ? n : {t: 'pow', id: n.id, b, e};
    }
    case 'expb': {
      const k = f(n.k), a = f(n.a);
      return k === n.k && a === n.a ? n : {t: 'expb', id: n.id, k, a};
    }
    default: {
      const a = f(n.a);
      return a === n.a ? n : {t: n.t, id: n.id, a};
    }
  }
}


/* ── 3. DE L'ARBRE AL TeX (amb claus) ──────────────────────────────── */

const esSumaReal = n => n.t === 'suma' && (n.termes.length > 1 || n.termes[0].s < 0);
const primerFactor = n => (n.t === 'mul' ? primerFactor(n.a) : n);
const darrerFactor = n => (n.t === 'mul' ? darrerFactor(n.b) : n);

/** Cal parèntesis quan és factor d'un producte. */
const parentesiFactor = n => esSumaReal(n) || (n.t === 'num' && n.v.signe() < 0);
/** Cal parèntesis quan és la base d'una potència. */
function parentesiBase(n) {
  if (n.t === 'suma') return esSumaReal(n) || parentesiBase(n.termes[0].e);
  if (n.t === 'num') return n.v.signe() < 0 || !n.v.esEnter();
  return ['mul', 'div', 'pow', 'exp', 'expb', 'ln', 'sqrt', 'D'].includes(n.t);
}
/** Un factor que comença amb parèntesi: davant seu el producte porta punt. */
const comencaAmbParentesi = n => parentesiFactor(n) || (n.t === 'pow' && parentesiBase(n.b)) || n.t === 'D';
/** El producte A·B s'escriu junt (2x, 3eˣ) només si A és un nombre i B res d'això: nombre, fracció o parèntesi. */
function juntes(a, b) {
  return a.t === 'num' && a.v.signe() >= 0 && b.t !== 'num' && b.t !== 'div' && b.t !== 'expb' && !(b.t === 'pow' && b.b.t === 'num') && !comencaAmbParentesi(b);
}

/**
 * TeX d'un arbre. Amb claus (per a la pissarra) o sense (per a les explicacions). Les derivades pendents D
 * porten els parèntesis i la prima marcats en groc.
 */
function dibuixa(arbre, claus = true) {
  const K = claus ? (k, tex, m = '') => F.clau(k, tex, m) : (k, tex) => tex;
  const Op = claus ? (k, tex) => F.op(k, tex) : (k, tex) => `${tex} `;
  const clauDe = (n, suf = '') => `n${n.id}${suf}`;
  const alt = n => conte(n, 'div');
  const obre = (n, amb, m = '', suf = '') => K(clauDe(amb, suf + 'L'), alt(n) ? '\\Bigl(' : '(', m);
  const tanca = (n, amb, m = '', suf = '') => K(clauDe(amb, suf + 'R'), alt(n) ? '\\Bigr)' : ')', m);
  const entre = (n, amb, m = '', suf = '') => obre(n, amb, m, suf) + r(n) + tanca(n, amb, m, suf);

  function sumaTex(n) {
    if (n.termes.length === 1 && n.termes[0].s > 0) return termeTex(n.termes[0].e);
    return n.termes.map((t, i) => {
      const k = `n${t.id}t`;
      const signe = i === 0 ? (t.s < 0 ? K(k, '-') : '') : Op(k, t.s < 0 ? '-' : '+');
      return signe + termeTex(t.e);
    }).join('');
  }
  const termeTex = e => (esSumaReal(e) ? entre(e, e) : r(e));
  function mulTex(n) {
    const L = n.a, R = n.b;
    const punt = juntes(darrerFactor(L), primerFactor(R)) ? '' : Op(clauDe(n, 'o'), '\\cdot');
    const costat = e => (parentesiFactor(e) ? entre(e, e) : r(e));
    return costat(L) + punt + costat(R);
  }
  function r(n) {
    switch (n.t) {
      case 'num': return K(clauDe(n), texNum(n.v));
      case 'x': return K(clauDe(n), 'x');
      case 'suma': return sumaTex(n);
      case 'mul': return mulTex(n);
      case 'div': return `\\dfrac{${r(n.a)}}{${r(n.b)}}`;
      case 'pow': return (parentesiBase(n.b) ? entre(n.b, n.b) : r(n.b)) + `^{${r(n.e)}}`;
      case 'sqrt': return `\\sqrt{${r(n.a)}}`;
      case 'exp': return K(clauDe(n, 'e'), 'e') + `^{${r(n.a)}}`;
      case 'expb': return r(n.k) + `^{${r(n.a)}}`;
      case 'ln': return K(clauDe(n, 'l'), '\\ln') + entre(n.a, n, '', 'a');
      case 'D': {
        const m = claus ? 'tria' : '';
        return obre(n.a, n, m) + r(n.a) + tanca(n.a, n, m) + `^{${K(clauDe(n, 'p'), '\\prime', m)}}`;
      }
    }
    throw new Error(`Node desconegut: ${n.t}`);
  }
  return r(arbre);
}

const tex = n => dibuixa(n, false);
const clausDe = t => [...t.matchAll(/\\htmlData\{k=([A-Za-z0-9]+)/g)].map(m => m[1]);


/* ── 4. LES REGLES ─────────────────────────────────────────────────── */

/** Les derivades pendents (D), d'esquerra a dreta. */
function pendents(n, sortida = []) {
  if (n.t === 'D') sortida.push(n);
  else fills(n).forEach(f => pendents(f, sortida));
  return sortida;
}

/** Ordre en què s'apliquen les classes quan n'hi ha de diferents de pendents. */
const ORDRE_CLASSES = Object.freeze(['suma', 'constant', 'producte', 'quocient', 'cadena', 'basica']);

/**
 * La classe de la regla que cal per a D(a):
 *   basica    (xⁿ)′, (x)′, (k)′, (eˣ)′, (aˣ)′, (ln x)′
 *   suma      (u ± v)′
 *   constant  (k·u)′ i (−u)′
 *   producte  (u·v)′     quocient  (u/v)′
 *   cadena    (uⁿ)′, (eᵘ)′, (aᵘ)′, (ln u)′ amb u diferent de x
 */
function classeDe(a) {
  if (!conteX(a)) return 'basica';
  switch (a.t) {
    case 'x': return 'basica';
    case 'suma': return a.termes.length === 1 && a.termes[0].s < 0 ? 'constant' : 'suma';
    case 'mul': return !conteX(a.a) || !conteX(a.b) ? 'constant' : 'producte';
    case 'div': return 'quocient';
    case 'pow': return a.b.t === 'x' ? 'basica' : 'cadena';
    case 'exp': case 'expb': case 'ln': return a.a.t === 'x' ? 'basica' : 'cadena';
  }
  throw new Error(`tecnica-derivacio: no sé derivar un node «${a.t}»`);
}

/** Quina regla bàsica és (per a l'explicació). */
function basicaDe(a) {
  if (!conteX(a)) return 'const';
  switch (a.t) {
    case 'x': return 'x';
    case 'pow': return 'potencia';
    case 'exp': return 'exp';
    case 'expb': return 'expb';
    case 'ln': return 'ln';
  }
  throw new Error('basicaDe');
}

/** El resultat d'aplicar la regla a D(a) (el node D és «d»). A és el creador de nodes. */
function aplica(A, d) {
  const a = d.a;
  const D = e => A.D(e);
  switch (classeDe(a)) {
    case 'basica': {
      if (!conteX(a)) return A.num(0);
      switch (a.t) {
        case 'x': return A.num(1);
        case 'pow': return A.mul(a.e, A.pow(a.b, A.suma([[1, A.clona(a.e)], [-1, A.num(1)]])));   // l'exponent baixa davant
        case 'exp': return a;
        case 'expb': return A.mul(a, A.ln(A.clona(a.k)));
        case 'ln': return A.div(A.num(1), a.a);
      }
      break;
    }
    case 'suma': return {t: 'suma', id: a.id, termes: a.termes.map(t => ({s: t.s, e: D(t.e), id: t.id}))};
    case 'constant': {
      if (a.t === 'suma') return {t: 'suma', id: a.id, termes: a.termes.map(t => ({s: t.s, e: D(t.e), id: t.id}))};
      return conteX(a.b) ? {t: 'mul', id: a.id, a: a.a, b: D(a.b)} : {t: 'mul', id: a.id, a: D(a.a), b: a.b};
    }
    case 'producte': {
      const u = a.a, v = a.b;
      return A.suma([[1, {t: 'mul', id: a.id, a: D(u), b: v}], [1, A.mul(A.clona(u), D(A.clona(v)))]]);
    }
    case 'quocient': {
      const u = a.a, v = a.b;
      return {t: 'div', id: a.id,
        a: A.suma([[1, A.mul(D(u), v)], [-1, A.mul(A.clona(u), D(A.clona(v)))]]),
        b: A.pow(A.clona(v), A.num(2))};
    }
    case 'cadena': {
      switch (a.t) {
        case 'pow': return A.mul(a.e, A.mul(A.pow(a.b, A.suma([[1, A.clona(a.e)], [-1, A.num(1)]])), D(A.clona(a.b))));
        case 'exp': return A.mul(a, D(A.clona(a.a)));
        case 'expb': return A.mul(A.mul(a, A.ln(A.clona(a.k))), D(A.clona(a.a)));
        case 'ln': return A.div(D(A.clona(a.a)), a.a);
      }
    }
  }
  throw new Error(`tecnica-derivacio: sense regla per a ${a.t}`);
}

/** Substitueix els D triats pel seu resultat. */
function aplicaTots(A, n, triats) {
  if (n.t === 'D') return triats.has(n) ? aplica(A, n) : n;
  return refa(n, f => aplicaTots(A, f, triats));
}

/** Les arrels, com a potències d'exponent 1/2. */
function arrelsAPotencies(A, n) {
  const m = refa(n, f => arrelsAPotencies(A, f));
  return m.t === 'sqrt' ? A.pow(m.a, A.num(fr(1, 2))) : m;
}


/* ── 5. LA NETEJA MECÀNICA ─────────────────────────────────────────── */

const esNum = (n, v) => n.t === 'num' && (v === undefined || n.v.igual(v));

/** Productes per 1, zeros, potències d'exponent 1. Torna {arbre, marques}. */
function netejaUnitats(A, arbre) {
  const marques = {unitat: false, zero: false, perZero: false, pot1: false};
  function f(n) {
    const m = refa(n, f);
    switch (m.t) {
      case 'suma': {
        const quedan = m.termes.filter(t => !esNum(t.e, 0));
        if (quedan.length === m.termes.length) return m;
        marques.zero = true;
        if (!quedan.length) return A.num(0);
        if (quedan.length === 1 && quedan[0].s > 0) return quedan[0].e;
        return {t: 'suma', id: m.id, termes: quedan};
      }
      case 'mul':
        if (esNum(m.a, 0) || esNum(m.b, 0)) { marques.perZero = true; return A.num(0); }
        if (esNum(m.a, 1)) { marques.unitat = true; return m.b; }
        if (esNum(m.b, 1)) { marques.unitat = true; return m.a; }
        return m;
      case 'pow':
        if (esNum(m.e, 1)) { marques.pot1 = true; return m.b; }
        return m;
      case 'div':
        if (esNum(m.b, 1)) { marques.unitat = true; return m.a; }
        return m;
    }
    return m;
  }
  const nou = f(arbre);
  return {arbre: nou, marques, canvi: nou !== arbre};
}

/** El valor d'un subarbre fet només de nombres (null si no ho és, o no és racional). */
function valorNum(n) {
  switch (n.t) {
    case 'num': return n.v;
    case 'suma': {
      let s = fr(0);
      for (const t of n.termes) { const v = valorNum(t.e); if (v === null) return null; s = t.s > 0 ? s.suma(v) : s.resta(v); }
      return s;
    }
    case 'mul': { const a = valorNum(n.a), b = valorNum(n.b); return a && b ? a.producte(b) : null; }
    case 'div': { const a = valorNum(n.a), b = valorNum(n.b); return a && b && !b.esZero() ? a.quocient(b) : null; }
    case 'pow': { const b = valorNum(n.b), e = valorNum(n.e); return b && e ? potenciaEntera(b, e) : null; }
  }
  return null;
}

/** Fa les operacions que només tenen nombres. Torna {arbre, canvis: [{nou, antic}]}. */
function netejaAritmetica(A, arbre) {
  const canvis = [];
  function f(n) {
    if (n.t !== 'num') {
      const v = valorNum(n);
      if (v !== null) { const nou = A.num(v); canvis.push({nou, antic: n}); return nou; }
    }
    const m = refa(n, f);
    if (m.t === 'suma') {            // un terme numèric negatiu passa el signe al terme
      let canvi = false;
      const termes = m.termes.map(t => {
        if (t.e.t === 'num' && t.e.v.signe() < 0 && canvis.some(c => c.nou === t.e)) {
          canvi = true;
          const c = canvis.find(q => q.nou === t.e);
          const positiu = A.num(t.e.v.abs());
          c.nou = positiu;
          return {s: -t.s, e: positiu, id: t.id};
        }
        return t;
      });
      return canvi ? {t: 'suma', id: m.id, termes} : m;
    }
    return m;
  }
  const nou = f(arbre);
  return {arbre: nou, canvis, canvi: nou !== arbre};
}

const classeFactor = f => (f.t === 'num' ? 0 : f.t === 'x' || (f.t === 'pow' && f.b.t === 'x') ? 1 : 2);
function aplanaProducte(n, sortida = []) {
  if (n.t === 'mul') { aplanaProducte(n.a, sortida); aplanaProducte(n.b, sortida); } else sortida.push(n);
  return sortida;
}

/**
 * En cada producte: els nombres, davant i multiplicats entre ells; després les potències de x; després la resta
 * (l'ordre entre factors de la mateixa classe no canvia). Torna {arbre, canvis: [{nou, antics}], ordena, multiplica}.
 * Només es refà un producte si cal: així l'estructura que ja és bona (i els seus identificadors) no es toca.
 */
function netejaProductes(A, arbre) {
  const canvis = [];
  let ordena = false, multiplica = false;
  /** Producte de la llista, niuat a la dreta; reaprofita els identificadors dels productes de l'arbre antic. */
  const refer = (peces, ids) => peces.slice(0, -1).reduceRight((dreta, g, i) => ({t: 'mul', id: ids[i], a: g, b: dreta}), peces[peces.length - 1]);
  function f(n) {
    if (n.t !== 'mul') return refa(n, f);
    const ids = [];
    (function recull(m) { if (m.t === 'mul') { ids.push(m.id); recull(m.a); recull(m.b); } })(n);
    const originals = aplanaProducte(n);
    const factors = originals.map(f);
    const nombres = factors.filter(g => g.t === 'num');
    const altres = factors.filter(g => g.t !== 'num');
    const ordenats = altres.map((g, i) => ({g, i})).sort((p, q) => classeFactor(p.g) - classeFactor(q.g) || p.i - q.i).map(p => p.g);
    let davant = nombres;
    if (nombres.length >= 2) {
      multiplica = true;
      const valor = nombres.reduce((s, g) => s.producte(g.v), fr(1));
      if (valor.igual(1) && ordenats.length) { canvis.push({nou: null, antics: nombres}); davant = []; } else {
        const nou = A.num(valor);
        canvis.push({nou, antics: nombres});
        davant = [nou];
      }
    }
    const peces = davant.concat(ordenats);
    const primerAltre = factors.findIndex(g => g.t !== 'num');
    if (ordenats.some((g, i) => g !== altres[i]) || (primerAltre >= 0 && factors.slice(primerAltre).some(g => g.t === 'num'))) ordena = true;
    const igual = peces.length === originals.length && peces.every((g, i) => g === originals[i]);
    return igual ? n : refer(peces, ids);
  }
  const nou = f(arbre);
  return {arbre: nou, canvis, ordena, multiplica, canvi: nou !== arbre};
}


/* ── 6. LES FUNCIONS ───────────────────────────────────────────────── */

/**
 * Una funció: id (per a l'adreça), nom (per al botó, text pla), f (per llegir) i els passos finals escrits a mà
 * `fi`: [{tex: el membre dret, text: l'explicació}], que el model de proves comprova també.
 */
const PROBLEMES = Object.freeze([
  {id: 'polinomi', nom: '4x³ − 6x² + 5x − 7', f: '4x^3-6x^2+5x-7', fi: []},
  {id: 'arrel', nom: '√x', f: 'sqrt(x)', fi: [
    {tex: '\\dfrac{1}{2\\sqrt{x}}',
      text: 'Una potència d\'exponent negatiu és l\'invers, i l\'exponent $\\frac{1}{2}$ torna a ser una arrel: $x^{-1/2} = \\dfrac{1}{x^{1/2}} = \\dfrac{1}{\\sqrt{x}}$.'}]},
  {id: 'arrel-polinomi', nom: '5√x + x² − 3', f: '5*sqrt(x)+x^2-3', fi: [
    {tex: '\\dfrac{5}{2\\sqrt{x}} + 2x',
      text: 'Torna a escriure $x^{-1/2}$ com $\\dfrac{1}{\\sqrt{x}}$ i multiplica les fraccions: $\\dfrac{5}{2} \\cdot \\dfrac{1}{\\sqrt{x}} = \\dfrac{5}{2\\sqrt{x}}$.'}]},
  {id: 'exponencial', nom: '3eˣ − x²', f: '3*e^x-x^2', fi: []},
  {id: 'logaritme', nom: '3 ln x − x²', f: '3*ln(x)-x^2', fi: [
    {tex: '\\dfrac{3}{x} - 2x', text: 'Multiplica el $3$ per la fracció: $3 \\cdot \\dfrac{1}{x} = \\dfrac{3}{x}$.'}]},
  {id: 'producte-polinomi-exp', nom: 'x²·eˣ', f: 'x^2*e^x', fi: [
    {tex: 'x \\cdot e^{x} \\cdot (2 + x)', text: 'Treu factor comú $x \\cdot e^{x}$.'}]},
  {id: 'producte-x-ln', nom: 'x·ln x', f: 'x*ln(x)', fi: [
    {tex: '\\ln(x) + 1', text: 'Simplifica: $x \\cdot \\dfrac{1}{x} = 1$.'}]},
  {id: 'producte-arrel', nom: '(x² + 1)·√x', f: '(x^2+1)*sqrt(x)', fi: [
    {tex: '2x\\sqrt{x} + \\dfrac{x^{2}+1}{2\\sqrt{x}}',
      text: 'Torna a escriure les potències com a arrels, i l\'exponent negatiu com una fracció.'},
    {tex: '\\dfrac{4x^{2} + x^{2} + 1}{2\\sqrt{x}}',
      text: 'Posa-ho tot sobre el denominador comú $2\\sqrt{x}$: multiplica el primer terme, a dalt i a baix, per $2\\sqrt{x}$, i recorda que $\\sqrt{x} \\cdot \\sqrt{x} = x$.'},
    {tex: '\\dfrac{5x^{2}+1}{2\\sqrt{x}}', text: 'Suma els termes semblants del numerador.'}]},
  {id: 'producte-exponencial-base', nom: 'x·2ˣ', f: 'x*2^x', fi: [
    {tex: '2^{x} \\cdot (1 + x \\cdot \\ln(2))', text: 'Treu factor comú $2^{x}$.'}]},
  {id: 'quocient-polinomis', nom: 'x²/(x + 1)', f: 'x^2/(x+1)', fi: [
    {tex: '\\dfrac{2x^{2} + 2x - x^{2}}{(x+1)^{2}}', text: 'Fes el producte del numerador: $2x \\cdot (x + 1) = 2x^{2} + 2x$.'},
    {tex: '\\dfrac{x^{2} + 2x}{(x+1)^{2}}', text: 'Redueix els termes semblants del numerador: $2x^{2} - x^{2} = x^{2}$.'}]},
  {id: 'quocient-exp', nom: 'eˣ/x', f: 'e^x/x', fi: [
    {tex: '\\dfrac{e^{x} \\cdot (x - 1)}{x^{2}}', text: 'Treu factor comú $e^{x}$ al numerador.'}]},
  {id: 'quocient-ln', nom: 'ln x / x²', f: 'ln(x)/x^2', fi: [
    {tex: '\\dfrac{x - 2x \\cdot \\ln(x)}{x^{4}}', text: 'Simplifica: $x^{2} \\cdot \\dfrac{1}{x} = x$, i la potència d\'una potència es calcula multiplicant els exponents: $(x^{2})^{2} = x^{4}$.'},
    {tex: '\\dfrac{x \\cdot (1 - 2\\ln(x))}{x^{4}}', text: 'Treu factor comú $x$ al numerador.'},
    {tex: '\\dfrac{1 - 2\\ln(x)}{x^{3}}', text: 'Simplifica la fracció: $\\dfrac{x}{x^{4}} = \\dfrac{1}{x^{3}}$.'}]},
  {id: 'cadena-potencia', nom: '(3x² − 1)⁴', f: '(3*x^2-1)^4', fi: []},
  {id: 'cadena-exp', nom: 'e^(x² − 3x)', f: 'e^(x^2-3*x)', fi: []},
  {id: 'cadena-ln', nom: 'ln(x² + 1)', f: 'ln(x^2+1)', fi: []},
  {id: 'cadena-arrel', nom: '√(x² + 1)', f: 'sqrt(x^2+1)', fi: [
    {tex: '\\dfrac{x}{\\sqrt{x^{2}+1}}', text: 'Torna a escriure l\'exponent negatiu com una fracció, i l\'exponent $\\frac{1}{2}$ com una arrel.'}]},
  {id: 'cadena-doble-exp', nom: 'e^((2x + 1)³)', f: 'e^((2*x+1)^3)', fi: []},
  {id: 'cadena-doble-arrel', nom: '√(ln(x² + 1))', f: 'sqrt(ln(x^2+1))', fi: [
    {tex: '\\dfrac{x}{\\sqrt{\\ln(x^{2}+1)} \\cdot (x^{2}+1)}',
      text: 'Multiplica les fraccions: $\\dfrac{1}{2} \\cdot 2x = x$. L\'exponent negatiu passa al denominador, i l\'exponent $\\frac{1}{2}$ torna a ser una arrel.'}]},
  {id: 'producte-cadena', nom: 'x²·e^(3x)', f: 'x^2*e^(3*x)', fi: [
    {tex: 'x \\cdot e^{3x} \\cdot (2 + 3x)', text: 'Treu factor comú $x \\cdot e^{3x}$.'}]},
  {id: 'quocient-cadena', nom: 'ln(2x + 1) / x', f: 'ln(2*x+1)/x', fi: [
    {tex: '\\dfrac{\\dfrac{2x}{2x+1} - \\ln(2x+1)}{x^{2}}', text: 'Multiplica la fracció pel factor $x$.'},
    {tex: '\\dfrac{2x - (2x+1) \\cdot \\ln(2x+1)}{x^{2} \\cdot (2x+1)}',
      text: 'Redueix el numerador a denominador comú: multiplica el segon terme, a dalt i a baix, per $2x + 1$, i passa $2x + 1$ al denominador.'}]},
].map(p => Object.freeze(Object.assign({}, p, {fi: Object.freeze(p.fi.map(q => Object.freeze(q)))}))));

const FIXOS = Dd.problemesFixos(PROBLEMES);
const {perId} = FIXOS;

const FILA = Object.freeze({f: 0, derivada: 1});
const FILES = 2;
const MEMBRE_F = F.membreEsquerre('A', 'f', 'x', 0);
const MEMBRE_D = F.membreEsquerre('B', 'f', 'x', 1);


/* ── 7. ELS TEXTOS DE CADA REGLA ───────────────────────────────────── */

const llista = peces => (peces.length < 2 ? peces.join('') : peces.slice(0, -1).join(', ') + ' i ' + peces[peces.length - 1]);

const REGLES_BASIQUES = Object.freeze({
  potencia: '$(x^{n})\' = n \\cdot x^{n-1}$ (l\'exponent baixa multiplicant, i el nou exponent és un menys)',
  x: '$(x)\' = 1$',
  const: 'la derivada d\'un nombre és $0$',
  exp: '$(e^{x})\' = e^{x}$',
  expb: '$(a^{x})\' = a^{x} \\cdot \\ln(a)$',
  ln: '$(\\ln(x))\' = \\dfrac{1}{x}$',
});

function textRegla(classe, nodes, ordreCadena) {
  const un = nodes.length === 1 ? nodes[0].a : null;
  switch (classe) {
    case 'suma':
      return 'La derivada d\'una suma (o d\'una resta) és la suma (o la resta) de les derivades: $(u \\pm v)\' = u\' \\pm v\'$.';
    case 'constant':
      return nodes.every(d => d.a.t === 'suma')
        ? 'El signe menys es queda fora de la derivada: $(-u)\' = -u\'$.'
        : 'Un nombre que multiplica una funció es queda fora de la derivada: $(k \\cdot u)\' = k \\cdot u\'$.';
    case 'producte':
      return un
        ? `Hi ha un producte de dues funcions, $u = ${tex(un.a)}$ i $v = ${tex(un.b)}$. La regla del producte diu: $(u \\cdot v)' = u' \\cdot v + u \\cdot v'$.`
        : 'La regla del producte: $(u \\cdot v)\' = u\' \\cdot v + u \\cdot v\'$.';
    case 'quocient':
      return un
        ? `Hi ha un quocient de dues funcions, $u = ${tex(un.a)}$ i $v = ${tex(un.b)}$. La regla del quocient diu: $\\left(\\dfrac{u}{v}\\right)' = \\dfrac{u' \\cdot v - u \\cdot v'}{v^{2}}$.`
        : 'La regla del quocient: $\\left(\\dfrac{u}{v}\\right)\' = \\dfrac{u\' \\cdot v - u \\cdot v\'}{v^{2}}$.';
    case 'basica': {
      const tipus = [];
      nodes.forEach(d => { const b = basicaDe(d.a); if (!tipus.includes(b)) tipus.push(b); });
      const ordenades = ['potencia', 'x', 'exp', 'expb', 'ln', 'const'].filter(b => tipus.includes(b));
      return `Aplica ${ordenades.length > 1 ? 'les derivades bàsiques' : 'la derivada bàsica'}: ${llista(ordenades.map(b => REGLES_BASIQUES[b]))}.`;
    }
    case 'cadena': {
      const abans = ordreCadena > 0 ? 'Torna a aparèixer una funció composta: aplica una altra vegada la regla de la cadena. ' : '';
      const d = nodes[0].a;
      const dins = tex(d.t === 'pow' ? d.b : d.a);
      const regla = {
        pow: '$(u^{n})\' = n \\cdot u^{n-1} \\cdot u\'$: es deriva la potència, i es multiplica per la derivada de la funció de dins',
        exp: '$(e^{u})\' = e^{u} \\cdot u\'$: la exponencial es queda igual, i es multiplica per la derivada de l\'exponent',
        expb: '$(a^{u})\' = a^{u} \\cdot \\ln(a) \\cdot u\'$: es multiplica per la derivada de l\'exponent',
        ln: '$(\\ln(u))\' = \\dfrac{u\'}{u}$: la derivada de la funció de dins, dividida per la funció de dins',
      }[d.t];
      return nodes.length === 1
        ? `${abans}Regla de la cadena, amb la funció de dins $u = ${dins}$: ${regla}.`
        : `${abans}Regla de la cadena: ${regla}.`;
    }
  }
  throw new Error('textRegla');
}


/* ── 8. EL GUIÓ ────────────────────────────────────────────────────── */

function passos(valors) {
  const p = perId(valors.p);
  const A = creaArbre();
  let f = A.llegeix(p.f);

  /* Les etapes: {f: arbre de la fila 0, d: arbre de la fila 1 o null, mem: TeX del membre dret sense claus,
     text, cursor, fusions: [{nou, antics}]} */
  const etapes = [];
  const afegeix = (e) => etapes.push(e);

  afegeix({f, d: null, text: 'Comença per la funció $f$: la derivaràs aplicant, una a una, les regles de derivació.'});

  if (conte(f, 'sqrt')) {
    f = arrelsAPotencies(A, f);
    afegeix({f, d: null, text: 'Una arrel quadrada és una potència d\'exponent $\\frac{1}{2}$: $\\sqrt{u} = u^{1/2}$. Escriu-la així abans de derivar.'});
  }

  let d = A.D(A.clona(f));
  afegeix({f, d, text: 'Escriu la derivada: $f\'(x) = \\big(f(x)\\big)\'$. Les derivades que falten per fer són les que tenen els parèntesis i la prima en groc: a cada pas aplicaràs una regla i en quedaran menys.'});

  /* Les regles. */
  let cadenes = 0, guarda = 0;
  for (;;) {
    const pen = pendents(d);
    if (!pen.length) break;
    if (++guarda > 60) throw new Error(`tecnica-derivacio: massa passos a ${p.id}`);
    // Primer les regles que ho desfan en trossos; les derivades bàsiques, al final i totes alhora.
    const classe = ORDRE_CLASSES.find(c => pen.some(q => classeDe(q.a) === c));
    const triats = pen.filter(q => classeDe(q.a) === classe);
    const text = textRegla(classe, triats, cadenes);
    if (classe === 'cadena') cadenes++;
    const nou = aplicaTots(A, d, new Set(triats));
    afegeix({f, d: nou, text, cursor: {clic: `n${triats[0].id}p`}});
    d = nou;
  }

  /* La neteja mecànica. */
  const passosNeteja = [
    () => {
      const r = netejaUnitats(A, d);
      if (!r.canvi) return null;
      const m = r.marques;
      const neutres = [];
      if (m.unitat) neutres.push('multiplicar per $1$');
      if (m.zero) neutres.push('sumar o restar $0$');
      const dits = [];
      if (neutres.length) dits.push(`${llista(neutres)} no canvia res`);
      if (m.perZero) dits.push('multiplicar per $0$ dóna $0$');
      if (m.pot1) dits.push('una potència d\'exponent $1$ és la base');
      return {d: r.arbre, text: `Simplifica: ${llista(dits)}.`};
    },
    () => {
      const r = netejaAritmetica(A, d);
      if (!r.canvi) return null;
      const mostra = r.canvis.slice(0, 3).map(c => `$${tex(c.antic)} = ${tex(c.nou)}$`);
      return {d: r.arbre, fusions: r.canvis.map(c => ({nou: c.nou, antics: [c.antic]})),
        text: `Fes les operacions que només tenen nombres: ${llista(mostra)}${r.canvis.length > 3 ? ', i la resta' : ''}.`};
    },
    () => {
      const r = netejaProductes(A, d);
      if (!r.canvi) return null;
      const text = r.multiplica && r.ordena ? 'Posa els nombres al davant de cada producte i multiplica\'ls entre ells.'
        : r.multiplica ? 'Multiplica els nombres de cada producte entre ells.'
          : 'Ordena els factors de cada producte: primer el nombre, després la $x$.';
      return {d: r.arbre, fusions: r.canvis.filter(c => c.nou).map(c => ({nou: c.nou, antics: c.antics})), text};
    },
  ];
  for (const ordre of [0, 1, 0, 2, 0, 1, 2]) {
    const pas = passosNeteja[ordre]();
    if (pas) { d = pas.d; afegeix({f, d, text: pas.text, fusions: pas.fusions}); }
  }

  /* Els passos finals, escrits a mà. */
  p.fi.forEach(q => afegeix({f, d: null, mem: q.tex, text: q.text}));

  /* Es dibuixa. */
  const g = F.guio(FILES);
  let anterior = '';
  etapes.forEach((e, i) => {
    g.files[FILA.f] = MEMBRE_F + dibuixa(e.f);
    g.files[FILA.derivada] = e.d ? MEMBRE_D + dibuixa(e.d) : e.mem ? MEMBRE_D + e.mem : '';
    const ultim = i === etapes.length - 1;
    g.classes[FILA.derivada] = ultim ? 'final separat' : 'separat';
    const opcions = {};
    if (e.cursor) opcions.cursor = e.cursor;
    if (e.fusions && e.fusions.length) {
      const abans = new Set(clausDe(anterior));
      const despres = new Set(clausDe(g.files[FILA.derivada]));
      const fusiona = {};
      e.fusions.forEach(c => {
        const antics = c.antics.flatMap(n => clausDe(dibuixa(n))).filter(k => abans.has(k) && !despres.has(k));
        const nova = `n${c.nou.id}`;
        if (antics.length && despres.has(nova) && !abans.has(nova)) fusiona[nova] = antics;
      });
      if (Object.keys(fusiona).length) opcions.fusiona = fusiona;
    }
    const resultat = e.d ? tex(e.d) : e.mem;
    g.afegeix(ultim ? `${e.text} Per tant, $f'(x) = ${resultat}$.` : e.text, opcions);
    anterior = g.files[FILA.derivada];
  });
  return g.passos;
}

const enunciat = v => `Deriva la funció $f(x) = ${tex(creaArbre().llegeix(perId(v.p).f))}$.`;
const resum = v => `f(x) = ${tex(creaArbre().llegeix(perId(v.p).f))}`;

arrel.TecnicaDerivacio = Object.freeze({
  titol: 'Tècnica de derivació',
  categoria: 'analisi',
  files: FILES,
  pissarraCreix: true,
  perDefecte: FIXOS.perDefecte,
  exemples: FIXOS.exemples,
  titolEditor: 'Tria una funció',
  notaEditor: 'Cada funció es deriva amb una combinació diferent de regles: polinomis, arrels, exponencials, logaritmes, productes, quocients i funcions compostes.',
  titolExemples: 'Funcions:',
  editor: [],
  problemes: PROBLEMES,
  FILA,
  valida: FIXOS.valida, llegeixAdreca: FIXOS.llegeixAdreca, escriuAdreca: FIXOS.escriuAdreca,
  enunciat, resum, nomExemple: FIXOS.nomExemple,
  passos,
  /* Per a les proves. */
  _intern: Object.freeze({creaArbre, dibuixa, tex, pendents, classeDe}),
});

})(globalThis);
