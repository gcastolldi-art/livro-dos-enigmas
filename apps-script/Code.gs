/**
 * Backend do Livro dos Enigmas. Crie este script VINCULADO a uma planilha
 * Google, execute configurarLivro uma vez e publique como aplicativo web.
 * Execute como: eu. Acesso: qualquer pessoa.
 */
const TEAMS = ['Vermelho','Laranja','Amarelo','Verde','Azul','Marinho','Roxo','Rosa','Marrom','Cinza','Preto','Branco'];
const HEADERS = ['Partida','Equipe','Enigma','Jogador','Resposta JSON','Registrado em','ID do envio'];

function configurarLivro() {
  const ss=SpreadsheetApp.getActiveSpreadsheet();
  let answers=ss.getSheetByName('Respostas');
  if (!answers) answers=ss.insertSheet('Respostas');
  if (answers.getLastRow()===0) answers.appendRow(HEADERS);
  let teams=ss.getSheetByName('Equipes');
  if (!teams) teams=ss.insertSheet('Equipes');
  if (teams.getLastRow()===0) {
    teams.appendRow(['Equipe','Código de acesso']);
    TEAMS.forEach(team=>teams.appendRow([team,Utilities.getUuid().replace(/-/g,'').slice(0,10).toUpperCase()]));
  }
  let enigmas=ss.getSheetByName('Enigmas');
  if (!enigmas) enigmas=ss.insertSheet('Enigmas');
  if (enigmas.getLastRow()===0) {
    enigmas.appendRow(['ID do enigma','Ativo']);
    [['selo-das-cores',true],['palavra-oculta',true],['ordem-dos-simbolos',true]].forEach(row=>enigmas.appendRow(row));
  }
  answers.setFrozenRows(1); teams.setFrozenRows(1); enigmas.setFrozenRows(1);
}

function doGet(e) {
  const p=e.parameter||{};
  const callback=p.callback||'';
  if (!/^__bookCallback_[0-9]+_[0-9]+$/.test(callback))
    return ContentService.createTextOutput('Callback inválido').setMimeType(ContentService.MimeType.TEXT);
  let result;
  try { result=status_(p); }
  catch(err) { result={ok:false,error:String(err.message||err)}; }
  const json=JSON.stringify(result).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
  return ContentService.createTextOutput(callback+'('+json+');').setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function doPost(e) {
  const p=e.parameter||{};
  let result;
  try {result=submit_(p);}
  catch(err){result={ok:false,error:String(err.message||err)};}
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

function requireTeam_(p) {
  const team=String(p.team||''), code=String(p.code||'').trim().toUpperCase();
  if (!TEAMS.includes(team)||!code) throw new Error('Equipe ou código inválido.');
  const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Equipes');
  if (!sh) throw new Error('Execute configurarLivro primeiro.');
  const rows=sh.getDataRange().getValues();
  if (!rows.slice(1).some(r=>r[0]===team&&String(r[1]).trim().toUpperCase()===code))
    throw new Error('Equipe ou código inválido.');
  return team;
}

function validEnigma_(id) {
  if (!/^[a-z0-9-]{1,60}$/.test(id)) return false;
  const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Enigmas');
  if (!sh) return false;
  return sh.getDataRange().getValues().slice(1).some(r=>r[0]===id&&r[1]!==false&&String(r[1]).toUpperCase()!=='FALSE');
}

function status_(p) {
  if (p.action!=='status') throw new Error('Ação inválida.');
  const team=requireTeam_(p), gameId=String(p.gameId||'');
  if (!/^[a-z0-9-]{1,60}$/.test(gameId)) throw new Error('Partida inválida.');
  const id=String(p.enigmaId||'');
  if (id&&!validEnigma_(id)) throw new Error('Enigma inválido.');
  const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Respostas');
  const rows=sh.getDataRange().getValues().slice(1);
  if (id) {
    const row=rows.find(r=>r[0]===gameId&&r[1]===team&&r[2]===id);
    return {ok:true,submitted:!!row,requestId:row?String(row[6]):null};
  }
  const answers={};
  rows.forEach(r=>{if(r[0]===gameId&&r[1]===team)answers[r[2]]=true;});
  return {ok:true,answers};
}

function safeCell_(value) {
  const s=String(value);
  return /^[=+@\-]/.test(s)?"'"+s:s;
}

function submit_(p) {
  if (p.action!=='submit') throw new Error('Ação inválida.');
  const team=requireTeam_(p), gameId=String(p.gameId||''), id=String(p.enigmaId||'');
  const player=String(p.player||'').trim(), raw=String(p.answer||''), requestId=String(p.requestId||'');
  if (!/^[a-z0-9-]{1,60}$/.test(gameId)||!validEnigma_(id)||!player||player.length>60||raw.length>3000||!raw||requestId.length>100||!requestId)
    throw new Error('Dados de resposta inválidos.');
  const answer=JSON.parse(raw);
  if (!answer||typeof answer!=='object'||Array.isArray(answer)||typeof answer.tipo!=='string'||!Object.prototype.hasOwnProperty.call(answer,'valor'))
    throw new Error('Formato de resposta inválido.');
  const lock=LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Respostas');
    const rows=sh.getDataRange().getValues().slice(1);
    const existing=rows.find(r=>r[0]===gameId&&r[1]===team&&r[2]===id);
    if(existing) return {ok:true,accepted:false};
    sh.appendRow([gameId,team,id,safeCell_(player),safeCell_(raw),new Date(),requestId]);
    SpreadsheetApp.flush();
    return {ok:true,accepted:true};
  } finally {lock.releaseLock();}
}
