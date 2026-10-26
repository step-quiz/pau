/* ═══════════════════════════════════════════════════════════════════
   projeccions.js — Procediment: projeccions i punts simètrics
   ───────────────────────────────────────────────────────────────────
   Quatre problemes fixos, tots amb el punt genèric:
     projecció d'un punt sobre un pla: la recta perpendicular al pla
        per P (vector director n), el seu punt genèric imposat al pla
        → λ → Q (el peu de la perpendicular; Q, no H: David);
     simètric respecte d'un pla: Q és el punt mitjà de P i P′:
        P′ = 2Q − P;
     projecció d'un punt sobre una recta: el punt genèric R_λ de la
        recta; PR_λ ha de ser perpendicular a u: PR_λ · u = 0 → λ → Q
        (el punt de la recta més proper a P);
     simètric respecte d'una recta: P′ = 2Q − P.
   L'esquema mostra P′ només als problemes del simètric.
   Adreça: projeccions.html?p=punt-pla (punt-pla, simetric-pla,
   punt-recta, simetric-recta)
   Totes les línies que es veuen són certes: ho comprova proves/comprova.js.
   Claus: Dd les dades; Rs la recta perpendicular, o Xg el punt genèric
   de la recta; G… el punt genèric, la condició i l'equació
   (geometria.js); Hl, Hp el peu; Sp el simètric.
   ═══════════════════════════════════════════════════════════════════ */
(function (arrel) {
'use strict';

const M = arrel.Mates;
const F = arrel.Formules;
const G = arrel.Geometria;
const {clau: K, rel: R} = F;
const {punt, resta, texPunt, texPla, texRecta} = G;
const fr = (a, b = 1) => new M.Fraccio(a, b);

const PROBLEMES = Object.freeze([
  {id: 'punt-pla', nom: 'Projecció d\'un punt sobre un pla', P: punt(1, 2, 3), pi: {n: punt(1, 1, 1), D: fr(-3)}},
  {id: 'simetric-pla', nom: 'Simètric respecte d\'un pla', P: punt(3, 1, -1), pi: {n: punt(2, -1, 1), D: fr(2)}},
  {id: 'punt-recta', nom: 'Projecció d\'un punt sobre una recta', P: punt(5, 0, 3), r: {P: punt(0, 0, 1), u: punt(1, 2, 2)}},
  {id: 'simetric-recta', nom: 'Simètric respecte d\'una recta', P: punt(2, 0, 1), r: {P: punt(1, 1, 0), u: punt(1, 0, 1)}},
].map(p => Object.freeze(p)));
const FIXOS = arrel.Dades.problemesFixos(PROBLEMES);
const {perId} = FIXOS;

/** Files de la pissarra. */
const FILA = Object.freeze({dades: 0, esquema: 1, recta: 2, generic: 3, substitucio: 4, desenvolupa: 5, equacio: 6, peu: 7, simetric: 8});

const ENUNCIATS = {
  'punt-pla': p => `Troba la projecció ortogonal del punt $P = ${texPunt(p.P)}$ sobre el pla $\\pi: ${texPla(p.pi)}$.`,
  'simetric-pla': p => `Troba el punt simètric de $P = ${texPunt(p.P)}$ respecte del pla $\\pi: ${texPla(p.pi)}$.`,
  'punt-recta': p => `Troba la projecció ortogonal del punt $P = ${texPunt(p.P)}$ sobre la recta $r: ${texRecta(p.r)}$ (el punt de la recta més proper a $P$).`,
  'simetric-recta': p => `Troba el punt simètric de $P = ${texPunt(p.P)}$ respecte de la recta $r: ${texRecta(p.r)}$.`,
};

const llista = (linies, espai = '6pt') => (linies.length > 1 ? `\\begin{array}{l} ${linies.join(` \\\\[${espai}] `)} \\end{array}` : linies[0]);

function passos(valors) {
  const p = perId(valors.p);
  const g = F.guio(9);
  const pla = Boolean(p.pi);
  g.files[FILA.dades] = llista([K('Dd0', `P = ${texPunt(p.P)}`), K('Dd1', pla ? `\\pi:\\ ${texPla(p.pi)}` : `r:\\ ${texRecta(p.r)}`)]);
  g.afegeix('Primer, què dona l\'enunciat.');
  // El punt projectat es diu Q (David: Q, no H). El simètric P′ només surt si el demanen.
  const simetric = p.id.startsWith('simetric');
  g.files[FILA.esquema] = G.esquema(`${simetric ? 'simetric' : 'projeccio'}-${pla ? 'pla' : 'recta'}`);
  g.afegeix((pla ? 'La projecció de $P$ sobre el pla és el peu $Q$ de la perpendicular al pla que passa per $P$.'
    : 'La projecció de $P$ sobre la recta és el punt $Q$ de la recta tal que $\\overrightarrow{PQ}$ és perpendicular a la recta: és el punt de la recta més proper a $P$.')
    + (simetric ? ` El simètric $P'$ és a l'altra banda, a la mateixa distància: $Q$ és el punt mitjà de $P$ i $P'$.` : ''));
  let Qp;
  if (pla) {
    /* La recta perpendicular al pla per P, i el seu punt genèric imposat al pla. */
    const s = {P: p.P, u: p.pi.n};
    g.files[FILA.recta] = K('Rs', `s:\\ ${texRecta(s)}`);
    g.afegeix(`La recta $s$ perpendicular al pla que passa per $P$: el seu vector director és el vector normal del pla, $\\vec{n} = ${texPunt(p.pi.n)}$.`);
    const {a, c} = G.passosPuntGenericAlPla(g, {r: s, pla: p.pi, files: FILA,
      textos: {generic: 'El punt genèric de $s$: cada valor de $\\lambda$ en dona un punt.',
        substitucio: 'El peu $Q$ és el punt de $s$ que és del pla: imposa que $P_{\\lambda}$ compleixi l\'equació de $\\pi$.'}});
    const l0 = c.quocient(a);
    Qp = s.P.map((x, i) => x.suma(s.u[i].producte(l0)));
    g.files[FILA.peu] = K('Hl', `\\lambda = ${M.texNombre(l0)}`) + '\\ \\Rightarrow\\ ' + K('Hp', `Q = ${texPunt(Qp)}`);
    if (!simetric) g.classes[FILA.peu] = 'final';
    g.afegeix(`$\\lambda = ${M.texNombre(l0)}$. Posa-ho al punt genèric de $s$: és el peu de la perpendicular, $Q = ${texPunt(Qp)}$.`
      + (simetric ? '' : ` Resposta: la projecció de $P$ sobre $\\pi$ és $Q = ${texPunt(Qp)}$.`));
  } else {
    /* El punt genèric de la recta, R_λ (mai X per a un punt: David), i la condició PR_λ · u = 0. */
    const r = p.r;
    g.files[FILA.recta] = K('Xg', `R_{\\lambda} = ${G.texGeneric(r)}`);
    g.afegeix('Un punt qualsevol de la recta: el punt genèric $R_{\\lambda}$.');
    const PR = {P: resta(r.P, p.P), u: r.u};
    const {a, c} = G.passosPuntGenericAlPla(g, {r: PR, pla: {n: r.u, D: null}, files: FILA, nom: '\\overrightarrow{PR_{\\lambda}}', etiqueta: '\\overrightarrow{PR_{\\lambda}} \\cdot \\vec{u}',
      textos: {generic: 'El vector que va de $P$ a $R_{\\lambda}$: $R_{\\lambda} - P$.',
        substitucio: `$Q$ és el punt $R_{\\lambda}$ per al qual $\\overrightarrow{PR_{\\lambda}}$ és perpendicular a la recta: el producte escalar amb $\\vec{u} = ${texPunt(r.u)}$ ha de ser $0$, `
          + '$\\overrightarrow{PR_{\\lambda}} \\cdot \\vec{u} = 0$.'}});
    const l0 = c.quocient(a);
    Qp = r.P.map((x, i) => x.suma(r.u[i].producte(l0)));
    g.files[FILA.peu] = K('Hl', `\\lambda = ${M.texNombre(l0)}`) + '\\ \\Rightarrow\\ ' + K('Hp', `Q = ${texPunt(Qp)}`);
    if (!simetric) g.classes[FILA.peu] = 'final';
    g.afegeix(`$\\lambda = ${M.texNombre(l0)}$. Posa-ho al punt genèric de la recta: és la projecció, $Q = ${texPunt(Qp)}$.`
      + (simetric ? '' : ` Resposta: $Q = ${texPunt(Qp)}$ (i la distància de $P$ a la recta és $|\\overrightarrow{PQ}|$).`));
  }
  if (simetric) {
    const S = Qp.map((q, i) => q.producte(2).resta(p.P[i]));
    const comps = Qp.map((q, i) => `2 \\cdot ${M.texEntreParentesis(q)} - ${M.texEntreParentesis(p.P[i])}`);
    g.files[FILA.simetric] = F.enLinies(K('Sl', 'P\'') + R('Sq', '=') + K('Sf', '2Q - P'), [' = ' + K('Sc', `(${comps.join(',\\ ')})`), ' = ' + K('Sp', texPunt(S))]);
    g.classes[FILA.simetric] = 'final';
    g.afegeix(`$Q$ és el punt mitjà de $P$ i $P'$: $Q = \\dfrac{P + P'}{2}$, i per tant $P' = 2Q - P$. Resposta: $P' = ${texPunt(S)}$.`);
  }
  return g.passos;
}

arrel.Projeccions = Object.freeze({
  titol: 'Projeccions i simètrics',
  categoria: 'geometria',
  files: 9,
  perDefecte: FIXOS.perDefecte,
  exemples: FIXOS.exemples,
  titolEditor: 'Tria un problema',
  notaEditor: 'Sempre amb el punt genèric: d\'una recta perpendicular al pla, o de la mateixa recta.',
  editor: [],
  problemes: PROBLEMES,
  FILA,
  valida: FIXOS.valida, llegeixAdreca: FIXOS.llegeixAdreca, escriuAdreca: FIXOS.escriuAdreca,
  enunciat: v => ENUNCIATS[v.p](perId(v.p)),
  resum: FIXOS.resum, nomExemple: FIXOS.nomExemple,
  passos,
});

})(globalThis);
