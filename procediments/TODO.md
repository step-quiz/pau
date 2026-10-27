# TODO — audit «apply every improvement everywhere»: done (October 2026)

David's request: «revisar que una millora que s'ha fet en un cas concret també s'apliqui a tot arreu
on es pugui aplicar». Every item of this list is done; the rules are in `INSIGHTS.md` §3b and are
enforced by the checker section «regles generals de totes les pàgines» (`proves/comprova.js`).

Done:
1. Equations: bare named equation first, working row, products with «·», lilac solutions,
   crossed-out solutions outside the domain (`Formules.resolEquacio`, `Matrius.passosArrels`).
2. polinomi-condicions: system labelled «(EQ.n)», reduction method (`Matrius.passosCombina`,
   `passosReduccio2`, moved from geometria.js to matrius.js), values found boxed.
3. sistema-sci: values found boxed.
4. Minimum board font 24 px (`MIDA.minimaAlcada`).
5. Lint section of general rules in the checker, with `muta-regles.py`.
6. Mutation scripts updated (area-eix, area-corbes, polinomi); browser tests and screenshots run.
7. index.html with PROBLEMES and DEMO buttons; diagonalisation pages deleted.

Nothing pending. New general rules from David → add them to `INSIGHTS.md` §3b and to the lint
section, then apply them to every page.
