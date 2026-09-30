import {query} from './api.js';
import {decorateTeam} from './equipe.js';
const $=id=>document.getElementById(id),KEY='livro-admin-code';
let code=sessionStorage.getItem(KEY)||'',busy=false;
const catalog=await fetch('enigmas.json').then(r=>r.json());
const labels=Object.fromEntries(catalog.map(x=>[x.id,x.titulo]));
function cell(row,text,tag='td'){const element=document.createElement(tag);element.textContent=String(text);row.append(element);return element;}
function time(ms){return new Date(ms).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',second:'2-digit',fractionalSecondDigits:3});}
function render(data){
  $('admin-login').hidden=true;$('dashboard').hidden=false;
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
  if(!code||busy)return;const requestedCode=code;busy=true;$('refresh').disabled=true;$('control-status').textContent='Consultando resultados...';
  try{const result=await query('control',{adminCode:requestedCode});if(code!==requestedCode)return;if(!result.ok)throw new Error(result.error);sessionStorage.setItem(KEY,code);render(result);$('control-status').textContent='';}
  catch(e){$('control-status').textContent=e.message;}
  finally{busy=false;$('refresh').disabled=false;}
}
$('admin-login').onsubmit=e=>{e.preventDefault();code=$('admin-code').value.trim();update();};
$('refresh').onclick=update;
$('exit').onclick=()=>{sessionStorage.removeItem(KEY);code='';$('admin-code').value='';$('dashboard').hidden=true;$('admin-login').hidden=false;$('control-status').textContent='';};
if(code)update();setInterval(()=>{if(!document.hidden)update();},15000);
