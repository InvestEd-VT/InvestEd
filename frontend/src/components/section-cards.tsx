'use client';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { TrendingUpIcon, TrendingDownIcon } from 'lucide-react';
import PortfolioValueCard from '@/components/portfolio/PortfolioValueCard';
import PortfolioTrendCard from '@/components/portfolio/PortfolioTrendCard';
import usePortfolioStore from '@/store/portfolioStore';
import CashBalanceCard from '@/components/portfolio/CashBalanceCard';

export function SectionCards() {
  const data = usePortfolioStore((s) => s.data);

  const positionsCount = data?.positions ? data.positions.length : null;
  const totalPnL = data?.totalPnL ?? null;

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <PortfolioValueCard />
      <PortfolioTrendCard />

      <CashBalanceCard />

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Open Positions</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {positionsCount === null ? '----' : positionsCount}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingDownIcon />
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">Currently open positions</div>
          <div className="text-muted-foreground">Includes stocks and options</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Unrealized P&L</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalPnL === null
              ? '----'
              : `${totalPnL >= 0 ? '+' : '-'}${Math.abs(totalPnL).toLocaleString(undefined, { style: 'currency', currency: 'USD' })}`}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUpIcon />
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Current unrealized profit / loss
          </div>
          <div className="text-muted-foreground">Based on avg cost (placeholder prices)</div>
        </CardFooter>
      </Card>
    </div>
  );
}
