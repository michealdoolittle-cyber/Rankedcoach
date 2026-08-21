import { initActions } from './ui/actions.js';
import { initFocusQueue } from './ui/focus-queue.js';
import { initModalControls } from './ui/modals.js';
import { activatePage, initNavigation } from './ui/navigation.js';
import { activateTab, initTabs } from './ui/tabs.js';
import { initStatePanels } from './ui/state-panels.js';

function getHashParams() {
  return Object.fromEntries(
    location.hash
      .replace(/^#/, '')
      .split(';')
      .filter(Boolean)
      .map((part) => {
        const [key, ...rest] = part.split('=');
        return [key, rest.join('=')];
      })
  );
}

function applyInitialRoute() {
  const params = new URLSearchParams(location.search);
  const hashParams = getHashParams();
  const initialPage = params.get('page') || hashParams.page;
  const initialTab = params.get('tab') || hashParams.tab;
  const initialModal = params.get('modal') || hashParams.modal;

  if (initialPage) activatePage(initialPage, initialTab);
  else if (initialTab) activateTab(initialTab);

  if (initialModal) document.getElementById(initialModal)?.classList.add('open');
}

function initBetaFoundationShell() {
  initModalControls();
  initTabs();
  initNavigation();
  initStatePanels();
  initActions();
  initFocusQueue();
  applyInitialRoute();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBetaFoundationShell, { once: true });
} else {
  initBetaFoundationShell();
}
