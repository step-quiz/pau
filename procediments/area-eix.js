/* ═══════════════════════════════════════════════════════════════════
   area-eix.js — Procediment: àrea entre una corba i l'eix OX
   ───────────────────────────────────────────────────────────────────
   Dades: f(x), un polinomi de grau 3 com a màxim (coeficients enters
   entre −9 i 9, arrels racionals), i l'interval [a, b] (enters entre
   −5 i 5, a < b).
   Adreça: area-eix.html?f=x^3-4x&a=-2&b=2

   Passos:
     1. la gràfica, amb la zona ombrejada;
     2. on talla l'eix: f(x) = 0 (Matrius.passosArrels: factor comú,
        Ruffini, segon grau); les arrels de dins de (a, b) parteixen
        l'interval en trossos;
     3. el signe de f a cada tros (en el punt mitjà);
     4. una primitiva F(x) (C = 0);
     5. la integral de cada tros, per Barrow;
     6. l'àrea: la suma dels valors absoluts (on f < 0, la integral és
        negativa; sense separar, els trossos es compensarien).
   Totes les línies que es veuen són certes: ho comprova proves/comprova.js.
   Claus: Ff… f(x) (prefix p); Z… les arrels; S<k> el signe de cada tros;
   Gl… F(x) (prefixos i, j); J<k> la integral de cada tros; A… l'àrea.
   ═══════════════════════════════════════════════════════════════════ */
(function (arrel) {
'use strict';

const M = arrel.Mates;
const F = arrel.Formules;
const Dd = arrel.Dades;
const Mt = arrel.Matrius;
const Gr = arrel.Grafiques;
const {Fraccio, texNombre, texEntreParentesis, texPolinomi} = M;
const {clau: K, rel: R} = F;

const MAX_COEF = 9, MAX_PUNT = 5;
const PER_DEFECTE = Object.freeze({a3: 1, a2: 0, a1: -4, a0: 0, a: -2, b: 2});
const EXEMPLES = Object.freeze([
  PER_DEFECTE,                                       // dos trossos que es compensen: ∫ = 0, però A = 8
  {a3: 0, a2: -1, a1: 0, a0: 4, a: -2, b: 2},         // la zona tancada per la corba i l'eix
  {a3: 0, a2: 1, a1: 0, a0: -1, a: 0, b: 3},          // un tall dins de l'interval
  {a3: 0, a2: 0, a1: 2, a0: 1, a: 1, b: 3},           // cap tall dins de l'interval
  {a3: 0, a2: 1, a1: -5, a0: 6, a: 0, b: 4},          // tres trossos
]);
const {termesDe} = Dd;
const coefs = v => [v.a0, v.a1, v.a2, v.a3].map(x => Fraccio.de(x));

function valida(v) {
  const error = Dd.validaFuncio(v, MAX_COEF);
  if (error) return error;
  if (![v.a, v.b].every(x => Number.isInteger(x) && Math.abs(x) <= MAX_PUNT)) return `Els extrems de l'interval han de ser enters entre −${MAX_PUNT} i ${MAX_PUNT}.`;
  if (v.a >= v.b) return 'L\'interval ha de complir a < b.';
  const p = coefs(v);
  while (p.length > 1 && p[p.length - 1].esZero()) p.pop();
  const problema = Mt.problemaArrels(p);
  if (problema === 'irracionals' || problema === 'sense arrel entera') return 'Els talls de f amb l\'eix no són nombres racionals: aquest procediment no els pot trobar exactament. Tria una altra funció.';
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
const enunciat = v => `Calcula l'àrea de la regió limitada per la corba $y = ${texPolinomi(termesDe(v))}$, l'eix $OX$ i les rectes $x = ${v.a}$ i $x = ${v.b}$.`;
const resum = v => `y = ${texPolinomi(termesDe(v))},\\ \\ [${v.a}, ${v.b}]`;

/** Files de la pissarra: les tres de la resolució de f(x) = 0 es reaprofiten després. */
const FILA = Object.freeze({funcio: 0, grafica: 1, equacio: 2, prova: 3, ruffini: 4, segon: 5, area: 6,
  signes: 3, primitiva: 4, integrals: 5});

const llista = (linies, espai = '8pt') => (linies.length > 1 ? `\\begin{array}{l} ${linies.join(` \\\\[${espai}] `)} \\end{array}` : linies[0]);
const texInterval = (l, r) => `[${texNombre(l)},\\ ${texNombre(r)}]`;

function passos(v) {
  const f = termesDe(v);
  const Fx = M.integraTermes(f);
  const val = x => M.valorTermes(f, x), Fv = x => M.valorTermes(Fx, x);
  const [a, b] = [Fraccio.de(v.a), Fraccio.de(v.b)];
  const g = F.guio(7);
  g.files[FILA.funcio] = F.membreEsquerre('Ff', 'f', 'x') + F.polinomi('p', f);
  g.afegeix(`L'àrea entre la corba i l'eix $OX$, de $x = ${v.a}$ a $x = ${v.b}$. On $f$ és negativa, la integral surt negativa: `
    + 'cal separar els trossos on $f$ canvia de signe i sumar-ne els valors absoluts.');

  /* On talla l'eix: f(x) = 0. */
  const p = coefs(v);
  while (p.length > 1 && p[p.length - 1].esZero()) p.pop();
  const arrels = Mt.passosArrels(g, {p, X: 'x', files: FILA, inici: 'On talla l\'eix $OX$? Resol l\'equació $f(x) = 0$.'});
  const dins = arrels.filter(r => r.resta(a).signe() > 0 && b.resta(r).signe() > 0);
  const punts = [a].concat(dins, [b]);
  const trossos = punts.slice(1).map((r, k) => [punts[k], r]);
  [FILA.prova, FILA.ruffini, FILA.segon].forEach(i => { g.files[i] = ''; });
  g.files[FILA.equacio] = K('Zf', 'f(x) = 0') + ':\\quad ' + K('Zs', arrels.length ? arrels.map(r => `x = ${texNombre(r)}`).join(',\\ ') : '\\text{cap solució}');
  g.afegeix((arrels.length ? `La corba talla l'eix a $${arrels.map(r => `x = ${texNombre(r)}`).join('$, $')}$. ` : 'La corba no talla l\'eix. ')
    + (dins.length ? `Dins de l'interval $(${v.a}, ${v.b})$ hi ha $${dins.map(r => `x = ${texNombre(r)}`).join('$ i $')}$: parteix${dins.length > 1 ? 'en' : ''} l'interval en ${trossos.length} trossos.`
      : `Cap tall no és dins de l'interval $(${v.a}, ${v.b})$: $f$ té el mateix signe a tot l'interval.`));

  /* La gràfica, amb els trossos ombrejats. */
  const xs = Gr.finestra([a, b]);
  const signes = trossos.map(([l, r]) => val(l.suma(r).quocient(2)).signe());
  g.files[FILA.grafica] = Gr.grafica({corbes: [{termes: f, nom: 'f'}], x: xs, marques: punts,
    zones: trossos.map(([l, r], k) => ({l, r, dalt: 0, baix: null, classe: signes[k] > 0 ? 'zona' : 'zona2'}))});
  g.afegeix('La regió, ombrejada: d\'un color on la corba és per sobre de l\'eix ($f > 0$), i d\'un altre on és per sota ($f < 0$).');

  /* El signe de f a cada tros. */
  g.files[FILA.signes] = llista(trossos.map(([l, r], k) => {
    const m = l.suma(r).quocient(2), fm = val(m);
    return K(`S${k}`, `${texInterval(l, r)}:\\quad f\\left(${texNombre(m)}\\right) = ${texNombre(fm)} ${fm.signe() > 0 ? '> 0' : '< 0'}`);
  }));
  g.afegeix('A cada tros, $f$ no canvia de signe: n\'hi ha prou de mirar-lo en un punt (el del mig).');

  /* Una primitiva, i la integral de cada tros. */
  F.passosIntegral(g, FILA.primitiva, F.membreEsquerre('G', 'F', 'x'), f, {C: false,
    textos: {indicada: 'Una primitiva de $f$ (amb $C = 0$), per aplicar la regla de Barrow a cada tros.', feta: `Simplifica: $F(x) = ${texPolinomi(Fx)}$.`}});
  const integrals = [], linies = [];
  trossos.forEach(([l, r], k) => {
    const I = Fv(r).resta(Fv(l));
    integrals.push(I);
    linies.push(K(`J${k}`, `\\displaystyle\\int_{${texNombre(l)}}^{${texNombre(r)}} f(x)\\,dx = F(${texNombre(r)}) - F(${texNombre(l)}) = `
      + `${texNombre(Fv(r))} - ${texEntreParentesis(Fv(l))} = ${texNombre(I)}`));
    g.files[FILA.integrals] = llista(linies, '12pt');
    g.afegeix(`Barrow al tros $${texInterval(l, r)}$: $F(${texNombre(r)}) = ${texNombre(Fv(r))}$ i $F(${texNombre(l)}) = ${texNombre(Fv(l))}$.`
      + (I.signe() < 0 ? ' Surt negativa: aquí $f < 0$.' : ''));
  });

  /* L'àrea: la suma dels valors absoluts. */
  const A = integrals.reduce((s, I) => s.suma(I.abs()), Fraccio.de(0));
  const abs = integrals.map(I => `\\left|${texNombre(I)}\\right|`).join(' + ');
  const sense = integrals.map(I => texNombre(I.abs())).join(' + ');
  g.files[FILA.area] = K('Al', 'A') + R('Aq', '=') + K('Aa', abs) + (integrals.length > 1 ? R('Ar', '=') + K('Ab', sense) : '') + R('As', '=') + K('Av', texNombre(A));
  g.classes[FILA.area] = 'final';
  g.afegeix(`L'àrea és la suma dels valors absoluts de les integrals. Resposta: $A = ${texNombre(A)}$ unitats quadrades.`
    + (integrals.length > 1 && !integrals.reduce((s, I) => s.suma(I), Fraccio.de(0)).igual(A)
      ? ` (Sense separar els trossos, $\\int_{${v.a}}^{${v.b}} f(x)\\,dx = ${texNombre(integrals.reduce((s, I) => s.suma(I), Fraccio.de(0)))}$: no és l'àrea.)` : ''));
  return g.passos;
}

arrel.AreaEix = Object.freeze({
  titol: 'Àrea entre una corba i l\'eix OX',
  categoria: 'analisi',
  files: 7,
  perDefecte: PER_DEFECTE,
  exemples: EXEMPLES,
  titolEditor: 'Canvia la funció i l\'interval',
  notaEditor: `Els coeficients van de −${MAX_COEF} a ${MAX_COEF}; a i b, de −${MAX_PUNT} a ${MAX_PUNT}, amb a < b. Els talls amb l'eix han de ser racionals.`,
  editor: [
    Dd.campsFuncio(MAX_COEF),
    {etiqueta: 'a =', camps: [Dd.camp('a', '', 'extrem esquerre a', MAX_PUNT, 'negatiu', false)]},
    {etiqueta: 'b =', camps: [Dd.camp('b', '', 'extrem dret b', MAX_PUNT, 'negatiu', false)]},
  ],
  FILA,
  valida, llegeixAdreca, escriuAdreca, enunciat, resum, passos,
});

})(globalThis);
