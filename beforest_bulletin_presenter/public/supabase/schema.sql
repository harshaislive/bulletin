-- Supabase Schema for Beforest Bulletin AI Presentation
-- Run this in your Supabase SQL Editor

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- 1. Presentations table
create table if not exists presentations (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  title text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Presentation Sessions table
create table if not exists presentation_sessions (
  id uuid primary key default uuid_generate_v4(),
  presentation_id uuid references presentations(id) on delete cascade,
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

-- 3. Presentation Memory table
create table if not exists presentation_memory (
  session_id uuid primary key references presentation_sessions(id) on delete cascade,
  summary text not null default '',
  key_questions jsonb not null default '[]'::jsonb,
  unresolved_points jsonb not null default '[]'::jsonb,
  audience_notes jsonb not null default '[]'::jsonb,
  last_tool_actions jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- 4. Presentation Events table (for logging)
create table if not exists presentation_events (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references presentation_sessions(id) on delete cascade,
  event_type text not null,
  speaker text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- 5. Create indexes
create index idx_sessions_presentation on presentation_sessions(presentation_id);
create index idx_sessions_status on presentation_sessions(session_status);
create index idx_events_session on presentation_events(session_id);
create index idx_events_created on presentation_events(created_at);

-- 6. Row Level Security (RLS)
-- Enable RLS on all tables
alter table presentations enable row level security;
alter table presentation_sessions enable row level security;
alter table presentation_memory enable row level security;
alter table presentation_events enable row level security;

-- 7. RLS Policies
-- For now, allow all operations (can be restricted later with auth)
create policy "Allow all on presentations" on presentations for all using (true);
create policy "Allow all on sessions" on presentation_sessions for all using (true);
create policy "Allow all on memory" on presentation_memory for all using (true);
create policy "Allow all on events" on presentation_events for all using (true);

-- 8. Insert default presentation
insert into presentations (slug, title, description) 
values ('beforest-bulletin', 'Beforest Monthly Bulletin', 'Monthly team update presentation');

-- 9. Function to update updated_at timestamp
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger update_presentations_updated_at
  before update on presentations
  for each row execute function update_updated_at();

create trigger update_sessions_updated_at
  before update on presentation_sessions
  for each row execute function update_updated_at();

create trigger update_memory_updated_at
  before update on presentation_memory
  for each row execute function update_updated_at();

-- 10. Function to create a new session
create or replace function create_session(
  p_presentation_id uuid,
  p_session_name text default null,
  p_owner_user_id uuid default null
)
returns uuid as $$
declare
  v_session_id uuid;
begin
  insert into presentation_sessions (presentation_id, owner_user_id, session_name, current_slide_id, mode)
  values (p_presentation_id, p_owner_user_id, p_session_name, 'bi-intro', 'manual')
  returning id into v_session_id;
  
  -- Initialize memory
  insert into presentation_memory (session_id) values (v_session_id);
  
  return v_session_id;
end;
$$ language plpgsql security definer;

-- 11. Function to save slide state
create or replace function save_slide_state(
  p_session_id uuid,
  p_slide_id text,
  p_mode text
)
returns void as $$
begin
  update presentation_sessions
  set current_slide_id = p_slide_id,
      mode = p_mode,
      last_activity_at = now()
  where id = p_session_id;
end;
$$ language plpgsql security definer;

-- 12. Function to save session summary
create or replace function save_summary(
  p_session_id uuid,
  p_summary text,
  p_key_questions jsonb default '[]'::jsonb,
  p_unresolved_points jsonb default '[]'::jsonb
)
returns void as $$
begin
  update presentation_memory
  set summary = p_summary,
      key_questions = p_key_questions,
      unresolved_points = p_unresolved_points,
      updated_at = now()
  where session_id = p_session_id;
end;
$$ language plpgsql security definer;

-- 13. Function to log an event
create or replace function log_event(
  p_session_id uuid,
  p_event_type text,
  p_speaker text default null,
  p_payload jsonb default '{}'::jsonb
)
returns void as $$
begin
  insert into presentation_events (session_id, event_type, speaker, payload)
  values (p_session_id, p_event_type, p_speaker, p_payload);
end;
$$ language plpgsql security definer;

-- 14. Function to load session with memory
create or replace function load_session(p_session_id uuid)
returns table (
  id uuid,
  current_slide_id text,
  mode text,
  voice_enabled boolean,
  session_status text,
  summary text,
  key_questions jsonb,
  unresolved_points jsonb
) as $$
begin
  return query
  select 
    s.id,
    s.current_slide_id,
    s.mode,
    s.voice_enabled,
    s.session_status,
    coalesce(m.summary, ''),
    coalesce(m.key_questions, '[]'::jsonb),
    coalesce(m.unresolved_points, '[]'::jsonb)
  from presentation_sessions s
  left join presentation_memory m on m.session_id = s.id
  where s.id = p_session_id;
end;
$$ language plpgsql security definer;
