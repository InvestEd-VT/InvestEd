import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  CandlestickSeries,
  ColorType,
  createChart,
  type CandlestickData,
  type Time,
  type UTCTimestamp,
} from 'lightweight-charts';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { stockService } from '@/services';
import type { Stock, StockChartData, OptionsContract } from '@/types';
import { isAxiosError } from 'axios';
import { AlertCircleIcon, TrendingUpIcon, TrendingDownIcon } from 'lucide-react';
import { OptionsChain } from '@/components/trading/OptionsChain';
import { TradeModal } from '@/components/trading/TradeModal';
import { PageShell } from '@/components/layout/PageShell';
import {
  computeParkinsonVolatility,
  setTickerVolatility,
  getTickerVolatility,
} from '@/utils/options';

type ChartTimeframe = '2d' | '1w' | '1m';
type CandlePoint = CandlestickData<UTCTimestamp>;

interface StockDetailLocationState {
  tradeMode?: 'buy' | 'sell';
  preselectedContract?: OptionsContract;
  defaultPremium?: number;
  openTrade?: boolean;
  underlyingPrice?: number;
  fallbackCompanyName?: string;
}

interface PendingTradeState {
  tradeMode: 'buy' | 'sell';
  preselectedContract: OptionsContract;
  defaultPremium?: number;
  openTrade: boolean;
  underlyingPrice?: number;
  fallbackCompanyName?: string;
}

const TIMEFRAME_LABELS: Record<ChartTimeframe, string> = {
  '2d': '2 Day',
  '1w': '1 Week',
  '1m': '1 Month',
};

export default function StockDetail() {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const locationState = (location.state as StockDetailLocationState | null) ?? null;

  const [stock, setStock] = useState<Stock | null>(null);
  const [chartData, setChartData] = useState<StockChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [timeframe, setTimeframe] = useState<ChartTimeframe>('1m');
  const [tickerQuery, setTickerQuery] = useState(() => (symbol ?? '').toUpperCase());
  const [tickerSearchError, setTickerSearchError] = useState<string | null>(null);
  const [isTickerSearching, setIsTickerSearching] = useState(false);

  // Options state
  const [activeTab, setActiveTab] = useState<'calls' | 'puts'>('calls');
  const [tradeMode, setTradeMode] = useState<'buy' | 'sell'>('buy');
  const [selectedContract, setSelectedContract] = useState<OptionsContract | null>(null);
  const [selectedPremium, setSelectedPremium] = useState(1);
  const [tradeOpen, setTradeOpen] = useState(false);
  const [selectedDte, setSelectedDte] = useState(7);
  const [pendingTradeState, setPendingTradeState] = useState<PendingTradeState | null>(() =>
    locationState?.preselectedContract
      ? {
          tradeMode: locationState.tradeMode ?? 'sell',
          preselectedContract: locationState.preselectedContract,
          defaultPremium: locationState.defaultPremium,
          openTrade: locationState.openTrade ?? false,
          underlyingPrice: locationState.underlyingPrice,
          fallbackCompanyName: locationState.fallbackCompanyName,
        }
      : null
  );
  const preselectedContract = pendingTradeState?.preselectedContract;
  const hasMatchingPreselectedContract =
    Boolean(preselectedContract) &&
    preselectedContract?.underlying_ticker.toUpperCase() === (symbol ?? '').toUpperCase();
  const hasMatchingFallbackStock =
    Boolean(locationState?.underlyingPrice) &&
    (preselectedContract?.underlying_ticker.toUpperCase() === (symbol ?? '').toUpperCase() ||
      !preselectedContract);

  useEffect(() => {
    setTickerQuery((symbol ?? '').toUpperCase());
    setTickerSearchError(null);
  }, [symbol]);

  useEffect(() => {
    if (locationState?.preselectedContract) {
      setPendingTradeState({
        tradeMode: locationState.tradeMode ?? 'sell',
        preselectedContract: locationState.preselectedContract,
        defaultPremium: locationState.defaultPremium,
        openTrade: locationState.openTrade ?? false,
        underlyingPrice: locationState.underlyingPrice,
      });
    }
  }, [locationState]);

  useEffect(() => {
    if (!pendingTradeState?.openTrade || !preselectedContract || !symbol) return;

    const contract = preselectedContract;
    if (contract.underlying_ticker.toUpperCase() !== symbol.toUpperCase()) return;

    setTradeMode(pendingTradeState.tradeMode);
    setSelectedContract(contract);
    setSelectedPremium(pendingTradeState.defaultPremium ?? 1);

    const contractDte = Math.max(
      0,
      Math.round(
        (new Date(`${contract.expiration_date}T16:00:00`).getTime() - Date.now()) / 86400000
      )
    );
    setSelectedDte(contractDte);
    setActiveTab(contract.contract_type === 'call' ? 'calls' : 'puts');
    setTradeOpen(true);
    setPendingTradeState((current) => (current ? { ...current, openTrade: false } : current));
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, navigate, pendingTradeState, preselectedContract, symbol]);

  // Fetch stock details
  useEffect(() => {
    if (!symbol) {
      setError('No stock symbol provided');
      setLoading(false);
      return;
    }
    (async () => {
      try {
        setLoading(true);
        setError(null);
        setIsRateLimited(false);
        const stockData = await stockService.getDetail(symbol);
        setStock(stockData);
      } catch (err) {
        if (hasMatchingPreselectedContract) {
          setStock({
            symbol: preselectedContract?.underlying_ticker ?? symbol,
            companyName:
              pendingTradeState?.fallbackCompanyName ??
              preselectedContract?.underlying_ticker ??
              symbol,
            currentPrice: pendingTradeState?.underlyingPrice ?? 0,
            priceChange: 0,
            priceChangePercent: 0,
            volume: 0,
            marketCap: 0,
          });
          setError(null);
          setIsRateLimited(false);
          return;
        }

        if (hasMatchingFallbackStock) {
          setStock({
            symbol,
            companyName: locationState?.fallbackCompanyName ?? symbol,
            currentPrice: locationState?.underlyingPrice ?? 0,
            priceChange: 0,
            priceChangePercent: 0,
            volume: 0,
            marketCap: 0,
          });
          setError(null);
          setIsRateLimited(false);
          return;
        }

        if (isAxiosError(err) && err.response?.status === 429) {
          setIsRateLimited(true);
          setError('API limit reached');
        } else {
          setError('Failed to load stock details');
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [
    hasMatchingFallbackStock,
    hasMatchingPreselectedContract,
    locationState?.fallbackCompanyName,
    locationState?.underlyingPrice,
    pendingTradeState?.fallbackCompanyName,
    pendingTradeState?.underlyingPrice,
    preselectedContract,
    symbol,
  ]);

  // Fetch chart history
  useEffect(() => {
    if (!symbol) return;
    (async () => {
      try {
        setChartLoading(true);
        const historyData = await stockService.getHistory(symbol, timeframe);
        setChartData(historyData);
      } catch (err) {
        if (isAxiosError(err) && err.response?.status === 429) {
          setIsRateLimited(true);
        }
      } finally {
        setChartLoading(false);
      }
    })();
  }, [symbol, timeframe]);

  // Calculate real historical volatility from 1-month price data
  useEffect(() => {
    if (!symbol || getTickerVolatility(symbol)) return; // already cached
    (async () => {
      try {
        const bars = await stockService.getHistory(symbol, '1m');
        if (bars.length >= 5) {
          const highs = bars.map((b) => b.high);
          const lows = bars.map((b) => b.low);
          const hv = computeParkinsonVolatility(highs, lows);
          setTickerVolatility(symbol, hv);
        }
      } catch {
        /* non-critical */
      }
    })();
  }, [symbol]);

  // No API call for options chain — strikes are generated locally
  // from the stock price using Penny Pilot rules, and priced via Black-Scholes.

  const candleData = useMemo<CandlePoint[]>(() => {
    return [...chartData]
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map((candle) => ({
        time: Math.floor(candle.date.getTime() / 1000) as UTCTimestamp,
        open: Number(candle.open.toFixed(2)),
        high: Number(candle.high.toFixed(2)),
        low: Number(candle.low.toFixed(2)),
        close: Number(candle.close.toFixed(2)),
      }));
  }, [chartData]);

  // Lightweight charts rendering
  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container || chartLoading || candleData.length === 0) return;

    const chart = createChart(container, {
      width: container.clientWidth,
      height: 400,
      layout: { textColor: '#6b7280', background: { type: ColorType.Solid, color: 'transparent' } },
      grid: {
        vertLines: { color: 'rgba(229, 231, 235, 0.5)' },
        horzLines: { color: 'rgba(229, 231, 235, 0.5)' },
      },
      rightPriceScale: { borderVisible: false },
      timeScale: {
        borderVisible: false,
        tickMarkFormatter: (time: Time) => {
          const date =
            typeof time === 'number'
              ? new Date(time * 1000)
              : typeof time === 'string'
                ? new Date(time)
                : new Date(time.year, time.month - 1, time.day);
          return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
        },
      },
      crosshair: {
        vertLine: { color: 'rgba(107, 114, 128, 0.5)', width: 1 },
        horzLine: { color: 'rgba(107, 114, 128, 0.5)', width: 1 },
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#16a34a',
      downColor: '#dc2626',
      borderUpColor: '#16a34a',
      borderDownColor: '#dc2626',
      wickUpColor: '#16a34a',
      wickDownColor: '#dc2626',
    });
    candleSeries.setData(candleData);
    chart.timeScale().fitContent();

    const resizeObserver = new ResizeObserver(() => {
      chart.applyOptions({ width: container.clientWidth });
      chart.timeScale().fitContent();
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [candleData, chartLoading]);

  const handleTickerSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextSymbol = tickerQuery.trim().toUpperCase();
    if (!nextSymbol || nextSymbol === symbol?.toUpperCase()) return;
    try {
      setTickerSearchError(null);
      setIsTickerSearching(true);
      const results = await stockService.search(nextSymbol);
      if (!results.some((item) => item.symbol.toUpperCase() === nextSymbol)) {
        setTickerSearchError(`Ticker '${nextSymbol}' was not found.`);
        return;
      }
      navigate(`/stock/${nextSymbol}`);
    } catch (err) {
      setTickerSearchError(
        isAxiosError(err) && err.response?.status === 429
          ? 'Rate limit reached.'
          : 'Could not verify that ticker.'
      );
    } finally {
      setIsTickerSearching(false);
    }
  };

  const handleSelectContract = (contract: OptionsContract, theoreticalPrice: number) => {
    setSelectedContract(contract);
    setSelectedPremium(theoreticalPrice);
    setTradeOpen(true);
  };

  // Hooks must be before early returns
  const syntheticExpiration = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + selectedDte);
    return d.toISOString().split('T')[0];
  }, [selectedDte]);

  // Generate realistic strikes based on stock price (Penny Pilot rules)
  const contracts = useMemo(() => {
    const sym = symbol?.toUpperCase() ?? '';
    const price = stock?.currentPrice ?? 0;
    if (!price) return [];

    const type = activeTab === 'calls' ? 'call' : 'put';

    // Determine strike intervals by distance from ATM (Penny Pilot rules)
    function getInterval(strike: number): number {
      const dist = Math.abs(strike - price) / price;
      if (price < 10) {
        if (dist < 0.15) return 0.25;
        if (dist < 0.3) return 0.5;
        return 1.0;
      }
      if (price < 25) {
        if (dist < 0.1) return 0.25;
        if (dist < 0.25) return 0.5;
        return 1.0;
      }
      if (price < 75) {
        if (dist < 0.08) return 0.5;
        if (dist < 0.2) return 1.0;
        return 2.5;
      }
      if (price < 200) {
        if (dist < 0.06) return 0.5;
        if (dist < 0.15) return 1.0;
        return 2.5;
      }
      // $200+ (AAPL, TSLA, etc.)
      if (dist < 0.05) return 0.5;
      if (dist < 0.12) return 1.0;
      if (dist < 0.25) return 2.5;
      return 5.0;
    }

    // Generate strikes from 30% below to 30% above current price
    const low = Math.max(0.25, price * 0.7);
    const high = price * 1.3;
    const strikes: number[] = [];

    // Build strikes zone by zone — start from ATM and expand outward
    // This ensures proper interval transitions
    const s = Math.round(price * 4) / 4; // nearest $0.25

    // Go downward from ATM
    let current = s;
    while (current >= low) {
      strikes.push(Math.round(current * 100) / 100);
      current -= getInterval(current);
    }

    // Go upward from ATM
    current = s + getInterval(s);
    while (current <= high) {
      strikes.push(Math.round(current * 100) / 100);
      current += getInterval(current);
    }

    // Sort and deduplicate
    const unique = [...new Set(strikes)].sort((a, b) => a - b);

    return unique.map((strike) => ({
      ticker: `O:${sym}${syntheticExpiration.replace(/-/g, '').slice(2)}${type === 'call' ? 'C' : 'P'}${String(Math.round(strike * 1000)).padStart(8, '0')}`,
      contract_type: type as 'call' | 'put',
      strike_price: strike,
      expiration_date: syntheticExpiration,
      underlying_ticker: sym,
      shares_per_contract: 100,
    }));
  }, [symbol, stock?.currentPrice, activeTab, syntheticExpiration]);

  if (loading) {
    return (
      <PageShell>
        <div className="space-y-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </PageShell>
    );
  }

  if (error || !stock) {
    return (
      <PageShell>
        <Alert variant={isRateLimited ? 'default' : 'destructive'}>
          <AlertCircleIcon className="h-4 w-4" />
          <AlertDescription>{error || 'Stock not found'}</AlertDescription>
        </Alert>
      </PageShell>
    );
  }

  const isPositiveChange = stock.priceChange >= 0;

  return (
    <PageShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold">{stock.symbol}</h1>
            <p className="text-lg text-muted-foreground">{stock.companyName}</p>
          </div>
          <div className="flex gap-2">
            <form onSubmit={handleTickerSubmit} className="flex items-center gap-2">
              <Input
                value={tickerQuery}
                onChange={(e) => {
                  setTickerQuery(e.target.value.toUpperCase());
                  setTickerSearchError(null);
                }}
                placeholder="Search ticker"
                className="w-40"
              />
              <Button type="submit" variant="outline" size="sm" disabled={isTickerSearching}>
                {isTickerSearching ? '...' : 'Go'}
              </Button>
            </form>
            <Button onClick={() => navigate('/dashboard')} variant="secondary" size="sm">
              Back
            </Button>
          </div>
        </div>
        {tickerSearchError && <p className="text-sm text-destructive">{tickerSearchError}</p>}

        {/* Price card */}
        <Card className="p-6">
          <div className="flex items-baseline gap-4">
            <div className="text-4xl font-bold">${stock.currentPrice.toFixed(2)}</div>
            <div
              className={`flex items-center gap-1 text-lg font-semibold ${isPositiveChange ? 'text-green-600' : 'text-red-600'}`}
            >
              {isPositiveChange ? (
                <TrendingUpIcon className="h-5 w-5" />
              ) : (
                <TrendingDownIcon className="h-5 w-5" />
              )}
              {isPositiveChange ? '+' : ''}
              {stock.priceChange.toFixed(2)} ({stock.priceChangePercent.toFixed(2)}%)
            </div>
          </div>
        </Card>

        {/* Chart */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Price Chart ({TIMEFRAME_LABELS[timeframe]})</h2>
            <Select value={timeframe} onValueChange={(v) => setTimeframe(v as ChartTimeframe)}>
              <SelectTrigger className="w-35">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2d">2 Day</SelectItem>
                <SelectItem value="1w">1 Week</SelectItem>
                <SelectItem value="1m">1 Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {chartLoading ? (
            <Skeleton className="h-[400px] w-full" />
          ) : candleData.length > 0 ? (
            <div ref={chartContainerRef} className="relative h-[400px] w-full" />
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No chart data available
            </p>
          )}
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Volume</p>
            <p className="text-2xl font-semibold">{(stock.volume / 1e6).toFixed(1)}M</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Market Cap</p>
            <p className="text-2xl font-semibold">${(stock.marketCap / 1e9).toFixed(2)}B</p>
          </Card>
        </div>

        {/* Options Chain */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {stock.symbol}{' '}
                <span className="text-muted-foreground">
                  {tradeMode} {activeTab === 'calls' ? 'Call' : 'Put'}
                  <span className="ml-1.5 text-sm font-normal">
                    · {selectedDte === 0 ? '0DTE' : `${selectedDte}DTE`}
                  </span>
                </span>
              </h2>
            </div>

            {/* Toggles */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex rounded-lg border p-0.5">
                <button
                  onClick={() => setTradeMode('buy')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${tradeMode === 'buy' ? 'bg-green-500 text-white' : 'text-muted-foreground'}`}
                >
                  Buy
                </button>
                <button
                  onClick={() => setTradeMode('sell')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${tradeMode === 'sell' ? 'bg-orange-500 text-white' : 'text-muted-foreground'}`}
                >
                  Sell
                </button>
              </div>

              <div className="inline-flex rounded-lg border p-0.5">
                <button
                  onClick={() => setActiveTab('calls')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'calls' ? 'bg-green-500 text-white' : 'text-muted-foreground'}`}
                >
                  Call
                </button>
                <button
                  onClick={() => setActiveTab('puts')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'puts' ? 'bg-orange-500 text-white' : 'text-muted-foreground'}`}
                >
                  Put
                </button>
              </div>

              {/* DTE selector */}
              <div className="inline-flex rounded-lg border p-0.5 gap-0.5">
                {[0, 1, 2, 3, 4, 5, 7, 14].map((dte) => (
                  <button
                    key={dte}
                    onClick={() => setSelectedDte(dte)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      selectedDte === dte
                        ? 'bg-blue-500 text-white'
                        : 'text-muted-foreground hover:bg-gray-100'
                    }`}
                  >
                    {dte === 0 ? '0DTE' : `${dte}DTE`}
                  </button>
                ))}
              </div>
            </div>

            <OptionsChain
              contracts={contracts}
              onSelectContract={handleSelectContract}
              isLoading={false}
              accentColor={activeTab === 'calls' ? 'emerald' : 'orange'}
              currentPrice={stock.currentPrice}
              ticker={stock.symbol}
            />
          </div>
        </Card>
      </div>

      {selectedContract && (
        <TradeModal
          open={tradeOpen}
          onClose={() => setTradeOpen(false)}
          contract={selectedContract}
          stockPrice={stock.currentPrice}
          mode={tradeMode}
          defaultPremium={selectedPremium}
        />
      )}
    </PageShell>
  );
}
