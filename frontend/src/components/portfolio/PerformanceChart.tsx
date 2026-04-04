/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import portfolioService from '@/services/portfolio.service';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';

export default function PerformanceChart({ period = 'all' }: { period?: string }) {
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
        // res.history: [{ date, cashBalance }]
        const history = (res.history || []).map((h: any) => ({
          date: new Date(h.date).toISOString(),
          value: Number(h.cashBalance),
        }));
        setData(history);
        // set starting balance from first history point if available
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
  // decide line color based on latest value vs starting balance
  const lineColor =
    startingBalance != null && latestValue != null && latestValue >= startingBalance
      ? 'var(--emerald-600)'
      : 'var(--rose-600)';

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Portfolio performance</CardTitle>
        <CardDescription>Portfolio value over time</CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          className="aspect-auto h-62.5 w-full"
          config={
            {
              value: { label: 'Portfolio value', color: 'var(--primary)' },
            } as ChartConfig
          }
        >
          {loading ? (
            <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
              Loading chart…
            </div>
          ) : data.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
              No historical data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  }}
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
                    stroke="var(--muted)"
                    strokeDasharray="4 4"
                    label={{
                      position: 'right',
                      value: `Start: ${formatCurrency(startingBalance, 'USD')}`,
                      fill: 'var(--muted)',
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
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
