/* ═══════════════════════════════════════════════════════════════════
   discussio.js — Procediment: discussió d'un sistema amb un paràmetre
   (teorema de Rouché–Frobenius)
   ───────────────────────────────────────────────────────────────────
   Dades: un sistema de 3 equacions amb 3 incògnites amb un paràmetre
   (m, a, k, p o t), per files (coeficients i terme independent),
   triat entre els exemples o escrit a l'adreça:
       discussio.html?S=1,m,m,-1;-1,1,1,1;2,1,m,2
   Passos:
     1. el sistema i la matriu ampliada A*;
     2. |A| per Sarrus (els sis productes alhora; vegeu la pàgina del
        determinant per al detall) i els valors que l'anul·len
        (Matrius.passosArrels: l'equació es queda i els càlculs baixen a
        les files lliures; Ruffini si és de grau 3; solucions en lila);
        després, un resum «|A| = 0 ⟺ m = … o m = …» i els càlculs
        s'esborren: les files lliures es reaprofiten per als casos;
     3. si |A| ≠ 0: rang(A) = rang(A*) = 3, compatible determinat;
     4. per a cada valor que anul·la |A|: A* amb aquest valor; el rang
        de A (un menor d'ordre 2 no nul; si no n'hi ha, les files són
        proporcionals); el de A*, orlant amb la columna dels termes
        independents; la conclusió;
     5. la taula de la discussió.
   Totes les línies que es veuen són certes: ho comprova proves/comprova.js.
   Claus: Y<i> les equacions; Mn, Mq, a<i><j> A*; d… el determinant (vegeu
   matrius.js: dMn, dS…, dV…, dC…); E…, P…, R…, W…, Q…, Y… |A| = 0; Zf, Zi,
   Zs el resum; Dc… el cas |A| ≠ 0; K<c>… el cas c; T<n><a-d> la taula.
   ═══════════════════════════════════════════════════════════════════ */
(function (arrel) {
'use strict';

const M = arrel.Mates;
const F = arrel.Formules;
const Mt = arrel.Matrius;
const {clau: K, rel: R} = F;

/** Files de la pissarra. */
// Les files lliures (proves d'arrels, Ruffini, «m = r o …», treball) només serveixen per resoldre |A| = 0: després
// s'esborren i s'hi escriuen els casos (scd, cas) i la taula. Així no queda cap fila buida enmig.
const FILA = Object.freeze({sistema: 0, matriu: 1, det: 2, sarrus: 3, calcul: 4, equacio: 5, lliures: Object.freeze([6, 7, 8, 9]),
  scd: 6, cas: 7, taula: 8});
const FILES = 10;

const EXEMPLES = Object.freeze([
  '1,m,m,-1;-1,1,1,1;2,1,m,2',          // |A| = m² − 1: m = −1 SCI, m = 1 SI
  'm,1,1,1;1,m,1,1;1,1,m,1',            // |A| de grau 3 (Ruffini): m = 1 SCI amb dos paràmetres, m = −2 SI
  'm,0,-2,0;1,m-1,1,m-1;1,1,1,1',       // m = ±2, els dos SCI
  '-1,m+1,1,m+1;1,2,1,m+1;m-1,1,1,1',   // m = 0 SCI, m = 3 SI (el paràmetre també als termes independents)
  '2,1,1,m-1;m,1,m,2;1,-2,2,0',         // |A| de grau 1: m = −3 SI
  '3,1,0,2;m+1,1,0,2;2,3,1,m+1',        // |A| de grau 1: m = 2 SCI
].map(S => Object.freeze({S})));
const PER_DEFECTE = EXEMPLES[0];

/** El sistema dels valors: {S (polinomis en X), X}. */
const sistema = v => { const {A, X} = Mt.llegeixMatriu(v.S, 3, 4); return {S: A, X}; };
/** S amb X = r: nombres. */
const amb = (S, r) => S.map(f => f.map(p => Mt.valorP(p, r)));
const parells = [[0, 1], [0, 2], [1, 2]];

/** Arrels enteres de |A| (null si n'hi ha de no enteres o irracionals). */
function arrelsEnteres(det) {
  if (Mt.problemaArrels(det)) return null;
  const totes = [];
  for (let r = -50; r <= 50; r++) if (Mt.valorP(det, r).esZero()) totes.push(r);
  // Totes les arrels racionals han de ser enteres: es comprova amb el polinomi dividit.
  let q = det;
  for (const r of totes) while (q.length > 1 && Mt.valorP(q, r).esZero()) q = Mt.ruffini(q, new M.Fraccio(r)).quocient;
  if (q.length === 2) return null;                                   // una arrel de grau 1 no entera
  if (q.length === 3 && M.arrelsRacionals(M.termes(q)).arrels.length) return null;
  return totes;
}

/**
 * La discussió d'un valor r que anul·la |A|: el rang de A, el de A* i com es veu.
 * {N, rA, rS, menor: {fs, cs} | null, element: [i, j] | null, orla: {fs, cs, valor} | null}.
 */
function cas(S, r) {
  const N = amb(S, r);
  const A = N.map(f => f.slice(0, 3));
  for (const fs of parells) for (const cs of parells) {
    const d = Mt.det2N(Mt.submatriu(A, fs, cs));
    if (d.esZero()) continue;
    const orla = {fs: [0, 1, 2], cs: cs.concat([3])};
    const valor = Mt.det3N(Mt.submatriu(N, orla.fs, orla.cs));
    return {N, rA: 2, rS: valor.esZero() ? 2 : 3, menor: {fs, cs, valor: d}, orla: Object.assign(orla, {valor}), element: null};
  }
  // Rang 1: un element no nul de A i, per a A*, un menor d'ordre 2 amb la columna dels termes independents.
  let element = null;
  for (let i = 0; i < 3 && !element; i++) for (let j = 0; j < 3 && !element; j++) if (!A[i][j].esZero()) element = [i, j];
  if (!element) return {N, rA: 0, rS: Mt.rangN(N), menor: null, orla: null, element: null};
  for (const i of [0, 1, 2]) {
    if (i === element[0]) continue;
    const fs = [element[0], i].sort((a, b) => a - b), cs = [element[1], 3];
    const valor = Mt.det2N(Mt.submatriu(N, fs, cs));
    if (!valor.esZero()) return {N, rA: 1, rS: 2, menor: null, element, orla: {fs, cs, valor}};
  }
  return {N, rA: 1, rS: 1, menor: null, element, orla: null};
}

function valida(v) {
  let S, X;
  try {
    ({S, X} = sistema(v));
  } catch (e) {
    if (e instanceof M.ErrorLectura) return e.message.replace('La matriu', 'El sistema').replace('elements', 'nombres (els tres coeficients i el terme independent)');
    throw e;
  }
  if (!X) return 'El sistema ha de tenir un paràmetre: una lletra, com «m».';
  const det = Mt.determinant(S.map(f => f.slice(0, 3)));
  if (det.length < 2) return `El determinant de A no depèn de ${X}: aquí no hi ha res a discutir. Tria un altre sistema.`;
  const arrels = arrelsEnteres(det);
  if (!arrels) return `Els valors de ${X} que anul·len |A| = ${Mt.textP(det, X)} han de ser enters. Tria un altre sistema.`;
  if (arrels.some(r => cas(S, r).rA === 0)) return 'Per a algun valor del paràmetre, A és tota zeros. Tria un altre sistema.';
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
const texSistemaNet = ({S, X}) => Mt.texSistema(S, {X}).replace(/\\htmlData\{[^}]*\}/g, '');
const enunciat = v => { const s = sistema(v); return `Discuteix el sistema $${texSistemaNet(s)}$ segons els valors de $${s.X}$.`; };
const resum = v => `\\scriptsize ${texSistemaNet(sistema(v))}`;

/** El nom del tipus de sistema. */
// Sempre el nom sencer, mai les sigles SCD, SCI, SI (David).
const TIPUS = (rA, rS) => (rA < rS ? 'Sistema incompatible' : rA === 3 ? 'Sistema compatible determinat' : 'Sistema compatible indeterminat');
const DESCRIPCIO = (rA, rS) => (rA < rS ? 'sistema incompatible: no té solució'
  : rA === 3 ? 'sistema compatible determinat: té una sola solució'
    : `sistema compatible indeterminat: té infinites solucions, que depenen de $3 - ${rA} = ${3 - rA}$ ${rA === 2 ? 'paràmetre' : 'paràmetres'}`);

function passos(v) {
  const {S, X} = sistema(v);
  const A = S.map(f => f.slice(0, 3));
  const g = F.guio(FILES);
  g.files[FILA.sistema] = Mt.texSistema(S, {P: 'Y', X});
  g.afegeix(`Discutir el sistema és dir, per a cada valor de $${X}$, si té una solució, infinites o cap. Es fa comparant els rangs de $A$ (els coeficients) `
    + `i de $A^*$ (l'ampliada): és el teorema de Rouché–Frobenius.`);
  g.files[FILA.matriu] = K('Mn', 'A^*') + R('Mq', '=') + Mt.texAmpliada(S, {X});
  g.afegeix('La matriu ampliada $A^*$: els coeficients (la matriu $A$) i, després de la ratlla, els termes independents.');

  /* |A| i els valors que l'anul·len. */
  const {det} = Mt.passosSarrus(g, {A, X, nom: '|A|', P: 'd', rapid: true, files: {matriu: FILA.det, sarrus: FILA.sarrus, calcul: FILA.calcul}});
  const arrels = Mt.passosArrels(g, {p: det, X, files: FILA, nom: '|A|', inici: `On és $|A| = 0$? Per a aquests valors, $\\text{rang}(A) < 3$.`, algebra: true}).map(r => r.num);
  // El resum: els càlculs ja no calen, i les seves files es reaprofiten.
  FILA.lliures.forEach(f => { g.files[f] = ''; });
  const solucions = Mt.texSolucions(arrels.map(r => M.Fraccio.de(r)), X);
  g.files[FILA.equacio] = solucions ? K('Zf', '|A| = 0') + R('Zi', '\\iff') + K('Zs', solucions) : K('Zf', `|A| \\neq 0 \\text{ per a tot } ${X}`);
  g.afegeix((solucions ? `Resumeix-ho: $|A| = 0$ només si $${solucions}$.` : `Resumeix-ho: $|A|$ no val mai $0$.`)
    + ' Els càlculs s\'esborren: ja no et calen.');

  /* La taula, que es va omplint. */
  // La capçalera, en negreta; la taula, una mica separada dels càlculs (classe «separat»).
  const files = [[K('T0a', `\\boldsymbol{${X}}`), K('T0b', '\\textbf{rang}\\boldsymbol{(A)}'), K('T0c', '\\textbf{rang}\\boldsymbol{(A^*)}'), K('T0d', '\\textbf{Tipus de sistema}')]];
  const taula = () => {
    g.classes[FILA.taula] = 'separat';
    g.files[FILA.taula] = `\\begin{array}{c|c|c|c} ${files.map(f => f.join(' & ')).join(' \\\\ \\hline ')} \\end{array}`;
  };

  /* |A| ≠ 0. */
  const diferent = arrels.length ? `${X} \\neq ${arrels.join(',\\ ')}` : `\\text{tot } ${X}`;
  g.files[FILA.scd] = K('Dc', diferent) + ':\\quad ' + K('Dr', '|A| \\neq 0 \\Rightarrow \\text{rang}(A) = \\text{rang}(A^*) = 3');
  files.push([K('T1a', diferent), K('T1b', '3'), K('T1c', '3'), K('T1d', '\\text{Sistema compatible determinat}')]);
  taula();
  g.afegeix((arrels.length ? `Si $${X}$ no és ${arrels.length === 1 ? 'aquest valor' : 'cap d\'aquests valors'}` : `Per a qualsevol valor de $${X}$`)
    + ', $|A| \\neq 0$: $\\text{rang}(A) = 3$, i també $\\text{rang}(A^*) = 3$ (no pot ser més gran: $A^*$ només té 3 files). '
    + `Són iguals al nombre d'incògnites: ${DESCRIPCIO(3, 3)}.`);

  /* Cada valor que anul·la |A|. */
  arrels.forEach((r, c) => {
    const k = cas(S, r);
    const P = `K${c}`;
    const linies = [];
    const marques = {};
    const pinta = () => {
      const matriu = K(`${P}n`, `${X} = ${r}`) + ':\\quad ' + K(`${P}N`, 'A^*') + R(`${P}q`, '=')
        + Mt.texAmpliada(k.N, {P, marca: (i, j) => marques[`${i}${j}`] || ''});
      g.files[FILA.cas] = `\\begin{array}{l} ${[matriu].concat(linies).join(' \\\\[8pt] ')} \\end{array}`;
    };
    pinta();
    g.afegeix(`Ara, $${X} = ${r}$: aquí $|A| = 0$, i per tant $\\text{rang}(A) < 3$. Substitueix $${X} = ${r}$ a $A^*$.`);
    if (k.rA === 2) {
      const {fs, cs, valor} = k.menor;
      const B = Mt.submatriu(k.N, fs, cs);
      for (const i of fs) for (const j of cs) marques[`${i}${j}`] = 'mes';
      linies.push(K(`${P}m`, Mt.texVmatriuN(B)) + R(`${P}e`, '=') + K(`${P}p`, Mt.texDet2N(B)) + R(`${P}f`, '=')
        + K(`${P}v`, `${M.texNombre(valor)} \\neq 0`) + '\\ \\Rightarrow\\ ' + K(`${P}r`, '\\text{rang}(A) = 2'));
      pinta();
      g.afegeix(`Hi ha un menor d'ordre 2 de $A$ que és no nul (verd). Per tant, $\\text{rang}(A) = 2$ (no pot ser 3, perquè $|A| = 0$).`);
      const r3 = [0, 1, 2].find(i => !fs.includes(i));
      for (const j of cs.concat([3])) marques[`${r3}${j}`] = 'tria';
      for (const i of fs) marques[`${i}3`] = 'tria';
      const B3 = Mt.submatriu(k.N, k.orla.fs, k.orla.cs);
      linies.push(F.enLinies(K(`${P}M`, Mt.texVmatriuN(B3)) + R(`${P}E`, '='), [K(`${P}P`, Mt.texSarrusN(B3))],
        {final: R(`${P}F`, '=') + K(`${P}V`, M.texNombre(k.orla.valor) + (k.orla.valor.esZero() ? '' : ' \\neq 0'))}));
      linies.push(K(`${P}R`, k.rS === 3 ? '\\text{rang}(A^*) = 3' : '\\text{rang}(A^*) = 2'));
      pinta();
      g.afegeix(`Per a $A^*$, orla el menor amb la fila ${r3 + 1} i la columna dels termes independents (groc). L'altra manera d'orlar-lo dins de $A^*$ és $|A|$, que ja saps que val $0$. `
        + (k.rS === 3 ? 'Aquest menor és no nul. Per tant, $\\text{rang}(A^*) = 3$.' : 'Aquest també és nul. Per tant, $\\text{rang}(A^*) = 2$.'));
    } else {
      const [i0, j0] = k.element;
      marques[`${i0}${j0}`] = 'mes';
      linies.push(K(`${P}m`, `\\text{les files de } A \\text{ són proporcionals}`) + '\\ \\Rightarrow\\ ' + K(`${P}r`, '\\text{rang}(A) = 1'));
      pinta();
      g.afegeix('Les tres files de $A$ són proporcionals (tots els menors d\'ordre 2 de $A$ valen $0$), i hi ha algun element no nul (verd). Per tant, $\\text{rang}(A) = 1$.');
      if (k.orla) {
        const {fs, cs, valor} = k.orla;
        const B = Mt.submatriu(k.N, fs, cs);
        for (const i of fs) for (const j of cs) if (!marques[`${i}${j}`]) marques[`${i}${j}`] = 'tria';
        linies.push(K(`${P}M`, Mt.texVmatriuN(B)) + R(`${P}E`, '=') + K(`${P}P`, Mt.texDet2N(B)) + R(`${P}F`, '=')
          + K(`${P}V`, `${M.texNombre(valor)} \\neq 0`) + '\\ \\Rightarrow\\ ' + K(`${P}R`, '\\text{rang}(A^*) = 2'));
        pinta();
        g.afegeix(`Per a $A^*$, orla l'element amb una altra fila i la columna dels termes independents (groc): aquest menor és no nul. Per tant, $\\text{rang}(A^*) = 2$.`);
      } else {
        linies.push(K(`${P}M`, `\\text{les files de } A^* \\text{ també}`) + '\\ \\Rightarrow\\ ' + K(`${P}R`, '\\text{rang}(A^*) = 1'));
        pinta();
        g.afegeix('Les files de $A^*$ també són proporcionals (amb el terme independent i tot). Per tant, $\\text{rang}(A^*) = 1$.');
      }
    }
    const t = files.length;
    files.push([K(`T${t}a`, `${X} = ${r}`), K(`T${t}b`, String(k.rA)), K(`T${t}c`, String(k.rS)), K(`T${t}d`, `\\text{${TIPUS(k.rA, k.rS)}}`)]);
    taula();
    g.afegeix(`Per a $${X} = ${r}$: $\\text{rang}(A) = ${k.rA}$ i $\\text{rang}(A^*) = ${k.rS}$. ` + (k.rA < k.rS ? 'Són diferents' : 'Són iguals, i més petits que 3')
      + `: ${DESCRIPCIO(k.rA, k.rS)}.`);
  });

  g.files[FILA.cas] = '';
  g.classes[FILA.taula] = 'separat final';
  g.afegeix('Resposta: la taula resumeix la discussió.' + (arrels.some(r => cas(S, r).rA === 2 && cas(S, r).rS === 2)
    ? ' (Per resoldre un cas compatible indeterminat, consulta el procediment «Sistema compatible indeterminat».)' : ''));
  return g.passos;
}

arrel.Discussio = Object.freeze({
  titol: 'Discussió d\'un sistema amb un paràmetre',
  categoria: 'algebra',
  files: FILES,
  perDefecte: PER_DEFECTE,
  exemples: EXEMPLES,
  titolEditor: 'Tria un sistema',
  titolExemples: 'Sistemes:',
  notaEditor: 'També pots escriure el teu sistema a l\'adreça, una equació per fila: discussio.html?S=1,m,m,-1;-1,1,1,1;2,1,m,2 '
    + '(la fila «1,m,m,-1» és x + my + mz = −1). Els valors que anul·len |A| han de ser enters.',
  editor: [],
  FILA, EXEMPLES,
  valida, llegeixAdreca, escriuAdreca, enunciat, resum, passos, cas,
});

})(globalThis);
