// Slide Navigation Module
// Include this script in any slide: <script src="../nav.js" data-prev="slide-00.html" data-next="slide-02.html"></script>

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
  `;

  const styleEl = document.createElement('style');
  styleEl.textContent = styles;
  document.head.appendChild(styleEl);

  const scriptEl = document.currentScript;
  const prevSlide = scriptEl?.dataset?.prev;
  const nextSlide = scriptEl?.dataset?.next;
  const currentSlide = scriptEl?.dataset?.current || '';
  const totalSlides = scriptEl?.dataset?.total || '';

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

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' && prevSlide) {
      window.location.href = prevSlide;
    }
    if ((e.key === 'ArrowRight' || e.key === ' ') && nextSlide) {
      e.preventDefault();
      window.location.href = nextSlide;
    }
  });
})();
