/* ═══════════════════════════════════════════════════════════════════
   arbres.js — Problemes d'arbres de probabilitat (dades comunes)
   ───────────────────────────────────────────────────────────────────
   Mòdul pur: no toca la pàgina (DOM). Depèn de mates.js i formules.js.
   Exporta «Arbres»: els problemes que fan servir probabilitat-total.js i
   bayes.js, el càlcul de l'arbre i el TeX amb claus per dibuixar-lo.

   L'arbre té dos nivells. El primer té 2 o 3 branques; cada branca del
   primer nivell té 2 branques al segon (un esdeveniment i el contrari).
   Es dibuixa amb claus i fletxes; la probabilitat va a sobre de la
   fletxa:     ⎧ →0,7 F ⎧ →0,1 D
               ⎨        ⎩ →0,9 D̄
               ⎩ →0,3 A …
   Claus: Bl<a> la probabilitat de la branca a del primer nivell, Bl<a><b>
   la de la branca b que en surt; Pp<a><b>, Pq<a><b>, Pr<a><b> el producte
   d'un camí (factors, «=» i resultat).
   ═══════════════════════════════════════════════════════════════════ */
(function (arrel) {
'use strict';

const M = arrel.Mates;
const F = arrel.Formules;
const {Fraccio} = M;
const {clau: K, rel: R} = F;


/* ── 1. ELS PROBLEMES ──────────────────────────────────────────────── */
/*
   Camps de cada problema:
     id, nom       per a l'adreça i per al botó
     format        'decimal' (percentatges i decimals) o 'fraccio' (Laplace: fraccions)
     text          l'enunciat, sense la pregunta; [1:…], [2:…]… són les frases amb dades
     llegenda      els esdeveniments, un nivell de l'arbre per línia: [[[símbol TeX, què vol dir], …], …];
                   cada frase, sencera (l'alumne l'ha d'entendre sola: «la primera bola és vermella»)
     arbre         les branques del primer nivell: {e, p, dada, text}, {e, resta: true} o {e, p, raonat: text, frase}
                   e: l'esdeveniment (TeX); p: '70%' o '3/5'; dada: la frase d'on surt (va a la llista
                   de dades); resta: és el contrari de les altres (1 − …); raonat: es dedueix (text), a
                   partir de la frase «frase»
     fills         {e del primer nivell: [branca, branca]}, igual que «arbre»
     objectiu      les fulles de l'esdeveniment que es busca: [[a, b], …] (a: primer nivell, b: segon)
     pregunta      {frase, tex, text}: la pregunta de la probabilitat total, P(…) i què és, en paraules
     bayes         (per a bayes.js) {tex, text, fulla: [a, b], frase}: P(A|B), la fulla del numerador
*/

const PROBLEMES = Object.freeze([
  {
    id: 'peces', nom: 'Peces de ferro i d\'acer', format: 'decimal',
    text: 'Una fàbrica fa peces de ferro i d\'acer. [1:El $70\\,\\%$ de les peces són de ferro], i la resta són d\'acer. [2:El $90\\,\\%$ de les peces de ferro no tenen cap defecte], mentre que [3:el $4\\,\\%$ de les peces d\'acer són defectuoses]. Agafem una peça a l\'atzar.',
    llegenda: [[['F', 'la peça és de ferro'], ['A', 'la peça és d\'acer']], [['D', 'la peça és defectuosa'], ['\\overline{D}', 'la peça no és defectuosa']]],
    arbre: [
      {e: 'F', p: '70%', dada: '1', text: '«El 70 % de les peces són de ferro»: de cada 100 peces, 70 són de ferro. $P(F) = 70\\,\\% = 0{,}7$.'},
      {e: 'A', resta: true},
    ],
    fills: {
      F: [{e: 'D', resta: true},
        {e: '\\overline{D}', p: '90%', dada: '2', text: '«El 90 % de les peces de ferro no tenen defecte»: aquí només es compten les peces de ferro. '
          + 'És una probabilitat condicionada: $P(\\overline{D} \\mid F) = 0{,}9$, la probabilitat que no sigui defectuosa sabent que és de ferro.'}],
      A: [{e: 'D', p: '4%', dada: '3', text: '«El 4 % de les peces d\'acer són defectuoses»: també és condicionada, només entre les d\'acer: $P(D \\mid A) = 0{,}04$.'},
        {e: '\\overline{D}', resta: true}],
    },
    objectiu: [[0, 0], [1, 0]],
    pregunta: {frase: 'Quina és la probabilitat que sigui defectuosa?', tex: 'P(D)', text: 'que una peça sigui defectuosa'},
    bayes: {tex: 'P(F \\mid D)', text: 'que una peça defectuosa sigui de ferro', fulla: [0, 0],
      frase: 'Si la peça que hem agafat és defectuosa, quina és la probabilitat que sigui de ferro?'},
  },
  {
    id: 'dau', nom: 'El dau de la Rut', format: 'decimal',
    text: 'Per fer un problema, la Rut tira un dau: [1:si surt 1, 2 o 3, el resol ella mateixa]; si no, en copia la solució d\'Internet. [2:Quan el resol ella, l\'encerta el $80\\,\\%$ de les vegades], però [3:la solució d\'Internet només és correcta el $30\\,\\%$ de les vegades].',
    llegenda: [[['R', 'la Rut resol el problema'], ['I', 'la Rut copia la solució d\'Internet']], [['C', 'el problema està bé'], ['\\overline{C}', 'el problema està malament']]],
    arbre: [
      {e: 'R', p: '3/6', dada: '1', text: 'Regla de Laplace: hi ha 6 resultats possibles i 3 de favorables (1, 2 o 3). $P(R) = \\frac{3}{6} = 0{,}5$.'},
      {e: 'I', resta: true},
    ],
    fills: {
      R: [{e: 'C', p: '80%', dada: '2', text: '«Quan el resol ella, l\'encerta el 80 %»: és una probabilitat condicionada, $P(C \\mid R) = 0{,}8$.'},
        {e: '\\overline{C}', resta: true}],
      I: [{e: 'C', p: '30%', dada: '3', text: '«La solució d\'Internet és correcta el 30 % de les vegades»: $P(C \\mid I) = 0{,}3$.'},
        {e: '\\overline{C}', resta: true}],
    },
    objectiu: [[0, 0], [1, 0]],
    pregunta: {frase: 'Quina és la probabilitat que un problema estigui bé?', tex: 'P(C)', text: 'que un problema estigui bé'},
    bayes: {tex: 'P(R \\mid C)', text: 'que un problema que està bé l\'hagi resolt ella', fulla: [0, 0],
      frase: 'Si un problema està bé, quina és la probabilitat que l\'hagi resolt la Rut?'},
  },
  {
    id: 'prova', nom: 'Una prova mèdica', format: 'decimal',
    text: '[1:El $10\\,\\%$ de la població té una malaltia]. Una prova per detectar-la [2:dona positiu en el $90\\,\\%$ dels malalts], però [3:també dona positiu en el $5\\,\\%$ de les persones sanes].',
    llegenda: [[['M', 'la persona té la malaltia'], ['\\overline{M}', 'la persona no té la malaltia']], [['T', 'la prova dona positiu'], ['\\overline{T}', 'la prova dona negatiu']]],
    arbre: [
      {e: 'M', p: '10%', dada: '1', text: '«El 10 % de la població té la malaltia»: $P(M) = 10\\,\\% = 0{,}1$.'},
      {e: '\\overline{M}', resta: true},
    ],
    fills: {
      M: [{e: 'T', p: '90%', dada: '2', text: '«Dona positiu en el 90 % dels malalts»: només entre els malalts. $P(T \\mid M) = 0{,}9$.'},
        {e: '\\overline{T}', resta: true}],
      '\\overline{M}': [{e: 'T', p: '5%', dada: '3', text: '«Dona positiu en el 5 % de les persones sanes»: és un fals positiu. $P(T \\mid \\overline{M}) = 0{,}05$.'},
        {e: '\\overline{T}', resta: true}],
    },
    objectiu: [[0, 0], [1, 0]],
    pregunta: {frase: 'Quina és la probabilitat que la prova doni positiu a una persona triada a l\'atzar?', tex: 'P(T)', text: 'que la prova doni positiu'},
    bayes: {tex: 'P(M \\mid T)', text: 'que una persona amb la prova positiva tingui la malaltia', fulla: [0, 0],
      frase: 'Si la prova d\'una persona dona positiu, quina és la probabilitat que tingui la malaltia?'},
  },
  {
    id: 'correu', nom: 'El filtre del correu', format: 'decimal',
    text: '[1:El $30\\,\\%$ dels correus que rep una persona són brossa]. El filtre [2:envia a la carpeta de brossa el $90\\,\\%$ dels correus brossa], i [3:deixa a la safata d\'entrada el $95\\,\\%$ dels correus bons]: la resta, també els envia a la carpeta de brossa.',
    llegenda: [[['B', 'el correu és brossa'], ['\\overline{B}', 'el correu és bo']], [['C', 'el correu va a la carpeta de brossa'], ['\\overline{C}', 'el correu es queda a la safata d\'entrada']]],
    arbre: [
      {e: 'B', p: '30%', dada: '1', text: '«El 30 % dels correus són brossa»: $P(B) = 0{,}3$.'},
      {e: '\\overline{B}', resta: true},
    ],
    fills: {
      B: [{e: 'C', p: '90%', dada: '2', text: '«Envia a la carpeta de brossa el 90 % dels correus brossa»: $P(C \\mid B) = 0{,}9$.'},
        {e: '\\overline{C}', resta: true}],
      '\\overline{B}': [{e: 'C', resta: true},
        {e: '\\overline{C}', p: '95%', dada: '3', text: '«Deixa a la safata el 95 % dels correus bons»: és la probabilitat de NO anar a la carpeta de brossa '
          + 'sabent que el correu és bo. $P(\\overline{C} \\mid \\overline{B}) = 0{,}95$. Compte: la que necessites és la contrària.'}],
    },
    objectiu: [[0, 0], [1, 0]],
    pregunta: {frase: 'Quina és la probabilitat que un correu vagi a parar a la carpeta de brossa?', tex: 'P(C)', text: 'que un correu vagi a la carpeta de brossa'},
    bayes: {tex: 'P(\\overline{B} \\mid C)', text: 'que un correu de la carpeta de brossa sigui bo', fulla: [1, 0],
      frase: 'Quina proporció dels correus de la carpeta de brossa són bons?'},
  },
  {
    id: 'maquines', nom: 'Tres màquines', format: 'decimal',
    text: 'Una fàbrica té tres màquines. [1:La màquina $A$ fa el $50\\,\\%$ de les peces], [2:la $B$, el $30\\,\\%$], i la $C$, la resta. Són defectuoses [3:el $2\\,\\%$ de les peces de la $A$], [4:el $3\\,\\%$ de les de la $B$] i [5:el $5\\,\\%$ de les de la $C$].',
    llegenda: [[['A', 'la peça l\'ha feta la màquina $A$'], ['B', 'l\'ha feta la màquina $B$'], ['C', 'l\'ha feta la màquina $C$']], [['D', 'la peça és defectuosa'], ['\\overline{D}', 'la peça no és defectuosa']]],
    arbre: [
      {e: 'A', p: '50%', dada: '1', text: '«La màquina A fa el 50 % de les peces»: $P(A) = 0{,}5$.'},
      {e: 'B', p: '30%', dada: '2', text: '«La B, el 30 %»: $P(B) = 0{,}3$.'},
      {e: 'C', resta: true},
    ],
    fills: {
      A: [{e: 'D', p: '2%', dada: '3', text: '«El 2 % de les peces de la A són defectuoses»: $P(D \\mid A) = 0{,}02$.'}, {e: '\\overline{D}', resta: true}],
      B: [{e: 'D', p: '3%', dada: '4', text: '«El 3 % de les de la B»: $P(D \\mid B) = 0{,}03$.'}, {e: '\\overline{D}', resta: true}],
      C: [{e: 'D', p: '5%', dada: '5', text: '«El 5 % de les de la C»: $P(D \\mid C) = 0{,}05$.'}, {e: '\\overline{D}', resta: true}],
    },
    objectiu: [[0, 0], [1, 0], [2, 0]],
    pregunta: {frase: 'Quina és la probabilitat que una peça triada a l\'atzar sigui defectuosa?', tex: 'P(D)', text: 'que una peça sigui defectuosa'},
    bayes: {tex: 'P(C \\mid D)', text: 'que una peça defectuosa sigui de la màquina C', fulla: [2, 0],
      frase: 'Si una peça és defectuosa, quina és la probabilitat que l\'hagi feta la màquina C?'},
  },
  {
    id: 'bossa', nom: 'Dues boles sense reemplaçament', format: 'fraccio',
    text: 'Una bossa té [1:$3$ boles vermelles i $2$ de blaves]. En traiem dues, [2:una darrere l\'altra i sense tornar la primera a la bossa].',
    llegenda: [[['V_1', 'la primera bola és vermella'], ['B_1', 'la primera bola és blava']], [['V_2', 'la segona bola és vermella'], ['B_2', 'la segona bola és blava']]],
    arbre: [
      {e: 'V_1', p: '3/5', dada: '1', text: 'Regla de Laplace: hi ha 5 boles, i 3 són vermelles. $P(V_1) = \\frac{3}{5}$.'},
      {e: 'B_1', resta: true},
    ],
    fills: {
      V_1: [{e: 'V_2', p: '2/4', frase: '2', raonat: 'Sense reemplaçament: si la primera és vermella, a la bossa queden 4 boles, 2 de vermelles i 2 de blaves. $P(V_2 \\mid V_1) = \\frac{2}{4}$.'},
        {e: 'B_2', resta: true}],
      B_1: [{e: 'V_2', p: '3/4', frase: '2', raonat: 'Si la primera és blava, queden 4 boles: 3 de vermelles i 1 de blava. $P(V_2 \\mid B_1) = \\frac{3}{4}$.'},
        {e: 'B_2', resta: true}],
    },
    objectiu: [[0, 0], [1, 1]],
    pregunta: {frase: 'Quina és la probabilitat que les dues siguin del mateix color?', tex: 'P(\\text{mateix color})', text: 'que les dues boles siguin del mateix color'},
    bayes: {tex: 'P(V_1 \\mid V_2)', text: 'que la primera fos vermella si la segona ho és', fulla: [0, 0], objectiu: [[0, 0], [1, 0]], pregunta: 'P(V_2)',
      frase: 'Si la segona bola és vermella, quina és la probabilitat que la primera també ho fos?'},
  },
]);


/* ── 2. VALORS ─────────────────────────────────────────────────────── */

/** Valor d'una dada: '70%' → 7/10, '3/5' → 3/5. */
function valorDe(p) {
  if (p.endsWith('%')) return new Fraccio(Number(p.slice(0, -1)), 100);
  const [a, b] = p.split('/').map(Number);
  return new Fraccio(a, b || 1);
}
/** La dada tal com la diu l'enunciat: «70\,\%» o «\dfrac{3}{5}». */
const font = p => (p.endsWith('%') ? `${p.slice(0, -1)}\\,\\%` : `\\dfrac{${p.split('/')[0]}}{${p.split('/')[1]}}`);
/** Una fracció en TeX, amb \dfrac. */
const texFraccio = v => (v.esEnter() ? String(v.num) : `${v.signe() < 0 ? '-' : ''}\\dfrac{${Math.abs(v.num)}}{${v.den}}`);

/**
 * L'arbre complet, amb tots els valors (Fraccio): {primer: [{e, v, tex, branca}],
 * fills: [[{e, v, tex, branca}, …], …]}. «tex» és com s'escriu el valor a l'arbre:
 * en decimal (format decimal) o la fracció tal com surt (format fracció).
 */
function arbre(p) {
  const nivell = branques => {
    const coneguts = branques.filter(b => !b.resta);
    const resta = coneguts.map(b => valorDe(b.p)).reduce((s, v) => s.resta(v), Fraccio.de(1));
    // En format fracció, el contrari s'escriu amb el mateix denominador que les germanes (2/4 i 2/4, no 1/2).
    const dens = [...new Set(coneguts.map(b => b.p.split('/')[1]))];
    const texResta = p.format === 'fraccio' && dens.length === 1 && dens[0]
      ? `\\dfrac{${Number(dens[0]) - coneguts.reduce((s, b) => s + Number(b.p.split('/')[0]), 0)}}{${dens[0]}}` : null;
    return branques.map(b => {
      const v = b.resta ? resta : valorDe(b.p);
      const tex = p.format === 'decimal' ? M.texDecimal(v) : b.resta ? (texResta || texFraccio(v)) : font(b.p);
      return {e: b.e, v, tex, branca: b};
    });
  };
  const primer = nivell(p.arbre);
  return {primer, fills: primer.map(b => nivell(p.fills[b.e]))};
}

/** Valor en TeX, segons el format del problema (un producte, una suma…). */
const texValor = (p, v) => (p.format === 'decimal' ? M.texDecimal(v) : texFraccio(v));

/** El percentatge d'una probabilitat, en text: «8,2 %». */
const percentatge = v => `${M.texDecimal(v.producte(100))}\\,\\%`;


/* ── 3. EL DIBUIX ──────────────────────────────────────────────────── */

/**
 * TeX de l'arbre. «etiquetes»: {clau: TeX} de les probabilitats que ja es veuen
 * (Bl<a>, Bl<a><b>); les altres fletxes van buides. «productes»: {'<a><b>': TeX
 * amb claus} que s'escriu al costat de la fulla. «marques»: {'<a><b>': true} per
 * a les fulles que es destaquen (els camins de l'esdeveniment que es busca).
 */
function texArbre(p, etiquetes = {}, productes = {}, marques = {}) {
  // \textstyle: la probabilitat, a mida normal (i no petita, com un índex), perquè es llegeixi bé al mòbil.
  const fletxa = k => `\\xrightarrow{\\textstyle ${etiquetes[k] !== undefined ? K(k, etiquetes[k]) : '\\phantom{0{,}00}'}}`;
  const branques = p.arbre.map((b, a) => {
    const fills = p.fills[b.e].map((c, j) => {
      const fulla = marques[`${a}${j}`] ? `\\boxed{${c.e}}` : c.e;
      return `${fletxa(`Bl${a}${j}`)}\\ ${fulla}` + (productes[`${a}${j}`] ? `\\qquad ${productes[`${a}${j}`]}` : '');
    });
    return `${fletxa(`Bl${a}`)}\\ ${b.e}\\ \\left\\{\\begin{array}{l} ${fills.join(' \\\\[2pt] ')} \\end{array}\\right.`;
  });
  return `\\left\\{\\begin{array}{l} ${branques.join(' \\\\[12pt] ')} \\end{array}\\right.`;
}

/** El producte d'un camí, amb claus: «0,7 · 0,1 = 0,07». «marca»: el color del camí (cami0, cami1, cami2), opcional. */
function texProducte(p, t, a, j, marca = '') {
  const [b, c] = [t.primer[a], t.fills[a][j]];
  return K(`Pp${a}${j}`, `${b.tex} \\cdot ${c.tex}`, marca) + R(`Pq${a}${j}`, '=') + K(`Pr${a}${j}`, texValor(p, b.v.producte(c.v)), marca);
}
/** El color del camí i-èsim dels que se sumen. */
const marcaCami = i => `cami${i % 3}`;

/** La llegenda, com a fila de text: un nivell de l'arbre per línia, «$F$: la peça és de ferro; $A$: …». */
const textLlegenda = p => p.llegenda.map(nivell => nivell.map(([e, d]) => `$${e}$: ${d}`).join(';  ')).join('\n');
const texLlegenda = p => F.filaText(textLlegenda(p));

/** Probabilitat de la intersecció d'un camí, en TeX: «P(F \cap D)». */
const texCami = (t, a, j) => `P(${t.primer[a].e} \\cap ${t.fills[a][j].e})`;
/** Probabilitat condicionada d'una branca del segon nivell: «P(D \mid F)». */
const texCondicionada = (t, a, j) => `P(${t.fills[a][j].e} \\mid ${t.primer[a].e})`;

arrel.Arbres = Object.freeze({
  PROBLEMES, valorDe, font, texFraccio, arbre, textLlegenda, texLlegenda, texValor, percentatge, texArbre, texProducte, marcaCami, texCami, texCondicionada,
});

})(globalThis);
