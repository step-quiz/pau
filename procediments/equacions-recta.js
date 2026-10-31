/* ═══════════════════════════════════════════════════════════════════
   equacions-recta.js — Procediment: les equacions d'una recta (i d'un pla)
   ───────────────────────────────────────────────────────────────────
   Set problemes fixos, triats a partir dels exercicis PAU: treure un
   punt i un vector director de l'equació que dona l'enunciat (sovint
   escrita d'una manera «amagada») i escriure les altres equacions.
     dos-punts     la recta per dos punts A i B (vector AB)
     continua      (x − 1)/2 = (y + 3)/(−1) = z/4: el punt amb el signe
                   canviat als numeradors, el vector als denominadors
     amagada       x − 1 = y = −z (geo-23s-q5): denominadors 1 i −1
     parametre     x = −y = z + m (geo-23j2-q3): el punt depèn de m
     coeficient    2x − 1 = (y + 2)/3 = z: treure el 2 factor comú;
                   un vector proporcional sense fraccions
     zero          paramètriques amb un 0 al vector: a la contínua,
                   y = 4 a part (no es pot dividir per 0)
     pla           un pla en forma vectorial (geo-26j2-q4b) → general,
                   pel determinant |x − a  y − b  z − c; u; v| = 0
                   (Geometria.passosPlaDeterminant, com a pla.js)
   Per a cada recta: P ∈ r i el vector director, i les equacions
   vectorial, paramètriques i contínua (les que l'enunciat no dona).
   Adreça: equacions-recta.html?p=continua
   Totes les línies que es veuen són certes: ho comprova proves/comprova.js.
   Claus: D les dades, W la reescriptura, U el punt i el vector, X el
   vector sense fraccions, V la vectorial, Q les paramètriques, C la
   contínua (G, H, P: les del pla, de Geometria).
   ═══════════════════════════════════════════════════════════════════ */
(function (arrel) {
'use strict';

const M = arrel.Mates;
const F = arrel.Formules;
const Mt = arrel.Matrius;
const G = arrel.Geometria;
const {Fraccio} = M;
const {clau: K} = F;
const fr = (a, b = 1) => new Fraccio(a, b);

const FILA = Object.freeze({dades: 0, reescriu: 1, puntVector: 2, vector2: 3, vectorial: 4, parametriques: 5, continua: 6, det: 7, desenvolupa: 8, pla: 9});
const NFILES = 10;
const VARS = ['x', 'y', 'z'];

/* Una coordenada del punt és un nombre (Fraccio) o, amb un paràmetre, un text TeX («-m»). */
const texC = a => (a instanceof Fraccio ? M.texNombre(a) : a);
const texPunt = P => `(${P.map(texC).join(',\\ ')})`;
/** «x - 1», «z + m». */
const menys = (v, a) => (a instanceof Fraccio ? G.texMenys(v, a) : a.startsWith('-') ? `${v} + ${a.slice(1)}` : `${v} - ${a}`);
/** «1 + 2\lambda», «-m + \lambda». */
function lineal(a, c) {
  if (a instanceof Fraccio) return Mt.texLineal([a, c], '\\lambda');
  if (c.esZero()) return a;
  const abs = c.abs();
  return `${a} ${c.signe() > 0 ? '+' : '-'} ${abs.igual(1) ? '' : M.texNombre(abs)}\\lambda`;
}
const texVectorial = (nom, P, u) => `${nom}:\\ (x,\\ y,\\ z) = ${texPunt(P)} + \\lambda${texPunt(u)}`;
const texParametriques = (nom, P, u) => `${nom}: \\left\\{\\begin{array}{l} ${VARS.map((v, i) => `${v} = ${lineal(P[i], u[i])}`).join(' \\\\ ')} \\end{array}\\right.`;
/** La contínua: una fracció per a cada component no nul·la del vector; les nul·les, a part («y = 4»). */
function texContinua(nom, P, u) {
  const fraccions = VARS.map((v, i) => [v, i]).filter(([, i]) => !u[i].esZero()).map(([v, i]) => `\\dfrac{${menys(v, P[i])}}{${M.texNombre(u[i])}}`);
  const apart = VARS.map((v, i) => [v, i]).filter(([, i]) => u[i].esZero()).map(([v, i]) => `${v} = ${texC(P[i])}`);
  return `${nom}:\\ ${fraccions.join(' = ')}${apart.length ? ',\\quad ' + apart.join(',\\quad ') : ''}`;
}
const texPuntVector = (P, u, nomVector = '\\vec{u}') => K('Up', `P${texPunt(P)} \\in r`) + ',\\quad ' + K('Uu', `${nomVector} = ${texPunt(u)}`);

const p3 = (...c) => c.map(x => (typeof x === 'string' ? x : Fraccio.de(x)));

const PROBLEMES = Object.freeze([
  {id: 'dos-punts', nom: 'Per dos punts', A: p3(1, 2, -1), B: p3(3, 1, 2)},
  {id: 'continua', nom: 'Contínua', P: p3(1, -3, 0), u: p3(2, -1, 4), dona: 'continua'},
  {id: 'amagada', nom: 'Contínua amagada', P: p3(1, 0, 0), u: p3(1, 1, -1)},
  {id: 'parametre', nom: 'Amb un paràmetre', P: p3(0, 0, '-m'), u: p3(1, -1, 1)},
  {id: 'coeficient', nom: 'Un coeficient a la x', P: p3(fr(1, 2), -2, 0), u: p3(fr(1, 2), 3, 1)},
  {id: 'zero', nom: 'Un zero al vector', P: p3(1, 4, 3), u: p3(2, 0, -1), dona: 'parametriques'},
  {id: 'pla', nom: 'Pla en forma vectorial', P: p3(6, 1, 1), u: p3(1, 1, 0), v: p3(0, 0, 1)},
].map(p => Object.freeze(p)));
const FIXOS = arrel.Dades.problemesFixos(PROBLEMES);
const {perId} = FIXOS;

/* Les dades de cada problema, tal com les dona l'enunciat. */
const DADES = {
  'dos-punts': p => `A${texPunt(p.A)},\\quad B${texPunt(p.B)}`,
  continua: p => texContinua('r', p.P, p.u),
  amagada: () => 'r:\\ x - 1 = y = -z',
  parametre: () => 'r:\\ x = -y = z + m',
  coeficient: () => 'r:\\ 2x - 1 = \\dfrac{y + 2}{3} = z',
  zero: p => texParametriques('r', p.P, p.u),
  pla: p => `\\pi:\\ (x,\\ y,\\ z) = ${texPunt(p.P)} + \\lambda${texPunt(p.u)} + \\mu${texPunt(p.v)}`,
};

/** Les equacions que falten, una per pas, i al final destacades. */
function passosEquacions(g, P, u, dona) {
  const files = [];
  if (dona !== 'vectorial') {
    g.files[FILA.vectorial] = K('Vr', texVectorial('r', P, u));
    g.afegeix('Equació vectorial: un punt de la recta més $\\lambda$ vegades el vector director ($\\lambda$ és qualsevol nombre real: cada valor dona un punt de la recta).');
    files.push(FILA.vectorial);
  }
  if (dona !== 'parametriques') {
    g.files[FILA.parametriques] = K('Qr', texParametriques('r', P, u));
    g.afegeix('Equacions paramètriques: la vectorial, coordenada a coordenada.');
    files.push(FILA.parametriques);
  }
  if (dona !== 'continua') {
    g.files[FILA.continua] = K('Cr', texContinua('r', P, u));
    const zeros = u.map((c, i) => [c, VARS[i]]).filter(([c]) => c.esZero());
    g.afegeix(zeros.length
      ? `Equació contínua: aïlla $\\lambda$ de cada paramètrica i iguala. Però la component $${zeros[0][1]}$ del vector és $0$: a la paramètrica de $${zeros[0][1]}$ no hi ha $\\lambda$ i no pots dividir per $0$. Aquesta coordenada va a part: $${zeros[0][1]} = ${texC(P[VARS.indexOf(zeros[0][1])])}$ (és sempre la mateixa).`
      : 'Equació contínua: aïlla $\\lambda$ de cada equació paramètrica i iguala els tres resultats.');
    files.push(FILA.continua);
  }
  for (const f of files) g.classes[f] = 'final';
  g.afegeix('Resposta: aquestes són les equacions de la recta.');
}

/** El punt (marcant d'on surt) i el vector (marcant d'on surt). */
function passosPuntVector(g, P, u, filaDe, texMarcat, textPunt, textVector) {
  g.files[filaDe] = texMarcat('tria', '');
  g.files[FILA.puntVector] = K('Up', `P${texPunt(P)} \\in r`);
  g.afegeix(textPunt);
  g.files[filaDe] = texMarcat('', 'mes');
  g.files[FILA.puntVector] = texPuntVector(P, u);
  g.afegeix(textVector);
  g.files[filaDe] = texMarcat('', '');
}

/** Una contínua amb marques: el numerador (punt) i el denominador (vector) de cada fracció. */
function continuaMarcada(nom, P, u, mPunt, mVector) {
  const m = (t, k) => (k ? F.marca(t, k) : t);
  const fraccions = VARS.map((v, i) => `\\dfrac{${m(menys(v, P[i]), mPunt)}}{${m(M.texNombre(u[i]), mVector)}}`);
  return `${nom}:\\ ${fraccions.join(' = ')}`;
}

function passos(valors) {
  const p = perId(valors.p);
  const g = F.guio(NFILES);
  g.files[FILA.dades] = K('Dd', DADES[p.id](p));
  switch (p.id) {
    case 'dos-punts': {
      g.afegeix('Una recta queda determinada per un punt i un vector director. Amb dos punts, el punt ja el tens: per exemple, $A$.');
      const u = G.resta(p.B, p.A);
      g.files[FILA.puntVector] = K('Up', `A${texPunt(p.A)} \\in r`);
      g.afegeix('Pren $A$ com a punt de la recta.');
      g.files[FILA.puntVector] = K('Up', `A${texPunt(p.A)} \\in r`) + ',\\quad ' + K('Uu', `\\overrightarrow{AB} = ${texPunt(u)}`);
      g.afegeix(`El vector que va de $A$ a $B$ és un vector director. Resta les coordenades, les de $B$ menys les de $A$: $(${p.B.map((b, i) => `${M.texNombre(b)} - ${M.texEntreParentesis(p.A[i])}`).join(',\\ ')})$.`);
      passosEquacions(g, p.A, u);
      break;
    }
    case 'continua': {
      g.afegeix('És l\'equació contínua d\'una recta: $\\frac{x - a}{u_1} = \\frac{y - b}{u_2} = \\frac{z - c}{u_3}$. Als numeradors hi ha el punt $(a,\\ b,\\ c)$ i als denominadors, el vector director.');
      passosPuntVector(g, p.P, p.u, FILA.dades, (a, b) => K('Dd', continuaMarcada('r', p.P, p.u, a, b)),
        'El punt surt dels numeradors, amb el signe canviat: $x - 1$ dona $1$; $y + 3 = y - (-3)$ dona $-3$; i $z = z - 0$ dona $0$.',
        'El vector director surt dels denominadors.');
      passosEquacions(g, p.P, p.u, 'continua');
      break;
    }
    case 'amagada': {
      g.afegeix('Sembla diferent, però és una equació contínua: als denominadors hi ha $1$ (que no s\'escriu) i $-1$.');
      g.files[FILA.reescriu] = K('Wr', 'r:\\ \\dfrac{x - 1}{1} = \\dfrac{y}{1} = \\dfrac{z}{-1}');
      g.afegeix('Escriu cada membre com una fracció: $x - 1 = \\frac{x - 1}{1}$, $y = \\frac{y}{1}$ i $-z = \\frac{z}{-1}$.');
      passosPuntVector(g, p.P, p.u, FILA.reescriu, (a, b) => K('Wr', continuaMarcada('r', p.P, p.u, a, b)),
        'El punt, dels numeradors amb el signe canviat: $1$, $0$ i $0$.', 'El vector, dels denominadors.');
      passosEquacions(g, p.P, p.u);
      break;
    }
    case 'parametre': {
      g.afegeix('És una equació contínua amb un paràmetre $m$. Escriu cada membre com una fracció.');
      g.files[FILA.reescriu] = K('Wr', 'r:\\ \\dfrac{x}{1} = \\dfrac{y}{-1} = \\dfrac{z + m}{1}');
      g.afegeix('$x = \\frac{x}{1}$, $-y = \\frac{y}{-1}$ i $z + m = \\frac{z + m}{1}$.');
      passosPuntVector(g, p.P, p.u, FILA.reescriu, (a, b) => K('Wr', continuaMarcada('r', p.P, p.u, a, b)),
        'El punt, dels numeradors amb el signe canviat. Fixa\'t que $z + m = z - (-m)$: el punt depèn de $m$.', 'El vector, dels denominadors: no depèn de $m$.');
      passosEquacions(g, p.P, p.u);
      break;
    }
    case 'coeficient': {
      g.afegeix('Gairebé és una contínua, però la $x$ té un coeficient $2$: a la contínua, $x$, $y$ i $z$ han d\'anar soles al numerador.');
      g.files[FILA.reescriu] = K('Wr', 'r:\\ 2 \\cdot \\left(x - \\dfrac{1}{2}\\right) = \\dfrac{y + 2}{3} = z');
      g.afegeix('Treu el $2$ factor comú: $2x - 1 = 2 \\cdot \\left(x - \\frac{1}{2}\\right)$.');
      g.files[FILA.reescriu] = K('Wr', continuaMarcada('r', p.P, p.u, '', ''));
      g.afegeix('Multiplicar per $2$ és dividir per $\\frac{1}{2}$; i $z = \\frac{z}{1}$. Ara és una contínua.');
      passosPuntVector(g, p.P, p.u, FILA.reescriu, (a, b) => K('Wr', continuaMarcada('r', p.P, p.u, a, b)),
        'El punt, dels numeradors amb el signe canviat.', 'El vector, dels denominadors.');
      const v = G.escala(p.u, 2);
      g.files[FILA.vector2] = K('Xv', `\\vec{v} = 2\\vec{u} = ${texPunt(v)}`);
      g.afegeix('Qualsevol vector proporcional a $\\vec{u}$ també és un vector director. Multiplica per $2$ i les fraccions desapareixen.');
      passosEquacions(g, p.P, v);
      break;
    }
    case 'zero': {
      g.afegeix('Són les equacions paramètriques: cada coordenada és un nombre més un múltiple de $\\lambda$.');
      g.files[FILA.puntVector] = K('Up', `P${texPunt(p.P)} \\in r`);
      g.afegeix('El punt: els nombres sense $\\lambda$ (fes $\\lambda = 0$). La $y$ no té $\\lambda$: és sempre $4$.');
      g.files[FILA.puntVector] = texPuntVector(p.P, p.u);
      g.afegeix('El vector: els coeficients de $\\lambda$. La $y$ no en té: la seva component és $0$.');
      passosEquacions(g, p.P, p.u, 'parametriques');
      break;
    }
    case 'pla': {
      g.afegeix('És l\'equació vectorial d\'un pla: un punt, i dos vectors directors (amb dos paràmetres, $\\lambda$ i $\\mu$).');
      g.files[FILA.puntVector] = K('Up', `P${texPunt(p.P)} \\in \\pi`) + ',\\quad ' + K('Uu', `\\vec{u} = ${texPunt(p.u)}`) + ',\\quad ' + K('Uv', `\\vec{v} = ${texPunt(p.v)}`);
      g.afegeix('El punt és el que no va multiplicat per cap paràmetre; els vectors, els que multipliquen $\\lambda$ i $\\mu$.');
      const pla = G.passosPlaDeterminant(g, {P: p.P, v1: p.u, v2: p.v, files: FILA, nomP: 'P'});
      g.classes[FILA.pla] = 'final';
      g.afegeix(`Resposta: l'equació general del pla és $${G.texEsquerre(pla.n, pla.D)} = 0$.`);
      break;
    }
    default: throw new Error('problema desconegut');
  }
  return g.passos;
}

const ENUNCIATS = {
  'dos-punts': p => `Troba les equacions vectorial, paramètriques i contínua de la recta $r$ que passa pels punts $A${texPunt(p.A)}$ i $B${texPunt(p.B)}$.`,
  continua: p => `Troba un punt i un vector director de la recta $${texContinua('r', p.P, p.u)}$, i escriu-ne les equacions vectorial i paramètriques.`,
  amagada: () => 'Troba un punt i un vector director de la recta $r:\\ x - 1 = y = -z$, i escriu-ne les equacions vectorial, paramètriques i contínua.',
  parametre: () => 'Troba un punt i un vector director de la recta $r:\\ x = -y = z + m$, on $m$ és un paràmetre real, i escriu-ne les equacions vectorial, paramètriques i contínua.',
  coeficient: () => 'Troba un punt i un vector director de la recta $r:\\ 2x - 1 = \\dfrac{y + 2}{3} = z$, i escriu-ne les equacions vectorial, paramètriques i contínua.',
  zero: p => `Troba un punt i un vector director de la recta $${texParametriques('r', p.P, p.u)}$, i escriu-ne les equacions vectorial i contínua.`,
  pla: p => `Troba l'equació general del pla $\\pi:\\ (x,\\ y,\\ z) = ${texPunt(p.P)} + \\lambda${texPunt(p.u)} + \\mu${texPunt(p.v)}$.`,
};

arrel.EquacionsRecta = Object.freeze({
  titol: 'Equacions de la recta',
  categoria: 'geometria',
  files: NFILES,
  perDefecte: FIXOS.perDefecte,
  exemples: FIXOS.exemples,
  titolEditor: 'Tria un problema',
  titolExemples: 'Problemes:',
  notaEditor: 'Una recta queda determinada per un punt i un vector director: les seves equacions s\'escriuen totes a partir d\'aquests dos elements.',
  editor: [],
  problemes: PROBLEMES,
  FILA,
  valida: FIXOS.valida, llegeixAdreca: FIXOS.llegeixAdreca, escriuAdreca: FIXOS.escriuAdreca,
  enunciat: v => ENUNCIATS[v.p] ? ENUNCIATS[v.p](perId(v.p)) : '',
  resum: FIXOS.resum, nomExemple: FIXOS.nomExemple,
  passos,
});

})(globalThis);
