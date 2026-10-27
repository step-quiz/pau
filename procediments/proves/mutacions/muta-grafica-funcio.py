import subprocess, shutil, os, tempfile
# Mutacions de grafica-funcio.js (secció «gràfica d'una funció» de comprova.js).
# Run from anywhere: python3 procediments/proves/mutacions/muta-grafica-funcio.py
ORIG=os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
F='grafica-funcio.js'
MUT=[
 (F, "const lim = pa.signe() * sq;", "const lim = -pa.signe() * sq;", 'límit lateral amb el signe canviat'),
 (F, "const N = suma(P, prod(Q, [ZERO, m.oposada()]));", "const N = suma(P, prod(Q, [ZERO, m]));", "n de l'asímptota obliqua mal calculada"),
 (F, "B = escala(prod(N1, dQ), fr(2));", "B = escala(prod(N1, dQ), fr(1));", "f'' sense el 2 de la derivada de Q²"),
 (F, "N = coefs(suma(A, escala(B, fr(-1))));\n    potDen = 2;", "N = coefs(suma(A, B));\n    potDen = 2;", 'regla del quocient amb + en lloc de −'),
 (F, "const tipus = primera ? (e === '+' ? 'màxim' : 'mínim') : 'inflexió';", "const tipus = primera ? (e === '+' ? 'mínim' : 'màxim') : 'inflexió';", 'màxim i mínim girats'),
 (F, "(s === '+' ? '\\\\cup' : '\\\\cap')", "(s === '+' ? '\\\\cap' : '\\\\cup')", 'concavitat positiva i negativa girades'),
 (F, "if (e === d) { sense.push(p.valor); return; }", "if (e === d && !primera) { sense.push(p.valor); return; }", 'extrem en un punt crític on f\' no canvia de signe'),
 (F, "${ord.map((p, j) => K('Hy' + j, texAprox(p.y))).join(' & ')}", "${ord.map((p, j) => K('Hy' + j, texAprox(j === 1 ? p.y.suma(1) : p.y))).join(' & ')}", 'un valor de la taula equivocat'),
 (F, "R(`S${PX}w${j}`, positiu ? '>' : '<')", "R(`S${PX}w${j}`, positiu ? '<' : '>')", 'el signe del valor de prova girat'),
 (F, "if (ultim && ultim[1] === j - 1 && entre && !entre.fora) ultim[1] = j;", "if (ultim && ultim[1] === j - 1) ultim[1] = j;", 'intervals units per sobre d\'un punt fora del domini (o d\'un forat)'),
 (F, "return {infinit: c.signe() * (cap < 0 && k % 2 ? -1 : 1)};", "return {infinit: c.signe()};", 'límit a −∞ sense mirar si el grau és senar'),
 (F, "g.files[fah] = K('Ah', `\\\\text{Asímptota horitzontal: } y = ${texNombre(l.finit)}`);", "g.files[fah] = K('Ah', `\\\\text{Asímptota horitzontal: } y = ${texNombre(l.finit.suma(1))}`);", "l'asímptota horitzontal equivocada"),
 (F, "zeros.forEach(z => posaPunt(z, ZERO));", "zeros.slice(1).forEach(z => posaPunt(z, ZERO));", 'un tall amb l\'eix que no és a la taula'),
 (F, "const sub = potDen ? `\\\\dfrac{${substitucio(N, t)}}", "const sub = potDen ? `\\\\dfrac{${substitucio(N, t.suma(1))}}", 'la substitució del valor de prova amb un altre valor'),
 # Amb radicals
 (F, "K('VI', '[-1,\\\\ +\\\\infty)')", "K('VI', '(-1,\\\\ +\\\\infty)')", 'domini amb l\'extrem obert en lloc de tancat'),
 (F, "['x \\\\ge -3', ", "['x \\\\ge 3', ", 'inequació del domini mal resolta'),
 (F, "solucions: [{tex: '-2', valor: fr(-2)}], textSolucions: 'Divideix per $3$: $x = -2$, que és del domini.'", "solucions: [{tex: '-2', serveix: false}], textSolucions: 'Divideix per $3$: $x = -2$, que és del domini.'", 'una solució del domini tatxada'),
 (F, "['-1', 'Queda $-\\\\sqrt{1} = -1$.']", "['1', 'Queda $-\\\\sqrt{1} = -1$.']", 'm a −∞ sense el signe de x < 0'),
 (F, "y = -x'), '$m = -1$", "y = x'), '$m = -1$", 'asímptota obliqua a −∞ equivocada'),
 (F, "return {tex: `${sub(t)} \\\\approx ${decimal(v)}`", "return {tex: `${sub(t)} \\\\approx ${decimal(v + 0.01)}`", 'valor de prova aproximat mal arrodonit'),
 (F, "['\\\\dfrac{3x + 6}{2\\\\sqrt{x + 3}}', 'Opera el numerador", "['\\\\dfrac{3x + 3}{2\\\\sqrt{x + 3}}', 'Opera el numerador", 'derivada del producte mal operada'),
 (F, "const trossos = [[null, fr(-2)], [fr(2), null]];", "const trossos = [[null, null]];", 'taula de signes per sobre del forat del domini'),
 (F, "'\\\\dfrac{12x + 12x^{4} - 9x^{4}}", "'\\\\dfrac{12x + 12x^{4} + 9x^{4}}", "f'' amb un signe canviat en treure el parèntesi"),
 (F, "`\\\\sqrt{${texNombre(fr(x).suma(fr(3)))}}`", "`\\\\sqrt{${texNombre(fr(x).suma(fr(2)))}}`", 'pas intermedi del valor de f mal calculat'),
]
det=0
for f,a,b,nom in MUT:
    d=os.path.join(tempfile.gettempdir(), 'pau-mutacio-grafica'); shutil.rmtree(d, ignore_errors=True); shutil.copytree(ORIG, d, ignore=shutil.ignore_patterns('mutacions', 'navegador', 'eines', 'frases'))
    p=os.path.join(d,f); s=open(p).read()
    if s.count(a)!=1: print('NO APLICA', nom, s.count(a)); continue
    open(p,'w').write(s.replace(a,b,1))
    r=subprocess.run(['node', os.path.join(d,'proves/comprova.js'), "gràfica d'una"], capture_output=True, text=True, timeout=600)
    fa=r.returncode!=0; det+=fa
    l=[x for x in r.stdout.splitlines() if x.strip().startswith('·')][:1]
    print(('DETECTADA ' if fa else 'NO DETECTADA ')+nom, '|', l[0].strip()[:150] if l else '')
print(f'{det}/{len(MUT)}')
