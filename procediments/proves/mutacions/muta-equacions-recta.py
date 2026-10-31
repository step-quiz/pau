import subprocess, shutil, os, tempfile
# Run from anywhere: python3 procediments/proves/mutacions/<this file>
ORIG=os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
F='equacions-recta.js'
MUT=[
 (F, "const menys = (v, a) => (a instanceof Fraccio ? G.texMenys(v, a) :", "const menys = (v, a) => (a instanceof Fraccio ? G.texMenys(v, a.oposada()) :", 'contínua amb el punt sense canviar el signe'),
 (F, "const texVectorial = (nom, P, u) => `${nom}:\\\\ (x,\\\\ y,\\\\ z) = ${texPunt(P)} + \\\\lambda${texPunt(u)}`;",
     "const texVectorial = (nom, P, u) => `${nom}:\\\\ (x,\\\\ y,\\\\ z) = ${texPunt(u)} + \\\\lambda${texPunt(P)}`;", 'vectorial amb el punt i el vector intercanviats'),
 (F, "`${v} = ${lineal(P[i], u[i])}`", "`${v} = ${lineal(P[i], u[(i + 1) % 3])}`", 'paramètriques amb el vector desplaçat'),
 (F, "const apart = VARS.map((v, i) => [v, i]).filter(([, i]) => u[i].esZero()).map(([v, i]) => `${v} = ${texC(P[i])}`);",
     "const apart = [];", 'oblida la coordenada amb component 0'),
 (F, "{id: 'amagada', nom: 'Contínua amagada', P: p3(1, 0, 0), u: p3(1, 1, -1)},", "{id: 'amagada', nom: 'Contínua amagada', P: p3(1, 0, 0), u: p3(1, 1, 1)},", '−z llegit com a +z'),
 (F, "{id: 'parametre', nom: 'Amb un paràmetre', P: p3(0, 0, '-m'), u: p3(1, -1, 1)},", "{id: 'parametre', nom: 'Amb un paràmetre', P: p3(0, 0, 'm'), u: p3(1, -1, 1)},", 'el punt amb +m'),
 (F, "{id: 'coeficient', nom: 'Un coeficient a la x', P: p3(fr(1, 2), -2, 0), u: p3(fr(1, 2), 3, 1)},", "{id: 'coeficient', nom: 'Un coeficient a la x', P: p3(1, -2, 0), u: p3(2, 3, 1)},", 'coeficient: punt 1 i vector 2'),
 (F, "const v = G.escala(p.u, 2);", "const v = G.escala(p.u, 3);", 'v = 3u escrit com 2u'),
 (F, "const u = G.resta(p.B, p.A);", "const u = G.suma(p.B, p.A);", 'vector AB com A + B'),
 (F, "const pla = G.passosPlaDeterminant(g, {P: p.P, v1: p.u, v2: p.v, files: FILA, nomP: 'P'});", "const pla = G.passosPlaDeterminant(g, {P: p.P, v1: p.u, v2: p.P, files: FILA, nomP: 'P'});", 'el pla amb el punt com a vector'),
]
det=0
for f,a,b,nom in MUT:
    d=os.path.join(tempfile.gettempdir(), 'pau-mutacio-er'); shutil.rmtree(d, ignore_errors=True); shutil.copytree(ORIG, d, ignore=shutil.ignore_patterns('mutacions', 'navegador', 'eines'))
    p=os.path.join(d,f); s=open(p).read()
    if s.count(a)!=1: print('NO APLICA', nom, s.count(a)); continue
    open(p,'w').write(s.replace(a,b,1))
    r=subprocess.run(['node', os.path.join(d,'proves/comprova.js'), 'equacions de la recta'], capture_output=True, text=True)
    fa=r.returncode!=0; det+=fa
    l=[x for x in r.stdout.splitlines() if x.strip().startswith('·')][:1]
    print(('DETECTADA ' if fa else 'NO DETECTADA ')+nom, '|', l[0].strip()[:160] if l else '')
print(f'{det}/{len(MUT)}')
