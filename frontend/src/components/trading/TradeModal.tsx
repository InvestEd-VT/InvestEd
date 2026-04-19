import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { tradeService, portfolioService } from '@/services';
import type { OptionsContract } from '@/types';
import { formatCurrency } from '@/utils/format';
import { PayoffChart } from './PayoffChart';
import axios from 'axios';

interface TradeModalProps {
  open: boolean;
  onClose: () => void;
  contract: OptionsContract;
  stockPrice: number;
  mode: 'buy' | 'sell';
  defaultPremium?: number;
}

export function TradeModal({
  open,
  onClose,
  contract,
  stockPrice,
  mode,
  defaultPremium,
}: TradeModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(defaultPremium ?? 1);
  const [cashBalance, setCashBalance] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);

  const isCall = contract.contract_type === 'call';
  const accent =
    mode === 'buy'
      ? {
          bg: 'bg-green-500',
          hover: 'hover:bg-green-600',
          text: 'text-green-500',
          light: 'bg-green-50',
        }
      : {
          bg: 'bg-orange-500',
          hover: 'hover:bg-orange-600',
          text: 'text-orange-500',
          light: 'bg-orange-50',
        };

  useEffect(() => {
    if (open) {
      setQuantity(1);
      setPrice(defaultPremium ?? 1);
      setErrors([]);
      setSuccess(false);
      portfolioService
        .getPortfolio()
        .then((p) => setCashBalance(p.cashBalance))
        .catch(() => {});
    }
  }, [open, stockPrice, defaultPremium]);

  const multiplier = contract.shares_per_contract || 100;
  const total = quantity * price * multiplier;

  const handleSubmit = async () => {
    setErrors([]);
    setIsSubmitting(true);
    try {
      const tradeData = {
        symbol: contract.underlying_ticker,
        contractSymbol: contract.ticker,
        optionType: contract.contract_type.toUpperCase() as 'CALL' | 'PUT',
        strikePrice: contract.strike_price,
        expirationDate: contract.expiration_date,
        quantity,
        price,
      };

      if (mode === 'buy') {
        await tradeService.buyOption(tradeData);
      } else {
        await tradeService.sellOption(tradeData);
      }

      setSuccess(true);
      setTimeout(() => onClose(), 1200);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const data = error.response.data;
        setErrors([data.error || data.message || 'Trade failed']);
      } else {
        setErrors(['Trade failed. Please try again.']);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="sm:max-w-[400px] bg-white border-gray-200 p-0 flex flex-col">
        <SheetHeader className="p-6 pb-0">
          <SheetTitle className="text-gray-900 text-lg font-semibold">
            {mode === 'buy' ? 'Buy' : 'Sell'}{' '}
            <span className={isCall ? 'text-green-500' : 'text-orange-500'}>
              {contract.contract_type.toUpperCase()}
            </span>
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 flex flex-col p-6 pt-4 space-y-5">
          {/* Contract info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-gray-700">{contract.underlying_ticker}</span>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                  isCall ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-500'
                }`}
              >
                {contract.contract_type.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-[11px] text-gray-400 uppercase tracking-wide">Strike</p>
                <p className="text-sm font-semibold mt-0.5 text-gray-500">
                  {formatCurrency(contract.strike_price)}
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-[11px] text-gray-400 uppercase tracking-wide">Expires</p>
                <p className="text-sm font-semibold mt-0.5 text-gray-500">{contract.expiration_date}</p>
              </div>
            </div>
          </div>

          {/* Inputs */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-xs text-gray-700 uppercase tracking-wide">
                Contracts
              </Label>
              <Input
                id="quantity"
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="bg-white border-gray-200 h-11 text-lg text-gray-500 font-semibold"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price" className="text-xs text-gray-700 uppercase tracking-wide">
                Limit Price (per share)
              </Label>
              <Input
                id="price"
                type="number"
                min={0.01}
                step={0.01}
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                className="bg-white border-gray-200 h-11 text-lg text-gray-500 font-semibold"
              />
            </div>
          </div>

          {/* Order summary */}
          <div className="rounded-lg bg-gray-50 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">
                {quantity} x {formatCurrency(price)} x {multiplier}
              </span>
              <span className="font-semibold">{formatCurrency(total)}</span>
            </div>
            {cashBalance !== null && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Available cash</span>
                <span className="text-gray-500">{formatCurrency(cashBalance)}</span>
              </div>
            )}
            <div className="h-px bg-gray-200 my-1" />
            <div className="flex justify-between text-sm font-semibold">
              <span className='text-gray-400'>Estimated {mode === 'buy' ? 'cost' : 'credit'}</span>
              <span className={accent.text}>{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Payoff chart */}
          <div>
            <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-2">
              Profit / Loss at Expiration
            </p>
            <PayoffChart
              type={contract.contract_type}
              strikePrice={contract.strike_price}
              premium={price}
              quantity={quantity}
              mode={mode}
              stockPrice={stockPrice}
            />
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-500">
              {errors.map((err, i) => (
                <p key={i}>{err}</p>
              ))}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-600 font-medium">
              Trade executed successfully!
            </div>
          )}

          {/* Submit */}
          <div className="mt-auto pt-2">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || success || quantity < 1 || price <= 0}
              className={`w-full py-3 rounded-full font-semibold text-sm text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${accent.bg} ${accent.hover}`}
            >
              {isSubmitting
                ? 'Executing...'
                : success
                  ? 'Done!'
                  : `${mode === 'buy' ? 'Buy' : 'Sell'} ${quantity} Contract${quantity > 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
