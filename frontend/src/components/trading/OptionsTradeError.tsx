import { AlertCircleIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OptionsTradeErrorProps {
  message: string;
  onRetry: () => void;
  onGoBack: () => void;
  isSubmitting?: boolean;
}

export default function OptionsTradeError({
  message,
  onRetry,
  onGoBack,
  isSubmitting = false,
}: OptionsTradeErrorProps) {
  return (
    <div className="flex flex-1 flex-col p-6 pt-4">
      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
        <div className="flex items-start gap-3">
          <AlertCircleIcon className="mt-0.5 size-6 text-red-600" />
          <div>
            <p className="text-sm font-semibold text-red-700">Trade failed</p>
            <p className="mt-1 text-sm text-red-700/90">
              {message || 'We could not execute your options trade. Please try again.'}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
        <p className="text-sm text-gray-700">
          You can retry this exact order or go back to update your order details.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Button variant="outline" onClick={onGoBack} disabled={isSubmitting}>
          Go back
        </Button>
        <Button onClick={onRetry} disabled={isSubmitting} className="bg-red-600 hover:bg-red-700">
          {isSubmitting ? 'Retrying...' : 'Retry trade'}
        </Button>
      </div>
    </div>
  );
}
