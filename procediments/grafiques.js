/* ═══════════════════════════════════════════════════════════════════
   grafiques.js — Gràfiques de funcions per a la pissarra (SVG)
   ───────────────────────────────────────────────────────────────────
   Mòdul pur: no toca la pàgina (DOM). Depèn de mates.js. Exporta
   «Grafiques»:
     esbos({f, trams, x, y, asimptotes, punts})   l'esbós d'una funció qualsevol
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

/**
 * L'esbós de la gràfica d'una funció qualsevol (la pàgina «Gràfica d'una funció»). Un dibuix, no una prova.
 *   f:          la funció (nombres → nombre; NaN o ±Infinity fora del domini)
 *   trams:      els trossos del domini, [{a, b}] (nombres; −Infinity/Infinity per als extrems oberts a l'infinit):
 *               la corba es dibuixa a cada tros per separat (no travessa una asímptota vertical)
 *   x, y:       la finestra, [mínim, màxim]
 *   asimptotes: [{v: x}] verticals, [{h: y}] horitzontals, [{m, n}] obliqües y = mx + n (discontínues)
 *   punts:      [{x, y}] els punts de la taula (rodonets)
 *   corba:      fals → només els eixos, les asímptotes i els punts
 *   marquesX:   opcional, [{x, text}] les marques de l'eix x (si no, els enters, cada 1, 2 o 5 unitats)
 */
function esbos({f, trams, x: [xmin, xmax], y: [ymin, ymax], asimptotes = [], punts = [], corba = true, marquesX = null}) {
  const W = 420, H = 300, M = 16;
  const X = x => arrodoneix(M + (x - xmin) / (xmax - xmin) * (W - 2 * M));
  const Y = y => arrodoneix(M + (ymax - y) / (ymax - ymin) * (H - 2 * M));
  const marge = (ymax - ymin) * 2;                    // fora de la finestra la corba es retalla, però no gaire lluny
  let svg = `<defs><clipPath id="finestra-esbos"><rect x="${M}" y="${M}" width="${W - 2 * M}" height="${H - 2 * M}"/></clipPath></defs>`;
  // Els eixos, amb les marques.
  const y0 = Y(Math.min(Math.max(0, ymin), ymax)), x0 = X(Math.min(Math.max(0, xmin), xmax));
  svg += `<line class="eix" x1="${M / 2}" y1="${y0}" x2="${W - M / 2}" y2="${y0}"/><line class="eix" x1="${x0}" y1="${M / 2}" x2="${x0}" y2="${H - M / 2}"/>`;
  const pas = rang => [1, 2, 5, 10, 20, 50, 100].find(p => rang / p <= 10) || 200;
  const mx = marquesX || (() => {
    const p = pas(xmax - xmin), l = [];
    for (let k = Math.ceil(xmin / p) * p; k <= xmax; k += p) if (k) l.push({x: k, text: etiqueta(k)});
    return l;
  })();
  for (const {x, text} of mx) {
    svg += `<line class="eix" x1="${X(x)}" y1="${y0 - 3}" x2="${X(x)}" y2="${y0 + 3}"/>`
      + `<text class="petit" x="${X(x)}" y="${Math.min(y0 + 15, H - 3)}" text-anchor="middle">${text}</text>`;
  }
  const py = pas(ymax - ymin);
  for (let k = Math.ceil(ymin / py) * py; k <= ymax; k += py) {
    if (!k) continue;
    svg += `<line class="eix" x1="${x0 - 3}" y1="${Y(k)}" x2="${x0 + 3}" y2="${Y(k)}"/>`
      + `<text class="petit" x="${x0 - 6}" y="${Y(k) + 4}" text-anchor="end">${etiqueta(k)}</text>`;
  }
  // Les asímptotes.
  let rectes = '';
  for (const a of asimptotes) {
    if (a.v !== undefined) rectes += `<line class="asimptota" x1="${X(a.v)}" y1="${M}" x2="${X(a.v)}" y2="${H - M}"/>`;
    else if (a.h !== undefined) rectes += `<line class="asimptota" x1="${M}" y1="${Y(a.h)}" x2="${W - M}" y2="${Y(a.h)}"/>`;
    else rectes += `<line class="asimptota" x1="${X(xmin)}" y1="${Y(a.m * xmin + a.n)}" x2="${X(xmax)}" y2="${Y(a.m * xmax + a.n)}"/>`;
  }
  // La corba, tros a tros; un salt (fora del domini o un valor enorme) talla el camí.
  let cami = '';
  if (corba) {
    for (const t of trams) {
      const a = Math.max(t.a, xmin), b = Math.min(t.b, xmax);
      if (!(a < b)) continue;
      const n = 600, e = (b - a) * 1e-9;
      let obert = false;
      for (let i = 0; i <= n; i++) {
        let x = a + (b - a) * i / n;
        if (i === 0 && t.a === a && !t.tancatA) x += e;
        if (i === n && t.b === b && !t.tancatB) x -= e;
        const y = f(x);
        if (!Number.isFinite(y)) { obert = false; continue; }
        const yc = Math.max(ymin - marge, Math.min(ymax + marge, y));
        cami += `${obert ? 'L' : 'M'}${X(x)} ${Y(yc)}`;
        obert = yc === y;
      }
    }
  }
  svg += `<g clip-path="url(#finestra-esbos)">${rectes}${cami ? `<path class="corba" d="${cami}"/>` : ''}</g>`;
  for (const p of punts) if (p.x >= xmin && p.x <= xmax && p.y >= ymin && p.y <= ymax) svg += `<circle class="punt-esbos" cx="${X(p.x)}" cy="${Y(p.y)}" r="3.6"/>`;
  return `<svg class="esbos" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img">${svg}</svg>`;
}

arrel.Grafiques = Object.freeze({grafica, finestra, esbos});

})(globalThis);
