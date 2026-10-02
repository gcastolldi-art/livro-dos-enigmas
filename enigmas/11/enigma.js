import {send} from '../../js/livro.js';

const input=document.querySelector('[data-answer-input]');
const button=document.getElementById('submit-answer');
const message=document.getElementById('message');

input.addEventListener('input',()=>{
  input.value=input.value.replace(/\D/g,'').slice(0,4);
  input.setCustomValidity('');
});

async function submit(){
  // O módulo comum controla disponibilidade, envio e bloqueio da equipe.
  if(button.disabled||button.hidden||input.disabled)return;
  const value=input.value.trim();
  if(!/^[0-9]{1,4}$/.test(value)||Number(value)<1){
    message.textContent='Informe a quantidade de abelhas antes de enviar.';
    input.focus();
    return;
  }
  const answer=String(Number(value));
  input.value=answer;
  await send(answer);
}
button.addEventListener('click',submit);
input.addEventListener('keydown',event=>{
  if(event.key==='Enter'){event.preventDefault();submit();}
});
