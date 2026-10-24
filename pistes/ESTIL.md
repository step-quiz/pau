# Hint style guide

Rules for writing and reviewing the hints (`pistes/src/<id>.tex`, compiled to `data/<id>-p.pdf`).

- **Audience.** The AI that writes or reviews hints, and David, who approves the rules. Hints are written in **Catalan**; this guide is in English.
- **Scope.** This is the single source of truth for hint *content*. `UPDATING.md` covers adding new exam sessions and points here.
- **Version.** Rewritten on 2026-10-24, after the pedagogical pilot and algebra lots 1–2, and extended with algebra lots 3–6 (the whole algebra block). The previous Catalan version (2026-10-09, amended 16–17/10) is in the git history. Notes in `REVISIO.md` dated before 2026-10-24 that cite «ESTIL §7» refer to that version. Its fixed templates are retired by §7 below: the structured format, the Rouché–Frobenius list and the optimisation labels.

## 1. Principles

1. **Reader model.** A student opens a hint only after reading the statement and failing to start, or after getting stuck. A student who can solve the exercise never reads it. So every sentence must remove a specific obstacle. Anything else is extra load on a reader who is already overloaded.
2. **Cognitive load means inferences, not words.** A compressed sentence («Fes Gauss», «resol de baix a dalt») makes the student unpack it. A longer, explicit sentence can be lighter. Minimise the number of things the student has to infer, not the length.
3. **A hint unblocks; it does not solve.** It never gives:
   - a final result;
   - the function to optimise;
   - the conclusion the statement asks the student to prove;
   - an intermediate result that the pauta scores.

   The exception is a minimal worked example (one row, one element, one term) that shows the move and leaves the rest to the student.
4. **Coherence with the official solution** (`data/<id>-s.pdf`). The hint leads to a method the pauta accepts. It never contradicts the pauta. It does not make the student lose a step the pauta scores separately (§7.5).
5. **Fidelity to the statement.** The statement reproduced in the hint PDF is the official one, verbatim. `UPDATING.md` §5 explains how to handle figures and notes.
6. **David's words are final.** When David suggests a wording during review, use it verbatim. Deviate only to fix a mathematical inaccuracy or a typographic defect, change as little as possible, and say so in the reply. Precedent: `alg-23j-q4` a), where «En el càlcul,» was added so that $(2+\lambda)^3$ is not read as the whole determinant.
7. **Hints written by David.** If *Autor = David* in `REVISIO.md`, correct errors only, unless David says otherwise. If a hint contains text marked «text del David», keep his move.

## 2. Classifying review proposals

| Mark | Type | Examples |
|---|---|---|
| 🔴 | Error | Mathematical (a wrong vector, a sign), typographical, a hint that leads down a wrong path |
| 🟠 | Pedagogical | One of the failure modes below |
| 🟡 | Language and style | §4, §5 |

Pedagogical failure modes. Each 🟠 proposal names one; the review page shows it as *tipus*.

| Mode (label on the review page) | Symptom | Before (rejected) |
|---|---|---|
| Guess the secret (*Endevinar el secret*) | A vague instruction or a riddle. An abstract question that needs two or more inferences. | «hi descobriràs alguna cosa interessant»; «Quina figura de l'espai té una equació d'aquesta forma?» |
| Parroting the theory (*Repetir la teoria*) | A generic recipe or a theorem statement that is the same in every exercise, instead of the step that blocks this one | The 4-item Rouché–Frobenius list; «en general $A \cdot B \neq B \cdot A$»; «És un cas clar del teorema de Bayes» |
| Creating another problem (*Crear un altre problema*) | Asks for work that neither the question nor the pauta needs | $f''$ for a sketch the pauta draws without concavity (`ana-26s-q1` 1.2); a shortcut that leads to a quadratic whose roots must then be checked (`alg-23j-q4` a)) |
| Too much information (*Massa informació*) | Several warnings, labels such as $(\ast)$, optional alternatives, more than one obstacle per hint | `ana-23j-q5` a) before 2026-10-24: four labelled steps and two warnings |

## 3. Format (implemented in `pista.sty`)

- One `\pista{...}` box per part, right after the statement of that part.
- Uniform header: *PAU de Matemàtiques — Pistes* · *Catalunya AAAA · Convocatòria · Sèrie*.
- No page number. **Every hint PDF is a single page.**
- The score of a part goes at the end of its statement as `\hspace*{\fill}\textnormal{[0,75~punts]}`, not `\hfill`. If the score wraps to the next line, `\hfill` disappears at the start of the line and the score ends up on the left.

## 4. Language (Catalan)

- **Grammatical person:** second person singular («Calcula», «Fixa't»). No first person plural («podem», «hem vist a classe»).
- **Quotes:** «…». Never ``` ``…'' ``` or `"…"`.
- **Spelling:** «dona» (not «dóna»), «ves» (not «vés»).
- **Forms to avoid:** «anem a» + infinitive for the future (→ «obtindràs»); «donat que» (→ «atès que», «com que»); «en base a» (→ «a partir de»).
- **Oral filler and irony to avoid:** «No et preocupis», «observa amb atenció», «M'explico», capitals for emphasis. «Com sempre» is allowed only in the fixed sentence of §7.6.
- **References to parts:** «l'apartat *a)*», «l'apartat 3.1».
- **Ordinals for equations:** «la 1a equació», «la 3a equació» (feminine abbreviations).
- **Apostrophe before symbols:** follow how the letter's name is pronounced. Apostrophise if the name starts with a vowel sound: d'$A$, d'$e$, d'$f$ (efa), d'$h$ (hac), d'$l$ (ela), d'$m$ (ema), d'$n$ (ena), d'$r$ (erra), d'$s$ (essa), d'$x$ (ics), d'$y$ (i grega), d'$\alpha$. Do not apostrophise if it starts with a consonant: de $B$, de $k$ (ca), de $p$ (pe), de $t$ (te), de $\lambda$, de $\pi$.
- **Punctuation:** em dashes (`---…---`) for asides. No comma before «i».

## 5. Notation and layout

- Vectors: `\vec{PQ}`, `\vec{n}`. Cross product: `\times`. Dot product: `\cdot`.
- Decimal comma: `2{,}5`. Percentages: `16\,\%`. Units with a thin space: `10\,\text{m}`, `2{,}5\,\euro/\text{m}`.
- Matrices: `pmatrix`. Augmented matrix: `A^{'}`. Systems: `\left.\begin{array}{r} … \end{array}\right\}`.
- **In hint text, matrices go in display math** (`\[ … \]`), not inline in running text: an inline `pmatrix` breaks the line spacing. Statements keep the official layout.
- A short equality must not split at its relation symbol. Wrap it in `\mbox{$z = t$}`, then check that the build reports no `línia massa llarga`. If it does, reword the sentence or use display math instead.

## 6. Length and shape

- **One obstacle per hint.** Two only if the part asks for two independent things (for example, «resoleu» and «interpreteu geomètricament»).
- Usually two or three short paragraphs separated by `\medskip`. The PDF must stay on one page.
- **Default to prose with sequence markers** (§7.3). Use `itemize` only for parallel items the student must treat separately (vertical and horizontal asymptotes), never for a generic recipe.
- **Display math** (`\[ … \]`) for the one formula or equation the student has to write or check.
- The editor warns above 700 characters. Treat that as a signal to look for compression or for a second obstacle, not as a hard limit.

## 7. Writing a hint

### 7.1 Procedure

1. Read the statement (`-e.pdf`), the pauta (`-s.pdf`) and the current hint. Solve the part yourself.
2. **Name the obstacle**: the first point where a student who has read the statement is most likely to stop. Typical obstacles:
   - translating the words of the statement into mathematics;
   - a non-standard presentation: unknowns out of order or missing, terms on both sides, a continuous equation such as $x - 1 = y = -z$;
   - the first move of a proof;
   - a heavy computation with parameters;
   - reading a result, for example a parametric solution as a line.
3. Pick **one move** from §7.2 that removes that obstacle.
4. Phrase it according to §7.3. Add a warning only under §7.4.
5. **Check cross-references between the parts of the exercise.** If part b) says «els punts $P_1$ i $P_2$ ja els has trobat», the hint for part a) must name them (`geo-23s-q5`). If a later hint refers to an earlier one, the earlier one must still say what is referred to.
6. Build, look at the PNG (one page, no split formulas), and put the hint on the review page (§8).

### 7.2 Moves that work (approved examples)

| Move | Example |
|---|---|
| A concrete first step with the exercise's own objects | `geo-23s-q5` a): «A $r_{1}$, iguala cada membre a $\lambda$: $x - 1 = \lambda$, $y = \lambda$, $-z = \lambda$» |
| A minimal worked example, then «Fes el mateix» | `alg-25j-q2` a): the first row of $A^{'}$. `alg-23s-q3` a): the first equation reorganised. `alg-23j-q2` a): one element of $A \cdot B$ |
| An invented value that shows the form of the answer | `alg-25i-q4b` b): «La teva resposta són, precisament, tots els altres valors. Per exemple, si el valor que anul·la el determinant fos $a = 3$, llavors tu hauries d'escriure que la resposta és $a \neq 3$» |
| An example with invented numbers, announced as invented | `ana-23j-q5` a): «Prova-ho en primer lloc amb un número inventat. Per exemple, si el costat paral·lel al mur fa $2\,\text{m}$…» |
| Numerical probing that makes a limit visible | `ana-26s-q1` 1.2: $f(10) \approx 0{,}5$, $f(100) \approx 0{,}05$ |
| An obvious self-check, only when the main computation is error-prone and the check is much cheaper | `alg-23j-q4` a): evaluate at $\lambda = 0$. Not for a $2 \times 2$ inverse: David removed that check in `alg-23j2-q5` a) |
| Showing the object instead of describing it | `alg-23s-q1` a): $2I = \begin{pmatrix} 2 & 0 \\ 0 & 2 \end{pmatrix}$ and $3I$ written as matrices, not «un 2 a cada element de la diagonal» |
| The classroom method, with its steps named | `alg-23j2-q5` a): «Segueix els passos habituals: calcula el determinant, troba la transposada, troba l'adjunta, i divideix-ho tot pel determinant» |
| A closed question that lists the possible answers | `alg-23j-q4` b): «Creus que es tallen en un punt, en una recta, o bé que són tots tres plans coincidents?» |
| The target state before the action, stated so it can be counted | `alg-23j2-q2` a): «has d'aconseguir dos zeros a la primera columna» |
| Reasoning on a picture the student already has | `pro-26j-q3` 3.2: the tree from 3.1, «Hi ha dues maneres de quedar-se sense entrada» |
| A direct procedure instead of an analogy that holds only under conditions | `alg-23s-q1` b): «fent directament el producte $(A - 2I) \cdot (A - 2I)$», not «com si fos $(a - 2)^{2}$» |
| Naming the theorem last, after the concrete move | `pro-26j-q3` 3.2: «(Això és el teorema de Bayes.)» |
| Reminding a basic formula, on its own line | Barrow's rule, the area of a triangle, the tangent line (§7.6) |

### 7.3 Phrasing rules (from David's edits, 2026-10-24)

1. **Full names, no jargon verbs.** Write «Esglaona la matriu ampliada, aplicant el mètode de Gauss» and «calcula el seu determinant, aplicant la regla de Sarrus». Avoid «Fes Gauss», «per Sarrus», and «$\det(A)$» in running text where words fit. Methods are named in words; objects are shown (§7.2). Use the precise verb for the operation: «multiplica… per $A^{-1}$ a l'esquerra», not «posant $A^{-1}$ a l'esquerra». A terse tag such as «fila per columna» is fine next to concrete numbers (`alg-23s-q1` a)), but not on its own with symbolic matrices (removed in `alg-23j2-q5` b)).
2. **Introduce every symbol the statement does not define.** Write «la matriu $A$», not bare «$A$», when the statement only gives a system. Prefer «la matriu $M$» to a bare symbol in running text even when the statement defines it: «un menor d'ordre 2 de la matriu $M$», «el rang de la matriu $M^{'}$» (`alg-26j2-q2` 2.3). Name concrete objects instead of abstract nouns: «obtindràs una equació amb les variables $y$ i $z$», not «una relació entre $y$ i $z$» (`alg-26s-q2` 2.2).
3. **Point at the object; do not describe where it is.** Use classroom vocabulary rather than a circumlocution: «el terme independent de la 3a equació», not «el nombre de la dreta». Repeat the noun instead of an ellipsis: «la 2a equació i la 3a equació», not «la 2a i la 3a». State the order of a subtraction explicitly: «resta la 1a equació menys la 2a equació», not «resta la 2a de la 1a». Write implicit products explicitly when the hint refers to them: «la condició $x \cdot y = 10$».
   - «en $(D \cdot C)$», not «dins del nou parèntesi».
   - «començant per la 3a equació, després la 2a equació i finalment la 1a equació», not «de baix a dalt… i així fins a la primera».
   - Name what the student is working with: *equacions* when solving, not *files*.
   - Name the exact object: $A^{'}$, not $A$, when the row belongs to the augmented matrix.
4. **Sequence markers, one step per sentence:** «En primer lloc», «A continuació», «Després», «Finalment». Mark contrasts with «En canvi» and consequences with «llavors». Keep the subject explicit: «Si el determinant és diferent de zero, significa que la matriu $A$ és invertible», not «Si no val zero, …».
5. **Ask questions the way a teacher would.** When the reason for a step is visible in the statement, give the step and ask for the reason instead of explaining it: «Et convé començar amb $F_{2} \to F_{2} + 2F_{1}$, veus per quin motiu?» (`alg-25i-q2` a)). State consequences with «llavors» and the subject repeated: «…també ho són, llavors els dos plans són coincidents». «Creus que el denominador s'anul·la per algun valor?», not «Passa mai?». Prefer closed questions with the options listed (§7.2).
6. **Reassure the student** about a trivial step, with one word: «escriu simplement $z = t$ (és un paràmetre lliure)». Reassure also when a step looks harder than it is, and say why: «No és tan difícil com sembla, perquè algunes d'aquestes equacions surten repetides» (`alg-23j2-q5` b)).
7. **Parentheses** may hold a name or a reassurance of a few words. They never carry a method, a condition or a step: write those as a sentence of their own. Precedent `geo-23s-q5` a): «Si vols imposar que un vector és perpendicular a un altre vector, escriu el seu producte escalar i fes una equació igualant a zero.»
8. **No term the stuck student may not know.** Say the operation instead: «Els que no en tenen són la resta, és a dir, 1 menys aquesta proporció», not «el complementari».
9. **Do not reveal the result of an earlier part** (a classification, a number of solutions, a value). Use a conditional: «Si el sistema és compatible indeterminat, …», «Si amb algun dels dos valors et queda una fila tota de zeros, …».

### 7.4 Warnings (`\textbf{Atenció:}`)

- **Default: no warning.** Most warnings David has seen were removed. Kept so far: three. Removed: «no pots deduir $D = I$» (`alg-23j-q2` b)), the side of $P^{-1}$ (`alg-24i-q2` b)), «$p$ també apareix a la dreta de la 1a equació» (`alg-25j-q2` b)).
- Keep a warning only if the trap lies **on the path the hint itself proposes**:
  - `alg-23s-q1` b): when factoring out $A$, $4A$ becomes $A \cdot 4I$;
  - `alg-23j2-q2` a): one special case needs an extra Gauss step;
  - `alg-23s-q3` a): signs when moving terms, «sobretot a la tercera equació».
- **Remove warnings about errors on other paths.** In `alg-23j-q2` b), «no pots deduir $D = I$ simplificant la $C$» was removed because it was too much information (David).
- **If the instruction already prevents the error, give no warning**, even when the pauta penalises the error heavily. «Multiplica-la per ella mateixa, fila per columna» makes «no elevis cada element al quadrat» redundant. «Multiplica els dos costats per $P^{-1}$ a l'esquerra» makes a warning about the side redundant, although the pauta gives 0 for the wrong side (`alg-24i-q2` b)). «Substitueix $p = -1$ a les tres equacions» covers the parameter in the independent term (`alg-25j-q2` b)).
- At most one warning per hint.

### 7.5 Steps the pauta scores

The steps the pauta scores separately are a checklist for the author, not content for the hint. Mention a scored step only if a stuck student is likely to leave it out, and do it in one clause along the path:

- the case $\det \neq 0$: «i la resta de valors, tots junts»;
- every quantity asked for: «Al final, dona les dues dimensions i el cost»;
- the objects asked for, not only the parameters: «escriu les matrius, no només els valors d'$a$ i $b$»;
- a symmetric second proof: «escriu-ho sencer: es puntua a part».

The hint may also say how many solutions to expect, and that some must be discarded by the figure, the context or the domain, as long as this does not reveal the result of an earlier part (§7.3.9).

### 7.6 Method conventions (David's methods; still binding)

- **Discussing a linear system.** The hint deals with the specific obstacle of the exercise: building $A$ and $A^{'}$, the determinant with parameters, or Gauss with a parameter. It ends with the fixed sentence:
  > «Llavors, discuteix el sistema com sempre: cada valor de ⟨paràmetre⟩ que anul·la el determinant d'$A$ s'estudia a part, i la resta de valors es tracten tots en un sol cas, perquè el sistema és determinat i té solució única.»

  With Gauss, the same ending follows «Estudia'ls d'un en un, …» (`alg-23j2-q2` a)). The 4-item Rouché–Frobenius list is retired.
- **Solving a system with a unique solution.** Do not impose a technique David may not teach (Cramer): «resol-lo aplicant la tècnica que et vagi millor» (`alg-24j-q2` a)).
- **Solving a system with infinitely many solutions (compatible indeterminat).** Say which two equations to keep, written in full («fes servir la 2a equació i la 3a equació»), and choose the free unknown so that the others come out directly (`alg-24j-q2` b), `alg-25j-q2` b)). Keep two independent equations, write «simplement $z = t$ (és un paràmetre lliure)», and solve for the other unknowns. Check which unknown can be free: in `alg-26s-q2`, $x$ is fixed when $k = 1$.
- **Area between curves.** Write $\text{Àrea} = \left| \int_{x_{1}}^{x_{2}} \bigl(f(x) - g(x)\bigr)\,dx \right|$ on its own line, with one absolute value per interval between consecutive intersection points. Never ask which curve is on top.
- **Tangent line.** Write $y - f(a) = f'(a)\,(x - a)$ on its own line, already with the exercise's point. If $a < 0$, write $(x + |a|)$, never $(x - -2)$.
- **Studying a function.** Use David's seven steps, with these names and in this order:
  1. *Domini i asímptotes verticals*;
  2. *Límits a l'infinit*;
  3. *Talls amb els eixos*;
  4. *Creixement, decreixement i extrems relatius*;
  5. *Concavitat i punts d'inflexió*;
  6. *Taula de valors* (optional);
  7. *Esbós de la gràfica*.

  Use only the steps the part asks for and the pauta uses, and reuse earlier parts explicitly («Tens gairebé tota la feina feta a l'apartat 1.1»). Never add a step the pauta does not use: `ana-26s-q1` 1.2 leaves out concavity. Two exceptions: a simple piecewise function (`ana-26j-q1`) and parabolas and lines (`ana-23j2-q1`).
- **Bolzano.** Write the auxiliary function $g(x) = f(x) - k$ on its own line. Then continuity, and the signs at the endpoints. If an approximation is asked for, evaluate intermediate values.
- **Optimisation.** The obstacle is usually building the function. Prefer an example with invented numbers (§7.2) to the label list *Variables / Condició / Funció a optimitzar / Optimitza*, which is retired. End by naming every quantity the question asks for.
- **Geometry.**
  - *Common perpendicular:* generic points $P_{1} \in r_{1}$ and $P_{2} \in r_{2}$, with different parameters, and two dot products equal to zero, as in the pautas. Use the cross product only if the pauta uses it.
  - *Distance from a point to a plane:* the formula on its own line. Use lowercase coefficients ($ax + by + cz + d$) when $A$, $B$, $C$ name points. Warn about the form $\ldots = 0$ only if the plane is given in another form.
  - *Parallel plane at a given distance:* the plane $\ldots + D' = 0$; the absolute value gives two solutions; keep the one the question needs.
- **Probability.**
  - Read conditional probabilities on the tree the student drew in the previous part.
  - Write Bayes as a fraction in words: $\dfrac{P(\text{web i sense entrada})}{P(\text{sense entrada})}$.
  - Total probability is the sum over the branches.
  - Binomial: say what $X$ counts, and $X \sim B(n, p)$.

  These conventions will be revisited when the probability block is reviewed.
- **One method per hint.** Never offer an optional alternative («o, si ho prefereixes, …»).
- **Shortcuts.** A shortcut that comes from looking at *this* exercise may be the single method. Example (approved): in `alg-23s-q3` b), the 1st and 3rd equations have the same $y$ and $z$ terms, so subtracting them gives $x$. A general memorised rule that replaces the method taught in class is not used. Example (rejected): the short rule for the inverse of a $2 \times 2$ matrix in `alg-23j2-q5` a).

### 7.7 Reference set

The hints reviewed under this guide are the few-shot examples for the next ones. `REVISIO.md` marks them «rev. 2026-10-24 (pilot)» or «(àlgebra, lot N)».

- Pilot: `alg-25j-q2` a), `ana-23j-q5` a), `ana-26s-q1` 1.2, `geo-23s-q5` a), `pro-26j-q3` 3.2, `alg-23s-q1` b).
- Algebra lot 1: `alg-23j-q2`, `alg-23j-q4` and `alg-23j2-q2`, all parts.
- Algebra lot 2: `alg-23j2-q5` a) and b), `alg-23s-q1` a) and c), `alg-23s-q3` a) and b).
- Algebra lot 3: `alg-24i-q2` a) and b), `alg-24j-q2` a), b) and c), `alg-25j-q2` b) and c).
- Algebra lot 6: `alg-26j2-q2` and `alg-26s-q2`, all parts. `alg-26s-q2` 2.2 uses an exercise-specific shortcut instead of the pauta's Cramer (approved).
- Algebra lot 5: `alg-25i-q4b`, `alg-25s-q2` and `alg-26j-q2`, all parts.
- Algebra lot 4: `alg-24s-q2` and `alg-25i-q2`, all parts. Note the exercise-specific shortcut in `alg-24s-q2` b) and c) (subtracting two equations with the same $x$ and $z$ terms).

## 8. Review workflow

- **Lots of six hints**, in the order of `REVISIO.md`, with whole exercises when possible.
- **Review page.** For each hint, the artifact «Revisió de pistes PAU» shows:
  - the obstacle (*On s'encalla*);
  - the move (*Què fa la proposta*);
  - the hint before and after, as rendered by the real build.

  The *before* image always comes from the committed version.
- **David's answer**, one line per hint:

  ```
  alg-23j-q2.a   ok
  alg-23j-q2.b   ok, (1) … (2) …
  geo-24s-q6.c   no
  geo-24i-q6     meva
  ```

  - `ok`: approved.
  - `ok, <text>`: approved with that change, using his wording verbatim (§1.6).
  - `no`: keep the current hint.
  - `meva`: the hint is David's. Set *Autor = David*; from then on, correct errors only.
- **Changes accumulate** in the working copy until David asks for a ZIP. Paths in the ZIP are relative to the repository root. The ZIP contains the `.tex` files, the compiled `-p.pdf` files and `REVISIO.md`. Before packaging:
  - every hint must build with no warnings;
  - every approved hint must be present in the working copy.
- **`REVISIO.md`.** Add one note per hint: «**rev. YYYY-MM-DD (lot):** …». Mark David's wording as «(text del David)».
