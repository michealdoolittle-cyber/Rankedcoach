import { openModal } from './modals.js';
import { showToast } from './toast.js';

function createQueuedFocusRow() {
  const item = document.createElement('div');
  item.className = 'list-row queue-card';
  item.draggable = true;
  item.innerHTML = '<span class="drag">DRAG</span><div><strong>Utility before contact</strong><small>Game Sense added from demo action</small></div><button class="btn small" data-modal="modal-focus">View</button>';
  item.querySelector('[data-modal]')?.addEventListener('click', () => openModal('modal-focus'));
  return item;
}

export function initActions() {
  document.querySelectorAll('[data-action]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;

      if (action === 'clear-queue') {
        const list = document.getElementById('focusQueueList');
        if (list) {
          list.innerHTML = '<div class="card"><h3>Queue cleared.</h3><p class="muted">Add a focus to restart the demo queue.</p></div>';
        }
        showToast('Focus queue cleared.');
        return;
      }

      if (action === 'add-focus') {
        document.getElementById('focusQueueList')?.appendChild(createQueuedFocusRow());
        showToast('Focus added to queue.');
        return;
      }

      if (action === 'save-insight') {
        btn.classList.toggle('status-on');
        btn.textContent = btn.classList.contains('status-on') ? 'Insight Saved' : 'Save Insight';
        showToast('Insight saved state toggled.');
        return;
      }

      showToast('Demo item expanded.');
    });
  });
}
