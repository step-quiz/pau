import subprocess, shutil, os, tempfile
# Mutacions de les regles generals (secció «regles generals de totes les pàgines» de comprova.js).
# Run from anywhere: KATEX=<katex/dist> python3 procediments/proves/mutacions/muta-regles.py (sense KATEX, la mutació del «·» no es detecta)
ORIG=os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
MUT=[
 ('geometria.js', "M.texNombre(a) + (factor.length > 1 ? ' \\\\cdot ' : '')", "M.texNombre(a) + ''", 'producte sense punt al pla: 2(x − 1)'),
 ('formules.js', "clau(P + 'f', X) + op(P + 'pt', '\\\\cdot') + clau(P + 'l', '(')", "clau(P + 'f', X) + clau(P + 'l', '(')", 'factor comú sense punt: x(x − 2)'),
 ('creixement.js', "cel.Fp[j] = '\\\\text{màxim}';", "cel.Fp[j] = '\\\\text{màx}';", 'abreviatura màx'),
 ('determinant.js', "Iguala el determinant a zero.`", "Iguala el determinant a zero (no cal Cramer).`", 'la paraula Cramer'),
 ('geometria.js', "const texPuntNom = (nom, P) => `${nom}${texPunt(P)}`;", "const texPuntNom = (nom, P) => `${nom} = ${texPunt(P)}`;", 'punts amb «=»: P = (1, 2)'),
 ('dues-rectes.js', "K('Lr', '\\\\text{Les rectes } r \\\\text{ i } s \\\\text{ es tallen en el punt } R')", "K('Lr', 'r \\\\cap s = \\\\{R\\\\}')", 'notació de conjunts a la resposta'),
 ('area-volum.js', "'triangle': p => `Calcula l'àrea del triangle de vèrtexs $${texPuntNom('A', p.A)}$,", "'triangle': p => `Calcula l'àrea del triangle de vèrtexs ${texPuntNom('A', p.A)}$,", 'un «$» sense parella a l\'enunciat'),
 ('dues-rectes.js', "\\\\text{ són paral}\\\\mathord{\\\\cdotp}\\\\text{leles}", "\\\\text{ són paral·leles}", 'un «·» dins de \\text{} (KaTeX el dibuixa en vermell)'),
 ('extrems.js', "g.afegeix('Per decidir-ho, fes servir la segona derivada: deriva $f\\'(x)$.');", "g.afegeix('Comprova-ho amb la segona derivada: deriva $f\\'(x)$.');", 'una comprovació'),
]
det=0
for f,a,b,nom in MUT:
    d=os.path.join(tempfile.gettempdir(), 'pau-mutacio-regles'); shutil.rmtree(d, ignore_errors=True); shutil.copytree(ORIG, d, ignore=shutil.ignore_patterns('mutacions', 'navegador', 'eines'))
    p=os.path.join(d,f); s=open(p).read()
    if s.count(a)!=1: print('NO APLICA', nom, s.count(a)); continue
    open(p,'w').write(s.replace(a,b,1))
    r=subprocess.run(['node', os.path.join(d,'proves/comprova.js'), 'regles generals'], capture_output=True, text=True, timeout=300, env=dict(os.environ, KATEX=os.environ.get('KATEX', '')))
    fa=r.returncode!=0; det+=fa
    l=[x for x in r.stdout.splitlines() if x.strip().startswith('·')][:1]
    print(('DETECTADA ' if fa else 'NO DETECTADA ')+nom, '|', l[0].strip()[:150] if l else '')
print(f'{det}/{len(MUT)}')
