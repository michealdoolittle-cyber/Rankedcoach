export function activateTab(tabId) {
  const pane = document.getElementById(tabId);
  const btn = document.querySelector(`[data-tab="${tabId}"]`);
  const scope = pane?.dataset.tabPane || btn?.closest('.tabrow')?.dataset.tabs;
  if (!scope) return;

  document.querySelectorAll(`[data-tab-pane="${scope}"]`).forEach((candidate) => {
    candidate.classList.remove('active-pane');
  });
  pane?.classList.add('active-pane');

  document.querySelectorAll(`.tabrow[data-tabs="${scope}"] button`).forEach((candidate) => {
    candidate.classList.toggle('active', candidate.dataset.tab === tabId);
  });
}

export function initTabs() {
  document.querySelectorAll('.tabrow button,[data-tab]:not([data-jump])').forEach((btn) => {
    btn.addEventListener('click', () => activateTab(btn.dataset.tab));
  });
}
