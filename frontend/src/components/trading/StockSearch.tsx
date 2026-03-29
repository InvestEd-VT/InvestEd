import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { stockService } from '@/services';
import type { StockSearchResult } from '@/types';
import { SearchIcon, XIcon, LoaderIcon } from 'lucide-react';
import { isAxiosError } from 'axios';

export function StockSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<StockSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const debounceTimer = useRef<number | undefined>(undefined);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle outside click to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Debounced search handler
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      setError(null);
      setIsRateLimited(false);
      return;
    }

    setLoading(true);
    debounceTimer.current = setTimeout(async () => {
      try {
        setError(null);
        setIsRateLimited(false);
        const data = await stockService.search(query);
        setResults(data);
        setIsOpen(true);
      } catch (err) {
        if (isAxiosError(err) && err.response?.status === 429) {
          setIsRateLimited(true);
          setError('API limit reached (5 requests per hour)');
        } else {
          setError('Failed to search stocks');
        }
        console.error('Stock search error:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query]);

  const handleSelectResult = (symbol: string) => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    navigate(`/stock/${symbol}`);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setError(null);
    setIsRateLimited(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search stocks by symbol or name (e.g., AAPL)"
          value={query}
          onChange={(e) => setQuery(e.target.value.toUpperCase())}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
          >
            <XIcon className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-2 border-none rounded-lg shadow-lg">
          {loading && (
            <div className="flex items-center justify-center gap-2 px-4 py-8">
              <LoaderIcon className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Searching...</span>
            </div>
          )}

          {error && (
            <div
              className={`px-4 py-4 text-sm ${
                isRateLimited
                  ? 'border-l-4 border-amber-500 bg-amber-50 text-amber-900'
                  : 'text-destructive'
              }`}
            >
              {error}
            </div>
          )}

          {!loading && !error && results.length === 0 && query.length >= 2 && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No stocks found matching "{query}"
            </div>
          )}

          {!loading && !error && results.length > 0 && (
            <ul className="max-h-96 overflow-y-auto">
              {results.map((stock, index) => (
                <li key={stock.symbol}>
                  {index > 0 && <div className="border-t" />}
                  <button
                    onClick={() => handleSelectResult(stock.symbol)}
                    className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors block"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm">{stock.symbol}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {stock.companyName}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-semibold text-sm">
                          {stock.currentPrice > 0 ? `$${stock.currentPrice.toFixed(2)}` : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
    </div>
  );
}
