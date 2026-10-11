# Pistes

Cada exercici té una pista en LaTeX a `src/<id>.tex`, que es compila a `../data/<id>-p.pdf` (el PDF que mostra la web). Aquest repositori és l'**única font** de les pistes: no n'hi ha cap còpia a Overleaf. Els enunciats (`-e.pdf`) i les solucions (`-s.pdf`) són retalls dels PDF oficials del Departament i no es generen aquí.

| Fitxer | Què és |
|---|---|
| `src/pista.sty` | Preàmbul comú: colors, caixa de pista, capçalera. Un canvi aquí afecta totes les pistes. |
| `src/<id>.tex` | Una pista per exercici. `<id>` és el mateix nom que fa servir la web (`alg-23j-q2`, …). |
| `build.py` | Compila les pistes i copia els PDF a `data/`. |
| `REVISIO.md` | Estat de la revisió de cada pista. |
| `ESTIL.md` | Criteris d'estil per escriure i revisar pistes. |

## Com es modifica una pista (tres maneres)

### 1. Demanar-ho a Claude (la més senzilla)
Explica a Claude quina pista vols canviar i com. Claude edita el `.tex`, el compila, t'ensenya el resultat i el puja a la seva branca. Després només cal fusionar el PR.

### 2. Des de la web de GitHub (sense instal·lar res)
1. Obre el fitxer de la pista, per exemple `https://github.com/arsocivil/pau3/blob/main/pistes/src/geo-24s-q6.tex`.
2. Clica el llapis (*Edit this file*), fes el canvi i clica **Commit changes…** directament a `main`.
3. La GitHub Action **Compila les pistes** compila el PDF i el desa a `data/` tota sola en un parell de minuts. Pots seguir-la a la pestanya **Actions** del repositori: si surt una creu vermella, és que el LaTeX té un error (clica-hi per veure'l).

Amb aquest mètode no veus el PDF abans de publicar-lo. Per a canvis grans, millor la manera 3.

### 3. Amb GitHub Codespaces (com Overleaf, però dins del repositori)
1. A la pàgina del repositori: botó verd **Code** → pestanya **Codespaces** → **Create codespace on main**. La primera vegada triga uns minuts perquè instal·la LaTeX.
2. Obre `pistes/src/<id>.tex`. Cada vegada que deses (Ctrl+S) es compila i el PDF apareix en una pestanya (si no surt, clica la icona de la lupa a dalt a la dreta).
3. Quan estiguis content, a la terminal (menú *Terminal → New Terminal*):
   ```bash
   git add pistes/src
   git commit -m "Pista geo-24s-q6: aclareix l'apartat c"
   git push
   ```
   La GitHub Action generarà el PDF de la web, com a la manera 2. Si el vols generar tu mateix: menú *Terminal → Run Task… → Pista oberta → data/<id>-p.pdf* i afegeix també `data/` al commit.
4. Quan acabis, atura el Codespace (botó **Code** → **Codespaces** → `…` → **Stop codespace**) per no gastar la quota gratuïta.

## Afegir una pista nova
1. Copia una pista de la mateixa convocatòria com a plantilla, amb el nom `src/<id>.tex`.
2. Afegeix l'exercici a l'objecte `EXERS` d'`index.html` i els PDF `-e` i `-s` a `data/`.
3. Afegeix una fila a `REVISIO.md`.

## Compilar a mà
```bash
python3 pistes/build.py                       # totes les pistes
python3 pistes/build.py geo-25j-q4b alg-23j-q2  # només aquestes
python3 pistes/build.py --png /tmp/prev geo-25j-q4b  # i, a més, una imatge PNG de cada una
```
Si una pista no canvia, el PDF que en surt és idèntic byte a byte (git no hi veu cap canvi).

LaTeX s'instal·la amb `.devcontainer/install-latex.sh`, que fan servir Codespaces, la GitHub Action i les sessions de Claude Code.

## Tornar a Overleaf (si mai cal)
```bash
python3 pistes/build.py --zip pistes-overleaf.zip geo-25j-q4b geo-24j-q6
```
El ZIP conté `pista.sty` i els `.tex` demanats. A Overleaf: *New Project → Upload Project*. Després, el `.tex` modificat s'ha de tornar a copiar a `pistes/src/`.
