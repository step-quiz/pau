/* ═══════════════════════════════════════════════════════════════════
   probabilitat-total.js — Procediment: arbre de probabilitats i
   teorema de la probabilitat total
   ───────────────────────────────────────────────────────────────────
   Sis problemes fixos (sense editor), els d'arbres.js. Sempre igual:
     1. llegir l'enunciat i posar nom als esdeveniments;
     2. traduir cada dada: un percentatge (o la regla de Laplace) dona
        P(A), o P(B | A) si només parla dels casos de A: és una
        probabilitat condicionada;
     3. dibuixar l'arbre i posar cada probabilitat a la seva branca; les
        que no diu l'enunciat surten del contrari (1 − …);
     4. multiplicar les probabilitats de cada camí que porta a
        l'esdeveniment: P(A ∩ B) = P(A) · P(B | A);
     5. sumar els camins: el teorema de la probabilitat total.
   Adreça: probabilitat-total.html?p=peces (peces, dau, prova, correu, maquines, bossa)

   La pissarra té sis files (FILA):
     fila 0  l'enunciat, amb les frases de les dades marcades
     fila 1  la llegenda dels esdeveniments
     fila 2  les dades, traduïdes a probabilitats
     fila 3  l'arbre (vegeu arbres.js)
     fila 4  el càlcul del moment (un contrari, la suma)
     fila 5  la resposta
   Totes les línies que es veuen són certes: ho comprova proves/comprova.js.
   Claus: E<id>1 frases; Dl<i> Dq<i> Df<i> Dr<i> Dv<i> la dada i; C… el
   càlcul; S<i> els termes de la suma; Rr la resposta; les de l'arbre, a
   arbres.js.
   ═══════════════════════════════════════════════════════════════════ */
(function (arrel) {
'use strict';

const M = arrel.Mates;
const F = arrel.Formules;
const A = arrel.Arbres;
const {clau: K, rel: R} = F;

const PROBLEMES = A.PROBLEMES;
const FIXOS = arrel.Dades.problemesFixos(PROBLEMES);
const {perId} = FIXOS;

/** Files de la pissarra. */
const FILA = Object.freeze({enunciat: 0, llegenda: 1, dades: 2, arbre: 3, calcul: 4, resposta: 5});


function passos(valors) {
  const p = perId(valors.p);
  const t = A.arbre(p);
  const g = F.guio(6);
  const marcades = new Set();
  const marca = id => (marcades.has(id) ? 'condicio' : '');
  const enunciat = () => F.enunciatMarcat(`${p.text} ${p.pregunta.frase}`, marca);
  const dades = [];                       // línies de la llista de dades
  const etiquetes = {}, productes = {}, marques = {};
  let ambArbre = false;
  const dibuixa = () => {
    g.files[FILA.enunciat] = enunciat().tex;
    g.files[FILA.dades] = dades.length ? `\\begin{array}{l} ${dades.join(' \\\\[2pt] ')} \\end{array}` : '';
    g.files[FILA.arbre] = ambArbre ? A.texArbre(p, etiquetes, productes, marques) : '';
  };
  const pas = (text, opcions) => { dibuixa(); g.afegeix(text, opcions); };

  /* 1. La lectura i la llegenda. */
  pas('Llegeix l\'enunciat. Primer, posa nom als esdeveniments.');
  g.files[FILA.llegenda] = A.texLlegenda(p);
  pas('Assigna una lletra diferent a cadascun dels esdeveniments que pot passar.');

  /* 2. Les dades, traduïdes a probabilitats (fila 2), en l'ordre de l'enunciat. */
  const branques = [];                    // totes les branques: {a, j (o null), b, valor}
  p.arbre.forEach((b, a) => {
    branques.push({a, j: null, b, valor: t.primer[a]});
    p.fills[b.e].forEach((c, j) => branques.push({a, j, b: c, valor: t.fills[a][j]}));
  });
  const nomDe = x => (x.j === null ? `P(${x.b.e})` : A.texCondicionada(t, x.a, x.j));
  const clauDe = x => (x.j === null ? `Bl${x.a}` : `Bl${x.a}${x.j}`);
  const ambDada = branques.filter(x => x.b.dada).sort((u, v) => Number(u.b.dada) - Number(v.b.dada));
  const indexDada = new Map();
  ambDada.forEach((x, i) => {
    const {principal} = enunciat();
    marcades.add(x.b.dada);
    const decimal = p.format === 'decimal';
    const igualFont = decimal || !x.b.p.includes('/') ? R(`Dr${i}`, '=') + K(`Dv${i}`, x.valor.tex) : '';
    dades.push(K(`Dl${i}`, nomDe(x)) + R(`Dq${i}`, '=') + (decimal ? K(`Df${i}`, A.font(x.b.p)) + igualFont : K(`Dv${i}`, A.font(x.b.p))));
    indexDada.set(x, i);
    pas(x.b.text, {cursor: {arrossega: principal[x.b.dada], fins: `Dl${i}`}});
  });

  /* 3. L'arbre: primer les branques, i després les probabilitats. */
  ambArbre = true;
  pas(`Dibuixa l'arbre. Al primer nivell, ${t.primer.map(b => `$${b.e}$`).join(', ').replace(/, ([^,]*)$/, ' o $1')}; `
    + 'al segon nivell, surten dues branques de cadascuna.');

  const nivells = [t.primer.map((_, a) => branques.find(x => x.a === a && x.j === null))]
    .concat(t.primer.map((_, a) => branques.filter(x => x.a === a && x.j !== null)));
  for (const nivell of nivells) {
    const ordre = nivell.filter(x => !x.b.resta).concat(nivell.filter(x => x.b.resta));
    for (const x of ordre) {
      if (x.b.dada) {
        etiquetes[clauDe(x)] = x.valor.tex;
        pas(x.j === null ? `Assigna la probabilitat $${nomDe(x)} = ${x.valor.tex}$ a la branca que correspon.` : `Assigna $${nomDe(x)} = ${x.valor.tex}$ a la seva branca.`, {cursor: {arrossega: `Dv${indexDada.get(x)}`, fins: clauDe(x)}});
      } else if (x.b.raonat) {
        if (x.b.frase) marcades.add(x.b.frase);
        etiquetes[clauDe(x)] = x.valor.tex;
        const opcions = x.b.frase ? {cursor: {clic: enunciat().principal[x.b.frase]}} : {};
        pas(x.b.raonat, opcions);
      } else {
        // El contrari: 1 menys les altres branques que surten del mateix punt.
        const germanes = nivell.filter(y => y !== x);
        const resta = germanes.map(y => y.valor.tex).join(' - ');
        g.files[FILA.calcul] = K('Cl', nomDe(x)) + R('Cq', '=') + K('Ce', `1 - ${resta}`) + R('Cr', '=') + K('Cv', x.valor.tex);
        const que = x.j === null
          ? `$${x.b.e}$ és l'esdeveniment contrari ${germanes.length === 1 ? 'de' : 'a que passi'} ${germanes.map(y => `$${y.b.e}$`).join(' o ')}.`
          : `Dins de $${t.primer[x.a].e}$, $${x.b.e}$ és l'esdeveniment contrari a $${germanes[0].b.e}$.`;
        pas(`${que} Per tant, $${nomDe(x)} = 1 - ${resta} = ${x.valor.tex}$.`);
        g.files[FILA.calcul] = '';
        etiquetes[clauDe(x)] = x.valor.tex;
        pas('Assigna la probabilitat a la branca que correspon.', {cursor: {arrossega: 'Cv', fins: clauDe(x)}});
      }
    }
  }

  /* 4. Els camins que porten a l'esdeveniment: el producte de les branques. */
  for (const [a, j] of p.objectiu) marques[`${a}${j}`] = true;
  pas(`Ara busca les fulles de l'arbre on passa el que demana l'enunciat (${p.pregunta.text}). N'hi ha ${p.objectiu.length === 2 ? 'dues' : 'tres'}: `
    + 'cada camí que hi porta és una manera diferent que passi.');
  const termes = [];
  p.objectiu.forEach(([a, j], i) => {
    productes[`${a}${j}`] = A.texProducte(p, t, a, j, A.marcaCami(i));       // cada camí, del seu color
    const v = t.primer[a].v.producte(t.fills[a][j].v);
    termes.push(v);
    pas(`Camí $${t.primer[a].e} \\to ${t.fills[a][j].e}$: multiplica les probabilitats de les seves branques. `
      + `$${A.texCami(t, a, j)} = P(${t.primer[a].e}) \\cdot ${A.texCondicionada(t, a, j)} = ${A.texValor(p, v)}$.`, {cursor: {clic: `Bl${a}${j}`}});
  });

  /* 5. La suma: el teorema de la probabilitat total. */
  const total = termes.reduce((s, v) => s.suma(v));
  const suma = termes.map((v, i) => K(`S${i}`, A.texValor(p, v), A.marcaCami(i))).join(' + ');
  g.files[FILA.calcul] = K('Cl', p.pregunta.tex) + R('Cq', '=') + suma;
  pas('Aplica el teorema de la probabilitat total.');
  const decimal = p.format === 'fraccio' ? ` = ${M.texDecimal(total) || M.formaDecimal(total).tex}` : '';
  g.files[FILA.calcul] = K('Cl', p.pregunta.tex) + R('Cq', '=') + suma + R('Cr', '=') + K('Cv', A.texValor(p, total) + decimal);
  pas('Obté la probabilitat total.');
  g.files[FILA.calcul] = '';
  g.files[FILA.resposta] = K('Rr', `${p.pregunta.tex} = ${A.texValor(p, total)}${decimal}`);
  g.classes[FILA.resposta] = 'final';
  pas(`Resposta: la probabilitat ${p.pregunta.text} és $${A.texValor(p, total)}${decimal}$, és a dir, un $${A.percentatge(total)}$.`, {cursor: {arrossega: 'Cv', fins: 'Rr'}});
  return g.passos;
}

arrel.ProbabilitatTotal = Object.freeze({
  titol: 'Arbre de probabilitats i probabilitat total',
  categoria: 'probabilitat',
  files: 6,
  perDefecte: FIXOS.perDefecte,
  exemples: FIXOS.exemples,
  titolEditor: 'Tria un problema',
  notaEditor: 'Tots es resolen igual: traduir les dades a probabilitats, dibuixar l\'arbre, multiplicar pels camins i sumar.',
  editor: [],
  problemes: PROBLEMES,
  FILA,
  valida: FIXOS.valida, llegeixAdreca: FIXOS.llegeixAdreca, escriuAdreca: FIXOS.escriuAdreca,
  enunciat: FIXOS.enunciat, resum: FIXOS.resum, nomExemple: FIXOS.nomExemple,
  passos,
});

})(globalThis);
