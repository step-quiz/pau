import subprocess, shutil, os, tempfile
# Run from anywhere: python3 procediments/proves/mutacions/<this file>
ORIG=os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
MUT=[
 ('projeccions.js', "    const s = {P: p.P, u: p.pi.n};", "    const s = {P: p.P, u: p.P};", 'perpendicular amb el punt com a vector'),
 ('projeccions.js', "    Qp = s.P.map((x, i) => x.suma(s.u[i].producte(l0)));", "    Qp = s.P.map((x, i) => x.resta(s.u[i].producte(l0)));", 'Q amb −λ'),
 ('projeccions.js', "    const PR = {P: resta(r.P, p.P), u: r.u};", "    const PR = {P: resta(p.P, r.P), u: r.u};", 'PR girat'),
 ('projeccions.js', "    Qp = r.P.map((x, i) => x.suma(r.u[i].producte(l0)));", "    Qp = p.P.map((x, i) => x.suma(r.u[i].producte(l0)));", 'Q des de P'),
 ('projeccions.js', "    const S = Qp.map((q, i) => q.producte(2).resta(p.P[i]));", "    const S = Qp.map((q, i) => q.producte(2).suma(p.P[i]));", 'simètric 2Q + P'),
 ('projeccions.js', "`2 \\\\cdot ${M.texEntreParentesis(q)} - ${M.texEntreParentesis(p.P[i])}`", "`2 \\\\cdot ${M.texEntreParentesis(p.P[i])} - ${M.texEntreParentesis(q)}`", 'components de 2P − Q'),
 ('projeccions.js', "    if (!simetric) g.classes[FILA.peu] = 'final';\n    g.afegeix(`$\\\\lambda = ${M.texNombre(l0)}$. Posa-ho al punt genèric de $s$", "    g.afegeix(`$\\\\lambda = ${M.texNombre(l0)}$. Posa-ho al punt genèric de $s$", 'resposta sense destacar'),
 ('geometria.js', "  const a = escalar(pla.n, r.u), c = escalar(pla.n, r.P).suma(pla.D || fr(0)).oposada();", "  const a = escalar(pla.n, r.u), c = escalar(pla.n, r.P).oposada();", 'oblida D a l\'equació'),
 ('projeccions.js', "G.esquema(`${simetric ? 'simetric' : 'projeccio'}-", "G.esquema(`${'simetric'}-", 'P′ a l\'esquema encara que no el demanin'),
]

det=0
for f,a,b,nom in MUT:
    d=os.path.join(tempfile.gettempdir(), 'pau-mutacio-mproj'); shutil.rmtree(d, ignore_errors=True); shutil.copytree(ORIG, d, ignore=shutil.ignore_patterns('mutacions', 'navegador', 'eines'))
    p=os.path.join(d,f); s=open(p).read()
    if s.count(a)!=1: print('NO APLICA', nom, s.count(a)); continue
    open(p,'w').write(s.replace(a,b,1))
    r=subprocess.run(['node', os.path.join(d,'proves/comprova.js'), 'projeccions'], capture_output=True, text=True, timeout=300)
    fa=r.returncode!=0; det+=fa
    l=[x for x in r.stdout.splitlines() if x.strip().startswith('·')][:1]
    print(('DETECTADA ' if fa else 'NO DETECTADA ')+nom, '|', l[0].strip()[:150] if l else '')
print(f'{det}/{len(MUT)}')
