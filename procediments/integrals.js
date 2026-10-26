/* ═══════════════════════════════════════════════════════════════════
   integrals.js — El que comparteixen les pàgines de càlcul integral
   (àrees i paràmetres). Global: Integrals. Carrega després de mates.js,
   formules.js i matrius.js.
   ───────────────────────────────────────────────────────────────────
   Les convencions del David (octubre 2026) que van néixer en aquestes
   pàgines ara valen per a tot el web, i són a les biblioteques comunes:
     · mentre es resol una equació, l'equació es continua veient: els
       càlculs van a una «fila de treball» (Formules.resolEquacio);
     · un producte s'escriu amb punt: x · (x² − 4) = 0, (x − 1) · (…) = 0;
     · quan es treu factor comú x, «x = 0» s'escriu a la pissarra;
     · en lila (marca «solucio») només les solucions, mai el factor x.
   Aquest fitxer només en conserva els noms d'abans:

     resol(g, {fila, treball, P, termes, text, X, davant})
         = Formules.resolEquacio (sense el pas lila: el fa qui la crida).
     passosTalls(g, {p, X, files: {equacio, lliures}, inici, nom})
         = Matrius.passosArrels: «p = 0», grau ≤ 3, amb factor comú o
         Ruffini; les files de «lliures» s'agafen per ordre a mesura que
         calen; amb «nom» («f(x)»), primer «f(x) = 0» tal com es planteja.
         Torna les solucions diferents, en ordre.
     marcaSolucio(g, fila, clau) = Formules.marcaSolucio.
   ═══════════════════════════════════════════════════════════════════ */
(function (arrel) {
'use strict';

const F = arrel.Formules;
const Mt = arrel.Matrius;

const resol = (g, opcions) => F.resolEquacio(g, Object.assign({}, opcions, {lila: false}));
const passosTalls = (g, {p, X = 'x', files, inici, nom}) => Mt.passosArrels(g, {p, X, files, inici, nom});

arrel.Integrals = Object.freeze({resol, passosTalls, marcaSolucio: F.marcaSolucio});

})(globalThis);
