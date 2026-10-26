# pau

Recopilatori d'enunciats, pistes i solucions de proves PAU de Matemàtiques (2023–2026).
Web estàtica: `index.html` (tota l'aplicació; la llista d'exercicis és l'objecte `EXERS`)
i `config.js` (exercicis optatius i vídeos de YouTube).

Hi ha **67 exercicis** (16 d'àlgebra, 31 d'anàlisi, 11 de geometria i 9 de probabilitat).
Per a cada exercici `<id>` (per exemple `ana-26j-q1`), `data/` té tres PDF:

| Fitxer | Què és | D'on surt |
|---|---|---|
| `<id>-e.pdf` | Enunciat | Retall del PDF oficial (no se'n modifica el contingut) |
| `<id>-s.pdf` | Solució / pauta | Retall del PDF oficial |
| `<id>-p.pdf` | Pista | Generat amb `python3 pistes/build.py <id>` a partir de `pistes/src/<id>.tex` |

## Documentació

| Fitxer | Per a què |
|---|---|
| `CLAUDE.md` | Regles curtes del projecte i flux de revisió de pistes |
| `UPDATING.md` | Com afegir una convocatòria nova (en anglès) |
| `pistes/README.md` | Com editar una pista a mà |
| `pistes/ESTIL.md` | Guia d'estil de les pistes (en anglès) |
| `pistes/REVISIO.md` | Seguiment de la revisió, una fila per pista |
| `pistes/editor/EDITOR-PISTES-PAU.md` | L'artifact «Editor de pistes PAU» i els seus scripts |
| `procediments/INSIGHTS.md` | Procediments animats: com estan pensats i com fer-hi canvis (per a una IA, en anglès) |
| `procediments/README.md` | Procediments animats: arquitectura, format dels passos, proves (en anglès) |

## Procediments animats

`procediments/` té pàgines que mostren un procediment mecànic pas a pas, amb animacions. Del bloc d'Àlgebra: el determinant d'una matriu 3×3 amb un paràmetre (Sarrus) i els valors que l'anul·len, el rang d'una matriu orlant menors, un sistema compatible indeterminat amb el seu conjunt de solucions, la discussió d'un sistema amb un paràmetre, la matriu inversa 3×3 per adjunts, les equacions matricials, i la diagonalització. Del bloc de Probabilitat: l'arbre de probabilitats i la probabilitat total, el teorema de Bayes i la distribució binomial. Del bloc d'Anàlisi: l'equació de la recta tangent, els màxims i mínims relatius, l'estudi del creixement (taula de signes), sis problemes d'optimització i sis polinomis de grau 3 que cal trobar a partir de condicions, el teorema de Bolzano amb el mètode de la bisecció, les asímptotes d'una funció racional, i les integrals: la primitiva amb una condició, la regla de Barrow, l'àrea entre una corba i l'eix OX, l'àrea entre dues corbes i un paràmetre a partir d'una integral o d'una àrea. Del bloc de Geometria: l'equació d'un pla, la recta donada per dos plans, la posició relativa d'una recta i un pla i de dues rectes, les distàncies, les projeccions i els simètrics, l'àrea d'un triangle i el volum d'un tetraedre, i la perpendicular comuna. Totes s'obren des del botó DEMO de cada categoria de la portada (l'altre botó, PROBLEMES, obre la llista d'exercicis de PAU). Les dades es poden canviar amb fletxes o des de l'adreça, per exemple:

- `procediments/recta-tangent.html?f=x^3-3x+1&x0=-1` (també la recta normal, `&recta=normal`, i les tangents d'un pendent donat, `?f=x^3-3x&m=9`)
- `procediments/extrems.html?f=x^3-3x^2+1`
- `procediments/creixement.html?f=(x^2+3)/(x-1)`
- `procediments/optimitzacio.html?p=capsa` (sis problemes fixos: hort, capsa, llauna, diposit, pista, nombres)
- `procediments/bolzano.html?f=x^3+x-1&a=0&b=1&n=3`
- `procediments/asimptotes.html?f=(x^2+3)/(x-1)`
- `procediments/probabilitat-total.html?p=peces` (sis problemes fixos: peces, dau, prova, correu, maquines, bossa)
- `procediments/bayes.html?p=prova` (els mateixos sis problemes, amb la pregunta de Bayes)
- `procediments/determinant.html?A=m,1,1;1,m,1;1,1,m` (la matriu per files, separades per `;`; el paràmetre pot ser a, k, m, p o t)
- `procediments/rang.html?A=1,2,3;2,4,1;3,6,4` (de 2 o 3 files i de 2 a 4 columnes)
- `procediments/sistema-sci.html?S=1,1,1,2;1,-1,2,1;2,0,3,3` (una equació per fila: `1,1,1,2` és x + y + z = 2)
- `procediments/discussio.html?S=1,m,m,-1;-1,1,1,1;2,1,m,2` (el sistema amb el paràmetre, una equació per fila)
- `procediments/inversa.html?A=1,0,1;0,1,1;1,1,1`
- `procediments/equacio-matricial.html?p=axb` (sis equacions fixes: ax, xa, axb, xab, axx, xa2x)
- `procediments/diagonalitzacio.html?A=4,1;2,3` (2×2 o 3×3, amb valors propis enters i diferents)
- `procediments/pla.html?p=tres` (set problemes fixos d'equació d'un pla: tres, punt-recta, rectes, conte-perp, perp-recta, paralel, mediador)
- `procediments/recta-plans.html?S=1,1,-1,1;2,-1,1,5` (la recta com a intersecció de dos plans, una equació per fila: `1,1,-1,1` és x + y − z = 1)
- `procediments/recta-pla.html?r=1,0,2;1,-1,1&pi=2,-1,1,-12` (posició relativa d'una recta i un pla: `r` és un punt i el vector director; `pi` és A, B, C, D de Ax + By + Cz + D = 0)
- `procediments/dues-rectes.html?r=1,0,2;1,1,-1&s=2,3,-1;1,-1,1` (posició relativa de dues rectes: cada recta és un punt i el vector director)
- `procediments/distancies.html?p=punt-pla` (nou problemes fixos: punt-pla, punt-pla-arrel, plans-paralels, plans-secants, recta-paralela, recta-secant, plans-distancia, punts-recta, punt-recta)
- `procediments/projeccions.html?p=punt-pla` (quatre problemes fixos: punt-pla, simetric-pla, punt-recta, simetric-recta)
- `procediments/area-volum.html?p=triangle` (quatre problemes fixos: triangle, triangle-arrel, tetraedre, quart-vertex)
- `procediments/perpendicular-comuna.html?r=3,0,0;1,-1,0&s=1,3,2;1,0,-1` (perpendicular comuna i distància entre dues rectes no paral·leles)
- `procediments/primitiva.html?f=6x^2-4x+1&x0=1&y0=3` (la primitiva que compleix F(x₀) = y₀)
- `procediments/barrow.html?f=3x^2-2x&a=0&b=2` (integral definida per la regla de Barrow)
- `procediments/area-eix.html?f=x^3-4x&a=-2&b=2` (àrea entre la corba i l'eix OX a [a, b])
- `procediments/area-corbes.html?f=x^2&g=x+2` (àrea tancada per dues corbes)
- `procediments/area-parametre.html?p=limit` (tres problemes fixos: limit, coeficient, parabola)
- `procediments/binomial.html?n=5&pc=25&r=ge&k=4` (la probabilitat en tant per cent; en tant per u: `?n=10&p=0,1&r=gt&k=1`; `r` és eq, ge, le, gt o lt)
- `procediments/polinomi-condicions.html?p=tangent` (sis problemes fixos: ordenades, maxim, tangent, inflexio, beneficis, maxmin)

Totes les pàgines comparteixen el motor (`motor.js`) i l'estil (`estil.css`); cada procediment només té una pàgina HTML petita i un fitxer JS. Abans de pujar-hi canvis, passeu les proves:

```
node procediments/proves/comprova.js
```

Comproven, entre altres coses, que cada línia de cada pas sigui una igualtat certa.

## Automatitzacions

- `.github/workflows/pistes.yml`: a `main`, quan canvia `pistes/src/**`, recompila les pistes i desa els PDF.
- `.github/workflows/unzip-upload.yml`: descomprimeix els ZIP pujats a `_uploads/`.
- `.devcontainer/` (Codespaces) i `.claude/hooks/session-start.sh` (sessions de Claude al núvol) instal·len TeX Live.
- `.vscode/tasks.json`: tasques per compilar la pista oberta o totes les pistes.

<!-- atribucio-centre:inici -->

---

Material desenvolupat per **David Arso Civil** per al Departament de Matemàtiques de l'INS Miquel Tarradell.
Contingut sota CC BY-NC-ND 4.0, codi sota llicència MIT. Vegeu [`LLICENCIA.md`](LLICENCIA.md).

<!-- atribucio-centre:final -->
