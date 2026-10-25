/* ═══════════════════════════════════════════════════════════════════
   diagonalitzacio.js — Procediment: diagonalitzar una matriu (2×2 o
   3×3, sense paràmetres, amb valors propis enters i diferents)
   ───────────────────────────────────────────────────────────────────
   Dades: una matriu quadrada de nombres enters, triada entre els
   exemples o escrita a l'adreça:  diagonalitzacio.html?A=4,1;2,3
   Passos:
     1. el polinomi característic |A − λI| (2×2: (a − λ)(d − λ) − bc;
        3×3: Sarrus, amb els sis productes alhora) i les seves arrels
        (Ruffini si cal): els valors propis, tots diferents;
     2. per a cada valor propi λ, el sistema homogeni (A − λI)v = 0:
        compatible indeterminat, amb un paràmetre; les solucions són els
        múltiples d'un vector propi;
     3. P (els vectors propis, en columnes) i D (els valors propis, a la
        diagonal), amb P⁻¹AP = D; i la comprovació sense P⁻¹: AP = PD.
   Totes les línies que es veuen són certes: ho comprova proves/comprova.js.
   Claus: Mn, Mq, a<i><j> A; c… el polinomi característic (vegeu
   matrius.js); E…, P…, R…, Q… les arrels; L<i> els valors propis; W<i>…
   el vector propi i; U<i> la llista de vectors; Pn, Dn… P i D; K… la
   comprovació.
   ═══════════════════════════════════════════════════════════════════ */
(function (arrel) {
'use strict';

const M = arrel.Mates;
const F = arrel.Formules;
const Mt = arrel.Matrius;
const {Fraccio} = M;
const {clau: K, rel: R} = F;

/** Files de la pissarra. */
const FILA = Object.freeze({matriu: 0, car: 1, sarrus: 2, calcul: 3, equacio: 4, prova: 5, ruffini: 6, segon: 7, vaps: 8, vep: 9, veps: 10, pd: 11, comprovacio: 12});
const L = '\\lambda';

const EXEMPLES = Object.freeze([
  '4,1;2,3',               // 2×2: λ = 2, 5
  '1,2;2,1',               // 2×2: λ = −1, 3
  '0,1;-2,3',              // 2×2: λ = 1, 2
  '1,0,0;1,2,-1;1,0,3',    // 3×3: λ = 1, 2, 3 (Ruffini)
  '2,1,0;1,0,1;1,-1,3',    // 3×3: λ = 0, 2, 3 (factor comú)
  '-1,0,2;2,-1,0;2,0,2',   // 3×3: λ = −2, −1, 3 (Ruffini)
].map(A => Object.freeze({A})));
const PER_DEFECTE = EXEMPLES[0];

const fr = (a, b = 1) => new Fraccio(a, b);
/** La matriu dels valors: nombres, i n (2 o 3). */
function matriu(v) {
  const n = String(v.A).split(';').length;
  const {A, X} = Mt.llegeixMatriu(v.A, n, n);
  return {N: Mt.nombres(A), n, X};
}
/** A − λI, com a polinomis en λ. */
const menysLambda = N => N.map((f, i) => f.map((c, j) => (i === j ? [c, fr(-1)] : (c.esZero() ? [] : [c]))));
/** El polinomi característic |A − λI| (coeficients de grau 0 cap amunt). */
function caracteristic(N) {
  const P = menysLambda(N);
  if (N.length === 3) return Mt.determinant(P);
  return Mt.sumaP(Mt.producteP(P[0][0], P[1][1]), Mt.oposatP(Mt.producteP(P[0][1], P[1][0])));
}
/** Els valors propis enters (de −40 a 40), en ordre. */
function valorsPropis(N) {
  const p = caracteristic(N), r = [];
  for (let k = -40; k <= 40; k++) if (Mt.valorP(p, k).esZero()) r.push(k);
  return r;
}

function valida(v) {
  let m;
  try {
    m = matriu(v);
  } catch (e) {
    if (e instanceof M.ErrorLectura) return e.message.replace(/ha de tenir (\d) files/, 'ha de ser quadrada');
    throw e;
  }
  if (m.X) return `Aquí la matriu és de nombres: no hi pot haver cap paràmetre (${m.X}).`;
  if (m.n !== 2 && m.n !== 3) return 'La matriu ha de ser 2×2 o 3×3.';
  const p = caracteristic(m.N);
  if (Mt.problemaArrels(p) || valorsPropis(m.N).length !== m.n) {
    return `Aquesta matriu no té ${m.n} valors propis enters i diferents (el polinomi característic és ${Mt.textP(p, 'L').replace(/L/g, 'λ')}). Tria'n una altra.`;
  }
  return null;
}
function llegeixAdreca(a) {
  if (a.A === undefined) return {valors: Object.assign({}, PER_DEFECTE)};
  const files = String(a.A).replace(/\s+/g, '').split(';');
  if (files.some(f => f.split(',').length !== files.length)) return {error: 'L\'adreça no es pot fer servir. La matriu ha de ser quadrada (2×2 o 3×3).'};
  try {
    const n = files.length;
    const {A, X} = Mt.llegeixMatriu(a.A, n, n);
    const v = {A: Mt.textMatriu(A, X)};
    const error = valida(v);
    return error ? {error: `L'adreça no es pot fer servir. ${error}`} : {valors: v};
  } catch (e) {
    if (e instanceof M.ErrorLectura) return {error: `No entenc la matriu de l'adreça: ${e.message.replace(/ha de tenir (\d) files/, 'ha de ser quadrada')}`};
    throw e;
  }
}
const escriuAdreca = v => ({A: v.A});
const texNum = N => `\\begin{pmatrix} ${N.map(f => f.map(c => M.texNombre(c)).join(' & ')).join(' \\\\ ')} \\end{pmatrix}`;
const enunciat = v => `Diagonalitza la matriu $A = ${texNum(matriu(v).N)}$: troba una matriu $P$ invertible i una matriu diagonal $D$ tals que $P^{-1}AP = D$.`;
const resum = v => `A = ${Mt.texMatriuPetita(Mt.llegeixMatriu(v.A, matriu(v).n, matriu(v).n).A, null)}`;

/** «A - 2I», «A + I», «A» (= A − λI per a λ = r). */
const Bnom = r => (r === 0 ? 'A' : `A ${r > 0 ? '-' : '+'} ${Math.abs(r) === 1 ? '' : Math.abs(r)}I`);

/** Un vector propi (enters, sense factor comú, el primer element no nul positiu) de B = A − λI, de rang n − 1. */
function vectorPropi(B) {
  let v;
  if (B.length === 2) {
    const [a, b] = B[0].some(c => !c.esZero()) ? B[0] : B[1];
    v = [b.oposada(), a];
  } else {
    // Dues files independents i el seu producte vectorial (és perpendicular a totes dues).
    const [f1, f2] = [[0, 1], [0, 2], [1, 2]].map(([i, j]) => [B[i], B[j]]).find(([x, y]) =>
      [[0, 1], [0, 2], [1, 2]].some(([p, q]) => !x[p].producte(y[q]).resta(x[q].producte(y[p])).esZero()));
    v = [f1[1].producte(f2[2]).resta(f1[2].producte(f2[1])), f1[2].producte(f2[0]).resta(f1[0].producte(f2[2])), f1[0].producte(f2[1]).resta(f1[1].producte(f2[0]))];
  }
  const L_ = v.reduce((l, c) => l / M.mcd(l, c.den) * c.den, 1);
  let w = v.map(c => c.producte(L_).num);
  const k = w.filter(Boolean).reduce((a, b) => M.mcd(a, b));
  w = w.map(x => x / k);
  if (w.find(Boolean) < 0) w = w.map(x => -x);
  return w.map(x => fr(x));
}
/** Les files independents de B (per al sistema): els índexs de 1 (2×2) o 2 (3×3) files. */
function filesIndependents(B) {
  if (B.length === 2) return [B[0].some(c => !c.esZero()) ? 0 : 1];
  return [[0, 1], [0, 2], [1, 2]].find(([i, j]) => [[0, 1], [0, 2], [1, 2]].some(([p, q]) => !B[i][p].producte(B[j][q]).resta(B[i][q].producte(B[j][p])).esZero()));
}

function passos(v) {
  const {N, n} = matriu(v);
  const g = F.guio(13);
  const AmL = menysLambda(N);
  const vars = Mt.INCOGNITES.slice(0, n);
  g.files[FILA.matriu] = K('Mn', 'A') + R('Mq', '=') + Mt.texMatriu(N.map(f => f.map(c => (c.esZero() ? [] : [c]))), null);
  g.afegeix('Diagonalitzar $A$: buscar els valors propis (les solucions de $|A - \\lambda I| = 0$), un vector propi per a cadascun, '
    + 'i posar-los en dues matrius, $P$ i $D$.');

  /* 1. El polinomi característic. */
  const nom = '|A - \\lambda I|';
  let p;
  if (n === 3) {
    ({det: p} = Mt.passosSarrus(g, {A: AmL, X: L, nom, P: 'c', rapid: true, files: {matriu: FILA.car, sarrus: FILA.sarrus, calcul: FILA.calcul}}));
  } else {
    g.files[FILA.car] = K('cMn', nom) + R('cMq', '=') + Mt.texMatriu(AmL, L, {P: 'c', tipus: 'vmatrix'});
    g.afegeix('$A - \\lambda I$: resta $\\lambda$ als elements de la diagonal. El seu determinant és el polinomi característic.');
    const [a, b, c, d] = [AmL[0][0], AmL[0][1], AmL[1][0], AmL[1][1]];
    g.files[FILA.sarrus] = K('cSl', nom) + R('cSq', '=') + K('cS0', `${Mt.texFactor(a, L)}${Mt.texFactor(d, L)}`) + ' - ' + K('cS1', `${Mt.texFactor(b, L)} \\cdot ${Mt.texFactor(c, L)}`);
    g.afegeix('Un determinant 2×2: el producte de la diagonal principal menys el de la secundària.');
    p = caracteristic(N);
    const termes = M.termes(p);
    g.files[FILA.calcul] = K('cCl', nom) + R('cCq', '=') + termes.map((t, i) => K(`cC${t.n}`, M.texPolinomi([t], L).replace(/^(?!-)/, i ? ' + ' : '').replace(/^-/, i ? ' - ' : '-'))).join('');
    g.afegeix('Opera i agrupa: és un polinomi de grau 2 en $\\lambda$.');
  }
  const vaps = Mt.passosArrels(g, {p, X: L, files: FILA, inici: 'Els valors propis són les solucions de $|A - \\lambda I| = 0$.'}).map(r => r.num);
  g.files[FILA.vaps] = vaps.map((r, i) => K(`L${i}`, `\\lambda_${i + 1} = ${r}`)).join(',\\quad ');
  g.afegeix(`Els valors propis: ${vaps.map((r, i) => `$\\lambda_${i + 1} = ${r}$`).join(', ').replace(/, ([^,]*)$/, ' i $1')}. Són ${n} i diferents: $A$ diagonalitza.`);

  /* 2. Un vector propi per a cada valor propi. */
  const vectors = [];
  const llista = () => vectors.map((w, i) => K(`U${i}`, `v_${i + 1} = (${w.map(c => M.texNombre(c)).join(',\\ ')})`)).join(',\\quad ');
  vaps.forEach((r, i) => {
    const B = N.map((f, a) => f.map((c, b) => (a === b ? c.resta(fr(r)) : c)));
    const P = `W${i}`;
    const nomB = Bnom(r);                               // «A - 2I», «A + I», «A»
    const linies = [K(`${P}n`, `\\lambda = ${r}`) + ':\\quad ' + K(`${P}m`, `${nomB} = ${texNum(B)}`)];
    const pinta = () => { g.files[FILA.vep] = `\\begin{array}{l} ${linies.join(' \\\\[8pt] ')} \\end{array}`; };
    pinta();
    g.afegeix(`Per a $\\lambda = ${r}$: els vectors propis són les solucions de $${r ? `(${nomB})` : 'A'}\\,v = 0$. `
      + (r ? `Primer, $${nomB}$: ${r > 0 ? 'resta' : 'suma'} $${Math.abs(r)}$ a la diagonal.` : 'Amb $\\lambda = 0$, $A - 0I$ és la mateixa $A$.'));
    const fs = filesIndependents(B);
    const eqs = fs.map(a => Mt.texEquacio(B[a], fr(0), vars));
    linies.push(K(`${P}e`, `\\left\\{\\begin{array}{l} ${eqs.join(' \\\\ ')} \\end{array}\\right.`));
    pinta();
    const sis = `${r ? `(${nomB})` : 'A'}v = 0`, det = `|${nomB}| = 0`;
    g.afegeix(n === 2
      ? `El sistema $${sis}$: com que $${det}$, les dues equacions són proporcionals i n'hi ha prou amb una.`
      : `El sistema $${sis}$ és homogeni i té rang 2 (perquè $${det}$): n'hi ha prou amb dues equacions independents (la tercera és combinació d'aquestes).`);
    const w = vectorPropi(B);
    vectors.push(w);
    linies.push(K(`${P}s`, `(${vars.join(',\\ ')}) = t\\,(${w.map(c => M.texNombre(c)).join(',\\ ')})`));
    pinta();
    g.files[FILA.veps] = llista();
    g.afegeix(`És compatible indeterminat, amb un paràmetre: les solucions són tots els múltiples d'un vector. Amb $t = 1$, un vector propi: $v_${i + 1} = (${w.map(c => M.texNombre(c)).join(',\\ ')})$.`);
  });
  g.files[FILA.vep] = '';

  /* 3. P i D. */
  const Pm = N.map((_, a) => vectors.map(w => w[a]));
  const D = N.map((_, a) => N.map((__, b) => fr(a === b ? vaps[a] : 0)));
  g.files[FILA.pd] = F.enLinies('', [K('Pn', `P = ${texNum(Pm)}`) + ',', '\\quad ' + K('Dn', `D = ${texNum(D)}`)]);
  g.afegeix('$P$: els vectors propis, en columnes. $D$: els valors propis a la diagonal, en el mateix ordre (la columna 1 de $P$ va amb el primer valor de $D$, i així).');
  const AP = N.map((f, a) => Pm[0].map((_, b) => f.reduce((s, x, k) => s.suma(x.producte(Pm[k][b])), fr(0))));
  g.files[FILA.comprovacio] = K('Kl', 'P^{-1}AP = D') + ',\\quad ' + K('Kc', `AP = PD = ${texNum(AP)}`);
  g.classes[FILA.pd] = 'final';
  g.afegeix('Resposta: amb aquestes $P$ i $D$, $P^{-1}AP = D$. Per comprovar-ho sense calcular $P^{-1}$, n\'hi ha prou de veure que $AP = PD$: '
    + 'cada columna de $AP$ és $Av_i = \\lambda_i v_i$.');
  return g.passos;
}

arrel.Diagonalitzacio = Object.freeze({
  titol: 'Diagonalització d\'una matriu',
  categoria: 'algebra',
  files: 13,
  perDefecte: PER_DEFECTE,
  exemples: EXEMPLES,
  titolEditor: 'Tria una matriu',
  titolExemples: 'Matrius:',
  notaEditor: 'També pots escriure la teva matriu a l\'adreça, per files: diagonalitzacio.html?A=4,1;2,3 '
    + '(2×2 o 3×3, amb valors propis enters i diferents).',
  editor: [],
  FILA, EXEMPLES,
  valida, llegeixAdreca, escriuAdreca, enunciat, resum, passos,
});

})(globalThis);
