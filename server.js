require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Only import if variables are set
let supabase = null;
let openai = null;

if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
  const { createClient } = require('@supabase/supabase-js');
  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
}

if (process.env.OPENAI_API_KEY) {
  const { OpenAI } = require('openai');
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve ppt-bulletin-v2 files
app.use(express.static(path.join(__dirname, 'ppt-bulletin-v2')));

// Serve Team Image Library
app.use('/images', express.static(path.join(__dirname, 'Team Image Library')));

// Serve fonts
app.use('/fonts', express.static(path.join(__dirname, 'fonts')));

// Serve index.html as root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'ppt-bulletin-v2', 'orchestrator.html'));
});

// Slides data (embedded for AI context)
const slides = [
  { id: "bi-intro", team: "bi", title: "BI / Business Intelligence", tags: ["intro", "bi"] },
  { id: "bi-cover", team: "bi", title: "Automation Overview", tags: ["bi", "automation"] },
  { id: "bi-openclaw", team: "bi", title: "Openclaw - Autonomous Assistant", tags: ["bi", "ai", "openclaw"] },
  { id: "bi-schema", team: "bi", title: "Activity / Output / Outcome / Impact", tags: ["bi", "details"] },
  { id: "bi-workflows", team: "bi", title: "The 4 Workflows", tags: ["bi", "workflows"] },
  { id: "bi-thankyou", team: "bi", title: "Thank You", tags: ["end"] },
  { id: "bhopal-intro", team: "bhopal-collective", title: "Bhopal Collective", tags: ["intro"] },
  { id: "bhopal-cover", team: "bhopal-collective", title: "Infrastructure & Agriculture", tags: ["bhopal"] },
  { id: "bhopal-schema", team: "bhopal-collective", title: "Activity / Output / Outcome / Impact", tags: ["bhopal"] },
  { id: "bhopal-agriculture", team: "bhopal-collective", title: "Agriculture - Crops", tags: ["bhopal", "farming"] },
  { id: "bhopal-experience", team: "bhopal-collective", title: "First Forest Ranger Experience", tags: ["bhopal", "experience"] },
  { id: "hospitality-intro", team: "hospitality", title: "Hospitality", tags: ["intro"] },
  { id: "hospitality-cover", team: "hospitality", title: "Guest Experience", tags: ["hospitality"] },
  { id: "hospitality-schema", team: "hospitality", title: "Activity / Output / Outcome / Impact", tags: ["hospitality"] },
  { id: "hospitality-food", team: "hospitality", title: "Food & Beverage", tags: ["hospitality", "food"] },
  { id: "hospitality-arrival", team: "hospitality", title: "Arrival Experience", tags: ["hospitality"] },
  { id: "community-intro", team: "community-experience", title: "Community Experience", tags: ["intro"] },
  { id: "community-cover", team: "community-experience", title: "Three Experience Formats", tags: ["community"] },
  { id: "community-schema", team: "community-experience", title: "Activity / Output / Outcome / Impact", tags: ["community"] },
  { id: "community-bhopal", team: "community-experience", title: "Forest Ranger - Bhopal", tags: ["community", "bhopal"] },
  { id: "community-mumbai", team: "community-experience", title: "Starry Nights - Mumbai", tags: ["community", "mumbai"] },
  { id: "bewild-intro", team: "bewild", title: "Bewild", tags: ["intro"] },
  { id: "bewild-cover", team: "bewild", title: "Products & Brand", tags: ["bewild"] },
  { id: "bewild-schema", team: "bewild", title: "Activity / Output / Outcome / Impact", tags: ["bewild"] },
  { id: "bewild-storefront", team: "bewild", title: "Storefront & Products", tags: ["bewild"] },
  { id: "bewild-market", team: "bewild", title: "Market Presence", tags: ["bewild"] },
  { id: "mumbai-intro", team: "mumbai-collective", title: "Mumbai Collective", tags: ["intro"] },
  { id: "mumbai-cover", team: "mumbai-collective", title: "Field & Experiences", tags: ["mumbai"] },
  { id: "mumbai-field", team: "mumbai-collective", title: "Field Work", tags: ["mumbai"] },
  { id: "mumbai-protection", team: "mumbai-collective", title: "Protection", tags: ["mumbai"] },
  { id: "mumbai-experience", team: "mumbai-collective", title: "Starry Nights Experience", tags: ["mumbai"] },
  { id: "hammiyala-intro", team: "hammiyala-collective", title: "Hammiyala Collective", tags: ["intro"] },
  { id: "hammiyala-cover", team: "hammiyala-collective", title: "Overview", tags: ["hammiyala"] },
  { id: "hammiyala-schema", team: "hammiyala-collective", title: "Activity / Output / Outcome / Impact", tags: ["hammiyala"] },
  { id: "hammiyala-crop", team: "hammiyala-collective", title: "Crop Care", tags: ["hammiyala"] },
  { id: "hammiyala-boundary", team: "hammiyala-collective", title: "Boundary & Survey", tags: ["hammiyala"] },
  { id: "hammiyala-infra", team: "hammiyala-collective", title: "Infrastructure", tags: ["hammiyala"] },
  { id: "bodakonda-intro", team: "bodakonda-collective", title: "Bodakonda / Hyderabad", tags: ["intro"] },
  { id: "bodakonda-cover", team: "bodakonda-collective", title: "Terrace Farming", tags: ["bodakonda"] },
  { id: "bodakonda-schema", team: "bodakonda-collective", title: "Activity / Output / Outcome / Impact", tags: ["bodakonda"] },
  { id: "bodakonda-farming", team: "bodakonda-collective", title: "Farming & Rain", tags: ["bodakonda"] },
  { id: "bodakonda-systems", team: "bodakonda-collective", title: "Systems", tags: ["bodakonda"] },
  { id: "bodakonda-biodiversity", team: "bodakonda-collective", title: "Biodiversity & Volunteers", tags: ["bodakonda"] },
  { id: "poomaale1-intro", team: "poomaale-1-0", title: "Poomaale 1.0", tags: ["intro"] },
  { id: "poomaale1-cover", team: "poomaale-1-0", title: "Major Harvest", tags: ["poomaale1"] },
  { id: "poomaale1-schema", team: "poomaale-1-0", title: "Activity / Output / Outcome / Impact", tags: ["poomaale1"] },
  { id: "poomaale1-harvest", team: "poomaale-1-0", title: "Coffee Harvest", tags: ["poomaale1"] },
  { id: "poomaale1-infra", team: "poomaale-1-0", title: "Infrastructure", tags: ["poomaale1"] },
  { id: "poomaale2-intro", team: "poomaale-2-0", title: "Poomaale 2.0", tags: ["intro"] },
  { id: "poomaale2-cover", team: "poomaale-2-0", title: "Field Readiness", tags: ["poomaale2"] },
  { id: "poomaale2-schema", team: "poomaale-2-0", title: "Activity / Output / Outcome / Impact", tags: ["poomaale2"] },
  { id: "poomaale2-crop", team: "poomaale-2-0", title: "Crop Management", tags: ["poomaale2"] },
  { id: "poomaale2-safety", team: "poomaale-2-0", title: "Safety", tags: ["poomaale2"] },
  { id: "hr-intro", team: "human-resources", title: "Human Resources", tags: ["intro"] },
  { id: "hr-cover", team: "human-resources", title: "People & Culture", tags: ["hr"] },
  { id: "hr-schema", team: "human-resources", title: "Activity / Output / Outcome / Impact", tags: ["hr"] },
  { id: "hr-onboarding", team: "human-resources", title: "New Hires", tags: ["hr"] },
  { id: "hr-fitness", team: "human-resources", title: "Fitness Sankalp", tags: ["hr"] },
  { id: "cds-intro", team: "cds", title: "CD&S", tags: ["intro"] },
  { id: "cds-cover", team: "cds", title: "Landscape Stories", tags: ["cds"] },
  { id: "cds-schema", team: "cds", title: "Activity / Output / Outcome / Impact", tags: ["cds"] },
  { id: "cds-gis", team: "cds", title: "GIS & Mapping", tags: ["cds"] },
  { id: "cds-tools", team: "cds", title: "Tools & Resources", tags: ["cds"] }
];

// Get slide by ID
function getSlideById(id) {
  return slides.find(s => s.id === id);
}

// Get next slide
function getNextSlide(currentId) {
  const idx = slides.findIndex(s => s.id === currentId);
  if (idx >= 0 && idx < slides.length - 1) {
    return slides[idx + 1];
  }
  return null;
}

// Get previous slide
function getPrevSlide(currentId) {
  const idx = slides.findIndex(s => s.id === currentId);
  if (idx > 0) {
    return slides[idx - 1];
  }
  return null;
}

// API Routes

// Load session
app.post('/api/load-session', async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId || !supabase) {
      return res.json({ currentSlideId: 'bi-intro', mode: 'manual', memory: {} });
    }
    
    const { data, error } = await supabase
      .from('presentation_sessions')
      .select('*, presentation_memory(*)')
      .eq('id', sessionId)
      .single();
    
    if (error || !data) {
      return res.json({ currentSlideId: 'bi-intro', mode: 'manual', memory: {} });
    }
    
    res.json({
      currentSlideId: data.current_slide_id,
      mode: data.mode,
      memory: data.presentation_memory?.[0] || {}
    });
  } catch (err) {
    console.error('Load session error:', err);
    res.json({ currentSlideId: 'bi-intro', mode: 'manual', memory: {} });
  }
});

// Save slide state
app.post('/api/save-slide-state', async (req, res) => {
  try {
    const { sessionId, slideId, mode } = req.body;
    
    if (sessionId && supabase) {
      await supabase
        .from('presentation_sessions')
        .update({ current_slide_id: slideId, mode, last_activity_at: new Date().toISOString() })
        .eq('id', sessionId);
    }
    
    res.json({ ok: true });
  } catch (err) {
    console.error('Save slide error:', err);
    res.json({ ok: false, error: err.message });
  }
});

// Save session summary
app.post('/api/save-summary', async (req, res) => {
  try {
    const { sessionId, summary, keyQuestions, unresolvedPoints } = req.body;
    
    if (sessionId && supabase) {
      await supabase
        .from('presentation_memory')
        .update({ 
          summary, 
          key_questions: keyQuestions || [],
          unresolved_points: unresolvedPoints || [],
          updated_at: new Date().toISOString()
        })
        .eq('session_id', sessionId);
    }
    
    res.json({ ok: true });
  } catch (err) {
    console.error('Save summary error:', err);
    res.json({ ok: false, error: err.message });
  }
});

// Create session
app.post('/api/create-session', async (req, res) => {
  try {
    // If Supabase not configured, return null (client will use localStorage fallback)
    if (!supabase) {
      return res.json({ sessionId: null, currentSlideId: 'bi-intro' });
    }
    
    const { presentationId } = req.body;
    
    // Get presentation ID if not provided
    let presId = presentationId;
    if (!presId) {
      const { data: pres } = await supabase
        .from('presentations')
        .select('id')
        .eq('slug', 'beforest-bulletin')
        .single();
      
      if (pres) presId = pres.id;
    }
    
    if (!presId) {
      // Create presentation if doesn't exist
      const { data: newPres } = await supabase
        .from('presentations')
        .insert({ slug: 'beforest-bulletin', title: 'Beforest Monthly Bulletin' })
        .select()
        .single();
      
      presId = newPres.id;
    }
    
    // Create session
    const { data: session, error } = await supabase
      .from('presentation_sessions')
      .insert({
        presentation_id: presId,
        current_slide_id: 'bi-intro',
        mode: 'manual'
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Initialize memory
    await supabase
      .from('presentation_memory')
      .insert({ session_id: session.id });
    
    res.json({ sessionId: session.id, currentSlideId: 'bi-intro' });
  } catch (err) {
    console.error('Create session error:', err);
    res.json({ sessionId: null, error: err.message });
  }
});

// AI Presentation endpoint - generates script for a slide
app.post('/api/ai-present', async (req, res) => {
  try {
    const { slideId, action } = req.body;
    const currentSlide = getSlideById(slideId);
    
    if (!currentSlide) {
      return res.json({ error: 'Slide not found' });
    }

    let nextSlideId = null;
    let shouldEnd = false;

    // Determine next slide
    if (action === 'next' || action === 'start') {
      const next = getNextSlide(slideId);
      if (next) {
        nextSlideId = next.id;
      } else {
        shouldEnd = true;
      }
    }

    // Generate presentation script using AI if available, otherwise use template
    let script = '';
    
    if (openai) {
      const systemPrompt = `You are a professional presenter for Beforest, an ecological organization. 
Generate a 2-3 sentence presentation script for the current slide.
- Keep it conversational and natural
- Highlight key points from the title and tags
- End with what comes next or wrap up

Current slide:
- Team: ${currentSlide.team}
- Title: ${currentSlide.title}
- Tags: ${currentSlide.tags.join(', ')}`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Generate a brief presentation script for this slide.' }
        ],
        temperature: 0.7,
        max_tokens: 150
      });

      script = response.choices[0]?.message?.content || '';
    } else {
      // Fallback script without AI
      script = generateFallbackScript(currentSlide);
    }

    res.json({
      slide: currentSlide,
      script,
      nextSlideId,
      shouldEnd
    });
  } catch (err) {
    console.error('AI present error:', err);
    res.json({ error: err.message });
  }
});

function generateFallbackScript(slide) {
  const team = slide.team.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  
  const scripts = {
    intro: `Welcome to ${team}. Let's explore what they accomplished this month.`,
    cover: `Now let's dive into ${slide.title}.`,
    schema: `Here's a breakdown of their activities, outputs, outcomes, and impact.`,
    thankyou: `Thank you for your attention. Let's continue to the next team.`,
    end: `That's all for now.`
  };

  for (const [tag, text] of Object.entries(scripts)) {
    if (slide.tags.includes(tag)) return text;
  }
  
  return `Let's look at ${slide.title}.`;
}

// AI Chat endpoint (text-based, not Realtime)
app.post('/api/chat', async (req, res) => {
  try {
    const { message, slideId, mode, sessionId } = req.body;
    
    const currentSlide = getSlideById(slideId);
    const nextSlide = getNextSlide(slideId);
    const prevSlide = getPrevSlide(slideId);
    
    const systemPrompt = mode === 'presenter' 
      ? `You are an AI presenter for the Beforest Monthly Bulletin presentation.
        
Current slide: ${currentSlide?.title || 'Unknown'}
Team: ${currentSlide?.team || 'Unknown'}
Tags: ${currentSlide?.tags?.join(', ') || 'None'}

Presentation flow:
- Total slides: ${slides.length}
- You can navigate using slide IDs like 'bi-intro', 'bhopal-cover', etc.

Rules:
- Present the current slide clearly
- Answer questions briefly
- Use slide navigation when helpful
- If asked to navigate, respond with the slide ID to jump to
- Always end your response with action: {"nextSlide": "slide-id"} or {"end": true}`
      
      : `You are an AI presentation assistant for the Beforest Monthly Bulletin.

Current slide: ${currentSlide?.title || 'Unknown'}
Team: ${currentSlide?.team || 'Unknown'}
Tags: ${currentSlide?.tags?.join(', ') || 'None'}

Rules:
- Answer questions about this slide
- Keep answers short and relevant
- Do not navigate unless explicitly asked`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const reply = response.choices[0]?.message?.content || 'I apologize, I could not generate a response.';

    // Try to extract navigation from response
    let action = null;
    try {
      const jsonMatch = reply.match(/\{[^}]+\}/);
      if (jsonMatch) {
        action = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {}

    res.json({ 
      reply,
      slide: currentSlide,
      action
    });
  } catch (err) {
    console.error('Chat error:', err);
    res.json({ reply: 'AI unavailable. Please try again.', error: err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    supabase: !!process.env.SUPABASE_URL,
    openai: !!process.env.OPENAI_API_KEY
  });
});

// Serve the app
app.listen(PORT, () => {
  console.log(`
🚀 Beforest Bulletin Server
   
   Local:   http://localhost:${PORT}
   Health:  http://localhost:${PORT}/api/health
   
   Environment:
   - SUPABASE_URL: ${process.env.SUPABASE_URL ? '✓ set' : '✗ missing'}
   - SUPABASE_ANON_KEY: ${process.env.SUPABASE_ANON_KEY ? '✓ set' : '✗ missing'}
   - OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '✓ set' : '✗ missing'}
  `);
});
