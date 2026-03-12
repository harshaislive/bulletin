// Slide Navigation Module
// Includes localStorage persistence and AI integration

(function() {
  if (window._navLoaded) return;
  window._navLoaded = true;
  
  // Extract team name from URL path
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  const teamName = pathParts[pathParts.length - 2] || 'Team';
  
  const styles = `
    .slide-nav {
      position: fixed;
      bottom: 20px;
      left: 48px;
      right: 48px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 100;
    }
    .slide-nav-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .slide-nav-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .slide-nav a {
      font-size: 12px;
      color: var(--muted, #666);
      text-decoration: none;
      padding: 6px 12px;
      border-radius: 4px;
      background: var(--page, #fafaf8);
      border: 1px solid var(--line, #eee);
      transition: all 0.15s ease;
      font-family: system-ui, sans-serif;
    }
    .slide-nav a:hover {
      color: var(--ink, #333);
      border-color: var(--terracotta, #c17f59);
    }
    .slide-nav .next {
      background: var(--ink, #0d2620);
      color: var(--page, #fafaf8);
      border-color: var(--ink, #0d2620);
    }
    .slide-nav .next:hover {
      background: var(--primary-green, #1f4b3f);
      border-color: var(--primary-green, #1f4b3f);
    }
    .slide-nav .orch-link {
      font-size: 11px;
      letter-spacing: 0.03em;
    }
    .slide-nav .team-link {
      font-size: 11px;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: var(--muted, #666);
    }
    .slide-counter {
      font-size: 12px;
      color: var(--muted, #666);
      font-family: system-ui, sans-serif;
      padding: 0 8px;
    }
    kbd {
      font-family: system-ui, sans-serif;
      font-size: 10px;
      padding: 1px 4px;
      border: 1px solid var(--line, #eee);
      border-radius: 3px;
      margin-left: 4px;
      opacity: 0.7;
    }
    
    /* AI Controls */
    .ai-controls {
      position: fixed;
      top: 20px;
      right: 20px;
      display: flex;
      gap: 8px;
      z-index: 100;
    }
    .ai-btn {
      font-size: 12px;
      padding: 8px 14px;
      border-radius: 20px;
      border: 1px solid var(--line, #eee);
      background: var(--page, #fafaf8);
      color: var(--muted, #666);
      cursor: pointer;
      font-family: system-ui, sans-serif;
      transition: all 0.15s ease;
    }
    .ai-btn:hover {
      border-color: var(--terracotta, #c17f59);
      color: var(--ink, #333);
    }
    .ai-btn.active {
      background: var(--primary-green, #1f4b3f);
      color: white;
      border-color: var(--primary-green, #1f4b3f);
    }
    .ai-btn.assist {
      background: var(--panel, #f5f0e9);
    }
    .ai-btn.present {
      background: var(--terracotta, #c17f59);
      color: white;
      border-color: var(--terracotta, #c17f59);
    }
    .ai-btn.chat-toggle {
      background: var(--ink, #0d2620);
      color: white;
      border-color: var(--ink, #0d2620);
    }
    
    /* AI Status */
    .ai-status {
      position: fixed;
      top: 20px;
      left: 20px;
      font-size: 11px;
      color: var(--muted, #666);
      font-family: system-ui, sans-serif;
      display: flex;
      align-items: center;
      gap: 6px;
      z-index: 100;
    }
    .ai-status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--muted, #ccc);
    }
    .ai-status-dot.connected {
      background: #22c55e;
    }
    .ai-status-dot.speaking {
      background: var(--terracotta, #c17f59);
      animation: pulse 1s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `;

  const styleEl = document.createElement('style');
  styleEl.textContent = styles;
  document.head.appendChild(styleEl);

  // Get slide info from data attributes
  const scriptEl = document.currentScript;
  const prevSlide = scriptEl?.dataset?.prev;
  const nextSlide = scriptEl?.dataset?.next;
  const currentSlide = scriptEl?.dataset?.current || '';
  const totalSlides = scriptEl?.dataset?.total || '';

  // Save state to localStorage
  try {
    const state = {
      currentSlideId: currentSlide,
      mode: 'manual',
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem('beforest_bulletin_session', JSON.stringify(state));
  } catch (e) {
    console.log('Could not save state:', e);
  }

  const nav = document.createElement('nav');
  nav.className = 'slide-nav';
  
  let leftSection = `
    <div class="slide-nav-left">
      <a href="../orchestrator.html" class="orch-link">← Orchestrator</a>
      <a href="./index.html" class="team-link">${teamName}</a>
    </div>
  `;
  
  let rightSection = `<div class="slide-nav-right">`;
  
  if (prevSlide) {
    rightSection += `<a href="${prevSlide}" class="prev">Prev</a>`;
  }
  
  if (currentSlide && totalSlides) {
    rightSection += `<span class="slide-counter">${currentSlide} / ${totalSlides}</span>`;
  }
  
  if (nextSlide) {
    rightSection += `<a href="${nextSlide}" class="next">Next <kbd>→</kbd></a>`;
  }
  
  rightSection += `</div>`;
  
  nav.innerHTML = leftSection + rightSection;
  document.body.appendChild(nav);

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' && prevSlide) {
      window.location.href = prevSlide;
    }
    if ((e.key === 'ArrowRight' || e.key === ' ') && nextSlide) {
      e.preventDefault();
      window.location.href = nextSlide;
    }
  });

  if (currentSlide) {
    const presenterScript = document.createElement('script');
    presenterScript.src = '/ai-presenter.js';
    document.body.appendChild(presenterScript);
  }
})();
