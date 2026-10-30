# Hint style guide

Rules for writing and reviewing the hints (`pistes/src/<id>.tex`, compiled to `data/<id>-p.pdf`).

- **Audience.** The AI that writes or reviews hints, and David, who approves the rules. Hints are written in **Catalan**; this guide is in English.
- **Scope.** This is the single source of truth for hint *content*. `UPDATING.md` covers adding new exam sessions and points here.
- **Version.** Rewritten on 2026-10-24, after the pedagogical pilot and algebra lots 1–2, and extended with algebra lots 3–6, geometry lots 7–9 probability lots 10–12 (the whole algebra, geometry and probability blocks) and analysis lots 13–19 (the whole analysis block). The previous Catalan version (2026-10-09, amended 16–17/10) is in the git history. Notes in `REVISIO.md` dated before 2026-10-24 that cite «ESTIL §7» refer to that version. Its fixed templates are retired by §7 below: the structured format, the Rouché–Frobenius list and the optimisation labels.

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

- **Grammatical person:** second person singular («Calcula», «Fixa't»). No first person plural («podem», «hem vist a classe»); when David's wording has one, it becomes second person singular («ens hem de restringir» → «t'has de restringir», «tenim… sabem» → «tens… saps»). The teacher's first person singular is allowed: «Finalment, et recordo les fórmules» (David, `ana-24i-q5` a)).
- **Quotes:** «…». Never ``` ``…'' ``` or `"…"`.
- **Spelling:** «dona» (not «dóna»), «ves» (not «vés»).
- **Forms to avoid:** «anem a» + infinitive for the future (→ «obtindràs»); «donat que» (→ «atès que», «com que»); «en base a» (→ «a partir de»).
- **Oral filler and irony to avoid:** «No et preocupis», «observa amb atenció», «M'explico», capitals for emphasis. «Com sempre» is allowed only in the fixed sentence of §7.6.
- **References to parts:** «l'apartat *a)*», «l'apartat 3.1».
- **Ordinals for equations:** «la 1a equació», «la 3a equació» (feminine abbreviations).
- **Vocabulary:** «altura» everywhere (triangle, rectangle, prism, tetrahedron, box), never «alçària» or «alçada»; when the statement uses another word, the statement keeps it. «respectivament» when two lists are matched («són, respectivament, els mòduls dels vectors…»).
- **No apostrophe before a symbol** (David, 2026-10-30, replaces the old pronunciation rule). Never write d'$A$, d'$f'(x)$, l'$x$: put the noun in front of the symbol, which also says what the symbol is: «el determinant de la matriu $A$», «cada valor del paràmetre $m$», «el signe de la funció $f'$», «la distància del punt $S$», «la recta $r$». The same for a bare symbol that opens a sentence: «A la recta $r$, …», «Per a la matriu $D$, …», not «A $r$, …». A bare symbol is fine when the noun was named just before (`geo-24i-q6` b): «un punt qualsevol $P_{2}$ de $s$»).
- **Punctuation:** em dashes (`---…---`) for asides. No comma before «i».

## 5. Notation and layout

- Vectors: `\vec{PQ}`, `\vec{n}`. Cross product: `\times`. Dot product: `\cdot`. Since 2026-10-24, `pista.sty` makes `\vec` with two or more letters (`\vec{AB}`) an `\overrightarrow`, so the arrow spans the whole name; one letter (`\vec{n}`, `\vec{v}_{r}`) keeps the usual accent. Always write `\vec{…}`: never `\overrightarrow` by hand, and keep subscripts outside (`\vec{v}_{r}`).
- Decimal comma: `2{,}5`. Percentages: `16\,\%`. Units with a thin space: `10\,\text{m}`, `2{,}5\,\euro/\text{m}`.
- Matrices: `pmatrix`. Augmented matrix: `A^{'}`. Systems: `\left.\begin{array}{r} … \end{array}\right\}`.
- **In hint text, matrices go in display math** (`\[ … \]`), not inline in running text: an inline `pmatrix` breaks the line spacing. Statements keep the official layout.
- A short equality must not split at its relation symbol. Wrap it in `\mbox{$z = t$}`, then check that the build reports no `línia massa llarga`. If it does, reword the sentence or use display math instead.

## 6. Length and shape

- **One obstacle per hint.** Two only if the part asks for two independent things (for example, «resoleu» and «interpreteu geomètricament»).
- Usually two or three short paragraphs separated by `\medskip`. The PDF must stay on one page.
- **Default to prose with sequence markers** (§7.3). Use `itemize` only for parallel items the student must treat separately (vertical and horizontal asymptotes), never for a generic recipe. Parallel cases are such items: a paragraph that lists several cases is hard to read (David), so put them in a short list, as in `ana-26j2-q4a` 4.2 (how to read the graph of $f'$: two cases; how to classify a critical point: three cases).
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
| Naming the theorem last, after the concrete move, as a sentence without parentheses | `pro-26j-q3` 3.2: «Això és el teorema de Bayes.» |
| Reminding a basic formula, on its own line, with the meaning of each letter | Barrow's rule, the area of a triangle, the tangent line (§7.6); «el volum d'un prisma es calcula seguint aquesta fórmula: $V = a \cdot b \cdot h$, on $a$ i $b$ són els costats de la base i $h$ és l'altura» (`ana-24j-q5` a)) |

### 7.2b Fixed reminders

- **An equation with an absolute value** always gets the reminder: «Recorda que una equació com $|X| = 5$ vol dir que $X = 5$ o bé $X = -5$.» (David, 2026-10-30, `geo-26j-q4b` 4.3).
- **Parameter discussion (Rouché)**, the same paragraph in every discussion: «A continuació, estudia el sistema d'equacions. D'una banda, has d'estudiar a part cada valor del paràmetre $m$ que anul·la el determinant de la matriu $A$. D'altra banda, la resta de valors que no anul·len el determinant fan que el sistema sigui compatible determinat, és a dir, que té solució única.» (David, 2026-10-30).

### 7.3 Phrasing rules (from David's edits, 2026-10-24)

1. **Full names, no jargon verbs.** Write «Esglaona la matriu ampliada, aplicant el mètode de Gauss» and «calcula el seu determinant, aplicant la regla de Sarrus». Avoid «Fes Gauss», «per Sarrus», and «$\det(A)$» in running text where words fit. Methods are named in words; objects and formulas are shown in mathematical notation: $\text{Àrea} = \frac{\text{base} \cdot \text{alçada}}{2}$, not «fes base per alçada dividit per 2» (`geo-24j-q6` c)). Use the precise mathematical verb: «el punt $C$ pertany al pla $\pi$», not «és del pla». Tie the result to the goal: «obtindràs el punt d'intersecció que estaves buscant». Use the precise verb for the operation: «multiplica… per $A^{-1}$ a l'esquerra», not «posant $A^{-1}$ a l'esquerra». A terse tag such as «fila per columna» is fine next to concrete numbers (`alg-23s-q1` a)), but not on its own with symbolic matrices (removed in `alg-23j2-q5` b)).
2. **Introduce every symbol the statement does not define.** Write «la matriu $A$», not bare «$A$», when the statement only gives a system. Prefer «la matriu $M$» to a bare symbol in running text even when the statement defines it: «un menor d'ordre 2 de la matriu $M$», «el rang de la matriu $M^{'}$» (`alg-26j2-q2` 2.3). Name concrete objects instead of abstract nouns: «obtindràs una equació amb les variables $y$ i $z$», not «una relació entre $y$ i $z$» (`alg-26s-q2` 2.2). When a computation uses a symbol, say what it means in words: «integra des de $x_{P}$ i fins a $x_{Q}$. Això vol dir que has de tenir en compte la primera coordenada del punt $P$ i la primera coordenada del punt $Q$» (`ana-24j-q3` b)). Show the object the words describe: «l'interval sobre el qual integres: $[x_{1}, x_{2}]$» (`ana-24i-q3` c)).
3. **Point at the object; do not describe where it is.** Use classroom vocabulary rather than a circumlocution: «el terme independent de la 3a equació», not «el nombre de la dreta». Repeat the noun instead of an ellipsis: «la 2a equació i la 3a equació», not «la 2a i la 3a». State the order of a subtraction explicitly: «resta la 1a equació menys la 2a equació», not «resta la 2a de la 1a». Write implicit products explicitly when the hint refers to them: «la condició $x \cdot y = 10$».
   - «en $(D \cdot C)$», not «dins del nou parèntesi».
   - «començant per la 3a equació, després la 2a equació i finalment la 1a equació», not «de baix a dalt… i així fins a la primera».
   - Name what the student is working with: *equacions* when solving, not *files*.
   - Name the exact object: $A^{'}$, not $A$, when the row belongs to the augmented matrix.
4. **Sequence markers, one step per sentence:** «En primer lloc», «A continuació», «Després», «Finalment». Mark contrasts with «En canvi» and consequences with «llavors» or «Això vol dir que…» (`ana-23j2-q6` b)). Keep the subject explicit: «Si el determinant és diferent de zero, significa que la matriu $A$ és invertible», not «Si no val zero, …».
5. **Ask questions the way a teacher would.** When the reason for a step is visible in the statement, give the step and ask for the reason instead of explaining it: «Et convé començar amb $F_{2} \to F_{2} + 2F_{1}$, veus per quin motiu?» (`alg-25i-q2` a)). State consequences with «llavors» and the subject repeated: «…també ho són, llavors els dos plans són coincidents». «Creus que el denominador s'anul·la per algun valor?», not «Passa mai?». Prefer closed questions with the options listed (§7.2).
6. **Reassure the student** about a trivial step, with one word: «escriu simplement $z = t$ (és un paràmetre lliure)». When two steps differ in effort, say which one is easy and why: «en canvi, per trobar el punt de tall amb l'eix d'ordenades és més senzill, perquè només has de fer $x = 0$» (`ana-23s-q2` c)). Reassure also when a step looks harder than it is, and say why: «No és tan difícil com sembla, perquè algunes d'aquestes equacions surten repetides» (`alg-23j2-q5` b)). A constant that looks intimidating: «Tingues en compte que $\pi$ és com qualsevol altre nombre i, per tant, l'has de tractar com una constant qualsevol, com si fos, per exemple, el nombre 5» (`ana-24i-q5` b)).
7. **Parentheses** may hold a name, a reassurance, or a short clarification introduced by «o sigui» («Si els vectors són paral·lels (o sigui, amb coordenades proporcionals), …»). They never carry a condition or a step: write those as a sentence of their own. One exception (David): «(per exemple, …)» for a check the pauta accepts in several ways, «comprova que $x = \frac{1}{2}$ és un màxim (per exemple, estudiant el signe de la funció $A'$)» (`ana-24s-q5` a)). Precedent `geo-23s-q5` a): «Si vols imposar que un vector és perpendicular a un altre vector, escriu el seu producte escalar i fes una equació igualant a zero.»
8. **No term the stuck student may not know.** Say the operation instead: «Els que no en tenen són la resta, és a dir, 1 menys aquesta proporció», not «el complementari».
9. **Do not reveal the result of an earlier part** (a classification, a number of solutions, a value). Use a conditional: «Si el sistema és compatible indeterminat, …», «Si amb algun dels dos valors et queda una fila tota de zeros, …».
10. **When you ask the student to compare, say what they will find** and what it means: «Comprovaràs que són paral·lels, perquè tenen les coordenades proporcionals. Això vol dir que el pla $\pi_{3}$ és perpendicular a la recta $r$» (`geo-23j-q6` c)). A bare «Què observes?» is a riddle. The same after a closed question: «Pot ser negativa una potència d'exponent parell, com ara $x^{2}$? D'aquí en pots deduir que $f'(x)$ mai és negativa i, per tant, tindràs informació valuosa sobre $f(x)$» (`ana-24s-q1` b)), not «D'aquí en pots deduir el creixement».
11. **A conditional covers every case.** If the hint says what happens when the vectors are proportional, it also says what to do when they are not, even if the second case is the one that applies (`geo-24i-q6` a)). Dropping a branch both reveals the result and leaves the reasoning incomplete.
12. **Keep the general form visible**, even when it is trivial: the first row of the plane determinant through the origin is $x - 0$, $y - 0$, $z - 0$, as for any other point (`geo-24i-q6` a)).
13. **Give the reason for a restriction or a recurring fact**, not only the instruction: «una taula de signes de la funció derivada $f'(x)$, però només per a $x > 0$, perquè t'has de restringir al domini d'$f(x)$» (`ana-24j-q1` a)); «podràs treure factor comú $x$. Sempre que tens aquesta situació, saps que una solució és $x = 0$, i correspon al punt $(0, 5)$ de la figura. Les altres dues solucions provenen de resoldre una equació de segon grau…» (`ana-24j-q3` a)).
14. **Say the key fact directly when the obstacle is recognising it.** «Pensa quina funció és una primitiva d'$f'$» was too mysterious (David). Write: «En aquest cas, com que precisament estàs buscant una primitiva d'$f'(x)$, resulta que la mateixa funció $f(x)$ ja et serveix» (`ana-26j2-q4a` 4.3), and ask the student to write it in the answer if the pauta scores it. Use «mateix» for «the same», not «propi».

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
- the shape of the final answer, counting its objects, as a normal sentence instead of a warning: «Finalment, la teva resposta han de ser dos punts $P$ i $Q$, i cadascun té dues coordenades» (David, `ana-24i-q3` b)); «tingues en compte que la teva resposta ha d'incloure, d'una banda, les tres mides del cobert; i d'altra banda, el cost total» (David, `ana-24j-q5` b));
- the objects asked for, not only the parameters: «escriu les matrius, no només els valors d'$a$ i $b$»;
- a symmetric second proof: «escriu-ho sencer: es puntua a part».

The hint may also say how many solutions to expect, and that some must be discarded by the figure, the context or the domain, as long as this does not reveal the result of an earlier part (§7.3.9).

### 7.6 Method conventions (David's methods; still binding)

- **Discussing a linear system.** The hint deals with the specific obstacle of the exercise: building $A$ and $A^{'}$, the determinant with parameters, or Gauss with a parameter. It ends with the fixed sentence:
  > «Llavors, discuteix el sistema com sempre: cada valor de ⟨paràmetre⟩ que anul·la el determinant d'$A$ s'estudia a part, i la resta de valors es tracten tots en un sol cas, perquè el sistema és determinat i té solució única.»

  With Gauss, the same ending follows «Estudia'ls d'un en un, …» (`alg-23j2-q2` a)). The 4-item Rouché–Frobenius list is retired.
- **Solving a system with a unique solution.** Do not impose a technique David may not teach (Cramer): «resol-lo aplicant la tècnica que et vagi millor» (`alg-24j-q2` a)).
- **Solving a system with infinitely many solutions (compatible indeterminat).** Say which two equations to keep, written in full («fes servir la 2a equació i la 3a equació»), and choose the free unknown so that the others come out directly (`alg-24j-q2` b), `alg-25j-q2` b)). Keep two independent equations, write «simplement $z = t$ (és un paràmetre lliure)», and solve for the other unknowns. Check which unknown can be free: in `alg-26s-q2`, $x$ is fixed when $k = 1$.
- **Area between curves.** Write $\text{Àrea} = \left| \int_{x_{1}}^{x_{2}} \bigl(f(x) - g(x)\bigr)\,dx \right|$ on its own line, with one absolute value per interval between consecutive intersection points. Never ask which curve is on top. Explain what the intersection points mean with an invented example: «les dues solucions et marquen precisament l'interval sobre el qual integres. Per exemple, si … fossin $x = 3$ i $x = 7$, vol dir que has d'integrar en l'interval $[3, 7]$» (`ana-23j2-q1` a)).
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
- **Limits.** Never suggest L'Hôpital's rule: it is not needed for the PAU (David, `ana-24j-q1` b)). For a limit at infinity, probe with large values (§7.2, `ana-26s-q1` 1.2), give the reason in one sentence («$x$ creix molt més de pressa que $\ln x$») and say what the result means: «Cap a quin valor s'acosten els valors d'$f(x)$? Si el límit és un nombre real (finit), llavors significa que hi ha una asímptota horitzontal» (`ana-24j-q1` b)). For a limit that is not indeterminate, ask for the sign: «No és una indeterminació: quin signe té el quocient?».
- **Bolzano.** Write the auxiliary function $g(x) = f(x) - k$ on its own line. Then continuity, and the signs at the endpoints; the conclusion with the interval: «s'anul·la en algun valor de l'interval $(0, 5)$» (`pro-26j-q3` 3.3). If an approximation is asked for, first try integer values until two consecutive ones change sign, then steps of one tenth between them.
- **Optimisation.** The obstacle is usually building the function. Prefer an example with invented numbers (§7.2) to the label list *Variables / Condició / Funció a optimitzar / Optimitza*, which is retired. Name the check of the extremum in words, with the method that suits the function: «comprova que efectivament has obtingut un mínim: pots fer-ho estudiant el signe de la funció $A'$. Com que tens una funció racional i el denominador en aquest cas sempre serà positiu, només cal que estudiïs el signe del numerador» (`ana-25s-q1` b)); «Comprova que és un mínim fent servir la segona derivada $A''$» when $A''$ is simple (`ana-26j-q4a`). End by naming every quantity the question asks for.
- **Geometry.**
  - *Common perpendicular:* generic points $P_{1} \in r_{1}$ and $P_{2} \in r_{2}$, with different parameters, and two dot products equal to zero, as in the pautas. Use the cross product only if the pauta uses it.
  - *Distance from a point to a plane:* the formula on its own line. Use lowercase coefficients ($ax + by + cz + d$) when $A$, $B$, $C$ name points. Warn about the form $\ldots = 0$ only if the plane is given in another form.
  - *Parallel plane at a given distance:* the plane $\ldots + D' = 0$; the absolute value gives two solutions; keep the one the question needs.
- **Probability** (approved in lot 10).
  - *Total probability:* «Fes un diagrama d'arbre.» First put the probabilities on the branches, where the obstacle is (the die: «com a màxim 4 vol dir… 4 resultats de 6»; a percentage that belongs to the other branch, converted to «tant per u»). Then the paths in words («Hi ha dues maneres d'arribar a…: … o …»), «Multiplica les probabilitats al llarg de cada camí i suma els dos resultats», and «Això és el teorema de la probabilitat total.» at the end, as a sentence, without parentheses. When a percentage goes on a branch, say how it becomes a probability: «Un $90\,\%$ es tradueix en $p = 0{,}9$», «Recorda que el $95\,\%$ ens permet dir que $p = 0{,}95$» (`pro-25i-q3` a), `pro-25j-q3` a)).
  - *Bayes:* «Torna a l'arbre de l'apartat …. Saps que …: queda't només amb els camins que acaben en «…». Et demanen quina part d'aquesta probabilitat ve del camí en què …», the fraction in words on its own line, the denominator from the previous part (with «1 menys…» when it is the complement), and «Això és el teorema de Bayes.» at the end, as a sentence, without parentheses (David). If a branch probability is a complement, say it: «la probabilitat que el Holter doni negatiu és $1 - 0{,}95$».
  - *Binomial:* why it is binomial (each trial, the same $p$), what $X$ counts, $X \sim B(n, p)$; translate «almenys…» on its own line, as a sum or as the complement when that is shorter; and the formula on its own line: «Recorda la fórmula de la binomial: $P(X = k) = \binom{n}{k}\, p^{k}\, (1 - p)^{n - k}$».
  - *Laplace:* count the cases instead of combining events: $P = \frac{\text{casos favorables}}{\text{casos possibles}}$ (`pro-24j-q4` a1).
- **One method per hint.** Never offer an optional alternative («o, si ho prefereixes, …»).
- **Shortcuts.** A shortcut that comes from looking at *this* exercise may be the single method. Example (approved): in `alg-23s-q3` b), the 1st and 3rd equations have the same $y$ and $z$ terms, so subtracting them gives $x$. A general memorised rule that replaces the method taught in class is not used. Example (rejected): the short rule for the inverse of a $2 \times 2$ matrix in `alg-23j2-q5` a).

### 7.7 Reference set

The hints reviewed under this guide are the few-shot examples for the next ones. `REVISIO.md` marks them «rev. 2026-10-24 (pilot)» or «(àlgebra, lot N)».

- Pilot: `alg-25j-q2` a), `ana-23j-q5` a), `ana-26s-q1` 1.2, `geo-23s-q5` a), `pro-26j-q3` 3.2, `alg-23s-q1` b).
- Algebra lot 1: `alg-23j-q2`, `alg-23j-q4` and `alg-23j2-q2`, all parts.
- Algebra lot 2: `alg-23j2-q5` a) and b), `alg-23s-q1` a) and c), `alg-23s-q3` a) and b).
- Algebra lot 3: `alg-24i-q2` a) and b), `alg-24j-q2` a), b) and c), `alg-25j-q2` b) and c).
- Geometry lot 7: `geo-23j-q6`, `geo-23j2-q3`, `geo-23s-q5` b) and `geo-24i-q6`. Shared methods with algebra: a line given by two planes is solved with $x = t$; a plane through a point with two direction vectors uses the determinant.
- Analysis lot 19: `ana-26j2-q1`, `ana-26j2-q4a` (4.2 and 4.3 in a second version: lists for parallel cases; the primitive said directly), `ana-26s-q1` 1.1 and 1.3, `ana-26s-q4a`. The whole analysis block is reviewed.
- Analysis lot 18: `ana-25s-q1`, `ana-25s-q3c`, `ana-25s-q4a` (a generic name for «the function that…»: «La funció que compleixi $h(0) = 0$…»), `ana-26j-q1`, `ana-26j-q4a`.
- Analysis lot 17: `ana-25i-q1`, `ana-25i-q4a`, `ana-25j-q1` (the axis intercepts in David's words: «Per trobar el punt de tall amb l'eix d'ordenades, és més senzill, perquè el punt serà $Q\bigl(0, f(0)\bigr)$»), `ana-25j-q4a` (one method: the whole sail minus the upper part; the optional «Drecera» removed).
- Analysis lot 16: `ana-24j-q1` b) (second version, no L'Hôpital), `ana-24j-q5`, `ana-24s-q1`, `ana-24s-q3`, `ana-24s-q5`.
- Analysis lot 15: `ana-24i-q3`, `ana-24i-q5`, `ana-24j-q1` a) and c), `ana-24j-q3`. Rejected: `ana-24j-q1` b) with L'Hôpital's rule.
- Analysis lot 14: `ana-23s-q2`, `ana-23s-q4`, `ana-23s-q6`, `ana-24i-q1` (c) follows `ana-26s-q1` 1.2: limits and sketch, no second derivative).
- Analysis lot 13: `ana-23j-q1`, `ana-23j-q3`, `ana-23j-q5` b), `ana-23j2-q1`, `ana-23j2-q4` (optimisation with an invented example, no label list), `ana-23j2-q6`.
- Probability lot 12: `pro-26j-q3` 3.1 and 3.3, `pro-26j2-q3`, `pro-26s-q3`. The whole probability block is reviewed.
- Probability lot 11: `pro-24j-q4` a2 (second version: a worked example with the A), `pro-25i-q3`, `pro-25j-q3`, `pro-25s-q3ab`.
- Probability lot 10: `pro-24i-q4`, `pro-24j-q4` (a1, b1, b2) and `pro-24s-q4`. Rejected: the first rewrite of `pro-24j-q4` a2 (a chain of abstract steps: «busca quines lletres… per a cadascuna… finalment suma»).
- Geometry lot 9: `geo-25s-q4b`, `geo-26j-q4b` 4.1 and 4.2, `geo-26j2-q4b`, `geo-26s-q4b`. Rejected: a rewrite of `geo-26j-q4b` 4.3 (too contrived); the original hint stays. Every geometry hint now finds a plane with the determinant.
- Geometry lot 8: `geo-24j-q6`, `geo-24s-q6` and `geo-25j-q4b`, all parts.
- Algebra lot 6: `alg-26j2-q2` and `alg-26s-q2`, all parts. `alg-26s-q2` 2.2 uses an exercise-specific shortcut instead of the pauta's Cramer (approved).
- Algebra lot 5: `alg-25i-q4b`, `alg-25s-q2` and `alg-26j-q2`, all parts.
- Algebra lot 4: `alg-24s-q2` and `alg-25i-q2`, all parts. Note the exercise-specific shortcut in `alg-24s-q2` b) and c) (subtracting two equations with the same $x$ and $z$ terms).

## 8. Review workflow

- **Lots of about ten hints**, in the order of `REVISIO.md`, with whole exercises. A rejected hint comes back as the first item of the next lot.
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
