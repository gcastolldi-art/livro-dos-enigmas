// Valores enviados em ordem numérica, sem depender da ordem dos cliques.
export function serializeSelection(values){
 return [...new Set(values.map(Number))]
  .filter(value=>Number.isInteger(value)&&value>=1&&value<=10)
  .sort((a,b)=>a-b)
  .join('-');
}
