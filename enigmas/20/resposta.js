export function formatAnswer(raw){
 const value=String(raw).trim();
 if(!/^\d{1,6}$/.test(value))throw new Error('Digite apenas um número inteiro no campo da resposta.');
 return String(Number(value));
}
