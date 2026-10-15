export function formatScore(values) {
  if (values.length !== 2 || values.some(value => !/^\d{1,2}$/.test(String(value).trim()))) {
    throw new Error('Preencha os dois campos do placar com números de 0 a 99.');
  }
  return values.map(value => String(value).trim().padStart(1, '0')).join('-');
}
