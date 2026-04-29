import api from './api';
import type { TradeRequest, TradeResponse } from '../types';

export interface TheoreticalPriceResponse {
  theoreticalPrice: number;
  stockPrice: number;
  iv: number;
}

export const tradeService = {
  buyOption: async (data: TradeRequest): Promise<TradeResponse> => {
    const response = await api.post('/trade/options/buy', data);
    return response.data;
  },

  sellOption: async (data: TradeRequest): Promise<TradeResponse> => {
    const response = await api.post('/trade/options/sell', data);
    return response.data;
  },

  getTheoreticalPrice: async (
    symbol: string,
    strikePrice: number,
    expirationDate: string,
    optionType: 'CALL' | 'PUT'
  ): Promise<TheoreticalPriceResponse> => {
    const response = await api.get('/trade/options/price', {
      params: { symbol, strikePrice, expirationDate, optionType },
    });
    return response.data;
  },
};
