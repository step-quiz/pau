# Graspable formulae — the step-by-step symbolic-manipulation engine

**Audience: an AI that has to build animated step-by-step procedures for a new subject** (ESO
maths, 1r Batxillerat maths, maths for social sciences, physics, chemistry, the morpho-syntactic
analysis of a sentence…), starting from the engine built for the PAU maths site (2n Batxillerat).
Read this file first, then `INSIGHTS.md` (lessons learned) and `README.md` (full reference) in the
same folder. Talk to the user (David, a maths teacher in Catalonia) in Catalan; everything the
student sees is Catalan; documents for AIs are English.

---

## 1. The one idea

> **A procedure is a pure function `data → list of board states`. The engine animates the
> difference between two consecutive states, using *keys* as the identity of each symbol.**

- A **board state** is N rows. A row is TeX (rendered by KaTeX), a text paragraph, or an SVG
  sketch. Every symbol that must be *followed* from one step to the next is wrapped
  `\htmlData{k=KEY}{…}`.
- Going from state A to state B, the engine finds every key in both, measures where KaTeX drew it,
  and moves it there. Same key → the symbol travels (and cross-fades if its content changed);
  several old keys declared as merging into a new one → they fly into it; unmatched → fade out /
  fade in. Nothing is positioned by hand: positions are measured on the real KaTeX DOM, so any
  TeX layout (fractions, matrices, arrays, `\underbrace`, tables) animates.
- So **the author never programs animation**. The author writes, like a teacher at the
  blackboard, *what the board looks like after each step* plus one short caption, and chooses
  keys well. With this, 30 procedures were written in a few days with one engine.

This is the style of Graspable Math (symbols move and merge), applied to fixed, teacher-designed
procedures rather than free manipulation.

## 2. What is generic and what is maths-specific

| File | Reusable as is? | What it is |
|---|---|---|
| `motor.js` | **yes** (engine) | The only file that touches the DOM: page layout, the board, the transitions (ghosts, merges, anticipation boxes, simulated cursor), the player (play/pause/next/previous/dots/speed/keyboard), the data editor (integer fields with arrows), the address (`?f=…`) read/write, font and height fitting, board scroll. Global `Motor`. |
| `estil.css` | **yes** (+ new category colours) | The whole look. Category colour through `body[data-categoria]` (`--cat`, `--cat-fons`), marks (`.katex [data-marca="…"]`, `.marca-…` for text phrases), rows (`.fila`, `.final`, `.separat`, `.destacat`, `.text`, `.figura`). |
| `formules.js` | **mostly** | Generic: keys (`clau`, `op`, `rel`, `marca`), compact keyed notation (`marcat`), text rows with keyed phrases (`filaText`, `frase`, `enunciatMarcat`), line wrapping (`ampleTex`, `enLinies`), the step builder (`guio`). Maths-specific: polynomial writers, derivatives, integrals, the equation solvers (`resolPolinomi`, `resolEquacio`). |
| `mates.js` | yes for any numeric subject | Exact rationals `Fraccio` (never floats on the board), an expression parser `llegeix` (accepts what a student types: `2x^2-3x+1`, `x(x-5)`, `0,5x`, `2x²`), polynomials, TeX/plain writers (`texNombre`, decimal comma). |
| `dades.js` | yes | Data helpers: fixed problems chosen by chips (`problemesFixos`), editor fields (`camp`, `campsFuncio`), articles («el», «l'»). |
| `matrius.js`, `geometria.js`, `grafiques.js`, `arbres.js`, `integrals.js` | domain | Matrices/Sarrus/Gauss/roots; 3-D geometry and sketches; function graphs (SVG); probability trees; integral wrappers. Copy only if the new subject needs them. |
| one `.js` + one `.html` per procedure | template | The procedure itself (pure logic, no DOM) and a tiny page that loads the scripts and calls `Motor.inicia(Procediment)`. |
| `proves/comprova.js` | pattern | The truth checker (§8): every line of every step of thousands of cases is parsed and checked against an independent model. |
| `proves/mutacions/`, `proves/navegador/` | pattern | Mutation tests and Playwright browser tests. |

Plain classic scripts, no build step, no modules: each file is an IIFE that sets **one frozen
global** on `globalThis`. Pages work from any static host (Cloudflare Pages) and from `file://`,
and the pure files load in Node (`vm.runInThisContext`) for the tests. Only external dependency:
KaTeX 0.16.9 from cdnjs. Keep it that way.

## 3. A step

`passos(valors)` returns an array of frozen steps:

```js
{
  files:   ['TeX of row 0', '§Text row', '<svg …>', ''],   // '' = empty row
  classes: ['', '', '', 'final'],                           // CSS class per row
  text:    'Short caption with $TeX$.',                     // what is done and why
  reanomena: {newKey: 'oldKey'},       // optional: same symbol, new key
  fusiona:   {newKey: ['old1', 'old2']},// optional: old symbols fly into the new one
  cursor:    {clic: 'k'} | {arrossega: 'k', fins: 'k2'},   // optional simulated hand
}
```

Build it with the **script builder**, never by hand:

```js
const g = F.guio(N);                  // N rows
g.files[FILA.equacio] = …keyed TeX…;  // change the board
g.afegeix('Caption.', {fusiona: {…}}); // freeze a step (skipped if the board did not change)
g.completa(' One more sentence.');     // append to the last caption without a new step
return g.passos;
```

Row kinds:
- **TeX row**: any KaTeX TeX. Keys `\htmlData{k=KEY}{symbol}`; a mark adds a coloured
  background: `\htmlData{k=KEY,marca=mes}{…}`. Helpers: `F.clau(k, tex, marca)`, `F.op(k, '+')`
  (binary operator, keeps TeX spacing), `F.rel(k, '=')` (relation), `F.marca(tex, m)` (colour
  without key).
- **Text row**: a string starting with `§` (`F.filaText(text)`), Catalan prose with `$TeX$`,
  `\n` for line breaks, and **keyed phrases** `{{key|mark|text}}` (`F.frase`) that move, merge,
  get marked and can be dragged like symbols. `F.enunciatMarcat('… [o:phrase] … [c*:phrase] …',
  markFn)` turns a statement into such a row (the reading phase of word problems).
- **Figure row**: a string starting with `<svg`, inserted as is; it only cross-fades (it has no
  keyed animation yet, see §10).

Rules (all checked by the lint `comprovaGuio`): a key matches `/^[A-Za-z][A-Za-z0-9]*$/` and is
**unique within a step across all rows**; a renamed key is new in B and its old key is gone from
B; a fusion source exists in A and not in B; cursor keys exist; the first step animates nothing.
Rows never used by any step are hidden; a row used in some step but empty now keeps its height
(so reuse row indices for a later phase instead of leaving gaps).

## 4. Transition semantics (what the student sees)

From step A to step B (`motor.js`, `creaPissarra`):
1. Same key (or `reanomena`): the symbol moves to its new place and size; if its content changed,
   the new one travels the same path and appears late (no two visible copies).
2. `fusiona`: the old symbols fly into the new one, which pops in.
3. Others fade out / fade in; unkeyed parts of rows cross-fade.
4. Cursor: `clic` clicks a symbol before anything moves; `arrossega … fins` grabs a symbol and
   drags it to its target (the reading phase drags a marked phrase into a formula).
5. Anticipation boxes: without a drag, light-blue boxes first mark what will change, then follow
   it. A keyed phrase that wraps over two lines gets no ghost (it cross-fades in place).
Timing constants: `TEMPS` in `motor.js` (one place for every page); `prefers-reduced-motion`
shortens everything.

## 5. A procedure and a page

```js
(function (arrel) {                       // arrel = globalThis (never reuse the name inside)
'use strict';
const M = arrel.Mates, F = arrel.Formules, Dd = arrel.Dades;
const {clau: K, rel: R} = F;
const FILA = Object.freeze({dades: 0, calcul: 1, treball: 2, resposta: 3});   // named rows

function valida(v) { return null; /* or a Catalan sentence explaining why the data is refused */ }
function passos(v) {
  const g = F.guio(4);
  g.files[FILA.dades] = K('Da', 'v') + R('Dq', '=') + K('Dv', '12\\,\\text{m/s}');
  g.afegeix('Escriu les dades.');
  // …one idea per step…
  g.classes[FILA.resposta] = 'final';
  g.afegeix('Resposta: …');
  return g.passos;
}
arrel.ElMeuProcediment = Object.freeze({
  titol: 'Títol', categoria: 'analisi', files: 4,
  perDefecte: {a: 2}, exemples: [{a: 2}, {a: -3}],
  editor: [{etiqueta: 'a =', camps: [Dd.camp('a', '', 'a', 9, 'negatiu', false)]}],   // [] = fixed problems
  valida, llegeixAdreca, escriuAdreca, enunciat, resum, passos, FILA,
});
})(globalThis);
```

Two kinds: **editor** procedures (integer data with arrows, `valida` refuses what the method cannot
show exactly) and **fixed problems** (`editor: []`, `Dades.problemesFixos(PROBLEMES)`, chips choose
`?p=id`; use them when every case needs its own story, as word problems do). The data always live
in the address (`?f=x^3-4x&a=-2`), so the teacher can share a link.

Page (`nom.html`): KaTeX css+js, `estil.css`, `mates.js`, `formules.js`, `dades.js`, the domain
helpers, `motor.js`, the procedure, and `<script>const procediment = Motor.inicia(ElMeuProcediment);</script>`.
`Motor.inicia` returns a controller `{carrega, salta, seguent, pas, total, …}` used by the browser tests.

## 6. Layout (solved problems — do not reinvent)

- Board font: the largest size (30 px; 22 px on phones) at which the widest TeX row of the whole
  procedure fits, and on large screens small enough for the tallest step + player + caption to fit
  the window (minimum `MIDA.minimaAlcada`). The board has its own scroll; the engine scrolls to the
  row that changes before measuring. The player sticks to the bottom if needed.
- Target devices: Chromebooks and small laptops (≈1366×700). Phones secondary but no gratuitous
  horizontal scroll. Long sums: `F.enLinies(inici, peces, {final})` wraps them (≈460 px per line)
  and never leaves a lone «= 0» on a new line. Formulas in text never break across lines.
- Take review screenshots of the **viewport**, not full page (a full-page shot refits the board).

## 7. Pedagogical conventions (general, from David — apply in every subject)

1. One idea per step, as on a blackboard; the caption says *what* and *why*, the board shows *how*.
2. **Every line shown is true** (an identity, an equivalent equation, a true value). No
   placeholders, no approximate values when exact ones exist (exact fractions, radicals, π).
3. Never write a symbol before saying what it means (define events, variables, magnitudes first).
4. Write the bare named equation first («f'(x) = 0», «|A| = 0», «F = m · a»), then substitute.
5. While an equation is solved it stays visible; the work goes to a working row below
   (`F.resolEquacio`); the solutions end in lilac (mark `solucio`); a solution that does not apply
   is crossed out in red (`F.tatxa`), never silently dropped.
6. Products with «·» before a parenthesis (`2 · (x − 1)`); words instead of abbreviations
   («Asímptota vertical», «Sistema compatible determinat», «Àrea =»); answers as sentences.
7. No optional checks after the answer (only checks that are part of the method).
8. Word problems: a reading phase — mark the objective (yellow) and the data (green, «×2» if a
   phrase hides two data) in the statement, then drag them into the formulas.
9. Colour meanings stay fixed: green chosen/positive, red removed/negative, yellow added/checked,
   lilac solution/current piece, one colour per path in trees. In systems, each equation labelled
   «(EQ.n)» in its own colour and the reduction lines «(EQ.2) · (−2):», values found `\boxed{}`.
10. Methods are the ones taught in Catalan schools for that level; refuse (in `valida`) data that
   the taught method cannot handle exactly instead of showing something approximate.

## 8. Tests — the reason there are no wrong lines

`proves/comprova.js` (Node, no browser): for each procedure, thousands of cases (all examples +
seeded random grids that cover every branch). For each case:
1. **Structural lint** (`comprovaGuio`): keys valid and unique, merges/renames/cursor consistent.
2. **Truth of every line**: `textPla(tex)` turns keyed TeX into plain text, `Mates.llegeix`
   parses it, exact arithmetic evaluates it against an **independent model** computed by a
   different method (determinant by Laplace while the page uses Sarrus, rank by Gauss while the
   page uses minors…). Identities are checked at enough points to be a proof; equation rows must
   have exactly the right solution set.
3. Final-state checks (the answer is highlighted, complete, in words).
4. General rules on every page (section «regles generals de totes les pàgines»): the house style
   (no Cramer, no abbreviations, points without «=», a product before a parenthesis with «·»,
   no optional checks…) is linted over every step of every example. Port this section first.
Mutation scripts inject realistic bugs into a copy and require the checker to fail; Playwright
tests play every step in a real browser (desktop and phone widths, no console errors, no overflow).
Rule: before delivering, `node procediments/proves/comprova.js` must end with «Tot correcte».
For a new subject, write the model first (e.g. a dimensional-analysis evaluator for physics, an
atom counter for chemistry, a gold parse for syntax), then the procedure.

## 9. Porting guide by subject

**Matemàtiques ESO / 1r Batxillerat / CCSS** — direct reuse. `mates.js` (fractions, polynomials,
parser), `formules.js` (keyed polynomials, equation solvers with working row, `substituit/avaluat`
for evaluating), `matrius.js` (Gauss, Sarrus, reduction 2×2 with (EQ.n)), `arbres.js`
(probability trees), `grafiques.js` (function graphs). New helpers likely: fraction arithmetic
step by step (common denominator, simplify), percentages, proportionality tables, linear
programming (feasible region SVG + vertices table), statistics tables (frequency columns filled
row by row — a TeX `array` with keyed cells animates well). ESO level: smaller steps, more
captions, no `\iff`.

**Física** — reuse the engine and `Fraccio`. A magnitude is value + unit: write units with
`\,\text{m/s}` inside the keyed value so they travel with the number; a helper that formats
`texMagnitud(valor, unitat)` and the checker needs a *unit-aware* model (exponents of m, kg, s, A,
K, mol) so that every line is dimensionally and numerically true. Typical procedures: data →
formula with symbols («v = v₀ + a · t», written bare first) → substitution with units → result
with units (`\boxed`). Vectors and forces: SVG sketch rows (copy the style of `geometria.js`
sketches: drawn arrows, labels with subscripts). Decimals are common in physics: decide with David
when to show decimals (comma) and how many significant figures, and make the checker know it.

**Química** — KaTeX can render chemistry with the `mhchem` extension
(`katex/contrib/mhchem.min.js`, `\ce{…}`), but keys inside `\ce` are not reliable: write formulas
with plain TeX (`\mathrm{H_2O}`, `\rightarrow`) so that coefficients and species can carry keys
(`K('c1', '2') + '\\mathrm{H_2}'`). Balancing an equation = a small linear system → reuse the
reduction/Gauss helpers and show the atom count table (an `array`, one row per element, keyed
cells). Stoichiometry: mol ↔ g ↔ L chains as keyed fraction products where units cancel (mark the
cancelled units with `menys`). The checker: atoms conserved, charges conserved, molar masses from
a table.

**Anàlisi morfosintàctica** — no maths needed: use **text rows** with keyed phrases
(`{{key|mark|text}}`): each word or constituent is a key, marks colour the function (define a new
mark set in `formules.js` `MARQUES` and in `estil.css`, e.g. subject, predicate, CD, CI, CC…).
Steps: the sentence → find the verb (mark) → the subject (drag the constituent) → the predicate and
its complements → the category of each word. For the tree/bracket layout, TeX rows already
animate keyed words inside `\underbrace{\htmlData{k=w3}{\text{la casa}}}_{\text{SN}}` or an
`array` of boxes (try it first: keys inside `\text{}` work); a real syntax tree in SVG needs the
extension of §10. The model for the checker is a gold analysis per sentence (fixed problems).

## 10. Extension points (where to change the engine, carefully)

- **Categories / colours**: `body[data-categoria]` tokens in `estil.css` and the `CATEGORIES`
  names and breadcrumb text (`'PAU Matemàtiques'`, «Procediments pas a pas») in `motor.js`
  `construeixPagina`: make the site name a field of the procedure or a page-level constant before
  reusing it in another site.
- **Marks**: add the name to `MARQUES` in `formules.js` and a CSS rule
  `.katex [data-marca="nom"]` (formulas) and/or `.marca-nom` (text phrases).
- **Keyed SVG** (not done): figure rows only cross-fade. To animate parts of a diagram (nodes of a
  syntax tree, forces), the ghost code in `motor.js` (`fantasma`, which clones the element into an
  HTML layer) would have to clone SVG nodes inside an overlay `<svg>`; measure with
  `getBoundingClientRect`, which already works on SVG elements.
- **Timing**: `TEMPS`; **sizes**: `MIDA` in `motor.js`.
- Any engine change affects every page: rerun all browser tests.

## 11. Gotchas learned the hard way

- Key collisions between helpers that use the same prefix are the #1 bug: grep the prefixes of
  every helper you call. The lint reports duplicates with step and row.
- `\htmlData` needs KaTeX `trust` for that command and `strict: 'ignore'` (already set in
  `motor.js`); captions use KaTeX without trust (no keys in captions).
- KaTeX may put relative size classes on the keyed element (e.g. inside `\xrightarrow`); ghosts copy
  the computed font size to avoid flying at the wrong size.
- A step identical to the previous one disappears (so optional steps need no `if`).
- New TeX commands used on the board must be added to the checker's `textPla`.
- Never use floats for displayed values; never name a variable `arrel` inside the IIFEs.
- Catalan typography: decimal comma, `;` between interval ends, «», `ℝ`.

## 12. How to start a new project (checklist for the AI)

1. Copy `motor.js`, `estil.css`, `mates.js`, `formules.js`, `dades.js`, `proves/comprova.js`
   (keep its first sections: `textPla`, `comprovaGuio`, helpers; drop the PAU sections) and this
   file into the new repository. Change the site name and categories (§10).
2. Write one procedure end to end (model in the checker first, then `passos`, then the page),
   with 3–6 examples, and show David screenshots before writing the next one.
3. Promote any helper that a second procedure could use to the shared layer.
4. Keep the documents (README reference, INSIGHTS lessons, this file) up to date in the same
   commit as the code.
5. Long term: if several sites use the engine, keep one master copy of the generic files
   (`motor.js`, `estil.css`, `mates.js`, the generic part of `formules.js`, `dades.js`) in one
   repository and copy them from there, noting the version, so improvements reach every site.
