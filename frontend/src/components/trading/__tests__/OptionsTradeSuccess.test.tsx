import { render, screen } from '@testing-library/react';
import { vi, describe, test, expect } from 'vitest';
import type { TradeResponse } from '@/types';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock formatCurrency to return a predictable string
vi.mock('@/utils/format', () => ({
  formatCurrency: (n: number) =>
    `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
}));

// Mock the Button component so we don't need the full UI library
vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string }) => (
    <button {...props}>{children}</button>
  ),
}));

import OptionsTradeSuccess from '../OptionsTradeSuccess';

function makeTrade(overrides: Partial<TradeResponse> = {}): TradeResponse {
  return {
    position: {
      id: 'pos1',
      symbol: 'AAPL',
      positionType: 'OPTION',
      optionType: 'CALL',
      strikePrice: 150,
      quantity: 2,
      averageCost: 3.5,
      marketValue: 700,
      currentPrice: 3.5,
      costBasis: 700,
      gainLoss: 0,
      gainLossPercent: 0,
      expirationDate: '2026-05-16',
      contractSymbol: 'AAPL260516C00150000',
      portfolioId: 'p1',
    } as TradeResponse['position'],
    transaction: {
      id: 'tx1',
      type: 'BUY',
      symbol: 'AAPL',
      quantity: 2,
      price: 3.5,
      positionType: 'OPTION',
      optionType: 'CALL',
      strikePrice: 150,
      expirationDate: '2026-05-16',
      contractSymbol: 'AAPL260516C00150000',
      portfolioId: 'p1',
      executedAt: '2026-04-21T12:00:00Z',
      createdAt: '2026-04-21T12:00:00Z',
    },
    cashBalance: 9300,
    ...overrides,
  };
}

describe('OptionsTradeSuccess', () => {
  test('shows "Trade executed successfully" for a regular trade', () => {
    render(<OptionsTradeSuccess trade={makeTrade()} />);

    expect(screen.getByText('Trade executed successfully')).toBeInTheDocument();
    expect(screen.getByText('Your order has been recorded.')).toBeInTheDocument();
    // No demo banner
    expect(screen.queryByText('Practice Trade')).not.toBeInTheDocument();
  });

  test('shows "Practice Trade" banner when isDemo is true', () => {
    render(<OptionsTradeSuccess trade={makeTrade({ isDemo: true })} />);

    expect(screen.getByText('Practice Trade')).toBeInTheDocument();
    expect(screen.getByText(/demo trade/i)).toBeInTheDocument();
    expect(screen.getByText('Practice trade completed')).toBeInTheDocument();
  });

  test('displays the trade summary details', () => {
    render(<OptionsTradeSuccess trade={makeTrade()} />);

    expect(screen.getByText('Trade Summary')).toBeInTheDocument();
    expect(screen.getByText('AAPL260516C00150000')).toBeInTheDocument();
    expect(screen.getByText('CALL')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // quantity
  });

  test('displays updated cash balance', () => {
    render(<OptionsTradeSuccess trade={makeTrade({ cashBalance: 9300 })} />);

    expect(screen.getByText('Updated cash balance')).toBeInTheDocument();
    expect(screen.getByText('$9,300.00')).toBeInTheDocument();
  });
});
