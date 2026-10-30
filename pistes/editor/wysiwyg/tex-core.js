/* tex-core.js — LaTeX d'una pista ⇄ HTML editable (WYSIWYG).
   tok(s)        → tokens. Cada token guarda el text font exacte (src), de manera que
                   join(tok(s)) === s i una pista sense tocar torna idèntica.
   html(tokens)  → HTML: el text és editable; les fórmules i les marques d'estructura
                   són «àtoms» (contenteditable=false, data-src = font exacta).
   ser(node)     → recorre el DOM editat i torna el LaTeX. */
(function (G) {
  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
  const esc = s => String(s).replace(/[&<>"]/g, c => ESC[c]);

  function brace(s, i) {            // s[i] === '{' → índex just després de la clau que la tanca
    let d = 0;
    for (let j = i; j < s.length; j++) {
      const c = s[j];
      if (c === '\\') { j++; continue; }
      if (c === '{') d++;
      else if (c === '}' && --d === 0) return j + 1;
    }
    return -1;
  }
  const ARGS = { 'section*': 1, 'subsection*': 1, 'textcolor': 2, 'textnormal': 1, 'hspace*': 1, 'hspace': 1,
                 'vspace': 1, 'vspace*': 1, 'addcontentsline': 3, 'normalsize': 0 };
  const WRAP = { textit: 'i', textbf: 'b', emph: 'i' };
  const SKIP = { medskip: 1, smallskip: 1, bigskip: 1 };

  function tok(s) {
    const out = []; let txt = '', i = 0;
    const flush = () => { if (txt) { out.push({ t: 'txt', v: txt }); txt = ''; } };
    const push = o => { flush(); out.push(o); };
    while (i < s.length) {
      const c = s[i], r = s.slice(i);
      let m;
      if (c === '$') {
        const dbl = s[i + 1] === '$', a = i + (dbl ? 2 : 1);
        let j = a; while (j < s.length && !(s[j] === '$' && s[j - 1] !== '\\')) j++;
        if (j >= s.length) { txt += c; i++; continue; }
        const e = dbl ? j + 2 : j + 1;
        push({ t: dbl ? 'D' : 'm', src: s.slice(i, e), tex: s.slice(a, j) }); i = e; continue;
      }
      if (r.startsWith('\\[')) {
        const j = s.indexOf('\\]', i + 2);
        if (j > 0) { push({ t: 'D', src: s.slice(i, j + 2), tex: s.slice(i + 2, j) }); i = j + 2; continue; }
      }
      if ((m = /^\n[ \t]*\n(?:[ \t]*\n)*/.exec(r))) { push({ t: 'par', src: m[0] }); i += m[0].length; continue; }
      if (c === '\\') {
        if ((m = /^\\(begin|end)\{(itemize|enumerate)\}/.exec(r))) { push({ t: m[1] === 'begin' ? 'ibeg' : 'iend', src: m[0], env: m[2] }); i += m[0].length; continue; }
        if ((m = /^\\item\b ?/.exec(r))) { push({ t: 'item', src: m[0] }); i += m[0].length; continue; }
        if ((m = /^\\([a-zA-Z]+\*?)/.exec(r))) {
          const name = m[1]; let e = i + m[0].length;
          if (SKIP[name]) { push({ t: 'skip', src: m[0] }); i = e; continue; }
          if (name === 'mbox' && s[e] === '{') {
            const f = brace(s, e), inner = s.slice(e + 1, f - 1), mm = /^\$([^$]*)\$$/.exec(inner);
            if (f > 0 && mm) { push({ t: 'm', src: s.slice(i, f), tex: mm[1], mbox: 1 }); i = f; continue; }
          }
          if (WRAP[name] && s[e] === '{') {
            const f = brace(s, e);
            if (f > 0) { push({ t: 'wrap', cmd: name, kids: tok(s.slice(e + 1, f - 1)) }); i = f; continue; }
          }
          if (name in ARGS) {
            const args = [];
            for (let k = 0; k < ARGS[name]; k++) {
              let w = e; while (s[w] === ' ') w++;
              if (s[w] !== '{') break;
              const f = brace(s, w); if (f < 0) break;
              args.push(s.slice(w + 1, f - 1)); e = f;
            }
            push({ t: 'arg', name, args, src: s.slice(i, e) }); i = e; continue;
          }
          if (name === '\\') { /* no s'hi arriba */ }
          push({ t: 'cmd', src: m[0], name }); i = e; continue;
        }
        if ((m = /^\\\\(\[[^\]]*\])?/.exec(r))) { push({ t: 'cmd', src: m[0], name: 'newline' }); i += m[0].length; continue; }
        push({ t: 'cmd', src: s.slice(i, i + 2), name: s[i + 1] }); i += 2; continue;
      }
      if (c === '{' || c === '}' || c === '~') { push({ t: 'cmd', src: c, name: c }); i++; continue; }
      if ((m = /^---?/.exec(r))) { push({ t: 'cmd', src: m[0], name: m[0] }); i += m[0].length; continue; }
      txt += c; i++;
    }
    flush();
    return out;
  }

  function join(ts) {
    return ts.map(t => t.t === 'txt' ? t.v : t.t === 'wrap' ? '\\' + t.cmd + '{' + join(t.kids) + '}' : t.src).join('');
  }

  /* KaTeX: \vec amb dues lletres o més = \overrightarrow (com pista.sty); \euro = € */
  const MACROS = { '\\euro': '\\text{€}' };
  function prep(tex) {
    return tex.replace(/\\vec\s*\{([^{}\\][^{}]+)\}/g, '\\overrightarrow{$1}');
  }
  function kx(tex, display) {
    if (!G.katex) return '<code>' + esc(tex) + '</code>';
    try {
      return G.katex.renderToString(prep(tex), { displayMode: !!display, throwOnError: true, macros: Object.assign({}, MACROS), strict: 'ignore' });
    } catch (e) {
      return '<span class="kerr" title="' + esc(e.message) + '">' + esc(tex) + '</span>';
    }
  }
  const CMD = { ',': ' ', '%': '%', '&': '&amp;', '#': '#', '_': '_', ' ': ' ', '{': '', '}': '', '~': ' ',
                '--': '–', '---': '—', ldots: '…', dots: '…', euro: '€', quad: ' ', qquad: '  ',
                noindent: '', normalfont: '', newline: '<br>', 'l': 'ŀ', '\'': '' };

  function atom(cls, src, inner) {
    return '<span class="a ' + cls + '" contenteditable="false" data-src="' + esc(src) + '">' + (inner || '') + '</span>';
  }
  function html(ts) {
    let h = '';
    for (const t of ts) {
      switch (t.t) {
        case 'txt': h += esc(t.v); break;
        case 'm': h += atom('m' + (t.mbox ? ' mbox' : ''), t.src, kx(t.tex, false)); break;
        case 'D': h += atom('D', t.src, kx(t.tex, true)); break;
        case 'par': h += atom('par', t.src); break;
        case 'skip': h += atom('sk', t.src); break;
        case 'ibeg': h += atom('ib', t.src); break;
        case 'iend': h += atom('ie', t.src); break;
        case 'item': h += atom('it', t.src, '•'); break;
        case 'wrap': h += '<' + WRAP[t.cmd] + ' data-cmd="' + t.cmd + '">' + html(t.kids) + '</' + WRAP[t.cmd] + '>'; break;
        case 'arg': h += atom('arg', t.src, argHtml(t)); break;
        default: {
          const v = CMD[t.name];
          h += atom('c' + (v === undefined ? ' unk' : ''), t.src, v === undefined ? esc(t.src) : v);
        }
      }
    }
    return h;
  }
  function argHtml(t) {
    if (t.name === 'textnormal') return html(tok(t.args[0] || ''));
    if (t.name === 'textcolor') return html(tok(t.args[1] || ''));
    if (t.name === 'hspace*' || t.name === 'hspace') return /fill/.test(t.args[0] || '') ? '<span class="fill"></span>' : ' ';
    return '';
  }

  /* DOM → LaTeX */
  function ser(node) {
    let s = '';
    for (const n of node.childNodes) {
      if (n.nodeType === 3) {
        s += n.nodeValue.replace(/[\u200b\ufeff]/g, '').replace(/\u00a0/g, ' ').replace(/(^|[^\\])([%&#])/g, '$1\\$2');
      } else if (n.nodeType === 1) {
        if (n.hasAttribute('data-src')) { s += n.getAttribute('data-src'); continue; }
        const tag = n.tagName, cmd = n.getAttribute('data-cmd');
        if (n.classList.contains('caret-mark')) continue;
        if (tag === 'BR') { s += '\n'; continue; }
        const inner = ser(n);
        if (cmd) s += '\\' + cmd + '{' + inner + '}';
        else if (tag === 'B' || tag === 'STRONG') s += inner ? '\\textbf{' + inner + '}' : '';
        else if (tag === 'I' || tag === 'EM') s += inner ? '\\textit{' + inner + '}' : '';
        else if (tag === 'DIV' || tag === 'P') s += '\n\n' + inner;
        else s += inner;
      }
    }
    return s;
  }

  G.TexCore = { tok, join, html, ser, kx, esc, brace, prep, MACROS };
})(typeof window !== 'undefined' ? window : globalThis);
