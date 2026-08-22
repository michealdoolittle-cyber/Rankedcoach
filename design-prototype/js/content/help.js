import { icon } from '../icons.js';

export function page7A(){
  const cats = [
    { t:'Getting Started', jump:'7B' }, { t:'Match Data', jump:'6E' },
    { t:'Play / Focus', jump:'1A' }, { t:'Review / Stats', jump:'2A' },
    { t:'Learn / Library', jump:'3A' }, { t:'Account / Billing', jump:'6F' },
  ];
  return `
  <div class="section-id">7A · Help Center</div>
  <h1 class="page-title">How can we help?</h1>
  <div style="display:flex;align-items:center;gap:10px;border:1px solid var(--rc-border-strong);border-radius:10px;padding:10px 14px;margin-bottom:var(--rc-gap);">
    ${icon('search')}<input placeholder="Search help articles..." style="background:none;border:none;color:var(--rc-text-1);font-size:13px;flex:1;outline:none;">
  </div>
  <div class="grid g-3">
    ${cats.map(c=>`<div class="card" style="cursor:pointer;" data-jump="${c.jump}"><div class="card-title" style="font-size:14px;">${c.t}</div></div>`).join('')}
  </div>
  `;
}

export function page7B(){
  const steps = [
    'Connect your Riot ID', 'Understand Focus', 'Start a Match', 'Select Map / Role in Match Prep',
    'Use In-Game', 'Log Match', 'Understand Review', 'Create a Personal Plan',
  ];
  return `
  <div class="section-id">7B · Getting Started</div>
  <h1 class="page-title">The first-time setup path.</h1>
  <div class="stack">
    ${steps.map((s,i)=>`<div class="card" style="flex-direction:row;align-items:center;gap:14px;"><div class="metric-tile" style="width:32px;height:32px;flex:none;padding:0;align-items:center;justify-content:center;">${i+1}</div><span style="font-weight:700;font-size:13px;">${s}</span></div>`).join('')}
  </div>
  `;
}

export function page7C(){
  const metrics = [
    { n:'KAST', d:'% of rounds with a Kill, Assist, Survive, or Trade.' },
    { n:'ACS', d:'Average Combat Score per round.' },
    { n:'K/D', d:'Kills divided by deaths.' },
    { n:'Headshot %', d:'% of kills that were headshots.' },
    { n:'Win Rate', d:'% of matches won.' },
    { n:'RR', d:'Rank Rating — progress toward the next rank.' },
    { n:'Impact', d:'How much a Focus or Insight affects your results.' },
    { n:'Confidence', d:'How much match sample supports a conclusion.' },
    { n:'Compass', d:'Five coaching dimensions, shown as a pentagon.' },
  ];
  return `
  <div class="section-id">7C · Metrics &amp; Definitions</div>
  <h1 class="page-title">What every stat means.</h1>
  <div class="grid g-3">
    ${metrics.map(m=>`<div class="card"><div class="card-title" style="font-size:13px;">${m.n}</div><div class="card-sub">${m.d}</div></div>`).join('')}
  </div>
  `;
}

export function page7D(){
  const topics = [
    'Account lookup failed', 'Match history not appearing', 'Data refresh failed',
    'Profile issue', 'Display issue', 'Saved reflection issue', 'Personal Plan issue',
  ];
  return `
  <div class="section-id">7D · Troubleshooting</div>
  <h1 class="page-title">Common issues.</h1>
  <div class="stack">
    ${topics.map(t=>`<div class="card" style="flex-direction:row;align-items:center;justify-content:space-between;cursor:pointer;"><span style="font-weight:700;font-size:12.5px;">${t}</span>${icon('chevronRight')}</div>`).join('')}
  </div>
  `;
}

export function page7E(){
  return `
  <div class="section-id">7E · Feedback / Report Issue</div>
  <h1 class="page-title">Tell us what's wrong (or right).</h1>
  <div class="card" style="max-width:520px;">
    <div class="kicker">Category</div>
    <select style="background:var(--rc-surface-2);border:1px solid var(--rc-border-subtle);border-radius:8px;color:var(--rc-text-1);padding:9px 12px;font-size:12px;margin:6px 0 14px;"><option>Bug Report</option><option>Feature Request</option><option>General Feedback</option></select>
    <div class="kicker">Description</div>
    <textarea rows="4" style="width:100%;background:var(--rc-surface-2);border:1px solid var(--rc-border-subtle);border-radius:8px;color:var(--rc-text-1);padding:10px;font-size:12px;margin-top:6px;" placeholder="What happened?"></textarea>
    <button class="btn primary" style="margin-top:12px;" data-toast="Feedback submitted, thank you">Submit Feedback</button>
  </div>
  `;
}

export function page7F(){
  return `
  <div class="section-id">7F · About / Legal</div>
  <h1 class="page-title">About Ranked Coach.</h1>
  <div class="card" style="max-width:560px;">
    <p style="color:var(--rc-text-2);font-size:12.5px;line-height:1.6;">Ranked Coach helps Valorant players understand and improve their ranked performance through evidence-based coaching, not guesswork.</p>
    <div class="kicker" style="margin-top:10px;">Version 0.9.0 (Design Prototype)</div>
    <div class="stack" style="gap:6px;margin-top:12px;">
      <a href="#" style="font-size:12px;color:var(--rc-brand-strong);">Privacy Policy</a>
      <a href="#" style="font-size:12px;color:var(--rc-brand-strong);">Terms of Service</a>
      <a href="#" style="font-size:12px;color:var(--rc-brand-strong);">Riot Games Third-Party Disclaimer</a>
      <a href="#" style="font-size:12px;color:var(--rc-brand-strong);">Affiliate Disclosure</a>
      <a href="#" style="font-size:12px;color:var(--rc-brand-strong);">Advertising Disclosure</a>
    </div>
  </div>
  `;
}
