/* ═══════════════════════════════════════════════════════════════════
   bolzano.js — Procediment: teorema de Bolzano i mètode de la bisecció
   ───────────────────────────────────────────────────────────────────
   Dades: f(x), un polinomi de grau 3 com a màxim amb coeficients enters
   entre −9 i 9; l'interval [a, b], amb a < b enters entre −5 i 5; i n,
   el nombre de bisseccions (1 a 5).
   Adreça: bolzano.html?f=x^3+x-1&a=0&b=1&n=3

   Passos:
     1. f és contínua en [a, b] (és un polinomi);
     2. f(a) i f(b), calculats pas a pas, amb el seu signe;
     3. si tenen signes contraris, pel teorema de Bolzano hi ha c ∈ (a, b)
        amb f(c) = 0; si no, Bolzano no diu res i el procediment acaba;
     4. la bisecció: a cada fila de la taula, l'interval (amb el signe de f
        sota cada extrem), el punt mitjà m i f(m); l'interval següent és la
        meitat on f canvia de signe. Si f(m) = 0, m és l'arrel;
     5. la resposta: c ∈ (l; r), un interval de longitud (b − a)/2ⁿ.

   La pissarra té set files (FILA). Els decimals s'escriuen amb coma, i
   els extrems dels intervals se separen amb «;». Un valor de f(m) amb
   més de quatre decimals s'escriu arrodonit, amb «≈».
   Claus: A…/a… f(a), B…/b… f(b) (vegeu Formules), Zi l'interval de
   Bolzano, T<k>i T<k>m T<k>v la fila k de la taula, Rc la resposta.
   ═══════════════════════════════════════════════════════════════════ */
(function (arrel) {
'use strict';

const M = arrel.Mates;
const F = arrel.Formules;
const Dd = arrel.Dades;
const {Fraccio, texNombre, texEntreParentesis, texPolinomi} = M;
const {clau: K, rel: R} = F;


/* ── 1. DADES ──────────────────────────────────────────────────────── */

const MAX_COEF = 9;
const MAX_PUNT = 5;
const MAX_GRAU = 3;
const MAX_BISECCIONS = 5;

const PER_DEFECTE = Object.freeze({a3: 1, a2: 0, a1: 1, a0: -1, a: 0, b: 1, n: 3});

const EXEMPLES = Object.freeze([
  PER_DEFECTE,
  {a3: 1, a2: 0, a1: 3, a0: 2, a: -2, b: 0, n: 2},       // com a la PAU: un interval de longitud 0,5
  {a3: 1, a2: 0, a1: -2, a0: -5, a: 2, b: 3, n: 4},
  {a3: 0, a2: 1, a1: 0, a0: -2, a: 1, b: 2, n: 4},       // √2
  {a3: 0, a2: 4, a1: 0, a0: -1, a: 0, b: 1, n: 3},       // arrel exacta al punt mitjà
  {a3: 0, a2: 1, a1: 0, a0: -1, a: -2, b: 2, n: 2},      // mateix signe: Bolzano no s'hi pot aplicar
]);

const {termesDe} = Dd;

/** Text d'error si els valors no són vàlids; si ho són, null. */
function valida(v) {
  const error = Dd.validaFuncio(v, MAX_COEF);
  if (error) return error;
  if (![v.a, v.b].every(x => Number.isInteger(x) && Math.abs(x) <= MAX_PUNT)) return `Els extrems de l'interval han de ser enters entre −${MAX_PUNT} i ${MAX_PUNT}.`;
  if (v.a >= v.b) return 'L\'interval ha de tenir a < b.';
  if (!Number.isInteger(v.n) || v.n < 1 || v.n > MAX_BISECCIONS) return `El nombre de bisseccions ha de ser un enter entre 1 i ${MAX_BISECCIONS}.`;
  const f = termesDe(v);
  for (const x of [v.a, v.b]) {
    if (M.valorTermes(f, x).esZero()) return `f(${x}) = 0: x = ${x} ja és una arrel. Tria un altre interval.`;
  }
  return null;
}


/* ── 2. ADREÇA ─────────────────────────────────────────────────────── */

/**
 * Llegeix els paràmetres de l'adreça: {f: 'x^3+x-1', a: '0', b: '1', n: '3'}.
 * Torna {valors} o {error}. Els que falten prenen el valor per defecte.
 */
function llegeixAdreca(p) {
  const v = Object.assign({}, PER_DEFECTE);
  try {
    if (p.f !== undefined) {
      const error = Dd.llegeixFuncio(p.f, v, MAX_GRAU);
      if (error) return {error};
    }
    for (const id of ['a', 'b', 'n']) {
      if (p[id] === undefined) continue;
      const x = M.llegeixNombre(p[id]);
      if (!x.esEnter()) return {error: `El valor «${id}» de l'adreça, «${p[id]}», no és un nombre enter.`};
      v[id] = x.num;
    }
  } catch (e) {
    if (e instanceof M.ErrorLectura) return {error: `No entenc l'adreça: ${e.message}`};
    throw e;
  }
  const error = valida(v);
  return error ? {error: `L'adreça no es pot fer servir. ${error}`} : {valors: v};
}

const escriuAdreca = v => ({f: Dd.textFuncio(v), a: String(v.a), b: String(v.b), n: String(v.n)});


/* ── 3. NOMBRES DECIMALS ───────────────────────────────────────────── */

/* Mates.formaDecimal: f(m), exacte fins a 4 decimals i, si no, arrodonit amb «≈».
   Mates.texDecimal: un punt de la recta (extrem o punt mitjà), sempre exacte. */
const {formaDecimal: decimal, texDecimal} = M;
/** Interval amb els extrems separats per «;» (els decimals porten coma). */
const interval = (l, r, obre = '[', tanca = ']') => `${obre}${texDecimal(l)};\\ ${texDecimal(r)}${tanca}`;
const signeTex = s => (s < 0 ? '-' : '+');
/** Interval amb el signe de f sota cada extrem. */
const intervalAmbSignes = (l, r, sl, sr) => `[\\underset{${signeTex(sl)}}{${texDecimal(l)}};\\ \\underset{${signeTex(sr)}}{${texDecimal(r)}}]`;
const paraulaSigne = s => (s < 0 ? 'negatiu' : 'positiu');


/* ── 4. TEXTOS ─────────────────────────────────────────────────────── */

const longitud = v => Fraccio.de(v.b - v.a).quocient(2 ** v.n);

function enunciat(v) {
  return `Estudia amb el teorema de Bolzano si $f(x) = ${texPolinomi(termesDe(v))}$ té alguna arrel a l'interval $[${v.a}, ${v.b}]$ i, `
    + `si és així, acota-la amb ${v.n === 1 ? 'una bisecció' : `${v.n} bisseccions`}: un interval de longitud $${texDecimal(longitud(v))}$.`;
}

/** Resum en TeX, per als exemples i per a l'editor. */
const resum = v => `f(x) = ${texPolinomi(termesDe(v))},\\ \\ [${v.a}, ${v.b}],\\ \\ n = ${v.n}`;


/* ── 5. PASSOS ─────────────────────────────────────────────────────── */

/** Files de la pissarra. */
const FILA = Object.freeze({funcio: 0, continuitat: 1, fa: 2, fb: 3, bolzano: 4, taula: 5, resposta: 6});

function passos(v) {
  const f = termesDe(v);
  const val = x => M.valorTermes(f, x);
  const g = F.guio(7);
  const [a, b] = [Fraccio.de(v.a), Fraccio.de(v.b)];

  /* 1. La funció i la continuïtat. */
  g.files[FILA.funcio] = F.membreEsquerre('F', 'f', 'x') + F.polinomi('P', f);
  g.afegeix('El teorema de Bolzano diu: si $f$ és contínua en $[a, b]$ i $f(a)$ i $f(b)$ tenen signes contraris, '
    + 'llavors hi ha almenys un $c \\in (a, b)$ amb $f(c) = 0$. Comprova les dues condicions.');
  g.files[FILA.continuitat] = F.filaText(`$f$ és contínua en $[${v.a}, ${v.b}]$ perquè és una funció polinòmica i és contínua a $\\mathbb{R}$.`);
  g.afegeix('Primera condició: la continuïtat.');

  /* 2. f(a) i f(b), pas a pas, amb el signe. */
  function calcula(fila, L, P, x) {
    const X = texNombre(x), Xp = texEntreParentesis(x), fx = val(x);
    const membre = F.membreEsquerre(L, 'f', X);
    g.files[fila] = membre + F.substituit(P, f, x);
    g.afegeix(`Calcula $f(${X})$: substitueix $x$ per $${Xp}$.`, {cursor: {clic: 'Pv' + f[0].n}});
    g.files[fila] = membre + F.avaluat(P, f, x);
    g.afegeix('Calcula cada terme.', {fusiona: F.fusionsAvaluat(P, f)});
    const signe = R(L + 'w', fx.signe() < 0 ? '<' : '>') + K(L + 'z', '0');
    if (f.length > 1) {
      g.files[fila] = membre + F.resultat(P, fx) + signe;
      g.afegeix(`Opera: $f(${X}) = ${texNombre(fx)}$, que és ${paraulaSigne(fx.signe())}.`, {fusiona: F.fusionsResultat(P, f, x)});
    } else {
      g.files[fila] = membre + F.avaluat(P, f, x) + signe;
      g.afegeix(`$f(${X}) = ${texNombre(fx)}$, que és ${paraulaSigne(fx.signe())}.`);
    }
    return fx.signe();
  }
  const sa = calcula(FILA.fa, 'A', 'a', a);
  const sb = calcula(FILA.fb, 'B', 'b', b);

  /* 3. La conclusió del teorema. */
  if (sa === sb) {
    g.files[FILA.bolzano] = `\\text{${K('Zt', 'mateix signe: Bolzano no s\'hi pot aplicar')}}`;
    g.classes[FILA.bolzano] = 'final';
    g.afegeix(`$f(${v.a})$ i $f(${v.b})$ són tots dos ${sa < 0 ? 'negatius' : 'positius'}: no es compleix la segona condició, `
      + 'i el teorema de Bolzano no diu res. Compte: això no vol dir que no hi hagi cap arrel a l\'interval. Pot haver-n\'hi (un nombre parell), o no haver-n\'hi cap.');
    return g.passos;
  }
  const ab = `(${v.a}, ${v.b})`;
  g.files[FILA.bolzano] = `\\exists\\, ${K('Zc', 'c')} \\in ${K('Zi', ab)} \\,:\\, f(c) = 0`;
  g.afegeix(`Les dues condicions es compleixen: $f$ és contínua i $f(${v.a})$ i $f(${v.b})$ tenen signes contraris. `
    + `Pel teorema de Bolzano, $f$ té almenys una arrel $c$ a l'interval $${ab}$. Però on?`);

  /* 4. La bisecció. */
  const files = [];                       // files de la taula (TeX amb claus)
  const taula = () => {
    g.files[FILA.taula] = '\\begin{array}{c|c|c} \\text{interval} & m & f(m) \\\\ \\hline '
      + files.map(c => c.join(' & ')).join(' \\\\[6pt] ') + ' \\end{array}';   // espai per als signes de sota
  };
  let [l, r, sl, sr] = [a, b, sa, sb];
  files.push([K('T0i', intervalAmbSignes(l, r, sl, sr)), '', '']);
  taula();
  g.afegeix('Ara acota l\'arrel pel mètode de la bisecció: parteix l\'interval per la meitat, mira el signe de $f$ al punt mitjà, '
    + 'i queda\'t amb la meitat on $f$ canvia de signe. Sota cada extrem hi ha el signe de $f$.', {cursor: {clic: 'Zi'}});
  for (let k = 0; k < v.n; k++) {
    const m = l.suma(r).quocient(2), fm = val(m);
    const fila = files[k];
    fila[1] = K(`T${k}m`, texDecimal(m));
    taula();
    g.afegeix(`Punt mitjà: $m = \\frac{${texDecimal(l)} + ${r.signe() < 0 ? `(${texDecimal(r)})` : texDecimal(r)}}{2} = ${texDecimal(m)}$.`);
    const d = decimal(fm);
    if (fm.esZero()) {
      fila[2] = K(`T${k}v`, '0');
      taula();
      g.afegeix(`$f(${texDecimal(m)}) = 0$: el punt mitjà és una arrel!`);
      g.files[FILA.resposta] = K('Rc', `c = ${texDecimal(m)}`);
      g.classes[FILA.resposta] = 'final';
      g.afegeix(`Hem trobat l'arrel exacta: $c = ${texDecimal(m)}$. No cal continuar.`, {cursor: {clic: `T${k}v`}});
      return g.passos;
    }
    const sm = fm.signe();
    fila[2] = K(`T${k}v`, `${d.aprox ? '\\approx ' : ''}${d.tex} ${sm < 0 ? '<' : '>'} 0`);
    taula();
    g.afegeix(`Calcula $f(${texDecimal(m)}) ${d.aprox ? '\\approx' : '='} ${d.tex}$` + (d.aprox ? ' (arrodonit)' : '')
      + `, que és ${paraulaSigne(sm)}.`);
    const esquerra = sm !== sl;           // f canvia de signe entre l i m
    [l, r, sl, sr] = esquerra ? [l, m, sl, sm] : [m, r, sm, sr];
    files.push([K(`T${k + 1}i`, intervalAmbSignes(l, r, sl, sr)), '', '']);
    taula();
    g.afegeix(`$f$ canvia de signe ${esquerra ? 'entre l\'extrem esquerre i el punt mitjà' : 'entre el punt mitjà i l\'extrem dret'}: `
      + `l'arrel és a $${interval(l, r)}$, que fa la meitat de llarg, $${texDecimal(r.resta(l))}$.`, {cursor: {clic: `T${k}v`}});
  }

  /* 5. La resposta. */
  g.files[FILA.resposta] = K('Rc', `c \\in ${interval(l, r, '(', ')')}`);
  g.classes[FILA.resposta] = 'final';
  g.afegeix(`Després de ${v.n === 1 ? 'una bisecció' : `${v.n} bisseccions`}, l'arrel és a l'interval $${interval(l, r, '(', ')')}$, `
    + `de longitud $\\frac{${v.b - v.a}}{2^{${v.n}}} = ${texDecimal(longitud(v))}$.`, {cursor: {clic: `T${v.n}i`}});
  return g.passos;
}


/* ── 6. DEFINICIÓ DEL PROCEDIMENT ──────────────────────────────────── */

arrel.Bolzano = Object.freeze({
  titol: 'Teorema de Bolzano i bisecció',
  categoria: 'analisi',
  files: 7,
  perDefecte: PER_DEFECTE,
  exemples: EXEMPLES,
  titolEditor: 'Canvia la funció, l\'interval i les bisseccions',
  notaEditor: `Els coeficients van de −${MAX_COEF} a ${MAX_COEF}; a i b, de −${MAX_PUNT} a ${MAX_PUNT}; i hi pot haver de 1 a ${MAX_BISECCIONS} bisseccions. `
    + 'Cada bisecció parteix l\'interval per la meitat.',
  editor: [
    Dd.campsFuncio(MAX_COEF),
    {etiqueta: 'a =', camps: [Dd.camp('a', '', 'extrem esquerre a', MAX_PUNT, 'negatiu', false)]},
    {etiqueta: 'b =', camps: [Dd.camp('b', '', 'extrem dret b', MAX_PUNT, 'negatiu', false)]},
    {etiqueta: '\\text{bisseccions} =', camps: [{id: 'n', sufix: '', nom: 'nombre de bisseccions', min: 1, max: MAX_BISECCIONS, signe: 'negatiu', atenua0: false}]},
  ],
  FILA,
  decimal,
  valida, llegeixAdreca, escriuAdreca, enunciat, resum, passos,
});

})(globalThis);
