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

export async function query(action, fields = {}) {
  try { return await queryOnce(action,fields); }
  catch(error) {
    if (!error.retryable) throw error;
    return queryOnce(action,fields);
  }
}

export async function submitAnswer(enigmaId, answer) {
  if (!API_URL) throw new Error('Configure API_URL em js/config.js para ativar o jogo.');
  const session = getSession();
  if (!session) throw new Error('Abra o livro e identifique-se antes de responder.');
  const requestId = crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;
  const value=answer && typeof answer==='object' && !Array.isArray(answer) && Object.prototype.hasOwnProperty.call(answer,'valor') ? answer.valor : answer;
  const body = new URLSearchParams({action:'submit', gameId:GAME_ID, enigmaId, answer:JSON.stringify(value), requestId, ...session});
  // Apps Script não fornece um CORS API convencional; o resultado da gravação é
  // confirmado por consulta posterior ao servidor, nunca por sucesso local.
  await fetch(API_URL, {method:'POST', mode:'no-cors', body});
  for (let attempt=0; attempt<7; attempt++) {
    await new Promise(resolve => setTimeout(resolve, 1100));
    const status = await query('status', {team:session.team, code:session.code, enigmaId});
    if (!status.ok) throw new Error(status.error || 'Falha ao consultar resposta.');
    if (!status.submitted && status.state && status.state!=='receiving') throw new Error('O prazo para responder os enigmas acabou!');
    if (status.submitted) return {accepted:status.requestId === requestId, status};
  }
  throw new Error('Não foi possível confirmar o registro. Verifique o estado da questão antes de tentar novamente.');
}
