export function initTabs(root){
  (root||document).querySelectorAll('.tabrow').forEach(row=>{
    row.querySelectorAll('button').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        row.querySelectorAll('button').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        const panelGroup = row.parentElement.querySelectorAll(':scope > .subpane');
        panelGroup.forEach(p=>p.style.display='none');
        const target = document.getElementById(btn.dataset.tab);
        if(target) target.style.display='block';
      });
    });
  });
}
