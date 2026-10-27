# Artifact «Frases dels procediments» (caption editor)

> **Who this is for.** A Claude session that has to apply David's caption changes to the DEMO pages of `procediments/`,
> or rebuild the artifact. David (the teacher) speaks **Catalan**: always answer him in Catalan. State on **27 October 2026**.

## 1. What it is

A private claude.ai artifact where David reads **every step of every example of every DEMO page** (30 pages, ~3 150 steps),
each with its board, and writes how the caption («Opera el costat de la dreta.») should read. Captions are Catalan text with
`$…$` LaTeX, exactly as in the procedure code, so he can change the maths too.

- **Artifact:** https://claude.ai/artifact/5SZx72Lq398xzPYuV2FEmh (private: only the owner; the Claude conversation must belong
  to the same account).
- **Capabilities:** `{db: {}}` (default rules: the owner reads and writes). Changes live in the collection **`canvis`**.
- Built from this folder: `genera-editor-frases.js` (data + page) and `plantilla-editor-frases.html` (the page).

## 2. How David uses it

Three tabs:
1. **Per pàgina**: list of pages on the left (a select on phones), the examples as chips, then a card per step: «Pas n de N»,
   the caption, and the board of that step (rows that changed since the previous step have a yellow mark on the left;
   «Amaga les pissarres» hides the boards). There is also a card for the example's **statement** and one for a
   **comment about the whole page**.
2. **Totes les frases**: every distinct caption *template* once (captions with the same text once the formulas and numbers are
   removed: about 800), with how many times and on which pages it appears; search (text or LaTeX), «Les més repetides primer»,
   «Només les que tenen canvis». «Mostra on surt» jumps to the first occurrence.
3. **Canvis**: the saved changes (pending / done / all), «Mostra-la a la pàgina», «Esborra» (with undo), and **Copia la llista**,
   a plain-text list to paste into the chat (fallback when the database is unavailable; then changes are kept only in that
   browser's localStorage and the page says so).

Clicking a caption (or «Canvia») opens the editor: the caption source (monospace), a live KaTeX preview with LaTeX errors and
unpaired `$`, the **scope** («A tot arreu on surt aquesta frase (N vegades)» — default — or «Només aquí»), a free **Comentari**
(for board changes, order of steps, anything) and **Tanca** (also Esc or Ctrl+Enter).

**Everything is saved automatically** (decision of 27/10/2026, after David lost a change he forgot to save): 0.7 s after the last
keystroke or scope change, and at once before anything that would remove an open editor (closing it, changing page, example or
tab, hiding or leaving the page). The status next to «Tanca» says «Es desa sol mentre escrius» → «Desant…» → «Desat» (or the error).
Writes to one document are queued (one at a time, always the latest text). Bringing the caption back to the original with an empty
comment deletes the document; «Esborra el canvi» deletes it too (with «Desfés» in the notice). Do not bring back a «Desa» button.

## 3. The data model (collection `canvis`)

One document per changed place. Id: `<page>~<example index>~<step number>` (step numbers start at 1, as on screen),
`<page>~<example index>~enunciat`, or `<page>~pagina` for a page comment. Fields:

| field | meaning |
|---|---|
| `tipus` | `'frase'` (a step caption), `'enunciat'` (the statement) or `'pagina'` (comment about the page) |
| `pagina`, `titol`, `categoria` | page file id (`sistema-sci`), its title, its category |
| `exemple`, `modeExemple`, `nomExemple`, `nomTex`, `adreca` | example index (0-based, order of `P.exemples`, then modes), its mode, its name (TeX if `nomTex`), its address (`?…` of the page) |
| `pas`, `total` | step number (1-based) and number of steps |
| `original` | the caption as the artifact showed it |
| `nou` | the new caption (`''` when only a comment) |
| `comentari` | David's comment (may contain `$…$`) |
| `abast` | `'tot'` = change the code that writes this caption, everywhere it appears; `'aqui'` = only this step |
| `plantilla`, `vegades` | the template key (`F:` caption / `E:` statement, formulas → `$·$`, numbers → `#`) and how many places share it |
| `estat` | `'pendent'` or `'fet'` (set by Claude) |
| `nota` | optional reply from Claude, shown under the change in green («Claude: …») |
| `quan` | ISO time of David's last save |

## 4. Procedures (for Claude)

Load the tools first: `Artifact` and `ArtifactData` (deferred: `ToolSearch` with `select:ArtifactData`).

**A. Read David's changes**
1. `ArtifactData list` on `canvis` (add `out_dir` if there are many). Every document is a request.
2. For each one, find the code: search the procedure file for a fixed piece of `original` (e.g. `grep -n "costat de la dreta" procediments/*.js`).
   With `abast: 'tot'`, change that line (all its occurrences follow). With `'aqui'`, the change applies to one step only: find
   the condition that distinguishes it, or ask David if there is none. Read `comentari` too: it can ask for board changes.
   Apply the house rules (`INSIGHTS.md` §3, §7): David's wording is the target, but keep `$…$` valid and the checker happy.
3. Run `KATEX=<katex 0.16.9>/dist node procediments/proves/comprova.js` (must end «Tot correcte»; the KaTeX section must not
   say «NO COMPROVAT»), the mutation scripts of the touched pages, and their browser tests.
4. Mark each applied change as done with one `ArtifactData batch` of `update` entries `{estat: 'fet', nota: '…'}`, each pinned
   with the `version` read in step 1 (if David edited one meanwhile, the pin fails: re-read it, it is a new request).
5. **Regenerate and republish** the artifact (B), so the captions it shows are the new ones.
6. Give David the ZIP (repo-root paths) and the commit message, as usual.
7. When David confirms the commit is on GitHub, delete the `fet` documents (`batch` of pinned `delete`s) so the list stays short.
   Never delete a `pendent` one without asking him.

**B. Rebuild and republish** (after any change to the procedures, so the artifact shows what the site shows)
```bash
npm pack katex@0.16.9 && tar xzf katex-0.16.9.tgz          # → package/dist (any folder; not in the repo)
node procediments/frases/genera-editor-frases.js package/dist <out>
# → «30 pàgines, 3148 passos, … fórmules comprovades» and <out>/index.html + <out>/frases.json
```
The generator stops if KaTeX cannot render any formula (the pages would show it in red). Publish with `Artifact`:
`file_path: <out>/index.html`, `files: {"frases.json": {from: "<out>/frases.json", contentType: "application/json"}}`,
`url: https://claude.ai/artifact/5SZx72Lq398xzPYuV2FEmh` (from another conversation, after an `Artifact read` of it), and **no**
`icon` and **no** `capabilities` (both are kept). The documents in `canvis` survive a republish. A document whose step no longer
exists (examples or steps changed) still appears in «Canvis», without «Mostra-la a la pàgina».

**C. Change the interface**
Edit `plantilla-editor-frases.html` (all the logic is in its final `<script>`; the marker `/*__KATEX_CSS__*/` receives the KaTeX
CSS with the woff2 fonts as `data:` URIs, because an artifact can load stylesheets only from Google Fonts), rebuild (B), test,
publish, and deliver the template in the ZIP.

## 5. Notes and traps

- The page is a plain HTML fragment (no `<html>`/`<head>`): the artifact host wraps it. KaTeX 0.16.9 JS from cdnjs (the same
  version as the site). Libre Baskerville and Source Code Pro from Google Fonts.
- Boards are drawn lazily (IntersectionObserver) and always on a light «paper», as on the site; keys (`\htmlData`) are removed
  and their marks become `\colorbox` backgrounds; text rows lose their `{{key|mark|…}}` wrappers; sketches are the same SVG.
- Example indices follow `P.exemples` and then each mode (`P.modes`), skipping invalid ones, exactly like the checker's
  «regles generals» loop. If the examples of a page change, old ids may point to another step: trust `original` and `adreca`.
- Local test (Playwright, routes cdnjs/Google Fonts; no database → localStorage mode): see the session notes; the important checks
  are no `.katex-error`, the editor saving with Ctrl+Enter, «canvi general» on other examples, «Copia la llista», phone width
  without horizontal scroll.
