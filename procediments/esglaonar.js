/* ═══════════════════════════════════════════════════════════════════
   esglaonar.js — Procediment: esglaonar una matriu 3×4 pel mètode de Gauss
   ───────────────────────────────────────────────────────────────────
   La tècnica per resoldre sistemes: la matriu ampliada A* (3 files, 4
   columnes, nombres enters, sense paràmetres) es converteix en una
   matriu esglaonada, sempre amb el mateix algorisme (Matrius.passosGauss):
     · a cada columna, el pivot és el primer element no nul a partir de la
       fila que toca (només es canvien files si aquest element és 0);
     · per fer un zero a sota del pivot p (element e de la fila i):
       Fᵢ → p·Fᵢ + (−e)·Fⱼ, sempre una suma, sense fraccions ni dreceres
       (els nombres poden créixer: és igual);
     · les files de zeros, al final.
   Al final, els pivots (verd) i el que es llegeix de la forma esglaonada:
   rang(A) (files no nul·les de les tres primeres columnes) i rang(A*).
   Adreça: esglaonar.html?A=1,1,1,6;2,-1,1,3;1,2,-1,2 (una fila per «;»).
   Totes les línies que es veuen són certes: ho comprova proves/comprova.js.
   Claus: Gn, Gq, G<t>a<i><j> les matrius (vegeu matrius.js); Rr el resultat.
   ═══════════════════════════════════════════════════════════════════ */
(function (arrel) {
'use strict';

const M = arrel.Mates;
const F = arrel.Formules;
const Mt = arrel.Matrius;
const {clau: K} = F;

/** Files de la pissarra. */
const FILA = Object.freeze({gauss: 0, resultat: 1});

// Fàcils (pivots 1, nombres petits) i llargues (pivots que no són 1); rang(A) 3, 2 o 1; i A* amb el mateix rang o un més.
const EXEMPLES = Object.freeze([
  '1,1,1,6;2,-1,1,3;1,2,-1,2',       // fàcil: rang(A) = rang(A*) = 3
  '1,2,-1,3;2,1,1,4;3,3,0,7',        // fàcil: la 3a fila és la suma de les altres: rang 2 i 2
  '1,-1,2,1;2,1,1,3;3,0,3,5',        // fàcil: els coeficients sí, el terme independent no: rang 2 i 3
  '0,2,1,3;1,1,1,2;2,3,1,1',         // el primer element és 0: cal canviar files
  '2,3,-1,4;3,-2,4,1;5,4,2,7',       // llarga: rang 3
  '3,2,5,1;2,-3,4,2;4,7,6,0',        // llarga: rang 2 i 2
  '2,-3,4,5;3,1,-2,4;7,-5,6,9',      // llarga: rang 2 i 3
  '1,2,3,4;2,4,6,8;3,6,9,1',         // rang(A) = 1 i rang(A*) = 2: una fila de zeros al mig, va al final
].map(A => Object.freeze({A})));
const PER_DEFECTE = EXEMPLES[0];

const matriu = v => Mt.nombres(Mt.llegeixMatriu(v.A, 3, 4).A);

function valida(v) {
  let N;
  try {
    const {X} = Mt.llegeixMatriu(v.A, 3, 4);
    if (X) return `Aquí la matriu és de nombres: no hi pot haver cap paràmetre (${X}).`;
    N = matriu(v);
  } catch (e) {
    if (e instanceof M.ErrorLectura) return e.message;
    throw e;
  }
  if (N.every(f => f.slice(0, 3).every(c => c.esZero()))) return 'Totes les incògnites tenen coeficient 0. Tria una altra matriu.';
  return null;
}

function llegeixAdreca(a) {
  if (a.A === undefined) return {valors: Object.assign({}, PER_DEFECTE)};
  try {
    const {A, X} = Mt.llegeixMatriu(String(a.A).replace(/\s+/g, ''), 3, 4);
    const v = {A: Mt.textMatriu(A, X)};
    const error = valida(v);
    return error ? {error: `L'adreça no es pot fer servir. ${error}`} : {valors: v};
  } catch (e) {
    if (e instanceof M.ErrorLectura) return {error: `No entenc la matriu de l'adreça: ${e.message}`};
    throw e;
  }
}
const escriuAdreca = v => ({A: v.A});
const texNet = N => Mt.texAmpliada(N).replace(/\\htmlData\{[^}]*\}/g, '');
const enunciat = v => `Esglaona la matriu ampliada $A^* = ${texNet(matriu(v))}$, sense fer servir fraccions.`;
const resum = v => `A^* = ${Mt.texMatriuPetita(Mt.llegeixMatriu(v.A, 3, 4).A, null)}`;

function passos(v) {
  const N = matriu(v);
  const g = F.guio(2);
  const {passos: gauss, B, pivots} = Mt.passosGauss(N);
  const cadena = (fins, marca) => { g.files[FILA.gauss] = Mt.texCadenaGauss(N, gauss, {fins, marca}); };

  cadena(0);
  g.afegeix('Esglaonar: aconseguir zeros a sota de la diagonal, columna per columna, amb operacions entre files.');
  gauss.forEach((pas, t) => { cadena(t + 1); g.afegeix(pas.text); });

  /* La forma esglaonada: els pivots, i el que s'hi llegeix. */
  const esPivot = (i, j) => pivots.some(p => p.fila === i && p.columna === j);
  cadena(gauss.length, (i, j) => (esPivot(i, j) ? 'mes' : ''));
  const zeroA = f => f.slice(0, 3).every(c => c.esZero());
  const rA = B.filter(f => !zeroA(f)).length, rAm = B.filter(f => !f.every(c => c.esZero())).length;
  const files = [];
  B.forEach((f, i) => {
    if (!zeroA(f)) return;
    files.push(f[3].esZero() ? `la fila ${i + 1} és tota de zeros (una equació $0 = 0$)`
      : `la fila ${i + 1} té zeros a $A$ però no a l'última columna (una equació $0 = ${M.texNombre(f[3])}$, impossible)`);
  });
  g.afegeix('La matriu ja està esglaonada.' + (files.length > 1 ? ` Fixa't: ${files.join('; a més, ')}.` : ''));
  g.files[FILA.resultat] = K('Rr', `\\text{rang}(A) = ${rA},\\quad \\text{rang}(A^*) = ${rAm}`);
  g.classes[FILA.resultat] = 'final';
  const files0 = n => (n === 1 ? '1 fila no nul·la' : `${n} files no nul·les`);
  g.afegeix(rA === rAm && rA === 3
    ? 'Si una matriu està en forma esglaonada, és molt fàcil trobar el seu rang: és el nombre de files que no siguin nul·les. Per tant, $\\text{rang}(A) = \\text{rang}(A^*) = 3$.'
    : rA === rAm
      ? `La matriu està esglaonada. En aquest cas, és molt senzill determinar el rang, perquè és el nombre de files no nul·les. Per tant, $\\text{rang}(A) = ${rA}$ i $\\text{rang}(A^*) = ${rAm}$.`
      : `La matriu ja està esglaonada. En aquest cas, és directe trobar els rangs. Per exemple, $\\text{rang}(A) = ${rA}$ perquè hi ha ${files0(rA)}. En canvi, $\\text{rang}(A^*) = ${rAm}$ perquè hi ha ${files0(rAm)}.`);
  return g.passos;
}

arrel.Esglaonar = Object.freeze({
  titol: 'Esglaonar una matriu (Gauss)',
  categoria: 'algebra',
  files: 2,
  perDefecte: PER_DEFECTE,
  exemples: EXEMPLES,
  titolEditor: 'Tria una matriu',
  titolExemples: 'Matrius:',
  notaEditor: 'També pots escriure la teva matriu a l\'adreça, per files: esglaonar.html?A=1,1,1,6;2,-1,1,3;1,2,-1,2 '
    + '(3 files separades per «;», amb 4 nombres enters de −9 a 9 cadascuna).',
  editor: [],
  FILA, EXEMPLES,
  valida, llegeixAdreca, escriuAdreca, enunciat, resum, passos,
});

})(globalThis);
