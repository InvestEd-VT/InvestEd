// React import not required with automatic JSX runtime
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import usePortfolioStore from '@/store/portfolioStore';
import { formatCurrency } from '@/lib/utils';
// Use plain anchor tags for navigation to keep this component router-agnostic

export default function TopPositionsList() {
  const data = usePortfolioStore((s) => s.data);
  const isLoading = usePortfolioStore((s) => s.isLoading);

  if (isLoading) {
    // Loading skeleton
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Top Options Positions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse flex items-center justify-between gap-4">
              <div className="h-4 w-24 rounded bg-slate-200" />
              <div className="h-4 w-12 rounded bg-slate-200" />
              <div className="h-4 w-12 rounded bg-slate-200" />
              <div className="h-4 w-16 rounded bg-slate-200" />
            </div>
          ))}
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">Loading positions…</CardFooter>
      </Card>
    );
  }

  const positions = data?.positions ?? [];
  // Filter option positions and compute current value
  const optionPositions = positions
    .filter((p) => (p.positionType || '').toUpperCase() === 'OPTION')
    .map((p) => ({
      ...p,
      currentValue: Number(
        p.marketValue ??
          (p.currentPrice
            ? p.currentPrice * (p.quantity ?? 0) * (p.positionType === 'OPTION' ? 100 : 1)
            : 0)
      ),
    }))
    .sort((a, b) => (b.currentValue ?? 0) - (a.currentValue ?? 0));

  const top5 = optionPositions.slice(0, 5);

  if (!top5.length) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Top Options Positions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-6 text-center text-sm text-muted-foreground">
            No open options positions
          </div>
        </CardContent>
        <CardFooter>
          <div className="w-full flex justify-end">
            <a href="/portfolio">
              <Button size="sm" variant="ghost">
                View all positions
              </Button>
            </a>
          </div>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Top Options Positions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-12 gap-2 text-xs text-muted-foreground px-2">
          <div className="col-span-3">Symbol</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-2">Strike</div>
          <div className="col-span-2">Expires</div>
          <div className="col-span-1">Contracts</div>
          <div className="col-span-2 text-right">Current Value / P&L</div>
        </div>
        {top5.map((p) => {
          const pnl = Number(p.unrealizedPnL ?? (p.marketValue ?? 0) - (p.costBasis ?? 0));
          const positive = pnl >= 0;
          const expiration =
            (p as any).expiration || (p as any).expirationDate || (p as any).expiresAt || null;
          const expText = expiration
            ? (() => {
                try {
                  const d = new Date(expiration);
                  if (!isNaN(d.getTime())) return d.toLocaleDateString();
                } catch (e) {
                  return String(expiration);
                }
                return String(expiration);
              })()
            : '-';

          return (
            <div
              key={p.id}
              className="grid grid-cols-12 items-center gap-2 px-2 py-2 border-b last:border-b-0"
            >
              <div className="col-span-3 font-medium truncate">{p.symbol}</div>
              <div className="col-span-2">{p.optionType ?? p.positionType ?? '-'}</div>
              <div className="col-span-2">
                {p.strikePrice ? Number(p.strikePrice).toFixed(2) : '-'}
              </div>
              <div className="col-span-2">{expText}</div>
              <div className="col-span-1">{Number(p.quantity ?? 0)}</div>
              <div className="col-span-2 text-right">
                <div className="font-mono font-medium">
                  {formatCurrency(Number(p.currentValue ?? p.marketValue ?? 0), 'USD')}
                </div>
                <div className={`text-sm ${positive ? 'text-green-600' : 'text-red-600'}`}>
                  {positive ? '+' : '-'}
                  {formatCurrency(Math.abs(pnl), 'USD')}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
      <CardFooter>
        <div className="w-full flex justify-end">
          <a href="/portfolio">
            <Button size="sm" variant="ghost">
              View all positions
            </Button>
          </a>
        </div>
      </CardFooter>
    </Card>
  );
}
