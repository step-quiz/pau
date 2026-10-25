/* ═══════════════════════════════════════════════════════════════════
   primitiva.js — Procediment: la primitiva que compleix una condició
   ───────────────────────────────────────────────────────────────────
   Dades: f(x), un polinomi de grau 3 com a màxim (coeficients enters
   entre −9 i 9), i una condició F(x₀) = y₀ (x₀ entre −5 i 5, y₀ entre
   −20 i 20).
   Adreça: primitiva.html?f=6x^2-4x+1&x0=1&y0=3

   Passos:
     1. F(x) = ∫ f(x) dx: la regla ∫ xⁿ dx = xⁿ⁺¹/(n + 1) terme a terme,
        i la primitiva simplificada, + C (totes les primitives);
     2. la condició: F(x₀) = y₀, amb F(x₀) calculada pas a pas; en surt C;
     3. la resposta, i la comprovació: F(x₀) = y₀.
   Totes les línies que es veuen són certes: ho comprova proves/comprova.js.
   Claus: Ff f(x) (prefix p); Gl… F(x) =, i la integral (prefix i) i la
   primitiva (prefix j); Hc… la condició (prefix q, i k per a la C); Cc el valor de C; Rp la
   resposta (prefix r); Tl… la comprovació (prefix t).
   ═══════════════════════════════════════════════════════════════════ */
(function (arrel) {
'use strict';

const M = arrel.Mates;
const F = arrel.Formules;
const Dd = arrel.Dades;
const {Fraccio, texNombre, texEntreParentesis, texPolinomi} = M;
const {clau: K, rel: R} = F;

const MAX_COEF = 9, MAX_X0 = 5, MAX_Y0 = 20;
const PER_DEFECTE = Object.freeze({a3: 0, a2: 6, a1: -4, a0: 1, x0: 1, y0: 3});
const EXEMPLES = Object.freeze([
  PER_DEFECTE,
  {a3: 0, a2: 3, a1: 0, a0: -2, x0: 2, y0: 5},           // F(2) = 8 − 4 + C
  {a3: 4, a2: 0, a1: -6, a0: 0, x0: -1, y0: 0},           // amb un punt negatiu
  {a3: 0, a2: 0, a1: 2, a0: 3, x0: 0, y0: -4},            // a x = 0: C és directament y₀
  {a3: 1, a2: -1, a1: 1, a0: 0, x0: 2, y0: 1},            // coeficients fraccionaris
]);
const {termesDe} = Dd;

function valida(v) {
  const error = Dd.validaFuncio(v, MAX_COEF);
  if (error) return error;
  if (!Number.isInteger(v.x0) || Math.abs(v.x0) > MAX_X0) return `x₀ ha de ser un enter entre −${MAX_X0} i ${MAX_X0}.`;
  if (!Number.isInteger(v.y0) || Math.abs(v.y0) > MAX_Y0) return `y₀ ha de ser un enter entre −${MAX_Y0} i ${MAX_Y0}.`;
  return null;
}

function llegeixAdreca(p) {
  const v = Object.assign({}, PER_DEFECTE);
  try {
    if (p.f !== undefined) {
      const error = Dd.llegeixFuncio(p.f, v, 3);
      if (error) return {error};
    }
    for (const id of ['x0', 'y0']) {
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
const escriuAdreca = v => ({f: Dd.textFuncio(v), x0: String(v.x0), y0: String(v.y0)});
const enunciat = v => `Troba la primitiva $F(x)$ de la funció $f(x) = ${texPolinomi(termesDe(v))}$ que compleix $F(${v.x0}) = ${v.y0}$.`;
const resum = v => `f(x) = ${texPolinomi(termesDe(v))},\\ \\ F(${v.x0}) = ${v.y0}`;

/** Files de la pissarra. */
const FILA = Object.freeze({funcio: 0, primitiva: 1, condicio: 2, resposta: 3, comprovacio: 4});

function passos(v) {
  const f = termesDe(v);
  const Fx = M.integraTermes(f);
  const g = F.guio(5);
  const x0 = Fraccio.de(v.x0), y0 = Fraccio.de(v.y0);

  g.files[FILA.funcio] = F.membreEsquerre('Ff', 'f', 'x') + F.polinomi('p', f);
  g.afegeix('Una primitiva de $f$ és una funció $F$ que té $f$ per derivada: $F\'(x) = f(x)$. Totes les primitives són $\\int f(x)\\,dx$, i es diferencien en una constant.');
  const Gl = F.membreEsquerre('G', 'F', 'x');
  F.passosIntegral(g, FILA.primitiva, Gl, f, {textos: {feta: `Simplifica: $F(x) = ${texPolinomi(Fx)} + C$. Cada valor de $C$ dona una primitiva diferent.`}});

  /* La condició: F(x0) = y0. */
  const X = texNombre(x0), Fx0 = M.valorTermes(Fx, x0);
  const dreta = R('Hz', '=') + K('Hy', texNombre(y0));
  const C0 = y0.resta(Fx0);
  g.files[FILA.condicio] = K('Hc', `F(${X}) = ${texNombre(y0)}`);
  g.afegeix(`De totes les primitives, en volem una de concreta: la que compleix $F(${X}) = ${texNombre(y0)}$. Aquesta condició dona el valor de $C$.`);
  g.files[FILA.condicio] = F.substituit('q', Fx, x0) + F.mesC('k') + dreta;
  g.afegeix(`Substitueix $x = ${texEntreParentesis(x0)}$ a $F(x)$ (la $C$ es queda com està) i iguala-ho a $${texNombre(y0)}$.`);
  g.files[FILA.condicio] = F.avaluat('q', Fx, x0) + F.mesC('k') + dreta;
  g.afegeix('Calcula cada terme.', {fusiona: F.fusionsAvaluat('q', Fx)});
  if (Fx.length > 1) {
    g.files[FILA.condicio] = F.resultat('q', Fx0) + F.mesC('k') + dreta;
    g.afegeix(`Opera: $${texNombre(Fx0)} + C = ${texNombre(y0)}$.`, {fusiona: F.fusionsResultat('q', Fx, x0)});
  }
  g.files[FILA.condicio] = K('kK', 'C') + R('Hz', '=') + K('Hy', texNombre(y0)) + (Fx0.esZero() ? '' : F.op('Hm', Fx0.signe() < 0 ? '+' : '-') + K('Hv', texNombre(Fx0.abs())))
    + R('Hw', '=') + K('Cc', texNombre(C0));
  g.afegeix(Fx0.esZero() ? `$F(${X})$ sense la $C$ val $0$: $C = ${texNombre(y0)}$.`
    : `Aïlla $C$: el $${texNombre(Fx0)}$ passa a l'altre costat canviat de signe. $C = ${texNombre(C0)}$.`);

  /* La resposta i la comprovació. */
  const resposta = C0.esZero() ? Fx : M.termes(M.sumaPolinomis(M.coeficientsDe(Fx), [C0]));
  g.files[FILA.resposta] = F.membreEsquerre('Rl', 'F', 'x') + F.polinomi('r', resposta);
  g.classes[FILA.resposta] = 'final';
  g.afegeix(`Posa $C = ${texNombre(C0)}$ a $F(x)$. Resposta: $F(x) = ${texPolinomi(resposta)}$.`);
  const T = F.membreEsquerre('T', 'F', X);
  g.files[FILA.comprovacio] = T + F.substituit('t', resposta, x0);
  g.afegeix(`Comprovació: calcula $F(${X})$ amb la primitiva que has trobat.`);
  g.files[FILA.comprovacio] = T + F.avaluat('t', resposta, x0);
  g.afegeix('Calcula cada terme.', {fusiona: F.fusionsAvaluat('t', resposta)});
  if (resposta.length > 1) {
    g.files[FILA.comprovacio] = T + F.resultat('t', y0);
    g.afegeix(`$F(${X}) = ${texNombre(y0)}$, com havia de ser.`, {fusiona: F.fusionsResultat('t', resposta, x0)});
  }
  return g.passos;
}

arrel.Primitiva = Object.freeze({
  titol: 'Primitiva amb una condició',
  categoria: 'analisi',
  files: 5,
  perDefecte: PER_DEFECTE,
  exemples: EXEMPLES,
  titolEditor: 'Canvia la funció i la condició',
  notaEditor: `Els coeficients van de −${MAX_COEF} a ${MAX_COEF}; x₀, de −${MAX_X0} a ${MAX_X0}; y₀, de −${MAX_Y0} a ${MAX_Y0}.`,
  editor: [
    Dd.campsFuncio(MAX_COEF),
    {etiqueta: 'x_0 =', camps: [Dd.camp('x0', '', 'x₀', MAX_X0, 'negatiu', false)]},
    {etiqueta: 'F(x_0) =', camps: [Dd.camp('y0', '', 'y₀', MAX_Y0, 'negatiu', false)]},
  ],
  FILA,
  valida, llegeixAdreca, escriuAdreca, enunciat, resum, passos,
});

})(globalThis);
