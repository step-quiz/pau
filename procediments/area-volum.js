/* ═══════════════════════════════════════════════════════════════════
   area-volum.js — Procediment: àrea d'un triangle i volum d'un tetraedre
   ───────────────────────────────────────────────────────────────────
   Quatre problemes fixos:
     àrea d'un triangle (dos: un amb arrel exacta, un amb arrel):
        Àrea = ½·|AB × AC| (el producte vectorial, explícit);
     volum d'un tetraedre: Volum = ⅙·|det(AB, AC, AD)| (el producte mixt,
        el determinant per Sarrus);
     el quart vèrtex sobre una recta, amb un volum donat: el punt
        genèric D_λ; [AB, AC, AD_λ] = (AB × AC) · AD_λ = aλ + b;
        |aλ + b| / 6 = V → dos valors de λ, dos punts; al final, l'esquema
        dels dos tetraedres, ABCD₁ i ABCD₂.
   Adreça: area-volum.html?p=triangle (triangle, triangle-arrel,
   tetraedre, quart-vertex)
   Totes les línies que es veuen són certes: ho comprova proves/comprova.js.
   Claus: Dd les dades; Ea, Eb, Ec, Ed els vectors; V… el producte
   vectorial (geometria.js); Mx… el producte mixt; Fl, F… la fórmula;
   S0, S1 les solucions.
   ═══════════════════════════════════════════════════════════════════ */
(function (arrel) {
'use strict';

const M = arrel.Mates;
const F = arrel.Formules;
const Mt = arrel.Matrius;
const G = arrel.Geometria;
const {clau: K, rel: R} = F;
const {punt, resta, texPunt, texPuntNom, texRecta, escalar} = G;
const fr = (a, b = 1) => new M.Fraccio(a, b);

const PROBLEMES = Object.freeze([
  {id: 'triangle', nom: 'Àrea d\'un triangle', A: punt(1, 0, 0), B: punt(0, 2, 0), C: punt(0, 0, 3)},
  {id: 'triangle-arrel', nom: 'Àrea d\'un triangle (II)', A: punt(1, 1, 0), B: punt(2, 0, 1), C: punt(0, 2, 2)},
  {id: 'tetraedre', nom: 'Volum d\'un tetraedre', A: punt(1, 0, 0), B: punt(0, 1, 0), C: punt(0, 0, 1), D: punt(2, 2, 2)},
  {id: 'quart-vertex', nom: 'Quart vèrtex amb un volum donat', A: punt(1, 0, 0), B: punt(0, 1, 0), C: punt(0, 0, 1),
    r: {P: punt(1, 1, 1), u: punt(1, 1, 0)}, V: fr(1)},
].map(p => Object.freeze(p)));
const FIXOS = arrel.Dades.problemesFixos(PROBLEMES);
const {perId} = FIXOS;

/** Files de la pissarra. */
const FILA = Object.freeze({dades: 0, esquema: 1, vectors: 2, producte: 3, valor: 4, mixt: 5, formula: 6, solucions: 7, dibuix: 8});

const ENUNCIATS = {
  'triangle': p => `Calcula l'àrea del triangle de vèrtexs ${texPuntNom('A', p.A)}$, ${texPuntNom('B', p.B)}$ i ${texPuntNom('C', p.C)}$.`,
  'triangle-arrel': p => `Calcula l'àrea del triangle de vèrtexs ${texPuntNom('A', p.A)}$, ${texPuntNom('B', p.B)}$ i ${texPuntNom('C', p.C)}$.`,
  'tetraedre': p => `Calcula el volum del tetraedre de vèrtexs ${texPuntNom('A', p.A)}$, ${texPuntNom('B', p.B)}$, ${texPuntNom('C', p.C)}$ i ${texPuntNom('D', p.D)}$.`,
  'quart-vertex': p => `Els punts ${texPuntNom('A', p.A)}$, ${texPuntNom('B', p.B)}$ i ${texPuntNom('C', p.C)}$ són tres vèrtexs d'un tetraedre. `
    + `Troba el quart vèrtex $D$, sobre la recta $r: ${texRecta(p.r)}$, perquè el volum del tetraedre sigui $${M.texNombre(p.V)}$.`,
};

const llista = (linies, espai = '6pt') => (linies.length > 1 ? `\\begin{array}{l} ${linies.join(` \\\\[${espai}] `)} \\end{array}` : linies[0]);
/** Un vector, directament amb el seu valor (David: res de «B - A», no es resten punts). */
const texDif = (nom, X, Y) => `\\overrightarrow{${nom}} = ${texPunt(resta(Y, X))}`;

function passos(valors) {
  const p = perId(valors.p);
  const g = F.guio(9);
  const dades = [texPuntNom('A', p.A), texPuntNom('B', p.B), texPuntNom('C', p.C)];
  if (p.D) dades.push(texPuntNom('D', p.D));
  if (p.r) dades.push(`r:\\ ${texRecta(p.r)}`, `\\text{Volum} = ${M.texNombre(p.V)}`);
  g.files[FILA.dades] = llista(dades.map((d, i) => K(`Dd${i}`, d)));
  g.afegeix('Primer, què dona l\'enunciat.');
  const AB = resta(p.B, p.A), AC = resta(p.C, p.A);
  const tri = p.id.startsWith('triangle');
  g.files[FILA.esquema] = G.esquema(tri ? 'triangle' : p.id);
  g.afegeix({
    'triangle': 'L\'àrea del paral·lelogram de costats $\\overrightarrow{AB}$ i $\\overrightarrow{AC}$ és el mòdul del producte vectorial, $|\\overrightarrow{AB} \\times \\overrightarrow{AC}|$. El triangle n\'és la meitat.',
    'tetraedre': 'El volum del paral·lelepípede de costats $\\overrightarrow{AB}$, $\\overrightarrow{AC}$ i $\\overrightarrow{AD}$ és el valor absolut del producte mixt. El tetraedre n\'és la sisena part.',
    'quart-vertex': 'El vèrtex $D$ és de la recta: és un punt genèric $D_{\\lambda}$. Imposa que el volum del tetraedre sigui el que diu l\'enunciat.',
  }[tri ? 'triangle' : p.id]);

  if (tri) {
    g.files[FILA.vectors] = llista([K('Ea', texDif('AB', p.A, p.B)), K('Eb', texDif('AC', p.A, p.C))]);
    g.afegeix('Els vectors de dos costats que surten del mateix vèrtex, $A$: les coordenades de l\'extrem menys les de $A$.');
    const w = G.passosProducteVectorial(g, {u: AB, v: AC, nom: '\\overrightarrow{AB} \\times \\overrightarrow{AC}', files: {producte: FILA.producte, valor: FILA.valor},
      text: 'El producte vectorial $\\overrightarrow{AB} \\times \\overrightarrow{AC}$, com un determinant: a la primera fila, $\\vec{i}$, $\\vec{j}$, $\\vec{k}$; a les altres, les components dels dos vectors.'});
    const W = G.modul2(w), rW = G.arrelQuadrada(W);
    const area = {c: rW.c.quocient(2), m: rW.m};
    const inici = K('Fl', '\\text{Àrea}') + R('Fq', '=');      // «Àrea», no S (David)
    g.files[FILA.formula] = inici + K('Fg', '\\dfrac{1}{2}\\left|\\overrightarrow{AB} \\times \\overrightarrow{AC}\\right|');
    g.afegeix('L\'àrea del triangle: la meitat del mòdul del producte vectorial.');
    const peces = [K('Fs', `\\dfrac{1}{2}${G.texModul(w)}`), ' = ' + K('Fa', `\\dfrac{1}{2}\\sqrt{${M.texNombre(W)}}`)];
    if (rW.m !== W || !rW.c.igual(1)) peces.push(' = ' + K('Fb', `\\dfrac{1}{2} \\cdot ${G.texArrel(rW)}`));
    peces.push(' = ' + K('Fr', G.texArrel(area)));
    g.files[FILA.formula] = F.enLinies(inici, peces);
    g.classes[FILA.formula] = 'final';
    g.afegeix(`El mòdul: $\\sqrt{${M.texNombre(W)}}${rW.m === 1 ? ` = ${M.texNombre(rW.c)}` : (rW.c.igual(1) ? '' : ` = ${G.texArrel(rW)}`)}$; i la meitat. `
      + `Resposta: l'àrea del triangle és $${G.texArrel(area)}$ unitats quadrades.`);
  } else if (p.id === 'tetraedre') {
    const AD = resta(p.D, p.A);
    g.files[FILA.vectors] = llista([K('Ea', texDif('AB', p.A, p.B)), K('Eb', texDif('AC', p.A, p.C)), K('Ec', texDif('AD', p.A, p.D))]);
    g.afegeix('Els vectors de les tres arestes que surten del vèrtex $A$: les coordenades de l\'extrem menys les de $A$.');
    const B3 = [AB, AC, AD];
    const det = Mt.det3N(B3);
    g.files[FILA.mixt] = F.enLinies(K('Mn', '\\det(\\overrightarrow{AB}, \\overrightarrow{AC}, \\overrightarrow{AD})') + R('Mq', '=') + K('Md', Mt.texVmatriuN(B3)) + ' = ',
      [K('Ms', Mt.texSarrusN(B3))], {final: ' = ' + K('Mv', M.texNombre(det))});
    g.afegeix('El producte mixt dels tres vectors és el determinant que formen (una fila per vector). Calcula\'l per Sarrus.');
    const V = det.abs().quocient(6);
    const inici = K('Fl', '\\text{Volum}') + R('Fq', '=');
    g.files[FILA.formula] = F.enLinies(inici, [K('Fg', '\\dfrac{1}{6}\\left|\\det(\\overrightarrow{AB}, \\overrightarrow{AC}, \\overrightarrow{AD})\\right|'),
      ' = ' + K('Fs', `\\dfrac{1}{6}\\left|${M.texNombre(det)}\\right|`), ' = ' + K('Fr', M.texNombre(V).replace('\\frac', '\\dfrac'))]);
    g.classes[FILA.formula] = 'final';
    g.afegeix(`El volum del tetraedre: la sisena part del valor absolut del producte mixt. Resposta: el volum del tetraedre és $${M.texNombre(V)}$ unitats cúbiques.`);
  } else {
    /* El quart vèrtex: D_λ sobre r, i (AB × AC) · AD_λ. */
    const Dg = p.r;
    const ADg = {P: resta(Dg.P, p.A), u: Dg.u};
    g.files[FILA.vectors] = llista([K('Ea', texDif('AB', p.A, p.B)), K('Eb', texDif('AC', p.A, p.C)),
      K('Ed', `D_{\\lambda}${G.texGeneric(Dg)}`), K('Ec', `\\overrightarrow{AD_{\\lambda}} = ${G.texGeneric(ADg)}`)]);
    g.afegeix('Els vectors $\\overrightarrow{AB}$, $\\overrightarrow{AC}$; el punt genèric $D_{\\lambda}$ de la recta, i el vector $\\overrightarrow{AD_{\\lambda}}$ (depèn de $\\lambda$).');
    const w = G.passosProducteVectorial(g, {u: AB, v: AC, nom: '\\overrightarrow{AB} \\times \\overrightarrow{AC}', files: {producte: FILA.producte, valor: FILA.valor},
      text: 'El producte mixt es pot calcular en dos passos: primer el producte vectorial $\\overrightarrow{AB} \\times \\overrightarrow{AC}$ (un determinant), i després el producte escalar per $\\overrightarrow{AD_{\\lambda}}$.'});
    const e = ADg.P.map((x, i) => [x, ADg.u[i]]);
    const a = escalar(w, ADg.u), b = escalar(w, ADg.P);
    const lineal = a.esZero() ? M.texNombre(b) : Mt.termeVar(a, '\\lambda', true) + (b.esZero() ? '' : b.signe() < 0 ? ` - ${M.texNombre(b.abs())}` : ` + ${M.texNombre(b)}`);
    const nomMixt = K('Mn', '(\\overrightarrow{AB} \\times \\overrightarrow{AC}) \\cdot \\overrightarrow{AD_{\\lambda}}') + R('Mq', '=');
    g.files[FILA.mixt] = F.enLinies(nomMixt, [K('Ms', G.texSubstitucioLineal(w, null, e))]);
    g.afegeix('El producte escalar: cada component del producte vectorial per la de $\\overrightarrow{AD_{\\lambda}}$, i suma.');
    g.files[FILA.mixt] = F.enLinies(nomMixt, [K('Ms', G.texSubstitucioLineal(w, null, e)), ' = ' + K('Mv', lineal)]);
    g.afegeix('Treu els parèntesis i agrupa: el producte mixt depèn de $\\lambda$.');
    const inici = K('Fl', '\\text{Volum}') + R('Fq', '=');
    const sisV = p.V.producte(6);
    g.files[FILA.formula] = inici + K('Fs', `\\dfrac{1}{6}\\left|${lineal}\\right|`) + R('Fe', '=') + K('Fd', M.texNombre(p.V))
      + '\\ \\Rightarrow\\ ' + K('Fa', `\\left|${lineal}\\right| = ${M.texNombre(sisV)}`);
    g.afegeix(`El volum ha de ser $${M.texNombre(p.V)}$: $\\dfrac{1}{6}|${lineal}| = ${M.texNombre(p.V)}$. Multiplica per $6$.`);
    const ls = [sisV, sisV.oposada()].map(x => x.resta(b).quocient(a));
    const Ds = ls.map(l => Dg.P.map((x, i) => x.suma(Dg.u[i].producte(l))));
    g.files[FILA.solucions] = llista([0, 1].map(i => K(`S${i}`, `${lineal} = ${M.texNombre(i ? sisV.oposada() : sisV)}\\ \\Rightarrow\\ \\lambda = ${M.texNombre(ls[i])}`
      + `\\ \\Rightarrow\\ ${texPuntNom(`D_{${i + 1}}`, Ds[i])}`)));
    g.classes[FILA.solucions] = 'final';
    g.afegeix(`$|${lineal}| = ${M.texNombre(sisV)}$: el que hi ha dins val $${M.texNombre(sisV)}$ o $${M.texNombre(sisV.oposada())}$. Dues solucions: `
      + `$${texPuntNom('D_1', Ds[0])}$ i $${texPuntNom('D_2', Ds[1])}$ (un a cada banda del pla $ABC$).`);
    // Les dues solucions, dibuixades (David): dos tetraedres, un a cada banda del pla ABC.
    g.files[FILA.dibuix] = G.esquema('quart-vertex-solucions');      // sota la resposta, perquè es vegin junts
    g.afegeix(`Els dos tetraedres, $ABCD_1$ i $ABCD_2$, tenen volum $${M.texNombre(p.V)}$: $D_1$ i $D_2$ són de la recta $r$, un a cada banda del pla $ABC$, a la mateixa distància.`);
  }
  return g.passos;
}

arrel.AreaVolum = Object.freeze({
  titol: 'Àrea d\'un triangle i volum d\'un tetraedre',
  categoria: 'geometria',
  files: 9,
  perDefecte: FIXOS.perDefecte,
  exemples: FIXOS.exemples,
  titolEditor: 'Tria un problema',
  notaEditor: 'Àrea: la meitat del mòdul del producte vectorial. Volum: la sisena part del valor absolut del producte mixt.',
  editor: [],
  problemes: PROBLEMES,
  FILA,
  valida: FIXOS.valida, llegeixAdreca: FIXOS.llegeixAdreca, escriuAdreca: FIXOS.escriuAdreca,
  enunciat: v => ENUNCIATS[v.p](perId(v.p)),
  resum: FIXOS.resum, nomExemple: FIXOS.nomExemple,
  passos,
});

})(globalThis);
