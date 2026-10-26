/* ═══════════════════════════════════════════════════════════════════
   sistema-sci.js — Procediment: un sistema compatible indeterminat
   (3 equacions, 3 incògnites, rang 2) i el seu conjunt de solucions
   ───────────────────────────────────────────────────────────────────
   Dades: els coeficients i el terme independent de cada equació, per
   files, triats entre els exemples o escrits a l'adreça:
       sistema-sci.html?S=1,1,1,2;1,-1,2,1;2,0,3,3
   (la fila «1,1,1,2» és x + y + z = 2). Només sistemes amb rang(A) =
   rang(A*) = 2: les solucions depenen d'un sol paràmetre (a les PAU,
   mai de dos).
   Passos:
     1. A i A*; un menor d'ordre 2 no nul de A (rang ≥ 2); orlat amb la
        columna que falta, és |A| = 0 (rang A = 2); orlat amb la dels
        termes independents, també 0 (rang A* = 2): Rouché, SCI;
     2. es treu l'equació que no és al menor; la incògnita que no és a
        les columnes del menor és el paràmetre λ; el sistema 2×2 que
        queda, per Cramer; el conjunt de solucions, (x, y, z) = (…).
   Totes les línies que es veuen són certes: ho comprova proves/comprova.js.
   Claus: Q<i> les equacions; Mn, Mq, a<i><j> la matriu A*; N<t>… els
   menors; Rr la fila de Rouché; G… el sistema 2×2; X<v>… Cramer;
   S… les solucions (vegeu matrius.js).
   ═══════════════════════════════════════════════════════════════════ */
(function (arrel) {
'use strict';

const M = arrel.Mates;
const F = arrel.Formules;
const Mt = arrel.Matrius;
const {clau: K, rel: R} = F;

/** Files de la pissarra. */
const FILA = Object.freeze({sistema: 0, matriu: 1, menors: 2, rouche: 3, reduit: 4, cramer: 5, solucio: 6});

const EXEMPLES = Object.freeze([
  '1,1,1,2;1,-1,2,1;2,0,3,3',        // la 3a és la suma de les altres; solucions amb fraccions
  '1,1,0,1;0,1,1,2;1,2,1,3',         // menor 1: solucions enteres
  '2,-1,1,1;1,1,-1,2;3,0,0,3',       // x no depèn de λ
  '1,2,1,2;2,4,3,5;3,6,4,7',         // el menor de x i y val 0: el paràmetre és y
  '1,1,1,3;2,2,2,6;1,-1,0,1',        // les dues primeres són proporcionals: es treu la 2a
  '1,1,-1,0;2,-1,1,0;1,-2,2,0',      // homogeni
].map(S => Object.freeze({S})));
const PER_DEFECTE = EXEMPLES[0];

/** El sistema dels valors: S (3 files [a, b, c, d], Fraccio). */
const sistema = v => Mt.nombres(Mt.llegeixMatriu(v.S, 3, 4).A);

/** El primer menor d'ordre 2 no nul de A: {fs, cs}. */
function menor(S) {
  for (const fs of [[0, 1], [0, 2], [1, 2]]) for (const cs of [[0, 1], [0, 2], [1, 2]]) {
    if (!Mt.det2N(Mt.submatriu(S, fs, cs)).esZero()) return {fs, cs};
  }
  return null;
}

function valida(v) {
  let S;
  try {
    const {X} = Mt.llegeixMatriu(v.S, 3, 4);
    if (X) return `Aquí el sistema és de nombres: no hi pot haver cap paràmetre (${X}).`;
    S = sistema(v);
  } catch (e) {
    if (e instanceof M.ErrorLectura) return e.message.replace('La matriu', 'El sistema').replace('elements', 'nombres (els tres coeficients i el terme independent)');
    throw e;
  }
  const rA = Mt.rangN(S.map(f => f.slice(0, 3))), rAm = Mt.rangN(S);
  if (rA === 3) return 'Aquest sistema és compatible determinat (|A| ≠ 0): té una sola solució. Tria un sistema amb infinites solucions.';
  if (rA < rAm) return 'Aquest sistema és incompatible (rang A < rang A*): no té solució. Tria un sistema amb infinites solucions.';
  if (rA < 2) return 'Les solucions d\'aquest sistema depenen de dos paràmetres (rang 1): a les PAU no surt. Tria un sistema de rang 2.';
  return null;
}

function llegeixAdreca(a) {
  if (a.S === undefined) return {valors: Object.assign({}, PER_DEFECTE)};
  try {
    const {A, X} = Mt.llegeixMatriu(a.S, 3, 4);
    const v = {S: Mt.textMatriu(A, X)};
    const error = valida(v);
    return error ? {error: `L'adreça no es pot fer servir. ${error}`} : {valors: v};
  } catch (e) {
    if (e instanceof M.ErrorLectura) return {error: `No entenc el sistema de l'adreça: ${e.message}`};
    throw e;
  }
}
const escriuAdreca = v => ({S: v.S});
const texSistemaNet = S => Mt.texSistema(S).replace(/\\htmlData\{[^}]*\}/g, '');
const enunciat = v => `Resol el sistema $${texSistemaNet(sistema(v))}$ i expressa'n el conjunt de solucions.`;
const resum = v => `\\scriptsize ${texSistemaNet(sistema(v))}`;

function passos(v) {
  const S = sistema(v);
  const g = F.guio(7);
  const {fs, cs} = menor(S);
  const r3 = [0, 1, 2].find(i => !fs.includes(i)), f = [0, 1, 2].find(j => !cs.includes(j));
  const nom = Mt.INCOGNITES;
  const pintaSistema = (marques = {}) => { g.files[FILA.sistema] = Mt.texSistema(S, {marca: i => marques[i] || ''}); };
  const pintaMatriu = (marques = {}) => {
    g.files[FILA.matriu] = K('Mn', 'A^*') + R('Mq', '=') + Mt.texAmpliada(S, {marca: (i, j) => marques[`${i}${j}`] || ''});
  };
  const marquesMenor = extra => {
    const m = {};
    for (const i of fs) for (const j of cs) m[`${i}${j}`] = 'mes';
    if (extra !== undefined) {
      for (const j of cs.concat([extra])) m[`${r3}${j}`] = 'tria';
      for (const i of fs) m[`${i}${extra}`] = 'tria';
    }
    return m;
  };
  pintaSistema();
  g.afegeix('Un sistema de 3 equacions amb 3 incògnites. Abans de resoldre\'l, mira com són les solucions amb el teorema de Rouché–Frobenius: '
    + 'compara el rang de la matriu dels coeficients, $A$, amb el de l\'ampliada, $A^*$.');
  pintaMatriu();
  g.afegeix('La matriu ampliada $A^*$: els coeficients de les incògnites (això és $A$) i, després de la ratlla, la columna dels termes independents.');

  /* Els rangs, orlant un menor d'ordre 2 no nul. */
  const linies = [];
  const pintaMenors = () => { g.files[FILA.menors] = linies.length > 1 ? `\\begin{array}{l} ${linies.join(' \\\\[10pt] ')} \\end{array}` : linies[0]; };
  const B2 = Mt.submatriu(S, fs, cs);
  const D = Mt.det2N(B2);
  linies.push(K('N0m', Mt.texVmatriuN(B2)) + R('N0q', '=') + K('N0p', Mt.texDet2N(B2)) + R('N0r', '=') + K('N0v', `${M.texNombre(D)} \\neq 0`));
  pintaMatriu(marquesMenor());
  pintaMenors();
  g.afegeix(`Un menor d'ordre 2 de $A$ que no val $0$: el de les equacions ${fs[0] + 1} i ${fs[1] + 1} i les columnes de $${nom[cs[0]]}$ i $${nom[cs[1]]}$ `
    + `(verd). Per tant, $\\text{rang}(A) \\ge 2$ i $\\text{rang}(A^*) \\ge 2$.`);
  const orla = (j, t, nomM) => {
    const cols = cs.concat([j]).sort((a, b) => a - b);
    const B = Mt.submatriu(S, [0, 1, 2], cols);
    pintaMatriu(marquesMenor(j));
    linies.push(F.enLinies((nomM ? K(`N${t}n`, nomM) + R(`N${t}e`, '=') : '') + K(`N${t}m`, Mt.texVmatriuN(B)) + R(`N${t}q`, '='),
      [K(`N${t}p`, Mt.texSarrusN(B))], {final: R(`N${t}r`, '=') + K(`N${t}v`, M.texNombre(Mt.det3N(B)))}));
    pintaMenors();
  };
  orla(f, 1, '|A|');
  g.afegeix(`Orla'l amb l'equació ${r3 + 1} i la columna de $${nom[f]}$ (groc): és tot $|A|$. Per Sarrus, val $0$. `
    + 'Per tant, $\\text{rang}(A) = 2$.');
  orla(3, 2, '');
  g.afegeix(`Ara orla'l amb l'equació ${r3 + 1} i la columna dels termes independents: també val $0$. Els dos menors d'ordre 3 de $A^*$ que orlen `
    + 'el menor no nul valen $0$: $\\text{rang}(A^*) = 2$.');
  pintaMatriu(marquesMenor());
  g.files[FILA.rouche] = K('Rr', '\\text{rang}(A) = \\text{rang}(A^*) = 2 < 3');
  g.afegeix('Teorema de Rouché–Frobenius: els dos rangs són iguals (el sistema és compatible), però més petits que el nombre d\'incògnites, $3$. '
    + 'És un sistema compatible indeterminat: té infinites solucions, que depenen de $3 - 2 = 1$ paràmetre.');

  /* La resolució. */
  pintaMatriu();
  const {exemple, components} = Mt.passosSCI(g, {S, fs, cs, files: FILA, pintaSistema});
  g.classes[FILA.solucio] = 'final';
  g.afegeix(`Resposta: les solucions són $(x,\\ y,\\ z) = \\left(${components.join(',\\ ')}\\right)$, per a qualsevol $\\lambda \\in \\mathbb{R}$. `
    + `Cada valor de $\\lambda$ dona una solució: per exemple, amb $\\lambda = 1$, $(${exemple.join(',\\ ')})$.`);
  return g.passos;
}

arrel.SistemaSCI = Object.freeze({
  titol: 'Sistema compatible indeterminat',
  categoria: 'algebra',
  files: 7,
  perDefecte: PER_DEFECTE,
  exemples: EXEMPLES,
  titolEditor: 'Tria un sistema',
  titolExemples: 'Sistemes:',
  notaEditor: 'També pots escriure el teu sistema a l\'adreça, una equació per fila: sistema-sci.html?S=1,1,1,2;1,-1,2,1;2,0,3,3 '
    + '(la fila «1,1,1,2» és x + y + z = 2). Ha de tenir rang(A) = rang(A*) = 2.',
  editor: [],
  FILA, EXEMPLES,
  valida, llegeixAdreca, escriuAdreca, enunciat, resum, passos,
});

})(globalThis);
