/* ═══════════════════════════════════════════════════════════════════
   grafiques.js — Gràfiques de funcions per a la pissarra (SVG)
   ───────────────────────────────────────────────────────────────────
   Mòdul pur: no toca la pàgina (DOM). Depèn de mates.js. Exporta
   «Grafiques»:
     esbos({f, trams, x, y, asimptotes, punts, …})   l'esbós d'una funció qualsevol (i el resum final:
         creixement en colors, franges de concavitat, punts amb rètol)
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
 *   asimptotes: [{v: x}] verticals, [{h: y}] horitzontals, [{m, n}] obliqües y = mx + n (discontínues);
 *               amb «text», el rètol de la recta (p. ex. «Equació: x = 1»)
 *   punts:      [{x, y}] els punts de la taula (rodonets)
 *   corba:      fals → només els eixos, les asímptotes i els punts
 *   marquesX:   opcional, [{x, text}] les marques de l'eix x (si no, els enters, cada 1, 2 o 5 unitats)
 * El resum final (David, 24/11/2026), opcional:
 *   creixement: [{a, b, positiu}] la corba és verda on creix (positiu) i vermella on decreix
 *   concavitat: [{a, b, positiu}] franges de fons: blaves amb ∪ (positiva), taronja amb ∩ (negativa)
 *   etiquetes:  [{x, y, text, lloc}] punts negres amb rètol; lloc: 'dalt' | 'baix' (preferència: si el rètol
 *               toparia amb la corba, un altre rètol o la vora, se'n tria una altra posició)
 */
function esbos({f, trams, x: [xmin, xmax], y: [ymin, ymax], asimptotes = [], punts = [], corba = true, marquesX = null,
  creixement = null, concavitat = null, etiquetes = []}) {
  const W = 420, H = 300, M = 16;
  const X = x => arrodoneix(M + (x - xmin) / (xmax - xmin) * (W - 2 * M));
  const Y = y => arrodoneix(M + (ymax - y) / (ymax - ymin) * (H - 2 * M));
  const marge = (ymax - ymin) * 2;                    // fora de la finestra la corba es retalla, però no gaire lluny
  const ocupat = [];                                  // caixes ja ocupades per textos [x1, y1, x2, y2] (rètols)
  let svg = `<defs><clipPath id="finestra-esbos"><rect x="${M}" y="${M}" width="${W - 2 * M}" height="${H - 2 * M}"/></clipPath></defs>`;
  // Les franges de la concavitat, al fons.
  for (const t of concavitat || []) {
    const a = Math.max(t.a, xmin), b = Math.min(t.b, xmax);
    if (!(a < b)) continue;
    svg += `<rect class="${t.positiu ? 'franja-cup' : 'franja-cap'}" x="${X(a)}" y="${M}" width="${arrodoneix(X(b) - X(a))}" height="${H - 2 * M}"/>`;
    if (X(b) - X(a) > 16) {
      let cx = arrodoneix((X(a) + X(b)) / 2);
      const x0_ = X(Math.min(Math.max(0, xmin), xmax));
      if (Math.abs(cx - x0_) < 30 && X(b) - x0_ > 40) cx = x0_ + 20;          // no a sobre de les marques de l'eix y
      else if (Math.abs(cx - x0_) < 30 && x0_ - X(a) > 40) cx = x0_ - 34;
      svg += `<text class="${t.positiu ? 'signe-cup' : 'signe-cap'}" x="${cx}" y="${M + 17}" text-anchor="middle">${t.positiu ? '∪' : '∩'}</text>`;
      ocupat.push([cx - 8, M, cx + 8, M + 20]);
    }
  }
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
    const ty = Math.min(y0 + 15, H - 3);
    svg += `<line class="eix" x1="${X(x)}" y1="${y0 - 3}" x2="${X(x)}" y2="${y0 + 3}"/>`
      + `<text class="petit" x="${X(x)}" y="${ty}" text-anchor="middle">${text}</text>`;
    ocupat.push([X(x) - 5 * text.length, ty - 12, X(x) + 5 * text.length, ty + 2]);
  }
  const py = pas(ymax - ymin);
  for (let k = Math.ceil(ymin / py) * py; k <= ymax; k += py) {
    if (!k) continue;
    svg += `<line class="eix" x1="${x0 - 3}" y1="${Y(k)}" x2="${x0 + 3}" y2="${Y(k)}"/>`
      + `<text class="petit" x="${x0 - 6}" y="${Y(k) + 4}" text-anchor="end">${etiqueta(k)}</text>`;
    ocupat.push([x0 - 6 - 9 * etiqueta(k).length, Y(k) - 8, x0 - 4, Y(k) + 6]);
  }
  // Les asímptotes (i el seu rètol, si en tenen).
  let rectes = '', retols = [];
  for (const a of asimptotes) {
    if (a.v !== undefined) {
      rectes += `<line class="asimptota" x1="${X(a.v)}" y1="${M}" x2="${X(a.v)}" y2="${H - M}"/>`;
      if (a.text) retols.push({opcions: [[X(a.v) + 5, H - M - 8, 'start'], [X(a.v) - 5, H - M - 8, 'end'], [X(a.v) + 5, M + 36, 'start'], [X(a.v) - 5, M + 36, 'end']], text: a.text});
    } else if (a.h !== undefined) {
      rectes += `<line class="asimptota" x1="${M}" y1="${Y(a.h)}" x2="${W - M}" y2="${Y(a.h)}"/>`;
      if (a.text) retols.push({opcions: [[W - M - 4, Y(a.h) - 7, 'end'], [W - M - 4, Y(a.h) + 18, 'end'], [M + 4, Y(a.h) - 7, 'start'], [M + 4, Y(a.h) + 18, 'start']], text: a.text});
    } else {
      rectes += `<line class="asimptota" x1="${X(xmin)}" y1="${Y(a.m * xmin + a.n)}" x2="${X(xmax)}" y2="${Y(a.m * xmax + a.n)}"/>`;
      if (a.text) {
        // Prop de la vora on la recta és dins de la finestra (la dreta si pot ser), per sota de la recta.
        const dins = xx => { const yy = a.m * xx + a.n; return yy > ymin + 0.08 * (ymax - ymin) && yy < ymax - 0.12 * (ymax - ymin); };
        const cand = [0.97, 0.9, 0.8, 0.7, 0.03, 0.1, 0.2, 0.3].map(t => xmin + t * (xmax - xmin)).find(dins);
        if (cand !== undefined) {
          const dreta = cand > (xmin + xmax) / 2;
          retols.push({opcions: [[X(cand), Y(a.m * cand + a.n) + (a.m > 0 === dreta ? 18 : -8), dreta ? 'end' : 'start']], text: a.text});
        }
      }
    }
  }
  // La corba, tros a tros; un salt (fora del domini o un valor enorme) talla el camí.
  // Amb «creixement», un camí per a cada color (la classe del tros, al punt mig de cada segment).
  const camins = {}, mostres = [];
  const classe = xx => {
    if (!creixement) return 'corba';
    const t = creixement.find(c => xx > c.a && xx < c.b);
    return t ? (t.positiu ? 'corba creix' : 'corba decreix') : 'corba';
  };
  if (corba) {
    for (const t of trams) {
      const a = Math.max(t.a, xmin), b = Math.min(t.b, xmax);
      if (!(a < b)) continue;
      const n = 600, e = (b - a) * 1e-9;
      let ant = null;                                   // [x, X, Y] del punt anterior, si el camí continua
      for (let i = 0; i <= n; i++) {
        let x = a + (b - a) * i / n;
        if (i === 0 && t.a === a && !t.tancatA) x += e;
        if (i === n && t.b === b && !t.tancatB) x -= e;
        const y = f(x);
        if (!Number.isFinite(y)) { ant = null; continue; }
        const yc = Math.max(ymin - marge, Math.min(ymax + marge, y));
        const P = [x, X(x), Y(yc)];
        if (y >= ymin && y <= ymax) mostres.push([P[1], P[2]]);
        if (ant) {
          const c = classe((ant[0] + x) / 2);
          if (!camins[c] || camins[c].fi !== `${ant[1]} ${ant[2]}`) camins[c] = {d: (camins[c] ? camins[c].d : '') + `M${ant[1]} ${ant[2]}`, fi: ''};
          camins[c].d += `L${P[1]} ${P[2]}`;
          camins[c].fi = `${P[1]} ${P[2]}`;
        }
        ant = yc === y ? P : null;                     // un punt retallat (molt lluny de la finestra) talla el camí
      }
    }
  }
  const trac = Object.entries(camins).map(([c, {d}]) => `<path class="${c}" d="${d}"/>`).join('');
  svg += `<g clip-path="url(#finestra-esbos)">${rectes}${trac}</g>`;
  for (const p of punts) if (p.x >= xmin && p.x <= xmax && p.y >= ymin && p.y <= ymax) svg += `<circle class="punt-esbos" cx="${X(p.x)}" cy="${Y(p.y)}" r="3.6"/>`;
  // Els rètols de les asímptotes.
  const caixa = (x, y, anc, text, alt = 15) => {
    const w = 7.4 * [...text].length, x1 = anc === 'end' ? x - w : anc === 'middle' ? x - w / 2 : x;
    return [x1, y - alt + 3, x1 + w, y + 4];
  };
  const xoca = (b, [p, q, r, s]) => b[0] < r && b[2] > p && b[1] < s && b[3] > q;
  const dinsCorba = b => mostres.filter(([mx_, my]) => mx_ > b[0] - 1 && mx_ < b[2] + 1 && my > b[1] - 1 && my < b[3] + 1).length;
  for (const r of retols) {
    let millor = null;
    r.opcions.forEach(([x, y, anc], i) => {
      const b = caixa(x, y, anc, r.text);
      const cost = i + (b[0] < 2 || b[2] > W - 2 ? 100 : 0) + 60 * ocupat.filter(o => xoca(b, o)).length + 5 * dinsCorba(b);
      if (!millor || cost < millor.cost) millor = {cost, x, y, anc, b};
    });
    svg += `<text class="retol-asimptota" x="${arrodoneix(millor.x)}" y="${arrodoneix(millor.y)}" text-anchor="${millor.anc}">${r.text}</text>`;
    ocupat.push(millor.b);
  }
  // Les asímptotes, com a obstacles per als rètols dels punts (menys que la corba).
  const rectesMostra = [];
  for (const a of asimptotes) for (let i = 0; i <= 80; i++) {
    const t = i / 80;
    if (a.v !== undefined) rectesMostra.push([X(a.v), M + t * (H - 2 * M)]);
    else if (a.h !== undefined) rectesMostra.push([M + t * (W - 2 * M), Y(a.h)]);
    else { const xx = xmin + t * (xmax - xmin); rectesMostra.push([X(xx), Y(a.m * xx + a.n)]); }
  }
  // Els punts del resum, negres, amb el rètol on no topi amb res.
  const visibles = etiquetes.filter(p => p.x >= xmin && p.x <= xmax && p.y >= ymin && p.y <= ymax);
  const rodones = visibles.map(p => [X(p.x) - 6, Y(p.y) - 6, X(p.x) + 6, Y(p.y) + 6]);
  for (const p of visibles) {
    const px = X(p.x), py = Y(p.y);
    const opcions = [['dalt', px, py - 11, 'middle'], ['baix', px, py + 21, 'middle'], ['dreta', px + 9, py - 7, 'start'], ['esquerra', px - 9, py - 7, 'end'],
      ['dreta-baix', px + 9, py + 17, 'start'], ['esquerra-baix', px - 9, py + 17, 'end']];
    let millor = null;
    for (const [nom, x, y, anc] of opcions) {
      const b = caixa(x, y, anc, p.text);
      let cost = (nom === p.lloc ? 0 : nom.startsWith(p.lloc || 'dalt') ? 1 : 2);
      if (b[0] < 2 || b[2] > W - 2 || b[1] < 2 || b[3] > H - 2) cost += 100;
      cost += 30 * dinsCorba(b) + 8 * rectesMostra.filter(([mx_, my]) => mx_ > b[0] && mx_ < b[2] && my > b[1] && my < b[3]).length;
      cost += 60 * ocupat.filter(o => xoca(b, o)).length + 60 * rodones.filter(o => xoca(b, o)).length;
      if (!millor || cost < millor.cost) millor = {cost, x, y, anc, b};
    }
    svg += `<text class="retol-punt" x="${arrodoneix(millor.x)}" y="${arrodoneix(millor.y)}" text-anchor="${millor.anc}">${p.text}</text>`;
    ocupat.push(millor.b);
  }
  for (const p of visibles) svg += `<circle class="punt-final" cx="${X(p.x)}" cy="${Y(p.y)}" r="4.6"/>`;
  return `<svg class="esbos" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img">${svg}</svg>`;
}

arrel.Grafiques = Object.freeze({grafica, finestra, esbos});

})(globalThis);
