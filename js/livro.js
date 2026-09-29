import {getSession,query,submitAnswer} from './api.js';
const config=await fetch('../../enigmas.json').then(r=>r.json()).then(items=>items.filter(x=>x.ativo));
const id=document.body.dataset.enigma;
const pos=config.findIndex(x=>x.id===id);
if (pos<0) throw new Error(`Enigma não encontrado: ${id}`);
const session=getSession();
if (!session) location.replace('../../index.html');
const $=id=>document.getElementById(id), item=config[pos];
$('page-count').textContent=`${pos+1} de ${config.length}`;
$('book-title').textContent=item.titulo;
$('team-label').textContent=session ? `Equipe ${session.team}` : '';
$('prev').href=pos===0?'../../index.html':`../${config[pos-1].pasta}/`;
$('prev').textContent=pos===0?'':'← Anterior';
$('next').href=pos===config.length-1?'../../index.html':`../${config[pos+1].pasta}/`;
$('next').textContent=pos===config.length-1?'':'Próximo →';
$('index-link').href='../../index.html';
let locked=false, checking=false;
function display(status) {
  locked=!!status.submitted;
  $('lock-banner').hidden=!locked;
  $('lock-banner').textContent=locked?'A equipe já enviou a resposta deste enigma. A página está bloqueada para novos envios.':'';
  $('submit-answer').disabled=locked;
  document.querySelectorAll('[data-answer-input]').forEach(el=>{el.disabled=locked;el.draggable=!locked;});
  document.dispatchEvent(new CustomEvent('book:lock',{detail:{locked}}));
}
export async function refreshStatus() {
  if (!session || checking) return;
  checking=true;
  try {
    const result=await query('status',{team:session.team,code:session.code,enigmaId:id});
    if (!result.ok) throw new Error(result.error);
    display(result);
  } catch(e) { $('message').textContent=`Status indisponível: ${e.message}`; $('submit-answer').disabled=true; }
  finally { checking=false; }
}
export async function send(answer) {
  if (locked) return;
  $('submit-answer').disabled=true; $('message').textContent='Registrando a resposta...';
  try {
    const result=await submitAnswer(id,answer);
    $('message').textContent=result.accepted?'Resposta registrada. O enigma foi fechado para a equipe.':'Outra pessoa da equipe respondeu primeiro. A resposta já está registrada.';
    display(result.status);
  } catch(e) {
    $('message').textContent=e.message;
    await refreshStatus();
  }
}
await refreshStatus();
setInterval(refreshStatus,8000);
