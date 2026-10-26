import subprocess, shutil, os, tempfile
# Run from anywhere: python3 procediments/proves/mutacions/<this file>
ORIG=os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
MUT=[
 ('geometria.js', "  const k = b[i].quocient(a[i]);", "  const k = a[i].quocient(b[i]);", 'proporció amb k invertida'),
 ('dues-rectes.js', "const S = [0, 1, 2].map(i => [r.u[i], s.u[i].oposada(), PQ[i]]);", "const S = [0, 1, 2].map(i => [r.u[i], s.u[i], PQ[i]]);", 'μ passa sense canviar de signe'),
 ('dues-rectes.js', "  const PQ = resta(s.P, r.P);", "  const PQ = resta(r.P, s.P);", 'PQ girat'),
 ('dues-rectes.js', "[[0, 1], [0, 2], [1, 2]].find(([a, b]) => !det(a, b).esZero());", "[[0, 1], [0, 2], [1, 2]].find(([a, b]) => true);", 'tria un parell de determinant 0'),
 ('dues-rectes.js', "    tallen = vk.igual(S[k][2]);", "    tallen = true;", 'sempre es tallen'),
 ('dues-rectes.js', "const Rp = r.P.map((x, c) => x.suma(r.u[c].producte(l0)));", "const Rp = r.P.map((x, c) => x.suma(r.u[c].producte(m0)));", 'R amb μ a la recta r'),
 ('dues-rectes.js', "    const coincidents = cert && valors.every(x => x.igual(valors[0]));", "    const coincidents = valors.every(x => x.igual(valors[0]));", 'oblida les equacions sense λ'),
 ('dues-rectes.js', "G.esquema(tallen ? 'rectes-es-tallen' : 'rectes-es-creuen')", "G.esquema(tallen ? 'rectes-es-creuen' : 'rectes-es-tallen')", 'esquemes girats'),
 ('dues-rectes.js', "parametriques('s', s, MU, 'Ps')", "parametriques('s', r, MU, 'Ps')", 'paramètriques de s amb les dades de r'),
 ('geometria.js', "      let m1 = c.oposada().quocient(d), m2 = a.quocient(d);", "      let m1 = c.quocient(d), m2 = a.quocient(d);", 'reducció: els coeficients no queden oposats'),
 ('dues-rectes.js', "K('Tq', tq, tallen ? 'mes' : 'menys')", "K('Tq', tq, 'mes')", 'la tercera equació sempre en verd'),
 ('dues-rectes.js', "S[c][0].esZero() && S[c][1].esZero() && !S[c][2].esZero());", "S[c][0].esZero() && S[c][1].esZero());", '0 = 0 com si fos impossible'),
 ('dues-rectes.js', "' = ' + K('Ib', G.texGeneric(s, MU))", "' = ' + K('Ib', G.texGeneric(s))", 'la recta s amb λ'),
 ('dues-rectes.js', "(r.u[i].esZero() ? null : PQ[i].quocient(r.u[i]))", "(r.u[i].esZero() ? null : PQ[i].quocient(r.u[i]).oposada())", 'λ aïllat amb el signe canviat'),
]
det=0
for f,a,b,nom in MUT:
    d=os.path.join(tempfile.gettempdir(), 'pau-mutacio-mdr'); shutil.rmtree(d, ignore_errors=True); shutil.copytree(ORIG, d, ignore=shutil.ignore_patterns('mutacions', 'navegador', 'eines'))
    p=os.path.join(d,f); s=open(p).read()
    if s.count(a)!=1: print('NO APLICA', nom, s.count(a)); continue
    open(p,'w').write(s.replace(a,b,1))
    r=subprocess.run(['node', os.path.join(d,'proves/comprova.js'), 'dues rectes'], capture_output=True, text=True, timeout=300)
    fa=r.returncode!=0; det+=fa
    l=[x for x in r.stdout.splitlines() if x.strip().startswith('·')][:1]
    print(('DETECTADA ' if fa else 'NO DETECTADA ')+nom, '|', l[0].strip()[:150] if l else '')
print(f'{det}/{len(MUT)}')
