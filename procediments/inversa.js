/* ═══════════════════════════════════════════════════════════════════
   inversa.js — Procediment: la matriu inversa 3×3, per adjunts
   ───────────────────────────────────────────────────────────────────
   Dades: una matriu 3×3 de nombres enters amb |A| ≠ 0, triada entre els
   exemples o escrita a l'adreça:
       inversa.html?A=1,0,1;0,1,1;1,1,1
   Passos: A⁻¹ = (1/|A|) · (Adj A)ᵗ
     1. |A| per Sarrus: si no és 0, A és invertible;
     2. els nou adjunts A_ij = (−1)^(i+j) · M_ij: a la matriu, la fila i la
        columna de l'element es tapen (vermell) i queda el menor (verd);
        cada adjunt va a la seva posició de la matriu adjunta;
     3. la transposada: les files passen a ser columnes (els nombres es
        mouen al seu lloc nou);
     4. dividir per |A|; i la comprovació, A · A⁻¹ = I.
   Totes les línies que es veuen són certes: ho comprova proves/comprova.js.
   Claus: Mn, Mq, a<i><j> la matriu; D… el determinant; J… l'adjunt que es
   calcula; Jn, C<i><j> la matriu adjunta (i després la transposada);
   In, V<i><j> la inversa; Kq la comprovació.
   ═══════════════════════════════════════════════════════════════════ */
(function (arrel) {
'use strict';

const M = arrel.Mates;
const F = arrel.Formules;
const Mt = arrel.Matrius;
const {Fraccio} = M;
const {clau: K, rel: R} = F;

/** Files de la pissarra. */
const FILA = Object.freeze({matriu: 0, det: 1, adjunt: 2, adjunta: 3, inversa: 4, comprovacio: 5});

const EXEMPLES = Object.freeze([
  '1,0,1;0,1,1;1,1,1',       // |A| = −1: la inversa és de nombres enters
  '2,1,0;1,1,1;0,1,3',       // |A| = 1
  '1,2,0;0,1,1;2,0,1',       // |A| = 5: fraccions
  '1,1,0;1,0,1;0,1,1',       // |A| = −2
  '3,0,1;1,2,0;0,1,1',       // |A| = 7
  '1,-1,2;0,1,-1;2,0,1',     // |A| = −1, amb negatius
].map(A => Object.freeze({A})));
const PER_DEFECTE = EXEMPLES[0];

const matriu = v => Mt.nombres(Mt.llegeixMatriu(v.A, 3, 3).A);

function valida(v) {
  try {
    const {A, X} = Mt.llegeixMatriu(v.A, 3, 3);
    if (X) return `Aquí la matriu és de nombres: no hi pot haver cap paràmetre (${X}).`;
    if (Mt.det3N(Mt.nombres(A)).esZero()) return '|A| = 0: aquesta matriu no té inversa. Tria una matriu amb determinant diferent de 0.';
  } catch (e) {
    if (e instanceof M.ErrorLectura) return e.message;
    throw e;
  }
  return null;
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
const texNet = N => `\\begin{pmatrix} ${N.map(f => f.map(c => M.texNombre(c)).join(' & ')).join(' \\\\ ')} \\end{pmatrix}`;
const enunciat = v => `Calcula la inversa de la matriu $A = ${texNet(matriu(v))}$ pel mètode dels adjunts.`;
const resum = v => `A = ${Mt.texMatriuPetita(Mt.llegeixMatriu(v.A, 3, 3).A, null)}`;

/** L'adjunt (i, j): el signe, el menor i el valor. */
function adjunt(N, i, j) {
  const fs = [0, 1, 2].filter(a => a !== i), cs = [0, 1, 2].filter(b => b !== j);
  const B = Mt.submatriu(N, fs, cs);
  const menor = Mt.det2N(B);
  const signe = (i + j) % 2 ? -1 : 1;
  return {B, menor, signe, valor: signe > 0 ? menor : menor.oposada()};
}

function passos(v) {
  const N = matriu(v);
  const g = F.guio(6);
  const d = Mt.det3N(N);
  const marques = {};
  const pintaA = () => {
    g.files[FILA.matriu] = K('Mn', 'A') + R('Mq', '=') + Mt.texMatriu(N.map(f => f.map(c => (c.esZero() ? [] : [c]))), null,
      {marca: (i, j) => marques[`${i}${j}`] || ''});
  };
  pintaA();
  g.afegeix('La inversa per adjunts: $A^{-1} = \\dfrac{1}{|A|} \\left(\\text{Adj}(A)\\right)^t$. Primer cal saber si $A$ té inversa: ha de ser $|A| \\neq 0$.');

  /* 1. El determinant. */
  g.files[FILA.det] = F.enLinies(K('Dl', '|A|') + R('Dq', '='), [K('Dp', Mt.texSarrusN(N))],
    {final: R('Dr', '=') + K('Dv', M.texNombre(d)) + ' \\neq 0'});
  g.afegeix(`Per Sarrus, $|A| = ${M.texNombre(d)}$. No és $0$: $A$ és invertible.`);

  /* 2. Els nou adjunts. */
  const adj = [[null, null, null], [null, null, null], [null, null, null]];
  const texAdj = (transposada = false) => {
    const fila = i => [0, 1, 2].map(j => {
      const [a, b] = transposada ? [j, i] : [i, j];        // a la transposada, a la posició (i, j) hi va l'adjunt (j, i)
      return adj[a][b] === null ? '\\phantom{00}' : K(`C${a}${b}`, M.texNombre(adj[a][b]));
    }).join(' & ');
    return K('Jn', transposada ? '\\left(\\text{Adj}(A)\\right)^t' : '\\text{Adj}(A)') + R('Jq', '=')
      + `\\begin{pmatrix} ${[0, 1, 2].map(fila).join(' \\\\ ')} \\end{pmatrix}`;
  };
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const a = adjunt(N, i, j);
      for (let x = 0; x < 3; x++) for (let y = 0; y < 3; y++) marques[`${x}${y}`] = x === i || y === j ? 'menys' : 'mes';
      pintaA();
      adj[i][j] = a.valor;
      const signe = a.signe > 0 ? '+' : '-';
      g.files[FILA.adjunt] = K('Jl', `A_{${i + 1}${j + 1}}`) + R('Je', '=') + K('Js', signe) + K('Jm', Mt.texVmatriuN(a.B)) + R('Jf', '=')
        + K('Jp', `${signe}(${Mt.texDet2N(a.B)})`) + R('Jg', '=') + K('Jv', M.texNombre(a.valor));
      g.files[FILA.adjunta] = texAdj();
      const text = i === 0 && j === 0
        ? 'L\'adjunt de cada element: tapa la seva fila i la seva columna (vermell); el determinant que queda (verd) és el menor. '
          + 'El signe va alternant, com en un tauler d\'escacs: $+$ si $i + j$ és parell, $-$ si és senar. '
        : '';
      g.afegeix(`${text}$A_{${i + 1}${j + 1}} = ${signe}\\,${Mt.texVmatriuN(a.B)} = ${M.texNombre(a.valor)}$: va a la fila ${i + 1}, columna ${j + 1} de la matriu adjunta.`);
    }
  }
  for (const k of Object.keys(marques)) delete marques[k];
  pintaA();
  g.files[FILA.adjunt] = '';
  g.afegeix('Ja tenim la matriu adjunta, $\\text{Adj}(A)$: cada element canviat pel seu adjunt.');

  /* 3. La transposada. */
  g.files[FILA.adjunta] = texAdj(true);
  g.afegeix('Transposa-la: les files passen a ser columnes (la primera fila és ara la primera columna, i així).');

  /* 4. Dividir per |A|. */
  const inv = [0, 1, 2].map(i => [0, 1, 2].map(j => adj[j][i].quocient(d)));
  // Amb fraccions, una mica més d'espai entre files (si no, es toquen).
  const texMatriuV = (P, f) => {
    const files = [0, 1, 2].map(i => [0, 1, 2].map(j => K(`${P}${i}${j}`, f(i, j))).join(' & '));
    return `\\begin{pmatrix} ${files.join(files.some(x => x.includes('\\frac')) ? ' \\\\[6pt] ' : ' \\\\ ')} \\end{pmatrix}`;
  };
  const u = d.igual(1);                       // si |A| = 1, la inversa és directament la transposada
  const peces = u ? [] : [K('Iu', `\\dfrac{1}{${M.texNombre(d)}}`) + texMatriuV('W', (i, j) => M.texNombre(adj[j][i]))];
  peces.push((u ? '' : ' = ') + texMatriuV('V', (i, j) => M.texNombre(inv[i][j])));
  // Matrius altes: molt d'espai entre línies (i millor en una sola línia, si hi cap).
  g.files[FILA.inversa] = F.enLinies(K('In', 'A^{-1}') + R('Iq', '=') + '\\,', peces, {espai: '14pt'});
  g.afegeix(u ? 'Divideix per $|A| = 1$: la inversa és la mateixa transposada.'
    : `Divideix per $|A| = ${M.texNombre(d)}$: multiplica per $\\dfrac{1}{${M.texNombre(d)}}$, és a dir, divideix cada element de la transposada per $${M.texNombre(d)}$.`,
  u ? {} : {cursor: {arrossega: 'Dv', fins: 'Iu'}});

  /* 5. El resultat, destacat. (Sense escriure la comprovació A · A⁻¹ = I: el David no la vol a la pissarra.) */
  g.classes[FILA.inversa] = 'final';
  g.afegeix('Aquesta és la matriu inversa, $A^{-1}$.');
  return g.passos;
}

arrel.Inversa = Object.freeze({
  titol: 'Matriu inversa 3×3 (adjunts)',
  categoria: 'algebra',
  files: 6,
  perDefecte: PER_DEFECTE,
  exemples: EXEMPLES,
  titolEditor: 'Tria una matriu',
  titolExemples: 'Matrius:',
  notaEditor: 'També pots escriure la teva matriu a l\'adreça, per files: inversa.html?A=1,0,1;0,1,1;1,1,1 '
    + '(files separades per «;» i elements per «,»). Ha de tenir |A| ≠ 0.',
  editor: [],
  FILA, EXEMPLES,
  valida, llegeixAdreca, escriuAdreca, enunciat, resum, passos,
});

})(globalThis);
