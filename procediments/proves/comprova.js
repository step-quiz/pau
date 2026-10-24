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
for (const fitxer of ['mates.js', 'formules.js', 'recta-tangent.js']) {
  vm.runInThisContext(fs.readFileSync(path.join(DIR, fitxer), 'utf8'), {filename: fitxer});
}
const {Mates: M, Formules: F, RectaTangent: RT} = globalThis;
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
 * \cdot → *, ^{…} → ^(…), ^{\prime} → ', \frac{a}{b} → ((a)/(b)).
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
      if (c === '^') { i++; const g = grup(); s += g === "'" ? "'" : '^(' + g + ')'; continue; }
      if (c === '_') { i++; s += '_' + grup(); continue; }
      if (c === '\\') {
        const ordre = /^\\([A-Za-z]+|.)/.exec(tex.slice(i))[0];
        i += ordre.length;
        switch (ordre) {
          case '\\htmlData': grup(); break;          // l'atribut k=…; el contingut és el grup següent
          case '\\mathbin': case '\\mathrel': case '\\left': case '\\right': case '\\,': case '\\ ': break;
          case '\\cdot': s += '*'; break;
          case '\\prime': s += "'"; break;
          case '\\frac': { const a = grup(), b = grup(); s += `((${a})/(${b}))`; break; }
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
const clausDe = tex => [...tex.matchAll(/\\htmlData\{k=([^}]*)\}/g)].map(m => m[1]);

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
      const e = ev(n.exponent);
      if (!e.esEnter() || e.num < 0) throw new Error('Exponent no natural');
      return ev(n.base).potencia(e.num);
    }
    case 'crida':    return entorn.funcions[n.nom](ev(n.arg));
  }
  throw new Error(`Node no previst per la prova: ${n.tipus}`);
}

const LECTURA = {variables: ['x', 'y'], funcions: ['f', "f'"]};

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


/* ── RESULTAT ──────────────────────────────────────────────────────── */

if (missatges.length) {
  console.log('\nPrimers errors:');
  for (const m of missatges) console.log('  · ' + m);
}
console.log(errors
  ? `\nHi ha ${errors} errors (de ${total} comprovacions).`
  : `\nTot correcte: ${total} comprovacions.`);
process.exitCode = errors ? 1 : 0;
