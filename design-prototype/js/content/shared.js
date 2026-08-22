import { icon } from '../icons.js';

// Group 8 — shared modals, drawers, and global overlays. Built once, reused everywhere.

export function overlay8A_FocusDetail(){
  return `
  <div class="modal-shell" id="overlay-8A-focus-detail">
    <button class="overlay-close" data-close-overlay>${icon('close')}</button>
    <div class="kicker">One Job</div>
    <h2 style="font-size:20px;margin:4px 0 10px;">Stay tradable — don't take isolated first contact.</h2>
    <div style="display:flex;gap:10px;margin-bottom:14px;">
      <span class="chip impact-high">High Impact</span>
      <span class="chip confidence">Confidence 78%</span>
      <span class="chip">Game Sense</span>
    </div>
    <div class="kicker">Why This Focus</div>
    <p style="color:var(--rc-text-2);font-size:12px;line-height:1.6;margin:4px 0 12px;">You lost the opening duel in 4 of your last 6 matches. Isolated first contact removes your team's ability to trade, turning a winnable fight into a 4v5.</p>
    <div class="kicker">Evidence</div>
    <div class="grid g-2" style="margin:6px 0 14px;">
      <div class="metric-tile"><div class="value">42%</div><div class="kicker">Opening duels taken alone</div></div>
      <div class="metric-tile"><div class="value">−18 RR</div><div class="kicker">Impact per 10 matches</div></div>
    </div>
    <div class="kicker">What To Do</div>
    <ul style="margin:6px 0 14px;padding-left:18px;color:var(--rc-text-2);font-size:12px;line-height:1.7;">
      <li>Clear an angle before taking space</li>
      <li>Use utility to gather information first</li>
      <li>Trade with a teammate before pushing further</li>
    </ul>
    <div class="kicker">How To Judge Success</div>
    <p style="color:var(--rc-text-2);font-size:12px;margin:4px 0 14px;">You're alive with at least one teammate nearby when your team hits the site.</p>
    <div class="kicker">Related Content</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin:6px 0 16px;">
      <span class="chip">Trading</span><span class="chip">Map Control</span><span class="chip">Crosshair Placement</span>
    </div>
    <div style="display:flex;gap:8px;">
      <button class="btn primary" data-toast="Kept in Focus Queue">Keep in Focus Queue</button>
      <button class="btn" data-jump="3D">Open Related Content</button>
      <button class="btn ghost" data-close-overlay>Close</button>
    </div>
  </div>`;
}

export function overlay8B_MatchSaved(){
  return `
  <div class="modal-shell" id="overlay-8B-match-saved">
    <button class="overlay-close" data-close-overlay>${icon('close')}</button>
    <div style="text-align:center;padding:10px 0;">
      <div style="width:52px;height:52px;border-radius:50%;background:rgba(74,222,128,.12);border:1px solid var(--rc-success);display:flex;align-items:center;justify-content:center;margin:0 auto 14px;color:var(--rc-success);font-size:24px;">✓</div>
      <h2 style="font-size:19px;">Match Saved</h2>
      <p style="color:var(--rc-text-3);font-size:12px;margin-top:6px;">Win · Haven · 13–9 · +18 RR — your reflection has been added.</p>
      <div style="display:flex;gap:8px;justify-content:center;margin-top:18px;">
        <button class="btn" data-jump="1A" data-close-overlay-after>Back to Play</button>
        <button class="btn primary" data-jump="2F" data-close-overlay-after>View Reflection</button>
      </div>
    </div>
  </div>`;
}

export function overlay8C_PlanCompletion(){
  return `
  <div class="modal-shell" id="overlay-8C-plan-completion">
    <button class="overlay-close" data-close-overlay>${icon('close')}</button>
    <div class="kicker">Personal Plan Completed</div>
    <h2 style="font-size:19px;margin:4px 0 14px;">Climb to Ascendant — 6 Week Plan</h2>
    <div class="grid g-3" style="margin-bottom:14px;">
      <div class="metric-tile"><div class="value">Diamond 1</div><div class="kicker">Start Rank</div></div>
      <div class="metric-tile"><div class="value">Ascendant 2</div><div class="kicker">Peak Rank</div></div>
      <div class="metric-tile"><div class="value">Ascendant 1</div><div class="kicker">End Rank</div></div>
    </div>
    <div class="kicker">Strongest Improvement</div>
    <p style="color:var(--rc-text-2);font-size:12px;margin:4px 0 12px;">KAST rose from 64% to 76% — you're surviving to contribute far more often.</p>
    <div class="kicker">Weakest Remaining Metric</div>
    <p style="color:var(--rc-text-2);font-size:12px;margin:4px 0 14px;">Headshot % is still below rank average — worth a focused mechanics block next.</p>
    <div style="display:flex;gap:8px;">
      <button class="btn" data-jump="3F" data-close-overlay-after>View Plan Archive</button>
      <button class="btn primary" data-jump="3F" data-close-overlay-after>Start New Plan</button>
      <button class="btn ghost" data-jump="2A" data-close-overlay-after>View Full Review</button>
    </div>
  </div>`;
}

export function overlay8D_LineupDetail(){
  return `
  <div class="drawer-shell" id="overlay-8D-lineup-detail">
    <button class="overlay-close" data-close-overlay>${icon('close')}</button>
    <div class="kicker">Haven · Reyna · A Site</div>
    <h2 style="font-size:17px;margin:4px 0 12px;">A Site Default — Long to A</h2>
    <div style="width:100%;aspect-ratio:16/9;background:var(--rc-surface-2);border-radius:10px;margin-bottom:12px;"></div>
    <div class="grid g-2" style="margin-bottom:12px;">
      <div><div class="kicker">Site</div><div style="font-weight:700;">A Site</div></div>
      <div><div class="kicker">Attack / Defense</div><div style="font-weight:700;">Attack</div></div>
    </div>
    <div class="kicker">Setup</div>
    <p style="color:var(--rc-text-2);font-size:12px;margin:4px 0 12px;">Stand on the box at Long corner, aim at the top of the doorway lip, jump-throw on release.</p>
    <div class="kicker">Target</div>
    <p style="color:var(--rc-text-2);font-size:12px;margin:4px 0 12px;">Fully blocks Sync/Garage sightlines onto site for the default execute.</p>
    <div style="display:flex;gap:6px;"><span class="chip">Long</span><span class="chip">Default</span><span class="chip">Post-Plant</span></div>
  </div>`;
}

export function overlay8E_MapQuickRef(){
  return `
  <div class="drawer-shell" id="overlay-8E-map-ref">
    <button class="overlay-close" data-close-overlay>${icon('close')}</button>
    <div class="kicker">Haven — Quick Reference</div>
    <h2 style="font-size:17px;margin:4px 0 14px;">Map Knowledge</h2>
    <div class="tabrow"><button class="active">Attack</button><button>Defense</button><button>Sites</button></div>
    <p style="color:var(--rc-text-2);font-size:12px;line-height:1.6;">Default split into A Long, C Long, and Mid Courtyard. Mid control lets you rotate to any of the 3 sites within one round.</p>
    <div class="kicker" style="margin-top:12px;">Relevant Lineups</div>
    <div class="stack" style="margin-top:6px;">
      <div class="card" style="padding:10px;flex-direction:row;justify-content:space-between;align-items:center;cursor:pointer;" data-modal="8D-lineup-detail"><span>A Site Default — Long to A</span>${icon('chevronRight')}</div>
      <div class="card" style="padding:10px;flex-direction:row;justify-content:space-between;align-items:center;cursor:pointer;" data-modal="8D-lineup-detail"><span>C Long One Way</span>${icon('chevronRight')}</div>
    </div>
  </div>`;
}

export function overlay8F_AgentQuickRef(){
  return `
  <div class="drawer-shell" id="overlay-8F-agent-ref">
    <button class="overlay-close" data-close-overlay>${icon('close')}</button>
    <div class="kicker">Reyna — Quick Reference</div>
    <h2 style="font-size:17px;margin:4px 0 6px;">Agent Tips</h2>
    <span class="difficulty moderate">Moderate</span>
    <p style="color:var(--rc-text-2);font-size:12px;line-height:1.6;margin-top:10px;">Duelist. Devour heals off kills — take fights where you can confirm a pick before overextending. Save Empress for multi-kill windows, not entry.</p>
    <div class="kicker" style="margin-top:12px;">Core Ability Reminders</div>
    <ul style="margin:6px 0;padding-left:18px;color:var(--rc-text-2);font-size:12px;line-height:1.7;">
      <li>Leer blinds through walls — use before peeking unknown angles</li>
      <li>Dismiss for disengage, not just aggression</li>
    </ul>
  </div>`;
}

export function overlay8G_Search(){
  return `
  <div class="modal-shell" id="overlay-8G-search" style="top:18%;transform:translate(-50%,0);">
    <button class="overlay-close" data-close-overlay>${icon('close')}</button>
    <div style="display:flex;align-items:center;gap:10px;border:1px solid var(--rc-border-strong);border-radius:10px;padding:10px 14px;margin-bottom:14px;">
      ${icon('search')}<input placeholder="Search maps, agents, concepts, lineups, help..." style="background:none;border:none;color:var(--rc-text-1);font-size:13px;flex:1;outline:none;">
    </div>
    <div class="stack">
      <div class="card" style="padding:10px 14px;flex-direction:row;justify-content:space-between;cursor:pointer;" data-jump="3B"><span>Haven — Map Guide</span><span class="kicker">Maps</span></div>
      <div class="card" style="padding:10px 14px;flex-direction:row;justify-content:space-between;cursor:pointer;" data-jump="3C"><span>Reyna — Agent Guide</span><span class="kicker">Agents</span></div>
      <div class="card" style="padding:10px 14px;flex-direction:row;justify-content:space-between;cursor:pointer;" data-jump="3D"><span>Trading — Concept</span><span class="kicker">Concepts</span></div>
      <div class="card" style="padding:10px 14px;flex-direction:row;justify-content:space-between;cursor:pointer;" data-jump="7A"><span>Data refresh failed — Help</span><span class="kicker">Help</span></div>
    </div>
  </div>`;
}

export function overlay8H_ProfilePopover(){
  // Centered pop-up (not a corner popover) with a lighter scrim so the page behind stays legible.
  // Merges quick access to Account, Settings, and Help so those don't need separate top-level buttons.
  return `
  <div class="modal-shell modal-light" id="overlay-8H-profile" style="width:300px;">
    <button class="overlay-close" data-close-overlay>${icon('close')}</button>
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
      <div class="avatar-dot" style="width:38px;height:38px;"></div>
      <div><b>DemoPlayer</b><div class="kicker">Diamond 1 · 42 RR</div></div>
      <span class="tier-badge elite" style="margin-left:auto;">Elite</span>
    </div>
    <div class="stack" style="gap:4px;">
      <button class="btn ghost" style="justify-content:flex-start;" data-jump="5A" data-close-overlay-after>${icon('account')}Profile</button>
      <button class="btn ghost tier-lock" style="justify-content:flex-start;" data-jump="5B" data-close-overlay-after>${icon('account')}Switch Profile <span class="lock-badge" style="position:static;margin-left:auto;">${icon('lock')}Elite</span></button>
      <button class="btn ghost" style="justify-content:flex-start;" data-jump="6A" data-close-overlay-after>${icon('settings')}Settings</button>
      <button class="btn ghost" style="justify-content:flex-start;" data-jump="6F" data-close-overlay-after>${icon('settings')}Billing</button>
      <button class="btn ghost" style="justify-content:flex-start;" data-jump="7A" data-close-overlay-after>${icon('help')}Help</button>
      <div style="height:1px;background:var(--rc-border-subtle);margin:4px 0;"></div>
      <button class="btn ghost" style="justify-content:flex-start;color:var(--rc-danger);">Sign Out</button>
    </div>
  </div>`;
}

export function overlay8I_Upgrade(featureName, featureDesc){
  return `
  <div class="modal-shell" id="overlay-8I-upgrade">
    <button class="overlay-close" data-close-overlay>${icon('close')}</button>
    <div class="kicker">Elite Feature</div>
    <h2 style="font-size:19px;margin:4px 0 8px;">${featureName || 'Advanced Visual Customization'}</h2>
    <p style="color:var(--rc-text-2);font-size:12px;margin-bottom:16px;">${featureDesc || 'This capability is available on the Elite plan.'}</p>
    ${planCompareTable(true)}
    <div style="display:flex;gap:8px;margin-top:16px;">
      <button class="btn primary" data-jump="6F" data-close-overlay-after>Upgrade to Elite</button>
      <button class="btn ghost" data-close-overlay>Maybe Later</button>
    </div>
  </div>`;
}

export function planCompareTable(compact){
  const rows = [
    ['Full coaching &amp; Insights', 'yes', 'yes', 'yes'],
    ['Focus &amp; Focus Queue', 'yes', 'yes', 'yes'],
    ['Personal Plan &amp; achievements', 'yes', 'yes', 'yes'],
    ['Ads', 'Restrained', 'None', 'None'],
    ['Active profiles', '1', '1', 'Multiple'],
    ['Visual customization', 'Basic', 'Basic', 'Advanced + presets'],
    ['Notification rules', 'Basic', 'Basic', 'Advanced thresholds'],
    ['Dashboard personalization', '—', '—', 'yes'],
  ];
  return `
  <div class="plan-compare">
    <div></div>
    <div class="plan-head basic">Basic<span class="kicker" style="font-weight:600;">Free</span></div>
    <div class="plan-head supporter">Supporter<span class="kicker" style="font-weight:600;">Low cost</span></div>
    <div class="plan-head elite">Elite<span class="kicker" style="font-weight:600;">Full control</span></div>
    ${rows.map(r=>`
      <div class="feature-name">${r[0]}</div>
      ${r.slice(1).map(v=>`<div class="${v==='yes'?'yes':v==='—'?'no':''}">${v==='yes'?'✓':v}</div>`).join('')}
    `).join('')}
  </div>`;
}

export function overlay8J_ToastDemo(){
  return `<div class="toast-stack" id="toastStack"></div>`;
}

export function renderAllGlobalOverlays(){
  return [
    overlay8A_FocusDetail(), overlay8B_MatchSaved(), overlay8C_PlanCompletion(),
    overlay8D_LineupDetail(), overlay8E_MapQuickRef(), overlay8F_AgentQuickRef(),
    overlay8G_Search(), overlay8H_ProfilePopover(), overlay8I_Upgrade(),
  ].join('\n');
}
