import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';
import { BellIcon } from 'lucide-react';
import { toast } from 'sonner';

interface PriceAlertFormProps {
  symbol: string;
  currentPrice: number;
}

export function PriceAlertForm({ symbol, currentPrice }: PriceAlertFormProps) {
  const [targetPrice, setTargetPrice] = useState('');
  const [condition, setCondition] = useState<'ABOVE' | 'BELOW'>('ABOVE');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(targetPrice);
    if (!price || price <= 0) return;

    try {
      setIsSubmitting(true);
      await api.post('/alerts', { symbol, targetPrice: price, condition });
      toast.success(`Alert set: ${symbol} ${condition.toLowerCase()} $${price.toFixed(2)}`);
      setTargetPrice('');
      setShowForm(false);
    } catch {
      toast.error('Failed to create alert');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 transition-colors"
      >
        <BellIcon className="size-3.5" />
        Set price alert
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-gray-200 p-3 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-gray-700">Price Alert for {symbol}</p>
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          Cancel
        </button>
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <Label className="text-[11px] text-gray-500">Notify when price goes</Label>
          <div className="flex gap-1 mt-1">
            <button
              type="button"
              onClick={() => setCondition('ABOVE')}
              className={`flex-1 py-1.5 text-xs rounded font-medium transition-colors ${
                condition === 'ABOVE'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              Above
            </button>
            <button
              type="button"
              onClick={() => setCondition('BELOW')}
              className={`flex-1 py-1.5 text-xs rounded font-medium transition-colors ${
                condition === 'BELOW'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              Below
            </button>
          </div>
        </div>
        <div className="flex-1">
          <Label className="text-[11px] text-gray-500">Target price</Label>
          <Input
            type="number"
            step="0.01"
            min="0.01"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            placeholder={currentPrice.toFixed(2)}
            className="mt-1 h-[34px] text-sm"
          />
        </div>
      </div>

      <Button type="submit" size="sm" disabled={isSubmitting || !targetPrice} className="w-full">
        <BellIcon className="size-3.5 mr-1.5" />
        {isSubmitting ? 'Setting...' : 'Set Alert'}
      </Button>
    </form>
  );
}
