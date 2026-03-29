import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import type { Stock, StockChartData } from '@/types';
import { isAxiosError } from 'axios';
import { AlertCircleIcon, TrendingUpIcon, TrendingDownIcon } from 'lucide-react';

type ChartTimeframe = '2d' | '1w' | '1m';

type CandlePoint = CandlestickData<UTCTimestamp>;

const TIMEFRAME_LABELS: Record<ChartTimeframe, string> = {
  '2d': '2 Day',
  '1w': '1 Week',
  '1m': '1 Month',
};

export default function StockDetail() {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const chartContainerRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    setTickerQuery((symbol ?? '').toUpperCase());
    setTickerSearchError(null);
  }, [symbol]);

  useEffect(() => {
    if (!symbol) {
      setError('No stock symbol provided');
      setLoading(false);
      return;
    }

    const fetchStockDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        setIsRateLimited(false);
        const stockData = await stockService.getDetail(symbol);
        setStock(stockData);
      } catch (err) {
        if (isAxiosError(err) && err.response?.status === 429) {
          setIsRateLimited(true);
          setError('API limit reached (5 requests per hour)');
        } else {
          setError('Failed to load stock details');
        }
        console.error('Stock detail error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStockDetails();
  }, [symbol]);

  useEffect(() => {
    if (!symbol) return;

    const fetchHistory = async () => {
      try {
        setChartLoading(true);
        const historyData = await stockService.getHistory(symbol, timeframe);
        setChartData(historyData);
      } catch (err) {
        if (isAxiosError(err) && err.response?.status === 429) {
          setIsRateLimited(true);
          setError('API limit reached (5 requests per hour)');
        } else {
          console.error('Chart history error:', err);
        }
      } finally {
        setChartLoading(false);
      }
    };

    fetchHistory();
  }, [symbol, timeframe]);

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

  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container || chartLoading || candleData.length === 0) return;

    const chart = createChart(container, {
      width: container.clientWidth,
      height: 460,
      layout: {
        textColor: '#9EAAC7',
        background: { type: ColorType.Solid, color: 'transparent' },
      },
      grid: {
        vertLines: { color: 'rgba(56, 62, 85, 0.35)' },
        horzLines: { color: 'rgba(56, 62, 85, 0.35)' },
      },
      rightPriceScale: {
        borderVisible: false,
      },
      timeScale: {
        borderVisible: false,
        tickMarkFormatter: (time: Time) => {
          const date =
            typeof time === 'string'
              ? new Date(time)
              : typeof time === 'number'
                ? new Date(time * 1000)
                : new Date(time.year, time.month - 1, time.day);

          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${month}/${day}`;
        },
      },
      crosshair: {
        vertLine: {
          color: 'rgba(158, 170, 199, 0.5)',
          width: 1,
        },
        horzLine: {
          color: 'rgba(158, 170, 199, 0.5)',
          width: 1,
        },
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

    const tooltip = document.createElement('div');
    tooltip.style.position = 'absolute';
    tooltip.style.display = 'none';
    tooltip.style.pointerEvents = 'none';
    tooltip.style.zIndex = '20';
    tooltip.style.minWidth = '170px';
    tooltip.style.borderRadius = '10px';
    tooltip.style.border = '1px solid rgba(39, 45, 64, 0.9)';
    tooltip.style.background = 'rgba(10, 12, 18, 0.94)';
    tooltip.style.color = '#e5e7eb';
    tooltip.style.padding = '10px 12px';
    tooltip.style.fontSize = '12px';
    container.appendChild(tooltip);

    chart.subscribeCrosshairMove((param) => {
      if (!param.point || !param.time || !param.seriesData.size) {
        tooltip.style.display = 'none';
        return;
      }

      const candle = param.seriesData.get(candleSeries) as CandlestickData<Time> | undefined;
      if (!candle) {
        tooltip.style.display = 'none';
        return;
      }

      const date =
        typeof candle.time === 'number'
          ? new Date(candle.time * 1000)
          : new Date(
              (candle.time as { year: number; month: number; day: number }).year,
              (candle.time as { year: number; month: number; day: number }).month - 1,
              (candle.time as { year: number; month: number; day: number }).day
            );

      tooltip.innerHTML = `
        <div style="font-weight:600; margin-bottom:6px;">${date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}</div>
        <div style="display:grid; gap:2px; color:#9ca3af;">
          <div style="display:flex; justify-content:space-between; gap:10px;"><span>Open</span><span style="color:#f9fafb;">$${candle.open.toFixed(2)}</span></div>
          <div style="display:flex; justify-content:space-between; gap:10px;"><span>High</span><span style="color:#f9fafb;">$${candle.high.toFixed(2)}</span></div>
          <div style="display:flex; justify-content:space-between; gap:10px;"><span>Low</span><span style="color:#f9fafb;">$${candle.low.toFixed(2)}</span></div>
          <div style="display:flex; justify-content:space-between; gap:10px;"><span>Close</span><span style="color:#f9fafb;">$${candle.close.toFixed(2)}</span></div>
        </div>
      `;

      const left = Math.min(container.clientWidth - 190, Math.max(8, param.point.x + 12));
      const top = Math.max(8, param.point.y + 12);
      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${top}px`;
      tooltip.style.display = 'block';
    });

    const resizeObserver = new ResizeObserver(() => {
      chart.applyOptions({ width: container.clientWidth });
      chart.timeScale().fitContent();
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      tooltip.remove();
      chart.remove();
    };
  }, [candleData, chartLoading]);

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleTickerSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextSymbol = tickerQuery.trim().toUpperCase();
    if (!nextSymbol) return;

    if (nextSymbol === symbol?.toUpperCase()) {
      setTickerSearchError(null);
      return;
    }

    try {
      setTickerSearchError(null);
      setIsTickerSearching(true);
      const results = await stockService.search(nextSymbol);
      const exactMatch = results.some((item) => item.symbol.toUpperCase() === nextSymbol);

      if (!exactMatch) {
        setTickerSearchError(`Ticker '${nextSymbol}' was not found.`);
        return;
      }

      navigate(`/stock/${nextSymbol}`);
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 429) {
        setTickerSearchError('Rate limit reached. Please try again in a few minutes.');
      } else {
        setTickerSearchError('Could not verify that ticker right now.');
      }
    } finally {
      setIsTickerSearching(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-4 md:p-6 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-64 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      </div>
    );
  }

  if (error || !stock) {
    return (
      <div className="flex-1 p-4 md:p-6">
        <Alert variant={isRateLimited ? 'default' : 'destructive'}>
          <AlertCircleIcon className="h-4 w-4" />
          <AlertDescription>{error || 'Stock not found'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const isPositiveChange = stock.priceChange >= 0;

  return (
    <div className="flex-1 p-4 md:p-6 space-y-6">
      <div className="space-y-2">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold">{stock.symbol}</h1>
            <p className="text-lg text-muted-foreground">{stock.companyName}</p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <form
              onSubmit={handleTickerSubmit}
              className="flex w-full items-center gap-2 sm:w-auto"
            >
              <Input
                value={tickerQuery}
                onChange={(event) => {
                  setTickerQuery(event.target.value.toUpperCase());
                  if (tickerSearchError) setTickerSearchError(null);
                }}
                placeholder="Search ticker"
                className="w-full sm:w-40"
                aria-label="Search ticker"
              />
              <Button type="submit" variant="outline" size="sm" disabled={isTickerSearching}>
                {isTickerSearching ? 'Checking...' : 'Go'}
              </Button>
            </form>
            <Button onClick={handleBackToDashboard} variant="secondary" size="sm">
              Back to Dashboard
            </Button>
          </div>
        </div>
        {tickerSearchError && <p className="text-sm text-destructive">{tickerSearchError}</p>}
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-baseline gap-4">
            <div className="text-4xl font-bold">${stock.currentPrice.toFixed(2)}</div>
            <div
              className={`flex items-center gap-1 text-lg font-semibold ${
                isPositiveChange ? 'text-green-600' : 'text-red-600'
              }`}
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
          <Alert>
            <AlertCircleIcon className="h-4 w-4" />
            <AlertDescription>Price data is delayed by approximately 15 minutes</AlertDescription>
          </Alert>
        </div>
      </Card>

      <Card className="p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold">Price Chart ({TIMEFRAME_LABELS[timeframe]})</h2>
          <Select
            value={timeframe}
            onValueChange={(value) => setTimeframe(value as ChartTimeframe)}
          >
            <SelectTrigger className="w-35">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2d">2 Day</SelectItem>
              <SelectItem value="1w">1 Week</SelectItem>
              <SelectItem value="1m">1 Month</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {chartLoading ? (
          <Skeleton className="h-115 w-full" />
        ) : candleData.length > 0 ? (
          <div ref={chartContainerRef} className="relative h-115 w-full" />
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            No chart candles available for this timeframe.
          </p>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Volume</p>
            <p className="text-2xl font-semibold">{(stock.volume / 1000000).toFixed(1)}M</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Market Cap</p>
            <p className="text-2xl font-semibold">${(stock.marketCap / 1000000000).toFixed(2)}B</p>
          </div>
        </Card>
        {stock.high52Week && (
          <Card className="p-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">52W High</p>
              <p className="text-2xl font-semibold">${stock.high52Week.toFixed(2)}</p>
            </div>
          </Card>
        )}
        {stock.low52Week && (
          <Card className="p-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">52W Low</p>
              <p className="text-2xl font-semibold">${stock.low52Week.toFixed(2)}</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
