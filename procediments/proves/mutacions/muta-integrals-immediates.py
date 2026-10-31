import subprocess, shutil, os, tempfile
# Run from anywhere: python3 procediments/proves/mutacions/<this file>
ORIG=os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
F='integrals-immediates.js'
MUT=[
 (F, "['5 \\\\cdot \\\\frac{1}{2}e^{2x}',", "['5 \\\\cdot 2e^{2x}',", 'multiplica per k en lloc de dividir'),
 (F, "['\\\\frac{5}{2}e^{2x}', 'Opera", "['\\\\frac{5}{2}e^{x}', 'Opera", 'perd el 2 de l\'exponent'),
 (F, "['A \\\\cdot \\\\left(-\\\\frac{1}{2}\\\\right)e^{-2x}',", "['A \\\\cdot \\\\frac{1}{2}e^{-2x}',", 'perd el signe en completar la derivada'),
 (F, "['\\\\frac{A}{2} - \\\\frac{A}{2}e^{-2t}', 'Treu", "['-\\\\frac{A}{2} - \\\\frac{A}{2}e^{-2t}', 'Treu", 'menys per menys mal fet'),
 (F, "['\\\\frac{A}{2} = 1', 'Divideix", "['\\\\frac{A}{2} = 2', 'Divideix", 'equació del paràmetre mal resolta'),
 (F, "['3\\\\ln|2x + 1|', 'Ara és immediata", "['6\\\\ln|2x + 1|', 'Ara és immediata", 'oblida el 1/2 del logaritme'),
 (F, "['3\\\\ln 1', 'Opera dins del valor absolut.'], ['0', '$\\\\ln 1 = 0$.']", "['3\\\\ln 1', 'Opera dins del valor absolut.'], ['3', '$\\\\ln 1 = 0$.']", 'ln 1 = 1'),
 (F, "['3{,}30', 'Amb la calculadora", "['3{,}29', 'Amb la calculadora", 'arrodoniment dolent'),
 (F, "['3 + C = 2', '$\\\\ln e = 1$.']", "['C = 2', '$\\\\ln e = 1$.']", 'ln e = 0'),
 (F, "final: 'F(x) = 3\\\\ln|x - 1| - 1'", "final: 'F(x) = 3\\\\ln|x - 1| + 1'", 'resposta amb C equivocada'),
 (F, "['3 \\\\cdot 4 \\\\cdot \\\\left(-\\\\cos\\\\frac{x}{4}\\\\right)',", "['3 \\\\cdot 4 \\\\cdot \\\\cos\\\\frac{x}{4}',", 'primitiva del sinus sense el menys'),
 (F, "['-12\\\\cos 0', 'Simplifica la fracció.'], ['-12', '$\\\\cos 0 = 1$.']", "['-12\\\\cos 0', 'Simplifica la fracció.'], ['0', '$\\\\cos 0 = 1$.']", 'cos 0 = 0'),
 (F, "['2 \\\\cdot \\\\frac{1}{3}\\\\sin(3x)',", "['2 \\\\cdot 3\\\\sin(3x)',", 'cosinus: multiplica per 3'),
 (F, "['\\\\frac{x^{3/2}}{3/2} + \\\\frac{x^{-1}}{-1}',", "['\\\\frac{x^{3/2}}{3/2} + \\\\frac{x^{-3}}{-3}',", 'potència negativa: baixa l\'exponent'),
 (F, "['\\\\frac{61}{12} + \\\\frac{4}{12}',", "['\\\\frac{61}{12} - \\\\frac{4}{12}',", 'Barrow: resta mal el F(a) negatiu'),
 (F, "integral: '\\\\displaystyle\\\\int_{0}^{1} 5e^{2x}\\\\,dx', barrow: 'F(1) - F(0)'", "integral: '\\\\displaystyle\\\\int_{0}^{1} 5e^{2x}\\\\,dx', barrow: 'F(0) - F(1)'", 'Barrow al revés'),
]
det=0
for f,a,b,nom in MUT:
    d=os.path.join(tempfile.gettempdir(), 'pau-mutacio-ii'); shutil.rmtree(d, ignore_errors=True); shutil.copytree(ORIG, d, ignore=shutil.ignore_patterns('mutacions', 'navegador', 'eines'))
    p=os.path.join(d,f); s=open(p).read()
    if s.count(a)!=1: print('NO APLICA', nom, s.count(a)); continue
    open(p,'w').write(s.replace(a,b,1))
    r=subprocess.run(['node', os.path.join(d,'proves/comprova.js'), 'integrals immediates'], capture_output=True, text=True)
    fa=r.returncode!=0; det+=fa
    l=[x for x in r.stdout.splitlines() if x.strip().startswith('·')][:1]
    print(('DETECTADA ' if fa else 'NO DETECTADA ')+nom, '|', l[0].strip()[:160] if l else '')
print(f'{det}/{len(MUT)}')
