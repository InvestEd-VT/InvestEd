import { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import type { OptionsContract } from '@/types';
import { formatCurrency } from '@/utils/format';
import { priceOption, greeks, daysToExpiry } from '@/utils/options';
import { ArrowRightIcon } from 'lucide-react';

interface OptionsChainProps {
  contracts: OptionsContract[];
  onSelectContract: (contract: OptionsContract, theoreticalPrice: number) => void;
  isLoading: boolean;
  accentColor?: 'emerald' | 'orange';
  currentPrice?: number;
  ticker?: string;
}

interface PricedContract {
  contract: OptionsContract;
  premium: number;
  totalCost: number;
  delta: number;
  iv: number;
  dte: number;
}

export function OptionsChain({
  contracts,
  onSelectContract,
  isLoading,
  accentColor = 'emerald',
  currentPrice,
  ticker = '',
}: OptionsChainProps) {
  const pricedContracts = useMemo<PricedContract[]>(() => {
    if (!currentPrice || contracts.length === 0) {
      return contracts.map((c) => ({
        contract: c,
        premium: 0,
        totalCost: 0,
        delta: 0,
        iv: 0,
        dte: daysToExpiry(c.expiration_date),
      }));
    }

    return contracts.map((c) => {
      const premium = priceOption(
        currentPrice,
        c.strike_price,
        c.expiration_date,
        c.contract_type,
        ticker
      );
      const g = greeks(currentPrice, c.strike_price, c.expiration_date, c.contract_type, ticker);
      return {
        contract: c,
        premium,
        totalCost: premium * 100,
        delta: g.delta,
        iv: g.iv,
        dte: daysToExpiry(c.expiration_date),
      };
    });
  }, [contracts, currentPrice, ticker]);

  // Find marker index for current price line
  const markerIndex = useMemo(() => {
    if (!currentPrice || contracts.length === 0) return -1;
    if (currentPrice < contracts[0].strike_price) return 0;
    if (currentPrice >= contracts[contracts.length - 1].strike_price) return -1;
    for (let i = 0; i < contracts.length - 1; i++) {
      if (
        contracts[i].strike_price <= currentPrice &&
        contracts[i + 1].strike_price > currentPrice
      ) {
        return i + 1;
      }
    }
    return -1;
  }, [contracts, currentPrice]);

  if (isLoading) {
    return (
      <div className="space-y-1">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-11 w-full rounded-none" />
        ))}
      </div>
    );
  }

  if (contracts.length === 0) {
    return <p className="text-center py-12 text-gray-400 text-sm">No contracts available</p>;
  }

  const isGreen = accentColor === 'emerald';
  const hoverBg = isGreen ? 'hover:bg-green-50' : 'hover:bg-orange-50';
  const priceBg = isGreen ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-500';

  const isITM = (strike: number, type: string) => {
    if (!currentPrice) return false;
    return type === 'call' ? strike < currentPrice : strike > currentPrice;
  };

  return (
    <div>
      {/* Table header */}
      <div className="grid grid-cols-7 px-4 py-2 text-[11px] font-medium text-gray-400 uppercase tracking-wider border-b border-gray-200">
        <span>Strike</span>
        <span>Premium</span>
        <span>Total Cost</span>
        <span>Delta</span>
        <span>IV</span>
        <span>DTE</span>
        <span className="text-right">Action</span>
      </div>

      {/* Rows with current price marker */}
      <div>
        {pricedContracts.map(({ contract, premium, totalCost, delta, iv, dte }, index) => (
          <div key={contract.ticker}>
            {/* Current price marker */}
            {index === markerIndex && currentPrice && (
              <div className="relative flex items-center my-0.5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-dashed border-blue-400" />
                </div>
                <div className="relative flex items-center mx-auto bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm gap-1.5">
                  <ArrowRightIcon className="size-3" />
                  Current: {formatCurrency(currentPrice)}
                </div>
              </div>
            )}

            <button
              onClick={() => onSelectContract(contract, premium)}
              className={`grid grid-cols-7 items-center w-full px-4 py-2.5 text-sm text-left transition-colors border-b border-gray-50 ${hoverBg} cursor-pointer`}
            >
              <span
                className={`font-semibold ${
                  currentPrice && isITM(contract.strike_price, contract.contract_type)
                    ? 'text-blue-600'
                    : ''
                }`}
              >
                {formatCurrency(contract.strike_price)}
              </span>

              <span className={`font-semibold ${isGreen ? 'text-green-600' : 'text-orange-500'}`}>
                ${premium.toFixed(2)}
              </span>

              <span className="text-gray-600">{formatCurrency(totalCost)}</span>

              <span className="text-gray-500 text-xs font-mono">
                {delta > 0 ? '+' : ''}
                {delta.toFixed(2)}
              </span>

              <span className="text-gray-500 text-xs font-mono">{(iv * 100).toFixed(1)}%</span>

              <span
                className={`text-xs ${dte === 0 ? 'text-red-500 font-semibold' : 'text-gray-500'}`}
              >
                {dte === 0 ? '0DTE' : `${dte}d`}
              </span>

              <span className="text-right">
                <span className={`inline-block px-3 py-1 rounded text-xs font-semibold ${priceBg}`}>
                  Trade
                </span>
              </span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
