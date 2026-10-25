import subprocess, shutil, os, tempfile
# Run from anywhere: python3 procediments/proves/mutacions/<this file>
ORIG=os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
MUT=[
 ('area-parametre.js', "(k^2 + k) - 0 = k^2 + k'", "(k^2 + k) - 0 = k^2 + 2k'", 'Barrow mal agrupat'),
 ('area-parametre.js', "M.termes([fr(-6), fr(1), fr(1)])", "M.termes([fr(-12), fr(1), fr(1)])", 'equació amb un altre terme independent'),
 ('area-parametre.js', "k \\\\cdot \\\\dfrac{27}{3} + 9 - 0 = 9k + 9", "k \\\\cdot \\\\dfrac{27}{3} + 6 - 0 = 9k + 9", 'F(3) mal calculada'),
 ('area-parametre.js', "9k = 18\\\\ \\\\Rightarrow\\\\ k = 2'", "9k = 18\\\\ \\\\Rightarrow\\\\ k = 3'", 'aïlla k malament'),
 ('area-parametre.js', "\\\\dfrac{k^3}{2} - \\\\dfrac{k^3}{3} - 0", "\\\\dfrac{k^3}{2} - \\\\dfrac{k^3}{6} - 0", 'F(k) mal calculada'),
 ('area-parametre.js', "k\\\\,\\\\dfrac{x^2}{2} - \\\\dfrac{x^3}{3}');", "k\\\\,\\\\dfrac{x^2}{2} - \\\\dfrac{x^3}{2}');", 'primitiva equivocada'),
 ('area-parametre.js', "const k0 = sols.map(s => s.valor).find(x => x.signe() > 0);", "const k0 = sols.map(s => s.valor).find(x => x.signe() < 0);", 'tria la solució negativa'),
]
det=0
for f,a,b,nom in MUT:
    d=os.path.join(tempfile.gettempdir(), 'pau-mutacio-map'); shutil.rmtree(d, ignore_errors=True); shutil.copytree(ORIG, d, ignore=shutil.ignore_patterns('mutacions', 'navegador', 'eines'))
    p=os.path.join(d,f); s=open(p).read()
    if s.count(a)!=1: print('NO APLICA', nom, s.count(a)); continue
    open(p,'w').write(s.replace(a,b,1))
    r=subprocess.run(['node', os.path.join(d,'proves/comprova.js'), 'paràmetre a partir'], capture_output=True, text=True, timeout=300)
    fa=r.returncode!=0; det+=fa
    l=[x for x in r.stdout.splitlines() if x.strip().startswith('·')][:1]
    print(('DETECTADA ' if fa else 'NO DETECTADA ')+nom, '|', l[0].strip()[:150] if l else '')
print(f'{det}/{len(MUT)}')
