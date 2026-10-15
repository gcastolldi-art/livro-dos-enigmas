import {send} from '../../js/livro.js';
import {formatScore} from './placar.js?v=18.1';
const boxes=[...document.querySelectorAll('.number-box')];
boxes.forEach((box,index)=>{
  box.addEventListener('input',()=>{box.value=box.value.replace(/\D/g,'').slice(0,2);if(box.value.length===2)boxes[index+1]?.focus();});
  box.addEventListener('blur',()=>{if(box.value)box.value=box.value.padStart(2,'0');});
  box.addEventListener('paste',event=>{
    const value=event.clipboardData?.getData('text').trim();
    if(/^\d{1,2}(?:-\d{1,2}){1}$/.test(value||'')){event.preventDefault();value.split('-').forEach((v,i)=>boxes[i].value=v.padStart(2,'0'));boxes[1].focus();}
  });
});
document.getElementById('submit-answer').onclick=()=>{
  if(boxes.some(box=>box.disabled)||document.getElementById('submit-answer').disabled)return;
  try{const answer=formatScore(boxes.map(box=>box.value));answer.split('-').forEach((v,i)=>boxes[i].value=v);send(answer);}
  catch(error){document.getElementById('message').textContent=error.message;}
};
