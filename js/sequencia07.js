export function formatSeven(values) {
  if (values.length !== 7 || values.some(value => !/^\d{1,2}$/.test(String(value).trim()))) throw new Error('Preencha as sete caixas com números de 0 a 99.');
  return values.map(value => String(value).trim().padStart(2, '0')).join('-');
}
