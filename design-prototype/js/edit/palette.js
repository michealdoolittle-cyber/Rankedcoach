import { icon } from '../icons.js';
import { recordAdded, pushUndo } from './state.js';
import { getCurrentPageId, refreshEditableRegion } from './editor.js';

const PRESETS = [
  { type:'stat-tile', label:'Stat Tile', ic:'palStat', w:160, h:100 },
  { type:'bar-graph', label:'Bar Graph', ic:'palBar', w:220, h:130 },
  { type:'trend-graph', label:'Trend Graph', ic:'palTrend', w:240, h:130 },
  { type:'radar-chart', label:'Radar / Compass', ic:'palRadar', w:200, h:200 },
  { type:'slider', label:'Slider / Rating', ic:'palSlider', w:220, h:70 },
  { type:'icon-glyph', label:'Icon', ic:'palIcon', w:60, h:60 },
  { type:'text-block', label:'Text Block', ic:'palText', w:220, h:80 },
  { type:'card', label:'Generic Card', ic:'palCard', w:220, h:140 },
  { type:'button', label:'Button', ic:'palButton', w:130, h:40 },
  { type:'image', label:'Image / Portrait', ic:'palImage', w:180, h:180 },
];

function blockInnerHTML(preset){
  switch(preset.type){
    case 'stat-tile': return `<div class="sb-label">Stat Tile</div><div style="font-family:var(--rc-font-display);font-size:22px;font-weight:700;" contenteditable="true" class="sb-name">0</div><div class="kicker" contenteditable="true">Label</div>`;
    case 'bar-graph': return `<div class="sb-label">Bar Graph</div><div style="display:flex;align-items:flex-end;gap:6px;height:70px;">${[40,70,55,90,60].map(h=>`<div style="flex:1;height:${h}%;background:linear-gradient(180deg,var(--rc-brand-strong),var(--rc-brand));border-radius:3px;"></div>`).join('')}</div>`;
    case 'trend-graph': return `<div class="sb-label">Trend Graph</div><svg viewBox="0 0 200 60" width="100%" height="60"><path d="M5 45 40 30 75 38 110 15 145 25 195 8" fill="none" stroke="var(--rc-warning)" stroke-width="2.5"/></svg>`;
    case 'radar-chart': return `<div class="sb-label">Radar / Compass</div><svg viewBox="0 0 100 100" width="100%" height="150"><polygon points="50,10 90,40 75,90 25,90 10,40" fill="none" stroke="var(--rc-border-strong)"/><polygon points="50,25 72,42 63,75 37,75 28,42" fill="rgba(139,92,246,.3)" stroke="var(--rc-brand-strong)" stroke-width="2"/></svg>`;
    case 'slider': return `<div class="sb-label">Slider / Rating</div><input type="range" style="width:100%;" value="60">`;
    case 'icon-glyph': return `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--rc-brand-strong);">${icon('palIcon')}</div>`;
    case 'text-block': return `<div class="sb-label">Text Block</div><div contenteditable="true" class="sb-name" style="font-size:11.5px;font-weight:500;color:var(--rc-text-2);">Describe the content that belongs here...</div>`;
    case 'card': return `<div class="sb-label">Generic Card</div><div contenteditable="true" class="sb-name">New section</div>`;
    case 'button': return `<button class="btn primary" contenteditable="true" style="width:100%;justify-content:center;">Button</button>`;
    case 'image': return `<div class="sb-label">Image / Portrait</div><div style="flex:1;background:var(--rc-surface-3);border-radius:8px;display:flex;align-items:center;justify-content:center;color:var(--rc-text-3);">${icon('palImage','icon-lg')}</div>`;
    default: return '';
  }
}

let dragPreset = null;

function addBlock(preset, x, y){
  const pageId = getCurrentPageId();
  const active = document.querySelector('.page.active');
  const eid = pageId + '-add' + Date.now();

  const el = document.createElement('div');
  el.className = 'card sandbox-block';
  el.dataset.eid = eid;
  el.style.position = 'absolute';
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  el.style.width = preset.w + 'px';
  el.style.height = preset.h + 'px';
  el.style.margin = '0';
  el.innerHTML = blockInnerHTML(preset);
  (active.querySelector(':scope > *') || active).appendChild(el);

  recordAdded(pageId, { eid, type: preset.type, page: pageId, x, y, w: preset.w, h: preset.h, label: preset.label });
  pushUndo({ type:'add', apply:()=>{ el.remove(); } });

  refreshEditableRegion();
  return el;
}

export function renderPalette(){
  return `<div class="edit-palette" id="editPalette">
    <div class="se-group-label">Drag onto the page</div>
    ${PRESETS.map(p=>`<div class="palette-item" draggable="true" data-preset="${p.type}">${icon(p.ic)}<span>${p.label}</span></div>`).join('')}
    <div class="se-group-label" style="margin-top:12px;">Or click to drop at center</div>
  </div>`;
}

// Recreate any palette blocks the user added in a prior saved session.
export function reapplyAddedBlocks(pageId, added){
  const active = document.getElementById('page-' + pageId);
  if(!active) return;
  added.forEach(a=>{
    if(active.querySelector(`[data-eid="${a.eid}"]`)) return;
    const preset = PRESETS.find(p=>p.type===a.type) || PRESETS[0];
    const el = document.createElement('div');
    el.className = 'card sandbox-block';
    el.dataset.eid = a.eid;
    el.style.position = 'absolute';
    el.style.left = a.x + 'px';
    el.style.top = a.y + 'px';
    el.style.width = (a.w||preset.w) + 'px';
    el.style.height = (a.h||preset.h) + 'px';
    el.style.margin = '0';
    el.innerHTML = blockInnerHTML(preset);
    (active.querySelector(':scope > *') || active).appendChild(el);
  });
}

export function initPalette(){
  document.addEventListener('dragstart', (e)=>{
    const item = e.target.closest('.palette-item');
    if(!item) return;
    dragPreset = PRESETS.find(p=>p.type===item.dataset.preset);
    e.dataTransfer.setData('text/plain', item.dataset.preset);
  });

  document.addEventListener('dragover', (e)=>{
    if(document.body.classList.contains('palette-open')) e.preventDefault();
  });

  document.addEventListener('drop', (e)=>{
    const active = document.querySelector('.page.active');
    if(!active || !dragPreset) return;
    if(!active.contains(e.target) && e.target !== active) return;
    e.preventDefault();
    const rect = active.getBoundingClientRect();
    addBlock(dragPreset, Math.max(0, e.clientX - rect.left - dragPreset.w/2), Math.max(0, e.clientY - rect.top - dragPreset.h/2));
    dragPreset = null;
  });

  // click-to-add fallback — also what Playwright/automation should use, since native HTML5
  // drag-and-drop doesn't simulate reliably. Drops the block at a default spot in the visible
  // content area; the user (or a test) can then drag it wherever it belongs.
  document.addEventListener('click', (e)=>{
    const item = e.target.closest('.palette-item');
    if(!item) return;
    const preset = PRESETS.find(p=>p.type===item.dataset.preset);
    if(!preset) return;
    const active = document.querySelector('.page.active');
    if(!active) return;
    addBlock(preset, 40, 40 + (active.scrollTop || 0));
  });
}
