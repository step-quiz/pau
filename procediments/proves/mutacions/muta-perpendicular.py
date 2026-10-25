import subprocess, shutil, os, tempfile
# Run from anywhere: python3 procediments/proves/mutacions/<this file>
ORIG=os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
MUT=[
 ('perpendicular-comuna.js', "[PQ[i], r.u[i].oposada(), s.u[i]]);", "[PQ[i], r.u[i], s.u[i]]);", 'Q_μ − P_λ amb +λu'),
 ('perpendicular-comuna.js', "escalar(w, e.map(x => x[0])).oposada()]);", "escalar(w, e.map(x => x[0]))]);", 'terme independent sense canviar de signe'),
 ('perpendicular-comuna.js', "  const Q0 = s.P.map((x, i) => x.suma(s.u[i].producte(m0)));", "  const Q0 = s.P.map((x, i) => x.suma(s.u[i].producte(l0)));", 'Q₀ amb λ'),
 ('perpendicular-comuna.js', "  const P0Q0 = resta(Q0, P0);", "  const P0Q0 = resta(P0, Q0);", 'P₀Q₀ girat'),
 ('perpendicular-comuna.js', "  if (G.esZero(P0Q0)) {", "  if (G.esZero(P0)) {", 'es tallen mal detectat'),
 ('perpendicular-comuna.js', "  const dir = G.vectorSimple(P0Q0);", "  const dir = G.vectorSimple(r.u);", 'perpendicular amb la direcció de r'),
 ('perpendicular-comuna.js', "condicio(s.u, '\\\\vec{v}', 'b')", "condicio(r.u, '\\\\vec{v}', 'b')", 'segona condició amb u'),
 ('perpendicular-comuna.js', "for (const [k, v] of [[a, L], [b, MU]])", "for (const [k, v] of [[a, MU], [b, L]])", 'λ i μ girats al text'),
 ('perpendicular-comuna.js', "' = ' + K('Ms', G.texModul(P0Q0))", "' = ' + K('Ms', G.texModul(P0))", 'mòdul d\'un altre vector'),
]
det=0
for f,a,b,nom in MUT:
    d=os.path.join(tempfile.gettempdir(), 'pau-mutacio-mpc'); shutil.rmtree(d, ignore_errors=True); shutil.copytree(ORIG, d, ignore=shutil.ignore_patterns('mutacions', 'navegador', 'eines'))
    p=os.path.join(d,f); s=open(p).read()
    if s.count(a)!=1: print('NO APLICA', nom, s.count(a)); continue
    open(p,'w').write(s.replace(a,b,1))
    r=subprocess.run(['node', os.path.join(d,'proves/comprova.js'), 'perpendicular comuna'], capture_output=True, text=True, timeout=300)
    fa=r.returncode!=0; det+=fa
    l=[x for x in r.stdout.splitlines() if x.strip().startswith('·')][:1]
    print(('DETECTADA ' if fa else 'NO DETECTADA ')+nom, '|', l[0].strip()[:150] if l else '')
print(f'{det}/{len(MUT)}')
