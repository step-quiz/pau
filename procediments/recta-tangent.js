/* ═══════════════════════════════════════════════════════════════════
   recta-tangent.js — Procediment: recta tangent, recta normal, i recta
   tangent amb un pendent donat
   ───────────────────────────────────────────────────────────────────
   Dades: f(x), un polinomi de grau 3 com a màxim amb coeficients enters
   entre −9 i 9, i la variant (mode):
     tangent  la recta tangent en x₀ (un enter entre −5 i 5);
     normal   la recta normal en x₀: la perpendicular a la tangent, amb
              pendent −1/f'(x₀) (vertical, x = x₀, si f'(x₀) = 0);
     pendent  les rectes tangents de pendent m (un enter entre −9 i 9):
              els punts són les solucions de f'(x) = m (cap, una o dues).
   Adreça: recta-tangent.html?f=2x^2-3x+1&x0=2
           recta-tangent.html?f=x^2-4x+5&x0=3&recta=normal
           recta-tangent.html?f=x^3-3x&m=9

   La pissarra té dues files:
     fila 0  l'equació de la recta: y − f(x₀) = f'(x₀)·(x − x₀) (o, a sobre,
             les rectes ja acabades, claus TF0, TF1…)
     fila 1  el càlcul del moment: f(x₀), després f'(x) i f'(x₀); o f'(x) = m
   Quan un càlcul acaba, el resultat puja a l'equació i la fila 1 queda
   buida. Totes les línies que es veuen són igualtats certes: ho
   comprova proves/comprova.js.

   Claus de la fila 0 (equació):
     Ty y   Ts1 Tf1 Tl1 Ta1 Tr1  − f ( x₀ )   Teq =
     Tf2 Tp2 Tl2 Ta2 Tr2  f ′ ( x₀ )          Tl3 Tx Ts3 Ta3 Tr3  ( x − x₀ )
     TV f(x₀)   TM f'(x₀)   TK constant de m(x − x₀)   TN terme independent final
     TZ el 0 quan el pendent és 0      Tn Tu  «−» i «1» de −1/f'(x₀)      TX la normal vertical
     Tc «no n'hi ha cap»               TF<i> una recta ja acabada
   Prefixos de la fila 1: G/g per a f(x₀), D/d per a f'(x), q per a la derivada.
   ═══════════════════════════════════════════════════════════════════ */
(function (arrel) {
'use strict';

const M = arrel.Mates;
const F = arrel.Formules;
const Dd = arrel.Dades;
const {Fraccio, texNombre, texEntreParentesis, texPolinomi} = M;
const {clau: K, op: O, rel: R} = F;


/* ── 1. DADES ──────────────────────────────────────────────────────── */

const MAX_COEF = 9;
const MAX_PUNT = 5;
const MAX_PENDENT = 9;
const MAX_GRAU = 3;
const MODES = Object.freeze(['tangent', 'normal', 'pendent']);

const PER_DEFECTE = Object.freeze({a3: 0, a2: 2, a1: -3, a0: 1, x0: 2, m: 1, mode: 'tangent'});

const EXEMPLES = Object.freeze([
  PER_DEFECTE,
  {a3: 1, a2: 0, a1: -3, a0: 1, x0: -1, m: 1, mode: 'tangent'},       // pendent 0 i x₀ negatiu
  {a3: 0, a2: 1, a1: -4, a0: 5, x0: 2, m: 1, mode: 'tangent'},        // vèrtex d'una paràbola
  {a3: -1, a2: 3, a1: 0, a0: -2, x0: 3, m: 1, mode: 'tangent'},       // f(x₀) negatiu
  {a3: 0, a2: -1, a1: 3, a0: 0, x0: 1, m: 1, mode: 'normal'},         // normal de pendent −1
  {a3: 0, a2: 1, a1: -4, a0: 5, x0: 3, m: 1, mode: 'normal'},         // normal de pendent −1/2
  {a3: 0, a2: 1, a1: -4, a0: 5, x0: 2, m: 1, mode: 'normal'},         // tangent horitzontal: normal vertical
  {a3: 1, a2: 0, a1: -3, a0: 0, x0: 2, m: 9, mode: 'pendent'},        // dos punts
  {a3: 0, a2: 1, a1: -4, a0: 1, x0: 2, m: -2, mode: 'pendent'},       // paral·lela a y = −2x, com a la PAU
  {a3: 1, a2: 0, a1: 3, a0: 0, x0: 2, m: 1, mode: 'pendent'},         // cap punt
]);

const {termesDe, article} = Dd;

/** Termes de f'(x) − m: les solucions de f'(x) = m. */
const equacioPendent = v => M.termes(M.sumaPolinomis(M.coeficientsDe(M.derivaTermes(termesDe(v))), [Fraccio.de(-v.m)]));

/** Text d'error si els valors no són vàlids; si ho són, null. */
function valida(v) {
  const error = Dd.validaFuncio(v, MAX_COEF);
  if (error) return error;
  if (!MODES.includes(v.mode)) return 'Tria quina recta vols: la tangent, la normal o la tangent amb un pendent donat.';
  if (!Number.isInteger(v.x0) || Math.abs(v.x0) > MAX_PUNT) return `El punt x₀ ha de ser un enter entre −${MAX_PUNT} i ${MAX_PUNT}.`;
  if (!Number.isInteger(v.m) || Math.abs(v.m) > MAX_PENDENT) return `El pendent m ha de ser un enter entre −${MAX_PENDENT} i ${MAX_PENDENT}.`;
  if (v.mode === 'pendent') {
    if (!v.a3 && !v.a2) return 'Si f és una recta, el pendent de la tangent és sempre el mateix: posa algun terme de grau 2 o 3.';
    if (M.arrelsRacionals(equacioPendent(v)).irracionals) {
      return 'Amb aquest pendent, els punts de tangència són irracionals (surten arrels no exactes). Prova un altre pendent.';
    }
  }
  return null;
}


/* ── 2. ADREÇA ─────────────────────────────────────────────────────── */

/**
 * Llegeix els paràmetres de l'adreça: {f, x0} (tangent), {f, x0, recta: 'normal'}
 * o {f, m} (tangent amb pendent m). Torna {valors} o {error}. Els que falten
 * prenen el valor per defecte.
 */
function llegeixAdreca(p) {
  const v = Object.assign({}, PER_DEFECTE);
  if (p.recta !== undefined && !['tangent', 'normal'].includes(p.recta)) return {error: `L'adreça demana la recta «${p.recta}»: pot ser «tangent» o «normal».`};
  if (p.m !== undefined && p.recta === 'normal') return {error: 'L\'adreça no pot demanar alhora la recta normal i un pendent m.'};
  v.mode = p.m !== undefined ? 'pendent' : (p.recta || 'tangent');
  try {
    if (p.f !== undefined) {
      const error = Dd.llegeixFuncio(p.f, v, MAX_GRAU);
      if (error) return {error};
    }
    for (const [id, nom] of [['x0', 'El punt'], ['m', 'El pendent']]) {
      if (p[id] === undefined) continue;
      const x = M.llegeixNombre(p[id]);
      if (!x.esEnter()) return {error: `${nom} de l'adreça, «${p[id]}», no és un nombre enter.`};
      v[id] = x.num;
    }
  } catch (e) {
    if (e instanceof M.ErrorLectura) return {error: `No entenc l'adreça: ${e.message}`};
    throw e;
  }
  const error = valida(v);
  return error ? {error: `L'adreça no es pot fer servir. ${error}`} : {valors: v};
}

/** Paràmetres de l'adreça per a uns valors. */
function escriuAdreca(v) {
  const f = Dd.textFuncio(v);
  if (v.mode === 'pendent') return {f, m: String(v.m)};
  return v.mode === 'normal' ? {f, x0: String(v.x0), recta: 'normal'} : {f, x0: String(v.x0)};
}


/* ── 3. TEXTOS ─────────────────────────────────────────────────────── */

function enunciat(v) {
  const f = `$f(x) = ${texPolinomi(termesDe(v))}$`;
  if (v.mode === 'normal') {
    return `Troba l'equació de la recta normal (la perpendicular a la recta tangent) a la gràfica de ${f} en el punt d'abscissa $x = ${texNombre(v.x0)}$.`;
  }
  if (v.mode === 'pendent') {
    return `Hi ha algun punt de la gràfica de ${f} on la recta tangent tingui pendent $${v.m}$ (és a dir, sigui paral·lela a $y = ${texPolinomi(M.termes([0, v.m]))}$)? `
      + 'Si n\'hi ha, troba\'n les rectes tangents.';
  }
  return `Troba l'equació de la recta tangent a la gràfica de ${f} en el punt d'abscissa $x = ${texNombre(v.x0)}$.`;
}

/** Resum en TeX, per als exemples i per a l'editor. */
function resum(v) {
  const f = `f(x) = ${texPolinomi(termesDe(v))}`;
  if (v.mode === 'pendent') return `${f},\\ \\ m = ${texNombre(v.m)}`;
  return `${v.mode === 'normal' ? '\\text{normal: }' : ''}${f},\\ \\ x_0 = ${texNombre(v.x0)}`;
}


/* ── 4. PASSOS ─────────────────────────────────────────────────────── */

/**
 * Afegeix al guió «g» els passos d'una recta pel punt d'abscissa x0 (fila 0;
 * els càlculs, a la fila 1). tipus: 'tangent', 'normal' o 'pendent' (una
 * tangent de pendent «mConegut»). «previ»: TeX de les rectes ja acabades,
 * que es veuen a sobre. Torna {recta, text}: l'equació final (TeX) i el text
 * de l'últim pas, que ha d'afegir qui la crida (amb la classe que calgui).
 */
function recta(g, f, x0, tipus, previ = '', mConegut = null) {
  const d = M.derivaTermes(f);
  const fx0 = M.valorTermes(f, x0);                         // f(x₀)
  const normal = tipus === 'normal';
  const mt = tipus === 'pendent' ? mConegut : M.valorTermes(d, x0);   // pendent de la tangent, f'(x₀)
  const X = texNombre(x0), Xp = texEntreParentesis(x0);
  const nom = normal ? 'normal' : 'tangent';
  const signeDe = w => (w.signe() < 0 ? '-' : '+');
  const posa0 = eq => { g.files[0] = previ ? `\\begin{array}{l} ${previ} \\\\[6pt] ${eq} \\end{array}` : eq; };

  /* Peces de l'equació (fila 0). */
  const y = K('Ty', 'y'), igual = R('Teq', '=');
  const fDe = a => O('Ts1', '-') + K('Tf1', 'f') + K('Tl1', '(') + K('Ta1', a) + K('Tr1', ')');
  const derDe = a => K('Tf2', 'f') + `^{${K('Tp2', '\\prime')}}` + K('Tl2', '(') + K('Ta2', a) + K('Tr2', ')');
  const pendentDe = a => (tipus === 'pendent' ? K('TM', texNombre(mt))
    : normal ? K('Tn', '-') + `\\dfrac{${K('Tu', '1')}}{${derDe(a)}}` : derDe(a));
  const parentesi = (s, a) => '\\,' + K('Tl3', '(') + K('Tx', 'x') + O('Ts3', s) + K('Ta3', a) + K('Tr3', ')');

  /* 1. La fórmula, amb x₀. */
  posa0(y + fDe('x_0') + igual + pendentDe('x_0') + parentesi('-', 'x_0'));
  g.afegeix(tipus === 'pendent'
    ? `En el punt d'abscissa $x_0 = ${X}$, la recta tangent té pendent $${texNombre(mt)}$. La seva equació és aquesta: només cal $f(x_0)$.`
    : normal
      ? 'La recta normal és la perpendicular a la recta tangent en el punt d\'abscissa $x_0$. Com que el producte dels pendents de dues rectes '
        + 'perpendiculars és $-1$, el seu pendent és $-\\frac{1}{f\'(x_0)}$. Necessites dos nombres: $f(x_0)$ i $f\'(x_0)$.'
      : 'Aquesta és l\'equació de la recta tangent en el punt d\'abscissa $x_0$. Necessites dos nombres: $f(x_0)$ i $f\'(x_0)$.');

  let dreta = parentesi('-', Xp);
  posa0(y + fDe(X) + igual + pendentDe(X) + dreta);
  g.afegeix(`Substitueix $x_0 = ${X}$.`, {cursor: {clic: 'Ta3'}});
  if (x0.signe() < 0) {
    dreta = parentesi('+', texNombre(x0.abs()));
    posa0(y + fDe(X) + igual + pendentDe(X) + dreta);
    g.afegeix(`Simplifica: $x - ${Xp} = x + ${texNombre(x0.abs())}$.`, {cursor: {clic: 'Ts3'}});
  }

  /* 2. f(x₀), a la fila 1. */
  const fDeX0 = F.membreEsquerre('G', 'f', X);
  g.files[1] = F.membreEsquerre('G', 'f', 'x') + F.polinomi('g', f);
  g.afegeix(`Calcula $f(${X})$. Comença per la funció.`);
  g.files[1] = fDeX0 + F.substituit('g', f, x0);
  g.afegeix(`Substitueix $x$ per $${Xp}$.`, {cursor: {clic: 'GX'}});
  g.files[1] = fDeX0 + F.avaluat('g', f, x0);
  g.afegeix('Calcula cada terme.', {fusiona: F.fusionsAvaluat('g', f), cursor: {clic: 'gv' + f[0].n}});
  if (f.length > 1) {
    g.files[1] = fDeX0 + F.resultat('g', fx0);
    g.afegeix(`Opera: $f(${X}) = ${texNombre(fx0)}$.`, {fusiona: F.fusionsResultat('g', f, x0), cursor: {clic: 'gs' + f[1].n}});
  }

  /* El resultat puja a l'equació, al lloc de f(x₀). El seu signe, si en té, l'acompanya. */
  const resultatF = F.clausResultat('g', f, x0);
  let esquerra = y + O('Ts1', '-') + K('TV', texEntreParentesis(fx0));
  posa0(esquerra + igual + pendentDe(X) + dreta);
  g.files[1] = '';
  g.afegeix(`Porta ${article(fx0)}$${texNombre(fx0)}$ a l'equació, al lloc de $f(${X})$.`, {
    reanomena: {TV: resultatF.valor},
    fusiona: {TV: ['Tf1', 'Tl1', 'Ta1', 'Tr1'].concat(resultatF.signe ? [resultatF.signe] : [])},
    cursor: {arrossega: resultatF.valor, fins: 'TV'},
  });
  if (fx0.signe() < 0) {
    esquerra = y + O('Ts1', '+') + K('TV', texNombre(fx0.abs()));
    posa0(esquerra + igual + pendentDe(X) + dreta);
    g.afegeix(`Simplifica: $y - ${texEntreParentesis(fx0)} = y + ${texNombre(fx0.abs())}$.`, {cursor: {clic: 'Ts1'}});
  } else if (fx0.esZero()) {
    esquerra = y;
    posa0(esquerra + igual + pendentDe(X) + dreta);
    g.afegeix('Simplifica: $y - 0 = y$.', {cursor: {clic: 'Ts1'}});
  }

  /* 3. f'(x) i f'(x₀), a la fila 1 (si el pendent no és conegut). */
  let m = mt;                                               // pendent de la recta
  if (tipus !== 'pendent') {
    let reanomenaPendent = derivada(g, f);
    const derX0 = F.membreEsquerre('D', 'f', X, true);
    g.files[1] = derX0 + F.substituit('q', d, x0);
    g.afegeix(`Calcula $f'(${X})$: substitueix $x$ per $${Xp}$.`, {reanomena: reanomenaPendent, cursor: {clic: 'DX'}});
    g.files[1] = derX0 + F.avaluat('q', d, x0);
    g.afegeix('Calcula cada terme.', {fusiona: F.fusionsAvaluat('q', d), cursor: {clic: d[0].n >= 1 ? 'qv' + d[0].n : null}});
    if (d.length > 1) {
      g.files[1] = derX0 + F.resultat('q', mt);
      g.afegeix(`Opera: $f'(${X}) = ${texNombre(mt)}$.`, {fusiona: F.fusionsResultat('q', d, x0), cursor: {clic: 'qs' + d[1].n}});
    }

    const resultatD = F.clausResultat('q', d, x0);
    const portaD = {
      reanomena: {TM: resultatD.valor},
      fusiona: {TM: ['Tf2', 'Tp2', 'Tl2', 'Ta2', 'Tr2'].concat(resultatD.signe ? [resultatD.signe] : [])},
      cursor: {arrossega: resultatD.valor, fins: 'TM'},
    };
    if (!normal) {
      posa0(esquerra + igual + K('TM', texNombre(mt)) + dreta);
      g.files[1] = '';
      g.afegeix(`Porta ${article(mt)}$${texNombre(mt)}$ a l'equació, al lloc de $f'(${X})$. És el pendent de la recta.`, portaD);
    } else if (mt.esZero()) {
      /* Tangent horizontal: la normal és vertical. −1/0 no existeix. */
      posa0(K('TX', `x = ${X}`));
      g.files[1] = '';
      g.afegeix(`$f'(${X}) = 0$: la recta tangent és horitzontal, i la normal, que hi és perpendicular, és vertical. `
        + `No es pot fer $-\\frac{1}{0}$: la normal és la recta vertical que passa pel punt, $x = ${X}$.`, {fusiona: {TX: ['Tx', 'Ta3']}});
      return {recta: `x = ${X}`, text: `Aquesta és la recta normal: $x = ${X}$. És vertical, perquè la tangent és horitzontal.`};
    } else {
      posa0(esquerra + igual + K('Tn', '-') + `\\dfrac{${K('Tu', '1')}}{${K('TM', texNombre(mt))}}` + dreta);
      g.files[1] = '';
      g.afegeix(`Porta ${article(mt)}$${texNombre(mt)}$ a l'equació, al lloc de $f'(${X})$: és el pendent de la tangent.`, portaD);
      m = Fraccio.de(-1).quocient(mt);
      posa0(esquerra + igual + K('TM', texNombre(m)) + dreta);
      const text = mt.esEnter() && mt.abs().igual(1) || !mt.esEnter() || mt.signe() < 0
        ? `Calcula el pendent de la normal: $-\\frac{1}{${texEntreParentesis(mt)}} = ${texNombre(m)}$.`
        : `El pendent de la normal és $${texNombre(m)}$.`;
      g.afegeix(text, {fusiona: {TM: ['Tn', 'Tu']}, cursor: {clic: 'TM'}});
    }
  }

  /* 4. Simplifica l'equació fins a y = m·x + n. */
  const k = m.producte(x0).oposada();                       // m·(x − x₀) = m·x + k
  const n = k.suma(fx0);                                    // y = m·x + n
  const passaCap = `Passa el $${fx0.signe() > 0 ? '-' : '+'}${texNombre(fx0.abs())}$ a l'altre costat: hi arriba canviat de signe.`;
  if (!m.esZero()) {
    const mx = (m.igual(1) ? '' : K('TM', m.igual(-1) ? '-' : texNombre(m))) + K('Tx', 'x');
    const constant = k.esZero() ? '' : O('Ts3', signeDe(k)) + K('TK', texNombre(k.abs()));
    posa0(esquerra + igual + mx + constant);
    g.afegeix(
      `Multiplica ${article(m)}$${texNombre(m)}$ per cada terme del parèntesi` + (x0.esZero() ? ': el segon terme dona $0$.' : '.'),
      {fusiona: k.esZero() ? {} : {TK: ['Ta3']}, cursor: m.igual(1) ? {clic: 'TM'} : {arrossega: 'TM'}});
    if (!fx0.esZero()) {
      posa0(y + igual + mx + constant + O('Ts1', fx0.signe() > 0 ? '+' : '-') + K('TV', texNombre(fx0.abs())));
      g.afegeix(passaCap, {cursor: {arrossega: 'TV'}});
      if (!k.esZero()) {
        posa0(y + igual + mx + (n.esZero() ? '' : O('Ts3', signeDe(n)) + K('TN', texNombre(n.abs()))));
        g.afegeix(`Opera: $${texNombre(k)} ${fx0.signe() < 0 ? '-' : '+'} ${texNombre(fx0.abs())} = ${texNombre(n)}$.`,
          {fusiona: n.esZero() ? {} : {TN: ['TK', 'Ts1', 'TV']}, cursor: {clic: 'TK'}});   // si n = 0, s'anul·len
      }
    }
  } else {
    posa0(esquerra + igual + K('TZ', '0'));
    g.afegeix('Qualsevol nombre multiplicat per $0$ dona $0$.',
      {fusiona: {TZ: ['TM', 'Tl3', 'Tx', 'Ts3', 'Ta3', 'Tr3']}, cursor: {clic: 'TM'}});
    if (!fx0.esZero()) {
      posa0(y + igual + (fx0.signe() < 0 ? K('Ts1', '-') : '') + K('TV', texNombre(fx0.abs())));
      g.afegeix(passaCap, {fusiona: {TV: ['TZ']}, cursor: {arrossega: 'TV'}});
    }
  }

  const eq = 'y = ' + (m.esZero() ? texNombre(fx0) : texPolinomi(M.termes([n, m])));
  return {recta: eq, text: `Aquesta és la recta ${nom}: $${eq}$.` + (m.esZero() ? ' És horitzontal, perquè el pendent és $0$.' : '')};
}

/**
 * La derivada f'(x), pas a pas, a la fila 1. Torna els canvis de nom que
 * queden pendents per al pas següent (si l'últim pas no ha canviat el text).
 */
function derivada(g, f) {
  const d = M.derivaTermes(f);
  const derX = F.membreEsquerre('D', 'f', 'x', true);
  g.files[1] = derX + F.derivadaIndicada('d', f);
  g.afegeix('Ara calcula la derivada, $f\'(x)$.');
  g.files[1] = derX + F.derivadaBaixada('d', f);
  g.afegeix(`Deriva terme a terme. ${Dd.reglesDerivada(f)}`, {cursor: {clic: 'dQ'}});
  const feta = F.derivadaFeta('d', 'q', f);
  if (!feta.multiplica) return feta.reanomena;              // el text no canvia: les claus noves van al pas següent
  const primer = f.find(t => t.n >= 2 && !Fraccio.de(t.c).abs().igual(1));
  g.files[1] = derX + feta.tex;
  g.afegeix(`Multiplica: $f'(x) = ${texPolinomi(d)}$.`, {fusiona: feta.fusiona, reanomena: feta.reanomena, cursor: {clic: 'dm' + primer.n}});
  return {};
}

/** Variant «pendent»: els punts on f'(x) = m, i la recta tangent a cadascun. */
function passosPendent(g, f, v) {
  const m = Fraccio.de(v.m), M_ = texNombre(m);
  const derX = F.membreEsquerre('D', 'f', 'x', true);
  g.files[1] = derX + F.derivadaIndicada('d', f);
  g.afegeix(`El pendent de la recta tangent en un punt és la derivada en aquest punt. Els punts que busques són les solucions de $f'(x) = ${M_}$. Primer, la derivada.`);
  g.files[1] = derX + F.derivadaBaixada('d', f);
  g.afegeix(`Deriva terme a terme. ${Dd.reglesDerivada(f)}`, {cursor: {clic: 'dQ'}});
  const feta = F.derivadaFeta('d', 'q', f);
  g.files[1] = feta.tex + R('Iq', '=') + K('Im', M_);
  g.afegeix(`Iguala la derivada al pendent: $${texPolinomi(M.derivaTermes(f))} = ${M_}$.`, {fusiona: feta.fusiona, reanomena: feta.reanomena});
  const sol = F.resolPolinomi(g, 1, 'e', equacioPendent(v), `Passa el $${M_}$ a l'altre costat, canviat de signe, i opera.`);
  if (!sol.length) {
    g.files[0] = K('Tc', '\\text{No n\'hi ha cap.}');
    g.classes[0] = 'final';
    g.afegeix(`L'equació no té solucions: cap punt de la gràfica té una recta tangent de pendent $${M_}$.`);
    return;
  }
  const llista = sol.map(s => `$x = ${texNombre(s.valor)}$`).join(' i ');
  g.completa(sol.length > 1 ? ` Hi ha dos punts: ${llista}. Ara, la recta tangent a cadascun.` : ` Hi ha un sol punt: ${llista}.`);
  const acabades = [];                                      // TeX amb claus de les rectes ja fetes
  sol.forEach((s, i) => {
    g.files[1] = '';
    const r = recta(g, f, s.valor, 'pendent', acabades.join(' \\\\[6pt] '), m);
    acabades.push(K('TF' + i, r.recta));
    if (i < sol.length - 1) {
      g.files[0] = `\\begin{array}{l} ${acabades.join(' \\\\[6pt] ')} \\end{array}`;
      g.afegeix(`${r.text} Ara, el segon punt.`);
    } else {
      g.classes[0] = 'final';
      g.afegeix(sol.length > 1 ? `${r.text} Hi ha dues rectes tangents de pendent $${M_}$: són paral·leles.` : r.text);
    }
  });
}

function passos(v) {
  const f = termesDe(v);
  const g = F.guio(2);
  if (v.mode === 'pendent') {
    passosPendent(g, f, v);
  } else {
    const r = recta(g, f, Fraccio.de(v.x0), v.mode === 'normal' ? 'normal' : 'tangent');
    g.classes[0] = 'final';
    g.afegeix(r.text);
  }
  return g.passos;
}


/* ── 5. DEFINICIÓ DEL PROCEDIMENT ──────────────────────────────────── */

arrel.RectaTangent = Object.freeze({
  titol: 'Recta tangent',
  categoria: 'analisi',
  files: 2,
  perDefecte: PER_DEFECTE,
  exemples: EXEMPLES,
  titolEditor: 'Canvia la recta, la funció i el punt',
  notaEditor: `Els coeficients van de −${MAX_COEF} a ${MAX_COEF}; el punt, de −${MAX_PUNT} a ${MAX_PUNT}; i el pendent, de −${MAX_PENDENT} a ${MAX_PENDENT}.`,
  modes: {id: 'mode', nom: 'Quina recta?', opcions: [
    {valor: 'tangent', nom: 'Recta tangent'},
    {valor: 'normal', nom: 'Recta normal'},
    {valor: 'pendent', nom: 'Tangent amb un pendent donat'},
  ]},
  editor: [
    Dd.campsFuncio(MAX_COEF),
    {etiqueta: 'x_0 =', camps: [Dd.camp('x0', '', 'punt x zero', MAX_PUNT, 'negatiu', false)], modes: ['tangent', 'normal']},
    {etiqueta: 'm =', camps: [Dd.camp('m', '', 'pendent m', MAX_PENDENT, 'negatiu', false)], modes: ['pendent']},
  ],
  valida, llegeixAdreca, escriuAdreca, enunciat, resum, passos,
});

})(globalThis);
