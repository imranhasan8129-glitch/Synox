void async function () {

  // ── UI Inject ──────────────────────────────────────────
  const k = document.createElement("div");
  k.id = "synox-overlay";
  k.style.cssText = `
    position:fixed;top:0;left:0;width:100%;height:100%;
    background:rgba(0,0,0,0.85);display:flex;align-items:center;
    justify-content:center;z-index:999999;font-family:ui-monospace,monospace;
  `;

  const style = document.createElement("style");
  style.textContent = `
    @keyframes akFadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
    @keyframes edgeLoad {
      0%,100% { box-shadow: inset 0 1px 1px rgba(255,255,255,0.05), 0 0 60px rgba(0,0,0,0.9), 0 0 0 1px rgba(56,189,248,0); }
      50% { box-shadow: inset 0 1px 1px rgba(255,255,255,0.05), 0 0 60px rgba(0,0,0,0.9), 0 0 16px 2px rgba(56,189,248,0.18); }
    }
    @keyframes edgeSuccess {
      0%,100% { box-shadow: 0 0 0 1px rgba(16,185,129,0); }
      50% { box-shadow: 0 0 20px 2px rgba(16,185,129,0.2); }
    }
    @keyframes edgeError {
      0%,100% { box-shadow: 0 0 0 1px rgba(239,68,68,0); }
      50% { box-shadow: 0 0 20px 2px rgba(239,68,68,0.2); }
    }
    @keyframes akTextShimmer {
      0% { background-position: 200% center; }
      100% { background-position: -200% center; }
    }
    .ak-btn {
      width:100%;padding:12px;border-radius:12px;border:none;
      cursor:pointer;font-family:ui-monospace,monospace;font-size:12px;
      font-weight:700;letter-spacing:1.5px;display:flex;align-items:center;
      justify-content:center;gap:8px;transition:opacity 0.2s;
    }
    .ak-btn:hover { opacity:0.85; }
    .ak-btn-success { background:linear-gradient(135deg,#059669,#047857); color:#fff; }
    .ak-btn-thin { background:#111;color:#71717a;border:1px solid #27272a; }
  `;
  document.head.appendChild(style);
  document.body.appendChild(k);

  // ── Avatar / Header ─────────────────────────────────────
  function u(state) {
    const colors = {
      load: "#38bdf8", success: "#10b981", error: "#ef4444"
    };
    const c = colors[state] || "#38bdf8";
    const ring = `
      <div style="position:absolute;top:-2px;left:-2px;right:-2px;bottom:-2px;
        border-radius:50%;border:2px solid ${c};opacity:0.6;"></div>
    `;
    return `
      <div style="display:flex;flex-direction:column;align-items:center;width:100%;">
        <div style="position:relative;width:72px;height:72px;margin-bottom:16px;">
          ${ring}
          <img src="https://raw.githubusercontent.com/imranhasan8129-glitch/Synox/refs/heads/main/055f4a16b0a4eb96194826e263dc2bd8.jpg"
            style="width:72px;height:72px;border-radius:50%;object-fit:cover;display:block;" alt="Avatar">
        </div>
        <h1 style="font-size:42px;font-weight:900;letter-spacing:6px;text-transform:uppercase;
          background:linear-gradient(90deg,#71717a 0%,#e4e4e7 25%,#ffffff 50%,#e4e4e7 75%,#71717a 100%);
          background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;
          animation:akTextShimmer 3s linear infinite;margin:0 0 8px 0;text-align:center;line-height:1;">
          Synox
        </h1>
      </div>
    `;
  }

  // ── Expiry Time ─────────────────────────────────────────
  function J() {
    const d = new Date();
    d.setHours(d.getHours() + 24);
    return d.toLocaleString("en-US", {
      month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  }

  // ── Loading UI ──────────────────────────────────────────
  k.innerHTML = `
    <div style="width:100%;max-width:370px;aspect-ratio:5/7;border-radius:24px;
      background:linear-gradient(180deg,#111111 0%,#000000 100%);
      border:1px solid rgba(255,255,255,0.08);padding:32px 24px 24px;
      display:flex;flex-direction:column;position:relative;
      box-sizing:border-box;color:#fff;
      animation:akFadeIn 0.3s ease forwards,edgeLoad 2.5s infinite ease-in-out;">
      ${u("load")}
      <div style="flex-grow:1;display:flex;flex-direction:column;
        justify-content:center;align-items:center;width:100%;">
        <h2 id="akmsg" style="color:#38bdf8;font-size:12px;font-weight:700;
          letter-spacing:2px;text-align:center;">ESTABLISHING LINK...</h2>
      </div>
      <div style="display:flex;flex-direction:column;gap:12px;margin-top:auto;">
        <button id="akx_cancel" class="ak-btn ak-btn-thin">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
          CANCEL
        </button>
        <div style="display:flex;align-items:center;justify-content:center;opacity:0.6;margin-top:4px;">
          <p style="font-size:15px;color:#fff;font-weight:700;letter-spacing:1px;">
            Telegram: @synoxpanel
          </p>
        </div>
      </div>
    </div>
  `;

  // ── Abort + Cancel ──────────────────────────────────────
  const M = new AbortController();
  let cancelled = false;

  function closeUI() { k.remove(); }

  document.getElementById("akx_cancel").onclick = function () {
    cancelled = true;
    M.abort();
    closeUI();
  };

  // ── Loading Text Loop ───────────────────────────────────
  const msgs = ["ESTABLISHING LINK...", "SYNCHRONIZING DATA...", "EXTRACTING TOKEN..."];
  let mi = 0;
  const ticker = setInterval(() => {
    mi = (mi + 1) % msgs.length;
    const el = document.getElementById("akmsg");
    if (el) el.textContent = msgs[mi];
  }, 1000);

  // ── Main Fetch Logic ────────────────────────────────────
  try {

    // Step 1: Worker theke target URL nao
    const workerRes = await fetch(
      "https://zxi-file-loader.ah4734536.workers.dev?file=zxi.txt&key=",
      { signal: M.signal }
    );
    const targetURL = (await workerRes.text()).trim();

    if (cancelled) return;

    // Step 2: Target page fetch — cookies + proper headers
    const pageRes = await fetch(targetURL, {
      method: "GET",
      credentials: "include",
      redirect: "follow",
      signal: M.signal,
      headers: {
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Referer": "https://aincradmods.com/",
        "User-Agent": navigator.userAgent
      }
    });

    const html = await pageRes.text();
    clearInterval(ticker);

    if (cancelled) return;

    // Step 3: Token extract
    const match = html.match(/font-mono[^>]*>([\s\S]*?)<\/code/i);
    const token = match ? match[1].trim() : null;

    // ── Success ─────────────────────────────────────────
    if (token) {
      const expiry = J();
      k.innerHTML = `
        <div style="width:100%;max-width:370px;aspect-ratio:5/7;border-radius:24px;
          background:linear-gradient(180deg,#111111 0%,#000000 100%);
          border:1px solid rgba(255,255,255,0.08);padding:32px 24px 24px;
          display:flex;flex-direction:column;position:relative;
          box-sizing:border-box;color:#fff;
          animation:akFadeIn 0.3s ease forwards,edgeSuccess 2.5s infinite ease-in-out;">
          ${u("success")}
          <div style="flex-grow:1;display:flex;flex-direction:column;
            justify-content:center;align-items:center;width:100%;">
            <p style="color:#047857;font-size:11px;font-weight:800;
              text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px;">
              AUTHORIZATION KEY
            </p>
            <div style="background:rgba(16,185,129,0.05);border:1px solid rgba(16,185,129,0.2);
              border-radius:14px;padding:18px;margin-bottom:12px;width:100%;
              text-align:center;box-sizing:border-box;">
              <p style="color:#34d399;font-family:ui-monospace,monospace;font-size:18px;
                font-weight:700;word-break:break-all;line-height:1.3;">${token}</p>
            </div>
            <div style="background:#0a0a0a;border:1px solid #1c1c1c;border-radius:12px;
              padding:10px 16px;display:flex;align-items:center;justify-content:center;">
              <p style="color:#888;font-size:11px;font-weight:600;letter-spacing:1px;">
                EXPIRES: <span style="font-weight:800;color:#e4e4e7;">${expiry}</span>
              </p>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;gap:12px;margin-top:auto;">
            <button id="akc" class="ak-btn ak-btn-success">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              COPY TO CLIPBOARD
            </button>
            <button id="akx" class="ak-btn ak-btn-thin">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
              DISMISS
            </button>
            <div style="display:flex;align-items:center;justify-content:center;
              opacity:0.6;margin-top:4px;">
              <p style="font-size:15px;color:#fff;font-weight:700;letter-spacing:1px;">
                Telegram: @synoxpanel
              </p>
            </div>
          </div>
        </div>
      `;

      // Copy button
      document.getElementById("akc").onclick = function () {
        const btn = this;
        navigator.clipboard.writeText(token).then(() => {
          btn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            COPIED!
          `;
          setTimeout(() => {
            btn.innerHTML = `
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              COPY TO CLIPBOARD
            `;
          }, 2000);
        });
      };

      document.getElementById("akx").onclick = closeUI;

    // ── Error States ───────────────────────────────────
    } else {
      const isAnomaly   = html.includes("anomaly");
      const isNoSession = html.includes("no_session");
      const isChallenge = html.includes("Just a moment");

      const errTitle = isAnomaly   ? "SECURITY ANOMALY"
                     : isNoSession ? "SESSION TERMINATED"
                     : isChallenge ? "CHALLENGE REQUIRED"
                     : "TOKEN UNRESOLVED";

      const errMsg = isAnomaly   ? "Traffic pattern flagged by edge security policies."
                   : isNoSession ? "Active authorization session has timed out. Log in first."
                   : isChallenge ? "Solve the human verification check on the host tab first."
                   : "Authorization token could not be retrieved from payload.";

      k.innerHTML = `
        <div style="width:100%;max-width:370px;aspect-ratio:5/7;border-radius:24px;
          background:linear-gradient(180deg,#111111 0%,#000000 100%);
          border:1px solid rgba(255,255,255,0.08);padding:32px 24px 24px;
          display:flex;flex-direction:column;position:relative;
          box-sizing:border-box;color:#fff;
          animation:akFadeIn 0.3s ease forwards,edgeError 2.5s infinite ease-in-out;">
          ${u("error")}
          <div style="flex-grow:1;display:flex;flex-direction:column;
            justify-content:center;align-items:center;width:100%;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
              style="margin-bottom:8px;">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
            <h2 style="color:#ef4444;font-size:14px;font-weight:800;
              letter-spacing:1.5px;text-align:center;margin-bottom:12px;">${errTitle}</h2>
            <p style="color:#a1a1aa;font-size:12px;line-height:1.6;
              background:#09090b;padding:16px;border-radius:14px;
              border:1px solid #27272a;text-align:center;
              width:100%;box-sizing:border-box;">${errMsg}</p>
          </div>
          <div style="display:flex;flex-direction:column;gap:12px;margin-top:auto;">
            <button id="akx2" class="ak-btn ak-btn-thin">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
              DISMISS
            </button>
            <div style="display:flex;align-items:center;justify-content:center;
              opacity:0.6;margin-top:4px;">
              <p style="font-size:15px;color:#fff;font-weight:700;letter-spacing:1px;">
                Telegram: @synoxpanel
              </p>
            </div>
          </div>
        </div>
      `;
      document.getElementById("akx2").onclick = closeUI;
    }

  // ── Network Error ──────────────────────────────────────
  } catch (err) {
    clearInterval(ticker);
    if (err.name === "AbortError" || cancelled) return;

    k.innerHTML = `
      <div style="width:100%;max-width:370px;aspect-ratio:5/7;border-radius:24px;
        background:linear-gradient(180deg,#111111 0%,#000000 100%);
        border:1px solid rgba(255,255,255,0.08);padding:32px 24px 24px;
        display:flex;flex-direction:column;position:relative;
        box-sizing:border-box;color:#fff;
        animation:akFadeIn 0.3s ease forwards,edgeError 2.5s infinite ease-in-out;">
        ${u("error")}
        <div style="flex-grow:1;display:flex;flex-direction:column;
          justify-content:center;align-items:center;width:100%;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            style="margin-bottom:8px;">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          <h2 style="color:#f59e0b;font-size:14px;font-weight:800;
            letter-spacing:1.5px;text-align:center;margin-bottom:12px;">
            GATEWAY UNREACHABLE
          </h2>
          <div style="background:#09090b;padding:16px;border-radius:14px;
            border:1px solid #27272a;text-align:left;
            width:100%;box-sizing:border-box;">
            <p style="color:#a1a1aa;font-size:12px;line-height:1.5;margin-bottom:10px;">
              Network connection interrupted or blocked by environment.
            </p>
            <p style="color:#ef4444;font-family:ui-monospace,monospace;
              font-size:10px;word-break:break-all;opacity:0.8;">
              [ERR]: ${err.message}
            </p>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:12px;margin-top:auto;">
          <button id="akx3" class="ak-btn ak-btn-thin">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
            DISMISS
          </button>
          <div style="display:flex;align-items:center;justify-content:center;
            opacity:0.6;margin-top:4px;">
            <p style="font-size:15px;color:#fff;font-weight:700;letter-spacing:1px;">
              Telegram: @synoxpanel
            </p>
          </div>
        </div>
      </div>
    `;
    document.getElementById("akx3").onclick = closeUI;
  }

}();
