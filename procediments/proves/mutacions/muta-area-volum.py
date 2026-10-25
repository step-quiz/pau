import subprocess, shutil, os, tempfile
# Run from anywhere: python3 procediments/proves/mutacions/<this file>
ORIG=os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
MUT=[
 ('area-volum.js', "    const area = {c: rW.c.quocient(2), m: rW.m};", "    const area = {c: rW.c, m: rW.m};", 'àrea sense la meitat'),
 ('area-volum.js', "    const V = det.abs().quocient(6);", "    const V = det.abs().quocient(3);", 'volum entre 3'),
 ('area-volum.js', "    const AD = resta(p.D, p.A);", "    const AD = resta(p.D, p.B);", 'AD des de B'),
 ('area-volum.js', "    const ADg = {P: resta(Dg.P, p.A), u: Dg.u};", "    const ADg = {P: resta(Dg.P, p.B), u: Dg.u};", 'AD_λ des de B'),
 ('area-volum.js', "    const a = escalar(w, ADg.u), b = escalar(w, ADg.P);", "    const a = escalar(w, ADg.u), b = escalar(w, Dg.P);", 'b amb D en lloc de AD'),
 ('area-volum.js', "    const ls = [sisV, sisV.oposada()].map(x => x.resta(b).quocient(a));", "    const ls = [sisV, sisV.oposada()].map(x => x.quocient(a));", 'λ sense restar b'),
 ('area-volum.js', "    const sisV = p.V.producte(6);", "    const sisV = p.V.producte(3);", '3V en lloc de 6V'),
 ('area-volum.js', "`\\\\dfrac{1}{2} \\\\cdot ${G.texArrel(rW)}`", "`\\\\dfrac{1}{2} \\\\cdot ${G.texArrel(area)}`", 'divideix dues vegades'),
]
det=0
for f,a,b,nom in MUT:
    d=os.path.join(tempfile.gettempdir(), 'pau-mutacio-mav'); shutil.rmtree(d, ignore_errors=True); shutil.copytree(ORIG, d, ignore=shutil.ignore_patterns('mutacions', 'navegador', 'eines'))
    p=os.path.join(d,f); s=open(p).read()
    if s.count(a)!=1: print('NO APLICA', nom, s.count(a)); continue
    open(p,'w').write(s.replace(a,b,1))
    r=subprocess.run(['node', os.path.join(d,'proves/comprova.js'), 'àrea i volum'], capture_output=True, text=True, timeout=300)
    fa=r.returncode!=0; det+=fa
    l=[x for x in r.stdout.splitlines() if x.strip().startswith('·')][:1]
    print(('DETECTADA ' if fa else 'NO DETECTADA ')+nom, '|', l[0].strip()[:150] if l else '')
print(f'{det}/{len(MUT)}')
