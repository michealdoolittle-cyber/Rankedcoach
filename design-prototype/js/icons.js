// Shared SVG icon library. Every icon used anywhere in the prototype is defined once here.
export const Icon = {
  // nav group icons
  play: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5.5 4.8 18.7 12 5.5 19.2Z"/></svg>',
  review: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 19V14M10 19V10M16 19V6"/></svg>',
  learn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 5h16M4 12h16M4 19h10"/></svg>',
  library: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>',
  account: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8.5" r="3.4"/><path d="M4.8 19.2c1.4-3.2 4-4.8 7.2-4.8s5.8 1.6 7.2 4.8"/></svg>',
  settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="3.3"/><path d="M12 2.8v2.7M12 18.5v2.7M21.2 12h-2.7M5.5 12H2.8M18.6 5.4l-1.9 1.9M7.3 16.7l-1.9 1.9M18.6 18.6l-1.9-1.9M7.3 7.3 5.4 5.4" stroke-width="2.6" stroke-linecap="round"/></svg>',
  help: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M9.2 9.2a2.8 2.8 0 1 1 3.8 2.6c-.7.3-1 .9-1 1.6v.4" stroke-linecap="round"/><circle cx="12" cy="17.2" r=".9" fill="currentColor" stroke="none"/></svg>',

  // sub-nav icons (Play group children)
  matchPrep: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 6h16M7 12h10M10 18h4"/></svg>',
  inGame: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 8V5a1 1 0 0 1 1-1h3M20 8V5a1 1 0 0 0-1-1h-3M4 16v3a1 1 0 0 0 1 1h3M20 16v3a1 1 0 0 1-1 1h-3"/><circle cx="12" cy="12" r="2" fill="currentColor" stroke="none"/></svg>',
  focusQueue: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 6h16M4 12h16M4 18h10"/></svg>',
  logMatch: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3v18M3 12h18"/></svg>',

  // Improvement Metrics (KAST, ACS, K/D, HS%, Win Rate)
  metricKAST: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="10" width="3.2" height="10" rx="1"/><rect x="10.4" y="6" width="3.2" height="14" rx="1"/><rect x="16.8" y="3" width="3.2" height="17" rx="1"/></svg>',
  metricACS: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3v3.2M12 17.8V21M3 12h3.2M17.8 12H21" stroke-linecap="round"/><circle cx="12" cy="12" r="5"/></svg>',
  metricKD: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3 3 8.6v6.8L12 21l9-5.6V8.6Z"/><path d="M12 3v18M3 8.6l9 5.6 9-5.6"/></svg>',
  metricHS: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="8.6"/><circle cx="12" cy="12" r="4.4"/><circle cx="12" cy="12" r=".9" fill="currentColor" stroke="none"/><path d="M12 1.4v3.2M12 19.4v3.2M1.4 12h3.2M19.4 12h3.2"/></svg>',
  metricWinRate: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 9V4h12v5a6 6 0 0 1-6 6 6 6 0 0 1-6-6Z"/><path d="M6 5H3.5A2.5 2.5 0 0 0 3.5 10H6M18 5h2.5A2.5 2.5 0 0 1 20.5 10H18M12 15v3M8.5 21h7l-1-3h-5Z"/></svg>',

  // Compass pillars (Mechanics/Aim, Game Sense, Teamwork/Comms, Discipline, Mental)
  pillarMechanics: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="8.4"/><circle cx="12" cy="12" r="4.2"/><circle cx="12" cy="12" r=".8" fill="currentColor" stroke="none"/></svg>',
  pillarGameSense: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3.2 4.4 7v6.4c0 4.4 3.2 6.8 7.6 7.8 4.4-1 7.6-3.4 7.6-7.8V7Z"/><path d="m9 12 2.2 2.2L15.4 10"/></svg>',
  pillarTeamwork: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="8.5" cy="8" r="2.6"/><circle cx="16" cy="9.5" r="2.2"/><path d="M3.6 19c.6-3 2.6-4.6 4.9-4.6s4.3 1.6 4.9 4.6M13.8 19c.4-2.2 1.9-3.6 3.6-3.6s3.2 1.4 3.6 3.6"/></svg>',
  pillarDiscipline: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M8.5 9h7M8.5 12.5h7M8.5 16h4.5"/></svg>',
  pillarMental: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 3.6a4 4 0 0 0-4 4 4 4 0 0 0 0 8.8V18a2.6 2.6 0 0 0 2.6 2.6M9 3.6A2.6 2.6 0 0 1 11.6 6v11a2.6 2.6 0 0 1-2 2.5M9 3.6c0-.9 1.3-1.6 3-1.6s3 .7 3 1.6M15 3.6a4 4 0 0 1 4 4 4 4 0 0 1 0 8.8V18a2.6 2.6 0 0 1-2.6 2.6M15 3.6A2.6 2.6 0 0 0 12.4 6"/></svg>',

  // difficulty
  difficultyBadge: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2 2 7v6c0 5 4 8.6 10 9 6-.4 10-4 10-9V7Z" opacity=".15"/><path d="M12 2 2 7v6c0 5 4 8.6 10 9 6-.4 10-4 10-9V7Z" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',

  // ui chrome
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="6.4"/><path d="m20 20-4.4-4.4" stroke-linecap="round"/></svg>',
  bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 10a6 6 0 0 1 12 0c0 4.4 1.4 6 1.4 6H4.6S6 14.4 6 10Z"/><path d="M9.6 19a2.4 2.4 0 0 0 4.8 0"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 5 14 14M19 5 5 19" stroke-linecap="round"/></svg>',
  chevronRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 5 7 7-7 7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  chevronDown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 9 7 7 7-7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8 10.5V7.6a4 4 0 0 1 8 0v2.9"/></svg>',
  spark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.6 2.6M15.4 15.4 18 18M18 6l-2.6 2.6M8.6 15.4 6 18" stroke-linecap="round"/></svg>',
  ratingStar: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 3.2 14.7 9l6.3.6-4.7 4.2 1.4 6.1L12 16.8 6.3 19.9l1.4-6.1L3 9.6 9.3 9Z"/></svg>',
  play_solid: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M6 4.6 19 12 6 19.4Z"/></svg>',
};

export function icon(name, extraClass){
  return `<span class="icon ${extraClass||''}">${Icon[name]||''}</span>`;
}
