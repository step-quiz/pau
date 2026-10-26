import subprocess, shutil, os, tempfile
# Run from anywhere: python3 procediments/proves/mutacions/<this file>
ORIG=os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
MUT=[
 ('matrius.js', "      const a = p.num, b = -e.num;                       // a·e + b·p = 0", "      const a = p.num, b = e.num;", 'b amb el signe canviat'),
 ('matrius.js', "    if (k !== r) intercanvi(", "    if (false) intercanvi(", 'sense canviar files quan cal'),
 ('sistema-sci.js', "    valor[pc] = perQ(R_, M.Fraccio.de(1).quocient(a));", "    valor[pc] = perQ(R_, M.Fraccio.de(1).quocient(a.oposada()));", 'divideix pel signe contrari'),
 ('sistema-sci.js', "  valor[f] = [M.Fraccio.de(0), M.Fraccio.de(1)];", "  valor[f] = [M.Fraccio.de(1), M.Fraccio.de(1)];", 'la incògnita lliure no és λ'),
 ('sistema-sci.js', "      const dreta = (d.esZero() ? '' : M.texNombre(d)) + altres.map((j, k) => sumand(fl[j].oposada(), j, d.esZero() && k === 0)).join('');",
  "      const dreta = (d.esZero() ? '' : M.texNombre(d)) + altres.map((j, k) => sumand(fl[j], j, d.esZero() && k === 0)).join('');", 'passa els termes sense canviar el signe'),
 ('sistema-sci.js', "  const punt = [0, 1, 2].map(j => valor[j][0]), vector = [0, 1, 2].map(j => valor[j][1]);", "  const punt = [0, 1, 2].map(j => valor[j][1]), vector = [0, 1, 2].map(j => valor[j][0]);", 'punt i vector intercanviats'),
 ('sistema-sci.js', "  g.files[FILA.esglaonat] = Mt.texSistema(B, {P: 'E', marca: i => (i === 2 ? 'tria' : '')});", "  g.files[FILA.esglaonat] = Mt.texSistema(S, {P: 'E', marca: i => (i === 2 ? 'tria' : '')});", 'el sistema esglaonat és l\'original'),
]
det=0
for f,a,b,nom in MUT:
    d=os.path.join(tempfile.gettempdir(), 'pau-mutacio-msci'); shutil.rmtree(d, ignore_errors=True); shutil.copytree(ORIG, d, ignore=shutil.ignore_patterns('mutacions', 'navegador', 'eines'))
    p=os.path.join(d,f); s=open(p).read()
    if s.count(a)!=1: print('NO APLICA', nom, s.count(a)); continue
    open(p,'w').write(s.replace(a,b,1))
    r=subprocess.run(['node', os.path.join(d,'proves/comprova.js'), 'indeterminat'], capture_output=True, text=True)
    fa=r.returncode!=0; det+=fa
    l=[x for x in r.stdout.splitlines() if x.strip().startswith('·')][:1]
    print(('DETECTADA ' if fa else 'NO DETECTADA ')+nom, '|', l[0].strip()[:160] if l else '')
print(f'{det}/{len(MUT)}')
