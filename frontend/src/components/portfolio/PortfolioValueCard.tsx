import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import usePortfolioStore from '@/store/portfolioStore';

const STARTING_BALANCE = 10000;

function Skeleton() {
  return (
    <div className="h-28 w-full animate-pulse space-y-2">
      <div className="h-6 bg-gray-100 rounded w-3/5" />
      <div className="h-10 bg-gray-100 rounded w-4/5" />
      <div className="h-4 bg-gray-100 rounded w-1/3" />
    </div>
  );
}

export default function PortfolioValueCard() {
  const data = usePortfolioStore((s) => s.data);
  const isLoading = usePortfolioStore((s) => s.isLoading);

  // Compute totals defensively
  const cash = data?.cashBalance ?? 0;
  const positionsValue =
    data?.positionsValue ?? data?.positions?.reduce((acc, p) => acc + (p.marketValue ?? 0), 0) ?? 0;
  const total = data?.totalValue ?? cash + positionsValue;

  const pnl = total - STARTING_BALANCE;
  const pnlPercent = (pnl / STARTING_BALANCE) * 100;

  const positive = pnl >= 0;

  const pnlClass = positive ? 'text-emerald-600' : 'text-rose-600';
  const pnlSign = positive ? '+' : '-';

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>Total Portfolio Value</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {isLoading && !data ? (
            <Skeleton />
          ) : (
            <span>{total.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</span>
          )}
        </CardTitle>
        <CardAction>
          <Badge variant="outline">{positive ? <ArrowUpRight /> : <ArrowDownRight />}</Badge>
        </CardAction>
      </CardHeader>

      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className={`flex items-baseline gap-3 font-medium ${pnlClass}`}>
          <span className="text-lg tabular-nums">
            {pnlSign}
            {Math.abs(pnl).toLocaleString(undefined, { style: 'currency', currency: 'USD' })}
          </span>
          <span className="text-sm text-muted-foreground">
            {pnlSign}
            {Math.abs(pnlPercent).toFixed(2)}%
          </span>
        </div>

        <div className="text-muted-foreground">
          Compared to starting balance of {STARTING_BALANCE.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}
        </div>

        <div className="text-xs text-muted-foreground mt-2">Prices delayed ~15 minutes</div>
      </CardFooter>
    </Card>
  );
}
