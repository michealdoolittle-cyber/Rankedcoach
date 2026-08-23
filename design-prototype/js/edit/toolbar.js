import { icon } from '../icons.js';
import { enterEditMode, exitEditMode, undo, saveToStorage, clearStorage, resetState, exportJSON } from './editor.js';
import { isAnnotateMode, setAnnotateMode } from './annotate.js';
import { openSidebarEditor, closeSidebarEditor, resetSidebarEditor } from './sidebar-editor.js';
import { toast } from '../toast.js';

export function renderToolbar(){
  return `
  <button class="edit-mode-fab" id="editModeFab">${icon('edit')}<span id="editModeFabLabel">Edit Mode</span></button>
  <div class="edit-toolbar" id="editToolbar">
    <button class="btn sm" id="btnPalette" title="Add elements">${icon('layers')} Palette</button>
    <button class="btn sm" id="btnAnnotate" title="Drop a content note">${icon('note')} Annotate</button>
    <button class="btn sm" id="btnSidebarEdit" title="Edit sidebar nav">${icon('grip')} Sidebar</button>
    <div class="divider"></div>
    <button class="btn sm" id="btnUndo" title="Undo last change">${icon('undo')} Undo</button>
    <button class="btn sm" id="btnSave" title="Save to this browser">${icon('save')} Save</button>
    <button class="btn sm danger" id="btnCancel" title="Discard all sandbox edits">${icon('x_circle')} Cancel</button>
    <button class="btn sm primary" id="btnExport" title="Export for Claude">${icon('download')} Export</button>
  </div>
  <div class="modal-shell" id="overlay-export-modal" style="width:min(720px,92vw);">
    <button class="overlay-close" data-close-overlay>${icon('close')}</button>
    <h2 style="font-size:17px;margin:0 0 6px;">Export Sandbox Changes</h2>
    <p style="color:var(--rc-text-3);font-size:11.5px;margin:0 0 12px;">Download this file or copy it, then send it to Claude to apply the changes and commit them.</p>
    <textarea id="exportJsonText" readonly style="width:100%;height:280px;background:var(--rc-surface-2);border:1px solid var(--rc-border-subtle);border-radius:8px;color:var(--rc-text-2);font-size:10.5px;font-family:monospace;padding:10px;"></textarea>
    <div style="display:flex;gap:8px;margin-top:12px;">
      <button class="btn primary" id="btnDownloadExport">${icon('download')} Download JSON</button>
      <button class="btn" id="btnCopyExport">${icon('copy')} Copy to Clipboard</button>
    </div>
  </div>
  `;
}

export function initToolbar(){
  const fab = document.getElementById('editModeFab');
  fab.addEventListener('click', ()=>{
    const on = !document.body.classList.contains('edit-mode');
    if(on){ enterEditMode(); document.getElementById('editModeFabLabel').textContent = 'Exit Edit'; }
    else { exitEditMode(); document.getElementById('editModeFabLabel').textContent = 'Edit Mode'; }
  });

  document.getElementById('btnPalette').addEventListener('click', (e)=>{
    document.body.classList.toggle('palette-open');
    e.currentTarget.classList.toggle('tool-active', document.body.classList.contains('palette-open'));
  });

  document.getElementById('btnAnnotate').addEventListener('click', (e)=>{
    setAnnotateMode(!isAnnotateMode());
    e.currentTarget.classList.toggle('tool-active', isAnnotateMode());
  });

  document.getElementById('btnSidebarEdit').addEventListener('click', (e)=>{
    const isOpen = document.body.classList.contains('sidebar-editor-open');
    if(isOpen) closeSidebarEditor(); else openSidebarEditor();
    e.currentTarget.classList.toggle('tool-active', !isOpen);
  });

  document.getElementById('btnUndo').addEventListener('click', ()=>{ undo(); toast('Undid last change'); });

  document.getElementById('btnSave').addEventListener('click', ()=>{
    saveToStorage();
    toast('Sandbox saved to this browser');
  });

  document.getElementById('btnCancel').addEventListener('click', ()=>{
    if(!confirm('Discard every sandbox edit (moves, resizes, removals, additions, annotations, sidebar changes) and start fresh? This cannot be undone.')) return;
    clearStorage();
    resetState();
    resetSidebarEditor();
    toast('Sandbox reset — reloading', 'error');
    setTimeout(()=>location.reload(), 500);
  });

  document.getElementById('btnExport').addEventListener('click', ()=>{
    const json = exportJSON();
    document.getElementById('exportJsonText').value = json;
    document.getElementById('overlayScrim')?.classList.add('open');
    document.getElementById('overlay-export-modal').classList.add('open');
  });

  document.getElementById('btnDownloadExport').addEventListener('click', ()=>{
    const json = exportJSON();
    const blob = new Blob([json], { type:'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rankedcoach-sandbox-export-' + Date.now() + '.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast('Downloaded export JSON');
  });

  document.getElementById('btnCopyExport').addEventListener('click', async ()=>{
    try{
      await navigator.clipboard.writeText(document.getElementById('exportJsonText').value);
      toast('Copied export JSON to clipboard');
    }catch(e){
      document.getElementById('exportJsonText').select();
      toast('Select-all applied — copy manually (clipboard blocked)', 'error');
    }
  });
}
