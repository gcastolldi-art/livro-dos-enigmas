import {send} from '../../js/livro.js';
import {getSession,getCachedStatus} from '../../js/api.js';
import {GAME_ID} from '../../js/config.js';
import {SECRET_NUMBER,MAX_ATTEMPTS,initialState,play} from './jogo.js';
const input=document.getElementById('answer-value');
const button=document.getElementById('submit-answer');
const feedback=document.getElementById('game-feedback');
const attempts=document.getElementById('attempts');
const history=document.getElementById('guess-history');
const session=getSession();
const key=JSON.stringify(['livro-enigma-17',GAME_ID,session?.team,session?.code,SECRET_NUMBER]);
let state=initialState(),busy=false,locked=input.disabled||button.hidden;
try{
 const saved=JSON.parse(localStorage.getItem(key));
 if(saved&&Number.isInteger(saved.attempts)&&saved.attempts>=0&&saved.attempts<=MAX_ATTEMPTS&&
 Array.isArray(saved.guesses)&&saved.guesses.length===saved.attempts&&
 saved.guesses.every(n=>Number.isInteger(n)&&n>=1&&n<=99)&&
 (saved.pending===null||saved.pending===String(SECRET_NUMBER)||saved.pending==='00')){
  state={...saved,confirmed:!!saved.confirmed};
 }
}catch{}
// O índice atualiza este cache a partir da planilha. Uma resposta apagada
// deve liberar uma nova partida, mesmo que a conclusão tenha sido salva localmente.
const serverStatus=getCachedStatus();
if(serverStatus?.ok&&serverStatus.answers&&typeof serverStatus.answers==='object'){
 if(!serverStatus.answers['17']&&state.confirmed){
  state=initialState();persist();
 }else if(serverStatus.answers['17']&&state.pending!==null){
  state.confirmed=true;persist();
 }
}
function persist(){try{localStorage.setItem(key,JSON.stringify(state));}catch{
 document.getElementById('storage-warning').hidden=false;
}}
function say(text,success=false){feedback.textContent=text;feedback.classList.toggle('success',success);}
function render(){
 attempts.textContent='Tentativas: '+state.attempts+' de '+MAX_ATTEMPTS;
 history.textContent=state.guesses.length?'Números tentados: '+state.guesses.join(', '):'';
 input.disabled=locked||busy||state.pending!==null||state.confirmed;
 button.disabled=locked||busy||state.confirmed;
 button.hidden=locked||state.confirmed;
 button.textContent=state.pending!==null?'Tentar enviar novamente':'Tentar número';
}
async function finish(){
 if(busy||locked||state.confirmed||state.pending===null)return;
 busy=true;render();
 say(state.pending==='00'?'As 10 tentativas acabaram. Aguarde...':'Você acertou! Enviando resposta...');
 try{
  await send(state.pending);
  if(getCachedStatus()?.answers?.['17']){
   state.confirmed=true;persist();
   say(state.pending==='00'?'Você não acertou. O número certo era 32.':'Parabéns, você acertou! Sua resposta foi enviada',state.pending!=='00');
  }else{
   say('O envio não foi confirmado. Volte ao índice para verificar ou tente enviar novamente.');
  }
 }finally{busy=false;render();}
}
async function submit(){
 if(busy||locked||state.confirmed||button.disabled||button.hidden)return;
 if(state.pending!==null){await finish();return;}
 const raw=input.value.trim();
 const result=play(state,/^\d{1,2}$/.test(raw)?Number(raw):NaN);
 if(result.kind==='invalid'){say('Digite um número inteiro de 1 a 99.');input.focus();return;}
 if(result.kind==='blocked')return;
 state=result.state;persist();render();
 const number=Number(raw);
 if(result.kind==='correct'||result.kind==='exhausted'){await finish();return;}
 say(number+(result.kind==='lower'?' é MENOR, tente outra vez':' é MAIOR, tente outra vez'));
 input.value='';input.focus();
}
button.addEventListener('click',submit);
input.addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();submit();}});
document.addEventListener('book:lock',event=>{locked=event.detail.locked;render();});
render();
if(state.confirmed){
 say(state.pending==='00'?'Você não acertou. O número certo era 32.':'Parabéns, você acertou! Sua resposta foi enviada',state.pending!=='00');
}else if(state.pending!==null&&!locked){
 finish();
}else if(state.guesses.length&&!locked){
 const number=state.guesses[state.guesses.length-1];
 say(number+(number<SECRET_NUMBER?' é MENOR, tente outra vez':' é MAIOR, tente outra vez'));
}
