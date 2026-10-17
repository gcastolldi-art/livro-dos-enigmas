import {send} from '../../js/livro.js';
import {formatAnswer} from './resposta.js?v=19.1';
const input=document.getElementById('answer-value');
const button=document.getElementById('submit-answer');
const message=document.getElementById('message');
let busy=false;
async function submit(){
 if(busy||button.disabled||button.hidden||input.disabled)return;
 let answer;
 try{answer=formatAnswer(input.value);}catch(error){message.textContent=error.message;input.focus();return;}
 busy=true;
 try{await send(answer);}finally{busy=false;}
}
button.addEventListener('click',submit);
input.addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();submit();}});
