/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { useEffect, useState } from 'react';
import { getMultipleStockPrev, hasMassiveKey } from '@/services/massive.client';
import { Link } from 'react-router-dom';

const STARTING_BALANCE = 10000;

function Skeleton() {
  return (
    <div className="h-28 w-full animate-pulse space-y-2">
      <div className="h-6 bg-gray-100 rounded w-3/5" />
      <div className="h-10 bg-gray-100 rounded w-4/5" />
      <div className="h-4 bg-gray-100 rounded w-1/3" />
      <p className="sr-only">Loading portfolio</p>
    </div>
  );
}

export default function PortfolioValueCard() {
  const data = usePortfolioStore((s) => s.data);
  const isLoading = usePortfolioStore((s) => s.isLoading);
  const error = usePortfolioStore((s) => s.error);
  const fetchPortfolio = usePortfolioStore((s) => s.fetchPortfolio);

  const [livePositionsValue, setLivePositionsValue] = useState<number | null>(null);

  useEffect(() => {
    if (!data || !hasMassiveKey) return;

    const stockPositions = (data.positions || []).filter(
      (p: any) => (p.positionType || '').toUpperCase() === 'STOCK'
    );
    const symbols = stockPositions
      .map((p: any) => String(p.symbol || '').toUpperCase())
      .filter(Boolean);
    if (!symbols.length) return;

    let mounted = true;
    let timer: ReturnType<typeof setInterval> | null = null;

    const fetchPrices = async () => {
      try {
        const map = await getMultipleStockPrev(symbols, 10);
        if (!mounted) return;
        // compute positions value: use live close for stocks, keep marketValue for options
        let stocksValue = 0;
        for (const p of stockPositions) {
          const sym = String(p.symbol || '').toUpperCase();
          const price = map.get(sym);
          if (price) stocksValue += Number(price.close) * Number(p.quantity ?? 0);
          else
            stocksValue += Number(
              p.marketValue ?? (p.currentPrice ? p.currentPrice * (p.quantity ?? 0) : 0)
            );
        }

        const optionsValue = (data.positions || [])
          .filter((p: any) => (p.positionType || '').toUpperCase() === 'OPTION')
          .reduce((acc: number, p: any) => acc + (Number(p.marketValue ?? 0) || 0), 0);

        setLivePositionsValue(stocksValue + optionsValue);
      } catch {
        // ignore; keep previous livePositionsValue if any
      }
    };

    void fetchPrices();
    timer = setInterval(fetchPrices, 30_000);

    return () => {
      mounted = false;
      if (timer) clearInterval(timer);
    };
  }, [data]);

  // Compute totals defensively
  const cash = data?.cashBalance ?? 0;
  const positionsValue =
    livePositionsValue ??
    data?.positionsValue ??
    data?.positions?.reduce((acc, p) => acc + (p.marketValue ?? 0), 0) ??
    0;
  const total = data?.totalValue ?? cash + positionsValue;

  const pnl = total - STARTING_BALANCE;
  const pnlPercent = (pnl / STARTING_BALANCE) * 100;

  const positive = pnl >= 0;

  const pnlClass = positive ? 'text-emerald-600' : 'text-rose-600';
  const pnlSign = positive ? '+' : '-';

  // Error state
  if (error && !data) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Portfolio Value</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            <div className="text-sm text-rose-600">
              <p>Unable to load portfolio value</p>
              <p className="text-xs text-muted-foreground">{error}</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <button onClick={() => fetchPortfolio()} className="text-sm text-primary underline">
            Retry
          </button>
        </CardFooter>
      </Card>
    );
  }

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
          <a href="/portfolio" aria-label="Open portfolio">
            <Badge variant="outline">{positive ? <ArrowUpRight /> : <ArrowDownRight />}</Badge>
          </a>
        </CardAction>
      </CardHeader>

      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
          Overall P&L
        </div>
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
          Compared to starting balance of{' '}
          {STARTING_BALANCE.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}
        </div>

        <div className="text-xs text-muted-foreground mt-2">Prices delayed ~15 minutes</div>
      </CardFooter>
    </Card>
  );
}
