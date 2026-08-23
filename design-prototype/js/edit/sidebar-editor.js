import { icon } from '../icons.js';
import { NAV } from '../nav.js';
import { editState, pushUndo } from './state.js';

// Working copy of the nav tree the user edits — reordering, renaming, removing,
// and adding items. Rebuilt from NAV + any prior saved edits on first open.
let workingNav = null;

function buildWorkingNav(){
  if(editState.sidebar.order){
    return JSON.parse(JSON.stringify(editState.sidebar.order));
  }
  return NAV.map(g => ({ id: g.id, label: g.label, children: g.children.map(c=>({ id:c.id, label:c.label })) }));
}

function persist(){
  editState.sidebar.order = JSON.parse(JSON.stringify(workingNav));
}

export function renderSidebarEditor(){
  return `<div class="sidebar-editor" id="sidebarEditor"></div>`;
}

function paint(){
  const root = document.getElementById('sidebarEditor');
  if(!root) return;
  root.innerHTML = `
    <div class="se-group-label" style="font-size:11px;color:var(--rc-text-1);margin-bottom:10px;">Edit Sidebar</div>
    ${workingNav.map((g, gi) => `
      <div class="se-group" data-gi="${gi}">
        <div class="se-group-label">${g.label}</div>
        ${g.children.map((c, ci) => `
          <div class="se-item" data-gi="${gi}" data-ci="${ci}">
            <span class="se-drag-handle">${icon('grip')}</span>
            <input value="${c.label}" data-field="label">
            <button class="se-remove" data-act="up" title="Move up">↑</button>
            <button class="se-remove" data-act="down" title="Move down">↓</button>
            <button class="se-remove" data-act="remove" title="Remove">${icon('x_circle')}</button>
          </div>
        `).join('')}
        <div class="se-add-row">
          <input placeholder="New item label..." data-add-input="${gi}">
          <button class="btn sm" data-act="add" data-gi="${gi}">${icon('plus')}</button>
        </div>
      </div>
    `).join('')}
  `;
  wire(root);
}

function wire(root){
  root.querySelectorAll('input[data-field="label"]').forEach(inp=>{
    inp.addEventListener('input', (e)=>{
      const item = e.target.closest('.se-item');
      const gi = +item.dataset.gi, ci = +item.dataset.ci;
      workingNav[gi].children[ci].label = e.target.value;
      persist();
      applyToLiveSidebar();
    });
  });

  root.addEventListener('click', (e)=>{
    const btn = e.target.closest('button[data-act]');
    if(!btn) return;
    const act = btn.dataset.act;

    if(act === 'add'){
      const gi = +btn.dataset.gi;
      const input = root.querySelector(`input[data-add-input="${gi}"]`);
      const label = input.value.trim();
      if(!label) return;
      const id = 'custom-' + Date.now();
      workingNav[gi].children.push({ id, label });
      input.value = '';
      persist(); paint(); applyToLiveSidebar();
      return;
    }

    const item = btn.closest('.se-item');
    if(!item) return;
    const gi = +item.dataset.gi, ci = +item.dataset.ci;

    if(act === 'remove'){
      workingNav[gi].children.splice(ci, 1);
    } else if(act === 'up' && ci > 0){
      const arr = workingNav[gi].children;
      [arr[ci-1], arr[ci]] = [arr[ci], arr[ci-1]];
    } else if(act === 'down' && ci < workingNav[gi].children.length - 1){
      const arr = workingNav[gi].children;
      [arr[ci+1], arr[ci]] = [arr[ci], arr[ci+1]];
    }
    persist(); paint(); applyToLiveSidebar();
  });
}

function applyToLiveSidebar(){
  const sidebar = document.getElementById('sidebar');
  if(!sidebar) return;
  const brandHTML = sidebar.querySelector('.brand').outerHTML;
  // footer (spacer + account block + notification bell) is fixed chrome, not part of the
  // editable nav tree — captured once before the rebuild and reattached as-is.
  const footerHTML = sidebar.querySelector('.sidebar-footer-row')?.outerHTML || '';
  const groups = workingNav.map(g => {
    const items = g.children.map(c => `<div class="nav-item" data-page="${c.id}" data-custom-label="1"><span>${c.label}</span></div>`).join('');
    return `
      <div class="nav-group-label">${g.label}</div>
      <div class="nav-item nav-group-toggle" data-group="${g.id}"><span>${g.label}</span></div>
      <div class="nav-children" data-group-children="${g.id}">${items}</div>
    `;
  }).join('');
  sidebar.innerHTML = brandHTML + groups + '<div class="sidebar-spacer"></div>' + footerHTML;
  // re-wire nav clicks for any items pointing at real, still-existing pages
  sidebar.querySelectorAll('.nav-item[data-page]').forEach(item=>{
    item.addEventListener('click', ()=>{
      const target = document.getElementById('page-' + item.dataset.page);
      if(!target){ return; }
      window.dispatchEvent(new CustomEvent('rc-sandbox-nav', { detail: item.dataset.page }));
    });
  });
  sidebar.querySelectorAll('.nav-group-toggle').forEach(item=>{
    item.addEventListener('click', ()=>{
      const kids = sidebar.querySelector(`[data-group-children="${item.dataset.group}"]`);
      if(kids) kids.style.display = kids.style.display === 'none' ? 'flex' : 'none';
    });
  });
}

export function initSidebarEditor(){
  workingNav = buildWorkingNav();
  if(editState.sidebar.order) applyToLiveSidebar();
}

export function openSidebarEditor(){
  document.body.classList.add('sidebar-editor-open');
  if(!workingNav) workingNav = buildWorkingNav();
  paint();
}

export function closeSidebarEditor(){
  document.body.classList.remove('sidebar-editor-open');
}

export function resetSidebarEditor(){
  workingNav = NAV.map(g => ({ id: g.id, label: g.label, children: g.children.map(c=>({ id:c.id, label:c.label })) }));
  editState.sidebar.order = null;
}
