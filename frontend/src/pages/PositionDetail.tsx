import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertCircleIcon, ArrowLeftIcon, Clock3Icon } from 'lucide-react';
import { PageShell } from '@/components/layout/PageShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { portfolioService, stockService } from '@/services';
import type { OptionsContract, Position, Transaction } from '@/types';
import { formatCurrency, formatPercent, pnlColor } from '@/utils/format';
import { daysToExpiry, greeks, priceOption } from '@/utils/options';

const CONTRACT_MULTIPLIER = 100;
const TRANSACTION_FETCH_LIMIT = 200;

type OptionPosition = Position & {
  optionType: 'CALL' | 'PUT';
  strikePrice: number;
  expirationDate: string;
};

interface StockDetailLocationState {
  tradeMode?: 'buy' | 'sell';
  preselectedContract?: OptionsContract;
  defaultPremium?: number;
  openTrade?: boolean;
  underlyingPrice?: number;
  fallbackCompanyName?: string;
}

function isOptionPosition(position: Position | null | undefined): position is OptionPosition {
  return Boolean(
    position &&
      position.optionType &&
      (position.optionType === 'CALL' || position.optionType === 'PUT') &&
      typeof position.strikePrice === 'number' &&
      typeof position.expirationDate === 'string'
  );
}

function formatDisplayDate(dateString: string): string {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDecimal(value: number, digits = 3): string {
  return value.toFixed(digits);
}

function formatSignedCurrency(value: number): string {
  return `${value >= 0 ? '+' : '-'}${formatCurrency(Math.abs(value))}`;
}

function formatSignedPercent(value: number): string {
  return formatPercent(value);
}

function formatPlainPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

function isExpired(expirationDate: string): boolean {
  return new Date(`${expirationDate}T23:59:59`).getTime() < Date.now();
}

function matchesContract(transaction: Transaction, position: OptionPosition): boolean {
  if (position.contractSymbol && transaction.contractSymbol) {
    return transaction.contractSymbol === position.contractSymbol;
  }

  return (
    transaction.symbol === position.symbol &&
    transaction.optionType === position.optionType &&
    transaction.strikePrice === position.strikePrice &&
    transaction.expirationDate === position.expirationDate
  );
}

function MetricCard({
  label,
  value,
  valueClassName,
  hint,
}: {
  label: string;
  value: string;
  valueClassName?: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-[11px] uppercase tracking-wide text-gray-400">{label}</p>
      <p className={`mt-2 text-lg font-semibold tabular-nums text-gray-900 ${valueClassName ?? ''}`}>
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-gray-500">{hint}</p> : null}
    </div>
  );
}

export default function PositionDetail() {
  const { positionId } = useParams<{ positionId: string }>();
  const [position, setPosition] = useState<OptionPosition | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stockPrice, setStockPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!positionId) {
      setError('No position was selected.');
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const loadPosition = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const portfolio = await portfolioService.getPortfolio();
        const matchedPosition = portfolio.positions.find((item) => item.id === positionId);

        if (!isOptionPosition(matchedPosition)) {
          if (!cancelled) {
            setPosition(null);
            setTransactions([]);
            setStockPrice(null);
            setError('That options position could not be found.');
          }
          return;
        }

        if (!cancelled) {
          setPosition(matchedPosition);
        }

        const [stockDetail, transactionResponse] = await Promise.allSettled([
          stockService.getDetail(matchedPosition.symbol),
          portfolioService.getTransactions({
            limit: TRANSACTION_FETCH_LIMIT,
            offset: 0,
            sort: 'desc',
            symbol: matchedPosition.symbol,
          }),
        ]);

        if (cancelled) return;

        if (stockDetail.status === 'fulfilled') {
          setStockPrice(stockDetail.value.currentPrice);
        } else {
          setStockPrice(null);
        }

        if (transactionResponse.status === 'fulfilled') {
          setTransactions(
            transactionResponse.value.transactions.filter((transaction) =>
              matchesContract(transaction, matchedPosition)
            )
          );
        } else {
          setTransactions([]);
        }
      } catch {
        if (!cancelled) {
          setError('Unable to load this position right now.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadPosition();

    return () => {
      cancelled = true;
    };
  }, [positionId]);

  const derived = useMemo(() => {
    if (!position) return null;

    const expirationDate = position.expirationDate.split('T')[0];
    const optionType = position.optionType.toLowerCase() as 'call' | 'put';
    const underlyingPrice = stockPrice ?? 0;
    const currentPremium =
      underlyingPrice > 0
        ? priceOption(
            underlyingPrice,
            position.strikePrice,
            expirationDate,
            optionType,
            position.symbol
          )
        : position.currentPrice ?? position.avgCost;
    const premiumChange = currentPremium - position.avgCost;
    const premiumChangePercent =
      position.avgCost === 0 ? 0 : (premiumChange / position.avgCost) * 100;
    const totalCostBasis = position.quantity * position.avgCost * CONTRACT_MULTIPLIER;
    const totalPositionValue = position.quantity * currentPremium * CONTRACT_MULTIPLIER;
    const unrealizedPnL = totalPositionValue - totalCostBasis;
    const unrealizedPnLPercent =
      totalCostBasis === 0 ? 0 : (unrealizedPnL / totalCostBasis) * 100;
    const dte = daysToExpiry(expirationDate);
    const expired = isExpired(expirationDate);
    const greekValues =
      underlyingPrice > 0
        ? greeks(underlyingPrice, position.strikePrice, expirationDate, optionType, position.symbol)
        : null;

    return {
      currentPremium,
      premiumChange,
      premiumChangePercent,
      totalCostBasis,
      totalPositionValue,
      unrealizedPnL,
      unrealizedPnLPercent,
      dte,
      expired,
      greekValues,
      expirationDate,
    };
  }, [position, stockPrice]);

  if (isLoading) {
    return (
      <PageShell>
        <div className="mx-auto max-w-6xl space-y-6">
          <Skeleton className="h-10 w-44" />
          <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <Skeleton className="h-72 w-full rounded-2xl" />
            <Skeleton className="h-72 w-full rounded-2xl" />
          </div>
          <Skeleton className="h-72 w-full rounded-2xl" />
        </div>
      </PageShell>
    );
  }

  if (error || !position || !derived) {
    return (
      <PageShell>
        <div className="mx-auto max-w-3xl space-y-4">
          <Button asChild variant="ghost" className="w-fit px-0 text-gray-500 hover:text-gray-900">
            <Link to="/portfolio">
              <ArrowLeftIcon className="mr-2 size-4" />
              Back to portfolio
            </Link>
          </Button>
          <Alert variant="destructive">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertDescription>{error ?? 'Position not found.'}</AlertDescription>
          </Alert>
        </div>
      </PageShell>
    );
  }

  const sellContract: OptionsContract = {
    ticker: position.contractSymbol ?? `O:${position.symbol}`,
    contract_type: position.optionType.toLowerCase() as 'call' | 'put',
    strike_price: position.strikePrice,
    expiration_date: derived.expirationDate,
    underlying_ticker: position.symbol,
    shares_per_contract: CONTRACT_MULTIPLIER,
  };

  const sellState: StockDetailLocationState = {
    tradeMode: 'sell',
    preselectedContract: sellContract,
    defaultPremium: derived.currentPremium,
    openTrade: true,
    underlyingPrice: stockPrice ?? undefined,
    fallbackCompanyName: position.symbol,
  };

  const underlyingViewState: StockDetailLocationState = {
    underlyingPrice: stockPrice ?? undefined,
    fallbackCompanyName: position.symbol,
  };

  const dteLabel = derived.expired
    ? 'Expired'
    : derived.dte === 0
      ? 'Expires today'
      : `${derived.dte} day${derived.dte === 1 ? '' : 's'} remaining`;

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <Button asChild variant="ghost" className="w-fit px-0 text-gray-500 hover:text-gray-900">
              <Link to="/portfolio">
                <ArrowLeftIcon className="mr-2 size-4" />
                Back to portfolio
              </Link>
            </Button>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">{position.symbol}</h1>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                    position.optionType === 'CALL'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-orange-50 text-orange-600'
                  }`}
                >
                  {position.optionType}
                </span>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                  {formatCurrency(position.strikePrice)} strike
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                {position.contractSymbol ?? `${position.symbol} ${position.optionType} contract`}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="outline" className="border-gray-200">
              <Link to={`/stock/${position.symbol}`} state={underlyingViewState}>
                View Underlying
              </Link>
            </Button>
            <Button asChild className="bg-orange-500 text-white hover:bg-orange-600">
              <Link to={`/stock/${position.symbol}`} state={sellState}>
                Sell Position
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
          <Card className="border-gray-200 shadow-none">
            <CardHeader className="border-b border-gray-200">
              <CardTitle className="text-lg">Contract Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard label="Underlying Symbol" value={position.symbol} />
                <MetricCard label="Strike Price" value={formatCurrency(position.strikePrice)} />
                <MetricCard label="Expiration Date" value={formatDisplayDate(derived.expirationDate)} />
                <MetricCard label="Contract Type" value={position.optionType === 'CALL' ? 'Call' : 'Put'} />
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                  label="Days to Expiration"
                  value={dteLabel}
                  valueClassName={
                    !derived.expired && derived.dte < 7 ? 'text-red-500' : undefined
                  }
                  hint={derived.expired ? 'This contract is no longer active.' : 'Time left until expiration.'}
                />
                <MetricCard
                  label="Current Premium"
                  value={formatCurrency(derived.currentPremium)}
                  hint={`${formatSignedCurrency(derived.premiumChange)} (${formatSignedPercent(
                    derived.premiumChangePercent
                  )}) vs average premium`}
                  valueClassName={derived.premiumChange === 0 ? undefined : pnlColor(derived.premiumChange)}
                />
                <MetricCard
                  label="Underlying Price"
                  value={stockPrice === null ? 'Unavailable' : formatCurrency(stockPrice)}
                  hint="15-minute delayed market data"
                />
                <MetricCard
                  label="Contracts"
                  value={`${position.quantity}`}
                  hint={`1 contract = ${CONTRACT_MULTIPLIER} shares`}
                />
              </div>

              <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                Prices and Greeks use 15-minute delayed underlying data for educational purposes.
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-none">
            <CardHeader className="border-b border-gray-200">
              <CardTitle className="text-lg">Position Value</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <MetricCard label="Average Premium" value={formatCurrency(position.avgCost)} />
              <MetricCard label="Total Cost Basis" value={formatCurrency(derived.totalCostBasis)} />
              <MetricCard label="Total Position Value" value={formatCurrency(derived.totalPositionValue)} />
              <MetricCard
                label="Unrealized P&L"
                value={`${formatSignedCurrency(derived.unrealizedPnL)} (${formatSignedPercent(
                  derived.unrealizedPnLPercent
                )})`}
                valueClassName={pnlColor(derived.unrealizedPnL)}
              />
            </CardContent>
          </Card>
        </div>

        <Card className="border-gray-200 shadow-none">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="text-lg">Greeks</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {derived.greekValues ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <MetricCard label="Delta" value={formatDecimal(derived.greekValues.delta)} />
                <MetricCard label="Gamma" value={formatDecimal(derived.greekValues.gamma, 4)} />
                <MetricCard label="Theta" value={formatDecimal(derived.greekValues.theta, 2)} />
                <MetricCard label="Vega" value={formatDecimal(derived.greekValues.vega, 2)} />
                <MetricCard
                  label="Implied Volatility"
                  value={formatPlainPercent(derived.greekValues.iv * 100)}
                  hint="Model-derived IV"
                />
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-sm text-gray-500">
                Greeks are unavailable until the underlying stock price can be loaded.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-none">
          <CardHeader className="border-b border-gray-200">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-lg">Trade History</CardTitle>
              <div className="inline-flex items-center gap-2 text-xs text-gray-500">
                <Clock3Icon className="size-3.5" />
                Filtered to this contract by option symbol
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {transactions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
                No trades found for this options contract yet.
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <div className="hidden grid-cols-[1.1fr_0.8fr_1.2fr_0.9fr_1fr] gap-4 bg-gray-50 px-4 py-3 text-[11px] uppercase tracking-wide text-gray-400 md:grid">
                  <span>Date</span>
                  <span>Type</span>
                  <span>Contract</span>
                  <span className="text-right">Premium</span>
                  <span className="text-right">Total</span>
                </div>
                <div className="divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="grid gap-3 px-4 py-4 md:grid-cols-[1.1fr_0.8fr_1.2fr_0.9fr_1fr] md:items-center"
                    >
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-400 md:hidden">Date</p>
                        <p className="text-sm text-gray-700">
                          {formatDisplayDate(transaction.executedAt)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-400 md:hidden">Type</p>
                        <span
                          className={`inline-flex w-fit rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                            transaction.type === 'BUY'
                              ? 'bg-emerald-50 text-emerald-700'
                              : transaction.type === 'SELL'
                                ? 'bg-orange-50 text-orange-600'
                                : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {transaction.type.replaceAll('_', ' ')}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-400 md:hidden">Contract</p>
                        <p className="text-sm font-medium text-gray-900">
                          {transaction.contractSymbol ?? position.contractSymbol ?? position.symbol}
                        </p>
                        <p className="text-xs text-gray-500">
                          {transaction.quantity} contract{transaction.quantity === 1 ? '' : 's'}
                        </p>
                      </div>
                      <div className="md:text-right">
                        <p className="text-xs uppercase tracking-wide text-gray-400 md:hidden">Premium</p>
                        <p className="text-sm text-gray-700">{formatCurrency(transaction.price)}</p>
                      </div>
                      <div className="md:text-right">
                        <p className="text-xs uppercase tracking-wide text-gray-400 md:hidden">Total</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatCurrency(transaction.quantity * transaction.price * CONTRACT_MULTIPLIER)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
