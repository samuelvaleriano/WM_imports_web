export const FREE_SHIPPING_THRESHOLD = 299;

const SHIPPING_OPTIONS = [
  { id: 'pac', name: 'PAC', price: 18.9, deliveryDays: 5 },
  { id: 'sedex', name: 'SEDEX', price: 32, deliveryDays: 2 },
];

export function normalizeCep(cep) {
  return String(cep ?? '').replace(/\D/g, '').slice(0, 8);
}

export function getShippingOptions(cep) {
  const normalizedCep = normalizeCep(cep);
  if (normalizedCep.length !== 8) {
    throw new Error('Informe um CEP válido com 8 dígitos.');
  }

  return SHIPPING_OPTIONS.map((option) => ({
    ...option,
    cep: normalizedCep,
  }));
}
