import { PAGE_TITLES } from '../page-titles.js';
import { activateTab } from './tabs.js';

export function activatePage(page, tab) {
  const target = document.getElementById(`page-${page}`);
  if (!target) return;

  document.querySelectorAll('.nav-item[data-page]').forEach((item) => {
    item.classList.toggle('active', item.dataset.page === page);
  });

  document.querySelectorAll('.page').forEach((candidate) => candidate.classList.remove('active'));
  target.classList.remove('active');
  void target.offsetWidth;
  target.classList.add('active');

  const [title, sub] = PAGE_TITLES[page] || [page, ''];
  const titleNode = document.getElementById('pageTitle');
  if (titleNode?.firstChild) titleNode.firstChild.textContent = title;
  const pageSub = document.getElementById('pageSub');
  if (pageSub) pageSub.textContent = sub;

  if (tab) requestAnimationFrame(() => activateTab(tab));
}

export function initNavigation() {
  document.querySelectorAll('.nav-item[data-page]').forEach((item) => {
    item.addEventListener('click', () => activatePage(item.dataset.page));
  });

  document.querySelectorAll('[data-jump]').forEach((btn) => {
    btn.addEventListener('click', () => {
      activatePage(btn.dataset.jump, btn.dataset.tab);
      btn.closest('.modal-demo')?.classList.remove('open');
    });
  });
}
