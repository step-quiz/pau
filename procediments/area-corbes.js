/* ═══════════════════════════════════════════════════════════════════
   area-corbes.js — Procediment: àrea entre dues corbes
   ───────────────────────────────────────────────────────────────────
   Dades: f(x) i g(x), polinomis de grau 3 com a màxim (coeficients
   enters entre −9 i 9). La regió és la que tanquen les dues corbes:
   del primer punt de tall a l'últim (n'hi ha d'haver dos, almenys, i
   racionals).
   Adreça: area-corbes.html?f=x^2&g=x+2

   Passos:
     1. la gràfica, amb la regió ombrejada;
     2. h(x) = f(x) − g(x);
     3. els punts de tall: h(x) = 0 (Matrius.passosArrels);
     4. a cada tros entre dos talls, quina corba va per sobre (el signe
        de h en el punt mitjà);
     5. una primitiva H(x) de h (C = 0);
     6. la integral de h a cada tros, per Barrow;
     7. l'àrea: la suma dels valors absoluts.
   Totes les línies que es veuen són certes: ho comprova proves/comprova.js.
   Claus: Ff…, Fg… f i g (prefixos p, q); Dl… la diferència (prefix h);
   Z… els talls; S<k> el signe; Gl… H(x) (prefixos i, j); J<k> les
   integrals; A… l'àrea.
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

const MAX_COEF = 9;
const PER_DEFECTE = Object.freeze({a3: 0, a2: 1, a1: 0, a0: 0, b3: 0, b2: 0, b1: 1, b0: 2});
const EXEMPLES = Object.freeze([
  PER_DEFECTE,                                                                  // paràbola i recta
  {a3: 0, a2: -1, a1: 0, a0: 4, b3: 0, b2: 1, b1: -2, b0: 0},                   // dues paràboles
  {a3: 1, a2: 0, a1: 0, a0: 0, b3: 0, b2: 0, b1: 1, b0: 0},                     // cúbica i recta: dos trossos
  {a3: 1, a2: 0, a1: -3, a0: 0, b3: 0, b2: 0, b1: 1, b0: 0},
  {a3: 0, a2: 2, a1: -3, a0: 0, b3: 0, b2: 1, b1: 1, b0: -3},
]);
const termesF = v => Dd.termesAmb(v, 'a', 3), termesG = v => Dd.termesAmb(v, 'b', 3);
const COEFS_F = ['a0', 'a1', 'a2', 'a3'], COEFS_G = ['b0', 'b1', 'b2', 'b3'];
/** h = f − g: coeficients de grau 0 cap amunt (sense zeros al final). */
function diferencia(v) {
  const p = [0, 1, 2, 3].map(n => Fraccio.de(v[COEFS_F[n]] - v[COEFS_G[n]]));
  while (p.length > 1 && p[p.length - 1].esZero()) p.pop();
  return p;
}

function valida(v) {
  if (!COEFS_F.concat(COEFS_G).every(id => Number.isInteger(v[id]) && Math.abs(v[id]) <= MAX_COEF)) return `Els coeficients han de ser enters entre −${MAX_COEF} i ${MAX_COEF}.`;
  const h = diferencia(v);
  if (h.length < 2) return h[0].esZero() ? 'Les dues funcions són iguals: no tanquen cap regió.' : 'f(x) − g(x) és constant: les corbes no es tallen.';
  const problema = Mt.problemaArrels(h);
  if (problema === 'irracionals' || problema === 'sense arrel entera') return 'Els punts de tall no són nombres racionals: aquest procediment no els pot trobar exactament. Tria unes altres funcions.';
  const talls = Mt.passosArrels(F.guio(4), {p: h, X: 'x', files: {equacio: 0, prova: 1, ruffini: 2, segon: 3}, inici: ''});
  if (talls.length < 2) return 'Les corbes s\'han de tallar almenys en dos punts per tancar una regió.';
  return null;
}

/** Llegeix un polinomi de l'adreça cap als camps prefix0…prefix3. Torna un error o null. */
function llegeixPolinomi(text, v, prefix, nom) {
  const coefs = M.polinomi(M.llegeix(text));
  if (!coefs) return `La funció ${nom} de l'adreça, «${text}», no és un polinomi.`;
  if (coefs.length - 1 > 3) return `La funció ${nom} de l'adreça, «${text}», és de grau ${coefs.length - 1}. El grau màxim és 3.`;
  if (!coefs.every(c => c.esEnter())) return `La funció ${nom} de l'adreça, «${text}», té coeficients que no són enters.`;
  [0, 1, 2, 3].forEach(n => { v[prefix + n] = coefs[n] ? coefs[n].num : 0; });
  return null;
}

function llegeixAdreca(p) {
  const v = Object.assign({}, PER_DEFECTE);
  try {
    for (const [id, prefix] of [['f', 'a'], ['g', 'b']]) {
      if (p[id] === undefined) continue;
      const error = llegeixPolinomi(p[id], v, prefix, id);
      if (error) return {error};
    }
  } catch (e) {
    if (e instanceof M.ErrorLectura) return {error: `No entenc l'adreça: ${e.message}`};
    throw e;
  }
  const error = valida(v);
  return error ? {error: `L'adreça no es pot fer servir. ${error}`} : {valors: v};
}
const escriuAdreca = v => ({f: M.textPolinomi(termesF(v)), g: M.textPolinomi(termesG(v))});
const enunciat = v => `Calcula l'àrea de la regió tancada per les corbes $y = ${texPolinomi(termesF(v))}$ i $y = ${texPolinomi(termesG(v))}$.`;
const resum = v => `f(x) = ${texPolinomi(termesF(v))},\\ \\ g(x) = ${texPolinomi(termesG(v))}`;

/** Files de la pissarra: les de la resolució de h(x) = 0 es reaprofiten després. */
const FILA = Object.freeze({funcions: 0, grafica: 1, diferencia: 2, equacio: 3, prova: 4, ruffini: 5, segon: 6, area: 7,
  signes: 4, primitiva: 5, integrals: 6});

const llista = (linies, espai = '8pt') => (linies.length > 1 ? `\\begin{array}{l} ${linies.join(` \\\\[${espai}] `)} \\end{array}` : linies[0]);
const texInterval = (l, r) => `[${texNombre(l)},\\ ${texNombre(r)}]`;
const entreParentesis = termes => (termes.length > 1 || (termes[0] && Fraccio.de(termes[0].c).signe() < 0) ? `(${texPolinomi(termes)})` : texPolinomi(termes));

function passos(v) {
  const f = termesF(v), gt = termesG(v);
  const p = diferencia(v), h = M.termes(p);
  const Hx = M.integraTermes(h);
  const val = x => M.valorTermes(h, x), Hv = x => M.valorTermes(Hx, x);
  const g = F.guio(8);
  g.files[FILA.funcions] = llista([F.membreEsquerre('Ff', 'f', 'x') + F.polinomi('p', f), F.membreEsquerre('Fg', 'g', 'x') + (gt.length ? F.polinomi('q', gt) : K('q0', '0'))]);
  g.afegeix('L\'àrea entre dues corbes: la integral de la diferència, $f(x) - g(x)$, entre els punts on es tallen. On $g$ va per sobre de $f$, la diferència és negativa: '
    + 'cal separar els trossos i sumar-ne els valors absoluts.');

  /* La diferència h = f − g. */
  const Dl = K('Dl', 'f(x) - g(x)') + R('Dq', '=');
  g.files[FILA.diferencia] = Dl + K('Dr', `${entreParentesis(f)} - ${entreParentesis(gt.length ? gt : [{n: 0, c: 0}])}`);
  g.afegeix('Resta les dues funcions: compte amb els signes en treure els parèntesis.');
  g.files[FILA.diferencia] = Dl + F.polinomi('h', h);
  g.afegeix(`Agrupa: $f(x) - g(x) = ${texPolinomi(h)}$.`);

  /* Els punts de tall: h(x) = 0. */
  const arrels = Mt.passosArrels(g, {p, X: 'x', files: FILA, inici: 'Els punts de tall: $f(x) = g(x)$, és a dir, $f(x) - g(x) = 0$.'});
  const trossos = arrels.slice(1).map((r, k) => [arrels[k], r]);
  [FILA.prova, FILA.ruffini, FILA.segon].forEach(i => { g.files[i] = ''; });
  g.files[FILA.equacio] = K('Zf', 'f(x) = g(x)') + ':\\quad ' + K('Zs', arrels.map(r => `x = ${texNombre(r)}`).join(',\\ '));
  g.afegeix(`Les corbes es tallen a $${arrels.map(r => `x = ${texNombre(r)}`).join('$, $')}$: la regió va de $x = ${texNombre(arrels[0])}$ a $x = ${texNombre(arrels[arrels.length - 1])}$`
    + (trossos.length > 1 ? `, en ${trossos.length} trossos.` : '.'));

  /* La gràfica. */
  const signes = trossos.map(([l, r]) => val(l.suma(r).quocient(2)).signe());
  g.files[FILA.grafica] = Gr.grafica({corbes: [{termes: f, nom: 'f'}, {termes: gt, nom: 'g'}], x: Gr.finestra(arrels), marques: arrels,
    zones: trossos.map(([l, r], k) => ({l, r, dalt: signes[k] > 0 ? 0 : 1, baix: signes[k] > 0 ? 1 : 0, classe: signes[k] > 0 ? 'zona' : 'zona2'}))});
  g.afegeix('La regió que tanquen les dues corbes.');

  /* Quina va per sobre a cada tros. */
  g.files[FILA.signes] = llista(trossos.map(([l, r], k) => {
    const m = l.suma(r).quocient(2), hm = val(m);
    return K(`S${k}`, `${texInterval(l, r)}:\\quad f\\left(${texNombre(m)}\\right) - g\\left(${texNombre(m)}\\right) = ${texNombre(hm)} ${hm.signe() > 0 ? '> 0' : '< 0'}`);
  }));
  g.afegeix(`A cada tros, una de les corbes va per sobre: ${trossos.map(([l, r], k) => `a $${texInterval(l, r)}$, ${signes[k] > 0 ? '$f$' : '$g$'}`).join('; ')}.`);

  /* Una primitiva de h, i la integral de cada tros. */
  F.passosIntegral(g, FILA.primitiva, F.membreEsquerre('G', 'H', 'x'), h, {C: false,
    textos: {indicada: 'Una primitiva de $f(x) - g(x)$ (amb $C = 0$), per aplicar la regla de Barrow.', feta: `Simplifica: $H(x) = ${texPolinomi(Hx)}$.`}});
  const integrals = [], linies = [];
  trossos.forEach(([l, r], k) => {
    const I = Hv(r).resta(Hv(l));
    integrals.push(I);
    linies.push(K(`J${k}`, `\\displaystyle\\int_{${texNombre(l)}}^{${texNombre(r)}} (f(x) - g(x))\\,dx = H(${texNombre(r)}) - H(${texNombre(l)}) = `
      + `${texNombre(Hv(r))} - ${texEntreParentesis(Hv(l))} = ${texNombre(I)}`));
    g.files[FILA.integrals] = llista(linies, '12pt');
    g.afegeix(`Barrow al tros $${texInterval(l, r)}$: $H(${texNombre(r)}) = ${texNombre(Hv(r))}$ i $H(${texNombre(l)}) = ${texNombre(Hv(l))}$.`
      + (I.signe() < 0 ? ' Surt negativa: aquí $g$ va per sobre.' : ''));
  });

  /* L'àrea. */
  const A = integrals.reduce((s, I) => s.suma(I.abs()), Fraccio.de(0));
  g.files[FILA.area] = K('Al', 'A') + R('Aq', '=') + K('Aa', integrals.map(I => `\\left|${texNombre(I)}\\right|`).join(' + '))
    + (integrals.length > 1 ? R('Ar', '=') + K('Ab', integrals.map(I => texNombre(I.abs())).join(' + ')) : '') + R('As', '=') + K('Av', texNombre(A));
  g.classes[FILA.area] = 'final';
  g.afegeix(`L'àrea és la suma dels valors absoluts. Resposta: $A = ${texNombre(A)}$ unitats quadrades.`);
  return g.passos;
}

arrel.AreaCorbes = Object.freeze({
  titol: 'Àrea entre dues corbes',
  categoria: 'analisi',
  files: 8,
  perDefecte: PER_DEFECTE,
  exemples: EXEMPLES,
  titolEditor: 'Canvia les funcions',
  notaEditor: `Els coeficients van de −${MAX_COEF} a ${MAX_COEF}. Les corbes s'han de tallar almenys en dos punts, racionals.`,
  editor: [
    Dd.campsPolinomi('f(x) =', 'a', 3, MAX_COEF),
    Dd.campsPolinomi('g(x) =', 'b', 3, MAX_COEF, 'de g'),
  ],
  FILA,
  valida, llegeixAdreca, escriuAdreca, enunciat, resum, passos,
});

})(globalThis);
