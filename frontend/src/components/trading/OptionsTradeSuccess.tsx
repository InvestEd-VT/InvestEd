import { CheckCircle2Icon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import type { TradeResponse } from '@/types';
import { formatCurrency } from '@/utils/format';

interface OptionsTradeSuccessProps {
  trade: TradeResponse;
  onClose?: () => void;
}

export default function OptionsTradeSuccess({ trade, onClose }: OptionsTradeSuccessProps) {
  const navigate = useNavigate();
  const tx = trade.transaction;
  const multiplier = 100;
  const total = Number(tx.quantity) * Number(tx.price) * multiplier;

  const handleViewPortfolio = () => {
    onClose?.();
    navigate('/portfolio');
  };

  const handleViewOptionsChain = () => {
    onClose?.();
    navigate(`/stock/${tx.symbol}`);
  };

  return (
    <div className="flex flex-1 flex-col p-6 pt-4">
      <div className="rounded-xl border border-green-200 bg-green-50 p-4">
        <div className="flex items-center gap-3">
          <CheckCircle2Icon className="size-6 text-green-600" />
          <div>
            <p className="text-sm font-semibold text-green-700">Trade executed successfully</p>
            <p className="text-xs text-green-700/80">Your order has been recorded.</p>
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-4 rounded-lg bg-gray-50 p-4">
        <h3 className="text-sm font-semibold text-gray-900">Trade Summary</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-500">Contract</p>
            <p className="font-medium text-gray-900">{tx.contractSymbol ?? tx.symbol}</p>
          </div>
          <div>
            <p className="text-gray-500">Order type</p>
            <p className="font-medium text-gray-900 capitalize">{tx.type.toLowerCase()}</p>
          </div>
          <div>
            <p className="text-gray-500">Option type</p>
            <p className="font-medium text-gray-900">{tx.optionType ?? '-'}</p>
          </div>
          <div>
            <p className="text-gray-500">Strike</p>
            <p className="font-medium text-gray-900">
              {tx.strikePrice !== null ? formatCurrency(Number(tx.strikePrice)) : '-'}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Expiration</p>
            <p className="font-medium text-gray-900">{tx.expirationDate ?? '-'}</p>
          </div>
          <div>
            <p className="text-gray-500">Contracts</p>
            <p className="font-medium text-gray-900">{tx.quantity}</p>
          </div>
          <div>
            <p className="text-gray-500">Price per contract</p>
            <p className="font-medium text-gray-900">{formatCurrency(Number(tx.price) * multiplier)}</p>
          </div>
          <div>
            <p className="text-gray-500">Total {tx.type === 'BUY' ? 'cost' : 'proceeds'}</p>
            <p className="font-semibold text-gray-900">{formatCurrency(total)}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-gray-200 p-4">
        <p className="text-xs uppercase tracking-wide text-gray-500">Updated cash balance</p>
        <p className="mt-1 text-xl font-semibold text-gray-900">{formatCurrency(trade.cashBalance)}</p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Button variant="outline" onClick={handleViewOptionsChain}>
          View options chain
        </Button>
        <Button onClick={handleViewPortfolio}>View portfolio</Button>
      </div>
    </div>
  );
}