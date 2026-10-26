/* ═══════════════════════════════════════════════════════════════════
   recta-plans.js — Procediment: la recta donada per dos plans
   ───────────────────────────────────────────────────────────────────
   Una recta en forma implícita (dos plans que es tallen) → un punt i
   un vector director, l'equació vectorial i les paramètriques.
     · els vectors normals, n₁ i n₂ (els coeficients de cada equació);
     · el vector director, u = n₁ × n₂: el determinant |i j k; n₁; n₂|
       desenvolupat per la primera fila (u és perpendicular a tots dos);
     · un punt: una incògnita val 0 (la que té component de n₁ × n₂ no
       nul·la: el sistema 2×2 que queda té aquest determinant, llevat del
       signe) i el sistema 2×2 pel mètode de reducció (mai Cramer);
     · el punt i les equacions de la recta (sense comprovacions).
   Adreça: recta-plans.html?S=1,1,-1,1;2,-1,1,5 (una equació per fila:
   «1,1,-1,1» és x + y − z = 1).
   Totes les línies que es veuen són certes: ho comprova proves/comprova.js.
   Claus: Q<i> les equacions; N<i> els normals; Vl, Vq, Vd, Vm<j> el
   determinant; VL, VQ, Vc, Vr, Vv el resultat; Ul, Uq, Uv el vector
   director; Fz i S<i> el sistema reduït; X<n> la reducció; Pp el punt;
   Rv, Rp les equacions de la recta.
   ═══════════════════════════════════════════════════════════════════ */
(function (arrel) {
'use strict';

const M = arrel.Mates;
const F = arrel.Formules;
const Mt = arrel.Matrius;
const G = arrel.Geometria;
const {clau: K, rel: R} = F;
const {texPunt, VARS} = G;

/** Files de la pissarra. */
const FILA = Object.freeze({dades: 0, esquema: 1, normals: 2, producte: 3, valor: 4, punt: 5, reduccio: 6, comprovacio: 7, recta: 8});

const EXEMPLES = Object.freeze([
  '1,1,-1,1;2,-1,1,5',      // u = (0, -3, -3) ∥ (0, 1, 1); z = 0
  '1,0,-1,1;0,1,2,0',       // equacions amb incògnites que no hi són
  '2,1,0,4;0,1,2,2',        // n₁ × n₂ = (2, -4, 2): es divideix per 2
  '1,1,1,3;2,2,-1,0',       // la component z de n₁ × n₂ és 0: no es pot fer z = 0, es fa y = 0
  '1,-2,1,0;2,1,-1,3',      // el punt té fraccions
].map(S => Object.freeze({S})));
const PER_DEFECTE = EXEMPLES[0];

/** Les dues equacions dels valors: [[a, b, c, d], …] (Fraccio), ax + by + cz = d. */
const sistema = v => Mt.nombres(Mt.llegeixMatriu(v.S, 2, 4).A);
const normal = e => e.slice(0, 3);

function valida(v) {
  let S;
  try {
    const {X} = Mt.llegeixMatriu(v.S, 2, 4);
    if (X) return `Aquí les equacions són de nombres: no hi pot haver cap paràmetre (${X}).`;
    S = sistema(v);
  } catch (e) {
    if (e instanceof M.ErrorLectura) {
      return e.message.replace('La matriu', 'La recta').replace('elements', 'nombres (els tres coeficients i el terme independent)');
    }
    throw e;
  }
  if (S.some(e => G.esZero(normal(e)))) return 'Cada equació ha de ser un pla: els coeficients de x, y, z no poden ser tots 0.';
  if (G.esZero(G.vectorial(normal(S[0]), normal(S[1])))) {
    return Mt.rangN(S) === 1 ? 'Les dues equacions són el mateix pla (són proporcionals): no defineixen una recta.'
      : 'Els dos plans són paral·lels (els vectors normals són proporcionals): no es tallen.';
  }
  return null;
}

function llegeixAdreca(a) {
  if (a.S === undefined) return {valors: Object.assign({}, PER_DEFECTE)};
  try {
    const {A, X} = Mt.llegeixMatriu(a.S, 2, 4);
    const v = {S: Mt.textMatriu(A, X)};
    const error = valida(v);
    return error ? {error: `L'adreça no es pot fer servir. ${error}`} : {valors: v};
  } catch (e) {
    if (e instanceof M.ErrorLectura) return {error: `No entenc la recta de l'adreça: ${e.message}`};
    throw e;
  }
}
const escriuAdreca = v => ({S: v.S});
const texSistemaNet = S => Mt.texSistema(S).replace(/\\htmlData\{[^}]*\}/g, '');
const enunciat = v => `Troba un punt i un vector director de la recta $r: ${texSistemaNet(sistema(v))}$ i escriu-ne l'equació vectorial i les equacions paramètriques.`;
const resum = v => `\\scriptsize ${texSistemaNet(sistema(v))}`;

const llista = (linies, espai = '6pt') => (linies.length > 1 ? `\\begin{array}{l} ${linies.join(` \\\\[${espai}] `)} \\end{array}` : linies[0]);

function passos(v) {
  const S = sistema(v);
  const g = F.guio(9);
  const [n1, n2] = S.map(normal);

  g.files[FILA.dades] = K('Rn', 'r:') + '\\ ' + Mt.texSistema(S);
  g.afegeix('La recta és la intersecció de dos plans: els punts que compleixen les dues equacions alhora. '
    + 'Per escriure-la en forma vectorial o paramètrica cal un punt i un vector director.');
  g.files[FILA.esquema] = G.esquema('dos-plans');
  g.afegeix('La recta és dins dels dos plans. Per això, el seu vector director $\\vec{u}$ és perpendicular als dos vectors normals, $\\vec{n}_1$ i $\\vec{n}_2$. '
    + 'I el producte vectorial $\\vec{n}_1 \\times \\vec{n}_2$ és, precisament, un vector perpendicular a tots dos.');
  // Primer, els dos plans per separat (David); després, el vector normal de cadascun.
  const plans = S.map((e, i) => K(`P${i + 1}`, `\\pi_${i + 1}:\\ ${Mt.texEquacio(e.slice(0, 3), e[3])}`));
  g.files[FILA.normals] = llista(plans);
  g.afegeix('Els dos plans que formen la recta, cadascun amb la seva equació.');
  g.files[FILA.normals] = llista(plans.map((p, i) => `${p}\\ \\Rightarrow\\ ${K(`N${i + 1}`, `\\vec{n}_${i + 1} = ${texPunt([n1, n2][i])}`)}`));
  g.afegeix('El vector normal de cada pla: els coeficients de $x$, $y$ i $z$ de la seva equació. No són proporcionals: els plans no són paral·lels, i es tallen en una recta.');

  /* El vector director: el producte vectorial dels normals. */
  const w = G.passosProducteVectorial(g, {u: n1, v: n2, nom: '\\vec{n}_1 \\times \\vec{n}_2', files: {producte: FILA.producte, valor: FILA.valor},
    text: 'El vector director: $\\vec{u} = \\vec{n}_1 \\times \\vec{n}_2$. El producte vectorial es calcula com un determinant: a la primera fila, '
      + 'els vectors $\\vec{i}$, $\\vec{j}$, $\\vec{k}$; a les altres dues, les components de $\\vec{n}_1$ i de $\\vec{n}_2$.'});
  const primer = w.find(x => !x.esZero());
  const k = G.factorComu(w) * primer.signe();
  const u = w.map(x => x.quocient(k));
  const linia = g.files[FILA.valor];
  g.files[FILA.valor] = llista([linia, K('Ul', '\\vec{u}') + R('Uq', '=') + K('Uv', texPunt(u))]);
  g.afegeix(k === 1 ? 'Aquest és un vector director de la recta: $\\vec{u} = ' + texPunt(u) + '$.'
    : `Qualsevol vector proporcional (no nul) també és director. Divideix per $${k}$ i queda un vector més senzill: $\\vec{u} = ${texPunt(u)}$.`);

  /* Un punt: una incògnita val 0 i el sistema 2×2 que queda, pel mètode de reducció. */
  const f = [2, 1, 0].find(j => !w[j].esZero());
  const altres = [0, 1, 2].filter(j => j !== f);
  const vars = altres.map(j => VARS[j]);
  const S2 = S.map(e => [e[altres[0]], e[altres[1]], e[3]]);
  const texS2 = S2.map((e, i) => K(`S${i + 1}`, Mt.texEquacio(e.slice(0, 2), e[2], vars)));
  g.files[FILA.punt] = K('Fz', `${VARS[f]} = 0`) + ':\\ ' + G.texSistemaEq(texS2);
  g.afegeix(`Falta un punt: una solució qualsevol de les dues equacions. Dona un valor a una incògnita, per exemple $${VARS[f]} = 0$, i queda un sistema 2×2 amb solució única.`
    + (f !== 2 ? ` (Amb $z = 0$ no es podria: la component $z$ de $\\vec{n}_1 \\times \\vec{n}_2$ és $0$, i el sistema no tindria solució única.)` : ''));
  const sol = G.passosReduccio2(g, {S: S2, vars, fila: FILA.reduccio});
  const P = [0, 1, 2].map(j => (j === f ? M.Fraccio.de(0) : sol[altres.indexOf(j)]));

  /* El punt (sense comprovacions opcionals). */
  g.files[FILA.comprovacio] = K('Pp', `P = ${texPunt(P)}`);
  g.afegeix(`El punt: $P = ${texPunt(P)}$ (amb $${VARS[f]} = 0$).`);

  /* Les equacions de la recta. */
  const parametriques = VARS.map((x, j) => `${x} = ${Mt.texLineal([P[j], u[j]])}`);
  g.files[FILA.recta] = llista([K('Rv', `r:\\ ${G.texRecta({P, u})}`), K('Rp', `\\left\\{\\begin{array}{l} ${parametriques.join(' \\\\ ')} \\end{array}\\right.`)], '10pt');
  g.classes[FILA.recta] = 'final';
  g.afegeix(`Resposta: $r: ${G.texRecta({P, u})}$, $\\lambda \\in \\mathbb{R}$; a sota, les equacions paramètriques (cada coordenada per separat). `
    + '(També es pot resoldre el sistema amb una incògnita igual a $\\lambda$: surt la mateixa recta, potser amb un altre punt i un altre vector director proporcional.)');
  return g.passos;
}

arrel.RectaPlans = Object.freeze({
  titol: 'Recta donada per dos plans',
  categoria: 'geometria',
  files: 9,
  perDefecte: PER_DEFECTE,
  exemples: EXEMPLES,
  titolEditor: 'Tria una recta',
  titolExemples: 'Rectes:',
  notaEditor: 'També pots escriure la teva recta a l\'adreça, una equació per fila: recta-plans.html?S=1,1,-1,1;2,-1,1,5 '
    + '(la fila «1,1,-1,1» és x + y − z = 1). Els dos plans no poden ser paral·lels.',
  editor: [],
  FILA, EXEMPLES,
  valida, llegeixAdreca, escriuAdreca, enunciat, resum, passos,
});

})(globalThis);
