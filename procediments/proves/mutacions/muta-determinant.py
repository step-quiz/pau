import subprocess, shutil, os, tempfile
# Run from anywhere: python3 procediments/proves/mutacions/<this file>
ORIG=os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
MUT=[
 ('matrius.js', "{signe: 1, pos: [[0, 1], [1, 2], [2, 0]]", "{signe: 1, pos: [[0, 1], [1, 0], [2, 2]]", 'un triangle equivocat'),
 ('matrius.js', "{signe: -1, pos: [[0, 0], [1, 2], [2, 1]]", "{signe: 1, pos: [[0, 0], [1, 2], [2, 1]]", 'un producte amb el signe canviat'),
 ('matrius.js', "s.signe > 0 ? 'mes' : 'menys']", "'mes']", 'marques del mateix color'),
 ('matrius.js', "const sense = mes.concat(menys.map(t => ({k: t.k, c: t.c.oposada(), n: t.n})));", "const sense = mes.concat(menys.map(t => ({k: t.k, c: t.c, n: t.n})));", 'treure claudàtors sense canviar signes'),
 ('matrius.js', "const sumes = [[0, 1, 2], [3, 4, 5]].map(ns => ns.reduce(", "const sumes = [[0, 1], [3, 4, 5]].map(ns => ns.reduce(", 'oblida un producte en agrupar'),
 ('matrius.js', "baix.push(dalt[i].suma(mig[i]));", "baix.push(dalt[i].resta(mig[i]));", 'Ruffini resta en lloc de sumar'),
 ('matrius.js', "(v.esZero() ? '' : ' \\\\neq 0')", "(v.esZero() ? ' \\\\neq 0' : '')", '«≠ 0» al revés'),
 ('matrius.js', "    resta = q.slice(j);\n    const factor", "    resta = q.slice(j + 1);\n    const factor", 'factor comú mal tret'),
 ('matrius.js', "  return tanca(arrels);\n}", "  return tanca(arrels).slice(1);\n}", 'perd una solució'),
 ('determinant.js', "${arrels.map(r => `$${X} \\\\neq ${M.texNombre(r)}$`).join(' i ')}", "${arrels.slice(1).map(r => `$${X} \\\\neq ${M.texNombre(r)}$`).join(' i ')}", 'el text final oblida un valor'),
 ('matrius.js', "return {dalt, mig, baix, quocient: baix.slice(0, -1).reverse()};", "return {dalt, mig, baix, quocient: baix.slice(1).reverse()};", 'quocient de Ruffini equivocat'),
 ('matrius.js', "for (const c of candidates(q[0])) {", "for (const c of candidates(q[0]).map(c => c * 2)) {", 'candidates que no són divisors'),
 ('matrius.js', "g.files[files.matriu] = filaMatriu();\n\n  /* Cada producte fet", "g.files[files.matriu] = filaMatriu({'00': 'mes'});\n\n  /* Cada producte fet", 'una marca que es queda'),
]
det=0
for f,a,b,nom in MUT:
    d=os.path.join(tempfile.gettempdir(), 'pau-mutacio-mdet'); shutil.rmtree(d, ignore_errors=True); shutil.copytree(ORIG, d, ignore=shutil.ignore_patterns('mutacions', 'navegador', 'eines'))
    p=os.path.join(d,f); s=open(p).read()
    if s.count(a)!=1: print('NO APLICA', nom, s.count(a)); continue
    open(p,'w').write(s.replace(a,b,1))
    r=subprocess.run(['node', os.path.join(d,'proves/comprova.js'), 'determinant'], capture_output=True, text=True)
    fa=r.returncode!=0; det+=fa
    l=[x for x in r.stdout.splitlines() if x.strip().startswith('·')][:1]
    print(('DETECTADA ' if fa else 'NO DETECTADA ')+nom, '|', l[0].strip()[:160] if l else '')
print(f'{det}/{len(MUT)}')
