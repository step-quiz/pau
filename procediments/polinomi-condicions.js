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
     3. resoldre el sistema: primer les equacions amb una sola incògnita,
        després substitució o reducció;
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

   La traducció de les dades la genera el codi; la resolució del sistema
   és a les dades de cada problema, escrita amb Formules.marcat.
   Claus: Ef1, E11, E21… frases de l'enunciat; FF…Fe, GF…Ge, HF…He les
   files de f, f' i f''; q1…q4 les quatre equacions (q<n>F «f(p)»,
   q<n>a…q<n>d els termes de a…d, q<n>q «=», q<n>r el segon membre);
   q5, q6… les equacions noves de la resolució; R… la resposta;
   Y…, Z… la comprovació amb f''.
   ═══════════════════════════════════════════════════════════════════ */
(function (arrel) {
'use strict';

const M = arrel.Mates;
const F = arrel.Formules;
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
     resolucio    els passos de la resolució del sistema: {text, sistema, calcul, porta,
                  cursor, fusiona}. sistema = {línia (1…4): fórmula}; calcul: la fórmula
                  de la fila 5 ('' l'esborra); porta: la línia del sistema on va a parar
                  la fórmula de la fila 5. Fórmules escrites amb Formules.marcat.
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
      {text: 'Dues equacions ja donen el valor d\'una incògnita: $d = 4$ i $c = 0$. Substitueix $c = 0$ a la tercera equació.',
        sistema: {3: 'q3: ⟦a:12a⟧ + ⟦b:4b⟧ + ⟦c:0⟧ = ⟦r:0⟧'}, cursor: {arrossega: 'q2r', fins: 'q3c'}},
      {text: 'Substitueix $c = 0$ i $d = 4$ a la quarta equació.',
        sistema: {4: 'q4: ⟦a:a⟧ + ⟦b:b⟧ + ⟦c:0⟧ + ⟦d:4⟧ = ⟦r:2⟧'}},
      {text: 'Simplifica les dues equacions. A la quarta, el $4$ passa a l\'altre costat canviat de signe: $2 - 4 = -2$.',
        sistema: {3: 'q3: ⟦a:12a⟧ + ⟦b:4b⟧ = ⟦r:0⟧', 4: 'q4: ⟦a:a⟧ + ⟦b:b⟧ = ⟦r:-2⟧'}, fusiona: {q4r: ['q4d']}},
      {text: 'Queden dues equacions amb dues incògnites, $a$ i $b$. Divideix la tercera per $4$.',
        sistema: {3: 'q3: ⟦a:3a⟧ + ⟦b:b⟧ = ⟦r:0⟧'}},
      {text: 'Aïlla $b$: el $3a$ passa a l\'altre costat canviat de signe.',
        sistema: {3: 'q3: ⟦b:b⟧ = ⟦r:-3a⟧'}, fusiona: {q3r: ['q3a']}},
      {text: 'Substitueix $b = -3a$ a la quarta equació.',
        sistema: {4: 'q4: ⟦a:a⟧ + ⟦b:(-3a)⟧ = ⟦r:-2⟧'}, cursor: {arrossega: 'q3r', fins: 'q4b'}},
      {text: 'Opera: $a - 3a = -2a$.',
        sistema: {4: 'q4: ⟦a:-2a⟧ = ⟦r:-2⟧'}, fusiona: {q4a: ['q4b']}},
      {text: 'Divideix per $-2$.',
        sistema: {4: 'q4: ⟦a:a⟧ = ⟦r:1⟧'}},
      {text: 'Substitueix $a = 1$ a la tercera equació.',
        sistema: {3: 'q3: ⟦b:b⟧ = ⟦r:-3 \\cdot 1⟧'}, cursor: {arrossega: 'q4r', fins: 'q3r'}},
      {text: 'Calcula: $b = -3$. Ja tens les quatre incògnites.',
        sistema: {3: 'q3: ⟦b:b⟧ = ⟦r:-3⟧'}},
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
      {text: 'La primera equació ja diu que $d = 0$. Substitueix-ho a la tercera.',
        sistema: {3: 'q3: ⟦a:a⟧ + ⟦b:b⟧ + ⟦c:c⟧ + ⟦d:0⟧ = ⟦r:2⟧'}, cursor: {arrossega: 'q1r', fins: 'q3d'}},
      {text: 'Simplifica.',
        sistema: {3: 'q3: ⟦a:a⟧ + ⟦b:b⟧ + ⟦c:c⟧ = ⟦r:2⟧'}},
      {text: 'Fixa\'t en la segona i la quarta equació: només canvia el signe del terme de $b$. Si les restes, la $a$ i la $c$ desapareixen. Copia la segona equació.',
        calcul: 'q5: ⟦x:(3a + 2b + c)⟧ = ⟦r:0⟧', cursor: {arrossega: 'q2q', fins: 'q5x'}},
      {text: 'Resta-li la quarta equació, membre a membre.',
        calcul: 'q5: ⟦x:(3a + 2b + c)⟧ ⟦m:-⟧ ⟦y:(3a - 2b + c)⟧ = ⟦r:0⟧ ⟦n:-⟧ ⟦s:0⟧', cursor: {arrossega: 'q4q', fins: 'q5y'}},
      {text: 'Treu els parèntesis i simplifica: $3a - 3a = 0$, $2b - (-2b) = 4b$ i $c - c = 0$.',
        calcul: 'q5: ⟦e:4b⟧ = ⟦r:0⟧', fusiona: {q5e: ['q5x', 'q5m', 'q5y'], q5r: ['q5n', 'q5s']}},
      {text: 'Aquesta equació pot ocupar el lloc de la quarta: el sistema que en surt és equivalent.',
        porta: 4},
      {text: 'Divideix per $4$: $b = 0$.',
        sistema: {4: 'q5: ⟦e:b⟧ = ⟦r:0⟧'}},
      {text: 'Substitueix $b = 0$ a la segona i a la tercera equació.',
        sistema: {2: 'q2: ⟦a:3a⟧ + ⟦b:2 \\cdot 0⟧ + ⟦c:c⟧ = ⟦r:0⟧', 3: 'q3: ⟦a:a⟧ + ⟦b:0⟧ + ⟦c:c⟧ = ⟦r:2⟧'}},
      {text: 'Simplifica.',
        sistema: {2: 'q2: ⟦a:3a⟧ + ⟦c:c⟧ = ⟦r:0⟧', 3: 'q3: ⟦a:a⟧ + ⟦c:c⟧ = ⟦r:2⟧'}},
      {text: 'Les dues equacions tenen la mateixa $c$: resta la tercera de la segona.',
        calcul: 'q6: ⟦x:(3a + c)⟧ ⟦m:-⟧ ⟦y:(a + c)⟧ = ⟦r:0⟧ ⟦n:-⟧ ⟦s:2⟧'},
      {text: 'Simplifica: $3a - a = 2a$, $c - c = 0$ i $0 - 2 = -2$.',
        calcul: 'q6: ⟦e:2a⟧ = ⟦r:-2⟧', fusiona: {q6e: ['q6x', 'q6m', 'q6y'], q6r: ['q6n', 'q6s']}},
      {text: 'Divideix per $2$.',
        calcul: 'q6: ⟦e:a⟧ = ⟦r:-1⟧'},
      {text: 'Posa-la al lloc de la segona equació.',
        porta: 2},
      {text: 'Substitueix $a = -1$ a la tercera.',
        sistema: {3: 'q3: ⟦a:(-1)⟧ + ⟦c:c⟧ = ⟦r:2⟧'}, cursor: {arrossega: 'q6r', fins: 'q3a'}},
      {text: 'Aïlla $c$: $c = 2 + 1 = 3$.',
        sistema: {3: 'q3: ⟦c:c⟧ = ⟦r:3⟧'}, fusiona: {q3r: ['q3a']}},
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
      {text: 'La tercera equació diu que $c = 0$. Substitueix-ho a les altres tres.',
        sistema: {1: 'q1: ⟦a:3a⟧ + ⟦b:2b⟧ + ⟦c:0⟧ = ⟦r:2⟧', 2: 'q2: ⟦a:a⟧ + ⟦b:b⟧ + ⟦c:0⟧ + ⟦d:d⟧ = ⟦r:1⟧',
          4: 'q4: ⟦a:-a⟧ + ⟦b:b⟧ - ⟦c:0⟧ + ⟦d:d⟧ = ⟦r:-3⟧'}},
      {text: 'Simplifica.',
        sistema: {1: 'q1: ⟦a:3a⟧ + ⟦b:2b⟧ = ⟦r:2⟧', 2: 'q2: ⟦a:a⟧ + ⟦b:b⟧ + ⟦d:d⟧ = ⟦r:1⟧', 4: 'q4: ⟦a:-a⟧ + ⟦b:b⟧ + ⟦d:d⟧ = ⟦r:-3⟧'}},
      {text: 'La segona i la quarta tenen els mateixos termes, $b + d$: si les restes, desapareixen. Resta la quarta de la segona.',
        calcul: 'q5: ⟦x:(a + b + d)⟧ ⟦m:-⟧ ⟦y:(-a + b + d)⟧ = ⟦r:1⟧ ⟦n:-⟧ ⟦s:(-3)⟧'},
      {text: 'Simplifica: $a - (-a) = 2a$ i $1 - (-3) = 4$.',
        calcul: 'q5: ⟦e:2a⟧ = ⟦r:4⟧', fusiona: {q5e: ['q5x', 'q5m', 'q5y'], q5r: ['q5n', 'q5s']}},
      {text: 'Divideix per $2$.',
        calcul: 'q5: ⟦e:a⟧ = ⟦r:2⟧'},
      {text: 'Posa-la al lloc de la quarta equació.',
        porta: 4},
      {text: 'Substitueix $a = 2$ a la primera.',
        sistema: {1: 'q1: ⟦a:3 \\cdot 2⟧ + ⟦b:2b⟧ = ⟦r:2⟧'}, cursor: {arrossega: 'q5r', fins: 'q1a'}},
      {text: 'Passa el $6$ a l\'altre costat canviat de signe: $2 - 6 = -4$.',
        sistema: {1: 'q1: ⟦b:2b⟧ = ⟦r:-4⟧'}, fusiona: {q1r: ['q1a']}},
      {text: 'Divideix per $2$.',
        sistema: {1: 'q1: ⟦b:b⟧ = ⟦r:-2⟧'}},
      {text: 'Substitueix $a = 2$ i $b = -2$ a la segona.',
        sistema: {2: 'q2: ⟦a:2⟧ + ⟦b:(-2)⟧ + ⟦d:d⟧ = ⟦r:1⟧'}},
      {text: 'Aïlla $d$: $d = 1 - 2 + 2 = 1$.',
        sistema: {2: 'q2: ⟦d:d⟧ = ⟦r:1⟧'}, fusiona: {q2r: ['q2a', 'q2b']}},
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
      {text: 'La primera equació només té la incògnita $b$: divideix per $2$.',
        sistema: {1: 'q1: ⟦b:b⟧ = ⟦r:0⟧'}},
      {text: 'Substitueix $b = 0$ i $d = 0$ a la tercera i a la quarta equació.',
        sistema: {3: 'q3: ⟦a:a⟧ + ⟦b:0⟧ + ⟦c:c⟧ + ⟦d:0⟧ = ⟦r:-2⟧', 4: 'q4: ⟦a:8a⟧ + ⟦b:4 \\cdot 0⟧ + ⟦c:2c⟧ + ⟦d:0⟧ = ⟦r:2⟧'}},
      {text: 'Simplifica.',
        sistema: {3: 'q3: ⟦a:a⟧ + ⟦c:c⟧ = ⟦r:-2⟧', 4: 'q4: ⟦a:8a⟧ + ⟦c:2c⟧ = ⟦r:2⟧'}},
      {text: 'Divideix la quarta per $2$.',
        sistema: {4: 'q4: ⟦a:4a⟧ + ⟦c:c⟧ = ⟦r:1⟧'}},
      {text: 'Les dues equacions tenen la mateixa $c$: resta la tercera de la quarta.',
        calcul: 'q5: ⟦x:(4a + c)⟧ ⟦m:-⟧ ⟦y:(a + c)⟧ = ⟦r:1⟧ ⟦n:-⟧ ⟦s:(-2)⟧'},
      {text: 'Simplifica: $4a - a = 3a$, $c - c = 0$ i $1 - (-2) = 3$.',
        calcul: 'q5: ⟦e:3a⟧ = ⟦r:3⟧', fusiona: {q5e: ['q5x', 'q5m', 'q5y'], q5r: ['q5n', 'q5s']}},
      {text: 'Divideix per $3$.',
        calcul: 'q5: ⟦e:a⟧ = ⟦r:1⟧'},
      {text: 'Posa-la al lloc de la quarta equació.',
        porta: 4},
      {text: 'Substitueix $a = 1$ a la tercera.',
        sistema: {3: 'q3: ⟦a:1⟧ + ⟦c:c⟧ = ⟦r:-2⟧'}, cursor: {arrossega: 'q5r', fins: 'q3a'}},
      {text: 'Aïlla $c$: $c = -2 - 1 = -3$.',
        sistema: {3: 'q3: ⟦c:c⟧ = ⟦r:-3⟧'}, fusiona: {q3r: ['q3a']}},
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
      {text: 'La primera equació diu que $d = 0$. Substitueix-ho a la tercera.',
        sistema: {3: 'q3: ⟦a:8a⟧ + ⟦b:4b⟧ + ⟦c:2c⟧ + ⟦d:0⟧ = ⟦r:20⟧'}, cursor: {arrossega: 'q1r', fins: 'q3d'}},
      {text: 'Simplifica.',
        sistema: {3: 'q3: ⟦a:8a⟧ + ⟦b:4b⟧ + ⟦c:2c⟧ = ⟦r:20⟧'}},
      {text: 'La quarta equació només té dues incògnites: aïlla-hi $b$. Primer, passa el $18a$ a l\'altre costat canviat de signe.',
        sistema: {4: 'q4: ⟦b:2b⟧ = ⟦r:-18a⟧'}, fusiona: {q4r: ['q4a']}},
      {text: 'Divideix per $2$.',
        sistema: {4: 'q4: ⟦b:b⟧ = ⟦r:-9a⟧'}},
      {text: 'Substitueix $b = -9a$ a la segona equació.',
        sistema: {2: 'q2: ⟦a:12a⟧ + ⟦b:4 \\cdot (-9a)⟧ + ⟦c:c⟧ = ⟦r:0⟧'}, cursor: {arrossega: 'q4r', fins: 'q2b'}},
      {text: 'Opera: $4 \\cdot (-9a) = -36a$, i $12a - 36a = -24a$.',
        sistema: {2: 'q2: ⟦a:-24a⟧ + ⟦c:c⟧ = ⟦r:0⟧'}, fusiona: {q2a: ['q2b']}},
      {text: 'Aïlla $c$.',
        sistema: {2: 'q2: ⟦c:c⟧ = ⟦r:24a⟧'}, fusiona: {q2r: ['q2a']}},
      {text: 'Substitueix $b = -9a$ i $c = 24a$ a la tercera equació.',
        sistema: {3: 'q3: ⟦a:8a⟧ + ⟦b:4 \\cdot (-9a)⟧ + ⟦c:2 \\cdot 24a⟧ = ⟦r:20⟧'}},
      {text: 'Opera: $8a - 36a + 48a = 20a$.',
        sistema: {3: 'q3: ⟦a:20a⟧ = ⟦r:20⟧'}, fusiona: {q3a: ['q3b', 'q3c']}},
      {text: 'Divideix per $20$.',
        sistema: {3: 'q3: ⟦a:a⟧ = ⟦r:1⟧'}},
      {text: 'Substitueix $a = 1$ a les equacions de $b$ i de $c$: $b = -9 \\cdot 1 = -9$ i $c = 24 \\cdot 1 = 24$.',
        sistema: {2: 'q2: ⟦c:c⟧ = ⟦r:24⟧', 4: 'q4: ⟦b:b⟧ = ⟦r:-9⟧'}},
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
      {text: 'Cap equació no té una sola incògnita: caldrà combinar-les. La primera i la tercera tenen la mateixa $c$, i si les restes, desapareix. Copia la tercera.',
        calcul: 'q5: ⟦x:(27a + 6b + c)⟧ = ⟦r:0⟧', cursor: {arrossega: 'q3q', fins: 'q5x'}},
      {text: 'Resta-li la primera, membre a membre.',
        calcul: 'q5: ⟦x:(27a + 6b + c)⟧ ⟦m:-⟧ ⟦y:(3a + 2b + c)⟧ = ⟦r:0⟧ ⟦n:-⟧ ⟦s:0⟧', cursor: {arrossega: 'q1q', fins: 'q5y'}},
      {text: 'Treu els parèntesis i simplifica: $27a - 3a = 24a$, $6b - 2b = 4b$ i $c - c = 0$.',
        calcul: 'q5: ⟦e:24a + 4b⟧ = ⟦r:0⟧', fusiona: {q5e: ['q5x', 'q5m', 'q5y'], q5r: ['q5n', 'q5s']}},
      {text: 'Divideix per $4$.',
        calcul: 'q5: ⟦e:6a + b⟧ = ⟦r:0⟧'},
      {text: 'Aïlla $b$.',
        calcul: 'q5: ⟦e:b⟧ = ⟦r:-6a⟧'},
      {text: 'Posa-la al lloc de la tercera equació.',
        porta: 3},
      {text: 'Substitueix $b = -6a$ a la primera equació.',
        sistema: {1: 'q1: ⟦a:3a⟧ + ⟦b:2 \\cdot (-6a)⟧ + ⟦c:c⟧ = ⟦r:0⟧'}, cursor: {arrossega: 'q5r', fins: 'q1b'}},
      {text: 'Opera: $2 \\cdot (-6a) = -12a$, i $3a - 12a = -9a$.',
        sistema: {1: 'q1: ⟦a:-9a⟧ + ⟦c:c⟧ = ⟦r:0⟧'}, fusiona: {q1a: ['q1b']}},
      {text: 'Aïlla $c$.',
        sistema: {1: 'q1: ⟦c:c⟧ = ⟦r:9a⟧'}, fusiona: {q1r: ['q1a']}},
      {text: 'Substitueix $b = -6a$ i $c = 9a$ a la quarta equació.',
        sistema: {4: 'q4: ⟦a:27a⟧ + ⟦b:9 \\cdot (-6a)⟧ + ⟦c:3 \\cdot 9a⟧ + ⟦d:d⟧ = ⟦r:-1⟧'}},
      {text: 'Opera: $27a - 54a + 27a = 0$. La $a$ desapareix, i queda $d = -1$!',
        sistema: {4: 'q4: ⟦d:d⟧ = ⟦r:-1⟧'}},
      {text: 'Substitueix $b = -6a$, $c = 9a$ i $d = -1$ a la segona equació.',
        sistema: {2: 'q2: ⟦a:a⟧ + ⟦b:(-6a)⟧ + ⟦c:9a⟧ + ⟦d:(-1)⟧ = ⟦r:3⟧'}},
      {text: 'Opera: $a - 6a + 9a = 4a$.',
        sistema: {2: 'q2: ⟦a:4a⟧ - ⟦d:1⟧ = ⟦r:3⟧'}, fusiona: {q2a: ['q2b', 'q2c']}},
      {text: 'Passa el $-1$ a l\'altre costat canviat de signe: $3 + 1 = 4$.',
        sistema: {2: 'q2: ⟦a:4a⟧ = ⟦r:4⟧'}, fusiona: {q2r: ['q2d']}},
      {text: 'Divideix per $4$.',
        sistema: {2: 'q2: ⟦a:a⟧ = ⟦r:1⟧'}},
      {text: 'Substitueix $a = 1$ a les equacions de $b$ i de $c$: $b = -6 \\cdot 1 = -6$ i $c = 9 \\cdot 1 = 9$.',
        sistema: {1: 'q1: ⟦c:c⟧ = ⟦r:9⟧', 3: 'q5: ⟦e:b⟧ = ⟦r:-6⟧'}},
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
  const dibuixa = () => {
    g.files[FILA.enunciat] = lectura().tex;
    g.files[FILA.sistema] = sistema.length ? `\\begin{cases} ${sistema.map(F.marcat).join(' \\\\ ')} \\end{cases}` : '';
    g.files[FILA.calcul] = calcul ? F.marcat(calcul) : '';
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

  /* 3. La resolució del sistema (dades del problema). */
  for (const r of p.resolucio) {
    for (const [linia, tex] of Object.entries(r.sistema || {})) sistema[linia - 1] = tex;
    if (r.calcul !== undefined) calcul = r.calcul;
    if (r.porta) { sistema[r.porta - 1] = calcul; calcul = ''; }
    const opcions = {};
    if (r.cursor) opcions.cursor = r.cursor;
    if (r.fusiona) opcions.fusiona = r.fusiona;
    pas(r.text, opcions);
  }

  /* 4. La resposta (fila 6). */
  const s = p.solucio;
  const valorsTex = `$a = ${s.a}$, $b = ${s.b}$, $c = ${s.c}$ i $d = ${s.d}$`;
  const resposta = F.membreEsquerre('R', 'f', 'x');
  g.files[FILA.resposta] = resposta + LLETRES.map((v, i) => K('Rt' + (3 - i), `${M.texEntreParentesis(s[v])}${i < 3 ? ' \\cdot ' + (i < 2 ? `x^{${3 - i}}` : 'x') : ''}`)).join(' + ');
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
