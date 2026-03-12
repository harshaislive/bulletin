(function() {
  const slides = window.BEFOREST_SLIDES || [];
  if (!slides.length) return;

  const frame = document.getElementById('slide-frame');
  const statusEl = document.getElementById('player-status');
  const teamEl = document.getElementById('meta-team');
  const titleEl = document.getElementById('meta-title');
  const progressEl = document.getElementById('meta-progress');
  const progressFill = document.getElementById('progress-fill');
  const previewEl = document.getElementById('player-script-preview');
  const presentBtn = document.getElementById('btn-present');
  const prevBtn = document.getElementById('btn-prev');
  const nextBtn = document.getElementById('btn-next');
  const restartBtn = document.getElementById('btn-restart');

  const STORAGE_KEY = 'beforest_player_state_v1';

  let currentIndex = 0;
  let isPresenting = false;
  let isPaused = false;
  let currentScript = '';
  let sessionId = null;
  let utterance = null;

  const params = new URLSearchParams(window.location.search);
  const requestedSlideId = params.get('slide');
  const stored = readState();
  if (requestedSlideId) {
    currentIndex = Math.max(0, slides.findIndex((slide) => slide.id === requestedSlideId));
  } else if (stored.currentSlideId) {
    currentIndex = Math.max(0, slides.findIndex((slide) => slide.id === stored.currentSlideId));
    if (currentIndex === -1) currentIndex = 0;
  }
  if (currentIndex === -1) currentIndex = 0;

  function readState() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch (err) {
      return {};
    }
  }

  function writeState(patch) {
    const next = { ...readState(), ...patch };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  }

  function setStatus(message) {
    statusEl.textContent = message;
  }

  function getCurrentSlide() {
    return slides[currentIndex];
  }

  function updateMeta() {
    const slide = getCurrentSlide();
    teamEl.textContent = slide.team;
    titleEl.textContent = slide.title;
    progressEl.textContent = `${currentIndex + 1} / ${slides.length}`;
    progressFill.style.width = `${((currentIndex + 1) / slides.length) * 100}%`;
    writeState({ currentSlideId: slide.id });
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set('slide', slide.id);
    window.history.replaceState({}, '', nextUrl);
  }

  function getEmbedUrl(path) {
    const url = new URL(path, window.location.origin);
    url.searchParams.set('embed', '1');
    return url.toString();
  }

  function loadCurrentSlide() {
    updateMeta();
    frame.src = getEmbedUrl(getCurrentSlide().path);
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === slides.length - 1;
  }

  function getNarrationContext() {
    try {
      const doc = frame.contentDocument;
      if (!doc || !doc.body) return '';
      return doc.body.innerText.replace(/\s+/g, ' ').trim().slice(0, 2200);
    } catch (err) {
      return '';
    }
  }

  function getFallbackScript(slide) {
    const context = getNarrationContext();
    if (context) {
      return context.split('. ').slice(0, 3).join('. ').trim();
    }
    return `${slide.team}. ${slide.title}.`;
  }

  async function ensureSession() {
    if (sessionId) return;
    const saved = localStorage.getItem('beforest_session_id');
    if (saved) {
      sessionId = saved;
      return;
    }

    try {
      const res = await fetch('/api/create-session', {
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

  async function saveSlideState() {
    if (!sessionId) return;
    try {
      await fetch('/api/save-slide-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, slideId: getCurrentSlide().id, mode: isPresenting ? 'presenter' : 'manual' })
      });
    } catch (err) {
      // noop
    }
  }

  function syncPresentButton() {
    if (isPresenting && isPaused) {
      presentBtn.textContent = 'Resume';
      presentBtn.classList.remove('primary');
      presentBtn.classList.add('accent');
      setStatus('Paused');
      return;
    }
    if (isPresenting) {
      presentBtn.textContent = 'Pause';
      presentBtn.classList.remove('primary');
      presentBtn.classList.add('accent');
      return;
    }
    presentBtn.textContent = 'Present';
    presentBtn.classList.remove('accent');
    presentBtn.classList.add('primary');
    setStatus('Manual');
  }

  async function requestScript() {
    const slide = getCurrentSlide();
    const contextText = getNarrationContext();

    try {
      const res = await fetch('/api/ai-present', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slideId: slide.id,
          action: 'next',
          contextText
        })
      });
      const data = await res.json();
      if (res.ok && !data.error && data.script) {
        currentScript = data.script;
        previewEl.textContent = data.script;
        return data;
      }
    } catch (err) {
      // noop
    }

    currentScript = getFallbackScript(slide);
    previewEl.textContent = currentScript;
    return {
      slide,
      script: currentScript,
      nextSlideId: slides[currentIndex + 1] ? slides[currentIndex + 1].id : null,
      shouldEnd: currentIndex === slides.length - 1
    };
  }

  function speak(text) {
    return new Promise((resolve) => {
      utterance = new SpeechSynthesisUtterance(text);
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

  async function presentCurrentSlide() {
    if (!isPresenting || isPaused) return;
    const slide = getCurrentSlide();
    await ensureSession();
    await saveSlideState();
    setStatus(`Presenting ${slide.title}`);

    const data = await requestScript();
    await speak(data.script);

    if (!isPresenting || isPaused) return;
    if (data.shouldEnd || currentIndex === slides.length - 1) {
      isPresenting = false;
      isPaused = false;
      syncPresentButton();
      setStatus('Presentation complete');
      return;
    }

    currentIndex += 1;
    loadCurrentSlide();
    window.setTimeout(() => {
      presentCurrentSlide();
    }, 700);
  }

  function pausePresentation() {
    isPaused = true;
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause();
    }
    syncPresentButton();
  }

  function resumePresentation() {
    isPaused = false;
    syncPresentButton();
    if (speechSynthesis.paused) {
      speechSynthesis.resume();
      setStatus(`Presenting ${getCurrentSlide().title}`);
    } else {
      presentCurrentSlide();
    }
  }

  function stopPresentation() {
    isPresenting = false;
    isPaused = false;
    speechSynthesis.cancel();
    syncPresentButton();
  }

  function togglePresentation() {
    if (!isPresenting) {
      isPresenting = true;
      isPaused = false;
      syncPresentButton();
      presentCurrentSlide();
      return;
    }
    if (isPaused) {
      resumePresentation();
      return;
    }
    pausePresentation();
  }

  function goToIndex(index) {
    stopPresentation();
    currentIndex = Math.max(0, Math.min(slides.length - 1, index));
    loadCurrentSlide();
  }

  presentBtn.addEventListener('click', togglePresentation);
  prevBtn.addEventListener('click', () => goToIndex(currentIndex - 1));
  nextBtn.addEventListener('click', () => goToIndex(currentIndex + 1));
  restartBtn.addEventListener('click', () => goToIndex(0));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') goToIndex(currentIndex - 1);
    if (event.key === 'ArrowRight') goToIndex(currentIndex + 1);
    if (event.code === 'Space') {
      event.preventDefault();
      togglePresentation();
    }
    if (event.key === 'Escape') stopPresentation();
  });

  frame.addEventListener('load', () => {
    previewEl.textContent = getFallbackScript(getCurrentSlide());
  });

  loadCurrentSlide();
  syncPresentButton();
})();
