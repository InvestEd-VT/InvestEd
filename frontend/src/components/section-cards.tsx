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
import PortfolioTrendCard from '@/components/portfolio/PortfolioTrendCard';
import usePortfolioStore from '@/store/portfolioStore';
import CashBalanceCard from '@/components/portfolio/CashBalanceCard';

export function SectionCards() {
  const data = usePortfolioStore((s) => s.data);

  const positionsCount = data?.positions ? data.positions.length : 0;
  const totalPnL = data?.totalPnL ?? 0;

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <CashBalanceCard />

      <PortfolioTrendCard />

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Open Positions</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {positionsCount}
          </CardTitle>
          <CardAction>
            <a href="/portfolio" aria-label="View open positions">
              <Badge variant="outline">
                <TrendingDownIcon />
              </Badge>
            </a>
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
            {totalPnL >= 0 ? '+' : '-'}
            {Math.abs(totalPnL).toLocaleString(undefined, { style: 'currency', currency: 'USD' })}
          </CardTitle>
          <CardAction>
            <a href="/portfolio" aria-label="View portfolio P&L">
              <Badge variant="outline">
                <TrendingUpIcon />
              </Badge>
            </a>
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
