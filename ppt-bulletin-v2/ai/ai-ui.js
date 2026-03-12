// AI UI Module
// Handles AI button interactions and connects to the Realtime client

import { getAIClient } from './realtime-client.js';
import { getCurrentSlideContext } from './slide-controller.js';
import { saveSessionMemory, loadSessionMemory } from './session-manager.js';

// Configuration - these will come from environment
const CONFIG = {
  supabaseUrl: '',      // Your Supabase URL
  supabaseAnonKey: '',  // Your Supabase anon key
  openaiApiKey: ''      // Only used server-side
};

export function initAIUI() {
  const askBtn = document.getElementById('ai-ask');
  const presentBtn = document.getElementById('ai-present');
  const statusDot = document.getElementById('ai-status-dot');
  const statusText = document.getElementById('ai-status-text');
  
  const aiClient = getAIClient();
  
  // Event handlers
  aiClient.on('connected', () => {
    if (statusDot) statusDot.classList.add('connected');
    if (statusText) statusText.textContent = 'AI Connected';
    if (askBtn) askBtn.classList.add('active');
    if (presentBtn) presentBtn.classList.add('active');
  });
  
  aiClient.on('disconnected', () => {
    if (statusDot) statusDot.classList.remove('connected', 'speaking');
    if (statusText) statusText.textContent = 'Manual';
    if (askBtn) askBtn.classList.remove('active');
    if (presentBtn) presentBtn.classList.remove('active');
  });
  
  aiClient.on('audioStarted', () => {
    if (statusDot) statusDot.classList.add('speaking');
    if (statusText) statusText.textContent = 'AI Speaking...';
  });
  
  aiClient.on('voiceStopped', () => {
    if (statusDot) statusDot.classList.remove('speaking');
    if (statusText) statusText.textContent = aiClient.getMode() === 'presenter' ? 'Presenter Mode' : 'Assist Mode';
  });
  
  aiClient.on('modeEnded', () => {
    if (statusDot) statusDot.classList.remove('speaking');
    if (statusText) statusText.textContent = 'Manual';
    alert('AI mode ended. Control returned to you.');
  });
  
  aiClient.on('error', (error) => {
    console.error('AI Error:', error);
    alert('AI unavailable. Please try again or continue manually.');
  });
  
  // Button click handlers
  if (askBtn) {
    askBtn.addEventListener('click', async () => {
      if (aiClient.getConnected()) {
        // Already connected, just toggle
        if (aiClient.getMode() === 'assist') {
          await aiClient.disconnect();
        } else {
          // Switch to assist mode
          // This would require reconnecting with new mode
        }
      } else {
        // Start assist mode
        await startAssistMode();
      }
    });
  }
  
  if (presentBtn) {
    presentBtn.addEventListener('click', async () => {
      if (aiClient.getConnected()) {
        if (aiClient.getMode() === 'presenter') {
          await aiClient.disconnect();
        }
      } else {
        // Start presenter mode
        await startPresenterMode();
      }
    });
  }
}

async function startAssistMode() {
  const aiClient = getAIClient();
  
  try {
    // In production, this would call your Supabase Edge Function
    // For now, show a message that it's being set up
    alert('Assist mode requires backend configuration.\n\nTo enable:\n1. Set up Supabase project\n2. Add Edge Functions\n3. Configure OpenAI API key\n\nSee ai/ folder for setup instructions.');
    
    // Simulate connection for demo
    // await aiClient.connect('/api/create-realtime-session', 'assist');
    
  } catch (error) {
    console.error('Failed to start assist mode:', error);
    alert('Failed to connect. Please check your configuration.');
  }
}

async function startPresenterMode() {
  const aiClient = getAIClient();
  
  try {
    alert('Presenter mode requires backend configuration.\n\nTo enable:\n1. Set up Supabase project\n2. Add Edge Functions\n3. Configure OpenAI API key\n\nSee ai/ folder for setup instructions.');
    
    // In production:
    // await aiClient.connect('/api/create-realtime-session', 'presenter');
    
  } catch (error) {
    console.error('Failed to start presenter mode:', error);
    alert('Failed to connect. Please check your configuration.');
  }
}

// Export for use in nav.js
export { CONFIG };
