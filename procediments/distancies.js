/* ═══════════════════════════════════════════════════════════════════
   distancies.js — Procediment: distàncies (punts, rectes i plans)
   ───────────────────────────────────────────────────────────────────
   Nou problemes fixos:
     punt–pla (dos: un amb arrel exacta, un amb arrel per racionalitzar):
        d(P, π) = |Ax₀ + By₀ + Cz₀ + D| / √(A² + B² + C²);
     dos plans paral·lels: un punt d'un, i la distància a l'altre;
     dos plans que es tallen: distància 0;
     recta paral·lela a un pla: un punt de la recta; recta que talla
        el pla: distància 0;
     plans a una distància donada d'un pla: |D' − D| / |n| = d (dos);
     punts d'una recta a una distància donada d'un pla: el punt genèric,
        |aλ + b| / |n| = d (dos);
     punt–recta: |QP × u| / |u| (el producte vectorial, explícit).
   Adreça: distancies.html?p=punt-pla (punt-pla, punt-pla-arrel,
   plans-paralels, plans-secants, recta-paralela, recta-secant,
   plans-distancia, punts-recta, punt-recta)
   Totes les línies que es veuen són certes: ho comprova proves/comprova.js.
   Claus: Dd les dades; Ps… la posició; Pp el punt; V… el producte
   vectorial; Fl, Fg, Fs, F… la fórmula; Sx… les solucions.
   ═══════════════════════════════════════════════════════════════════ */
(function (arrel) {
'use strict';

const M = arrel.Mates;
const F = arrel.Formules;
const Mt = arrel.Matrius;
const G = arrel.Geometria;
const {clau: K, rel: R} = F;
const {punt, resta, texPunt, texPuntNom, texPla, texRecta, escalar} = G;
const fr = (a, b = 1) => new M.Fraccio(a, b);

const PROBLEMES = Object.freeze([
  {id: 'punt-pla', nom: 'D\'un punt a un pla', P: punt(1, 2, -1), pi: {n: punt(2, -1, 2), D: fr(7)}},
  {id: 'punt-pla-arrel', nom: 'D\'un punt a un pla (amb arrel)', P: punt(2, 0, 1), pi: {n: punt(1, 1, -2), D: fr(3)}},
  {id: 'plans-paralels', nom: 'Entre dos plans paral·lels', pi: {n: punt(1, 2, -2), D: fr(1)}, sigma: {n: punt(2, 4, -4), D: fr(-7)}},
  {id: 'plans-secants', nom: 'Entre dos plans que es tallen', pi: {n: punt(1, -1, 1), D: fr(-2)}, sigma: {n: punt(2, 1, -1), D: fr(-1)}},
  {id: 'recta-paralela', nom: 'D\'una recta paral·lela a un pla', r: {P: punt(1, 0, 2), u: punt(1, 1, 0)}, pi: {n: punt(1, -1, 2), D: fr(1)}},
  {id: 'recta-secant', nom: 'D\'una recta que talla un pla', r: {P: punt(1, 0, 0), u: punt(1, 2, 1)}, pi: {n: punt(1, 1, 1), D: fr(-6)}},
  {id: 'plans-distancia', nom: 'Plans a una distància donada', pi: {n: punt(2, -1, 2), D: fr(-3)}, d: fr(2)},
  {id: 'punts-recta', nom: 'Punts d\'una recta a una distància donada', r: {P: punt(0, 1, 1), u: punt(1, 1, 1)}, pi: {n: punt(2, -1, 2), D: fr(2)}, d: fr(2)},
  {id: 'punt-recta', nom: 'D\'un punt a una recta', P: punt(1, 2, 3), r: {P: punt(1, 0, 0), u: punt(1, 1, 0)}},
].map(p => Object.freeze(p)));
const FIXOS = arrel.Dades.problemesFixos(PROBLEMES);
const {perId} = FIXOS;

/** Files de la pissarra. */
const FILA = Object.freeze({dades: 0, esquema: 1, posicio: 2, punt: 3, producte: 4, valor: 5, formula: 6, solucions: 7});

const ENUNCIATS = {
  'punt-pla': p => `Calcula la distància del punt $${texPuntNom('P', p.P)}$ al pla $\\pi: ${texPla(p.pi)}$.`,
  'punt-pla-arrel': p => `Calcula la distància del punt $${texPuntNom('P', p.P)}$ al pla $\\pi: ${texPla(p.pi)}$.`,
  'plans-paralels': p => `Calcula la distància entre els plans $\\pi_1: ${texPla(p.pi)}$ i $\\pi_2: ${texPla(p.sigma)}$.`,
  'plans-secants': p => `Calcula la distància entre els plans $\\pi_1: ${texPla(p.pi)}$ i $\\pi_2: ${texPla(p.sigma)}$.`,
  'recta-paralela': p => `Calcula la distància de la recta $r: ${texRecta(p.r)}$ al pla $\\pi: ${texPla(p.pi)}$.`,
  'recta-secant': p => `Calcula la distància de la recta $r: ${texRecta(p.r)}$ al pla $\\pi: ${texPla(p.pi)}$.`,
  'plans-distancia': p => `Troba els plans paral·lels a $\\pi: ${texPla(p.pi)}$ que són a distància $${M.texNombre(p.d)}$ de $\\pi$.`,
  'punts-recta': p => `Troba els punts de la recta $r: ${texRecta(p.r)}$ que són a distància $${M.texNombre(p.d)}$ del pla $\\pi: ${texPla(p.pi)}$.`,
  'punt-recta': p => `Calcula la distància del punt $${texPuntNom('P', p.P)}$ a la recta $r: ${texRecta(p.r)}$.`,
};

const llista = (linies, espai = '6pt') => (linies.length > 1 ? `\\begin{array}{l} ${linies.join(` \\\\[${espai}] `)} \\end{array}` : linies[0]);
const FORMULA = '\\dfrac{\\left|Ax_0 + By_0 + Cz_0 + D\\right|}{\\sqrt{A^2 + B^2 + C^2}}';

/**
 * La distància d'un punt Q a un pla, a la fila «formula»: la fórmula, la substitució i el càlcul.
 * «nom» és el TeX de l'esquerra («d(P, \pi)»). Torna {c, m} (el valor c·√m).
 */
function passosPuntPla(g, {Q, pla, nom, textFormula, final = true}) {
  const inici = K('Fl', nom) + R('Fq', '=');
  g.files[FILA.formula] = inici + K('Fg', FORMULA);
  g.afegeix(textFormula || 'Cal aplicar aquesta fórmula.');
  const peces = [K('Fs', `\\dfrac{\\left|${G.texSubstitucio(pla.n, pla.D, Q)}\\right|}{${G.texModul(pla.n)}}`)];
  g.files[FILA.formula] = F.enLinies(inici, peces);
  g.afegeix('Substitueix-hi les coordenades del punt i els coeficients del pla.');
  const N = escalar(pla.n, Q).suma(pla.D), S = G.modul2(pla.n);
  const {peces: mes, d} = G.pecesQuocientArrel(N, S, 'F');
  g.files[FILA.formula] = F.enLinies(inici, peces.concat(mes));
  if (final) g.classes[FILA.formula] = 'final';
  const rS = G.arrelQuadrada(S);
  g.afegeix(rS.m === 1
    ? `Calcula el numerador (recorda que hi ha un valor absolut) i el denominador. La distància és $${G.texArrel(d)} u$.`
    : `Calcula: al numerador tens $\\left|${M.texNombre(N)}\\right| = ${M.texNombre(N.abs())}$; al denominador, $\\sqrt{${M.texNombre(S)}}$. Racionalitza (multiplica numerador i denominador per $\\sqrt{${M.texNombre(S)}}$)${N.esZero() ? '' : ' i simplifica'}. La distància és $${G.texArrel(d)} u$.`);
  return d;
}

function passos(valors) {
  const p = perId(valors.p);
  const g = F.guio(8);
  const dades = {
    'punt-pla': () => [texPuntNom('P', p.P), `\\pi:\\ ${texPla(p.pi)}`],
    'punt-pla-arrel': () => [texPuntNom('P', p.P), `\\pi:\\ ${texPla(p.pi)}`],
    'plans-paralels': () => [`\\pi_1:\\ ${texPla(p.pi)}`, `\\pi_2:\\ ${texPla(p.sigma)}`],
    'plans-secants': () => [`\\pi_1:\\ ${texPla(p.pi)}`, `\\pi_2:\\ ${texPla(p.sigma)}`],
    'recta-paralela': () => [`r:\\ ${texRecta(p.r)}`, `\\pi:\\ ${texPla(p.pi)}`],
    'recta-secant': () => [`r:\\ ${texRecta(p.r)}`, `\\pi:\\ ${texPla(p.pi)}`],
    'plans-distancia': () => [`\\pi:\\ ${texPla(p.pi)}`, `d = ${M.texNombre(p.d)}`],
    'punts-recta': () => [`r:\\ ${texRecta(p.r)}`, `\\pi:\\ ${texPla(p.pi)}`, `d = ${M.texNombre(p.d)}`],
    'punt-recta': () => [texPuntNom('P', p.P), `r:\\ ${texRecta(p.r)}`],
  }[p.id]();
  g.files[FILA.dades] = llista(dades.map((d, i) => K(`Dd${i}`, d)));
  g.afegeix(p.id === 'plans-paralels' ? 'En primer lloc, llegeix les dades de l\'enunciat.' : 'Llegeix les dades de l\'enunciat.');

  if (p.id === 'punt-pla' || p.id === 'punt-pla-arrel') {
    g.files[FILA.esquema] = G.esquema('distancia-punt-pla');
    g.afegeix('La distància d\'un punt a un pla es mesura sobre la perpendicular: és la longitud del segment que va del punt al pla en la direcció del vector normal.');
    const d = passosPuntPla(g, {Q: p.P, pla: p.pi, nom: 'd(P, \\pi)'});
    g.afegeix(`Resposta: $d(P, \\pi) = ${G.texArrel(d)}$ unitats.`);
  } else if (p.id === 'plans-paralels' || p.id === 'plans-secants') {
    const prop = G.texProporcio(p.pi.n, p.sigma.n, '\\vec{n}_1', '\\vec{n}_2', 'n_1', 'n_2');
    g.files[FILA.posicio] = K('Ps', `\\vec{n}_1 = ${texPunt(p.pi.n)},\\quad \\vec{n}_2 = ${texPunt(p.sigma.n)}`);
    g.afegeix('Abans de calcular, mira com són els plans: compara els vectors normals.');
    if (!prop.proporcionals) {
      g.files[FILA.posicio] = llista([K('Ps', `\\vec{n}_1 = ${texPunt(p.pi.n)},\\quad \\vec{n}_2 = ${texPunt(p.sigma.n)}`),
        K('Pt', `${prop.tex}\\ \\Rightarrow\\ \\vec{n}_1 \\nparallel \\vec{n}_2`)]);
      g.afegeix('Els vectors normals no són proporcionals: els plans no són paral·lels, i per tant es tallen.');
      g.files[FILA.esquema] = G.esquema('dos-plans');
      g.afegeix('Dos plans que es tallen tenen tota una recta de punts en comú.');
      g.files[FILA.formula] = K('Fl', 'd(\\pi_1, \\pi_2)') + R('Fq', '=') + K('Fr', '0');
      g.classes[FILA.formula] = 'final';
      g.afegeix('Resposta: com que els plans es tallen, la distància entre ells és $0$.');
      return g.passos;
    }
    const k = prop.k;
    g.files[FILA.posicio] = llista([K('Ps', `\\vec{n}_1 = ${texPunt(p.pi.n)},\\quad \\vec{n}_2 = ${texPunt(p.sigma.n)}`),
      K('Pt', `${prop.tex},\\quad ${M.texNombre(p.sigma.D)} \\neq ${M.texNombre(k)} \\cdot ${M.texEntreParentesis(p.pi.D)}\\ \\Rightarrow\\ \\pi_1 \\parallel \\pi_2`)]);
    g.afegeix(`Els vectors normals són proporcionals ($\\vec{n}_2 = ${M.texNombre(k)}\\,\\vec{n}_1$), i els termes independents no segueixen la mateixa proporció: `
      + 'per tant, els plans són paral·lels.');
    g.files[FILA.esquema] = G.esquema('paralels');
    g.afegeix('Dos plans paral·lels són a la mateixa distància en tots els seus punts.');
    const j = p.pi.n.findIndex(x => !x.esZero());
    const Q = [0, 1, 2].map(c => (c === j ? p.pi.D.oposada().quocient(p.pi.n[j]) : fr(0)));
    const zeros = [0, 1, 2].filter(c => c !== j).map(c => G.VARS[c]);
    g.files[FILA.punt] = K('Pp', `${zeros.join(' = ')} = 0\\ \\Rightarrow\\ ${G.VARS[j]} = ${M.texNombre(Q[j])}:\\quad ${texPuntNom('P', Q)} \\in \\pi_1`);
    g.afegeix(`Per trobar un punt de $\\pi_1$, pots fer, per exemple, $${zeros.join(' = ')} = 0$ i posteriorment aïllar el valor de $${G.VARS[j]}$.`);
    const d = passosPuntPla(g, {Q, pla: p.sigma, nom: 'd(\\pi_1, \\pi_2) = d(P, \\pi_2)'});
    g.afegeix(`Resposta: $d(\\pi_1, \\pi_2) = ${G.texArrel(d)}$ unitats.`);
  } else if (p.id === 'recta-paralela' || p.id === 'recta-secant') {
    const a = escalar(p.r.u, p.pi.n);
    // Abans de fer servir u i n, què són (David: cap símbol sense dir què és).
    const vectors = K('Pu', `\\vec{u} = ${texPunt(p.r.u)},\\quad \\vec{n} = ${texPunt(p.pi.n)}`);
    g.files[FILA.posicio] = vectors;
    g.afegeix('Escriu el vector director de la recta, $\\vec{u}$, i el vector normal del pla, $\\vec{n}$.');
    g.files[FILA.posicio] = llista([vectors, K('Ps', `\\vec{u} \\cdot \\vec{n} = ${G.texEscalar(p.r.u, p.pi.n)} = ${M.texNombre(a)}${a.esZero() ? '' : ' \\neq 0'}`)]);
    if (!a.esZero()) {
      g.afegeix('Abans de calcular, mira com són la recta i el pla. $\\vec{u} \\cdot \\vec{n} \\neq 0$. Com que els vectors director de la recta i normal del pla no són perpendiculars, pots afirmar que la recta talla el pla.');
      g.files[FILA.esquema] = G.esquema('recta-secant');
      g.afegeix('Una recta que talla el pla té un punt comú amb el pla.');
      g.files[FILA.formula] = K('Fl', 'd(r, \\pi)') + R('Fq', '=') + K('Fr', '0');
      g.classes[FILA.formula] = 'final';
      g.afegeix('Resposta: com que es tallen, la distància de la recta al pla és $0$.');
      return g.passos;
    }
    const v = escalar(p.pi.n, p.r.P).suma(p.pi.D);
    g.files[FILA.posicio] = llista([vectors, K('Ps', `\\vec{u} \\cdot \\vec{n} = ${G.texEscalar(p.r.u, p.pi.n)} = 0`),
      K('Pt', `${texPuntNom('P', p.r.P)}:\\quad ${G.texSubstitucio(p.pi.n, p.pi.D, p.r.P)} = ${M.texNombre(v)} \\neq 0\\ \\Rightarrow\\ r \\parallel \\pi`)]);
    g.afegeix('Abans de calcular res, observa que $\\vec{u} \\cdot \\vec{n} = 0$. Això vol dir que els dos vectors són perpendiculars i, per tant, que la recta és paral·lela al pla o bé hi és continguda. '
      + `Finalment, com que el punt $${texPuntNom('P', p.r.P)}$ és de la recta però no és del pla, obtens la resposta definitiva: la recta és paral·lela al pla.`);
    g.files[FILA.esquema] = G.esquema('recta-paralela');
    g.afegeix('Una recta paral·lela a un pla és a la mateixa distància del pla en tots els seus punts. És suficient, per tant, treballar amb el punt $P$.');
    const d = passosPuntPla(g, {Q: p.r.P, pla: p.pi, nom: 'd(r, \\pi) = d(P, \\pi)'});
    g.afegeix(`Resposta: $d(r, \\pi) = ${G.texArrel(d)}$ unitats.`);
  } else if (p.id === 'plans-distancia') {
    const S = G.modul2(p.pi.n), rS = G.arrelQuadrada(S);
    g.files[FILA.esquema] = G.esquema('plans-a-distancia');
    g.afegeix('Hi haurà dos plans paral·lels a $\\pi$ a aquesta distància (un a cada banda, com es veu en l\'esquema).');
    g.files[FILA.posicio] = K('Ps', `\\pi':\\ ${G.texEsquerre(p.pi.n, null)} + D = 0`);
    g.afegeix('Un pla paral·lel a $\\pi$ té el mateix vector normal: només canvia el terme independent, $D$.');
    const inici = K('Fl', 'd(\\pi, \\pi\')') + R('Fq', '=');
    g.files[FILA.formula] = inici + K('Fg', `\\dfrac{\\left|D - D_{\\pi}\\right|}{\\sqrt{A^2 + B^2 + C^2}}`);
    g.afegeix('La fórmula per trobar la distància entre dos plans paral·lels escrits amb els mateixos coeficients $A$, $B$, $C$ és la següent.');
    const Dmenys = p.pi.D.signe() < 0 ? ` + ${M.texNombre(p.pi.D.abs())}` : ` - ${M.texNombre(p.pi.D)}`;
    const absD = p.pi.D.esZero() ? 'D' : `D${Dmenys}`;
    g.files[FILA.formula] = inici + K('Fs', `\\dfrac{\\left|${absD}\\right|}{${G.texModul(p.pi.n)}}`) + R('Fe', '=') + K('Fd', M.texNombre(p.d));
    g.afegeix(`Substitueix-hi: $D_{\\pi} = ${M.texNombre(p.pi.D)}$, i a més la distància ha de ser $${M.texNombre(p.d)}$.`);
    const dn = p.d.producte(rS.c);                                   // d · |n| (|n| racional en aquest problema)
    g.files[FILA.formula] = inici + K('Fs', `\\dfrac{\\left|${absD}\\right|}{${M.texNombre(rS.c)}}`) + R('Fe', '=') + K('Fd', M.texNombre(p.d))
      + '\\ \\Rightarrow\\ ' + K('Fa', `\\left|${absD}\\right| = ${M.texNombre(dn)}`);
    g.afegeix('Resol l\'equació.');
    const Ds = [dn, dn.oposada()].map(x => x.suma(p.pi.D));
    g.files[FILA.solucions] = llista([0, 1].map(i => K(`S${i}`, `${absD} = ${M.texNombre(i ? dn.oposada() : dn)}\\ \\Rightarrow\\ D = ${M.texNombre(Ds[i])}:\\quad `
      + `\\pi'_{${i + 1}}:\\ ${texPla({n: p.pi.n, D: Ds[i]})}`)));
    g.classes[FILA.solucions] = 'final';
    g.afegeix(`Un valor absolut val $${M.texNombre(dn)}$ si el que hi ha dins val $${M.texNombre(dn)}$ o $${M.texNombre(dn.oposada())}$: això farà que trobaràs dues solucions, que corresponen als dos plans. `
      + `Resposta: $${texPla({n: p.pi.n, D: Ds[0]})}$ i $${texPla({n: p.pi.n, D: Ds[1]})}$.`);
  } else if (p.id === 'punts-recta') {
    const S = G.modul2(p.pi.n), rS = G.arrelQuadrada(S);
    g.files[FILA.esquema] = G.esquema('punts-a-distancia');
    g.afegeix('Els punts de la recta a distància $d$ del pla: sempre n\'hi haurà un a cada banda del pla (assumint que la recta no és paral·lela al pla).');
    g.files[FILA.punt] = K('Gp', 'P_{\\lambda}') + K('Gc', G.texGeneric(p.r));          // un punt, sense «=» (David)
    g.afegeix(`Considera un punt qualsevol de la recta: el punt genèric $P_{\\lambda}$. Imposa-li la condició que se't demana, és a dir, que la seva distància al pla ha de ser $d=${M.texNombre(p.d)}$.`);
    const e = p.r.P.map((x, i) => [x, p.r.u[i]]);
    const a = escalar(p.pi.n, p.r.u), b = escalar(p.pi.n, p.r.P).suma(p.pi.D);
    const inici = K('Fl', 'd(P_{\\lambda}, \\pi)') + R('Fq', '=');
    const subst = G.texSubstitucioLineal(p.pi.n, p.pi.D, e);
    g.files[FILA.formula] = F.enLinies(inici, [K('Fs', `\\dfrac{\\left|${subst}\\right|}{${G.texModul(p.pi.n)}}`)], {final: R('Fe', '=') + K('Fd', M.texNombre(p.d))});
    g.afegeix('La fórmula de la distància d\'un punt a un pla, amb les coordenades de $P_{\\lambda}$.');
    const lineal = a.esZero() ? M.texNombre(b) : b.esZero() ? Mt.termeVar(a, '\\lambda', true) : Mt.termeVar(a, '\\lambda', true) + (b.signe() < 0 ? ` - ${M.texNombre(b.abs())}` : ` + ${M.texNombre(b)}`);
    g.files[FILA.formula] = F.enLinies(inici, [K('Fs', `\\dfrac{\\left|${lineal}\\right|}{${M.texNombre(rS.c)}}`)], {final: R('Fe', '=') + K('Fd', M.texNombre(p.d))});
    g.afegeix(`Opera dins del valor absolut (treu els parèntesis i agrupa) i calcula el mòdul: $\\sqrt{${M.texNombre(S)}} = ${M.texNombre(rS.c)}$.`);
    const dn = p.d.producte(rS.c);
    const ls = [dn, dn.oposada()].map(x => x.resta(b).quocient(a));
    const Ps = ls.map(l => p.r.P.map((x, i) => x.suma(p.r.u[i].producte(l))));
    g.files[FILA.solucions] = llista([0, 1].map(i => K(`S${i}`, `${lineal} = ${M.texNombre(i ? dn.oposada() : dn)}\\ \\Rightarrow\\ \\lambda = ${M.texNombre(ls[i])}`
      + `\\ \\Rightarrow\\ ${texPuntNom(`P_{${i + 1}}`, Ps[i])}`)));
    g.classes[FILA.solucions] = 'final';
    g.afegeix(`$\\left|${lineal}\\right| = ${M.texNombre(dn)}$: obtindràs dues solucions per a $\\lambda$; `
      + `substitueix cadascuna d'elles al punt genèric i obtindràs els dos punts. Resposta: $${texPuntNom('P_1', Ps[0])}$ i $${texPuntNom('P_2', Ps[1])}$.`);
  } else {
    /* Punt–recta: |QP × u| / |u|. */
    g.files[FILA.esquema] = G.esquema('distancia-punt-recta');
    g.afegeix('El paral·lelogram de costats $\\overrightarrow{QP}$ i $\\vec{u}$ té àrea $|\\overrightarrow{QP} \\times \\vec{u}|$; la base és $|\\vec{u}|$ i l\'altura, la distància de $P$ a la recta.');
    const QP = resta(p.P, p.r.P);
    g.files[FILA.punt] = llista([K('Pq', `${texPuntNom('Q', p.r.P)} \\in r,\\quad \\vec{u} = ${texPunt(p.r.u)}`), K('Pv', `\\overrightarrow{QP} = ${texPunt(QP)}`)]);
    g.afegeix('Considera un punt $Q$ de la recta, el seu vector director $\\vec{u}$ i el vector que va de $Q$ a $P$.');
    const w = G.passosProducteVectorial(g, {u: QP, v: p.r.u, nom: '\\overrightarrow{QP} \\times \\vec{u}', files: {producte: FILA.producte, valor: FILA.valor},
      text: 'Calcula el producte vectorial $\\overrightarrow{QP} \\times \\vec{u}$ com un determinant: a la primera fila, $\\vec{i}$, $\\vec{j}$, $\\vec{k}$; a les altres, les components dels dos vectors.'});
    const inici = K('Fl', 'd(P, r)') + R('Fq', '=');
    g.files[FILA.formula] = inici + K('Fg', '\\dfrac{\\left|\\overrightarrow{QP} \\times \\vec{u}\\right|}{\\left|\\vec{u}\\right|}');
    g.afegeix('La distància és l\'àrea del paral·lelogram dividida per la base. Això és perquè, de fet, l\'àrea del paral·lelogram és (base × distància).');
    const W = G.modul2(w), U = G.modul2(p.r.u);
    const peces = [K('Fs', `\\dfrac{${G.texModul(w)}}{${G.texModul(p.r.u)}}`), ' = ' + K('Fa', `\\dfrac{\\sqrt{${M.texNombre(W)}}}{\\sqrt{${M.texNombre(U)}}}`)];
    const d = G.arrelQuadrada(W.quocient(U));
    const dins = `\\sqrt{${M.texNombre(W.quocient(U))}}`;                     // les dues arrels en una
    if (G.texArrel(d) === dins) peces.push(' = ' + K('Fr', dins));
    else peces.push(' = ' + K('Fb', dins), ' = ' + K('Fr', G.texArrel(d)));
    g.files[FILA.formula] = F.enLinies(inici, peces);
    g.classes[FILA.formula] = 'final';
    g.afegeix(`Calcula els dos mòduls de vectors: $|\\overrightarrow{QP} \\times \\vec{u}| = \\sqrt{${M.texNombre(W)}}$ i $|\\vec{u}| = \\sqrt{${M.texNombre(U)}}$. Divideix (les dues arrels en una) i simplifica. `
      + `Resposta: $d(P, r) = ${G.texArrel(d)}$ unitats.`);
  }
  return g.passos;
}

arrel.Distancies = Object.freeze({
  titol: 'Distàncies',
  categoria: 'geometria',
  files: 8,
  perDefecte: FIXOS.perDefecte,
  exemples: FIXOS.exemples,
  titolEditor: 'Tria un problema',
  notaEditor: 'Si els objectes es tallen, la distància és 0. Si són paral·lels, n\'hi ha prou amb un punt d\'un dels dos.',
  editor: [],
  problemes: PROBLEMES,
  FILA,
  valida: FIXOS.valida, llegeixAdreca: FIXOS.llegeixAdreca, escriuAdreca: FIXOS.escriuAdreca,
  enunciat: v => ENUNCIATS[v.p](perId(v.p)),
  resum: FIXOS.resum, nomExemple: FIXOS.nomExemple,
  passos,
});

})(globalThis);
