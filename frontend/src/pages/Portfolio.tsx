import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { PageShell } from '@/components/layout/PageShell';
import { TradeModal } from '@/components/trading/TradeModal';
import { portfolioService, stockService } from '@/services';
import type { Portfolio as PortfolioType, Position, OptionsContract } from '@/types';
import { formatCurrency, formatPercent, pnlColor } from '@/utils/format';
import { priceOption } from '@/utils/options';
import { AlertTriangleIcon } from 'lucide-react';

// Per-position P&L calculated from live stock price + Black-Scholes
interface EnrichedPosition extends Position {
  stockPrice: number; // current underlying stock price
  livePrice: number; // current theoretical option value per share
  liveValue: number; // livePrice × quantity × 100
  pnl: number; // liveValue - costBasis
  pnlPercent: number; // pnl / costBasis × 100
}

export default function Portfolio() {
  const [portfolio, setPortfolio] = useState<PortfolioType | null>(null);
  const [enrichedPositions, setEnrichedPositions] = useState<EnrichedPosition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [resetInput, setResetInput] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [sellContract, setSellContract] = useState<OptionsContract | null>(null);
  const [sellStockPrice, setSellStockPrice] = useState(0);
  const [sellPremium, setSellPremium] = useState(0);
  const [sellOpen, setSellOpen] = useState(false);
  const [period, setPeriod] = useState<'ALL' | '1M' | '1W' | '1D'>('ALL');
  const [history, setHistory] = useState<any[]>([]);
  const navigate = useNavigate();

  const periodMap: Record<string, string> = {
    ALL: 'all',
    '1M': '30d',
    '1W': '7d',
    '1D': '7d',
  };

  const fetchHistory = async (selectedPeriod: string) => {
    try {
      const res = await portfolioService.getPortfolioHistory(
        periodMap[selectedPeriod]
      );

      setHistory(res.history);
    } catch {
      setHistory([]);
    }
  };

  useEffect(() => {
    fetchHistory(period);
  }, [period]);

  const fetchPortfolio = async () => {
    setIsLoading(true);
    try {
      const data = await portfolioService.getPortfolio();
      setPortfolio(data);

      // Calculate live P&L for each position using current stock prices
      if (data.positions.length > 0) {
        const enriched: EnrichedPosition[] = [];
        // Get unique symbols to fetch prices
        const symbols = [...new Set(data.positions.map((p) => p.symbol))];
        const prices = new Map<string, number>();

        for (const sym of symbols) {
          try {
            const detail = await stockService.getDetail(sym);
            prices.set(sym, detail.currentPrice);
          } catch {
            /* rate limited — use avgCost as fallback */
          }
        }

        for (const pos of data.positions) {
          const stockPrice = prices.get(pos.symbol) ?? 0;
          const costBasis = pos.avgCost * pos.quantity * 100;

          let livePrice = pos.avgCost; // fallback = no change
          if (stockPrice > 0 && pos.strikePrice && pos.optionType && pos.expirationDate) {
            const type = pos.optionType.toLowerCase() as 'call' | 'put';
            // Use the REAL expiration date from the position
            const expStr = pos.expirationDate.split('T')[0];
            livePrice = priceOption(stockPrice, pos.strikePrice, expStr, type, pos.symbol);
          }

          const liveValue = livePrice * pos.quantity * 100;
          const pnl = liveValue - costBasis;
          const pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0;

          enriched.push({ ...pos, stockPrice, livePrice, liveValue, pnl, pnlPercent });
        }
        setEnrichedPositions(enriched);
      } else {
        setEnrichedPositions([]);
      }
    } catch {
      // Error handled by empty state
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
    fetchHistory(period);
  }, []);

  const handleReset = async () => {
    if (resetInput !== 'RESET') return;
    setIsResetting(true);
    try {
      await portfolioService.resetPortfolio();
      setShowReset(false);
      setResetInput('');
      fetchPortfolio();
    } catch {
      // Error handled silently
    } finally {
      setIsResetting(false);
    }
  };

  const handleSell = (position: EnrichedPosition) => {
    const contract: OptionsContract = {
      ticker: position.contractSymbol ?? `O:${position.symbol}`,
      contract_type: (position.optionType?.toLowerCase() as 'call' | 'put') ?? 'call',
      strike_price: position.strikePrice ?? 0,
      expiration_date: position.expirationDate?.split('T')[0] ?? '',
      underlying_ticker: position.symbol,
      shares_per_contract: 100,
    };
    setSellContract(contract);
    setSellStockPrice(position.stockPrice);
    setSellPremium(position.livePrice);
    setSellOpen(true);
  };

  const handleTradeClose = () => {
    setSellOpen(false);
    fetchPortfolio();
  };

  if (isLoading) {
    return (
      <PageShell>
        <div className="space-y-8 max-w-5xl">
          <Skeleton className="h-8 w-40" />
          <div className="space-y-3">
            <Skeleton className="h-12 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
          <div className="space-y-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        </div>
      </PageShell>
    );
  }

  const positions = enrichedPositions;
  const totalLiveValue = positions.reduce((s, p) => s + p.liveValue, 0);
  const totalPnl = positions.reduce((s, p) => s + p.pnl, 0);
  const totalPortfolioValue = (portfolio?.cashBalance ?? 0) + totalLiveValue;
  const totalPnlPercent = totalPortfolioValue > 0 ? (totalPnl / 10000) * 100 : 0; // vs starting $10k
  const openPositionsCount = positions.length;
  const unrealizedPnl = totalPnl;
  const realizedPnl = portfolio?.realizedPnL ?? 0;
  const winRate =
    portfolio?.winRate !== null && portfolio?.winRate !== undefined
      ? `${portfolio.winRate}%`
      : '-';

  return (
    <PageShell>
      <div className="max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Portfolio</h1>
          <button
            onClick={() => setShowReset(!showReset)}
            className="text-xs text-gray-400 hover:text-red-500 cursor-pointer transition-colors"
          >
            Reset Portfolio
          </button>
        </div>

        {/* Reset Portfolio Modal */}
        <Sheet
          open={showReset}
          onOpenChange={(open) => {
            setShowReset(open);
            if (!open) setResetInput('');
          }}
        >
          <SheetContent className="sm:max-w-[400px]">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2 text-red-500">
                <AlertTriangleIcon className="size-5" />
                Reset Portfolio
              </SheetTitle>
            </SheetHeader>
            <div className="space-y-5 py-6 px-1">
              <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                <p className="text-sm text-red-600 font-medium mb-1">
                  This action cannot be undone
                </p>
                <p className="text-sm text-red-500">
                  All open positions will be closed and your cash balance will be reset to
                  $10,000.00. Transaction history will be preserved.
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Type "RESET" to confirm</label>
                <Input
                  value={resetInput}
                  onChange={(e) => setResetInput(e.target.value)}
                  placeholder="RESET"
                  className="font-mono tracking-wider"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowReset(false);
                    setResetInput('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  disabled={resetInput !== 'RESET' || isResetting}
                  onClick={handleReset}
                >
                  {isResetting ? 'Resetting...' : 'Reset Portfolio'}
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Big number + Time Tabs */}
        {portfolio && (
          <div className="flex items-end justify-between">
            {/* Left: Portfolio Value */}
            <div className="space-y-1">
              <p className="text-4xl font-bold tracking-tight">
                {formatCurrency(totalPortfolioValue)}
              </p>
              <p className={`text-sm font-medium ${pnlColor(totalPnl)}`}>
                {formatCurrency(totalPnl)} ({formatPercent(totalPnlPercent)})
                <span className="text-gray-400 font-normal ml-2">
                  {period === 'ALL'
                    ? 'All time'
                    : period === '1M'
                    ? '1 Month'
                    : period === '1W'
                    ? '1 Week'
                    : 'Today'}
                </span>
              </p>
            </div>

            {/* Right: Time Period Tabs */}
            <div className="flex gap-2">
              {[
                { label: 'All', value: 'ALL' },
                { label: '1M', value: '1M' },
                { label: '1W', value: '1W' },
                { label: 'Today', value: '1D' },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setPeriod(tab.value as any)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                    period === tab.value
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stats row */}
        {portfolio && (
          <div className="grid grid-cols-6 gap-4">
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-[11px] text-gray-500 uppercase tracking-wide">Cash</p>
              <p className="text-lg font-semibold mt-1 text-gray-900">
                {formatCurrency(portfolio.cashBalance)}
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-[11px] text-gray-500 uppercase tracking-wide">Positions</p>
              <p className="text-lg font-semibold mt-1 text-gray-900">
                {formatCurrency(totalLiveValue)}
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-[11px] text-gray-500 uppercase tracking-wide">Unrealized P&L</p>
              <p className={`text-lg font-semibold mt-1 ${pnlColor(unrealizedPnl)}`}>
                {formatCurrency(unrealizedPnl)}
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-[11px] text-gray-500 uppercase tracking-wide">Realized P&L</p>
              <p className={`text-lg font-semibold mt-1 ${pnlColor(realizedPnl)}`}>
                {formatCurrency(realizedPnl)}
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-[11px] text-gray-500 uppercase tracking-wide">Win Rate</p>
              <p className={`text-lg font-semibold mt-1 text-gray-900`}>
                {winRate}
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-[11px] text-gray-500 uppercase tracking-wide">Open Positions</p>
              <p className="text-lg font-semibold mt-1 text-gray-900">
                {openPositionsCount}
              </p>
            </div>
          </div>
        )}

        <div className="h-px bg-gray-200" />

        {/* Positions */}
        <div>
          <h2 className="text-sm font-medium text-gray-500 mb-3">Open Positions</h2>

          {positions.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400 text-sm">No open positions</p>
              <button
                onClick={() => navigate('/stock/AAPL')}
                className="mt-3 text-sm text-green-500 hover:text-green-400 transition-colors"
              >
                Start trading
              </button>
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-200">
              {positions.map((position) => (
                <div
                  key={position.id}
                  className="flex items-center px-4 py-3.5 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <button
                        className="font-semibold text-sm hover:underline cursor-pointer"
                        onClick={() => navigate(`/stocks/${position.symbol}`)}
                      >
                        {position.symbol}
                      </button>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          position.optionType === 'CALL'
                            ? 'bg-green-50 text-green-600'
                            : 'bg-orange-50 text-orange-500'
                        }`}
                      >
                        {position.optionType ?? position.positionType}
                      </span>
                      {position.strikePrice && (
                        <span className="text-xs text-gray-400">
                          {formatCurrency(position.strikePrice)} strike
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {position.quantity} contract{position.quantity > 1 ? 's' : ''} @{' '}
                      {formatCurrency(position.avgCost)} avg
                      {position.expirationDate &&
                        (() => {
                          const exp = new Date(position.expirationDate!);
                          const dte = Math.max(
                            0,
                            Math.round((exp.getTime() - Date.now()) / 86400000)
                          );
                          return (
                            <span className="ml-2">
                              · Exp{' '}
                              {exp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              <span className={dte <= 7 ? ' text-red-500 font-medium' : ''}>
                                {' '}
                                ({dte}DTE)
                              </span>
                            </span>
                          );
                        })()}
                    </p>
                  </div>

                  <div className="text-right mr-4">
                    <p className="text-sm font-medium">{formatCurrency(position.liveValue)}</p>
                    <p className={`text-xs ${pnlColor(position.pnl)}`}>
                      {formatCurrency(position.pnl)} ({formatPercent(position.pnlPercent)})
                    </p>
                  </div>

                  <button
                    onClick={() => handleSell(position)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-500 hover:bg-orange-100 transition-colors cursor-pointer"
                  >
                    Sell
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {sellContract && (
        <TradeModal
          open={sellOpen}
          onClose={handleTradeClose}
          contract={sellContract}
          stockPrice={sellStockPrice}
          mode="sell"
          defaultPremium={sellPremium}
        />
      )}
    </PageShell>
  );
}
