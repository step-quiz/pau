/* ═══════════════════════════════════════════════════════════════════
   dues-rectes.js — Procediment: posició relativa de dues rectes
   ───────────────────────────────────────────────────────────────────
   r: P + λu i s: Q + μv.
     · Els vectors directors: proporcionals (paral·leles o coincidents)
       o no (es tallen o es creuen).
     · No proporcionals: les equacions paramètriques de r i de s; els
       punts genèrics iguals, P + λu = Q + μv, són 3 equacions amb λ i μ.
       Dues (no proporcionals) pel mètode de reducció; la tercera, amb
       aquests λ i μ, destacada: si es compleix, es tallen (el punt R);
       si no, es creuen.
     · Proporcionals: el punt genèric de r igual a Q: el mateix λ a les
       tres equacions (Q és de r: coincidents) o no (paral·leles).
     · Sense comprovacions (el David no les vol).
   Adreça: dues-rectes.html?r=1,0,2;1,1,-1&s=2,3,-1;1,-1,1 (cada recta:
   un punt i el vector director).
   Totes les línies que es veuen són certes: ho comprova proves/comprova.js.
   Claus: Dr, Ds les dades; Ku, Kv, Kp els vectors directors; Pr, Ps les
   equacions paramètriques; Ia, Ib la igualtat; E<i> les equacions; X<n>
   la reducció; Tq la tercera equació; Lv, Lr la conclusió.
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
const FILA = Object.freeze({dades: 0, direccions: 1, igualtat: 2, sistema: 3, reduccio: 4, tercera: 5, conclusio: 6, esquema: 7, comprovacio: 8});

const EXEMPLES = Object.freeze([
  {r: '1,0,2;1,1,-1', s: '2,3,-1;1,-1,1'},     // es tallen
  {r: '1,0,0;1,1,0', s: '0,0,2;0,1,1'},        // es creuen
  {r: '1,2,0;1,-1,2', s: '0,1,1;-2,2,-4'},     // paral·leles
  {r: '1,0,1;2,1,-1', s: '5,2,-1;-4,-2,2'},    // coincidents
  {r: '0,0,0;2,0,2', s: '1,-2,2;0,2,-1'},      // es tallen, λ fraccionari
  {r: '1,0,0;0,1,1', s: '2,0,1;0,1,-1'},       // es creuen: la 1a equació és 0 = 1 (no cal resoldre res)
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

const VARS_R = ['x', 'y', 'z'];
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
  // Abans d'igualar res, les equacions paramètriques de les dues rectes (David).
  const parametriques = (nomR, R0, l, k) => K(k, `${nomR}: \\left\\{\\begin{array}{l} ${VARS_R.map((x, i) => `${x} = ${Mt.texLineal([R0.P[i], R0.u[i]], l)}`).join(' \\\\ ')} \\end{array}\\right.`);
  const filaParam = parametriques('r', r, L, 'Pr') + '\\qquad ' + parametriques('s', s, MU, 'Ps');
  g.files[FILA.igualtat] = filaParam;
  g.afegeix('Les equacions paramètriques de les dues rectes: les de $r$, amb el paràmetre $\\lambda$, i les de $s$, amb el paràmetre $\\mu$.');

  if (prop.proporcionals) {
    /* Paral·leles o coincidents: Q és de r? */
    g.files[FILA.igualtat] = llista([filaParam, K('Ia', generic) + ' = ' + K('Ib', texPunt(s.P))], '12pt');
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
    // La resposta, amb una frase (David: res de notació de conjunts).
    g.files[FILA.conclusio] = llista(coincidents
      ? [K('Lv', '\\text{el mateix } \\lambda\\ \\Rightarrow\\ Q \\in r'), K('Lr', '\\text{Les rectes } r \\text{ i } s \\text{ són coincidents}')]
      : [K('Lv', '\\text{cap } \\lambda \\text{ les compleix totes}\\ \\Rightarrow\\ Q \\notin r'), K('Lr', '\\text{Les rectes } r \\text{ i } s \\text{ són paral·leles}')]);
    g.afegeix(coincidents ? 'Totes les equacions donen el mateix $\\lambda$: $Q$ és de $r$. Les rectes tenen la mateixa direcció i un punt comú: són la mateixa recta (coincidents).'
      : 'No hi ha cap $\\lambda$ que compleixi les tres equacions: $Q$ no és de $r$. Les rectes tenen la mateixa direcció però no cap punt comú: són paral·leles.');
    g.files[FILA.esquema] = G.esquema(coincidents ? 'rectes-coincidents' : 'rectes-paraleles');
    g.classes[FILA.conclusio] = 'final';
    g.afegeix(coincidents ? 'Una sola recta: $P$ i $Q$ en són dos punts.' : 'Dues rectes amb la mateixa direcció, a una certa distància.');
    return g.passos;
  }

  /* Es tallen o es creuen: P + λu = Q + μv. */
  g.files[FILA.igualtat] = llista([filaParam, F.enLinies(K('Ia', generic), [' = ' + K('Ib', G.texGeneric(s, MU))])], '12pt');
  g.afegeix('Un punt comú seria de les dues rectes alhora: iguala les coordenades de les dues rectes. Cada recta té el seu paràmetre.');
  g.files[FILA.sistema] = G.texSistemaEq([0, 1, 2].map(i => K(`E${i + 1}`, `${Mt.texLineal([r.P[i], r.u[i]])} = ${Mt.texLineal([s.P[i], s.u[i]], MU)}`)));
  g.afegeix('Una equació per coordenada: 3 equacions amb 2 incògnites, $\\lambda$ i $\\mu$.');
  const S = [0, 1, 2].map(i => [r.u[i], s.u[i].oposada(), PQ[i]]);           // uλ − vμ = Q − P
  const texE = (i, marca = '') => K(`E${i + 1}`, Mt.texEquacio(S[i].slice(0, 2), S[i][2], [L, MU]), marca);
  g.files[FILA.sistema] = G.texSistemaEq([0, 1, 2].map(i => texE(i)));
  g.afegeix('Passa les incògnites a l\'esquerra i els nombres a la dreta.');
  const impossible = [0, 1, 2].find(c => S[c][0].esZero() && S[c][1].esZero() && !S[c][2].esZero());
  let tallen = false, l0 = null, m0 = null;
  if (impossible !== undefined) {
    // Una equació «0 = c» amb c ≠ 0: el sistema no té solució, sense fer res més.
    g.files[FILA.sistema] = G.texSistemaEq([0, 1, 2].map(c => texE(c, c === impossible ? 'menys' : '')));
    g.afegeix(`L'equació $${G.texEq(impossible + 1)}$ és $0 = ${M.texNombre(S[impossible][2])}$: no es compleix mai. El sistema no té solució: no hi ha cap punt comú.`);
  } else {
    const det = (i, j) => Mt.det2N([S[i].slice(0, 2), S[j].slice(0, 2)]);
    const [i, j] = [[0, 1], [0, 2], [1, 2]].find(([a, b]) => !det(a, b).esZero());
    const k = [0, 1, 2].find(c => c !== i && c !== j);
    g.files[FILA.sistema] = G.texSistemaEq([0, 1, 2].map(c => texE(c, c === k ? 'tria' : 'mes')));
    g.afegeix(`Resol el sistema de les equacions $${G.texEq(i + 1)}$ i $${G.texEq(j + 1)}$ (en verd), que no són proporcionals. `
      + `Després, mira si la solució també compleix l'equació $${G.texEq(k + 1)}$ (en groc).`);
    [l0, m0] = G.passosReduccio2(g, {S: [S[i], S[j]], vars: [L, MU], fila: FILA.reduccio, eqs: [i + 1, j + 1]});
    const vk = S[k][0].producte(l0).suma(S[k][1].producte(m0));
    tallen = vk.igual(S[k][2]);
    // La tercera equació, destacada: si es compleix, el sistema té solució única (verd); si no, no en té (vermell).
    const trivial = S[k][0].esZero() && S[k][1].esZero();          // «0 = 0»: es compleix sempre
    const tq = trivial ? '0 = 0' : `${Mt.texEquacio(S[k].slice(0, 2), S[k][2], [L, MU])}\\ \\Rightarrow\\ ${G.texSubstitucio(S[k].slice(0, 2), null, [l0, m0])} = ${M.texNombre(vk)}${tallen ? '' : ` \\neq ${M.texNombre(S[k][2])}`}`;
    g.files[FILA.tercera] = K('Tq', tq, tallen ? 'mes' : 'menys') + (tallen ? '\\quad \\text{(es compleix!)}' : '\\quad \\text{(no es compleix)}');
    g.afegeix(trivial ? `L'equació $${G.texEq(k + 1)}$ és $0 = 0$: es compleix sempre, també amb aquesta solució. `
      + 'Per tant, el sistema de les tres equacions té solució única: les rectes es tallen en un punt.'
      : tallen ? `Ara l'equació $${G.texEq(k + 1)}$, amb $\\lambda = ${M.texNombre(l0)}$ i $\\mu = ${M.texNombre(m0)}$. Per sort, també es compleix! `
      + 'Per tant, el sistema de les tres equacions té solució única: les rectes es tallen en un punt.'
      : `Ara l'equació $${G.texEq(k + 1)}$, amb $\\lambda = ${M.texNombre(l0)}$ i $\\mu = ${M.texNombre(m0)}$: no es compleix (hauria de valer $${M.texNombre(S[k][2])}$). `
        + 'El sistema de les tres equacions no té solució: no hi ha cap punt comú.');
  }
  // El punt de tall es diu R (David: mai X per a un punt); la resposta, amb una frase (res de r ∩ s = {R}).
  if (tallen) {
    const Rp = r.P.map((x, c) => x.suma(r.u[c].producte(l0)));
    g.files[FILA.conclusio] = llista([K('Lv', `${L} = ${M.texNombre(l0)}\\ \\Rightarrow\\ R = ${texPunt(Rp)}`), K('Lr', '\\text{Les rectes } r \\text{ i } s \\text{ es tallen en el punt } R')]);
    g.afegeix(`Posa $\\lambda = ${M.texNombre(l0)}$ a les equacions paramètriques de $r$ (o $\\mu = ${M.texNombre(m0)}$ a les de $s$): és el punt de tall, $R = ${texPunt(Rp)}$. Les rectes $r$ i $s$ es tallen en el punt $R$.`);
  } else {
    g.files[FILA.conclusio] = K('Lr', '\\text{Les rectes } r \\text{ i } s \\text{ es creuen}');
    g.afegeix('No tenen cap punt comú i tenen direccions diferents: les rectes $r$ i $s$ es creuen (no són en un mateix pla).');
  }
  g.files[FILA.esquema] = G.esquema(tallen ? 'rectes-es-tallen' : 'rectes-es-creuen');
  g.classes[FILA.conclusio] = 'final';      // la resposta; sense comprovacions opcionals (David)
  g.afegeix(tallen ? 'Dues rectes que es tallen en un punt $R$: són en un mateix pla.' : 'Dues rectes que es creuen: $s$ passa per davant o per darrere de $r$ sense tocar-la.');
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
