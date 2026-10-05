import {send} from '../../js/livro.js';
import {getSession} from '../../js/api.js';
import {GAME_ID} from '../../js/config.js';
import {COLORS} from '../../js/equipe.js';
const $=id=>document.getElementById(id);
const session=getSession();
let current=null,found=new Set(),lives=3,ended=false,locked=false,ready=false,transform={z:1,x:.5,y:.5},storageKey='';
function isLocked(){return locked||$('submit-answer').hidden||$('submit-answer').disabled;}
function save(){try{localStorage.setItem(storageKey,JSON.stringify({found:[...found],lives}));}catch{}}
function updateScore(){
 $('hearts').replaceChildren();
 for(let i=0;i<3;i++){const heart=document.createElement('span');heart.textContent='♥';heart.style.color=COLORS[session?.team]||'#9e7532';if(i>=lives)heart.className='lost';$('hearts').append(heart);}
 $('hearts').setAttribute('aria-label',lives+' vidas restantes');
 $('diff-status').textContent=lives===0?'As vidas acabaram. Envie sua resposta.':'';
}
function guess(x,y){
 if(!ready||!current||ended||isLocked()||x<0||y<0||x>1||y>1)return;
 const img=$('target').querySelector('img'),ratio=img.naturalHeight/img.naturalWidth;
 const matches=current.differences.map((d,i)=>({d,i})).filter(({d})=>Math.hypot(x-d.x,(y-d.y)*ratio)<=d.r);
 const hit=matches.find(({i})=>!found.has(i));
 if(hit){found.add(hit.i);mark($('target').firstElementChild,hit.d);}
 else if(matches.length)return;
 else{lives=Math.max(0,lives-1);mark($('target').firstElementChild,{x,y},'wrong');if(lives===0)ended=true;}
 updateScore();save();
}
function layout(){if(!current)return;for(const id of ['ref','target']){const v=$(id),scene=v.firstElementChild,img=scene.querySelector('img');if(!img.naturalWidth)continue;const base=Math.min(v.clientWidth/img.naturalWidth,v.clientHeight/img.naturalHeight),w=img.naturalWidth*base,h=img.naturalHeight*base;scene.style.width=w+'px';scene.style.height=h+'px';scene.style.transform=`translate(${v.clientWidth/2-transform.x*w*transform.z}px,${v.clientHeight/2-transform.y*h*transform.z}px) scale(${transform.z})`;scene.dataset.w=w;scene.dataset.h=h}$('reset').textContent=Math.round(transform.z*100)+'%'}
function localPoint(v,clientX,clientY){const rect=v.firstElementChild.getBoundingClientRect();return{x:(clientX-rect.left)/rect.width,y:(clientY-rect.top)/rect.height}}
function mark(scene,d,className='mark'){const n=document.createElement('span');n.className=className;n.style.left=d.x*100+'%';n.style.top=d.y*100+'%';if(className==='mark'){n.style.width=d.r*200+'%';n.style.aspectRatio='1'}else{n.textContent='×';setTimeout(()=>n.remove(),4000)}scene.append(n);return n}
function zoom(z,v=null,cx=0,cy=0){const before=v?localPoint(v,cx,cy):null;transform.z=Math.max(1,Math.min(5,z));if(transform.z===1){transform.x=.5;transform.y=.5}else if(before){const rect=v.getBoundingClientRect(),s=v.firstElementChild;transform.x=before.x-(cx-rect.left-v.clientWidth/2)/(+s.dataset.w*transform.z);transform.y=before.y-(cy-rect.top-v.clientHeight/2)/(+s.dataset.h*transform.z)}clamp();layout()}
function clamp(){transform.x=Math.max(0,Math.min(1,transform.x));transform.y=Math.max(0,Math.min(1,transform.y))}
for(const id of ['ref','target']){const v=$(id),points=new Map();let gesture=null,lastTap=null;v.addEventListener('pointerdown',e=>{if(!current)return;v.setPointerCapture(e.pointerId);points.set(e.pointerId,{x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,moved:false});lastTap=points.size>1?null:lastTap;gesture=null;if(points.size===2){points.forEach(p=>p.moved=true);const [a,b]=[...points.values()];gesture={distance:Math.hypot(a.x-b.x,a.y-b.y),z:transform.z}}});v.addEventListener('pointermove',e=>{const p=points.get(e.pointerId);if(!p)return;const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;if(Math.hypot(p.x-p.startX,p.y-p.startY)>6)p.moved=true;if(points.size===2&&gesture){const [a,b]=[...points.values()];zoom(gesture.z*Math.hypot(a.x-b.x,a.y-b.y)/Math.max(1,gesture.distance),v,(a.x+b.x)/2,(a.y+b.y)/2)}else if(points.size===1&&transform.z>1){const scene=v.firstElementChild;transform.x-=dx/(+scene.dataset.w*transform.z);transform.y-=dy/(+scene.dataset.h*transform.z);clamp();layout()}});v.addEventListener('pointerup',e=>{const p=points.get(e.pointerId);points.delete(e.pointerId);gesture=null;if(!p)return;if(id==='target'&&!p.moved&&points.size===0){const now=performance.now();if(lastTap&&now-lastTap.time<350&&Math.hypot(e.clientX-lastTap.x,e.clientY-lastTap.y)<25){const point=localPoint(v,e.clientX,e.clientY);guess(point.x,point.y);lastTap=null}else lastTap={time:now,x:e.clientX,y:e.clientY}}else lastTap=null});v.addEventListener('pointercancel',e=>{points.delete(e.pointerId);gesture=null;lastTap=null});v.addEventListener('wheel',e=>{e.preventDefault();zoom(transform.z*Math.exp(-e.deltaY*.002),v,e.clientX,e.clientY)},{passive:false})}

$('plus').onclick=()=>zoom(transform.z*1.25);$('minus').onclick=()=>zoom(transform.z/1.25);$('reset').onclick=()=>zoom(1);
window.addEventListener('resize',layout);
new ResizeObserver(layout).observe($('target'));
document.addEventListener('book:lock',event=>{locked=!!event.detail.locked;});
$('submit-answer').addEventListener('click',async()=>{if(!ready||isLocked())return;await send(String(found.size));});
function dimensions(src){return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve([img.naturalWidth,img.naturalHeight]);img.onerror=()=>reject(Error('Não foi possível carregar uma das imagens.'));img.src=src;});}
async function init(){
 try{
  const response=await fetch('./desafios.json',{cache:'no-store'});if(!response.ok)throw Error('Não foi possível carregar desafios.json.');
  const data=await response.json();current=data.games?.[0];
  if(!current||!Array.isArray(current.differences)||!current.differences.length)throw Error('Cadastre um desafio no editor e publique desafios.json.');
  for(const d of current.differences)if(![d.x,d.y,d.r].every(Number.isFinite)||d.x<0||d.x>1||d.y<0||d.y>1||d.r<=0||d.r>.2)throw Error('Uma região de diferença é inválida.');
  const [a,b]=await Promise.all([dimensions(current.image1),dimensions(current.image2)]);if(a[0]!==b[0]||a[1]!==b[1])throw Error('As imagens precisam ter as mesmas dimensões.');
  // A revisão muda quando o desafio muda, evitando restaurar marcações de outras imagens.
  const content=JSON.stringify(current);let hash=0;for(let i=0;i<content.length;i++)hash=(Math.imul(hash,31)+content.charCodeAt(i))|0;
  storageKey=['livro-diferencas',GAME_ID,session?.team,document.body.dataset.enigma,hash].join(':');
  try{const saved=JSON.parse(localStorage.getItem(storageKey));if(saved){lives=Number.isInteger(saved.lives)?Math.max(0,Math.min(3,saved.lives)):3;found=new Set((saved.found||[]).filter(i=>Number.isInteger(i)&&i>=0&&i<current.differences.length));}}catch{}
  ended=lives===0;
  for(const [id,src] of [['ref',current.image1],['target',current.image2]]){const img=$(id).querySelector('img');img.onload=layout;img.src=src;}
  for(const i of found)mark($('target').firstElementChild,current.differences[i]);
  ready=true;updateScore();requestAnimationFrame(layout);
 }catch(error){$('diff-status').textContent=error.message;$('submit-answer').hidden=true;}
}
init();
