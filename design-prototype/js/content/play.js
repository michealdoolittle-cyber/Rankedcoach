import { icon } from '../icons.js';
import { radarChart, trendLine, miniBar } from '../charts.js';

const METRICS = [
  { key:'KAST', icon:'metricKAST', value:'72%', delta:'+3%', up:true },
  { key:'ACS', icon:'metricACS', value:'248', delta:'+12', up:true },
  { key:'K/D', icon:'metricKD', value:'1.12', delta:'-0.04', up:false },
  { key:'HS%', icon:'metricHS', value:'24%', delta:'+1%', up:true },
  { key:'Win Rate', icon:'metricWinRate', value:'52%', delta:'+2%', up:true },
];

function metricTiles(){
  return `<div class="grid g-5">${METRICS.map(m=>`
    <div class="metric-tile" data-jump="2B" data-tab-hint="${m.key}" style="cursor:pointer;">
      ${icon(m.icon)}
      <div class="value">${m.value}</div>
      <div class="kicker">${m.key}</div>
      <div class="delta ${m.up?'up':'down'}" style="font-size:11px;font-weight:700;">${m.delta}</div>
    </div>`).join('')}</div>`;
}

export function page1A(){
  return `
  <div class="section-id">1A · Play Home</div>
  <h1 class="page-title">Home base between matches.</h1>

  <div class="grid g-2" style="margin-bottom:var(--rc-gap);">
    <div class="card hero">
      <div class="card-head">
        <div class="kicker">One Job</div>
        <span class="chip impact-high">High Impact</span>
      </div>
      <div class="card-title" style="font-size:var(--rc-fs-h1);">Stay tradable — don't take isolated first contact.</div>
      <div class="card-sub">You lost the opening duel in 4 of your last 6 matches. Pair up before taking space so the second fight stays winnable.</div>
      <div style="display:flex;gap:14px;align-items:center;margin-top:4px;">
        <span class="chip confidence">Confidence 78%</span>
        <span class="chip">Category: Game Sense</span>
      </div>
      <div style="margin-top:8px;"><button class="btn primary" data-modal="8A-focus-detail">View Focus Details</button></div>
    </div>

    <div class="card">
      <div class="card-head"><div class="card-title">Current Rank</div></div>
      <div style="display:flex;align-items:center;gap:16px;">
        <div style="width:52px;height:52px;border-radius:12px;background:conic-gradient(from 220deg,var(--rc-brand-deep),var(--rc-brand),var(--rc-brand-strong));flex:none;"></div>
        <div>
          <div style="font-family:var(--rc-font-display);font-size:22px;font-weight:700;">Diamond 1</div>
          <div class="kicker">42 RR</div>
        </div>
        <div style="margin-left:auto;display:flex;gap:14px;text-align:center;">
          <div><div style="font-weight:700;color:var(--rc-success);">14</div><div class="kicker">Wins</div></div>
          <div><div style="font-weight:700;color:var(--rc-danger);">11</div><div class="kicker">Losses</div></div>
          <div><div style="font-weight:700;color:var(--rc-text-3);">1</div><div class="kicker">Draws</div></div>
        </div>
      </div>
      <div class="kicker">Preferred role: Duelist</div>
      <div style="display:flex;gap:16px;font-size:11px;color:var(--rc-text-3);border-top:1px solid var(--rc-border-subtle);padding-top:8px;">
        <span>Last match: <b style="color:var(--rc-text-1);">K/D 1.4</b></span>
        <span>ACS <b style="color:var(--rc-text-1);">261</b></span>
        <span>KAST <b style="color:var(--rc-text-1);">76%</b></span>
      </div>
    </div>
  </div>

  <div class="card" style="margin-bottom:var(--rc-gap);">
    <div class="card-head"><div class="card-title">Improvement Metrics</div><span class="kicker">Click a metric to see its trend</span></div>
    ${metricTiles()}
  </div>

  <div class="grid g-3" style="margin-bottom:var(--rc-gap);">
    <div class="card" style="cursor:pointer;" data-jump="1B">
      <div class="card-head"><div class="card-title">Loadout</div></div>
      <div style="display:flex;flex-direction:column;align-items:center;gap:10px;padding:10px 0;">
        <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="var(--rc-brand-strong)" stroke-width="1.6"><circle cx="12" cy="12" r="8" stroke-dasharray="2 3"/><circle cx="12" cy="12" r="2.4" fill="var(--rc-brand-strong)" stroke="none"/></svg>
        <button class="btn primary">Start Match</button>
      </div>
    </div>

    <div class="card" style="cursor:pointer;" data-jump="2A">
      <div class="card-head"><div class="card-title">Compass</div></div>
      ${radarChart(['Mechanics','Game Sense','Teamwork','Discipline','Mental'],[68,74,62,58,64],{size:190})}
    </div>

    <div class="card" style="cursor:pointer;" data-jump="2B">
      <div class="card-head"><div class="card-title">Rank Progress</div></div>
      <div style="font-family:var(--rc-font-display);font-size:20px;font-weight:700;">42 RR</div>
      ${trendLine([18,24,20,30,26,34,42],{h:90})}
      <div class="kicker">Last 7 matches · W W L W D W W</div>
    </div>
  </div>

  <div class="card" data-jump="2D" style="cursor:pointer;">
    <div class="card-head">
      <div class="kicker">Top Insight</div>
      <span class="chip impact-high">High Impact</span>
    </div>
    <div class="card-title" style="font-size:var(--rc-fs-h2);">Your crosshair placement is winning you more fights.</div>
    <div class="card-sub">You win 63% of duels when your crosshair is already head-level on the angle. Hold discipline instead of tracking down.</div>
    <div style="display:flex;gap:14px;"><span class="chip confidence">Confidence 83%</span></div>
    <div class="kicker">Key Takeaways</div>
    <ul style="margin:0;padding-left:18px;color:var(--rc-text-2);font-size:11.5px;line-height:1.6;">
      <li>Hold head level on common angles</li>
      <li>Clear close corners with utility first</li>
    </ul>
  </div>
  `;
}

export function page1B(){
  const maps = ['Ascent','Bind','Haven','Lotus','Sunset'];
  const roles = ['Duelist','Controller','Initiator','Sentinel'];
  const agents = [
    { name:'Reyna', diff:'moderate', wr:'58%' },
    { name:'Jett', diff:'hard', wr:'52%' },
    { name:'Raze', diff:'moderate', wr:'55%' },
  ];
  return `
  <div class="section-id">1B · Match Prep</div>
  <h1 class="page-title">Choose your map and role.</h1>

  <div class="card" style="margin-bottom:var(--rc-gap);">
    <div class="kicker">Map — choose one</div>
    <div class="grid g-5" style="margin-top:6px;">
      ${maps.map((m,i)=>`<button class="btn ${i===2?'primary':''}" style="height:56px;" data-select-map="${m}">${m}</button>`).join('')}
    </div>
  </div>

  <div class="card" style="margin-bottom:var(--rc-gap);">
    <div class="kicker">Role — choose one</div>
    <div class="grid g-4" style="margin-top:6px;">
      ${roles.map((r,i)=>`<button class="btn ${i===0?'primary':''}" style="height:44px;" data-select-role="${r}">${r}</button>`).join('')}
    </div>
  </div>

  <div class="rail" style="margin-bottom:var(--rc-gap);">
    <div class="card">
      <div class="card-head"><div class="card-title">Recommended Agents — Haven, Duelist</div></div>
      <div class="grid g-3">
        ${agents.map(a=>`
          <div class="card" style="padding:12px;gap:6px;">
            <div style="width:100%;aspect-ratio:1;border-radius:10px;background:var(--rc-surface-3);"></div>
            <div style="display:flex;align-items:center;justify-content:space-between;">
              <b>${a.name}</b><span class="difficulty ${a.diff}">${a.diff}</span>
            </div>
            <div class="kicker">Your win rate: ${a.wr}</div>
          </div>`).join('')}
      </div>
    </div>
    <div class="stack">
      <div class="card">
        <div class="kicker">Active Focus</div>
        <div style="font-weight:700;">Stay tradable — don't take isolated first contact.</div>
      </div>
      <div class="card">
        <div class="kicker">Relevant Learn Content</div>
        <div class="kicker" style="color:var(--rc-text-2);font-weight:600;text-transform:none;font-size:11.5px;">Trading — Turn every duel into guaranteed value</div>
      </div>
      <div class="card">
        <div class="kicker">Saved Lineups — Haven</div>
        <div class="kicker" style="color:var(--rc-text-2);font-weight:600;text-transform:none;font-size:11.5px;">A Site Default · B Long One Way</div>
      </div>
    </div>
  </div>

  <button class="btn primary" data-jump="1C">Start Match</button>
  `;
}

export function page1C(){
  return `
  <div class="section-id">1C · In-Game</div>
  <h1 class="page-title">One job while the match is live.</h1>

  <div class="grid g-2" style="margin-bottom:var(--rc-gap);">
    <div class="card hero">
      <div class="kicker">One Job</div>
      <div class="card-title" style="font-size:var(--rc-fs-h1);">Stay tradable — don't take isolated first contact.</div>
      <div class="card-sub">Haven · Duelist · Reyna</div>
    </div>
    <div class="card">
      <div class="kicker">Quick Reference</div>
      <div class="grid g-2" style="margin-top:6px;">
        <button class="btn" data-modal="8E-map-ref">Map Notes</button>
        <button class="btn" data-modal="8F-agent-ref">Agent Tips</button>
        <button class="btn" data-modal="8D-lineup-detail">Lineups</button>
      </div>
    </div>
  </div>

  <div class="card" style="margin-bottom:var(--rc-gap);">
    <div class="kicker">Focus Row</div>
    <div class="grid g-3">
      <div class="card" style="padding:12px;"><span class="chip impact-high">High Impact</span><div style="margin-top:6px;font-size:12px;font-weight:700;">Trade first contact</div></div>
      <div class="card" style="padding:12px;"><span class="chip impact-medium">Medium Impact</span><div style="margin-top:6px;font-size:12px;font-weight:700;">Use utility before entry</div></div>
      <div class="card" style="padding:12px;"><span class="chip confidence">Confidence 71%</span><div style="margin-top:6px;font-size:12px;font-weight:700;">Hold post-plant off angle</div></div>
    </div>
  </div>

  <button class="btn primary" data-jump="1E">End Match</button>
  `;
}

export function page1D(){
  const items = [
    { title:'Stay tradable — don\'t take isolated first contact', cat:'Game Sense', impact:'High Impact', status:'Active' },
    { title:'Use utility before taking space', cat:'Discipline', impact:'Medium Impact', status:'Queued' },
    { title:'Communicate rotations earlier', cat:'Teamwork', impact:'Medium Impact', status:'Queued' },
    { title:'Hold crosshair at head level', cat:'Mechanics', impact:'Low Impact', status:'Ready for Review' },
  ];
  const statusColor = { Active:'positive', Queued:'confidence', 'Ready for Review':'impact-medium' };
  return `
  <div class="section-id">1D · Focus Queue</div>
  <h1 class="page-title">Short-term practice backlog.</h1>
  <div class="stack">
    ${items.map(it=>`
      <div class="card" style="flex-direction:row;align-items:center;justify-content:space-between;cursor:pointer;" data-modal="8A-focus-detail">
        <div>
          <div style="font-weight:700;font-size:13px;">${it.title}</div>
          <div class="kicker">${it.cat}</div>
        </div>
        <div style="display:flex;gap:8px;align-items:center;">
          <span class="chip ${it.impact.includes('High')?'impact-high':it.impact.includes('Medium')?'impact-medium':'impact-low'}">${it.impact}</span>
          <span class="chip ${statusColor[it.status]}">${it.status}</span>
          <button class="btn sm ghost" data-toast="Focus reordered">Reorder</button>
          <button class="btn sm danger" data-toast="Focus removed" data-toast-type="error">Remove</button>
        </div>
      </div>`).join('')}
  </div>
  `;
}

export function page1E(){
  return `
  <div class="section-id">1E · Log Match</div>
  <h1 class="page-title">Log your reflection.</h1>

  <div class="grid g-3" style="margin-bottom:var(--rc-gap);">
    <div class="card"><div class="kicker">Result</div><div style="font-weight:700;color:var(--rc-success);font-size:16px;">Win · 13–9</div></div>
    <div class="card"><div class="kicker">Map / Agent / Role</div><div style="font-weight:700;">Haven · Reyna · Duelist</div></div>
    <div class="card"><div class="kicker">RR Change</div><div style="font-weight:700;color:var(--rc-success);font-size:16px;">+18 RR <span style="color:var(--rc-text-3);font-size:11px;font-weight:500;">(42 → 60)</span></div></div>
  </div>

  <div class="grid g-2" style="margin-bottom:var(--rc-gap);">
    <div class="card">
      <div class="kicker">Overall Self Rating</div>
      <div style="display:flex;gap:6px;">${[1,2,3,4,5].map(n=>`<button class="btn sm ${n===4?'primary':''}">${n}</button>`).join('')}</div>
    </div>
    <div class="card">
      <div class="kicker">Mood / Feeling</div>
      <div style="display:flex;gap:6px;">${['😞','😕','😐','🙂','😄'].map((e,i)=>`<button class="btn sm ${i===3?'primary':''}" style="font-size:16px;">${e}</button>`).join('')}</div>
    </div>
    <div class="card">
      <div class="kicker">Team Communication Rating</div>
      <div style="display:flex;gap:6px;">${[1,2,3,4,5].map(n=>`<button class="btn sm ${n===3?'primary':''}">${n}</button>`).join('')}</div>
    </div>
    <div class="card">
      <div class="kicker">Self Communication Rating</div>
      <div style="display:flex;gap:6px;">${[1,2,3,4,5].map(n=>`<button class="btn sm ${n===4?'primary':''}">${n}</button>`).join('')}</div>
    </div>
  </div>

  <div class="card" style="margin-bottom:var(--rc-gap);">
    <div class="kicker">Focus Adherence — Stay tradable, don't take isolated first contact</div>
    <div style="display:flex;gap:6px;">
      ${['Didn\'t focus','A little','Somewhat','Focused','Nailed it'].map((l,i)=>`<button class="btn sm ${i===3?'primary':''}">${l}</button>`).join('')}
    </div>
  </div>

  <div class="card" style="margin-bottom:var(--rc-gap);">
    <div class="kicker">Notes</div>
    <textarea rows="3" style="width:100%;background:var(--rc-surface-2);border:1px solid var(--rc-border-subtle);border-radius:var(--rc-radius-sm);color:var(--rc-text-1);padding:10px;font-family:inherit;font-size:12px;">Good team coordination on executes. Still dying before the trade lands on defense — need to hold shoulder peeks longer.</textarea>
  </div>

  <button class="btn primary" data-modal="8B-match-saved">Save Match</button>
  `;
}
