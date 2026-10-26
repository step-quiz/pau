/* ═══════════════════════════════════════════════════════════════════
   asimptotes.js — Procediment: asímptotes d'una funció racional
   ───────────────────────────────────────────────────────────────────
   Dades: f(x) = P(x)/Q(x), amb coeficients enters entre −9 i 9, P de
   grau 3 com a màxim, Q de grau 1 o 2 amb arrels racionals, i sense
   factors comuns. Adreça: asimptotes.html?f=(x^2+3)/(x-1)

   Mètode, en dos blocs, com a classe:
   A) Asímptotes verticals: lligades al domini. Als punts on Q(x) = 0,
      els límits laterals (±∞, directament; el signe del numerador i del
      denominador es raona al text) diuen cap a on van les branques.
   B) Asímptotes horitzontals i obliqües: un càlcul a l'infinit. Primer,
      lim f(x) a +∞ i a −∞ (manen els termes de grau més alt): si és un
      nombre L, y = L és l'asímptota horitzontal; si és infinit, es
      destaca el signe (serveix per a l'esbós) i es busca l'obliqua
      y = mx + n, amb m = lim f(x)/x i n = lim (f(x) − mx).

   La pissarra té set files (FILA):
     fila 0  f(x)                fila 1  el càlcul del moment (Q(x) = 0)
     fila 2  el domini           fila 3  els límits laterals
     fila 4  els límits a ±∞     fila 5  m i n
     fila 6  el resum de les asímptotes
   Cada límit és una línia «lim … = …» el segon membre de la qual es va
   transformant fins al resultat. Totes les línies que es veuen són
   certes: ho comprova proves/comprova.js.

   Claus: F… f(x); w… Q(x) = 0 (Formules.resolPolinomi); V… domini;
   L<i><m|p>{l,q,e,r,v} límit lateral a l'arrel i; Ip…, Im… límits a +∞ i
   a −∞; Om…, On… m i n; Sv<i>, Sh, So resum.
   ═══════════════════════════════════════════════════════════════════ */
(function (arrel) {
'use strict';

const M = arrel.Mates;
const F = arrel.Formules;
const Dd = arrel.Dades;
const {Fraccio, texNombre, texPolinomi: tp} = M;
const {clau: K, op: O, rel: R} = F;


/* ── 1. DADES ──────────────────────────────────────────────────────── */

const MAX_COEF = 9;
const CAMPS = ['p3', 'p2', 'p1', 'p0', 'q2', 'q1', 'q0'];

const PER_DEFECTE = Object.freeze({p3: 0, p2: 1, p1: 0, p0: 3, q2: 0, q1: 1, q0: -1});

const EXEMPLES = Object.freeze([
  PER_DEFECTE,                                              // (x² + 3)/(x − 1): vertical i obliqua
  {p3: 0, p2: 0, p1: 2, p0: 1, q2: 0, q1: 1, q0: -3},       // (2x + 1)/(x − 3): vertical i horitzontal y = 2
  {p3: 0, p2: 0, p1: 3, p0: 0, q2: 1, q1: 0, q0: -4},       // 3x/(x² − 4): dues verticals, horitzontal y = 0
  {p3: 0, p2: 0, p1: 5, p0: 0, q2: 1, q1: 0, q0: 1},        // 5x/(x² + 1), com a la PAU: cap vertical
  {p3: 0, p2: 1, p1: -2, p0: 0, q2: 0, q1: 1, q0: -1},      // (x² − 2x)/(x − 1), com a la PAU: obliqua y = x − 1
  {p3: 0, p2: 0, p1: 0, p0: 1, q2: 1, q1: -2, q0: 1},       // 1/(x − 1)²: les dues branques cap a +∞
  {p3: 1, p2: 0, p1: 0, p0: 0, q2: 0, q1: 1, q0: 1},        // x³/(x + 1): ni horitzontal ni obliqua
]);

const termesP = v => Dd.termesAmb(v, 'p', 3);
const termesQ = v => Dd.termesAmb(v, 'q', 2);
const coefs = M.coeficientsDe;                 // termes → coeficients de grau 0 cap amunt

/** Residu de la divisió de polinomis A : B (coeficients de grau 0 cap amunt). */
function residu(A, B) {
  const r = A.slice(), gb = B.length - 1;
  for (let i = r.length - 1; i >= gb; i--) {
    const q = r[i].quocient(B[gb]);
    for (let j = 0; j <= gb; j++) r[i - gb + j] = r[i - gb + j].resta(B[j].producte(q));
  }
  return r.slice(0, gb);
}

/** Text d'error si els valors no són vàlids; si ho són, null. */
function valida(v) {
  if (!CAMPS.every(id => Number.isInteger(v[id]) && Math.abs(v[id]) <= MAX_COEF)) return `Els coeficients han de ser enters entre −${MAX_COEF} i ${MAX_COEF}.`;
  const P = termesP(v), Q = termesQ(v);
  if (!v.q2 && !v.q1) return 'El denominador ha de dependre de x. Si és un nombre, f és un polinomi, i un polinomi no té asímptotes.';
  if (!P.length) return 'El numerador no pot ser 0.';
  const arrelsQ = M.arrelsRacionals(Q);
  if (arrelsQ.irracionals) {
    return 'Amb aquest denominador, els punts que no són del domini són irracionals (surten arrels no exactes). '
      + 'De moment, tria un denominador amb arrels racionals, com els dels exemples.';
  }
  const comu = arrelsQ.arrels.some(r => M.valorTermes(P, r).esZero())
    || (!arrelsQ.arrels.length && residu(coefs(P), coefs(Q)).every(c => c.esZero()));
  if (comu) return 'El numerador i el denominador tenen un factor comú: simplifica la fracció i torna-ho a provar.';
  return null;
}


/* ── 2. ADREÇA I TEXTOS ────────────────────────────────────────────── */

function llegeixAdreca(p) {
  const v = Object.assign({}, PER_DEFECTE);
  if (p.f !== undefined) {
    const error = Dd.llegeixQuocientA(p.f, v);
    if (error) return {error};
  }
  const error = valida(v);
  return error ? {error: `L'adreça no es pot fer servir. ${error}`} : {valors: v};
}
const escriuAdreca = v => ({f: Dd.textQuocient(v)});

const enunciat = v => `Troba les asímptotes de la funció $f(x) = ${Dd.texQuocient(v)}$.`;
const resum = v => `f(x) = ${Dd.texQuocient(v)}`;


/* ── 3. LÍMITS ─────────────────────────────────────────────────────── */

const LIM = cap => `\\lim\\limits_{x \\to ${cap}}`;
const INF = s => (s < 0 ? '-\\infty' : '+\\infty');
const paraulaSigne = s => (s < 0 ? 'negatiu' : 'positiu');
/** Un polinomi com a factor d'un producte: entre parèntesis si té més d'un terme o és negatiu. */
const factor = l => (l.length === 1 && Fraccio.de(l[0].c).signe() > 0 ? tp(l) : `(${tp(l)})`);

/**
 * Límit de N/D quan x → +∞ (cap = 1) o −∞ (cap = −1), pels termes de grau
 * més alt: {finit: Fraccio} o {infinit: ±1}.
 */
function limitInfinit(N, D, cap) {
  const k = N[0].n - D[0].n, c = Fraccio.de(N[0].c).quocient(D[0].c);
  if (k < 0) return {finit: Fraccio.de(0)};
  if (k === 0) return {finit: c};
  return {infinit: c.signe() * (cap < 0 && k % 2 ? -1 : 1)};
}
const texLimit = l => (l.finit ? texNombre(l.finit) : INF(l.infinit));

/**
 * Els passos d'un límit de N/D a l'infinit, després de l'expressió inicial:
 * els termes de grau més alt, la simplificació i el resultat. Cada pas és
 * [segon membre TeX, explicació]. «cap»: 1 (+∞), −1 (−∞) o 0 (±∞, quan el
 * límit és finit, que és el mateix a tots dos costats).
 */
function passosInfinit(N, D, cap) {
  const L = LIM(cap > 0 ? '+\\infty' : cap < 0 ? '-\\infty' : '\\pm\\infty');
  const [n0, d0] = [N[0], D[0]];
  const k = n0.n - d0.n, c = Fraccio.de(n0.c).quocient(d0.c);
  const l = limitInfinit(N, D, cap || 1);
  const dominant = `\\dfrac{${tp([n0])}}{${tp([d0])}}`;
  const passos = [[`${L} ${dominant}`, 'Quan $x$ és molt gran, en cada polinomi només compta el terme de grau més alt: els altres hi són petits al costat.']];
  if (k > 0) {
    const t = tp([{n: k, c}]);
    passos.push([`${L} ${t}`, `Simplifica: $${dominant} = ${t}$.`]);
    const potencia = cap < 0 && k % 2 ? `$x^{${k}}$ és negatiu (exponent senar)` : (k > 1 ? `$x^{${k}}$ és positiu` : '$x$ és positiu');
    passos.push([INF(l.infinit), `Quan $x \\to ${cap < 0 ? '-' : '+'}\\infty$, ${potencia} i es fa tan gran com vulguis: $${t}$ tendeix a $${INF(l.infinit)}$.`]);
  } else if (k < 0) {
    const t = `\\dfrac{${texNombre(n0.c)}}{${tp([{n: -k, c: d0.c}])}}`;
    passos.push([`${L} ${t}`, `Simplifica: $${dominant} = ${t}$.`]);
    passos.push(['0', 'Un nombre fix dividit per una quantitat cada cop més gran tendeix a $0$.']);
  } else {
    passos.push([texNombre(c), 'Simplifica: a dalt i a baix hi ha el mateix grau, i queda el quocient dels coeficients.']);
  }
  return {passos, limit: l};
}


/* ── 4. PASSOS ─────────────────────────────────────────────────────── */

/** Files de la pissarra. */
const FILA = Object.freeze({funcio: 0, calcul: 1, domini: 2, laterals: 3, infinit: 4, obliqua: 5, resum: 6});

function passos(v) {
  const P = termesP(v), Q = termesQ(v);
  const valP = x => M.valorTermes(P, x), valQ = x => M.valorTermes(Q, x);
  const g = F.guio(7);
  const linies = {laterals: [], infinit: [], obliqua: [], resum: []};
  const dibuixa = () => {
    for (const [nom, ls] of Object.entries(linies)) {
      g.files[FILA[nom]] = ls.length ? `\\begin{array}{l} ${ls.join(' \\\\[6pt] ')} \\end{array}` : '';
    }
  };
  const pas = (text, opcions) => { dibuixa(); g.afegeix(text, opcions); };
  /** Una línia «esquerra = dreta», amb claus prefix + l, q, e. */
  const linia = (P_, esquerra, dreta) => K(P_ + 'l', esquerra) + R(P_ + 'q', '=') + K(P_ + 'e', dreta);
  const fracPQ = `\\dfrac{${tp(P)}}{${tp(Q)}}`;

  g.files[FILA.funcio] = F.membreEsquerre('F', 'f', 'x') + K('Fe', fracPQ);
  pas('A) Asímptotes verticals. Estan lligades al domini: només n\'hi pot haver on el denominador val $0$, '
    + 'perquè allà $f$ no existeix. Comença pel domini.');

  /* A. El domini (fila 1 → fila 2) i els límits laterals (fila 3). */
  const DOMINI = K('Vt', '\\text{Dom}\\,') + K('Vf', 'f') + R('Vq', '=') + K('VR', '\\mathbb{R}');
  dibuixa();
  const sol = F.resolPolinomi(g, FILA.calcul, 'w', Q, `On s'anul·la el denominador? Resol $${tp(Q)} = 0$.`);
  const arrels = sol.map(s => s.valor);
  g.files[FILA.calcul] = '';
  g.files[FILA.domini] = DOMINI + (sol.length
    ? O('Vm', '-') + K('Va', '\\{') + sol.map((s, j) => K('Vp' + j, texNombre(s.valor))).join(',\\ ') + K('Vb', '\\}')
    : '');
  const llista = arrels.map(r => `$x = ${texNombre(r)}$`).join(' i ');
  pas(sol.length ? `El domini és $\\mathbb{R}$ sense ${llista}. Hi pot haver una asímptota vertical a ${sol.length > 1 ? 'cadascun d\'aquests punts' : 'aquest punt'}: `
    + 'ho diuen els límits laterals.' : 'El denominador no val mai $0$: el domini és tot $\\mathbb{R}$.',
  {reanomena: Object.fromEntries(sol.map((s, j) => ['Vp' + j, s.clau]))});

  const branques = [];                 // per a l'esbós
  if (!arrels.length) {
    linies.resum.push(K('Sv0', '\\text{No hi ha asímptotes verticals}'));
    pas('Com que $f$ existeix a tot arreu, no hi ha asímptotes verticals.');
  }
  arrels.forEach((r, i) => {
    const X = texNombre(r), pr = valP(r);
    const resultats = [];
    for (const s of [-1, 1]) {
      const pre = `L${i}${s < 0 ? 'm' : 'p'}`;
      const sq = valQ(r.suma(new Fraccio(s, 1000))).signe();   // signe de Q just al costat (les arrels de Q estan separades més de 1/9)
      const lim = pr.signe() * sq;
      resultats.push(lim);
      const esquerra = `${LIM(`${X}^{${s < 0 ? '-' : '+'}}`)} f(x)`;
      // Un valor de prova, si x = r ∓ 0,1 s'escriu bé en decimal.
      const t = r.suma(new Fraccio(s, 10)), tt = M.texDecimal(t), qt = M.texDecimal(valQ(t));
      const prova = tt !== null && qt !== null && tt.length <= 6 ? ` (per exemple, en $x = ${tt}$ val $${qt}$)` : '';
      const costat = s < 0 ? 'Per l\'esquerra' : 'Per la dreta';
      // Directament el resultat, ±∞; el raonament (numerador → k, denominador → 0 amb un signe) va al text.
      linies.laterals.push(linia(pre, esquerra, INF(lim)));
      pas(`${costat} de $x = ${X}$: el numerador tendeix a $${texNombre(pr)}$, i el denominador, $${tp(Q)}$, tendeix a $0$ `
        + `amb valors ${paraulaSigne(sq) === 'positiu' ? 'positius' : 'negatius'}${prova}. `
        + `Un nombre ${paraulaSigne(pr.signe())} dividit per un nombre molt petit i ${paraulaSigne(sq)} dona un nombre molt gran i ${paraulaSigne(lim)}: $${INF(lim)}$.`);
    }
    linies.resum.push(K('Sv' + i, `\\text{Asímptota vertical d'equació } x = ${X}`));
    const branca = l => (l < 0 ? 'baixa cap a $-\\infty$' : 'puja cap a $+\\infty$');
    branques.push(`a prop de $x = ${X}$, per l'esquerra la branca ${branca(resultats[0])} i per la dreta ${branca(resultats[1])}`);
    pas(`Els límits laterals són infinits: $x = ${X}$ és una asímptota vertical. Per l'esquerra, la gràfica ${branca(resultats[0])}, `
      + `i per la dreta, ${branca(resultats[1])}.`);
  });

  /* B. Els límits a l'infinit (fila 4). */
  const mesInf = passosInfinit(P, Q, 1), l = mesInf.limit;
  const esqMes = `${LIM('+\\infty')} f(x)`, esqMenys = `${LIM('-\\infty')} f(x)`;
  linies.infinit.push(linia('Ip', esqMes, `${LIM('+\\infty')} ${fracPQ}`));
  pas('B) Asímptotes horitzontals i obliqües. Totes dues surten d\'un càlcul a l\'infinit: com és $f(x)$ quan $x$ és molt gran? '
    + 'Comença per $x \\to +\\infty$.');
  for (const [dreta, text] of mesInf.passos) { linies.infinit[0] = linia('Ip', esqMes, dreta); pas(text); }
  if (l.finit) {
    linies.infinit.push(linia('Im', esqMenys, texNombre(l.finit)));
    pas(`A $-\\infty$ passa el mateix: els termes de grau més alt donen el mateix quocient, $${texNombre(l.finit)}$.`);
  } else {
    const menysInf = passosInfinit(P, Q, -1);
    const [simplificat, resultat] = menysInf.passos.slice(1);   // lim c·xᵏ, i el resultat
    linies.infinit.push(linia('Im', esqMenys, simplificat[0]));
    pas('Ara $x \\to -\\infty$: manen els mateixos termes de grau més alt, i la mateixa simplificació.');
    linies.infinit[1] = linia('Im', esqMenys, resultat[0]);
    pas(resultat[1]);
  }

  /* L'asímptota horitzontal, i el que diuen els límits infinits per a l'esbós. */
  const limMenys = l.finit ? l : limitInfinit(P, Q, -1);
  if (l.finit) {
    linies.resum.push(K('Sh', `\\text{Asímptota horitzontal d'equació } y = ${texNombre(l.finit)}`));
    pas(`El límit a l'infinit és un nombre, $${texNombre(l.finit)}$: la recta $y = ${texNombre(l.finit)}$ és una asímptota horitzontal, a $+\\infty$ i a $-\\infty$.`);
    linies.resum.push(K('So', '\\text{No hi ha asímptotes obliqües}'));
    pas('Si hi ha asímptota horitzontal, no n\'hi ha d\'obliqua: totes dues diuen com és $f$ quan $x$ és molt gran, i només pot ser d\'una manera.');
  } else {
    linies.resum.push(K('Sh', '\\text{No hi ha asímptotes horitzontals}'));
    g.classes[FILA.infinit] = 'destacat';
    pas(`El límit és infinit: no hi ha asímptota horitzontal. Però el resultat serveix per a l'esbós: quan $x \\to +\\infty$, $f(x) \\to ${INF(l.infinit)}$, `
      + `i quan $x \\to -\\infty$, $f(x) \\to ${INF(limMenys.infinit)}$.`);

    /* L'asímptota obliqua, y = mx + n (fila 5). */
    const xQ = M.termes([Fraccio.de(0)].concat(coefs(Q)));
    const k = P[0].n - Q[0].n;
    if (k === 1) {
      const lm = passosInfinit(P, xQ, 0), m = lm.limit.finit;
      const Lpm = LIM('\\pm\\infty');
      linies.obliqua.push(linia('Om', 'm', `${Lpm} \\dfrac{f(x)}{x}`));
      pas('Potser hi ha una asímptota obliqua, $y = mx + n$. El pendent és $m = \\lim \\frac{f(x)}{x}$ (per a una funció racional, és el mateix a $+\\infty$ i a $-\\infty$).');
      linies.obliqua[0] = linia('Om', 'm', `${Lpm} \\dfrac{${tp(P)}}{${tp(xQ)}}`);
      pas(`Dividir $f(x)$ per $x$ és multiplicar el denominador per $x$: $x \\cdot ${factor(Q)} = ${tp(xQ)}$.`);
      for (const [dreta, text] of lm.passos) { linies.obliqua[0] = linia('Om', 'm', dreta); pas(text); }

      const mx = [{n: 1, c: m}];
      const menysMx = `${m.signe() > 0 ? '-' : '+'} ${tp([{n: 1, c: m.abs()}])}`;
      const N = M.termes(M.sumaPolinomis(coefs(P), M.producteDePolinomis(coefs(Q), [Fraccio.de(0), m.oposada()])));
      const ln = passosInfinit(N, Q, 0), n = ln.limit.finit;
      linies.obliqua.push(linia('On', 'n', `${Lpm} \\left(f(x) ${menysMx}\\right)`));
      pas(`L'ordenada a l'origen és $n = \\lim \\left(f(x) - mx\\right)$, amb $m = ${texNombre(m)}$.`);
      linies.obliqua[1] = linia('On', 'n', `${Lpm} \\left(${fracPQ} ${menysMx}\\right)`);
      pas('Substitueix $f(x)$.');
      const coefM = m.abs().igual(1) ? '' : texNombre(m.abs());
      linies.obliqua[1] = linia('On', 'n', `${Lpm} \\dfrac{${tp(P)} ${m.signe() > 0 ? '-' : '+'} ${coefM}x \\cdot ${factor(Q)}}{${tp(Q)}}`);
      pas(`Fes la resta amb el mateix denominador: $${tp(mx)} = \\frac{${tp(mx)} \\cdot ${factor(Q)}}{${tp(Q)}}$.`);
      linies.obliqua[1] = linia('On', 'n', `${Lpm} \\dfrac{${tp(N)}}{${tp(Q)}}`);
      pas('Opera el numerador. El terme de grau més alt s\'anul·la: per això $m$ és el que és.');
      for (const [dreta, text] of ln.passos) { linies.obliqua[1] = linia('On', 'n', dreta); pas(text); }
      const recta = tp(M.termes([n, m]));
      linies.resum.push(K('So', `\\text{Asímptota obliqua d'equació } y = ${recta}`));
      pas(`$m = ${texNombre(m)}$ i $n = ${texNombre(n)}$ són nombres: la recta $y = ${recta}$ és una asímptota obliqua. Quan $x$ és molt gran, la gràfica s'hi acosta.`);
      branques.push(`a l'infinit, la gràfica s'acosta a la recta $y = ${recta}$`);
    } else {
      const lm = passosInfinit(P, xQ, 1);
      const Lp = LIM('+\\infty'), esquerra = `${Lp} \\dfrac{f(x)}{x}`;
      linies.obliqua.push(linia('Om', esquerra, `${Lp} \\dfrac{${tp(P)}}{${tp(xQ)}}`));
      pas('Potser hi ha una asímptota obliqua, $y = mx + n$. El pendent seria el nombre $m = \\lim \\frac{f(x)}{x}$. '
        + `Dividir $f(x)$ per $x$ és multiplicar el denominador per $x$: $x \\cdot ${factor(Q)} = ${tp(xQ)}$.`);
      for (const [dreta, text] of lm.passos) { linies.obliqua[0] = linia('Om', esquerra, dreta); pas(text); }
      linies.resum.push(K('So', '\\text{No hi ha asímptotes obliqües}'));
      pas('El límit és infinit, i $m$ ha de ser un nombre: no hi ha asímptota obliqua (a $-\\infty$ passa el mateix). '
        + 'La gràfica creix més de pressa que qualsevol recta: és una branca parabòlica.');
    }
    branques.push(`quan $x \\to +\\infty$, $f(x) \\to ${INF(l.infinit)}$, i quan $x \\to -\\infty$, $f(x) \\to ${INF(limMenys.infinit)}$`);
  }
  if (l.finit) branques.push(`a l'infinit, la gràfica s'acosta a la recta $y = ${texNombre(l.finit)}$`);

  /* El resum, per a l'esbós. */
  g.classes[FILA.resum] = 'final';
  pas(`Per a l'esbós: ${branques.join('; ')}.`);
  return g.passos;
}


/* ── 5. DEFINICIÓ DEL PROCEDIMENT ──────────────────────────────────── */

arrel.Asimptotes = Object.freeze({
  titol: 'Asímptotes d\'una funció racional',
  categoria: 'analisi',
  files: 7,
  perDefecte: PER_DEFECTE,
  exemples: EXEMPLES,
  titolEditor: 'Canvia la funció',
  notaEditor: `Els coeficients van de −${MAX_COEF} a ${MAX_COEF}. El denominador ha de dependre de x.`,
  editor: [
    Dd.campsPolinomi('\\text{Numerador:}', 'p', 3, MAX_COEF, 'del numerador'),
    Dd.campsPolinomi('\\text{Denominador:}', 'q', 2, MAX_COEF, 'del denominador'),
  ],
  FILA,
  valida, llegeixAdreca, escriuAdreca, enunciat, resum, passos,
});

})(globalThis);
