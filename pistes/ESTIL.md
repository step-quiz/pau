# Guia d'estil de les pistes

Criteris per revisar i escriure les pistes (`pistes/src/<id>.tex`). Decisions aprovades pel David el 2026-10-09.

## 1. Principis

1. **Intervenció mínima.** Si una pista ja funciona, no es reescriu. A les pistes escrites pel David (columna *Autor* de `REVISIO.md`) només es corregeixen errors 🔴, llevat que ell demani una altra cosa.
2. **Una pista orienta, no resol.** Diu *què* cal fer i *per què*, i assenyala el pas on és fàcil equivocar-se. No dona resultats numèrics intermedis ni finals.
3. **Coherència amb la pauta oficial** (`data/<id>-s.pdf`). La pista porta cap a un mètode que la pauta accepta i no se salta passos que la pauta puntua per separat.
4. **Fidelitat a l'enunciat.** L'enunciat que es reprodueix al PDF de la pista és el de la PAU i no es modifica.

## 2. Classificació de les propostes de revisió

| Marca | Tipus | Exemples |
|---|---|---|
| 🔴 | Error | Matemàtic (un vector mal escrit, un signe), tipogràfic, una pista que porta a un camí equivocat |
| 🟠 | Pedagògic | La pista revela massa, és massa vaga o no lliga amb el mètode de la pauta |
| 🟡 | Llengua i estil | Castellanismes, persona verbal, cometes, coherència de notació |

## 3. Format (ja implementat a `pista.sty`)

- Una caixa `\pista{...}` per apartat, just després de l'enunciat de l'apartat.
- Capçalera uniforme: *PAU de Matemàtiques — Pistes* · *Catalunya AAAA · Convocatòria · Sèrie*.
- Sense número de pàgina. Cada pista ocupa una sola pàgina.

## 4. Llengua

- **Persona verbal:** segona persona del singular («Calcula», «Fixa't»).
- **Cometes:** cometes baixes «…». Les ``` ``…'' ``` i les `"…"` rectes es canvien a «…» quan es revisa cada pista.
- **Formes a evitar:** «anem a + infinitiu» per a futur (→ «obtindrem»), «donat que» (→ «atès que», «com que»), «en base a» (→ «a partir de»).
- **Referències a apartats:** «l'apartat *a)*».

## 5. Notació

- Vectors: `\vec{PQ}`, `\vec{n}`. Producte vectorial: `\times`. Producte escalar: `\cdot`.
- Decimals amb coma: `2{,}5`. Percentatges: `16\,\%`. Unitats amb espai fi: `10\,\text{m}`, `2{,}5\,\euro/\text{m}`.
- Matrius amb `pmatrix`. Sistemes d'equacions amb `\left.\begin{array}{r} … \end{array}\right\}`.

## 6. Llargada

- Orientativa: de 2 a 6 línies per apartat. Si una pista necessita més espai, probablement està resolent l'exercici.

## 7. Format estructurat (aprovat el 16/10/2026; aplicat a probabilitat i àlgebra)

Paràgrafs llargs no: més estructura i més canvis de línia. Des del 16/10/2026, `pista.sty` posa el text amb `\color`, i dins de `\pista{…}` es poden fer servir línies en blanc, `\medskip`, `\bigskip` i `itemize`.

- Una **primera frase curta** amb la idea clau de l'apartat.
- Els **passos en una llista** (`itemize`), un pas per punt i frases curtes.
- Les **fórmules clau en una línia a part**: `\[ … \]`.
- L'avís, en un **paràgraf propi**: línia en blanc, `\medskip` i `\textbf{Atenció:}` en negreta.
- **Línies en blanc** entre blocs (amb `\medskip` si cal més aire).
- Patrons fixos per als apartats que es repeteixen:
  - *Probabilitat total*: «Fes un diagrama d'arbre. Hi ha dos camins que porten a…» i els dos camins en llista.
  - *Bayes*: «És un cas clar del teorema de Bayes…», anomenar els esdeveniments i dir en llista què coneixes ($P(\ldots \mid \ldots)$) i què et demanen.
  - *Binomial*: definir $X$ (què compta i $X \sim B(n, p)$) i escriure la probabilitat demanada en una línia a part.
  - *Discussió d'un sistema* (àlgebra): «Discuteix el sistema amb el teorema de Rouché-Frobenius:» i sempre la mateixa llista: escriu $A$ i $A^{'}$; calcula $\det(A)$ i els valors que l'anul·len; compara rangs per a cada valor; no oblidis $\det(A) \neq 0$.
  - *Apartats amb diverses parts*: cada part amb un rètol en cursiva (\textit{Discutir.}, \textit{Resoldre per a $k = 0$.}).
  - Les dreceres, en paràgraf propi amb \textbf{Drecera:} o \textbf{Consell:}; els paranys, amb \textbf{Atenció:}.
- Cada pista continua cabent en **una sola pàgina** (comprovar-ho en compilar).

## 8. Format de resposta del David a les propostes

Una línia per apartat (o per exercici sencer):

```
geo-25j-q4b.a  ok
geo-24j-q6.b   no
geo-24s-q6.c   ok, però més curta i sense donar la fórmula
geo-23s-q5     reescriu-la: que primer pensin en el vector perpendicular comú
geo-24i-q6     meva
```

`meva` vol dir que la pista és del David: es marca *Autor = David* i només s'hi corregeixen errors.
