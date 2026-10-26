/* ═══════════════════════════════════════════════════════════════════
   optimitzacio.js — Procediment: problemes d'optimització
   ───────────────────────────────────────────────────────────────────
   Sis problemes fixos (sense editor), versions simplificades de
   problemes de PAU, tots resolts amb la mateixa tècnica:
     0. llegir l'enunciat i marcar-hi què s'ha d'optimitzar (funció
        objectiu, en groc) i quina condició lliga les variables (en verd);
     1. la funció que s'ha d'optimitzar, amb dues variables;
     2. la condició que les lliga; s'aïlla una variable;
     3. se substitueix: la funció passa a dependre d'una sola variable;
     4. el domini d'aquesta variable;
     5. la derivada i els candidats (f' = 0, dins del domini);
     6. la segona derivada diu si és un màxim o un mínim;
     7. la resposta: totes les mides i el valor òptim.
   Adreça: optimitzacio.html?p=hort (hort, capsa, llauna, diposit, pista, nombres)

   La pissarra té set files (FILA):
     fila 0  l'enunciat, amb les frases marcades
     fila 1  la funció          fila 2  la condició
     fila 3  el domini          fila 4  la derivada (i la segona)
     fila 5  el càlcul del moment
     fila 6  la resposta, que es va omplint
   Totes les línies que es veuen són certes: ho comprova proves/comprova.js,
   que té el seu propi model de cada problema.

   Cada problema és una llista de dades TeX (vegeu PROBLEMES). El guió el
   munta la funció passos(), igual per a tots.
   Claus: Eo1…, Ec1… frases de l'enunciat, O… funció, L… condició, Dm domini, P… derivada, e… equació,
   Ee equació escrita a mà, Se/Sw/Sz segona derivada, We i Fe càlculs,
   Rx, Rw, Rf la resposta.
   ═══════════════════════════════════════════════════════════════════ */
(function (arrel) {
'use strict';

const M = arrel.Mates;
const F = arrel.Formules;
const {clau: K, rel: R} = F;


/* ── 1. ELS PROBLEMES ──────────────────────────────────────────────── */
/*
   Camps de cada problema:
     id, nom                   per a l'adreça i per al botó
     lectura {text, objectiu, condicio}
                               l'enunciat, amb les frases [o:…] (funció objectiu) i
                               [c:…] (condició); [o*:…] i [c*:…] marquen la frase
                               d'on surt la fórmula (si no, la primera). Els altres
                               dos camps són els textos dels passos de lectura
     v, w, f                   variable principal, l'altra variable, nom de la funció
     maxim                     cert si es busca un màxim
     funcio {tex, text}        la funció amb dues variables
     condicio [{tex, text}…]   passos de la condició; l'últim, {aillada, text}: w = aillada
     substitucio {tex, text}   la funció després de substituir w
     simplifica [{tex, text}]  com queda la funció, pas a pas
     domini {tex, text}
     derivada {tex, text}
     equacio {manual: [{tex, text}], polinomi: {termes, text}, candidat, descarta}
             manual: passos escrits a mà (l'últim és «v = candidat» si no hi ha polinomi);
             polinomi: es resol amb Formules.resolPolinomi; candidat: el valor (TeX) del domini
     segona {tex, text, valor}  f''(v) i el càlcul «f''(candidat) = …»
     altra {calcul, resposta, text}   el valor de w
     optim {calcul, resposta, text}   el valor de la funció
     resposta                  el text final, amb les unitats
*/

const PROBLEMES = Object.freeze([
  {
    id: 'hort', nom: 'Hort adossat a una paret',
    lectura: {
      text: '[c*:Tenim $40$ m de tanca] per fer un hort rectangular [c:adossat a una paret: la paret fa de quart costat]. '
        + 'Quines mides ha de tenir l\'hort [o*:perquè l\'àrea sigui màxima]? Quina és aquesta àrea?',
      objectiu: 'Què volem optimitzar? «Perquè l\'àrea sigui màxima»: la funció objectiu és l\'àrea de l\'hort, i en busquem el màxim.',
      condicio: 'Què lliga les mides? Els $40$ m de tanca, que només tanquen tres costats perquè la paret fa de quart costat. Aquesta és la condició.',
    },
    v: 'x', w: 'y', f: 'A', maxim: true,
    funcio: {tex: 'x \\cdot y', text: 'Escriu la funció objectiu amb dues variables: anomena $x$ els dos costats perpendiculars a la paret i $y$ el costat paral·lel. L\'àrea és $A = x \\cdot y$.'},
    condicio: [
      {tex: '2x + y = 40', text: 'Escriu la condició com una igualtat: la tanca són dos costats de $x$ i un de $y$, i fa $40$ m.'},
      {aillada: '40 - 2x', text: 'Aïlla $y$ de la condició.'},
    ],
    substitucio: {tex: 'x \\cdot (40 - 2x)', text: 'Substitueix $y$ a la funció: ara l\'àrea només depèn de $x$.'},
    simplifica: [{tex: '40x - 2x^{2}', text: 'Fes el producte.'}],
    domini: {tex: '0 < x < 20', text: 'El domini: $x$ ha de ser positiu, i $y = 40 - 2x$ també, és a dir, $x < 20$.'},
    derivada: {tex: '40 - 4x', text: 'Deriva la funció.'},
    equacio: {polinomi: {termes: [{n: 1, c: -4}, {n: 0, c: 40}], text: 'Els candidats són les solucions de $A\'(x) = 0$.'}, candidat: '10'},
    segona: {tex: '-4', text: 'Per saber si és un màxim, calcula la segona derivada.', valor: 'A\'\'(10) = -4'},
    altra: {calcul: 'y = 40 - 2 \\cdot 10 = 20', resposta: 'y = 20', text: 'Calcula l\'altra mida: $y = 40 - 2x$.'},
    optim: {calcul: 'A(10) = 40 \\cdot 10 - 2 \\cdot 10^{2} = 200', resposta: 'A = 200', text: 'Calcula l\'àrea màxima.'},
    resposta: 'L\'hort ha de fer $10$ m (els costats perpendiculars a la paret) per $20$ m (el costat paral·lel), i l\'àrea màxima és $200$ m².',
  },
  {
    id: 'capsa', nom: 'Capsa de cartró',
    lectura: {
      text: 'D\'un [c*:cartró quadrat de $12$ cm de costat] en [c:retallem un quadrat de costat $x$ a cada cantó], i pleguem les vores '
        + 'per fer una capsa sense tapa. Quant ha de valer $x$ [o*:perquè el volum sigui màxim]? Quines mides té la capsa, i quin volum?',
      objectiu: 'Què volem optimitzar? «Perquè el volum sigui màxim»: la funció objectiu és el volum de la capsa.',
      condicio: 'Què lliga les mides? El cartró fa $12$ cm de costat, i hi retallem $x$ a cada banda: d\'aquí surt el costat de la base.',
    },
    v: 'x', w: 'b', f: 'V', maxim: true,
    funcio: {tex: 'b^{2} \\cdot x', text: 'Escriu la funció objectiu amb dues variables: la base és un quadrat de costat $b$, i l\'altura és $x$, el costat retallat. El volum és $V = b^2 \\cdot x$.'},
    condicio: [
      {aillada: '12 - 2x', text: 'Escriu la condició: al costat de $12$ cm del cartró li treus dos quadrats de costat $x$, un a cada banda.'},
    ],
    substitucio: {tex: '(12 - 2x)^{2} \\cdot x', text: 'Substitueix $b$ a la funció: ara el volum només depèn de $x$.'},
    simplifica: [
      {tex: '(144 - 48x + 4x^{2}) \\cdot x', text: 'Desenvolupa el quadrat: $(a - b)^2 = a^2 - 2ab + b^2$.'},
      {tex: '4x^{3} - 48x^{2} + 144x', text: 'Multiplica per $x$.'},
    ],
    domini: {tex: '0 < x < 6', text: 'El domini: $x > 0$, i la base també ha de ser positiva: $12 - 2x > 0$, és a dir, $x < 6$.'},
    derivada: {tex: '12x^{2} - 96x + 144', text: 'Deriva la funció.'},
    equacio: {
      polinomi: {termes: [{n: 2, c: 12}, {n: 1, c: -96}, {n: 0, c: 144}], text: 'Els candidats són les solucions de $V\'(x) = 0$.'},
      candidat: '2', descarta: ' Però $x = 6$ no és del domini: la capsa no tindria base.',
    },
    segona: {tex: '24x - 96', text: 'Per saber si és un màxim, calcula la segona derivada.', valor: 'V\'\'(2) = 24 \\cdot 2 - 96 = -48'},
    altra: {calcul: 'b = 12 - 2 \\cdot 2 = 8', resposta: 'b = 8', text: 'Calcula el costat de la base: $b = 12 - 2x$.'},
    optim: {calcul: 'V(2) = 4 \\cdot 2^{3} - 48 \\cdot 2^{2} + 144 \\cdot 2 = 128', resposta: 'V = 128', text: 'Calcula el volum màxim.'},
    resposta: 'Cal retallar quadrats de $2$ cm. La capsa fa $8 \\times 8$ cm de base i $2$ cm d\'altura, i el volum màxim és $128$ cm³.',
  },
  {
    id: 'llauna', nom: 'Llauna oberta',
    lectura: {
      text: 'Volem fer una llauna cilíndrica [c:oberta (sense tapa)] [c*:amb $27\\pi$ cm² de planxa]. '
        + 'Quin radi i quina altura ha de tenir [o*:perquè hi càpiga el màxim volum]? Quin és aquest volum?',
      objectiu: 'Què volem optimitzar? «Que hi càpiga el màxim volum»: la funció objectiu és el volum del cilindre.',
      condicio: 'Què lliga el radi i l\'altura? La planxa: en total fa $27\\pi$ cm², i com que la llauna és oberta, només en té el fons i la paret.',
    },
    v: 'r', w: 'h', f: 'V', maxim: true,
    funcio: {tex: '\\pi r^{2} h', text: 'Escriu la funció objectiu amb dues variables, el radi $r$ i l\'altura $h$: $V = \\pi r^2 h$. El nombre $\\pi$ és un nombre com qualsevol altre.'},
    condicio: [
      {tex: '\\pi r^{2} + 2\\pi r h = 27\\pi', text: 'Escriu la condició com una igualtat: el fons ($\\pi r^2$) més la paret ($2\\pi r h$) fan $27\\pi$ cm².'},
      {tex: '2\\pi r h = 27\\pi - \\pi r^{2}', text: 'Per aïllar $h$, passa $\\pi r^2$ a l\'altre costat.'},
      {aillada: '\\dfrac{27 - r^{2}}{2r}', text: 'Divideix per $2\\pi r$: el $\\pi$ se simplifica.'},
    ],
    substitucio: {tex: '\\pi r^{2} \\cdot \\dfrac{27 - r^{2}}{2r}', text: 'Substitueix $h$ a la funció: ara el volum només depèn de $r$.'},
    simplifica: [{tex: '\\dfrac{27\\pi r - \\pi r^{3}}{2}', text: 'Simplifica una $r$ i fes el producte.'}],
    domini: {tex: '0 < r < \\sqrt{27}', text: 'El domini: $r > 0$, i l\'altura també ha de ser positiva: $27 - r^2 > 0$, és a dir, $r < \\sqrt{27}$.'},
    derivada: {tex: '\\dfrac{27\\pi - 3\\pi r^{2}}{2}', text: 'Deriva la funció: el $\\frac{1}{2}$ i el $\\pi$ es mantenen.'},
    equacio: {
      manual: [
        {tex: '\\dfrac{27\\pi - 3\\pi r^{2}}{2} = 0', text: 'Els candidats són les solucions de $V\'(r) = 0$.'},
        {tex: '27\\pi - 3\\pi r^{2} = 0', text: 'Multiplica els dos membres per $2$.'},
      ],
      polinomi: {termes: [{n: 2, c: -3}, {n: 0, c: 27}], text: 'Divideix els dos membres per $\\pi$.'},
      candidat: '3', descarta: ' Però $r = -3$ no és del domini: un radi no pot ser negatiu.',
    },
    segona: {tex: '-3\\pi r', text: 'Per saber si és un màxim, calcula la segona derivada.', valor: 'V\'\'(3) = -3\\pi \\cdot 3 = -9\\pi'},
    altra: {calcul: 'h = \\dfrac{27 - 3^{2}}{2 \\cdot 3} = 3', resposta: 'h = 3', text: 'Calcula l\'altura: $h = \\frac{27 - r^2}{2r}$.'},
    optim: {calcul: 'V(3) = \\dfrac{27\\pi \\cdot 3 - \\pi \\cdot 3^{3}}{2} = 27\\pi', resposta: 'V = 27\\pi', text: 'Calcula el volum màxim.'},
    resposta: 'La llauna ha de tenir $3$ cm de radi i $3$ cm d\'altura, i el volum màxim és $27\\pi \\approx 84{,}8$ cm³.',
  },
  {
    id: 'diposit', nom: 'Dipòsit de cost mínim',
    lectura: {
      text: 'Volem construir un dipòsit de base quadrada, [o:sense tapa], [c*:de $8$ m³]. [o:El material del fons costa $20$ €/m², '
        + 'i el de les parets, $10$ €/m²]. Quines mides fan [o*:que el cost sigui mínim]? Quin és aquest cost?',
      objectiu: 'Què volem optimitzar? «Que el cost sigui mínim»: la funció objectiu és el cost. Per escriure-la calen els preus, i saber que no hi ha tapa.',
      condicio: 'Què lliga les mides? El volum: el dipòsit ha de fer $8$ m³. Aquesta és la condició.',
    },
    v: 'x', w: 'h', f: 'C', maxim: false,
    funcio: {tex: '20x^{2} + 40xh', text: 'Escriu la funció objectiu amb dues variables: el costat de la base, $x$, i l\'altura, $h$. '
      + 'El fons ($x^2$ m²) costa $20x^2$ €, i les quatre parets ($4xh$ m²), $10 \\cdot 4xh = 40xh$ €. No hi ha tapa.'},
    condicio: [
      {tex: 'x^{2} h = 8', text: 'Escriu la condició com una igualtat: el volum, $x^2 h$, és $8$ m³.'},
      {aillada: '\\dfrac{8}{x^{2}}', text: 'Aïlla $h$.'},
    ],
    substitucio: {tex: '20x^{2} + 40x \\cdot \\dfrac{8}{x^{2}}', text: 'Substitueix $h$ a la funció: ara el cost només depèn de $x$.'},
    simplifica: [{tex: '20x^{2} + \\dfrac{320}{x}', text: 'Simplifica una $x$.'}],
    domini: {tex: 'x > 0', text: 'El domini: el costat ha de ser positiu, $x > 0$ (i llavors l\'altura també ho és).'},
    derivada: {tex: '40x - \\dfrac{320}{x^{2}}', text: 'Deriva la funció. Per derivar $\\frac{320}{x}$, escriu-la com una potència: $320x^{-1}$. La seva derivada és $-320x^{-2} = -\\frac{320}{x^2}$.'},
    equacio: {
      manual: [
        {tex: '40x - \\dfrac{320}{x^{2}} = 0', text: 'Els candidats són les solucions de $C\'(x) = 0$.'},
        {tex: '40x^{3} - 320 = 0', text: 'Multiplica els dos membres per $x^2$, que no és $0$.'},
        {tex: 'x^{3} = 8', text: 'Passa el $-320$ a l\'altre costat i divideix per $40$.'},
        {tex: 'x = \\sqrt[3]{8}', text: 'Fes l\'arrel cúbica.'},
        {tex: 'x = 2', text: '$\\sqrt[3]{8} = 2$, perquè $2^3 = 8$.'},
      ],
      candidat: '2',
    },
    segona: {tex: '40 + \\dfrac{640}{x^{3}}', text: 'Per saber si és un mínim, calcula la segona derivada: $-320x^{-2}$ es deriva com $640x^{-3}$.',
      valor: 'C\'\'(2) = 40 + \\dfrac{640}{2^{3}} = 120'},
    altra: {calcul: 'h = \\dfrac{8}{2^{2}} = 2', resposta: 'h = 2', text: 'Calcula l\'altura: $h = \\frac{8}{x^2}$.'},
    optim: {calcul: 'C(2) = 20 \\cdot 2^{2} + \\dfrac{320}{2} = 240', resposta: 'C = 240', text: 'Calcula el cost mínim.'},
    resposta: 'El dipòsit ha de fer $2 \\times 2$ m de base i $2$ m d\'altura, i el cost mínim és $240$ €.',
  },
  {
    id: 'pista', nom: 'Pista d\'atletisme',
    lectura: {
      text: 'Una pista d\'atletisme té forma de rectangle amb un semicercle a cada extrem, i [c*:la corda interior fa $400$ m]. '
        + 'Volem que [o*:el camp rectangular del mig tingui l\'àrea més gran possible]. Quines mides ha de tenir? Quina és aquesta àrea?',
      objectiu: 'Què volem optimitzar? «Que el camp rectangular tingui l\'àrea més gran possible»: la funció objectiu és l\'àrea del rectangle (els semicercles no hi compten).',
      condicio: 'Què lliga les mides? La corda de $400$ m: la formen les dues rectes i els dos semicercles.',
    },
    v: 'r', w: 'x', f: 'A', maxim: true,
    funcio: {tex: '2r \\cdot x', text: 'Escriu la funció objectiu amb dues variables: anomena $x$ la longitud de cada recta i $r$ el radi dels semicercles. '
      + 'El rectangle fa $x$ per $2r$, i $A = 2r \\cdot x$.'},
    condicio: [
      {tex: '2x + 2\\pi r = 400', text: 'Escriu la condició com una igualtat: les dues rectes ($2x$) i els dos semicercles, que junts fan una circumferència ($2\\pi r$), sumen $400$ m.'},
      {aillada: '200 - \\pi r', text: 'Aïlla $x$: divideix per $2$ i passa $\\pi r$ a l\'altre costat.'},
    ],
    substitucio: {tex: '2r \\cdot (200 - \\pi r)', text: 'Substitueix $x$ a la funció: ara l\'àrea només depèn de $r$.'},
    simplifica: [{tex: '400r - 2\\pi r^{2}', text: 'Fes el producte.'}],
    domini: {tex: '0 < r < \\dfrac{200}{\\pi}', text: 'El domini: $r > 0$, i les rectes també han de ser positives: $200 - \\pi r > 0$, és a dir, $r < \\frac{200}{\\pi}$.'},
    derivada: {tex: '400 - 4\\pi r', text: 'Deriva la funció.'},
    equacio: {
      manual: [
        {tex: '400 - 4\\pi r = 0', text: 'Els candidats són les solucions de $A\'(r) = 0$.'},
        {tex: '4\\pi r = 400', text: 'Passa $-4\\pi r$ a l\'altre costat.'},
        {tex: 'r = \\dfrac{100}{\\pi}', text: 'Divideix per $4\\pi$. Deixa el resultat amb $\\pi$: així és exacte.'},
      ],
      candidat: '\\dfrac{100}{\\pi}',
    },
    segona: {tex: '-4\\pi', text: 'Per saber si és un màxim, calcula la segona derivada.', valor: 'A\'\'\\left(\\dfrac{100}{\\pi}\\right) = -4\\pi'},
    altra: {calcul: 'x = 200 - \\pi \\cdot \\dfrac{100}{\\pi} = 100', resposta: 'x = 100', text: 'Calcula la longitud de les rectes: $x = 200 - \\pi r$.'},
    optim: {calcul: 'A\\left(\\dfrac{100}{\\pi}\\right) = 2 \\cdot \\dfrac{100}{\\pi} \\cdot 100 = \\dfrac{20000}{\\pi}', resposta: 'A = \\dfrac{20000}{\\pi}',
      text: 'Calcula l\'àrea màxima: $A = 2r \\cdot x$.'},
    resposta: 'Els semicercles han de tenir radi $\\frac{100}{\\pi} \\approx 31{,}8$ m, i les rectes, $100$ m. El camp fa $100$ m per $\\frac{200}{\\pi} \\approx 63{,}7$ m, '
      + 'i l\'àrea màxima és $\\frac{20000}{\\pi} \\approx 6366$ m².',
  },
  {
    id: 'nombres', nom: 'Dos nombres',
    lectura: {
      text: 'Busquem [c*:dos nombres positius que sumin $12$], tals que [o*:el producte d\'un pel quadrat de l\'altre sigui el més gran possible]. '
        + 'Quins són? Quin és aquest producte?',
      objectiu: 'Què volem optimitzar? «El producte d\'un pel quadrat de l\'altre», que ha de ser el més gran possible: aquesta és la funció objectiu.',
      condicio: 'Què lliga els dos nombres? «Que sumin $12$»: aquesta és la condició.',
    },
    v: 'y', w: 'x', f: 'P', maxim: true,
    funcio: {tex: 'x \\cdot y^{2}', text: 'Escriu la funció objectiu amb dues variables: el producte d\'un nombre, $x$, pel quadrat de l\'altre, $y$, és $P = x \\cdot y^2$.'},
    condicio: [
      {tex: 'x + y = 12', text: 'Escriu la condició com una igualtat: els dos nombres sumen $12$.'},
      {aillada: '12 - y', text: 'Aïlla $x$: és més fàcil que aïllar $y$.'},
    ],
    substitucio: {tex: '(12 - y) \\cdot y^{2}', text: 'Substitueix $x$ a la funció: ara el producte només depèn de $y$.'},
    simplifica: [{tex: '12y^{2} - y^{3}', text: 'Fes el producte.'}],
    domini: {tex: '0 < y < 12', text: 'El domini: els dos nombres són positius, $y > 0$ i $x = 12 - y > 0$.'},
    derivada: {tex: '24y - 3y^{2}', text: 'Deriva la funció.'},
    equacio: {
      polinomi: {termes: [{n: 2, c: -3}, {n: 1, c: 24}], text: 'Els candidats són les solucions de $P\'(y) = 0$.'},
      candidat: '8', descarta: ' Però $y = 0$ no és del domini: els nombres han de ser positius.',
    },
    segona: {tex: '24 - 6y', text: 'Per saber si és un màxim, calcula la segona derivada.', valor: 'P\'\'(8) = 24 - 6 \\cdot 8 = -24'},
    altra: {calcul: 'x = 12 - 8 = 4', resposta: 'x = 4', text: 'Calcula l\'altre nombre: $x = 12 - y$.'},
    optim: {calcul: 'P(8) = 12 \\cdot 8^{2} - 8^{3} = 256', resposta: 'P = 256', text: 'Calcula el producte màxim.'},
    resposta: 'Els nombres són $x = 4$ i $y = 8$, i el producte màxim és $4 \\cdot 8^2 = 256$.',
  },
]);

/* Adreça, exemples i textos comuns (l'enunciat és a la pissarra, fila 0, per poder-hi marcar frases). */
const FIXOS = arrel.Dades.problemesFixos(PROBLEMES);
const {perId} = FIXOS;


/* ── 2. FILES I LECTURA DE L'ENUNCIAT ──────────────────────────────── */

/** Files de la pissarra. */
const FILA = Object.freeze({enunciat: 0, funcio: 1, condicio: 2, domini: 3, derivada: 4, calcul: 5, resposta: 6});
const MARQUES = Object.freeze({o: 'objectiu', c: 'condicio'});

/**
 * L'enunciat com a fila de text. Les frases [o:…] (funció objectiu) i [c:…]
 * (condició) porten les claus Eo1, Eo2… i Ec1, Ec2…; es ressalten les de les
 * categories de «marcades». Torna també la clau de la frase principal de
 * cada categoria (la marcada amb *, o la primera), d'on surt la fórmula.
 */
function lectura(p, marcades) {
  const {tex, principal} = F.enunciatMarcat(p.lectura.text, id => (marcades.includes(id) ? MARQUES[id] : ''));
  return {tex, objectiu: principal.o, condicio: principal.c};
}


/* ── 3. PASSOS ─────────────────────────────────────────────────────── */

function passos(valors) {
  const p = perId(valors.p);
  const {v, w, f} = p;
  const g = F.guio(7);
  const membre = primes => F.membreEsquerre(primes ? 'P' : 'O', f, v, primes);

  /* 0. La lectura de l'enunciat: què s'optimitza i quina condició lliga les variables (fila 0). */
  g.files[FILA.enunciat] = lectura(p, []).tex;
  g.afegeix('Llegeix l\'enunciat. Abans de calcular res, cal trobar-hi dues coses: què volem fer màxim o mínim '
    + '(la funció objectiu) i quina condició lliga les variables.');
  const frases = lectura(p, ['o']);
  g.files[FILA.enunciat] = frases.tex;
  g.afegeix(p.lectura.objectiu + ' (Ho marquem en groc.)', {cursor: {clic: frases.objectiu}});
  g.files[FILA.enunciat] = lectura(p, ['o', 'c']).tex;
  g.afegeix(p.lectura.condicio + ' (Ho marquem en verd.)', {cursor: {clic: frases.condicio}});

  /* 1. La funció objectiu, amb dues variables (fila 1). */
  g.files[FILA.funcio] = K('OF', f) + R('Oq', '=') + K('Oe', p.funcio.tex);
  g.afegeix(p.funcio.text, {cursor: {arrossega: frases.objectiu, fins: 'Oe'}});

  /* 2. La condició, i s'aïlla w (fila 2). */
  p.condicio.forEach((pas, i) => {
    const cursor = i === 0 ? {cursor: {arrossega: frases.condicio, fins: pas.aillada ? 'Lr' : 'Ll'}} : {};
    if (pas.aillada) {
      const abans = Boolean(g.files[FILA.condicio]);    // si ja hi havia la condició, es transforma en w = …
      g.files[FILA.condicio] = K('Lw', w) + R('Lq', '=') + K('Lr', pas.aillada);
      g.afegeix(pas.text, Object.assign({fusiona: abans ? {Lr: ['Ll']} : {}}, cursor));
    } else {
      g.files[FILA.condicio] = K('Ll', pas.tex);
      g.afegeix(pas.text, cursor);
    }
  });

  /* 3. Se substitueix w: la funció d'una sola variable (fila 1). */
  g.files[FILA.funcio] = membre(0) + K('Oe', p.substitucio.tex);
  g.afegeix(p.substitucio.text, {cursor: {arrossega: 'Lr', fins: 'Oe'}});
  for (const pas of p.simplifica) {
    g.files[FILA.funcio] = membre(0) + K('Oe', pas.tex);
    g.afegeix(pas.text);
  }

  /* 4. El domini (fila 3). */
  g.files[FILA.domini] = K('Dm', p.domini.tex);
  g.afegeix(p.domini.text);

  /* 5. La derivada (fila 4) i els candidats (fila 5). */
  // La condició aïllada, ara, és soroll: s'esborra, i es recupera al pas 7 per calcular w.
  const aillada = p.condicio[p.condicio.length - 1].aillada;
  const filaCondicio = K('Lw', w) + R('Lq', '=') + K('Lr', aillada);
  g.files[FILA.condicio] = '';
  g.files[FILA.derivada] = membre(1) + K('Pe', p.derivada.tex);
  const textAillada = `$${w} = ${aillada.replace(/\\dfrac/g, '\\frac')}$`;
  g.afegeix(`${p.derivada.text} (Esborrem ${textAillada}: ara no ens cal. La recuperarem al final per calcular $${w}$.)`);
  const eq = p.equacio;
  for (const pas of eq.manual || []) {
    g.files[FILA.calcul] = K('Ee', pas.tex);
    g.afegeix(pas.text);
  }
  let clauCandidat = 'Ee';
  if (eq.polinomi) {
    const solucions = F.resolPolinomi(g, FILA.calcul, 'e', eq.polinomi.termes, eq.polinomi.text, {}, v);
    clauCandidat = solucions.find(s => M.texNombre(s.valor) === eq.candidat).clau;
  }
  if (eq.descarta) g.completa(eq.descarta);
  g.files[FILA.calcul] = '';
  const rx = K('Rx', `${v} = ${eq.candidat}`);
  g.files[FILA.resposta] = rx;
  g.afegeix(`L'únic candidat dins del domini és $${v} = ${eq.candidat}$.`, {reanomena: {Rx: clauCandidat}});

  /* 6. La segona derivada decideix si és un màxim o un mínim. */
  g.files[FILA.derivada] = membre(2) + K('Pe', p.segona.tex);
  g.afegeix(p.segona.text);
  g.files[FILA.calcul] = K('Se', p.segona.valor) + R('Sw', p.maxim ? '<' : '>') + K('Sz', '0');
  g.afegeix(`Com que $${p.segona.valor.split(' = ')[0]} ${p.maxim ? '<' : '>'} 0$, en $${v} = ${eq.candidat}$ hi ha un `
    + (p.maxim ? 'màxim (la gràfica té forma de ∩).' : 'mínim (la gràfica té forma de ∪).'), {cursor: {clic: 'Rx'}});

  /* 7. La resposta: l'altra variable (amb la condició, que torna a la fila 2) i el valor òptim (fila 6). */
  g.files[FILA.condicio] = filaCondicio;
  g.afegeix(`Per calcular $${w}$, recupera la condició aïllada: ${textAillada}.`);
  g.files[FILA.calcul] = K('We', p.altra.calcul);
  g.afegeix(p.altra.text);
  g.files[FILA.calcul] = '';
  const rw = K('Rw', p.altra.resposta);
  g.files[FILA.resposta] = rx + ',\\ ' + rw;
  g.afegeix('Porta-ho a la resposta.', {fusiona: {Rw: ['We']}, cursor: {arrossega: 'We', fins: 'Rw'}});
  g.files[FILA.calcul] = K('Fe', p.optim.calcul);
  g.afegeix(p.optim.text);
  g.files[FILA.calcul] = '';
  g.files[FILA.resposta] = rx + ',\\ ' + rw + ',\\ ' + K('Rf', p.optim.resposta);
  g.afegeix('Porta-ho a la resposta.', {fusiona: {Rf: ['Fe']}, cursor: {arrossega: 'Fe', fins: 'Rf'}});
  g.classes[FILA.resposta] = 'final';
  g.afegeix(`Resposta: ${p.resposta}`);
  return g.passos;
}


/* ── 4. DEFINICIÓ DEL PROCEDIMENT ──────────────────────────────────── */

arrel.Optimitzacio = Object.freeze({
  titol: 'Optimització',
  categoria: 'analisi',
  files: 7,
  perDefecte: FIXOS.perDefecte,
  exemples: FIXOS.exemples,
  titolEditor: 'Tria un problema',
  notaEditor: 'Tots es resolen amb la mateixa tècnica: llegir l\'enunciat (què s\'optimitza i quina condició hi ha), funció, condició, una sola variable, domini, derivada, segona derivada i resposta.',
  editor: [],
  problemes: PROBLEMES,
  FILA,
  valida: FIXOS.valida, llegeixAdreca: FIXOS.llegeixAdreca, escriuAdreca: FIXOS.escriuAdreca,
  enunciat: FIXOS.enunciat, resum: FIXOS.resum, nomExemple: FIXOS.nomExemple,
  passos,
});

})(globalThis);
