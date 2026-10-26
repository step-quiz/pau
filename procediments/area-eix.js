/* ═══════════════════════════════════════════════════════════════════
   area-eix.js — Procediment: àrea entre una corba i l'eix OX
   ───────────────────────────────────────────────────────────────────
   Dades: f(x), un polinomi de grau 3 com a màxim (coeficients enters
   entre −9 i 9, arrels racionals), i l'interval [a, b] (enters entre
   −5 i 5, a < b).
   Adreça: area-eix.html?f=x^3-4x&a=-2&b=2

   Passos:
     1. on talla l'eix: f(x) = 0 (Integrals.passosTalls: l'equació es
        queda a la vista i els càlculs van a la fila de treball; factor
        comú, Ruffini, segon grau); les arrels de dins de (a, b)
        parteixen l'interval en trossos;
     2. la gràfica (on hi havia els càlculs de l'equació), amb els
        trossos ombrejats;
     3. una primitiva F(x) (C = 0);
     4. la integral de cada tros, per Barrow;
     5. l'àrea: la suma dels valors absoluts. No es mira el signe de f a
        cada tros (David): el valor absolut ja ho resol.
   Totes les línies que es veuen són certes: ho comprova proves/comprova.js.
   Claus: Ff… f(x) (prefix p); Z… les arrels;
   Gl… F(x) (prefixos i, j); J<k> la integral de cada tros; A… l'àrea.
   ═══════════════════════════════════════════════════════════════════ */
(function (arrel) {
'use strict';

const M = arrel.Mates;
const F = arrel.Formules;
const Dd = arrel.Dades;
const Mt = arrel.Matrius;
const Gr = arrel.Grafiques;
const Ig = arrel.Integrals;
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

/**
 * Files de la pissarra. Per resoldre f(x) = 0, l'equació (equacio) i les files «lliures», que
 * Integrals.passosTalls fa servir per ordre (proves, Ruffini, «x = r o …», treball). Després es
 * reaprofiten: la gràfica, F(x), les integrals i l'àrea. Cap fila buida entre dues d'escrites.
 */
const FILA = Object.freeze({funcio: 0, equacio: 1, lliures: Object.freeze([2, 3, 4, 5]),
  grafica: 2, primitiva: 3, integrals: 4, area: 5});
const FILES = 6;

const llista = (linies, espai = '8pt') => (linies.length > 1 ? `\\begin{array}{l} ${linies.join(` \\\\[${espai}] `)} \\end{array}` : linies[0]);
const texInterval = (l, r) => `[${texNombre(l)},\\ ${texNombre(r)}]`;

function passos(v) {
  const f = termesDe(v);
  const Fx = M.integraTermes(f);
  const val = x => M.valorTermes(f, x), Fv = x => M.valorTermes(Fx, x);
  const [a, b] = [Fraccio.de(v.a), Fraccio.de(v.b)];
  const g = F.guio(FILES);
  g.files[FILA.funcio] = F.membreEsquerre('Ff', 'f', 'x') + F.polinomi('p', f);
  g.afegeix(`L'àrea entre la corba i l'eix $OX$, de $x = ${v.a}$ a $x = ${v.b}$. On $f$ és negativa, la integral surt negativa: `
    + 'cal separar els trossos on $f$ canvia de signe i sumar-ne els valors absoluts.');

  /* On talla l'eix: f(x) = 0. */
  const p = coefs(v);
  while (p.length > 1 && p[p.length - 1].esZero()) p.pop();
  const arrels = Ig.passosTalls(g, {p, X: 'x', files: FILA, inici: 'On talla l\'eix $OX$? Resol l\'equació $f(x) = 0$.'});
  const dins = arrels.filter(r => r.resta(a).signe() > 0 && b.resta(r).signe() > 0);
  const punts = [a].concat(dins, [b]);
  const trossos = punts.slice(1).map((r, k) => [punts[k], r]);
  FILA.lliures.forEach(i => { g.files[i] = ''; });
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
      + (I.signe() < 0 ? ' Surt negativa: per això l\'àrea suma els valors absoluts.' : ''));
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
  files: FILES,
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
