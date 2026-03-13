// Slide Registry - All slides with metadata for AI context
// This enables the AI to understand what slide it's on and provide relevant assistance

export const slides = [
  // BI Team (6 slides)
  {
    id: "bi-intro",
    team: "bi",
    title: "BI / Business Intelligence",
    subtitle: "Systems, performance marketing, AI integrations — and Openclaw.",
    tags: ["intro", "bi", "overview"],
    visibleContent: ["Systems", "Performance marketing", "AI integrations", "Openclaw"],
    allowedFollowups: ["Explain what BI does", "Tell me about Openclaw", "Move to next slide"]
  },
  {
    id: "bi-cover",
    team: "bi",
    title: "Automation Overview",
    subtitle: "4 workflows. AI routing. Calendar integration.",
    tags: ["bi", "automation", "workflows"],
    visibleContent: ["4 workflows deployed", "AI lead qualification", "Calendly-Zoom-Pipedrive sync", "WhatsApp automation"],
    allowedFollowups: ["Explain the workflows", "How does AI routing work?", "Move to next"]
  },
  {
    id: "bi-openclaw",
    team: "bi",
    title: "Openclaw - Autonomous Executive Assistant",
    subtitle: "All of us internally now have Openclaw — an autonomous agent that works 24X7.",
    tags: ["bi", "ai", "openclaw"],
    visibleContent: ["24/7 autonomous agent", "New experiments", "Simulations", "Landing pages generation"],
    allowedFollowups: ["What is Openclaw?", "What can Openclaw do?", "Move to next"]
  },
  {
    id: "bi-schema",
    team: "bi",
    title: "Activity / Output / Outcome / Impact",
    subtitle: "End-to-end automation details.",
    tags: ["bi", "details", "metrics"],
    visibleContent: ["AI qualification", "Calendly integration", "Call capture", "Reschedule handling"],
    allowedFollowups: ["Explain the automation", "What systems are integrated?", "Move forward"]
  },
  {
    id: "bi-workflows",
    team: "bi",
    title: "The 4 Workflows",
    subtitle: "Prospect to pipeline.",
    tags: ["bi", "workflows", "details"],
    visibleContent: ["1-on-1 Flow", "Calendly to Zoom", "Call Capture", "WhatsApp Reschedule"],
    allowedFollowups: ["Walk me through each workflow", "How does the reschedule work?", "Finish presentation"]
  },
  {
    id: "bi-thankyou",
    team: "bi",
    title: "Thank You",
    subtitle: "Questions?",
    tags: ["end", "closing"],
    visibleContent: ["Questions?", "Discussion"],
    allowedFollowups: ["Start over", "Go to first slide"]
  },

  // Bhopal Collective (5 slides)
  {
    id: "bhopal-intro",
    team: "bhopal-collective",
    title: "Bhopal Collective",
    subtitle: "Infrastructure, agriculture, and first steps toward public experiences.",
    tags: ["intro", "collective", "bhopal"],
    visibleContent: ["Infrastructure", "Agriculture", "Public experiences"],
    allowedFollowups: ["Tell me about Bhopal", "What happened this month?", "Next slide"]
  },
  {
    id: "bhopal-cover",
    team: "bhopal-collective",
    title: "Infrastructure & Agriculture",
    subtitle: "Safe trails, growing crops, and first guests.",
    tags: ["bhopal", "infrastructure", "agriculture"],
    visibleContent: ["5 wooden bridges", "10 acres cultivated", "12 Forest Ranger guests"],
    allowedFollowups: ["What infrastructure was built?", "Tell me about the experience", "Next"]
  },
  {
    id: "bhopal-schema",
    team: "bhopal-collective",
    title: "Activity / Output / Outcome / Impact",
    tags: ["bhopal", "details", "metrics"],
    visibleContent: ["Bridges installed", "Crops harvested", "Experience pilot"],
    allowedFollowups: ["What was accomplished?", "How many acres?", "Continue"]
  },
  {
    id: "bhopal-agriculture",
    team: "bhopal-collective",
    title: "Agriculture - Crops across 10 acres",
    tags: ["bhopal", "farming", "crops"],
    visibleContent: ["Pigeon Pea", "Mustard", "Wheat varieties"],
    allowedFollowups: ["What crops were grown?", "Tell me about harvesting", "Next"]
  },
  {
    id: "bhopal-experience",
    team: "bhopal-collective",
    title: "First Forest Ranger Experience",
    tags: ["bhopal", "experience", "guests"],
    visibleContent: ["12 participants", "Vegetable harvesting", "Nature walk", "Camping"],
    allowedFollowups: ["How did the event go?", "What did guests experience?", "Next"]
  },

  // Hospitality (5 slides)
  {
    id: "hospitality-intro",
    team: "hospitality",
    title: "Hospitality",
    subtitle: "Blyton's guest experience refined.",
    tags: ["intro", "hospitality", "guest"],
    visibleContent: ["Guest experience", "Food & beverage", "Stay"],
    allowedFollowups: ["What does hospitality do?", "What's new?", "Next"]
  },
  {
    id: "hospitality-cover",
    team: "hospitality",
    title: "Guest Experience",
    tags: ["hospitality", "guests", "overview"],
    visibleContent: ["Farm to table", "Elevated offerings"],
    allowedFollowups: ["Tell me about the guest experience", "What's new?", "Next"]
  },
  {
    id: "hospitality-schema",
    team: "hospitality",
    title: "Activity / Output / Outcome / Impact",
    tags: ["hospitality", "details", "metrics"],
    visibleContent: ["Kombucha launched", "Menu additions", "Table service", "Road improvement"],
    allowedFollowups: ["What was achieved?", "Revenue details?", "Continue"]
  },
  {
    id: "hospitality-food",
    team: "hospitality",
    title: "Food & Beverage",
    tags: ["hospitality", "food", "kombucha"],
    visibleContent: ["Kombucha (Ginger & Mint)", "Broad beans", "Beetroot raita"],
    allowedFollowups: ["What's on the menu?", "Tell me about Kombucha", "Next"]
  },
  {
    id: "hospitality-arrival",
    team: "hospitality",
    title: "Arrival Experience",
    tags: ["hospitality", "arrival", "road"],
    visibleContent: ["Table service", "Road improvements"],
    allowedFollowups: ["How was the arrival improved?", "Next"]
  },

  // Community Experience (5 slides)
  {
    id: "community-intro",
    team: "community-experience",
    title: "Community Experience",
    subtitle: "Experiences that turn visitors into participants.",
    tags: ["intro", "experience", "community"],
    visibleContent: ["Experiences", "Visitors", "Participants"],
    allowedFollowups: ["What is Community Experience?", "Next"]
  },
  {
    id: "community-cover",
    team: "community-experience",
    title: "Three Experience Formats",
    tags: ["community", "overview", "formats"],
    visibleContent: ["Forest Ranger", "Starry Nights", "Community Bund"],
    allowedFollowups: ["Tell me about the formats", "Next"]
  },
  {
    id: "community-schema",
    team: "community-experience",
    title: "Activity / Output / Outcome / Impact",
    tags: ["community", "details"],
    visibleContent: ["Events hosted", "Scientific approach", "Membership"],
    allowedFollowups: ["What was accomplished?", "Continue"]
  },
  {
    id: "community-bhopal",
    team: "community-experience",
    title: "Forest Ranger - Bhopal",
    tags: ["community", "bhopal", "forest ranger"],
    visibleContent: ["12 participants", "Camping pilot", "Bush lunch"],
    allowedFollowups: ["Tell me about Bhopal experience", "Next"]
  },
  {
    id: "community-mumbai",
    team: "community-experience",
    title: "Starry Nights - Mumbai",
    tags: ["community", "mumbai", "stars"],
    visibleContent: ["Starry Nights event", "Sunset viewing"],
    allowedFollowups: ["Tell me about Mumbai experience", "Next"]
  },

  // Bewild (5 slides)
  {
    id: "bewild-intro",
    team: "bewild",
    title: "Bewild",
    subtitle: "Products, storefront, and brand presence.",
    tags: ["intro", "bewild", "products"],
    visibleContent: ["Products", "Storefront", "Brand"],
    allowedFollowups: ["What is Bewild?", "Next"]
  },
  {
    id: "bewild-cover",
    team: "bewild",
    title: "Products & Brand",
    tags: ["bewild", "overview"],
    visibleContent: ["Produce", "Storefront", "Brand presence"],
    allowedFollowups: ["What's new with Bewild?", "Next"]
  },
  {
    id: "bewild-schema",
    team: "bewild",
    title: "Activity / Output / Outcome / Impact",
    tags: ["bewild", "details"],
    visibleContent: ["New products", "Market presence", "Revenue"],
    allowedFollowups: ["What was achieved?", "Continue"]
  },
  {
    id: "bewild-storefront",
    team: "bewild",
    title: "Storefront & Products",
    tags: ["bewild", "storefront", "products"],
    visibleContent: ["Product display", "Packaging", "New items"],
    allowedFollowups: ["Tell me about products", "Next"]
  },
  {
    id: "bewild-market",
    team: "bewild",
    title: "Market Presence",
    tags: ["bewild", "market", "sales"],
    visibleContent: ["Farmers market", "Stalls", "Online"],
    allowedFollowups: ["Where do you sell?", "Next"]
  },

  // Mumbai Collective (6 slides)
  {
    id: "mumbai-intro",
    team: "mumbai-collective",
    title: "Mumbai Collective",
    subtitle: "Field discipline that enables premium experiences.",
    tags: ["intro", "collective", "mumbai"],
    visibleContent: ["Field work", "Protection", "Experiences"],
    allowedFollowups: ["What is Mumbai Collective?", "Next"]
  },
  {
    id: "mumbai-cover",
    team: "mumbai-collective",
    title: "Field & Experiences",
    tags: ["mumbai", "overview"],
    visibleContent: ["Starry Nights", "Field discipline"],
    allowedFollowups: ["Tell me about Mumbai", "Next"]
  },
  {
    id: "mumbai-field",
    team: "mumbai-collective",
    title: "Field Work",
    tags: ["mumbai", "field", "agriculture"],
    visibleContent: ["Plant care", "Nursery", "Vegetables"],
    allowedFollowups: ["What field work was done?", "Next"]
  },
  {
    id: "mumbai-protection",
    team: "mumbai-collective",
    title: "Protection",
    tags: ["mumbai", "protection", "infrastructure"],
    visibleContent: ["Fence repair", "Solar fencing", "Nala bund"],
    allowedFollowups: ["What protection work?", "Next"]
  },
  {
    id: "mumbai-experience",
    team: "mumbai-collective",
    title: "Starry Nights Experience",
    tags: ["mumbai", "experience", "stars"],
    visibleContent: ["Starry Nights", "Premium experience"],
    allowedFollowups: ["Tell me about the experience", "Finish"]
  },

  // Hammiyala Collective (6 slides)
  {
    id: "hammiyala-intro",
    team: "hammiyala-collective",
    title: "Hammiyala Collective",
    subtitle: "Crop care, boundary clarity, and infrastructure.",
    tags: ["intro", "collective", "hammiyala"],
    visibleContent: ["Crop care", "Boundary", "Infrastructure"],
    allowedFollowups: ["What is Hammiyala?", "Next"]
  },
  {
    id: "hammiyala-cover",
    team: "hammiyala-collective",
    title: "Overview",
    tags: ["hammiyala", "overview"],
    visibleContent: ["Cardamom", "Water security", "2,00,000 litre capacity"],
    allowedFollowups: ["Tell me about Hammiyala", "Next"]
  },
  {
    id: "hammiyala-schema",
    team: "hammiyala-collective",
    title: "Activity / Output / Outcome / Impact",
    tags: ["hammiyala", "details"],
    visibleContent: ["Arabica management", "Land survey", "Water infrastructure"],
    allowedFollowups: ["What was achieved?", "Continue"]
  },
  {
    id: "hammiyala-crop",
    team: "hammiyala-collective",
    title: "Crop Care",
    tags: ["hammiyala", "crops", "cardamom"],
    visibleContent: ["Arabica", "Cardamom", "Irrigation"],
    allowedFollowups: ["Tell me about the crops", "Next"]
  },
  {
    id: "hammiyala-boundary",
    team: "hammiyala-collective",
    title: "Boundary & Survey",
    tags: ["hammiyala", "boundary", "land"],
    visibleContent: ["Land survey", "Boundary markers"],
    allowedFollowups: ["What boundary work?", "Next"]
  },
  {
    id: "hammiyala-infra",
    team: "hammiyala-collective",
    title: "Infrastructure",
    tags: ["hammiyala", "infrastructure"],
    visibleContent: ["Road work", "Water tank", "Pond"],
    allowedFollowups: ["What was built?", "Finish"]
  },

  // Bodakonda / Hyderabad (6 slides)
  {
    id: "bodakonda-intro",
    team: "bodakonda-collective",
    title: "Bodakonda / Hyderabad",
    subtitle: "Terrace farming, biodiversity, and community.",
    tags: ["intro", "collective", "hyderabad"],
    visibleContent: ["Terrace farming", "Biodiversity", "Volunteers"],
    allowedFollowups: ["What is Bodakonda?", "Next"]
  },
  {
    id: "bodakonda-cover",
    team: "bodakonda-collective",
    title: "Terrace Farming",
    tags: ["bodakonda", "farming"],
    visibleContent: ["880 kg harvest", "Terrace setup"],
    allowedFollowups: ["Tell me about Hyderabad", "Next"]
  },
  {
    id: "bodakonda-schema",
    team: "bodakonda-collective",
    title: "Activity / Output / Outcome / Impact",
    tags: ["bodakonda", "details"],
    visibleContent: ["Terrace farming", "Apiculture", "Volunteering"],
    allowedFollowups: ["What was achieved?", "Continue"]
  },
  {
    id: "bodakonda-farming",
    team: "bodakonda-collective",
    title: "Farming & Rain",
    tags: ["bodakonda", "farming", "rain"],
    visibleContent: ["Monsoon crops", "Paddy", "Vegetables"],
    allowedFollowups: ["What was grown?", "Next"]
  },
  {
    id: "bodakonda-systems",
    team: "bodakonda-collective",
    title: "Systems",
    tags: ["bodakonda", "systems", "compost"],
    visibleContent: ["Drip irrigation", "Compost", "Mulching"],
    allowedFollowups: ["Tell me about the systems", "Next"]
  },
  {
    id: "bodakonda-biodiversity",
    team: "bodakonda-collective",
    title: "Biodiversity & Volunteers",
    tags: ["bodakonda", "biodiversity", "volunteers"],
    visibleContent: ["Volunteer engagement", "Pigeon pea", "Ecology"],
    allowedFollowups: ["Tell me about biodiversity", "Finish"]
  },

  // Poomaale 1.0 (5 slides)
  {
    id: "poomaale1-intro",
    team: "poomaale-1-0",
    title: "Poomaale 1.0",
    subtitle: "Coffee harvest and infrastructure.",
    tags: ["intro", "collective", "poomaale"],
    visibleContent: ["Coffee", "Harvest", "Infrastructure"],
    allowedFollowups: ["What is Poomaale 1.0?", "Next"]
  },
  {
    id: "poomaale1-cover",
    team: "poomaale-1-0",
    title: "Major Harvest",
    tags: ["poomaale1", "harvest", "coffee"],
    visibleContent: ["15,607 kg robusta", "Supply to Bewild"],
    allowedFollowups: ["How much was harvested?", "Next"]
  },
  {
    id: "poomaale1-schema",
    team: "poomaale-1-0",
    title: "Activity / Output / Outcome / Impact",
    tags: ["poomaale1", "details"],
    visibleContent: ["Robusta harvest", "Infrastructure work"],
    allowedFollowups: ["What was achieved?", "Continue"]
  },
  {
    id: "poomaale1-harvest",
    team: "poomaale-1-0",
    title: "Coffee Harvest",
    tags: ["poomaale1", "harvest", "coffee"],
    visibleContent: ["Robusta picking", "Processing"],
    allowedFollowups: ["Tell me about harvest", "Next"]
  },
  {
    id: "poomaale1-infra",
    team: "poomaale-1-0",
    title: "Infrastructure",
    tags: ["poomaale1", "infrastructure"],
    visibleContent: ["Bund stabilization", "Wheel base"],
    allowedFollowups: ["What infrastructure?", "Finish"]
  },

  // Poomaale 2.0 (5 slides)
  {
    id: "poomaale2-intro",
    team: "poomaale-2-0",
    title: "Poomaale 2.0",
    subtitle: "Field preparation and agronomy.",
    tags: ["intro", "collective", "poomaale"],
    visibleContent: ["Field prep", "Agronomy", "Safety"],
    allowedFollowups: ["What is Poomaale 2.0?", "Next"]
  },
  {
    id: "poomaale2-cover",
    team: "poomaale-2-0",
    title: "Field Readiness",
    tags: ["poomaale2", "field", "preparation"],
    visibleContent: ["Shade clearing", "Field discipline"],
    allowedFollowups: ["Tell me about field prep", "Next"]
  },
  {
    id: "poomaale2-schema",
    team: "poomaale-2-0",
    title: "Activity / Output / Outcome / Impact",
    tags: ["poomaale2", "details"],
    visibleContent: ["Shade management", "De-suckering", "Safety measures"],
    allowedFollowups: ["What was achieved?", "Continue"]
  },
  {
    id: "poomaale2-crop",
    team: "poomaale-2-0",
    title: "Crop Management",
    tags: ["poomaale2", "crop", "coffee"],
    visibleContent: ["Robusta", "Shade loop", "De-suckering"],
    allowedFollowups: ["Tell me about crop care", "Next"]
  },
  {
    id: "poomaale2-safety",
    team: "poomaale-2-0",
    title: "Safety",
    tags: ["poomaale2", "safety"],
    visibleContent: ["Transformer cage", "Safety protocols"],
    allowedFollowups: ["What safety measures?", "Finish"]
  },

  // Human Resources (5 slides)
  {
    id: "hr-intro",
    team: "human-resources",
    title: "Human Resources",
    subtitle: "Hiring, cultural alignment, and well-being initiatives.",
    tags: ["intro", "hr", "people"],
    visibleContent: ["Hiring", "Culture", "Well-being"],
    allowedFollowups: ["What does HR do?", "Next"]
  },
  {
    id: "hr-cover",
    team: "human-resources",
    title: "People & Culture",
    tags: ["hr", "overview"],
    visibleContent: ["New hires", "Coffee with CEO", "Fitness Sankalp"],
    allowedFollowups: ["Tell me about HR updates", "Next"]
  },
  {
    id: "hr-schema",
    team: "human-resources",
    title: "Activity / Output / Outcome / Impact",
    tags: ["hr", "details"],
    visibleContent: ["Hiring completed", "Cultural alignment", "Well-being program"],
    allowedFollowups: ["What was achieved?", "Continue"]
  },
  {
    id: "hr-onboarding",
    team: "human-resources",
    title: "New Hires",
    tags: ["hr", "onboarding", "hiring"],
    visibleContent: ["Nagasai", "Divya Shree", "Shivathmika", "Vaishali"],
    allowedFollowups: ["Who was hired?", "Next"]
  },
  {
    id: "hr-fitness",
    team: "human-resources",
    title: "Fitness Sankalp",
    tags: ["hr", "wellness", "fitness"],
    visibleContent: ["Fitness program", "Well-being"],
    allowedFollowups: ["Tell me about Fitness Sankalp", "Finish"]
  },

  // CD&S (5 slides)
  {
    id: "cds-intro",
    team: "cds",
    title: "CD&S",
    subtitle: "Research, design, and growth support.",
    tags: ["intro", "cds", "research"],
    visibleContent: ["GIS", "Agronomy", "Resources"],
    allowedFollowups: ["What is CD&S?", "Next"]
  },
  {
    id: "cds-cover",
    team: "cds",
    title: "Landscape Stories",
    tags: ["cds", "overview", "gis"],
    visibleContent: ["Spatial narrative", "GIS mapping"],
    allowedFollowups: ["Tell me about CD&S", "Next"]
  },
  {
    id: "cds-schema",
    team: "cds",
    title: "Activity / Output / Outcome / Impact",
    tags: ["cds", "details"],
    visibleContent: ["GIS strengthening", "Agronomic self-reliance", "Resources"],
    allowedFollowups: ["What was achieved?", "Continue"]
  },
  {
    id: "cds-gis",
    team: "cds",
    title: "GIS & Mapping",
    tags: ["cds", "gis", "mapping"],
    visibleContent: ["Landscape maps", "Spatial data"],
    allowedFollowups: ["Tell me about GIS", "Next"]
  },
  {
    id: "cds-tools",
    team: "cds",
    title: "Tools & Resources",
    tags: ["cds", "tools", "resources"],
    visibleContent: ["Disease identification", "Survey", "Protocols"],
    allowedFollowups: ["What tools were created?", "Finish"]
  }
];

export function getSlideById(id) {
  return slides.find(s => s.id === id);
}

export function getSlidesByTeam(team) {
  return slides.filter(s => s.team === team);
}

export function getSlideIndex(id) {
  return slides.findIndex(s => s.id === id);
}

export function getNextSlide(currentId) {
  const idx = getSlideIndex(currentId);
  if (idx >= 0 && idx < slides.length - 1) {
    return slides[idx + 1];
  }
  return null;
}

export function getPrevSlide(currentId) {
  const idx = getSlideIndex(currentId);
  if (idx > 0) {
    return slides[idx - 1];
  }
  return null;
}
