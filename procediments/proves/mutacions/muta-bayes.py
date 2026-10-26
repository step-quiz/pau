import subprocess, shutil, os, tempfile
# Run from anywhere: python3 procediments/proves/mutacions/<this file>
ORIG=os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
MUT=[
 ('bayes.js', "const v = numerador.quocient(total);", "const v = total.quocient(numerador);", 'divisió al revés'),
 ('bayes.js', "  const camins = b.objectiu || p.objectiu;", "  const camins = p.objectiu;", 'denominador amb els camins de la total'),
 ('arbres.js', "    bayes: {tex: 'P(F \\\\mid D)', text: 'que una peça defectuosa sigui de ferro', fulla: [0, 0],", "    bayes: {tex: 'P(F \\\\mid D)', text: 'que una peça defectuosa sigui de ferro', fulla: [1, 0],", 'numerador d\'un altre camí'),
 ('bayes.js', "g.files[FILA.formula] = formula(texNumerador, A.texValor(p, total), R('Br', r.aprox ? '\\\\approx' : '=') + K('Bv', r.tex));", "g.files[FILA.formula] = formula(texNumerador, A.texValor(p, total), R('Br', '=') + K('Bv', r.tex));", '«=» en lloc de «≈»'),
 ('bayes.js', "  const d = M.formaDecimal(v, 4, 4);\n  return {tex: d.tex, aprox: d.aprox, decimal: d};", "  const d = M.formaDecimal(v, 4, 2);\n  return {tex: d.tex + '1', aprox: d.aprox, decimal: d};", 'arrodoniment equivocat'),
 ('bayes.js', "termes.map((v, i) => K(`S${i}`, A.texValor(p, v), A.marcaCami(i))).join(' + ')", "termes.map((v, i) => K(`S${i}`, A.texValor(p, v), A.marcaCami(i + 1))).join(' + ')", 'color dels termes de la suma'),
 ('bayes.js', "  const colorDe = (a, j) => A.marcaCami(camins.findIndex(([x, y]) => x === a && y === j));", "  const colorDe = (a, j) => A.marcaCami(0);", 'tots els camins del mateix color'),
 ('bayes.js', "  g.files[FILA.llegenda] = A.texLlegenda(p);\n  pas('Posa nom", "  pas('Posa nom", 'llegenda després de P(A | B)'),
]
det=0
for f,a,b,nom in MUT:
    d=os.path.join(tempfile.gettempdir(), 'pau-mutacio-mb2'); shutil.rmtree(d, ignore_errors=True); shutil.copytree(ORIG, d, ignore=shutil.ignore_patterns('mutacions', 'navegador', 'eines'))
    p=os.path.join(d,f); s=open(p).read()
    if s.count(a)!=1: print('NO APLICA', nom, s.count(a)); continue
    open(p,'w').write(s.replace(a,b,1))
    r=subprocess.run(['node', os.path.join(d,'proves/comprova.js'), 'Bayes'], capture_output=True, text=True)
    fa=r.returncode!=0; det+=fa
    l=[x for x in r.stdout.splitlines() if x.strip().startswith('·')][:1]
    print(('DETECTADA ' if fa else 'NO DETECTADA ')+nom, '|', l[0].strip()[:150] if l else '')
print(f'{det}/{len(MUT)}')
