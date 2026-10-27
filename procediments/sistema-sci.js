/* ═══════════════════════════════════════════════════════════════════
   sistema-sci.js — Procediment: resoldre un sistema (3 equacions, 3
   incògnites) que és compatible indeterminat, pel mètode de Gauss
   ───────────────────────────────────────────────────────────────────
   Dades: els coeficients i el terme independent de cada equació, per
   files, triats entre els exemples o escrits a l'adreça:
       sistema-sci.html?S=1,1,1,2;1,-1,2,1;2,0,3,3
   (la fila «1,1,1,2» és x + y + z = 2). Només sistemes amb infinites
   solucions que depenen d'un sol paràmetre (a les PAU, mai de dos).
   Mètode (el del David: «Resol» → esglaonar; mai Cramer, i aquí tampoc
   rangs ni Rouché, que són per a «Discuteix»):
     1. la matriu ampliada A*, esglaonada per Gauss (pivots, Fᵢ → a·Fᵢ − b·Fⱼ,
        cada matriu nova amb les operacions al costat);
     2. l'última fila és tota de zeros: 0 = 0, sempre cert. Queden dues
        equacions per a tres incògnites: sistema compatible indeterminat;
     3. s'allibera la incògnita sense pivot (z = λ) i se substitueix
        cap amunt: cada incògnita en funció de λ;
     4. el conjunt de solucions, (x, y, z) = (f₁(λ), f₂(λ), λ), i escrit
        com l'equació vectorial d'una recta, P + λ·v.
   Totes les línies que es veuen són certes: ho comprova proves/comprova.js.
   Claus: Q<i> les equacions; Gn, Gq, G<t>a<i><j> les matrius de Gauss;
   E<i> el sistema esglaonat; C<n>… els càlculs; V<j> els valors; S…, L…
   les solucions i la recta.
   ═══════════════════════════════════════════════════════════════════ */
(function (arrel) {
'use strict';

const M = arrel.Mates;
const F = arrel.Formules;
const Mt = arrel.Matrius;
const {clau: K, rel: R} = F;

/** Files de la pissarra. */
const FILA = Object.freeze({sistema: 0, gauss: 1, esglaonat: 2, calcul: 3, valors: 4, solucio: 5, recta: 6});

const EXEMPLES = Object.freeze([
  '1,1,1,2;1,-1,2,1;2,0,3,3',        // la 3a és la suma de les altres; solucions amb fraccions
  '1,1,0,1;0,1,1,2;1,2,1,3',         // menor 1: solucions enteres
  '2,-1,1,1;1,1,-1,2;3,0,0,3',       // x no depèn de λ
  '1,2,1,2;2,4,3,5;3,6,4,7',         // el menor de x i y val 0: el paràmetre és y
  '1,1,1,3;2,2,2,6;1,-1,0,1',        // les dues primeres són proporcionals: es treu la 2a
  '1,1,-1,0;2,-1,1,0;1,-2,2,0',      // homogeni
].map(S => Object.freeze({S})));
const PER_DEFECTE = EXEMPLES[0];

/** El sistema dels valors: S (3 files [a, b, c, d], Fraccio). */
const sistema = v => Mt.nombres(Mt.llegeixMatriu(v.S, 3, 4).A);

function valida(v) {
  let S;
  try {
    const {X} = Mt.llegeixMatriu(v.S, 3, 4);
    if (X) return `Aquí el sistema és de nombres: no hi pot haver cap paràmetre (${X}).`;
    S = sistema(v);
  } catch (e) {
    if (e instanceof M.ErrorLectura) return e.message.replace('La matriu', 'El sistema').replace('elements', 'nombres (els tres coeficients i el terme independent)');
    throw e;
  }
  const rA = Mt.rangN(S.map(f => f.slice(0, 3))), rAm = Mt.rangN(S);
  if (rA === 3) return 'Aquest sistema és compatible determinat (|A| ≠ 0): té una sola solució. Tria un sistema amb infinites solucions.';
  if (rA < rAm) return 'Aquest sistema és incompatible (rang A < rang A*): no té solució. Tria un sistema amb infinites solucions.';
  if (rA < 2) return 'Les solucions d\'aquest sistema depenen de dos paràmetres (rang 1): a les PAU no surt. Tria un sistema de rang 2.';
  return null;
}

function llegeixAdreca(a) {
  if (a.S === undefined) return {valors: Object.assign({}, PER_DEFECTE)};
  try {
    const {A, X} = Mt.llegeixMatriu(a.S, 3, 4);
    const v = {S: Mt.textMatriu(A, X)};
    const error = valida(v);
    return error ? {error: `L'adreça no es pot fer servir. ${error}`} : {valors: v};
  } catch (e) {
    if (e instanceof M.ErrorLectura) return {error: `No entenc el sistema de l'adreça: ${e.message}`};
    throw e;
  }
}
const escriuAdreca = v => ({S: v.S});
const texSistemaNet = S => Mt.texSistema(S).replace(/\\htmlData\{[^}]*\}/g, '');
const enunciat = v => `Resol el sistema $${texSistemaNet(sistema(v))}$ i expressa'n el conjunt de solucions.`;
const resum = v => `\\scriptsize ${texSistemaNet(sistema(v))}`;

function passos(v) {
  const S = sistema(v);
  const g = F.guio(7);
  const nom = Mt.INCOGNITES, L = Mt.LAMBDA;
  const {passos: gauss, B, pivots} = Mt.passosGauss(S);

  g.files[FILA.sistema] = Mt.texSistema(S);
  g.afegeix('Un sistema de 3 equacions amb 3 incògnites. Per resoldre\'l, esglaona la matriu ampliada pel mètode de Gauss.');

  /* 1. Gauss: cada matriu nova, a sota, amb les operacions al costat de les files que canvien. */
  const cadena = (fins, marca) => { g.files[FILA.gauss] = Mt.texCadenaGauss(S, gauss, {fins, marca}); };
  cadena(0);
  g.afegeix('La matriu ampliada $A^*$: els coeficients de les incògnites i, després de la ratlla, els termes independents.');
  gauss.forEach((pas, t) => { cadena(t + 1); g.afegeix(pas.text); });

  /* 2. L'última fila: 0 = 0. Sistema compatible indeterminat. */
  cadena(gauss.length, i => (i === 2 ? 'tria' : ''));
  g.files[FILA.esglaonat] = Mt.texSistema(B, {P: 'E', marca: i => (i === 2 ? 'tria' : '')});
  g.afegeix('Ja està esglaonada. Torna-la a escriure com a sistema: l\'última fila és tota de zeros, és a dir, $0 = 0$, que sempre és cert. '
    + 'Queden només dues equacions per a tres incògnites: és un sistema compatible indeterminat (té infinites solucions).');
  cadena(gauss.length);
  g.files[FILA.esglaonat] = Mt.texSistema(B.slice(0, 2), {P: 'E'});
  g.afegeix('L\'equació $0 = 0$ no diu res: treu-la.');

  /* 3. S'allibera la incògnita sense pivot, i se substitueix cap amunt. */
  const f = [0, 1, 2].find(j => !pivots.some(q => q.columna === j));
  const valor = [];                                   // cada incògnita, com a polinomi [c0, c1] en λ
  valor[f] = [M.Fraccio.de(0), M.Fraccio.de(1)];
  // Cada valor trobat, requadrat (David: «quan ja has trobat els valors, els has de requadrar»).
  const caixa = t => `\\boxed{${t}}`;
  const valors = [K(`V${f}`, caixa(`${nom[f]} = ${L}`))];
  const pintaValors = () => { g.files[FILA.valors] = `\\begin{array}{l} ${valors.join(' \\\\[8pt] ')} \\end{array}`; };
  pintaValors();
  g.afegeix(`Allibera una incògnita: la que no té pivot, $${nom[f]}$. Pot valer qualsevol nombre: anomena-la $\\lambda$, és a dir, $${nom[f]} = \\lambda$.`);

  const zero = M.Fraccio.de(0);
  const sumaQ = (p, q) => [(p[0] || zero).suma(q[0] || zero), (p[1] || zero).suma(q[1] || zero)];
  const perQ = (p, c) => [(p[0] || zero).producte(c), (p[1] || zero).producte(c)];
  /** Un sumand c·(valor de j) amb el seu signe davant: « + \lambda», « - 2 \cdot \dfrac{1 + \lambda}{2}». */
  const sumand = (c, j, primer) => {
    const signe = c.signe() < 0 ? (primer ? '-' : ' - ') : (primer ? '' : ' + ');
    const a = c.abs();
    if (j === f) return signe + (a.igual(1) ? '' : M.texNombre(a)) + L;
    return signe + (a.igual(1) ? '' : `${M.texNombre(a)} \\cdot `) + Mt.texLinealFactor(valor[j]);
  };
  [...pivots].reverse().forEach(({fila, columna: pc}, n) => {
    const fl = B[fila], a = fl[pc], d = fl[3];
    const altres = [0, 1, 2].filter(j => j !== pc && !fl[j].esZero());
    const P = `C${n}`;
    const passosC = [];
    const ja = altres.filter(j => j !== f).map(j => `$${nom[j]} = ${Mt.texLinealQ(valor[j])}$`);
    const quina = fila === 0 ? 'la primera' : 'la segona';
    const terme = Mt.termeVar(a, nom[pc], true);
    if (altres.length) {
      passosC.push([`${terme}${altres.map(j => sumand(fl[j], j, false)).join('')} = ${M.texNombre(d)}`,
        `Ara $${nom[pc]}$, de ${quina} equació: substitueix-hi ${ja.concat(altres.includes(f) ? [`$${nom[f]} = \\lambda$`] : []).join(' i ')}.`]);
      const dreta = (d.esZero() ? '' : M.texNombre(d)) + altres.map((j, k) => sumand(fl[j].oposada(), j, d.esZero() && k === 0)).join('');
      passosC.push([`${terme} = ${dreta}`, `Deixa sol el terme amb $${nom[pc]}$: els altres passen a l'altre costat, canviats de signe.`]);
    } else {
      passosC.push([`${terme} = ${M.texNombre(d)}`, `Ara $${nom[pc]}$, de ${quina} equació, que només té $${nom[pc]}$.`]);
    }
    const R_ = altres.reduce((acc, j) => sumaQ(acc, perQ(valor[j], fl[j].oposada())), [d, zero]);
    const opera = `${terme} = ${Mt.texLinealQ(R_)}`;
    if (opera !== passosC[passosC.length - 1][0]) passosC.push([opera, 'Opera el costat de la dreta.']);
    valor[pc] = perQ(R_, M.Fraccio.de(1).quocient(a));
    if (!a.igual(1)) passosC.push([`${nom[pc]} = ${Mt.texLinealQ(valor[pc])}`, `Divideix per $${M.texNombre(a)}$.`]);
    const lin = [];
    passosC.forEach(([tex, text], k) => {
      lin.push(K(`${P}${k}`, k === passosC.length - 1 ? caixa(tex) : tex));   // l'última línia ja és el valor: requadrat
      g.files[FILA.calcul] = `\\begin{array}{l} ${lin.join(' \\\\[8pt] ')} \\end{array}`;
      g.afegeix(text);
    });
    g.files[FILA.calcul] = '';
    valors.push(K(`V${pc}`, caixa(`${nom[pc]} = ${Mt.texLinealQ(valor[pc])}`)));
    pintaValors();
    g.afegeix(`Ja tens $${nom[pc]} = ${Mt.texLinealQ(valor[pc])}$.`, {fusiona: {[`V${pc}`]: [`${P}${passosC.length - 1}`]}});
  });

  /* 4. El conjunt de solucions, i l'equació vectorial d'una recta. */
  const comps = [0, 1, 2].map(j => Mt.texLinealQ(valor[j]));
  g.files[FILA.solucio] = K('Sl', '(x,\\ y,\\ z)') + R('Sq', '=') + K('Sv', `\\left(${comps.join(',\\ ')}\\right)`) + ',\\quad ' + K('Sp', '\\lambda \\in \\mathbb{R}');
  g.classes[FILA.solucio] = 'final';
  g.afegeix('El conjunt de solucions: $(x,\\ y,\\ z) = (f_1(\\lambda),\\ f_2(\\lambda),\\ \\lambda)$. Cada valor de $\\lambda$ dona una solució.');
  const num = c => (c.esEnter() ? M.texNombre(c) : `${c.signe() < 0 ? '-' : ''}\\dfrac{${Math.abs(c.num)}}{${c.den}}`);
  const punt = [0, 1, 2].map(j => valor[j][0]), vector = [0, 1, 2].map(j => valor[j][1]);
  g.files[FILA.recta] = K('Ll', '(x,\\ y,\\ z)') + R('Lq', '=') + K('Lp', `\\left(${punt.map(num).join(',\\ ')}\\right)`) + ' + ' + K('Lv', `\\lambda \\left(${vector.map(num).join(',\\ ')}\\right)`);
  g.classes[FILA.recta] = 'final';
  g.afegeix('Separa la part sense $\\lambda$ i la part amb $\\lambda$: és l\'equació vectorial d\'una recta. El conjunt de solucions és la recta que passa pel punt '
    + `$(${punt.map(num).join(',\\ ')})$ (la solució amb $\\lambda = 0$) i té vector director $(${vector.map(num).join(',\\ ')})$.`);
  return g.passos;
}

arrel.SistemaSCI = Object.freeze({
  titol: 'Sistema compatible indeterminat',
  categoria: 'algebra',
  files: 7,
  perDefecte: PER_DEFECTE,
  exemples: EXEMPLES,
  titolEditor: 'Tria un sistema',
  titolExemples: 'Sistemes:',
  notaEditor: 'També pots escriure el teu sistema a l\'adreça, una equació per fila: sistema-sci.html?S=1,1,1,2;1,-1,2,1;2,0,3,3 '
    + '(la fila «1,1,1,2» és x + y + z = 2). Ha de tenir rang(A) = rang(A*) = 2.',
  editor: [],
  FILA, EXEMPLES,
  valida, llegeixAdreca, escriuAdreca, enunciat, resum, passos,
});

})(globalThis);
