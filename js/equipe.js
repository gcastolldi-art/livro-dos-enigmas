import {TEAMS} from './config.js';
export const COLORS={Vermelha:'#ce2929',Laranja:'#e77820',Amarela:'#d4a300',Verde:'#348145',Azul:'#2e6fd3',Marinho:'#172c59',Roxa:'#8841b8',Rosa:'#db639f',Marrom:'#795039',Turquesa:'#008e99',Preta:'#222',Branca:'#fff'};
export function decorateTeam(element,team){
  element.replaceChildren();element.classList.add('team-mark');
  const star=document.createElement('span');star.className='team-star';star.textContent='✦✦✦';star.style.color=COLORS[team]||'#9e7532';star.setAttribute('aria-hidden','true');
  const label=document.createElement('span');label.textContent=`EQUIPE ${TEAMS[team]||team}`;
  const header=element.closest('.page-head');
  const coverlabel=document.createElement('span');coverlabel.className='team-cover-star';coverlabel.textContent=`✦✦ EQUIPE ${TEAMS[team]||team} ✦✦`;coverlabel.style.color=COLORS[team]||'#9e7532';coverlabel.setAttribute('aria-hidden','true');
  if(header){header.querySelector('.header-team-star')?.remove();star.classList.add('header-team-star');header.append(star);element.append(label);}
  else{element.append(coverlabel);}
}
