import * as massiveService from './massive.service.js';
import logger from '../config/logger.js';

// ─── Math helpers (ported from frontend options.ts) ─────────────────────────

function cdf(x: number): number {
  const a1 = 0.254829592,
    a2 = -0.284496736,
    a3 = 1.421413741;
  const a4 = -1.453152027,
    a5 = 1.061405429,
    p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x) / Math.SQRT2;
  const t = 1.0 / (1.0 + p * ax);
  const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax);
  return 0.5 * (1.0 + sign * y);
}

const RISK_FREE_RATE = 0.043;

const DIVIDEND_YIELDS: Record<string, number> = {
  SPY: 0.013,
  QQQ: 0.006,
  IWM: 0.012,
  DIA: 0.018,
  AAPL: 0.005,
  MSFT: 0.007,
  GOOGL: 0.005,
  AMZN: 0.0,
  META: 0.004,
  TSLA: 0.0,
  NVDA: 0.0,
  AMD: 0.0,
  NFLX: 0.0,
  JPM: 0.022,
  BAC: 0.025,
  WMT: 0.013,
  KO: 0.028,
  PEP: 0.026,
  JNJ: 0.03,
  V: 0.007,
  MA: 0.005,
  COIN: 0.0,
  MARA: 0.0,
};

// ─── Volatility ─────────────────────────────────────────────────────────────

function computeHistoricalVolatility(closes: number[]): number {
  if (closes.length < 5) return 0.3;
  const logReturns: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    if (closes[i] > 0 && closes[i - 1] > 0) {
      logReturns.push(Math.log(closes[i] / closes[i - 1]));
    }
  }
  if (logReturns.length < 3) return 0.3;
  const mean = logReturns.reduce((s, r) => s + r, 0) / logReturns.length;
  const variance = logReturns.reduce((s, r) => s + (r - mean) ** 2, 0) / (logReturns.length - 1);
  return Math.max(0.08, Math.min(2.0, Math.sqrt(variance) * Math.sqrt(252)));
}

function estimateHV(stockPrice: number): number {
  if (stockPrice > 500) return 0.22;
  if (stockPrice > 200) return 0.28;
  if (stockPrice > 100) return 0.32;
  if (stockPrice > 50) return 0.38;
  if (stockPrice > 20) return 0.45;
  return 0.55;
}

// ─── IV adjustment (matches frontend logic) ──────────────────────────────────

function getSkewParams(baseHV: number): { slope: number; curve: number } {
  if (baseHV > 0.5) return { slope: -0.08, curve: 0.14 };
  if (baseHV > 0.3) return { slope: -0.12, curve: 0.1 };
  if (baseHV > 0.2) return { slope: -0.15, curve: 0.08 };
  return { slope: -0.2, curve: 0.1 };
}

function getAdjustedIV(
  stockPrice: number,
  strikePrice: number,
  dte: number,
  baseHV: number
): number {
  const ivPremium = 1.15;
  const baseIV = baseHV * ivPremium;
  const moneyness = (strikePrice - stockPrice) / stockPrice;
  const { slope, curve } = getSkewParams(baseHV);
  const skewAdj = slope * moneyness + curve * moneyness * moneyness;

  const clampedDte = Math.max(0.25, dte);
  let termMultiplier: number;
  if (clampedDte <= 3) {
    termMultiplier = 1.0 + (0.15 * (3 - clampedDte)) / 3;
  } else if (clampedDte <= 7) {
    termMultiplier = 1.0 + (0.05 * (7 - clampedDte)) / 4;
  } else {
    termMultiplier = Math.pow(30 / clampedDte, 0.06);
  }

  return Math.max(0.05, Math.min(2.0, baseIV * termMultiplier + skewAdj));
}

// ─── Black-Scholes ──────────────────────────────────────────────────────────

function bsPrice(
  S: number,
  K: number,
  T: number,
  r: number,
  q: number,
  sigma: number,
  type: 'call' | 'put'
): number {
  if (T <= 0) return type === 'call' ? Math.max(0, S - K) : Math.max(0, K - S);
  const sqrtT = Math.sqrt(T);
  const d1 = (Math.log(S / K) + (r - q + (sigma * sigma) / 2) * T) / (sigma * sqrtT);
  const d2 = d1 - sigma * sqrtT;
  if (type === 'call') {
    return S * Math.exp(-q * T) * cdf(d1) - K * Math.exp(-r * T) * cdf(d2);
  }
  return K * Math.exp(-r * T) * cdf(-d2) - S * Math.exp(-q * T) * cdf(-d1);
}

// ─── Price Validation ───────────────────────────────────────────────────────

export interface PriceValidationResult {
  isValid: boolean;
  theoreticalPrice: number;
  minPrice: number;
  maxPrice: number;
  submittedPrice: number;
  tolerance: number;
  reason?: string;
}

/**
 * Validate a submitted trade price against the theoretical Black-Scholes price.
 * Fetches real market data to compute the theoretical, then checks if the
 * submitted price falls within a DTE-based tolerance band.
 */
export async function validateTradePrice(
  symbol: string,
  strikePrice: number,
  expirationDate: string,
  optionType: 'CALL' | 'PUT',
  submittedPrice: number
): Promise<PriceValidationResult> {
  // 1. Fetch current stock price
  const stockPrice = await massiveService.getStockPrice(symbol);
  const currentPrice = stockPrice.close;

  // 2. Get historical volatility
  let hv: number;
  try {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 35);
    const bars = await massiveService.getStockHistory(
      symbol,
      from.toISOString().split('T')[0],
      to.toISOString().split('T')[0],
      'day'
    );
    if (bars && bars.length >= 5) {
      const closes = bars.map((b: { c: number }) => b.c);
      hv = computeHistoricalVolatility(closes);
    } else {
      hv = estimateHV(currentPrice);
    }
  } catch {
    hv = estimateHV(currentPrice);
  }

  // 3. Calculate theoretical price
  const expiry = new Date(expirationDate + 'T16:00:00');
  const now = new Date();
  const T = Math.max(0, (expiry.getTime() - now.getTime()) / (365 * 24 * 60 * 60 * 1000));
  const dte = Math.max(0, Math.round((expiry.getTime() - now.setHours(0, 0, 0, 0)) / 86400000));
  const type = optionType.toLowerCase() as 'call' | 'put';
  const q = DIVIDEND_YIELDS[symbol.toUpperCase()] ?? 0;
  const sigma = getAdjustedIV(currentPrice, strikePrice, dte, hv);
  const theoretical = Math.max(
    0.01,
    Math.round(bsPrice(currentPrice, strikePrice, T, RISK_FREE_RATE, q, sigma, type) * 100) / 100
  );

  // 4. DTE-based tolerance (wider for near-expiration due to gamma)
  let tolerance: number;
  if (dte <= 3)
    tolerance = 0.5; // ±50% for 0-3 DTE
  else if (dte <= 7)
    tolerance = 0.4; // ±40% for 4-7 DTE
  else if (dte <= 30)
    tolerance = 0.3; // ±30% for 8-30 DTE
  else tolerance = 0.25; // ±25% for 30+ DTE

  // Minimum band of $0.10 for very cheap options
  const band = Math.max(0.1, theoretical * tolerance);
  const minPrice = Math.max(0.01, theoretical - band);
  const maxPrice = theoretical + band;

  const isValid = submittedPrice >= minPrice && submittedPrice <= maxPrice;

  const result: PriceValidationResult = {
    isValid,
    theoreticalPrice: theoretical,
    minPrice: Math.round(minPrice * 100) / 100,
    maxPrice: Math.round(maxPrice * 100) / 100,
    submittedPrice,
    tolerance,
  };

  if (!isValid) {
    result.reason =
      `Price $${submittedPrice.toFixed(2)} is outside the valid range ` +
      `$${result.minPrice.toFixed(2)} - $${result.maxPrice.toFixed(2)} ` +
      `(theoretical: $${theoretical.toFixed(2)})`;
    logger.warn('Trade price validation failed', result);
  }

  return result;
}

/**
 * Get the current theoretical price for an option (for display on trade forms).
 */
export async function getTheoreticalPrice(
  symbol: string,
  strikePrice: number,
  expirationDate: string,
  optionType: 'CALL' | 'PUT'
): Promise<{ theoreticalPrice: number; stockPrice: number; iv: number }> {
  const stockPriceData = await massiveService.getStockPrice(symbol);
  const currentPrice = stockPriceData.close;

  let hv: number;
  try {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 35);
    const bars = await massiveService.getStockHistory(
      symbol,
      from.toISOString().split('T')[0],
      to.toISOString().split('T')[0],
      'day'
    );
    if (bars && bars.length >= 5) {
      hv = computeHistoricalVolatility(bars.map((b: { c: number }) => b.c));
    } else {
      hv = estimateHV(currentPrice);
    }
  } catch {
    hv = estimateHV(currentPrice);
  }

  const expiry = new Date(expirationDate + 'T16:00:00');
  const now = new Date();
  const T = Math.max(0, (expiry.getTime() - now.getTime()) / (365 * 24 * 60 * 60 * 1000));
  const dte = Math.max(0, Math.round((expiry.getTime() - now.setHours(0, 0, 0, 0)) / 86400000));
  const type = optionType.toLowerCase() as 'call' | 'put';
  const q = DIVIDEND_YIELDS[symbol.toUpperCase()] ?? 0;
  const sigma = getAdjustedIV(currentPrice, strikePrice, dte, hv);

  const theoreticalPrice = Math.max(
    0.01,
    Math.round(bsPrice(currentPrice, strikePrice, T, RISK_FREE_RATE, q, sigma, type) * 100) / 100
  );

  return { theoreticalPrice, stockPrice: currentPrice, iv: sigma };
}
