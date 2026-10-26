/* ═══════════════════════════════════════════════════════════════════
   geometria.js — Punts, vectors, rectes i plans a l'espai (Geometria)
   ───────────────────────────────────────────────────────────────────
   Mòdul pur: no toca la pàgina (DOM). Depèn de mates.js, formules.js i
   matrius.js. El fan servir els procediments de Geometria. Exporta
   «Geometria»:

     punt, resta, suma, escala, escalar, vectorial   vectors (Fraccio)
     texPunt, texPla, texRecta                       escriptura
     passosPlaDeterminant(g, …)  el pla per un punt i dos vectors:
                         |x − a  y − b  z − c; v₁; v₂| = 0, desenvolupat
                         per la primera fila
     passosPlaNormal(g, …)       el pla per un punt amb vector normal
     passosProducteVectorial(g, …)  u × v = |i j k; u; v|, desenvolupat
     passosReduccio2(g, …)       un sistema 2×2 pel mètode de reducció (mai Cramer)
     passosPuntGenericAlPla(g, …)  el punt genèric d'una recta, imposat
                         a un pla: una equació aλ = c
     esquema(nom)               un esquema (SVG) per a la pissarra

   Un punt o un vector és una llista de tres Fraccio. Un pla és
   {n: [A, B, C], D}: Ax + By + Cz + D = 0. Una recta és {P, u}.
   ═══════════════════════════════════════════════════════════════════ */
(function (arrel) {
'use strict';

const M = arrel.Mates;
const F = arrel.Formules;
const Mt = arrel.Matrius;
const {Fraccio} = M;
const {clau: K, rel: R} = F;
const fr = (a, b = 1) => new Fraccio(a, b);
const VARS = Object.freeze(['x', 'y', 'z']);


/* ── 1. VECTORS ────────────────────────────────────────────────────── */

const punt = (...c) => c.map(x => (x instanceof Fraccio ? x : fr(x)));
const resta = (P, Q) => P.map((x, i) => x.resta(Q[i]));
const suma = (P, Q) => P.map((x, i) => x.suma(Q[i]));
const escala = (P, k) => P.map(x => x.producte(k));
const escalar = (u, v) => u.reduce((s, x, i) => s.suma(x.producte(v[i])), fr(0));
const vectorial = (u, v) => [u[1].producte(v[2]).resta(u[2].producte(v[1])), u[2].producte(v[0]).resta(u[0].producte(v[2])), u[0].producte(v[1]).resta(u[1].producte(v[0]))];
const esZero = u => u.every(x => x.esZero());
/** El factor comú (enter positiu) d'un vector d'enters, per simplificar-lo. */
const factorComu = u => u.filter(x => !x.esZero()).map(x => x.num).reduce((a, b) => M.mcd(a, b), 0);
/** Un vector proporcional a w (≠ 0) amb components enteres, sense factor comú, i la primera no nul·la positiva. */
function vectorSimple(w) {
  const mcm = w.reduce((m, x) => (m * x.den) / M.mcd(m, x.den), 1);
  const enters = w.map(x => x.producte(mcm));
  const k = factorComu(enters) * enters.find(x => !x.esZero()).signe();
  return enters.map(x => x.quocient(k));
}


/* ── 2. ESCRIPTURA ─────────────────────────────────────────────────── */

const texPunt = P => `(${P.map(x => M.texNombre(x)).join(',\\ ')})`;
/** Un punt amb nom, sense signe igual (David): «P(1,\ 2,\ 3)», mai «P = (1, 2, 3)». */
const texPuntNom = (nom, P) => `${nom}${texPunt(P)}`;
/** «x - 1», «y», «z + 2» (la coordenada menys la del punt). */
const texMenys = (v, a) => (a.esZero() ? v : `${v} ${a.signe() > 0 ? '-' : '+'} ${M.texNombre(a.abs())}`);
/** El primer membre d'un pla, «3x - y + 2z - 5». */
function texEsquerre(n, D) {
  const termes = n.map((c, i) => [c, VARS[i]]).filter(([c]) => !c.esZero()).map(([c, v], i) => Mt.termeVar(c, v, i === 0));
  if (D && !D.esZero()) termes.push(D.signe() > 0 ? ` + ${M.texNombre(D)}` : ` - ${M.texNombre(D.abs())}`);
  return termes.join('') || '0';
}
const texPla = ({n, D}) => `${texEsquerre(n, D)} = 0`;
/** El primer membre d'un pla amb un punt en lloc de (x, y, z): «3 \cdot 1 - 2 + 2 \cdot 1 - 5» (sense «1 \cdot»). */
function texSubstitucio(n, D, Q) {
  const termes = n.map((c, i) => [c, Q[i]]).filter(([c]) => !c.esZero()).map(([c, x], i) => {
    // Sense «1 ·» (el David): «2 - 2 \cdot 3 + (-1)», no «1 \cdot 2 - 2 \cdot 3 + 1 \cdot (-1)».
    const t = c.abs().igual(1) ? (i === 0 && c.signe() > 0 ? M.texNombre(x) : M.texEntreParentesis(x)) : `${M.texNombre(c.abs())} \\cdot ${M.texEntreParentesis(x)}`;
    return i === 0 ? (c.signe() < 0 ? '-' : '') + t : (c.signe() < 0 ? ` - ${t}` : ` + ${t}`);
  });
  if (D && !D.esZero()) termes.push(D.signe() > 0 ? ` + ${M.texNombre(D)}` : ` - ${M.texNombre(D.abs())}`);
  return termes.join('');
}
/** Una recta en forma vectorial: «(x,\ y,\ z) = (1,\ 0,\ 2) + \lambda(1,\ -1,\ 1)». */
const texRecta = ({P, u}, l = '\\lambda') => `(x,\\ y,\\ z) = ${texPunt(P)} + ${l}${texPunt(u)}`;
/** El punt genèric d'una recta: «(1 + \lambda,\ -\lambda,\ 2 + \lambda)». */
const texGeneric = ({P, u}, l = '\\lambda') => `(${P.map((a, i) => Mt.texLineal([a, u[i]], l)).join(',\\ ')})`;


/* ── 3. EL PLA ─────────────────────────────────────────────────────── */

/**
 * Un coeficient davant d'un factor: «3 \cdot (x - 1)», «-(y - 2)», « + 2z»; si és el primer, sense « + ».
 * Un producte per un parèntesi porta punt (David: «x · (x − 2)»).
 */
function texCoefFactor(c, factor, primer) {
  const a = c.abs();
  const f = factor.length > 1 ? `(${factor})` : factor;
  const t = (a.igual(1) ? '' : M.texNombre(a) + (factor.length > 1 ? ' \\cdot ' : '')) + f;
  if (primer) return (c.signe() < 0 ? '-' : '') + t;
  return c.signe() < 0 ? ` - ${t}` : ` + ${t}`;
}

/**
 * Els passos finals d'un pla de vector normal n que passa per P: «A(x − a) + B(y − b) + C(z − c) = 0»
 * (a la fila «desenvolupa», si «escriuForma»), la forma general Ax + By + Cz + D = 0 i, si tots
 * els coeficients tenen un factor comú, simplificada (a la fila «pla»). Torna el pla {n, D}.
 */
function passosFormaGeneral(g, {P, n, files, escriuForma = true, text}) {
  if (escriuForma) {
    const termes = n.map((c, i) => [c, texMenys(VARS[i], P[i])]).filter(([c]) => !c.esZero());
    g.files[files.desenvolupa] = K('Hf', termes.map(([c, f], i) => texCoefFactor(c, f, i === 0)).join('')) + R('Hq', '=') + K('Hz', '0');
    g.afegeix(text || 'Calcula els menors: queden els coeficients de $x$, $y$ i $z$.');
  }
  const D = escalar(n, P).oposada();
  g.files[files.pla] = K('Pe', texEsquerre(n, D)) + R('Pq', '=') + K('Pz', '0');
  g.afegeix('Treu els parèntesis i agrupa els nombres: és l\'equació general del pla, $Ax + By + Cz + D = 0$.');
  const k = factorComu(n.concat([D]));
  if (k > 1) {
    const n2 = n.map(x => x.quocient(k)), D2 = D.quocient(k);
    g.files[files.pla] = K('Pe', texEsquerre(n2, D2)) + R('Pq', '=') + K('Pz', '0');
    g.afegeix(`Tots els coeficients són múltiples de $${k}$: divideix-ho tot per $${k}$ (és el mateix pla).`);
    return {n: n2, D: D2};
  }
  return {n, D};
}

/*
 * La regla de Sarrus d'un determinant amb la primera fila de símbols (\vec{i}, \vec{j}, \vec{k}, o
 * x − a, y − b, z − c) i les altres dues de nombres (u, v). Sempre per Sarrus i amb claudàtors (David):
 *   [s₀·u₁·v₂ + s₁·u₂·v₀ + s₂·u₀·v₁] − [s₂·u₁·v₀ + s₀·u₂·v₁ + s₁·u₀·v₂].
 * Claus (prefix P): S<n> els productes, T<n> els seus valors, G<j> el coeficient agrupat de cada símbol.
 */
const SARRUS_SIMBOLS = Object.freeze([[0, 1, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0], [0, 2, 1], [1, 0, 2]]);   // [símbol, columna de u, columna de v]
const ambParentesi = s => (/\s[+-]\s/.test(s) ? `(${s})` : s);
/** c·s amb el signe davant («2 \cdot (x - 1)», « - \vec{j}», « + 0»); si és el primer, sense « + ». Davant d'un parèntesi, punt. */
function texCoefSimbol(c, s, primer) {
  if (c.esZero()) return primer ? '0' : ' + 0';
  const a = c.abs();
  const s2 = ambParentesi(s);
  const t = (a.igual(1) ? '' : M.texNombre(a) + (s.startsWith('\\vec') ? '\\,' : s2 !== s ? ' \\cdot ' : '')) + s2;
  if (primer) return (c.signe() < 0 ? '-' : '') + t;
  return c.signe() < 0 ? ` - ${t}` : ` + ${t}`;
}
function sarrusSimbolic(simbols, u, v, P) {
  const productes = SARRUS_SIMBOLS.map(([j, b, c], n) => ({n, j, factors: `${ambParentesi(simbols[j])} \\cdot ${M.texEntreParentesis(u[b])} \\cdot ${M.texEntreParentesis(v[c])}`,
    c: u[b].producte(v[c])}));
  const claudators = (f, ambSigne) => [productes.slice(0, 3), productes.slice(3)].map((grup, q) => (q ? ' - ' : '') + '\\lbrack '
    + grup.map((pr, i) => f(pr, i)).join(ambSigne ? '' : ' + ') + ' \\rbrack');
  const texProductes = claudators(pr => K(`${P}S${pr.n}`, pr.factors), false);
  const texValors = claudators((pr, i) => K(`${P}T${pr.n}`, texCoefSimbol(pr.c, simbols[pr.j], i === 0)), true);
  // Sense claudàtors (el − canvia el signe dels del segon); els zeros desapareixen.
  const sense = productes.map(pr => ({n: pr.n, j: pr.j, c: pr.n < 3 ? pr.c : pr.c.oposada()})).filter(t => !t.c.esZero());
  const texSense = sense.length ? sense.map((t, i) => K(`${P}T${t.n}`, texCoefSimbol(t.c, simbols[t.j], i === 0))).join('') : K(`${P}T0`, '0');
  const coefs = [0, 1, 2].map(j => sense.filter(t => t.j === j).reduce((x, t) => x.suma(t.c), fr(0)));
  const fusiona = {};
  [0, 1, 2].forEach(j => { if (!coefs[j].esZero()) fusiona[`${P}G${j}`] = sense.filter(t => t.j === j).map(t => `${P}T${t.n}`); });
  const noNuls = [0, 1, 2].filter(j => !coefs[j].esZero());
  const texAgrupat = noNuls.length ? noNuls.map((j, i) => K(`${P}G${j}`, texCoefSimbol(coefs[j], simbols[j], i === 0))).join('') : '0';
  return {texProductes, texValors, texSense, texAgrupat, fusiona, coefs};
}
const TEXT_SARRUS = 'Regla de Sarrus, amb dos claudàtors: al primer, la diagonal principal i els dos triangles paral·lels; al segon (que es resta), la diagonal secundària i els seus dos triangles.';

/**
 * El pla que passa per P i té els vectors directors v1 i v2: el determinant |X − P; v1; v2| = 0
 * (els tres vectors són al pla), desenvolupat per la primera fila. Files: det, desenvolupa, pla.
 */
function passosPlaDeterminant(g, {P, v1, v2, files, nomP = 'P'}) {
  const fila1 = VARS.map((v, i) => texMenys(v, P[i]));
  const texV = v => v.map(x => M.texNombre(x)).join(' & ');
  g.files[files.det] = K('Gd', `\\begin{vmatrix} ${fila1.join(' & ')} \\\\ ${texV(v1)} \\\\ ${texV(v2)} \\end{vmatrix}`) + R('Gq', '=') + K('Gz', '0');
  // Els punts, sense signe igual (David): «G(x, y, z)».
  g.afegeix(`Un punt qualsevol $G(x,\\ y,\\ z)$ és del pla si el vector $\\overrightarrow{${nomP}G} = (${fila1.join(',\\ ')})$ i els dos vectors directors són coplanaris: `
    + `el determinant que formen val $0$. A la primera fila, $\\overrightarrow{${nomP}G}$; a les altres, els vectors directors.`);
  // Sempre per Sarrus (mai per adjunts), amb claudàtors.
  const sr = sarrusSimbolic(fila1, v1, v2, 'H');
  const zero = R('Hq', '=') + K('Hz', '0');
  g.files[files.desenvolupa] = F.enLinies('', sr.texProductes, {final: zero});
  g.afegeix(TEXT_SARRUS);
  g.files[files.desenvolupa] = F.enLinies('', sr.texValors, {final: zero});
  g.afegeix('Fes cada producte, dins del seu claudàtor.');
  g.files[files.desenvolupa] = sr.texSense + zero;
  g.afegeix('Treu els claudàtors: el $-$ de davant del segon canvia el signe de cada terme de dins. Els zeros desapareixen.');
  g.files[files.desenvolupa] = sr.texAgrupat + zero;
  g.afegeix(`Agrupa els termes de cada parèntesi: $${(sr.coefs.some(c => !c.esZero()) ? sr.texAgrupat : '0').replace(/\\htmlData\{[^}]*\}/g, '')} = 0$.`, {fusiona: sr.fusiona});
  const n = sr.coefs;
  const pla = passosFormaGeneral(g, {P, n, files, escriuForma: false});
  return Object.assign(pla, {nSenseSimplificar: n});
}

/** El pla que passa per P amb vector normal n: A(x − a) + B(y − b) + C(z − c) = 0. Files: desenvolupa, pla. */
const passosPlaNormal = (g, {P, n, files, text}) => passosFormaGeneral(g, {P, n, files, text});


/* ── 3b. PRODUCTE VECTORIAL I SISTEMES 2×2 ────────────────────────── */

const UNITATS = Object.freeze(['\\vec{i}', '\\vec{j}', '\\vec{k}']);
const texVmatriu = B => `\\begin{vmatrix} ${B.map(f => f.map(x => M.texNombre(x)).join(' & ')).join(' \\\\ ')} \\end{vmatrix}`;
/** «-3\,\vec{j} - 3\,\vec{k}»: un vector escrit amb i, j, k (sense els termes nuls). */
const texIJK = w => w.map((c, j) => [c, j]).filter(([c]) => !c.esZero())
  .map(([c, j], n) => Mt.termeVar(c, (c.abs().igual(1) ? '' : '\\,') + UNITATS[j], n === 0)).join('') || '\\vec{0}';

/**
 * El producte vectorial u × v. Fila «producte»: el determinant |i j k; u; v| i el seu
 * desenvolupament per la primera fila, i·|·| − j·|·| + k·|·|. Fila «valor»: el resultat,
 * a i + b j + c k = (a, b, c). «nom» és el TeX del producte («\vec{n}_1 \times \vec{n}_2»).
 * Torna u × v.
 */
function passosProducteVectorial(g, {u, v, nom, files, P = 'V', text}) {
  const fila = w => w.map(x => M.texNombre(x)).join(' & ');
  const det = K(P + 'l', nom) + R(P + 'q', '=') + K(P + 'd', `\\begin{vmatrix} ${UNITATS.join(' & ')} \\\\ ${fila(u)} \\\\ ${fila(v)} \\end{vmatrix}`);
  // La fila és sempre una llista de línies: el determinant no es mou quan se n'hi afegeix una.
  const linies = ls => `\\begin{array}{l} ${ls.join(' \\\\[8pt] ')} \\end{array}`;
  g.files[files.producte] = linies([det]);
  g.afegeix(text || 'El producte vectorial es calcula com un determinant: a la primera fila, els vectors $\\vec{i}$, $\\vec{j}$, $\\vec{k}$; a les altres dues, '
    + 'les components dels dos vectors.');
  const sr = sarrusSimbolic(UNITATS, u, v, P);
  g.files[files.producte] = linies([det, F.enLinies('= ', sr.texProductes)]);
  g.afegeix(TEXT_SARRUS);
  const inici = K(P + 'L', nom) + R(P + 'Q', '=');
  g.files[files.valor] = F.enLinies(inici, sr.texValors);
  g.afegeix('Fes cada producte, dins del seu claudàtor.');
  g.files[files.valor] = inici + sr.texSense;
  g.afegeix('Treu els claudàtors: el $-$ de davant del segon canvia el signe de cada terme de dins. Els zeros desapareixen.');
  const w = vectorial(u, v);
  g.files[files.valor] = inici + K(P + 'c', texIJK(w));
  g.afegeix('Agrupa els termes de $\\vec{i}$, els de $\\vec{j}$ i els de $\\vec{k}$.',
    {fusiona: {[P + 'c']: Object.values(sr.fusiona).flat()}});
  g.files[files.valor] = inici + K(P + 'c', texIJK(w)) + R(P + 'r', '=') + K(P + 'v', texPunt(w));
  g.afegeix('Les components són els coeficients de $\\vec{i}$, $\\vec{j}$ i $\\vec{k}$.');
  return w;
}

/**
 * Si b és proporcional a a (a ≠ 0): {proporcionals: true, k, tex: «\vec{v} = 2\,\vec{u}»}. Si no,
 * una raó: dues components que no van en la mateixa proporció, «\dfrac{1}{2} \neq \dfrac{3}{1}»,
 * o una component nul·la de b on a no ho és, «u_{x} = 1,\ v_{x} = 0».
 */
function texProporcio(a, b, nomA, nomB, compA, compB) {
  const i = a.findIndex(x => !x.esZero());
  const k = b[i].quocient(a[i]);
  if (b.every((x, j) => x.igual(a[j].producte(k)))) {
    const f = k.igual(1) ? '' : k.igual(-1) ? '-' : `${M.texNombre(k)}\\,`;
    return {proporcionals: true, k, tex: `${nomB} = ${f}${nomA}`};
  }
  for (const [p, q] of [[0, 1], [0, 2], [1, 2]]) {
    if (!b[p].esZero() && !b[q].esZero() && !a[p].producte(b[q]).igual(a[q].producte(b[p]))) {
      return {proporcionals: false, tex: `\\dfrac{${M.texNombre(a[p])}}{${M.texNombre(b[p])}} \\neq \\dfrac{${M.texNombre(a[q])}}{${M.texNombre(b[q])}}`};
    }
  }
  const j = [0, 1, 2].find(c => b[c].esZero() && !a[c].esZero());
  return {proporcionals: false, tex: `${compA}_{${VARS[j]}} = ${M.texNombre(a[j])},\\ ${compB}_{${VARS[j]}} = 0`};
}

/** «1 \cdot 2 + (-1) \cdot (-1) + 1 \cdot 1»: el producte escalar u · v, terme a terme. */
const texEscalar = (u, v) => u.map((x, i) => `${M.texEntreParentesis(x)} \\cdot ${M.texEntreParentesis(v[i])}`).join(' + ');

/** El coeficient c per una coordenada lineal e = [e₀, e₁] (e₀ + e₁λ): «2 \cdot (1 + \lambda)», « - (-\lambda)», « + 3 \cdot 2». */
function texCoefLineal(c, e, primer, L) {
  const a = c.abs();
  // Un sol terme positiu en λ no porta parèntesis: «2\lambda», «2 \cdot 3\lambda» (mai «2(\lambda)»).
  const solLambda = e[0].esZero() && e[1].signe() > 0;
  const t = e[1].esZero() ? (a.igual(1) ? '' : `${M.texNombre(a)} \\cdot `) + M.texEntreParentesis(e[0])
    : solLambda ? (a.igual(1) ? '' : e[1].igual(1) ? M.texNombre(a) : `${M.texNombre(a)} \\cdot `) + Mt.texLineal(e, L)
      : (a.igual(1) ? '' : `${M.texNombre(a)} \\cdot `) + `(${Mt.texLineal(e, L)})`;
  if (primer) return (c.signe() < 0 ? '-' : '') + t;
  return (c.signe() < 0 ? ' - ' : ' + ') + t;
}

/** El primer membre d'un pla amb les coordenades lineals e = [[e₀, e₁], …] d'un punt genèric: «2 \cdot (1 + \lambda) - (-\lambda) + 7». */
function texSubstitucioLineal(n, D, e, L = '\\lambda') {
  const termes = n.map((c, i) => [c, e[i]]).filter(([c]) => !c.esZero());
  const constant = D && !D.esZero() ? (D.signe() > 0 ? ` + ${M.texNombre(D)}` : ` - ${M.texNombre(D.abs())}`) : '';
  return termes.map(([c, x], k) => texCoefLineal(c, x, k === 0, L)).join('') + constant;
}

/**
 * El punt genèric d'una recta r = {P, u}, P_λ = P + λu (fila «generic»), imposat a un pla {n, D}:
 * la substitució (fila «substitucio»), sense parèntesis (fila «desenvolupa») i agrupada, aλ = c
 * (fila «equacio»), amb a = n · u i c = −(n · P + D). Els textos dels passos, a «textos»
 * (generic, substitucio), si cal canviar-los; «etiqueta», el que s'escriu davant de la substitució
 * («\overrightarrow{PR_{\lambda}} \cdot \vec{u} =»), si cal. Torna {a, c}.
 */
function passosPuntGenericAlPla(g, {r, pla, files, L = '\\lambda', nom = 'P_{\\lambda}', textos = {}, etiqueta = '', davantGeneric = '', davantSubstitucio = ''}) {
  const e = r.P.map((x, i) => [x, r.u[i]]);
  // Un punt s'escriu sense signe igual, «P_r(1 + \lambda,\ …)» (David); un vector, amb «=».
  const esVector = nom.startsWith('\\overrightarrow');
  g.files[files.generic] = davantGeneric + K('Gp', nom) + (esVector ? R('Gq', '=') : '') + K('Gc', texGeneric(r, L));
  g.afegeix(textos.generic || `Un punt qualsevol de la recta, el punt genèric: cada valor de $${L}$ en dona un.`);
  const termes = pla.n.map((c, i) => [c, e[i]]).filter(([c]) => !c.esZero());
  g.files[files.substitucio] = davantSubstitucio + (etiqueta ? K('Gn', etiqueta) + R('Go', '=') : '') + K('Gs', texSubstitucioLineal(pla.n, pla.D, e, L)) + R('Gt', '=') + K('Gz', '0');
  g.afegeix(textos.substitucio || `Imposa que $${nom}$ sigui del pla: a l'equació del pla, canvia $x$, $y$, $z$ per les coordenades de $${nom}$. Queda una equació en $${L}$.`);
  // Sense parèntesis: cada coeficient per cada terme.
  const peces = [];
  for (const [c, x] of termes) {
    if (!x[0].esZero()) peces.push([c.producte(x[0]), '']);
    if (!x[1].esZero()) peces.push([c.producte(x[1]), L]);
  }
  if (pla.D && !pla.D.esZero()) peces.push([pla.D, '']);
  const texPeca = ([c, v], k) => (v ? Mt.termeVar(c, v, k === 0) : k === 0 ? M.texNombre(c) : (c.signe() < 0 ? ` - ${M.texNombre(c.abs())}` : ` + ${M.texNombre(c)}`));
  g.files[files.desenvolupa] = K('Gx', peces.length ? peces.map(texPeca).join('') : '0') + R('Gy', '=') + K('Gw', '0');
  g.afegeix('Treu els parèntesis: multiplica cada coeficient per cada terme.');
  const a = escalar(pla.n, r.u), c = escalar(pla.n, r.P).suma(pla.D || fr(0)).oposada();
  const esquerre = a.esZero() ? `0${L}` : Mt.termeVar(a, L, true);
  g.files[files.equacio] = K('Ge', esquerre) + R('Gf', '=') + K('Gd', M.texNombre(c));
  g.afegeix(`Agrupa: els termes amb $${L}$ a l'esquerra (${a.esZero() ? 's\'anul·len' : `sumen $${esquerre}$`}) i els nombres a la dreta, canviats de signe.`);
  return {a, c};
}

/* ── 3c. DISTÀNCIES ────────────────────────────────────────────────── */

/** √q (q ≥ 0 racional), simplificada: {c, m} amb √q = c·√m (m enter sense quadrats; m = 1 si és racional). */
function arrelQuadrada(q) {
  if (q.esZero()) return {c: fr(0), m: 1};
  let k = 1, m = q.num * q.den;
  for (let p = 2; p * p <= m; p++) while (m % (p * p) === 0) { m /= p * p; k *= p; }
  return {c: fr(k, q.den), m};
}
/** c·√m en TeX: «3», «\frac{3}{2}», «\sqrt{6}», «2\sqrt{6}», «\dfrac{\sqrt{6}}{2}». */
function texArrel({c, m}) {
  if (m === 1) return M.texNombre(c);
  const a = c.abs();
  const num = (a.num === 1 ? '' : a.num) + `\\sqrt{${m}}`;
  return (c.signe() < 0 ? '-' : '') + (a.den === 1 ? num : `\\dfrac{${num}}{${a.den}}`);
}
/** «\sqrt{2^2 + (-1)^2 + 2^2}»: el mòdul d'un vector, amb els quadrats escrits. */
const texModul = v => `\\sqrt{${v.map(x => `${M.texEntreParentesis(x)}^2`).join(' + ')}}`;
const modul2 = v => escalar(v, v);

/**
 * La distància |N| / √S (N, S racionals, S > 0), pas a pas: «\dfrac{|5|}{\sqrt{9}} = \dfrac{5}{3}», o
 * amb S no quadrat, racionalitzada: «\dfrac{|3|}{\sqrt{6}} = \dfrac{3\sqrt{6}}{6} = \dfrac{\sqrt{6}}{2}».
 * Torna les peces (TeX, amb « = » davant) a partir del quocient amb el valor absolut, i el valor {c, m}.
 */
function pecesQuocientArrel(N, S, P) {
  const d = arrelQuadrada(N.producte(N).quocient(S));
  const rS = arrelQuadrada(S);
  const peces = [' = ' + K(`${P}a`, `\\dfrac{\\left|${M.texNombre(N)}\\right|}{\\sqrt{${M.texNombre(S)}}}`)];
  if (rS.m === 1 || N.esZero()) {
    peces.push(' = ' + K(`${P}r`, texArrel(d)));
  } else {
    const racional = `\\dfrac{${M.texNombre(N.abs())}\\sqrt{${M.texNombre(S)}}}{${M.texNombre(S)}}`;
    peces.push(' = ' + K(`${P}b`, racional));
    if (texArrel(d) !== racional) peces.push(' = ' + K(`${P}r`, texArrel(d)));
  }
  return {peces, d};
}

/**
 * Un sistema de 2 equacions amb 2 incògnites, S = [[a, b, c], [d, e, f]] (a·v₁ + b·v₂ = c), amb solució
 * única, pel mètode de reducció de 4t d'ESO, sense matrius (mai Cramer: David). Es fa desaparèixer
 * la incògnita amb els multiplicadors més petits (els del mínim comú múltiple dels coeficients;
 * per 1 no s'escriu: l'equació es copia), se sumen les equacions (ratlla a sobre del resultat),
 * s'aïlla l'altra incògnita, se substitueix en una equació (millor la que té coeficient ±1) i
 * s'aïlla la primera. Si una equació només té una incògnita, es fa servir directament.
 * Tot a la fila «fila», línia a línia. Torna la solució [v₁, v₂].
 */
/** «(EQ.2)», d'un altre color (David): el nom d'una equació d'un sistema, a la seva dreta i a la reducció. */
const COLOR_EQ = '#b45309';
const texEq = k => `\\textcolor{${COLOR_EQ}}{\\text{(EQ.${k})}}`;
/** Un sistema amb el nom de cada equació a la dreta: «−2λ + μ = 5   (EQ.1)». linies: TeX de cada equació. */
const texSistemaEq = (linies, inici = 1) => `\\left\\{\\begin{array}{ll} ${linies.map((l, i) => `${l} & \\quad ${texEq(inici + i)}`).join(' \\\\ ')} \\end{array}\\right.`;

function passosReduccio2(g, {S, vars, fila, P = 'X', eqs = [1, 2]}) {
  const [E1, E2] = S;
  const eq = e => Mt.texEquacio(e.slice(0, 2), e[2], vars);
  const linies = [];
  const pinta = () => { g.files[fila] = `\\begin{array}{rl} ${linies.join(' \\\\[6pt] ')} \\end{array}`; };
  const linia = (etiqueta, tex) => `${etiqueta} & ${K(`${P}${linies.length}`, tex)}`;
  // Les etiquetes: «(EQ.2) · (−2):», o «(EQ.1):» si no es multiplica (David).
  const nomEq = E => eqs[E === E1 ? 0 : 1];
  const etiqueta = (E, m) => `${texEq(nomEq(E))}${m && !m.igual(1) ? ` \\cdot ${m.signe() < 0 ? `(${M.texNombre(m)})` : M.texNombre(m)}` : ''}:`;
  // Quan ja es té el valor d'una incògnita, es requadra (David).
  const caixa = t => `\\boxed{${t}}`;
  const enter = x => x.den === 1;
  let unica, q;                                            // l'equació d'una sola incògnita, i la incògnita (0 o 1)
  const sola = [E1, E2].find(E => E[0].esZero() || E[1].esZero());
  if (sola) {
    unica = sola;
    q = sola[0].esZero() ? 1 : 0;
    linies.push(linia(etiqueta(sola), unica[q].igual(1) ? caixa(eq(unica)) : eq(unica)));
    pinta();
    g.afegeix(`L'equació ${texEqText(nomEq(sola))} només té una incògnita: $${eq(unica)}$. D'aquí es treu $${vars[q]}$.`);
  } else {
    // Per a cada incògnita, els multiplicadors més petits que en fan oposats els coeficients
    // (amb el mínim comú múltiple, com a 4t d'ESO); es fa desaparèixer la que en té de més petits.
    const opcions = [0, 1].map(j => {
      const a = E1[j], c = E2[j];
      const d = enter(a) && enter(c) ? M.mcd(Math.abs(a.num), Math.abs(c.num)) : 1;
      let m1 = c.oposada().quocient(d), m2 = a.quocient(d);
      if (m1.signe() < 0 && m2.signe() < 0) { m1 = m1.oposada(); m2 = m2.oposada(); }
      return {j, m1, m2, cost: Math.abs(m1.valor()) + Math.abs(m2.valor()), cops: [m1, m2].filter(m => !m.igual(1)).length};
    });
    // Els multiplicadors més petits; si empaten, la que en té menys que no siguin 1 (sumar directament, si es pot).
    const millor = (o, p) => o.cost - p.cost || o.cops - p.cops;
    const {j: e, m1, m2} = millor(opcions[1], opcions[0]) < 0 ? opcions[1] : opcions[0];
    q = 1 - e;
    const A = E1.map(x => x.producte(m1)), B = E2.map(x => x.producte(m2));
    unica = A.map((x, k) => x.suma(B[k]));
    linies.push(linia(etiqueta(E1, m1), eq(A)));
    linies.push(linia(etiqueta(E2, m2), eq(B)));
    pinta();
    const v = vars[e];
    const quines = [m1.igual(1) ? '' : `multiplica ${texEqText(eqs[0])} per $${M.texNombre(m1)}$`, m2.igual(1) ? '' : `${m1.igual(1) ? 'multiplica ' : ''}${texEqText(eqs[1])} per $${M.texNombre(m2)}$`].filter(Boolean);
    g.afegeix(quines.length
      ? `Mètode de reducció: perquè $${v}$ desaparegui en sumar, ${quines.join(' i ')}${quines.length === 1 ? ' (l\'altra equació es queda igual)' : ''}. `
        + `Així els coeficients de $${v}$ queden oposats: $${M.texNombre(A[e])}$ i $${M.texNombre(B[e])}$.`
      : `Mètode de reducció: els coeficients de $${v}$ ja són oposats ($${M.texNombre(A[e])}$ i $${M.texNombre(B[e])}$). Escriu les dues equacions una sota l'altra.`);
    linies.push('\\hline ' + linia('', unica[q].igual(1) ? caixa(eq(unica)) : eq(unica)));   // la ratlla de la suma, just a sobre del resultat
    pinta();
    g.afegeix(`Suma les dues equacions: $${v}$ desapareix.`);
  }
  const e = 1 - q;
  const sq = unica[2].quocient(unica[q]);
  if (!unica[q].igual(1)) {
    linies.push(linia('', caixa(`${vars[q]} = ${M.texNombre(sq)}`)));
    pinta();
    g.afegeix(`Divideix per $${M.texNombre(unica[q])}$: $${vars[q]} = ${M.texNombre(sq)}$.`);
  }
  // L'altra incògnita: a una equació que la tingui (millor si el seu coeficient és 1 o −1), la trobada pel seu valor.
  const candidates = [E1, E2].filter(E => E !== unica && !E[e].esZero());
  const Ex = candidates.find(E => E[e].abs().igual(1)) || candidates[0];
  const [ce, cq, c] = [Ex[e], Ex[q], Ex[2]];
  const resta = c.resta(cq.producte(sq));
  const se = resta.quocient(ce);
  const quina = texEqText(nomEq(Ex));
  const valorE = `${vars[e]} = ${M.texNombre(se)}`;
  if (!cq.esZero()) {
    const numeric = primer => {
      const a = cq.abs();
      const t = a.igual(1) ? (primer && cq.signe() > 0 ? M.texNombre(sq) : M.texEntreParentesis(sq)) : `${M.texNombre(a)} \\cdot ${M.texEntreParentesis(sq)}`;
      return primer ? (cq.signe() < 0 ? '-' : '') + t : (cq.signe() < 0 ? ` - ${t}` : ` + ${t}`);
    };
    const esquerre = e === 0 ? Mt.termeVar(ce, vars[e], true) + numeric(false) : numeric(true) + Mt.termeVar(ce, vars[e], false);
    linies.push(linia(etiqueta(Ex), `${esquerre} = ${M.texNombre(c)}`));
    pinta();
    g.afegeix(`Substitueix $${vars[q]} = ${M.texNombre(sq)}$ a ${quina}.`);
    const aillat = `${Mt.termeVar(ce, vars[e], true)} = ${M.texNombre(resta)}`;
    linies.push(linia('', ce.igual(1) ? caixa(aillat) : aillat));
    pinta();
    g.afegeix('Passa el nombre a l\'altre costat, canviat de signe.');
  } else if (ce.igual(1)) {
    linies.push(linia(etiqueta(Ex), caixa(valorE)));
    pinta();
    g.afegeix(`${quina[0].toUpperCase()}${quina.slice(1)} ja dona $${valorE}$.`);
  } else {
    linies.push(linia(etiqueta(Ex), eq(Ex)));
    pinta();
    g.afegeix(`${quina[0].toUpperCase()}${quina.slice(1)} només té $${vars[e]}$.`);
  }
  if (!ce.igual(1)) {
    linies.push(linia('', caixa(valorE)));
    pinta();
    g.afegeix(`Divideix per $${M.texNombre(ce)}$: $${valorE}$.`);
  }
  return e === 0 ? [se, sq] : [sq, se];
}
/** «l'equació (EQ.2)» per al text del pas, amb el mateix color. */
const texEqText = k => `l'equació $${texEq(k)}$`;


/* ── 4. ESQUEMES ───────────────────────────────────────────────────── */

/*
 * Petits dibuixos en perspectiva (no a escala) per veure les idees: el pla és un paral·lelogram,
 * els vectors són fletxes. Fan servir les classes de estil.css (.pla, .vector, .recta…).
 */
const fletxa = (x1, y1, x2, y2, classe = 'vector') => {
  const a = Math.atan2(y2 - y1, x2 - x1), l = 9, o = 0.45;
  const p = [[x2, y2], [x2 - l * Math.cos(a - o), y2 - l * Math.sin(a - o)], [x2 - l * Math.cos(a + o), y2 - l * Math.sin(a + o)]];
  return `<line class="${classe}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/><polygon class="punta" points="${p.map(q => q.map(c => c.toFixed(1)).join(',')).join(' ')}"/>`;
};
/** Un text; «π_1» posa l'1 com a subíndex. */
const sub = t => t.replace(/_([^_]+)$/, '<tspan class="sub" dy="4">$1</tspan>');
const text = (x, y, t, classe = '') => `<text x="${x}" y="${y}"${classe ? ` class="${classe}"` : ''}>${sub(t)}</text>`;
/** Un pla (paral·lelogram). «classe»: 'pla' o 'pla2' (un segon pla, d'un altre color). */
const pla = (punts, nom, x, y, classe = 'pla') => `<polygon class="${classe}" points="${punts.map(q => q.join(',')).join(' ')}"/>` + (nom ? text(x, y, nom) : '');
const puntSvg = (x, y) => `<circle class="punt" cx="${x}" cy="${y}" r="3"/>`;
/** L'esquema: 300 d'ample; [dalt, baix] és la franja vertical que ocupa el dibuix (sense marges buits). */
const svg = (cos, [dalt, baix] = [0, 170]) => `<svg viewBox="0 ${dalt} 300 ${baix - dalt}" xmlns="http://www.w3.org/2000/svg" role="img">${cos}</svg>`;
/* El nom d'un vector amb la fletxa a sobre, dibuixada (la fletxa combinable «n⃗» no es posa bé a
   sobre de la lletra en totes les fonts). L'amplada de les lletres és aproximada. */
const ampleLletres = t => [...t].reduce((s, c) => s + (/[A-Z]/.test(c) ? 11 : 8.5), 0);
/** L'amplada d'un nom, amb el subíndex («n_1»). */
const ampleNom = nom => { const [base, i = ''] = nom.split('_'); return ampleLletres(base) + 6 * i.length; };
const nomVector = (x, y, nom) => text(x, y, nom, 'cat')
  + `<path class="sobre" d="M${x + 1} ${y - 15}h${ampleLletres(nom.split('_')[0])}m-3.5 -3l3.5 3l-3.5 3"/>`;
/** Una etiqueta de vectors iguals: «n⃗ = u⃗». */
const vectors = (x, y, ...noms) => noms.map((nom, i) => {
  const tros = (i ? text(x, y, '=', 'cat') : '') + nomVector(x + (i ? 16 : 0), y, nom);
  x += (i ? 16 : 0) + ampleNom(nom) + 8;
  return tros;
}).join('');

const ESQUEMES = Object.freeze({
  /** Tres punts del pla: els vectors AB i AC hi són, i també AG per a qualsevol punt G del pla (mai X per a un punt). */
  'tres-punts': () => svg(pla([[20, 130], [200, 130], [280, 60], [100, 60]], 'π', 250, 125)
    + puntSvg(80, 110) + text(64, 126, 'A') + puntSvg(170, 115) + text(172, 132, 'B') + puntSvg(150, 75) + text(140, 70, 'C')
    + fletxa(80, 110, 168, 115) + fletxa(80, 110, 148, 76) + puntSvg(215, 90) + text(220, 86, 'G') + fletxa(80, 110, 213, 90, 'discontinua'), [52, 140]),
  /** Una recta perpendicular a un pla: el seu vector director és el vector normal del pla. */
  'perpendicular': () => svg(pla([[20, 130], [200, 130], [280, 70], [100, 70]], 'π', 252, 122)
    + `<line class="recta" x1="150" y1="165" x2="150" y2="10"/>` + text(158, 18, 'r') + puntSvg(150, 100) + text(130, 116, 'P')
    + fletxa(150, 100, 150, 40) + vectors(158, 52, 'n', 'u'), [0, 170]),
  /** Dos plans paral·lels: tenen el mateix vector normal. */
  'paralels': () => svg(pla([[20, 70], [190, 70], [270, 25], [100, 25]], 'π', 245, 42) + pla([[20, 150], [190, 150], [270, 105], [100, 105]], 'π′', 245, 122, 'pla2')
    + fletxa(140, 48, 140, 8) + vectors(148, 18, 'n') + fletxa(140, 128, 140, 88) + vectors(148, 98, 'n') + puntSvg(80, 135) + text(64, 148, 'P'), [0, 155]),
  /** El pla mediador d'un segment: perpendicular al segment pel seu punt mitjà. */
  'mediador': () => svg(pla([[120, 160], [180, 120], [180, 10], [120, 50]], 'π', 186, 30)
    + `<line class="recta" x1="40" y1="100" x2="260" y2="70"/>` + puntSvg(40, 100) + text(26, 96, 'A') + puntSvg(260, 70) + text(266, 72, 'B')
    + puntSvg(150, 85) + text(132, 104, 'M') + fletxa(150, 85, 215, 76) + vectors(196, 66, 'AB'), [5, 165]),
  /** Un pla que conté una recta i és perpendicular a un altre pla: el vector normal de l'altre és un vector director seu. */
  'conte-perpendicular': () => svg(pla([[10, 150], [190, 150], [290, 100], [110, 100]], 'π', 262, 140)
    + pla([[90, 125], [210, 125], [210, 20], [90, 20]], 'σ', 196, 38, 'pla2') + `<line class="recta" x1="70" y1="70" x2="230" y2="70"/>` + text(236, 74, 'r')
    + fletxa(130, 70, 175, 70) + vectors(160, 62, 'u') + fletxa(110, 118, 110, 48) + vectors(116, 58, 'n'), [15, 155]),
  /** Un punt i una recta: el vector director de la recta i el vector que va de la recta al punt. */
  'punt-recta': () => svg(pla([[20, 140], [210, 140], [285, 60], [95, 60]], 'π', 258, 132)
    + `<line class="recta" x1="40" y1="122" x2="250" y2="80"/>` + text(254, 82, 'r') + puntSvg(80, 114) + text(66, 132, 'Q')
    + fletxa(80, 114, 140, 102) + vectors(120, 134, 'u') + puntSvg(170, 72) + text(176, 68, 'P') + fletxa(80, 114, 168, 73), [48, 145]),
  /** Dues rectes que es tallen: els seus vectors directors són al pla. */
  'dues-rectes': () => svg(pla([[20, 140], [210, 140], [285, 60], [95, 60]], 'π', 258, 132)
    + `<line class="recta" x1="40" y1="125" x2="260" y2="80"/>` + text(262, 84, 'r') + `<line class="recta" x1="90" y1="70" x2="200" y2="135"/>` + text(204, 140, 's')
    + puntSvg(150, 101) + fletxa(150, 101, 205, 90) + vectors(200, 82, 'u') + fletxa(150, 101, 120, 83) + vectors(128, 79, 'v'), [48, 148]),
  /** Una recta que talla un pla en un punt Q (per sota del pla, discontínua). */
  'recta-secant': () => svg(pla([[20, 135], [200, 135], [280, 75], [100, 75]], 'π', 250, 128)
    + `<line class="recta" x1="118" y1="10" x2="150" y2="105"/><line class="discontinua" x1="150" y1="105" x2="165" y2="150"/>`
    + `<line class="recta" x1="165" y1="150" x2="172" y2="170"/>` + text(126, 22, 'r') + puntSvg(150, 105) + text(158, 112, 'Q'), [0, 172]),
  /** Una recta paral·lela a un pla: u és perpendicular a n, i la recta no toca el pla. */
  'recta-paralela': () => svg(pla([[20, 135], [200, 135], [280, 75], [100, 75]], 'π', 250, 128)
    + `<line class="recta" x1="30" y1="38" x2="250" y2="38"/>` + text(256, 42, 'r') + puntSvg(70, 38) + text(62, 30, 'P')
    + fletxa(70, 38, 130, 38) + vectors(98, 60, 'u') + fletxa(170, 108, 170, 58) + vectors(177, 76, 'n'), [10, 140]),
  /** Una recta continguda en un pla: u és perpendicular a n, i el punt P de la recta és del pla. */
  'recta-continguda': () => svg(pla([[20, 135], [200, 135], [280, 75], [100, 75]], 'π', 250, 128)
    + `<line class="recta" x1="45" y1="122" x2="262" y2="88"/>` + text(266, 90, 'r') + puntSvg(95, 114) + text(84, 130, 'P')
    + fletxa(95, 114, 155, 104.6) + vectors(128, 128, 'u') + fletxa(200, 97.5, 200, 40) + vectors(207, 56, 'n'), [25, 140]),
  /** Dues rectes que es tallen en un punt R (mai X per a un punt: David). */
  'rectes-es-tallen': () => svg(`<line class="recta" x1="30" y1="130" x2="270" y2="50"/><line class="recta" x1="50" y1="30" x2="250" y2="150"/>`
    + text(274, 52, 'r') + text(252, 162, 's') + puntSvg(150, 90) + text(146, 116, 'R')
    + fletxa(150, 90, 210, 70) + vectors(196, 62, 'u') + fletxa(150, 90, 201.4, 120.9) + vectors(212, 120, 'v'), [20, 165]),
  /** Dues rectes que es creuen: no es tallen i no són paral·leles (s passa per darrere de r). */
  'rectes-es-creuen': () => svg(`<line class="recta" x1="30" y1="120" x2="270" y2="60"/>`
    + `<line class="recta" x1="70" y1="25" x2="140" y2="78"/><line class="discontinua" x1="140" y1="78" x2="170" y2="100.7"/><line class="recta" x1="170" y1="100.7" x2="240" y2="153.6"/>`
    + text(274, 62, 'r') + text(244, 165, 's') + fletxa(60, 112.5, 120, 97.5) + vectors(84, 132, 'u') + fletxa(190, 115.8, 230, 146) + vectors(236, 128, 'v'), [15, 170]),
  /** Dues rectes paral·leles: vectors directors proporcionals, i cap punt comú. */
  'rectes-paraleles': () => svg(`<line class="recta" x1="30" y1="60" x2="270" y2="40"/><line class="recta" x1="30" y1="130" x2="270" y2="110"/>`
    + text(274, 42, 'r') + text(274, 112, 's') + puntSvg(80, 55.8) + text(74, 48, 'P') + puntSvg(170, 115.8) + text(166, 108, 'Q')
    + fletxa(110, 53.3, 170, 48.3) + vectors(140, 72, 'u') + fletxa(60, 127.5, 120, 122.5) + vectors(84, 148, 'v'), [25, 155]),
  /** Dues rectes coincidents: són la mateixa recta (Q també és de r). */
  'rectes-coincidents': () => svg(`<line class="recta" x1="30" y1="120" x2="270" y2="60"/>` + text(258, 50, 'r = s')
    + puntSvg(80, 107.5) + text(74, 128, 'P') + puntSvg(200, 77.5) + text(196, 98, 'Q') + fletxa(80, 107.5, 140, 92.5) + vectors(104, 82, 'u'), [35, 135]),
  /** La distància d'un punt a un pla: el segment perpendicular, del punt al seu peu H. */
  'distancia-punt-pla': () => svg(pla([[20, 135], [200, 135], [280, 75], [100, 75]], 'π', 250, 128)
    + `<line class="discontinua" x1="150" y1="30" x2="150" y2="105"/><path class="recta" d="M150 95h8v8"/>` + puntSvg(150, 30) + text(158, 34, 'P')
    + puntSvg(150, 105) + text(156, 122, 'Q') + text(136, 72, 'd'), [15, 140]),
  /** Els dos plans paral·lels a π a distància d: un a cada banda. */
  'plans-a-distancia': () => svg(pla([[30, 50], [190, 50], [260, 20], [100, 20]], 'π′_1', 226, 46) + pla([[30, 105], [190, 105], [260, 75], [100, 75]], 'π', 230, 100, 'pla2')
    + pla([[30, 160], [190, 160], [260, 130], [100, 130]], 'π′_2', 226, 156)
    + `<line class="discontinua" x1="145" y1="35" x2="145" y2="90"/><line class="discontinua" x1="145" y1="90" x2="145" y2="145"/>`
    + text(151, 68, 'd') + text(151, 124, 'd'), [12, 168]),
  /** Els punts d'una recta a distància d d'un pla: un a cada banda. */
  'punts-a-distancia': () => svg(pla([[20, 110], [200, 110], [280, 60], [100, 60]], 'π', 252, 104)
    + `<line class="recta" x1="70" y1="15" x2="230" y2="175"/>` + text(236, 172, 'r')
    + `<line class="discontinua" x1="95" y1="40" x2="95" y2="85"/><line class="discontinua" x1="205" y1="150" x2="205" y2="95"/>`
    + puntSvg(95, 40) + text(70, 38, 'P_1') + puntSvg(205, 150) + text(178, 160, 'P_2') + text(100, 68, 'd') + text(210, 126, 'd'), [5, 180]),
  /** La distància d'un punt a una recta: l'altura del paral·lelogram de costats QP i u. */
  'distancia-punt-recta': () => svg(`<line class="recta" x1="30" y1="130" x2="275" y2="130"/>` + text(279, 134, 'r')
    + `<line class="discontinua" x1="190" y1="50" x2="260" y2="50"/><line class="discontinua" x1="260" y1="50" x2="150" y2="130"/>`
    + `<line class="discontinua" x1="190" y1="50" x2="190" y2="130"/><path class="recta" d="M190 120h8v10"/>`
    + puntSvg(80, 130) + text(70, 148, 'Q') + puntSvg(190, 50) + text(184, 42, 'P') + fletxa(80, 130, 150, 130) + vectors(110, 150, 'u')
    + fletxa(80, 130, 188, 51.5) + text(196, 98, 'd'), [30, 158]),
  /** La projecció d'un punt sobre un pla: el peu Q de la perpendicular (David: Q, no H). Sense P′: no el demanen. */
  'projeccio-pla': () => svg(pla([[20, 115], [200, 115], [280, 65], [100, 65]], 'π', 252, 108)
    + `<line class="recta" x1="150" y1="10" x2="150" y2="90"/><path class="recta" d="M150 80h8v8"/>`
    + puntSvg(150, 25) + text(158, 29, 'P') + puntSvg(150, 90) + text(156, 106, 'Q')
    + fletxa(150, 25, 150, 55) + vectors(124, 50, 'n'), [0, 120]),
  /** El simètric d'un punt respecte d'un pla: Q és el punt mitjà de P i P′. */
  'simetric-pla': () => svg(pla([[20, 115], [200, 115], [280, 65], [100, 65]], 'π', 252, 108)
    + `<line class="recta" x1="150" y1="10" x2="150" y2="90"/><line class="discontinua" x1="150" y1="90" x2="150" y2="170"/><path class="recta" d="M150 80h8v8"/>`
    + puntSvg(150, 25) + text(158, 29, 'P') + puntSvg(150, 90) + text(156, 106, 'Q') + puntSvg(150, 155) + text(158, 160, 'P′')
    + fletxa(150, 25, 150, 55) + vectors(124, 50, 'n'), [0, 175]),
  /** La projecció d'un punt sobre una recta: el punt Q de la recta més proper a P. Sense P′: no el demanen. */
  'projeccio-recta': () => svg(`<line class="recta" x1="25" y1="100" x2="275" y2="100"/>` + text(279, 104, 'r')
    + `<line class="discontinua" x1="150" y1="25" x2="150" y2="100"/><path class="recta" d="M150 90h10v10"/>`
    + puntSvg(150, 30) + text(158, 34, 'P') + puntSvg(150, 100) + text(156, 118, 'Q')
    + fletxa(70, 100, 120, 100) + vectors(88, 90, 'u'), [15, 125]),
  /** El simètric d'un punt respecte d'una recta: Q és el punt mitjà de P i P′. */
  'simetric-recta': () => svg(`<line class="recta" x1="25" y1="100" x2="275" y2="100"/>` + text(279, 104, 'r')
    + `<line class="discontinua" x1="150" y1="25" x2="150" y2="175"/><path class="recta" d="M150 90h10v10"/>`
    + puntSvg(150, 30) + text(158, 34, 'P') + puntSvg(150, 100) + text(156, 118, 'Q') + puntSvg(150, 170) + text(158, 174, 'P′')
    + fletxa(70, 100, 120, 100) + vectors(88, 90, 'u'), [15, 180]),
  /** L'àrea d'un triangle: la meitat del paral·lelogram de costats AB i AC. */
  'triangle': () => svg(`<polygon class="pla" points="50,140 210,120 120,40"/>`
    + `<line class="discontinua" x1="210" y1="120" x2="280" y2="20"/><line class="discontinua" x1="120" y1="40" x2="280" y2="20"/>`
    + fletxa(50, 140, 208, 120.3) + fletxa(50, 140, 118.5, 41.5) + puntSvg(50, 140) + text(36, 152, 'A') + puntSvg(210, 120) + text(214, 136, 'B')
    + puntSvg(120, 40) + text(108, 34, 'C'), [10, 158]),
  /** El volum d'un tetraedre: una sisena part del paral·lelepípede de costats AB, AC i AD. */
  'tetraedre': () => svg(`<polygon class="pla" points="40,140 200,150 260,100"/>`
    + `<line class="recta" x1="40" y1="140" x2="150" y2="25"/><line class="recta" x1="200" y1="150" x2="150" y2="25"/><line class="discontinua" x1="260" y1="100" x2="150" y2="25"/>`
    + fletxa(40, 140, 198, 149.9) + fletxa(40, 140, 258, 100.3) + fletxa(40, 140, 148.6, 26.5)
    + puntSvg(40, 140) + text(26, 152, 'A') + puntSvg(200, 150) + text(204, 166, 'B') + puntSvg(260, 100) + text(266, 104, 'C') + puntSvg(150, 25) + text(158, 24, 'D'), [10, 170]),
  /** El quart vèrtex D sobre una recta: el punt genèric D_λ, i el volum imposat. */
  'quart-vertex': () => svg(`<polygon class="pla" points="40,150 200,160 260,110"/>` + `<line class="recta" x1="20" y1="30" x2="285" y2="60"/>` + text(288, 64, 'r')
    + `<line class="discontinua" x1="40" y1="150" x2="120" y2="39"/><line class="discontinua" x1="200" y1="160" x2="120" y2="39"/><line class="discontinua" x1="260" y1="110" x2="120" y2="39"/>`
    + puntSvg(40, 150) + text(26, 162, 'A') + puntSvg(200, 160) + text(204, 176, 'B') + puntSvg(260, 110) + text(266, 114, 'C') + puntSvg(120, 39) + text(110, 28, 'D_λ'), [15, 180]),
  /** Les dues solucions del quart vèrtex: els tetraedres ABCD₁ (a sobre del pla ABC) i ABCD₂ (a sota), amb D₁ i D₂ sobre r. */
  'quart-vertex-solucions': () => svg(`<polygon class="pla" points="50,120 190,135 250,95"/>` + `<line class="recta" x1="137" y1="0" x2="173" y2="235"/>` + text(124, 10, 'r')
    + `<line class="cat-recta" x1="50" y1="120" x2="170" y2="215"/><line class="cat-recta" x1="190" y1="135" x2="170" y2="215"/><line class="discontinua" x1="250" y1="95" x2="170" y2="215"/>`
    + `<line class="recta" x1="50" y1="120" x2="140" y2="20"/><line class="recta" x1="190" y1="135" x2="140" y2="20"/><line class="recta" x1="250" y1="95" x2="140" y2="20"/>`
    + puntSvg(50, 120) + text(34, 128, 'A') + puntSvg(190, 135) + text(196, 148, 'B') + puntSvg(250, 95) + text(256, 100, 'C')
    + puntSvg(140, 20) + text(148, 20, 'D_1', 'cat') + puntSvg(170, 215) + text(178, 222, 'D_2', 'cat'), [-5, 240]),
  /** La perpendicular comuna de dues rectes que es creuen: talla r a P₀ i s a Q₀, en angle recte. */
  'perpendicular-comuna': () => svg(`<line class="recta" x1="25" y1="135" x2="275" y2="95"/><line class="recta" x1="60" y1="20" x2="130" y2="60"/>`
    + `<line class="discontinua" x1="130" y1="60" x2="170" y2="82.9"/><line class="recta" x1="170" y1="82.9" x2="250" y2="128.6"/>`
    + `<line class="cat-recta" x1="150" y1="20" x2="150" y2="160"/>` + text(279, 98, 'r') + text(254, 140, 's') + text(156, 22, 'p')
    + puntSvg(150, 115) + text(130, 132, 'P_0') + puntSvg(150, 71.4) + text(156, 66, 'Q_0') + `<path class="recta" d="M150 105h9v9"/>`, [12, 165]),
  /** Dos plans que es tallen en una recta: el vector director de la recta és perpendicular als dos vectors normals. */
  'dos-plans': () => svg(pla([[15, 150], [205, 150], [285, 95], [95, 95]], 'π_1', 252, 144)
    + pla([[55, 168], [245, 168], [245, 48], [55, 48]], 'π_2', 62, 66, 'pla2') + `<line class="recta" x1="30" y1="122" x2="268" y2="122"/>` + text(272, 126, 'r')
    + puntSvg(150, 122) + fletxa(150, 122, 212, 122) + vectors(194, 140, 'u') + fletxa(150, 122, 150, 64) + vectors(157, 76, 'n_1')
    + fletxa(150, 122, 110, 150) + vectors(84, 164, 'n_2'), [30, 172]),
});
const esquema = nom => ESQUEMES[nom]();


/* ── EXPORTACIÓ ────────────────────────────────────────────────────── */

arrel.Geometria = Object.freeze({
  VARS, punt, resta, suma, escala, escalar, vectorial, esZero, factorComu, vectorSimple,
  texPunt, texPuntNom, texMenys, texEsquerre, texPla, texSubstitucio, texRecta, texGeneric,
  passosPlaDeterminant, passosPlaNormal, passosFormaGeneral,
  UNITATS, texIJK, passosProducteVectorial, passosReduccio2, texEq, texSistemaEq, COLOR_EQ, texEscalar, passosPuntGenericAlPla, texProporcio, texSubstitucioLineal,
  arrelQuadrada, texArrel, texModul, modul2, pecesQuocientArrel,
  esquema, ESQUEMES,
});

})(globalThis);
