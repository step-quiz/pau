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
 (F, "else cel.fi = cel.di.map(s => (s === '+' ? '\\\\cup' : '\\\\cap'));", "else cel.fi = cel.di.map(s => (s === '+' ? '\\\\cap' : '\\\\cup'));", 'concavitat positiva i negativa girades'),
 (F, "if (e === d) { sense.push(p.valor); return; }", "if (e === d && !primera) { sense.push(p.valor); return; }", 'extrem en un punt crític on f\' no canvia de signe'),
 (F, "${ord.map((p, j) => K('Hy' + j, texAprox(p.y))).join(' & ')}", "${ord.map((p, j) => K('Hy' + j, texAprox(j === 1 ? p.y.suma(1) : p.y))).join(' & ')}", 'un valor de la taula equivocat'),
 (F, "R(`S${PX}w${j}`, positiu ? '>' : '<')", "R(`S${PX}w${j}`, positiu ? '<' : '>')", 'el signe del valor de prova girat'),
 (F, "if (ultim && ultim[1] === j - 1 && !punts[j - 1].fora) ultim[1] = j;", "if (ultim && ultim[1] === j - 1) ultim[1] = j;", 'intervals units per sobre d\'un punt fora del domini'),
 (F, "return {infinit: c.signe() * (cap < 0 && k % 2 ? -1 : 1)};", "return {infinit: c.signe()};", 'límit a −∞ sense mirar si el grau és senar'),
 (F, "g.files[fah] = K('Ah', `\\\\text{Asímptota horitzontal: } y = ${texNombre(l.finit)}`);", "g.files[fah] = K('Ah', `\\\\text{Asímptota horitzontal: } y = ${texNombre(l.finit.suma(1))}`);", "l'asímptota horitzontal equivocada"),
 (F, "zeros.forEach(z => posaPunt(z, ZERO));", "zeros.slice(1).forEach(z => posaPunt(z, ZERO));", 'un tall amb l\'eix que no és a la taula'),
 (F, "const sub = potDen ? `\\\\dfrac{${substitucio(N, t)}}", "const sub = potDen ? `\\\\dfrac{${substitucio(N, t.suma(1))}}", 'la substitució del valor de prova amb un altre valor'),
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
