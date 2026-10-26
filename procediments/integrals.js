/* ═══════════════════════════════════════════════════════════════════
   integrals.js — El que comparteixen les pàgines de càlcul integral
   (àrees i paràmetres). Global: Integrals. Carrega després de mates.js,
   formules.js i matrius.js.
   ───────────────────────────────────────────────────────────────────
   Convencions del David (octubre 2026) per a aquestes pàgines:
     · Mentre es resol una equació, l'equació es continua veient: els
       càlculs (passar termes, la fórmula, les solucions) van a una fila
       de sota, la «fila de treball».
     · Un producte s'escriu amb punt: x · (x² − 4) = 0, (x − 1) · (…) = 0.
     · Quan es treu factor comú x, la solució x = 0 s'escriu a la pissarra
       («x = 0 o x² − 4 = 0»), no només al text.
     · En lila (marca «solucio») només les solucions: «x = 0», «x = −2»…,
       mai el factor x.
   Aquest fitxer no toca res de Formules ni de Matrius (són de tot el
   web): fa servir Formules.resolPolinomi tal com és, amb un «guió»
   intermediari que desvia les seves escriptures a la fila de treball.

     resol(g, {fila, treball, P, termes, text, X, davant})
         resol «termes = 0» (grau ≤ 2): l'equació (i la simplificada, si
         divideix) a «fila», precedida de «davant»; la resta, a «treball».
         Torna [{valor, clau, fila}], com resolPolinomi més la fila.
     passosTalls(g, {p, X, files, inici})
         «p = 0», grau ≤ 3 (coeficients de grau 0 cap amunt, Fraccio),
         amb factor comú o Ruffini. files: {equacio, lliures}: l'equació
         va a «equacio»; les altres files (les proves d'arrels, Ruffini,
         «x = r o …», la de treball) agafen, per ordre, les de «lliures»
         que facin falta, així no queda cap fila buida entre dues files
         escrites. Torna les solucions diferents, en ordre.
     marcaSolucio(g, fila, clau)   posa la marca lila a un símbol.
   Claus: E… l'equació; P… les proves; R… Ruffini; W… «x = r o» de la
   fila «segon»; Q… l'equació que queda; Y… la còpia de l'equació que es
   queda a la seva fila quan els càlculs baixen a la de treball.
   ═══════════════════════════════════════════════════════════════════ */
(function (arrel) {
'use strict';

const M = arrel.Mates;
const F = arrel.Formules;
const Mt = arrel.Matrius;
const {Fraccio, texNombre} = M;
const {clau: K, rel: R} = F;
const U = Fraccio.de(1), ZERO = Fraccio.de(0);
const O = '\\quad\\text{o}\\quad ';

const texP = (p, X) => M.texPolinomi(M.termes(p), X);
/** Les mateixes claus amb una «Y» al davant: una còpia que es queda quieta mentre l'original baixa. */
const copia = tex => tex.replace(/\\htmlData\{k=/g, '\\htmlData{k=Y');
/** «x(…)» de resolPolinomi → «x · (…)». */
const ambPunt = (tex, P) => tex.split(`}\\htmlData{k=${P}l}{(}`).join(`} \\cdot \\htmlData{k=${P}l}{(}`);
/** Encara és l'equació «polinomi = 0» (la de partida o dividida), no un pas de la resolució. */
const esEquacio = (tex, P) => tex.includes(`{k=${P}z}`) && !tex.includes(`{k=${P}f}`) && !tex.includes(`{k=${P}S1}`);

function marcaSolucio(g, fila, k) {
  g.files[fila] = g.files[fila].replace(`\\htmlData{k=${k}}`, `\\htmlData{k=${k},marca=solucio}`);
}

function resol(g, {fila, treball, P, termes, text, X = 'x', davant = '', opcions = {}}) {
  let baixat = false, equacio = '';
  const files = new Proxy(g.files, {
    get(t, k) { return k === String(fila) && baixat ? t[treball] : t[k]; },
    set(t, k, v) {
      if (k !== String(fila)) { t[k] = v; return true; }
      v = ambPunt(v, P);
      if (!baixat && (treball === undefined || esEquacio(v, P))) { t[fila] = davant + v; equacio = v; return true; }
      if (!baixat) { baixat = true; t[fila] = davant + copia(equacio); }
      t[treball] = v;
      return true;
    },
  });
  const intermediari = {files, classes: g.classes, afegeix: g.afegeix, completa: g.completa, passos: g.passos};
  const sol = F.resolPolinomi(intermediari, fila, P, termes, text, opcions, X);
  return sol.map(s => ({valor: s.valor, clau: s.clau, fila: baixat ? treball : fila}));
}

/** Coeficients dividits pel factor comú, amb el primer positiu: {q, k}. */
function normalitza(p) {
  const k = p.filter(c => !c.esZero()).map(c => c.num).reduce((a, b) => M.mcd(a, b)) * Math.sign(p[p.length - 1].num);
  return {q: p.map(c => c.quocient(k)), k};
}
const valor = (p, x) => p.reduce((s, c, n) => s.suma(c.producte(Fraccio.de(x).potencia(n))), ZERO);
/** «1^{3} - 3 \cdot 1 + 2»: el polinomi amb X = c, sense operar. */
function texSubstituit(p, c) {
  const x = c < 0 ? `(${c})` : String(c);
  return M.termes(p).map((t, i) => {
    const a = t.c.abs();
    const signe = i === 0 ? (t.c.signe() < 0 ? '-' : '') : (t.c.signe() < 0 ? ' - ' : ' + ');
    if (t.n === 0) return signe + texNombre(a);
    const potencia = t.n === 1 ? x : `${x}^{${t.n}}`;
    return signe + (a.igual(U) ? potencia : `${texNombre(a)} \\cdot ${potencia}`);
  }).join('');
}
const ordena = arrels => arrels.filter((r, i) => arrels.findIndex(s => s.igual(r)) === i).sort((a, b) => a.resta(b).signe());

function passosTalls(g, {p, X = 'x', files: {equacio, lliures}, inici}) {
  const termes = M.termes(p);
  const cua = lliures.slice();
  const files = {equacio};
  const fila = nom => (files[nom] === undefined ? (files[nom] = cua.shift()) : files[nom]);
  const lila = [];                                    // [fila, clau] de cada solució
  const tanca = arrels => {
    lila.forEach(([f, k]) => marcaSolucio(g, f, k));
    const diferents = ordena(arrels);
    const llista = diferents.map(r => `$${X} = ${texNombre(r)}$`);
    const doble = arrels.filter((r, i) => arrels.findIndex(s => s.igual(r)) !== i);
    g.afegeix(!llista.length ? 'L\'equació no té solucions.'
      : (llista.length > 1 ? `Les solucions són ${llista.slice(0, -1).join(', ')} i ${llista[llista.length - 1]}.` : `La solució és ${llista[0]}.`)
        + (doble.length ? ` ${doble.map(r => `$${X} = ${texNombre(r)}$`).join(', ')} surt dues vegades: és una arrel doble.` : ''));
    return diferents;
  };

  /* Grau 1 o 2: l'equació es queda; els càlculs, a la fila de treball. */
  if (p.length <= 3) {
    const sol = resol(g, {fila: equacio, treball: fila('treball'), P: 'E', termes, text: inici, X});
    sol.forEach(s => lila.push([s.fila, s.clau]));
    return tanca(sol.map(s => s.valor));
  }

  /* Grau 3: l'equació, i dividida pel factor comú (o canviada de signe). */
  g.files[equacio] = F.equacio('E', termes, X);
  g.afegeix(inici);
  const {q, k} = normalitza(p);
  if (k !== 1) {
    g.files[equacio] = F.equacio('E', M.termes(q), X);
    g.afegeix(k === -1 ? 'Canvia el signe dels dos membres (multiplica per $-1$): el primer coeficient queda positiu.'
      : `Divideix els dos membres per $${k}$.`);
  }
  const texQ = texP(q, X);
  let resta, r;
  if (q[0].esZero()) {
    /* Sense terme independent: factor comú X (o X²). */
    const j = q.findIndex(c => !c.esZero());
    resta = q.slice(j);
    const factor = j === 1 ? X : `${X}^{${j}}`;
    g.files[equacio] = K('Ef', factor) + ' \\cdot ' + `(${K('Er', texP(resta, X))})` + R('Eq', '=') + K('Ez', '0');
    g.afegeix(`No hi ha terme independent: treu factor comú $${factor}$.`);
    r = ZERO;
  } else {
    /* Una arrel entera, entre els divisors del terme independent. */
    const c0 = q[0].abs().num;
    const candidates = Mt.divisors(c0).flatMap(d => [d, -d]);
    const linies = [];
    for (const c of candidates) {
      const v = valor(q, c);
      linies.push(K(`Pv${linies.length}`, `${X} = ${c}`) + ':\\quad ' + K(`Pe${linies.length}`, `${texSubstituit(q, c)} = ${texNombre(v)}` + (v.esZero() ? '' : ' \\neq 0')));
      g.files[fila('prova')] = linies.length > 1 ? `\\begin{array}{l} ${linies.join(' \\\\[4pt] ')} \\end{array}` : linies[0];
      g.afegeix((linies.length === 1
        ? `Busca una arrel entera: ha de ser un divisor del terme independent, $${c0}$ (${Mt.divisors(c0).map(d => `$\\pm ${d}$`).join(', ')}). Prova $${X} = ${c}$: `
        : `Prova $${X} = ${c}$: `) + (v.esZero() ? 'dona $0$, és una arrel.' : `dona $${texNombre(v)}$, no és una arrel.`));
      if (v.esZero()) { r = Fraccio.de(c); break; }
    }
    /* La regla de Ruffini: q entre (X − r). */
    const {dalt, mig, baix, quocient} = Mt.ruffini(q, r);
    const n = dalt.length;
    const cel = (kk, v) => (v === null || v === undefined ? '' : K(kk, texNombre(v)));
    const taula = fins => `\\begin{array}{r|${'r'.repeat(n)}} & ${dalt.map((v, i) => cel(`Ra${i}`, v)).join(' & ')} \\\\ `
      + `${K('Rx', texNombre(r))} & ${mig.map((v, i) => (i <= fins && i > 0 ? cel(`Rm${i}`, v) : '')).join(' & ')} \\\\ \\hline `
      + `& ${baix.map((v, i) => (i <= fins ? cel(`Rb${i}`, v) : '')).join(' & ')} \\end{array}`;
    g.files[fila('ruffini')] = taula(-1);
    g.afegeix(`Divideix per $${texP([r.oposada(), U], X)}$ amb la regla de Ruffini: a dalt, els coeficients (també els zeros); a l'esquerra, l'arrel $${texNombre(r)}$.`);
    g.files[fila('ruffini')] = taula(0);
    g.afegeix('Baixa el primer coeficient.');
    for (let i = 1; i < n; i++) {
      g.files[fila('ruffini')] = taula(i);
      g.afegeix(`Multiplica per $${texNombre(r)}$ i suma: $${texNombre(baix[i - 1])} \\cdot ${M.texEntreParentesis(r)} = ${texNombre(mig[i])}$, `
        + `$${texNombre(dalt[i])} + ${M.texEntreParentesis(mig[i])} = ${texNombre(baix[i])}$.`
        + (i === n - 1 ? ` El residu és $0$, perquè $${X} = ${texNombre(r)}$ és una arrel.` : ''));
    }
    resta = quocient;
    const factor = texP([r.oposada(), U], X);
    g.files[equacio] = `(${K('Ef', factor)}) \\cdot (${K('Er', texP(resta, X))})` + R('Eq', '=') + K('Ez', '0');
    g.afegeix(`Els nombres de baix (menys el residu) són els coeficients del quocient: $${texQ} = (${factor}) \\cdot (${texP(resta, X)})$.`);
  }

  /* Un producte val 0 si algun factor val 0: «x = r o (el que queda) = 0». */
  const davant = K('Wv', X) + R('Wq', '=') + K('Wr', texNombre(r));
  lila.push([fila('segon'), 'Wr']);
  const parteix = `Un producte val $0$ si algun factor val $0$: $${X} = ${texNombre(r)}$`;
  let arrels = [r];
  if (resta.length > 1) {
    const sol = resol(g, {fila: fila('segon'), treball: fila('treball'), P: 'Q', termes: M.termes(resta), X, davant: davant + O,
      text: `${parteix}, o bé $${texP(resta, X)} = 0$. Resol aquesta equació.`});
    sol.forEach(s => lila.push([s.fila, s.clau]));
    arrels = arrels.concat(sol.map(s => s.valor));
  } else {
    g.files[fila('segon')] = davant;
    g.afegeix(parteix + '.');
  }
  return tanca(arrels);
}

arrel.Integrals = Object.freeze({resol, passosTalls, marcaSolucio});

})(globalThis);
