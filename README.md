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
| `procediments/README.md` | Procediments animats: arquitectura, format dels passos, proves (en anglès) |

## Procediments animats

`procediments/` té pàgines que mostren un procediment mecànic pas a pas, amb animacions. De moment, del bloc d'Anàlisi: l'equació de la recta tangent, els màxims i mínims relatius, l'estudi del creixement (taula de signes), sis problemes d'optimització i sis polinomis de grau 3 que cal trobar a partir de condicions, el teorema de Bolzano amb el mètode de la bisecció, i les asímptotes d'una funció racional. Les dades es poden canviar amb fletxes o des de l'adreça, per exemple:

- `procediments/recta-tangent.html?f=x^3-3x+1&x0=-1`
- `procediments/extrems.html?f=x^3-3x^2+1`
- `procediments/creixement.html?f=(x^2+3)/(x-1)`
- `procediments/optimitzacio.html?p=capsa` (sis problemes fixos: hort, capsa, llauna, diposit, pista, nombres)
- `procediments/bolzano.html?f=x^3+x-1&a=0&b=1&n=3`
- `procediments/asimptotes.html?f=(x^2+3)/(x-1)`
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
