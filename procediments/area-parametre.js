/* ═══════════════════════════════════════════════════════════════════
   area-parametre.js — Procediment: un paràmetre a partir d'una integral
   o d'una àrea
   ───────────────────────────────────────────────────────────────────
   Tres problemes fixos:
     limit:     ∫₀ᵏ (2x + 1) dx = 6, k > 0: el límit superior és k;
                F(k) − F(0) = k² + k; k² + k = 6; k² + k − 6 = 0 es queda
                a la vista i es resol a la fila de treball (Integrals.resol);
                al final, la solució negativa es tatxa;
     coeficient: ∫₀³ (kx² + 2x) dx = 27: el paràmetre és un coeficient;
                surt una equació de primer grau, 9k + 9 = 27;
     parabola:  l'àrea entre y = kx − x² (k > 0) i l'eix OX val 36: els
                talls són x = 0 i x = k; l'àrea és el valor absolut de la
                integral: |k³/6| = 36, k³/6 = 36, k = ∛216 = 6.
   Adreça: area-parametre.html?p=limit (limit, coeficient, parabola)
   Totes les línies que es veuen són certes: ho comprova proves/comprova.js.
   Claus: Dd les dades; Tk els talls; Fp la primitiva; Bk Barrow; e…
   l'equació (Integrals.resol, prefix e; Y… la còpia que es queda) o Ek;
   Rk la resposta.
   ═══════════════════════════════════════════════════════════════════ */
(function (arrel) {
'use strict';

const M = arrel.Mates;
const F = arrel.Formules;
const Gr = arrel.Grafiques;
const Ig = arrel.Integrals;
const {clau: K} = F;
const fr = (a, b = 1) => new M.Fraccio(a, b);

const PROBLEMES = Object.freeze([
  {id: 'limit', nom: 'El límit superior', V: fr(6)},
  {id: 'coeficient', nom: 'Un coeficient', V: fr(27)},
  {id: 'parabola', nom: 'Una àrea amb paràmetre', V: fr(36)},
].map(p => Object.freeze(p)));
const FIXOS = arrel.Dades.problemesFixos(PROBLEMES);
const {perId} = FIXOS;

/** Files de la pissarra. */
/** Files de la pissarra (la gràfica, la del problema «parabola», al final: no deixa cap forat a dalt). */
const FILA = Object.freeze({dades: 0, talls: 1, primitiva: 2, barrow: 3, equacio: 4, treball: 5, resposta: 6, grafica: 7});
const FILES = 8;
const O = '\\quad\\text{o}\\quad ';
/** Una solució que no serveix, tatxada (en vermell). */
const tatxa = tex => `\\textcolor{#b91c1c}{\\cancel{${tex}}}`;

const ENUNCIATS = {
  'limit': () => 'Troba el valor de $k > 0$ tal que $\\displaystyle\\int_0^k (2x + 1)\\,dx = 6$.',
  'coeficient': () => 'Troba el valor de $k$ tal que $\\displaystyle\\int_0^3 (kx^2 + 2x)\\,dx = 27$.',
  'parabola': () => 'Troba el valor de $k > 0$ perquè l\'àrea de la regió limitada per la paràbola $y = kx - x^2$ i l\'eix $OX$ sigui $36$.',
};

function passos(valors) {
  const p = perId(valors.p);
  const g = F.guio(FILES);
  if (p.id === 'limit') {
    g.files[FILA.dades] = K('Dd', '\\displaystyle\\int_0^k (2x + 1)\\,dx = 6,\\quad k > 0');
    g.afegeix('El paràmetre és el límit superior. Calcula la integral (dependrà de $k$) i iguala-la a $6$.');
    F.passosIntegral(g, FILA.primitiva, F.membreEsquerre('G', 'F', 'x'), M.termes([fr(1), fr(2)]), {C: false,
      textos: {indicada: 'Una primitiva de $2x + 1$ (amb $C = 0$).', feta: 'Simplifica: $F(x) = x^2 + x$.'}});
    g.files[FILA.barrow] = K('Bk', '\\displaystyle\\int_0^k (2x + 1)\\,dx = F(k) - F(0) = (k^2 + k) - 0 = k^2 + k');
    g.afegeix('Regla de Barrow: $F(k) - F(0)$. A $F(x)$, posa $x = k$ (i $x = 0$).');
    g.files[FILA.equacio] = F.polinomi('e', M.termes([fr(0), fr(1), fr(1)]), 'k') + F.rel('eq', '=') + K('ec0', '6');
    g.afegeix('La integral ha de valer $6$: $k^2 + k = 6$.');
    const sols = Ig.resol(g, {fila: FILA.equacio, treball: FILA.treball, P: 'e', termes: M.termes([fr(-6), fr(1), fr(1)]), X: 'k',
      text: 'Passa el $6$ a l\'altre costat (hi arriba canviat de signe): és una equació de segon grau en $k$. Resol-la a sota.'});
    const k0 = sols.map(s => s.valor).find(x => x.signe() > 0);
    const dolentes = sols.map(s => s.valor).filter(x => x.signe() <= 0);
    g.files[FILA.treball] = g.files[FILA.treball].split(O).map((part, i) => (sols[i].valor.signe() > 0 ? part : tatxa(part))).join(O);
    g.files[FILA.resposta] = K('Rk', `k > 0\\ \\Rightarrow\\ k = ${M.texNombre(k0)}`);
    g.classes[FILA.resposta] = 'final';
    g.afegeix(`L'enunciat demana $k > 0$: ${dolentes.map(x => `$k = ${M.texNombre(x)}$`).join(', ')} no serveix (la tatxem). Resposta: $k = ${M.texNombre(k0)}$.`);
  } else if (p.id === 'coeficient') {
    g.files[FILA.dades] = K('Dd', '\\displaystyle\\int_0^3 (kx^2 + 2x)\\,dx = 27');
    g.afegeix('El paràmetre és un coeficient de la funció. Integra amb la $k$ com si fos un nombre, i iguala el resultat a $27$.');
    g.files[FILA.primitiva] = K('Fp', 'F(x) = \\displaystyle\\int (kx^2 + 2x)\\,dx = k\\,\\dfrac{x^3}{3} + x^2');
    g.afegeix('Una primitiva (amb $C = 0$): la $k$ és una constant, es queda multiplicant.');
    g.files[FILA.barrow] = K('Bk', '\\displaystyle\\int_0^3 (kx^2 + 2x)\\,dx = F(3) - F(0) = k \\cdot \\dfrac{27}{3} + 9 - 0 = 9k + 9');
    g.afegeix('Regla de Barrow: $F(3) - F(0)$.');
    g.files[FILA.equacio] = K('Ek', '9k + 9 = 27\\ \\Rightarrow\\ 9k = 18\\ \\Rightarrow\\ k = 2');
    g.afegeix('Iguala-ho a $27$ i aïlla $k$: una equació de primer grau.');
    g.files[FILA.resposta] = K('Rk', 'k = 2');
    g.classes[FILA.resposta] = 'final';
    g.afegeix('Resposta: $k = 2$.');
  } else {
    g.files[FILA.dades] = K('Dd', 'f(x) = kx - x^2,\\quad k > 0,\\quad A = 36');
    g.afegeix('Per calcular l\'àrea entre la corba i l\'eix, primer cal saber on el talla. Tot dependrà de $k$.');
    g.files[FILA.talls] = K('Tk', 'kx - x^2 = 0 \\iff x \\cdot (k - x) = 0 \\iff x = 0 \\text{ o } x = k');
    g.afegeix('Els talls amb l\'eix: treu factor comú $x$. La regió va de $x = 0$ a $x = k$, i l\'àrea és el valor absolut de la integral entre aquests dos punts.');
    g.files[FILA.primitiva] = K('Fp', 'F(x) = \\displaystyle\\int (kx - x^2)\\,dx = k\\,\\dfrac{x^2}{2} - \\dfrac{x^3}{3}');
    g.afegeix('Una primitiva (amb $C = 0$): la $k$ es queda multiplicant.');
    g.files[FILA.barrow] = K('Bk', '\\displaystyle\\int_0^k (kx - x^2)\\,dx = F(k) - F(0) = \\dfrac{k^3}{2} - \\dfrac{k^3}{3} - 0 = \\dfrac{k^3}{6}');
    g.afegeix('Regla de Barrow: $F(k) - F(0)$. A $F(x)$, posa $x = k$: $k \\cdot \\frac{k^2}{2} = \\frac{k^3}{2}$.');
    g.files[FILA.equacio] = K('Ek', '\\left|\\dfrac{k^3}{6}\\right| = 36\\ \\Rightarrow\\ \\dfrac{k^3}{6} = 36\\ \\Rightarrow\\ k^3 = 216\\ \\Rightarrow\\ k = \\sqrt[3]{216} = 6');
    g.afegeix('L\'àrea és el valor absolut de la integral, i ha de valer $36$. Com que $k > 0$, $\\frac{k^3}{6}$ és positiu i el valor absolut no el canvia. Aïlla $k$: multiplica per $6$, i fes l\'arrel cúbica.');
    g.files[FILA.grafica] = Gr.grafica({corbes: [{termes: M.termes([fr(0), fr(6), fr(-1)]), nom: 'f'}], x: Gr.finestra([0, 6]), marques: [fr(0), fr(6)],
      zones: [{l: fr(0), r: fr(6), dalt: 0, baix: null}]});
    g.files[FILA.resposta] = K('Rk', 'k = 6');
    g.classes[FILA.resposta] = 'final';
    g.afegeix('Resposta: $k = 6$. A sota, la regió per a $k = 6$: la paràbola $y = 6x - x^2$ entre $x = 0$ i $x = 6$.');
  }
  return g.passos;
}

arrel.AreaParametre = Object.freeze({
  titol: 'Un paràmetre a partir d\'una integral',
  categoria: 'analisi',
  files: FILES,
  perDefecte: FIXOS.perDefecte,
  exemples: FIXOS.exemples,
  titolEditor: 'Tria un problema',
  notaEditor: 'Es calcula la integral amb el paràmetre com si fos un nombre, i s\'iguala al valor que diu l\'enunciat.',
  editor: [],
  problemes: PROBLEMES,
  FILA,
  valida: FIXOS.valida, llegeixAdreca: FIXOS.llegeixAdreca, escriuAdreca: FIXOS.escriuAdreca,
  enunciat: v => ENUNCIATS[v.p](perId(v.p)),
  resum: FIXOS.resum, nomExemple: FIXOS.nomExemple,
  passos,
});

})(globalThis);
