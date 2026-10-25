import subprocess, shutil, os, tempfile
# Run from anywhere: python3 procediments/proves/mutacions/<this file>
ORIG=os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
MUT=[
 ('inversa.js', "const signe = (i + j) % 2 ? -1 : 1;", "const signe = (i + j) % 2 ? 1 : -1;", 'signes del tauler al revés'),
 ('inversa.js', "const [a, b] = transposada ? [j, i] : [i, j];", "const [a, b] = [i, j];", 'no transposa'),
 ('inversa.js', "const inv = [0, 1, 2].map(i => [0, 1, 2].map(j => adj[j][i].quocient(d)));", "const inv = [0, 1, 2].map(i => [0, 1, 2].map(j => adj[j][i]));", 'no divideix per |A|'),
 ('inversa.js', "const inv = [0, 1, 2].map(i => [0, 1, 2].map(j => adj[j][i].quocient(d)));", "const inv = [0, 1, 2].map(i => [0, 1, 2].map(j => adj[i][j].quocient(d)));", 'inversa sense transposar'),
 ('inversa.js', "cs = [0, 1, 2].filter(b => b !== j);", "cs = [0, 1, 2].filter(b => b !== i);", 'menor equivocat'),
 ('inversa.js', "marques[`${x}${y}`] = x === i || y === j ? 'menys' : 'mes';", "marques[`${x}${y}`] = x === i && y === j ? 'menys' : 'mes';", 'marques: només l\'element'),
 ('inversa.js', "K('Iu', `\\\\dfrac{1}{${M.texNombre(d)}}`)", "K('Iu', `\\\\dfrac{1}{${M.texNombre(d.oposada())}}`)", '1/|A| amb el signe canviat'),
 ('inversa.js', "g.files[FILA.det] = F.enLinies(K('Dl', '|A|') + R('Dq', '='), [K('Dp', Mt.texSarrusN(N))],", "g.files[FILA.det] = F.enLinies(K('Dl', '|A|') + R('Dq', '='), [K('Dp', Mt.texSarrusN(N.slice().reverse()))],", 'productes de Sarrus d\'una altra matriu'),
]
det=0
for f,a,b,nom in MUT:
    d=os.path.join(tempfile.gettempdir(), 'pau-mutacio-minv'); shutil.rmtree(d, ignore_errors=True); shutil.copytree(ORIG, d, ignore=shutil.ignore_patterns('mutacions', 'navegador', 'eines'))
    p=os.path.join(d,f); s=open(p).read()
    if s.count(a)!=1: print('NO APLICA', nom, s.count(a)); continue
    open(p,'w').write(s.replace(a,b,1))
    r=subprocess.run(['node', os.path.join(d,'proves/comprova.js'), 'inversa'], capture_output=True, text=True)
    fa=r.returncode!=0; det+=fa
    l=[x for x in r.stdout.splitlines() if x.strip().startswith('·')][:1]
    print(('DETECTADA ' if fa else 'NO DETECTADA ')+nom, '|', l[0].strip()[:160] if l else '')
print(f'{det}/{len(MUT)}')
