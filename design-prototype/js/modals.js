export function initOverlays(){
  document.addEventListener('click', (e)=>{
    const opener = e.target.closest('[data-modal]');
    if(opener){
      const id = opener.dataset.modal;
      openOverlay(id);
      return;
    }
    const closer = e.target.closest('[data-close-overlay]');
    if(closer){
      closeAllOverlays();
      return;
    }
    if(e.target.classList.contains('overlay-scrim')){
      closeAllOverlays();
    }
  });
  document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') closeAllOverlays(); });
}

export function openOverlay(id){
  closeAllOverlays();
  const scrim = document.getElementById('overlayScrim');
  const el = document.getElementById('overlay-'+id);
  if(!el) return;
  if(scrim){
    scrim.classList.toggle('light', el.classList.contains('modal-light'));
    scrim.classList.add('open');
  }
  el.classList.add('open');
}

export function closeAllOverlays(){
  document.querySelectorAll('.modal-shell.open, .drawer-shell.open').forEach(el=>el.classList.remove('open'));
  const scrim = document.getElementById('overlayScrim');
  if(scrim) scrim.classList.remove('open');
}
