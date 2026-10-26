/* ═══════════════════════════════════════════════════════════════════
   motor.js — Motor dels procediments animats
   ───────────────────────────────────────────────────────────────────
   Construeix la pàgina d'un procediment i la fa funcionar:
     1. llegeix les dades de l'adreça (?f=2x^2-3x+1&x0=2);
     2. demana els passos al procediment: procediment.passos(valors);
     3. dibuixa cada pas a la pissarra, amb KaTeX;
     4. anima el canvi d'un pas al següent (claus, fusions, cursor);
     5. ofereix el reproductor i l'editor de dades amb fletxes.

   Depèn de KaTeX (variable global «katex»). Exporta «Motor»:
     Motor.inicia(procediment[, contenidor]) → controlador
   El format d'un procediment, d'un pas i de les claus és a README.md.
   Les durades són a TEMPS; els colors i les mides, a estil.css.
   ═══════════════════════════════════════════════════════════════════ */
(function (arrel) {
'use strict';

/* ── 1. CONFIGURACIÓ ───────────────────────────────────────────────── */

/** KaTeX a la pissarra: l'única ordre «de confiança» és \htmlData (les claus). */
const OPCIONS_PISSARRA = Object.freeze({
  throwOnError: false,
  strict: 'ignore',                     // \htmlData és una extensió de KaTeX
  trust: context => context.command === '\\htmlData',
});
/** KaTeX als textos i a l'editor: cap ordre «de confiança». */
const OPCIONS_TEXT = Object.freeze({throwOnError: false});

/** Durades en mil·lisegons, a velocitat normal. */
const TEMPS = Object.freeze({
  pas: 1200,           // moviment d'un pas
  pasAmbAvis: 1500,    // moviment d'un pas que abans assenyala què canvia
  avis: 300,           // aparició dels requadres d'avís
  lectura: 650,        // pausa amb els requadres a la vista
  cursor: 540,         // el cursor va fins a un símbol
  clic: 120,           // durada d'un clic
  aparta: 230,         // el cursor s'aparta del símbol
  agafa: 180,          // el cursor agafa un símbol abans d'arrossegar-lo
  esperaInici: 500,    // abans del primer pas, en reproduir
  llegir: 900,         // pausa entre passos en reproduir…
  perParaula: 120,     // …més aquest temps per paraula del text
  rellegeix: 350,      // espera, després d'una fletxa, abans de refer els passos
  repeteix: 420,       // fletxa premuda: espera abans de repetir…
  repeticio: 110,      // …i interval entre repeticions
});
/** Corba de moviment (acceleració i frenada suaus). */
const CORBA = 'cubic-bezier(.45,.05,.25,1)';
/** Mida de la lletra de la pissarra (px). Es redueix si la línia més llarga no hi cap. */
const MIDA = Object.freeze({gran: 30, petita: 22, minima: 12, pantallaPetita: '(max-width: 520px)',
  minimaAlcada: 18});   // a pantalla gran, la lletra es redueix fins a 18 px perquè el pas més alt i els controls hi càpiguen

/** Categories del web (index.html): clau → nom. */
const CATEGORIES = Object.freeze({
  algebra: 'Àlgebra', geometria: 'Geometria', analisi: 'Anàlisi', probabilitat: 'Probabilitat',
});
/** Peu de pàgina, igual que el del web. */
const PEU = '© 2026 <strong>David Arso Civil</strong>. Ús educatiu lliure. Prohibida la comercialització '
  + 'i la modificació (<a rel="license" href="https://creativecommons.org/licenses/by-nc-nd/4.0/">CC BY-NC-ND 4.0</a>).';

const MENYS = '−';


/* ── 2. UTILITATS ──────────────────────────────────────────────────── */

/** Crea un element: element('p', {class: 'x', text: 'Hola'}, [fills]). */
function element(etiqueta, atributs = {}, fills = []) {
  const e = document.createElement(etiqueta);
  for (const [k, v] of Object.entries(atributs)) {
    if (v === undefined || v === null) continue;
    if (k === 'class') e.className = v;
    else if (k === 'text') e.textContent = v;
    else if (k === 'html') e.innerHTML = v;
    else e.setAttribute(k, v);
  }
  e.append(...[].concat(fills).filter(Boolean));
  return e;
}

const espera = ms => new Promise(resol => setTimeout(resol, ms));
const escapa = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Fórmula TeX en línia. */
const formula = tex => katex.renderToString(tex, OPCIONS_TEXT);

/** «Text amb $fórmules$» → HTML. */
function textAmbFormules(text) {
  return text.split(/(\$[^$]+\$)/).map(tros =>
    (tros.length > 2 && tros.startsWith('$') && tros.endsWith('$')) ? formula(tros.slice(1, -1)) : escapa(tros)
  ).join('');
}

/**
 * Fila de text de la pissarra (vegeu Formules.filaText): text amb $fórmules$
 * i frases {{clau|marca|text}}, que es poden seguir d'un pas a l'altre com
 * els símbols (data-k) i es poden marcar (classe «marca-…»).
 */
function textAmbFrases(text) {
  return text.split(/(\{\{[^}]*\}\})/).map(tros => {
    const m = /^\{\{([^|]*)\|([^|]*)\|(.*)\}\}$/.exec(tros);
    if (!m) return textAmbFormules(tros);
    const [, k, marca, contingut] = m;
    return `<span${k ? ` data-k="${escapa(k)}"` : ''} class="frase${marca ? ' marca-' + escapa(marca) : ''}">${textAmbFormules(contingut)}</span>`;
  }).join('');
}
const esFilaText = tex => tex.startsWith('§');
/** Una fila que és un esquema (SVG fet pel procediment, no per l'usuari): es mostra tal qual. */
const esFilaFigura = tex => tex.startsWith('<svg');

/** Anima un element i espera que acabi. L'estat final es manté. */
function anima(el, fotogrames, opcions) {
  return el.animate(fotogrames, Object.assign({fill: 'forwards', easing: CORBA}, opcions)).finished;
}

/** Atura les animacions d'un element, que torna als seus estils. */
const aturaAnimacions = el => el.getAnimations().forEach(a => a.cancel());

/** Rectangle d'un element respecte d'un altre: {x, y, w, h, cx, cy}. */
function rectangle(el, origen) {
  const o = origen.getBoundingClientRect(), r = el.getBoundingClientRect();
  const x = r.left - o.left, y = r.top - o.top;
  return {x, y, w: r.width, h: r.height, cx: x + r.width / 2, cy: y + r.height / 2};
}

/** Rectangle que conté uns quants rectangles. */
function unio(rs) {
  const x = Math.min(...rs.map(q => q.x)), y = Math.min(...rs.map(q => q.y));
  const w = Math.max(...rs.map(q => q.x + q.w)) - x, h = Math.max(...rs.map(q => q.y + q.h)) - y;
  return {x, y, w, h, cx: x + w / 2, cy: y + h / 2};
}

/**
 * Contingut d'un símbol, sense l'espai que KaTeX hi afegeix a dins quan
 * va seguit d'un operador: serveix per saber si el símbol canvia.
 */
const signatura = el => el.className + '|' + el.innerHTML.replace(/<span class="mspace"[^>]*><\/span>/g, '');
const midaLletra = el => parseFloat(getComputedStyle(el).fontSize);


/* ── 3. ADREÇA ─────────────────────────────────────────────────────── */

/**
 * Paràmetres de l'adreça, com a text. A diferència d'URLSearchParams,
 * el «+» es llegeix com a «+» (no com a espai): així «?f=2x^2-3x+1»
 * funciona tal com s'escriu.
 */
function llegeixAdreca() {
  const parametres = {};
  for (const parell of location.search.replace(/^\?/, '').split('&')) {
    if (!parell) continue;
    const i = parell.indexOf('=');
    try {
      const nom = decodeURIComponent(i < 0 ? parell : parell.slice(0, i));
      parametres[nom] = i < 0 ? '' : decodeURIComponent(parell.slice(i + 1));
    } catch (e) { /* codificació incorrecta: s'ignora el paràmetre */ }
  }
  return parametres;
}

/** Posa els paràmetres a l'adreça, sense afegir cap entrada a l'historial. */
function escriuAdreca(parametres) {
  const text = Object.entries(parametres)
    .map(([k, v]) => encodeURIComponent(k) + '=' + encodeURIComponent(v).replace(/%2B/gi, '+').replace(/%5E/gi, '^').replace(/%2F/gi, '/').replace(/%2C/gi, ',').replace(/%3B/gi, ';'))   // «p=0,25» o «A=m,1;1,m» tal com s'escriuen
    .join('&');
  try {
    history.replaceState(null, '', location.pathname + (text ? '?' + text : '') + location.hash);
  } catch (e) { /* alguns visors no deixen canviar l'adreça */ }
}


/* ── 4. ESTRUCTURA DE LA PÀGINA ────────────────────────────────────── */

const ICONES = Object.freeze({
  reinicia: 'M12 5V2L7 6l5 4V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7z',
  anterior: 'M15.5 5 8.5 12l7 7z',
  reprodueix: 'M8 5v14l11-7z',
  atura: 'M7 5h4v14H7zM13 5h4v14h-4z',
  seguent: 'M8.5 5l7 7-7 7z',
});
const icona = d => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}"/></svg>`;
const CURSOR = '<svg viewBox="0 0 22 30" aria-hidden="true"><path d="M2 2 L2 24 L7.6 18.8 L11.4 27.4 L15 25.8 L11.3 17.4 L18.6 17.4 Z" '
  + 'fill="#fff" stroke="#111" stroke-width="1.6" stroke-linejoin="round"/></svg>';

/** Construeix la pàgina dins del contenidor i en torna les peces. */
function construeixPagina(proc, contenidor) {
  const boto = (classe, nom, d) => element('button', {class: 'boto ' + classe, type: 'button', title: nom, 'aria-label': nom, html: icona(d)});
  const r = {
    avis: element('p', {class: 'avis', role: 'status', hidden: ''}),
    enunciat: element('p', {class: 'enunciat'}),
    pissarra: element('div', {class: 'pissarra'}),
    efectes: element('div', {class: 'efectes', 'aria-hidden': 'true'}),
    cursor: element('div', {class: 'cursor', 'aria-hidden': 'true', html: CURSOR}),
    reinicia: boto('', 'Torna a començar', ICONES.reinicia),
    anterior: boto('', 'Pas anterior', ICONES.anterior),
    reprodueix: boto('principal', 'Reprodueix', ICONES.reprodueix),
    seguent: boto('', 'Pas següent', ICONES.seguent),
    punts: element('div', {class: 'punts', role: 'group', 'aria-label': 'Passos'}),
    velocitat: element('select', {id: 'velocitat'}),
    numPas: element('span', {class: 'num-pas'}),
    textPas: element('span', {class: 'text-pas'}),
    controls: element('div', {class: 'controls'}),
    editor: element('div', {class: 'editor'}),
    resum: element('p', {class: 'resum'}),
    errorEditor: element('p', {class: 'error-editor', role: 'status', hidden: ''}),
    exemples: element('div', {class: 'exemples'}, [element('span', {text: proc.titolExemples || (proc.editor.length ? 'Exemples:' : 'Problemes:')})]),
  };
  for (const [valor, nom] of [['0.6', 'lenta'], ['1', 'normal'], ['1.6', 'ràpida']]) {
    r.velocitat.append(element('option', {value: valor, text: nom, selected: valor === '1' ? '' : null}));
  }
  r.escenari = element('div', {class: 'escenari'}, [r.pissarra, r.efectes, r.cursor]);
  // El reproductor i l'explicació, junts: si la pissarra és més alta que la finestra, es queden enganxats a baix.
  r.explicacio = element('p', {class: 'explicacio', 'aria-live': 'polite'}, [r.numPas, r.textPas]);
  r.controls.append(
    element('div', {class: 'reproductor'}, [
      element('div', {class: 'botons'}, [r.reinicia, r.anterior, r.reprodueix, r.seguent]),
      r.punts,
      element('label', {class: 'velocitat', for: 'velocitat', text: 'Velocitat '}, [r.velocitat]),
    ]),
    r.explicacio);
  r.marcaControls = element('div', {class: 'marca-controls', 'aria-hidden': 'true'});   // si no es veu, els controls estan enganxats
  if (typeof IntersectionObserver === 'function') {
    new IntersectionObserver(([e]) => r.controls.classList.toggle('enganxat', !e.isIntersecting && e.boundingClientRect.top > 0))
      .observe(r.marcaControls);
  }

  const cami = ['PAU Matemàtiques', 'Procediments pas a pas', CATEGORIES[proc.categoria]].filter(Boolean).join(' · ');
  contenidor.replaceChildren(
    element('header', {class: 'capcalera'}, [
      element('div', {}, [element('h1', {text: proc.titol}), element('p', {class: 'cami', text: cami})]),
      element('a', {class: 'torna', href: '../index.html', text: '← Repàs PAU'}),
    ]),
    element('main', {class: 'contingut'}, [
      r.avis,
      r.enunciat,
      r.escenari,
      r.controls,
      r.marcaControls,
      element('section', {class: 'targeta', 'aria-labelledby': 'titol-editor'}, [
        element('h2', {id: 'titol-editor', text: proc.titolEditor || 'Canvia les dades'}),
        r.editor, r.resum, r.errorEditor, r.exemples,
        element('p', {class: 'nota', text: proc.editor.length
          ? 'Toca ↑ o ↓ sota cada nombre, o mantén la fletxa premuda. ' + (proc.notaEditor ? proc.notaEditor + ' ' : '') + 'L\'animació es torna a generar sola.'
          : proc.notaEditor || ''}),
      ]),
    ]),
    element('footer', {class: 'peu', html: PEU}),
  );
  return r;
}


/* ── 5. CURSOR ─────────────────────────────────────────────────────── */

/** El cursor que clica i arrossega els símbols. Les posicions són les de la punta. */
function creaCursor(escenari, el, temps) {
  let x = null, y = null;                 // null: amagat
  const transforma = (escala = 1) => `translate(${x}px, ${y}px) scale(${escala})`;

  /** Apareix per sota de la cantonada inferior dreta de l'escenari. */
  function apareix() {
    x = escenari.clientWidth - 30;
    y = escenari.clientHeight + 10;
    el.style.transform = transforma();
    el.classList.add('visible');
  }

  return {
    /** Va fins a (nx, ny), amb el botó premut si escala < 1. */
    async va(nx, ny, ms = temps(TEMPS.cursor), escala = 1) {
      if (x === null) apareix();
      const sortida = transforma(escala);
      x = nx;
      y = ny;
      await anima(el, [{transform: sortida}, {transform: transforma(escala)}], {duration: ms});
      el.style.transform = transforma(escala);
      aturaAnimacions(el);
    },
    /** Prem el botó, o el deixa anar. */
    prem(premut) {
      const [de, a] = premut ? [1, 0.86] : [0.86, 1];
      el.animate([{transform: transforma(de)}, {transform: transforma(a)}], {duration: temps(TEMPS.clic), fill: 'forwards'});
    },
    /** Ona d'un clic al punt (px, py). */
    ona(px, py) {
      const o = element('div', {class: 'ona'});
      o.style.left = px + 'px';
      o.style.top = py + 'px';
      escenari.append(o);
      o.animate([{transform: 'scale(.3)', opacity: 0.9}, {transform: 'scale(1.5)', opacity: 0}],
        {duration: temps(420), easing: 'ease-out'}).finished.then(() => o.remove());
    },
    amaga() {
      x = y = null;
      el.classList.remove('visible');
      aturaAnimacions(el);
    },
  };
}


/* ── 6. PISSARRA I TRANSICIONS ─────────────────────────────────────── */

/**
 * La pissarra: dibuixa un pas i anima el canvi al pas següent.
 *
 * Què passa amb cada símbol amb clau (vegeu README.md):
 *   · mateixa clau abans i després, o pas.reanomena = {nova: vella}:
 *     és el mateix símbol i es desplaça; si el contingut canvia, es fon;
 *   · pas.fusiona = {nova: [velles]}: les velles van a parar a la nova;
 *   · la resta de símbols vells s'esvaeixen, i els nous apareixen.
 * Si el pas no arrossega cap símbol, abans de moure res uns requadres
 * assenyalen què canviarà o desapareixerà, i després el segueixen.
 * Totes les posicions es mesuren respecte de la capa d'efectes.
 */
function creaPissarra(r, nFiles, cursor, temps) {
  let capa = null;                        // capa visible: les files del pas actual
  let usades = null;                      // les files que fa servir algun pas del guió (les altres no ocupen lloc)
  let renders = new Map();                // TeX → HTML de KaTeX: cada fila es renderitza un sol cop per guió
  const renderitza = tex => {
    if (!renders.has(tex)) renders.set(tex, katex.renderToString(tex, OPCIONS_PISSARRA));
    return renders.get(tex);
  };

  function dibuixaCapa(pas) {
    const c = element('div', {class: 'capa'});
    for (let i = 0; i < nFiles; i++) {
      const tex = pas.files[i];
      const figura = tex && esFilaFigura(tex);
      const fila = element('div', {class: 'fila' + (tex && esFilaText(tex) ? ' text' : '') + (figura ? ' figura' : '') + (pas.classes[i] ? ' ' + pas.classes[i] : '')});
      if (usades && !usades.has(i)) fila.hidden = true;
      if (tex) fila.innerHTML = figura ? tex : esFilaText(tex) ? textAmbFrases(tex.slice(1)) : renderitza(tex);
      c.append(fila);
    }
    return c;
  }

  function mostra(pas) {
    r.efectes.replaceChildren();
    capa = dibuixaCapa(pas);
    r.pissarra.replaceChildren(capa);
  }

  /**
   * Tria la mida de la lletra, i quines files fa servir el guió:
   *  1. amplada: la línia més llarga de tots els passos hi ha de cabre;
   *  2. alçada (només a pantalla gran): el pas més alt de la pissarra, el
   *     reproductor i l'explicació han de cabre a la finestra, a sota de la
   *     capçalera i de l'enunciat; la lletra no baixa de MIDA.minimaAlcada.
   *     Si tot i així no hi cap, el reproductor queda enganxat a baix (estil.css).
   */
  function ajusta(passos) {
    renders = new Map();
    usades = new Set();
    for (const pas of passos) pas.files.forEach((tex, i) => { if (tex) usades.add(i); });
    const petita = matchMedia(MIDA.pantallaPetita).matches;
    const base = petita ? MIDA.petita : MIDA.gran;
    const posaMida = px => r.pissarra.style.setProperty('--mida', px + 'px');
    posaMida(base);
    const prova = element('div', {class: 'fila prova'});
    r.pissarra.append(prova);
    let maxim = 0;
    for (const pas of passos) {
      for (const tex of pas.files) {
        if (!tex || esFilaText(tex) || esFilaFigura(tex)) continue;          // el text i els esquemes s'ajusten sols a l'amplada
        prova.innerHTML = renderitza(tex);
        maxim = Math.max(maxim, prova.firstElementChild.getBoundingClientRect().width);
      }
    }
    prova.remove();
    const estil = getComputedStyle(r.pissarra);
    const disponible = r.pissarra.clientWidth - parseFloat(estil.paddingLeft) - parseFloat(estil.paddingRight) - 12;
    const factor = maxim > 0 ? Math.min(1, disponible / maxim) : 1;
    let mida = Math.max(MIDA.minima, Math.floor(base * factor));
    posaMida(mida);
    if (petita || mida <= MIDA.minimaAlcada) return;

    // L'alçada. Les files de fórmules creixen amb la lletra, però les de text no: es repeteix el càlcul unes quantes vegades.
    const alcadaMaxima = () => {
      const mesura = element('div', {class: 'capa mesura'});
      r.pissarra.append(mesura);
      let h = 0;
      for (const pas of passos) {
        mesura.replaceChildren(...dibuixaCapa(pas).children);
        h = Math.max(h, mesura.getBoundingClientRect().height);
      }
      mesura.remove();
      return h + r.pissarra.offsetHeight - r.pissarra.clientHeight;     // + les vores
    };
    const dalt = r.escenari.getBoundingClientRect().top + scrollY;
    // A sota: el gap, els controls (que poden estar enganxats: només se'n mira l'alçada) i marge perquè l'explicació tingui unes tres línies.
    const gap = parseFloat(getComputedStyle(r.controls.parentNode).rowGap) || 0;
    const sota = gap + r.controls.offsetHeight + Math.max(0, 72 - r.explicacio.offsetHeight) + 8;
    const lloc = innerHeight - dalt - sota;
    for (let i = 0; i < 4; i++) {
      const alt = alcadaMaxima();
      if (alt <= lloc) break;
      const nova = Math.max(MIDA.minimaAlcada, Math.floor(mida * lloc / alt));
      if (nova >= mida) break;
      mida = nova;
      posaMida(mida);
    }
  }

  /* Símbols amb clau d'una capa, i les seves posicions. */
  const ambClau = c => new Map([...c.querySelectorAll('[data-k]')].map(e => [e.dataset.k, e]));
  const posicions = m => new Map([...m].map(([k, e]) => [k, rectangle(e, r.efectes)]));

  /**
   * Trossos d'un símbol, un per línia: una frase d'una fila de text pot
   * ocupar més d'una línia. Un símbol partit no es pot moure com un
   * fantasma d'una sola línia: es queda a la seva capa i s'hi fon, i els
   * requadres i el cursor van als seus trossos.
   */
  function trossos(el) {
    const o = r.efectes.getBoundingClientRect();
    return [...el.getClientRects()].filter(q => q.width > 0.5 && q.height > 0.5).map(q => {
      const x = q.left - o.left, y = q.top - o.top;
      return {x, y, w: q.width, h: q.height, cx: x + q.width / 2, cy: y + q.height / 2};
    });
  }

  /** Còpia d'un símbol, posada exactament damunt del rectangle «q». */
  function fantasma(el, q) {
    const estil = getComputedStyle(el);
    const f = element('div', {class: 'katex fantasma', 'data-de': el.dataset.k});
    f.style.fontSize = estil.fontSize;
    f.style.color = estil.color;
    f.style.fontFamily = estil.fontFamily;            // una frase de text no ha de canviar de lletra
    f.style.fontStyle = estil.fontStyle;
    const copia = el.cloneNode(true);
    copia.removeAttribute('data-k');
    copia.querySelectorAll('[data-k]').forEach(n => n.removeAttribute('data-k'));
    f.append(copia);
    r.efectes.append(f);
    const o = rectangle(copia, r.efectes);
    f.style.left = (q.x - o.x) + 'px';
    f.style.top = (q.y - o.y) + 'px';
    f.style.transformOrigin = `${o.x + o.w / 2}px ${o.y + o.h / 2}px`;
    return {el: f, mida: parseFloat(estil.fontSize), color: estil.color};
  }

  /** Requadre blau clar que envolta un rectangle, i apareix en «durada» ms. */
  const VORA = 4;
  const caixa = q => ({left: (q.x - VORA) + 'px', top: (q.y - VORA) + 'px', width: (q.w + 2 * VORA) + 'px', height: (q.h + 2 * VORA) + 'px'});
  function requadre(q, durada) {
    const e = element('div', {class: 'requadre'});
    Object.assign(e.style, caixa(q));
    r.efectes.append(e);
    e.animate([{opacity: 0}, {opacity: 1}], {duration: durada, fill: 'forwards'});
    return e;
  }

  const QUIET = 'translate(0px, 0px) scale(1)';
  const trasllat = (a, b, escala) => `translate(${b.cx - a.cx}px, ${b.cy - a.cy}px) scale(${escala})`;

  async function transicio(pas) {
    const vella = capa;
    const nova = dibuixaCapa(pas);
    nova.classList.add('nova');
    r.pissarra.append(nova);

    const A = ambClau(vella), B = ambClau(nova);
    const RA = posicions(A), RB = posicions(B);
    const reanomena = new Map(Object.entries(pas.reanomena || {}));
    const fusiona = new Map(Object.entries(pas.fusiona || {}));

    /* Parelles: cada símbol nou amb el símbol vell que és el mateix. */
    const parelles = new Map();           // clau nova → clau vella
    const usades = new Set();
    for (const kb of B.keys()) {
      const ka = reanomena.get(kb) || kb;
      if (A.has(ka) && !usades.has(ka)) {
        parelles.set(kb, ka);
        usades.add(ka);
      }
    }
    const desti = new Map();              // clau vella → clau nova on es fusiona
    for (const [kb, kas] of fusiona) for (const ka of kas) desti.set(ka, kb);
    const velles = [...A.keys()].filter(ka => !usades.has(ka));
    const noves = [...B.keys()].filter(kb => !parelles.has(kb));
    const igual = (ka, kb) => signatura(A.get(ka)) === signatura(B.get(kb));
    const canvia = (ka, kb) => !igual(ka, kb) || Math.abs(midaLletra(A.get(ka)) - midaLletra(B.get(kb))) > 0.5;

    /* Símbols partits en més d'una línia (vegeu trossos): sense fantasma, es fonen amb la seva capa. */
    const TA = new Map([...A].map(([k, e]) => [k, trossos(e)]));
    const TB = new Map([...B].map(([k, e]) => [k, trossos(e)]));
    const partitA = ka => TA.get(ka).length > 1, partitB = kb => TB.get(kb).length > 1;
    const quiets = new Set();             // claus noves de parelles partides
    for (const [kb, ka] of parelles) {
      if (!partitA(ka) && !partitB(kb)) continue;
      quiets.add(kb);
      A.get(ka).classList.add('sense-fantasma');
      B.get(kb).classList.add('sense-fantasma');
    }
    for (const [k, e] of A) if (!usades.has(k) && partitA(k)) e.classList.add('sense-fantasma');
    for (const [k, e] of B) if (!parelles.has(k) && partitB(k)) e.classList.add('sense-fantasma');
    /** On s'apunta un símbol: si està partit, el primer tros. */
    const lloc = (R, T, k) => (T.has(k) && T.get(k).length > 1 ? T.get(k)[0] : R.get(k));

    /* 1. El cursor clica un símbol, o n'agafa un per arrossegar-lo. */
    const c = pas.cursor || {};
    let arrossegat = null;                // {r0, r1, el}: d'on surt, on va i el seu requadre
    if (c.arrossega && RA.has(c.arrossega)) {
      const r0 = lloc(RA, TA, c.arrossega);
      const parella = [...parelles].find(([, ka]) => ka === c.arrossega);
      const r1 = lloc(RB, TB, c.fins) || (parella && lloc(RB, TB, parella[0])) || lloc(RB, TB, desti.get(c.arrossega)) || r0;
      await cursor.va(r0.cx, r0.cy + r0.h * 0.15);
      arrossegat = {r0, r1, el: requadre(r0, temps(TEMPS.agafa))};
      cursor.prem(true);
      await espera(temps(TEMPS.agafa));
    } else if (c.clic && RA.has(c.clic)) {
      const q = lloc(RA, TA, c.clic);
      await cursor.va(q.cx, q.cy + q.h * 0.15);
      cursor.prem(true);
      cursor.ona(q.cx, q.cy);
      await espera(temps(TEMPS.clic));
      cursor.prem(false);
      await cursor.va(q.x + q.w + 10, q.y + q.h + 8, temps(TEMPS.aparta));
    }

    /* 2. Avisos: si no s'arrossega res, requadres sobre el que canviarà o desapareixerà. */
    const avisos = [];                    // {r0, r1, el}; r1 = null si el símbol desapareix
    if (!arrossegat) {
      for (const [kb, ka] of parelles) {
        if (!canvia(ka, kb)) continue;
        if (!quiets.has(kb)) { avisos.push({r0: RA.get(ka), r1: RB.get(kb)}); continue; }
        // Partit: un requadre per tros, que segueix el tros corresponent si n'hi ha tants com abans.
        const [ta, tb] = [TA.get(ka), TB.get(kb)];
        ta.forEach((q, j) => avisos.push({r0: q, r1: ta.length === tb.length ? tb[j] : null}));
      }
      const grups = new Map();            // els símbols que es fusionen en un, en un sol requadre
      for (const ka of velles) {
        const kb = desti.get(ka);
        if (RB.has(kb)) grups.set(kb, (grups.get(kb) || []).concat([RA.get(ka)]));
        else if (partitA(ka)) for (const q of TA.get(ka)) avisos.push({r0: q, r1: null});
        else avisos.push({r0: RA.get(ka), r1: null});
      }
      for (const [kb, rs] of grups) avisos.push({r0: unio(rs), r1: RB.get(kb)});
      for (const a of avisos) a.el = requadre(a.r0, temps(TEMPS.avis));
      if (avisos.length) await espera(temps(TEMPS.avis + TEMPS.lectura));
    }

    /* 3. El moviment. La capa nova apareix sense els símbols amb clau, que fan de fantasmes. */
    const D = temps(avisos.length ? TEMPS.pasAmbAvis : TEMPS.pas);
    const feines = [];
    vella.classList.add('amaga-claus');
    nova.classList.add('amaga-claus');
    nova.style.visibility = 'visible';
    feines.push(anima(vella, [{opacity: 1}, {opacity: 0}], {duration: D * 0.6}));
    feines.push(anima(nova, [{opacity: 0}, {opacity: 1}], {duration: D * 0.6, delay: D * 0.4}));

    // Els requadres d'avís segueixen el seu símbol, o s'esvaeixen amb ell.
    for (const a of avisos) {
      feines.push(anima(a.el, a.r1
        ? [Object.assign({opacity: 1}, caixa(a.r0)), Object.assign({offset: 0.75, opacity: 1}, caixa(a.r1)), Object.assign({opacity: 0}, caixa(a.r1))]
        : [{opacity: 1}, {opacity: 0}],
      {duration: a.r1 ? D : D * 0.5}));
    }

    // Els símbols que continuen es desplacen; si canvien, el vell es fon en el nou.
    for (const [kb, ka] of parelles) {
      if (quiets.has(kb)) continue;
      const a = RA.get(ka), b = RB.get(kb), elB = B.get(kb);
      const vell = fantasma(A.get(ka), a);
      const escala = midaLletra(elB) / vell.mida;
      if (igual(ka, kb)) {
        feines.push(anima(vell.el, [{transform: QUIET, color: vell.color}, {transform: trasllat(a, b, escala), color: getComputedStyle(elB).color}], {duration: D}));
      } else {
        const nou = fantasma(elB, b);
        feines.push(anima(vell.el, [{transform: QUIET}, {transform: trasllat(a, b, escala)}], {duration: D}));
        feines.push(anima(vell.el, [{opacity: 1}, {offset: 0.5, opacity: 0}, {opacity: 0}], {duration: D, easing: 'ease-in-out'}));
        feines.push(anima(nou.el, [{transform: trasllat(b, a, vell.mida / nou.mida), opacity: 0}, {offset: 0.38, opacity: 0}, {transform: QUIET, opacity: 1}],
          {duration: D, easing: 'ease-in-out'}));
      }
    }

    // Els símbols que desapareixen van a parar a la seva fusió, o s'esvaeixen.
    for (const ka of velles) {
      if (partitA(ka)) continue;
      const a = RA.get(ka), vell = fantasma(A.get(ka), a), t = RB.get(desti.get(ka));
      feines.push(anima(vell.el, t
        ? [{transform: QUIET, opacity: 1}, {offset: 0.7, opacity: 0.85}, {transform: trasllat(a, t, 0.55), opacity: 0}]
        : [{transform: QUIET, opacity: 1}, {transform: 'translate(0px, -6px) scale(.8)', opacity: 0}],
      {duration: t ? D * 0.8 : D * 0.55}));
    }

    // Els símbols nous apareixen; el resultat d'una fusió, amb una empenta.
    for (const kb of noves) {
      if (partitB(kb)) continue;
      const nou = fantasma(B.get(kb), RB.get(kb)), esFusio = fusiona.has(kb);
      feines.push(anima(nou.el, esFusio
        ? [{transform: 'scale(.4)', opacity: 0}, {offset: 0.55, transform: 'scale(.4)', opacity: 0},
           {offset: 0.82, transform: 'scale(1.18)', opacity: 1}, {transform: 'scale(1)', opacity: 1}]
        : [{transform: 'translate(0px, 6px)', opacity: 0}, {offset: 0.4, transform: 'translate(0px, 6px)', opacity: 0},
           {transform: 'translate(0px, 0px)', opacity: 1}],
      {duration: D, easing: esFusio ? 'ease-out' : CORBA}));
    }

    // El cursor arrossega el símbol, i el requadre l'acompanya.
    if (arrossegat) {
      const {r0, r1, el} = arrossegat;
      feines.push(anima(el, [caixa(r0), caixa(r1)], {duration: D}));
      feines.push(cursor.va(r1.cx, r1.cy + r1.h * 0.15, D, 0.86));
    }

    await Promise.all(feines);

    /* 4. Queda la capa nova, i el cursor deixa anar el símbol arrossegat. */
    vella.remove();
    nova.classList.remove('nova', 'amaga-claus');
    nova.querySelectorAll('.sense-fantasma').forEach(e => e.classList.remove('sense-fantasma'));
    nova.style.visibility = '';
    aturaAnimacions(nova);
    capa = nova;
    for (const e of [...r.efectes.children]) if (!arrossegat || e !== arrossegat.el) e.remove();
    if (arrossegat) {
      const {r1, el} = arrossegat;
      cursor.prem(false);
      await Promise.all([
        anima(el, [{opacity: 1}, {opacity: 0}], {duration: temps(TEMPS.aparta)}),
        cursor.va(r1.x + r1.w + 10, r1.y + r1.h + 8, temps(TEMPS.aparta)),
      ]);
      el.remove();
    }
  }

  return {mostra, ajusta, transicio};
}


/* ── 7. REPRODUCTOR ────────────────────────────────────────────────── */

/** Botons, punts dels passos i explicació de cada pas. */
function creaReproductor(r, pissarra, cursor, temps) {
  let passos = [], idx = 0;
  let ocupat = false;                     // hi ha una transició en marxa
  let reproduint = false;
  let torn = 0;                           // canvia cada vegada que es talla una reproducció
  const darrer = () => passos.length - 1;

  function pinta() {
    r.numPas.textContent = `Pas ${idx + 1} de ${passos.length}`;
    r.textPas.innerHTML = textAmbFormules(passos[idx].text);
    [...r.punts.children].forEach((p, i) => {
      p.className = 'punt' + (i === idx ? ' actual' : i < idx ? ' fet' : '');
      p.setAttribute('aria-current', i === idx ? 'step' : 'false');
    });
    r.anterior.disabled = idx === 0;
    r.seguent.disabled = idx === darrer();
  }

  function marcaReproduccio(estat) {
    reproduint = estat;
    const nom = estat ? 'Atura' : 'Reprodueix';
    r.reprodueix.innerHTML = icona(estat ? ICONES.atura : ICONES.reprodueix);
    r.reprodueix.title = nom;
    r.reprodueix.setAttribute('aria-label', nom);
  }

  /** Va al pas i, sense animació. Atura la reproducció. */
  function salta(i) {
    if (ocupat) return;
    torn++;
    marcaReproduccio(false);
    idx = Math.max(0, Math.min(darrer(), i));
    pissarra.mostra(passos[idx]);
    cursor.amaga();
    pinta();
  }

  /** Anima el pas següent. */
  async function seguent() {
    if (ocupat || idx >= darrer()) return;
    ocupat = true;
    idx++;
    pinta();
    try {
      await pissarra.transicio(passos[idx]);
    } finally {
      ocupat = false;
    }
    if (idx === darrer()) cursor.amaga();
  }

  /** Reprodueix tots els passos que queden, o atura la reproducció. */
  async function reprodueix() {
    if (reproduint) { marcaReproduccio(false); return; }
    if (ocupat) return;
    if (idx >= darrer()) salta(0);
    marcaReproduccio(true);
    const meu = ++torn;
    await espera(temps(TEMPS.esperaInici));
    while (reproduint && meu === torn && idx < darrer()) {
      await seguent();
      if (!reproduint || meu !== torn) break;
      await espera(temps(TEMPS.llegir + passos[idx].text.split(/\s+/).length * TEMPS.perParaula));
    }
    if (meu === torn) marcaReproduccio(false);
  }

  const atura = () => { if (reproduint) marcaReproduccio(false); };

  /** Passos nous: torna al primer. No s'ha de cridar durant una transició. */
  function carrega(nous) {
    passos = nous;
    r.punts.replaceChildren(...passos.map((_, i) => {
      const p = element('button', {class: 'punt', type: 'button', 'aria-label': `Pas ${i + 1}`});
      p.addEventListener('click', () => salta(i));
      return p;
    }));
    salta(0);
  }

  /** Torna a dibuixar el pas actual (p. ex. si canvia la mida de la lletra). */
  function redibuixa() {
    if (ocupat) return;
    pissarra.mostra(passos[idx]);
    cursor.amaga();
  }

  r.reprodueix.addEventListener('click', reprodueix);
  r.seguent.addEventListener('click', () => { atura(); seguent(); });
  r.anterior.addEventListener('click', () => salta(idx - 1));
  r.reinicia.addEventListener('click', () => salta(0));

  return {
    carrega, salta, seguent, reprodueix, atura, redibuixa,
    get ocupat() { return ocupat; },
    get pas() { return idx; },
    get total() { return passos.length; },
  };
}


/* ── 8. EDITOR DE DADES AMB FLETXES ────────────────────────────────── */

/**
 * Editor definit per procediment.editor (vegeu README.md): cada fila té
 * una etiqueta TeX i uns camps. Cada camp és un enter amb una fletxa ↑ i
 * una fletxa ↓ a sota, i opcionalment un sufix TeX al costat («x^2»).
 */
function creaEditor(r, proc, enCanviar) {
  const valors = {};
  const camps = {};

  /** Fletxa: cada toc fa un pas; si es manté premuda, es repeteix. */
  function fletxa(text, nom, fer) {
    const b = element('button', {class: 'fletxa', type: 'button', text, 'aria-label': nom});
    let retard = null, repeticio = null;
    const para = () => { clearTimeout(retard); clearInterval(repeticio); retard = repeticio = null; };
    const pas = () => { fer(); if (b.disabled) para(); };   // al límit, la fletxa es desactiva
    b.addEventListener('pointerdown', e => {
      if (e.button !== 0) return;
      e.preventDefault();
      para();
      pas();
      retard = setTimeout(() => { repeticio = setInterval(pas, TEMPS.repeticio); }, TEMPS.repeteix);
    });
    for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) b.addEventListener(ev, para);
    b.addEventListener('click', e => { if (e.detail === 0) fer(); });   // teclat: Retorn o espai
    return b;
  }

  function creaCamp(def) {
    const valor = element('span', {class: 'valor', tabindex: '0', role: 'spinbutton', 'aria-label': def.nom,
      'aria-valuemin': def.min, 'aria-valuemax': def.max});
    const puja = fletxa('↑', 'Puja 1: ' + def.nom, () => canvia(def.id, 1));
    const baixa = fletxa('↓', 'Baixa 1: ' + def.nom, () => canvia(def.id, -1));
    valor.addEventListener('keydown', e => {
      const d = {ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1}[e.key];
      if (d) { e.preventDefault(); canvia(def.id, d); }
    });
    const terme = element('span', {class: 'terme'}, [
      element('span', {class: 'columna'}, [valor, element('span', {class: 'fletxes'}, [puja, baixa])]),
      def.sufix ? element('span', {class: 'sufix', html: formula(def.sufix)}) : null,
    ]);
    camps[def.id] = {def, terme, valor, puja, baixa};
    return terme;
  }

  /*
   * Variants (opcional): proc.modes = {id, nom, opcions: [{valor, nom}]}. Un grup de
   * botons tria el valor de valors[id]; una fila amb «modes» només es veu en aquests.
   */
  const modes = proc.modes || null;
  const botonsMode = [];
  if (modes) {
    const grup = element('div', {class: 'modes', role: 'group', 'aria-label': modes.nom});
    for (const o of modes.opcions) {
      const b = element('button', {class: 'mode', type: 'button', text: o.nom});
      b.addEventListener('click', () => {
        if (valors[modes.id] === o.valor) return;
        valors[modes.id] = o.valor;
        pinta();
        enCanviar(Object.assign({}, valors));
      });
      botonsMode.push({b, valor: o.valor});
      grup.append(b);
    }
    r.editor.append(grup);
  }
  const files = [];
  for (const fila of proc.editor) {
    const el = element('div', {class: 'editor-fila'}, [
      element('span', {class: 'etiqueta', html: formula(fila.etiqueta)}),
      ...fila.camps.map(creaCamp),
    ]);
    files.push({el, modes: fila.modes});
    r.editor.append(el);
  }

  /** Com es veu un valor: «−3»; «+2» si el camp porta sempre el signe; si no, «2». */
  const mostrat = (def, v) => (v < 0 ? MENYS + (-v) : (def.signe === 'sempre' ? '+' : '') + v);

  function pinta() {
    if (modes) {
      for (const {b, valor} of botonsMode) b.setAttribute('aria-pressed', String(valors[modes.id] === valor));
      for (const {el, modes: m} of files) el.hidden = Boolean(m) && !m.includes(valors[modes.id]);
    }
    for (const {def, terme, valor, puja, baixa} of Object.values(camps)) {
      const v = valors[def.id];
      valor.textContent = def.mostra ? def.mostra(v, valors) : mostrat(def, v);   // un camp pot triar com es veu (p. ex. «0,25» o «25 %»)
      valor.setAttribute('aria-valuenow', v);
      puja.disabled = v >= def.max;
      baixa.disabled = v <= def.min;
      terme.classList.toggle('zero', Boolean(def.atenua0) && v === 0);
    }
  }

  function canvia(id, d) {
    const def = camps[id].def;
    const v = Math.max(def.min, Math.min(def.max, valors[id] + d));
    if (v === valors[id]) return;
    valors[id] = v;
    pinta();
    enCanviar(Object.assign({}, valors));
  }

  return {
    /** Posa uns valors a l'editor, sense avisar de cap canvi. */
    posa(nous) {
      for (const id of Object.keys(camps)) valors[id] = nous[id];
      if (modes) valors[modes.id] = nous[modes.id];
      pinta();
    },
  };
}


/* ── 9. ARRENCADA ──────────────────────────────────────────────────── */

/**
 * Posa en marxa un procediment dins del contenidor (per defecte, l'element
 * amb id «procediment»). Torna un controlador, útil per a les proves:
 *   {carrega(valors), salta(i), seguent(), pas, total, ocupat, valors}
 */
function inicia(proc, contenidor = document.getElementById('procediment')) {
  if (!contenidor) throw new Error('Falta l\'element amb id «procediment».');
  if (typeof katex === 'undefined') {
    contenidor.replaceChildren(element('p', {class: 'error-carrega',
      text: 'No s\'ha pogut carregar KaTeX, la biblioteca que dibuixa les fórmules. Comprova la connexió i torna a carregar la pàgina.'}));
    return null;
  }

  document.body.dataset.categoria = proc.categoria || '';
  const r = construeixPagina(proc, contenidor);

  let velocitat = 1;
  const reduit = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const temps = ms => Math.max(60, (ms / velocitat) * (reduit ? 0.35 : 1));

  const cursor = creaCursor(r.escenari, r.cursor, temps);
  const pissarra = creaPissarra(r, proc.files, cursor, temps);
  const reproductor = creaReproductor(r, pissarra, cursor, temps);
  let actuals = null, passos = [];

  const mostraAvis = text => { r.avis.textContent = text || ''; r.avis.hidden = !text; };
  // Sense editor (p. ex. problemes fixos), no hi ha res a resumir: els exemples ja diuen què es veu.
  r.editor.hidden = r.resum.hidden = !proc.editor.length;
  const mostraResum = valors => { if (proc.editor.length) r.resum.innerHTML = 'Queda ' + formula(proc.resum(valors)) + '.'; };

  const botonsExemple = [];   // [{boto, valors}]: el de les dades actuals queda marcat
  const iguals = (a, b) => Object.keys(a).every(k => a[k] === b[k]);

  /** Genera els passos per a uns valors i va al primer. */
  function carrega(valors, escriu = false) {
    actuals = Object.assign({}, valors);
    for (const {boto, valors: v} of botonsExemple) boto.setAttribute('aria-pressed', String(iguals(v, actuals)));
    passos = proc.passos(actuals);
    const text = proc.enunciat(actuals);
    r.enunciat.innerHTML = textAmbFormules(text);
    r.enunciat.hidden = !text;                          // p. ex. si l'enunciat és a la pissarra
    mostraResum(actuals);
    pissarra.ajusta(passos);
    reproductor.carrega(passos);
    if (escriu && proc.escriuAdreca) escriuAdreca(proc.escriuAdreca(actuals));
  }

  /** Carrega uns valors al cap de «retard» ms, quan no hi hagi cap transició en marxa. */
  let rellotge = null;
  function programa(valors, retard) {
    clearTimeout(rellotge);
    const intenta = () => {
      if (reproductor.ocupat) { rellotge = setTimeout(intenta, 200); return; }
      mostraAvis('');
      carrega(valors, true);
    };
    rellotge = setTimeout(intenta, retard);
  }

  const editor = creaEditor(r, proc, valors => {
    clearTimeout(rellotge);
    mostraResum(valors);
    const error = proc.valida ? proc.valida(valors) : null;
    r.errorEditor.textContent = error || '';
    r.errorEditor.hidden = !error;
    if (!error) programa(valors, TEMPS.rellegeix);
  });

  for (const valors of proc.exemples || []) {
    const b = element('button', {class: 'exemple', type: 'button',
      html: proc.nomExemple ? escapa(proc.nomExemple(valors)) : formula(proc.resum(valors))});
    b.addEventListener('click', () => {
      editor.posa(valors);
      mostraResum(valors);
      r.errorEditor.hidden = true;
      programa(valors, 0);
    });
    botonsExemple.push({boto: b, valors});
    r.exemples.append(b);
  }

  r.velocitat.addEventListener('change', () => { velocitat = parseFloat(r.velocitat.value) || 1; });

  /* Teclat: espai = reprodueix o atura; fletxes ← → = pas anterior o següent. */
  document.addEventListener('keydown', e => {
    if (e.altKey || e.ctrlKey || e.metaKey || e.defaultPrevented) return;
    const t = e.target instanceof Element ? e.target : document.body;
    if (t.closest('input, select, textarea, [role="spinbutton"]')) return;
    if (e.key === ' ') {
      if (t.closest('button, a')) return;           // l'espai ja prem el botó enfocat
      e.preventDefault();
      reproductor.reprodueix();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      reproductor.atura();
      reproductor.seguent();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      reproductor.salta(reproductor.pas - 1);
    }
  });

  /* Si canvia l'amplada, o quan acaben de carregar les lletres, es torna a ajustar la pissarra. */
  let rellotgeMida = null;
  function reajusta() {
    clearTimeout(rellotgeMida);
    rellotgeMida = setTimeout(function intenta() {
      if (reproductor.ocupat) { rellotgeMida = setTimeout(intenta, 200); return; }
      pissarra.ajusta(passos);
      reproductor.redibuixa();
    }, 200);
  }
  let amplada = innerWidth;
  addEventListener('resize', () => {
    if (innerWidth === amplada) return;   // al mòbil, la barra d'adreces només canvia l'alçada
    amplada = innerWidth;
    reajusta();
  });

  /* Valors inicials: els de l'adreça, si n'hi ha i són vàlids. */
  let inicials = proc.perDefecte;
  const adreca = llegeixAdreca();
  if (proc.llegeixAdreca && Object.keys(adreca).length) {
    const lectura = proc.llegeixAdreca(adreca);
    if (lectura.error) mostraAvis(lectura.error + ' Et mostro l\'exemple inicial.');
    else inicials = lectura.valors;
  }
  editor.posa(inicials);
  carrega(inicials);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(reajusta);

  return Object.freeze({
    carrega(valors) { editor.posa(valors); mostraAvis(''); carrega(valors); },
    salta: i => reproductor.salta(i),
    seguent: () => reproductor.seguent(),
    get pas() { return reproductor.pas; },
    get total() { return reproductor.total; },
    get ocupat() { return reproductor.ocupat; },
    get valors() { return Object.assign({}, actuals); },
  });
}


/* ── EXPORTACIÓ ────────────────────────────────────────────────────── */

arrel.Motor = Object.freeze({inicia});

})(globalThis);
