import subprocess, shutil, os, tempfile
# Run from anywhere: python3 procediments/proves/mutacions/<this file>
ORIG=os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
MUT=[
 ('discussio.js', "return {N, rA: 2, rS: valor.esZero() ? 2 : 3,", "return {N, rA: 2, rS: valor.esZero() ? 3 : 2,", 'rang de A* al revés'),
 ('discussio.js', "const TIPUS = (rA, rS) => (rA < rS ? 'SI' : rA === 3 ? 'SCD' : 'SCI');", "const TIPUS = (rA, rS) => (rA < rS ? 'SCI' : rA === 3 ? 'SCD' : 'SI');", 'SI i SCI canviats'),
 ('discussio.js', "const orla = {fs: [0, 1, 2], cs: cs.concat([3])};", "const orla = {fs: [0, 1, 2], cs: [0, 1, 2]};", 'orla amb |A| en lloc de la columna b'),
 ('discussio.js', "const N = amb(S, r);\n  const A = N", "const N = amb(S, r + 1);\n  const A = N", 'substitueix un altre valor'),
 ('discussio.js', "  const diferent = arrels.length ? `${X} \\\\neq ${arrels.join(',\\\\ ')}`", "  const diferent = arrels.length ? `${X} \\\\neq ${arrels.slice(1).join(',\\\\ ')}`", 'el cas SCD oblida un valor'),
 ('discussio.js', "  arrels.forEach((r, c) => {", "  arrels.slice(1).forEach((r, c) => {", 'no discuteix un dels valors'),
 ('discussio.js', "files.push([K(`T${t}a`, `${X} = ${r}`), K(`T${t}b`, String(k.rA)), K(`T${t}c`, String(k.rS))", "files.push([K(`T${t}a`, `${X} = ${r}`), K(`T${t}b`, String(k.rS)), K(`T${t}c`, String(k.rA))", 'la taula amb els rangs canviats'),
 ('discussio.js', "      for (const i of fs) for (const j of cs) marques[`${i}${j}`] = 'mes';", "      for (const i of fs) for (const j of cs) marques[`${i}${j}`] = 'mes';\n      marques['03'] = 'mes';", 'marca verda a la columna b'),
 ('discussio.js', "    if (!valor.esZero()) return {N, rA: 1, rS: 2, menor: null, element, orla: {fs, cs, valor}};", "    if (!valor.esZero()) return {N, rA: 1, rS: 1, menor: null, element, orla: null};", 'rang 1: no veu el menor amb b'),
 ('discussio.js', "  const {det} = Mt.passosSarrus(g, {A, X, nom: '|A|', P: 'd', rapid: true,", "  const {det} = Mt.passosSarrus(g, {A: A.map(f => f.slice().reverse()), X, nom: '|A|', P: 'd', rapid: true,", 'determinant d\'una altra matriu'),
]
det=0
for f,a,b,nom in MUT:
    d=os.path.join(tempfile.gettempdir(), 'pau-mutacio-mdisc'); shutil.rmtree(d, ignore_errors=True); shutil.copytree(ORIG, d, ignore=shutil.ignore_patterns('mutacions', 'navegador', 'eines'))
    p=os.path.join(d,f); s=open(p).read()
    if s.count(a)!=1: print('NO APLICA', nom, s.count(a)); continue
    open(p,'w').write(s.replace(a,b,1))
    r=subprocess.run(['node', os.path.join(d,'proves/comprova.js'), 'discussió'], capture_output=True, text=True)
    fa=r.returncode!=0; det+=fa
    l=[x for x in r.stdout.splitlines() if x.strip().startswith('·')][:1]
    print(('DETECTADA ' if fa else 'NO DETECTADA ')+nom, '|', l[0].strip()[:160] if l else '')
print(f'{det}/{len(MUT)}')
