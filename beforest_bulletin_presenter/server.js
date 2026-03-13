const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

let supabase = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
  const { createClient } = require('@supabase/supabase-js');
  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
}

const app = express();
const PORT = process.env.PORT || 3100;

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'Team Image Library')));
app.use('/fonts', express.static(path.join(__dirname, 'fonts')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'orchestrator.html'));
});

app.post('/api/healthcheck', (req, res) => {
  res.json({ ok: true });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    openai: Boolean(process.env.OPENAI_API_KEY),
    supabase: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY)
  });
});

app.post('/api/create-session', async (req, res) => {
  try {
    if (!supabase) {
      return res.json({ sessionId: null });
    }

    const { data: presentation } = await supabase
      .from('presentations')
      .select('id')
      .eq('slug', 'beforest-bulletin')
      .single();

    if (!presentation) {
      return res.json({ sessionId: null, error: 'Presentation missing in Supabase' });
    }

    const { data: session, error } = await supabase
      .from('presentation_sessions')
      .insert({
        presentation_id: presentation.id,
        current_slide_id: 'bi-intro',
        mode: 'manual'
      })
      .select()
      .single();

    if (error) throw error;

    await supabase.from('presentation_memory').insert({ session_id: session.id });
    res.json({ sessionId: session.id });
  } catch (err) {
    console.error('Create session error:', err);
    res.status(500).json({ sessionId: null, error: err.message });
  }
});

app.post('/api/save-slide-state', async (req, res) => {
  try {
    const { sessionId, slideId, mode } = req.body;
    if (sessionId && supabase) {
      await supabase
        .from('presentation_sessions')
        .update({
          current_slide_id: slideId,
          mode: mode || 'manual',
          last_activity_at: new Date().toISOString()
        })
        .eq('id', sessionId);
    }
    res.json({ ok: true });
  } catch (err) {
    console.error('Save slide state error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.post('/api/realtime/session', async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(400).json({ error: 'OPENAI_API_KEY is missing' });
    }

    const { voice, instructions } = req.body || {};
    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'realtime=v1'
      },
      body: JSON.stringify({
        model: 'gpt-realtime-mini',
        voice: voice || 'alloy',
        modalities: ['audio', 'text'],
        instructions: instructions || 'You are the live presenter for the Beforest bulletin. Speak concisely, clearly, and with calm confidence.'
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Failed to create realtime session' });
    }

    res.json({ session: data });
  } catch (err) {
    console.error('Realtime session error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/ai-present', async (req, res) => {
  try {
    const { title, team, contextText } = req.body || {};

    if (!process.env.OPENAI_API_KEY) {
      const fallback = (contextText || `${team || 'Beforest'}. ${title || 'Presentation slide'}.`)
        .replace(/\s+/g, ' ')
        .trim()
        .split(/(?<=[.!?])\s+/)
        .slice(0, 2)
        .join(' ');
      return res.json({ script: fallback });
    }

    const { OpenAI } = require('openai');
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.6,
      max_tokens: 140,
      messages: [
        {
          role: 'system',
          content: 'Write a crisp 2-3 sentence spoken presentation script using the actual slide copy. Sound premium, calm, and concise.'
        },
        {
          role: 'user',
          content: `Team: ${team || 'Beforest'}\nTitle: ${title || 'Slide'}\nSlide copy: ${contextText || 'Not provided'}`
        }
      ]
    });

    res.json({ script: response.choices[0]?.message?.content || '' });
  } catch (err) {
    console.error('AI present error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Beforest presenter running on http://localhost:${PORT}`);
});
