import { icon } from '../icons.js';

export function page4A(){
  return `
  <div class="section-id">4A · Library Overview</div>
  <h1 class="page-title">Everything you've saved.</h1>
  <div class="grid g-4" style="margin-bottom:var(--rc-gap);">
    <div class="metric-tile" style="cursor:pointer;" data-jump="4B"><div class="value">18</div><div class="kicker">Lineups</div></div>
    <div class="metric-tile" style="cursor:pointer;" data-jump="4C"><div class="value">6</div><div class="kicker">Routines</div></div>
    <div class="metric-tile" style="cursor:pointer;" data-jump="4D"><div class="value">31</div><div class="kicker">Favorites</div></div>
    <div class="metric-tile" style="cursor:pointer;" data-jump="4D"><div class="value">12</div><div class="kicker">Watch Later</div></div>
  </div>
  <div class="card">
    <div class="card-head"><div class="card-title">Recent Activity</div></div>
    <div class="stack" style="gap:6px;">
      <div class="card" style="padding:10px 14px;flex-direction:row;justify-content:space-between;"><span>Saved Lotus C retake lineup</span><span class="kicker">2 hours ago</span></div>
      <div class="card" style="padding:10px 14px;flex-direction:row;justify-content:space-between;"><span>Added Sheriff warm-up to Routines</span><span class="kicker">Yesterday</span></div>
    </div>
  </div>
  `;
}

export function page4B(){
  const items = [
    { m:'Haven', a:'Reyna', s:'A Site', t:'A Site Default — Long to A' },
    { m:'Haven', a:'Sova', s:'B Site', t:'B Site Recon — Garage Angle' },
    { m:'Lotus', a:'Killjoy', s:'C Site', t:'C Site Retake Turret' },
  ];
  return `
  <div class="section-id">4B · Lineups</div>
  <h1 class="page-title">Saved lineups.</h1>
  <div style="display:flex;gap:8px;margin-bottom:var(--rc-gap);">${['Map','Agent','Site','Attack/Defense'].map(f=>`<span class="chip">${f} ▾</span>`).join('')}</div>
  <div class="rail">
    <div class="grid g-3" style="align-content:start;">
      ${items.map(it=>`
        <div class="card" style="padding:0;overflow:hidden;cursor:pointer;" data-modal="8D-lineup-detail">
          <div style="width:100%;aspect-ratio:16/9;background:var(--rc-surface-3);"></div>
          <div style="padding:12px;"><b style="font-size:12px;">${it.t}</b><div class="kicker">${it.m} · ${it.a} · ${it.s}</div></div>
        </div>`).join('')}
    </div>
    <div class="stack">
      <div class="card"><div class="kicker">Shared Across</div><p style="color:var(--rc-text-2);font-size:11.5px;">Library, Maps, Agents, and In-Game Quick Reference all reuse this same Lineup Detail.</p></div>
    </div>
  </div>
  `;
}

export function page4C(){
  const routines = [
    { t:'Aim Warm-up', type:'Warm-up', dur:'12 min', streak:'6 day streak' },
    { t:'Pre-Match Routine', type:'Pre-Match', dur:'5 min', streak:'3 day streak' },
    { t:'Post-Match Review', type:'Post-Match', dur:'8 min', streak:'Not started today' },
  ];
  return `
  <div class="section-id">4C · Routines</div>
  <h1 class="page-title">Warm-up, pre-match, and post-match routines.</h1>
  <div class="grid g-3">
    ${routines.map(r=>`
      <div class="card">
        <div class="kicker">${r.type}</div>
        <div class="card-title" style="font-size:14px;">${r.t}</div>
        <div class="card-sub">${r.dur} · ${r.streak}</div>
        <button class="btn sm primary" data-toast="Routine started">Start Routine</button>
      </div>`).join('')}
  </div>
  `;
}

export function page4D(){
  const vids = [
    { t:'Trading — Turn every duel into guaranteed value', tag:'Concept', dur:'8 min' },
    { t:'Haven Agent Comps Breakdown', tag:'Map', dur:'11 min' },
    { t:'Reyna Fundamentals', tag:'Agent', dur:'14 min' },
  ];
  return `
  <div class="section-id">4D · Videos / Collections</div>
  <h1 class="page-title">Your video library.</h1>
  <div style="display:flex;gap:8px;margin-bottom:var(--rc-gap);flex-wrap:wrap;">
    ${['Favorites','Watch Later','Collection','Map','Agent','Concept','Situation'].map(f=>`<span class="chip">${f}</span>`).join('')}
  </div>
  <div class="rail">
    <div class="grid g-3" style="align-content:start;">
      ${vids.map(v=>`
        <div class="card" style="padding:0;overflow:hidden;">
          <div style="width:100%;aspect-ratio:16/9;background:var(--rc-surface-3);position:relative;">
            <button class="icon-btn" style="position:absolute;top:8px;right:8px;margin:0;" data-toast="Saved to Favorites">${icon('ratingStar')}</button>
          </div>
          <div style="padding:12px;"><b style="font-size:12px;">${v.t}</b><div class="kicker">${v.tag} · ${v.dur}</div></div>
        </div>`).join('')}
    </div>
    <div class="stack">
      <div class="card"><div class="kicker">Your Collections</div>
        <div class="stack" style="gap:5px;margin-top:4px;">
          <div class="card" style="padding:8px 12px;">Controller Fundamentals</div>
          <div class="card" style="padding:8px 12px;">Stuff to Practice</div>
          <div class="card" style="padding:8px 12px;">Clutch Study</div>
        </div>
      </div>
    </div>
  </div>
  `;
}
