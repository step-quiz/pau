# Revisió de les pistes

Seguiment de la revisió de les 67 pistes (`data/<id>-p.pdf`). Font de cada pista: `pistes/src/<id>.tex`.

**Font**: A = extreta dels antics ZIP per examen · B = reconstruïda a partir del PDF (no hi havia font LaTeX) · IA = escrita de nou per la IA.  
**Autor**: `David` (escrita a mà pel professor: només es corregeixen errors) · `IA` · `?` (per confirmar).  
**Estat**: `pendent` → `proposta` (la IA ha proposat canvis) → `fet` (revisada; amb o sense canvis).

**Revisió del 16/10/2026** (Claude, totes les propostes aprovades pel David): 67 pistes contrastades amb l'enunciat i la pauta; 66 pistes de 43 exercicis amb canvis (indicats amb «rev. 16/10/2026» a les notes). Els canvis es copien des de l'editor de pistes (`pistes/editor/`). El mateix dia, `pista.sty` passa de `\textcolor{…}{#1}` a `\color`, perquè dins de `\pista{…}` es puguin fer servir línies en blanc, `\medskip`, `\bigskip` i `itemize` (les 67 pistes surten idèntiques). Format més estructurat (ESTIL §7): aplicat al bloc de probabilitat; pendent als altres blocs.


## Geometria (11)

| Lot | ID | Procedència | Font | Autor | Estat | Notes |
|---|---|---|---|---|---|---|
| G1 | `geo-23j-q6` | 2023 juny S1 Q6 | A | ? | fet | a) frase de $D$ més clara; b) «està continguda»; c) mètode de la pauta (tallar $r$ amb $\pi_3$, i per què equival a $\vec{PQ}\cdot\vec{v}_r=0$) i parèntesi tancat; «dona» · **rev. 16/10/2026:** cursiva als apartats |
| G1 | `geo-23j2-q3` | 2023 juny S5 Q3 | B | ? | fet | abans una sola caixa de pistes; ara una per apartat; a) avís dels signes de $r$ (text del David) i ja no dona la conclusió («Comprova si… mira si totes les igualtats es poden complir alhora») |
| G1 | `geo-23s-q5` | 2023 setembre S2 Q5 | A | ? | fet | a) «Comença», «imposa que…» i el parèntesi dels dos productes escalars (text del David); «dona» |
| G1 | `geo-24i-q6` | 2024 juny inc. S5 Q6 | A | ? | fet | a) sense to oral, frase del determinant més clara; b) paràmetre de $r$ → $\lambda$, final amb text del David (substituir el valor obtingut); «perpendicular comuna» · **rev. 16/10/2026:** notació $\vec{v}_{r}$ |
| G1 | `geo-24j-q6` | 2024 juny S1 Q6 | A | ? | fet | a) $ax+by+cz+d=0$ i $d(P,A)^2=d(P,B)^2$ (text del David); b) ja no dona la resposta de «És casualitat?»; c) idea de la pauta ($C\in\pi$) · **rev. 16/10/2026:**  |
| G1 | `geo-24s-q6` | 2024 setembre S3 Q6 | A | ? | fet | c) «$P$ queda just al mig entre $\pi$ i $\pi'$» (abans deia que $\pi'$ era a l'altre costat de $\pi$) · **rev. 16/10/2026:** b) fórmula, pla en la forma $\ldots = 0$ i lligam amb a) |
| G1 | `geo-25j-q4b` | 2025 juny S1 Ex 4B | A | ? | fet | a) reescrita en «tu»; corregits $\vec n=(1,1,0)$ i el parèntesi de més a la columna $(x-1,y+1,z-2)$ |
| G1 | `geo-25s-q4b` | 2025 setembre S3 Ex 4B | A | ? | fet | a) racionalitzar; b) sense «Sabem que… doncs» i justificació de la distància; c) com es calcula la distància entre plans · **rev. 16/10/2026:** a) pla en la forma $\ldots = 0$ |
| G1 | `geo-26j-q4b` | 2026 juny S1 Ex 4B | B | ? | fet | apartats N.1, N.2… (numeració oficial); 4.3: afegida la fórmula del volum a l'enunciat |
| G1 | `geo-26j2-q4b` | 2026 juny S5 Ex 4B | B | ? | fet | apartats N.1, N.2… (numeració oficial); enunciat complet (irregularitats, unitats en cm); 4.3: comprovar que el punt és més enllà de $B$; «xoc»; guions llargs a l'incís (revisió final) |
| G1 | `geo-26s-q4b` | 2026 setembre S2 Ex 4B | IA | IA | fet | pista nova (setembre 2026); «d'$A$»; 4.2: projecció ortogonal, comprovació del paral·lelisme opcional, 6 línies |

## Àlgebra (16)

| Lot | ID | Procedència | Font | Autor | Estat | Notes |
|---|---|---|---|---|---|---|
| A1 | `alg-23j-q2` | 2023 juny S1 Q2 | A | ? | fet | b) substituir $C\cdot C$ per $(C\cdot D)\cdot C$ (text del David) · **rev. 16/10/2026:** b) hipòtesis $(\ast)$, $(\ast\ast)$, \underbrace i «Atenció» de no simplificar $C$; cursiva als apartats |
| A1 | `alg-23j-q4` | 2023 juny S1 Q4 | A | ? | fet | a) cas $\det(A)\neq0$; b) no dona el valor singular ni el tipus, resolució més curta, solució com a punt + vector; cometes «» · **rev. 16/10/2026:** a) drecera de la pauta (sumar les files) i arrels reals |
| A1 | `alg-23j2-q2` | 2023 juny S5 Q2 | B | ? | fet | abans una sola caixa de pistes; ara una per apartat; a) pas de Gauss corregit ($F_3\to F_3-F_2$) i ja no dona els casos; b) no dona el tipus; clau del sistema a la dreta · **rev. 16/10/2026:** a) matriu esglaonada amb $\ast$ i un pas més de Gauss; b) més curta; cursiva als apartats |
| A1 | `alg-23j2-q5` | 2023 juny S5 Q5 | B | ? | fet | abans una sola caixa de pistes; ara una per apartat; sense canvis (proposta rebutjada) |
| A1 | `alg-23s-q1` | 2023 setembre S2 Q1 | A | ? | fet | a) error típic d'elevar cada element; b) $4A = A\cdot(4I)$ per treure factor comú; «dona» · **rev. 16/10/2026:** b) el binomi només val perquè $A$ i $I$ commuten |
| A1 | `alg-23s-q3` | 2023 setembre S2 Q3 | A | ? | fet | a) ordre i signes en reorganitzar, cas $\det(A)\neq0$; b) no dona el tipus i indica com resoldre · **rev. 16/10/2026:**  |
| A1 | `alg-24i-q2` | 2024 juny inc. S5 Q2 | A | ? | fet | a) «si i només si», mètode amb tots els passos; b) no dona $X=P^{-1}(2R-Q)$ (resolt també la línia massa llarga) · **rev. 16/10/2026:**  |
| A1 | `alg-24j-q2` | 2024 juny S1 Q2 | A | ? | fet | a) sense to oral, cas general i $k=0$ sense donar la conclusió; b) més curta (text del David); c) idea de la pauta (relació de la tercera equació amb les altres); cometes · **rev. 16/10/2026:**  |
| A2 | `alg-24s-q2` | 2024 setembre S3 Q2 | A | ? | fet | a) cas $\det(A)\neq0$; b) no dona el tipus (text del David); c) sense to oral ni el tipus; cometes, parèntesi i «un segon pas» · **rev. 16/10/2026:** a) mirar el sistema abans de calcular rangs |
| A2 | `alg-25i-q2` | 2025 juny inc. S4 Ex 2 | A | ? | fet | a) cas $\det(A)\neq0$; b) llista completa de posicions relatives (faltava «dos paral·lels tallats per un tercer») i final del David · **rev. 16/10/2026:** b) configuracions del cas compatible indeterminat (dos plans coincidents) |
| A2 | `alg-25i-q4b` | 2025 juny inc. S4 Ex 4B | A | ? | fet | b) «si i només si»; c) igualar element per element i complir totes les equacions (text del David); «tant» |
| A2 | `alg-25j-q2` | 2025 juny S1 Ex 2 | A | ? | fet | a) cas $\det(A)\neq0$; b) més curta, sense repassar els tres casos; c) calcular els punts i quants n'hi ha (text del David) · **rev. 16/10/2026:**  |
| A2 | `alg-25s-q2` | 2025 setembre S3 Ex 2 | A | ? | fet | a) cas $\det(A)\neq0$; b) no dona el tipus i diu com resoldre; c) $z$ no pot ser la variable lliure · **rev. 16/10/2026:**  |
| A2 | `alg-26j-q2` | 2026 juny S1 Ex 2 | B | ? | fet | apartats N.1, N.2… (numeració oficial); 2.1 cas $\det(A)\neq0$; 2.2 no dona les interpretacions; 2.3 no dona el raonament i avisa que no totes les incògnites serveixen; $A^{'}$ |
| A2 | `alg-26j2-q2` | 2026 juny S5 Ex 2 | B | ? | fet | apartats N.1, N.2… (numeració oficial); 2.2 no dona que el determinant és sempre 0; 2.3 en preguntes (text del David) |
| A2 | `alg-26s-q2` | 2026 setembre S2 Ex 2 | IA | IA | fet | pista nova (setembre 2026); 2.2 corregit el cas $k=1$ ($x$ no pot ser el paràmetre); $A^{'}$ en lloc d'$A^{*}$ |

## Anàlisi (31)

| Lot | ID | Procedència | Font | Autor | Estat | Notes |
|---|---|---|---|---|---|---|
| N1 | `ana-23j-q1` | 2023 juny S1 Q1 | A | ? | fet | «Cada condició de l'enunciat es tradueix en una equació» (sense la frase de to oral); cometes «» |
| N1 | `ana-23j-q3` | 2023 juny S1 Q3 | A | ? | fet | a) ja no diu com es fixa la segona constant: pregunta què implica a $x=2$ que $f$ sigui derivable (text del David) |
| N1 | `ana-23j-q5` | 2023 juny S1 Q5 | A | ? | fet | a) coma sobrera; b) ja no dona la longitud de tanca ($x+y$) i demana les dimensions i l'estalvi (text del David) · **rev. 16/10/2026:** cursiva als apartats, majúscules → cursiva |
| N1 | `ana-23j2-q1` | 2023 juny S5 Q1 | B | ? | fet | abans una sola caixa de pistes; ara una per apartat; a) «en fer la resta… obtindràs un polinomi de segon grau, que serà senzill d'integrar» (text del David) · **rev. 16/10/2026:** «eix d'abscisses» |
| N1 | `ana-23j2-q4` | 2023 juny S5 Q4 | B | ? | fet | en reconstruir-la s'ha corregit «aíllar» → «aïllar»; abans una sola caixa de pistes; ara una per apartat; enunciat: «. Sabem que», com a l'original (abans «, bé que»); ja no dona $P(x)$, només com expressar cada tram · **rev. 16/10/2026:** domini $0 < x < 12$ |
| N1 | `ana-23j2-q6` | 2023 juny S5 Q6 | B | ? | fet | abans una sola caixa de pistes; ara una per apartat; a) derivada d'un quocient i, en resoldre $f'(-1)=0$, només cal igualar el numerador a zero (text del David); cometes «» |
| N1 | `ana-23s-q2` | 2023 setembre S2 Q2 | A | ? | fet | b) sense «No et preocupis…»; c) catets i àrea $\frac12 c_1 c_2$ (text del David) i escriure que l'àrea no depèn de $k$ · **rev. 16/10/2026:** cursiva als apartats, «eix d'abscisses» |
| N1 | `ana-23s-q4` | 2023 setembre S2 Q4 | A | ? | fet | a) sense «nosaltres» («aquest teorema serveix…»); b) més curta, punts de tall entre les gràfiques (text del David); cometes «» · **rev. 16/10/2026:** b) valor absolut només si la diferència no canvia de signe; «teorema» en minúscula |
| N2 | `ana-23s-q6` | 2023 setembre S2 Q6 | A | ? | fet | enunciat com l'oficial («en la figura següent:») i descripció de la figura a part, en cursiva; a) sense «nosaltres» ni to oral; b) quedar-se amb la solució que té sentit; cometes «» · **rev. 16/10/2026:** cursiva als apartats |
| N2 | `ana-24i-q1` | 2024 juny inc. S5 Q1 | A | ? | fet | a) sense l'alternativa de partir per la meitat; b) corregit: sí que es pot derivar (la pauta ho puntua) i ja no parla d'una $g$ no definida; extrems amb text del David; c) quantes vegades talla l'eix · **rev. 16/10/2026:** cursiva als apartats, «teorema» en minúscula |
| N2 | `ana-24i-q3` | 2024 juny inc. S5 Q3 | A | ? | fet | a) «la segona coordenada del punt de tangència» (text del David); b) escriure $f_1$ i $f_3$ sense oblidar el terme independent (text del David); c) sense «nosaltres», l'àrea no pot ser negativa; «dels punts»; cometes «» · **rev. 16/10/2026:** c) valor absolut només si la diferència no canvia de signe |
| N2 | `ana-24i-q5` | 2024 juny inc. S5 Q5 | A | ? | fet | enunciat com l'oficial («tal com es mostra a la figura següent:») i, a part, en cursiva, que $x$ i $y$ són els radis; coma sobrera; cometes «»; $10\,\text{m}$ · **rev. 16/10/2026:** majúscules → cursiva |
| N2 | `ana-24j-q1` | 2024 juny S1 Q1 | A | ? | fet | b) el límit a $0^{+}$ no és indeterminat; a $+\infty$ sí (L'Hôpital) · **rev. 16/10/2026:** cursiva als apartats |
| N2 | `ana-24j-q3` | 2024 juny S1 Q3 | A | ? | fet | a) tres solucions de $f(x)=5$; recta $PR$ amb text del David; b) corregit: s'integra entre $P$ i $Q$ (no entre dos punts de tall) i parèntesi tancat; cometes «» · **rev. 16/10/2026:** cursiva als apartats, «eix d'abscisses» |
| N2 | `ana-24j-q5` | 2024 juny S1 Q5 | A | ? | fet | sense canvis de contingut; tres comes sobreres; $6\,\text{m}^{3}$ · **rev. 16/10/2026:** majúscules → cursiva |
| N3 | `ana-24s-q1` | 2024 setembre S3 Q1 | A | ? | fet | a) sense l'alternativa de partir per la meitat; b) coeficients positius, extrems i nombre de talls · **rev. 16/10/2026:** b) $f'(0)=0$ sense extrem; «teorema» en minúscula |
| N3 | `ana-24s-q3` | 2024 setembre S3 Q3 | A | ? | fet | enunciat com l'oficial («el logotip següent…:») i figura descrita a part, en cursiva; a) corregit: $x=0$ i una arrel doble, no «tres arrels» (text del David); $D$: dues solucions, triar per la figura (text del David, «eix d'abscisses»); b) corregit: una sola integral de $g-f$ ($f\ge0$ a $[0,3]$); c) parèntesi; cometes «» · **rev. 16/10/2026:** b) una sola integral perquè $g-f$ no canvia de signe (no per $f\ge0$); cursiva als apartats, majúscules → cursiva, «eix d'abscisses» |
| N3 | `ana-24s-q5` | 2024 setembre S3 Q5 | A | ? | fet | a) ja no dona $A(x)$ (text del David), sense la frase en majúscules; b) corregit: defineix $f$ i avisa que no és la $A'(x)$ (text del David), tangent en una línia a part; «aïlla $x$» · **rev. 16/10/2026:** «eix d'abscisses» |
| N3 | `ana-25i-q1` | 2025 juny inc. S4 Ex 1 | A | ? | fet | b) $f'(x)=0$ no sempre és un extrem; pot ser un punt d'inflexió (text del David) · **rev. 16/10/2026:** «eix d'abscisses» |
| N3 | `ana-25i-q4a` | 2025 juny inc. S4 Ex 4A | A | ? | fet | enunciat com l'oficial («…la figura següent:») amb $r$ i $h$ descrites a part; afegida la *Nota* oficial de la superfície de l'esfera; coma sobrera; $100\,\text{cm}^{3}$ · **rev. 16/10/2026:** majúscules → cursiva |
| N3 | `ana-25j-q1` | 2025 juny S1 Ex 1 | A | ? | fet | a) asímptota vertical; obliqua amb $m$ i $n$ (text del David) · **rev. 16/10/2026:** «eix d'abscisses» |
| N3 | `ana-25j-q4a` | 2025 juny S1 Ex 4A | A | ? | fet | enunciat com l'oficial («…la figura següent:») i figura descrita a part; talls amb $y=9$ i l'eix d'abscisses (text del David); integrar respecte de $x$; com obtenir la regió superior · **rev. 16/10/2026:** «eix d'abscisses» |
| N4 | `ana-25s-q1` | 2025 setembre S3 Ex 1 | A | ? | fet | figura descrita a part; a) base per alçada; b) dues solucions, triar pel signe del pendent · **rev. 16/10/2026:** «eix d'abscisses» |
| N4 | `ana-25s-q3c` | 2025 setembre S3 Ex 3 | A | ? | fet | separada de `pro-25s-q3ab` (abans eren la mateixa pàgina); c) les tres dades separades, sense donar el valor convertit ($8\,000$ euros) |
| N4 | `ana-25s-q4a` | 2025 setembre S3 Ex 4A | A | ? | fet | figura descrita a part; a) radiants i les dues coordenades de $C$ (text del David); b) compte amb el coeficient de la primitiva, preu per $\text{m}^{2}$ (text del David); cometes «» |
| N4 | `ana-26j-q1` | 2026 juny S1 Ex 1 | B | ? | fet | apartats N.1, N.2… (numeració oficial); 1.1 quin tros dona $f(0)$ i $f(2)$ |
| N4 | `ana-26j-q4a` | 2026 juny S1 Ex 4A | B | ? | fet | enunciat com l'oficial (era un resum); ja no dona el radi ni el costat; comes sobreres |
| N4 | `ana-26j2-q1` | 2026 juny S5 Ex 1 | B | ? | fet | apartats N.1, N.2… (numeració oficial); 1.1 factor comú i quants punts (text del David); 1.3 $y=ax(x-5)$ i tancar la unicitat; guions llargs |
| N4 | `ana-26j2-q4a` | 2026 juny S5 Ex 4A | B | ? | fet | apartats N.1, N.2… (numeració oficial); enunciat com l'oficial i figura descrita a part; 4.3 no dona que $f$ és la primitiva; guions llargs · **rev. 16/10/2026:** «eix d'abscisses» |
| N4 | `ana-26s-q1` | 2026 setembre S2 Ex 1 | IA | IA | fet | pista nova (setembre 2026); 1.2 un sol mètode (el de la pauta) |
| N4 | `ana-26s-q4a` | 2026 setembre S2 Ex 4A | IA | IA | fet | pista nova (setembre 2026); figura del desplegament descrita a part; 4.1 corregit: les franges de dalt i de baix de la base són laterals, no es retiren (text del David) |

## Probabilitat (9)

| Lot | ID | Procedència | Font | Autor | Estat | Notes |
|---|---|---|---|---|---|---|
| P1 | `pro-24i-q4` | 2024 juny inc. S5 Q4 | A | ? | fet | cometes «»; parèntesi de c) · **rev. 16/10/2026:** b) notació $P(C\mid R)$; «teorema» en minúscula; format estructurat (llistes, Atenció en paràgraf propi) |
| P1 | `pro-24j-q4` | 2024 juny S1 Q4 | A | ? | fet | b.2) més curta (la frase «tu has de resposta…» era incorrecta); cometes «» · **rev. 16/10/2026:** a.2), b.2) $P(\text{diferents})$, $P(X\ge2)$ (la $p$ tenia dos significats); format estructurat (llistes, Atenció en paràgraf propi) |
| P1 | `pro-24s-q4` | 2024 setembre S3 Q4 | A | ? | fet | a) i c) sense to oral; $P(X=0)$ en lloc de $Prob$; cometes «» · **rev. 16/10/2026:** a) $P(X\ge1)$; c) notació $P(A\mid\overline{H})$; «teorema» en minúscula; format estructurat (llistes, Atenció en paràgraf propi) |
| P1 | `pro-25i-q3` | 2025 juny inc. S4 Ex 3 | A | ? | fet | «ves»; cometes «» · **rev. 16/10/2026:** b) notació $P(C\mid\overline{B})$; «teorema» en minúscula; format estructurat (llistes, Atenció en paràgraf propi) |
| P1 | `pro-25j-q3` | 2025 juny S1 Ex 3 | A | ? | fet | «ves»; cometes «» · **rev. 16/10/2026:** b) fórmula de la binomial; format estructurat (llistes, Atenció en paràgraf propi) |
| P1 | `pro-25s-q3ab` | 2025 setembre S3 Ex 3 | A | ? | fet | separada d'`ana-25s-q3c` (abans eren la mateixa pàgina); cometes «» · **rev. 16/10/2026:** b) notació $P(I\mid S)$; «teorema» en minúscula; format estructurat (llistes, Atenció en paràgraf propi) |
| P1 | `pro-26j-q3` | 2026 juny S1 Ex 3 | B | ? | fet | apartats N.1, N.2… (numeració oficial); 3.3 sense partir per la meitat; guions llargs; cometes «» · **rev. 16/10/2026:** format estructurat (llistes, Atenció en paràgraf propi) |
| P1 | `pro-26j2-q3` | 2026 juny S5 Ex 3 | B | ? | fet | apartats N.1, N.2… (numeració oficial); cometes «» · **rev. 16/10/2026:** format estructurat (llistes, Atenció en paràgraf propi) |
| P1 | `pro-26s-q3` | 2026 setembre S2 Ex 3 | IA | IA | fet | pista nova (setembre 2026); sense canvis · **rev. 16/10/2026:** format estructurat (llistes, Atenció en paràgraf propi) |
