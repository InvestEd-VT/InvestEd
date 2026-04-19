import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { calculatePayoff, breakeven, maxProfitLoss } from '@/utils/options';
import { formatCurrency } from '@/utils/format';

interface PayoffChartProps {
  type: 'call' | 'put';
  strikePrice: number;
  premium: number;
  quantity: number;
  mode: 'buy' | 'sell';
  stockPrice: number;
}

export function PayoffChart({
  type,
  strikePrice,
  premium,
  quantity,
  mode,
  stockPrice,
}: PayoffChartProps) {
  const data = useMemo(
    () => calculatePayoff(type, strikePrice, premium, quantity, mode),
    [type, strikePrice, premium, quantity, mode]
  );

  const stats = useMemo(
    () => maxProfitLoss(type, strikePrice, premium, quantity),
    [type, strikePrice, premium, quantity]
  );

  const be = useMemo(() => breakeven(type, strikePrice, premium), [type, strikePrice, premium]);

  const isCall = type === 'call';
  const isBuy = mode === 'buy';

  return (
    <div className="space-y-3">
      {/* Chart */}
      <div className="h-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.15} />
                <stop offset="50%" stopColor="#10b981" stopOpacity={0} />
                <stop offset="50%" stopColor="#f97316" stopOpacity={0} />
                <stop offset="100%" stopColor="#f97316" stopOpacity={0.15} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="price"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9ca3af', fontSize: 10 }}
              tickFormatter={(v) => `$${v}`}
              interval="preserveStartEnd"
              minTickGap={50}
            />
            <YAxis hide domain={['auto', 'auto']} />
            <ReferenceLine y={0} stroke="#d1d5db" strokeDasharray="3 3" />
            <ReferenceLine
              x={stockPrice}
              stroke="#9ca3af"
              strokeDasharray="3 3"
              label={{
                value: 'Current',
                position: 'top',
                fill: '#9ca3af',
                fontSize: 10,
              }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const point = payload[0].payload as { price: number; profit: number };
                const isProfit = point.profit >= 0;
                return (
                  <div className="rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 shadow-lg">
                    <p className="text-xs text-gray-300">
                      {formatCurrency(point.price)} underlying
                    </p>
                    <p
                      className={`text-sm font-semibold ${isProfit ? 'text-green-400' : 'text-orange-400'}`}
                    >
                      {isProfit ? '+' : ''}
                      {formatCurrency(point.profit)}
                    </p>
                  </div>
                );
              }}
              cursor={{ stroke: '#d1d5db', strokeDasharray: '4 4' }}
            />
            <Area
              type="monotone"
              dataKey="profit"
              stroke={isCall ? '#10b981' : '#f97316'}
              strokeWidth={2}
              fill="url(#profitGradient)"
              dot={false}
              activeDot={{
                r: 4,
                fill: isCall ? '#10b981' : '#f97316',
                stroke: '#fff',
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="rounded-lg bg-gray-50 p-2.5">
          <p className="text-gray-400">Max Profit</p>
          <p className="font-semibold text-green-500 mt-0.5">
            {isBuy && type === 'call'
              ? 'Unlimited'
              : !isBuy && type === 'put'
                ? 'Unlimited'
                : `+${formatCurrency(isBuy ? stats.maxProfit : stats.maxLoss)}`}
          </p>
        </div>
        <div className="rounded-lg bg-gray-50 p-2.5">
          <p className="text-gray-400">Max Loss</p>
          <p className="font-semibold text-orange-500 mt-0.5">
            {isBuy
              ? `-${formatCurrency(stats.maxLoss)}`
              : type === 'call'
                ? 'Unlimited'
                : `-${formatCurrency(stats.maxProfit)}`}
          </p>
        </div>
        <div className="rounded-lg bg-gray-50 p-2.5">
          <p className="text-gray-400">Breakeven</p>
          <p className="font-semibold mt-0.5 text-gray-500">{formatCurrency(be)}</p>
        </div>
      </div>
    </div>
  );
}
