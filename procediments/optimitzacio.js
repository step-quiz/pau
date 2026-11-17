/* ═══════════════════════════════════════════════════════════════════
   optimitzacio.js — Procediment: problemes d'optimització
   ───────────────────────────────────────────────────────────────────
   Vuit problemes fixos (sense editor), versions simplificades de
   problemes de PAU, tots resolts amb la mateixa tècnica:
     0. llegir l'enunciat i marcar-hi què s'ha d'optimitzar (funció
        objectiu, en groc) i quina condició lliga les variables (en verd);
     1. la funció que s'ha d'optimitzar, amb dues variables;
     2. la condició que les lliga; s'aïlla una variable;
     3. se substitueix: la funció passa a dependre d'una sola variable;
     4. el domini d'aquesta variable;
     5. la derivada i els candidats: primer l'equació tal com es planteja,
        «A'(x) = 0»; després, amb l'expressió de A'(x). L'equació es queda a
        la fila calcul i els càlculs baixen a la resposta, la de treball (que després
        ocupa la resposta). Les solucions, en lila; les que no són del
        domini, tatxades;
     6. la segona derivada diu si és un màxim o un mínim;
     7. la resposta: totes les mides i el valor òptim.
   Adreça: optimitzacio.html?p=hort (hort, capsa, llauna, diposit, pista, cartell, finca, parabola)

   La pissarra té vuit files (FILA):
     fila 0  l'esquema petit (a dalt a la dreta de l'enunciat)
     fila 1  l'enunciat, amb les frases marcades
     fila 2  la funció          fila 3  la condició (al pas de la funció, l'esquema gran)
     fila 4  el domini          fila 5  la derivada (i la segona)
     fila 6  el càlcul del moment (l'equació A'(x) = 0, mentre es resol)
     fila 7  la fila de treball de l'equació; després, la resposta, que es va omplint
   Totes les línies que es veuen són certes: ho comprova proves/comprova.js,
   que té el seu propi model de cada problema.

   Cada problema és una llista de dades TeX (vegeu PROBLEMES). El guió el
   munta la funció passos(), igual per a tots.
   Claus: Eo1…, Ec1… frases de l'enunciat, O… funció, L… condició, Dm domini, P… derivada, e… equació
   (eF, eP, ea, eX, eb el membre A'(x); eq, ez «= 0»; Y… la còpia que es queda), Ee equació escrita a mà,
   Ew els passos escrits a mà de la fila de treball, u… l'equació polinòmica de la fila de treball,
   Wv, Wq, Ws «v = candidat» escrit a mà, Se/Sw/Sz segona derivada, We i Fe càlculs, Rx, Rw, Rf la resposta.
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
             abans, el guió escriu «f'(v) = 0» tal com es planteja;
             manual: passos escrits a mà: el primer, «… = 0», hi substitueix f'(v) (fila calcul);
                     els altres, a la fila de treball (l'últim és «v = candidat» si no hi ha polinomi);
             polinomi: es resol amb Formules.resolEquacio (sense passos a mà, el seu text és el de
                     substituir f'(v)); candidat: el valor (TeX) del domini; descarta: per què les
                     altres solucions no serveixen (es tatxen)
     segona {tex, text, valor}  f''(v) i el càlcul «f''(candidat) = …»
     altra {calcul, resposta, text}   el valor de w
     optim {calcul, resposta, text}   el valor de la funció
     resposta                  el text final, amb les unitats
     figura                    l'esquema: dibuix (la funció de
                               ESQUEMES), lletres (mides per dibuixar-lo amb les lletres, sense
                               proporcions reals), final (les mides òptimes, a escala), textos
                               (com s'escriuen les mides òptimes; '2r' és el doble de r) i valor
                               (el valor òptim, amb unitats). proves/comprova.js comprova les lletres
                               i els valors finals
*/

const PROBLEMES = Object.freeze([
  {
    id: 'hort', nom: 'Hort adossat a una paret',
    figura: {dibuix: 'hort', lletres: {x: 7, y: 26}, final: {x: 10, y: 20}, textos: {x: '10', y: '20'}, valor: 'A = 200 m²'},
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
    derivada: {tex: '-4x + 40', text: 'Deriva la funció (ordena els termes de més a menys grau).'},
    equacio: {polinomi: {termes: [{n: 1, c: -4}, {n: 0, c: 40}], text: 'Substitueix $A\'(x)$ per la seva expressió.'}, candidat: '10'},
    segona: {tex: '-4', text: 'Per saber si és un màxim, calcula la segona derivada.', valor: 'A\'\'(10) = -4'},
    altra: {calcul: 'y = 40 - 2 \\cdot 10 = 20', resposta: 'y = 20', text: 'Calcula l\'altra mida: $y = 40 - 2x$.'},
    optim: {calcul: 'A(10) = 40 \\cdot 10 - 2 \\cdot 10^{2} = 200', resposta: 'A = 200', text: 'Calcula l\'àrea màxima.'},
    resposta: 'L\'hort ha de fer $10$ m (els costats perpendiculars a la paret) per $20$ m (el costat paral·lel), i l\'àrea màxima és $200$ m².',
  },
  {
    id: 'capsa', nom: 'Capsa de cartró',
    figura: {dibuix: 'capsa', lletres: {x: 2.5, b: 7}, final: {x: 2, b: 8}, textos: {x: '2', b: '8'}, valor: 'V = 128 cm³'},
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
      polinomi: {termes: [{n: 2, c: 12}, {n: 1, c: -96}, {n: 0, c: 144}], text: 'Substitueix $V\'(x)$ per la seva expressió.'},
      candidat: '2', descarta: ' Però $x = 6$ no és del domini: la capsa no tindria base.',
    },
    segona: {tex: '24x - 96', text: 'Per saber si és un màxim, calcula la segona derivada.', valor: 'V\'\'(2) = 24 \\cdot 2 - 96 = -48'},
    altra: {calcul: 'b = 12 - 2 \\cdot 2 = 8', resposta: 'b = 8', text: 'Calcula el costat de la base: $b = 12 - 2x$.'},
    optim: {calcul: 'V(2) = 4 \\cdot 2^{3} - 48 \\cdot 2^{2} + 144 \\cdot 2 = 128', resposta: 'V = 128', text: 'Calcula el volum màxim.'},
    resposta: 'Cal retallar quadrats de $2$ cm. La capsa fa $8 \\times 8$ cm de base i $2$ cm d\'altura, i el volum màxim és $128$ cm³.',
  },
  {
    id: 'llauna', nom: 'Llauna oberta',
    figura: {dibuix: 'llauna', lletres: {r: 3, h: 4.6}, final: {r: 3, h: 3}, textos: {r: '3', h: '3'}, valor: 'V = 27π cm³'},
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
        {tex: '\\dfrac{27\\pi - 3\\pi r^{2}}{2} = 0', text: 'Substitueix $V\'(r)$ per la seva expressió.'},
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
    figura: {dibuix: 'diposit', lletres: {x: 2.6, h: 1.3}, final: {x: 2, h: 2}, textos: {x: '2', h: '2'}, valor: 'C = 240 €'},
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
        {tex: '40x - \\dfrac{320}{x^{2}} = 0', text: 'Substitueix $C\'(x)$ per la seva expressió.'},
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
    figura: {dibuix: 'pista', lletres: {x: 100, r: 22}, final: {x: 100, r: 100 / Math.PI}, textos: {x: '100', r: '≈ 31,8', '2r': '≈ 63,7'}, valor: 'A ≈ 6366 m²'},
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
        {tex: '400 - 4\\pi r = 0', text: 'Substitueix $A\'(r)$ per la seva expressió.'},
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
    id: 'cartell', nom: 'Cartell amb marges',
    figura: {dibuix: 'cartell', lletres: {x: 7, y: 13.7}, final: {x: 8, y: 12}, textos: {x: '8', y: '12'}, valor: 'A = 216 cm²'},
    lectura: {
      text: 'El [c*:text d\'un cartell ha d\'ocupar $96$ cm²]. [o:Els marges de dalt i de baix fan $3$ cm, i els dels costats, $2$ cm]. '
        + 'Quines mides ha de tenir el cartell [o*:perquè es gasti tan poc paper com sigui possible]? Quant paper caldrà?',
      objectiu: 'Què volem optimitzar? «Que es gasti tan poc paper com sigui possible»: la funció objectiu és l\'àrea del cartell, i en busquem el mínim. Per escriure-la calen els marges.',
      condicio: 'Què lliga les mides? L\'àrea del text, que ha de fer $96$ cm². Aquesta és la condició.',
    },
    v: 'x', w: 'y', f: 'A', maxim: false,
    funcio: {tex: '(x + 4) \\cdot (y + 6)', text: 'Escriu la funció objectiu amb dues variables: el text fa $x$ d\'amplada i $y$ d\'altura. '
      + 'El cartell fa $2$ cm més a cada costat, $x + 4$, i $3$ cm més a dalt i a baix, $y + 6$. El paper és $A = (x + 4) \\cdot (y + 6)$.'},
    condicio: [
      {tex: 'x \\cdot y = 96', text: 'Escriu la condició com una igualtat: el text, $x \\cdot y$, fa $96$ cm².'},
      {aillada: '\\dfrac{96}{x}', text: 'Aïlla $y$.'},
    ],
    substitucio: {tex: '(x + 4) \\cdot \\left(\\dfrac{96}{x} + 6\\right)', text: 'Substitueix $y$ a la funció: ara el paper només depèn de $x$.'},
    simplifica: [
      {tex: '96 + 6x + \\dfrac{384}{x} + 24', text: 'Fes el producte: cada terme del primer parèntesi per cada terme del segon.'},
      {tex: '6x + 120 + \\dfrac{384}{x}', text: 'Suma els nombres: $96 + 24 = 120$.'},
    ],
    domini: {tex: 'x > 0', text: 'El domini: l\'amplada del text ha de ser positiva, $x > 0$ (i llavors l\'altura també ho és).'},
    derivada: {tex: '6 - \\dfrac{384}{x^{2}}', text: 'Deriva la funció. El $120$ és una constant: la seva derivada és $0$. '
      + 'Per derivar $\\frac{384}{x}$, escriu-la com una potència: $384x^{-1}$. La seva derivada és $-384x^{-2} = -\\frac{384}{x^2}$.'},
    equacio: {
      manual: [
        {tex: '6 - \\dfrac{384}{x^{2}} = 0', text: 'Substitueix $A\'(x)$ per la seva expressió.'},
        {tex: '6x^{2} - 384 = 0', text: 'Multiplica els dos membres per $x^2$, que no és $0$.'},
        {tex: 'x^{2} = 64', text: 'Passa el $-384$ a l\'altre costat i divideix per $6$.'},
        {tex: 'x = \\pm 8', text: 'Fes l\'arrel quadrada: hi ha dues solucions.'},
        {tex: 'x = 8', text: 'Però $x = -8$ no és del domini: l\'amplada ha de ser positiva.'},
      ],
      candidat: '8',
    },
    segona: {tex: '\\dfrac{768}{x^{3}}', text: 'Per saber si és un mínim, calcula la segona derivada: $-384x^{-2}$ es deriva com $768x^{-3}$.',
      valor: 'A\'\'(8) = \\dfrac{768}{8^{3}} = \\dfrac{3}{2}'},
    altra: {calcul: 'y = \\dfrac{96}{8} = 12', resposta: 'y = 12', text: 'Calcula l\'altura del text: $y = \\frac{96}{x}$.'},
    optim: {calcul: 'A(8) = 6 \\cdot 8 + 120 + \\dfrac{384}{8} = 216', resposta: 'A = 216', text: 'Calcula el paper mínim.'},
    resposta: 'El text fa $8 \\times 12$ cm, i el cartell, amb els marges, $12 \\times 18$ cm. Cal un mínim de $216$ cm² de paper.',
  },
  {
    id: 'finca', nom: 'Finca al costat d\'un camí',
    figura: {dibuix: 'finca', lletres: {x: 26, y: 31}, final: {x: 40, y: 20}, textos: {x: '40', y: '20'}, valor: 'C = 1600 €'},
    lectura: {
      text: 'Volem tancar [c*:una finca rectangular de $800$ m²] que toca un camí. [o:La tanca del costat del camí costa $30$ €/m, '
        + 'i la dels altres tres costats, $10$ €/m]. Quines mides fan [o*:que la tanca costi tan poc com sigui possible]? Quant costarà?',
      objectiu: 'Què volem optimitzar? «Que la tanca costi tan poc com sigui possible»: la funció objectiu és el cost de la tanca. Per escriure-la calen els dos preus.',
      condicio: 'Què lliga les mides? L\'àrea: la finca ha de fer $800$ m². Aquesta és la condició.',
    },
    v: 'x', w: 'y', f: 'C', maxim: false,
    funcio: {tex: '20x + 40y', text: 'Escriu la funció objectiu amb dues variables: anomena $x$ els dos costats perpendiculars al camí i $y$ els dos paral·lels. '
      + 'El costat del camí costa $30y$ €, l\'altre costat paral·lel, $10y$ €, i els dos costats $x$, $10 \\cdot 2x = 20x$ €. En total, $C = 20x + 40y$.'},
    condicio: [
      {tex: 'x \\cdot y = 800', text: 'Escriu la condició com una igualtat: l\'àrea, $x \\cdot y$, és $800$ m².'},
      {aillada: '\\dfrac{800}{x}', text: 'Aïlla $y$.'},
    ],
    substitucio: {tex: '20x + 40 \\cdot \\dfrac{800}{x}', text: 'Substitueix $y$ a la funció: ara el cost només depèn de $x$.'},
    simplifica: [{tex: '20x + \\dfrac{32000}{x}', text: 'Fes el producte: $40 \\cdot 800 = 32000$.'}],
    domini: {tex: 'x > 0', text: 'El domini: el costat ha de ser positiu, $x > 0$ (i llavors l\'altre costat també ho és).'},
    derivada: {tex: '20 - \\dfrac{32000}{x^{2}}', text: 'Deriva la funció. Per derivar $\\frac{32000}{x}$, escriu-la com una potència: $32000x^{-1}$. '
      + 'La seva derivada és $-32000x^{-2} = -\\frac{32000}{x^2}$.'},
    equacio: {
      manual: [
        {tex: '20 - \\dfrac{32000}{x^{2}} = 0', text: 'Substitueix $C\'(x)$ per la seva expressió.'},
        {tex: '20x^{2} - 32000 = 0', text: 'Multiplica els dos membres per $x^2$, que no és $0$.'},
        {tex: 'x^{2} = 1600', text: 'Passa el $-32000$ a l\'altre costat i divideix per $20$.'},
        {tex: 'x = \\pm 40', text: 'Fes l\'arrel quadrada: hi ha dues solucions.'},
        {tex: 'x = 40', text: 'Però $x = -40$ no és del domini: un costat no pot ser negatiu.'},
      ],
      candidat: '40',
    },
    segona: {tex: '\\dfrac{64000}{x^{3}}', text: 'Per saber si és un mínim, calcula la segona derivada: $-32000x^{-2}$ es deriva com $64000x^{-3}$.',
      valor: 'C\'\'(40) = \\dfrac{64000}{40^{3}} = 1'},
    altra: {calcul: 'y = \\dfrac{800}{40} = 20', resposta: 'y = 20', text: 'Calcula l\'altre costat: $y = \\frac{800}{x}$.'},
    optim: {calcul: 'C(40) = 20 \\cdot 40 + \\dfrac{32000}{40} = 1600', resposta: 'C = 1600', text: 'Calcula el cost mínim.'},
    resposta: 'La finca ha de fer $40$ m (els costats perpendiculars al camí) per $20$ m (el costat del camí), i la tanca costa $1600$ €.',
  },
  {
    id: 'parabola', nom: 'Rectangle sota una paràbola',
    figura: {dibuix: 'parabola', lletres: {x: 2.7}, final: {x: 2}, textos: {x: '2', y: '8'}, valor: 'A = 32'},
    lectura: {
      text: 'Un rectangle té [c:la base sobre l\'eix $OX$] i [c*:els dos vèrtexs de dalt sobre la paràbola $y = 12 - x^2$]. '
        + 'Quines mides fan [o*:que la seva àrea sigui màxima]? Quina és aquesta àrea?',
      objectiu: 'Què volem optimitzar? «Que la seva àrea sigui màxima»: la funció objectiu és l\'àrea del rectangle, i en busquem el màxim.',
      condicio: 'Què lliga les mides? Els vèrtexs de dalt són sobre la paràbola: la seva altura és la $y$ de la paràbola. Aquesta és la condició.',
    },
    v: 'x', w: 'y', f: 'A', maxim: true,
    funcio: {tex: '2x \\cdot y', text: 'Escriu la funció objectiu amb dues variables: els vèrtexs de dalt són $(x, y)$ i $(-x, y)$, amb $x > 0$. '
      + 'La base fa $2x$ i l\'altura, $y$: $A = 2x \\cdot y$.'},
    condicio: [
      {aillada: '12 - x^{2}', text: 'Escriu la condició: el vèrtex $(x, y)$ és sobre la paràbola, és a dir, $y = 12 - x^2$.'},
    ],
    substitucio: {tex: '2x \\cdot (12 - x^{2})', text: 'Substitueix $y$ a la funció: ara l\'àrea només depèn de $x$.'},
    simplifica: [{tex: '24x - 2x^{3}', text: 'Fes el producte.'}],
    domini: {tex: '0 < x < \\sqrt{12}', text: 'El domini: $x > 0$, i l\'altura també ha de ser positiva: $12 - x^2 > 0$, és a dir, $x < \\sqrt{12}$.'},
    derivada: {tex: '-6x^{2} + 24', text: 'Deriva la funció (ordena els termes de més a menys grau).'},
    equacio: {
      polinomi: {termes: [{n: 2, c: -6}, {n: 0, c: 24}], text: 'Substitueix $A\'(x)$ per la seva expressió.'},
      candidat: '2', descarta: ' Però $x = -2$ no és del domini: $x$ ha de ser positiu.',
    },
    segona: {tex: '-12x', text: 'Per saber si és un màxim, calcula la segona derivada.', valor: 'A\'\'(2) = -12 \\cdot 2 = -24'},
    altra: {calcul: 'y = 12 - 2^{2} = 8', resposta: 'y = 8', text: 'Calcula l\'altura: $y = 12 - x^2$.'},
    optim: {calcul: 'A(2) = 24 \\cdot 2 - 2 \\cdot 2^{3} = 32', resposta: 'A = 32', text: 'Calcula l\'àrea màxima.'},
    resposta: 'Els vèrtexs de dalt són a $x = \\pm 2$: el rectangle fa $4$ de base i $8$ d\'altura, i l\'àrea màxima és $32$.',
  },
]);

/* Adreça, exemples i textos comuns (l'enunciat és a la pissarra, fila enunciat, per poder-hi marcar frases). */
const FIXOS = arrel.Dades.problemesFixos(PROBLEMES);
const {perId} = FIXOS;


/* ── 1b. ESQUEMES ──────────────────────────────────────────────────── */
/*
   Un esquema per problema (David, 17/11/2026), en SVG (viewBox 260 × 170), amb la clau «Sq»: al primer pas on
   surt (la funció objectiu) és gran, a la fila de la condició, que encara és buida; al pas següent vola, petit, al
   costat de l'enunciat (fila esquema, que flota a la dreta: estil.css), i a la resposta es redibuixa a escala
   amb les mides òptimes. Colors com a l'enunciat: en groc (.ob) el que s'optimitza, en verd (.co) el que entra a
   la condició. Les mides porten data-l=<variable> (i data-f=2 si és el doble): el motor les il·lumina quan la
   variable surt en una fórmula nova (pas.llum), i el comprovador hi mira les lletres i els valors finals.
*/
const nombre = n => Math.round(n * 10) / 10;
const lin = (a, b, c) => `<line class="${c}" x1="${nombre(a[0])}" y1="${nombre(a[1])}" x2="${nombre(b[0])}" y2="${nombre(b[1])}"/>`;
const pol = (pts, c, tancat = true) => `<${tancat ? 'polygon' : 'polyline'} class="${c}" points="${pts.map(q => q.map(nombre).join(',')).join(' ')}"/>`;
/** Una mida: la lletra (en cursiva) o el valor final (data-l: la variable; f: si és el doble). */
function mida(et, l, x, y, ancora = 'middle', f = 1) {
  const clau = f === 1 ? l : f + l;
  const text = et.final ? et.textos[clau] : clau;
  return `<text class="${et.final ? 'en' : 'et'}" data-l="${l}"${f === 1 ? '' : ` data-f="${f}"`} x="${nombre(x)}" y="${nombre(y)}" text-anchor="${ancora}">${text}</text>`;
}
const paraula = (t, x, y, ancora = 'middle', c = 'en') => `<text class="${c}" x="${nombre(x)}" y="${nombre(y)}" text-anchor="${ancora}">${t}</text>`;
/** Un prisma obert per dalt: el front (amplada a, altura h) i la fondària en perspectiva. Torna els vèrtexs. */
function prisma(X0, Y0, a, h) {
  const dx = 0.42 * a, dy = -0.3 * a;
  const A = [X0, Y0], B = [X0 + a, Y0], C = [X0 + a, Y0 + h], D = [X0, Y0 + h];
  const m = q => [q[0] + dx, q[1] + dy];
  return {A, B, C, D, A2: m(A), B2: m(B), C2: m(C), D2: m(D)};
}
function arestes(P) {
  // Visibles: el front, la cara dreta i la vora de dalt (no hi ha tapa); amagades (discontínues), les tres del vèrtex del fons.
  return pol([P.A, P.B, P.C, P.D], 'tr') + pol([P.B, P.B2, P.C2, P.C], 'tr') + pol([P.A, P.A2, P.B2], 'tr', false)
    + lin(P.D2, P.A2, 'td') + lin(P.D2, P.C2, 'td') + lin(P.D2, P.D, 'td');
}

const ESQUEMES = {
  hort(m, et) {
    const s = Math.min(180 / m.y, 96 / m.x), w = m.y * s, h = m.x * s, X0 = 130 - w / 2, Y0 = 36;
    let t = lin([X0 - 24, Y0 - 1], [X0 + w + 24, Y0 - 1], 'pa');
    for (let x = X0 - 22; x < X0 + w + 22; x += 10) t += lin([x, Y0 - 2], [x + 8, Y0 - 12], 'ra');
    t += paraula('paret', X0 + w + 24, Y0 - 17, 'end');
    t += `<rect class="ob" x="${nombre(X0)}" y="${Y0}" width="${nombre(w)}" height="${nombre(h)}"/>`;
    t += pol([[X0, Y0], [X0, Y0 + h], [X0 + w, Y0 + h], [X0 + w, Y0]], 'co', false);
    t += mida(et, 'x', X0 - 8, Y0 + h / 2 + 5, 'end') + mida(et, 'x', X0 + w + 8, Y0 + h / 2 + 5, 'start') + mida(et, 'y', 130, Y0 + h + 19);
    t += paraula(et.final ? et.valor : 'hort', 130, Y0 + h / 2 + 5);
    return t;
  },
  capsa(m, et) {
    const L = m.b + 2 * m.x, S = 104, X = 24, Y = 36, c = m.x * S / L;
    let t = `<rect class="tr" x="${X}" y="${Y}" width="${S}" height="${S}"/>`;
    for (const [px, py] of [[X, Y], [X + S - c, Y], [X, Y + S - c], [X + S - c, Y + S - c]]) t += `<rect class="ta" x="${nombre(px)}" y="${nombre(py)}" width="${nombre(c)}" height="${nombre(c)}"/>`;
    t += `<rect class="td" x="${nombre(X + c)}" y="${nombre(Y + c)}" width="${nombre(S - 2 * c)}" height="${nombre(S - 2 * c)}"/>`;
    t += lin([X, Y], [X + S, Y], 'co') + paraula('12', X + S / 2, Y - 8);
    t += mida(et, 'x', X - 5, Y + c / 2 + 5, 'end') + mida(et, 'b', X + S / 2, Y + S / 2 + 5);
    t += `<path class="tr" d="M134 88 h13 m-5 -4 l5 4 l-5 4"/>`;
    const k = Math.min(88 / (1.42 * m.b), 96 / (m.x + 0.3 * m.b)), a = m.b * k, h = m.x * k;
    const X0 = 162 + (88 - 1.42 * a) / 2, Y0 = 138 - h, P = prisma(X0, Y0, a, h);
    t += pol([P.A, P.A2, P.B2, P.C2, P.C, P.D], 'ob') + arestes(P);
    t += mida(et, 'b', X0 + a / 2, Y0 + h + 17) + mida(et, 'b', (P.C[0] + P.C2[0]) / 2 + 7, (P.C[1] + P.C2[1]) / 2 + 13, 'start') + mida(et, 'x', X0 - 6, Y0 + h / 2 + 5, 'end');
    if (et.final) t += paraula(et.valor, 76, 164);
    return t;
  },
  llauna(m, et) {
    const s = Math.min(60 / m.r, 92 / m.h), rx = m.r * s, H = m.h * s, ry = 0.32 * rx, cx = 120, Y = 26 + ry, Yb = Y + H;
    let t = `<path class="ob" d="M${nombre(cx - rx)} ${nombre(Y)} V${nombre(Yb)} A${nombre(rx)} ${nombre(ry)} 0 0 0 ${nombre(cx + rx)} ${nombre(Yb)} V${nombre(Y)} A${nombre(rx)} ${nombre(ry)} 0 0 0 ${nombre(cx - rx)} ${nombre(Y)} Z"/>`;
    t += `<ellipse class="tr" cx="${cx}" cy="${nombre(Y)}" rx="${nombre(rx)}" ry="${nombre(ry)}"/>`;
    t += `<path class="td" d="M${nombre(cx - rx)} ${nombre(Yb)} A${nombre(rx)} ${nombre(ry)} 0 0 1 ${nombre(cx + rx)} ${nombre(Yb)}"/>`;
    t += `<path class="co" d="M${nombre(cx - rx)} ${nombre(Y)} V${nombre(Yb)} A${nombre(rx)} ${nombre(ry)} 0 0 0 ${nombre(cx + rx)} ${nombre(Yb)} V${nombre(Y)}"/>`;
    t += lin([cx, Y], [cx + rx, Y], 'tr') + `<circle cx="${cx}" cy="${nombre(Y)}" r="2" fill="currentColor"/>`;
    t += mida(et, 'r', cx + rx * 0.42, Y + ry * 0.72);
    const xh = cx + rx + 14;
    t += `<path class="tr" d="M${nombre(xh)} ${nombre(Y)} V${nombre(Yb)} m-5 0 h10 M${nombre(xh - 5)} ${nombre(Y)} h10"/>` + mida(et, 'h', xh + 8, (Y + Yb) / 2 + 5, 'start');
    t += paraula('sense tapa', cx, Y - ry - 7);
    if (et.final) t += paraula(et.valor, cx, Yb + ry + 20);
    return t;
  },
  diposit(m, et) {
    const k = Math.min(150 / (1.42 * m.x), 96 / (m.h + 0.3 * m.x)), a = m.x * k, h = m.h * k;
    const X0 = 130 - 1.42 * a / 2, Y0 = 132 - h, P = prisma(X0, Y0, a, h);
    let t = pol([P.A, P.A2, P.B2, P.C2, P.C, P.D], 'ob') + pol([P.D, P.C, P.C2, P.D2], 'ob fons') + arestes(P);
    t += mida(et, 'x', X0 + a / 2, Y0 + h + 17) + mida(et, 'x', (P.C[0] + P.C2[0]) / 2 + 7, (P.C[1] + P.C2[1]) / 2 + 13, 'start') + mida(et, 'h', X0 - 7, Y0 + h / 2 + 5, 'end');
    t += paraula('sense tapa', X0 + 0.71 * a, Y0 - 0.3 * a - 8);
    if (et.final) t += paraula(et.valor, 130, 167);
    return t;
  },
  pista(m, et) {
    const s = Math.min(196 / (m.x + 2 * m.r), 100 / (2 * m.r)), w = m.x * s, R = m.r * s, X0 = 130 - w / 2, cy = 82, Y0 = cy - R;
    let t = `<rect class="ob" x="${nombre(X0)}" y="${nombre(Y0)}" width="${nombre(w)}" height="${nombre(2 * R)}"/>`;
    t += `<path class="co" d="M${nombre(X0)} ${nombre(Y0)} H${nombre(X0 + w)} A${nombre(R)} ${nombre(R)} 0 0 1 ${nombre(X0 + w)} ${nombre(cy + R)} H${nombre(X0)} A${nombre(R)} ${nombre(R)} 0 0 1 ${nombre(X0)} ${nombre(Y0)} Z"/>`;
    t += lin([X0, Y0], [X0, cy + R], 'td') + lin([X0 + w, Y0], [X0 + w, cy + R], 'td');
    const fi = [X0 + w + R * 0.707, cy - R * 0.707];
    t += lin([X0 + w, cy], fi, 'tr') + `<circle cx="${nombre(X0 + w)}" cy="${cy}" r="2" fill="currentColor"/>`;
    t += mida(et, 'r', fi[0] + 4, fi[1] - 12, 'middle');
    t += mida(et, 'x', 130, Y0 - 8) + mida(et, 'r', 130, cy + 5, 'middle', 2);
    if (et.final) t += paraula(et.valor, 130, cy + R + 22);
    return t;
  },
  cartell(m, et) {
    const W = m.x + 4, H = m.y + 6, s = Math.min(170 / W, 136 / H), w = W * s, h = H * s, X0 = 130 - w / 2, Y0 = 10 + (136 - h) / 2;
    let t = `<rect class="ob" x="${nombre(X0)}" y="${nombre(Y0)}" width="${nombre(w)}" height="${nombre(h)}"/>`
      + `<rect class="tr" x="${nombre(X0)}" y="${nombre(Y0)}" width="${nombre(w)}" height="${nombre(h)}"/>`;
    const tx = X0 + 2 * s, ty = Y0 + 3 * s, tw = m.x * s, th = m.y * s;
    t += `<rect class="co" x="${nombre(tx)}" y="${nombre(ty)}" width="${nombre(tw)}" height="${nombre(th)}"/>`;
    t += paraula('3', 130, Y0 + 1.5 * s + 4) + paraula('2', X0 + s, ty + th / 2 + 4);
    t += mida(et, 'x', 130, ty + 17) + mida(et, 'y', tx + tw - 6, ty + th / 2 + 5, 'end');   // el rectangle verd és el text
    if (et.final) t += paraula(et.valor, 130, 166);
    return t;
  },
  finca(m, et) {
    const s = Math.min(180 / m.y, 96 / m.x), w = m.y * s, h = m.x * s, X0 = 130 - w / 2, Yb = 128, Y0 = Yb - h;
    let t = `<rect class="tr" x="24" y="${Yb + 4}" width="212" height="16"/>` + paraula('camí', 130, Yb + 16);
    t += `<rect class="cof" x="${nombre(X0)}" y="${nombre(Y0)}" width="${nombre(w)}" height="${nombre(h)}"/>`;
    t += pol([[X0, Yb], [X0, Y0], [X0 + w, Y0], [X0 + w, Yb]], 'obl', false) + lin([X0, Yb], [X0 + w, Yb], 'obl gruixut');
    t += mida(et, 'x', X0 - 8, Y0 + h / 2 + 5, 'end') + mida(et, 'y', 130, Y0 - 9);
    if (et.final) t += paraula(et.valor, 130, 166);
    return t;
  },
  parabola(m, et) {
    const ox = 130, oy = 142, sx = 27, sy = 10, y = 12 - m.x * m.x, X = u => ox + u * sx, Y = v => oy - v * sy;
    let t = lin([18, oy], [242, oy], 'ei') + lin([ox, oy + 10], [ox, 12], 'ei') + paraula('O', ox - 6, oy + 14, 'end');
    t += `<rect class="ob" x="${nombre(X(-m.x))}" y="${nombre(Y(y))}" width="${nombre(2 * m.x * sx)}" height="${nombre(y * sy)}"/>`;
    t += pol([[X(-m.x), oy], [X(-m.x), Y(y)], [X(m.x), Y(y)], [X(m.x), oy]], 'tr', false);
    const punts = [];
    for (let u = -3.6; u <= 3.601; u += 0.1) punts.push([X(u), Y(12 - u * u)]);
    t += pol(punts, 'co', false);
    for (const u of [-m.x, m.x]) t += `<circle class="vertex" cx="${nombre(X(u))}" cy="${nombre(Y(y))}" r="3"/>`;
    t += mida(et, 'x', X(m.x / 2), oy + 16) + mida(et, 'y', X(m.x) - 6, Y(y / 2) + 5, 'end');
    if (et.final) t += paraula(et.valor, X(-m.x / 2), Y(y / 2) + 5);
    return t;
  },
};

/** L'esquema d'un problema: amb les lletres, o (final) a escala amb les mides i el valor òptims. */
function esquema(p, final = false) {
  const fig = p.figura;
  const et = final ? {final: true, textos: fig.textos, valor: fig.valor} : {final: false};
  return `<svg data-k="Sq" class="esquema" viewBox="0 0 260 170" width="14em" height="9.154em" role="img" aria-label="Esquema: ${p.nom}">`
    + ESQUEMES[fig.dibuix](final ? fig.final : fig.lletres, et) + '</svg>';
}
/** Les variables del problema que surten en un TeX (per il·luminar-les a l'esquema). */
function lletresDe(p, tex) {
  if (!p.figura) return [];
  const net = tex.replace(/\\htmlData\{[^}]*\}/g, '').replace(/\\[A-Za-z]+/g, ' ');
  return [p.v, p.w].filter(l => net.includes(l));      // les variables són d'una lletra (minúscula)
}


/* ── 2. FILES I LECTURA DE L'ENUNCIAT ──────────────────────────────── */

/** Files de la pissarra. */
const FILA = Object.freeze({esquema: 0, enunciat: 1, funcio: 2, condicio: 3, domini: 4, derivada: 5, calcul: 6, resposta: 7});
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

/** Una fórmula de la pissarra, per al text de l'explicació: les fraccions, petites (\frac, no \dfrac). */
const textual = tex => tex.replace(/\\dfrac/g, '\\frac');

function passos(valors) {
  const p = perId(valors.p);
  const {v, w, f} = p;
  const g = F.guio(8);
  // L'esquema (si n'hi ha): la fila esquema flota a la dreta, i l'enunciat li deixa lloc des del primer pas (així no
  // canvia de línies quan hi arriba l'esquema, i el motor el deixa quiet).
  const llum = tex => ({llum: lletresDe(p, tex)});
  if (p.figura) { g.classes[FILA.esquema] = 'esquema-costat'; g.classes[FILA.enunciat] = 'amb-esquema'; }
  const membre = primes => F.membreEsquerre(primes ? 'P' : 'O', f, v, primes);

  /* 0. La lectura de l'enunciat: què s'optimitza i quina condició lliga les variables (fila enunciat). */
  g.files[FILA.enunciat] = lectura(p, []).tex;
  g.afegeix('Llegeix l\'enunciat. Abans de calcular res, cal trobar-hi dues coses: què volem fer màxim o mínim '
    + '(la funció objectiu) i quina condició lliga les variables.');
  const frases = lectura(p, ['o']);
  g.files[FILA.enunciat] = frases.tex;
  g.afegeix(p.lectura.objectiu + ' (Ho marquem en groc.)', {cursor: {clic: frases.objectiu}});
  g.files[FILA.enunciat] = lectura(p, ['o', 'c']).tex;
  g.afegeix(p.lectura.condicio + ' (Ho marquem en verd.)', {cursor: {clic: frases.condicio}});

  /* 1. La funció objectiu, amb dues variables (fila funcio). */
  g.files[FILA.funcio] = K('OF', f) + R('Oq', '=') + K('Oe', p.funcio.tex);
  if (p.figura) g.files[FILA.condicio] = esquema(p);     // l'esquema, gran, a la fila de la condició (encara buida)
  g.afegeix(p.funcio.text, Object.assign({cursor: {arrossega: frases.objectiu, fins: 'Oe'}}, llum(p.funcio.tex)));

  /* 2. La condició, i s'aïlla w (fila condicio). */
  p.condicio.forEach((pas, i) => {
    const cursor = Object.assign(i === 0 ? {cursor: {arrossega: frases.condicio, fins: pas.aillada ? 'Lr' : 'Ll'}} : {},
      i === 0 ? llum(pas.tex || `${w} = ${pas.aillada}`) : {});
    if (i === 0 && p.figura) { g.files[FILA.esquema] = esquema(p); g.files[FILA.condicio] = ''; }   // l'esquema vola al costat de l'enunciat
    if (pas.aillada) {
      const abans = Boolean(g.files[FILA.condicio]);    // si ja hi havia la condició, es transforma en w = …
      g.files[FILA.condicio] = K('Lw', w) + R('Lq', '=') + K('Lr', pas.aillada);
      g.afegeix(pas.text, Object.assign({fusiona: abans ? {Lr: ['Ll']} : {}}, cursor));
    } else {
      g.files[FILA.condicio] = K('Ll', pas.tex);
      g.afegeix(pas.text, cursor);
    }
  });

  /* 3. Se substitueix w: la funció d'una sola variable (fila funcio). */
  g.files[FILA.funcio] = membre(0) + K('Oe', p.substitucio.tex);
  g.afegeix(p.substitucio.text, Object.assign({cursor: {arrossega: 'Lr', fins: 'Oe'}}, llum(p.substitucio.tex)));
  for (const pas of p.simplifica) {
    g.files[FILA.funcio] = membre(0) + K('Oe', pas.tex);
    g.afegeix(pas.text);
  }

  /* 4. El domini (fila domini). */
  g.files[FILA.domini] = K('Dm', p.domini.tex);
  g.afegeix(p.domini.text, llum(p.domini.tex));

  /* 5. La derivada (fila derivada) i els candidats (fila calcul). */
  // La condició aïllada, ara, és soroll: s'esborra, i es recupera al pas 7 per calcular w.
  const aillada = p.condicio[p.condicio.length - 1].aillada;
  const filaCondicio = K('Lw', w) + R('Lq', '=') + K('Lr', aillada);
  g.files[FILA.condicio] = '';
  g.files[FILA.derivada] = membre(1) + K('Pe', p.derivada.tex);
  const textAillada = `$${w} = ${aillada.replace(/\\dfrac/g, '\\frac')}$`;
  g.afegeix(`${p.derivada.text} (Esborrem ${textAillada}: ara no ens cal. La recuperarem al final per calcular $${w}$.)`);
  const eq = p.equacio;
  // Primer, l'equació tal com es planteja: A'(x) = 0 (el «=» i el «0», claus eq i ez, es queden). Els càlculs, a la fila de treball.
  g.files[FILA.calcul] = F.membreEsquerre('e', f, v, 1) + K('ez', '0');
  g.afegeix(`Els candidats són les solucions de l'equació $${f}'(${v}) = 0$.`);
  const manual = eq.manual || [];
  manual.forEach((pas, i) => {
    if (i === 0) {
      const esquerre = pas.tex.replace(/ = 0$/, '');
      g.files[FILA.calcul] = K('Ee', esquerre) + R('eq', '=') + K('ez', '0');
    } else if (i === manual.length - 1 && !eq.polinomi) {
      const [, valor] = new RegExp(`^${v} = (.+)$`).exec(pas.tex);
      g.files[FILA.resposta] = K('Wv', v) + R('Wq', '=') + K('Ws', valor);
    } else {
      g.files[FILA.resposta] = K('Ew', pas.tex);
    }
    g.afegeix(pas.text);
  });
  let clauCandidat = 'Ws';
  if (eq.polinomi) {
    // Sense passos a mà, l'equació polinòmica es queda a la fila calcul; si n'hi ha, ja es resol a la de treball.
    const solucions = F.resolEquacio(g, manual.length
      ? {fila: FILA.resposta, P: 'u', termes: eq.polinomi.termes, text: eq.polinomi.text, X: v}
      : {fila: FILA.calcul, treball: FILA.resposta, P: 'e', termes: eq.polinomi.termes, text: eq.polinomi.text, X: v});
    clauCandidat = solucions.find(s => M.texNombre(s.valor) === eq.candidat).clau;
    // Les solucions en lila; les que no són del domini, tatxades.
    const fila = solucions[0].fila;
    for (const s of solucions) (M.texNombre(s.valor) === eq.candidat ? F.marcaSolucio : F.tatxaSolucio)(g, fila, s.clau);
    g.afegeix(F.textSolucions(solucions.map(s => s.valor), v) + (eq.descarta ? `${eq.descarta} La tatxem.` : ''));
  } else {
    F.marcaSolucio(g, FILA.resposta, 'Ws');
    g.afegeix(`La solució és $${v} = ${textual(eq.candidat)}$.`);
  }
  g.files[FILA.calcul] = '';
  const rx = K('Rx', `${v} = ${eq.candidat}`);
  g.files[FILA.resposta] = rx;
  g.afegeix(`L'únic candidat dins del domini és $${v} = ${textual(eq.candidat)}$.`, Object.assign({reanomena: {Rx: clauCandidat}}, llum(v)));

  /* 6. La segona derivada decideix si és un màxim o un mínim. */
  g.files[FILA.derivada] = membre(2) + K('Pe', p.segona.tex);
  g.afegeix(p.segona.text);
  g.files[FILA.calcul] = K('Se', p.segona.valor) + R('Sw', p.maxim ? '<' : '>') + K('Sz', '0');
  g.afegeix(`Com que $${textual(p.segona.valor.split(' = ')[0])} ${p.maxim ? '<' : '>'} 0$, en $${v} = ${textual(eq.candidat)}$ hi ha un `
    + (p.maxim ? 'màxim (la gràfica té forma de ∩).' : 'mínim (la gràfica té forma de ∪).'), {cursor: {clic: 'Rx'}});

  /* 7. La resposta: l'altra variable (amb la condició, que torna a la fila condicio) i el valor òptim (fila resposta). */
  g.files[FILA.condicio] = filaCondicio;
  g.afegeix(`Per calcular $${w}$, recupera la condició aïllada: ${textAillada}.`);
  g.files[FILA.calcul] = K('We', p.altra.calcul);
  g.afegeix(p.altra.text);
  g.files[FILA.calcul] = '';
  const rw = K('Rw', p.altra.resposta);
  g.files[FILA.resposta] = rx + ',\\ ' + rw;
  g.afegeix('Porta-ho a la resposta.', Object.assign({fusiona: {Rw: ['We']}, cursor: {arrossega: 'We', fins: 'Rw'}}, llum(w)));
  g.files[FILA.calcul] = K('Fe', p.optim.calcul);
  g.afegeix(p.optim.text);
  g.files[FILA.calcul] = '';
  g.files[FILA.resposta] = rx + ',\\ ' + rw + ',\\ ' + K('Rf', p.optim.resposta);
  g.afegeix('Porta-ho a la resposta.', {fusiona: {Rf: ['Fe']}, cursor: {arrossega: 'Fe', fins: 'Rf'}});
  g.classes[FILA.resposta] = 'final';
  if (p.figura) g.files[FILA.esquema] = esquema(p, true);     // l'esquema, a escala, amb les mides òptimes
  g.afegeix(`Resposta: ${p.resposta}`);
  return g.passos;
}


/* ── 4. DEFINICIÓ DEL PROCEDIMENT ──────────────────────────────────── */

arrel.Optimitzacio = Object.freeze({
  titol: 'Optimització',
  categoria: 'analisi',
  files: 8,
  perDefecte: FIXOS.perDefecte,
  exemples: FIXOS.exemples,
  titolEditor: 'Tria un problema',
  notaEditor: 'Tots es resolen amb la mateixa tècnica: llegir l\'enunciat (què s\'optimitza i quina condició hi ha), funció, condició, una sola variable, domini, derivada, segona derivada i resposta.',
  editor: [],
  problemes: PROBLEMES,
  FILA,
  valida: FIXOS.valida, llegeixAdreca: FIXOS.llegeixAdreca, escriuAdreca: FIXOS.escriuAdreca,
  enunciat: FIXOS.enunciat, resum: FIXOS.resum, nomExemple: FIXOS.nomExemple,
  passos, esquema,
});

})(globalThis);
