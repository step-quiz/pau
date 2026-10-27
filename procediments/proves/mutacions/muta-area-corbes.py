import subprocess, shutil, os, tempfile
# Run from anywhere: python3 procediments/proves/mutacions/<this file>
ORIG=os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
MUT=[
 ('area-corbes.js', "Fraccio.de(v[COEFS_F[n]] - v[COEFS_G[n]])", "Fraccio.de(v[COEFS_G[n]] - v[COEFS_F[n]])", 'h = g − f'),
 ('area-corbes.js', "`${entreParentesis(f)} - ${entreParentesis(", "`${entreParentesis(f)} + ${entreParentesis(", 'diferència escrita amb +'),
 ('area-corbes.js', "  const trossos = arrels.slice(1).map((r, k) => [arrels[k], r]);", "  const trossos = [[arrels[0], arrels[arrels.length - 1]]];", 'un sol tros'),
 ('area-corbes.js', "  const A = integrals.reduce((s, I) => s.suma(I.abs()), Fraccio.de(0));", "  const A = integrals.reduce((s, I) => s.suma(I), Fraccio.de(0)).abs();", 'valor absolut de la suma'),
 ('area-corbes.js', "+ `${texNombre(Hv(r))} - ${texEntreParentesis(Hv(l))} = ${texNombre(I)}`", "+ `${texNombre(Hv(l))} - ${texEntreParentesis(Hv(r))} = ${texNombre(I)}`", 'H(l) − H(r) escrit'),
 ('area-corbes.js', "files: FILA, nom: 'f(x) - g(x)', inici:", "files: FILA, inici:", 'sense f(x) − g(x) = 0 tal com es planteja'),
 ('area-corbes.js', "F.membreEsquerre('G', 'H', 'x'), h, {C: false,", "F.membreEsquerre('G', 'H', 'x'), f, {C: false,", 'primitiva de f en lloc de f − g'),
]
det=0
for f,a,b,nom in MUT:
    d=os.path.join(tempfile.gettempdir(), 'pau-mutacio-mac'); shutil.rmtree(d, ignore_errors=True); shutil.copytree(ORIG, d, ignore=shutil.ignore_patterns('mutacions', 'navegador', 'eines'))
    p=os.path.join(d,f); s=open(p).read()
    if s.count(a)!=1: print('NO APLICA', nom, s.count(a)); continue
    open(p,'w').write(s.replace(a,b,1))
    r=subprocess.run(['node', os.path.join(d,'proves/comprova.js'), 'dues corbes'], capture_output=True, text=True, timeout=300)
    fa=r.returncode!=0; det+=fa
    l=[x for x in r.stdout.splitlines() if x.strip().startswith('·')][:1]
    print(('DETECTADA ' if fa else 'NO DETECTADA ')+nom, '|', l[0].strip()[:150] if l else '')
print(f'{det}/{len(MUT)}')
