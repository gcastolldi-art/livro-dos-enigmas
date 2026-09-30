export const COLORS={Vermelho:'#ce2929',Laranja:'#e77820',Amarelo:'#d4a300',Verde:'#348145',Azul:'#2e6fd3',Marinho:'#172c59',Roxo:'#8841b8',Rosa:'#db639f',Marrom:'#795039',Turquesa:'#008e99',Preto:'#222',Branco:'#fff'};
export function decorateTeam(element,team,text){
  element.replaceChildren();element.classList.add('team-mark');
  const star=document.createElement('span');star.className='team-star';star.textContent='✦';star.style.color=COLORS[team]||'#9e7532';star.setAttribute('aria-hidden','true');
  const label=document.createElement('span');label.textContent=text; element.append(label,star);
}
