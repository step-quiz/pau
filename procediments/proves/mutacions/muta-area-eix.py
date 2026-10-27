import subprocess, shutil, os, tempfile
# Run from anywhere: python3 procediments/proves/mutacions/<this file>
ORIG=os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
MUT=[
 ('area-eix.js', "  const dins = arrels.filter(r => r.resta(a).signe() > 0 && b.resta(r).signe() > 0);", "  const dins = arrels.filter(r => r.resta(a).signe() >= 0 && b.resta(r).signe() > 0);", 'compta un extrem com a tall'),
 ('area-eix.js', "  const A = integrals.reduce((s, I) => s.suma(I.abs()), Fraccio.de(0));", "  const A = integrals.reduce((s, I) => s.suma(I), Fraccio.de(0));", 'àrea sense valors absoluts'),
 ('area-eix.js', "files: FILA, nom: 'f(x)', inici:", "files: FILA, inici:", 'sense f(x) = 0 tal com es planteja'),
 ('area-eix.js', "+ `${texNombre(Fv(r))} - ${texEntreParentesis(Fv(l))} = ${texNombre(I)}`", "+ `${texNombre(Fv(l))} - ${texEntreParentesis(Fv(r))} = ${texNombre(I)}`", 'F(l) − F(r) escrit'),
 ('area-eix.js', "    const I = Fv(r).resta(Fv(l));", "    const I = Fv(l).resta(Fv(r));", 'integral amb el signe girat'),
 ('area-eix.js', "K('Al', '\\\\text{Àrea}')", "K('Al', 'A')", 'A en lloc d\'«Àrea»'),
 ('area-eix.js', "  const arrels = Ig.passosTalls(g, {p, X: 'x',", "  const arrels = Ig.passosTalls(g, {p: p.slice().reverse(), X: 'x',", 'equació amb els coeficients girats'),
 ('area-eix.js', "K('Zs', arrels.length ? arrels.map(r => `x = ${texNombre(r)}`).join(',\\\\ ')", "K('Zs', arrels.length ? dins.map(r => `x = ${texNombre(r)}`).join(',\\\\ ')", 'resum només amb els talls de dins'),
]
det=0
for f,a,b,nom in MUT:
    d=os.path.join(tempfile.gettempdir(), 'pau-mutacio-mae'); shutil.rmtree(d, ignore_errors=True); shutil.copytree(ORIG, d, ignore=shutil.ignore_patterns('mutacions', 'navegador', 'eines'))
    p=os.path.join(d,f); s=open(p).read()
    if s.count(a)!=1: print('NO APLICA', nom, s.count(a)); continue
    open(p,'w').write(s.replace(a,b,1))
    r=subprocess.run(['node', os.path.join(d,'proves/comprova.js'), "corba i l'eix"], capture_output=True, text=True, timeout=300)
    fa=r.returncode!=0; det+=fa
    l=[x for x in r.stdout.splitlines() if x.strip().startswith('·')][:1]
    print(('DETECTADA ' if fa else 'NO DETECTADA ')+nom, '|', l[0].strip()[:150] if l else '')
print(f'{det}/{len(MUT)}')
