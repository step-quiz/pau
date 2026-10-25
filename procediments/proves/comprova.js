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
for (const fitxer of ['mates.js', 'formules.js', 'dades.js', 'recta-tangent.js', 'extrems.js', 'creixement.js', 'optimitzacio.js']) {
  vm.runInThisContext(fs.readFileSync(path.join(DIR, fitxer), 'utf8'), {filename: fitxer});
}
const {Mates: M, Formules: F, Dades: Dd, RectaTangent: RT, Extrems, Creixement, Optimitzacio} = globalThis;
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
  return m[1].split('\\\\').map(fila => fila.replace(/\\hline/g, '').split('&').map(c => textPla(c.trim())));
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


/* ── RESULTAT ──────────────────────────────────────────────────────── */

if (missatges.length) {
  console.log('\nPrimers errors:');
  for (const m of missatges) console.log('  · ' + m);
}
console.log(errors
  ? `\nHi ha ${errors} errors (de ${total} comprovacions).`
  : `\nTot correcte: ${total} comprovacions.`);
process.exitCode = errors ? 1 : 0;
