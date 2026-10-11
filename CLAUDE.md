# pau3 — Repàs PAU de Matemàtiques

Web estàtica (`index.html` + `config.js`) amb 67 exercicis de PAU. Cada exercici `<id>` té tres PDF a `data/`: `-e` (enunciat), `-p` (pista), `-s` (solució).

- `-e.pdf` i `-s.pdf` són retalls dels PDF oficials del Departament d'Universitats: **el contingut no es modifica**. Si un retall és defectuós (li falta un tros o en té d'un altre exercici), es refà a partir de les pàgines oficials, sense alterar-les.
- `-p.pdf` es genera des de `pistes/src/<id>.tex` amb `python3 pistes/build.py <id>`. No editeu mai el PDF directament. El repositori és l'única font de les pistes (ja no hi ha còpia a Overleaf).
- A `main`, la GitHub Action `.github/workflows/pistes.yml` recompila les pistes quan canvia un `.tex` i desa els PDF. A les altres branques, compileu-les vosaltres abans del commit.
- La llista d'exercicis de la web és l'objecte `EXERS` d'`index.html`; ha de coincidir amb els fitxers de `data/`.

## Revisió de pistes

Flux de treball: el David diu què canviar → s'edita `pistes/src/<id>.tex` → `python3 pistes/build.py --png <dir> <id>` → es mostra la imatge al David → commit i push.

- Seguiu `pistes/ESTIL.md`. Les pistes amb *Autor = David* a `pistes/REVISIO.md` només s'hi corregeixen errors.
- Per revisar una pista, contrasteu-la amb `data/<id>-e.pdf` i amb la pauta oficial `data/<id>-s.pdf`.
- Actualitzeu `pistes/REVISIO.md` (estat i notes) al mateix commit que la pista.
- Comuniqueu-vos amb el David en català. Quan calgui que faci passos de git o GitHub, doneu-los detallats i amb ordres per copiar i enganxar.
