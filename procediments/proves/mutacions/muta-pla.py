import subprocess, shutil, os, tempfile
# Run from anywhere: python3 procediments/proves/mutacions/<this file>
ORIG=os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
MUT=[
 ('geometria.js', "const n = [0, 1, 2].map(j => { const m = Mt.det2N(menor(j)); return j === 1 ? m.oposada() : m; });", "const n = [0, 1, 2].map(j => Mt.det2N(menor(j)));", 'oblida el signe − del segon menor'),
 ('geometria.js', "    const cs = [0, 1, 2].filter(c => c !== j);", "    const cs = [0, 1, 2].filter(c => c !== (j + 1) % 3);", 'menor equivocat'),
 ('geometria.js', "  const D = escalar(n, P).oposada();", "  const D = escalar(n, P);", 'D amb el signe canviat'),
 ('pla.js', "pla = G.passosPlaNormal(g, {P: p.P, n: p.r.u, files: FILA,", "pla = G.passosPlaNormal(g, {P: p.P, n: p.r.P, files: FILA,", 'perpendicular amb un punt com a normal'),
 ('pla.js', "    const Mm = p.A.map((x, i) => x.suma(p.B[i]).quocient(2));", "    const Mm = p.A.map((x, i) => x.suma(p.B[i]));", 'punt mitjà sense dividir'),
 ('pla.js', "    const D = G.escalar(n, p.P).oposada();", "    const D = G.escalar(n, p.P);", 'paral·lel: D amb el signe canviat'),
 ('pla.js', "      comprova = [['A', p.A], ['B', p.B], ['C', p.C]];", "      comprova = [['A', p.B], ['B', p.B], ['C', p.C]];", 'comprovació amb un altre punt'),
 ('pla.js', "      [P, v1, v2] = [p.r.P, p.r.u, p.pi.n];", "      [P, v1, v2] = [p.r.P, p.r.u, p.r.P];", 'conté-perpendicular sense la normal'),
 ('geometria.js', "  const fila1 = VARS.map((v, i) => texMenys(v, P[i]));", "  const fila1 = VARS.map((v, i) => texMenys(v, P[i].oposada()));", 'determinant amb x + a'),
]
det=0
for f,a,b,nom in MUT:
    d=os.path.join(tempfile.gettempdir(), 'pau-mutacio-mpla'); shutil.rmtree(d, ignore_errors=True); shutil.copytree(ORIG, d, ignore=shutil.ignore_patterns('mutacions', 'navegador', 'eines'))
    p=os.path.join(d,f); s=open(p).read()
    if s.count(a)!=1: print('NO APLICA', nom, s.count(a)); continue
    open(p,'w').write(s.replace(a,b,1))
    r=subprocess.run(['node', os.path.join(d,'proves/comprova.js'), 'pla'], capture_output=True, text=True, timeout=300)
    fa=r.returncode!=0; det+=fa
    l=[x for x in r.stdout.splitlines() if x.strip().startswith('·')][:1]
    print(('DETECTADA ' if fa else 'NO DETECTADA ')+nom, '|', l[0].strip()[:150] if l else '')
print(f'{det}/{len(MUT)}')
