/* auth.js ── Portal d'accés · Departament de Matemàtiques · INS Miquel Tarradell
 * ════════════════════════════════════════════════════════════════════════════════
 * Carregat al final de <body> de repartiment.html i seguiment.html.
 * El <head> d'aquelles pàgines inclou el fragment anti-flash (vegeu comentari
 * a repartiment.html / seguiment.html).
 *
 * CONFIGURACIÓ
 * ┌──────────────────┬──────────────────────────────────────────────────────────┐
 * │ AUTH_HASH        │ SHA-256 de la contrasenya del departament.               │
 * │                  │ Contrasenya per defecte: mates2526                       │
 * │                  │ Per canviar-la:                                          │
 * │                  │   1. Obriu la consola (F12 → Console) a qualsevol pàgina │
 * │                  │   2. Executeu: authHash('nova-clau').then(console.log)   │
 * │                  │   3. Substituïu AUTH_HASH pel hash obtingut              │
 * ├──────────────────┼──────────────────────────────────────────────────────────┤
 * │ AUTH_DOMAIN      │ Domini acceptat per a l'opció de correu.                 │
 * │                  │ Per defecte: '@instarradell.cat'                         │
 * ├──────────────────┼──────────────────────────────────────────────────────────┤
 * │ SESSION_DAYS     │ Dies que dura la sessió guardada al navegador. Def: 30.  │
 * └──────────────────┴──────────────────────────────────────────────────────────┘
 */
(function () {
  'use strict';

  /* ── CONFIGURACIÓ ────────────────────────────────────────────────── */
  const AUTH_HASH   = '047e2342bbaf7d084c196e0af378d1922192b99a4add497bb618cc6e9d540cf1';
  const AUTH_DOMAIN = '@instarradell.cat';
  const SESSION_KEY  = 'dept-auth-token';
  const SESSION_DAYS = 30;

  /* ── HELPERS CRIPTOGRÀFICS ────────────────────────────────────────── */

  async function sha256 (str) {
    const buf = await crypto.subtle.digest(
      'SHA-256', new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf))
      .map(b => b.toString(16).padStart(2, '0')).join('');
  }
  /* Exposat globalment perquè l'admin pugui generar hashes des de la consola */
  window.authHash = sha256;

  /* ── SESSIÓ ───────────────────────────────────────────────────────── */

  function getSession () {
    try {
      const s = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
      if (!s || Date.now() > s.expires) { localStorage.removeItem(SESSION_KEY); return null; }
      return s;
    } catch { return null; }
  }

  function storeSession (method) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      expires : Date.now() + SESSION_DAYS * 86_400_000,
      method,
    }));
  }

  /* Exposat per poder tancar sessió des de qualsevol pàgina:
   *   clearAuth()   → tanca sessió i recarrega
   */
  window.clearAuth = function () {
    localStorage.removeItem(SESSION_KEY);
    location.reload();
  };

  /* ── SESSIÓ VÀLIDA → MOSTRAR INDICADOR I SORTIR ───────────────────── */

  if (getSession()) {
    /* Eliminem la classe d'ocultació que l'snippet anti-flash ha pogut deixar */
    document.documentElement.classList.remove('auth-locked');
    /* Afegim el botó de sessió al topbar quan el DOM estigui llest */
    document.addEventListener('DOMContentLoaded', injectSessionBadge);
    return;
  }

  /* ── NO HI HA SESSIÓ → CONSTRUIR LA PORTA ────────────────────────── */

  document.addEventListener('DOMContentLoaded', buildGate);

  /* ══════════════════════════════════════════════════════════════════
   *  VISUAL: paper de quadrícula + targeta de bloc de notes
   * ══════════════════════════════════════════════════════════════════ */

  function buildGate () {
    /* Estils ─── injectats dinàmicament per no necessitar un .css extern */
    const style = document.createElement('style');
    style.textContent = gateCSS();
    document.head.appendChild(style);

    /* Cos de la porta */
    const gate = document.createElement('div');
    gate.id = 'auth-gate';
    gate.setAttribute('role', 'dialog');
    gate.setAttribute('aria-modal', 'true');
    gate.setAttribute('aria-label', 'Identificació del professorat');
    gate.innerHTML = gateHTML();
    document.body.appendChild(gate);

    /* Bloquejar scroll de fons */
    document.body.style.overflow = 'hidden';
    /* Mostrar el body (que l'snippet anti-flash havia amagat) */
    document.documentElement.classList.remove('auth-locked');

    /* Enganxar events */
    wireEvents(gate);

    /* Focus al primer input */
    setTimeout(() => gate.querySelector('.ag-input')?.focus(), 120);
  }

  /* ── HTML DE LA PORTA ────────────────────────────────────────────── */

  function gateHTML () {
    return /* html */`
    <div class="ag-card" id="ag-card">

      <!-- Forats de registrador (decoració "paper físic") -->
      <div class="ag-holes">
        <div class="ag-hole"></div>
        <div class="ag-hole"></div>
        <div class="ag-hole"></div>
      </div>

      <!-- Línia vermella de marge (decoració "paper físic") -->
      <div class="ag-margin-line"></div>

      <!-- Capçalera -->
      <header class="ag-header">
        <div class="ag-header-inner">
          <div class="ag-dept-line">Departament de Matemàtiques</div>
          <div class="ag-page-title">Identificació del professorat</div>
          <div class="ag-deco" aria-hidden="true">∑</div>
        </div>
      </header>

      <!-- Cos -->
      <div class="ag-body">

        <p class="ag-prompt">Accés restringit. Identifiqueu-vos per continuar:</p>

        <!-- Selector de mètode (dues opcions com a targetes) -->
        <div class="ag-methods" role="group" aria-label="Mètode d'identificació">
          <button class="ag-method active" data-method="email" id="ag-btn-email">
            <span class="ag-method-icon" aria-hidden="true">✉</span>
            <span class="ag-method-label">Correu<br><small>@instarradell.cat</small></span>
          </button>
          <button class="ag-method" data-method="pass" id="ag-btn-pass">
            <span class="ag-method-icon" aria-hidden="true">🔑</span>
            <span class="ag-method-label">Contrasenya<br><small>del departament</small></span>
          </button>
        </div>

        <!-- Camp de correu -->
        <div class="ag-field" id="ag-field-email">
          <label class="ag-label" for="ag-email">Adreça de correu del centre</label>
          <input class="ag-input" id="ag-email" type="email"
                 autocomplete="email" autocapitalize="none" spellcheck="false"
                 placeholder="nom.cognom${AUTH_DOMAIN}">
          <div class="ag-hint">Cal una adreça ${AUTH_DOMAIN} vàlida</div>
        </div>

        <!-- Camp de contrasenya -->
        <div class="ag-field" id="ag-field-pass" hidden>
          <label class="ag-label" for="ag-pass">Contrasenya del departament</label>
          <input class="ag-input" id="ag-pass" type="password"
                 autocomplete="current-password"
                 placeholder="••••••••">
          <div class="ag-hint">Contrasenya compartida del departament</div>
        </div>

        <!-- Error -->
        <div class="ag-error" id="ag-error" hidden role="alert"></div>

        <!-- Botó -->
        <button class="ag-submit" id="ag-submit" type="button">
          <span class="ag-submit-txt" id="ag-submit-txt">Entrar</span>
          <svg class="ag-submit-arrow" viewBox="0 0 20 20" fill="none"
               stroke="currentColor" stroke-width="2.2" stroke-linecap="round"
               stroke-linejoin="round" aria-hidden="true">
            <path d="M4 10h12M11 5l5 5-5 5"/>
          </svg>
        </button>

      </div><!-- /.ag-body -->

      <!-- Peu de pàgina -->
      <footer class="ag-footer">
        La sessió es desa ${SESSION_DAYS} dies al navegador d'aquest equip.
      </footer>

    </div><!-- /.ag-card -->
    `;
  }

  /* ── CSS DE LA PORTA ─────────────────────────────────────────────── */

  function gateCSS () {
    return /* css */`

/* ── Fons: paper de quadrícula (matemàtiques!) ──────────────────── */
#auth-gate {
  position: fixed; inset: 0; z-index: 9990;
  display: flex; align-items: center; justify-content: center;
  padding: 16px;

  /* Quadrícula millimètrica en blau tènue */
  background-color: #eef2fd;
  background-image:
    linear-gradient(rgba(80,110,220,.18) 1px, transparent 1px),
    linear-gradient(90deg, rgba(80,110,220,.18) 1px, transparent 1px),
    linear-gradient(rgba(80,110,220,.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(80,110,220,.07) 1px, transparent 1px);
  background-size: 80px 80px, 80px 80px, 16px 16px, 16px 16px;
  background-position: -1px -1px;
}

/* ── Targeta: bloc de notes amb espiral imaginari ────────────────── */
#ag-card {
  background: #fffef8;
  width: 100%; max-width: 430px;
  border-radius: 3px 3px 2px 2px;
  box-shadow:
    0 1px 2px rgba(0,0,0,.06),
    0 6px 20px rgba(0,0,0,.10),
    0 24px 60px rgba(0,0,0,.12);
  position: relative;
  overflow: hidden;
  /* Animació d'entrada: cau des de dalt amb lleuger bot */
  animation: ag-drop .55s cubic-bezier(.34,1.45,.64,1) both;
}

/* Forats de registrador */
.ag-holes {
  position: absolute; left: 0; top: 0; bottom: 0; width: 52px;
  display: flex; flex-direction: column; align-items: center;
  justify-content: space-evenly; pointer-events: none;
  background: #f3f2ed; /* zona de forats lleugerament diferent */
  border-right: 1px solid #e0ddd0;
}
.ag-hole {
  width: 18px; height: 18px; border-radius: 50%;
  background: #eef2fd; /* color del fons de porta */
  border: 1.5px solid #ccc9bb;
  box-shadow: inset 0 1px 3px rgba(0,0,0,.18);
}

/* Línia vermella de marge */
.ag-margin-line {
  position: absolute; left: 52px; top: 0; bottom: 0;
  width: 2px; background: rgba(220,40,40,.35);
  pointer-events: none;
}

/* ── Capçalera blau marí ─────────────────────────────────────────── */
.ag-header {
  background: #1f3a5f;
  padding: 18px 22px 14px 68px;
  position: relative;
}
.ag-dept-line {
  font-size: 10.5px; letter-spacing: .12em; text-transform: uppercase;
  color: rgba(255,255,255,.55); margin-bottom: 3px; font-weight: 600;
}
.ag-page-title {
  font-size: 17px; font-weight: 800; color: #fff; line-height: 1.2;
}
/* Símbol matemàtic decoratiu */
.ag-deco {
  position: absolute; right: 18px; top: 10px;
  font-size: 44px; font-family: Georgia, serif;
  color: rgba(255,255,255,.10); user-select: none; line-height: 1;
  letter-spacing: -.02em;
}

/* ── Cos ─────────────────────────────────────────────────────────── */
.ag-body {
  padding: 18px 22px 14px 70px;
  /* Línies horitzontals de pauta — fetes a mà, tènues */
  background-image: repeating-linear-gradient(
    transparent, transparent 31px,
    rgba(180,190,220,.25) 31px, rgba(180,190,220,.25) 32px
  );
  background-position: 0 26px;
}

.ag-prompt {
  font-size: 13px; color: #5a5870; margin-bottom: 16px; line-height: 1.45;
}

/* ── Mètodes d'identificació ─────────────────────────────────────── */
.ag-methods {
  display: flex; gap: 8px; margin-bottom: 20px;
}
.ag-method {
  flex: 1; padding: 10px 8px 8px;
  border: 1.5px solid #d4d0c4; border-radius: 6px;
  background: #faf9f3; cursor: pointer; text-align: center;
  transition: border-color .12s, background .12s, box-shadow .12s;
  line-height: 1.25;
}
.ag-method:hover { border-color: #1f3a5f; background: #f0f3fb; }
.ag-method.active {
  border-color: #1f3a5f; background: #eef2fd;
  box-shadow: 0 0 0 3px rgba(31,58,95,.12);
}
.ag-method-icon { font-size: 20px; display: block; margin-bottom: 4px; }
.ag-method-label { font-size: 12px; font-weight: 700; color: #2a2838; }
.ag-method-label small { font-weight: 400; color: #7a788a; font-size: 10.5px; }
.ag-method.active .ag-method-label { color: #1f3a5f; }

/* ── Camps (estil "formulari físic": només la línia inferior) ──── */
.ag-field { margin-bottom: 4px; }
.ag-label {
  display: block; font-size: 10.5px; font-weight: 700;
  text-transform: uppercase; letter-spacing: .07em;
  color: #9090a0; margin-bottom: 6px;
}
.ag-input {
  width: 100%; padding: 5px 0 5px;
  border: none; border-bottom: 2px solid #1f3a5f;
  border-radius: 0; background: transparent;
  font-size: 15px; color: #22262b;
  outline: none; transition: border-color .15s;
}
.ag-input:focus { border-bottom-color: #2e75b6; }
.ag-input::placeholder { color: #b8b6cc; font-style: italic; }
.ag-hint { font-size: 11px; color: #aaa9bc; margin-top: 5px; }

/* ── Error ───────────────────────────────────────────────────────── */
.ag-error {
  display: flex; align-items: center; gap: 7px;
  font-size: 12.5px; color: #c82020;
  margin: 12px 0 2px; line-height: 1.35;
}
.ag-error::before {
  content: '!';
  flex-shrink: 0; width: 17px; height: 17px; border-radius: 50%;
  background: #dc2626; color: #fff;
  font-size: 11px; font-weight: 900;
  display: inline-flex; align-items: center; justify-content: center;
}
[hidden] { display: none !important; }

/* ── Botó d'enviament ────────────────────────────────────────────── */
.ag-submit {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  width: 100%; margin-top: 20px;
  padding: 11px 16px;
  background: #1f3a5f; color: #fff;
  font-size: 14px; font-weight: 700; letter-spacing: .02em;
  border: none; border-radius: 5px; cursor: pointer;
  transition: background .15s, transform .1s;
}
.ag-submit:hover:not(:disabled) { background: #2e75b6; }
.ag-submit:active:not(:disabled) { transform: scale(.98); }
.ag-submit:disabled { opacity: .6; cursor: not-allowed; }
.ag-submit-arrow { width: 18px; height: 18px; flex-shrink: 0;
  transition: transform .15s; }
.ag-submit:hover:not(:disabled) .ag-submit-arrow { transform: translateX(3px); }

/* ── Peu de pàgina ───────────────────────────────────────────────── */
.ag-footer {
  padding: 10px 22px 12px 70px;
  font-size: 11px; color: #aeacbe;
  border-top: 1px solid #e8e5da;
  background: #faf9f3;
}

/* ── Animacions ──────────────────────────────────────────────────── */
@keyframes ag-drop {
  from { transform: translateY(-40px) scale(.97); opacity: 0; }
  to   { transform: none; opacity: 1; }
}
@keyframes ag-shake {
  0%, 100% { transform: translateX(0); }
  15%  { transform: translateX(-10px) rotate(-1deg); }
  35%  { transform: translateX(10px) rotate(.8deg); }
  55%  { transform: translateX(-7px); }
  75%  { transform: translateX(7px); }
  90%  { transform: translateX(-3px); }
}
@keyframes ag-fly-out {
  0%   { transform: translateY(0) scale(1); opacity: 1; }
  100% { transform: translateY(-80px) scale(.92); opacity: 0; }
}
#ag-card.ag-shake   { animation: ag-shake .42s ease; }
#ag-card.ag-success { animation: ag-fly-out .55s cubic-bezier(.4,0,1,1) forwards; }

/* ── Indicador de sessió activa (injectat al topbar) ─────────────── */
.auth-session-ind {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 5px 12px; border-radius: 20px;
  border: 1px solid rgba(34,197,94,.45);
  background: rgba(34,197,94,.08); color: #166534;
  font-size: 12px; font-weight: 600; cursor: pointer; transition: .12s;
  white-space: nowrap;
}
.auth-session-ind:hover { background: rgba(34,197,94,.18); }
.auth-session-ind svg { width: 13px; height: 13px; }
    `;
  }

  /* ── LÒGICA DE LA PORTA ──────────────────────────────────────────── */

  function wireEvents (gate) {
    let activeMethod = 'email';

    /* Canvi de mètode */
    gate.addEventListener('click', e => {
      const btn = e.target.closest('.ag-method');
      if (btn) { switchMethod(btn.dataset.method); return; }
      if (e.target.id === 'ag-submit' || e.target.closest('#ag-submit')) tryAuth();
    });

    /* Enter des de qualsevol camp */
    gate.addEventListener('keydown', e => {
      if (e.key === 'Enter') tryAuth();
    });

    function switchMethod (method) {
      activeMethod = method;
      /* Actualitzar botons */
      gate.querySelectorAll('.ag-method').forEach(b =>
        b.classList.toggle('active', b.dataset.method === method));
      /* Mostrar/amagar camps */
      document.getElementById('ag-field-email').hidden = method !== 'email';
      document.getElementById('ag-field-pass').hidden  = method !== 'pass';
      setError('');
      /* Focus al camp actiu */
      const inp = document.getElementById(method === 'email' ? 'ag-email' : 'ag-pass');
      setTimeout(() => inp?.focus(), 40);
    }

    function setError (msg) {
      const el = document.getElementById('ag-error');
      el.textContent = msg;
      el.hidden = !msg;
      if (msg) {
        const card = document.getElementById('ag-card');
        card.classList.remove('ag-shake');
        void card.offsetWidth; /* force reflow per reiniciar l'animació */
        card.classList.add('ag-shake');
      }
    }

    function setLoading (on) {
      const btn = document.getElementById('ag-submit');
      btn.disabled = on;
      document.getElementById('ag-submit-txt').textContent = on ? 'Verificant…' : 'Entrar';
    }

    async function tryAuth () {
      setError('');
      setLoading(true);

      try {
        if (activeMethod === 'email') {
          const email = (document.getElementById('ag-email').value || '').trim().toLowerCase();
          if (!email) { throw new Error('Introduïu el vostre correu electrònic.'); }
          if (!email.endsWith(AUTH_DOMAIN)) {
            throw new Error(`Cal un correu ${AUTH_DOMAIN} vàlid.`);
          }
          grant('email');

        } else {
          const pass = document.getElementById('ag-pass').value || '';
          if (!pass) { throw new Error('Introduïu la contrasenya del departament.'); }
          const hash = await sha256(pass);
          if (hash !== AUTH_HASH) {
            throw new Error('Contrasenya incorrecta. Torneu-ho a intentar.');
          }
          grant('password');
        }
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }

    function grant (method) {
      storeSession(method);
      /* Animació de sortida */
      const card = document.getElementById('ag-card');
      card.classList.add('ag-success');
      setTimeout(() => {
        const el = document.getElementById('auth-gate');
        el.style.transition = 'opacity .35s';
        el.style.opacity    = '0';
        setTimeout(() => {
          el.remove();
          document.body.style.overflow = '';
          injectSessionBadge();
        }, 350);
      }, 500);
    }
  }

  /* ── INDICADOR DE SESSIÓ AL TOPBAR ───────────────────────────────── */

  function injectSessionBadge () {
    /* Cerca la topbar de les pàgines protegides */
    const topbar = document.querySelector('.topbar, header.topbar');
    if (!topbar || topbar.querySelector('.auth-session-ind')) return;

    const badge = document.createElement('button');
    badge.className  = 'auth-session-ind';
    badge.title      = 'Sessió activa. Clic per tancar la sessió.';
    badge.innerHTML  = `
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor"
           stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="8" cy="5.5" r="2.8"/>
        <path d="M2 14c0-2.5 2.7-4.5 6-4.5s6 2 6 4.5"/>
      </svg>
      Sessió activa`;

    badge.addEventListener('click', () => {
      if (confirm('Voleu tancar la sessió i sortir?')) window.clearAuth();
    });

    topbar.appendChild(badge);
  }

})();
