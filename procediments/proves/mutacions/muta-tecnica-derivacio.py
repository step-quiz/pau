import subprocess, shutil, os, tempfile
# Run from anywhere: python3 procediments/proves/mutacions/<this file>
# Mutacions de la derivada directa d'un polinomi (tecnica-derivacio.js, i Formules.derivadaDirecta a extrems).
ORIG=os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
MUT=[
 ('tecnica-derivacio.js', "const v = c[k + 1].producte(k + 1);", "const v = c[k + 1].producte(k);", 'coeficient nou sense multiplicar pel grau', 'tècnica'),
 ('tecnica-derivacio.js', "termes.push({k, s: v.signe() < 0 ? -1 : 1,", "termes.push({k, s: 1,", 'signe perdut en derivar', 'tècnica'),
 ('tecnica-derivacio.js', "if (!conteX(a) || esPolinomi(a)) return 'basica';", "if (!conteX(a)) return 'basica';", 'polinomi derivat monomi a monomi', 'tècnica'),
 ('tecnica-derivacio.js', "if (!conteX(n.a)) return escala(b, a[0]);", "if (!conteX(n.a)) return b;", 'el nombre que multiplica es perd', 'tècnica'),
 ('formules.js', "return {tex: polinomi(Q, derivaTermes(llista)), fusiona, reanomena};\n}\n\n\n/* ── 3b.", "return {tex: polinomi(Q, llista.filter(t => t.n >= 1).map(t => ({n: t.n - 1, c: t.c}))), fusiona, reanomena};\n}\n\n\n/* ── 3b.", 'derivada directa sense baixar l\'exponent', 'guions i veritat de extrems'),
]
det=0
for fitxer,a,b,nom,seccio in MUT:
    d=os.path.join(tempfile.gettempdir(), 'pau-mutacio-td'); shutil.rmtree(d, ignore_errors=True); shutil.copytree(ORIG, d, ignore=shutil.ignore_patterns('mutacions', 'navegador', 'eines'))
    p=os.path.join(d,fitxer); s=open(p).read()
    if s.count(a)!=1: print('NO APLICA', nom, s.count(a)); continue
    open(p,'w').write(s.replace(a,b,1))
    r=subprocess.run(['node', os.path.join(d,'proves/comprova.js'), seccio], capture_output=True, text=True)
    f=r.returncode!=0; det+=f
    l=[x for x in r.stdout.splitlines() if x.strip().startswith('·')][:1]
    print(('DETECTADA ' if f else 'NO DETECTADA ')+nom, '|', l[0].strip()[:150] if l else '')
print(f'{det}/{len(MUT)}')
