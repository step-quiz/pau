# procediments/ — INSIGHTS for a cold-start AI

Read this **before** touching anything in `procediments/`. `README.md` (same folder) is the *reference* (every file, field, key and test). This file is the *know-how*: why it is built this way, what was learned the hard way, and how to turn a request from David into the right change quickly.

Reading order for a new session: `../CLAUDE.md` (house rules) → this file → `README.md` §1–§5 → the procedure you will touch → its section in `proves/comprova.js`.
To build the same kind of pages for another subject, start from `graspable-formulae.md` (the engine explained for reuse).

---

## 0. What exists (October 2026)

- 30 animated step-by-step pages ("procediments") in the style of Graspable Math, all four categories complete: Àlgebra 7 (diagonalisation replaced by «Esglaonar», Oct 2026), Geometria 8, Anàlisi 12 (incl. 5 on integrals/areas), Probabilitat 3.
- Linked from the site home (`../index.html`): each category card has a **DEMO** button → dialog listing that category's pages (object `DEMOS` in `index.html`).
- ~10 000 lines of vanilla JS, no build step, no dependencies except KaTeX 0.16.9 from cdnjs.
- Tests: `node procediments/proves/comprova.js` → «Tot correcte: ~15.2 M comprovacions» (~4 min). Plus mutation scripts and Playwright browser tests (§6).

## 1. The mental model (the one idea that makes everything work)

**A procedure is a pure function `data → list of board states`. The engine animates the *difference* between consecutive states, using keys as symbol identities.**

- A board state = N rows of TeX (or text, or an SVG sketch). Every symbol that must be *followed* across steps is wrapped `\htmlData{k=KEY}{…}`.
- From state A to state B, the engine (`motor.js`, `creaPissarra`) matches symbols by key: same key → the symbol travels (and cross-fades if its content changed); `fusiona` → several symbols fly into one; `reanomena` → a key changes name but is the same symbol; unmatched → fade out / fade in. Positions are measured on the **real KaTeX DOM**, so any TeX layout works and nothing is positioned by hand.
- Therefore a procedure author never thinks about animation. They only write *what the blackboard looks like after each step*, as a teacher would, and choose keys well. That is why 30 procedures were possible in ~2 days with one engine.

Consequences you must respect:
1. **Keys are identities, not labels.** If the "same" 6 must travel from row 2 to row 4, it needs the same key in both states. If two different symbols share a key in one state → broken animation (the lint catches it).
2. **Key uniqueness is per step across ALL rows.** The #1 source of bugs was prefix collisions between helpers (`Vd` of a vector row vs `V…` of `passosProducteVectorial`; Barrow's `Bq` vs `membreEsquerre('B')`; `D…` data vs distance row). Before choosing a prefix, grep the helpers you call for the prefixes they use. `comprovaGuio` reports duplicates with step and row.
3. **`Formules.guio(n)` drops a step whose board is identical to the previous one.** So optional steps need no `if`: write them unconditionally; if nothing changed they vanish. Use `g.completa(text)` to append a sentence without a new step.
4. **Rows not used by any step are hidden** (`motor.js`, set `usades` in `ajusta`). Branch-dependent rows (e.g. the Ruffini row only when a cubic needs it) leave no gap. Pages may reuse a row index for a later phase once its earlier content is no longer needed (`area-eix.js`: `FILA.signes = FILA.prova`).

## 2. Architecture decisions and why

| Decision | Why |
|---|---|
| One shared engine (`motor.js`) + one shared style (`estil.css`) + per procedure one `.js` (pure data/logic) + one tiny `.html` | David chose "Option B": any improvement to look/timing/behaviour reaches all pages at once (DRY). |
| Classic IIFE scripts, each setting **one frozen global** (`Mates`, `Formules`, `Dades`, `Matrius`, `Geometria`, `Grafiques`, `Arbres`, `Motor`, one per procedure) | Works from any static host (Cloudflare Pages), no bundler, and the *pure* files load in Node via `vm` for the tests. ES modules would break both `file://` previews and the Node loader. |
| Layers: maths (`mates.js`, exact `Fraccio`) → keyed TeX writers (`formules.js`) → domain helpers (`dades.js`, `matrius.js`, `geometria.js`, `grafiques.js`, `arbres.js`) → procedure → engine (only file touching the DOM) | Pure layers are testable and reusable; a helper written for one procedure is promoted to the shared layer as soon as a second one could use it (e.g. `passosArrels` from determinant reused by discussion, diagonalisation, two area pages). |
| **Exact rational arithmetic everywhere** (`Fraccio`; BigInt in binomial) | "Strict-truth maths": a displayed `0,333…` that is really `1/3` is a lie. Floats only for drawing graphs. |
| Data in the address (`?f=x^3-4x&a=-2&b=2`, `?S=…`, `?p=<id>`), read raw from `location.search` | David shares links with students. A literal `+` must mean plus (URLSearchParams would turn it into a space); `^ / , ;` are kept readable when the engine rewrites the address. |
| Two kinds of procedures: **editor** (arrows change integer data, `valida` rejects bad cases) and **fixed problems** (`editor: []`, `Dades.problemesFixos`, chips choose `?p=id`) | Editors when the method is uniform over a data family; fixed problems when each case needs its own story (optimisation, distances, projections, a parameter from an area). |
| `valida` **rejects** cases the method cannot show exactly (irrational roots, cubic without integer root, parallel lines for the common perpendicular, …) with a Catalan sentence | Better to refuse than to show an approximate or incomplete procedure. |
| Light theme only, site palette, category colour via `body[data-categoria]` | Matches `index.html` (no dark mode on the site). |

## 3. Pedagogical design rules (David's, distilled)

These came from David's feedback during development. Apply them by default.

1. **One idea per step**, the way it would be written on a blackboard. If a step does two things (substitute *and* simplify), split it. If a caption needs two sentences to say what happened, the step is probably two steps.
2. **Every line shown is a true statement** (identity, equivalent equation, true value). No "= ?" placeholders, no wrong intermediate forms "to be fixed later". The checker enforces this (§6).
3. The caption says **what is done and why**, short, in Catalan, with `$TeX$`. The *how* is visible on the board.
4. **Reading phase** for word problems: the statement is a text row; phrases are marked (yellow = objective/warning, green = data/condition, «×2» badge = a phrase that hides two conditions), then *dragged* into the formulas (`Formules.enunciatMarcat`, `frase`, cursor `arrossega`). David considers this the most important skill.
5. **Colour marks inside formulas** (`clau(k, tex, 'mes'|'menys'|'tria')`): green = positive / chosen / non-zero minor, red = negative / removed, yellow = added / the one being checked. Keep these meanings. Added Oct 2026: `cami0/1/2` (blue, pink, cyan) = one colour per tree path, on the path's product and on its term in the sum (David: «where does 0,01 come from?»); `actual` (lilac) = the piece being computed now, in every place it appears (binomial: `P(X = 4)` in the question and in its own line). `Formules.marca(tex, m)` colours a piece without a key (inside a keyed symbol).
5c. **Àlgebra conventions (David, Oct 2026)**: every 3×3 determinant by Sarrus written `[… + … + …] − [… + … + …]` (`passosSarrus`, `texSarrusN`); before the polynomial equation, the bare `|A| = 0` (`passosArrels({nom})`); Ruffini with one vertical line only; the solutions found, in lilac; never the abbreviations SCD/SCI/SI (nor AV/AH/AO): full words; `I · X`, never `IX`; no `A·A⁻¹ = I` check on the board; a result («= 0») never alone on a new line (`enLinies` keeps `final` on the last line).
5d. **Systems (David, Oct 2026, insisted)**: never Cramer, anywhere. «Resol» a system → reduce the augmented matrix by Gauss (`Matrius.passosGauss`), free the unknown without a pivot (`z = λ`), back-substitute, give `(x, y, z) = (f₁(λ), f₂(λ), λ)` and the line `P + λv`. «Discuteix» / «Classifica» → `rang(A)`, `rang(A*)` and Rouché–Frobenius. Gauss is a fixed algorithm, never shortcuts: pivot = first non-zero element from the current row down (swap only if 0), `F_i → p·F_i + (−e)·F_j` (always a sum, never fractions, never divide by a gcd, never «swap to get a 1»), big numbers are fine. Do not offer him variants of this (he said so explicitly).
5f. **No checks, ever (David, Oct 2026: «NORMA GENERAL»)**: do only the mechanical computation; when the solution is found, it is over. No «comprovació» rows (plane at the points, A·A⁻¹ = I, F(x₀) = y₀, the point in both planes…). Only checks that are part of the method stay (f''(a) > 0 for an extremum).
5g. **Geometry conventions (David, Oct 2026)**: every 3×3 determinant by Sarrus, also the plane `|x − a …| = 0` and the cross product `|i j k; u; v|` (symbols in the products); 2×2 systems by the **reduction method** of 4t ESO, no matrices (`Geometria.passosReduccio2`: smallest multipliers, never «· 1», rule over the sum); before equating two lines, their parametric equations; the third equation of two lines highlighted «(es compleix!)»; before the normals, the planes π₁, π₂; generic point of a line as «Sabem que P ∈ r: P_r = (…)» and «Si volem que P ∈ π, cal que compleixi l'equació del pla»; substitutions without «1 ·» (`texSubstitucio`); a formula in a statement must never break across lines (`.enunciat .katex {white-space: nowrap}`); sketches at least 400 px wide, a second plane in another colour (`pla2`).
5h. **Names and answers (David, Oct 2026)**: never the letter X for a point, not even an unknown one (intersection of two lines → R; generic point of a plane → G = (x, y, z); generic point of a line in projections → R_λ). The projection of a point (onto a plane or a line), and the foot of the perpendicular in distances, is **Q**, never H. The final answer of a relative position is a **sentence** («Les rectes r i s es tallen en el punt R», «La recta r és paral·lela al pla π»), never set notation (r ∩ s = {R}, ∅, ⊂: too complicated for 2n Batxillerat). A sketch shows only what the problem asks (no P′ when only the projection is asked).
5i. **Reduction and formulas (David, Oct 2026)**: in every 2×2 reduction, each equation of the system has «(EQ.n)» on its right in another colour, the lines say «(EQ.2) · (−2):», and the values found are `\boxed`. Formulas use words: «Àrea = ½|AB × AC|», «Volum = ⅙|det(AB, AC, AD)|» (never S, V, [AB, AC, AD]). When a problem has two solutions, draw both (two tetrahedra).
5e. Diagonalisation is not PAU (David's design mistake): the page was replaced by «Esglaonar una matriu» (3×4, no parameters, varied ranks, easy and long examples).
5b. **Never write a symbol before saying what it means** (David: «has escrit P(F|D) sense dir qui és F ni D»). Event legends are full sentences, one tree level per line («V₁: la primera bola és vermella», never «V₁, B₁: la primera és vermella, blava»), and come before the first formula that uses them. Data rows carry their meaning beside them in grey (binomial: `n = 5   nombre de repeticions`).
6. **Methods are the ones taught in Catalan Batxillerat / PAU**: Sarrus (never Laplace on screen), rank by bordering minors (orlar), Rouché, Gauss (never Cramer, see 5d), reduction for 2×2 systems, adjoints for the inverse, generic point `P_λ` of a line for anything with "a point of the line such that…", plane by `|x−a y−b z−c; v₁; v₂| = 0`, cross product written as `|i j k; u; v|` and expanded, Barrow `F(b) − F(a)`, area = Σ|Iₖ| piece by piece (with the caption showing that ∫ₐᵇ alone is not the area).
7. **Edge cases are taught, not hidden**: distance 0 when objects intersect; "Bolzano does not apply" when same sign (and that it does not mean there is no root); `0 = c` ends a system; normal line vertical when f'(x₀) = 0; complement when it has fewer cases (binomial).
8. **Small sketches** (SVG, `Geometria.esquema(nom)`, `Grafiques.grafica`) to give the idea (normal ⟂ plane, shaded area pieces), never as proof. Tests check values, not drawings.
9. Catalan notation: decimal comma, `;` between interval endpoints, `\iff` (⟺), `ℝ`, `λ, μ` for line parameters, `Dom f = ℝ − {…}`, full words instead of `AV/AH/AO`, `màx/mín`, answers with units and %.
10. Target devices: **Chromebooks (students) and Lenovo laptops (teachers)**, i.e. small landscape screens (~1280–1366 × 600–700 CSS px, often with zoom). The play controls and the step text must be visible without scrolling there (the engine's height fit does this, §4). Phones are secondary: David said (Oct 2026) it is not worth a big effort; the growth table (intervals + `x = a` columns) is wider than a phone on purpose, at his request. Still avoid gratuitous horizontal overflow.

### 3b. Rules generalised to every page (audit, Oct 2026)
David asked that an improvement made in one place be applied everywhere it fits. Already applied:
- Points without «=»: `P(3, -5)`, `A(0, 3, -1)` (statements, board, captions); vectors written with their value directly, never «B − A».
- Equations: write the bare named equation first («f'(x) = 0», «A'(x) = 0», «f'(x) = m», «f(x) = 0», «f(x) − g(x) = 0», «|A| = 0»), then substitute. While it is solved the equation stays on its row and the work goes to a working row below (`Formules.resolEquacio`, `Matrius.passosArrels`); products with «·» (`x · (x − 2) = 0`, also `2 · (x − 1)` in plane equations, `2 · (1 + λ)` in substitutions, `m · (x − x₀)` in the tangent line; matrix products stay juxtaposed except `I · X`); lilac only on the solutions; solutions outside the domain crossed out in red (optimisation, increase/decrease, integral parameter).
- Two planes in a sketch: the second one only has an outline of another colour (no fill): one plane never covers the other.
- Board labels in words: «Àrea =», «Volum =», «màxim»/«mínim» in tables; table headers in bold.
- A result such as «= 0» never alone on a new line (`enLinies` orphan rule).
- No Cramer anywhere; no optional checks after the answer (f''(a) tests of an extremum the statement requires are not optional); no abbreviations (SCD/SCI/SI, AV/AH/AO).
Pending (see `TODO.md`): 2×2 reduction format in `polinomi-condicions`, boxed values in `sistema-sci`, minimum board font 24 px, a lint section in the checker, updated mutations and browser tests.

## 4. Layout insights (phone, fonts, sketches)

- Board font: largest size (30 px desktop, 22 px phone, min 12) at which the **widest TeX row of the whole procedure** fits (`ajusta`). One huge row shrinks *every* step → split long rows instead.
- Height fit (desktop only, Oct 2026): David saw Bolzano on a laptop with the play button below the screen. `ajusta` now also measures every step's whole layer (`.capa.mesura`) and lowers the font (down to `MIDA.minimaAlcada` = 18 px) until the tallest step + the player + ~3 lines of step text fit under the header and statement. If it still does not fit (very tall pages, e.g. two lines), `.controls` (player + step text) is `position: sticky; bottom: 0`, with a shadow while stuck (`.enganxat`, set by an IntersectionObserver on `.marca-controls`). Measure the controls by their *height* only: while stuck their position is not their place in the flow. Board heights grow step by step, so the fit uses the max over all steps. KaTeX HTML is cached per TeX string (`renderitza`) for these extra measurements.
- Width budget: **300 px at phone size**. `Formules.ampleTex(tex)` estimates width (calibrated on KaTeX; matrices/arrays by widest row; `\dfrac` by max of numerator/denominator; strips `\displaystyle`). `Formules.enLinies(inici, peces, {ample: 300})` wraps a sum into an `array` of lines. Use it for any row that can grow with the data (binomial sums, long substitutions, Barrow lines).
- Text rows (`§…`) wrap and keep a fixed font; they do not take part in the fit. A keyed phrase that wraps over two lines gets **no ghost** (class `sense-fantasma`) — a single-line ghost would be drawn over other text. This bug was found by David on his phone; `navegador/prova-partides.js` guards it by sampling mid-transition at 432/375/330 px.
- SVG rows (start with `<svg`) are inserted as-is, cross-fade, are skipped by the font fit, and are sized `width:max(14em, 260px); max-width:100%` (14em alone was too small on phones).
- `\displaystyle\int` — the text-style ∫ looked tiny. The checker's TeX→text converter (`textPla`) strips `\displaystyle`.
- Vector names in sketches: drawn over-arrows (the combining U+20D7 left a gap). Subscripts via `tspan.sub` (regex `/_([^_]+)$/` so `D_λ` works).
- Fraction matrices / tables need extra row spacing `\\[6pt]`.
- Ghost size bug (found by David, Oct 2026): KaTeX may put a relative sizing class on the keyed element itself (`sizing reset-size3 size6` from `\textstyle` inside `\xrightarrow`). The ghost copy re-applied it outside its context → fractions on tree arrows flew at ~2× size. Fix in `fantasma`: the copy gets the element's computed `font-size` inline. If a ghost looks bigger/smaller than its symbol, look at the classes on the keyed element.
- Board scroll (Oct 2026, David: «the board should have its own slider, not the window's»): `ajusta` sets `.escenari { max-height }` so the board + controls fit the window (min 260 px) and `.escenari` has `overflow-y: auto`. Ghost/effects coordinates stay valid because `.efectes` scrolls with the content and nothing scrolls during an animation: `fesVisible` scrolls *before* positions are measured, to the lowest row whose HTML or class changes (a row that only becomes `final` changes its class, not its HTML). Line width for laptops: `Formules.AMPLE_LINIA` = 460.
- Text rows (`§…`) accept `\n` as a line break (`<br>`), e.g. one tree level per legend line.
- Overlapping ghosts (David's video, Oct 2026: «two shifted determinants on top of each other, weird for a human»): when a keyed piece is replaced by a different one with the same key (cross-fade), the new one must travel along the **same path and easing** as the old one and only appear late (opacity 0 until 38 % of the transition). Otherwise both copies are visible at different positions halfway through.
- Formulas in text never break across lines: `.enunciat .katex, .fila.text .katex, .text-pas .katex, .avis .katex { white-space: nowrap }` (David: «an equation of a plane split over two lines must never happen»). Exception: on phones (≤ 520 px) the step caption may break a long formula at `=` (`.text-pas .katex {white-space: normal}`), otherwise the whole page scrolls sideways; the browser tests at 375 px caught it.
- Screenshots for review: take them of the **viewport** (`fullPage: false`). A full-page screenshot resizes the window, the height fit runs again and the board's own scroll is lost, so the last rows look missing when they are not.

## 5. How a procedure is written (pattern to copy)

```js
(function (arrel) {               // «arrel» = globalThis: never reuse this name inside
  'use strict';
  const M = arrel.Mates, F = arrel.Formules, Dd = arrel.Dades;   // + Matrius/Geometria/Grafiques
  const FILA = Object.freeze({dades: 0, grafica: 1, …});      // named row indices
  function valida(v) { … return null | 'Frase en català.'; }
  function passos(v) {
    const g = F.guio(N);
    g.files[FILA.dades] = …keyed TeX…;  g.afegeix('Caption amb $TeX$.');
    // shared multi-step helpers append their own steps:
    const sols = F.resolPolinomi(g, FILA.equacio, 'e', termes, 'Resolem…');
    …
    return g.passos;
  }
  arrel.NomProcediment = Object.freeze({titol, categoria, files: N, perDefecte, exemples, editor, valida,
                                       llegeixAdreca, escriuAdreca, enunciat, resum, passos, FILA});
})(globalThis);
```

Shared multi-step builders you should reach for before writing new code: `Formules.resolPolinomi` (degree ≤ 2 equation), `Matrius.passosArrels` (degree ≤ 3 with Ruffini), `Matrius.passosSarrus`, `Formules.passosIntegral`, `Formules.substituit/avaluat/resultat` (evaluate a polynomial at a point), `Geometria.passosProducteVectorial`, `passosReduccio2`, `passosPuntGenericAlPla`, `passosPlaDeterminant`, `Formules.marcat` (compact keyed notation for hand-written scripts), `Dades.problemesFixos`, `Dades.campsFuncio/campsPolinomi`.

Naming trap: every IIFE receives `globalThis` as the parameter `arrel` (Catalan for *root*, which is also «square root»). Never name a helper `arrel`: it shadowed the parameter and broke `geometria.js`; the square-root helper is `arrelQuadrada`.

## 6. Testing philosophy (why there are no bugs in 14 M checks)

1. **Independent model.** Each section of `comprova.js` recomputes the answer by a *different* method from the procedure (determinant by Laplace vs Sarrus on screen; rank by Gauss vs minors; inverse by Gauss–Jordan vs adjoints; two lines by u×v and det(PQ,u,v) vs generic points). Never import the procedure's own helpers to compute the expected value.
2. **Every displayed line is parsed and checked.** `textPla(tex)` converts keyed TeX to plain text (it knows `\dfrac`, `\begin{array}`, `\iff`, `\underset`, `\xrightarrow`, `|…|`, roots…); `Mates.llegeix` parses it; exact `Fraccio` arithmetic evaluates it. Identities in x are checked at enough points to be a proof for the degree involved (4 points for degree ≤ 3; π treated as indeterminate by checking at 3 and 22/7; radicals by an exact `q·√r` evaluator `valorRadical`). Equation rows must have exactly the right solution set.
3. **Structural lint** `comprovaGuio`: unique valid keys, `fusiona`/`reanomena`/`cursor` refer to keys present in the right state.
4. **Big grids**: all examples + thousands of seeded random cases, built to cover every branch (e.g. ~400 cases for each of the 4 relative positions of two lines). Address round trip `escriuAdreca → llegeixAdreca` for every case.
5. **Mutation testing** (`proves/mutacions/muta-*.py`): each script injects 6–18 realistic bugs one at a time into a temp copy and requires the checker to fail. If a mutation survives, the checker is too weak — strengthen it before shipping. Run: `python3 procediments/proves/mutacions/muta-barrow.py` → `6/6`.
6. **Browser tests** (`proves/navegador/prova-*.js`, Playwright + local HTTP server; KaTeX from a local `katex/dist`): every animated step ends on exactly the expected DOM, phone width without overflow, addresses, editor arrows, examples, console clean. Run: `node procediments/proves/navegador/prova-barrow.js . <path>/katex/dist /tmp/shots`. In the Claude cloud sandbox: `require('playwright')` works and KaTeX is at `/opt/npm-tools/node_modules/katex/dist` (else `npm i katex@0.16.9`).
7. Section filter while iterating: `node procediments/proves/comprova.js Barrow` (substring of section name). Full run before every delivery.

Checker parsing gotchas: `\text{a}` reads as «a»; new LaTeX commands in a procedure need support in `textPla` (prefer `\iff` which it knows over `\Leftrightarrow`); `grupsAmbClau` must skip escaped braces (`\left\{`); `Fraccio.de(s, 1000)` ignores its 2nd argument (use `new Fraccio(s, 1000)`); `Fraccio.de(f)` on a Fraccio is fine, `fr(f)` was not.

## 7. Playbook: turning David's comments into changes

David writes short comments in Catalan, often from his phone, sometimes with a screenshot: «vull que això ho canviïs d'aquesta manera». Protocol:

**Step 1 — Classify the request (decides the layer):**

| David says (examples) | Layer / file | Typical change |
|---|---|---|
| «massa ràpid / lent», «que s'aturi més» | `motor.js` `TEMPS` | one constant; affects all pages |
| «aquest color», «la lletra és petita», «el dibuix és petit al mòbil» | `estil.css` (tokens, `.fila.figura`, marks) or `MIDA` in `motor.js` | CSS only |
| «a totes les pàgines…» (buttons, player, header, editor behaviour) | `motor.js` | engine; rerun **all** browser tests |
| «aquest pas sobra / fes-lo en dos / canvia l'ordre» | the procedure's `passos` | move/split `g.afegeix`; keep keys consistent |
| «no posis parèntesis», «escriu-ho com …» (notation used by several pages) | the shared writer in `formules.js` / `matrius.js` / `geometria.js` | check every caller (grep) |
| «el text del pas diu…» | caption string in the procedure | Catalan; captions are not truth-checked unless they state a value — some are (e.g. final answers), see the section |
| «afegeix un exemple», «aquest exemple no m'agrada» | `exemples` array (editor) or the problem data object (fixed problems) | checker picks examples up automatically in most sections |
| «vull un procediment nou de …» | new `nom.js` + `nom.html` + checker section + mutations + browser test + `DEMOS` + docs (README §6) | propose the plan and the order first, wait for «endavant» |
| «una variant d'aquest» (e.g. normal line inside tangent) | `modes` in the same procedure, not a new page | David asked for this explicitly once |
| «enllaça-ho / afegeix-ho al menú» | `DEMOS` in `../index.html` | `prova-index-demo.js` |
| «al mòbil se superposa / surt de la pantalla» | `enLinies`/`ampleTex`, row split, or engine ghosts | reproduce at 375 and 330 px with Playwright first |

**Step 2 — Locate fast.** `grep -n` the visible Catalan text (captions and labels are literal in the procedure file), or the TeX fragment, or the key. Each procedure exports `FILA` with named rows. The README table §1 says which helper owns which notation.

**Step 3 — Change at the right level, minimally.** If the same improvement would help another procedure, put it in the shared layer and make both use it (DRY is a stated principle). Don't add options nobody asked for.

**Step 4 — Keep truth and keys valid.** If the change alters what a row *means* (a new kind of line, a new LaTeX command), update the checker section in the same go. If it alters keys, run the section: the lint will tell you what broke.

**Step 5 — Verify in this order:** section filter → mutation script of that procedure → its browser test (and `prova-partides.js` if text rows/marks changed) → full checker → look at a screenshot at phone width yourself.

**Step 6 — Show and deliver:** build a preview artifact with `proves/eines/empaqueta.py` (inlines the page's local scripts and KaTeX CSS/fonts; set `LC_ALL=C.UTF-8` for accented titles) and publish it; give David a ZIP with **only the changed files** (or the whole folder if many), root = repo root.

If the request is ambiguous *and* expensive (a new procedure, a change in all pages), ask one short question with 2–3 concrete options. If cheap, do the most reasonable reading and say which one you took.

## 8. Working with David (process lessons)

- Talk Catalan; docs for AIs in English. He is a mathematician: be precise, no hand-waving; he notices pedagogy issues more than code issues.
- He prefers to **confirm a plan** (list of procedures, order, method) before a category is built, then says «endavant»/«tot bé». Then build the whole list without stopping, delivering by stages.
- **Never** connect to the repo (no `add_repo`, no push). Deliver ZIPs. He uploads the **ZIP itself** to `_uploads/` (GitHub web → *Add file* → *Upload files*); the workflow `unzip-upload.yml` extracts it at the root, commits and deletes the ZIP. Do not tell him to extract it (that mistake was made once). Paths inside the ZIP start at the repo root.
- Commit messages: Catalan, never `[skip ci]`, `[ci skip]`, `[cf-pages-skip]`.
- He has a limited token quota and sometimes warns («estàs al 98%»): deliver cumulative save-point ZIPs often, keep a handoff note, keep messages short. When he says «dona'm el zip ARA», send the ZIP immediately and report pending checks afterwards.
- To verify his repo state he sends a ZIP of `main`: diff it against your working copy (`diff -rq`) and check `_uploads/` is empty (a ZIP still there = workflow not run yet → *Actions* tab).
- Student-facing text must be correct Catalan (accents, apostrophes `d’una` in titles, decimal comma).
- **Deliver before the tests finish** (David, Oct 2026: «dona'm els arxius inclús abans d'haver superat tots els tests i continua fent els tests en background»): once the section checks pass, send the ZIP, then run the full checker, mutations and browser tests in the background and report the result (and a follow-up ZIP if something fails).
- When he gives a rule («mai Cramer», «mai comprovacions», «sempre Sarrus»), apply it to **every** page at once, not only to the one in his screenshot, and write it in §3.

## 8b. Default answers (do not ask David these)

A cold-start session tends to ask the same questions before starting. The answers:

1. **"Is the ZIP you sent the current `main`?"** Assume yes. To be safe anyway, deliver **only the files you changed**, never the whole repo, so a stale base cannot overwrite his later work. If the change touches a file he may have edited since (rare: he does not edit code), say so in the delivery message.
2. **"One page or all pages?"** Not a binary. Three levels:
   - look/behaviour of the page frame (speed, colours, font size, player, buttons, editor) → shared (`estil.css`, `TEMPS`/`MIDA`, `motor.js`): all 30 pages change;
   - **notation produced by a shared writer** (how a polynomial, a fraction, an integral, a matrix, a Sarrus product, a root is written) → the shared writer, so every page using it stays consistent — grep its callers and look at each one;
   - content of one procedure (a step, a caption, the order, an example, a sketch choice) → only that page.
   If a request about one page would be better as a shared change, do the shared change and say so in one line.
3. **"Does DEMO include the menu in `index.html`?"** Yes: the `DEMOS` object, the button and the dialog are part of it. The rest of `index.html` (`EXERS`, PDFs) is the exercise system — out of scope unless asked.
4. **"What if a request breaks strict truth?"** Do not ask first: implement the closest *true* version that gives the same pedagogical effect — the question goes in the caption, or the unknown gets a name on the board (`I = \int_0^2 …` first, `I = 4` later); an approximation is written with `≈` beside the exact value. If the checker does not understand the new form, extend `textPla` / that section; never weaken or skip a check. Explain the choice in one line. Ask only if no true version exists.
5. **Stale docs you notice** (README paragraphs, counts): just fix them in the same delivery; the house rule says docs follow the code.

## 9. Known limits / ideas not done

- Polynomials up to degree 3 with small integer coefficients; irrational roots are rejected rather than shown with radicals (except distances, which have exact `c·√m`).
- The PAU trapezium optimisation model was skipped (optimum 5√2, needs radicals in the optimisation pipeline).
- Graphs are pictures (not checked) and only for polynomials.
- No dark mode (the site has none).
