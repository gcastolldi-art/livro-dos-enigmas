import {query} from './api.js';
import {resolveAccess,linkWithAccess} from './acesso.js';
import {decorateTeam} from './equipe.js';
const $=id=>document.getElementById(id);
try{
 const access=resolveAccess();if(!access)throw new Error('Acesse o link da sua equipe.');
 decorateTeam($('team-label'),access.team);$('back').href=linkWithAccess('indice.html',access);
 const result=await query('teamResults',{team:access.team,code:access.code});if(!result.ok)throw new Error(result.error);
 const labels={PARCIAL:'Parcial',CORRETA:'Certo',INCORRETA:'Errado',PENDENTE:'Aguardando correção',NAO_RESPONDIDA:'Não respondida'};
 for(const item of result.items){const row=document.createElement('tr');
  [item.id+'. '+item.nome,item.answer??'Não respondida',item.gabarito||'Não informado',labels[item.result]||item.result,item.points+' / '+item.pontos].forEach(value=>{const td=document.createElement('td');td.textContent=String(value);row.append(td);});
  row.className=item.result==='CORRETA'?'correct':item.result==='INCORRETA'?'wrong':'pending';$('rows').append(row);
 }
 $('points').textContent='Total da equipe: '+result.points+' pontos';$('results').hidden=false;$('status').textContent='';
}catch(error){$('status').textContent=error.message;}
