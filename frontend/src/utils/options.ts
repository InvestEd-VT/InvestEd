/**
 * Options Pricing Engine (Hybrid)
 *
 * Uses real historical volatility (HV) calculated from stock price bars
 * as the base IV input, then applies:
 *  - Volatility skew (moneyness-based)
 *  - Term structure adjustment
 *  - Dividend yield
 *  - Full Black-Scholes with dividends
 *  - All Greeks
 *
 * When real IV from Polygon becomes available ($29/mo plan), the
 * `computeHistoricalVolatility` function can be replaced with API data.
 */

// ─── Math helpers ──────────────────────────────────────────────────────────────

/** Standard normal CDF (Abramowitz & Stegun) */
function cdf(x: number): number {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x) / Math.SQRT2;
  const t = 1.0 / (1.0 + p * ax);
  const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax);
  return 0.5 * (1.0 + sign * y);
}

/** Standard normal PDF */
function pdf(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

// ─── Historical Volatility from real price data ────────────────────────────────

/**
 * Calculate annualized historical volatility from an array of closing prices.
 * Uses log returns + standard deviation, annualized by √252 (trading days).
 *
 * @param closes - Array of daily closing prices, ordered oldest→newest
 * @returns Annualized HV as decimal (e.g. 0.28 = 28%)
 */
export function computeHistoricalVolatility(closes: number[]): number {
  if (closes.length < 5) return 0.30; // not enough data, use reasonable default

  // Calculate daily log returns
  const logReturns: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    if (closes[i] > 0 && closes[i - 1] > 0) {
      logReturns.push(Math.log(closes[i] / closes[i - 1]));
    }
  }

  if (logReturns.length < 3) return 0.30;

  // Mean of log returns
  const mean = logReturns.reduce((s, r) => s + r, 0) / logReturns.length;

  // Variance (sample variance with N-1)
  const variance = logReturns.reduce((s, r) => s + (r - mean) ** 2, 0) / (logReturns.length - 1);

  // Standard deviation of daily returns
  const dailyStd = Math.sqrt(variance);

  // Annualize: multiply by √252 (trading days per year)
  const annualizedHV = dailyStd * Math.sqrt(252);

  // Clamp to reasonable range [8%, 200%]
  return Math.max(0.08, Math.min(2.0, annualizedHV));
}

/**
 * Calculate Parkinson's historical volatility (High-Low estimator).
 * More efficient than close-to-close — uses the full daily range.
 * Typically gives ~20% better estimates with same data.
 *
 * @param highs - Array of daily highs
 * @param lows - Array of daily lows
 * @returns Annualized HV as decimal
 */
export function computeParkinsonVolatility(highs: number[], lows: number[]): number {
  const n = Math.min(highs.length, lows.length);
  if (n < 3) return 0.30;

  let sumSq = 0;
  for (let i = 0; i < n; i++) {
    if (highs[i] > 0 && lows[i] > 0) {
      const hl = Math.log(highs[i] / lows[i]);
      sumSq += hl * hl;
    }
  }

  const parkinsonVar = sumSq / (4 * n * Math.LN2);
  const annualized = Math.sqrt(parkinsonVar * 252);
  return Math.max(0.08, Math.min(2.0, annualized));
}

// ─── Volatility cache ──────────────────────────────────────────────────────────

/**
 * In-memory cache of computed HV per ticker.
 * Set by calling `setTickerVolatility()` after fetching price history.
 */
const hvCache = new Map<string, { hv: number; timestamp: number }>();
const HV_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

export function setTickerVolatility(ticker: string, hv: number): void {
  hvCache.set(ticker.toUpperCase(), { hv, timestamp: Date.now() });
}

export function getTickerVolatility(ticker: string): number | null {
  const entry = hvCache.get(ticker.toUpperCase());
  if (!entry) return null;
  if (Date.now() - entry.timestamp > HV_CACHE_TTL) {
    hvCache.delete(ticker.toUpperCase());
    return null;
  }
  return entry.hv;
}

// ─── Market constants ──────────────────────────────────────────────────────────

/** Risk-free rate (short-term Treasury yield, early 2026) */
export const RISK_FREE_RATE = 0.043;

/** Approximate dividend yields for common tickers */
const DIVIDEND_YIELDS: Record<string, number> = {
  SPY: 0.013, QQQ: 0.006, IWM: 0.012, DIA: 0.018,
  AAPL: 0.005, MSFT: 0.007, GOOGL: 0.005, GOOG: 0.005,
  AMZN: 0.000, META: 0.004, TSLA: 0.000, NVDA: 0.000,
  AMD: 0.000, NFLX: 0.000, JPM: 0.022, BAC: 0.025,
  WMT: 0.013, KO: 0.028, PEP: 0.026, JNJ: 0.030,
  DIS: 0.008, BA: 0.000, V: 0.007, MA: 0.005,
  COIN: 0.000, MARA: 0.000,
};

function getDividendYield(ticker: string): number {
  return DIVIDEND_YIELDS[ticker.toUpperCase()] ?? 0;
}

// ─── Skew parameters ──────────────────────────────────────────────────────────

/**
 * Skew parameters by stock "type."
 * Derived from the stock's own HV level — higher vol stocks have flatter skew.
 */
function getSkewParams(baseHV: number): { slope: number; curve: number } {
  // High-vol stocks (HV > 50%): flatter skew, more smile
  if (baseHV > 0.50) return { slope: -0.08, curve: 0.14 };
  // Medium-vol (30-50%): moderate skew
  if (baseHV > 0.30) return { slope: -0.12, curve: 0.10 };
  // Low-vol large-cap (20-30%): steeper put skew
  if (baseHV > 0.20) return { slope: -0.15, curve: 0.08 };
  // Very low-vol / index (<20%): steepest skew
  return { slope: -0.20, curve: 0.10 };
}

// ─── IV adjustment engine ──────────────────────────────────────────────────────

/**
 * Calculate the adjusted IV for a specific option contract.
 *
 * 1. Start with real HV from price data (or fallback estimate)
 * 2. Apply moneyness skew (OTM puts more expensive than OTM calls)
 * 3. Apply term structure (near-term IV differs from 30-day base)
 *
 * @param ticker - Stock ticker
 * @param stockPrice - Current stock price
 * @param strikePrice - Option strike price
 * @param dte - Days to expiration
 * @param fallbackStockPrice - Used for fallback HV estimation if no cached HV
 */
export function getAdjustedIV(
  ticker: string,
  stockPrice: number,
  strikePrice: number,
  dte: number,
): number {
  // 1. Get base volatility: real HV from cache, or estimate from price level
  let baseHV = getTickerVolatility(ticker);
  if (baseHV === null) {
    // Fallback: estimate from stock price (will be replaced once history loads)
    if (stockPrice > 500) baseHV = 0.22;
    else if (stockPrice > 200) baseHV = 0.28;
    else if (stockPrice > 100) baseHV = 0.32;
    else if (stockPrice > 50) baseHV = 0.38;
    else if (stockPrice > 20) baseHV = 0.45;
    else baseHV = 0.55;
  }

  // IV is typically 10-20% higher than realized HV (volatility risk premium)
  // Market makers charge a premium over realized vol
  const ivPremium = 1.15; // 15% premium over HV
  const baseIV = baseHV * ivPremium;

  // 2. Moneyness skew
  const moneyness = (strikePrice - stockPrice) / stockPrice;
  const { slope, curve } = getSkewParams(baseHV);
  const skewAdj = slope * moneyness + curve * moneyness * moneyness;

  // 3. Term structure
  // Reference = 30 days. In contango (normal): short-term IV < long-term IV
  // But very near-term (< 7 days) can spike due to gamma exposure
  const clampedDte = Math.max(0.25, dte);
  let termMultiplier: number;
  if (clampedDte <= 3) {
    // 0-3 DTE: elevated IV due to gamma risk + market maker hedging costs
    termMultiplier = 1.0 + 0.15 * (3 - clampedDte) / 3;
  } else if (clampedDte <= 7) {
    // 4-7 DTE: slightly elevated
    termMultiplier = 1.0 + 0.05 * (7 - clampedDte) / 4;
  } else {
    // 8+ DTE: normal contango, longer = slightly higher IV
    termMultiplier = Math.pow(30 / clampedDte, 0.06);
  }

  const adjustedIV = baseIV * termMultiplier + skewAdj;
  return Math.max(0.05, Math.min(2.0, adjustedIV));
}

// ─── Time helpers ──────────────────────────────────────────────────────────────

export function timeToExpiry(expirationDate: string): number {
  const expiry = new Date(expirationDate + 'T16:00:00');
  const now = new Date();
  return Math.max(0, (expiry.getTime() - now.getTime()) / (365 * 24 * 60 * 60 * 1000));
}

export function daysToExpiry(expirationDate: string): number {
  const expiry = new Date(expirationDate + 'T16:00:00');
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((expiry.getTime() - now.getTime()) / 86400000));
}

// ─── Black-Scholes with dividends ──────────────────────────────────────────────

interface BSInputs {
  S: number; K: number; T: number;
  r: number; q: number; sigma: number;
}

function bsPrice(inputs: BSInputs, type: 'call' | 'put'): number {
  const { S, K, T, r, q, sigma } = inputs;
  if (T <= 0) return type === 'call' ? Math.max(0, S - K) : Math.max(0, K - S);

  const sqrtT = Math.sqrt(T);
  const d1 = (Math.log(S / K) + (r - q + sigma * sigma / 2) * T) / (sigma * sqrtT);
  const d2 = d1 - sigma * sqrtT;

  if (type === 'call') {
    return S * Math.exp(-q * T) * cdf(d1) - K * Math.exp(-r * T) * cdf(d2);
  }
  return K * Math.exp(-r * T) * cdf(-d2) - S * Math.exp(-q * T) * cdf(-d1);
}

// ─── Public pricing API ────────────────────────────────────────────────────────

/**
 * Price a single option using real HV + skew + term structure.
 * @returns Premium per share (multiply by 100 for contract cost)
 */
export function priceOption(
  stockPrice: number,
  strikePrice: number,
  expirationDate: string,
  type: 'call' | 'put',
  ticker = '',
): number {
  const dte = daysToExpiry(expirationDate);
  const T = timeToExpiry(expirationDate);
  const sigma = getAdjustedIV(ticker, stockPrice, strikePrice, dte);
  const q = getDividendYield(ticker);

  const price = bsPrice({ S: stockPrice, K: strikePrice, T, r: RISK_FREE_RATE, q, sigma }, type);
  return Math.max(0.01, Math.round(price * 100) / 100);
}

/**
 * Calculate all Greeks.
 */
export function greeks(
  stockPrice: number,
  strikePrice: number,
  expirationDate: string,
  type: 'call' | 'put',
  ticker = '',
) {
  const dte = daysToExpiry(expirationDate);
  const T = timeToExpiry(expirationDate);
  const sigma = getAdjustedIV(ticker, stockPrice, strikePrice, dte);
  const q = getDividendYield(ticker);
  const r = RISK_FREE_RATE;
  const S = stockPrice;
  const K = strikePrice;

  if (T <= 0) {
    const itm = type === 'call' ? S > K : K > S;
    return { delta: itm ? (type === 'call' ? 1 : -1) : 0, gamma: 0, theta: 0, vega: 0, iv: sigma };
  }

  const sqrtT = Math.sqrt(T);
  const d1 = (Math.log(S / K) + (r - q + sigma * sigma / 2) * T) / (sigma * sqrtT);
  const d2 = d1 - sigma * sqrtT;
  const eqT = Math.exp(-q * T);
  const erT = Math.exp(-r * T);
  const nd1 = pdf(d1);

  const delta = type === 'call' ? eqT * cdf(d1) : eqT * (cdf(d1) - 1);
  const gamma = (eqT * nd1) / (S * sigma * sqrtT);
  const theta = (
    -(S * eqT * nd1 * sigma) / (2 * sqrtT)
    - r * K * erT * (type === 'call' ? cdf(d2) : cdf(-d2))
    + q * S * eqT * (type === 'call' ? cdf(d1) : cdf(-d1))
  ) / 365;
  const vega = S * eqT * sqrtT * nd1 / 100;

  return {
    delta: Math.round(delta * 1000) / 1000,
    gamma: Math.round(gamma * 10000) / 10000,
    theta: Math.round(theta * 100) / 100,
    vega: Math.round(vega * 100) / 100,
    iv: Math.round(sigma * 10000) / 10000,
  };
}

// ─── Legacy export ─────────────────────────────────────────────────────────────

export function blackScholes(
  inputs: { stockPrice: number; strikePrice: number; timeToExpiry: number; riskFreeRate: number; volatility: number },
  type: 'call' | 'put',
): number {
  return bsPrice({ S: inputs.stockPrice, K: inputs.strikePrice, T: inputs.timeToExpiry, r: inputs.riskFreeRate, q: 0, sigma: inputs.volatility }, type);
}

// ─── Payoff calculations ───────────────────────────────────────────────────────

interface PayoffPoint { price: number; profit: number; }

export function calculatePayoff(
  type: 'call' | 'put', strikePrice: number, premium: number,
  quantity: number, mode: 'buy' | 'sell', numPoints = 60,
): PayoffPoint[] {
  const mult = 100;
  const low = strikePrice * 0.7, high = strikePrice * 1.3;
  const step = (high - low) / numPoints;
  const points: PayoffPoint[] = [];
  for (let p = low; p <= high; p += step) {
    const intrinsic = type === 'call' ? Math.max(0, p - strikePrice) : Math.max(0, strikePrice - p);
    const profit = mode === 'buy' ? (intrinsic - premium) * quantity * mult : (premium - intrinsic) * quantity * mult;
    points.push({ price: Math.round(p * 100) / 100, profit: Math.round(profit * 100) / 100 });
  }
  return points;
}

export function breakeven(type: 'call' | 'put', strikePrice: number, premium: number): number {
  return type === 'call' ? strikePrice + premium : strikePrice - premium;
}

export function maxProfitLoss(type: 'call' | 'put', strikePrice: number, premium: number, quantity: number) {
  const mult = 100, maxLoss = premium * quantity * mult;
  if (type === 'call') return { maxProfit: Infinity, maxLoss, breakeven: strikePrice + premium };
  return { maxProfit: (strikePrice - premium) * quantity * mult, maxLoss, breakeven: strikePrice - premium };
}
