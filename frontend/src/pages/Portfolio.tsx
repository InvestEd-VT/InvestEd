import { useState, useEffect, useMemo } from 'react';
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
import { greeks, daysToExpiry } from '@/utils/options';
import { Sparkline } from '@/components/portfolio/Sparkline';
import { ThetaDecayBar } from '@/components/portfolio/ThetaDecayBar';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
} from 'recharts';

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
  const [recentTrades, setRecentTrades] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const navigate = useNavigate();

  const positions = enrichedPositions;
  const totalLiveValue = positions.reduce((s, p) => s + p.liveValue, 0);
  const totalPnl = positions.reduce((s, p) => s + p.pnl, 0);
  const totalPortfolioValue = (portfolio?.cashBalance ?? 0) + totalLiveValue;
  const totalPnlPercent = totalPortfolioValue > 0 ? (totalPnl / 10000) * 100 : 0; // vs starting $10k
  const openPositionsCount = positions.length;
  const unrealizedPnl = totalPnl;
  const realizedPnl = portfolio?.realizedPnL ?? 0;
  const winRate =
    portfolio?.winRate !== null && portfolio?.winRate !== undefined ? `${portfolio.winRate}%` : '-';

  const netGreeks = useMemo(() => {
    let delta = 0;
    let gamma = 0;
    let theta = 0;
    let vega = 0;

    for (const p of positions) {
      if (!p.strikePrice || !p.expirationDate || !p.stockPrice) continue;

      const type = (p.optionType?.toLowerCase() as 'call' | 'put') ?? 'call';

      const g = greeks(p.stockPrice, p.strikePrice, p.expirationDate.split('T')[0], type, p.symbol);

      const multiplier = (p.quantity ?? 0) * 100;

      delta += g.delta * multiplier;
      gamma += g.gamma * multiplier;
      theta += g.theta * multiplier;
      vega += g.vega * multiplier;
    }

    return { delta, gamma, theta, vega };
  }, [positions]);

  const allocationData = useMemo(() => {
    const map = new Map<string, number>();

    for (const p of positions) {
      map.set(p.symbol, (map.get(p.symbol) ?? 0) + p.liveValue);
    }

    return Array.from(map.entries()).map(([symbol, value]) => ({
      name: symbol,
      value,
    }));
  }, [positions]);

  const pnlBySymbolData = useMemo(() => {
    const map = new Map<string, number>();

    for (const p of positions) {
      map.set(p.symbol, (map.get(p.symbol) ?? 0) + p.pnl);
    }

    return Array.from(map.entries()).map(([symbol, pnl]) => ({
      symbol,
      pnl,
    }));
  }, [positions]);

  const COLORS = [
    '#3b82f6', // blue
    '#a855f7', // purple
    '#14b8a6', // teal
    '#8b5cf6', // violet
    '#f43f5e', // pink
    '#0ea5e9', // cyan
    '#eab308', // yellow
  ];

  const CALL_COLOR = '#22c55e';
  const PUT_COLOR = '#ef4444';

  const allocationWithColors = allocationData.map((d, i) => ({
    ...d,
    color: COLORS[i % COLORS.length],
  }));

  const callPutRatio = useMemo(() => {
    let calls = 0;
    let puts = 0;

    for (const p of positions) {
      if ((p.optionType ?? '').toUpperCase() === 'CALL') {
        calls += p.liveValue;
      } else {
        puts += p.liveValue;
      }
    }

    const total = calls + puts || 1;

    return {
      calls,
      puts,
      callPct: (calls / total) * 100,
      putPct: (puts / total) * 100,
    };
  }, [positions]);

  const periodMap: Record<string, string> = {
    ALL: 'all',
    '1M': '30d',
    '1W': '7d',
    '1D': '7d',
  };

  const fetchHistory = async (selectedPeriod: string) => {
    try {
      const res = await portfolioService.getPortfolioHistory(periodMap[selectedPeriod]);

      setHistory(res.history);
    } catch {
      setHistory([]);
    }
  };

  useEffect(() => {
    fetchHistory(period);
  }, [period]);

  const fetchRecentTrades = async () => {
    try {
      const res = await portfolioService.getTransactions({ limit: 5 });
      setRecentTrades(res.transactions ?? []);
    } catch {
      setRecentTrades([]);
    }
  };

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
    fetchRecentTrades();
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

  const getDTE = (expiration?: string | null) => {
    if (!expiration) return null;
    const exp = new Date(expiration);
    return Math.max(0, Math.ceil((exp.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  };

  const expiringPositions = positions.filter((p) => {
    const dte = getDTE(p.expirationDate);
    return dte !== null && dte <= 7;
  });

  return (
    <PageShell>
      <div className="max-w-full space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Portfolio</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowReset(!showReset)}
              className="text-xs text-gray-400 hover:text-red-500 cursor-pointer transition-colors"
            >
              Reset Portfolio
            </button>
          </div>
        </div>

        {/* Reset Portfolio Modal */}
        <Sheet
          open={showReset}
          onOpenChange={(open) => {
            setShowReset(open);
            if (!open) setResetInput('');
          }}
        >
          <SheetContent className="sm:max-w-100">
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
                  className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
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

        {/* Expiring Positions Alert */}
        {expiringPositions.length > 0 && (
          <div
            className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
              expiringPositions.some((p) => getDTE(p.expirationDate)! <= 3)
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-amber-50 border-amber-200 text-amber-700'
            }`}
          >
            <div className="font-semibold mb-1">⚠ Expiring Positions</div>
            <div className="flex flex-wrap gap-2">
              {expiringPositions.map((p) => (
                <span key={p.id} className="font-medium">
                  {p.symbol} ({getDTE(p.expirationDate)}DTE)
                </span>
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
              <p className={`text-lg font-semibold mt-1 text-gray-900`}>{winRate}</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-[11px] text-gray-500 uppercase tracking-wide">Open Positions</p>
              <p className="text-lg font-semibold mt-1 text-gray-900">{openPositionsCount}</p>
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
              {positions.map((position) => {
                const costBasis = Number(position.avgCost) * Number(position.quantity) * 100;
                return (
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
                                {exp.toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                                <span
                                  className={
                                    dte <= 3
                                      ? 'text-red-600'
                                      : dte <= 7
                                        ? 'text-amber-600'
                                        : 'text-gray-500'
                                  }
                                >
                                  {' '}
                                  ({dte}DTE)
                                </span>
                              </span>
                            );
                          })()}
                      </p>
                      {position.strikePrice &&
                        position.expirationDate &&
                        (() => {
                          const type =
                            (position.optionType?.toLowerCase() as 'call' | 'put') ?? 'call';
                          const expStr = position.expirationDate?.split('T')[0];
                          const g =
                            position.stockPrice && position.strikePrice && expStr
                              ? greeks(
                                  position.stockPrice,
                                  position.strikePrice,
                                  expStr,
                                  type,
                                  position.symbol
                                )
                              : null;

                          const dte = expStr ? daysToExpiry(expStr) : 0;

                          return (
                            <>
                              <p className="text-[11px] text-gray-400">
                                {g && (
                                  <>
                                    Δ {g.delta.toFixed(2)} · Θ {g.theta.toFixed(2)} /day · Γ{' '}
                                    {g.gamma.toFixed(4)} · V {g.vega.toFixed(2)}
                                  </>
                                )}
                              </p>
                              {g && (
                                <ThetaDecayBar
                                  theta={g.theta}
                                  dte={dte}
                                  quantity={Number(position.quantity)}
                                />
                              )}
                            </>
                          );
                        })()}
                    </div>

                    <div className="flex flex-col items-center mr-3">
                      <Sparkline symbol={position.symbol} />
                    </div>

                    <div className="text-right mr-4">
                      <p className="text-sm font-medium">{formatCurrency(position.liveValue)}</p>
                      <p className={`text-xs ${pnlColor(position.pnl)}`}>
                        {formatCurrency(position.pnl)} ({formatPercent(position.pnlPercent)})
                      </p>
                      <p className="text-[11px] text-gray-400">
                        Cost Basis: {formatCurrency(costBasis)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/portfolio/positions/${position.id}`)}
                        className="px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => handleSell(position)}
                        className="px-3 py-1.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-500 hover:bg-orange-100 transition-colors cursor-pointer"
                      >
                        Sell
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {portfolio && (
          <div className="space-y-6">
            <div className="h-px bg-gray-200" />

            <div>
              <h2 className="text-sm font-medium text-gray-500 mb-3">Details</h2>
              <div className="grid grid-cols-3 gap-4">
                {/* Net Greeks Exposure */}
                <div className="rounded-xl border border-gray-200 p-4 space-y-4">
                  <h2 className="text-sm font-medium text-gray-500">Net Greeks Exposure</h2>

                  {[
                    { label: 'Delta', value: netGreeks.delta },
                    { label: 'Gamma', value: netGreeks.gamma },
                    { label: 'Theta ($/day)', value: netGreeks.theta },
                    { label: 'Vega', value: netGreeks.vega },
                  ].map((g) => {
                    return (
                      <div key={g.label} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">{g.label}</span>
                          <span className="font-medium text-gray-900">{g.value.toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Allocation */}
                <div className="rounded-xl border border-gray-200 p-4">
                  <h2 className="text-sm font-medium text-gray-500 mb-3">Allocation</h2>

                  <div className="flex items-center">
                    {/* Pie Chart */}
                    <div className="w-3/4 h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={allocationWithColors}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={45}
                            outerRadius={70}
                          >
                            {allocationWithColors.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Legend */}
                    <div className="w-1/2 pl-4 space-y-2">
                      {allocationWithColors.map((d) => {
                        const total = allocationWithColors.reduce((s, x) => s + x.value, 0);
                        const pct = total ? (d.value / total) * 100 : 0;

                        return (
                          <div key={d.name} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: d.color }}
                              />
                              <span className="text-gray-600">{d.name}</span>
                            </div>
                            <span className="font-medium text-gray-900">{pct.toFixed(1)}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Calls vs. Puts */}
                <div className="rounded-xl border border-gray-200 p-4 space-y-4">
                  <h2 className="text-sm font-medium text-gray-500">Calls vs. Puts</h2>

                  <div className="text-sm text-gray-700 space-y-2">
                    <div className="flex justify-between">
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                        Calls
                      </span>
                      <span>{callPutRatio.callPct.toFixed(1)}%</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                        Puts
                      </span>
                      <span>{callPutRatio.putPct.toFixed(1)}%</span>
                    </div>
                  </div>

                  <div className="h-2 rounded-full overflow-hidden flex">
                    <div
                      style={{
                        width: `${callPutRatio.callPct}%`,
                        backgroundColor: CALL_COLOR,
                      }}
                    />
                    <div
                      style={{
                        width: `${callPutRatio.putPct}%`,
                        backgroundColor: PUT_COLOR,
                      }}
                    />
                  </div>
                </div>

                {/* P&L by Symbol */}
                <div className="rounded-xl border border-gray-200 p-4 col-span-3">
                  <h2 className="text-sm font-medium text-gray-500 mb-3">P&L by Symbol</h2>

                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={pnlBySymbolData}>
                        <XAxis dataKey="symbol" tick={{ fontSize: 12 }} />
                        <YAxis
                          domain={[
                            (dataMin: number) => Math.min(dataMin, 0),
                            (dataMax: number) => Math.max(dataMax, 0),
                          ]}
                          tickFormatter={(v) => `$${v}`}
                        />
                        <ReTooltip formatter={(value: number) => formatCurrency(value)} />
                        <Bar dataKey="pnl" minPointSize={3}>
                          {pnlBySymbolData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.pnl >= 0 ? '#22c55e' : '#ef4444'}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Recent Activity Feed */}
                <div className="rounded-xl border border-gray-200 p-4 col-span-3">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-medium text-gray-500">Recent Activity</h2>
                    <button
                      onClick={() => navigate('/transactions')}
                      className="text-xs text-gray-900 hover:underline cursor-pointer"
                    >
                      View all
                    </button>
                  </div>

                  <div className="space-y-3">
                    {recentTrades.length === 0 ? (
                      <p className="text-xs text-gray-400">No recent trades</p>
                    ) : (
                      <div>
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
                        {recentTrades.map((tx, i) => (
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
                              {tx.optionType ?? '—'}{' '}
                              {tx.strikePrice ? formatCurrency(tx.strikePrice) : ''} x{tx.quantity}
                            </span>
                            <span className="text-right text-gray-500">
                              {formatCurrency(tx.price)}
                            </span>
                            <span className="text-right font-semibold">
                              {formatCurrency(tx.quantity * tx.price * 100)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
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
