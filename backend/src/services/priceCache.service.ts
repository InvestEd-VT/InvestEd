import redisClient from '../config/redis.js';
import logger from '../config/logger.js';
import * as massiveService from './massive.service.js';

const STOCK_CACHE_TTL = 15; // 15 seconds
const OPTIONS_CACHE_TTL = 15; // 15 seconds

interface CachedPrice {
  symbol: string;
  price: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: number;
}

/**
 * INVESTED-213: Cache stock prices with 15 second TTL
 */
export async function cacheStockPrice(symbol: string, data: CachedPrice): Promise<void> {
  try {
    await redisClient.setEx(
      `price:stock:${symbol.toUpperCase()}`,
      STOCK_CACHE_TTL,
      JSON.stringify(data)
    );
  } catch (err) {
    logger.warn('Failed to cache stock price', { symbol, error: (err as Error).message });
  }
}

/**
 * INVESTED-212: Cache options prices with 15 second TTL
 */
export async function cacheOptionPrice(contractSymbol: string, price: number): Promise<void> {
  try {
    await redisClient.setEx(
      `price:option:${contractSymbol}`,
      OPTIONS_CACHE_TTL,
      JSON.stringify({ price, timestamp: Date.now() })
    );
  } catch (err) {
    logger.warn('Failed to cache option price', { contractSymbol, error: (err as Error).message });
  }
}

/**
 * INVESTED-214: Serve cached prices to reduce API calls
 */
export async function getCachedStockPrice(symbol: string): Promise<CachedPrice | null> {
  try {
    const cached = await redisClient.get(`price:stock:${symbol.toUpperCase()}`);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

export async function getCachedOptionPrice(
  contractSymbol: string
): Promise<{ price: number; timestamp: number } | null> {
  try {
    const cached = await redisClient.get(`price:option:${contractSymbol}`);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

/**
 * INVESTED-215: Invalidate cache on websocket price update
 */
export async function invalidateStockPrice(symbol: string): Promise<void> {
  await redisClient.del(`price:stock:${symbol.toUpperCase()}`);
}

/**
 * Fetch price from cache first, fall back to API if cache miss.
 * Updates cache on fetch.
 */
export async function getStockPriceWithCache(symbol: string): Promise<CachedPrice> {
  // Try cache first
  const cached = await getCachedStockPrice(symbol);
  if (cached) return cached;

  // Cache miss — fetch from Polygon API
  const fresh = await massiveService.getStockPrice(symbol);
  const priceData: CachedPrice = {
    symbol: symbol.toUpperCase(),
    price: fresh.close,
    open: fresh.open,
    high: fresh.high,
    low: fresh.low,
    close: fresh.close,
    volume: fresh.volume,
    timestamp: Date.now(),
  };

  await cacheStockPrice(symbol, priceData);
  return priceData;
}

/**
 * Batch refresh prices for a list of symbols and cache them.
 * Used by the WebSocket price broadcast loop.
 */
export async function refreshPrices(symbols: string[]): Promise<Map<string, CachedPrice>> {
  const results = new Map<string, CachedPrice>();
  if (!symbols.length) return results;

  const prices = await massiveService.getMultipleStockPrices(symbols);

  for (const [symbol, data] of Object.entries(prices)) {
    const cached: CachedPrice = {
      symbol: symbol.toUpperCase(),
      price: data.close,
      open: data.open,
      high: data.high,
      low: data.low,
      close: data.close,
      volume: data.volume,
      timestamp: Date.now(),
    };
    await cacheStockPrice(symbol, cached);
    results.set(symbol.toUpperCase(), cached);
  }

  return results;
}
