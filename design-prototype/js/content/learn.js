import { icon } from '../icons.js';

export function page3A(){
  const cats = [
    { t:'Maps', d:'6 maps · 34 pieces of content', jump:'3B' },
    { t:'Agents', d:'12 agents · difficulty-rated', jump:'3C' },
    { t:'Concepts', d:'8 core concepts', jump:'3D' },
    { t:'Situations', d:'8 common scenarios', jump:'3E' },
  ];
  return `
  <div class="section-id">3A · Discover</div>
  <h1 class="page-title">Find the right knowledge, fast.</h1>
  <div style="display:flex;align-items:center;gap:10px;border:1px solid var(--rc-border-strong);border-radius:10px;padding:10px 14px;margin-bottom:var(--rc-gap);">
    ${icon('search')}<input placeholder="Search maps, agents, concepts, situations..." style="background:none;border:none;color:var(--rc-text-1);font-size:13px;flex:1;outline:none;">
  </div>
  <div class="card" style="margin-bottom:var(--rc-gap);">
    <div class="card-head"><div class="card-title">Recommended for You</div></div>
    <div class="card-sub">Based on your weak Improvement Metrics, active Focus, and Duelist role on Haven.</div>
    <div class="grid g-3" style="margin-top:8px;">
      <div class="card" style="padding:12px;cursor:pointer;" data-jump="3D"><div class="kicker">Concept</div><b>Trading</b></div>
      <div class="card" style="padding:12px;cursor:pointer;" data-jump="3B"><div class="kicker">Map</div><b>Haven — Agent Comps</b></div>
      <div class="card" style="padding:12px;cursor:pointer;" data-jump="3C"><div class="kicker">Agent</div><b>Reyna Fundamentals</b></div>
    </div>
  </div>
  <div class="grid g-4">
    ${cats.map(c=>`<div class="card" style="cursor:pointer;" data-jump="${c.jump}"><div class="card-title">${c.t}</div><div class="kicker" style="text-transform:none;font-weight:600;color:var(--rc-text-3);">${c.d}</div></div>`).join('')}
  </div>
  `;
}

export function page3B(){
  const maps = ['Haven','Ascent','Bind','Lotus','Sunset','Split'];
  return `
  <div class="section-id">3B · Maps</div>
  <h1 class="page-title">Map knowledge.</h1>
  <div class="grid g-3" style="margin-bottom:var(--rc-gap);">
    ${maps.map((m,i)=>`
      <div class="card" style="padding:0;overflow:hidden;cursor:pointer;" data-map-detail="${m}">
        <div style="width:100%;aspect-ratio:16/9;background:var(--rc-surface-3);"></div>
        <div style="padding:12px;"><b>${m}</b><div class="kicker">${i===0?'Personal win rate 60%':'6 lineups · 4 videos'}</div></div>
      </div>`).join('')}
  </div>

  <div class="card">
    <div class="card-head"><div class="card-title">Haven — Map Detail</div></div>
    <div class="tabrow"><button class="active" data-tab="map-overview">Overview</button><button data-tab="map-attack">Attack</button><button data-tab="map-defense">Defense</button><button data-tab="map-sites">Sites</button><button data-tab="map-comps">Agent Comps</button><button data-tab="map-videos">Videos</button><button data-tab="map-lineups">Lineups</button></div>
    <div id="map-overview" class="subpane"><p style="color:var(--rc-text-2);font-size:12px;">3 sites, longest rotations in the pool. Mid control (Garage/Sync) determines who dictates tempo.</p></div>
    <div id="map-attack" class="subpane" style="display:none;"><p style="color:var(--rc-text-2);font-size:12px;">Default splits into A Long, C Long, Mid Courtyard — mid control opens a 1-round rotate to any site.</p></div>
    <div id="map-defense" class="subpane" style="display:none;"><p style="color:var(--rc-text-2);font-size:12px;">2-1-2 is standard; Sentinel usually holds A Long solo with utility to slow the push.</p></div>
    <div id="map-sites" class="subpane" style="display:none;"><div class="grid g-3"><div class="card" style="padding:10px;">A Site</div><div class="card" style="padding:10px;">B Site (Garage)</div><div class="card" style="padding:10px;">C Site</div></div></div>
    <div id="map-comps" class="subpane" style="display:none;">
      <table><thead><tr><th>Composition</th><th>Pick Rate</th><th>Role Split</th></tr></thead>
      <tbody><tr><td>Double Controller</td><td>62%</td><td>2C 1I 1D 1S</td></tr><tr><td>Aggro Mid</td><td>24%</td><td>1C 2I 1D 1S</td></tr></tbody></table>
    </div>
    <div id="map-videos" class="subpane" style="display:none;" data-jump="4D"><div class="kicker">Relevant Videos — open in Library</div></div>
    <div id="map-lineups" class="subpane" style="display:none;" data-jump="4B"><div class="kicker">Relevant Lineups — open in Library</div></div>
  </div>
  `;
}

export function page3C(){
  const agents = [
    { n:'Reyna', r:'Duelist', d:'moderate' }, { n:'Jett', r:'Duelist', d:'hard' },
    { n:'Omen', r:'Controller', d:'moderate' }, { n:'Killjoy', r:'Sentinel', d:'hard' },
    { n:'Sova', r:'Initiator', d:'moderate' }, { n:'Cypher', r:'Sentinel', d:'expert' },
  ];
  return `
  <div class="section-id">3C · Agents</div>
  <h1 class="page-title">Agent knowledge.</h1>
  <div class="grid g-3" style="margin-bottom:var(--rc-gap);">
    ${agents.map(a=>`
      <div class="card" style="padding:0;overflow:hidden;cursor:pointer;">
        <div style="width:100%;aspect-ratio:1;background:var(--rc-surface-3);"></div>
        <div style="padding:12px;display:flex;align-items:center;justify-content:space-between;"><div><b>${a.n}</b><div class="kicker">${a.r}</div></div><span class="difficulty ${a.d}">${a.d}</span></div>
      </div>`).join('')}
  </div>
  <div class="card">
    <div class="card-head"><div class="card-title">Reyna — Agent Detail</div></div>
    <div class="tabrow"><button class="active" data-tab="ag-role">Role &amp; Abilities</button><button data-tab="ag-fund">Fundamentals</button><button data-tab="ag-map">Map Suitability</button><button data-tab="ag-perf">Personal Performance</button></div>
    <div id="ag-role" class="subpane"><p style="color:var(--rc-text-2);font-size:12px;">Duelist. Devour heals off confirmed kills; Empress rewards multi-kill aggression once your team has space.</p></div>
    <div id="ag-fund" class="subpane" style="display:none;"><ul style="margin:0;padding-left:18px;color:var(--rc-text-2);font-size:12px;line-height:1.7;"><li>Take fights you can confirm, not fights you hope to win</li><li>Leer before peeking unknown angles</li></ul></div>
    <div id="ag-map" class="subpane" style="display:none;"><div class="grid g-3"><div class="card" style="padding:10px;">Haven — Strong</div><div class="card" style="padding:10px;">Bind — Strong</div><div class="card" style="padding:10px;">Split — Situational</div></div></div>
    <div id="ag-perf" class="subpane" style="display:none;"><div class="metric-tile"><div class="value">58%</div><div class="kicker">Your win rate on Reyna</div></div></div>
    <div style="margin-top:10px;display:flex;gap:8px;"><button class="btn" data-jump="2H">Agent Stats</button></div>
  </div>
  `;
}

export function page3D(){
  const items = [
    { t:'Trading', d:'Turn every duel into guaranteed value', diff:'easy' },
    { t:'Spacing', d:"Don't stack angles with your team", diff:'moderate' },
    { t:'Map Control', d:'Win space before you need it', diff:'moderate' },
    { t:'Utility Timing', d:'Sequence smokes, flashes, and info together', diff:'hard' },
    { t:'Economy', d:'Buy decisions that protect your round win rate', diff:'moderate' },
    { t:'Retakes', d:'Coordinated re-entry after a plant', diff:'hard' },
  ];
  return `
  <div class="section-id">3D · Concepts</div>
  <h1 class="page-title">Core coaching concepts.</h1>
  <div class="grid g-3">
    ${items.map(it=>`
      <div class="card" style="cursor:pointer;">
        <div class="card-head"><div class="card-title" style="font-size:14px;">${it.t}</div><span class="difficulty ${it.diff}">${it.diff}</span></div>
        <div class="card-sub">${it.d}</div>
        <div style="display:flex;gap:6px;margin-top:6px;">
          <button class="btn sm primary" data-jump="1D" data-toast="Added to Focus Queue">Add to Focus</button>
          <button class="btn sm ghost" data-toast="Saved to Watch Later">${icon('ratingStar')} Save</button>
        </div>
      </div>`).join('')}
  </div>
  `;
}

export function page3E(){
  const items = [
    { t:'Post Plant', d:'Hold angles that trade the defuser' },
    { t:'Retake', d:'Coordinated site re-entry' },
    { t:'Man Advantage', d:'Playing 5v4 and 4v3 with pace' },
    { t:'Man Disadvantage', d:'Playing 3v4 without over-extending' },
    { t:'Clutch', d:'1vX decision trees' },
    { t:'Eco', d:'Round strategy without full buy' },
    { t:'Pistol', d:'Round 1/13 setups' },
    { t:'Entry', d:'First-contact fundamentals' },
  ];
  return `
  <div class="section-id">3E · Situations</div>
  <h1 class="page-title">Scenario-based knowledge.</h1>
  <div class="grid g-4">
    ${items.map(it=>`<div class="card" style="cursor:pointer;"><div class="card-title" style="font-size:13px;">${it.t}</div><div class="card-sub">${it.d}</div></div>`).join('')}
  </div>
  `;
}

export function page3F(){
  return `
  <div class="section-id">3F · Personal Plan</div>
  <h1 class="page-title">Your long-term improvement program.</h1>
  <div class="card hero" style="margin-bottom:var(--rc-gap);">
    <div class="card-head"><div class="card-title">Climb to Ascendant — 6 Week Plan</div><span class="chip positive">Week 4 of 6</span></div>
    <div class="grid g-3" style="margin-top:6px;">
      <div class="metric-tile"><div class="value">Diamond 1</div><div class="kicker">Start Rank</div></div>
      <div class="metric-tile"><div class="value">Diamond 2</div><div class="kicker">Peak Rank</div></div>
      <div class="metric-tile"><div class="value">42 RR</div><div class="kicker">Current</div></div>
    </div>
    <div class="kicker" style="margin-top:6px;">Selected Metrics: KAST, Win Rate · Focus Areas: Game Sense, Discipline</div>
  </div>
  <div class="grid g-2" style="margin-bottom:var(--rc-gap);">
    <div class="card">
      <div class="card-head"><div class="card-title">Achievements</div></div>
      <div class="stack" style="gap:6px;">
        <div class="chip positive">${icon('ratingStar')} New Peak Rank</div>
        <div class="chip positive">${icon('ratingStar')} KAST Milestone — 70%</div>
      </div>
    </div>
    <div class="card">
      <div class="card-head"><div class="card-title">Plan Archive</div></div>
      <div class="kicker">Off-Season Fundamentals — completed Jul 2026</div>
      <button class="btn sm" data-modal="8C-plan-completion">View Completion Report</button>
    </div>
  </div>
  <button class="btn primary">Create New Plan</button>
  `;
}

export function page3G(){
  const items = [
    { cat:'Mice', n:'Viper V3 Pro', spec:'54g · wireless', reason:'Most-used mouse among tracked Immortal+ players.' },
    { cat:'Mousepads', n:'Skypad 3.0 XL', spec:'Glass surface', reason:'Consistent glide for tracking-heavy agents.' },
    { cat:'Monitors', n:'27" 360Hz IPS', spec:'1ms', reason:'Refresh headroom above most players\' render rate.' },
  ];
  return `
  <div class="section-id">3G · Gear</div>
  <h1 class="page-title">Curated equipment, disclosed.</h1>
  <div class="page-note">Some links below are affiliate links. Product order is never determined by commission, and gear is never presented as a fix for poor stats.</div>
  <div class="grid g-3">
    ${items.map(it=>`
      <div class="card">
        <div style="width:100%;aspect-ratio:4/3;background:var(--rc-surface-3);border-radius:10px;"></div>
        <div class="kicker">${it.cat}</div>
        <b>${it.n}</b>
        <div class="card-sub">${it.spec}</div>
        <div class="card-sub">${it.reason}</div>
        <button class="btn sm" data-toast="Opens affiliate link in a new tab">View Product</button>
      </div>`).join('')}
  </div>
  `;
}
