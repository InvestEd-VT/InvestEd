import api from './api';
import type { TradeRequest, TradeResponse } from '../types';

export const tradeService = {
  buyOption: async (data: TradeRequest): Promise<TradeResponse> => {
    const response = await api.post('/trade/options/buy', data);
    return response.data;
  },

  sellOption: async (data: TradeRequest): Promise<TradeResponse> => {
    const response = await api.post('/trade/options/sell', data);
    return response.data;
  },
};
