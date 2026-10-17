export const SECRET_NUMBER=32; // Altere também o gabarito no Apps Script.
export const MAX_ATTEMPTS=7;
export function initialState(){return {attempts:0,guesses:[],pending:null,confirmed:false};}
export function play(state,number){
 if(state.pending!==null||state.confirmed||state.attempts>=MAX_ATTEMPTS)return {state,kind:'blocked'};
 if(!Number.isInteger(number)||number<1||number>99)return {state,kind:'invalid'};
 const next={...state,attempts:state.attempts+1,guesses:[...state.guesses,number]};
 if(number===SECRET_NUMBER)return {state:{...next,pending:String(number)},kind:'correct'};
 if(next.attempts===MAX_ATTEMPTS)return {state:{...next,pending:'00'},kind:'exhausted'};
 return {state:next,kind:number<SECRET_NUMBER?'lower':'higher'};
}
