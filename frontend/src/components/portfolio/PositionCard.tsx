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
  const totalCostBasis = averagePremium * quantity * CONTRACT_MULTIPLIER;
  const totalValue = currentPremium * quantity * CONTRACT_MULTIPLIER;
  const unrealizedPnl = totalValue - totalCostBasis;
  const unrealizedPnlPercent =
    totalCostBasis > 0 ? (unrealizedPnl / totalCostBasis) * 100 : 0;
  const dte = daysToExpiry(position.expirationDate.split('T')[0]);
  const isNearExpiration = dte < 7;
  const optionTypeLabel = position.optionType === 'CALL' ? 'Call' : 'Put';

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
            <p className="text-lg font-semibold tabular-nums">{formatCurrency(totalValue)}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="grid gap-3 py-4 sm:grid-cols-2 xl:grid-cols-4">
        <DetailItem label="Strike" value={formatCurrency(position.strikePrice)} />
        <DetailItem label="Expiration" value={formatExpirationDate(position.expirationDate)} />
        <DetailItem
          label="Days to Expiration"
          value={`${dte} day${dte === 1 ? '' : 's'}`}
          valueClassName={isNearExpiration ? 'text-rose-600' : undefined}
        />
        <DetailItem
          label="Quantity"
          value={`${quantity} contract${quantity === 1 ? '' : 's'}`}
        />
        <DetailItem label="Average Premium" value={formatCurrency(averagePremium)} />
        <DetailItem label="Current Premium" value={formatCurrency(currentPremium)} />
        <DetailItem
          label="Unrealized P&L"
          value={`${formatCurrency(unrealizedPnl)} (${formatPercent(unrealizedPnlPercent)})`}
          valueClassName={pnlColor(unrealizedPnl)}
        />
        <DetailItem label="Contract Size" value={`1 contract = ${CONTRACT_MULTIPLIER} shares`} />
      </CardContent>

    
    </Card>
  );
}
