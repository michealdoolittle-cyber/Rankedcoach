import { icon } from '../icons.js';
import { editState, pushUndo } from './state.js';
import { getCurrentPageId } from './editor.js';

let annotateMode = false;
let idCounter = 0;

export function isAnnotateMode(){ return annotateMode; }

export function setAnnotateMode(on){
  annotateMode = on;
  document.body.classList.toggle('annotate-mode', on);
}

function makeNote(pageId, x, y, w, h, text, id){
  const note = document.createElement('div');
  note.className = 'annotation-note';
  note.dataset.annId = id;
  note.style.left = x + 'px';
  note.style.top = y + 'px';
  note.style.width = w + 'px';
  note.style.height = h + 'px';
  note.innerHTML = `
    <div class="eid-toolbar" style="top:-30px;">
      <button data-act="del" class="danger" title="Remove note">${icon('trash')}</button>
    </div>
    <textarea placeholder="What content belongs here?">${text||''}</textarea>
  `;
  note.querySelector('textarea').addEventListener('input', (e)=>{
    const ann = editState.annotations.find(a=>a.id===id);
    if(ann) ann.text = e.target.value;
  });
  note.querySelector('[data-act="del"]').addEventListener('click', ()=>{
    editState.annotations = editState.annotations.filter(a=>a.id!==id);
    note.remove();
  });
  note.addEventListener('mousedown', (e)=>{
    if(e.target.closest('.eid-toolbar, textarea')) return;
    startDrag(note, e, id);
  });
  return note;
}

function startDrag(note, e, id){
  const startX = e.clientX, startY = e.clientY;
  const startLeft = parseFloat(note.style.left), startTop = parseFloat(note.style.top);
  function onMove(ev){
    note.style.left = (startLeft + ev.clientX - startX) + 'px';
    note.style.top = (startTop + ev.clientY - startY) + 'px';
  }
  function onUp(){
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
    const ann = editState.annotations.find(a=>a.id===id);
    if(ann){ ann.x = parseFloat(note.style.left); ann.y = parseFloat(note.style.top); }
  }
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
}

export function addAnnotationAt(x, y){
  const pageId = getCurrentPageId();
  const id = 'ann-' + (idCounter++) + '-' + Date.now();
  const record = { id, page: pageId, x, y, w: 180, h: 90, text: '' };
  editState.annotations.push(record);
  const active = document.querySelector('.page.active');
  const note = makeNote(pageId, x, y, 180, 90, '', id);
  active.appendChild(note);
  note.querySelector('textarea').focus();
  pushUndo({ type:'annotate-add', apply:()=>{
    editState.annotations = editState.annotations.filter(a=>a.id!==id);
    note.remove();
  }});
}

export function initAnnotate(){
  document.addEventListener('click', (e)=>{
    if(!annotateMode) return;
    // deliberately NOT excluding [data-eid] here — real layouts are densely packed, and
    // annotating directly over an existing card (to describe what should replace it) is a
    // core use case, not an edge case. Only the editor's own chrome is excluded.
    if(e.target.closest('.annotation-note, .eid-toolbar, .edit-toolbar, .edit-palette, .sidebar-editor, .resize-handle')) return;
    // .content is the OUTER wrapper (.page sections live inside it), not a descendant of
    // .page.active — annotate against the active page itself, not a nonexistent inner .content.
    const active = document.querySelector('.page.active');
    if(!active || !active.contains(e.target)) return;
    const rect = active.getBoundingClientRect();
    addAnnotationAt(e.clientX - rect.left, e.clientY - rect.top + active.scrollTop);
  });
}

export function renderAnnotationsForPage(pageId){
  const active = document.getElementById('page-' + pageId);
  if(!active) return;
  editState.annotations.filter(a=>a.page===pageId).forEach(a=>{
    if(active.querySelector(`[data-ann-id="${a.id}"]`)) return;
    active.appendChild(makeNote(pageId, a.x, a.y, a.w, a.h, a.text, a.id));
  });
}
