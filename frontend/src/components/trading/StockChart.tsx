import { useState, useEffect } from 'react';
import { Area, AreaChart, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import stockService from '@/services/stock.service';
import type { StockChartData } from '@/types';
import { formatCurrency } from '@/utils/format';

interface StockChartProps {
  symbol: string;
  currentPrice?: number;
}

type TimePeriod = '1W' | '1M' | '3M' | '1Y';

const PERIOD_MAP: Record<TimePeriod, string> = {
  '1W': '1w',
  '1M': '1m',
  '3M': '3m',
  '1Y': '1y',
};

interface ChartPoint { date: string; price: number; }

export function StockChart({ symbol }: StockChartProps) {
  const [period, setPeriod] = useState<TimePeriod>('1M');
  const [data, setData] = useState<ChartPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const result: StockChartData[] = await stockService.getHistory(symbol, PERIOD_MAP[period]);
        setData(result.map((bar) => ({
          date: new Date(bar.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          price: bar.close,
        })));
      } catch { setData([]); }
      finally { setIsLoading(false); }
    })();
  }, [symbol, period]);

  const firstPrice = data.length > 0 ? data[0].price : 0;
  const lastPrice = data.length > 0 ? data[data.length - 1].price : 0;
  const isPositive = (lastPrice - firstPrice) >= 0;
  const chartColor = isPositive ? '#10b981' : '#f97316';

  return (
    <div className="space-y-3">
      {isLoading ? (
        <Skeleton className="h-[200px] w-full rounded-lg" />
      ) : data.length === 0 ? (
        <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">No chart data available</div>
      ) : (
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartColor} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} interval="preserveStartEnd" minTickGap={40} />
              <YAxis domain={['auto', 'auto']} hide />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const point = payload[0].payload as ChartPoint;
                  return (
                    <div className="rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 shadow-lg">
                      <p className="text-xs text-gray-300">{point.date}</p>
                      <p className="text-sm font-semibold text-white">{formatCurrency(point.price)}</p>
                    </div>
                  );
                }}
                cursor={{ stroke: '#d1d5db', strokeDasharray: '4 4' }}
              />
              <Area type="monotone" dataKey="price" stroke={chartColor} strokeWidth={2} fill="url(#priceGradient)" dot={false} activeDot={{ r: 4, fill: chartColor, stroke: '#fff', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="flex items-center gap-1">
        {(Object.keys(PERIOD_MAP) as TimePeriod[]).map((p) => (
          <button key={p} onClick={() => setPeriod(p)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${period === p ? (isPositive ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-500') : 'text-gray-400 hover:text-gray-600'}`}
          >{p}</button>
        ))}
      </div>
    </div>
  );
}
