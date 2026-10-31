import subprocess, shutil, os, tempfile
# Run from anywhere: python3 procediments/proves/mutacions/<this file>
ORIG=os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
F='operacions-matrius.js'
MUT=[
 (F, "const producteM = (P, Q) => P.map(f => Q[0].map((_, j) => f.reduce((s, x, k) => suma(s, producte(x, Q[k][j])), nombre(0))));",
     "const producteM = (P, Q) => P.map((f, i) => Q[0].map((_, j) => f.reduce((s, x, k) => suma(s, producte(x, Q[k][i] || Q[k][j])), nombre(0))));", 'producte amb un índex equivocat'),
 (F, "const s = L[i].map((x, k) => `${factor(x)} \\\\cdot ${factor(Rm[k][j])}`).join(' + ');",
     "const s = L[i].map((x, k) => `${factor(x)} \\\\cdot ${factor(Rm[j] ? Rm[j][k] || Rm[k][j] : Rm[k][j])}`).join(' + ');", 'la suma fa files per files'),
 (F, "const AB = passosProducte(g, {fila: FILA.prod1, treball: FILA.treball1, nom: 'AB', L: A, R: B, pl: 'Ka', pr: 'Kb', pc: 'Kc', lletra: 'c',\n    nomL: 'A', nomR: 'B', nomRes: 'AB', individuals: 4, textInici: 'Escriu",
     "const AB = passosProducte(g, {fila: FILA.prod1, treball: FILA.treball1, nom: 'AB', L: B, R: A, pl: 'Ka', pr: 'Kb', pc: 'Kc', lletra: 'c',\n    nomL: 'A', nomR: 'B', nomRes: 'AB', individuals: 4, textInici: 'Escriu", 'AB calculat com BA'),
 (F, "escriu((a) => (a === i ? 'tria' : ''), (a, b) => (sol && b === j ? 'tria' : ''), true);",
     "escriu((a) => (a === i ? 'tria' : ''), (a, b) => (sol && a === j ? 'tria' : ''), true);", 'marca una fila de la segona matriu'),
 (F, "const marca = (i, j) => (iguals(P[i][j], Q[i][j]) ? 'mes' : 'tria');",
     "const marca = (i, j) => (iguals(P[i][j], Q[i][j]) || i === j ? 'mes' : 'tria');", 'marca en verd un element que dona condició'),
 (F, "g.files[FILA.cond1] = dif.map(([x, y]) => `${tex(x)} = ${tex(y)}`).join(', \\\\quad ');",
     "g.files[FILA.cond1] = dif.map(([x, y]) => `${tex(x)} = ${tex(producte(y, nombre(-1)))}`).join(', \\\\quad ');", 'condició amb un signe canviat'),
 (F, "  g.files[FILA.cond2] = K('Cc', 'a - 1 = 0') + iff + K('Cd', 'a = 1');",
     "  g.files[FILA.cond2] = K('Cc', 'a - 1 = 0') + iff + K('Cd', 'a = -1');", 'solució falsa'),
 (F, "K('Cb', F.tatxa('a = -1') + o + marcaSol('a = 1'))", "K('Cb', marcaSol('a = -1') + o + marcaSol('a = 1'))", 'una solució que no serveix en lila'),
 (F, "g.files[FILA.cas2] = K('Ea', '\\\\text{si } b = 0\\\\text{:}') + ' \\\\quad ' + K('Eb', 'a^{2} = 1') + iff + K('Ec', 'a = -1' + o + 'a = 1');",
     "g.files[FILA.cas2] = K('Ea', '\\\\text{si } b = 0\\\\text{:}') + ' \\\\quad ' + K('Eb', 'a^{2} = 1') + iff + K('Ec', 'a = 1');", 'oblida una solució del cas'),
 (F, "  g.files[FILA.cas1] = F.tatxa(", "  g.files[FILA.cas1] = (", 'no tatxa el cas sense solució'),
 (F, "  g.files[FILA.lletres] = L('⟦p:A^{2} - 2A + I⟧ = ⟦d:4I⟧');", "  g.files[FILA.lletres] = L('⟦p:A^{2} - 2A + I⟧ = ⟦d:3I⟧');", 'manipulació amb lletres falsa'),
 (F, "  g.files[FILA.lletres] = L('⟦p:A(A - 2I)⟧ = ⟦d:3I⟧');", "  g.files[FILA.lletres] = L('⟦p:A(A - 2)⟧ = ⟦d:3I⟧');", 'factor comú oblidant la I'),
 (F, "const inv = D.map(f => f.map(x => producte(x, nombre(fr(1, 3)))));", "const inv = D.map(f => f.map(x => producte(x, nombre(fr(1, 2)))));", 'inversa mal calculada'),
 (F, "  g.files[FILA.lletres] = F.marcat('L: ⟦m:A⟧⟦i:A^{-1}⟧ = ⟦n:A⟧⟦a:A⟧');", "  g.files[FILA.lletres] = F.marcat('L: ⟦m:A⟧⟦i:A^{-1}⟧ = ⟦a:A⟧⟦n:I⟧');", 'multiplica un costat i l\'altre no'),
 (F, "  g.files[FILA.mides] = mides(A, B, 'A', 'B') + ' \\\\;\\\\longrightarrow\\\\; ' + K('Mr', `(AB)_{${A.length} \\\\times ${B[0].length}}`);",
     "  g.files[FILA.mides] = mides(A, B, 'A', 'B') + ' \\\\;\\\\longrightarrow\\\\; ' + K('Mr', `(AB)_{${A[0].length} \\\\times ${B.length}}`);", 'mida del resultat amb les mides de dins'),
]
det=0; esperades=0
for f,a,b,nom in MUT:
    d=os.path.join(tempfile.gettempdir(), 'pau-mutacio-om'); shutil.rmtree(d, ignore_errors=True); shutil.copytree(ORIG, d, ignore=shutil.ignore_patterns('mutacions', 'navegador', 'eines'))
    p=os.path.join(d,f); s=open(p).read()
    if s.count(a)!=1: print('NO APLICA', nom, s.count(a)); continue
    open(p,'w').write(s.replace(a,b,1))
    r=subprocess.run(['node', os.path.join(d,'proves/comprova.js'), 'operacions amb matrius'], capture_output=True, text=True)
    fa=r.returncode!=0; det+=fa
    l=[x for x in r.stdout.splitlines() if x.strip().startswith('·')][:1]
    print(('DETECTADA ' if fa else 'NO DETECTADA ')+nom, '|', l[0].strip()[:160] if l else '')
print(f'{det}/{len(MUT)}')
