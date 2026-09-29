import {TEAMS} from './config.js';
import {getSession, saveSession, clearSession, query} from './api.js';
const $ = id => document.getElementById(id);
const index = await fetch('enigmas.json').then(r => r.json()).then(items => items.filter(item => item.ativo));
for (const name of TEAMS) $('team').add(new Option(`Equipe ${name}`, name));
const current = getSession(); if (current) { $('player').value=current.player; $('team').value=current.team; $('code').value=current.code; }
async function showIndex() {
  const session=getSession(); $('login-area').hidden=!!session; $('session-area').hidden=!session;
  if (!session) return;
  $('identity').textContent=`${session.player} · Equipe ${session.team}`;
  const list=$('index-list'); list.replaceChildren();
  for (const [i,item] of index.entries()) {
    const li=document.createElement('li'), a=document.createElement('a');
    a.href=`enigmas/${item.pasta}/`; a.textContent=`${i+1}. ${item.titulo}`;
    const tag=document.createElement('span'); tag.className='tag'; tag.textContent=item.tipo;
    li.append(a,tag); list.append(li);
  }
  const result=await query('status', {team:session.team,code:session.code}).catch(()=>null);
  if (result?.ok) for (const li of list.children) {
    const i=Array.prototype.indexOf.call(list.children,li), item=index[i];
    if (result.answers?.[item.id]) { li.classList.add('done'); li.querySelector('.tag').textContent='Respondido'; }
  }
}
$('enter').onclick=async () => {
  const session={player:$('player').value.trim(),team:$('team').value,code:$('code').value.trim()};
  if (!session.player || !session.team || !session.code) { $('login-status').textContent='Preencha nome, equipe e código.'; return; }
  $('enter').disabled=true; $('login-status').textContent='Conferindo acesso...';
  try {
    const result=await query('status',{team:session.team,code:session.code});
    if (!result.ok) throw new Error(result.error || 'Código inválido.');
    saveSession(session); $('login-status').textContent=''; await showIndex();
  } catch(error) { $('login-status').textContent=error.message; }
  finally { $('enter').disabled=false; }
};
$('logout').onclick=()=>{clearSession();showIndex();};
showIndex();
