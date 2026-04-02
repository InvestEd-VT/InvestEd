import { Link } from 'react-router-dom';
import usePortfolioStore from '@/store/portfolioStore';

function SkeletonRow({ keyIdx }: { keyIdx: number }) {
  return (
    <div key={keyIdx} className="flex items-center justify-between gap-4 py-2">
      <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
      <div className="w-12 h-4 bg-gray-200 rounded animate-pulse" />
      <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
      <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
      <div className="w-12 h-4 bg-gray-200 rounded animate-pulse" />
    </div>
  );
}

export default function RecentTransactions() {
  const data = usePortfolioStore((s) => s.data);
  const isLoading = usePortfolioStore((s) => s.isLoading);

  const transactions = (data as any)?.transactions ?? [];

  // filter to option trades and sort reverse-chronological if a timestamp exists
  const optionTx = Array.isArray(transactions)
    ? transactions
        .filter(
          (t: any) =>
            (t?.positionType || '').toUpperCase() === 'OPTION' ||
            (t?.symbol || '').toString().toUpperCase().includes('C') ||
            (t?.symbol || '').toString().toUpperCase().includes('P')
        )
        .sort((a: any, b: any) => {
          const da = a?.date ? new Date(a.date).getTime() : 0;
          const db = b?.date ? new Date(b.date).getTime() : 0;
          return db - da;
        })
    : [];

  const recent = optionTx.slice(0, 5);

  return (
    <div className="rounded-md border bg-white p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium">Recent Transactions</h3>
        <Link to="/portfolio" className="text-sm text-primary-600 hover:underline">
          View all
        </Link>
      </div>

      {isLoading && (!transactions || transactions.length === 0) ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonRow keyIdx={i} key={i} />
          ))}
        </div>
      ) : recent.length === 0 ? (
        <div className="py-6 text-center text-sm text-muted-foreground">
          No recent option transactions
        </div>
      ) : (
        <div className="space-y-2">
          {recent.map((tx: any) => {
            const date = tx?.date ? new Date(tx.date).toLocaleDateString() : '-';
            const side = (tx?.side || tx?.type || tx?.action || 'BUY').toUpperCase();
            const symbol = tx?.symbol ?? '-';
            const strike = tx?.strikePrice ?? tx?.strike ?? '-';
            const exp = tx?.expiration ?? tx?.expirationDate ?? tx?.expiry ?? '-';
            const contracts = tx?.contracts ?? tx?.quantity ?? tx?.qty ?? '-';
            const total =
              (tx?.total ?? tx?.amount ?? tx?.price)
                ? tx.price * (tx?.contracts ?? tx?.quantity ?? 1)
                : '-';

            return (
              <div
                key={tx?.id || JSON.stringify(tx)}
                className="flex items-center justify-between gap-4 py-2"
              >
                <div className="w-24 text-sm text-muted-foreground">{date}</div>
                <div
                  className={`w-12 text-sm font-medium ${side === 'BUY' ? 'text-emerald-600' : 'text-rose-600'}`}
                >
                  {side}
                </div>
                <div className="w-20 text-sm">{symbol}</div>
                <div className="w-16 text-sm">{strike}</div>
                <div className="w-24 text-sm">{exp}</div>
                <div className="w-12 text-sm">{contracts}</div>
                <div className="w-20 text-sm text-right">
                  {typeof total === 'number' ? `$${total.toFixed(2)}` : total}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
