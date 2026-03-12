# Agentic HTML PPT Plan (GPT Realtime Mini + Supabase)

## Goal
Turn your existing HTML/JS presentation into a **manual-first presentation** that can become an **AI-assisted** or **AI-presented** deck when needed.

This plan keeps your current PPT HTML intact and adds:
- session restore
- slide memory
- optional AI voice
- optional agentic navigation
- safe tool-calling
- Supabase-backed persistence

---

## 1) Product philosophy

### What we are building
A presentation with **3 modes**:

1. **Manual mode**
   - Works like a normal presentation
   - No active AI voice session by default
   - Cheapest and most reliable mode

2. **Assist mode**
   - AI wakes up only when triggered
   - Examples:
     - “Explain this slide”
     - “Answer audience question”
     - “Summarize what we covered”

3. **Presenter mode**
   - AI can speak, answer questions, and navigate slides using approved tools
   - Human can always interrupt and take back control

### What we are *not* building in v1
- a fully autonomous multi-agent system
- a vector database from day 1
- a massive memory system
- freeform DOM control by the model
- always-on voice from page load

---

## 2) Core architecture

```text
Existing HTML/JS deck
    |
    |-- Slide Controller Layer
    |     - nextSlide()
    |     - prevSlide()
    |     - goToSlide(id)
    |     - getCurrentSlideContext()
    |
    |-- UI Layer
    |     - Ask AI
    |     - Let AI Present
    |     - Take Back Control
    |     - Resume Session
    |
    |-- State Layer
    |     - localStorage for instant restore
    |     - Supabase for durable session state
    |
    |-- Voice/Agent Layer
    |     - OpenAI Realtime via WebRTC
    |     - model: gpt-realtime-mini
    |     - limited tool calling only
    |
    |-- Backend
          - Supabase Edge Functions
          - session bootstrap
          - save summaries
          - create realtime session
```

---

## 3) Recommended stack

### Frontend
- Your existing HTML/CSS/JS presentation
- Plain JavaScript or TypeScript
- Optional: keep current framework if already using one

### Backend / persistence
- **Supabase Postgres** for sessions and memory
- **Supabase Edge Functions** for secure server-side logic
- **Supabase Auth** only if you need protected sessions or per-user access

### AI / voice
- **OpenAI Realtime API**
- **Model: `gpt-realtime-mini`**
- Browser connection using **WebRTC**

### Why this stack
Because it is the minimum serious architecture:
- simple
- cheap
- production-credible
- easy to debug
- easy to extend later

---

## 4) Folder structure for your existing HTML deck

```text
/your-ppt-project
  /assets
  /slides
  index.html
  styles.css
  app.js

  /ai
    slide-controller.js
    slide-registry.js
    session-manager.js
    ai-ui.js
    realtime-client.js
    tool-bridge.js
    summarizer.js

  /supabase
    schema.sql
    policies.sql
    types.ts

  /prompts
    presenter-system.md
    assist-system.md

  /functions
    create-realtime-session/
      index.ts
    save-session-summary/
      index.ts
    load-session/
      index.ts
    save-slide-state/
      index.ts

  README.md
```

---

## 5) Slide model you should add

Your current HTML slides likely already have IDs or sections. We will add a structured registry.

Create `ai/slide-registry.js`:

```js
export const slides = [
  {
    id: "intro",
    title: "Introduction",
    visibleContent: [
      "Welcome",
      "Why this matters",
      "What we will cover"
    ],
    speakerNotes: "Start with the framing. Keep it short.",
    tags: ["intro", "overview"],
    allowedFollowups: [
      "Explain simply",
      "Give a deeper view",
      "Move to next slide"
    ],
    restrictions: [
      "Do not mention internal financial details"
    ]
  }
];
```

### Why do this
This lets the AI speak from:
- the current slide title
- visible content
- hidden notes
- constraints

Instead of making the model guess from raw DOM.

---

## 6) Frontend slide controller

Create a safe controller wrapper around your current deck.

`ai/slide-controller.js`

```js
import { slides } from "./slide-registry.js";

let currentSlideId = "intro";

export function nextSlide() {
  const idx = slides.findIndex(s => s.id === currentSlideId);
  if (idx >= 0 && idx < slides.length - 1) {
    currentSlideId = slides[idx + 1].id;
    renderSlide(currentSlideId);
    return { ok: true, currentSlideId };
  }
  return { ok: false, reason: "Already at last slide" };
}

export function prevSlide() {
  const idx = slides.findIndex(s => s.id === currentSlideId);
  if (idx > 0) {
    currentSlideId = slides[idx - 1].id;
    renderSlide(currentSlideId);
    return { ok: true, currentSlideId };
  }
  return { ok: false, reason: "Already at first slide" };
}

export function goToSlide(id) {
  const exists = slides.some(s => s.id === id);
  if (!exists) return { ok: false, reason: "Unknown slide" };
  currentSlideId = id;
  renderSlide(currentSlideId);
  return { ok: true, currentSlideId };
}

export function getCurrentSlideContext() {
  return slides.find(s => s.id === currentSlideId);
}

export function getCurrentSlideId() {
  return currentSlideId;
}

function renderSlide(id) {
  // Connect this to your existing HTML deck rendering / navigation logic
  console.log("Render slide", id);
}
```

### Rule
The model should **never directly mutate the DOM**.
It should only use these functions.

---

## 7) State and memory design

Use **two layers**:

### A. localStorage
For instant same-browser restore:
- `sessionId`
- `currentSlideId`
- `mode`
- `voiceEnabled`
- `updatedAt`

### B. Supabase
For durable restore across refreshes and devices:
- current slide
- session mode
- compact conversation summary
- key Q&A
- unresolved topics
- event log

### Principle
Persist **app state exactly**.
Persist **AI state as summaries**, not giant transcripts.

---

## 8) Supabase schema

### 8.1 `presentations`

```sql
create table if not exists presentations (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### 8.2 `presentation_sessions`

```sql
create table if not exists presentation_sessions (
  id uuid primary key default gen_random_uuid(),
  presentation_id uuid not null references presentations(id) on delete cascade,
  owner_user_id uuid,
  session_name text,
  current_slide_id text not null,
  mode text not null check (mode in ('manual', 'assist', 'presenter')),
  voice_enabled boolean not null default false,
  session_status text not null default 'active' check (session_status in ('active', 'ended', 'paused')),
  last_activity_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### 8.3 `presentation_memory`

```sql
create table if not exists presentation_memory (
  session_id uuid primary key references presentation_sessions(id) on delete cascade,
  summary text not null default '',
  key_questions jsonb not null default '[]'::jsonb,
  unresolved_points jsonb not null default '[]'::jsonb,
  audience_notes jsonb not null default '[]'::jsonb,
  last_tool_actions jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);
```

### 8.4 `presentation_events`

```sql
create table if not exists presentation_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references presentation_sessions(id) on delete cascade,
  event_type text not null,
  speaker text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
```

### Optional later: `deck_chunks`
Only add this if you later want retrieval over large notes/FAQs.

---

## 9) RLS and security model

### Keep it simple
If this is private/internal at first:
- turn on RLS
- only allow the signed-in owner to access their sessions

### Example policy concept
- Users can read/write only rows where `owner_user_id = auth.uid()`

### Security rules
- never expose `OPENAI_API_KEY` in the browser
- never expose Supabase service role key in the browser
- browser should use publishable/anon key only
- all OpenAI session creation happens server-side

---

## 10) Supabase Edge Functions you should build

### Function 1: `load-session`
Purpose:
- load saved session
- return current slide
- return mode
- return memory summary

**Input**
```json
{ "sessionId": "uuid" }
```

**Output**
```json
{
  "sessionId": "...",
  "currentSlideId": "pricing",
  "mode": "assist",
  "voiceEnabled": true,
  "memory": {
    "summary": "We covered market context and pricing assumptions.",
    "keyQuestions": ["How do margins change?"],
    "unresolvedPoints": ["Show competitor comparison"]
  }
}
```

### Function 2: `save-slide-state`
Purpose:
- persist current slide and mode whenever slide changes

### Function 3: `save-session-summary`
Purpose:
- persist compact session memory every few turns or on important events

### Function 4: `create-realtime-session`
Purpose:
- securely create the OpenAI Realtime connection bootstrap
- inject model + voice + instructions + tools
- return what frontend needs to connect

---

## 11) OpenAI Realtime connection pattern

### Recommended browser approach
Use **WebRTC**, not direct browser WebSocket.

### Why
- lower-latency voice UX
- browser-native media handling
- OpenAI recommends WebRTC for browser/mobile Realtime clients

### Your backend role
Frontend does **not** hold the real API key.
Instead:
1. frontend asks your Edge Function to create/init session
2. Edge Function talks to OpenAI
3. frontend connects using returned session/bootstrap flow

---

## 12) Model choice

Use:

```text
gpt-realtime-mini
```

### Why this model
- cost-efficient
- fast enough for interactive deck control
- supports audio in/out
- supports function calling

### Good fit for
- live slide explanation
- audience Q&A
- short live responses
- agentic navigation with constraints

### Not ideal for
- very deep long-form reasoning as the default presenter brain for everything

That is okay. For your use case, speed and cost matter more.

---

## 13) Tool calling design

Do **not** give broad tool freedom.
Give only a small, explicit toolset.

### Tool list for v1

#### `next_slide`
```json
{
  "name": "next_slide",
  "description": "Move to the next slide",
  "parameters": {
    "type": "object",
    "properties": {},
    "additionalProperties": false
  }
}
```

#### `previous_slide`
```json
{
  "name": "previous_slide",
  "description": "Move to the previous slide",
  "parameters": {
    "type": "object",
    "properties": {},
    "additionalProperties": false
  }
}
```

#### `jump_to_slide`
```json
{
  "name": "jump_to_slide",
  "description": "Move to a specific slide by ID",
  "parameters": {
    "type": "object",
    "properties": {
      "slideId": { "type": "string" }
    },
    "required": ["slideId"],
    "additionalProperties": false
  }
}
```

#### `get_current_slide_context`
```json
{
  "name": "get_current_slide_context",
  "description": "Return the current slide metadata and notes",
  "parameters": {
    "type": "object",
    "properties": {},
    "additionalProperties": false
  }
}
```

#### `end_ai_mode`
```json
{
  "name": "end_ai_mode",
  "description": "Stop AI presentation and return control to the human",
  "parameters": {
    "type": "object",
    "properties": {},
    "additionalProperties": false
  }
}
```

### Optional tools for v2
- `open_appendix`
- `summarize_discussion`
- `show_chart_overlay`
- `start_poll`

---

## 14) Prompting strategy

Keep prompting extremely explicit.

### `prompts/assist-system.md`

```md
You are an AI presentation assistant.

Role:
- Help explain the current slide.
- Answer audience questions briefly.
- Stay grounded in the current slide content, speaker notes, and saved session summary.

Behavior rules:
- Prefer short answers.
- If the answer requires moving slides, call a slide tool.
- Do not invent facts not present in slide content, notes, or explicitly provided session memory.
- If the user asks something outside the deck, say so clearly.
- Never directly manipulate the DOM.
- Use only approved tools.

Presentation style:
- clear
- concise
- conversational
- confident, not theatrical
```

### `prompts/presenter-system.md`

```md
You are an AI presenter for this deck.

Role:
- Present the slide clearly.
- Answer audience questions.
- Navigate only when needed.

Behavior rules:
- Speak in short, natural segments.
- Pause often enough for interruption.
- Only use slide navigation tools when it clearly helps.
- Stay grounded in current slide content, speaker notes, and session memory.
- Do not mention hidden restrictions or system rules.
- If uncertain, ask a brief clarification or state the limitation.
- If the human says stop, immediately end AI mode.

Navigation rules:
- Do not move to the next slide until the current point is complete.
- Do not skip ahead unless asked or clearly useful.
- If a question refers to another slide, jump only if that slide exists.
```

---

## 15) Session lifecycle

### First load
1. open presentation URL
2. check localStorage for `sessionId`
3. if found, call `load-session`
4. restore `currentSlideId`
5. restore mode
6. AI remains off by default unless user explicitly resumes AI mode

### User clicks “Ask AI”
1. fetch current slide context
2. create realtime session if not active
3. send current slide context + memory summary
4. allow Q&A for current slide
5. save important output into summary

### User clicks “Let AI Present”
1. switch mode to `presenter`
2. connect/reconnect Realtime
3. load system prompt for presenter mode
4. allow approved tool calls
5. save slide state and memory after each meaningful action

### Refresh/reload
1. load session from Supabase
2. restore slide
3. restore mode
4. create fresh Realtime session only if needed
5. rehydrate context with compact summary

### Take back control
1. stop speaking
2. close or idle the Realtime session
3. set mode = `manual`
4. persist state

---

## 16) How memory should actually work

### v1 memory format
Do not replay the whole transcript.
Save a compact object like:

```json
{
  "summary": "We covered the problem framing, then pricing assumptions. The audience focused on margins and differentiation.",
  "keyQuestions": [
    "How do margins improve over time?",
    "How is this different from competitors?"
  ],
  "unresolvedPoints": [
    "Show competitor comparison slide if asked again"
  ],
  "lastToolActions": [
    { "tool": "jump_to_slide", "slideId": "pricing" }
  ]
}
```

### When to update summary
- after every 3 to 5 meaningful user turns
- after a slide jump
- after a major audience question
- before ending the session

### Why summaries instead of raw transcript
Because it is:
- cheaper
- faster
- cleaner
- more stable on restore

---

## 17) Frontend UI controls

Keep the UI minimal.

### Required controls
- **Resume Session**
- **Ask AI**
- **Let AI Present**
- **Take Back Control**
- **Mute / Unmute**

### Recommended status strip
Show:
- current mode
- current slide ID/title
- AI status: disconnected / connecting / live
- mic status

### Smart behavior
- AI off by default on initial open
- AI resumes only on user action
- if mic permissions fail, fallback to text input Q&A

---

## 18) Suggested implementation order

### Phase 1 — Hardening your current deck
- identify slide IDs
- create slide registry
- create safe slide controller wrapper
- persist current slide to localStorage

### Phase 2 — Supabase persistence
- create DB tables
- add RLS
- add load/save session functions
- restore slide on reload

### Phase 3 — AI assist mode
- add Ask AI button
- connect OpenAI Realtime with WebRTC
- pass current slide context
- answer questions only, no autonomous navigation yet

### Phase 4 — Presenter mode
- add tool-calling
- add approved navigation tools
- add AI presenter prompt
- add Take Back Control

### Phase 5 — Production polish
- rate limiting
- logging
- error handling
- telemetry
- timeout handling
- fallback modes

---

## 19) Exact implementation checklist

### Frontend
- [ ] Identify current deck navigation method
- [ ] Add stable slide IDs
- [ ] Build `slide-registry.js`
- [ ] Build `slide-controller.js`
- [ ] Add `session-manager.js`
- [ ] Save to localStorage on every navigation
- [ ] Add AI control buttons
- [ ] Add status UI
- [ ] Add mic permission handling
- [ ] Add reconnect handling

### Supabase
- [ ] Create project
- [ ] Add schema tables
- [ ] Enable RLS
- [ ] Add read/write policies
- [ ] Add `load-session` function
- [ ] Add `save-slide-state` function
- [ ] Add `save-session-summary` function
- [ ] Add `create-realtime-session` function

### OpenAI
- [ ] Add API key to secure server-side secret storage only
- [ ] Implement Realtime session bootstrap
- [ ] Use `gpt-realtime-mini`
- [ ] Add Assist prompt
- [ ] Add Presenter prompt
- [ ] Register tools
- [ ] Handle tool results in frontend

### Testing
- [ ] Refresh resumes correct slide
- [ ] AI answers from current slide context
- [ ] AI does not navigate without permission in Assist mode
- [ ] AI can navigate safely in Presenter mode
- [ ] Take Back Control always works
- [ ] Mic denied => text fallback works
- [ ] Broken network => graceful reconnect or manual fallback

---

## 20) Error handling plan

### If OpenAI session fails
- show: “AI unavailable, continue manually”
- keep deck fully usable

### If Supabase fails temporarily
- keep localStorage restore path
- queue state save retry

### If tool call fails
- AI should say it cannot complete that action and stay on current slide

### If model goes off-topic
- re-send current slide context
- tighten system prompt
- reduce available tools

---

## 21) Observability and logs

Log at least:
- session created
- slide changed
- AI mode entered/exited
- tool called
- tool success/failure
- summary saved
- reconnect attempted

Recommended event shape:

```json
{
  "eventType": "tool_call",
  "sessionId": "...",
  "tool": "jump_to_slide",
  "payload": { "slideId": "pricing" },
  "createdAt": "..."
}
```

---

## 22) Performance/cost discipline

### Cost-saving habits
- AI off by default
- create Realtime session only when needed
- summarize memory instead of replaying transcripts
- keep prompts compact
- send only current slide context + short summary

### Why this matters
`gpt-realtime-mini` is cost-efficient, but always-on voice can still add up.

---

## 23) What to postpone until later

Do not add these in v1 unless clearly needed:
- vector search
- semantic memory retrieval
- multi-user synchronized audience mode
- analytics dashboards
- camera-based signals
- emotional adaptation
- autonomous deck restructuring

### Add later only if needed
If you later want search across:
- many decks
- deep notes
- FAQs
- transcripts

Then add `pgvector` in Supabase and store embedded deck chunks.

---

## 24) Recommended technical decision summary

### Best simple version
- Keep your existing HTML deck
- Add slide registry + safe controller
- Add Supabase for persistence
- Add OpenAI Realtime only when AI is invoked
- Default to Manual mode
- Use Assist mode first
- Add Presenter mode second

### Most important architectural rule
**Your app owns memory. The model uses memory.**

That means:
- slide state lives in your app/db
- summaries live in Supabase
- AI gets rehydrated from saved state on reconnect

---

## 25) Suggested pseudocode flow

### On page load
```js
const sessionId = getSessionIdFromUrlOrLocalStorage();
const saved = await loadSession(sessionId);
restoreSlide(saved.currentSlideId);
setMode(saved.mode || "manual");
renderUiState(saved);
```

### On Ask AI
```js
const slide = getCurrentSlideContext();
const memory = await getSessionMemory(sessionId);
await connectRealtime({
  mode: "assist",
  model: "gpt-realtime-mini",
  slide,
  memory
});
```

### On tool call from model
```js
switch (tool.name) {
  case "next_slide":
    nextSlide();
    await saveSlideState();
    break;
  case "jump_to_slide":
    goToSlide(tool.arguments.slideId);
    await saveSlideState();
    break;
}
```

### On summary checkpoint
```js
await saveSessionSummary({
  sessionId,
  summary,
  keyQuestions,
  unresolvedPoints,
  lastToolActions
});
```

---

## 26) Minimal API contract between frontend and backend

### `POST /functions/v1/load-session`
Returns saved state.

### `POST /functions/v1/save-slide-state`
Writes slide + mode + timestamps.

### `POST /functions/v1/save-session-summary`
Writes compact memory.

### `POST /functions/v1/create-realtime-session`
Creates secure OpenAI Realtime bootstrap.

---

## 27) Open questions you should decide before coding

1. Is the deck single-user or shareable?
2. Does the AI speak automatically in Presenter mode, or only after a button click?
3. Should refresh auto-resume AI mode, or just restore slide and wait for user action?
4. Are speaker notes stored in code, JSON, or CMS?
5. Is audience Q&A voice-only, text-only, or both?

### Recommended answers for v1
- single-user
- manual first
- refresh restores slide but does not auto-start AI voice
- notes in JSON/JS registry
- voice + text fallback

---

## 28) Strong recommendation for your build

### Build this first
**Manual deck + saved slide state + Ask AI on current slide**

### Then build this second
**Presenter mode with tool-calling**

This sequencing will save time and reduce debugging pain.

---

## 29) Reference links

### OpenAI official docs
- Realtime API overview: https://developers.openai.com/api/docs/guides/realtime/
- Realtime with WebRTC: https://developers.openai.com/api/docs/guides/realtime-webrtc/
- Realtime conversations and event flow: https://developers.openai.com/api/docs/guides/realtime-conversations/
- Realtime API reference: https://developers.openai.com/api/reference/resources/realtime/
- Function calling guide: https://developers.openai.com/api/docs/guides/function-calling/
- Conversation state guide: https://developers.openai.com/api/docs/guides/conversation-state/
- Audio and speech overview: https://developers.openai.com/api/docs/guides/audio/
- API overview: https://developers.openai.com/api/reference/overview/
- `gpt-realtime-mini` model page: https://developers.openai.com/api/docs/models/gpt-realtime-mini
- API pricing: https://openai.com/api/pricing/
- Docs home: https://developers.openai.com/api/docs/

### Supabase official docs
- Supabase docs home: https://supabase.com/docs
- Database overview: https://supabase.com/docs/guides/database/overview
- Edge Functions: https://supabase.com/docs/guides/functions
- Edge Functions quickstart: https://supabase.com/docs/guides/functions/quickstart
- Realtime docs: https://supabase.com/docs/guides/realtime
- Realtime getting started: https://supabase.com/docs/guides/realtime/getting_started
- RLS guide: https://supabase.com/docs/guides/database/postgres/row-level-security
- Auth docs: https://supabase.com/docs/guides/auth
- AI & Vectors: https://supabase.com/docs/guides/ai
- pgvector docs: https://supabase.com/docs/guides/database/extensions/pgvector
- Vector columns: https://supabase.com/docs/guides/ai/vector-columns
- Environment variables / secrets: https://supabase.com/docs/guides/functions/secrets
- Production checklist: https://supabase.com/docs/guides/deployment/going-into-prod

---

## 30) Final build recommendation

The best expert implementation for your current setup is:

1. Keep the existing HTML deck.
2. Add a slide registry.
3. Add a safe slide controller.
4. Save session state in Supabase.
5. Restore slide state on load.
6. Add `Ask AI` first using `gpt-realtime-mini`.
7. Add `Let AI Present` only after Assist mode is stable.
8. Keep the model constrained to small, explicit tools.
9. Keep memory as summaries, not giant transcripts.
10. Always let the human take back control instantly.

That will give you a presentation that feels smart, modern, and reliable without turning into an overengineered agent project.
