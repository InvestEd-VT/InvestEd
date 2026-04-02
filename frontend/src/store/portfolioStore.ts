import { create } from 'zustand';
import type { PortfolioResponse } from '../types';
import portfolioService from '../services/portfolio.service';

interface PortfolioState {
  data: PortfolioResponse | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
  staleTime: number; // milliseconds
  fetchPortfolio: (options?: { force?: boolean }) => Promise<void>;
  clearError: () => void;
}

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  data: null,
  isLoading: false,
  error: null,
  lastFetched: null,
  // default stale time 30 seconds
  staleTime: 30 * 1000,

  clearError: () => set({ error: null }),

  fetchPortfolio: async (options = { force: false }) => {
    const { force } = options as { force: boolean };

    // Avoid concurrent fetches
    if (get().isLoading) return;

    const { lastFetched, staleTime } = get();
    const now = Date.now();

    // If not forced and we fetched recently, skip
    if (!force && lastFetched && now - lastFetched < staleTime) {
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const data = await portfolioService.getPortfolio();
      set({ data, isLoading: false, lastFetched: Date.now() });
    } catch (err: any) {
      console.error('Failed to fetch portfolio', err);
      const message = err?.response?.data?.message || err?.message || 'Failed to load portfolio';
      // If in dev mode, provide a local mock so UI still shows realistic values
      if (import.meta.env.DEV) {
        const mock: PortfolioResponse = {
          id: 'mock-portfolio-1',
          name: 'Mock Portfolio',
          cashBalance: 5234.56,
          positionsValue: 4765.44,
          totalValue: 10000.0,
          totalPnL: 0,
          totalPnLPercent: 0,
          positions: [
            {
              id: 'pos-1',
              symbol: 'AAPL',
              quantity: 10,
              avgCost: 150,
              positionType: 'STOCK',
              currentPrice: 155,
              marketValue: 1550,
              costBasis: 1500,
              unrealizedPnL: 50,
              unrealizedPnLPercent: 3.33,
            },
            {
              id: 'pos-2',
              symbol: 'TSLA230917C700',
              quantity: 1,
              avgCost: 20,
              positionType: 'OPTION',
              optionType: 'CALL',
              strikePrice: 700,
              currentPrice: 25,
              marketValue: 2500,
              costBasis: 2000,
              unrealizedPnL: 500,
              unrealizedPnLPercent: 25,
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set({ data: mock, isLoading: false, lastFetched: Date.now(), error: null });
        return;
      }

      set({ error: message, isLoading: false });
    }
  },
}));

export default usePortfolioStore;
