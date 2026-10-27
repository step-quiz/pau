/* ═══════════════════════════════════════════════════════════════════
   polinomi-condicions.js — Procediment: un polinomi de grau 3 a partir
   de condicions
   ───────────────────────────────────────────────────────────────────
   Sis problemes fixos (sense editor). Cal trobar a, b, c i d de
   f(x) = ax³ + bx² + cx + d, sempre amb la mateixa tècnica:
     0. llegir l'enunciat: hi ha 4 incògnites, i calen 4 equacions;
     1. escriure f, f' i f'';
     2. traduir cada dada a una equació (f(p) = q, f'(p) = m, f''(p) = 0),
        substituir-hi x i portar-la al sistema; algunes frases amaguen
        dues dades (×2);
     3. resoldre el sistema: cada equació porta «(EQ.n)» a la dreta, d'un altre
        color; primer les equacions amb una sola incògnita (els valors trobats,
        requadrats), es substitueixen els valors coneguts, es combinen equacions
        pel mètode de reducció («(EQ.4) · (−1):», ratlla, suma) i el sistema 2×2
        que queda es resol per reducció (Matrius.passosReduccio2), com vol el
        David a tot el web;
     4. escriure f(x), i comprovar amb f'' els extrems que demana l'enunciat.
   Adreça: polinomi-condicions.html?p=ordenades
           (ordenades, maxim, tangent, inflexio, beneficis, maxmin)

   La pissarra té set files (FILA):
     fila 0  l'enunciat, amb les dades marcades
     fila 1  f(x)      fila 2  f'(x)      fila 3  f''(x)
     fila 4  el sistema, que es va omplint i després es resol
     fila 5  el càlcul del moment (traducció d'una dada, combinació d'equacions, comprovació)
     fila 6  la resposta
   Totes les línies que es veuen són certes: ho comprova proves/comprova.js,
   que té el seu propi model de cada problema.

   La traducció de les dades la genera el codi; la resolució del sistema és
   un guió a les dades de cada problema (caixes, substitueix, divideix,
   combina, reduccio), que el codi executa amb els coeficients exactes.
   Claus: Ef1, E11, E21… frases de l'enunciat; FF…Fe, GF…Ge, HF…He les
   files de f, f' i f''; q1…q4 les quatre equacions (q<n>F «f(p)»,
   q<n>a…q<n>d els termes de a…d, q<n>q «=», q<n>r el segon membre);
   q5, q6… les equacions noves de la resolució; X… les línies de la reducció
   (fila 5); R… la resposta;
   Y…, Z… la comprovació amb f''.
   ═══════════════════════════════════════════════════════════════════ */
(function (arrel) {
'use strict';

const M = arrel.Mates;
const F = arrel.Formules;
const Mt = arrel.Matrius;
const {Fraccio} = M;
const {clau: K} = F;


/* ── 1. ELS PROBLEMES ──────────────────────────────────────────────── */
/*
   Camps de cada problema:
     id, nom      per a l'adreça i per al botó
     text         l'enunciat. [f:…] és f(x) = ax³ + bx² + cx + d, que es porta a la fila 1;
                  [1:…], [2:…]… són les dades; [u:…], una frase d'avís (p. ex. les unitats)
     dades        [{frase, condicions: [condició, …]}], en l'ordre de l'enunciat. Una frase
                  amb dues condicions es marca «×2». Cada condició és
                    {ordre, x, valor, text}: f(x) = valor (ordre 0), f'(x) = valor (1)
                    o f''(x) = valor (2); text explica la traducció;
                    extrem: 'maxim', 'minim' o 'extrem' si l'enunciat diu que n'hi ha un en x
                    (es comprova al final amb f''); inflexio: cert si és un punt d'inflexió;
                    avis: la frase d'avís que també es marca en aquest pas
     resolucio    el guió de la resolució del sistema (les línies es diuen pel número, 1…4,
                  com les etiquetes «(EQ.n)»; als textos, «(EQ.n)» surt del seu color):
                    {caixes: true, text}         requadra els valors que ja es coneixen
                    {substitueix: [n, …]}        hi posa els valors coneguts, i simplifica
                    {divideix: [n, k], text}     divideix l'equació n per k
                    {combina: [i, j], per: [mi, mj], porta: n, text}
                                                 (EQ.i) · mi + (EQ.j) · mj a la fila 5; el
                                                 resultat ocupa el lloc de l'equació n
                    {reduccio: [i, j], text}     el sistema 2×2 de les equacions i, j, per
                                                 reducció (Matrius.passosReduccio2); els
                                                 valors tornen al sistema, requadrats
     solucio      {a, b, c, d}
     nota         (opcional) un aclariment per a la resposta final, entre parèntesis
*/

const F3 = '[f:$f(x) = ax^3 + bx^2 + cx + d$]';

const PROBLEMES = Object.freeze([
  {
    id: 'ordenades', nom: 'Eix d\'ordenades i extrems',
    text: `Troba $a$, $b$, $c$ i $d$ perquè la gràfica de ${F3} [1:talli l'eix d'ordenades en $y = 4$], `
      + '[2:tingui extrems relatius en $x = 0$ i en $x = 2$] i [3:passi pel punt $(1, 2)$].',
    dades: [
      {frase: '1', condicions: [{ordre: 0, x: 0, valor: 4,
        text: '«Talla l\'eix d\'ordenades en $y = 4$» vol dir que la gràfica passa pel punt $(0, 4)$: $f(0) = 4$.'}]},
      {frase: '2', condicions: [
        {ordre: 1, x: 0, valor: 0, extrem: 'extrem',
          text: 'Aquesta frase amaga dues dades (×2). La primera: en un extrem relatiu la recta tangent és horitzontal, és a dir, la derivada val $0$: $f\'(0) = 0$.'},
        {ordre: 1, x: 2, valor: 0, extrem: 'extrem',
          text: 'La segona dada de la mateixa frase: també hi ha un extrem en $x = 2$, i per tant $f\'(2) = 0$.'},
      ]},
      {frase: '3', condicions: [{ordre: 0, x: 1, valor: 2, text: '«Passa pel punt $(1, 2)$» vol dir que $f(1) = 2$.'}]},
    ],
    resolucio: [
      {caixes: true, text: 'Les equacions $(EQ.1)$ i $(EQ.2)$ ja donen el valor d\'una incògnita: $d = 4$ i $c = 0$ (els requadrem).'},
      {substitueix: [3, 4]},
      {divideix: [3, 4], text: 'Divideix $(EQ.3)$ per $4$: és més senzilla i diu el mateix.'},
      {reduccio: [3, 4], text: 'Queden dues equacions, $(EQ.3)$ i $(EQ.4)$, amb dues incògnites, $a$ i $b$ (en groc). Resol-les pel mètode de reducció.'},
    ],
    solucio: {a: 1, b: -3, c: 0, d: 4},
  },
  {
    id: 'maxim', nom: 'Màxim en un punt',
    text: `Troba $a$, $b$, $c$ i $d$ perquè la gràfica de ${F3} [1:passi per l'origen de coordenades], `
      + '[2:tingui un màxim relatiu al punt $(1, 2)$] i [3:tingui la recta tangent horitzontal en $x = -1$].',
    dades: [
      {frase: '1', condicions: [{ordre: 0, x: 0, valor: 0,
        text: '«Passa per l\'origen de coordenades» vol dir que passa pel punt $(0, 0)$: $f(0) = 0$.'}]},
      {frase: '2', condicions: [
        {ordre: 1, x: 1, valor: 0, extrem: 'maxim',
          text: 'Compte: aquesta frase amaga dues dades (×2). La primera: en un màxim relatiu la recta tangent és horitzontal, i per tant $f\'(1) = 0$.'},
        {ordre: 0, x: 1, valor: 2,
          text: 'La segona dada: el màxim és al punt $(1, 2)$, que és de la gràfica: $f(1) = 2$. Si te la descuides, et faltarà una equació!'},
      ]},
      {frase: '3', condicions: [{ordre: 1, x: -1, valor: 0,
        text: 'Recta tangent horitzontal vol dir pendent $0$, i el pendent de la recta tangent és la derivada: $f\'(-1) = 0$.'}]},
    ],
    resolucio: [
      {caixes: true, text: 'L\'equació $(EQ.1)$ ja dona el valor de $d$: $d = 0$ (el requadrem).'},
      {substitueix: [3]},
      {combina: [2, 4], per: [1, -1], porta: 4, text: 'Fixa\'t en $(EQ.2)$ i $(EQ.4)$: només canvia el signe del terme de $b$. Multiplica $(EQ.4)$ per $-1$ i suma-les: $a$ i $c$ desapareixen.'},
      {divideix: [4, 4], text: 'Divideix per $4$.'},
      {substitueix: [2, 3]},
      {reduccio: [2, 3], text: 'Queden dues equacions, $(EQ.2)$ i $(EQ.3)$, amb dues incògnites, $a$ i $c$ (en groc). Resol-les pel mètode de reducció.'},
    ],
    solucio: {a: -1, b: 0, c: 3, d: 0},
  },
  {
    id: 'tangent', nom: 'Recta tangent',
    text: `Troba $a$, $b$, $c$ i $d$ perquè la gràfica de ${F3} [1:tingui per recta tangent en $x = 1$ la recta $y = 2x - 1$], `
      + '[2:tingui un extrem relatiu en $x = 0$] i [3:passi pel punt $(-1, -3)$].',
    dades: [
      {frase: '1', condicions: [
        {ordre: 1, x: 1, valor: 2,
          text: 'Aquesta frase amaga dues dades (×2). La primera: el pendent de la recta tangent és la derivada en el punt. El pendent de $y = 2x - 1$ és $2$: $f\'(1) = 2$.'},
        {ordre: 0, x: 1, valor: 1,
          text: 'La segona: el punt de tangència és de la gràfica i també de la recta. A la recta, $y = 2 \\cdot 1 - 1 = 1$: per tant, $f(1) = 1$.'},
      ]},
      {frase: '2', condicions: [{ordre: 1, x: 0, valor: 0, extrem: 'extrem',
        text: 'En un extrem relatiu la recta tangent és horitzontal: $f\'(0) = 0$.'}]},
      {frase: '3', condicions: [{ordre: 0, x: -1, valor: -3, text: '«Passa pel punt $(-1, -3)$» vol dir que $f(-1) = -3$.'}]},
    ],
    resolucio: [
      {caixes: true, text: 'L\'equació $(EQ.3)$ ja dona el valor de $c$: $c = 0$ (el requadrem).'},
      {substitueix: [1, 2, 4]},
      {combina: [2, 4], per: [1, -1], porta: 4, text: '$(EQ.2)$ i $(EQ.4)$ tenen els mateixos termes $b + d$: multiplica $(EQ.4)$ per $-1$ i suma-les, i desapareixen.'},
      {divideix: [4, 2], text: 'Divideix per $2$.'},
      {substitueix: [1]},
      {divideix: [1, 2], text: 'Divideix per $2$.'},
      {substitueix: [2]},
    ],
    solucio: {a: 2, b: -2, c: 0, d: 1},
  },
  {
    id: 'inflexio', nom: 'Inflexió a l\'origen',
    text: `Troba $a$, $b$, $c$ i $d$ perquè la gràfica de ${F3} [1:tingui un punt d'inflexió a l'origen de coordenades] `
      + 'i [2:passi pels punts $(1, -2)$ i $(2, 2)$].',
    dades: [
      {frase: '1', condicions: [
        {ordre: 2, x: 0, valor: 0, inflexio: true,
          text: 'Aquesta frase amaga dues dades (×2). La primera: en un punt d\'inflexió la segona derivada val $0$: $f\'\'(0) = 0$.'},
        {ordre: 0, x: 0, valor: 0,
          text: 'La segona: el punt d\'inflexió és l\'origen, $(0, 0)$, i és de la gràfica: $f(0) = 0$.'},
      ]},
      {frase: '2', condicions: [
        {ordre: 0, x: 1, valor: -2, text: 'També dues dades (×2). La primera: passa per $(1, -2)$, és a dir, $f(1) = -2$.'},
        {ordre: 0, x: 2, valor: 2, text: 'La segona: passa per $(2, 2)$, és a dir, $f(2) = 2$.'},
      ]},
    ],
    resolucio: [
      {caixes: true, text: 'L\'equació $(EQ.2)$ ja dona el valor de $d$: $d = 0$ (el requadrem).'},
      {divideix: [1, 2], text: 'L\'equació $(EQ.1)$ només té la incògnita $b$: divideix-la per $2$.'},
      {substitueix: [3, 4]},
      {divideix: [4, 2], text: 'Divideix $(EQ.4)$ per $2$: és més senzilla i diu el mateix.'},
      {reduccio: [3, 4], text: 'Queden dues equacions, $(EQ.3)$ i $(EQ.4)$, amb dues incògnites, $a$ i $c$ (en groc). Resol-les pel mètode de reducció.'},
    ],
    solucio: {a: 1, b: 0, c: -3, d: 0},
  },
  {
    id: 'beneficis', nom: 'Beneficis d\'una botiga',
    text: `Els beneficis d'una botiga, [u:en milers d'euros], segueixen la funció ${F3}, on $x$ són els anys que fa que va obrir. `
      + 'Troba $a$, $b$, $c$ i $d$ sabent que [1:el dia que va obrir no tenia beneficis], que [2:el segon any els beneficis van tenir '
      + 'un màxim relatiu de $20\\,000$ €] i que [3:el tercer any hi va haver un punt d\'inflexió].',
    dades: [
      {frase: '1', condicions: [{ordre: 0, x: 0, valor: 0,
        text: 'El dia que va obrir és $x = 0$, i «no tenia beneficis» vol dir que en tenia $0$: $f(0) = 0$.'}]},
      {frase: '2', condicions: [
        {ordre: 1, x: 2, valor: 0, extrem: 'maxim',
          text: 'Aquesta frase amaga dues dades (×2). La primera: el segon any, $x = 2$, hi ha un màxim relatiu, i per tant la derivada hi val $0$: $f\'(2) = 0$.'},
        {ordre: 0, x: 2, valor: 20, avis: 'u',
          text: 'La segona: el valor del màxim. Compte amb les unitats! $f$ dona els beneficis en milers d\'euros, i $20\\,000$ € són $20$ milers d\'euros: $f(2) = 20$, i no $20\\,000$.'},
      ]},
      {frase: '3', condicions: [{ordre: 2, x: 3, valor: 0, inflexio: true,
        text: 'El tercer any, $x = 3$, hi ha un punt d\'inflexió: la segona derivada hi val $0$, $f\'\'(3) = 0$.'}]},
    ],
    resolucio: [
      {caixes: true, text: 'L\'equació $(EQ.1)$ ja dona el valor de $d$: $d = 0$ (el requadrem).'},
      {substitueix: [3]},
      {divideix: [3, 2], text: 'Divideix $(EQ.3)$ per $2$: és més senzilla i diu el mateix.'},
      {combina: [2, 3], per: [1, -1], porta: 3, text: '$(EQ.2)$ i $(EQ.3)$ tenen la mateixa $c$: multiplica $(EQ.3)$ per $-1$ i suma-les, i $c$ desapareix.'},
      {divideix: [3, 2], text: 'Divideix per $2$.'},
      {divideix: [4, 2], text: 'Divideix també $(EQ.4)$ per $2$.'},
      {reduccio: [3, 4], text: 'Queden dues equacions, $(EQ.3)$ i $(EQ.4)$, amb dues incògnites, $a$ i $b$ (en groc). Resol-les pel mètode de reducció.'},
      {substitueix: [2]},
    ],
    solucio: {a: 1, b: -9, c: 24, d: 0},
    nota: '(beneficis en milers d\'euros, al cap de $x$ anys)',
  },
  {
    id: 'maxmin', nom: 'Màxim i mínim',
    text: `Troba $a$, $b$, $c$ i $d$ perquè la gràfica de ${F3} [1:tingui un màxim relatiu al punt $(1, 3)$] `
      + 'i [2:un mínim relatiu al punt $(3, -1)$].',
    dades: [
      {frase: '1', condicions: [
        {ordre: 1, x: 1, valor: 0, extrem: 'maxim',
          text: 'Aquesta frase amaga dues dades (×2). La primera: en un màxim relatiu la derivada val $0$: $f\'(1) = 0$.'},
        {ordre: 0, x: 1, valor: 3, text: 'La segona: el punt $(1, 3)$ és de la gràfica: $f(1) = 3$.'},
      ]},
      {frase: '2', condicions: [
        {ordre: 1, x: 3, valor: 0, extrem: 'minim', text: 'També dues dades (×2). En el mínim relatiu, la derivada val $0$: $f\'(3) = 0$.'},
        {ordre: 0, x: 3, valor: -1, text: 'I el punt $(3, -1)$ és de la gràfica: $f(3) = -1$.'},
      ]},
    ],
    resolucio: [
      {combina: [3, 1], per: [1, -1], porta: 3, text: 'Cap equació no té una sola incògnita: caldrà combinar-les. $(EQ.3)$ i $(EQ.1)$ tenen la mateixa $c$: multiplica $(EQ.1)$ per $-1$ i suma-les, i $c$ desapareix.'},
      {divideix: [3, 4], text: 'Divideix per $4$.'},
      {combina: [4, 2], per: [1, -1], porta: 4, text: '$(EQ.4)$ i $(EQ.2)$ tenen la mateixa $d$: multiplica $(EQ.2)$ per $-1$ i suma-les, i $d$ desapareix.'},
      {divideix: [4, 2], text: 'Divideix per $2$.'},
      {combina: [4, 1], per: [1, -1], porta: 4, text: 'Ara $(EQ.4)$ i $(EQ.1)$ tenen la mateixa $c$: multiplica $(EQ.1)$ per $-1$ i suma-les, i $c$ desapareix.'},
      {divideix: [4, 2], text: 'Divideix per $2$.'},
      {reduccio: [3, 4], text: 'Queden dues equacions, $(EQ.3)$ i $(EQ.4)$, amb dues incògnites, $a$ i $b$ (en groc). Resol-les pel mètode de reducció.'},
      {substitueix: [1]},
      {substitueix: [2]},
    ],
    solucio: {a: 1, b: -6, c: 9, d: -1},
  },
]);

/* Adreça, exemples i textos comuns (l'enunciat és a la pissarra, fila 0, per poder-hi marcar frases). */
const FIXOS = arrel.Dades.problemesFixos(PROBLEMES);
const {perId} = FIXOS;


/* ── 2. FILES I TRADUCCIÓ DE LES DADES ─────────────────────────────── */

/** Files de la pissarra. */
const FILA = Object.freeze({enunciat: 0, funcio: 1, derivada: 2, segona: 3, sistema: 4, calcul: 5, resposta: 6});
const LLETRES = ['a', 'b', 'c', 'd'];
const NOMS = ['f', 'f\'', 'f\'\''];
const PRIMES = ['', '\'', '\'\''];
/** Les tres files de f: la clau de l'expressió i l'expressió general. */
const FUNCIONS = [
  {L: 'F', tex: 'ax^{3} + bx^{2} + cx + d'},
  {L: 'G', tex: '3ax^{2} + 2bx + c'},
  {L: 'H', tex: '6ax + 2b'},
];
const fila = ordre => FILA.funcio + ordre;
const QUANTES = ['cap', 'una', 'dues', 'tres', 'quatre'];

/** Coeficients de a, b, c i d a f(x), f'(x) o f''(x). */
function coeficients(ordre, x) {
  const p = Fraccio.de(x), u = Fraccio.de(1), zero = Fraccio.de(0);
  return [
    [p.potencia(3), p.potencia(2), p, u],
    [p.potencia(2).producte(3), p.producte(2), u, zero],
    [p.producte(6), Fraccio.de(2), zero, zero],
  ][ordre];
}

/** Els termes de f(x), f'(x) o f''(x) amb la x substituïda (a, b, c, d). */
function substituits(ordre, x) {
  const t = M.texEntreParentesis(x);
  return [
    [`a \\cdot ${t}^{3}`, `b \\cdot ${t}^{2}`, `c \\cdot ${t}`, 'd'],
    [`3a \\cdot ${t}^{2}`, `2b \\cdot ${t}`, 'c'],
    [`6a \\cdot ${t}`, '2b'],
  ][ordre];
}

/**
 * Les fórmules (Formules.marcat) de la traducció de la condició n:
 *   capcalera   f'(2) = 0
 *   substituida 3a·2² + 2b·2 + c = 0
 *   equacio     12a + 4b + c = 0
 * Els termes de a, b, c i d porten les claus q<n>a…q<n>d.
 */
function traduccio(n, cond) {
  const P = `q${n}: `;
  const valor = `⟦r:${M.texNombre(cond.valor)}⟧`;
  const termes = substituits(cond.ordre, cond.x).map((tex, i) => `⟦${LLETRES[i]}:${tex}⟧`).join(' + ');
  const coefs = coeficients(cond.ordre, cond.x);
  const equacio = LLETRES.map((v, i) => ({v, c: coefs[i]})).filter(t => !t.c.esZero()).map((t, i) => {
    const a = t.c.abs(), cos = (a.igual(1) ? '' : M.texNombre(a)) + t.v;
    if (i === 0) return `⟦${t.v}:${t.c.signe() < 0 ? '-' : ''}${cos}⟧`;
    return `${t.c.signe() < 0 ? '-' : '+'} ⟦${t.v}:${cos}⟧`;
  }).join(' ');
  return {
    capcalera: `${P}⟦F:${NOMS[cond.ordre]}(${M.texNombre(cond.x)})⟧ = ${valor}`,
    substituida: `${P}${termes} = ${valor}`,
    equacio: `${P}${equacio} = ${valor}`,
    incognites: LLETRES.filter((v, i) => !coefs[i].esZero()),
  };
}

/** Totes les condicions, en ordre, amb la frase d'on surten. */
const condicionsDe = p => p.dades.flatMap(d => d.condicions.map(c => Object.assign({frase: d.frase}, c)));

/** f amb els valors trobats: termes {n, c}, de més a menys grau, de la derivada «ordre». */
function termesSolucio(s, ordre) {
  let t = M.termes([s.d, s.c, s.b, s.a]);
  for (let i = 0; i < ordre; i++) t = M.derivaTermes(t);
  return t;
}


/** Si l'equació L ({coef: [a, b, c, d], r}) ja és un valor («b = -3»), l'índex de la incògnita; si no, −1. */
function esValor(L) {
  const nz = [0, 1, 2, 3].filter(j => !L.coef[j].esZero());
  return nz.length === 1 && L.coef[nz[0]].igual(Fraccio.de(1)) ? nz[0] : -1;
}

/**
 * Una equació del sistema, amb les claus P a…P d (termes), P q («=») i P r (segon membre):
 *   subs:  els valors coneguts {a: Fraccio…}, que se substitueixen («12 \cdot 1 + 4b + 0 = 0»);
 *   caixa: si l'equació ja és un valor, requadrada; marca: la de totes les claus (p. ex. 'tria').
 */
function texLinia(L, {subs = null, caixa = false, marca = ''} = {}) {
  const {P} = L;
  const termes = [];
  L.coef.forEach((c, j) => {
    if (c.esZero()) return;
    const x = LLETRES[j], a = c.abs(), primer = !termes.length;
    const signe = c.signe() < 0 ? (primer ? '-' : ' - ') : (primer ? '' : ' + ');
    let t;
    if (subs && subs[x] !== undefined) {
      const v = subs[x];
      t = a.igual(Fraccio.de(1)) ? (primer && c.signe() > 0 ? M.texNombre(v) : M.texEntreParentesis(v)) : `${M.texNombre(a)} \\cdot ${M.texEntreParentesis(v)}`;
    } else t = (a.igual(Fraccio.de(1)) ? '' : M.texNombre(a)) + x;
    termes.push(primer ? K(P + x, signe + t, marca) : signe + K(P + x, t, marca));
  });
  const tex = `${termes.length ? termes.join('') : '0'} ${F.rel(P + 'q', '=')} ${K(P + 'r', M.texNombre(L.r), marca)}`;
  return caixa && !subs && esValor(L) >= 0 ? `\\boxed{${tex}}` : tex;
}


/* ── 3. PASSOS ─────────────────────────────────────────────────────── */

function passos(valors) {
  const p = perId(valors.p);
  const g = F.guio(7);
  const condicions = condicionsDe(p);
  const total = condicions.length;
  const sistema = [];                       // fórmula (marcat) de cada línia
  let calcul = '';
  const usades = new Set();                 // frases ja marcades

  // L'enunciat, amb les frases marcades: les dades en verd (×2 si amaguen dues condicions), l'avís en groc.
  const marca = id => {
    if (!usades.has(id)) return '';
    if (id === 'u') return 'avis';
    const d = p.dades.find(e => e.frase === id);
    return d.condicions.length > 1 ? 'doble' : 'condicio';
  };
  const lectura = () => F.enunciatMarcat(p.text, marca);
  // El sistema: cada equació amb «(EQ.n)» a la dreta (David). Durant la traducció, fórmules marcat; durant la
  // resolució, els coeficients exactes (sist), i els valors trobats requadrats.
  let sist = null, ambCaixes = false;
  const marques = {};                         // línia → marca de totes les seves claus
  const dibuixa = () => {
    g.files[FILA.enunciat] = lectura().tex;
    const linies = sist ? sist.map((L, i) => texLinia(L, {caixa: ambCaixes, marca: marques[i + 1] || ''})) : sistema.map(F.marcat);
    g.files[FILA.sistema] = linies.length ? Mt.texSistemaEq(linies) : '';
    if (!sist || calcul !== null) g.files[FILA.calcul] = calcul ? F.marcat(calcul) : '';
  };
  const pas = (text, opcions) => { dibuixa(); g.afegeix(text, opcions); };
  const funcio = (ordre, tex) => F.membreEsquerre(FUNCIONS[ordre].L, 'f', 'x', ordre) + K(FUNCIONS[ordre].L + 'e', tex);

  /* 0. La lectura de l'enunciat. */
  pas('Llegeix l\'enunciat. Hi ha quatre incògnites, $a$, $b$, $c$ i $d$: per trobar-les calen quatre equacions. '
    + 'Cada dada de l\'enunciat en dona una, o dues.');

  /* 1. f, f' i f'' (files 1, 2 i 3). */
  g.files[fila(0)] = funcio(0, FUNCIONS[0].tex);
  pas('Escriu la funció. Les dades parlaran de $f$, de $f\'$ i de $f\'\'$: calcula les tres expressions abans de començar.',
    {cursor: {arrossega: lectura().principal.f, fins: 'Fe'}});
  g.files[fila(1)] = funcio(1, FUNCIONS[1].tex);
  pas('Deriva. Les lletres $a$, $b$, $c$ i $d$ són nombres fixos (constants): $ax^3$ es deriva com $5x^3$, i la $d$ desapareix com qualsevol constant.',
    {cursor: {arrossega: 'Fe', fins: 'Ge'}});
  g.files[fila(2)] = funcio(2, FUNCIONS[2].tex);
  pas('Torna a derivar per obtenir $f\'\'(x)$.', {cursor: {arrossega: 'Ge', fins: 'He'}});

  /* 2. Cada dada, traduïda a una equació (fila 5), que va a parar al sistema (fila 4). */
  condicions.forEach((cond, i) => {
    const n = i + 1;
    const t = traduccio(n, cond);
    const frase = lectura().principal[cond.frase];
    usades.add(cond.frase);
    if (cond.avis) usades.add(cond.avis);
    calcul = t.capcalera;
    pas(cond.text, {cursor: {arrossega: frase, fins: `q${n}F`}});
    calcul = t.substituida;
    pas(`Substitueix $x = ${M.texNombre(cond.x)}$ a l'expressió de $${NOMS[cond.ordre]}(x)$.`, {cursor: {clic: FUNCIONS[cond.ordre].L + 'e'}});
    calcul = t.equacio;
    pas('Fes les operacions.' + (t.incognites.length === 1 ? ` Aquesta equació només té una incògnita, $${t.incognites[0]}$.` : ''));
    sistema.push(t.equacio);
    calcul = '';
    pas(n === total
      ? 'Afegeix-la al sistema. Ja tens les quatre equacions: és un sistema de quatre equacions amb quatre incògnites.'
      : `Afegeix-la al sistema. Ja en tens ${QUANTES[n]} de ${QUANTES[total]}.`,
    {cursor: {arrossega: `q${n}q`, fins: `q${n}q`}});
  });

  /* 3. La resolució del sistema: el guió de les dades, amb els coeficients exactes. */
  sist = condicions.map((c, i) => ({P: `q${i + 1}`, coef: coeficients(c.ordre, c.x).slice(), r: Fraccio.de(c.valor)}));
  let nova = condicions.length + 1;                                   // prefix de la propera equació nova (q5, q6…)
  const coneguts = () => {
    const v = {};
    for (const L of sist) { const j = esValor(L); if (j >= 0) v[LLETRES[j]] = L.r; }
    return v;
  };
  const textEq = t => t.replace(/\(EQ\.(\d)\)/g, (m, k) => Mt.texEq(k));
  const llistaText = xs => (xs.length > 1 ? `${xs.slice(0, -1).join(', ')} i ${xs[xs.length - 1]}` : xs[0]);
  for (const r of p.resolucio) {
    if (r.caixes) {
      ambCaixes = true;
      pas(textEq(r.text));
    } else if (r.substitueix) {
      ambCaixes = true;
      const v = coneguts();
      const linies = r.substitueix.filter(n => LLETRES.some((x, j) => !sist[n - 1].coef[j].esZero() && v[x] !== undefined && esValor(sist[n - 1]) !== j));
      const usats = LLETRES.filter((x, j) => v[x] !== undefined && linies.some(n => !sist[n - 1].coef[j].esZero()));
      const substituides = {};
      for (const n of linies) substituides[n] = v;
      const dibuixaSubs = () => {
        dibuixa();
        const ls = sist.map((L, i) => (substituides[i + 1] ? texLinia(L, {subs: substituides[i + 1]}) : texLinia(L, {caixa: ambCaixes})));
        g.files[FILA.sistema] = Mt.texSistemaEq(ls);
      };
      dibuixaSubs();
      g.afegeix(textEq(`Substitueix ${llistaText(usats.map(x => `$${x} = ${M.texNombre(v[x])}$`))} a ${llistaText(linies.map(n => `$(EQ.${n})$`))}.`));
      for (const n of linies) {
        const L = sist[n - 1];
        LLETRES.forEach((x, j) => {
          if (v[x] !== undefined && !L.coef[j].esZero()) { L.r = L.r.resta(L.coef[j].producte(v[x])); L.coef[j] = Fraccio.de(0); }
        });
      }
      pas(linies.some(n => sist[n - 1].coef.filter(c => !c.esZero()).length === 1 && esValor(sist[n - 1]) >= 0)
        ? 'Opera: els nombres passen a l\'altre costat, canviats de signe. Ja tens una altra incògnita (requadrada).'
        : 'Opera: els nombres passen a l\'altre costat, canviats de signe.');
    } else if (r.divideix) {
      ambCaixes = true;
      const [n, k] = r.divideix;
      const L = sist[n - 1], q = Fraccio.de(k);
      L.coef = L.coef.map(c => c.quocient(q));
      L.r = L.r.quocient(q);
      pas(textEq(r.text) + (esValor(L) >= 0 ? ` Ja tens $${LLETRES[esValor(L)]} = ${M.texNombre(L.r)}$ (requadrat).` : ''));
    } else if (r.combina) {
      ambCaixes = true;
      const [i, j] = r.combina, [m1, m2] = r.per.map(x => Fraccio.de(x));
      const P = `q${nova++}`;
      const fila = L => L.coef.concat([L.r]);
      calcul = null;                                                   // la fila 5 la dibuixa passosCombina
      dibuixa();
      const S = Mt.passosCombina(g, {fila: FILA.calcul, P: 'X', E1: fila(sist[i - 1]), E2: fila(sist[j - 1]), m1, m2, vars: LLETRES,
        eqs: [i, j], text: textEq(r.text), textSuma: 'Suma les dues equacions, membre a membre.',
        texSuma: T => texLinia({P, coef: T.slice(0, 4), r: T[4]})});
      sist[r.porta - 1] = {P, coef: S.slice(0, 4), r: S[4]};
      calcul = '';
      pas(textEq(`Aquesta equació ocupa el lloc de $(EQ.${r.porta})$: el sistema que en surt és equivalent.`));
    } else if (r.reduccio) {
      ambCaixes = true;
      const [i, j] = r.reduccio;
      const js = [0, 1, 2, 3].filter(k => !sist[i - 1].coef[k].esZero() || !sist[j - 1].coef[k].esZero());
      if (js.length !== 2) throw new Error(`${p.id}: (EQ.${i}) i (EQ.${j}) no són un sistema 2×2`);
      marques[i] = marques[j] = 'tria';
      pas(textEq(r.text));
      calcul = null;
      const S2 = [i, j].map(n => [sist[n - 1].coef[js[0]], sist[n - 1].coef[js[1]], sist[n - 1].r]);
      const [v1, v2] = Mt.passosReduccio2(g, {S: S2, vars: js.map(k => LLETRES[k]), fila: FILA.calcul, P: 'X', eqs: [i, j]});
      const valor = (k, v) => ({coef: [0, 1, 2, 3].map(q => Fraccio.de(q === k ? 1 : 0)), r: v});
      sist[i - 1] = Object.assign({P: sist[i - 1].P}, valor(js[0], v1));
      sist[j - 1] = Object.assign({P: sist[j - 1].P}, valor(js[1], v2));
      delete marques[i];
      delete marques[j];
      calcul = '';
      pas(`Porta els dos valors al sistema: $${LLETRES[js[0]]} = ${M.texNombre(v1)}$ i $${LLETRES[js[1]]} = ${M.texNombre(v2)}$.`);
    }
  }
  const final = coneguts();
  if (!LLETRES.every(x => final[x] !== undefined && final[x].igual(Fraccio.de(p.solucio[x])))) throw new Error(`${p.id}: el guió no acaba amb la solució`);

  /* 4. La resposta (fila 6). */
  const s = p.solucio;
  const valorsTex = `$a = ${s.a}$, $b = ${s.b}$, $c = ${s.c}$ i $d = ${s.d}$`;
  const resposta = F.membreEsquerre('R', 'f', 'x');
  // Sense «1 ·» (David): si el coeficient val 1, només la potència de x.
  const potencia = i => (i < 2 ? `x^{${3 - i}}` : 'x');
  g.files[FILA.resposta] = resposta + LLETRES.map((v, i) => K('Rt' + (3 - i), i < 3 && Fraccio.de(s[v]).igual(Fraccio.de(1)) ? potencia(i)
    : `${M.texEntreParentesis(s[v])}${i < 3 ? ' \\cdot ' + potencia(i) : ''}`)).join(' + ');
  pas(`Substitueix ${valorsTex} a l'expressió de $f(x)$.`, {cursor: {clic: 'Fe'}});
  const termes = termesSolucio(s, 0);
  g.files[FILA.resposta] = resposta + termes.map((t, i) => {
    const sol = M.texPolinomi([{n: t.n, c: Fraccio.de(t.c).abs()}]);
    const negatiu = Fraccio.de(t.c).signe() < 0;
    return i === 0 ? K('Rt' + t.n, (negatiu ? '-' : '') + sol) : `${negatiu ? '-' : '+'} ${K('Rt' + t.n, sol)}`;
  }).join(' ');
  pas('Simplifica.');

  /* 5. La comprovació amb f'' dels extrems (i de les inflexions) de l'enunciat. */
  const extrems = condicions.filter(c => c.extrem).filter((c, i, l) => l.findIndex(e => e.x === c.x) === i);
  const inflexions = condicions.filter(c => c.inflexio);
  if (extrems.length || inflexions.length) {
    const segona = termesSolucio(s, 2);
    g.files[fila(2)] = funcio(2, M.texPolinomi(segona));
    let text = extrems.length
      ? 'Ara comprova els extrems de l\'enunciat: que $f\' = 0$ no garanteix que n\'hi hagi un, cal mirar el signe de $f\'\'$. '
      : 'Ara comprova el punt d\'inflexió amb la segona derivada. ';
    text += `Amb els valors trobats, $f''(x) = 6ax + 2b = ${M.texPolinomi(segona)}$.`;
    if (inflexions.length) {
      const xs = inflexions.map(c => `$x = ${M.texNombre(c.x)}$`).join(' i ');
      text += ` És una recta inclinada que s'anul·la en ${xs}: hi canvia de signe, i per tant el punt d'inflexió hi és de debò.`;
    }
    pas(text);
    for (const c of extrems) {
      const v = M.valorTermes(segona, c.x);
      const signe = v.signe() < 0 ? '<' : '>';
      g.files[FILA.calcul] = F.membreEsquerre('Y', 'f', M.texNombre(c.x), 2) + F.substituit('Z', segona, c.x)
        + F.rel('Zq', '=') + K('ZR', M.texNombre(v)) + F.rel('Zw', signe) + K('Zz', '0');
      const tipus = v.signe() < 0 ? 'màxim' : 'mínim';
      const x = M.texNombre(c.x);
      g.afegeix(`Com que $f''(${x}) = ${M.texNombre(v)} ${signe} 0$, en $x = ${x}$ hi ha un ${tipus} relatiu.`
        + (c.extrem === 'extrem' ? ' És un extrem, com diu l\'enunciat.' : ' És el que diu l\'enunciat.'));
    }
  }

  /* 6. La resposta final. */
  calcul = '';
  g.files[FILA.calcul] = '';
  g.classes[FILA.resposta] = 'final';
  g.afegeix(`Resposta: ${valorsTex}. És a dir, $f(x) = ${M.texPolinomi(termes)}$${p.nota ? ' ' + p.nota : ''}.`);
  return g.passos;
}


/* ── 4. DEFINICIÓ DEL PROCEDIMENT ──────────────────────────────────── */

arrel.PolinomiCondicions = Object.freeze({
  titol: 'Polinomi de grau 3 a partir de condicions',
  categoria: 'analisi',
  files: 7,
  perDefecte: FIXOS.perDefecte,
  exemples: FIXOS.exemples,
  titolEditor: 'Tria un problema',
  notaEditor: 'Tots es resolen igual: traduir cada dada a una equació, resoldre el sistema i comprovar els extrems.',
  editor: [],
  problemes: PROBLEMES,
  FILA,
  valida: FIXOS.valida, llegeixAdreca: FIXOS.llegeixAdreca, escriuAdreca: FIXOS.escriuAdreca,
  enunciat: FIXOS.enunciat, resum: FIXOS.resum, nomExemple: FIXOS.nomExemple,
  passos,
});

})(globalThis);
