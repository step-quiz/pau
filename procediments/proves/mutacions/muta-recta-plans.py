import subprocess, shutil, os, tempfile
# Run from anywhere: python3 procediments/proves/mutacions/<this file>
ORIG=os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
MUT=[
 ('geometria.js', "(j === 0 ? ' = ' : j === 1 ? ' - ' : ' + ') + K(`${P}m${j}`", "(j === 0 ? ' = ' : ' + ') + K(`${P}m${j}`", 'desenvolupament sense el signe −'),
 ('geometria.js', "  const menor = j => { const cs = [0, 1, 2].filter(c => c !== j); return [[u[", "  const menor = j => { const cs = [0, 1, 2].filter(c => c !== 2 - j); return [[u[", 'menors del producte equivocats'),
 ('geometria.js', "const vectorial = (u, v) => [u[1].producte(v[2]).resta(u[2].producte(v[1])),", "const vectorial = (u, v) => [u[2].producte(v[1]).resta(u[1].producte(v[2])),", 'producte vectorial amb la x canviada de signe'),
 ('recta-plans.js', "  const u = w.map(x => x.quocient(k));", "  const u = w.map((x, j) => (j === 0 ? x : x.quocient(k)));", 'simplifica només algunes components'),
 ('recta-plans.js', "  const f = [2, 1, 0].find(j => !w[j].esZero());", "  const f = 2;", 'sempre z = 0'),
 ('recta-plans.js', "  const S2 = S.map(e => [e[altres[0]], e[altres[1]], e[3]]);", "  const S2 = S.map(e => [e[altres[1]], e[altres[0]], e[3]]);", 'sistema reduït amb les columnes girades'),
 ('geometria.js', "    const B = A.map((f, i) => f.map((x, j) => (j === k ? S[i][2] : x)));", "    const B = A.map((f, i) => f.map((x, j) => (j !== k ? S[i][2] : x)));", 'Cramer: canvia l\'altra columna'),
 ('geometria.js', "    const sol = N.quocient(D);", "    const sol = D.quocient(N);", 'Cramer: quocient girat'),
 ('recta-plans.js', "sol[altres.indexOf(j)]));", "sol[1 - altres.indexOf(j)]));", 'punt amb les coordenades girades'),
 ('recta-plans.js', "`\\\\pi_${i + 1}:\\\\quad ${G.texSubstitucio(normal(e), null, P)}", "`\\\\pi_${i + 1}:\\\\quad ${G.texSubstitucio(normal(S[0]), null, P)}", 'comprovació sempre amb el primer pla'),
 ('recta-plans.js', "`${x} = ${Mt.texLineal([P[j], u[j]])}`", "`${x} = ${Mt.texLineal([u[j], P[j]])}`", 'paramètriques amb punt i vector girats'),
 ('recta-plans.js', "  const signe = f === 1 ? 'l\\'oposada de la component' : 'la component';", "  const signe = 'la component';", 'text: el determinant sempre és la component'),
 ('recta-plans.js', "K('N2', `\\\\vec{n}_2 = ${texPunt(n2)}`)", "K('N2', `\\\\vec{n}_2 = ${texPunt(n1)}`)", 'n₂ copiat de n₁'),
]
det=0
for f,a,b,nom in MUT:
    d=os.path.join(tempfile.gettempdir(), 'pau-mutacio-mrp'); shutil.rmtree(d, ignore_errors=True); shutil.copytree(ORIG, d, ignore=shutil.ignore_patterns('mutacions', 'navegador', 'eines'))
    p=os.path.join(d,f); s=open(p).read()
    if s.count(a)!=1: print('NO APLICA', nom, s.count(a)); continue
    open(p,'w').write(s.replace(a,b,1))
    r=subprocess.run(['node', os.path.join(d,'proves/comprova.js'), 'recta donada'], capture_output=True, text=True, timeout=300)
    fa=r.returncode!=0; det+=fa
    l=[x for x in r.stdout.splitlines() if x.strip().startswith('·')][:1]
    print(('DETECTADA ' if fa else 'NO DETECTADA ')+nom, '|', l[0].strip()[:150] if l else '')
print(f'{det}/{len(MUT)}')
