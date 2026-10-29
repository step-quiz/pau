/* ═══════════════════════════════════════════════════════════════════
   perpendicular-comuna.js — Procediment: perpendicular comuna i
   distància entre dues rectes
   ───────────────────────────────────────────────────────────────────
   r: P + λu i s: Q + μv, no paral·leles. Amb els punts genèrics P_λ i
   Q_μ: el vector P_λQ_μ ha de ser perpendicular a u i a v,
      P_λQ_μ · u = 0,   P_λQ_μ · v = 0,
   un sistema 2×2 en λ i μ (mètode de reducció, mai Cramer). Els peus P₀ ∈ r i Q₀ ∈ s; la
   perpendicular comuna, P₀ + t·P₀Q₀; la distància, |P₀Q₀|. Si les
   rectes es tallen, P₀ = Q₀: la distància és 0, i la perpendicular
   comuna passa per aquest punt amb la direcció de u × v.
   Adreça: perpendicular-comuna.html?r=3,0,0;1,-1,0&s=1,3,2;1,0,-1
   (cada recta: un punt i el vector director).
   Totes les línies que es veuen són certes: ho comprova proves/comprova.js.
   Claus: Dr, Ds les dades; Ga, Gb els punts genèrics; Gv el vector;
   Ca, Cb les condicions; E1, E2 el sistema; X<n> la reducció; Pa, Pb
   els peus; Mn… la distància; V… el producte vectorial; Rp la recta.
   ═══════════════════════════════════════════════════════════════════ */
(function (arrel) {
'use strict';

const M = arrel.Mates;
const F = arrel.Formules;
const Mt = arrel.Matrius;
const G = arrel.Geometria;
const {clau: K, rel: R} = F;
const {texPunt, resta, escalar} = G;
const L = '\\lambda', MU = '\\mu';

/** Files de la pissarra. */
const FILA = Object.freeze({dades: 0, esquema: 1, generics: 2, vector: 3, condicions: 4, reduccio: 5, peus: 6, distancia: 7, producte: 8, valor: 9, perpendicular: 10});

const EXEMPLES = Object.freeze([
  {r: '3,0,0;1,-1,0', s: '1,3,2;1,0,-1'},     // es creuen: λ = -2, μ = 1, d = √3
  {r: '1,0,0;1,1,0', s: '0,0,2;0,1,1'},       // es creuen: fraccions
  {r: '1,0,2;1,1,-1', s: '2,3,-1;1,-1,1'},    // es tallen: d = 0
].map(v => Object.freeze(v)));
const PER_DEFECTE = EXEMPLES[0];
const MAXIM = 99;

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
  if (G.esZero(G.vectorial(r.u, s.u))) return 'Les rectes són paral·leles (o coincidents): la perpendicular comuna no és única. La distància és la d\'un punt d\'una a l\'altra.';
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
const enunciat = v => { const t = texDades(dades(v)); return `Troba la perpendicular comuna a les rectes $${t[0]}$ i $${t[1]}$, i la distància entre elles.`; };
const resum = v => `\\scriptsize \\begin{array}{l} ${texDades(dades(v)).join(' \\\\ ')} \\end{array}`;

const llista = (linies, espai = '6pt') => (linies.length > 1 ? `\\begin{array}{l} ${linies.join(` \\\\[${espai}] `)} \\end{array}` : linies[0]);
/** Una expressió c + aλ + bμ: «1 - \lambda + \mu», «2\mu», «0». */
function texLineal2([c, a, b]) {
  const termes = [];
  if (!c.esZero()) termes.push(M.texNombre(c));
  for (const [k, v] of [[a, L], [b, MU]]) if (!k.esZero()) termes.push(Mt.termeVar(k, v, termes.length === 0));
  return termes.join('') || '0';
}
/** «u_1(e_1) + u_2(e_2) + …» amb e lineal en λ i μ: el producte escalar escrit (sense els coeficients nuls). */
function texEscalarLineal(u, e) {
  return u.map((c, i) => [c, e[i]]).filter(([c]) => !c.esZero()).map(([c, x], k) => {
    const a = c.abs(), t = (a.igual(1) ? '' : M.texNombre(a)) + `(${texLineal2(x)})`;
    return k === 0 ? (c.signe() < 0 ? '-' : '') + t : (c.signe() < 0 ? ' - ' : ' + ') + t;
  }).join('') || '0';
}

function passos(v) {
  const {r, s} = dades(v);
  const g = F.guio(11);
  g.files[FILA.dades] = llista(texDades({r, s}).map((t, i) => K(i ? 'Ds' : 'Dr', t)));
  g.afegeix('La perpendicular comuna talla les dues rectes i és perpendicular a totes dues. La distància entre les rectes és la longitud del segment que hi fa.');
  g.files[FILA.esquema] = G.esquema('perpendicular-comuna');
  g.afegeix('Busca el punt $P_0$ de $r$ i el punt $Q_0$ de $s$ tals que el vector $\\overrightarrow{P_0Q_0}$ és perpendicular a les dues rectes.');
  // Els punts genèrics, sense «=» (David), i els vectors directors, amb nom abans de fer-los servir.
  g.files[FILA.generics] = llista([K('Ga', `P_{\\lambda}${G.texGeneric(r)} \\in r`) + ',\\quad ' + K('Gu', `\\vec{u} = ${texPunt(r.u)}`),
    K('Gb', `Q_{\\mu}${G.texGeneric(s, MU)} \\in s`) + ',\\quad ' + K('Gw', `\\vec{v} = ${texPunt(s.u)}`)]);
  g.afegeix('Considera un punt qualsevol de $r$, un punt qualsevol de $s$, i els vectors directors, $\\vec{u}$ i $\\vec{v}$.');
  const PQ = resta(s.P, r.P);
  const e = [0, 1, 2].map(i => [PQ[i], r.u[i].oposada(), s.u[i]]);              // Q_μ − P_λ = (Q − P) − λu + μv
  g.files[FILA.vector] = K('Gv', `\\overrightarrow{P_{\\lambda}Q_{\\mu}} = (${e.map(texLineal2).join(',\\ ')})`);
  g.afegeix('El vector que va de $P_{\\lambda}$ a $Q_{\\mu}$: les coordenades de $Q_{\\mu}$ menys les de $P_{\\lambda}$.');
  const condicio = (w, nom, k) => K(`C${k}`, `\\overrightarrow{P_{\\lambda}Q_{\\mu}} \\cdot ${nom} = ${texEscalarLineal(w, e)} = 0`);
  g.files[FILA.condicions] = llista([condicio(r.u, '\\vec{u}', 'a'), condicio(s.u, '\\vec{v}', 'b')]);
  g.afegeix('El vector ha de ser perpendicular a les dues rectes: el producte escalar amb $\\vec{u}$ ha de ser $0$, i també el producte escalar amb $\\vec{v}$ ha de ser $0$.');
  // Les dues equacions agrupades: (w·e_λ)λ + (w·e_μ)μ = −w·e_c.
  const S = [r.u, s.u].map(w => [escalar(w, e.map(x => x[1])), escalar(w, e.map(x => x[2])), escalar(w, e.map(x => x[0])).oposada()]);
  g.files[FILA.condicions] = G.texSistemaEq(S.map((f, i) => K(`E${i + 1}`, Mt.texEquacio(f.slice(0, 2), f[2], [L, MU]))));
  g.afegeix('Treu els parèntesis i agrupa: un sistema de 2 equacions amb 2 incògnites, $\\lambda$ i $\\mu$.');
  const [l0, m0] = G.passosReduccio2(g, {S, vars: [L, MU], fila: FILA.reduccio});
  const P0 = r.P.map((x, i) => x.suma(r.u[i].producte(l0)));
  const Q0 = s.P.map((x, i) => x.suma(s.u[i].producte(m0)));
  g.files[FILA.peus] = llista([K('Pa', `\\lambda = ${M.texNombre(l0)}\\ \\Rightarrow\\ ${G.texPuntNom('P_0', P0)}`), K('Pb', `\\mu = ${M.texNombre(m0)}\\ \\Rightarrow\\ ${G.texPuntNom('Q_0', Q0)}`)]);
  g.afegeix(`Substitueix $\\lambda = ${M.texNombre(l0)}$ al punt genèric de $r$ i $\\mu = ${M.texNombre(m0)}$ al de $s$: hauràs trobat els peus de la perpendicular comuna.`);
  const P0Q0 = resta(Q0, P0);
  if (G.esZero(P0Q0)) {
    /* Es tallen: distància 0, i la direcció de la perpendicular és u × v. */
    g.files[FILA.distancia] = K('Mn', `P_0 = Q_0\\ \\Rightarrow\\ d(r, s) = 0`);
    g.classes[FILA.distancia] = 'final';
    g.afegeix('$P_0 = Q_0$: les rectes es tallen en aquest punt, i la distància entre elles és $0$. La perpendicular comuna hi passa, i com que és perpendicular a totes dues, té la direcció de $\\vec{u} \\times \\vec{v}$.');
    const w = G.passosProducteVectorial(g, {u: r.u, v: s.u, nom: '\\vec{u} \\times \\vec{v}', files: {producte: FILA.producte, valor: FILA.valor}});
    const dir = G.vectorSimple(w);
    g.files[FILA.perpendicular] = K('Rp', `p:\\ (x,\\ y,\\ z) = ${texPunt(P0)} + t${texPunt(dir)}`);
    g.classes[FILA.perpendicular] = 'final';
    g.afegeix(`Un vector director és $\\vec{u} \\times \\vec{v}$, o un paral·lel i amb coordenades més senzilles: $${texPunt(dir)}$. `
      + `Resposta: les rectes es tallen a $${texPunt(P0)}$ ($d(r, s) = 0$), i la perpendicular comuna és $p: (x,\\ y,\\ z) = ${texPunt(P0)} + t${texPunt(dir)}$.`);
    return g.passos;
  }
  const D2 = escalar(P0Q0, P0Q0);
  const d = G.arrelQuadrada(D2);
  const inici = K('Mn', 'd(r, s)') + R('Mq', '=') + K('Mf', '\\left|\\overrightarrow{P_0Q_0}\\right|') + ' = ';
  const peces = [K('Mv', `\\left|${texPunt(P0Q0)}\\right|`), ' = ' + K('Ms', G.texModul(P0Q0)), ' = ' + K('Ma', `\\sqrt{${M.texNombre(D2)}}`)];
  if (G.texArrel(d) !== `\\sqrt{${M.texNombre(D2)}}`) peces.push(' = ' + K('Mr', G.texArrel(d)));
  g.files[FILA.distancia] = F.enLinies(inici, peces);
  g.classes[FILA.distancia] = 'final';
  g.afegeix(`La distància entre les rectes és la longitud del segment $P_0Q_0$, és a dir, el mòdul del vector $\\overrightarrow{P_0Q_0} = ${texPunt(P0Q0)}$.`);
  const dir = G.vectorSimple(P0Q0);
  g.files[FILA.perpendicular] = K('Rp', `p:\\ (x,\\ y,\\ z) = ${texPunt(P0)} + t${texPunt(dir)}`);
  g.classes[FILA.perpendicular] = 'final';
  g.afegeix(`La perpendicular comuna passa per $P_0$ i té la direcció de $\\overrightarrow{P_0Q_0}$`
    + (G.esZero(resta(dir, P0Q0)) ? '' : ` (o d'un vector proporcional més senzill, $${texPunt(dir)}$)`)
    + `. Resposta: $p: (x,\\ y,\\ z) = ${texPunt(P0)} + t${texPunt(dir)}$ i $d(r, s) = ${G.texArrel(d)}$.`);
  return g.passos;
}

arrel.PerpendicularComuna = Object.freeze({
  titol: 'Perpendicular comuna i distància entre rectes',
  categoria: 'geometria',
  files: 11,
  perDefecte: PER_DEFECTE,
  exemples: EXEMPLES,
  titolEditor: 'Tria un exemple',
  titolExemples: 'Exemples:',
  notaEditor: 'També pots escriure les teves rectes a l\'adreça: perpendicular-comuna.html?r=3,0,0;1,-1,0&s=1,3,2;1,0,-1 '
    + '(cada recta: un punt i el vector director; no poden ser paral·leles).',
  editor: [],
  FILA, EXEMPLES,
  valida, llegeixAdreca, escriuAdreca, enunciat, resum, passos,
});

})(globalThis);
