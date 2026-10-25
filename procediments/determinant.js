/* ═══════════════════════════════════════════════════════════════════
   determinant.js — Procediment: determinant 3×3 amb un paràmetre
   (regla de Sarrus) i els valors que l'anul·len
   ───────────────────────────────────────────────────────────────────
   Dades: una matriu 3×3 amb un paràmetre (m, a, k, p o t), triada entre
   els exemples o escrita a l'adreça, per files:
       determinant.html?A=m,1,1;1,m,1;1,1,m
   Passos (els fa matrius.js):
     1. la regla de Sarrus: cada producte, marcat a la matriu (verd +,
        vermell −); cada producte fet; sense parèntesis; els termes
        agrupats: |A| és un polinomi en m;
     2. |A| = 0: grau 1 o 2, directament; grau 3, factor comú o una arrel
        entera (divisors del terme independent) i Ruffini, i l'equació de
        segon grau que queda;
     3. la resposta: |A| = 0 per a aquests valors; A és invertible per a
        tots els altres.
   Totes les línies que es veuen són certes: ho comprova proves/comprova.js.
   Claus: Mn, Mq, a<i><j> la matriu; S…, V…, C… Sarrus (vegeu matrius.js);
   E…, P…, R…, Q… l'equació; Rs la resposta.
   ═══════════════════════════════════════════════════════════════════ */
(function (arrel) {
'use strict';

const M = arrel.Mates;
const F = arrel.Formules;
const Mt = arrel.Matrius;
const {clau: K, rel: R} = F;

/** Files de la pissarra. */
const FILA = Object.freeze({matriu: 0, sarrus: 1, calcul: 2, equacio: 3, prova: 4, ruffini: 5, segon: 6, resposta: 7});

const EXEMPLES = Object.freeze([
  'm,1,1;1,m,1;1,1,m',                 // grau 3: Ruffini amb m = 1 (arrel doble)
  '1,1,1;1,m,1;1,1,m',                 // grau 2: arrel doble
  '1,2,3;0,m,1;1,0,2',                 // grau 1
  'm,0,1;0,m,0;1,0,m',                 // grau 3 sense terme independent: factor comú m
  '-1,2,1;m-1,m+1,2;m+1,-1,1',         // grau 2, amb parèntesis i el primer coeficient negatiu
  '1,m+1,1;-2,0,m-1;m-1,2,-1',         // grau 3: m = 1 no, m = −1 sí
  'm,m,-2;1,1,m-1;m,2,3',              // grau 3: l'arrel és 2, i l'equació de segon grau no té solucions
  'k,1,2;1,k,0;0,1,1',                 // grau 2 sense solucions: sempre invertible
].map(A => Object.freeze({A})));
const PER_DEFECTE = EXEMPLES[0];

/** La matriu dels valors: {A, X}. */
const matriu = v => Mt.llegeixMatriu(v.A, 3, 3);

/** Text d'error si els valors no són vàlids; si ho són, null. */
function valida(v) {
  let A, X;
  try {
    ({A, X} = matriu(v));
  } catch (e) {
    if (e instanceof M.ErrorLectura) return e.message;
    throw e;
  }
  if (!X) return 'La matriu ha de tenir un paràmetre: una lletra, com «m».';
  const det = Mt.determinant(A);
  const problema = Mt.problemaArrels(det);
  if (problema === 'constant') return `El determinant no depèn de ${X}: val ${Mt.textP(det, X)}. Tria una altra matriu.`;
  if (problema === 'irracionals') return `El determinant, ${Mt.textP(det, X)}, s'anul·la en valors irracionals de ${X}. Tria una matriu amb solucions enteres o fraccionàries.`;
  if (problema === 'sense arrel entera') return `El determinant, ${Mt.textP(det, X)}, és de grau 3 i no té cap arrel entera: aquí no es pot fer per Ruffini.`;
  return problema ? 'Aquesta matriu no es pot fer servir.' : null;
}

function llegeixAdreca(a) {
  if (a.A === undefined) return {valors: Object.assign({}, PER_DEFECTE)};
  try {
    const {A, X} = Mt.llegeixMatriu(a.A, 3, 3);
    const v = {A: Mt.textMatriu(A, X)};
    const error = valida(v);
    return error ? {error: `L'adreça no es pot fer servir. ${error}`} : {valors: v};
  } catch (e) {
    if (e instanceof M.ErrorLectura) return {error: `No entenc la matriu de l'adreça: ${e.message}`};
    throw e;
  }
}
const escriuAdreca = v => ({A: v.A});

function enunciat(v) {
  const {A, X} = matriu(v);
  return `Calcula, amb la regla de Sarrus, el determinant de la matriu $A = ${Mt.texMatriu(A, X).replace(/\\htmlData\{[^}]*\}/g, '')}$ `
    + `en funció de $${X}$. Per a quins valors de $${X}$ és $|A| = 0$? (Són els valors per als quals $A$ no és invertible.)`;
}
const resum = v => { const {A, X} = matriu(v); return `A = ${Mt.texMatriuPetita(A, X)}`; };

function passos(v) {
  const {A, X} = matriu(v);
  const g = F.guio(8);
  g.files[FILA.matriu] = K('Mn', 'A') + R('Mq', '=') + Mt.texMatriu(A, X);
  g.afegeix(`La matriu $A$ depèn del paràmetre $${X}$. El seu determinant, $|A|$, serà un polinomi en $${X}$.`);
  const {det} = Mt.passosSarrus(g, {A, X, nom: '|A|', files: FILA});
  const arrels = Mt.passosArrels(g, {p: det, X, files: FILA,
    inici: `Per a quins valors de $${X}$ és $|A| = 0$? Iguala el determinant a zero.`});

  const solucions = Mt.texSolucions(arrels, X);
  g.files[FILA.resposta] = K('Rs', solucions ? `|A| = 0 \\iff ${solucions}` : `|A| \\neq 0 \\text{ per a tot } ${X}`);
  g.classes[FILA.resposta] = 'final';
  const texDet = Mt.texP(det, X);
  g.afegeix(solucions
    ? `Resposta: $|A| = ${texDet}$, que val $0$ si i només si $${solucions}$. Per tant, $A$ és invertible si i només si `
      + `${arrels.map(r => `$${X} \\neq ${M.texNombre(r)}$`).join(' i ')}.`
    : `Resposta: $|A| = ${texDet}$ no val $0$ per a cap valor de $${X}$. Per tant, $A$ és invertible per a qualsevol valor de $${X}$.`);
  return g.passos;
}

arrel.Determinant = Object.freeze({
  titol: 'Determinant 3×3 amb un paràmetre (Sarrus)',
  categoria: 'algebra',
  files: 8,
  perDefecte: PER_DEFECTE,
  exemples: EXEMPLES,
  titolEditor: 'Tria una matriu',
  titolExemples: 'Matrius:',
  notaEditor: 'També pots escriure la teva matriu a l\'adreça, per files: determinant.html?A=m,1,1;1,m,1;1,1,m '
    + '(files separades per «;» i elements per «,»). Els elements són enters, o com «2m-1»; el paràmetre pot ser a, k, m, p o t.',
  editor: [],
  FILA, EXEMPLES,
  valida, llegeixAdreca, escriuAdreca, enunciat, resum, passos,
});

})(globalThis);
