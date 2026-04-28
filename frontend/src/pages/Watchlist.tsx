import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { stockService } from '../services';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { PageShell } from '../components/layout/PageShell';
import { Sparkline } from '../components/portfolio/Sparkline';
import { useToast } from '../hooks';
import { XIcon, PlusIcon, StarIcon, SearchIcon, LoaderIcon } from 'lucide-react';
import type { StockSearchResult } from '../types';

interface WatchlistItem {
  id: string;
  symbol: string;
  addedAt: string;
}

function WatchlistSearch({
  onAdd,
  watchlist,
  isAdding,
}: {
  onAdd: (symbol: string) => void;
  watchlist: WatchlistItem[];
  isAdding: boolean;
}) {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<StockSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const debounceRef = useRef<number | undefined>(undefined);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [dropdownOpen]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.length < 2) {
      setSearchResults([]);
      setDropdownOpen(false);
      return;
    }

    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await stockService.search(query);
        setSearchResults(data);
        setDropdownOpen(true);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleSelect = (symbol: string) => {
    onAdd(symbol);
    setQuery('');
    setSearchResults([]);
    setDropdownOpen(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value.toUpperCase())}
          onFocus={() => query.length >= 2 && setDropdownOpen(true)}
          placeholder="Search stocks to add to watchlist..."
          className="pl-10 pr-8"
          disabled={isAdding}
        />
        {searching && (
          <LoaderIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400" />
        )}
      </div>

      {dropdownOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden">
          {searching && searchResults.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-gray-400">Searching...</div>
          )}

          {!searching && searchResults.length === 0 && query.length >= 2 && (
            <div className="px-4 py-6 text-center text-sm text-gray-400">
              No stocks found for &quot;{query}&quot;
            </div>
          )}

          {searchResults.length > 0 && (
            <ul className="max-h-64 overflow-y-auto divide-y divide-gray-100">
              {searchResults.map((stock) => {
                const alreadyAdded = watchlist.some((w) => w.symbol === stock.symbol);
                return (
                  <li key={stock.symbol}>
                    <button
                      onClick={() => !alreadyAdded && handleSelect(stock.symbol)}
                      disabled={alreadyAdded || isAdding}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between disabled:opacity-50"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">{stock.symbol}</p>
                        <p className="text-xs text-gray-400 truncate">{stock.companyName}</p>
                      </div>
                      {alreadyAdded ? (
                        <span className="text-[11px] text-gray-400 ml-2">Added</span>
                      ) : (
                        <PlusIcon className="size-4 text-gray-400 ml-2 shrink-0" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default function Watchlist() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingSymbol, setRemovingSymbol] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const fetchWatchlist = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get<{ watchlist: WatchlistItem[] }>('/watchlist');
      setWatchlist(response.data.watchlist);
    } catch {
      // Silent fail on initial load
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  const handleAddSymbol = async (symbol: string) => {
    if (watchlist.some((item) => item.symbol === symbol)) {
      toast({ title: 'Already in watchlist', description: `${symbol} is already tracked` });
      return;
    }

    try {
      setIsAdding(true);
      await api.post('/watchlist', { symbol });
      await fetchWatchlist();
      toast({ title: 'Added', description: `${symbol} added to watchlist` });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to add stock',
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
      toast({ title: 'Removed', description: `${symbol} removed from watchlist` });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to remove stock',
        variant: 'destructive',
      });
    } finally {
      setRemovingSymbol(null);
    }
  };

  const searchOverride = (
    <WatchlistSearch onAdd={handleAddSymbol} watchlist={watchlist} isAdding={isAdding} />
  );

  return (
    <PageShell searchOverride={searchOverride}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Watchlist</h1>
            <p className="text-sm text-gray-500 mt-1">Track your favorite stocks</p>
          </div>

          {/* Mobile-only search (header search is hidden on mobile) */}
          <div className="md:hidden w-60">
            <WatchlistSearch onAdd={handleAddSymbol} watchlist={watchlist} isAdding={isAdding} />
          </div>
        </div>

        {/* Watchlist */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : watchlist.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <StarIcon className="size-10 text-gray-300 mb-3" />
                <p className="text-gray-500 text-sm">
                  Your watchlist is empty. Search for a stock above to get started.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-200">
            {watchlist.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/stock/${item.symbol}`)}
                className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
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
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(item.symbol);
                  }}
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
