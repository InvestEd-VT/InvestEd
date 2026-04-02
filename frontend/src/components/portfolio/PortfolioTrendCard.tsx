// React import not required with automatic JSX runtime
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import portfolioService from '@/services/portfolio.service';
import { useEffect, useState } from 'react';
// formatCurrency not used here

export default function PortfolioTrendCard({ defaultRange = '30d' }: { defaultRange?: string }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Array<{ date: string; value: number }>>([]);
  const [range] = useState(defaultRange);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    portfolioService
      .getPortfolioHistory(range)
      .then((res) => {
        if (!mounted) return;
        const chart = (res.history || []).map((h: any) => ({
          date: new Date(h.date).toISOString(),
          value: Number(h.cashBalance || 0),
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
  }, [range]);

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Portfolio trend</CardTitle>
        <CardDescription>Recent cash balance trend</CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-2 sm:px-4 sm:pt-4">
        <ChartContainer config={{ value: { label: 'Value' } }} className="h-36">
          {loading ? (
            <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
              Loading…
            </div>
          ) : (
            <AreaChart data={data}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="date" hide />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
              <Area
                dataKey="value"
                type="monotone"
                fill="var(--primary)"
                stroke="var(--primary)"
                fillOpacity={0.15}
              />
            </AreaChart>
          )}
        </ChartContainer>
        <div className="mt-2 text-xs text-muted-foreground">
          Values shown are transaction-based cash snapshots.
        </div>
      </CardContent>
    </Card>
  );
}
