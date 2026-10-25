/* ═══════════════════════════════════════════════════════════════════
   matrius.js — Matrius amb un paràmetre (Àlgebra)
   ───────────────────────────────────────────────────────────────────
   Mòdul pur: no toca la pàgina (DOM). Depèn de mates.js i formules.js.
   El fan servir els procediments d'Àlgebra. Exporta «Matrius»:

     llegeixMatriu(text, f, c)  «m,1,1;1,m,1;1,1,m» → {A, X}
     textMatriu, texMatriu, texMatriuPetita   escriptura
     passosSarrus(g, …)   els passos de la regla de Sarrus (3×3)
     passosArrels(g, …)   els passos de «polinomi = 0», de grau ≤ 3:
                          factor comú, o una arrel entera i Ruffini, i
                          l'equació de segon grau (Formules.resolPolinomi)
     problemaArrels(p)    null si passosArrels el sap resoldre
     texSistema, texAmpliada   un sistema de 3 equacions i la seva A*
     passosSCI(g, …)      un sistema compatible indeterminat (rang 2):
                          l'equació que sobra, el paràmetre λ, Cramer i
                          el conjunt de solucions

   Un element d'una matriu és un polinomi en el paràmetre X (una lletra:
   a, k, m, p o t): els seus coeficients exactes [c0, c1] (Fraccio),
   com els polinomis de Mates. Sense paràmetre, X és null.

   Claus (P és un prefix, per si una pàgina en té més d'un):
     P a<i><j>  l'element de la fila i i la columna j (des d'1)
     P Mn, P Mq  el nom de la matriu (A, |A|) i el seu «=»
     P S<n>     el producte n de Sarrus (0-2 amb +, 3-5 amb −)
     P V<n><g>  el terme de grau g del producte n, ja calculat
     P V<n>n    el «−» de davant d'un parèntesi; P V<n>z un producte 0
     P C<g>     el terme de grau g del determinant
     E…, Q…     les equacions (Formules.equacio); P… les proves d'arrels;
                R… la taula de Ruffini (Ra dalt, Rx l'arrel, Rm al mig, Rb baix)
   ═══════════════════════════════════════════════════════════════════ */
(function (arrel) {
'use strict';

const M = arrel.Mates;
const F = arrel.Formules;
const {Fraccio} = M;
const {clau: K, rel: R} = F;
const ZERO = new Fraccio(0), U = new Fraccio(1);

/** Les lletres que poden ser el paràmetre, i el valor màxim (absolut) dels nombres. */
const PARAMETRES = Object.freeze(['a', 'k', 'm', 'p', 't']);
const MAX_ELEMENT = 9;


/* ── 1. POLINOMIS EN EL PARÀMETRE ──────────────────────────────────── */

const sumaP = M.sumaPolinomis;
const producteP = M.producteDePolinomis;
const oposatP = p => p.map(c => c.oposada());
const valorP = (p, x) => p.reduce((s, c, i) => s.suma(c.producte(Fraccio.de(x).potencia(i))), ZERO);
const texP = (p, X) => M.texPolinomi(M.termes(p), X || 'x');
/** En text pla, per a l'adreça: «2m-1», «-m», «0». */
const textP = (p, X) => M.textPolinomi(M.termes(p)).replace(/x/g, X || 'x');
/** Un element d'una matriu: com texP, però amb λ el terme independent va primer («2 - \\lambda», com A − λI). */
const texEntrada = (p, X) => (X === '\\lambda' && p.length === 2 ? texLineal(p) : texP(p, X));
/** Un element com a factor d'un producte: entre parèntesis si és negatiu o té més d'un terme. */
function texFactor(p, X) {
  const t = texEntrada(p, X);
  return M.termes(p).length > 1 || t.startsWith('-') ? `(${t})` : t;
}


/* ── 2. LECTURA I ESCRIPTURA DE MATRIUS ────────────────────────────── */

/**
 * «m,1,1;1,m,1;1,1,m» → {A: files de polinomis, X: el paràmetre o null}. Cada element
 * és un enter o «enter · X + enter», amb nombres de −9 a 9. Llança Mates.ErrorLectura.
 */
function llegeixMatriu(text, files, columnes) {
  const net = String(text).replace(/\s+/g, '');
  const lletres = [...new Set(net.match(/[A-Za-z]/g) || [])];
  if (lletres.length > 1) throw new M.ErrorLectura(`Hi ha més d'una lletra (${lletres.join(', ')}), i només hi pot haver un paràmetre.`);
  const X = lletres[0] || null;
  if (X && !PARAMETRES.includes(X)) throw new M.ErrorLectura(`El paràmetre «${X}» no es pot fer servir: ha de ser una d'aquestes lletres: ${PARAMETRES.join(', ')}.`);
  const trossos = net.split(';');
  if (trossos.length !== files) throw new M.ErrorLectura(`La matriu ha de tenir ${files} files, separades per «;».`);
  const A = trossos.map((fila, i) => {
    const elements = fila.split(',');
    if (elements.length !== columnes) throw new M.ErrorLectura(`La fila ${i + 1} ha de tenir ${columnes} elements, separats per «,».`);
    return elements.map(e => {
      if (!e) throw new M.ErrorLectura(`A la fila ${i + 1} hi ha un element buit.`);
      const p = M.polinomi(M.llegeix(e, {variables: X ? [X] : []}), X || 'x');
      if (!p || p.length > 2 || p.some(c => !c.esEnter())) {
        throw new M.ErrorLectura(`L'element «${e}» ha de ser un nombre enter${X ? ` o de la forma «2${X}-1» (un enter per ${X}, més un enter)` : ''}.`);
      }
      if (p.some(c => Math.abs(c.num) > MAX_ELEMENT)) throw new M.ErrorLectura(`Els nombres de la matriu han d'anar de −${MAX_ELEMENT} a ${MAX_ELEMENT}.`);
      return p;
    });
  });
  return {A, X};
}

const textMatriu = (A, X) => A.map(f => f.map(p => textP(p, X)).join(',')).join(';');

const clauElement = (P, i, j) => `${P}a${i + 1}${j + 1}`;

/** Matriu en TeX, amb una clau per element i potser una marca: (…) o |…|. */
function texMatriu(A, X, {P = '', marca = () => '', tipus = 'pmatrix'} = {}) {
  const files = A.map((f, i) => f.map((p, j) => K(clauElement(P, i, j), texEntrada(p, X), marca(i, j))).join(' & '));
  return `\\begin{${tipus}} ${files.join(' \\\\ ')} \\end{${tipus}}`;
}
/** Matriu petita, sense claus (per als botons dels exemples). */
const texMatriuPetita = (A, X) => `\\left(\\begin{smallmatrix} ${A.map(f => f.map(p => texP(p, X)).join(' & ')).join(' \\\\ ')} \\end{smallmatrix}\\right)`;


/* ── 3. REGLA DE SARRUS ────────────────────────────────────────────── */

/** Els sis productes: tres amb signe + (la diagonal principal i les seves paral·leles) i tres amb − (la secundària). */
const SARRUS = Object.freeze([
  {signe: 1, pos: [[0, 0], [1, 1], [2, 2]], text: 'Primer producte, amb signe $+$: la diagonal principal,'},
  {signe: 1, pos: [[0, 1], [1, 2], [2, 0]], text: 'També amb signe $+$, els dos «triangles» paral·lels a la diagonal principal. El primer:'},
  {signe: 1, pos: [[0, 2], [1, 0], [2, 1]], text: 'I el segon triangle:'},
  {signe: -1, pos: [[0, 2], [1, 1], [2, 0]], text: 'Ara, els tres productes amb signe $-$. La diagonal secundària:'},
  {signe: -1, pos: [[0, 0], [1, 2], [2, 1]], text: 'I els dos triangles paral·lels a la diagonal secundària. El primer:'},
  {signe: -1, pos: [[0, 1], [1, 0], [2, 2]], text: 'I el segon:'},
]);

/** Determinant 3×3 (Sarrus, sense passos): un polinomi en X. */
const determinant = A => SARRUS.reduce((d, s) => {
  const v = s.pos.reduce((p, [i, j]) => producteP(p, A[i][j]), [U]);
  return sumaP(d, s.signe > 0 ? v : oposatP(v));
}, []);

/** Un terme c·X^g amb el seu signe davant (« + 2m», « - 3»), o sense « + » si és el primer. */
function texTerme(c, g, X, primer) {
  const t = M.texPolinomi([{n: g, c}], X || 'x');
  if (primer) return t;
  return t.startsWith('-') ? ` - ${t.slice(1)}` : ` + ${t}`;
}

/**
 * Els passos de Sarrus d'una matriu 3×3 A, sobre tres files: «matriu» (passa de «A = (…)»
 * a «|A| = |…|», i marca els elements de cada producte: verd +, vermell −), «sarrus» (els sis
 * productes) i «calcul» (cada producte fet, sense parèntesis, i els termes agrupats).
 * Torna {det, valors}: el determinant i el valor de cada producte (polinomis en X).
 */
function passosSarrus(g, {A, X, nom = '|A|', P = '', files, rapid = false}) {
  const filaMatriu = (marques = {}) => K(P + 'Mn', nom) + R(P + 'Mq', '=')
    + texMatriu(A, X, {P, marca: (i, j) => marques[`${i}${j}`] || '', tipus: 'vmatrix'});
  g.files[files.matriu] = filaMatriu();
  g.afegeix(`La regla de Sarrus: $${nom}$ és la suma de tres productes de tres elements, menys uns altres tres productes. `
    + 'A cada producte hi ha un element de cada fila i un de cada columna.');

  /* Els sis productes, marcats a la matriu (o, «rapid», tots alhora i sense marques). */
  const peces = [];
  if (rapid) {
    SARRUS.forEach((s, n) => peces.push((n === 0 ? '' : s.signe > 0 ? ' + ' : ' - ') + K(`${P}S${n}`, s.pos.map(([i, j]) => texFactor(A[i][j], X)).join(' \\cdot '))));
    g.files[files.sarrus] = F.enLinies(K(P + 'Sl', nom) + R(P + 'Sq', '='), peces);
    g.afegeix('Els sis productes: amb $+$, la diagonal principal i els dos triangles paral·lels; amb $-$, la diagonal secundària i els seus dos triangles.');
  }
  if (!rapid) SARRUS.forEach((s, n) => {
    const factors = s.pos.map(([i, j]) => texFactor(A[i][j], X)).join(' \\cdot ');
    peces.push((n === 0 ? '' : s.signe > 0 ? ' + ' : ' - ') + K(`${P}S${n}`, factors));
    g.files[files.matriu] = filaMatriu(Object.fromEntries(s.pos.map(([i, j]) => [`${i}${j}`, s.signe > 0 ? 'mes' : 'menys'])));
    g.files[files.sarrus] = F.enLinies(K(P + 'Sl', nom) + R(P + 'Sq', '='), peces);
    g.afegeix(`${s.text} $${factors}$.`);
  });
  g.files[files.matriu] = filaMatriu();

  /* Cada producte fet, amb el seu signe. */
  const valors = SARRUS.map(s => s.pos.reduce((p, [i, j]) => producteP(p, A[i][j]), [U]));
  const inici = K(P + 'Cl', nom) + R(P + 'Cq', '=');
  const fila = trossos => F.enLinies(inici, trossos);
  let primer = true;
  let ambParentesi = false;
  const trossos = valors.map((v, n) => {
    const signe = SARRUS[n].signe;
    const termes = M.termes(v);
    const esPrimer = primer;
    primer = false;
    if (!termes.length) return (esPrimer ? '' : signe > 0 ? ' + ' : ' - ') + K(`${P}V${n}z`, '0');
    if (signe > 0) return termes.map((t, i) => K(`${P}V${n}${t.n}`, texTerme(t.c, t.n, X, esPrimer && i === 0))).join('');
    if (termes.length === 1 && termes[0].c.signe() > 0) return K(`${P}V${n}${termes[0].n}`, texTerme(termes[0].c.oposada(), termes[0].n, X, esPrimer));
    ambParentesi = true;
    return (esPrimer ? '' : ' ') + K(`${P}V${n}n`, '-') + '(' + termes.map((t, i) => K(`${P}V${n}${t.n}`, texTerme(t.c, t.n, X, i === 0))).join('') + ')';
  });
  g.files[files.calcul] = fila(trossos);
  g.afegeix('Fes cada producte, amb el seu signe.' + (ambParentesi ? ' Un producte de més d\'un terme (o negatiu) que va amb $-$ queda entre parèntesis.' : ''));

  /* Sense parèntesis: el «−» canvia el signe de cada terme de dins. */
  const signats = valors.map((v, n) => (SARRUS[n].signe > 0 ? v : oposatP(v)));
  if (ambParentesi) {
    primer = true;
    const sense = signats.map((v, n) => {
      const termes = M.termes(v);
      const esPrimer = primer;
      primer = false;
      if (!termes.length) return (esPrimer ? '' : SARRUS[n].signe > 0 ? ' + ' : ' - ') + K(`${P}V${n}z`, '0');
      return termes.map((t, i) => K(`${P}V${n}${t.n}`, texTerme(t.c, t.n, X, esPrimer && i === 0))).join('');
    });
    g.files[files.calcul] = fila(sense);
    g.afegeix('Treu els parèntesis: el signe $-$ de davant canvia el signe de cada terme de dins.');
  }

  /* Els termes del mateix grau, agrupats. */
  const det = signats.reduce((d, v) => sumaP(d, v), []);
  const graus = [...new Set(signats.flatMap(v => M.termes(v).map(t => t.n)))].sort((a, b) => b - a);
  const fusiona = {};
  const grups = [];
  for (const gr of graus) {
    const claus = signats.map((v, n) => (M.termes(v).some(t => t.n === gr) ? `${P}V${n}${gr}` : null)).filter(Boolean);
    const c = det[gr] || ZERO;
    if (!c.esZero()) fusiona[`${P}C${gr}`] = claus;
    if (claus.length > 1) {
      const suma = signats.map(v => M.termes(v).find(t => t.n === gr)).filter(Boolean)
        .map((t, i) => texTerme(t.c, t.n, X, i === 0)).join('');
      grups.push(`$${suma} = ${c.esZero() ? '0' : M.texPolinomi([{n: gr, c}], X || 'x')}$`);
    }
  }
  const termesDet = M.termes(det);
  g.files[files.calcul] = fila(termesDet.length ? termesDet.map((t, i) => K(`${P}C${t.n}`, texTerme(t.c, t.n, X, i === 0))) : [K(`${P}C0`, '0')]);
  g.afegeix(`Agrupa els termes del mateix grau${grups.length ? ': ' + grups.join('; ') : ''}. Els zeros desapareixen.`, {fusiona});
  return {det, valors};
}


/* ── 4. ARRELS D'UN POLINOMI DE GRAU ≤ 3 ───────────────────────────── */

/** Divisors positius d'un enter (no nul), en ordre. */
const divisors = n => Array.from({length: Math.abs(n)}, (_, i) => i + 1).filter(d => n % d === 0);

/** Coeficients enters d'un polinomi dividits pel seu factor comú, amb el primer positiu: {p, k}. */
function normalitza(p) {
  const nums = p.filter(c => !c.esZero()).map(c => c.num);
  const k = nums.reduce((a, b) => M.mcd(a, b)) * Math.sign(p[p.length - 1].num);
  return {p: p.map(c => c.quocient(k)), k};
}

/** Les arrels enteres candidates (divisors del terme independent), en l'ordre de provar-les: 1, −1, 2, −2… */
const candidates = c0 => divisors(c0.num).flatMap(d => [d, -d]);

/**
 * null si passosArrels sap resoldre «p = 0» amb solucions racionals (o sense solucions);
 * si no, el motiu: 'constant', 'grau', 'irracionals' o 'sense arrel entera'.
 */
function problemaArrels(p) {
  if (p.length < 2) return 'constant';
  if (p.length > 4) return 'grau';
  if (p.length <= 3) return M.arrelsRacionals(M.termes(p)).irracionals ? 'irracionals' : null;
  const q = normalitza(p).p;
  let resta;
  if (q[0].esZero()) {
    const j = q.findIndex(c => !c.esZero());
    resta = q.slice(j);
  } else {
    const r = candidates(q[0]).find(c => valorP(q, c).esZero());
    if (r === undefined) return 'sense arrel entera';
    resta = ruffini(q, r).quocient;
  }
  return resta.length > 1 && M.arrelsRacionals(M.termes(resta)).irracionals ? 'irracionals' : null;
}

/** Regla de Ruffini: p (coeficients [c0 … c3]) entre (X − r). {mig, baix, quocient}, de més a menys grau. */
function ruffini(p, r) {
  const dalt = p.slice().reverse();
  const baix = [dalt[0]], mig = [null];
  for (let i = 1; i < dalt.length; i++) {
    mig.push(baix[i - 1].producte(r));
    baix.push(dalt[i].suma(mig[i]));
  }
  return {dalt, mig, baix, quocient: baix.slice(0, -1).reverse()};
}

/** «1^{3} - 3 \cdot 1 + 2»: el polinomi amb X = c, sense operar. */
function texSubstituit(p, c) {
  const x = c < 0 ? `(${c})` : String(c);
  return M.termes(p).map((t, i) => {
    const a = t.c.abs();
    const signe = i === 0 ? (t.c.signe() < 0 ? '-' : '') : (t.c.signe() < 0 ? ' - ' : ' + ');
    if (t.n === 0) return signe + M.texNombre(a);
    const potencia = t.n === 1 ? x : `${x}^{${t.n}}`;
    return signe + (a.igual(U) ? potencia : `${M.texNombre(a)} \\cdot ${potencia}`);
  }).join('');
}

/** «X = 1 o X = −2»; sense solucions: null. */
const texSolucions = (arrels, X) => (arrels.length ? arrels.map(r => `${X} = ${M.texNombre(r)}`).join(' \\text{ o } ') : null);

/** Arrels diferents, en ordre. */
const ordena = arrels => arrels.filter((r, i) => arrels.findIndex(s => s.igual(r)) === i).sort((a, b) => a.resta(b).signe());

/**
 * Els passos de «p = 0» (p de grau 1 a 3, coeficients enters; vegeu problemaArrels) a les
 * files: «equacio» (l'equació, i la factoritzada), «prova» (les arrels candidates),
 * «ruffini» (la taula) i «segon» (l'equació de segon grau que queda). «inici» és el text
 * del primer pas. Torna les solucions, diferents i en ordre (Fraccio).
 */
function passosArrels(g, {p, X, files, inici}) {
  const termes = M.termes(p);
  if (p.length <= 3) return ordena(F.resolPolinomi(g, files.equacio, 'E', termes, inici, {}, X).map(s => s.valor));

  /* Grau 3: l'equació, i dividida pel factor comú (o canviada de signe). */
  g.files[files.equacio] = F.equacio('E', termes, X);
  g.afegeix(inici);
  const {p: q, k} = normalitza(p);
  if (k !== 1) {
    g.files[files.equacio] = F.equacio('E', M.termes(q), X);
    g.afegeix(k === -1 ? 'Canvia el signe dels dos membres (multiplica per $-1$): el primer coeficient queda positiu.'
      : `Divideix els dos membres per $${k}$.`);
  }
  const texQ = texP(q, X);
  let resta, arrels;
  if (q[0].esZero()) {
    /* Sense terme independent: factor comú X (o X²). */
    const j = q.findIndex(c => !c.esZero());
    resta = q.slice(j);
    const factor = j === 1 ? X : `${X}^{${j}}`;
    g.files[files.equacio] = K('Ef', factor) + `(${K('Er', texP(resta, X))})` + R('Eq', '=') + K('Ez', '0');
    g.afegeix(`No hi ha terme independent: treu factor comú $${factor}$.`);
    arrels = [ZERO];
    g.completa(` Un producte val $0$ si algun factor val $0$: $${factor} = 0$${j > 1 ? `, és a dir, $${X} = 0$` : ''}, o bé $${texP(resta, X)} = 0$.`);
  } else {
    /* Una arrel entera, entre els divisors del terme independent. */
    const c0 = q[0].abs().num;
    const llista = candidates(q[0]);
    const linies = [];
    let r;
    for (const c of llista) {
      const v = valorP(q, c);
      linies.push(K(`Pv${linies.length}`, `${X} = ${c}`) + ':\\quad ' + K(`Pe${linies.length}`, `${texSubstituit(q, c)} = ${M.texNombre(v)}`
        + (v.esZero() ? '' : ' \\neq 0')));
      g.files[files.prova] = linies.length > 1 ? `\\begin{array}{l} ${linies.join(' \\\\[4pt] ')} \\end{array}` : linies[0];
      const quina = linies.length === 1
        ? `Busca una arrel entera: ha de ser un divisor del terme independent, $${c0}$ (${divisors(c0).map(d => `$\\pm ${d}$`).join(', ')}). Prova $${X} = ${c}$: `
        : `Prova $${X} = ${c}$: `;
      g.afegeix(quina + (v.esZero() ? `dona $0$, és una arrel.` : `dona $${M.texNombre(v)}$, no és una arrel.`));
      if (v.esZero()) { r = c; break; }
    }
    /* La regla de Ruffini: q entre (X − r). */
    const {dalt, mig, baix, quocient} = ruffini(q, r);
    const n = dalt.length;
    const cel = (k, v) => (v === null || v === undefined ? '' : K(k, M.texNombre(v)));
    const taula = fins => `\\begin{array}{r|${'r'.repeat(n - 1)}|r} & ${dalt.map((v, i) => cel(`Ra${i}`, v)).join(' & ')} \\\\ `
      + `${K('Rx', String(r))} & ${mig.map((v, i) => (i <= fins && i > 0 ? cel(`Rm${i}`, v) : '')).join(' & ')} \\\\ \\hline `
      + `& ${baix.map((v, i) => (i <= fins ? cel(`Rb${i}`, v) : '')).join(' & ')} \\end{array}`;
    g.files[files.ruffini] = taula(-1);
    g.afegeix(`Divideix per $${texP([new Fraccio(-r), U], X)}$ amb la regla de Ruffini: a dalt, els coeficients (també els zeros); a l'esquerra, l'arrel $${r}$.`);
    g.files[files.ruffini] = taula(0);
    g.afegeix('Baixa el primer coeficient.');
    for (let i = 1; i < n; i++) {
      g.files[files.ruffini] = taula(i);
      g.afegeix(`Multiplica per $${r}$ i suma: $${M.texNombre(baix[i - 1])} \\cdot ${r < 0 ? `(${r})` : r} = ${M.texNombre(mig[i])}$, `
        + `$${M.texNombre(dalt[i])} + ${M.texEntreParentesis(mig[i])} = ${M.texNombre(baix[i])}$.`
        + (i === n - 1 ? ' El residu és $0$, perquè $' + `${X} = ${r}` + '$ és una arrel.' : ''));
    }
    resta = quocient;
    const factor = texP([new Fraccio(-r), U], X);
    g.files[files.equacio] = `(${K('Ef', factor)})(${K('Er', texP(resta, X))})` + R('Eq', '=') + K('Ez', '0');
    g.afegeix(`Els nombres de baix (menys el residu) són els coeficients del quocient: $${texQ} = (${factor})(${texP(resta, X)})$.`);
    arrels = [new Fraccio(r)];
    g.completa(` Un producte val $0$ si algun factor val $0$: $${factor} = 0$, és a dir, $${X} = ${r}$, o bé $${texP(resta, X)} = 0$.`);
  }
  /* L'equació que queda (grau 1 o 2). */
  if (resta.length > 1) {
    const sol = F.resolPolinomi(g, files.segon, 'Q', M.termes(resta), `Resol $${texP(resta, X)} = 0$.`, {}, X);
    arrels = arrels.concat(sol.map(s => s.valor));
  }
  return ordena(arrels);
}


/* ── 5. MENORS DE NOMBRES ──────────────────────────────────────────── */

/** Els nombres (Fraccio) d'una matriu sense paràmetre. */
const nombres = A => A.map(f => f.map(p => p[0] || ZERO));
/** El menor de les files fs i les columnes cs (llistes ordenades). */
const submatriu = (N, fs, cs) => fs.map(i => cs.map(j => N[i][j]));
const texVmatriuN = B => `\\begin{vmatrix} ${B.map(f => f.map(c => M.texNombre(c)).join(' & ')).join(' \\\\ ')} \\end{vmatrix}`;
const det2N = B => B[0][0].producte(B[1][1]).resta(B[0][1].producte(B[1][0]));
/** «a \cdot d - b \cdot c», amb parèntesis als negatius. */
const texDet2N = B => `${M.texEntreParentesis(B[0][0])} \\cdot ${M.texEntreParentesis(B[1][1])} - ${M.texEntreParentesis(B[0][1])} \\cdot ${M.texEntreParentesis(B[1][0])}`;
const productesSarrusN = B => SARRUS.map(s => s.pos.reduce((p, [i, j]) => p.producte(B[i][j]), U));
const det3N = B => productesSarrusN(B).reduce((d, p, n) => (SARRUS[n].signe > 0 ? d.suma(p) : d.resta(p)), ZERO);
/** «6 + 0 + 4 - 3 - 0 - (-2)»: els sis productes de Sarrus, ja fets. */
const texSarrusN = B => productesSarrusN(B).map((p, n) => (n === 0 ? M.texNombre(p) : `${SARRUS[n].signe > 0 ? ' + ' : ' - '}${M.texEntreParentesis(p)}`)).join('');
/** Rang per Gauss (per a «valida»: les pàgines el fan amb menors). */
function rangN(N) {
  const B = N.map(f => f.slice());
  let r = 0;
  for (let c = 0; c < B[0].length && r < B.length; c++) {
    const f = B.findIndex((x, i) => i >= r && !x[c].esZero());
    if (f < 0) continue;
    [B[r], B[f]] = [B[f], B[r]];
    for (let i = r + 1; i < B.length; i++) { const k = B[i][c].quocient(B[r][c]); B[i] = B[i].map((x, j) => x.resta(B[r][j].producte(k))); }
    r++;
  }
  return r;
}


/* ── 6. SISTEMES DE 3 EQUACIONS: EL CAS COMPATIBLE INDETERMINAT ───── */

const INCOGNITES = Object.freeze(['x', 'y', 'z']);
const LAMBDA = '\\lambda';

/** Un terme «c·v» amb el signe davant (« - 2x», « + \lambda»), o sense « + » si és el primer. */
function termeVar(c, v, primer) {
  const a = c.abs();
  const t = (a.igual(U) ? '' : M.texNombre(a)) + v;
  if (primer) return (c.signe() < 0 ? '-' : '') + t;
  return c.signe() < 0 ? ` - ${t}` : ` + ${t}`;
}
/** Expressió lineal en λ amb el terme independent primer: «2 - \lambda», «-3 + 3\lambda», «\lambda», «0». */
function texLineal(p, L = LAMBDA) {
  const c0 = p[0] || ZERO, c1 = p[1] || ZERO;
  if (c1.esZero()) return M.texNombre(c0);
  if (c0.esZero()) return termeVar(c1, L, true);
  return M.texNombre(c0) + termeVar(c1, L, false);
}
/** Una expressió lineal com a factor: entre parèntesis si té dos termes o és negativa. */
const texFactorLineal = p => { const t = texLineal(p); return /^-|[^{]\s[+-]\s/.test(t) ? `(${t})` : t; };
/** N/D (N lineal en λ, D un nombre), simplificat: «1 + \lambda» o «\dfrac{3 - 3\lambda}{2}». */
function texQuocientLineal(N, D) {
  let n = N.slice(), d = D;
  if (d.signe() < 0) { n = oposatP(n); d = d.oposada(); }
  if (n.every(c => c.quocient(d).esEnter())) return texLineal(n.map(c => c.quocient(d)));
  const k = n.filter(c => !c.esZero()).map(c => c.num).concat([d.num]).reduce((a, b) => M.mcd(a, b));
  return `\\dfrac{${texLineal(n.map(c => c.quocient(k)))}}{${M.texNombre(d.quocient(k))}}`;
}
/** Una equació «a·x + b·y + c·z = d» (coeficients Fraccio, o polinomis en el paràmetre X). */
function texEquacio(coefs, d, vars = INCOGNITES, X = null) {
  if (Array.isArray(d)) {
    // Amb paràmetre: «(m + 1)x», «mx», «-x»…
    const termes = coefs.map((p, i) => [p, vars[i]]).filter(([p]) => p.length);
    const esquerre = termes.length ? termes.map(([p, v], i) => {
      const t = M.termes(p);
      if (t.length === 1 && t[0].n === 0) return termeVar(t[0].c, v, i === 0);
      const tex = texP(p, X);
      const factor = t.length > 1 ? `(${tex})` : tex.replace(/^-/, '');
      const negatiu = t.length === 1 && t[0].c.signe() < 0;
      return (i === 0 ? (negatiu ? '-' : '') : (negatiu ? ' - ' : ' + ')) + factor + v;
    }).join('') : '0';
    return `${esquerre} = ${texP(d, X)}`;
  }
  const termes = coefs.map((c, i) => [c, vars[i]]).filter(([c]) => !c.esZero());
  const esquerre = termes.length ? termes.map(([c, v], i) => termeVar(c, v, i === 0)).join('') : '0';
  return `${esquerre} = ${M.texNombre(d)}`;
}
/** El sistema (S: 3 files [a, b, c, d]) amb una clau per equació, P<i>, i potser una marca. */
function texSistema(S, {P = 'Q', marca = () => '', X = null} = {}) {
  return `\\left\\{\\begin{array}{l} ${S.map((f, i) => K(`${P}${i + 1}`, texEquacio(f.slice(0, 3), f[3], INCOGNITES, X), marca(i))).join(' \\\\ ')} \\end{array}\\right.`;
}
/** La matriu ampliada A* = (A | b), amb claus a<i><j> (la columna b és la 4a) i marques. */
function texAmpliada(S, {P = '', marca = () => '', X = null} = {}) {
  const files = S.map((f, i) => f.map((c, j) => K(clauElement(P, i, j), Array.isArray(c) ? texP(c, X) : M.texNombre(c), marca(i, j))).join(' & '));
  return `\\left(\\begin{array}{rrr|r} ${files.join(' \\\\ ')} \\end{array}\\right)`;
}

/**
 * Els passos d'un sistema compatible indeterminat (rang 2), quan ja tenim un menor d'ordre 2
 * no nul de A (files fs, columnes cs): treure l'equació que sobra, la incògnita que queda fora
 * del menor és el paràmetre λ, el sistema de 2×2 que queda, Cramer per a cada incògnita i el
 * conjunt de solucions. «pintaSistema(marques)» redibuixa el sistema amb aquestes marques
 * ({fila: 'mes' | 'menys'}). Files: reduit, cramer, solucio. Torna {solucio: [p_x, p_y, p_z]}:
 * cada incògnita com a polinomi en λ (de grau ≤ 1).
 */
function passosSCI(g, {S, fs, cs, files, pintaSistema}) {
  const [r1, r2] = fs, [c1, c2] = cs;
  const r3 = [0, 1, 2].find(i => !fs.includes(i));
  const f = [0, 1, 2].find(j => !cs.includes(j));
  const nom = INCOGNITES;

  /* L'equació que sobra. */
  pintaSistema({[r1]: 'mes', [r2]: 'mes', [r3]: 'menys'});
  g.afegeix(`L'equació ${r3 + 1} no aporta res de nou: és combinació de les altres dues (per això el menor d'ordre 3 que la conté val $0$). `
    + `Treu-la, i queda't amb les equacions ${r1 + 1} i ${r2 + 1}, les del menor no nul.`);

  /* La incògnita de fora del menor és el paràmetre. */
  const linia = (k, ambLambda) => {
    const i = fs[k];
    const termes = [];
    for (const j of [0, 1, 2]) {
      const c = S[i][j];
      if (c.esZero() || (j === f && !ambLambda)) continue;
      termes.push(K(`G${k}${j === f ? 'l' : nom[j]}`, termeVar(c, j === f ? LAMBDA : nom[j], termes.length === 0)));
    }
    const esquerre = termes.length ? termes.join('') : K(`G${k}o`, '0');
    let dret;
    if (ambLambda || S[i][f].esZero()) dret = K(`G${k}d`, M.texNombre(S[i][3]));
    else if (S[i][3].esZero()) dret = K(`G${k}l`, termeVar(S[i][f].oposada(), LAMBDA, true));
    else dret = K(`G${k}d`, M.texNombre(S[i][3])) + K(`G${k}l`, termeVar(S[i][f].oposada(), LAMBDA, false));
    return esquerre + R(`G${k}q`, '=') + dret;
  };
  const sistema2 = ambLambda => `\\left\\{\\begin{array}{l} ${linia(0, ambLambda)} \\\\ ${linia(1, ambLambda)} \\end{array}\\right.`;
  const capLambda = S[r1][f].esZero() && S[r2][f].esZero();
  g.files[files.reduit] = sistema2(true);
  g.afegeix(`La incògnita que no és a les columnes del menor, $${nom[f]}$, passa a ser el paràmetre: $${nom[f]} = \\lambda$ (pot valer qualsevol nombre). `
    + (capLambda ? `Aquí $${nom[f]}$ no surt a les dues equacions que queden.` : 'Escriu-ho a les dues equacions que queden.'));
  if (!capLambda) {
    g.files[files.reduit] = sistema2(false);
    g.afegeix(`Passa els termes amb $\\lambda$ a l'altre costat (hi arriben canviats de signe): queda un sistema de 2 equacions amb 2 incògnites, $${nom[c1]}$ i $${nom[c2]}$.`);
  }

  /* Cramer per a cada incògnita. */
  const Mn = [[S[r1][c1], S[r1][c2]], [S[r2][c1], S[r2][c2]]];
  const D = Mn[0][0].producte(Mn[1][1]).resta(Mn[0][1].producte(Mn[1][0]));
  const b = [r1, r2].map(i => [S[i][3], S[i][f].oposada()]);              // els termes independents, en λ
  const texV = B => `\\begin{vmatrix} ${B.map(fl => fl.map(e => (Array.isArray(e) ? texLineal(e) : M.texNombre(e))).join(' & ')).join(' \\\\ ')} \\end{vmatrix}`;
  const fac = e => (Array.isArray(e) ? texFactorLineal(e) : M.texEntreParentesis(e));
  const per = (e, c) => (Array.isArray(e) ? e.map(x => x.producte(c)) : null);
  const linies = [];
  const solucio = [];
  const pinta = () => { g.files[files.cramer] = linies.length > 1 ? `\\begin{array}{l} ${linies.join(' \\\\[12pt] ')} \\end{array}` : linies[0]; };
  [c1, c2].forEach((v, n) => {
    // La matriu del numerador: la columna de la incògnita, canviada pels termes independents.
    const B = n === 0 ? [[b[0], Mn[0][1]], [b[1], Mn[1][1]]] : [[Mn[0][0], b[0]], [Mn[1][0], b[1]]];
    const num = n === 0 ? sumaP(per(b[0], Mn[1][1]), oposatP(per(b[1], Mn[0][1]))) : sumaP(per(b[1], Mn[0][0]), oposatP(per(b[0], Mn[1][0])));
    const texNum = n === 0 ? `${fac(b[0])} \\cdot ${fac(Mn[1][1])} - ${fac(Mn[0][1])} \\cdot ${fac(b[1])}`
      : `${fac(Mn[0][0])} \\cdot ${fac(b[1])} - ${fac(b[0])} \\cdot ${fac(Mn[1][0])}`;
    const P = `X${nom[v]}`;
    const inici = K(P + 'l', nom[v]) + R(P + 'q', '=');
    const peces = [K(P + 'a', `\\dfrac{${texV(B)}}{${texV(Mn)}}`)];
    linies.push(F.enLinies(inici, peces));
    pinta();
    g.afegeix(`Regla de Cramer: $${nom[v]}$ és un quocient de determinants. A baix, el menor (el determinant del sistema); a dalt, el mateix, `
      + `però amb la columna de $${nom[v]}$ canviada per la dels termes independents.`);
    const sobre = t => (D.igual(U) ? t : `\\dfrac{${t}}{${M.texNombre(D)}}`);   // sobre 1 no cal escriure la fracció
    peces.push(' = ' + K(P + 'b', sobre(texNum)));
    linies[n] = F.enLinies(inici, peces);
    pinta();
    g.afegeix('Calcula els dos determinants d\'ordre 2: el producte de la diagonal principal menys el de la secundària.');
    const cru = sobre(texLineal(num));
    peces.push(' = ' + K(P + 'c', cru));
    const fi = texQuocientLineal(num, D);
    if (fi !== cru) peces.push(' = ' + K(P + 'r', fi));
    linies[n] = F.enLinies(inici, peces);
    pinta();
    g.afegeix(`Opera el numerador${fi !== cru ? ' i simplifica' : ''}: $${nom[v]} = ${fi}$.`);
    solucio[v] = num.map(c => c.quocient(D));
  });
  solucio[f] = [ZERO, U];

  /* El conjunt de solucions. */
  const components = [0, 1, 2].map(j => (j === f ? LAMBDA : texQuocientLineal(solucio[j].map(c => c.producte(D)), D)));
  g.files[files.solucio] = F.enLinies(K('Sl', '(x,\\ y,\\ z)') + R('Sq', '='), [K('Sv', `\\left(${components.join(',\\ ')}\\right),`)],
    {final: '\\ ' + K('Sp', '\\lambda \\in \\mathbb{R}')});
  const exemple = [0, 1, 2].map(j => M.texNombre(valorP(solucio[j], 1)));          // la solució amb λ = 1
  return {solucio, exemple, components};
}


/* ── EXPORTACIÓ ────────────────────────────────────────────────────── */

arrel.Matrius = Object.freeze({
  PARAMETRES, MAX_ELEMENT, SARRUS,
  sumaP, producteP, oposatP, valorP, texP, textP, texEntrada, texFactor,
  llegeixMatriu, textMatriu, clauElement, texMatriu, texMatriuPetita,
  determinant, passosSarrus,
  divisors, ruffini, problemaArrels, passosArrels, texSolucions,
  nombres, submatriu, texVmatriuN, det2N, texDet2N, productesSarrusN, det3N, texSarrusN, rangN,
  INCOGNITES, termeVar, texLineal, texQuocientLineal, texEquacio, texSistema, texAmpliada, passosSCI,
});

})(globalThis);
