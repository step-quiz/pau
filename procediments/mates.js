/* ═══════════════════════════════════════════════════════════════════
   mates.js — Matemàtiques dels procediments animats
   ───────────────────────────────────────────────────────────────────
   Mòdul pur: no toca la pàgina (DOM). El fan servir formules.js, els
   procediments i les proves automàtiques (Node). Exporta «Mates»:

     Fraccio            nombres racionals exactes
     ErrorLectura       error de lectura, amb un missatge per a l'alumne
     llegeix(text)      text («2x^2-3x+1») → arbre de l'expressió
     llegeixNombre(t)   text («-2», «1/2», «0,5») → Fraccio
     avalua(arbre)      valor numèric d'un arbre
     polinomi(arbre)    coeficients exactes, si l'arbre és un polinomi
     termes(coefs)      termes no nuls {n, c}, de més a menys grau
     coeficientsDe(…)   el contrari: termes → coeficients
     sumaPolinomis, producteDePolinomis   operacions amb coeficients
     derivaTermes(…)    termes de la derivada
     integraTermes(…)   termes d'una primitiva (sense la constant)
     valorTermes(…)     valor exacte dels termes en un punt
     arrelExacta(v)     arrel quadrada exacta (o null)
     arrelsRacionals(…) solucions de «polinomi de grau ≤ 2 = 0»
     texNombre…         escriptura TeX i text pla de nombres i polinomis
   ═══════════════════════════════════════════════════════════════════ */
(function (arrel) {
'use strict';

/* ── 1. FRACCIONS EXACTES ──────────────────────────────────────────── */

/** Màxim comú divisor de dos enters. */
function mcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}

/**
 * Nombre racional exacte num/den, sempre simplificat i amb den > 0.
 * Els objectes són immutables: cada operació en torna un de nou.
 * Si un resultat surt dels enters segurs de JavaScript, llança RangeError.
 */
class Fraccio {
  constructor(num, den = 1) {
    if (!Number.isSafeInteger(num) || !Number.isSafeInteger(den) || den === 0) {
      throw new RangeError(`Fracció no vàlida: ${num}/${den}`);
    }
    const g = mcd(num, den) || 1;
    const s = den < 0 ? -1 : 1;
    this.num = (s * num) / g || 0;          // «|| 0» evita el −0
    this.den = (s * den) / g;
    Object.freeze(this);
  }

  /** Converteix un enter (o una Fraccio, o un Radical racional) en Fraccio. */
  static de(v) {
    if (v instanceof Fraccio) return v;
    if (v instanceof Radical) {
      if (!v.b.esZero()) throw new TypeError(`${v.valor()} no és racional`);
      return v.a;
    }
    return new Fraccio(v);
  }

  // Amb un Radical (a + b√r) irracional, l'operació es fa com a Radical.
  suma(b)     { if (esIrracional(b)) return Radical.de(this).suma(b); b = Fraccio.de(b); return new Fraccio(this.num * b.den + b.num * this.den, this.den * b.den); }
  resta(b)    { if (esIrracional(b)) return Radical.de(this).resta(b); return this.suma(Fraccio.de(b).oposada()); }
  producte(b) { if (esIrracional(b)) return Radical.de(this).producte(b); b = Fraccio.de(b); return new Fraccio(this.num * b.num, this.den * b.den); }
  quocient(b) {
    if (esIrracional(b)) return Radical.de(this).quocient(b);
    b = Fraccio.de(b);
    if (b.num === 0) throw new RangeError('Divisió per zero');
    return new Fraccio(this.num * b.den, this.den * b.num);
  }
  oposada()   { return new Fraccio(-this.num, this.den); }
  abs()       { return new Fraccio(Math.abs(this.num), this.den); }

  /** Potència d'exponent enter no negatiu. */
  potencia(k) {
    let r = new Fraccio(1);
    for (let i = 0; i < k; i++) r = r.producte(this);
    return r;
  }

  signe()     { return Math.sign(this.num); }
  esZero()    { return this.num === 0; }
  esEnter()   { return this.den === 1; }
  igual(b)    { if (esIrracional(b)) return false; b = Fraccio.de(b); return this.num === b.num && this.den === b.den; }
  valor()     { return this.num / this.den; }
}

const ZERO = new Fraccio(0);
const U = new Fraccio(1);
const esIrracional = v => v instanceof Radical && !v.b.esZero();

/**
 * Nombre exacte a + b·√r (a i b racionals; r enter > 1 sense factors quadrats), immutable. Serveix per a les
 * solucions irracionals de «x² = k» (x = ±√3) i per al valor d'un polinomi o d'una funció racional en aquests
 * punts (5√3/4). Amb b = 0 és un racional (r = 1). Només es poden combinar nombres amb la mateixa r (o racionals).
 * Té les mateixes operacions que Fraccio (suma, resta, producte, quocient, potencia, signe, igual, valor…),
 * i texNombre l'escriu.
 */
class Radical {
  constructor(a, b = 0, r = 1) {
    a = Fraccio.de(a);
    b = Fraccio.de(b);
    if (!Number.isSafeInteger(r) || r < 1) throw new RangeError(`Radical no vàlid: √${r}`);
    if (r === 1) { a = a.suma(b); b = ZERO; }
    if (b.esZero()) r = 1;
    this.a = a;
    this.b = b;
    this.r = r;
    Object.freeze(this);
  }

  static de(v) { return v instanceof Radical ? v : new Radical(Fraccio.de(v)); }

  /** √k simplificat (k ≥ 0 racional): √12 = 2√3, √(3/4) = √3/2. Si és exacta, un Radical racional. */
  static arrel(k) {
    k = Fraccio.de(k);
    if (k.signe() < 0) throw new RangeError('Arrel quadrada d\'un nombre negatiu');
    let n = k.num * k.den, c = 1;                    // √(p/q) = √(p·q)/q
    for (let d = 2; d * d <= n; d++) while (n % (d * d) === 0) { n /= d * d; c *= d; }
    return new Radical(0, new Fraccio(c, k.den), n);
  }

  /** La r comuna de dos nombres (un racional s'adapta a l'altre). */
  comuna(o) {
    o = Radical.de(o);
    if (!this.b.esZero() && !o.b.esZero() && this.r !== o.r) throw new RangeError(`No es poden combinar √${this.r} i √${o.r}`);
    return [o, this.b.esZero() ? o.r : this.r];
  }
  suma(o)     { const [p, r] = this.comuna(o); return new Radical(this.a.suma(p.a), this.b.suma(p.b), r); }
  oposada()   { return new Radical(this.a.oposada(), this.b.oposada(), this.r); }
  resta(o)    { return this.suma(Radical.de(o).oposada()); }
  producte(o) {
    const [p, r] = this.comuna(o);                   // (a + b√r)(c + d√r) = ac + bd·r + (ad + bc)√r
    return new Radical(this.a.producte(p.a).suma(this.b.producte(p.b).producte(r)), this.a.producte(p.b).suma(this.b.producte(p.a)), r);
  }
  conjugat()  { return new Radical(this.a, this.b.oposada(), this.r); }
  quocient(o) {
    const p = Radical.de(o), den = p.producte(p.conjugat());   // (c + d√r)(c − d√r) = c² − d²r, racional
    if (den.a.esZero()) throw new RangeError('Divisió per zero');
    const num = this.producte(p.conjugat());
    return new Radical(num.a.quocient(den.a), num.b.quocient(den.a), num.r);
  }
  potencia(k) {
    let x = new Radical(1);
    for (let i = 0; i < k; i++) x = x.producte(this);
    return x;
  }
  abs()       { return this.signe() < 0 ? this.oposada() : this; }
  signe() {
    const sa = this.a.signe(), sb = this.b.signe();
    if (sb === 0) return sa;
    if (sa === 0 || sa === sb) return sb;
    const d = this.a.producte(this.a).resta(this.b.producte(this.b).producte(this.r)).signe();   // a² − b²r
    return d > 0 ? sa : sb;                          // (d no pot ser 0: r no és un quadrat)
  }
  esZero()    { return this.a.esZero() && this.b.esZero(); }
  esEnter()   { return this.b.esZero() && this.a.esEnter(); }
  igual(o) {
    o = Radical.de(o);
    if (!this.b.esZero() && !o.b.esZero() && this.r !== o.r) return false;
    return this.resta(o).esZero();
  }
  valor()     { return this.a.valor() + this.b.valor() * Math.sqrt(this.r); }

  /** «\sqrt{3}», «-2\sqrt{3}», «\frac{5\sqrt{3}}{4}», «1 + \sqrt{2}»; un racional, com texNombre. */
  tex() {
    if (this.b.esZero()) return texNombre(this.a);
    const b = this.b.abs(), arrel = (b.num === 1 ? '' : b.num) + `\\sqrt{${this.r}}`;
    const radical = b.den === 1 ? arrel : `\\frac{${arrel}}{${b.den}}`;
    if (this.a.esZero()) return (this.b.signe() < 0 ? '-' : '') + radical;
    return `${texNombre(this.a)} ${this.b.signe() < 0 ? '-' : '+'} ${radical}`;
  }
}


/* ── 2. LECTURA D'EXPRESSIONS ──────────────────────────────────────── */
/*
   Gramàtica, de menys a més prioritat:
     expressió := terme (('+' | '-') terme)*
     terme     := signe (('*' | '/') signe | [producte implícit] potència)*
     signe     := ('+' | '-') signe | potència
     potència  := primari ('^' signe)?        ← per la dreta: 2^3^2 = 2^9
     primari   := nombre | variable | constant | funció '(' expressió ')'
                | '(' expressió ')'
   · El producte implícit («2x», «3(x+1)», «x(x-5)», «2ln(x)») té la
     mateixa prioritat que «*». No s'admet davant d'un nombre: «x2» és un
     error (cal escriure «x^2»).
   · «-x^2» és −(x²), com a classe.
   · S'accepten «−», «·», «×», superíndexs («x²»), «π», «√» i la coma
     decimal («0,5»).

   Nodes de l'arbre (objectes immutables):
     {tipus: 'nombre', valor: Fraccio}     {tipus: 'variable', nom}
     {tipus: 'constant', nom}              {tipus: 'oposat', a}
     {tipus: 'suma' | 'resta' | 'producte' | 'quocient', a, b}
     {tipus: 'potencia', base, exponent}   {tipus: 'crida', nom, arg}
*/

/** Error de lectura. El missatge és en català i va adreçat a l'alumne. */
class ErrorLectura extends Error {
  constructor(missatge) {
    super(missatge);
    this.name = 'ErrorLectura';
  }
}

/** Funcions conegudes: nom → funció numèrica. */
const FUNCIONS = Object.freeze({
  ln: Math.log, log: Math.log10, sqrt: Math.sqrt, exp: Math.exp,
  sin: Math.sin, cos: Math.cos, tan: Math.tan,
});
/** Altres noms de les mateixes funcions. */
const SINONIMS = Object.freeze({arrel: 'sqrt', sen: 'sin', tg: 'tan'});
/** Constants conegudes. */
const CONSTANTS = Object.freeze({e: Math.E, pi: Math.PI});

const SUPERINDEXS = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const MAX_XIFRES = 12;          // més xifres no caben amb exactitud
const MAX_GRAU = 12;            // grau màxim d'un polinomi llegit

/** Unifica les maneres d'escriure: signes Unicode, superíndexs, coma decimal. */
function normalitza(text) {
  return String(text)
    .replace(/[−–]/g, '-')
    .replace(/[·×⋅]/g, '*')
    .replace(/π/g, 'pi')
    .replace(/√/g, 'sqrt')
    .replace(/′/g, "'")
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, s => '^(' + [...s].map(c => SUPERINDEXS.indexOf(c)).join('') + ')')
    .replace(/,/g, '.');
}

/** Converteix «12», «0.5» o «.25» en una Fraccio exacta. */
function decimal(text) {
  const [enters, decimals = ''] = text.split('.');
  if ((enters + decimals).length > MAX_XIFRES) throw new ErrorLectura('Hi ha un nombre massa llarg.');
  return new Fraccio(Number(enters + decimals || '0'), 10 ** decimals.length);
}

/**
 * Divideix el text en peces (tokens).
 * opcions.variables: lletres que són variables (per defecte, només «x»).
 * opcions.funcions:  noms de funcions de l'usuari, amb primes si cal
 *                    (p. ex. ['f', "f'"]); s'afegeixen a les conegudes.
 */
function trosseja(text, opcions) {
  const s = normalitza(text);
  const variables = opcions.variables || ['x'];
  const funcionsUsuari = new Set(opcions.funcions || []);
  const peces = [];
  let i = 0;

  const esFuncio = nom => nom in FUNCIONS || nom in SINONIMS;

  while (i < s.length) {
    const c = s[i];
    if (/\s/.test(c)) { i++; continue; }

    if (/[0-9.]/.test(c)) {
      const m = /^[0-9]*\.?[0-9]*/.exec(s.slice(i))[0];
      if (m === '.') throw new ErrorLectura('Hi ha un punt decimal sense xifres.');
      peces.push({tipus: 'nombre', valor: decimal(m)});
      i += m.length;
      continue;
    }

    if (/[a-zA-Z]/.test(c)) {
      const paraula = /^[a-zA-Z]+/.exec(s.slice(i))[0];
      let j = i + paraula.length, primes = '';
      while (s[j] === "'") { primes += "'"; j++; }
      i = j;

      if (funcionsUsuari.has(paraula + primes)) { peces.push({tipus: 'funcio', nom: paraula + primes}); continue; }
      if (primes) throw new ErrorLectura(`No entenc «${paraula}${primes}».`);
      if (esFuncio(paraula)) { peces.push({tipus: 'funcio', nom: SINONIMS[paraula] || paraula}); continue; }
      if (paraula in CONSTANTS) { peces.push({tipus: 'constant', nom: paraula}); continue; }

      // «lnx», «sqrtx»…: una funció sense parèntesis.
      const prefix = Object.keys(FUNCIONS).concat(Object.keys(SINONIMS))
        .filter(f => paraula.startsWith(f)).sort((a, b) => b.length - a.length)[0];
      if (prefix) throw new ErrorLectura(`Escriu entre parèntesis el que hi ha dins de «${prefix}»: per exemple, ${prefix}(x).`);

      // Si no, cada lletra és una variable o la constant e: «xx» = x·x.
      for (const lletra of paraula) {
        if (variables.includes(lletra)) peces.push({tipus: 'variable', nom: lletra});
        else if (lletra in CONSTANTS) peces.push({tipus: 'constant', nom: lletra});
        else if (!variables.length) throw new ErrorLectura('Aquí només hi pot haver un nombre.');
        else throw new ErrorLectura(`No conec «${lletra}»: la variable és ${variables.join(', ')}.`);
      }
      continue;
    }

    if ('+-*/^()'.includes(c)) { peces.push({tipus: c}); i++; continue; }

    throw new ErrorLectura(`No entenc el símbol «${c}».`);
  }
  peces.push({tipus: 'fi'});
  return peces;
}

const node = (tipus, camps) => Object.freeze(Object.assign({tipus}, camps));
const TIPUS_PRIMARI = new Set(['variable', 'constant', 'funcio', '(']);

/**
 * Llegeix una expressió i en torna l'arbre.
 * Llança ErrorLectura si el text no és una expressió vàlida.
 */
function llegeix(text, opcions = {}) {
  if (!String(text).trim()) throw new ErrorLectura('No hi ha cap expressió.');
  const peces = trosseja(text, opcions);
  let k = 0;
  const mira = () => peces[k];
  const pren = () => peces[k++];
  const tanca = () => {
    if (mira().tipus !== ')') throw new ErrorLectura('Falta tancar un parèntesi.');
    pren();
  };

  function expressio() {
    let a = terme();
    while (mira().tipus === '+' || mira().tipus === '-') {
      const op = pren().tipus;
      a = node(op === '+' ? 'suma' : 'resta', {a, b: terme()});
    }
    return a;
  }

  function terme() {
    let a = signe();
    for (;;) {
      const t = mira().tipus;
      if (t === '*' || t === '/') { pren(); a = node(t === '*' ? 'producte' : 'quocient', {a, b: signe()}); }
      else if (TIPUS_PRIMARI.has(t)) a = node('producte', {a, b: potencia()});
      else if (t === 'nombre') throw new ErrorLectura('Falta un signe d\'operació entre dos nombres, o el «^» d\'una potència.');
      else return a;
    }
  }

  function signe() {
    if (mira().tipus === '-') { pren(); return node('oposat', {a: signe()}); }
    if (mira().tipus === '+') { pren(); return signe(); }
    return potencia();
  }

  function potencia() {
    const base = primari();
    if (mira().tipus !== '^') return base;
    pren();
    return node('potencia', {base, exponent: signe()});
  }

  function primari() {
    const p = pren();
    switch (p.tipus) {
      case 'nombre':   return node('nombre', {valor: p.valor});
      case 'variable': return node('variable', {nom: p.nom});
      case 'constant': return node('constant', {nom: p.nom});
      case 'funcio': {
        if (mira().tipus !== '(') throw new ErrorLectura(`Escriu entre parèntesis el que hi ha dins de «${p.nom}»: per exemple, ${p.nom}(x).`);
        pren();
        const arg = expressio();
        tanca();
        return node('crida', {nom: p.nom, arg});
      }
      case '(': {
        const e = expressio();
        tanca();
        return e;
      }
      case 'fi': throw new ErrorLectura('L\'expressió s\'acaba massa aviat: hi falta alguna cosa al final.');
      case ')':  throw new ErrorLectura('Hi ha un parèntesi «)» de més, o un parèntesi buit.');
      default:   throw new ErrorLectura(`Hi falta un nombre o una variable abans de «${p.tipus}».`);
    }
  }

  const arbre = expressio();
  if (mira().tipus !== 'fi') {
    throw new ErrorLectura(mira().tipus === ')' ? 'Hi ha un parèntesi «)» de més.' : 'Sobra alguna cosa al final de l\'expressió.');
  }
  return arbre;
}

/** Llegeix un nombre exacte: «-2», «1/2», «0,5», «(3)». */
function llegeixNombre(text) {
  const p = polinomi(llegeix(text, {variables: []}));
  if (!p) throw new ErrorLectura('No és un nombre racional.');
  return p.length ? p[0] : ZERO;
}


/* ── 3. AVALUACIÓ NUMÈRICA ─────────────────────────────────────────── */

/**
 * Valor numèric d'un arbre.
 * entorn.variables: {x: 2, …};  entorn.funcions: {f: x => …, …}.
 */
function avalua(n, entorn = {}) {
  const ev = m => avalua(m, entorn);
  switch (n.tipus) {
    case 'nombre':   return n.valor.valor();
    case 'variable': {
      const v = (entorn.variables || {})[n.nom];
      if (v === undefined) throw new Error(`Falta el valor de ${n.nom}`);
      return v;
    }
    case 'constant': return CONSTANTS[n.nom];
    case 'oposat':   return -ev(n.a);
    case 'suma':     return ev(n.a) + ev(n.b);
    case 'resta':    return ev(n.a) - ev(n.b);
    case 'producte': return ev(n.a) * ev(n.b);
    case 'quocient': return ev(n.a) / ev(n.b);
    case 'potencia': return Math.pow(ev(n.base), ev(n.exponent));
    case 'crida': {
      const f = (entorn.funcions || {})[n.nom] || FUNCIONS[n.nom];
      if (!f) throw new Error(`Falta la funció ${n.nom}`);
      return f(ev(n.arg));
    }
  }
  throw new Error(`Node desconegut: ${n.tipus}`);
}


/* ── 4. POLINOMIS ──────────────────────────────────────────────────── */
/*
   Un polinomi és un vector de coeficients Fraccio, de grau 0 cap amunt,
   sense zeros al final: 2x²−3x+1 → [1, −3, 2]. El polinomi zero és [].
   Els «termes» són la forma de treball dels procediments: només els
   coeficients no nuls, de més a menys grau: [{n: 2, c: 2}, {n: 1, c: −3}, {n: 0, c: 1}].
*/

/** Treu els zeros del final. */
function retalla(p) {
  let n = p.length;
  while (n && p[n - 1].esZero()) n--;
  return p.slice(0, n);
}

function sumaPolinomis(p, q) {
  const r = [];
  for (let i = 0; i < Math.max(p.length, q.length); i++) r.push((p[i] || ZERO).suma(q[i] || ZERO));
  return retalla(r);
}

function producteDePolinomis(p, q) {
  if (!p.length || !q.length) return [];
  const r = Array.from({length: p.length + q.length - 1}, () => ZERO);
  p.forEach((a, i) => q.forEach((b, j) => { r[i + j] = r[i + j].suma(a.producte(b)); }));
  return retalla(r);
}

/** Coeficients de l'arbre si és un polinomi en «x»; si no, null. */
function polinomiDe(n, x) {
  const pol = m => polinomiDe(m, x);
  switch (n.tipus) {
    case 'nombre':   return retalla([n.valor]);
    case 'variable': return n.nom === x ? [ZERO, U] : null;
    case 'constant':
    case 'crida':    return null;
    case 'oposat': {
      const p = pol(n.a);
      return p && p.map(c => c.oposada());
    }
    case 'suma':
    case 'resta':
    case 'producte': {
      const p = pol(n.a), q = pol(n.b);
      if (!p || !q) return null;
      if (n.tipus === 'suma') return sumaPolinomis(p, q);
      if (n.tipus === 'resta') return sumaPolinomis(p, q.map(c => c.oposada()));
      return producteDePolinomis(p, q);
    }
    case 'quocient': {                       // només entre un nombre no nul
      const p = pol(n.a), q = pol(n.b);
      if (!p || !q || q.length !== 1) return null;
      return retalla(p.map(c => c.quocient(q[0])));
    }
    case 'potencia': {                       // exponent natural
      const p = pol(n.base), e = pol(n.exponent);
      if (!p || !e || e.length > 1) return null;
      const k = e.length ? e[0] : ZERO;
      if (!k.esEnter() || k.num < 0 || (p.length - 1) * k.num > MAX_GRAU) return null;
      let r = [U];
      for (let i = 0; i < k.num; i++) r = producteDePolinomis(r, p);
      return r;
    }
  }
  return null;
}

/**
 * Coeficients exactes de l'arbre si és un polinomi en la variable
 * (per defecte «x»), de grau 0 cap amunt. Si no ho és, null.
 */
function polinomi(arbre, x = 'x') {
  try {
    return polinomiDe(arbre, x);
  } catch (e) {
    if (e instanceof RangeError) return null;   // nombres massa grans o divisió per 0
    throw e;
  }
}

/** Coeficients [a0, a1, …] (Fraccio, sense zeros al final) a partir d'una llista de termes. */
function coeficientsDe(llista) {
  const p = [];
  for (const t of llista) {
    while (p.length <= t.n) p.push(ZERO);
    p[t.n] = p[t.n].suma(Fraccio.de(t.c));
  }
  return retalla(p);
}

/** Termes no nuls, de més a menys grau. Admet coeficients enters o Fraccio. */
function termes(coeficients) {
  return coeficients
    .map((c, n) => ({n, c: Fraccio.de(c)}))
    .filter(t => !t.c.esZero())
    .reverse();
}

/** Termes de la derivada: (c·xⁿ)' = c·n·xⁿ⁻¹. */
function derivaTermes(llista) {
  return llista.filter(t => t.n >= 1).map(t => ({n: t.n - 1, c: Fraccio.de(t.c).producte(t.n)}));
}

/** Termes d'una primitiva (sense la constant C): ∫ c·xⁿ dx = c·xⁿ⁺¹/(n + 1). */
function integraTermes(llista) {
  return llista.map(t => ({n: t.n + 1, c: Fraccio.de(t.c).quocient(t.n + 1)}));
}

/** Valor exacte dels termes en el punt x. */
function valorTermes(llista, x) {
  x = Fraccio.de(x);
  return llista.reduce((s, t) => s.suma(Fraccio.de(t.c).producte(x.potencia(t.n))), ZERO);
}


/** Arrel quadrada exacta d'una fracció, o null si és negativa o no és racional. */
function arrelExacta(v) {
  v = Fraccio.de(v);
  if (v.signe() < 0) return null;
  const a = Math.round(Math.sqrt(v.num)), b = Math.round(Math.sqrt(v.den));
  return a * a === v.num && b * b === v.den ? new Fraccio(a, b) : null;
}

/**
 * Solucions reals de «termes = 0», per a un polinomi de grau 2 o menys.
 * Torna {arrels, irracionals}: arrels és la llista de solucions racionals,
 * de menor a major; irracionals és cert si n'hi ha d'irracionals (llavors
 * arrels és buida). El polinomi zero llança un error.
 */
function arrelsRacionals(llista) {
  const c = [0, 1, 2].map(n => { const t = llista.find(u => u.n === n); return t ? Fraccio.de(t.c) : ZERO; });
  if (llista.some(t => t.n > 2)) throw new Error('arrelsRacionals: grau més gran que 2');
  if (!c[2].esZero()) {
    const d = c[1].producte(c[1]).resta(c[2].producte(c[0]).producte(4));
    if (d.signe() < 0) return {arrels: [], irracionals: false};
    const r = arrelExacta(d);
    if (!r) return {arrels: [], irracionals: true};
    const den = c[2].producte(2);
    const arrels = [c[1].oposada().resta(r).quocient(den), c[1].oposada().suma(r).quocient(den)]
      .sort((a, b) => a.resta(b).signe());
    return {arrels: r.esZero() ? [arrels[0]] : arrels, irracionals: false};
  }
  if (!c[1].esZero()) return {arrels: [c[0].oposada().quocient(c[1])], irracionals: false};
  if (!c[0].esZero()) return {arrels: [], irracionals: false};
  throw new Error('arrelsRacionals: el polinomi zero');
}


/* ── 5. ESCRIPTURA ─────────────────────────────────────────────────── */

/** Nombre en TeX: «-3», «\frac{1}{2}», «-\frac{1}{2}». */
function texNombre(v) {
  if (v instanceof Radical) return v.tex();
  v = Fraccio.de(v);
  if (v.esEnter()) return String(v.num);
  return (v.num < 0 ? '-' : '') + `\\frac{${Math.abs(v.num)}}{${v.den}}`;
}

/** Nombre en TeX, entre parèntesis si és negatiu o fraccionari: «(-2)». */
function texEntreParentesis(v) {
  if (esIrracional(v)) return `\\left(${v.tex()}\\right)`;
  v = Fraccio.de(v);
  if (!v.esEnter()) return `\\left(${texNombre(v)}\\right)`;
  return v.num < 0 ? `(${texNombre(v)})` : texNombre(v);
}

/** Polinomi en TeX, sense claus: «2x^{2} - 3x + 1». «x»: el nom de la variable. */
function texPolinomi(llista, x = 'x') {
  if (!llista.length) return '0';
  return llista.map((t, i) => {
    const c = Fraccio.de(t.c), a = c.abs();
    let s = i === 0 ? (c.signe() < 0 ? '-' : '') : (c.signe() < 0 ? ' - ' : ' + ');
    if (t.n === 0 || !a.igual(U)) s += texNombre(a);
    if (t.n >= 1) s += x;
    if (t.n >= 2) s += `^{${t.n}}`;
    return s;
  }).join('');
}

/** Polinomi en text pla, per a l'adreça: «2x^2-3x+1». */
function textPolinomi(llista) {
  if (!llista.length) return '0';
  return llista.map((t, i) => {
    const c = Fraccio.de(t.c), a = c.abs();
    let s = c.signe() < 0 ? '-' : (i === 0 ? '' : '+');
    const coef = a.esEnter() ? String(a.num) : `(${a.num}/${a.den})`;
    if (t.n === 0 || !a.igual(U)) s += coef;
    if (t.n >= 1) s += 'x';
    if (t.n >= 2) s += '^' + t.n;
    return s;
  }).join('');
}

/** Quants decimals té una fracció decimal (denominador 2ᵖ·5ᵠ), o null si no ho és. */
function decimalsDe(x) {
  let d = x.den, k = 0;
  while (d % 10 === 0) { d /= 10; k++; }
  let k2 = 0, k5 = 0;
  while (d % 2 === 0) { d /= 2; k2++; }
  while (d % 5 === 0) { d /= 5; k5++; }
  return d === 1 ? k + Math.max(k2, k5) : null;
}

/** Les xifres de |x| arrodonit a «dec» decimals, amb coma: «0{,}375». */
function xifres(x, dec) {
  const n = Math.round(Math.abs(x.num) * 10 ** dec / x.den);
  const s = String(n).padStart(dec + 1, '0');
  return dec ? `${s.slice(0, -dec)}{,}${s.slice(-dec)}` : s;
}

/**
 * Un nombre en decimal (TeX, amb coma): exacte si té com a màxim «maxim»
 * decimals; si no, arrodonit a «arrodonir» decimals (3), o a més si cal perquè no surti 0.
 * Torna {tex, aprox}: el TeX sense «≈» i si és aproximat.
 */
function formaDecimal(x, maxim = 4, arrodonir = 3) {
  x = Fraccio.de(x);
  const exactes = decimalsDe(x);
  const aprox = exactes === null || exactes > maxim;
  let dec = aprox ? arrodonir : exactes;
  if (aprox) while (Math.round(Math.abs(x.num) * 10 ** dec / x.den) === 0) dec++;
  return {tex: (x.signe() < 0 ? '-' : '') + xifres(x, dec), aprox};
}
/** Un nombre decimal exacte (TeX, amb coma), amb tots els decimals que tingui; null si no és decimal. */
const texDecimal = x => (decimalsDe(Fraccio.de(x)) === null ? null : formaDecimal(x, Infinity).tex);


/* ── EXPORTACIÓ ────────────────────────────────────────────────────── */

arrel.Mates = Object.freeze({
  Fraccio, Radical, ErrorLectura, mcd,
  llegeix, llegeixNombre, avalua, polinomi,
  termes, coeficientsDe, sumaPolinomis, producteDePolinomis, derivaTermes, integraTermes, valorTermes, arrelExacta, arrelsRacionals,
  texNombre, texEntreParentesis, texPolinomi, textPolinomi, formaDecimal, texDecimal,
});

})(globalThis);
