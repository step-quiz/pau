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
- La puntuació de l'apartat va al final del seu enunciat amb `\hspace*{\fill}\textnormal{[0,75~punts]}`, no amb `\hfill`: si la puntuació passa a la línia següent, `\hfill` desapareix a principi de línia i la puntuació queda a l'esquerra (aprovat el 16/10/2026).

## 4. Llengua

- **Persona verbal:** segona persona del singular («Calcula», «Fixa't»).
- **Cometes:** cometes baixes «…». Les ``` ``…'' ``` i les `"…"` rectes es canvien a «…» quan es revisa cada pista.
- **Formes a evitar:** «anem a + infinitiu» per a futur (→ «obtindrem»), «donat que» (→ «atès que», «com que»), «en base a» (→ «a partir de»).
- **Referències a apartats:** «l'apartat *a)*».
- **Apòstrof davant de símbols:** segons com es llegeix el nom de la lletra (aprovat el 16/10/2026). S'apostrofa si el nom comença amb so vocàlic: d'$A$, d'$e$, d'$f$ (efa), d'$h$ (hac), d'$l$ (ela), d'$m$ (ema), d'$n$ (ena), d'$r$ (erra), d'$s$ (essa), d'$x$ (ics), d'$y$ (i grega), d'$\alpha$. No s'apostrofa si comença amb consonant: de $B$, de $k$ (ca), de $p$ (pe), de $t$ (te), de $\lambda$, de $\pi$.

## 5. Notació

- Vectors: `\vec{PQ}`, `\vec{n}`. Producte vectorial: `\times`. Producte escalar: `\cdot`.
- Decimals amb coma: `2{,}5`. Percentatges: `16\,\%`. Unitats amb espai fi: `10\,\text{m}`, `2{,}5\,\euro/\text{m}`.
- Matrius amb `pmatrix`. Sistemes d'equacions amb `\left.\begin{array}{r} … \end{array}\right\}`.

## 6. Llargada

- Orientativa: de 2 a 6 línies per apartat. Si una pista necessita més espai, probablement està resolent l'exercici.

## 7. Format estructurat (aprovat el 16/10/2026; aplicat a tots els blocs)

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
  - *Distància d'un punt a un pla* (geometria): la fórmula en una línia a part, $d(P, \pi) = \dfrac{|Ax_{0} + By_{0} + Cz_{0} + D|}{\sqrt{A^{2} + B^{2} + C^{2}}}$. Si el pla ve amb el terme independent a l'altre costat de la igualtat, en paràgraf propi «\textbf{Atenció:} la fórmula demana el pla en la forma $Ax + By + Cz + D = 0$»; si ja surt en aquesta forma d'un pas anterior, no cal. Si l'exercici ja fa servir $A$, $B$, $C$ per a punts, els coeficients van en minúscula ($ax + by + cz + d$).
  - *Perpendicular comuna* (geometria): rètols \textit{Direcció.} ($\vec{v}_{1} \times \vec{v}_{2}$) i \textit{Un punt.}; punts genèrics de cada recta amb paràmetres diferents i les dues condicions $\overrightarrow{P_{1} P_{2}} \cdot \vec{v}_{1} = 0$, $\overrightarrow{P_{1} P_{2}} \cdot \vec{v}_{2} = 0$ en una línia a part.
  - *Pla paral·lel a una distància donada* (geometria): sempre la mateixa llista: la forma del pla paral·lel ($\ldots + D' = 0$); la condició de distància dona un valor absolut amb dues solucions; una és el pla que ja tens i l'altra, la que et convé.
  - *Optimització* (anàlisi): «És un problema d'optimització.» i sempre la mateixa llista amb rètols en cursiva: \textit{Variables} (i dibuix), \textit{Condició} (per quedar-se amb una sola variable), \textit{Funció a optimitzar}, \textit{Optimitza} (derivar, igualar a zero, comprovar que és màxim o mínim). El domini amb sentit i «respon totes les parts de la pregunta» van en un paràgraf \textbf{Atenció:} propi. Cada rètol és per a un pas que es fa en aquell apartat: si un pas ja és fet (a l'enunciat o en un apartat anterior) o no cal, se'n treu el rètol. Si la funció ja està construïda, o si l'apartat repeteix el procés de l'anterior amb una dada nova, la llista va sense rètols. Si la funció es construeix per parts (per exemple, l'àrea de dues figures), cada part pot tenir el seu rètol abans de \textit{Funció a optimitzar} (`ana-26j-q4a`: \textit{El cercle.} i \textit{El quadrat.}).
  - *Àrea entre corbes* (anàlisi; mètode del David): els límits d'integració són punts de tall (entre les corbes, de la corba amb l'eix, de la corba amb una recta…) o les rectes verticals que limiten la regió, i l'àrea és el valor absolut de la integral de la diferència, en una línia a part: $\text{Àrea} = \left| \int_{x_{1}}^{x_{2}} \bigl(f(x) - g(x)\bigr)\,dx \right|$. **Mai no es demana decidir quina corba queda per sobre.** Si hi ha més de dos punts de tall, un valor absolut per a cada interval entre punts de tall consecutius, i se sumen.
  - *Recta tangent* (anàlisi): la fórmula $y - f(a) = f'(a)\,(x - a)$ sempre en una línia a part, ja amb el punt de l'exercici (amb $a < 0$, escriure $(x + |a|)$, mai $(x - -2)$).
  - *Bolzano* (anàlisi): la funció auxiliar $g(x) = f(x) - k$ en una línia a part; continuïtat; signes als extrems.
  - *Estudi d'una funció* (anàlisi; passos del David), sempre en aquest ordre i amb aquests noms:
    1. \textit{Domini i asímptotes verticals.}
    2. \textit{Límits a l'infinit} ($+\infty$, $-\infty$ o un nombre real, que dona una asímptota horitzontal; també hi pot haver asímptota obliqua).
    3. \textit{Talls amb els eixos.}
    4. \textit{Creixement, decreixement i extrems relatius.}
    5. \textit{Concavitat i punts d'inflexió.}
    6. \textit{Taula de valors} (opcional).
    7. \textit{Esbós de la gràfica.}

    Si l'apartat demana l'esbós, la llista sencera numerada (`enumerate`), amb «Ho tens de l'apartat…» per als passos ja fets. Si només en demana una part (per exemple, domini i talls), només aquests passos, en el mateix ordre i amb els mateixos noms; si demana el domini però no les asímptotes, el primer rètol és només \textit{Domini.} Excepcions: l'esbós d'una funció a trossos senzilla (`ana-26j-q1`), on n'hi ha prou de dibuixar cada tros al seu interval, i la representació de paràboles i rectes (`ana-23j2-q1`), on n'hi ha prou amb el vèrtex i els talls amb els eixos.
  - *Condicions → equacions* (trobar paràmetres): una condició de l'enunciat per punt de la llista.
  - *Apartats amb diverses parts*: cada part amb un rètol en cursiva acabat en punt, no en dos punts (\textit{Discutir.}, \textit{Resoldre per a $k = 0$.}).
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
