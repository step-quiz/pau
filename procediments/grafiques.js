/* ═══════════════════════════════════════════════════════════════════
   grafiques.js — Gràfiques de funcions per a la pissarra (SVG)
   ───────────────────────────────────────────────────────────────────
   Mòdul pur: no toca la pàgina (DOM). Depèn de mates.js. Exporta
   «Grafiques»:
     grafica({corbes, zones, marques, x})   un SVG (text) amb els eixos,
         les corbes (polinomis, llistes de termes {n, c}), les zones
         ombrejades entre dues corbes o entre una corba i l'eix, i els
         valors de x marcats a l'eix.
   El motor posa una fila que comença per «<svg» tal com és; l'estil és
   a estil.css (.eix, .corba, .corba2, .zona, .zona2, text.petit).
   És un dibuix: les zones i els talls són els que diu el procediment
   (les proves en comproven els valors, no el dibuix).
   ═══════════════════════════════════════════════════════════════════ */
(function (arrel) {
'use strict';

const M = arrel.Mates;

const AMPLE = 300, ALT = 170, MARGE = 14;
const nombre = x => { const f = M.Fraccio.de(x); return f.num / f.den; };
const valor = (termes, x) => termes.reduce((s, t) => s + nombre(t.c) * x ** t.n, 0);
const arrodoneix = x => Math.round(x * 10) / 10;
/** «−3/2»: un nombre per escriure a l'eix. */
const etiqueta = m => { const f = M.Fraccio.de(m); return (f.num < 0 ? '−' : '') + Math.abs(f.num) + (f.den > 1 ? '/' + f.den : ''); };

/**
 * La gràfica. «corbes»: [{termes, nom}] (una o dues); «zones»: [{l, r, dalt, baix, classe}] amb
 * dalt i baix índexs de corbes (baix = null: l'eix); «marques»: valors de x (Fraccio) per escriure
 * a l'eix; «x»: [xmin, xmax] (nombres) de la finestra.
 */
function grafica({corbes, zones = [], marques = [], x: [xmin, xmax]}) {
  const N = 160;
  const xs = Array.from({length: N + 1}, (_, i) => xmin + (xmax - xmin) * i / N);
  const ys = corbes.flatMap(c => xs.map(x => valor(c.termes, x))).concat([0]);
  let [ymin, ymax] = [Math.min(...ys), Math.max(...ys)];
  const marge = (ymax - ymin) * 0.08 || 1;
  [ymin, ymax] = [ymin - marge, ymax + marge];
  const X = x => arrodoneix(MARGE + (x - xmin) / (xmax - xmin) * (AMPLE - 2 * MARGE));
  const Y = y => arrodoneix(MARGE + (ymax - y) / (ymax - ymin) * (ALT - 2 * MARGE));
  const cami = punts => punts.map(([x, y], i) => `${i ? 'L' : 'M'}${X(x)} ${Y(y)}`).join('');
  let svg = '';
  // Les zones, sota de tot.
  for (const z of zones) {
    const [l, r] = [nombre(z.l), nombre(z.r)];
    const n = 60, pas = (r - l) / n;
    const dalt = Array.from({length: n + 1}, (_, i) => [l + i * pas, valor(corbes[z.dalt].termes, l + i * pas)]);
    const baix = Array.from({length: n + 1}, (_, i) => [r - i * pas, z.baix === null ? 0 : valor(corbes[z.baix].termes, r - i * pas)]);
    svg += `<path class="${z.classe || 'zona'}" d="${cami(dalt.concat(baix))}Z"/>`;
  }
  // Els eixos.
  const y0 = Y(Math.min(Math.max(0, ymin), ymax));
  svg += `<line class="eix" x1="${MARGE / 2}" y1="${y0}" x2="${AMPLE - MARGE / 2}" y2="${y0}"/>`;
  if (xmin < 0 && xmax > 0) svg += `<line class="eix" x1="${X(0)}" y1="${MARGE / 2}" x2="${X(0)}" y2="${ALT - MARGE / 2}"/>`;
  // Les corbes.
  corbes.forEach((c, k) => {
    svg += `<path class="${k ? 'corba2' : 'corba'}" d="${cami(xs.map(x => [x, valor(c.termes, x)]))}"/>`;
    // El nom, a prop de l'extrem dret de la corba (dins de la finestra).
    const ultim = xs.filter(x => valor(c.termes, x) >= ymin && valor(c.termes, x) <= ymax).pop();
    if (ultim !== undefined) svg += `<text class="${k ? 'nom2' : 'nom'}" x="${Math.min(X(ultim) + 3, AMPLE - 12)}" y="${Math.max(Y(valor(c.termes, ultim)) - 4, 12)}">${c.nom}</text>`;
  });
  // Els valors de x marcats.
  for (const m of marques) {
    const xm = X(nombre(m));
    svg += `<line class="eix" x1="${xm}" y1="${y0 - 3}" x2="${xm}" y2="${y0 + 3}"/><text class="petit" x="${xm - 4}" y="${Math.min(y0 + 14, ALT - 2)}">${etiqueta(m)}</text>`;
  }
  return `<svg viewBox="0 0 ${AMPLE} ${ALT}" xmlns="http://www.w3.org/2000/svg" role="img">${svg}</svg>`;
}

/** Una finestra [xmin, xmax] que conté els punts (Fraccio o nombres), amb un marge. */
function finestra(punts) {
  const xs = punts.map(nombre);
  const [a, b] = [Math.min(...xs), Math.max(...xs)];
  const marge = Math.max((b - a) * 0.15, 0.5);
  return [a - marge, b + marge];
}

arrel.Grafiques = Object.freeze({grafica, finestra});

})(globalThis);
