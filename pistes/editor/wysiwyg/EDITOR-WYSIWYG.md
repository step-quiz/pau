# Artifact «Pistes PAU WYSIWYG» (WYSIWYG hint editor)

> **Who this is for.** A Claude session that has to read David's hint edits, apply them to `pistes/src/*.tex`, or rebuild
> the artifact. David (the teacher) speaks **Catalan**: always answer him in Catalan. State on **30 October 2026**.

## 1. What it is

A private claude.ai artifact that reproduces the PROBLEMES part of the site (categories → year list → exercise with the
tabs Enunciat / Pistes / Solució). The **Pistes** tab shows the hint PDF as HTML (KaTeX), and every blue hint box is
**editable in place** (WYSIWYG). The statement text, the official statement and the official solution are read-only.
DEMO is not included.

- **Artifact:** https://claude.ai/artifact/NbC7X31Xn8upUL32BoSaMZ (the Claude conversation must belong to the same account).
- **Capabilities:** `{db: {}}` (default rules: the owner reads and writes). Collections: **`canvis`** and **`revisades`**.
- Built from this folder: `genera-wysiwyg.js` (data + page), `plantilla-wysiwyg.html` (the page), `tex-core.js`
  (LaTeX ⇄ editable HTML), `genera-imatges.py` (statement and solution PNGs).
- The older raw-LaTeX editor (`../EDITOR-PISTES-PAU.md`) still exists; this one replaces it for David's day-to-day work.

## 2. How David uses it

- Click in a blue box and type; changes save by themselves 0.7 s after the last keystroke. **Enter** = new paragraph
  (`\n\n\medskip\n`); **Shift+Enter** = line break (`\\[\smallskipamount]`); **Ctrl+B / Ctrl+I** = `\textbf` / `\textit`.
- Click a formula to edit its LaTeX (live KaTeX preview, brace and `$` checks, «en una línia a part» toggles `$…$` ⇄ `\[…\]`).
  **`$`** or **Ctrl+M** inserts a new formula (the selected text becomes its source). Typing `$x^2$` as text also works: it is
  turned into a formula when the box loses focus.
- Per hint: **Codi LaTeX** (raw source, for structural changes such as `itemize`), **Comentari** (a note for Claude, not
  part of the hint), **Torna a l'original**, **✓ Correcta** (marks the hint as reviewed; a modified hint counts as reviewed).
- Progress: «Revisades X de N» per exercise with **Següent per revisar ↓** (next unreviewed hint, then the next exercise in
  site order), «falten N» / «✓ revisat» in the list, per category and in the bottom bar.
- **Frases repetides entre pistes** (from the home page): sentences that appear in more than one hint, grouped with their
  inline formulas masked as `$·$`. **Canvia a tot arreu** rewrites the sentence once; each hint keeps its own formulas.
- **Copia tots els canvis** copies the pending changes as text (format in §4), to paste into the conversation. David can
  also just say «llegeix els canvis»: read the database (§5).

## 3. The data model

`canvis/<id>_<index>` (index = 0-based position of the `\pista{…}` block in the file):

| field | meaning |
|---|---|
| `id`, `idx` | exercise id (`ana-24j-q5`) and hint index |
| `text` | the whole new content of `\pista{…}` (LaTeX, without the outer braces) |
| `com` | David's comment for Claude (may be empty) |
| `estat` | `'pendent'` (written by the page on every edit) or `'fet'` (set by Claude) |
| `nota` | Claude's reply, shown in green under the hint («Claude: …»); may contain `$…$` |
| `quan` | ISO time of the last save |

A hint whose text is back to the original and has no comment has no document. `revisades/<id>_<index>` =
`{id, idx, quan}`: the hint was marked correct.

## 4. The copied text

```
CANVIS A LES PISTES PAU — 21 pistes — 30/10/2026 09:43
Format: …
### ana-24j-q5 · pista 2 de 2 · apartat b)
<<<
…whole new content of \pista{…}…
>>>
COMENTARI: …            (only if there is one)
```

«pista N» is 1-based (index = N − 1). Only `estat: 'pendent'` changes are copied.

## 5. Procedure for Claude: applying a batch

1. Get the changes: the pasted text, or `ArtifactData list` of `canvis` (load `ArtifactData` with ToolSearch).
2. Word-diff each hint against `pistes/src/<id>.tex` to see what really changed (a script that splits `\pista{…}` with brace
   matching, as `genera-wysiwyg.js` does). Look for: mathematical errors, the same sentence left in two wordings in different
   hints (the repeated-sentences view groups `d'$m$` and `de $k$` separately, so a change can reach only part of them),
   old wordings that remain in other hints, `ESTIL.md` rules. David's words are final (`ESTIL.md` §1.6): ask him with
   options before deviating.
3. Replace the hint contents, compile (`python3 pistes/build.py --png <dir> <ids>`; every hint must stay on one page), add
   «rev. AAAA-MM-DD (editor WYSIWYG)» notes to `pistes/REVISIO.md`, and give David the ZIP (repo-root paths).
4. Rebuild and republish the artifact (§6) so that its originals are the new `.tex`. Then, with one `ArtifactData batch`
   pinned with the versions read in step 1, set each applied document to `{text: <final text>, com: '', estat: 'fet',
   nota: '<what was done>'}`: the hint then looks unmodified (its text equals the new original) and shows the green note.
   Add `revisades` documents for the hints David edited. Never delete a `pendent` document without asking.
5. Later, delete old `fet` documents (`batch` of pinned `delete`s) when they are no longer useful.

## 6. Rebuild and republish

```bash
# KaTeX 0.16.x dist (npm pack katex@0.16.9 && tar xzf katex-0.16.9.tgz → package/dist, or any local copy)
node pistes/editor/wysiwyg/genera-wysiwyg.js . <katex>/dist pistes/editor/wysiwyg/plantilla-wysiwyg.html pistes/editor/wysiwyg/tex-core.js <out>
# → «67 exercicis, 165 pistes, … fórmules de pistes OK»; stops if a hint does not round-trip or KaTeX fails
python3 pistes/editor/wysiwyg/genera-imatges.py pistes/editor/genera-enunciats.py data <out>/img   # only for new PDFs
```

Publish `<out>/index.html` with `url` = the artifact, no `icon`, no `capabilities` (kept). Pass the PNGs in `files`
(`root` = `<out>`) only when they are new or changed. The page loads KaTeX 0.16.9 JS from cdnjs; its CSS (with the woff2
fonts as `data:` URIs) is inlined by the generator, because an artifact can load stylesheets only from Google Fonts.

## 7. How the WYSIWYG works (`tex-core.js`)

- `tok(s)` splits the hint source into tokens that each keep their exact source: text, `$…$` (and `\mbox{$…$}`), `\[…\]`,
  blank lines, `\medskip`, `itemize`/`\item`, `\textit{…}`/`\textbf{…}` (with editable content), other commands.
  `join(tok(s)) === s` for every hint.
- `html(tokens)`: text is editable; formulas and structure marks are atoms (`contenteditable=false`, `data-src` = exact source).
- `ser(node)` walks the edited DOM back to LaTeX: text nodes (with `%`, `&`, `#` escaped and zero-width spaces removed),
  atoms by `data-src`, `<b>`/`<i>` as `\textbf`/`\textit`.
- So an untouched hint serialises to exactly the original: a test (Playwright) opens every exercise and checks
  `ser(hint) === original` for all 165 hints. Run it after any change to `tex-core.js` or the template.
