#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════
   proves/comprova.js — Proves automàtiques dels procediments
   ───────────────────────────────────────────────────────────────────
   Sense dependències. Des de l'arrel del repositori:
       node procediments/proves/comprova.js
   (o «node procediments/proves/comprova.js binomial»: només les seccions
   que tenen aquest text al nom).
   Comprova:
     1. mates.js i formules.js: fraccions, lectura, polinomis, escriptura;
     2. l'adreça de la recta tangent: lectura, errors i anada i tornada;
     3. els guions: claus vàlides i úniques; el cursor, les fusions i els
        canvis de nom només fan servir símbols que existeixen;
     4. la veritat: cada línia de cada pas és una igualtat certa. Es
        comprova amb aritmètica exacta (fraccions), per a una graella
        de dades.
   Acaba amb el codi 1 si alguna prova falla.
   ═══════════════════════════════════════════════════════════════════ */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const DIR = path.join(__dirname, '..');
for (const fitxer of ['mates.js', 'formules.js', 'dades.js', 'recta-tangent.js', 'extrems.js', 'creixement.js', 'optimitzacio.js', 'polinomi-condicions.js', 'bolzano.js', 'asimptotes.js', 'arbres.js', 'probabilitat-total.js', 'bayes.js', 'binomial.js', 'matrius.js', 'determinant.js', 'rang.js', 'sistema-sci.js', 'discussio.js', 'inversa.js', 'equacio-matricial.js', 'diagonalitzacio.js']) {
  vm.runInThisContext(fs.readFileSync(path.join(DIR, fitxer), 'utf8'), {filename: fitxer});
}
const {Mates: M, Formules: F, Dades: Dd, RectaTangent: RT, Extrems, Creixement, Optimitzacio, PolinomiCondicions, Bolzano, Asimptotes, ProbabilitatTotal, Bayes, Binomial, Matrius, Determinant, Rang, SistemaSCI, Discussio, Inversa, EquacioMatricial, Diagonalitzacio} = globalThis;
const {Fraccio} = M;
const fr = (a, b = 1) => new Fraccio(a, b);


/* ── PETIT ENTORN DE PROVES ────────────────────────────────────────── */

let total = 0, errors = 0;
const MAX_MISSATGES = 25;
const missatges = [];

function comprova(condicio, descripcio) {
  total++;
  if (condicio) return;
  errors++;
  if (missatges.length < MAX_MISSATGES) missatges.push(typeof descripcio === 'function' ? descripcio() : descripcio);
}

/** «node comprova.js binomial» només fa les seccions amb «binomial» al nom (per anar de pressa mentre es treballa). */
const NOMES = process.argv[2] || '';

function seccio(nom, fes) {
  if (!nom.includes(NOMES)) return;
  const [t0, e0, inici] = [total, errors, Date.now()];
  let detall = '';
  try {
    detall = fes() || '';
  } catch (e) {
    errors++;
    missatges.push(`${nom}: excepció inesperada: ${e.stack}`);
  }
  const estat = errors === e0 ? 'OK ' : 'ERR';
  console.log(`  ${estat} ${nom}: ${total - t0} comprovacions${detall ? ', ' + detall : ''}`
    + (errors > e0 ? `, ${errors - e0} errors` : '') + ` (${((Date.now() - inici) / 1000).toFixed(1)} s)`);
}

/** Cert si «fes» llança un ErrorLectura amb un missatge que compleix «patro». */
function errorDeLectura(fes, patro) {
  try { fes(); } catch (e) { return e.name === 'ErrorLectura' && patro.test(e.message); }
  return false;
}

const iguals = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const textCoefs = p => p && p.map(c => (c.esEnter() ? String(c.num) : c.num + '/' + c.den)).join(' ');

/** Generador pseudoaleatori amb llavor (mulberry32): les proves són sempre les mateixes. */
function aleatori(llavor) {
  return () => {
    llavor = (llavor + 0x6D2B79F5) | 0;
    let t = Math.imul(llavor ^ (llavor >>> 15), 1 | llavor);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}


/* ── DE LA PISSARRA A L'ARITMÈTICA ─────────────────────────────────── */

/**
 * Converteix una línia TeX de la pissarra en text pla que Mates.llegeix
 * entén: treu les claus, \mathbin, \mathrel, \left, \right i els espais;
 * \cdot → *, ^{…} → ^(…), ^{\prime} → ', \frac{a}{b} → ((a)/(b)),
 * \sqrt{a} → sqrt(a), \pm → ±, \text{o} → | (disjunció), \text{…} → «…».
 */
function textPla(tex) {
  let i = 0;
  const grup = () => {
    if (tex[i] !== '{') return tex[i++];           // argument d'un sol caràcter
    i++;
    const s = sequencia('}');
    if (tex[i] !== '}') throw new Error(`Falta una «}» a: ${tex}`);
    i++;
    return s;
  };
  function sequencia(fi) {
    let s = '';
    while (i < tex.length && tex[i] !== fi) {
      const c = tex[i];
      if (c === '{') { s += grup(); continue; }
      if (c === '}') throw new Error(`Sobra una «}» a: ${tex}`);
      if (c === '^') { i++; const g = grup(); s += /^'+$/.test(g) ? g : '^(' + g + ')'; continue; }
      if (c === '_') { i++; s += '_' + grup(); continue; }
      if (c === '\\') {
        const ordre = /^\\([A-Za-z]+|.)/.exec(tex.slice(i))[0];
        i += ordre.length;
        switch (ordre) {
          case '\\htmlData': grup(); break;          // l'atribut k=…; el contingut és el grup següent
          case '\\mathbin': case '\\mathrel': case '\\left': case '\\right': case '\\,': case '\\ ': case '\\quad': break;
          case '\\pm': s += '±'; break;
          case '\\qquad': break;
          case '\\mathbb': grup(); s += 'ℝ'; break;
          case '\\{': s += '{'; break;
          case '\\}': s += '}'; break;
          case '\\infty': s += '∞'; break;
          case '\\cup': s += '∪'; break;
          case '\\nearrow': s += '↗'; break;
          case '\\searrow': s += '↘'; break;
          case '\\nexists': s += '∄'; break;
          case '\\exists': s += '∃'; break;
          case '\\in': s += '∈'; break;
          case '\\approx': s += '≈'; break;
          case '\\lim': s += 'lim'; break;
          case '\\begin': case '\\end': grup(); break;          // els entorns (array): només en queda el contingut
          case '\\\\': s += ';'; break;                        // salt de línia d'un array
          case '\\xrightarrow': s += `→⟨${grup()}⟩`; break;      // branca d'un arbre, amb la probabilitat
          case '\\boxed': s += grup(); break;
          case '\\phantom': grup(); break;
          case '\\textstyle': break;
          case '\\overline': s += '¬' + grup(); break;
          case '\\mid': s += '∣'; break;
          case '\\%': s += '%'; break;
          case '\\cap': s += '∩'; break;
          case '\\sim': s += '∼'; break;
          case '\\cdots': s += '…'; break;
          case '\\lambda': s += 'λ'; break;
          case '\\Rightarrow': s += '⇒'; break;
          case '\\scriptsize': break;
          case '\\iff': s += '⇔'; break;
          case '\\neq': case '\\ne': s += '≠'; break;
          case '\\hline': break;
          case '\\ge': s += '≥'; break;
          case '\\le': s += '≤'; break;
          case '\\binom': { const a = grup(), b = grup(); s += `C(${a},${b})`; break; }   // nombre combinatori
          case '\\limits': break;
          case '\\to': s += '→'; break;
          case '\\underset': { const sota = grup(); s += `${grup()}⁽${sota}⁾`; break; }   // un nombre amb un signe a sota
          case '\\sqrt': {
            if (tex[i] === '[') {                     // \sqrt[n]{a} → a^(1/n)
              const fi = tex.indexOf(']', i);
              const n = tex.slice(i + 1, fi);
              i = fi + 1;
              s += `((${grup()})^(1/${n}))`;
            } else s += `sqrt(${grup()})`;
            break;
          }
          case '\\pi': s += '(pi)'; break;
          case '\\text': { const t = grup(); s += t.trim() === 'o' ? '|' : `«${t}»`; break; }
          case '\\cdot': s += '*'; break;
          case '\\prime': s += "'"; break;
          case '\\frac': case '\\dfrac': { const a = grup(), b = grup(); s += `((${a})/(${b}))`; break; }
          default: throw new Error(`Ordre TeX no prevista per la prova: ${ordre}`);
        }
        continue;
      }
      s += c;
      i++;
    }
    return s;
  }
  const s = sequencia(undefined);
  return s.replace(/\s+/g, '');
}

/** Claus d'una línia TeX, en ordre. */
const clausDe = tex => [...tex.matchAll(/\\htmlData\{k=([^},]*)[^}]*\}|\{\{([^|}]+)\|/g)].map(m => m[1] || m[2]);

/** Valor exacte (Fraccio) d'un arbre de Mates.llegeix. */
function exacte(n, entorn) {
  const ev = m => exacte(m, entorn);
  switch (n.tipus) {
    case 'nombre':   return n.valor;
    case 'variable': return entorn.variables[n.nom];
    case 'oposat':   return ev(n.a).oposada();
    case 'suma':     return ev(n.a).suma(ev(n.b));
    case 'resta':    return ev(n.a).resta(ev(n.b));
    case 'producte': return ev(n.a).producte(ev(n.b));
    case 'quocient': return ev(n.a).quocient(ev(n.b));
    case 'potencia': {
      const e = ev(n.exponent), b = ev(n.base);
      if (e.esEnter() && e.num >= 0) return b.potencia(e.num);
      if (e.num === 1 && e.den > 1 && b.signe() >= 0) {      // arrel n-èsima exacta
        const arrel = k => { const r = Math.round(Math.pow(k, 1 / e.den)); return r ** e.den === k ? r : null; };
        const [a, d] = [arrel(b.num), arrel(b.den)];
        if (a !== null && d !== null) return fr(a, d);
      }
      throw new Error('Potència no prevista per la prova');
    }
    case 'constant': {
      if (n.nom === 'pi' && entorn.variables.pi) return entorn.variables.pi;   // π com a indeterminada
      throw new Error(`Constant no prevista per la prova: ${n.nom}`);
    }
    case 'crida': {
      if (n.nom !== 'sqrt') return entorn.funcions[n.nom](ev(n.arg));
      const v = ev(n.arg);
      if (v.signe() < 0) throw new SenseValorReal();
      const r = M.arrelExacta(v);
      if (!r) throw new Error(`Arrel irracional: √${v.num}/${v.den}`);
      return r;
    }
  }
  throw new Error(`Node no previst per la prova: ${n.tipus}`);
}

/** L'arrel quadrada d'un nombre negatiu: no hi ha valor real. */
class SenseValorReal extends Error {}

const LECTURA = {variables: ['x', 'y'], funcions: ['f', "f'", "f''"]};

/**
 * Prepara un costat d'una igualtat: torna una funció entorn → Fraccio.
 * «(…)'» és la derivada de l'expressió de dins, calculada amb la fórmula
 * dels cinc punts, que és exacta per als polinomis de grau 4 o menys:
 *   g'(x) = [−g(x+2) + 8·g(x+1) − 8·g(x−1) + g(x−2)] / 12.
 */
function costat(text) {
  const derivada = /^\((.*)\)'$/.exec(text);
  const arbre = M.llegeix(derivada ? derivada[1] : text, LECTURA);
  if (!derivada) return entorn => exacte(arbre, entorn);
  return entorn => {
    const x = entorn.variables.x;
    const g = h => exacte(arbre, {variables: Object.assign({}, entorn.variables, {x: x.suma(h)}), funcions: entorn.funcions});
    return g(2).oposada().suma(g(1).producte(8)).resta(g(-1).producte(8)).suma(g(-2)).quocient(12);
  };
}

/** Polinomi exacte a partir dels coeficients [a0, a1, a2, …] (regla de Horner). */
const polinomiExacte = coefs => t => coefs.reduceRight((s, a) => s.producte(t).suma(a), fr(0));

/*
 * Punts on es comprova cada igualtat. Dos polinomis de grau 3 o menys que
 * coincideixen en 4 punts són iguals: quatre punts ja són una demostració.
 */
const PUNTS = [fr(-2), fr(0), fr(1), fr(5, 2)];


/* ── 1. MATES.JS I FORMULES.JS ─────────────────────────────────────── */

console.log('Proves dels procediments');

seccio('mates.js i formules.js', () => {
  // Fraccions
  comprova(fr(2, 4).igual(fr(1, 2)), '2/4 = 1/2');
  comprova(fr(1, -2).num === -1 && fr(1, -2).den === 2, 'el denominador queda positiu');
  comprova(Object.is(fr(0, -3).num, 0), 'el zero no té signe');
  comprova(fr(1, 2).suma(fr(1, 3)).igual(fr(5, 6)), '1/2 + 1/3 = 5/6');
  comprova(fr(-2, 3).potencia(3).igual(fr(-8, 27)), '(−2/3)³ = −8/27');
  comprova(fr(3, 4).quocient(fr(-3, 2)).igual(fr(-1, 2)), '(3/4) : (−3/2) = −1/2');
  comprova((() => { try { fr(1, 0); return false; } catch (e) { return e instanceof RangeError; } })(), '1/0 llança RangeError');

  // Lectura de polinomis
  const coefs = text => textCoefs(M.polinomi(M.llegeix(text)));
  for (const [text, esperat] of [
    ['2x^2-3x+1', '1 -3 2'], ['x(x-5)', '0 -5 1'], ['(x+1)^2', '1 2 1'], ['-x^2', '0 0 -1'],
    ['2x²−3x+1', '1 -3 2'], ['0,5x', '0 1/2'], ['x/2', '0 1/2'], ['3·x', '0 3'], ['2^3^2', '512'],
    ['-2^2', '-4'], ['(x-1)(x+1)', '-1 0 1'], ['x^0', '1'], ['x-x', ''], ['  x  ', '0 1'],
    ['(1/2)x^2-(3/4)x', '0 -3/4 1/2'], ['2(x+1)^3', '2 6 6 2'], ['x·x·x', '0 0 0 1'],
    ['1/x', null], ['ln(x)', null], ['x^(-1)', null], ['x^(1/2)', null], ['e*x', null], ['2^x', null], ['sqrt(4)', null],
  ]) comprova(coefs(text) === esperat, () => `polinomi(«${text}») hauria de ser «${esperat}» i és «${coefs(text)}»`);

  // Errors de lectura, amb el missatge per a l'alumne
  for (const [text, patro] of [
    ['2x^^2', /abans de «\^»/], ['lnx', /entre parèntesis/], ['x2', /Falta un signe/], ['(x+1', /Falta tancar/],
    ['', /No hi ha cap expressió/], ['y', /No conec «y»/], ['1234567890123', /massa llarg/], ['x)', /de més/],
    ['2x+', /massa aviat/], ['2x$', /No entenc el símbol/], ['.', /punt decimal/], ["g'(x)", /No entenc «g'»/],
  ]) comprova(errorDeLectura(() => M.llegeix(text), patro), `llegeix(«${text}») hauria de donar l'error ${patro}`);

  // Nombres
  comprova(M.llegeixNombre('-2').igual(-2), 'llegeixNombre(«-2»)');
  comprova(M.llegeixNombre('1/2').igual(fr(1, 2)), 'llegeixNombre(«1/2»)');
  comprova(M.llegeixNombre('0,5').igual(fr(1, 2)), 'llegeixNombre(«0,5»)');
  comprova(M.llegeixNombre('(3)').igual(3), 'llegeixNombre(«(3)»)');
  comprova(M.llegeixNombre('−3').igual(-3), 'llegeixNombre(«−3») amb el menys tipogràfic');
  comprova(errorDeLectura(() => M.llegeixNombre('x'), /només hi pot haver un nombre/), 'llegeixNombre(«x») és un error');
  comprova(errorDeLectura(() => M.llegeixNombre('1/0'), /No és un nombre racional/), 'llegeixNombre(«1/0») és un error');

  // Avaluació numèrica
  comprova(M.avalua(M.llegeix('2x^2-3x+1'), {variables: {x: 2}}) === 3, 'avalua 2x²−3x+1 en x = 2');
  comprova(M.avalua(M.llegeix("f'(2)+f(x)", {funcions: ['f', "f'"]}), {variables: {x: 1}, funcions: {f: t => t * t, "f'": t => 2 * t}}) === 5,
    "avalua f'(2) + f(x) amb funcions de l'usuari");

  // Escriptura
  comprova(M.texNombre(fr(-1, 2)) === '-\\frac{1}{2}', 'texNombre(−1/2)');
  comprova(M.texEntreParentesis(-2) === '(-2)' && M.texEntreParentesis(3) === '3', 'texEntreParentesis');
  comprova(M.texPolinomi(M.termes([1, -3, 2])) === '2x^{2} - 3x + 1', 'texPolinomi(2x²−3x+1)');
  comprova(M.textPolinomi(M.termes([fr(1, 2), 0, -1])) === '-x^2+(1/2)', 'textPolinomi(−x²+1/2)');
  comprova(M.textPolinomi([]) === '0' && M.texPolinomi([]) === '0', 'el polinomi zero s\'escriu «0»');

  // Anada i tornada: coeficients → text → coeficients; i les dues escriptures TeX diuen el mateix
  const valors = [-2, -1, 0, 1, 3, fr(1, 2), fr(-3, 4)];
  for (const a of valors) for (const b of valors) for (const c of valors) for (const d of valors) {
    const coeficients = [a, b, c, d].map(v => Fraccio.de(v));
    const esperat = textCoefs(coeficients.slice(0, coeficients.map(v => !v.esZero()).lastIndexOf(true) + 1));
    const t = M.termes(coeficients);
    comprova(textCoefs(M.polinomi(M.llegeix(M.textPolinomi(t)))) === esperat, () => `anada i tornada de «${M.textPolinomi(t)}»`);
    if (t.length) {
      comprova(textCoefs(M.polinomi(M.llegeix(textPla(F.polinomi('P', t))))) === esperat, () => `Formules.polinomi de «${M.textPolinomi(t)}»`);
      comprova(textCoefs(M.polinomi(M.llegeix(textPla(M.texPolinomi(t))))) === esperat, () => `Mates.texPolinomi de «${M.textPolinomi(t)}»`);
    }
  }

  // Claus i guió
  comprova((() => { try { F.clau('a-b', 'x'); return false; } catch (e) { return true; } })(), 'una clau amb «-» no és vàlida');
  comprova(F.marcat('q4: ⟦a:a⟧ + ⟦b:b⟧ = ⟦r:2⟧') === F.clau('q4a', 'a') + ' + ' + F.clau('q4b', 'b') + ' ' + F.rel('q4q', '=') + ' ' + F.clau('q4r', '2'),
    'marcat: prefix, claus i «=» amb clau');
  comprova(F.marcat('⟦x:3⟧ ⟦m:-⟧ ⟦y:1⟧ = 2') === F.clau('x', '3') + ' ' + F.op('m', '-') + ' ' + F.clau('y', '1') + ' = 2', 'marcat: sense prefix, operador amb clau');
  comprova(clausDe(F.marcat('q5: ⟦e:24a + 4b⟧ = ⟦r:0⟧')).join() === 'q5e,q5q,q5r', 'marcat: claus en ordre');
  for (const dolent of ['q1: a = b = c', 'q1: ⟦a:a = ⟦r:2⟧', 'q1: ⟦a-b:a⟧ = 0', 'q1: a ⟧ = 0']) {
    comprova((() => { try { F.marcat(dolent); return false; } catch (e) { return true; } })(), `marcat(«${dolent}») hauria de fallar`);
  }
  const g = F.guio(1);
  g.files[0] = 'x';
  g.afegeix('u');
  g.afegeix('dos');                                   // idèntic: no s'afegeix
  g.classes[0] = 'final';
  g.afegeix('tres');                                  // canvia la classe: s'afegeix
  comprova(g.passos.length === 2 && Object.isFrozen(g.passos[0]), 'el guió no repeteix passos idèntics');
});


/* ── 2. ADREÇA DE LA RECTA TANGENT ─────────────────────────────────── */

seccio('adreça de recta-tangent', () => {
  const lectura = p => RT.llegeixAdreca(p);
  const dades = (a3, a2, a1, a0, x0, m = 1, mode = 'tangent') => ({a3, a2, a1, a0, x0, m, mode});

  for (const [p, esperat] of [
    [{f: '2x^2-3x+1', x0: '2'}, dades(0, 2, -3, 1, 2)],
    [{f: 'x(x-5)', x0: '-1'}, dades(0, 1, -5, 0, -1)],
    [{f: 'x^3 - 3x + 1'}, dades(1, 0, -3, 1, 2)],
    [{f: '−x³+3x²−2', x0: '3'}, dades(-1, 3, 0, -2, 3)],
    [{f: '(x-1)^3', x0: '0'}, dades(1, -3, 3, -1, 0)],
    [{x0: '-5'}, dades(0, 2, -3, 1, -5)],
    [{}, dades(0, 2, -3, 1, 2)],
    [{f: 'x^2-4x+5', x0: '3', recta: 'normal'}, dades(0, 1, -4, 5, 3, 1, 'normal')],
    [{f: 'x^3-3x', m: '9'}, dades(1, 0, -3, 0, 2, 9, 'pendent')],
    [{f: 'x^2-4x+1', m: '-2', x0: '4'}, dades(0, 1, -4, 1, 4, -2, 'pendent')],
  ]) comprova(iguals(lectura(p).valors, esperat), () => `llegeixAdreca(${JSON.stringify(p)}) → ${JSON.stringify(lectura(p))}`);

  for (const [p, patro] of [
    [{recta: 'secant'}, /pot ser «tangent» o «normal»/], [{m: '1', recta: 'normal'}, /alhora/], [{m: '1/2'}, /pendent de l'adreça/],
    [{f: '3x+1', m: '1'}, /posa algun terme de grau 2 o 3/], [{f: 'x^3', m: '2'}, /irracionals/], [{m: '10'}, /entre −9 i 9/],
    [{f: 'ln(x)'}, /no és un polinomi/], [{f: 'x^4'}, /de grau 4/], [{f: 'x/2'}, /no són enters/],
    [{f: '10x'}, /entre −9 i 9/], [{f: '5'}, /ha de dependre de x/], [{f: '2x^^2'}, /^No entenc l'adreça: Hi falta un nombre/],
    [{f: '2x 2'}, /Falta un signe/], [{x0: '1/2'}, /no és un nombre enter/], [{x0: '7'}, /entre −5 i 5/],
    [{x0: 'x'}, /^No entenc l'adreça/], [{f: ''}, /No hi ha cap expressió/],
  ]) comprova(patro.test(lectura(p).error || ''), () => `llegeixAdreca(${JSON.stringify(p)}) hauria de donar l'error ${patro}: ${JSON.stringify(lectura(p))}`);

  // Anada i tornada per a totes les funcions vàlides (el punt va canviant)
  let n = 0;
  for (let a3 = -9; a3 <= 9; a3++) for (let a2 = -9; a2 <= 9; a2++) for (let a1 = -9; a1 <= 9; a1++) for (let a0 = -9; a0 <= 9; a0++) {
    if (!a3 && !a2 && !a1) continue;
    const v = dades(a3, a2, a1, a0, (n++ % 11) - 5);
    const p = RT.escriuAdreca(v);
    comprova(iguals(lectura(p).valors, v), () => `anada i tornada de ${JSON.stringify(p)}`);
  }
  for (const v of RT.exemples) comprova(RT.valida(v) === null, () => `l'exemple ${JSON.stringify(v)} no és vàlid`);
  for (const v of RT.exemples) comprova(iguals(lectura(RT.escriuAdreca(v)).valors, v), () => `anada i tornada de l'exemple ${JSON.stringify(v)}`);
  return `${n} funcions`;
});


/* ── 3 i 4. GUIONS I VERITAT DE LA RECTA TANGENT ───────────────────── */

/**
 * Dades on es proven els guions: una graella densa, els extrems i una mostra aleatòria,
 * per a la recta tangent; i també la recta normal i les tangents d'un pendent donat.
 */
function casosRectaTangent() {
  const casos = [];
  const afegeix = (a3, a2, a1, a0, x0, mode = 'tangent', m = 1) => {
    const v = {a3, a2, a1, a0, x0, m, mode};
    if ((a3 || a2 || a1) && RT.valida(v) === null) casos.push(v);
  };
  const densos = [-3, -1, 0, 1, 2];
  for (const a3 of densos) for (const a2 of densos) for (const a1 of densos) for (const a0 of densos) {
    for (let x0 = -5; x0 <= 5; x0++) afegeix(a3, a2, a1, a0, x0);
    for (const x0 of [-2, 0, 1, 3]) afegeix(a3, a2, a1, a0, x0, 'normal');
    for (const m of [-9, -3, 0, 1, 2, 9]) afegeix(a3, a2, a1, a0, 2, 'pendent', m);
  }
  const extrems = [-9, 0, 9];
  for (const a3 of extrems) for (const a2 of extrems) for (const a1 of extrems) for (const a0 of extrems)
    for (const x0 of [-5, 0, 5]) { afegeix(a3, a2, a1, a0, x0); afegeix(a3, a2, a1, a0, x0, 'normal'); afegeix(a3, a2, a1, a0, x0, 'pendent', x0); }
  const atzar = aleatori(2026);
  const enter = (min, max) => min + Math.floor(atzar() * (max - min + 1));
  for (let i = 0; i < 3000; i++) afegeix(enter(-9, 9), enter(-9, 9), enter(-9, 9), enter(-9, 9), enter(-5, 5));
  for (let i = 0; i < 1500; i++) afegeix(enter(-9, 9), enter(-9, 9), enter(-9, 9), enter(-9, 9), enter(-5, 5), 'normal');
  for (let i = 0; i < 3000; i++) afegeix(enter(-3, 3), enter(-9, 9), enter(-9, 9), enter(-9, 9), 0, 'pendent', enter(-9, 9));
  return casos;
}

/**
 * Estructura d'un guió: claus vàlides i úniques a cada pas; i, a cada
 * transició, el cursor, les fusions i els canvis de nom només fan
 * servir símbols del pas anterior (A) i del pas nou (B).
 */
function comprovaGuio(passos, nFiles, nom) {
  comprova(passos.length >= 2, () => `${nom}: massa pocs passos`);
  let A = null, anterior = null;
  passos.forEach((pas, i) => {
    const on = `${nom}, pas ${i + 1}`;
    comprova(Array.isArray(pas.files) && pas.files.length === nFiles && pas.classes.length === nFiles, () => `${on}: nombre de files`);
    comprova(typeof pas.text === 'string' && pas.text.trim() && pas.text.split('$').length % 2 === 1, () => `${on}: text buit o amb «$» desaparellats`);
    const llista = pas.files.flatMap(clausDe);
    const B = new Set(llista);
    comprova(B.size === llista.length, () => `${on}: claus repetides (${llista.filter((k, j) => llista.indexOf(k) !== j)})`);
    comprova(llista.every(k => /^[A-Za-z][A-Za-z0-9]*$/.test(k)), () => `${on}: clau no vàlida`);
    if (anterior) {
      comprova(anterior.files.join('\n') !== pas.files.join('\n') || anterior.classes.join() !== pas.classes.join(), () => `${on}: idèntic a l'anterior`);
    }

    const reanomena = Object.entries(pas.reanomena || {});
    const fusiona = Object.entries(pas.fusiona || {});
    const cursor = pas.cursor || {};
    if (!A) {
      comprova(!reanomena.length && !fusiona.length && !cursor.clic && !cursor.arrossega, () => `${on}: el primer pas no pot animar res`);
    } else {
      for (const [kb, ka] of reanomena) {
        comprova(B.has(kb) && !A.has(kb), () => `${on}: reanomena ${kb}←${ka}: «${kb}» ha de ser nova`);
        comprova(A.has(ka) && !B.has(ka), () => `${on}: reanomena ${kb}←${ka}: «${ka}» ha de ser vella`);
      }
      const fonts = fusiona.flatMap(([, kas]) => kas);
      comprova(new Set(fonts).size === fonts.length, () => `${on}: un símbol es fusiona dues vegades`);
      for (const [kb, kas] of fusiona) {
        comprova(B.has(kb), () => `${on}: fusiona ${kb}: no és al pas nou`);
        for (const ka of kas) {
          comprova(A.has(ka) && !B.has(ka), () => `${on}: fusiona ${kb}←${ka}: «${ka}» ha de ser al pas anterior i no al nou`);
          comprova(!reanomena.some(([, v]) => v === ka), () => `${on}: «${ka}» es fusiona i es reanomena alhora`);
        }
      }
      if (cursor.clic) comprova(A.has(cursor.clic), () => `${on}: el cursor clica «${cursor.clic}», que no hi és`);
      if (cursor.arrossega) comprova(A.has(cursor.arrossega), () => `${on}: el cursor arrossega «${cursor.arrossega}», que no hi és`);
      if (cursor.fins) comprova(B.has(cursor.fins), () => `${on}: el cursor arrossega fins a «${cursor.fins}», que no hi és`);
    }
    A = B;
    anterior = pas;
  });
}

/**
 * Les rectes que ha de trobar el guió, calculades aquí: la tangent en x₀; la normal
 * (pendent −1/f'(x₀), o vertical si f'(x₀) = 0); o les tangents de pendent m, als
 * punts on f'(x) = m. [{x0, m}] o [{x0, vertical: true}].
 */
function rectesModel(v) {
  const df = polinomiExacte([v.a1, 2 * v.a2, 3 * v.a3].map(c => fr(c)));
  const mode = v.mode || 'tangent', x0 = fr(v.x0);
  if (mode === 'tangent') return [{x0, m: df(x0)}];
  if (mode === 'normal') return df(x0).esZero() ? [{x0, vertical: true}] : [{x0, m: fr(-1).quocient(df(x0))}];
  const sols = arrelsDe(retallaP([fr(v.a1 - v.m), fr(2 * v.a2), fr(3 * v.a3)]));
  return sols.map(a => ({x0: a, m: fr(v.m)}));
}

/**
 * Veritat: cada línia de cada pas és certa.
 *   · Fila 0 (pot tenir diverses línies): l'equació d'una de les rectes del model, amb
 *     x₀ substituït pel seu punt: s'ha de complir en els punts de la recta i no en un punt
 *     de fora. La normal vertical és «x = x₀»; «No n'hi ha cap» només si no n'hi ha.
 *     Si la normal és vertical, la fórmula general −1/f'(x₀) no s'hi pot aplicar: una
 *     línia que divideix per f'(x₀) = 0 s'accepta (és la fórmula, no un càlcul).
 *   · Fila 1: una identitat (els dos costats valen el mateix per a tota x), o, en la
 *     variant del pendent, una equació amb les mateixes solucions que f'(x) = m.
 * f(a) i f'(a) valen el que valen de veritat.
 */
function comprovaVeritat(passos, v, nom) {
  const f = polinomiExacte([v.a0, v.a1, v.a2, v.a3].map(c => fr(c)));
  const df = polinomiExacte([v.a1, 2 * v.a2, 3 * v.a3].map(c => fr(c)));
  const funcions = {f, "f'": df};
  const rectes = rectesModel(v);
  const solucions = conjunt(rectes.map(r => r.x0));
  let linies = 0;

  /** Cert si la línia (text pla) és la recta r. */
  function esLaRecta(pla, r) {
    const text = pla.replace(/x_0/g, `(${r.x0.num}/${r.x0.den})`);
    const [esquerre, dret] = text.split('=').map(costat);
    const certa = (x, y) => esquerre({variables: {x, y}, funcions}).igual(dret({variables: {x, y}, funcions}));
    if (r.vertical) return /^x=/.test(pla) && !pla.includes('y') && certa(r.x0, fr(0)) && certa(r.x0, fr(7)) && !certa(r.x0.suma(1), fr(0));
    const recta = x => f(r.x0).suma(r.m.producte(x.resta(r.x0)));
    return PUNTS.every(x => certa(x, recta(x))) && !certa(fr(1), recta(fr(1)).suma(1));
  }
  const liniesDe = tex => (tex.trim().startsWith('\\begin{array}') ? liniesDArray(tex) : [textPla(tex)]);

  passos.forEach((pas, i) => pas.files.forEach((tex, fila) => {
    if (!tex) return;
    const on = `${nom}, pas ${i + 1}, fila ${fila + 1}`;
    for (const pla of liniesDe(tex)) {
      linies++;
      try {
        if (fila === 0) {
          if (pla === "«Non'hihacap.»") { comprova(!rectes.length, () => `${on}: diu que no n'hi ha cap, i n'hi ha`); continue; }
          if (pla.split('=').length !== 2) { comprova(false, () => `${on}: «${pla}» no és una igualtat`); continue; }
          let bona = false, inaplicable = false;
          for (const r of rectes) {
            if (esLaRecta(pla, r)) bona = true;
            // Normal vertical: la fórmula y − f(x₀) = −1/f'(x₀)·(x − x₀) no s'hi pot aplicar (divideix per f'(x₀) = 0).
            if (r.vertical && pla.includes('y') && pla.includes("f'")) {
              const text = pla.replace(/x_0/g, `(${r.x0.num}/${r.x0.den})`);
              try { text.split('=').map(costat).forEach(c => c({variables: {x: fr(1), y: fr(0)}, funcions})); } catch (e) {
                if (e instanceof RangeError) inaplicable = true; else throw e;
              }
            }
          }
          comprova(bona || inaplicable, () => `${on}: «${pla}» no és cap de les rectes (${rectes.map(r => r.vertical ? 'x = ' + r.x0.valor() : `pendent ${r.m.valor()} en ${r.x0.valor()}`)})`);
        } else {
          const costats = pla.split('=');
          const identitat = !pla.includes('|') && !pla.includes('±') && costats.length >= 2 && (() => {
            const parts = costats.map(costat);
            return PUNTS.every(x => parts.every(p => p({variables: {x, y: fr(0)}, funcions}).igual(parts[0]({variables: {x, y: fr(0)}, funcions}))));
          })();
          if (identitat) continue;
          comprova(v.mode === 'pendent' && !pla.includes('f') && solucionsDeFila(pla) === solucions,
            () => `${on}: «${pla}» no és certa (ni és una equació equivalent a f'(x) = m)`);
        }
      } catch (e) {
        comprova(false, () => `${on}: no es pot llegir «${pla || tex}»: ${e.message}`);
      }
    }
  }));

  // L'últim pas és la resposta: una recta acabada (y = … sense f, o x = …) per a cada recta del model.
  const final = passos[passos.length - 1];
  const ls = liniesDe(final.files[0]);
  comprova(final.classes[0] === 'final', () => `${nom}: la resposta no està destacada`);
  if (!rectes.length) comprova(ls.length === 1 && ls[0] === "«Non'hihacap.»", () => `${nom}: la resposta hauria de dir que no n'hi ha cap`);
  else {
    comprova(ls.length === rectes.length && ls.every(l => /^(y=[^fy]+|x=[^xyf]+)$/.test(l)), () => `${nom}: la resposta no són ${rectes.length} rectes acabades: ${ls}`);
    comprova(rectes.every(r => ls.some(l => { try { return esLaRecta(l, r); } catch (e) { return false; } })), () => `${nom}: a la resposta hi falta alguna recta`);
  }
  return linies;
}

/* La secció de proves dels guions de la recta tangent s'executa al final: fa servir eines de les seccions 5 i 10. */


/* ── 5. EQUACIONS I EXTREMS RELATIUS ───────────────────────────────── */

/** Clau d'un conjunt de nombres, per comparar conjunts: «-1,2,7/3». */
const conjunt = valors => [...new Set(valors.map(v => v.num + (v.den === 1 ? '' : '/' + v.den)))]
  .sort((a, b) => M.llegeixNombre(a).resta(M.llegeixNombre(b)).signe()).join(',');

/**
 * Solucions reals de «p = 0» (coeficients de grau 0 cap amunt, grau ≤ 2),
 * calculades aquí mateix, sense Formules ni Mates.arrelsRacionals.
 */
function arrelsDe(p) {
  if (!p.length) throw new Error('l\'equació és 0 = 0');
  if (p.length === 1) return [];
  if (p.length === 2) return [p[0].oposada().quocient(p[1])];
  if (p.length > 3) throw new Error('grau més gran que 2');
  const [c, b, a] = p;
  const d = b.producte(b).resta(a.producte(c).producte(4));
  if (d.signe() < 0) return [];
  const r = M.arrelExacta(d);
  if (!r) return null;                                  // irracionals
  const arrels = [b.oposada().resta(r).quocient(a.producte(2)), b.oposada().suma(r).quocient(a.producte(2))];
  return r.esZero() ? arrels.slice(0, 1) : arrels;
}

/**
 * Solucions d'una fila que és una equació en x: «x^2-2x=0», «x(x-2)=0»,
 * «x=0|x-2=0» (| = «o»), «x=±sqrt(4)», «x=((2±sqrt(16))/(2))».
 */
function solucionsDeFila(pla) {
  const valors = [];
  for (const part of pla.split('|')) {
    const costats = part.split('=');
    if (costats.length !== 2) throw new Error(`«${part}» no és una equació`);
    const [esquerre, dret] = costats;
    if (part.includes('±')) {
      if (esquerre !== 'x') throw new Error(`«${part}»: amb ± hi ha d'haver x a l'esquerra`);
      for (const s of ['+', '-']) {
        try {
          valors.push(exacte(M.llegeix(dret.replace('±', s), LECTURA), {variables: {}, funcions: {}}));
        } catch (e) {
          if (!(e instanceof SenseValorReal)) throw e;
        }
      }
    } else {
      const p = M.polinomi(M.llegeix(`(${esquerre})-(${dret})`));
      if (!p) throw new Error(`«${part}» no és polinòmica`);
      const arrels = arrelsDe(p);
      if (!arrels) throw new Error(`«${part}» té solucions irracionals`);
      valors.push(...arrels);
    }
  }
  return conjunt(valors);
}

seccio('equacions de formules.js', () => {
  // arrelsRacionals
  for (const [coefs, esperat, irracionals] of [
    [[-3, 0, 1], '', true], [[-4, 0, 1], '-2,2', false], [[0, -2, 1], '0,2', false], [[1, -2, 1], '1', false],
    [[1, 0, 1], '', false], [[3, 2], '-3/2', false], [[5], '', false], [[1, 4, 3], '-1,-1/3', false],
  ]) {
    const r = M.arrelsRacionals(M.termes(coefs));
    comprova(conjunt(r.arrels) === esperat && r.irracionals === irracionals, () => `arrelsRacionals(${coefs}) → ${JSON.stringify(r)}`);
  }
  // resolPolinomi: totes les equacions a·x² + b·x + c = 0 amb coeficients entre −6 i 6 i solucions racionals.
  let n = 0;
  for (let a = -6; a <= 6; a++) for (let b = -6; b <= 6; b++) for (let c = -6; c <= 6; c++) {
    if (!a && !b) continue;
    const t = M.termes([c, b, a]);
    if (M.arrelsRacionals(t).irracionals) continue;
    n++;
    const nom = `${M.textPolinomi(t)} = 0`;
    const g = F.guio(1);
    const sol = F.resolPolinomi(g, 0, 'e', t, 'Resol.');
    const esperat = conjunt(arrelsDe([c, b, a].map(v => fr(v)).slice(0, a ? 3 : 2)));
    comprova(conjunt(sol.map(s => s.valor)) === esperat, () => `${nom}: solucions ${conjunt(sol.map(s => s.valor))}, i són ${esperat}`);
    if (g.passos.length > 1) comprovaGuio(g.passos, 1, nom);          // «x = 0» ja està resolta: un sol pas
    const ultim = g.passos[g.passos.length - 1].files[0];
    for (const s of sol) comprova(clausDe(ultim).includes(s.clau), () => `${nom}: la clau ${s.clau} no és a l'última fila`);
    for (const [i, pas] of g.passos.entries()) {
      try {
        comprova(solucionsDeFila(textPla(pas.files[0])) === esperat, () => `${nom}, pas ${i + 1}: «${textPla(pas.files[0])}» no és equivalent`);
      } catch (e) {
        comprova(false, () => `${nom}, pas ${i + 1}: ${e.message}`);
      }
    }
  }
  return `${n} equacions`;
});

seccio('adreça de extrems', () => {
  const E = arrel => Extrems.llegeixAdreca(arrel);
  const dades = (a3, a2, a1, a0) => ({a3, a2, a1, a0});
  for (const [p, esperat] of [
    [{f: 'x^3-3x^2+1'}, dades(1, -3, 0, 1)], [{f: 'x^3-3x^2-9x+1'}, dades(1, -3, -9, 1)], [{}, dades(1, -3, 0, 1)],
    [{f: 'x(x-2)'}, dades(0, 1, -2, 0)], [{f: '3x+1'}, dades(0, 0, 3, 1)],
  ]) comprova(iguals(E(p).valors, esperat), () => `Extrems.llegeixAdreca(${JSON.stringify(p)}) → ${JSON.stringify(E(p))}`);
  for (const [p, patro] of [
    [{f: 'x^3-2x'}, /irracionals/], [{f: '5'}, /ha de dependre de x/], [{f: 'ln(x)'}, /no és un polinomi/], [{f: 'x^4'}, /de grau 4/], [{f: '2x^^2'}, /^No entenc l'adreça/],
  ]) comprova(patro.test(E(p).error || ''), () => `Extrems.llegeixAdreca(${JSON.stringify(p)}) hauria de donar ${patro}: ${JSON.stringify(E(p))}`);
  for (const v of Extrems.exemples) comprova(Extrems.valida(v) === null, () => `l'exemple ${JSON.stringify(v)} no és vàlid`);
  let n = 0;
  for (let a3 = -9; a3 <= 9; a3++) for (let a2 = -9; a2 <= 9; a2++) for (let a1 = -9; a1 <= 9; a1++) for (const a0 of [-7, 0, 4]) {
    const v = dades(a3, a2, a1, a0);
    if (Extrems.valida(v)) continue;
    n++;
    comprova(iguals(E(Extrems.escriuAdreca(v)).valors, v), () => `anada i tornada de ${JSON.stringify(Extrems.escriuAdreca(v))}`);
  }
  return `${n} funcions vàlides`;
});

/**
 * Veritat d'un guió d'extrems. Files 0 i 1: identitats (f, f', f'' amb el
 * seu valor de veritat), amb un «< 0» o «> 0» final que també es comprova;
 * a la fila 1, una equació en x ha de tenir exactament els punts crítics
 * com a solucions. Files 2 i 3: un candidat (un punt crític) o la
 * conclusió, que es comprova amb f, f' i f''.
 */
function comprovaExtrems(passos, v, nom) {
  const coefs = [v.a0, v.a1, v.a2, v.a3].map(c => fr(c));
  const f = polinomiExacte(coefs), d1 = polinomiExacte([v.a1, 2 * v.a2, 3 * v.a3].map(c => fr(c))), d2 = polinomiExacte([2 * v.a2, 6 * v.a3].map(c => fr(c)));
  const funcions = {f, "f'": d1, "f''": d2};
  const p1 = [v.a1, 2 * v.a2, 3 * v.a3].map(c => fr(c));
  while (p1.length && p1[p1.length - 1].esZero()) p1.pop();
  const critics = conjunt(arrelsDe(p1));
  const valor = text => exacte(M.llegeix(text, LECTURA), {variables: {}, funcions});
  let linies = 0;

  const identitat = (pla, on) => {
    const relacio = /^(.*)([<>])0$/.exec(pla);
    const parts = (relacio ? relacio[1] : pla).split('=').map(costat);
    const valors = PUNTS.map(x => parts.map(p => p({variables: {x, y: fr(0)}, funcions})));
    comprova(valors.every(vs => vs.every(w => w.igual(vs[0]))), () => `${on}: «${pla}» no és certa`);
    if (relacio) comprova(valors[0][0].signe() === (relacio[2] === '<' ? -1 : 1), () => `${on}: «${pla}»: el signe no és correcte`);
  };

  passos.forEach((pas, i) => pas.files.forEach((tex, fila) => {
    if (!tex) return;
    const on = `${nom}, pas ${i + 1}, fila ${fila + 1}`;
    let pla = '';
    try {
      pla = textPla(tex);
      linies++;
      if (fila <= 1) {
        if (pla.includes('f')) identitat(pla, on);
        else comprova(solucionsDeFila(pla) === critics, () => `${on}: «${pla}» no té per solucions els punts crítics (${critics})`);
        return;
      }
      let m;
      if ((m = /^x=(.+)$/.exec(pla))) {
        comprova(conjunt([valor(m[1])]) !== '' && critics.split(',').includes(conjunt([valor(m[1])])), () => `${on}: «${pla}» no és un punt crític`);
      } else if ((m = /^«(Màxim|Mínim)relatiu:»\((.+),(.+)\)$/.exec(pla))) {
        const a = valor(m[2]), b = valor(m[3]);
        comprova(d1(a).esZero() && f(a).igual(b) && d2(a).signe() === (m[1] === 'Màxim' ? -1 : 1), () => `${on}: «${pla}» és fals`);
      } else if ((m = /^«Nimàximnimínimen»x=(.+)$/.exec(pla))) {
        const a = valor(m[1]);
        comprova(d1(a).esZero() && d2(a).esZero() && v.a3 !== 0, () => `${on}: «${pla}» és fals`);   // f''' = 6·a3 ≠ 0: inflexió
      } else if (pla === '«Nohihapuntscrítics,ipertantnohihaextremsrelatius»') {
        comprova(critics === '', () => `${on}: diu que no hi ha punts crítics, i n'hi ha (${critics})`);
      } else {
        comprova(false, () => `${on}: fila no prevista: «${pla}»`);
      }
    } catch (e) {
      comprova(false, () => `${on}: no es pot llegir «${pla || tex}»: ${e.message}`);
    }
  }));

  // L'últim pas: una conclusió per a cada punt crític, i cap més.
  const final = passos[passos.length - 1].files.slice(2).filter(Boolean).map(textPla);
  const xs = final.map(pla => (/x=(.+)$/.exec(pla) || /\((.+),/.exec(pla) || [])[1]).filter(Boolean).map(valor);
  comprova(critics === '' ? final.length === 1 : conjunt(xs) === critics && final.length === xs.length && final.every(pla => pla.startsWith('«')),
    () => `${nom}: el resultat final no correspon als punts crítics (${critics}): ${final}`);
  return linies;
}

seccio('guions i veritat de extrems', () => {
  const casos = [];
  const afegeix = (a3, a2, a1, a0) => casos.push({a3, a2, a1, a0});
  for (let a3 = -3; a3 <= 3; a3++) for (let a2 = -3; a2 <= 3; a2++) for (let a1 = -3; a1 <= 3; a1++) for (let a0 = -3; a0 <= 3; a0++) afegeix(a3, a2, a1, a0);
  for (const a3 of [-9, 0, 9]) for (const a2 of [-9, 0, 9]) for (const a1 of [-9, 0, 9]) for (const a0 of [-9, 0, 9]) afegeix(a3, a2, a1, a0);
  const atzar = aleatori(2027);
  const enter = () => Math.floor(atzar() * 19) - 9;
  for (let i = 0; i < 6000; i++) afegeix(enter(), enter(), enter(), enter());

  let valids = 0, linies = 0, passos = 0, maxim = 0;
  for (const v of casos) {
    const nom = `f = ${Dd.textFuncio(v)}`;
    const error = Extrems.valida(v);
    const p1 = [v.a1, 2 * v.a2, 3 * v.a3].map(c => fr(c));
    while (p1.length && p1[p1.length - 1].esZero()) p1.pop();
    const irracional = p1.length > 0 && arrelsDe(p1) === null;
    comprova(Boolean(error) === (!p1.length || irracional), () => `${nom}: valida() diu «${error}»`);
    if (error) continue;
    valids++;
    let llista;
    try {
      llista = Extrems.passos(v);
    } catch (e) {
      comprova(false, () => `${nom}: passos() llança ${e.message}`);
      continue;
    }
    comprovaGuio(llista, Extrems.files, nom);
    linies += comprovaExtrems(llista, v, nom);
    passos += llista.length;
    maxim = Math.max(maxim, llista.length);
  }
  return `${valids} casos vàlids (de ${casos.length}), ${passos} passos (fins a ${maxim} per cas), ${linies} línies comprovades`;
});


/* ── 6. CREIXEMENT I DECREIXEMENT ──────────────────────────────────── */

/* Polinomis com a coeficients Fraccio de grau 0 cap amunt, calculats aquí mateix. */
const retallaP = p => { const q = p.slice(); while (q.length && q[q.length - 1].esZero()) q.pop(); return q; };
const sumaP = (a, b) => retallaP(Array.from({length: Math.max(a.length, b.length)}, (_, i) => (a[i] || fr(0)).suma(b[i] || fr(0))));
const producteP = (a, b) => retallaP(a.length && b.length
  ? Array.from({length: a.length + b.length - 1}, (_, k) => a.reduce((s, c, i) => (k - i >= 0 && k - i < b.length ? s.suma(c.producte(b[k - i])) : s), fr(0)))
  : []);
const derivadaP = a => retallaP(a.slice(1).map((c, i) => c.producte(i + 1)));

/** Files i cel·les d'una taula «\begin{array}{…} … \end{array}», ja en text pla. */
function cellesDeTaula(tex) {
  const m = /^\\begin\{array\}\{[^}]*\}(.*)\\end\{array\}$/.exec(tex.trim());
  if (!m) throw new Error('no és una taula');
  return m[1].split('\\\\').map(fila => fila.replace(/\\hline/g, '').replace(/^\[[^\]]*\]/, '').split('&').map(c => textPla(c.trim())));
}

/** Extrem d'un interval: «-∞», «+∞» o un nombre. */
const extrem = (text, valor) => (text === '-∞' || text === '+∞' ? text : conjunt([valor(text)]));

/**
 * Veritat d'un guió de creixement. Fila 0: el domini. Fila 1: identitats
 * (f, f'). Fila 2: equacions amb les solucions de Q = 0 (abans de la
 * derivada) o del numerador de f' = 0 (després), o un valor de prova
 * amb el seu signe. Fila 3: la taula: capçalera completa i cada cel·la,
 * si no és buida, correcta. Fila 4: la conclusió.
 */
function comprovaCreixement(passos, v, nom) {
  const P = retallaP([v.p0, v.p1, v.p2, v.p3].map(c => fr(c))), Q = retallaP([v.q0, v.q1, v.q2].map(c => fr(c)));
  const N = sumaP(producteP(derivadaP(P), Q), producteP(P, derivadaP(Q)).map(c => c.oposada()));
  const val = p => x => p.reduceRight((s, c) => s.producte(x).suma(c), fr(0));
  const f = x => val(P)(x).quocient(val(Q)(x));
  const df = x => val(N)(x).quocient(val(Q)(x).potencia(2));
  const funcions = {f, "f'": df};
  const arrelsQ = Q.length > 1 ? arrelsDe(Q) : [];
  const domini = conjunt(arrelsQ);
  const fora = x => arrelsQ.some(r => r.igual(x));
  const critics = arrelsDe(N).filter(r => !fora(r));
  const punts = arrelsQ.concat(critics).sort((a, b) => a.resta(b).signe());
  const nI = punts.length + 1;
  // Un punt de cada interval, per saber-ne el signe.
  const interior = j => (nI === 1 ? fr(0) : j === 0 ? punts[0].resta(1) : j === nI - 1 ? punts[nI - 2].suma(1) : punts[j - 1].suma(punts[j]).quocient(2));
  const signes = Array.from({length: nI}, (_, j) => val(N)(interior(j)).signe());
  const intervals = s => signes.map((x, j) => (x === s ? j : null)).filter(j => j !== null);
  const PUNTS_R = [-7, -5, -3, -1, 1, 3, 5, 7, 9, 11, -9, 13].map(k => fr(k, 4)).concat([fr(-7, 3), fr(5, 3)]).filter(x => !val(Q)(x).esZero());
  const valor = text => exacte(M.llegeix(text, LECTURA), {variables: {}, funcions});
  let linies = 0;

  const comprovaInterval = (text, j, on) => {
    const m = /^\((.+),(.+)\)$/.exec(text);
    const esperat = [j === 0 ? '-∞' : conjunt([punts[j - 1]]), j === nI - 1 ? '+∞' : conjunt([punts[j]])];
    comprova(m && extrem(m[1], valor) === esperat[0] && extrem(m[2], valor) === esperat[1], () => `${on}: interval «${text}» en lloc de (${esperat})`);
  };

  passos.forEach((pas, i) => pas.files.forEach((tex, fila) => {
    if (!tex) return;
    const on = `${nom}, pas ${i + 1}, fila ${fila + 1}`;
    linies++;
    try {
      if (fila === 0) {
        const m = /^«Dom»f=ℝ(?:-\{(.+)\})?$/.exec(textPla(tex));
        comprova(m && conjunt(m[1] ? m[1].split(',').map(valor) : []) === domini, () => `${on}: domini «${textPla(tex)}» en lloc de ℝ − {${domini}}`);
      } else if (fila === 1 || fila === 2) {
        const pla = textPla(tex);
        const relacio = /^(.*)([<>])0$/.exec(pla);
        if (relacio) {
          const parts = relacio[1].split('=').map(valor);
          comprova(parts.every(w => w.igual(parts[0])) && parts[0].signe() === (relacio[2] === '<' ? -1 : 1), () => `${on}: «${pla}» és fals`);
        } else if (pla.includes('f')) {
          const parts = pla.split('=').map(costat);
          comprova(PUNTS_R.length >= 10 && PUNTS_R.every(x => {
            const vs = parts.map(c => c({variables: {x, y: fr(0)}, funcions}));
            return vs.every(w => w.igual(vs[0]));
          }), () => `${on}: «${pla}» no és certa`);
        } else {
          const objectiu = conjunt(pas.files[1] ? arrelsDe(N) : arrelsQ);
          comprova(solucionsDeFila(pla) === objectiu, () => `${on}: «${pla}» no té per solucions ${objectiu}`);
        }
      } else if (fila === 3) {
        const [cap, derivada, funcio] = cellesDeTaula(tex);
        comprova(cap.length === 2 * nI && cap[0] === 'x' && derivada[0] === "f'(x)" && funcio[0] === 'f(x)', () => `${on}: forma de la taula`);
        for (let j = 0; j < nI; j++) {
          const esperatCap = nI === 1 ? '(-∞,+∞)' : j === 0 ? '-∞' : j === nI - 1 ? '+∞' : '';
          comprova(cap[1 + 2 * j] === esperatCap, () => `${on}: capçalera de l'interval ${j + 1}: «${cap[1 + 2 * j]}»`);
          const s = derivada[1 + 2 * j], fl = funcio[1 + 2 * j];
          comprova(s === '' || s === (signes[j] > 0 ? '+' : '-'), () => `${on}: signe de f' a l'interval ${j + 1}: «${s}»`);
          comprova(fl === '' || fl === (signes[j] > 0 ? '↗' : '↘'), () => `${on}: fletxa a l'interval ${j + 1}: «${fl}»`);
          if (j === nI - 1) break;
          const p = punts[j], c = cap[2 + 2 * j], dp = derivada[2 + 2 * j], fp = funcio[2 + 2 * j];
          comprova(conjunt([valor(c)]) === conjunt([p]), () => `${on}: punt ${j + 1}: «${c}»`);
          const esperatF = fora(p) ? '∄'
            : signes[j] > 0 && signes[j + 1] < 0 ? '«màx»' : signes[j] < 0 && signes[j + 1] > 0 ? '«mín»' : '';
          comprova(dp === '' || dp === (fora(p) ? '∄' : '0'), () => `${on}: f' al punt ${c}: «${dp}»`);
          comprova(fp === '' || fp === esperatF, () => `${on}: f al punt ${c}: «${fp}» en lloc de «${esperatF}»`);
          if (fora(p)) comprova(val(Q)(p).esZero(), () => `${on}: Q(${c}) no és 0`);
          else comprova(df(p).esZero(), () => `${on}: f'(${c}) no és 0`);
        }
      } else {
        const [[creix], [decreix]] = cellesDeTaula(tex);
        for (const [text, prefix, s] of [[creix, '«Creixent:»', 1], [decreix, '«Decreixent:»', -1]]) {
          comprova(text.startsWith(prefix), () => `${on}: «${text}»`);
          const resta = text.slice(prefix.length);
          const js = intervals(s);
          if (!js.length) { comprova(resta === '«capinterval»', () => `${on}: «${text}» hauria de ser «cap interval»`); continue; }
          const parts = resta.split('∪');
          comprova(parts.length === js.length, () => `${on}: «${text}» no té ${js.length} intervals`);
          parts.forEach((t, k) => comprovaInterval(t, js[k], on));
        }
      }
    } catch (e) {
      comprova(false, () => `${on}: no es pot llegir «${tex}»: ${e.message}`);
    }
  }));

  // Al final, la taula és completa i hi ha la conclusió.
  const final = passos[passos.length - 1];
  comprova(Boolean(final.files[4]), () => `${nom}: falta la conclusió`);
  const [, dFinal, fFinal] = cellesDeTaula(final.files[3]);
  const puntsSenseCanvi = punts.filter((p, j) => !fora(p) && signes[j] === signes[j + 1]).length;
  comprova(dFinal.every(c => c !== '') && fFinal.filter(c => c === '').length === puntsSenseCanvi,
    () => `${nom}: la taula final no és completa`);
  return linies;
}

seccio('adreça de creixement', () => {
  const C = p => Creixement.llegeixAdreca(p);
  const d = (p3, p2, p1, p0, q2, q1, q0) => ({p3, p2, p1, p0, q2, q1, q0});
  for (const [p, esperat] of [
    [{f: '(x^2+3)/(x-1)'}, d(0, 1, 0, 3, 0, 1, -1)], [{f: '-x/(2x+1)'}, d(0, 0, -1, 0, 0, 2, 1)], [{f: 'x^3-3x^2+1'}, d(1, -3, 0, 1, 0, 0, 1)], [{f: '1/x'}, d(0, 0, 0, 1, 0, 1, 0)],
    [{f: 'x/(x^2+1)'}, d(0, 0, 1, 0, 1, 0, 1)], [{f: '2x/(x+1)'}, d(0, 0, 2, 0, 0, 1, 1)], [{}, d(0, 1, 0, 3, 0, 1, -1)],
  ]) comprova(iguals(C(p).valors, esperat), () => `Creixement.llegeixAdreca(${JSON.stringify(p)}) → ${JSON.stringify(C(p))}`);
  for (const [p, patro] of [
    [{f: 'x^2/x^2-4'}, /ni un quocient/], [{f: '(x^2-1)/(x-1)'}, /factor comú/], [{f: '(x^2+1)/(2x^2+2)'}, /factor comú/],
    [{f: '1/(x^2-2)'}, /no són del domini són irracionals/], [{f: 'x^3/(x+1)'}, /grau 2 com a màxim/], [{f: '1/(x^3+1)'}, /grau massa alt/],
    [{f: 'x/2'}, /no són enters/], [{f: '5'}, /constant/], [{f: 'x^3-2x'}, /crítics són irracionals/], [{f: 'ln(x)'}, /ni un quocient/],
    [{f: '(x+1'}, /^No entenc l'adreça/],
  ]) comprova(patro.test(C(p).error || ''), () => `Creixement.llegeixAdreca(${JSON.stringify(p)}) hauria de donar ${patro}: ${JSON.stringify(C(p))}`);
  for (const v of Creixement.exemples) comprova(Creixement.valida(v) === null, () => `l'exemple ${JSON.stringify(v)} no és vàlid`);
});

seccio('guions i veritat de creixement', () => {
  const casos = [];
  const xs = [-2, -1, 0, 1, 2];
  for (const p2 of xs) for (const p1 of xs) for (const p0 of xs) for (const q2 of [-1, 0, 1]) for (const q1 of xs) for (const q0 of xs) {
    casos.push({p3: 0, p2, p1, p0, q2, q1, q0});
  }
  for (const p3 of [-2, -1, 1, 2]) for (const p2 of xs) for (const p1 of xs) for (const p0 of [-1, 0, 3]) casos.push({p3, p2, p1, p0, q2: 0, q1: 0, q0: 1});
  const atzar = aleatori(2028);
  const enter = () => Math.floor(atzar() * 19) - 9;
  for (let i = 0; i < 4000; i++) casos.push({p3: 0, p2: enter(), p1: enter(), p0: enter(), q2: enter(), q1: enter(), q0: enter()});

  let valids = 0, linies = 0, passos = 0, maxim = 0;
  for (const v of casos) {
    const error = Creixement.valida(v);
    if (error) continue;
    valids++;
    const nom = `f = ${Creixement.escriuAdreca(v).f}`;
    comprova(iguals(Creixement.llegeixAdreca(Creixement.escriuAdreca(v)).valors, v), () => `${nom}: l'anada i tornada per l'adreça no funciona`);
    let llista;
    try {
      llista = Creixement.passos(v);
    } catch (e) {
      comprova(false, () => `${nom}: passos() llança ${e.stack}`);
      continue;
    }
    comprovaGuio(llista, Creixement.files, nom);
    linies += comprovaCreixement(llista, v, nom);
    passos += llista.length;
    maxim = Math.max(maxim, llista.length);
  }
  return `${valids} casos vàlids (de ${casos.length}), ${passos} passos (fins a ${maxim} per cas), ${linies} línies comprovades`;
});


/* ── 7. OPTIMITZACIÓ ───────────────────────────────────────────────── */

/*
 * Model de cada problema, escrit aquí de manera independent del guió:
 *   v, w, f     variable principal, l'altra i el nom de la funció
 *   O(v, w, π)  la funció amb dues variables;   W(v, π) l'altra variable aïllada de la condició
 *   d1, d2      la primera i la segona derivada de O(v, W(v)) (es comproven numèricament)
 *   domini      el domini, com el text pla de la pissarra
 *   optim(π)    el valor òptim de v;   maxim   cert si és un màxim
 *   mostres     valors de v dins del domini, diferents de l'òptim
 *   pis         valors de π amb què es prova (π fa d'indeterminada)
 */
const OPT = (() => {
  const q = (a, b = 1) => fr(a, b);
  const sense = [q(1)];
  return {
    hort: {v: 'x', w: 'y', f: 'A', maxim: true, domini: '0<x<20', mostres: [q(1), q(5), q(13, 2), q(19)], pis: sense,
      O: (x, y) => x.producte(y), W: x => q(40).resta(x.producte(2)),
      d1: x => q(40).resta(x.producte(4)), d2: () => q(-4), optim: () => q(10)},
    capsa: {v: 'x', w: 'b', f: 'V', maxim: true, domini: '0<x<6', mostres: [q(1, 2), q(1), q(3), q(5)], pis: sense,
      O: (x, b) => b.producte(b).producte(x), W: x => q(12).resta(x.producte(2)),
      d1: x => x.producte(x).producte(12).resta(x.producte(96)).suma(144), d2: x => x.producte(24).resta(96), optim: () => q(2)},
    llauna: {v: 'r', w: 'h', f: 'V', maxim: true, domini: '0<r<sqrt(27)', mostres: [q(1), q(2), q(5, 2), q(4), q(5)], pis: [q(3), q(22, 7)],
      O: (r, h, pi) => pi.producte(r).producte(r).producte(h), W: r => q(27).resta(r.producte(r)).quocient(r.producte(2)),
      d1: (r, pi) => pi.producte(27).resta(pi.producte(3).producte(r).producte(r)).quocient(2), d2: (r, pi) => pi.producte(-3).producte(r), optim: () => q(3)},
    diposit: {v: 'x', w: 'h', f: 'C', maxim: false, domini: 'x>0', mostres: [q(1, 2), q(1), q(3), q(5)], pis: sense,
      O: (x, h) => x.producte(x).producte(20).suma(x.producte(h).producte(40)), W: x => q(8).quocient(x.producte(x)),
      d1: x => x.producte(40).resta(q(320).quocient(x.producte(x))), d2: x => q(40).suma(q(640).quocient(x.potencia(3))), optim: () => q(2)},
    pista: {v: 'r', w: 'x', f: 'A', maxim: true, domini: '0<r<((200)/((pi)))', mostres: [q(10), q(20), q(40), q(50)], pis: [q(3), q(22, 7)],
      O: (r, x) => r.producte(x).producte(2), W: (r, pi) => q(200).resta(pi.producte(r)),
      d1: (r, pi) => q(400).resta(pi.producte(4).producte(r)), d2: (r, pi) => pi.producte(-4), optim: pi => q(100).quocient(pi)},
    nombres: {v: 'y', w: 'x', f: 'P', maxim: true, domini: '0<y<12', mostres: [q(1), q(3), q(10), q(11)], pis: sense,
      O: (y, x) => x.producte(y).producte(y), W: y => q(12).resta(y),
      d1: y => y.producte(24).resta(y.producte(y).producte(3)), d2: y => q(24).resta(y.producte(6)), optim: () => q(8)},
  };
})();

/** Veritat d'un guió d'optimització, per a un valor de π. */
function comprovaOptimitzacio(passos, model, pi, nom) {
  const {v, w, f} = model;
  const lectura = {variables: [v, w], funcions: [f, f + "'", f + "''"]};
  const W = x => model.W(x, pi);
  const funcio = x => model.O(x, W(x), pi);
  const funcions = {[f]: funcio, [f + "'"]: x => model.d1(x, pi), [f + "''"]: x => model.d2(x, pi)};
  const valor = (text, x = fr(0), y = fr(0)) => exacte(M.llegeix(text, lectura), {variables: {[v]: x, [w]: y, pi}, funcions});
  const optim = model.optim(pi);
  const totsIguals = vs => vs.every(a => a.igual(vs[0]));
  let linies = 0;

  const FILA = Optimitzacio.FILA;
  passos.forEach((pas, i) => pas.files.forEach((tex, fila) => {
    if (!tex || fila === FILA.enunciat) return;                      // l'enunciat no és una igualtat
    const on = `${nom}, pas ${i + 1}, fila ${fila + 1}`;
    let pla = '';
    try {
      pla = textPla(tex);
      linies++;
      let m;
      if (fila === FILA.funcio) {
        if ((m = new RegExp(`^${f}=(.*)$`).exec(pla))) {                        // amb dues variables
          const parelles = model.mostres.map((x, k) => [x, fr(k + 2, 3)]);
          comprova(parelles.every(([x, y]) => valor(m[1], x, y).igual(model.O(x, y, pi))), () => `${on}: «${pla}» no és la funció`);
        } else {
          comprova(model.mostres.every(x => totsIguals(pla.split('=').map(part => valor(part, x)).concat([funcio(x)]))), () => `${on}: «${pla}» no és certa`);
        }
      } else if (fila === FILA.condicio) {
        if ((m = new RegExp(`^${w}=(.*)$`).exec(pla))) {
          comprova(model.mostres.every(x => valor(m[1], x).igual(W(x))), () => `${on}: «${pla}» no és la condició aïllada`);
        } else {
          const [esq, dre] = pla.split('=');
          const zero = (x, y) => valor(esq, x, y).resta(valor(dre, x, y));
          comprova(model.mostres.every(x => zero(x, W(x)).esZero() && !zero(x, W(x).suma(1)).esZero()), () => `${on}: «${pla}» no és equivalent a la condició`);
        }
      } else if (fila === FILA.domini) {
        comprova(pla === model.domini, () => `${on}: domini «${pla}» en lloc de «${model.domini}»`);
      } else if (fila === FILA.derivada) {
        comprova(model.mostres.every(x => totsIguals(pla.split('=').map(part => valor(part, x)))), () => `${on}: «${pla}» no és certa`);
      } else if (fila === FILA.calcul) {
        const relacio = /^(.*)([<>])0$/.exec(pla);
        if (relacio) {
          const parts = relacio[1].split('=').map(part => valor(part, optim));
          comprova(totsIguals(parts) && parts[0].signe() === (relacio[2] === '<' ? -1 : 1), () => `${on}: «${pla}» és fals`);
        } else if (pla.includes(f + '(') || pla.includes(f + "'") || pla.startsWith(w + '=')) {
          const parts = pla.split('=').map(part => (part === w ? W(optim) : valor(part, optim)));
          comprova(totsIguals(parts), () => `${on}: «${pla}» no és certa`);
        } else {
          const disjuncions = pla.split('|').map(part => part.split('='));
          const esExplicita = ([esq, dre]) => esq === v && !dre.replace(/sqrt|pi/g, '').includes(v);
          if (disjuncions.length > 1 || esExplicita(disjuncions[0])) {
            // Solucions escrites: cada part és «v = valor» (amb ± o no) o una equació polinòmica.
            const valors = disjuncions.flatMap(([esq, dre]) => {
              if (esExplicita([esq, dre])) return (dre.includes('±') ? [dre.replace('±', '+'), dre.replace('±', '-')] : [dre]).map(t => valor(t));
              const p = M.polinomi(M.llegeix(`(${esq})-(${dre})`, {variables: [v]}), v);
              if (!p) throw new Error(`«${esq}=${dre}» no és polinòmica`);
              return arrelsDe(p);
            });
            comprova(valors.some(a => a.igual(optim)) && valors.every(a => funcions[f + "'"](a).esZero()),
              () => `${on}: «${pla}»: les solucions no són les de ${f}'(${v}) = 0`);
          } else {
            const [esq, dre] = pla.split('=');
            const E = x => valor(esq, x).resta(valor(dre, x));
            comprova(E(optim).esZero() && model.mostres.every(x => !E(x).esZero() && !funcions[f + "'"](x).esZero()),
              () => `${on}: «${pla}» no és equivalent a ${f}'(${v}) = 0 dins del domini`);
          }
        }
      } else {
        for (const part of pla.split(',')) {
          const [nomPart, text] = part.split('=');
          const esperat = nomPart === v ? optim : nomPart === w ? W(optim) : nomPart === f ? funcio(optim) : null;
          comprova(esperat && valor(text).igual(esperat), () => `${on}: «${part}» no és la solució`);
        }
      }
    } catch (e) {
      comprova(false, () => `${on}: no es pot llegir «${pla || tex}»: ${e.message}`);
    }
  }));
  const final = textPla(passos[passos.length - 1].files[FILA.resposta]).split(',').map(t => t.split('=')[0]);
  // La lectura: al final, l'enunciat té frases marcades de les dues categories, i cap més marca.
  const enunciat = passos[passos.length - 1].files[FILA.enunciat];
  const marques = [...enunciat.matchAll(/\{\{[^|]*\|([^|]*)\|/g)].map(m => m[1]);
  comprova(enunciat.startsWith('§') && marques.includes('objectiu') && marques.includes('condicio') && marques.every(m => m === 'objectiu' || m === 'condicio'),
    () => `${nom}: l'enunciat no té les frases marcades (objectiu i condició)`);
  comprova(final.join() === [v, w, f].join(), () => `${nom}: la resposta final no té ${v}, ${w} i ${f}`);
  comprova(model.d2(optim, pi).signe() === (model.maxim ? -1 : 1), () => `${nom}: el model no té un ${model.maxim ? 'màxim' : 'mínim'}`);
  comprova(funcions[f + "'"](optim).esZero(), () => `${nom}: el model no té f' = 0 a l'òptim`);
  return linies;
}

seccio('optimització', () => {
  let linies = 0, passos = 0;
  for (const problema of Optimitzacio.problemes) {
    const model = OPT[problema.id];
    comprova(model && problema.v === model.v && problema.w === model.w && problema.f === model.f, () => `${problema.id}: no hi ha model, o no coincideix`);
    if (!model) continue;
    // El model es comprova a si mateix: les derivades, amb diferències finites.
    const h = fr(1, 16);
    for (const pi of model.pis) {
      const F0 = x => model.O(x, model.W(x, pi), pi), F1 = x => model.d1(x, pi), F2 = x => model.d2(x, pi);
      // Diferència central amb extrapolació de Richardson: error de l'ordre de h⁴.
      const central = (g, x, k) => g(x.suma(k)).resta(g(x.resta(k))).quocient(k.producte(2));
      const aprox = (g, x) => central(g, x, h.quocient(2)).producte(4).resta(central(g, x, h)).quocient(3).valor();
      const prop = (a, b) => Math.abs(a - b) < 1e-3 * Math.max(1, Math.abs(b));
      let fetes = 0;
      for (const x of model.mostres) {
        let parells;
        try {
          parells = [[aprox(F0, x), F1(x).valor()], [aprox(F1, x), F2(x).valor()]];
        } catch (e) {
          if (e instanceof RangeError) continue;     // fraccions massa grans: aquest punt no es pot fer exacte
          throw e;
        }
        fetes++;
        comprova(prop(...parells[0]), () => `${problema.id}: la primera derivada del model no quadra en ${x.valor()}`);
        comprova(prop(...parells[1]), () => `${problema.id}: la segona derivada del model no quadra en ${x.valor()}`);
      }
      comprova(fetes >= 2, () => `${problema.id}: el model no s'ha pogut comprovar`);
      const llista = Optimitzacio.passos({p: problema.id});
      comprovaGuio(llista, Optimitzacio.files, problema.id);
      linies += comprovaOptimitzacio(llista, model, pi, `${problema.id} (π = ${pi.num}/${pi.den})`);
      passos += llista.length;
    }
    comprova(iguals(Optimitzacio.llegeixAdreca(Optimitzacio.escriuAdreca({p: problema.id})).valors, {p: problema.id}), () => `${problema.id}: adreça`);
  }
  comprova(/no existeix/.test(Optimitzacio.llegeixAdreca({p: 'res'}).error || ''), 'problema inexistent a l\'adreça');
  return `${Optimitzacio.problemes.length} problemes, ${passos} passos, ${linies} línies comprovades`;
});


/* ── 8. POLINOMI DE GRAU 3 A PARTIR DE CONDICIONS ──────────────────── */

/*
 * Model de cada problema, escrit aquí de manera independent del guió:
 *   condicions  [[ordre, x, valor], …]: f(x), f'(x) o f''(x) val «valor», en l'ordre de l'enunciat
 *   frases      quantes condicions dona cada frase de dades (2: es marca «×2»)
 *   extrems     [[x, 'maxim' | 'minim' | 'extrem'], …]     inflexions [x, …]
 *   solucio     [a, b, c, d]
 */
const PC = {
  ordenades: {condicions: [[0, 0, 4], [1, 0, 0], [1, 2, 0], [0, 1, 2]], frases: [1, 2, 1], extrems: [[0, 'extrem'], [2, 'extrem']], inflexions: [], solucio: [1, -3, 0, 4]},
  maxim: {condicions: [[0, 0, 0], [1, 1, 0], [0, 1, 2], [1, -1, 0]], frases: [1, 2, 1], extrems: [[1, 'maxim']], inflexions: [], solucio: [-1, 0, 3, 0]},
  tangent: {condicions: [[1, 1, 2], [0, 1, 1], [1, 0, 0], [0, -1, -3]], frases: [2, 1, 1], extrems: [[0, 'extrem']], inflexions: [], solucio: [2, -2, 0, 1]},
  inflexio: {condicions: [[2, 0, 0], [0, 0, 0], [0, 1, -2], [0, 2, 2]], frases: [2, 2], extrems: [], inflexions: [0], solucio: [1, 0, -3, 0]},
  beneficis: {condicions: [[0, 0, 0], [1, 2, 0], [0, 2, 20], [2, 3, 0]], frases: [1, 2, 1], extrems: [[2, 'maxim']], inflexions: [3], solucio: [1, -9, 24, 0]},
  maxmin: {condicions: [[1, 1, 0], [0, 1, 3], [1, 3, 0], [0, 3, -1]], frases: [2, 2], extrems: [[1, 'maxim'], [3, 'minim']], inflexions: [], solucio: [1, -6, 9, -1]},
};

/* f, f' i f'' amb els paràmetres u = [a, b, c, d] (Fraccio). */
const DERIVADES_PC = [
  ([a, b, c, d]) => t => a.producte(t.potencia(3)).suma(b.producte(t.potencia(2))).suma(c.producte(t)).suma(d),
  ([a, b, c]) => t => a.producte(t.potencia(2)).producte(3).suma(b.producte(t).producte(2)).suma(c),
  ([a, b]) => t => a.producte(t).producte(6).suma(b.producte(2)),
];
const LECTURA_PC = {variables: ['a', 'b', 'c', 'd', 'x'], funcions: ['f', "f'", "f''"]};
const funcionsPC = u => ({f: DERIVADES_PC[0](u), "f'": DERIVADES_PC[1](u), "f''": DERIVADES_PC[2](u)});
/** Valor d'una expressió en text pla, amb els paràmetres u i la x. */
const valorPC = (text, u, x = fr(0)) => exacte(M.llegeix(text, LECTURA_PC), {variables: {a: u[0], b: u[1], c: u[2], d: u[3], x}, funcions: funcionsPC(u)});

const BASE_PC = [0, 1, 2, 3].map(i => [0, 1, 2, 3].map(j => fr(i === j ? 1 : 0)));
const ZERO_PC = [fr(0), fr(0), fr(0), fr(0)];
const PROVA_PC = [[fr(2), fr(-3), fr(5, 2), fr(7)], [fr(-1, 3), fr(4), fr(-2), fr(1, 5)]];

/**
 * Forma afí d'una funció dels paràmetres, E(u) = α·u + β, com a [α0, α1, α2, α3, β].
 * Llança un error si E no és afí (es comprova en dos punts més).
 */
function afiPC(E) {
  const b = E(ZERO_PC);
  const forma = BASE_PC.map(e => E(e).resta(b)).concat([b]);
  for (const u of PROVA_PC) {
    const previst = u.reduce((s, ui, i) => s.suma(forma[i].producte(ui)), b);
    if (!E(u).igual(previst)) throw new Error('no és una equació lineal en a, b, c i d');
  }
  return forma;
}
/** Forma afí (membre esquerre − membre dret) d'una igualtat «A = B» en text pla. */
const formaDe = pla => {
  const parts = pla.split('=');
  if (parts.length !== 2) throw new Error(`«${pla}» no és una igualtat simple`);
  return afiPC(u => valorPC(parts[0], u).resta(valorPC(parts[1], u)));
};
/** Cert si dues formes afins són proporcionals (amb un factor diferent de 0): la mateixa equació. */
function proporcionals(A, B) {
  const j = B.findIndex(v => !v.esZero());
  if (j < 0 || A[j].esZero()) return false;
  const l = A[j].quocient(B[j]);
  return A.every((v, i) => v.igual(B[i].producte(l)));
}
/** Solució única del sistema de formes afins (4 equacions), o null si no n'hi ha una de sola. */
function resolPC(formes) {
  const m = formes.map(f => f.slice(0, 4).concat([f[4].oposada()]));
  for (let col = 0; col < 4; col++) {
    const piv = m.findIndex((fila, i) => i >= col && !fila[col].esZero());
    if (piv < 0) return null;
    [m[col], m[piv]] = [m[piv], m[col]];
    for (let i = 0; i < m.length; i++) {
      if (i === col || m[i][col].esZero()) continue;
      const k = m[i][col].quocient(m[col][col]);
      m[i] = m[i].map((v, j) => v.resta(m[col][j].producte(k)));
    }
  }
  return m.map((fila, i) => fila[4].quocient(fila[i]));
}
const satisfa = (forma, u) => u.reduce((s, ui, i) => s.suma(forma[i].producte(ui)), forma[4]).esZero();
/** Línies d'un sistema «\begin{cases} … \\ … \end{cases}», en text pla. */
function liniesDeSistema(tex) {
  const m = /^\\begin\{cases\}(.*)\\end\{cases\}$/.exec(tex.trim());
  if (!m) throw new Error('no és un sistema');
  return m[1].split('\\\\').map(l => textPla(l.trim()));
}

/** Veritat d'un guió del polinomi de grau 3: cada fila, a cada pas. */
function comprovaPolinomi(passos, problema, model, nom) {
  const FILA = PolinomiCondicions.FILA;
  const conds = model.condicions.map(([o, x, v]) => afiPC(u => DERIVADES_PC[o](u)(fr(x)).resta(fr(v))));
  const sol = resolPC(conds);
  comprova(sol && sol.every((v, i) => v.igual(model.solucio[i])), () => `${nom}: el model no té la solució única ${model.solucio}`);
  if (!sol) return 0;
  comprova(['a', 'b', 'c', 'd'].every((v, i) => fr(problema.solucio[v]).igual(sol[i])), () => `${nom}: la solució de les dades no és la del model`);
  // Les dades del problema diuen el mateix que el model: condicions, frases, extrems i inflexions.
  const dades = problema.dades.flatMap(d => d.condicions);
  comprova(iguals(dades.map(c => [c.ordre, c.x, c.valor]), model.condicions), () => `${nom}: les condicions de les dades no són les del model`);
  comprova(iguals(problema.dades.map(d => d.condicions.length), model.frases), () => `${nom}: les frases de les dades no són les del model`);
  const extremsDades = dades.filter(c => c.extrem).map(c => [c.x, c.extrem]).filter(([x], k, l) => l.findIndex(e => e[0] === x) === k);
  comprova(iguals(extremsDades, model.extrems), () => `${nom}: els extrems de les dades (${extremsDades}) no són els del model`);
  comprova(iguals(dades.filter(c => c.inflexio).map(c => c.x), model.inflexions), () => `${nom}: les inflexions de les dades no són les del model`);
  const NOMS = ['f(x)', "f'(x)", "f''(x)"];
  const PARAMS = [sol].concat(PROVA_PC);
  let linies = 0, primerSistemaComplet = true;
  const comprovacions = new Set();          // abscisses comprovades amb f''

  passos.forEach((pas, i) => {
    const sistemaTex = pas.files[FILA.sistema];
    let nLinies = 0;
    pas.files.forEach((tex, fila) => {
      if (!tex || fila === FILA.enunciat) return;
      const on = `${nom}, pas ${i + 1}, fila ${fila + 1}`;
      let pla = '';
      try {
        linies++;
        if (fila === FILA.sistema) {
          const ls = liniesDeSistema(tex);
          nLinies = ls.length;
          const formes = ls.map(formaDe);
          if (ls.length < 4 || primerSistemaComplet) {
            comprova(formes.every((f, j) => proporcionals(f, conds[j])), () => `${on}: les equacions «${ls}» no són les de les dades, en ordre`);
            if (ls.length === 4) primerSistemaComplet = false;
          }
          if (ls.length === 4) {
            comprova(resolPC(formes) !== null && formes.every(f => satisfa(f, sol)), () => `${on}: el sistema «${ls}» no és equivalent`);
          }
          comprova(ls.length <= 4, () => `${on}: massa equacions`);
          return;
        }
        pla = textPla(tex);
        if (fila === FILA.calcul) {
          const relacio = /^(.*)([<>])0$/.exec(pla);
          const enTraduccio = (sistemaTex ? liniesDeSistema(sistemaTex).length : 0) < 4;
          if (relacio) {
            const parts = relacio[1].split('=');
            const valors = parts.map(t => valorPC(t, sol));
            comprova(valors.every(v => v.igual(valors[0])) && valors[0].signe() === (relacio[2] === '<' ? -1 : 1), () => `${on}: «${pla}» és fals`);
            const m = /^f''\((.+)\)$/.exec(parts[0]);
            if (m) comprovacions.add(conjunt([valorPC(m[1], sol)]));
          } else if (enTraduccio) {
            const k = sistemaTex ? liniesDeSistema(sistemaTex).length : 0;
            comprova(proporcionals(formaDe(pla), conds[k]), () => `${on}: «${pla}» no és la traducció de la dada ${k + 1}`);
          } else {
            const valors = pla.split('=').map(t => valorPC(t, sol));
            comprova(valors.length >= 2 && valors.every(v => v.igual(valors[0])), () => `${on}: «${pla}» no és certa per a la solució`);
          }
          return;
        }
        // Files de f, f', f'' i de la resposta: identitats en x.
        const [esq, dre] = pla.split('=');
        const ordre = fila === FILA.resposta ? 0 : fila - FILA.funcio;
        comprova(esq === NOMS[ordre] && pla.split('=').length === 2, () => `${on}: «${pla}» no és de la forma ${NOMS[ordre]} = …`);
        const params = /[abcd]/.test(dre) ? PARAMS : [sol];
        comprova(params.every(u => PUNTS.every(x => valorPC(esq, u, x).igual(valorPC(dre, u, x)))), () => `${on}: «${pla}» no és certa`);
      } catch (e) {
        comprova(false, () => `${on}: no es pot llegir «${pla || tex}»: ${e.message}`);
      }
    });
    if (i > 0) {
      const anterior = passos[i - 1].files[FILA.sistema];
      const n0 = anterior ? liniesDeSistema(anterior).length : 0;
      comprova(nLinies >= n0, () => `${nom}, pas ${i + 1}: el sistema ha perdut equacions`);
    }
  });

  // Al final: el sistema resolt, la resposta i l'enunciat marcat.
  const final = passos[passos.length - 1];
  const ls = liniesDeSistema(final.files[FILA.sistema]);
  const resolt = ls.map(l => /^([abcd])=(-?\d+)$/.exec(l));
  comprova(resolt.every(Boolean) && conjuntLletres(resolt) === 'abcd'
    && resolt.every(m => fr(Number(m[2])).igual(sol['abcd'.indexOf(m[1])])), () => `${nom}: el sistema final no és la solució: ${ls}`);
  comprova(final.classes[FILA.resposta] === 'final' && !final.files[FILA.calcul], () => `${nom}: la resposta final no està destacada`);
  comprova(!/[abcd]/.test(textPla(final.files[FILA.resposta]).split('=')[1]), () => `${nom}: la resposta final encara té lletres`);
  const enunciat = final.files[FILA.enunciat];
  model.frases.forEach((n, j) => {
    const m = new RegExp(`\\{\\{E${j + 1}1\\|([^|]*)\\|`).exec(enunciat);
    comprova(m && m[1] === (n === 2 ? 'doble' : 'condicio'), () => `${nom}: la frase ${j + 1} hauria d'estar marcada «${n === 2 ? 'doble' : 'condicio'}»`);
  });
  comprova(model.frases.reduce((s, n) => s + n, 0) === 4, () => `${nom}: les frases no donen quatre condicions`);
  // Els extrems i les inflexions de l'enunciat hi són de debò, i els extrems s'han comprovat amb f''.
  const d2 = DERIVADES_PC[2](sol);
  for (const [x, tipus] of model.extrems) {
    const s = d2(fr(x)).signe();
    comprova(DERIVADES_PC[1](sol)(fr(x)).esZero() && (tipus === 'maxim' ? s < 0 : tipus === 'minim' ? s > 0 : s !== 0), () => `${nom}: en x = ${x} no hi ha un ${tipus}`);
    comprova(comprovacions.has(conjunt([fr(x)])), () => `${nom}: falta la comprovació amb f'' en x = ${x}`);
  }
  for (const x of model.inflexions) comprova(d2(fr(x)).esZero() && !sol[0].esZero(), () => `${nom}: en x = ${x} no hi ha inflexió`);
  comprova(comprovacions.size === model.extrems.length, () => `${nom}: hi ha comprovacions amb f'' de més`);
  return linies;
}
const conjuntLletres = ms => ms.map(m => m[1]).sort().join('');

seccio('polinomi a partir de condicions', () => {
  let linies = 0, passos = 0;
  for (const problema of PolinomiCondicions.problemes) {
    const model = PC[problema.id];
    comprova(model, () => `${problema.id}: no hi ha model`);
    if (!model) continue;
    const llista = PolinomiCondicions.passos({p: problema.id});
    comprovaGuio(llista, PolinomiCondicions.files, problema.id);
    linies += comprovaPolinomi(llista, problema, model, problema.id);
    passos += llista.length;
    comprova(iguals(PolinomiCondicions.llegeixAdreca(PolinomiCondicions.escriuAdreca({p: problema.id})).valors, {p: problema.id}), () => `${problema.id}: adreça`);
  }
  comprova(Object.keys(PC).length === PolinomiCondicions.problemes.length, 'hi ha models de problemes que no existeixen');
  comprova(/no existeix/.test(PolinomiCondicions.llegeixAdreca({p: 'res'}).error || ''), 'problema inexistent a l\'adreça');
  comprova(iguals(PolinomiCondicions.llegeixAdreca({}).valors, {p: 'ordenades'}), 'problema per defecte');
  return `${PolinomiCondicions.problemes.length} problemes, ${passos} passos, ${linies} línies comprovades`;
});


/* ── 9. TEOREMA DE BOLZANO I BISECCIÓ ──────────────────────────────── */

/** Nombre escrit amb coma decimal («-0,375») → Fraccio, calculat aquí mateix. */
function llegeixDecimal(t) {
  const m = /^(-?)(\d+)(?:,(\d+))?$/.exec(t);
  if (!m) throw new Error(`«${t}» no és un nombre decimal`);
  const dec = m[3] || '';
  const v = fr(Number(m[2] + dec), 10 ** dec.length);
  return m[1] ? v.oposada() : v;
}
/** Cel·la de f(m): «v<0», «≈v>0» o «0». Torna {valor, aprox, decimals, signe}. */
function cellaValor(t) {
  if (t === '0') return {valor: fr(0), aprox: false, decimals: 0, signe: 0};
  const m = /^(≈?)(-?[\d,]+)([<>])0$/.exec(t);
  if (!m) throw new Error(`cel·la de valor «${t}» no prevista`);
  return {valor: llegeixDecimal(m[2]), aprox: m[1] === '≈', decimals: (m[2].split(',')[1] || '').length, signe: m[3] === '<' ? -1 : 1};
}
/** Interval amb signes «[l⁽s⁾;r⁽t⁾]». */
function cellaInterval(t) {
  const m = /^\[(-?[\d,]+)⁽([+-])⁾;(-?[\d,]+)⁽([+-])⁾\]$/.exec(t);
  if (!m) throw new Error(`interval «${t}» no previst`);
  return {l: llegeixDecimal(m[1]), sl: m[2] === '-' ? -1 : 1, r: llegeixDecimal(m[3]), sr: m[4] === '-' ? -1 : 1};
}

/**
 * Veritat d'un guió de Bolzano, amb un model calculat aquí: f, f(a), f(b), i la bisecció
 * feta de nou. Files: f(x) (identitat); la continuïtat (text amb l'interval); f(a) i f(b)
 * (cadenes d'igualtats, amb el signe final); la conclusió; la taula (cada interval amb els
 * signes certs de f, cada punt mitjà, cada valor exacte o ben arrodonit, i l'interval
 * següent, la meitat amb canvi de signe); la resposta.
 */
function comprovaBolzano(passos, v, nom) {
  const FILA = Bolzano.FILA;
  const coefs = [v.a0, v.a1, v.a2, v.a3].map(c => fr(c));
  const f = polinomiExacte(coefs);
  const funcions = {f};
  const [a, b] = [fr(v.a), fr(v.b)];
  const s = x => f(x).signe();
  const aplica = s(a) * s(b) < 0;
  // La bisecció del model.
  const model = [];                       // {l, r, m, fm}
  let arrel = null;
  if (aplica) {
    let [l, r] = [a, b];
    for (let k = 0; k < v.n; k++) {
      const m = l.suma(r).quocient(2);
      model.push({l, r, m, fm: f(m)});
      if (f(m).esZero()) { arrel = m; break; }
      if (s(m) !== s(l)) r = m; else l = m;
    }
    if (!arrel) model.push({l, r});
  }
  const valor = t => exacte(M.llegeix(t, LECTURA), {variables: {}, funcions});
  let linies = 0;
  passos.forEach((pas, i) => pas.files.forEach((tex, fila) => {
    if (!tex) return;
    const on = `${nom}, pas ${i + 1}, fila ${fila + 1}`;
    let pla = '';
    linies++;
    try {
      if (fila === FILA.continuitat) {
        comprova(tex.startsWith('§') && tex.includes(`$[${v.a}, ${v.b}]$`), () => `${on}: la continuïtat no parla de [${v.a}, ${v.b}]`);
        return;
      }
      if (fila === FILA.taula) {
        const [cap, ...files] = cellesDeTaula(tex);
        comprova(cap.join('|') === '«interval»|m|f(m)', () => `${on}: capçalera «${cap}»`);
        files.forEach((c, k) => {
          const mod = model[k];
          const iv = cellaInterval(c[0]);
          comprova(mod && iv.l.igual(mod.l) && iv.r.igual(mod.r) && iv.sl === s(iv.l) && iv.sr === s(iv.r) && iv.sl !== iv.sr,
            () => `${on}: l'interval ${k + 1} «${c[0]}» no és el de la bisecció o té els signes malament`);
          if (c[1]) comprova(mod.m && llegeixDecimal(c[1]).igual(mod.m), () => `${on}: el punt mitjà «${c[1]}» no és ${mod.m && mod.m.valor()}`);
          if (c[2]) {
            const cv = cellaValor(c[2]);
            const error = cv.valor.resta(mod.fm).abs();
            comprova(cv.signe === mod.fm.signe() && (cv.aprox ? !cv.valor.esZero() && error.producte(2 * 10 ** cv.decimals).resta(1).signe() <= 0 : error.esZero()),
              () => `${on}: «f(${c[1]})» val ${mod.fm.valor()}, no «${c[2]}»`);
          }
          if (k < files.length - 1) comprova(c[1] && c[2], () => `${on}: una fila de la taula sense acabar`);
        });
        return;
      }
      pla = textPla(tex);
      if (fila === FILA.bolzano) {
        comprova(aplica ? pla === `∃c∈(${v.a},${v.b}):f(c)=0` : pla === "«mateixsigne:Bolzanonos'hipotaplicar»", () => `${on}: conclusió «${pla}»`);
      } else if (fila === FILA.resposta) {
        const esperat = arrel ? `c=${pla.slice(2)}` : `c∈(${pla.slice(3, -1)})`;
        if (arrel) comprova(pla === esperat && llegeixDecimal(pla.slice(2)).igual(arrel), () => `${on}: «${pla}» no és l'arrel`);
        else {
          const [l, r] = pla.slice(3, -1).split(';').map(llegeixDecimal);
          const ultim = model[model.length - 1];
          comprova(pla === esperat && l.igual(ultim.l) && r.igual(ultim.r) && r.resta(l).igual(b.resta(a).quocient(2 ** v.n)), () => `${on}: resposta «${pla}»`);
        }
      } else if (fila === FILA.funcio) {
        const [esq, dre] = pla.split('=').map(costat);
        comprova(PUNTS.every(x => esq({variables: {x}, funcions}).igual(dre({variables: {x}, funcions}))), () => `${on}: «${pla}» no és certa`);
      } else {
        const x = fila === FILA.fa ? v.a : v.b;
        const relacio = /^(.*)([<>])0$/.exec(pla);
        const parts = (relacio ? relacio[1] : pla).split('=');
        comprova(parts[0] === `f(${x})` && parts.map(valor).every(w => w.igual(f(fr(x)))), () => `${on}: «${pla}» no és certa`);
        if (relacio) comprova(s(fr(x)) === (relacio[2] === '<' ? -1 : 1), () => `${on}: «${pla}»: signe`);
      }
    } catch (e) {
      comprova(false, () => `${on}: no es pot llegir «${pla || tex}»: ${e.message}`);
    }
  }));
  // Al final: la conclusió o la resposta destacada, i la taula completa.
  const final = passos[passos.length - 1];
  if (!aplica) {
    comprova(final.classes[FILA.bolzano] === 'final' && !final.files[FILA.taula], () => `${nom}: amb el mateix signe, el procediment ha d'acabar a la conclusió`);
  } else {
    comprova(final.classes[FILA.resposta] === 'final', () => `${nom}: la resposta no està destacada`);
    comprova(cellesDeTaula(final.files[FILA.taula]).length - 1 === model.length, () => `${nom}: la taula final no té ${model.length} files`);
  }
  return linies;
}

seccio('Bolzano i bisecció', () => {
  const B = p => Bolzano.llegeixAdreca(p);
  const d = (a3, a2, a1, a0, a, b, n) => ({a3, a2, a1, a0, a, b, n});
  for (const [p, esperat] of [
    [{}, d(1, 0, 1, -1, 0, 1, 3)], [{f: 'x^2-2', a: '1', b: '2', n: '4'}, d(0, 1, 0, -2, 1, 2, 4)], [{f: 'x^3+3x+2', a: '-2', b: '0'}, d(1, 0, 3, 2, -2, 0, 3)],
  ]) comprova(iguals(B(p).valors, esperat), () => `Bolzano.llegeixAdreca(${JSON.stringify(p)}) → ${JSON.stringify(B(p))}`);
  for (const [p, patro] of [
    [{a: '2', b: '1'}, /a < b/], [{n: '0'}, /bisseccions/], [{n: '6'}, /bisseccions/], [{a: '1/2'}, /no és un nombre enter/],
    [{f: 'x^2-1', a: '1', b: '2'}, /ja és una arrel/], [{b: '7'}, /entre −5 i 5/], [{f: 'x^4'}, /grau 4/], [{f: '(x'}, /^No entenc l'adreça/],
  ]) comprova(patro.test(B(p).error || ''), () => `Bolzano.llegeixAdreca(${JSON.stringify(p)}) hauria de donar ${patro}: ${JSON.stringify(B(p))}`);
  for (const v of Bolzano.exemples) comprova(Bolzano.valida(v) === null, () => `l'exemple ${JSON.stringify(v)} no és vàlid`);
  // L'arrodoniment: exacte fins a 4 decimals; si no, amb ≈ i prou decimals perquè no surti 0.
  for (const [x, tex, aprox] of [[fr(-3, 8), '-0{,}375', false], [fr(121, 64), '1{,}891', true], [fr(1, 4096), '0{,}0002', true], [fr(-5), '-5', false], [fr(1, 3), '0{,}333', true]]) {
    const r = Bolzano.decimal(x);
    comprova(r.tex === tex && r.aprox === aprox, () => `decimal(${x.num}/${x.den}) → ${JSON.stringify(r)}`);
  }
  const casos = Bolzano.exemples.slice();
  const atzar = aleatori(2029);
  const enter = (min, max) => min + Math.floor(atzar() * (max - min + 1));
  for (let i = 0; i < 3000; i++) casos.push(d(enter(-3, 3), enter(-5, 5), enter(-9, 9), enter(-9, 9), enter(-5, 4), 0, enter(1, 5)));
  for (const c of casos) if (!c.b) c.b = enter(c.a + 1, 5);
  let valids = 0, linies = 0, passos = 0, exactes = 0, sense = 0;
  for (const v of casos) {
    if (Bolzano.valida(v)) continue;
    valids++;
    const nom = `f = ${Dd.textFuncio(v)}, [${v.a}, ${v.b}], n = ${v.n}`;
    comprova(iguals(B(Bolzano.escriuAdreca(v)).valors, v), () => `${nom}: anada i tornada de l'adreça`);
    const llista = Bolzano.passos(v);
    comprovaGuio(llista, Bolzano.files, nom);
    linies += comprovaBolzano(llista, v, nom);
    passos += llista.length;
    if (llista[llista.length - 1].text.includes('arrel exacta')) exactes++;
    if (llista[llista.length - 1].files[Bolzano.FILA.taula] === '') sense++;
  }
  comprova(exactes > 0 && sense > 0, 'la mostra no té casos d\'arrel exacta o de mateix signe');
  return `${valids} casos vàlids, ${passos} passos, ${linies} línies comprovades (${exactes} amb arrel exacta, ${sense} sense Bolzano)`;
});


/* ── 10. ASÍMPTOTES D'UNA FUNCIÓ RACIONAL ──────────────────────────── */

/**
 * Una expressió en x (amb f) com a funció racional exacta [N, D]: coeficients
 * Fraccio de grau 0 cap amunt. f(x) és P/Q. Serveix per calcular límits.
 */
function racional(n, P, Q) {
  const r = m => racional(m, P, Q);
  const u = [fr(1)];
  switch (n.tipus) {
    case 'nombre': return [[n.valor], u];
    case 'variable': if (n.nom === 'x') return [[fr(0), fr(1)], u]; break;
    case 'oposat': { const [a, b] = r(n.a); return [a.map(c => c.oposada()), b]; }
    case 'suma': case 'resta': {
      const [a, b] = r(n.a), [c, d] = r(n.b);
      const cd = producteP(c, b).map(x => (n.tipus === 'resta' ? x.oposada() : x));
      return [sumaP(producteP(a, d), cd), producteP(b, d)];
    }
    case 'producte': { const [a, b] = r(n.a), [c, d] = r(n.b); return [producteP(a, c), producteP(b, d)]; }
    case 'quocient': { const [a, b] = r(n.a), [c, d] = r(n.b); return [producteP(a, d), producteP(b, c)]; }
    case 'potencia': {
      const e = exacte(n.exponent, {variables: {}, funcions: {}});
      if (!e.esEnter() || e.num < 0) break;
      let res = [u, u];
      const [a, b] = r(n.base);
      for (let i = 0; i < e.num; i++) res = [producteP(res[0], a), producteP(res[1], b)];
      return res;
    }
    case 'crida': if (n.nom === 'f' && n.arg.tipus === 'variable' && n.arg.nom === 'x') return [P, Q]; break;
  }
  throw new Error(`expressió no prevista en un límit: ${n.tipus}`);
}
const LECTURA_LIM = {variables: ['x'], funcions: ['f']};
/** Límit a +∞ (cap = 1) o −∞ (cap = −1) d'una funció racional [N, D]: «+∞», «-∞» o un nombre en text. */
function limitRacional([N, D], cap) {
  const [n, d] = [retallaP(N), retallaP(D)];
  if (!d.length) throw new Error('denominador 0');
  if (!n.length) return '0';
  const k = (n.length - 1) - (d.length - 1), c = n[n.length - 1].quocient(d[d.length - 1]);
  if (k < 0) return '0';
  if (k === 0) return conjunt([c]);
  return c.signe() * (cap < 0 && k % 2 ? -1 : 1) < 0 ? '-∞' : '+∞';
}
/** Valor d'un costat d'una línia de límit: «lim_x→+∞EXPR», «+∞», «-∞» o un nombre. */
function valorLimit(text, cap, P, Q) {
  const m = /^lim_x→([+-]|±)∞(.*)$/.exec(text);
  if (m) {
    const caps = m[1] === '±' ? [1, -1] : [m[1] === '+' ? 1 : -1];
    if (!caps.includes(cap)) throw new Error(`«${text}»: el límit no és cap a ${cap > 0 ? '+' : '-'}∞`);
    const vals = caps.map(c => limitRacional(racional(M.llegeix(m[2], LECTURA_LIM), P, Q), c));
    if (vals.some(v => v !== vals[0])) throw new Error(`«${text}»: el límit no és el mateix a +∞ i a −∞`);
    return vals[0];
  }
  if (text === '+∞' || text === '-∞') return text;
  return conjunt([exacte(M.llegeix(text, {variables: []}), {variables: {}, funcions: {}})]);
}
/** Línies d'un «\begin{array}{l} … \end{array}», en text pla. */
const liniesDArray = tex => {
  const m = /^\\begin\{array\}\{l\}(.*)\\end\{array\}$/.exec(tex.trim());
  if (!m) throw new Error('no és una llista de línies');
  return m[1].split('\\\\').map(l => textPla(l.replace(/^\[[^\]]*\]/, '').trim()));
};

/**
 * Veritat d'un guió d'asímptotes, amb un model calculat aquí: les arrels de Q (asímptotes
 * verticals), el signe de Q a cada costat d'una arrel (per la seva multiplicitat), els graus
 * (horitzontal) i la divisió P = Q·S + R (obliqua, si S és de grau 1).
 */
function comprovaAsimptotes(passos, v, nom) {
  const FILA = Asimptotes.FILA;
  const P = retallaP([v.p0, v.p1, v.p2, v.p3].map(c => fr(c))), Q = retallaP([v.q0, v.q1, v.q2].map(c => fr(c)));
  const val = p => x => p.reduceRight((s, c) => s.producte(x).suma(c), fr(0));
  const f = x => val(P)(x).quocient(val(Q)(x));
  const arrelsQ = arrelsDe(Q);
  // Signe de Q just a la dreta (s = 1) o a l'esquerra (s = −1) d'una arrel a: la primera derivada que no s'anul·la.
  const signeCostat = (a, s) => {
    let d = Q, m = 0;
    while (val(d)(a).esZero()) { d = derivadaP(d); m++; }
    return val(d)(a).signe() * (s < 0 && m % 2 ? -1 : 1);
  };
  // Divisió P = Q·S + R.
  const S = [], Rr = P.slice();
  for (let i = Rr.length - 1; i >= Q.length - 1; i--) {
    const q = Rr[i].quocient(Q[Q.length - 1]);
    S[i - (Q.length - 1)] = q;
    for (let j = 0; j < Q.length; j++) Rr[i - (Q.length - 1) + j] = Rr[i - (Q.length - 1) + j].resta(Q[j].producte(q));
  }
  const grauP = P.length - 1, grauQ = Q.length - 1;
  const AH = grauP < grauQ ? fr(0) : grauP === grauQ ? P[grauP].quocient(Q[grauQ]) : null;
  const AO = grauP === grauQ + 1 ? {m: S[1], n: S[0]} : null;
  const limF = cap => limitRacional([P, Q], cap);
  let linies = 0;

  passos.forEach((pas, i) => pas.files.forEach((tex, fila) => {
    if (!tex) return;
    const on = `${nom}, pas ${i + 1}, fila ${fila + 1}`;
    linies++;
    try {
      if (fila === FILA.funcio) {
        const [esq, dre] = textPla(tex).split('=').map(costat);
        const punts = [-7, -3, -1, 1, 3, 5, 9, 11, -9, 13].map(k => fr(k, 4)).filter(x => !val(Q)(x).esZero());
        comprova(punts.every(x => esq({variables: {x}, funcions: {f}}).igual(dre({variables: {x}, funcions: {f}}))), () => `${on}: «${textPla(tex)}» no és certa`);
      } else if (fila === FILA.calcul) {
        comprova(solucionsDeFila(textPla(tex)) === conjunt(arrelsQ), () => `${on}: «${textPla(tex)}» no té per solucions les arrels de Q`);
      } else if (fila === FILA.domini) {
        const m = /^«Dom»f=ℝ(?:-\{(.+)\})?$/.exec(textPla(tex));
        const valor = t => exacte(M.llegeix(t, {variables: []}), {variables: {}, funcions: {}});
        comprova(m && conjunt(m[1] ? m[1].split(',').map(valor) : []) === conjunt(arrelsQ), () => `${on}: domini «${textPla(tex)}»`);
      } else if (fila === FILA.laterals) {
        for (const l of liniesDArray(tex)) {
          const m = /^lim_x→(.+)\^\(([+-])\)f\(x\)=\(\((.+)\)\/\(0\^\(([+-])\)\)\)(?:=([+-])∞)?$/.exec(l);
          if (!m) throw new Error(`línia «${l}» no prevista`);
          const valor = t => exacte(M.llegeix(t, {variables: []}), {variables: {}, funcions: {}});
          const a = valor(m[1]), s = m[2] === '-' ? -1 : 1, k = valor(m[3]), sq = m[4] === '-' ? -1 : 1;
          comprova(arrelsQ.some(r => r.igual(a)) && val(P)(a).igual(k) && !k.esZero() && signeCostat(a, s) === sq
            && (!m[5] || (m[5] === '-' ? -1 : 1) === k.signe() * sq), () => `${on}: «${l}» és fals`);
        }
      } else if (fila === FILA.infinit || fila === FILA.obliqua) {
        for (const l of liniesDArray(tex)) {
          const [esq, dre] = l.split('=');
          let m;
          if ((m = /^lim_x→([+-])∞f\(x\)$/.exec(esq))) {
            const cap = m[1] === '+' ? 1 : -1;
            comprova(fila === FILA.infinit && valorLimit(dre, cap, P, Q) === limF(cap), () => `${on}: «${l}» és fals (el límit és ${limF(cap)})`);
          } else if (esq === 'm' || esq === 'n') {
            const model = AO && conjunt([AO[esq]]);
            comprova(fila === FILA.obliqua && AO && [1, -1].every(cap => valorLimit(dre, cap, P, Q) === model), () => `${on}: «${l}»: ${esq} no és ${model}`);
          } else if (esq === 'lim_x→+∞((f(x))/(x))') {
            const lim = limitRacional([P, producteP(Q, [fr(0), fr(1)])], 1);
            comprova(fila === FILA.obliqua && !AO && !AH && valorLimit(dre, 1, P, Q) === lim && lim.endsWith('∞'), () => `${on}: «${l}» és fals`);
          } else {
            throw new Error(`línia «${l}» no prevista`);
          }
        }
      } else if (fila === FILA.resum) {
        const valor = t => exacte(M.llegeix(t, {variables: []}), {variables: {}, funcions: {}});
        for (const l of liniesDArray(tex)) {
          let m;
          if ((m = /^«AV:»x=(.+)$/.exec(l))) comprova(arrelsQ.some(r => r.igual(valor(m[1]))), () => `${on}: «${l}» no és una asímptota vertical`);
          else if (l === "«AV:non'hiha»") comprova(!arrelsQ.length, () => `${on}: diu que no hi ha asímptotes verticals`);
          else if ((m = /^«AH:»y=(.+)$/.exec(l))) comprova(AH && valor(m[1]).igual(AH), () => `${on}: «${l}» és fals`);
          else if (l === "«AH:non'hiha»") comprova(!AH, () => `${on}: sí que hi ha asímptota horitzontal`);
          else if ((m = /^«AO:»y=(.+)$/.exec(l))) {
            const recta = M.polinomi(M.llegeix(m[1]));
            comprova(AO && recta && conjunt([recta[1] || fr(0)]) === conjunt([AO.m]) && conjunt([recta[0] || fr(0)]) === conjunt([AO.n]), () => `${on}: «${l}» és fals`);
          } else if (l === "«AO:non'hiha»") comprova(!AO, () => `${on}: sí que hi ha asímptota obliqua`);
          else throw new Error(`línia «${l}» no prevista`);
        }
      }
    } catch (e) {
      comprova(false, () => `${on}: no es pot llegir «${tex.slice(0, 120)}»: ${e.message}`);
    }
  }));
  // Al final: el resum, complet i destacat; i, si el límit a l'infinit és infinit, la fila destacada.
  const final = passos[passos.length - 1];
  const resum = liniesDArray(final.files[FILA.resum]);
  comprova(final.classes[FILA.resum] === 'final', () => `${nom}: el resum no està destacat`);
  comprova(resum.filter(l => l.startsWith('«AV:')).length === Math.max(1, arrelsQ.length) && resum.some(l => l.startsWith('«AH:')) && resum.some(l => l.startsWith('«AO:')),
    () => `${nom}: al resum hi falten asímptotes: ${resum}`);
  comprova((final.classes[FILA.infinit] === 'destacat') === !AH, () => `${nom}: la fila dels límits a l'infinit s'ha de destacar si i només si són infinits`);
  comprova(liniesDArray(final.files[FILA.laterals] || '\\begin{array}{l}\\end{array}').length === 2 * arrelsQ.length || (!arrelsQ.length && !final.files[FILA.laterals]),
    () => `${nom}: falten límits laterals`);
  return linies;
}

seccio('asímptotes', () => {
  const A = p => Asimptotes.llegeixAdreca(p);
  const d = (p3, p2, p1, p0, q2, q1, q0) => ({p3, p2, p1, p0, q2, q1, q0});
  for (const [p, esperat] of [
    [{}, d(0, 1, 0, 3, 0, 1, -1)], [{f: '3x/(x^2-4)'}, d(0, 0, 3, 0, 1, 0, -4)], [{f: 'x^3/(x+1)'}, d(1, 0, 0, 0, 0, 1, 1)],
  ]) comprova(iguals(A(p).valors, esperat), () => `Asimptotes.llegeixAdreca(${JSON.stringify(p)}) → ${JSON.stringify(A(p))}`);
  for (const [p, patro] of [
    [{f: 'x^2+1'}, /ha de dependre de x/], [{f: '(x^2-1)/(x-1)'}, /factor comú/], [{f: '(x^3+x)/(x^2+1)'}, /factor comú/],
    [{f: '1/(x^2-2)'}, /irracionals/], [{f: 'x^4/(x+1)'}, /grau massa alt/], [{f: '(x'}, /^No entenc l'adreça/],
  ]) comprova(patro.test(A(p).error || ''), () => `Asimptotes.llegeixAdreca(${JSON.stringify(p)}) hauria de donar ${patro}: ${JSON.stringify(A(p))}`);
  for (const v of Asimptotes.exemples) comprova(Asimptotes.valida(v) === null, () => `l'exemple ${JSON.stringify(v)} no és vàlid`);
  const casos = Asimptotes.exemples.slice();
  const atzar = aleatori(2030);
  const enter = (min, max) => min + Math.floor(atzar() * (max - min + 1));
  for (let i = 0; i < 4000; i++) casos.push(d(enter(-2, 2), enter(-4, 4), enter(-9, 9), enter(-9, 9), enter(-2, 2), enter(-5, 5), enter(-9, 9)));
  let valids = 0, linies = 0, passos = 0;
  const tipus = new Set();
  for (const v of casos) {
    if (Asimptotes.valida(v)) continue;
    valids++;
    const nom = `f = ${Asimptotes.escriuAdreca(v).f}`;
    comprova(iguals(A(Asimptotes.escriuAdreca(v)).valors, v), () => `${nom}: anada i tornada de l'adreça`);
    let llista;
    try { llista = Asimptotes.passos(v); } catch (e) { comprova(false, () => `${nom}: passos() llança ${e.stack}`); continue; }
    comprovaGuio(llista, Asimptotes.files, nom);
    linies += comprovaAsimptotes(llista, v, nom);
    passos += llista.length;
    const res = liniesDArray(llista[llista.length - 1].files[Asimptotes.FILA.resum]).join();
    tipus.add((res.includes('«AH:»') ? 'H' : '') + (res.includes('«AO:»') ? 'O' : '') + (res.includes("«AV:non'hiha»") ? '' : 'V'));
  }
  comprova(['HV', 'OV', 'V', 'H', 'O'].every(t => tipus.has(t)), () => `la mostra no té tots els tipus de casos: ${[...tipus]}`);
  return `${valids} casos vàlids, ${passos} passos, ${linies} línies comprovades (tipus: ${[...tipus].sort().join(' ')})`;
});


/* ── 11. ARBRE DE PROBABILITATS I PROBABILITAT TOTAL ──────────────── */

/*
 * Model de cada problema, escrit aquí de manera independent: les probabilitats del primer
 * nivell, les condicionades del segon (com a text pla, «¬D» és el contrari de D), els camins
 * de l'esdeveniment que es busca i la probabilitat total.
 */
const PT = {
  peces: {primer: {F: '7/10', A: '3/10'}, fills: {F: {D: '1/10', '¬D': '9/10'}, A: {D: '4/100', '¬D': '96/100'}}, camins: [['F', 'D'], ['A', 'D']], total: '82/1000', dades: 3},
  dau: {primer: {R: '1/2', I: '1/2'}, fills: {R: {C: '8/10', '¬C': '2/10'}, I: {C: '3/10', '¬C': '7/10'}}, camins: [['R', 'C'], ['I', 'C']], total: '55/100', dades: 3},
  prova: {primer: {M: '1/10', '¬M': '9/10'}, fills: {M: {T: '9/10', '¬T': '1/10'}, '¬M': {T: '5/100', '¬T': '95/100'}}, camins: [['M', 'T'], ['¬M', 'T']], total: '135/1000', dades: 3},
  correu: {primer: {B: '3/10', '¬B': '7/10'}, fills: {B: {C: '9/10', '¬C': '1/10'}, '¬B': {C: '5/100', '¬C': '95/100'}}, camins: [['B', 'C'], ['¬B', 'C']], total: '305/1000', dades: 3},
  maquines: {primer: {A: '5/10', B: '3/10', C: '2/10'}, fills: {A: {D: '2/100', '¬D': '98/100'}, B: {D: '3/100', '¬D': '97/100'}, C: {D: '5/100', '¬D': '95/100'}},
    camins: [['A', 'D'], ['B', 'D'], ['C', 'D']], total: '29/1000', dades: 5},
  bossa: {primer: {V_1: '3/5', B_1: '2/5'}, fills: {V_1: {V_2: '2/4', B_2: '2/4'}, B_1: {V_2: '3/4', B_2: '1/4'}}, camins: [['V_1', 'V_2'], ['B_1', 'B_2']], total: '2/5', dades: 1},
};
const fraccioPT = t => { const [a, b] = t.split('/').map(Number); return fr(a, b || 1); };
/** Un valor escrit a la pissarra (text pla): «70%», «0,7», «((3)/(5))». */
const valorPT = t => (t.endsWith('%') ? valorPT(t.slice(0, -1)).quocient(100) : exacte(M.llegeix(t, {variables: []}), {variables: {}, funcions: {}}));
/** P(X) o P(Y∣X) del model, o null. */
function probabilitatPT(model, text) {
  const m = /^P\(([^∣∩]+)(?:∣(.+))?\)$/.exec(text);
  if (!m) return null;
  if (!m[2]) return model.primer[m[1]] ? fraccioPT(model.primer[m[1]]) : null;
  return model.fills[m[2]] && model.fills[m[2]][m[1]] ? fraccioPT(model.fills[m[2]][m[1]]) : null;
}

/**
 * L'arbre (TeX) d'un problema del model: les branques en ordre, amb el seu esdeveniment;
 * cada probabilitat escrita, la del model; i els productes, només als camins indicats.
 */
function comprovaArbrePT(tex, model, camins, on) {
  const primers = Object.keys(model.primer);
  const pla = textPla(tex);
  const trossos = pla.split('→⟨').slice(1);
  // L'ordre: per a cada branca del primer nivell, ella i les dues que en surten.
  const esperat = primers.flatMap(a => [[a, null]].concat(Object.keys(model.fills[a]).map(b => [a, b])));
  comprova(trossos.length === esperat.length, () => `${on}: l'arbre té ${trossos.length} branques, i n'hi ha d'haver ${esperat.length}`);
  trossos.forEach((tros, k) => {
    const [a, b] = esperat[k] || [];
    const [etiqueta, resta] = tros.split('⟩');
    const event = b === null ? a : b;
    comprova(resta.startsWith(event), () => `${on}: la branca ${k + 1} hauria de ser ${event}: «${resta}»`);
    const valor = b === null ? fraccioPT(model.primer[a]) : fraccioPT(model.fills[a][b]);
    if (etiqueta) comprova(valorPT(etiqueta).igual(valor), () => `${on}: la branca ${event} porta «${etiqueta}» i val ${valor.valor()}`);
    const producte = /^[^;{.]*?([^;{.]*\*[^;{.]*=[^;{.\[]*)/.exec(resta.slice(event.length));
    if (producte) {
      const [esq, dre] = producte[1].split('=');
      const [x, y] = esq.split('*').map(valorPT);
      comprova(b !== null && camins.some(([p, q]) => p === a && q === b) && x.igual(fraccioPT(model.primer[a])) && y.igual(valor)
        && x.producte(y).igual(valorPT(dre)), () => `${on}: el producte «${producte[1]}» de ${a} → ${b} és fals`);
    }
  });
}

/** Veritat d'un guió de probabilitat total. */
function comprovaProbabilitatTotal(passos, problema, model, nom) {
  const FILA = ProbabilitatTotal.FILA;
  const primers = Object.keys(model.primer);
  // El model es comprova a si mateix: cada nivell suma 1, i la total és la suma dels camins.
  const suma1 = vs => vs.map(fraccioPT).reduce((s, v) => s.suma(v), fr(0)).igual(1);
  comprova(suma1(Object.values(model.primer)) && primers.every(e => suma1(Object.values(model.fills[e]))), () => `${nom}: el model no suma 1`);
  const total = model.camins.map(([a, b]) => fraccioPT(model.primer[a]).producte(fraccioPT(model.fills[a][b]))).reduce((s, v) => s.suma(v));
  comprova(total.igual(fraccioPT(model.total)), () => `${nom}: el model no quadra amb la probabilitat total`);
  let linies = 0;
  passos.forEach((pas, i) => pas.files.forEach((tex, fila) => {
    if (!tex || fila === FILA.enunciat || fila === FILA.llegenda) return;
    const on = `${nom}, pas ${i + 1}, fila ${fila + 1}`;
    linies++;
    try {
      if (fila === FILA.arbre) {
        comprovaArbrePT(tex, model, model.camins, on);
        return;
      }
      const linies_ = fila === FILA.dades ? liniesDArray(tex) : [textPla(tex)];
      for (const l of linies_) {
        const parts = l.split('=');
        const esq = probabilitatPT(model, parts[0]);
        const pregunta = /^P\(.*\)$/.test(parts[0]) && !esq;          // P(D) o P(«mateixcolor»): la probabilitat que es busca
        const valor = esq || (pregunta ? total : null);
        comprova(valor && parts.slice(1).every(t => {
          const termes = t.includes('+') && !t.startsWith('1-') ? t.split('+') : null;
          const v = termes ? termes.map(valorPT).reduce((s, w) => s.suma(w)) : valorPT(t.replace(/^1-/, '1-'));
          return v.igual(valor);
        }), () => `${on}: «${l}» és fals`);
        if (pregunta) comprova(fila !== FILA.dades && total.igual(valor), () => `${on}: «${l}»`);
      }
    } catch (e) {
      comprova(false, () => `${on}: no es pot llegir «${tex.slice(0, 100)}»: ${e.message}`);
    }
  }));
  // Al final: totes les branques amb la seva probabilitat, els productes només als camins, la resposta i les dades marcades.
  const final = passos[passos.length - 1];
  const pla = textPla(final.files[FILA.arbre]);
  comprova(!pla.includes('→⟨⟩'), () => `${nom}: a l'arbre final hi falten probabilitats`);
  comprova((pla.match(/\*/g) || []).length === model.camins.length, () => `${nom}: l'arbre final no té un producte per camí`);
  comprova(final.classes[FILA.resposta] === 'final' && valorPT(textPla(final.files[FILA.resposta]).split('=')[1]).igual(total), () => `${nom}: la resposta final`);
  comprova(liniesDArray(final.files[FILA.dades]).length === model.dades, () => `${nom}: la llista de dades no té ${model.dades} línies`);
  const marques = [...final.files[FILA.enunciat].matchAll(/\{\{[^|]*\|([^|]*)\|/g)].map(m => m[1]);
  comprova(marques.length && marques.every(m => m === 'condicio'), () => `${nom}: hi ha frases sense marcar`);
  return linies;
}

seccio('arbre i probabilitat total', () => {
  let linies = 0, passos = 0;
  for (const problema of ProbabilitatTotal.problemes) {
    const model = PT[problema.id];
    comprova(model, () => `${problema.id}: no hi ha model`);
    if (!model) continue;
    const llista = ProbabilitatTotal.passos({p: problema.id});
    comprovaGuio(llista, ProbabilitatTotal.files, problema.id);
    linies += comprovaProbabilitatTotal(llista, problema, model, problema.id);
    passos += llista.length;
    comprova(iguals(ProbabilitatTotal.llegeixAdreca(ProbabilitatTotal.escriuAdreca({p: problema.id})).valors, {p: problema.id}), () => `${problema.id}: adreça`);
  }
  comprova(Object.keys(PT).length === ProbabilitatTotal.problemes.length, 'models de més');
  return `${ProbabilitatTotal.problemes.length} problemes, ${passos} passos, ${linies} línies comprovades`;
});


/* ── 12. TEOREMA DE BAYES ──────────────────────────────────────────── */

/*
 * Model de cada pregunta de Bayes, escrit aquí: P(A ∣ B) amb el camí A → B (numerador) i els
 * camins que acaben en B (denominador, si no són els de la probabilitat total). Els valors
 * surten del model PT de la secció anterior.
 */
const BY = {
  peces: {A: 'F', B: 'D'}, dau: {A: 'R', B: 'C'}, prova: {A: 'M', B: 'T'}, correu: {A: '¬B', B: 'C'}, maquines: {A: 'C', B: 'D'},
  bossa: {A: 'V_1', B: 'V_2', camins: [['V_1', 'V_2'], ['B_1', 'V_2']]},
};

/** Un resultat escrit «= v» (exacte) o «≈ v» (dins de mig ordre de l'última xifra). */
function resultatCert(relacio, text, valor) {
  const v = valorPT(text);
  if (relacio === '=') return v.igual(valor);
  const decimals = (/,(\d+)$/.exec(text) || ['', ''])[1].length;
  return v.resta(valor).abs().producte(2 * 10 ** decimals).resta(1).signe() <= 0 && !v.igual(valor);
}

/** Tanca el parèntesi que obre a «text[i]»: torna l'índex del «)» corresponent. */
function tancament(text, i) {
  let nivell = 0;
  for (let k = i; k < text.length; k++) {
    if (text[k] === '(') nivell++;
    else if (text[k] === ')' && --nivell === 0) return k;
  }
  throw new Error(`parèntesis desaparellats a «${text}»`);
}
/**
 * La fórmula de Bayes en text pla: «P(A∣B)», «P(A∣B)=((N)/(D))» o «…=((N)/(D))≈v».
 * Torna [tot, «A∣B», N, D, relació, resultat] (com un resultat d'exec), o null.
 */
function formulaBayes(pla) {
  const m = /^P\(([^)]*)\)(.*)$/.exec(pla);
  if (!m) return null;
  if (!m[2]) return [pla, m[1]];
  if (!m[2].startsWith('=((')) return null;
  const cos = m[2].slice(1), fi = tancament(cos, 0);
  const dins = cos.slice(1, fi);                   // «(N)/(D)»
  const fiN = tancament(dins, 0);
  if (dins[fiN + 1] !== '/') return null;
  const resta = cos.slice(fi + 1), r = /^(=|≈)(.*)$/.exec(resta);
  if (resta && !r) return null;
  return [pla, m[1], dins.slice(1, fiN), dins.slice(fiN + 3, -1), r && r[1], r && r[2]];
}

/** Veritat d'un guió de Bayes. */
function comprovaBayes(passos, problema, model, by, nom) {
  const FILA = Bayes.FILA;
  const camins = by.camins || model.camins;
  const prob = ([a, b]) => fraccioPT(model.primer[a]).producte(fraccioPT(model.fills[a][b]));
  comprova(camins.some(([a, b]) => a === by.A && b === by.B) && camins.every(([, b]) => b === by.B), () => `${nom}: el model de Bayes no és coherent`);
  const num = prob([by.A, by.B]), den = camins.map(prob).reduce((s, v) => s.suma(v));
  const resultat = num.quocient(den);
  const pregunta = `P(${by.A}∣${by.B})`;
  let linies = 0;
  passos.forEach((pas, i) => pas.files.forEach((tex, fila) => {
    if (!tex || fila === FILA.enunciat || fila === FILA.llegenda) return;
    const on = `${nom}, pas ${i + 1}, fila ${fila + 1}`;
    linies++;
    try {
      if (fila === FILA.arbre) { comprovaArbrePT(tex, model, camins, on); return; }
      const pla = textPla(tex);
      if (fila === FILA.formula) {
        const m = formulaBayes(pla);
        comprova(m && `P(${m[1]})` === pregunta, () => `${on}: «${pla}» no és ${pregunta}`);
        if (m && m[2] !== undefined) {
          const numOk = m[2] === `P(${by.A}∩${by.B})` || valorPT(m[2]).igual(num);
          const denOk = m[3] === `P(${by.B})` || valorPT(m[3]).igual(den);
          comprova(numOk && denOk, () => `${on}: «${pla}»: el numerador o el denominador no són els de Bayes`);
          if (m[4]) {
            const final = m[5].split('=');             // «1/2 = 0,5» en format fracció
            comprova(final.every((t, k) => resultatCert(k === 0 ? m[4] : '=', t, resultat)), () => `${on}: «${pla}»: el resultat val ${resultat.valor()}`);
          }
        }
      } else if (fila === FILA.calcul) {
        const parts = pla.split('=');
        comprova(parts.length === 3 && parts[0] === (by.camins ? `P(${by.B})` : parts[0]) && valorPT(parts[2]).igual(den)
          && parts[1].split('+').map(valorPT).reduce((s, v) => s.suma(v)).igual(den), () => `${on}: «${pla}» no és ${den.valor()}`);
      } else if (fila === FILA.resposta) {
        const m = /^P\(([^)]*)\)(=|≈)(.*)$/.exec(pla);
        comprova(m && `P(${m[1]})` === pregunta && m[3].split('=').every((t, k) => resultatCert(k === 0 ? m[2] : '=', t, resultat)), () => `${on}: resposta «${pla}»`);
      }
    } catch (e) {
      comprova(false, () => `${on}: no es pot llegir «${tex.slice(0, 100)}»: ${e.message}`);
    }
  }));
  const final = passos[passos.length - 1];
  comprova(final.classes[FILA.resposta] === 'final', () => `${nom}: la resposta no està destacada`);
  comprova((textPla(final.files[FILA.arbre]).match(/\*/g) || []).length === camins.length, () => `${nom}: l'arbre final no té un producte per camí`);
  const marques = [...final.files[FILA.enunciat].matchAll(/\{\{([^|]*)\|([^|]*)\|/g)];
  comprova(marques.every(([, k, m]) => (k === 'Eq1' ? m === 'objectiu' : m === 'condicio')), () => `${nom}: les marques de l'enunciat`);
  return linies;
}

seccio('Bayes', () => {
  let linies = 0, passos = 0;
  for (const problema of Bayes.problemes) {
    const model = PT[problema.id], by = BY[problema.id];
    comprova(model && by, () => `${problema.id}: no hi ha model`);
    if (!model || !by) continue;
    const llista = Bayes.passos({p: problema.id});
    comprovaGuio(llista, Bayes.files, problema.id);
    linies += comprovaBayes(llista, problema, model, by, problema.id);
    passos += llista.length;
  }
  // L'arrodoniment: «≈» exigeix que el valor no sigui exacte i que la diferència sigui com a màxim mitja unitat de l'última xifra.
  comprova(resultatCert('≈', '0,8537', fr(35, 41)) && !resultatCert('≈', '0,8536', fr(35, 41)) && !resultatCert('≈', '0,5', fr(1, 2)), 'resultatCert');
  return `${Bayes.problemes.length} problemes, ${passos} passos, ${linies} línies comprovades`;
});


/* ── 13. DISTRIBUCIÓ BINOMIAL ──────────────────────────────────────── */

/*
 * Aritmètica exacta amb BigInt (les fraccions de Mates no hi arriben: 100¹⁰ = 10²⁰).
 * Un racional és {n, d}, amb d > 0.
 */
const Bq = (n, d = 1n) => ({n: BigInt(n), d: BigInt(d)});
const sumaB = (a, b) => Bq(a.n * b.d + b.n * a.d, a.d * b.d);
const restaB = (a, b) => Bq(a.n * b.d - b.n * a.d, a.d * b.d);
const producteB = (a, b) => Bq(a.n * b.n, a.d * b.d);
const igualB = (a, b) => a.n * b.d === b.n * a.d;
const absB = a => Bq(a.n < 0n ? -a.n : a.n, a.d);
const finsB = (a, b) => a.n * b.d <= b.n * a.d;          // a ≤ b
const factorialB = n => (n <= 1 ? 1n : BigInt(n) * factorialB(n - 1));
const SIMBOLS_B = ['=', '≥', '≤', '>', '<'];             // les relacions de l'editor, en ordre

/** Un nombre de la pissarra (text pla): «0,0146», «12», «4,2*10^(-5)». {valor, mitja}: mitja és mitja unitat de l'última xifra. */
function llegeixB(t) {
  const m = /^(\d+)(?:,(\d+))?(?:\*10\^\((-?\d+)\))?$/.exec(t);
  if (!m) throw new Error(`«${t}» no és un nombre previst`);
  const dec = m[2] || '', e = m[3] ? BigInt(m[3]) : 0n;
  const escala = e >= 0n ? Bq(10n ** e) : Bq(1n, 10n ** -e);
  return {valor: producteB(Bq(BigInt(m[1] + dec), 10n ** BigInt(dec.length)), escala), mitja: producteB(Bq(1n, 2n * 10n ** BigInt(dec.length)), escala)};
}
/** «= t» exacte, o «≈ t» arrodonit: no exacte, i dins de mitja unitat de l'última xifra (més «marge»). */
function certB(relacio, t, valor, marge = Bq(0)) {
  const x = llegeixB(t);
  if (relacio === '=') return igualB(x.valor, valor);
  return relacio === '≈' && !igualB(x.valor, valor) && finsB(absB(restaB(x.valor, valor)), sumaB(x.mitja, marge));
}
/** P(X r m), en text pla, com a indicador: [0 o 1 per a cada valor 0…n de X]. */
function conjuntB(t, n) {
  const m = /^P\(X(=|≥|≤|>|<)(\d+)\)$/.exec(t);
  if (!m) throw new Error(`«${t}» no és P(X r m)`);
  const k = Number(m[2]);
  const entra = {'=': j => j === k, '≥': j => j >= k, '≤': j => j <= k, '>': j => j > k, '<': j => j < k}[m[1]];
  return Array.from({length: n + 1}, (_, j) => (entra(j) ? 1 : 0));
}
/** Una combinació de probabilitats («P(X=0)+P(X=1)», «1-P(X≤1)», «1-[…]») com a suma d'indicadors. */
function indicadorB(t, n) {
  if (t.startsWith('1-')) {
    const r = t.slice(2), dins = r.startsWith('[') && r.endsWith(']') ? r.slice(1, -1) : r;
    return indicadorB(dins, n).map(x => 1 - x);
  }
  const termes = t.split('+');
  const parts = termes.map((u, i) => {
    if (u !== '…') return conjuntB(u, n);
    // «P(X=a)+…+P(X=b)»: els valors entre a i b (com a mínim dos), sense comptar-los.
    const [a, b] = [termes[i - 1], termes[i + 1]].map(w => /^P\(X=(\d+)\)$/.exec(w || ''));
    if (!a || !b || Number(b[1]) - Number(a[1]) < 3) throw new Error(`«…» mal posat a «${t}»`);
    return Array.from({length: n + 1}, (_, j) => (j > Number(a[1]) && j < Number(b[1]) ? 1 : 0));
  });
  return parts.reduce((s, c) => s.map((x, j) => x + c[j]));
}

/**
 * Veritat d'un guió de la binomial, amb un model calculat aquí: P(X = j) amb factorials,
 * en BigInt. Files: les dades (n; p, en % i en tant per u; q = 1 − p; X ~ B(n; p)); la
 * fórmula; la pregunta descomposta (mateix conjunt de valors de X, comptats una vegada);
 * cada cas (substitució i valor, exacte o ben arrodonit); la suma (amb el marge dels
 * arrodoniments) i la resposta. I el camí: es calculen els casos de la pregunta o, si en
 * té menys, els del contrari.
 */
function comprovaBinomial(passos, v, nom) {
  const FILA = Binomial.FILA;
  const prob = j => Bq(factorialB(v.n) / (factorialB(j) * factorialB(v.n - j)) * BigInt(v.p) ** BigInt(j) * BigInt(100 - v.p) ** BigInt(v.n - j), 100n ** BigInt(v.n));
  const P = `P(X${SIMBOLS_B[v.r]}${v.k})`;
  const S = conjuntB(P, v.n);
  const exacte = S.reduce((s, x, j) => (x ? sumaB(s, prob(j)) : s), Bq(0));
  const pB = Bq(v.p, 100), qB = Bq(100 - v.p, 100);
  const iguals = (a, b) => a.length === b.length && a.every((x, j) => x === b[j]);
  let linies = 0, termes = [];
  passos.forEach((pas, i) => pas.files.forEach((tex, fila) => {
    if (!tex) return;
    const on = `${nom}, pas ${i + 1}, fila ${fila + 1}`;
    linies++;
    try {
      if (fila === FILA.dades) {
        const linies = tex.startsWith('\\begin{array}') ? tex.replace(/^\\begin\{array\}\{l\}|\\end\{array\}$/g, '').split('\\\\[4pt]') : [tex];
        comprova(linies.length <= 2, () => `${on}: les dades són en una o dues línies`);
        const trossos = linies.flatMap(l => l.trim().split(',\\quad ')).map(textPla);
        comprova(trossos[0] === `n=${v.n}`, () => `${on}: «${trossos[0]}»`);
        const [nomP, ...ps] = trossos[1].split('=');
        comprova(nomP === 'p' && ps.length && ps.every(t => (t.endsWith('%') ? igualB(llegeixB(t.slice(0, -1)).valor, Bq(v.p)) : igualB(llegeixB(t).valor, pB)))
          && ps[0].endsWith('%') === (v.mode === 'cent'), () => `${on}: «${trossos[1]}»`);
        if (trossos[2]) {
          const m = /^q=1-p=(.*)$/.exec(trossos[2]);
          comprova(m && igualB(llegeixB(m[1]).valor, qB), () => `${on}: «${trossos[2]}»`);
        }
        if (trossos[3]) {
          const m = /^X∼B\((\d+);(.*)\)$/.exec(trossos[3]);
          comprova(m && Number(m[1]) === v.n && igualB(llegeixB(m[2]).valor, pB), () => `${on}: «${trossos[3]}»`);
        }
        comprova(trossos.length <= 4, () => `${on}: massa dades`);
      } else if (fila === FILA.formula) {
        comprova(textPla(tex) === 'P(X=k)=C(n,k)*p^(k)*q^(n-k)', () => `${on}: «${textPla(tex)}»`);
      } else if (fila === FILA.pregunta) {
        const m = /^(P\(X[^)]*\))=(.*)$/.exec(textPla(tex));
        comprova(m && m[1] === P && iguals(indicadorB(m[2], v.n), S), () => `${on}: «${textPla(tex)}» no és la mateixa probabilitat`);
      } else if (fila === FILA.termes) {
        termes = liniesDArray(tex).map(l => {
          const m = /^P\(X=(\d+)\)=C\((\d+),(\d+)\)\*([\d,]+)\^\((\d+)\)\*([\d,]+)\^\((\d+)\)(?:(=|≈)(.+))?$/.exec(l);
          if (!m) throw new Error(`cas «${l}» no previst`);
          const j = Number(m[1]);
          comprova(Number(m[2]) === v.n && Number(m[3]) === j && igualB(llegeixB(m[4]).valor, pB) && Number(m[5]) === j
            && igualB(llegeixB(m[6]).valor, qB) && Number(m[7]) === v.n - j, () => `${on}: la substitució «${l}» és falsa`);
          if (m[8]) comprova(certB(m[8], m[9], prob(j)), () => `${on}: «${l}»: P(X=${j}) val ${prob(j).n}/${prob(j).d}`);
          return {j, valor: m[9]};
        });
      } else if (fila === FILA.suma) {
        const pla = tex.startsWith('\\begin{array}') ? liniesDArray(tex).join('') : textPla(tex);
        const m = /^(P\(X[^)]*\))(=|≈)(.*)(=|≈)([^=≈]*)$/.exec(pla);
        if (!m) throw new Error('suma no prevista');
        const contrari = m[3].startsWith('1-');
        const cos = contrari ? m[3].slice(2).replace(/^\[(.*)\]$/, '$1') : m[3];
        const xs = cos.split('+').map(llegeixB);
        const suma = xs.reduce((s, x) => sumaB(s, x.valor), Bq(0)), marge = xs.reduce((s, x) => sumaB(s, x.mitja), Bq(0));
        const mig = contrari ? restaB(Bq(1), suma) : suma;
        comprova(m[1] === P && iguals(cos.split('+'), termes.map(t => t.valor)), () => `${on}: la suma no és la dels casos calculats`);
        comprova(m[2] === '=' ? igualB(mig, exacte) : finsB(absB(restaB(mig, exacte)), marge), () => `${on}: «${m[3]}» no és ${P}`);
        comprova(m[4] === '=' ? m[2] === '=' && certB('=', m[5], exacte) : finsB(absB(restaB(llegeixB(m[5]).valor, exacte)), llegeixB(m[5]).mitja),
          () => `${on}: el total «${m[5]}» no és ${P} = ${exacte.n}/${exacte.d}`);
      } else if (fila === FILA.resposta) {
        const m = /^(P\(X[^)]*\))(=|≈)(.*)$/.exec(textPla(tex));
        comprova(m && m[1] === P && certB(m[2], m[3], exacte), () => `${on}: resposta «${textPla(tex)}»`);
      }
    } catch (e) {
      comprova(false, () => `${on}: no es pot llegir «${tex.slice(0, 120)}»: ${e.message}`);
    }
  }));
  // El camí: els casos de la pregunta o els del contrari, el més curt (si empaten, directament).
  const final = passos[passos.length - 1];
  const nS = S.filter(Boolean).length, nC = v.n + 1 - nS;
  const calculats = Array.from({length: v.n + 1}, (_, j) => (termes.some(t => t.j === j) ? 1 : 0));
  const perContrari = nC < nS;
  comprova(termes.length === Math.min(nS, nC) && iguals(calculats, perContrari ? S.map(x => 1 - x) : S), () => `${nom}: no calcula els casos del camí més curt`);
  comprova(!perContrari || textPla(final.files[FILA.pregunta]).startsWith(`${P}=1-`), () => `${nom}: el contrari no surt a la pregunta`);
  comprova(final.classes[FILA.resposta] === 'final', () => `${nom}: la resposta no està destacada`);
  comprova(passos.some(pas => pas.files[FILA.dades].includes('\\sim')) && passos.some(pas => /\\binom\{n\}/.test(pas.files[FILA.formula])), () => `${nom}: falten la distribució o la fórmula`);
  // El text de la resposta: el mateix valor, i el percentatge (si n'hi ha), exacte o ben arrodonit.
  const text = final.text;
  const r = /^(P\(X[^)]*\))(=|≈)(.*)$/.exec(textPla(final.files[FILA.resposta]));
  const valor = /és (aproximadament )?\$([^$]*)\$/.exec(text);
  comprova(valor && valor[2].replace('{,}', ',').replace(/\s/g, '') === r[3].replace(/\*/g, '\\cdot') .replace(/\(([^)]*)\)$/, '{$1}') || valor && textPla(valor[2]) === r[3],
    () => `${nom}: el text de la resposta no diu el valor de la pissarra`);
  comprova(valor && Boolean(valor[1]) === (r[2] === '≈'), () => `${nom}: «aproximadament» al text de la resposta`);
  const pc = /un \$([^$]*)\\,\\%\$/.exec(text);
  if (pc) {
    const aprox = /aproximadament un \$/.test(text);
    comprova(certB(aprox ? '≈' : '=', textPla(pc[1]), producteB(exacte, Bq(100))), () => `${nom}: el percentatge «${pc[1]}» és fals`);
  } else {
    comprova(finsB(producteB(exacte, Bq(100)), Bq(5, 1000)), () => `${nom}: falta el percentatge`);
  }
  return linies;
}

seccio('distribució binomial', () => {
  const L = p => Binomial.llegeixAdreca(p);
  const d = (n, p, r, k, mode) => ({n, p, r, k, mode});
  for (const [p, esperat] of [
    [{}, d(5, 25, 1, 4, 'cent')], [{n: '10', p: '0,1', r: 'gt', k: '1'}, d(10, 10, 3, 1, 'u')], [{n: '8', pc: '30', r: 'le', k: '2'}, d(8, 30, 2, 2, 'cent')],
    [{n: '6', p: '0.5', r: 'eq', k: '3'}, d(6, 50, 0, 3, 'u')], [{n: '3', pc: '5', r: 'lt', k: '1'}, d(3, 5, 4, 1, 'cent')],
  ]) comprova(iguals(L(p).valors, esperat), () => `Binomial.llegeixAdreca(${JSON.stringify(p)}) → ${JSON.stringify(L(p))}`);
  for (const [p, patro] of [
    [{p: '0,25', pc: '25'}, /alhora/], [{r: 'ne'}, /eq, ge, le, gt o lt/], [{n: '11'}, /entre 1 i 10/], [{n: '0'}, /entre 1 i 10/], [{n: '2,5'}, /enter/],
    [{p: '0,125'}, /dues xifres decimals/], [{pc: '12,5'}, /dues xifres decimals/], [{p: '1'}, /de 0,01 a 0,99/], [{pc: '0'}, /de 0,01 a 0,99/],
    [{k: '6'}, /de 0 a n = 5/], [{r: 'ge', k: '0'}, /Tots els valors/], [{r: 'gt', k: '5'}, /Cap valor/], [{r: 'lt', k: '0'}, /Cap valor/],
    [{r: 'le', k: '5'}, /Tots els valors/], [{n: 'x'}, /^No entenc l'adreça/],
  ]) comprova(patro.test(L(p).error || ''), () => `Binomial.llegeixAdreca(${JSON.stringify(p)}) hauria de donar ${patro}: ${JSON.stringify(L(p))}`);
  for (const v of Binomial.exemples) comprova(Binomial.valida(v) === null, () => `l'exemple ${JSON.stringify(v)} no és vàlid`);
  for (const [n, k, c] of [[10, 5, 252n], [10, 0, 1n], [7, 3, 35n], [1, 1, 1n]]) comprova(Binomial.combinatori(n, k) === c, () => `C(${n}, ${k})`);

  const casos = Binomial.exemples.slice();
  for (const p of [1, 5, 10, 13, 25, 30, 37, 50, 63, 75, 90, 99]) {
    for (let n = 1; n <= 10; n++) for (let r = 0; r < 5; r++) for (let k = 0; k <= n; k++) casos.push(d(n, p, r, k, (n + k + r) % 2 ? 'u' : 'cent'));
  }
  const atzar = aleatori(2031);
  const enter = (min, max) => min + Math.floor(atzar() * (max - min + 1));
  for (let i = 0; i < 2000; i++) { const n = enter(1, 10); casos.push(d(n, enter(1, 99), enter(0, 4), enter(0, n), atzar() < 0.5 ? 'u' : 'cent')); }
  let valids = 0, linies = 0, passos = 0, contrari = 0, cientifica = 0, arrodonits = 0;
  for (const v of casos) {
    if (Binomial.valida(v)) continue;
    valids++;
    const nom = `n = ${v.n}, p = ${v.p}/100 (${v.mode}), P(X ${SIMBOLS_B[v.r]} ${v.k})`;
    comprova(iguals(L(Binomial.escriuAdreca(v)).valors, v), () => `${nom}: anada i tornada de l'adreça`);
    let llista;
    try {
      llista = Binomial.passos(v);
    } catch (e) {
      comprova(false, () => `${nom}: passos() llança ${e.stack}`);
      continue;
    }
    comprovaGuio(llista, Binomial.files, nom);
    linies += comprovaBinomial(llista, v, nom);
    passos += llista.length;
    const final = llista[llista.length - 1];
    if (final.files[Binomial.FILA.pregunta].includes('1 -')) contrari++;
    if (final.files[Binomial.FILA.resposta].includes('10^')) cientifica++;
    if (final.files[Binomial.FILA.suma].includes('\\approx')) arrodonits++;
  }
  comprova(contrari > 0 && cientifica > 0 && arrodonits > 0, 'la mostra no té casos pel contrari, en notació científica o amb sumes arrodonides');
  return `${valids} casos vàlids, ${passos} passos, ${linies} línies comprovades (${contrari} pel contrari, ${cientifica} en notació científica, ${arrodonits} sumes amb arrodoniments)`;
});


/* ── 14. DETERMINANT 3×3 AMB UN PARÀMETRE (SARRUS) ─────────────────── */

/** Els grups amb clau d'un TeX: {clau: {tex, marca}} (el contingut, amb les claus de dins). */
function grupsAmbClau(tex) {
  const r = {};
  const re = /\\htmlData\{([^}]*)\}\{/g;
  let m;
  while ((m = re.exec(tex))) {
    const atributs = Object.fromEntries(m[1].split(',').map(x => x.split('=')));
    let i = re.lastIndex, nivell = 1;
    const inici = i;
    while (nivell && i < tex.length) {
      if (tex[i] === '\\') i++;                    // «\{» i «\}» no compten (són claus escrites, com a \left\{)
      else if (tex[i] === '{') nivell++;
      else if (tex[i] === '}') nivell--;
      i++;
    }
    if (nivell) throw new Error('claus desaparellades');
    r[atributs.k] = {tex: tex.slice(inici, i - 1), marca: atributs.marca || ''};
  }
  return r;
}
/** Els elements (TeX) d'una matriu «\begin{pmatrix} … \end{pmatrix}» (o vmatrix) d'una fila. */
function elementsDeMatriu(tex) {
  const m = /\\begin\{([pv])matrix\}(.*)\\end\{\1matrix\}/.exec(tex);
  if (!m) throw new Error('no hi ha cap matriu');
  return {tipus: m[1], files: m[2].split('\\\\').map(f => f.split('&').map(c => c.trim()))};
}

const PUNTS_DET = [-3, -2, -1, 0, 1, 2, 3, 5].map(t => fr(t));
/** Valor exacte d'un text pla en la variable X, al punt t. */
const valorX = (text, X, t) => exacte(M.llegeix(text, {variables: [X]}), {variables: {[X]: t}, funcions: {}});
/** Determinant numèric 3×3, desenvolupat per la primera fila (no per Sarrus). */
const detLaplace = B => B[0][0].producte(B[1][1].producte(B[2][2]).resta(B[1][2].producte(B[2][1])))
  .resta(B[0][1].producte(B[1][0].producte(B[2][2]).resta(B[1][2].producte(B[2][0]))))
  .suma(B[0][2].producte(B[1][0].producte(B[2][1]).resta(B[1][1].producte(B[2][0]))));

/** Arrels racionals de p (coeficients Fraccio, de grau 0 cap amunt), amb el teorema de les arrels racionals; null si n'hi ha d'irracionals. */
function arrelsX(p) {
  p = p.slice();
  while (p.length && p[p.length - 1].esZero()) p.pop();
  if (!p.length) throw new Error('l\'equació és 0 = 0');
  const arrels = [];
  while (p.length > 1 && p[0].esZero()) { arrels.push(fr(0)); p.shift(); }
  const L = p.reduce((l, c) => l / M.mcd(l, c.den) * c.den, 1);
  const enters = () => p.map(c => c.producte(L).num);
  const divs = n => Array.from({length: Math.abs(n)}, (_, i) => i + 1).filter(d => n % d === 0);
  let canvi = true;
  while (canvi && p.length > 1) {
    canvi = false;
    const a = enters();
    for (const d of divs(a[0])) for (const e of divs(a[a.length - 1])) for (const s of [1, -1]) {
      if (canvi) continue;
      const r = fr(s * d, e);
      if (!p.reduce((v, c, i) => v.suma(c.producte(r.potencia(i))), fr(0)).esZero()) continue;
      arrels.push(r);
      // Divideix per (X − r): coeficients de més a menys grau.
      const dalt = p.slice().reverse(), baix = [dalt[0]];
      for (let i = 1; i < dalt.length - 1; i++) baix.push(dalt[i].suma(baix[i - 1].producte(r)));
      p = baix.reverse();
      canvi = true;
    }
  }
  if (p.length === 1) return arrels;
  if (p.length === 3) {
    const disc = p[1].producte(p[1]).resta(p[0].producte(p[2]).producte(4));
    return disc.signe() < 0 ? arrels : null;
  }
  return null;
}
/** Solucions d'una fila (text pla) en la variable X: «|» és «o»; «X=a±b»; o una equació polinòmica. */
function solucionsX(pla, X) {
  const valors = [];
  for (const part of pla.split('|')) {
    const costats = part.split('=');
    if (costats.length !== 2) throw new Error(`«${part}» no és una equació`);
    const [e, d] = costats;
    if (part.includes('±')) {
      if (e !== X) throw new Error(`«${part}»: amb ± hi ha d'haver ${X} a l'esquerra`);
      for (const s of ['+', '-']) {
        try {
          valors.push(exacte(M.llegeix(d.replace('±', s), {variables: []}), {variables: {}, funcions: {}}));
        } catch (err) {
          if (!(err instanceof SenseValorReal)) throw err;
        }
      }
    } else {
      const p = M.polinomi(M.llegeix(`(${e})-(${d})`, {variables: [X]}), X);
      if (!p) throw new Error(`«${part}» no és polinòmica`);
      const r = arrelsX(p);
      if (!r) throw new Error(`«${part}» té solucions irracionals`);
      valors.push(...r);
    }
  }
  return conjunt(valors);
}

/**
 * Veritat d'un guió del determinant, amb un model calculat aquí: la matriu llegida de les
 * dades i el determinant desenvolupat per la primera fila, en 8 punts (el determinant és
 * de grau ≤ 3). Files: la matriu (els seus elements, i a cada producte de Sarrus, marcats
 * exactament els tres elements del producte, verds si és + i vermells si és −); els
 * productes (cada un, el de la seva posició, amb els factors en ordre de files, i la
 * fila sencera igual a |A|); el càlcul (sempre igual a |A|; al final, agrupat); les
 * equacions (mateixes solucions que |A| = 0, i la factoritzada, proporcional a |A|);
 * les proves d'arrels; la taula de Ruffini; l'equació de segon grau; la resposta.
 */
const textPlaBase = textPla, liniesDArrayBase = liniesDArray;
function comprovaDeterminant(passos, v, nom, opcions = {}) {
  // λ es llegeix com la variable «L» (Mates no coneix «λ»).
  const textPla = t => textPlaBase(t).replace(/λ/g, 'L');
  const liniesDArray = t => liniesDArrayBase(t).map(l => l.replace(/λ/g, 'L'));
  const nomD = opcions.nomDet || '|A|=';                // el nom del determinant a la pissarra, en text pla
  // opcions (per a altres pàgines): FILA (files matriu, sarrus, calcul, equacio, prova, ruffini, segon), P (prefix de les claus de Sarrus),
  // X, A (text de la matriu 3×3), rapid (Sarrus sense marques), nomesDet (sense la resposta del determinant).
  const FILA = opcions.FILA || Determinant.FILA;
  const P = opcions.P || '';
  const X = opcions.X || (v.A.match(/[a-z]/) || [])[0];
  const A = (opcions.A || v.A).split(';').map(f => f.split(',').map(e => M.llegeix(e, {variables: [X]})));
  const valorA = (i, j, t) => exacte(A[i][j], {variables: {[X]: t}, funcions: {}});
  const det = t => detLaplace([0, 1, 2].map(i => [0, 1, 2].map(j => valorA(i, j, t))));
  const SARRUS_MODEL = [['00', '11', '22', '+'], ['01', '12', '20', '+'], ['02', '10', '21', '+'], ['02', '11', '20', '-'], ['00', '12', '21', '-'], ['01', '10', '22', '-']];
  const igualDet = text => PUNTS_DET.every(t => valorX(text, X, t).igual(det(t)));
  // |A| = 0: les solucions, amb un polinomi interpolat pels punts (grau ≤ 3, coeficients exactes).
  const coefsDet = (() => {
    const xs = PUNTS_DET.slice(0, 4), ys = xs.map(det);
    // Lagrange → coeficients: resol el sistema de Vandermonde 4×4 per Gauss.
    const Mx = xs.map((x, i) => [0, 1, 2, 3].map(k => x.potencia(k)).concat([ys[i]]));
    for (let c = 0; c < 4; c++) {
      const f = Mx.findIndex((r, i) => i >= c && !r[c].esZero());
      [Mx[c], Mx[f]] = [Mx[f], Mx[c]];
      for (let i = 0; i < 4; i++) if (i !== c) { const k = Mx[i][c].quocient(Mx[c][c]); Mx[i] = Mx[i].map((x, j) => x.resta(Mx[c][j].producte(k))); }
    }
    return Mx.map((r, i) => r[4].quocient(r[i]));
  })();
  comprova(PUNTS_DET.every(t => coefsDet.reduce((s, c, i) => s.suma(c.producte(t.potencia(i))), fr(0)).igual(det(t))), () => `${nom}: el model del determinant no és de grau ≤ 3`);
  const solucionsDet = conjunt(arrelsX(coefsDet) || []);
  const proporcional = text => {
    const p = M.polinomi(M.llegeix(text, {variables: [X]}), X);
    const k = coefsDet.find(c => !c.esZero()) && p && p[coefsDet.findIndex(c => !c.esZero())];
    if (!k || k.esZero()) return false;
    const r = coefsDet.find(c => !c.esZero()).quocient(k);
    return coefsDet.every((c, i) => c.igual((p[i] || fr(0)).producte(r)));
  };
  let linies = 0, sarrusVist = 0, provaArrel = null, segon = null, taulaFinal = null;
  passos.forEach((pas, i) => pas.files.forEach((tex, fila) => {
    if (!tex) return;
    const on = `${nom}, pas ${i + 1}, fila ${fila + 1}`;
    linies++;
    try {
      if (fila === FILA.matriu) {
        const {tipus, files} = elementsDeMatriu(tex);
        comprova(files.length === 3 && files.every((f, a) => f.length === 3 && f.every((c, b) => PUNTS_DET.every(t => valorX(textPla(c), X, t).igual(valorA(a, b, t))))),
          () => `${on}: la matriu no és A`);
        const nomM = textPla(tex.slice(0, tex.indexOf('\\begin')));
        comprova(nomM === (tipus === 'p' ? 'A=' : nomD), () => `${on}: «${nomM}» davant de la matriu`);
        // Les marques: res, o exactament un producte de Sarrus (el que s'afegeix en aquest pas).
        const marcats = Object.entries(grupsAmbClau(tex)).filter(([, g]) => g.marca).map(([k, g]) => [k.slice(P.length + 1), g.marca]);
        if (marcats.length) {
          const n = Object.keys(grupsAmbClau(pas.files[FILA.sarrus] || '')).filter(k => new RegExp(`^${P}S\\d$`).test(k)).length - 1;
          const s = SARRUS_MODEL[n];
          comprova(s && marcats.length === 3 && marcats.every(([ij, mc]) => s.slice(0, 3).includes(String(Number(ij[0]) - 1) + String(Number(ij[1]) - 1)) && mc === (s[3] === '+' ? 'mes' : 'menys')),
            () => `${on}: les marques ${JSON.stringify(marcats)} no són les del producte ${n + 1} de Sarrus`);
          sarrusVist = Math.max(sarrusVist, n + 1);
        }
      } else if (fila === FILA.sarrus) {
        const grups = grupsAmbClau(tex);
        const n = Object.keys(grups).filter(k => new RegExp(`^${P}S\\d$`).test(k)).length;
        for (let k = 0; k < n; k++) {
          const factors = textPla(grups[`${P}S${k}`].tex).split('*');
          const s = SARRUS_MODEL[k];
          comprova(factors.length === 3 && factors.every((f, q) => PUNTS_DET.every(t => valorX(f, X, t).igual(valorA(Number(s[q][0]), Number(s[q][1]), t)))),
            () => `${on}: el producte ${k + 1} («${factors.join('·')}») no és el de Sarrus`);
        }
        const pla = tex.startsWith('\\begin{array}') ? liniesDArray(tex).join('') : textPla(tex);
        comprova(pla.startsWith(nomD), () => `${on}: «${pla}»`);
        if (n === 6) comprova(igualDet(pla.slice(nomD.length)), () => `${on}: «${pla}» no és |A|`);
        // Els signes dels productes: + els tres primers, − els tres últims.
        const ops = tex.replace(/\\htmlData\{[^}]*\}\{(?:[^{}]|\{[^{}]*\})*\}/g, 'P').replace(/\\begin\{array\}\{l\}|\\end\{array\}|\\\\\[4pt\]|\\qquad|\\mathrel|\{|\}|=|\s/g, '');
        comprova(ops === 'PPP' + ['+', '+', '-', '-', '-'].slice(0, n - 1).map(o => o + 'P').join(''),
          () => `${on}: els signes dels productes («${ops}»)`);
      } else if (fila === FILA.calcul) {
        const pla = tex.startsWith('\\begin{array}') ? liniesDArray(tex).join('') : textPla(tex);
        comprova(pla.startsWith(nomD) && igualDet(pla.slice(nomD.length)), () => `${on}: «${pla}» no és |A|`);
      } else if (fila === FILA.equacio) {
        const pla = textPla(tex);
        comprova(solucionsX(pla, X) === solucionsDet, () => `${on}: «${pla}» no té les solucions de |A| = 0 (${solucionsDet})`);
        const grauDet = coefsDet.reduce((g, c, k) => (c.esZero() ? g : k), -1);
        const pEq = !pla.includes('|') && !pla.includes('±') && /^[^=]*=0$/.test(pla) && M.polinomi(M.llegeix(pla.split('=')[0], {variables: [X]}), X);
        if (pEq && pEq.length - 1 === grauDet) {   // l'equació sencera (no la ja resolta): |A| per un nombre
          comprova(proporcional(pla.split('=')[0]), () => `${on}: «${pla}» no és |A| (o |A| multiplicat per un nombre)`);
        }
      } else if (fila === FILA.prova) {
        const linies_ = tex.startsWith('\\begin{array}') ? liniesDArray(tex) : [textPla(tex)];
        const eq = textPla(pas.files[FILA.equacio]).split('=')[0];
        linies_.forEach((l, q) => {
          const m = new RegExp(`^${X}=(-?\\d+):(.*)=(-?\\d+)(≠0)?$`).exec(l);
          if (!m) throw new Error(`prova «${l}» no prevista`);
          const c = fr(Number(m[1])), v_ = fr(Number(m[3]));
          comprova(valorX(m[2], X, c).igual(v_) && valorX(eq, X, c).igual(v_) && Boolean(m[4]) === !v_.esZero(), () => `${on}: «${l}» és fals`);
          const c0 = M.polinomi(M.llegeix(eq, {variables: [X]}), X)[0];
          comprova(c0.esEnter() && c0.num % Number(m[1]) === 0, () => `${on}: ${m[1]} no és un divisor del terme independent`);
          comprova(q === linies_.length - 1 || !v_.esZero(), () => `${on}: després d'una arrel no cal provar-ne més`);
          if (v_.esZero()) provaArrel = c;
        });
      } else if (fila === FILA.ruffini) {
        const m = /^\\begin\{array\}\{r\|r+\|r\}(.*)\\end\{array\}$/.exec(tex.trim());
        if (!m) throw new Error('taula de Ruffini no prevista');
        const [dalt, mig, baix] = m[1].replace('\\hline', '').split('\\\\').map(f => f.split('&').map(c => textPla(c.trim())));
        const nums = f => f.slice(1).map(c => (c === '' ? null : fr(Number(c))));
        const [D, Mg, B] = [nums(dalt), nums(mig), nums(baix)];
        const r = fr(Number(mig[0]));
        const eq = textPla(passos[i].files[FILA.equacio]);
        const p = M.polinomi(M.llegeix(eq.split('=')[0], {variables: [X]}), X);
        comprova(p && D.length === 4 && D.every((c, q) => c && c.igual(p[3 - q] || fr(0))) || /\)\(/.test(eq), () => `${on}: a dalt no hi ha els coeficients de l'equació`);
        comprova(provaArrel && r.igual(provaArrel), () => `${on}: l'arrel ${mig[0]} no és la que s'ha trobat`);
        B.forEach((b, q) => {
          if (b === null) return;
          comprova(q === 0 ? b.igual(D[0]) && Mg[0] === null : Mg[q] && Mg[q].igual(B[q - 1].producte(r)) && b.igual(D[q].suma(Mg[q])), () => `${on}: la columna ${q + 1} de Ruffini és falsa`);
        });
        taulaFinal = {D, B, r};
      } else if (fila === FILA.segon) {
        const s = solucionsX(textPla(tex), X);
        if (segon === null) segon = s;
        comprova(s === segon, () => `${on}: «${textPla(tex)}» no és equivalent a la primera equació de segon grau`);
      } else if (fila === FILA.resposta) {
        const pla = textPla(tex);
        const m = /^\|A\|=0⇔(.*)$/.exec(pla);
        comprova(m ? solucionsX(m[1], X) === solucionsDet : pla === `|A|≠0«peratot»${X}` && solucionsDet === '', () => `${on}: resposta «${pla}» (les solucions són ${solucionsDet})`);
      }
    } catch (e) {
      comprova(false, () => `${on}: no es pot llegir «${tex.slice(0, 120)}»: ${e.message}`);
    }
  }));
  const final = passos[passos.length - 1];
  if (!opcions.rapid) comprova(sarrusVist === 6, () => `${nom}: no es marquen els sis productes de Sarrus (${sarrusVist})`);
  if (!opcions.nomesDet) comprova(final.classes[FILA.resposta] === 'final', () => `${nom}: la resposta no està destacada`);
  // El càlcul final, agrupat: un terme per grau, sense zeros ni parèntesis.
  const calcul = grupsAmbClau(final.files[FILA.calcul]);
  comprova(Object.keys(calcul).filter(k => new RegExp(`^${P}C\\d$`).test(k)).length === Object.keys(calcul).length - 2 && !/[()]/.test(final.files[FILA.calcul]),
    () => `${nom}: el càlcul final no està agrupat`);
  // La taula de Ruffini, completa i amb residu 0; el quocient és l'equació de segon grau.
  if (taulaFinal) {
    comprova(taulaFinal.B.every(b => b !== null) && taulaFinal.B[3].esZero(), () => `${nom}: la taula de Ruffini no acaba amb residu 0`);
    const quocient = taulaFinal.B.slice(0, 3).reverse();
    comprova(segon !== null && conjunt(arrelsX(quocient) || []) === segon, () => `${nom}: l'equació de segon grau no és el quocient`);
  }
  // El text final: «invertible si i només si m ≠ …» amb totes les solucions.
  if (opcions.nomesDet) return {linies, solucionsDet};
  const diferents = [...final.text.matchAll(new RegExp(`\\$${X} \\\\neq (-?[\\d]+|-?\\\\frac\\{\\d+\\}\\{\\d+\\})\\$`, 'g'))].map(m => exacte(M.llegeix(textPla(m[1]), {variables: []}), {variables: {}, funcions: {}}));
  comprova(conjunt(diferents) === solucionsDet, () => `${nom}: el text final diu que A no és invertible per a ${conjunt(diferents)}, i és per a ${solucionsDet}`);
  return linies;
}

seccio('determinant amb paràmetre', () => {
  const L = p => Determinant.llegeixAdreca(p);
  for (const [p, esperat] of [
    [{}, 'm,1,1;1,m,1;1,1,m'], [{A: 'k, 1, 2; 1, k, 0; 0, 1, 1'}, 'k,1,2;1,k,0;0,1,1'], [{A: '1,2,3;0,m,1;1,0,2'}, '1,2,3;0,m,1;1,0,2'],
    [{A: 'm+1,1,1;1,m,1;1,1,1-m'}, null], [{A: '2a,1,0;1,a,1;0,1,a-1'}, null],
  ]) {
    const r = L(p);
    comprova(esperat ? r.valors && r.valors.A === esperat : true, () => `Determinant.llegeixAdreca(${JSON.stringify(p)}) → ${JSON.stringify(r)}`);
  }
  for (const [p, patro] of [
    [{A: '1,2,3;4,5,6;7,8,9'}, /paràmetre/], [{A: 'm,1;1,m'}, /3 files/], [{A: 'm,1,1;1,m;1,1,m'}, /fila 2 ha de tenir 3/], [{A: 'm,k,1;1,m,1;1,1,m'}, /més d'una lletra/],
    [{A: 'x,1,1;1,x,1;1,1,x'}, /«x» no es pot fer servir/], [{A: 'm^2,1,1;1,m,1;1,1,m'}, /ha de ser un nombre enter/], [{A: '10,1,1;1,m,1;1,1,m'}, /de −9 a 9/],
    [{A: 'm,1,1;1,m,1;1,1,'}, /buit/], [{A: '1,0,0;0,1,0;0,0,m-m+1'}, /paràmetre|no depèn/], [{A: 'm,1,0;1,m,1;0,1,m'}, /irracionals/],
    [{A: '1/2,1,1;1,m,1;1,1,m'}, /enter/], [{A: 'm,1,1;1,m,1;1,1,(m'}, /^No entenc/],
  ]) comprova(patro.test(L(p).error || ''), () => `Determinant.llegeixAdreca(${JSON.stringify(p)}) hauria de donar ${patro}: ${JSON.stringify(L(p))}`);
  for (const v of Determinant.exemples) comprova(Determinant.valida(v) === null, () => `l'exemple ${v.A} no és vàlid: ${Determinant.valida(v)}`);
  // Les arrels del comprovador, i Ruffini de matrius.js, en uns quants casos.
  comprova(conjunt(arrelsX([fr(2), fr(-3), fr(0), fr(1)])) === '-2,1' && arrelsX([fr(-2), fr(0), fr(1)]) === null && conjunt(arrelsX([fr(1), fr(0), fr(1)])) === '', 'arrelsX');

  const casos = Determinant.exemples.map(v => v.A);
  const atzar = aleatori(2033);
  const ELEMENTS = ['m', 'm+1', 'm-1', '2m', '-m', '1-m', '2m-1', '-1', '0', '0', '1', '1', '2', '3', '-2'];
  for (let i = 0; i < 2500; i++) {
    const X = ['m', 'm', 'm', 'k', 'a', 'p', 't'][Math.floor(atzar() * 7)];
    casos.push(Array.from({length: 3}, () => Array.from({length: 3}, () => ELEMENTS[Math.floor(atzar() * ELEMENTS.length)].replace(/m/g, X)).join(',')).join(';'));
  }
  let valids = 0, linies = 0, passos = 0;
  const tipus = {};
  for (const text of casos) {
    const r = L({A: text});
    if (r.error) continue;
    const v = r.valors;
    valids++;
    const nom = `A = ${v.A}`;
    comprova(L(Determinant.escriuAdreca(v)).valors.A === v.A, () => `${nom}: anada i tornada de l'adreça`);
    let llista;
    try {
      llista = Determinant.passos(v);
    } catch (e) {
      comprova(false, () => `${nom}: passos() llança ${e.stack}`);
      continue;
    }
    comprovaGuio(llista, Determinant.files, nom);
    linies += comprovaDeterminant(llista, v, nom);
    passos += llista.length;
    const f = llista[llista.length - 1].files;
    const t = f[Determinant.FILA.ruffini] ? 'Ruffini' : /\)\(|^\\htmlData\{k=Ef\}/.test(f[Determinant.FILA.equacio]) ? 'factor comú' : f[Determinant.FILA.resposta].includes('\\neq') ? 'sense solucions' : 'grau ≤ 2';
    tipus[t] = (tipus[t] || 0) + 1;
  }
  comprova(['Ruffini', 'factor comú', 'sense solucions', 'grau ≤ 2'].every(t => tipus[t] > 0), () => `falten tipus de casos: ${JSON.stringify(tipus)}`);
  return `${valids} matrius vàlides, ${passos} passos, ${linies} línies comprovades (${Object.entries(tipus).map(([k, n]) => `${k} ${n}`).join(', ')})`;
});


/* ── 15. RANG D'UNA MATRIU (ORLANT MENORS) ─────────────────────────── */

/** Rang per Gauss (el model: un altre mètode que el de la pàgina). */
function rangGauss(N) {
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
/** Determinant d'un menor quadrat (1, 2 o 3), per cofactors. */
const detMenor = B => (B.length === 1 ? B[0][0] : B.length === 2 ? B[0][0].producte(B[1][1]).resta(B[0][1].producte(B[1][0])) : detLaplace(B));
/** Les files de nombres d'una «\begin{vmatrix} … \end{vmatrix}». */
const nombresDeMatriu = tex => elementsDeMatriu(tex).files.map(f => f.map(c => M.llegeixNombre(textPla(c))));
/** Tots els llocs on és B dins de N: [{fs, cs}]. */
function llocsDeMenor(N, B) {
  const n = B.length, r = [];
  const triar = (k, d) => (k === 0 ? [[]] : Array.from({length: d}, (_, i) => i).flatMap(i => triar(k - 1, d).filter(x => !x.length || x[0] > i).map(x => [i].concat(x))));
  for (const fs of triar(n, N.length)) for (const cs of triar(n, N[0].length)) {
    if (fs.every((i, a) => cs.every((j, b) => N[i][j].igual(B[a][b])))) r.push({fs, cs});
  }
  return r;
}
/** On és B dins de N: {fs, cs} (files i columnes, en ordre), o null. */
function llocDeMenor(N, B) {
  const n = B.length;
  const triar = (k, d) => (k === 0 ? [[]] : Array.from({length: d}, (_, i) => i).flatMap(i => triar(k - 1, d).filter(r => !r.length || r[0] > i).map(r => [i].concat(r))));
  for (const fs of triar(n, N.length)) for (const cs of triar(n, N[0].length)) {
    if (fs.every((i, a) => cs.every((j, b) => N[i][j].igual(B[a][b])))) return {fs, cs};
  }
  return null;
}

/**
 * Veritat d'un guió del rang, amb el model de Gauss. Files: la matriu (els elements, i les
 * marques: un menor, amb el no nul ja trobat en verd dins seu); l'element no nul; cada menor
 * d'ordre 2 (un tros de A que conté l'element; el càlcul a·d − b·c i el valor; «≠ 0» si no
 * és 0) i cada menor d'ordre 3 (un tros de A que conté el menor d'ordre 2 no nul; els sis
 * productes de Sarrus, en ordre i amb signe; el valor); el rang (cada «≥ k» o «= k», cert).
 * I el mètode: el rang 1 només després de provar tots els menors d'ordre 2 que contenen
 * l'element; el rang 2 (amb 3 files i columnes), després de tots els d'ordre 3 que orlen.
 */
function comprovaRang(passos, v, nom) {
  const FILA = Rang.FILA;
  const N = v.A.split(';').map(f => f.split(',').map(e => M.llegeixNombre(e)));
  const [f, c] = [N.length, N[0].length];
  const r = rangGauss(N);
  let linies = 0, base1 = null, base2 = null;
  const menors2 = new Map(), menors3 = new Map();
  passos.forEach((pas, i) => pas.files.forEach((tex, fila) => {
    if (!tex) return;
    const on = `${nom}, pas ${i + 1}, fila ${fila + 1}`;
    linies++;
    try {
      const grups = grupsAmbClau(tex);
      if (fila === FILA.matriu) {
        const files = nombresDeMatriu(tex);
        comprova(files.length === f && files.every((x, a) => x.length === c && x.every((y, b) => y.igual(N[a][b]))), () => `${on}: la matriu no és A`);
        const marcats = Object.entries(grups).filter(([, g]) => g.marca).map(([k, g]) => ({i: Number(k[1]) - 1, j: Number(k[2]) - 1, marca: g.marca}));
        if (marcats.length) {
          const fs = [...new Set(marcats.map(x => x.i))].sort(), cs = [...new Set(marcats.map(x => x.j))].sort();
          const verds = marcats.filter(x => x.marca === 'mes');
          const fv = [...new Set(verds.map(x => x.i))].sort(), cv = [...new Set(verds.map(x => x.j))].sort();
          comprova(fs.length === cs.length && marcats.length === fs.length * fs.length && verds.length === fv.length * cv.length && fv.length === cv.length
            && fv.length === fs.length - (marcats.some(x => x.marca === 'tria') ? 1 : 0) && marcats.every(x => x.marca === (fv.includes(x.i) && cv.includes(x.j) ? 'mes' : 'tria'))
            && !detMenor(fv.map(a => cv.map(b => N[a][b]))).esZero(), () => `${on}: les marques ${JSON.stringify(marcats)} no són un menor orlant un menor no nul`);
        }
      } else if (fila === FILA.ordre1) {
        const m = /^a_(\d)(\d)=(-?\d+)≠0$/.exec(textPla(tex));
        comprova(m && N[m[1] - 1][m[2] - 1].igual(fr(Number(m[3]))) && !N[m[1] - 1][m[2] - 1].esZero(), () => `${on}: «${textPla(tex)}»`);
        if (m) base1 = {fs: [m[1] - 1], cs: [m[2] - 1]};
      } else if (fila === FILA.ordre2 || fila === FILA.ordre3) {
        const ordre = fila === FILA.ordre2 ? 2 : 3, P = ordre === 2 ? 'D' : 'T';
        for (let t = 0; grups[`${P}${t}m`]; t++) {
          const B = nombresDeMatriu(grups[`${P}${t}m`].tex);
          const lloc = llocDeMenor(N, B);
          const base = ordre === 2 ? base1 : base2;
          comprova(B.length === ordre && lloc && base && base.fs.every(a => lloc.fs.includes(a)) && base.cs.every(b => lloc.cs.includes(b)),
            () => `${on}: el menor ${t + 1} d'ordre ${ordre} no orla el menor no nul anterior`);
          const d = detMenor(B);
          const valor = grups[`${P}${t}v`];
          if (grups[`${P}${t}p`]) {
            const pla = textPla(grups[`${P}${t}p`].tex);
            if (ordre === 2) {
              const esperat = `${M.texEntreParentesis(B[0][0])}*${M.texEntreParentesis(B[1][1])}-${M.texEntreParentesis(B[0][1])}*${M.texEntreParentesis(B[1][0])}`;
              comprova(pla === esperat.replace(/\s/g, ''), () => `${on}: «${pla}» no és a·d − b·c`);
            } else {
              const ps = SARRUS_POS.map(s => s.slice(0, 3).reduce((p, [a, b]) => p.producte(B[a][b]), fr(1)));
              const trossos = pla.match(/^(-?\d+)\+(\(?-?\d+\)?)\+(\(?-?\d+\)?)-(\(?-?\d+\)?)-(\(?-?\d+\)?)-(\(?-?\d+\)?)$/);
              comprova(trossos && trossos.slice(1).every((x, k) => M.llegeixNombre(x.replace(/[()]/g, '')).igual(ps[k])), () => `${on}: «${pla}» no són els productes de Sarrus`);
            }
            if (valor) comprova(valorX(pla, 'x', fr(0)).igual(d), () => `${on}: «${pla}» no val ${d.num}`);
          }
          if (valor) {
            const pv = textPla(valor.tex);
            comprova(pv === `${d.num}${d.esZero() ? '' : '≠0'}`, () => `${on}: el menor val ${d.num}, i diu «${pv}»`);
            (ordre === 2 ? menors2 : menors3).set(t, d);
            if (!d.esZero() && ordre === 2) base2 = lloc;
          }
        }
      } else if (fila === FILA.resposta) {
        const m = /^«rang»\(A\)(≥|=)(\d)$/.exec(textPla(tex));
        comprova(m && (m[1] === '=' ? r === Number(m[2]) : r >= Number(m[2])), () => `${on}: «${textPla(tex)}», i el rang és ${r}`);
      }
    } catch (e) {
      comprova(false, () => `${on}: no es pot llegir «${tex.slice(0, 120)}»: ${e.message}`);
    }
  }));
  const final = passos[passos.length - 1];
  comprova(final.classes[FILA.resposta] === 'final' && textPla(final.files[FILA.resposta]) === `«rang»(A)=${r}`, () => `${nom}: la resposta final no és rang(A) = ${r}`);
  // El mètode: abans de dir «rang 1» o «rang 2», s'han provat tots els menors que orlen.
  if (r === 1) comprova(menors2.size === (f - 1) * (c - 1) && [...menors2.values()].every(d => d.esZero()), () => `${nom}: rang 1 sense provar tots els menors d'ordre 2 que orlen`);
  if (r === 2 && Math.min(f, c) === 3) comprova(menors3.size === (f - 2) * (c - 2) && [...menors3.values()].every(d => d.esZero()), () => `${nom}: rang 2 sense provar tots els menors d'ordre 3 que orlen`);
  // Cap menor no nul s'ignora: després del primer menor no nul d'un ordre, no se'n calcula cap més d'aquell ordre.
  comprova([...menors2.values()].filter(d => !d.esZero()).length <= 1 && [...menors3.values()].filter(d => !d.esZero()).length <= 1, () => `${nom}: continua després d'un menor no nul`);
  return linies;
}
const SARRUS_POS = [[[0, 0], [1, 1], [2, 2]], [[0, 1], [1, 2], [2, 0]], [[0, 2], [1, 0], [2, 1]], [[0, 2], [1, 1], [2, 0]], [[0, 0], [1, 2], [2, 1]], [[0, 1], [1, 0], [2, 2]]];

seccio('rang orlant menors', () => {
  const L = p => Rang.llegeixAdreca(p);
  for (const [p, esperat] of [[{}, '1,2,3;2,4,1;3,6,4'], [{A: '1, 2; 3, 4'}, '1,2;3,4'], [{A: '1,2,3,4;5,6,7,8;9,1,2,3'}, '1,2,3,4;5,6,7,8;9,1,2,3']]) {
    comprova(L(p).valors && L(p).valors.A === esperat, () => `Rang.llegeixAdreca(${JSON.stringify(p)}) → ${JSON.stringify(L(p))}`);
  }
  for (const [p, patro] of [
    [{A: 'm,1;1,2'}, /paràmetre/], [{A: '1,2,3'}, /2 o 3 files/], [{A: '1;2;3'}, /de 2 a 4 columnes/], [{A: '1,2,3,4,5;1,2,3,4,5'}, /de 2 a 4 columnes/],
    [{A: '1,2;3,4;5,6;7,8'}, /2 o 3 files/], [{A: '0,0;0,0'}, /el rang és 0/], [{A: '1,2;3'}, /fila 2 ha de tenir 2/], [{A: '1,2;3,10'}, /de −9 a 9/], [{A: '1,2;3,(4'}, /^No entenc/],
  ]) comprova(patro.test(L(p).error || ''), () => `Rang.llegeixAdreca(${JSON.stringify(p)}) hauria de donar ${patro}: ${JSON.stringify(L(p))}`);
  for (const v of Rang.exemples) comprova(Rang.valida(v) === null, () => `l'exemple ${v.A} no és vàlid`);
  comprova(rangGauss([[fr(1), fr(2)], [fr(2), fr(4)]]) === 1 && rangGauss([[fr(0), fr(1)], [fr(1), fr(0)]]) === 2, 'rangGauss');

  const casos = Rang.exemples.map(v => v.A);
  const atzar = aleatori(2034);
  const enter = (a, b) => a + Math.floor(atzar() * (b - a + 1));
  for (let i = 0; i < 3000; i++) {
    const f = enter(2, 3), c = enter(2, 4);
    const tipus = enter(0, 3);
    let N;
    if (tipus === 0) N = Array.from({length: f}, () => Array.from({length: c}, () => enter(-3, 3)));
    else {
      // Rang baix: combinacions de 1 o 2 files.
      const fonts = Array.from({length: tipus === 1 ? 1 : 2}, () => Array.from({length: c}, () => enter(-2, 2)));
      N = Array.from({length: f}, () => { const a = enter(-2, 2), b = enter(-1, 1); return fonts[0].map((x, j) => a * x + (fonts[1] ? b * fonts[1][j] : 0)); });
      if (atzar() < 0.3) N[enter(0, f - 1)][enter(0, c - 1)] += 1;
    }
    if (N.some(fl => fl.some(x => Math.abs(x) > 9))) continue;
    casos.push(N.map(fl => fl.join(',')).join(';'));
  }
  let valids = 0, linies = 0, passos = 0;
  const rangs = {};
  for (const text of casos) {
    const res = L({A: text});
    if (res.error) continue;
    const v = res.valors;
    valids++;
    const nom = `A = ${v.A}`;
    comprova(L(Rang.escriuAdreca(v)).valors.A === v.A, () => `${nom}: anada i tornada de l'adreça`);
    let llista;
    try {
      llista = Rang.passos(v);
    } catch (e) {
      comprova(false, () => `${nom}: passos() llança ${e.stack}`);
      continue;
    }
    comprovaGuio(llista, Rang.files, nom);
    linies += comprovaRang(llista, v, nom);
    passos += llista.length;
    const N = v.A.split(';').map(fl => fl.split(',').map(e => M.llegeixNombre(e)));
    const clau = `${N.length}×${N[0].length} rang ${rangGauss(N)}`;
    rangs[clau] = (rangs[clau] || 0) + 1;
  }
  comprova(['3×3 rang 1', '3×3 rang 2', '3×3 rang 3', '3×4 rang 2', '3×4 rang 3', '2×3 rang 1', '2×3 rang 2'].every(k => rangs[k] > 0), () => `falten tipus de casos: ${JSON.stringify(rangs)}`);
  return `${valids} matrius vàlides, ${passos} passos, ${linies} línies comprovades (${Object.keys(rangs).length} tipus de forma i rang)`;
});


/* ── 16. SISTEMA COMPATIBLE INDETERMINAT ───────────────────────────── */

const PUNTS_LAMBDA = [-2, -1, 0, 1, 2, 3].map(t => fr(t));
/** Valor d'un text pla amb x, y, z i λ (que es llegeix com «t»). */
const valorXYZ = (text, vals) => exacte(M.llegeix(text.replace(/λ/g, 't'), {variables: ['x', 'y', 'z', 't']}), {variables: vals, funcions: {}});
/** Les parts d'un text separades per comes de primer nivell (fora de parèntesis). */
function partsPerComes(text) {
  const parts = [];
  let nivell = 0, ara = '';
  for (const c of text) {
    if (c === '(') nivell++;
    if (c === ')') nivell--;
    if (c === ',' && nivell === 0) { parts.push(ara); ara = ''; } else ara += c;
  }
  return parts.concat([ara]);
}
/** Els cossos (TeX) de les vmatrix d'un TeX, en ordre. */
const cossosVmatrix = tex => [...tex.matchAll(/\\begin\{vmatrix\}(.*?)\\end\{vmatrix\}/g)].map(m => m[1].split('\\\\').map(f => f.split('&').map(c => textPla(c.trim()))));

/**
 * Veritat d'un guió de sistema compatible indeterminat. Model: el sistema llegit de les
 * dades, els rangs per Gauss, i per a cada λ la solució de les dues incògnites que no són el
 * paràmetre (Gauss sobre les tres equacions). Files: el sistema (les equacions; la que es
 * treu, en vermell, és la de fora del menor, i les altres dues tenen rang 2); A* (i les
 * marques: un menor no nul de A, i l'orla); els menors (2×2 no nul de A; |A| i el de la
 * columna b, que l'orlen, per Sarrus, 0); Rouché; el sistema 2×2 (cada equació és la seva,
 * amb el paràmetre λ); Cramer (cada expressió val el mateix que el model per a 6 valors de
 * λ, i els determinants són els de Cramer); les solucions, que compleixen les tres equacions.
 */
function comprovaSCI(passos, v, nom) {
  const FILA = SistemaSCI.FILA;
  const S = v.S.split(';').map(f => f.split(',').map(e => M.llegeixNombre(e)));
  const A = S.map(f => f.slice(0, 3));
  const VAR = ['x', 'y', 'z'];
  comprova(rangGauss(A) === 2 && rangGauss(S) === 2, () => `${nom}: el model no és de rang 2`);
  let lliure = null, fsMenor = null, csMenor = null, linies = 0;
  /** La solució del model amb la incògnita «lliure» = t: les altres dues, per Gauss. */
  const model = t => {
    const altres = [0, 1, 2].filter(j => j !== lliure);
    const B = S.map(f => [f[altres[0]], f[altres[1]], f[3].resta(f[lliure].producte(t))]);
    for (let c = 0, r = 0; c < 2; c++) {
      const p = B.findIndex((x, i) => i >= r && !x[c].esZero());
      [B[r], B[p]] = [B[p], B[r]];
      B[r] = B[r].map(x => x.quocient(B[r][c]));
      for (let i = 0; i < 3; i++) if (i !== r) { const k = B[i][c]; B[i] = B[i].map((x, j) => x.resta(B[r][j].producte(k))); }
      r++;
    }
    const sol = [];
    sol[altres[0]] = B[0][2];
    sol[altres[1]] = B[1][2];
    sol[lliure] = t;
    return sol;
  };
  const satisfa = sol => S.every(f => f[0].producte(sol[0]).suma(f[1].producte(sol[1])).suma(f[2].producte(sol[2])).igual(f[3]));
  // La incògnita lliure: la que no és a les columnes del menor 2×2 (fila de menors, clau N0m).
  for (const pas of passos) {
    const g0 = grupsAmbClau(pas.files[FILA.menors] || '');
    if (g0.N0m && fsMenor === null) {
      const B = nombresDeMatriu(g0.N0m.tex);
      const lloc = llocDeMenor(A, B);
      if (lloc) { fsMenor = lloc.fs; csMenor = lloc.cs; lliure = [0, 1, 2].find(j => !lloc.cs.includes(j)); }
    }
  }
  comprova(lliure !== null, () => `${nom}: no hi ha cap menor 2×2 de A`);
  if (lliure === null) return 0;
  passos.forEach((pas, i) => pas.files.forEach((tex, fila) => {
    if (!tex) return;
    const on = `${nom}, pas ${i + 1}, fila ${fila + 1}`;
    linies++;
    try {
      const grups = grupsAmbClau(tex);
      if (fila === FILA.sistema) {
        const marques = [];
        [1, 2, 3].forEach(k => {
          const pla = textPla(grups[`Q${k}`].tex);
          const [e, d] = pla.split('=');
          const f = S[k - 1];
          const punts = [[1, 2, 3], [0, -1, 5], [2, 0, -3], [-1, 1, 1]].map(p => p.map(x => fr(x)));
          comprova(punts.every(([x, y, z]) => valorXYZ(`(${e})-(${d})`, {x, y, z, t: fr(0)}).igual(f[0].producte(x).suma(f[1].producte(y)).suma(f[2].producte(z)).resta(f[3]))),
            () => `${on}: l'equació ${k} («${pla}») no és la del sistema`);
          marques.push(grups[`Q${k}`].marca);
        });
        if (marques.some(Boolean)) {
          const treta = marques.indexOf('menys');
          comprova(marques.filter(m => m === 'menys').length === 1 && marques.filter(m => m === 'mes').length === 2 && !fsMenor.includes(treta)
            && rangGauss(S.filter((_, k) => k !== treta)) === 2, () => `${on}: es treu una equació que no s'hauria de treure (${marques})`);
        }
      } else if (fila === FILA.matriu) {
        const m = /\\begin\{array\}\{rrr\|r\}(.*)\\end\{array\}/.exec(tex);
        const files = m[1].split('\\\\').map(f => f.split('&').map(c => M.llegeixNombre(textPla(c.trim()))));
        comprova(files.length === 3 && files.every((f, a) => f.length === 4 && f.every((c, b) => c.igual(S[a][b]))), () => `${on}: la matriu no és A*`);
        const marcats = Object.entries(grups).filter(([, g]) => g.marca).map(([k, g]) => ({i: Number(k[1]) - 1, j: Number(k[2]) - 1, marca: g.marca}));
        if (marcats.length) {
          const verds = marcats.filter(x => x.marca === 'mes');
          const fv = [...new Set(verds.map(x => x.i))].sort(), cv = [...new Set(verds.map(x => x.j))].sort();
          comprova(verds.length === 4 && fv.length === 2 && cv.length === 2 && cv.every(j => j < 3) && !detMenor(fv.map(a => cv.map(b => S[a][b]))).esZero(),
            () => `${on}: les marques verdes no són un menor no nul de A`);
          const grocs = marcats.filter(x => x.marca === 'tria');
          if (grocs.length) {
            const fila3 = [0, 1, 2].find(a => !fv.includes(a));
            const col = grocs.map(x => x.j).find(j => !cv.includes(j));
            comprova(grocs.length === 5 && grocs.every(x => (x.i === fila3 && (cv.includes(x.j) || x.j === col)) || (x.j === col && fv.includes(x.i))), () => `${on}: les marques grogues no orlen el menor`);
          }
        }
      } else if (fila === FILA.menors) {
        for (let t = 0; grups[`N${t}m`]; t++) {
          const B = nombresDeMatriu(grups[`N${t}m`].tex);
          const lloc = llocDeMenor(S, B);
          const d = detMenor(B);
          if (t === 0) {
            comprova(B.length === 2 && lloc && lloc.cs.every(j => j < 3) && !d.esZero(), () => `${on}: el primer menor no és un menor 2×2 no nul de A`);
          } else {
            comprova(B.length === 3 && llocsDeMenor(S, B).some(l => fsMenor.every(a => l.fs.includes(a)) && csMenor.every(b => l.cs.includes(b))), () => `${on}: el menor ${t + 1} no orla el menor no nul`);
            comprova(d.esZero(), () => `${on}: el menor ${t + 1} hauria de valer 0`);
            if (grups[`N${t}n`]) comprova(textPla(grups[`N${t}n`].tex) === '|A|' && llocsDeMenor(S, B).some(l => l.cs.join() === '0,1,2'), () => `${on}: «|A|» no és A`);
            if (grups[`N${t}p`]) {
              const ps = SARRUS_POS.map(s => s.reduce((p, [a, b]) => p.producte(B[a][b]), fr(1)));
              const pla = textPla(grups[`N${t}p`].tex);
              const trossos = pla.match(/^(-?\d+)\+(\(?-?\d+\)?)\+(\(?-?\d+\)?)-(\(?-?\d+\)?)-(\(?-?\d+\)?)-(\(?-?\d+\)?)$/);
              comprova(trossos && trossos.slice(1).every((x, k) => M.llegeixNombre(x.replace(/[()]/g, '')).igual(ps[k])), () => `${on}: «${pla}» no són els productes de Sarrus`);
            }
          }
          if (grups[`N${t}v`]) comprova(textPla(grups[`N${t}v`].tex) === `${d.num}${d.esZero() ? '' : '≠0'}`, () => `${on}: el menor ${t + 1} val ${d.num}`);
        }
      } else if (fila === FILA.rouche) {
        comprova(textPla(tex) === '«rang»(A)=«rang»(A^(*))=2<3', () => `${on}: «${textPla(tex)}»`);
      } else if (fila === FILA.reduit) {
        const eqs = [0, 1].map(k => Object.keys(grups).filter(c => c.startsWith(`G${k}`)));
        const cos = /\\begin\{array\}\{l\}(.*)\\end\{array\}/.exec(tex)[1].split('\\\\').map(l => textPla(l.trim()));
        comprova(cos.length === 2 && eqs.every(e => e.length), () => `${on}: el sistema 2×2 no té 2 equacions`);
        cos.forEach((pla, k) => {
          const [e, d] = pla.split('=');
          const f = S[fsMenor[k]];
          comprova(!pla.includes(VAR[lliure]), () => `${on}: «${pla}» encara té ${VAR[lliure]}`);
          const punts = [[1, 2, 3, -1], [0, -1, 5, 2], [2, 0, -3, 1], [-1, 1, 1, 0], [3, 1, 2, 4]].map(p => p.map(x => fr(x)));
          comprova(punts.every(([x, y, z, t]) => {
            const vals = {x, y, z, t};
            const sol = [x, y, z];
            sol[lliure] = t;
            return valorXYZ(`(${e})-(${d})`, vals).igual(f[0].producte(sol[0]).suma(f[1].producte(sol[1])).suma(f[2].producte(sol[2])).resta(f[3]));
          }), () => `${on}: «${pla}» no és l'equació ${fsMenor[k] + 1} amb ${VAR[lliure]} = λ`);
        });
      } else if (fila === FILA.cramer) {
        for (const j of [0, 1, 2]) {
          if (!grups[`X${VAR[j]}l`]) continue;
          comprova(j !== lliure, () => `${on}: Cramer per a la incògnita lliure`);
          const valors = ['a', 'b', 'c', 'r'].filter(k => grups[`X${VAR[j]}${k}`]);
          for (const k of valors) {
            const g = grups[`X${VAR[j]}${k}`];
            if (k === 'a') {
              const [N, Dm] = cossosVmatrix(g.tex);
              comprova(Dm && Dm.length === 2 && Dm.every((f, a) => f.every((c, b) => M.llegeixNombre(c).igual(S[fsMenor[a]][csMenor[b]]))), () => `${on}: el denominador de Cramer no és el menor`);
              const col = csMenor.indexOf(j);
              comprova(N && N.length === 2 && N.every((f, a) => f.every((c, b) => PUNTS_LAMBDA.every(t => valorXYZ(c, {x: fr(0), y: fr(0), z: fr(0), t})
                .igual(b === col ? S[fsMenor[a]][3].resta(S[fsMenor[a]][lliure].producte(t)) : S[fsMenor[a]][csMenor[b]])))),
                () => `${on}: el numerador de Cramer per a ${VAR[j]} no és el menor amb la columna dels termes independents`);
            } else {
              const pla = textPla(g.tex);
              comprova(PUNTS_LAMBDA.every(t => valorXYZ(pla, {x: fr(0), y: fr(0), z: fr(0), t}).igual(model(t)[j])), () => `${on}: «${pla}» no és ${VAR[j]}`);
            }
          }
        }
      } else if (fila === FILA.solucio) {
        const pla = tex.startsWith('\\begin{array}') ? liniesDArray(tex).join('') : textPla(tex);
        const m = /^\(x,y,z\)=\((.*)\),λ∈ℝ$/.exec(pla);
        comprova(m, () => `${on}: «${pla}»`);
        if (m) {
          const comps = partsPerComes(m[1]);
          comprova(comps.length === 3 && comps[lliure] === 'λ', () => `${on}: la incògnita lliure, ${VAR[lliure]}, no és λ`);
          comprova(PUNTS_LAMBDA.every(t => { const sol = comps.map(c => valorXYZ(c, {x: fr(0), y: fr(0), z: fr(0), t})); return satisfa(sol) && sol.every((x, j) => x.igual(model(t)[j])); }),
            () => `${on}: les solucions no compleixen el sistema`);
        }
      }
    } catch (e) {
      comprova(false, () => `${on}: no es pot llegir «${tex.slice(0, 120)}»: ${e.message}`);
    }
  }));
  const final = passos[passos.length - 1];
  comprova(final.classes[FILA.solucio] === 'final', () => `${nom}: la resposta no està destacada`);
  const ex = /amb \$\\lambda = 1\$, \$\((.*)\)\$\.$/.exec(final.text);
  const exemple = ex && partsPerComes(textPla(ex[1])).map(c => exacte(M.llegeix(c, {variables: []}), {variables: {}, funcions: {}}));
  comprova(exemple && satisfa(exemple) && exemple.every((x, j) => x.igual(model(fr(1))[j])), () => `${nom}: la solució d'exemple del text no és la de λ = 1`);
  // Els menors d'ordre 3: un és |A| i l'altre té la columna dels termes independents (els dos que orlen dins de A*).
  const menors = grupsAmbClau(final.files[FILA.menors]);
  // (Si dues columnes són iguals, un menor pot ser a més d'un lloc: n'hi ha prou que algun lloc ho compleixi.)
  const llocs = [1, 2].map(t => (menors[`N${t}m`] ? llocsDeMenor(S, nombresDeMatriu(menors[`N${t}m`].tex)).map(l => l.cs.join()) : []));
  comprova([[0, 1], [1, 0]].some(([p, q]) => llocs[p].includes('0,1,2') && llocs[q].some(c => c.split(',').includes('3'))),
    () => `${nom}: no s'orla amb la columna de A i amb la dels termes independents (${JSON.stringify(llocs)})`);
  return linies;
}

seccio('sistema compatible indeterminat', () => {
  const L = p => SistemaSCI.llegeixAdreca(p);
  comprova(L({}).valors.S === '1,1,1,2;1,-1,2,1;2,0,3,3' && L({S: ' 1,1,0,1 ; 0,1,1,2 ; 1,2,1,3'}).valors.S === '1,1,0,1;0,1,1,2;1,2,1,3', 'SistemaSCI.llegeixAdreca');
  for (const [p, patro] of [
    [{S: '1,0,0,1;0,1,0,2;0,0,1,3'}, /compatible determinat/], [{S: '1,1,1,1;1,1,1,2;0,1,0,1'}, /incompatible/], [{S: '1,1,1,1;2,2,2,2;3,3,3,3'}, /dos paràmetres/],
    [{S: '1,1,1;1,1,1;1,1,1'}, /ha de tenir 4/], [{S: '1,1,1,m;1,1,1,1;1,1,1,1'}, /paràmetre/], [{S: '1,1,1,1;2,2,2,2'}, /3 files/], [{S: '1,1,1,(1;1,1,1,1;1,1,1,1'}, /^No entenc/],
  ]) comprova(patro.test(L(p).error || ''), () => `SistemaSCI.llegeixAdreca(${JSON.stringify(p)}) hauria de donar ${patro}: ${JSON.stringify(L(p))}`);
  for (const v of SistemaSCI.exemples) comprova(SistemaSCI.valida(v) === null, () => `l'exemple ${v.S} no és vàlid: ${SistemaSCI.valida(v)}`);

  const casos = SistemaSCI.exemples.map(v => v.S);
  const atzar = aleatori(2035);
  const enter = (a, b) => a + Math.floor(atzar() * (b - a + 1));
  for (let i = 0; i < 1600; i++) {
    // Dues equacions a l'atzar i una combinació seva (en un ordre a l'atzar).
    const e1 = Array.from({length: 4}, () => enter(-3, 3)), e2 = Array.from({length: 4}, () => enter(-3, 3));
    const [a, b] = [enter(-2, 2), enter(-2, 2)];
    const e3 = e1.map((x, j) => a * x + b * e2[j]);
    const files = [e1, e2, e3];
    const p = enter(0, 2);
    [files[p], files[2]] = [files[2], files[p]];
    if (files.some(f => f.some(x => Math.abs(x) > 9))) continue;
    casos.push(files.map(f => f.join(',')).join(';'));
  }
  let valids = 0, linies = 0, passos = 0;
  const lliures = {};
  for (const text of casos) {
    const r = L({S: text});
    if (r.error) continue;
    const v = r.valors;
    valids++;
    const nom = `S = ${v.S}`;
    comprova(L(SistemaSCI.escriuAdreca(v)).valors.S === v.S, () => `${nom}: anada i tornada de l'adreça`);
    let llista;
    try {
      llista = SistemaSCI.passos(v);
    } catch (e) {
      comprova(false, () => `${nom}: passos() llança ${e.stack}`);
      continue;
    }
    comprovaGuio(llista, SistemaSCI.files, nom);
    linies += comprovaSCI(llista, v, nom);
    passos += llista.length;
    const sol = textPla(llista[llista.length - 1].files[SistemaSCI.FILA.solucio].replace(/\\begin\{array\}\{l\}|\\end\{array\}|\\\\\[4pt\]|\\qquad/g, ''));
    const k = sol.includes('(λ,') ? 'x' : sol.includes(',λ)') ? 'z' : 'y';
    lliures[k] = (lliures[k] || 0) + 1;
  }
  comprova(['x', 'y', 'z'].every(k => lliures[k] > 0), () => `falten casos amb cada incògnita lliure: ${JSON.stringify(lliures)}`);
  return `${valids} sistemes vàlids, ${passos} passos, ${linies} línies comprovades (λ = ${Object.entries(lliures).map(([k, n]) => `${k}: ${n}`).join(', ')})`;
});


/* ── 17. DISCUSSIÓ D'UN SISTEMA AMB UN PARÀMETRE ───────────────────── */

/**
 * Veritat d'un guió de discussió. El determinant i |A| = 0 es comproven com a la pàgina del
 * determinant (comprovaDeterminant, amb les files i el prefix d'aquí). Model: S llegit de les
 * dades; per a cada valor, els rangs de A i A* per Gauss. Files: el sistema (cada equació, a
 * diversos valors del paràmetre); A*; el cas |A| ≠ 0 (exactament fora de les arrels de |A|);
 * cada cas |A| = 0 (A* amb el valor; els menors, trossos de A* amb el valor que diuen; els
 * rangs, certs; les marques); la taula (els rangs i el tipus de cada fila, certs, i hi són tots
 * els casos).
 */
function comprovaDiscussio(passos, v, nom) {
  const FILA = Discussio.FILA;
  const X = (v.S.match(/[a-z]/) || [])[0];
  const S = v.S.split(';').map(f => f.split(',').map(e => M.llegeix(e, {variables: [X]})));
  const numeric = t => S.map(f => f.map(e => exacte(e, {variables: {[X]: t}, funcions: {}})));
  const tipus = (rA, rS) => (rA < rS ? 'SI' : rA === 3 ? 'SCD' : 'SCI');
  const {linies: ld, solucionsDet} = comprovaDeterminant(passos, v, nom, {
    FILA: {matriu: FILA.det, sarrus: FILA.sarrus, calcul: FILA.calcul, equacio: FILA.equacio, prova: FILA.prova, ruffini: FILA.ruffini, segon: FILA.segon},
    P: 'd', X, A: v.S.split(';').map(f => f.split(',').slice(0, 3).join(',')).join(';'), rapid: true, nomesDet: true,
  });
  const arrels = solucionsDet ? solucionsDet.split(',').map(x => M.llegeixNombre(x)) : [];
  let linies = ld;
  const casosVistos = new Set();
  passos.forEach((pas, i) => pas.files.forEach((tex, fila) => {
    if (!tex || ![FILA.sistema, FILA.matriu, FILA.scd, FILA.cas, FILA.taula].includes(fila)) return;
    const on = `${nom}, pas ${i + 1}, fila ${fila + 1}`;
    linies++;
    try {
      const grups = grupsAmbClau(tex);
      if (fila === FILA.sistema) {
        [1, 2, 3].forEach(k => {
          const [e, d] = textPla(grups[`Y${k}`].tex).split('=');
          comprova(PUNTS_DET.slice(1, 6).every(t => {
            const f = numeric(t)[k - 1];
            return [[1, 2, 3], [0, -1, 5], [2, 0, -3], [-1, 1, 1]].map(p => p.map(x => fr(x))).every(([x, y, z]) =>
              exacte(M.llegeix(`(${e})-(${d})`.replace(new RegExp(X, 'g'), `(${t.num}/${t.den})`), {variables: ['x', 'y', 'z']}), {variables: {x, y, z}, funcions: {}})
                .igual(f[0].producte(x).suma(f[1].producte(y)).suma(f[2].producte(z)).resta(f[3])));
          }), () => `${on}: l'equació ${k} no és la del sistema`);
        });
      } else if (fila === FILA.matriu) {
        const m = /\\begin\{array\}\{rrr\|r\}(.*)\\end\{array\}/.exec(tex);
        const cel = m[1].split('\\\\').map(f => f.split('&').map(c => textPla(c.trim())));
        comprova(cel.length === 3 && cel.every((f, a) => f.length === 4 && f.every((c, b) => PUNTS_DET.every(t => valorX(c, X, t).igual(numeric(t)[a][b])))),
          () => `${on}: la matriu no és A*`);
      } else if (fila === FILA.scd) {
        const pla = textPla(tex);
        const m = new RegExp(`^${X}≠(.*):\\|A\\|≠0⇒«rang»\\(A\\)=«rang»\\(A\\^\\(\\*\\)\\)=3$`).exec(pla);
        const tot = pla === `«tot»${X}:|A|≠0⇒«rang»(A)=«rang»(A^(*))=3`;
        comprova(m ? conjunt(m[1].split(',').map(x => M.llegeixNombre(x))) === solucionsDet : tot && solucionsDet === '', () => `${on}: «${pla}» (|A| = 0 per a ${solucionsDet})`);
      } else if (fila === FILA.cas) {
        const c = Object.keys(grups).map(k => /^K(\d+)n$/.exec(k)).filter(Boolean).map(x => x[1])[0];
        const P = `K${c}`;
        const r = M.llegeixNombre(textPla(grups[`${P}n`].tex).split('=')[1]);
        comprova(arrels.some(a => a.igual(r)), () => `${on}: ${X} = ${r.num} no anul·la |A|`);
        casosVistos.add(r.num);
        const N = numeric(r), A = N.map(f => f.slice(0, 3));
        const [rA, rS] = [rangGauss(A), rangGauss(N)];
        const matriu = /\\begin\{array\}\{rrr\|r\}(.*?)\\end\{array\}/.exec(tex)[1].split('\\\\').map(f => f.split('&').map(x => textPla(x.trim())));
        comprova(matriu.every((f, a) => f.every((x, b) => M.llegeixNombre(x).igual(N[a][b]))), () => `${on}: A* amb ${X} = ${r.num} no és aquesta`);
        // Els menors i els rangs.
        if (grups[`${P}m`]) {
          const t = textPla(grups[`${P}m`].tex);
          if (t.startsWith('«')) comprova(rA === 1, () => `${on}: les files de A no són proporcionals`);
          else {
            const B = nombresDeMatriu(grups[`${P}m`].tex);
            comprova(llocsDeMenor(A, B).length && !detMenor(B).esZero() && textPla(grups[`${P}p`].tex) === `${M.texEntreParentesis(B[0][0])}*${M.texEntreParentesis(B[1][1])}-${M.texEntreParentesis(B[0][1])}*${M.texEntreParentesis(B[1][0])}`.replace(/\s/g, '')
              && textPla(grups[`${P}v`].tex) === `${detMenor(B).num}≠0`, () => `${on}: el menor d'ordre 2 de A no és correcte`);
          }
          comprova(textPla(grups[`${P}r`].tex) === `«rang»(A)=${rA}`, () => `${on}: rang(A) = ${rA}`);
        }
        if (grups[`${P}M`]) {
          const t = textPla(grups[`${P}M`].tex);
          if (t.startsWith('«')) comprova(rS === 1, () => `${on}: les files de A* no són proporcionals`);
          else {
            const B = nombresDeMatriu(grups[`${P}M`].tex);
            const llocs = llocsDeMenor(N, B);
            const d = detMenor(B);
            comprova(llocs.some(l => l.cs.includes(3)) && textPla(grups[`${P}V`].tex) === `${d.num}${d.esZero() ? '' : '≠0'}`, () => `${on}: el menor de A* (amb els termes independents) no és correcte`);
            if (B.length === 3) {
              const ps = SARRUS_POS.map(s_ => s_.reduce((p, [a, b]) => p.producte(B[a][b]), fr(1)));
              const pla = textPla(grups[`${P}P`].tex);
              const tr = pla.match(/^(-?\d+)\+(\(?-?\d+\)?)\+(\(?-?\d+\)?)-(\(?-?\d+\)?)-(\(?-?\d+\)?)-(\(?-?\d+\)?)$/);
              comprova(tr && tr.slice(1).every((x, k) => M.llegeixNombre(x.replace(/[()]/g, '')).igual(ps[k])), () => `${on}: «${pla}» no són els productes de Sarrus`);
              comprova(rA !== 2 || d.esZero() === (rS === 2), () => `${on}: aquest menor no decideix el rang de A*`);
            }
          }
          comprova(textPla(grups[`${P}R`].tex) === `«rang»(A^(*))=${rS}`, () => `${on}: rang(A*) = ${rS}`);
        }
        // Marques: verd, un menor no nul de A; groc, l'orla.
        const marcats = Object.entries(grups).filter(([k, g]) => g.marca && k.startsWith(`${P}a`)).map(([k, g]) => ({i: Number(k.slice(-2, -1)) - 1, j: Number(k.slice(-1)) - 1, marca: g.marca}));
        const verds = marcats.filter(x => x.marca === 'mes');
        if (verds.length) {
          const fv = [...new Set(verds.map(x => x.i))].sort(), cv = [...new Set(verds.map(x => x.j))].sort();
          comprova(verds.length === fv.length * cv.length && fv.length === cv.length && cv.every(j => j < 3) && !detMenor(fv.map(a => cv.map(b => N[a][b]))).esZero(),
            () => `${on}: les marques verdes no són un menor no nul de A`);
        }
      } else if (fila === FILA.taula) {
        const cos = /\\begin\{array\}\{c\|c\|c\|c\}(.*)\\end\{array\}/.exec(tex)[1].split('\\\\').map(f => f.replace('\\hline', '').split('&').map(x => textPla(x.trim())));
        comprova(cos[0].join('|') === `${X}|«rang»(A)|«rang»(A^(*))|«tipus»`, () => `${on}: la capçalera de la taula`);
        cos.slice(1).forEach(([valor, a, b, t], n) => {
          if (n === 0) {
            comprova(a === '3' && b === '3' && t === '«SCD»' && (valor === `«tot»${X}` ? solucionsDet === '' : conjunt(valor.replace(`${X}≠`, '').split(',').map(x => M.llegeixNombre(x))) === solucionsDet),
              () => `${on}: la fila de |A| ≠ 0 de la taula`);
          } else {
            const r = M.llegeixNombre(valor.split('=')[1]);
            const N = numeric(r);
            const [rA, rS] = [rangGauss(N.map(f => f.slice(0, 3))), rangGauss(N)];
            comprova(arrels.some(x => x.igual(r)) && a === String(rA) && b === String(rS) && t === `«${tipus(rA, rS)}»`, () => `${on}: la fila de ${valor}: és ${rA}, ${rS}, ${tipus(rA, rS)}`);
          }
        });
      }
    } catch (e) {
      comprova(false, () => `${on}: no es pot llegir «${tex.slice(0, 120)}»: ${e.message}`);
    }
  }));
  const final = passos[passos.length - 1];
  comprova(final.classes[FILA.taula] === 'final', () => `${nom}: la taula no està destacada`);
  const filesTaula = (final.files[FILA.taula].match(/\\hline/g) || []).length;
  comprova(filesTaula === 1 + arrels.length && casosVistos.size === arrels.length, () => `${nom}: la taula no té tots els casos (${arrels.length} valors)`);
  return linies;
}

seccio('discussió de sistemes', () => {
  const L = p => Discussio.llegeixAdreca(p);
  comprova(L({}).valors.S === '1,m,m,-1;-1,1,1,1;2,1,m,2' && L({S: 'k,1,1,1;1,k,1,1;1,1,k,1'}).valors.S === 'k,1,1,1;1,k,1,1;1,1,k,1', 'Discussio.llegeixAdreca');
  for (const [p, patro] of [
    [{S: '1,1,1,1;1,2,1,1;1,1,3,1'}, /paràmetre/], [{S: '1,1,m,1;1,1,1,1;2,2,1,0'}, /no depèn/],
    [{S: 'm,1,0,1;1,m,1,1;0,1,m,1'}, /enters/], [{S: '2m,1,0,1;1,1,0,1;0,0,1,1'}, /enters/], [{S: 'm,1,1;1,m,1;1,1,m'}, /ha de tenir 4/], [{S: 'm,1,1,(1;1,m,1,1;1,1,m,1'}, /^No entenc/],
  ]) comprova(patro.test(L(p).error || ''), () => `Discussio.llegeixAdreca(${JSON.stringify(p)}) hauria de donar ${patro}: ${JSON.stringify(L(p))}`);
  for (const v of Discussio.exemples) comprova(Discussio.valida(v) === null, () => `l'exemple ${v.S} no és vàlid: ${Discussio.valida(v)}`);

  const casos = Discussio.exemples.map(v => v.S);
  const atzar = aleatori(2036);
  const E = ['m', 'm+1', 'm-1', '1', '1', '2', '-1', '0', '1', '3', '-2', '2m', '-m'], B = ['1', '2', '0', 'm', 'm+1', '3', '-1', '1', 'm-1'];
  const tria = a => a[Math.floor(atzar() * a.length)];
  for (let i = 0; i < 6000 && casos.length < 600; i++) {
    const t = Array.from({length: 3}, () => [tria(E), tria(E), tria(E), tria(B)].join(',')).join(';');
    if (!/m/.test(t)) continue;
    if (!L({S: t}).error) casos.push(t);
  }
  let valids = 0, linies = 0, passos = 0;
  const tipusVistos = {};
  for (const text of casos) {
    const r = L({S: text});
    if (r.error) continue;
    const v = r.valors;
    valids++;
    const nom = `S = ${v.S}`;
    comprova(L(Discussio.escriuAdreca(v)).valors.S === v.S, () => `${nom}: anada i tornada de l'adreça`);
    let llista;
    try {
      llista = Discussio.passos(v);
    } catch (e) {
      comprova(false, () => `${nom}: passos() llança ${e.stack}`);
      continue;
    }
    comprovaGuio(llista, Discussio.files, nom);
    linies += comprovaDiscussio(llista, v, nom);
    passos += llista.length;
    for (const m of llista[llista.length - 1].files[Discussio.FILA.taula].matchAll(/\{(\d)\}\\mathrel|\\text\{(S[A-Z]+)\}/g)) if (m[2]) tipusVistos[m[2]] = true;
    const t = llista[llista.length - 1].files[Discussio.FILA.taula];
    if (/\{1\}.*\{1\}.*SCI/.test(t)) tipusVistos['SCI rang 1'] = true;
  }
  comprova(['SCD', 'SCI', 'SI'].every(k => tipusVistos[k]), () => `falten tipus: ${JSON.stringify(tipusVistos)}`);
  return `${valids} sistemes vàlids, ${passos} passos, ${linies} línies comprovades`;
});


/* ── 18. MATRIU INVERSA 3×3 (ADJUNTS) ──────────────────────────────── */

/** Inversa per Gauss-Jordan (el model). */
function inversaGauss(N) {
  const B = N.map((f, i) => f.concat([0, 1, 2].map(j => fr(i === j ? 1 : 0))));
  for (let c = 0; c < 3; c++) {
    const p = B.findIndex((x, i) => i >= c && !x[c].esZero());
    [B[c], B[p]] = [B[p], B[c]];
    B[c] = B[c].map(x => x.quocient(B[c][c]));
    for (let i = 0; i < 3; i++) if (i !== c) { const k = B[i][c]; B[i] = B[i].map((x, j) => x.resta(B[c][j].producte(k))); }
  }
  return B.map(f => f.slice(3));
}
/** Les cel·les (TeX) de cada pmatrix d'un TeX, en ordre. */
const cossosPmatrix = tex => [...tex.matchAll(/\\begin\{pmatrix\}(.*?)\\end\{pmatrix\}/g)].map(m => m[1].split('\\\\').map(f => f.replace(/^\s*\[[^\]]*\]/, '').split('&').map(c => c.trim())));

/**
 * Veritat d'un guió de la inversa. Model: A llegida de les dades, |A| per la primera fila i la
 * inversa per Gauss-Jordan. Files: A i les marques (la fila i la columna de l'adjunt que es
 * calcula, en vermell; el menor, en verd); |A| (productes de Sarrus i valor); cada adjunt (el
 * menor que toca, el signe del tauler, el càlcul i el valor); la matriu adjunta (cada element
 * al seu lloc, i després transposada); la inversa (1/|A|, la transposada i la inversa del
 * model); la comprovació.
 */
function comprovaInversa(passos, v, nom) {
  const FILA = Inversa.FILA;
  const N = v.A.split(';').map(f => f.split(',').map(e => M.llegeixNombre(e)));
  const d = detLaplace(N);
  const inv = inversaGauss(N);
  const cof = (i, j) => { const B = [0, 1, 2].filter(a => a !== i).map(a => [0, 1, 2].filter(b => b !== j).map(b => N[a][b])); const m = detMenor(B); return {B, valor: (i + j) % 2 ? m.oposada() : m}; };
  let linies = 0, adjuntsVistos = 0;
  passos.forEach((pas, i) => pas.files.forEach((tex, fila) => {
    if (!tex) return;
    const on = `${nom}, pas ${i + 1}, fila ${fila + 1}`;
    linies++;
    try {
      const grups = grupsAmbClau(tex);
      if (fila === FILA.matriu) {
        const files = nombresDeMatriu(tex);
        comprova(files.every((f, a) => f.every((c, b) => c.igual(N[a][b]))), () => `${on}: la matriu no és A`);
        const marcats = Object.entries(grups).filter(([, g]) => g.marca).map(([k, g]) => ({i: Number(k[1]) - 1, j: Number(k[2]) - 1, marca: g.marca}));
        if (marcats.length) {
          const adj = /^A_(\d)(\d)$/.exec(textPla((grupsAmbClau(pas.files[FILA.adjunt] || '').Jl || {tex: ''}).tex));
          const [ai, aj] = adj ? [adj[1] - 1, adj[2] - 1] : [-1, -1];
          comprova(marcats.length === 9 && marcats.every(x => x.marca === (x.i === ai || x.j === aj ? 'menys' : 'mes')), () => `${on}: les marques no són les de l'adjunt A_${ai + 1}${aj + 1}`);
        }
      } else if (fila === FILA.det) {
        const pla = tex.startsWith('\\begin{array}') ? liniesDArray(tex).join('') : textPla(tex);
        const m = /^\|A\|=(.*)=(-?\d+)≠0$/.exec(pla);
        const ps = SARRUS_POS.map(s => s.reduce((p, [a, b]) => p.producte(N[a][b]), fr(1)));
        const tr = m && m[1].match(/^(-?\d+)\+(\(?-?\d+\)?)\+(\(?-?\d+\)?)-(\(?-?\d+\)?)-(\(?-?\d+\)?)-(\(?-?\d+\)?)$/);
        comprova(tr && tr.slice(1).every((x, k) => M.llegeixNombre(x.replace(/[()]/g, '')).igual(ps[k])) && fr(Number(m[2])).igual(d) && !d.esZero(), () => `${on}: «${pla}», i |A| = ${d.num}`);
      } else if (fila === FILA.adjunt) {
        const [a, b] = /^A_(\d)(\d)$/.exec(textPla(grups.Jl.tex)).slice(1).map(x => Number(x) - 1);
        const {B, valor} = cof(a, b);
        const signe = (a + b) % 2 ? '-' : '+';
        const Bt = nombresDeMatriu(grups.Jm.tex);
        comprova(textPla(grups.Js.tex) === signe && Bt.every((f, x) => f.every((c, y) => c.igual(B[x][y]))), () => `${on}: el menor o el signe de A_${a + 1}${b + 1} no són correctes`);
        const esperat = `${signe}(${M.texEntreParentesis(B[0][0])}*${M.texEntreParentesis(B[1][1])}-${M.texEntreParentesis(B[0][1])}*${M.texEntreParentesis(B[1][0])})`;
        comprova(textPla(grups.Jp.tex) === esperat.replace(/\s/g, '') && M.llegeixNombre(textPla(grups.Jv.tex)).igual(valor), () => `${on}: A_${a + 1}${b + 1} = ${valor.num}`);
        adjuntsVistos++;
      } else if (fila === FILA.adjunta) {
        const transposada = textPla(grups.Jn.tex).endsWith('^(t)');
        const cel = cossosPmatrix(tex)[0];
        cel.forEach((f, x) => f.forEach((c, y) => {
          const k = /\\htmlData\{k=C(\d)(\d)\}/.exec(c);
          if (!k) { comprova(!transposada && c.includes('phantom'), () => `${on}: hi falta l'element ${x + 1}, ${y + 1}`); return; }
          const [a, b] = [Number(k[1]), Number(k[2])];
          comprova((transposada ? a === y && b === x : a === x && b === y) && M.llegeixNombre(textPla(c)).igual(cof(a, b).valor),
            () => `${on}: l'element ${x + 1}, ${y + 1} de la ${transposada ? 'transposada' : 'adjunta'} no és correcte`);
        }));
      } else if (fila === FILA.inversa) {
        const mats = cossosPmatrix(tex).map(m => m.map(f => f.map(c => exacte(M.llegeix(textPla(c), {variables: []}), {variables: {}, funcions: {}}))));
        const ultima = mats[mats.length - 1];
        comprova(ultima.every((f, a) => f.every((c, b) => c.igual(inv[a][b]))), () => `${on}: la inversa no és correcta`);
        if (mats.length === 2) {
          comprova(mats[0].every((f, a) => f.every((c, b) => c.igual(cof(b, a).valor))) && exacte(M.llegeix(textPla(grups.Iu.tex), {variables: []}), {variables: {}, funcions: {}}).igual(fr(1).quocient(d)),
            () => `${on}: 1/|A| per la transposada de l'adjunta no és correcte`);
        } else comprova(d.igual(1), () => `${on}: sense 1/|A| només si |A| = 1`);
      } else if (fila === FILA.comprovacio) {
        comprova(textPla(tex).replace(/\\begin|\\end/g, '') === 'A*A^(-1)=1&0&0;0&1&0;0&0&1=I'
          && [0, 1, 2].every(a => [0, 1, 2].every(b => [0, 1, 2].reduce((s, k) => s.suma(N[a][k].producte(inv[k][b])), fr(0)).igual(fr(a === b ? 1 : 0)))), () => `${on}: «${textPla(tex)}»`);
      }
    } catch (e) {
      comprova(false, () => `${on}: no es pot llegir «${tex.slice(0, 120)}»: ${e.message}`);
    }
  }));
  const final = passos[passos.length - 1];
  comprova(adjuntsVistos === 9 && final.classes[FILA.inversa] === 'final', () => `${nom}: no es calculen els 9 adjunts, o la inversa no està destacada`);
  comprova(textPla(grupsAmbClau(final.files[FILA.adjunta]).Jn.tex).endsWith('^(t)'), () => `${nom}: l'adjunta no s'ha transposat`);
  return linies;
}

seccio('inversa per adjunts', () => {
  const L = p => Inversa.llegeixAdreca(p);
  comprova(L({}).valors.A === '1,0,1;0,1,1;1,1,1' && L({A: '2, 1, 0; 1, 1, 1; 0, 1, 3'}).valors.A === '2,1,0;1,1,1;0,1,3', 'Inversa.llegeixAdreca');
  for (const [p, patro] of [
    [{A: '1,2,3;4,5,6;7,8,9'}, /no té inversa/], [{A: 'm,1,1;1,m,1;1,1,m'}, /paràmetre/], [{A: '1,2;3,4'}, /3 files/], [{A: '1,2,3;4,5,6;7,8,(9'}, /^No entenc/],
  ]) comprova(patro.test(L(p).error || ''), () => `Inversa.llegeixAdreca(${JSON.stringify(p)}) hauria de donar ${patro}: ${JSON.stringify(L(p))}`);
  for (const v of Inversa.exemples) comprova(Inversa.valida(v) === null, () => `l'exemple ${v.A} no és vàlid`);
  comprova(inversaGauss([[fr(2), fr(0), fr(0)], [fr(0), fr(1), fr(0)], [fr(0), fr(0), fr(4)]]).every((f, i) => f.every((c, j) => c.igual(i !== j ? fr(0) : [fr(1, 2), fr(1), fr(1, 4)][i]))), 'inversaGauss');

  const casos = Inversa.exemples.map(v => v.A);
  const atzar = aleatori(2037);
  const enter = (a, b) => a + Math.floor(atzar() * (b - a + 1));
  for (let i = 0; i < 800; i++) casos.push(Array.from({length: 3}, () => Array.from({length: 3}, () => enter(-3, 4)).join(',')).join(';'));
  let valids = 0, linies = 0, passos = 0, unitat = 0, fraccions = 0;
  for (const text of casos) {
    const r = L({A: text});
    if (r.error) continue;
    const v = r.valors;
    valids++;
    const nom = `A = ${v.A}`;
    comprova(L(Inversa.escriuAdreca(v)).valors.A === v.A, () => `${nom}: anada i tornada de l'adreça`);
    const llista = Inversa.passos(v);
    comprovaGuio(llista, Inversa.files, nom);
    linies += comprovaInversa(llista, v, nom);
    passos += llista.length;
    const fin = llista[llista.length - 1].files[Inversa.FILA.inversa];
    if (!fin.includes('dfrac')) unitat++;
    if (/\\frac/.test(fin)) fraccions++;
  }
  comprova(unitat > 0 && fraccions > 0, 'falten casos amb |A| = 1 o amb fraccions');
  return `${valids} matrius invertibles, ${passos} passos, ${linies} línies comprovades (${unitat} amb |A| = 1, ${fraccions} amb fraccions)`;
});


/* ── 19. EQUACIÓ MATRICIAL ─────────────────────────────────────────── */

/*
 * Un petit avaluador d'expressions de matrius 2×2 (el model): lletres (A, B, C, X, I), matrius
 * escrites (pmatrix, que abans es canvien per ⟦n⟧), nombres, + −, / (entre nombres), producte
 * per juxtaposició i ^(-1). Un valor és {s: Fraccio} (un nombre) o {m: [[…]]} (una matriu).
 */
const I2M = [[fr(1), fr(0)], [fr(0), fr(1)]];
const opM = {
  suma: (a, b, k = 1) => (a.s && b.s ? {s: a.s.suma(b.s.producte(k))} : a.m && b.m ? {m: a.m.map((f, i) => f.map((x, j) => x.suma(b.m[i][j].producte(k))))} : null),
  per: (a, b) => (a.s && b.s ? {s: a.s.producte(b.s)} : a.s ? {m: b.m.map(f => f.map(x => x.producte(a.s)))} : b.s ? {m: a.m.map(f => f.map(x => x.producte(b.s)))}
    : {m: a.m.map(f => b.m[0].map((_, j) => f.reduce((s, x, k) => s.suma(x.producte(b.m[k][j])), fr(0))))}),
  inv: a => {
    if (a.s) return {s: fr(1).quocient(a.s)};
    const d = a.m[0][0].producte(a.m[1][1]).resta(a.m[0][1].producte(a.m[1][0]));
    return {m: [[a.m[1][1].quocient(d), a.m[0][1].oposada().quocient(d)], [a.m[1][0].oposada().quocient(d), a.m[0][0].quocient(d)]]};
  },
};
const igualsM = (a, b) => (a.s && b.s ? a.s.igual(b.s) : a.m && b.m ? a.m.every((f, i) => f.every((x, j) => x.igual(b.m[i][j]))) : false);
/** TeX → {pla, mats}: les pmatrix canviades per ⟦n⟧ (amb els seus valors exactes). */
function plaAmbMatrius(tex) {
  const mats = [];
  const t = tex.replace(/\\begin\{pmatrix\}(.*?)\\end\{pmatrix\}/g, (_, cos) => {
    mats.push(cos.split('\\\\').map(f => f.replace(/^\s*\[[^\]]*\]/, '').split('&').map(c => exacte(M.llegeix(textPla(c.trim()), {variables: []}), {variables: {}, funcions: {}}))));
    return `\\text{M${mats.length - 1}}`;
  });
  return {pla: textPla(t).replace(/«M(\d+)»/g, '⟦$1⟧'), mats};
}
function avaluaM(pla, entorn, mats) {
  let i = 0;
  const mira = () => pla[i];
  function expr() {
    let v = terme();
    while (mira() === '+' || mira() === '-') { const s = pla[i++]; v = opM.suma(v, terme(), s === '+' ? 1 : -1); }
    return v;
  }
  function terme() {
    let negatiu = false;
    if (mira() === '-') { negatiu = true; i++; }
    let v = factor();
    while (i < pla.length && !'+-)='.includes(mira())) {
      if (mira() === '/') { i++; v = opM.per(v, opM.inv(factor())); } else v = opM.per(v, factor());
    }
    return negatiu ? opM.per({s: fr(-1)}, v) : v;
  }
  function factor() {
    let v = atom();
    while (pla.startsWith('^(-1)', i)) { i += 5; v = opM.inv(v); }
    return v;
  }
  function atom() {
    const c = mira();
    if (c === '(') { i++; const v = expr(); if (pla[i++] !== ')') throw new Error(`falta «)» a «${pla}»`); return v; }
    if (c === '⟦') { const f = pla.indexOf('⟧', i); const v = {m: mats[Number(pla.slice(i + 1, f))]}; i = f + 1; return v; }
    if (/\d/.test(c)) { let j = i; while (/\d/.test(pla[j])) j++; const v = {s: fr(Number(pla.slice(i, j)))}; i = j; return v; }
    if (c === 'I') { i++; return {m: I2M}; }
    if (/[ABCX]/.test(c)) { i++; if (!entorn[c]) throw new Error(`no hi ha ${c}`); return {m: entorn[c]}; }
    throw new Error(`no entenc «${pla.slice(i)}»`);
  }
  const v = expr();
  if (i !== pla.length) throw new Error(`sobra «${pla.slice(i)}»`);
  return v;
}

/**
 * Veritat d'un guió d'equació matricial. Model: X resolta a partir de l'equació de l'enunciat
 * com a sistema lineal de 4 incògnites (els elements de X), per Gauss: sense inverses. Cada fila
 * de l'equació ha de ser certa amb aquesta X, i també amb tres jocs de matrius a l'atzar (així una
 * manipulació equivocada, p. ex. la inversa pel costat dolent, no passa). Les files dels càlculs:
 * cada part de cada cadena d'igualtats val el mateix (les matrius de les dades, la dreta, M, |M|,
 * M⁻¹ i X).
 */
function comprovaEquacioMatricial(passos, v, nom) {
  const FILA = EquacioMatricial.FILA;
  const p = EquacioMatricial.problemes.find(q => q.id === v.p);
  const llegeixM = t => t.split(';').map(f => f.split(',').map(e => M.llegeixNombre(e)));
  const dadesReals = {A: llegeixM(p.A), B: llegeixM(p.B), C: p.C ? llegeixM(p.C) : null};
  const original = plaAmbMatrius(passos[0].files[FILA.equacio]).pla;
  /** La X que compleix l'equació original amb aquestes A, B, C (sistema 4×4 per Gauss), o null. */
  const resol = d => {
    const [L, Rr] = original.split('=');
    const f = Xm => { const e = Object.assign({}, d, {X: Xm}); const val = opM.suma(avaluaM(L, e, []), avaluaM(Rr, e, []), -1); return val.m.flat(); };
    const zero = f([[fr(0), fr(0)], [fr(0), fr(0)]]);
    const cols = [0, 1, 2, 3].map(k => { const Xm = [[fr(0), fr(0)], [fr(0), fr(0)]]; Xm[k >> 1][k & 1] = fr(1); return f(Xm).map((x, r) => x.resta(zero[r])); });
    const Bm = [0, 1, 2, 3].map(r => [0, 1, 2, 3].map(k => cols[k][r]).concat([zero[r].oposada()]));
    for (let c = 0; c < 4; c++) {
      const q = Bm.findIndex((x, r) => r >= c && !x[c].esZero());
      if (q < 0) return null;
      [Bm[c], Bm[q]] = [Bm[q], Bm[c]];
      Bm[c] = Bm[c].map(x => x.quocient(Bm[c][c]));
      for (let r = 0; r < 4; r++) if (r !== c) { const k = Bm[r][c]; Bm[r] = Bm[r].map((x, j) => x.resta(Bm[c][j].producte(k))); }
    }
    return [[Bm[0][4], Bm[1][4]], [Bm[2][4], Bm[3][4]]];
  };
  const Xreal = resol(dadesReals);
  const atzar = aleatori(nom.length * 7 + 1);
  const jocs = [];
  while (jocs.length < 3) {
    const m = () => [[0, 0], [0, 0]].map(f => f.map(() => fr(Math.floor(atzar() * 9) - 4)));
    const d = {A: m(), B: m(), C: m()};
    const X = resol(d);
    if (X) jocs.push(Object.assign(d, {X}));
  }
  let linies = 0;
  passos.forEach((pas, i) => pas.files.forEach((tex, fila) => {
    if (!tex) return;
    const on = `${nom}, pas ${i + 1}, fila ${fila + 1}`;
    linies++;
    try {
      const {pla, mats} = plaAmbMatrius(tex.startsWith('\\begin{array}') ? tex.replace(/\\begin\{array\}\{l\}|\\end\{array\}|\\\\\[4pt\]|\\qquad|\\quad/g, ' ') : tex);
      const real = Object.assign({}, dadesReals, {X: Xreal});
      if (fila === FILA.equacio) {
        const [L, Rr] = pla.split('=');
        comprova([real].concat(jocs).every(d => igualsM(avaluaM(L, d, mats), avaluaM(Rr, d, mats))), () => `${on}: «${pla}» no és equivalent a l'equació`);
      } else if (fila === FILA.dades) {
        for (const tros of pla.split(',')) {
          const [n, e] = tros.split('=');
          comprova(dadesReals[n] && igualsM(avaluaM(e, real, mats), {m: dadesReals[n]}), () => `${on}: «${tros}»`);
        }
      } else if (fila === FILA.det) {
        const m = /^\|(.*)\|=(.*)=(-?\d+)≠0$/.exec(pla);
        const Mm = avaluaM(m[1], real, mats).m;
        const d = Mm[0][0].producte(Mm[1][1]).resta(Mm[0][1].producte(Mm[1][0]));
        comprova(valorX(m[2], 'x', fr(0)).igual(d) && fr(Number(m[3])).igual(d) && !d.esZero(), () => `${on}: «${pla}»`);
      } else {
        const parts = pla.split('=');
        const valors = parts.map(t => avaluaM(t, real, mats));
        comprova(valors.every(x => igualsM(x, valors[0])), () => `${on}: «${pla}»: no totes les parts valen el mateix`);
        if (fila === FILA.producte || fila === FILA.resposta) comprova(parts[0] === 'X' && igualsM(valors[valors.length - 1], {m: Xreal}), () => `${on}: X no és la solució`);
      }
    } catch (e) {
      comprova(false, () => `${on}: no es pot llegir «${tex.slice(0, 120)}»: ${e.message}`);
    }
  }));
  const final = passos[passos.length - 1];
  comprova(final.classes[FILA.resposta] === 'final', () => `${nom}: la resposta no està destacada`);
  comprova(plaAmbMatrius(final.files[FILA.equacio]).pla.startsWith('X='), () => `${nom}: la X no queda aïllada`);
  return linies;
}

seccio('equació matricial', () => {
  let linies = 0, passos = 0;
  comprova(igualsM(avaluaM('(A+I)^(-1)(2C-B)', {A: [[fr(1), fr(0)], [fr(0), fr(1)]], B: I2M, C: I2M}, []), {m: [[fr(1, 2), fr(0)], [fr(0), fr(1, 2)]]}), 'avaluaM');
  for (const problema of EquacioMatricial.problemes) {
    const v = {p: problema.id};
    const llista = EquacioMatricial.passos(v);
    comprovaGuio(llista, EquacioMatricial.files, problema.id);
    linies += comprovaEquacioMatricial(llista, v, problema.id);
    passos += llista.length;
  }
  return `${EquacioMatricial.problemes.length} problemes, ${passos} passos, ${linies} línies comprovades`;
});


/* ── 20. DIAGONALITZACIÓ ───────────────────────────────────────────── */

/**
 * Veritat d'un guió de diagonalització. Model: A llegida de les dades i els valors propis com
 * els enters k amb |A − kI| = 0 (per cofactors). 3×3: el polinomi característic i les seves
 * arrels, amb el comprovador del determinant (A − λI, λ llegida com L). 2×2: |A − λI| =
 * |…| = (a − λ)(d − λ) − bc = polinomi, com a identitats, i les equacions amb les solucions dels
 * valors propis. Després: la llista de valors propis; per a cada un, A − λI, dues (o una)
 * equacions que són files seves i independents, i el vector de la solució (no nul, amb
 * (A − λI)v = 0); la llista de vectors (Av = λv); P (els vectors en columnes) i D; AP = PD.
 */
function comprovaDiagonalitzacio(passos, v, nom) {
  const FILA = Diagonalitzacio.FILA;
  const N = v.A.split(';').map(f => f.split(',').map(e => M.llegeixNombre(e)));
  const n = N.length;
  const detN = B => (B.length === 2 ? B[0][0].producte(B[1][1]).resta(B[0][1].producte(B[1][0])) : detLaplace(B));
  const menys = k => N.map((f, a) => f.map((c, b) => (a === b ? c.resta(k) : c)));
  const vaps = [];
  for (let k = -40; k <= 40; k++) if (detN(menys(fr(k))).esZero()) vaps.push(k);
  comprova(vaps.length === n, () => `${nom}: el model no té ${n} valors propis enters`);
  const pla = t => textPla(t).replace(/λ/g, 'L');
  let linies = 0;
  if (n === 3) {
    const textA = N.map((f, a) => f.map((c, b) => (a === b ? `${c.num}-L` : String(c.num))).join(',')).join(';');
    linies += comprovaDeterminant(passos, v, nom, {
      FILA: {matriu: FILA.car, sarrus: FILA.sarrus, calcul: FILA.calcul, equacio: FILA.equacio, prova: FILA.prova, ruffini: FILA.ruffini, segon: FILA.segon},
      P: 'c', X: 'L', A: textA, rapid: true, nomesDet: true, nomDet: '|A-LI|=',
    }).linies;
  }
  const charP = t => detN(menys(t));
  const vepsVistos = [];
  passos.forEach((pas, i) => pas.files.forEach((tex, fila) => {
    if (!tex) return;
    if (n === 3 && [FILA.car, FILA.sarrus, FILA.calcul, FILA.equacio, FILA.prova, FILA.ruffini, FILA.segon].includes(fila)) return;
    const on = `${nom}, pas ${i + 1}, fila ${fila + 1}`;
    linies++;
    try {
      const grups = grupsAmbClau(tex);
      if (fila === FILA.matriu) {
        comprova(nombresDeMatriu(tex).every((f, a) => f.every((c, b) => c.igual(N[a][b]))), () => `${on}: la matriu no és A`);
      } else if (fila === FILA.car || fila === FILA.sarrus || fila === FILA.calcul) {
        // 2×2: |A − λI| = … , cada part un polinomi en L igual a |A − LI| (o la matriu A − λI).
        const p0 = pla(tex.slice(0, tex.indexOf('\\begin') >= 0 ? tex.indexOf('\\begin') : tex.length));
        if (fila === FILA.car) {
          const cel = elementsDeMatriu(tex).files;
          comprova(p0 === '|A-LI|=' && cel.every((f, a) => f.every((c, b) => PUNTS_DET.every(t => valorX(pla(c), 'L', t).igual(menys(t)[a][b])))), () => `${on}: no és |A − λI|`);
        } else {
          const [esq, ...dre] = pla(tex).split('=');
          comprova(esq === '|A-LI|' && dre.every(e => PUNTS_DET.every(t => valorX(e, 'L', t).igual(charP(t)))), () => `${on}: «${pla(tex)}» no és |A − λI|`);
        }
      } else if (fila === FILA.equacio || fila === FILA.segon) {
        if (n === 2) comprova(solucionsX(pla(tex), 'L') === conjunt(vaps.map(k => fr(k))), () => `${on}: «${pla(tex)}» no té les solucions ${vaps}`);
      } else if (fila === FILA.vaps) {
        const llista = pla(tex).split(',').map(t => /^L_(\d)=(-?\d+)$/.exec(t));
        comprova(llista.length === n && llista.every((m, k) => m && Number(m[1]) === k + 1 && Number(m[2]) === vaps[k]), () => `${on}: «${pla(tex)}»: els valors propis són ${vaps}`);
      } else if (fila === FILA.vep) {
        const k = Object.keys(grups).map(x => /^W(\d)n$/.exec(x)).filter(Boolean)[0][1];
        const r = fr(Number(pla(grups[`W${k}n`].tex).split('=')[1]));
        comprova(vaps.some(x => fr(x).igual(r)), () => `${on}: ${r.num} no és un valor propi`);
        const B = menys(r);
        const [nomB, mat] = [pla(grups[`W${k}m`].tex).split('=')[0], nombresDeMatriu(grups[`W${k}m`].tex)];
        const esperat = r.esZero() ? 'A' : `A${r.signe() > 0 ? '-' : '+'}${r.abs().igual(1) ? '' : r.abs().num}I`;
        comprova(nomB === esperat && mat.every((f, a) => f.every((c, b) => c.igual(B[a][b]))), () => `${on}: «${nomB}» no és A − ${r.num}I`);
        if (grups[`W${k}e`]) {
          const eqs = /\\begin\{array\}\{l\}(.*)\\end\{array\}/.exec(grups[`W${k}e`].tex)[1].split('\\\\').map(e => pla(e.trim()));
          const vars = ['x', 'y', 'z'].slice(0, n);
          const files = eqs.map(e => {
            const [esq, dre] = e.split('=');
            comprova(dre === '0', () => `${on}: «${e}» no és homogènia`);
            return vars.map(x => exacte(M.llegeix(esq, {variables: vars}), {variables: Object.fromEntries(vars.map(y => [y, fr(y === x ? 1 : 0)])), funcions: {}}));
          });
          comprova(files.length === n - 1 && files.every(f => B.some(fl => fl.every((c, b) => c.igual(f[b])))) && rangGauss(files) === n - 1, () => `${on}: les equacions no són ${n - 1} files independents de A − ${r.num}I`);
        }
        if (grups[`W${k}s`]) {
          const m = /^\((.*)\)=t\((.*)\)$/.exec(pla(grups[`W${k}s`].tex));
          const w = m[2].split(',').map(x => M.llegeixNombre(x));
          comprova(w.length === n && w.some(c => !c.esZero()) && B.every(f => f.reduce((s, c, b) => s.suma(c.producte(w[b])), fr(0)).esZero()), () => `${on}: (${m[2]}) no és solució de (A − ${r.num}I)v = 0`);
        }
      } else if (fila === FILA.veps) {
        pla(tex).split(/,(?=v_)/).forEach((t, k) => {
          const m = /^v_(\d)=\((.*)\)$/.exec(t);
          const w = m[2].split(',').map(x => M.llegeixNombre(x));
          comprova(Number(m[1]) === k + 1 && w.some(c => !c.esZero()) && N.every((f, a) => f.reduce((s, c, b) => s.suma(c.producte(w[b])), fr(0)).igual(w[a].producte(vaps[k]))),
            () => `${on}: «${t}» no és un vector propi de λ = ${vaps[k]}`);
          vepsVistos[k] = w;
        });
      } else if (fila === FILA.pd) {
        const P = nombresDeMatriu(grups.Pn.tex), D = nombresDeMatriu(grups.Dn.tex);
        comprova(vepsVistos.length === n && P.every((f, a) => f.every((c, b) => c.igual(vepsVistos[b][a]))), () => `${on}: les columnes de P no són els vectors propis`);
        comprova(D.every((f, a) => f.every((c, b) => c.igual(fr(a === b ? vaps[a] : 0)))), () => `${on}: D no té els valors propis a la diagonal, en ordre`);
        comprova(!detN(P).esZero(), () => `${on}: P no és invertible`);
      } else if (fila === FILA.comprovacio) {
        const P = nombresDeMatriu(grupsAmbClau(pas.files[FILA.pd]).Pn.tex);
        const AP = N.map(f => P[0].map((_, b) => f.reduce((s, c, k) => s.suma(c.producte(P[k][b])), fr(0))));
        const PD = P.map(f => f.map((c, b) => c.producte(vaps[b])));
        const R_ = nombresDeMatriu(grups.Kc.tex);
        comprova(pla(grups.Kl.tex) === 'P^(-1)AP=D' && R_.every((f, a) => f.every((c, b) => c.igual(AP[a][b]) && c.igual(PD[a][b]))), () => `${on}: AP = PD no és cert`);
      }
    } catch (e) {
      comprova(false, () => `${on}: no es pot llegir «${tex.slice(0, 120)}»: ${e.message}`);
    }
  }));
  const final = passos[passos.length - 1];
  comprova(final.classes[FILA.pd] === 'final' && vepsVistos.length === n, () => `${nom}: falten vectors propis, o la resposta no està destacada`);
  return linies;
}

seccio('diagonalització', () => {
  const L = p => Diagonalitzacio.llegeixAdreca(p);
  comprova(L({}).valors.A === '4,1;2,3' && L({A: '1, 0, 0; 1, 2, -1; 1, 0, 3'}).valors.A === '1,0,0;1,2,-1;1,0,3', 'Diagonalitzacio.llegeixAdreca');
  for (const [p, patro] of [
    [{A: '1,1;0,1'}, /enters i diferents/], [{A: '0,-1;1,0'}, /enters i diferents/], [{A: '1,2;3,4'}, /enters i diferents/], [{A: 'm,1;1,m'}, /paràmetre/],
    [{A: '1,2,3;4,5,6'}, /quadrada/], [{A: '1'}, /quadrada|2×2 o 3×3/], [{A: '1,(2;3,4'}, /^No entenc/],
  ]) comprova(patro.test(L(p).error || ''), () => `Diagonalitzacio.llegeixAdreca(${JSON.stringify(p)}) hauria de donar ${patro}: ${JSON.stringify(L(p))}`);
  for (const v of Diagonalitzacio.exemples) comprova(Diagonalitzacio.valida(v) === null, () => `l'exemple ${v.A} no és vàlid`);
  const casos = Diagonalitzacio.exemples.map(v => v.A);
  const atzar = aleatori(2038);
  const enter = (a, b) => a + Math.floor(atzar() * (b - a + 1));
  for (let i = 0; i < 20000 && casos.length < 400; i++) {
    const n = atzar() < 0.4 ? 2 : 3;
    const t = Array.from({length: n}, () => Array.from({length: n}, () => enter(-2, 3)).join(',')).join(';');
    if (!L({A: t}).error) casos.push(t);
  }
  let valids = 0, linies = 0, passos = 0, mides = {};
  for (const text of casos) {
    const r = L({A: text});
    if (r.error) continue;
    const v = r.valors;
    valids++;
    const nom = `A = ${v.A}`;
    comprova(L(Diagonalitzacio.escriuAdreca(v)).valors.A === v.A, () => `${nom}: anada i tornada de l'adreça`);
    const llista = Diagonalitzacio.passos(v);
    comprovaGuio(llista, Diagonalitzacio.files, nom);
    linies += comprovaDiagonalitzacio(llista, v, nom);
    passos += llista.length;
    const k = `${v.A.split(';').length}×${v.A.split(';').length}`;
    mides[k] = (mides[k] || 0) + 1;
  }
  comprova(mides['2×2'] > 0 && mides['3×3'] > 0, 'falten matrius 2×2 o 3×3');
  return `${valids} matrius, ${passos} passos, ${linies} línies comprovades (${Object.entries(mides).map(([k, x]) => `${k}: ${x}`).join(', ')})`;
});


/* ── 3 i 4 (bis). GUIONS I VERITAT DE LA RECTA TANGENT ─────────────── */

seccio('guions i veritat de recta-tangent', () => {
  const casos = casosRectaTangent();
  let linies = 0, passos = 0, maxim = 0;
  const modes = {};
  for (const v of casos) {
    const nom = `f = ${M.textPolinomi(M.termes([v.a0, v.a1, v.a2, v.a3]))}, ${v.mode === 'pendent' ? 'm = ' + v.m : v.mode + ' en x0 = ' + v.x0}`;
    let llista;
    try {
      llista = RT.passos(v);
    } catch (e) {
      comprova(false, () => `${nom}: passos() llança ${e.stack}`);
      continue;
    }
    comprovaGuio(llista, RT.files, nom);
    linies += comprovaVeritat(llista, v, nom);
    passos += llista.length;
    maxim = Math.max(maxim, llista.length);
    const clau = v.mode + (v.mode === 'pendent' ? rectesModel(v).length : v.mode === 'normal' && rectesModel(v)[0].vertical ? '-vertical' : '');
    modes[clau] = (modes[clau] || 0) + 1;
  }
  comprova(['tangent', 'normal', 'normal-vertical', 'pendent0', 'pendent1', 'pendent2'].every(k => modes[k] > 0), () => `falten tipus de casos: ${JSON.stringify(modes)}`);
  return `${casos.length} casos (${Object.entries(modes).map(([k, n]) => k + ' ' + n).join(', ')}), ${passos} passos (fins a ${maxim} per cas), ${linies} línies comprovades`;
});


/* ── RESULTAT ──────────────────────────────────────────────────────── */

if (missatges.length) {
  console.log('\nPrimers errors:');
  for (const m of missatges) console.log('  · ' + m);
}
console.log(errors
  ? `\nHi ha ${errors} errors (de ${total} comprovacions).`
  : `\nTot correcte: ${total} comprovacions.`);
process.exitCode = errors ? 1 : 0;
