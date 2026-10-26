/* ═══════════════════════════════════════════════════════════════════
   extrems.js — Procediment: màxims i mínims relatius
   ───────────────────────────────────────────────────────────────────
   Dades: f(x), un polinomi de grau 3 com a màxim amb coeficients enters
   entre −9 i 9, amb punts crítics racionals.
   Adreça: extrems.html?f=x^3-3x^2+1

   Mètode, com a classe:
     1. els únics candidats són els punts crítics, on f'(x) = 0;
     2. el signe de f''(x) en cada candidat diu què és:
        f'' < 0 → màxim relatiu; f'' > 0 → mínim relatiu;
        f'' = 0 → el criteri no decideix (en un polinomi de grau 3, vol
        dir que f' no canvia de signe: no és ni màxim ni mínim);
     3. la segona coordenada del punt és f(x).

   La pissarra té quatre files:
     fila 0  f'(x), i després f''(x)
     fila 1  el càlcul del moment: l'equació f'(x) = 0, f''(a), f(a)
     fila 2  el primer candidat i, al final, què és
     fila 3  el segon candidat, si n'hi ha
   Totes les línies que es veuen són certes: ho comprova proves/comprova.js.

   Claus: D/d/q/r per a les derivades (fila 0), e per a l'equació,
   H/s per a f''(a), G/g per a f(a), K… per als candidats (Kx, Kq, Kv:
   «x = a»; Kl, Ky, Kr: el punt), S… per al signe de f''(a).
   ═══════════════════════════════════════════════════════════════════ */
(function (arrel) {
'use strict';

const M = arrel.Mates;
const F = arrel.Formules;
const Dd = arrel.Dades;
const {Fraccio, texNombre, texPolinomi} = M;
const {clau: K, rel: R} = F;


/* ── 1. DADES ──────────────────────────────────────────────────────── */

const MAX_COEF = 9;
const MAX_GRAU = 3;

const PER_DEFECTE = Object.freeze({a3: 1, a2: -3, a1: 0, a0: 1});

const EXEMPLES = Object.freeze([
  PER_DEFECTE,                                  // factor comú: un màxim i un mínim
  {a3: 1, a2: -3, a1: -9, a0: 1},               // fórmula de segon grau
  {a3: 0, a2: -1, a1: 4, a0: -1},               // paràbola: un màxim
  {a3: 1, a2: 0, a1: -3, a0: 2},                // x² = 1
  {a3: 1, a2: 0, a1: 0, a0: 0},                 // f''(0) = 0: el criteri no decideix
  {a3: 1, a2: 0, a1: 3, a0: 0},                 // cap punt crític
]);

/** Text d'error si els valors no són vàlids; si ho són, null. */
function valida(v) {
  const error = Dd.validaFuncio(v, MAX_COEF);
  if (error) return error;
  if (M.arrelsRacionals(M.derivaTermes(Dd.termesDe(v))).irracionals) {
    return 'Amb aquests coeficients, els punts crítics són irracionals (surten arrels no exactes). '
      + 'De moment, tria coeficients que donin punts crítics racionals, com els dels exemples.';
  }
  return null;
}


/* ── 2. ADREÇA ─────────────────────────────────────────────────────── */

/** Llegeix {f: 'x^3-3x^2+1'}. Torna {valors} o {error}. */
function llegeixAdreca(p) {
  const v = Object.assign({}, PER_DEFECTE);
  try {
    if (p.f !== undefined) {
      const error = Dd.llegeixFuncio(p.f, v, MAX_GRAU);
      if (error) return {error};
    }
  } catch (e) {
    if (e instanceof M.ErrorLectura) return {error: `No entenc l'adreça: ${e.message}`};
    throw e;
  }
  const error = valida(v);
  return error ? {error: `L'adreça no es pot fer servir. ${error}`} : {valors: v};
}

const escriuAdreca = v => ({f: Dd.textFuncio(v)});


/* ── 3. TEXTOS ─────────────────────────────────────────────────────── */

const enunciat = v => `Troba els màxims i els mínims relatius de la funció $f(x) = ${texPolinomi(Dd.termesDe(v))}$.`;
const resum = v => `f(x) = ${texPolinomi(Dd.termesDe(v))}`;

/** «(x − 2)», «(x + 1)», «x»: per escriure c·(x − a)². */
const xMenys = a => (a.esZero() ? 'x' : `(x ${a.signe() < 0 ? '+' : '-'} ${texNombre(a.abs())})`);

/** El primer terme que s'ha de multiplicar en derivar (coeficient ≠ ±1, grau ≥ 2). */
const primerAMultiplicar = llista => llista.find(t => t.n >= 2 && !Fraccio.de(t.c).abs().igual(1));


/* ── 4. PASSOS ─────────────────────────────────────────────────────── */

function passos(v) {
  const f = Dd.termesDe(v);
  const d1 = M.derivaTermes(f);
  const d2 = M.derivaTermes(d1);
  const g = F.guio(4);

  /* 1. f'(x), a la fila 0. */
  const D1 = F.membreEsquerre('D', 'f', 'x', 1);
  g.files[0] = D1 + F.derivadaIndicada('d', f);
  g.afegeix('Un màxim o un mínim relatiu només pot ser en un punt crític, on $f\'(x) = 0$. Primer, calcula la derivada $f\'(x)$.');
  g.files[0] = D1 + F.derivadaBaixada('d', f);
  g.afegeix(`Deriva terme a terme. ${Dd.reglesDerivada(f)}`, {cursor: {clic: 'dQ'}});
  const feta1 = F.derivadaFeta('d', 'q', f);
  g.files[0] = D1 + feta1.tex;
  if (feta1.multiplica) {
    g.afegeix(`Multiplica: $f'(x) = ${texPolinomi(d1)}$.`,
      {fusiona: feta1.fusiona, reanomena: feta1.reanomena, cursor: {clic: 'dm' + primerAMultiplicar(f).n}});
  }

  /* 2. Els punts crítics: f'(x) = 0, a la fila 1. Si no s'ha multiplicat, les claus noves de la fila 0 van aquí. */
  // Primer l'equació tal com es planteja, f'(x) = 0; després, amb l'expressió de f'(x). El «=» i el «0» (claus eq, ez) es queden.
  // L'equació es continua veient: els càlculs baixen a la fila 2 (Formules.resolEquacio), i les solucions acaben en lila.
  g.files[1] = F.membreEsquerre('e', 'f', 'x', 1) + K('ez', '0');
  g.afegeix('Els punts crítics són les solucions de l\'equació $f\'(x) = 0$.',
    {reanomena: feta1.multiplica ? {} : feta1.reanomena});
  const solucions = F.resolEquacio(g, {fila: 1, treball: 2, P: 'e', termes: d1, text: 'Substitueix $f\'(x)$ per la seva expressió.', lila: true,
    final: sol => `${sol.length > 1 ? 'Els punts crítics són' : 'L\'únic punt crític és'} ${sol.map(s => `$x = ${texNombre(s.valor)}$`).join(' i ')}.`});

  g.files[1] = '';
  g.files[2] = '';
  if (!solucions.length) {
    g.files[2] = K('Kn', '\\text{No hi ha punts crítics, i per tant no hi ha extrems relatius}');
    g.classes[2] = 'final';
    g.afegeix('Com que $f\'(x)$ no val mai $0$, no hi ha cap candidat: $f$ no té ni màxims ni mínims relatius.');
    return g.passos;
  }

  /* 3. Els candidats baixen a les files 2 i 3. */
  const candidat = (i, a) => K('Kx' + i, 'x') + R('Kq' + i, '=') + K('Kv' + i, texNombre(a));
  solucions.forEach((s, i) => { g.files[2 + i] = candidat(i, s.valor); });
  const llista = solucions.map(s => `$x = ${texNombre(s.valor)}$`).join(' i ');
  g.afegeix(solucions.length > 1
    ? `Hi ha dos candidats: ${llista}. Ara cal saber què és cadascun.`
    : `Hi ha un sol candidat: ${llista}. Ara cal saber què és.`,
  {reanomena: Object.fromEntries(solucions.map((s, i) => ['Kv' + i, s.clau]))});

  /* 4. f''(x), a la fila 0. */
  const D2 = F.membreEsquerre('D', 'f', 'x', 2);
  g.files[0] = D2 + F.derivadaIndicada('q', d1);
  g.afegeix('Per decidir-ho, fes servir la segona derivada: deriva $f\'(x)$.');
  g.files[0] = D2 + F.derivadaBaixada('q', d1);
  g.afegeix(`Deriva terme a terme. ${Dd.reglesDerivada(d1)}`, {cursor: {clic: 'qQ'}});
  const feta2 = F.derivadaFeta('q', 'r', d1);
  g.files[0] = D2 + feta2.tex;
  if (feta2.multiplica) {
    g.afegeix(`Multiplica: $f''(x) = ${texPolinomi(d2)}$.`,
      {fusiona: feta2.fusiona, reanomena: feta2.reanomena, cursor: {clic: 'qm' + primerAMultiplicar(d1).n}});
  }

  /* 5. Cada candidat: el signe de f''(a) i, si és un extrem, f(a). */
  const resultats = [];
  solucions.forEach((s, i) => {
    const a = s.valor, A = texNombre(a);

    const H = F.membreEsquerre('H', 'f', A, 2);
    g.files[1] = H + F.substituit('s', d2, a);
    g.afegeix(`Substitueix el candidat $x = ${A}$ a $f''(x)$.`,
      {reanomena: i === 0 && !feta2.multiplica ? feta2.reanomena : {}, cursor: {clic: 'Kv' + i}});
    g.files[1] = H + F.avaluat('s', d2, a);
    g.afegeix('Calcula cada terme.', {fusiona: F.fusionsAvaluat('s', d2), cursor: {clic: d2[0].n >= 1 ? 'sv' + d2[0].n : null}});
    const segona = M.valorTermes(d2, a);
    if (d2.length > 1) {
      g.files[1] = H + F.resultat('s', segona);
      g.afegeix(`Opera: $f''(${A}) = ${texNombre(segona)}$.`, {fusiona: F.fusionsResultat('s', d2, a), cursor: {clic: 'ss' + d2[1].n}});
    }

    if (segona.esZero()) {
      const c = Fraccio.de(d1[0].c);                       // f'(x) = c·(x − a)², amb c = 3·a3
      g.completa(' Aquí $f\'\'$ val $0$: aquest criteri no decideix.');
      g.files[1] = '';
      g.files[2 + i] = '\\text{Ni màxim ni mínim en }' + candidat(i, a);
      g.afegeix(`Fixa't que $f'(x) = ${texNombre(c)}${xMenys(a)}^2$ no canvia de signe a banda i banda de $x = ${A}$: `
        + `la funció ${c.signe() > 0 ? 'creix' : 'decreix'} als dos costats. Per tant, en $x = ${A}$ no hi ha ni màxim ni mínim.`);
      resultats.push(`en $x = ${A}$ no hi ha ni màxim ni mínim`);
      return;
    }

    const maxim = segona.signe() < 0;
    const tipus = maxim ? 'màxim' : 'mínim';
    g.files[1] += R('Sw', maxim ? '<' : '>') + K('Sz', '0');
    g.afegeix(`Com que $f''(${A}) ${maxim ? '<' : '>'} 0$, la gràfica té forma de ${maxim ? '∩' : '∪'} en aquest punt: `
      + `en $x = ${A}$ hi ha un ${tipus} relatiu.`);

    const G = F.membreEsquerre('G', 'f', A);
    g.files[1] = G + F.substituit('g', f, a);
    g.afegeix(`Ara calcula la segona coordenada del punt: substitueix $x = ${A}$ a $f(x)$.`, {cursor: {clic: 'Kv' + i}});
    g.files[1] = G + F.avaluat('g', f, a);
    g.afegeix('Calcula cada terme.', {fusiona: F.fusionsAvaluat('g', f), cursor: {clic: 'gv' + f[0].n}});
    const y = M.valorTermes(f, a), Y = texNombre(y);
    if (f.length > 1) {
      g.files[1] = G + F.resultat('g', y);
      g.afegeix(`Opera: $f(${A}) = ${Y}$.`, {fusiona: F.fusionsResultat('g', f, a), cursor: {clic: 'gs' + f[1].n}});
    }

    const rf = F.clausResultat('g', f, a);
    g.files[1] = '';
    g.files[2 + i] = `\\text{${maxim ? 'Màxim' : 'Mínim'} relatiu: }`
      + K('Kl' + i, '(') + K('Kv' + i, A) + ',\\ ' + K('Ky' + i, Y) + K('Kr' + i, ')');
    g.afegeix(`Porta ${Dd.article(y)}$${Y}$ al punt: el ${tipus} relatiu és $(${A},\\ ${Y})$.`, {
      reanomena: {['Ky' + i]: rf.valor},
      fusiona: rf.signe ? {['Ky' + i]: [rf.signe]} : {},
      cursor: {arrossega: rf.valor, fins: 'Ky' + i},
    });
    resultats.push(`un ${tipus} relatiu a $(${A},\\ ${Y})$`);
  });

  /* 6. El resultat. */
  g.files[1] = '';
  solucions.forEach((_, i) => { g.classes[2 + i] = 'final'; });
  g.afegeix(`Resultat: ${resultats.join('; ')}.`);
  return g.passos;
}


/* ── 5. DEFINICIÓ DEL PROCEDIMENT ──────────────────────────────────── */

arrel.Extrems = Object.freeze({
  titol: 'Màxims i mínims relatius',
  categoria: 'analisi',
  files: 4,
  perDefecte: PER_DEFECTE,
  exemples: EXEMPLES,
  titolEditor: 'Canvia la funció',
  notaEditor: `Els coeficients van de −${MAX_COEF} a ${MAX_COEF}.`,
  editor: [Dd.campsFuncio(MAX_COEF)],
  valida, llegeixAdreca, escriuAdreca, enunciat, resum, passos,
});

})(globalThis);
