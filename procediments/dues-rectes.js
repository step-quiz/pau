/* ═══════════════════════════════════════════════════════════════════
   dues-rectes.js — Procediment: posició relativa de dues rectes
   ───────────────────────────────────────────────────────────────────
   r: P + λu i s: Q + μv.
     · Els vectors directors: proporcionals (paral·leles o coincidents)
       o no (es tallen o es creuen).
     · No proporcionals: els punts genèrics iguals, P + λu = Q + μv, són
       3 equacions amb λ i μ. Dues (de determinant no nul) per Cramer;
       la tercera, amb aquests λ i μ: si es compleix, es tallen (el punt
       X); si no, es creuen. Comprovació: el determinant de PQ, u, v
       (0 si són en un mateix pla).
     · Proporcionals: el punt genèric de r igual a Q: el mateix λ a les
       tres equacions (Q és de r: coincidents) o no (paral·leles).
       Comprovació: PQ proporcional a u, o no.
   Adreça: dues-rectes.html?r=1,0,2;1,1,-1&s=2,3,-1;1,-1,1 (cada recta:
   un punt i el vector director).
   Totes les línies que es veuen són certes: ho comprova proves/comprova.js.
   Claus: Dr, Ds les dades; Ku, Kv, Kp els vectors directors; Ia, Ib la
   igualtat; E<i> les equacions; Xl…, Xm… Cramer; Tq la tercera
   equació; Lv, Lr la conclusió; Cq, Cd la comprovació.
   ═══════════════════════════════════════════════════════════════════ */
(function (arrel) {
'use strict';

const M = arrel.Mates;
const F = arrel.Formules;
const Mt = arrel.Matrius;
const G = arrel.Geometria;
const {clau: K} = F;
const {texPunt, resta} = G;
const L = '\\lambda', MU = '\\mu';

/** Files de la pissarra. */
const FILA = Object.freeze({dades: 0, direccions: 1, igualtat: 2, sistema: 3, cramer: 4, tercera: 5, conclusio: 6, esquema: 7, comprovacio: 8});

const EXEMPLES = Object.freeze([
  {r: '1,0,2;1,1,-1', s: '2,3,-1;1,-1,1'},     // es tallen
  {r: '1,0,0;1,1,0', s: '0,0,2;0,1,1'},        // es creuen
  {r: '1,2,0;1,-1,2', s: '0,1,1;-2,2,-4'},     // paral·leles
  {r: '1,0,1;2,1,-1', s: '5,2,-1;-4,-2,2'},    // coincidents
  {r: '0,0,0;2,0,2', s: '1,-2,2;0,2,-1'},      // es tallen, λ fraccionari
  {r: '1,0,0;0,1,1', s: '2,0,1;0,1,-1'},       // es creuen: la 1a equació és 0 = 1 (no cal Cramer)
].map(v => Object.freeze(v)));
const PER_DEFECTE = EXEMPLES[0];
const MAXIM = 99;

/** Les rectes r = {P, u} i s = {P, u} dels valors. */
function dades(v) {
  const recta = t => { const [P, u] = Mt.nombres(Mt.llegeixMatriu(t, 2, 3, MAXIM).A); return {P, u}; };
  return {r: recta(v.r), s: recta(v.s)};
}

function valida(v) {
  for (const [t, nom] of [[v.r, 'r'], [v.s, 's']]) {
    try {
      const {X} = Mt.llegeixMatriu(t, 2, 3, MAXIM);
      if (X) return `Aquí les dades són nombres: no hi pot haver cap paràmetre (${X}).`;
    } catch (e) {
      if (e instanceof M.ErrorLectura) return `La recta ${nom}: ${e.message.replace('La matriu', 'les dades')}`;
      throw e;
    }
  }
  const {r, s} = dades(v);
  if (G.esZero(r.u) || G.esZero(s.u)) return 'El vector director d\'una recta no pot ser (0, 0, 0).';
  return null;
}

function llegeixAdreca(a) {
  if (a.r === undefined && a.s === undefined) return {valors: Object.assign({}, PER_DEFECTE)};
  if (a.r === undefined || a.s === undefined) return {error: 'A l\'adreça hi han de ser les dues rectes (r=… i s=…).'};
  try {
    const net = t => { const {A, X} = Mt.llegeixMatriu(t, 2, 3, MAXIM); return Mt.textMatriu(A, X); };
    const v = {r: net(a.r), s: net(a.s)};
    const error = valida(v);
    return error ? {error: `L'adreça no es pot fer servir. ${error}`} : {valors: v};
  } catch (e) {
    if (e instanceof M.ErrorLectura) return {error: `No entenc les dades de l'adreça: ${e.message}`};
    throw e;
  }
}
const escriuAdreca = v => ({r: v.r, s: v.s});
const texDades = ({r, s}) => [`r:\\ ${G.texRecta(r)}`, `s:\\ ${G.texRecta(s, MU)}`];
const enunciat = v => { const t = texDades(dades(v)); return `Estudia la posició relativa de les rectes $${t[0]}$ i $${t[1]}$. Si es tallen, troba el punt d'intersecció.`; };
const resum = v => `\\scriptsize \\begin{array}{l} ${texDades(dades(v)).join(' \\\\ ')} \\end{array}`;

const llista = (linies, espai = '6pt') => (linies.length > 1 ? `\\begin{array}{l} ${linies.join(` \\\\[${espai}] `)} \\end{array}` : linies[0]);
const sistema = linies => `\\left\\{\\begin{array}{l} ${linies.join(' \\\\ ')} \\end{array}\\right.`;

function passos(v) {
  const {r, s} = dades(v);
  const g = F.guio(9);
  g.files[FILA.dades] = llista(texDades({r, s}).map((t, i) => K(i ? 'Ds' : 'Dr', t)));
  g.afegeix('Dues rectes de l\'espai poden ser coincidents, paral·leles, secants (es tallen) o es poden creuar (no es tallen ni són paral·leles). '
    + 'Primer, mira els vectors directors.');
  const prop = G.texProporcio(r.u, s.u, '\\vec{u}', '\\vec{v}', 'u', 'v');
  const vectors = K('Ku', `\\vec{u} = ${texPunt(r.u)}`) + ',\\qquad ' + K('Kv', `\\vec{v} = ${texPunt(s.u)}`);
  g.files[FILA.direccions] = llista([vectors, K('Kp', prop.tex + (prop.proporcionals ? '\\ \\Rightarrow\\ \\vec{u} \\parallel \\vec{v}' : '\\ \\Rightarrow\\ \\vec{u} \\nparallel \\vec{v}'))]);
  g.afegeix(prop.proporcionals
    ? 'Els vectors directors són proporcionals: les rectes tenen la mateixa direcció. Són paral·leles o coincidents (la mateixa recta).'
    : 'Els vectors directors no són proporcionals' + (prop.tex.includes('dfrac') ? ' (les seves components no van en la mateixa proporció)' : ' (on $\\vec{v}$ té un $0$, $\\vec{u}$ no en té)')
      + ': les rectes no tenen la mateixa direcció. Es tallen o es creuen.');
  const PQ = resta(s.P, r.P);
  const generic = G.texGeneric(r);

  if (prop.proporcionals) {
    /* Paral·leles o coincidents: Q és de r? */
    g.files[FILA.igualtat] = K('Ia', generic) + ' = ' + K('Ib', texPunt(s.P));
    g.afegeix('Són coincidents si el punt $Q$ de $s$ també és de $r$. Iguala el punt genèric de $r$ a $Q$.');
    const eqs = [0, 1, 2].map(i => K(`E${i + 1}`, `${Mt.texLineal([r.P[i], r.u[i]])} = ${M.texNombre(s.P[i])}`));
    g.files[FILA.sistema] = sistema(eqs);
    g.afegeix('Una equació per coordenada.');
    const sols = [0, 1, 2].map(i => (r.u[i].esZero() ? null : PQ[i].quocient(r.u[i])));
    const cert = [0, 1, 2].every(i => !r.u[i].esZero() || PQ[i].esZero());
    const valors = sols.filter(x => x);
    const coincidents = cert && valors.every(x => x.igual(valors[0]));
    g.files[FILA.sistema] = sistema([0, 1, 2].map(i => K(`E${i + 1}`, r.u[i].esZero() ? Mt.texEquacio([r.u[i]], PQ[i], [L]) : `${L} = ${M.texNombre(sols[i])}`)));
    g.afegeix('Aïlla $\\lambda$ a cada equació' + (sols.some(x => !x) ? ' (on el coeficient de $\\lambda$ és $0$, queda una igualtat de nombres)' : '') + '.');
    g.files[FILA.conclusio] = llista(coincidents
      ? [K('Lv', '\\text{el mateix } \\lambda\\ \\Rightarrow\\ Q \\in r'), K('Lr', 'r = s')]
      : [K('Lv', '\\text{cap } \\lambda \\text{ les compleix totes}\\ \\Rightarrow\\ Q \\notin r'), K('Lr', 'r \\parallel s')]);
    g.afegeix(coincidents ? 'Totes les equacions donen el mateix $\\lambda$: $Q$ és de $r$. Les rectes tenen la mateixa direcció i un punt comú: són la mateixa recta (coincidents).'
      : 'No hi ha cap $\\lambda$ que compleixi les tres equacions: $Q$ no és de $r$. Les rectes tenen la mateixa direcció però no cap punt comú: són paral·leles.');
    g.files[FILA.esquema] = G.esquema(coincidents ? 'rectes-coincidents' : 'rectes-paraleles');
    g.afegeix(coincidents ? 'Una sola recta: $P$ i $Q$ en són dos punts.' : 'Dues rectes amb la mateixa direcció, a una certa distància.');
    const pq = G.texProporcio(r.u, PQ, '\\vec{u}', '\\overrightarrow{PQ}', 'u', 'PQ');
    g.files[FILA.comprovacio] = llista([K('Cq', `\\overrightarrow{PQ} = Q - P = ${texPunt(PQ)}`),
      K('Cd', pq.tex + (pq.proporcionals ? '\\ \\Rightarrow\\ \\overrightarrow{PQ} \\parallel \\vec{u}' : '\\ \\Rightarrow\\ \\overrightarrow{PQ} \\nparallel \\vec{u}'))]);
    g.classes[FILA.conclusio] = 'final';
    g.afegeix(coincidents ? 'Comprovació: el vector $\\overrightarrow{PQ}$ té la direcció de $\\vec{u}$ (Q és a la recta que passa per P amb direcció $\\vec{u}$). Són coincidents.'
      : 'Comprovació: el vector $\\overrightarrow{PQ}$ no té la direcció de $\\vec{u}$: $Q$ no és de $r$. Són paral·leles.');
    return g.passos;
  }

  /* Es tallen o es creuen: P + λu = Q + μv. */
  g.files[FILA.igualtat] = F.enLinies(K('Ia', generic), [' = ' + K('Ib', G.texGeneric(s, MU))]);
  g.afegeix('Un punt comú seria de les dues rectes: iguala el punt genèric de $r$ (amb $\\lambda$) i el de $s$ (amb $\\mu$). '
    + 'Cada recta té el seu paràmetre.');
  g.files[FILA.sistema] = sistema([0, 1, 2].map(i => K(`E${i + 1}`, `${Mt.texLineal([r.P[i], r.u[i]])} = ${Mt.texLineal([s.P[i], s.u[i]], MU)}`)));
  g.afegeix('Una equació per coordenada: 3 equacions amb 2 incògnites, $\\lambda$ i $\\mu$.');
  const S = [0, 1, 2].map(i => [r.u[i], s.u[i].oposada(), PQ[i]]);           // uλ − vμ = Q − P
  const texE = (i, marca = '') => K(`E${i + 1}`, Mt.texEquacio(S[i].slice(0, 2), S[i][2], [L, MU]), marca);
  g.files[FILA.sistema] = sistema([0, 1, 2].map(i => texE(i)));
  g.afegeix('Passa les incògnites a l\'esquerra i els nombres a la dreta.');
  const impossible = [0, 1, 2].find(c => S[c][0].esZero() && S[c][1].esZero() && !S[c][2].esZero());
  let tallen = false, l0 = null, m0 = null;
  if (impossible !== undefined) {
    // Una equació «0 = c» amb c ≠ 0: el sistema no té solució, sense fer res més.
    g.files[FILA.sistema] = sistema([0, 1, 2].map(c => texE(c, c === impossible ? 'menys' : '')));
    g.afegeix(`L'equació ${impossible + 1} és $0 = ${M.texNombre(S[impossible][2])}$: no es compleix mai. El sistema no té solució: no hi ha cap punt comú.`);
  } else {
    const det = (i, j) => Mt.det2N([S[i].slice(0, 2), S[j].slice(0, 2)]);
    const [i, j] = [[0, 1], [0, 2], [1, 2]].find(([a, b]) => !det(a, b).esZero());
    const k = [0, 1, 2].find(c => c !== i && c !== j);
    g.files[FILA.sistema] = sistema([0, 1, 2].map(c => texE(c, c === k ? 'tria' : 'mes')));
    g.afegeix(`Resol el sistema de les equacions ${i + 1} i ${j + 1} (en verd): el seu determinant, $${Mt.texDet2N([S[i].slice(0, 2), S[j].slice(0, 2)])} = ${M.texNombre(det(i, j))}$, no és $0$. `
      + `Després, mira si la solució també compleix l'equació ${k + 1} (en groc).`);
    [l0, m0] = G.passosCramer2(g, {S: [S[i], S[j]], vars: [L, MU], claus: ['l', 'm'], fila: FILA.cramer});
    const vk = S[k][0].producte(l0).suma(S[k][1].producte(m0));
    tallen = vk.igual(S[k][2]);
    const sub = G.texSubstitucio(S[k].slice(0, 2), null, [l0, m0]) || '0';
    g.files[FILA.tercera] = K('Tq', `${k + 1}\\text{a}:\\quad ${sub} = ${M.texNombre(vk)}${tallen ? '' : ` \\neq ${M.texNombre(S[k][2])}`}`);
    g.afegeix(`L'equació ${k + 1} amb $\\lambda = ${M.texNombre(l0)}$ i $\\mu = ${M.texNombre(m0)}$: ${tallen ? `es compleix (val $${M.texNombre(S[k][2])}$). Hi ha un punt comú.`
      : `no es compleix (hauria de valer $${M.texNombre(S[k][2])}$). El sistema no té solució: no hi ha cap punt comú.`}`);
  }
  let X = null;
  if (tallen) {
    X = r.P.map((x, c) => x.suma(r.u[c].producte(l0)));
    g.files[FILA.conclusio] = llista([K('Lv', `${L} = ${M.texNombre(l0)}\\ \\Rightarrow\\ X = ${texPunt(X)}`), K('Lr', 'r \\cap s = \\{X\\}')]);
    g.afegeix(`Posa $\\lambda = ${M.texNombre(l0)}$ al punt genèric de $r$ (o $\\mu = ${M.texNombre(m0)}$ al de $s$): és el punt d'intersecció, $X = ${texPunt(X)}$. Les rectes es tallen.`);
  } else {
    g.files[FILA.conclusio] = llista([K('Lv', 'r \\cap s = \\varnothing,\\quad \\vec{u} \\nparallel \\vec{v}'), K('Lr', 'r \\text{ i } s \\text{ es creuen}')]);
    g.afegeix('Cap punt comú i direccions diferents: les rectes es creuen (no són en un mateix pla).');
  }
  g.files[FILA.esquema] = G.esquema(tallen ? 'rectes-es-tallen' : 'rectes-es-creuen');
  g.afegeix(tallen ? 'Dues rectes que es tallen en un punt $X$: són en un mateix pla.' : 'Dues rectes que es creuen: $s$ passa per davant o per darrere de $r$ sense tocar-la.');
  const B = [PQ, r.u, s.u];
  const D3 = Mt.det3N(B);
  g.files[FILA.comprovacio] = llista([K('Cq', `\\overrightarrow{PQ} = Q - P = ${texPunt(PQ)}`),
    F.enLinies(K('Cd', Mt.texVmatriuN(B)) + ' = ', [K('Cs', Mt.texSarrusN(B))], {final: ' = ' + K('Cv', M.texNombre(D3) + (D3.esZero() ? '' : ' \\neq 0'))})], '10pt');
  g.classes[FILA.conclusio] = 'final';
  g.afegeix(`Comprovació: el determinant de $\\overrightarrow{PQ}$, $\\vec{u}$ i $\\vec{v}$ (per Sarrus) ${D3.esZero() ? 'val $0$: els tres vectors són en un mateix pla, i les rectes també (es tallen)'
    : 'no val $0$: els tres vectors no són en un mateix pla, i les rectes tampoc (es creuen)'}.`);
  return g.passos;
}

arrel.DuesRectes = Object.freeze({
  titol: 'Posició relativa de dues rectes',
  categoria: 'geometria',
  files: 9,
  perDefecte: PER_DEFECTE,
  exemples: EXEMPLES,
  titolEditor: 'Tria un exemple',
  titolExemples: 'Exemples:',
  notaEditor: 'També pots escriure les teves rectes a l\'adreça: dues-rectes.html?r=1,0,2;1,1,-1&s=2,3,-1;1,-1,1 '
    + '(cada recta: un punt i el vector director).',
  editor: [],
  FILA, EXEMPLES,
  valida, llegeixAdreca, escriuAdreca, enunciat, resum, passos,
});

})(globalThis);
