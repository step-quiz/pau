/* ═══════════════════════════════════════════════════════════════════
   dades.js — Dades comunes dels procediments d'Anàlisi
   ───────────────────────────────────────────────────────────────────
   Mòdul pur: no toca la pàgina (DOM). Depèn de mates.js. Exporta
   «Dades»: la funció f(x) = a3·x³ + a2·x² + a1·x + a0 amb coeficients
   enters, tal com la fan servir els procediments:
     termesDe(v)                 termes no nuls de f, de més a menys grau
     campsFuncio(max)            fila «f(x) =» de l'editor de fletxes
     validaFuncio(v, max)        error (text per a l'alumne) o null
     llegeixFuncio(text, v, g)   llegeix «f» de l'adreça dins de v
     textFuncio(v)               «f» per a l'adreça: «x^3-3x^2+1»
     reglesDerivada(llista)      com es deriva cada tipus de terme (text)
     article(v)                  «l'» o «el» davant d'un nombre
   Els valors són {a3, a2, a1, a0, …}.
   ═══════════════════════════════════════════════════════════════════ */
(function (arrel) {
'use strict';

const M = arrel.Mates;

const COEFS = ['a0', 'a1', 'a2', 'a3'];        // índex = grau

/** Termes no nuls de f, de més a menys grau. */
const termesDe = v => M.termes(COEFS.map(id => v[id]));

/** Camp de l'editor de fletxes (vegeu README.md). */
const camp = (id, sufix, nom, max, signe, atenua0) => ({id, sufix, nom, min: -max, max, signe, atenua0});

/** Fila «f(x) = □x³ □x² □x □» de l'editor. */
function campsFuncio(max) {
  return {etiqueta: 'f(x) =', camps: [
    camp('a3', 'x^3', 'coeficient de x al cub', max, 'negatiu', true),
    camp('a2', 'x^2', 'coeficient de x al quadrat', max, 'sempre', true),
    camp('a1', 'x', 'coeficient de x', max, 'sempre', true),
    camp('a0', '', 'terme independent', max, 'sempre', true),
  ]};
}

/** Text d'error si els coeficients no són vàlids; si ho són, null. */
function validaFuncio(v, max) {
  if (!COEFS.every(id => Number.isInteger(v[id]) && Math.abs(v[id]) <= max)) return `Els coeficients han de ser enters entre −${max} i ${max}.`;
  if (!v.a3 && !v.a2 && !v.a1) return 'La funció ha de dependre de x: posa algun coeficient de x diferent de 0.';
  return null;
}

/**
 * Llegeix la funció de l'adreça («2x^2-3x+1», «x(x-5)»…) i en posa els
 * coeficients a v. Torna un text d'error o null. Pot llançar
 * Mates.ErrorLectura si el text no és una expressió.
 */
function llegeixFuncio(text, v, maxGrau) {
  const coefs = M.polinomi(M.llegeix(text));
  if (!coefs) return `La funció de l'adreça, «${text}», no és un polinomi. De moment, aquest procediment només treballa amb polinomis.`;
  if (coefs.length - 1 > maxGrau) return `La funció de l'adreça, «${text}», és de grau ${coefs.length - 1}. De moment, el grau màxim és ${maxGrau}.`;
  if (!coefs.every(c => c.esEnter())) return `La funció de l'adreça, «${text}», té coeficients que no són enters.`;
  COEFS.forEach((id, n) => { v[id] = coefs[n] ? coefs[n].num : 0; });
  return null;
}

/** La funció per a l'adreça. */
const textFuncio = v => M.textPolinomi(termesDe(v));

/** Com es deriva cada tipus de terme de la llista. */
function reglesDerivada(llista) {
  const r = [];
  if (llista.some(t => t.n >= 2)) r.push('L\'exponent baixa multiplicant i es redueix en $1$.');
  const lineal = llista.find(t => t.n === 1);
  if (lineal) r.push(`$${M.texPolinomi([lineal])}$ passa a $${M.texNombre(lineal.c)}$.`);
  if (llista.some(t => t.n === 0)) r.push('La constant desapareix.');
  return r.join(' ');
}

/** Article davant d'un nombre: «l'1», «l'11», «el 3», «el −2». */
const article = v => (M.Fraccio.de(v).igual(1) || M.Fraccio.de(v).igual(11) ? "l'" : 'el ');

arrel.Dades = Object.freeze({
  COEFS, termesDe, camp, campsFuncio, validaFuncio, llegeixFuncio, textFuncio, reglesDerivada, article,
});

})(globalThis);
