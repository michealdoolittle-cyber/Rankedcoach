import { icon } from '../icons.js';
import { radarChart, trendLine, miniBar, evidenceStat } from '../charts.js';

const METRIC_ROW = [
  ['KAST','72%','+3%',true],['ACS','248','+12',true],['K/D','1.12','-0.04',false],['HS%','24%','+1%',true],['Win Rate','52%','+2%',true],
];
const METRIC_ICON = { 'KAST':'metricKAST','ACS':'metricACS','K/D':'metricKD','HS%':'metricHS','Win Rate':'metricWinRate' };

function metricStrip(){
  return `<div class="grid g-5">${METRIC_ROW.map(([k,v,d,up])=>`
    <div class="metric-tile">${icon(METRIC_ICON[k])}<div class="value">${v}</div><div class="kicker">${k}</div><div style="font-size:11px;font-weight:700;color:${up?'var(--rc-success)':'var(--rc-danger)'};">${d}</div></div>`).join('')}</div>`;
}

export function page2A(){
  return `
  <div class="section-id">2A · Review Overview</div>
  <h1 class="page-title">Where your season stands.</h1>

  <div class="grid g-2" style="margin-bottom:var(--rc-gap);">
    <div class="card">
      <div class="card-head"><div class="card-title">Current Rank</div></div>
      <div style="font-family:var(--rc-font-display);font-size:24px;font-weight:700;">Diamond 1 · 42 RR</div>
      ${trendLine([18,24,20,30,26,34,42],{h:80})}
    </div>
    <div class="card" style="cursor:pointer;" data-jump="2B">
      <div class="card-head"><div class="card-title">Compass</div></div>
      ${radarChart(['Mechanics','Game Sense','Teamwork','Discipline','Mental'],[68,74,62,58,64],{size:170})}
    </div>
  </div>

  <div class="card" style="margin-bottom:var(--rc-gap);cursor:pointer;" data-jump="2B">
    <div class="card-head"><div class="card-title">Improvement Metrics</div></div>
    ${metricStrip()}
  </div>

  <div class="rail" style="margin-bottom:var(--rc-gap);">
    <div class="card" style="cursor:pointer;" data-jump="2G">
      <div class="card-head"><div class="card-title">Recent Matches</div></div>
      <table><thead><tr><th>Map</th><th>Result</th><th>Score</th><th>RR</th></tr></thead>
      <tbody>
        <tr><td>Haven</td><td style="color:var(--rc-success);">Win</td><td>13-9</td><td style="color:var(--rc-success);">+18</td></tr>
        <tr><td>Ascent</td><td style="color:var(--rc-danger);">Loss</td><td>10-13</td><td style="color:var(--rc-danger);">-14</td></tr>
        <tr><td>Lotus</td><td style="color:var(--rc-success);">Win</td><td>13-7</td><td style="color:var(--rc-success);">+21</td></tr>
      </tbody></table>
    </div>
    <div class="stack">
      <div class="card" style="cursor:pointer;" data-jump="2D">
        <div class="kicker">Top Insight</div>
        <div style="font-weight:700;font-size:13px;">Your crosshair placement is winning you more fights.</div>
      </div>
      <div class="card" style="cursor:pointer;" data-jump="3F">
        <div class="kicker">Personal Plan Progress</div>
        <div style="font-weight:700;font-size:13px;">Climb to Ascendant — Week 4 of 6</div>
        ${miniBar(64)}
      </div>
    </div>
  </div>
  `;
}

export function page2B(){
  return `
  <div class="section-id">2B · Improvement Timeline</div>
  <h1 class="page-title">Trend the 5 metrics that matter.</h1>
  <div class="card" style="margin-bottom:var(--rc-gap);display:flex;flex-direction:row;gap:10px;align-items:center;">
    <span class="chip">Last 30 Days</span><span class="chip">Act 4</span><span class="chip confidence">Metric: KAST</span>
  </div>
  <div class="card" style="margin-bottom:var(--rc-gap);">
    <div class="card-title">KAST — 72%</div>
    ${trendLine([58,61,64,63,68,70,72],{h:160})}
    <div class="kicker">Match markers shown at each data point — click a match on Improvement Timeline to open its Match Detail.</div>
  </div>
  <div class="grid g-5">
    ${METRIC_ROW.map(([k,v,d,up])=>`
      <div class="metric-tile" style="cursor:pointer;">${icon(METRIC_ICON[k])}<div class="value">${v}</div><div class="kicker">${k}</div><div style="font-size:11px;font-weight:700;color:${up?'var(--rc-success)':'var(--rc-danger)'};">${d}</div></div>`).join('')}
  </div>
  `;
}

export function page2C(){
  const items = [
    { t:'Your crosshair placement is winning you more fights.', cat:'Mechanics', impact:'High Impact', conf:'83%', status:'Active' },
    { t:'You are losing post-plant retakes more often on attack.', cat:'Discipline', impact:'High Impact', conf:'76%', status:'Watch' },
    { t:'Your headshot rate is improving consistently.', cat:'Mechanics', impact:'Positive', conf:'71%', status:'Active' },
    { t:'You rotate late with low info more than most.', cat:'Game Sense', impact:'Medium Impact', conf:'68%', status:'Watch' },
  ];
  return `
  <div class="section-id">2C · Insights</div>
  <h1 class="page-title">Every conclusion, with its evidence.</h1>
  <div class="stack">
    ${items.map(it=>`
      <div class="card" style="flex-direction:row;align-items:center;justify-content:space-between;cursor:pointer;" data-jump="2D">
        <div style="max-width:60%;"><div style="font-weight:700;font-size:13px;">${it.t}</div><div class="kicker">${it.cat} · ${it.status}</div></div>
        <div style="display:flex;gap:8px;"><span class="chip ${it.impact.includes('High')?'impact-high':it.impact==='Positive'?'positive':'impact-medium'}">${it.impact}</span><span class="chip confidence">Confidence ${it.conf}</span></div>
      </div>`).join('')}
  </div>
  `;
}

export function page2D(){
  return `
  <div class="section-id">2D · Insight Detail</div>
  <button class="btn sm ghost" data-jump="2C" style="margin-bottom:10px;">${icon('chevronRight')} Back to Insights</button>
  <h1 class="page-title">Your crosshair placement is winning you more fights.</h1>
  <div style="display:flex;gap:10px;margin-bottom:var(--rc-gap);">
    <span class="chip impact-high">High Impact</span><span class="chip confidence">Confidence 83%</span><span class="chip">Mechanics</span>
  </div>
  <div class="rail" style="margin-bottom:var(--rc-gap);">
    <div class="stack">
      <div class="card"><div class="kicker">What Is Happening</div><p style="color:var(--rc-text-2);font-size:12px;margin:6px 0 0;">You win 63% of duels when your crosshair is already head-level on the angle you're holding, versus 41% when you're tracking up from waist height.</p></div>
      <div class="card"><div class="kicker">Why It Matters</div><p style="color:var(--rc-text-2);font-size:12px;margin:6px 0 0;">Winning the first engagement of a round is the single strongest predictor of winning the round itself.</p></div>
      <div class="card"><div class="kicker">Recommended Corrective Behavior</div><ul style="margin:6px 0 0;padding-left:18px;color:var(--rc-text-2);font-size:12px;line-height:1.7;"><li>Hold head level on common angles</li><li>Clear close corners with utility before peeking</li><li>Don't re-peek after a trade — reset instead</li></ul></div>
    </div>
    <div class="stack">
      <div class="card">
        <div class="kicker">Evidence Breakdown</div>
        <div style="margin-top:8px;">
          ${evidenceStat('Opening Duels Taken Alone', '68%', 68, 'var(--rc-danger)')}
          ${evidenceStat('Duel Loss Rate', '42%', 42, 'var(--rc-warning)')}
          ${evidenceStat('RR Impact / 10 Matches', '-18 RR', 60, 'var(--rc-brand)')}
        </div>
        <div class="kicker">Insight Status</div>
        <span class="chip positive">Active</span>
      </div>
      <div class="card" style="cursor:pointer;" data-jump="2F"><div class="kicker">Related Match</div><div style="font-weight:700;font-size:12.5px;">Haven · Win 13-9</div></div>
      <div class="card" style="cursor:pointer;" data-jump="3D"><div class="kicker">Related Content</div><div style="font-weight:700;font-size:12.5px;">Crosshair Placement — Concept</div></div>
      <div class="card"><button class="btn primary" data-jump="1D" data-toast="Added to Focus Queue">Add to Focus Queue</button></div>
    </div>
  </div>
  `;
}

export function page2E(){
  const rows = [
    ['Aug 21','Lotus','Sova','Initiator','Win','13-9','+18','Stay tradable','Focused'],
    ['Aug 20','Ascent','Omen','Controller','Loss','10-13','-14','Use utility first','Somewhat'],
    ['Aug 20','Haven','Killjoy','Sentinel','Win','13-7','+21','Hold post-plant angle','Nailed it'],
  ];
  return `
  <div class="section-id">2E · Reflection Matches</div>
  <h1 class="page-title">Only matches with saved reflections.</h1>
  <div class="card">
    <table>
      <thead><tr><th>Date</th><th>Map</th><th>Agent</th><th>Role</th><th>Result</th><th>RR</th><th>Focus</th><th>Adherence</th></tr></thead>
      <tbody>
        ${rows.map(r=>`<tr data-jump="2F">
          <td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td>
          <td style="color:${r[4]==='Win'?'var(--rc-success)':'var(--rc-danger)'};">${r[4]}</td>
          <td>${r[5]} · ${r[6]}</td><td>${r[7]}</td><td>${r[8]}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>
  `;
}

export function page2F(){
  return `
  <div class="section-id">2F · Match Detail</div>
  <button class="btn sm ghost" data-jump="2E" style="margin-bottom:10px;">${icon('chevronRight')} Back to Reflection Matches</button>
  <h1 class="page-title">Haven · Win 13-9</h1>
  <div class="grid g-4" style="margin-bottom:var(--rc-gap);">
    <div class="metric-tile"><div class="value">1.4</div><div class="kicker">K/D</div></div>
    <div class="metric-tile"><div class="value">261</div><div class="kicker">ACS</div></div>
    <div class="metric-tile"><div class="value">76%</div><div class="kicker">KAST</div></div>
    <div class="metric-tile"><div class="value">28%</div><div class="kicker">HS%</div></div>
  </div>
  <div class="grid g-2" style="margin-bottom:var(--rc-gap);">
    <div class="card">
      <div class="kicker">Reflection</div>
      <div style="display:flex;gap:16px;margin:8px 0;font-size:12px;color:var(--rc-text-2);"><span>Overall <b style="color:var(--rc-text-1);">4/5</b></span><span>Team Comms <b style="color:var(--rc-text-1);">3/5</b></span><span>Self Comms <b style="color:var(--rc-text-1);">4/5</b></span><span>Mood <b style="color:var(--rc-text-1);">🙂</b></span></div>
      <div class="kicker">Focus Adherence — Stay tradable</div>
      <div style="font-weight:700;color:var(--rc-success);">Focused</div>
      <div class="kicker" style="margin-top:8px;">Notes</div>
      <p style="color:var(--rc-text-2);font-size:12px;">Good team coordination on executes. Still dying before the trade on defense.</p>
    </div>
    <div class="stack">
      <div class="card" style="cursor:pointer;" data-jump="2D"><div class="kicker">Related Insight</div><div style="font-weight:700;font-size:12.5px;">Your crosshair placement is winning you more fights.</div></div>
      <div class="card" style="cursor:pointer;" data-jump="1A"><div class="kicker">Focus</div><div style="font-weight:700;font-size:12.5px;">Stay tradable — don't take isolated first contact.</div></div>
      <div class="card">
        <div class="kicker">Round Breakdown</div>
        <span class="needs-validation">Needs Validation</span>
        <p style="color:var(--rc-text-3);font-size:11px;margin-top:2px;">Round-by-round telemetry isn't confirmed available from the data provider yet — shown here rather than invented.</p>
      </div>
    </div>
  </div>
  <div class="rail">
    <div class="card" style="cursor:pointer;" data-jump="3C"><div class="kicker">Agent</div><div style="font-weight:700;">Reyna — Duelist</div></div>
    <div class="card" style="cursor:pointer;" data-jump="3B"><div class="kicker">Map</div><div style="font-weight:700;">Haven</div></div>
  </div>
  `;
}

export function page2G(){
  const rows = [
    ['Aug 21','Win','Lotus','Sova','Initiator','13-9','+18'],
    ['Aug 20','Loss','Ascent','Omen','Controller','10-13','-14'],
    ['Aug 20','Win','Haven','Killjoy','Sentinel','13-7','+21'],
    ['Aug 19','Win','Bind','Raze','Duelist','14-12','+16'],
    ['Aug 18','Draw','Split','Cypher','Sentinel','12-12','+0'],
  ];
  return `
  <div class="section-id">2G · All Matches</div>
  <h1 class="page-title">Full ranked history.</h1>
  <div style="display:flex;gap:8px;margin-bottom:var(--rc-gap);flex-wrap:wrap;">
    ${['Date','Act','Result','Map','Agent','Role'].map(f=>`<span class="chip">${f} ▾</span>`).join('')}
  </div>
  <div class="card">
    <table>
      <thead><tr><th>Date</th><th>Result</th><th>Map</th><th>Agent</th><th>Role</th><th>Score</th><th>RR</th></tr></thead>
      <tbody>
        ${rows.map(r=>`<tr data-jump="2F">
          <td>${r[0]}</td><td style="color:${r[1]==='Win'?'var(--rc-success)':r[1]==='Loss'?'var(--rc-danger)':'var(--rc-text-3)'};">${r[1]}</td>
          <td>${r[2]}</td><td>${r[3]}</td><td>${r[4]}</td><td>${r[5]}</td><td>${r[6]}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>
  `;
}

export function page2H(){
  return `
  <div class="section-id">2H · Stats</div>
  <h1 class="page-title">Raw supported statistics.</h1>
  <div class="tabrow" id="statsTabs">
    <button class="active" data-tab="2H-1">Overview</button>
    <button data-tab="2H-2">Weapons</button>
    <button data-tab="2H-3">Agents</button>
    <button data-tab="2H-4">Maps</button>
  </div>

  <div id="2H-1" class="subpane">
    ${metricStrip()}
    <div class="card" style="margin-top:var(--rc-gap);">${trendLine([58,61,64,63,68,70,72],{h:120})}</div>
  </div>

  <div id="2H-2" class="subpane" style="display:none;">
    <div class="card">
      <table><thead><tr><th>Weapon</th><th>Kills</th><th>HS%</th><th>Damage/Round</th></tr></thead>
      <tbody>
        <tr><td style="display:flex;align-items:center;gap:8px;"><img src="./assets/weapons/vandal.png" style="width:28px;height:16px;object-fit:contain;">Vandal</td><td>612</td><td>24%</td><td>151</td></tr>
        <tr><td style="display:flex;align-items:center;gap:8px;"><img src="./assets/weapons/phantom.png" style="width:28px;height:16px;object-fit:contain;">Phantom</td><td>389</td><td>21%</td><td>142</td></tr>
        <tr><td style="display:flex;align-items:center;gap:8px;"><img src="./assets/weapons/sheriff.png" style="width:24px;height:16px;object-fit:contain;">Sheriff</td><td>98</td><td>32%</td><td>96</td></tr>
      </tbody></table>
      <div class="kicker" style="margin-top:10px;">Advanced economy telemetry <span class="needs-validation">Needs Validation</span></div>
    </div>
  </div>

  <div id="2H-3" class="subpane" style="display:none;">
    <div class="card">
      <table><thead><tr><th>Agent</th><th>Matches</th><th>Win Rate</th><th>K/D</th><th>Role</th></tr></thead>
      <tbody>
        <tr data-jump="3C"><td>Reyna</td><td>26</td><td>58%</td><td>1.31</td><td>Duelist</td></tr>
        <tr data-jump="3C"><td>Jett</td><td>14</td><td>50%</td><td>1.12</td><td>Duelist</td></tr>
      </tbody></table>
    </div>
  </div>

  <div id="2H-4" class="subpane" style="display:none;">
    <div class="card">
      <table><thead><tr><th>Map</th><th>Matches</th><th>Win Rate</th><th>Attack/Defense</th></tr></thead>
      <tbody>
        <tr data-jump="3B"><td>Haven</td><td>10</td><td>60%</td><td><span class="needs-validation">Needs Validation</span></td></tr>
        <tr data-jump="3B"><td>Ascent</td><td>8</td><td>50%</td><td><span class="needs-validation">Needs Validation</span></td></tr>
      </tbody></table>
    </div>
  </div>
  `;
}
