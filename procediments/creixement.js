/* ═══════════════════════════════════════════════════════════════════
   creixement.js — Procediment: creixement i decreixement (taula de signes)
   ───────────────────────────────────────────────────────────────────
   Dades: f(x) = P(x)/Q(x), amb coeficients enters entre −9 i 9:
     · un polinomi de grau 3 com a màxim (Q = 1), o
     · un quocient amb P de grau 2 com a màxim i Q de grau 1 o 2,
   sense factors comuns, i amb arrels de Q i de f' racionals.
   Adreça: creixement.html?f=(x^2+3)/(x-1)   o   ?f=x^3-3x^2+1

   Mètode, com a classe:
     1. el domini: on Q(x) ≠ 0;
     2. la derivada (regla del quocient): f' = (P'·Q − P·Q') / Q²;
     3. els punts crítics: on el numerador de f' val 0 (i són del domini);
     4. la taula: els punts crítics i els de fora del domini separen
        intervals; a cada interval, el signe de f' en un valor de prova
        (com que Q² > 0, és el signe del numerador); f' > 0 → f creix,
        f' < 0 → f decreix; i, als punts crítics, màxim o mínim relatiu;
     5. la conclusió: on creix i on decreix.

   La pissarra té cinc files:
     fila 0  el domini            fila 1  f(x) i f'(x)
     fila 2  el càlcul del moment fila 3  la taula
     fila 4  la conclusió
   Totes les línies que es veuen són certes: ho comprova proves/comprova.js.

   Claus: V… domini; D…, N… derivada; w i e equacions (Q = 0, f' = 0);
   E…, n… valor de prova; L…, H…, D…/F… (i: interval, p: punt) taula;
   Cc, Cd conclusió.
   ═══════════════════════════════════════════════════════════════════ */
(function (arrel) {
'use strict';

const M = arrel.Mates;
const F = arrel.Formules;
const Dd = arrel.Dades;
const {Fraccio, texNombre, texPolinomi} = M;
const {clau: K, op: O, rel: R} = F;


/* ── 1. DADES ──────────────────────────────────────────────────────── */

const MAX_COEF = 9;
const CAMPS = ['p3', 'p2', 'p1', 'p0', 'q2', 'q1', 'q0'];

const PER_DEFECTE = Object.freeze({p3: 0, p2: 1, p1: 0, p0: 3, q2: 0, q1: 1, q0: -1});

const EXEMPLES = Object.freeze([
  PER_DEFECTE,                                              // (x² + 3)/(x − 1): màxim, mínim i un punt fora del domini
  {p3: 1, p2: -3, p1: 0, p0: 1, q2: 0, q1: 0, q0: 1},       // un polinomi
  {p3: 0, p2: 0, p1: 1, p0: 0, q2: 1, q1: 0, q0: 1},        // x/(x² + 1): el domini és ℝ
  {p3: 0, p2: 1, p1: 0, p0: 0, q2: 1, q1: 0, q0: -4},       // x²/(x² − 4): dos punts fora del domini
  {p3: 0, p2: 0, p1: 0, p0: 1, q2: 0, q1: 1, q0: 0},        // 1/x: cap punt crític
  {p3: 0, p2: 0, p1: 0, p0: 1, q2: 1, q1: -2, q0: 1},       // 1/(x − 1)²: el numerador de f' s'anul·la fora del domini
]);

const termesP = v => Dd.termesAmb(v, 'p', 3);
const termesQ = v => Dd.termesAmb(v, 'q', 2);
/** f és un polinomi si el denominador és un nombre (que ha de ser 1). */
const esPolinomi = v => !v.q2 && !v.q1;

/** Termes del numerador de f' = (P'·Q − P·Q')/Q². Si Q = 1, és P'. */
function numerador(P, Q) {
  const c = M.coeficientsDe;
  const a = M.producteDePolinomis(c(M.derivaTermes(P)), c(Q));
  const b = M.producteDePolinomis(c(P), c(M.derivaTermes(Q)));
  return M.termes(M.sumaPolinomis(a, b.map(x => x.oposada())));
}

/** Text d'error si els valors no són vàlids; si ho són, null. */
function valida(v) {
  if (!CAMPS.every(id => Number.isInteger(v[id]) && Math.abs(v[id]) <= MAX_COEF)) return `Els coeficients han de ser enters entre −${MAX_COEF} i ${MAX_COEF}.`;
  const P = termesP(v), Q = termesQ(v);
  if (!Q.length) return 'El denominador no pot ser 0.';
  if (esPolinomi(v) && v.q0 !== 1) return 'Si el denominador és un nombre, posa-hi 1: llavors la funció és un polinomi.';
  if (!esPolinomi(v) && v.p3) return 'Si hi ha denominador, el numerador ha de ser de grau 2 com a màxim.';
  if (!P.length || (esPolinomi(v) && !P.some(t => t.n >= 1))) return 'La funció no pot ser constant: ha de dependre de x.';
  if (!esPolinomi(v)) {
    const arrelsQ = M.arrelsRacionals(Q);
    if (arrelsQ.irracionals) {
      return 'Amb aquest denominador, els punts que no són del domini són irracionals (surten arrels no exactes). '
        + 'De moment, tria un denominador amb arrels racionals, com els dels exemples.';
    }
    const proporcionals = v.p2 && v.q2 && v.p2 * v.q1 === v.p1 * v.q2 && v.p2 * v.q0 === v.p0 * v.q2;
    if (arrelsQ.arrels.some(r => M.valorTermes(P, r).esZero()) || proporcionals) {
      return 'El numerador i el denominador tenen un factor comú: simplifica la fracció i torna-ho a provar.';
    }
  }
  if (M.arrelsRacionals(numerador(P, Q)).irracionals) {
    return 'Amb aquesta funció, els punts crítics són irracionals (surten arrels no exactes). '
      + 'De moment, tria una funció amb punts crítics racionals, com les dels exemples.';
  }
  return null;
}


/* ── 2. ADREÇA ─────────────────────────────────────────────────────── */

/** Llegeix {f: '(x^2+3)/(x-1)'} o {f: 'x^3-1'}. Torna {valors} o {error}. */
function llegeixAdreca(p) {
  const v = Object.assign({}, PER_DEFECTE);
  if (p.f !== undefined) {
    let q;
    try {
      q = Dd.llegeixQuocient(p.f);
    } catch (e) {
      if (e instanceof M.ErrorLectura) return {error: `No entenc l'adreça: ${e.message}`};
      throw e;
    }
    if (!q) {
      return {error: `La funció de l'adreça, «${p.f}», no és un polinomi ni un quocient de polinomis. `
        + 'Escriu el numerador i el denominador entre parèntesis, per exemple (x^2+3)/(x-1).'};
    }
    if (!q.P.concat(q.Q).every(c => c.esEnter())) return {error: `La funció de l'adreça, «${p.f}», té coeficients que no són enters.`};
    if (q.P.length > 4 || q.Q.length > 3) {
      return {error: `La funció de l'adreça, «${p.f}», té un grau massa alt: el numerador pot ser de grau 3 com a màxim, i el denominador, de grau 2.`};
    }
    for (let n = 0; n <= 3; n++) v['p' + n] = q.P[n] ? q.P[n].num : 0;
    for (let n = 0; n <= 2; n++) v['q' + n] = q.Q[n] ? q.Q[n].num : 0;
  }
  const error = valida(v);
  return error ? {error: `L'adreça no es pot fer servir. ${error}`} : {valors: v};
}

/** «x^3-1», «1/x», «2x/(x+1)», «(x^2+3)/(x-1)»: els parèntesis, només si calen. */
function escriuAdreca(v) {
  const P = termesP(v), Q = termesQ(v);
  if (esPolinomi(v)) return {f: M.textPolinomi(P)};
  const num = P.length > 1 ? `(${M.textPolinomi(P)})` : M.textPolinomi(P);
  const den = Q.length > 1 || !Fraccio.de(Q[0].c).igual(1) ? `(${M.textPolinomi(Q)})` : M.textPolinomi(Q);
  return {f: `${num}/${den}`};
}


/* ── 3. TEXTOS I PECES ─────────────────────────────────────────────── */

const texFuncio = v => (esPolinomi(v) ? texPolinomi(termesP(v)) : `\\dfrac{${texPolinomi(termesP(v))}}{${texPolinomi(termesQ(v))}}`);
const enunciat = v => `Estudia el creixement i el decreixement de la funció $f(x) = ${texFuncio(v)}$.`;
const resum = v => `f(x) = ${texFuncio(v)}`;

/** «$x = 1$», «$x = 1$ i $x = 3$», «$x = -1$, $x = 1$ i $x = 3$». */
function llista(valors) {
  const t = valors.map(a => `$x = ${texNombre(a)}$`);
  return t.length > 1 ? t.slice(0, -1).join(', ') + ' i ' + t[t.length - 1] : t.join('');
}

/** Un factor d'un producte: entre parèntesis si té més d'un terme o és negatiu. */
function factor(l) {
  if (!l.length) return '0';
  return l.length === 1 && Fraccio.de(l[0].c).signe() > 0 ? texPolinomi(l) : `(${texPolinomi(l)})`;
}
const producte = (X, Y) => `${factor(X)} \\cdot ${factor(Y)}`;

/** Q(x)²: «x^{2}» si Q = x; si no, «(x - 1)^{2}». */
function texQuadrat(Q) {
  const t = Q[0];
  if (Q.length === 1 && Fraccio.de(t.c).igual(1)) return `x^{${2 * t.n}}`;
  return `(${texPolinomi(Q)})^{2}`;
}

/** Interval (a, b); null és −∞ o +∞. */
const texInterval = (a, b) => `(${a === null ? '-\\infty' : texNombre(a)},\\ ${b === null ? '+\\infty' : texNombre(b)})`;

/** Valor de prova dins de (a, b): el 0 si hi és; si no, un enter tan centrat com es pugui; si no n'hi ha, el punt mitjà. */
function valorDeProva(a, b) {
  const zero = Fraccio.de(0);
  if ((a === null || a.signe() < 0) && (b === null || b.signe() > 0)) return zero;
  const primer = a === null ? null : Math.floor(a.num / a.den) + 1;     // primer enter més gran que a
  const ultim = b === null ? null : Math.ceil(b.num / b.den) - 1;       // últim enter més petit que b
  if (a === null) return Fraccio.de(ultim);
  if (b === null) return Fraccio.de(primer);
  if (primer <= ultim) return Fraccio.de(Math.min(ultim, Math.max(primer, Math.round(a.suma(b).valor() / 2))));
  return a.suma(b).quocient(2);
}


/* ── 4. PASSOS ─────────────────────────────────────────────────────── */

function passos(v) {
  const P = termesP(v), Q = termesQ(v), pol = esPolinomi(v);
  const N = numerador(P, Q);
  const g = F.guio(5);

  /* 1. El domini, a la fila 0 (l'equació Q(x) = 0, a la fila 2). */
  const DOMINI = K('Vt', '\\text{Dom}\\,') + K('Vf', 'f') + R('Vq', '=') + K('VR', '\\mathbb{R}');
  let fora = [];
  if (pol) {
    g.files[0] = DOMINI;
    g.afegeix('Primer, el domini: $f$ és un polinomi, i un polinomi existeix per a qualsevol valor de $x$.');
  } else {
    const sol = F.resolPolinomi(g, 2, 'w', Q, 'Primer, el domini: $f$ no existeix on el denominador val $0$. Resol l\'equació.');
    fora = sol.map(s => s.valor);
    g.files[2] = '';
    g.files[0] = DOMINI + (sol.length
      ? O('Vm', '-') + K('Va', '\\{') + sol.map((s, j) => K('Vp' + j, texNombre(s.valor))).join(',\\ ') + K('Vb', '\\}')
      : '');
    g.afegeix(sol.length ? `El domini és $\\mathbb{R}$ sense ${llista(fora)}.` : 'El denominador no val mai $0$: el domini és tot $\\mathbb{R}$.',
      {reanomena: Object.fromEntries(sol.map((s, j) => ['Vp' + j, s.clau]))});
  }

  /* 2. La derivada, a la fila 1. */
  let pendent = {};
  if (pol) {
    const D1 = F.membreEsquerre('D', 'f', 'x', 1);
    g.files[1] = D1 + F.derivadaIndicada('d', P);
    g.afegeix('Ara la derivada, $f\'(x)$: el seu signe diu on $f$ creix i on decreix.');
    g.files[1] = D1 + F.derivadaBaixada('d', P);
    g.afegeix(`Deriva terme a terme. ${Dd.reglesDerivada(P)}`, {cursor: {clic: 'dQ'}});
    const feta = F.derivadaFeta('d', 'q', P);
    g.files[1] = D1 + feta.tex;
    if (feta.multiplica) {
      const primer = P.find(t => t.n >= 2 && !Fraccio.de(t.c).abs().igual(1));
      g.afegeix(`Multiplica: $f'(x) = ${texPolinomi(N)}$.`, {fusiona: feta.fusiona, reanomena: feta.reanomena, cursor: {clic: 'dm' + primer.n}});
    } else {
      pendent = feta.reanomena;                         // el text no canvia: les claus noves van al pas següent
    }
  } else {
    const c = M.coeficientsDe;
    const dP = M.derivaTermes(P), dQ = M.derivaTermes(Q);
    const A = M.termes(M.producteDePolinomis(c(dP), c(Q)));
    const B = M.termes(M.producteDePolinomis(c(P), c(dQ)));
    const den = texQuadrat(Q);
    const D1 = F.membreEsquerre('D', 'f', 'x', 1);
    const fraccio = num => D1 + `\\dfrac{${num}}{${K('Nd', den)}}`;
    g.files[1] = F.membreEsquerre('D', 'f', 'x') + `\\dfrac{${K('Nn', texPolinomi(P))}}{${K('Nd', texPolinomi(Q))}}`;
    g.afegeix('Ara la derivada, $f\'(x)$: el seu signe diu on $f$ creix i on decreix.');
    g.files[1] = fraccio(K('NA', producte(dP, Q)) + O('Ns', '-') + K('NB', producte(P, dQ)));
    g.afegeix('Fes servir la regla del quocient: $\\left(\\frac{P}{Q}\\right)\' = \\frac{P\' \\cdot Q - P \\cdot Q\'}{Q^2}$. '
      + `Aquí $P = ${texPolinomi(P)}$, $P' = ${texPolinomi(dP)}$, $Q = ${texPolinomi(Q)}$ i $Q' = ${texPolinomi(dQ)}$.`,
    {fusiona: {NA: ['Nn']}});
    g.files[1] = fraccio(K('NA', texPolinomi(A)) + O('Ns', '-') + K('NB', `(${texPolinomi(B)})`));
    g.afegeix('Multiplica cada producte. El denominador, deixa\'l com a quadrat.');
    const desplegat = A.concat(B.map(t => ({n: t.n, c: Fraccio.de(t.c).oposada()})));
    g.files[1] = fraccio(K('Nn', texPolinomi(desplegat)));
    g.afegeix('Treu el parèntesi: el $-$ del davant canvia el signe de cada terme de dins.', {fusiona: {Nn: ['NA', 'Ns', 'NB']}});
    g.files[1] = fraccio(K('Nn', texPolinomi(N)));
    g.afegeix(`Agrupa els termes semblants: $f'(x) = \\frac{${texPolinomi(N)}}{${den}}$.`);
  }

  /* 3. Els punts crítics: f'(x) = 0, a la fila 2. */
  const sol = F.resolPolinomi(g, 2, 'e', N,
    pol ? 'Els punts crítics són les solucions de l\'equació $f\'(x) = 0$.' : '$f\'(x)$ val $0$ quan el numerador val $0$. Resol l\'equació.',
    {reanomena: pendent});
  const esFora = a => fora.some(r => r.igual(a));
  const critics = sol.filter(s => !esFora(s.valor));
  const descartats = sol.filter(s => esFora(s.valor)).map(s => s.valor);
  if (descartats.length) {
    g.completa(` Però ${llista(descartats)} no ${descartats.length > 1 ? 'són del domini: no són punts crítics' : 'és del domini: no és un punt crític'}.`);
  }

  /* 4. La taula, a la fila 3. */
  const punts = fora.map(a => ({valor: a, critic: false}))
    .concat(critics.map(s => ({valor: s.valor, critic: true, clau: s.clau})))
    .sort((a, b) => a.valor.resta(b.valor).signe());
  const nI = punts.length + 1;
  const vores = j => [j === 0 ? null : punts[j - 1].valor, j === nI - 1 ? null : punts[j].valor];
  const cel = {Di: Array(nI).fill(''), Dp: Array(nI - 1).fill(''), Fi: Array(nI).fill(''), Fp: Array(nI - 1).fill('')};

  /** Capçalera d'un interval: −∞ al primer, +∞ a l'últim; els del mig, buits (els delimiten els punts). */
  const capInterval = j => (nI === 1 ? '(-\\infty,\\ +\\infty)' : j === 0 ? '-\\infty' : j === nI - 1 ? '+\\infty' : '');
  function taula() {
    const fila = (etiqueta, i, p) => [etiqueta].concat(...Array.from({length: nI}, (_, j) =>
      [i(j)].concat(j < nI - 1 ? [p(j)] : []))).join(' & ');
    const cella = (nom, j) => (cel[nom][j] ? K(nom + j, cel[nom][j]) : '');
    return `\\begin{array}{${Array(2 * nI).fill('c').join('|')}} `
      + [fila(K('Lx', 'x'), j => (capInterval(j) ? K('Hi' + j, capInterval(j)) : ''), j => K('Hp' + j, texNombre(punts[j].valor))),
        fila(K('Ld', 'f\'(x)'), j => cella('Di', j), j => cella('Dp', j)),
        fila(K('Lf', 'f(x)'), j => cella('Fi', j), j => cella('Fp', j))].join(' \\\\ \\hline ')
      + ' \\end{array}';
  }

  g.files[2] = '';
  g.files[3] = taula();
  const quins = critics.length && fora.length ? 'Els punts crítics i els punts que no són del domini'
    : critics.length ? 'Els punts crítics' : 'Els punts que no són del domini';
  g.afegeix(punts.length
    ? `Fes la taula. ${quins} (${llista(punts.map(p => p.valor))}) separen la recta en intervals.`
    : 'Fes la taula. No hi ha cap punt crític ni cap punt fora del domini: només hi ha l\'interval $(-\\infty,\\ +\\infty)$.',
  {reanomena: Object.fromEntries(punts.map((p, j) => [p, j]).filter(([p]) => p.clau).map(([p, j]) => ['Hp' + j, p.clau]))});

  if (punts.length) {
    punts.forEach((p, j) => { cel.Dp[j] = p.critic ? '0' : '\\nexists'; });
    g.files[3] = taula();
    const frases = [];
    if (critics.length) frases.push('Als punts crítics, $f\'(x) = 0$.');
    if (fora.length) frases.push('On $f$ no existeix, $f\'$ tampoc: hi poso $\\nexists$.');
    g.afegeix(frases.join(' '));
  }

  // El signe de f' a cada interval.
  if (!N.some(t => t.n >= 1)) {
    const positiu = Fraccio.de(N[0].c).signe() > 0;
    cel.Di.fill(positiu ? '+' : '-');
    g.files[3] = taula();
    g.afegeix(pol
      ? `$f'(x) = ${texNombre(N[0].c)}$ és sempre ${positiu ? 'positiva' : 'negativa'}.`
      : `El numerador de $f'$ és $${texNombre(N[0].c)}$, sempre ${positiu ? 'positiu' : 'negatiu'}, i el denominador és un quadrat, positiu: `
        + `$f'$ és ${positiu ? 'positiva' : 'negativa'} a tots els intervals.`);
  } else {
    const directe = N.length === 1 && (N[0].n === 0 || (N[0].n === 1 && Fraccio.de(N[0].c).abs().igual(1)));
    for (let j = 0; j < nI; j++) {
      const [a, b] = vores(j);
      const t = valorDeProva(a, b), T = texNombre(t);
      const val = M.valorTermes(N, t), positiu = val.signe() > 0;
      g.files[2] = (pol ? F.membreEsquerre('E', 'f', T, 1) : '') + F.substituit('n', N, t)
        + (directe ? '' : R('nq', '=') + K('nR', texNombre(val))) + R('nw', positiu ? '>' : '<') + K('nz', '0');
      g.afegeix(`Interval $${texInterval(a, b)}$: tria'n un valor, per exemple $x = ${T}$, i `
        + (pol ? `calcula $f'(${T})$.` : 'calcula el numerador de $f\'$. Només cal el seu signe: el denominador és un quadrat, i sempre és positiu.'),
      {cursor: {clic: j < nI - 1 ? 'Hp' + j : (nI > 1 ? 'Hp' + (j - 1) : null)}});
      cel.Di[j] = positiu ? '+' : '-';
      g.files[2] = '';
      g.files[3] = taula();
      g.afegeix(`$f'$ no canvia de signe dins de l'interval: és ${positiu ? 'positiva' : 'negativa'} a tot l'interval. Hi poso un $${positiu ? '+' : '-'}$.`,
        {fusiona: {['Di' + j]: ['nw', 'nz']}, cursor: {arrossega: 'nw', fins: 'Di' + j}});
    }
  }

  // El creixement de f, i els extrems relatius.
  cel.Fi = cel.Di.map(s => (s === '+' ? '\\nearrow' : '\\searrow'));
  punts.forEach((p, j) => { if (!p.critic) cel.Fp[j] = '\\nexists'; });
  g.files[3] = taula();
  g.afegeix('On $f\' > 0$, $f$ creix ($\\nearrow$); on $f\' < 0$, $f$ decreix ($\\searrow$).');
  if (critics.length) {
    const sense = [];
    punts.forEach((p, j) => {
      if (!p.critic) return;
      const [esquerra, dreta] = [cel.Di[j], cel.Di[j + 1]];
      if (esquerra === '+' && dreta === '-') cel.Fp[j] = '\\text{màx}';
      else if (esquerra === '-' && dreta === '+') cel.Fp[j] = '\\text{mín}';
      else sense.push(p.valor);
    });
    const fi = sense.length ? ` En ${llista(sense)} no canvia: no hi ha ni màxim ni mínim.` : '';
    const abans = g.passos.length;
    g.files[3] = taula();
    g.afegeix('Als punts crítics: si $f$ passa de créixer a decréixer, hi ha un màxim relatiu; si passa de decréixer a créixer, un mínim relatiu.' + fi);
    if (g.passos.length === abans) g.completa(fi);
  }

  /* 5. La conclusió, a la fila 4. */
  const unio = signe => {
    const l = cel.Di.map((s, j) => (s === signe ? texInterval(...vores(j)) : null)).filter(Boolean);
    return l.length ? l.join(' \\cup ') : null;
  };
  const [creix, decreix] = [unio('+'), unio('-')];
  g.files[4] = '\\begin{array}{l} \\text{Creixent: }' + K('Cc', creix || '\\text{cap interval}')
    + ' \\\\ \\text{Decreixent: }' + K('Cd', decreix || '\\text{cap interval}') + ' \\end{array}';
  g.classes[4] = 'final';
  g.afegeix(`Resultat: $f$ ${creix ? `creix a $${creix}$` : 'no creix a cap interval'} i ${decreix ? `decreix a $${decreix}$` : 'no decreix a cap interval'}.`);
  return g.passos;
}


/* ── 5. DEFINICIÓ DEL PROCEDIMENT ──────────────────────────────────── */

arrel.Creixement = Object.freeze({
  titol: 'Creixement i decreixement',
  categoria: 'analisi',
  files: 5,
  perDefecte: PER_DEFECTE,
  exemples: EXEMPLES,
  titolEditor: 'Canvia la funció',
  notaEditor: `Els coeficients van de −${MAX_COEF} a ${MAX_COEF}. Per a un polinomi, posa 1 al denominador.`,
  editor: [
    Dd.campsPolinomi('\\text{Numerador:}', 'p', 3, MAX_COEF, 'del numerador'),
    Dd.campsPolinomi('\\text{Denominador:}', 'q', 2, MAX_COEF, 'del denominador'),
  ],
  valida, llegeixAdreca, escriuAdreca, enunciat, resum, passos,
});

})(globalThis);
