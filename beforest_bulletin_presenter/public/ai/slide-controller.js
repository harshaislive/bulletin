// Slide Controller - Safe navigation wrapper
// AI can only interact with slides through these functions
// DOM manipulation is strictly forbidden for the AI

import { getSlideById, getSlideIndex, getNextSlide, getPrevSlide, slides } from './slide-registry.js';
import { saveSlideState, loadSlideState } from './session-manager.js';

let currentSlideId = null;
let initialized = false;

// Initialize from current URL or saved state
export async function initSlideController() {
  if (initialized) return;
  
  // Try to get slide ID from current URL
  const pathParts = window.location.pathname.split('/');
  const filename = pathParts[pathParts.length - 1];
  
  if (filename && filename.startsWith('slide-')) {
    // Extract slide ID from filename
    currentSlideId = filename.replace('.html', '');
  } else if (filename === 'index.html' || filename === '') {
    // Default to first slide of team if on index
    const teamFolder = pathParts[pathParts.length - 2];
    if (teamFolder && teamFolder !== 'ppt-bulletin-v2') {
      const teamSlides = slides.filter(s => s.team === teamFolder);
      if (teamSlides.length > 0) {
        currentSlideId = teamSlides[0].id;
      }
    }
  }
  
  // Try loading from localStorage if no URL match
  if (!currentSlideId) {
    const saved = loadSlideState();
    if (saved && saved.currentSlideId) {
      currentSlideId = saved.currentSlideId;
    }
  }
  
  // Fallback to first slide
  if (!currentSlideId) {
    currentSlideId = slides[0].id;
  }
  
  initialized = true;
  
  // Save initial state
  await saveSlideState(currentSlideId, getCurrentMode());
  
  return currentSlideId;
}

// Get current slide ID
export function getCurrentSlideId() {
  return currentSlideId;
}

// Get full current slide context for AI
export function getCurrentSlideContext() {
  const slide = getSlideById(currentSlideId);
  return slide || null;
}

// Move to next slide
export async function nextSlide() {
  const next = getNextSlide(currentSlideId);
  if (!next) {
    return { ok: false, reason: "Already at last slide" };
  }
  
  currentSlideId = next.id;
  await navigateToSlideFile(next);
  
  return { ok: true, slideId: currentSlideId, slide: next };
}

// Move to previous slide
export async function prevSlide() {
  const prev = getPrevSlide(currentSlideId);
  if (!prev) {
    return { ok: false, reason: "Already at first slide" };
  }
  
  currentSlideId = prev.id;
  await navigateToSlideFile(prev);
  
  return { ok: true, slideId: currentSlideId, slide: prev };
}

// Jump to specific slide by ID
export async function jumpToSlide(slideId) {
  const slide = getSlideById(slideId);
  if (!slide) {
    return { ok: false, reason: "Unknown slide ID" };
  }
  
  currentSlideId = slideId;
  await navigateToSlideFile(slide);
  
  return { ok: true, slideId: currentSlideId, slide };
}

// Navigate to a slide by providing the slide object
async function navigateToSlideFile(slide) {
  // Build the path to the slide file
  const basePath = window.location.pathname.split('/').slice(0, -1).join('/');
  const slidePath = `${basePath}/${slide.id}.html`;
  
  // Save state before navigating
  await saveSlideState(currentSlideId, getCurrentMode());
  
  // Navigate
  window.location.href = slidePath;
}

// Get all available slides for AI reference
export function getAllSlides() {
  return slides;
}

// Get available slide IDs for validation
export function getAvailableSlideIds() {
  return slides.map(s => s.id);
}

// Mode management
let currentMode = 'manual'; // 'manual', 'assist', 'presenter'

export function getCurrentMode() {
  return currentMode;
}

export function setMode(mode) {
  if (['manual', 'assist', 'presenter'].includes(mode)) {
    currentMode = mode;
    saveSlideState(currentSlideId, currentMode);
    return { ok: true, mode: currentMode };
  }
  return { ok: false, reason: "Invalid mode" };
}

// Get presentation flow (ordered list)
export function getPresentationFlow() {
  return slides.map(s => ({ id: s.id, title: s.title, team: s.team }));
}

// Get team flow for a specific team
export function getTeamFlow(team) {
  return slides.filter(s => s.team === team).map(s => ({ id: s.id, title: s.title }));
}
