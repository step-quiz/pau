import subprocess, shutil, os, tempfile
# Run from anywhere: python3 procediments/proves/mutacions/<this file>
ORIG=os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
MUT=[
 ('binomial.js', "const perContrari = contraris.length < directes.length;", "const perContrari = contraris.length <= directes.length;", 'contrari si empaten'),
 ('binomial.js', "const perContrari = contraris.length < directes.length;", "const perContrari = false;", 'mai pel contrari'),
 ('binomial.js', "BigInt(100 - v.p) ** BigInt(v.n - k);", "BigInt(100 - v.p) ** BigInt(v.n - k + 1);", 'exponent de q equivocat'),
 ('binomial.js', "c = c * BigInt(n - k + i) / BigInt(i);", "c = c * BigInt(n - k + i);", 'combinatori sense dividir'),
 ('binomial.js', "N = (N * 2n + u) / (2n * u);", "N = N / u;", 'trunca en lloc d\'arrodonir'),
 ('binomial.js', "R(t + 'r', igualOAprox(x.aprox))", "R(t + 'r', '=')", '«=» en un cas arrodonit'),
 ('binomial.js', "R('Sq', igualOAprox(arrodonits))", "R('Sq', '=')", '«=» en una suma arrodonida'),
 ('binomial.js', "const N = perContrari ? 10n ** BigInt(E) - Ncalc : Ncalc;", "const N = Ncalc;", 'oblida el «1 −»'),
 ('binomial.js', "{id: 'ge', tex: '\\\\ge', text: k => `almenys ${k}`, entra: (j, k) => j >= k},", "{id: 'ge', tex: '\\\\ge', text: k => `almenys ${k}`, entra: (j, k) => j > k},", '≥ com si fos >'),
 ('binomial.js', "const pc = percentatge(N, E);", "const pc = percentatge(N * 10n, E);", 'percentatge equivocat'),
 ('binomial.js', "let e = s.length - 1 - E;", "let e = s.length - E;", 'exponent de la notació científica'),
 ('binomial.js', ": `X \\\\ge ${c[0]}`;", ": `X > ${c[0]}`;", 'contrari mal escrit'),
 ('binomial.js', "g.files[FILA.dades] = dades([filaN, filaP(K('Dp', `p = ${v.p}\\\\,\\\\%`) + R('Dr', '=') + K('Dx', p))]);", "g.files[FILA.dades] = dades([filaN, filaP(K('Dp', `p = ${v.p}\\\\,\\\\%`) + R('Dr', '=') + K('Dx', q))]);", 'percentatge passat malament'),
 ('binomial.js', "const p = texP(v.p), q = texP(100 - v.p);", "const p = texP(v.p), q = texP(99 - v.p);", 'q no és 1 − p'),
 ('binomial.js', "const uns = (j === 0", "valors.length && (valors[valors.length - 1].x = probabilitat(N + 1n, E));\n    const uns = (j === 0", 'valor d\'un cas canviat al text'),
 ('binomial.js', "+ \\\\cdots + P(X = ${ks[ks.length - 1]})", "+ \\\\cdots + P(X = ${ks[ks.length - 2]})", '«…» fins a un cas abans'),
 ('binomial.js', "+ K(i ? `Se${i}` : 'Se', xs.map(x => x.tex).join(' + '))", "+ K(i ? `Se${i}` : 'Se', xs.slice(0, 2).map(x => x.tex).join(' + '))", 'una línia de la suma perd un valor'),
 ('binomial.js', "[K('DB', `X \\\\sim B(${v.n};\\\\ ${p})`), '$X$: nombre d\\'èxits']", "[K('DB', `X \\\\sim B(${v.n + 1};\\\\ ${p})`), '$X$: nombre d\\'èxits']", 'B(n + 1; p)'),
]
det=0
for f,a,b,nom in MUT:
    d=os.path.join(tempfile.gettempdir(), 'pau-mutacio-mbin'); shutil.rmtree(d, ignore_errors=True); shutil.copytree(ORIG, d, ignore=shutil.ignore_patterns('mutacions', 'navegador', 'eines'))
    p=os.path.join(d,f); s=open(p).read()
    if s.count(a)!=1: print('NO APLICA', nom, s.count(a)); continue
    open(p,'w').write(s.replace(a,b,1))
    r=subprocess.run(['node', os.path.join(d,'proves/comprova.js'), 'binomial'], capture_output=True, text=True)
    fa=r.returncode!=0; det+=fa
    l=[x for x in r.stdout.splitlines() if x.strip().startswith('·')][:1]
    print(('DETECTADA ' if fa else 'NO DETECTADA ')+nom, '|', l[0].strip()[:150] if l else '')
print(f'{det}/{len(MUT)}')
