import {send} from '../../js/livro.js';
const list=document.getElementById('pieces'); let dragged=null, locked=false;
document.addEventListener('book:lock',e=>{locked=e.detail.locked;list.querySelectorAll('button').forEach(b=>b.disabled=locked);});
if (document.getElementById('lock-banner').hidden===false) {
  locked=true;list.querySelectorAll('button').forEach(b=>b.disabled=true);
}
list.addEventListener('click',e=>{
  const button=e.target.closest('[data-move]');if(!button||locked)return;
  const item=button.closest('li'), neighbor=button.dataset.move==='up'?item.previousElementSibling:item.nextElementSibling;
  if(neighbor)list.insertBefore(item,button.dataset.move==='up'?neighbor:neighbor.nextElementSibling);
});
list.addEventListener('dragstart',e=>{if(locked)return e.preventDefault();dragged=e.target.closest('li');dragged?.classList.add('dragging');});
list.addEventListener('dragend',()=>{dragged?.classList.remove('dragging');dragged=null;});
list.addEventListener('dragover',e=>{if(dragged&&!locked)e.preventDefault();});
list.addEventListener('drop',e=>{
  e.preventDefault();const target=e.target.closest('li');if(!dragged||!target||target===dragged||locked)return;
  const items=[...list.children];list.insertBefore(dragged,items.indexOf(dragged)<items.indexOf(target)?target.nextElementSibling:target);
});
document.getElementById('submit-answer').onclick=()=>send({valor:[...list.children].map(item=>item.dataset.value)});
