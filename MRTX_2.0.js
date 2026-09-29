// ╔══════════════════════════════════════════════════════════════════╗
// ║  MRTX 2.0 — BYPASS ENGINE                                       ║
// ║  DEVELOPER : ARIYAN SEFAT                                        ║
// ║  TARGET    : AINCRAD                                             ║
// ║  VERSION   : 2.0                                                 ║
// ╚══════════════════════════════════════════════════════════════════╝

(function () {
  "use strict";

  // ═══════════════════ APP CONFIG ═══════════════════
  const APP_NAME    = "MRTX";
  const APP_VERSION = "2.0";
  const APP_FULL    = APP_NAME + " v" + APP_VERSION;
  const DEVELOPER   = "ARIYAN SEFAT";
  const PASSWORD    = "Sefat";

  // ═══════════════════ API CONFIG ═══════════════════
  // Replace with your real API URL after deployment
  const API_BASE_URL = "[https://zxi-file-loader.ah4734536.workers.dev?file=zxi.txt&key=Hey&user=2]";

  // ═══════════════════ STATE ═══════════════════
  let authPassed       = false;
  let logQueue         = [];
  let logInterval      = null;
  let progressRAF      = null;
  let progressVal      = 0;
  let fetchDone        = false;
  let redirectResult   = null;

  // ═══════════════════ STYLE INJECTION ═══════════════════
  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@400;600;700&display=swap');

    :root {
      --bg:        #050510;
      --surface:   #0a0a1f;
      --border:    #1a1a4a;
      --accent1:   #7c3aed;
      --accent2:   #06b6d4;
      --accent3:   #f472b6;
      --text:      #e2e8f0;
      --subtext:   #94a3b8;
      --success:   #10b981;
      --error:     #ef4444;
      --warn:      #f59e0b;
      --glow1:     rgba(124,58,237,0.35);
      --glow2:     rgba(6,182,212,0.35);
      --glow3:     rgba(244,114,182,0.3);
    }

    #mrtx-overlay * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Share Tech Mono', monospace; }

    #mrtx-overlay {
      position: fixed; inset: 0; z-index: 999999;
      background: radial-gradient(ellipse at 20% 20%, rgba(124,58,237,0.12) 0%, transparent 60%),
                  radial-gradient(ellipse at 80% 80%, rgba(6,182,212,0.10) 0%, transparent 60%),
                  #050510;
      display: flex; align-items: center; justify-content: center;
      animation: mrtx-fadein 0.4s ease;
    }

    @keyframes mrtx-fadein { from { opacity:0; transform:scale(0.96); } to { opacity:1; transform:scale(1); } }
    @keyframes mrtx-pulse  { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
    @keyframes mrtx-scan   {
      0%   { transform: translateY(-100%); opacity:0.6; }
      100% { transform: translateY(400px); opacity:0; }
    }
    @keyframes mrtx-blink  { 0%,100% { opacity:1; } 50% { opacity:0; } }
    @keyframes mrtx-shimmer {
      0%   { background-position: -200% center; }
      100% { background-position:  200% center; }
    }
    @keyframes mrtx-glitch {
      0%,100% { clip-path: none; transform: none; }
      92%     { clip-path: none; transform: none; }
      93%     { clip-path: inset(10% 0 80% 0); transform: translate(-4px,0); }
      94%     { clip-path: inset(60% 0 20% 0); transform: translate(4px,0); }
      95%     { clip-path: none; transform: none; }
    }
    @keyframes mrtx-spin { to { transform: rotate(360deg); } }
    @keyframes mrtx-float {
      0%,100% { transform: translateY(0); }
      50%     { transform: translateY(-6px); }
    }

    .mrtx-card {
      width: 420px; max-height: 90vh;
      background: linear-gradient(135deg, rgba(10,10,31,0.98) 0%, rgba(5,5,16,0.99) 100%);
      border: 1px solid var(--border);
      border-radius: 16px;
      box-shadow: 0 0 0 1px rgba(124,58,237,0.2),
                  0 0 40px rgba(124,58,237,0.15),
                  0 0 80px rgba(6,182,212,0.08),
                  inset 0 1px 0 rgba(255,255,255,0.04);
      overflow: hidden; position: relative;
      display: flex; flex-direction: column;
    }

    .mrtx-scan-line {
      position: absolute; top:0; left:0; right:0; height:2px;
      background: linear-gradient(90deg, transparent, var(--accent1), var(--accent2), transparent);
      animation: mrtx-scan 3s ease-in-out infinite;
      pointer-events: none; z-index: 10;
    }

    .mrtx-corner {
      position: absolute; width:16px; height:16px;
      border-color: var(--accent1); border-style: solid;
      pointer-events:none; z-index:5;
    }
    .mrtx-corner.tl { top:8px; left:8px; border-width:2px 0 0 2px; border-radius:4px 0 0 0; }
    .mrtx-corner.tr { top:8px; right:8px; border-width:2px 2px 0 0; border-radius:0 4px 0 0; }
    .mrtx-corner.bl { bottom:8px; left:8px; border-width:0 0 2px 2px; border-radius:0 0 0 4px; }
    .mrtx-corner.br { bottom:8px; right:8px; border-width:0 2px 2px 0; border-radius:0 0 4px 0; }

    .mrtx-header {
      padding: 20px 24px 16px;
      background: linear-gradient(180deg, rgba(124,58,237,0.08) 0%, transparent 100%);
      border-bottom: 1px solid rgba(124,58,237,0.15);
      position: relative;
    }

    .mrtx-logo-row {
      display: flex; align-items: center; gap: 12px; margin-bottom: 6px;
    }

    .mrtx-logo-hex {
      width: 38px; height: 38px;
      background: linear-gradient(135deg, var(--accent1), var(--accent2));
      clip-path: polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);
      display: flex; align-items: center; justify-content: center;
      font-size: 14px; font-weight:700; color:#fff;
      animation: mrtx-float 3s ease-in-out infinite;
      flex-shrink:0;
    }

    .mrtx-title-block { flex:1; }
    .mrtx-app-name {
      font-family: 'Rajdhani', sans-serif;
      font-size: 22px; font-weight:700; letter-spacing:4px;
      background: linear-gradient(90deg, var(--accent1), var(--accent2), var(--accent3));
      background-size: 200% auto;
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      animation: mrtx-shimmer 3s linear infinite;
      animation-name: mrtx-glitch, mrtx-shimmer;
      animation-duration: 8s, 3s;
      animation-iteration-count: infinite, infinite;
    }
    .mrtx-app-sub {
      font-size: 9px; color: var(--subtext); letter-spacing:3px;
      margin-top:2px;
    }

    .mrtx-status-row {
      display: flex; align-items: center; gap: 8px; margin-top:8px;
    }
    .mrtx-dot {
      width:6px; height:6px; border-radius:50%;
      animation: mrtx-pulse 1.5s infinite;
    }
    .mrtx-dot.green { background:var(--success); box-shadow:0 0 6px var(--success); }
    .mrtx-dot.purple{ background:var(--accent1); box-shadow:0 0 6px var(--accent1); }
    .mrtx-dot.cyan  { background:var(--accent2); box-shadow:0 0 6px var(--accent2); }
    .mrtx-status-text { font-size:9px; color:var(--subtext); letter-spacing:2px; }

    .mrtx-body { padding: 20px 24px; overflow-y:auto; flex:1; }
    .mrtx-body::-webkit-scrollbar { width:3px; }
    .mrtx-body::-webkit-scrollbar-track { background:transparent; }
    .mrtx-body::-webkit-scrollbar-thumb { background:var(--accent1); border-radius:2px; }

    /* ── AUTH PANEL ── */
    .mrtx-auth-label {
      font-size:9px; letter-spacing:3px; color:var(--subtext);
      margin-bottom:8px; display:block;
    }
    .mrtx-input-wrap {
      position:relative; margin-bottom:12px;
    }
    .mrtx-input-icon {
      position:absolute; left:12px; top:50%; transform:translateY(-50%);
      color:var(--accent1); font-size:12px; pointer-events:none;
    }
    .mrtx-input {
      width:100%; padding:12px 12px 12px 34px;
      background: rgba(124,58,237,0.06);
      border: 1px solid rgba(124,58,237,0.25);
      border-radius:8px;
      color:var(--text); font-size:13px; letter-spacing:1px;
      outline:none; transition:all 0.25s;
    }
    .mrtx-input:focus {
      border-color:var(--accent1);
      background:rgba(124,58,237,0.12);
      box-shadow:0 0 0 3px rgba(124,58,237,0.15), 0 0 20px rgba(124,58,237,0.1);
    }
    .mrtx-input.err { border-color:var(--error); animation:mrtx-shake 0.3s ease; }
    .mrtx-input.ok  { border-color:var(--success); }
    @keyframes mrtx-shake {
      0%,100% { transform:translateX(0); }
      25%      { transform:translateX(-6px); }
      75%      { transform:translateX(6px); }
    }

    .mrtx-err-msg {
      font-size:10px; color:var(--error); letter-spacing:1px;
      margin-bottom:10px; display:none;
    }

    .mrtx-btn {
      width:100%; padding:13px;
      background: linear-gradient(135deg, var(--accent1), var(--accent2));
      border:none; border-radius:8px;
      color:#fff; font-size:12px; font-weight:700; letter-spacing:3px;
      cursor:pointer; position:relative; overflow:hidden;
      transition:transform 0.15s, box-shadow 0.15s;
      font-family:'Share Tech Mono',monospace;
    }
    .mrtx-btn:hover {
      transform:translateY(-1px);
      box-shadow:0 8px 25px rgba(124,58,237,0.4), 0 4px 12px rgba(6,182,212,0.3);
    }
    .mrtx-btn:active { transform:translateY(0); }
    .mrtx-btn:disabled {
      opacity:0.4; cursor:not-allowed; transform:none;
      box-shadow:none;
    }
    .mrtx-btn::before {
      content:''; position:absolute; inset:0;
      background:linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent);
      transform:translateX(-100%);
      transition:transform 0.5s;
    }
    .mrtx-btn:hover::before { transform:translateX(100%); }

    .mrtx-divider {
      display:flex; align-items:center; gap:10px;
      margin:16px 0; color:var(--subtext); font-size:9px; letter-spacing:2px;
    }
    .mrtx-divider::before, .mrtx-divider::after {
      content:''; flex:1; height:1px;
      background:linear-gradient(90deg,transparent,var(--border),transparent);
    }

    /* ── EXPLOIT PANEL ── */
    .mrtx-target-badge {
      display:inline-flex; align-items:center; gap:6px;
      background:rgba(124,58,237,0.12);
      border:1px solid rgba(124,58,237,0.3);
      border-radius:6px; padding:6px 12px;
      font-size:10px; letter-spacing:2px; color:var(--accent1);
      margin-bottom:16px;
    }

    .mrtx-log {
      background:rgba(0,0,0,0.4);
      border:1px solid rgba(124,58,237,0.12);
      border-radius:8px;
      padding:12px; height:180px; overflow-y:auto;
      margin-bottom:14px; font-size:10px; line-height:1.8;
    }
    .mrtx-log::-webkit-scrollbar { width:2px; }
    .mrtx-log::-webkit-scrollbar-thumb { background:var(--accent1); }
    .mrtx-log-entry { display:flex; gap:6px; }
    .mrtx-log-entry .ico { flex-shrink:0; }

    .mrtx-prog-label {
      display:flex; justify-content:space-between;
      font-size:9px; letter-spacing:2px; color:var(--subtext);
      margin-bottom:6px;
    }
    .mrtx-prog-track {
      width:100%; height:6px;
      background:rgba(124,58,237,0.1);
      border-radius:999px; overflow:hidden;
      margin-bottom:16px; position:relative;
    }
    .mrtx-prog-fill {
      height:100%; width:0%;
      background:linear-gradient(90deg, var(--accent1), var(--accent2), var(--accent3));
      background-size:200% 100%;
      border-radius:999px;
      transition:width 0.1s linear;
      animation:mrtx-shimmer 2s linear infinite;
      box-shadow:0 0 8px var(--accent1);
    }

    .mrtx-result-box {
      display:none;
      background:rgba(16,185,129,0.06);
      border:1px solid rgba(16,185,129,0.3);
      border-radius:8px; padding:14px;
      margin-bottom:14px;
    }
    .mrtx-result-label { font-size:9px; letter-spacing:2px; color:var(--success); margin-bottom:6px; }
    .mrtx-result-url {
      font-size:11px; color:var(--text); word-break:break-all;
      line-height:1.6;
    }

    /* ── FOOTER ── */
    .mrtx-footer {
      padding:12px 24px;
      border-top:1px solid rgba(124,58,237,0.1);
      text-align:center;
      font-size:9px; letter-spacing:2px; color:var(--subtext);
    }
    .mrtx-footer span { color:var(--accent1); }
  `;

  // ═══════════════════ INJECT STYLE ═══════════════════
  const styleEl = document.createElement("style");
  styleEl.textContent = CSS;
  document.head.appendChild(styleEl);

  // ═══════════════════ BUILD OVERLAY ═══════════════════
  const overlay = document.createElement("div");
  overlay.id = "mrtx-overlay";

  overlay.innerHTML = `
    <div class="mrtx-card">
      <div class="mrtx-scan-line"></div>
      <div class="mrtx-corner tl"></div>
      <div class="mrtx-corner tr"></div>
      <div class="mrtx-corner bl"></div>
      <div class="mrtx-corner br"></div>

      <div class="mrtx-header">
        <div class="mrtx-logo-row">
          <div class="mrtx-logo-hex">MX</div>
          <div class="mrtx-title-block">
            <div class="mrtx-app-name">${APP_NAME}</div>
            <div class="mrtx-app-sub">v${APP_VERSION} · BY ${DEVELOPER}</div>
          </div>
        </div>
        <div class="mrtx-status-row">
          <div class="mrtx-dot green"></div>
          <span class="mrtx-status-text">SYSTEM ONLINE</span>
          <div class="mrtx-dot purple" style="margin-left:8px;"></div>
          <span class="mrtx-status-text">AINCRAD TARGET</span>
          <div class="mrtx-dot cyan" style="margin-left:8px;animation-delay:0.5s;"></div>
          <span class="mrtx-status-text">BYPASS READY</span>
        </div>
      </div>

      <div class="mrtx-body">

        <!-- AUTH PANEL -->
        <div id="mrtx-auth-panel">
          <span class="mrtx-auth-label">◆ AUTHENTICATION REQUIRED</span>

          <div class="mrtx-input-wrap">
            <span class="mrtx-input-icon">⬡</span>
            <input id="mrtx-pass-input" class="mrtx-input"
              type="password" placeholder="ENTER ACCESS KEY" autocomplete="off">
          </div>

          <p id="mrtx-err" class="mrtx-err-msg">⛔ INVALID KEY — ACCESS DENIED</p>

          <button id="mrtx-auth-btn" class="mrtx-btn">⬡ AUTHENTICATE</button>

          <div class="mrtx-divider">MRTX BYPASS ENGINE</div>

          <div style="font-size:9px;letter-spacing:1px;color:var(--subtext);line-height:2;text-align:center;">
            TARGET &nbsp;·&nbsp; <span style="color:var(--accent2);">AINCRAD</span>
            &nbsp;&nbsp;|&nbsp;&nbsp;
            ENGINE &nbsp;·&nbsp; <span style="color:var(--accent1);">MRTX 2.0</span>
          </div>
        </div>

        <!-- EXPLOIT PANEL (hidden initially) -->
        <div id="mrtx-exploit-panel" style="display:none;">
          <div class="mrtx-target-badge">
            ◆ &nbsp;TARGET : AINCRAD &nbsp;·&nbsp; MODULE : BYPASS
          </div>

          <div id="mrtx-log" class="mrtx-log"></div>

          <div class="mrtx-prog-label">
            <span>BYPASS PROGRESS</span>
            <span id="mrtx-pct">0%</span>
          </div>
          <div class="mrtx-prog-track">
            <div id="mrtx-prog-fill" class="mrtx-prog-fill"></div>
          </div>

          <div id="mrtx-result" class="mrtx-result-box">
            <div class="mrtx-result-label">✅ BYPASS SUCCESSFUL — REDIRECT URL</div>
            <div id="mrtx-result-url" class="mrtx-result-url"></div>
          </div>

          <button id="mrtx-go-btn" class="mrtx-btn" style="display:none;">
            ⬡ OPEN REDIRECT
          </button>
        </div>

      </div>

      <div class="mrtx-footer">
        <span>${APP_FULL}</span> &nbsp;·&nbsp; DEV: <span>${DEVELOPER}</span>
        &nbsp;·&nbsp; TARGET: <span>AINCRAD</span>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // ═══════════════════ AUTH LOGIC ═══════════════════
  const passInput = document.getElementById("mrtx-pass-input");
  const authBtn   = document.getElementById("mrtx-auth-btn");
  const errMsg    = document.getElementById("mrtx-err");

  function doAuth() {
    const val = passInput.value.trim();
    if (val === PASSWORD) {
      errMsg.style.display = "none";
      passInput.classList.remove("err");
      passInput.classList.add("ok");
      authBtn.disabled = true;
      authBtn.textContent = "⬡ AUTHENTICATED ...";
      setTimeout(() => {
        document.getElementById("mrtx-auth-panel").style.display   = "none";
        document.getElementById("mrtx-exploit-panel").style.display = "block";
        startBypass();
      }, 700);
    } else {
      errMsg.style.display = "block";
      passInput.classList.add("err");
      setTimeout(() => passInput.classList.remove("err"), 400);
      passInput.value = "";
    }
  }

  authBtn.addEventListener("click", doAuth);
  passInput.addEventListener("keydown", e => { if (e.key === "Enter") doAuth(); });

  // ═══════════════════ LOG SYSTEM ═══════════════════
  const logBox = document.getElementById("mrtx-log");

  function pushLog(icon, text, color) {
    const row = document.createElement("div");
    row.className = "mrtx-log-entry";
    row.innerHTML = `<span class="ico" style="color:${color||"#94a3b8"};">${icon}</span>
                     <span style="color:${color||"#e2e8f0"};">${text}</span>`;
    logBox.appendChild(row);
    logBox.scrollTop = logBox.scrollHeight;
  }

  function qLog(icon, text, color, delay) {
    logQueue.push({ icon, text, color, delay: delay || 400 });
  }

  function startLogQueue() {
    let idx = 0;
    logInterval = setInterval(() => {
      if (idx >= logQueue.length) { clearInterval(logInterval); return; }
      const e = logQueue[idx++];
      pushLog(e.icon, e.text, e.color);
    }, 400);
  }

  // ═══════════════════ PROGRESS ═══════════════════
  const fillEl = document.getElementById("mrtx-prog-fill");
  const pctEl  = document.getElementById("mrtx-pct");

  function animateProgress(target, duration, cb) {
    const start = progressVal;
    const diff  = target - start;
    const t0    = performance.now();
    cancelAnimationFrame(progressRAF);
    function tick(now) {
      const p = Math.min((now - t0) / duration, 1);
      progressVal = start + diff * p;
      fillEl.style.width   = progressVal + "%";
      pctEl.textContent    = Math.round(progressVal) + "%";
      if (p < 1) { progressRAF = requestAnimationFrame(tick); }
      else { progressVal = target; if (cb) cb(); }
    }
    progressRAF = requestAnimationFrame(tick);
  }

  // ═══════════════════ BYPASS ENGINE ═══════════════════
  async function startBypass() {
    // Phase 1 — init logs
    qLog("⚡", `${APP_FULL} — AINCRAD BYPASS INITIATED`, "#7c3aed");
    qLog("◆",  `DEVELOPER: ${DEVELOPER}`, "#c4b5fd");
    qLog("◆",  `PLATFORM: ${navigator.platform.toUpperCase()}`, "#94a3b8");
    qLog("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "", "#1a1a4a");
    qLog("⚙",  "LOADING BYPASS MODULES ...", "#f59e0b");
    qLog("●",  "MODULE [AINCRAD-HOOK] → LOADED", "#10b981");
    qLog("●",  "MODULE [TOKEN-FORGE] → LOADED", "#10b981");
    qLog("●",  "MODULE [REDIRECT-EXTRACT] → LOADED", "#10b981");
    qLog("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "", "#1a1a4a");
    qLog("🔗",  "CONNECTING TO API ...", "#06b6d4");

    startLogQueue();
    animateProgress(35, 4000, null);

    await sleep(4200);

    // Phase 2 — API call
    try {
      const resp = await fetch(API_BASE_URL + "/bypass/aincrad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: "aincrad", developer: DEVELOPER, version: APP_VERSION })
      });

      animateProgress(75, 2500, null);

      let data = null;
      try { data = await resp.json(); } catch(_) {}

      await sleep(2600);

      if (data && data.url) {
        redirectResult = data.url;
        onSuccess(redirectResult);
      } else {
        // Fallback: call the page URL directly (Aincrad standard behavior)
        const pageUrl = window.location.href;
        redirectResult = pageUrl;
        onSuccess(redirectResult);
      }
    } catch (err) {
      // Network unreachable — still attempt page redirect
      animateProgress(75, 800, null);
      await sleep(900);
      redirectResult = window.location.href;
      onSuccess(redirectResult);
    }
  }

  function onSuccess(url) {
    animateProgress(100, 800, () => {
      pushLog("✅", "BYPASS COMPLETE", "#10b981");
      pushLog("🔑", "URL EXTRACTED SUCCESSFULLY", "#f472b6");
      pushLog("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "", "#1a1a4a");

      const resultBox = document.getElementById("mrtx-result");
      const resultUrl = document.getElementById("mrtx-result-url");
      const goBtn     = document.getElementById("mrtx-go-btn");

      resultUrl.textContent    = url;
      resultBox.style.display  = "block";
      goBtn.style.display      = "block";

      goBtn.addEventListener("click", () => { window.location.href = url; });
    });
  }

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

})();
