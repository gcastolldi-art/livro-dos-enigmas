import { API_URL, GAME_ID } from './config.js';
const STORAGE_KEY = 'livro-enigmas-session';
export const getSession = () => { try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY)); } catch { return null; } };
export const saveSession = data => sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
export const clearSession = () => sessionStorage.removeItem(STORAGE_KEY);

// O retorno JSONP permite consulta a um Apps Script hospedado em outro domínio.
// Nenhum conteúdo fornecido por jogadores é tratado como código pelo callback.
export function query(action, fields = {}) {
  if (!API_URL) return Promise.reject(new Error('Configure API_URL em js/config.js para ativar o jogo.'));
  return new Promise((resolve, reject) => {
    const callback = `__bookCallback_${Date.now()}_${Math.floor(Math.random()*1e6)}`;
    const script = document.createElement('script');
    const timer = setTimeout(() => finish(new Error('Tempo esgotado ao consultar o servidor.')), 12000);
    let done = false;
    function finish(error, result) {
      if (done) return; done = true; clearTimeout(timer); script.remove(); delete window[callback];
      error ? reject(error) : resolve(result);
    }
    window[callback] = result => finish(null, result);
    script.onerror = () => finish(new Error('Não foi possível consultar o servidor.'));
    const url = new URL(API_URL);
    Object.entries({action, gameId:GAME_ID, ...fields, callback}).forEach(([key,val]) => url.searchParams.set(key,val));
    script.src = url.toString(); document.head.append(script);
  });
}

export async function submitAnswer(enigmaId, answer) {
  if (!API_URL) throw new Error('Configure API_URL em js/config.js para ativar o jogo.');
  const session = getSession();
  if (!session) throw new Error('Abra o livro e identifique-se antes de responder.');
  const requestId = crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;
  const body = new URLSearchParams({action:'submit', gameId:GAME_ID, enigmaId, answer:JSON.stringify(answer), requestId, ...session});
  // Apps Script não fornece um CORS API convencional; o resultado da gravação é
  // confirmado por consulta posterior ao servidor, nunca por sucesso local.
  await fetch(API_URL, {method:'POST', mode:'no-cors', body});
  for (let attempt=0; attempt<7; attempt++) {
    await new Promise(resolve => setTimeout(resolve, 1100));
    const status = await query('status', {team:session.team, code:session.code, enigmaId});
    if (!status.ok) throw new Error(status.error || 'Falha ao consultar resposta.');
    if (status.submitted) return {accepted:status.requestId === requestId, status};
  }
  throw new Error('Não foi possível confirmar o registro. Verifique o estado da questão antes de tentar novamente.');
}
