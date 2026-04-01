import api from './api';
import type { PortfolioResponse } from '../types';

const portfolioService = {
  /**
   * GET /api/v1/portfolio
   */
  getPortfolio: async (): Promise<PortfolioResponse> =>
    api.get('/portfolio').then((res) => res.data),

  /**
   * GET /api/v1/portfolio/history?period=30d
   * period: '7d' | '30d' | '90d' | '1y' | 'all'
   */
  getPortfolioHistory: async (period = '30d') => {
    try {
      const res = await api.get(`/portfolio/history?period=${encodeURIComponent(period)}`);
      return res.data;
    } catch (err) {
      // If running in dev, return a mock history so charts can render while backend is offline
      if (import.meta.env.DEV) {
        const periodMap: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90, '1y': 365, all: 90 };
        const days = periodMap[period] || 30;
        const now = new Date();
        const history = Array.from({ length: days }).map((_, i) => {
          const d = new Date(now);
          d.setDate(now.getDate() - (days - i - 1));
          // create a gentle oscillating balance around $10k
          const value = 10000 + Math.round(Math.sin(i / 3) * 300 + (i - days / 2) * 2);
          return { date: d.toISOString(), cashBalance: value };
        });

        return { history, currentCash: history[history.length - 1]?.cashBalance ?? 10000 };
      }

      throw err;
    }
  },
};

export default portfolioService;
