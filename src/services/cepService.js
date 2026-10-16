import axios from 'axios';
import { normalizeCep } from './shippingService.js';

const VIACEP_URL = 'https://viacep.com.br/ws';

export async function buscarEnderecoPorCep(cep, signal) {
  const cepNormalizado = normalizeCep(cep);
  if (cepNormalizado.length !== 8) {
    throw new Error('Digite um CEP válido com 8 números.');
  }

  let response;
  try {
    response = await axios.get(
      `${VIACEP_URL}/${cepNormalizado}/json/`,
      { signal, timeout: 10000 },
    );
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new Error(
      'Não foi possível consultar o ViaCEP. Verifique sua conexão e tente novamente.',
      { cause: error },
    );
  }

  if (response.data.erro) {
    throw new Error('CEP não encontrado. Confira o número informado.');
  }

  return {
    cep: response.data.cep,
    logradouro: response.data.logradouro || '',
    bairro: response.data.bairro || '',
    cidade: response.data.localidade || '',
    estado: response.data.uf || '',
  };
}
