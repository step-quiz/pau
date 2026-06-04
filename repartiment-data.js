/* repartiment-data.js — Repartiment de continguts matemàtics ESO 2025-26
 * Compartit entre repartiment.html i seguiment.html.
 * No modifiqueu els noms de les constants (SENTITS, CLASSES, REPARTIMENT).
 */

/* ─── SENTITS ───────────────────────────────────────────────────────── */
const SENTITS = {
  comprensio: { label: 'Millora de la comprensió lectora', short: 'Comprensió' },
  numeric:    { label: 'Sentit numèric',                   short: 'Numèric'    },
  espacial:   { label: 'Sentit espacial',                  short: 'Espacial'   },
  mesura:     { label: 'Sentit de la mesura',              short: 'Mesura'     },
  algebraic:  { label: 'Sentit algebraic',                 short: 'Algebraic'  },
  estocastic: { label: 'Sentit estocàstic',                short: 'Estocàstic' },
};

/* ─── CLASSES DEL DEPARTAMENT ───────────────────────────────────────── */
const CLASSES = [
  { id: '1ESO',     label: "1r d'ESO",     curs: '1ESO', group: '1' },
  { id: '2ESO',     label: "2n d'ESO",     curs: '2ESO', group: '2' },
  { id: '3ESO-B',   label: "3r d'ESO B",   curs: '3ESO', group: '3' },
  { id: '3ESO-A',   label: "3r d'ESO A",   curs: '3ESO', group: '3' },
  { id: '4ESO-PIM', label: "4t d'ESO PIM", curs: '4ESO', group: '4' },
  { id: '4ESO-A',   label: "4t d'ESO A",   curs: '4ESO', group: '4' },
  { id: '4ESO-B',   label: "4t d'ESO B",   curs: '4ESO', group: '4' },
];

/* ─── REPARTIMENT DE CONTINGUTS ──────────────────────────────────────
 * Estructura: curs → blocs (per sentit) → temes → continguts (items).
 * La clau de seguiment per tema és: "<sentit>/<tema.id>".
 */
const REPARTIMENT = {

  /* ═══════════════════════════ 1r ESO ════════════════════════════ */
  '1ESO': {
    label: "1r d'ESO", hores_any: 90,
    hores_info: '≈10 setmanes/trimestre · 3h/setmana',
    blocs: [
      { sentit: 'comprensio', hores: 12, temes: [
        { id: 'comprensio-lectora', label: 'Comprensió lectora', hores: 12,
          continguts: [
            "Adquisició de vocabulari específic",
            "Obtenció d'informació en textos d'àmbit matemàtic",
            "Expressió algebraica de patrons",
            "Resolució de problemes a partir d'un context (enunciats CB)",
          ]},
      ]},
      { sentit: 'numeric', hores: 36, temes: [
        { id: 'nombres-naturals', label: 'Nombres naturals', hores: 9,
          continguts: [
            "Definició de nombre natural",
            "Ordre dels nombres naturals",
            "Sistemes de numeració: base 2, base 10",
            "Potències de base i exponents naturals",
            "Jerarquia de les operacions",
            "Operacions combinades",
          ]},
        { id: 'divisibilitat', label: 'Divisibilitat', hores: 9,
          continguts: [
            "Divisibilitat", "Múltiples", "Divisors",
            "Criteris de divisibilitat",
            "Nombres primers i nombres compostos",
            "Factorització en nombres primers",
            "MCD i mcm",
          ]},
        { id: 'nombres-decimals', label: 'Nombres decimals', hores: 3,
          continguts: [
            "Representació dels decimals a la recta numèrica",
            "Ordre dels nombres decimals",
            "Operacions amb nombres decimals",
            "Aproximació per truncament i per arrodoniment",
          ]},
        { id: 'fraccions', label: 'Fraccions', hores: 9,
          continguts: [
            "Definició i representació d'una fracció",
            "Fracció pròpia i impròpia",
            "Fraccions equivalents",
            "Simplificació de fraccions. Fracció irreductible.",
            "Representació d'una fracció a la recta numèrica",
            "Comparació de fraccions (gràficament)",
            "Suma i resta de fraccions amb mateix denominador",
            "Fracció d'un nombre",
          ]},
        { id: 'fraccions-decimals', label: 'Fraccions i decimals', hores: 3,
          continguts: [
            "Expressar una fracció com un nombre decimal",
            "Donat un decimal, expressar-lo com una fracció",
          ]},
        { id: 'arrel-quadrada', label: 'Arrel quadrada', hores: 3,
          continguts: [
            "Quadrats perfectes",
            "Arrel quadrada exacta i no exacta",
          ]},
      ]},
      { sentit: 'espacial', hores: 16, temes: [
        { id: 'elements-geometrics', label: 'Elements geomètrics al pla', hores: 3,
          continguts: [
            "Punt, segment, recta, semirecta, circumferència, angle",
            "Rectes secants, rectes paral·leles",
            "Rectes perpendiculars",
            "Vocabulari en una circumferència (radi, diàmetre, …)",
          ]},
        { id: 'angles', label: 'Angles', hores: 3,
          continguts: [
            "Angles que formen dues rectes secants",
            "Representació d'angles convexos i còncaus",
            "Mesura d'angles amb el transportador",
            "Angles complementaris i suplementaris",
          ]},
        { id: 'poligons', label: 'Polígons', hores: 3,
          continguts: [
            "Vocabulari: vèrtex, costat, diagonal, angle intern · triangle, quadrilàter, pentàgon, hexàgon…",
            "Definició de polígon regular",
          ]},
        { id: 'triangles', label: 'Triangles', hores: 4,
          continguts: [
            "Condició per poder construir un triangle",
            "Suma dels 3 angles d'un triangle",
            "Classificació de triangles segons angles i costats",
          ]},
        { id: 'geogebra', label: 'Geogebra', hores: 3,
          continguts: [
            "Es treballen continguts explicats, amb Geogebra",
          ]},
        { id: 'fotomatiques', label: 'Fotomàtiques', hores: 2,
          continguts: [
            "Estudi de fotografies matemàtiques publicades al centre.",
          ]},
      ]},
      { sentit: 'mesura', hores: 16, temes: [
        { id: 'magnituds-unitats', label: 'Magnituds i unitats', hores: 2,
          continguts: [
            "Mesures de longitud, massa i capacitat",
            "Mesures de superfície",
          ]},
        { id: 'escala', label: 'Escala', hores: 2,
          continguts: [
            "Escales en un plànol",
            "Escales en un mapa",
            "Tria adequada de l'escala per a representar",
          ]},
        { id: 'calcul-perimetres', label: 'Càlcul de perímetres', hores: 6,
          continguts: [
            "Definició de perímetre",
            "Càlcul del perímetre (quadrat, rectangle, polígon regular)",
            "Càlcul del perímetre d'una circumferència",
          ]},
        { id: 'calcul-arees', label: "Càlcul d'àrees", hores: 6,
          continguts: [
            "Definició de superfície. Visualització d'un metre quadrat",
            "Càlcul de l'àrea (quadrat, rectangle, triangle)",
            "Càlcul de l'àrea d'un cercle",
            "Càlcul de l'àrea de figures que es poden descomposar",
          ]},
      ]},
      { sentit: 'algebraic', hores: 6, temes: [
        { id: 'llenguatge-algebraic', label: 'Llenguatge algebraic', hores: 3,
          continguts: [
            "Traduir al llenguatge algebraic un enunciat (edat d'aquí 5 anys, perímetre d'un quadrat de costat x, etc.)",
          ]},
        { id: 'grafics-taules', label: 'Gràfics i taules', hores: 3,
          continguts: [
            "Interpretació de gràfics i taules. Buidat de dades i deducció de patrons a partir d'informació gràfica o de taules",
          ]},
      ]},
    ],
  },

  /* ═══════════════════════════ 2n ESO ════════════════════════════ */
  '2ESO': {
    label: "2n d'ESO", hores_any: 90,
    hores_info: '≈10 setmanes/trimestre · 3h/setmana',
    blocs: [
      { sentit: 'comprensio', hores: 9, temes: [
        { id: 'comprensio-lectora', label: 'Comprensió lectora', hores: 9,
          continguts: [
            "Adquisició de vocabulari específic",
            "Obtenció d'informació en textos d'àmbit matemàtic",
            "Expressió algebraica de patrons",
            "Resolució de problemes a partir d'un context",
          ]},
      ]},
      { sentit: 'numeric', hores: 24, temes: [
        { id: 'divisibilitat', label: 'Divisibilitat', hores: 4,
          continguts: [
            "Divisibilitat, múltiples, divisors",
            "Nombres primers i compostos. Màxim comú divisor",
            "Mínim comú múltiple",
          ]},
        { id: 'fraccions', label: 'Fraccions', hores: 4,
          continguts: [
            "Representació de fraccions",
            "Fracció d'un nombre",
            "Suma i resta de fraccions amb mateix denominador",
            "Fraccions equivalents. Reducció a comú denominador",
            "Suma i resta de fraccions",
            "Multiplicació de fraccions",
            "Divisió de fraccions",
          ]},
        { id: 'percentatges', label: 'Percentatges', hores: 4,
          continguts: [
            "Relació entre fracció, decimal i percentatge",
            "Representació gràfica d'un percentatge",
            "Càlcul de percentatges menors o iguals que 100%",
            "Càlcul de percentatges majors que 100%",
          ]},
        { id: 'nombres-enters', label: 'Nombres enters', hores: 9,
          continguts: [
            "Representació dels enters a la recta real",
            "Oposat d'un nombre enter. Valor absolut",
            "Ordenar nombres enters",
            "Suma d'enters", "Resta d'enters",
            "Multiplicació d'enters", "Divisió d'enters",
          ]},
        { id: 'potencies', label: 'Potències', hores: 3,
          continguts: [
            "Potències de base i exponents naturals",
            "Potències de base entera i exponent natural",
            "Potències de base racional i exponent natural",
          ]},
      ]},
      { sentit: 'espacial', hores: 24, temes: [
        { id: 'vocabulari', label: 'Vocabulari', hores: 2,
          continguts: [
            "Vocabulari al pla: punt, segment, vèrtex, costat, polígon, polígon regular, circumferència (radi, diàmetre…)",
            "Vocabulari a l'espai: vèrtex, aresta, cara, poliedre, cos de revolució",
          ]},
        { id: 'poligons', label: 'Polígons', hores: 4,
          continguts: [
            "Vocabulari: triangle, quadrilàter, pentàgon, hexàgon…",
            "Triangles: classificació segons angles i costats",
            "Quadrilàters: paral·lelogram (rombe, rectangle, quadrat), trapezi",
            "Polígons convexos i còncaus",
            "Polígons regulars",
          ]},
        { id: 'triangles', label: 'Triangles', hores: 6,
          continguts: [
            "Les 3 altures d'un triangle qualsevol. Peu d'altura.",
            "Triangle rectangle: angle recte, catets, hipotenusa",
            "Teorema de Pitàgores",
            "Teorema de l'altura",
            "Resolució de triangles rectangles, coneguts 2 costats",
            "Resolució de problemes aplicant el teorema de Pitàgores",
          ]},
        { id: 'circumferencia-cercle', label: 'Circumferència i cercle', hores: 3,
          continguts: [
            "Vocabulari en una circumferència (radi, diàmetre, …)",
            "Arc capaç i arc central",
            "Circumferència i polígon regular inscrit",
          ]},
        { id: 'geogebra', label: 'Geogebra', hores: 3,
          continguts: [
            "S'implementen conceptes treballats amb Geogebra",
          ]},
        { id: 'poliedres', label: 'Poliedres', hores: 3,
          continguts: [
            "Desenvolupament pla de poliedres",
            "Fórmula d'Euler per a poliedres convexos",
            "Poliedres regulars: tetraedre, cub, octaedre, dodecaedre, icosaedre",
          ]},
        { id: 'cossos-revolucio', label: 'Cossos de revolució', hores: 3,
          continguts: [
            "Cilindre. Base i altura.",
            "Con. Base, altura i generatriu.",
            "Desenvolupament pla de cilindre i de con",
            "Esfera",
          ]},
      ]},
      { sentit: 'mesura', hores: 6, temes: [
        { id: 'perimetres-arees-pla', label: 'Perímetres i àrees al pla', hores: 4,
          continguts: [
            "Càlcul del perímetre d'un polígon",
            "Càlcul del perímetre d'una circumferència",
            "Càlcul de l'àrea d'un quadrat, rectangle, triangle",
            "Càlcul de l'àrea d'un rombe",
            "Càlcul de l'àrea d'un paral·lelogram",
            "Càlcul de l'àrea d'un trapezi",
            "Càlcul de l'àrea d'un cercle",
          ]},
        { id: 'arees-volums-espai', label: "Àrees i volums a l'espai", hores: 2,
          continguts: [
            "Construcció d'1 metre cúbic",
            "Càlcul de l'àrea de les cares i càlcul del volum d'un cub, ortoedre, piràmide, cilindre, con",
          ]},
      ]},
      { sentit: 'algebraic', hores: 18, temes: [
        { id: 'pla-cartesia', label: 'El pla cartesià', hores: 3,
          continguts: [
            "Vocabulari: pla cartesià, coordenades d'un punt, eix d'abscisses i d'ordenades, origen de coordenades",
            "Representació de punts al pla cartesià (4 quadrants)",
          ]},
        { id: 'proporcionalitat', label: 'Proporcionalitat', hores: 3,
          continguts: [
            "Magnituds directament proporcionals y=mx. Funció lineal. Representació gràfica",
          ]},
        { id: 'llenguatge-algebraic', label: 'Llenguatge algebraic', hores: 3,
          continguts: [
            "Patrons geomètrics: traducció al llenguatge algebraic",
            "Traducció al llenguatge algebraic d'un enunciat",
            "Vocabulari: equació, identitat, grau equació, membres, termes, incògnita, resoldre, aïllar",
            "Solució d'una equació. Comprovar la solució",
          ]},
        { id: 'equacio-1r-grau', label: 'Equació de 1r grau', hores: 9,
          continguts: [
            "ax=b; ax+b=c",
            "Resolució d'una equació agrupant termes i aplicant propietat distributiva",
            "Resolució d'un enunciat plantejant una equació de 1r grau",
          ]},
      ]},
      { sentit: 'estocastic', hores: 9, temes: [
        { id: 'variables-estadistiques', label: 'Variables estadístiques', hores: 6,
          continguts: [
            "Població i mostra",
            "Variables quantitatives i qualitatives",
            "Variables quantitatives discretes i contínues",
            "Taula estadística: freqüència absoluta, relativa, percentatge",
            "Gràfic de barres",
            "Diagrama de sectors",
          ]},
        { id: 'mesures-centralitzacio', label: 'Mesures de centralització', hores: 3,
          continguts: [
            "La mediana i els quartils",
            "La mitjana aritmètica",
            "La mitjana aritmètica ponderada",
          ]},
      ]},
    ],
  },

  /* ═══════════════════════════ 3r ESO ════════════════════════════ */
  '3ESO': {
    label: "3r d'ESO", hores_any: 90,
    hores_info: '≈10 setmanes/trimestre · 3h/setmana',
    blocs: [
      { sentit: 'comprensio', hores: 12, temes: [
        { id: 'comprensio-lectora', label: 'Comprensió lectora', hores: 12,
          continguts: [
            "Adquisició de vocabulari específic",
            "Obtenció d'informació en textos d'àmbit matemàtic",
            "Expressió algebraica de patrons",
            "Resolució de problemes a partir d'un context",
          ]},
      ]},
      { sentit: 'numeric', hores: 9, temes: [
        { id: 'nombres-enters', label: 'Nombres enters', hores: 6,
          continguts: [
            "Operacions combinades amb nombres enters",
            "Potència de base entera i exponent natural",
            "Potència amb exponent negatiu, amb exponent zero",
          ]},
        { id: 'notacio-cientifica', label: 'Notació científica', hores: 3,
          continguts: [
            "Potències de base 10, amb exponent positiu o negatiu",
            "Aproximar nombres i expressar en notació científica",
            "Multiplicar i dividir en notació científica",
          ]},
      ]},
      { sentit: 'espacial', hores: 15, temes: [
        { id: 'semblanca', label: 'Semblança', hores: 6,
          continguts: [
            "Teorema de Tales",
            "Triangles en posició de Tales. Triangles semblants",
            "Resolució de problemes emprant semblança de triangles",
            "Figures semblants. Raó de semblança (k≥1, k<1, k<0)",
          ]},
        { id: 'moviments-pla', label: 'Moviments al pla', hores: 9,
          continguts: [
            "Mòdul, direcció i sentit en un vector lliure",
            "Coordenades d'un vector al pla cartesià. v=AB=B−A",
            "Translació determinada per un vector",
            "Gir determinat pel centre de gir i l'angle",
            "Simetria axial",
            "Simetria central",
          ]},
      ]},
      { sentit: 'mesura', hores: 3, temes: [
        { id: 'semblanca-mesura', label: 'Semblança (mesures)', hores: 3,
          continguts: [
            "Càlcul de perímetres i àrees de figures semblants",
            "Raó entre perímetres de figures semblants i raó entre àrees de figures semblants",
          ]},
      ]},
      { sentit: 'algebraic', hores: 36, temes: [
        { id: 'funcio-lineal', label: 'Funció lineal i funció afí', hores: 6,
          continguts: [
            "Representació gràfica de y=mx i de y=mx+n",
            "Pendent de la recta, ordenada a l'origen",
            "Rectes paral·leles amb mateix pendent. Recta paral·lela a l'eix d'abscisses amb m=0",
            "Equació de la recta que passa per dos punts, conegudes les seves coordenades",
            "Equació de la recta conegut el pendent i també les coordenades d'un punt per on passa",
          ]},
        { id: 'llenguatge-algebraic', label: 'Llenguatge algebraic', hores: 2,
          continguts: [
            "Traducció al llenguatge algebraic d'un enunciat",
            "Vocabulari: equació, identitat, grau equació, membres, termes, incògnita, resoldre, aïllar",
            "Solució d'una equació. Comprovar la solució",
          ]},
        { id: 'equacio-1r-grau', label: 'Equació de 1r grau', hores: 8,
          continguts: [
            "ax+b=c",
            "Resolució d'equacions agrupant termes, aplicant distributiva i manipulant algebraicament denominadors",
          ]},
        { id: 'sistema-equacions', label: "Sistema d'equacions de 1r grau", hores: 8,
          continguts: [
            "Resolució gràfica d'un sistema d'equacions",
            "Nombre de solucions d'un sistema d'equacions i nombre de punts en comú que tenen 2 rectes",
            "Resolució d'un sistema d'equacions: mètode substitució",
          ]},
        { id: 'estudi-funcio', label: "Estudi d'una funció", hores: 12,
          continguts: [
            "Definició de funció. Exemples de no funció",
            "Variable independent i variable dependent",
            "Formes d'expressar una funció: text, taula de valors, gràfica, fórmula",
            "Domini d'una funció",
            "Creixement i decreixement. Intervals de nombres reals",
            "Màxims i mínims relatius i també absoluts",
            "Punts de tall de la gràfica amb eixos de coordenades",
          ]},
      ]},
      { sentit: 'estocastic', hores: 15, temes: [
        { id: 'experiments-aleatoris', label: 'Experiments aleatoris', hores: 15,
          continguts: [
            "Espai mostral",
            "Esdeveniment elemental",
            "Esdeveniment segur, impossible, contrari a un altre",
            "Diagrames de Venn",
            "Tècniques de recompte: taules i diagrames d'arbre",
            "Probabilitat d'un esdeveniment",
            "Regla de Laplace",
          ]},
      ]},
    ],
  },

  /* ═══════════════════════════ 4t ESO ════════════════════════════ */
  '4ESO': {
    label: "4t d'ESO", hores_any: 120,
    hores_info: '≈10 setmanes/trimestre · 4h/setmana',
    blocs: [
      { sentit: 'comprensio', hores: 16, temes: [
        { id: 'comprensio-lectora', label: 'Comprensió lectora', hores: 16,
          continguts: [
            "Adquisició de vocabulari específic",
            "Obtenció d'informació en textos d'àmbit matemàtic",
            "Expressió algebraica de patrons",
            "Resolució de problemes a partir d'un context",
          ]},
      ]},
      { sentit: 'numeric', hores: 24, temes: [
        { id: 'nombres-reals', label: 'El conjunt de nombres reals', hores: 8,
          continguts: [
            "Subconjunts: naturals, enters, racionals, irracionals",
            "Infinitud de nombres decimals entre dos nombres donats",
            "Relació entre fracció, decimal i percentatge",
            "Notació i convencions en escriure potències: exponent negatiu, exponent zero, exponent racional",
            "Nombres que no són reals. Relació amb l'equació de segon grau: x²=k (k<0)",
          ]},
        { id: 'logaritmes', label: 'Logaritmes', hores: 4,
          continguts: [
            "Definició i propietats dels logaritmes",
            "Logaritmes en base 10. Logaritme neperià",
          ]},
        { id: 'percentatge', label: 'Percentatge', hores: 12,
          continguts: [
            "Interpretació d'un diagrama de sectors",
            "Mitjana aritmètica ponderada",
            "Augments i disminucions percentuals",
            "Càlcul de l'IVA",
            "Interès en un crèdit",
          ]},
      ]},
      { sentit: 'espacial', hores: 4, temes: [
        { id: 'repas-trigonometria', label: 'Repàs previ a la Trigonometria', hores: 4,
          continguts: [
            "Circumferència: radi, centre, angle central",
            "Triangles rectangles: vocabulari. Teorema de Pitàgores.",
            "Triangles semblants: propietats que compleixen els angles respectius i els costats respectius",
            "Signe de les coordenades d'un punt en funció del quadrant",
          ]},
      ]},
      { sentit: 'mesura', hores: 12, temes: [
        { id: 'trigonometria', label: 'Trigonometria', hores: 12,
          continguts: [
            "Definició de les raons trigonomètriques sin(A), cos(A)",
            "Circumferència goniomètrica",
            "Estudi de les raons dels angles 0°, 30°, 45°, 60°, 90°",
            "Reducció del càlcul de raons trigonomètriques al primer quadrant: sin(180°−A), sin(180°+A), sin(360°−A)",
            "Raons trigonomètriques d'angles complementaris",
            "Teorema del sinus", "Teorema del cosinus",
            "Resolució de problemes i de triangles amb trigonometria",
          ]},
      ]},
      { sentit: 'algebraic', hores: 36, temes: [
        { id: 'llenguatge-algebraic', label: 'Llenguatge algebraic', hores: 8,
          continguts: [
            "Expressar en llenguatge algebraic relacions o patrons mostrats en taules o en representacions gràfiques",
            "Demostració d'identitats notables, de forma gràfica i manipulant algebraicament",
          ]},
        { id: 'equacio-2n-grau', label: 'Equació de 2n grau', hores: 8,
          continguts: [
            "Resolució de l'equació x²=k",
            "Resolució de l'equació (x−a)²=k",
            "Resolució de l'equació (ax−b)(cx−d)=0",
            "Nombre de solucions que pot tenir una equació de 2n grau",
            "Resolució d'una equació de 2n grau complerta",
            "Discriminant d'una equació de 2n grau",
          ]},
        { id: 'funcio-quadratica', label: 'Funció quadràtica', hores: 8,
          continguts: [
            "Representació gràfica de y=ax²",
            "Representació gràfica de y=ax²+c",
            "Punts de tall amb els eixos de coordenades de la gràfica de y=ax²+bx+c (gràficament i amb resolució d'equacions)",
            "Vocabulari associat a la paràbola: branques, vèrtex, còncava, convexa, eix de simetria",
            "Càlcul de les coordenades del vèrtex de la paràbola",
          ]},
        { id: 'hiperbola', label: 'Magnituds inv. proporcionals · Hipèrbola', hores: 6,
          continguts: [
            "Definició de magnituds inversament proporcionals",
            "Exemple: donada una àrea A=24, trobar tots els rectangles que tenen aquesta àrea.",
            "Representació de la hipèrbola, a partir de y=k/x, segons k>0 o bé k<0",
          ]},
        { id: 'funcio-exp-log', label: 'Funció exponencial i logarítmica', hores: 6,
          continguts: [
            "Funció exponencial: contextos on apareix. Representació gràfica b^x, segons 0<b<1, b>1",
            "Estudi d'asímptotes i del creixement/decreixement",
            "Funció logarítmica: contextos on apareix. Domini",
            "Representació gràfica log_b(x), amb base=10 o base=e",
          ]},
      ]},
      { sentit: 'estocastic', hores: 28, temes: [
        { id: 'variable-estadistica', label: 'Variable estadística quantitativa', hores: 10,
          continguts: [
            "Variables quantitatives discretes",
            "Variables quantitatives contínues. Marca de classe",
            "Paràmetres de centralització. Paràmetres de dispersió.",
          ]},
        { id: 'combinatoria', label: 'Combinatòria', hores: 8,
          continguts: [
            "Variacions",
            "Permutacions. Factorial d'un nombre",
            "Variacions amb repetició",
            "Combinacions. Triangle de Tartaglia. Binomi de Newton",
          ]},
        { id: 'probabilitat', label: 'Probabilitat', hores: 10,
          continguts: [
            "Diagrames de Venn",
            "Regla de Laplace per a esdeveniments equiprobables",
            "Probabilitat condicionada",
            "Probabilitat composta",
            "Llei dels grans nombres",
          ]},
      ]},
    ],
  },

}; // end REPARTIMENT
