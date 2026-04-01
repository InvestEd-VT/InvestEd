import api from './api';
import type { Stock, StockSearchResult, StockChartData } from '@/types';

type CacheEntry<T> = {
  data: T;
  expiresAt: number;
};

const searchCache = new Map<string, CacheEntry<StockSearchResult[]>>();
const detailCache = new Map<string, CacheEntry<Stock>>();
const historyCache = new Map<string, CacheEntry<StockChartData[]>>();
const searchInFlight = new Map<string, Promise<StockSearchResult[]>>();
const detailInFlight = new Map<string, Promise<Stock>>();
const historyInFlight = new Map<string, Promise<StockChartData[]>>();

const SEARCH_CACHE_TTL_MS = 30 * 60 * 1000;
const DETAIL_CACHE_TTL_MS = 30 * 60 * 1000;
const HISTORY_CACHE_TTL_MS = 30 * 60 * 1000;

const getCached = <T>(cache: Map<string, CacheEntry<T>>, key: string): T | null => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    cache.delete(key);
    return null;
  }
  return entry.data;
};

const setCached = <T>(cache: Map<string, CacheEntry<T>>, key: string, data: T, ttlMs: number) => {
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttlMs,
  });
};

const toISODate = (date: Date): string => date.toISOString().split('T')[0];

const resolveHistoryRange = (
  timeframe: string
): { from: string; to: string; timespan: 'day' | 'week' } => {
  const to = new Date();
  const from = new Date(to);

  switch (timeframe) {
    case '2d':
      // Pull a wider daily window for smoother chart interaction.
      from.setDate(to.getDate() - 10);
      return { from: toISODate(from), to: toISODate(to), timespan: 'day' };
    case '1w':
      from.setDate(to.getDate() - 7);
      return { from: toISODate(from), to: toISODate(to), timespan: 'day' };
    case '1m':
      from.setMonth(to.getMonth() - 1);
      return { from: toISODate(from), to: toISODate(to), timespan: 'day' };
    case '3m':
      from.setMonth(to.getMonth() - 3);
      return { from: toISODate(from), to: toISODate(to), timespan: 'week' };
    case '6m':
      from.setMonth(to.getMonth() - 6);
      return { from: toISODate(from), to: toISODate(to), timespan: 'week' };
    case '1y':
      from.setFullYear(to.getFullYear() - 1);
      return { from: toISODate(from), to: toISODate(to), timespan: 'week' };
    default:
      from.setDate(to.getDate() - 10);
      return { from: toISODate(from), to: toISODate(to), timespan: 'day' };
  }
};

interface BackendStockSearchItem {
  symbol?: string;
  ticker?: string;
  companyName?: string;
  name?: string;
  currentPrice?: number;
}

interface BackendStockSearchResponse {
  results?: BackendStockSearchItem[];
}

interface BackendTickerDetailResponse {
  ticker: string;
  name: string;
  market_cap?: number;
}

interface BackendPriceResponse {
  ticker: string;
  close: number;
  open: number;
  high: number;
  low: number;
  volume: number;
}

interface BackendHistoryBar {
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
  t: number;
}

interface BackendHistoryResponse {
  bars?: BackendHistoryBar[];
}

const stockService = {
  /**
   * Search for stocks by query string
   * Hits GET /api/v1/stocks/search?q={query}
   * Returns array of matching stocks with symbol, company name, and current price
   */
  search: async (query: string): Promise<StockSearchResult[]> => {
    const key = query.trim().toUpperCase();
    const cached = getCached(searchCache, key);
    if (cached) return cached;

    const inFlight = searchInFlight.get(key);
    if (inFlight) return inFlight;

    const request = (async () => {
      const response = await api.get('/stocks/search', { params: { q: query } });
      const data = response.data as BackendStockSearchResponse;
      const items = data.results ?? [];

      const normalized = items.map((item) => ({
        symbol: item.symbol ?? item.ticker ?? '',
        companyName: item.companyName ?? item.name ?? '',
        currentPrice: item.currentPrice ?? 0,
      }));

      setCached(searchCache, key, normalized, SEARCH_CACHE_TTL_MS);
      return normalized;
    })();

    searchInFlight.set(key, request);
    try {
      return await request;
    } finally {
      searchInFlight.delete(key);
    }
  },

  /**
   * Get detailed stock information by symbol
   * Uses both /stocks/{symbol} and /stocks/{symbol}/price and normalizes for UI
   */
  getDetail: async (symbol: string): Promise<Stock> => {
    const key = symbol.toUpperCase();
    const cached = getCached(detailCache, key);
    if (cached) return cached;

    const inFlight = detailInFlight.get(key);
    if (inFlight) return inFlight;

    const request = (async () => {
      const [detailResponse, priceResponse] = await Promise.all([
        api.get(`/stocks/${key}`),
        api.get(`/stocks/${key}/price`),
      ]);

      const detail = detailResponse.data as BackendTickerDetailResponse;
      const price = priceResponse.data as BackendPriceResponse;
      const change = price.close - price.open;
      const changePercent = price.open > 0 ? (change / price.open) * 100 : 0;

      const normalized: Stock = {
        symbol: detail.ticker,
        companyName: detail.name,
        currentPrice: price.close,
        priceChange: change,
        priceChangePercent: changePercent,
        volume: price.volume,
        marketCap: detail.market_cap ?? 0,
      };

      setCached(detailCache, key, normalized, DETAIL_CACHE_TTL_MS);
      return normalized;
    })();

    detailInFlight.set(key, request);
    try {
      return await request;
    } finally {
      detailInFlight.delete(key);
    }
  },

  /**
   * Get historical price data for a stock
   * Hits GET /api/v1/stocks/{symbol}/history with from/to/timespan
   */
  getHistory: async (symbol: string, timeframe: string = '2d'): Promise<StockChartData[]> => {
    const key = `${symbol.toUpperCase()}:${timeframe}`;
    const cached = getCached(historyCache, key);
    if (cached && cached.length > 0) return cached;

    const inFlight = historyInFlight.get(key);
    if (inFlight) return inFlight;

    const request = (async () => {
      const range = resolveHistoryRange(timeframe);
      const response = await api.get(`/stocks/${symbol.toUpperCase()}/history`, {
        params: {
          from: range.from,
          to: range.to,
          timespan: range.timespan,
        },
      });

      const data = response.data as BackendHistoryResponse;
      const normalized = (data.bars ?? []).map((bar) => ({
        date: new Date(bar.t),
        open: bar.o,
        high: bar.h,
        low: bar.l,
        close: bar.c,
        volume: bar.v,
      }));

      const finalData = normalized;

      if (finalData.length > 0) {
        setCached(historyCache, key, finalData, HISTORY_CACHE_TTL_MS);
      }
      return finalData;
    })();

    historyInFlight.set(key, request);
    try {
      return await request;
    } finally {
      historyInFlight.delete(key);
    }
  },

  /**
   * Get options chain for a specific stock
   * Hits GET /api/v1/stocks/{symbol}/options
   */
  getOptionsChain: (symbol: string): Promise<object> =>
    api.get(`/stocks/${symbol}/options`).then((response) => response.data),
};

export default stockService;
