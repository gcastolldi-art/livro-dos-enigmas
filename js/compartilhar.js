import {resolveAccess,linkWithAccess} from './acesso.js';
import {decorateTeam} from './equipe.js';
import {drawQR} from './qr.js';
const $=id=>document.getElementById(id);
try{
 const access=resolveAccess();if(!access)throw new Error('Use o link da sua equipe para compartilhar o livro.');
 decorateTeam($('team-label'),access.team);
 const url=new URL('index.html',location.href);url.hash=new URLSearchParams({equipe:access.team,codigo:access.code}).toString();
 const source=new URL(location.href);for(const [key,value] of source.searchParams)if(key!=='equipe'&&key!=='codigo')url.searchParams.append(key,value);
 $('share-url').href=url.href;$('share-url').textContent=url.href;
 $('back').href=linkWithAccess('indice.html',access);
 drawQR($('qr'),url.href);$('qr').hidden=false;
}catch(error){$('message').textContent=error.message;$('back').href='indice.html';}
