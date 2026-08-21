export function openModal(modalId) {
  document.querySelectorAll('.modal-demo').forEach((modal) => modal.classList.remove('open'));
  document.getElementById(modalId)?.classList.add('open');
}

export function closeModalFrom(control) {
  control.closest('.modal-demo')?.classList.remove('open');
}

export function initModalControls() {
  document.querySelectorAll('[data-modal]').forEach((btn) => {
    btn.addEventListener('click', () => openModal(btn.dataset.modal));
  });

  document.querySelectorAll('[data-close-modal]').forEach((btn) => {
    btn.addEventListener('click', () => closeModalFrom(btn));
  });
}
