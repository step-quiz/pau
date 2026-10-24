/* ═══════════════════════════════════════════════════════════════════
   recta-tangent.js — Procediment: equació de la recta tangent
   ───────────────────────────────────────────────────────────────────
   Dades: f(x), un polinomi de grau 3 com a màxim amb coeficients enters
   entre −9 i 9, i x₀, un enter entre −5 i 5.
   Adreça: recta-tangent.html?f=2x^2-3x+1&x0=2

   La pissarra té dues files:
     fila 0  l'equació de la recta: y − f(x₀) = f'(x₀)·(x − x₀)
     fila 1  el càlcul del moment: f(x₀), després f'(x) i f'(x₀)
   Quan un càlcul acaba, el resultat puja a l'equació i la fila 1 queda
   buida. Totes les línies que es veuen són igualtats certes: ho
   comprova proves/comprova.js.

   Claus de la fila 0 (equació):
     Ty y   Ts1 Tf1 Tl1 Ta1 Tr1  − f ( x₀ )   Teq =
     Tf2 Tp2 Tl2 Ta2 Tr2  f ′ ( x₀ )          Tl3 Tx Ts3 Ta3 Tr3  ( x − x₀ )
     TV f(x₀)   TM f'(x₀)   TK constant de m(x − x₀)   TN terme independent final
     TZ el 0 quan el pendent és 0
   Prefixos de la fila 1: G/g per a f(x₀), D/d per a f'(x), q per a la derivada.
   ═══════════════════════════════════════════════════════════════════ */
(function (arrel) {
'use strict';

const M = arrel.Mates;
const F = arrel.Formules;
const {Fraccio, texNombre, texEntreParentesis, texPolinomi} = M;
const {clau: K, op: O, rel: R} = F;


/* ── 1. DADES ──────────────────────────────────────────────────────── */

const MAX_COEF = 9;
const MAX_PUNT = 5;
const MAX_GRAU = 3;
const COEFS = ['a0', 'a1', 'a2', 'a3'];        // índex = grau

const PER_DEFECTE = Object.freeze({a3: 0, a2: 2, a1: -3, a0: 1, x0: 2});

const EXEMPLES = Object.freeze([
  PER_DEFECTE,
  {a3: 1, a2: 0, a1: -3, a0: 1, x0: -1},       // pendent 0 i x₀ negatiu
  {a3: 0, a2: 1, a1: -4, a0: 5, x0: 2},        // vèrtex d'una paràbola
  {a3: 0, a2: -1, a1: 5, a0: 0, x0: 1},
  {a3: -1, a2: 3, a1: 0, a0: -2, x0: 3},       // f(x₀) negatiu
]);

/** Termes de f, de més a menys grau. */
const termesDe = v => M.termes(COEFS.map(id => v[id]));

/** Article davant d'un nombre: «l'1», «l'11», «el 3», «el −2». */
const article = v => (v.igual(1) || v.igual(11) ? "l'" : 'el ');

/** Text d'error si els valors no són vàlids; si ho són, null. */
function valida(v) {
  const enter = (x, max) => Number.isInteger(x) && Math.abs(x) <= max;
  if (!COEFS.every(id => enter(v[id], MAX_COEF))) return `Els coeficients han de ser enters entre −${MAX_COEF} i ${MAX_COEF}.`;
  if (!enter(v.x0, MAX_PUNT)) return `El punt x₀ ha de ser un enter entre −${MAX_PUNT} i ${MAX_PUNT}.`;
  if (!v.a3 && !v.a2 && !v.a1) return 'La funció ha de dependre de x: posa algun coeficient de x diferent de 0.';
  return null;
}


/* ── 2. ADREÇA ─────────────────────────────────────────────────────── */

/**
 * Llegeix els paràmetres de l'adreça: {f: '2x^2-3x+1', x0: '2'}.
 * Torna {valors} o {error}. Els que falten prenen el valor per defecte.
 */
function llegeixAdreca(p) {
  const v = Object.assign({}, PER_DEFECTE);
  try {
    if (p.f !== undefined) {
      const coefs = M.polinomi(M.llegeix(p.f));
      if (!coefs) return {error: `La funció de l'adreça, «${p.f}», no és un polinomi. De moment, aquest procediment només treballa amb polinomis.`};
      if (coefs.length - 1 > MAX_GRAU) return {error: `La funció de l'adreça, «${p.f}», és de grau ${coefs.length - 1}. De moment, el grau màxim és ${MAX_GRAU}.`};
      if (!coefs.every(c => c.esEnter())) return {error: `La funció de l'adreça, «${p.f}», té coeficients que no són enters.`};
      COEFS.forEach((id, n) => { v[id] = coefs[n] ? coefs[n].num : 0; });
    }
    if (p.x0 !== undefined) {
      const x0 = M.llegeixNombre(p.x0);
      if (!x0.esEnter()) return {error: `El punt de l'adreça, «${p.x0}», no és un nombre enter.`};
      v.x0 = x0.num;
    }
  } catch (e) {
    if (e instanceof M.ErrorLectura) return {error: `No entenc l'adreça: ${e.message}`};
    throw e;
  }
  const error = valida(v);
  return error ? {error: `L'adreça no es pot fer servir. ${error}`} : {valors: v};
}

/** Paràmetres de l'adreça per a uns valors: {f: '2x^2-3x+1', x0: '2'}. */
function escriuAdreca(v) {
  return {f: M.textPolinomi(termesDe(v)), x0: String(v.x0)};
}


/* ── 3. TEXTOS ─────────────────────────────────────────────────────── */

function enunciat(v) {
  return `Troba l'equació de la recta tangent a la gràfica de $f(x) = ${texPolinomi(termesDe(v))}$ en el punt d'abscissa $x = ${texNombre(v.x0)}$.`;
}

/** Resum en TeX, per als exemples i per a l'editor. */
function resum(v) {
  return `f(x) = ${texPolinomi(termesDe(v))},\\ \\ x_0 = ${texNombre(v.x0)}`;
}

/** Com es deriva cada tipus de terme de f. */
function regles(f) {
  const r = [];
  if (f.some(t => t.n >= 2)) r.push('L\'exponent baixa multiplicant i es redueix en $1$.');
  const lineal = f.find(t => t.n === 1);
  if (lineal) r.push(`$${texPolinomi([lineal])}$ passa a $${texNombre(lineal.c)}$.`);
  if (f.some(t => t.n === 0)) r.push('La constant desapareix.');
  return r.join(' ');
}


/* ── 4. PASSOS ─────────────────────────────────────────────────────── */

function passos(v) {
  const f = termesDe(v);
  const d = M.derivaTermes(f);
  const x0 = Fraccio.de(v.x0);
  const fx0 = M.valorTermes(f, x0);             // f(x₀)
  const m = M.valorTermes(d, x0);               // f'(x₀), el pendent
  const k = m.producte(x0).oposada();           // m·(x − x₀) = m·x + k
  const n = k.suma(fx0);                        // y = m·x + n
  const X = texNombre(x0), Xp = texEntreParentesis(x0);
  const signeDe = v => (v.signe() < 0 ? '-' : '+');
  const g = F.guio(2);

  /* Peces de l'equació (fila 0). */
  const y = K('Ty', 'y'), igual = R('Teq', '=');
  const fDe = a => O('Ts1', '-') + K('Tf1', 'f') + K('Tl1', '(') + K('Ta1', a) + K('Tr1', ')');
  const derDe = a => K('Tf2', 'f') + `^{${K('Tp2', '\\prime')}}` + K('Tl2', '(') + K('Ta2', a) + K('Tr2', ')');
  const parentesi = (s, a) => '\\,' + K('Tl3', '(') + K('Tx', 'x') + O('Ts3', s) + K('Ta3', a) + K('Tr3', ')');

  /* 1. La fórmula, amb x₀. */
  g.files[0] = y + fDe('x_0') + igual + derDe('x_0') + parentesi('-', 'x_0');
  g.afegeix('Aquesta és l\'equació de la recta tangent en el punt d\'abscissa $x_0$. Necessites dos nombres: $f(x_0)$ i $f\'(x_0)$.');

  let dreta = parentesi('-', Xp);
  g.files[0] = y + fDe(X) + igual + derDe(X) + dreta;
  g.afegeix(`Substitueix $x_0 = ${X}$.`, {cursor: {clic: 'Ta3'}});
  if (x0.signe() < 0) {
    dreta = parentesi('+', texNombre(x0.abs()));
    g.files[0] = y + fDe(X) + igual + derDe(X) + dreta;
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
  g.files[0] = esquerra + igual + derDe(X) + dreta;
  g.files[1] = '';
  g.afegeix(`Porta ${article(fx0)}$${texNombre(fx0)}$ a l'equació, al lloc de $f(${X})$.`, {
    reanomena: {TV: resultatF.valor},
    fusiona: {TV: ['Tf1', 'Tl1', 'Ta1', 'Tr1'].concat(resultatF.signe ? [resultatF.signe] : [])},
    cursor: {arrossega: resultatF.valor, fins: 'TV'},
  });
  if (fx0.signe() < 0) {
    esquerra = y + O('Ts1', '+') + K('TV', texNombre(fx0.abs()));
    g.files[0] = esquerra + igual + derDe(X) + dreta;
    g.afegeix(`Simplifica: $y - ${texEntreParentesis(fx0)} = y + ${texNombre(fx0.abs())}$.`, {cursor: {clic: 'Ts1'}});
  } else if (fx0.esZero()) {
    esquerra = y;
    g.files[0] = esquerra + igual + derDe(X) + dreta;
    g.afegeix('Simplifica: $y - 0 = y$.', {cursor: {clic: 'Ts1'}});
  }

  /* 3. f'(x), a la fila 1. */
  const derX = F.membreEsquerre('D', 'f', 'x', true);
  g.files[1] = derX + F.derivadaIndicada('d', f);
  g.afegeix('Ara calcula la derivada, $f\'(x)$.');
  g.files[1] = derX + F.derivadaBaixada('d', f);
  g.afegeix(`Deriva terme a terme. ${regles(f)}`, {cursor: {clic: 'dQ'}});
  const feta = F.derivadaFeta('d', 'q', f);
  let reanomenaPendent = {};
  if (feta.multiplica) {
    const primer = f.find(t => t.n >= 2 && !Fraccio.de(t.c).abs().igual(1));
    g.files[1] = derX + feta.tex;
    g.afegeix(`Multiplica: $f'(x) = ${texPolinomi(d)}$.`, {fusiona: feta.fusiona, reanomena: feta.reanomena, cursor: {clic: 'dm' + primer.n}});
  } else {
    reanomenaPendent = feta.reanomena;          // el text no canvia: les claus noves van al pas següent
  }

  /* 4. f'(x₀), a la mateixa fila. */
  const derX0 = F.membreEsquerre('D', 'f', X, true);
  g.files[1] = derX0 + F.substituit('q', d, x0);
  g.afegeix(`Calcula $f'(${X})$: substitueix $x$ per $${Xp}$.`, {reanomena: reanomenaPendent, cursor: {clic: 'DX'}});
  g.files[1] = derX0 + F.avaluat('q', d, x0);
  g.afegeix('Calcula cada terme.', {fusiona: F.fusionsAvaluat('q', d), cursor: {clic: d[0].n >= 1 ? 'qv' + d[0].n : null}});
  if (d.length > 1) {
    g.files[1] = derX0 + F.resultat('q', m);
    g.afegeix(`Opera: $f'(${X}) = ${texNombre(m)}$.`, {fusiona: F.fusionsResultat('q', d, x0), cursor: {clic: 'qs' + d[1].n}});
  }

  /* El resultat puja a l'equació, al lloc de f'(x₀). */
  const resultatD = F.clausResultat('q', d, x0);
  g.files[0] = esquerra + igual + K('TM', texNombre(m)) + dreta;
  g.files[1] = '';
  g.afegeix(`Porta ${article(m)}$${texNombre(m)}$ a l'equació, al lloc de $f'(${X})$. És el pendent de la recta.`, {
    reanomena: {TM: resultatD.valor},
    fusiona: {TM: ['Tf2', 'Tp2', 'Tl2', 'Ta2', 'Tr2'].concat(resultatD.signe ? [resultatD.signe] : [])},
    cursor: {arrossega: resultatD.valor, fins: 'TM'},
  });

  /* 5. Simplifica l'equació fins a y = m·x + n. */
  const passaCap = `Passa el $${fx0.signe() > 0 ? '-' : '+'}${texNombre(fx0.abs())}$ a l'altre costat: hi arriba canviat de signe.`;
  if (!m.esZero()) {
    const mx = (m.igual(1) ? '' : K('TM', m.igual(-1) ? '-' : texNombre(m))) + K('Tx', 'x');
    const constant = k.esZero() ? '' : O('Ts3', signeDe(k)) + K('TK', texNombre(k.abs()));
    g.files[0] = esquerra + igual + mx + constant;
    g.afegeix(
      `Multiplica ${article(m)}$${texNombre(m)}$ per cada terme del parèntesi` + (x0.esZero() ? ': el segon terme dona $0$.' : '.'),
      {fusiona: k.esZero() ? {} : {TK: ['Ta3']}, cursor: m.igual(1) ? {clic: 'TM'} : {arrossega: 'TM'}});
    if (!fx0.esZero()) {
      g.files[0] = y + igual + mx + constant + O('Ts1', fx0.signe() > 0 ? '+' : '-') + K('TV', texNombre(fx0.abs()));
      g.afegeix(passaCap, {cursor: {arrossega: 'TV'}});
      if (!k.esZero()) {
        g.files[0] = y + igual + mx + (n.esZero() ? '' : O('Ts3', signeDe(n)) + K('TN', texNombre(n.abs())));
        g.afegeix(`Opera: $${texNombre(k)} ${fx0.signe() < 0 ? '-' : '+'} ${texNombre(fx0.abs())} = ${texNombre(n)}$.`,
          {fusiona: n.esZero() ? {} : {TN: ['TK', 'Ts1', 'TV']}, cursor: {clic: 'TK'}});   // si n = 0, s'anul·len
      }
    }
  } else {
    g.files[0] = esquerra + igual + K('TZ', '0');
    g.afegeix('Qualsevol nombre multiplicat per $0$ dona $0$.',
      {fusiona: {TZ: ['TM', 'Tl3', 'Tx', 'Ts3', 'Ta3', 'Tr3']}, cursor: {clic: 'TM'}});
    if (!fx0.esZero()) {
      g.files[0] = y + igual + (fx0.signe() < 0 ? K('Ts1', '-') : '') + K('TV', texNombre(fx0.abs()));
      g.afegeix(passaCap, {fusiona: {TV: ['TZ']}, cursor: {arrossega: 'TV'}});
    }
  }

  /* 6. El resultat. */
  const recta = 'y = ' + (m.esZero() ? texNombre(fx0) : texPolinomi(M.termes([n, m])));
  g.classes[0] = 'final';
  g.afegeix(`Aquesta és la recta tangent: $${recta}$.` + (m.esZero() ? ' És horitzontal, perquè el pendent és $0$.' : ''));

  return g.passos;
}


/* ── 5. DEFINICIÓ DEL PROCEDIMENT ──────────────────────────────────── */

/** Camp de l'editor de fletxes (vegeu README.md). */
const camp = (id, sufix, nom, max, signe, atenua0) => ({id, sufix, nom, min: -max, max, signe, atenua0});

arrel.RectaTangent = Object.freeze({
  titol: 'Recta tangent',
  categoria: 'analisi',
  files: 2,
  perDefecte: PER_DEFECTE,
  exemples: EXEMPLES,
  titolEditor: 'Canvia la funció i el punt',
  notaEditor: `Els coeficients van de −${MAX_COEF} a ${MAX_COEF}, i el punt, de −${MAX_PUNT} a ${MAX_PUNT}.`,
  editor: [
    {etiqueta: 'f(x) =', camps: [
      camp('a3', 'x^3', 'coeficient de x al cub', MAX_COEF, 'negatiu', true),
      camp('a2', 'x^2', 'coeficient de x al quadrat', MAX_COEF, 'sempre', true),
      camp('a1', 'x', 'coeficient de x', MAX_COEF, 'sempre', true),
      camp('a0', '', 'terme independent', MAX_COEF, 'sempre', true),
    ]},
    {etiqueta: 'x_0 =', camps: [camp('x0', '', 'punt x zero', MAX_PUNT, 'negatiu', false)]},
  ],
  valida, llegeixAdreca, escriuAdreca, enunciat, resum, passos,
});

})(globalThis);
