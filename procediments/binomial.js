/* ═══════════════════════════════════════════════════════════════════
   binomial.js — Procediment: distribució binomial (i el contrari)
   ───────────────────────────────────────────────────────────────────
   Dades: n repeticions (1 a 10), la probabilitat d'èxit p (en
   centèsimes, de 0,01 a 0,99) i la pregunta P(X r k), on r és =, ≥, ≤,
   > o <. Dues variants (mode): la p en tant per u (0,25) o en tant per
   cent (25 %), que primer es passa a tant per u.
   Adreça: binomial.html?n=5&pc=25&r=ge&k=4   (tant per cent)
           binomial.html?n=10&p=0,1&r=gt&k=1  (tant per u)

   Passos:
     1. n i p (i, en tant per cent, p = 25 % = 0,25); X ~ B(n; p) i q = 1 − p;
     2. la fórmula P(X = k) = C(n, k) · pᵏ · qⁿ⁻ᵏ;
     3. quins casos entren a la pregunta. Si el contrari en té menys, es
        calcula pel contrari: P(A) = 1 − P(no A);
     4. cada cas, amb la fórmula;
     5. la suma (o 1 menys la suma), i la resposta (també en %).

   Els càlculs són exactes: amb p en centèsimes, P(X = k) és un decimal
   exacte de 2n xifres, que es calcula amb BigInt (10²⁰ ja no cap en un
   enter exacte de JavaScript). Un valor amb més de 4 decimals s'escriu
   arrodonit a 4, amb «≈»; si arrodonit fos 0, en notació científica.
   Totes les línies que es veuen són certes: ho comprova proves/comprova.js.
   Claus: Dn, Dp, Dx, Dq les dades; Fl, Fe la fórmula; Pl, Pq, Pe, Pc la
   pregunta; T<k>l T<k>q T<k>e T<k>r T<k>v el cas k; Sl, Sq, Se, Sr, Sv la
   suma; Rr la resposta.
   ═══════════════════════════════════════════════════════════════════ */
(function (arrel) {
'use strict';

const M = arrel.Mates;
const F = arrel.Formules;
const Dd = arrel.Dades;
const {Fraccio} = M;
const {clau: K, rel: R} = F;


/* ── 1. DADES ──────────────────────────────────────────────────────── */

const MAX_N = 10;
/** Les relacions de la pregunta: id (adreça), TeX, text i quins valors de X hi entren. */
const RELACIONS = Object.freeze([
  {id: 'eq', tex: '=', text: k => `exactament ${k}`, entra: (j, k) => j === k},
  {id: 'ge', tex: '\\ge', text: k => `almenys ${k}`, entra: (j, k) => j >= k},
  {id: 'le', tex: '\\le', text: k => `com a màxim ${k}`, entra: (j, k) => j <= k},
  {id: 'gt', tex: '>', text: k => (k === 1 ? 'més d\'1' : `més de ${k}`), entra: (j, k) => j > k},
  {id: 'lt', tex: '<', text: k => (k === 1 ? 'menys d\'1' : `menys de ${k}`), entra: (j, k) => j < k},
]);

const PER_DEFECTE = Object.freeze({n: 5, p: 25, r: 1, k: 4, mode: 'cent'});

const EXEMPLES = Object.freeze([
  PER_DEFECTE,                                    // almenys 4 de 5: dos casos
  {n: 10, p: 10, r: 3, k: 1, mode: 'u'},          // més d'1 de 10: pel contrari, 1 − [P(0) + P(1)]
  {n: 4, p: 20, r: 1, k: 1, mode: 'cent'},        // almenys un: 1 − P(X = 0)
  {n: 6, p: 50, r: 0, k: 3, mode: 'u'},           // exactament 3
  {n: 8, p: 30, r: 2, k: 2, mode: 'cent'},        // com a màxim 2: directament (3 casos, i no 6)
  {n: 10, p: 90, r: 0, k: 10, mode: 'u'},         // tots: 0,9¹⁰
]);

/** Els valors de X que entren a la pregunta. */
const casos = v => Array.from({length: v.n + 1}, (_, j) => j).filter(j => RELACIONS[v.r].entra(j, v.k));

/** Text d'error si els valors no són vàlids; si ho són, null. */
function valida(v) {
  if (!['u', 'cent'].includes(v.mode)) return 'Tria si la probabilitat d\'èxit va en tant per u o en tant per cent.';
  if (!Number.isInteger(v.n) || v.n < 1 || v.n > MAX_N) return `El nombre de repeticions n ha de ser un enter entre 1 i ${MAX_N}.`;
  if (!Number.isInteger(v.p) || v.p < 1 || v.p > 99) return 'La probabilitat d\'èxit ha d\'anar de 0,01 a 0,99 (de l\'1 % al 99 %).';
  if (!Number.isInteger(v.r) || !RELACIONS[v.r]) return 'La pregunta ha de ser =, ≥, ≤, > o <.';
  if (!Number.isInteger(v.k) || v.k < 0 || v.k > v.n) return `El valor k ha d'anar de 0 a n = ${v.n}.`;
  const c = casos(v).length;
  if (!c) return 'Cap valor de X compleix aquesta condició: la probabilitat és 0. Canvia k o la relació.';
  if (c === v.n + 1) return 'Tots els valors de X compleixen aquesta condició: la probabilitat és 1. Canvia k o la relació.';
  return null;
}


/* ── 2. ADREÇA I TEXTOS ────────────────────────────────────────────── */

/** p en centèsimes, en tant per u: «0{,}25». */
const texP = c => M.texDecimal(new Fraccio(c, 100));

function llegeixAdreca(a) {
  const v = Object.assign({}, PER_DEFECTE);
  try {
    if (a.p !== undefined && a.pc !== undefined) return {error: 'L\'adreça no pot donar la p en tant per u (p) i en tant per cent (pc) alhora.'};
    if (a.n !== undefined) v.n = M.llegeixNombre(a.n).num;
    if (a.k !== undefined) v.k = M.llegeixNombre(a.k).num;
    if (a.pc !== undefined) { v.p = M.llegeixNombre(a.pc).valor(); v.mode = 'cent'; }
    if (a.p !== undefined) { v.p = M.llegeixNombre(a.p).producte(100).valor(); v.mode = 'u'; }
    if (a.r !== undefined) {
      v.r = RELACIONS.findIndex(x => x.id === a.r);
      if (v.r < 0) return {error: `L'adreça demana la relació «${a.r}»: pot ser eq, ge, le, gt o lt.`};
    }
    for (const id of ['n', 'k']) if (a[id] !== undefined && !M.llegeixNombre(a[id]).esEnter()) return {error: `El valor «${id}» de l'adreça ha de ser enter.`};
  } catch (e) {
    if (e instanceof M.ErrorLectura) return {error: `No entenc l'adreça: ${e.message}`};
    throw e;
  }
  if (!Number.isInteger(v.p)) return {error: 'La probabilitat de l\'adreça ha de tenir com a màxim dues xifres decimals (o ser un percentatge enter).'};
  const error = valida(v);
  return error ? {error: `L'adreça no es pot fer servir. ${error}`} : {valors: v};
}

function escriuAdreca(v) {
  const r = RELACIONS[v.r].id;
  return v.mode === 'cent' ? {n: String(v.n), pc: String(v.p), r, k: String(v.k)}
    : {n: String(v.n), p: texP(v.p).replace('{,}', ','), r, k: String(v.k)};
}

const texPDada = v => (v.mode === 'cent' ? `${v.p}\\,\\%` : texP(v.p));
const pregunta = v => `P(X ${RELACIONS[v.r].tex} ${v.k})`;

function enunciat(v) {
  return `Un experiment té una probabilitat d'èxit de $${texPDada(v)}$. Es repeteix $${v.n}$ ${v.n === 1 ? 'vegada' : 'vegades'}, `
    + `de manera independent. Quina és la probabilitat d'obtenir ${RELACIONS[v.r].text(v.k)} ${v.k === 1 ? 'èxit' : 'èxits'}?`;
}
const resum = v => `n = ${v.n},\\ \\ p = ${texPDada(v)},\\ \\ ${pregunta(v)}`;


/* ── 3. CÀLCULS EXACTES (BigInt) ───────────────────────────────────── */

/** Nombre combinatori C(n, k). */
function combinatori(n, k) {
  let c = 1n;
  for (let i = 1; i <= k; i++) c = c * BigInt(n - k + i) / BigInt(i);
  return c;
}
/** P(X = k) com a enter N: el valor és N / 10^(2n). */
const terme = (v, k) => combinatori(v.n, k) * BigInt(v.p) ** BigInt(k) * BigInt(100 - v.p) ** BigInt(v.n - k);

/** N / 10^E en decimal (TeX): amb exactament «d» decimals (arrodonit) o, si d és null, tots els que té. */
function decimalDe(N, E, d = null) {
  if (d !== null && d < E) {
    const u = 10n ** BigInt(E - d);
    N = (N * 2n + u) / (2n * u);              // arrodonit a la meitat (el valor és positiu)
    E = d;
  }
  const s = N.toString().padStart(E + 1, '0');
  const enter = s.slice(0, s.length - E);
  let dec = E ? s.slice(-E) : '';
  if (d === null) dec = dec.replace(/0+$/, '');
  return dec ? `${enter}{,}${dec}` : enter;
}
const decimals = tex => (tex.split('{,}')[1] || '').length;

/**
 * Una probabilitat N / 10^E: {tex, aprox}. Exacta si té com a màxim 4 decimals;
 * si no, arrodonida a 4; si així fos 0, en notació científica amb 4 xifres.
 */
function probabilitat(N, E) {
  const exacte = decimalDe(N, E);
  if (decimals(exacte) <= 4) return {tex: exacte, aprox: false};
  const arrodonit = decimalDe(N, E, 4);
  if (arrodonit !== '0{,}0000') return {tex: arrodonit, aprox: true};
  const s = N.toString();                                 // N / 10^E = s₀,s₁s₂… · 10^(s.length − 1 − E)
  let m = BigInt(s.slice(0, 4).padEnd(4, '0'));
  if (s.length > 4 && Number(s[4]) >= 5) m += 1n;         // arrodonit a 4 xifres
  let e = s.length - 1 - E;
  if (m === 10000n) { m = 1000n; e += 1; }
  const aprox = s.replace(/0+$/, '').length > 4;
  let t = m.toString();
  t = aprox ? t : t.replace(/0+$/, '');
  return {tex: `${t[0]}${t.length > 1 ? `{,}${t.slice(1)}` : ''} \\cdot 10^{${e}}`, aprox};
}
/** El mateix valor en %, amb dos decimals com a màxim; null si arrodonit fos 0. */
function percentatge(N, E) {
  const exacte = decimalDe(N, E - 2);
  if (decimals(exacte) <= 2) return {tex: exacte, aprox: false};
  const arrodonit = decimalDe(N, E - 2, 2);
  return arrodonit === '0{,}00' ? null : {tex: arrodonit, aprox: true};
}
const igualOAprox = aprox => (aprox ? '\\approx' : '=');


/* ── 4. PASSOS ─────────────────────────────────────────────────────── */

/** Files de la pissarra. */
const FILA = Object.freeze({dades: 0, formula: 1, pregunta: 2, termes: 3, suma: 4, resposta: 5});

/** Una fila de diverses línies (un array), o d'una de sola. */
const linies = (ls, espai = '4pt', sempre = false) => (ls.length > 1 || sempre ? `\\begin{array}{l} ${ls.join(` \\\\[${espai}] `)} \\end{array}` : ls[0]);

/** Els casos que es calculen: els de la pregunta o, si en té menys, els del contrari. */
function cami(v) {
  const tots = Array.from({length: v.n + 1}, (_, j) => j);
  const directes = casos(v);
  const contraris = tots.filter(j => !directes.includes(j));
  const perContrari = contraris.length < directes.length;
  return {directes, contraris, perContrari, calculats: perContrari ? contraris : directes};
}

function passos(v) {
  const g = F.guio(6);
  const E = 2 * v.n;
  const p = texP(v.p), q = texP(100 - v.p);
  const rel = RELACIONS[v.r];
  const {directes, contraris, perContrari, calculats} = cami(v);
  const P = pregunta(v);
  const exits = `${rel.text(v.k)} ${v.k === 1 ? 'èxit' : 'èxits'}`;
  const llista = ks => (ks.length > 2 ? `$k = ${ks[0]}, \\ldots, ${ks[ks.length - 1]}$` : ks.map(j => `$k = ${j}$`).join(' i '));
  // Amb més de 3 casos: «P(X = 0) + … + P(X = 4)» (els casos sempre són seguits).
  const suma = ks => (ks.length > 3 ? `P(X = ${ks[0]}) + \\cdots + P(X = ${ks[ks.length - 1]})` : ks.map(j => `P(X = ${j})`).join(' + '));

  /* 1. Les dades: una per línia, amb què vol dir cadascuna al costat (en gris). */
  const dades = files => `\\begin{array}{ll} ${files.map(([tex, que]) => `${tex} & \\quad\\textcolor{#64748b}{\\small\\text{${que}}}`).join(' \\\\[6pt] ')} \\end{array}`;
  const filaN = [K('Dn', `n = ${v.n}`), 'nombre de repeticions'];
  const filaP = tex => [tex, 'probabilitat d\'èxit'];
  if (v.mode === 'cent') {
    g.files[FILA.dades] = dades([filaN, filaP(K('Dp', `p = ${v.p}\\,\\%`))]);
    g.afegeix(`Es repeteix ${v.n} ${v.n === 1 ? 'vegada' : 'vegades'} el mateix experiment, de manera independent, i cada vegada hi ha dos resultats: `
      + `èxit o fracàs. La probabilitat d'èxit és $${v.p}\\,\\%$.`);
    g.files[FILA.dades] = dades([filaN, filaP(K('Dp', `p = ${v.p}\\,\\%`) + R('Dr', '=') + K('Dx', p))]);
    g.afegeix(`Passa el percentatge a tant per u: divideix per $100$. $p = ${v.p}\\,\\% = \\frac{${v.p}}{100} = ${p}$.`);
  } else {
    g.files[FILA.dades] = dades([filaN, filaP(K('Dp', 'p = ') + K('Dx', p))]);
    g.afegeix(`Es repeteix ${v.n} ${v.n === 1 ? 'vegada' : 'vegades'} el mateix experiment, de manera independent, i cada vegada hi ha dos resultats: `
      + `èxit o fracàs. La probabilitat d'èxit és $p = ${p}$.`);
  }
  const fP = v.mode === 'cent' ? filaP(K('Dp', `p = ${v.p}\\,\\%`) + R('Dr', '=') + K('Dx', p)) : filaP(K('Dp', 'p = ') + K('Dx', p));
  const filaQ = [K('Dq', `q = 1 - p = ${q}`), 'probabilitat de fracàs'];
  g.files[FILA.dades] = dades([filaN, fP, filaQ]);
  g.afegeix(`La probabilitat de fracàs és la contrària: $q = 1 - ${p} = ${q}$.`);
  g.files[FILA.dades] = dades([filaN, fP, filaQ, [K('DB', `X \\sim B(${v.n};\\ ${p})`), '$X$: nombre d\'èxits']]);
  g.afegeix(`El nombre d'èxits, $X$, segueix una distribució binomial: $X \\sim B(${v.n};\\ ${p})$.`);

  /* 2. La fórmula. */
  g.files[FILA.formula] = K('Fl', 'P(X = k)') + R('Fq', '=') + K('Fe', '\\binom{n}{k} \\cdot p^{k} \\cdot q^{\\,n-k}');
  g.afegeix('La probabilitat de $k$ èxits: $p^k$ pels $k$ èxits, $q^{n-k}$ pels fracassos, i $\\binom{n}{k}$, '
    + 'les maneres de triar quines de les repeticions són els èxits.');

  /* 3. Quins casos: directament o pel contrari. («Exactament k» és un sol cas: no cal.) */
  if (perContrari) {
    const c = contraris;
    const cRel = c.length === 1 ? `X = ${c[0]}` : c[0] === 0 ? `X \\le ${c[c.length - 1]}` : `X \\ge ${c[0]}`;
    g.files[FILA.pregunta] = K('Pl', P) + R('Pq', '=') + K('Pe', `1 - P(${cRel})`);
    g.afegeix(`Directament, serien ${directes.length} casos (${llista(directes)}). El contrari, $${cRel}$, només en té ${c.length === 1 ? 'un' : c.length}: `
      + 'és més curt. La probabilitat d\'un esdeveniment és $1$ menys la del contrari.');
    if (c.length > 1) {
      g.files[FILA.pregunta] = K('Pl', P) + R('Pq', '=') + K('Pe', `1 - [${suma(c)}]`);
      g.afegeix(`$P(${cRel})$ són ${c.length} casos: ${llista(c)}. Se sumen.`);
    }
  } else if (rel.id !== 'eq') {
    g.files[FILA.pregunta] = K('Pl', P) + R('Pq', '=') + K('Pe', suma(directes));
    const que = `«${rel.text(v.k)}»`.replace(/«./, x => x.toUpperCase());
    g.afegeix(directes.length === 1 ? `${que} és un sol cas: $X = ${directes[0]}$.`
      : `${que} són ${directes.length} casos: ${llista(directes)}. Se sumen.`
        + (contraris.length === directes.length ? ' (Pel contrari, n\'hi hauria els mateixos.)' : ''));
  }

  /* 4. Cada cas, amb la fórmula. El cas que es calcula, en lila a la pregunta i a la seva línia. */
  const filaPregunta = g.files[FILA.pregunta];
  const marcaPregunta = j => { if (filaPregunta) g.files[FILA.pregunta] = filaPregunta.replace(`P(X = ${j})`, F.marca(`P(X = ${j})`, 'actual')); };
  const termes = [], valors = [];
  const pinta = () => { g.files[FILA.termes] = linies(termes, '6pt', true); };
  for (const j of calculats) {
    const t = `T${j}`;
    marcaPregunta(j);
    termes.forEach((tx, i) => { termes[i] = tx.replace(',marca=actual}', '}'); });     // el cas d'abans ja no és l'actual
    termes.push(K(t + 'l', `P(X = ${j})`, 'actual') + R(t + 'q', '=') + K(t + 'e', `\\binom{${v.n}}{${j}} \\cdot ${p}^{${j}} \\cdot ${q}^{${v.n - j}}`));
    pinta();
    g.afegeix(`Calcula $P(X = ${j})$: a la fórmula, substitueix $n = ${v.n}$, $k = ${j}$, $p = ${p}$ i $q = ${q}$.`,
      {cursor: {arrossega: 'Fe', fins: t + 'e'}});
    const N = terme(v, j), x = probabilitat(N, E);
    valors.push({N, x});
    termes[termes.length - 1] += R(t + 'r', igualOAprox(x.aprox)) + K(t + 'v', x.tex);
    pinta();
    const uns = (j === 0 ? ` i $${p}^{0} = 1$` : '') + (j === v.n ? ` i $${q}^{0} = 1$` : '');
    g.afegeix(`$\\binom{${v.n}}{${j}} = ${combinatori(v.n, j)}$${uns}. Opera: $P(X = ${j}) ${igualOAprox(x.aprox)} ${x.tex}$`
      + (x.aprox ? ' (arrodonit).' : '.'));
  }

  // Acabats els casos, ja no n'hi ha cap d'actual.
  termes.forEach((tx, i) => { termes[i] = tx.replace(',marca=actual}', '}'); });
  if (termes.length) pinta();
  if (filaPregunta) g.files[FILA.pregunta] = filaPregunta;

  /* 5. La suma, i la resposta. */
  const Ncalc = valors.reduce((s, t) => s + t.N, 0n);
  const N = perContrari ? 10n ** BigInt(E) - Ncalc : Ncalc;
  const total = probabilitat(N, E);
  let origen = `T${calculats[0]}v`;
  if (calculats.length > 1 || perContrari) {
    const arrodonits = valors.some(t => t.x.aprox);
    // Els valors, en trossos que càpiguen al mòbil: com a màxim 3 per línia (o 2 en notació científica).
    const pes = x => (x.tex.includes('10^') ? 3 : 2);
    const trossos = [[]];
    for (const {x} of valors) {
      const ara = trossos[trossos.length - 1];
      if (ara.length && ara.reduce((s, y) => s + pes(y), 0) + pes(x) > 6) trossos.push([x]); else ara.push(x);
    }
    const ultim = trossos[trossos.length - 1].reduce((s, y) => s + pes(y), 0) + pes(total);
    const claudator = perContrari && calculats.length > 1;
    const sumaLinies = trossos.map((xs, i) => (i ? '\\qquad + ' : K('Sl', P) + R('Sq', igualOAprox(arrodonits)) + (perContrari ? '1 - ' + (claudator ? '[' : '') : ''))
      + K(i ? `Se${i}` : 'Se', xs.map(x => x.tex).join(' + ')) + (claudator && i === trossos.length - 1 ? ']' : ''));
    const tancament = R('Sr', igualOAprox(arrodonits || total.aprox)) + K('Sv', total.tex);
    if (trossos.length > 1 && ultim > 8) sumaLinies.push('\\qquad ' + tancament); else sumaLinies[sumaLinies.length - 1] += tancament;
    g.files[FILA.suma] = linies(sumaLinies);
    g.afegeix((perContrari ? 'Resta-ho de $1$' : 'Suma els casos') + `: $${P} ${igualOAprox(total.aprox)} ${total.tex}$.`
      + (arrodonits ? ' Compte: fes el càlcul amb tots els decimals (els de la calculadora) i arrodoneix només al final; '
        + 'amb els valors arrodonits, l\'última xifra podria sortir diferent.' : ''));
    origen = 'Sv';
  }
  g.files[FILA.resposta] = K('Rr', `${P} ${igualOAprox(total.aprox)} ${total.tex}`);
  g.classes[FILA.resposta] = 'final';
  const pc = percentatge(N, E);
  g.afegeix(`Resposta: la probabilitat d'obtenir ${exits} és ${total.aprox ? 'aproximadament ' : ''}$${total.tex}$`
    + (pc ? `, és a dir, ${pc.aprox ? 'aproximadament ' : ''}un $${pc.tex}\\,\\%$.` : '.'), {cursor: {arrossega: origen, fins: 'Rr'}});
  return g.passos;
}


/* ── 5. DEFINICIÓ DEL PROCEDIMENT ──────────────────────────────────── */

arrel.Binomial = Object.freeze({
  titol: 'Distribució binomial',
  categoria: 'probabilitat',
  files: 6,
  perDefecte: PER_DEFECTE,
  exemples: EXEMPLES,
  titolEditor: 'Canvia les dades i la pregunta',
  notaEditor: `n va d'1 a ${MAX_N}; p, de 0,01 a 0,99 (de l'1 % al 99 %); la relació de la pregunta es tria amb les fletxes (=, ≥, ≤, >, <).`,
  modes: {id: 'mode', nom: 'Com es dona la probabilitat?', opcions: [
    {valor: 'u', nom: 'En tant per u (0,25)'},
    {valor: 'cent', nom: 'En tant per cent (25 %)'},
  ]},
  editor: [
    {etiqueta: 'n =', camps: [{id: 'n', sufix: '', nom: 'nombre de repeticions n', min: 1, max: MAX_N, signe: 'negatiu', atenua0: false}]},
    {etiqueta: 'p =', camps: [{id: 'p', sufix: '', nom: 'probabilitat d\'èxit p', min: 1, max: 99, signe: 'negatiu', atenua0: false,
      mostra: (c, v) => (v.mode === 'cent' ? `${c} %` : texP(c).replace('{,}', ','))}]},
    {etiqueta: 'P(X', camps: [
      {id: 'r', sufix: '', nom: 'relació', min: 0, max: RELACIONS.length - 1, signe: 'negatiu', atenua0: false,
        mostra: r => ['=', '≥', '≤', '>', '<'][r]},
      {id: 'k', sufix: ')', nom: 'valor k', min: 0, max: MAX_N, signe: 'negatiu', atenua0: false},
    ]},
  ],
  FILA, RELACIONS, combinatori, cami,
  valida, llegeixAdreca, escriuAdreca, enunciat, resum, passos,
});

})(globalThis);
