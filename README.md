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
| `pistes/ESTIL.md` | Guia d'estil de les pistes |
| `pistes/REVISIO.md` | Seguiment de la revisió, una fila per pista |
| `pistes/editor/EDITOR-PISTES-PAU.md` | L'artifact «Editor de pistes PAU» i els seus scripts |

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
