/* ═══════════════════════════════════════════════════════════════════
   barrow.js — Procediment: la integral definida (regla de Barrow)
   ───────────────────────────────────────────────────────────────────
   Dades: f(x), un polinomi de grau 3 com a màxim (coeficients enters
   entre −9 i 9), i els límits a < b, enters entre −5 i 5.
   Adreça: barrow.html?f=3x^2-2x&a=0&b=2

   Passos:
     1. ∫_a^b f(x) dx i la regla de Barrow: F(b) − F(a), amb F una
        primitiva qualsevol (la de C = 0);
     2. F(x), terme a terme;
     3. F(b) i F(a), pas a pas;
     4. el resultat, F(b) − F(a) (pot ser negatiu: no és una àrea).
   Totes les línies que es veuen són certes: ho comprova proves/comprova.js.
   Claus: k… la integral (prefix k), If F(b) − F(a), In, Iv el resultat;
   Gl… F(x) (prefixos i, j); B…/b… F(b), A…/a… F(a) (vegeu Formules).
   ═══════════════════════════════════════════════════════════════════ */
(function (arrel) {
'use strict';

const M = arrel.Mates;
const F = arrel.Formules;
const Dd = arrel.Dades;
const {Fraccio, texNombre, texEntreParentesis, texPolinomi} = M;
const {clau: K, rel: R} = F;

const MAX_COEF = 9, MAX_PUNT = 5;
const PER_DEFECTE = Object.freeze({a3: 0, a2: 3, a1: -2, a0: 0, a: 0, b: 2});
const EXEMPLES = Object.freeze([
  PER_DEFECTE,
  {a3: 0, a2: 0, a1: 2, a0: 1, a: 1, b: 3},           // una recta
  {a3: 1, a2: 0, a1: -4, a0: 0, a: -1, b: 2},          // límits negatius
  {a3: 0, a2: 1, a1: -1, a0: -2, a: 0, b: 1},          // resultat negatiu (f < 0)
  {a3: 1, a2: -3, a1: 0, a0: 2, a: -1, b: 1},          // fraccions a F
]);
const {termesDe} = Dd;

function valida(v) {
  const error = Dd.validaFuncio(v, MAX_COEF);
  if (error) return error;
  if (![v.a, v.b].every(x => Number.isInteger(x) && Math.abs(x) <= MAX_PUNT)) return `Els límits d'integració han de ser enters entre −${MAX_PUNT} i ${MAX_PUNT}.`;
  if (v.a >= v.b) return 'Els límits han de complir a < b.';
  return null;
}

function llegeixAdreca(p) {
  const v = Object.assign({}, PER_DEFECTE);
  try {
    if (p.f !== undefined) {
      const error = Dd.llegeixFuncio(p.f, v, 3);
      if (error) return {error};
    }
    for (const id of ['a', 'b']) {
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
const escriuAdreca = v => ({f: Dd.textFuncio(v), a: String(v.a), b: String(v.b)});
const texIntegral = v => `\\int_{${v.a}}^{${v.b}} ${termesDe(v).length > 1 ? `(${texPolinomi(termesDe(v))})` : texPolinomi(termesDe(v))}\\,dx`;
const enunciat = v => `Calcula la integral definida $${texIntegral(v)}$.`;
const resum = v => texIntegral(v);

/** Files de la pissarra. */
const FILA = Object.freeze({integral: 0, primitiva: 1, fb: 2, fa: 3});

function passos(v) {
  const f = termesDe(v);
  const Fx = M.integraTermes(f);
  const g = F.guio(4);
  const [a, b] = [Fraccio.de(v.a), Fraccio.de(v.b)];
  const integral = F.integralIndicada('k', f, [texNombre(a), texNombre(b)]);
  g.files[FILA.integral] = integral;
  g.afegeix('Regla de Barrow: si $F$ és una primitiva de $f$, $\\int_a^b f(x)\\,dx = F(b) - F(a)$. Qualsevol primitiva serveix (la $C$ s\'anul·la en restar): agafa la de $C = 0$.');
  const barrow = R('Iq', '=') + K('If', `F(${texNombre(b)}) - F(${texNombre(a)})`);
  g.files[FILA.integral] = integral + barrow;
  g.afegeix(`Escriu-ho: $F(${texNombre(b)}) - F(${texNombre(a)})$, el límit de dalt menys el de baix.`);
  F.passosIntegral(g, FILA.primitiva, F.membreEsquerre('G', 'F', 'x'), f, {C: false,
    textos: {indicada: 'Primer, una primitiva: $F(x) = \\int f(x)\\,dx$.', feta: `Simplifica: $F(x) = ${texPolinomi(Fx)}$.`}});

  /* F(b) i F(a), pas a pas. */
  function calcula(fila, L, P, x) {
    const X = texNombre(x), Fv = M.valorTermes(Fx, x);
    const membre = F.membreEsquerre(L, 'F', X);
    g.files[fila] = membre + F.substituit(P, Fx, x);
    g.afegeix(`Calcula $F(${X})$: substitueix $x$ per $${texEntreParentesis(x)}$.`);
    g.files[fila] = membre + F.avaluat(P, Fx, x);
    g.afegeix('Calcula cada terme.', {fusiona: F.fusionsAvaluat(P, Fx)});
    if (Fx.length > 1) {
      g.files[fila] = membre + F.resultat(P, Fv);
      g.afegeix(`Opera: $F(${X}) = ${texNombre(Fv)}$.`, {fusiona: F.fusionsResultat(P, Fx, x)});
    }
    return Fv;
  }
  const Fb = calcula(FILA.fb, 'B', 'b', b);
  const Fa = calcula(FILA.fa, 'A', 'a', a);
  const valor = Fb.resta(Fa);
  g.files[FILA.integral] = integral + barrow + R('Ir', '=') + K('In', `${texNombre(Fb)} - ${texEntreParentesis(Fa)}`) + R('Is', '=') + K('Iv', texNombre(valor));
  g.classes[FILA.integral] = 'final';
  g.afegeix(`$F(${texNombre(b)}) - F(${texNombre(a)}) = ${texNombre(Fb)} - ${texEntreParentesis(Fa)} = ${texNombre(valor)}$.`
    + (valor.signe() < 0 ? ' La integral surt negativa: és possible, perquè no és una àrea (on $f < 0$, compta en negatiu).' : ''));
  return g.passos;
}

arrel.Barrow = Object.freeze({
  titol: 'Integral definida: regla de Barrow',
  categoria: 'analisi',
  files: 4,
  perDefecte: PER_DEFECTE,
  exemples: EXEMPLES,
  titolEditor: 'Canvia la funció i els límits',
  notaEditor: `Els coeficients van de −${MAX_COEF} a ${MAX_COEF}; els límits, de −${MAX_PUNT} a ${MAX_PUNT}, amb a < b.`,
  editor: [
    Dd.campsFuncio(MAX_COEF),
    {etiqueta: 'a =', camps: [Dd.camp('a', '', 'límit inferior a', MAX_PUNT, 'negatiu', false)]},
    {etiqueta: 'b =', camps: [Dd.camp('b', '', 'límit superior b', MAX_PUNT, 'negatiu', false)]},
  ],
  FILA,
  valida, llegeixAdreca, escriuAdreca, enunciat, resum, passos,
});

})(globalThis);
