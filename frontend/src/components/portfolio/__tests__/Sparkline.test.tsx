import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, test, expect, beforeEach } from 'vitest';

// Mock recharts to avoid SVG rendering issues in jsdom
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  AreaChart: ({ children, data }: { children: React.ReactNode; data: unknown[] }) => (
    <svg data-testid="area-chart" data-len={data.length}>
      {children}
    </svg>
  ),
  Area: () => <rect data-testid="area" />,
}));

// Mock stockService before importing the component
const mockGetHistory = vi.fn();
vi.mock('@/services', () => ({
  stockService: { getHistory: (...args: unknown[]) => mockGetHistory(...args) },
}));

import { Sparkline } from '../Sparkline';

describe('Sparkline', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('renders an empty placeholder div when getHistory returns no data', async () => {
    mockGetHistory.mockResolvedValue([]);

    const { container } = render(<Sparkline symbol="AAPL" />);

    // Should call getHistory with symbol and '1w'
    expect(mockGetHistory).toHaveBeenCalledWith('AAPL', '1w');

    // Wait for the effect to settle — data remains null, so we get the placeholder
    await waitFor(() => {
      // No chart should be rendered
      expect(screen.queryByTestId('area-chart')).not.toBeInTheDocument();
    });

    // The placeholder div should exist with default dimensions
    const placeholder = container.firstChild as HTMLDivElement;
    expect(placeholder.tagName).toBe('DIV');
    expect(placeholder.style.width).toBe('70px');
    expect(placeholder.style.height).toBe('24px');
  });

  test('renders an empty placeholder when getHistory returns only one bar', async () => {
    mockGetHistory.mockResolvedValue([{ close: 100 }]);

    render(<Sparkline symbol="TSLA" />);

    await waitFor(() => {
      // One data point is not enough (< 2), so no chart
      expect(screen.queryByTestId('area-chart')).not.toBeInTheDocument();
    });
  });

  test('renders a chart when data has at least two bars', async () => {
    mockGetHistory.mockResolvedValue([{ close: 100 }, { close: 105 }, { close: 110 }]);

    render(<Sparkline symbol="GOOG" />);

    await waitFor(() => {
      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });

    // Chart receives the mapped data
    const chart = screen.getByTestId('area-chart');
    expect(chart.getAttribute('data-len')).toBe('3');
  });

  test('renders placeholder when getHistory rejects', async () => {
    mockGetHistory.mockRejectedValue(new Error('network error'));

    render(<Sparkline symbol="ERR" />);

    await waitFor(() => {
      expect(screen.queryByTestId('area-chart')).not.toBeInTheDocument();
    });
  });
});
