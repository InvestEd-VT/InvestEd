import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { portfolioService } from '@/services';
import type { Transaction } from '@/types';
import { formatCurrency } from '@/lib/utils';

function getTransactionTypeLabel(type: Transaction['type']) {
  switch (type) {
    case 'EXPIRED_WORTHLESS':
      return 'Expired Worthless';
    case 'EXPIRATION':
      return 'Expiration';
    case 'EXERCISE':
      return 'Exercise';
    case 'BUY':
      return 'Buy';
    case 'SELL':
      return 'Sell';
    default:
      return type;
  }
}

function getTransactionTypeClass(type: Transaction['type']) {
  switch (type) {
    case 'BUY':
      return 'text-emerald-600';
    case 'SELL':
      return 'text-rose-600';
    case 'EXPIRED_WORTHLESS':
    case 'EXPIRATION':
      return 'text-amber-700';
    case 'EXERCISE':
      return 'text-indigo-600';
    default:
      return 'text-muted-foreground';
  }
}

function SkeletonRow({ keyIdx }: { keyIdx: number }) {
  return (
    <div
      key={keyIdx}
      className="grid grid-cols-12 items-center gap-2 px-2 py-2 border-b last:border-b-0"
    >
      <div className="col-span-2 h-4 bg-gray-200 rounded animate-pulse" />
      <div className="col-span-2 h-4 bg-gray-200 rounded animate-pulse" />
      <div className="col-span-3 h-4 bg-gray-200 rounded animate-pulse" />
      <div className="col-span-2 h-4 bg-gray-200 rounded animate-pulse" />
      <div className="col-span-1 h-4 bg-gray-200 rounded animate-pulse" />
      <div className="col-span-2 h-4 bg-gray-200 rounded animate-pulse" />
    </div>
  );
}

export default function RecentTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    portfolioService
      .getTransactions({ limit: 3, offset: 0 })
      .then((res) => {
        if (!mounted) return;
        setTransactions((res.transactions ?? []).slice(0, 3));
      })
      .catch(() => {
        if (!mounted) return;
        setTransactions([]);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Column Headers */}
        <div className="grid grid-cols-12 gap-2 text-xs text-muted-foreground px-2">
          <div className="col-span-2">Date</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-3">Symbol</div>
          <div className="col-span-2">Strike</div>
          <div className="col-span-1">Qty</div>
          <div className="col-span-2 text-right">Total</div>
        </div>

        {isLoading ? (
          <div className="space-y-0">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonRow keyIdx={i} key={i} />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            No recent transactions
          </div>
        ) : (
          <div>
            {transactions.map((tx: Transaction) => {
              const date = tx.executedAt ? new Date(tx.executedAt).toLocaleDateString() : '-';
              const type = tx.type;
              const symbol = tx.symbol ?? '-';
              const strike = tx.strikePrice ? Number(tx.strikePrice).toFixed(2) : '-';
              const contracts = tx.quantity ?? '-';
              const price = typeof tx.price === 'string' ? parseFloat(tx.price) : Number(tx.price);
              const qty =
                typeof tx.quantity === 'string' ? parseFloat(tx.quantity) : Number(tx.quantity);
              const total = !isNaN(price) && !isNaN(qty) ? price * qty * 100 : '-';

              return (
                <div
                  key={tx.id}
                  className="grid grid-cols-12 items-center gap-2 px-2 py-2 border-b last:border-b-0"
                >
                  <div className="col-span-2 text-xs text-muted-foreground">{date}</div>
                  <div
                    className={`col-span-2 text-sm font-medium ${getTransactionTypeClass(type)}`}
                  >
                    {getTransactionTypeLabel(type)}
                  </div>
                  <div className="col-span-3 text-sm font-medium truncate">{symbol}</div>
                  <div className="col-span-2 text-sm">{strike}</div>
                  <div className="col-span-1 text-sm">{contracts}</div>
                  <div className="col-span-2 text-sm text-right font-mono font-medium">
                    {typeof total === 'number' ? formatCurrency(total, 'USD') : total}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <div className="w-full flex justify-end">
          <Link to="/transactions">
            <Button size="sm" variant="ghost" className='cursor-pointer'>
              View all transactions
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
