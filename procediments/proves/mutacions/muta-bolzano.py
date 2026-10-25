import subprocess, shutil, os, tempfile
# Run from anywhere: python3 procediments/proves/mutacions/<this file>
ORIG=os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
MUT=[
 ("const esquerra = sm !== sl;", "const esquerra = sm === sl;", 'meitat equivocada'),
 ("fila[2] = K(`T${k}v`, `${d.aprox ? '\\\\approx ' : ''}${d.tex} ${sm < 0 ? '<' : '>'} 0`);", "fila[2] = K(`T${k}v`, `${d.aprox ? '\\\\approx ' : ''}${d.tex} ${sm < 0 ? '>' : '<'} 0`);", 'signe de f(m)'),
 ("const n = Math.round(Math.abs(x.num) * escala / x.den);", "const n = Math.floor(Math.abs(x.num) * escala / x.den);", 'arrodoniment per truncament'),
 ("files.push([K(`T${k + 1}i`, intervalAmbSignes(l, r, sl, sr)), '', '']);", "files.push([K(`T${k + 1}i`, intervalAmbSignes(l, r, sr, sl)), '', '']);", 'signes dels extrems'),
 ("if (sa === sb) {", "if (sa === sb && v.a < -9) {", 'Bolzano amb el mateix signe'),
 ("const m = l.suma(r).quocient(2), fm = val(m);", "const m = l.suma(r).quocient(2), fm = val(m).suma(Fraccio.de(1, 1000));", 'valor de f(m)'),
 ("const signe = R(L + 'w', fx.signe() < 0 ? '<' : '>') + K(L + 'z', '0');", "const signe = R(L + 'w', fx.signe() < 0 ? '>' : '<') + K(L + 'z', '0');", 'signe de f(a)'),
 ("let dec = aprox ? 3 : exactes;", "let dec = aprox ? 3 : Math.min(exactes, 2);", 'decimals exactes retallats'),
 ("g.files[FILA.resposta] = K('Rc', `c \\\\in ${interval(l, r, '(', ')')}`);", "g.files[FILA.resposta] = K('Rc', `c \\\\in ${interval(a, b, '(', ')')}`);", 'resposta amb l\'interval inicial'),
 ("for (let k = 0; k < v.n; k++) {", "for (let k = 0; k < v.n - 1; k++) {", 'una bisecció de menys'),
]
det=0
for a,b,nom in MUT:
    d=os.path.join(tempfile.gettempdir(), 'pau-mutacio-mb'); shutil.rmtree(d, ignore_errors=True); shutil.copytree(ORIG, d, ignore=shutil.ignore_patterns('mutacions', 'navegador', 'eines'))
    p=os.path.join(d,'bolzano.js'); s=open(p).read()
    if s.count(a)!=1: print('NO APLICA', nom); continue
    open(p,'w').write(s.replace(a,b,1))
    r=subprocess.run(['node', os.path.join(d,'proves/comprova.js')], capture_output=True, text=True)
    f=r.returncode!=0; det+=f
    l=[x for x in r.stdout.splitlines() if x.strip().startswith('·')][:1]
    print(('DETECTADA ' if f else 'NO DETECTADA ')+nom, '|', l[0].strip()[:140] if l else '')
print(f'{det}/{len(MUT)}')
