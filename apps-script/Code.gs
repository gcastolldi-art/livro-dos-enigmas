/**
 * Backend do Livro dos Enigmas. Crie este script VINCULADO a uma planilha
 * Google, execute configurarLivro uma vez e publique como aplicativo web.
 * Execute como: eu. Acesso: qualquer pessoa.
 */
const TEAMS = ['Vermelho','Laranja','Amarelo','Verde','Azul','Marinho','Roxo','Rosa','Marrom','Turquesa','Preto','Branco'];
const HEADERS = ['Partida','Equipe','Enigma','Jogador','Resposta','Registrado em','ID do envio','Resultado','Pontos'];

function configurarLivro() {
  const active=SpreadsheetApp.getActiveSpreadsheet();
  if (!active) throw new Error('Abra este Apps Script pela planilha e execute configurarLivro.');
  PropertiesService.getScriptProperties().setProperty('BOOK_SPREADSHEET_ID',active.getId());
  const ss=SpreadsheetApp.openById(active.getId());
  let answers=ss.getSheetByName('Respostas');
  if (!answers) answers=ss.insertSheet('Respostas');
  if (answers.getLastRow()===0) answers.appendRow(HEADERS);
  else answers.getRange(1,1,1,HEADERS.length).setValues([HEADERS]);
  let teams=ss.getSheetByName('Equipes');
  if (!teams) teams=ss.insertSheet('Equipes');
  if (teams.getLastRow()===0) {
    teams.appendRow(['Equipe','Código de acesso']);
  }
  const existingTeams=new Set(teams.getDataRange().getValues().slice(1).map(r=>r[0]));
  TEAMS.filter(team=>!existingTeams.has(team)).forEach(team=>teams.appendRow([team,Utilities.getUuid().replace(/-/g,'').slice(0,10).toUpperCase()]));
  let enigmas=ss.getSheetByName('Enigmas');
  if (!enigmas) enigmas=ss.insertSheet('Enigmas');
  if (enigmas.getLastRow()===0) {
    enigmas.appendRow(['ID do enigma','Ativo']);
    [['selo-das-cores',true],['palavra-oculta',true],['ordem-dos-simbolos',true]].forEach(row=>enigmas.appendRow(row));
  }
  let key=ss.getSheetByName('Gabarito');
  if (!key) key=ss.insertSheet('Gabarito');
  if (key.getLastRow()===0) {
    key.appendRow(['ID do enigma','Tipo','Resposta(s) aceita(s)','Pontos','Observações']);
    key.appendRow(['selo-das-cores','escolha','labirinto',1,'Valor enviado pelo enigma 01']);
    key.appendRow(['palavra-oculta','texto','livro|o livro',1,'Alternativas separadas por |; acentos e maiúsculas ignorados']);
    key.appendRow(['ordem-dos-simbolos','ordem','eclipse,estrela,livro',1,'IDs das peças na ordem correta, separados por vírgula']);
  }
  if(!enigmas.getDataRange().getValues().slice(1).some(row=>row[0]==='sequencia-dos-sete'))enigmas.appendRow(['sequencia-dos-sete',true]);
  if(!key.getDataRange().getValues().slice(1).some(row=>row[0]==='sequencia-dos-sete'))key.appendRow(['sequencia-dos-sete','sequencia','01-05-03-08-07-06-02',1,'Sete números com dois dígitos separados por hífen']);
  if(answers.getLastRow()>1){const oldValues=answers.getRange(2,5,answers.getLastRow()-1,1).getValues();answers.getRange(2,5,oldValues.length,1).setValues(oldValues.map(r=>[safeCell_(answerText_(r[0]))]));}
  answers.setFrozenRows(1); teams.setFrozenRows(1); enigmas.setFrozenRows(1); key.setFrozenRows(1);
}

function livroSpreadsheet_() {
  const id=PropertiesService.getScriptProperties().getProperty('BOOK_SPREADSHEET_ID');
  if (!id) throw new Error('Execute configurarLivro no editor antes de publicar a nova versão.');
  return SpreadsheetApp.openById(id);
}

function doGet(e) {
  const p=(e&&e.parameter)||{};
  const callback=p.callback||'';
  if (!callback) {
    let health;
    try {
      const ss=livroSpreadsheet_();
      const ready=['Equipes','Enigmas','Respostas','Gabarito'].every(name=>!!ss.getSheetByName(name));
      health={ok:ready,version:'2.5',message:ready?'Conexão com a planilha funcionando.':'Execute configurarLivro para criar as abas.'};
    } catch(error) {health={ok:false,version:'2.5',error:String(error.message||error)};}
    return ContentService.createTextOutput(JSON.stringify(health)).setMimeType(ContentService.MimeType.JSON);
  }
  if (!/^__bookCallback_[0-9]+_[0-9]+$/.test(callback))
    return ContentService.createTextOutput('Callback inválido').setMimeType(ContentService.MimeType.TEXT);
  let result;
  try { result=p.action==='control'?control_(p):status_(p); }
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
  const sh=livroSpreadsheet_().getSheetByName('Equipes');
  if (!sh) throw new Error('Execute configurarLivro primeiro.');
  const rows=sh.getDataRange().getValues();
  if (!rows.slice(1).some(r=>r[0]===team&&String(r[1]).trim().toUpperCase()===code))
    throw new Error('Equipe ou código inválido.');
  return team;
}

function validEnigma_(id) {
  if (!/^[a-z0-9-]{1,60}$/.test(id)) return false;
  const sh=livroSpreadsheet_().getSheetByName('Enigmas');
  if (!sh) return false;
  return sh.getDataRange().getValues().slice(1).some(r=>r[0]===id&&r[1]!==false&&String(r[1]).toUpperCase()!=='FALSE');
}

function status_(p) {
  if (p.action!=='status') throw new Error('Ação inválida.');
  const team=requireTeam_(p), gameId=String(p.gameId||'');
  if (!/^[a-z0-9-]{1,60}$/.test(gameId)) throw new Error('Partida inválida.');
  const id=String(p.enigmaId||'');
  if (id&&!validEnigma_(id)) throw new Error('Enigma inválido.');
  const sh=livroSpreadsheet_().getSheetByName('Respostas');
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

function normalize_(value) {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().replace(/\s+/g,' ').toLowerCase();
}

function grade_(id,answer) {
  const sh=livroSpreadsheet_().getSheetByName('Gabarito');
  if(!sh) return {result:'PENDENTE',points:0};
  const row=sh.getDataRange().getValues().slice(1).find(r=>String(r[0])===id);
  if(!row||row[2]===''||row[2]===null||String(row[1]).toLowerCase()==='manual') return {result:'PENDENTE',points:0};
  const type=String(row[1]).toLowerCase();
  if (!['escolha','texto','ordem','sequencia'].includes(type)) return {result:'PENDENTE',points:0};
  const value=answerText_(answer);
  if (typeof value!=='string'||value.length>1000) return {result:'PENDENTE',points:0};
  const correct=String(row[2]).split('|').some(accepted=>normalize_(accepted)===normalize_(value));
  return {result:correct?'CORRETA':'INCORRETA',points:correct?(Number(row[3])||0):0};
}

// Execute após corrigir um gabarito para atualizar também respostas já gravadas.
function recalcularGabarito() {
  const sh=livroSpreadsheet_().getSheetByName('Respostas');
  if (!sh||sh.getLastRow()<2) return;
  const rows=sh.getRange(2,1,sh.getLastRow()-1,HEADERS.length).getValues();
  const grades=rows.map(r=>{
    try {const grade=grade_(String(r[2]),legacyValue_(r[4]));return [grade.result,grade.points];}
    catch(e){return ['PENDENTE',0];}
  });
  sh.getRange(2,8,grades.length,2).setValues(grades);
}

function submit_(p) {
  if (p.action!=='submit') throw new Error('Ação inválida.');
  const team=requireTeam_(p), gameId=String(p.gameId||''), id=String(p.enigmaId||'');
  const player=String(p.player||'').trim(), raw=String(p.answer||''), requestId=String(p.requestId||'');
  if (!/^[a-z0-9-]{1,60}$/.test(gameId)||!validEnigma_(id)||!player||player.length>60||raw.length>3000||!raw||requestId.length>100||!requestId)
    throw new Error('Dados de resposta inválidos.');
  const answer=JSON.parse(raw);
  if (answer===null || answer===undefined || !answerText_(answer).trim())
    throw new Error('Formato de resposta inválido.');
  const lock=LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const sh=livroSpreadsheet_().getSheetByName('Respostas');
    const rows=sh.getDataRange().getValues().slice(1);
    const existing=rows.find(r=>r[0]===gameId&&r[1]===team&&r[2]===id);
    if(existing) return {ok:true,accepted:false};
    const grade=grade_(id,answer);
    sh.appendRow([gameId,team,id,safeCell_(player),safeCell_(answerText_(answer)),new Date(),requestId,grade.result,grade.points]);
    SpreadsheetApp.flush();
    return {ok:true,accepted:true};
  } finally {lock.releaseLock();}
}

function legacyValue_(value){
  if(typeof value==='string'){try {const parsed=JSON.parse(value);if(parsed&&typeof parsed==='object'&&Object.prototype.hasOwnProperty.call(parsed,'valor'))return parsed.valor;}catch(e){}}
  if(value&&typeof value==='object'&&!Array.isArray(value)&&Object.prototype.hasOwnProperty.call(value,'valor'))return value.valor;
  return value;
}
function answerText_(answer){const value=legacyValue_(answer);if(Array.isArray(value))return value.map(x=>typeof x==='object'?JSON.stringify(x):String(x)).join(',');return value&&typeof value==='object'?JSON.stringify(value):String(value);}
function control_(p){
  const ss=livroSpreadsheet_();
  const gameId=String(p.gameId||'');if(!/^[a-z0-9-]{1,60}$/.test(gameId))throw new Error('Partida inválida.');
  const ids=ss.getSheetByName('Enigmas').getDataRange().getValues().slice(1).filter(r=>r[1]!==false&&String(r[1]).toUpperCase()!=='FALSE').map(r=>String(r[0]));
  const active=[...new Set(ids.filter(Boolean))],rows=ss.getSheetByName('Respostas').getDataRange().getValues().slice(1);
  const teams=TEAMS.map(team=>({team,answers:{},points:0,answered:0,complete:false,completedAt:null,completionSequence:null,completionOrder:null})),submissions=[];
  rows.forEach((r,index)=>{
    if(r[0]!==gameId||!active.includes(String(r[2])))return;const t=teams.find(t=>t.team===r[1]);if(!t||t.answers[r[2]])return;
    const at=new Date(r[5]).getTime();if(!Number.isFinite(at))return;
    const entry={enigmaId:String(r[2]),answer:answerText_(r[4]),result:String(r[7]||'PENDENTE'),points:Number(r[8])||0,at,sequence:index+1};t.answers[r[2]]=entry;t.points+=entry.points;t.answered++;submissions.push({team:t.team,...entry});
  });
  submissions.sort((a,b)=>a.at-b.at||a.sequence-b.sequence);const perQuestion={};
  submissions.forEach((entry,index)=>{entry.order=index+1;perQuestion[entry.enigmaId]=(perQuestion[entry.enigmaId]||0)+1;const target=teams.find(t=>t.team===entry.team).answers[entry.enigmaId];target.order=entry.order;target.questionOrder=perQuestion[entry.enigmaId];});
  teams.forEach(t=>{t.complete=active.length>0&&t.answered===active.length;if(t.complete){const last=Object.values(t.answers).sort((a,b)=>b.at-a.at||b.sequence-a.sequence)[0];t.completedAt=last.at;t.completionSequence=last.sequence;}});
  teams.filter(t=>t.complete).sort((a,b)=>a.completedAt-b.completedAt||a.completionSequence-b.completionSequence).forEach((t,i)=>t.completionOrder=i+1);
  teams.sort((a,b)=>b.points-a.points||(a.complete&&b.complete?(a.completedAt-b.completedAt||a.completionSequence-b.completionSequence):Number(b.complete)-Number(a.complete)));
  let rank=0,previous=null;teams.forEach((t,i)=>{if(!previous||t.points!==previous.points||t.complete!==previous.complete||(t.complete&&(t.completedAt!==previous.completedAt||t.completionSequence!==previous.completionSequence)))rank=i+1;t.rank=rank;previous=t;});
  return {ok:true,gameId,activeIds:active,teams,submissions,total:active.length,updatedAt:Date.now()};
}
