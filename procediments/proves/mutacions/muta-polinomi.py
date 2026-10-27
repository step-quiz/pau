import subprocess, shutil, sys, os, tempfile
# Run from anywhere: python3 procediments/proves/mutacions/<this file>
ORIG=os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
MUT=[
 ('polinomi-condicions.js', "[p.potencia(2).producte(3), p.producte(2), u, zero]", "[p.potencia(2).producte(2), p.producte(2), u, zero]", "coeficients de f' mal calculats"),
 ('polinomi-condicions.js', "[`3a \\\\cdot ${t}^{2}`, `2b \\\\cdot ${t}`, 'c']", "[`3a \\\\cdot ${t}^{3}`, `2b \\\\cdot ${t}`, 'c']", 'substitució mal escrita'),
 ('polinomi-condicions.js', "{ordre: 0, x: 2, valor: 20, avis: 'u',", "{ordre: 0, x: 2, valor: 20000, avis: 'u',", 'dada amb unitats errònies'),
 ('polinomi-condicions.js', "return d.condicions.length > 1 ? 'doble' : 'condicio';", "return 'condicio';", 'sense marca ×2'),
 ('polinomi-condicions.js', "const signe = v.signe() < 0 ? '<' : '>';", "const signe = v.signe() < 0 ? '>' : '<';", 'signe de la comprovació'),
 ('polinomi-condicions.js', "solucio: {a: 1, b: -6, c: 9, d: -1},", "solucio: {a: 1, b: -6, c: 9, d: 1},", 'solució de les dades'),
 ('polinomi-condicions.js', "const extrems = condicions.filter(c => c.extrem)", "const extrems = condicions.filter(c => c.extrem && c.x !== 2)", 'falta una comprovació'),
 ('polinomi-condicions.js', "if (i === 0) return `⟦${t.v}:${t.c.signe() < 0 ? '-' : ''}${cos}⟧`;", "if (i === 0) return `⟦${t.v}:${cos}⟧`;", 'signe del primer terme'),
 ('polinomi-condicions.js', "{ordre: 1, x: 3, valor: 0, extrem: 'minim',", "{ordre: 1, x: 3, valor: 0, extrem: 'maxim',", 'tipus d\'extrem'),
 ('polinomi-condicions.js', "{L: 'H', tex: '6ax + 2b'}", "{L: 'H', tex: '6ax + b'}", "f'' general"),
 ('polinomi-condicions.js', "g.files[FILA.resposta] = resposta + termes.map((t, i) => {", "g.files[FILA.resposta] = resposta + termes.slice(1).map((t, i) => {", 'resposta incompleta'),
('polinomi-condicions.js', "return caixa && !subs && esValor(L) >= 0 ? `\\\\boxed{${tex}}` : tex;", "return tex;", 'valors trobats sense requadrar'),
 ('matrius.js', "  linies.push(`\\\\hline & ${texSuma ? texSuma(S) : K(P + '2', eq(S))}`);", "  linies.push(` & ${texSuma ? texSuma(S) : K(P + '2', eq(S))}`);", 'combinació sense la ratlla de la suma'),
 ('matrius.js', "`${etiqueta(eqs[1], m2)} & ${K(P + '1', eq(B))}`", "`${etiqueta(eqs[1], m2)} & ${K(P + '1', eq(E2))}`", "l'equació multiplicada, sense multiplicar"),
 ('polinomi-condicions.js', "if (v[x] !== undefined && !L.coef[j].esZero()) { L.r = L.r.resta(", "if (v[x] !== undefined && !L.coef[j].esZero()) { L.r = L.r.suma(", 'substitució simplificada amb el signe girat'),
 ('polinomi-condicions.js', "Mt.texSistemaEq(linies)", "`\\\\begin{cases} ${linies.join(' \\\\\\\\ ')} \\\\end{cases}`", 'sistema sense les etiquetes (EQ.n)'),
]
total=0; detectades=0
for fitxer, a, b, nom in MUT:
    d=os.path.join(tempfile.gettempdir(), 'pau-mutacio-m')
    shutil.rmtree(d, ignore_errors=True)
    shutil.copytree(ORIG, d, ignore=shutil.ignore_patterns('mutacions', 'navegador', 'eines'))
    p=os.path.join(d, fitxer)
    s=open(p).read()
    if s.count(a)!=1:
        print('NO APLICA:', nom, s.count(a)); continue
    open(p,'w').write(s.replace(a,b,1))
    r=subprocess.run(['node', os.path.join(d,'proves/comprova.js'), 'polinomi a partir'], capture_output=True, text=True)
    total+=1
    falla = r.returncode!=0
    detectades+=falla
    linia=[l for l in r.stdout.splitlines() if l.strip().startswith('·')][:1]
    print(('DETECTADA ' if falla else 'NO DETECTADA ')+nom, '|', (linia[0].strip()[:150] if linia else ''))
print(f'{detectades}/{total}')
