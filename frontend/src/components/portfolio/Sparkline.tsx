import { useEffect, useState } from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { stockService } from '@/services';

interface SparklineProps {
  symbol: string;
  width?: number;
  height?: number;
}

/**
 * Tiny area chart showing 7-day price trend for a stock.
 * Green if trending up, red if trending down.
 */
export function Sparkline({ symbol, width = 70, height = 24 }: SparklineProps) {
  const [data, setData] = useState<{ v: number }[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    stockService
      .getHistory(symbol, '1w')
      .then((bars) => {
        if (cancelled || !bars?.length) return;
        setData(bars.map((b: { c: number }) => ({ v: b.c })));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [symbol]);

  if (!data || data.length < 2) return <div style={{ width, height }} />;

  const trending = data[data.length - 1].v >= data[0].v;
  const color = trending ? '#22c55e' : '#ef4444';

  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={`spark-${symbol}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#spark-${symbol})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
