import {send} from '../../js/livro.js';
document.getElementById('submit-answer').onclick=()=>{
  const value=document.getElementById('answer').value.trim();
  if (!value) {document.getElementById('message').textContent='Escreva uma resposta antes de enviar.';return;}
  send({tipo:'texto',valor:value});
};
