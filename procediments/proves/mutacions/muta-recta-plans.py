import subprocess, shutil, os, tempfile
# Run from anywhere: python3 procediments/proves/mutacions/<this file>
ORIG=os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
MUT=[
 ('geometria.js', "c: pr.n < 3 ? pr.c : pr.c.oposada()}))", "c: pr.c}))", 'Sarrus: treu el segon claudàtor sense canviar signes'),
 ('geometria.js', "const SARRUS_SIMBOLS = Object.freeze([[0, 1, 2], [1, 2, 0],", "const SARRUS_SIMBOLS = Object.freeze([[0, 1, 2], [1, 0, 2],", 'Sarrus: un triangle equivocat'),
 ('geometria.js', "const vectorial = (u, v) => [u[1].producte(v[2]).resta(u[2].producte(v[1])),", "const vectorial = (u, v) => [u[2].producte(v[1]).resta(u[1].producte(v[2])),", 'producte vectorial amb la x canviada de signe'),
 ('recta-plans.js', "  const u = w.map(x => x.quocient(k));", "  const u = w.map((x, j) => (j === 0 ? x : x.quocient(k)));", 'simplifica només algunes components'),
 ('recta-plans.js', "  const f = [2, 1, 0].find(j => !w[j].esZero());", "  const f = 2;", 'sempre z = 0'),
 ('recta-plans.js', "  const S2 = S.map(e => [e[altres[0]], e[altres[1]], e[3]]);", "  const S2 = S.map(e => [e[altres[1]], e[altres[0]], e[3]]);", 'sistema reduït amb les columnes girades'),
 ('geometria.js', "      let m1 = c.oposada().quocient(d), m2 = a.quocient(d);", "      let m1 = c.quocient(d), m2 = a.quocient(d);", 'reducció: els coeficients no queden oposats'),
 ('geometria.js', "  const resta = c.resta(cq.producte(sq));", "  const resta = c.suma(cq.producte(sq));", 'reducció: passa el nombre sense canviar el signe'),
 ('recta-plans.js', "sol[altres.indexOf(j)]));", "sol[1 - altres.indexOf(j)]));", 'punt amb les coordenades girades'),
 ('recta-plans.js', "${Mt.texEquacio(e.slice(0, 3), e[3])}`));", "${Mt.texEquacio(S[0].slice(0, 3), S[0][3])}`));", 'π₂ escrit amb l\'equació de π₁'),
 ('recta-plans.js', "`${x} = ${Mt.texLineal([P[j], u[j]])}`", "`${x} = ${Mt.texLineal([u[j], P[j]])}`", 'paramètriques amb punt i vector girats'),
 ('recta-plans.js', "K('Fz', `${VARS[f]} = 0`)", "K('Fz', `${VARS[2]} = 0`)", 'escriu z = 0 encara que se\'n fixi una altra'),
 ('recta-plans.js', "texPunt([n1, n2][i])", "texPunt([n1, n1][i])", 'n₂ copiat de n₁'),
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
