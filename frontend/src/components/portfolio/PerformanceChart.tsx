/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import portfolioService from '@/services/portfolio.service';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const PERIODS = [
  { label: '7D', value: '7d' },
  { label: '30D', value: '30d' },
  { label: '90D', value: '90d' },
  { label: '1Y', value: '1y' },
  { label: 'All', value: 'all' },
];

export default function PerformanceChart() {
  const [period, setPeriod] = React.useState('30d');
  const [data, setData] = React.useState<Array<{ date: string; value: number }>>([]);
  const [loading, setLoading] = React.useState(true);
  const [startingBalance, setStartingBalance] = React.useState<number | null>(null);

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    portfolioService
      .getPortfolioHistory(period)
      .then((res) => {
        if (!mounted) return;
        const history = (res.history || [])
          .map((h: any) => ({
            date: new Date(h.date).toISOString(),
            value: Number(h.totalValue),
          }))
          .sort(
            (a: { date: string }, b: { date: string }) =>
              new Date(a.date).getTime() - new Date(b.date).getTime()
          );
        setData(history);
        if (history.length > 0) setStartingBalance(history[0].value);
        else setStartingBalance(null);
      })
      .catch(() => {
        if (!mounted) return;
        setData([]);
        setStartingBalance(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [period]);

  const latestValue = data.length ? data[data.length - 1].value : null;
  const lineColor =
    startingBalance != null && latestValue != null && latestValue >= startingBalance
      ? '#059669'
      : '#e11d48';

  const values = data.map((d) => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const padding = (maxVal - minVal) * 0.2 || 100;
  const domainMin = Math.floor((minVal - padding) / 10) * 10;
  const domainMax = Math.ceil((maxVal + padding) / 10) * 10;

  return (
    <Card className="@container/card">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Portfolio performance</CardTitle>
          <CardDescription>Portfolio value over time</CardDescription>
        </div>
        <div className="flex gap-1">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1 text-xs rounded-md border transition-colors ${
                period === p.value
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {loading ? (
          <div className="flex h-64 w-full items-center justify-center text-sm text-muted-foreground">
            Loading chart…
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
            No historical data available
          </div>
        ) : (
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 8, right: 40, left: 10, bottom: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                  tick={{ dy: 10 }}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    });
                  }}
                />
                <YAxis
                  domain={[domainMin, domainMax]}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) =>
                    `$${Number(value).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
                  }
                  width={70}
                />
                <Tooltip
                  content={({ active, payload, label }: any) => {
                    if (!active || !payload || !payload.length) return null;
                    const val = payload[0].value;
                    return (
                      <div className="rounded bg-white p-2 shadow">
                        <div className="text-sm text-muted-foreground">
                          {new Date(label).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                        <div className="text-sm font-medium">
                          {formatCurrency(Number(val ?? 0), 'USD')}
                        </div>
                      </div>
                    );
                  }}
                />
                {startingBalance != null && (
                  <ReferenceLine
                    y={startingBalance}
                    stroke="#94a3b8"
                    strokeDasharray="4 4"
                    label={{
                      position: 'right',
                      fill: '#94a3b8',
                      fontSize: 12,
                    }}
                  />
                )}
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={lineColor}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
