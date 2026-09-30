import {TEAMS} from './config.js';
import {getSession,saveSession} from './api.js';
function canonicalTeam(value){return Object.keys(TEAMS).find(team=>team.toLowerCase()===String(value||'').trim().toLowerCase());}
export function resolveAccess(href=location.href){
  const url=new URL(href),hash=new URLSearchParams(url.hash.slice(1)),search=url.searchParams;
  const params=hash.has('equipe')||hash.has('codigo')?hash:search;
  let data;
  if(params.has('equipe')||params.has('codigo')){
    const team=canonicalTeam(params.get('equipe')),code=(params.get('codigo')||'').trim();
    if(!team||!code)throw new Error('O link da equipe está incompleto ou inválido. Use o link entregue no desafio anterior.');
    data={team,code,player:TEAMS[team]};saveSession(data);
  }else{
    data=getSession();
    if(!data||!canonicalTeam(data.team)||!data.code)return null;
    data={...data,team:canonicalTeam(data.team),player:TEAMS[canonicalTeam(data.team)]};saveSession(data);
  }
  return data;
}
export function linkWithAccess(path,session){
  if(!session)return path;
  return path+'#'+new URLSearchParams({equipe:session.team,codigo:session.code}).toString();
}
