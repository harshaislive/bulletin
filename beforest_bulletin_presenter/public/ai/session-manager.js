// Session Manager - localStorage and Supabase persistence
// Handles saving/loading presentation state

const STORAGE_KEY = 'beforest_bulletin_session';

// Default session state
const defaultState = {
  sessionId: null,
  currentSlideId: null,
  mode: 'manual',
  voiceEnabled: false,
  updatedAt: null
};

// Save slide state to localStorage
export async function saveSlideState(slideId, mode = 'manual', voiceEnabled = false) {
  const state = {
    ...defaultState,
    sessionId: generateSessionId(),
    currentSlideId: slideId,
    mode,
    voiceEnabled,
    updatedAt: new Date().toISOString()
  };
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return { ok: true, state };
  } catch (e) {
    console.error('Failed to save slide state:', e);
    return { ok: false, error: e.message };
  }
}

// Load slide state from localStorage
export function loadSlideState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const state = JSON.parse(stored);
    
    // Validate state has required fields
    if (!state.currentSlideId) return null;
    
    return state;
  } catch (e) {
    console.error('Failed to load slide state:', e);
    return null;
  }
}

// Clear session state
export function clearSessionState() {
  localStorage.removeItem(STORAGE_KEY);
}

// Generate a simple session ID
function generateSessionId() {
  const existing = loadSlideState();
  if (existing && existing.sessionId) {
    return existing.sessionId;
  }
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Get current session ID
export function getSessionId() {
  const state = loadSlideState();
  return state?.sessionId || generateSessionId();
}

// Save memory/summary (for AI context)
const MEMORY_KEY = 'beforest_bulletin_memory';

export async function saveSessionMemory(memory) {
  const data = {
    summary: memory.summary || '',
    keyQuestions: memory.keyQuestions || [],
    unresolvedPoints: memory.unresolvedPoints || [],
    lastToolActions: memory.lastToolActions || [],
    updatedAt: new Date().toISOString()
  };
  
  try {
    localStorage.setItem(MEMORY_KEY, JSON.stringify(data));
    return { ok: true, memory: data };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

export function loadSessionMemory() {
  try {
    const stored = localStorage.getItem(MEMORY_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch (e) {
    return null;
  }
}

export function clearSessionMemory() {
  localStorage.removeItem(MEMORY_KEY);
}

// Supabase integration (placeholder - requires Supabase setup)
export async function saveToSupabase(state) {
  // This will be implemented when Supabase is configured
  console.log('Supabase save not configured yet');
  return { ok: false, reason: 'Supabase not configured' };
}

export async function loadFromSupabase(sessionId) {
  // This will be implemented when Supabase is configured
  console.log('Supabase load not configured yet');
  return null;
}
