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

  const STORAGE_KEY = 'beforest_player_state_v2';
  const REALTIME_MODEL = 'gpt-realtime-mini';
  const REALTIME_VOICE = 'alloy';

  let currentIndex = 0;
  let isPresenting = false;
  let isConnecting = false;
  let sessionId = null;

  let pc = null;
  let dc = null;
  let remoteAudio = null;
  let transcriptBuffer = '';
  let responseStartAt = 0;
  let advanceTimer = null;

  const params = new URLSearchParams(window.location.search);
  const requestedSlideId = params.get('slide');
  const stored = readState();

  if (requestedSlideId) {
    currentIndex = Math.max(0, slides.findIndex((slide) => slide.id === requestedSlideId));
  } else if (stored.currentSlideId) {
    currentIndex = Math.max(0, slides.findIndex((slide) => slide.id === stored.currentSlideId));
  }
  if (currentIndex < 0) currentIndex = 0;

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
      return doc.body.innerText.replace(/\s+/g, ' ').trim().slice(0, 3200);
    } catch (err) {
      return '';
    }
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
        body: JSON.stringify({
          sessionId,
          slideId: getCurrentSlide().id,
          mode: isPresenting ? 'presenter' : 'manual'
        })
      });
    } catch (err) {
      // noop
    }
  }

  function syncPresentButton() {
    if (isConnecting) {
      presentBtn.textContent = 'Connecting';
      presentBtn.disabled = true;
      presentBtn.classList.remove('accent');
      presentBtn.classList.add('primary');
      return;
    }

    presentBtn.disabled = false;

    if (isPresenting) {
      presentBtn.textContent = 'Stop';
      presentBtn.classList.remove('primary');
      presentBtn.classList.add('accent');
      return;
    }

    presentBtn.textContent = 'Present';
    presentBtn.classList.remove('accent');
    presentBtn.classList.add('primary');
  }

  function clearAdvanceTimer() {
    if (advanceTimer) {
      window.clearTimeout(advanceTimer);
      advanceTimer = null;
    }
  }

  function cleanupRealtime() {
    clearAdvanceTimer();
    transcriptBuffer = '';
    responseStartAt = 0;

    if (dc) {
      try {
        dc.close();
      } catch (err) {
        // noop
      }
    }
    dc = null;

    if (pc) {
      try {
        pc.close();
      } catch (err) {
        // noop
      }
    }
    pc = null;

    if (remoteAudio) {
      try {
        remoteAudio.pause();
      } catch (err) {
        // noop
      }
      remoteAudio.srcObject = null;
    }
  }

  function stopPresentation() {
    isPresenting = false;
    isConnecting = false;

    if (dc && dc.readyState === 'open') {
      try {
        dc.send(JSON.stringify({ type: 'response.cancel' }));
      } catch (err) {
        // noop
      }
    }

    cleanupRealtime();
    syncPresentButton();
    setStatus('Manual');
  }

  async function createRealtimeConnection() {
    const sessionResponse = await fetch('/api/realtime/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        voice: REALTIME_VOICE,
        instructions: 'You are the live voice presenter for the Beforest bulletin. Speak clearly, warmly, and concisely in an editorial tone. Present one slide at a time and do not ask follow-up questions unless explicitly told to.'
      })
    });

    const sessionPayload = await sessionResponse.json();
    if (!sessionResponse.ok) {
      throw new Error(sessionPayload.error || 'Could not create realtime session');
    }

    const ephemeralKey = sessionPayload.session?.client_secret?.value;
    if (!ephemeralKey) {
      throw new Error('Realtime session returned no client secret');
    }

    remoteAudio = new Audio();
    remoteAudio.autoplay = true;
    remoteAudio.playsInline = true;

    pc = new RTCPeerConnection();
    pc.addTransceiver('audio', { direction: 'recvonly' });
    pc.ontrack = (event) => {
      remoteAudio.srcObject = event.streams[0];
      remoteAudio.play().catch(() => {
        setStatus('Audio blocked - interact once and press Present again');
      });
    };

    dc = pc.createDataChannel('oai-events');
    dc.addEventListener('message', handleRealtimeMessage);

    const channelReady = new Promise((resolve, reject) => {
      dc.addEventListener('open', resolve, { once: true });
      dc.addEventListener('error', () => reject(new Error('Realtime data channel failed')), { once: true });
    });

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    const answerResponse = await fetch(`https://api.openai.com/v1/realtime?model=${REALTIME_MODEL}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ephemeralKey}`,
        'Content-Type': 'application/sdp',
        'OpenAI-Beta': 'realtime=v1'
      },
      body: offer.sdp
    });

    if (!answerResponse.ok) {
      throw new Error('Realtime SDP negotiation failed');
    }

    const answerSdp = await answerResponse.text();
    await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp });
    await channelReady;
  }

  function estimateRemainingPlaybackMs(text) {
    const words = (text || '').trim().split(/\s+/).filter(Boolean).length;
    const targetMs = Math.max(5000, words * 380);
    const elapsed = Date.now() - responseStartAt;
    return Math.max(1200, targetMs - elapsed + 700);
  }

  function scheduleAdvance() {
    clearAdvanceTimer();

    if (!isPresenting) return;

    if (currentIndex >= slides.length - 1) {
      advanceTimer = window.setTimeout(() => {
        stopPresentation();
        setStatus('Presentation complete');
      }, estimateRemainingPlaybackMs(transcriptBuffer));
      return;
    }

    advanceTimer = window.setTimeout(async () => {
      if (!isPresenting) return;
      currentIndex += 1;
      loadCurrentSlide();
      await presentCurrentSlide();
    }, estimateRemainingPlaybackMs(transcriptBuffer));
  }

  function handleRealtimeMessage(event) {
    const message = JSON.parse(event.data);

    if (message.type === 'response.audio_transcript.delta') {
      transcriptBuffer += message.delta || '';
      if (transcriptBuffer.trim()) {
        previewEl.textContent = transcriptBuffer.trim();
      }
      return;
    }

    if (message.type === 'response.audio_transcript.done') {
      if (message.transcript) {
        transcriptBuffer = message.transcript;
        previewEl.textContent = transcriptBuffer;
      }
      return;
    }

    if (message.type === 'response.done') {
      scheduleAdvance();
      return;
    }

    if (message.type === 'error') {
      console.error('Realtime presenter error:', message.error);
      stopPresentation();
      setStatus('Realtime presenter failed');
    }
  }

  function sendRealtimePrompt() {
    const slide = getCurrentSlide();
    const contextText = getNarrationContext();
    transcriptBuffer = '';
    responseStartAt = Date.now();

    previewEl.textContent = 'AI is preparing live narration...';

    dc.send(JSON.stringify({
      type: 'response.create',
      response: {
        modalities: ['audio', 'text'],
        instructions: [
          'Present this Beforest slide in 2 or 3 concise spoken sentences.',
          'Use the actual slide copy and avoid generic filler.',
          'Sound calm, assured, and premium.',
          currentIndex === slides.length - 1 ? 'Close the presentation warmly.' : 'End with a natural transition to the next slide.',
          `Team: ${slide.team}`,
          `Title: ${slide.title}`,
          `Slide copy: ${contextText || 'No slide copy was extracted.'}`
        ].join(' ')
      }
    }));
  }

  async function presentCurrentSlide() {
    if (!isPresenting) return;
    await ensureSession();
    await saveSlideState();
    setStatus(`Live: ${getCurrentSlide().title}`);
    sendRealtimePrompt();
  }

  async function startPresentation() {
    if (isPresenting || isConnecting) return;
    isConnecting = true;
    syncPresentButton();
    setStatus('Connecting to OpenAI Realtime...');

    try {
      await createRealtimeConnection();
      isConnecting = false;
      isPresenting = true;
      syncPresentButton();
      await presentCurrentSlide();
    } catch (err) {
      console.error(err);
      isConnecting = false;
      isPresenting = false;
      syncPresentButton();
      setStatus(`Realtime unavailable: ${err.message}`);
    }
  }

  function togglePresentation() {
    if (isPresenting || isConnecting) {
      stopPresentation();
      return;
    }
    startPresentation();
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
    previewEl.textContent = getNarrationContext() || `${getCurrentSlide().team}. ${getCurrentSlide().title}.`;
  });

  window.addEventListener('beforeunload', cleanupRealtime);

  loadCurrentSlide();
  syncPresentButton();
})();
