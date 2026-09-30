import {resolveAccess,linkWithAccess} from './acesso.js';
import {decorateTeam} from './equipe.js';
import {query,submitAnswer} from './api.js';
const config=await fetch('../../enigmas.json').then(r=>r.json()).then(items=>items.filter(x=>x.ativo));
const id=document.body.dataset.enigma;
const pos=config.findIndex(x=>x.id===id);
if (pos<0) throw new Error(`Enigma não encontrado: ${id}`);
let session;
try {session=resolveAccess();} catch(error){console.error(error.message);}
if (!session) location.replace('../../index.html');
const $=id=>document.getElementById(id), item=config[pos];
$('page-count').textContent=`${pos+1} de ${config.length}`;
$('book-title').textContent=item.titulo;
if(session) decorateTeam($('team-label'),session.team,`Equipe ${session.team}`);
$('prev').href=pos===0?'../../indice.html':`../${config[pos-1].pasta}/`;
$('prev').textContent=pos===0?'':'← Anterior';
$('next').href=pos===config.length-1?'../../indice.html':`../${config[pos+1].pasta}/`;
$('next').textContent=pos===config.length-1?'':'Próximo →';
$('index-link').href='../../indice.html';
for(const element of [$('prev'),$('next'),$('index-link')]) element.href=linkWithAccess(element.getAttribute('href'),session);
let locked=false, checking=false, sending=false, generation=0;
function display(status) {
  locked=!!status.submitted;
  $('lock-banner').hidden=!locked;
  $('lock-banner').textContent=locked?'Resposta enviada!':'';
  $('submit-answer').disabled=locked||sending;
  document.querySelectorAll('[data-answer-input]').forEach(el=>{el.disabled=locked;el.draggable=!locked;});
  document.dispatchEvent(new CustomEvent('book:lock',{detail:{locked}}));
}
export async function refreshStatus() {
  if (!session || checking || sending) return;
  checking=true; const snapshot=generation;
  try {
    const result=await query('status',{team:session.team,code:session.code,enigmaId:id});
    if(snapshot!==generation||sending)return;
    if (!result.ok) throw new Error(result.error);
    display(result);
  } catch(e) { if(snapshot!==generation||sending)return; $('message').textContent=`Status indisponível: ${e.message}`; $('submit-answer').disabled=true; }
  finally { checking=false; }
}
export async function send(answer) {
  if (locked||sending) return;
  sending=true;generation++;
  $('submit-answer').disabled=true; $('message').textContent='Enviando resposta...'; $('sending-indicator').hidden=false;
  try {
    const result=await submitAnswer(id,answer);
    $('message').textContent=result.accepted?'Resposta já foi enviada pela equipe.':'Outra pessoa da equipe respondeu primeiro. A resposta já está registrada.';
    display(result.status);
  } catch(e) {
    $('message').textContent=e.message;
    sending=false; await refreshStatus();
  } finally { sending=false; $('sending-indicator').hidden=true; }
}
await refreshStatus();
setInterval(refreshStatus,8000);
