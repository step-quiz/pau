import subprocess, shutil, os, tempfile
# Run from anywhere: python3 procediments/proves/mutacions/<this file>
ORIG=os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
MUT=[
 ("const lim = pr.signe() * sq;", "const lim = sq;", 'signe del límit lateral'),
 ("const sq = valQ(r.suma(new Fraccio(s, 1000))).signe();", "const sq = valQ(r.suma(new Fraccio(1, 1000))).signe();", 'costat del denominador'),
 ("return {infinit: c.signe() * (cap < 0 && k % 2 ? -1 : 1)};", "return {infinit: c.signe()};", 'signe a −∞'),
 ("if (k < 0) return {finit: Fraccio.de(0)};", "if (k < 0) return {finit: Fraccio.de(1)};", 'límit 0 equivocat'),
 ("const N = M.termes(M.sumaPolinomis(coefs(P), M.producteDePolinomis(coefs(Q), [Fraccio.de(0), m.oposada()])));", "const N = M.termes(M.sumaPolinomis(coefs(P), M.producteDePolinomis(coefs(Q), [Fraccio.de(0), m])));", 'numerador de n'),
 ("const recta = tp(M.termes([n, m]));", "const recta = tp(M.termes([n.oposada(), m]));", 'recta obliqua'),
 ("g.classes[FILA.infinit] = 'destacat';", "", 'sense destacar ±∞'),
 ("linies.resum.push(K('Sh', `\\\\text{AH: } y = ${texNombre(l.finit)}`));", "linies.resum.push(K('Sh', `\\\\text{AH: } y = ${texNombre(l.finit.suma(Fraccio.de(1)))}`));", 'valor de la horitzontal'),
 ("passos.push([texNombre(c), 'Simplifica:", "passos.push([texNombre(c.producte(2)), 'Simplifica:", 'quocient de coeficients'),
 ("|| (!arrelsQ.arrels.length && residu(coefs(P), coefs(Q)).every(c => c.esZero()));", ";", 'factor comú irreductible acceptat'),
 ("const frac = `\\\\dfrac{${texNombre(pr)}}{0^{${sq < 0 ? '-' : '+'}}}`;", "const frac = `\\\\dfrac{${texNombre(pr.suma(Fraccio.de(1)))}}{0^{${sq < 0 ? '-' : '+'}}}`;", 'numerador del límit lateral'),
 ("const xQ = M.termes([Fraccio.de(0)].concat(coefs(Q)));", "const xQ = M.termes([Fraccio.de(0), Fraccio.de(0)].concat(coefs(Q)));", 'x·Q mal calculat'),
]
det=0
for a,b,nom in MUT:
    d=os.path.join(tempfile.gettempdir(), 'pau-mutacio-ma'); shutil.rmtree(d, ignore_errors=True); shutil.copytree(ORIG, d, ignore=shutil.ignore_patterns('mutacions', 'navegador', 'eines'))
    p=os.path.join(d,'asimptotes.js'); s=open(p).read()
    if s.count(a)!=1: print('NO APLICA', nom, s.count(a)); continue
    open(p,'w').write(s.replace(a,b,1))
    r=subprocess.run(['node', os.path.join(d,'proves/comprova.js')], capture_output=True, text=True)
    f=r.returncode!=0; det+=f
    l=[x for x in r.stdout.splitlines() if x.strip().startswith('·')][:1]
    print(('DETECTADA ' if f else 'NO DETECTADA ')+nom, '|', l[0].strip()[:150] if l else '')
print(f'{det}/{len(MUT)}')
