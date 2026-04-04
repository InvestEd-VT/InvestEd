/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
  CardContent,
} from '@/components/ui/card';
import usePortfolioStore from '@/store/portfolioStore';
import { formatCurrency } from '@/lib/utils';

export default function CashBalanceCard() {
  const data = usePortfolioStore((s) => s.data);
  const isLoading = usePortfolioStore((s) => s.isLoading);

  if (isLoading && !data) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Cash</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            &nbsp;
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="h-6 w-3/4 rounded bg-slate-200 animate-pulse" />
          <div className="h-4 w-1/2 rounded bg-slate-200 animate-pulse" />
          <div className="h-3 w-full rounded bg-slate-100 animate-pulse" />
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">Loading cash balance…</CardFooter>
      </Card>
    );
  }

  const cashBalance = data?.cashBalance ?? 0;
  const positions = data?.positions ?? [];
  const positionsValue = data?.positionsValue ?? 0;

  const deployedOptions = positions
    .filter((p: any) => (p.positionType || '').toUpperCase() === 'OPTION')
    .reduce((sum: number, p: any) => sum + (Number(p.marketValue ?? p.costBasis ?? 0) || 0), 0);

  const totalPortfolio = Math.max(0.000001, cashBalance + positionsValue);

  let cashPct = (cashBalance / totalPortfolio) * 100;
  let positionsPct = (positionsValue / totalPortfolio) * 100;

  cashPct = Math.round(cashPct * 10) / 10;
  positionsPct = Math.round(positionsPct * 10) / 10;
  const remainder = 100 - (cashPct + positionsPct);
  positionsPct = Math.round((positionsPct + remainder) * 10) / 10;

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>Available cash</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {formatCurrency(cashBalance, 'USD')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Deployed into options</div>
          <div className="font-medium tabular-nums">{formatCurrency(deployedOptions, 'USD')}</div>
        </div>

        <div className="w-full bg-border rounded-full h-3 overflow-hidden">
          <div
            className="h-3 bg-green-500 float-left"
            style={{ width: `${Math.max(0, Math.min(100, cashPct))}%` }}
            aria-hidden
          />
          <div
            className="h-3 bg-indigo-500 float-left"
            style={{ width: `${Math.max(0, Math.min(100, positionsPct))}%` }}
            aria-hidden
          />
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div>Cash {cashPct}%</div>
          <div>Positions {positionsPct}%</div>
        </div>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">Includes stocks and options</CardFooter>
    </Card>
  );
}
