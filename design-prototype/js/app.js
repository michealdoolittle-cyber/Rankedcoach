import { renderSidebar, initNav, activatePage, PAGE_META } from './nav.js';
import { initOverlays, openOverlay, closeAllOverlays } from './modals.js';
import { initTabs } from './tabs.js';
import { initToastDemoTriggers, toast } from './toast.js';
import { page1A, page1B, page1C, page1D, page1E } from './content/play.js';
import { renderAllGlobalOverlays } from './content/shared.js';

const PAGES = {
  '1A': page1A, '1B': page1B, '1C': page1C, '1D': page1D, '1E': page1E,
};

function renderShell(){
  document.getElementById('sidebar').innerHTML = renderSidebar();

  const pagesHtml = Object.entries(PAGES).map(([id, fn]) => `<section class="page" id="page-${id}">${fn()}</section>`).join('\n');
  document.getElementById('pageOutlet').innerHTML = pagesHtml;

  document.getElementById('overlayRoot').innerHTML = `
    <div class="overlay-scrim" id="overlayScrim"></div>
    ${renderAllGlobalOverlays()}
  `;
  document.getElementById('toastRoot').innerHTML = `<div class="toast-stack" id="toastStack"></div>`;
}

function wireJumps(){
  document.addEventListener('click', (e)=>{
    const jumper = e.target.closest('[data-jump]');
    if(jumper){
      const id = jumper.dataset.jump;
      if(PAGE_META[id]){
        activatePage(id);
      } else {
        toast(id + ' is not built yet in this checkpoint — coming in the next group.', 'error');
      }
      if(jumper.hasAttribute('data-close-overlay-after')) closeAllOverlays();
    }
  });
}

function init(){
  renderShell();
  initNav();
  initOverlays();
  initTabs();
  initToastDemoTriggers();
  wireJumps();

  const params = new URLSearchParams(location.search);
  const startPage = params.get('page') && PAGE_META[params.get('page')] ? params.get('page') : '1A';
  activatePage(startPage, { noHistory:true });
}

document.addEventListener('DOMContentLoaded', init);
