import { showToast } from './toast.js';

export function initStatePanels() {
  document.querySelectorAll('[data-loadout]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.loadout-state').forEach((state) => state.classList.remove('active'));
      document.getElementById(btn.dataset.loadout)?.classList.add('active');
      showToast('Loadout demo state changed.');
    });
  });

  document.querySelectorAll('[data-log-state]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#page-logmatch .save-state').forEach((state) => state.classList.remove('active'));
      document.getElementById(btn.dataset.logState)?.classList.add('active');
      showToast('Log-match save sequence advanced.');
    });
  });

  document.querySelectorAll('[data-filter]').forEach((btn) => {
    btn.addEventListener('click', () => {
      btn.parentElement?.querySelectorAll('[data-filter]').forEach((candidate) => candidate.classList.remove('primary'));
      btn.classList.add('primary');
      showToast(`${btn.textContent.trim()} filter selected.`);
    });
  });

  document.querySelectorAll('[data-toast]').forEach((btn) => {
    btn.addEventListener('click', () => showToast(btn.dataset.toast));
  });
}
