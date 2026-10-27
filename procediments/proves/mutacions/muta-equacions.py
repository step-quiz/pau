import subprocess, shutil, os, tempfile
# Mutacions de les convencions de les equacions (Formules.resolEquacio i les pàgines que la fan servir):
# l'equació es queda a la seva fila, primer l'equació tal com es planteja, lila a les solucions, tatxat fora del domini.
# Run from anywhere: python3 procediments/proves/mutacions/muta-equacions.py
ORIG=os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
MUT=[
 ('formules.js', "sol.forEach(s => (!serveix || serveix(s.valor) ? marcaSolucio : tatxaSolucio)(g, s.fila, s.clau));",
  "sol.forEach(s => (!serveix || serveix(s.valor) ? tatxaSolucio : marcaSolucio)(g, s.fila, s.clau));", 'lila i tatxat girats', 'creixement'),
 ('formules.js', "if (!baixat) { baixat = true; t[fila] = davant + copiaQuieta(equacio); }",
  "if (!baixat) { baixat = true; t[fila] = ''; }", "l'equació no es queda a la seva fila", 'equacions de formules.js'),
 ('optimitzacio.js', "g.files[FILA.calcul] = F.membreEsquerre('e', f, v, 1) + K('ez', '0');",
  "g.files[FILA.calcul] = '';", "sense A'(x) = 0 tal com es planteja", 'optimització'),
 ('creixement.js', "serveix: a => !esFora(a),", "serveix: () => true,", 'punt crític fora del domini sense tatxar', 'creixement'),
 ('discussio.js', "const solucions = Mt.texSolucions(arrels.map(r => M.Fraccio.de(r)), X);",
  "const solucions = Mt.texSolucions(arrels.slice(1).map(r => M.Fraccio.de(r)), X);", 'resum de |A| = 0 incomplet', 'discussió'),
 ('recta-tangent.js', "const parentesi = (s, a) => O('Tm3', '\\\\cdot') + K('Tl3', '(')",
  "const parentesi = (s, a) => '\\\\,' + K('Tl3', '(')", 'm(x − x₀) sense punt', 'regles generals'),
 ('extrems.js', "const solucions = F.resolEquacio(g, {fila: 1, treball: 2, P: 'e', termes: d1, text: 'Substitueix $f\\'(x)$ per la seva expressió.', lila: true,",
  "const solucions = F.resolEquacio(g, {fila: 1, treball: 2, P: 'e', termes: d1, text: 'Substitueix $f\\'(x)$ per la seva expressió.', lila: false,", 'punts crítics sense lila', 'extrems'),
 ('asimptotes.js', "const sol = F.resolEquacio(g, {fila: FILA.calcul, treball: FILA.domini,",
  "const sol = F.resolEquacio(g, {fila: FILA.domini, treball: FILA.calcul,", 'files de l\'equació i de treball girades', 'asímptotes'),
]
det=0
for f,a,b,nom,seccio in MUT:
    d=os.path.join(tempfile.gettempdir(), 'pau-mutacio-equacions'); shutil.rmtree(d, ignore_errors=True); shutil.copytree(ORIG, d, ignore=shutil.ignore_patterns('mutacions', 'navegador', 'eines'))
    p=os.path.join(d,f); s=open(p).read()
    if s.count(a)!=1: print('NO APLICA', nom, s.count(a)); continue
    open(p,'w').write(s.replace(a,b,1))
    r=subprocess.run(['node', os.path.join(d,'proves/comprova.js'), seccio], capture_output=True, text=True, timeout=900)
    fa=r.returncode!=0; det+=fa
    l=[x for x in r.stdout.splitlines() if x.strip().startswith('·')][:1]
    print(('DETECTADA ' if fa else 'NO DETECTADA ')+nom, '|', l[0].strip()[:150] if l else '')
print(f'{det}/{len(MUT)}')
