# Artifact «Simplificar passos — Gràfica d'una funció»

> For a cold-start Claude session. David speaks Catalan; answer him in Catalan.

## What it is

A review artifact (https://claude.ai/artifact/2skeCnkr7D4DrNftvdvvDa, private, `capabilities: {db: {}}`) where David decided which
groups of steps of `grafica-funcio.js` become one step. Three tabs: **Propostes** (proposals E1…I1 from `propostes.js`, buttons
«Sí, fes-ho / No / Més endavant / En parlem» + comment), **Pas a pas** (every step of the 9 examples, only the board rows that
change, per-step «Mantén / Elimina / Fusiona amb l'anterior», scope «Només aquí / A tots els passos iguals», new caption,
comment) and **Resum** (steps now vs. estimated). Everything autosaves.

## Database

- `propostes/<id>`: `{id, titol, decisio: 'si'|'no'|'tard'|'parla'|'', comentari, quan, nota}`.
- `passos/<exemple>~<pas>` (1-based step): `{exemple, pas, original, pl (caption template), proposta, decisio: 'mante'|'elimina'|'fusiona'|'',
  abast: 'aqui'|'tot', frase, comentari, quan, nota}`.
- `nota` is Claude's reply, shown in green. Read with `db_list`, answer with `db_write` (`update`, pinned with `ifVersion`).

## State (21/11/2026)

David approved E1, E2, L1, L3, V1, S1, S2, D2, I1; rejected E3, L2, S3, D1; E4 «En parlem: no fusionis» (kept as is).
Applied in `grafica-funcio.js` (`GRUPS`, `simplifica`, `fraseDelGrup`; E1+E2 → group `E`, L1+L3 → group `L`). The artifact's data
are the steps **before** this change; rebuild it if David wants a second round on the new steps.

## Rebuild

```bash
npm pack katex@0.16.9 && tar xzf katex-0.16.9.tgz
node procediments/frases/simplifica-passos/genera.js package/dist /tmp/out
( echo '<!DOCTYPE html><html lang="ca"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">'; cat /tmp/out/index.html; echo '</html>' ) > /tmp/out/pub.html
```
Publish `/tmp/out/pub.html` as `index.html` (publish_files, same slug); the db documents survive. For a new round, write new
proposals in `propostes.js` (regexes on captions; `inici` starts a new group; `ambAnterior`, `elimina`).
