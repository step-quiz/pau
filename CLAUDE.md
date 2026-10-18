# pau — Repàs PAU de Matemàtiques

<!-- regles-comunes:inici -->
## Regles comunes de Step Quiz

*Aquest bloc és igual a tots els repositoris de `step-quiz`. Les regles específiques d'aquest
repositori, si n'hi ha més avall, manen sobre aquestes quan diuen una altra cosa.*

- **Llengua.** Parla amb l'usuari en català. Tot el que veu l'alumnat, també en català.
- **L'usuari.** David, llicenciat en Matemàtiques i professor d'ESO i Batxillerat a Catalunya.
  Programa en C i dissenya algorismes; d'HTML, CSS, JS, Git, GitHub, Codespaces i LaTeX en sap
  el que cal per fer-los servir, no més. Quan hagi de fer alguna cosa (pull, push, commit, pujar
  un ZIP, compilar…), dona-li els passos numerats, amb les ordres o els textos per copiar i
  enganxar, i explica què fa cada pas.
- **ZIP.** Els ZIP que lliuris, l'usuari els puja a `_uploads/` (GitHub → `_uploads/` →
  *Add file* → *Upload files*), i el workflow `unzip-upload.yml` els descomprimeix a l'arrel i en
  fa commit. Per tant, les rutes de dins del ZIP comencen a l'arrel del repositori (`js/app.js`,
  no `projecte/js/app.js`): cap carpeta que ho contingui tot. El que hi hagi a `.github/` s'ignora;
  els workflows es canvien des del web de GitHub.
- **Publicació.** Els webs es publiquen amb Cloudflare Pages a cada commit de `main`. Cap missatge
  de commit pot portar `[skip ci]`, `[ci skip]` ni `[cf-pages-skip]`, tampoc els dels workflows
  que desen fitxers generats: Cloudflare no publicaria aquell commit.
- **Webs estàtiques.** HTML, CSS i JavaScript sense compilació ni servidor, si aquest repositori
  no diu el contrari. Cap dada personal de l'alumnat en un repositori públic.
- **Documentació.** Si canvies el comportament, posa al dia el README i els documents que el
  descriuen en el mateix commit. Si el codi i un document no coincideixen, el que s'ha
  d'arreglar és el document.
- **Proves.** Abans de lliurar res, passa les proves del repositori i digues-ne el resultat.
<!-- regles-comunes:fi -->

## Aquest repositori

Web estàtica (`index.html` + `config.js`) amb 67 exercicis de PAU. Cada exercici `<id>` té tres PDF a `data/`: `-e` (enunciat), `-p` (pista), `-s` (solució).

- `-e.pdf` i `-s.pdf` són retalls dels PDF oficials del Departament d'Universitats: **el contingut no es modifica**. Si un retall és defectuós (li falta un tros o en té d'un altre exercici), es refà a partir de les pàgines oficials, sense alterar-les.
- `-p.pdf` es genera des de `pistes/src/<id>.tex` amb `python3 pistes/build.py <id>`. No editeu mai el PDF directament. El repositori és l'única font de les pistes (ja no hi ha còpia a Overleaf).
- A `main`, la GitHub Action `.github/workflows/pistes.yml` recompila les pistes quan canvia un `.tex` i desa els PDF. A les altres branques, compileu-les vosaltres abans del commit.
- La llista d'exercicis de la web és l'objecte `EXERS` d'`index.html`; ha de coincidir amb els fitxers de `data/`.
- Per afegir una convocatòria nova (p. ex. juny o setembre 2027), seguiu `UPDATING.md`.

## Revisió de pistes

Flux de treball: el David diu què canviar → s'edita `pistes/src/<id>.tex` → `python3 pistes/build.py --png <dir> <id>` → es mostra la imatge al David → commit i push.

- Seguiu `pistes/ESTIL.md`. Les pistes amb *Autor = David* a `pistes/REVISIO.md` només s'hi corregeixen errors.
- Per revisar una pista, contrasteu-la amb `data/<id>-e.pdf` i amb la pauta oficial `data/<id>-s.pdf`.
- Actualitzeu `pistes/REVISIO.md` (estat i notes) al mateix commit que la pista.
- Comuniqueu-vos amb el David en català. Quan calgui que faci passos de git o GitHub, doneu-los detallats i amb ordres per copiar i enganxar.
- L'artifact «Editor de pistes PAU» (per editar les pistes i copiar-les a GitHub) es documenta a `pistes/editor/EDITOR-PISTES-PAU.md`.
