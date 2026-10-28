# Adding a new PAU exam session (e.g. June 2027, September 2027)

Instructions for an AI assistant (Claude) that starts **cold** on this repository and has to add the exams of a new PAU session (Catalonia, *Matemàtiques*, 2n de Batxillerat). Read the whole file before you start. Read `CLAUDE.md`, `pistes/ESTIL.md` and the first lines of `pistes/REVISIO.md` too.

---

## 0. Who you work for and how

- **The user is David**, a maths teacher in Catalonia (degree in Mathematics, ESO/Batxillerat). He programs in C and designs algorithms; his knowledge of HTML/CSS/JS, Git/GitHub and TeX is intermediate.
- **Always write to him in Catalan.** This file is in English only because it is meant for you.
- **He wants Git/GitHub steps explained in detail, with copy-paste text.**
- **ZIP uploads.** He often uploads ZIP files to the repository folder `_uploads/`. The workflow `.github/workflows/unzip-upload.yml` unzips them **at the repository root**, commits the result and deletes the ZIP. So any ZIP you give him must contain **repository-relative paths**, for example `data/ana-27j-q1-e.pdf` or `pistes/src/ana-27j-q1.tex`, with no top-level wrapper folder.
- **He decides; you propose.** Hints (*pistes*) written by an AI must be reviewed by him before they count as final (see §7).
- **Tokens are limited.** Be efficient: no unnecessary subagents, no re-reading big files, no polling loops.

---

## 1. What the project is

A static website, published with GitHub Pages from `main` (root folder). It offers 67 exercises (as of October 2026) from the Catalan PAU, sorted into four categories. Each exercise has three PDFs:

| File | Content | Origin |
|---|---|---|
| `data/<id>-e.pdf` | statement (*enunciat*) | crop of the **official** exam PDF, content never modified |
| `data/<id>-p.pdf` | hint (*pista*) | **generated** from `pistes/src/<id>.tex` by `pistes/build.py` |
| `data/<id>-s.pdf` | official solution and marking criteria (*pauta*) | crop of the **official** solutions PDF, content never modified |

### Repository layout

```
index.html                 the whole web app; the exercise list is the JS object EXERS
config.js                  OPTATIUS (optional exercises), VIDEOS (YouTube IDs) and ETIQUETES (search-box tags)
data/                      <id>-e.pdf, <id>-p.pdf, <id>-s.pdf for every exercise
pistes/src/<id>.tex        LaTeX source of each hint
pistes/src/pista.sty       shared preamble (box style, header, determinism)
pistes/build.py            compiles hints -> data/<id>-p.pdf (and optional PNG previews)
pistes/ESTIL.md            style guide for hints (English; hints in Catalan) - MUST follow
pistes/REVISIO.md          review tracker: one row per hint (lot, id, origin, source, author, status, notes)
pistes/README.md           how David edits a hint by hand
.devcontainer/install-latex.sh   installs TeX Live + poppler + qpdf (idempotent)
.github/workflows/pistes.yml     on push to main touching pistes/src/**: rebuild all hints, commit changed PDFs
.github/workflows/unzip-upload.yml  extracts ZIPs uploaded to _uploads/
.claude/hooks/session-start.sh   installs TeX Live in Claude Code cloud sessions
.vscode/tasks.json         VS Code tasks: build the open hint / all hints
pistes/editor/             the «Editor de pistes PAU» artifact: generator, template and docs
procediments/              animated step-by-step procedures (shared engine + one page per procedure); see procediments/README.md
CLAUDE.md                  short project rules (Catalan)
```

### Hard rules (from `CLAUDE.md`)

1. **Never modify the content of `-e.pdf` or `-s.pdf`.** They are crops (page selection, plus at most a MediaBox/CropBox crop) of the official PDFs. Removing the blank answer-space page that follows a statement is allowed and preferred; David approved this.
2. **Never edit a `-p.pdf` directly.** Edit `pistes/src/<id>.tex` and run `python3 pistes/build.py <id>`.
3. **`EXERS` in `index.html` must match `data/` exactly.** Every id needs all three PDFs, and every PDF trio needs an `EXERS` entry.
4. **Every hint fits on one page** and compiles without the warning `línia massa llarga`.
5. **The build is deterministic** (fixed `SOURCE_DATE_EPOCH`). Recompiling an unchanged `.tex` gives a byte-identical PDF, so `git status` shows only the hints that really changed.

---

## 2. Exam structure and ID scheme

### Official exam format (2025 onwards)

Each *sèrie* (exam version) has **4 compulsory exercises worth 2.5 points each**. Exercise 4 has two options, A and B; the student chooses one. Parts are numbered officially as `1.1.`, `1.2.`, … (2026) or `a)`, `b)`, `c)` (up to 2025). Before 2025 the exam had 6 *qüestions* (Q1–Q6).

The usual topic pattern is: Ex 1 analysis, Ex 2 algebra, Ex 3 probability (sometimes with an analysis part), Ex 4A analysis, Ex 4B geometry. **Always classify by content, not by number.**

### Which exams are included

| Session | Code | Sèrie used so far | `conv` label in EXERS |
|---|---|---|---|
| June, main series | `j` | Sèrie 1 | `Juny` |
| June, second series | `j2` | Sèrie 5 | `Juny (Sèrie 5)` |
| June, *incidències* exam | `i` | Sèrie 4/5 | `Juny (inc.)` |
| September | `s` | Sèrie 2/3 | `Setembre` |

In 2026 the project has `26j` (Sèrie 1), `26j2` (Sèrie 5) and `26s` (Sèrie 2). **Ask David which series of 2027 to include** if he has not said so. Default: whatever official PDFs he gives you.

### Exercise id

```
<cat>-<yy><session>-q<n>[option][parts]

cat      alg | geo | ana | pro
yy       27
session  j | j2 | i | s
n        exercise number (1..4)
option   a | b               (exercise 4, option A or B)
parts    optional suffix when one exercise is split between categories
```

Examples: `ana-27j-q1`, `alg-27j-q2`, `pro-27j-q3`, `ana-27j-q4a`, `geo-27j-q4b`, `ana-27s-q1`.

**Split exercise.** If an exercise mixes topics (for example probability in a) and b), analysis in c)), it may be split into two ids. Precedent: `pro-25s-q3ab` + `ana-25s-q3c`; both share the same `-e`/`-s` crop and each has its own hint. 2026 instead kept mixed exercises whole under the dominant topic (`pro-26j-q3` has a Bolzano part 3.3). **Ask David** which he prefers.

### EXERS entry (in `index.html`)

`EXERS` has four arrays: `algebra`, `geometria`, `analisi`, `probabilitat`. Add entries in chronological order (year, then June, June S5, September), next to the existing 2026 lines:

```js
  {id:'ana-27j-q1',   any:'2027', conv:'Juny',        ref:'q1',   titol:'f(x)=…: monotonia, asímptotes i recta tangent'},
```

- `ref` is the `q…` part of the id.
- `titol` is a short Catalan title describing the content (see existing lines for tone and length; Unicode maths symbols are fine: ², ℝ, π, λ, ≠).
- The year range and the counters in the menu are computed automatically from `EXERS`. No other place in `index.html` needs editing for exercises (the separate `DEMOS` object lists the step-by-step procedures of `procediments/`).

---

## 3. Getting the official PDFs

The official PDFs are published by the Generalitat de Catalunya (Departament de Recerca i Universitats, *Proves d'accés a la universitat: exàmens i pautes*), usually some weeks after each session. For each session you need:

- the **exam** PDF of the chosen series (*enunciats*);
- the **marking criteria / solutions** PDF (*pautes de correcció*, *criteris*).

The cloud sandbox may block outbound web access (in 2026 the proxy blocked many sites). **Ask David to upload the PDFs**: attached to the chat, or to `_uploads/` in a separate folder that is not a ZIP. Work on copies in your scratchpad. **Never commit the full official PDFs to the repository** (2026 precedent: a 14.5 MB compendium `Pautec.pdf` was removed from the root).

If the solutions come inside a big compendium of all subjects, find the right page range first, for example with `pdftotext -f N -l M` and a grep for `Matemàtiques`, `SÈRIE`, `Exercici 1`.

---

## 4. Cropping `-e.pdf` and `-s.pdf`

Tools available in the sandbox: `pypdf` (Python), `qpdf`, `pdftotext`, `pdftoppm`, `pdfinfo`. There is no PyMuPDF.

**Rules**

- `-e.pdf`: the pages of that exercise only, including its figure and any common introduction (for 4A/4B the shared header *«Trieu UNA de les dues opcions…»* is kept if it is on the same page). Drop the following page if it only contains answer space or the *«Espai per a la correcció»* grid.
- `-s.pdf`: the solution of that exercise **plus its «Criteris de correcció»** paragraph. These criteria are essential: the hints are calibrated against them.
- If two exercises share a page, keep the page and crop it vertically with `mediabox`/`cropbox`, never by editing content. Precedent: `geo-26s-q4b-e.pdf` page 1 is cropped to the common introduction.
- Name files exactly `data/<id>-e.pdf` and `data/<id>-s.pdf`.

**Snippet (pypdf)**

```python
from pypdf import PdfReader, PdfWriter
from pypdf.generic import RectangleObject

def crop(src, dst, pages, boxes=None):
    """pages: 0-based page indices.
    boxes: {index_in_output: (x0, y0, x1, y1)} in PDF points, origin at bottom left."""
    r, w = PdfReader(src), PdfWriter()
    for i in pages:
        w.add_page(r.pages[i])
    for k, b in (boxes or {}).items():
        w.pages[k].mediabox = RectangleObject(b)
        w.pages[k].cropbox = RectangleObject(b)
    with open(dst, 'wb') as f:
        w.write(f)

crop('exam.pdf',  'data/ana-27j-q1-e.pdf', [2])
crop('pauta.pdf', 'data/ana-27j-q1-s.pdf', [0, 1])
```

**Verify every crop visually**: `pdftoppm -r 70 -png data/<id>-e.pdf /tmp/x`, then look at the PNGs. Check that nothing is cut (figures, the point values `[x punts]`, the last line) and that nothing from the neighbouring exercise is included. In 2026 several earlier crops had to be redone for exactly these reasons.

---

## 5. Writing the hints (`pistes/src/<id>.tex`)

### File template

Copy the structure of a recent hint (`pistes/src/ana-26s-q1.tex`, `alg-26j-q2.tex`, `geo-26s-q4b.tex`):

```latex
% Pista ana-27j-q1 · Anàlisi
% Procedència: PAU Catalunya 2027 · Convocatòria de juny · Sèrie 1 · Exercici 1
\documentclass[11pt,a4paper]{article}
\usepackage{pista}
\pistainfo{Catalunya 2027}{Convocatòria de juny}{Sèrie 1}

\begin{document}

\section*{\textcolor{blauPista}{Exercici 1}}

\noindent <official statement, verbatim>

\subsection*{1.1. \normalfont <part statement, verbatim> \hfill\textnormal{[1~punt]}}

\pista{<hint for 1.1>}

\subsection*{1.2. \normalfont <…> \hfill\textnormal{[0,75~punts]}}

\pista{<hint for 1.2>}

\end{document}
```

- Exercise 4: `\section*{\textcolor{blauPista}{Exercici 4 --- Opció A}}`.
- Part labels: use the **official** ones (`1.1.` in 2026; `\textit{a)}` in older exams).
- Point values exactly as in the exam (`[1~punt]`, `[0,75~punts]`).
- Section names for `\pistainfo`: `Convocatòria de juny`, `Convocatòria de setembre`, `Convocatòria de juny (incidències)`.

### Statement text

- Copy it **verbatim** from the official PDF, including any final *Nota*, for example `\noindent\textit{Nota:} Recordeu que…`. In 2026 several statements were found paraphrased or summarised and had to be fixed.
- If the statement refers to a figure (*«tal com es mostra a la figura següent:»*), keep the official sentence and add the information needed from the figure on a separate line in italics:
  `\noindent\textit{(A la figura: …)}`.
  Describe only what the figure shows. Do not add deductions the pauta scores. Precedents: `ana-24s-q3`, `ana-25i-q4a`, `pro-26s-q3`.
- Notation: `pistes/ESTIL.md` §5 (decimal comma `2{,}5`, `16\,\%`, units `10\,\text{m}`, `\euro`, vectors `\vec{}`, systems with `\left.\begin{array}{r}…\end{array}\right\}`, augmented matrix `A^{'}`).

### Hint content

Follow `pistes/ESTIL.md`, the single source of truth for hint content. It was rewritten on 2026-10-24 and replaces the list of lessons that used to be here (October 2026 review). Its reference set (ESTIL §7.7) gives approved examples to imitate. Hints for a new session are drafts until David approves them on the review page (ESTIL §8).

### Build and check

```bash
bash .devcontainer/install-latex.sh          # once per session (idempotent)
python3 pistes/build.py --png /tmp/png ana-27j-q1 alg-27j-q2 ...
```

- The build must print `OK` for every hint, with no `(avís: …)`.
- **Look at every PNG**: one page, nothing overflowing, formulas not split.
- Solve every exercise yourself and check every claim in the hint against `data/<id>-s.pdf`. In 2026 an AI-written hint (`ana-26s-q4a`) had a factual error about the figure; another (`alg-26s-q2`) chose a variable that was fixed.

---

## 6. Other files to update

1. **`index.html`**: one `EXERS` entry per new id (§2).
2. **`pistes/REVISIO.md`**: one row per new hint in the right category table, with lot `—` or a new lot code, origin like `2027 juny S1 Ex 1`, `Font = IA`, `Autor = IA`, `Estat = pendent`, notes `pista nova (juny 2027)`. Update the total in the first line («Seguiment de la revisió de les N pistes»).
3. **`CLAUDE.md`**: update the exercise count («amb N exercicis de PAU»).
4. **`config.js`**: `VIDEOS` maps ids to YouTube video IDs. David collects them from the channel «Matemàtiques amb Bogdan» (youtube.com/@matematiquesambbogdan394). **Never guess or reconstruct a video ID**: ask David to paste the URLs as text and copy them exactly (2026 lesson). `OPTATIUS` lists optional exercises; touch it only if David asks. `ETIQUETES` feeds the search box on the home page (it already searches title, year, session and id, and tolerates typos):  add an entry `id: {nota, mots}` for every new exercise that uses a topic its statement does not name. Official statements almost never say «Bolzano» («Justifiqueu que té una solució a l'interval…»); the official solution (`-s.pdf`) does, so `grep -il bolzano` on the text of the new `-s.pdf` files finds them. `nota` is shown under the title (e.g. «Teorema de Bolzano · apartat a)»); `mots` is searched only.
5. **Do not touch** `-e`/`-s` of old exams, `pista.sty` or `build.py` unless needed.

---

## 7. Review by David

AI-written hints are drafts until David approves them. Present the new hints to him exercise by exercise: PNG images plus a short list of what you are unsure about. Apply his decisions, rebuild, and update `REVISIO.md`: `Estat = fet`, a note of what changed, and «(text del David)» when he rewrote a sentence. If he says a hint is his own («meva»), set `Autor = David`; from then on only errors may be corrected.

Interpretation conventions learned in 2026:
- In his comments, «…» or «[…]» means «keep the rest of your proposal».
- Apply clear comments directly and say in a note how you applied them. Ask only when a comment is genuinely ambiguous.
- If his text contains an obvious slip (for example «eix d'ordenades» where it must be «eix d'abscisses»), fix it and tell him.

---

## 8. Publishing

### Option A: you have push access (cloud session)

1. Work on a branch, never directly on `main`. Compile the hints yourself before committing: the Action only runs on `main`.
2. Commit the new `data/*.pdf`, `pistes/src/*.tex`, `index.html`, `REVISIO.md`, `CLAUDE.md` and `config.js`, with a Catalan commit message.
3. When David says so, open a PR and merge it (merge commit). Then check that the workflows *pages build and deployment* and *Compila les pistes* succeeded. *Compila les pistes* should not create a new commit: if it does, your local PDFs were not up to date.

### Option B: David uploads a ZIP

Build a ZIP with repository-relative paths, without the official full PDFs:

```
data/ana-27j-q1-e.pdf
data/ana-27j-q1-p.pdf
data/ana-27j-q1-s.pdf
…
pistes/src/ana-27j-q1.tex
…
index.html
pistes/REVISIO.md
CLAUDE.md
```

```bash
cd <repo> && zip -r /path/pau-2027-juny.zip data/*-27j* pistes/src/*-27j*.tex index.html pistes/REVISIO.md CLAUDE.md
unzip -l /path/pau-2027-juny.zip      # check the paths before sending it
```

Tell David, in Catalan, step by step: open the repository on GitHub → folder `_uploads` → *Add file → Upload files* → drop the ZIP → *Commit changes*. Then wait 1–2 minutes and check the *Actions* tab for green ticks.

**Commits made by a GitHub Action do not trigger other workflows.** The unzip workflow commits the files with the Actions token, so *Compila les pistes* would not run by itself after it. Since 2026-10-18 the unzip workflow **launches it explicitly** when the ZIP touches `pistes/src/`, `pistes/build.py` or `.devcontainer/install-latex.sh`. Still, include the **compiled** `data/*-p.pdf` in the ZIP (build them in the sandbox), so the site is right before the rebuild finishes. The bot's commits are published like any other: on 2026-10-18 *pages-build-deployment* ran (green) for the bot's commit, and Cloudflare Pages publishes every push to `main`.

Browsers may cache old PDFs: tell him to reload with Ctrl+Shift+R.

Repository settings this relies on: **Settings → Pages → Deploy from a branch → `main` / `(root)`**, and **Settings → Actions → General → Workflow permissions → Read and write**.

---

## 9. Final checks before telling David it is done

```bash
python3 - <<'EOF'
import re, os
h = open('index.html', encoding='utf-8').read()
ids = set(re.findall(r"id:'((?:ana|alg|geo|pro)-[0-9a-z]+-q[0-9a-z]+)'", h))
trio = {f[:-6] for f in os.listdir('data') if f.endswith(('-e.pdf', '-p.pdf', '-s.pdf'))}
print('EXERS:', len(ids), '| ids in data:', len(trio))
print('missing PDFs:', sorted(i for i in ids if not all(os.path.exists(f'data/{i}-{k}.pdf') for k in 'eps')))
print('PDFs not in EXERS:', sorted(trio - ids))
print('.tex not in EXERS:', sorted({f[:-4] for f in os.listdir('pistes/src') if f.endswith('.tex')} - ids))
EOF
python3 pistes/build.py              # all hints: every line OK, no warnings
git status --short                   # only the files you meant to change
grep -l '``' pistes/src/*.tex        # must print nothing
grep -n 'dóna\|vés ' pistes/src/*.tex   # must print nothing
```

Then give David a short summary in Catalan:
- which exercises were added;
- which hints are drafts waiting for his review;
- anything you were unsure about, for example a crop, a series or a split exercise.
