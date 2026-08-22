import { icon } from '../icons.js';
import { planCompareTable } from './shared.js';

export function page6A(){
  return `
  <div class="section-id">6A · General / Profile</div>
  <h1 class="page-title">General preferences.</h1>
  <div class="grid g-2">
    <div class="card">
      <div class="kicker">Display Name</div>
      <input value="DemoPlayer" style="background:var(--rc-surface-2);border:1px solid var(--rc-border-subtle);border-radius:8px;color:var(--rc-text-1);padding:9px 12px;font-size:12px;margin-top:6px;">
    </div>
    <div class="card">
      <div class="kicker">Goal Rank</div>
      <select style="background:var(--rc-surface-2);border:1px solid var(--rc-border-subtle);border-radius:8px;color:var(--rc-text-1);padding:9px 12px;font-size:12px;margin-top:6px;"><option>Ascendant 1</option></select>
    </div>
    <div class="card">
      <div class="kicker">Default Region</div>
      <select style="background:var(--rc-surface-2);border:1px solid var(--rc-border-subtle);border-radius:8px;color:var(--rc-text-1);padding:9px 12px;font-size:12px;margin-top:6px;"><option>NA</option></select>
    </div>
    <div class="card">
      <div class="kicker">Language</div>
      <select style="background:var(--rc-surface-2);border:1px solid var(--rc-border-subtle);border-radius:8px;color:var(--rc-text-1);padding:9px 12px;font-size:12px;margin-top:6px;"><option>English</option></select>
    </div>
  </div>
  `;
}

export function page6B(){
  return `
  <div class="section-id">6B · Visual</div>
  <h1 class="page-title">Appearance.</h1>
  <div class="card" style="margin-bottom:var(--rc-gap);">
    <div class="card-head"><div class="card-title">Standard (Basic)</div></div>
    <div class="grid g-3">
      <div><div class="kicker">Theme</div><div class="chip confidence">Obsidian (default)</div></div>
      <div><div class="kicker">Density</div><div class="chip">Balanced</div></div>
      <div><div class="kicker">Reduced Motion</div><div class="chip">Off</div></div>
    </div>
  </div>

  <div class="card tier-lock" style="margin-bottom:var(--rc-gap);">
    <span class="lock-badge">${icon('lock')} Elite</span>
    <div class="lock-cta">${icon('lock','lock-icon')}<p>Custom palette builder, expanded icon styles, and saved presets are Elite features.</p><button class="btn sm primary" data-modal="8I-upgrade">Upgrade to Elite</button></div>
    <div class="card-head"><div class="card-title">Advanced Customization</div></div>
    <div class="grid g-3">
      <div><div class="kicker">Custom Palette</div><div class="chip">Locked</div></div>
      <div><div class="kicker">Icon Style</div><div class="chip">Locked</div></div>
      <div><div class="kicker">Saved Presets</div><div class="chip">Locked</div></div>
    </div>
  </div>

  <div class="card tier-lock">
    <span class="lock-badge">${icon('lock')} Elite</span>
    <div class="lock-cta">${icon('lock','lock-icon')}<p>Dashboard personalization (compact/balanced/comfortable density, hide/reorder widgets) is Elite.</p><button class="btn sm primary" data-modal="8I-upgrade">Upgrade to Elite</button></div>
    <div class="card-head"><div class="card-title">Dashboard Personalization</div></div>
    <div class="kicker">Compact / Balanced / Comfortable · show/hide secondary widgets · saved layouts</div>
  </div>

  <div class="card" style="margin-top:var(--rc-gap);">
    <div class="card-head"><div class="card-title">Backgrounds</div></div>
    <div class="grid g-4">
      <div class="bg-option selected" data-bg-select>
        <div class="bg-swatch nebula-bg" style="position:static;"></div>
        <div class="kicker">Starry Nebula</div>
      </div>
      <div class="bg-option" data-bg-select>
        <div class="bg-swatch" style="background:linear-gradient(160deg,#0e1622,#070b12 70%);"></div>
        <div class="kicker">Dark Gradient</div>
      </div>
      <div class="bg-option" data-bg-select>
        <div class="bg-swatch" style="background:#070b12;background-image:radial-gradient(1px 1px at 20% 30%,rgba(255,255,255,.15) 1px,transparent 1px);background-size:14px 14px;"></div>
        <div class="kicker">Subtle Pattern</div>
      </div>
      <div class="bg-option" data-bg-select>
        <div class="bg-swatch" style="background:#070b12;background-image:linear-gradient(rgba(139,92,246,.15) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,.15) 1px,transparent 1px);background-size:12px 12px;"></div>
        <div class="kicker">Matrix Grid</div>
      </div>
    </div>
    <div class="kicker" style="margin-top:8px;">Starry Nebula is the current default across the app — a self-contained CSS starfield with brand-colored nebula clouds, no external image dependency.</div>
  </div>
  `;
}

export function page6C(){
  const styles = [
    { n:'Direct', ex:'Your KAST is falling. Stop taking isolated first contacts.' },
    { n:'Educational', ex:'Your KAST has declined because you are dying before trades or utility cycles complete. Staying tradable should improve both survival and team conversion.' },
    { n:'Concise', ex:'Stay tradable. Stop isolating first contact.' },
  ];
  return `
  <div class="section-id">6C · Coaching Style</div>
  <h1 class="page-title">How coaching is written to you.</h1>
  <div class="page-note">Same evidence, same Insight, same coaching quality for every tier — this only changes tone, not data.</div>
  <div class="grid g-3">
    ${styles.map((s,i)=>`
      <div class="card ${i===0?'':''}" style="${i===0?'border-color:var(--rc-brand-strong);':''}">
        <div class="card-head"><div class="card-title">${s.n}</div>${i===0?'<span class="chip confidence">Selected</span>':''}</div>
        <div class="card-sub" style="font-style:italic;">"${s.ex}"</div>
        ${i!==0?`<button class="btn sm" data-toast="Coaching style updated">Select</button>`:''}
      </div>`).join('')}
  </div>
  `;
}

export function page6D(){
  return `
  <div class="section-id">6D · Notifications</div>
  <h1 class="page-title">Toast &amp; event notifications.</h1>
  <div class="card" style="margin-bottom:var(--rc-gap);">
    <div class="card-head"><div class="card-title">Basic</div></div>
    <div class="grid g-2">
      ${['Error notifications','Product updates','Achievement notifications','Rank changes','Personal Plan milestones','New library video','New routine','Focus ready for reassessment'].map(n=>`
        <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--rc-border-subtle);"><span style="font-size:12px;color:var(--rc-text-2);">${n}</span><input type="checkbox" checked></div>`).join('')}
    </div>
  </div>
  <div class="card tier-lock">
    <span class="lock-badge">${icon('lock')} Elite</span>
    <div class="lock-cta">${icon('lock','lock-icon')}<p>Custom stat-threshold alerts are an Elite feature.</p><button class="btn sm primary" data-modal="8I-upgrade">Upgrade to Elite</button></div>
    <div class="card-head"><div class="card-title">Advanced Rules</div></div>
    <div class="stack" style="gap:6px;">
      <div class="kicker">Notify when 10-match KAST reaches 72%</div>
      <div class="kicker">Notify when K/D falls below 0.95 over a selected window</div>
      <div class="kicker">Notify on new peak rank</div>
    </div>
  </div>
  `;
}

export function page6E(){
  return `
  <div class="section-id">6E · Data / Connections</div>
  <h1 class="page-title">Match data.</h1>
  <div class="card">
    <div class="grid g-2">
      <div><div class="kicker">Connected Riot ID</div><div style="font-weight:700;">DemoPlayer#NA1</div></div>
      <div><div class="kicker">Region</div><div style="font-weight:700;">NA</div></div>
      <div><div class="kicker">Last Updated</div><div style="font-weight:700;">4 minutes ago</div></div>
      <div><div class="kicker">Match Count</div><div style="font-weight:700;">312 matches</div></div>
    </div>
    <div style="display:flex;gap:8px;margin-top:14px;">
      <button class="btn primary" data-toast="Match data refreshed">Refresh Data</button>
      <button class="btn ghost" data-toast="Riot ID reconnect started">Change Riot ID</button>
    </div>
    <div class="page-note" style="margin-top:14px;">If a refresh fails you'll see <b>Data Refresh Failed</b> here rather than any specific provider error.</div>
  </div>
  `;
}

export function page6F(){
  return `
  <div class="section-id">6F · Billing</div>
  <h1 class="page-title">Plans &amp; billing.</h1>
  <div class="card" style="margin-bottom:var(--rc-gap);">
    <div class="card-head"><div class="card-title">Current Plan</div><span class="tier-badge elite">Elite</span></div>
    <div class="card-sub">$7.99/month · renews Sep 21, 2026</div>
    <button class="btn sm ghost" data-toast="Redirecting to manage billing">Manage Payment Method</button>
  </div>
  ${planCompareTable()}
  <div style="display:flex;gap:8px;margin-top:14px;">
    <button class="btn" data-toast="Downgraded to Supporter">Switch to Supporter</button>
    <button class="btn ghost" data-toast="Downgraded to Basic">Switch to Basic</button>
  </div>
  `;
}
