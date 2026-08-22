export function toast(msg, type){
  const stack = document.getElementById('toastStack');
  if(!stack) return;
  const el = document.createElement('div');
  el.className = 'toast ' + (type||'success');
  el.textContent = msg;
  stack.appendChild(el);
  setTimeout(()=>{ el.style.opacity='0'; el.style.transition='opacity .2s'; setTimeout(()=>el.remove(),200); }, 2600);
}

export function initToastDemoTriggers(){
  document.addEventListener('click', (e)=>{
    const t = e.target.closest('[data-toast]');
    if(t) toast(t.dataset.toast, t.dataset.toastType||'success');
  });
}
