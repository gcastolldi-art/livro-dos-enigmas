import {send} from '../../js/livro.js';
import {resolveAccess} from '../../js/acesso.js';
import {shuffle,solvable,move,neighbors,solved} from './modelo.js';
const boardElement=document.getElementById('puzzle'),submit=document.getElementById('submit-answer'),status=document.getElementById('puzzle-status');
const access=resolveAccess();
const image=boardElement.dataset.image||'imagem.png';
const key=`livro:montar:${access?.team}:${access?.code}:${document.body.dataset.enigma}:${image}`;
let imageState='loading';
let board,locked=submit.hidden||submit.disabled,gesture=null;
try{const saved=JSON.parse(localStorage.getItem(key));if(solvable(saved))board=saved;}catch{}
board ||= shuffle();
function save(){try{localStorage.setItem(key,JSON.stringify(board));}catch{}}
function blocked(){return imageState!=='ready'||locked||submit.hidden||submit.disabled;}
const tiles=Array.from({length:25},(_,i)=>{const tile=document.createElement('button');tile.type='button';tile.className='puzzle-tile';tile.dataset.index=i;tile.draggable=false;boardElement.append(tile);return tile;});
function render(){if(imageState!=='ready'){status.textContent=imageState==='error'?'Não foi possível carregar a imagem do enigma. Recarregue a página para tentar novamente.':'Embaralhando as peças...';tiles.forEach(tile=>{tile.disabled=true;tile.style.backgroundImage='none';});return;}const empty=board.indexOf(0),options=neighbors(empty);tiles.forEach((tile,i)=>{const n=board[i];tile.classList.toggle('empty',n===0);tile.disabled=blocked()||!n;tile.setAttribute('aria-label',n?`Peça ${n}, linha ${Math.floor(i/5)+1}, coluna ${i%5+1}${options.includes(i)?', pode mover':''}`:'Espaço vazio');tile.style.backgroundImage=n?`url("${image}")`:'none';tile.style.backgroundPosition=n?`${((n-1)%5)*25}% ${Math.floor((n-1)/5)*25}%`:'';});status.textContent=solved(board)?'Imagem montada! Você pode enviar a resposta.':'Mova uma peça vizinha para o espaço vazio.';}
function play(index){if(blocked())return;if(move(board,index)){save();render();}}
boardElement.addEventListener('click',event=>{const tile=event.target.closest('[data-index]');if(tile)play(Number(tile.dataset.index));});
boardElement.addEventListener('pointerdown',event=>{const tile=event.target.closest('[data-index]');if(!tile||blocked()||!neighbors(board.indexOf(0)).includes(Number(tile.dataset.index)))return;gesture={id:event.pointerId,index:Number(tile.dataset.index),x:event.clientX,y:event.clientY};tile.setPointerCapture(event.pointerId);});
boardElement.addEventListener('pointerup',event=>{if(!gesture||event.pointerId!==gesture.id)return;const g=gesture;gesture=null;const dx=event.clientX-g.x,dy=event.clientY-g.y;if(Math.hypot(dx,dy)<15)return;const empty=board.indexOf(0),x=empty%5-g.index%5,y=Math.floor(empty/5)-Math.floor(g.index/5);if((x&&Math.sign(dx)===x&&Math.abs(dx)>Math.abs(dy))||(y&&Math.sign(dy)===y&&Math.abs(dy)>Math.abs(dx)))play(g.index);});
boardElement.addEventListener('pointercancel',()=>gesture=null);
document.addEventListener('book:lock',event=>{locked=event.detail.locked;gesture=null;render();});
submit.addEventListener('click',async()=>{if(blocked())return;if(!solved(board)){document.getElementById('message').textContent='Complete a imagem antes de enviar a resposta.';return;}await send(board.join(','));render();});
const observer=new MutationObserver(render);observer.observe(submit,{attributes:true,attributeFilter:['disabled','hidden']});
const preload=new Image();
preload.onload=()=>{imageState='ready';render();};
preload.onerror=()=>{imageState='error';render();};
save();render();
preload.src=image;
