import subprocess, shutil, os, tempfile
# Run from anywhere: python3 procediments/proves/mutacions/<this file>
ORIG=os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
MUT=[
 ('geometria.js', "  const d = arrelQuadrada(N.producte(N).quocient(S));", "  const d = arrelQuadrada(N.abs().quocient(S));", 'distància sense elevar al quadrat'),
 ('geometria.js', "`${M.texEntreParentesis(x)}^2`", "`${M.texNombre(x)}^2`", 'quadrats sense parèntesis (−1² = −1)'),
 ('distancies.js', "  const N = escalar(pla.n, Q).suma(pla.D), S = G.modul2(pla.n);", "  const N = escalar(pla.n, Q), S = G.modul2(pla.n);", 'oblida D a la distància'),
 ('distancies.js', "p.pi.D.oposada().quocient(p.pi.n[j])", "p.pi.D.quocient(p.pi.n[j])", 'el punt de π₁ amb el signe canviat'),
 ('distancies.js', "passosPuntPla(g, {Q, pla: p.sigma, nom:", "passosPuntPla(g, {Q, pla: p.pi, nom:", 'distància al pla del mateix punt'),
 ('distancies.js', "    if (!a.esZero()) {", "    if (a.esZero()) {", 'recta secant i paral·lela girades'),
 ('distancies.js', "    const Ds = [dn, dn.oposada()].map(x => x.suma(p.pi.D));", "    const Ds = [dn, dn.oposada()].map(x => x.resta(p.pi.D));", 'D′ amb el signe de D canviat'),
 ('distancies.js', "    const ls = [dn, dn.oposada()].map(x => x.resta(b).quocient(a));", "    const ls = [dn, dn.oposada()].map(x => x.suma(b).quocient(a));", 'λ amb b canviat de signe'),
 ('distancies.js', "    const W = G.modul2(w), U = G.modul2(p.r.u);", "    const W = G.modul2(w), U = G.modul2(p.P);", 'divideix pel mòdul d\'un altre vector'),
 ('geometria.js', "  const num = (a.num === 1 ? '' : a.num) + `\\\\sqrt{${m}}`;", "  const num = (a.num === 1 ? '' : a.den) + `\\\\sqrt{${m}}`;", 'simplificació de l\'arrel equivocada'),
 ('distancies.js', "\\\\neq ${M.texNombre(k)} \\\\cdot ${M.texEntreParentesis(p.pi.D)}", "\\\\neq ${M.texNombre(k)} \\\\cdot ${M.texEntreParentesis(p.sigma.D)}", 'compara D₂ amb ell mateix'),
]
det=0
for f,a,b,nom in MUT:
    d=os.path.join(tempfile.gettempdir(), 'pau-mutacio-mdist'); shutil.rmtree(d, ignore_errors=True); shutil.copytree(ORIG, d, ignore=shutil.ignore_patterns('mutacions', 'navegador', 'eines'))
    p=os.path.join(d,f); s=open(p).read()
    if s.count(a)!=1: print('NO APLICA', nom, s.count(a)); continue
    open(p,'w').write(s.replace(a,b,1))
    r=subprocess.run(['node', os.path.join(d,'proves/comprova.js'), 'distàncies'], capture_output=True, text=True, timeout=300)
    fa=r.returncode!=0; det+=fa
    l=[x for x in r.stdout.splitlines() if x.strip().startswith('·')][:1]
    print(('DETECTADA ' if fa else 'NO DETECTADA ')+nom, '|', l[0].strip()[:150] if l else '')
print(f'{det}/{len(MUT)}')
