import {decorateTeam} from './equipe.js';
import {query} from './api.js';
import {resolveAccess,linkWithAccess} from './acesso.js';
const $=id=>document.getElementById(id);
async function loadIndex(){
  try{
    const access=resolveAccess();
    if(!access)throw new Error('Acesse o link entregue à sua equipe após concluir o desafio anterior.');
    decorateTeam($('team-label'),access.team);
    const response=await fetch('enigmas.json',{cache:'no-store'});
    if(!response.ok)throw new Error('Não foi possível carregar o catálogo dos enigmas.');
    const index=(await response.json()).filter(item=>item.ativo);
    let result;
    try{result=await query('status',{team:access.team,code:access.code});if(!result.ok)throw new Error(result.error||'Acesso inválido.');}
    catch(error){$('index-status').textContent=`Não foi possível atualizar as respostas: ${error.message}`;}
    const list=$('index-list');list.replaceChildren();
    for(const [i,item] of index.entries()){
      const li=document.createElement('li'),a=document.createElement('a');
      a.href=linkWithAccess(`enigmas/${item.pasta}/`,access);a.textContent=`${i+1}. ${item.titulo}`;li.append(a);
      if(result?.ok&&result.answers?.[item.id]){const tag=document.createElement('span');tag.className='tag';tag.textContent='Respondido';li.classList.add('done');li.append(tag);}
      list.append(li);
    }
    $('index-area').hidden=false;
    if(!index.length)$('index-status').textContent='Nenhum enigma disponível.';
  }catch(error){$('entry-error').hidden=false;$('entry-error').textContent=error.message;}
  finally{$('index-loading').hidden=true;}
}
loadIndex();
