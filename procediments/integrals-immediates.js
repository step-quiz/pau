/* ═══════════════════════════════════════════════════════════════════
   integrals-immediates.js — Procediment: integrals immediates
   ───────────────────────────────────────────────────────────────────
   Set problemes fixos, triats a partir dels exercicis PAU, amb funcions
   que no són polinomis: exponencials, logaritmes (f'/f), sinus i
   cosinus, i potències d'exponent fraccionari o negatiu. La tècnica és
   sempre la mateixa: treure les constants fora, «completar la derivada»
   (multiplicar a dins per la derivada de l'interior i a fora per la
   inversa) i aplicar la integral immediata de la taula:
       ∫ f'(x)·e^f(x) dx = e^f(x) + C      ∫ f'(x)/f(x) dx = ln|f(x)| + C
       ∫ f'(x)·cos f(x) dx = sin f(x) + C  ∫ f'(x)·sin f(x) dx = −cos f(x) + C
       ∫ xⁿ dx = xⁿ⁺¹/(n + 1) + C  (n ≠ −1)
   Després, la regla de Barrow (com a barrow.js: F(b) − F(a), amb
   C = 0), una condició F(x₀) = y₀ (com a primitiva.js) o un paràmetre.
   Adreça: integrals-immediates.html?p=exponencial
   Els problemes són dades (els guions, escrits a mà): cada fila canvia
   de versió pas a pas. Valors exactes (e², ln 3, π…) i, al costat, ≈.
   Totes les línies que es veuen són certes: ho comprova
   proves/comprova.js (numèricament: integrals per Simpson, derivades
   per diferències finites, models propis de cada problema).
   Claus: In, Iq… la fila de la integral (In el nom, I<k> cada tros de la
   cadena); Pn, Pq, Pv la primitiva; Bn… F(b); An… F(a); Cn… la condició;
   Sn… la resposta.
   ═══════════════════════════════════════════════════════════════════ */
(function (arrel) {
'use strict';

const F = arrel.Formules;
const {clau: R0, rel: R} = F;
/** A la pissarra, les fraccions a mida de text (\dfrac): al costat de la integral, \frac surt massa petita. */
const K = (k, tex) => R0(k, tex.replace(/\\frac/g, '\\dfrac'));

const FILA = Object.freeze({integral: 0, primitiva: 1, fb: 2, fa: 3, condicio: 4, resposta: 5});
const NFILES = 6;
const BARROW = 'Regla de Barrow: si $F$ és una primitiva de $f$, $\\int_a^b f(x)\\,dx = F(b) - F(a)$. Qualsevol primitiva serveix (la $C$ s\'anul·la en restar): agafa la de $C = 0$.';

/*
 * Cada problema: el nom (xip), l'enunciat i el guió. «integral»: la integral definida (TeX) i el nom
 * dels seus extrems a la fila 0; «primitiva»: les versions de la fila de la primitiva [TeX, text];
 * «fb», «fa»: les versions de F(b) i F(a); «fi»: els trossos que s'afegeixen a la fila 0 (cadena);
 * «condicio»: les versions de la fila de la condició; «resposta».
 */
const PROBLEMES = Object.freeze([
  {id: 'exponencial', nom: 'Exponencial',
    enunciat: 'Calcula la integral definida $\\int_{0}^{1} 5e^{2x}\\,dx$.',
    integral: '\\displaystyle\\int_{0}^{1} 5e^{2x}\\,dx', barrow: 'F(1) - F(0)', b: '1', a: '0', F: 'F',
    primitiva: [
      ['\\displaystyle\\int 5e^{2x}\\,dx', 'Primer, una primitiva: $F(x) = \\int 5e^{2x}\\,dx$.'],
      ['5\\displaystyle\\int e^{2x}\\,dx', 'El $5$ és una constant que multiplica: treu-la fora de la integral.'],
      ['5 \\cdot \\frac{1}{2}\\displaystyle\\int 2e^{2x}\\,dx', 'Per fer-la immediata, a dins hi ha de ser la derivada de l\'exponent: $(2x)\' = 2$. Hi falta el $2$: multiplica a dins per $2$ i a fora per $\\frac{1}{2}$ (així no canvia res).'],
      ['5 \\cdot \\frac{1}{2}e^{2x}', 'Ara és immediata: $\\int f\'(x)\\,e^{f(x)}\\,dx = e^{f(x)} + C$, amb $f(x) = 2x$. Agafa $C = 0$.'],
      ['\\frac{5}{2}e^{2x}', 'Opera: $5 \\cdot \\frac{1}{2} = \\frac{5}{2}$.'],
    ],
    fb: [['\\frac{5}{2}e^{2 \\cdot 1}', 'Calcula $F(1)$: substitueix $x$ per $1$.'], ['\\frac{5}{2}e^{2}', 'Opera l\'exponent.']],
    fa: [['\\frac{5}{2}e^{2 \\cdot 0}', 'Calcula $F(0)$: substitueix $x$ per $0$.'], ['\\frac{5}{2}e^{0}', 'Opera l\'exponent.'], ['\\frac{5}{2}', '$e^{0} = 1$.']],
    fi: [['\\frac{5}{2}e^{2} - \\frac{5}{2}', '$F(1) - F(0)$.'], ['\\frac{5}{2} \\cdot (e^{2} - 1)', 'Treu factor comú $\\frac{5}{2}$.'],
      ['15{,}97', 'Amb la calculadora, $\\frac{5}{2} \\cdot (e^{2} - 1) \\approx 15{,}97$.', true]],
    resposta: 'Resposta: $\\int_{0}^{1} 5e^{2x}\\,dx = \\frac{5}{2} \\cdot (e^{2} - 1) \\approx 15{,}97$.'},

  {id: 'parametre', nom: 'Exponencial amb un paràmetre',
    enunciat: 'Considera la funció $F(t) = \\int_{0}^{t} Ae^{-2x}\\,dx$, on $A$ és una constant real. Troba el valor de $A$ sabent que $F(1) = 1 - e^{-2}$.',
    integral: '\\displaystyle\\int_{0}^{t} Ae^{-2x}\\,dx', nomIntegral: 'F(t)', barrow: 'G(t) - G(0)', b: 't', a: '0', F: 'G',
    textBarrow: 'Escriu-ho amb la regla de Barrow: $G(t) - G(0)$, on $G$ és una primitiva de $Ae^{-2x}$. (No l\'anomenis $F$: la lletra $F$ ja és la funció de l\'enunciat.)',
    primitiva: [
      ['\\displaystyle\\int Ae^{-2x}\\,dx', 'Primer, una primitiva: $G(x) = \\int Ae^{-2x}\\,dx$. La $A$ és un nombre (que encara no saps), no la variable.'],
      ['A\\displaystyle\\int e^{-2x}\\,dx', 'Treu la constant $A$ fora de la integral.'],
      ['A \\cdot \\left(-\\frac{1}{2}\\right)\\displaystyle\\int (-2)e^{-2x}\\,dx', 'La derivada de l\'exponent és $(-2x)\' = -2$. Multiplica a dins per $-2$ i a fora per $-\\frac{1}{2}$.'],
      ['A \\cdot \\left(-\\frac{1}{2}\\right)e^{-2x}', 'Ara és immediata: $\\int f\'(x)\\,e^{f(x)}\\,dx = e^{f(x)} + C$. Agafa $C = 0$.'],
      ['-\\frac{A}{2}e^{-2x}', 'Opera: $A \\cdot \\left(-\\frac{1}{2}\\right) = -\\frac{A}{2}$.'],
    ],
    fb: [['-\\frac{A}{2}e^{-2t}', 'Calcula $G(t)$: substitueix $x$ per $t$.']],
    fa: [['-\\frac{A}{2}e^{-2 \\cdot 0}', 'Calcula $G(0)$: substitueix $x$ per $0$.'], ['-\\frac{A}{2}e^{0}', 'Opera l\'exponent.'], ['-\\frac{A}{2}', '$e^{0} = 1$.']],
    fi: [['-\\frac{A}{2}e^{-2t} - \\left(-\\frac{A}{2}\\right)', '$G(t) - G(0)$.'], ['\\frac{A}{2} - \\frac{A}{2}e^{-2t}', 'Treu el parèntesi: menys per menys és més.'],
      ['\\frac{A}{2} \\cdot (1 - e^{-2t})', 'Treu factor comú $\\frac{A}{2}$.']],
    condicio: [
      ['F(1) = 1 - e^{-2}', 'Ara la condició de l\'enunciat.'],
      ['\\frac{A}{2} \\cdot (1 - e^{-2}) = 1 - e^{-2}', 'Substitueix $t = 1$ a l\'expressió de $F(t)$.'],
      ['\\frac{A}{2} = 1', 'Divideix els dos costats entre $1 - e^{-2}$, que no és $0$.'],
    ],
    final: 'A = 2', resposta: 'Multiplica els dos costats per $2$. Resposta: $A = 2$.'},

  {id: 'logaritme', nom: 'Logaritme',
    enunciat: 'Calcula la integral definida $\\int_{0}^{1} \\dfrac{6}{2x + 1}\\,dx$.',
    integral: '\\displaystyle\\int_{0}^{1} \\frac{6}{2x + 1}\\,dx', barrow: 'F(1) - F(0)', b: '1', a: '0', F: 'F',
    primitiva: [
      ['\\displaystyle\\int \\frac{6}{2x + 1}\\,dx', 'Primer, una primitiva: $F(x) = \\int \\frac{6}{2x + 1}\\,dx$.'],
      ['3\\displaystyle\\int \\frac{2}{2x + 1}\\,dx', 'La derivada del denominador és $(2x + 1)\' = 2$. Escriu el $6$ com $3 \\cdot 2$ i treu el $3$ fora: a dins queda la derivada del denominador.'],
      ['3\\ln|2x + 1|', 'Ara és immediata: $\\int \\frac{f\'(x)}{f(x)}\\,dx = \\ln|f(x)| + C$, amb $f(x) = 2x + 1$. Agafa $C = 0$.'],
    ],
    fb: [['3\\ln|2 \\cdot 1 + 1|', 'Calcula $F(1)$: substitueix $x$ per $1$.'], ['3\\ln 3', 'Opera dins del valor absolut.']],
    fa: [['3\\ln|2 \\cdot 0 + 1|', 'Calcula $F(0)$: substitueix $x$ per $0$.'], ['3\\ln 1', 'Opera dins del valor absolut.'], ['0', '$\\ln 1 = 0$.']],
    fi: [['3\\ln 3 - 0', '$F(1) - F(0)$.'], ['3\\ln 3', 'Opera.'], ['3{,}30', 'Amb la calculadora, $3\\ln 3 \\approx 3{,}30$.', true]],
    resposta: 'Resposta: $\\int_{0}^{1} \\frac{6}{2x + 1}\\,dx = 3\\ln 3 \\approx 3{,}30$.'},

  {id: 'condicio', nom: 'Logaritme amb una condició',
    enunciat: 'Troba la primitiva de la funció $f(x) = \\dfrac{3}{x - 1}$, definida per a $x > 1$, que compleix $F(e + 1) = 2$.',
    F: 'F', ambC: true,
    primitiva: [
      ['\\displaystyle\\int \\frac{3}{x - 1}\\,dx', 'Les primitives de $f$: $F(x) = \\int \\frac{3}{x - 1}\\,dx$.'],
      ['3\\displaystyle\\int \\frac{1}{x - 1}\\,dx', 'Treu el $3$ fora. A dins ja hi ha la derivada del denominador: $(x - 1)\' = 1$.'],
      ['3\\ln|x - 1| + C', 'Ara és immediata: $\\int \\frac{f\'(x)}{f(x)}\\,dx = \\ln|f(x)| + C$. Aquí no agafis $C = 0$: la condició et dirà quant val.'],
    ],
    condicio: [
      ['F(e + 1) = 2', 'Imposa la condició de l\'enunciat.'],
      ['3\\ln|e + 1 - 1| + C = 2', 'Substitueix $x$ per $e + 1$ a $F(x)$.'],
      ['3\\ln e + C = 2', 'Opera dins del valor absolut.'],
      ['3 + C = 2', '$\\ln e = 1$.'],
      ['C = -1', 'Passa el $3$ a l\'altre costat.'],
    ],
    final: 'F(x) = 3\\ln|x - 1| - 1', resposta: 'Resposta: $F(x) = 3\\ln|x - 1| - 1$.'},

  {id: 'sinus', nom: 'Sinus',
    enunciat: 'Calcula la integral definida $\\int_{0}^{2\\pi} 3\\sin\\dfrac{x}{4}\\,dx$.',
    integral: '\\displaystyle\\int_{0}^{2\\pi} 3\\sin\\frac{x}{4}\\,dx', barrow: 'F(2\\pi) - F(0)', b: '2\\pi', a: '0', F: 'F',
    primitiva: [
      ['\\displaystyle\\int 3\\sin\\frac{x}{4}\\,dx', 'Primer, una primitiva: $F(x) = \\int 3\\sin\\frac{x}{4}\\,dx$.'],
      ['3\\displaystyle\\int \\sin\\frac{x}{4}\\,dx', 'Treu el $3$ fora de la integral.'],
      ['3 \\cdot 4\\displaystyle\\int \\frac{1}{4}\\sin\\frac{x}{4}\\,dx', 'La derivada de l\'interior és $\\left(\\frac{x}{4}\\right)\' = \\frac{1}{4}$. Multiplica a dins per $\\frac{1}{4}$ i a fora per $4$.'],
      ['3 \\cdot 4 \\cdot \\left(-\\cos\\frac{x}{4}\\right)', 'Ara és immediata: $\\int f\'(x)\\sin f(x)\\,dx = -\\cos f(x) + C$. Compte amb el signe menys. Agafa $C = 0$.'],
      ['-12\\cos\\frac{x}{4}', 'Opera: $3 \\cdot 4 = 12$, amb el signe menys.'],
    ],
    fb: [['-12\\cos\\frac{2\\pi}{4}', 'Calcula $F(2\\pi)$: substitueix $x$ per $2\\pi$.'], ['-12\\cos\\frac{\\pi}{2}', 'Simplifica la fracció.'], ['0', '$\\cos\\frac{\\pi}{2} = 0$.']],
    fa: [['-12\\cos\\frac{0}{4}', 'Calcula $F(0)$: substitueix $x$ per $0$.'], ['-12\\cos 0', 'Simplifica la fracció.'], ['-12', '$\\cos 0 = 1$.']],
    fi: [['0 - (-12)', '$F(2\\pi) - F(0)$.'], ['12', 'Opera.']],
    resposta: 'Resposta: $\\int_{0}^{2\\pi} 3\\sin\\frac{x}{4}\\,dx = 12$.'},

  {id: 'cosinus', nom: 'Cosinus',
    enunciat: 'Calcula la integral definida $\\int_{0}^{\\pi/6} 2\\cos(3x)\\,dx$.',
    integral: '\\displaystyle\\int_{0}^{\\pi/6} 2\\cos(3x)\\,dx', barrow: 'F\\left(\\frac{\\pi}{6}\\right) - F(0)', b: '\\frac{\\pi}{6}', a: '0', F: 'F',
    primitiva: [
      ['\\displaystyle\\int 2\\cos(3x)\\,dx', 'Primer, una primitiva: $F(x) = \\int 2\\cos(3x)\\,dx$.'],
      ['2\\displaystyle\\int \\cos(3x)\\,dx', 'Treu el $2$ fora de la integral.'],
      ['2 \\cdot \\frac{1}{3}\\displaystyle\\int 3\\cos(3x)\\,dx', 'La derivada de l\'interior és $(3x)\' = 3$. Multiplica a dins per $3$ i a fora per $\\frac{1}{3}$.'],
      ['2 \\cdot \\frac{1}{3}\\sin(3x)', 'Ara és immediata: $\\int f\'(x)\\cos f(x)\\,dx = \\sin f(x) + C$. Agafa $C = 0$.'],
      ['\\frac{2}{3}\\sin(3x)', 'Opera: $2 \\cdot \\frac{1}{3} = \\frac{2}{3}$.'],
    ],
    fb: [['\\frac{2}{3}\\sin\\left(3 \\cdot \\frac{\\pi}{6}\\right)', 'Calcula $F\\left(\\frac{\\pi}{6}\\right)$: substitueix $x$ per $\\frac{\\pi}{6}$.'], ['\\frac{2}{3}\\sin\\frac{\\pi}{2}', 'Simplifica: $3 \\cdot \\frac{\\pi}{6} = \\frac{\\pi}{2}$.'], ['\\frac{2}{3}', '$\\sin\\frac{\\pi}{2} = 1$.']],
    fa: [['\\frac{2}{3}\\sin(3 \\cdot 0)', 'Calcula $F(0)$: substitueix $x$ per $0$.'], ['\\frac{2}{3}\\sin 0', 'Opera.'], ['0', '$\\sin 0 = 0$.']],
    fi: [['\\frac{2}{3} - 0', '$F\\left(\\frac{\\pi}{6}\\right) - F(0)$.'], ['\\frac{2}{3}', 'Opera.']],
    resposta: 'Resposta: $\\int_{0}^{\\pi/6} 2\\cos(3x)\\,dx = \\frac{2}{3}$.'},

  {id: 'potencies', nom: 'Arrels i potències',
    enunciat: 'Calcula la integral definida $\\int_{1}^{4} \\left(\\sqrt{x} + \\dfrac{1}{x^{2}}\\right)dx$.',
    integral: '\\displaystyle\\int_{1}^{4} \\left(\\sqrt{x} + \\frac{1}{x^{2}}\\right)dx', barrow: 'F(4) - F(1)', b: '4', a: '1', F: 'F',
    primitiva: [
      ['\\displaystyle\\int \\left(\\sqrt{x} + \\frac{1}{x^{2}}\\right)dx', 'Primer, una primitiva: $F(x) = \\int \\left(\\sqrt{x} + \\frac{1}{x^{2}}\\right)dx$.'],
      ['\\displaystyle\\int \\left(x^{1/2} + x^{-2}\\right)dx', 'Escriu l\'arrel i la fracció com a potències de $x$: $\\sqrt{x} = x^{1/2}$ i $\\frac{1}{x^{2}} = x^{-2}$.'],
      ['\\frac{x^{3/2}}{3/2} + \\frac{x^{-1}}{-1}', 'Integra terme a terme: $\\int x^n\\,dx = \\frac{x^{n+1}}{n+1}$ (puja l\'exponent i divideix pel nou exponent). També val per a exponents fraccionaris o negatius, si $n \\neq -1$. Agafa $C = 0$.'],
      ['\\frac{2}{3}x^{3/2} - \\frac{1}{x}', 'Simplifica: dividir entre $\\frac{3}{2}$ és multiplicar per $\\frac{2}{3}$, i $\\frac{x^{-1}}{-1} = -\\frac{1}{x}$.'],
      ['\\frac{2}{3}x\\sqrt{x} - \\frac{1}{x}', 'Torna a escriure la potència com a arrel: $x^{3/2} = x\\sqrt{x}$.'],
    ],
    fb: [['\\frac{2}{3} \\cdot 4\\sqrt{4} - \\frac{1}{4}', 'Calcula $F(4)$: substitueix $x$ per $4$.'], ['\\frac{16}{3} - \\frac{1}{4}', '$4\\sqrt{4} = 4 \\cdot 2 = 8$, i $\\frac{2}{3} \\cdot 8 = \\frac{16}{3}$.'], ['\\frac{61}{12}', 'Resta les fraccions: $\\frac{64}{12} - \\frac{3}{12}$.']],
    fa: [['\\frac{2}{3} \\cdot 1\\sqrt{1} - \\frac{1}{1}', 'Calcula $F(1)$: substitueix $x$ per $1$.'], ['\\frac{2}{3} - 1', 'Opera.'], ['-\\frac{1}{3}', 'Resta.']],
    fi: [['\\frac{61}{12} - \\left(-\\frac{1}{3}\\right)', '$F(4) - F(1)$.'], ['\\frac{61}{12} + \\frac{4}{12}', 'Menys per menys és més, i $\\frac{1}{3} = \\frac{4}{12}$.'], ['\\frac{65}{12}', 'Suma.']],
    resposta: 'Resposta: $\\int_{1}^{4} \\left(\\sqrt{x} + \\frac{1}{x^{2}}\\right)dx = \\frac{65}{12}$.'},
].map(p => Object.freeze(p)));
const FIXOS = arrel.Dades.problemesFixos(PROBLEMES);
const {perId} = FIXOS;

function passos(valors) {
  const p = perId(valors.p);
  const g = F.guio(NFILES);
  /* La fila de la integral: «I = ∫ … = F(b) − F(a) = …» (el nom, només si l'enunciat n'hi dona). */
  const cadena = [];
  const filaIntegral = () => {
    const inici = (p.nomIntegral ? K('In', p.nomIntegral) + R('Iq', '=') : '') + K('Ii', p.integral);
    g.files[FILA.integral] = F.enLinies(inici, cadena.map(([tex, aprox], k) => R(`Ie${k}`, aprox ? '\\approx' : '=') + K(`Iv${k}`, tex)));
  };
  if (p.integral) {
    filaIntegral();
    g.afegeix(p.textBarrow ? `Has de calcular $${p.nomIntegral} = ${p.integral.replace('\\displaystyle', '')}$.` : BARROW);
    cadena.push([p.barrow]);
    filaIntegral();
    g.afegeix(p.textBarrow || `Escriu-ho: $${p.barrow}$, el límit de dalt menys el de baix.`);
  }
  /* La primitiva, versió a versió a la mateixa fila. */
  const nomF = `${p.F}(x)`;
  for (const [tex, text] of p.primitiva) {
    g.files[FILA.primitiva] = K('Pn', nomF) + R('Pq', '=') + K('Pv', tex);
    g.afegeix(text);
  }
  /* F(b) i F(a). */
  for (const [fila, nom, versions, P] of [[FILA.fb, `${p.F}(${p.b})`, p.fb, 'B'], [FILA.fa, `${p.F}(${p.a})`, p.fa, 'A']]) {
    if (!versions) continue;
    const nomTex = /\\frac/.test(nom) ? `${p.F}\\left(${p.b}\\right)` : nom;
    for (const [tex, text] of versions) {
      g.files[fila] = K(P + 'n', nomTex) + R(P + 'q', '=') + K(P + 'v', tex);
      g.afegeix(text);
    }
  }
  /* La resta de la cadena de la integral. */
  for (const [tex, text, aprox] of p.fi || []) {
    cadena.push([tex, aprox]);
    filaIntegral();
    g.afegeix(text);
  }
  /* La condició (o el paràmetre). */
  for (const [tex, text] of p.condicio || []) {
    g.files[FILA.condicio] = K('Cv', tex);
    g.afegeix(text);
  }
  if (p.final) {
    g.files[FILA.resposta] = K('Sv', p.final);
    g.classes[FILA.resposta] = 'final';
  } else g.classes[FILA.integral] = 'final';
  g.afegeix(p.resposta);
  return g.passos;
}

arrel.IntegralsImmediates = Object.freeze({
  titol: 'Integrals immediates',
  categoria: 'analisi',
  files: NFILES,
  perDefecte: FIXOS.perDefecte,
  exemples: FIXOS.exemples,
  titolEditor: 'Tria un problema',
  titolExemples: 'Problemes:',
  notaEditor: 'Treu les constants fora, completa la derivada de l\'interior (multiplica a dins i divideix a fora) i aplica la integral immediata.',
  editor: [],
  problemes: PROBLEMES,
  FILA,
  valida: FIXOS.valida, llegeixAdreca: FIXOS.llegeixAdreca, escriuAdreca: FIXOS.escriuAdreca,
  enunciat: v => perId(v.p).enunciat,
  resum: FIXOS.resum, nomExemple: FIXOS.nomExemple,
  passos,
});

})(globalThis);
