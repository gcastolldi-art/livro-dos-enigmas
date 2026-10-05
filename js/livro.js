import { resolveAccess, linkWithAccess } from './acesso.js';
import { decorateTeam } from './equipe.js';
import { query, submitAnswer, getCachedStatus, saveStatus } from './api.js';
const config = await fetch('../../enigmas.json').then(r => r.json()).then(items => items.filter(x => x.ativo));
const id = document.body.dataset.enigma;
const pos = config.findIndex(x => String(x.id) === id);
if (pos < 0) throw new Error(`Enigma não encontrado: ${id}`);
let session;
try { session = resolveAccess(); } catch (error) { console.error(error.message); }
if (!session) location.replace('../../index.html');
const $ = id => document.getElementById(id), item = config[pos];
$('page-count').textContent = `${pos + 1} de ${config.length}`;
$('book-title').textContent = item.titulo;
function showPoints(value) { $('enigma-points').textContent = value == null ? 'Pontuação indisponível' : `${Number(value)} ${Number(value) === 1 ? 'ponto' : 'pontos'}`; }
showPoints(item.pontos);
if (session) decorateTeam($('team-label'), session.team, `Equipe ${session.team}`);

// Preenche todos os menus, incluindo páginas antigas que usam IDs.
const navigation = {
  prev: { path: pos === 0 ? '../../indice.html' : `../${config[pos - 1].pasta}/`, label: pos === 0 ? '' : '← Anterior' },
  next: { path: pos === config.length - 1 ? '../../indice.html' : `../${config[pos + 1].pasta}/`, label: pos === config.length - 1 ? '' : 'Próximo →' },
  index: { path: '../../indice.html', label: 'Índice' }
};
for (const [name, entry] of Object.entries(navigation)) {
  const legacyId = name === 'index' ? 'index-link' : name;
  document.querySelectorAll(`[data-book-nav="${name}"], [id="${legacyId}"]`).forEach(element => {
    element.href = linkWithAccess(entry.path, session);
    element.textContent = entry.label;
  });
}

let locked = false, checking = false, sending = false, generation = 0, ownSubmitted = false;

function display(status) {
  const live = status.enigmas?.find(x => String(x.id) === id);
  if (live) showPoints(live.pontos);
  locked = !!status.submitted || !!(status.state && status.state !== 'receiving');
  $('lock-banner').hidden = !locked;
  $('lock-banner').textContent = status.submitted ? (ownSubmitted ? 'Resposta Enviada' : 'A resposta já foi enviada pela equipe!') : (locked ? 'O prazo para responder os enigmas acabou!' : '');
  $('submit-answer').hidden = locked;
  if (locked) $('message').textContent = '';
  $('submit-answer').disabled = locked || sending;
  document.querySelectorAll('[data-answer-input]').forEach(el => { el.disabled = locked; el.draggable = !locked; });
  document.dispatchEvent(new CustomEvent('book:lock', { detail: { locked } }));
}
export async function refreshStatus() {
  if (!session || checking || sending) return;
  checking = true; const snapshot = generation;
  try {
    const result = await query('status', { team: session.team, code: session.code, enigmaId: id });
    if (snapshot !== generation || sending) return;
    if (!result.ok) throw new Error(result.error);
    display(result);
  } catch (e) { if (snapshot !== generation || sending) return; $('message').textContent = `Status indisponível: ${e.message}`; $('submit-answer').disabled = true; }
  finally { checking = false; }
}
export async function send(answer) {
  if (locked || sending) return;
  sending = true; generation++;
  $('submit-answer').disabled = true; $('message').textContent = 'Enviando resposta...'; $('sending-indicator').hidden = false;
  try {
    const result = await submitAnswer(id, answer);
    ownSubmitted = result.accepted;
    $('message').textContent = '';
    display(result.status);
  } catch (e) {
    $('message').textContent = e.message;
    sending = false;
    $('submit-answer').disabled = locked;
    if(!locked)$('message').textContent += ' Se o envio não foi confirmado, volte ao índice para verificar antes de tentar novamente.';
  } finally { sending = false; $('sending-indicator').hidden = true; }
}
const cached=getCachedStatus();
display({...cached,submitted:!!cached?.answers?.[id]});
