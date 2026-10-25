import subprocess, shutil, sys, os, tempfile
# Run from anywhere: python3 procediments/proves/mutacions/<this file>
ORIG=os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
MUT=[
 ('polinomi-condicions.js', "sistema: {4: 'q4: ⟦a:-2a⟧ = ⟦r:-2⟧'}", "sistema: {4: 'q4: ⟦a:-2a⟧ = ⟦r:2⟧'}", 'pas de resolució fals'),
 ('polinomi-condicions.js', "[p.potencia(2).producte(3), p.producte(2), u, zero]", "[p.potencia(2).producte(2), p.producte(2), u, zero]", "coeficients de f' mal calculats"),
 ('polinomi-condicions.js', "[`3a \\\\cdot ${t}^{2}`, `2b \\\\cdot ${t}`, 'c']", "[`3a \\\\cdot ${t}^{3}`, `2b \\\\cdot ${t}`, 'c']", 'substitució mal escrita'),
 ('polinomi-condicions.js', "{ordre: 0, x: 2, valor: 20, avis: 'u',", "{ordre: 0, x: 2, valor: 20000, avis: 'u',", 'dada amb unitats errònies'),
 ('polinomi-condicions.js', "return d.condicions.length > 1 ? 'doble' : 'condicio';", "return 'condicio';", 'sense marca ×2'),
 ('polinomi-condicions.js', "const signe = v.signe() < 0 ? '<' : '>';", "const signe = v.signe() < 0 ? '>' : '<';", 'signe de la comprovació'),
 ('polinomi-condicions.js', "solucio: {a: 1, b: -6, c: 9, d: -1},", "solucio: {a: 1, b: -6, c: 9, d: 1},", 'solució de les dades'),
 ('polinomi-condicions.js', "const extrems = condicions.filter(c => c.extrem)", "const extrems = condicions.filter(c => c.extrem && c.x !== 2)", 'falta una comprovació'),
 ('polinomi-condicions.js', "sistema: {1: 'q1: ⟦c:c⟧ = ⟦r:9⟧', 3: 'q5: ⟦e:b⟧ = ⟦r:-6⟧'}", "sistema: {1: 'q1: ⟦c:c⟧ = ⟦r:9⟧', 3: 'q5: ⟦e:b⟧ = ⟦r:-6a⟧'}", 'sistema final no resolt'),
 ('polinomi-condicions.js', "calcul: 'q5: ⟦e:2a⟧ = ⟦r:4⟧'", "calcul: 'q5: ⟦e:2a⟧ = ⟦r:-4⟧'", 'càlcul auxiliar fals'),
 ('polinomi-condicions.js', "if (i === 0) return `⟦${t.v}:${t.c.signe() < 0 ? '-' : ''}${cos}⟧`;", "if (i === 0) return `⟦${t.v}:${cos}⟧`;", 'signe del primer terme'),
 ('polinomi-condicions.js', "sistema: {3: 'q3: ⟦a:a⟧ + ⟦c:c⟧ = ⟦r:-2⟧', 4: 'q4: ⟦a:8a⟧ + ⟦c:2c⟧ = ⟦r:2⟧'}", "sistema: {3: 'q3: ⟦a:a⟧ + ⟦c:c⟧ = ⟦r:-2⟧', 4: 'q4: ⟦a:2a⟧ + ⟦c:2c⟧ = ⟦r:-4⟧'}", 'sistema no equivalent'),
 ('polinomi-condicions.js', "fusiona: {q4r: ['q4d']}}", "fusiona: {q4r: ['q4x']}}", 'fusió amb clau inexistent'),
 ('polinomi-condicions.js', "{ordre: 1, x: 3, valor: 0, extrem: 'minim',", "{ordre: 1, x: 3, valor: 0, extrem: 'maxim',", 'tipus d\'extrem'),
 ('polinomi-condicions.js', "{L: 'H', tex: '6ax + 2b'}", "{L: 'H', tex: '6ax + b'}", "f'' general"),
 ('polinomi-condicions.js', "g.files[FILA.resposta] = resposta + termes.map((t, i) => {", "g.files[FILA.resposta] = resposta + termes.slice(1).map((t, i) => {", 'resposta incompleta'),
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
    r=subprocess.run(['node', os.path.join(d,'proves/comprova.js')], capture_output=True, text=True)
    total+=1
    falla = r.returncode!=0
    detectades+=falla
    linia=[l for l in r.stdout.splitlines() if l.strip().startswith('·')][:1]
    print(('DETECTADA ' if falla else 'NO DETECTADA ')+nom, '|', (linia[0].strip()[:150] if linia else ''))
print(f'{detectades}/{total}')
