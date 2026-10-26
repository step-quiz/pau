# TODO — audit «apply every improvement everywhere» (for the next session)

David's request (Oct 2026): «revisar que una millora que s'ha fet en un cas concret també s'apliqui
a tot arreu on es pugui aplicar». Read `INSIGHTS.md` §3b (rules already generalised) first.
Before delivering: `node procediments/proves/comprova.js` must end with «Tot correcte».
Talk to David in Catalan; ZIP with only the changed files (paths from the repo root); never
`[skip ci]` in commit messages.

## Done in the previous session (delivered in the partial ZIP)
- `Formules.resolEquacio` (equation stays, working row, products with «·», lilac step,
  crossed-out solutions), `tatxa`, `tatxaSolucio`, `marcaSolucio`, `textSolucions`.
- `Matrius.passosArrels` rewritten from the integrals session's `passosTalls` (free rows
  `lliures`, `nom`); `integrals.js` reduced to wrappers.
- Pages: extrems, creixement (domain and f'(x) = 0 written first; fraction step; crossed-out
  critical points outside the domain), optimització (A'(x) = 0 first, working row = answer row,
  crossed-out candidates, derivative written in descending order), recta-tangent (pendent mode:
  f'(x) = m first, rows 2–3; `m · (x − x₀)` with a dot), asímptotes, determinant (free rows
  4–7), discussió (summary «|A| = 0 ⟺ …», rows reused), àrea-eix / àrea-corbes («f(x) = 0»
  first), àrea-paràmetre (lilac), geometria.js products with «·» before parentheses.
- Checker: `comprovadorTalls` (nomEq, fase, textPla), `separaTatxades`, new checks in extrems,
  creixement, optimització, asímptotes, recta-tangent, determinant, discussió, resolEquacio tests.
  Full checker: «Tot correcte».

## Still to do
1. **polinomi-condicions**: the 2×2 subsystems are solved by substitution or by «resta la
   tercera de la quarta» with parentheses. David's rule (geometry, image 4–5): 2×2 systems by the
   4t ESO reduction method, every equation labelled `(EQ.n)` in colour `#b45309` on its right,
   lines `(EQ.2) · (−2):`, a `\hline` before the sum, found values `\boxed{…}`. Plan: label the
   system rows with (EQ.1)…(EQ.4) (like `Geometria.texSistemaEq`), move `passosReduccio2`,
   `texEq`, `texSistemaEq`, `COLOR_EQ` from geometria.js to matrius.js (load matrius.js in
   polinomi-condicions.html), render every «combine two equations» step in that format, box the
   values found. Keep each problem's solution path (David said «ok» to this page). Update
   `comprovaPolinomi` (it checks equivalence; add the reduction rows via `comprovaReduccio`).
2. **sistema-sci**: box the values found (`z = λ`, `y = …`, `x = …`) in the values row.
3. **Minimum board font**: `motor.js` `MIDA.minimaAlcada` 18 → 24 (the integral pages already
   force 24 px with `integrals.css`; David: «surt absurdament petit»). Check with viewport
   screenshots (1366×768 and 1100×800) that controls stay visible (sticky) and the board scrolls.
4. **Lint section in `proves/comprova.js`** scanning every step of every procedure: no point
   written `X = (`/`P = (`, no letter X or H for points, no «Cramer», no «comprovació»/«comprova»
   after the answer (except f'' of a required extremum), no SCD/SCI/SI/AV/AH/AO, no `\cap`,
   `\varnothing`, `\subset` in geometry answers, no row that is only «= …», products with «·»
   before a parenthesis (number or variable followed by «(», except function calls, vectors
   `λ(…)` and matrices), `«Àrea»`, `«Volum»`.
5. **Mutation scripts** (`proves/mutacions/`): `muta-area-eix.py` and `muta-area-corbes.py` have
   patterns that no longer exist (other session's changes): rewrite them for the current code;
   check every other script still applies (run all; «NO APLICA» = stale pattern) — especially
   creixement/extrems/optimitzacio/asimptotes/determinant/discussio/recta (resolEquacio changes).
6. **Browser tests** (`proves/navegador/`): run all
   (`NODE_PATH=$(npm root -g) node procediments/proves/navegador/prova-X.js <repo> /opt/npm-tools/node_modules/katex/dist <shots>`).
   `prova-index-demo.js` passes: `index.html` now has the PROBLEMES and DEMO buttons on each
   card (David: that is the right index.html); the card itself opens nothing.
   `prova-area-parametre.js` sketch width limit already relaxed to 600 px.
7. Viewport screenshots of the changed pages (extrems, creixement, optimització, recta-tangent
   pendent, discussió, determinant, asímptotes) to check the working rows look right.
8. David must delete on GitHub: `procediments/diagonalitzacio.html`, `diagonalitzacio.js`,
   `proves/mutacions/muta-diag.py`, `proves/navegador/prova-diag.js` (page replaced by esglaonar).
