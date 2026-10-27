/* ═══════════════════════════════════════════════════════════════════
   rang.js — Procediment: el rang d'una matriu, amb menors (orlant)
   ───────────────────────────────────────────────────────────────────
   Dades: una matriu de nombres enters, de 2 o 3 files i de 2 a 4
   columnes, triada entre els exemples o escrita a l'adreça:
       rang.html?A=1,2,3;2,4,1;3,6,4
   Passos (el mètode d'orlar menors):
     1. un element no nul: un menor d'ordre 1 no nul, rang ≥ 1;
     2. s'orla (s'hi afegeix una fila i una columna) fins a trobar un
        menor d'ordre 2 no nul: rang ≥ 2. Si tots els que l'orlen valen
        0, el rang és 1;
     3. s'orla el menor d'ordre 2 amb cada fila i columna que queden:
        menors d'ordre 3, per Sarrus. Si un no val 0, el rang és 3; si
        tots valen 0, el rang és 2 (no cal mirar cap altre menor).
   A la matriu, el menor no nul que ja tenim és verd, i la fila i la
   columna que s'hi afegeixen, grogues.
   Totes les línies que es veuen són certes: ho comprova proves/comprova.js.
   Claus: Mn, Mq, a<i><j> la matriu; U… el menor d'ordre 1; D<t>… els
   menors d'ordre 2 (m la matriu, p el càlcul, v el valor); T<t>… els
   d'ordre 3; Rg el rang.
   ═══════════════════════════════════════════════════════════════════ */
(function (arrel) {
'use strict';

const M = arrel.Mates;
const F = arrel.Formules;
const Mt = arrel.Matrius;
const {clau: K, rel: R} = F;

/** Files de la pissarra. */
const FILA = Object.freeze({matriu: 0, ordre1: 1, ordre2: 2, ordre3: 3, resposta: 4});

const EXEMPLES = Object.freeze([
  '1,2,3;2,4,1;3,6,4',            // 3×3, rang 2: el primer menor d'ordre 2 val 0
  '1,2,0;0,1,1;2,0,1',            // 3×3, rang 3
  '1,-2,3;-2,4,-6;3,-6,9',        // 3×3, rang 1
  '1,1,1,2;1,-1,2,1;2,0,3,3',     // 3×4, rang 2: els dos menors d'ordre 3 valen 0
  '1,1,1,1;1,2,3,2;2,3,4,4',      // 3×4, rang 3: el primer menor d'ordre 3 val 0, el segon no
  '0,1,2;1,0,1;1,1,3',            // 3×3 amb a₁₁ = 0, rang 2
  '2,-1,3;-4,2,-6',               // 2×3, rang 1
  '1,2,3;2,4,5',                  // 2×3, rang 2
].map(A => Object.freeze({A})));
const PER_DEFECTE = EXEMPLES[0];

/** La matriu dels valors, amb els nombres (Fraccio). */
function matriu(v) {
  const files = String(v.A).split(';').length;
  const columnes = String(v.A).split(';')[0].split(',').length;
  const {A, X} = Mt.llegeixMatriu(v.A, files, columnes);
  return {A, X, N: Mt.nombres(A), files, columnes};
}

function valida(v) {
  let m;
  try {
    m = matriu(v);
  } catch (e) {
    if (e instanceof M.ErrorLectura) return e.message;
    throw e;
  }
  if (m.X) return `Aquí la matriu és de nombres: no hi pot haver cap paràmetre (${m.X}).`;
  if (m.files < 2 || m.files > 3) return 'La matriu ha de tenir 2 o 3 files.';
  if (m.columnes < 2 || m.columnes > 4) return 'La matriu ha de tenir de 2 a 4 columnes.';
  if (m.N.every(f => f.every(c => c.esZero()))) return 'Tots els elements són 0: el rang és 0. Tria una altra matriu.';
  return null;
}

function llegeixAdreca(a) {
  if (a.A === undefined) return {valors: Object.assign({}, PER_DEFECTE)};
  const net = String(a.A).replace(/\s+/g, '');
  try {
    const files = net.split(';').length, columnes = net.split(';')[0].split(',').length;
    const {A, X} = Mt.llegeixMatriu(net, files, columnes);
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
  const {A, files, columnes} = matriu(v);
  return `Troba el rang de la matriu $A = ${Mt.texMatriu(A, null).replace(/\\htmlData\{[^}]*\}/g, '')}$.`;
}
const resum = v => `A = ${Mt.texMatriuPetita(matriu(v).A, null)}`;

/* ── Menors ────────────────────────────────────────────────────────── */

const {submatriu, texVmatriuN: texVmatriu, det2N: det2, texDet2N, det3N: det3, texSarrusN} = Mt;
const texN = c => M.texNombre(c);
const ordenat = (llista, x) => llista.concat([x]).sort((a, b) => a - b);
const nomFiles = fs => fs.map(i => i + 1).join(' i ');

function passos(v) {
  const {N, files, columnes} = matriu(v);
  const g = F.guio(5);
  const maxim = Math.min(files, columnes);
  const marques = {};                         // «ij» → 'mes' | 'tria'
  const pintaMatriu = () => {
    g.files[FILA.matriu] = K('Mn', 'A') + R('Mq', '=') + Mt.texMatriu(N.map(f => f.map(c => (c.esZero() ? [] : [c]))), null,
      {marca: (i, j) => marques[`${i}${j}`] || ''});
  };
  const marca = (fs, cs, base) => {
    for (const k of Object.keys(marques)) delete marques[k];
    for (const i of fs) for (const j of cs) marques[`${i}${j}`] = base.fs.includes(i) && base.cs.includes(j) ? 'mes' : 'tria';
  };
  const rang = tex => { g.files[FILA.resposta] = K('Rg', `\\text{rang}(A) ${tex}`); };
  pintaMatriu();
  g.afegeix(`El rang d'una matriu és un nombre natural ($0$, $1$, $2$, …) i és l'ordre més gran que puguis trobar d'un menor que sigui no nul. `
    + `Com que la matriu $A$ té ${files} files i ${columnes} columnes, el seu rang és com a màxim $${maxim}$.`);

  /* 1. Un element no nul. */
  const [i0, j0] = (() => { for (let i = 0; i < files; i++) for (let j = 0; j < columnes; j++) if (!N[i][j].esZero()) return [i, j]; return null; })();
  marca([i0], [j0], {fs: [i0], cs: [j0]});
  pintaMatriu();
  g.files[FILA.ordre1] = K('U1', `a_{${i0 + 1}${j0 + 1}} = ${texN(N[i0][j0])} \\neq 0`);
  rang('\\ge 1');
  g.afegeix(`Un element que no és $0$ és un menor d'ordre 1 no nul: $a_{${i0 + 1}${j0 + 1}} = ${texN(N[i0][j0])}$. Per tant, $\\text{rang}(A) \\ge 1$.`);

  /* 2. Orlant l'element: menors d'ordre 2. */
  const linies2 = [];
  let base = null, t = 0;
  for (let i = 0; i < files && !base; i++) {
    if (i === i0) continue;
    for (let j = 0; j < columnes && !base; j++) {
      if (j === j0) continue;
      const fs = ordenat([i0], i), cs = ordenat([j0], j);
      const B = submatriu(N, fs, cs);
      const d = det2(B);
      marca(fs, cs, {fs: [i0], cs: [j0]});
      pintaMatriu();
      linies2.push(K(`D${t}m`, texVmatriu(B)) + R(`D${t}q`, '=') + K(`D${t}p`, texDet2N(B))
        + R(`D${t}r`, '=') + K(`D${t}v`, texN(d) + (d.esZero() ? '' : ' \\neq 0')));
      g.files[FILA.ordre2] = linies2.length > 1 ? `\\begin{array}{l} ${linies2.join(' \\\\[8pt] ')} \\end{array}` : linies2[0];
      const quin = t === 0 ? `Has d'orlar l'element $a_{${i0 + 1}${j0 + 1}}$ (verd): afegeix-hi una fila i una columna (groc), la fila ${i + 1} i la columna ${j + 1}.`
        : `Una altra manera d'orlar-lo: afegint la fila ${i + 1} i la columna ${j + 1}.`;
      if (d.esZero()) {
        g.afegeix(`${quin} ${t === 0 ? 'Quan calcules aquest menor d\'ordre 2, obtens $0$.' : 'Aquest menor d\'ordre 2 és nul.'}`);
      } else {
        base = {fs, cs};
        rang(maxim === 2 ? '= 2' : '\\ge 2');
        g.afegeix(`${quin} Aquest menor d'ordre 2 és no nul. `
          + (maxim === 2 ? `Per tant, $\\text{rang}(A) = 2$, que ja és el rang màxim, ja que la matriu només té ${files === 2 ? '2 files' : '2 columnes'}.`
            : 'Per tant, ja pots afirmar que $\\text{rang}(A) \\ge 2$.'));
      }
      t++;
    }
  }
  if (!base) {
    for (const k of Object.keys(marques)) delete marques[k];
    pintaMatriu();
    rang('= 1');
    g.classes[FILA.resposta] = 'final';
    g.afegeix(`Tots els menors d'ordre 2 que contenen $a_{${i0 + 1}${j0 + 1}}$ valen $0$. Per tant, $\\text{rang}(A) = 1$.`);
    return g.passos;
  }

  /* 3. Orlant el menor d'ordre 2: menors d'ordre 3, per Sarrus. */
  if (maxim === 3) {
    const linies3 = [];
    let tres = false;
    t = 0;
    const restaFiles = [0, 1, 2].filter(i => i < files && !base.fs.includes(i));
    const restaCols = Array.from({length: columnes}, (_, j) => j).filter(j => !base.cs.includes(j));
    const total = restaFiles.length * restaCols.length;
    for (const i of restaFiles) {
      for (const j of restaCols) {
        if (tres) break;
        const fs = ordenat(base.fs, i), cs = ordenat(base.cs, j);
        const B = submatriu(N, fs, cs);
        const d = det3(B);
        marca(fs, cs, base);
        pintaMatriu();
        const inici = K(`T${t}m`, texVmatriu(B)) + R(`T${t}q`, '=');
        linies3.push(F.enLinies(inici, [K(`T${t}p`, texSarrusN(B))]));
        const pinta3 = () => { g.files[FILA.ordre3] = linies3.length > 1 ? `\\begin{array}{l} ${linies3.join(' \\\\[10pt] ')} \\end{array}` : linies3[0]; };
        pinta3();
        g.afegeix(t === 0 ? `Orla el menor d'ordre 2 que acabes de trobar (verd) afegint la fila ${i + 1} i la columna ${j + 1} (groc): obtens un menor d'ordre 3. Calcula'l aplicant la regla de Sarrus.`
          : `Una altra manera d'orlar-lo: afegint la fila ${i + 1} i la columna ${j + 1}. Calcula aquest nou menor.`);
        linies3[linies3.length - 1] = F.enLinies(inici, [K(`T${t}p`, texSarrusN(B))],
          {final: R(`T${t}r`, '=') + K(`T${t}v`, texN(d) + (d.esZero() ? '' : ' \\neq 0'))});
        pinta3();
        if (d.esZero()) {
          g.afegeix(`Aquest menor d'ordre 3 és nul.` + (t + 1 < total ? ' Prova una altra manera d\'orlar.' : ''));
        } else {
          tres = true;
          rang('= 3');
          g.afegeix(`Aquest menor d'ordre 3 és no nul. Per tant, $\\text{rang}(A) = 3$, que és el màxim.`);
        }
        t++;
      }
    }
    if (!tres) {
      rang('= 2');
      g.afegeix(total === 1
        ? 'No hi ha cap altre menor d\'ordre 3. Per tant, com que l\'últim menor no nul tenia ordre $2$, $\\text{rang}(A) = 2$.'
        : `Tots els menors d'ordre 3 que orlen el menor d'ordre 2 no nul valen $0$. Per tant, pots afirmar que $\\text{rang}(A) = 2$ i no cal mirar cap altre menor d'ordre 3.`);
    }
  }
  for (const k of Object.keys(marques)) delete marques[k];
  pintaMatriu();
  g.classes[FILA.resposta] = 'final';
  const r = g.files[FILA.resposta].match(/= (\d)/)[1];
  g.afegeix(`Resposta: $\\text{rang}(A) = ${r}$.`);
  return g.passos;
}

arrel.Rang = Object.freeze({
  titol: 'Rang d\'una matriu (orlant menors)',
  categoria: 'algebra',
  files: 5,
  perDefecte: PER_DEFECTE,
  exemples: EXEMPLES,
  titolEditor: 'Tria una matriu',
  titolExemples: 'Matrius:',
  notaEditor: 'També pots escriure la teva matriu a l\'adreça, per files: rang.html?A=1,2,3;2,4,1;3,6,4 '
    + '(files separades per «;» i elements per «,»). De 2 o 3 files i de 2 a 4 columnes, amb nombres enters de −9 a 9.',
  editor: [],
  FILA, EXEMPLES,
  valida, llegeixAdreca, escriuAdreca, enunciat, resum, passos,
});

})(globalThis);
