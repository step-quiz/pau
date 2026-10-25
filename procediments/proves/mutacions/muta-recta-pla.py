import subprocess, shutil, os, tempfile
# Run from anywhere: python3 procediments/proves/mutacions/<this file>
ORIG=os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
MUT=[
 ('geometria.js', "(a.igual(1) ? '' : M.texNombre(a)) + `(${Mt.texLineal(e, L)})`;", "(a.igual(1) ? '' : M.texNombre(a)) + `(${Mt.texLineal([e[1], e[0]], L)})`;", 'substitució amb la coordenada girada'),
 ('geometria.js', "    if (!x[1].esZero()) peces.push([c.producte(x[1]), L]);", "    if (!x[1].esZero()) peces.push([x[1], L]);", 'desenvolupament sense multiplicar el terme en λ'),
 ('geometria.js', "c = escalar(pla.n, r.P).suma(pla.D || fr(0)).oposada();", "c = escalar(pla.n, r.P).suma(pla.D || fr(0));", 'els nombres passen sense canviar de signe'),
 ('recta-pla.js', "    l0 = c.quocient(a);", "    l0 = c.quocient(a).oposada();", 'λ amb el signe canviat'),
 ('recta-pla.js', "    Q = r.P.map((x, i) => x.suma(r.u[i].producte(l0)));", "    Q = r.P.map((x, i) => x.suma(r.u[i]).producte(l0));", 'Q = (P + u)·λ'),
 ('recta-pla.js', "  } else if (!c.esZero()) {", "  } else if (c.esZero()) {", 'paral·lela i continguda girades'),
 ('recta-pla.js', "  const punt = cas === 'secant' ? ['Q', Q] : ['P', r.P];", "  const punt = cas === 'secant' ? ['Q', r.P] : ['P', r.P];", 'comprovació de Q amb el punt P'),
 ('geometria.js', "`${M.texEntreParentesis(x)} \\\\cdot ${M.texEntreParentesis(v[i])}`", "`${M.texEntreParentesis(x)} \\\\cdot ${M.texEntreParentesis(v[(i + 1) % 3])}`", 'producte escalar amb les components desaparellades'),
 ('recta-pla.js', "{secant: 'recta-secant', paralela: 'recta-paralela',", "{secant: 'recta-paralela', paralela: 'recta-paralela',", 'esquema d\'un altre cas'),
 ('geometria.js', "Mt.texLineal([a, u[i]], l)", "Mt.texLineal([a, u[(i + 1) % 3]], l)", 'punt genèric amb el vector desordenat'),
 ('recta-pla.js', "${M.texNombre(a)}${a.esZero() ? '' : ' \\\\neq 0'}`);", "${M.texNombre(a)} \\\\neq 0`);", 'u · n ≠ 0 sempre'),
]
det=0
for f,a,b,nom in MUT:
    d=os.path.join(tempfile.gettempdir(), 'pau-mutacio-mrpl'); shutil.rmtree(d, ignore_errors=True); shutil.copytree(ORIG, d, ignore=shutil.ignore_patterns('mutacions', 'navegador', 'eines'))
    p=os.path.join(d,f); s=open(p).read()
    if s.count(a)!=1: print('NO APLICA', nom, s.count(a)); continue
    open(p,'w').write(s.replace(a,b,1))
    r=subprocess.run(['node', os.path.join(d,'proves/comprova.js'), 'recta i pla'], capture_output=True, text=True, timeout=300)
    fa=r.returncode!=0; det+=fa
    l=[x for x in r.stdout.splitlines() if x.strip().startswith('·')][:1]
    print(('DETECTADA ' if fa else 'NO DETECTADA ')+nom, '|', l[0].strip()[:150] if l else '')
print(f'{det}/{len(MUT)}')
