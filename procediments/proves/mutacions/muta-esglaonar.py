import subprocess, shutil, os, tempfile
# Run from anywhere: python3 procediments/proves/mutacions/<this file>
ORIG=os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
MUT=[
 # (Passar la fila de zeros al final ja ho fa la regla del pivot, ara que també s'esglaona l'última columna: no és una mutació útil.)
 ('matrius.js', "      const a = p.num, b = -e.num;                       // a·e + b·p = 0", "      const g_ = M.mcd(Math.abs(p.num), Math.abs(e.num)); const a = p.num / g_, b = -e.num / g_;", 'simplifica a i b (no ho vol)'),
 ('matrius.js', "    const k = [0, 1, 2].find(i => i >= r && !B[i][c].esZero());", "    const k = [0, 1, 2].find(i => i >= r && !B[i][c].esZero() && B[i][c].abs().igual(U)) ?? [0, 1, 2].find(i => i >= r && !B[i][c].esZero());", 'canvia files per tenir un 1 (drecera)'),
 ('matrius.js', "  for (let c = 0; c < nC && r < 3; c++) {", "  for (let c = 0; c < nC - 1 && r < 3; c++) {", 'no esglaona l\'última columna'),
 ('matrius.js', "  return `${coef(a, true)}F_${i + 1} + ${coef(b, false)}F_${j + 1}`;", "  return `${coef(b, true)}F_${i + 1} + ${coef(a, false)}F_${j + 1}`;", 'etiqueta amb a i b intercanviats'),
 ('esglaonar.js', "  const rA = B.filter(f => !zeroA(f)).length, rAm = B.filter(f => !f.every(c => c.esZero())).length;", "  const rA = B.filter(f => !zeroA(f)).length, rAm = rA;", 'rang de A* igual que el de A'),
 ('esglaonar.js', "  cadena(gauss.length, (i, j) => (esPivot(i, j) ? 'mes' : ''));", "  cadena(gauss.length, (i, j) => (i === j ? 'mes' : ''));", 'pivots marcats a la diagonal'),
]
det=0
for f,a,b,nom in MUT:
    d=os.path.join(tempfile.gettempdir(), 'pau-mutacio-mesg'); shutil.rmtree(d, ignore_errors=True); shutil.copytree(ORIG, d, ignore=shutil.ignore_patterns('mutacions', 'navegador', 'eines'))
    p=os.path.join(d,f); s=open(p).read()
    if s.count(a)!=1: print('NO APLICA', nom, s.count(a)); continue
    open(p,'w').write(s.replace(a,b,1))
    r=subprocess.run(['node', os.path.join(d,'proves/comprova.js'), 'esglaonar'], capture_output=True, text=True)
    fa=r.returncode!=0; det+=fa
    l=[x for x in r.stdout.splitlines() if x.strip().startswith('·')][:1]
    print(('DETECTADA ' if fa else 'NO DETECTADA ')+nom, '|', l[0].strip()[:160] if l else '')
print(f'{det}/{len(MUT)}')
