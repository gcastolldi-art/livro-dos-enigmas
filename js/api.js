import { API_URL, GAME_ID } from './config.js';
const STORAGE_KEY = 'livro-enigmas-session';
let memorySession=null;
export const getSession = () => { try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY))||memorySession; } catch { return memorySession; } };
export const saveSession = data => {memorySession=data;try{sessionStorage.setItem(STORAGE_KEY,JSON.stringify(data));}catch{}};
export const clearSession = () => {memorySession=null;try{sessionStorage.removeItem(STORAGE_KEY);}catch{}};

// O retorno JSONP permite consulta a um Apps Script hospedado em outro domínio.
// Nenhum conteúdo fornecido por jogadores é tratado como código pelo callback.
function queryOnce(action, fields = {}) {
  if (!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/.test(API_URL)) return Promise.reject(new Error('Configure API_URL com a URL publicada do Apps Script, terminada em /exec.'));
  return new Promise((resolve, reject) => {
    const callback = `__bookCallback_${Date.now()}_${Math.floor(Math.random()*1e6)}`;
    const script = document.createElement('script');
    const timer = setTimeout(() => finish(Object.assign(new Error('O Apps Script não respondeu em 30 segundos. Confira a implantação e tente novamente.'),{retryable:true})), 30000);
    let done = false;
    function finish(error, result) {
      if (done) return; done = true; clearTimeout(timer); script.remove(); delete window[callback];
      error ? reject(error) : resolve(result);
    }
    window[callback] = result => finish(null, result);
    script.onerror = () => finish(new Error('O navegador não conseguiu carregar o Apps Script. Confira acesso para Qualquer pessoa, a URL /exec e a versão publicada.'));
    script.onload = () => { if (!done) finish(new Error('O Apps Script carregou, mas não retornou o formato esperado. Publique a nova versão de Code.gs.')); };
    const url = new URL(API_URL);
    Object.entries({action, gameId:GAME_ID, ...fields, callback}).forEach(([key,val]) => url.searchParams.set(key,val));
    script.src = url.toString(); document.head.append(script);
  });
}

export function query(action, fields = {}) { return queryOnce(action,fields); }
const STATUS_KEY='livro-status-v282';
const statusIdentity=()=>{const s=getSession();return s?`${GAME_ID}:${s.team}:${s.code}`:'';};
let cachedStatus=null;
export function getCachedStatus(){try{const saved=JSON.parse(sessionStorage.getItem(STATUS_KEY));if(saved?.identity===statusIdentity())return saved.status;}catch{}return cachedStatus?.identity===statusIdentity()?cachedStatus.status:null;}
export function saveStatus(status){cachedStatus={identity:statusIdentity(),status};try{sessionStorage.setItem(STATUS_KEY,JSON.stringify(cachedStatus));}catch{}}
const pendingRequests=new Map();
export async function submitAnswer(enigmaId,answer){
 const session=getSession();if(!session)throw new Error('Abra o link da equipe antes de responder.');
 const value=answer&&typeof answer==='object'&&!Array.isArray(answer)&&Object.prototype.hasOwnProperty.call(answer,'valor')?answer.valor:answer;
 const requestKey=`${statusIdentity()}:${enigmaId}`;
 const requestId=pendingRequests.get(requestKey)||globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random()}`;
 pendingRequests.set(requestKey,requestId);
 const result=await query('submit',{...session,enigmaId,answer:JSON.stringify(value),requestId});
 if(!result.ok)throw new Error(result.error||'Não foi possível enviar a resposta.');
 if(!result.submitted)throw new Error('Atualize a implantação do Apps Script para a versão 2.8.2.');
 const cached=getCachedStatus()||{state:'receiving',answers:{}};
 saveStatus({...cached,answers:{...cached.answers,[enigmaId]:true}});
 pendingRequests.delete(requestKey);
 return {accepted:result.accepted,status:{...cached,submitted:true,requestId:result.requestId}};
}
