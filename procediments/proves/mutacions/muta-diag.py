import subprocess, shutil, os, tempfile
# Run from anywhere: python3 procediments/proves/mutacions/<this file>
ORIG=os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
F='diagonalitzacio.js'
MUT=[
 (F, "const menysLambda = N => N.map((f, i) => f.map((c, j) => (i === j ? [c, fr(-1)] : (c.esZero() ? [] : [c]))));", "const menysLambda = N => N.map((f, i) => f.map((c, j) => (i === j ? [c, fr(1)] : (c.esZero() ? [] : [c]))));", 'A + λI en lloc de A − λI'),
 (F, "v = [b.oposada(), a];", "v = [b, a];", 'vector propi 2×2 equivocat'),
 (F, "v = [f1[1].producte(f2[2]).resta(f1[2].producte(f2[1])),", "v = [f1[1].producte(f2[2]).suma(f1[2].producte(f2[1])),", 'producte vectorial equivocat'),
 (F, "const Pm = N.map((_, a) => vectors.map(w => w[a]));", "const Pm = vectors.map(w => w.slice());", 'P amb els vectors en files'),
 (F, "const D = N.map((_, a) => N.map((__, b) => fr(a === b ? vaps[a] : 0)));", "const D = N.map((_, a) => N.map((__, b) => fr(a === b ? vaps[N.length - 1 - a] : 0)));", 'D en un altre ordre'),
 (F, "const B = N.map((f, a) => f.map((c, b) => (a === b ? c.resta(fr(r)) : c)));", "const B = N.map((f, a) => f.map((c, b) => (a === b ? c.suma(fr(r)) : c)));", 'A + rI per al vector propi'),
 (F, "    g.files[FILA.sarrus] = K('cSl', nom) + R('cSq', '=') + K('cS0', `${Mt.texFactor(a, L)}${Mt.texFactor(d, L)}`) + ' - ' + K('cS1', `${Mt.texFactor(b, L)} \\\\cdot ${Mt.texFactor(c, L)}`);",
  "    g.files[FILA.sarrus] = K('cSl', nom) + R('cSq', '=') + K('cS0', `${Mt.texFactor(a, L)}${Mt.texFactor(d, L)}`) + ' + ' + K('cS1', `${Mt.texFactor(b, L)} \\\\cdot ${Mt.texFactor(c, L)}`);", '2×2: més en lloc de menys'),
 (F, "  const AP = N.map((f, a) => Pm[0].map((_, b) => f.reduce((s, x, k) => s.suma(x.producte(Pm[k][b])), fr(0))));", "  const AP = Pm.map((f, a) => N[0].map((_, b) => f.reduce((s, x, k) => s.suma(x.producte(N[k][b])), fr(0))));", 'PA en lloc de AP'),
]
det=0
for f,a,b,nom in MUT:
    d=os.path.join(tempfile.gettempdir(), 'pau-mutacio-mdiag'); shutil.rmtree(d, ignore_errors=True); shutil.copytree(ORIG, d, ignore=shutil.ignore_patterns('mutacions', 'navegador', 'eines'))
    p=os.path.join(d,f); s=open(p).read()
    if s.count(a)!=1: print('NO APLICA', nom, s.count(a)); continue
    open(p,'w').write(s.replace(a,b,1))
    try:
        r=subprocess.run(['node', os.path.join(d,'proves/comprova.js'), 'diagonalització'], capture_output=True, text=True, timeout=300)
        fa=r.returncode!=0; out=r.stdout
    except subprocess.TimeoutExpired:
        fa=True; out='· (penjat)'
    det+=fa
    l=[x for x in out.splitlines() if x.strip().startswith('·')][:1]
    print(('DETECTADA ' if fa else 'NO DETECTADA ')+nom, '|', l[0].strip()[:160] if l else '')
print(f'{det}/{len(MUT)}')
