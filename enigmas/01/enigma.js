import {send} from '../../js/livro.js';
document.getElementById('submit-answer').onclick=()=>{
  const selected=document.querySelector('input[name="choice"]:checked');
  if (!selected) {document.getElementById('message').textContent='Escolha uma alternativa.';return;}
  send({valor:selected.value});
};
