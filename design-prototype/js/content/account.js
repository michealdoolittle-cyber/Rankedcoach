import { icon } from '../icons.js';

export function page5A(){
  return `
  <div class="section-id">5A · Profile</div>
  <h1 class="page-title">Your Ranked Coach profile.</h1>
  <div class="grid g-2">
    <div class="card">
      <div class="card-head"><div class="card-title">Identity</div></div>
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:10px;">
        <div class="avatar-dot" style="width:50px;height:50px;"></div>
        <div><b style="font-size:15px;">DemoPlayer</b><div class="kicker">Elite Plan</div></div>
      </div>
      <div class="grid g-2">
        <div><div class="kicker">Riot ID</div><div style="font-weight:700;font-size:12.5px;">DemoPlayer#NA1</div></div>
        <div><div class="kicker">Region</div><div style="font-weight:700;font-size:12.5px;">NA</div></div>
        <div><div class="kicker">Current Rank</div><div style="font-weight:700;font-size:12.5px;">Diamond 1 · 42 RR</div></div>
        <div><div class="kicker">Goal Rank</div><div style="font-weight:700;font-size:12.5px;">Ascendant 1</div></div>
      </div>
    </div>
    <div class="card">
      <div class="card-head"><div class="card-title">Achievement Highlights</div></div>
      <div class="stack" style="gap:6px;">
        <div class="chip positive">${icon('ratingStar')} New Peak Rank — Diamond 1</div>
        <div class="chip positive">${icon('ratingStar')} KAST Milestone — 70%</div>
        <div class="chip positive">${icon('ratingStar')} Plan Completed — Off-Season Fundamentals</div>
      </div>
      <div class="kicker" style="margin-top:10px;">Plan Tier</div>
      <span class="tier-badge elite" style="display:inline-flex;">Elite</span>
    </div>
  </div>
  `;
}

export function page5B(){
  const profiles = [
    { n:'DemoPlayer', rank:'Diamond 1', active:true },
    { n:'Smurf Account', rank:'Gold 3', active:false },
  ];
  return `
  <div class="section-id">5B · Player Profiles</div>
  <h1 class="page-title">Manage multiple profiles.</h1>
  <div class="page-note">Elite feature — multiple profiles and profile switching. Basic includes the current profile only.</div>
  <div class="grid g-3" style="margin-bottom:var(--rc-gap);">
    ${profiles.map(p=>`
      <div class="card" style="${p.active?'border-color:var(--rc-brand-strong);':''}">
        <div style="display:flex;align-items:center;gap:10px;"><div class="avatar-dot"></div><div><b>${p.n}</b><div class="kicker">${p.rank}</div></div></div>
        <div style="display:flex;gap:6px;margin-top:8px;">
          ${p.active ? `<span class="chip positive">Active</span>` : `<button class="btn sm" data-toast="Switched profile">Switch To</button>`}
          <button class="btn sm ghost" data-toast="Renamed profile">Rename</button>
        </div>
      </div>`).join('')}
    <div class="card" style="align-items:center;justify-content:center;border-style:dashed;cursor:pointer;" data-toast="New profile added">
      <span style="font-size:22px;color:var(--rc-brand-strong);">+</span>
      <div class="kicker">Add Profile</div>
    </div>
  </div>
  <button class="btn ghost" data-modal="8I-upgrade">See what Basic tier shows instead →</button>
  `;
}
