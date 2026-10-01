import {send} from '../../js/livro.js';
import {formatSeven} from './sequencia07.js';
const boxes=[...document.querySelectorAll('.number-box')];
boxes.forEach((box,index)=>{
  box.addEventListener('input',()=>{box.value=box.value.replace(/\D/g,'').slice(0,2);if(box.value.length===2)boxes[index+1]?.focus();});
  box.addEventListener('blur',()=>{if(box.value)box.value=box.value.padStart(2,'0');});
  box.addEventListener('paste',event=>{
    const value=event.clipboardData?.getData('text').trim();
    if(/^\d{1,2}(?:-\d{1,2}){6}$/.test(value||'')){event.preventDefault();value.split('-').forEach((v,i)=>boxes[i].value=v.padStart(2,'0'));boxes[6].focus();}
  });
});
document.getElementById('submit-answer').onclick=()=>{
  try{const answer=formatSeven(boxes.map(box=>box.value));answer.split('-').forEach((v,i)=>boxes[i].value=v);send(answer);}
  catch(error){document.getElementById('message').textContent=error.message;}
};
