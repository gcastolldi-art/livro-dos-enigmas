export function formatTen(values) {
  if (values.length !== 10 || values.some(value => !/^\d{1,2}$/.test(String(value).trim()))) throw new Error('Preencha as dez caixas com números de 01 a 10.');
  return values.map(value => String(value).trim().padStart(2, '0')).join('-');
}
