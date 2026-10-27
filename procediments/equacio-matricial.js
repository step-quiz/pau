/* ═══════════════════════════════════════════════════════════════════
   equacio-matricial.js — Procediment: una equació matricial
   ───────────────────────────────────────────────────────────────────
   Sis problemes fixos (matrius 2×2), amb formes diferents: AX = B,
   XA = B, AX + B = 2C, XA − B = C, AX + X = B i XA − 2X = B.
   Adreça: equacio-matricial.html?p=ax (ax, xa, axb, xab, axx, xa2x)
   Passos:
     1. aïllar X amb lletres, a la mateixa fila (com amb nombres, però
        amb compte amb l'ordre): passar B a l'altre costat; treure X
        factor comú (X = I · X, i X queda al mateix costat); multiplicar per
        la inversa pel costat on és la matriu (l'esquerra o la dreta);
        M⁻¹M = I i I · X = X (sempre amb el punt: «IX» semblaria un nombre romà);
     2. calcular: la matriu de l'altre costat; la matriu M (si és A + I,
        A − 2I…); |M|; M⁻¹ = (1/|M|)·(d −b; −c a); el producte, en l'ordre
        bo, files per columnes.
   Totes les línies que es veuen són certes: ho comprova proves/comprova.js.
   Claus: q… l'equació (qA, qX, qc el terme amb X sola i després I, qB,
   qe «=», qC, qL i qR les inverses, qI); D, R, N, G, V, P, S les files
   dels càlculs.
   ═══════════════════════════════════════════════════════════════════ */
(function (arrel) {
'use strict';

const M = arrel.Mates;
const F = arrel.Formules;
const Mt = arrel.Matrius;
const {Fraccio} = M;
const {clau: K, rel: R} = F;

/**
 * Els problemes: la forma (costat 'e' si és A·X, 'd' si és X·A; c, el coeficient de la X sola;
 * beta, el signe de B a l'esquerra, 0 si no hi és; kappa, el nombre davant de la matriu de la dreta)
 * i les matrius (text, per files).
 */
const PROBLEMES = Object.freeze([
  {id: 'ax', nom: 'AX = B', costat: 'e', c: 0, beta: 0, kappa: 1, A: '1,-1;-1,2', B: '0,-3;-2,4'},
  {id: 'xa', nom: 'XA = B', costat: 'd', c: 0, beta: 0, kappa: 1, A: '3,-2;-2,1', B: '-1,1;-2,1'},
  {id: 'axb', nom: 'AX + B = 2C', costat: 'e', c: 0, beta: 1, kappa: 2, A: '1,0;1,-1', B: '0,-1;-1,3', C: '1,-1;-1,0'},
  {id: 'xab', nom: 'XA − B = C', costat: 'd', c: 0, beta: -1, kappa: 1, A: '1,1;0,2', B: '-1,3;1,-2', C: '1,-7;-2,7'},
  {id: 'axx', nom: 'AX + X = B', costat: 'e', c: 1, beta: 0, kappa: 1, A: '1,1;3,0', B: '-4,4;-6,5'},
  {id: 'xa2x', nom: 'XA − 2X = B', costat: 'd', c: -2, beta: 0, kappa: 1, A: '1,0;-1,1', B: '0,2;-1,-1'},
].map(p => Object.freeze(p)));
const FIXOS = arrel.Dades.problemesFixos(PROBLEMES);
const {perId} = FIXOS;

/** Files de la pissarra. */
const FILA = Object.freeze({equacio: 0, dades: 1, dreta: 2, coef: 3, det: 4, inversa: 5, producte: 6, resposta: 7});

/* ── Matrius 2×2 de nombres ────────────────────────────────────────── */

const fr = (a, b = 1) => new Fraccio(a, b);
const llegeix = t => Mt.nombres(Mt.llegeixMatriu(t, 2, 2).A);
const I2 = [[fr(1), fr(0)], [fr(0), fr(1)]];
const suma = (P, Q, k = 1) => P.map((f, i) => f.map((x, j) => x.suma(Q[i][j].producte(k))));
const escala = (P, k) => P.map(f => f.map(x => x.producte(k)));
const producte = (P, Q) => P.map((f, i) => Q[0].map((_, j) => f.reduce((s, x, k) => s.suma(x.producte(Q[k][j])), fr(0))));
const det = P => P[0][0].producte(P[1][1]).resta(P[0][1].producte(P[1][0]));
const texM = (P, f = x => M.texNombre(x)) => {
  const files = P.map((fl, i) => fl.map((x, j) => f(x, i, j)).join(' & '));
  return `\\begin{pmatrix} ${files.join(files.some(x => x.includes('\\frac')) ? ' \\\\[6pt] ' : ' \\\\ ')} \\end{pmatrix}`;
};
const par = x => M.texEntreParentesis(x);

/** Totes les dades d'un problema: les matrius, M (el coeficient de X), la dreta R i la solució. */
function dades(p) {
  const A = llegeix(p.A), B = llegeix(p.B), C = p.C ? llegeix(p.C) : null;
  const Mm = p.c ? suma(A, I2, p.c) : A;
  const D = p.beta ? C : B;                                  // la matriu de la dreta
  const Rm = p.beta ? suma(escala(D, p.kappa), B, -p.beta) : escala(D, p.kappa);
  const d = det(Mm);
  const inv = escala([[Mm[1][1], Mm[0][1].oposada()], [Mm[1][0].oposada(), Mm[0][0]]], fr(1).quocient(d));
  const X = p.costat === 'e' ? producte(inv, Rm) : producte(Rm, inv);
  return {A, B, C, Mm, D, Rm, d, inv, X};
}

/* ── Noms ──────────────────────────────────────────────────────────── */

const nomDreta = p => (p.beta ? 'C' : 'B');
const texKappa = p => (p.kappa === 1 ? '' : String(p.kappa));
/** «A», «A + I», «A - 2I». */
const nomM = p => (p.c ? `A ${p.c > 0 ? '+' : '-'} ${Math.abs(p.c) === 1 ? '' : Math.abs(p.c)}I` : 'A');
const nomMp = p => (p.c ? `(${nomM(p)})` : 'A');
/** «2C - B», «C + B», «B». */
const texR = p => `${texKappa(p)}${nomDreta(p)}${p.beta ? (p.beta > 0 ? ' - B' : ' + B') : ''}`;
const texRp = p => (p.beta ? `(${texR(p)})` : texR(p));

function passos(valors) {
  const p = perId(valors.p);
  const dd = dades(p);
  const g = F.guio(8);
  const e = p.costat === 'e';
  const X = K('qX', 'X');
  const eq = (esq, dre, opcions) => { g.files[FILA.equacio] = esq + R('qe', '=') + dre; return opcions; };
  const termeC = () => K('qc', ` ${p.c > 0 ? '+' : '-'} ${Math.abs(p.c) === 1 ? '' : Math.abs(p.c)}X`);
  const termeB = (dreta) => K('qB', (p.beta > 0) !== dreta ? ' + B' : ' - B');
  const dretaC = K('qC', `${texKappa(p)}${nomDreta(p)}`);

  /* 1. Aïllar X, amb lletres. */
  const AX = e ? K('qA', 'A') + X : X + K('qA', 'A');
  eq(AX + (p.c ? termeC() : '') + (p.beta ? termeB(false) : ''), dretaC);
  g.afegeix(`L'equació és $${p.nom.replace('−', '-')}$. Primer, aïlla $X$ amb lletres, com en una equació de nombres; però amb compte: `
    + 'el producte de matrius no és commutatiu ($AX$ i $XA$ no són iguals).');
  if (p.beta) {
    eq(AX + (p.c ? termeC() : ''), dretaC + termeB(true));
    g.afegeix(`Passa $B$ a l'altre costat: hi arriba ${p.beta > 0 ? 'restant' : 'sumant'}, com amb els nombres.`);
  }
  let Mx = K('qA', 'A');
  if (p.c) {
    Mx = `(${K('qA', 'A')}${K('qc', ` ${p.c > 0 ? '+' : '-'} ${Math.abs(p.c) === 1 ? '' : Math.abs(p.c)}I`)})`;
    eq(e ? Mx + X : X + Mx, dretaC + (p.beta ? termeB(true) : ''));
    g.afegeix(`Treu $X$ factor comú. Compte: $X = ${e ? 'I \\cdot X' : 'X \\cdot I'}$ ($I$ és la matriu identitat), i la $X$ queda a ${e ? 'la dreta' : 'l\'esquerra'} en tots dos termes: `
      + (e ? `$AX ${p.c > 0 ? '+' : '-'} ${Math.abs(p.c) === 1 ? '' : Math.abs(p.c)}I \\cdot X = (${nomM(p)})X$.` : `$XA ${p.c > 0 ? '+' : '-'} ${Math.abs(p.c) === 1 ? '' : Math.abs(p.c)}X \\cdot I = X(${nomM(p)})$.`));
  }
  const dretaTot = dretaC + (p.beta ? termeB(true) : '');
  const inv = k => K(k, `${nomMp(p)}^{-1}`);
  const dretaP = p.beta ? `(${dretaTot})` : dretaTot;
  // Els parèntesis del membre de la dreta, destacats el primer cop: molts alumnes se'ls obliden.
  const dretaMarcada = p.beta ? `${F.marca('(', 'tria')}${dretaTot}${F.marca(')', 'tria')}` : dretaTot;
  eq(e ? inv('qL') + Mx + X : X + Mx + inv('qL'), e ? inv('qR') + dretaMarcada : dretaMarcada + inv('qR'));
  g.afegeix(`Com que ${e ? 'a l\'esquerra' : 'a la dreta'} de $X$ hi ha $${nomM(p)}$, multiplica els dos membres per $${nomMp(p)}^{-1}$ ${e ? 'per l\'esquerra (davant)' : 'per la dreta (darrere)'}: `
    + `als dos membres, pel mateix costat.`
    + (p.beta ? ` Compte amb els parèntesis: la inversa multiplica tot el membre de la dreta, $${texR(p)}$, i no només $${texKappa(p)}${nomDreta(p)}$.` : ''));
  const fusio = {qI: ['qL', 'qA'].concat(p.c ? ['qc'] : [])};
  eq(e ? K('qI', 'I') + ' \\cdot ' + X : X + ' \\cdot ' + K('qI', 'I'), e ? inv('qR') + dretaP : dretaP + inv('qR'));
  g.afegeix(`$${e ? `${nomMp(p)}^{-1}${nomMp(p)}` : `${nomMp(p)}${nomMp(p)}^{-1}`} = I$, la matriu identitat.`, {fusiona: fusio});
  eq(X, e ? inv('qR') + dretaP : dretaP + inv('qR'));
  const formula = e ? `${nomMp(p)}^{-1}${texRp(p)}` : `${texRp(p)}${nomMp(p)}^{-1}`;
  g.afegeix(`$${e ? 'I \\cdot X' : 'X \\cdot I'} = X$: ja tens $X$ aïllada, $X = ${formula}$. Ara, fes els càlculs.`);

  /* 2. Els càlculs. */
  const mats = [['A', dd.A], ['B', dd.B]].concat(dd.C ? [['C', dd.C]] : []);
  g.files[FILA.dades] = F.enLinies('', mats.map(([n, P], i) => (i ? '\\quad ' : '') + K(`D${n}`, `${n} = ${texM(P)}`) + (i < mats.length - 1 ? ',' : '')));
  g.afegeix('Les matrius de l\'enunciat.');
  if (p.beta || p.kappa !== 1) {
    const parts = [K('Rn', texR(p)), ' = ' + K('Re', (p.kappa !== 1 ? texKappa(p) : '') + texM(dd.D) + (p.beta ? (p.beta > 0 ? ' - ' : ' + ') + texM(dd.B) : ''))];
    parts.push(' = ' + K('Rv', texM(dd.Rm)));
    g.files[FILA.dreta] = F.enLinies('', parts);
    g.afegeix(`Calcula la matriu de la dreta, $${texR(p)}$: ${p.kappa !== 1 ? `multiplica cada element de $${nomDreta(p)}$ per $${p.kappa}$ i ` : ''}${p.beta > 0 ? 'resta' : 'suma'} element a element.`);
  }
  if (p.c) {
    g.files[FILA.coef] = F.enLinies('', [K('Nn', nomM(p)), ' = ' + K('Ne', texM(dd.A) + (p.c > 0 ? ' + ' : ' - ') + (Math.abs(p.c) === 1 ? '' : Math.abs(p.c)) + texM(I2)), ' = ' + K('Nv', texM(dd.Mm))]);
    g.afegeix(`Calcula $${nomM(p)}$: ${p.c > 0 ? 'suma' : 'resta'} ${Math.abs(p.c) === 1 ? '1' : Math.abs(p.c)} a cada element de la diagonal (la resta no canvia).`);
  }
  const [a, b, c, d] = [dd.Mm[0][0], dd.Mm[0][1], dd.Mm[1][0], dd.Mm[1][1]];
  g.files[FILA.det] = K('Gn', `|${nomM(p)}|`) + R('Gq', '=') + K('Gp', `${par(a)} \\cdot ${par(d)} - ${par(b)} \\cdot ${par(c)}`) + R('Gr', '=') + K('Gv', `${M.texNombre(dd.d)} \\neq 0`);
  g.afegeix(`$${nomM(p)}$ té inversa si el seu determinant és no nul: $|${nomM(p)}| = ${M.texNombre(dd.d)} \\neq 0$.`);
  const adj = [[d, b.oposada()], [c.oposada(), a]];
  // Si |M| = 1, la inversa és directament la matriu canviada (sense «1/1»).
  const pecesInv = [K('Vn', `${nomMp(p)}^{-1}`), ' = ' + K('Ve', (dd.d.igual(1) ? '' : `\\dfrac{1}{${M.texNombre(dd.d)}}`) + texM(adj))];
  if (!dd.d.igual(1)) pecesInv.push(' = ' + K('Vv', texM(dd.inv)));
  g.files[FILA.inversa] = F.enLinies('', pecesInv);
  g.afegeix('La inversa d\'una matriu 2×2: intercanvia els dos elements de la diagonal principal, canvia de signe els de la secundària, i divideix pel determinant.');
  const [P1, P2] = e ? [dd.inv, dd.Rm] : [dd.Rm, dd.inv];
  const sumes = P1.map((f, i) => P2[0].map((_, j) => `${par(f[0])} \\cdot ${par(P2[0][j])} + ${par(f[1])} \\cdot ${par(P2[1][j])}`));
  g.files[FILA.producte] = F.enLinies('', [K('Pn', 'X'), ' = ' + K('Pf', formula), ' = ' + K('Pm', texM(P1) + texM(P2))]);
  g.afegeix(`Ara el producte, en aquest ordre: $X = ${formula}$. ${e ? 'La inversa va primer.' : 'La inversa va darrere.'}`);
  // Les sumes, a la pissarra si hi caben (al mòbil); si no, al text, i a la pissarra el resultat.
  const texSumes = texM(sumes.map(f => f.map(() => null)), (x, i, j) => sumes[i][j]);
  const caben = F.ampleTex(texSumes) <= 460;
  g.files[FILA.producte] = F.enLinies('', [K('Pn', 'X'), ' = ' + K('Pf', formula), ' = ' + K('Pm', texM(P1) + texM(P2)), ' = ' + K('Ps', caben ? texSumes : texM(dd.X))]);
  g.afegeix('Files per columnes: cada element del resultat és una fila de la primera matriu per una columna de la segona'
    + (caben ? '.' : `: ${sumes.flatMap((f, i) => f.map((t, j) => `$x_{${i + 1}${j + 1}} = ${t} = ${M.texNombre(dd.X[i][j])}$`)).join(', ')}.`));
  g.files[FILA.resposta] = K('Sn', 'X') + R('Sq', '=') + K('Sv', texM(dd.X));
  g.classes[FILA.resposta] = 'final';
  g.afegeix(`Resposta: $X = ${texM(dd.X)}$.`, {cursor: {arrossega: 'Ps', fins: 'Sv'}});
  return g.passos;
}

arrel.EquacioMatricial = Object.freeze({
  titol: 'Equació matricial',
  categoria: 'algebra',
  files: 8,
  perDefecte: FIXOS.perDefecte,
  exemples: FIXOS.exemples,
  titolEditor: 'Tria una equació',
  titolExemples: 'Equacions:',
  notaEditor: 'Totes es resolen igual: aïllar X amb lletres (amb compte amb l\'ordre) i després calcular.',
  editor: [],
  problemes: PROBLEMES,
  FILA, dades,
  valida: FIXOS.valida, llegeixAdreca: FIXOS.llegeixAdreca, escriuAdreca: FIXOS.escriuAdreca,
  enunciat: v => {
    const p = perId(v.p), dd = dades(p);
    const mats = [['A', dd.A], ['B', dd.B]].concat(dd.C ? [['C', dd.C]] : []);
    return `Resol l'equació matricial $${p.nom.replace('−', '-')}$, on ${mats.map(([n, P]) => `$${n} = ${texM(P)}$`).join(p.C ? ', ' : ' i ').replace(/, ([^,]*)$/, ' i $1')}.`;
  },
  resum: FIXOS.resum, nomExemple: FIXOS.nomExemple,
  passos,
});

})(globalThis);
