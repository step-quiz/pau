import subprocess, shutil, os, tempfile
# Run from anywhere: python3 procediments/proves/mutacions/<this file>
ORIG=os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
MUT=[
 ('matrius.js', "const det2N = B => B[0][0].producte(B[1][1]).resta(B[0][1].producte(B[1][0]));", "const det2N = B => B[0][0].producte(B[1][1]).suma(B[0][1].producte(B[1][0]));", 'menor 2×2 amb +'),
 ('matrius.js', "const det3N = B => productesSarrusN(B).reduce((d, p, n) => (SARRUS[n].signe > 0 ? d.suma(p) : d.resta(p)), ZERO);", "const det3N = B => productesSarrusN(B).reduce((d, p, n) => d.suma(p), ZERO);", 'Sarrus sense signes'),
 ('rang.js', "      if (j === j0) continue;\n", "", 'orla sense la columna de l\'element'),
 ('rang.js', "        rang(maxim === 2 ? '= 2' : '\\\\ge 2');", "        rang('= 2');", 'rang = 2 massa aviat'),
 ('rang.js', "  if (!base) {\n    for (const k", "  if (!base && t > 1) {\n    for (const k", 'rang 1 sense haver-los provat tots'),
 ('rang.js', "        if (tres) break;", "        if (tres || t > 0) break;", 'no prova tots els menors d\'ordre 3'),
 ('rang.js', "marques[`${i}${j}`] = base.fs.includes(i) && base.cs.includes(j) ? 'mes' : 'tria';", "marques[`${i}${j}`] = 'tria';", 'marques sense el menor verd'),
 ('rang.js', "K(`D${t}v`, texN(d) + (d.esZero() ? '' : ' \\\\neq 0'))", "K(`D${t}v`, texN(d) + ' \\\\neq 0')", '«≠ 0» en un menor nul'),
 ('rang.js', "const fs = ordenat(base.fs, i), cs = ordenat(base.cs, j);", "const fs = ordenat(base.fs, i), cs = ordenat([0, 1].filter(x => x !== j).slice(0, 2), j);", 'menor d\'ordre 3 que no orla'),
 ('rang.js', "  const [i0, j0] = (() => { for (let i = 0; i < files; i++) for (let j = 0; j < columnes; j++) if (!N[i][j].esZero()) return [i, j]; return null; })();",
  "  const [i0, j0] = [0, 0];", 'agafa a₁₁ encara que sigui 0'),
]
det=0
for f,a,b,nom in MUT:
    d=os.path.join(tempfile.gettempdir(), 'pau-mutacio-mrang'); shutil.rmtree(d, ignore_errors=True); shutil.copytree(ORIG, d, ignore=shutil.ignore_patterns('mutacions', 'navegador', 'eines'))
    p=os.path.join(d,f); s=open(p).read()
    if s.count(a)!=1: print('NO APLICA', nom, s.count(a)); continue
    open(p,'w').write(s.replace(a,b,1))
    r=subprocess.run(['node', os.path.join(d,'proves/comprova.js'), 'rang'], capture_output=True, text=True)
    fa=r.returncode!=0; det+=fa
    l=[x for x in r.stdout.splitlines() if x.strip().startswith('·')][:1]
    print(('DETECTADA ' if fa else 'NO DETECTADA ')+nom, '|', l[0].strip()[:160] if l else '')
print(f'{det}/{len(MUT)}')
