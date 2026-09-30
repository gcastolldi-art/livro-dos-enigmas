import {resolveAccess,linkWithAccess} from './acesso.js';
import {decorateTeam} from './equipe.js';
const link=document.getElementById('open-book'),label=document.getElementById('cover-team'),message=document.getElementById('cover-message');
try{
  const access=resolveAccess();
  if(access){decorateTeam(label,access.team,`Equipe ${access.team}`);label.hidden=false;link.href=linkWithAccess('indice.html',access);}
  else{link.hidden=true;message.textContent='Abra a capa pelo link entregue à sua equipe no desafio anterior.';}
}catch(error){link.hidden=true;message.textContent=error.message;}
