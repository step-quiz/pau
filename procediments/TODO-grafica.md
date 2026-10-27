# TODO — new page «Gràfica d'una funció» (handoff, 27 Oct 2026)

> For the next Claude session. Nothing of this page is coded yet: this file is the agreed design. Read `INSIGHTS.md` first.
> David speaks Catalan; docs for AIs in English. Deliver ZIPs (never push), commit messages without `[skip ci]`.

## 1. David's request (verbatim content)

Category «Anàlisi», new DEMO «Gràfica d'una funció». Statement, always:
«Elabora un esbós de la gràfica de la funció $f(x) = …$, justificant-ho tot.»
(For the trig example add «, per a $0 \le x \le 2\pi$,» before «justificant-ho tot».)

Seven sections, in this order (headings on the board, his words):
1. Domini i possibles asímptotes verticals
2. Límits en l'infinit i possibles asímptotes horitzontals i asímptotes obliqües
3. Punt de tall amb l'eix d'ordenades Q(0, …). Punts de tall amb l'eix d'abscisses P₁(…, 0), P₂(…, 0)…
4. Creixement, decreixement, extrems relatius
5. Concavitat positiva o concavitat negativa, punts d'inflexió
6. Taula de valors (must include the relative extrema, the inflection points and **two more points**, besides the axis intercepts)
7. Gràfica de la funció

Four function types: polynomial, rational, with radicals, other (exponential, logarithm, trigonometric…).

## 2. Decisions David took (AskUserQuestion, 27/10/2026)

- **Examples: these 12, 3 per type** (fixed problems, `?p=<id>` chips):
  - Polynomial: `x^3 - 6x^2 + 9x`; `x^3 - 3x` (intercepts ±√3); `x^4 - 4x^3` (critical point that is not an extremum, two inflections).
  - Rational: `(x^2 - 2x)/(x - 1)` (PAU 2025: vertical + oblique); `5x/(x^2 + 1)` (PAU 2026: horizontal, inflections at ±√3); `x^2/(x^2 - 4)` (two verticals, one horizontal).
  - Radicals: `√(1 + x^3)` (PAU 2025, Dom [−1, +∞)); `x·√(x + 3)` (minimum, always concave up); `√(x^2 - 4)` (two different oblique asymptotes).
  - Other: `x·e^{−x}`; `2·ln x / x` (PAU 2024); `sin x + cos x`, 0 ≤ x ≤ 2π.
- **Board: «Tot a la vista»** — nothing is erased; every section stays; the board is long and scrolls.
- **No editor for now** (maybe later for polynomials/rationals; make the rational engine general so it can be added).

## 3. Design (agreed in my head, not yet confirmed in detail by David — reasonable defaults)

Files: `procediments/grafica-funcio.js` (global `GraficaFuncio`) + `grafica-funcio.html`; add `['grafica-funcio', 'Gràfica d’una funció']` to `DEMOS.analisi` in `../index.html` (after `asimptotes`). Add it to: `comprova.js` (new section + the lists in «regles generals» and the KaTeX section), `frases/genera-editor-frases.js` (FITXERS + GLOBALS), a browser test `proves/navegador/prova-grafica.js` (copy `prova-asimptotes.js`), a mutation script `proves/mutacions/muta-grafica.py`, README (§1 table, address), INSIGHTS §0 counts.

Board layout:
- Row 0: `f(x) = …`. Each section starts with a **text row heading** (`§1. Domini i possibles asímptotes verticals`) with a new row class `apartat` (estil.css: bold, `var(--cat)`, a thin top rule, some top margin). Text rows don't take part in the font fit.
- Rows are allocated sequentially by a counter (set `files` to ~60; unused rows are hidden by the engine).
- **Engine option needed:** `proc.pissarraCreix = true` → in `motor.js` `dibuixaCapa`, empty rows *after the last non-empty row of the step* are hidden, so the board grows downwards like a blackboard (today rows used later keep their space from step 1). `fesVisible` already scrolls to the lowest changed row. Opt-in: other pages unchanged.
- Equalities accumulate («tot a la vista»): `f'(x) = A = B = C` as an `array{rl}` (one `= …` per line, appended step by step); limit chains `lim … = lim … = +∞` on one line wrapped with `F.enLinies`. Equations keep the house convention (`F.resolEquacio` / `Mt.passosArrels`: the equation stays on its row, the work row below transforms; solutions lilac; outside the domain crossed out in red).
- Sign-test computations (f'(t) > 0 …) are kept as a list in their own row (not erased). Values of f at extrema / inflections / extra points: a list row «f(1) = … = 4».
- Conclusion rows (class `destacat`): «Dom f = ℝ − {1}», «Asímptota vertical: x = 1» / «No hi ha asímptotes verticals», «Asímptota obliqua: y = x − 1» (full words, never AV/AH/AO), «Q(0, 0)», «P₁(0, 0), P₂(2, 0)» (points without «=»), «Creixent: … Decreixent: …», «Màxim relatiu en (1, 4)», «Concavitat positiva (∪): … Concavitat negativa (∩): …», «Punt d'inflexió en (2, 2)».
- Sign tables like `creixement.js` (intervals in the header, `x = a` columns, `0` / `∄`, ↗ ↘, `\text{màxim}`/`\text{mínim}`), and a second table for f'' with ∪ / ∩ and `\text{inflexió}`. Intervals written `(a,\ b)` as in creixement.
- Table of values: `x | f(x)` with intercepts, extrema, inflections + 2 extra points (one left of the first notable point and one right of the last, inside the domain; per-problem choice for bounded domains). Irrational values exact with `≈` two decimals (`\dfrac{1}{e} \approx 0{,}37`).
- Graph: new `Grafiques.esbos({f (float), trams (domain pieces), finestra {x, y}, asimptotes [{v x}|{h y}|{o m n}] dashed, punts [{x, y}] dots})`, ≥ 400 px wide, curve broken at vertical asymptotes and clipped to the window; π labels for the trig example.

Engine for the 6 polynomial/rational problems: computed with exact arithmetic (reuse `asimptotes.js` limit logic — `limitInfinit`, `passosInfinit` — and `creixement.js` quotient-rule steps; consider moving those helpers to a shared module and making both pages use it, checking that their steps stay identical, e.g. by diffing `frases.json`). f'' of P/Q: `(N'·Q² − N·2Q·Q')/Q⁴` → take out factor `Q` → `(N'·Q − 2N·Q')/Q³` → expand → group → factor. Needs:
- `Mt.passosArrels` extended to degree 4 when there is a common factor `x^j` (x⁴ − 4x³ = x³·(x − 4)).
- `F.resolPolinomi` option `irracionals` for `A·x² + C = 0` with non-square `k`: `x = ±√k` (simplified), returning radical values; only pure square roots are needed (±√3 in two examples).
- A small exact radical type `a + b√r` in the page to evaluate f(±√3) (R2: f(√3) = 5√3/4 ≈ 2,17).

Engine for the 6 radical/other problems: per-problem scripts (like `polinomi-condicions.js`) that call the same section builders with hand-written TeX chains and captions, plus a float `f` for the graph. Derivatives by the rules, L'Hôpital where needed (x·e^{−x} at +∞, 2 ln x / x at +∞), conjugate for √(x² − 4) − x.

Worked maths (verified by hand; the checker must re-verify):
- `x^3-6x^2+9x`: Dom ℝ, no asymptotes (m = lim x² = +∞); Q(0,0), P(0,0), P(3,0) (double); f' = 3x²−12x+9 → x = 1, 3: max (1, 4), min (3, 0); f'' = 6x−12 → inflection (2, 2); extra points x = −1 (−16), x = 4 (4).
- `x^3-3x`: zeros 0, ±√3; max (−1, 2), min (1, −2); inflection (0, 0).
- `x^4-4x^3`: zeros 0, 4; f' = 4x²(x−3): min (3, −27), x = 0 critical without extremum; f'' = 12x(x−2): inflections (0, 0), (2, −16).
- `(x^2-2x)/(x-1)`: AV x = 1 (lim 1⁻ = +∞, 1⁺ = −∞); AO y = x − 1; zeros 0, 2; f' = (x²−2x+2)/(x−1)² > 0 (no extrema); f'' = −2/(x−1)³: ∪ on (−∞,1), ∩ on (1,+∞), no inflection.
- `5x/(x^2+1)`: AH y = 0; zero 0; f' = 5(1−x²)/(x²+1)²: min (−1, −5/2), max (1, 5/2); f'' = 10x(x²−3)/(x²+1)³: inflections (0,0), (±√3, ±5√3/4).
- `x^2/(x^2-4)`: AV x = ±2, AH y = 1; zero 0; f' = −8x/(x²−4)²: max (0, 0); f'' = 8(3x²+4)/(x²−4)³: ∪ outside (−2, 2), ∩ inside, no inflection.
- `√(1+x^3)`: Dom [−1, +∞); no asymptotes (m = lim √((1+x³)/x²) = +∞); Q(0,1), P(−1,0); f' = 3x²/(2√(1+x³)) ≥ 0, x = 0 not an extremum; f'' = 3x(x³+4)/(4(1+x³)√(1+x³)): x = −∛4 ∉ Dom (crossed), ∩ on (−1,0), ∪ on (0,+∞), inflection (0, 1); extra x = 1 (√2), x = 2 (3).
- `x√(x+3)`: Dom [−3, +∞); zeros −3, 0; f' = (3x+6)/(2√(x+3)): min (−2, −2); f'' = (3x+12)/(4(x+3)√(x+3)) > 0, x = −4 ∉ Dom; extra x = −1 (−√2), x = 1 (2).
- `√(x^2-4)`: Dom (−∞,−2] ∪ [2,+∞); AO y = x at +∞ (m = 1, n = lim −4/(√(x²−4)+x) = 0), y = −x at −∞; zeros ±2, no Q; f' = x/√(x²−4), x = 0 ∉ Dom: decreasing on (−∞,−2), increasing on (2,+∞); f'' = −4/((x²−4)√(x²−4)) < 0: ∩; extra x = ±3 (√5).
- `x·e^{−x}`: Dom ℝ; AH y = 0 at +∞ (x/eˣ, L'Hôpital); −∞ at −∞, no AO (m = lim e^{−x} = +∞); zero 0; f' = e^{−x}(1−x): max (1, 1/e); f'' = e^{−x}(x−2): inflection (2, 2/e²); extra x = −1 (−e), x = 3 (3/e³).
- `2 ln x / x`: Dom (0, +∞); AV x = 0 (lim 0⁺ = −∞); AH y = 0 at +∞ (L'Hôpital); zero 1; f' = (2 − 2 ln x)/x²: max (e, 2/e); f'' = (4 ln x − 6)/x³: inflection (e^{3/2}, 3/e^{3/2}); extra x = 1/2 (−4 ln 2), x = 10.
- `sin x + cos x` on [0, 2π]: no limits at infinity, no asymptotes; Q(0,1); zeros 3π/4, 7π/4 (tan x = −1; dividing by cos x is fine because cos x = 0 gives sin x = ±1); f' = cos x − sin x → π/4 (max √2), 5π/4 (min −√2); f'' = −(sin x + cos x): inflections at the zeros; extra x = π (−1), x = 2π (1).

## 4. Checker plan (new section in `proves/comprova.js`)

- The page tags every non-empty row with a semantic type in a parallel array on each step (`pas.tipus[i]`: `f`, `domini`, `equacio:Q|f|f1|f2`, `limit`, `asimptota`, `punts`, `derivada1`, `derivada2`, `proves1|2`, `taula1|2`, `conclusio1|2`, `valors`, `taulaValors`, `grafica`, `apartat`; a small wrapper around `F.guio` adds it). The checker fails on any untagged non-empty row; the tags only classify, the truth is checked independently.
- Independent model per problem in the checker: f as a JS expression string (`'x*Math.exp(-x)'`), window, and the hand-derived expectations of §3 (domain, AV with lateral limits, limits at ±∞, AH/AO, zeros, critical points with type, inflections), themselves cross-checked numerically (domain = `isFinite(f(x))`; numeric derivatives; sign changes on a grid).
- Numeric TeX evaluator: extend `textPla` with `\ln`, `\sin`, `\cos`, `\tan`, `\log`, `e`; parse its output (implicit products, `sqrt`, `^`, `π`, postfix `'` = numeric derivative of the parenthesised expression). Identities checked at ~8 points of the domain (relative tolerance ~1e-7; f'' compared with the numeric derivative of the already-verified f' expression). Equation chains: each line's zeros inside the relevant domain equal the expected ones; lilac solutions = expected, crossed ones outside the domain. Limit chains: every `lim` part has the expected limit (evaluate at a ± 1e-3/1e-6 or ±1e3/±1e6); results ±∞ or a number. `≈` decimals correctly rounded. Sign tables and conclusions vs the model. Table of values contains all required points + ≥ 2 more, each y = f(x).
- Mutations to add: wrong sign of a lateral limit, wrong n of the oblique asymptote, a missing critical point, max/min swapped, ∪/∩ swapped, an inflection kept where f'' does not change sign, a wrong table value, a closed bracket where the domain is open.

## 5. Order of work suggested

1. ~~`motor.js` `pissarraCreix` + `.fila.apartat` CSS (and a browser check that other pages are unchanged).~~ **Done 27/10/2026**: `creaPissarra(…, creix)` hides empty rows after the last written one; with `creix` the board's `min-height` is fixed in `ajusta` (`fixaAlcada`) so the player does not move down at every step (found with a prototype: the next button escaped from under the mouse). `.fila.text.apartat` in `estil.css`. README §3 and §5 updated.
2. ~~Builders + the 6 polynomial/rational problems; checker section for them; browser test; ZIP to David (stage 1).~~ **Done 27/10/2026**: `grafica-funcio.js/.html`, `Mates.Radical`, `irracionals` in the solvers, `prefix` in `passosArrels`, `Grafiques.esbos`; checker section «gràfica d'una funció» (own numeric models `MODELS_GRAFICA`, every row read through its tag), `muta-grafica-funcio.py` 14/14, `navegador/prova-grafica-funcio.js`. Lesson: a caption longer than 3 lines at 1366×700 makes the sticky player jump; the derivative steps were split («(…)'» first, with the section heading, then the result) and the lateral-limit captions shortened. Not supported yet (needed for stage 3?): a solution of f = 0 or f' = 0 outside the domain (the builder throws).
3. ~~Radicals (3 scripts) + checker; ZIP (stage 2).~~ **Done 27/10/2026**: `passosRadical` + `guioArrelCubica`, `guioProducteArrel`, `guioArrelObliques` (each `guio.dades` = `sub`, `mig`, `exacte` for the values of f); the sign-table part of `seccioDerivada` became `estudiSignes` (columns per piece of the domain) and sections 6–7 `seccionsFinals` (the 6 earlier problems are unchanged, checked by diffing their steps). Endpoints of the domain are not relative extrema (definition in an open interval). Test values in tables with radicals: substitution `≈` two decimals. Phone: sign tables with 7 columns overflowed at 375 px → row class `desplacable` (engine). Player jump when switching examples (found by the browser test, only after running the previous example): `ajusta` measured the controls while the row of step dots still belonged to the previous example → with `pissarraCreix`, `carrega` now calls `ajusta` again after `reproductor.carrega`, and the space for the caption is always the 3-line reserve.
4. Other types (3 scripts) + checker; ZIP (stage 3).
   Notes for step 4 (27/10/2026, not coded yet; a working copy was started in the scratchpad, discard it): reuse `passosRadical` (rename to a general «guió» path) with a `Simbol` number type ({tex, valor()}: e, e^{3/2}, π/4…) and a local `texNombre` that knows it; `estudiSignes` needs an option `valorsProva` (π/6, π, 3π/2; 1 and e² for the logarithm) and hand-written `prova` results (exact when they are nice: `= 1`, `= \dfrac{2}{e^{6}}`); `seccionsFinals` must accept Simbol extras and pass `marquesX` (π labels). Checker: `textPla` needs `\ln`, `\sin`, `\cos`, `\tan`, and the parser needs parentheses (`lnx`, `sinx`, `4xlnx` do not parse: write `\ln(x)`-style output in textPla, i.e. wrap the argument, or write the TeX with parentheses); one-sided horizontal asymptotes («a +∞»), a vertical asymptote at an open end of the domain (x = 0 for 2 ln x / x), no limits at ±∞ when the domain is bounded (trig), skip the «domain = where f exists» model check for the trig example (domain given by the statement). Then frases artifact regenerated (it picks up the new page via `genera-editor-frases.js`).
