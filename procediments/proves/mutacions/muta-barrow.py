import subprocess, shutil, os, tempfile
# Run from anywhere: python3 procediments/proves/mutacions/<this file>
ORIG=os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
MUT=[
 ('barrow.js', "  const valor = Fb.resta(Fa);", "  const valor = Fa.resta(Fb);", 'F(a) − F(b)'),
 ('barrow.js', "  const Fb = calcula(FILA.fb, 'B', 'b', b);", "  const Fb = calcula(FILA.fb, 'B', 'b', a);", 'F(b) calculada a a'),
 ('barrow.js', "K('If', `F(${texNombre(b)}) - F(${texNombre(a)})`)", "K('If', `F(${texNombre(a)}) - F(${texNombre(b)})`)", 'escriu F(a) − F(b)'),
 ('barrow.js', "`${texNombre(Fb)} - ${texEntreParentesis(Fa)}`", "`${texNombre(Fb)} - ${texNombre(Fa)}`", 'resta sense parèntesis'),
 ('formules.js', "`_{${clau(P + 'La', limits[0])}}^{${clau(P + 'Lb', limits[1])}}`", "`_{${clau(P + 'La', limits[1])}}^{${clau(P + 'Lb', limits[0])}}`", 'límits girats'),
 ('barrow.js', "F.passosIntegral(g, FILA.primitiva, F.membreEsquerre('G', 'F', 'x'), f, {C: false,", "F.passosIntegral(g, FILA.primitiva, F.membreEsquerre('G', 'F', 'x'), f.slice(1), {C: false,", 'primitiva sense un terme'),
]
det=0
for f,a,b,nom in MUT:
    d=os.path.join(tempfile.gettempdir(), 'pau-mutacio-mbar'); shutil.rmtree(d, ignore_errors=True); shutil.copytree(ORIG, d, ignore=shutil.ignore_patterns('mutacions', 'navegador', 'eines'))
    p=os.path.join(d,f); s=open(p).read()
    if s.count(a)!=1: print('NO APLICA', nom, s.count(a)); continue
    open(p,'w').write(s.replace(a,b,1))
    r=subprocess.run(['node', os.path.join(d,'proves/comprova.js'), 'Barrow'], capture_output=True, text=True, timeout=300)
    fa=r.returncode!=0; det+=fa
    l=[x for x in r.stdout.splitlines() if x.strip().startswith('·')][:1]
    print(('DETECTADA ' if fa else 'NO DETECTADA ')+nom, '|', l[0].strip()[:150] if l else '')
print(f'{det}/{len(MUT)}')
