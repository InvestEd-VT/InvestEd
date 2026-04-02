import { create } from 'zustand';
import type { PortfolioResponse } from '../types';
import portfolioService from '../services/portfolio.service';
import stockService from '../services/stock.service';
import { priceOption } from '../utils/options';

interface PortfolioState {
  data: PortfolioResponse | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
  staleTime: number;
  fetchPortfolio: (options?: { force?: boolean }) => Promise<void>;
  clearError: () => void;
}

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  data: null,
  isLoading: false,
  error: null,
  lastFetched: null,
  staleTime: 30 * 1000,

  clearError: () => set({ error: null }),

  fetchPortfolio: async (options = { force: false }) => {
    const { force } = options as { force: boolean };
    if (get().isLoading) return;

    const { lastFetched, staleTime } = get();
    const now = Date.now();
    if (!force && lastFetched && now - lastFetched < staleTime) return;

    set({ isLoading: true, error: null });
    try {
      const data = await portfolioService.getPortfolio();

      // Enrich positions with live P&L using Black-Scholes
      if (data.positions.length > 0) {
        const symbols = [...new Set(data.positions.map((p) => p.symbol))];
        const prices = new Map<string, number>();

        for (const sym of symbols) {
          try {
            const detail = await stockService.getDetail(sym);
            prices.set(sym, detail.currentPrice);
          } catch { /* rate limited */ }
        }

        let totalLiveValue = 0;
        for (const pos of data.positions) {
          const stockPrice = prices.get(pos.symbol);
          if (stockPrice && pos.strikePrice && pos.optionType && pos.expirationDate) {
            const type = pos.optionType.toLowerCase() as 'call' | 'put';
            const expStr = (pos.expirationDate as string).split('T')[0];
            const livePrice = priceOption(stockPrice, pos.strikePrice, expStr, type, pos.symbol);
            pos.currentPrice = livePrice;
            pos.marketValue = livePrice * pos.quantity * 100;
            pos.costBasis = pos.avgCost * pos.quantity * 100;
            pos.unrealizedPnL = pos.marketValue - pos.costBasis;
            pos.unrealizedPnLPercent = pos.costBasis > 0 ? (pos.unrealizedPnL / pos.costBasis) * 100 : 0;
            totalLiveValue += pos.marketValue;
          } else {
            totalLiveValue += (pos.marketValue ?? pos.avgCost * pos.quantity * 100);
          }
        }

        data.positionsValue = totalLiveValue;
        data.totalValue = data.cashBalance + totalLiveValue;
        data.totalPnL = data.totalValue - 10000; // vs starting $10k
        data.totalPnLPercent = (data.totalPnL / 10000) * 100;
      }

      set({ data, isLoading: false, lastFetched: Date.now() });
    } catch (err: unknown) {
      console.error('Failed to fetch portfolio', err);
      const message = (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message
        || (err as { message?: string })?.message
        || 'Failed to load portfolio';
      set({ error: message, isLoading: false });
    }
  },
}));

export default usePortfolioStore;
