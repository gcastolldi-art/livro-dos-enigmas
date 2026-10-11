import {send} from '../../js/livro.js';
import {serializeSelection} from './selecao.js';
const inputs=[...document.querySelectorAll('input[name="palavras"]')];
const button=document.getElementById('submit-answer');
const message=document.getElementById('message');
let submitting=false;

async function submit(){
 if(submitting||button.disabled||button.hidden||inputs.some(input=>input.disabled))return;
 const answer=serializeSelection(inputs.filter(input=>input.checked).map(input=>input.value));
 if(!answer){
  message.textContent='Marque pelo menos uma palavra antes de enviar a resposta.';
  inputs[0].focus();
  return;
 }
 submitting=true;
 try{
  await send(answer);
 }finally{
  submitting=false;
 }
}
button.addEventListener('click',submit);
