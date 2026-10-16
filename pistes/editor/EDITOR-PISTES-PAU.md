# Editor de pistes PAU (artifact de Claude)

> **Per a qui és aquest document.** Per a una IA Claude que arriba sense cap context i ha de mantenir
> o ampliar l'artifact «Editor de pistes PAU», i per al professor (David) que hi treballa.
> Estat a **16 d'octubre de 2026**. L'usuari parla **català**: respon-li sempre en català.

## 1. Què és

Una pàgina web privada (un *artifact* de claude.ai) per **editar còmodament les pistes en LaTeX** del
repositori públic **`step-quiz/pau`** (`pistes/src/<id>.tex`), com a alternativa al llapis de l'editor de GitHub.

- **Artifact:** https://claude.ai/artifact/YVXdVe71WsDE9seJecf4xu (privat: només el propietari el pot obrir, i la
  conversa de Claude ha de ser del mateix compte).
- **Repositori font:** https://github.com/step-quiz/pau (públic; Claude només el pot llegir, no hi pot pujar res).
  Tant les pistes (`pistes/src/*.tex`) com el PDF que mostra la web (`data/<id>-p.pdf`) hi viuen; el PDF el compila
  una GitHub Action quan es fa commit d'un `.tex`.
- **Mida:** 67 exercicis (16 `alg-`, 31 `ana-`, 11 `geo-`, 9 `pro-`), **165 pistes** (un bloc `\pista{…}` per apartat).
- **Decisions de l'usuari:** vol només editar el text de dins de `\pista{…}`; **no vol vista prèvia** (el PDF final ja el compila
  la GitHub Action); **no vol fer commits des d'aquí**: copia i enganxa ell mateix.

## 2. Com el fa servir l'usuari

1. Tria l'exercici a la llista de l'esquerra (cercador per codi o text; filtres *Totes / Amb canvis / Àlgebra / Anàlisi /
   Geometria / Probabilitat*). La llista és estreta (120–150 px) i només mostra el codi (`ana-23s-q2`); la procedència surt
   en passar-hi el ratolí. **Decisió de l'usuari (16/10/2026):** sense text d'ajuda a dalt, sense la procedència a la capçalera
   de l'exercici, sense «Escriu a: Pista N» i sense comptador de caràcters. No els tornis a posar.
   Tampoc vol textos emergents (`title`) als botons: el hover es marca amb fons gris suau (`--hover`) i vora `var(--fg)`.
2. A la dreta veu, per a cada apartat: l'**enunciat en lectura** (LaTeX cru, plegat) i un **quadre editable** amb la pista.
3. Una **barra d'eines única**, fixa a dalt (al mòbil no és fixa), escriu a la pista on hi ha (o hi havia) el cursor
   («Escriu a: Pista N»). Si hi ha text seleccionat, l'envolta. Els fragments de fórmula porten els `$ $` sols si el cursor
   no és dins d'una fórmula. Tot es desfà amb Ctrl+Z (s'insereix amb `execCommand('insertText')`).
   - *Fórmula:* `$ $` · `^{ }` · `_{ }` · `\dfrac` · `\sqrt` · **Símbols ▾** (`\cdot \times \neq \to \infty \pi \lambda \mu \in \le \ge \pm \ldots`)
   - *Àlgebra:* `\vec` · `\det` · matriu 2×2 · 3×3 · sistema (`\left.\begin{array}{r}…\right\}`) · **Sarrus…**
   - *Anàlisi:* `\lim` · `\int` · `\ln` · `f'(x)` · `f''(x)`
   - **Frases ▾:** «Atenció: », «Observació: », «Fixa't que », «Recorda: », «Resol l'equació », «eix d'ordenades»,
     «eix d'abscisses», «pel mètode de Gauss», «per la regla de Sarrus».
   - **Decisions de l'usuari (16/10/2026):** *no* vol botons per a `« »`, `\emph`, `\text`, `\[ \]`, «Comprova que», `{,}`, `\,\%`,
     `\,\euro` ni `\,`. No els tornis a proposar.
   - **Forats:** cada fragment té forats (`¦` a la taula `SN` del codi). El primer rep la selecció; **Tab** salta al següent i,
     al final, surt de la fórmula. Sense forats pendents, Tab no fa res (no surt del quadre).
   - **Sarrus…** (Alt+S): l'usuari escriu la matriu 3×3 per files (espais, `&` o un `pmatrix` enganxat; admet paràmetres,
     fraccions i decimals). Un petit motor de polinomis amb coeficients racionals (funcions `parse`, `P`, `sarrus`) escriu:
     ```
     $$[t1 + t2 + t3] - [t4 + t5 + t6] =$$
     $$= (suma positius) - (suma negatius) =$$
     $$= resultat$$
     ```
     Termes positius: a11a22a33, a12a23a31, a13a21a32; negatius: a13a22a31, a11a23a32, a12a21a33. Un producte de més d'un
     terme va entre parèntesis. Ordre: grau descendent. Comprovat contra el desenvolupament per adjunts i compilat amb pdflatex.
   - **Dreceres** (tecla `?` o botó *Dreceres*): Ctrl+M `$ $` · Alt+V `\vec` · Alt+Q `\dfrac` · Alt+P `\pi` · Alt+L `\lambda` ·
     Alt+M `\mu` · Alt+. `\cdot` · Alt+X `\times` · Alt+S Sarrus · Alt+↓/↑ pista següent/anterior (canvia d'exercici) ·
     Ctrl+Retorn `\\[\smallskipamount]` + salt de línia (línia nova amb un petit espai; **no copia**: l'usuari prefereix el botó Copia) ·
     `/` cerca. Dins de `\pista{…}` **una línia en blanc no compila** (`\textcolor` no admet `\par`), i `\smallskip` sol no fa saltar de línia:
     per això Ctrl+Retorn escriu `\\[\smallskipamount]` (provat amb pdflatex, decisió de l'usuari 16/10/2026). Les Alt usen `e.code` (tecla física) i ignoren AltGr (= Ctrl+Alt), que al teclat català fa `@ # [ ] { }`.
   - **Avisos:** en vermell, claus `{ }` que no quadren i `$` sense tancar; en taronja, cometes rectes, «anem a», «donat que»,
     «en base a» i pista de més de 700 caràcters (~6 línies).
4. Els canvis **es desen sols** (0,7 s després de teclejar). Es poden tancar la pàgina i continuar un altre dia.
5. **Copia** copia al portapapers el **fitxer `.tex` sencer** de l'exercici triat, amb els canvis. Si el navegador no deixa,
   s'obre un diàleg amb el text ja seleccionat (Ctrl+C).
6. **Obre a GitHub ↗** obre `https://github.com/step-quiz/pau/edit/main/pistes/src/<id>.tex`: Ctrl+A, Ctrl+V, *Commit changes*.
   La GitHub Action compila el PDF (es veu a la pestanya *Actions*; una creu vermella vol dir error de LaTeX).

## 3. Com està fet

Una **sola pàgina HTML autocontinguda** (sense fitxers externs). Les dades van incrustades al codi:

```js
const FILES = [ { id:'alg-23j-q2', pro:'PAU Catalunya 2023 · …', area:'Àlgebra', segs:[ … ] }, … ];
```

- `segs` és una llista **alternada** de trossos: `segs[0]` = tot el fitxer fins a `\pista{` inclòs; `segs[1]` = **contingut de la
  pista (l'únic editable)**; `segs[2]` = des de `}` fins al següent `\pista{`; … ; l'últim = la cua. El fitxer es reconstrueix
  concatenant-ho tot (amb les pistes editades). El generador **comprova que els 67 fitxers es reconstrueixen idèntics**
  abans de publicar.
- L'enunciat de cada apartat és `segs[2i]` sense la capçalera (només per llegir).
- **Desat:** capacitat `db` de l'artifact, col·lecció **`pistes`**, un document per pista modificada, id
  `<id>_<índex>` (p. ex. `alg-23j-q2_0`), camps `{ id, idx, text }` (`text` = LaTeX cru de dins de `\pista{}`).
  Si el text torna a ser igual a l'original, el document s'esborra. Una pista sense document = igual que al repositori.
- Els canvis es mostren amb un punt taronja i l'etiqueta «modificada».
- Estat al moment d'escriure això: la col·lecció `pistes` és **buida** (cap canvi pendent) i el contingut coincideix amb
  `step-quiz/pau` a `main` (commit `c63c7eb`).

## 4. Fitxers per regenerar l'artifact

L'HTML publicat el fa un generador. Els fitxers són al repositori `pau`, a **`pistes/editor/`** (aquest document hi és al costat).
Aquesta carpeta no dispara la compilació de pistes (`pistes.yml` només mira `pistes/src/**` i `pistes/build.py`).

| Fitxer | Paper |
|---|---|
| `pistes/editor/genera-editor-pau.js` | Llegeix `pistes/src/*.tex`, els trenca en `segs`, comprova la reconstrucció i incrusta les dades a la plantilla. |
| `pistes/editor/plantilla-editor-pau.html` | L'HTML/CSS/JS de la pàgina, amb el marcador `__DATA__` al lloc de les dades. |

Des de l'arrel del repositori (la sortida, `editor-pau.html`, és només per publicar: **no la pugis al repositori**):

```bash
node pistes/editor/genera-editor-pau.js pistes/src pistes/editor/plantilla-editor-pau.html editor-pau.html
# → «67 fitxers, 165 pistes → …/editor-pau.html»
```

## 5. Procediments (per a Claude)

**Carrega primer** les eines: `Artifact` i `ArtifactData` (a Claude Code poden ser *deferred*: `ToolSearch` amb `select:ArtifactData`).
Carrega també la skill `artifact-capabilities` abans de tocar `capabilities`, i `artifact-design` abans d'escriure la pàgina.

**A. Actualitzar l'editor quan el repositori ha canviat** (l'usuari diu «actualitzar l'editor de pau»)
1. Clona/actualitza `step-quiz/pau` (`GIT_LFS_SKIP_SMUDGE=1 git clone --depth 1 …`; lectura anònima).
2. Genera l'HTML (comanda de dalt).
3. **Abans d'esborrar res**, llista la col·lecció `pistes` (`ArtifactData list`, amb `out_dir` per tenir còpia) i compara cada
   document amb el `.tex` nou: els que ja són iguals sobren; els que **difereixen poden ser canvis encara no copiats**:
   no els esborris sense dir-ho a l'usuari.
4. Publica el mateix fitxer (`Artifact` amb el mateix `file_path` → mateix URL; **no passis `icon`**; les `capabilities`
   `{db:{}}` es conserven).
5. Esborra els documents ja absorbits (`ArtifactData batch`, `delete` amb `if_version` de cada document).

**B. Deixar esborranys de pistes** (només si l'usuari ho demana; mai directament al repositori)
- Escriu `ArtifactData set` a `pistes/<id>_<idx>` amb `{id, idx, text}`. Al crear un document nou no cal `if_version`; per
  **sobreescriure** un document existent sí, i **comprova que encara és la versió que va escriure Claude** (si l'usuari l'ha
  tocat, no el trepitgis). Per a moltes pistes: `batch` amb `file_path` per entrada.
- El `text` és el LaTeX de dins de `\pista{…}`, sense les claus externes. Segueix `pistes/ESTIL.md` (persona verbal,
  cometes baixes, decimals amb coma, 2–6 línies per apartat, la pista orienta i no resol).
- Llegeix l'enunciat i la pauta oficials abans d'escriure: `data/<id>-e.pdf` i `data/<id>-s.pdf`.

**C. Llegir els canvis de l'usuari**
- `ArtifactData list` de `pistes`; cada document és una pista modificada. Per construir el `.tex` sencer, substitueix el
  contingut de la pista corresponent al fitxer original (o fes servir el botó Copia, que ho fa igual). L'usuari fa el commit.

**D. Canviar la interfície**
- Edita `pistes/editor/plantilla-editor-pau.html`, torna a generar i publica. Tota la lògica és a l'`<script>` final.
  Després dona a l'usuari la plantilla nova en un ZIP (amb la ruta `pistes/editor/…`) perquè la pugi a `_uploads/`.

## 6. Trampes ja trobades

- L'artifact **no pot descarregar fitxers** ni imprimir: per això el botó Copia usa el portapapers (amb diàleg de reserva).
- L'artifact no pot carregar el CSS de KaTeX (només fonts de Google): per això **no hi ha vista prèvia** de les fórmules.
- La capçalera de cada `.tex` (`\documentclass`, `\pistainfo`…) i els enunciats són **de només lectura**: no es poden editar
  des d'aquí (les pistes ja porten l'enunciat oficial de la PAU, que no es modifica).
- L'`ArtifactData set` sobre un document existent exigeix `if_version`; una escriptura amb versió antiga falla sense
  escriure res (bé: protegeix els canvis de l'usuari).
- Si l'usuari obre l'artifact mentre es republica, la pàgina es recarrega sola i conserva els seus canvis (són a la base de dades).

## 7. Relació amb l'altre editor

Hi ha un segon artifact, «Editor de pistes» (https://claude.ai/artifact/NzczJWtYP2uPButkugF6pB), per al fitxer `hints.js` del
repositori `arsocivil/sol3` (pistes en HTML per als alumnes de 2n de Batxillerat). Funciona igual (Copia → Ctrl+A/Ctrl+V a
GitHub; esborranys a la col·lecció `hints`), però copia el fitxer **sencer** `hints.js`. No es barregen: cadascun té el seu
repositori, el seu format (LaTeX / HTML) i la seva guia d'estil.

## 8. Què donar a una IA Claude en una conversa nova

Els tres fitxers (aquest, `genera-editor-pau.js` i `plantilla-editor-pau.html`) són al repositori, a `pistes/editor/`,
i el `CLAUDE.md` de l'arrel hi apunta. N'hi ha prou amb:
1. Que la sessió pugui llegir `step-quiz/pau` (és públic; es pot clonar sense credencials).
2. L'enllaç de l'artifact (a dalt). La conversa ha de ser del mateix compte que l'artifact.

**Recomanat si també ha d'escriure o revisar pistes** (de `step-quiz/pau`; si la sessió està connectada al repositori ja hi són):
`CLAUDE.md`, `pistes/README.md`, `pistes/ESTIL.md`, `pistes/REVISIO.md`, `pistes/src/pista.sty` i una pista d'exemple
(`pistes/src/alg-23j-q2.tex`). Els enunciats i les pautes són a `data/<id>-e.pdf` i `data/<id>-s.pdf`.

**Opcional, per imitar la veu del professor:** la secció «Estil de les pistes» del `CLAUDE.md` de `arsocivil/sol3` i les pistes
de les unitats 7, 8 i 9 de `hints.js`. El format és diferent (HTML en lloc de LaTeX), però la manera d'explicar (el perquè,
preguntes de comprensió, exemples concrets, l'«Atenció:» per al parany) és la que ell prefereix.

**Primera frase suggerida per a la conversa nova:**

> Llegeix `pistes/editor/EDITOR-PISTES-PAU.md` del repositori `step-quiz/pau`. Treballem amb l'artifact «Editor de pistes PAU»
> (https://claude.ai/artifact/YVXdVe71WsDE9seJecf4xu). Respon en català. Abans de fer res, comprova que pots llegir
> l'artifact i la col·lecció `pistes`, i digues-me què veus.
