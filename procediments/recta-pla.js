/* ═══════════════════════════════════════════════════════════════════
   recta-pla.js — Procediment: posició relativa d'una recta i un pla
   ───────────────────────────────────────────────────────────────────
   «Sabem que P ∈ r»: el punt genèric P_r = P + λu; «si volem que P ∈ π», dona
   una equació aλ = c (a = n · u):
     a ≠ 0          una solució: la recta talla el pla en un punt Q;
     a = 0, c ≠ 0   cap solució: la recta és paral·lela al pla;
     a = 0, c = 0   tots els λ: la recta és dins del pla.
   Després, l'esquema del cas (sense comprovacions: el David no en vol).
   Adreça: recta-pla.html?r=1,0,2;1,-1,1&pi=2,-1,1,-12 (r: el punt i el
   vector director; pi: A, B, C, D de Ax + By + Cz + D = 0).
   Totes les línies que es veuen són certes: ho comprova proves/comprova.js.
   Claus: Dr, Dp les dades; Gp… el punt genèric, la substitució i
   l'equació (geometria.js); Lv el valor de λ, Lq el punt, Lr la posició.
   ═══════════════════════════════════════════════════════════════════ */
(function (arrel) {
'use strict';

const M = arrel.Mates;
const F = arrel.Formules;
const Mt = arrel.Matrius;
const G = arrel.Geometria;
const {clau: K} = F;
const {texPunt} = G;

/** Files de la pissarra. */
const FILA = Object.freeze({dades: 0, generic: 1, substitucio: 2, desenvolupa: 3, equacio: 4, conclusio: 5, esquema: 6, comprovacio: 7});

const EXEMPLES = Object.freeze([
  {r: '1,0,2;1,-1,1', pi: '2,-1,1,-12'},     // es tallen, λ = 2
  {r: '1,2,0;2,1,-1', pi: '1,-1,1,4'},       // paral·lela
  {r: '0,1,3;1,1,2', pi: '1,1,-1,2'},        // continguda
  {r: '2,-1,0;1,2,-1', pi: '1,-2,1,1'},      // es tallen, λ fraccionari
  {r: '1,1,1;2,0,1', pi: '0,0,1,-3'},        // el pla z = 3
].map(v => Object.freeze(v)));
const PER_DEFECTE = EXEMPLES[0];

const MAXIM = 99;          // els nombres de les dades, de −99 a 99

/** La recta {P, u} i el pla {n, D} dels valors. */
function dades(v) {
  const [P, u] = Mt.nombres(Mt.llegeixMatriu(v.r, 2, 3, MAXIM).A);
  const [f] = Mt.nombres(Mt.llegeixMatriu(v.pi, 1, 4, MAXIM).A);
  return {r: {P, u}, pla: {n: f.slice(0, 3), D: f[3]}};
}

function valida(v) {
  let d;
  try {
    for (const [text, files, cols, nom] of [[v.r, 2, 3, 'La recta'], [v.pi, 1, 4, 'El pla']]) {
      try {
        const {X} = Mt.llegeixMatriu(text, files, cols, MAXIM);
        if (X) return `Aquí les dades són nombres: no hi pot haver cap paràmetre (${X}).`;
      } catch (e) {
        if (e instanceof M.ErrorLectura) return `${nom}: ${e.message.replace('La matriu', 'les dades')}`;
        throw e;
      }
    }
    d = dades(v);
  } catch (e) {
    if (e instanceof M.ErrorLectura) return e.message;
    throw e;
  }
  if (G.esZero(d.r.u)) return 'El vector director de la recta no pot ser (0, 0, 0).';
  if (G.esZero(d.pla.n)) return 'Els coeficients de x, y, z del pla no poden ser tots 0.';
  return null;
}

function llegeixAdreca(a) {
  if (a.r === undefined && a.pi === undefined) return {valors: Object.assign({}, PER_DEFECTE)};
  if (a.r === undefined || a.pi === undefined) return {error: 'A l\'adreça hi han de ser la recta (r=…) i el pla (pi=…).'};
  try {
    const net = (t, f, c) => { const {A, X} = Mt.llegeixMatriu(t, f, c, MAXIM); return Mt.textMatriu(A, X); };
    const v = {r: net(a.r, 2, 3), pi: net(a.pi, 1, 4)};
    const error = valida(v);
    return error ? {error: `L'adreça no es pot fer servir. ${error}`} : {valors: v};
  } catch (e) {
    if (e instanceof M.ErrorLectura) return {error: `No entenc les dades de l'adreça: ${e.message}`};
    throw e;
  }
}
const escriuAdreca = v => ({r: v.r, pi: v.pi});
const texDades = d => [`r:\\ ${G.texRecta(d.r)}`, `\\pi:\\ ${G.texPla(d.pla)}`];
const enunciat = v => { const t = texDades(dades(v)); return `Estudia la posició relativa de la recta $${t[0]}$ i el pla $${t[1]}$. Si es tallen, troba el punt d'intersecció.`; };
const resum = v => `\\scriptsize \\begin{array}{l} ${texDades(dades(v)).join(' \\\\ ')} \\end{array}`;

const llista = linies => (linies.length > 1 ? `\\begin{array}{l} ${linies.join(' \\\\[6pt] ')} \\end{array}` : linies[0]);

function passos(v) {
  const {r, pla} = dades(v);
  const g = F.guio(8);
  g.files[FILA.dades] = llista(texDades({r, pla}).map((t, i) => K(i ? 'Dp' : 'Dr', t)));
  g.afegeix('Els punts comuns de la recta i el pla són els punts de la recta que compleixen l\'equació del pla. Busca\'ls amb el punt genèric de la recta.');
  // Com ho diu el David: «Sabem que P ∈ r: P_r = (…)» i «Si volem que P ∈ π, cal que compleixi l'equació del pla».
  const {a, c} = G.passosPuntGenericAlPla(g, {r, pla, files: FILA, nom: 'P_r', davantGeneric: 'P \\in r:\\quad ', davantSubstitucio: 'P \\in \\pi:\\quad ',
    textos: {generic: 'Sabem que $P \\in r$: les seves coordenades són les del punt genèric de la recta, $P_r$. Cada valor de $\\lambda$ dona un punt de la recta.',
      substitucio: 'Si volem que $P \\in \\pi$, cal que compleixi l\'equació del pla. Per tant, a l\'equació de $\\pi$, canvia $x$, $y$, $z$ per les coordenades de $P_r$: '
        + 'queda una equació en $\\lambda$.'}});

  /* La conclusió, segons les solucions de aλ = c. */
  let cas, Q = null, l0 = null;
  if (!a.esZero()) {
    cas = 'secant';
    l0 = c.quocient(a);
    Q = r.P.map((x, i) => x.suma(r.u[i].producte(l0)));
    g.files[FILA.conclusio] = K('Lv', `\\lambda = ${M.texNombre(l0)}`);
    const simple = a.signe() > 0 && M.mcd(Math.abs(c.num), a.num) === 1;     // c/a ja és el resultat
    g.afegeix(`Una sola solució: $\\lambda = ${a.igual(1) ? M.texNombre(c) : `\\dfrac{${M.texNombre(c)}}{${M.texNombre(a)}}`}${simple ? '' : ` = ${M.texNombre(l0)}`}$. `
      + 'Hi ha un sol punt comú.');
    g.files[FILA.conclusio] = llista([K('Lv', `\\lambda = ${M.texNombre(l0)}`) + '\\ \\Rightarrow\\ ' + K('Lq', G.texPuntNom('Q', Q)),
      K('Lr', '\\text{La recta } r \\text{ talla el pla } \\pi \\text{ en el punt } Q')]);
    g.afegeix(`Posa $\\lambda = ${M.texNombre(l0)}$ al punt genèric: és el punt d'intersecció, $${G.texPuntNom('Q', Q)}$. La recta talla el pla en un punt (són secants).`);
  } else if (!c.esZero()) {
    cas = 'paralela';
    g.files[FILA.conclusio] = llista([K('Lv', '\\text{cap valor de } \\lambda'), K('Lr', '\\text{La recta } r \\text{ és paral}\\mathord{\\cdotp}\\text{lela al pla } \\pi')]);
    g.afegeix(`$0\\lambda = ${M.texNombre(c)}$ no es compleix per a cap $\\lambda$: la recta i el pla no tenen cap punt comú. La recta és paral·lela al pla.`);
  } else {
    cas = 'continguda';
    g.files[FILA.conclusio] = llista([K('Lv', '\\text{tots els valors de } \\lambda'), K('Lr', '\\text{La recta } r \\text{ està continguda en el pla } \\pi')]);
    g.afegeix('$0\\lambda = 0$ es compleix per a tots els $\\lambda$: tots els punts de la recta són del pla. La recta és dins del pla (continguda).');
  }
  g.files[FILA.esquema] = G.esquema({secant: 'recta-secant', paralela: 'recta-paralela', continguda: 'recta-continguda'}[cas]);
  g.classes[FILA.conclusio] = 'final';          // la resposta (sense comprovacions opcionals: el David no les vol)
  g.afegeix({
    secant: 'La recta travessa el pla: el punt $Q$ és a tots dos.',
    paralela: 'La recta no toca el pla: té la direcció d\'un vector del pla (el seu vector director és perpendicular al vector normal del pla), però passa per fora.',
    continguda: 'La recta és dins del pla: té la direcció d\'un vector del pla (el seu vector director és perpendicular al vector normal del pla) i un punt seu és del pla.',
  }[cas]);

  return g.passos;
}

arrel.RectaPla = Object.freeze({
  titol: 'Posició relativa d\'una recta i un pla',
  categoria: 'geometria',
  files: 8,
  perDefecte: PER_DEFECTE,
  exemples: EXEMPLES,
  titolEditor: 'Tria un exemple',
  titolExemples: 'Exemples:',
  notaEditor: 'També pots escriure les teves dades a l\'adreça: recta-pla.html?r=1,0,2;1,-1,1&pi=2,-1,1,-12 '
    + '(r: un punt i el vector director; pi: A, B, C, D de Ax + By + Cz + D = 0).',
  editor: [],
  FILA, EXEMPLES,
  valida, llegeixAdreca, escriuAdreca, enunciat, resum, passos,
});

})(globalThis);
