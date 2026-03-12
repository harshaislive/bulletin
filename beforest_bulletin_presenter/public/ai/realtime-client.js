// OpenAI Realtime Client for AI Presentation
// Uses WebRTC for low-latency voice interaction

import { getCurrentSlideContext, nextSlide, prevSlide, jumpToSlide, setMode } from './slide-controller.js';
import { saveSessionMemory, loadSessionMemory } from './session-manager.js';

// Tool definitions for the AI
const tools = [
  {
    type: "function",
    function: {
      name: "next_slide",
      description: "Move to the next slide in the presentation",
      parameters: {
        type: "object",
        properties: {},
        required: []
      }
    }
  },
  {
    type: "function",
    function: {
      name: "previous_slide",
      description: "Move to the previous slide",
      parameters: {
        type: "object",
        properties: {},
        required: []
      }
    }
  },
  {
    type: "function",
    function: {
      name: "jump_to_slide",
      description: "Jump to a specific slide by its ID",
      parameters: {
        type: "object",
        properties: {
          slideId: {
            type: "string",
            description: "The ID of the slide to jump to (e.g., 'bi-intro', 'bhopal-cover')"
          }
        },
        required: ["slideId"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_current_slide_context",
      description: "Get the current slide's metadata, content, and notes",
      parameters: {
        type: "object",
        properties: {},
        required: []
      }
    }
  },
  {
    type: "function",
    function: {
      name: "end_ai_mode",
      description: "Stop AI presentation and return control to the human",
      parameters: {
        type: "object",
        properties: {},
        required: []
      }
    }
  }
];

// AI Client class
class AIPresentationClient {
  constructor() {
    this.pc = null;
    this.dc = null;
    this.session = null;
    this.mode = 'manual'; // 'manual', 'assist', 'presenter'
    this.isConnected = false;
    this.isSpeaking = false;
    this.eventHandlers = {};
  }

  // Set up event handlers
  on(event, handler) {
    this.eventHandlers[event] = handler;
  }

  // Emit events
  emit(event, data) {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event](data);
    }
  }

  // Connect to OpenAI Realtime (requires backend to create session)
  async connect(sessionEndpoint, mode = 'assist') {
    this.mode = mode;
    
    try {
      // Get session from your backend
      const response = await fetch(sessionEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create session');
      }
      
      const { session } = await response.json();
      this.session = session;
      
      // Create WebRTC connection
      this.pc = new RTCPeerConnection(session.rtcConfig);
      
      // Set up data channel for AI responses
      this.dc = this.pc.createDataChannel("oai-channel");
      this.dc.onmessage = (e) => this.handleMessage(e);
      
      // Set up audio
      this.pc.ontrack = (e) => {
        const audio = new Audio();
        audio.srcObject = e.streams[0];
        audio.play();
        this.emit('audioStarted');
      };
      
      // Create and set local offer
      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);
      
      // Send offer to OpenAI via your server
      const answerResponse = await fetch(session.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session.id,
          answer: offer
        })
      });
      
      const { answer } = await answerResponse.json();
      await this.pc.setRemoteDescription(answer);
      
      this.isConnected = true;
      this.emit('connected');
      
      // Send initial context
      await this.sendSlideContext();
      
    } catch (error) {
      console.error('Connection error:', error);
      this.emit('error', error);
    }
  }

  // Handle incoming messages from AI
  handleMessage(event) {
    const message = JSON.parse(event.data);
    
    switch (message.type) {
      case 'response.done':
        // AI finished responding
        this.emit('responseDone', message);
        break;
        
      case 'response.audio':
        // Audio transcript available
        this.emit('transcript', message.delta);
        break;
        
      case 'tool_calls':
        // AI wants to call a tool
        this.handleToolCalls(message.tool_calls);
        break;
        
      case 'error':
        this.emit('error', message.error);
        break;
    }
  }

  // Handle tool calls from AI
  async handleToolCalls(toolCalls) {
    const results = [];
    
    for (const tool of toolCalls) {
      let result = { success: false };
      
      try {
        switch (tool.function.name) {
          case 'next_slide':
            result = await nextSlide();
            break;
            
          case 'previous_slide':
            result = await prevSlide();
            break;
            
          case 'jump_to_slide':
            result = await jumpToSlide(tool.function.arguments.slideId);
            break;
            
          case 'get_current_slide_context':
            result = getCurrentSlideContext();
            break;
            
          case 'end_ai_mode':
            await this.disconnect();
            this.emit('modeEnded');
            return;
            
          default:
            result = { error: 'Unknown tool' };
        }
        
        results.push({
          tool_call_id: tool.id,
          output: JSON.stringify(result)
        });
        
      } catch (error) {
        results.push({
          tool_call_id: tool.id,
          output: JSON.stringify({ error: error.message })
        });
      }
    }
    
    // Send tool results back
    if (this.dc && this.dc.readyState === 'open') {
      this.dc.send(JSON.stringify({
        type: 'tool_results',
        results
      }));
    }
    
    // Emit event for UI updates
    this.emit('toolCalled', toolCalls);
  }

  // Send current slide context to AI
  async sendSlideContext() {
    const slide = getCurrentSlideContext();
    const memory = loadSessionMemory();
    
    const context = {
      currentSlide: slide,
      memory: memory,
      availableSlides: ['bi-intro', 'bi-cover', 'bi-openclaw', 'bi-schema', 'bi-workflows', 'bi-thankyou']
      // Add more slide IDs as needed
    };
    
    if (this.dc && this.dc.readyState === 'open') {
      this.dc.send(JSON.stringify({
        type: 'context',
        ...context
      }));
    }
  }

  // Send a message to the AI
  sendMessage(text) {
    if (this.dc && this.dc.readyState === 'open') {
      this.dc.send(JSON.stringify({
        type: 'conversation_item.create',
        content: [{
          type: 'input_text',
          text
        }]
      }));
    }
  }

  // Start voice activity (push to talk)
  startVoice() {
    // This would require microphone access and media streaming
    // Implemented when needed
    this.emit('voiceStarted');
  }

  // Stop voice activity
  stopVoice() {
    this.emit('voiceStopped');
  }

  // Disconnect from AI session
  async disconnect() {
    if (this.dc) {
      this.dc.close();
      this.dc = null;
    }
    
    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }
    
    this.isConnected = false;
    this.mode = 'manual';
    setMode('manual');
    
    this.emit('disconnected');
  }

  // Check if connected
  getConnected() {
    return this.isConnected;
  }

  // Get current mode
  getMode() {
    return this.mode;
  }
}

// Singleton instance
let aiClient = null;

export function getAIClient() {
  if (!aiClient) {
    aiClient = new AIPresentationClient();
  }
  return aiClient;
}

export { AIPresentationClient };
