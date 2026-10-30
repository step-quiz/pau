# Revisió de les pistes — PROBLEMES (editor WYSIWYG)

Canvis a les pistes (`pistes/src/<id>.tex`) fets amb l'artifact «Pistes PAU WYSIWYG». Fitxer provisional: el David el fusionarà amb `REVISIO.md` (a cada fila de la taula de `REVISIO.md`, la nota s'afegeix al final, abans de l'última `|`, com a « · **rev. 2026-10-30 (editor WYSIWYG):** …»).

## 30/10/2026

**Revisió del David amb l'editor WYSIWYG (30/10/2026)** (canvis escrits pel David a l'artifact «Pistes PAU WYSIWYG», `pistes/editor/EDITOR-WYSIWYG.md`; indicats amb «rev. 2026-10-30 (editor WYSIWYG)» a les notes). Paràgraf nou de la discussió d'un sistema amb paràmetre (Rouché), el mateix a les 9 discussions: «A continuació, estudia el sistema d'equacions. D'una banda, has d'estudiar a part cada valor d'$m$ que anul·la el determinant d'$A$. D'altra banda, la resta de valors que no anul·len el determinant fan que el sistema sigui compatible determinat, és a dir, que té solució única.» Comprovació d'extrems: «Comprova que realment és un mínim relatiu (estudia el canvi de signe de $P'$)», o «(estudia el signe d'$A''$ en aquest punt)» amb la segona derivada. Classificació: «En el punt on una funció passa de créixer a decréixer hi ha un màxim relatiu; en canvi, on passa de decréixer a créixer, hi ha un mínim relatiu.» Interpretació geomètrica: «Cadascuna de les equacions s'interpreta geomètricament com un pla.» Claude ha estès aquestes redaccions a les pistes que encara tenien l'antiga i ha corregit `ana-24j-q5` b) (el canvi de signe és de $C'$, no de $C''$).

| ID | Nota |
|---|---|
| `alg-23j-q4` | a) paràgraf de la discussió (Rouché) com a totes les discussions; b) «Cadascuna de les equacions s'interpreta geomètricament com un pla» |
| `alg-23s-q3` | a) paràgraf de la discussió (Rouché) nou |
| `alg-24j-q2` | a) paràgraf de la discussió (Rouché) nou |
| `alg-24s-q2` | a) paràgraf de la discussió (Rouché) nou |
| `alg-25i-q2` | a) paràgraf de la discussió (Rouché) nou |
| `alg-25j-q2` | a) paràgraf de la discussió (Rouché) nou |
| `alg-25s-q2` | a) paràgraf de la discussió (Rouché) nou |
| `alg-26j-q2` | 2.1 paràgraf de la discussió (Rouché) nou; 2.3 «Cadascuna de les equacions s'interpreta geomètricament com un pla» |
| `alg-26s-q2` | 2.1 paràgraf de la discussió (Rouché) nou; 2.3 «Cadascuna de les equacions s'interpreta geomètricament com un pla» |
| `ana-23j2-q4` | «Comprova que realment és un mínim relatiu (estudia el canvi de signe de $P'$)» |
| `ana-23j2-q6` | b) frase del màxim i el mínim relatius |
| `ana-23s-q6` | «Comprova que realment és un màxim relatiu (estudia el canvi de signe d'$A'$)» |
| `ana-24i-q5` | «Comprova que realment és un màxim relatiu (estudia el signe d'$A''$ en aquest punt)» |
| `ana-24j-q1` | a) «En aquest cas, només cal igualar a zero el numerador»; frase del màxim i el mínim relatius |
| `ana-24j-q5` | b) «Comprova que realment és un mínim relatiu (estudia el canvi de signe de $C'$)» |
| `ana-25i-q1` | b) «En aquest cas, només cal igualar a zero el numerador» |
| `ana-25i-q4a` | «Comprova que realment és un mínim relatiu (estudia el signe d'$S''$ en aquest punt)» |
| `ana-25s-q1` | b) «En aquest cas, només cal igualar a zero el numerador» |
| `ana-26j-q4a` | «Comprova que realment és un mínim relatiu (estudia el signe d'$A''$ en aquest punt)» |
| `ana-26s-q1` | 1.1 «En aquest cas, només cal igualar a zero el numerador»; frase del màxim i el mínim relatius |
| `pro-26j-q3` | 3.1 «Fes un diagrama d'arbre.» en paràgraf propi i els dos camins més explícits; 3.2 el denominador a partir de l'apartat 3.1; 3.3 Bolzano amb la funció $D$ i la cerca per dècimes |

## 30/10/2026 (tarda): segona tanda

33 pistes noves revisades pel David a l'editor (65 de 165 revisades en total: 54 amb canvis i 11 marcades com a correctes), més els seus comentaris convertits en regles (`ESTIL.md` §4 i §7.2b):

- **Cap apòstrof davant d'un símbol**: 72 casos a tot el corpus de pistes, reescrits amb el nom de l'objecte («el determinant de la matriu $A$», «cada valor del paràmetre $m$», «el signe de la funció $f'$», «la distància del punt $S$», «la recta $r$», «del vèrtex $A$»). També «Per a la matriu $D$» (`alg-23j-q2` b) en lloc de «Per a $D$».
- **Equació amb valor absolut**: sempre el recordatori «$|X| = 5$ vol dir que $X = 5$ o bé $X = -5$» (afegit a `geo-26j-q4b` 4.3).
- **Rouché**: «cada valor del paràmetre $k$» a les 9 discussions.
- Correccions de Claude sobre el text del David: `alg-26j2-q2` 2.2 «calcula» (no «calcular»); `alg-26s-q2` 2.2 l'equació $(1 - k) \cdot y = 0$ en línia a part, «que es compleix sempre»; `ana-23j-q3` b) «com tens costum de veure»; `geo-24j-q6` c) «Si hi pertany» / «si no hi pertany»; `ana-23j2-q1` b) fórmula del vèrtex amb punt final; paràgrafs buits i espais finals.
- Per cabre en una pàgina: `pro-26j-q3` 3.1 «Fes un diagrama d'arbre.» torna al mateix paràgraf i 3.3 «fins que tornis a trobar un canvi de signe»; `alg-26j-q2` 2.2 un paràgraf menys; `ana-26j2-q4a` 4.1 «correspon a $f'$, i no a $f$», 4.2 «On la gràfica és per sobre/sota…», 4.3 «escriu que $f$ és una primitiva de la seva derivada: es puntua».
