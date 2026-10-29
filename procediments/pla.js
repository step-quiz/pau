/* ═══════════════════════════════════════════════════════════════════
   pla.js — Procediment: l'equació d'un pla
   ───────────────────────────────────────────────────────────────────
   Set problemes fixos, de les maneres que surten a la PAU de donar un
   pla. La idea és sempre la mateixa: un punt i dos vectors directors
   (o un punt i un vector normal).
     tres punts · un punt i una recta · dues rectes que es tallen:
        |x − a  y − b  z − c; v₁; v₂| = 0, desenvolupat per la 1a fila;
     conté una recta i és perpendicular a un pla: el vector normal del
        pla és un vector director del pla que es busca;
     perpendicular a una recta: el vector director és el normal;
     paral·lel a un pla: el mateix vector normal, i D surt del punt;
     pla mediador: normal AB, pel punt mitjà M.
   Adreça: pla.html?p=tres (tres, punt-recta, rectes, conte-perp,
   perp-recta, paralel, mediador)
   Totes les línies que es veuen són certes: ho comprova proves/comprova.js.
   Claus: Dd les dades; e<i> els elements (punt i vectors); Gd, Gq, Gz el
   determinant; Hm<j>, Hf, Hq, Hz el desenvolupament; Pe, Pq, Pz el pla.
   Sense comprovacions (el David no les vol).
   ═══════════════════════════════════════════════════════════════════ */
(function (arrel) {
'use strict';

const M = arrel.Mates;
const F = arrel.Formules;
const G = arrel.Geometria;
const {clau: K, rel: R} = F;
const {punt, resta, escala, texPunt, texPuntNom, texRecta} = G;

/**
 * Els problemes. Cada un diu quines dades té (punts A, B, C, P; rectes r, s {P, u}; un pla π {n, D})
 * i com se'n treuen el punt i els vectors (funció «elements»).
 */
const PROBLEMES = Object.freeze([
  {id: 'tres', nom: 'Per tres punts', esquema: 'tres-punts',
    A: punt(1, 0, 1), B: punt(2, 1, 0), C: punt(0, 1, 3)},
  {id: 'punt-recta', nom: 'Per un punt i una recta', esquema: 'punt-recta',
    P: punt(1, 2, -1), r: {P: punt(0, 1, 1), u: punt(1, 0, 2)}},
  {id: 'rectes', nom: 'Dues rectes que es tallen', esquema: 'dues-rectes',
    r: {P: punt(1, 0, 0), u: punt(1, 1, 0)}, s: {P: punt(2, 1, 0), u: punt(0, 1, 2)}},
  {id: 'conte-perp', nom: 'Conté una recta i és perpendicular a un pla', esquema: 'conte-perpendicular',
    r: {P: punt(1, 0, 1), u: punt(1, 1, 0)}, pi: {n: punt(1, -1, 2), D: M.Fraccio.de(-3)}},
  {id: 'perp-recta', nom: 'Per un punt, perpendicular a una recta', esquema: 'perpendicular',
    P: punt(2, -1, 3), r: {P: punt(1, 0, 0), u: punt(1, -2, 2)}},
  {id: 'paralel', nom: 'Per un punt, paral·lel a un pla', esquema: 'paralels',
    P: punt(1, 1, 1), pi: {n: punt(2, -1, 1), D: M.Fraccio.de(-5)}},
  {id: 'mediador', nom: 'Pla mediador de dos punts', esquema: 'mediador',
    A: punt(1, 2, 0), B: punt(3, 0, 2)},
].map(p => Object.freeze(p)));
const FIXOS = arrel.Dades.problemesFixos(PROBLEMES);
const {perId} = FIXOS;

/** Files de la pissarra. */
const FILA = Object.freeze({dades: 0, esquema: 1, elements: 2, det: 3, desenvolupa: 4, pla: 5, comprovacio: 6});

const ENUNCIATS = {
  'tres': p => `Troba l'equació del pla que passa pels punts $${texPuntNom('A', p.A)}$, $${texPuntNom('B', p.B)}$ i $${texPuntNom('C', p.C)}$.`,
  'punt-recta': p => `Troba l'equació del pla que conté el punt $${texPuntNom('P', p.P)}$ i la recta $r: ${texRecta(p.r)}$.`,
  'rectes': p => `Les rectes $r: ${texRecta(p.r)}$ i $s: ${texRecta(p.s, '\\mu')}$ es tallen. Troba l'equació del pla que les conté.`,
  'conte-perp': p => `Troba l'equació del pla que conté la recta $r: ${texRecta(p.r)}$ i és perpendicular al pla $\\pi: ${G.texPla(p.pi)}$.`,
  'perp-recta': p => `Troba l'equació del pla que passa per $${texPuntNom('P', p.P)}$ i és perpendicular a la recta $r: ${texRecta(p.r)}$.`,
  'paralel': p => `Troba l'equació del pla que passa per $${texPuntNom('P', p.P)}$ i és paral·lel al pla $\\pi: ${G.texPla(p.pi)}$.`,
  'mediador': p => `Troba l'equació del pla mediador del segment d'extrems $${texPuntNom('A', p.A)}$ i $${texPuntNom('B', p.B)}$.`,
};

/** La idea de cada esquema (el text del pas que el mostra). */
const IDEES = {
  'tres-punts': '$A$, $B$ i $C$ pertanyen al pla; per tant, els vectors $\\overrightarrow{AB}$ i $\\overrightarrow{AC}$ són vectors directors del pla.',
  'punt-recta': 'La recta és dins del pla: el seu vector director $\\vec{u}$ hi és. I el vector $\\overrightarrow{QP}$ també pertany al pla.',
  'dues-rectes': 'Les dues rectes són dins del pla: els seus vectors directors, $\\vec{u}$ i $\\vec{v}$, són dos vectors directors del pla.',
  'conte-perpendicular': 'El pla $\\sigma$ que busquem conté la recta i és perpendicular a $\\pi$: el vector normal de $\\pi$, $\\vec{n}$, és paral·lel a $\\sigma$. Ja tenim dos vectors directors: $\\vec{u}$ i $\\vec{n}$.',
  'perpendicular': 'Una recta perpendicular a un pla té la direcció del vector normal del pla: el vector director de la recta, $\\vec{u}$, és un vector normal del pla.',
  'paralels': 'Dos plans paral·lels són perpendiculars a la mateixa direcció: tenen el mateix vector normal $\\vec{n}$.',
  'mediador': 'El pla mediador talla el segment $AB$ pel mig, en angle recte: passa pel punt mitjà $M$ i el vector $\\overrightarrow{AB}$ n\'és un vector normal.',
};

/** Un vector amb nom, directament amb el seu valor (David: res de «B - A», no es resten punts): «\overrightarrow{AB} = (1,\ 1,\ -1)». */
const texDif = (nom, X, Y) => `\\overrightarrow{${nom}} = ${texPunt(resta(Y, X))}`;
const llista = linies => (linies.length > 1 ? `\\begin{array}{l} ${linies.join(' \\\\[4pt] ')} \\end{array}` : linies[0]);

function passos(valors) {
  const p = perId(valors.p);
  const g = F.guio(7);
  const dades = {
    'tres': () => [texPuntNom('A', p.A), texPuntNom('B', p.B), texPuntNom('C', p.C)],
    'punt-recta': () => [texPuntNom('P', p.P), `r: ${texRecta(p.r)}`],
    'rectes': () => [`r: ${texRecta(p.r)}`, `s: ${texRecta(p.s, '\\mu')}`],
    'conte-perp': () => [`r: ${texRecta(p.r)}`, `\\pi: ${G.texPla(p.pi)}`],
    'perp-recta': () => [texPuntNom('P', p.P), `r: ${texRecta(p.r)}`],
    'paralel': () => [texPuntNom('P', p.P), `\\pi: ${G.texPla(p.pi)}`],
    'mediador': () => [texPuntNom('A', p.A), texPuntNom('B', p.B)],
  }[p.id]();
  g.files[FILA.dades] = llista(dades.map((d, i) => K(`Dd${i}`, d)));
  g.afegeix({'perp-recta': 'En aquest cas, busca un vector normal al pla i també un punt pel qual hi passi.',
    'paralel': 'En aquest cas, aprofita que els dos plans són paral·lels i treballa amb els vectors normals.',
    'mediador': 'En aquest cas, intenta aconseguir el vector normal del pla que estàs buscant.'}[p.id]
    || 'Pots escriure l\'equació d\'un pla si tens un punt pel qual passa i també dos vectors directors.');
  g.files[FILA.esquema] = G.esquema(p.esquema);
  g.afegeix(IDEES[p.esquema]);
  const elements = linies => { g.files[FILA.elements] = llista(linies.map((l, i) => K(`e${i}`, l))); };
  let pla;

  if (['tres', 'punt-recta', 'rectes', 'conte-perp'].includes(p.id)) {
    /* Un punt i dos vectors directors: el determinant. */
    let P, v1, v2, nomP = 'P';
    if (p.id === 'tres') {
      [P, v1, v2] = [p.A, resta(p.B, p.A), resta(p.C, p.A)];
      nomP = 'A';
      elements([texPuntNom('A', P), texDif('AB', p.A, p.B), texDif('AC', p.A, p.C)]);
      g.afegeix('Calcula $\\overrightarrow{AB}$ i $\\overrightarrow{AC}$.');
    } else if (p.id === 'punt-recta') {
      [P, v1, v2] = [p.r.P, p.r.u, resta(p.P, p.r.P)];
      nomP = 'Q';
      elements([`${texPuntNom('Q', P)} \\in r`, `\\vec{u} = ${texPunt(v1)}`, texDif('QP', p.r.P, p.P)]);
      g.afegeix('El punt $Q$ pertany a la recta, però també al pla; pots trobar dos vectors directors del pla: el de la recta, $\\vec{u}$; i també el vector que va de $Q$ a $P$.');
    } else if (p.id === 'rectes') {
      [P, v1, v2] = [p.r.P, p.r.u, p.s.u];
      elements([`${texPuntNom('P', P)} \\in r`, `\\vec{u} = ${texPunt(v1)}`, `\\vec{v} = ${texPunt(v2)}`]);
      g.afegeix('Un punt d\'una de les rectes (és del pla) i els dos vectors directors, $\\vec{u}$ i $\\vec{v}$: les dues rectes són al pla.');
    } else {
      [P, v1, v2] = [p.r.P, p.r.u, p.pi.n];
      elements([`${texPuntNom('P', P)} \\in r`, `\\vec{u} = ${texPunt(v1)}`, `\\vec{n}_{\\pi} = ${texPunt(v2)}`]);
      g.afegeix('Un punt de la recta i el seu vector director, $\\vec{u}$ (la recta és al pla). El segon vector director: el vector normal de $\\pi$. '
        + 'Si el pla que busquem és perpendicular a $\\pi$, la recta perpendicular a $\\pi$ (la de direcció $\\vec{n}_{\\pi}$) hi és paral·lela.');
    }
    pla = G.passosPlaDeterminant(g, {P, v1, v2, files: FILA, nomP});
  } else if (p.id === 'perp-recta') {
    elements([texPuntNom('P', p.P), `\\vec{n} = \\vec{u} = ${texPunt(p.r.u)}`]);
    g.afegeix('Si la recta és perpendicular al pla, el seu vector director és perpendicular al pla: és un vector normal.');
    pla = G.passosPlaNormal(g, {P: p.P, n: p.r.u, files: FILA, text: 'Un pla de vector normal $\\vec{n} = (A,\\ B,\\ C)$ que passa per $P(a,\\ b,\\ c)$: '
      + '$A(x - a) + B(y - b) + C(z - c) = 0$.'});
  } else if (p.id === 'paralel') {
    const n = p.pi.n;
    elements([texPuntNom('P', p.P), `\\vec{n} = \\vec{n}_{\\pi} = ${texPunt(n)}`]);
    g.afegeix('Dos plans paral·lels tenen el mateix vector normal (mira l\'esquema): el pla que busquem és $' + G.texEsquerre(n, null) + ' + D = 0$, i només falta $D$.');
    g.files[FILA.desenvolupa] = K('Hf', `${G.texEsquerre(n, null)} + D`) + R('Hq', '=') + K('Hz', '0');
    g.afegeix('Escriu l\'equació amb la $D$ per determinar.');
    const sub = G.texSubstitucio(n, null, p.P);
    const D = G.escalar(n, p.P).oposada();
    g.files[FILA.desenvolupa] = K('Hf', `${sub} + D`) + R('Hq', '=') + K('Hz', '0') + '\\ \\Rightarrow\\ ' + K('HD', `D = ${M.texNombre(D)}`);
    g.afegeix(`$P$ és del pla: substitueix-hi les seves coordenades. Queda una equació en $D$: $D = ${M.texNombre(D)}$.`);
    g.files[FILA.pla] = K('Pe', G.texEsquerre(n, D)) + R('Pq', '=') + K('Pz', '0');
    g.afegeix('Substitueix el valor de $D$ a l\'equació.');
    pla = {n, D};
  } else {
    const Mm = p.A.map((x, i) => x.suma(p.B[i]).quocient(2));
    const AB = resta(p.B, p.A);
    // El punt mitjà, sense signe igual (David): primer les mitjanes, després el punt.
    const mitjana = j => `\\tfrac{${M.texNombre(p.A[j])} + ${M.texNombre(p.B[j])}}{2}`;
    elements([`M\\left(${[0, 1, 2].map(mitjana).join(',\\ ')}\\right)`, `\\vec{n} = ${texDif('AB', p.A, p.B)}`]);
    g.afegeix('El pla mediador és perpendicular al segment $AB$ pel seu punt mitjà $M$: les coordenades de $M$ són les mitjanes de les de $A$ i $B$, i un vector normal és $\\overrightarrow{AB}$.');
    elements([texPuntNom('M', Mm), `\\vec{n} = ${texDif('AB', p.A, p.B)}`]);
    g.afegeix(`Calcula les coordenades del punt mig $M$: $${texPuntNom('M', Mm)}$.`);
    pla = G.passosPlaNormal(g, {P: Mm, n: AB, files: FILA, text: 'L\'equació del pla serà la següent: $A(x - a) + B(y - b) + C(z - c) = 0$.'});
  }

  // Sense comprovacions opcionals (David: quan es troba la solució, s'ha acabat).
  g.classes[FILA.pla] = 'final';
  g.afegeix(`Resposta: $${G.texPla(pla)}$.`);
  return g.passos;
}

arrel.Pla = Object.freeze({
  titol: 'Equació d\'un pla',
  categoria: 'geometria',
  files: 7,
  perDefecte: FIXOS.perDefecte,
  exemples: FIXOS.exemples,
  titolEditor: 'Tria un problema',
  notaEditor: 'Sempre cal un punt i dos vectors directors (o un punt i un vector normal).',
  editor: [],
  problemes: PROBLEMES,
  FILA,
  valida: FIXOS.valida, llegeixAdreca: FIXOS.llegeixAdreca, escriuAdreca: FIXOS.escriuAdreca,
  enunciat: v => ENUNCIATS[v.p](perId(v.p)),
  resum: FIXOS.resum, nomExemple: FIXOS.nomExemple,
  passos,
});

})(globalThis);
