import subprocess, shutil, os, tempfile
# Run from anywhere: python3 procediments/proves/mutacions/<this file>
ORIG=os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
MUT=[
 ("m = Fraccio.de(-1).quocient(mt);", "m = Fraccio.de(1).quocient(mt);", 'signe del pendent de la normal'),
 ("[Fraccio.de(-v.m)]", "[Fraccio.de(v.m)]", 'equació f\'(x) = m'),
 ("posa0(K('TX', `x = ${X}`));", "posa0(K('TX', `x = ${texNombre(x0.suma(Fraccio.de(1)))}`));", 'normal vertical desplaçada'),
 ("sol.forEach((s, i) => {", "sol.slice(0, 1).forEach((s, i) => {", 'segona tangent oblidada'),
 ("if (!sol.length) {", "if (sol.length < 2) {", '«no n\'hi ha cap» amb solucions'),
 ("const r = recta(g, f, s.valor, 'pendent', acabades.join(' \\\\\\\\[6pt] '), m);", "const r = recta(g, f, s.valor, 'pendent', acabades.join(' \\\\\\\\[6pt] '), m.suma(Fraccio.de(1)));", 'pendent conegut equivocat'),
 ("    : normal ? K('Tn', '-') + `\\\\dfrac{${K('Tu', '1')}}{${derDe(a)}}` : derDe(a));", "    : derDe(a));", 'fórmula de la normal sense −1/f\''),
]
det=0
for a,b,nom in MUT:
    d=os.path.join(tempfile.gettempdir(), 'pau-mutacio-mr'); shutil.rmtree(d, ignore_errors=True); shutil.copytree(ORIG, d, ignore=shutil.ignore_patterns('mutacions', 'navegador', 'eines'))
    p=os.path.join(d,'recta-tangent.js'); s=open(p).read()
    if s.count(a)!=1: print('NO APLICA', nom, s.count(a)); continue
    open(p,'w').write(s.replace(a,b,1))
    r=subprocess.run(['node', os.path.join(d,'proves/comprova.js')], capture_output=True, text=True)
    f=r.returncode!=0; det+=f
    l=[x for x in r.stdout.splitlines() if x.strip().startswith('·')][:1]
    print(('DETECTADA ' if f else 'NO DETECTADA ')+nom, '|', l[0].strip()[:150] if l else '')
print(f'{det}/{len(MUT)}')
