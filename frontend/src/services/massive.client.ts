// Lightweight client for Massive v3 API using apiKey query param.
// For local/dev use only. Do NOT commit your VITE_MASSIVE_API_KEY to git.
const API_KEY = import.meta.env.VITE_MASSIVE_API_KEY as string | undefined;
const BASE = (import.meta.env.VITE_MASSIVE_API_BASE as string | undefined) || 'https://api.massive.com';

export const hasMassiveKey = Boolean(API_KEY);

type StockBar = {
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
  vw?: number;
  t: number;
  n?: number;
};

export type StockPrice = {
  ticker: string;
  close: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  timestamp: number;
};

async function massiveRequest<T>(path: string): Promise<T> {
  if (!API_KEY) throw new Error('VITE_MASSIVE_API_KEY not configured');
  const url = new URL(`${BASE}${path}`);
  url.searchParams.set('apiKey', API_KEY);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Massive error ${res.status} ${res.statusText}`);
  return res.json();
}

// Simple timestamp normalizer: convert seconds -> ms if needed
function normalizeTimestamp(t: number | undefined): number {
  if (!t) return Date.now();
  // if timestamp looks like seconds (10 digits) convert to ms
  if (t < 1e12) return t * 1000;
  return t;
}

const lastKnown = new Map<string, StockPrice>();

export const getStockPrev = async (symbol: string): Promise<StockPrice | null> => {
  const key = String(symbol).toUpperCase();
  try {
    const data = await massiveRequest<any>(`/v2/aggs/ticker/${encodeURIComponent(symbol)}/prev`);
    // Defensive parsing: try common result shapes
    const bar: StockBar | undefined =
      data?.results?.[0] ?? data?.result?.[0] ?? data?.results?.bars?.[0] ?? data?.bars?.[0];
    if (!bar) {
      // no fresh data; return cached if present
      const cached = lastKnown.get(key) ?? null;
      return cached;
    }

    const price: StockPrice = {
      ticker: key,
      close: Number(bar.c),
      open: Number(bar.o),
      high: Number(bar.h),
      low: Number(bar.l),
      volume: Number(bar.v ?? 0),
      timestamp: normalizeTimestamp(Number(bar.t)),
    };
    lastKnown.set(key, price);
    return price;
  } catch (err) {
    // On any error, return cached value if available, otherwise null
    const cached = lastKnown.get(key) ?? null;
    return cached;
  }
};

export const getMultipleStockPrev = async (symbols: string[], batchSize = 5): Promise<Map<string, StockPrice>> => {
  const out = new Map<string, StockPrice>();
  const uniq = Array.from(new Set(symbols.map((s) => s.toUpperCase()).filter(Boolean)));

  // If we have a frontend key, call Massive directly in batches
  if (API_KEY) {
    for (let i = 0; i < uniq.length; i += batchSize) {
      const batch = uniq.slice(i, i + batchSize);
      const promises = batch.map((sym) => getStockPrev(sym).then((p) => ({ sym, p })));
      const results = await Promise.all(promises);
      for (const r of results) {
        if (r.p) out.set(r.sym, r.p);
        else {
          const cached = lastKnown.get(r.sym);
          if (cached) out.set(r.sym, cached);
        }
      }
    }
    return out;
  }

  // Fallback: call our backend proxy if no frontend key is available.
  // Backend endpoint: GET /api/v1/massive/prev?symbols=AAPL,MSFT
  try {
    const chunkSize = Math.max(50, batchSize * 10);
    for (let i = 0; i < uniq.length; i += chunkSize) {
      const batch = uniq.slice(i, i + chunkSize);
      const url = new URL(`/api/v1/massive/prev`, window.location.origin);
      url.searchParams.set('symbols', batch.join(','));
      const res = await fetch(url.toString());
      if (!res.ok) continue;
      const json = await res.json();
      const data = json?.data || {};
      for (const sym of batch) {
        const key = sym.toUpperCase();
        const close = data[sym] ?? data[key] ?? null;
        if (close != null) {
          const price: StockPrice = {
            ticker: key,
            close: Number(close),
            open: Number(close),
            high: Number(close),
            low: Number(close),
            volume: 0,
            timestamp: Date.now(),
          };
          lastKnown.set(key, price);
          out.set(key, price);
        } else {
          const cached = lastKnown.get(key);
          if (cached) out.set(key, cached);
        }
      }
    }
  } catch (e) {
    // ignore fallback failures but return cached values if present
    for (const sym of uniq) {
      const cached = lastKnown.get(sym);
      if (cached) out.set(sym, cached);
    }
  }

  return out;
};

export default {
  hasMassiveKey,
  getStockPrev,
  getMultipleStockPrev,
};
