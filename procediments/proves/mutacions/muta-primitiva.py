import subprocess, shutil, os, tempfile
# Run from anywhere: python3 procediments/proves/mutacions/<this file>
ORIG=os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
MUT=[
 ('mates.js', "  return llista.map(t => ({n: t.n + 1, c: Fraccio.de(t.c).quocient(t.n + 1)}));", "  return llista.map(t => ({n: t.n + 1, c: Fraccio.de(t.c).quocient(t.n + 2)}));", 'primitiva amb el denominador equivocat'),
 ('formules.js', "{${clau(P + 'd' + t.n, t.n + 1)}}`;", "{${clau(P + 'd' + t.n, t.n)}}`;", 'regla: denominador n'),
 ('formules.js', "^{${clau(P + 'E' + t.n, t.n + 1)}}", "^{${clau(P + 'E' + t.n, t.n)}}", 'regla: no puja l\'exponent'),
 ('primitiva.js', "  const C0 = y0.resta(Fx0);", "  const C0 = y0.suma(Fx0);", 'C amb el signe canviat'),
 ('primitiva.js', "M.sumaPolinomis(M.coeficientsDe(Fx), [C0])", "M.sumaPolinomis(M.coeficientsDe(Fx), [C0.oposada()])", 'resposta amb −C'),
 ('primitiva.js', "F.op('Hm', Fx0.signe() < 0 ? '+' : '-')", "F.op('Hm', Fx0.signe() < 0 ? '-' : '+')", 'aïllar C sense canviar el signe'),
 ('formules.js', "(esU(a) ? '' : clau(P + 'c0', texNombre(a))) + clau(P + 'v0', 'x');", "(esU(a) ? '' : clau(P + 'c0', texNombre(a))) + clau(P + 'v0', '');", 'la constant no dona cx'),
 ('formules.js', "  const ambC = C ? mesC('i') : '';", "  const ambC = '';", 'oblida la C'),
]
det=0
for f,a,b,nom in MUT:
    d=os.path.join(tempfile.gettempdir(), 'pau-mutacio-mprim'); shutil.rmtree(d, ignore_errors=True); shutil.copytree(ORIG, d, ignore=shutil.ignore_patterns('mutacions', 'navegador', 'eines'))
    p=os.path.join(d,f); s=open(p).read()
    if s.count(a)!=1: print('NO APLICA', nom, s.count(a)); continue
    open(p,'w').write(s.replace(a,b,1))
    r=subprocess.run(['node', os.path.join(d,'proves/comprova.js'), 'primitiva'], capture_output=True, text=True, timeout=300)
    fa=r.returncode!=0; det+=fa
    l=[x for x in r.stdout.splitlines() if x.strip().startswith('·')][:1]
    print(('DETECTADA ' if fa else 'NO DETECTADA ')+nom, '|', l[0].strip()[:150] if l else '')
print(f'{det}/{len(MUT)}')
