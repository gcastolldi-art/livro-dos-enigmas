import {send} from '../../js/livro.js';

const input=document.getElementById('answer');
const button=document.getElementById('submit-answer');
const message=document.getElementById('message');

async function submit(){
  if(button.disabled||button.hidden||input.disabled)return;
  const value=input.value.trim();
  if(!value){
    message.textContent='Escreva uma palavra resposta antes de enviar.';
    input.focus();
    return;
  }
  if(value.length>200){
    message.textContent='A resposta deve ter no máximo 200 caracteres.';
    return;
  }
  // Envia somente a resposta, sem campos tipo ou valor.
  await send(value);
}
button.addEventListener('click',submit);
input.addEventListener('keydown',event=>{
  if(event.key==='Enter'&&!event.isComposing){event.preventDefault();submit();}
});
