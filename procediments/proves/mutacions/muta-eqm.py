import subprocess, shutil, os, tempfile
# Run from anywhere: python3 procediments/proves/mutacions/<this file>
ORIG=os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
F='equacio-matricial.js'
MUT=[
 (F, "const X = p.costat === 'e' ? producte(inv, Rm) : producte(Rm, inv);", "const X = p.costat === 'e' ? producte(Rm, inv) : producte(inv, Rm);", 'producte en l\'ordre equivocat'),
 (F, "eq(e ? inv('qL') + Mx + X : X + Mx + inv('qL'), e ? inv('qR') + dretaP : dretaP + inv('qR'));", "eq(e ? inv('qL') + Mx + X : X + Mx + inv('qL'), e ? dretaP + inv('qR') : inv('qR') + dretaP);", 'inversa per l\'altre costat a la dreta'),
 (F, "    eq(AX + (p.c ? termeC() : ''), dretaC + termeB(true));", "    eq(AX + (p.c ? termeC() : ''), dretaC + termeB(false));", 'B passa sense canviar de signe'),
 (F, "    eq(e ? Mx + X : X + Mx, dretaC + (p.beta ? termeB(true) : ''));", "    eq(X + Mx, dretaC + (p.beta ? termeB(true) : ''));", 'factor comú pel costat dolent'),
 (F, "const adj = [[d, b.oposada()], [c.oposada(), a]];", "const adj = [[a, b.oposada()], [c.oposada(), d]];", 'inversa 2×2 sense intercanviar'),
 (F, "`${par(f[0])} \\\\cdot ${par(P2[0][j])} + ${par(f[1])} \\\\cdot ${par(P2[1][j])}`", "`${par(f[0])} \\\\cdot ${par(P2[j][0])} + ${par(f[1])} \\\\cdot ${par(P2[j][1])}`", 'files per files'),
 (F, "const Rm = p.beta ? suma(escala(D, p.kappa), B, -p.beta) : escala(D, p.kappa);", "const Rm = p.beta ? suma(D, B, -p.beta) : D;", 'oblida el 2 de 2C'),
 (F, "K('Gp', `${par(a)} \\\\cdot ${par(d)} - ${par(b)} \\\\cdot ${par(c)}`)", "K('Gp', `${par(a)} \\\\cdot ${par(d)} + ${par(b)} \\\\cdot ${par(c)}`)", 'determinant amb +'),
]
det=0
for f,a,b,nom in MUT:
    d=os.path.join(tempfile.gettempdir(), 'pau-mutacio-meqm'); shutil.rmtree(d, ignore_errors=True); shutil.copytree(ORIG, d, ignore=shutil.ignore_patterns('mutacions', 'navegador', 'eines'))
    p=os.path.join(d,f); s=open(p).read()
    if s.count(a)!=1: print('NO APLICA', nom, s.count(a)); continue
    open(p,'w').write(s.replace(a,b,1))
    r=subprocess.run(['node', os.path.join(d,'proves/comprova.js'), 'matricial'], capture_output=True, text=True)
    fa=r.returncode!=0; det+=fa
    l=[x for x in r.stdout.splitlines() if x.strip().startswith('·')][:1]
    print(('DETECTADA ' if fa else 'NO DETECTADA ')+nom, '|', l[0].strip()[:160] if l else '')
print(f'{det}/{len(MUT)}')
