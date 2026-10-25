# procediments/ — animated step-by-step procedures

Small pages, inside the PAU site, that show a mechanical procedure (for now, from the *Anàlisi* block: the equation of the tangent line, and relative maxima and minima) as an animation in the style of Graspable Math. The student watches symbols move, merge and change, one step at a time, with a short explanation for each step. The data (the function, the point…) can be changed with arrows or through the address.

Principles: keep it simple, step by step, smooth, and **every line shown is a true equality** (checked automatically, see §7).

Student-facing text is Catalan; code comments are Catalan; this file is English.

## 1. Files and layers

| File | Layer | DOM? | Role |
|---|---|---|---|
| `mates.js` | maths | no | Exact rationals (`Fraccio`), expression parser (`llegeix`), polynomials, TeX/plain writers. Global `Mates`. |
| `formules.js` | formulas | no | TeX writers whose symbols carry **keys** (§4), the step-by-step equation solver `resolPolinomi` (§4.1), and `guio()`, the step-list builder. Global `Formules`. |
| `dades.js` | data | no | What the Anàlisi procedures share about `f(x) = a3·x³ + a2·x² + a1·x + a0`: editor row, validation, reading `f` from the address, derivative captions. Global `Dades`. |
| `recta-tangent.js` | procedure | no | Tangent line (§3). Global `RectaTangent`. Page `recta-tangent.html?f=2x^2-3x+1&x0=2`. |
| `extrems.js` | procedure | no | Relative maxima and minima: critical points, then the second derivative. Global `Extrems`. Page `extrems.html?f=x^3-3x^2+1`. |
| `motor.js` | engine | yes | Builds the page, reads the address, renders steps with KaTeX, animates transitions, player and editor. Global `Motor`. |
| `estil.css` | style | — | Shared look (site palette; category colour from `body[data-categoria]`). |
| `recta-tangent.html`, `extrems.html` | pages | — | Load the above and call `Motor.inicia(<Procedure>)`. |
| `proves/comprova.js` | tests | no | `node procediments/proves/comprova.js` (§7). |

Dependency order: `katex` → `mates.js` → `formules.js` → `dades.js` → `motor.js` and the procedure file. Plain classic scripts (no modules, no build step); each file is an IIFE that sets one frozen global on `globalThis`, so pages work from any static host and the pure files also load in Node.

A change of look goes to `estil.css`; of timing, to `TEMPS` in `motor.js`; of behaviour, to `motor.js`. All procedures follow.

## 2. Page contract

```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css">
<link rel="stylesheet" href="estil.css">
…
<div id="procediment"><noscript>…</noscript></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js"></script>
<script src="mates.js"></script>
<script src="formules.js"></script>
<script src="dades.js"></script>
<script src="motor.js"></script>
<script src="recta-tangent.js"></script>
<script>const procediment = Motor.inicia(RectaTangent);</script>
```

`Motor.inicia(proc[, container])` fills the container (default `#procediment`) with header, board, player, step text, data editor and footer, and returns a frozen controller `{carrega(valors), salta(i), seguent(), pas, total, ocupat, valors}` (handy in the console and in browser tests). If KaTeX did not load it shows a message and returns `null`.

## 3. Procedure definition

A procedure is a frozen object:

| Field | Meaning |
|---|---|
| `titol` | Page title (`h1`). |
| `categoria` | `algebra`, `geometria`, `analisi` or `probabilitat` (colour and breadcrumb). |
| `files` | Number of board rows. |
| `perDefecte` | Default data, e.g. `{a3: 0, a2: 2, a1: -3, a0: 1, x0: 2}`. |
| `exemples` | Data sets offered as chips. |
| `titolEditor`, `notaEditor` | Editor heading and an extra sentence for its note. |
| `editor` | Rows `{etiqueta: TeX, camps: [{id, sufix: TeX, nom, min, max, signe: 'sempre' \| 'negatiu', atenua0}]}`. Every field is an integer with ↑/↓ arrows; `signe: 'sempre'` shows `+2`; `atenua0` fades the term when it is 0. |
| `valida(v)` | `null`, or a Catalan error sentence. |
| `llegeixAdreca(p)` | Address parameters (decoded strings) → `{valors}` or `{error}`. |
| `escriuAdreca(v)` | Data → address parameters (strings). |
| `enunciat(v)`, `resum(v)` | Statement (text with `$TeX$`) and one-line TeX summary. |
| `passos(v)` | The step list (§4). |

Only `passos` and `resum` are mandatory for the engine; the rest have fallbacks or are optional.

### Address format (recta tangent)

`recta-tangent.html?f=2x^2-3x+1&x0=2`

- `f` is written as a student would write it: `x^3-3x+1`, `x(x-5)`, `(x-1)^3`, `2x²−3x+1`, `0,5x`… It must be a polynomial of degree ≤ 3 with integer coefficients between −9 and 9 that depends on x. `x0` is an integer between −5 and 5. A missing parameter takes its default.
- The engine reads the query string itself: a literal `+` means plus (with `URLSearchParams` it would become a space). `%2B` also works.
- If the address is wrong, the page explains why (in Catalan) and shows the default example.
- When the student changes the data, the address is rewritten with `history.replaceState`, so it can be copied and shared.

## 4. Steps and keys

`passos(v)` returns an array of frozen steps:

```js
{
  files: ['TeX of row 0', 'TeX of row 1'],     // '' = empty row
  classes: ['', ''],                           // CSS class per row ('final' = highlighted answer)
  text: 'Explanation with $TeX$.',
  cursor:    {clic: 'k'} | {arrossega: 'k', fins: 'k2'},   // optional
  reanomena: {newKey: 'oldKey'},               // optional
  fusiona:   {newKey: ['oldKey', …]},          // optional
}
```

Build it with `Formules.guio(nFiles)`: set `g.files[i]` / `g.classes[i]`, call `g.afegeix(text, options)`, return `g.passos`. A step identical to the previous one (same TeX, same classes) is skipped, so optional steps («Calcula cada terme») need no special case. `g.completa(text)` appends a sentence to the last step when the board must not change (e.g. «l'equació no té solucions»).

### Keys

Every symbol that must be followed from one step to the next is written as `\htmlData{k=<key>}{<symbol>}` (helpers `Formules.clau`, `op` for binary operators, `rel` for `=`). A key matches `/^[A-Za-z][A-Za-z0-9]*$/` and is unique within a step (all rows together).

Polynomial helpers use a one-letter prefix `P` and the degree `n` of the term:

| Key | Symbol | Key | Symbol |
|---|---|---|---|
| `Psn` | sign | `Pcn` | coefficient (absolute value) |
| `Pvn` | x, or the value that replaces it | `Pen` | exponent |
| `Pmn` | multiplication dot | `Ptn` | value of a computed term |
| `PR` | value of the whole expression | `PA`, `PB`, `PQ` | `(`, `)` and `'` of `(…)'` |
| `PEn` | new exponent when deriving | | |

`membreEsquerre(L, …)` writes `f(x) =` with prefix `L`: `LF` name, `LP` prime, `La`/`Lb` parentheses, `LX` argument, `Lq` `=`. Use different letters for `L` and `P`. The tangent equation (row 0) uses keys `T…`, documented at the top of `recta-tangent.js`.

### 4.1 Solving «polynomial = 0»

`Formules.resolPolinomi(g, row, P, terms, firstText, firstOptions)` adds the steps that solve `terms = 0` (degree ≤ 2, integer coefficients, rational roots) on one row, the way it is taught: divide by a common factor (and make the leading coefficient positive); degree 1: move the constant, divide; `Ax² + Bx = 0`: take out `x`, split the product, solve the linear factor; `Ax² + C = 0`: `x² = k`, `x = ±√k`; otherwise the quadratic formula (substituted, discriminant, square root, split `±`). No real solution: the last caption says why. It returns the solutions in ascending order as `[{valor, clau}]`, where `clau` is the key of the number on the last row (to drag it elsewhere). `Mates.arrelsRacionals(terms)` tells beforehand whether the roots are rational (procedures reject irrational cases in `valida`).

### Transition semantics (`motor.js`, `creaPissarra`)

From step A to step B:

1. **Same key** in A and B (or `reanomena: {new: old}`): the same symbol. It moves to its new place (and size); if its content changes, the old one cross-fades into the new one.
2. **`fusiona: {new: [old…]}`**: the old symbols fly into the new one, which pops in.
3. Other old symbols fade out; other new symbols fade in. Unkeyed parts of the rows cross-fade.
4. **Cursor**: `{clic: k}` clicks the old symbol `k` before anything moves; `{arrossega: k, fins: k2}` grabs `k` and drags it to the new symbol `k2` (default: its pair or fusion target), with a box that follows it.
5. **Anticipation boxes**: in steps without a drag, light-blue boxes first mark every symbol that will change or vanish (symbols merging into the same target share one box), then follow them to their new place. Steps with boxes last longer (`TEMPS.pasAmbAvis`).

Positions are measured on the real KaTeX output, so any TeX layout works. Rules that keep the animation meaningful (all checked by the tests): a renamed new key is not in A and its old key is not in B; a fusion source is in A and not in B and merges only once; cursor keys exist (`clic`, `arrossega` in A; `fins` in B); the first step animates nothing.

## 5. Engine features

- Player: restart, previous, play/pause, next; one dot per step (jump); speed (slow/normal/fast); keyboard Space (play/pause, except on a focused button), ← and →.
- Board font: largest size (30 px, 22 px on phones) at which the longest line of the whole procedure fits; refitted when the width changes or the fonts finish loading.
- Editor: ↑/↓ under each number, hold to repeat (stops at the limit); `valida` messages; regenerates the steps 350 ms after the last change and rewrites the address.
- `prefers-reduced-motion`: every duration × 0.35.
- Accessibility: buttons have Catalan labels; the step text is an `aria-live` region; KaTeX also outputs MathML; editor values are `spinbutton`s (arrow keys).

## 6. Adding a procedure

1. Create `nom.js` (copy the structure of `recta-tangent.js`): data limits, `valida`, address read/write, texts, `passos`, definition object.
2. Reuse `Formules` helpers; add new generic keyed writers to `formules.js` (not to the procedure) when another procedure could use them.
3. Create `nom.html` (copy `recta-tangent.html`; change the title, description and the procedure script/global).
4. Add the procedure to `proves/comprova.js`: address cases, a data grid, the structural lint (`comprovaGuio`) and a truth check for every line.
5. Run the tests; open the page and play every example (desktop and phone width).
6. Update this README and the main `README.md`.

## 7. Tests

```
node procediments/proves/comprova.js
```

No dependencies (Node ≥ 16). It loads the pure files with `vm` and checks:

1. `mates.js` and `formules.js`: fractions, parsing (values and the Catalan error messages), polynomial round trips, both TeX writers.
2. Address of the tangent line: valid cases, every error case, and the round trip `escriuAdreca → llegeixAdreca` for all 130 302 valid functions.
3. Structure of every step list (rules of §4).
4. **Strict truth** of every displayed line, with exact rational arithmetic: each row is converted from TeX to plain text, parsed and evaluated with the true `f`, `f'` and `f''`. Identities are checked at 4 points, which proves them for polynomials of degree ≤ 3; `(…)'` is evaluated with the five-point formula, exact up to degree 4.
   - Tangent line: lines with `y` must hold on the tangent line and fail off it; the final line must be `y = …` without `f`.
   - `resolPolinomi`, for every `ax² + bx + c = 0` with coefficients in −6…6 and rational roots: every row must have exactly the same solutions as the equation (`o` = union, `±` = both values, an equation row = its own roots).
   - Extrema: rows 0–1 are identities (a final `< 0` / `> 0` is checked) or equations with exactly the critical points as solutions; rows 2–3 are a critical point `x = a`, or a conclusion checked with `f'(a) = 0`, `f(a)` and the sign of `f''(a)` (`f''(a) = 0` only for a cubic, where `f''' ≠ 0` proves it is neither); the last step has one conclusion per critical point. `valida` must reject exactly the irrational cases.

Grids: 10 052 tangent-line data sets, 1 344 equations and about 4 700 valid functions for extrema (dense, extremes and a fixed pseudo-random sample). The run takes about 20 s and ends with `Tot correcte: … comprovacions` (exit code 0) or the first errors (exit code 1).
