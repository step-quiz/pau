import subprocess, shutil, os, tempfile
# Run from anywhere: python3 procediments/proves/mutacions/<this file>
ORIG=os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
MUT=[
 ('arbres.js', "const resta = coneguts.map(b => valorDe(b.p)).reduce((s, v) => s.resta(v), Fraccio.de(1));", "const resta = coneguts.map(b => valorDe(b.p)).reduce((s, v) => s.resta(v), Fraccio.de(1)).producte(Fraccio.de(1, 1) ).suma(new Fraccio(1, 100));", 'contrari mal calculat'),
 ('arbres.js', "K(`Pr${a}${j}`, texValor(p, b.v.producte(c.v)))", "K(`Pr${a}${j}`, texValor(p, b.v.suma(c.v)))", 'producte del camí'),
 ('arbres.js', "    objectiu: [[0, 0], [1, 0]],\n    pregunta: {tex: 'P(D)', text: 'que una peça sigui defectuosa'},\n    bayes: {tex: 'P(F \\\\mid D)'", "    objectiu: [[0, 0], [1, 1]],\n    pregunta: {tex: 'P(D)', text: 'que una peça sigui defectuosa'},\n    bayes: {tex: 'P(F \\\\mid D)'", 'camins equivocats'),
 ('arbres.js', "{e: 'F', p: '70%', dada: '1'", "{e: 'F', p: '75%', dada: '1'", 'dada equivocada'),
 ('arbres.js', "const texCondicionada = (t, a, j) => `P(${t.fills[a][j].e} \\\\mid ${t.primer[a].e})`;", "const texCondicionada = (t, a, j) => `P(${t.primer[a].e} \\\\mid ${t.fills[a][j].e})`;", 'condicionada al revés'),
 ('probabilitat-total.js', "const total = termes.reduce((s, v) => s.suma(v));", "const total = termes.reduce((s, v) => s.producte(v));", 'suma per producte'),
 ('probabilitat-total.js', "        etiquetes[clauDe(x)] = x.valor.tex;\n        pas(`Posa $${nomDe(x)}", "        etiquetes[clauDe(x).replace(/0$/, '1')] = x.valor.tex;\n        pas(`Posa $${nomDe(x)}", 'etiqueta a una altra branca'),
 ('arbres.js', "      {e: 'V_1', p: '3/5', dada: '1'", "      {e: 'V_1', p: '3/4', dada: '1'", 'Laplace equivocat'),
]
det=0
for f,a,b,nom in MUT:
    d=os.path.join(tempfile.gettempdir(), 'pau-mutacio-mp'); shutil.rmtree(d, ignore_errors=True); shutil.copytree(ORIG, d, ignore=shutil.ignore_patterns('mutacions', 'navegador', 'eines'))
    p=os.path.join(d,f); s=open(p).read()
    if s.count(a)!=1: print('NO APLICA', nom, s.count(a)); continue
    open(p,'w').write(s.replace(a,b,1))
    r=subprocess.run(['node', os.path.join(d,'proves/comprova.js')], capture_output=True, text=True)
    fa=r.returncode!=0; det+=fa
    l=[x for x in r.stdout.splitlines() if x.strip().startswith('·')][:1]
    print(('DETECTADA ' if fa else 'NO DETECTADA ')+nom, '|', l[0].strip()[:150] if l else '')
print(f'{det}/{len(MUT)}')
