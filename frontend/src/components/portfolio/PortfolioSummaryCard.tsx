// React import not required with the automatic JSX runtime
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import usePortfolioStore from '@/store/portfolioStore';

export function PortfolioSummaryCard() {
  const data = usePortfolioStore((s) => s.data);

  const totalValue = data?.totalValue ?? 0;
  const cashBalance = data?.cashBalance ?? 0;

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>Portfolio</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {formatCurrency(totalValue, 'USD')}
        </CardTitle>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="flex w-full items-center justify-between">
          <div className="text-sm text-muted-foreground">Cash balance</div>
          <div className="font-medium tabular-nums">{formatCurrency(cashBalance, 'USD')}</div>
        </div>
        <div className="text-muted-foreground">Total value includes holdings and cash</div>
      </CardFooter>
    </Card>
  );
}

export default PortfolioSummaryCard;
