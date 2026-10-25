import subprocess, shutil, os, tempfile
# Run from anywhere: python3 procediments/proves/mutacions/<this file>
ORIG=os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
MUT=[
 ('matrius.js', "const B = n === 0 ? [[b[0], Mn[0][1]], [b[1], Mn[1][1]]] : [[Mn[0][0], b[0]], [Mn[1][0], b[1]]];", "const B = n === 0 ? [[Mn[0][0], b[0]], [Mn[1][0], b[1]]] : [[Mn[0][0], b[0]], [Mn[1][0], b[1]]];", 'Cramer canvia la columna equivocada'),
 ('matrius.js', "const b = [r1, r2].map(i => [S[i][3], S[i][f].oposada()]);", "const b = [r1, r2].map(i => [S[i][3], S[i][f]]);", 'λ passa a l\'altre costat sense canviar de signe'),
 ('matrius.js', "pintaSistema({[r1]: 'mes', [r2]: 'mes', [r3]: 'menys'});", "pintaSistema({[r3]: 'mes', [r2]: 'mes', [r1]: 'menys'});", 'treu una equació del menor'),
 ('matrius.js', "const components = [0, 1, 2].map(j => (j === f ? LAMBDA :", "const components = [0, 1, 2].map(j => (j === f ? '2' + LAMBDA :", 'la incògnita lliure val 2λ'),
 ('matrius.js', "if (d.signe() < 0) { n = oposatP(n); d = d.oposada(); }", "if (d.signe() < 0) { d = d.oposada(); }", 'simplifica el signe malament'),
 ('sistema-sci.js', "  orla(3, 2, '');", "  orla(f, 2, '');", 'no orla amb la columna b'),
 ('matrius.js', "else if (S[i][3].esZero()) dret = K(`G${k}l`, termeVar(S[i][f].oposada(), LAMBDA, true));\n    else dret = K(`G${k}d`, M.texNombre(S[i][3])) + K(`G${k}l`, termeVar(S[i][f].oposada(), LAMBDA, false));",
  "else if (S[i][3].esZero()) dret = K(`G${k}l`, termeVar(S[i][f], LAMBDA, true));\n    else dret = K(`G${k}d`, M.texNombre(S[i][3])) + K(`G${k}l`, termeVar(S[i][f], LAMBDA, false));", 'el sistema 2×2 escrit amb el signe de λ canviat'),
 ('matrius.js', "M.texNombre(valorP(solucio[j], 1))", "M.texNombre(valorP(solucio[j], 2))", 'la solució d\'exemple és la de λ = 2'),
 ('matrius.js', "const texNum = n === 0 ? `${fac(b[0])} \\\\cdot ${fac(Mn[1][1])} - ${fac(Mn[0][1])} \\\\cdot ${fac(b[1])}`", "const texNum = n === 0 ? `${fac(b[0])} \\\\cdot ${fac(Mn[1][1])} + ${fac(Mn[0][1])} \\\\cdot ${fac(b[1])}`", 'determinant 2×2 amb +'),
 ('sistema-sci.js', "  for (const fs of [[0, 1], [0, 2], [1, 2]]) for (const cs of [[0, 1], [0, 2], [1, 2]]) {", "  for (const fs of [[0, 1], [0, 2], [1, 2]]) for (const cs of [[0, 1], [0, 2], [1, 2], [0, 3]]) {", 'menor amb la columna b'),
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
