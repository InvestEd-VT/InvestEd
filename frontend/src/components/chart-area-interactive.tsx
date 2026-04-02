'use client';

import * as React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import portfolioService from '@/services/portfolio.service';
import { formatCurrency } from '@/lib/utils';

import { useIsMobile } from '@/hooks/use-mobile';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export const description = 'Portfolio value over time (transaction-based)';

const chartConfig = {
  value: {
    label: 'Portfolio value',
    color: 'var(--primary)',
  },
} satisfies ChartConfig;

export function ChartAreaInteractive() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState('90d');
  const [data, setData] = React.useState<Array<{ date: string; value: number }>>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (isMobile) setTimeRange('7d');
  }, [isMobile]);

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    // backend expects period like '7d' | '30d' | '90d'
    portfolioService
      .getPortfolioHistory(timeRange)
      .then((res) => {
        if (!mounted) return;
        // res.history: [{ date, cashBalance, ... }]
        const chart = (res.history || []).map((h: any) => ({
          date: new Date(h.date).toISOString(),
          value: Number(h.cashBalance),
        }));
        setData(chart);
      })
      .catch(() => {
        if (!mounted) return;
        setData([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [timeRange]);

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Portfolio value</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Transaction-based history (cash balance)
          </span>
          <span className="@[540px]/card:hidden">History</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-62.5 w-full">
          {loading ? (
            <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
              Loading chart…
            </div>
          ) : (
            <AreaChart data={data}>
              <defs>
                <linearGradient id="fillValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  });
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      });
                    }}
                    indicator="dot"
                    formatter={(val: any) => (
                      <span className="font-medium">{formatCurrency(Number(val ?? 0), 'USD')}</span>
                    )}
                  />
                }
              />
              <Area dataKey="value" type="natural" fill="url(#fillValue)" stroke="var(--primary)" />
            </AreaChart>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
