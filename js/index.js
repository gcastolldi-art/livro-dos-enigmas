import {decorateTeam} from './equipe.js';
import {TEAMS} from './config.js';
import {query} from './api.js';
import {resolveAccess,linkWithAccess} from './acesso.js';
const $=id=>document.getElementById(id);
let access;
try{access=resolveAccess();}catch(error){$('entry-error').hidden=false;$('entry-error').textContent=error.message;}
if(!access){
  $('entry-error').hidden=false;
  if(!$('entry-error').textContent)$('entry-error').textContent='Acesse o link entregue à sua equipe após concluir o desafio anterior.';
}else{
  decorateTeam($('team-label'),access.team,`Equipe ${access.team} · ${TEAMS[access.team]}`);
  try{
    const response=await fetch('enigmas.json',{cache:'no-store'});
    if(!response.ok)throw new Error('Não foi possível carregar enigmas.json. Confira se o arquivo foi publicado na raiz do projeto.');
    const index=(await response.json()).filter(item=>item.ativo);
    const list=$('index-list');list.replaceChildren();
    for(const [i,item] of index.entries()){
      const li=document.createElement('li'),a=document.createElement('a'),tag=document.createElement('span');
      a.href=linkWithAccess(`enigmas/${item.pasta}/`,access);a.textContent=`${i+1}. ${item.titulo}`;
      tag.className='tag';tag.textContent=item.tipo;li.append(a,tag);list.append(li);
    }
    $('index-area').hidden=false;
    if(!index.length)$('index-status').textContent='Nenhum enigma ativo no catálogo.';
    else $('index-status').textContent='Consultando respostas da equipe...';
    try{
      const result=await query('status',{team:access.team,code:access.code});
      if(!result.ok){$('entry-error').hidden=false;$('entry-error').textContent=result.error||'Não foi possível validar o acesso da equipe.';}
      else{
        for(const [i,li] of [...list.children].entries())if(result.answers?.[index[i].id]){li.classList.add('done');li.querySelector('.tag').textContent='Respondido';}
        $('index-status').textContent=index.length?'':'';
      }
    }catch(error){$('index-status').textContent=`O índice está disponível, mas a consulta das respostas falhou: ${error.message}`;}
  }catch(error){$('entry-error').hidden=false;$('entry-error').textContent=error.message;}
}
$('retry-entry').hidden=false;$('retry-entry').onclick=()=>location.reload();
