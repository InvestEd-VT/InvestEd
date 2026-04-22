import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card'; // used for empty state
import { PageShell } from '../components/layout/PageShell';
import { Sparkline } from '../components/portfolio/Sparkline';
import { useToast } from '../hooks';
import { XIcon, PlusIcon, StarIcon } from 'lucide-react';

interface WatchlistItem {
  id: string;
  symbol: string;
  addedAt: string;
}

export default function Watchlist() {
  const { toast } = useToast();

  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [symbolInput, setSymbolInput] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [removingSymbol, setRemovingSymbol] = useState<string | null>(null);

  const fetchWatchlist = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get<{ watchlist: WatchlistItem[] }>('/watchlist');
      setWatchlist(response.data.watchlist);
    } catch {
      // Don't toast on initial load failure to avoid re-render loops
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const symbol = symbolInput.trim().toUpperCase();

    if (!symbol) return;

    if (watchlist.some((item) => item.symbol === symbol)) {
      toast({
        title: 'Error',
        description: `${symbol} is already in your watchlist`,
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsAdding(true);
      await api.post('/watchlist', { symbol });
      setSymbolInput('');
      await fetchWatchlist();
      toast({
        title: 'Success',
        description: `${symbol} added to watchlist`,
      });
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to add stock';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemove = async (symbol: string) => {
    try {
      setRemovingSymbol(symbol);
      await api.delete(`/watchlist/${symbol}`);
      setWatchlist((prev) => prev.filter((item) => item.symbol !== symbol));
      toast({
        title: 'Success',
        description: `${symbol} removed from watchlist`,
      });
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to remove stock';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setRemovingSymbol(null);
    }
  };

  return (
    <PageShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Watchlist</h1>
            <p className="text-sm text-gray-500 mt-1">Track your favorite stocks</p>
          </div>
          <form onSubmit={handleAdd} className="flex gap-2">
            <Input
              value={symbolInput}
              onChange={(e) => setSymbolInput(e.target.value)}
              placeholder="e.g. AAPL"
              className="w-32"
            />
            <Button type="submit" disabled={isAdding || !symbolInput.trim()} size="sm">
              <PlusIcon className="size-4 mr-1" />
              {isAdding ? 'Adding...' : 'Add'}
            </Button>
          </form>
        </div>

        {/* Watchlist */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted rounded animate-pulse" />
            ))}
          </div>
        ) : watchlist.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <StarIcon className="size-10 text-muted-foreground mb-3" />
                <p className="text-muted-foreground text-sm">
                  Your watchlist is empty. Add a stock symbol above to get started.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-200">
            {watchlist.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-6 flex-1 min-w-0">
                  <div className="min-w-[60px]">
                    <p className="text-sm font-semibold">{item.symbol}</p>
                    <p className="text-[11px] text-gray-400">
                      Added {new Date(item.addedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Sparkline symbol={item.symbol} width={120} height={32} />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemove(item.symbol)}
                  disabled={removingSymbol === item.symbol}
                  className="text-gray-400 hover:text-red-500 ml-4"
                >
                  <XIcon className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
