# AI Presentation System

This folder contains the AI integration for the Beforest Bulletin presentation.

## What's Included

- **slide-registry.js** - All 62 slides with metadata for AI context
- **slide-controller.js** - Safe navigation wrapper (AI cannot manipulate DOM directly)
- **session-manager.js** - localStorage and Supabase persistence
- **realtime-client.js** - OpenAI Realtime API client (WebRTC)
- **ai-ui.js** - UI controls for Ask AI / Presenter modes
- **prompts/** - System prompts for AI behavior

## Quick Start (Manual Mode)

The presentation already works in manual mode:
- Keyboard navigation (arrows, spacebar)
- localStorage saves your position
- AI buttons are visible but require backend setup

## Setting Up AI Features

### 1. Supabase Setup

1. Create a Supabase project at supabase.com
2. Run the SQL in `../supabase/schema.sql` in your Supabase SQL Editor
3. Get your project URL and anon key

### 2. Edge Functions

Create these Supabase Edge Functions:

- `create-realtime-session` - Creates OpenAI Realtime session
- `load-session` - Loads saved session state
- `save-slide-state` - Saves current slide position
- `save-session-summary` - Saves AI memory

### 3. OpenAI API

- Get an OpenAI API key
- Add it to Supabase secrets: `openai_api_key`

### 4. Update Configuration

Edit `ai/ai-ui.js` to add your Supabase credentials:

```js
const CONFIG = {
  supabaseUrl: 'https://your-project.supabase.co',
  supabaseAnonKey: 'your-anon-key'
};
```

## Usage Modes

### Manual Mode (Default)
- Works without any AI
- Keyboard: ← → arrows, spacebar
- State saved to localStorage

### Assist Mode
- Click "Ask AI" button
- Ask questions about current slide
- AI responds but cannot navigate autonomously

### Presenter Mode
- Click "Present" button
- AI presents slides with voice
- AI can navigate using tools
- Human can interrupt anytime

## Architecture

```
Presentation
    |
    +-- nav.js (navigation + UI)
    |       |
    |       +-- slide-controller.js (safe navigation)
    |       |       |
    |       |       +-- slide-registry.js (slide metadata)
    |       |       |
    |       |       +-- session-manager.js (persistence)
    |       |
    |       +-- ai-ui.js (AI controls)
    |               |
    |               +-- realtime-client.js (OpenAI connection)
    |
    +-- Supabase (optional - for cross-device sync)
```

## Security

- AI can only interact via approved tools
- No direct DOM manipulation
- API keys kept server-side
- Session state validated

## Cost Control

- AI off by default
- Session created only when needed
- Uses `gpt-realtime-mini` (cheap/fast)
- Memory stored as summaries, not transcripts
