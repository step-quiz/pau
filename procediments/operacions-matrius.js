/* ═══════════════════════════════════════════════════════════════════
   operacions-matrius.js — Procediment: operacions amb matrius
   ───────────────────────────────────────────────────────────────────
   Sis problemes fixos, triats a partir dels exercicis PAU:
     producte       AB i BA amb A 2×3 i B 3×2: primer les mides
                    (quan es poden multiplicar, quina mida té el
                    resultat) i després files per columnes; AB ≠ BA.
     quadrat        A² d'una matriu 3×3 (surt A² = A: idempotent).
     commuten       A amb un paràmetre: AB = BA element a element →
                    una equació de segon grau en a.
     familia        A = (a b; −b a), A² = I: un sistema amb dues
                    incògnites (2ab = 0 → dos casos, un sense solució).
     inversa-igual  A⁻¹ = A ⟺ A² = I, amb un paràmetre: cada element
                    dona una condició; serveixen els valors que les
                    compleixen totes.
     identitat      (A − I)² = 4I → A⁻¹ = ⅓(A − 2I), amb lletres
                    (sense canviar l'ordre dels productes), i el càlcul.
   Adreça: operacions-matrius.html?p=producte
   Producte de matrius (passosProducte): la fila «AB = (…)(…) = (c₁₁ …)»
   amb els noms c_ij dels elements; cada pas en calcula un (o una fila
   sencera) a la fila de treball, amb la fila de la primera matriu i la
   columna de la segona marcades, i el valor vola al seu lloc.
   Els elements són polinomis en a i b (petita àlgebra pròpia, «Poli»).
   Productes de matrius juxtaposats (AB, A⁻¹B), com a equacio-matricial.
   Totes les línies que es veuen són certes: ho comprova proves/comprova.js.
   ═══════════════════════════════════════════════════════════════════ */
(function (arrel) {
'use strict';

const M = arrel.Mates;
const F = arrel.Formules;
const {Fraccio} = M;
const {clau: K, rel: R} = F;
const fr = (a, b = 1) => new Fraccio(a, b);

/* ── Polinomis en a i b (coeficients exactes) ──────────────────────── */

/** Un polinomi és una llista de termes {c, a, b} (c·aᵃ·bᵇ), ordenada i sense zeros. */
function norma(termes) {
  const m = new Map();
  for (const t of termes) {
    const k = t.a + ',' + t.b;
    m.set(k, (m.get(k) || fr(0)).suma(t.c));
  }
  return [...m].map(([k, c]) => { const [a, b] = k.split(',').map(Number); return {c, a, b}; })
    .filter(t => !t.c.esZero())
    .sort((x, y) => (y.a + y.b) - (x.a + x.b) || y.a - x.a);
}
const nombre = x => norma([{c: Fraccio.de(x), a: 0, b: 0}]);
const lletra = (a, b = 0, c = 1) => norma([{c: Fraccio.de(c), a, b}]);
const suma = (p, q) => norma(p.concat(q));
const oposat = p => p.map(t => ({c: t.c.oposada(), a: t.a, b: t.b}));
const resta = (p, q) => suma(p, oposat(q));
const producte = (p, q) => norma(p.flatMap(s => q.map(t => ({c: s.c.producte(t.c), a: s.a + t.a, b: s.b + t.b}))));
const iguals = (p, q) => resta(p, q).length === 0;
const potencia = (x, n) => (n === 0 ? '' : n === 1 ? x : `${x}^{${n}}`);
/** El nom de la primera lletra (a, o k quan surt la fórmula de segon grau, que ja té una «a»). */
let primera = 'a';

/** «a^{2} - b^{2}», «2ab», «-\frac{1}{3}». */
function tex(p) {
  if (!p.length) return '0';
  return p.map((t, i) => {
    const neg = t.c.signe() < 0, abs = t.c.abs();
    const vars = potencia(primera, t.a) + potencia('b', t.b);
    let s = i === 0 ? (neg ? '-' : '') : (neg ? ' - ' : ' + ');
    if (!vars || !abs.igual(fr(1))) s += M.texNombre(abs);
    return s + vars;
  }).join('');
}
/** Un factor d'un producte: entre parèntesis si és negatiu o té més d'un terme. */
const factor = p => (p.length === 0 ? '0' : p.length === 1 && p[0].c.signe() > 0 ? tex(p) : `(${tex(p)})`);
const ambFraccions = P => P.some(f => f.some(x => x.some(t => !t.c.esEnter())));

/* ── Matrius ───────────────────────────────────────────────────────── */

/** Una matriu escrita com a text: «a,0;1,a^2» (cada element: nombres, a, b, productes i potències simples). */
function llegeixMatriu(text) {
  return text.split(';').map(fila => fila.split(',').map(e => {
    let s = e.trim(), signe = 1;
    if (s.startsWith('-')) { signe = -1; s = s.slice(1); }
    const m = /^(\d*)([ak](?:\^(\d))?)?(b(?:\^(\d))?)?$/.exec(s);
    if (!m || (!m[1] && !m[2] && !m[4])) throw new Error(`operacions-matrius: element no vàlid «${e}»`);
    const c = (m[1] ? Number(m[1]) : 1) * signe;
    return lletra(m[2] ? Number(m[3] || 1) : 0, m[4] ? Number(m[5] || 1) : 0, c);
  }));
}
const producteM = (P, Q) => P.map(f => Q[0].map((_, j) => f.reduce((s, x, k) => suma(s, producte(x, Q[k][j])), nombre(0))));
const identitat = n => Array.from({length: n}, (_, i) => Array.from({length: n}, (_, j) => nombre(i === j ? 1 : 0)));

/** La matriu en TeX: f(element, i, j) dona el TeX de cada element (per defecte, el polinomi). */
function texMatriu(P, f = x => tex(x), fraccions = ambFraccions(P)) {
  const files = P.map((fl, i) => fl.map((x, j) => f(x, i, j)).join(' & '));
  return `\\begin{pmatrix} ${files.join(fraccions ? ' \\\\[6pt] ' : ' \\\\ ')} \\end{pmatrix}`;
}
/** Matriu amb claus «prefix + i + j» a cada element; marca(i, j) → '' o una marca. */
const texMatriuClaus = (P, prefix, marca = () => '') => texMatriu(P, (x, i, j) => K(`${prefix}${i}${j}`, tex(x), marca(i, j)));

/* ── Els problemes ─────────────────────────────────────────────────── */

const PROBLEMES = Object.freeze([
  {id: 'producte', nom: 'AB i BA', A: '2,-1,0;1,3,-2', B: '1,0;-1,2;3,1'},
  {id: 'quadrat', nom: 'El quadrat A²', A: '2,-3,-5;-1,4,5;1,-3,-4'},
  {id: 'commuten', nom: 'Matrius que commuten', A: 'k,0;1,k^2', B: '1,0;1,3', lletra: 'k'},
  {id: 'familia', nom: 'Una família amb A² = I', A: 'a,b;-b,a'},
  {id: 'inversa-igual', nom: 'A⁻¹ = A', A: 'a,1;0,-1'},
  {id: 'identitat', nom: 'La inversa a partir d’una igualtat', A: '1,2;2,1'},
].map(p => Object.freeze(p)));
const FIXOS = arrel.Dades.problemesFixos(PROBLEMES);
const {perId} = FIXOS;

/** Files de la pissarra (les que un problema no fa servir no es veuen). */
const FILA = Object.freeze({lletres: 0, mides: 1, prod1: 2, treball1: 3, prod2: 4, treball2: 5, igualtat: 6,
  cond1: 7, cond2: 8, equacio: 9, treballEq: 10, cas1: 11, cas2: 12, calc1: 13, calc2: 14, resposta: 15});
const NFILES = 16;

/* ── El producte de dues matrius, element a element ───────────────── */

/**
 * Afegeix els passos de «nom = (L)(R) = (c_ij) → … → (resultat)» a la fila «fila», amb els càlculs
 * a la fila «treball». Claus: pl… i pr… els elements de L i R; pc… el resultat (pc n el nom,
 * pc q i pc r els «=», pc c<i><j> el nom c_ij, pc v<i><j> el valor; a la fila de treball pc e, f,
 * s, g el nom, «=», la suma i «=»). «individuals»: quants elements es fan un a un (la resta, per
 * files). Torna el resultat.
 */
function passosProducte(g, o) {
  const {L, R: Rm, pl, pr, pc, lletra: c} = o;
  const C = producteM(L, Rm);
  const n = L.length, m = Rm[0].length;
  const fets = new Set();
  const nomC = (i, j) => `${c}_{${i + 1}${j + 1}}`;
  const texC = () => texMatriu(C, (x, i, j) => (fets.has(i * 10 + j) ? K(`${pc}v${i}${j}`, tex(x)) : K(`${pc}c${i}${j}`, nomC(i, j))), ambFraccions(C));
  const escriu = (marcaL, marcaR, ambC) => {
    // Si no hi cap (3×3), el resultat baixa a una segona línia.
    g.files[o.fila] = F.enLinies('', [K(pc + 'n', o.nom) + R(pc + 'q', '=') + texMatriuClaus(L, pl, marcaL) + texMatriuClaus(Rm, pr, marcaR)]
      .concat(ambC ? [R(pc + 'r', '=') + texC()] : []));
  };
  const linia = (i, j) => {
    const s = L[i].map((x, k) => `${factor(x)} \\cdot ${factor(Rm[k][j])}`).join(' + ');
    return K(`${pc}e${i}${j}`, nomC(i, j)) + R(`${pc}f${i}${j}`, '=') + K(`${pc}s${i}${j}`, s) + R(`${pc}g${i}${j}`, '=') + K(`${pc}v${i}${j}`, tex(C[i][j]));
  };
  escriu(() => '', () => '', false);
  g.afegeix(o.textInici);
  escriu(() => '', () => '', true);
  g.afegeix(`El resultat és una matriu $${n} \\times ${m}$. Anomena $${c}_{ij}$ l'element de la fila $i$ i la columna $j$: `
    + `és la fila $i$ de $${o.nomL}$ per la columna $j$ de $${o.nomR}$.`);
  // Els grups: els primers elements, un a un; la resta, per files.
  const grups = [];
  const tots = [];
  for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) tots.push([i, j]);
  tots.slice(0, o.individuals).forEach(e => grups.push([e]));
  for (const [i, j] of tots.slice(o.individuals)) {
    const darrer = grups[grups.length - 1];
    if (grups.length > o.individuals && darrer[0][0] === i) darrer.push([i, j]); else grups.push([[i, j]]);
  }
  grups.forEach((grup, k) => {
    const [i, j] = grup[0];
    const sol = grup.length === 1;
    escriu((a) => (a === i ? 'tria' : ''), (a, b) => (sol && b === j ? 'tria' : ''), true);
    const linies = grup.map(([a, b]) => linia(a, b));
    g.files[o.treball] = linies.length > 1 ? `\\begin{array}{l} ${linies.join(' \\\\[4pt] ')} \\end{array}` : linies[0];
    let text;
    if (!sol) text = `Ara la fila ${i + 1} sencera de $${o.nomRes}$: la fila ${i + 1} de $${o.nomL}$ per cada columna de $${o.nomR}$.`;
    else if (k === 0) text = `$${nomC(i, j)}$: multiplica la fila ${i + 1} de $${o.nomL}$ per la columna ${j + 1} de $${o.nomR}$, element a element, i suma els productes.`;
    else text = `$${nomC(i, j)}$: fila ${i + 1} per columna ${j + 1}.`;
    g.afegeix(text);
    grup.forEach(([a, b]) => fets.add(a * 10 + b));
  });
  g.files[o.treball] = '';
  escriu(() => '', () => '', true);
  g.afegeix(`Per tant, $${o.nomRes} = ${texMatriu(C)}$.`);
  return C;
}

/** «c = 0» al costat de cada element: verd si ja són iguals, groc si donen una condició. */
function texIgualtat(P, Q, prefix) {
  const marca = (i, j) => (iguals(P[i][j], Q[i][j]) ? 'mes' : 'tria');
  return texMatriuClaus(P, prefix + 'e', marca) + R(prefix + 'q', '=') + texMatriuClaus(Q, prefix + 'd', marca);
}

const o = ' \\text{ o } ';
const iff = ' \\iff ';
const marcaSol = t => F.marca(t, 'solucio');

/* ── Els guions de cada problema ───────────────────────────────────── */

function guioProducte(g, A, B) {
  const mida = P => `${P.length} \\times ${P[0].length}`;
  const mides = (X, Y, nx, ny) => `${nx}_{${X.length} \\times ${F.marca(String(X[0].length), 'mes')}}\\,${ny}_{${F.marca(String(Y.length), 'mes')} \\times ${Y[0].length}}`;
  g.files[FILA.mides] = mides(A, B, 'A', 'B');
  g.afegeix(`Abans de multiplicar, mira les mides: $A$ és $${mida(A)}$ i $B$ és $${mida(B)}$. Es poden multiplicar perquè $A$ té tantes columnes com files té $B$ (${A[0].length}).`);
  g.files[FILA.mides] = mides(A, B, 'A', 'B') + ' \\;\\longrightarrow\\; ' + K('Mr', `(AB)_{${A.length} \\times ${B[0].length}}`);
  g.afegeix(`El resultat té les files de $A$ i les columnes de $B$: $AB$ és $${A.length} \\times ${B[0].length}$.`);
  const AB = passosProducte(g, {fila: FILA.prod1, treball: FILA.treball1, nom: 'AB', L: A, R: B, pl: 'Ka', pr: 'Kb', pc: 'Kc', lletra: 'c',
    nomL: 'A', nomR: 'B', nomRes: 'AB', individuals: 4, textInici: 'Escriu el producte $AB$ amb les dues matrius, en aquest ordre.'});
  g.files[FILA.mides] = mides(B, A, 'B', 'A');
  g.afegeix(`Ara $BA$: $B$ és $${mida(B)}$ i $A$ és $${mida(A)}$. També es poden multiplicar: $B$ té tantes columnes com files té $A$ (${B[0].length}).`);
  g.files[FILA.mides] = mides(B, A, 'B', 'A') + ' \\;\\longrightarrow\\; ' + K('Mr', `(BA)_{${B.length} \\times ${A[0].length}}`);
  g.afegeix(`$BA$ és $${B.length} \\times ${A[0].length}$: ja es veu que no serà igual que $AB$.`);
  const BA = passosProducte(g, {fila: FILA.prod2, treball: FILA.treball2, nom: 'BA', L: B, R: A, pl: 'La', pr: 'Lb', pc: 'Lc', lletra: 'd',
    nomL: 'B', nomR: 'A', nomRes: 'BA', individuals: 3, textInici: 'Escriu el producte $BA$: ara $B$ va primer.'});
  g.files[FILA.mides] = '';
  g.files[FILA.resposta] = K('Sa', 'AB') + ' \\neq ' + K('Sb', 'BA');
  g.classes[FILA.resposta] = 'final';
  g.afegeix(`$AB$ és $${mida(AB)}$ i $BA$ és $${mida(BA)}$: $AB \\neq BA$. El producte de matrius no és commutatiu: l'ordre importa.`);
}

function guioQuadrat(g, A) {
  const A2 = passosProducte(g, {fila: FILA.prod1, treball: FILA.treball1, nom: 'A^{2} = AA', L: A, R: A, pl: 'Ka', pr: 'Kb', pc: 'Kc', lletra: 'c',
    nomL: 'A', nomR: 'A', nomRes: 'A^2', individuals: 3,
    textInici: '$A^2$ és el producte $AA$: la matriu per ella mateixa. Es pot fer perquè $A$ és quadrada.'});
  const igual = A2.every((f, i) => f.every((x, j) => iguals(x, A[i][j])));
  g.files[FILA.resposta] = igual ? K('Sa', 'A^{2}') + R('Sq', '=') + K('Sb', 'A') : K('Sa', 'A^{2}') + R('Sq', '=') + K('Sb', texMatriu(A2));
  g.classes[FILA.resposta] = 'final';
  g.afegeix(igual ? 'Fixa\'t que el resultat és la mateixa matriu $A$: $A^2 = A$. Una matriu així s\'anomena idempotent.' : 'Resposta.');
}

function guioCommuten(g, A, B) {
  const AB = passosProducte(g, {fila: FILA.prod1, treball: FILA.treball1, nom: 'AB', L: A, R: B, pl: 'Ka', pr: 'Kb', pc: 'Kc', lletra: 'c',
    nomL: 'A', nomR: 'B', nomRes: 'AB', individuals: 4, textInici: 'Calcula primer $AB$. Els elements de $A$ tenen $k$: multiplica com amb polinomis.'});
  const BA = passosProducte(g, {fila: FILA.prod2, treball: FILA.treball2, nom: 'BA', L: B, R: A, pl: 'La', pr: 'Lb', pc: 'Lc', lletra: 'd',
    nomL: 'B', nomR: 'A', nomRes: 'BA', individuals: 4, textInici: 'Ara $BA$, amb les matrius en l\'ordre contrari.'});
  g.files[FILA.igualtat] = texIgualtat(AB, BA, 'G');
  g.afegeix('Commuten si $AB = BA$: dues matrius són iguals quan ho són element a element. En verd, els elements que ja són iguals per a qualsevol $k$; en groc, els que donen una condició.');
  const dif = [];
  AB.forEach((f, i) => f.forEach((x, j) => { if (!iguals(x, BA[i][j])) dif.push([x, BA[i][j]]); }));
  g.files[FILA.cond1] = dif.map(([x, y]) => `${tex(x)} = ${tex(y)}`).join(', \\quad ');
  g.afegeix(dif.length === 1 ? 'Només hi ha una condició: aquesta equació.' : 'Les condicions.');
  const p = resta(dif[0][0], dif[0][1]);
  const coef = [0, 1, 2].map(n => { const t = p.find(q => q.a === n); return t ? t.c : fr(0); });
  while (coef.length > 1 && coef[coef.length - 1].esZero()) coef.pop();
  const sols = arrel.Matrius.passosArrels(g, {p: coef, X: 'k', files: {equacio: FILA.equacio, treball: FILA.treballEq},
    inici: 'Passa-ho tot al primer membre.', algebra: true});
  const ll = sols.map(s => `k = ${M.texNombre(s)}`);
  g.files[FILA.resposta] = K('Sa', 'AB = BA') + iff + K('Sb', ll.join(o));
  g.classes[FILA.resposta] = 'final';
  g.afegeix(`Resposta: les matrius $A$ i $B$ commuten si i només si $${ll.join(o)}$.`);
}

function guioFamilia(g, A) {
  const A2 = passosProducte(g, {fila: FILA.prod1, treball: FILA.treball1, nom: 'A^{2} = AA', L: A, R: A, pl: 'Ka', pr: 'Kb', pc: 'Kc', lletra: 'c',
    nomL: 'A', nomR: 'A', nomRes: 'A^2', individuals: 4,
    textInici: 'Calcula $A^2 = AA$ amb les lletres $a$ i $b$.'});
  const I = identitat(2);
  g.files[FILA.igualtat] = K('Gn', 'A^{2} = I\\text{:}') + ' \\quad ' + texIgualtat(A2, I, 'G');
  g.afegeix('Imposa $A^2 = I$: els elements han de ser iguals un a un.');
  g.files[FILA.cond1] = K('Ca', 'a^{2} - b^{2} = 1');
  g.files[FILA.cond2] = K('Cb', '2ab = 0');
  g.afegeix('Les dues equacions de la diagonal són la mateixa, $a^2 - b^2 = 1$; i $-2ab = 0$ és la mateixa equació que $2ab = 0$. Queden dues equacions.');
  g.files[FILA.cond2] = K('Cb', '2ab = 0') + iff + K('Cc', 'a = 0' + o + 'b = 0');
  g.afegeix('Un producte és $0$ quan algun dels factors és $0$. Hi ha dos casos.');
  g.files[FILA.cas1] = K('Da', '\\text{si } a = 0\\text{:}') + ' \\quad ' + K('Db', '-b^{2} = 1') + iff + K('Dc', 'b^{2} = -1');
  g.afegeix('Primer cas, $a = 0$: substitueix-ho a la primera equació.');
  g.files[FILA.cas1] = F.tatxa(K('Da', '\\text{si } a = 0\\text{:}') + ' \\quad ' + K('Db', '-b^{2} = 1') + iff + K('Dc', 'b^{2} = -1'));
  g.afegeix('Cap nombre real al quadrat dona $-1$: aquest cas no té solució.');
  g.files[FILA.cas2] = K('Ea', '\\text{si } b = 0\\text{:}') + ' \\quad ' + K('Eb', 'a^{2} = 1') + iff + K('Ec', 'a = -1' + o + 'a = 1');
  g.afegeix('Segon cas, $b = 0$: substitueix-ho a la primera equació.');
  g.files[FILA.cas2] = K('Ea', '\\text{si } b = 0\\text{:}') + ' \\quad ' + K('Eb', 'a^{2} = 1') + iff + K('Ec', marcaSol('a = -1') + o + marcaSol('a = 1'));
  g.afegeix('Les solucions són $a = -1,\\ b = 0$ i $a = 1,\\ b = 0$.');
  const mat = a => texMatriu([[nombre(a), nombre(0)], [nombre(0), nombre(a)]]);
  g.files[FILA.resposta] = K('Sa', `A = ${mat(1)}`) + o + K('Sb', `A = ${mat(-1)}`);
  g.classes[FILA.resposta] = 'final';
  g.afegeix('Resposta: hi ha dues matrius de la família que compleixen $A^2 = I$: la identitat $I$ i $-I$.');
}

function guioInversaIgual(g, A) {
  g.files[FILA.lletres] = F.marcat('L: ⟦i:A^{-1}⟧ = ⟦a:A⟧');
  g.afegeix('Vols que la inversa de $A$ sigui la mateixa $A$.');
  g.files[FILA.lletres] = F.marcat('L: ⟦m:A⟧⟦i:A^{-1}⟧ = ⟦n:A⟧⟦a:A⟧');
  g.afegeix('Multiplica els dos costats per $A$, per l\'esquerra.');
  g.files[FILA.lletres] = F.marcat('L: ⟦I:I⟧ = ⟦s:A^{2}⟧');
  g.afegeix('$AA^{-1} = I$ i $AA = A^2$. Per tant, $A^{-1} = A$ vol dir $A^2 = I$.', {fusiona: {LI: ['Lm', 'Li'], Ls: ['Ln', 'La']}});
  const A2 = passosProducte(g, {fila: FILA.prod1, treball: FILA.treball1, nom: 'A^{2} = AA', L: A, R: A, pl: 'Ka', pr: 'Kb', pc: 'Kc', lletra: 'c',
    nomL: 'A', nomR: 'A', nomRes: 'A^2', individuals: 4, textInici: 'Calcula $A^2$.'});
  const I = identitat(2);
  g.files[FILA.igualtat] = K('Gn', 'A^{2} = I\\text{:}') + ' \\quad ' + texIgualtat(A2, I, 'G');
  g.afegeix('Imposa $A^2 = I$, element a element. En verd, els que ja són iguals; en groc, els que donen una condició.');
  g.files[FILA.cond1] = K('Ca', 'a^{2} = 1') + iff + K('Cb', 'a = -1' + o + 'a = 1');
  g.files[FILA.cond2] = K('Cc', 'a - 1 = 0') + iff + K('Cd', 'a = 1');
  g.afegeix('Resol les dues equacions.');
  g.files[FILA.cond1] = K('Ca', 'a^{2} = 1') + iff + K('Cb', F.tatxa('a = -1') + o + marcaSol('a = 1'));
  g.files[FILA.cond2] = K('Cc', 'a - 1 = 0') + iff + K('Cd', marcaSol('a = 1'));
  g.afegeix('El valor de $a$ ha de complir totes dues: $a = -1$ no compleix la segona. Només serveix $a = 1$.');
  g.files[FILA.resposta] = K('Sa', 'A^{-1} = A') + iff + K('Sb', 'a = 1');
  g.classes[FILA.resposta] = 'final';
  g.afegeix('Resposta: $A^{-1} = A$ si i només si $a = 1$.');
}

function guioIdentitat(g, A) {
  const L = t => F.marcat('L: ' + t);
  g.files[FILA.lletres] = L('⟦p:(A - I)^{2}⟧ = ⟦d:4I⟧');
  g.afegeix('Parteix de la igualtat de l\'enunciat. Treballa amb lletres, com en una equació amb nombres, però amb una diferència: no pots canviar l\'ordre dels productes.');
  g.files[FILA.lletres] = L('⟦p:(A - I)(A - I)⟧ = ⟦d:4I⟧');
  g.afegeix('El quadrat és el producte de la matriu per ella mateixa.');
  g.files[FILA.lletres] = L('⟦p:A^{2} - A - A + I⟧ = ⟦d:4I⟧');
  g.afegeix('Multiplica terme a terme, mantenint l\'ordre: $AA = A^2$, $AI = A$, $IA = A$ i $II = I$.');
  g.files[FILA.lletres] = L('⟦p:A^{2} - 2A + I⟧ = ⟦d:4I⟧');
  g.afegeix('Agrupa: $-A - A = -2A$.');
  g.files[FILA.lletres] = L('⟦p:A^{2} - 2A⟧ = ⟦d:3I⟧');
  g.afegeix('Passa $I$ a l\'altre costat: $4I - I = 3I$.');
  g.files[FILA.lletres] = L('⟦p:A(A - 2I)⟧ = ⟦d:3I⟧');
  g.afegeix('Treu $A$ factor comú per l\'esquerra. Com que $2A = A(2I)$, a dins queda $A - 2I$.');
  g.files[FILA.lletres] = L('⟦p:A\\left(\\frac{1}{3}(A - 2I)\\right)⟧ = ⟦d:I⟧');
  g.afegeix('Divideix els dos costats entre $3$: a la dreta queda la identitat.');
  g.files[FILA.lletres] = L('⟦i:A^{-1}⟧ = ⟦m:\\frac{1}{3}(A - 2I)⟧');
  g.afegeix('Si $A$ per una matriu dona $I$, aquella matriu és la inversa de $A$: $A^{-1} = \\frac{1}{3}(A - 2I)$.');
  const I2 = identitat(2);
  const dosI = I2.map(f => f.map(x => producte(x, nombre(2))));
  const D = A.map((f, i) => f.map((x, j) => resta(x, dosI[i][j])));
  g.files[FILA.calc1] = K('Pn', 'A - 2I') + R('Pq', '=') + K('Pe', texMatriu(A) + ' - ' + texMatriu(dosI)) + R('Pr', '=') + K('Pv', texMatriu(D));
  g.afegeix('Ara calcula-la. Primer, $A - 2I$: resta element a element.');
  const inv = D.map(f => f.map(x => producte(x, nombre(fr(1, 3)))));
  g.files[FILA.calc2] = K('Qn', 'A^{-1}') + R('Qq', '=') + K('Qf', '\\frac{1}{3}(A - 2I)') + R('Qr', '=') + K('Qe', '\\frac{1}{3}' + texMatriu(D));
  g.afegeix('Substitueix $A - 2I$ a la fórmula.');
  g.files[FILA.calc2] = K('Qn', 'A^{-1}') + R('Qq', '=') + K('Qf', '\\frac{1}{3}(A - 2I)') + R('Qr', '=') + K('Qe', '\\frac{1}{3}' + texMatriu(D)) + R('Qs', '=') + K('Qv', texMatriu(inv));
  g.afegeix('Multiplica cada element per $\\frac{1}{3}$.');
  g.files[FILA.resposta] = K('Sa', 'A^{-1}') + R('Sq', '=') + K('Sb', texMatriu(inv));
  g.classes[FILA.resposta] = 'final';
  g.afegeix(`Resposta: $A^{-1} = \\frac{1}{3}(A - 2I) = ${texMatriu(inv)}$.`, {cursor: {arrossega: 'Qv', fins: 'Sb'}});
}

function passos(valors) {
  const p = perId(valors.p);
  primera = p.lletra || 'a';
  const g = F.guio(NFILES);
  const A = llegeixMatriu(p.A), B = p.B ? llegeixMatriu(p.B) : null;
  ({producte: () => guioProducte(g, A, B), quadrat: () => guioQuadrat(g, A), commuten: () => guioCommuten(g, A, B),
    familia: () => guioFamilia(g, A), 'inversa-igual': () => guioInversaIgual(g, A), identitat: () => guioIdentitat(g, A)})[p.id]();
  return g.passos;
}

function enunciat(v) {
  const p = perId(v.p);
  primera = p.lletra || 'a';
  const A = `$A = ${texMatriu(llegeixMatriu(p.A))}$`, B = p.B ? `$B = ${texMatriu(llegeixMatriu(p.B))}$` : '';
  switch (p.id) {
    case 'producte': return `Considera les matrius ${A} i ${B}. Calcula $AB$ i $BA$.`;
    case 'quadrat': return `Calcula $A^2$, on ${A}.`;
    case 'commuten': return `Considera les matrius ${A}, on $k$ és un paràmetre real, i ${B}. Troba els valors de $k$ per als quals $A$ i $B$ commuten, és a dir, $AB = BA$.`;
    case 'familia': return `Considera les matrius de la forma ${A}, amb $a$ i $b$ nombres reals. Troba totes les matrius d'aquesta forma que compleixen $A^2 = I$, on $I$ és la matriu identitat d'ordre 2.`;
    case 'inversa-igual': return `Considera la matriu ${A}, on $a$ és un paràmetre real. Troba els valors de $a$ per als quals $A^{-1} = A$.`;
    default: return `Considera la matriu ${A} i la matriu identitat $I$ d'ordre 2. Sabent que $(A - I)^2 = 4I$, troba $A^{-1}$ en funció de $A$ i de $I$, i calcula-la.`;
  }
}

arrel.OperacionsMatrius = Object.freeze({
  titol: 'Operacions amb matrius',
  categoria: 'algebra',
  files: NFILES,
  perDefecte: FIXOS.perDefecte,
  exemples: FIXOS.exemples,
  titolEditor: 'Tria un problema',
  titolExemples: 'Problemes:',
  notaEditor: 'El producte de matrius es fa files per columnes, i l\'ordre importa: en general, AB ≠ BA.',
  editor: [],
  problemes: PROBLEMES,
  FILA, llegeixMatriu, producteM, tex,
  valida: FIXOS.valida, llegeixAdreca: FIXOS.llegeixAdreca, escriuAdreca: FIXOS.escriuAdreca,
  enunciat,
  resum: FIXOS.resum, nomExemple: FIXOS.nomExemple,
  passos,
});

})(globalThis);
