(function() {
  // Prevent double injection
  if (document.getElementById('resonance-focus-sentinel-root')) return;

  const NUDGES = [
    "Are you doomscrolling, or did you need this for your research?",
    "Is this intentional, or did your brain go on autopilot?",
    "Take a breath. Do you really want to be here right now?",
    "Just a quick check-in: is this part of the plan for today?"
  ];
  
  const randomNudge = NUDGES[Math.floor(Math.random() * NUDGES.length)];

  // Create host element for Shadow DOM
  const host = document.createElement('div');
  host.id = 'resonance-focus-sentinel-root';
  host.style.position = 'fixed';
  host.style.top = '0';
  host.style.left = '0';
  host.style.width = '100vw';
  host.style.height = '100vh';
  host.style.zIndex = '2147483647'; // Maximum possible z-index
  host.style.display = 'flex';
  host.style.alignItems = 'flex-start';
  host.style.justifyContent = 'center';
  host.style.paddingTop = '80px';
  host.style.pointerEvents = 'none'; // Let clicks pass through to the page

  // Use Shadow DOM so host page CSS doesn't break our glassmorphism UI
  const shadow = host.attachShadow({ mode: 'closed' });

  const style = document.createElement('style');
  style.textContent = `
    .nudge-container {
      background: rgba(15, 15, 20, 0.85);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      padding: 32px;
      width: 400px;
      max-width: 90vw;
      box-shadow: 0 30px 60px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(168, 85, 247, 0.3) inset;
      pointer-events: auto; /* Enable clicks on the modal itself */
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #fff;
      animation: slideDown 0.6s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;
      overflow: hidden;
    }

    .nudge-container::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle at top right, rgba(168, 85, 247, 0.15), transparent 60%);
      pointer-events: none;
    }

    @keyframes slideDown {
      0% { transform: translateY(-40px); opacity: 0; }
      100% { transform: translateY(0); opacity: 1; }
    }

    h2 {
      margin: 0 0 12px 0;
      font-size: 18px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .icon-orb {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: radial-gradient(circle at 30% 30%, #4cc9f0, #3a0ca3);
      box-shadow: 0 0 10px rgba(168, 85, 247, 0.5);
    }

    p {
      margin: 0 0 24px 0;
      font-size: 15px;
      line-height: 1.5;
      color: rgba(255, 255, 255, 0.7);
    }

    .actions {
      display: flex;
      gap: 12px;
    }

    button {
      flex: 1;
      padding: 12px 16px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }

    .btn-close {
      background: #fff;
      color: #000;
    }

    .btn-close:hover {
      background: #e2e2e2;
      transform: translateY(-2px);
    }

    .btn-dismiss {
      background: rgba(255, 255, 255, 0.05);
      color: #fff;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .btn-dismiss:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  `;

  const container = document.createElement('div');
  container.className = 'nudge-container';
  
  container.innerHTML = \`
    <h2><div class="icon-orb"></div> Focus Sentinel</h2>
    <p>\${randomNudge}</p>
    <div class="actions">
      <button class="btn-close" id="btn-close">Close Tab</button>
      <button class="btn-dismiss" id="btn-dismiss">I need this</button>
    </div>
  \`;

  shadow.appendChild(style);
  shadow.appendChild(container);
  document.body.appendChild(host);

  // Event listeners
  const btnClose = shadow.getElementById('btn-close');
  const btnDismiss = shadow.getElementById('btn-dismiss');

  btnClose.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: "close_tab" });
  });

  btnDismiss.addEventListener('click', () => {
    // Fade out animation
    container.style.animation = 'slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) reverse forwards';
    setTimeout(() => host.remove(), 400);
  });
})();
