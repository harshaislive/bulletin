// AI Presenter - Auto-presentation with TTS
// No chat UI, just voice and auto-navigation

(function() {
  if (window._presenterLoaded) return;
  window._presenterLoaded = true;

  const API_BASE = '';

  let isPresenting = false;
  let currentSlideId = null;
  let utterance = null;
  let sessionId = null;
  let presentationMode = 'manual';

  const styles = `
    .present-btn {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #c17f59;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 24px;
      font-size: 14px;
      font-family: system-ui, sans-serif;
      cursor: pointer;
      z-index: 1000;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s ease;
    }
    .present-btn:hover {
      background: #a66b47;
      transform: scale(1.02);
    }
    .present-btn:disabled {
      background: #999;
      cursor: not-allowed;
    }
    .present-btn.stop {
      background: #dc2626;
    }
    .present-btn.stop:hover {
      background: #b91c1c;
    }
    .present-status {
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #0d2620;
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-family: system-ui, sans-serif;
      z-index: 1000;
      display: none;
    }
    .present-status.active {
      display: block;
    }
  `;

  const styleEl = document.createElement('style');
  styleEl.textContent = styles;
  document.head.appendChild(styleEl);

  // Get current slide ID from URL
  function getCurrentSlideId() {
    const path = window.location.pathname;
    const match = path.match(/([^\/]+)\/slide-\d+-([^.]+)\.html$/);
    if (match) {
      const team = match[1];
      const slideType = match[2];
      return `${team}-${slideType}`;
    }
    // Try index page
    const indexMatch = path.match(/\/([^\/]+)\/index\.html$/);
    if (indexMatch) {
      return `${indexMatch[1]}-intro`;
    }
    return null;
  }

  // Create Present button
  function createPresentButton() {
    const btn = document.createElement('button');
    btn.className = 'present-btn';
    btn.id = 'ai-present-btn';
    btn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5v14l11-7z"/>
      </svg>
      <span>Present</span>
    `;
    btn.onclick = togglePresentation;
    document.body.appendChild(btn);

    const status = document.createElement('div');
    status.className = 'present-status';
    status.id = 'present-status';
    document.body.appendChild(status);
  }

  function updateButtonState(presenting) {
    const btn = document.getElementById('ai-present-btn');
    const span = btn.querySelector('span');
    if (presenting) {
      btn.classList.add('stop');
      span.textContent = 'Stop';
      btn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="6" width="12" height="12"/>
        </svg>
        <span>Stop</span>
      `;
    } else {
      btn.classList.remove('stop');
      span.textContent = 'Present';
      btn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z"/>
        </svg>
        <span>Present</span>
      `;
    }
  }

  function showStatus(message) {
    const status = document.getElementById('present-status');
    status.textContent = message;
    status.classList.add('active');
  }

  function hideStatus() {
    const status = document.getElementById('present-status');
    status.classList.remove('active');
  }

  async function togglePresentation() {
    if (isPresenting) {
      stopPresentation();
    } else {
      startPresentation();
    }
  }

  async function startPresentation() {
    isPresenting = true;
    currentSlideId = getCurrentSlideId();
    
    if (!currentSlideId) {
      alert('Could not determine current slide');
      isPresenting = false;
      return;
    }

    updateButtonState(true);
    showStatus('Starting presentation...');

    await presentSlide(currentSlideId, 'start');
  }

  function stopPresentation() {
    isPresenting = false;
    if (utterance) {
      speechSynthesis.cancel();
      utterance = null;
    }
    updateButtonState(false);
    hideStatus();
  }

  async function presentSlide(slideId, action) {
    if (!isPresenting) return;

    try {
      const res = await fetch(`${API_BASE}/api/ai-present`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slideId, action })
      });

      const data = await res.json();

      if (data.error) {
        console.error('AI error:', data.error);
        stopPresentation();
        return;
      }

      // Show current slide
      showStatus(`Presenting: ${data.slide.title}`);

      // Save current slide state
      presentationMode = 'presenter';
      await saveSlideState(slideId, presentationMode);

      // Speak the script
      await speak(data.script);

      if (!isPresenting) return;

      // Navigate to next slide if available
      if (data.nextSlideId && !data.shouldEnd) {
        await navigateToSlide(data.nextSlideId);
        // Small pause before next slide
        await sleep(1500);
        // Continue presentation
        await presentSlide(data.nextSlideId, 'next');
      } else if (data.shouldEnd) {
        showStatus('Presentation complete!');
        await sleep(2000);
        stopPresentation();
      }
    } catch (err) {
      console.error('Presentation error:', err);
      stopPresentation();
    }
  }

  function speak(text) {
    return new Promise((resolve) => {
      if (!isPresenting) {
        resolve();
        return;
      }

      utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      // Try to find a good English voice
      const voices = speechSynthesis.getVoices();
      const englishVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) 
        || voices.find(v => v.lang.startsWith('en'));
      if (englishVoice) {
        utterance.voice = englishVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      speechSynthesis.speak(utterance);
    });
  }

  function navigateToSlide(slideId) {
    return new Promise((resolve) => {
      // Parse slideId to get team and slide type
      // Format: team-slidetype (e.g., bi-cover, bhopal-collective-intro)
      const parts = slideId.split('-');
      
      // Find the team folder and slide file
      let team = '';
      let slideNum = '01';
      let slideType = '';

      // Determine team and slide info
      const teamMap = {
        'bi': 'bi',
        'bhopal': 'bhopal-collective',
        'hospitality': 'hospitality',
        'community': 'community-experience',
        'bewild': 'bewild',
        'mumbai': 'mumbai-collective',
        'hammiyala': 'hammiyala-collective',
        'bodakonda': 'bodakonda-collective',
        'poomaale1': 'poomaale-1-0',
        'poomaale2': 'poomaale-2-0',
        'hr': 'human-resources',
        'cds': 'cds'
      };

      for (const [key, value] of Object.entries(teamMap)) {
        if (slideId.startsWith(key)) {
          team = value;
          const remainder = slideId.slice(key.length + 1);
          
          // Map slide type to number
          const typeMap = {
            'intro': '00',
            'cover': '01',
            'openclaw': '02',
            'schema': '02',
            'workflows': '03',
            'thankyou': '99',
            'agriculture': '03',
            'experience': '04',
            'food': '03',
            'arrival': '04',
            'bhopal': '03',
            'mumbai': '04',
            'storefront': '03',
            'market': '04',
            'field': '03',
            'protection': '04',
            'crop': '03',
            'boundary': '04',
            'infra': '05',
            'farming': '03',
            'systems': '04',
            'biodiversity': '05',
            'harvest': '03',
            'safety': '04',
            'onboarding': '03',
            'fitness': '04',
            'gis': '03',
            'tools': '04'
          };
          
          slideType = typeMap[remainder] || '01';
          break;
        }
      }

      if (team) {
        const slidePath = `${team}/slide-${slideType}-${slideId.split('-').pop()}.html`;
        window.location.href = slidePath;
      } else {
        console.error('Could not parse slide ID:', slideId);
        resolve();
      }

      // Give time for page to load
      setTimeout(resolve, 3000);
    });
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Session management with Supabase
  async function initSession() {
    // Check for existing session in localStorage
    const savedSession = localStorage.getItem('beforest_session_id');
    
    if (savedSession) {
      try {
        const res = await fetch(`${API_BASE}/api/load-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: savedSession })
        });
        const data = await res.json();
        if (data.currentSlideId) {
          sessionId = savedSession;
          presentationMode = data.mode || 'manual';
          console.log('Resumed session:', sessionId);
          return;
        }
      } catch (e) {
        console.log('Could not load session:', e);
      }
    }
    
    // Create new session
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
        console.log('Created new session:', sessionId);
      }
    } catch (e) {
      console.log('Could not create session:', e);
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
    } catch (e) {
      console.log('Could not save slide state:', e);
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
    } catch (e) {
      console.log('Could not save summary:', e);
    }
  }

  // Initialize
  createPresentButton();
  initSession();
})();
