import {query} from './api.js';
import {decorateTeam} from './equipe.js';
const $=id=>document.getElementById(id);
let busy=false;
const catalog=await fetch('enigmas.json').then(r=>r.json());
const labels=Object.fromEntries(catalog.map(x=>[x.id,x.titulo]));
function cell(row,text,tag='td'){const element=document.createElement(tag);element.textContent=String(text);row.append(element);return element;}
function time(ms){return new Date(ms).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',second:'2-digit',fractionalSecondDigits:3});}
function render(data){
  $('dashboard').hidden=false;
  $('game-state').textContent={receiving:'Recebendo respostas',blocked:'Respostas bloqueadas',revealed:'Gabarito liberado'}[data.state];
  document.querySelectorAll('[data-state]').forEach(b=>b.disabled=b.dataset.state===data.state);
  $('summary').textContent=`${data.teams.filter(t=>t.complete).length}/12 equipes concluíram · ${data.total} enigmas · atualizado às ${time(data.updatedAt)}`;
  const table=$('results-table');table.replaceChildren();const head=document.createElement('thead'),hr=document.createElement('tr');
  ['Pos.','Equipe',...data.activeIds.map(id=>labels[id]||id),'Pontos','Respondidos','Conclusão'].forEach(t=>cell(hr,t,'th'));head.append(hr);table.append(head);
  const body=document.createElement('tbody');
  data.teams.forEach(team=>{
    const row=document.createElement('tr');cell(row,`${team.rank}º`);const name=cell(row,'');decorateTeam(name,team.team,team.team);
    data.activeIds.forEach(id=>{
      const answer=team.answers[id],td=cell(row,answer?answer.answer:'Aguardando');
      if(answer){td.className=answer.result==='CORRETA'?'correct':answer.result==='INCORRETA'?'wrong':'pending';
        const meta=document.createElement('small');meta.textContent=`${answer.result} · ${answer.points} pt · ${answer.questionOrder}º neste enigma · envio #${answer.order} · ${time(answer.at)}`;td.append(meta);
      }else td.className='waiting';
    });
    cell(row,team.points).className='total';cell(row,`${team.answered}/${data.total}`);cell(row,team.complete?`${team.completionOrder}ª equipe · ${time(team.completedAt)}`:'Em andamento');body.append(row);
  });table.append(body);
  const history=$('history-table');history.replaceChildren();const hh=document.createElement('tr');['Envio','Equipe','Enigma','Resposta','Horário'].forEach(t=>cell(hh,t,'th'));const hhead=document.createElement('thead');hhead.append(hh);history.append(hhead);const hb=document.createElement('tbody');
  data.submissions.forEach(answer=>{const row=document.createElement('tr');[answer.order,answer.team,labels[answer.enigmaId]||answer.enigmaId,answer.answer,time(answer.at)].forEach(v=>cell(row,v));hb.append(row);});history.append(hb);
}
async function update(){
  if(busy)return;busy=true;$('refresh').disabled=true;$('control-status').textContent='Consultando resultados...';
  try{const result=await query('control');if(!result.ok)throw new Error(result.error);render(result);$('control-status').textContent='';}
  catch(e){$('control-status').textContent=e.message;}
  finally{busy=false;$('refresh').disabled=false;}
}
$('refresh').onclick=update;
update();setInterval(()=>{if(!document.hidden)update();},15000);

document.querySelectorAll('[data-state]').forEach(button=>button.onclick=async()=>{
  if(busy)return;busy=true;
  document.querySelectorAll('[data-state]').forEach(b=>b.disabled=true);
  $('control-status').textContent='Atualizando estado da partida...';
  try{const result=await query('setState',{state:button.dataset.state});if(!result.ok)throw new Error(result.error);}
  catch(error){$('control-status').textContent=error.message;busy=false;document.querySelectorAll('[data-state]').forEach(b=>b.disabled=false);return;}
  busy=false;await update();
});
