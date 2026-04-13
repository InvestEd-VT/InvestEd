import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageShell } from '@/components/layout/PageShell';
import PageHeader from '@/components/ui/PageHeader';
import { portfolioService } from '@/services';
import type { Transaction } from '@/types';
import { formatCurrency } from '@/utils/format';

const PAGE_SIZE = 20;

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [symbolFilter, setSymbolFilter] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [isLoading, setIsLoading] = useState(true);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = {
        limit: PAGE_SIZE,
        offset,
        sort: sortOrder,
      };
      if (typeFilter !== 'ALL') params.type = typeFilter;
      if (symbolFilter.trim()) params.symbol = symbolFilter.trim().toUpperCase();

      const data = await portfolioService.getTransactions(params);
      setTransactions(data.transactions);
      setTotal(data.total);
    } catch {
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [offset, typeFilter, sortOrder]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const timeout = setTimeout(() => {
      setOffset(0);
      fetchTransactions();
    }, 300);
    return () => clearTimeout(timeout);
  }, [symbolFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <PageShell>
      <div className="max-w-5xl space-y-6">
        <PageHeader title="Transactions" />

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Select
            value={typeFilter}
            onValueChange={(v) => {
              setTypeFilter(v);
              setOffset(0);
            }}
          >
            <SelectTrigger className="w-[130px] h-9 bg-white border-gray-200 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All types</SelectItem>
              <SelectItem value="BUY">Buy</SelectItem>
              <SelectItem value="SELL">Sell</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={sortOrder}
            onValueChange={(v: 'desc' | 'asc') => {
              setSortOrder(v);
              setOffset(0);
            }}
          >
            <SelectTrigger className="w-[150px] h-9 bg-white border-gray-200 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Most recent</SelectItem>
              <SelectItem value="asc">Oldest first</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Filter by symbol..."
            value={symbolFilter}
            onChange={(e) => setSymbolFilter(e.target.value)}
            className="max-w-[180px] h-9 bg-white border-gray-200 text-sm"
          />
        </div>

        {isLoading ? (
          <div className="space-y-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-sm">No transactions found</p>
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-200">
            {/* Header */}
            <div className="hidden sm:grid grid-cols-6 px-4 py-2.5 text-[11px] font-medium text-gray-400 uppercase tracking-wider bg-gray-50">
              <span>Date</span>
              <span>Type</span>
              <span>Symbol</span>
              <span>Details</span>
              <span className="text-right">Price</span>
              <span className="text-right">Total</span>
            </div>

            {/* Rows */}
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="grid grid-cols-2 sm:grid-cols-6 items-center px-4 py-3.5 text-sm"
              >
                <span className="text-xs text-gray-400">
                  {new Date(tx.executedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                <span>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                      tx.type === 'BUY'
                        ? 'bg-green-50 text-green-600'
                        : tx.type === 'SELL'
                          ? 'bg-orange-50 text-orange-500'
                          : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {tx.type}
                  </span>
                </span>
                <span className="font-semibold">{tx.symbol}</span>
                <span className="text-gray-500 text-xs">
                  {tx.optionType ?? '—'} {tx.strikePrice ? formatCurrency(tx.strikePrice) : ''} x
                  {tx.quantity}
                </span>
                <span className="text-right text-gray-500">{formatCurrency(tx.price)}</span>
                <span className="text-right font-semibold">
                  {formatCurrency(tx.quantity * tx.price * 100)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {total > PAGE_SIZE && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">
              {offset + 1}–{Math.min(offset + PAGE_SIZE, total)} of {total}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={offset === 0}
                onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
                className="bg-white border-gray-200 text-xs"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={offset + PAGE_SIZE >= total}
                onClick={() => setOffset(offset + PAGE_SIZE)}
                className="bg-white border-gray-200 text-xs"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}
