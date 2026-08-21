import { showToast } from './toast.js';

let draggedQueueItem = null;

export function initFocusQueue() {
  const list = document.getElementById('focusQueueList');
  if (!list) return;

  list.addEventListener('dragstart', (event) => {
    const row = event.target.closest('.queue-card');
    if (!row) return;
    draggedQueueItem = row;
    row.classList.add('dragging');
    event.dataTransfer.effectAllowed = 'move';
  });

  list.addEventListener('dragend', () => {
    draggedQueueItem?.classList.remove('dragging');
    draggedQueueItem = null;
  });

  list.addEventListener('dragover', (event) => {
    if (!draggedQueueItem) return;
    event.preventDefault();
    const after = [...list.querySelectorAll('.queue-card:not(.dragging)')].find((row) => (
      event.clientX < row.getBoundingClientRect().left + row.offsetWidth / 2
    ));
    if (after) list.insertBefore(draggedQueueItem, after);
    else list.appendChild(draggedQueueItem);
  });

  list.addEventListener('drop', (event) => {
    if (!draggedQueueItem) return;
    event.preventDefault();
    showToast('Focus queue reordered.');
  });
}
