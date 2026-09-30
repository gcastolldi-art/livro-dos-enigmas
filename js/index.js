import {decorateTeam} from './equipe.js';
import {TEAMS} from './config.js';
import {getSession,saveSession,clearSession,query} from './api.js';
const $=id=>document.getElementById(id);
const index=await fetch('enigmas.json').then(r=>r.json()).then(items=>items.filter(item=>item.ativo));
const fragment=new URLSearchParams(location.hash.slice(1));
const team=fragment.get('equipe'), code=fragment.get('codigo');
if (team||code) {
  // O fragmento # não é enviado ao GitHub Pages. Após a validação, é retirado
  // da barra de endereço para reduzir compartilhamentos acidentais do código.
  if (Object.prototype.hasOwnProperty.call(TEAMS,team)&&code) {
    try {
      const result=await query('status',{team,code});
      if (!result.ok) throw new Error(result.error||'Código inválido.');
      saveSession({team,code,player:TEAMS[team]});
      history.replaceState(null,'',location.pathname+location.search);
    } catch(e) { clearSession(); $('entry-error').hidden=false; $('entry-error').textContent=`Não foi possível abrir o livro: ${e.message}`; }
  } else { clearSession(); $('entry-error').hidden=false; $('entry-error').textContent='O link da equipe está incompleto ou inválido.'; }
}
const session=getSession();
if (!session) {
  $('entry-error').hidden=false;
  if (!$('entry-error').textContent) $('entry-error').textContent='Acesse o link entregue à sua equipe após concluir o desafio anterior.';
} else {
  decorateTeam($('team-label'),session.team,`Equipe ${session.team} · ${TEAMS[session.team]||session.player}`);
  $('index-area').hidden=false;
  const list=$('index-list');
  for (const [i,item] of index.entries()) {
    const li=document.createElement('li'),a=document.createElement('a'),tag=document.createElement('span');
    a.href=`enigmas/${item.pasta}/`;a.textContent=`${i+1}. ${item.titulo}`;
    tag.className='tag';tag.textContent=item.tipo;li.append(a,tag);list.append(li);
  }
  try {
    const result=await query('status',{team:session.team,code:session.code});
    if (!result.ok) throw new Error(result.error||'Não foi possível consultar as respostas.');
    for (const [i,li] of [...list.children].entries()) {
      if (result.answers?.[index[i].id]) {li.classList.add('done');li.querySelector('.tag').textContent='Respondido';}
    }
  } catch(e) { $('index-status').textContent=`Status indisponível: ${e.message}`; }
}

if (!session) { $('retry-entry').hidden=false; $('retry-entry').onclick=()=>location.reload(); }
