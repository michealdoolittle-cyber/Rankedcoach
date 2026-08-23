import { icon } from '../icons.js';
import { editState, pageBucket, recordMove, recordRemoved, removeAdded, pushUndo, popUndo, hasUndo,
         saveToStorage, clearStorage, resetState, exportJSON } from './state.js';

const pageCounters = {}; // pageId -> next index for stable eid generation
let selected = null;
let currentPageId = null;

function currentPage(){
  const active = document.querySelector('.page.active');
  return active ? active.id.replace('page-','') : null;
}

function ensureIds(pageEl, pageId){
  if(!pageCounters[pageId]) pageCounters[pageId] = 0;
  pageEl.querySelectorAll('.card, .metric-tile').forEach(el=>{
    if(!el.dataset.eid){
      el.dataset.eid = pageId + '-e' + (pageCounters[pageId]++);
    }
  });
}

function deselect(){
  if(!selected) return;
  selected.classList.remove('edit-selected');
  selected.querySelectorAll('.eid-toolbar, .resize-handle').forEach(n=>n.remove());
  selected = null;
}

function select(el){
  if(selected === el) return;
  deselect();
  selected = el;
  el.classList.add('edit-selected');

  const bar = document.createElement('div');
  bar.className = 'eid-toolbar';
  bar.innerHTML = `
    <button data-act="move" title="Drag to move">${icon('move')}</button>
    <button data-act="delete" class="danger" title="Remove">${icon('trash')}</button>
  `;
  bar.addEventListener('mousedown', e=>e.stopPropagation());
  bar.addEventListener('click', (e)=>{
    const btn = e.target.closest('button');
    if(!btn) return;
    if(btn.dataset.act === 'delete') removeSelected();
  });
  el.appendChild(bar);

  ['se','e','s'].forEach(dir=>{
    const h = document.createElement('div');
    h.className = 'resize-handle ' + dir;
    h.addEventListener('mousedown', (e)=> startResize(e, el, dir));
    el.appendChild(h);
  });
}

function removeSelected(){
  if(!selected) return;
  const el = selected;
  const eid = el.dataset.eid;
  const pageId = currentPageId;
  const wasAdded = pageBucket(pageId).added.some(a=>a.eid===eid);
  const html = el.outerHTML;
  const parent = el.parentElement;
  const nextSibling = el.nextSibling;

  deselect();
  el.remove();
  if(wasAdded) removeAdded(pageId, eid); else recordRemoved(pageId, eid);

  pushUndo({ type:'remove', pageId, eid, html, restore:()=>{
    parent.insertBefore(rebuild(html), nextSibling);
    if(wasAdded){ /* re-adding is best-effort; user can re-drag from palette if needed */ }
    else { const b = pageBucket(pageId); b.removed = b.removed.filter(x=>x!==eid); }
  }});
}

function rebuild(html){
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

// ---- drag to move ----
let dragCtx = null;

function startDragTracking(el, e){
  const startX = e.clientX, startY = e.clientY;
  let dragging = false;

  function onMove(ev){
    const dx = ev.clientX - startX, dy = ev.clientY - startY;
    if(!dragging && Math.hypot(dx,dy) > 4){
      dragging = true;
      beginAbsolute(el);
      el.classList.add('dragging-el');
    }
    if(dragging){
      const base = dragCtx;
      el.style.left = (base.left + dx) + 'px';
      el.style.top = (base.top + dy) + 'px';
    }
  }
  function onUp(){
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
    if(dragging){
      el.classList.remove('dragging-el');
      const prev = dragCtx.prevRect;
      recordMove(currentPageId, el.dataset.eid, currentRect(el));
      pushUndo({ type:'move', apply:()=>{
        el.style.left = prev.x + 'px'; el.style.top = prev.y + 'px';
        recordMove(currentPageId, el.dataset.eid, prev);
      }});
    }
    select(el);
  }
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
}

function beginAbsolute(el){
  const parent = el.offsetParent || el.parentElement;
  const pRect = parent.getBoundingClientRect();
  const eRect = el.getBoundingClientRect();
  const prevLeft = parseFloat(el.style.left) || (eRect.left - pRect.left);
  const prevTop = parseFloat(el.style.top) || (eRect.top - pRect.top);
  if(el.style.position !== 'absolute'){
    el.style.width = eRect.width + 'px';
    el.style.position = 'absolute';
    el.style.left = (eRect.left - pRect.left) + 'px';
    el.style.top = (eRect.top - pRect.top) + 'px';
    el.style.margin = '0';
  }
  dragCtx = { left: parseFloat(el.style.left), top: parseFloat(el.style.top), prevRect: { x: prevLeft, y: prevTop } };
}

function currentRect(el){
  return { x: parseFloat(el.style.left)||0, y: parseFloat(el.style.top)||0, w: el.style.width||null, h: el.style.height||null };
}

// ---- resize ----
function startResize(e, el, dir){
  e.stopPropagation();
  e.preventDefault();
  select(el);
  beginAbsolute(el);
  const startX = e.clientX, startY = e.clientY;
  const startW = el.getBoundingClientRect().width;
  const startH = el.getBoundingClientRect().height;
  const prevW = el.style.width, prevH = el.style.height;

  function onMove(ev){
    const dx = ev.clientX - startX, dy = ev.clientY - startY;
    if(dir === 'se' || dir === 'e') el.style.width = Math.max(60, startW + dx) + 'px';
    if(dir === 'se' || dir === 's') el.style.height = Math.max(40, startH + dy) + 'px';
  }
  function onUp(){
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
    recordMove(currentPageId, el.dataset.eid, currentRect(el));
    pushUndo({ type:'resize', apply:()=>{
      el.style.width = prevW; el.style.height = prevH;
      recordMove(currentPageId, el.dataset.eid, currentRect(el));
    }});
  }
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
}

function wireSelectable(pageEl){
  pageEl.querySelectorAll('[data-eid]').forEach(el=>{
    if(el._editWired) return;
    el._editWired = true;
    el.addEventListener('mousedown', (e)=>{
      if(!document.body.classList.contains('edit-mode')) return;
      if(e.target.closest('.eid-toolbar, .resize-handle, .annotation-note')) return;
      if(e.target.closest('a,button,input,select,textarea')) return;
      e.stopPropagation();
      startDragTracking(el, e);
    });
  });
}

export function refreshEditableRegion(){
  const active = document.querySelector('.page.active');
  if(!active) return;
  currentPageId = active.id.replace('page-','');
  ensureIds(active, currentPageId);
  wireSelectable(active);
}

export function undo(){
  const action = popUndo();
  if(!action) return;
  if(action.type === 'remove') action.restore();
  else if(action.apply) action.apply();
  deselect();
}

export function enterEditMode(){
  document.body.classList.add('edit-mode');
  refreshEditableRegion();
  document.addEventListener('click', bodyDeselectHandler, true);
}

export function exitEditMode(){
  document.body.classList.remove('edit-mode');
  document.body.classList.remove('palette-open');
  document.body.classList.remove('sidebar-editor-open');
  deselect();
  document.removeEventListener('click', bodyDeselectHandler, true);
}

function bodyDeselectHandler(e){
  if(!selected) return;
  if(e.target.closest('[data-eid]') === selected) return;
  if(e.target.closest('.eid-toolbar, .resize-handle, .edit-palette, .sidebar-editor, .edit-toolbar')) return;
  deselect();
}

export function getSelected(){ return selected; }
export function getCurrentPageId(){ return currentPageId; }
export function refreshOnNav(){ refreshEditableRegion(); }

// Reapply a previously-saved edit state to a freshly-rendered page (called once per
// page, right after initial render, so a reload looks the way the user left it).
export function reapplyPageState(pageId){
  const pageEl = document.getElementById('page-' + pageId);
  if(!pageEl) return;
  ensureIds(pageEl, pageId);
  const bucket = editState.pages[pageId];
  if(!bucket) return;

  bucket.removed.forEach(eid=>{
    const el = pageEl.querySelector(`[data-eid="${eid}"]`);
    if(el) el.remove();
  });
  Object.entries(bucket.moves).forEach(([eid, rect])=>{
    const el = pageEl.querySelector(`[data-eid="${eid}"]`);
    if(!el) return;
    const parentRect = el.parentElement.getBoundingClientRect();
    el.style.position = 'absolute';
    el.style.left = rect.x + 'px';
    el.style.top = rect.y + 'px';
    if(rect.w) el.style.width = rect.w;
    if(rect.h) el.style.height = rect.h;
    el.style.margin = '0';
  });
}

export { saveToStorage, clearStorage, resetState, exportJSON, hasUndo };
