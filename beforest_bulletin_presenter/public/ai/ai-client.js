// AI UI Module - connects to Node.js backend

let sessionId = null;
let currentSlideId = null;

const API_BASE = window.location.origin;

async function initAI() {
  // Try to load existing session
  const saved = localStorage.getItem('beforest_bulletin_session');
  if (saved) {
    const state = JSON.parse(saved);
    currentSlideId = state.currentSlideId;
  }
  
  // Create or load session
  try {
    const res = await fetch(`${API_BASE}/api/create-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    sessionId = data.sessionId;
  } catch (e) {
    console.log('Session creation skipped (API may not be running)');
  }
}

async function askAI(message) {
  if (!currentSlideId) {
    const pathParts = window.location.pathname.split('/');
    const filename = pathParts[pathParts.length - 1];
    if (filename.startsWith('slide-')) {
      currentSlideId = filename.replace('.html', '');
    }
  }
  
  try {
    const res = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        slideId: currentSlideId,
        mode: 'assist',
        sessionId
      })
    });
    const data = await res.json();
    return data;
  } catch (e) {
    return { reply: 'AI unavailable. Is the server running?', error: e.message };
  }
}

async function presentWithAI(message) {
  if (!currentSlideId) {
    const pathParts = window.location.pathname.split('/');
    const filename = pathParts[pathParts.length - 1];
    if (filename.startsWith('slide-')) {
      currentSlideId = filename.replace('.html', '');
    }
  }
  
  try {
    const res = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        slideId: currentSlideId,
        mode: 'presenter',
        sessionId
      })
    });
    const data = await res.json();
    return data;
  } catch (e) {
    return { reply: 'AI unavailable. Is the server running?', error: e.message };
  }
}

// Chat UI
function createChatUI() {
  const chatDiv = document.createElement('div');
  chatDiv.id = 'ai-chat';
  chatDiv.innerHTML = `
    <style>
      #ai-chat {
        position: fixed;
        bottom: 80px;
        right: 20px;
        width: 320px;
        max-height: 400px;
        background: var(--page, #fafaf8);
        border: 1px solid var(--line, #eee);
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        z-index: 200;
        display: none;
        flex-direction: column;
        font-family: system-ui, sans-serif;
      }
      #ai-chat.open {
        display: flex;
      }
      .chat-header {
        padding: 12px 16px;
        border-bottom: 1px solid var(--line, #eee);
        font-weight: 600;
        font-size: 14px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .chat-close {
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        color: var(--muted, #666);
      }
      .chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .chat-message {
        padding: 8px 12px;
        border-radius: 8px;
        font-size: 13px;
        line-height: 1.4;
      }
      .chat-message.user {
        background: var(--primary-green, #1f4b3f);
        color: white;
        align-self: flex-end;
        max-width: 80%;
      }
      .chat-message.ai {
        background: var(--panel, #f5f0e9);
        color: var(--ink, #333);
        align-self: flex-start;
      }
      .chat-input {
        padding: 12px;
        border-top: 1px solid var(--line, #eee);
        display: flex;
        gap: 8px;
      }
      .chat-input input {
        flex: 1;
        padding: 8px 12px;
        border: 1px solid var(--line, #eee);
        border-radius: 6px;
        font-size: 13px;
        outline: none;
      }
      .chat-input input:focus {
        border-color: var(--primary-green, #1f4b3f);
      }
      .chat-input button {
        padding: 8px 16px;
        background: var(--primary-green, #1f4b3f);
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 13px;
      }
      .chat-input button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .chat-loading {
        text-align: center;
        padding: 8px;
        color: var(--muted, #666);
        font-size: 12px;
      }
    </style>
    <div class="chat-header">
      <span>AI Assistant</span>
      <button class="chat-close" onclick="toggleChat()">×</button>
    </div>
    <div class="chat-messages" id="chat-messages">
      <div class="chat-message ai">Hi! Ask me about this slide or let me present.</div>
    </div>
    <div class="chat-input">
      <input type="text" id="chat-input" placeholder="Type a message..." onkeypress="if(event.key==='Enter')sendMessage()">
      <button id="chat-send" onclick="sendMessage()">Send</button>
    </div>
  `;
  document.body.appendChild(chatDiv);
}

function toggleChat() {
  const chat = document.getElementById('ai-chat');
  chat.classList.toggle('open');
}

async function sendMessage() {
  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send');
  const messages = document.getElementById('chat-messages');
  
  const userMessage = input.value.trim();
  if (!userMessage) return;
  
  // Add user message
  const userDiv = document.createElement('div');
  userDiv.className = 'chat-message user';
  userDiv.textContent = userMessage;
  messages.appendChild(userDiv);
  
  input.value = '';
  sendBtn.disabled = true;
  
  // Show loading
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'chat-loading';
  loadingDiv.textContent = 'Thinking...';
  messages.appendChild(loadingDiv);
  messages.scrollTop = messages.scrollHeight;
  
  // Get AI response
  const mode = document.body.classList.contains('presenter-mode') ? 'presenter' : 'assist';
  const response = mode === 'presenter' 
    ? await presentWithAI(userMessage)
    : await askAI(userMessage);
  
  // Remove loading
  loadingDiv.remove();
  
  // Add AI response
  const aiDiv = document.createElement('div');
  aiDiv.className = 'chat-message ai';
  aiDiv.textContent = response.reply || response.error || 'No response';
  messages.appendChild(aiDiv);
  
  sendBtn.disabled = false;
  messages.scrollTop = messages.scrollHeight;
  
  // Handle navigation if presenter mode
  if (response.action?.nextSlide) {
    setTimeout(() => {
      window.location.href = response.action.nextSlide + '.html';
    }, 1500);
  }
  
  if (response.action?.end) {
    const endDiv = document.createElement('div');
    endDiv.className = 'chat-message ai';
    endDiv.textContent = 'Presentation complete! Thank you!';
    messages.appendChild(endDiv);
  }
}

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    createChatUI();
    initAI();
  });
} else {
  createChatUI();
  initAI();
}
