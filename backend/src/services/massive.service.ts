import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

const BASE_URL = 'https://api.polygon.io';

type CacheEntry = {
  data: unknown;
  expiresAt: number;
};

const responseCache = new Map<string, CacheEntry>();
const pendingRequests = new Map<string, Promise<unknown>>();
const DEFAULT_CACHE_TTL_MS = 60 * 60 * 1000;

const buildCacheKey = (path: string, params: Record<string, string>): string => {
  const sorted = Object.entries(params).sort(([a], [b]) => a.localeCompare(b));
  return `${path}?${new URLSearchParams(sorted).toString()}`;
};

/**
 * Makes an authenticated request to the Massive (Polygon) API
 */
const massiveRequest = async <T>(
  path: string,
  params: Record<string, string> = {},
  cacheTtlMs: number = DEFAULT_CACHE_TTL_MS
): Promise<T> => {
  if (!env.MASSIVE_API_KEY) {
    throw new AppError('MASSIVE_API_KEY is not configured', 500);
  }

  const cacheKey = buildCacheKey(path, params);
  const now = Date.now();
  const cached = responseCache.get(cacheKey);

  if (cached && cached.expiresAt > now) {
    return cached.data as T;
  }

  const inFlight = pendingRequests.get(cacheKey);
  if (inFlight) {
    return (await inFlight) as T;
  }

  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set('apiKey', env.MASSIVE_API_KEY);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const requestPromise = (async () => {
    const response = await fetch(url.toString());

    if (response.status === 304 && cached) {
      return cached.data as T;
    }

    if (response.status === 429) {
      if (cached) {
        return cached.data as T;
      }
      throw new AppError('API rate limit exceeded. Please try again later.', 429);
    }

    if (!response.ok) {
      throw new AppError(
        `Massive API error: ${response.status} ${response.statusText}`,
        response.status
      );
    }

    const data = (await response.json()) as T;
    responseCache.set(cacheKey, {
      data,
      expiresAt: Date.now() + cacheTtlMs,
    });

    return data;
  })();

  pendingRequests.set(cacheKey, requestPromise as Promise<unknown>);

  try {
    return await requestPromise;
  } finally {
    pendingRequests.delete(cacheKey);
  }
};

// ─── Types ──────────────────────────────────────────────────────────────────

export interface StockSearchResult {
  ticker: string;
  name: string;
  market: string;
  type: string;
  active: boolean;
}

export interface TickerDetails {
  ticker: string;
  name: string;
  market_cap: number;
  description: string;
  homepage_url: string;
  primary_exchange: string;
  type: string;
  branding?: {
    logo_url: string;
    icon_url: string;
  };
}

export interface StockBar {
  o: number; // open
  h: number; // high
  l: number; // low
  c: number; // close
  v: number; // volume
  vw: number; // volume weighted average
  t: number; // timestamp
  n: number; // number of trades
}

export interface StockPrice {
  ticker: string;
  close: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  vwap: number;
  timestamp: number;
}

export interface OptionsContract {
  ticker: string;
  contract_type: string;
  strike_price: number;
  expiration_date: string;
  underlying_ticker: string;
  shares_per_contract: number;
}

// ─── Stock Endpoints ────────────────────────────────────────────────────────

/**
 * Search for stocks by name or ticker
 * INVESTED-111: Stock Search
 */
export const searchStocks = async (
  query: string,
  limit: number = 10
): Promise<StockSearchResult[]> => {
  const data = await massiveRequest<{ results: StockSearchResult[] }>('/v3/reference/tickers', {
    search: query,
    active: 'true',
    limit: String(limit),
    market: 'stocks',
  });
  return data.results || [];
};

/**
 * Get detailed info for a specific ticker
 */
export const getTickerDetails = async (symbol: string): Promise<TickerDetails> => {
  const data = await massiveRequest<{ results: TickerDetails }>(
    `/v3/reference/tickers/${symbol.toUpperCase()}`
  );
  return data.results;
};

/**
 * Get the previous day's price data for a stock
 * Used as the "current price" on the free tier
 */
export const getStockPrice = async (symbol: string): Promise<StockPrice> => {
  const data = await massiveRequest<{ results: StockBar[] }>(
    `/v2/aggs/ticker/${symbol.toUpperCase()}/prev`
  );

  if (!data.results || data.results.length === 0) {
    throw new AppError(`No price data found for ${symbol}`, 404);
  }

  const bar = data.results[0];
  return {
    ticker: symbol.toUpperCase(),
    close: bar.c,
    open: bar.o,
    high: bar.h,
    low: bar.l,
    volume: bar.v,
    vwap: bar.vw,
    timestamp: bar.t,
  };
};

/**
 * Get prices for multiple stocks at once
 */
export const getMultipleStockPrices = async (
  symbols: string[]
): Promise<Map<string, StockPrice>> => {
  const prices = new Map<string, StockPrice>();

  // Fetch in parallel (respecting rate limits with small batches)
  const batchSize = 5;
  for (let i = 0; i < symbols.length; i += batchSize) {
    const batch = symbols.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(async (symbol) => {
        try {
          const price = await getStockPrice(symbol);
          return { symbol: symbol.toUpperCase(), price };
        } catch {
          return { symbol: symbol.toUpperCase(), price: null };
        }
      })
    );

    for (const result of results) {
      if (result.price) {
        prices.set(result.symbol, result.price);
      }
    }
  }

  return prices;
};

/**
 * Get historical price bars for a stock
 * INVESTED-249: Historical Stock Data
 */
export const getStockHistory = async (
  symbol: string,
  from: string,
  to: string,
  timespan: 'minute' | 'hour' | 'day' | 'week' | 'month' = 'day',
  multiplier: number = 1
): Promise<StockBar[]> => {
  const data = await massiveRequest<{ results: StockBar[]; resultsCount: number }>(
    `/v2/aggs/ticker/${symbol.toUpperCase()}/range/${multiplier}/${timespan}/${from}/${to}`,
    { adjusted: 'true', sort: 'asc' }
  );
  return data.results || [];
};

// ─── Options Endpoints ──────────────────────────────────────────────────────

/**
 * Get options contracts for an underlying ticker
 * INVESTED-173: Options Chain
 */
export const getOptionsContracts = async (
  underlyingTicker: string,
  params: {
    contract_type?: 'call' | 'put';
    expiration_date?: string;
    strike_price?: number;
    expired?: boolean;
    limit?: number;
    order?: 'asc' | 'desc';
    sort?: 'expiration_date' | 'strike_price' | 'ticker';
  } = {}
): Promise<OptionsContract[]> => {
  const queryParams: Record<string, string> = {
    underlying_ticker: underlyingTicker.toUpperCase(),
    limit: String(params.limit || 50),
  };

  if (params.contract_type) queryParams.contract_type = params.contract_type;
  if (params.expiration_date) queryParams.expiration_date = params.expiration_date;
  if (params.strike_price) queryParams['strike_price'] = String(params.strike_price);
  if (params.expired !== undefined) queryParams.expired = String(params.expired);
  if (params.order) queryParams.order = params.order;
  if (params.sort) queryParams.sort = params.sort;

  const data = await massiveRequest<{ results: OptionsContract[] }>(
    '/v3/reference/options/contracts',
    queryParams
  );
  return data.results || [];
};

/**
 * Get options chain grouped by expiration date
 * Returns calls and puts organized for display
 */
export const getOptionsChain = async (
  underlyingTicker: string,
  expirationDate?: string
): Promise<{
  calls: OptionsContract[];
  puts: OptionsContract[];
  expirationDates: string[];
}> => {
  // First get available expiration dates
  const allContracts = await getOptionsContracts(underlyingTicker, {
    expiration_date: expirationDate,
    expired: false,
    limit: 250,
    sort: 'strike_price',
    order: 'asc',
  });

  const calls = allContracts.filter((c) => c.contract_type === 'call');
  const puts = allContracts.filter((c) => c.contract_type === 'put');
  const expirationDates = [...new Set(allContracts.map((c) => c.expiration_date))].sort();

  return { calls, puts, expirationDates };
};
