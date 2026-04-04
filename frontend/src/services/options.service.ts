import api from './api';
import type { OptionsChainResponse } from '../types';

export const optionsService = {
  getChain: async (symbol: string, expirationDate?: string): Promise<OptionsChainResponse> => {
    const params = expirationDate ? `?expiration_date=${expirationDate}` : '';
    const { data } = await api.get(`/options/chain/${symbol}${params}`);
    return data;
  },
};
