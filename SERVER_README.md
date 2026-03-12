# Beforest Bulletin - Node.js Server

## Prerequisites

1. Node.js installed
2. Supabase project
3. OpenAI API key

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and add your keys:

```bash
cp .env.example .env
```

Edit `.env`:
```
PORT=3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
OPENAI_API_KEY=sk-your-openai-key
```

### 3. Set up Supabase

Run this SQL in your Supabase SQL Editor:

```sql
-- Enable required extensions
create extension if not exists "uuid-ossp";

-- Presentations table
create table presentations (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  title text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Sessions table
create table presentation_sessions (
  id uuid primary key default uuid_generate_v4(),
  presentation_id uuid references presentations(id) on delete cascade,
  current_slide_id text not null,
  mode text default 'manual',
  voice_enabled boolean default false,
  session_status text default 'active',
  last_activity_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Memory table
create table presentation_memory (
  session_id uuid primary key references presentation_sessions(id) on delete cascade,
  summary text default '',
  key_questions jsonb default '[]',
  unresolved_points jsonb default '[]',
  updated_at timestamptz default now()
);

-- Insert default presentation
insert into presentations (slug, title) 
values ('beforest-bulletin', 'Beforest Monthly Bulletin');
```

### 4. Run the Server

```bash
node server.js
```

### 5. Open in Browser

Go to http://localhost:3000

## Features

- **Manual Mode**: Use arrow keys or click Prev/Next
- **Chat**: Click 💬 Chat to ask questions about slides
- **Present**: Click Present for AI-led presentation
- **Persistence**: Slide position saved to Supabase

## API Endpoints

- `POST /api/create-session` - Create new session
- `POST /api/load-session` - Load existing session
- `POST /api/save-slide-state` - Save current slide
- `POST /api/chat` - Chat with AI
- `GET /api/health` - Health check

## Project Structure

```
ppt-bulletin/
├── server.js           # Express server
├── package.json        # Dependencies
├── .env               # Environment (not committed)
├── .env.example       # Environment template
├── ppt-bulletin-v2/
│   ├── index.html     # Main entry
│   ├── nav.js         # Navigation + AI UI
│   └── ai/
│       └── ai-client.js  # Chat client
└── supabase/
    └── schema.sql     # SQL schema (optional)
```
