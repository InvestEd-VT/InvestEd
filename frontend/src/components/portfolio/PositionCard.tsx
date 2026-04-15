import type { ReactNode } from 'react';
import type { Position } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatCurrency, formatPercent, pnlColor } from '@/utils/format';
import { daysToExpiry } from '@/utils/options';

const CONTRACT_MULTIPLIER = 100;

type OptionPositionCardData = Position & {
  companyName: string;
  optionType: 'CALL' | 'PUT';
  strikePrice: number;
  expirationDate: string;
  currentPrice: number;
};

interface PositionCardProps {
  position: OptionPositionCardData;
  className?: string;
}

function formatExpirationDate(expirationDate: string): string {
  const date = new Date(expirationDate);
  if (Number.isNaN(date.getTime())) {
    return expirationDate;
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function DetailItem({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-lg border bg-background/70 p-3">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={cn('mt-1 text-sm font-medium text-foreground tabular-nums', valueClassName)}>
        {value}
      </p>
    </div>
  );
}

export default function PositionCard({ position, className }: PositionCardProps) {
  const quantity = position.quantity;
  const averagePremium = position.avgCost;
  const currentPremium = position.currentPrice;
  const contractMultiplier = CONTRACT_MULTIPLIER;
  const premiumDifference = currentPremium - averagePremium;
  const premiumDifferencePercent =
    averagePremium === 0 ? 0 : (premiumDifference / averagePremium) * 100;
  const totalCostBasis = averagePremium * quantity * contractMultiplier;
  const totalCurrentValue = currentPremium * quantity * contractMultiplier;
  const unrealizedPnl = totalCurrentValue - totalCostBasis;
  const unrealizedPnlPercent = totalCostBasis > 0 ? (unrealizedPnl / totalCostBasis) * 100 : 0;
  const dte = daysToExpiry(position.expirationDate.split('T')[0]);
  const isNearExpiration = dte < 7;
  const optionTypeLabel = position.optionType === 'CALL' ? 'Call' : 'Put';
  const premiumTrend = premiumDifference > 0 ? 'up' : premiumDifference < 0 ? 'down' : 'flat';
  const premiumTrendLabel =
    premiumTrend === 'up' ? 'UP' : premiumTrend === 'down' ? 'DOWN' : 'FLAT';
  const premiumTrendClasses =
    premiumTrend === 'up'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : premiumTrend === 'down'
        ? 'border-rose-200 bg-rose-50 text-rose-700'
        : 'border-border bg-muted/40 text-muted-foreground';
  const premiumChangeTextClass =
    premiumTrend === 'flat' ? 'text-foreground' : pnlColor(premiumDifference);
  const totalValueTextClass = premiumTrend === 'flat' ? 'text-foreground' : pnlColor(unrealizedPnl);

  return (
    <Card className={cn('@container/card gap-0', className)}>
      <CardHeader className="gap-3 border-b">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-1">
            <CardTitle className="flex flex-wrap items-center gap-2 text-lg font-semibold">
              <span>{position.symbol}</span>
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold',
                  position.optionType === 'CALL'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-rose-50 text-rose-700'
                )}
              >
                {optionTypeLabel}
              </span>
            </CardTitle>
            <p className="truncate text-sm text-muted-foreground">{position.companyName}</p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Total Value</p>
            <p className="text-lg font-semibold tabular-nums">
              {formatCurrency(totalCurrentValue)}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 py-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <DetailItem label="Strike" value={formatCurrency(position.strikePrice)} />
          <DetailItem label="Expiration" value={formatExpirationDate(position.expirationDate)} />
          <DetailItem
            label="Days to Expiration"
            value={`${dte} day${dte === 1 ? '' : 's'}`}
            valueClassName={isNearExpiration ? 'text-rose-600' : undefined}
          />
          <DetailItem label="Quantity" value={`${quantity} contract${quantity === 1 ? '' : 's'}`} />
        </div>

        <div className="rounded-xl border bg-muted/20 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Premium Comparison
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Per-contract premium versus your average entry.
              </p>
            </div>

            <span
              className={cn(
                'inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-xs font-semibold tracking-wide',
                premiumTrendClasses
              )}
            >
              {premiumTrendLabel} vs cost basis
            </span>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <DetailItem label="Average Premium / Contract" value={formatCurrency(averagePremium)} />
            <DetailItem label="Current Premium / Contract" value={formatCurrency(currentPremium)} />
          </div>

          <div className="mt-3 grid gap-3 lg:grid-cols-[1.2fr_1fr_1fr]">
            <div className="rounded-lg border bg-background p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Premium Change
              </p>
              <p
                className={cn('mt-1 text-base font-semibold tabular-nums', premiumChangeTextClass)}
              >
                {formatCurrency(premiumDifference)}
              </p>
              <p className={cn('mt-1 text-sm font-medium tabular-nums', premiumChangeTextClass)}>
                {formatPercent(premiumDifferencePercent)}
              </p>
            </div>

            <DetailItem label="Total Cost Basis" value={formatCurrency(totalCostBasis)} />
            <DetailItem
              label="Total Current Value"
              value={formatCurrency(totalCurrentValue)}
              valueClassName={totalValueTextClass}
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <DetailItem
            label="Unrealized P&L"
            value={`${formatCurrency(unrealizedPnl)} (${formatPercent(unrealizedPnlPercent)})`}
            valueClassName={pnlColor(unrealizedPnl)}
          />
          <DetailItem label="Contract Size" value={`1 contract = ${contractMultiplier} shares`} />
        </div>
      </CardContent>
    </Card>
  );
}
