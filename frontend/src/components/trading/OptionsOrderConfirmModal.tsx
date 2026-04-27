import { Button } from '@/components/ui/button';
import type { OptionsContract } from '@/types';
import { formatCurrency } from '@/utils/format';

interface OptionsOrderConfirmModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  contract: OptionsContract;
  mode: 'buy' | 'sell';
  quantity: number;
  price: number;
  isSubmitting?: boolean;
}

export default function OptionsOrderConfirmModal({
  open,
  onCancel,
  onConfirm,
  contract,
  mode,
  quantity,
  price,
  isSubmitting = false,
}: OptionsOrderConfirmModalProps) {
  if (!open) return null;

  const multiplier = contract.shares_per_contract || 100;
  const total = quantity * price * multiplier;
  const contractType = contract.contract_type.toUpperCase();

  return (
    <div
      className="fixed inset-0 z-[70]"
      role="dialog"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-description"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />

      <div className="absolute inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center p-4">
        <div className="relative w-full max-w-md rounded-xl border bg-white shadow-xl">
          <div className="border-b px-5 py-4">
            <h2 id="confirm-modal-title" className="text-lg font-semibold text-gray-900">
              Confirm options order
            </h2>
            <p id="confirm-modal-description" className="mt-1 text-sm text-gray-500">
              Please review your order details before submitting.
            </p>
          </div>

          <div className="space-y-4 px-5 py-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500">Symbol</p>
                <p className="font-medium text-gray-900">{contract.underlying_ticker}</p>
              </div>
              <div>
                <p className="text-gray-500">Type</p>
                <p className="font-medium text-gray-900">{contractType}</p>
              </div>
              <div>
                <p className="text-gray-500">Strike</p>
                <p className="font-medium text-gray-900">{formatCurrency(contract.strike_price)}</p>
              </div>
              <div>
                <p className="text-gray-500">Expiration</p>
                <p className="font-medium text-gray-900">{contract.expiration_date}</p>
              </div>
              <div>
                <p className="text-gray-500">Order</p>
                <p className="font-medium text-gray-900 capitalize">{mode}</p>
              </div>
              <div>
                <p className="text-gray-500">Contracts</p>
                <p className="font-medium text-gray-900">{quantity}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500">Estimated price per contract</p>
                <p className="font-medium text-gray-900">{formatCurrency(price * multiplier)}</p>
              </div>
            </div>

            <div className="rounded-lg bg-gray-50 p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {quantity} x {formatCurrency(price)} x {multiplier}
                </span>
                <span className="font-semibold text-gray-900">{formatCurrency(total)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm font-semibold">
                <span>{mode === 'buy' ? 'Total estimated cost' : 'Total estimated proceeds'}</span>
                <span className={mode === 'buy' ? 'text-green-600' : 'text-orange-600'}>
                  {formatCurrency(total)}
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-500">
              Market prices are delayed by approximately 15 minutes and execution price may vary.
            </p>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t px-5 py-4 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isSubmitting || quantity < 1 || price <= 0}
              className={
                mode === 'buy'
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-orange-500 hover:bg-orange-600'
              }
            >
              {isSubmitting ? 'Submitting...' : `Confirm ${mode === 'buy' ? 'Buy' : 'Sell'}`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
