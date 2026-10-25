import subprocess, shutil, os, tempfile
# Run from anywhere: python3 procediments/proves/mutacions/<this file>
ORIG=os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
MUT=[
 ('matrius.js', "{signe: 1, pos: [[0, 1], [1, 2], [2, 0]]", "{signe: 1, pos: [[0, 1], [1, 0], [2, 2]]", 'un triangle equivocat'),
 ('matrius.js', "{signe: -1, pos: [[0, 0], [1, 2], [2, 1]]", "{signe: 1, pos: [[0, 0], [1, 2], [2, 1]]", 'un producte amb el signe canviat'),
 ('matrius.js', "s.signe > 0 ? 'mes' : 'menys']", "'mes']", 'marques del mateix color'),
 ('matrius.js', "const sense = signats.map(", "const sense = valors.map(", 'treure parèntesis sense canviar signes'),
 ('matrius.js', "const det = signats.reduce((d, v) => sumaP(d, v), []);", "const det = signats.slice(0, 5).reduce((d, v) => sumaP(d, v), []);", 'oblida un producte en agrupar'),
 ('matrius.js', "baix.push(dalt[i].suma(mig[i]));", "baix.push(dalt[i].resta(mig[i]));", 'Ruffini resta en lloc de sumar'),
 ('matrius.js', "(v.esZero() ? '' : ' \\\\neq 0')", "(v.esZero() ? ' \\\\neq 0' : '')", '«≠ 0» al revés'),
 ('matrius.js', "    resta = q.slice(j);\n    const factor", "    resta = q.slice(j + 1);\n    const factor", 'factor comú mal tret'),
 ('matrius.js', "  return ordena(arrels);\n}", "  return ordena(arrels).slice(1);\n}", 'perd una solució'),
 ('determinant.js', "${arrels.map(r => `$${X} \\\\neq ${M.texNombre(r)}$`).join(' i ')}", "${arrels.slice(1).map(r => `$${X} \\\\neq ${M.texNombre(r)}$`).join(' i ')}", 'el text final oblida un valor'),
 ('matrius.js', "return {dalt, mig, baix, quocient: baix.slice(0, -1).reverse()};", "return {dalt, mig, baix, quocient: baix.slice(1).reverse()};", 'quocient de Ruffini equivocat'),
 ('matrius.js', "const llista = candidates(q[0]);", "const llista = candidates(q[0]).map(c => c * 2);", 'candidates que no són divisors'),
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
