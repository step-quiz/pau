#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════
   proves/comprova.js — Proves automàtiques dels procediments
   ───────────────────────────────────────────────────────────────────
   Sense dependències. Des de l'arrel del repositori:
       node procediments/proves/comprova.js
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
for (const fitxer of ['mates.js', 'formules.js', 'dades.js', 'recta-tangent.js', 'extrems.js', 'creixement.js', 'optimitzacio.js', 'polinomi-condicions.js', 'bolzano.js', 'asimptotes.js']) {
  vm.runInThisContext(fs.readFileSync(path.join(DIR, fitxer), 'utf8'), {filename: fitxer});
}
const {Mates: M, Formules: F, Dades: Dd, RectaTangent: RT, Extrems, Creixement, Optimitzacio, PolinomiCondicions, Bolzano, Asimptotes} = globalThis;
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

function seccio(nom, fes) {
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
          case '\\text': { const t = grup(); s += t === 'o' ? '|' : `«${t}»`; break; }
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
const clausDe = tex => [...tex.matchAll(/\\htmlData\{k=([^}]*)\}|\{\{([^|}]+)\|/g)].map(m => m[1] || m[2]);

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
  const dades = (a3, a2, a1, a0, x0) => ({a3, a2, a1, a0, x0});

  for (const [p, esperat] of [
    [{f: '2x^2-3x+1', x0: '2'}, dades(0, 2, -3, 1, 2)],
    [{f: 'x(x-5)', x0: '-1'}, dades(0, 1, -5, 0, -1)],
    [{f: 'x^3 - 3x + 1'}, dades(1, 0, -3, 1, 2)],
    [{f: '−x³+3x²−2', x0: '3'}, dades(-1, 3, 0, -2, 3)],
    [{f: '(x-1)^3', x0: '0'}, dades(1, -3, 3, -1, 0)],
    [{x0: '-5'}, dades(0, 2, -3, 1, -5)],
    [{}, dades(0, 2, -3, 1, 2)],
  ]) comprova(iguals(lectura(p).valors, esperat), () => `llegeixAdreca(${JSON.stringify(p)}) → ${JSON.stringify(lectura(p))}`);

  for (const [p, patro] of [
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
  return `${n} funcions`;
});


/* ── 3 i 4. GUIONS I VERITAT DE LA RECTA TANGENT ───────────────────── */

/** Dades on es proven els guions: una graella densa, els extrems i una mostra aleatòria. */
function casosRectaTangent() {
  const casos = [];
  const afegeix = (a3, a2, a1, a0, x0) => { if (a3 || a2 || a1) casos.push({a3, a2, a1, a0, x0}); };
  const densos = [-3, -1, 0, 1, 2];
  for (const a3 of densos) for (const a2 of densos) for (const a1 of densos) for (const a0 of densos)
    for (let x0 = -5; x0 <= 5; x0++) afegeix(a3, a2, a1, a0, x0);
  const extrems = [-9, 0, 9];
  for (const a3 of extrems) for (const a2 of extrems) for (const a1 of extrems) for (const a0 of extrems)
    for (const x0 of [-5, 0, 5]) afegeix(a3, a2, a1, a0, x0);
  const atzar = aleatori(2026);
  const enter = (min, max) => min + Math.floor(atzar() * (max - min + 1));
  for (let i = 0; i < 3000; i++) afegeix(enter(-9, 9), enter(-9, 9), enter(-9, 9), enter(-9, 9), enter(-5, 5));
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
 * Veritat: cada línia de cada pas és una igualtat certa.
 *   · Si hi surt y, és l'equació d'una recta: s'ha de complir en els punts
 *     de la recta tangent i no en un punt de fora (per tant, és la tangent).
 *   · Si no, és una identitat: els dos costats valen el mateix per a tota x.
 * f(a) i f'(a) valen el que valen de veritat, i x₀ és el valor del punt.
 */
function comprovaVeritat(passos, v, nom) {
  const f = polinomiExacte([v.a0, v.a1, v.a2, v.a3].map(c => fr(c)));
  const df = polinomiExacte([v.a1, 2 * v.a2, 3 * v.a3].map(c => fr(c)));
  const x0 = fr(v.x0);
  const tangent = x => f(x0).suma(df(x0).producte(x.resta(x0)));
  const funcions = {f, "f'": df};
  let linies = 0;

  passos.forEach((pas, i) => pas.files.forEach((tex, fila) => {
    if (!tex) return;
    const on = `${nom}, pas ${i + 1}, fila ${fila + 1}`;
    let pla = '';
    try {
      pla = textPla(tex).replace(/x_0/g, `(${v.x0})`);
      const costats = pla.split('=');
      if (costats.length !== 2) { comprova(false, () => `${on}: «${pla}» no és una igualtat`); return; }
      const [esquerre, dret] = costats.map(costat);
      const certa = (x, y) => esquerre({variables: {x, y}, funcions}).igual(dret({variables: {x, y}, funcions}));
      linies++;
      if (pla.includes('y')) {
        comprova(PUNTS.every(x => certa(x, tangent(x))), () => `${on}: «${pla}» no és certa sobre la recta tangent`);
        comprova(!certa(fr(1), tangent(fr(1)).suma(1)), () => `${on}: «${pla}» també és certa fora de la recta`);
      } else {
        comprova(PUNTS.every(x => certa(x, fr(0))), () => `${on}: «${pla}» no és certa`);
      }
    } catch (e) {
      comprova(false, () => `${on}: no es pot llegir «${pla || tex}»: ${e.message}`);
    }
  }));

  // L'últim pas és la resposta: y = m·x + n, sense f.
  const final = textPla(passos[passos.length - 1].files[0]);
  comprova(/^y=[^fy]+$/.test(final), () => `${nom}: el resultat final no és de la forma y = …: «${final}»`);
  return linies;
}

seccio('guions i veritat de recta-tangent', () => {
  const casos = casosRectaTangent();
  let linies = 0, passos = 0, maxim = 0;
  for (const v of casos) {
    const nom = `f = ${M.textPolinomi(M.termes([v.a0, v.a1, v.a2, v.a3]))}, x0 = ${v.x0}`;
    let llista;
    try {
      llista = RT.passos(v);
    } catch (e) {
      comprova(false, () => `${nom}: passos() llança ${e.message}`);
      continue;
    }
    comprovaGuio(llista, RT.files, nom);
    linies += comprovaVeritat(llista, v, nom);
    passos += llista.length;
    maxim = Math.max(maxim, llista.length);
  }
  return `${casos.length} casos, ${passos} passos (fins a ${maxim} per cas), ${linies} línies comprovades`;
});


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


/* ── RESULTAT ──────────────────────────────────────────────────────── */

if (missatges.length) {
  console.log('\nPrimers errors:');
  for (const m of missatges) console.log('  · ' + m);
}
console.log(errors
  ? `\nHi ha ${errors} errors (de ${total} comprovacions).`
  : `\nTot correcte: ${total} comprovacions.`);
process.exitCode = errors ? 1 : 0;
