/* ═══════════════════════════════════════════════════════════════════
   bayes.js — Procediment: teorema de Bayes
   ───────────────────────────────────────────────────────────────────
   Sis problemes fixos (sense editor): els d'arbres.js, amb la pregunta
   «al revés». Sempre igual:
     1. llegir la pregunta: què ja sabem (la condició) i què ens
        demanen: P(A | B). A l'arbre hi ha P(B | A), que és al revés;
     2. l'arbre, complet (com a la pàgina de la probabilitat total);
     3. la definició: P(A | B) = P(A ∩ B) / P(B);
     4. el numerador: el camí A → B (un producte);
     5. el denominador: tots els camins que acaben en B (la
        probabilitat total);
     6. la divisió, i la resposta (també en %).
   Adreça: bayes.html?p=peces (peces, dau, prova, correu, maquines, bossa)

   La pissarra té sis files (FILA):
     fila 0  l'enunciat, amb la pregunta marcada
     fila 1  la llegenda dels esdeveniments
     fila 2  l'arbre (vegeu arbres.js)
     fila 3  la fórmula de Bayes, que es va omplint
     fila 4  el càlcul del denominador (la suma dels camins)
     fila 5  la resposta
   Totes les línies que es veuen són certes: ho comprova proves/comprova.js.
   Claus: Eq1 la pregunta; B… la fórmula (Bl, Bq, Bn, Bd, Br, Bv); C… el
   càlcul; S<i> els termes de la suma; Rr la resposta.
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
const FILA = Object.freeze({enunciat: 0, llegenda: 1, arbre: 2, formula: 3, calcul: 4, resposta: 5});

/** El resultat d'una divisió: exacte si es pot escriure bé; si no, arrodonit a 4 decimals. {tex, aprox}. */
function resultat(p, v) {
  if (p.format === 'fraccio') {
    const d = M.formaDecimal(v, 4, 4);
    return {tex: `${A.texFraccio(v)}${v.esEnter() ? '' : ` ${d.aprox ? '\\approx' : '='} ${d.tex}`}`, aprox: false, decimal: d};
  }
  const d = M.formaDecimal(v, 4, 4);
  return {tex: d.tex, aprox: d.aprox, decimal: d};
}

function passos(valors) {
  const p = perId(valors.p);
  const b = p.bayes;
  const t = A.arbre(p);
  const g = F.guio(6);
  const [fa, fj] = b.fulla;
  const camins = b.objectiu || p.objectiu;
  const condicio = t.fills[fa][fj].e, demanat = t.primer[fa].e;
  const marques = {}, productes = {}, etiquetes = {};
  let ambArbre = false, marcaPregunta = '', ambDades = false;
  const marca = id => (id === 'q' ? marcaPregunta : ambDades ? 'condicio' : '');
  const enunciat = () => F.enunciatMarcat(`${p.text} [q:${b.frase}]`, marca);
  const dibuixa = () => {
    g.files[FILA.enunciat] = enunciat().tex;
    g.files[FILA.arbre] = ambArbre ? A.texArbre(p, etiquetes, productes, marques) : '';
  };
  const pas = (text, opcions) => { dibuixa(); g.afegeix(text, opcions); };

  /* 1. La lectura de la pregunta. */
  pas('Llegeix l\'enunciat, i sobretot la pregunta.');
  // Primer els noms dels esdeveniments: així, quan s'escrigui P(A | B), ja se sap què vol dir cada lletra.
  g.files[FILA.llegenda] = A.texLlegenda(p);
  pas('Assigna una lletra diferent a cadascun dels esdeveniments que pot passar.');
  marcaPregunta = 'objectiu';
  let marcaNum = '';                     // el numerador, del color del seu camí, quan ja és un nombre
  const formula = (num, den, resta = '') => K('Bl', b.tex) + R('Bq', '=') + `\\dfrac{${K('Bn', num, marcaNum)}}{${K('Bd', den)}}` + resta;
  g.files[FILA.formula] = K('Bl', b.tex);
  pas(`La pregunta ja diu una cosa que sabem: $${condicio}$ (és la condició, va darrere de la barra). I demana $${demanat}$. `
    + `És $${b.tex}$, ${b.text}. Compte: a l'arbre hi ha $P(${condicio} \\mid ${demanat})$, l'inrevés del que ens demanen: necessites aplicar el teorema de Bayes.`,
  {cursor: {arrossega: 'Eq1', fins: 'Bl'}});

  /* 2. L'arbre complet, com a la pàgina de la probabilitat total. */
  ambArbre = true;
  ambDades = true;
  t.primer.forEach((x, a) => {
    etiquetes[`Bl${a}`] = x.tex;
    t.fills[a].forEach((y, j) => { etiquetes[`Bl${a}${j}`] = y.tex; });
  });
  pas('Dibuixa l\'arbre amb les dades de l\'enunciat.');

  /* 3. La definició de la probabilitat condicionada. */
  const cami = A.texCami(t, fa, fj);
  g.files[FILA.formula] = formula(cami, `P(${condicio})`);
  pas(`Probabilitat condicionada: de tots els casos on passa $${condicio}$ (el denominador), quina part són també de $${demanat}$ (el numerador)?`);

  /* 4. El numerador: el camí demanat → condició. */
  // Cada camí que acaba en la condició té el seu color: el del numerador també.
  const colorDe = (a, j) => A.marcaCami(camins.findIndex(([x, y]) => x === a && y === j));
  marques[`${fa}${fj}`] = true;
  productes[`${fa}${fj}`] = A.texProducte(p, t, fa, fj, colorDe(fa, fj));
  const numerador = t.primer[fa].v.producte(t.fills[fa][fj].v);
  pas(`El numerador és el camí $${demanat} \\to ${condicio}$: multiplica les seves branques. $${A.texCami(t, fa, fj)} = ${A.texValor(p, numerador)}$.`,
    {cursor: {clic: `Bl${fa}${fj}`}});
  const texNumerador = A.texValor(p, numerador);
  marcaNum = colorDe(fa, fj);
  g.files[FILA.formula] = formula(texNumerador, `P(${condicio})`);
  pas('Porta-ho al numerador.', {cursor: {arrossega: `Pr${fa}${fj}`, fins: 'Bn'}});

  /* 5. El denominador: tots els camins que acaben en la condició (la probabilitat total). */
  const termes = [];
  for (const [a, j] of camins) {
    const v = t.primer[a].v.producte(t.fills[a][j].v);
    termes.push(v);
    if (a === fa && j === fj) continue;
    marques[`${a}${j}`] = true;
    productes[`${a}${j}`] = A.texProducte(p, t, a, j, colorDe(a, j));
    pas(`El denominador és $P(${condicio})$: tots els camins que acaben en $${condicio}$. Un altre camí: $${A.texCami(t, a, j)} = ${A.texValor(p, v)}$.`,
      {cursor: {clic: `Bl${a}${j}`}});
  }
  const total = termes.reduce((s, v) => s.suma(v));
  const pregunta = b.pregunta || p.pregunta.tex;
  g.files[FILA.calcul] = K('Cl', pregunta) + R('Cq', '=') + termes.map((v, i) => K(`S${i}`, A.texValor(p, v), A.marcaCami(i))).join(' + ')
    + R('Cr', '=') + K('Cv', A.texValor(p, total));
  pas(`Suma els camins (teorema de la probabilitat total): $${pregunta} = ${A.texValor(p, total)}$. Cada terme té el color del seu camí.`);
  g.files[FILA.calcul] = '';
  g.files[FILA.formula] = formula(texNumerador, A.texValor(p, total));
  pas('Porta-ho al denominador.', {cursor: {arrossega: 'Cv', fins: 'Bd'}});

  /* 6. La divisió i la resposta. */
  const v = numerador.quocient(total);
  const r = resultat(p, v);
  g.files[FILA.formula] = formula(texNumerador, A.texValor(p, total), R('Br', r.aprox ? '\\approx' : '=') + K('Bv', r.tex));
  pas(`Divideix: $${b.tex} ${r.aprox ? '\\approx' : '='} ${r.tex}$${r.aprox ? ' (arrodonit a quatre decimals)' : ''}.`);
  g.files[FILA.resposta] = K('Rr', `${b.tex} ${r.aprox ? '\\approx' : '='} ${r.tex}`);
  g.classes[FILA.resposta] = 'final';
  const percent = M.formaDecimal(v.producte(100), 2, 2);
  pas(`Resposta: la probabilitat ${b.text} és ${r.aprox ? 'aproximadament ' : ''}$${r.tex}$, és a dir, ${percent.aprox ? 'aproximadament ' : ''}un $${percent.tex}\\,\\%$.`,
    {cursor: {arrossega: 'Bv', fins: 'Rr'}});
  return g.passos;
}

arrel.Bayes = Object.freeze({
  titol: 'Teorema de Bayes',
  categoria: 'probabilitat',
  files: 6,
  perDefecte: FIXOS.perDefecte,
  exemples: FIXOS.exemples,
  titolEditor: 'Tria un problema',
  notaEditor: 'Tots es resolen igual: P(A | B) és el camí A → B dividit per tots els camins que acaben en B.',
  editor: [],
  problemes: PROBLEMES,
  FILA,
  valida: FIXOS.valida, llegeixAdreca: FIXOS.llegeixAdreca, escriuAdreca: FIXOS.escriuAdreca,
  enunciat: FIXOS.enunciat, resum: FIXOS.resum, nomExemple: FIXOS.nomExemple,
  passos,
});

})(globalThis);
