/**
 * Backend do Livro dos Enigmas. Crie este script VINCULADO a uma planilha
 * Google, execute configurarLivro uma vez e publique como aplicativo web.
 * Execute como: eu. Acesso: qualquer pessoa.
 */
const TEAMS = ['Vermelha','Laranja','Amarela','Verde','Azul','Marinho','Roxa','Rosa','Marrom','Turquesa','Preta','Branca'];
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
  configurarCatalogo_(ss,answers);
  const enigmas=ss.getSheetByName('Enigmas'),key=ss.getSheetByName('Gabarito');
  if(answers.getLastRow()>1){const oldValues=answers.getRange(2,5,answers.getLastRow()-1,1).getValues();answers.getRange(2,5,oldValues.length,1).setValues(oldValues.map(r=>[safeCell_(answerText_(r[0]))]));}
  answers.setFrozenRows(1); teams.setFrozenRows(1); enigmas.setFrozenRows(1); key.setFrozenRows(1);
}


// IDs são permanentes: mudar a ordem ou o título não muda o ID.
const ENIGMAS_PADRAO = [
  {
    "id": 1,
    "nome": "O valor da garrafa",
    "tipo": "escolha",
    "resposta": "2",
    "pontos": 10,
    "aliases": [
      "o-valor-da-garrafa",
      "selo-das-cores"
    ]
  },
  {
    "id": 2,
    "nome": "Uma nova Terra",
    "tipo": "sequencia",
    "resposta": "06-03-08-10-04-09-05-01-07-02",
    "pontos": 10,
    "aliases": [
      "o-vilarejo",
      "palavra-oculta"
    ]
  },
  {
    "id": 3,
    "nome": "A ordem da história",
    "tipo": "ordem",
    "resposta": "",
    "pontos": 10,
    "aliases": [
      "ordem-dos-simbolos"
    ]
  },
  {
    "id": 4,
    "nome": "A senha do cofre",
    "tipo": "sequencia",
    "resposta": "13-21-13-21-32-21-12",
    "pontos": 10,
    "aliases": [
      "senha-do-cofre",
      "sequencia-dos-sete"
    ]
  },
  {
    "id": 5,
    "nome": "As abelhas",
    "tipo": "valor",
    "resposta": "",
    "pontos": 10,
    "aliases": []
  },
  {
    "id": 6,
    "nome": "A torta de frutas",
    "tipo": "valor",
    "resposta": "",
    "pontos": 10,
    "aliases": []
  },
  {
    "id": 7,
    "nome": "Vale o quanto pesa",
    "tipo": "valor",
    "resposta": "",
    "pontos": 10,
    "aliases": []
  },
  {
    "id": 8,
    "nome": "Sarau de leitura",
    "tipo": "escolha",
    "resposta": "",
    "pontos": 10,
    "aliases": []
  },
  {
    "id": 9,
    "nome": "O Calendário do Rei",
    "tipo": "escolha",
    "resposta": "",
    "pontos": 10,
    "aliases": []
  },
  {
    "id": 10,
    "nome": "Caça-palavras",
    "tipo": "texto",
    "resposta": "",
    "pontos": 10,
    "aliases": []
  },
  {
    "id": 11,
    "nome": "Pagando o pato",
    "tipo": "valor",
    "resposta": "",
    "pontos": 10,
    "aliases": []
  },
  {
    "id": 12,
    "nome": "Nazaré confusa",
    "tipo": "valor",
    "resposta": "",
    "pontos": 10,
    "aliases": []
  },
  {
    "id": 13,
    "nome": "A paisagem fragmentada",
    "tipo": "montar",
    "resposta": "1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,0",
    "pontos": 10,
    "aliases": []
  }
];
function enigmaId_(value){
  const text=String(value==null?'':value).trim();
  if(/^[0-9]+$/.test(text)&&Number.isSafeInteger(Number(text))&&Number(text)>0)return String(Number(text));
  const item=ENIGMAS_PADRAO.find(x=>x.aliases.includes(text));
  return item?String(item.id):'';
}
function registros_(sheet){
  if(!sheet||!sheet.getLastRow())return [];
  const rows=sheet.getDataRange().getValues(),headers=rows.shift().map(String);
  return rows.filter(r=>r.some(v=>v!=='' )).map(row=>Object.fromEntries(headers.map((h,i)=>[h,row[i]])));
}
function configurarCatalogo_(ss,answers){
  const previousEnigmas=registros_(ss.getSheetByName('Enigmas'));
  const previousKey=registros_(ss.getSheetByName('Gabarito'));
  const used=new Set(ENIGMAS_PADRAO.map(x=>x.id)),mapping={};
  [...previousEnigmas,...previousKey].forEach(r=>{const old=String(r['ID do enigma']);const id=enigmaId_(old);if(id){mapping[old]=Number(id);used.add(Number(id));}});
  let next=1;
  [...previousEnigmas,...previousKey].forEach(r=>{const old=String(r['ID do enigma']);if(!mapping[old]){while(used.has(next))next++;mapping[old]=next;used.add(next);}});
  function mapped(rows){const map=new Map();rows.forEach(r=>{const id=mapping[String(r['ID do enigma'])];if(map.has(id))throw new Error('IDs duplicados no catálogo: '+id+'. Corrija a planilha antes de configurar.');map.set(id,r);});return map;}
  const oldEnigmas=mapped(previousEnigmas),oldKey=mapped(previousKey);
  const ids=[...used].sort((a,b)=>a-b),enigmaRows=[],keyRows=[];
  ids.forEach(id=>{
    const def=ENIGMAS_PADRAO.find(x=>x.id===id),e=oldEnigmas.get(id),k=oldKey.get(id);
    const nome=String((e&&e['Nome do enigma'])||(k&&k['Nome do enigma'])||(def&&def.nome)||'Enigma '+id);
    const previousType=canonicalType_(k&&k['Tipo']||e&&e['Tipo']||def&&def.tipo||'manual');
    const tipo=def?def.tipo:previousType;
    enigmaRows.push([id,nome,e&&e['Ativo']!==undefined?e['Ativo']:true,tipo]);
    keyRows.push([id,nome,tipo,def&&def.tipo==='montar'&&previousType!=='montar'?def.resposta:def&&def.tipo==='localizar'&&previousType!=='localizar'?def.resposta:k?k['Resposta(s) aceita(s)']:(def?def.resposta:''),k?k['Pontos']:(def?def.pontos:0),k?k['Observações']||'':'']);
  });
  function write(name,headers,rows){let sheet=ss.getSheetByName(name);if(!sheet)sheet=ss.insertSheet(name);sheet.clearContents();sheet.getRange(1,1,rows.length+1,headers.length).setValues([headers,...rows]);sheet.setFrozenRows(1);}
  write('Enigmas',['ID do enigma','Nome do enigma','Ativo','Tipo'],enigmaRows);
  const validation=SpreadsheetApp.newDataValidation().requireValueInList(TIPOS_ENIGMA,true).setAllowInvalid(false).build();

  write('Gabarito',['ID do enigma','Nome do enigma','Tipo','Resposta(s) aceita(s)','Pontos','Observações'],keyRows);
  if(keyRows.length){ss.getSheetByName('Gabarito').getRange(2,3,keyRows.length,1).setDataValidation(validation);ss.getSheetByName('Enigmas').getRange(2,4,enigmaRows.length,1).setDataValidation(validation);}
  if(answers.getLastRow()>1){const rows=answers.getRange(2,3,answers.getLastRow()-1,1).getValues();answers.getRange(2,3,rows.length,1).setValues(rows.map(r=>[mapping[String(r[0])]||Number(enigmaId_(r[0]))||r[0]]));}
}
function catalogo_(){
  const ss=livroSpreadsheet_(),keys=registros_(ss.getSheetByName('Gabarito'));
  return registros_(ss.getSheetByName('Enigmas')).filter(r=>r['Ativo']!==false&&String(r['Ativo']).toUpperCase()!=='FALSE').map(r=>{
    const id=enigmaId_(r['ID do enigma']),key=keys.find(k=>enigmaId_(k['ID do enigma'])===id);
    return {id:Number(id),nome:String(r['Nome do enigma']||''),tipo:key?canonicalType_(key['Tipo']):canonicalType_(r['Tipo']),pontos:key?(canonicalType_(key['Tipo'])==='localizar'?Number(key['Resposta(s) aceita(s)'])||0:Number(key['Pontos'])||0):null};
  }).filter(r=>r.id>0);
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
      health={ok:ready,version:'2.8.2',message:ready?'Conexão com a planilha funcionando.':'Execute configurarLivro para criar as abas.'};
    } catch(error) {health={ok:false,version:'2.8.2',error:String(error.message||error)};}
    return ContentService.createTextOutput(JSON.stringify(health)).setMimeType(ContentService.MimeType.JSON);
  }
  if (!/^__bookCallback_[0-9]+_[0-9]+$/.test(callback))
    return ContentService.createTextOutput('Callback inválido').setMimeType(ContentService.MimeType.TEXT);
  let result;
  try { result=p.action==='submit'?submit_(p):p.action==='control'?control_(p):p.action==='setState'?setState_(p):p.action==='teamResults'?teamResults_(p):status_(p); }
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
  const canonical=enigmaId_(id);
  return !!canonical&&catalogo_().some(item=>String(item.id)===canonical);
}

function status_(p) {
  if (p.action!=='status') throw new Error('Ação inválida.');
  const team=requireTeam_(p), gameId=String(p.gameId||'');
  if (!/^[a-z0-9-]{1,60}$/.test(gameId)) throw new Error('Partida inválida.');
  const id=p.enigmaId?enigmaId_(p.enigmaId):'';
  if(p.enigmaId&&!id)throw new Error('Enigma inválido.');
  if (id&&!validEnigma_(id)) throw new Error('Enigma inválido.');
  const sh=livroSpreadsheet_().getSheetByName('Respostas');
  const rows=sh.getDataRange().getValues().slice(1);
  if (id) {
    const row=rows.find(r=>r[0]===gameId&&r[1]===team&&enigmaId_(r[2])===id);
    return {ok:true,state:gameState_(gameId),submitted:!!row,requestId:row?String(row[6]):null,enigmas:catalogo_()};
  }
  const answers={};
  rows.forEach(r=>{if(r[0]===gameId&&r[1]===team)answers[enigmaId_(r[2])]=true;});
  return {ok:true,state:gameState_(gameId),answers,enigmas:catalogo_()};
}

function safeCell_(value) {
  const s=String(value);
  return /^[=+@\-]/.test(s)?"'"+s:s;
}

function normalize_(value) {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().replace(/\s+/g,' ').toLowerCase();
}

const TIPOS_ENIGMA=['escolha','sequencia','ordem','texto','valor','localizar','montar'];
function canonicalType_(value){const name=normalize_(value);return {'multipla escolha':'escolha','ordenacao':'ordem','sequencia':'sequencia'}[name]||name;}
function numericValue_(value){const text=String(value).trim().replace(',','.');return /^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/.test(text)&&Number.isFinite(Number(text))?Number(text):null;}
function grade_(id,answer){
  const row=registros_(livroSpreadsheet_().getSheetByName('Gabarito')).find(r=>enigmaId_(r['ID do enigma'])===enigmaId_(id));
  if(!row||row['Resposta(s) aceita(s)']===''||row['Resposta(s) aceita(s)']==null)return {result:'PENDENTE',points:0};
  const type=canonicalType_(row['Tipo']),value=answerText_(answer);
  if(!TIPOS_ENIGMA.includes(type))return {result:'PENDENTE',points:0};
  if(value.length>1000)return {result:'INVALIDA',points:0};
  if(type==='montar'){
    const parts=value.split(',').map(x=>x.trim());
    if(parts.length!==25||parts.some(x=>!/^\d+$/.test(x)))return {result:'INVALIDA',points:0};
    const pieces=parts.map(Number);
    if(new Set(pieces).size!==25||pieces.some(n=>n<0||n>24))return {result:'INVALIDA',points:0};
    const correct=pieces.every((n,i)=>n===(i+1)%25);
    return {result:correct?'CORRETA':'INCORRETA',points:correct?(Number(row['Pontos'])||0):0};
  }
  if(type==='localizar'){
    const max=numericValue_(row['Resposta(s) aceita(s)']),count=numericValue_(value);
    if(max===null||!Number.isSafeInteger(max)||max<1)return {result:'PENDENTE',points:0};
    if(count===null||!Number.isSafeInteger(count)||count<0||count>max)return {result:'INVALIDA',points:0};
    return {result:count===max?'CORRETA':count>0?'PARCIAL':'INCORRETA',points:count};
  }
  const accepted=String(row['Resposta(s) aceita(s)']).split('|');
  let correct;
  if(type==='valor'){
    const number=numericValue_(value);if(number===null)return {result:'INVALIDA',points:0};
    correct=accepted.some(a=>numericValue_(a)!==null&&numericValue_(a)===number);
  }else{
    const canonical=v=>type==='sequencia'?String(v).trim().split('-').map(x=>/^\d+$/.test(x.trim())?String(Number(x.trim())):x.trim()).join('-'):type==='ordem'?String(v).split(',').map(normalize_).join(','):normalize_(v);
    correct=accepted.some(a=>canonical(a)===canonical(value));
  }
  return {result:correct?'CORRETA':'INCORRETA',points:correct?(Number(row['Pontos'])||0):0};
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
  const team=requireTeam_(p), gameId=String(p.gameId||''), id=enigmaId_(p.enigmaId);
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
    const existing=rows.find(r=>r[0]===gameId&&r[1]===team&&enigmaId_(r[2])===id);
    if(existing) return {ok:true,submitted:true,accepted:String(existing[6])===requestId,requestId:String(existing[6])};
    if(gameState_(gameId)!=='receiving')throw new Error('O prazo para responder os enigmas acabou!');
    const grade=grade_(id,answer);
    if(grade.result==='INVALIDA')throw new Error('Resposta inválida para o tipo do enigma ou fora do limite do gabarito.');
    sh.appendRow([gameId,team,Number(id),safeCell_(player),safeCell_(answerText_(answer)),new Date(),requestId,grade.result,grade.points]);
    SpreadsheetApp.flush();
    return {ok:true,submitted:true,accepted:true,requestId};
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
  const ids=catalogo_().map(item=>String(item.id));
  const active=[...new Set(ids)],rows=ss.getSheetByName('Respostas').getDataRange().getValues().slice(1);
  const teams=TEAMS.map(team=>({team,answers:{},points:0,answered:0,complete:false,completedAt:null,completionSequence:null,completionOrder:null})),submissions=[];
  rows.forEach((r,index)=>{
    if(r[0]!==gameId||!active.includes(enigmaId_(r[2])))return;const t=teams.find(t=>t.team===r[1]);if(!t||t.answers[enigmaId_(r[2])])return;
    const at=new Date(r[5]).getTime();if(!Number.isFinite(at))return;
    const entry={enigmaId:enigmaId_(r[2]),answer:answerText_(r[4]),result:String(r[7]||'PENDENTE'),points:Number(r[8])||0,at,sequence:index+1};t.answers[enigmaId_(r[2])]=entry;t.points+=entry.points;t.answered++;submissions.push({team:t.team,...entry});
  });
  submissions.sort((a,b)=>a.at-b.at||a.sequence-b.sequence);const perQuestion={};
  submissions.forEach((entry,index)=>{entry.order=index+1;perQuestion[entry.enigmaId]=(perQuestion[entry.enigmaId]||0)+1;const target=teams.find(t=>t.team===entry.team).answers[entry.enigmaId];target.order=entry.order;target.questionOrder=perQuestion[entry.enigmaId];});
  teams.forEach(t=>{t.complete=active.length>0&&t.answered===active.length;if(t.complete){const last=Object.values(t.answers).sort((a,b)=>b.at-a.at||b.sequence-a.sequence)[0];t.completedAt=last.at;t.completionSequence=last.sequence;}});
  teams.filter(t=>t.complete).sort((a,b)=>a.completedAt-b.completedAt||a.completionSequence-b.completionSequence).forEach((t,i)=>t.completionOrder=i+1);
  teams.sort((a,b)=>b.points-a.points||(a.complete&&b.complete?(a.completedAt-b.completedAt||a.completionSequence-b.completionSequence):Number(b.complete)-Number(a.complete)));
  let rank=0,previous=null;teams.forEach((t,i)=>{if(!previous||t.points!==previous.points||t.complete!==previous.complete||(t.complete&&(t.completedAt!==previous.completedAt||t.completionSequence!==previous.completionSequence)))rank=i+1;t.rank=rank;previous=t;});
  return {ok:true,state:gameState_(gameId),gameId,activeIds:active,teams,submissions,total:active.length,updatedAt:Date.now()};
}

// Estado isolado por partida; usa a mesma trava da gravação das respostas.
function stateKey_(gameId){if(!/^[a-z0-9-]{1,60}$/.test(String(gameId||'')))throw new Error('Partida inválida.');return 'BOOK_STATE_'+gameId;}
function gameState_(gameId){return PropertiesService.getScriptProperties().getProperty(stateKey_(gameId))||'receiving';}
function setState_(p){
  const key=stateKey_(p.gameId),state=String(p.state||'');
  if(!['receiving','blocked','revealed'].includes(state))throw new Error('Estado inválido.');
  const lock=LockService.getScriptLock();lock.waitLock(15000);
  try{PropertiesService.getScriptProperties().setProperty(key,state);return {ok:true,state};}finally{lock.releaseLock();}
}
function teamResults_(p){
  const team=requireTeam_(p);
  if(gameState_(p.gameId)!=='revealed')throw new Error('As respostas ainda não foram liberadas.');
  const data=control_(p),own=data.teams.find(t=>t.team===team);
  const keys=registros_(livroSpreadsheet_().getSheetByName('Gabarito'));
  const items=catalogo_().map(item=>{
    const key=keys.find(k=>enigmaId_(k['ID do enigma'])===String(item.id));
    const answer=own.answers[String(item.id)];
    const grade=answer?grade_(item.id,answer.answer):null;
    return {id:item.id,nome:item.nome,pontos:item.pontos,answer:answer?answer.answer:null,
      gabarito:key?String(key['Resposta(s) aceita(s)']||''):'',result:grade?grade.result:'NAO_RESPONDIDA',points:grade?grade.points:0};
  });
  return {ok:true,team,items,points:items.reduce((sum,item)=>sum+item.points,0)};
}

// Execute UMA VEZ para aplicar os 10 pontos solicitados na atualização.
// configurarLivro preserva os pesos que forem ajustados depois.
function aplicarAtualizacao282(){
  configurarLivro();
  const sheet=livroSpreadsheet_().getSheetByName('Gabarito');
  if(sheet.getLastRow()<2)return;
  const rows=sheet.getRange(2,1,sheet.getLastRow()-1,6).getValues();
  rows.forEach((row,i)=>{if(ENIGMAS_PADRAO.some(x=>String(x.id)===enigmaId_(row[0])))sheet.getRange(i+2,5).setValue(10);});
  recalcularGabarito();
}
