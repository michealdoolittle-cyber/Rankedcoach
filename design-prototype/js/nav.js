import { icon, Icon } from './icons.js';

// Canonical nav tree per RankedCoach_Master_Architecture_Concept_Generation_Map.txt Groups 1-7.
export const NAV = [
  { id:'play', label:'Play', groupIcon:'play', children:[
    { id:'1A', label:'Home' },
    { id:'1B', label:'Match Prep' },
    { id:'1C', label:'In-Game' },
    { id:'1D', label:'Focus Queue' },
    { id:'1E', label:'Log Match' },
  ]},
  { id:'review', label:'Review', groupIcon:'review', children:[
    { id:'2A', label:'Overview' },
    { id:'2B', label:'Improvement Timeline' },
    { id:'2C', label:'Insights' },
    { id:'2E', label:'Reflection Matches' },
    { id:'2G', label:'All Matches' },
    { id:'2H', label:'Stats' },
  ]},
  { id:'learn', label:'Learn', groupIcon:'learn', children:[
    { id:'3A', label:'Discover' },
    { id:'3B', label:'Maps' },
    { id:'3C', label:'Agents' },
    { id:'3D', label:'Concepts' },
    { id:'3E', label:'Situations' },
    { id:'3F', label:'Personal Plan' },
    { id:'3G', label:'Gear' },
  ]},
  { id:'library', label:'Library', groupIcon:'library', children:[
    { id:'4A', label:'Overview' },
    { id:'4B', label:'Lineups' },
    { id:'4C', label:'Routines' },
    { id:'4D', label:'Videos / Collections' },
  ]},
  { id:'help', label:'Help', groupIcon:'help', children:[
    { id:'7A', label:'Help Center' },
    { id:'7B', label:'Getting Started' },
    { id:'7C', label:'Metrics' },
    { id:'7D', label:'Troubleshooting' },
    { id:'7E', label:'Feedback' },
    { id:'7F', label:'About' },
  ]},
];

// Account and Settings are no longer top-level nav groups in the main list — the account
// block in the sidebar footer (opens 8H Profile Popover, which already links to Profile/
// Billing/Help) covers Account, and the new gear icon covers Settings directly. Their pages
// still exist and are still real navigation targets, just reached from the footer instead.
export const FOOTER_PAGES = [
  { id:'5A', label:'Profile', group:'account', groupLabel:'Account' },
  { id:'5B', label:'Profiles', group:'account', groupLabel:'Account', elite:true },
  { id:'6A', label:'General / Profile', group:'settings', groupLabel:'Settings' },
  { id:'6B', label:'Visual', group:'settings', groupLabel:'Settings' },
  { id:'6C', label:'Coaching Style', group:'settings', groupLabel:'Settings' },
  { id:'6D', label:'Notifications', group:'settings', groupLabel:'Settings' },
  { id:'6E', label:'Data / Connections', group:'settings', groupLabel:'Settings' },
  { id:'6F', label:'Billing', group:'settings', groupLabel:'Settings' },
];

// Drill-down screens reachable by clicking into a list, not listed in the sidebar itself.
export const EXTRA_PAGES = [
  { id:'2D', label:'Insight Detail', group:'review', groupLabel:'Review' },
  { id:'2F', label:'Match Detail', group:'review', groupLabel:'Review' },
];

export const PAGE_META = {}; // id -> {group, label, groupLabel}
NAV.forEach(g => g.children.forEach(c => { PAGE_META[c.id] = { group:g.id, label:c.label, groupLabel:g.label, elite:!!c.elite }; }));
EXTRA_PAGES.forEach(p => { PAGE_META[p.id] = p; });
FOOTER_PAGES.forEach(p => { PAGE_META[p.id] = p; });

const childIconFallback = { '1B':'matchPrep','1C':'inGame','1D':'focusQueue','1E':'logMatch' };

export function renderSidebar(){
  const groups = NAV.map(g => {
    const items = g.children.map(c => {
      const eliteBadge = c.elite ? `<span class="tier-badge elite" style="margin-left:auto;">Elite</span>` : '';
      const ic = childIconFallback[c.id];
      return `<div class="nav-item" data-page="${c.id}">${ic?icon(ic):''}<span>${c.label}</span>${eliteBadge}</div>`;
    }).join('');
    return `
      <div class="nav-group-label">${g.label}</div>
      <div class="nav-item nav-group-toggle" data-group="${g.id}">${icon(g.groupIcon)}<span>${g.label}</span></div>
      <div class="nav-children" data-group-children="${g.id}">${items}</div>
    `;
  }).join('');

  return `
    <div class="brand">
      <div class="brand-mark"></div>
      <div class="brand-word">RANKED<b>COACH</b></div>
      <button class="icon-btn" data-modal="8G-search" title="Search (8G)" style="margin-left:auto;">${icon('search')}</button>
    </div>
    ${groups}
    <div class="sidebar-spacer"></div>
    <div class="sidebar-account" data-modal="8H-profile">
      <div class="avatar-dot"></div>
      <div class="meta-txt"><strong>DemoPlayer</strong><span>Diamond 1 · 42 RR</span></div>
      <span class="tier-badge elite">Elite</span>
    </div>
    <div class="sidebar-footer-row">
      <button class="icon-btn" data-jump="6A" title="Settings">${icon('settings')}</button>
      <button class="icon-btn" data-toast="No new notifications" title="Notifications">${icon('bell')}</button>
    </div>
  `;
}

export function activatePage(id, opts){
  opts = opts || {};
  const meta = PAGE_META[id];
  if(!meta) return;
  document.querySelectorAll('.nav-item[data-page]').forEach(i=>i.classList.toggle('active', i.dataset.page === id));
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  const target = document.getElementById('page-'+id);
  if(!target) return;
  target.classList.remove('active'); void target.offsetWidth; target.classList.add('active');
  document.title = 'RankedCoach — ' + meta.label + ' (' + id + ')';
  const url = new URL(location.href);
  url.searchParams.set('page', id);
  if(!opts.noHistory) history.replaceState(null,'',url);
}

export function initNav(){
  document.querySelectorAll('.nav-item[data-page]').forEach(item=>{
    item.addEventListener('click', ()=> activatePage(item.dataset.page));
  });
  document.querySelectorAll('.nav-group-toggle').forEach(item=>{
    item.addEventListener('click', ()=>{
      const kids = document.querySelector(`[data-group-children="${item.dataset.group}"]`);
      if(kids) kids.style.display = kids.style.display === 'none' ? 'flex' : 'none';
    });
  });
}
