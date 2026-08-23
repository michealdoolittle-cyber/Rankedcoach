// Central edit-state store + persistence + undo history. Every editor module
// (drag/resize, palette, annotate, sidebar editor) reads/writes through this.

const STORAGE_KEY = 'rc-sandbox-edit-state-v1';

function blankState(){
  return {
    version: 1,
    savedAt: null,
    pages: {},        // pageId -> { moves: {eid:{x,y,w,h}}, removed: [eid], added: [{eid,type,page,x,y,w,h,label}] }
    annotations: [],  // { id, page, x, y, w, h, text }
    sidebar: { order: null, removedIds: [], added: [] } // order: full flat list of nav item ids when reordered
  };
}

export let editState = loadFromStorage() || blankState();

const undoStack = []; // [{type, ...inverse-data}]

export function pageBucket(pageId){
  if(!editState.pages[pageId]) editState.pages[pageId] = { moves:{}, removed:[], added:[] };
  return editState.pages[pageId];
}

export function recordMove(pageId, eid, rect){
  pageBucket(pageId).moves[eid] = rect;
}

export function recordRemoved(pageId, eid){
  const b = pageBucket(pageId);
  if(!b.removed.includes(eid)) b.removed.push(eid);
  delete b.moves[eid];
}

export function recordAdded(pageId, block){
  pageBucket(pageId).added.push(block);
}

export function removeAdded(pageId, eid){
  const b = pageBucket(pageId);
  b.added = b.added.filter(a => a.eid !== eid);
}

export function pushUndo(action){
  undoStack.push(action);
  if(undoStack.length > 60) undoStack.shift();
}

export function popUndo(){
  return undoStack.pop();
}

export function hasUndo(){
  return undoStack.length > 0;
}

export function saveToStorage(){
  editState.savedAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(editState));
}

export function loadFromStorage(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return null;
    return JSON.parse(raw);
  }catch(e){ return null; }
}

export function clearStorage(){
  localStorage.removeItem(STORAGE_KEY);
}

export function resetState(){
  editState = blankState();
  undoStack.length = 0;
}

export function exportJSON(){
  return JSON.stringify(editState, null, 2);
}
