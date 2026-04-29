interface ThetaDecayBarProps {
  /** Daily theta decay (negative number from greeks) */
  theta: number;
  /** Days to expiration */
  dte: number;
  /** Number of contracts */
  quantity: number;
}

/**
 * Visual progress bar showing theta (time) decay for an option position.
 * Shows how much value is lost per day and total remaining decay exposure.
 */
export function ThetaDecayBar({ theta, dte, quantity }: ThetaDecayBarProps) {
  if (dte <= 0 || theta === 0) return null;

  const dailyDecay = Math.abs(theta) * quantity * 100;
  const totalRemaining = dailyDecay * dte;

  // Progress: more filled = closer to expiry (more urgent)
  // Max 45 DTE as reference for "full bar"
  const progress = Math.min(1, Math.max(0, 1 - dte / 45));

  // Color intensity based on DTE urgency
  const barColor =
    dte <= 3
      ? 'bg-red-500'
      : dte <= 7
        ? 'bg-amber-500'
        : dte <= 14
          ? 'bg-yellow-400'
          : 'bg-blue-400';
  const trackColor = 'bg-gray-100';

  return (
    <div className="flex items-center gap-2 mt-1">
      <span className="text-[10px] text-gray-400 whitespace-nowrap w-16">
        -${dailyDecay.toFixed(0)}/day
      </span>
      <div className={`flex-1 h-1.5 rounded-full ${trackColor} overflow-hidden max-w-[80px]`}>
        <div
          role="progressbar"
          aria-valuenow={Math.round(progress * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Theta decay: ${dte} days to expiration`}
          className={`h-full rounded-full ${barColor} transition-all`}
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <span className="text-[10px] text-gray-400 whitespace-nowrap">
        ${totalRemaining.toFixed(0)} left
      </span>
    </div>
  );
}
