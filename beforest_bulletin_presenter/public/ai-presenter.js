// AI Presenter - voice narration with auto-advance.

(function() {
  if (window._presenterLoaded) return;
  window._presenterLoaded = true;

  const API_BASE = '';
  const STORAGE_KEY = 'beforest_presenter_state';

  const folderToPrefix = {
    bi: 'bi',
    'bhopal-collective': 'bhopal',
    hospitality: 'hospitality',
    'community-experience': 'community',
    bewild: 'bewild',
    'mumbai-collective': 'mumbai',
    'hammiyala-collective': 'hammiyala',
    'bodakonda-collective': 'bodakonda',
    'poomaale-1-0': 'poomaale1',
    'poomaale-2-0': 'poomaale2',
    'human-resources': 'hr',
    cds: 'cds'
  };

  const slideIdToPath = {
    'bi-intro': '/bi/slide-00-intro.html',
    'bi-cover': '/bi/slide-01-cover.html',
    'bi-openclaw': '/bi/slide-02-openclaw.html',
    'bi-schema': '/bi/slide-03-schema.html',
    'bi-workflows': '/bi/slide-04-workflows.html',
    'bi-thankyou': '/bi/slide-05-thankyou.html',
    'bhopal-intro': '/bhopal-collective/slide-00-intro.html',
    'bhopal-cover': '/bhopal-collective/slide-01-cover.html',
    'bhopal-schema': '/bhopal-collective/slide-02-schema.html',
    'bhopal-agriculture': '/bhopal-collective/slide-03-agriculture.html',
    'bhopal-experience': '/bhopal-collective/slide-04-experience.html',
    'hospitality-intro': '/hospitality/slide-00-intro.html',
    'hospitality-cover': '/hospitality/slide-01-cover.html',
    'hospitality-schema': '/hospitality/slide-02-schema.html',
    'hospitality-food': '/hospitality/slide-03-food.html',
    'hospitality-arrival': '/hospitality/slide-04-arrival.html',
    'community-intro': '/community-experience/slide-00-intro.html',
    'community-cover': '/community-experience/slide-01-cover.html',
    'community-schema': '/community-experience/slide-02-schema.html',
    'community-bhopal': '/community-experience/slide-03-bhopal.html',
    'community-mumbai': '/community-experience/slide-04-mumbai.html',
    'bewild-intro': '/bewild/slide-00-intro.html',
    'bewild-cover': '/bewild/slide-01-cover.html',
    'bewild-schema': '/bewild/slide-02-schema.html',
    'bewild-storefront': '/bewild/slide-03-storefront.html',
    'bewild-market': '/bewild/slide-04-market.html',
    'mumbai-intro': '/mumbai-collective/slide-00-intro.html',
    'mumbai-cover': '/mumbai-collective/slide-01-cover.html',
    'mumbai-field': '/mumbai-collective/slide-03-field.html',
    'mumbai-protection': '/mumbai-collective/slide-04-protection.html',
    'mumbai-experience': '/mumbai-collective/slide-05-experience.html',
    'hammiyala-intro': '/hammiyala-collective/slide-00-intro.html',
    'hammiyala-cover': '/hammiyala-collective/slide-01-cover.html',
    'hammiyala-schema': '/hammiyala-collective/slide-02-schema.html',
    'hammiyala-crop': '/hammiyala-collective/slide-03-crop.html',
    'hammiyala-boundary': '/hammiyala-collective/slide-04-boundary.html',
    'hammiyala-infra': '/hammiyala-collective/slide-05-infra.html',
    'bodakonda-intro': '/bodakonda-collective/slide-00-intro.html',
    'bodakonda-cover': '/bodakonda-collective/slide-01-cover.html',
    'bodakonda-schema': '/bodakonda-collective/slide-02-schema.html',
    'bodakonda-farming': '/bodakonda-collective/slide-03-farming.html',
    'bodakonda-systems': '/bodakonda-collective/slide-04-systems.html',
    'bodakonda-biodiversity': '/bodakonda-collective/slide-05-biodiversity.html',
    'poomaale1-intro': '/poomaale-1-0/slide-00-intro.html',
    'poomaale1-cover': '/poomaale-1-0/slide-01-cover.html',
    'poomaale1-schema': '/poomaale-1-0/slide-02-schema.html',
    'poomaale1-harvest': '/poomaale-1-0/slide-03-harvest.html',
    'poomaale1-infra': '/poomaale-1-0/slide-04-infra.html',
    'poomaale2-intro': '/poomaale-2-0/slide-00-intro.html',
    'poomaale2-cover': '/poomaale-2-0/slide-01-cover.html',
    'poomaale2-schema': '/poomaale-2-0/slide-02-schema.html',
    'poomaale2-crop': '/poomaale-2-0/slide-03-crop.html',
    'poomaale2-safety': '/poomaale-2-0/slide-04-safety.html',
    'hr-intro': '/human-resources/slide-00-intro.html',
    'hr-cover': '/human-resources/slide-01-cover.html',
    'hr-schema': '/human-resources/slide-02-schema.html',
    'hr-onboarding': '/human-resources/slide-03-onboarding.html',
    'hr-fitness': '/human-resources/slide-04-fitness.html',
    'cds-intro': '/cds/slide-00-intro.html',
    'cds-cover': '/cds/slide-01-cover.html',
    'cds-schema': '/cds/slide-02-schema.html',
    'cds-gis': '/cds/slide-03-gis.html',
    'cds-tools': '/cds/slide-04-tools.html'
  };

  let utterance = null;
  let sessionId = null;

  const styles = `
    .presenter-dock {
      position: fixed;
      top: 20px;
      right: 20px;
      display: flex;
      align-items: center;
      gap: 8px;
      z-index: 1100;
    }
    .presenter-btn {
      border: 1px solid rgba(13, 38, 32, 0.12);
      background: rgba(250, 250, 248, 0.96);
      color: #0d2620;
      padding: 10px 16px;
      border-radius: 999px;
      font: 12px/1 system-ui, sans-serif;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 10px 30px rgba(13, 38, 32, 0.08);
    }
    .presenter-btn:hover {
      border-color: #c17f59;
    }
    .presenter-btn--primary {
      background: #0d2620;
      color: #fafaf8;
      border-color: #0d2620;
    }
    .presenter-btn--primary:hover {
      background: #1f4b3f;
      border-color: #1f4b3f;
    }
    .presenter-btn--paused {
      background: #c17f59;
      color: #fafaf8;
      border-color: #c17f59;
    }
    .presenter-status {
      position: fixed;
      top: 20px;
      left: 20px;
      max-width: min(420px, calc(100vw - 40px));
      background: rgba(13, 38, 32, 0.94);
      color: #fafaf8;
      padding: 10px 14px;
      border-radius: 999px;
      font: 12px/1.4 system-ui, sans-serif;
      letter-spacing: 0.02em;
      z-index: 1100;
      display: none;
    }
    .presenter-status.active {
      display: block;
    }
    @media (max-width: 900px) {
      .presenter-dock {
        top: auto;
        bottom: 76px;
        right: 20px;
        left: 20px;
        justify-content: flex-end;
        flex-wrap: wrap;
      }
      .presenter-status {
        top: 16px;
        left: 16px;
        right: 16px;
        max-width: none;
      }
    }
  `;

  function readState() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch (err) {
      return {};
    }
  }

  function writeState(next) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function clearState() {
    localStorage.removeItem(STORAGE_KEY);
  }

  function isSlidePage() {
    return /\/slide-\d+-[^/]+\.html$/.test(window.location.pathname);
  }

  function getCurrentSlideId() {
    const match = window.location.pathname.match(/\/([^/]+)\/slide-\d+-([^.]+)\.html$/);
    if (!match) return null;
    const folder = match[1];
    const slug = match[2];
    const prefix = folderToPrefix[folder];
    return prefix ? `${prefix}-${slug}` : null;
  }

  function getPathForSlide(slideId) {
    return slideIdToPath[slideId] || null;
  }

  function setStatus(message) {
    const el = document.getElementById('presenter-status');
    if (!el) return;
    el.textContent = message;
    el.classList.add('active');
  }

  function clearStatus() {
    const el = document.getElementById('presenter-status');
    if (!el) return;
    el.classList.remove('active');
  }

  function renderControls() {
    if (!isSlidePage()) return;

    const styleEl = document.createElement('style');
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);

    const dock = document.createElement('div');
    dock.className = 'presenter-dock';
    dock.innerHTML = `
      <button id="presenter-restart" class="presenter-btn" type="button">From Start</button>
      <button id="presenter-toggle" class="presenter-btn presenter-btn--primary" type="button">
        <span id="presenter-toggle-label">Present</span>
      </button>
    `;
    document.body.appendChild(dock);

    const status = document.createElement('div');
    status.id = 'presenter-status';
    status.className = 'presenter-status';
    document.body.appendChild(status);

    document.getElementById('presenter-toggle').addEventListener('click', onToggleClick);
    document.getElementById('presenter-restart').addEventListener('click', restartFromBeginning);

    syncButtons();
  }

  function syncButtons() {
    const state = readState();
    const toggle = document.getElementById('presenter-toggle');
    const label = document.getElementById('presenter-toggle-label');
    const restart = document.getElementById('presenter-restart');
    if (!toggle || !label || !restart) return;

    toggle.classList.remove('presenter-btn--primary', 'presenter-btn--paused');

    if (state.active && state.paused) {
      toggle.classList.add('presenter-btn--paused');
      label.textContent = 'Resume';
    } else if (state.active) {
      toggle.classList.add('presenter-btn--paused');
      label.textContent = 'Pause';
    } else {
      toggle.classList.add('presenter-btn--primary');
      label.textContent = 'Present';
    }

    restart.style.display = state.active ? 'none' : 'inline-flex';
  }

  async function onToggleClick() {
    const state = readState();
    if (!state.active) {
      await startPresentation(getCurrentSlideId(), 'start');
      return;
    }
    if (state.paused) {
      resumePresentation();
      return;
    }
    pausePresentation();
  }

  async function restartFromBeginning() {
    await startPresentation('bi-intro', 'start', true);
  }

  async function startPresentation(slideId, action, navigateFirst) {
    if (!slideId) return;
    const nextState = {
      active: true,
      paused: false,
      currentSlideId: slideId,
      action: action || 'start',
      autoStartOnLoad: !!navigateFirst
    };
    writeState(nextState);
    syncButtons();

    if (navigateFirst) {
      const path = getPathForSlide(slideId);
      if (path && window.location.pathname !== path) {
        window.location.href = path;
        return;
      }
    }

    setStatus('Starting presenter...');
    await presentCurrentSlide();
  }

  function pausePresentation() {
    const state = readState();
    writeState({ ...state, active: true, paused: true, autoStartOnLoad: false });
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause();
    }
    setStatus('Paused');
    syncButtons();
  }

  function resumePresentation() {
    const state = readState();
    writeState({ ...state, active: true, paused: false, autoStartOnLoad: false });
    if (speechSynthesis.paused) {
      speechSynthesis.resume();
      setStatus('Resumed');
    } else {
      presentCurrentSlide();
    }
    syncButtons();
  }

  function stopPresentation() {
    clearState();
    if (speechSynthesis.speaking || speechSynthesis.paused) {
      speechSynthesis.cancel();
    }
    utterance = null;
    clearStatus();
    syncButtons();
  }

  async function presentCurrentSlide() {
    const state = readState();
    const slideId = getCurrentSlideId();
    if (!state.active || state.paused || !slideId) return;

    writeState({ ...state, currentSlideId: slideId, autoStartOnLoad: false });
    syncButtons();

    try {
      await ensureSession();
      await saveSlideState(slideId, 'presenter');

      const res = await fetch(`${API_BASE}/api/ai-present`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slideId, action: state.action || 'next' })
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setStatus('Presenter unavailable');
        stopPresentation();
        return;
      }

      setStatus(`Presenting ${data.slide.title}`);
      await speak(data.script);

      const latest = readState();
      if (!latest.active || latest.paused) return;

      if (data.nextSlideId && !data.shouldEnd) {
        const path = getPathForSlide(data.nextSlideId);
        if (!path) {
          stopPresentation();
          return;
        }
        writeState({
          ...latest,
          currentSlideId: data.nextSlideId,
          action: 'next',
          autoStartOnLoad: true
        });
        window.location.href = path;
        return;
      }

      if (sessionId) {
        await saveSummary(`Presentation completed on ${new Date().toISOString()}`, [], []);
      }
      setStatus('Presentation complete');
      window.setTimeout(() => {
        stopPresentation();
      }, 1200);
    } catch (err) {
      console.error('Presenter error:', err);
      setStatus('Presenter unavailable');
      window.setTimeout(() => stopPresentation(), 1200);
    }
  }

  function speak(text) {
    return new Promise((resolve) => {
      const state = readState();
      if (!state.active || state.paused) {
        resolve();
        return;
      }

      utterance = new SpeechSynthesisUtterance(text || '');
      utterance.rate = 0.96;
      utterance.pitch = 1;
      utterance.volume = 1;

      const voices = speechSynthesis.getVoices();
      const voice = voices.find((item) => item.lang && item.lang.toLowerCase().startsWith('en'));
      if (voice) utterance.voice = voice;

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      speechSynthesis.cancel();
      speechSynthesis.speak(utterance);
    });
  }

  async function ensureSession() {
    if (sessionId) return;
    const saved = localStorage.getItem('beforest_session_id');
    if (saved) {
      sessionId = saved;
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/create-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (data.sessionId) {
        sessionId = data.sessionId;
        localStorage.setItem('beforest_session_id', sessionId);
      }
    } catch (err) {
      sessionId = null;
    }
  }

  async function saveSlideState(slideId, mode) {
    if (!sessionId) return;
    try {
      await fetch(`${API_BASE}/api/save-slide-state`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, slideId, mode })
      });
    } catch (err) {
      // noop
    }
  }

  async function saveSummary(summary, keyQuestions, unresolvedPoints) {
    if (!sessionId) return;
    try {
      await fetch(`${API_BASE}/api/save-summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, summary, keyQuestions, unresolvedPoints })
      });
    } catch (err) {
      // noop
    }
  }

  function handleKeydown(event) {
    const state = readState();
    if (!state.active) return;
    if (event.code === 'Space') {
      event.preventDefault();
      onToggleClick();
    }
    if (event.key === 'Escape') {
      stopPresentation();
    }
  }

  function maybeResumeOnLoad() {
    const state = readState();
    if (!state.active || state.paused || !state.autoStartOnLoad) {
      syncButtons();
      return;
    }

    const slideId = getCurrentSlideId();
    if (slideId && slideId === state.currentSlideId) {
      window.setTimeout(() => {
        presentCurrentSlide();
      }, 350);
    }
  }

  if (isSlidePage()) {
    renderControls();
    document.addEventListener('keydown', handleKeydown);
    maybeResumeOnLoad();
  }
})();
