import { renderSidebar, initNav, activatePage, PAGE_META } from './nav.js';
import { initOverlays, openOverlay, closeAllOverlays } from './modals.js';
import { initTabs } from './tabs.js';
import { initToastDemoTriggers, toast } from './toast.js';
import { page1A, page1B, page1C, page1D, page1E } from './content/play.js';
import { page2A, page2B, page2C, page2D, page2E, page2F, page2G, page2H } from './content/review.js';
import { page3A, page3B, page3C, page3D, page3E, page3F, page3G } from './content/learn.js';
import { page4A, page4B, page4C, page4D } from './content/library.js';
import { page5A, page5B } from './content/account.js';
import { page6A, page6B, page6C, page6D, page6E, page6F } from './content/settings.js';
import { page7A, page7B, page7C, page7D, page7E, page7F } from './content/help.js';
import { renderAllGlobalOverlays } from './content/shared.js';

const PAGES = {
  '1A': page1A, '1B': page1B, '1C': page1C, '1D': page1D, '1E': page1E,
  '2A': page2A, '2B': page2B, '2C': page2C, '2D': page2D, '2E': page2E, '2F': page2F, '2G': page2G, '2H': page2H,
  '3A': page3A, '3B': page3B, '3C': page3C, '3D': page3D, '3E': page3E, '3F': page3F, '3G': page3G,
  '4A': page4A, '4B': page4B, '4C': page4C, '4D': page4D,
  '5A': page5A, '5B': page5B,
  '6A': page6A, '6B': page6B, '6C': page6C, '6D': page6D, '6E': page6E, '6F': page6F,
  '7A': page7A, '7B': page7B, '7C': page7C, '7D': page7D, '7E': page7E, '7F': page7F,
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

function wireBgPicker(){
  document.addEventListener('click', (e)=>{
    const opt = e.target.closest('[data-bg-select]');
    if(!opt) return;
    opt.parentElement.querySelectorAll('.bg-option').forEach(o=>o.classList.remove('selected'));
    opt.classList.add('selected');
    toast('Background set to ' + opt.querySelector('.kicker').textContent);
  });
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
  wireBgPicker();

  const params = new URLSearchParams(location.search);
  const startPage = params.get('page') && PAGE_META[params.get('page')] ? params.get('page') : '1A';
  activatePage(startPage, { noHistory:true });
}

document.addEventListener('DOMContentLoaded', init);
