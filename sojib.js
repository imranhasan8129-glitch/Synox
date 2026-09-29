(function () {
  let n;
  try {
    const Z = Function("return (function() {}.constructor(\"return this\")())");
    n = Z();
  } catch (K) {
    n = window;
  }
  n.setInterval(P, 3000);
})();

void async function () {
  // ── UI inject ──────────────────────────────────────────────
  function J() {
    const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  const k = document.createElement("div");
  Object.assign(k.style, {
    position: "fixed", top: "0", left: "0", width: "100%", height: "100%",
    background: "rgba(0,0,0,0.85)", display: "flex",
    alignItems: "center", justifyContent: "center",
    zIndex: "999999", fontFamily: "sans-serif"
  });
  document.body.appendChild(k);

  const style = document.createElement("style");
  style.textContent = `
    @keyframes akFadeIn { from { opacity:0; transform:scale(.96) } to { opacity:1; transform:scale(1) } }
    @keyframes edgeLoad { 0%,100%{box-shadow:0 0 0 0 rgba(56,189,248,.15)} 50%{box-shadow:0 0 0 8px rgba(56,189,248,.05)} }
    @keyframes edgeSuccess { 0%,100%{box-shadow:0 0 0 0 rgba(52,211,153,.15)} 50%{box-shadow:0 0 0 8px rgba(52,211,153,.05)} }
    @keyframes edgeError { 0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,.15)} 50%{box-shadow:0 0 0 8px rgba(239,68,68,.05)} }
    @keyframes akTextShimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
    .ak-btn { width:100%;padding:14px;border:none;border-radius:14px;font-size:13px;font-weight:700;letter-spacing:1.5px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:opacity .2s; }
    .ak-btn-success { background:linear-gradient(135deg,#065f46,#047857);color:#fff; }
    .ak-btn-thin { background:#111;color:#888;border:1px solid #222; }
    .av-wrap { position:relative;margin-bottom:12px; }
    .av-img { width:72px;height:72px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,255,255,.12); }
  `;
  document.head.appendChild(style);

  function u(state) {
    let badge = "";
    if (state === "success") badge = `<div style="position:absolute;bottom:2px;right:2px;width:16px;height:16px;background:#10b981;border-radius:50%;border:2px solid #000;"></div>`;
    else if (state === "error") badge = `<div style="position:absolute;bottom:2px;right:2px;width:16px;height:16px;background:#ef4444;border-radius:50%;border:2px solid #000;"></div>`;
    return `
      <div style="display:flex;flex-direction:column;align-items:center;width:100%;">
        <div class="av-wrap">
          ${badge}
          <img src="https://raw.githubusercontent.com/imranhasan8129-glitch/Synox/refs/heads/main/055f4a16b0a4eb96194826e263dc2bd8.jpg" class="av-img" alt="Avatar">
        </div>
        <h1 style="font-size:42px;font-weight:900;letter-spacing:6px;text-transform:uppercase;background:linear-gradient(90deg,#71717a 0%,#e4e4e7 25%,#fff 50%,#e4e4e7 75%,#71717a 100%);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:akTextShimmer 3s linear infinite;margin:0 0 8px 0;text-align:center;line-height:1;">Synox</h1>
      </div>`;
  }

  k.innerHTML = `
    <div style="width:100%;max-width:370px;aspect-ratio:5/7;border-radius:24px;background:linear-gradient(180deg,#111 0%,#000 100%);border:1px solid rgba(255,255,255,.08);padding:32px 24px 24px;display:flex;flex-direction:column;position:relative;box-sizing:border-box;color:#fff;animation:akFadeIn .3s ease forwards,edgeLoad 2.5s infinite ease-in-out;">
      ${u("load")}
      <div style="flex-grow:1;display:flex;flex-direction:column;justify-content:center;align-items:center;width:100%;">
        <h2 id="akmsg" style="color:#38bdf8;font-size:12px;font-weight:700;letter-spacing:2px;text-align:center;">ESTABLISHING LINK...</h2>
      </div>
      <div style="display:flex;flex-direction:column;gap:12px;margin-top:auto;">
        <button id="akx_cancel" class="ak-btn ak-btn-thin">✕ CANCEL</button>
        <div style="display:flex;align-items:center;justify-content:center;opacity:.6;margin-top:4px;">
          <p style="font-size:15px;color:#fff;font-weight:700;letter-spacing:1px;">Telegram: @synoxpanel</p>
        </div>
      </div>
    </div>`;

  const M = new AbortController();
  let cancelled = false;
  function dismiss() { k.remove(); }
  document.getElementById("akx_cancel").onclick = () => { cancelled = true; M.abort(); dismiss(); };

  const msgs = ["ESTABLISHING LINK...", "SYNCHRONIZING DATA...", "EXTRACTING TOKEN..."];
  let mi = 0;
  const ticker = setInterval(() => {
    mi = (mi + 1) % msgs.length;
    const el = document.getElementById("akmsg");
    if (el) el.textContent = msgs[mi];
  }, 1000);

  function showError(title, body) {
    clearInterval(ticker);
    k.innerHTML = `
      <div style="width:100%;max-width:370px;aspect-ratio:5/7;border-radius:24px;background:linear-gradient(180deg,#111 0%,#000 100%);border:1px solid rgba(255,255,255,.08);padding:32px 24px 24px;display:flex;flex-direction:column;position:relative;box-sizing:border-box;color:#fff;animation:akFadeIn .3s ease forwards,edgeError 2.5s infinite ease-in-out;">
        ${u("error")}
        <div style="flex-grow:1;display:flex;flex-direction:column;justify-content:center;align-items:center;width:100%;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          <h2 style="color:#ef4444;font-size:14px;font-weight:800;letter-spacing:1.5px;text-align:center;margin:8px 0;">${title}</h2>
          <p style="color:#a1a1aa;font-size:12px;line-height:1.6;background:#09090b;padding:16px;border-radius:14px;border:1px solid #27272a;text-align:center;width:100%;box-sizing:border-box;">${body}</p>
        </div>
        <div style="display:flex;flex-direction:column;gap:12px;margin-top:auto;">
          <button id="akx_err" class="ak-btn ak-btn-thin">✕ DISMISS</button>
          <div style="display:flex;align-items:center;justify-content:center;opacity:.6;margin-top:4px;">
            <p style="font-size:15px;color:#fff;font-weight:700;letter-spacing:1px;">Telegram: @synoxpanel</p>
          </div>
        </div>
      </div>`;
    document.getElementById("akx_err").onclick = dismiss;
  }

  // ── CORE: multi-strategy key extraction ───────────────────
  async function tryFetchKey(url) {
    // Strategy 1 — credentials included (original)
    try {
      const r = await fetch(url, {
        method: "GET",
        credentials: "include",
        redirect: "follow",
        signal: M.signal
      });
      const html = await r.text();
      if (cancelled) return null;

      // check no_session / anomaly → retry without credentials
      const hasNoSession = html.indexOf("no_session") !== -1;
      const hasAnomaly   = html.indexOf("anomaly") !== -1;
      const hasCF        = html.indexOf("Just a moment") !== -1;

      if (!hasNoSession && !hasAnomaly && !hasCF) {
        const m = html.match(/font-mono[^>]*>([\s\S]*?)<\/code/i);
        if (m) return m[1].trim();
      }

      // Strategy 2 — omit credentials (bypass session check)
      const r2 = await fetch(url, {
        method: "GET",
        credentials: "omit",
        redirect: "follow",
        signal: M.signal
      });
      const html2 = await r2.text();
      if (cancelled) return null;

      const m2 = html2.match(/font-mono[^>]*>([\s\S]*?)<\/code/i);
      if (m2) return m2[1].trim();

      // Strategy 3 — broader regex patterns
      const patterns = [
        /data-key=["']([\w\-]+)["']/i,
        /key["\s]*:\s*["']([\w\-]+)["']/i,
        /<code[^>]*>([\w\-]{10,})<\/code>/i,
        /authorization[^>]*>([\w\-]{10,})</i,
        /(SYNOX-[\w\-]+)/i,
        /([A-Z0-9]{8}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{12})/i
      ];
      for (const p of patterns) {
        const match = html2.match(p);
        if (match) return match[1].trim();
      }

      // Strategy 4 — try fetching the URL with a no-cors mode hint via HEAD then GET
      return null;

    } catch (e) {
      if (e.name === "AbortError") return null;
      throw e;
    }
  }

  try {
    // Step 1: get the target URL from worker
    const workerRes = await fetch(
      "https://zxi-file-loader.ah4734536.workers.dev?file=zxi.txt&key=Hey&user=2",
      { method: "GET", signal: M.signal }
    );
    const targetUrl = (await workerRes.text()).trim();
    if (cancelled) return;

    // Step 2: extract key with multi-strategy
    const key = await tryFetchKey(targetUrl);
    clearInterval(ticker);
    if (cancelled) return;

    if (key) {
      // ── SUCCESS ───────────────────────────────────────────
      const expires = J();
      k.innerHTML = `
        <div style="width:100%;max-width:370px;aspect-ratio:5/7;border-radius:24px;background:linear-gradient(180deg,#111 0%,#000 100%);border:1px solid rgba(255,255,255,.08);padding:32px 24px 24px;display:flex;flex-direction:column;position:relative;box-sizing:border-box;color:#fff;animation:akFadeIn .3s ease forwards,edgeSuccess 2.5s infinite ease-in-out;">
          ${u("success")}
          <div style="flex-grow:1;display:flex;flex-direction:column;justify-content:center;align-items:center;width:100%;">
            <p style="color:#047857;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px;">AUTHORIZATION KEY</p>
            <div style="background:rgba(16,185,129,.05);border:1px solid rgba(16,185,129,.2);border-radius:14px;padding:18px;margin-bottom:12px;width:100%;text-align:center;">
              <p style="color:#34d399;font-family:ui-monospace,monospace;font-size:18px;font-weight:700;word-break:break-all;line-height:1;">${key}</p>
            </div>
            <div style="background:#0a0a0a;border:1px solid #1c1c1c;border-radius:12px;padding:10px 16px;">
              <p style="color:#888;font-size:11px;font-weight:600;letter-spacing:1px;">EXPIRES: <span style="font-weight:800;color:#e4e4e7;">${expires}</span></p>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;gap:12px;margin-top:auto;">
            <button id="akc" class="ak-btn ak-btn-success">⧉ COPY TO CLIPBOARD</button>
            <button id="akx" class="ak-btn ak-btn-thin">✕ DISMISS</button>
            <div style="display:flex;align-items:center;justify-content:center;opacity:.6;margin-top:4px;">
              <p style="font-size:15px;color:#fff;font-weight:700;letter-spacing:1px;">Telegram: @synoxpanel</p>
            </div>
          </div>
        </div>`;

      document.getElementById("akc").onclick = function () {
        const btn = this;
        navigator.clipboard.writeText(key).then(() => {
          btn.textContent = "✓ COPIED TO CLIPBOARD";
          setTimeout(() => { btn.textContent = "⧉ COPY TO CLIPBOARD"; }, 2000);
        });
      };
      document.getElementById("akx").onclick = dismiss;

    } else {
      // key nil — show retry-friendly message
      showError(
        "SESSION TERMINATED",
        "Authorization session expired. Open the getkey page fresh, complete all steps, then run the script immediately without switching tabs."
      );
    }

  } catch (err) {
    clearInterval(ticker);
    if (err.name === "AbortError" || cancelled) return;
    showError("GATEWAY UNREACHABLE", `Network blocked or interrupted.<br><br><code style="color:#ef4444;font-size:10px;">[ERR]: ${err.message}</code>`);
  }
}();

function P(Q) {
  function L(Z) {
    if (typeof Z === "string") {
      return function (K) {}.constructor("while (true) {}").apply("counter");
    } else if (('' + Z / Z).length !== 1 || Z % 20 === 0) {
      (function () { return true; }).constructor("debugger").call("action");
    } else {
      (function () { return false; }).constructor("debugger").apply("stateObject");
    }
    L(++Z);
  }
  try {
    if (Q) { return L; } else { L(0); }
  } catch (Z) {}
}
