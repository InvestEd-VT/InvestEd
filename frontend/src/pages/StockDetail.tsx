import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
import { Chart, ChartCanvas, GenericChartComponent } from '@react-financial-charts/core';
import { CandlestickSeries } from '@react-financial-charts/series';
import { XAxis, YAxis } from '@react-financial-charts/axes';
import { discontinuousTimeScaleProviderBuilder } from '@react-financial-charts/scales';
import {
  CrossHairCursor,
  MouseCoordinateX,
  MouseCoordinateY,
} from '@react-financial-charts/coordinates';
import { OHLCTooltip } from '@react-financial-charts/tooltip';
import { AlertCircleIcon, TrendingUpIcon, TrendingDownIcon } from 'lucide-react';

type ChartTimeframe = '2d' | '1w' | '1m';

const TIMEFRAME_LABELS: Record<ChartTimeframe, string> = {
  '2d': '2 Day',
  '1w': '1 Week',
  '1m': '1 Month',
};

export default function StockDetail() {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const [stock, setStock] = useState<Stock | null>(null);
  const [chartData, setChartData] = useState<StockChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [timeframe, setTimeframe] = useState<ChartTimeframe>('1m');
  const [isChartHovered, setIsChartHovered] = useState(false);
  const [hoveredCandle, setHoveredCandle] = useState<StockChartData | null>(null);
  const [chartContainerElement, setChartContainerElement] = useState<HTMLDivElement | null>(null);
  const [chartWidth, setChartWidth] = useState(() => {
    if (typeof window === 'undefined') return 640;
    return Math.max(0, window.innerWidth);
  });

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

  useEffect(() => {
    if (!chartContainerElement) return;

    const computeFallbackWidth = () => {
      if (typeof window === 'undefined') return 640;
      return Math.max(0, window.innerWidth);
    };

    const updateWidth = () => {
      const width = chartContainerElement.getBoundingClientRect().width;
      if (width > 0) {
        setChartWidth(Math.floor(width));
      } else {
        setChartWidth(computeFallbackWidth());
      }
    };

    updateWidth();

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      if (width > 0) {
        setChartWidth(Math.floor(width));
      }
    });

    observer.observe(chartContainerElement);
    window.addEventListener('resize', updateWidth);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateWidth);
    };
  }, [chartContainerElement]);

  const financialChartData = useMemo(() => {
    return [...chartData].sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [chartData]);

  const handleViewOptionsChain = () => {
    if (symbol) {
      navigate(`/options/${symbol}`);
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
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{stock.symbol}</h1>
            <p className="text-lg text-muted-foreground">{stock.companyName}</p>
          </div>
          <Button onClick={handleViewOptionsChain} size="lg">
            View Options Chain
          </Button>
        </div>
      </div>

      {/* Price and Change */}
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

      {/* Chart */}
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

        <div className="ml-4 min-h-5 text-xs font-medium text-slate-600">
          <span className={hoveredCandle ? 'opacity-100' : 'opacity-0'}>
            {hoveredCandle
              ? `Hovered: ${hoveredCandle.date.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}`
              : 'Hovered: placeholder'}
          </span>
        </div>

        <div
          ref={setChartContainerElement}
          className="relative w-full"
          style={{ height: 360 }}
          onMouseEnter={() => setIsChartHovered(true)}
          onMouseLeave={() => {
            setIsChartHovered(false);
            setHoveredCandle(null);
          }}
        >
          {chartLoading ? (
            <Skeleton className="h-full w-full" />
          ) : (
            chartWidth > 0 &&
            financialChartData.length > 0 &&
            (() => {
              const xScaleProvider = discontinuousTimeScaleProviderBuilder().inputDateAccessor(
                (d) => d.date
              );
              const { data, xScale, xAccessor, displayXAccessor } =
                xScaleProvider(financialChartData);

              const max = xAccessor(data[data.length - 1]);
              const min = xAccessor(data[Math.max(0, data.length - 100)]);
              const xExtents = data.length > 1 ? [min, max] : [Math.max(0, max - 1), max + 1];
              const chartHeight = 360;
              const xTickCount =
                timeframe === '1m' ? Math.min(data.length, 20) : Math.min(data.length, 10);

              const resolveCandleDate = (value: unknown): Date | null => {
                if (value instanceof Date) {
                  return Number.isNaN(value.getTime()) ? null : value;
                }

                if (typeof value === 'number' && Number.isFinite(value)) {
                  const item = data[Math.round(value)];
                  if (item?.date instanceof Date && !Number.isNaN(item.date.getTime())) {
                    return item.date;
                  }
                }

                const parsed = new Date(value as string | number);
                return Number.isNaN(parsed.getTime()) ? null : parsed;
              };

              const formatXAxisDate = (value: unknown) => {
                const date = resolveCandleDate(value);
                if (!date) return '';

                return date.toLocaleDateString('en-US', {
                  month: '2-digit',
                  day: '2-digit',
                });
              };

              return (
                <>
                  <ChartCanvas
                    height={chartHeight}
                    width={chartWidth}
                    ratio={typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1}
                    margin={{ left: 8, right: 64, top: 10, bottom: 28 }}
                    mouseMoveEvent
                    disablePan
                    disableZoom
                    data={data}
                    displayXAccessor={displayXAccessor}
                    seriesName={`${stock.symbol} (${TIMEFRAME_LABELS[timeframe]})`}
                    xScale={xScale}
                    xAccessor={xAccessor}
                    xExtents={xExtents}
                  >
                    <Chart id={1} height={250} yExtents={(d) => [d.high, d.low]}>
                      <XAxis
                        strokeStyle="#94a3b8"
                        tickStrokeStyle="#94a3b8"
                        gridLinesStrokeStyle="rgba(148,163,184,0.25)"
                        tickLabelFill="#94a3b8"
                        ticks={xTickCount}
                        tickFormat={formatXAxisDate}
                      />
                      <YAxis
                        strokeStyle="#94a3b8"
                        tickStrokeStyle="#94a3b8"
                        gridLinesStrokeStyle="rgba(148,163,184,0.25)"
                        tickLabelFill="#94a3b8"
                      />
                      <CandlestickSeries widthRatio={0.9} />
                      <MouseCoordinateX snapX displayFormat={formatXAxisDate} />
                      <MouseCoordinateY displayFormat={(value) => `$${value.toFixed(2)}`} />
                      <GenericChartComponent
                        clip={false}
                        svgDraw={() => null}
                        drawOn={['mousemove', 'pan']}
                        onMouseMove={(_, moreProps) => {
                          const currentItem = moreProps?.currentItem as StockChartData | undefined;
                          setHoveredCandle((previous) => {
                            const prevTs = previous?.date.getTime();
                            const nextTs = currentItem?.date.getTime();
                            if (prevTs === nextTs) return previous;
                            return currentItem ?? null;
                          });
                        }}
                      />
                      {isChartHovered && (
                        <OHLCTooltip
                          origin={[8, 0]}
                          labelFill="#94a3b8"
                          textFill="#e2e8f0"
                          displayValuesFor={(_, moreProps) => moreProps.currentItem}
                        />
                      )}
                    </Chart>
                    <CrossHairCursor snapX />
                  </ChartCanvas>
                </>
              );
            })()
          )}
        </div>

        {!chartLoading && financialChartData.length === 0 && (
          <p className="mt-3 text-sm text-muted-foreground">
            No chart candles available for this timeframe.
          </p>
        )}
      </Card>

      {/* Key Stats */}
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
